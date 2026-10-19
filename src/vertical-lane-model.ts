/** Deterministic material coordinates, shared by WebGL and the static fallback. */
export type LanePoint={x:number;y:number;z:number;size:number;alpha:number;kind:number;phase:number;anchor:number;part:number;route?:[number,number]};
export const LANE_X_DESKTOP=[.40,.59,.43,.60,.39,.58,.42,.60,.40,.57];
export const LANE_X_MOBILE=[.35,.65,.37,.64,.35,.63,.37,.65,.35,.63];
export const LANE_DEPTH=[.5,-.8,.8,-.4,.3,-.7,.7,-.5,.4,-.6];
export const MOTIF_COLORS=['#c6bccf','#a9c9e9','#d0d9cf','#d4c5b0','#b5c4dc','#c7c5c3','#c8c6d7','#bdb0d9','#c3ced5','#dfc6a2'];
export const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function laneLayout(width:number,height:number){const mobile=width<=700,start=clamp(height*.32,220,300),step=mobile?390:420;return{mobile,start,step,total:start+9*step+Math.max(370,height*.62),xs:mobile?LANE_X_MOBILE:LANE_X_DESKTOP}}
export function focusIndex(ys:number[],scroll:number,height:number,previous:number){const target=scroll+height*.40;let nearest=0;for(let i=1;i<ys.length;i++)if(Math.abs(ys[i]-target)<Math.abs(ys[nearest]-target))nearest=i;return Math.abs(ys[previous]-target)<=Math.abs(ys[nearest]-target)+34?previous:nearest}
export function laneX(t:number,xs:number[]){const a=clamp(t,0,9),i=Math.min(8,Math.floor(a)),f=a-i,s=f*f*(3-2*f);return xs[i]+(xs[i+1]-xs[i])*s}
export function createLanePoints(width:number,height:number){
 const l=laneLayout(width,height),points:LanePoint[]=[];let seed=47391;
 const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(.0001,random())))*Math.cos(random()*Math.PI*2);
 const add=(x:number,y:number,z:number,size:number,alpha:number,kind:number,anchor=-1,part=0,phase=random()*Math.PI*2)=>points.push({x,y,z,size,alpha,kind,anchor,part,phase});
 // Far points stay rare. Mid-stream material has narrow ridges and larger uneven dust banks.
 for(let i=0;i<(l.mobile?500:850);i++){const layer=i%3;add(random()*width,random()*l.total,[-9,-4,4][layer]+random(),.7+random()*(layer===2?1.8:1),.09+random()*.30,0)}
 for(let i=0;i<(l.mobile?5000:8200);i++){
  const t=random()*9,n=Math.round(t),ridge=i%4!==0,phase=t*12.8;
  const strand=Math.sin(t*5.8)*12+Math.sin(t*13.1)*4;
  const spread=ridge?2.2+4*Math.pow(Math.sin(t*2.9),2):(l.mobile?24:38)*(1+.4*Math.sin(t*4.2));
  const x=laneX(t,l.xs)*width+strand+(i%3-1)*9+gaussian()*spread;
  const gap=.48+.52*Math.pow(Math.sin(t*4.1+.4),2);
  add(x,l.start+t*l.step,gaussian()*1.7-1,1.0+random()*1.6,(ridge?.54:.23)*gap+random()*.20,1,n,ridge?1:0,phase);
 }
 // Each work shares the material but has its own silhouette and transport direction.
 const scale=l.mobile?.90:1.10;
 for(let n=0;n<10;n++){
  const x=l.xs[n]*width,y=l.start+n*l.step;
  for(let i=0;i<(l.mobile?780:1180);i++){
   const t=random(),a=t*Math.PI*2,part=i%2,j=gaussian(),k=gaussian();let dx=0,dy=0,z=0,alpha=.48+random()*.38;
   switch(n){
    case 0: {const angle=a+(part?1.25:0);dx=(part?22:-22)+Math.cos(angle)*47+j*5;dy=Math.sin(angle)*22+(part?12:-12)+k*5;z=Math.sin(angle)*2+(part?-.5:.5);break}
    case 1: {const angle=t*Math.PI*1.36+(part?Math.PI:.1);dx=Math.cos(angle)*83;dy=Math.sin(angle)*22;const xx=dx;dx=dx*.86-dy*.5;dy=xx*.5+dy*.86+(part?7:-7);dx+=j*3.5;dy+=k*3.5;z=Math.sin(angle)*2;break}
    case 2: {const branch=i%7,theta=branch*2.399;const r=t*86;dx=Math.cos(theta+Math.sin(t*3)*.20)*r+j*(2+t*3);dy=Math.sin(theta+Math.sin(t*3)*.20)*r*.68+k*3;z=Math.sin(theta)*t*2;alpha*=1-t*.5;break}
    case 3: dx=j*(2+Math.abs(t-.5)*13)+(part?12:-12);dy=(t-.5)*142+k*2;z=part?1:-1;break;
    case 4: {const r=Math.abs(j)*26;dx=Math.cos(a)*r+part*31;dy=Math.sin(a)*r*.75+part*13;z=part?-1:1;alpha*=part?.40:1;break}
    case 5: {const angle=t*Math.PI*1.7,r=28+random()*36;dx=Math.cos(angle)*r+30;dy=Math.sin(angle)*r*.68-9;z=Math.sin(angle)*2;break}
    case 6: {const v=(t-.5)*160;dx=v*.76+j*(2+Math.abs(v)*.07);dy=v*.59+k*3;z=v*.022;alpha*=.5+.5*Math.exp(-v*v/1800);break}
    case 7: {const angle=t*Math.PI*1.7;dx=Math.cos(angle)*76+j*4;dy=Math.sin(angle)*40+k*3;z=Math.sin(angle)*1.8;alpha*=.28+.72*(1-t);break}
    case 8: {dx=(t-.5)*150;dy=(i%3-1)*23+Math.sin(t*5.8)*10+k*3;z=(i%3-1)*2;alpha*=.35+.65*Math.pow(Math.sin(t*9.4),2);break}
    case 9: {const group=i%5,cx=[-35,25,43,-8,-14][group],cy=[-15,-26,20,34,-7][group];dx=cx+Math.cos(a)*13+j*3;dy=cy+Math.sin(a)*8+k*3;z=Math.sin(a)*2;alpha*=.7+.3*Math.sin(t*10);break}
   }
   // A graded handful of resolved stars gives the contour a readable hierarchy.
   const bright=i%37===0;
   add(x+dx*scale,y+dy*scale,LANE_DEPTH[n]+z,bright?3.4+random()*1.8:1.05+random()*1.7,bright?.92:alpha,4,n,part,a);
   points[points.length-1].route=[t,i];
  }
  // A few resolved stars, with much smaller halo than the surrounding constellation.
  for(let i=0;i<12;i++)add(x+gaussian()*58*scale,y+gaussian()*48*scale,1+random()*3,2+random()*2,.50+random()*.35,2,n);
  add(x,y,LANE_DEPTH[n],15,.95,3,n);
  if(n===0)add(x+36*scale,y+17*scale,1,13,.85,3,n);
 }
 return{layout:l,points};
}
