/* ================= PAYVAND — qo'shimchalar ================= */
const GAS={
 "mig-cs":["82% Ar + 18% CO₂ (yoki 100% CO₂ — arzon, ko'proq sachraydi)","12–18"],"mig-ss":["98% Ar + 2% CO₂ (yoki 98% Ar + 2% O₂)","12–16"],"mig-al":["100% argon (qalin alyuminiyda Ar + 25–50% He)","15–20"],
 "mig-cu":["100% argon (qalinda Ar + He)","15–20"],"mig-ti":["100% argon, yuqori tozalik","15–20"],
 "tig-cs":["100% argon","6–10"],"tig-ss":["100% argon (+ quvur ichini puflash)","6–10"],"tig-al":["100% argon","8–12"],"tig-cu":["100% argon yoki Ar + He","8–12"],"tig-ti":["100% argon + orqa himoya (trailing shield)","10–14"],
 "fc-cs":["Gazli flyus sim: 100% CO₂ yoki 75% Ar + 25% CO₂; o'zi himoyalanadigan sim — gazsiz","15–20"],"fc-ss":["75% Ar + 25% CO₂ yoki 100% CO₂ (sim turiga qarang)","15–20"],"fc-al":["Bu jarayon alyuminiyga ishlatilmaydi","—"],"fc-cu":["Ishlatilmaydi","—"],"fc-ti":["Ishlatilmaydi","—"]};
T({id:"gassel",cat:"p",sub:"Sozlash",ic:"purge",name:"Gaz tanlash va sarfi",
 desc:"Jarayon va metall bo'yicha himoya gazi va ballon sarfi.",
 fields:()=>[{k:"p",l:"Jarayon",v:"mig",opts:[["mig","Yarim avtomat (MIG/MAG)"],["tig","Argon (TIG)"],["fc","Flyusli sim (FCAW)"]],w:1},{k:"m",l:"Metall",v:"cs",opts:[["cs","Qora po'lat"],["ss","Zanglamas"],["al","Alyuminiy"],["cu","Mis"],["ti","Titan"]],w:1},{k:"w",l:"Shamol / ochiq joy",v:"0",opts:[["0","Yo'q (xona ichida)"],["1","Bor (ochiq havoda)"]]}],
 calc(v){const g=GAS[v.p+"-"+v.m];return`<div class="list"><div class="r big"><div class="l">Gaz</div><div class="v" style="font-size:20px;line-height:1.35">${g[0]}</div></div><div class="r"><div class="l">Gaz sarfi</div><div class="v">${g[1]}<small>l/min</small></div></div></div>`
  +note(v.w==="1"?"Ochiq havoda gaz shamolda uchib ketadi: to'siq qo'ying yoki o'zi himoyalanadigan flyusli sim / elektrod ishlating. Sarfni oshirish yordam bermaydi.":"Sarf juda ko'p bo'lsa ham yomon — havo aralashib g'ovaklik paydo bo'ladi. Soplo diametri (mm) × 1 ≈ l/min — oddiy qoida.")}});

