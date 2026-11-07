/* ================= QUVUR — qo'shimchalar ================= */
/* ASME B16.9 fitinglar: NPS, DN, OD, 90°LR A, 45°LR B, 90°SR A, Tройник C, Reduktor H, Zaglushka E (mm) */
const FIT=[["1/2",15,21.3,38,16,"—",25,"—",25],["3/4",20,26.7,38,19,"—",29,38,25],["1",25,33.4,38,22,25,38,51,38],["1¼",32,42.2,48,25,32,48,51,38],["1½",40,48.3,57,29,38,57,64,38],
 ["2",50,60.3,76,35,51,64,76,38],["2½",65,73.0,95,44,64,76,89,38],["3",80,88.9,114,51,76,86,89,51],["4",100,114.3,152,64,102,105,102,64],["5",125,141.3,190,79,127,124,127,76],
 ["6",150,168.3,229,95,152,143,140,89],["8",200,219.1,305,127,203,178,152,102],["10",250,273.0,381,159,254,216,178,127],["12",300,323.8,457,190,305,254,203,152],
 ["14",350,355.6,533,222,356,279,330,165],["16",400,406.4,610,254,406,305,356,178],["18",450,457,686,286,457,343,381,203],["20",500,508,762,318,508,381,508,229],["24",600,610,914,381,610,432,508,267]];
const DNOPT=FIT.map(f=>[String(f[1]),`DN${f[1]} (${f[0]}″) — Ø${f[2]}`]);
const fit=dn=>FIT.find(f=>String(f[1])===String(dn));
T({id:"fittings",cat:"q",sub:"Chizma va ma'lumot",ic:"table",name:"Fitinglar o'lchamlari",
 desc:"Payvandlanadigan fitinglar (ASME B16.9): tirsak, tройник, reduktor va zaglushkaning markazdan uchigacha o'lchami.",
 calc(){return tbl(["DN (dyuym)","Ø, mm","90° uzun","45° uzun","90° qisqa","Tройник","Reduktor","Zaglushka"],FIT.map(f=>[`DN${f[1]} (${f[0]}″)`,fmt(f[2],1),f[3],f[4],f[5],f[6],f[7],f[8]]))
  +note("90° va 45° — tirsak markazidan uchigacha (A, B). Tройник — markazdan uchigacha (C). Reduktor — umumiy uzunlik (H). Taxminiy natija — ishdan oldin fitingni o'lchab tekshiring.")}});

T({id:"single",cat:"q",sub:"Tirsak va offset",ic:"elbow",name:"Bitta tirsak (kesib burchak olish)",quick:0,
 desc:"Tayyor 90° tirsakdan kerakli burchakdagi tirsak kesib olish: tashqi, ichki va o'rta yoy bo'yicha belgilar, tirsak cheki.",
 fields:()=>[{k:"dn",l:"Quvur o'lchami",v:"100",opts:DNOPT,w:1},{k:"ty",l:"Tirsak turi",v:"lr",opts:[["lr","Uzun radius (1,5D)"],["sr","Qisqa radius (1D)"]]},{k:"a",l:"Kerakli burchak",u:"°",v:30}],
 calc(v){const f=fit(v.dn);const Rb=v.ty==="lr"?f[3]:(+f[5]||f[3]*2/3),R=f[2]/2,a=rad(v.a);
  return`<div class="res">${R_("Tirsak cheki (take-out)",fmt(Rb*Math.tan(a/2),1),"mm",1)}${R_("Tashqi yoy bo'yicha belgi",fmt((Rb+R)*a,1),"mm")}${R_("Ichki yoy bo'yicha belgi",fmt((Rb-R)*a,1),"mm")}${R_("O'rta chiziq bo'yicha",fmt(Rb*a,1),"mm")}${R_("Bukish radiusi",fmt(Rb,1),"mm")}</div>`
  +note("Tirsakning bir uchidan tashqi, ichki va yon tomonlarda yoy bo'ylab belgilarni qo'ying, ularni o'rab chiziq bilan tutashtirib kesing. Kesish chizig'i tirsak markaziga yo'nalgan bo'lishi kerak.")}});
const R_=R;

