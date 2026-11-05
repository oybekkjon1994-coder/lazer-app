/* ================= YOYILMA (list metall) ================= */
const DIMT=[["o","Tashqi o'lchamlar"],["i","Ichki o'lchamlar"],["m","O'rta chiziq bo'yicha"]];
const neu=(x,t,m)=>m==="o"?x-t:m==="i"?x+t:x;
const arcPts=(R,a0,a1,n)=>{const p=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push([R*Math.cos(a),R*Math.sin(a)])}return p};

T({id:"cone",cat:"y",ic:"cone",name:"Konus yoyilmasi",quick:1,
 desc:"To'liq yoki kesik konus (voronka, truba o'tish) uchun list yoyilmasi. DXF chiqarib lazerda kesish mumkin.",
 fields:()=>[{k:"D",l:"Katta diametr",u:"mm",v:600},{k:"d",l:"Kichik diametr (0 — o'tkir uch)",u:"mm",v:200},{k:"H",l:"Balandlik",u:"mm",v:400},{k:"t",l:"List qalinligi",u:"mm",v:2},
  {k:"m",l:"O'lchamlar",v:"o",opts:DIMT},{k:"n",l:"Nechta bo'lakdan",v:"1",opts:[["1","1 bo'lak"],["2","2 bo'lak"],["3","3 bo'lak"],["4","4 bo'lak"]]}],
 calc(v){const D=neu(v.D,v.t,v.m),d=v.d>0?neu(v.d,v.t,v.m):0,n=+v.n;
  if(d>=D)return{html:note("Kichik diametr kattasidan kichik bo'lsin (silindr uchun «Silindr yoyilmasi»dan foydalaning).","warn")};
  const L=Math.hypot(v.H,(D-d)/2),R1=L*D/(D-d),R2=R1*d/D,th=2*PI*(D/2)/R1/n;
  const seg=Math.max(24,Math.round(deg(th)));const a0=PI/2-th/2,a1=PI/2+th/2;
  const outer=arcPts(R1,a0,a1,seg),inner=R2>0?arcPts(R2,a1,a0,seg):[[0,0]];
  const bend=[];const nb=12;for(let i=1;i<nb;i++){const a=a0+(a1-a0)*i/nb;bend.push([[R2*Math.cos(a),R2*Math.sin(a)],[R1*Math.cos(a),R1*Math.sin(a)]])}
  const sh={cut:[[[...outer,...inner],true]],bend};const b=bbox(sh);
  const html=`<div class="res">${R("Yoyilma burchagi (har bo'lak)",fmt(deg(th),2),"°",1)}${R("Katta radius R",fmt(R1),"mm")}${R("Kichik radius r",fmt(R2),"mm")}${R("Yasovchi uzunligi",fmt(L),"mm")}${R("Vatar (katta yoy)",fmt(2*R1*Math.sin(th/2)),"mm")}${R("List o'lchami",`${fmt0(b[2]-b[0])}×${fmt0(b[3]-b[1])}`,"mm")}</div>
   <div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}
   ${note("Ko'k chiziqlar — press yoki valikda bukish uchun belgilar. Tutashuv chokini hisobga olmagan holda chizilgan; kerak bo'lsa bir tomoniga zaxira qo'shing.")}`;
  const M={tris:[],cols:MC};revMesh([[v.D/2,0],[Math.max(v.d,0.01)/2,v.H]],0,M);
  return{html,shape:sh,name:`konus_${v.D}_${v.d}_${v.H}`,mesh:M}}});

