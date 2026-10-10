// Nutrition (Life app). Loads data/index.json via fetch; falls back to window.NUTRITION_DATA (data.js) under file://.
(function(){
var KEY='life.theme',ORDER=['system','porcelain','midnight'],LBL={system:'System',porcelain:'Porcelain',midnight:'Midnight'};
function rt(){try{return localStorage.getItem(KEY)||'system'}catch(e){return 'system'}}
function at(t){document.documentElement.setAttribute('data-theme',t)}at(rt());
var D={days:{}},cur=null,tab='day';
var MIC=[['iron_mg','Iron','mg'],['omega3_g','Omega-3','g'],['vit_e_mg','Vit E','mg'],['vit_c_mg','Vit C','mg'],['vit_a_ug','Vit A','µg'],['calcium_mg','Calcium','mg'],['potassium_mg','Potassium','mg'],['sodium_mg','Sodium','mg'],['magnesium_mg','Magnesium','mg'],['selenium_ug','Selenium','µg']];
var PET=/mineral oil|paraffinum liquidum|petrolatum|petroleum/i,FRA=/parfum|fragrance/i;
function $(s){return document.querySelector(s)}
function h(t,a,c){var e=document.createElement(t);if(a)for(var k in a)k==='text'?e.textContent=a[k]:e.setAttribute(k,a[k]);(c||[]).forEach(function(x){e.append(x)});return e}
function r1(n){return Math.round(n*10)/10}
function fetchJ(u){return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()})}
function load(){
  return fetchJ('data/index.json').then(function(ix){
    return Promise.all([fetchJ(ix.pantry),fetchJ(ix.training),fetchJ(ix.extras)].concat(ix.days.map(function(d){return fetchJ('data/days/'+d+'.json')}))).then(function(a){
      D.pantry=a[0];D.training=a[1];D.extras=a[2];ix.days.forEach(function(d,i){D.days[d]=a[3+i]});D.list=ix.days});
  }).catch(function(){var b=window.NUTRITION_DATA;D.pantry=b.pantry;D.training=b.training;D.extras=b.extras;D.days=b.days;D.list=b.index.days});
}
function eats(day){return day.items.filter(function(i){return i.kind!=='skincare'})}
function tot(day){var t={kcal:0,protein:0,fat:0,fruit:0,added:0,lactose:0,fiber:0,starch:0,m:{},cost:0,missing:0,est:false};
  day.items.forEach(function(i){if(i.cost_thb==null)t.missing++;else t.cost+=i.cost_thb;if(i.estimate)t.est=true;if(i.kind==='skincare')return;
   t.kcal+=i.kcal;t.protein+=i.protein;t.fat+=i.fat;var c=i.carbs;t.fruit+=c.sugars.fruit;t.added+=c.sugars.added;t.lactose+=c.sugars.lactose;t.fiber+=c.fiber;t.starch+=c.starch;
   for(var k in i.micros)t.m[k]=(t.m[k]||0)+i.micros[k]});
  t.carbs=t.fruit+t.added+t.lactose+t.fiber+t.starch;return t}
