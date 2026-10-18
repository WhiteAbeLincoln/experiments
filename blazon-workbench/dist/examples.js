// Factual heraldic descriptions from https://en.wikipedia.org/wiki/Blazon.
// Supported examples are unchanged, apart from terminal punctuation/capitalization.
export const EXAMPLES = [
  {name:'The classic bend',owner:'Scrope / Grosvenor',text:'Azure, a bend Or.',ok:true},
  {name:'Counterchanged tree',owner:'Behnsdorf',text:'Party per pale argent and vert, a tree eradicated counterchanged.',ok:true},
  {name:'Ermine, plain',owner:'Brittany',text:'Ermine',ok:true},
  {name:'A golden chevron',owner:'Les Essarts',text:'Gules, a chevron or',ok:true},
  {name:'A divided field',owner:'Villeroux',text:'Per fess argent and azure, over all a lion or, armed and langued gules',ok:true},
  {name:'Counterchanged lily',owner:'Hoecklin de Steineck',text:'Per pale argent and azure, a fleur-de-lis counterchanged',ok:true},
  {name:'Lozengy field',owner:'Angoulême',text:'Lozengy or and gules',ok:true},
  {name:'A silver field',owner:'Béthune',text:'Argent, a fess gules',ok:true},
  {name:'A rose',owner:'Pacy-sur-Eure',text:'Argent, a rose gules',ok:true},
  {name:'A charged chief',owner:'Mortrée',text:'Ermine, on a chief indented gules, a scallop or',ok:true},
  {name:'Charges on a bend',owner:'Composition example',text:'Gules, on a bend or between two mullets argent, three crescents sable',ok:true},
  {name:'Shared tincture',owner:'Tincture convention',text:'Argent, two chevrons and a canton gules',ok:true},
  {name:'Of the field',owner:'Tincture convention',text:'Argent, two chevrons and on a canton gules a lion passant of the field',ok:true},
  {name:'Of the first',owner:'Tincture convention',text:'Argent, two chevrons and on a canton gules a lion passant of the first',ok:true},
  {name:'A red field',owner:'Bouillon',text:'Gules, a fess argent',ok:true},
  {name:'Ten horizontal pieces',owner:'Looz',text:'Burely (10) or and gules',ok:true},
  {name:'Eagle with wing charges',owner:'Brandenburg · outside grammar',text:'Argent, an eagle displayed gules armed and wings charged with trefoils Or',ok:false},
  {name:'Dragon-winged griffin',owner:'Östergötland · outside grammar',text:'Gules, a Griffin with dragon wings tail and tongue rampant Or armed beaked langued and membered Azure between four Roses Argent',ok:false},
  {name:'Named quarterings',owner:'Principality of Liège · outside grammar',text:'Quartered: 1. of Bouillon; 2. of Franchimont; 3. of Looz; 4. of Horn; overall of Liège',ok:false},
  {name:'Perron and letters',owner:'Liège · outside grammar',text:'Gules, a perron raised, supported by three lions on three steps, mounted with a pine cone, topped with a crosslet, all or, flanked by the capital letters L and G of the same',ok:false},
  {name:'Lion cubs',owner:'Franchimont · outside grammar',text:'Argent, three lion cubs vert, armed and langued gules, and crowned or',ok:false},
  {name:'Hunting horns',owner:'Horn · outside grammar',text:'Or, three hunting horns gules ill-ordered, ringed and stringed argent',ok:false},
  {name:'Complex composite arms',owner:'Alsace · outside grammar',text:'Per pale, first, gules a bend argent between two cotises fleury of the same and second also gules a bend or between six crowns of the same, three in chief and three inverted in base',ok:false},
  {name:'Nested historical arms',owner:'Churchill · outside grammar',text:'Quarterly 1st and 4th Sable a lion rampant on a canton Argent a cross Gules; 2nd and 3rd quarterly Argent and Gules in the 2nd and 3rd quarters a fret Or overall on a bend Sable three escallops of the first and as an augmentation in chief an inescutcheon, Argent a cross Gules and thereon an inescutcheon Azure, three fleurs-de-lis Or',ok:false}
];
export const STARTER_EXAMPLES=[0,1,9,5,8,10];