T({id:"cyl",cat:"y",ic:"cyl",name:"Silindr / quvur yoyilmasi",
 desc:"Listdan quvur, bak yoki silindr yasash uchun list o'lchami.",
 fields:()=>[{k:"D",l:"Diametr",u:"mm",v:300},{k:"H",l:"Balandlik",u:"mm",v:500},{k:"t",l:"Qalinlik",u:"mm",v:2},{k:"m",l:"O'lchamlar",v:"o",opts:DIMT}],
 calc(v){const D=neu(v.D,v.t,v.m),C=PI*D;const sh={cut:[[[[0,0],[C,0],[C,v.H],[0,v.H]],true]],bend:[1,2,3,4,5,6,7].map(i=>[[C*i/8,0],[C*i/8,v.H]])};
  return{html:`<div class="res">${R("List uzunligi",fmt(C),"mm",1)}${R("List eni",fmt(v.H),"mm")}${R("O'rta diametr",fmt(D),"mm")}${R("Og'irligi (po'lat)",fmt(C*v.H*v.t*7.85e-6,2),"kg")}</div><div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}`,shape:sh,name:`silindr_${v.D}x${v.H}`,mesh:(()=>{const M={tris:[],cols:MC};revMesh([[v.D/2,0],[v.D/2,v.H]],0,M);return M})()}}});

T({id:"sq2r",cat:"y",ic:"sq2r",name:"Kvadratdan doiraga o'tish",quick:1,
 desc:"To'rtburchak teshikdan dumaloq trubaga o'tish (perexod) yoyilmasi — ventilyatsiya, bunker, mo'ri uchun. Bitta list, chok tomon o'rtasida.",
 fields:()=>[{k:"A",l:"To'rtburchak eni A",u:"mm",v:400},{k:"B",l:"To'rtburchak bo'yi B",u:"mm",v:300},{k:"d",l:"Doira diametri",u:"mm",v:200},{k:"H",l:"Balandlik",u:"mm",v:250},
  {k:"ex",l:"Doira siljishi X",u:"mm",v:0},{k:"ey",l:"Doira siljishi Y",u:"mm",v:0},{k:"t",l:"Qalinlik",u:"mm",v:1},{k:"m",l:"O'lchamlar",v:"o",opts:DIMT},{k:"q",l:"Aniqlik (chorakda bo'lak)",v:"6",opts:[["3","3"],["4","4"],["6","6"],["8","8"]]}],
 calc(v){const A=neu(v.A,v.t,v.m),B=neu(v.B,v.t,v.m),r=neu(v.d,v.t,v.m)/2,m=+v.q,N=4*m;
  if(r*2>=Math.min(A,B)+1e-9&&v.H<=0)return{html:note("O'lchamlarni tekshiring.","warn")};
  const P={M:[0,-B/2,0],M2:[0,-B/2,0],C1:[A/2,-B/2,0],C2:[A/2,B/2,0],C3:[-A/2,B/2,0],C4:[-A/2,-B/2,0]};
  for(let k=0;k<=N;k++){const f=rad(270)+2*PI*k/N;P["T"+k]=[v.ex+r*Math.cos(f),v.ey+r*Math.sin(f),v.H]}
  const tr=[["M","T0","C1"]];const C=["C1","C2","C3","C4"];
  for(let q=0;q<4;q++){for(let k=q*m;k<(q+1)*m;k++)tr.push([C[q],"T"+k,"T"+(k+1)]);tr.push(q<3?[C[q],"T"+((q+1)*m),C[q+1]]:[C[3],"T"+N,"M2"])}
  const {pos}=unfold(P,tr);
  const bot=["M","C1","C2","C3","C4","M2"].map(x=>pos[x]),top=[];for(let k=0;k<=N;k++)top.push(pos["T"+k]);
  const bend=[];for(let q=0;q<4;q++)for(let k=q*m;k<=(q+1)*m;k++)bend.push([pos[C[q]],pos["T"+k]]);
  const sh={cut:[[[...bot,...top.reverse()],true]],bend};const b=bbox(sh);
  const html=`<div class="res">${R("List o'lchami (taxm.)",`${fmt0(b[2]-b[0])} × ${fmt0(b[3]-b[1])}`,"mm",1)}${R("Chok uzunligi",fmt(Math.hypot(P.T0[0],P.T0[1]+B/2,v.H)),"mm")}${R("Og'irlik (po'lat, taxm.)",fmt(area(sh.cut[0][0])*v.t*7.85e-6,2),"kg")}</div>
   <div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}
   ${note("Ko'k chiziqlar — burchaklardan doiraga boruvchi bukish chiziqlari. Burchaklar keskin, doira tomonida silliq bukiladi. Chok to'rtburchakning A tomoni o'rtasida.")}`;
  return{html,shape:sh,name:`perexod_${v.A}x${v.B}_d${v.d}`,mesh:trisMesh(P,tr,0)}}});