function cbar(c,max){var b=h('div',{class:'bar'});[['fruit',c.sugars?c.sugars.fruit:c.fruit],['added',c.sugars?c.sugars.added:c.added],['lactose',c.sugars?c.sugars.lactose:c.lactose],['fiber',c.fiber],['starch',c.starch]].forEach(function(p){if(p[1]>0){var i=h('i',{title:p[0]+' '+r1(p[1])+'g'});i.style.width=(p[1]/max*100)+'%';i.style.background='var(--'+p[0]+')';b.append(i)}});return b}
function legend(){var l=h('div',{class:'legend'});[['fruit','Fruit sugar'],['added','Added sugar'],['lactose','Lactose'],['fiber','Fiber'],['starch','Starch']].forEach(function(p){var i=h('i');i.style.background='var(--'+p[0]+')';l.append(h('span',{},[i,p[1]]))});return l}
function wdOf(d){return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(d+'T12:00:00').getDay()]}
var V={
day:function(day){var c=h('div',{class:'card'},[h('h2',{text:'Day board'}),legend()]);
  ['morning','midday','evening'].forEach(function(p){var its=eats(day).filter(function(i){return i.period===p});c.append(h('div',{class:'period',text:p}));
   if(!its.length){c.append(h('p',{class:'muted',text:'Nothing logged yet. Tell your Nutritionist in chat.'}));return}
   its.forEach(function(i){var cs=i.carbs,ct=cs.sugars.fruit+cs.sugars.added+cs.sugars.lactose+cs.fiber+cs.starch;
    var cost=i.cost_thb==null?h('span',{class:'addp',text:'add price'}):h('span',{text:'฿'+i.cost_thb});
    var mic=h('div');Object.keys(i.micros).forEach(function(k){var m=MIC.find(function(x){return x[0]===k});if(m)mic.append(h('span',{class:'chip',text:m[1]+' '+i.micros[k]+m[2]}))});
    var ev=h('div',{class:'meta',text:i.evidence||''});
    c.append(h('div',{class:'item'},[h('div',{},[h('div',{class:'nm',text:(i.estimate?'~ ':'')+i.name}),h('div',{class:'meta',text:i.kind+' · '+i.qty}),mic,ev]),
     h('div',{class:'nums'},[h('div',{text:i.kcal+' kcal'}),h('div',{text:'P '+i.protein+' · F '+i.fat+' · C '+r1(ct)}),cost]),cbar(cs,Math.max(ct,30))]))})});
  var t=tot(day);c.append(h('div',{class:'period',text:'Carbs today'}),cbar(t,t.carbs||1),h('p',{class:'meta',text:'Fruit '+r1(t.fruit)+'g · Added '+r1(t.added)+'g · Lactose '+r1(t.lactose)+'g · Fiber '+r1(t.fiber)+'g · Starch '+r1(t.starch)+'g'}));
  return c},
fuel:function(day){var T=D.training,c=h('div',{class:'card'},[h('h2',{text:'Fuel vs training'}),h('p',{class:'muted',text:T.program+' · deload weeks '+T.deload_weeks.join(', ')})]);
  var w=h('div',{class:'week'}),td=wdOf(day.date);['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(function(d){var x=T.week[d];
   w.append(h('div',{class:'wd'+(x.fuel==='heavy'?' heavy':'')+(d===td?' today':'')},[h('b',{text:d+(d===td?' · today':'')})].concat(x.sessions.map(function(s){return h('div',{text:s})}),[h('div',{class:'meta',text:'Fuel: '+x.fuel+' · salts: '+x.electrolytes}),h('div',{class:'meta',text:x.note||''})])))});
  c.append(w);var t=tot(day),x=T.week[td];c.append(h('p',{text:'Today ('+td+', '+x.fuel+' fuel): '+Math.round(t.kcal)+' kcal, '+Math.round(t.carbs-t.fiber)+'g digestible carbs so far, sodium '+(t.m.sodium_mg||0)+'mg.'}));
  c.append(h('p',{class:'meta',text:'Long row by week: '+T.long_row_minutes_by_week.map(function(m,i){return 'W'+(i+1)+' '+m+'m'}).join(' · ')}));return c},
micro:function(day){var t=tot(day),tg=D.extras.targets,c=h('div',{class:'card'},[h('h2',{text:'Micro wheel'}),h('p',{class:'muted',text:'Each petal fills toward a daily target. Pale petals are where the body is still asking.'})]);
  var NS='http://www.w3.org/2000/svg',s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','-160 -160 320 320');var n=MIC.length,tb=h('table');
  tb.append(h('tr',{},[h('th',{text:'Micro'}),h('th',{text:'So far'}),h('th',{text:'Target'}),h('th',{text:'%'})]));
  MIC.forEach(function(m,i){var v=t.m[m[0]]||0,p=Math.min(v/tg[m[0]],1),a0=i/n*2*Math.PI-Math.PI/2,a1=(i+1)/n*2*Math.PI-Math.PI/2-.04;
   function arc(r,col,op){var R=30+r,pa=document.createElementNS(NS,'path');pa.setAttribute('d','M0 0 L'+Math.cos(a0)*R+' '+Math.sin(a0)*R+' A'+R+' '+R+' 0 0 1 '+Math.cos(a1)*R+' '+Math.sin(a1)*R+'Z');pa.setAttribute('fill',col);pa.setAttribute('opacity',op);s.append(pa)}
   arc(110,'var(--chip)',1);arc(110*p,p>=1?'var(--fiber)':p<.25?'var(--added)':'var(--fatc)',.85);
   var tx=document.createElementNS(NS,'text'),am=(a0+a1)/2;tx.setAttribute('x',Math.cos(am)*152);tx.setAttribute('y',Math.sin(am)*152);tx.setAttribute('font-size','10');tx.setAttribute('text-anchor','middle');tx.setAttribute('fill','currentColor');tx.textContent=m[1];s.append(tx);
   tb.append(h('tr',{},[h('td',{text:m[1]}),h('td',{text:r1(v)+' '+m[2]}),h('td',{text:tg[m[0]]+' '+m[2]}),h('td',{text:Math.round(v/tg[m[0]]*100)+'%'})]))});
  c.append(h('div',{class:'wheel'},[s,tb]));return c},
