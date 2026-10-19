import {useEffect,useState} from 'react';
/** The OS is now the only motion preference. Retire the inaccessible old saved switch. */
export function useMotionPreference(){
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{try{localStorage.removeItem('constellation-motion')}catch{/* Storage is optional. */}
 const query=matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(query.matches);query.addEventListener('change',update);update();return()=>query.removeEventListener('change',update)},[]);
 return {reduced};
}
