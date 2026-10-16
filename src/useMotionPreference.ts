import {useEffect,useState} from 'react';
const KEY='constellation-motion';
export function useMotionPreference(){
 const [systemReduced,setSystemReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [choice,setChoice]=useState<'full'|'reduced'>(()=>{try{return localStorage.getItem(KEY)==='reduced'?'reduced':'full'}catch{return 'full'}});
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setSystemReduced(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 const choose=(value:'full'|'reduced')=>{setChoice(value);try{localStorage.setItem(KEY,value)}catch{/* Private browsing may disable persistence; the current choice still applies. */}};
 return {reduced:systemReduced||choice==='reduced',systemReduced,choose};
}
