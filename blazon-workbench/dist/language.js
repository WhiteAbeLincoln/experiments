/** A deliberately bounded English blazon grammar. No arm-specific substitutions. */
export const TINCTURES = {
  argent: { hex: '#f7f4e9', label: 'Silver', family: 'metal' },
  or: { hex: '#edbd52', label: 'Gold', family: 'metal' },
  azure: { hex: '#205792', label: 'Blue', family: 'colour' },
  gules: { hex: '#b63e42', label: 'Red', family: 'colour' },
  sable: { hex: '#252d34', label: 'Black', family: 'colour' },
  vert: { hex: '#36735c', label: 'Green', family: 'colour' },
  purpure: { hex: '#795279', label: 'Purple', family: 'colour' },
  ermine: { hex: '#f7f4e9', label: 'Ermine', family: 'fur' },
  ermines: { hex: '#252d34', label: 'Ermines', family: 'fur' }
};
export const ORDINARY = ['bend', 'bend sinister', 'fess', 'bar', 'pale', 'pallet', 'chevron', 'cross', 'saltire', 'chief', 'base', 'canton', 'bordure'];
const SHAPES = [...ORDINARY, 'roundel', 'annulet', 'lozenge', 'mullet', 'star', 'crescent', 'fleur-de-lis', 'rose', 'trefoil', 'escallop', 'tree', 'lion', 'eagle', 'heart', 'crown', 'tower', 'billet'];
const ALIASES = { bends:'bend', fesses:'fess', bars:'bar', pales:'pale', pallets:'pallet', chevrons:'chevron', crosses:'cross', saltires:'saltire', chiefs:'chief', cantons:'canton', roundels:'roundel', annulets:'annulet', lozenges:'lozenge', mullets:'mullet', stars:'star', crescents:'crescent', 'fleurs-de-lis':'fleur-de-lis', roses:'rose', trefoils:'trefoil', escallops:'escallop', scallop:'escallop', scallops:'escallop', trees:'tree', lions:'lion', eagles:'eagle', hearts:'heart', crowns:'crown', towers:'tower', billets:'billet', bezant:'roundel', bezants:'roundel', plate:'roundel', plates:'roundel' };
const COUNTS = { a:1, an:1, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12 };
const ORDINALS = { first:1, second:2, third:3, fourth:4, fifth:5, sixth:6, seventh:7, eighth:8, ninth:9, tenth:10, '1st':1, '2nd':2, '3rd':3, '4th':4 };
export class BlazonError extends Error {
  constructor(message, token, source, code='E_SYNTAX') {
    super(message); this.name='BlazonError'; this.code=code;
    this.start=token?.start ?? source.length; this.end=token?.end ?? source.length;
    this.line=source.slice(0,this.start).split('\n').length;
    this.column=this.start-(source.lastIndexOf('\n',this.start-1)+1)+1;
    this.found=token?.value ?? 'end of input';
  }
}
export function tokenize(source) {
  const tokens=[]; const re=/\s+|[,.:]|[;()]|[A-Za-zÀ-ž]+(?:-[A-Za-zÀ-ž]+)*|\d+(?:st|nd|rd|th)?|./gu;
  for(const m of source.matchAll(re)) {
    const raw=m[0]; if(/^\s+$/.test(raw)||/^[,.:]$/.test(raw)) continue;
    if(!/^(?:[A-Za-zÀ-ž]+(?:-[A-Za-zÀ-ž]+)*|\d+(?:st|nd|rd|th)?|[;()])$/u.test(raw)) throw new BlazonError(`Unexpected character “${raw}”.`,{start:m.index,end:m.index+raw.length,value:raw},source,'E_CHARACTER');
    tokens.push({value:raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''),raw,start:m.index,end:m.index+raw.length});
  }
  return tokens;
}
class Parser {
  constructor(source){this.source=source;this.tokens=tokenize(source);this.i=0;this.tinctures=[];this.fieldTincture=null;}
  peek(n=0){return this.tokens[this.i+n]?.value;}
  take(word){if(this.peek()===word){return this.tokens[this.i++];}return null;}
  expect(word){if(!this.take(word))this.fail(`Expected “${word}”; found ${this.found()}.`);}
  found(){return this.peek()?`“${this.tokens[this.i].raw}”`:'end of input';}
  fail(message,code='E_SYNTAX'){throw new BlazonError(message,this.tokens[this.i],this.source,code);}
  isTint(){return Object.hasOwn(TINCTURES,this.peek()) || this.peek()==='counterchanged'||this.peek()==='of';}
  tint(allowCounter=true){
    let v=this.peek();
    if(Object.hasOwn(TINCTURES,v)){this.i++;this.tinctures.push(v);return v;}
    if(this.take('counterchanged')){if(!allowCounter)this.fail('A field needs explicit tinctures.');return 'counterchanged';}
    if(this.take('of')){
      this.take('the');let ref=this.peek();this.i++;
      const value=ref==='same'?this.tinctures.at(-1):ref==='field'?this.fieldTincture:this.tinctures[(ORDINALS[ref]??0)-1];
      if(!value)this.fail(`Cannot resolve tincture reference “of the ${ref ?? ''}”.`,'E_REFERENCE');
      return value;
    }
    this.fail(`Expected a tincture (such as Azure, Or, or Argent); found ${this.found()}.`,'E_TINCTURE');
  }
  field(){
    this.take('party');
    if(this.take('per')){
      let division=this.peek();this.i++;
      if(!['pale','fess','bend','chevron','saltire'].includes(division))this.fail('Supported divisions: per pale, fess, bend, chevron, or saltire.','E_UNSUPPORTED');
      if(division==='bend'&&this.take('sinister'))division='bend sinister';
      const colors=[this.tint(false)];this.expect('and');colors.push(this.tint(false));
      return {kind:'divided',division,colors};
    }
    if(['quarterly','quartered'].includes(this.peek()) && Object.hasOwn(TINCTURES,this.peek(1))){this.i++;const colors=[this.tint(false)];this.expect('and');colors.push(this.tint(false));return {kind:'divided',division:'quarterly',colors};}
    if(['barry','burely','paly','bendy','chequy','lozengy'].includes(this.peek())){
      const pattern=this.peek()==='burely'?'barry':this.peek();this.i++;let count=8;
      if(this.take('of'))count=this.number();
      else if(this.take('(')){count=this.number();this.expect(')');}
      if(count<2||count>12)this.fail('Pattern counts must be from 2 to 12.','E_RANGE');
      const colors=[this.tint(false)];this.expect('and');colors.push(this.tint(false));return {kind:'pattern',pattern,count,colors};
    }
    const tincture=this.tint(false);this.take('plain');return {kind:'solid',tincture};
  }
  number(){let value=COUNTS[this.peek()]??Number(this.peek());if(!Number.isInteger(value)||value<1||value>12)this.fail('Expected a count from one to twelve.','E_RANGE');this.i++;return value;}
  ordinal(){const v=ORDINALS[this.peek()]??Number(this.peek());return Number.isInteger(v)&&v>=1&&v<=4?v:null;}
  arms(depth=0,stopAtQuarter=false){
    if(depth>4)this.fail('This workbench supports up to four nested quarterings.','E_RANGE');
    if(['quarterly','quartered'].includes(this.peek()) && !(Object.hasOwn(TINCTURES,this.peek(1)))){
      this.i++;const quarters={};
      while(this.peek()){
        this.take('in');this.take('the');const ids=[];
        if(!this.ordinal())this.fail('Expected a numbered quarter, e.g. “1st and 4th Azure …; 2nd and 3rd Gules …”.','E_UNSUPPORTED');
        ids.push(this.ordinal());this.i++;
        if(this.take('and')){if(!this.ordinal())this.fail('Expected another quarter number.');ids.push(this.ordinal());this.i++;}
        const arm=this.arms(depth+1,true);
        for(const id of ids){if(quarters[id])this.fail(`Quarter ${id} is described twice.`,'E_QUARTER');quarters[id]=arm;}
        if(!this.take(';'))break;
      }
      if([1,2,3,4].some(n=>!quarters[n]))this.fail('Describe all four quarters.','E_QUARTER');
      return {type:'quartered',quarters};
    }
    const field=this.field();this.fieldTincture=field.kind==='solid'?field.tincture:null;
    const charges=[];
    while(this.peek() && this.peek()!==';'){
      if(stopAtQuarter&&this.ordinal())break;
      if(charges.length){if(!this.take('and') && !this.take('overall') && !this.take('over'))this.fail(`Unexpected ${this.found()}. Join charges with “and”.`,'E_UNSUPPORTED');this.take('all');}
      else {if(this.take('over'))this.expect('all');else this.take('overall');}
      charges.push(this.charge());
    }
    // A shared final tincture is grammatical: “two chevrons and a canton Gules”.
    let shared=null;for(let i=charges.length-1;i>=0;i--){if(charges[i].tincture)shared=charges[i].tincture;else if(shared)charges[i].tincture=shared;else this.fail('Every charge group needs a tincture.','E_TINCTURE');}
    for(const c of charges)this.validateCharge(c,field);
    return {type:'arms',field,charges};
  }
  validateCharge(c,field){
    if(!c.tincture)this.fail('Every nested charge group needs a tincture.','E_TINCTURE');
    if(c.count>1&&['chief','base','canton','bordure','saltire'].includes(c.shape))this.fail(`The ${c.shape} is supported only as a single ordinary.`,'E_UNSUPPORTED');
    if(c.points&&!['star','mullet'].includes(c.shape))this.fail('Point counts apply only to stars and mullets.','E_UNSUPPORTED');
    if(c.position&&ORDINARY.includes(c.shape)&&!(c.shape==='cross'&&(c.modifier||c.count>1)))this.fail('Ordinaries have fixed positions; use a simple charge for explicit placement.','E_UNSUPPORTED');
    if(c.details&&!['lion','eagle'].includes(c.shape))this.fail('Detail colours are currently supported only on lions and eagles.','E_UNSUPPORTED');
    if(c.on?.length&&(!['chief','canton','bend','bend sinister','fess','bar','pale'].includes(c.shape)||c.count!==1))this.fail('Charges on an ordinary currently require a single chief, canton, bend, fess, bar, or pale.','E_UNSUPPORTED');
    for(const child of [...(c.on??[]),...(c.between??[])]){
      if(child.position)this.fail('Explicit positions on nested charges are outside the supported grammar.','E_UNSUPPORTED');
      if(child.on?.length||child.between?.length)this.fail('Nested charges on charges are outside the supported grammar.','E_UNSUPPORTED');
      if(ORDINARY.includes(child.shape)&&!(child.shape==='cross'))this.fail('Use a simple charge, such as a rose, crescent, or cross, on or around an ordinary.','E_UNSUPPORTED');
    }
    if(c.tincture==='counterchanged'&&field.kind==='solid')this.fail('Counterchanged requires a divided or patterned field.','E_COUNTERCHANGE');
    for(const child of [...(c.on??[]),...(c.between??[])])this.validateCharge(child,field);
  }
  placement(){
    if(!this.take('in'))return null;
    let side=null;if(['dexter','sinister'].includes(this.peek())){side=this.peek();this.i++;}
    const p=this.peek();if(!['chief','base','fess','pale','bend','saltire'].includes(p))this.fail('Expected chief, base, fess, pale, bend, or saltire after “in”.');this.i++;
    return side?`${side} ${p}`:p;
  }
  charge(){
    const on=!!this.take('on');const position=this.placement();
    const count=this.number();let points=null;
    const pointed={ 'five-pointed':5,'six-pointed':6,'eight-pointed':8 };
    if(Object.hasOwn(pointed,this.peek())){points=pointed[this.peek()];this.i++;}
    const raw=this.peek();let shape=ALIASES[raw]??raw;
    if(!SHAPES.includes(shape))this.fail(`Unsupported charge ${this.found()}. Try a bend, cross, lion, tree, rose, mullet, or fleur-de-lis.`,'E_UNSUPPORTED');this.i++;
    if(shape==='bend'&&this.take('sinister'))shape='bend sinister';
    const c={type:'charge',shape,count,tincture:null};if(points)c.points=points;if(position)c.position=position;
    const allowedModifiers={lion:['rampant','passant','statant','contourne'],eagle:['displayed'],tree:['eradicated'],cross:['potent','pattee','patty','trefly']};
    while(allowedModifiers[shape]?.includes(this.peek())){const mod=this.peek();this.i++;if(mod==='contourne')c.reversed=true;else c.modifier=mod;}
    if(['indented','wavy','engrailed'].includes(this.peek())){
      if(!['chief','fess','bar','pale','bend','bend sinister'].includes(shape))this.fail('Line treatments are supported on chief, fess, bar, pale, and bend.','E_UNSUPPORTED');
      c.edge=this.peek();this.i++;
    }
    if(this.isTint())c.tincture=this.tint();
    else if(['bezant','bezants'].includes(raw))c.tincture='or';
    else if(['plate','plates'].includes(raw))c.tincture='argent';
    if(!c.tincture&&this.peek()!=='and')this.fail(`Expected a tincture after “${shape}”; found ${this.found()}.`,'E_TINCTURE');
    if(this.peek()==='in')c.position=this.placement();
    if(this.take('ill-ordered'))c.arrangement='ill-ordered';
    while(['armed','langued','beaked','membered','crowned'].includes(this.peek())){
      const attrs=[this.peek()];this.i++;
      while(this.peek()==='and'&&['armed','langued','beaked','membered','crowned'].includes(this.peek(1))){this.i++;attrs.push(this.peek());this.i++;}
      const tint=this.tint(false);c.details??={};for(const attr of attrs)c.details[attr]=tint;
    }
    if(this.take('between'))c.between=[this.charge()];
    if(on){if(!ORDINARY.includes(shape))this.fail('“On” currently requires an ordinary as its container.','E_UNSUPPORTED');c.on=[this.charge()];}
    else if(this.take('charged')){this.expect('with');c.on=[this.charge()];}
    return c;
  }
  parse(){if(!this.tokens.length)this.fail('Start with the field: try “Azure, a bend Or.”');const ast=this.arms();if(this.peek())this.fail(`Unexpected ${this.found()}.`,'E_UNSUPPORTED');return ast;}
}
export function parseBlazon(source){
  if(source.length>8000)throw new BlazonError('Blazons are limited to 8,000 characters.',{start:8000,end:source.length},source,'E_RANGE');
  return new Parser(source).parse();
}
export function validateBlazon(source){
  try {
    const ast=parseBlazon(source),warnings=[];
    function visit(node){
      if(node.type==='quartered'){Object.values(node.quarters).forEach(visit);return;}
      if(node.field.kind==='solid')for(const c of node.charges){const a=TINCTURES[node.field.tincture],b=TINCTURES[c.tincture];if(a&&b&&a.family===b.family&&a.family!=='fur')warnings.push({code:'W_TINCTURE',message:`${c.tincture} on ${node.field.tincture}: ${a.family} on ${a.family}. This may be intentional; the rule of tincture is advisory.`});}
    }
    visit(ast);return {ok:true,ast,tokens:tokenize(source),warnings};
  }catch(error){if(!(error instanceof BlazonError))throw error;return {ok:false,error,warnings:[]};}
}
export const vocabulary={shapes:SHAPES,ordinaries:ORDINARY};
