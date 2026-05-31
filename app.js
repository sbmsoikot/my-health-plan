/* ===== Storage ===== */
const KEY = 'hdp_v1';
const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAYS_LONG  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

let DB = load();
let selDate = todayKey();      // date shown on Meals view
let openMeals = {};            // expanded meal cards (per render)

function load(){
  try { const raw = localStorage.getItem(KEY); if(raw) return JSON.parse(raw); } catch(e){}
  return { theme:'light', days:{}, markers:{}, weights:[] };
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){ toast('Storage full — export your data'); } }

/* ===== Date helpers ===== */
function todayKey(d){ d = d || new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function parseKey(k){ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); }
function planIndex(k){ return (parseKey(k).getDay()+6)%7; }   // Mon=0 … Sun=6
function shiftDay(k,n){ const d=parseKey(k); d.setDate(d.getDate()+n); return todayKey(d); }
function prettyDate(k){
  const d=parseKey(k), t=todayKey();
  const opts={weekday:'long',month:'short',day:'numeric'};
  let label=d.toLocaleDateString(undefined,opts);
  if(k===t) label='Today · '+label;
  else if(k===shiftDay(t,-1)) label='Yesterday · '+label;
  else if(k===shiftDay(t,1)) label='Tomorrow · '+label;
  return label;
}

/* ===== Day state ===== */
function dayState(k){
  if(!DB.days[k]) DB.days[k]={ meals:{}, habits:{}, activity:false, water:0, custom:[] };
  const s=DB.days[k];
  s.meals=s.meals||{}; s.habits=s.habits||{}; s.custom=s.custom||[]; if(s.water==null)s.water=0;
  return s;
}

/* ===== Nutrition math ===== */
function nutritionFor(k){
  const s=dayState(k), plan=PLAN[planIndex(k)];
  let planCal=0,planP=0,planF=0, customCal=0,customP=0,customF=0, mealsDone=0;
  plan.meals.forEach((m,i)=>{ if(s.meals[i]){ planCal+=m.cal; planP+=m.p; planF+=m.f; if(m.cal>0)mealsDone++; } });
  s.custom.forEach(c=>{ customCal+=(+c.cal||0); customP+=(+c.p||0); customF+=(+c.f||0); });
  const totalMeals=plan.meals.filter(m=>m.cal>0).length;
  return {
    planCal, customCal, cal:planCal+customCal,
    protein:planP+customP, fibre:planF+customF,
    mealsDone, totalMeals, water:s.water, activity:s.activity,
    habitsDone:HABITS.filter(h=>s.habits[h.id]).length
  };
}

/* ===== Render: shared bits ===== */
function bar(pct,color){ return `<div class="bar"><i style="width:${Math.min(100,pct)}%;background:${color}"></i></div>`; }
function progRow(label,val,target,unit,color){
  const pct=target?Math.round(val/target*100):0;
  return `<div class="prog"><div class="prog-head"><span>${label}</span><span class="v">${val}${unit} / ${target}${unit}</span></div>${bar(pct,color)}</div>`;
}

