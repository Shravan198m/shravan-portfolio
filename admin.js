import { upload as uploadToBlob } from 'https://esm.sh/@vercel/blob@2.9.0/client';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone = value => structuredClone(value);
const assetURL = value => typeof value === 'string' && (/^\/assets\/(?!.*(?:\.\.|\\))[^\s<>]+$/.test(value) || /^https:\/\/[^\s<>]+$/.test(value)) ? value : '';
const sections = [
  {id:'quotes',label:'Quote frames',icon:'❝',group:'CONTENT',description:'Original motivational lines, timed individually. Preview the frame before saving.',singular:'quote'},
  {id:'services',label:'Work with me',icon:'◇',description:'Your services and working process. Each entry becomes a slide.',singular:'service'},
  {id:'reviews',label:'Client feedback',icon:'☆',description:'Add genuine feedback only, with permission to publish. New reviews stay hidden until you enable them.',singular:'review'},
  {id:'overview',label:'Studio overview',icon:'◈',group:'WORKSPACE',description:'Your broadcast, at a glance.'},
  {id:'profile',label:'Identity & home',icon:'◉',group:'CONTENT',description:'Your name, introduction and the first thing visitors see on the television.'},
  {id:'projects',label:'Engineering',icon:'⌘',description:'Projects, results, technology, links and the images that tell their story.',singular:'project'},
  {id:'films',label:'Films & reels',icon:'▷',description:'Your film collection. Change videos, posters, credits, durations and descriptions.',singular:'film'},
  {id:'about',label:'About you',icon:'☺',description:'The person behind the work: your story, portrait and signature.'},
  {id:'skills',label:'The toolkit',icon:'✳',description:'Your capabilities and the tools you use to make things happen.',singular:'capability'},
  {id:'journey',label:'The journey',icon:'↗',description:'Experience, education, leadership and the learning in between.',singular:'milestone'},
  {id:'contact',label:'Contact & links',icon:'✉',description:'Where conversations begin. Keep your email, social links and résumé current.'},
  {id:'appearance',label:'Look & feel',icon:'◐',group:'THE SET',description:'Set the mood with room artwork, vintage colours, typography and television effects.'},
  {id:'channels',label:'Channel buttons',icon:'▦',description:'Rename, reorder, recolour or hide the television’s channel buttons.',singular:'channel'},
  {id:'posters',label:'Wall posters',icon:'▧',description:'The artwork around your TV. Give each poster its own image, words and destination.',singular:'poster'},
  {id:'media',label:'Media library',icon:'▣',group:'LIBRARY',description:'Your images, films and documents. Upload once, then use them throughout the portfolio.'},
  {id:'backups',label:'Export & restore',icon:'↧',description:'Keep a portable copy of your content or bring a previous export back into the studio.'}
];
const labels = {
  text:'Quote / feedback text',side:'Frame position',frame:'Frame finish',font:'Quote typeface',background:'Paper colour',fontSize:'Quote font size',attribution:'Approved attribution',
  name:'Full name', shortName:'Short name / initials',role:'Role or production credit',location:'Location',kicker:'Introductory line',homeTitle:'Opening title',homeSubtitle:'Opening subtitle',portrait:'Portrait image',resume:'Résumé document',footer:'Footer credit',
  wallImage:'Room background',posterLeft:'Left poster override',posterRight:'Right poster override',accent:'Accent colour',cream:'Cream / light tone',ink:'Ink / dark tone',teal:'Teal tone',wood:'Wood tone',buttonColor:'Button colour',screenColor:'TV screen colour',fontFamily:'Typography style',scanlines:'TV scanlines',transitionMs:'Channel transition duration',soundEnabled:'Channel sound',
  id:'Permanent ID',label:'Button / link label',subtitle:'Subtitle',color:'Button colour',enabled:'Visible on the portfolio',number:'Project number',title:'Title',category:'Category',year:'Year / status',theme:'Project colour theme',icon:'Fallback illustration',summary:'Short introduction',description:'Description',tags:'Technology labels',metric:'Result / status',metricLabel:'Result caption',overview:'Project overview',approach:'Approach & implementation',note:'Context / project note',flow:'Process or service steps',stack:'Full technology stack',links:'Project links',href:'Destination URL',thumbnail:'Project thumbnail',duration:'Display duration',file:'Video file',poster:'Video thumbnail / poster',format:'Video orientation',alt:'Image description',intro:'Opening paragraph',paragraphs:'Your story',signature:'Signature image',tools:'Tools & technologies',period:'Date / period',organization:'Organisation / institution',type:'Milestone category',email:'Email address',github:'GitHub link',linkedin:'LinkedIn link',image:'Poster artwork',channel:'Poster destination'
};
const help = {
  homeTitle:'The main title inside the TV. A short title makes the strongest opening.',homeSubtitle:'Appears with your opening title.',portrait:'Use an existing portrait or upload a replacement.',resume:'Choose a PDF document from the media library.',
  wallImage:'The artwork behind the television. A landscape image works best.',posterLeft:'Optional. Leave empty to use your first wall poster.',posterRight:'Optional. Leave empty to use your second wall poster.',scanlines:'A subtle analog texture over the television picture.',transitionMs:'Milliseconds, from 0 to 2000. Set 0 for an immediate switch.',soundEnabled:'Allows the television’s channel-change sound. Browser audio starts only after interaction.',
  enabled:'Turn off to keep this entry saved without showing it to visitors.',id:'Used to keep this entry connected. Generated automatically and cannot be edited.',
  thumbnail:'Optional. Without an image, the TV uses the project’s illustration.',metric:'A supported result, number or honest project status.',note:'Add context for results, prototypes or ongoing work.',flow:'One step or service per line. Order matters.',tags:'One short label per line.',stack:'One technology or technique per line.',tools:'One tool or technology per line.',
  duration:'Shown on screen, for example 00:19 or 01:05. Update when replacing a film.',file:'Required for films. Select an MP4 or WebM video.',poster:'The image shown before playback. You can upload a custom thumbnail.',alt:'Describe the image for visitors using assistive technology.',format:'Choose the orientation of the playable video.',
  paragraphs:'One paragraph per entry, presented as scenes inside the television.',href:'Use a complete https:// address.',github:'Use the full https:// profile address.',linkedin:'Use the full https:// profile address.',image:'Optional. Leave empty for a typographic poster.',channel:'Choose the TV channel this poster should open.',fontFamily:'Retro combines vintage display lettering and typewriter details.'
};
const colorKeys = new Set(['accent','cream','ink','teal','wood','buttonColor','screenColor','color','background']);
const assetKeys = new Set(['portrait','resume','wallImage','posterLeft','posterRight','thumbnail','file','poster','signature','image']);
const longKeys = new Set(['homeTitle','homeSubtitle','description','overview','approach','note','summary','intro','footer','text']);
const arraySections = new Set(['projects','films','skills','journey','channels','posters','quotes','services','reviews']);
const limits = {projects:100,films:100,skills:50,journey:100,posters:20,quotes:100,services:30,reviews:50};
const newID = prefix => `${prefix}-${crypto.randomUUID().slice(0,8)}`;
const templates = {
  quotes:()=>({id:newID('quote'),text:'A little progress, every day.',side:'both',duration:10,frame:'wood',font:'serif',color:'#35291d',background:'#e7d5ad',fontSize:24,enabled:true}),
  services:()=>({title:'New service',description:'Describe what you can deliver and how you work.'}),
  reviews:()=>({id:newID('review'),text:'Replace with genuine feedback, shared with permission.',attribution:'Client — name withheld with permission',enabled:false}),
  projects:()=>({id:newID('project'),number:'',title:'Untitled project',category:'',year:'',theme:'olive',icon:'code',summary:'',description:'',role:'',tags:[],metric:'',metricLabel:'',overview:'',approach:'',note:'',flow:[],stack:[],links:[],thumbnail:'',enabled:true}),
  films:()=>({id:newID('film'),title:'Untitled film',role:'',duration:'00:00',file:'',poster:'',format:'Landscape',alt:'',description:'',enabled:true}),
  skills:()=>({title:'New capability',description:'',tools:[]}),
  journey:()=>({period:'',title:'New milestone',organization:'',description:'',type:'Experience'}),
  posters:()=>({title:'NEW POSTER',subtitle:'',image:'',channel:'home',enabled:true}),
  links:()=>({label:'View project',href:''})
};
let saved, draft, token = '', currentSection = 'overview', selected = {}, dirty = false, saving = false, mediaFiles = [], mediaTarget = null, mediaQuery = '', mediaType = 'all', uploadBusy = false, confirmationResolve = null, confirmOrigin = null, mediaOrigin = null;