const DEF=[
 ["por","G'ovaklik (teshikchalar)",["Gaz kam yoki ko'p, shamol","Metall iflos, zang, moy, bo'yoq","Elektrod nam (quritilmagan)","Yoy juda uzun"],["Gaz sarfini 12–16 l/min qiling, shamoldan to'sing","Chok joyini yaltiroq qilib tozalang","Elektrodni 250–350°C da 1 soat quriting (UONI)","Yoyni qisqa tuting"]],
 ["crack","Yoriqlar",["Metall tez soviydi (qalin/sovuq)","Uglerodi ko'p po'lat","Chok oxirida krater qoldi","Noto'g'ri elektrod/sim"],["Oldindan qizdiring, sekin soviting","Kam vodorodli elektrod (UONI-13/55)","Chok oxirida krater to'ldiring","Metallga mos elektrod tanlang («Metallar mosligi»)"]],
 ["lof","Chala erish / chala payvand",["Tok past","Tezlik katta","Elektrod burchagi noto'g'ri","Chetlar kesilmagan, tirqish kichik"],["Tokni 10–15% oshiring","Sekinroq yuring","Elektrodni 70–80° ushlang","Qalin metallda V-kesim va 1,5–3 mm tirqish qoldiring"]],
 ["uc","Chok cheti o'yilishi (podrez)",["Tok juda baland","Yoy uzun","Elektrod burchagi noto'g'ri","Tezlik katta"],["Tokni kamaytiring","Yoyni qisqartiring","Chetlarda biroz to'xtab o'ting","Tezlikni kamaytiring"]],
 ["sp","Sachrash ko'p",["Tok yoki kuchlanish noto'g'ri","100% CO₂ gaz","Yoy uzun","Metall iflos"],["Kuchlanishni sozlang (MIG)","Ar + CO₂ aralashmasiga o'ting","Simning chiqishi 10–15 mm","Tozalang, sachrashga qarshi sprey"]],
 ["bt","Kuyib teshilish",["Tok baland","Tirqish katta","Yupqa metall","Sekin yurish"],["Tokni kamaytiring","Tirqishni kichraytiring, mis tagliq qo'ying","Uzlukli (nuqtali) payvand qiling","Tezroq yuring"]],
 ["sl","Shlak qolib ketishi",["Qatlamlar orasida tozalanmagan","Tok past","Elektrod burchagi"],["Har qatlamdan keyin bolg'acha va cho'tka","Tokni oshiring","Shlak yoy oldiga o'tmasin"]],
 ["dist","Payvanddan qiyshayish",["Bir tomonlama payvand","Ko'p issiqlik","Mahkamlanmagan"],["Qarama-qarshi tomonlarni navbatma-navbat payvandlang","Qisqa choklar, «teskari qadam» usuli","Qisqichlar va tirgaklar bilan mahkamlang, oldindan teskari egib qo'ying"]],
 ["stick","Elektrod yopishib qoladi",["Tok past","Elektrod nam","Yoy boshlash noto'g'ri"],["Tokni oshiring","Elektrodni quriting","Gugurt chaqqandek chizib boshlang"]],
 ["arc","Yoy uziladi / bir tekis emas",["Massa (yer) kabeli yomon ulangan","Kabel ingichka yoki uzun","Sim uzatish notekis (MIG)"],["Massa qisqichini toza metallga ulang","Kabelni tekshiring, ulanishlarni tortib qo'ying","Rolik bosimi va sim kanalini tekshiring"]]];
T({id:"diag",cat:"p",sub:"Tushunish",ic:"search",name:"Nuqsonlar diagnostikasi",
 desc:"Choqda nuqson chiqdimi? Tanlang — sabablari va tuzatish yo'llari chiqadi.",
 fields:()=>[{k:"d",l:"Nuqson",v:"por",opts:DEF.map(x=>[x[0],x[1]]),w:1}],
 calc(v){const d=DEF.find(x=>x[0]===v.d);return`<div class="card"><h4>Sabablari</h4>${d[2].map(x=>`<div style="margin:6px 0">• ${x}</div>`).join("")}</div><div class="card"><h4>Nima qilish kerak</h4>${d[3].map(x=>`<div style="margin:6px 0">✔ ${x}</div>`).join("")}</div>`}});

T({id:"shrink",cat:"p",sub:"Tushunish",ic:"conv",name:"Chok qisqarishi",
 desc:"Uchma-uch payvanddan keyin detal qancha qisqaradi — oldindan zaxira qo'yish uchun.",
 fields:()=>[{k:"t",l:"Qalinlik",u:"mm",v:10},{k:"a",l:"Kesim burchagi (umumiy)",u:"°",v:60},{k:"g",l:"Tirqish",u:"mm",v:2},{k:"c",l:"Tomon to'mtoqligi",u:"mm",v:1.5},{k:"ty",l:"Kesim turi",v:"v",opts:[["v","V (bir tomonlama)"],["x","X (ikki tomonlama)"],["i","Kesimsiz (I)"]]},{k:"n",l:"Bir chiziqdagi choklar soni",v:1}],
 calc(v){const h=v.t-v.c,ta=Math.tan(rad(v.a)/2);const Aw=v.ty==="i"?v.g*v.t+v.t*1.5:v.ty==="x"?v.g*v.t+2*(h/2)**2*ta:v.g*v.t+h*h*ta;const S=0.2*Aw/v.t+0.05*v.g;
  return`<div class="res">${R("Bitta chok qisqarishi",fmt(S,2),"mm",1)}${R(`${Math.round(v.n)} ta chok`,fmt(S*Math.round(v.n),1),"mm")}${R("Chok kesim yuzasi",fmt(Aw,1),"mm²")}</div>`+note("Spraragen–Ettinger taxminiy formulasi: qisqarish = 0,2 × chok yuzasi ÷ qalinlik + 0,05 × tirqish. Uzun konstruksiyalarda shu qiymatni zaxira sifatida qo'shing. X-kesim V ga nisbatan kam qisqaradi va kam qiyshayadi.")}});