/* ===== Dashboard ===== */
function renderDashboard(){
  const k=todayKey(), n=nutritionFor(k);
  const remaining=TARGETS.cal-n.cal, over=remaining<0;
  const pct=Math.round(n.cal/TARGETS.cal*100);
  const w=latestWeight(), lost=(PROFILE.startWeight-w).toFixed(1);
  const wPct=Math.max(0,Math.min(100,Math.round((PROFILE.startWeight-w)/(PROFILE.startWeight-PROFILE.targetWeightHigh)*100)));

  let html=`
  <h1 class="page-title">${greeting()}</h1>
  <p class="page-sub">${prettyDate(k)} · stay on plan</p>

  <div class="card">
    <div class="cal-hero">
      <div class="ring ${over?'over':''}" style="--pct:${Math.min(100,pct)}">
        <div class="ring-inner">
          <div class="ring-num">${n.cal}</div>
          <div class="ring-lbl">of ${TARGETS.cal} kcal</div>
        </div>
      </div>
      <div class="cal-side">
        <h3>Today's calorie report</h3>
        <div class="cal-line"><span>Plan meals ticked</span><b>${n.planCal} kcal</b></div>
        <div class="cal-line"><span>Foods you added</span><b>${n.customCal} kcal</b></div>
        <div class="cal-line total"><span>Total consumed</span><b>${n.cal} kcal</b></div>
        <div style="margin-top:9px">
          <span class="pill ${over?'over':'good'}">${over?`Over by ${-remaining} kcal`:`${remaining} kcal remaining`}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-2" style="margin-top:12px">
    ${tile('🍽',`${n.mealsDone}/${n.totalMeals}`,'Meals')}
    ${tile('✓',`${n.habitsDone}/${HABITS.length}`,'Habits')}
    ${tile('💧',`${(n.water*0.25).toFixed(2)}L`,'Water')}
    ${tile(n.activity?'✅':'🏃', n.activity?'Done':'Pending','Activity')}
  </div>

  <div class="card" style="margin-top:12px">
    <div class="sec-title" style="margin:0 0 10px">Macros (estimated)</div>
    ${progRow('Protein',n.protein,TARGETS.protein,'g','#185FA5')}
    ${progRow('Fibre',n.fibre,TARGETS.fibre,'g','#639922')}
    ${progRow('Water',+(n.water*0.25).toFixed(2),PROFILE.waterTargetL,'L','#378ADD')}
  </div>

  <div class="card" style="margin-top:12px">
    <div class="sec-title" style="margin:0 0 8px">Weight progress</div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
      <div><span style="font-size:26px;font-weight:700">${w}</span> <span style="color:var(--text-2)">kg</span></div>
      <div style="font-size:13px;color:var(--text-2)">Target ${PROFILE.targetWeightLow}–${PROFILE.targetWeightHigh} kg · ${lost>0?`−${lost} kg so far`:'just started'}</div>
    </div>
    ${bar(wPct,'#1D9E75')}
    <button class="btn sm block" style="margin-top:12px" onclick="openWeightModal()">Log today's weight</button>
  </div>

  <div class="card" style="margin-top:12px">
    <div class="sec-title" style="margin:0 0 4px">Blood markers</div>
    ${MARKERS.map(m=>{ const lr=latestMarker(m.id); const cls=markerClass(m,lr.value);
      return `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:13.5px">${m.name}</span>
        <span><b class="m-cur ${cls}">${lr.value} ${m.unit}</b> <span class="m-tgt">≤ ${m.target}</span></span></div>`; }).join('')}
    <button class="btn sm block" style="margin-top:12px" onclick="switchView('markers')">View &amp; log markers →</button>
  </div>

  <button class="btn primary block" style="margin-top:16px" onclick="openFoodModal()">＋ Add a food you ate</button>
  `;
  document.getElementById('view-dashboard').innerHTML=html;
}
function tile(ico,val,lbl){ return `<div class="tile"><div class="tile-top"><span class="tile-ico">${ico}</span></div><div class="tile-val">${val}</div><div class="tile-lbl">${lbl}</div></div>`; }
function greeting(){ const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; }

/* ===== Meals view ===== */
function renderMeals(){
  const k=selDate, idx=planIndex(k), plan=PLAN[idx], s=dayState(k), n=nutritionFor(k);
  let html=`
  <h1 class="page-title">Meal plan</h1>
  <p class="page-sub">Tick what you eat — it feeds your calorie report</p>

  <div class="daynav">
    <button class="arrow" onclick="navMeal(-1)">‹</button>
    <div class="dlabel"><div class="d1">${DAYS_LONG[idx]}</div><div class="d2">${prettyDate(k)}</div></div>
    <button class="arrow" onclick="navMeal(1)">›</button>
  </div>
  <div class="day-strip">${[-3,-2,-1,0,1,2,3].map(off=>{const kk=shiftDay(todayKey(),off);
      return `<button class="chip ${kk===k?'active':''} ${kk===todayKey()?'today':''}" onclick="setMealDate('${kk}')">${chipLabel(kk)}</button>`;}).join('')}</div>

  <div class="card" style="margin-bottom:14px;padding:13px 16px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:12px;color:var(--text-2)">Consumed this day</div>
        <div style="font-size:22px;font-weight:700">${n.cal} <span style="font-size:14px;color:var(--text-2)">/ ${TARGETS.cal} kcal</span></div></div>
      <span class="pill ${n.cal>TARGETS.cal?'over':'good'}">${n.cal>TARGETS.cal?`+${n.cal-TARGETS.cal}`:`${TARGETS.cal-n.cal} left`}</span>
    </div>
  </div>

  <div class="theme-banner">📌 ${plan.theme}</div>
  ${plan.meals.map((m,i)=>mealCard(m,i,s.meals[i])).join('')}

  <div class="sec-title"><span class="ico">➕</span> Foods you added today</div>
  <div class="card">
    ${s.custom.length? s.custom.map(c=>`
      <div class="cfood">
        <div class="cf-main"><div class="cf-name">${esc(c.name)}${c.p?` · ${c.p}g P`:''}</div>
          ${c.recipe&&c.recipe.length>1?`<div class="cf-recipe">${esc(c.recipe.join(', '))}</div>`:''}</div>
        <span class="cf-cal">${c.cal} kcal</span>
        <button class="cf-del" onclick="delCustom('${k}','${c.id}')">✕</button></div>`).join('')
      : `<div class="empty">Nothing added yet. Tap ＋ to log extra food.</div>`}
    <button class="btn sm block" style="margin-top:12px" onclick="openFoodModal()">＋ Add food</button>
  </div>`;
  document.getElementById('view-meals').innerHTML=html;
}
function chipLabel(k){ const d=parseKey(k); return k===todayKey()?'Today':d.toLocaleDateString(undefined,{weekday:'short',day:'numeric'}); }
function mealCard(m,i,done){
  const open=openMeals[i];
  return `<div class="meal ${done?'done':''} ${open?'open':''}">
    <div class="meal-head" onclick="toggleOpen(${i})">
      <div class="meal-emoji" style="background:${m.color}">${m.icon}</div>
      <div class="meal-meta">
        <div class="meal-name">${m.name}</div>
        <div class="meal-sub"><span>${m.time}</span>${m.cal>0?`<span class="kcal">· ${m.cal} kcal</span>`:''}</div>
      </div>
      <button class="check ${done?'on':''}" onclick="event.stopPropagation();toggleMeal(${i})">${done?'✓':''}</button>
    </div>
    <div class="meal-body"><ul>${m.items.map(it=>`<li>${esc(it)}</li>`).join('')}</ul>${m.note?`<div class="note">${m.note}</div>`:''}</div>
  </div>`;
}

