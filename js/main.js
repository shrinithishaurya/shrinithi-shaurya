(function(){
"use strict";
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- router ---------- */
var views=document.querySelectorAll(".view");
var navlinks=document.querySelectorAll("[data-nav]");
function route(){
  var h=(location.hash||"").replace("#","")||"home";
  if(!document.getElementById("view-"+h))h="home";
  views.forEach(function(v){v.classList.toggle("active",v.id==="view-"+h);});
  navlinks.forEach(function(a){ if(a.getAttribute("data-nav")===h)a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  document.body.setAttribute("data-view",h);
  window.scrollTo(0,0);
  if(typeof closeLb==="function")closeLb();
  var active=document.getElementById("view-"+h);
  if(active){
    var rev=active.querySelectorAll(".reveal");
    if(reduce){rev.forEach(function(e){e.classList.add("in");});}
    else{rev.forEach(function(e,i){e.classList.remove("in");setTimeout(function(){e.classList.add("in");},60+i*55);});}
  }
  var mm=document.querySelector(".mobile-menu"); if(mm)mm.classList.remove("open");
  var mb=document.querySelector(".menu-btn"); if(mb)mb.textContent="\u2261";
}
window.addEventListener("hashchange",route);

var btn=document.querySelector(".menu-btn"),menu=document.querySelector(".mobile-menu");
if(btn&&menu){btn.addEventListener("click",function(){var o=menu.classList.toggle("open");btn.textContent=o?"\u2715":"\u2261";});}
var yr=document.getElementById("yr"); if(yr)yr.textContent=new Date().getFullYear();

/* ---------- photo lightbox (enlarge, deter saving) ---------- */
var lb=document.getElementById("lightbox"),lbImg=document.getElementById("lbImg");
document.querySelectorAll(".tile").forEach(function(tile){
  tile.addEventListener("click",function(){var im=tile.querySelector("img");if(!im||!lb)return;
    lbImg.style.backgroundImage="url("+im.getAttribute("src")+")";lb.classList.add("open");});});
function closeLb(){if(lb){lb.classList.remove("open");lbImg.style.backgroundImage="";}}
if(lb)lb.addEventListener("click",closeLb);
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeLb();});
document.addEventListener("dragstart",function(e){if(e.target&&e.target.tagName==="IMG")e.preventDefault();});
document.addEventListener("contextmenu",function(e){var tg=e.target;if(!tg)return;
  var cls=(""+(tg.className||""));if(tg.tagName==="IMG"||cls.indexOf("lb-img")>=0||cls.indexOf("tile")>=0)e.preventDefault();});

/* ---------- cosmos ---------- */
var cv=document.getElementById("cosmos");
var ctx=cv.getContext("2d");
var isMobile=matchMedia("(max-width:760px)").matches;
var W=0,H=0,cx=0,cy=0,DPR=1,focal=800,t=0;
function isHome(){return document.body.getAttribute("data-view")==="home"||!document.body.getAttribute("data-view");}
var scrollY=0;
var cueEl=document.querySelector(".cue");
window.addEventListener("scroll",function(){scrollY=window.pageYOffset||document.documentElement.scrollTop||0;
  if(cueEl)cueEl.style.opacity=scrollY>30?"0":"1";},{passive:true});
function ease(x){x=x<0?0:x>1?1:x;return x*x*(3-2*x);}

/* starfield */
var stars=[];
function seedStars(){var n=isMobile?90:150;stars=[];for(var i=0;i<n;i++)stars.push(newStar(Math.random()));}
function newStar(d){return{x:Math.random()*2-1,y:Math.random()*2-1,z:d*0.98+0.02};}

/* geodesic sphere */
var verts=[],edges=[],vspark=[],parts=[],FIL=[];
function nrm(a){var l=Math.hypot(a[0],a[1],a[2]);return[a[0]/l,a[1]/l,a[2]/l];}
function icosphere(sub){
  var p=(1+Math.sqrt(5))/2;
  var v=[[-1,p,0],[1,p,0],[-1,-p,0],[1,-p,0],[0,-1,p],[0,1,p],[0,-1,-p],[0,1,-p],[p,0,-1],[p,0,1],[-p,0,-1],[-p,0,1]].map(nrm);
  var f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  for(var s=0;s<sub;s++){var mid={},nf=[];
    var gm=function(a,b){var k=a<b?a+"_"+b:b+"_"+a;if(mid[k]!==undefined)return mid[k];
      var va=v[a],vb=v[b];v.push(nrm([(va[0]+vb[0])/2,(va[1]+vb[1])/2,(va[2]+vb[2])/2]));return mid[k]=v.length-1;};
    for(var i=0;i<f.length;i++){var fa=f[i],a=gm(fa[0],fa[1]),b=gm(fa[1],fa[2]),c=gm(fa[2],fa[0]);
      nf.push([fa[0],a,c],[fa[1],b,a],[fa[2],c,b],[a,b,c]);}
    f=nf;}
  var es={},ed=[];
  for(var k=0;k<f.length;k++){var pr=[[f[k][0],f[k][1]],[f[k][1],f[k][2]],[f[k][2],f[k][0]]];
    for(var q=0;q<3;q++){var A=pr[q][0],B=pr[q][1],ky=A<B?A+"_"+B:B+"_"+A;if(!es[ky]){es[ky]=1;ed.push([A,B]);}}}
  return{verts:v,edges:ed};
}
function buildSphere(){
  var g=icosphere(isMobile?1:2);verts=g.verts;edges=g.edges;
  vspark=verts.map(function(){return Math.random()<0.06;});
  var PN=isMobile?320:900,gold=Math.PI*(3-Math.sqrt(5));parts=[];
  for(var i=0;i<PN;i++){var y=1-(i/(PN-1))*2,r=Math.sqrt(Math.max(0,1-y*y)),th=gold*i*1.0007;
    parts.push({x:Math.cos(th)*r,y:y,z:Math.sin(th)*r,rad:0.985+Math.random()*0.05,tw:Math.random()<0.06,ph:Math.random()*6.28});}
  FIL=[];for(var j=0;j<=150;j++){var u=j/150*Math.PI*2;FIL.push([Math.sin(u*2)*0.52,Math.sin(u*3+0.6)*0.40,Math.cos(u*2+1.1)*0.52]);}
}
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);W=window.innerWidth;H=window.innerHeight;
  cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
  cx=W/2;cy=H*0.5;focal=Math.min(W,H)*0.92;if(!stars.length)seedStars();
}
function draw(){
  ctx.clearRect(0,0,W,H);t+=0.0016;
  ctx.globalCompositeOperation="lighter";
  var home=isHome();
  var openP=home?ease(Math.min(scrollY/(H*0.9),1)):0;
  /* starfield */
  var sp=0.0006+openP*0.02;
  for(var i=0;i<stars.length;i++){var s=stars[i],pz=s.z;s.z-=sp;if(s.z<=0.02){stars[i]=newStar(1);continue;}
    var k=focal/s.z,pk=focal/pz;var sx=cx+s.x*k*0.5,sy=cy+s.y*k*0.5,px=cx+s.x*pk*0.5,py=cy+s.y*pk*0.5;
    if(sx<-30||sx>W+30||sy<-30||sy>H+30)continue;var near=1-s.z,a=Math.min(near*0.95,1)*(home?(0.62+openP*0.55):0.5);
    ctx.strokeStyle="rgba("+(180+near*55|0)+","+(195+near*40|0)+",255,"+a+")";ctx.lineWidth=0.4+near*1.4;
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(sx,sy);ctx.stroke();}
  if(home&&verts.length)drawSphere(openP);
  ctx.globalCompositeOperation="source-over";
  requestAnimationFrame(draw);
}
function drawSphere(openP){
  var sphereA=1-ease(Math.min(openP*1.15,1));
  if(sphereA<=0.004)return;
  var R=Math.min(W,H)*0.30*(1+openP*6.5);
  var rot=t*0.5,cA=Math.cos(rot),sA=Math.sin(rot),tilt=0.42,cT=Math.cos(tilt),sT=Math.sin(tilt);
  var lx=Math.sin(t*0.5)*0.32,ly=0.5,lz=0.82,ll=Math.hypot(lx,ly,lz),Lx=lx/ll,Ly=ly/ll,Lz=lz/ll;
  var ax=Math.cos(t*0.4),ay=Math.sin(t*0.6)*0.6,az=Math.sin(t*0.4),al=Math.hypot(ax,ay,az),Ax=ax/al,Ay=ay/al,Az=az/al;

  var bh=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.25);
  bh.addColorStop(0,"rgba(70,100,235,"+(0.18*sphereA)+")");bh.addColorStop(.55,"rgba(50,70,180,"+(0.06*sphereA)+")");bh.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=bh;ctx.beginPath();ctx.arc(cx,cy,R*1.25,0,6.283);ctx.fill();

  var hp=1/(1.95-Lz),hx=cx+Lx*R*hp,hy=cy+Ly*R*hp;
  var cap=ctx.createRadialGradient(hx,hy,0,hx,hy,R*0.82);
  cap.addColorStop(0,"rgba(160,190,255,"+(0.5*sphereA)+")");cap.addColorStop(.35,"rgba(95,125,240,"+(0.2*sphereA)+")");cap.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=cap;ctx.beginPath();ctx.arc(hx,hy,R*0.82,0,6.283);ctx.fill();

  function rp(pt,rad){var x=pt[0]*cA-pt[2]*sA,z=pt[0]*sA+pt[2]*cA,y=pt[1];
    var y2=y*cT-z*sT,z2=y*sT+z*cT;var light=Math.max(0,x*Lx+y2*Ly+z2*Lz),acc=Math.max(0,x*Ax+y2*Ay+z2*Az);
    var persp=1/(1.95-z2);return{sx:cx+x*R*rad*persp,sy:cy+y2*R*rad*persp,z:z2,depth:(z2+1)/2,light:light,acc:acc,persp:persp};}

  var rv=new Array(verts.length),i;
  for(i=0;i<verts.length;i++)rv[i]=rp(verts[i],1);

  var edgeFade=(1-openP*0.5);
  ctx.lineWidth=1;
  for(i=0;i<edges.length;i++){var a=rv[edges[i][0]],b=rv[edges[i][1]];var dep=(a.depth+b.depth)/2,lt=(a.light+b.light)/2;
    var e=(0.028+dep*0.08+Math.pow(lt,1.4)*0.34)*sphereA*edgeFade;if(e<0.004)continue;
    ctx.strokeStyle="rgba(155,182,255,"+e+")";ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();}

  ctx.lineJoin="round";
  var fr=FIL.map(function(p){return rp(p,1);});
  ctx.strokeStyle="rgba(120,160,255,"+(0.10*sphereA)+")";ctx.lineWidth=4;
  ctx.beginPath();fr.forEach(function(p,i){i?ctx.lineTo(p.sx,p.sy):ctx.moveTo(p.sx,p.sy);});ctx.stroke();
  ctx.strokeStyle="rgba(205,225,255,"+(0.55*sphereA)+")";ctx.lineWidth=1.1;
  ctx.beginPath();fr.forEach(function(p,i){i?ctx.lineTo(p.sx,p.sy):ctx.moveTo(p.sx,p.sy);});ctx.stroke();

  function dot(p,spark,ph){var d=p.depth,size=(0.55+d*1.7+p.light*1.7)*p.persp;
    var a=(0.10+d*0.42+Math.pow(p.light,1.3)*1.05)*sphereA;if(a>sphereA)a=sphereA;if(spark)a*=0.55+0.45*Math.sin(t*5+ph);
    var am=Math.pow(p.acc,3);
    var r=(150+d*70+p.light*35)*(1-am)+240*am,g=(180+d*50+p.light*35)*(1-am)+95*am,bl=255*(1-am)+185*am;
    ctx.fillStyle="rgba("+(r|0)+","+(g|0)+","+(bl|0)+","+a+")";
    ctx.beginPath();ctx.arc(p.sx,p.sy,Math.max(0.3,size),0,6.283);ctx.fill();
    if(spark&&d>0.6&&p.light>0.28){var fl=size*5.5;ctx.strokeStyle="rgba(220,232,255,"+(0.42*sphereA)+")";ctx.lineWidth=0.7;
      ctx.beginPath();ctx.moveTo(p.sx-fl,p.sy);ctx.lineTo(p.sx+fl,p.sy);ctx.moveTo(p.sx,p.sy-fl);ctx.lineTo(p.sx,p.sy+fl);ctx.stroke();}}
  for(i=0;i<verts.length;i++)dot(rv[i],vspark[i],i);
  for(i=0;i<parts.length;i++){var pp=parts[i];dot(rp(pp,pp.rad),pp.tw,pp.ph);}
}
window.addEventListener("resize",resize,{passive:true});
buildSphere();resize();route();
requestAnimationFrame(draw);
})();