/* ISO 5817: [nomi, t>… izoh, D, C, B (funksiya qiymat mm yoki matn)] */
const ISO=[
 ["crack","Yoriq (100)",()=>["Mumkin emas","Mumkin emas","Mumkin emas"]],
 ["por","Sirtdagi g'ovak (2017), t>3",v=>[`d ≤ 0,3·s, maks 3 → ${fmt(Math.min(0.3*v.s,3),1)}`,`d ≤ 0,2·s, maks 2 → ${fmt(Math.min(0.2*v.s,2),1)}`,"Mumkin emas"]],
 ["uc","Chok cheti o'yilishi (5011), t>3",v=>[`h ≤ 0,2·t, maks 1 → ${fmt(Math.min(0.2*v.t,1),2)}`,`h ≤ 0,1·t, maks 0,5 → ${fmt(Math.min(0.1*v.t,0.5),2)}`,`h ≤ 0,05·t, maks 0,5 → ${fmt(Math.min(0.05*v.t,0.5),2)}`]],
 ["exb","Ortiqcha bo'rtiq — uchma-uch (502)",v=>[`h ≤ 1 + 0,25·b, maks 10 → ${fmt(Math.min(1+0.25*v.b,10),1)}`,`h ≤ 1 + 0,15·b, maks 7 → ${fmt(Math.min(1+0.15*v.b,7),1)}`,`h ≤ 1 + 0,1·b, maks 5 → ${fmt(Math.min(1+0.1*v.b,5),1)}`]],
 ["exf","Ortiqcha bo'rtiq — burchakli chok (503)",v=>[`h ≤ 1 + 0,25·b, maks 5 → ${fmt(Math.min(1+0.25*v.b,5),1)}`,`h ≤ 1 + 0,15·b, maks 4 → ${fmt(Math.min(1+0.15*v.b,4),1)}`,`h ≤ 1 + 0,1·b, maks 3 → ${fmt(Math.min(1+0.1*v.b,3),1)}`]],
 ["mis","Chetlar siljishi — list (507), t>3",v=>[`h ≤ 0,25·t, maks 5 → ${fmt(Math.min(0.25*v.t,5),1)}`,`h ≤ 0,15·t, maks 4 → ${fmt(Math.min(0.15*v.t,4),1)}`,`h ≤ 0,1·t, maks 3 → ${fmt(Math.min(0.1*v.t,3),1)}`]],
 ["root","Ildiz chala payvandi (4021)",v=>[`Qisqa: h ≤ 0,2·t, maks 2 → ${fmt(Math.min(0.2*v.t,2),1)}`,"Mumkin emas","Mumkin emas"]],
 ["rc","Ildiz botiqligi (515), t>3",v=>[`h ≤ 0,2·t, maks 2 → ${fmt(Math.min(0.2*v.t,2),1)}`,`h ≤ 0,1·t, maks 1 → ${fmt(Math.min(0.1*v.t,1),1)}`,`h ≤ 0,05·t, maks 0,5 → ${fmt(Math.min(0.05*v.t,0.5),2)}`]],
 ["asym","Burchakli chok assimetriyasi (512)",v=>[`h ≤ 2 + 0,2·a → ${fmt(2+0.2*v.a,1)}`,`h ≤ 2 + 0,15·a → ${fmt(2+0.15*v.a,1)}`,`h ≤ 1,5 + 0,15·a → ${fmt(1.5+0.15*v.a,1)}`]]];