/* ===== Activity view ===== */
function renderActivity(){
  const k=todayKey(), idx=planIndex(k), a=ACTIVITIES[idx], s=dayState(k);
  let html=`
  <h1 class="page-title">Activity & lifestyle</h1>
  <p class="page-sub">${prettyDate(k)}</p>

  <div class="card">
    <div style="display:flex;align-items:center;gap:13px">
      <div class="meal-emoji" style="background:var(--green-soft);width:46px;height:46px;font-size:22px">${a.icon}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:650">${a.title}</div>
        <div style="font-size:12px;color:var(--text-2)">Today's prescribed activity</div></div>
      <button class="check ${s.activity?'on':''}" style="width:32px;height:32px" onclick="toggleActivity()">${s.activity?'✓':''}</button>
    </div>
    <p style="font-size:13px;color:var(--text-2);margin-top:11px">${a.desc}</p>
  </div>

  <div class="sec-title"><span class="ico">📅</span> Weekly exercise schedule</div>
  <div class="card">
    ${ACTIVITIES.map((x,i)=>`<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="width:34px;font-weight:600;font-size:13px;color:${i===idx?'var(--green)':'var(--text-2)'}">${DAYS_SHORT[i]}</span>
      <span style="font-size:13px">${x.title}</span></div>`).join('')}
  </div>

  <div class="sec-title"><span class="ico">🌙</span> Sleep protocol</div>
  <div class="grid grid-auto">${LIFESTYLE.sleep.map(lsCard).join('')}</div>
  <div class="sec-title"><span class="ico">💧</span> Hydration & supplements</div>
  <div class="grid grid-auto">${LIFESTYLE.hydration.map(lsCard).join('')}</div>
  <div class="sec-title"><span class="ico">🧠</span> Stress & mental wellness</div>
  <div class="grid grid-auto">${LIFESTYLE.stress.map(lsCard).join('')}</div>

  <div class="sec-title"><span class="ico">🚫</span> Foods to strictly avoid</div>
  <div class="card"><div class="pillwrap">${LIFESTYLE.avoid.map(x=>`<span class="tagpill avoid">${x}</span>`).join('')}</div></div>
  <div class="sec-title"><span class="ico">✅</span> Best foods for your conditions</div>
  <div class="card"><div class="pillwrap">${LIFESTYLE.good.map(x=>`<span class="tagpill good">${x}</span>`).join('')}</div></div>`;
  document.getElementById('view-activity').innerHTML=html;
}
function lsCard(c){ return `<div class="card" style="padding:13px 14px"><div style="font-size:13.5px;font-weight:600;margin-bottom:5px">${c.t}</div><p style="font-size:12px;color:var(--text-2);line-height:1.6">${c.d}</p></div>`; }