T({id:"teeelbow",cat:"q",sub:"Tirsak va offset",ic:"branch",name:"Tройник + tirsak",
 desc:"Tройникdan chiqib, tirsak bilan nuqtaga borish: ikki quvur bo'lagining kesish uzunligi.",
 fields:()=>[{k:"dn",l:"Quvur o'lchami",v:"50",opts:DNOPT,w:1},{k:"Y",l:"Asosiy quvurdan maqsadgacha (tik)",u:"mm",v:600},{k:"X",l:"Yonga siljish",u:"mm",v:300},{k:"a",l:"Tirsak burchagi",v:"45",opts:ANG},{k:"g",l:"Payvand tirqishi",u:"mm",v:2}],
 calc(v){const f=fit(v.dn);const a=rad(+v.a),C=f[6],A=f[3];const to=A*Math.tan(a/2);const h=v.Y-v.X/Math.tan(a);const L1=h-C-to-2*v.g,L2=v.X/Math.sin(a)-to-v.g;
  return`<div class="res">${R("1-bo'lak (tройникdan tirsakkacha)",fmt(L1,1),"mm",1)}${R("2-bo'lak (tirsakdan keyin, markazgacha)",fmt(L2,1),"mm",1)}${R("Tirsak markazi balandligi",fmt(h,1),"mm")}${R("Tройник C",fmt(C,0),"mm")}${R("Tirsak cheki",fmt(to,1),"mm")}</div>`
  +(L1<0?note("Balandlik yetarli emas — kichikroq burchak yoki kattaroq balandlik kerak.","warn"):"")+note("2-bo'lak uzunligi maqsad nuqtasigacha (u yerda boshqa fiting bo'lsa, uning chekini ham ayiring).")}});

T({id:"reducer",cat:"q",sub:"Belgilash va kesish",ic:"cone",name:"Reduktor yasash (konsentrik/eksentrik)",
 desc:"Listdan quvur reduktori (o'tish) yoyilmasi: markazi bir chiziqda yoki bir tomoni tekis (eksentrik). DXF bilan.",
 fields:()=>[{k:"D",l:"Katta diametr",u:"mm",v:219},{k:"d",l:"Kichik diametr",u:"mm",v:114},{k:"L",l:"Uzunlik",u:"mm",v:200},{k:"ty",l:"Turi",v:"c",opts:[["c","Konsentrik"],["e","Eksentrik (bir tomoni tekis)"]]},{k:"t",l:"Qalinlik",u:"mm",v:3},{k:"m",l:"O'lchamlar",v:"o",opts:DIMT}],
 calc(v){const R0=neu(v.D,v.t,v.m)/2,r0=neu(v.d,v.t,v.m)/2,e=v.ty==="e"?R0-r0:0,N=48;const P={},tr=[];
  for(let k=0;k<=N;k++){const f=PI+2*PI*k/N;P["B"+k]=[R0*Math.cos(f),R0*Math.sin(f),0];P["T"+k]=[e+r0*Math.cos(f),r0*Math.sin(f),v.L]}
  for(let k=0;k<N;k++){tr.push(["B"+k,"T"+k,"B"+(k+1)],["T"+k,"B"+(k+1),"T"+(k+1)])}
  const {pos}=unfold(P,tr);const bot=[],top=[];for(let k=0;k<=N;k++){bot.push(pos["B"+k]);top.push(pos["T"+k])}
  const sh={cut:[[[...bot,...top.reverse()],true]],bend:[0,6,12,18,24,30,36,42,48].map(k=>[pos["B"+k],pos["T"+k]])};const b=bbox(sh);
  return{html:`<div class="res">${R("List o'lchami (taxm.)",`${fmt0(b[2]-b[0])} × ${fmt0(b[3]-b[1])}`,"mm",1)}${R("Siljish (eksentrik)",fmt(e,1),"mm")}${R("Og'irlik (po'lat)",fmt(area(sh.cut[0][0])*v.t*7.85e-6,2),"kg")}</div><div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}${note("Chok katta tomonda joylashgan. Eksentrik reduktorda tekis tomon — chokka qarama-qarshi tomon.")}`,
   shape:sh,name:`reduktor_${v.D}x${v.d}`,mesh:trisMesh(P,tr,0)}}});

