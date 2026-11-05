/* ================= MA'LUMOT / METALL ================= */
const SHAPES=[["list","List"],["truba","Dumaloq truba"],["profil","Profil truba"],["prut","Prut (dumaloq)"],["kv","Kvadrat"],["ugol","Ugolok"],["polosa","Polosa"],["shv","Shveller (taxm.)"]];
T({id:"weight",cat:"m",ic:"weight",name:"Metall og'irligi va narxi",quick:1,
 desc:"List, truba, profil, prut, ugolok og'irligi va narxi.",
 modes:SHAPES.map(s=>[s[0],s[1]]),
 fields:m=>{const L={k:"L",l:m==="list"?"Uzunlik":"Uzunlik",u:"mm",v:m==="list"?2500:6000};const q={k:"q",l:"Soni",v:1};const mat={k:"mat",l:"Material",v:"7.85",opts:MATS};const pr={k:"pr",l:"1 kg narxi",u:"so'm",v:12000};
  const F={list:[{k:"a",l:"Eni",u:"mm",v:1250},L,{k:"t",l:"Qalinlik",u:"mm",v:2}],truba:[{k:"D",l:"Tashqi diametr",u:"mm",v:57},{k:"t",l:"Devor",u:"mm",v:3},L],
   profil:[{k:"a",l:"Eni",u:"mm",v:40},{k:"b",l:"Bo'yi",u:"mm",v:20},{k:"t",l:"Devor",u:"mm",v:2},L],prut:[{k:"D",l:"Diametr",u:"mm",v:12},L],kv:[{k:"a",l:"Tomoni",u:"mm",v:12},L],
   ugol:[{k:"a",l:"1-tomon",u:"mm",v:50},{k:"b",l:"2-tomon",u:"mm",v:50},{k:"t",l:"Qalinlik",u:"mm",v:5},L],polosa:[{k:"a",l:"Eni",u:"mm",v:40},{k:"t",l:"Qalinlik",u:"mm",v:4},L],
   shv:[{k:"h",l:"Balandlik h",u:"mm",v:100},{k:"b",l:"Tokcha b",u:"mm",v:46},{k:"s",l:"Devor s",u:"mm",v:4.5},{k:"t",l:"Tokcha qalinligi t",u:"mm",v:7.6},L]}[m]||[];
  return[...F,q,mat,pr]},
 calc(v,m){const A={list:()=>v.a*v.t,truba:()=>PI*(v.D-v.t)*v.t,profil:()=>(2*(v.a+v.b)-4*v.t)*v.t,prut:()=>PI*v.D*v.D/4,kv:()=>v.a*v.a,ugol:()=>(v.a+v.b-v.t)*v.t,polosa:()=>v.a*v.t,shv:()=>v.h*v.s+2*(v.b-v.s)*v.t}[m]();
  const kgm=A*(+v.mat)/1000,one=kgm*v.L/1000,tot=one*v.q;
  return`<div class="res">${R("Umumiy og'irlik",fmt(tot,2),"kg",1)}${R(m==="list"?"1 m² og'irligi":"1 metr og'irligi",fmt(m==="list"?v.t*(+v.mat):kgm,2),m==="list"?"kg/m²":"kg/m")}${R("Bitta dona",fmt(one,2),"kg")}${R("Narxi",fmt0(tot*v.pr),"so'm")}${m==="list"?R("Maydon",fmt(v.a*v.L/1e6*v.q,2),"m²"):R("Jami uzunlik",fmt(v.L/1000*v.q,2),"m")}</div>`}});

T({id:"pipes",cat:"m",ic:"table",name:"Quvur o'lchamlari jadvali",
 desc:"Shartli o'tish (DN), dyuym va tashqi diametr — elektr-payvand po'lat quvurlar (GOST 10704 / ISO).",
 calc(){return tbl(["DN","Dyuym","Tashqi Ø, mm","Devor, mm","kg/m"],PIPES.map(p=>[p[0],p[1],fmt(p[2],1),fmt(p[3],1),fmt(PI*(p[2]-p[3])*p[3]*7.85/1000,2)]))+note("Devor qalinligi — eng ko'p ishlatiladigan qiymat. Aniq o'lchamni sotuvchi sertifikatidan tekshiring.")}});

const PU=[["bar","bar",1],["mpa","MPa",10],["kpa","kPa",0.01],["kgs","kgs/sm²",0.980665],["atm","atm",1.01325],["psi","psi",0.0689476],["mmhg","mm sim. ust.",0.00133322]];
T({id:"pres",cat:"m",ic:"gauge",name:"Bosim birliklari",
 desc:"bar, MPa, kgs/sm², atm, psi o'rtasida hisoblash.",
 fields:()=>[{k:"x",l:"Qiymat",v:10},{k:"u",l:"Birlik",v:"bar",opts:PU.map(p=>[p[0],p[1]])}],
 calc(v){const b=v.x*PU.find(p=>p[0]===v.u)[2];return`<div class="res">${PU.map((p,i)=>R(p[1],fmt(b/p[2],p[0]==="mpa"?4:2),"",p[0]===v.u)).join("")}</div>`}});

T({id:"inch",cat:"m",ic:"conv",name:"Dyuym ↔ mm",
 desc:"Dyuym (kasr ham bo'ladi: 1 1/2) va millimetr.",
 fields:()=>[{k:"x",l:"Dyuym (masalan 3/4 yoki 1 1/2)",v:"3/4",t:"text",w:1},{k:"mm",l:"yoki millimetr",u:"mm",v:0}],
 calc(v){const p=String(v.x).trim().split(/\s+/);let inch=0;p.forEach(s=>{if(s.includes("/")){const [a,b]=s.split("/");inch+=(+a)/(+b)}else inch+=parseFloat(s.replace(",","."))||0});
  const mm=inch*25.4;const back=v.mm>0?v.mm/25.4:0;
  return`<div class="res">${R(`${esc(v.x)}″ =`,fmt(mm,2),"mm",1)}${v.mm>0?R(`${fmt(v.mm,1)} mm =`,fmt(back,3),"dyuym"):""}${R("1/8 ga yaxlit",fmt(Math.round((v.mm>0?back:inch)*8)/8,3),"″")}</div>`+note("Quvurlarda dyuym — shartli o'lcham: masalan ¾″ quvurning tashqi diametri 26,9 mm (jadvalga qarang).")}});

T({id:"gas",cat:"m",ic:"cyl",name:"Gaz ballon zaxirasi",
 desc:"Argon yoki karbonat ballon qancha vaqtga yetadi.",
 fields:()=>[{k:"V",l:"Ballon hajmi",u:"litr",v:40},{k:"P",l:"Ballondagi bosim",u:"bar",v:150},{k:"q",l:"Gaz sarfi",u:"l/min",v:12},{k:"g",l:"Gaz",v:"ar",opts:[["ar","Argon / aralashma"],["co2","Karbonat (CO₂, suyuq)"]]}],
 calc(v){const gas=v.g==="co2"?v.V*0.6*509:v.V*v.P;const min=gas/v.q;
  return`<div class="res">${R("Yetadi (sof yonish vaqti)",fmt(min/60,1),"soat",1)}${R("Gaz miqdori",fmt0(gas),"litr")}</div>`+note(v.g==="co2"?"40 litrli CO₂ ballonida ~24 kg suyuq karbonat, bu ~12 000 litr gaz. Bosim o'lchagich CO₂ da qolgan miqdorni ko'rsatmaydi — og'irlik bo'yicha tekshiring.":"Argon miqdori = ballon hajmi × bosim. 40 l × 150 bar ≈ 6 m³.")}});