/* ===== Tracker view ===== */
function renderTracker(){
  const k=todayKey(), s=dayState(k), n=nutritionFor(k);
  let html=`
  <h1 class="page-title">Daily tracker</h1>
  <p class="page-sub">${prettyDate(k)}</p>

  <div class="card">
    <div class="sec-title" style="margin:0 0 6px">Weekly meal completion</div>
    <div class="weekrow">${[-6,-5,-4,-3,-2,-1,0].map(off=>{
      const kk=shiftDay(k,off), nn=nutritionFor(kk), d=parseKey(kk);
      const cls=nn.mealsDone===0?'':(nn.mealsDone>=nn.totalMeals?'full':'part');
      return `<div class="wday"><div class="wcirc ${cls}">${DAYS_SHORT[planIndex(kk)]}<small style="color:inherit">${nn.mealsDone}/${nn.totalMeals}</small></div></div>`;
    }).join('')}</div>
  </div>

  <div class="card" style="margin-top:12px">
    <div class="sec-title" style="margin:0 0 4px">Today's habits</div>
    ${HABITS.map(h=>`<div class="checkrow ${s.habits[h.id]?'on':''}">
      <button class="check ${s.habits[h.id]?'on':''}" onclick="toggleHabit('${h.id}')">${s.habits[h.id]?'✓':''}</button>
      <span class="lbl">${h.label}</span></div>`).join('')}
    <div style="margin-top:10px;font-size:13px;color:var(--text-2)">${n.habitsDone}/${HABITS.length} done today (${Math.round(n.habitsDone/HABITS.length*100)}%)</div>
  </div>

  <div class="card" style="margin-top:12px">
    <div class="sec-title" style="margin:0 0 4px">Water intake</div>
    <div style="font-size:13px;color:var(--text-2)">${(s.water*0.25).toFixed(2)} L of ${PROFILE.waterTargetL} L · 1 glass = 250 ml</div>
    <div class="water-ctrl">
      <button class="water-btn" onclick="water(-1)">−</button>
      <div class="water-glasses">${Array.from({length:TARGETS.waterGlasses}).map((_,i)=>`<div class="glass ${i<s.water?'full':''}"></div>`).join('')}</div>
      <button class="water-btn" onclick="water(1)">＋</button>
    </div>
  </div>

  <button class="btn block" style="margin-top:14px" onclick="resetDay()">Reset today's ticks</button>`;
  document.getElementById('view-tracker').innerHTML=html;
}

/* ===== Markers view ===== */
function renderMarkers(){
  let html=`
  <h1 class="page-title">Blood markers</h1>
  <p class="page-sub">Current vs target · diet changes show in 8–12 weeks</p>
  <div class="card">
    ${MARKERS.map(m=>{ const lr=latestMarker(m.id), cls=markerClass(m,lr.value), arrow=lr.value>m.target?'↑':'✓';
      return `<div class="marker">
        <div class="m-main"><div class="m-name">${m.name}</div><div class="m-note">${m.note}</div>
          ${lr.date?`<div style="font-size:11px;color:var(--text-3);margin-top:3px">Last logged ${lr.date}${lr.value!==m.baseline?` · baseline ${m.baseline}`:''}</div>`:''}</div>
        <div class="m-vals"><div class="m-cur ${cls}">${lr.value} ${m.unit} ${arrow}</div><div class="m-tgt">Target ≤ ${m.target}</div></div>
      </div>`; }).join('')}
    <button class="btn primary block" style="margin-top:14px" onclick="openMarkerModal()">＋ Log new lab results</button>
  </div>

  <div class="sec-title"><span class="ico">📅</span> Suggested lab re-test schedule</div>
  <div class="grid grid-auto">${LIFESTYLE.retest.map(lsCard).join('')}</div>`;
  document.getElementById('view-markers').innerHTML=html;
}
function markerClass(m,v){ if(v<=m.target)return 'ok'; if(v<=m.target*1.5)return 'mid'; return 'hi'; }
function latestMarker(id){ const arr=DB.markers[id]; const m=MARKERS.find(x=>x.id===id);
  if(arr&&arr.length){ const last=arr[arr.length-1]; return {value:last.value,date:last.date}; }
  return {value:m.baseline,date:null}; }
function latestWeight(){ if(DB.weights.length) return DB.weights[DB.weights.length-1].kg; return PROFILE.startWeight; }

/* ===== Actions ===== */
function toggleMeal(i){ const s=dayState(selDate); s.meals[i]=!s.meals[i]; save(); renderMeals(); }
function toggleOpen(i){ openMeals[i]=!openMeals[i]; renderMeals(); }
function navMeal(n){ selDate=shiftDay(selDate,n); openMeals={}; renderMeals(); }
function setMealDate(k){ selDate=k; openMeals={}; renderMeals(); }
function delCustom(k,id){ const s=dayState(k); s.custom=s.custom.filter(c=>c.id!==id); save(); renderMeals(); }
function toggleActivity(){ const s=dayState(todayKey()); s.activity=!s.activity; save(); renderActivity(); }
function toggleHabit(id){ const s=dayState(todayKey()); s.habits[id]=!s.habits[id]; save(); renderTracker(); }
function water(n){ const s=dayState(todayKey()); s.water=Math.max(0,Math.min(TARGETS.waterGlasses,s.water+n)); save(); renderTracker(); }
function resetDay(){ const k=todayKey(); DB.days[k]={meals:{},habits:{},activity:false,water:0,custom:dayState(k).custom}; save(); renderTracker(); toast('Today\'s ticks reset'); }

