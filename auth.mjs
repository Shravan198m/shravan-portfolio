import { readFile } from 'node:fs/promises';
import { randomBytes, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(derive);
const lifetime=8*60*60*1000;
export async function createAuth(file){
  const account=JSON.parse(await readFile(file,'utf8'));
  if(account.algorithm!=='scrypt'||!/^([a-f0-9]{2}){32}$/.test(account.salt)||!/^([a-f0-9]{2}){64}$/.test(account.hash)||typeof account.email!=='string')throw Error('Invalid administrator credentials file.');
  const sessions=new Map(),attempts=new Map();
  function current(req){
    const id=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('svm_admin='))?.slice(10);
    const session=sessions.get(id);
    if(!session)return null;
    if(session.expires<=Date.now()){sessions.delete(id);return null;}
    return {...session,id};
  }
  function cookie(res,id,age){res.setHeader('Set-Cookie',`svm_admin=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}`);}
  return {
    current,
    async login(req,res,email,password){
      const key=req.socket.remoteAddress||'local',now=Date.now();
      for(const [id,s] of sessions)if(s.expires<=now)sessions.delete(id);
      let recent=(attempts.get(key)||[]).filter(t=>now-t<15*60*1000);
      if(recent.length>=8){res.setHeader('Retry-After','900');return {status:429,error:'Too many sign-in attempts. Try again in 15 minutes.'};}
      recent.push(now);attempts.set(key,recent);
      if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>1024)return {status:401,error:'Email or password is incorrect.'};
      const hash=await scrypt(password,Buffer.from(account.salt,'hex'),64);
      if(!timingSafeEqual(hash,Buffer.from(account.hash,'hex'))||email.trim().toLowerCase()!==account.email.toLowerCase())return {status:401,error:'Email or password is incorrect.'};
      attempts.delete(key);
      const old=current(req);if(old)sessions.delete(old.id);
      const id=randomBytes(32).toString('hex');
      // One administrator: a new sign-in revokes previous browser sessions.
      sessions.clear();sessions.set(id,{token:randomBytes(32).toString('hex'),expires:now+lifetime});
      cookie(res,id,lifetime/1000);return {status:200,ok:true};
    },
    logout(req,res){const session=current(req);if(session)sessions.delete(session.id);cookie(res,'',0);}
  };
}
