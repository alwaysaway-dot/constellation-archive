import {StellarTide} from './StellarTide';
import {format,usePlayer} from './usePlayer';
export type Player = ReturnType<typeof usePlayer>;
export function Play({playing}:{playing:boolean}) {
 return <svg className="play-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">{playing?<><path d="M8 6v12M16 6v12" stroke="currentColor" strokeWidth="2.5"/></>:<path d="m9 5 10 7-10 7V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>}</svg>;
}
export function Listen({player,reduced,title,songId,knownDuration}:{player:Player;reduced:boolean;title:string;songId:number;knownDuration?:number}) {
 const active=player.trackId===songId,playing=active&&player.playing,time=active?player.time:0,duration=active?player.duration:(player.durations[songId]??knownDuration??0);
 return <section className="listen" aria-label="播放区域"><div className="listen-top"><span className="mono subtle">02 / 试听</span><span className="mono subtle">{format(time)} / {format(duration)}</span></div><div className="listen-controls"><button className={`play-big orbit-play ${playing?'is-playing':''}`} onClick={()=>player.toggle(songId)} aria-label={playing?'暂停':`播放 ${title}`}><Play playing={playing}/></button><StellarTide player={player} songId={songId} reduced={reduced}/></div><input aria-label="播放进度" type="range" min="0" max={duration} step="0.1" value={time} disabled={!active||duration<=0} onChange={e=>player.seek(Number(e.target.value))}/><div className="listen-bottom"><span role={active&&player.error?'alert':'status'}>{active&&player.error?player.error:playing?'正在播放':active&&time>0?'已暂停 · 点击星核继续聆听':'点击星核，开始聆听'}</span><span>阿尾 / alwaysaway</span></div></section>;
}
