import { validateBlazon, TINCTURES, vocabulary } from './language.js';
import { renderSVG } from './render.js';
import { EXAMPLES, STARTER_EXAMPLES } from './examples.js';
const $=id=>document.getElementById(id),input=$('blazon-input');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,svg='',timer,toastTimer;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3000);}
const readStorage=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const writeStorage=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
function layerRows(ast){
  if(ast.type==='quartered')return Object.entries(ast.quarters).map(([n,a])=>`<div class="layer-row"><span class="layer-number">0${n}</span><span class="layer-icon">⊞</span><div><div class="layer-title">Quarter ${n}</div><div class="layer-desc">${escape(a.type==='arms'?describeField(a.field):'Nested quartering')}</div></div></div>`).join('');
  const rows=[{title:'Field',desc:describeField(ast.field),tint:ast.field.tincture??ast.field.colors[0],icon:'▰'},...ast.charges.map(c=>({title:`${c.count===1?'A':c.count} ${c.shape}${c.count>1?'s':''}${c.modifier?' · '+c.modifier:''}`,desc:c.on?.length?`Charged with ${c.on[0].count} ${c.on[0].shape}${c.on[0].count>1?'s':''}`:c.between?.length?`Between ${c.between[0].count} ${c.between[0].shape}s`:'Charge · '+(c.position??'default arrangement'),tint:c.tincture,icon:'╱'}))];
  return rows.map((r,i)=>`<div class="layer-row"><span class="layer-number">${String(i+1).padStart(2,'0')}</span><span class="layer-icon">${r.icon}</span><div><div class="layer-title">${escape(r.title)}</div><div class="layer-desc">${escape(r.desc)}</div></div><span class="layer-tincture"><i class="swatch" style="background:${TINCTURES[r.tint]?.hex??'linear-gradient(90deg,#205792 50%,#f7f4e9 50%)'}"></i>${escape(r.tint)}</span></div>`).join('');
}
function describeField(f){return f.kind==='solid'?(TINCTURES[f.tincture].family==='fur'?'Fur field':'Solid field'):`${f.kind==='divided'?'Per '+f.division:f.pattern} · ${f.colors.join(' & ')}`;}
function compile(){
  clearTimeout(timer);const text=input.value;current=validateBlazon(text);$('character-count').textContent=text.length;writeStorage('blazon-text',text);
  const d=$('diagnostic');d.className='diagnostic '+(current.ok?'valid':'invalid');$('warning').hidden=true;
  $('download-button').disabled=!current.ok;$('preview-notice').hidden=current.ok;$('preview-canvas').classList.toggle('stale',!current.ok);input.setAttribute('aria-invalid',String(!current.ok));input.setAttribute('aria-describedby','diagnostic');
  if(current.ok){
    d.innerHTML='<span class="status-icon" aria-hidden="true">✓</span><div><strong>Valid blazon.</strong> Every token has a place.</div>';
    if(current.warnings.length){$('warning').hidden=false;$('warning').textContent=current.warnings.map(w=>w.message).join(' ');}
    svg=renderSVG(current.ast,{shape:$('shield-shape').value,title:text});$('shield-preview').innerHTML=svg;
    $('preview-label').textContent=text.toUpperCase();$('reading-panel').innerHTML=layerRows(current.ast);$('ast-panel').textContent=JSON.stringify(current.ast,null,2);
    $('source-panel').textContent=svg.replace(/></g,'>\n<');
  }else{
    const e=current.error;
    d.innerHTML=`<span class="status-icon" aria-hidden="true">!</span><div><strong>${escape(e.code)} · Line ${e.line}, column ${e.column}</strong><span class="detail">${escape(e.message)}</span><button id="select-error">Go to error →</button></div>`;
    $('select-error').onclick=()=>{input.focus();input.setSelectionRange(e.start,Math.max(e.start+1,e.end));};
    $('reading-panel').innerHTML='<p class="layer-desc">The parser stopped here. Correct the diagnostic above to inspect the new coat of arms.</p>';
    $('ast-panel').textContent=JSON.stringify({code:e.code,message:e.message,line:e.line,column:e.column,start:e.start,end:e.end},null,2);
    $('source-panel').textContent='SVG output is available when the entire blazon parses successfully.';svg='';
  }
  const found=EXAMPLES.findIndex(e=>e.text===text);$('example-select').value=found>=0?String(found):'';
  document.querySelectorAll('.example-card').forEach(el=>el.classList.toggle('active',Number(el.dataset.example)===found));
}
function loadExample(i){input.value=EXAMPLES[i].text;compile();}
const supported=EXAMPLES.map((e,i)=>({e,i})).filter(({e})=>e.ok),unsupported=EXAMPLES.map((e,i)=>({e,i})).filter(({e})=>!e.ok);
$('example-select').innerHTML='<option value="">Your own blazon</option>'+[[supported,'Wikipedia · supported'],[unsupported,'Wikipedia · outside grammar']].map(([items,label])=>`<optgroup label="${label}">${items.map(({e,i})=>`<option value="${i}">${escape(e.name)}</option>`).join('')}</optgroup>`).join('');
$('example-select').onchange=e=>{if(e.target.value!=='')loadExample(Number(e.target.value));};
$('example-grid').innerHTML=STARTER_EXAMPLES.map((n,i)=>{const e=EXAMPLES[n];return `<button class="example-card" data-example="${n}" aria-label="Load ${escape(e.name)}: ${escape(e.text)}"><span class="card-number">0${i+1}</span><div class="example-image">${renderSVG(validateBlazon(e.text).ast,{title:e.text,prefix:'example'+n})}</div><strong>${escape(e.name)}</strong><p>${escape(e.owner)}</p><span class="card-arrow" aria-hidden="true"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 12L12 4M4 4H12V12"/></svg></span></button>`;}).join('');
document.querySelectorAll('.example-card').forEach(b=>b.onclick=()=>{loadExample(Number(b.dataset.example));document.querySelector('.workbench').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(compile,180);});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();compile();}});
$('render-button').onclick=()=>{compile();if(current.ok)toast('Arms rendered. Ready to export.');};
$('reset-button').onclick=()=>{input.value=EXAMPLES[0].text;compile();};
$('shield-shape').onchange=()=>{writeStorage('blazon-shape',$('shield-shape').value);compile();};
$('download-button').onclick=()=>{
  compile();if(!current.ok)return;
  const url=URL.createObjectURL(new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n'+svg],{type:'image/svg+xml;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='blazon-'+$('shield-shape').value+'.svg';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('SVG downloaded. Yours to make your own.');
};
$('copy-link').onclick=async()=>{
  const url=new URL(location.href);url.hash=new URLSearchParams({blazon:input.value,shape:$('shield-shape').value}).toString();
  try{await navigator.clipboard.writeText(url.toString());toast('Link copied with your blazon and shield shape.');}
  catch{const t=document.createElement('textarea');t.value=url.toString();document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();toast(ok?'Link copied.':'Could not copy. Use your browser’s copy command.');}
};
function activateTab(tab){document.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$(b.dataset.tab+'-panel').hidden=!active;});}
document.querySelectorAll('[data-tab]').forEach(b=>{b.onclick=()=>activateTab(b.dataset.tab);b.onkeydown=e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...document.querySelectorAll('[data-tab]')];let i=tabs.indexOf(b);i=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;activateTab(tabs[i].dataset.tab);tabs[i].focus();}};});
$('reference-open').onclick=$('reference-open-bottom').onclick=()=>$('reference-dialog').showModal();$('reference-close').onclick=()=>$('reference-dialog').close();
$('reference-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}});
$('tincture-guide').innerHTML=Object.entries(TINCTURES).map(([name,t])=>`<div class="tincture-chip"><i class="swatch" style="background:${t.hex}"></i>${name}<span class="layer-desc">${t.label}</span></div>`).join('');
$('charge-guide').textContent=vocabulary.shapes.join(', ')+'.';
const pass=EXAMPLES.filter(e=>validateBlazon(e.text).ok===e.ok).length;
$('fixture-summary').textContent=`WIKIPEDIA FIXTURES: ${pass}/${EXAMPLES.length} expected outcomes · ${supported.length} renderable · ${unsupported.length} explicit unsupported-syntax diagnostics.`;
const hash=new URLSearchParams(location.hash.slice(1)),stored=readStorage('blazon-text');
input.value=hash.get('blazon')??stored??EXAMPLES[0].text;
const savedShape=hash.get('shape')??readStorage('blazon-shape');if(['heater','french','round'].includes(savedShape))$('shield-shape').value=savedShape;
// Keep an illustrative initial shield even when a shared or stored blazon has errors.
$('shield-preview').innerHTML=renderSVG(validateBlazon(EXAMPLES[0].text).ast,{title:EXAMPLES[0].text});
compile();
window.addEventListener('hashchange',()=>{const p=new URLSearchParams(location.hash.slice(1));if(p.has('blazon')){input.value=p.get('blazon');if(['heater','french','round'].includes(p.get('shape')))$('shield-shape').value=p.get('shape');compile();}});
