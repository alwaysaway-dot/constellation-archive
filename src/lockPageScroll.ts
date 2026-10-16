// Lock the root scroller as well as the body: a fixed body alone still lets
// wheel/touch events on a modal's transparent area scroll the document.
export function lockPageScroll() {
 const root=document.documentElement,body=document.body;
 const x=window.scrollX,y=window.scrollY;
 const rootStyle={overflow:root.style.overflow,overscrollBehavior:root.style.overscrollBehavior,scrollBehavior:root.style.scrollBehavior};
 const bodyStyle={position:body.style.position,top:body.style.top,left:body.style.left,width:body.style.width,overflow:body.style.overflow,paddingRight:body.style.paddingRight};
 const gutter=window.innerWidth-root.clientWidth;
 root.style.overflow='hidden';root.style.overscrollBehavior='none';root.style.scrollBehavior='auto';
 body.style.position='fixed';body.style.top=`-${y}px`;body.style.left=`-${x}px`;body.style.width='100%';body.style.overflow='hidden';
 if(gutter>0)body.style.paddingRight=`${parseFloat(getComputedStyle(body).paddingRight)+gutter}px`;
 return()=>{Object.assign(body.style,bodyStyle);Object.assign(root.style,rootStyle);window.scrollTo({left:x,top:y,behavior:'instant'})};
}
