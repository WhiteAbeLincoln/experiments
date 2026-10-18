import test from 'node:test';
import assert from 'node:assert/strict';
import {parseBlazon,validateBlazon,tokenize,TINCTURES,vocabulary} from '../dist/language.js';
import {renderSVG} from '../dist/render.js';
import {EXAMPLES} from '../dist/examples.js';

for(const example of EXAMPLES)test(`Wikipedia: ${example.name}`,()=>{
 const result=validateBlazon(example.text);assert.equal(result.ok,example.ok,result.error?.message);
 if(example.ok){const svg=renderSVG(result.ast);assert.ok(svg.startsWith('<svg'));assert.ok(!svg.includes('undefined'));assert.ok(!svg.includes('NaN'));}
 else {assert.ok(result.error.code.startsWith('E_'));assert.ok(result.error.column>=1);}
});

test('new tincture/charge combinations use the same grammar and renderer',()=>{
 let cases=0;
 for(const field of Object.keys(TINCTURES))for(const charge of vocabulary.shapes){
   const text=`${field}, a ${charge} ${field==='or'?'Azure':'Or'}.`,r=validateBlazon(text);
   assert.ok(r.ok,`${text}: ${r.error?.message}`);const svg=renderSVG(r.ast);
   assert.ok(!svg.includes('undefined'));assert.ok(!svg.includes('NaN'));cases++;
 }
 assert.ok(cases>=200);
});

test('composes divisions, patterns, counts and charges independently',()=>{
 for(const field of ['Per pale Azure and Or','Per bend sinister Gules and Argent','Per saltire Vert and Or','Quarterly Argent and Azure','Barry of six Or and Sable','Paly (10) Argent and Gules','Bendy of four Argent and Vert','Chequy of six Or and Purpure','Lozengy of twelve Azure and Argent']){
  const result=validateBlazon(`${field}, three mullets counterchanged.`);assert.ok(result.ok,result.error?.message);assert.equal(result.ast.charges[0].count,3);assert.match(renderSVG(result.ast),/<mask /);
 }
});

test('resolves field, same, and indexed tincture references',()=>{
 const a=parseBlazon('Argent, a bend Gules and a rose of the field');assert.equal(a.charges[1].tincture,'argent');
 const b=parseBlazon('Per fess Argent and Azure, a lion Or armed and langued of the second');assert.deepEqual(b.charges[0].details,{armed:'azure',langued:'azure'});
 const c=parseBlazon('Or, a rose Gules and two crescents of the same');assert.equal(c.charges[1].tincture,'gules');
});

test('shared tincture applies to preceding uncoloured charge groups',()=>{
 const a=parseBlazon('Or, two chevrons and a canton Azure');assert.deepEqual(a.charges.map(c=>c.tincture),['azure','azure']);
});

test('preserves the structure of surrounding and overlaid charges',()=>{
 const c=parseBlazon('Argent, on a fess Gules between two roses Azure, three mullets Or').charges[0];
 assert.equal(c.shape,'fess');assert.equal(c.between[0].shape,'rose');assert.equal(c.on[0].count,3);assert.equal(c.on[0].shape,'mullet');
});

test('numbered quarterings contain complete parsed arms',()=>{
 const r=validateBlazon('Quarterly: 1st and 4th Azure, a fleur-de-lis Or; 2nd and 3rd Gules, a lion rampant Or.');
 assert.ok(r.ok,r.error?.message);assert.equal(r.ast.type,'quartered');assert.equal(r.ast.quarters[1].charges[0].shape,'fleur-de-lis');assert.deepEqual(r.ast.quarters[1],r.ast.quarters[4]);assert.equal((renderSVG(r.ast).match(/overflow="hidden"/g)??[]).length,4);
});

test('errors point at the original source, including line breaks',()=>{
 const source='Azure,\n a unicorn Or.';const r=validateBlazon(source);assert.equal(r.ok,false);assert.equal(r.error.code,'E_UNSUPPORTED');assert.equal(r.error.line,2);assert.equal(r.error.column,4);assert.equal(source.slice(r.error.start,r.error.end),'unicorn');
});

