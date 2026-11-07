/* ================= YOYILMA — qo'shimchalar ================= */
T({id:"shell",cat:"y",sub:"Yoyilmalar",ic:"cyl",name:"Bak / rezervuar obechaykasi",
 desc:"Katta silindr bak devorini listlardan yig'ish: har qatordagi listlar soni, oxirgi list uzunligi, choklarni siljitish.",
 fields:()=>[{k:"D",l:"Bak ichki diametri",u:"mm",v:3000},{k:"H",l:"Bak balandligi",u:"mm",v:4000},{k:"t",l:"List qalinligi",u:"mm",v:5},{k:"pl",l:"List uzunligi",u:"mm",v:6000},{k:"pw",l:"List eni",u:"mm",v:1500}],
 calc(v){const C=PI*(v.D+v.t),n=Math.ceil(C/v.pl),last=C-(n-1)*v.pl,rows=Math.ceil(v.H/v.pw),lastW=v.H-(rows-1)*v.pw;const kg=C*v.H*v.t*7.85e-6;
  const sh={cut:[],bend:[]};for(let r=0;r<rows;r++){const y0=r*v.pw,h=r===rows-1?lastW:v.pw,off=(r%2)*v.pl/2;let x=-off;sh.cut.push([[[0,y0],[C,y0],[C,y0+h],[0,y0+h]],true]);
    for(let k=1;k<=n+1;k++){x+=v.pl;if(x>0&&x<C)sh.bend.push([[x,y0],[x,y0+h]])}}
  return{html:`<div class="res">${R("Yoyilma uzunligi (aylana)",fmt(C,0),"mm",1)}${R("Qatorlar soni",rows)}${R("Har qatorda listlar",`${n} (oxirgisi ${fmt0(last)} mm)`)}${R("Oxirgi qator eni",fmt0(lastW),"mm")}${R("Devor og'irligi",fmt(kg,0),"kg")}${R("Kerakli listlar (taxm.)",Math.ceil(C*v.H/(v.pl*v.pw)))}</div><div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}`
   +note("Ko'k chiziqlar — tik choklar. Qo'shni qatorlarning tik choklari yarim listga surilgan (bir chiziqda bo'lmasligi kerak, kamida 5×qalinlik)."),shape:sh,name:`bak_${v.D}x${v.H}`,mesh:(()=>{const M={tris:[],cols:MC};revMesh([[v.D/2,0],[v.D/2,v.H]],0,M);return M})()}}});

T({id:"elements",cat:"y",sub:"Belgilash",ic:"cyl",name:"Element chiziqlari (qiya kesik)",
 desc:"Quvurni qiya tekislik bo'yicha kesish uchun yasovchi chiziqlar uzunligi va o'rash shabloni.",
 fields:()=>[{k:"D",l:"Quvur tashqi diametri",u:"mm",v:108},{k:"a",l:"Kesik burchagi (to'g'ri kesimdan)",u:"°",v:30},{k:"L",l:"Eng qisqa tomon uzunligi",u:"mm",v:100},{k:"n",l:"Bo'laklar",v:"16",opts:[["8","8"],["12","12"],["16","16"],["24","24"]]}],
 calc(v){const r=v.D/2,ta=Math.tan(rad(v.a)),N=+v.n,C=2*PI*r;const Lf=f=>v.L+r*(1-Math.cos(f))*ta;const M=144,pts=[];for(let i=0;i<=M;i++){const f=2*PI*i/M;pts.push([r*f,Lf(f)])}
  const sh={cut:[[[[0,0],...pts.map(p=>p).slice(0,1).map(()=>[0,0]),[C,0],...pts.reverse()],true]],bend:[]};const rows=[];for(let k=0;k<N;k++){const f=2*PI*k/N;rows.push([k+1,fmt(r*f,1),fmt(Lf(f),1)]);sh.bend.push([[r*f,0],[r*f,Lf(f)]])}
  const Me={tris:[],cols:MC};quadMesh([0,1].map(s=>{const row=[];for(let j=0;j<=48;j++){const f=2*PI*j/48;row.push([r*Math.cos(f),r*Math.sin(f),s?Lf(f):0])}return row}),0,Me);
  return{html:`<div class="res">${R("Eng uzun tomon",fmt(Lf(PI),1),"mm",1)}${R("Shablon uzunligi",fmt(C,1),"mm")}${R("Kesik ellips uzun o'qi",fmt(v.D/Math.cos(rad(v.a)),1),"mm")}</div><div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}${tbl(["№","Aylana bo'yicha, mm","Uzunlik, mm"],rows)}`,shape:sh,name:`qiya_kesik_${v.D}_${v.a}`,mesh:Me}}});

