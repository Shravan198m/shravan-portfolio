// Photographic 2.5D camera choreography. Each cut passes through a foreground
// doorway so the viewer feels the camera crossing a threshold.
(() => {
  const host=document.querySelector('#cinema-intro');
  if(!host)return;
  const shots=[
    ['rain',0,4,-7,4,1.08,1.32],
    ['coffee',4,8,9,-5,1.3,1.12],
    ['details',8,11,-6,5,1.15,1.3],
    ['room',11,15,8,-3,1.1,1.24],
    ['viewer',15,20,-5,3,1.12,1.35],
    ['television',20,22,2,0,1.05,1.3]
  ];
  const doorway=document.createElement('div');doorway.className='flight-doorway';
  doorway.setAttribute('aria-hidden','true');host.prepend(doorway);
  const light=document.createElement('div');light.className='flight-light';
  light.setAttribute('aria-hidden','true');host.append(light);
  const ease=t=>t*t*(3-2*t);
  window.updateIntroCamera=time=>{
    const shot=shots.find(s=>time>=s[1]&&time<s[2]);
    doorway.style.opacity=shot?'1':'0';
    if(!shot)return;
    const [name,start,end,x0,x1,z0,z1]=shot;
    const t=Math.max(0,Math.min(1,(time-start)/(end-start))),e=ease(t);
    const el=host.querySelector('.shot-'+name);
    if(el){
      el.style.transform=`perspective(1200px) translate3d(${x0+(x1-x0)*e}%,${Math.sin(t*Math.PI)*1.2}%,0) rotateY(${(1-e)*x0*.22}deg) scale(${z0+(z1-z0)*e})`;
      el.style.filter=`brightness(${.85+.15*Math.sin(t*Math.PI)})`;
    }
    // Fast foreground movement relative to the background is the parallax cue.
    doorway.style.transform=`perspective(700px) translateX(${-18+36*e}%) scale(${1+e*2.8})`;
    doorway.style.opacity=String(Math.max(0,1-t*2.8)*.85);
    light.style.opacity=String(.12+.1*Math.sin(time*.8));
  };
})();
