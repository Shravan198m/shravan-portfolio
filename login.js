const form=document.querySelector('#login-form'),status=document.querySelector('#login-status'),submit=form.querySelector('[type=submit]'),password=document.querySelector('#password'),show=document.querySelector('#show-password');
show.addEventListener('click',()=>{const visible=password.type==='password';password.type=visible?'text':'password';show.textContent=visible?'HIDE':'SHOW';show.setAttribute('aria-label',visible?'Hide password':'Show password');show.setAttribute('aria-pressed',String(visible));});
form.addEventListener('submit',async event=>{
  event.preventDefault();submit.disabled=true;status.textContent='Opening the studio…';
  try{
    const response=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.email.value,password:password.value})});
    const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to sign in.');
    password.value='';location.replace('/admin');
  }catch(error){status.textContent=error.message;submit.disabled=false;password.focus();}
});