const VC={cs:[22,"Qora po'lat"],ss:[10,"Zanglamas"],ci:[18,"Cho'yan"],al:[70,"Alyuminiy"],cu:[40,"Mis / latun"]};
T({id:"drill",cat:"y",sub:"Belgilash",ic:"laser",name:"Parmalash rejimi",
 desc:"Parma diametri va metall bo'yicha aylanish tezligi, uzatish va dastlabki (pilot) teshik.",
 fields:()=>[{k:"d",l:"Parma diametri",u:"mm",v:12},{k:"m",l:"Metall",v:"cs",opts:Object.entries(VC).map(([k,x])=>[k,x[1]])},{k:"tl",l:"Parma turi",v:"1",opts:[["1","Tezkesar (HSS)"],["2.5","Qattiq qotishma / kobalt"]]}],
 calc(v){const vc=VC[v.m][0]*(+v.tl);const n=1000*vc/(PI*v.d);const f=Math.max(0.03,0.018*v.d)*(v.m==="ss"?0.7:v.m==="al"?1.4:1);
  return`<div class="res">${R("Aylanish tezligi",fmt0(n),"ayl/min",1)}${R("Kesish tezligi",fmt0(vc),"m/min")}${R("Uzatish",fmt(f,2),"mm/ayl")}${R("Pilot teshik",v.d>10?fmt(Math.max(4,v.d*0.35),1)+" mm":"Shart emas")}</div>`+note(v.m==="ss"?"Zanglamas po'latda sekin aylantirib, kuchli bosib parmalang, to'xtamang — aks holda metall qotib qoladi. Moylovchi suyuqlik ishlating.":"10 mm dan katta teshikni avval kichik parma bilan oching. Po'latni moylovchi suyuqlik bilan parmalang.")}});

/* ================= ISO (izometrik) eskiz ================= */
const DIRS={U:["↑ Yuqori",[0,0,1]],D:["↓ Past",[0,0,-1]],N:["Shimol",[0,1,0]],S:["Janub",[0,-1,0]],E:["Sharq",[1,0,0]],W:["G'arb",[-1,0,0]]};
const isoP=p=>[(p[0]-p[1])*0.866,(p[0]+p[1])*0.5+p[2]];
function isoCalc(st){const f=fit(st.dn)||FIT[5];const A=f[3];let p=[0,0,0];const pts=[p],segs=[];let elbows=0;
  st.segs.forEach((s,i)=>{const d=DIRS[s.d][1];const q=[p[0]+d[0]*s.L,p[1]+d[1]*s.L,p[2]+d[2]*s.L];segs.push({a:p,b:q,s});pts.push(q);p=q});
  const cut=segs.map((g,i)=>{const prevTurn=i>0&&segs[i-1].s.d!==g.s.d,nextTurn=i<segs.length-1&&segs[i+1].s.d!==g.s.d;if(nextTurn)elbows++;return g.s.L-(prevTurn?A:0)-(nextTurn?A:0)});
  const bad=st.segs.some((s,i)=>i>0&&DIRS[s.d][1].every((x,k)=>x===-DIRS[st.segs[i-1].d][1][k]));
  return{segs,cut,elbows,total:st.segs.reduce((a,s)=>a+s.L,0),A,bad}}
