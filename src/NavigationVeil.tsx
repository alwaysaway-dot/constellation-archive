import {useLayoutEffect,useRef} from 'react';
import {Icon} from './Icons';
import {lockPageScroll} from './lockPageScroll';
const entries=[['home','首页','Home'],['map','星图','Constellation'],['other','其他作品','Works'],['about','关于','About']];
export function NavigationVeil({page,close,navigate}:{page:string;close:()=>void;navigate:(page:string)=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useLayoutEffect(()=>{const d=ref.current!,focus=document.querySelector<HTMLElement>('.menu-toggle'),unlock=lockPageScroll();d.showModal();return()=>{d.close();unlock();focus?.focus({preventScroll:true})}},[]);
 return <dialog ref={ref} className="navigation-veil" aria-label="全站导航" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}><div className="veil-content">
 <button className="veil-close overlay-close" aria-label="关闭导航" onClick={close} autoFocus><Icon kind="close"/></button><p className="veil-brand">阿尾 <small>alwaysaway</small></p>
 <nav aria-label="展开导航">{entries.map(([id,label,en],i)=><button key={id} aria-current={page===id?'page':undefined} onClick={()=>{close();navigate(id)}}><small className="nav-index">0{i+1}</small><span>{label}<em>{en}</em></span></button>)}</nav>
 </div></dialog>;
}
