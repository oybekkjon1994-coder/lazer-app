/* ================= ilova ================= */
const catOf=id=>CATS.find(c=>c.id===id);
const pins=()=>store.get("pins",TOOLS.filter(t=>t.quick).slice(0,6).map(t=>t.id));
function rowHTML(t){const c=catOf(t.cat);return`<button class="row" data-t="${t.id}">${ico(t.ic,c.cls)}<span>${esc(t.name)}<small>${esc(c.name)}</small></span><b class="chev">›</b></button>`}
function nav(cur){$("#nav").innerHTML=CATS.map(c=>`<button data-c="${c.id}" class="${c.id===cur?"on":""}">${ico(c.ic)}<span>${c.name}</span></button>`).join("");
  $("#nav").querySelectorAll("button").forEach(b=>b.onclick=()=>go(b.dataset.c==="home"?"":"c/"+b.dataset.c))}
function head(title,back,tid){$("#logo").style.display=title?"none":"flex";$("#ttl").textContent=title||"";$("#back").style.display=back?"block":"none";
  const s=$("#star");s.style.display=tid?"block":"none";if(tid){s.classList.toggle("on",pins().includes(tid));s.onclick=()=>{let p=pins();p=p.includes(tid)?p.filter(x=>x!==tid):[...p,tid].slice(-9);store.set("pins",p);s.classList.toggle("on",p.includes(tid));toast(p.includes(tid)?"Tez kirishga qo'shildi":"Tez kirishdan olindi")}}}
function bindRows(root){root.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>go("t/"+b.dataset.t))}

function viewHome(){head("",false);nav("home");const app=$("#app");
  const recent=store.get("recent",[]).map(tool).filter(Boolean).slice(0,4);
  app.innerHTML=`<div class="search">${ico("search").replace("<svg",'<svg style="width:20px;height:20px;opacity:.6"')}<input id="q" placeholder="Asbob qidirish…" autocomplete="off"></div>
   <div id="sr"></div><div id="hm">
   <h3 class="sec">Tez kirish</h3><div class="grid">${pins().map(tool).filter(Boolean).map(t=>`<button class="tile" data-t="${t.id}">${ico(t.ic,catOf(t.cat).cls)}<span>${esc(t.name)}</span></button>`).join("")}</div>
   <div class="desc" style="text-align:center;margin-top:10px">Asbob ichida ★ tugmasi bilan tez kirishga qo'shing</div>
   ${recent.length?`<h3 class="sec">Oxirgi ishlatilganlar</h3><div class="list">${recent.map(rowHTML).join("")}</div>`:""}
   ${CATS.slice(1).map(c=>`<h3 class="sec">${c.full}</h3><div class="list">${TOOLS.filter(t=>t.cat===c.id).slice(0,3).map(rowHTML).join("")}<button class="row" data-c="${c.id}" style="justify-content:center;color:var(--mut);font-size:15px">Barchasi (${TOOLS.filter(t=>t.cat===c.id).length}) ›</button></div>`).join("")}
   <div class="foot">Payvand Usta · Metart ustaxonasi · internetsiz ishlaydi</div></div>`;
  bindRows(app);app.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>go("c/"+b.dataset.c));
  const q=$("#q");q.oninput=()=>{const s=q.value.trim().toLowerCase();$("#hm").style.display=s?"none":"block";
    const r=s?TOOLS.filter(t=>(t.name+" "+t.desc).toLowerCase().includes(s)):[];$("#sr").innerHTML=s?(r.length?`<div class="list">${r.map(rowHTML).join("")}</div>`:`<div class="empty">Topilmadi</div>`):"";bindRows($("#sr"))}}

function viewCat(cid){const c=catOf(cid);head(c.full,false);nav(cid);const L=TOOLS.filter(t=>t.cat===cid);const order=(typeof SUBORDER!=="undefined"&&SUBORDER[cid])||[];
  const subs=[...order.filter(s=>L.some(t=>t.sub===s)),...[...new Set(L.map(t=>t.sub||"Boshqa"))].filter(s=>!order.includes(s))];
  $("#app").innerHTML=subs.map(s=>`<h3 class="sec">${esc(s)}</h3><div class="list">${L.filter(t=>(t.sub||"Boshqa")===s).map(rowHTML).join("")}</div>`).join("");bindRows($("#app"))}
function viewTool(id){const t=tool(id);if(!t)return go("");head(t.name,true,t.id);nav(t.cat);
  const rec=store.get("recent",[]).filter(x=>x!==id);rec.unshift(id);store.set("recent",rec.slice(0,8));
  const app=$("#app");app.innerHTML=`<p class="desc">${esc(t.desc)}</p><div id="tb"></div>`;const tb=$("#tb");
  if(t.custom){t.render(tb);return}
  let mode=store.get("m_"+id,t.modes?t.modes[0][0]:"");let sv;
  const draw=()=>{const fields=t.fields?t.fields(mode):[];sv=store.get("v_"+id+"_"+mode,{});
    tb.innerHTML=`${t.modes?`<div class="seg">${t.modes.map(m=>`<button data-m="${m[0]}" class="${m[0]===mode?"on":""}">${m[1]}</button>`).join("")}</div>`:""}
     ${fields.length?`<div class="card">${form(fields,sv)}</div>`:""}<div id="out"></div>`;
    tb.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{mode=b.dataset.m;store.set("m_"+id,mode);draw()});
    const run=()=>{const v=readVals(tb,fields);let bad=fields.some(f=>!f.opts&&!f.t&&!isFinite(v[f.k]));Object.assign(sv,v);store.set("v_"+id+"_"+mode,sv);
      const out=$("#out");if(bad){out.innerHTML=note("Barcha maydonlarga son kiriting.","warn");return}
      let r;try{r=t.calc(v,mode)}catch(e){out.innerHTML=note("Hisoblashda xato: "+esc(e.message),"warn");return}
      if(typeof r==="string")r={html:r};out.innerHTML=r.html+(r.mesh?view3dHTML():"");if(r.mesh){const cv=out.querySelector("canvas.v3d");requestAnimationFrame(()=>view3d(cv,r.mesh))}if(r.shape)bindShape(out,r.name||t.id,r.shape);if(r.after)r.after(out)};
    tb.querySelectorAll("input,select").forEach(e=>{e.oninput=run;e.onchange=run});run()};
  draw()}

function go(h){location.hash=h}
function route(){const h=location.hash.replace(/^#/,"");window.scrollTo(0,0);
  if(h.startsWith("t/"))viewTool(h.slice(2));else if(h.startsWith("c/"))viewCat(h.slice(2));else viewHome()}
$("#back").onclick=()=>history.length>1?history.back():go("");
window.addEventListener("hashchange",route);
document.addEventListener("backbutton",e=>{e.preventDefault();if(location.hash&&location.hash!=="#")history.back();else if(window.Capacitor?.Plugins?.App)window.Capacitor.Plugins.App.exitApp()});
route();