function area(p){let s=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];s+=a[0]*b[1]-b[0]*a[1]}return Math.abs(s/2)}

T({id:"hopper",cat:"y",ic:"hopper",name:"Bunker / voronka (to'rtburchak)",
 desc:"Yuqorisi katta, pasti kichik to'rtburchak voronka (bunker, zont, kolpak) yoyilmasi. Pastki teshikni siljitish mumkin.",
 fields:()=>[{k:"A",l:"Yuqori eni A",u:"mm",v:800},{k:"B",l:"Yuqori bo'yi B",u:"mm",v:600},{k:"a",l:"Pastki eni a",u:"mm",v:200},{k:"b",l:"Pastki bo'yi b",u:"mm",v:200},
  {k:"H",l:"Balandlik",u:"mm",v:500},{k:"ex",l:"Pastki siljish X",u:"mm",v:0},{k:"ey",l:"Pastki siljish Y",u:"mm",v:0},{k:"t",l:"Qalinlik",u:"mm",v:2},{k:"m",l:"O'lchamlar",v:"o",opts:DIMT}],
 calc(v){const A=neu(v.A,v.t,v.m),B=neu(v.B,v.t,v.m),a=neu(v.a,v.t,v.m),b=neu(v.b,v.t,v.m);
  const sg=[[-1,-1],[1,-1],[1,1],[-1,1]];const P={};
  sg.forEach((s,i)=>{P["b"+(i+1)]=[v.ex+s[0]*a/2,v.ey+s[1]*b/2,0];P["t"+(i+1)]=[s[0]*A/2,s[1]*B/2,v.H]});P.B1=P.b1;P.T1=P.t1;
  const tr=[["b1","t1","b2"],["t1","b2","t2"],["b2","t2","b3"],["t2","b3","t3"],["b3","t3","b4"],["t3","b4","t4"],["b4","t4","B1"],["t4","B1","T1"]];
  const {pos}=unfold(P,tr);
  const sh={cut:[[[...["b1","b2","b3","b4","B1"].map(x=>pos[x]),...["T1","t4","t3","t2","t1"].map(x=>pos[x])],true]],bend:[["b2","t2"],["b3","t3"],["b4","t4"]].map(([x,y])=>[pos[x],pos[y]])};
  const bb=bbox(sh);const slope=deg(Math.atan2(v.H,(A-a)/2));
  return{html:`<div class="res">${R("List o'lchami (taxm.)",`${fmt0(bb[2]-bb[0])} × ${fmt0(bb[3]-bb[1])}`,"mm",1)}${R("Devor qiyaligi (A tomon)",fmt(slope,1),"°")}${R("Og'irlik (po'lat, taxm.)",fmt(area(sh.cut[0][0])*v.t*7.85e-6,2),"kg")}</div>
   <div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}${note("Bitta listdan, chok bir burchakda. Katta bunkerlarni 2 yoki 4 bo'lakdan yasash uchun yoyilmani bukish chiziqlari bo'yicha bo'ling.")}`,shape:sh,name:`bunker_${v.A}x${v.B}_${v.a}x${v.b}`,mesh:trisMesh(P,tr,0)}}});

