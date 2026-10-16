import {useCallback,useEffect,useRef,useState} from 'react';
import {songById} from './content';
export function usePlayer(){
 const audio=useRef<HTMLAudioElement|null>(null),context=useRef<AudioContext|null>(null),analyser=useRef<AnalyserNode|null>(null),operation=useRef(0),wantsPlay=useRef(false),currentId=useRef(4),alive=useRef(false);
 const [trackId,setTrackId]=useState(4),[durations,setDurations]=useState<Record<number,number>>({});
 const [playing,setPlaying]=useState(false),[started,setStarted]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(0),[error,setError]=useState(''),[minimized,setMinimized]=useState(false);
 useEffect(()=>{const a=new Audio(songById(4)!.audio);a.preload='metadata';audio.current=a;alive.current=true;
 const update=()=>setTime(a.currentTime),meta=()=>{if(Number.isFinite(a.duration)){setDuration(a.duration);setDurations(old=>({...old,[currentId.current]:a.duration}))}},play=()=>{wantsPlay.current=true;setPlaying(true);setStarted(true);setMinimized(false)},pause=()=>{wantsPlay.current=false;setPlaying(false)},fail=()=>{if(!a.error)return;wantsPlay.current=false;a.pause();setPlaying(false);setError('音频未能加载，请检查网络后重试。')};
 const ended=()=>{wantsPlay.current=false;a.pause();pause()};
 a.addEventListener('timeupdate',update);a.addEventListener('loadedmetadata',meta);a.addEventListener('play',play);a.addEventListener('pause',pause);a.addEventListener('ended',ended);a.addEventListener('error',fail);
 return()=>{alive.current=false;operation.current++;wantsPlay.current=false;a.removeEventListener('timeupdate',update);a.removeEventListener('loadedmetadata',meta);a.removeEventListener('play',play);a.removeEventListener('pause',pause);a.removeEventListener('ended',ended);a.removeEventListener('error',fail);a.pause();a.removeAttribute('src');a.load();void context.current?.close();context.current=null;audio.current=null;analyser.current=null};},[]);
 // Source changes only follow an explicit play action. Navigation never reloads audio.
 const toggle=async(id:number=currentId.current,playOnly=false)=>{const a=audio.current,song=songById(id),source=song?.featured?song.audio:song?.preview;if(!a||!song||!source)return;
 const switching=id!==currentId.current;
 if(!switching&&(!a.paused||wantsPlay.current)){if(!playOnly){operation.current++;wantsPlay.current=false;a.pause()}return}
 const request=++operation.current;
 if(switching||!a.getAttribute('src')){
  a.pause();currentId.current=id;setTrackId(id);setPlaying(false);setTime(0);
  setDuration(durations[id]??(song.featured?song.audioDuration:song.previewDuration)??0);a.src=source;
 }else if(a.error){a.load()}
 wantsPlay.current=true;setError('');setStarted(true);setMinimized(false);
 // Analysis is optional. Keep media play within the user gesture for Safari.
 if(!context.current&&window.AudioContext){
  let ac:AudioContext|null=null,source:MediaElementAudioSourceNode|null=null;
  try{ac=new AudioContext();const an=ac.createAnalyser();an.fftSize=1024;an.smoothingTimeConstant=.65;an.connect(ac.destination);source=ac.createMediaElementSource(a);source.connect(an);context.current=ac;analyser.current=an}
  catch{if(ac&&source){source.disconnect();source.connect(ac.destination);context.current=ac}else{void ac?.close()}}
 }
 try{const resume=context.current?.resume();const play=a.play();await Promise.all([resume,play])}catch(reason){if(alive.current&&operation.current===request){wantsPlay.current=false;a.pause();setError(reason instanceof DOMException&&reason.name==='NotAllowedError'?'浏览器暂未允许播放，请点击播放按钮继续。':'播放未成功，请再次点击播放。');setPlaying(false)}}};
 // Preview cleanup never interrupts a featured song or a newer selection.
 const stopPreview=useCallback((id?:number)=>{const a=audio.current,song=songById(currentId.current);if(!a||!song||song.featured||(id!==undefined&&id!==song.id))return;
  operation.current++;wantsPlay.current=false;a.pause();a.removeAttribute('src');a.load();setPlaying(false);setStarted(false);setTime(0);setDuration(0);setError('');
 },[]);
 const seek=(v:number)=>{const a=audio.current;if(a&&Number.isFinite(v)&&Number.isFinite(a.duration)&&a.duration>0){a.currentTime=Math.max(0,Math.min(a.duration,v));setTime(a.currentTime)}};
 const minimize=()=>{operation.current++;wantsPlay.current=false;audio.current?.pause();setPlaying(false);setMinimized(true);setError('')};
 const play=(id:number=currentId.current)=>toggle(id,true);
 return{trackId,durations,playing,started,time,duration,error,toggle,play,minimize,minimized,seek,stopPreview,audio,analyser,context};
}
export const format=(s:number)=>`${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;