function at(path) { return path.split('.').reduce((value,key)=>value?.[key],draft); }
function put(path,value) {
  const keys = path.split('.');
  if (keys.some(k=>['__proto__','constructor','prototype'].includes(k))) return;
  const last = keys.pop();
  const target = keys.reduce((value,key)=>value[key],draft);
  target[last] = value;
}
function human(key){ return labels[key] || key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()); }
function fmtBytes(size){ if(size<1024)return `${size} B`; if(size<1048576)return `${(size/1024).toFixed(0)} KB`; return `${(size/1048576).toFixed(1)} MB`; }
function itemTitle(item,index){ return item.title || item.label || item.name || item.text?.slice(0,55) || `Entry ${index+1}`; }
function itemSubtitle(item){ return item.category || item.role || item.period || item.subtitle || item.type || ''; }
function sectionInfo(){ return sections.find(s=>s.id===currentSection); }
function notice(message,kind='success') {
  const el=$('#global-notice');
  el.className=`notice ${kind==='success'?'':kind}`;
  el.textContent=message;
  el.hidden=!message;
}
function updateChrome() {
  if (!saved || !draft) return;
  dirty = JSON.stringify(draft)!==JSON.stringify(saved);
  $('#save-button').disabled = !dirty || saving || uploadBusy;
  $('#discard-button').disabled = !dirty || saving || uploadBusy;
  $('#save-button').innerHTML = saving ? '<span class="save-icon">◌</span> Saving…' : '<span class="save-icon">↥</span> Save to portfolio';
  $('#save-state').className = dirty?'dirty':'';
  $('#save-state').innerHTML = `<i></i>${saving?'Saving your changes…':uploadBusy?'Uploading media…':dirty?'Unsaved changes':'All changes saved'}`;
  $('#revision-label').textContent=`LOCAL STORAGE / REVISION ${saved.revision}`;
  document.title = `${dirty?'• ':''}Control Room — Portfolio Editor`;
}
function changed(){ updateChrome(); syncCollectionLabels(); if(currentSection==='appearance') syncThemePreview(); }

async function request(url,options={}) {
  const response = await fetch(url,{cache:'no-store',...options});
  if(response.status===401){dirty=false;location.assign('/login.html');throw new Error('Your session expired. Please sign in again.');}
  const data = await response.json().catch(()=>({error:`Request failed (${response.status})`}));
  if (!response.ok) {const error=new Error(typeof data.error==='string'?data.error:`Request failed (${response.status})`);error.status=response.status;throw error;}
  return data;
}
async function session(){ token=(await request('/api/admin/session')).token; }
async function mutate(url,options){
  if(!token) await session();
  const run=()=>request(url,{...options,headers:{...options.headers,'X-Admin-Token':token}});
  try{return await run();}catch(error){if(error.status!==403)throw error;await session();return run();}
}
async function loadContent(){
  [saved] = await Promise.all([request('/api/content'),session()]);
  draft=clone(saved);
  renderNav();renderPage();updateChrome();
}

