const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results');
const server=http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://localhost').pathname;const target=path.join(root,name==='/'?'index.html':name);if(!target.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp'})[path.extname(target)]||'application/octet-stream');res.end(await fs.readFile(target));}catch{res.writeHead(404);res.end();}});
(async()=>{
  await fs.mkdir(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1080},acceptDownloads:true}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));const base=`http://127.0.0.1:${server.address().port}`;
    await page.goto(base);await page.screenshot({path:path.join(out,'home-desktop.png'),fullPage:true});
    await page.locator('#open-messages').click();await page.waitForSelector('.chat-bubble');
    await page.locator('#quick-text').fill('Keep this Messages draft untouched');await page.locator('#quick-send').click();await page.waitForTimeout(450);
    const messagesDraft=await page.evaluate(()=>localStorage.getItem('draftroom-imessage-v1'));
    await page.getByRole('link',{name:'Home ↗',exact:true}).click();await page.locator('#open-calls').click();await page.waitForSelector('.call-control');
    await page.locator('#call-name').fill('Naomi ❤️');await page.locator('#call-duration').fill('12:34');
    await page.locator('#call-stage').selectOption('connected');
    await page.locator('[data-call-action="speaker"]').click();await page.locator('[data-call-action="mute"]').click();
    for(const action of ['speaker','mute'])assert.equal(await page.locator(`[data-call-action="${action}"]`).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#call-status-line').textContent(),'12:34');
    await page.locator('[data-call-action="keypad"]').click();for(const key of ['5','5','5','#'])await page.locator(`[data-call-key="${key}"]`).click();assert.equal(await page.locator('.call-keypad-display').textContent(),'555#');await page.locator('[data-call-action="delete-digit"]').click();assert.equal(await page.locator('.call-keypad-display').textContent(),'555');await page.locator('[data-call-action="keypad"]').click();
    await page.locator('#call-hold-notice').check();await page.locator('[data-call-action="dismiss-hold"]').click();assert.equal(await page.locator('.call-hold-card').count(),0);
    await page.locator('[data-call-action="facetime"]').click();assert.equal(await page.locator('#call-service').inputValue(),'facetime');await page.locator('#call-service').selectOption('phone');
    const photo=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6ioAAAAASUVORK5CYII=','base64');
    await page.locator('#call-photo').setInputFiles({name:'contact.png',mimeType:'image/png',buffer:photo});await page.waitForSelector('#call-photo-preview img');
    await page.waitForTimeout(400);await page.reload();await page.waitForSelector('.call-control');assert.equal(await page.locator('#call-duration').inputValue(),'12:34');assert.equal(await page.locator('[data-call-action="mute"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.evaluate(()=>localStorage.getItem('draftroom-imessage-v1')),messagesDraft);
    // Both appearances, both caller identities and every screen are rendered and exported.
    for(const version of ['18','27'])for(const stage of ['outgoing','incoming','connected','ended']){
      await page.locator(`[data-call-version="${version}"]`).click();await page.locator('#call-stage').selectOption(stage);
      await page.locator('#call-background').selectOption(version==='18'?'graphite':'ocean');
      await page.screenshot({path:path.join(out,`calls-${version}-${stage}.png`),fullPage:true});
      await page.locator('#call-save-image').click();await page.waitForFunction(()=>!document.getElementById('call-image-png').disabled);
      const pending=page.waitForEvent('download');await page.locator('#call-image-png').click();const download=await pending,target=path.join(out,`call-${version}-${stage}-export.png`);await download.saveAs(target);const bytes=await fs.readFile(target);assert.equal(bytes.readUInt32BE(16),682);assert.equal(bytes.readUInt32BE(20),1480);assert(bytes.length>15000);await page.locator('#call-image-close').click();
    }
    await page.locator('[data-call-person="number"]').click();await page.locator('#call-random-number').click();assert.match(await page.locator('#call-number').inputValue(),/^\+1 \(740\) 555-01\d{2}$/);await page.locator('#call-number').fill('+1 (740) 555-0123');assert.equal(await page.locator('#call-preview-name').textContent(),'+1 (740) 555-0123');
    await page.locator('#call-stage').selectOption('incoming');await page.locator('#call-incoming-layout').selectOption('buttons');await page.locator('[data-call-action="answer"]').click();assert.equal(await page.locator('#call-stage').inputValue(),'connected');
    await page.locator('[data-call-action="end"]').click();assert.equal(await page.locator('#call-stage').inputValue(),'ended');await page.locator('[data-call-action="callback"]').click();assert.equal(await page.locator('#call-stage').inputValue(),'outgoing');
    await page.locator('#call-stage').selectOption('incoming');await page.locator('#call-incoming-layout').selectOption('slide');
    const slider=await page.locator('.answer-slider').boundingBox();await page.mouse.move(slider.x+25,slider.y+30);await page.mouse.down();await page.mouse.move(slider.x+slider.width-10,slider.y+30,{steps:12});await page.mouse.up();assert.equal(await page.locator('#call-stage').inputValue(),'connected');
    await page.locator('#call-save-image').click();await page.waitForFunction(()=>!document.getElementById('call-image-png').disabled);await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#call-image-copy').click();await page.waitForFunction(()=>document.getElementById('call-image-status').textContent.startsWith('Image copied.'));
    const jpgPending=page.waitForEvent('download');await page.locator('#call-image-jpg').click();const jpg=await jpgPending;await jpg.saveAs(path.join(out,'call.jpg'));assert.equal((await fs.readFile(path.join(out,'call.jpg'))).readUInt16BE(0),0xffd8);
    await page.locator('#call-image-layout').selectOption('phone');await page.waitForFunction(()=>!document.getElementById('call-image-png').disabled);assert.equal(await page.locator('#call-image-preview').evaluate(img=>img.naturalWidth),710);await page.keyboard.press('Escape');
    await page.setViewportSize({width:375,height:900});await page.screenshot({path:path.join(out,'calls-mobile.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('#call-save-image').click();await page.waitForFunction(()=>!document.getElementById('call-image-png').disabled);assert(await page.locator('#call-image-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));await page.screenshot({path:path.join(out,'calls-mobile-save.png'),fullPage:true});await page.keyboard.press('Escape');
    await page.getByRole('link',{name:'Home ↗',exact:true}).click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#open-messages').click();await page.locator('.chat-bubble').filter({hasText:'Keep this Messages draft untouched'}).waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('draftroom-imessage-v1')),messagesDraft);
    assert.deepEqual(errors,[]);console.log('Passed: home navigation, unchanged Messages draft, caller identities/photo, duration, speaker/mute, keypad, call transitions/slide answer, persistence, 8 screen exports, JPG, clipboard, phone frame, mobile layout.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
