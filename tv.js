const $ = (selector,root=document) => root.querySelector(selector);
const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];
const esc = (value='') => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = (value='') => /^(https:\/\/|\/assets\/)/.test(value) ? value : '';
const image = (src,alt='',className='') => safeUrl(src) ? `<img src="${esc(safeUrl(src))}" alt="${esc(alt)}" class="${className}" loading="lazy" decoding="async">` : '';
const num = n => String(n).padStart(2,'0');
let content,channel='home',item=0,page=0,detail=false,playing=false,filmIntro=false,power=true,sound=false,transitionTimer,resizeTimer,fetching=false;
let touchStart,soundChosen=false;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const channels = () => content.channels.filter(x=>x.enabled);
const projects = () => content.projects.filter(x=>x.enabled);
const films = () => content.films.filter(x=>x.enabled);
const key = (name,label,extra='') => `<button type="button" data-action="${name}" ${extra}>${label}</button>`;
const action = (name,label,outline=false) => `<button type="button" class="screen-action${outline?' outline':''}" data-action="${name}">${label}</button>`;
const link = (href,label,className='') => safeUrl(href)?`<a class="${className}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:'';
const header = title => `<div class="broadcast-header"><span>${esc(content.profile.shortName)} / ${esc(title)}</span><span><i class="onair-dot"></i>ON AIR <b>CH ${num(channels().findIndex(x=>x.id===channel)+1)}</b></span></div>`;
const pager = (index,total,label='PROGRAMME',prefix='item') => `<div class="screen-footer"><span class="counter">${esc(label)} ${num(index+1)} / ${num(total)}</span><div class="footer-actions">${key(prefix+'-prev','← PREV',total<2?'disabled':'aria-label="Previous '+(prefix==='page'?'page':'item')+'"')}${key(prefix+'-next','NEXT →',total<2?'disabled':'aria-label="Next '+(prefix==='page'?'page':'item')+'"')}</div></div>`;
const wrap = (cls,body,footer,title) => `<section class="screen-page ${cls}" aria-label="${esc(title)}">${header(title)}<div class="screen-content">${body}</div>${footer}</section>`;

function chunkText(text,limit=capacity()) {
  const words=String(text||'').trim().split(/\s+/).filter(Boolean),chunks=[];let chunk='';
  for(const word of words){if(chunk&&chunk.length+word.length+1>limit){chunks.push(chunk);chunk='';}chunk+=(chunk?' ':'')+word;}
  if(chunk)chunks.push(chunk);return chunks.length?chunks:[''];
}
function capacity(factor=1){const r=$('#crt').getBoundingClientRect();return Math.max(115,Math.min(600,Math.floor((r.width/8)*Math.max(90,r.height-210)/25*.7*factor)));}
function slices(values,count){const out=[];for(let i=0;i<values.length;i+=count)out.push(values.slice(i,i+count));return out;}
function gridCount(){const r=$('#crt').getBoundingClientRect();return r.width<400?4:6;}
function pieces(title,text){return chunkText(text).map((body,index)=>({title:title+(index?' / continued':''),body}));}
function projectPages(project){
  return [
    ...pieces('The idea',project.description+' '+project.overview),
    ...pieces('Behind the build',project.approach),
    ...slices(project.tags,gridCount()).map(values=>({title:'Project labels',values})),
    ...slices(project.stack,gridCount()).map(values=>({title:'Tools & techniques',values})),
    ...slices(project.flow,gridCount()).map(values=>({title:'How it comes together',values,ordered:true})),
    ...pieces('Project notes',project.note),
    ...(project.links.length?[{title:'Explore the work',links:project.links}]:[])
  ];
}

function drawHome(){
  const p=content.profile;
  const next=channels().find(c=>c.id==='work')||channels().find(c=>c.id!=='home');
  const body=`<div class="home-copy"><p class="eyebrow">${esc(p.kicker)}</p><h1 class="show-title">${esc(p.homeTitle)}</h1><p class="home-subtitle">${esc(p.homeSubtitle)}</p><p class="home-location">${esc(p.name)}<br>${esc(p.location)}</p></div><div class="home-portrait"><span class="home-star" aria-hidden="true">✳</span><div class="portrait-medallion">${image(p.portrait,p.name)}</div><div class="portrait-stamp">${esc(p.role)}</div></div>`;
  const footer=`<div class="screen-footer"><span>AN ORIGINAL BROADCAST<br>CODE × CAMERA × CURIOSITY</span><div class="footer-actions">${next?key('channel-'+next.id,'SEE THE WORK ↗'):''}${key('channel-contact','START A CONVERSATION ↗')}</div></div>`;
  return wrap('home-page',body,footer,'THE INTRODUCTION');
}

function drawProject(){
  const all=projects();if(!all.length)return empty('The engineering programme','New work is being prepared. Tune into another channel.');
  item=(item+all.length)%all.length;const p=all[item];
  if(detail){
    const pages=projectPages(p);page=(page+pages.length)%pages.length;const scene=pages[page];
    const inner=`<div class="detail-topline"><p class="eyebrow">${esc(p.title)}</p><button class="back-link" data-action="back">← ALL WORK</button></div><h2 class="detail-heading">${esc(scene.title)}</h2><p class="detail-subtitle">${esc(p.role)} · ${esc(p.year)}</p><div class="detail-body">${scene.body?`<p class="screen-copy">${esc(scene.body)}</p>`:''}${scene.values?`<div class="tool-grid">${scene.values.map((v,i)=>`<span>${scene.ordered?`<i>${num(i+1)}</i>`:''}${esc(v)}</span>`).join('')}</div>`:''}${scene.links?`<p class="screen-copy">${esc(p.summary)}</p><div class="screen-links">${scene.links.map(l=>link(l.href,l.label)).join('')}</div>`:''}</div>`;
    return wrap('project-detail',inner,pager(page,pages.length,'PAGE','page'),'ENGINEERING / PROJECT FILE');
  }
  const icons={eye:'◉',network:'⑥',waves:'≋',cross:'✚',code:'{ }'};
  const theme={olive:'#54603b',rust:'#985039',teal:'var(--teal)',plum:'#6d4650',sand:'#8e6c3b'}[p.theme]||'var(--teal)';
  const deliverable=p.flow.at(-1)||p.category;
  const body=`<div class="project-cover"><div class="cover-copy"><p class="project-category">${esc(p.category)} / ${esc(p.year)}</p><h2 class="screen-title">${esc(p.title)}</h2><p class="screen-copy">${esc(p.summary)}</p><p class="project-proof"><b>MY ROLE</b> ${esc(p.role)}<br><b>${p.id==='aarogya'?'PROPOSED':'BUILT'}</b> ${esc(deliverable)}</p><div class="mini-tags">${p.tags.slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('')}</div>${action('open-project','OPEN PROJECT FILE ↗')}</div><div class="project-card-art ${p.thumbnail?'has-image':''}" style="background:${theme}">${image(p.thumbnail,p.title)}<div class="art-category">${esc(content.profile.shortName)} / SERIES ${esc(p.number||num(item+1))}</div><div class="art-icon" aria-hidden="true">${icons[p.icon]||'✳'}</div><div class="art-metric">${esc(p.metric)}</div><p class="art-label">${esc(p.metricLabel)}</p></div></div>`;
  const demo=p.links.find(l=>/live|demo|website/i.test(l.label));
  const source=p.links.find(l=>/^https:\/\/github\.com\//i.test(l.href));
  const quickLinks=[source?link(source.href,'GITHUB SOURCE','project-demo'):'' ,demo?link(demo.href,p.id==='glaucoma'?'OPEN LIVE DEMO':demo.label.toUpperCase(),'project-demo'):''].filter(Boolean).join('');
  const withDemo=quickLinks?body.replace('</div><div class="project-card-art',`<div class="project-quicklinks">${quickLinks}</div></div><div class="project-card-art`):body;
  return wrap('project-page',withDemo,pager(item,all.length,'PROJECT'),'SELECTED ENGINEERING');
}