test('tokens retain source offsets and accents normalize for grammar only',()=>{
 const s='Argent, a cross pattée Gules.';const tokens=tokenize(s);assert.equal(tokens[3].value,'pattee');assert.equal(s.slice(tokens[3].start,tokens[3].end),'pattée');assert.equal(parseBlazon(s).charges[0].modifier,'pattee');
});

for(const text of ['Constructor a bend Or', 'Azure a constructor mullet Or', '', 'Azure a bend', 'Azure a bend Or banana', 'Azure a dragon Or', 'Per pale Azure Or', 'Azure a rose counterchanged', 'Or a lion of the fifth', 'Azure thirteen roses Or', 'Barry of twenty Or and Gules', 'Azure <script>', 'Azure a bend Or; Gules', 'Quarterly 1st Azure a bend Or; 2nd Gules a cross Argent', 'Azure two chiefs Or', 'Or an eight-pointed lion Gules', 'Or a rose Gules armed Azure', 'Or in chief a bend Gules', 'Or a rose Gules charged with a lion Azure', 'Or on a fess Gules a rose Argent charged with a crescent Azure', 'Or on a fess Gules a rose Argent in chief'])test(`rejects malformed or unimplemented syntax: ${text||'(empty)'}`,()=>{assert.equal(validateBlazon(text).ok,false);});

test('accepts decorative edges and placements without swallowing extra words',()=>{
 for(const edge of ['indented','wavy','engrailed'])assert.ok(validateBlazon(`Or a fess ${edge} Gules`).ok);
 for(const p of ['chief','base','pale','fess','bend','saltire','dexter chief','sinister base'])assert.ok(validateBlazon(`Azure three stars Or in ${p}`).ok);
});

test('rule of tincture is advisory, not a syntax rejection',()=>{
 const r=validateBlazon('Gules a bend Azure');assert.ok(r.ok);assert.equal(r.warnings[0].code,'W_TINCTURE');assert.equal(validateBlazon('Azure a bend Or').warnings.length,0);
});

test('all supported shield shapes produce distinct outlines',()=>{
 const ast=parseBlazon('Vert a rose Argent');const svgs=['heater','french','round'].map(shape=>renderSVG(ast,{shape}));assert.equal(new Set(svgs).size,3);
});

test('SVG titles are escaped and identifiers are sanitized',()=>{
 const s=renderSVG(parseBlazon('Or a cross Gules'),{title:'<script>"&',prefix:'"><script>'});assert.ok(!s.includes('<script>'));assert.match(s,/&lt;script&gt;/);assert.ok(!s.includes('id="">'));
});

test('every SVG paint, mask, and clip reference has a matching unique definition',()=>{
 for(const text of ['Ermine on a chief Gules three roses Or','Per pale Argent and Vert a tree eradicated counterchanged','Quarterly: 1st and 4th Ermine a lion Gules; 2nd and 3rd Lozengy Or and Azure a rose counterchanged']){
  const svg=renderSVG(parseBlazon(text));const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const ref of svg.matchAll(/url\(#([^)]*)\)/g))assert.ok(ids.includes(ref[1]),ref[1]);
 }
});

test('pattern counts change the rendering for every pattern family',()=>{
 for(const pattern of ['Barry','Paly','Bendy','Chequy','Lozengy'])assert.notEqual(renderSVG(parseBlazon(`${pattern} of four Argent and Gules`)),renderSVG(parseBlazon(`${pattern} of eight Argent and Gules`)));
});

test('source size and numeric bounds are enforced',()=>{
 assert.equal(validateBlazon('Azure '+ ' '.repeat(8000)).error.code,'E_RANGE');assert.equal(validateBlazon('Azure 0 roses Or').error.code,'E_RANGE');assert.ok(validateBlazon('Azure twelve roses Or').ok);
});
