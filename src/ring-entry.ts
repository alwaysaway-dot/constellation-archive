import {galaxyLayout,mobiusPoint,world,type GalaxyLayout} from './mobius-model';
import {laneLayout,type LanePoint} from './vertical-lane-model';
export const ENTRY_U=2.8,ENTRY_V=.3;
const ease=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export type EntryPlan={layout:GalaxyLayout;source:number[];mate:number[];uv:number[];roll:number;endZ:number};
export type EntryCamera={eye:number[];roll:number};
export function projectEntry(point:number[],camera:EntryCamera,w:number,h:number,fov=35){const f=h/(2*Math.tan(fov*Math.PI/360)),d=camera.eye[2]-point[2],x=point[0]-camera.eye[0],y=point[1]-camera.eye[1],c=Math.cos(camera.roll),s=Math.sin(camera.roll);return[w/2+f*(c*x+s*y)/d,h/2+f*(s*x-c*y)/d]}
function anchoredCamera(source:number[],screen:number[],z:number,roll:number,w:number,h:number,fov:number):EntryCamera{const f=h/(2*Math.tan(fov*Math.PI/360)),dx=(screen[0]-w/2)*(z-source[2])/f,dy=(screen[1]-h/2)*(z-source[2])/f,c=Math.cos(roll),s=Math.sin(roll);return{eye:[source[0]-c*dx-s*dy,source[1]-s*dx+c*dy,z],roll}}
export function entryCamera(plan:EntryPlan,progress:number,reduced=false):EntryCamera{
 const p=Math.max(0,Math.min(1,progress)),l=plan.layout,w=l.width,h=l.height;if(reduced)return{eye:[0,0,18],roll:0};
 const start=projectEntry(plan.source,{eye:[0,0,18],roll:0},w,h),target=laneLayout(w,h),t=ease(0,.92,p),turn=ease(.25,.92,p);
 const screen=[start[0]+(target.xs[0]*w-start[0])*t,start[1]+(target.start-start[1])*t];
 return anchoredCamera(plan.source,screen,18+(plan.endZ-18)*ease(0,.92,p),plan.roll*turn,w,h,35);
}
/** Stable material anchor; solve the second material point once so both cores match exactly. */
export function createEntryPlan(w:number,h:number,layout=galaxyLayout(w,h)):EntryPlan{
 const source=world(mobiusPoint(ENTRY_U,ENTRY_V),layout),q=world(mobiusPoint(ENTRY_U+.002,ENTRY_V),layout),initial={eye:[0,0,18],roll:0},a=projectEntry(source,initial,w,h),b=projectEntry(q,initial,w,h);
 const roll=Math.PI/2-Math.atan2(b[1]-a[1],b[0]-a[0]),endZ=source[2]+(18-source[2])/(w<701?3.2:2.65);
 const plan:EntryPlan={layout,source,mate:source,uv:[ENTRY_U,ENTRY_V],roll,endZ},end=entryCamera(plan,1),l=laneLayout(w,h),scale=w<701?.90:1.10,target=[l.xs[0]*w+36*scale,l.start+17*scale];
 let u=ENTRY_U,v=ENTRY_V;
 for(let k=0;k<7;k++){const at=(u:number,v:number)=>projectEntry(world(mobiusPoint(u,v),layout),end,w,h),p=at(u,v),du=at(u+.001,v),dv=at(u,v+.001),ax=(du[0]-p[0])/.001,ay=(du[1]-p[1])/.001,bx=(dv[0]-p[0])/.001,by=(dv[1]-p[1])/.001,det=ax*by-ay*bx,ex=target[0]-p[0],ey=target[1]-p[1];u+=(ex*by-ey*bx)/det;v+=(ax*ey-ay*ex)/det;}
 plan.uv=[u,v];plan.mate=world(mobiusPoint(u,v),layout);return plan;
}
export function entryFrame(plan:EntryPlan,p:number){const camera=entryCamera(plan,p),l=plan.layout;return{camera,first:projectEntry(plan.source,camera,l.width,l.height),second:projectEntry(plan.mate,camera,l.width,l.height)}}
/** Match two projected cores, including their different depths; no second pull-back camera. */
export function laneEntryCamera(plan:EntryPlan,p:number,reduced=false):EntryCamera{
 if(p>=.92||reduced)return{eye:[0,0,20],roll:0};
 const{first,second}=entryFrame(plan,p),w=plan.layout.width,h=plan.layout.height,l=laneLayout(w,h),scale=w<701?.9:1.1,f=h/(2*Math.tan(21*Math.PI/180));
 const aw=[(l.xs[0]*w-w/2)*(20-.5)/f,(h/2-l.start)*(20-.5)/f,.5],bw=[(l.xs[0]*w+36*scale-w/2)*19/f,(h/2-l.start-17*scale)*19/f,1];
 const dx=second[0]-first[0],dy=second[1]-first[1],ox=(first[0]-w/2)*.5,oy=(first[1]-h/2)*.5,wx=f*(bw[0]-aw[0]),wy=-f*(bw[1]-aw[1]);
 const A=dx*dx+dy*dy,B=-2*(dx*ox+dy*oy),C=ox*ox+oy*oy-wx*wx-wy*wy,D=(-B+Math.sqrt(B*B-4*A*C))/(2*A),roll=Math.atan2(dy*D-oy,dx*D-ox)-Math.atan2(wy,wx);
 return anchoredCamera(aw,first,D+1,roll,w,h,42);
}
export function entryState(p:number,reduced=false){return{first:reduced?ease(.30,.72,p):ease(.40,.75,p),rest:reduced?ease(.45,.92,p):ease(.70,.98,p),takeover:reduced?ease(.30,.70,p):ease(.63,.98,p),labels:ease(.90,1,p)}};

/** Reuse the selected material patch, not a newly generated connecting curve. */
export function entryPatch(plan:EntryPlan,grains:{u:number;v:number;offset:number[];size:number;alpha:number;seed:number}[]):LanePoint[]{
 const w=plan.layout.width,h=plan.layout.height,end=entryCamera(plan,1);
 return grains.filter(g=>Math.abs(g.u-ENTRY_U)<.70).slice(0,w<701?1400:2100).map(g=>{
  const q=world(mobiusPoint(g.u,g.v).map((x,i)=>x+g.offset[i]),plan.layout),s=projectEntry(q,end,w,h),edge=1-ease(.42,.70,Math.abs(g.u-ENTRY_U));
  return{x:s[0],y:s[1],z:(q[2]-plan.source[2])*.5+.5,size:Math.min(g.size,2.7),alpha:g.alpha*.72*edge,kind:6,anchor:-1,part:0,phase:g.seed};
 });
}
