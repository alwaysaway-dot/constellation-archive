import {galaxyLayout,mobiusPoint,project} from './mobius-model';
export const SOURCE_U=3.2;
export const SOURCE_V=.3;
export const RISE=1.05;
export const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export type RiverJourney={progress:number;span:number};
export type RiverHost=HTMLElement&{riverState?:RiverJourney};
export function sourceFrame(width:number,height:number){
 const l=galaxyLayout(width,height),p=project(mobiusPoint(SOURCE_U,SOURCE_V),l),q=project(mobiusPoint(SOURCE_U+.025,SOURCE_V),l);
 const length=Math.hypot(q[0]-p[0],q[1]-p[1]);
 return {point:p,tangent:[(q[0]-p[0])/length,(q[1]-p[1])/length]};
}
/** Both endpoints are expressed in the same viewport pixels as the visible source and work 01.
 * At progress=1 the bridge keeps its geometry, then scrolls away with the document. */
export function bridgeControls(frame:ReturnType<typeof sourceFrame>,width:number,height:number,firstX:number,firstY:number,progress:number,scroll:number){
 const beyond=Math.max(0,scroll),source=[frame.point[0],frame.point[1]-RISE*height*progress-beyond],end=[firstX,firstY-scroll];
 const length=Math.max(80,end[1]-source[1]);
 return [source,[source[0]+frame.tangent[0]*length*.40,source[1]+frame.tangent[1]*length*.40],[end[0]+width*(width<701?.35:.16),end[1]-Math.min(height*.32,length*.36)],end];
}
export function bezier(c:number[][],t:number){const a=1-t;return [0,1].map(k=>a*a*a*c[0][k]+3*a*a*t*c[1][k]+3*a*t*t*c[2][k]+t*t*t*c[3][k])}