function isoShape(st,c){const sh={line:[],label:[],dot:[]};c.segs.forEach((g,i)=>{const a=isoP(g.a),b=isoP(g.b);sh.line.push([a,b]);sh.label.push([(a[0]+b[0])/2,(a[1]+b[1])/2+20,fmt0(g.s.L)]);if(i<c.segs.length-1)sh.dot.push(b)});return sh}
T({id:"iso",cat:"q",sub:"Chizma va ma'lumot",ic:"offset",name:"ISO eskiz (izometriya)",custom:1,quick:0,
 desc:"Quvur liniyasini yo'nalish va uzunlik bilan kiriting — izometrik chizma, tirsaklar soni va har bo'lakning kesish uzunligi chiqadi.",
 render(root){const st=store.get("iso_cur",{name:"Liniya 1",dn:"50",segs:[{d:"E",L:1500},{d:"U",L:800},{d:"N",L:1200}]});let dir=st.lastDir||"E";
  const save=()=>store.set("iso_cur",st);
  const draw=()=>{const c=isoCalc(st);const sh=isoShape(st,c);
   root.innerHTML=`<div class="card"><div class="f">${`<div class="fld w"><label>Nomi</label><div class="in"><input id="nm" type="text" value="${esc(st.name)}"></div></div>`}<div class="fld w"><label>Quvur o'lchami</label><div class="in"><select id="dn">${DNOPT.map(o=>`<option value="${o[0]}"${o[0]===st.dn?" selected":""}>${o[1]}</option>`).join("")}</select></div></div></div></div>
    <div class="card"><h4>Bo'lak qo'shish</h4><div class="seg">${Object.entries(DIRS).map(([k,x])=>`<button data-d="${k}" class="${k===dir?"on":""}">${x[0]}</button>`).join("")}</div>
     <div class="f"><div class="fld"><label>Uzunlik (markazdan markazga)</label><div class="in"><input id="len" type="number" inputmode="decimal" value="1000"><span class="u">mm</span></div></div><div class="fld"><label>&nbsp;</label><button class="btn p" id="add" style="margin:0">+ Qo'shish</button></div></div></div>
    <div class="svgbox">${st.segs.length?svgOf(sh,{dims:false}):""}</div>
    <div class="res" style="margin-top:12px">${R("Umumiy uzunlik (markazlar)",fmt0(c.total),"mm",1)}${R("90° tirsaklar",c.elbows,"dona")}${R("Kesiladigan quvur",fmt0(c.cut.reduce((a,x)=>a+x,0)),"mm")}${R("Tirsak cheki (A)",fmt0(c.A),"mm")}</div>
    ${c.bad?note("Ketma-ket ikki bo'lak qarama-qarshi yo'nalishda — bunday bo'lishi mumkin emas.","warn"):""}
    <h3 class="sec">Bo'laklar</h3>${tbl(["№","Yo'nalish","Markazlar, mm","Kesish, mm",""],st.segs.map((s,i)=>[i+1,DIRS[s.d][0],fmt0(s.L),fmt0(c.cut[i]),`<button class="btn" style="min-width:0;padding:4px 10px" data-x="${i}">✕</button>`]))}
    <div class="btns"><button class="btn p" id="sv">Saqlash</button><button class="btn" id="dx">DXF</button><button class="btn" id="nw">Yangi</button></div>`;
   root.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{dir=b.dataset.d;st.lastDir=dir;save();draw()});
   root.querySelector("#add").onclick=()=>{const L=parseFloat(root.querySelector("#len").value);if(!(L>0))return toast("Uzunlikni kiriting");const last=st.segs[st.segs.length-1];if(last&&last.d===dir)last.L+=L;else st.segs.push({d:dir,L});save();draw()};
   root.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{st.segs.splice(+b.dataset.x,1);save();draw()});
   root.querySelector("#nm").onchange=e=>{st.name=e.target.value;save()};root.querySelector("#dn").onchange=e=>{st.dn=e.target.value;save();draw()};
   root.querySelector("#sv").onclick=()=>{const L=store.get("iso_plans",[]);L.unshift({...JSON.parse(JSON.stringify(st)),at:Date.now()});store.set("iso_plans",L.slice(0,50));toast("Saqlandi: "+st.name)};
   root.querySelector("#dx").onclick=()=>{const s2={cut:sh.line.map(l=>[l,false]),text:sh.label.map(l=>[l[0],l[1],40,l[2]])};saveFile(st.name.replace(/[^\w\-]+/g,"_")+"_iso.dxf",dxf(s2))};
   root.querySelector("#nw").onclick=()=>{st.segs=[];st.name="Liniya "+(store.get("iso_plans",[]).length+1);save();draw()};};
  draw()}});
T({id:"isoplans",cat:"q",sub:"Chizma va ma'lumot",ic:"folder",name:"Mening ISO chizmalarim",custom:1,
 desc:"Saqlangan izometrik eskizlar. Ochish — davom ettirish uchun.",
 render(root){const L=store.get("iso_plans",[]);if(!L.length){root.innerHTML=`<div class="empty">Hali saqlangan chizma yo'q.</div>`;return}
  root.innerHTML=L.map((p,i)=>{const c=isoCalc(p);return`<div class="card"><h4>${esc(p.name)} · DN${p.dn}</h4><div class="desc">${new Date(p.at).toLocaleString("uz-UZ")} · ${fmt0(c.total)} mm · ${c.elbows} tirsak</div><div class="svgbox">${svgOf(isoShape(p,c),{dims:false})}</div><div class="btns"><button class="btn p" data-o="${i}">Ochish</button><button class="btn" data-x="${i}">O'chirish</button></div></div>`}).join("");
  root.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const p=L[+b.dataset.o];store.set("iso_cur",{name:p.name,dn:p.dn,segs:p.segs});go("t/iso")});
  root.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{L.splice(+b.dataset.x,1);store.set("iso_plans",L);this.render(root)})}});

/* ---- bo'lim ichidagi guruhlar ---- */
const SUBS={offset:"Tirsak va offset",miter:"Belgilash va kesish",branch:"Belgilash va kesish",flow:"Sinov va hisob",pipew:"Sinov va hisob",hydro:"Sinov va hisob",
 mma:"Sozlash",mig:"Sozlash",tig:"Sozlash",purge:"Sozlash",compat:"Tushunish",heat:"Tushunish",preheat:"Tushunish",
 cone:"Yoyilmalar",cyl:"Yoyilmalar",sq2r:"Yoyilmalar",hopper:"Yoyilmalar",bend:"Yoyilmalar",bump:"Yoyilmalar",mypat:"Yoyilmalar",mitre:"Belgilash",frame:"Belgilash",laser:"Belgilash",
 weight:"Metall",pipes:"Jadvallar",pres:"Birliklar",inch:"Birliklar",gas:"Gaz"};
TOOLS.forEach(t=>{if(!t.sub&&SUBS[t.id])t.sub=SUBS[t.id]});
const SUBORDER={q:["Chizma va ma'lumot","Tirsak va offset","Belgilash va kesish","Flanetslar","Sinov va hisob"],p:["Sozlash","Tushunish","Nazorat","Belgilash","Kuzatish"],y:["Yoyilmalar","Belgilash"],m:["Metall","Jadvallar","Birliklar","Gaz"]};
