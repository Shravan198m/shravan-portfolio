import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {randomBytes,scryptSync} from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPortfolioServer } from '../server.mjs';

const qa=path.dirname(fileURLToPath(import.meta.url));
const fixture=await mkdtemp(path.join(qa,'cms-api-fixture-'));
const base='http://127.0.0.1:4199';
const checks=[];let server,token,cookie;
const testEmail='editor@example.test',testPassword='Fixture-only-password-84!';
async function login(){const response=await fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:testEmail,password:testPassword})});assert.equal(response.status,200);cookie=response.headers.get('set-cookie').split(';')[0];token=(await (await fetch(base+'/api/admin/session',{headers:{Cookie:cookie}})).json()).token;}
async function start(){server=await createPortfolioServer({root:fixture});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4199,'127.0.0.1',resolve);});await login();}
async function stop(){if(!server)return;server.closeAllConnections();await new Promise(resolve=>server.close(resolve));server=null;}
function headers(extra={}){return {'Origin':base,'X-Admin-Token':token,Cookie:cookie,...extra};}
async function put(doc,extra={}){return fetch(base+'/api/content',{method:'PUT',headers:headers({'Content-Type':'application/json',...extra}),body:JSON.stringify(doc)});}
async function content(){return (await fetch(base+'/api/content')).json();}
async function rawStatus(route,requestHeaders){return new Promise((resolve,reject)=>{const req=http.get(base+route,{headers:requestHeaders},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);});}
async function check(label,operation){await operation();checks.push(label);console.log('PASS',label);}
try{
  await mkdir(path.join(fixture,'assets'),{recursive:true});
  await mkdir(path.join(fixture,'storage'),{recursive:true});
  const salt=randomBytes(32);await writeFile(path.join(fixture,'storage','admin-auth.json'),JSON.stringify({algorithm:'scrypt',email:testEmail,salt:salt.toString('hex'),hash:scryptSync(testPassword,salt,64).toString('hex')}));
  await writeFile(path.join(fixture,'index.html'),'<!doctype html><title>API fixture</title>');
  await writeFile(path.join(fixture,'admin.html'),'<!doctype html><title>Editor fixture</title>');
  const jpeg=await readFile(path.join(qa,'..','assets','film-01-offline-poster.jpg'));
  await writeFile(path.join(fixture,'assets','original.jpg'),jpeg);
  await start();const initial=await content();
  await check('seed content and admin routing',async()=>{assert.equal(initial.revision,1);assert.equal(initial.projects.length,5);assert.equal(initial.films.length,7);assert.equal(initial.profile.homeTitle,'The Shravan Show');assert.equal((await fetch(base+'/admin',{headers:{Cookie:cookie}})).status,200);assert.equal((await fetch(base+'/admin/',{headers:{Cookie:cookie}})).status,200);});
  await check('save increments revision and retains previous backup',async()=>{const doc=structuredClone(initial);doc.profile.name='Persistence test';const res=await put(doc);assert.equal(res.status,200);const saved=await res.json();assert.equal(saved.revision,2);assert.equal(saved.profile.name,'Persistence test');const files=await readdir(path.join(fixture,'storage','backups'));assert.equal(files.length,1);assert.deepEqual(JSON.parse(await readFile(path.join(fixture,'storage','backups',files[0]),'utf8')),initial);});
  const oldToken=token;await stop();await start();
  await check('saved data survives server restart; session token rotates',async()=>{assert.equal((await content()).profile.name,'Persistence test');assert.notEqual(token,oldToken);assert.equal((await put(await content(),{'X-Admin-Token':oldToken})).status,403);});
  await check('stale revision and concurrent edit conflict prevent lost updates',async()=>{assert.equal((await put(initial)).status,409);const doc=await content();const responses=await Promise.all([put(doc),put(doc)]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal((await content()).revision,3);});
  await check('same-origin, token, cross-site and Host protections',async()=>{const doc=await content();assert.equal((await put(doc,{'Origin':'https://outside.example'})).status,403);assert.equal((await put(doc,{'X-Admin-Token':'invalid'})).status,403);assert.equal((await fetch(base+'/api/content',{method:'PUT',headers:{Cookie:cookie,'X-Admin-Token':token,'Content-Type':'application/json'},body:JSON.stringify(doc)})).status,403);assert.equal((await fetch(base+'/api/admin/session',{headers:{'Origin':'https://outside.example'}})).status,403);assert.equal((await fetch(base+'/api/admin/session',{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);assert.equal(await rawStatus('/api/admin/session',{Host:'attacker.example:4199'}),403);});
  await check('malformed, oversized, and unsafe content rejected without revision changes',async()=>{const doc=await content(),revision=doc.revision;for(const mutate of [d=>delete d.profile,d=>d.channels.pop(),d=>d.channels.forEach(c=>c.enabled=false),d=>d.appearance.accent='red',d=>d.profile.portrait='/assets/../server.mjs',d=>d.projects[0].links[0].href='javascript:alert(1)',d=>d.projects.push(structuredClone(d.projects[0])),d=>d.appearance.transitionMs=-1,d=>d.extra='unsupported']){const invalid=structuredClone(doc);mutate(invalid);assert.equal((await put(invalid)).status,422);}assert.equal((await fetch(base+'/api/content',{method:'PUT',headers:headers({'Content-Type':'application/json'}),body:'{broken'})).status,400);assert.equal((await fetch(base+'/api/content',{method:'PUT',headers:headers({'Content-Type':'application/json'}),body:'x'.repeat(1024*1024+1)})).status,413);assert.equal((await content()).revision,revision);});
  let uploaded;
  await check('media upload persists bytes and supports listing/ranges',async()=>{const res=await fetch(base+'/api/media',{method:'POST',headers:headers({'Content-Type':'image/jpeg','X-File-Name':encodeURIComponent('My new portrait.jpg')}),body:jpeg});assert.equal(res.status,201);uploaded=await res.json();assert.match(uploaded.url,/^\/assets\/uploads\/My-new-portrait-[a-f0-9-]+\.jpg$/);assert.equal(uploaded.size,jpeg.length);assert.deepEqual(Buffer.from(await (await fetch(base+uploaded.url)).arrayBuffer()),jpeg);const files=(await (await fetch(base+'/api/media',{headers:{Cookie:cookie}})).json()).files;assert(files.some(file=>file.url===uploaded.url));const range=await fetch(base+uploaded.url,{headers:{Range:'bytes=0-99'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,100);assert.equal((await fetch(base+uploaded.url,{headers:{Range:'bytes=999999999-'}})).status,416);});
  await check('unsafe uploads rejected and temporary files cleaned',async()=>{for(const [name,type,body,expected] of [['../../bad.jpg','image/jpeg',jpeg,400],['fake.png','image/png',jpeg,415],['bad.svg','image/svg+xml','<svg/>',415],['bad.html','text/html','<script/>',415]]){assert.equal((await fetch(base+'/api/media',{method:'POST',headers:headers({'Content-Type':type,'X-File-Name':encodeURIComponent(name)}),body})).status,expected);}assert(!(await readdir(path.join(fixture,'assets','uploads'))).some(name=>name.startsWith('.upload-')));});
  await check('referenced uploads and original assets cannot be deleted',async()=>{let doc=await content();doc.profile.portrait=uploaded.url;let res=await put(doc);assert.equal(res.status,200);assert.equal((await fetch(base+'/api/media?url='+encodeURIComponent(uploaded.url),{method:'DELETE',headers:headers()})).status,409);assert.equal((await fetch(base+'/api/media?url='+encodeURIComponent('/assets/original.jpg'),{method:'DELETE',headers:headers()})).status,403);doc=await content();doc.profile.portrait=initial.profile.portrait;assert.equal((await put(doc)).status,200);assert.equal((await fetch(base+'/api/media?url='+encodeURIComponent(uploaded.url),{method:'DELETE',headers:headers()})).status,200);assert.equal((await fetch(base+uploaded.url)).status,404);});
  await check('private files and traversal cannot be served',async()=>{for(const route of ['/storage/admin-auth.json','/auth.mjs','/storage/content.json','/storage/backups/anything.json','/server.mjs','/seed-content.mjs','/qa/api.test.mjs','/package.json','/assets/%2e%2e%5cserver.mjs','/assets/%00x.jpg']){const res=await fetch(base+route);assert([403,404].includes(res.status),`${route}: ${res.status}`);}});
  await check('dead writer lock recovers and content is restored',async()=>{await writeFile(path.join(fixture,'storage','write.lock'),JSON.stringify({pid:99999999,createdAt:Date.now()-1000}));const current=await content();const res=await put({...initial,revision:current.revision});assert.equal(res.status,200);const restored=await res.json();assert.deepEqual({...restored,revision:1},initial);});
  await check('quote frames and services seed without invented client reviews',async()=>{
    assert.equal(initial.channels.length,8);assert(initial.channels.some(c=>c.id==='services'&&c.enabled));
    assert(initial.quotes.length>=2);assert(initial.services.length>0);assert.deepEqual(initial.reviews,[]);
  });
  await check('quote appearance, order, services and unpublished feedback survive restart',async()=>{
    const doc=await content();doc.quotes.reverse();Object.assign(doc.quotes[0],{text:'Fixture quote only',side:'right',duration:13,frame:'black',font:'mono',fontSize:22,color:'#123456',background:'#eeddbb',enabled:true});
    doc.services.push({title:'Fixture service',description:'Fixture description only.'});
    doc.reviews.push({id:'fixture-review',text:'Disposable test feedback, not a real endorsement.',attribution:'Test fixture',enabled:false});
    const response=await put(doc);assert.equal(response.status,200);const expected=await response.json();
    await stop();await start();const actual=await content();
    assert.deepEqual(actual.quotes,expected.quotes);assert.deepEqual(actual.services,expected.services);assert.deepEqual(actual.reviews,expected.reviews);
  });
  await check('invalid quote styling and feedback cannot change saved content',async()=>{
    const doc=await content();
    const invalidCases=[d=>d.quotes[0].duration=0,d=>d.quotes[0].duration=121,d=>d.quotes[0].duration=3.5,d=>d.quotes[0].fontSize=41,d=>d.quotes[0].side='ceiling',d=>d.quotes[0].frame='unknown',d=>d.quotes[0].font='url(evil)',d=>d.quotes[0].color='red',d=>d.quotes[0].background='#fff;display:none',d=>d.quotes.push(structuredClone(d.quotes[0])),d=>d.reviews[0].enabled='true',d=>d.reviews[0].attribution='',d=>d.services[0].title=''];
    for(const mutate of invalidCases){const invalid=structuredClone(doc);mutate(invalid);assert.equal((await put(invalid)).status,422);}
    assert.deepEqual(await content(),doc);
  });
  await check('authentication protects studio and editing APIs',async()=>{
    for(const route of ['/admin','/admin/','/admin.html','/admin.js']){const r=await fetch(base+route,{redirect:'manual'});assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/login.html');}
    for(const route of ['/api/admin/session','/api/media'])assert.equal((await fetch(base+route)).status,401);
    assert.equal((await fetch(base+'/api/content',{method:'PUT',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(await content())})).status,401);
    assert.equal((await fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:'https://evil.test','Content-Type':'application/json'},body:'{}'})).status,403);
    const bad=()=>fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:testEmail,password:'wrong'})});
    assert.equal((await bad()).status,401);
    await login();
    const previousCookie=cookie;await login();assert.equal((await fetch(base+'/api/admin/session',{headers:{Cookie:previousCookie}})).status,401);
    const logout=await fetch(base+'/api/admin/logout',{method:'POST',headers:headers()});assert.equal(logout.status,200);assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
    assert.equal((await fetch(base+'/api/admin/session',{headers:{Cookie:cookie}})).status,401);
    await login();
    for(let i=0;i<8;i++)assert.equal((await bad()).status,401);
    assert.equal((await bad()).status,429);
  });
  await writeFile(path.join(qa,'api-test-results.json'),JSON.stringify({passed:checks.length,checks,scope:'Isolated fixture; live user content and media untouched.'},null,2)+'\n');
  console.log(`All ${checks.length} API integration checks passed.`);
} finally {
  await stop();
  // This fixture was created by this test; verify it remains directly inside qa before removal.
  const resolved=path.resolve(fixture);if(path.dirname(resolved)!==path.resolve(qa)||!path.basename(resolved).startsWith('cms-api-fixture-'))throw new Error('Refusing to remove an unexpected fixture path.');
  await rm(resolved,{recursive:true,force:true});
}
