/* ================= QUVUR ================= */
const ANG=[["45","45°"],["30","30°"],["60","60°"],["22.5","22,5°"],["11.25","11,25°"],["90","90°"]];
const ELB=[["lr","Uzun radius tirsak (1,5D)"],["sr","Qisqa radius tirsak (1D)"],["none","Tirsaksiz (to'g'ridan kesish)"]];
T({id:"offset",cat:"q",ic:"offset",name:"Offset (siljitish)",quick:1,
 desc:"Quvurni to'siqdan aylantirib o'tkazish: qiya qism uzunligi, yurish va kesiladigan quvur uzunligi. Aylanma rejimida bir vaqtda ham tik, ham yonga siljish hisoblanadi.",
 modes:[["s","Oddiy offset"],["r","Aylanma (rolling)"]],
 fields:m=>[
  ...(m==="r"?[{k:"V",l:"Tik siljish",u:"mm",v:300},{k:"H",l:"Yonga siljish",u:"mm",v:400}]:[{k:"H",l:"Siljish (offset)",u:"mm",v:300,w:1}]),
  {k:"a",l:"Tirsak burchagi",v:"45",opts:ANG},{k:"D",l:"Quvur tashqi diametri",u:"mm",v:57},
  {k:"e",l:"Tirsak turi",v:"lr",opts:ELB,w:1},{k:"g",l:"Payvand tirqishi (har chokda)",u:"mm",v:2}],
 calc(v,m){
  const a=rad(+v.a);const off=m==="r"?Math.hypot(v.V,v.H):v.H;
  const travel=off/Math.sin(a),run=off/Math.tan(a);
  const Rb=v.e==="lr"?1.5*v.D:v.e==="sr"?1.0*v.D:0;const to=Rb*Math.tan(a/2);
  const cut=travel-2*to-2*v.g;
  let h=`<div class="res">${R("Kesiladigan quvur uzunligi",fmt(cut),"mm",1)}${R("Qiya uzunlik (markazdan)",fmt(travel),"mm")}${R("Yurish (run)",fmt(run),"mm")}${R("Koeffitsient (1/sin)",fmt(1/Math.sin(a),3))}${R("Tirsak cheki (take-out)",fmt(to),"mm")}`;
  if(m==="r")h+=R("Haqiqiy siljish",fmt(off),"mm")+R("Aylantirish burchagi",fmt(deg(Math.atan2(v.V,v.H)),1),"°");
  h+="</div>";
  if(cut<0)h+=note("Siljish juda kichik: ikki tirsak bir-biriga tegib qoladi. Kichikroq burchak tanlang.","warn");
  h+=note("Qiya uzunlik — tirsak markazlari orasidagi masofa. Kesiladigan uzunlik = qiya uzunlik − 2 × tirsak cheki − payvand tirqishlari."+(m==="r"?" Aylanma offsetda quvurni ko'rsatilgan burchakka buring.":""));
  return h}});

