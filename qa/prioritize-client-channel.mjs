import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateContent} from '../server.mjs';
const root=join(fileURLToPath(new URL('..',import.meta.url)),'storage');
const path=join(root,'content.json');const raw=await readFile(path,'utf8');const doc=JSON.parse(raw);
const original=doc.channels.map(c=>c.id).join(',');
const order=['home','services','work','films','about','skills','journey','contact'];
if(original!==order.join(',')){
  doc.channels.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));doc.revision++;validateContent(doc);
  const backup=join(root,'backups');await mkdir(backup,{recursive:true});await writeFile(join(backup,`before-client-channel-${Date.now()}.json`),raw);
  const temp=join(root,`content-priority-${process.pid}.tmp`);await writeFile(temp,JSON.stringify(doc,null,2)+'\n');await rename(temp,path);
}
console.log(`Channel order: ${doc.channels.map(c=>c.id).join(' > ')}; revision ${doc.revision}`);
