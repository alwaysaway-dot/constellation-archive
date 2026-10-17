import {useLayoutEffect,useRef} from 'react';
import {lockPageScroll} from './lockPageScroll';
import {Icon} from './Icons';
/** Existing creator identity, surfaced without inventing a new biography or route. */
export function AboutIdentity({close}:{close:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useLayoutEffect(()=>{const before=document.activeElement as HTMLElement,unlock=lockPageScroll(),dialog=ref.current!;dialog.showModal();return()=>{dialog.close();unlock();(before?.isConnected?before:document.querySelector<HTMLElement>('.menu-toggle'))?.focus({preventScroll:true})}},[]);
 return <dialog className="about-identity" ref={ref} aria-label="关于星图档案馆" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}><button onClick={close} autoFocus>关闭 <Icon kind="close"/></button><h2>阿尾 <small>alwaysaway</small></h2><p>阿尾的 AI 辅助音乐创作档案。</p><p>星图档案馆 / Constellation Archive</p></dialog>;
}
