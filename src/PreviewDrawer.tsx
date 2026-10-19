import {useLayoutEffect,useRef} from 'react';
import {albumById,officialUrl,type Song} from './content';
import {Play,type Player} from './PlayerControls';
import {format} from './usePlayer';
import {Icon} from './Icons';
import {lockPageScroll} from './lockPageScroll';

export function PreviewDrawer({song,player,close}:{song:Song;player:Player;close:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);
 const active=player.trackId===song.id,playing=active&&player.playing;
 const duration=active&&player.duration>0?player.duration:song.previewDuration??30,time=active?player.time:0;
 const album=albumById(song.albumId),url=officialUrl(song.externalUrl);
 useLayoutEffect(()=>{
  const dialog=ref.current!,focus=document.activeElement as HTMLElement;
  const unlock=lockPageScroll();
  player.stopPreview();
  const blockBackdrop=(event:Event)=>{if(event.target===dialog)event.preventDefault()};
  dialog.addEventListener('wheel',blockBackdrop,{passive:false});dialog.addEventListener('touchmove',blockBackdrop,{passive:false});
  dialog.showModal();
  return()=>{dialog.removeEventListener('wheel',blockBackdrop);dialog.removeEventListener('touchmove',blockBackdrop);player.stopPreview(song.id);dialog.close();unlock();focus?.focus({preventScroll:true})};
 },[song.id,player.stopPreview]);
 return <dialog ref={ref} className="preview-drawer" aria-labelledby="preview-title" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}>
  <div className="preview-panel">
   <button className="drawer-close overlay-close" aria-label="关闭试听抽屉" onClick={close} autoFocus><Icon kind="close"/></button>
   <p className="eyebrow">其他作品 · LISTENING ROOM</p>
   <h2 id="preview-title">{song.title}</h2>
   <p className="preview-credit">阿尾 / alwaysaway</p>
   {album&&<p className="album-attribution">收录于《{album.title}》</p>}
   {song.preview&&song.previewStatus==='ready'?<section className="preview-listen" aria-label="30 秒试听">
    <div className="preview-timeline"><span>30 秒试听</span><span>{format(time)} / {format(duration)}</span></div>
    <button className={`orbit-play preview-play ${playing?'is-playing':''}`} aria-label={playing?'暂停试听':`试听 ${song.title}`} onClick={()=>player.toggle(song.id)}><Play playing={playing}/></button>
    <input type="range" aria-label="试听进度" min="0" max={duration} step="0.1" value={time} disabled={!active||!player.started} onChange={e=>player.seek(Number(e.target.value))}/>
    <p className="preview-playback-status" aria-live="polite">{active&&player.error?player.error:playing?'正在试听':time>=duration-.1?'试听结束，可再次播放':time>0?'已暂停':'点击播放，聆听片段'}</p>
   </section>:<p className="preview-unavailable">试听音频尚未接入</p>}
   <div className="full-listen-hint"><p>想听完整版？</p><p>前往网易云音乐搜索「阿尾」或歌曲名称。</p>{url&&<a href={url} target="_blank" rel="noopener noreferrer">前往完整版 <Icon kind="external"/></a>}</div>
  </div>
 </dialog>;
}