function renderNav(){
  $('#section-nav').innerHTML=sections.map(section=>`${section.group?`<div class="nav-group">${section.group}</div>`:''}<button class="nav-button ${currentSection===section.id?'active':''}" data-section="${section.id}" ${currentSection===section.id?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${section.icon}</span><span>${section.label}</span>${Array.isArray(draft?.[section.id])?`<span class="nav-count">${draft[section.id].length}</span>`:''}</button>`).join('');
}
function go(section){
  if(saving||uploadBusy)return;
  currentSection=section;notice('');renderNav();renderPage();
  history.replaceState(null,'',`/admin#${section}`);
  window.scrollTo({top:0,behavior:'instant'});
}
function heading(info,action=''){
  return `<div class="page-heading"><div><span class="eyebrow">CONTROL ROOM / ${esc(info.label.toUpperCase())}</span><h1>${esc(info.label)}</h1><p>${esc(info.description)}</p></div>${action}</div>`;
}
function renderPage(){
  const info=sectionInfo();
  if(!info)return;
  if(currentSection==='overview') return renderOverview();
  if(currentSection==='media') return renderMediaSection();
  if(currentSection==='backups') return renderBackups();
  if(arraySections.has(currentSection)) return renderCollection();
  const theme=currentSection==='appearance'?`<div class="theme-preview" id="theme-preview"><div><h3>${esc(draft.profile.homeTitle||'Your television')}</h3><p>A LITTLE COLOUR. A WHOLE DIFFERENT MOOD.</p></div><div class="preview-keys" aria-hidden="true"><i></i><i></i><i></i></div></div>`:'';
  $('#editor').innerHTML=heading(info)+theme+`<section class="editor-panel"><div class="panel-heading"><div><h2>${currentSection==='appearance'?'Art direction':currentSection==='profile'?'Your opening credits':currentSection==='about'?'The story so far':'Keep in touch'}</h2><p>Edits stay in your draft until you save.</p></div></div><div class="panel-body"><div class="fields-grid">${objectFields(draft[currentSection],currentSection)}</div></div></section>`;
  if(currentSection==='appearance')syncThemePreview();
}
function renderOverview(){
  $('#editor').innerHTML=heading(sectionInfo())+`<section class="overview-banner"><div><h2>Welcome back, ${esc(draft.profile.shortName||draft.profile.name)}.</h2><p>This is the place behind the picture. Update your stories, add something new, or give the whole room a different mood.</p></div><a class="button" href="/" target="_blank" rel="noopener">View your portfolio ↗</a></section><div class="stats"><div class="stat"><strong>${draft.projects.length.toString().padStart(2,'0')}</strong><span>ENGINEERING PROJECTS</span></div><div class="stat"><strong>${draft.films.length.toString().padStart(2,'0')}</strong><span>FILMS & REELS</span></div><div class="stat"><strong>${draft.channels.filter(c=>c.enabled).length.toString().padStart(2,'0')}</strong><span>CHANNELS ON AIR</span></div><div class="stat"><strong>${draft.journey.length.toString().padStart(2,'0')}</strong><span>JOURNEY MILESTONES</span></div></div><div class="quick-grid"><button class="quick-card" data-section="projects"><span>⌘</span><div><h3>Give your work the spotlight</h3><p>Add a project, update its results, or replace a thumbnail.</p></div></button><button class="quick-card" data-section="films"><span>▷</span><div><h3>Something new to watch?</h3><p>Bring a film or reel into the collection, complete with its own poster.</p></div></button><button class="quick-card" data-section="appearance"><span>◐</span><div><h3>Set the scene</h3><p>Change the room, colours, typography and analog effects.</p></div></button><button class="quick-card" data-section="media"><span>▣</span><div><h3>Your media, all together</h3><p>Upload images, videos and documents, then reuse them anywhere.</p></div></button></div><div class="overview-note"><strong>HOW SAVING WORKS</strong><p>Your changes are saved to this computer when you choose “Save to portfolio”. The public television reads that saved content. Keep a JSON export in Export & restore for a portable content backup.</p></div>`;
}