function drawFilms(){
  const all=films();if(!all.length)return empty('The projection room','New pictures are on the way. Tune into another channel.');
  if(filmIntro){
    const body=`<div class="film-intro-copy"><p class="eyebrow">SVM / MOTION PICTURES</p><h2 class="screen-title">BEHIND THE FRAME.</h2><p class="screen-copy">I work across acting, filming and editing. Some pieces are performances; others are moments caught behind the camera. Each reel credits the part I played.</p><div class="film-role-strip"><span>ACT</span><span>SHOOT</span><span>EDIT</span><span>BEHIND THE SCENES</span></div>${action('film-index',`EXPLORE ${num(all.length)} REELS ↗`)}</div>`;
    return wrap('films-intro-page',body,`<div class="screen-footer"><span>ORIGINAL PICTURES / SELECT A REEL</span>${key('film-index','OPEN THE FILM INDEX →')}</div>`,'THE PROJECTION ROOM');
  }
  item=(item+all.length)%all.length;const f=all[item];
  if(playing){
    return `<section class="screen-page films-page film-running" aria-label="Film player">${header(f.title)}<div class="screen-content"><div class="video-stage"><video id="tv-video" controls playsinline preload="metadata" poster="${esc(safeUrl(f.poster))}" src="${esc(safeUrl(f.file))}" aria-label="${esc(f.title)}"></video><p class="video-error" id="video-error" hidden>We couldn't play this file. ${link(f.file,'Open the video')} or choose another film.</p></div></div><div class="screen-footer">${key('back','← FILM INDEX')}<span class="counter">${esc(f.duration)} / ${esc(f.role)}</span>${key('item-next','NEXT FILM →','aria-label="Next film"')}</div></section>`;
  }
  const descriptions=chunkText(f.description||f.role,capacity(.45));page=(page+descriptions.length)%descriptions.length;
  const body=`<div class="film-browse"><button class="film-poster" data-action="play-film" aria-label="Play ${esc(f.title)}">${image(f.poster,f.alt)}<span aria-hidden="true">▶</span><b class="film-print">SVM / MOTION PICTURES</b></button><div class="film-info"><p class="eyebrow">${esc(f.role)}</p><h2 class="screen-title">${esc(f.title)}</h2><p class="screen-copy">${esc(descriptions[page])}</p><p class="film-duration">${esc(f.duration)} <span> / </span> ${esc(f.format)}</p>${action('play-film','▶ ROLL THE FILM')}${descriptions.length>1?key('page-next',`MORE NOTES ${num(page+1)}/${num(descriptions.length)} →`):''}</div></div>`;
  return wrap('films-page',body,pager(item,all.length,'FILM'),'THE PROJECTION ROOM');
}