/* ===== Modals ===== */
function showModal(html){ const host=document.getElementById('modalHost'); document.getElementById('modalBox').innerHTML=html; host.hidden=false; }
function closeModal(){ document.getElementById('modalHost').hidden=true; }
document.getElementById('modalBackdrop').onclick=closeModal;

/* ---- Food builder: search dataset, add items + quantities, auto-total ---- */
let builder = [];            // [{lid, fi, mode:'serving'|'g', qty}] or manual {lid, manual:true, name, cal, p, f}
let blid = 0;
const r0 = x => Math.round(x);
const r1 = x => Math.round(x*10)/10;

function lineNutrition(L){
  if(L.manual) return {cal:r0(L.cal), p:r1(L.p), f:r1(L.f), grams:null};
  const food=FOODS[L.fi];
  const grams = L.mode==='g' ? (+L.qty||0) : (+L.qty||0)*food.sg;
  const m=grams/100;
  return {cal:r0(food.cal*m), p:r1(food.p*m), f:r1(food.f*m), grams:r0(grams)};
}
function builderTotals(){
  return builder.reduce((t,L)=>{ const n=lineNutrition(L); t.cal+=n.cal; t.p+=n.p; t.f+=n.f; return t; },{cal:0,p:0,f:0});
}

function openFoodModal(){
  builder=[];
  showModal(`<h2>Add food / meal</h2><p class="msub">Name your meal, then add its ingredients from the list — calories, protein &amp; fibre are calculated for you.</p>
    <label class="field"><span class="l">Meal / food name</span><input id="f-mealname" placeholder="e.g. Kacchi, lunch plate, banana" autocomplete="off" oninput="updateTotals()"></label>
    <label class="field" style="margin-bottom:8px"><span class="l">Add ingredients</span>
      <input id="f-search" placeholder="Search ingredients… rice, mutton, oil, ghee" oninput="updateResults(this.value)" autocomplete="off"></label>
    <div id="f-results" class="f-results"></div>
    <div id="f-lines"></div>
    <div id="f-totals" class="f-totals"></div>
    <details class="f-manual"><summary>Can't find it? Add manually</summary>
      <div style="margin-top:10px">
        <label class="field"><span class="l">Food name</span><input id="fm-name" placeholder="e.g. Restaurant biryani" autocomplete="off"></label>
        <div class="row-3">
          <label class="field"><span class="l">Calories *</span><input id="fm-cal" type="number" inputmode="numeric" placeholder="kcal"></label>
          <label class="field"><span class="l">Protein</span><input id="fm-p" type="number" inputmode="numeric" placeholder="g"></label>
          <label class="field"><span class="l">Fibre</span><input id="fm-f" type="number" inputmode="numeric" placeholder="g"></label>
        </div>
        <button class="btn sm block" onclick="addManualLine()">Add this item to the list</button>
      </div>
    </details>
    <div class="row-2" style="margin-top:14px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" id="f-commit" onclick="commitFood()">Add to today</button></div>`);
  renderLines();
  updateResults('');
  setTimeout(()=>document.getElementById('f-mealname').focus(),80);
}
function ingredientName(L){ return L.manual ? L.name : FOODS[L.fi].n; }

function updateResults(q){
  const box=document.getElementById('f-results'); if(!box) return;
  q=(q||'').trim().toLowerCase();
  if(!q){ box.innerHTML=`<div class="f-hint">Start typing to search ${FOODS.length} foods…</div>`; return; }
  const tokens=q.split(/\s+/).filter(Boolean);
  const scored=[];
  FOODS.forEach((f,i)=>{ const name=f.n.toLowerCase(); const hay=name+' '+(f.alt||'');
    if(!tokens.every(t=>hay.includes(t))) return;           // every word must appear somewhere
    let s;
    if(name.startsWith(q)) s=0;                              // exact prefix on the name
    else if(name.includes(q)) s=1;                           // phrase appears in name
    else if(tokens.every(t=>name.includes(t))) s=2;          // all words in name (any order)
    else s=3;                                                // matched via alias
    scored.push({f,i,s});
  });
  scored.sort((a,b)=> a.s-b.s || a.f.n.length-b.f.n.length || a.f.n.localeCompare(b.f.n));
  const hits=scored.slice(0,10);
  if(!hits.length){ box.innerHTML=`<div class="f-hint">No match. Use “Add manually” below.</div>`; return; }
  box.innerHTML=hits.map(({f,i})=>{ const per=r0(f.cal*f.sg/100);
    return `<button class="f-res" onclick="addLine(${i})"><span class="fr-name">${esc(f.n)}</span><span class="fr-cal">${per} kcal / ${esc(f.su)}</span></button>`; }).join('');
}