skin:function(day){var c=h('div',{class:'card'},[h('h2',{text:'Skin & body care'}),h('p',{class:'muted',text:'Skin is diet. What touches you, feeds you.'})]);
  day.items.filter(function(i){return i.kind==='skincare'}).forEach(function(i){var p=D.pantry.products.find(function(x){return x.id===i.pantry_id})||{},fl=h('div');
   (i.flags||[]).forEach(function(f){fl.append(h('span',{class:'chip flag',text:f}))});
   if(p.ingredients){if(PET.test(p.ingredients))fl.append(h('span',{class:'chip flag',text:'petroleum'}));if(FRA.test(p.ingredients))fl.append(h('span',{class:'chip flag',text:'fragrance'}))}
   c.append(h('div',{class:'item'},[h('div',{},[h('div',{class:'nm',text:i.name}),h('div',{class:'meta',text:i.period+' · '+i.qty+' · '+(p.brand||'')}),fl]),h('div',{class:'nums'},[i.cost_thb==null?h('span',{class:'addp',text:'add price'}):h('span',{text:'฿'+i.cost_thb})])]))});
  c.append(h('p',{class:'meta',text:'Flags scan label INCI lists for mineral oil, paraffinum liquidum, petrolatum and parfum/fragrance.'}));return c},
ancestral:function(){var c=h('div',{class:'card'},[h('h2',{text:'Ancestral corner'})]);D.extras.ancestral.forEach(function(a){c.append(h('div',{class:'item'},[h('div',{},[h('div',{class:'nm',text:a.food+' · '+a.week}),h('div',{text:a.why}),h('div',{class:'meta',text:a.evidence_note})]),h('div',{},[h('span',{class:'chip '+a.evidence,text:a.evidence})])]))});return c},
feelings:function(day){var c=h('div',{class:'card'},[h('h2',{text:'Feelings layer'}),h('p',{class:'muted',text:'How did each meal land? Tell me in chat: mood and energy, 1 to 5.'})]);
  (day.mood||[]).forEach(function(m){c.append(h('div',{class:'item'},[h('div',{},[h('div',{class:'nm',text:m.period}),h('div',{class:'meta',text:m.note||''})]),h('div',{class:'nums',text:'mood '+(m.mood==null?'–':m.mood)+' · energy '+(m.energy==null?'–':m.energy)})]))});return c},
changes:function(){var c=h('div',{class:'card'},[h('h2',{text:'Changes & cost'})]),tb=h('table');tb.append(h('tr',{},[h('th',{text:'Swap'}),h('th',{text:'Gain'}),h('th',{text:'THB / week'}),h('th',{text:'Evidence'})]));
  D.extras.swaps.forEach(function(s){tb.append(h('tr',{},[h('td',{text:s.swap}),h('td',{text:s.gain}),h('td',{text:s.thb_week==null?'price tbd':(s.thb_week>0?'+':'')+s.thb_week}),h('td',{},[h('span',{class:'chip '+s.evidence,text:s.evidence})])]))});c.append(tb);return c},
pantry:function(){var c=h('div',{class:'card'},[h('h2',{text:'Labels pantry'}),h('p',{class:'muted',text:'Send a label photo once; its facts and price get reused forever.'})]),tb=h('table');tb.append(h('tr',{},[h('th',{text:'Product'}),h('th',{text:'Brand'}),h('th',{text:'Serving'}),h('th',{text:'Label'}),h('th',{text:'Price'})]));
  D.pantry.products.forEach(function(p){tb.append(h('tr',{},[h('td',{text:p.name}),h('td',{text:p.brand}),h('td',{text:p.serving}),h('td',{text:p.label_status}),h('td',{},[p.unit_price_thb==null?h('span',{class:'addp',text:'add price'}):h('span',{text:'฿'+p.unit_price_thb+' / '+p.unit})])]))});c.append(tb);return c}};
var TABS=[['day','Day board'],['fuel','Fuel vs training'],['micro','Micro wheel'],['skin','Skin & body'],['ancestral','Ancestral'],['feelings','Feelings'],['changes','Changes & cost'],['pantry','Labels pantry']];
function render(){var day=D.days[cur],t=tot(day);
  $('#title').textContent=new Date(cur+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  $('#whisper').textContent=day.note||'';
  $('#kcal').textContent=(t.est?'~':'')+Math.round(t.kcal);$('#prot').textContent=Math.round(t.protein);$('#fat').textContent=Math.round(t.fat);$('#carb').textContent=Math.round(t.carbs);
  $('#cost').textContent='฿'+t.cost;$('#costnote').textContent=t.missing?t.missing+' item'+(t.missing>1?'s':'')+' need a price':'THB, complete';
  var tb=$('#tabs');tb.innerHTML='';TABS.forEach(function(x){var b=h('button',{type:'button','aria-selected':String(x[0]===tab),text:x[1]});b.onclick=function(){tab=x[0];render()};tb.append(b)});
  var v=$('#view');v.innerHTML='';v.append(V[tab](day))}
document.addEventListener('DOMContentLoaded',function(){var b=$('#theme'),c=rt();b.textContent=LBL[c];b.onclick=function(){c=ORDER[(ORDER.indexOf(c)+1)%3];try{localStorage.setItem(KEY,c)}catch(e){}at(c);b.textContent=LBL[c]};
  load().then(function(){var s=$('#day');D.list.forEach(function(d){s.append(h('option',{value:d,text:d}))});cur=D.list[D.list.length-1];s.value=cur;s.onchange=function(){cur=s.value;render()};render()})});
})();