function objectFields(object,path){
  return Object.entries(object).map(([key,value])=>field(value,`${path}.${key}`,key)).join('');
}
function field(value,path,key){
  const id=`f-${path.replaceAll('.','-')}`;
  const label=path.startsWith('quotes.')&&key==='color'?'Quote text colour':path.startsWith('quotes.')&&key==='duration'?'Display duration (seconds)':human(key);
  const hint=path.startsWith('quotes.')&&key==='duration'?'Seconds before this quote changes: 3–120.':path.startsWith('quotes.')&&key==='fontSize'?'12–40 pixels at maximum size. The public frame scales with the screen.':help[key]||'';
  const helpMarkup=hint?`<span class="help" id="${id}-help">${esc(hint)}</span>`:'';
  const described=hint?`aria-describedby="${id}-help"`:'';
  if(typeof value==='boolean')return `<label class="switch-field" for="${id}"><span><span class="field-label">${esc(label)}</span>${hint?`<span class="help">${esc(hint)}</span>`:''}</span><span class="switch"><input id="${id}" data-path="${path}" type="checkbox" ${value?'checked':''}><span class="switch-track"></span></span></label>`;
  if(Array.isArray(value)){
    if(key==='links')return nestedArray(value,path,key);
    if(key==='paragraphs')return nestedArray(value,path,key);
    return `<label class="field full" for="${id}"><span class="field-label">${esc(label)}<span class="optional">ONE PER LINE</span></span><textarea id="${id}" data-path="${path}" data-kind="string-array" rows="${Math.min(7,Math.max(3,value.length))}" ${described}>${esc(value.join('\n'))}</textarea>${helpMarkup}</label>`;
  }
  if(value&&typeof value==='object')return `<div class="nested-array"><div class="nested-header"><span>${esc(label)}</span></div><div class="fields-grid">${objectFields(value,path)}</div></div>`;
  if(assetKeys.has(key)){
    const kind=key==='file'?'video':key==='resume'?'document':'image';
    return `<div class="field full" data-asset-field="${path}"><label class="field-label" for="${id}">${esc(label)}${key!=='file'?'<span class="optional">OPTIONAL</span>':''}</label><div class="asset-field"><div class="asset-preview" id="${id}-preview">${assetPreview(value,kind)}</div><input id="${id}" class="asset-url" data-path="${path}" type="text" value="${esc(value)}" placeholder="/assets/filename or https://…" ${described}><div class="asset-controls"><button class="button secondary" data-choose="${path}" data-media-kind="${kind}">Choose / upload ${kind==='document'?'document':kind}</button><button class="button secondary" data-clear-asset="${path}" ${!value?'disabled':''}>Clear</button>${assetURL(value)?`<a class="button secondary" href="${esc(assetURL(value))}" target="_blank" rel="noopener">Open file ↗</a>`:''}</div></div>${helpMarkup}</div>`;
  }
  if(colorKeys.has(key))return `<div class="field"><label class="field-label" for="${id}">${esc(label)}</label><div class="color-control"><input type="color" data-path="${path}" value="${/^#[0-9a-f]{6}$/i.test(value)?esc(value):'#000000'}" aria-label="Choose ${esc(label.toLowerCase())}"><input id="${id}" type="text" data-path="${path}" value="${esc(value)}" pattern="#[0-9a-fA-F]{6}" maxlength="7" spellcheck="false" aria-label="${esc(label)} hex value"></div></div>`;
  let choices;
  if(key==='side')choices=[['left','Left frame'],['right','Right frame'],['both','Both frames']];
  if(key==='frame')choices=[['wood','Walnut wood'],['brass','Aged brass'],['black','Black gallery']];
  if(key==='font')choices=[['serif','Classic serif'],['mono','Typewriter'],['display','Vintage display']];
  if(key==='fontFamily')choices=[['retro','Retro — vintage display & typewriter'],['serif','Classic serif'],['mono','Typewriter / monospace']];
  if(key==='format')choices=[['Landscape','Landscape'],['Portrait','Portrait']];
  if(key==='theme')choices=['olive','rust','teal','plum','sand'].map(s=>[s,s[0].toUpperCase()+s.slice(1)]);
  if(key==='icon')choices=[['eye','Eye / vision'],['network','Connected services'],['waves','Waves / imaging'],['cross','Health / cross'],['code','Code brackets']];
  if(key==='channel')choices=draft.channels.map(c=>[c.id,c.label]);
  if(choices)return `<label class="field" for="${id}"><span class="field-label">${esc(label)}</span><select id="${id}" data-path="${path}" ${described}>${choices.map(([v,l])=>`<option value="${esc(v)}" ${value===v?'selected':''}>${esc(l)}</option>`).join('')}</select>${helpMarkup}</label>`;
  if(typeof value==='number')return `<label class="field" for="${id}"><span class="field-label">${esc(label)}</span><input type="number" id="${id}" data-path="${path}" value="${value}" min="${key==='fontSize'?12:path.startsWith('quotes.')&&key==='duration'?3:0}" max="${key==='fontSize'?40:path.startsWith('quotes.')&&key==='duration'?120:2000}" step="1" ${described}>${helpMarkup}</label>`;
  const multiline=longKeys.has(key)||String(value).includes('\n')||String(value).length>160;
  const inputType=key==='email'?'email':'text';
  return `<label class="field ${multiline?'full':''}" for="${id}"><span class="field-label">${esc(label)}${key==='id'?'<span class="optional">READ ONLY</span>':''}</span>${multiline?`<textarea id="${id}" data-path="${path}" rows="${['overview','approach','description','note'].includes(key)?5:3}" ${described}>${esc(value)}</textarea>`:`<input type="${inputType}" id="${id}" data-path="${path}" value="${esc(value)}" ${key==='id'?'readonly':''} ${described}>`}${helpMarkup}</label>`;
}
function assetPreview(value,kind){
  const url=assetURL(value);
  if(!url)return '<span>No media selected</span>';
  if(kind==='video')return `<video src="${esc(url)}" controls preload="metadata" playsinline aria-label="Selected video preview"></video>`;
  if(kind==='document')return '<span>PDF DOCUMENT<br>Use Open file to read the document.</span>';
  return `<img src="${esc(url)}" alt="Selected image preview" loading="lazy">`;
}
function nestedArray(items,path,key){
  return `<div class="nested-array"><div class="nested-header"><div><span>${esc(human(key))}</span><p>${esc(help[key]||(key==='links'?'Add the source, live demo or supporting material.':''))}</p></div><button class="button secondary" data-add-nested="${path}" data-kind="${key}">+ Add ${key==='links'?'link':'paragraph'}</button></div>${items.length?items.map((item,index)=>`<div class="nested-card"><div class="nested-card-head"><span>${key==='links'?'LINK':'PARAGRAPH'} ${String(index+1).padStart(2,'0')}</span><div class="collection-actions"><button class="icon-button" data-move-nested="${path}" data-index="${index}" data-direction="-1" aria-label="Move ${key==='links'?'link':'paragraph'} ${index+1} up" ${index===0?'disabled':''}>↑</button><button class="icon-button" data-move-nested="${path}" data-index="${index}" data-direction="1" aria-label="Move ${key==='links'?'link':'paragraph'} ${index+1} down" ${index===items.length-1?'disabled':''}>↓</button><button class="icon-button danger-icon" data-remove-nested="${path}" data-index="${index}" aria-label="Remove ${key==='links'?'link':'paragraph'} ${index+1}">×</button></div></div>${typeof item==='string'?`<label class="field"><span class="field-label">Paragraph text</span><textarea data-path="${path}.${index}" rows="4">${esc(item)}</textarea></label>`:`<div class="fields-grid">${objectFields(item,`${path}.${index}`)}</div>`}</div>`).join(''):'<div class="nested-empty">No entries yet. Add one when you are ready.</div>'}</div>`;
}
function renderCollection(){renderCollectionBody();syncQuotePreview();}
function renderCollectionBody(){
  const info=sectionInfo(),items=draft[currentSection];
  const index=Math.min(Math.max(0,selected[currentSection]||0),items.length-1);
  selected[currentSection]=Math.max(0,index);
  const canAdd=currentSection!=='channels';
  const add=canAdd?`<button class="button primary" data-add-item>+ Add ${info.singular}</button>`:'';
  if(!items.length){$('#editor').innerHTML=heading(info,add)+`<div class="empty-panel"><h2>A new story starts here.</h2><p>No ${info.label.toLowerCase()} entries are saved yet. Add your first ${info.singular} to get started.</p>${add}</div>`;return;}
  const item=items[index];
  $('#editor').innerHTML=heading(info,add)+`<div class="collection-layout"><aside class="collection-sidebar" aria-label="${esc(info.label)} entries"><div class="collection-summary"><span>${items.length} ${items.length===1?'ENTRY':'ENTRIES'}</span><span>SELECT TO EDIT</span></div><div class="collection-list">${collectionList(items,index)}</div></aside><section class="editor-panel"><div class="panel-heading"><div><h2 id="item-heading">${esc(itemTitle(item,index))}</h2><p>Entry ${index+1} of ${items.length}${item.enabled===false?' · Hidden from visitors':''}</p></div><div class="collection-actions"><button class="icon-button" data-move-item="-1" aria-label="Move entry up" ${index===0?'disabled':''}>↑</button><button class="icon-button" data-move-item="1" aria-label="Move entry down" ${index===items.length-1?'disabled':''}>↓</button>${canAdd?'<button class="button secondary" data-duplicate-item>Duplicate</button><button class="icon-button danger-icon" data-delete-item aria-label="Delete entry">×</button>':''}</div></div><div class="panel-body"><div class="fields-grid">${objectFields(item,`${currentSection}.${index}`)}</div></div></section></div>`;
}
function collectionList(items,index){return items.map((item,i)=>`<button class="collection-item ${i===index?'selected':''}" data-select-item="${i}" ${i===index?'aria-current="true"':''}><span class="item-index">${String(i+1).padStart(2,'0')}</span><span class="item-label"><span class="item-title">${esc(itemTitle(item,i))}</span><span class="item-subtitle">${esc(itemSubtitle(item))}</span></span>${'enabled' in item?`<span class="item-status ${item.enabled===false?'off':''}" title="${item.enabled===false?'Hidden':'Visible'}"></span>`:''}</button>`).join('');}
function syncQuotePreview(){
  if(currentSection!=='quotes')return;const q=draft.quotes[selected.quotes||0];if(!q)return;
  let host=$('#quote-preview');if(!host){host=document.createElement('div');host.id='quote-preview';host.className='quote-preview';$('.panel-body')?.prepend(host);}
  const color=/^#[0-9a-f]{6}$/i.test(q.color)?q.color:'#35291d',paper=/^#[0-9a-f]{6}$/i.test(q.background)?q.background:'#e7d5ad';
  const font={serif:'Picture, Georgia, serif',mono:'Typewriter, monospace',display:'Broadcast, Georgia, serif'}[q.font]||'Georgia, serif';
  host.innerHTML=`<div class="quote-preview-room"><div class="quote-preview-frame ${['wood','brass','black'].includes(q.frame)?q.frame:'wood'}"><div style="background:${paper};color:${color};font-family:${font};font-size:${Math.max(12,Math.min(40,Number(q.fontSize)||24))}px"><span aria-hidden="true">❝</span><p>${esc(q.text)}</p><small>SVM / A LITTLE PERSPECTIVE</small></div></div></div><p class="help">Frame preview · ${esc(q.side)} · ${esc(q.duration)} seconds. Colours and type match the public frame; size adapts to the visitor’s screen.</p>`;
}
function syncCollectionLabels(){
  if(!arraySections.has(currentSection))return;
  const items=draft[currentSection],index=selected[currentSection]||0;
  if($('.collection-list'))$('.collection-list').innerHTML=collectionList(items,index);
  if($('#item-heading')&&items[index])$('#item-heading').textContent=itemTitle(items[index],index);
}
function syncThemePreview(){
  const el=$('#theme-preview');if(!el)return;
  for(const [key,css] of [['wood','wood'],['cream','cream'],['accent','accent'],['teal','teal'],['buttonColor','button']])if(/^#[0-9a-f]{6}$/i.test(draft.appearance[key]))el.style.setProperty(`--preview-${css}`,draft.appearance[key]);
}

function filterFiles(){return mediaFiles.filter(file=>{
  const matchesText=file.name.toLowerCase().includes(mediaQuery.toLowerCase());
  const kind=file.type.startsWith('image/')?'image':file.type.startsWith('video/')?'video':'document';
  return matchesText&&(mediaType==='all'||mediaType===kind);
});}
function mediaGrid(picker=false){
  const files=filterFiles();
  if(!files.length)return '<div class="media-empty">No matching files. Try another search or upload a new file.</div>';
  return files.map(file=>{
    const index=mediaFiles.indexOf(file),url=assetURL(file.url),image=file.type.startsWith('image/'),video=file.type.startsWith('video/');
    const inside=`<div class="media-thumb">${image&&url?`<img src="${esc(url)}" alt="" loading="lazy">`:`<span class="media-type-icon" aria-hidden="true">${video?'▷':'▤'}</span>`}</div><div class="media-card-details"><strong>${esc(file.name)}</strong><small>${esc(file.type.split('/')[1].toUpperCase())} / ${fmtBytes(file.size)}</small></div>`;
    const uploaded=file.uploaded||file.url.startsWith('/assets/uploads/');
    return `<article class="media-card">${picker?`<button class="media-choice" data-pick-media="${index}" aria-label="Choose ${esc(file.name)}">${inside}</button>`:`<a class="media-choice" href="${esc(url)}" target="_blank" rel="noopener" aria-label="Open ${esc(file.name)}">${inside}</a>`}<div class="media-card-footer"><span>${uploaded?'UPLOADED':'ORIGINAL'}</span>${picker?`<span class="eyebrow">SELECT ↑</span>`:`<button class="icon-button" data-copy-media="${index}" aria-label="Copy URL for ${esc(file.name)}">⧉</button>${uploaded?`<button class="icon-button danger-icon" data-delete-media="${index}" aria-label="Delete ${esc(file.name)}">×</button>`:''}`}</div></article>`;
  }).join('');
}
async function refreshMedia(){mediaFiles=(await request('/api/media')).files;return mediaFiles;}
async function renderMediaSection(){
  mediaQuery='';mediaType='all';
  $('#editor').innerHTML=heading(sectionInfo())+`<section class="media-section"><div class="media-tools"><label class="search-field"><span>⌕</span><input id="library-search" type="search" placeholder="Search filenames" aria-label="Search media filenames"></label><select id="library-filter" aria-label="Filter media type"><option value="all">All media</option><option value="image">Images</option><option value="video">Videos</option><option value="document">Documents</option></select><label class="button primary upload-label" tabindex="0" role="button">Upload file <span>↑</span><input id="library-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,application/pdf" hidden></label></div><div class="library-status" id="library-status" role="status">Loading your media…</div><div class="media-grid" id="library-grid"></div><p class="media-note">PNG, JPEG, WebP, GIF, AVIF, MP4, WebM and PDF · Maximum 128 MB per file.<br>Original media is preserved. Uploaded files can be removed only when they are no longer used in saved content. Choose media from an image or video field to attach it to an entry.</p></section>`;
  try{await refreshMedia();if(currentSection!=='media')return;$('#library-grid').innerHTML=mediaGrid();$('#library-status').textContent=`${mediaFiles.length} files in your local library.`;}catch(error){if($('#library-status'))$('#library-status').textContent=error.message;}
}
async function openMedia(path,kind,origin){
  mediaTarget=path;mediaType=kind||'all';mediaQuery='';mediaOrigin=origin;
  $('#media-search').value='';$('#media-filter').value=mediaType;
  $('#media-title').textContent=`Choose ${kind==='document'?'document':kind||'media'}`;
  $('#media-help').textContent=`Choose an existing ${kind||'file'} for ${human(path.split('.').at(-1)).toLowerCase()}, or upload a replacement. Maximum 128 MB.`;
  $('#media-picker-grid').innerHTML='<div class="media-empty">Loading your library…</div>';
  $('#media-picker-status').textContent='';
  $('#media-dialog').showModal();$('#media-search').focus();
  try{await refreshMedia();$('#media-picker-grid').innerHTML=mediaGrid(true);}catch(error){$('#media-picker-status').textContent=error.message;}
}
function closeMedia(){if(uploadBusy)return;$('#media-dialog').close();mediaTarget=null;mediaOrigin?.focus();}
function selectMedia(index){
  const file=mediaFiles[index];if(!file||!mediaTarget)return;
  const key=mediaTarget.split('.').at(-1);
  const expected=key==='file'?'video/':key==='resume'?'application/pdf':'image/';
  if(!file.type.startsWith(expected)){$('#media-picker-status').textContent=`Please choose ${key==='file'?'a video':key==='resume'?'a PDF document':'an image'} for this field.`;return;}
  const target=mediaTarget;
  put(target,file.url);closeMedia();changed();renderPage();
  $$('[data-choose]').find(button=>button.dataset.choose===target)?.focus();
}
async function upload(file,picker=false){
  if(!file||uploadBusy)return;
  const status=picker?$('#media-picker-status'):$('#library-status');
  if(file.size>128*1024*1024){status.textContent='This file is larger than 128 MB. Choose a smaller file.';return;}
  const allowed=['image/png','image/jpeg','image/webp','image/gif','image/avif','video/mp4','video/webm','application/pdf'];
  if(!allowed.includes(file.type)){status.textContent='Choose a PNG, JPEG, WebP, GIF, AVIF, MP4, WebM or PDF file.';return;}
  if(picker&&mediaTarget){const key=mediaTarget.split('.').at(-1),expected=key==='file'?'video/':key==='resume'?'application/pdf':'image/';if(!file.type.startsWith(expected)){status.textContent=`This field needs ${key==='file'?'a video':key==='resume'?'a PDF document':'an image'}.`;return;}}
  uploadBusy=true;updateChrome();status.textContent=`Uploading ${file.name} (${fmtBytes(file.size)})…`;
  try{
    if(!token)await session();
    const filename=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._ -]+/g,'-').replace(/\s+/g,'-').slice(0,100)||'media';
    const created=await uploadToBlob(`svm-portfolio/uploads/${crypto.randomUUID()}-${filename}`,file,{access:'public',handleUploadUrl:'/api/media/upload',clientPayload:JSON.stringify({type:file.type}),headers:{'X-Admin-Token':token},multipart:file.size>4*1024*1024});
    await refreshMedia();
    uploadBusy=false;
    if(picker&&mediaTarget){const target=mediaTarget;put(target,created.url);closeMedia();changed();renderPage();$$('[data-choose]').find(button=>button.dataset.choose===target)?.focus();notice(`Uploaded and selected ${created.pathname.split('/').at(-1)}. Save your changes to use it on the portfolio.`);}
    else if(currentSection==='media'){$('#library-grid').innerHTML=mediaGrid();status.textContent=`Uploaded ${created.pathname.split('/').at(-1)}. ${mediaFiles.length} files in your library.`;}
  }catch(error){status.textContent=error.message;}
  finally{uploadBusy=false;updateChrome();}
}