T({id:"branch",cat:"q",ic:"branch",name:"Tarmoq shabloni (vrezka)",quick:1,
 desc:"Bir quvurni ikkinchisiga payvandlash uchun kesish shabloni (egar). Shablonni qog'ozga yoki listga chiqarib, quvurga o'rab chizasiz. Asosiy quvurdagi teshik shabloni ham chiqadi.",
 fields:()=>[{k:"D",l:"Asosiy quvur diametri",u:"mm",v:108},{k:"d",l:"Tarmoq quvur diametri",u:"mm",v:57},
  {k:"a",l:"Ulanish burchagi",u:"°",v:90},{k:"e",l:"Markazdan siljish",u:"mm",v:0},
  {k:"n",l:"Bo'laklar soni",v:"16",opts:[["8","8"],["12","12"],["16","16"],["24","24"],["32","32"]]},{k:"L",l:"Shablon balandligi zaxira",u:"mm",v:40}],
 calc(v){
  const R0=v.D/2,r=v.d/2,a=rad(v.a);
  if(r+Math.abs(v.e)>R0+1e-9)return{html:note("Tarmoq quvur (siljish bilan) asosiy quvurdan katta bo'lishi mumkin emas.","warn")};
  if(v.a<15||v.a>165)return{html:note("Burchak 15° dan 165° gacha bo'lsin.","warn")};
  const t=f=>{const y=r*Math.sin(f)+v.e;return(Math.sqrt(R0*R0-y*y)-r*Math.cos(f)*Math.cos(a))/Math.sin(a)};
  const M=180,pts=[];let mn=1e9,mx=-1e9;for(let i=0;i<=M;i++){const f=2*PI*i/M;const z=t(f);mn=Math.min(mn,z);mx=Math.max(mx,z)}
  for(let i=0;i<=M;i++){const f=2*PI*i/M;pts.push([r*f,t(f)-mn])}
  const H=mx-mn,top=H+v.L,C=2*PI*r;
  const shape={cut:[[[...pts,[C,top],[0,top]],true]],bend:[],text:[]};
  const N=+v.n;const rows=[];for(let k=0;k<N;k++){const f=2*PI*k/N;const x=r*f;rows.push([k+1,fmt0(deg(f)),fmt(x,1),fmt(t(f)-mn,1)]);shape.bend.push([[x,t(f)-mn],[x,top]])}
  // asosiy quvurdagi teshik
  const hole=[];for(let i=0;i<=M;i++){const f=2*PI*i/M;const y=r*Math.sin(f)+v.e;const tt=t(f);const zz=tt*Math.sin(a)+r*Math.cos(f)*Math.cos(a);
    const x=tt*Math.cos(a)-r*Math.cos(f)*Math.sin(a);hole.push([x,R0*Math.asin(Math.max(-1,Math.min(1,y/R0)))])}
  const hs={cut:[[hole,true]]};
  const html=`<div class="res">${R("Shablon uzunligi (aylana)",fmt(C),"mm",1)}${R("Egar chuqurligi",fmt(H),"mm")}${R("Bo'lak oralig'i",fmt(C/N),"mm")}</div>
   <h3 class="sec">Tarmoq quvur shabloni</h3><div class="svgbox">${svgOf(shape)}</div>${shapeButtons()}
   <h3 class="sec">O'lchamlar jadvali</h3>${tbl(["№","Burchak °","Aylana bo'yicha, mm","Balandlik, mm"],rows)}
   <h3 class="sec">Asosiy quvurdagi teshik</h3><div class="svgbox" id="hs">${svgOf(hs)}</div><div class="btns"><button class="btn" id="hdxf">Teshik DXF</button></div>
   ${note("Shablonni 1:1 masshtabda chiqaring (DXF — lazerda yupqa listdan kesish yoki printerda chop etish uchun). Shablon tarmoq quvurning tashqi yuzasiga o'raladi; balandlik 0 bo'lgan nuqta egarning eng chuqur joyi.")}`;
  const Mb={tris:[],cols:MC};const Lh=Math.max(v.D,v.d)*1.4+Math.abs(v.e)+r/Math.tan(Math.max(a,0.3));
  quadMesh([...Array(25)].map((_,i)=>{const x=-Lh+2*Lh*i/24;const row=[];for(let j=0;j<=48;j++){const q=2*PI*j/48;row.push([x,R0*Math.sin(q),R0*Math.cos(q)])}return row}),1,Mb);
  const Lb=Math.max(v.D,v.d)*1.2+mx;const u=[Math.cos(a),0,Math.sin(a)],ww=[-Math.sin(a),0,Math.cos(a)];
  quadMesh([0,1,2,3,4,5,6].map(i=>{const row=[];for(let j=0;j<=48;j++){const f=2*PI*j/48;const tt=t(f)+(Lb-t(f))*i/6;row.push([tt*u[0]+r*Math.cos(f)*ww[0],r*Math.sin(f)+v.e,tt*u[2]+r*Math.cos(f)*ww[2]])}return row}),0,Mb);
  return{html,shape,name:`tarmoq_${v.D}x${v.d}_${v.a}gr`,mesh:Mb,after:root=>{root.querySelector("#hdxf").onclick=()=>saveFile(`teshik_${v.D}x${v.d}.dxf`,dxf(hs))}}}});

