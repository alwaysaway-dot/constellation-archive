import {useEffect,useRef} from 'react';
import './late-reply.css';

/** A local visual flag: removal leaves shared reading/playback/return behaviour intact. */
export const LATE_REPLY_ENABLED=true;
type Grain={x:number;y:number;u:number;r:number;a:number;silver:boolean};
type Layer={base:HTMLCanvasElement;light:HTMLCanvasElement|null;ctx:CanvasRenderingContext2D;glow:CanvasRenderingContext2D|null;grains:Grain[];width:number;height:number;dpr:number;far:boolean};
const cycle=11500,eventLength=2900;
function random(seed:number){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}};
function path(u:number,far:boolean){const v=1-u;return far?{x:v*v*v*.01+3*v*v*u*.52+3*v*u*u*.88+u*u*u*1.04,y:v*v*v*.04+3*v*v*u*.02+3*v*u*u*.43+u*u*u*.98}:{x:v*v*v*-.02+3*v*v*u*.03+3*v*u*u*.49+u*u*u*1.06,y:v*v*v*.04+3*v*v*u*.65+3*v*u*u*.92+u*u*u*.96}}
function colour(far:boolean,silver:boolean,alpha:number){return `rgba(${far?(silver?'187,205,224':'124,155,182'):(silver?'223,211,183':'202,157,105')},${alpha})`}

export function LateReplyDust({playing,reduced,reading=false}:{playing:boolean;reduced:boolean;reading?:boolean}){
 const root=useRef<HTMLDivElement>(null),isPlaying=useRef(playing);isPlaying.current=playing;
 useEffect(()=>{
  const host=root.current;if(!host)return;
  const layers:Layer[]=[];let disposed=false,inView=false,frame=0,timer=0,epoch=performance.now()+1600,lastFrame=0,strength=isPlaying.current?1:0;
  for(const patch of host.querySelectorAll<HTMLElement>('.reply-patch')){
   const base=patch.querySelector<HTMLCanvasElement>('.reply-base')!,light=patch.querySelector<HTMLCanvasElement>('.reply-light'),ctx=base.getContext('2d'),glow=light?.getContext('2d')??null;
   if(ctx)layers.push({base,light,ctx,glow,grains:[],width:0,height:0,dpr:0,far:patch.dataset.layer==='far'});
  }
  function clear(){for(const l of layers)l.glow?.clearRect(0,0,l.width,l.height)}
  function stop(){cancelAnimationFrame(frame);clearTimeout(timer);frame=0;timer=0;clear()}
  function size(){
   const mobile=window.matchMedia('(max-width:700px)').matches,dpr=Math.min(devicePixelRatio||1,mobile?1.5:2);
   for(const l of layers){const rect=l.base.parentElement!.getBoundingClientRect(),w=Math.round(rect.width),h=Math.round(rect.height);if(!w||!h||(w===l.width&&h===l.height&&dpr===l.dpr))continue;l.width=w;l.height=h;l.dpr=dpr;
    for(const c of [l.base,l.light])if(c){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.getContext('2d')?.setTransform(dpr,0,0,dpr,0,0)}
    const rnd=random(l.far?1783:6299),count=reading?180:mobile?(l.far?550:750):(l.far?1300:1800);l.grains=[];
    for(let i=0;i<count;i++){
     const u=rnd(),density=.55+.45*Math.sin(u*16+(l.far?1.1:0));if(rnd()>density)continue;
     const p=path(u,l.far),spread=(rnd()+rnd()+rnd()-1.5)*(l.far?.075:.09),edge=Math.sin(Math.PI*u)**.5;
     const grain={x:(p.x+spread*.7)*w,y:(p.y+spread)*h,u,r:(rnd()>.975?1.1:.35+rnd()*.52)*(l.far?.8:1),a:(.22+rnd()*.48)*edge*(l.far?.75:1),silver:rnd()>.48};l.grains.push(grain);
    }
    l.ctx.clearRect(0,0,w,h);
    for(const p of l.grains){l.ctx.fillStyle=colour(l.far,p.silver,p.a*(reading?.45:1));l.ctx.beginPath();l.ctx.arc(p.x,p.y,p.r,0,Math.PI*2);l.ctx.fill();}
    // A few broken, hairline streaks follow the same band; never an enclosing outline.
    for(let i=0;i<(mobile?5:9);i++){const u=.1+rnd()*.8,p=path(u,l.far),q=path(u+.014+rnd()*.02,l.far);l.ctx.strokeStyle=colour(l.far,true,(reading?.035:.065));l.ctx.lineWidth=.45;l.ctx.beginPath();l.ctx.moveTo(p.x*w,p.y*h);l.ctx.lineTo(q.x*w,q.y*h);l.ctx.stroke()}
   }
  }
  function available(){return !disposed&&!reading&&!reduced&&inView&&!document.hidden}
  function schedule(){
   stop();if(!available())return;const now=performance.now();if(epoch<now)epoch+=Math.ceil((now-epoch)/cycle)*cycle;
   timer=window.setTimeout(()=>{timer=0;lastFrame=performance.now();frame=requestAnimationFrame(animateDust)},Math.max(0,epoch-now));
  }
  function animateDust(now:number){
   frame=0;if(!available()){clear();return}const elapsed=now-epoch;
   if(elapsed>eventLength){clear();epoch+=cycle;schedule();return}
   // 30 Hz is sufficient for this small ambient gesture; no React updates per frame.
   if(now-lastFrame>=30){const dt=Math.min(.1,(now-lastFrame)/1000);lastFrame=now;strength+=(Number(isPlaying.current)-strength)*(1-Math.exp(-dt*7));
    for(const l of layers){const c=l.glow;if(!c)continue;c.clearRect(0,0,l.width,l.height);const t=(elapsed-(l.far?1650:0))/(l.far?1100:1000);if(t<0||t>1)continue;
     const u=(l.far?.16:.12)+t*(l.far?.55:.71),envelope=Math.sin(Math.PI*t)**1.2,boost=(l.far?.48:.62)+strength*.12;
     for(let i=0;i<l.grains.length;i+=2){const p=l.grains[i],distance=Math.abs(p.u-u);if(distance>.075)continue;const a=(1-distance/.075)*envelope*boost;c.fillStyle=colour(l.far,p.silver,a);c.beginPath();c.arc(p.x,p.y,p.r+.35,0,Math.PI*2);c.fill()}
    }
   }frame=requestAnimationFrame(animateDust);
  }
  size();const resize=new ResizeObserver(size);host.querySelectorAll('.reply-patch').forEach(el=>resize.observe(el));
  const visibility=new IntersectionObserver(([e])=>{if(inView===e.isIntersecting)return;inView=e.isIntersecting;schedule()});visibility.observe(host);
  document.addEventListener('visibilitychange',schedule);
  return()=>{disposed=true;stop();resize.disconnect();visibility.disconnect();document.removeEventListener('visibilitychange',schedule);layers.length=0};
 },[reduced,reading]);
 return <div ref={root} className={reading?'late-reading':'late-space'} aria-hidden="true">{(reading?['far']:['near','far']).map(layer=><div className={`reply-patch reply-${layer}`} data-layer={layer} key={layer}><canvas className="reply-base"/>{!reading&&<canvas className="reply-light"/>}</div>)}</div>;
}
