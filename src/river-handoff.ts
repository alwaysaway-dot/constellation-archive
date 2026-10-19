import {galaxyLayout,mobiusPoint,world,type GalaxyLayout} from './mobius-model';
export const SOURCE_U=2.4;
export const SOURCE_V=.3;
export const RISE=0;
export const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export type RiverJourney={progress:number;span:number;origin?:number};
export type RiverHost=HTMLElement&{riverState?:RiverJourney};
/** A translation through the near band, never a deformation of the half-twist. */
export function approachCamera(l:GalaxyLayout,progress:number){
 const p=smooth(0,1,progress),s=world(mobiusPoint(SOURCE_U,SOURCE_V),l),z=18-(l.width<701?12:8)*p;
 const targetX=l.width*(l.width<701?.35:.4),targetY=l.height*(.64-.80*p),f=l.height/(2*Math.tan(35*Math.PI/360));
 const aim=smooth(.08,.72,progress);
 return [(s[0]-(targetX-l.width/2)*(z-s[2])/f)*aim,(s[1]-(l.height/2-targetY)*(z-s[2])/f)*aim,z];
}
export function approachProject(p:number[],l:GalaxyLayout,progress:number){const a=approachCamera(l,progress),v=world(p,l),f=l.height/(2*Math.tan(35*Math.PI/360)*Math.max(.15,a[2]-v[2]));return[l.width/2+(v[0]-a[0])*f,l.height/2-(v[1]-a[1])*f,v[2]]}
export function sourceFrame(width:number,height:number,progress=0,layout?:GalaxyLayout){
 const l=layout||galaxyLayout(width,height),p=approachProject(mobiusPoint(SOURCE_U,SOURCE_V),l,progress),q=approachProject(mobiusPoint(SOURCE_U+.025,SOURCE_V),l,progress);
 const length=Math.hypot(q[0]-p[0],q[1]-p[1]);
 return {point:p,tangent:[(q[0]-p[0])/length,(q[1]-p[1])/length]};
}
/** The short near-band continuation joins a document-anchored first work. No S-shaped prelude. */
export function bridgeControls(frame:ReturnType<typeof sourceFrame>,_width:number,height:number,firstX:number,firstY:number,_progress:number,scroll:number){
 const beyond=Math.max(0,scroll),source=[frame.point[0],frame.point[1]-beyond],end=[firstX,firstY-scroll];
 const length=Math.max(30,end[1]-source[1]);
 return [source,[source[0]+frame.tangent[0]*Math.min(45,length*.12),source[1]+length*.28],[end[0],end[1]-Math.min(height*.20,length*.30)],end];
}
export function bezier(c:number[][],t:number){const a=1-t;return [0,1].map(k=>a*a*a*c[0][k]+3*a*a*t*c[1][k]+3*a*t*t*c[2][k]+t*t*t*c[3][k])}

/** Both renderers sample native scroll in their own frame, not a previous React/rAF state. */
export function readJourney(host:HTMLElement):RiverJourney{const j=(host.closest('.river-journey') as RiverHost)?.riverState;if(!j)return{progress:1,span:0};const y=document.body.style.position==='fixed'?-(parseFloat(document.body.style.top)||0):scrollY;const p=Math.max(0,Math.min(1,(y-(j.origin||0))/Math.max(1,j.span)));return{...j,progress:p>=.995?1:p}}
