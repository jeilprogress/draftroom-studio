/* Render graphemes as Apple artwork while keeping original Unicode in saved projects. */
(() => {
  const map=window.DRAFTROOM_EMOJI_DATA||{};
  const sheet=new Image();sheet.src='vendor/emoji/apple-32.webp';
  let loaded=false;
  const ready=sheet.decode().then(()=>{loaded=true;}).catch(()=>{});
  const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const segments=text=>segmenter?Array.from(segmenter.segment(String(text)),x=>x.segment):String(text).match(/\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*|[\s\S]/gu)||[];
  const lookup=s=>map[s]||map[s.replace(/\uFE0F/g,'')];
  function render(text){
    return segments(text).map(s=>{
      const pos=lookup(s);if(!loaded||!pos)return escape(s);
      const x=(pos[0]*34+1)/(2108-32)*100,y=(pos[1]*34+1)/(2108-32)*100;
      return `<span class="ios-emoji" role="img" aria-label="${escape(s)}" style="background-position:${x}% ${y}%"><span>${escape(s)}</span></span>`;
    }).join('');
  }
  function count(text){const parts=segments(String(text).trim()).filter(s=>s.trim());return parts.length&&parts.length<=3&&parts.every(lookup)?parts.length:0;}
  window.DraftroomEmoji={render,count,ready};
})();
