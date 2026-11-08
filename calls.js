(() => {
  'use strict';
  const $=id=>document.getElementById(id),KEY='draftroom-calls-v1';
  const defaults=()=>({version:'27',stage:'outgoing',service:'phone',person:'contact',name:'Alex',number:'+1 (740) 555-0190',label:'mobile',photo:'',duration:'00:46',time:'9:41',battery:100,background:'ocean',speaker:false,mute:false,holdNotice:false,incomingLayout:'slide'});
  let state=defaults();try{state={...state,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{}
  const allowed={version:['18','27'],stage:['outgoing','incoming','connected','ended'],service:['phone','facetime'],person:['contact','number'],background:['ocean','poster','dusk','graphite'],incomingLayout:['slide','buttons']};
  for(const [key,values] of Object.entries(allowed))if(!values.includes(state[key]))state[key]=defaults()[key];
  for(const key of ['name','number','label','duration','time'])state[key]=String(state[key]??defaults()[key]).slice(0,key==='name'?70:40);
  if(typeof state.photo!=='string'||!state.photo.startsWith('data:image/'))state.photo='';
  state.battery=Math.max(1,Math.min(100,Number(state.battery)||100));
  let saveTimer,toastTimer,keypad=false,digits='',sceneNote='';
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const emoji=s=>window.DraftroomEmoji?.render(s)??escape(s);
  const paths={
    speaker:'<path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" stroke="none"/><path d="M16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
    mute:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 10v2a7 7 0 0 0 12 5M19 10v2M12 19v3M8 22h8M3 2l18 20"/>',
    video:'<rect x="2" y="6" width="13" height="12" rx="3"/><path d="m16 10 6-4v12l-6-4z"/>',
    more:'<circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="2" fill="currentColor" stroke="none"/>',
    add:'<circle cx="13" cy="8" r="4"/><path d="M6 21v-2a7 7 0 0 1 14-1M3 12v6M0 15h6"/>',
    keypad:Array.from({length:9},(_,i)=>`<circle cx="${6+i%3*6}" cy="${6+Math.floor(i/3)*6}" r="1.8" fill="currentColor" stroke="none"/>`).join(''),
    end:'<path d="M2 12c5-5 15-5 20 0v5c0 1-1 1-2 1l-4-2v-4a15 15 0 0 0-8 0v4l-4 2c-1 0-2 0-2-1z" fill="currentColor" stroke="none"/>',
    answer:'<path d="M4 2 9 6 7 10c2 3 4 5 7 7l4-2 4 5c-2 6-8 4-14-2S-2 5 4 2Z" fill="currentColor" stroke="none"/>',
    reminder:'<circle cx="12" cy="13" r="8"/><path d="M12 8v5H8M3 3l3-1M18 2l3 1M6 20l-2 2M18 20l2 2"/>',
    message:'<path d="M22 11c0 5-5 9-10 9H8l-6 3 2-6c-2-2-3-3-3-6C1 6 6 2 12 2s10 4 10 9Z" fill="currentColor" stroke="none"/>',
    close:'<path d="m5 5 14 14M19 5 5 19"/>'
  };
  const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.more}</svg>`;
  function notify(text){$('call-toast').textContent=text;$('call-toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('call-toast').classList.remove('visible'),3000);}
  function save(){clearTimeout(saveTimer);$('call-save-status').textContent='Saving…';saveTimer=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(state));$('call-save-status').textContent='Saved in this browser';}catch{$('call-save-status').textContent='Storage full';notify('Browser storage is full. Try a smaller contact photo.');}},250);}
  const control=(action,label,iconName,{pressed=null,kind=''}={})=>`<button class="call-control ${kind}" data-call-action="${action}" ${pressed===null?'':`aria-pressed="${Boolean(pressed)}"`} aria-label="${escape(label)}"><span class="call-circle">${icon(iconName)}</span><span>${escape(label)}</span></button>`;
  function sync(){
    for(const [id,key] of [['call-stage','stage'],['call-service','service'],['call-duration','duration'],['call-name','name'],['call-label','label'],['call-number','number'],['call-time','time'],['call-battery','battery'],['call-background','background'],['call-incoming-layout','incomingLayout']])if($(id).value!==String(state[key]))$(id).value=state[key];
    $('call-hold-notice').checked=Boolean(state.holdNotice);
    document.querySelectorAll('[data-call-version]').forEach(b=>{const on=b.dataset.callVersion===state.version;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
    document.querySelectorAll('[data-call-person]').forEach(b=>{const on=b.dataset.callPerson===state.person;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
    document.querySelectorAll('[data-call-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.callScene===state.stage)));
    $('call-contact-fields').hidden=state.person!=='contact';$('call-number-fields').hidden=state.person!=='number';$('incoming-options').hidden=state.stage!=='incoming';
    for(const key of ['speaker','mute']){$('setting-'+key).textContent=`${key==='speaker'?'Speaker':'Mute'} ${state[key]?'on':'off'}`;$('setting-'+key).setAttribute('aria-pressed',String(Boolean(state[key])));}
    $('call-photo-preview').innerHTML=state.photo?`<img src="${escape(state.photo)}" alt="Contact photo"/>`:emoji((state.name||'?').slice(0,1).toUpperCase());
    $('call-remove-photo').hidden=!state.photo;
  }
  function render(){
    sync();const screen=$('call-screen');screen.className=`call-screen is-${state.stage} is-${state.person} bg-${state.background} ${state.version==='27'?'is-glass':'is-classic'}`;
    $('call-status-time').textContent=state.time||'9:41';$('call-battery-text').textContent=state.battery;$('call-battery-icon').style.setProperty('--battery',state.battery+'%');$('call-battery-icon').classList.toggle('low',state.battery<=20);
    $('call-avatar').innerHTML=state.photo?`<img src="${escape(state.photo)}" alt=""/>`:emoji((state.name||'?').slice(0,1).toUpperCase());
    $('call-preview-name').innerHTML=emoji(state.person==='number'?(state.number||'Unknown caller'):(state.name||'Contact'));
    $('call-contact-label').textContent=state.service==='facetime'?'FaceTime Audio':state.person==='number'?'Incoming call':state.label||'mobile';
    $('call-status-line').textContent=state.stage==='connected'?(state.duration||'00:00'):state.stage==='ended'?'Call Ended':state.service==='facetime'?'FaceTime Audio…':`calling ${state.person==='contact'?(state.label||'mobile'):'mobile'}…`;
    $('call-scene-label').textContent={outgoing:'Outgoing · calling',incoming:'Incoming · ringing',connected:'Connected · in call',ended:'Call ended'}[state.stage];
    $('call-wave').innerHTML=state.stage==='incoming'||state.stage==='ended'?'':'<span class="call-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
    const area=$('call-bottom-area');
    if(state.stage==='incoming'){
      keypad=false;
      area.innerHTML=`<p class="call-reminder-note" aria-live="polite">${escape(sceneNote)}</p><div class="incoming-small-actions"><button data-call-action="reminder">${icon('reminder')}<span>Remind Me</span></button><button data-call-action="message">${icon('message')}<span>Message</span></button></div>${state.incomingLayout==='slide'?`<button class="answer-slider" data-call-action="answer" aria-label="Slide to answer call"><span class="answer-knob">${icon('answer')}</span><span>slide to answer</span></button>`:`<div class="incoming-buttons">${control('end','Decline','end',{kind:'end-control'})}${control('answer','Accept','answer',{kind:'answer-control'})}</div>`}`;
      bindSlider();
    }else if(state.stage==='ended'){
      keypad=false;area.innerHTML=`<p class="call-scene-help">The call has ended.</p><div class="call-ended-actions">${control('message','Message','message')}${control('callback','Call Back','answer',{kind:'answer-control'})}</div>`;
    }else if(keypad){
      const letters=['','','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'];
      area.innerHTML=`<div class="call-keypad-display" aria-live="polite">${escape(digits)}</div><div class="call-keypad-grid">${['1','2','3','4','5','6','7','8','9','*','0','#'].map(n=>`<button data-call-key="${n}" aria-label="Keypad ${n}">${n}<small>${letters[Number(n)]||'&nbsp;'}</small></button>`).join('')}</div><div class="call-keypad-footer"><button data-call-action="keypad">Hide</button><button class="keypad-end" data-call-action="end" aria-label="End call">${icon('end')}</button><button data-call-action="delete-digit">Delete</button></div>`;
    }else{
      const hold=state.stage==='connected'&&state.holdNotice?'<div class="call-hold-card"><p>Hold This Call?<small>You’ll be notified to pick up.</small></p><button data-call-action="hold">Hold</button><button data-call-action="dismiss-hold" aria-label="Dismiss hold card">×</button></div>':'';
      area.innerHTML=`${hold}<p class="call-reminder-note" aria-live="polite">${escape(sceneNote)}</p><div class="call-controls">${control('speaker','Speaker','speaker',{pressed:state.speaker})}${control('facetime','FaceTime','video',{pressed:state.service==='facetime'})}${control('mute','Mute','mute',{pressed:state.mute})}${control('more',state.version==='27'?'More':'Add',state.version==='27'?'more':'add')}${control('end','End','end',{kind:'end-control'})}${control('keypad','Keypad','keypad')}</div>`;
    }
  }
  function changeStage(stage){state.stage=stage;keypad=false;digits='';sceneNote='';render();save();}
  for(const [id,key] of [['call-stage','stage'],['call-service','service'],['call-duration','duration'],['call-name','name'],['call-label','label'],['call-number','number'],['call-time','time'],['call-battery','battery'],['call-background','background'],['call-incoming-layout','incomingLayout']]){
    $(id).addEventListener('input',e=>{if(key==='stage'){changeStage(e.target.value);return;}state[key]=key==='battery'?Math.max(1,Math.min(100,Number(e.target.value)||1)):e.target.value;render();save();});
  }
  document.querySelectorAll('[data-call-version]').forEach(b=>b.addEventListener('click',()=>{state.version=b.dataset.callVersion;render();save();}));
  document.querySelectorAll('[data-call-person]').forEach(b=>b.addEventListener('click',()=>{state.person=b.dataset.callPerson;render();save();}));
  document.querySelectorAll('[data-call-scene]').forEach(b=>b.addEventListener('click',()=>changeStage(b.dataset.callScene)));
  for(const key of ['speaker','mute'])$('setting-'+key).addEventListener('click',()=>{state[key]=!state[key];render();save();});
  $('call-hold-notice').addEventListener('change',e=>{state.holdNotice=e.target.checked;render();save();});
  $('call-bottom-area').addEventListener('click',e=>{
    const key=e.target.closest('[data-call-key]');if(key){if(digits.length<24)digits+=key.dataset.callKey;render();return;}
    const b=e.target.closest('[data-call-action]');if(!b)return;const action=b.dataset.callAction;
    if(action==='answer'){changeStage('connected');return;}if(action==='end'){changeStage('ended');return;}if(action==='callback'){changeStage('outgoing');return;}
    if(action==='speaker'||action==='mute')state[action]=!state[action];
    else if(action==='facetime')state.service=state.service==='phone'?'facetime':'phone';
    else if(action==='keypad')keypad=!keypad;
    else if(action==='delete-digit')digits=digits.slice(0,-1);
    else if(action==='dismiss-hold')state.holdNotice=false;
    else if(action==='hold'){sceneNote='On hold';state.holdNotice=false;}
    else if(action==='reminder')sceneNote='Reminder set · when this call ends';
    else if(action==='message')sceneNote='Message reply selected';
    else if(action==='more')sceneNote=sceneNote?'':'Add call · visual scene control';
    render();save();areaFocus(action);
  });
  function areaFocus(action){$('call-bottom-area').querySelector(`[data-call-action="${action}"]`)?.focus({preventScroll:true});}
  function bindSlider(){
    const slider=$('call-bottom-area').querySelector('.answer-slider');if(!slider)return;
    let start=null,moved=false,suppressClick=false;slider.addEventListener('pointerdown',e=>{start=e.clientX;moved=false;slider.setPointerCapture(e.pointerId);});
    slider.addEventListener('pointermove',e=>{if(start===null)return;const x=Math.max(0,Math.min(slider.clientWidth-68,e.clientX-start));moved=moved||x>8;slider.querySelector('.answer-knob').style.transform=`translateX(${x}px)`;});
    slider.addEventListener('pointerup',e=>{if(start===null)return;const distance=e.clientX-start;start=null;if(moved&&distance>slider.clientWidth*.45){changeStage('connected');}else if(moved){suppressClick=true;slider.querySelector('.answer-knob').style.transform='none';}});
    slider.addEventListener('pointercancel',()=>{start=null;slider.querySelector('.answer-knob').style.transform='none';});
    slider.addEventListener('click',e=>{if(suppressClick){e.stopPropagation();suppressClick=false;}});
  }
  $('call-photo').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){notify('Choose an image for the contact photo.');return;}
    const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();const scale=Math.min(1,320/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);state.photo=canvas.toDataURL('image/jpeg',.9);render();save();}catch{notify('Could not load that contact photo.');}finally{URL.revokeObjectURL(url);e.target.value='';}
  });
  $('call-remove-photo').addEventListener('click',()=>{state.photo='';render();save();});
  $('call-random-number').addEventListener('click',()=>{state.number=`+1 (740) 555-01${String(Math.floor(Math.random()*100)).padStart(2,'0')}`;render();save();});
  $('call-reset').addEventListener('click',()=>{if(!confirm('Start a new call scene? Your Messages draft is kept.'))return;state=defaults();keypad=false;digits='';sceneNote='';render();save();});

  // Export exactly the chosen visual state without using a microphone, camera or real call service.
  const dialog=$('call-image-dialog'),imageButtons=[$('call-image-png'),$('call-image-jpg'),$('call-image-copy')];let imageCanvas=null,imageUrl=null,generation=0;
  async function capture(mode){
    await window.DraftroomEmoji?.ready;
    const original=mode==='phone'?$('call-device'):$('call-screen'),staging=document.createElement('div');staging.className='call-capture';staging.style.cssText='position:fixed;left:-20000px;top:0;pointer-events:none;';
    const clone=original.cloneNode(true);clone.style.transform='none';clone.style.boxShadow='none';if(mode==='screen')clone.style.borderRadius='0';staging.append(clone);document.body.append(staging);
    try{await Promise.all([...clone.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));await document.fonts.ready;return await html2canvas(clone,{backgroundColor:null,scale:2,useCORS:true,logging:false,scrollX:0,scrollY:0});}finally{staging.remove();}
  }
  const toBlob=(canvas,type='image/png')=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Image export failed')),type,.95));
  async function prepareImage(){
    const current=++generation;imageCanvas=null;imageButtons.forEach(b=>b.disabled=true);$('call-image-preview').hidden=true;$('call-image-loading').hidden=false;$('call-image-loading').textContent='Preparing image…';$('call-image-status').textContent='';
    try{const canvas=await capture($('call-image-layout').value),blob=await toBlob(canvas);if(current!==generation||!dialog.open)return;imageCanvas=canvas;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(blob);$('call-image-preview').src=imageUrl;$('call-image-preview').hidden=false;$('call-image-loading').hidden=true;imageButtons.forEach(b=>b.disabled=false);if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined'){$('call-image-copy').disabled=true;$('call-image-status').textContent='Save the picture, or touch and hold the preview on this browser.';}}
    catch{if(current===generation)$('call-image-loading').textContent='Could not create the image. Reload the page and try again.';}
  }
  $('call-save-image').addEventListener('click',()=>{$('call-image-layout').value='screen';dialog.showModal();prepareImage();});$('call-image-close').addEventListener('click',()=>dialog.close());$('call-image-layout').addEventListener('change',prepareImage);
  dialog.addEventListener('close',()=>{generation++;imageCanvas=null;$('call-image-preview').removeAttribute('src');if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=null;});
  async function download(type){if(!imageCanvas)return;try{let canvas=imageCanvas;if(type==='image/jpeg'){const opaque=document.createElement('canvas');opaque.width=canvas.width;opaque.height=canvas.height;const ctx=opaque.getContext('2d');ctx.fillStyle='#0a0d12';ctx.fillRect(0,0,opaque.width,opaque.height);ctx.drawImage(canvas,0,0);canvas=opaque;}const blob=await toBlob(canvas,type),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`draftroom-call-${state.stage}.${type==='image/jpeg'?'jpg':'png'}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);$('call-image-status').textContent='Your call picture is saved.';}catch{$('call-image-status').textContent='Could not save. Try right-clicking or holding the picture.';}}
  $('call-image-png').addEventListener('click',()=>download('image/png'));$('call-image-jpg').addEventListener('click',()=>download('image/jpeg'));
  $('call-image-copy').addEventListener('click',()=>{if(!imageCanvas)return;try{navigator.clipboard.write([new ClipboardItem({'image/png':toBlob(imageCanvas)})]).then(()=>$('call-image-status').textContent='Image copied. Paste it into your story or chat.').catch(()=>$('call-image-status').textContent='Clipboard access was blocked. Save PNG or right-click the picture.');}catch{$('call-image-status').textContent='Copy is unavailable here. Save PNG instead.';}});
  render();window.DraftroomEmoji?.ready.then(render);
})();