T({id:"elbranch",cat:"q",sub:"Belgilash va kesish",ic:"branch",name:"Tirsakka vrezka shabloni",
 desc:"Tirsakning tashqi yoki yon tomoniga quvur ulash uchun kesish shabloni (sonli hisob bilan).",
 fields:()=>[{k:"dn",l:"Tirsak o'lchami",v:"150",opts:DNOPT,w:1},{k:"d",l:"Tarmoq quvur diametri",u:"mm",v:60.3},{k:"pos",l:"Joyi",v:"o",opts:[["o","Tashqi tomon (yoy o'rtasi)"],["s","Yon tomon"]]},{k:"u",l:"Tirsak burchagidagi joyi",u:"°",v:45},{k:"n",l:"Bo'laklar",v:"16",opts:[["8","8"],["16","16"],["24","24"]]}],
 calc(v){const f=fit(v.dn),Rb=f[3],R0=f[2]/2,r=v.d/2,u0=rad(v.u);if(r>R0)return{html:note("Tarmoq quvur tirsakdan katta bo'lmasin.","warn")};
  const O=[Rb*Math.cos(u0),Rb*Math.sin(u0),0],rd=[Math.cos(u0),Math.sin(u0),0],tg=[-Math.sin(u0),Math.cos(u0),0],zz=[0,0,1];
  const ax=v.pos==="o"?rd:zz,e1=v.pos==="o"?zz:rd,e2=tg;
  const F=q=>{const rr=Math.hypot(q[0],q[1])-Rb;return rr*rr+q[2]*q[2]-R0*R0};
  const Q=(t,ph)=>[0,1,2].map(i=>O[i]+t*ax[i]+r*(Math.cos(ph)*e1[i]+Math.sin(ph)*e2[i]));
  const tOf=ph=>{let hi=R0*2+r,lo=hi;while(lo>-R0*2&&F(Q(lo,ph))>0)lo-=0.5;if(lo<=-R0*2)return NaN;for(let i=0;i<40;i++){const m=(lo+hi)/2;F(Q(m,ph))>0?hi=m:lo=m}return(lo+hi)/2};
  const M=144,ts=[];for(let i=0;i<=M;i++)ts.push(tOf(2*PI*i/M));if(ts.some(isNaN))return{html:note("Bu joyda quvur tirsakka to'liq tushmaydi — o'lchamni tekshiring.","warn")};
  const mn=Math.min(...ts),mx=Math.max(...ts),C=2*PI*r,top=mx-mn+40;const pts=ts.map((t,i)=>[r*2*PI*i/M,t-mn]);
  const sh={cut:[[[...pts,[C,top],[0,top]],true]],bend:[]};const N=+v.n,rows=[];for(let k=0;k<N;k++){const i=Math.round(k*M/N);rows.push([k+1,fmt(pts[i][0],1),fmt(pts[i][1],1)]);sh.bend.push([pts[i],[pts[i][0],top]])}
  const Mb={tris:[],cols:MC};const UA=rad(90);quadMesh([...Array(19)].map((_,i)=>{const uu=UA*i/18;const row=[];for(let j=0;j<=36;j++){const vv=2*PI*j/36;const rr=Rb+R0*Math.cos(vv);row.push([rr*Math.cos(uu),rr*Math.sin(uu),R0*Math.sin(vv)])}return row}),1,Mb);
  const Lb=mx+R0*1.2;quadMesh([0,1,2,3,4].map(s=>{const row=[];for(let i=0;i<=M;i+=4){const t=ts[i]+(Lb-ts[i])*s/4;row.push(Q(t,2*PI*i/M))}return row}),0,Mb);
  return{html:`<div class="res">${R("Shablon uzunligi",fmt(C,1),"mm",1)}${R("Egar chuqurligi",fmt(mx-mn,1),"mm")}${R("Tirsak radiusi",fmt(Rb,0),"mm")}</div><div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}${tbl(["№","Aylana bo'yicha, mm","Balandlik, mm"],rows)}`,shape:sh,name:`tirsak_vrezka_DN${v.dn}_${v.d}`,mesh:Mb}}});

