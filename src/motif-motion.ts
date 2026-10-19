/** Tiny immutable path atlas: 26 curves × 129 samples, 53 KiB.
 * Shape construction happens once on CPU, not as ten branches per GPU vertex. */
export const PATH_SAMPLES=129;
const starts=[0,2,4,11,13,15,16,17,18,21];
export const PATH_ROWS=26;
export function pathRow(n:number,index:number,part:number){return starts[n]+(n===2?index%7:n===8?index%3:n===9?index%5:[0,1,3,4].includes(n)?part:0)}
export function pathPoint(n:number,t:number,index:number,part:number):number[]{
 let a=t*Math.PI*2;
 switch(n){
  case 0:a+=part*1.25;return[(part?22:-22)+Math.cos(a)*47,Math.sin(a)*22+(part?12:-12),Math.sin(a)*2];
  case 1:{a=t*Math.PI*1.36+(part?Math.PI:.1);const x=Math.cos(a)*83,y=Math.sin(a)*22;return[x*.86-y*.5,x*.5+y*.86+(part?7:-7),Math.sin(a)*2]}
  case 2:{const theta=index%7*2.399+Math.sin(t*3)*.2;return[Math.cos(theta)*t*86,Math.sin(theta)*t*86*.68,Math.sin(theta)*t*2]}
  case 3:return[part?12:-12,(t-.5)*142,part?1:-1];
  case 4:return[Math.cos(a),Math.sin(a)*.75,Math.sin(a)*1.5];
  case 5:a=t*Math.PI*1.7;return[Math.cos(a),Math.sin(a)*.68,Math.sin(a)*2];
  case 6:{const v=(t-.5)*160;return[v*.76,v*.59,v*.022]}
  case 7:a=t*Math.PI*1.7;return[Math.cos(a)*76,Math.sin(a)*40,Math.sin(a)*1.8];
  case 8:return[(t-.5)*150,(index%3-1)*23+Math.sin(t*5.8)*10,(index%3-1)*2];
  default:return[Math.cos(a)*13,Math.sin(a)*8,Math.sin(a)*2];
 }
}
export function createPathAtlas(){const data=new Float32Array(PATH_ROWS*PATH_SAMPLES*4);for(let n=0;n<10;n++){const count=(n===9?PATH_ROWS:starts[n+1])-starts[n];for(let group=0;group<count;group++)for(let j=0;j<PATH_SAMPLES;j++){const p=pathPoint(n,j/(PATH_SAMPLES-1),group,group%2),offset=((starts[n]+group)*PATH_SAMPLES+j)*4;data.set([...p,1],offset)}}return data}
export const motifMotionGLSL=`
uniform sampler2D uPaths;
vec3 motifPath(float row,float t){float u=t*128.;float i=floor(u);vec2 uv=vec2((i+.5)/129.,(row+.5)/26.);return mix(texture2D(uPaths,uv).xyz,texture2D(uPaths,uv+vec2(1./129.,0.)).xyz,fract(u));}
float openPath(float n){return (n>.5&&n<3.5)||(n>4.5&&n<8.5)?1.:0.;}
`;
