/* ================= PAYVAND ================= */
const MET=[["cs","Uglerodli po'lat (St3, Ст20)"],["la","Kam legirlangan (09G2S)"],["ss","Zanglamas AISI 304"],["s6","Zanglamas AISI 316"],["gz","Ruxlangan (otsinkovka) po'lat"],["ci","Cho'yan"],["al","Alyuminiy"],["cu","Mis"]];
function compat(a,b){
  const k=[a,b].sort().join("-");const S=(s,mma,mig,tig,n)=>({s,mma,mig,tig,n});
  const steel=["cs","la"];
  if(a==="al"&&b==="al")return S("ok","OZA-1, OZA-2 (sifati past, kam ishlatiladi)","ER4043 yoki ER5356, 100% argon, impuls rejimi","ER4043/ER5356, o'zgaruvchan tok (AC), 100% argon","Oksid pardani zanglamas cho'tka bilan tozalang. 10 mm dan qalinida 150°C gacha qizdirish yordam beradi.");
  if(a==="al"||b==="al")return S("no","—","—","—","Alyuminiyni boshqa metallga oddiy payvand bilan ulab bo'lmaydi: mo'rt birikma hosil bo'ladi. Bimetall o'tish plastinasi, bolt, parchin yoki yopishtirish ishlating.");
  if(steel.includes(a)&&steel.includes(b))return S("ok","E6013 (MR-3, ANO-21) — oddiy ishlar; E7018 (UONI-13/55) — mas'uliyatli choklar","ER70S-6 (Sv-08G2S), gaz: CO₂ yoki 82% Ar + 18% CO₂","ER70S-6, doimiy tok (DC−), 100% argon",(a==="la"||b==="la")?"09G2S qalinligi 20 mm dan oshsa, 100–150°C gacha oldindan qizdiring.":"Eng oson payvandlanadigan juftlik.");
  if(k==="ss-ss")return S("ok","E308L-16 (OZL-8)","ER308LSi, gaz: 98% Ar + 2% CO₂","ER308L, DC−, 100% argon + quvur ichini argon bilan puflash","Issiqlikni kam bering, qatlamlar orasida 150°C dan sovuting. Uglerodli po'lat cho'tkasini ishlatmang.");
  if(k==="s6-s6"||k==="s6-ss")return S("ok","E316L-16 (OZL-20)","ER316LSi, 98% Ar + 2% CO₂","ER316L, DC−, argon + ichini puflash","316 bilan 304 ni ulashda 316L sim ishlating.");
  if((a==="ss"||a==="s6"||b==="ss"||b==="s6")&&(steel.includes(a)||steel.includes(b)))return S("w","E309L-16 (OZL-6, TsL-25)","ER309LSi, 98% Ar + 2% CO₂","ER309L, DC−, argon","Turli metallar: faqat 309L tipidagi sim/elektrod ishlating — oddiy elektrod chok yorilishiga olib keladi. Issiqlikni kamroq bering.");
  if(a==="gz"||b==="gz"){if(a==="ci"||b==="ci"||a==="cu"||b==="cu")return S("w","—","CuSi3 bilan MIG-kavsharlash","ERCuSi-A","Avval rux qatlamini tozalab tashlang.");
    if(a==="ss"||a==="s6"||b==="ss"||b==="s6")return S("w","E309L-16","ER309LSi","ER309L","Payvand joyidan rux qatlamini 20–30 mm kenglikda silliqlab olib tashlang.");
    return S("w","E6013 (rux tozalangandan keyin)","CuSi3 sim bilan MIG-kavsharlash (rux kuymaydi) yoki ER70S-6","ERCuSi-A","Rux tutuni zaharli! Yaxshi shamollatish va respirator shart. Chokdan keyin rux bo'yoq (sovuq ruxlash) surting.")}
  if(k==="ci-ci")return S("w","ENi-CI (OZCh-2, MNCh-2 — nikelli)","Odatda ishlatilmaydi","ERNi-CI","Cho'yan yoriladi: 200–300°C gacha qizdiring yoki «sovuq usul» — 20–30 mm qisqa choklar, har biridan keyin bolg'acha bilan urib, sovuting. Sekin soviting.");
  if(a==="ci"||b==="ci"){if(a==="cu"||b==="cu")return S("w","—","—","Bronza bilan kavsharlash","Bronza (latun) kavsharlash eng ishonchli.");
    return S("w","ENiFe-CI (temir-nikelli)","—","ERNiFe-CI","Cho'yan tomonni 200–300°C gacha qizdiring, qisqa choklar bilan payvandlang.")}
  if(k==="cu-cu")return S("w","Komsomolets-100 (misli elektrod)","ERCu, 100% argon yoki Ar+He","ERCu, DC−, argon","Mis issiqlikni tez tarqatadi: 3 mm dan qalinida 300–500°C gacha qizdiring.");
  if(a==="cu"||b==="cu")return S("w","—","CuSi3 sim bilan MIG-kavsharlash","ERCuSi-A (kremniyli bronza)","Mis + po'latni bronza sim bilan kavsharlash eng oson va mustahkam.");
  return S("w","—","—","—","Mutaxassis bilan maslahatlashing.");
}
T({id:"compat",cat:"p",ic:"flask",name:"Metallar mosligi",quick:1,
 desc:"Ikki metallni payvandlash mumkinmi va qaysi elektrod, sim, gaz kerak.",
 fields:()=>[{k:"a",l:"1-metall",v:"cs",opts:MET,w:1},{k:"b",l:"2-metall",v:"ss",opts:MET,w:1}],
 calc(v){const c=compat(v.a,v.b);const lab={ok:["b-ok","Payvandlanadi"],w:["b-w","Ehtiyotkorlik bilan"],no:["b-no","Payvand qilib bo'lmaydi"]}[c.s];
  return`<div class="card"><span class="badge ${lab[0]}">${lab[1]}</span></div>
  ${c.s!=="no"?`<div class="list">${[["Elektrod (MMA)",c.mma],["Yarim avtomat (MIG/MAG)",c.mig],["Argon (TIG)",c.tig]].map(x=>`<div class="r"><div class="l">${x[0]}</div><div style="font-weight:700;margin-top:4px;line-height:1.4">${x[1]}</div></div>`).join("")}</div>`:""}`+note(c.n,c.s==="no"?"warn":"")}});

