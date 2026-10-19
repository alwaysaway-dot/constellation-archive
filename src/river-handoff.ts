export const RISE=0;
export const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export type RiverJourney={progress:number;span:number;origin?:number};
export type RiverHost=HTMLElement&{riverState?:RiverJourney};
/** Both renderers sample native scroll in their own frame, not a previous React/rAF state. */
export function readJourney(host:HTMLElement):RiverJourney{const j=(host.closest('.river-journey') as RiverHost)?.riverState;if(!j)return{progress:1,span:0};const y=document.body.style.position==='fixed'?-(parseFloat(document.body.style.top)||0):scrollY;const p=Math.max(0,Math.min(1,(y-(j.origin||0))/Math.max(1,j.span)));return{...j,progress:p>=.995?1:p}}