T({id:"miter",cat:"q",ic:"elbow",name:"Segmentli tirsak (kesib yasash)",
 desc:"Quvurni bo'laklarga qiya kesib tirsak yasash: har bo'lakning uzunligi va kesish shabloni.",
 fields:()=>[{k:"D",l:"Quvur tashqi diametri",u:"mm",v:159},{k:"A",l:"Tirsak burchagi",u:"°",v:90},
  {k:"n",l:"Bo'laklar soni (uchlari bilan)",v:"4",opts:[["2","2 (bitta kesim)"],["3","3"],["4","4"],["5","5"],["6","6"]]},{k:"Rb",l:"Bukish radiusi (markaz)",u:"mm",v:240},{k:"s",l:"Uchidagi to'g'ri qism",u:"mm",v:50}],
 calc(v){
  const n=+v.n,r=v.D/2,al=rad(v.A)/(2*(n-1));const Rb=n===2?0:v.Rb;
  if(n>2&&Rb<r)return{html:note("Bukish radiusi quvur radiusidan katta bo'lsin.","warn")};
  const mid=2*Rb*Math.tan(al),back=2*(Rb+r)*Math.tan(al),thr=2*(Rb-r)*Math.tan(al);
  const endC=Rb*Math.tan(al)+v.s;
  // o'rta bo'lak shabloni: ikki tomoni qiya
  const M=180,C=2*PI*r,up=[],dn=[];for(let i=0;i<=M;i++){const f=2*PI*i/M;const L=(Rb+r*Math.cos(f))*Math.tan(al);up.push([r*f,L]);dn.push([r*f,-L])}
  const shapeMid={cut:[[[...up,...dn.reverse()],true]]};
  const endP=[];for(let i=0;i<=M;i++){const f=2*PI*i/M;endP.push([r*f,v.s+(Rb+r*Math.cos(f))*Math.tan(al)])}
  const shapeEnd={cut:[[[...endP,[C,0],[0,0]],true]]};
  const N=16,rows=[];for(let k=0;k<N;k++){const f=2*PI*k/N;rows.push([k+1,fmt(r*f,1),fmt((Rb+r*Math.cos(f))*Math.tan(al),1)])}
  const html=`<div class="res">${R("Kesish burchagi",fmt(deg(al),2),"°",1)}${n>2?R("O'rta bo'lak (markaz)",fmt(mid),"mm")+R("O'rta bo'lak tashqi tomoni",fmt(back),"mm")+R("O'rta bo'lak ichki tomoni",fmt(thr),"mm"):""}${R("Uchidagi bo'lak (markaz)",fmt(endC),"mm")}${R("O'rta bo'laklar soni",n-2)}</div>
   ${n>2?`<h3 class="sec">O'rta bo'lak shabloni</h3><div class="svgbox">${svgOf(shapeMid)}</div><div class="btns"><button class="btn p" id="m1">O'rta bo'lak DXF</button></div>`:""}
   <h3 class="sec">Uchidagi bo'lak shabloni</h3><div class="svgbox">${svgOf(shapeEnd)}</div><div class="btns"><button class="btn p" id="m2">Uch bo'lak DXF</button><button class="btn" id="m3">Saqlab qo'yish</button></div>
   <h3 class="sec">Shablon jadvali (o'rta chiziqdan)</h3>${tbl(["№","Aylana bo'yicha, mm","Yarim uzunlik, mm"],rows)}
   ${note("Har bir kesim burchagi = tirsak burchagi ÷ (2 × (bo'laklar − 1)). Shablon jadvalidagi uzunlik — bo'lak o'rtasidan kesish chizig'igacha.")}`;
  const Me={tris:[],cols:MC};const piece=(am,lo,hi,ci)=>{/* o'q: am burchakdagi urinma; lo/hi: parametr chegaralari funksiyasi */
    const T_=[-Math.sin(am),Math.cos(am),0],N_=[Math.cos(am),Math.sin(am),0];const rows=[];for(let i=0;i<=4;i++){const row=[];for(let j=0;j<=40;j++){const f=2*PI*j/40;const rho=r*Math.cos(f),z=r*Math.sin(f);const pr=lo(rho)+(hi(rho)-lo(rho))*i/4;
      row.push([(Rb+rho)*N_[0]+pr*T_[0],(Rb+rho)*N_[1]+pr*T_[1],z])}rows.push(row)}quadMesh(rows,ci,Me)};
  const A_=rad(v.A);piece(0,()=>-v.s,rho=>(Rb+rho)*Math.tan(al),0);for(let k=1;k<n-1;k++)piece(2*k*al,rho=>-(Rb+rho)*Math.tan(al),rho=>(Rb+rho)*Math.tan(al),k%2?1:0);piece(A_,rho=>-(Rb+rho)*Math.tan(al),()=>v.s,(n-1)%2?1:0);
  return{html,mesh:Me,after:root=>{const a=root.querySelector("#m1");if(a)a.onclick=()=>saveFile(`tirsak_orta_${v.D}.dxf`,dxf(shapeMid));root.querySelector("#m2").onclick=()=>saveFile(`tirsak_uch_${v.D}.dxf`,dxf(shapeEnd));root.querySelector("#m3").onclick=()=>savePattern(`Tirsak ${v.D} mm, ${v.A}°`,n>2?shapeMid:shapeEnd)}}}});

