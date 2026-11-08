(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STORAGE_KEY = 'draftroom-imessage-v1';
  const EMOJIS = ['😭','🥹','🫶','❤️','🥰','😂','💗','🙄','😩','✨','💕'];
  const uid = () => `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const defaults = () => ({
    version:'18',theme:'light',color:'blue',kind:'single',chatName:'Mathine',contactPhoto:'',phoneTime:'9:41',
    dateText:'Today 9:41 AM',chatStatus:'normal',receipt:'delivered',wallpaper:'sky',wallpaperImage:'',glass:55,
    participants:[{id:'member_1',name:'Mathine',photo:''},{id:'member_2',name:'Ayi',photo:''}],
    messages:[
      {id:uid(),type:'timestamp',text:'Today 9:41 AM',from:'contact'},
      {id:uid(),type:'text',text:'Hey, are you awake?',from:'contact',receipt:'none'},
      {id:uid(),type:'text',text:'I am now. What happened?',from:'me',receipt:'none'},
      {id:uid(),type:'text',text:'Nothing. Just wanted to hear from you.',from:'contact',receipt:'none'},
      {id:uid(),type:'text',text:'That’s a terrible excuse to make me smile.',from:'me',receipt:'read'},
    ]
  });
  const validTypes = new Set(['text','image','video','timestamp','system','typing']);
  let state;
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'); state = saved && Array.isArray(saved.messages) ? {...defaults(),...saved} : defaults(); }
  catch { state = defaults(); }
  state.messages = state.messages.filter(m=>m&&validTypes.has(m.type)).slice(0,500);
  if (!state.participants?.length) state.participants=defaults().participants;
  let mediaDB,toastTimer,saveTimer,mediaTarget=null;
  const mediaUrls = new Map();
  const mediaBlobs = new Map();
  const notify = message => { $('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3300); };
  const persist = () => { try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('save-status').textContent='Saved in this browser';} catch { $('save-status').textContent='Storage full'; notify('Browser storage is full. Save your project as JSON.');} };
  const scheduleSave = () => { $('save-status').textContent='Saving…';clearTimeout(saveTimer);saveTimer=setTimeout(persist,350); };

  const openDB = () => new Promise(resolve=>{
    if(!('indexedDB' in window)){resolve(null);return;}
    try {const req=indexedDB.open('draftroom-media',1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('assets'))req.result.createObjectStore('assets');};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);
    } catch {resolve(null);}
  });
  const writeMedia = async (key,blob) => {mediaBlobs.set(key,blob);if(mediaUrls.has(key))URL.revokeObjectURL(mediaUrls.get(key));mediaUrls.set(key,URL.createObjectURL(blob));if(!mediaDB)return;await new Promise(resolve=>{try{const tx=mediaDB.transaction('assets','readwrite');tx.objectStore('assets').put(blob,key);tx.oncomplete=resolve;tx.onerror=resolve;}catch{resolve();}});};
  const readMedia = async key => {if(mediaBlobs.has(key))return mediaBlobs.get(key);if(!mediaDB)return null;return await new Promise(resolve=>{try{const req=mediaDB.transaction('assets','readonly').objectStore('assets').get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>resolve(null);}catch{resolve(null);}});};
  const loadMedia = async ()=>{const ids=[...new Set(state.messages.map(x=>x.mediaId).filter(Boolean))];for(const key of ids){const blob=await readMedia(key);if(blob){mediaBlobs.set(key,blob);mediaUrls.set(key,URL.createObjectURL(blob));}}renderCards();renderPreview();};
  const toDataURL = blob => new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(blob);});
  const resizedImage = (file,max=700,quality=.84) => new Promise((resolve,reject)=>{const image=new Image();const objectURL=URL.createObjectURL(file);image.onload=()=>{const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);URL.revokeObjectURL(objectURL);resolve(canvas.toDataURL('image/jpeg',quality));};image.onerror=()=>{URL.revokeObjectURL(objectURL);reject(new Error('Unsupported image'));};image.src=objectURL;});
  const makeVideoPoster=blob=>new Promise(resolve=>{const video=document.createElement('video');let done=false;const url=URL.createObjectURL(blob);video.muted=true;video.playsInline=true;video.preload='metadata';const finish=poster=>{if(done)return;done=true;URL.revokeObjectURL(url);resolve(poster||'');};const capture=()=>{try{const can=document.createElement('canvas');const scale=Math.min(1,600/Math.max(video.videoWidth||600,video.videoHeight||600));can.width=Math.max(1,Math.round((video.videoWidth||400)*scale));can.height=Math.max(1,Math.round((video.videoHeight||270)*scale));can.getContext('2d').drawImage(video,0,0,can.width,can.height);finish(can.toDataURL('image/jpeg',.8));}catch{finish('');}};video.onloadeddata=()=>{try{video.currentTime=Math.min(.1,(video.duration||1)/2);}catch{capture();}};video.onseeked=capture;video.onerror=()=>finish('');setTimeout(()=>finish(''),3500);video.src=url;video.load();});

  function senderOptions(selected){const options=[{id:'me',name:'Me · right side'},...(state.kind==='single'?[{id:'contact',name:(state.chatName||'Contact')+' · left side'}]:state.participants.map(p=>({id:p.id,name:(p.name||'Member')+' · left side'})))];return options.map(o=>`<option value="${escape(o.id)}" ${selected===o.id?'selected':''}>${escape(o.name)}</option>`).join('');}
  function effectiveSender(from){if(from==='me')return 'me';if(state.kind==='single')return 'contact';return state.participants.some(p=>p.id===from)?from:(state.participants[0]?.id||'me');}
  function senderName(from){if(from==='me')return 'You';if(state.kind==='single')return state.chatName||'Contact';return state.participants.find(p=>p.id===from)?.name||'Member';}
  function senderPhoto(from){if(state.kind==='single')return state.contactPhoto||'';return state.participants.find(p=>p.id===from)?.photo||'';}
  function senderAvatar(from,klass='small-chat-avatar'){const name=senderName(from);const photo=senderPhoto(from);return `<span class="${klass}">${photo?`<img src="${escape(photo)}" alt="" />`:escape((name||'?').slice(0,1).toUpperCase())}</span>`;}
  function makeMessage(type){return {id:uid(),type,from:state.kind==='group'?state.participants[0]?.id||'me':'contact',text:type==='text'?'':type==='timestamp'?(state.dateText||'Today 9:41 AM'):type==='system'?'Mathine left the conversation.':'',receipt:'default',eventKind:'custom',mediaId:null,poster:'',fileName:''};}
  const eventKinds=[['custom','Custom event'],['joined','Someone joined'],['left','Someone left'],['removed','Someone removed someone'],['dnd','Focus status enabled'],['blocked','Cannot message this person'],['unsent','Message unsent']];
  function eventText(kind){const who=state.kind==='group'?(state.participants[0]?.name||'Someone'):(state.chatName||'Someone');const other=state.kind==='group'?(state.participants[1]?.name||'someone'):'someone';return {joined:`${who} joined the conversation.`,left:`${who} left the conversation.`,removed:`${who} removed ${other} from the conversation.`,dnd:`${who} has notifications silenced.`,blocked:'You cannot send messages to this conversation.',unsent:`${who} unsent a message.`}[kind]||'';}

  function syncControls(){
    document.querySelectorAll('[data-version]').forEach(b=>{b.classList.toggle('selected',b.dataset.version===state.version);b.setAttribute('aria-pressed',String(b.dataset.version===state.version));});
    document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===state.theme));
    document.querySelectorAll('[data-color]').forEach(b=>b.classList.toggle('selected',b.dataset.color===state.color));
    document.querySelectorAll('[data-kind]').forEach(b=>b.classList.toggle('selected',b.dataset.kind===state.kind));
    $('version-hint').textContent=state.version==='27'?'Refined Liquid Glass controls, translucent layers, and colorful wallpapers.':'The familiar, minimal Messages interface.';
    $('wallpaper-row').hidden=state.version!=='27';$('wallpaper').value=state.wallpaper;$('glass-intensity').value=state.glass??55;$('glass-value').textContent=String(state.glass??55)+'%';
    $('chat-name').value=state.chatName;$('chat-name-label').textContent=state.kind==='group'?'Group chat name':'Contact name or nickname';
    $('single-contact').hidden=state.kind==='group';$('group-editor').hidden=state.kind!=='group';
    $('phone-time').value=state.phoneTime;$('date-text').value=state.dateText;$('chat-status').value=state.chatStatus;$('receipt-style').value=state.receipt;
    $('contact-avatar-preview').innerHTML=state.contactPhoto?`<img src="${escape(state.contactPhoto)}" alt="Contact photo">`:escape((state.chatName||'?')[0].toUpperCase());
    renderMembers();renderQuickSender();
  }
  function renderMembers(){
    $('participant-list').innerHTML=state.participants.map((p,i)=>`<div class="member-row" data-member="${escape(p.id)}"><label class="member-photo" title="Change member photo"><span class="member-avatar">${p.photo?`<img alt="" src="${escape(p.photo)}"/>`:escape((p.name||'?')[0].toUpperCase())}</span><input type="file" data-member-photo="${escape(p.id)}" accept="image/*" hidden /></label><input class="member-name" data-member-name="${escape(p.id)}" value="${escape(p.name)}" aria-label="Member ${i+1} name" placeholder="Member name"/><button class="member-remove" data-remove-member="${escape(p.id)}" title="Remove member" aria-label="Remove member">×</button></div>`).join('');
  }
  function renderQuickSender(){const old=$('quick-sender').value;$('quick-sender').innerHTML=senderOptions(old||'me');if(!old||!Array.from($('quick-sender').options).some(o=>o.value===old))$('quick-sender').value='me';}

  function renderCards(){
    $('message-count').textContent=`${state.messages.length} item${state.messages.length===1?'':'s'}`;
    if(!state.messages.length){$('message-cards').innerHTML='<div class="empty-card">Your conversation is empty.<br>Add a message above or type one below.</div>';return;}
    $('message-cards').innerHTML=state.messages.map((m,i)=>{
      const neutral=['timestamp','system'].includes(m.type);
      const top=`<div class="card-top"><div class="card-type">${String(i+1).padStart(2,'0')} · ${escape(m.type)}</div>${neutral?'':`<select class="card-sender" data-sender="${escape(m.id)}" aria-label="Message sender">${senderOptions(effectiveSender(m.from))}</select>`}<div class="card-actions"><button type="button" class="icon-button" title="Move up" data-move="up" data-id="${escape(m.id)}" ${i===0?'disabled':''}>↑</button><button type="button" class="icon-button" title="Move down" data-move="down" data-id="${escape(m.id)}" ${i===state.messages.length-1?'disabled':''}>↓</button><button type="button" class="icon-button" title="Duplicate" data-duplicate="${escape(m.id)}">⧉</button><button type="button" class="icon-button danger" title="Delete" data-delete="${escape(m.id)}">×</button></div></div>`;
      let body='';
      if(m.type==='text')body=`<textarea data-msg-text="${escape(m.id)}" aria-label="Message text" rows="2" placeholder="Write a message…">${escape(m.text)}</textarea>`;
      else if(m.type==='timestamp')body=`<input class="field-input" data-msg-text="${escape(m.id)}" aria-label="Timestamp" placeholder="Friday, March 30 at 9:41 PM" value="${escape(m.text)}" />`;
      else if(m.type==='system')body=`<select class="small-select event-select" data-event-kind="${escape(m.id)}">${eventKinds.map(([v,label])=>`<option value="${v}" ${m.eventKind===v?'selected':''}>${label}</option>`).join('')}</select><textarea data-msg-text="${escape(m.id)}" aria-label="System event text" rows="2" placeholder="A system event…" style="margin-top:8px">${escape(m.text)}</textarea>`;
      else if(m.type==='typing')body='<div class="info-hint">Animated three-dot typing indicator appears in the phone preview.</div>';
      else if(m.type==='image'||m.type==='video'){const src=m.type==='image'?mediaUrls.get(m.mediaId):(m.poster||'');body=`<button class="card-media" type="button" data-media-button="${escape(m.id)}">${src?`<img src="${escape(src)}" alt="Uploaded ${m.type}"/>${m.type==='video'?'<span class="overlay-play">▶</span>':''}`:`<span>+ &nbsp; Choose ${m.type==='image'?'a photo':'a video'} to attach</span>`}</button><div class="info-hint">${escape(m.fileName||'No file selected')}${m.type==='video'?' · PNG export uses a still preview':''}</div>`;}
      const receipt=(m.type==='text'||m.type==='image'||m.type==='video')?`<label>Receipt <select class="small-select" data-receipt="${escape(m.id)}"><option value="default" ${(m.receipt||'default')==='default'?'selected':''}>Default</option><option value="none" ${m.receipt==='none'?'selected':''}>None</option><option value="delivered" ${m.receipt==='delivered'?'selected':''}>Delivered</option><option value="read" ${m.receipt==='read'?'selected':''}>Read</option><option value="failed" ${m.receipt==='failed'?'selected':''}>Not delivered</option></select></label>`:'';
      return `<article class="message-card ${m.from==='me'?'from-me':''} type-${escape(m.type)}" data-card="${escape(m.id)}">${top}${body}${receipt?`<div class="card-bottom">${receipt}</div>`:''}</article>`;
    }).join('');
  }

  function renderPreview(){
    const shell=$('phone-shell');shell.className=`phone-shell is-ios${state.version} is-${state.theme} is-${state.color} ${state.kind==='group'?'is-group':''} ${state.chatStatus==='blocked'?'is-blocked':''} wallpaper-${state.wallpaper} ${state.wallpaperImage&&state.version==='27'?'has-custom-wallpaper':''}`;
    shell.style.setProperty('--custom-wallpaper',state.wallpaperImage?`url("${state.wallpaperImage}")`:'none');shell.style.setProperty('--glass-alpha',String((0.16+(Math.max(0,Math.min(100,Number(state.glass)||0))/100)*.55).toFixed(2)));
    $('status-time').textContent=state.phoneTime||'9:41';$('phone-name').textContent=state.chatName||(state.kind==='group'?'Group Chat':'Contact');
    $('phone-subtitle').textContent=state.chatStatus==='dnd'?'☾ Notifications silenced':'⌄';
    $('phone-subtitle').classList.toggle('dnd',state.chatStatus==='dnd');
    if(state.kind==='group'){
      $('phone-avatar').className='phone-avatar group-stack';$('phone-avatar').innerHTML=state.participants.slice(0,3).map(p=>`<span class="stack-avatar">${p.photo?`<img src="${escape(p.photo)}" alt="" />`:escape((p.name||'?')[0].toUpperCase())}</span>`).join('');
    }else{
      $('phone-avatar').className='phone-avatar';$('phone-avatar').innerHTML=state.contactPhoto?`<img src="${escape(state.contactPhoto)}" alt="" />`:escape((state.chatName||'?')[0].toUpperCase());
    }
    $('blocked-notice').hidden=state.chatStatus!=='blocked';
    $('chat-log').innerHTML=state.messages.map((m,i)=>{
      if(m.type==='timestamp')return `<div class="chat-event timestamp">${escape(m.text)}</div>`;
      if(m.type==='system')return `<div class="chat-event">${escape(m.text)}</div>`;
      const from=effectiveSender(m.from),mine=from==='me';
      const previous=state.messages[i-1],next=state.messages[i+1];
      const grouped=Boolean(previous&&effectiveSender(previous.from)===from&&!['timestamp','system'].includes(previous.type)&&previous.type!=='typing');
      const clusterEnd=!next||['timestamp','system','typing'].includes(next.type)||m.type==='typing'||effectiveSender(next.from)!==from;
      const speaker=state.kind==='group'&&!mine&&!grouped?`<div class="speaker-name">${escape(senderName(from))}</div>`:'';
      let content='';
      if(m.type==='text')content=`<div class="chat-bubble">${escape(m.text||' ')}</div>`;
      else if(m.type==='typing')content='<div class="chat-bubble typing-bubble"><i></i><i></i><i></i></div>';
      else if(m.type==='image'||m.type==='video'){
        const src=m.type==='image'?mediaUrls.get(m.mediaId):(m.poster||'');
        content=`<div class="chat-bubble media"><div class="media-frame">${src?`<img src="${escape(src)}" alt="${m.type==='image'?'Photo':'Video still'}">`:`<div class="media-placeholder">${m.type==='image'?'Photo':'Video'}</div>`}${m.type==='video'?`<div class="media-play" ${m.mediaId?`data-play-video="${escape(m.mediaId)}" title="Play video" role="button" tabindex="0"`:''}><span>▶</span></div>`:''}</div></div>`;
      }
      const hasFollowingMine=mine&&next&&effectiveSender(next.from)==='me'&&!['timestamp','system'].includes(next.type);
      const receipt=m.receipt==='default'||!m.receipt?state.receipt:m.receipt;
      const receiptText={delivered:'Delivered',read:'Read',failed:'Not Delivered',none:''}[receipt]||'';
      const receiptMarkup=mine&&!hasFollowingMine&&m.type!=='typing'&&receiptText?`<div class="receipt">${receiptText}</div>`:'';
      return `<div class="chat-row ${mine?'mine':''} ${grouped?'grouped':''} ${clusterEnd?'cluster-end':''}">${speaker}<div class="bubble-wrap">${content}${state.kind==='group'&&!mine?senderAvatar(from):''}</div>${receiptMarkup}</div>`;
    }).join('');
    const log=$('chat-log');requestAnimationFrame(()=>{if(log.isConnected)log.scrollTop=log.scrollHeight;});
  }
  function renderAll(){syncControls();renderCards();renderPreview();}
  function addMessage(type,{text=null,from=null}={}){
    const msg=makeMessage(type);if(text!==null)msg.text=text;if(from!==null)msg.from=from;
    state.messages.push(msg);renderCards();renderPreview();scheduleSave();
    $('cards-scroll').scrollTop=$('cards-scroll').scrollHeight;
    if(type==='image'||type==='video')setTimeout(()=>startMediaUpload(msg.id),0);
    else if(type==='text'&&text===null)setTimeout(()=>{const el=document.querySelector(`[data-msg-text="${msg.id}"]`);el?.focus();},0);
  }
  function findMessage(id){return state.messages.find(m=>m.id===id);}
  function startMediaUpload(id){const m=findMessage(id);if(!m)return;mediaTarget=id;$('media-upload').accept=m.type==='video'?'video/*':'image/*';$('media-upload').value='';$('media-upload').click();}
  async function attachMedia(msg,file){
    if(!file)return;
    if(msg.type==='image'&&!file.type.startsWith('image/')){notify('Choose a photo file.');return;}
    if(msg.type==='video'&&!file.type.startsWith('video/')){notify('Choose a video file.');return;}
    if(file.size>85*1024*1024){notify('Keep individual media files under 85 MB for browser storage.');return;}
    try{
      const id=uid();let blob=file;
      if(msg.type==='image'){const resized=await resizedImage(file,1500,.9);blob=await (await fetch(resized)).blob();}
      await writeMedia(id,blob);
      msg.mediaId=id;msg.fileName=file.name;msg.poster=msg.type==='video'?await makeVideoPoster(file):'';
      scheduleSave();renderCards();renderPreview();notify(`${msg.type==='video'?'Video':'Photo'} added to your conversation.`);
    }catch(e){console.error(e);notify('Could not read that file. Please try a different format.');}
  }
  function handleMove(id,dir){const i=state.messages.findIndex(m=>m.id===id),j=dir==='up'?i-1:i+1;if(i<0||j<0||j>=state.messages.length)return;[state.messages[i],state.messages[j]]=[state.messages[j],state.messages[i]];renderCards();renderPreview();scheduleSave();}

  // Editing events are delegated so the editor does not steal focus while typing.
  $('message-cards').addEventListener('input',e=>{
    const id=e.target.dataset.msgText;if(id){const m=findMessage(id);if(m){m.text=e.target.value;renderPreview();scheduleSave();}}
  });
  $('message-cards').addEventListener('change',e=>{
    const t=e.target;let m;
    if(t.dataset.sender){m=findMessage(t.dataset.sender);if(m){m.from=t.value;t.closest('.message-card')?.classList.toggle('from-me',t.value==='me');renderPreview();scheduleSave();}}
    else if(t.dataset.receipt){m=findMessage(t.dataset.receipt);if(m){m.receipt=t.value;renderPreview();scheduleSave();}}
    else if(t.dataset.eventKind){m=findMessage(t.dataset.eventKind);if(m){m.eventKind=t.value;if(t.value!=='custom'){m.text=eventText(t.value);const input=t.closest('.message-card').querySelector('[data-msg-text]');if(input)input.value=m.text;}renderPreview();scheduleSave();}}
  });
  $('message-cards').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.move)handleMove(b.dataset.id,b.dataset.move);
    if(b.dataset.delete){state.messages=state.messages.filter(m=>m.id!==b.dataset.delete);renderCards();renderPreview();scheduleSave();}
    if(b.dataset.duplicate){const i=state.messages.findIndex(m=>m.id===b.dataset.duplicate);if(i>=0){state.messages.splice(i+1,0,{...state.messages[i],id:uid()});renderCards();renderPreview();scheduleSave();}}
    if(b.dataset.mediaButton)startMediaUpload(b.dataset.mediaButton);
  });
  document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addMessage(b.dataset.add)));
  function sendQuick(){const text=$('quick-text').value.trim();if(!text){notify('Write something first.');return;}addMessage('text',{text,from:$('quick-sender').value});$('quick-text').value='';$('quick-text').focus();}
  $('quick-send').addEventListener('click',sendQuick);
  $('quick-text').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();sendQuick();}});
  $('emoji-tray').innerHTML=EMOJIS.map(e=>`<button type="button" aria-label="Insert ${e}">${e}</button>`).join('');
  $('emoji-tray').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=$('quick-text'),start=t.selectionStart,end=t.selectionEnd;t.value=t.value.slice(0,start)+b.textContent+t.value.slice(end);t.focus();t.setSelectionRange(start+b.textContent.length,start+b.textContent.length);});
  for(const [key,field,values] of [['version','version',['18','27']],['theme','theme',['light','dark']],['color','color',['blue','green']],['kind','kind',['single','group']]]){
    document.querySelectorAll(`[data-${key}]`).forEach(b=>b.addEventListener('click',()=>{
      const value=b.dataset[key];if(!values.includes(value))return;state[field]=value;
      if(field==='kind'){state.messages.forEach(m=>{if(m.from!=='me')m.from=value==='group'?state.participants[0]?.id||'me':'contact';});if(value==='group'&&state.chatName==='Mathine')state.chatName='The Group Chat';else if(value==='single'&&state.chatName==='The Group Chat')state.chatName='Mathine';}
      renderAll();scheduleSave();
    }));
  }
  const bindValue=(id,key)=>$(id).addEventListener('input',e=>{state[key]=e.target.value;if(id==='chat-name'){$('contact-avatar-preview').textContent=(state.chatName||'?')[0].toUpperCase();renderQuickSender();}renderPreview();scheduleSave();});
  bindValue('chat-name','chatName');bindValue('phone-time','phoneTime');
  $('date-text').addEventListener('input',e=>{
    const first=state.messages.find(m=>m.type==='timestamp'&&m.text===state.dateText);
    state.dateText=e.target.value;
    if(first){first.text=state.dateText;const input=document.querySelector(`[data-msg-text="${first.id}"]`);if(input)input.value=first.text;}
    renderPreview();scheduleSave();
  });
  for(const [id,key] of [['chat-status','chatStatus'],['receipt-style','receipt'],['wallpaper','wallpaper']])$(id).addEventListener('change',e=>{state[key]=e.target.value;renderPreview();scheduleSave();});
  $('contact-upload').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{state.contactPhoto=await resizedImage(f,260);syncControls();renderPreview();scheduleSave();}catch{notify('That contact photo could not be loaded.');}});
  const contactDrop=$('contact-drop');contactDrop.addEventListener('dragover',e=>{e.preventDefault();contactDrop.style.background='#e9f3ea';});contactDrop.addEventListener('dragleave',()=>contactDrop.style.background='');contactDrop.addEventListener('drop',async e=>{e.preventDefault();contactDrop.style.background='';const f=e.dataTransfer.files?.[0];if(!f?.type.startsWith('image/'))return;try{state.contactPhoto=await resizedImage(f,260);syncControls();renderPreview();scheduleSave();}catch{notify('Cannot use that contact photo.');}});
  $('glass-intensity').addEventListener('input',e=>{state.glass=Number(e.target.value);$('glass-value').textContent=state.glass+'%';renderPreview();scheduleSave();});
  $('wallpaper-upload').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{state.wallpaperImage=await resizedImage(f,950);renderPreview();scheduleSave();notify('Chat wallpaper added.');}catch{notify('Could not read wallpaper image.');}});
  $('add-member').addEventListener('click',()=>{if(state.participants.length>=20){notify('A maximum of 20 members can be shown in this editor.');return;}state.participants.push({id:uid(),name:`Member ${state.participants.length+1}`,photo:''});syncControls();renderCards();renderPreview();scheduleSave();});
  $('participant-list').addEventListener('input',e=>{const id=e.target.dataset.memberName;if(!id)return;const p=state.participants.find(x=>x.id===id);if(!p)return;p.name=e.target.value;renderQuickSender();renderCardsSenderOptions();renderPreview();scheduleSave();});
  function renderCardsSenderOptions(){document.querySelectorAll('[data-sender]').forEach(sel=>{const val=sel.value;sel.innerHTML=senderOptions(val);sel.value=val;});}
  $('participant-list').addEventListener('change',async e=>{const id=e.target.dataset.memberPhoto;if(!id)return;const p=state.participants.find(x=>x.id===id),f=e.target.files?.[0];if(!p||!f)return;try{p.photo=await resizedImage(f,260);syncControls();renderPreview();scheduleSave();}catch{notify('Could not read member photo.');}});
  $('participant-list').addEventListener('dragover',e=>{const member=e.target.closest('[data-member]');if(member&&e.dataTransfer?.types.includes('Files')){e.preventDefault();member.classList.add('file-over');}});
  $('participant-list').addEventListener('dragleave',e=>{const member=e.target.closest('[data-member]');if(member&&!member.contains(e.relatedTarget))member.classList.remove('file-over');});
  $('participant-list').addEventListener('drop',async e=>{const member=e.target.closest('[data-member]');if(!member)return;e.preventDefault();member.classList.remove('file-over');const p=state.participants.find(x=>x.id===member.dataset.member),file=e.dataTransfer.files?.[0];if(!p||!file?.type.startsWith('image/'))return;try{p.photo=await resizedImage(file,260);syncControls();renderPreview();scheduleSave();notify('Member photo updated.');}catch{notify('Could not read member photo.');}});
  $('participant-list').addEventListener('click',e=>{const id=e.target.dataset.removeMember;if(!id)return;if(state.participants.length<=1){notify('Keep at least one group member.');return;}state.participants=state.participants.filter(p=>p.id!==id);state.messages.forEach(m=>{if(m.from===id)m.from=state.participants[0]?.id||'me';});renderAll();scheduleSave();});
  $('media-upload').addEventListener('change',async e=>{const file=e.target.files?.[0],msg=findMessage(mediaTarget);if(msg&&file)await attachMedia(msg,file);mediaTarget=null;});
  $('chat-log').addEventListener('click',e=>{const target=e.target.closest('[data-play-video]');if(!target)return;const src=mediaUrls.get(target.dataset.playVideo);if(!src)return;const frame=target.closest('.media-frame');if(!frame)return;const vid=document.createElement('video');vid.src=src;vid.controls=true;vid.autoplay=true;vid.playsInline=true;vid.style.cssText='max-width:245px;max-height:260px;display:block';frame.replaceChildren(vid);vid.play().catch(()=>{});});
  $('app-imessage').addEventListener('click',()=>{document.querySelector('.composer-panel').scrollIntoView({behavior:'smooth',block:'start'});$('quick-text').focus({preventScroll:true});});
  $('reset-project').addEventListener('click',()=>{if(!confirm('Start a new conversation? This replaces the current browser draft. You can export a project first.'))return;state=defaults();renderAll();persist();notify('New conversation started.');});

  async function exportProject(){
    notify('Preparing your portable project…');
    const assets={};for(const id of [...new Set(state.messages.map(m=>m.mediaId).filter(Boolean))]){const blob=await readMedia(id);if(blob)assets[id]=await toDataURL(blob);}
    const project={format:'draftroom-imessage',version:1,exportedAt:new Date().toISOString(),state,assets};
    saveFile(new Blob([JSON.stringify(project)],{type:'application/json'}),`draftroom-${filenameBase()}.json`);notify('Project saved with its attachments.');
  }
  function filenameBase(){return (state.chatName||'conversation').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,32)||'conversation';}
  function saveFile(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  $('export-project').addEventListener('click',()=>exportProject().catch(err=>{console.error(err);notify('Could not export project.');}));
  $('import-project').addEventListener('click',()=>$('project-upload').click());
  $('project-upload').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;try{
      const content=JSON.parse(await file.text());if(content.format!=='draftroom-imessage'||!content.state||!Array.isArray(content.state.messages))throw Error('Not a Draftroom project');
      if(!confirm('Import this project? It will replace your current browser draft.'))return;
      state={...defaults(),...content.state};state.messages=state.messages.filter(x=>validTypes.has(x.type)).slice(0,500);
      for(const [key,uri] of Object.entries(content.assets||{})){if(typeof uri!=='string'||!uri.startsWith('data:'))continue;await writeMedia(key,await(await fetch(uri)).blob());}
      renderAll();persist();notify('Project imported, including its media.');
    }catch(err){console.error(err);notify('This file is not a valid Draftroom project.');}e.target.value='';
  });

  async function pngCapture(mode){
    if(typeof html2canvas!=='function'){notify('The PNG export library did not load. Please check your internet connection.');return;}
    const button=mode==='phone'?$('download-phone'):$('export-full');button.disabled=true;const old=button.textContent;button.textContent='Rendering…';
    let staging=null;
    try{
      // Take a static rendering: animated typing bubbles and video thumbnails remain visible in exports.
      // For full chat export the message list grows naturally instead of getting cut off at phone height.
      renderPreview();await new Promise(resolve=>setTimeout(resolve,130));
      const original=mode==='phone'?$('phone-shell'):$('phone-screen');
      staging=document.createElement('div');staging.className='capture-staging';staging.style.cssText='position:fixed;left:-20000px;top:0;z-index:-1;pointer-events:none;';
      const clone=original.cloneNode(true);
      // Preserve ancestor-dependent appearance and inherited wallpaper/tint variables.
      if(mode==='full'){
        const context=document.createElement('div');context.className=$('phone-shell').className;
        context.style.cssText=$('phone-shell').style.cssText;
        context.style.width='341px';context.style.height='auto';context.style.border='0';context.style.padding='0';context.style.borderRadius='0';context.style.transform='none';context.style.boxShadow='none';
        context.append(clone);staging.append(context);
      }else staging.append(clone);
      document.body.append(staging);
      if(mode==='phone'){
        clone.style.transform='none';clone.style.boxShadow='none';
        const log=clone.querySelector('.chat-log');log.scrollTop=$('chat-log').scrollTop;
        staging.style.width='355px';staging.style.height='710px';
      }else{
        staging.style.width='341px';clone.style.width='341px';clone.style.height='auto';clone.style.minHeight='690px';clone.style.borderRadius='0';clone.style.overflow='visible';
        clone.style.display='flex';clone.style.flexDirection='column';
        const log=clone.querySelector('.chat-log');log.style.flex='none';log.style.overflow='visible';log.style.height='auto';log.style.minHeight='515px';
        const header=clone.querySelector('.chat-header');header.style.flex='none';
        const bottom=clone.querySelector('.phone-bottom');bottom.style.flex='none';
        // The wallpaper is absolutely positioned and automatically extends to the clone's full height.
      }
      const allImgs=[...clone.querySelectorAll('img')];await Promise.all(allImgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;setTimeout(resolve,2400);})));await document.fonts?.ready;
      const canvas=await html2canvas(clone,{backgroundColor:null,scale:2,useCORS:true,logging:false,scrollX:0,scrollY:0,windowWidth:document.documentElement.clientWidth,windowHeight:document.documentElement.clientHeight});
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Canvas export failed');
      saveFile(blob,`draftroom-${filenameBase()}-${mode==='phone'?'phone':'full-chat'}.png`);notify('Your conversation PNG is ready.');
    }catch(err){console.error(err);notify('PNG rendering failed. Try shorter media or a different browser.');}
    finally{staging?.remove();button.disabled=false;button.textContent=old;}
  }
  $('export-full').addEventListener('click',()=>pngCapture('full'));
  $('download-phone').addEventListener('click',()=>pngCapture('phone'));
  $('export-phone').addEventListener('click',()=>pngCapture('phone'));

  async function init(){mediaDB=await openDB();renderAll();await loadMedia();}
  init();
})();
