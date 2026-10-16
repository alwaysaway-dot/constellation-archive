/** Static Assets currently ignores Range. Adapt only audio requests for browser seeking. */
export function byteRange(value, length) {
  const match=/^bytes=(\d*)-(\d*)$/.exec(value ?? '');
  if(!match||(!match[1]&&!match[2]))return null; // Unknown/multipart ranges: serve the full representation.
  let start,end;
  if(!match[1]){const suffix=Number(match[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)return false;start=Math.max(0,length-suffix);end=length-1;}
  else{start=Number(match[1]);end=match[2]?Number(match[2]):length-1;}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=length||end<start)return false;
  return [start,Math.min(end,length-1)];
}
export default {
 async fetch(request,env) {
  const url=new URL(request.url);
  if(!url.pathname.startsWith('/audio/')||!['GET','HEAD'].includes(request.method))return env.ASSETS.fetch(request);
  const requested=request.method==='GET'?request.headers.get('Range'):null;
  const headers=new Headers(request.headers);headers.delete('Range');headers.delete('If-Range');
  const response=await env.ASSETS.fetch(new Request(request,{headers}));
  if(response.status!==200)return response;
  const out=new Headers(response.headers);out.set('Accept-Ranges','bytes');
  const full=()=>new Response(response.body,{status:200,headers:out});
  if(!requested)return full();
  const condition=request.headers.get('If-Range');
  if(condition&&condition!==response.headers.get('ETag')&&condition!==response.headers.get('Last-Modified'))return full();
  // The Assets binding can omit Content-Length even when the edge later adds it.
  const bytes=await response.arrayBuffer(),length=bytes.byteLength;
  const range=byteRange(requested,length);
  if(range===null)return new Response(bytes,{status:200,headers:out});
  if(range===false){out.set('Content-Range',`bytes */${length}`);out.set('Content-Length','0');return new Response(null,{status:416,headers:out});}
  const [start,end]=range;
  // Published audio is build-validated at <=25 MiB (currently <=12.23 MiB).
  out.set('Content-Range',`bytes ${start}-${end}/${length}`);out.set('Content-Length',String(end-start+1));
  return new Response(bytes.slice(start,end+1),{status:206,headers:out});
 }
};
