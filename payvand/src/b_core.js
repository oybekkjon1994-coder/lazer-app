"use strict";
/* ================= yordamchilar ================= */
const $=s=>document.querySelector(s);
const PI=Math.PI,rad=d=>d*PI/180,deg=r=>r*180/PI;
const fmt=(x,d=1)=>{if(x==null||!isFinite(x))return"—";const neg=x<0;const s=Math.abs(Math.round(x*10**d)/10**d).toFixed(d);const [i,f]=s.split(".");return(neg?"−":"")+i.replace(/\B(?=(\d{3})+(?!\d))/g," ")+(f?","+f:"")};
const fmt0=x=>fmt(x,0);
const store={get(k,d){try{const v=localStorage.getItem("pu_"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("pu_"+k,JSON.stringify(v))}catch(e){}}};
function toast(t,ms=3200){const e=$("#toast");e.textContent=t;e.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.display="none",ms)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ================= ikonkalar ================= */
const I={
 offset:'<path d="M5 20v-6l6-6h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 5l3 3-3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 branch:'<circle cx="8" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="16" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/>',
 elbow:'<path d="M5 20V11a6 6 0 0 1 6-6h8" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M9 20v-8a3 3 0 0 1 3-3h7" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".6"/>',
 flow:'<path d="M4 15a8 8 0 1 1 16 0" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 15l4-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 drop:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" fill="currentColor"/>',
 purge:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 flask:'<path d="M9 3h6M10 3v6l-5 10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l-5-10V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
 rod:'<path d="M4 20L18 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M18 6l2-2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M5 15l-2 1M8 18l-1 2M3 19l2-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
 wire:'<circle cx="9" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="12" r="2" fill="currentColor"/><path d="M15 12h6" stroke="currentColor" stroke-width="2"/>',
 tig:'<path d="M6 20l8-8M14 12l4-8 2 2-6 6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
 fire:'<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3 1-6 1-8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
 temp:'<path d="M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="17" r="2" fill="currentColor"/>',
 gauge:'<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 13l4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 cone:'<path d="M12 3L4 20h16z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
 hopper:'<path d="M3 5h18l-6 9v5H9v-5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
 sq2r:'<rect x="3" y="13" width="18" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="12" cy="6" rx="5" ry="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 13l4-7M21 13l-4-7" stroke="currentColor" stroke-width="1.6"/>',
 bend:'<path d="M4 20h7a5 5 0 0 0 5-5V4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 bump:'<path d="M3 18c3 0 3-3 6-3s3 3 6 3 3-3 6-3" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="5" cy="9" r="2" fill="currentColor"/><path d="M7 9h12" stroke="currentColor" stroke-width="2"/>',
 mitre:'<path d="M4 20V4l16 16z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 16v-4h4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
 frame:'<rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4" stroke="currentColor" stroke-width="1.4"/>',
 laser:'<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
 folder:'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2"/>',
 weight:'<path d="M6 8h12l2 12H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="5" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/>',
 table:'<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M3 14h18M10 4v16" stroke="currentColor" stroke-width="1.6"/>',
 conv:'<path d="M4 8h14l-3-3M20 16H6l3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
 cyl:'<ellipse cx="12" cy="6" rx="7" ry="2.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 6v12c0 1.5 3 2.6 7 2.6s7-1.1 7-2.6V6" fill="none" stroke="currentColor" stroke-width="2"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill="currentColor"/>',
 book:'<path d="M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3zM21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
 compass:'<circle cx="12" cy="4.5" r="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 6.5L6 21M13 6.5L18 21M8 15h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
const ico=(k,cls="")=>`<svg viewBox="0 0 24 24" class="${cls}">${I[k]||""}</svg>`;

/* ================= bo'limlar va asboblar ================= */
const CATS=[
 {id:"home",name:"Bosh sahifa",ic:"home"},
 {id:"q",name:"Quvur",ic:"offset",cls:"ic-q",full:"Quvur ishlari"},
 {id:"p",name:"Payvand",ic:"fire",cls:"ic-p",full:"Payvand"},
 {id:"y",name:"Yoyilma",ic:"compass",cls:"ic-y",full:"Yoyilma va bukish (list metall)"},
 {id:"m",name:"Ma'lumot",ic:"book",cls:"ic-m",full:"Metall va ma'lumotnoma"},
];
const TOOLS=[];const T=o=>{TOOLS.push(o);return o};
const tool=id=>TOOLS.find(t=>t.id===id);

/* ================= forma va natija ================= */
/* fields: [{k,l,u,v,step,opts:[[val,label]],w}] */
function form(fields,vals){
  return `<div class="f">${fields.map(f=>{
    const v=vals[f.k]??f.v;
    const inner=f.opts?`<select data-k="${f.k}">${f.opts.map(o=>`<option value="${esc(o[0])}"${String(o[0])===String(v)?" selected":""}>${esc(o[1])}</option>`).join("")}</select>`
      :`<input data-k="${f.k}" type="${f.t||"number"}" inputmode="decimal" step="any" value="${esc(v)}">`;
    return `<div class="fld${f.w?" w":""}"><label>${esc(f.l)}</label><div class="in">${inner}${f.u?`<span class="u">${f.u}</span>`:""}</div></div>`}).join("")}</div>`;
}
function readVals(root,fields){const o={};fields.forEach(f=>{const e=root.querySelector(`[data-k="${f.k}"]`);if(!e)return;o[f.k]=f.opts||f.t?e.value:parseFloat(String(e.value).replace(",","."))});return o}
const R=(l,v,u="",big=false)=>`<div class="r${big?" big":""}"><div class="l">${l}</div><div class="v">${v}${u?`<small>${u}</small>`:""}</div></div>`;
const note=(t,c="")=>`<div class="note ${c}">${t}</div>`;
const tbl=(head,rows)=>`<div class="tw"><table class="t"><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;

/* ================= DXF va SVG ================= */
/* shape: {cut:[[ [x,y],... ], closed], bend:[[[x,y],[x,y]]], text:[[x,y,h,str]]} */
function dxf(sh){
  const L=[];const p=(...a)=>L.push(...a);
  p("0","SECTION","2","HEADER","9","$INSUNITS","70","4","0","ENDSEC");
  p("0","SECTION","2","TABLES","0","TABLE","2","LAYER","70","3");
  [["KESISH",1],["BUKISH",5],["MATN",7]].forEach(([n,c])=>p("0","LAYER","2",n,"70","0","62",String(c),"6",n==="BUKISH"?"DASHED":"CONTINUOUS"));
  p("0","ENDTAB","0","ENDSEC","0","SECTION","2","ENTITIES");
  const n=v=>(Math.round(v*1000)/1000).toString();
  (sh.cut||[]).forEach(([pts,closed])=>{p("0","POLYLINE","8","KESISH","66","1","70",closed?"1":"0");pts.forEach(q=>p("0","VERTEX","8","KESISH","10",n(q[0]),"20",n(q[1])));p("0","SEQEND","8","KESISH")});
  (sh.bend||[]).forEach(([a,b])=>p("0","LINE","8","BUKISH","10",n(a[0]),"20",n(a[1]),"11",n(b[0]),"21",n(b[1])));
  (sh.text||[]).forEach(([x,y,h,s])=>p("0","TEXT","8","MATN","10",n(x),"20",n(y),"40",n(h),"1",s));
  p("0","ENDSEC","0","EOF");return L.join("\n");
}
function bbox(sh){let a=[1e18,1e18,-1e18,-1e18];const add=q=>{a[0]=Math.min(a[0],q[0]);a[1]=Math.min(a[1],q[1]);a[2]=Math.max(a[2],q[0]);a[3]=Math.max(a[3],q[1])};
  (sh.cut||[]).forEach(([pts])=>pts.forEach(add));(sh.bend||[]).forEach(l=>l.forEach(add));return a}
function svgOf(sh,{dims=true}={}){
  const b=bbox(sh),w=b[2]-b[0],h=b[3]-b[1],m=Math.max(w,h)*0.06+1,vb=[b[0]-m,-(b[3]+m),w+2*m,h+2*m];
  const sw=Math.max(w,h)/320;
  const P=pts=>pts.map(q=>`${q[0].toFixed(2)},${(-q[1]).toFixed(2)}`).join(" ");
  let s=`<svg viewBox="${vb.map(v=>v.toFixed(2)).join(" ")}" xmlns="http://www.w3.org/2000/svg">`;
  (sh.fill||[]).forEach(pts=>s+=`<polygon points="${P(pts)}" fill="#e8b23a22"/>`);
  (sh.cut||[]).forEach(([pts,cl])=>s+=cl?`<polygon points="${P(pts)}" fill="#e8b23a18" stroke="#e8b23a" stroke-width="${sw*1.6}"/>`:`<polyline points="${P(pts)}" fill="none" stroke="#e8b23a" stroke-width="${sw*1.6}"/>`);
  (sh.bend||[]).forEach(([a,c])=>s+=`<line x1="${a[0]}" y1="${-a[1]}" x2="${c[0]}" y2="${-c[1]}" stroke="#4ea3ff" stroke-width="${sw}" stroke-dasharray="${sw*6} ${sw*4}"/>`);
  if(dims)s+=`<text x="${b[0]+w/2}" y="${-(b[1])+m*0.8}" fill="#9aa4b2" font-size="${Math.max(w,h)/26}" text-anchor="middle">${fmt0(w)} × ${fmt0(h)} mm</text>`;
  return s+"</svg>";
}
/* ================= faylni saqlash / ulashish ================= */
const isNative=()=>!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const b64=async blob=>{const buf=new Uint8Array(await blob.arrayBuffer());let s="";for(let i=0;i<buf.length;i+=0x8000)s+=String.fromCharCode.apply(null,buf.subarray(i,i+0x8000));return btoa(s)};
async function saveFile(name,text){
  const blob=new Blob([text],{type:"application/dxf"});
  if(isNative()){try{const P=window.Capacitor.Plugins;const data=await b64(blob);
      await P.Filesystem.writeFile({path:"PayvandUsta/"+name,data,directory:"DOCUMENTS",recursive:true}).catch(()=>{});
      const r=await P.Filesystem.writeFile({path:name,data,directory:"CACHE"});
      toast(name+" — Documents/PayvandUsta papkasiga saqlandi");
      await P.Share.share({title:name,files:[r.uri]}).catch(()=>{});}catch(e){toast("Saqlab bo'lmadi: "+(e.message||e))}return}
  try{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast(name+" yuklab olindi")}
  catch(e){navigator.clipboard&&navigator.clipboard.writeText(text);toast("DXF matni nusxalandi")}
}
function savePattern(name,sh){const L=store.get("pat",[]);L.unshift({name,at:Date.now(),sh});store.set("pat",L.slice(0,60));toast("“"+name+"” — Mening yoyilmalarimga saqlandi")}
function shapeButtons(name,sh){
  return `<div class="btns"><button class="btn p" data-act="dxf">DXF yuklab olish</button><button class="btn" data-act="save">Saqlab qo'yish</button></div>`;
}
function bindShape(root,name,sh){
  root.querySelectorAll('[data-act="dxf"]').forEach(b=>b.onclick=()=>saveFile(name.replace(/[^\w\-]+/g,"_")+".dxf",dxf(sh)));
  root.querySelectorAll('[data-act="save"]').forEach(b=>b.onclick=()=>savePattern(name,sh));
}

/* ================= yoyish (triangulyatsiya) ================= */
/* P: {nom:[x,y,z]}, tris: [[a,b,c],...] ketma-ket uchburchaklar (oldingi bilan umumiy qirra) */
function unfold(P,tris){
  const d3=(a,b)=>Math.hypot(P[a][0]-P[b][0],P[a][1]-P[b][1],P[a][2]-P[b][2]);
  const pos={},ev=[];
  const place=(p,q,dp,dq,side)=>{const dx=q[0]-p[0],dy=q[1]-p[1],D=Math.hypot(dx,dy);const a=(dp*dp-dq*dq+D*D)/(2*D),h=Math.sqrt(Math.max(0,dp*dp-a*a));const mx=p[0]+a*dx/D,my=p[1]+a*dy/D;return[[mx-h*dy/D,my+h*dx/D],[mx+h*dy/D,my-h*dx/D]]};
  const [a,b,c]=tris[0];pos[a]=[0,0];pos[b]=[d3(a,b),0];pos[c]=place(pos[a],pos[b],d3(a,c),d3(b,c))[0];ev.push([a,pos[a]],[b,pos[b]],[c,pos[c]]);
  let prev=tris[0];
  for(let i=1;i<tris.length;i++){const t=tris[i];const sh=t.filter(x=>prev.includes(x));const nw=t.find(x=>!sh.includes(x));const other=prev.find(x=>!sh.includes(x));
    const p=pos[sh[0]],q=pos[sh[1]],o=pos[other];const cand=place(p,q,d3(nw,sh[0]),d3(nw,sh[1]));
    const sgn=pt=>Math.sign((q[0]-p[0])*(pt[1]-p[1])-(q[1]-p[1])*(pt[0]-p[0]));
    const pick=sgn(cand[0])!==sgn(o)?cand[0]:cand[1];pos[nw]=pick;ev.push([nw,pick]);prev=t}
  return{pos,ev};
}

/* ================= 3D ko'rinish (kutubxonasiz) ================= */
/* mesh: {tris:[[p1,p2,p3,ci],...], cols:["#rrggbb",...]} p=[x,y,z], z — yuqoriga */
const V3={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm:a=>{const l=Math.hypot(...a)||1;return[a[0]/l,a[1]/l,a[2]/l]}};
function quadMesh(grid,ci,M){/* grid[i][j] nuqtalar to'ri */for(let i=0;i<grid.length-1;i++)for(let j=0;j<grid[i].length-1;j++){const a=grid[i][j],b=grid[i][j+1],c=grid[i+1][j+1],d=grid[i+1][j];M.tris.push([a,b,c,ci],[a,c,d,ci])}}
const view3dHTML=()=>`<h3 class="sec">3D ko'rinish</h3><div class="svgbox" style="position:relative;touch-action:none"><canvas class="v3d" style="width:100%;height:340px;display:block"></canvas><div style="position:absolute;right:12px;bottom:8px;color:#9aa4b2;font-size:12px">barmoq bilan aylantiring</div></div>`;
function view3d(cv,mesh){
  const dpr=Math.min(2,window.devicePixelRatio||1);const W=cv.clientWidth||360,H=cv.clientHeight||340;cv.width=W*dpr;cv.height=H*dpr;const g=cv.getContext("2d");g.scale(dpr,dpr);
  let mn=[1e18,1e18,1e18],mx=[-1e18,-1e18,-1e18];mesh.tris.forEach(t=>{for(let k=0;k<3;k++)for(let a=0;a<3;a++){mn[a]=Math.min(mn[a],t[k][a]);mx[a]=Math.max(mx[a],t[k][a])}});
  const c=[(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2],rad0=Math.hypot(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2])/2||1;
  const T=mesh.tris.map(t=>{const n=V3.norm(V3.cross(V3.sub(t[1],t[0]),V3.sub(t[2],t[0])));return{p:[0,1,2].map(k=>V3.sub(t[k],c)),n,ci:t[3]}});
  const rgb=mesh.cols.map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
  let yaw=-0.7,pitch=0.5,zoom=1;const L=V3.norm([-0.4,-0.6,0.7]);
  function draw(){g.clearRect(0,0,W,H);const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const s=Math.min(W,H)*0.42/rad0*zoom;
    const R=p=>{const x=p[0]*cy-p[1]*sy,y=p[0]*sy+p[1]*cy,z=p[2];const y2=y*cp-z*sp,z2=y*sp+z*cp;return[x,y2,z2]};
    const list=T.map(t=>{const q=t.p.map(R);const n=R(t.n);return{q,n,ci:t.ci,d:(q[0][1]+q[1][1]+q[2][1])/3}}).sort((a,b)=>b.d-a.d);
    for(const t of list){const lam=0.35+0.65*Math.abs(t.n[0]*L[0]+t.n[1]*L[1]+t.n[2]*L[2]);const k=rgb[t.ci];const col=`rgb(${k.map(v=>Math.min(255,Math.round(v*lam))).join(",")})`;
      g.beginPath();t.q.forEach((p,i)=>{const X=W/2+p[0]*s,Y=H/2-p[2]*s;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.closePath();g.fillStyle=col;g.strokeStyle=col;g.lineWidth=0.6;g.fill();g.stroke()}}
  const pts=new Map();let d0=0;
  cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const [a,b]=[...pts.values()];d0=Math.hypot(a[0]-b[0],a[1]-b[1])}};
  cv.onpointermove=e=>{if(!pts.has(e.pointerId))return;const o=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===1){yaw+=(e.clientX-o[0])*0.01;pitch=Math.max(-1.5,Math.min(1.5,pitch+(e.clientY-o[1])*0.01))}
    else if(pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d0)zoom=Math.max(0.3,Math.min(5,zoom*d/d0));d0=d}draw()};
  cv.onpointerup=cv.onpointercancel=e=>{pts.delete(e.pointerId);d0=0};
  cv.onwheel=e=>{e.preventDefault();zoom=Math.max(0.3,Math.min(5,zoom*(e.deltaY<0?1.1:0.9)));draw()};
  draw();
}

const MC=["#d9a441","#9aa6b2","#5f9ed8"];
function revMesh(rings,ci,M,n=48){/* rings: [[r,z],...] */const g=rings.map(([r,z])=>{const row=[];for(let j=0;j<=n;j++){const a=2*PI*j/n;row.push([r*Math.cos(a),r*Math.sin(a),z])}return row});quadMesh(g,ci,M)}
function trisMesh(P,tr,ci){return{tris:tr.map(t=>[P[t[0]],P[t[1]],P[t[2]],ci]),cols:MC}}
