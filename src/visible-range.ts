/** Immutable Y-sorted geometry: skip offscreen vertex work without reallocating/uploading buffers. */
export function visibleRange(ys:Float32Array,scroll:number,height:number,margin=300):[number,number]{
 const lower=(value:number)=>{let lo=0,hi=ys.length;while(lo<hi){const mid=(lo+hi)>>>1;if(ys[mid]<value)lo=mid+1;else hi=mid}return lo};
 const start=lower(scroll-margin),end=lower(scroll+height+margin);return[start,end-start];
}