function confirmAction(title,description,accept='Confirm'){
  if(confirmationResolve)return Promise.resolve(false);
  confirmOrigin=document.activeElement;
  $('#confirm-title').textContent=title;$('#confirm-description').textContent=description;$('#confirm-accept').textContent=accept;
  $('#confirm-dialog').showModal();$('#confirm-cancel').focus();
  return new Promise(resolve=>{confirmationResolve=resolve;});
}
function finishConfirm(accepted){const resolve=confirmationResolve;confirmationResolve=null;$('#confirm-dialog').close();confirmOrigin?.focus();resolve?.(accepted);}

function renderBackups(){
  $('#editor').innerHTML=heading(sectionInfo())+`<div class="backup-grid"><section class="backup-card"><span>↧</span><h2>Take a copy with you.</h2><p>Export the current editor content as a JSON file. This includes your draft changes, all text, styling and media references.</p><button class="button primary" data-export>Export content JSON</button></section><section class="backup-card"><span>↥</span><h2>Bring a version back.</h2><p>Import a JSON file exported from this editor. You can review the restored content before saving it to the portfolio.</p><button class="button secondary" data-import>Choose a JSON file</button></section></div><div class="backup-note"><strong>A content export does not contain media files.</strong><br>Your export keeps the file paths. To move the whole portfolio to another computer, copy the project’s assets and storage folders along with its source. The server also keeps a local content backup each time you save.</div>`;
}
function exportData(value=draft){
  const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`svm-portfolio-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function validateShape(value){
  const expected=['revision','profile','appearance','channels','projects','films','about','skills','journey','contact','posters','quotes','services','reviews'];
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Choose a portfolio content JSON object.');
  const actual=Object.keys(value);
  if(actual.length!==expected.length||expected.some(key=>!(key in value)))throw new Error('This file does not contain all the required portfolio sections.');
  const walk=(input,template,path)=>{
    if(Array.isArray(template)){
      if(!Array.isArray(input))throw new Error(`${path} must be a list.`);
      const key=path.split('.').at(-1);
      const example=template[0]??(templates[key]?templates[key]():key==='paragraphs'||['tags','stack','flow','tools'].includes(key)?'':null);
      if(example!==null)input.forEach((item,index)=>walk(item,example,`${path}.${index}`));
    } else if(template&&typeof template==='object'){
      if(!input||typeof input!=='object'||Array.isArray(input))throw new Error(`${path} must be an object.`);
      const keys=Object.keys(template),inputKeys=Object.keys(input);
      if(inputKeys.length!==keys.length||keys.some(key=>!Object.hasOwn(input,key))||inputKeys.some(key=>['__proto__','constructor','prototype'].includes(key)))throw new Error(`${path} has missing or unsupported fields.`);
      keys.forEach(key=>walk(input[key],template[key],`${path}.${key}`));
    } else if(typeof input!==typeof template)throw new Error(`${path} has the wrong data type.`);
  };
  expected.forEach(key=>walk(value[key],saved[key],key));
}
function validateContent(value){
  const errors=[];
  value.quotes.forEach((q,i)=>{if(!q.text.trim()||q.text.length>240)errors.push(`Quote ${i+1}: enter 1–240 characters.`);if(!Number.isInteger(q.duration)||q.duration<3||q.duration>120)errors.push(`Quote ${i+1}: duration must be 3–120 seconds.`);if(!Number.isInteger(q.fontSize)||q.fontSize<12||q.fontSize>40)errors.push(`Quote ${i+1}: font size must be 12–40.`);for(const [key,values] of Object.entries({side:['left','right','both'],frame:['wood','brass','black'],font:['serif','mono','display']}))if(!values.includes(q[key]))errors.push(`Quote ${i+1}: unsupported ${key}.`);});
  value.reviews.forEach((r,i)=>{if(!r.text.trim()||r.text.length>2000||!r.attribution.trim()||r.attribution.length>200)errors.push(`Review ${i+1}: genuine text and an approved attribution are required.`);});
  if(!value.profile.name.trim())errors.push('Identity: full name is required.');
  if(!value.profile.shortName.trim())errors.push('Identity: short name is required.');
  if(!value.channels.some(c=>c.enabled))errors.push('Channels: keep at least one channel visible.');
  if(!Number.isInteger(value.appearance.transitionMs)||value.appearance.transitionMs<0||value.appearance.transitionMs>2000)errors.push('Appearance: transition duration must be a whole number from 0 to 2000.');
  for(const [name,max] of Object.entries(limits))if(value[name].length>max)errors.push(`${human(name)}: no more than ${max} entries are supported.`);
  for(const name of ['projects','films','skills','journey'])value[name].forEach((item,index)=>{if(!item.title.trim())errors.push(`${human(name)} entry ${index+1}: a title is required.`);});
  value.films.forEach((film,index)=>{if(!film.file.trim())errors.push(`Film ${index+1}: choose a video file.`);});
  const walk=(node,path='')=>{
    if(Array.isArray(node)){node.forEach((item,i)=>walk(item,`${path}.${i}`));return;}
    if(!node||typeof node!=='object')return;
    for(const [key,v] of Object.entries(node)){
      const label=`${path?path+'.':''}${key}`;
      if(colorKeys.has(key)&&!/^#[0-9a-f]{6}$/i.test(v))errors.push(`${label}: use a six-digit hex colour, such as #b46b3e.`);
      if(assetKeys.has(key)&&v&&!assetURL(v))errors.push(`${label}: use a /assets/ path or complete https:// URL.`);
      if(['href','github','linkedin'].includes(key)&&v&&!/^https:\/\/[^\s]+$/.test(v))errors.push(`${label}: use a complete https:// URL.`);
      if(typeof v==='string'&&v.length>12000)errors.push(`${label}: keep text below 12,000 characters.`);
      if(v&&typeof v==='object')walk(v,label);
    }
  };walk(value);
  return errors;
}
async function importFile(file){
  if(!file)return;
  if(file.size>1024*1024){notice('The content file is larger than 1 MB. Choose a content export, not a media file.','error');return;}
  try{
    const incoming=JSON.parse(await file.text());validateShape(incoming);
    const errors=validateContent(incoming);if(errors.length)throw new Error(errors.slice(0,4).join(' '));
    if(!await confirmAction('Replace your editor draft?', 'The imported content will replace the current draft. Nothing on the public portfolio changes until you save. Export your current draft first if you want to keep it.','Import draft'))return;
    incoming.revision=saved.revision;draft=incoming;selected={};changed();renderNav();renderPage();notice('Content imported into your draft. Review it, then choose Save to portfolio.');
  }catch(error){notice(`Import could not be completed. ${error.message}`,'error');}
}

