const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer(async(req,res)=>{
  try{const name=new URL(req.url,'http://localhost').pathname;const file=path.join(root,name==='/'?'index.html':name);if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end();}
});
(async()=>{
  await fs.mkdir(path.join(root,'test-results'),{recursive:true});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,channel:process.env.DRAFTROOM_BROWSER||undefined});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/messages.html`);await page.locator('#message-tools-toggle').click();
    await page.waitForSelector('.chat-bubble');
    assert.equal(await page.locator('.message-card').count(),5);
    await page.waitForSelector('#emoji-tray .ios-emoji');
    await page.locator('#quick-text').fill('Hello 😭 🥹 ❤️ 👍🏽 👩🏽‍💻 🇵🇭');await page.locator('#quick-send').click();
    assert.equal(await page.locator('.chat-bubble .ios-emoji').count(),6);
    await page.locator('#quick-text').fill('😭');await page.locator('#quick-send').click();
    assert.equal(await page.locator('.emoji-only.emoji-count-1').count(),1);
    await page.locator('#emoji-tray button').first().click();assert.equal(await page.locator('#quick-text').inputValue(),'😭');await page.locator('#quick-text').fill('');
    await page.screenshot({path:path.join(root,'test-results/classic-desktop.png'),fullPage:true});
    await page.locator('#date-text').fill('Tuesday 10:30 AM');
    assert.equal(await page.locator('.chat-event.timestamp').textContent(),'Tuesday 10:30 AM');
    await page.locator('#quick-text').fill('A message worth saving');await page.locator('#quick-send').click();
    await page.waitForTimeout(450);await page.reload();
    await page.locator('.chat-bubble').filter({hasText:'A message worth saving'}).waitFor();
    await page.locator('[data-kind="group"]').click();await page.locator('#add-member').click();
    assert.equal(await page.locator('.member-row').count(),3);
    await page.locator('[data-member-name]').first().fill('Alex');
    const photo=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6ioAAAAASUVORK5CYII=','base64');
    await page.locator('[data-member-photo]').first().setInputFiles({name:'avatar.png',mimeType:'image/png',buffer:photo});
    await page.waitForSelector('.stack-avatar img');
    await page.locator('[data-add="system"]').click();await page.locator('[data-event-kind]').last().selectOption('joined');
    await page.locator('[data-add="typing"]').click();assert.equal(await page.locator('.typing-bubble i').count(),3);
    const chooser=page.waitForEvent('filechooser');await page.locator('[data-add="image"]').click();await(await chooser).setFiles({name:'photo.png',mimeType:'image/png',buffer:photo});
    await page.waitForSelector('.chat-bubble.media img');
    // Generate a real short video using the browser's supported recording codec.
    const video=await page.evaluate(async()=>{
      const c=document.createElement('canvas');c.width=160;c.height=100;const ctx=c.getContext('2d');
      const stream=c.captureStream(10);const rec=new MediaRecorder(stream);const chunks=[];
      const done=new Promise(r=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=async()=>r(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));});
      rec.start();for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#719ec6':'#c4d5e8';ctx.fillRect(0,0,160,100);await new Promise(r=>setTimeout(r,100));}rec.stop();stream.getTracks().forEach(t=>t.stop());return done;
    });
    const videoChooser=page.waitForEvent('filechooser');await page.locator('[data-add="video"]').click();await(await videoChooser).setFiles({name:'clip.webm',mimeType:'video/webm',buffer:Buffer.from(video)});
    await page.waitForSelector('[data-play-video]');await page.locator('[data-play-video]').click();await page.waitForSelector('.media-frame video');
    await page.waitForTimeout(450);await page.reload();await page.waitForSelector('.chat-bubble.media');await page.waitForFunction(()=>document.querySelectorAll('.chat-bubble.media img').length===2);
    assert.equal(await page.locator('.chat-bubble.media img').count(),2);
    assert.equal(await page.locator('.media-share').count(),2);
    const mediaDownload=page.waitForEvent('download');await page.locator('.media-share').first().click();assert((await mediaDownload).suggestedFilename().startsWith('draftroom-photo.'));
    for(const type of ['text','image','video']){
      const card=page.locator(`.message-card.type-${type}`).first();await card.locator('[data-sender]').selectOption('me');await card.locator('[data-receipt]').selectOption('failed');
    }
    assert.equal(await page.locator('.receipt-failed').count(),3);assert.equal(await page.locator('.send-failure').count(),3);
    assert.equal(await page.locator('.receipt-failed').first().evaluate(el=>getComputedStyle(el).color),'rgb(255, 59, 48)');
    await page.locator('#quick-text').fill('A quiet delivery');await page.locator('#quick-send').click();
    await page.locator('#receipt-style').selectOption('failed');assert((await page.locator('.receipt-failed').count())>=4);
    await page.locator('#receipt-style').selectOption('delivered');await page.locator('#chat-status').selectOption('dnd');
    assert((await page.locator('.focus-notice').textContent()).includes('has notifications silenced'));
    assert.equal(await page.locator('.receipt').last().textContent(),'Delivered Quietly');
    await page.locator('#focus-notify-anyway').click();assert.equal(await page.locator('.receipt').last().textContent(),'Delivered');await page.locator('#focus-notify-anyway').click();
    // Exercise all appearance combinations and both real PNG download paths.
    for(const version of ['18','27'])for(const theme of ['light','dark']){
      await page.locator(`[data-version="${version}"]`).click();await page.locator(`[data-theme="${theme}"]`).click();
      await page.screenshot({path:path.join(root,`test-results/ios${version}-${theme}.png`),fullPage:true});
      for(const mode of ['phone','full']){
        const download=page.waitForEvent('download');await page.locator(mode==='phone'?'#download-phone':'#export-full').click();
        const file=await download;const target=path.join(root,`test-results/ios${version}-${theme}-${mode}.png`);await file.saveAs(target);
        const bytes=await fs.readFile(target);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert(bytes.length>10000);
        if(mode==='phone'){assert.equal(bytes.readUInt32BE(16),710);assert.equal(bytes.readUInt32BE(20),1420);}
        else assert(bytes.readUInt32BE(20)>1380);
      }
    }
    await page.locator('[data-color="green"]').click();
    assert.equal(await page.locator('.phone-screen').evaluate(el=>getComputedStyle(el).getPropertyValue('--outgoing').trim()),'#34c759');
    await page.locator('[data-kind="single"]').click();
    await page.locator('#contact-upload').setInputFiles({name:'avatar.png',mimeType:'image/png',buffer:photo});await page.waitForSelector('#phone-avatar img');
    const avatar=await page.locator('#phone-avatar').boundingBox(),name=await page.locator('#phone-name').boundingBox();
    assert(name.y>=avatar.y+avatar.height-2,'Liquid Glass name sits below the contact photo');
    await page.locator('#export-phone').click();await page.waitForFunction(()=>!document.getElementById('save-image-png').disabled);
    assert.equal(await page.locator('#image-layout').inputValue(),'conversation');
    await page.screenshot({path:path.join(root,'test-results/save-picture-dialog.png'),fullPage:true});
    for(const [button,extension] of [['#save-image-png','png'],['#save-image-jpg','jpg']]){
      const pending=page.waitForEvent('download');await page.locator(button).click();const download=await pending;const target=path.join(root,`test-results/conversation.${extension}`);await download.saveAs(target);const bytes=await fs.readFile(target);
      if(extension==='png'){assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),682);}
      else{assert.equal(bytes.readUInt16BE(0),0xffd8);assert(bytes.length>10000);}
    }
    await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy-image').click();
    await page.waitForFunction(()=>document.getElementById('image-action-status').textContent.startsWith('Image copied.'));
    assert(await page.evaluate(async()=>{const items=await navigator.clipboard.read();return items.some(item=>item.types.includes('image/png'));}));
    await page.locator('#image-layout').selectOption('phone');await page.waitForFunction(()=>!document.getElementById('save-image-png').disabled);
    assert.equal(await page.locator('#image-preview').evaluate(img=>img.naturalWidth),710);
    await page.keyboard.press('Escape');assert.equal(await page.locator('#image-dialog').evaluate(el=>el.open),false);
    // A denied clipboard write gives a useful fallback without losing the picture.
    await page.evaluate(()=>{navigator.clipboard.write=()=>Promise.reject(new DOMException('Denied','NotAllowedError'));});
    await page.locator('#export-phone').click();await page.waitForFunction(()=>!document.getElementById('save-image-png').disabled);await page.locator('#copy-image').click();
    await page.waitForFunction(()=>document.getElementById('image-action-status').textContent.includes('Clipboard access was blocked'));
    await page.locator('#close-image-dialog').click();
    await page.locator('[data-version="18"]').click();await page.locator('[data-theme="light"]').click();await page.locator('[data-color="blue"]').click();
    await page.locator('#export-phone').click();await page.waitForFunction(()=>!document.getElementById('save-image-png').disabled);
    const classicDownload=page.waitForEvent('download');await page.locator('#save-image-png').click();await(await classicDownload).saveAs(path.join(root,'test-results/classic-conversation.png'));await page.locator('#close-image-dialog').click();
    await page.setViewportSize({width:375,height:900});await page.screenshot({path:path.join(root,'test-results/mobile.png'),fullPage:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('#export-phone').click();await page.waitForFunction(()=>!document.getElementById('save-image-png').disabled);await page.screenshot({path:path.join(root,'test-results/mobile-save-picture.png'),fullPage:true});
    assert(await page.locator('#image-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));await page.locator('#close-image-dialog').click();
    const projectDownload=page.waitForEvent('download');await page.locator('#export-project').click();const project=await projectDownload;const projectPath=path.join(root,'test-results/project.json');await project.saveAs(projectPath);
    const saved=JSON.parse(await fs.readFile(projectPath,'utf8'));assert.equal(Object.keys(saved.assets).length,2);
    page.on('dialog',dialog=>dialog.accept());await page.locator('#reset-project').click();await page.locator('#project-upload').setInputFiles(projectPath);await page.waitForSelector('#phone-avatar img');await page.waitForSelector('.chat-bubble.media img');
    assert.deepEqual(errors,[]);console.log('Passed: messages, date, groups, photos, events, typing, media persistence/playback, 8 legacy PNG exports, Apple emoji sequences, stacked glass identity, clean PNG/JPG, real clipboard image and denied-permission fallback, project round trip, mobile overflow.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