function addLine(fi){
  builder.push({lid:'L'+(++blid), fi, mode:'serving', qty:1});
  const s=document.getElementById('f-search'); if(s){ s.value=''; s.focus(); }
  updateResults(''); renderLines();
}
function addManualLine(){
  const name=document.getElementById('fm-name').value.trim();
  const cal=parseFloat(document.getElementById('fm-cal').value);
  if(!name){ toast('Enter a food name'); return; }
  if(isNaN(cal)){ toast('Enter calories'); return; }
  builder.push({lid:'L'+(++blid), manual:true, name, cal, p:parseFloat(document.getElementById('fm-p').value)||0, f:parseFloat(document.getElementById('fm-f').value)||0});
  document.getElementById('fm-name').value=''; document.getElementById('fm-cal').value=''; document.getElementById('fm-p').value=''; document.getElementById('fm-f').value='';
  toast(`Added ${name}`); renderLines();
}

function renderLines(){
  const box=document.getElementById('f-lines'); if(!box) return;
  if(!builder.length){ box.innerHTML=`<div class="empty" style="padding:14px 0">No ingredients yet. Search above to add them.</div>`; updateTotals(); return; }
  box.innerHTML=builder.map(L=>{
    const n=lineNutrition(L);
    const ctrl = L.manual
      ? `<span class="fl-unit">manual</span>`
      : `<select class="fl-sel" onchange="setMode('${L.lid}',this.value)">
           <option value="serving" ${L.mode==='serving'?'selected':''}>${esc(FOODS[L.fi].su)} (${FOODS[L.fi].sg}g)</option>
           <option value="g" ${L.mode==='g'?'selected':''}>grams</option>
         </select>`;
    const qtyStep = (!L.manual && L.mode==='g') ? '10' : '0.25';
    return `<div class="f-line">
      <div class="fl-main"><div class="fl-name">${esc(L.manual?L.name:FOODS[L.fi].n)}</div>
        <div class="fl-calc" id="calc-${L.lid}">${n.cal} kcal · ${n.p}g P · ${n.f}g fibre${n.grams!=null?` · ${n.grams}g`:''}</div></div>
      <div class="fl-ctrl">
        ${L.manual?'':`<input class="fl-qty" id="qty-${L.lid}" type="number" inputmode="decimal" min="0" step="${qtyStep}" value="${L.qty}" oninput="setQty('${L.lid}',this.value)">`}
        ${ctrl}
        <button class="fl-del" onclick="removeLine('${L.lid}')" title="Remove">✕</button>
      </div>
    </div>`;
  }).join('');
  updateTotals();
}
function refreshLineCalc(lid){ const L=builder.find(x=>x.lid===lid); const el=document.getElementById('calc-'+lid); if(L&&el){ const n=lineNutrition(L); el.textContent=`${n.cal} kcal · ${n.p}g P · ${n.f}g fibre${n.grams!=null?` · ${n.grams}g`:''}`; } }
function updateTotals(){ const box=document.getElementById('f-totals'); if(!box) return; const t=builderTotals();
  const nameEl=document.getElementById('f-mealname'); const nm=nameEl?nameEl.value.trim():'';
  box.innerHTML=`<div class="ft-row"><span>${nm?esc(nm)+' total':'Meal total'}</span><b>${t.cal} kcal</b></div><div class="ft-sub">${r1(t.p)} g protein · ${r1(t.f)} g fibre · ${builder.length} ingredient(s)</div>`; }
function setQty(lid,val){ const L=builder.find(x=>x.lid===lid); if(L){ L.qty=parseFloat(val)||0; refreshLineCalc(lid); updateTotals(); } }
function setMode(lid,mode){ const L=builder.find(x=>x.lid===lid); if(!L)return; L.mode=mode; L.qty = mode==='g'?FOODS[L.fi].sg:1; const q=document.getElementById('qty-'+lid); if(q){ q.value=L.qty; q.step= mode==='g'?'10':'0.25'; } refreshLineCalc(lid); updateTotals(); }
function removeLine(lid){ builder=builder.filter(x=>x.lid!==lid); renderLines(); }