const kDIN=(r,t)=>Math.min(0.5,Math.max(0.25,(0.65+0.5*Math.log10(Math.max(r/t,0.1)))/2));
T({id:"bend",cat:"y",ic:"bend",name:"List bukish (razvertka)",quick:1,
 desc:"Bukiladigan detalning yoyilgan (kesish) uzunligi va bukish chiziqlari joyi. Tashqi o'lchamlar bo'yicha.",
 fields:()=>[{k:"f",l:"Tomonlar (tashqi o'lchamlar, vergul bilan)",v:"50, 100, 50",t:"text",w:1},{k:"a",l:"Bukish burchagi",u:"°",v:90},{k:"t",l:"Qalinlik",u:"mm",v:2},{k:"r",l:"Ichki radius",u:"mm",v:2},{k:"K",l:"K-faktor (0 — avtomatik)",v:0},{k:"W",l:"Detal eni (DXF uchun)",u:"mm",v:200}],
 calc(v){const F=String(v.f).split(/[,;\s]+/).map(x=>parseFloat(x.replace(",","."))).filter(x=>x>0);if(F.length<2)return{html:note("Kamida 2 ta tomon yozing, masalan: 50, 100, 50","warn")};
  const K=v.K>0?v.K:kDIN(v.r,v.t),a=rad(v.a),BA=a*(v.r+K*v.t),OS=Math.tan(a/2)*(v.r+v.t),BD=2*OS-BA,n=F.length-1,flat=F.reduce((s,x)=>s+x,0)-n*BD;
  const lines=[];let x=0;for(let i=0;i<n;i++){x+=F[i]-(i===0?OS:2*OS)+(i===0?0:BA);lines.push(x+BA/2)}
  // aniq: har bir tekis qism uzunligi
  const flats=F.map((L,i)=>L-(i>0?OS:0)-(i<n?OS:0));let cx=0;const marks=[];for(let i=0;i<n;i++){cx+=flats[i];marks.push(cx+BA/2);cx+=BA}
  const sh={cut:[[[[0,0],[flat,0],[flat,v.W],[0,v.W]],true]],bend:marks.map(m=>[[m,0],[m,v.W]])};
  const V=v.t<=3?8*v.t:10*v.t;
  return{html:`<div class="res">${R("Yoyilgan uzunlik (kesish)",fmt(flat,2),"mm",1)}${R("Bukish chegirmasi (BA)",fmt(BA,2),"mm")}${R("Bukish ayirmasi (BD)",fmt(BD,2),"mm")}${R("K-faktor",fmt(K,3))}${R("Matritsa (V) tavsiya",fmt0(V),"mm")}${R("Bukishlar soni",n)}</div>
   <h3 class="sec">Bukish chiziqlari (chapdan)</h3>${tbl(["№","Chiziq markazi, mm","Tekis qism, mm"],marks.map((m,i)=>[i+1,fmt(m,2),fmt(flats[i],2)]))}
   <div class="svgbox">${svgOf(sh)}</div>${shapeButtons()}
   ${note("K-faktor avtomatik DIN 6935 bo'yicha hisoblanadi. Aniq natija uchun bir marta sinov detali bukib, o'lchab, K-faktorni moslang. Matritsa V ≈ 8×qalinlik (3 mm gacha), ichki radius taxminan V/6 bo'ladi.")}`,shape:sh,name:`bukish_${F.join("-")}_t${v.t}`}}});

T({id:"bump",cat:"y",ic:"bump",name:"Bosqichli bukish (bump)",
 desc:"Katta radiusni pressda ko'p marta oz-ozdan bukib olish: har bukish orasidagi masofa va burchak.",
 fields:()=>[{k:"R",l:"Ichki radius",u:"mm",v:300},{k:"a",l:"Umumiy burchak",u:"°",v:90},{k:"t",l:"Qalinlik",u:"mm",v:3},{k:"n",l:"Bukishlar soni",v:15},{k:"K",l:"K-faktor",v:0.45}],
 calc(v){const n=Math.max(2,Math.round(v.n));const arc=rad(v.a)*(v.R+v.K*v.t),step=arc/n,each=v.a/n;
  const rows=[];for(let i=0;i<n;i++)rows.push([i+1,fmt(step/2+i*step,1)]);
  return`<div class="res">${R("Bukishlar oralig'i",fmt(step,2),"mm",1)}${R("Har bukish burchagi",fmt(each,2),"°")}${R("Yoy uzunligi (yoyilma)",fmt(arc,1),"mm")}${R("Tashqi yoy",fmt(rad(v.a)*(v.R+v.t),1),"mm")}</div>
  ${tbl(["№","Yoy boshidan, mm"],rows)}`+note("Bukishlarni bir xil oraliqda belgilab, har birini bir xil burchakka bosing. Bukishlar ko'p bo'lsa, sirt silliqroq chiqadi.")}});

