import {useLayoutEffect,useRef,useState} from 'react';
import {lockPageScroll} from './lockPageScroll';
import {Icon} from './Icons';
import {identity} from './identity-content';
function QRDialog({close}:{close:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useLayoutEffect(()=>{const before=document.activeElement as HTMLElement,unlock=lockPageScroll(),d=ref.current!;d.showModal();return()=>{d.close();unlock();before?.isConnected&&before.focus({preventScroll:true})}},[]);
 return <dialog ref={ref} className="qr-dialog" aria-labelledby="qr-heading" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}}}>
 <button className="overlay-close" aria-label="关闭微信二维码" onClick={close} autoFocus><Icon kind="close"/></button>
 <h2 id="qr-heading">微信</h2><img src={identity.qr} width="728" height="728" alt="阿尾的微信二维码"/>
 <a className="quiet-action" href={identity.qr} download="阿尾-微信二维码.png">保存二维码 <Icon kind="external"/></a><p>同机浏览可先保存图片，再在微信中识别。</p>
 </dialog>;
}
export function AboutIdentity(){
 const [qr,setQr]=useState(false),[notice,setNotice]=useState('');
 async function copy(value:string,label:string){try{await navigator.clipboard.writeText(value);setNotice(`${label}已复制`)}catch{setNotice('暂无法复制，请长按文字选择复制。')}}
 return <article className="identity-page">
 <div className="identity-heading"><p className="eyebrow">关于 / ABOUT</p><h1>{identity.name}<small>{identity.alias}</small></h1><p className="identity-role">{identity.role}</p></div>
 <img className="identity-portrait" src={identity.portrait} width="1024" height="1024" alt="阿尾，磁带遮眼的纸张肌理肖像"/>
 <div className="identity-bio">{identity.bio.map(p=><p key={p}>{p}</p>)}</div>
 <section className="identity-contact" aria-labelledby="contact-heading"><h2 id="contact-heading">联系 <small>CONTACT</small></h2>
 <div className="contact-row"><span className="contact-label">邮箱</span><a className="contact-value" href={`mailto:${identity.email}`}>{identity.email}</a><button className="quiet-action" onClick={()=>copy(identity.email,'邮箱')}>复制邮箱</button></div>
 <div className="contact-row"><span className="contact-label">网易云音乐</span><span className="contact-value">阿尾</span><button className="quiet-action" onClick={()=>copy(identity.name,'名称')}>复制名称</button></div>
 <div className="contact-row"><span className="contact-label">微信</span><button className="quiet-action contact-qr" onClick={()=>setQr(true)}>查看微信二维码 <Icon kind="external"/></button></div>
 <p className="copy-notice" role="status" aria-live="polite">{notice}</p></section>
 {qr&&<QRDialog close={()=>setQr(false)}/>}
 </article>;
}
