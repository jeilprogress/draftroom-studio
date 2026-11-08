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
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.waitForSelector('.chat-bubble');
    assert.equal(await page.locator('.message-card').count(),5);
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
    await page.waitForTimeout(450);await page.reload();await page.waitForSelector('.chat-bubble.media img');
    assert.equal(await page.locator('.chat-bubble.media img').count(),2);
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
    await page.setViewportSize({width:375,height:900});await page.screenshot({path:path.join(root,'test-results/mobile.png'),fullPage:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const projectDownload=page.waitForEvent('download');await page.locator('#export-project').click();const project=await projectDownload;const projectPath=path.join(root,'test-results/project.json');await project.saveAs(projectPath);
    const saved=JSON.parse(await fs.readFile(projectPath,'utf8'));assert.equal(Object.keys(saved.assets).length,2);
    page.on('dialog',dialog=>dialog.accept());await page.locator('#reset-project').click();await page.locator('#project-upload').setInputFiles(projectPath);await page.waitForSelector('#phone-avatar img');await page.waitForSelector('.chat-bubble.media img');
    assert.deepEqual(errors,[]);console.log('Passed: messages, date, groups, photos, events, typing, image/video storage and playback, reload persistence, 8 PNG downloads, project round trip, mobile overflow.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