function drawAbout(){
  const a=content.about;const text=[a.intro,...a.paragraphs].filter(Boolean).join('\n\n');const pages=chunkText(text,capacity(.63));page=(page+pages.length)%pages.length;
  const body=`<div class="about-spread"><div class="about-photo">${image(a.portrait,content.profile.name)}</div><div class="about-text"><p class="eyebrow">MEET THE PERSON</p><h2 class="screen-title">${esc(a.title)}</h2><p class="screen-copy">${esc(pages[page])}</p>${image(a.signature,'Signature','signature')}${link(content.profile.resume,'READ MY RÉSUMÉ','small-copy')}</div></div>`;
  return wrap('about-page',body,pager(page,pages.length,'SIDE','page'),'A LITTLE ABOUT ME');
}

function skillPages(){return content.skills.flatMap((skill,i)=>[
  ...chunkText(skill.description,capacity(.75)).map(body=>({title:skill.title,body,index:i})),
  ...slices(skill.tools,gridCount()).map(tools=>({title:skill.title,tools,index:i}))
]);}
function drawSkills(){
  const pages=skillPages();if(!pages.length)return empty('The toolkit','The next programme is being prepared.');page=(page+pages.length)%pages.length;const scene=pages[page];
  const body=`<span class="skill-number" aria-hidden="true">${num(scene.index+1)}</span><p class="eyebrow">${scene.tools?'TOOLS OF THE TRADE':'WHAT I BRING TO THE TABLE'}</p><h2 class="screen-title">${esc(scene.title)}</h2>${scene.body?`<p class="screen-copy">${esc(scene.body)}</p>`:''}${scene.tools?`<div class="skill-tools">${scene.tools.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}`;
  return wrap('skill-page',body,pager(page,pages.length,'TRACK','page'),'THE TOOLKIT');
}

function journeyPages(){return content.journey.flatMap((j,index)=>chunkText(j.description,capacity(.65)).map(body=>({...j,body,index})));}
function drawJourney(){
  const pages=journeyPages();if(!pages.length)return empty('The story so far','A new chapter is on the way.');page=(page+pages.length)%pages.length;const j=pages[page];
  const body=`<div class="journey-line" aria-hidden="true">${content.journey.map((_,i)=>`<i class="${i===j.index?'active':''}"></i>`).join('')}</div><p class="journey-period">${esc(j.period)} / ${esc(j.type)}</p><h2 class="screen-title">${esc(j.title)}</h2><p class="journey-org">${esc(j.organization)}</p><p class="screen-copy">${esc(j.body)}</p>`;
  return wrap('journey-page',body,pager(page,pages.length,'CHAPTER','page'),'THE STORY SO FAR');
}

function drawContact(){
  const c=content.contact;const notes=chunkText(c.description,capacity(.4));page=(page+notes.length)%notes.length;const email=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(c.email)?c.email:'';
  const body=`<p class="eyebrow">${esc(c.label)}</p><h2 class="screen-title">${esc(c.title)}</h2><p class="screen-copy">${esc(notes[page])}</p>${email?`<a class="contact-email" href="mailto:${esc(email)}">${esc(email)}</a>`:''}<div class="contact-socials">${link(c.github,'GITHUB')}${link(c.linkedin,'LINKEDIN')}${link(c.resume,'RÉSUMÉ')}${email?key('copy-email','COPY EMAIL'):''}</div><p class="contact-status" id="contact-status" role="status"></p>`;
  return wrap('contact-page',body,notes.length>1?pager(page,notes.length,'NOTE','page'):`<div class="screen-footer"><span>THANK YOU FOR TUNING IN.</span>${key('channel-home','↺ REPLAY')}</div>`,'LET’S MAKE SOMETHING');
}
function empty(title,body){return wrap('empty-page',`<h2 class="screen-title serif">${esc(title)}</h2><p class="screen-copy">${esc(body)}</p>`,`<div class="screen-footer">${key('next-channel','TUNE TO NEXT CHANNEL →')}</div>`,'STAND BY');}
function drawServices(){
  const scenes=(content.services||[]).flatMap(s=>chunkText(s.description,capacity(.7)).map(body=>({title:s.title,body})));
  for(const review of (content.reviews||[]).filter(r=>r.enabled))for(const body of chunkText(review.text,capacity(.7)))scenes.push({title:'Client feedback',body,attribution:review.attribution});
  if(!scenes.length)return empty('Work with me','Get in touch to discuss your project.');
  page=(page+scenes.length)%scenes.length;const scene=scenes[page];
  return wrap('services-page',`<p class="eyebrow">LET’S BUILD SOMETHING USEFUL</p><h2 class="screen-title">${esc(scene.title)}</h2><p class="screen-copy">${esc(scene.body)}</p>${scene.attribution?`<p class="small-copy">— ${esc(scene.attribution)}</p>`:''}${action('channel-contact','DISCUSS YOUR PROJECT ↗')}`,pager(page,scenes.length,'SCENE','page'),'WORK WITH ME');
}

function haltVideo(){const v=$('#tv-video');if(v){v.pause();v.removeAttribute('src');v.load();}}
function clickSound(type='click'){document.dispatchEvent(new CustomEvent('portfolio:sfx',{detail:{type,enabled:sound}}));}
function syncSound(value){sound=Boolean(value);$('#sound-toggle').setAttribute('aria-pressed',String(sound));$('#sound-toggle').setAttribute('aria-label',sound?'Turn off tuning sounds':'Turn on tuning sounds');}
document.addEventListener('portfolio:sound',event=>{soundChosen=true;syncSound(event.detail?.enabled);});
function transition(){clearTimeout(transitionTimer);$('#crt').classList.remove('tuning');if(!reduced.matches&&content.appearance.transitionMs>0){void $('#crt').offsetWidth;$('#crt').classList.add('tuning');transitionTimer=setTimeout(()=>$('#crt').classList.remove('tuning'),content.appearance.transitionMs+30);}}

function render(animate=true){
  if(!content)return;
  const focused=($('#broadcast').contains(document.activeElement)||$('#cabinet-navigation')?.contains(document.activeElement))?document.activeElement.dataset.action:null;
  haltVideo();
  const renderers={home:drawHome,work:drawProject,films:drawFilms,about:drawAbout,skills:drawSkills,journey:drawJourney,contact:drawContact,services:drawServices};
  $('#broadcast').innerHTML=(renderers[channel]||drawHome)();
  arrangeTransport();
  if(animate)transition();
  $$('.channel-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.channel===channel)));
  const channelIndex=channels().findIndex(c=>c.id===channel);
  $('#dial-number').textContent=num(channelIndex+1);$('#channel-dial').style.setProperty('--dial-angle',`${channelIndex*43}deg`);
  $('#channel-cue').textContent=channels()[channelIndex]?.subtitle||'SELECT A PROGRAMME';
  $('#announcer').textContent=`${channels()[channelIndex]?.label||'Programme'}. ${$('#broadcast h1, #broadcast h2')?.textContent||''}`;
  if(focused){const same=$$('[data-action]').find(el=>el.dataset.action===focused);(same||$('[data-action]',$('#broadcast')))?.focus({preventScroll:true});}
  $('#broadcast').inert=!power;
  if(playing&&power){const v=$('#tv-video');if(v){v.addEventListener('error',()=>{$('#video-error').hidden=false;});v.play().catch(error=>{if(error.name!=='NotAllowedError'&&error.name!=='AbortError'&&$('#video-error'))$('#video-error').hidden=false;});}}
  updateDeck();drawPosters();
  requestAnimationFrame(fitText);
}
function arrangeTransport(){
  const host=$('#cabinet-navigation');if(!host)return;
  host.replaceChildren();
  const controls=$$('[data-action]',$('#broadcast')).filter(el=>/^(page|item)-(prev|next)$/.test(el.dataset.action));
  host.hidden=false;host.inert=!power;
  const label=document.createElement('span');label.className='transport-label';
  label.textContent=controls.some(c=>!c.disabled)?(playing?'TAPE TRANSPORT':detail?'FILE TRANSPORT':'PROGRAMME TRANSPORT'):'SINGLE PAGE';
  host.append(label);
  const keys=document.createElement('div');keys.className='transport-keys';
  const main=controls.filter(c=>c.dataset.action.startsWith(playing||channel==='work'&&!detail||channel==='films'?'item-':'page-'));
  for(const direction of ['prev','next']){
    const control=main.find(c=>c.dataset.action.endsWith(direction))||Object.assign(document.createElement('button'),{disabled:true});
    control.className='transport-key';
    control.type='button';
    control.textContent=direction==='prev'?'◀ PREV':'NEXT ▶';
    control.setAttribute('aria-label',direction==='prev'?'Previous slide':'Next slide');
    control.disabled=control.disabled||!power;
    keys.append(control);
  }
  host.append(keys);
  $$('.footer-actions',$('#broadcast')).forEach(el=>el.remove());
}
function fitText(){
  const area=$('.screen-content');if(!area||playing)return;
  // Keep exceptional editorial copy inside the television; pagination handles the body text.
  const targets=$$('.show-title,.screen-title,.detail-heading,.screen-copy,.home-subtitle',area);
  for(let attempt=0;attempt<8;attempt++){
    const box=area.getBoundingClientRect();const over=[...area.children].some(el=>el.getBoundingClientRect().bottom>box.bottom+2)||area.scrollHeight>area.clientHeight+3;
    if(!over)break;
    for(const el of targets){const size=parseFloat(getComputedStyle(el).fontSize);if(size>10)el.style.fontSize=`${Math.max(10,size*.92)}px`;}
  }
}
function tune(id){if(!channels().some(c=>c.id===id))return;clickSound('tune');channel=id;item=0;page=0;detail=false;playing=false;filmIntro=id==='films';if(!power)setPower(true,false);history.replaceState(null,'',`#${id}`);render();}
function nextChannel(direction=1){const all=channels();if(!all.length)return;const index=all.findIndex(c=>c.id===channel);tune(all[(index+direction+all.length)%all.length].id);}
function setPower(value,redraw=true){clickSound('power');power=value;$('#off-screen').hidden=power;$('#broadcast').inert=!power;if($('#cabinet-navigation')){$('#cabinet-navigation').inert=!power;$$('button',$('#cabinet-navigation')).forEach(b=>b.disabled=!power);}$('#power-button').setAttribute('aria-pressed',String(power));$('#power-button').setAttribute('aria-label',power?'Turn television off':'Turn television on');$('#deck-status').innerHTML=power?'<i></i>NOW TRANSMITTING':'<i></i>STAND BY';if(!power){haltVideo();playing=false;}else if(redraw)render();updateDeck();}

document.addEventListener('click',async event=>{
  const control=event.target.closest('[data-action]');if(!control)return;const name=control.dataset.action;
  if(control.disabled||(!power&&control.closest('#cabinet-navigation')))return;
  if(name.startsWith('channel-')){tune(name.slice(8));return;}
  if(name==='next-channel'){nextChannel();return;}
  if(name==='film-index'){clickSound('tape');filmIntro=false;item=0;page=0;render();return;}
  if(name==='copy-email'){clickSound();try{await navigator.clipboard.writeText(content.contact.email);$('#contact-status').textContent='ADDRESS COPIED. OVER TO YOU.';}catch{$('#contact-status').textContent='Select the address above to copy it.';}return;}
  clickSound(name==='play-film'?'tape':'click');
  if(name==='open-project'){detail=true;page=0;}
  else if(name==='play-film'){playing=true;}
  else if(name==='back'){detail=false;playing=false;page=0;}
  else if(name==='item-next'){item++;page=0;}
  else if(name==='item-prev'){item--;page=0;}
  else if(name==='page-next')page++;
  else if(name==='page-prev')page--;
  render();
});
$('#channel-buttons').addEventListener('click',event=>{const b=event.target.closest('[data-channel]');if(b)tune(b.dataset.channel);});
$('#channel-dial').addEventListener('click',()=>nextChannel());
function moveSlide(direction=1){if(!power)return;const controls=$$('#cabinet-navigation button');const control=controls[direction<0?0:1];if(control&&!control.disabled)control.click();else $('#announcer').textContent='Single page. No additional slides in this programme.';}
$('#slide-dial')?.addEventListener('click',()=>moveSlide());
for(const [id,move] of [['#channel-dial',nextChannel],['#slide-dial',moveSlide]])$(id)?.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();event.stopPropagation();move(['ArrowLeft','ArrowDown'].includes(event.key)?-1:1);}});
$('#power-button').addEventListener('click',()=>setPower(!power));$('#resume-power').addEventListener('click',()=>setPower(true));
$('#sound-toggle').addEventListener('click',()=>{syncSound(!sound);document.dispatchEvent(new CustomEvent('portfolio:sound',{detail:{enabled:sound}}));clickSound();});
$('#fullscreen-toggle').addEventListener('click',async()=>{clickSound();try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#room').requestFullscreen();}catch{$('#announcer').textContent='Fullscreen is unavailable in this browser.';}});
document.addEventListener('fullscreenchange',()=>{$('#fullscreen-toggle').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Expand television to fullscreen');});
document.addEventListener('keydown',event=>{
  if(!content||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('video,input,textarea,select'))return;
  if(event.key==='Escape'&&(detail||playing)){detail=false;playing=false;page=0;render();return;}
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    if(event.target.closest('#channel-buttons')||event.target===document.body){event.preventDefault();nextChannel(event.key==='ArrowLeft'?-1:1);$(`.channel-button[data-channel="${channel}"]`)?.focus({preventScroll:true});}
  }
});
$('#crt').addEventListener('touchstart',event=>{if(event.target.closest('video,button,a'))return;touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};},{passive:true});
$('#crt').addEventListener('touchend',event=>{if(!touchStart||playing)return;const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)<65||Math.abs(dy)>60)return;const suffix=dx<0?'next':'prev';const button=$(`[data-action="${detail||['about','skills','journey'].includes(channel)?'page':'item'}-${suffix}"]`);if(button&&!button.disabled)button.click();},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)$('#tv-video')?.pause();});
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(content&&id!==channel&&channels().some(c=>c.id===id))tune(id);});
addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!playing)render(false);},180);});

