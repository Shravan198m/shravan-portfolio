(() => {
  let ctx, master, rain, currentVoice=null, enabled=false;
  const score=new Audio('/assets/audio/intro-score.m4a'); score.preload='auto';
  score.id='intro-score-audio';score.hidden=true;document.body.append(score);
  const voices=Array.from({length:6},(_,i)=>{const a=new Audio(`/assets/audio/voice-0${i+1}.m4a`);a.preload='auto';a.id='voice-'+(i+1);a.hidden=true;document.body.append(a);return a;});
  function engine(){if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);}return ctx;}
  function noise(seconds,volume,frequency=1200){const c=engine(),buffer=c.createBuffer(1,Math.ceil(c.sampleRate*seconds),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=frequency;gain.gain.setValueAtTime(volume,c.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,c.currentTime+seconds);source.connect(filter);filter.connect(gain);gain.connect(master);source.start();source.stop(c.currentTime+seconds);return source;}
  function tone(frequency,seconds,volume,end=frequency){const c=engine(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(frequency,c.currentTime);o.frequency.exponentialRampToValueAtTime(end,c.currentTime+seconds);g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+seconds);o.connect(g);g.connect(master);o.start();o.stop(c.currentTime+seconds);}
  function sfx(type){if(!enabled||document.hidden)return;engine().resume().catch(()=>{});if(type==='click'){noise(.045,.13,2400);tone(180,.04,.08,75);}else if(type==='tape'){noise(.45,.045,700);tone(180,.4,.035,85);}else if(type==='power'){noise(.16,.08,3200);tone(1500,.35,.035,95);}else {noise(.23,.085,1900);tone(520,.14,.025,90);}}
  function stopRain(){if(rain){rain.stop();rain=null;}}
  function startRain(){if(!enabled||rain)return;const c=engine(),b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){last=(last+(Math.random()*2-1)*.03)/1.03;d[i]=last*3;}rain=c.createBufferSource();rain.buffer=b;rain.loop=true;const g=c.createGain();g.gain.value=.2;rain.connect(g);g.connect(master);rain.start();}
  function mute(value){enabled=!value;score.muted=value;voices.forEach(a=>a.muted=value);if(master)master.gain.value=value?0:.55;if(value)stopRain();document.dispatchEvent(new CustomEvent('portfolio:sound',{detail:{enabled}}));}
  window.PortfolioAudio={
    async unlock(value){mute(!value);if(value)await engine().resume();},
    start(){score.currentTime=0;score.volume=.44;score.muted=!enabled;if(enabled){score.play().catch(()=>{});startRain();}},
    narrate(index){const a=voices[index];currentVoice=a;voices.forEach(v=>{if(v!==a)v.pause();});score.volume=.17;a.currentTime=0;a.volume=.85;a.onended=()=>score.volume=.44;if(enabled)a.play().catch(()=>{score.volume=.44;});},
    resumeAt(time,index,offset){if(!enabled)return;engine().resume().catch(()=>{});voices.forEach(a=>a.pause());currentVoice=null;score.currentTime=time;score.volume=index>=0?.17:.44;score.play().catch(()=>{});if(index>=0){currentVoice=voices[index];currentVoice.currentTime=offset;currentVoice.play().catch(()=>{});}startRain();},
    pause(){score.pause();voices.forEach(a=>a.pause());stopRain();},
    resume(){if(enabled){score.play().catch(()=>{});if(currentVoice&&!currentVoice.ended)currentVoice.play().catch(()=>{});startRain();}},
    stop(){currentVoice=null;score.pause();score.currentTime=0;voices.forEach(a=>{a.pause();a.currentTime=0;});stopRain();},
    mute,sfx,get enabled(){return enabled;}
  };
  document.addEventListener('portfolio:sfx',e=>{enabled=!!e.detail.enabled;if(master)master.gain.value=enabled?.55:0;sfx(e.detail.type);});
})();

