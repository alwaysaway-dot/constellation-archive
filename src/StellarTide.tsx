import {useEffect,useRef} from 'react';
import type {Player} from './PlayerControls';
import {createTide} from './tide-renderer';
import './stellar-tide.css';

/** A view onto the existing audio graph; never creates or owns an audio source. */
export function StellarTide({player,songId,reduced}:{player:Player;songId:number;reduced:boolean}) {
 const canvas=useRef<HTMLCanvasElement>(null),runtime=useRef<ReturnType<typeof createTide>|null>(null);
 const state=useRef({current:player.trackId===songId,reduced,playing:player.playing});
 state.current={current:player.trackId===songId,reduced,playing:player.playing};
 useEffect(()=>{
  if(!canvas.current)return;
  runtime.current=createTide(canvas.current,()=>({audio:player.audio.current,analyser:player.analyser.current,context:player.context.current,...state.current}));
  return()=>{runtime.current?.dispose();runtime.current=null};
 },[player.audio,player.analyser,player.context,songId]);
 useEffect(()=>{runtime.current?.wake()},[player.playing,player.trackId,reduced]);
 return <canvas ref={canvas} className="stellar-tide" aria-hidden="true"/>;
}