T({id:"flow",cat:"q",ic:"flow",name:"Oqim va diametr",quick:1,
 desc:"Quvurdan o'tadigan suv/suyuqlik miqdori, yoki kerakli oqim uchun quvur diametri.",
 modes:[["q","Oqimni topish"],["d","Diametrni topish"]],
 fields:m=>m==="q"?[{k:"d",l:"Quvur ichki diametri",u:"mm",v:50},{k:"s",l:"Oqim tezligi",u:"m/s",v:1.5}]
  :[{k:"Q",l:"Kerakli oqim",u:"m³/soat",v:10},{k:"s",l:"Tezlik (suv uchun 1–2)",u:"m/s",v:1.5}],
 calc(v,m){
  if(m==="q"){const A=PI*(v.d/1000)**2/4,Q=A*v.s;return`<div class="res">${R("Oqim",fmt(Q*3600,2),"m³/soat",1)}${R("Litr/daqiqa",fmt(Q*60000,1),"l/min")}${R("Litr/soniya",fmt(Q*1000,2),"l/s")}${R("Kesim yuzasi",fmt(A*1e6,0),"mm²")}</div>`}
  const d=Math.sqrt(4*(v.Q/3600)/(PI*v.s))*1000;const near=PIPES.find(p=>p[2]-2*p[3]>=d)||PIPES[PIPES.length-1];
  return`<div class="res">${R("Kerakli ichki diametr",fmt(d,1),"mm",1)}${R("Mos quvur",`DN${near[0]}`,`Ø${fmt(near[2],1)}×${fmt(near[3],1)} mm`)}</div>`+note("Tavsiya etiladigan tezlik: ichimlik suvi 0,7–1,5 m/s, isitish tizimi 0,5–1,5 m/s, nasos chiqishida 1,5–3 m/s.")}});

T({id:"pipew",cat:"q",ic:"cyl",name:"Quvur hajmi va og'irligi",
 desc:"Quvur og'irligi, ichidagi suv hajmi va to'ldirish uchun kerak bo'ladigan suv.",
 fields:()=>[{k:"D",l:"Tashqi diametr",u:"mm",v:57},{k:"t",l:"Devor qalinligi",u:"mm",v:3.5},{k:"L",l:"Uzunlik",u:"m",v:6},{k:"mat",l:"Material",v:"7.85",opts:MATS}],
 calc(v){const id=v.D-2*v.t;const kgm=PI*(v.D-v.t)*v.t*(+v.mat)/1000;const vol=PI*(id/1000)**2/4*v.L*1000;
  return`<div class="res">${R("Umumiy og'irlik",fmt(kgm*v.L,1),"kg",1)}${R("1 metr og'irligi",fmt(kgm,2),"kg/m")}${R("Ichki diametr",fmt(id,1),"mm")}${R("Ichidagi hajm",fmt(vol,1),"litr")}${R("Suv bilan og'irlik",fmt(kgm*v.L+vol,1),"kg")}${R("Tashqi yuza (bo'yoq)",fmt(PI*v.D/1000*v.L,2),"m²")}</div>`}});

