/** Two independent open ribbons. Screen-space art direction is lifted into real perspective depth. */
type Point=[number,number];
type Curve=Point[];
const desktop:Curve[][]=[
 [[[-.24,.68],[.18,.69],[.60,.51],[.77,.37]],[[.77,.37],[.96,.25],[.86,.55],[.80,.70]],[[.80,.70],[.75,.86],[1.0,.87],[1.18,1.04]]],
 [[[1.22,-.15],[1.02,.06],[.91,.29],[.94,.46]],[[.94,.46],[.96,.60],[.87,.71],[.90,.79]],[[.90,.79],[.95,.89],[1.16,.91],[1.37,1.06]]]
];
const mobile:Curve[][]=[
 [[[-.42,.65],[.02,.63],[.45,.49],[.67,.45]],[[.67,.45],[.88,.38],[.61,.62],[.49,.75]],[[.49,.75],[.40,.86],[.91,.89],[1.25,1.03]]],
 [[[1.35,.18],[1.12,.28],[.84,.41],[.86,.53]],[[.86,.53],[.88,.63],[.65,.72],[.67,.79]],[[.67,.79],[.73,.89],[1.09,.90],[1.37,1.04]]]
];
function bezier(c:Curve,t:number):Point{const s=1-t;return [0,1].map(k=>s*s*s*c[0][k]+3*s*s*t*c[1][k]+3*s*t*t*c[2][k]+t*t*t*c[3][k]) as Point}
export function fieldPoint(kind:number,u:number,v:number,phone:boolean):[number,number,number]{
 const curves=(phone?mobile:desktop)[kind],q=Math.min(2,Math.floor(u*3)),t=Math.min(1,u*3-q),p=bezier(curves[q],t);
 // A broad soft fold and a narrower, more tightly folded returning sheet.
 const breadth=kind===0?(.54*(1-u)+.09)*(.34+.66*Math.pow(Math.abs(Math.cos(u*3.4)),.7)):.115+.035*Math.sin(u*5);
 const twist=kind===0?-.18+u*1.4:1.1-u*.55;
 const x=p[0]+Math.sin(twist)*breadth*v*(phone?.9:.6),y=p[1]+Math.cos(twist)*breadth*v;
 const z=(kind===0?1.15:-1.3)+Math.sin(v*Math.PI)*1.5*Math.sin(u*3.4+.3)+(kind===0?-.8:.5)*v;
 return [x,y,z];
}
export function fieldPaths(phone:boolean){return [0,1].map(kind=>Array.from({length:phone?27:48},(_,i)=>{const v=i/(phone?26:47);return Array.from({length:145},(_,j)=>{const [x,y]=fieldPoint(kind,j/144,v,phone);return `${j?'L':'M'}${(x*1000).toFixed(2)},${(y*1000).toFixed(2)}`}).join('')}))}
