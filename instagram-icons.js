/* Instagram-only vectors drawn from the supplied interface references.
   Loaded only by instagram.html; X keeps its existing icon renderer. */
(() => {
  'use strict';
  const paths={
    back:'<path d="m14.7 3.4-8.6 8.6 8.6 8.6"/>',
    chevron:'<path d="m5.4 8.8 6.6 6.4 6.6-6.4"/>',
    bell:'<path d="M19.5 9.5c0-4.1-2.4-6.5-5.5-7v-.4a2 2 0 0 0-4 0v.4c-3.1.5-5.5 2.9-5.5 7 0 5.9-2.4 6.3-2.4 7.9 0 1.4 4.1 2.2 9.9 2.2s9.9-.8 9.9-2.2c0-1.6-2.4-2-2.4-7.9Z"/><path d="M9 20.2a3.1 3.1 0 0 0 6 0"/>',
    heart:'<path d="M20.8 4.7c-2.4-2.5-6.1-1.9-8.8 1.1-2.7-3-6.4-3.6-8.8-1.1-2.5 2.6-1.7 6.1.3 8.8 2.1 2.9 5.3 5.8 8.5 8.1 3.2-2.3 6.4-5.2 8.5-8.1 2-2.7 2.8-6.2.3-8.8Z"/>',
    comment:'<path d="M21.1 15.7A9.6 9.6 0 1 0 15.7 21l6.3 1-1-6.3Z"/>',
    send:'<path d="M20.8 2.6 3.6 6.8c-1.5.4-1.8 2-.5 2.8l7.4 4.4 4.3 7.2c.8 1.3 2.4 1 2.8-.4L22 3.7c.2-.8-.4-1.4-1.2-1.1Z"/><path d="m10.5 14 7-7"/>',
    bookmark:'<path d="M5.4 2.9h13.2v19l-6.6-4.7-6.6 4.7Z"/>',
    repost:'<path d="M5.7 13V8.9a4 4 0 0 1 4-4h7.9M13.8 1.4l3.8 3.5-3.8 3.6M18.3 11v4.1a4 4 0 0 1-4 4H6.4m3.8 3.5-3.8-3.5 3.8-3.6"/>',
    home:'<path d="M3.1 9.1 10 3.2a3 3 0 0 1 4 0l6.9 5.9c.7.6 1.1 1.4 1.1 2.4v8.8c0 1-.7 1.7-1.7 1.7h-5v-7.4H8.7V22h-5c-1 0-1.7-.7-1.7-1.7v-8.8c0-1 .4-1.8 1.1-2.4Z"/>',
    search:'<circle cx="10.8" cy="10.8" r="8.5"/><path d="m17.1 17.1 4.7 4.7"/>',
    reel:'<path d="M8 2.8h8c3.9 0 5.2 1.8 5.2 5.3v7.8c0 3.8-1.7 5.3-5.2 5.3H8c-3.7 0-5.2-1.7-5.2-5.3V8.1c0-3.6 1.5-5.3 5.2-5.3Z"/><path d="M9.6 7.7c-.5-.3-1.1.1-1.1.7v7.2c0 .6.6 1 1.1.7l6.4-3.6c.6-.3.6-1.1 0-1.4L9.6 7.7Z"/>',
    grid:Array.from({length:9},(_,i)=>`<rect x="${4+i%3*6}" y="${2+Math.floor(i/3)*7}" width="4" height="6" rx="1"/>`).join(''),
    tag:'<path d="M8 5.5 10.2 2h3.6L16 5.5h2c2.2 0 3.5 1.4 3.5 3.5v10c0 2.1-1.3 3.5-3.5 3.5H6c-2.2 0-3.5-1.4-3.5-3.5V9c0-2.1 1.3-3.5 3.5-3.5Z"/><circle cx="12" cy="11.3" r="3.2"/><path d="M5.9 21.3a6.2 6.2 0 0 1 12.2 0"/>',
    more:'<circle cx="4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/>',
    plus:'<path d="M12 2.5v19M2.5 12h19"/>',
    close:'<path d="m3.1 3.1 17.8 17.8M20.9 3.1 3.1 20.9"/>',
    menu:'<path d="M2.5 4.5h19M2.5 12h19M2.5 19.5h19"/>',
    activity:'<circle cx="10" cy="7.2" r="3.4"/><path d="M3 20.1c.6-4 3.4-5.9 7-5.9s6.4 1.9 7 5.9c-3.9 2-10.1 2-14 0Zm14-16.5a4.1 4.1 0 0 1 0 7.5m2 3a6.5 6.5 0 0 1 3 4.4"/>',
    highlight:'<path d="M10.2 2.5a9.6 9.6 0 0 1 10.4 13M18.9 19a9.5 9.5 0 0 1-9.4 2.3M5.7 19.5a9.4 9.4 0 0 1-3.1-9.2M4 6.2l.9-1.1M7 3.5l.5-.3"/><path d="M12 16.8c-2.5-1.9-4.5-3.8-4.5-5.7 0-2.5 3.1-3.3 4.5-1.3 1.4-2 4.5-1.2 4.5 1.3 0 1.9-2 3.8-4.5 5.7Z"/>',
    mention:'<rect x="3" y="1.9" width="18" height="20.2" rx="5.4"/><path d="M15.8 9.1v5.2c0 1.4 2.6 1.5 2.6-1.6v-.9a6.4 6.4 0 1 0-4 6m1.4-6.2c0 4.5-6.4 4.6-6.4 0s6.4-4.5 6.4 0Z"/>',
    facebook:'<circle cx="12" cy="12" r="9.7"/><path d="M13.3 21.2v-8h2.6l.4-3h-3V8c0-1 .4-1.5 1.7-1.5h1.6V3.9h-2.2c-2.5 0-4.2 1.5-4.2 4.2v2.1H7.7v3h2.5v8"/>',
    star:'<path d="m12 1.9 3.1 6.2 6.9 1-5 4.9 1.2 6.9-6.2-3.2-6.2 3.2L7 14l-5-4.9 6.9-1Z"/>',
    personAdd:'<circle cx="15" cy="7" r="3.4"/><path d="M8.7 21c.4-4.2 2.7-6.3 6.3-6.3s5.9 2.1 6.3 6.3ZM4.7 7.5v7M1.2 11h7"/>',
    stack:'<rect x="6" y="2" width="15" height="15" rx="4"/><path d="M17 19v.2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3"/>',
    check:'<path d="m6 12 4 4 8-9"/>',
    lock:'<rect x="6.2" y="10" width="11.6" height="11" rx="2.5"/><path d="M8.7 10V6.4a3.3 3.3 0 0 1 6.6 0V10"/>',
    video:'<rect x="2" y="4.5" width="14.3" height="15" rx="4"/><path d="m16.6 9 5.4-3.1v12.2L16.6 15Z"/>',
    phone:'<path d="m5.1 2.1 4.1 3.5c.6.5.7 1.3.2 2L7.3 11a15 15 0 0 0 5.7 5.7l3.4-2.1c.7-.5 1.5-.4 2 .2l3.5 4.1c.6.7.4 1.6-.3 2.1-3.1 2.1-8.5-.8-13.2-5.5S.8 5.5 2.9 2.4c.5-.7 1.5-.9 2.2-.3Z"/>',
    camera:'<path d="m7.3 5.6 2-3.1h5.4l2 3.1h2.6a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H4.7a3 3 0 0 1-3-3v-10a3 3 0 0 1 3-3Z"/><circle cx="12" cy="13.3" r="4.3"/>',
    image:'<rect x="2.5" y="2.5" width="19" height="19" rx="4.4"/><circle cx="8.3" cy="8.3" r="1.6"/><path d="m3 17 5.8-5.1 4 3.3 3.8-3.6 4.9 4.8"/>',
    edit:'<path d="M13 3H6a3 3 0 0 0-3 3v13a2 2 0 0 0 2 2h13a3 3 0 0 0 3-3v-7M9 15l.9-4.3L19 1.6 22.4 5l-9.1 9.1Z"/>',
    mic:'<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v4M8 23h8"/>'
  };
  const previous=SocialUI.icon;
  function icon(name,{fill=false,color='currentColor',size=24}={}){if(!paths[name])return previous(name,{fill,color,size});const solid=fill||['grid','more','star'].includes(name);return `<svg class="social-icon ig-icon ig-icon-${name}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${solid?color:'none'}" fill-rule="evenodd" stroke="${['grid','more'].includes(name)?'none':color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;}
  SocialUI.icon=icon;
  window.InstagramIcons={icon};
})();