async function save(){
  if(!dirty||saving||uploadBusy||$('dialog[open]'))return;
  const errors=validateContent(draft);
  if(errors.length){notice(errors.slice(0,6).join(' '),'error');return;}
  saving=true;updateChrome();$('#editor').inert=true;$('#section-nav').inert=true;notice('');
  try{
    const result=await mutate('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});
    saved=result;draft=clone(result);notice('Saved. Your updated content is now available on the television.');renderPage();
  }catch(error){
    if(error.status===409){notice('This portfolio was updated in another editor. Your draft is safe here. Export it first, then reload the saved version using Discard changes before editing again.','warning');}
    else notice(`Changes were not saved. ${error.message}`,'error');
  }finally{saving=false;$('#editor').inert=false;$('#section-nav').inert=false;updateChrome();}
}
async function discard(){
  if(!dirty||saving||uploadBusy)return;
  if(!await confirmAction('Discard unsaved changes?', 'Your draft edits will be replaced by the latest saved portfolio. Uploaded files stay in the media library.','Discard changes'))return;
  try{saved=await request('/api/content');draft=clone(saved);selected={};renderNav();renderPage();updateChrome();notice('Latest saved content loaded.');}catch(error){notice(error.message,'error');}
}

$('#section-nav').addEventListener('click',event=>{const button=event.target.closest('[data-section]');if(button)go(button.dataset.section);});
$('#save-button').addEventListener('click',save);
$('#discard-button').addEventListener('click',discard);
$('#editor').addEventListener('input',event=>{
  const input=event.target.closest('[data-path]');
  if(!input||input.readOnly||saving)return;
  const path=input.dataset.path;
  let value=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.dataset.kind==='string-array'?input.value.split('\n').map(v=>v.trim()).filter(Boolean):input.value;
  put(path,value);
  if(input.type==='color'||colorKeys.has(path.split('.').at(-1)))$$('[data-path]', $('#editor')).filter(el=>el!==input&&el.dataset.path===path).forEach(el=>{if(el.type!=='color'||/^#[0-9a-f]{6}$/i.test(value))el.value=value;});
  changed();syncQuotePreview();
});
$('#editor').addEventListener('change',event=>{
  const input=event.target.closest('[data-path]');
  if(input&&assetKeys.has(input.dataset.path.split('.').at(-1))){const wrapper=input.closest('[data-asset-field]'),key=input.dataset.path.split('.').at(-1);if(wrapper){$('.asset-preview',wrapper).innerHTML=assetPreview(input.value,key==='file'?'video':key==='resume'?'document':'image');const clear=$('[data-clear-asset]',wrapper);clear.disabled=!input.value;}}
  if(event.target.id==='library-filter'){mediaType=event.target.value;$('#library-grid').innerHTML=mediaGrid();}
  if(event.target.id==='library-upload'){upload(event.target.files[0]);event.target.value='';}
});
$('#editor').addEventListener('input',event=>{if(event.target.id==='library-search'){mediaQuery=event.target.value;$('#library-grid').innerHTML=mediaGrid();}});
$('#editor').addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button||saving||uploadBusy)return;
  if(button.dataset.section){go(button.dataset.section);return;}
  if(button.hasAttribute('data-select-item')){selected[currentSection]=Number(button.dataset.selectItem);renderCollection();return;}
  if(button.hasAttribute('data-add-item')){
    const items=draft[currentSection];if(items.length>=(limits[currentSection]||100)){notice(`This collection supports up to ${limits[currentSection]||100} entries.`,'warning');return;}
    const item=templates[currentSection]();if(currentSection==='projects')item.number=String(items.length+1).padStart(2,'0');items.push(item);selected[currentSection]=items.length-1;changed();renderNav();renderCollection();notice(`New ${sectionInfo().singular} added to your draft. Fill in its details and save when ready.`);return;
  }
  if(button.hasAttribute('data-duplicate-item')){
    const items=draft[currentSection],index=selected[currentSection]||0;if(items.length>=(limits[currentSection]||100)){notice('This collection has reached its entry limit.','warning');return;}
    const copy=clone(items[index]);if('id' in copy)copy.id=newID(currentSection==='films'?'film':'project');if('title' in copy)copy.title+=' (copy)';if('number' in copy)copy.number=String(items.length+1).padStart(2,'0');items.splice(index+1,0,copy);selected[currentSection]=index+1;changed();renderNav();renderCollection();return;
  }
  if(button.hasAttribute('data-move-item')){const index=selected[currentSection]||0,target=index+Number(button.dataset.moveItem),items=draft[currentSection];if(target<0||target>=items.length)return;[items[index],items[target]]=[items[target],items[index]];selected[currentSection]=target;changed();renderCollection();return;}
  if(button.hasAttribute('data-delete-item')){
    const index=selected[currentSection]||0,item=draft[currentSection][index];if(!await confirmAction(`Remove ${sectionInfo().singular}?`, `“${itemTitle(item,index)}” will be removed from the draft. This takes effect on the portfolio only when you save. Media files will remain in the library.`,'Remove entry'))return;
    draft[currentSection].splice(index,1);selected[currentSection]=Math.max(0,index-1);changed();renderNav();renderCollection();return;
  }
  if(button.dataset.addNested){const path=button.dataset.addNested,key=button.dataset.kind;at(path).push(key==='links'?templates.links():'');changed();renderPage();return;}
  if(button.dataset.moveNested){const items=at(button.dataset.moveNested),i=Number(button.dataset.index),j=i+Number(button.dataset.direction);if(j<0||j>=items.length)return;[items[i],items[j]]=[items[j],items[i]];changed();renderPage();return;}
  if(button.dataset.removeNested){const path=button.dataset.removeNested,index=Number(button.dataset.index);if(!await confirmAction('Remove this entry?','This entry will be removed from your draft. Save to apply the change.','Remove'))return;at(path).splice(index,1);changed();renderPage();return;}
  if(button.dataset.choose){openMedia(button.dataset.choose,button.dataset.mediaKind,button);return;}
  if(button.dataset.clearAsset){put(button.dataset.clearAsset,'');changed();renderPage();return;}
  if(button.hasAttribute('data-copy-media')){try{await navigator.clipboard.writeText(mediaFiles[Number(button.dataset.copyMedia)].url);$('#library-status').textContent='Media path copied.';}catch{$('#library-status').textContent='Clipboard is unavailable. Open the file and copy its address from the browser.';}return;}
  if(button.hasAttribute('data-delete-media')){
    const file=mediaFiles[Number(button.dataset.deleteMedia)];
    if(JSON.stringify(draft).includes(file.url)){notice('This media is used in your current draft. Replace or clear its references, save, then remove it from the library.','warning');return;}
    if(!await confirmAction('Delete this uploaded file?',`“${file.name}” will be removed from local uploads. This cannot be undone. Original media is never deleted.`,'Delete file'))return;
    try{await mutate(`/api/media?url=${encodeURIComponent(file.url)}`,{method:'DELETE'});await refreshMedia();$('#library-grid').innerHTML=mediaGrid();$('#library-status').textContent='Uploaded file deleted.';}catch(error){notice(error.message,'error');}return;
  }
  if(button.hasAttribute('data-export'))exportData();
  if(button.hasAttribute('data-import'))$('#import-file').click();
  if(button.hasAttribute('data-retry'))init();
});
$('#media-search').addEventListener('input',event=>{mediaQuery=event.target.value;$('#media-picker-grid').innerHTML=mediaGrid(true);});
$('#media-filter').addEventListener('change',event=>{mediaType=event.target.value;$('#media-picker-grid').innerHTML=mediaGrid(true);});
$('#media-picker-grid').addEventListener('click',event=>{const button=event.target.closest('[data-pick-media]');if(button&&!uploadBusy)selectMedia(Number(button.dataset.pickMedia));});
$('#media-picker-upload').addEventListener('change',event=>{upload(event.target.files[0],true);event.target.value='';});
document.addEventListener('keydown',event=>{const label=event.target.closest('.upload-label');if(label&&(event.key==='Enter'||event.key===' ')){event.preventDefault();$('input[type=file]',label)?.click();}});
$('[data-dialog-close="media-dialog"]').addEventListener('click',closeMedia);
$('#media-dialog').addEventListener('cancel',event=>{event.preventDefault();closeMedia();});
$('#confirm-cancel').addEventListener('click',()=>finishConfirm(false));
$('#confirm-accept').addEventListener('click',()=>finishConfirm(true));
$('#confirm-dialog').addEventListener('cancel',event=>{event.preventDefault();finishConfirm(false);});
$('#import-file').addEventListener('change',event=>{importFile(event.target.files[0]);event.target.value='';});
$$('dialog').forEach(dialog=>dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=$$('button:not([disabled]),input:not([hidden]),select,a[href],[tabindex="0"]',dialog).filter(el=>el.getClientRects().length);
  if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1)?.focus();}
  else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0]?.focus();}
}));
window.addEventListener('beforeunload',event=>{if(dirty||saving||uploadBusy){event.preventDefault();event.returnValue='';}});
window.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();save();}});
async function init(){
  const hash=location.hash.slice(1);if(sections.some(s=>s.id===hash))currentSection=hash;
  try{await loadContent();}catch(error){$('#save-state').className='error';$('#save-state').innerHTML='<i></i>Connection unavailable';$('#editor').innerHTML=`<div class="loading-panel"><h1>The studio is not connected.</h1><p>${esc(error.message)}</p><p>Make sure the local portfolio server is running, then try again.</p><button class="button primary" data-retry>Try again</button></div>`;}
}
init();

$('#logout-button').addEventListener('click',async()=>{if(dirty&&!await confirmAction('Leave the control room?','Your unsaved draft will be discarded. Saved content stays on air.','Sign out'))return;try{await mutate('/api/admin/logout',{method:'POST'});dirty=false;location.assign('/login.html');}catch(error){notice(error.message,'error');}});
