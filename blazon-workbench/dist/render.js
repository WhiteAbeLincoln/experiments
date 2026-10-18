import { TINCTURES, ORDINARY } from './language.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const SHIELDS={heater:'M 12 12 H 388 V 190 C 388 318 310 410 200 458 C 90 410 12 318 12 190 Z',french:'M 12 12 H 388 V 300 Q 388 382 260 411 L 200 458 L 140 411 Q 12 382 12 300 Z',round:'M 12 12 H 388 V 260 A 188 188 0 0 1 12 260 Z'};
function star(n=5,outer=48,inner=21){return Array.from({length:n*2},(_,i)=>{const a=i*Math.PI/n-Math.PI/2,r=i%2?inner:outer;return `${i?'L':'M'}${(Math.cos(a)*r).toFixed(2)} ${(Math.sin(a)*r).toFixed(2)}`;}).join(' ')+' Z';}
const PATHS={
  'fleur-de-lis':'M0 48 L-12 27 L-10 13 C-46 23 -51 -21 -27 -22 C-13 -23 -8 -4 -8 5 L-4 5 C-10 -21 -17 -26 0 -50 C17 -26 10 -21 4 5 L8 5 C8 -4 13 -23 27 -22 C51 -21 46 23 10 13 L12 27 Z M-19 5 H19 V14 H-19 Z',
  crescent:'M26 -42 A48 48 0 1 0 26 42 A39 39 0 0 1 26 -42 Z',
  heart:'M0 43 C-12 27 -52 4 -46 -23 C-40 -50 -10 -47 0 -27 C10 -47 40 -50 46 -23 C52 4 12 27 0 43 Z',
  lozenge:'M0 -50 L36 0 L0 50 L-36 0 Z',
  billet:'M-24 -46 H24 V46 H-24 Z',
  crown:'M-44 -27 L-25 -5 L-17 -39 L0 -9 L17 -39 L25 -5 L44 -27 L33 29 H-33 Z M-33 37 H33 V45 H-33 Z',
  escallop:'M-29 35 L-42 -5 C-57 -34 -22 -49 -15 -31 C-24 -58 13 -59 12 -33 C24 -57 54 -31 37 -10 L26 35 L34 43 H-36 Z',
  tower:'M-35 45 V-17 H-43 V-46 H-26 V-32 H-9 V-46 H9 V-32 H26 V-46 H43 V-17 H35 V45 Z',
  tree:'M-7 17 C-41 25 -48 2 -31 -10 C-56 -30 -28 -52 -11 -39 C-6 -59 20 -51 20 -35 C47 -40 56 -15 33 -5 C54 17 26 31 8 15 L9 38 L26 48 L8 45 L0 38 L-15 49 L-26 48 L-7 37 Z',
  lion:'M-3 -23 L-16 -36 L-16 -50 L-4 -43 L5 -49 L18 -44 L30 -45 L33 -34 L22 -29 L24 -17 L12 -12 L17 5 L32 17 L43 9 L49 14 L38 29 L23 30 L7 17 L-2 26 L9 37 L25 39 L26 49 L2 49 L-15 29 L-27 39 L-40 40 L-43 31 L-28 24 L-23 3 L-34 -11 L-43 -8 L-49 -16 L-33 -25 L-18 -13 L-9 -2 L-10 -17 Z M-21 5 C-56 17 -51 -15 -50 -31 C-46 -47 -30 -49 -27 -36 C-29 -29 -37 -26 -39 -35 C-49 -29 -30 -2 -21 -8 Z',
  eagle:'M-6 -29 L-18 -42 L-9 -49 L6 -43 L18 -38 L7 -30 L10 -12 L20 -18 L49 -46 L48 -18 L34 -8 L49 -14 L43 0 L28 6 L42 3 L33 17 L17 14 L12 26 L27 40 L17 44 L5 33 L0 49 L-5 33 L-17 44 L-27 40 L-12 26 L-17 14 L-33 17 L-42 3 L-28 6 L-43 0 L-49 -14 L-34 -8 L-48 -18 L-49 -46 L-20 -18 L-10 -12 Z'
};
function component(c,fill,paint){
  let body='';const detail=attr=>paint(c.details?.[attr]??c.tincture);
  if(c.shape==='roundel')body='<circle r="45"/>';
  else if(c.shape==='annulet')body='<path fill-rule="evenodd" d="M0 -47 A47 47 0 1 1 0 47 A47 47 0 1 1 0 -47 M0 -29 A29 29 0 1 0 0 29 A29 29 0 1 0 0 -29"/>';
  else if(c.shape==='mullet'||c.shape==='star')body=`<path d="${star(c.points??(c.shape==='star'?6:5))}"/>`;
  else if(c.shape==='rose')body=Array.from({length:5},(_,i)=>`<ellipse cx="0" cy="-23" rx="22" ry="26" transform="rotate(${i*72})"/>`).join('')+'<circle r="13" fill="#edbd52"/>';
  else if(c.shape==='trefoil')body='<circle cx="0" cy="-25" r="23"/><circle cx="-23" cy="9" r="23"/><circle cx="23" cy="9" r="23"/><path d="M-6 9 H6 L11 49 H-12 Z"/>';
  else if(c.shape==='cross'){
    if(['pattee','patty'].includes(c.modifier))body='<path d="M-24 -48 H24 L10 -10 L48 -24 V24 L10 10 L24 48 H-24 L-10 10 L-48 24 V-24 L-10 -10 Z"/>';
    else if(c.modifier==='potent')body='<path d="M-26 -48 H26 V-34 H9 V-9 H34 V-26 H48 V26 H34 V9 H9 V34 H26 V48 H-26 V34 H-9 V9 H-34 V26 H-48 V-26 H-34 V-9 H-9 V-34 H-26 Z"/>';
    else body='<path d="M-10 -48 H10 V-10 H48 V10 H10 V48 H-10 V10 H-48 V-10 H-10 Z"/>';
    if(c.modifier==='trefly')body+=Array.from({length:4},(_,i)=>`<g transform="rotate(${i*90})"><circle cy="-43" r="11"/><circle cx="-10" cy="-34" r="10"/><circle cx="10" cy="-34" r="10"/></g>`).join('');
  }
  else {body=`<path d="${PATHS[c.shape]??''}"/>`;
    if(c.shape==='tree'&&c.modifier==='eradicated')body+='<path d="M-4 34 L-30 47 L-13 45 L-19 54 L1 44 L18 54 L12 44 L32 47 L5 34 Z"/>';
    if(c.shape==='escallop')body+='<path d="M-1 32 L-26 -26 M0 32 L-10 -36 M1 32 L12 -34 M2 32 L29 -20" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="2"/>';
    if(c.shape==='tower')body+='<path d="M-9 45 V21 A9 9 0 0 1 9 21 V45 M-23 -6 H-13 V6 H-23 Z M13 -6 H23 V6 H13 Z" fill="#252d34"/>';
    if(c.shape==='lion'||c.shape==='eagle'){
      body+='<circle cx="7" cy="-38" r="2" fill="#252d34"/>';
      if(c.details?.langued)body+=`<path d="M23 -34 L40 -33 L40 -27 L29 -28 Z" fill="${detail('langued')}"/>`;
      if(c.details?.beaked)body+=`<path d="M8 -43 L24 -38 L7 -30 Z" fill="${detail('beaked')}"/>`;
      if(c.details?.armed||c.details?.membered)body+=`<path d="M5 40 L24 43 L26 49 H2 Z M-32 31 L-43 31 L-40 40 L-25 38 Z" fill="${detail(c.details?.armed?'armed':'membered')}"/>`;
      if(c.details?.crowned)body+=`<path d="M-17 -49 L-22 -64 L-9 -57 L-3 -68 L5 -57 L17 -64 L13 -49 Z" fill="${detail('crowned')}"/>`;
    }
  }
  let transform=c.reversed?'scale(-1 1)':'';
  if(c.shape==='lion'&&['passant','statant'].includes(c.modifier))transform+=' rotate(-60) scale(1.1 .85)';
  return `<g fill="${fill}" stroke="#182936" stroke-opacity=".28" stroke-width="1.6" stroke-linejoin="round"${transform?` transform="${transform}"`:''}>${body}</g>`;
}
function line(x1,y1,x2,y2,edge){
  const n=20,dx=(x2-x1)/n,dy=(y2-y1)/n,len=Math.hypot(x2-x1,y2-y1),nx=-(y2-y1)/len,ny=(x2-x1)/len;
  return Array.from({length:n+1},(_,i)=>{const offset=!edge||i===0||i===n?0:edge==='indented'?(i%2?8:-8):Math.sin(i*Math.PI/2)*7;return `${i?'L':'M'}${x1+dx*i+nx*offset},${y1+dy*i+ny*offset}`;}).join(' ');
}
function ordinary(c,index=0){
  const n=c.count,offset=(index-(n-1)/2);const width=Math.min(88,110/n);
  if(c.shape==='bend'||c.shape==='bend sinister'){const x=offset*width*1.8+width/2;return `<g${c.shape==='bend sinister'?' transform="translate(400 0) scale(-1 1)"':''}><path d="${line(-80+x,-70,480+x,510,c.edge)} L${480+x-width} 510 ${-80+x-width} -70 Z"/></g>`;}
  if(['fess','bar'].includes(c.shape)){const y=213+offset*width*1.8,h=c.shape==='bar'?width*.65:width;return `<path d="${line(-20,y-h/2,420,y-h/2,c.edge)} L420 ${y+h/2} ${line(420,y+h/2,-20,y+h/2,c.edge).replace(/^M/,'L')} Z"/>`;}
  if(['pale','pallet'].includes(c.shape)){const x=200+offset*width*1.8,w=c.shape==='pallet'?width*.5:width;return `<path d="${line(x-w/2,-20,x-w/2,480,c.edge)} L${x+w/2} 480 ${line(x+w/2,480,x+w/2,-20,c.edge).replace(/^M/,'L')} Z"/>`;}
  if(c.shape==='chevron'){const y=160+offset*110;return `<path d="M-30 ${y+140} L200 ${y-20} L430 ${y+140} V${y+200} L200 ${y+40} L-30 ${y+200} Z"/>`;}
  if(c.shape==='cross'&&!c.modifier)return '<path d="M158 -10 H242 V170 H410 V254 H242 V480 H158 V254 H-10 V170 H158 Z"/>';
  if(c.shape==='saltire')return '<path d="M-50 -30 L200 190 L450 -30 L480 15 L238 230 L460 450 L410 490 L200 270 L-10 490 L-60 450 L162 230 L-80 15 Z"/>';
  if(c.shape==='chief')return `<path d="M-20 -20 H420 V120 ${line(420,120,-20,120,c.edge).replace(/^M/,'L')} Z"/>`;
  if(c.shape==='base')return '<rect x="0" y="330" width="400" height="150"/>';
  if(c.shape==='canton')return '<rect x="0" y="0" width="150" height="160"/>';
  if(c.shape==='bordure')return `<path d="M-30 -30 H430 V490 H-30 Z M42 42 V190 C42 303 110 385 200 424 C290 385 358 303 358 190 V42 Z" fill-rule="evenodd"/>`;
  return '';
}
function positions(c){
  if(c.count===1)return [[200,222,2.3]];
  const presets={2:[[115,205],[285,205]],3:[[115,135],[285,135],[200,302]],4:[[115,125],[285,125],[115,285],[285,285]],5:[[105,110],[295,110],[200,215],[120,320],[280,320]],6:[[85,100],[200,100],[315,100],[120,235],[280,235],[200,345]],7:[[85,95],[200,95],[315,95],[115,210],[285,210],[150,325],[250,325]]};
  let points=presets[c.count]??Array.from({length:c.count},(_,i)=>[90+(i%3)*110,75+Math.floor(i/3)*92]);
  if(c.arrangement==='ill-ordered'&&c.count===3)points=[[200,115],[115,280],[285,280]];
  if(c.position==='fess')points=Array.from({length:c.count},(_,i)=>[55+(i+.5)*290/c.count,210]);
  if(c.position==='pale')points=Array.from({length:c.count},(_,i)=>[200,55+(i+.5)*325/c.count]);
  if(c.position==='saltire')points=Array.from({length:c.count},(_,i)=>{const v=(Math.floor(i/2)+.5)/Math.ceil(c.count/2);return [i%2?335-v*270:65+v*270,55+v*325];});
  if(c.position==='bend')points=Array.from({length:c.count},(_,i)=>[65+(i+.5)*270/c.count,55+(i+.5)*325/c.count]);
  return points.map(p=>[...p,c.count>7?.52:c.count>4?.67:c.count===4?.86:1.04]);
}
export function renderSVG(ast,{shape='heater',title='Coat of arms',prefix='arms'}={}){
  // IDs are controlled locally, never taken verbatim from blazon text.
  prefix=String(prefix).replace(/[^a-zA-Z0-9_-]/g,'');let serial=0;const defs=[];const id=()=>`${prefix}-${serial++}`;
  const paint=t=>{
    if(t==='ermine'||t==='ermines'){
      const key=id(),bg=t==='ermine'?'#f7f4e9':'#252d34',fg=t==='ermine'?'#252d34':'#f7f4e9';
      defs.push(`<pattern id="${key}" width="45" height="58" patternUnits="userSpaceOnUse"><rect width="45" height="58" fill="${bg}"/><g fill="${fg}" transform="translate(22 26)"><circle cx="-5" cy="-7" r="2.4"/><circle cy="-10" r="2.4"/><circle cx="5" cy="-7" r="2.4"/><path d="M0 -4 L8 15 L0 10 L-8 15 Z"/></g></pattern>`);return `url(#${key})`;
    }
    return TINCTURES[t]?.hex??'#252d34';
  };
  const fieldMarkup=(f,swap=false)=>{
    if(f.kind==='solid')return `<rect width="400" height="470" fill="${paint(f.tincture)}"/>`;
    const colors=swap?[...f.colors].reverse():f.colors,a=paint(colors[0]),b=paint(colors[1]);let extra='';
    if(f.kind==='divided'){
      const paths={pale:'M200 0 H400 V470 H200 Z',fess:'M0 235 H400 V470 H0 Z',bend:'M0 0 L400 470 H0 Z','bend sinister':'M400 0 L0 470 H400 Z',chevron:'M0 270 L200 115 L400 270 V470 H0 Z',quarterly:'M200 0 H400 V235 H200 Z M0 235 H200 V470 H0 Z',saltire:'M0 0 L200 235 L0 470 Z M400 0 L200 235 L400 470 Z'};
      extra=`<path d="${paths[f.division]}" fill="${b}"/>`;
    }else{
      const key=id(),n=f.count,w=400/n,h=470/n;
      let pattern;
      if(f.pattern==='chequy')pattern=`<rect width="${w*2}" height="${w*2}" fill="${a}"/><path d="M0 0 H${w} V${w} H0 Z M${w} ${w} H${w*2} V${w*2} H${w} Z" fill="${b}"/>`;
      else if(f.pattern==='lozengy')pattern=`<rect width="80" height="100" fill="${a}"/><path d="M40 0 L80 50 L40 100 L0 50 Z" fill="${b}"/>`;
      else if(f.pattern==='paly')pattern=`<rect width="${w*2}" height="470" fill="${a}"/><rect width="${w}" height="470" fill="${b}" x="${w}"/>`;
      else if(f.pattern==='bendy')pattern=`<rect width="100" height="100" fill="${a}"/><path d="M-50 0 L50 100 H100 L0 0 Z M50 0 L150 100 H200 L100 0 Z" fill="${b}"/>`;
      else pattern=`<rect width="400" height="${h*2}" fill="${a}"/><rect y="${h}" width="400" height="${h}" fill="${b}"/>`;
      const pw=f.pattern==='chequy'?w*2:f.pattern==='lozengy'?80:f.pattern==='paly'?w*2:f.pattern==='bendy'?100:400;
      const ph=f.pattern==='chequy'?w*2:f.pattern==='lozengy'?100:f.pattern==='paly'?470:f.pattern==='bendy'?100:h*2;
      defs.push(`<pattern id="${key}" width="${pw}" height="${ph}" patternUnits="userSpaceOnUse"${['lozengy','bendy'].includes(f.pattern)?` patternTransform="scale(${8/n})"`:''}>${pattern}</pattern>`);extra=`<rect width="400" height="470" fill="url(#${key})"/>`;
    }
    return `<rect width="400" height="470" fill="${a}"/>${extra}`;
  };
  const atPositions=(c,pts,field)=>{
    const geometry=pts.map(([x,y,s])=>`<g transform="translate(${x} ${y}) scale(${s})">${component(c,c.tincture==='counterchanged'?'white':paint(c.tincture),paint)}</g>`).join('');
    if(c.tincture!=='counterchanged')return geometry;
    const key=id();defs.push(`<mask id="${key}" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="470" style="mask-type:alpha">${geometry}</mask>`);return `<g mask="url(#${key})">${fieldMarkup(field,true)}</g>`;
  };
  const chargeMarkup=(c,field)=>{
    let fill;
    if(c.tincture==='counterchanged'){const key=id();defs.push(`<pattern id="${key}" width="400" height="470" patternUnits="userSpaceOnUse">${fieldMarkup(field,true)}</pattern>`);fill=`url(#${key})`;}else fill=paint(c.tincture);
    // Counterchanged fills stay in shield coordinates by clipping the full field.
    let out;
    const isOrdinary=ORDINARY.includes(c.shape)&&!(c.shape==='cross'&&(c.modifier||c.count>1));
    if(isOrdinary)out=`<g fill="${fill}">${Array.from({length:c.count},(_,i)=>ordinary(c,i)).join('')}</g>`;
    else {
      const placement=c.position;let tx=0,ty=0,scale=1;
      if(placement?.includes('chief')){ty=-115;scale=.55;}else if(placement?.includes('base')){ty=150;scale=.48;}
      if(placement?.startsWith('dexter')){tx=-105;scale=.45;}else if(placement?.startsWith('sinister')){tx=105;scale=.45;}
      const geometry=positions(c).map(([x,y,s])=>`<g transform="translate(${200+(x-200)*scale+tx} ${222+(y-222)*scale+ty}) scale(${s*scale})">${component(c,c.tincture==='counterchanged'?'white':fill,paint)}</g>`).join('');
      if(c.tincture==='counterchanged'){const clip=id();defs.push(`<mask id="${clip}" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="470" style="mask-type:alpha">${geometry}</mask>`);out=`<g mask="url(#${clip})">${fieldMarkup(field,true)}</g>`;}
      else out=geometry;
    }
    for(const other of c.between??[]){
      // Two surrounding charges straddle the ordinary; more use an even perimeter.
      const pts=other.count===2?(c.shape==='bend'?[[295,115],[105,325]]:c.shape==='bend sinister'?[[105,115],[295,325]]:c.shape==='pale'?[[80,222],[320,222]]:[[100,115],[300,325]]):Array.from({length:other.count},(_,i)=>{const a=i*2*Math.PI/other.count-Math.PI/2;return [200+130*Math.cos(a),220+145*Math.sin(a)];});
      out+=atPositions(other,pts.map(([x,y])=>[x,y,.65]),field);
    }
    for(const child of c.on??[]){
      let pts=positions(child);const n=child.count;
      if(c.shape==='chief')pts=Array.from({length:n},(_,i)=>[40+(i+.5)*320/n,65,Math.min(.72,2/n)]);
      else if(c.shape==='canton')pts=Array.from({length:n},(_,i)=>[35+(i+.5)*80/n,75,Math.min(.8,1/n)]);
      else if(c.shape==='bend'||c.shape==='bend sinister')pts=Array.from({length:n},(_,i)=>{const v=(i+.5)/n;return [c.shape==='bend'?45+v*290:355-v*290,40+v*350,.5];});
      else if(c.shape==='fess'||c.shape==='bar')pts=Array.from({length:n},(_,i)=>[30+(i+.5)*340/n,213,.55]);
      else if(c.shape==='pale')pts=Array.from({length:n},(_,i)=>[200,35+(i+.5)*350/n,.55]);
      out+=atPositions(child,pts,field);
    }
    return out;
  };
  const arms=node=>{
    if(node.type==='quartered')return [1,2,3,4].map((n,i)=>`<svg x="${i%2*200}" y="${Math.floor(i/2)*235}" width="200" height="235" viewBox="0 0 400 470" overflow="hidden">${arms(node.quarters[n])}</svg>`).join('');
    return fieldMarkup(node.field)+node.charges.map(c=>chargeMarkup(c,node.field)).join('');
  };
  const markup=arms(ast),clip=id(),outline=SHIELDS[shape]??SHIELDS.heater;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 470" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><defs><clipPath id="${clip}"><path d="${outline}"/></clipPath>${defs.join('')}</defs><g clip-path="url(#${clip})">${markup}</g><path d="${outline}" fill="none" stroke="#192d3a" stroke-width="3" stroke-linejoin="round"/></svg>`;
}