function commitFood(){
  if(!builder.length){ toast('Add at least one ingredient'); return; }
  let name=document.getElementById('f-mealname').value.trim();
  if(!name) name = builder.length===1 ? ingredientName(builder[0]) : '';
  if(!name){ toast('Name your meal first'); document.getElementById('f-mealname').focus(); return; }
  const t=builderTotals();
  const recipe=builder.map(L=>{ const f=L.manual?null:FOODS[L.fi];
    return L.manual?L.name:`${f.n} (${L.mode==='g'?lineNutrition(L).grams+'g':L.qty+' '+f.su})`; });
  const s=dayState(todayKey());
  s.custom.push({id:'c'+Date.now(), name, cal:r0(t.cal), p:r1(t.p), f:r1(t.f), recipe});
  save(); closeModal(); toast(`Added ${name}`); refreshAll();
}

function openWeightModal(){
  showModal(`<h2>Log your weight</h2><p class="msub">Track progress toward ${PROFILE.targetWeightLow}–${PROFILE.targetWeightHigh} kg.</p>
    <label class="field"><span class="l">Weight (kg)</span><input id="w-kg" type="number" inputmode="decimal" step="0.1" value="${latestWeight()}"></label>
    <div class="row-2"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveWeight()">Save</button></div>`);
  setTimeout(()=>document.getElementById('w-kg').select(),80);
}
function saveWeight(){
  const kg=parseFloat(document.getElementById('w-kg').value);
  if(isNaN(kg)){ toast('Enter a weight'); return; }
  const k=todayKey(); DB.weights=DB.weights.filter(w=>w.date!==k); DB.weights.push({date:k,kg}); DB.weights.sort((a,b)=>a.date<b.date?-1:1);
  save(); closeModal(); toast('Weight logged'); renderDashboard();
}

function openMarkerModal(){
  showModal(`<h2>Log new lab results</h2><p class="msub">Leave a field blank to keep its current value. Date defaults to today.</p>
    <label class="field"><span class="l">Date</span><input id="m-date" type="date" value="${todayKey()}"></label>
    ${MARKERS.map(m=>`<label class="field"><span class="l">${m.name} (${m.unit}) · target ≤ ${m.target}</span>
      <input id="m-${m.id}" type="number" inputmode="decimal" step="0.01" placeholder="current ${latestMarker(m.id).value}"></label>`).join('')}
    <div class="row-2"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveMarkers()">Save results</button></div>`);
}
function saveMarkers(){
  const date=document.getElementById('m-date').value||todayKey(); let any=false;
  MARKERS.forEach(m=>{ const v=parseFloat(document.getElementById('m-'+m.id).value);
    if(!isNaN(v)){ DB.markers[m.id]=DB.markers[m.id]||[]; DB.markers[m.id]=DB.markers[m.id].filter(r=>r.date!==date); DB.markers[m.id].push({date,value:v}); DB.markers[m.id].sort((a,b)=>a.date<b.date?-1:1); any=true; } });
  if(!any){ toast('Enter at least one value'); return; }
  save(); closeModal(); toast('Lab results saved'); renderMarkers();
}

/* ===== Data / settings menu ===== */
function openMenu(){
  const days=Object.keys(DB.days).length;
  showModal(`<h2>Data & settings</h2><p class="msub">${days} day(s) tracked · saved on this device.</p>
    <button class="btn block" style="margin-bottom:10px" onclick="exportData()">⬇ Export my data (backup)</button>
    <button class="btn block" style="margin-bottom:10px" onclick="document.getElementById('importFile').click()">⬆ Import data from file</button>
    <input id="importFile" type="file" accept="application/json" style="display:none" onchange="importData(event)">
    <button class="btn block" style="margin-bottom:10px" onclick="toggleTheme();closeModal()">🌗 Switch to ${DB.theme==='dark'?'light':'dark'} theme</button>
    <button class="btn block" style="margin-bottom:10px" onclick="lockApp()">🔒 Lock &amp; forget passphrase</button>
    <button class="btn danger block" onclick="wipeData()">🗑 Erase all my data</button>
    <p style="font-size:11.5px;color:var(--text-3);margin-top:14px;line-height:1.6">Tip: to use this on another device, Export here and Import there. To install as an app, open in your browser and choose “Add to Home Screen”.</p>`);
}
function exportData(){
  const blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`health-plan-backup-${todayKey()}.json`; a.click(); toast('Backup downloaded');
}
function importData(e){
  const file=e.target.files[0]; if(!file)return;
  const r=new FileReader();
  r.onload=()=>{ try{ const obj=JSON.parse(r.result); if(!obj.days) throw 0; DB=Object.assign({theme:'light',days:{},markers:{},weights:[]},obj); save(); applyTheme(); closeModal(); refreshAll(); toast('Data imported'); }catch(_){ toast('Invalid backup file'); } };
  r.readAsText(file);
}
function wipeData(){ if(confirm('Erase ALL tracked data on this device? This cannot be undone.')){ DB={theme:DB.theme,days:{},markers:{},weights:[]}; save(); closeModal(); refreshAll(); toast('All data erased'); } }