T({id:"mitre",cat:"y",ic:"mitre",name:"Burchak kesish (profil)",quick:1,
 desc:"Profil truba, ugolok yoki reykani burchak ostida ulash uchun kesish burchagi va uzunlik farqi.",
 modes:[["a","Burchak bo'yicha"],["n","Ko'pburchak ramka"]],
 fields:m=>[m==="n"?{k:"N",l:"Tomonlar soni",v:6}:{k:"A",l:"Detallar orasidagi burchak",u:"°",v:90},{k:"w",l:"Profil eni (ko'rinadigan tomon)",u:"mm",v:40},{k:"L",l:"Tashqi uzunlik",u:"mm",v:1000}],
 calc(v,m){const beta=m==="n"?180-360/Math.max(3,v.N):v.A;const cut=(180-beta)/2;const dL=2*v.w*Math.tan(rad(cut));
  return`<div class="res">${R("Kesish burchagi (arra)",fmt(cut,2),"°",1)}${R("Tutashish burchagi",fmt(beta,1),"°")}${R("Ichki uzunlik",fmt(v.L-dL,1),"mm")}${R("Tashqi-ichki farqi",fmt(dL,1),"mm")}${R("Kesik chizig'i uzunligi",fmt(v.w/Math.cos(rad(cut)),1),"mm")}</div>`
  +note("Arra burchagi to'g'ri (90°) kesishdan hisoblanadi: to'g'ri burchakli ramka uchun 45°. Ikkala detal ham bir xil burchakda kesiladi.")}});

function packBars(parts,stock,kerf){const bars=[];[...parts].sort((a,b)=>b-a).forEach(p=>{const b=bars.find(b=>b.left>=p+kerf);if(b){b.left-=p+kerf;b.p.push(p)}else bars.push({left:stock-p-kerf,p:[p]})});return bars}
T({id:"frame",cat:"y",ic:"frame",name:"Ramka (kesish ro'yxati)",
 desc:"Profil trubadan ramka: detallar uzunligi, nechta 6 metrlik truba kerak, og'irligi.",
 fields:()=>[{k:"W",l:"Ramka eni (tashqi)",u:"mm",v:2000},{k:"H",l:"Ramka bo'yi (tashqi)",u:"mm",v:1000},{k:"pa",l:"Profil eni",u:"mm",v:40},{k:"pb",l:"Profil bo'yi",u:"mm",v:20},{k:"pt",l:"Profil qalinligi",u:"mm",v:2},
  {k:"j",l:"Ulanish",v:"45",opts:[["45","45° burchak kesish"],["s","To'g'ri (yonlari ichida)"]]},{k:"x",l:"O'rtadagi ustunlar soni",v:1},{k:"q",l:"Ramkalar soni",v:1},{k:"S",l:"Truba uzunligi",u:"mm",v:6000},{k:"pr",l:"1 metr narxi",u:"so'm",v:25000}],
 calc(v){const w=v.pa,q=Math.max(1,Math.round(v.q)),x=Math.max(0,Math.round(v.x));let parts=[];
  if(v.j==="45")parts.push(["Yuqori/past (45°)",v.W,2],["Yon (45°)",v.H,2]);else parts.push(["Yuqori/past",v.W,2],["Yon (ichida)",v.H-2*w,2]);
  if(x)parts.push(["O'rta ustun",v.H-2*w,x]);
  const all=[];parts.forEach(p=>{for(let i=0;i<p[2]*q;i++)all.push(p[1])});const bars=packBars(all,v.S,3);const tot=all.reduce((s,a)=>s+a,0)/1000;
  const kgm=(2*(v.pa+v.pb)-4*v.pt)*v.pt*0.00785;
  const sh={cut:[[[[0,0],[v.W,0],[v.W,v.H],[0,v.H]],true],[[[w,w],[v.W-w,w],[v.W-w,v.H-w],[w,v.H-w]],true]],bend:[]};
  for(let i=1;i<=x;i++){const cx=v.W*i/(x+1);sh.cut.push([[[cx-w/2,w],[cx+w/2,w],[cx+w/2,v.H-w],[cx-w/2,v.H-w]],true])}
  return`<div class="res">${R("Kerakli trubalar",bars.length,`dona × ${fmt0(v.S/1000)} m`,1)}${R("Jami profil",fmt(tot,2),"m")}${R("Og'irlik",fmt(tot*kgm,1),"kg")}${R("Narx (trubalar)",fmt0(bars.length*v.S/1000*v.pr),"so'm")}</div>
  <h3 class="sec">Kesish ro'yxati</h3>${tbl(["Detal","Uzunlik, mm","Soni"],parts.map(p=>[p[0],fmt(p[1],0),p[2]*q]))}
  <h3 class="sec">Trubalarga joylash</h3>${tbl(["Truba","Detallar","Qoldiq, mm"],bars.map((b,i)=>[i+1,b.p.map(fmt0).join(" + "),fmt0(b.left)]))}
  <div class="svgbox">${svgOf(sh)}</div>`+note("Har kesimga 3 mm arra izi hisobga olingan.")}});