T({id:"iso5817",cat:"p",sub:"Nazorat",ic:"table",name:"ISO 5817 — qabul me'yorlari",
 desc:"Chok nuqsonining ruxsat etilgan o'lchami sifat darajalari bo'yicha: D (oddiy), C (o'rta), B (yuqori).",
 fields:()=>[{k:"k",l:"Nuqson turi",v:"uc",opts:ISO.map(x=>[x[0],x[1]]),w:1},{k:"t",l:"Metall qalinligi t",u:"mm",v:8},{k:"b",l:"Chok eni b",u:"mm",v:12},{k:"a",l:"Burchakli chok kateti/qalinligi a",u:"mm",v:5},{k:"s",l:"Chok qalinligi s",u:"mm",v:6}],
 calc(v){const x=ISO.find(i=>i[0]===v.k);const L=x[2](v);return tbl(["Daraja","Ruxsat (mm)"],[["D — oddiy",L[0]],["C — o'rta",L[1]],["B — yuqori",L[2]]])+note("Qisqartirilgan jadval, taxminiy natija. Rasmiy qabul uchun ISO 5817 standartining to'liq matnidan foydalaning. Darajani buyurtmachi yoki loyiha belgilaydi.")}});

T({id:"spacing",cat:"p",sub:"Belgilash",ic:"bump",name:"Uzlukli chok joylashuvi",
 desc:"Uzun chokni bo'lak-bo'lak payvandlash: choklar soni, oralig'i va belgilar.",
 fields:()=>[{k:"L",l:"Umumiy uzunlik",u:"mm",v:1000},{k:"l",l:"Bitta chok uzunligi",u:"mm",v:50},{k:"p",l:"Qadam (chok boshidan keyingisigacha)",u:"mm",v:150},{k:"ty",l:"Turi",v:"z",opts:[["z","Zanjir (ikki tomon bir joyda)"],["s","Shaxmat (navbatma-navbat)"]]}],
 calc(v){const n=Math.floor((v.L-v.l)/v.p)+1;const used=(n-1)*v.p+v.l;const st=(v.L-used)/2;const rows=[];for(let i=0;i<n;i++){const a=st+i*v.p;rows.push([i+1,fmt(a,0),fmt(a+v.l,0),v.ty==="s"?(i%2?"Orqa":"Old"):"Ikkala"])}
  return`<div class="res">${R("Choklar soni",n,"",1)}${R("Jami chok uzunligi",fmt(n*v.l*(v.ty==="z"?2:1),0),"mm")}${R("Bo'sh oraliq",fmt(v.p-v.l,0),"mm")}${R("Chetlardan",fmt(st,1),"mm")}</div>`+tbl(["№","Boshi, mm","Oxiri, mm","Tomon"],rows)+note("Choklar uchlarda bo'lishi shart — chetdagi bo'sh joy chok uzunligidan katta bo'lsa, qadamni kamaytiring.")}});

makeLog("trace","p","Kuzatish","table","Chok jurnali","Har bir chok: raqami, payvandchi, sana, elektrod/sim, nazorat natijasi. CSV (Excel) qilib yuboriladi.",
 [{k:"chok",l:"Chok raqami",v:"",t:"text"},{k:"sana",l:"Sana",v:"",t:"date"},{k:"usta",l:"Payvandchi",v:"",t:"text"},{k:"material",l:"Elektrod / sim",v:"",t:"text"},{k:"nazorat",l:"Nazorat",v:"Ko'zdan",opts:[["Ko'zdan","Ko'zdan (VT)"],["Rentgen","Rentgen (RT)"],["UZK","UZK (UT)"],["Kapillyar","Kapillyar (PT)"]]},{k:"natija",l:"Natija",v:"Yaroqli",opts:[["Yaroqli","Yaroqli"],["Tuzatish","Tuzatish kerak"]]},{k:"izoh",l:"Izoh",v:"",t:"text",w:1}],"chok_jurnali.csv");
