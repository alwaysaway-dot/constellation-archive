import {mobiusPoint,project,TAU,type GalaxyLayout} from './mobius-model';

export type MaterialHit={u:number;v:number;distance:number;x:number;y:number};
export type InputState={pointerType:string;hover:number;u:number;v:number;eventId:number;eventU:number;eventV:number;eventAt:number;tiltTarget:number;gesture:'none'|'pending'|'vertical'|'horizontal';tapCount:number;dragCount:number};
export const newInput=():InputState=>({pointerType:'none',hover:0,u:0,v:0,eventId:0,eventU:0,eventV:0,eventAt:-10000,tiltTarget:0,gesture:'none',tapCount:0,dragCount:0});
export function gestureIntent(dx:number,dy:number):'pending'|'vertical'|'horizontal'{
 if(Math.abs(dy)>10&&Math.abs(dy)>=Math.abs(dx)*.65)return 'vertical';
 if(Math.abs(dx)>18&&Math.abs(dx)>Math.abs(dy)*1.8)return 'horizontal';
 return 'pending';
}
export function hitProxy(layout:GalaxyLayout){
 // Only 672 coarse material samples; never hit-test 24k particles or read layout per move.
 const samples:MaterialHit[]=[];
 for(let i=0;i<96;i++)for(let j=0;j<7;j++){const u=i/96*TAU,v=(j/6*2-1)*1.32,p=project(mobiusPoint(u,v),layout);samples.push({u,v,x:p[0],y:p[1],distance:0})}
 return (x:number,y:number,radius:number)=>{let nearest:MaterialHit|null=null,best=radius*radius;for(const s of samples){const d=(s.x-x)**2+(s.y-y)**2;if(d<best){best=d;nearest=s}}return nearest?{...nearest,distance:Math.sqrt(best)}:null};
}
export function bindMobiusInput(host:HTMLElement,input:InputState,pick:(x:number,y:number)=>MaterialHit|null,allowed:()=>boolean,wake:()=>void){
 let pendingMouse=0;
 let pointer=-1,startX=0,startY=0,startAt=0,lastMove=0,startHit:MaterialHit|null=null,releaseClickUntil=0;
 const ignored=(e:PointerEvent)=>!allowed()||!(e.target instanceof Element)||!!e.target.closest('button,a,input,dialog,[role=button]');
 const pulse=(hit:MaterialHit)=>{input.eventU=hit.u;input.eventV=hit.v;input.eventAt=performance.now();input.eventId++;wake()};
 const clear=()=>{clearTimeout(pendingMouse);pendingMouse=0;input.hover=0;input.tiltTarget=0;input.gesture='none';if(pointer>=0&&host.hasPointerCapture(pointer))host.releasePointerCapture(pointer);pointer=-1;startHit=null;wake()};
 const down=(e:PointerEvent)=>{if(e.pointerType==='mouse'||ignored(e))return;if(!e.isPrimary){clear();return}startHit=pick(e.clientX,e.clientY);if(!startHit)return;pointer=e.pointerId;startX=e.clientX;startY=e.clientY;startAt=performance.now();input.gesture='pending';};
 const move=(e:PointerEvent)=>{
  if(ignored(e)){clear();return}
  const now=performance.now();
  input.pointerType=e.pointerType;
  if(e.pointerType==='mouse'){
   clearTimeout(pendingMouse);pendingMouse=0;if(now-lastMove<24){pendingMouse=window.setTimeout(()=>move(e),24-(now-lastMove));return}lastMove=now;const hit=pick(e.clientX,e.clientY);
   if(hit){if(!input.hover||Math.abs(hit.u-input.u)>.45)pulse(hit);input.u=hit.u;input.v=hit.v;input.hover=1}else input.hover=0;wake();return;
  }
  if(e.pointerId!==pointer||!startHit)return;
  const dx=e.clientX-startX,dy=e.clientY-startY;
  if(input.gesture==='pending'){
   const intent=gestureIntent(dx,dy);input.gesture=intent;
   if(intent==='horizontal'){host.setPointerCapture(e.pointerId);input.dragCount++;pulse(startHit)}
  }
  if(input.gesture==='horizontal'){
   // pan-y leaves vertical scrolling to the browser; capture only after clear horizontal intent.
   input.tiltTarget=Math.max(-.22,Math.min(.22,dx/Math.max(320,innerWidth)*1.1));input.u=startHit.u;input.v=startHit.v;input.hover=.45;wake();
  }
 };
 const up=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;if(!allowed()){clear();return}
  if(input.gesture==='pending'&&startHit&&performance.now()-startAt<500&&Math.hypot(e.clientX-startX,e.clientY-startY)<9){pulse(startHit);input.tapCount++}
  if(input.gesture==='horizontal')releaseClickUntil=performance.now()+450;clear();
 };
 const leave=(e:PointerEvent)=>{if(e.pointerType==='mouse'){clearTimeout(pendingMouse);pendingMouse=0;input.hover=0;wake()}};
 const cancel=()=>clear();
 const hidden=()=>{if(document.hidden)clear()};
 window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',hidden);
 const click=(e:MouseEvent)=>{if(performance.now()<releaseClickUntil&&e.target instanceof Element&&!e.target.closest('button,a,input')){e.preventDefault();e.stopPropagation()}};
 host.addEventListener('pointerdown',down,{passive:true});host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerup',up,{passive:true});host.addEventListener('pointercancel',cancel);host.addEventListener('pointerleave',leave);host.addEventListener('click',click,true);
 return()=>{clear();window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',hidden);host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',cancel);host.removeEventListener('pointerleave',leave);host.removeEventListener('click',click,true)};
}