T({id:"tubebend",cat:"q",sub:"Belgilash va kesish",ic:"bend",name:"Trubani bukish (trubagib)",
 desc:"Bir necha bukishli truba: kesish uzunligi va har bir bukish boshlanadigan belgi.",
 fields:()=>[{k:"L",l:"To'g'ri qismlar (kesishgan nuqtalar orasi, vergul bilan)",v:"300, 500, 300",t:"text",w:1},{k:"A",l:"Bukish burchaklari (vergul bilan)",v:"90, 90",t:"text",w:1},{k:"R",l:"Bukish radiusi (CLR)",u:"mm",v:60}],
 calc(v){const L=String(v.L).split(/[,;\s]+/).map(Number).filter(x=>x>0),A=String(v.A).split(/[,;\s]+/).map(Number).filter(x=>x>0);
  if(A.length!==L.length-1)return note("Burchaklar soni to'g'ri qismlardan bitta kam bo'lsin.","warn");
  const Tn=A.map(a=>v.R*Math.tan(rad(a)/2)),arc=A.map(a=>v.R*rad(a));let pos=0;const rows=[];
  for(let i=0;i<A.length;i++){const straight=L[i]-(i>0?Tn[i-1]:0)-Tn[i];pos+=straight;rows.push([i+1,fmt(A[i],0)+"°",fmt(pos,1),fmt(pos+arc[i],1)]);pos+=arc[i]}
  const last=L[L.length-1]-Tn[Tn.length-1];const total=pos+last;
  return`<div class="res">${R("Kesish uzunligi",fmt(total,1),"mm",1)}${R("Bukishlar soni",A.length)}${R("Tejalish (yig'indi)",fmt(L.reduce((s,x)=>s+x,0)-total,1),"mm")}</div>`+tbl(["Bukish","Burchak","Boshlanish belgisi, mm","Tugash, mm"],rows)+note("Belgilar truba boshidan o'lchanadi. Bukilgandan keyin truba biroz orqaga qaytadi (springback) — 1–3° ortiqcha buking.")}});

/* Flanetslar EN 1092-1 PN16: DN, D, K, boltlar soni, M, qalinlik (taxm.) */
const FLG=[[15,95,65,4,12,16],[20,105,75,4,12,18],[25,115,85,4,12,18],[32,140,100,4,16,18],[40,150,110,4,16,18],[50,165,125,4,16,18],[65,185,145,8,16,18],[80,200,160,8,16,20],[100,220,180,8,16,20],[125,250,210,8,16,22],[150,285,240,8,20,22],[200,340,295,12,20,24],[250,405,355,12,24,26],[300,460,410,12,24,28],[350,520,470,16,24,30],[400,580,525,16,27,32]];
const TQ={12:79,16:195,20:380,24:660,27:970},PITCH={12:1.75,16:2,20:2.5,24:3,27:3};
const ORDER=n=>{const o={4:[1,3,2,4],8:[1,5,3,7,2,6,4,8],12:[1,7,4,10,2,8,5,11,3,9,6,12],16:[1,9,5,13,3,11,7,15,2,10,6,14,4,12,8,16]};return o[n]||[...Array(n)].map((_,i)=>i+1)};
const pipeOD=dn=>{const f=FIT.find(x=>x[1]===dn);const g=PIPES.find(p=>p[0]===dn);return g?g[2]:f?f[2]:dn};
T({id:"flbolt",cat:"q",sub:"Flanetslar",ic:"gauge",name:"Flanets boltlari",
 desc:"PN16 flanets: boltlar soni va o'lchami, bolt uzunligi, tortish momenti va tartibi. Tekis flanets DXF (lazer uchun).",
 fields:()=>[{k:"dn",l:"Flanets DN",v:"100",opts:FLG.map(f=>[String(f[0]),"DN"+f[0]]),w:1},{k:"g",l:"Prokladka qalinligi",u:"mm",v:3},{k:"t",l:"Flanets qalinligi (0 — jadvaldan)",u:"mm",v:0}],
 calc(v){const f=FLG.find(x=>String(x[0])===String(v.dn));const [dn,D,K,n,M]=f;const t=v.t>0?v.t:f[5];const hole=M+(M>=27?3:2);
  const Lb=Math.ceil((2*t+v.g+0.8*M+3*PITCH[M])/5)*5;const od=pipeOD(dn);
  const sh={circ:[[0,0,D/2],[0,0,od/2+0.5],...[...Array(n)].map((_,i)=>{const a=2*PI*i/n+PI/n;return[K/2*Math.cos(a),K/2*Math.sin(a),hole/2]})]};
  return{html:`<div class="res">${R("Boltlar",`${n} × M${M}`,"",1)}${R("Bolt uzunligi (gayka bilan)",fmt0(Lb),"mm")}${R("Tortish momenti (8.8, moylangan)",`≈ ${fmt0(TQ[M]*0.7)}–${fmt0(TQ[M])}`,"N·m")}${R("Teshik diametri",fmt0(hole),"mm")}${R("Boltlar aylanasi K",fmt0(K),"mm")}${R("Tashqi diametr D",fmt0(D),"mm")}</div>
   <h3 class="sec">Tortish tartibi (yulduzcha)</h3><div class="card" style="font-size:18px;font-weight:700;letter-spacing:1px">${ORDER(n).join(" → ")}</div>
   <div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}${note("Boltlarni 3 bosqichda torting: 30% → 70% → 100%, har safar yulduzcha tartibida, oxirida aylana bo'yicha bir marta tekshiring. Moment prokladka turiga qarab o'zgaradi — prokladka ishlab chiqaruvchisi ko'rsatmasiga amal qiling.")}`,shape:sh,name:`flanets_PN16_DN${dn}`}}});