const ELT=[[1.6,25,50],[2.0,40,70],[2.5,60,90],[3.0,80,120],[3.2,90,130],[4.0,120,170],[5.0,160,220]];
T({id:"mma",cat:"p",ic:"rod",name:"Elektrod va tok (MMA)",quick:1,
 desc:"Metall qalinligiga qarab elektrod diametri va payvand toki.",
 fields:()=>[{k:"t",l:"Metall qalinligi",u:"mm",v:4},{k:"pos",l:"Chok holati",v:"1",opts:[["1","Pastki (gorizontal)"],["0.9","Vertikal"],["0.85","Shift (tepada)"]]},{k:"j",l:"Ulanish turi",v:"b",opts:[["b","Uchma-uch (stык)"],["f","Burchakli / tavr"]]}],
 calc(v){const t=v.t;const d=t<=1.5?1.6:t<=2.5?2.0:t<=3.5?2.5:t<=6?3.2:t<=12?4.0:5.0;const e=ELT.find(x=>x[0]===d);const k=+v.pos*(v.j==="f"?1.1:1);
  const passes=t<=4?1:t<=8?2:Math.ceil(t/4);
  return`<div class="res">${R("Elektrod diametri",fmt(d,1),"mm",1)}${R("Tok",`${fmt0(e[1]*k)}–${fmt0(e[2]*k)}`,"A")}${R("Qatlamlar soni (taxm.)",passes)}${R("Kesish chetlari",t<4?"Kerak emas":t<=12?"V-shakl 60°":"X-shakl")}</div>`
  +tbl(["Elektrod, mm","Tok, A"],ELT.map(x=>[fmt(x[0],1),`${x[1]}–${x[2]}`]))+note("Taxminiy qoida: elektrod diametrining har 1 mm iga 30–40 A. Vertikal va shiftda tokni 10–15% kamaytiring. Aniq qiymat elektrod qutisida yozilgan.")}});

T({id:"mig",cat:"p",ic:"wire",name:"Yarim avtomat (MIG/MAG)",
 desc:"Qalinlikka qarab sim diametri, tok, kuchlanish va gaz sarfi.",
 fields:()=>[{k:"t",l:"Metall qalinligi",u:"mm",v:3},{k:"m",l:"Material",v:"cs",opts:[["cs","Qora po'lat"],["ss","Zanglamas"],["al","Alyuminiy"]]}],
 calc(v){const t=v.t;const w=v.m==="al"?(t<=3?1.0:1.2):t<=1.5?0.6:t<=3?0.8:t<=8?1.0:1.2;const I=Math.min(320,Math.max(40,v.m==="al"?35*t+40:t<=1?45:30*t+40));const U=14+0.05*I;
  const gas=v.m==="cs"?"CO₂ yoki 82% Ar + 18% CO₂":v.m==="ss"?"98% Ar + 2% CO₂":"100% argon";const q=Math.round(Math.max(10,w*15));
  return`<div class="res">${R("Sim diametri",fmt(w,1),"mm",1)}${R("Tok",fmt0(I),"A")}${R("Kuchlanish",fmt(U,1),"V")}${R("Gaz sarfi",`${q-2}–${q+3}`,"l/min")}${R("Gaz",gas)}</div>`+note("Bu boshlang'ich sozlama. Sinov plastinada sinab, chok tovushiga qarab sozlang: bir tekis «shivirlash» — to'g'ri; «chirsillash» — kuchlanish past, «xirillash» — baland.")}});

