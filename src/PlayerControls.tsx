import {useEffect,useState} from 'react';
import {StellarTide} from './StellarTide';
import {format,usePlayer} from './usePlayer';
export type Player = ReturnType<typeof usePlayer>;
export function Play({playing}:{playing:boolean}) {
 return <svg className="play-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">{playing?<><path d="M8 6v12M16 6v12" stroke="currentColor" strokeWidth="2.5"/></>:<path d="m9 5 10 7-10 7V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>}</svg>;
}
export function Listen({player,reduced,title,songId,knownDuration,compact=false}:{player:Player;reduced:boolean;title:string;songId:number;knownDuration?:number;compact?:boolean}) {
 const active=player.trackId===songId,playing=active&&player.playing,time=active?player.time:0,duration=active?player.duration:(player.durations[songId]??knownDuration??0);
 const [loading,setLoading]=useState(false);
 useEffect(()=>{if(!compact)return;const a=player.audio.current;if(!a)return;const waiting=()=>setLoading(true),ready=()=>setLoading(false);setLoading(!a.paused&&a.readyState<3);
 const waitEvents=['waiting','stalled','loadstart','seeking'],readyEvents=['playing','canplay','seeked','pause','error','ended'];waitEvents.forEach(n=>a.addEventListener(n,waiting));readyEvents.forEach(n=>a.addEventListener(n,ready));return()=>{waitEvents.forEach(n=>a.removeEventListener(n,waiting));readyEvents.forEach(n=>a.removeEventListener(n,ready))};},[compact,player.audio,player.trackId,player.started]);
 return <section className="listen" aria-label="播放区域"><div className="listen-top"><span className="mono subtle">{compact?'试听':'02 / 试听'}</span><span className="mono subtle">{format(time)} / {format(duration)}</span></div><div className="listen-controls"><button className={`play-big orbit-play ${playing?'is-playing':''}`} onClick={()=>player.toggle(songId)} aria-label={playing?'暂停':active&&player.error?`重试播放 ${title}`:`播放 ${title}`} aria-busy={active&&loading&&player.started}><Play playing={playing}/></button><StellarTide player={player} songId={songId} reduced={reduced}/></div><input aria-label="播放进度" aria-valuetext={`${format(time)}，共 ${format(duration)}`} type="range" min="0" max={duration} step="0.1" value={time} disabled={!active||duration<=0} onChange={e=>player.seek(Number(e.target.value))}/><div className="listen-bottom"><span role={active&&player.error?'alert':'status'}>{active&&player.error?player.error:compact?(active&&loading&&player.started?'正在加载…':playing?'正在播放':active&&duration>0&&time>=duration-.1?'播放结束 · 可再次播放':active&&player.started?'已暂停':'尚未播放'):playing?'正在播放':active&&time>0?'已暂停 · 点击星核继续聆听':'点击星核，开始聆听'}</span><span>阿尾 / alwaysaway</span></div></section>;
}