T({id:"flgasket",cat:"q",sub:"Flanetslar",ic:"cyl",name:"Flanets prokladkasi",
 desc:"PN16 flanets uchun prokladka o'lchamlari: ichki (boltlar ichida) yoki to'liq yuzali (teshikli). DXF — lazer yoki plotterda kesish uchun.",
 fields:()=>[{k:"dn",l:"Flanets DN",v:"100",opts:FLG.map(f=>[String(f[0]),"DN"+f[0]]),w:1},{k:"ty",l:"Turi",v:"i",opts:[["i","Boltlar ichida (IBC)"],["f","To'liq yuzali (teshikli)"]]}],
 calc(v){const f=FLG.find(x=>String(x[0])===String(v.dn));const [dn,D,K,n,M]=f;const hole=M+(M>=27?3:2);const id=pipeOD(dn)+1;const od=v.ty==="i"?K-hole:D;
  const sh={circ:[[0,0,od/2],[0,0,id/2]]};if(v.ty==="f")for(let i=0;i<n;i++){const a=2*PI*i/n+PI/n;sh.circ.push([K/2*Math.cos(a),K/2*Math.sin(a),hole/2])}
  return{html:`<div class="res">${R("Tashqi diametr",fmt0(od),"mm",1)}${R("Ichki diametr",fmt0(id),"mm")}${v.ty==="f"?R("Teshiklar",`${n} × Ø${hole}`)+R("Teshiklar aylanasi",fmt0(K),"mm"):""}</div><div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}`,shape:sh,name:`prokladka_DN${dn}_${v.ty}`}}});

T({id:"bank",cat:"q",sub:"Chizma va ma'lumot",ic:"offset",name:"Parallel quvurlar (pipe bank)",
 desc:"Bir nechta parallel quvur birga offset qilinganda har bir quvur offseti qancha oldin/keyin boshlanishi.",
 fields:()=>[{k:"n",l:"Quvurlar soni",v:4},{k:"S",l:"Quvurlar orasi (markazdan)",u:"mm",v:200},{k:"a",l:"Offset burchagi",v:"45",opts:ANG},{k:"H",l:"Offset (siljish)",u:"mm",v:500}],
 calc(v){const a=rad(+v.a),k=v.S*Math.tan(a/2),n=Math.max(1,Math.round(v.n));const rows=[];for(let i=0;i<n;i++)rows.push([i+1,fmt(i*k,1),fmt(v.H/Math.sin(a),1)]);
  return`<div class="res">${R("Har keyingi quvur siljishi",fmt(k,1),"mm",1)}${R("Qiya uzunlik (barchasida)",fmt(v.H/Math.sin(a),1),"mm")}</div>`+tbl(["Quvur","Boshlanishi siljiydi, mm","Qiya uzunlik, mm"],rows)+note("1-quvur — burilishning ichki tomonidagisi. Har bir keyingi quvurning offset boshlanishi va tugashi ko'rsatilgan masofaga suriladi, shunda quvurlar orasi bir xil qoladi.")}});