T({id:"laser",cat:"y",ic:"laser",name:"Lazer kesish narxi",
 desc:"Kesish uzunligi va teshiklar soni bo'yicha taxminiy narx.",
 fields:()=>[{k:"L",l:"Kesish uzunligi",u:"m",v:12},{k:"p",l:"Teshiklar (pirsing) soni",v:40},{k:"q",l:"Detallar soni",v:10},{k:"pm",l:"1 metr kesish narxi",u:"so'm",v:6000},{k:"pp",l:"1 pirsing narxi",u:"so'm",v:300},{k:"mt",l:"Metall narxi (ixtiyoriy)",u:"so'm",v:0}],
 calc(v){const one=v.L*v.pm+v.p*v.pp;const tot=one*v.q+v.mt;
  return`<div class="res">${R("Jami narx",fmt0(tot),"so'm",1)}${R("Bitta detal kesish",fmt0(one),"so'm")}${R("Jami kesish uzunligi",fmt(v.L*v.q,1),"m")}</div>`+note("Kesish uzunligini DXF fayldan aniq olish uchun «Lazer» ilovasidan foydalaning.")}});

T({id:"mypat",cat:"y",ic:"folder",name:"Mening yoyilmalarim",custom:1,
 desc:"Saqlab qo'yilgan yoyilma va shablonlar. DXF qilib qayta yuklab olishingiz mumkin.",
 render(root){const L=store.get("pat",[]);
  if(!L.length){root.innerHTML=`<div class="empty">Hali hech narsa saqlanmagan.<br>Yoyilma hisoblab, «Saqlab qo'yish» tugmasini bosing.</div>`;return}
  root.innerHTML=L.map((p,i)=>`<div class="card"><h4>${esc(p.name)}</h4><div class="desc">${new Date(p.at).toLocaleString("uz-UZ")}</div><div class="svgbox">${svgOf(p.sh)}</div><div class="btns"><button class="btn p" data-i="${i}" data-a="d">DXF</button><button class="btn" data-i="${i}" data-a="x">O'chirish</button></div></div>`).join("");
  root.querySelectorAll("button[data-i]").forEach(b=>b.onclick=()=>{const i=+b.dataset.i,p=L[i];if(b.dataset.a==="d")saveFile(p.name.replace(/[^\w\-]+/g,"_")+".dxf",dxf(p.sh));else{L.splice(i,1);store.set("pat",L);this.render(root)}})}});