/* ===== Theme ===== */
function applyTheme(){ document.documentElement.setAttribute('data-theme',DB.theme||'light'); document.getElementById('themeBtn').textContent=DB.theme==='dark'?'☀️':'🌙'; }
function toggleTheme(){ DB.theme=DB.theme==='dark'?'light':'dark'; save(); applyTheme(); }

/* ===== Navigation ===== */
function switchView(v){
  document.querySelectorAll('.view').forEach(s=>s.classList.toggle('active',s.id==='view-'+v));
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  window.scrollTo({top:0,behavior:'instant'});
  ({dashboard:renderDashboard,meals:renderMeals,activity:renderActivity,tracker:renderTracker,markers:renderMarkers}[v])();
}
function refreshAll(){ const active=document.querySelector('.navbtn.active').dataset.view; switchView(active); }

/* ===== Utils ===== */
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
let toastT;
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2200); }

/* ===== Wire up ===== */
document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
document.getElementById('fabAdd').onclick=openFoodModal;
document.getElementById('themeBtn').onclick=toggleTheme;
document.getElementById('menuBtn').onclick=openMenu;

/* ===== Passphrase lock (client-side decryption) =====
   The plan ships as plan.enc.json (AES-256-GCM + PBKDF2-SHA256). The plaintext
   never leaves this device — decryption happens here in the browser with the
   passphrase the user typed. Formats match encrypt.js exactly. */
const PASS_KEY = 'hdp_pass';
let PLAN_BLOB = null;
let booted = false;

function b64ToBuf(b64){ const bin=atob(b64); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u; }

async function deriveKey(pass, salt, iter){
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:iter, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, ['decrypt']);
}

async function fetchBlob(){
  if(PLAN_BLOB) return PLAN_BLOB;
  const res = await fetch('plan.enc.json', {cache:'no-store'});
  if(!res.ok) throw new Error('Could not load plan data.');
  PLAN_BLOB = await res.json();
  return PLAN_BLOB;
}

async function decryptPlan(blob, pass){
  const key = await deriveKey(pass, b64ToBuf(blob.salt), blob.iter || 200000);
  const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv:b64ToBuf(blob.iv)}, key, b64ToBuf(blob.ct));
  return JSON.parse(new TextDecoder().decode(plain));   // throws if passphrase is wrong
}

function applyPlan(d){
  window.PROFILE=d.profile; window.TARGETS=d.targets; window.PLAN=d.plan;
  window.ACTIVITIES=d.activities; window.HABITS=d.habits; window.MARKERS=d.markers; window.LIFESTYLE=d.lifestyle;
}

function bootApp(){ if(booted) return; booted=true; renderDashboard(); }

function showLock(){ document.body.classList.add('locked'); document.getElementById('lockScreen').hidden=false; }
function hideLock(){ document.body.classList.remove('locked'); document.getElementById('lockScreen').hidden=true; }

async function tryUnlock(pass, remember){
  const blob = await fetchBlob();
  applyPlan(await decryptPlan(blob, pass));
  if(remember){ try{ localStorage.setItem(PASS_KEY, pass); }catch(_){} }
  hideLock();
  bootApp();
}

function lockApp(){ try{ localStorage.removeItem(PASS_KEY); }catch(_){} location.reload(); }

async function initLock(){
  applyTheme();
  const form=document.getElementById('lockForm');
  form.onsubmit=async e=>{
    e.preventDefault();
    const pass=document.getElementById('lockPass').value;
    const remember=document.getElementById('lockRemember').checked;
    const err=document.getElementById('lockErr'), btn=document.getElementById('lockBtn');
    if(!pass) return;
    err.hidden=true; btn.disabled=true; btn.textContent='Unlocking…';
    try{ await tryUnlock(pass, remember); }
    catch(_){ err.textContent='Wrong passphrase — please try again.'; err.hidden=false; const p=document.getElementById('lockPass'); p.select(); }
    btn.disabled=false; btn.textContent='Unlock';
  };
  let saved=null; try{ saved=localStorage.getItem(PASS_KEY); }catch(_){}
  if(saved){
    try{ await tryUnlock(saved, false); return; }
    catch(_){ try{ localStorage.removeItem(PASS_KEY); }catch(__){} }
  }
  showLock();
  document.getElementById('lockPass').focus();
}
initLock();

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