T({id:"hydro",cat:"q",ic:"drop",name:"Gidravlik sinov",quick:1,
 desc:"Quvurni suv bosimi bilan sinash: sinov bosimi, devordagi kuchlanish xavfsizmi, kerakli suv miqdori.",
 fields:()=>[{k:"P",l:"Ishchi bosim",u:"bar",v:10},{k:"k",l:"Sinov koeffitsienti",v:"1.5",opts:[["1.25","1,25 × (gaz, bug')"],["1.5","1,5 × (suv, ko'pchilik me'yorlar)"]]},
  {k:"D",l:"Quvur tashqi diametri",u:"mm",v:108},{k:"t",l:"Devor qalinligi",u:"mm",v:4},{k:"L",l:"Sinaladigan uzunlik",u:"m",v:50},
  {k:"st",l:"Po'lat markasi",v:"245",opts:[["235","St3 / S235 (oqish 235 MPa)"],["245","Ст20 (245 MPa)"],["345","09G2S (345 MPa)"],["205","AISI 304 zanglamas (205 MPa)"],["170","AISI 316L (170 MPa)"]]}],
 calc(v){const Pt=v.P*(+v.k);const sig=(Pt/10)*v.D/(2*v.t);const lim=0.9*(+v.st);const id=v.D-2*v.t;const vol=PI*(id/1000)**2/4*v.L*1000;
  const Pmax=2*(+v.st)*(2/3)*v.t/v.D*10;
  const okk=sig<=lim;
  return`<div class="res">${R("Sinov bosimi",fmt(Pt,1),"bar",1)}${R("MPa da",fmt(Pt/10,2),"MPa")}${R("kgs/sm² da",fmt(Pt*1.0197,1),"kgs/sm²")}${R("Devor kuchlanishi",fmt(sig,0),"MPa")}${R("Ruxsat chegarasi (0,9×oqish)",fmt(lim,0),"MPa")}${R("Kerakli suv",fmt(vol,0),"litr")}${R("Quvur ko'taradigan ishchi bosim",fmt(Pmax,0),"bar")}</div>`
   +note(okk?"✔ Sinov bosimida quvur devori xavfsiz chegarada.":"✖ Sinov bosimida devor kuchlanishi juda katta! Qalinroq quvur yoki kichikroq bosim kerak.",okk?"ok":"warn")
   +note("Bosimni sekin, bosqichma-bosqich ko'taring. Sinov bosimida kamida 10 daqiqa ushlab turing (ko'pincha 30 daqiqa–1 soat), keyin ishchi bosimga tushirib, barcha choklarni ko'zdan kechiring. Sinovni faqat suv bilan o'tkazing, havodan foydalanmang. Bu hisob taxminiy: rasmiy obyektlarda loyiha va me'yoriy hujjat talablari amal qiladi.")}});

T({id:"purge",cat:"p",ic:"purge",name:"Argon bilan puflash (purge)",quick:1,
 desc:"Zanglamas quvurni payvandlashdan oldin ichini argon bilan to'ldirish: qancha vaqt va qancha gaz kerak.",
 fields:()=>[{k:"d",l:"Quvur ichki diametri",u:"mm",v:52},{k:"L",l:"Puflanadigan uzunlik",u:"mm",v:500},{k:"q",l:"Gaz sarfi",u:"l/min",v:10},{k:"n",l:"Hajm almashinuvi",v:"5",opts:[["3","3 marta (uglerodli po'lat)"],["5","5 marta (zanglamas, tavsiya)"],["7","7 marta (titan, juda toza)"]]}],
 calc(v){const V=PI*(v.d/2)**2*v.L/1e6;const gas=V*(+v.n);const tm=gas/v.q;
  return`<div class="res">${R("Puflash vaqti",tm<1?fmt(tm*60,0):fmt(tm,1),tm<1?"soniya":"daqiqa",1)}${R("Quvur ichki hajmi",fmt(V,2),"litr")}${R("Sarflanadigan argon",fmt(gas,1),"litr")}</div>`
   +note("Puflash zonasini ikki tomondan tiqin (zaglushka) bilan yoping, gaz pastdan kirib, yuqoridan chiqsin. Puflashni payvandlash davomida ham kamroq sarf bilan davom ettiring. Kislorod o'lchagich bo'lsa, 0,1% (1000 ppm) dan past bo'lishini kuting.")}});

/* ================= Quvur o'lchamlari (GOST 10704 / ISO) ================= */
const PIPES=[[10,"3/8\"",17.2,2.0],[15,"1/2\"",21.3,2.8],[20,"3/4\"",26.9,2.8],[25,"1\"",33.7,3.2],[32,"1¼\"",42.4,3.2],[40,"1½\"",48.3,3.5],[50,"2\"",57,3.5],[50,"2\"",60.3,3.6],[65,"2½\"",76.1,3.5],[80,"3\"",89,4.0],[100,"4\"",108,4.0],[100,"4\"",114.3,4.0],[125,"5\"",133,4.0],[150,"6\"",159,4.5],[150,"6\"",168.3,4.5],[200,"8\"",219.1,6.0],[250,"10\"",273,7.0],[300,"12\"",325,8.0],[350,"14\"",377,9.0],[400,"16\"",426,9.0]];
const MATS=[["7.85","Po'lat (qora)"],["7.93","Zanglamas po'lat"],["2.70","Alyuminiy"],["8.96","Mis"],["8.50","Latun"],["7.20","Cho'yan"],["4.51","Titan"]];
