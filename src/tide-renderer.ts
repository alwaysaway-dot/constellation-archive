type State={audio:HTMLAudioElement|null;analyser:AnalyserNode|null;context:AudioContext|null;current:boolean;playing:boolean;reduced:boolean};
type Signal={power:number;pulse:number;tone:number;air:number};
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
const zero=():Signal=>({power:0,pulse:0,tone:0,air:0});
/** Histories of measured energy changes travel outwards. No autonomous time oscillator. */
export function createTide(canvas:HTMLCanvasElement,read:()=>State) {
 const ctx=canvas.getContext('2d');
 if(!ctx)return {wake:()=>{},dispose:()=>{}};
 const g=ctx;
 const diagnostics={frames:0,samples:0,rms:0,peak:0,running:false,reason:'idle',disposed:false,analysisFailed:false};
 // Read-only runtime evidence for browser acceptance; never drives application state.
 Object.defineProperty(canvas,'__tide',{value:diagnostics,configurable:true});
 const waveform=new Float32Array(1024),frequency=new Uint8Array(512);
 const history:Signal[]=Array.from({length:96},zero);
 let head=0,raf=0,last=0,width=0,height=0,dpr=1,visible=true,disposed=false;
 let primed=false;
 let signal=zero(),slow=0,release=0,spread=0,lastAudioTime=0;
 let boundAudio:HTMLAudioElement|null=null,boundContext:AudioContext|null=null;
 const held=[new Float32Array(81),new Float32Array(81)];
 let blendStart=0;
 const rawSampleAt=(delay:number):Signal=>{
  const offset=clamp(delay,0,94),i=Math.floor(offset),mix=offset-i;
  const a=history[(head-i+96)%96],b=history[(head-i-1+96)%96];
  return {power:a.power+(b.power-a.power)*mix,pulse:a.pulse+(b.pulse-a.pulse)*mix,tone:a.tone+(b.tone-a.tone)*mix,air:a.air+(b.air-a.air)*mix};
 };
 const sampleAt=(delay:number):Signal=>{
  const a=rawSampleAt(delay-1.8),b=rawSampleAt(delay),c=rawSampleAt(delay+1.8);
  return {power:(a.power+2*b.power+c.power)/4,pulse:(a.pulse+2*b.pulse+c.pulse)/4,tone:(a.tone+2*b.tone+c.tone)/4,air:(a.air+2*b.air+c.air)/4};
 };
 const stop=(reason:string)=>{cancelAnimationFrame(raf);raf=0;last=0;diagnostics.running=false;diagnostics.reason=reason};
 const clear=()=>{history.forEach(s=>Object.assign(s,zero()));signal=zero();slow=0;primed=false;spread=0;diagnostics.rms=0};
 const reset=()=>{clear();blendStart=performance.now();wake()};
 const measure=(dt:number,s:State)=>{
  s.analyser!.getFloatTimeDomainData(waveform);s.analyser!.getByteFrequencyData(frequency);
  let squares=0;for(const v of waveform)squares+=v*v;
  const rms=Math.sqrt(squares/waveform.length);diagnostics.rms=rms;diagnostics.samples++;
  const band=(lo:number,hi:number)=>{let n=0;for(let i=lo;i<hi;i++)n+=frequency[i]/255;return n/(hi-lo)};
  const low=band(1,8),mid=band(8,46),high=band(46,150);
  if(!primed){slow=rms;primed=true}
  slow+=(rms-slow)*(1-Math.exp(-dt/1.1));
  const power=clamp((rms-.004)*4.5),gate=clamp(rms/.025);
  const target={power,pulse:clamp((rms-slow)*3.6+(low-mid)*.3,-1,1)*gate,tone:(mid-high)*gate,air:high*power};
  // Fast enough to articulate a beat; release is gentler than attack.
  const smooth=1-Math.exp(-dt/(target.power>signal.power?.085:.16));
  for(const key of ['power','pulse','tone','air'] as const)signal[key]+=(target[key]-signal[key])*smooth;
  head=(head+1)%96;Object.assign(history[head],signal);
 };
 const draw=(live:boolean,now:number)=>{
  const mobile=width<420,segments=mobile?56:80,gap=mobile?43:48,half=width/2;
  const reach=Math.max(0,half-gap-(mobile?5:10)),maxY=mobile?16:22;
  g.clearRect(0,0,width,height);diagnostics.peak=0;
  const blend=blendStart?clamp((now-blendStart)/240):1;
  for(let side=0;side<2;side++){
   const dir=side===0?-1:1,points:{x:number;y:number;power:number}[]=[];
   for(let j=0;j<=segments;j++){
    const u=j/segments;
    // Slightly different propagation delay / spectral weighting, not mirrored curves.
    const a=sampleAt(u*(side?39:45)+(side?2:0)),b=sampleAt(u*32+8);
    const front=clamp((spread-u)*5),envelope=Math.sin(Math.PI*u)**.8;
    const quiet=1.5*Math.sin(Math.PI*u)*(side?-.7:1);
    const measured=clamp(a.pulse*(side?-1.12:1.28)+(a.tone-b.tone)*.65,-1,1);
    let y=quiet+maxY*envelope*measured*release*front*clamp(signal.power*7);
    const index=Math.round(u*80);
    if(blend<1)y=held[side][index]*(1-blend)+y*blend;
    held[side][index]=y;
    diagnostics.peak=Math.max(diagnostics.peak,Math.abs(y-quiet));
    points.push({x:half+dir*(gap+u*reach),y:height/2+y,power:a.power});
   }
   const path=(echo:boolean)=>{
    const rail=points.map((p,i)=>({...p,y:p.y+(echo?(side?-1:1)*Math.sin(Math.PI*i/segments)*(2+sampleAt(i/segments*43+6).air*5)*release:0)}));
    g.beginPath();g.moveTo(rail[0].x,rail[0].y);
    for(let i=1;i<rail.length-1;i++){const p=rail[i],next=rail[i+1];g.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2)}
    g.lineTo(rail[segments].x,rail[segments].y);
   };
   const grad=g.createLinearGradient(half+dir*gap,0,half+dir*(gap+reach),0);
   const brightness=.23+release*clamp(signal.power*3)*.44;
   grad.addColorStop(0,`rgba(172,201,217,${brightness})`);grad.addColorStop(.48,`rgba(151,182,202,${brightness*.73})`);grad.addColorStop(.84,`rgba(121,155,182,${brightness*.22})`);grad.addColorStop(1,'rgba(121,155,182,0)');
   g.strokeStyle=grad;g.lineWidth=.8;g.lineJoin='round';g.lineCap='round';path(false);g.stroke();
   if(!mobile&&release>.02){g.globalAlpha=.22;g.lineWidth=.5;path(true);g.stroke();g.globalAlpha=1}
   // At most one (mobile) or two isolated energy crests per wing; no emitter.
   if(live&&release>.05){let count=0;for(let j=8;j<segments-8;j++){
    const p=points[j],before=points[j-1],after=points[j+1],u=j/segments;
    if(p.power>.22&&p.power>before.power&&p.power>=after.power&&count<(mobile?1:2)){
     const alpha=clamp((p.power-.22)*1.4)*release*(1-u)**1.4;
     g.fillStyle=`rgba(205,222,232,${alpha})`;g.beginPath();g.arc(p.x,p.y,.85,0,Math.PI*2);g.fill();count++;j+=12;
    }
   }}
  }
  diagnostics.frames++;
 };
 const canSample=(s:State)=>!diagnostics.analysisFailed&&s.current&&s.playing&&!!s.audio&&!s.audio.paused&&!s.audio.seeking&&s.audio.readyState>=3&&!!s.analyser&&s.context?.state==='running';
 const tick=(now:number)=>{
  raf=0;if(disposed)return;
  const s=read();bind(s);
  if(document.hidden||!visible){stop(document.hidden?'hidden':'offscreen');clear();return}
  if(s.reduced){release=0;spread=0;draw(false,now);stop('reduced');return}
  const dt=last?Math.min((now-last)/1000,.1):1/30;
  if(last&&dt<.031){raf=requestAnimationFrame(tick);return}last=now;
  const live=canSample(s);
  if(live){
   if(Math.abs(s.audio!.currentTime-lastAudioTime)>.6&&lastAudioTime>0)reset();
   lastAudioTime=s.audio!.currentTime;
   try{measure(dt,s)}catch{diagnostics.analysisFailed=true;clear();release=0}
   spread=Math.min(1.25,spread+dt*1.5);
   release+=(1-release)*(1-Math.exp(-dt/.14));
  }else{release*=Math.exp(-dt/.105)}
  draw(live,now);
  if(live||release>.004||(blendStart&&now-blendStart<240)){
   diagnostics.running=true;diagnostics.reason=live?'audio':'settling';
   if(!raf)raf=requestAnimationFrame(tick);
  }else{release=0;clear();draw(false,now);stop(s.current&&s.playing?'analysis-unavailable':'idle')}
 };
 function bind(s:State){
  if(boundAudio!==s.audio){
   if(boundAudio){for(const e of ['playing','pause','waiting','ended','seeked'])boundAudio.removeEventListener(e,wake);boundAudio.removeEventListener('seeking',reset);boundAudio.removeEventListener('emptied',reset)}
   boundAudio=s.audio;
   if(boundAudio){for(const e of ['playing','pause','waiting','ended','seeked'])boundAudio.addEventListener(e,wake);boundAudio.addEventListener('seeking',reset);boundAudio.addEventListener('emptied',reset)}
  }
  if(boundContext!==s.context){boundContext?.removeEventListener('statechange',wake);boundContext=s.context;boundContext?.addEventListener('statechange',wake)}
 }
 function wake(){if(disposed)return;bind(read());if(document.hidden||!visible){stop(document.hidden?'hidden':'offscreen');clear();return}if(!raf)raf=requestAnimationFrame(tick)}
 const resize=()=>{const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(devicePixelRatio||1,width<420?1.5:2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);g.setTransform(dpr,0,0,dpr,0,0);wake()};
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;wake()},{threshold:0});intersection.observe(canvas);
 document.addEventListener('visibilitychange',wake);resize();
 return {wake,dispose:()=>{disposed=true;stop('disposed');diagnostics.disposed=true;resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',wake);bind({audio:null,context:null,analyser:null,current:false,playing:false,reduced:false});history.length=0;canvas.width=0;canvas.height=0}};
}
