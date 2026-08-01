const screens=[...document.querySelectorAll('.screen')];
const notes=[
  'Pause in the darkness. Let the date and time land. Welcome them to the first chapter.',
  'Invite everyone to think quietly of a parent, teacher, mentor, or family member. Leave room for the ten-second reflection.',
  'Welcome Batch 01 warmly. Emphasize that curiosity and willingness matter more than existing knowledge.',
  'Walk through the five milestones. Ask learners to hover or click each one and connect the pathway to real work.',
  'Read the commitment with a calm pause between lines. Invite the group to click “I’M IN” together.',
  'End with confidence. Let this screen remain on display for photos, then invite everyone to begin the journey.'
];
let index=0, soundOn=false, start=Date.now(), reflectionTimer, reflectionStarted=false, ambience;
const pad=n=>String(n).padStart(2,'0');
function show(n){
  if(n===6){openMemory();return} if(n<0||n>5)return;
  screens.forEach(s=>s.classList.remove('active')); index=n; screens[index].classList.add('active'); document.querySelector('.hud').style.opacity='1';
  document.querySelector('#current').textContent=pad(index+1); document.querySelector('.progress i').style.width=`${(index+1)/6*100}%`;
  document.querySelector('#present-current').textContent=`${pad(index+1)} — ${screens[index].dataset.title}`;
  document.querySelector('#present-next').textContent=index<5?`${pad(index+2)} — ${screens[index+1].dataset.title}`:'Finale / photograph moment';
  document.querySelector('#speaker-notes').textContent=notes[index];
  if(index===1&&!reflectionStarted)startReflection(); if(soundOn)chime();
}
function startReflection(){reflectionStarted=true;let n=10;const el=document.querySelector('#countdown');reflectionTimer=setInterval(()=>{n--;el.textContent=n;if(n<=0)clearInterval(reflectionTimer)},1000)}
function startAmbience(){
  if(ambience){ambience.ctx.resume();return}
  const ctx=new (window.AudioContext||window.webkitAudioContext)(); const master=ctx.createGain(); master.gain.value=.055; master.connect(ctx.destination);
  const tone=(frequency,volume,detune=0)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();osc.type='sine';osc.frequency.value=frequency;osc.detune.value=detune;filter.type='lowpass';filter.frequency.value=900;gain.gain.value=volume;osc.connect(filter).connect(gain).connect(master);osc.start();return {osc,gain}};
  const notes=[tone(130.81,.31,-4),tone(196,.17,3),tone(261.63,.12,0),tone(329.63,.06,5)];
  const lfo=ctx.createOscillator(),lfoGain=ctx.createGain();lfo.frequency.value=.065;lfoGain.gain.value=.035;lfo.connect(lfoGain);notes.forEach(n=>lfoGain.connect(n.gain));lfo.start();
  ambience={ctx,master,notes,lfo};
}
function toggleAmbience(){soundOn=!soundOn;const label=document.querySelector('#sound span');if(soundOn){startAmbience();label.textContent='MUSIC ON'}else{ambience?.ctx.suspend();label.textContent='MUSIC OFF'}}
function chime(){if(!soundOn)return;const a=ambience?.ctx||new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.frequency.value=659.25;g.gain.setValueAtTime(.018,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.55);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+.56)}
document.addEventListener('keydown',e=>{if(['ArrowRight',' ','PageDown'].includes(e.key)){e.preventDefault();show(index+1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(index-1)}if(e.key==='Escape')toggleOverview();if(e.key.toLowerCase()==='f')toggleFullscreen();if(e.key.toLowerCase()==='p')togglePresenter();if(e.key.toLowerCase()==='m')openMemory()});
document.querySelector('.prev').onclick=()=>show(index-1);document.querySelector('.next').onclick=()=>show(index+1);
document.querySelectorAll('.milestone').forEach(b=>b.addEventListener('mouseenter',()=>activateMilestone(b)));document.querySelectorAll('.milestone').forEach(b=>b.addEventListener('click',()=>activateMilestone(b)));
function activateMilestone(b){document.querySelectorAll('.milestone').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('#path-note').textContent=b.dataset.note}
document.querySelector('#pledge-button').onclick=()=>{const promise=document.querySelector('.promise');promise.classList.add('affirmed');document.querySelector('#pledge-button').setAttribute('aria-pressed','true')};
document.querySelector('#journey-button').onclick=()=>document.querySelector('.finale').classList.add('begun');
document.querySelector('#sound').onclick=toggleAmbience;
document.addEventListener('pointerdown',e=>{if(!soundOn&&!e.target.closest('#sound')){soundOn=true;startAmbience();document.querySelector('#sound span').textContent='MUSIC ON'}},{once:true});
document.addEventListener('keydown',()=>{if(!soundOn){soundOn=true;startAmbience();document.querySelector('#sound span').textContent='MUSIC ON'}},{once:true});
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};document.querySelector('#fullscreen').onclick=toggleFullscreen;
const overview=document.querySelector('#overview');function toggleOverview(){overview.classList.toggle('open')}function openMemory(){screens[index].classList.remove('active');document.querySelector('.memory').classList.add('active');document.querySelector('.hud').style.opacity='.35'};
document.querySelector('#overview-list').innerHTML=screens.slice(0,6).map((s,i)=>`<button data-i="${i}"><b>${pad(i+1)}</b>${s.dataset.title}</button>`).join('');document.querySelectorAll('#overview-list button').forEach(b=>b.onclick=()=>{overview.classList.remove('open');show(+b.dataset.i)});
const presenter=document.querySelector('#presenter');function togglePresenter(){presenter.classList.toggle('open');show(index)}document.querySelector('#presenter-close').onclick=togglePresenter;
setInterval(()=>{let t=Math.floor((Date.now()-start)/1000);document.querySelector('#elapsed').textContent=`${pad(Math.floor(t/60))}:${pad(t%60)}`},1000);
document.addEventListener('mousemove',e=>{document.documentElement.style.setProperty('--x',e.clientX+'px');document.documentElement.style.setProperty('--y',e.clientY+'px')});
const canvas=document.querySelector('#particles'),ctx=canvas.getContext('2d');let dots=[];function resize(){canvas.width=innerWidth;canvas.height=innerHeight;dots=Array.from({length:45},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.1+.15,v:Math.random()*.18+.03,a:Math.random()*.5+.1}))}function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);dots.forEach(d=>{d.y-=d.v;if(d.y<0)d.y=canvas.height;ctx.fillStyle=`rgba(230,186,83,${d.a})`;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,7);ctx.fill()});requestAnimationFrame(draw)}addEventListener('resize',resize);resize();draw();show(0);
