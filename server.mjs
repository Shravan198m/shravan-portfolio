import http from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rename, unlink, readdir, stat, realpath, open } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createSeedContent, migrateContent } from './seed-content.mjs';
import { createAuth } from './auth.mjs';

const applicationRoot = path.dirname(fileURLToPath(import.meta.url));
const channelIds = ['home','work','films','about','skills','journey','contact','services'];
const contentLimit = 1024 * 1024, uploadLimit = 128 * 1024 * 1024;
const mimeTypes = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.mp4':'video/mp4','.webm':'video/webm','.pdf':'application/pdf','.woff2':'font/woff2','.ttf':'font/ttf','.m4a':'audio/mp4'};
const uploadTypes = {'image/png':['.png'],'image/jpeg':['.jpg','.jpeg'],'image/webp':['.webp'],'image/gif':['.gif'],'image/avif':['.avif'],'video/mp4':['.mp4'],'video/webm':['.webm'],'application/pdf':['.pdf']};
const publicFiles = new Set(['index.html','tv.js','tv.css','admin.html','admin.js','admin.css','favicon.svg','intro.js','intro.css','sound-engine.js','photographic.css','login.html','login.js','login.css']);
class HttpError extends Error { constructor(status,message) {super(message);this.status=status;} }
function reject(message) {throw new HttpError(422,message);}
function object(value,keys,at) {
  if(!value||typeof value!=='object'||Array.isArray(value)) reject(`${at} must be an object.`);
  for(const key of keys) if(!Object.hasOwn(value,key)) reject(`${at}.${key} is required.`);
  for(const key of Object.keys(value)) if(!keys.includes(key)) reject(`${at}.${key} is not a supported field.`);
}
function text(value,at,max=4000,required=false) {
  if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) reject(`${at} must be text of at most ${max} characters.`);
  if(required&&!value.trim()) reject(`${at} cannot be empty.`);
}
function bool(value,at) {if(typeof value!=='boolean') reject(`${at} must be true or false.`);}
function list(value,at,max,item) {if(!Array.isArray(value)||value.length>max) reject(`${at} must be an array with at most ${max} items.`);value.forEach((entry,index)=>item(entry,`${at}[${index}]`));}
function strings(value,at,max=40) {list(value,at,max,(entry,location)=>text(entry,location,500));}
function colour(value,at) {if(typeof value!=='string'||!/^#[a-f0-9]{6}$/i.test(value)) reject(`${at} must be a six-digit hex colour, such as #d76b35.`);}
function httpsUrl(value,at,optional=false) {
  text(value,at,2048);if(!value&&optional)return;let url;
  try{url=new URL(value);}catch{reject(`${at} must be an https URL.`);}
  if(url.protocol!=='https:'||url.username||url.password||/[\r\n]/.test(value)) reject(`${at} must be an https URL without credentials.`);
}
function asset(value,at,optional=true) {
  text(value,at,2048);if(!value&&optional)return;
  if(value.startsWith('https://'))return httpsUrl(value,at);
  if(!/^\/assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_. -]+$/.test(value)||value.split('/').some(part=>part==='..'||part==='.'||part.startsWith('.'))) reject(`${at} must be a local /assets/... path or an https URL.`);
  const extension=path.posix.extname(value).toLowerCase();
  if(!Object.hasOwn(mimeTypes,extension)||['.html','.js','.css'].includes(extension)) reject(`${at} must point to an image, video, font or PDF asset.`);
}
function id(value,at) {if(typeof value!=='string'||!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(value)) reject(`${at} must be a unique lowercase identifier.`);}
function uniqueIds(items,at) {if(new Set(items.map(item=>item.id)).size!==items.length) reject(`${at} contains duplicate IDs.`);}

export function validateContent(doc) {
  object(doc,['revision','profile','appearance','channels','projects','films','about','skills','journey','contact','posters','quotes','services','reviews'],'content');
  if(!Number.isSafeInteger(doc.revision)||doc.revision<1) reject('revision must be a positive integer.');
  const profileKeys=['name','shortName','role','location','kicker','homeTitle','homeSubtitle','portrait','resume','footer'];object(doc.profile,profileKeys,'profile');
  for(const key of profileKeys) ['portrait','resume'].includes(key)?asset(doc.profile[key],`profile.${key}`):text(doc.profile[key],`profile.${key}`,1000,['name','shortName'].includes(key));
  object(doc.appearance,['wallImage','posterLeft','posterRight','accent','cream','ink','teal','wood','buttonColor','screenColor','fontFamily','scanlines','transitionMs','soundEnabled'],'appearance');
  for(const key of ['wallImage','posterLeft','posterRight'])asset(doc.appearance[key],`appearance.${key}`);
  for(const key of ['accent','cream','ink','teal','wood','buttonColor','screenColor'])colour(doc.appearance[key],`appearance.${key}`);
  if(!['retro','serif','mono'].includes(doc.appearance.fontFamily))reject('appearance.fontFamily must be retro, serif or mono.');
  bool(doc.appearance.scanlines,'appearance.scanlines');bool(doc.appearance.soundEnabled,'appearance.soundEnabled');
  if(!Number.isInteger(doc.appearance.transitionMs)||doc.appearance.transitionMs<0||doc.appearance.transitionMs>2000)reject('appearance.transitionMs must be an integer from 0 to 2000.');
  list(doc.channels,'channels',8,(entry,at)=>{object(entry,['id','label','subtitle','color','enabled'],at);if(!channelIds.includes(entry.id))reject(`${at}.id is not a supported channel.`);text(entry.label,`${at}.label`,100,true);text(entry.subtitle,`${at}.subtitle`,500);colour(entry.color,`${at}.color`);bool(entry.enabled,`${at}.enabled`);});
  uniqueIds(doc.channels,'channels');if(doc.channels.length!==8)reject('Keep all eight channel definitions; disable a channel to hide it.');if(!doc.channels.some(channel=>channel.enabled))reject('Enable at least one channel.');
  const projectKeys=['id','number','title','category','year','theme','icon','summary','description','role','tags','metric','metricLabel','overview','approach','note','flow','stack','links','thumbnail','enabled'];
  list(doc.projects,'projects',100,(entry,at)=>{
    object(entry,projectKeys,at);id(entry.id,`${at}.id`);
    for(const key of ['number','title','category','year','theme','icon','summary','description','role','metric','metricLabel','overview','approach','note'])text(entry[key],`${at}.${key}`,['overview','approach','note','description'].includes(key)?12000:1000,key==='title');
    for(const key of ['tags','flow','stack'])strings(entry[key],`${at}.${key}`);asset(entry.thumbnail,`${at}.thumbnail`);bool(entry.enabled,`${at}.enabled`);
    list(entry.links,`${at}.links`,15,(link,location)=>{object(link,['label','href'],location);text(link.label,`${location}.label`,100,true);httpsUrl(link.href,`${location}.href`);});
  });uniqueIds(doc.projects,'projects');
  list(doc.films,'films',100,(entry,at)=>{object(entry,['id','title','role','duration','file','poster','format','alt','description','enabled'],at);id(entry.id,`${at}.id`);for(const key of ['title','role','duration','format','alt','description'])text(entry[key],`${at}.${key}`,key==='description'?12000:1000,key==='title');asset(entry.file,`${at}.file`,false);asset(entry.poster,`${at}.poster`);bool(entry.enabled,`${at}.enabled`);});uniqueIds(doc.films,'films');
  object(doc.about,['title','intro','paragraphs','portrait','signature'],'about');text(doc.about.title,'about.title',1000);text(doc.about.intro,'about.intro',4000);list(doc.about.paragraphs,'about.paragraphs',40,(entry,at)=>text(entry,at,12000));asset(doc.about.portrait,'about.portrait');asset(doc.about.signature,'about.signature');
  list(doc.skills,'skills',50,(entry,at)=>{object(entry,['title','description','tools'],at);text(entry.title,`${at}.title`,300,true);text(entry.description,`${at}.description`,12000);strings(entry.tools,`${at}.tools`,80);});
  list(doc.journey,'journey',100,(entry,at)=>{const keys=['period','title','organization','description','type'];object(entry,keys,at);for(const key of keys)text(entry[key],`${at}.${key}`,key==='description'?12000:1000,key==='title');});
  object(doc.contact,['title','description','email','github','linkedin','resume','label'],'contact');for(const key of ['title','description','label'])text(doc.contact[key],`contact.${key}`,4000);text(doc.contact.email,'contact.email',254);
  if(doc.contact.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(doc.contact.email))reject('contact.email must be a valid email address.');httpsUrl(doc.contact.github,'contact.github',true);httpsUrl(doc.contact.linkedin,'contact.linkedin',true);asset(doc.contact.resume,'contact.resume');
  list(doc.posters,'posters',20,(entry,at)=>{object(entry,['title','subtitle','image','channel','enabled'],at);text(entry.title,`${at}.title`,1000);text(entry.subtitle,`${at}.subtitle`,1000);asset(entry.image,`${at}.image`);if(!channelIds.includes(entry.channel))reject(`${at}.channel is not supported.`);bool(entry.enabled,`${at}.enabled`);});
  list(doc.quotes,'quotes',100,(entry,at)=>{object(entry,['id','text','side','duration','frame','font','color','background','fontSize','enabled'],at);id(entry.id,`${at}.id`);text(entry.text,`${at}.text`,240,true);for(const [key,values] of Object.entries({side:['left','right','both'],frame:['wood','brass','black'],font:['serif','mono','display']}))if(!values.includes(entry[key]))reject(`${at}.${key} is unsupported.`);colour(entry.color,`${at}.color`);colour(entry.background,`${at}.background`);bool(entry.enabled,`${at}.enabled`);if(!Number.isInteger(entry.duration)||entry.duration<3||entry.duration>120)reject(`${at}.duration must be 3–120 seconds.`);if(!Number.isInteger(entry.fontSize)||entry.fontSize<12||entry.fontSize>40)reject(`${at}.fontSize must be 12–40.`);});uniqueIds(doc.quotes,'quotes');
  list(doc.services,'services',30,(entry,at)=>{object(entry,['title','description'],at);text(entry.title,`${at}.title`,200,true);text(entry.description,`${at}.description`,4000,true);});
  list(doc.reviews,'reviews',50,(entry,at)=>{object(entry,['id','text','attribution','enabled'],at);id(entry.id,`${at}.id`);text(entry.text,`${at}.text`,2000,true);text(entry.attribution,`${at}.attribution`,200,true);bool(entry.enabled,`${at}.enabled`);if(entry.enabled&&(/\bsample\b/i.test(entry.attribution)||/^Sample wording\s*[—:-]/i.test(entry.text)))reject(`${at} is sample wording. Replace it with approved client feedback before publishing.`);});uniqueIds(doc.reviews,'reviews');
  return doc;
}

function json(res,status,value) {const body=JSON.stringify(value);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store'});res.end(body);}
function under(root,file) {return file.startsWith(root+path.sep);}
async function bodyBuffer(req,limit) {
  if(Number(req.headers['content-length'])>limit){req.resume();throw new HttpError(413,`Request exceeds the ${Math.round(limit/1024/1024)} MB limit.`);}
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>limit)throw new HttpError(413,'Request is too large.');chunks.push(chunk);}return Buffer.concat(chunks);
}
async function atomicJson(file,value) {
  const temp=`${file}.${randomUUID()}.tmp`;let handle;
  try{handle=await open(temp,'wx',0o600);await handle.writeFile(JSON.stringify(value,null,2)+'\n');await handle.sync();await handle.close();handle=null;await rename(temp,file);}
  finally{if(handle)await handle.close().catch(()=>{});await unlink(temp).catch(()=>{});}
}
function references(value,url) {if(typeof value==='string')return process.platform==='win32'?value.toLowerCase()===url.toLowerCase():value===url;if(Array.isArray(value))return value.some(item=>references(item,url));return value&&typeof value==='object'&&Object.values(value).some(item=>references(item,url));}
function signatureMatches(buffer,type) {
  if(type==='image/png')return buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if(type==='image/jpeg')return buffer[0]===255&&buffer[1]===216&&buffer[2]===255;
  if(type==='image/gif')return /^GIF8[79]a$/.test(buffer.subarray(0,6).toString());
  if(type==='image/webp')return buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP';
  if(type==='image/avif')return buffer.subarray(4,8).toString()==='ftyp'&&/avif|avis/.test(buffer.subarray(8,64).toString());
  if(type==='video/mp4')return buffer.subarray(4,8).toString()==='ftyp'&&!/avif|avis/.test(buffer.subarray(8,32).toString());
  if(type==='video/webm')return buffer.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
  if(type==='application/pdf')return buffer.subarray(0,5).toString()==='%PDF-';return false;
}

