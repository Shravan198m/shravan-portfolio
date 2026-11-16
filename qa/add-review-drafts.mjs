import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateContent} from '../server.mjs';

const root=join(fileURLToPath(new URL('..',import.meta.url)),'storage');
const file=join(root,'content.json');
const original=await readFile(file,'utf8');
const doc=JSON.parse(original);
if(doc.reviews.length){console.log('Existing review records preserved; no draft change made.');process.exit(0);}
doc.reviews=[
  {id:'sample-review-ai',text:'Sample wording — In a world where AI can produce something quickly, the creative thinking behind a project still matters. What stood out here was the way Shravan questioned the obvious approach and found a clearer, more human way to present the idea.',attribution:'SAMPLE ONLY — replace with a real client’s words',enabled:false},
  {id:'sample-review-process',text:'Sample wording — The process felt thoughtful from the first conversation. Shravan listened to what we actually needed, explained the trade-offs in plain language, and kept the work moving without making us chase for updates.',attribution:'SAMPLE ONLY — replace with a real client’s words',enabled:false},
  {id:'sample-review-craft',text:'Sample wording — The final result had a level of care we noticed in the small details: how the pages read, how they behaved on a phone, and how the visuals supported the message. It felt made for our project rather than pulled from a template.',attribution:'SAMPLE ONLY — replace with a real client’s words',enabled:false},
  {id:'sample-review-delivery',text:'Sample wording — We appreciated the combination of technical ability and visual judgment. When a detail was not working, Shravan did not simply defend it; he tried another approach and helped us see why it worked better.',attribution:'SAMPLE ONLY — replace with a real client’s words',enabled:false}
];
doc.revision++;
validateContent(doc);
const backups=join(root,'backups');await mkdir(backups,{recursive:true});
await writeFile(join(backups,`before-sample-reviews-${Date.now()}.json`),original);
const tmp=join(root,`content.review-drafts-${process.pid}.tmp`);
await writeFile(tmp,JSON.stringify(doc,null,2)+'\n');await rename(tmp,file);
console.log(`Added ${doc.reviews.length} unpublished sample drafts; revision ${doc.revision}.`);
