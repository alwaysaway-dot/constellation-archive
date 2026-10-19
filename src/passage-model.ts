import {smooth} from './river-handoff';
import {laneLayout,laneX,type LanePoint} from './vertical-lane-model';
/** All six states are pure functions of native scroll. No triggered timeline. */
export function passage(progress:number,reduced=false){
 const p=Math.max(0,Math.min(1,progress));
 if(reduced)return{p,home:1-smooth(.05,.58,p),release:0,river:smooth(.36,.80,p),retreat:1,works:smooth(.62,.98,p),stage:p<.5?0:5};
 return{p,home:1-smooth(.31,.44,p),release:smooth(.12,.39,p),river:smooth(.48,.64,p),retreat:smooth(.65,1,p),works:smooth(.86,.98,p),stage:p<.12?0:p<.40?1:p<.49?2:p<.67?3:p<.95?4:5};
}
/** The same physical river as the final lane, with depth and local fold thickness. */
export function passageDust(w:number,h:number,count=w<701?1400:2100):LanePoint[]{
 const l=laneLayout(w,h);let seed=9373;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
 return Array.from({length:count},(_,i)=>{
 const t=-.65+random()*3.3,side=(random()+random()+random()-1.5),ridge=i%4!==0;
 return{x:laneX(t,l.xs)*w+Math.sin(t*5.8)*12+(i%3-1)*9+side*(ridge?21:100),y:l.start+t*l.step,z:Math.sin(t*4.5)*2+side*3-1,size:1+random()*1.7,alpha:(ridge?.44:.20)+random()*.18,kind:6,anchor:-1,part:ridge?1:0,phase:random()*Math.PI*2};
 });
}
/** Small orbit and retreat. At 1 the original map camera is exactly restored. */
export function riverView(w:number,h:number,progress:number,reduced=false){
 const v=passage(progress,reduced),near=1-v.retreat,pixel=2*Math.tan(21*Math.PI/180)*20/h,l=laneLayout(w,h);
 const targetY=(h*.5-l.start-l.step*.55)*pixel*near;
 return{eye:[2.5*near,targetY+1.1*near,20-12*near],target:[0,targetY,0],roll:.53*near,width:1+near*.7,view:v};
}
