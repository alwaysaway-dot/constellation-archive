type Kind='arrow'|'back'|'external'|'menu'|'close'|'search'|'star';
export function Icon({kind='arrow',className=''}:{kind?:Kind;className?:string}){
 const paths:Record<Kind,string>={arrow:'M4 12h15m-6-6 6 6-6 6',back:'M20 12H5m6-6-6 6 6 6',external:'M6 18 18 6M6 6h12v12',menu:'M5 7h14M9 12h10M5 17h14',close:'m6 6 12 12M6 18 18 6',search:'m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',star:'M12 2v20M2 12h20M5 5l14 14M5 19 19 5'};
 return <svg className={`line-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind]}/></svg>;
}