function updateDeck(){
  const deck=$('.channel-deck');if(!deck)return;
  if(!$('.vhs-fascia',deck)){
    const fascia=document.createElement('div');fascia.className='vhs-fascia';
    fascia.innerHTML='<div class="vhs-makers"><strong>SVM</strong><span>VIDEO CASSETTE RECORDER</span></div><div class="vhs-slot" aria-hidden="true"><span>INSERT A LITTLE CURIOSITY</span><i>VHS</i></div><div class="vhs-display"><span class="vhs-display-status">PLAY</span><strong id="vhs-channel-display">CH 01</strong><span id="vhs-title-display">HOME</span></div>';
    deck.prepend(fascia);
  }
  const index=channels().findIndex(c=>c.id===channel),selected=channels()[index];
  $('#vhs-channel-display').textContent=power?'CH '+num(index+1):'-- --';
  $('#vhs-title-display').textContent=power?(selected?.label||'HOME').toUpperCase():'STANDBY';
  $('.vhs-display-status').textContent=!power?'OFF':playing?'PLAY ▶':'READY';
  deck.classList.toggle('deck-standby',!power);
}
function drawPosters(){
  const posters=content.posters.filter(p=>p.enabled);
  const visibleFilms=films(),visibleProjects=projects();
  for(let i=0;i<2;i++){
    const host=$(i?'#poster-right':'#poster-left');const p=posters[i%Math.max(1,posters.length)];
    const quotes=(content.quotes||[]).filter(q=>q.enabled&&(q.side==='both'||q.side===(i?'right':'left')));
    if(quotes.length){
      const total=quotes.reduce((sum,q)=>sum+q.duration,0);let position=(performance.now()/1000+i*total/2)%total;
      const q=quotes.find(q=>{position-=q.duration;return position<0;})||quotes[0];
      host.hidden=false;host.classList.add('quote-frame');host.dataset.frame=q.frame;
      const fonts={serif:'Picture,Georgia,serif',mono:'Typewriter,monospace',display:'Broadcast,Georgia,serif'};
      const html=`<div class="quote-paper" style="color:${esc(q.color)};background:${esc(q.background)};--quote-font:${fonts[q.font]};--quote-size:${q.fontSize}px"><span class="quote-mark" aria-hidden="true">“</span><p>${esc(q.text)}</p><small>A LITTLE PERSPECTIVE</small></div>`;
      if(host.dataset.artwork!==html){host.dataset.artwork=html;host.innerHTML=html;host.classList.remove('poster-updated');void host.offsetWidth;host.classList.add('poster-updated');}continue;
    }
    host.classList.remove('quote-frame');delete host.dataset.frame;
    if(!p){host.hidden=true;continue;}host.hidden=false;
    const film=visibleFilms[(item+i)%Math.max(1,visibleFilms.length)];
    const project=visibleProjects[(item+i)%Math.max(1,visibleProjects.length)];
    const chosen=channel==='films'?film:channel==='work'?project:null;
    const fallback=chosen?(chosen.poster||chosen.thumbnail||''):(i?visibleFilms[(item+1)%Math.max(1,visibleFilms.length)]?.poster:content.profile.portrait);
    const src=(i?content.appearance.posterRight:content.appearance.posterLeft)||p.image||fallback;
    const label=chosen?.title||p.title;
    const destination=chosen?channel:p.channel;
    const html=`<button type="button" data-action="channel-${esc(destination)}" aria-label="${esc(label)} — tune to ${esc(destination)}">${src?image(src,label):`<strong>${esc(label)}</strong><span class="poster-symbol" aria-hidden="true">${i?'◉':'✳'}</span>`}<small class="poster-caption">${esc(label)}</small></button>`;
    if(host.dataset.artwork===html)continue;
    host.dataset.artwork=html;host.innerHTML=html;
    host.classList.remove('poster-updated');void host.offsetWidth;host.classList.add('poster-updated');
  }
}
function applyContent(first=false){
  const a=content.appearance,r=document.documentElement;
  for(const [field,css] of Object.entries({accent:'accent',cream:'cream',ink:'ink',teal:'teal',wood:'wood',buttonColor:'button',screenColor:'screen'}))r.style.setProperty(`--${css}`,a[field]);
  r.style.setProperty('--display',a.fontFamily==='serif'?'Picture,Georgia,serif':a.fontFamily==='mono'?'Typewriter,monospace':'Broadcast,Georgia,serif');
  r.style.setProperty('--tune-duration',`${a.transitionMs}ms`);
  $('#room').style.backgroundImage=a.wallImage?`url("${safeUrl(a.wallImage).replace(/["\\\n\r]/g,'')}")`:'none';
  $('.scanlines').hidden=!a.scanlines;
  $('#hardware-brand').textContent=content.profile.shortName;$('#room-sign').innerHTML=`${esc(content.profile.shortName)} <i>presents</i>`;$('#room-footer').textContent=content.profile.footer;$('#room-location').textContent=content.profile.location;
  document.title=`${content.profile.homeTitle} — ${content.profile.name}`;
  const all=channels();if(!all.some(c=>c.id===channel)){channel=all[0]?.id||'home';detail=false;playing=false;page=0;item=0;}
  $('#channel-buttons').style.setProperty('--channel-count',Math.max(1,all.length));
  $('#channel-buttons').innerHTML=all.map((c,i)=>`<button type="button" class="channel-button" data-channel="${c.id}" aria-label="Channel ${i+1}: ${esc(c.label)}" aria-pressed="${c.id===channel}" style="--key-color:${esc(c.color)}"><span><b>${num(i+1)}</b><small>${esc(c.label)}</small></span></button>`).join('');
  if(first&&!soundChosen)syncSound(a.soundEnabled);
  if(first&&channel==='films')filmIntro=true;
  updateDeck();drawPosters();
  render(!first);
}
async function refresh(first=false){
  if(fetching||document.hidden&&!first)return;fetching=true;
  try{const response=await fetch('/api/content',{cache:'no-store'});if(!response.ok)throw Error('Content unavailable');const next=await response.json();if(!content||next.revision!==content.revision){if(playing&&!first)return;content=next;if(first&&channels().some(c=>c.id===location.hash.slice(1)))channel=location.hash.slice(1);applyContent(first);}}
  catch(error){if(first){$('#broadcast').innerHTML=`<div class="loading-broadcast"><b>SVM</b><p>THE SIGNAL IS DOWN.</p><p>Start the local server and reload to tune in.</p><button class="screen-action" id="retry-signal">RETRY CONNECTION</button></div>`;$('#retry-signal').addEventListener('click',()=>refresh(true));}}
  finally{fetching=false;}
}
await refresh(true);
setInterval(()=>refresh(),4000);
setInterval(()=>{if(content&&!document.hidden&&!$('#room').inert)drawPosters();},500);

