import {useLayoutEffect,useState,type RefObject} from 'react';
/** Observe only boundaries; hysteresis prevents controls flickering at the viewport edge. */
export function useMainPlayerVisibility(id:number|null,mini:RefObject<HTMLElement|null>){
 const [seen,setSeen]=useState({id,visible:true});
 useLayoutEffect(()=>{const node=document.querySelector<HTMLElement>('.detail .listen');if(!node||id===null)return;let visible=true;
 setSeen({id,visible});
 const observer=new IntersectionObserver(([e])=>{
  const next=!e.isIntersecting?false:e.intersectionRatio>=.12?true:visible;
  if(next===visible)return;visible=next;
  if(next&&mini.current?.contains(document.activeElement))node.querySelector<HTMLButtonElement>('.play-big')?.focus({preventScroll:true});
  setSeen({id,visible:next});
 },{rootMargin:'-96px 0px -12px 0px',threshold:[0,.12]});observer.observe(node);return()=>observer.disconnect();
 },[id,mini]);
 return seen.id===id?seen.visible:true;
}