T({id:"tig",cat:"p",ic:"tig",name:"Argon (TIG)",
 desc:"Volfram elektrod diametri, tok va argon sarfi.",
 fields:()=>[{k:"t",l:"Metall qalinligi",u:"mm",v:2},{k:"m",l:"Material",v:"ss",opts:[["ss","Zanglamas / qora po'lat (DC)"],["al","Alyuminiy (AC)"]]}],
 calc(v){const t=v.t;const w=t<=1?1.0:t<=3?1.6:t<=5?2.4:3.2;const I=Math.round((v.m==="al"?45:35)*t+10);const q=t<=3?"6–8":"8–12";const f=t<=1?1.0:t<=3?1.6:t<=5?2.4:3.2;
  return`<div class="res">${R("Volfram elektrod",fmt(w,1),"mm",1)}${R("Tok",fmt0(I*0.9)+"–"+fmt0(I*1.15),"A")}${R("Argon sarfi",q,"l/min")}${R("Qo'shimcha sim",fmt(f,1),"mm")}${R("Elektrod rangi",v.m==="al"?"Yashil yoki Ko'k (WL20)":"Qizil (WT20) yoki Ko'k (WL20)")}</div>`+note(v.m==="al"?"Alyuminiy o'zgaruvchan tok (AC) bilan payvandlanadi, uchi yumaloq bo'ladi.":"Zanglamas po'latda elektrod uchini nayzadek o'tkirlang, doimiy tok (DC−).")}});

T({id:"heat",cat:"p",ic:"fire",name:"Issiqlik kiritish",
 desc:"Chokka beriladigan issiqlik (kJ/mm) — payvand texnologik kartasi (WPS) uchun.",
 fields:()=>[{k:"U",l:"Kuchlanish",u:"V",v:24},{k:"I",l:"Tok",u:"A",v:150},{k:"L",l:"Chok uzunligi",u:"mm",v:200},{k:"s",l:"Shu chokka ketgan vaqt",u:"soniya",v:60},
  {k:"k",l:"Jarayon",v:"0.8",opts:[["0.8","Elektrod (MMA) — 0,8"],["0.8 ","Yarim avtomat (MIG) — 0,8"],["0.6","Argon (TIG) — 0,6"],["1.0","Flyus ostida (SAW) — 1,0"]]}],
 calc(v){const sp=v.L/v.s*60;const Q=v.U*v.I*60/(1000*sp)*parseFloat(v.k);
  return`<div class="res">${R("Issiqlik kiritish",fmt(Q,2),"kJ/mm",1)}${R("Payvand tezligi",fmt(sp,0),"mm/min")}</div>`+note("Zanglamas po'lat uchun odatda 1,5 kJ/mm dan oshirmaslik tavsiya etiladi. Juda ko'p issiqlik — metall tuzilishi buziladi, juda kam — erish yetarli bo'lmaydi.")}});

T({id:"preheat",cat:"p",ic:"temp",name:"Oldindan qizdirish",
 desc:"Po'lat tarkibidan uglerod ekvivalenti (CE) va kerakli oldindan qizdirish harorati.",
 fields:()=>[{k:"C",l:"Uglerod C",u:"%",v:0.2},{k:"Mn",l:"Marganets Mn",u:"%",v:0.6},{k:"Cr",l:"Xrom Cr",u:"%",v:0},{k:"Mo",l:"Molibden Mo",u:"%",v:0},{k:"V",l:"Vanadiy V",u:"%",v:0},{k:"Ni",l:"Nikel Ni",u:"%",v:0},{k:"Cu",l:"Mis Cu",u:"%",v:0},{k:"t",l:"Qalinlik",u:"mm",v:20}],
 calc(v){const CE=v.C+v.Mn/6+(v.Cr+v.Mo+v.V)/5+(v.Ni+v.Cu)/15;let T0=CE<0.35?0:CE<0.45?(v.t>25?75:v.t>15?50:0):CE<0.55?(v.t>25?150:100):CE<0.7?200:250;
  return`<div class="res">${R("Uglerod ekvivalenti CE",fmt(CE,3),"",1)}${R("Oldindan qizdirish",T0?fmt0(T0)+"–"+fmt0(T0+50):"Shart emas",T0?"°C":"")}${R("Payvandlanuvchanlik",CE<0.35?"A'lo":CE<0.45?"Yaxshi":CE<0.6?"Qoniqarli":"Qiyin")}</div>`
  +note("Misollar: St3 ≈ 0,25–0,30; Ст20 ≈ 0,30–0,35; 09G2S ≈ 0,42–0,45; 40X ≈ 0,7+. Qizdirish chok atrofida 75 mm kenglikda bo'lsin. Termo-qalam yoki pirometr bilan tekshiring.")}});
