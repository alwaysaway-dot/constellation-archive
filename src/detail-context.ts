export type CatalogueState={query:string;filter:'all'|'featured'|'other'};
export type DetailContext={id:number;to:'map'|'works';scroll:number;signal:number|null;catalogue:CatalogueState};
export const defaultCatalogue=():CatalogueState=>({query:'',filter:'other'});
export const defaultDetailContext=(id:number):DetailContext=>({id,to:'map',scroll:0,signal:null,catalogue:defaultCatalogue()});
/** History-entry scoped: forward/back and reload retain their own source, not the last opened song's source. */
export function readDetailContext(state:unknown,id:number):DetailContext{
 const v=(state as {archiveDetail?:DetailContext}|null)?.archiveDetail;
 if(!v||v.id!==id||!['map','works'].includes(v.to)||!Number.isFinite(v.scroll)||v.scroll<0||!v.catalogue||typeof v.catalogue.query!=='string'||!['all','featured','other'].includes(v.catalogue.filter))return defaultDetailContext(id);
 return {...v,catalogue:{...v.catalogue},signal:Number.isInteger(v.signal)?v.signal:null};
}