export async function createPortfolioServer({root=applicationRoot}={}) {
  root=await realpath(root);const storage=path.join(root,'storage'),backups=path.join(storage,'backups'),uploads=path.join(root,'assets','uploads');
  await mkdir(backups,{recursive:true});await mkdir(uploads,{recursive:true});
  for(const directory of [storage,backups,uploads])if(!under(root,await realpath(directory)))throw new Error('Data directories must stay inside the project.');
  const contentFile=path.join(storage,'content.json');
  try{const prior=JSON.parse(await readFile(contentFile,'utf8'));const next=validateContent(migrateContent(structuredClone(prior)));if(JSON.stringify(prior)!==JSON.stringify(next)){await atomicJson(path.join(backups,`migration-${Date.now()}.json`),prior);next.revision=prior.revision+1;await atomicJson(contentFile,next);}}catch(error){if(error.code==='ENOENT')await atomicJson(contentFile,validateContent(createSeedContent()));else throw new Error(`Cannot load saved content: ${error.message}. Existing content has been preserved.`);}
  const auth=await createAuth(path.join(storage,'admin-auth.json'));let mutationTail=Promise.resolve();
  const serialized=operation=>{const next=mutationTail.then(operation,operation);mutationTail=next.catch(()=>{});return next;};
  const readContent=async()=>validateContent(JSON.parse(await readFile(contentFile,'utf8')));
  async function writeLock(operation) {
    const lockPath=path.join(storage,'write.lock');let lock;
    for(let attempt=0;attempt<2;attempt++){
      try{lock=await open(lockPath,'wx');await lock.writeFile(JSON.stringify({pid:process.pid,createdAt:Date.now()}));break;}
      catch(error){
        if(error.code!=='EEXIST')throw error;
        let stale=false;
        try{const prior=JSON.parse(await readFile(lockPath,'utf8'));if(Number.isInteger(prior.pid)&&prior.pid>0){try{process.kill(prior.pid,0);}catch(check){stale=check.code==='ESRCH';}}}
        catch{try{stale=Date.now()-(await stat(lockPath)).mtimeMs>30000;}catch{/* Another process may have just released its lock. */}}
        if(stale&&attempt===0){await unlink(lockPath).catch(()=>{});continue;}
        throw new HttpError(503,'Another save is in progress. Please retry.');
      }
    }
    try{return await operation();}finally{await lock.close();await unlink(lockPath).catch(()=>{});}
  }
  function originGuard(req,mutation=false,login=false) {
    const port=server.address()?.port,host=req.headers.host;
    if(!new Set([`127.0.0.1:${port}`,`localhost:${port}`]).has(host))throw new HttpError(403,'Only the local server origin is allowed.');
    if(req.headers['sec-fetch-site']==='cross-site')throw new HttpError(403,'Cross-site requests are not allowed.');
    const expected=`http://${host}`;
    if((req.headers.origin&&req.headers.origin!==expected)||(mutation&&req.headers.origin!==expected))throw new HttpError(403,'A same-origin request is required.');
    if(mutation&&!login){const session=auth.current(req);if(!session)throw new HttpError(401,'Please sign in to the control room.');const token=session.token;const supplied=req.headers['x-admin-token'];if(typeof supplied!=='string'||supplied.length!==token.length||!timingSafeEqual(Buffer.from(supplied),Buffer.from(token)))throw new HttpError(403,'The editor session expired. Reload the editor and try again.');}
  }
  async function mediaList() {
    const files=[],assetsRoot=path.join(root,'assets');
    async function walk(directory){for(const entry of await readdir(directory,{withFileTypes:true})){
      if(entry.name.startsWith('.'))continue;const file=path.join(directory,entry.name);
      if(entry.isDirectory()){if(entry.name==='uploads')await walk(file);continue;}if(!entry.isFile())continue;
      const type=mimeTypes[path.extname(entry.name).toLowerCase()];if(!type)continue;
      const info=await stat(file);files.push({url:'/assets/'+path.relative(assetsRoot,file).split(path.sep).join('/'),name:entry.name,type,size:info.size});
    }}await walk(assetsRoot);return files.sort((a,b)=>a.name.localeCompare(b.name));
  }
  async function upload(req) {
    const type=(req.headers['content-type']||'').split(';')[0].trim().toLowerCase();if(!uploadTypes[type])throw new HttpError(415,'Upload a PNG, JPEG, WebP, GIF, AVIF, MP4, WebM or PDF file.');
    let name;try{name=decodeURIComponent(req.headers['x-file-name']||'');}catch{throw new HttpError(400,'Invalid file name.');}
    if(!name||name.length>240||/[\\/\x00-\x1f]/.test(name)||name.startsWith('.'))throw new HttpError(400,'Choose a file with a valid file name.');
    const extension=path.extname(name).toLowerCase();if(!uploadTypes[type].includes(extension))throw new HttpError(415,'The file extension does not match its content type.');
    if(Number(req.headers['content-length'])>uploadLimit){req.resume();throw new HttpError(413,'Uploads are limited to 128 MB.');}
    const stem=path.basename(name,extension).normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'media';
    const filename=`${stem}-${randomUUID()}${extension}`,finalPath=path.join(uploads,filename),temp=path.join(uploads,`.upload-${randomUUID()}.tmp`);let handle,size=0,header=Buffer.alloc(0);
    try{
      handle=await open(temp,'wx',0o600);
      for await(const chunk of req){size+=chunk.length;if(size>uploadLimit)throw new HttpError(413,'Uploads are limited to 128 MB.');if(header.length<4096)header=Buffer.concat([header,chunk.subarray(0,4096-header.length)]);await handle.writeFile(chunk);}
      if(!size||!signatureMatches(header,type))throw new HttpError(415,'The file contents do not match the selected media type.');
      await handle.sync();await handle.close();handle=null;await rename(temp,finalPath);return{url:`/assets/uploads/${filename}`,name:filename,type,size};
    }finally{if(handle)await handle.close().catch(()=>{});await unlink(temp).catch(()=>{});}
  }
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');res.setHeader('Cross-Origin-Resource-Policy','same-origin');
    try{
      originGuard(req);const url=new URL(req.url,`http://${req.headers.host}`);let pathname;
      try{pathname=decodeURIComponent(url.pathname);}catch{throw new HttpError(400,'Invalid URL.');}
      if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(segment=>segment==='..'||segment==='.'||segment.startsWith('.')))throw new HttpError(403,'Invalid path.');
      if(pathname.startsWith('/api/')){
        if(pathname==='/api/admin/login'&&req.method==='POST'){
          originGuard(req,true,true);
          if((req.headers['content-type']||'').split(';')[0]!=='application/json')throw new HttpError(415,'Send JSON.');
          let credentials;try{credentials=JSON.parse((await bodyBuffer(req,4096)).toString('utf8'));}catch{throw new HttpError(400,'Invalid sign-in request.');}
          const result=await auth.login(req,res,credentials?.email,credentials?.password);return json(res,result.status,result.error?{error:result.error}:{ok:true});
        }
        if(pathname!=='/api/content'||req.method!=='GET')if(!auth.current(req))throw new HttpError(401,'Please sign in to the control room.');
        if(pathname==='/api/admin/session'&&req.method==='GET')return json(res,200,{token:auth.current(req).token});
        if(pathname==='/api/admin/logout'&&req.method==='POST'){originGuard(req,true);auth.logout(req,res);return json(res,200,{ok:true});}
        if(pathname==='/api/content'&&req.method==='GET')return json(res,200,await readContent());
        if(pathname==='/api/content'&&req.method==='PUT'){
          originGuard(req,true);if((req.headers['content-type']||'').split(';')[0].trim()!=='application/json')throw new HttpError(415,'Send content as application/json.');
          let doc;try{doc=JSON.parse((await bodyBuffer(req,contentLimit)).toString('utf8'));}catch(error){if(error instanceof HttpError)throw error;throw new HttpError(400,'Content must be valid JSON.');}validateContent(doc);
          const saved=await serialized(()=>writeLock(async()=>{
            const current=await readContent();if(doc.revision!==current.revision)throw new HttpError(409,`Content changed in another editor (current revision ${current.revision}). Reload before saving.`);if(current.revision>=Number.MAX_SAFE_INTEGER)throw new HttpError(409,'Revision limit reached.');
            const next={...doc,revision:current.revision+1};
            await atomicJson(path.join(backups,`content-r${current.revision}-${Date.now()}-${randomUUID().slice(0,8)}.json`),current);await atomicJson(contentFile,next);
            const older=(await readdir(backups)).filter(name=>/^content-r\d+-\d+-[a-f0-9]+\.json$/.test(name)).sort((a,b)=>Number(b.match(/-(\d+)-/)[1])-Number(a.match(/-(\d+)-/)[1]));await Promise.all(older.slice(30).map(name=>unlink(path.join(backups,name)).catch(()=>{})));return next;
          }));return json(res,200,saved);
        }
        if(pathname==='/api/media'&&req.method==='GET')return json(res,200,{files:await mediaList()});
        if(pathname==='/api/media'&&req.method==='POST'){originGuard(req,true);return json(res,201,await upload(req));}
        if(pathname==='/api/media'&&req.method==='DELETE'){
          originGuard(req,true);const mediaUrl=url.searchParams.get('url');if(!/^\/assets\/uploads\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(mediaUrl||''))throw new HttpError(403,'Only uploaded media can be deleted.');
          await serialized(()=>writeLock(async()=>{if(references(await readContent(),mediaUrl))throw new HttpError(409,'This upload is still used by saved content. Remove its references and save first.');const file=path.resolve(root,'.'+mediaUrl),real=await realpath(file);if(!under(uploads,real))throw new HttpError(403,'Invalid upload path.');await unlink(real);}));return json(res,200,{deleted:true,url:mediaUrl});
        }
        if(['/api/content','/api/media','/api/admin/session'].includes(pathname))throw new HttpError(405,'Method not allowed.');throw new HttpError(404,'API route not found.');
      }
      if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');throw new HttpError(405,'Method not allowed.');}
      if(['/admin','/admin/','/admin.html','/admin.js'].includes(pathname)&&!auth.current(req)){res.writeHead(303,{'Location':'/login.html','Cache-Control':'no-store'});res.end();return;}
      if(pathname==='/login.html'&&auth.current(req)){res.writeHead(303,{'Location':'/admin','Cache-Control':'no-store'});res.end();return;}
      const relative=pathname==='/'?'index.html':(/^\/admin\/?$/.test(pathname)?'admin.html':pathname.slice(1));
      if(!publicFiles.has(relative)&&!relative.startsWith('assets/'))throw new HttpError(404,'Not found.');const file=path.resolve(root,relative);
      if(!under(root,file)||!under(root,await realpath(file)))throw new HttpError(403,'Invalid path.');const extension=path.extname(file).toLowerCase();if(!Object.hasOwn(mimeTypes,extension))throw new HttpError(404,'Not found.');
      const info=await stat(file);if(!info.isFile())throw new HttpError(404,'Not found.');let start=0,end=info.size-1,status=200;
      const headers={'Content-Type':mimeTypes[extension],'Accept-Ranges':'bytes','Cache-Control':relative.startsWith('admin')||relative.startsWith('login')?'no-store':'no-cache'};
      if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!match||(!match[1]&&!match[2])){res.setHeader('Content-Range',`bytes */${info.size}`);throw new HttpError(416,'Invalid range.');}if(!match[1])start=Math.max(0,info.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}if(!Number.isSafeInteger(start)||start>end||start>=info.size){res.setHeader('Content-Range',`bytes */${info.size}`);throw new HttpError(416,'Range not satisfiable.');}headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;status=206;}
      headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);if(req.method==='HEAD'||info.size===0){res.end();return;}
      const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
    }catch(error){if(res.headersSent){res.destroy();return;}const status=error.status||(error.code==='ENOENT'?404:500);if(status===500)console.error('Request failed:',error.message);json(res,status,{error:status===500?'Unable to complete this request. Saved content has been preserved.':(error.code==='ENOENT'?'Not found.':error.message)});}
  });server.requestTimeout=120000;server.headersTimeout=15000;return server;
}

if(process.env.VERCEL !== '1' && process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const flag=process.argv.indexOf('--port'),requestedPort=Number(flag>=0?process.argv[flag+1]:4174);if(!Number.isInteger(requestedPort)||requestedPort<1024||requestedPort>65535)throw new Error('Choose a port between 1024 and 65535.');
  const server=await createPortfolioServer();let port=requestedPort;server.on('error',error=>{if(error.code==='EADDRINUSE'&&port<requestedPort+20&&port<65535)server.listen(++port,'127.0.0.1');else{console.error(error.message);process.exitCode=1;}});
  server.listen(port,'127.0.0.1',()=>console.log(`SVM Retro Portfolio\nLocal: http://127.0.0.1:${port}\nEditor: http://127.0.0.1:${port}/admin\nServing: ${applicationRoot}\nPress Ctrl+C to stop.`));
}


