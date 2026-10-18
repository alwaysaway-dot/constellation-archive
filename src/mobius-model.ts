/** Seeded material coordinates on a genuine half-twist; u is continuous over 4π. */
export const TAU=Math.PI*2;
export function mobiusPoint(u:number,v:number):[number,number,number]{return [(3.15+v*Math.cos(u/2))*Math.cos(u),(3.15+v*Math.cos(u/2))*Math.sin(u),v*Math.sin(u/2)]}
export function seeded(seed=172903){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
export type Grain={u:number;v:number;rate:number;seed:number;offset:[number,number,number];size:number;alpha:number;star:boolean};
// Material-space filaments and unequal clusters; sparse gaps survive without adding points.
export function density(u:number,v:number){
 const lane1=Math.exp(-Math.pow((v-.86*Math.sin(u*1.5)-.15*Math.sin(u*3.5))/.13,2));
 const lane2=Math.exp(-Math.pow((v+.62*Math.sin(u*.5+.5))/.20,2));
 const cluster=(c:number,w:number)=>Math.exp(-Math.pow(Math.sin((u-c)/2)/w,2));
 const groups=.60*cluster(.7,.26)+.85*cluster(2.8,.30)+.64*cluster(4.9,.22);
 return .035+(.20+.50*groups)*lane1+.16*lane2+.40*groups*(.3+.7*Math.pow(Math.cos(v*1.9),2));
}
export function grains(count:number):Grain[]{const rand=seeded(),out:Grain[]=[];while(out.length<count){
 const u=rand()*TAU,v=(rand()*2-1)*1.40;if(rand()>density(u,v))continue;
 const star=rand()<.018,edge=1-Math.pow(Math.abs(v)/1.42,8),stray=rand()<.025;
 out.push({u,v,rate:.90+rand()*.20,seed:rand()*100,offset:[(rand()-.5)*(stray?.28:.07),(rand()-.5)*(stray?.28:.07),(rand()-.5)*.10],size:star?2.8+rand()*2.6:1.0+rand()*.9,alpha:(star?.90:.38+rand()*.42)*(.28+.72*edge),star})
 }return out}
export type GalaxyLayout={matrix:number[];scale:number;offset:[number,number,number];width:number;height:number};
export function rotate(p:number[],a:number[]){let [x,y,z]=p;const[cx,sx,cy,sy,cz,sz]=[Math.cos(a[0]),Math.sin(a[0]),Math.cos(a[1]),Math.sin(a[1]),Math.cos(a[2]),Math.sin(a[2])];[y,z]=[y*cx-z*sx,y*sx+z*cx];[x,z]=[x*cy+z*sy,-x*sy+z*cy];return[x*cz-y*sz,x*sz+y*cz,z]}
export function galaxyLayout(width:number,height:number,pose?:number[]):GalaxyLayout{const phone=width<701,angles=pose||(phone?[.95,.30,.60]:[.90,.25,.10]);const matrix=[...rotate([1,0,0],angles),...rotate([0,1,0],angles),...rotate([0,0,1],angles)];const rect=phone?[.035,.34,.965,.875]:[.29,.19,.98,.89];const layout:GalaxyLayout={matrix,scale:1,offset:[0,0,0],width,height};const sample=[];for(let u=0;u<TAU;u+=.08)for(const v of [-1.40,0,1.40])sample.push(mobiusPoint(u,v));const targetW=width*(rect[2]-rect[0]),targetH=height*(rect[3]-rect[1]);const factor=height/(2*Math.tan(35*Math.PI/360)*18);
 for(let n=0;n<5;n++){const ps=sample.map(p=>project(p,layout));const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);layout.scale*=Math.min(targetW/(maxX-minX),targetH/(maxY-minY));layout.offset[0]+=(width*(rect[0]+rect[2])/2-(minX+maxX)/2)/factor;layout.offset[1]-=(height*(rect[1]+rect[3])/2-(minY+maxY)/2)/factor}return layout}
export function world(p:number[],l:GalaxyLayout){const m=l.matrix;return [0,1,2].map(i=>(m[i]*p[0]+m[3+i]*p[1]+m[6+i]*p[2])*l.scale+l.offset[i])}
export function project(p:number[],l:GalaxyLayout){const [x,y,z]=world(p,l),f=l.height/(2*Math.tan(35*Math.PI/360)*(18-z));return[l.width/2+x*f,l.height/2-y*f,z]}

/** Mirrors shader lighting for the static projection; no screen-space noise texture. */
export function surfaceNormal(u:number,v:number){const r=3.15+v*Math.cos(u/2),a=[-r*Math.sin(u)-v*.5*Math.sin(u/2)*Math.cos(u),r*Math.cos(u)-v*.5*Math.sin(u/2)*Math.sin(u),v*.5*Math.cos(u/2)],b=[Math.cos(u/2)*Math.cos(u),Math.cos(u/2)*Math.sin(u),Math.sin(u/2)];const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length=Math.hypot(...n);return n.map(x=>x/length)}
export function depthLight(u:number,v:number,z:number,l:GalaxyLayout){const n=surfaceNormal(u,v),m=l.matrix,r=[0,1,2].map(i=>m[i]*n[0]+m[i+3]*n[1]+m[i+6]*n[2]);const t=Math.max(0,Math.min(1,(z/l.scale+3.8)/7.6)),near=t*t*(3-2*t),facing=.65+.35*Math.pow(Math.abs((-.25*r[0]+.6*r[1]+r[2])/Math.hypot(.25,.6,1)),.7),fold=Math.pow(1-Math.abs(r[2]),4)*.28,lit=.70+.45*Math.exp(-Math.pow(Math.sin((u-2.8)*.5)*2.8,2));return {near,alpha:2.2*(lit*facing+fold)*(.50+.50*near)}}
