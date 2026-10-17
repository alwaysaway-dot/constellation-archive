import {useState} from 'react';
import {otherSongs,featuredSongs,albumById,featuredNumber,type Song} from './content';
import {Listen,type Player} from './PlayerControls';
import {Icon} from './Icons';
import {PreviewDrawer} from './PreviewDrawer';
type Navigation = {navigate:(to:string)=>void;enter:(id:number)=>void};
function AlbumAttribution({song}:{song:Song}) {
 const album=albumById(song.albumId);return album?<p className="album-attribution">收录于《{album.title}》</p>:null;
}
export function SongDetail({work,player,reduced,navigate,enter,returnTo}:{work:Song;player:Player;reduced:boolean;returnTo:string}&Navigation){
 const peers=featuredSongs.filter(s=>s.id!==work.id).slice(0,3);
 const lyricGroups=work.lyricGroups?.filter(group=>group.length);
 const returnLabel=returnTo==='works'?'全部作品':'星图';
 return <article className={`detail unified-detail ${work.interpretation?.length?'complete-song':''}`} data-work-id={work.id}>
 <nav className="breadcrumbs" aria-label="面包屑"><button onClick={()=>navigate('home')}>首页</button><span>/</span><button onClick={()=>navigate('map')}>星图档案</button><span>/</span><span aria-current="page">{work.title}</span></nav>
 <button className="back-link" onClick={()=>navigate(returnTo)}><Icon kind="back"/>返回{returnLabel}</button>
 <section className="detail-hero"><div className={`artwork-wrap ${work.artworkKind==='official'?'official-artwork':''}`}><img className="main-artwork" src={work.art} alt={`${work.title} ${work.artworkKind==='concept'?'概念视觉，非正式封面':'正式封面'}`}/>{work.artworkKind==='concept'&&<div className="artwork-caption mono"><span>01 / 作品视觉</span><span>{work.artworkKind==='concept'?'概念视觉 · 非正式封面':'正式封面'}</span></div>}</div>
 <div className="detail-intro"><p className="eyebrow">{featuredNumber(work.id)?String(featuredNumber(work.id)).padStart(2,'0'):'档案'} / {work.featured?'精选作品':'其他作品'}</p><h1>{work.title}</h1>{work.dedication&&<div className="song-dedication"><p className="dedication-label">{work.dedication.label}</p><p>{work.dedication.text}</p></div>}<p className="genre">{work.subtitle||work.description}</p><AlbumAttribution song={work}/>
 {work.audio?<Listen player={player} reduced={reduced} title={work.title} songId={work.id} knownDuration={work.audioDuration}/>:<section className="listen unavailable"><p className="mono subtle">02 / 试听</p><p>试听音源待确认</p><small>作品资料整理中。</small></section>}</div></section>
 <section className={`editorial ${work.origin?'':'pending-section'}`}><div className="section-number">03 / {work.interpretation?'创作灵感':'创作缘起'}<span>{work.interpretation?'ORIGIN':'CREATIVE ORIGIN'}</span></div><div>{work.origin?(Array.isArray(work.origin)?work.origin:[work.origin]).map((paragraph,i)=><p key={i}>{paragraph}</p>):<p className="pending-copy">创作缘起待补充</p>}</div></section>
 {work.interpretation?.length&&<section className="editorial interpretation"><div className="section-number">04 / 主题叙述<span>INTERPRETATION</span></div><div>{work.interpretation.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div></section>}
 <section className={`editorial lyrics ${lyricGroups?.length||work.lyrics?.length?'':'pending-section'}`}><div className="section-number">{work.interpretation?'05':'04'} / 精选歌词<span>LYRIC FRAGMENTS</span></div><div className={lyricGroups?.length?'lyric-fragments':undefined}>{lyricGroups?.length?lyricGroups.map((group,i)=><blockquote key={i}>{group.map((line,j)=><p key={j}>{line}</p>)}</blockquote>):work.lyrics?.length?<blockquote>{work.lyrics.map((line,i)=><p key={i}>{line}</p>)}</blockquote>:<p className="pending-copy">经确认的原始歌词待补充</p>}</div></section>
 {work.showRelatedWorks!==false&&<section className="other-works"><div className="gallery-label"><h2>继续探索</h2><span>精选作品</span></div><div className="related-grid">{peers.map(song=><button key={song.id} onClick={()=>enter(song.id)}><img src={song.art} alt={`${song.title} ${song.artworkKind==='official'?'正式封面':'概念视觉'}`} loading="lazy" decoding="async"/><span>{song.title}</span><small>查看作品 <Icon kind="external"/></small></button>)}</div></section>}
 <div className="detail-end"><button className="text-button" onClick={()=>navigate('map')}><Icon kind="back"/>返回星图，继续探索</button></div>
 </article>;
}
function SongRow({song,enter,show}:{song:Song;enter:Navigation['enter'];show:(song:Song)=>void}) {
 const album=albumById(song.albumId);
 return <button className={`work-row ${song.featured?'':'text-work-row'}`} data-work-id={song.id} onClick={e=>{if(song.featured)enter(song.id);else{e.currentTarget.focus({preventScroll:true});show(song)}}}><span className="mono work-index">{featuredNumber(song.id)?String(featuredNumber(song.id)).padStart(2,'0'):'—'}</span>{song.featured&&song.art?<img src={song.art} alt="" loading="lazy" decoding="async"/>:null}<span className="work-name"><strong>{song.title}</strong><small>{[album?.title,song.language,song.release].filter(Boolean).join(' · ')||'作品资料整理中'}</small></span><span className="work-kind">{song.featured?'精选作品':'其他作品'}</span><span className="index-arrow"><Icon/></span></button>;
}
export function CataloguePages({enter,player,initialFilter='all'}: {player:Player;enter:Navigation['enter'];initialFilter?:string}){
 const [query,setQuery]=useState(''),[filter,setFilter]=useState(initialFilter),[shown,setShown]=useState<Song|null>(null);
 const filtered=[...featuredSongs,...otherSongs].filter(s=>(filter==='all'||(filter==='featured'?s.featured:!s.featured))&&s.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 return <section className="catalogue-page">
 <p className="eyebrow">全部作品 <span className="little-line"/> ALL WORKS</p><h1>声音的完整轨迹。</h1><p className="catalogue-description">从精选作品开始，持续收录新的创作。</p>
 <div className="catalogue-tools"><label className="search-label">搜索作品<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入作品名称"/></label><div className="filter-group" aria-label="作品筛选">{[['all','全部'],['featured','精选十首'],['other','其他作品']].map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div></div>
 <p className="catalogue-preview-note">{filter==='featured'?'精选作品可进入详情，完整聆听。':filter==='other'?'其他作品在此提供 30 秒试听。':'精选作品可进入详情完整聆听；其他作品提供 30 秒试听。'}{filter!=='featured'&&<small>其他作品完整版，可前往网易云音乐搜索「阿尾」或歌曲名称。</small>}</p>
 <p className="results-count" role="status">{filtered.length} 条作品记录</p><div className="works-list">{filtered.map(song=><SongRow key={song.id} song={song} enter={enter} show={setShown}/>)}</div>
 {!filtered.length&&<div className="quiet-empty"><h2>没有找到匹配作品</h2><p>试试其他名称。</p>{query&&<button className="text-button" onClick={()=>setQuery('')}>清除搜索</button>}</div>}
 {shown&&<PreviewDrawer key={shown.id} song={shown} player={player} close={()=>setShown(null)}/>}
 </section>;
}
