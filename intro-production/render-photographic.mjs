import { chromium } from '../tmp/browser-check/node_modules/playwright/index.mjs';
import { mkdir, readFile } from 'node:fs/promises';
const preview=process.argv.includes('--preview');
const output='tmp/photographic-intro-v3';await mkdir(output+'/frames',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 page.on('pageerror',error=>{throw error;});
 await page.route('**/__film-stage',route=>route.fulfill({contentType:'text/html',body:stage}));
 const stage=await readFile('intro-production/photographic-stage.html','utf8');
 await page.goto('http://127.0.0.1:4174/__film-stage');
 await page.evaluate(()=>window.stageReady);
 const frames=preview?[0,96,144,240,300,384,480,552,624,708]:Array.from({length:720},(_,i)=>i);
 for(const frame of frames){await page.evaluate(t=>window.renderFilm(t),frame/24);await page.locator('#film').screenshot({path:`${output}/${preview?'preview-':'frames/frame-'}${String(frame+1).padStart(4,'0')}.${preview?'png':'jpg'}`,...(preview?{}:{type:'jpeg',quality:97})});if(frame%72===0)console.log(`Rendered ${frame+1}/720`);}
 console.log(preview?'Photographic previews ready':'All 720 photographic frames rendered');
}finally{await browser.close();}
