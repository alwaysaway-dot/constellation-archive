import {useState,type CSSProperties} from 'react';
import {otherSongs,featuredSongs,albumById,featuredNumber,type Song} from './content';
import {Listen,type Player} from './PlayerControls';
import {Icon} from './Icons';
import {PreviewDrawer} from './PreviewDrawer';
import {FEATURED_EXHIBITION,coverEcho} from './exhibition-presentation';
import {LateReplyDust,LATE_REPLY_ENABLED} from './LateReplyDust';
import type {CatalogueState} from './detail-context';
type Navigation = {navigate:(to:string)=>void;enter:(id:number)=>void};
function AlbumAttribution({song}:{song:Song}) {
 const album=albumById(song.albumId);return album?<p className="album-attribution">收录于《{album.title}》</p>:null;
}
export function SongDetail({work,player,reduced,navigate,enter,returnTo}:{work:Song;player:Player;reduced:boolean;returnTo:string}&Navigation){
 const peers=featuredSongs.filter(s=>s.id!==work.id).slice(0,3),exhibition=FEATURED_EXHIBITION&&work.featured,lateReply=LATE_REPLY_ENABLED&&work.id===1;
 const lyricGroups=work.lyricGroups?.filter(group=>group.length),returnLabel=returnTo==='works'?'作品档案':'星图',sourceLabel=returnTo==='works'?'作品档案':'星图档案';
 const heading=<><p className="eyebrow">{featuredNumber(work.id)?String(featuredNumber(work.id)).padStart(2,'0'):'档案'} / {work.featured?'精选作品':'其他作品'}</p><h1>{work.title}</h1>{work.dedication&&<div className="song-dedication"><p className="dedication-label">{work.dedication.label}</p><p>{work.dedication.text}</p></div>}<p className="genre">{work.subtitle||work.description}</p><AlbumAttribution song={work}/></>;
 const artwork=<div className={`artwork-wrap ${work.artworkKind==='official'?'official-artwork':''}`}><img className="main-artwork" src={work.art} alt={`${work.title} ${work.artworkKind==='concept'?'概念视觉，非正式封面':'正式封面'}`} width={exhibition?1254:undefined} height={exhibition?1254:undefined}/>{work.artworkKind==='concept'&&<div className="artwork-caption mono"><span>01 / 作品视觉</span><span>概念视觉 · 非正式封面</span></div>}</div>;
 const listen=work.audio?<Listen player={player} reduced={reduced} title={work.title} songId={work.id} knownDuration={work.audioDuration} compact={exhibition}/>:<section className="listen unavailable"><p className="mono subtle">02 / 试听</p><p>试听音源待确认</p><small>作品资料整理中。</small></section>;
 const label=(number:string,cn:string,en:string)=>exhibition?<h2 className="exhibition-label">{cn}<span>{en}</span></h2>:<div className="section-number">{number} / {cn}<span>{en}</span></div>;
 const origin=<section key="origin" data-section="origin" className={`editorial origin ${work.origin?'':'pending-section'}`}>{label('03',work.interpretation?'创作灵感':'创作缘起',work.interpretation?'ORIGIN':'CREATIVE ORIGIN')}<div>{work.origin?(Array.isArray(work.origin)?work.origin:[work.origin]).map((paragraph,i)=><p key={i}>{paragraph}</p>):<p className="pending-copy">创作缘起待补充</p>}</div></section>;
 const interpretation=work.interpretation?.length?<section key="interpretation" data-section="interpretation" className="editorial interpretation">{label('04','主题叙述','INTERPRETATION')}<div>{work.interpretation.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div></section>:null;
 const lyrics=<section key="lyrics" data-section="lyrics" className={`editorial lyrics ${lyricGroups?.length||work.lyrics?.length?'':'pending-section'}`}>{label(work.interpretation?'05':'04','精选歌词','LYRIC FRAGMENTS')}<div className={lyricGroups?.length?'lyric-fragments':undefined}>{lateReply&&<LateReplyDust reading playing={false} reduced={reduced}/>}{lyricGroups?.length?lyricGroups.map((group,i)=><blockquote key={i}>{group.map((line,j)=><p key={j}>{line}</p>)}</blockquote>):work.lyrics?.length?<blockquote>{work.lyrics.map((line,i)=><p key={i}>{line}</p>)}</blockquote>:<p className="pending-copy">经确认的原始歌词待补充</p>}</div></section>;
 return <article className={`detail unified-detail ${work.interpretation?.length?'complete-song':''} ${exhibition?'featured-exhibition':''} ${exhibition&&work.id===5?'afterimage-exhibition':''} ${lateReply?'late-reply':''}`} data-work-id={work.id} style={exhibition?{'--cover-warm':coverEcho[work.id]?.[0],'--cover-cool':coverEcho[work.id]?.[1]} as CSSProperties:undefined}>
 <nav className="breadcrumbs" aria-label="面包屑"><button onClick={()=>navigate('home')}>首页</button><span>/</span><button onClick={()=>navigate(returnTo)}>{sourceLabel}</button><span>/</span><span aria-current="page">{work.title}</span></nav>
 <button className="back-link" onClick={()=>navigate(returnTo)}><Icon kind="back"/>返回{returnLabel}</button>
 {exhibition?<section className="detail-hero">{lateReply&&<LateReplyDust playing={player.trackId===1&&player.playing} reduced={reduced}/>}<div className="detail-intro detail-heading">{heading}</div>{artwork}<div className="detail-playback">{listen}</div></section>:<section className="detail-hero">{artwork}<div className="detail-intro">{heading}{listen}</div></section>}
 {exhibition?[lyrics,interpretation,origin]:[origin,interpretation,lyrics]}
 {work.showRelatedWorks!==false&&<section className="other-works"><div className="gallery-label"><h2>继续探索</h2><span>精选作品</span></div><div className="related-grid">{peers.map(song=><button key={song.id} onClick={()=>enter(song.id)}><img src={song.art} alt={`${song.title} ${song.artworkKind==='official'?'正式封面':'概念视觉'}`} loading="lazy" decoding="async"/><span>{song.title}</span><small>查看作品 <Icon kind="external"/></small></button>)}</div></section>}
 <div className="detail-end"><button className="text-button" onClick={()=>navigate(returnTo)}><Icon kind="back"/>返回{returnLabel}，继续探索</button></div>
 </article>;
}

function SongRow({song,enter,show}:{song:Song;enter:Navigation['enter'];show:(song:Song)=>void}) {
 const album=albumById(song.albumId);
 return <button className={`work-row ${song.featured?'':'text-work-row'}`} data-work-id={song.id} onClick={e=>{if(song.featured)enter(song.id);else{e.currentTarget.focus({preventScroll:true});show(song)}}}><span className="mono work-index">{featuredNumber(song.id)?String(featuredNumber(song.id)).padStart(2,'0'):'—'}</span><span className="work-name"><strong>{song.title}</strong>{album&&<small>{album.title}</small>}</span><span className="work-kind">{song.featured?'精选作品':'其他作品'}</span><span className="index-arrow"><Icon/></span></button>;
}
export function CataloguePages({enter,player,state,onChange}: {player:Player;enter:Navigation['enter'];state:CatalogueState;onChange:(state:CatalogueState)=>void}){
 const {query,filter}=state;const setQuery=(query:string)=>onChange({...state,query}),setFilter=(filter:CatalogueState['filter'])=>onChange({...state,filter});
 const [shown,setShown]=useState<Song|null>(null);
 const filtered=[...featuredSongs,...otherSongs].filter(s=>(filter==='all'||(filter==='featured'?s.featured:!s.featured))&&s.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 return <section className="catalogue-page">
 <div className="works-heading"><h1>作品档案<small>Works Archive</small></h1><p>{featuredSongs.length+otherSongs.length} 首作品</p></div>
 <div className="catalogue-tools"><label className="search-label">搜索作品<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入作品名称"/></label><div className="filter-group" aria-label="作品筛选">{[['all','全部'],['featured','精选十首'],['other','其他作品']].map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id as CatalogueState['filter'])}>{label}</button>)}</div></div>
 <p className="results-count" role="status">{filtered.length} 首</p><div className="works-list">{filtered.map(song=><SongRow key={song.id} song={song} enter={enter} show={setShown}/>)}</div>
 {!filtered.length&&<div className="quiet-empty"><h2>没有找到匹配作品</h2><p>试试其他名称。</p>{query&&<button className="text-button" onClick={()=>setQuery('')}>清除搜索</button>}</div>}
 {shown&&<PreviewDrawer key={shown.id} song={shown} player={player} close={()=>setShown(null)}/>}
 </section>;
}
