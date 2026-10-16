// One continuous native-scroll field. Values are normalized across its entire length.
export const VOYAGE_SPAN=3.25;
export const DEPTHS=[.6,-.8,.3,1.1,-.7,.4,-1.2,.8,-.3,-.9];
export const MOBILE_ANCHORS=[[.17,.07],[.56,.15],[.25,.24],[.60,.34],[.19,.43],[.57,.53],[.27,.62],[.58,.73],[.22,.82],[.55,.91]];
export const DESKTOP_ANCHORS=[[.30,.07],[.66,.15],[.40,.24],[.68,.34],[.32,.43],[.65,.53],[.40,.62],[.70,.73],[.35,.82],[.64,.91]];
// Muted echoes of the approved artwork; no runtime image decoding or artwork mutation.
export const SIGNAL_COLORS=['#bca393','#91aeb7','#a2ad93','#b39b80','#b0a1ad','#bba78d','#b99b90','#b1a38c','#9cabb9','#b59c88'];
export type ViewMemory={x:number;y:number};
export type SceneState={reduced:boolean;selected:number|null;hover:number|null;playing:boolean;playingId:number;advance:boolean;paused:boolean};
