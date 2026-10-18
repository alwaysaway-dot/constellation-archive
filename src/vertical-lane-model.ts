/** Shared material coordinates for the perspective field and its static fallback. */
export type LanePoint={x:number;y:number;z:number;size:number;alpha:number;kind:number;phase:number;anchor:number};
export const LANE_X_DESKTOP=[.39,.59,.43,.61,.38,.58,.42,.60,.40,.57];
export const LANE_X_MOBILE=[.20,.70,.25,.69,.21,.68,.25,.71,.22,.67];
export const LANE_DEPTH=[.5,-.8,.8,-.4,.3,-.7,.7,-.5,.4,-.6];
export const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function laneLayout(width:number,height:number){const mobile=width<=700,start=clamp(height*.32,220,300),step=mobile?280:300;return{mobile,start,step,total:start+9*step+Math.max(300,height*.55),xs:mobile?LANE_X_MOBILE:LANE_X_DESKTOP}}
export function focusIndex(ys:number[],scroll:number,height:number,previous:number){const target=scroll+height*.45;let nearest=0;for(let i=1;i<ys.length;i++)if(Math.abs(ys[i]-target)<Math.abs(ys[nearest]-target))nearest=i;return Math.abs(ys[previous]-target)<=Math.abs(ys[nearest]-target)+34?previous:nearest}
export function laneX(t:number,xs:number[]){const a=clamp(t,0,9),i=Math.min(8,Math.floor(a)),f=a-i,s=f*f*(3-2*f);return xs[i]+(xs[i+1]-xs[i])*s}
export function createLanePoints(width:number,height:number){
 const l=laneLayout(width,height),points:LanePoint[]=[];let seed=47391;
 const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(.0001,random())))*Math.cos(random()*Math.PI*2);
 const add=(x:number,y:number,z:number,size:number,alpha:number,kind:number,anchor=-1)=>points.push({x,y,z,size,alpha,kind,anchor,phase:random()*Math.PI*2});
 // Quiet, depth-separated background. No repeated screen-space dot texture.
 for(let i=0;i<(l.mobile?900:1500);i++){const layer=i%3;add(random()*width,random()*l.total,[-9,-4,4][layer]+random(),.7+random()*(layer===2?1.3:.8),.07+random()*.27,0)}
 // Intermittent material stream, widened into asymmetric clusters near each work.
 for(let i=0;i<(l.mobile?6800:11000);i++){
  const t=random()*9,near=Math.round(t),gap=Math.sin(t*5.1+.8);if(random()>.42+.48*Math.abs(gap))continue;
  const x=laneX(t,l.xs)*width,y=l.start+t*l.step,spread=(l.mobile?13:24)*(1+.7*Math.cos(t*3.8));
  add(x+gaussian()*spread,y+gaussian()*17,-1.5+gaussian()*1.3,.65+random()*1.4,.15+random()*.35,1,near);
 }
 for(let n=0;n<10;n++){
  const x=l.xs[n]*width,y=l.start+n*l.step,sign=n%2===0?-1:1;
  for(let i=0;i<(l.mobile?380:650);i++){
   const a=random()*Math.PI*2,r=Math.abs(gaussian()),dx=Math.cos(a)*r*(l.mobile?24:39),dy=Math.sin(a)*r*50;
   add(x+dx+sign*8*r,y+dy,LANE_DEPTH[n]+gaussian()*1.5,.65+random()*1.7,.22+random()*.44,1,n);
  }
  // A sparse fringe, not a miniature spiral galaxy or a luminous ball.
  for(let i=0;i<18;i++)add(x+gaussian()*50,y+gaussian()*75,1+random()*3,1.5+random(),.34+random()*.28,2,n);
  add(x,y,LANE_DEPTH[n],18,.95,3,n);
 }
 return{layout:l,points};
}