T({id:"jacket",cat:"q",sub:"Chizma va ma'lumot",ic:"cyl",name:"G'ilofli quvur (truba ichida truba)",
 desc:"Ichki quvur g'ilof (tashqi quvur) ichida: oraliq, markazlash tayanchi balandligi va oraliq hajmi.",
 fields:()=>[{k:"d",l:"Ichki quvur tashqi diametri",u:"mm",v:57},{k:"D",l:"G'ilof tashqi diametri",u:"mm",v:108},{k:"t",l:"G'ilof devori",u:"mm",v:4},{k:"L",l:"Uzunlik",u:"m",v:6}],
 calc(v){const Di=v.D-2*v.t,gap=(Di-v.d)/2;const A=PI*(Di*Di-v.d*v.d)/4/1e6;
  return`<div class="res">${R("Oraliq (har tomondan)",fmt(gap,1),"mm",1)}${R("Tayanch balandligi",fmt(gap-1,1),"mm")}${R("Oraliq hajmi 1 m",fmt(A*1000,2),"l/m")}${R("Jami oraliq hajmi",fmt(A*1000*v.L,1),"litr")}${R("Tayanchlar oralig'i (taxm.)",fmt0(Math.min(3000,Math.max(1000,v.d*25))),"mm")}</div>`
  +(gap<5?note("Oraliq juda kichik — suyuqlik yaxshi aylanmaydi.","warn"):"")+note("Markazlash tayanchlarini aylanaga 3–4 tadan (120° yoki 90°) payvandlang, tayanch balandligi oraliqdan 1 mm kam bo'lsin.")}});

/* ---- jurnallar (sinov, chok) ---- */
function makeLog(id,cat,sub,ic,name,desc,fields,csvName){
  T({id,cat,sub,ic,name,desc,custom:1,render(root){const key="log_"+id;const L=store.get(key,[]);const today=new Date().toISOString().slice(0,10);
    root.innerHTML=`<div class="card"><h4>Yangi yozuv</h4>${form(fields.map(f=>f.k==="sana"?{...f,v:today}:f),{})}<div class="btns"><button class="btn p" id="add">Qo'shish</button><button class="btn" id="csv">CSV yuklab olish</button></div></div>
     <h3 class="sec">Yozuvlar (${L.length})</h3>${L.length?L.map((r,i)=>`<div class="card"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(r[fields[0].k]||"")}</b><button class="btn" style="flex:none;min-width:0;padding:6px 12px" data-x="${i}">✕</button></div><div class="desc" style="margin:6px 0 0">${fields.slice(1).map(f=>`${esc(f.l)}: <b style="color:var(--tx)">${esc(r[f.k]??"")}</b>`).join(" · ")}</div></div>`).join(""):`<div class="empty">Hali yozuv yo'q</div>`}`;
    root.querySelector("#add").onclick=()=>{const v=readVals(root,fields.map(f=>({...f,t:"text"})));L.unshift(v);store.set(key,L);toast("Yozuv qo'shildi");this.render(root)};
    root.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{L.splice(+b.dataset.x,1);store.set(key,L);this.render(root)});
    root.querySelector("#csv").onclick=()=>{const q=s=>`"${String(s??"").replace(/"/g,'""')}"`;saveFile(csvName,"﻿"+[fields.map(f=>q(f.l)).join(";"),...L.map(r=>fields.map(f=>q(r[f.k])).join(";"))].join("\n"))}}});
}
makeLog("testlog","q","Sinov va hisob","table","Sinov jurnali","Gidravlik sinovlar qaydnomasi: liniya, bosim, vaqt, natija. Telefonda saqlanadi, CSV (Excel) qilib yuboriladi.",
 [{k:"liniya",l:"Liniya / obyekt",v:"",t:"text",w:1},{k:"sana",l:"Sana",v:"",t:"date"},{k:"bosim",l:"Sinov bosimi, bar",v:"",t:"text"},{k:"vaqt",l:"Ushlab turish, daqiqa",v:"30",t:"text"},{k:"natija",l:"Natija",v:"O'tdi",opts:[["O'tdi","O'tdi"],["O'tmadi","O'tmadi"]]},{k:"izoh",l:"Izoh",v:"",t:"text",w:1}],"sinov_jurnali.csv");
