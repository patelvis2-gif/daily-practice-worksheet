/* ===== V8.7 content: number sense, times-table runway, phonics rebuild, early-years levels ===== */
(function(){
'use strict';
const H = s => esc(String(s == null ? '' : s));
const range = (a, b) => { const o = []; for(let x = a; x <= b; x++) o.push(x); return o; };
const ins = (list, where, id, items) => { const i = list.findIndex(l => l.id === id); if(i < 0) return false; list.splice(where === 'after' ? i + 1 : i, 0, ...items); return true; };
const uniqOpts = (a, cands, n) => { const s = [a]; cands.forEach(v => { if(s.length < n && v !== a && !s.includes(v) && v > 0) s.push(v); }); let k = 1; while(s.length < n){ const v = a + k * (k % 2 ? 1 : -1) * Math.ceil(k / 2); if(v > 0 && !s.includes(v)) s.push(v); k++; } return shuffle(s); };

/* =====================================================================
   MATH
   ===================================================================== */
/* ---------- early years: quick look, which has more ---------- */
const DOTS = {1:[[50,50]],2:[[28,28],[72,72]],3:[[24,24],[50,50],[76,76]],4:[[28,28],[72,28],[28,72],[72,72]],
  5:[[26,26],[74,26],[50,50],[26,74],[74,74]],6:[[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]]};
function diceHTML(n){
  return '<svg viewBox="0 0 100 100" class="v87dice" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="16"/>' +
    DOTS[n].map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9"/>').join('') + '</svg>';
}
function fiveFrameHTML(n){
  let s = '<div class="v85frame five">';
  for(let k = 0; k < 5; k++) s += '<i class="c' + (k < n ? ' a' : '') + '"></i>';
  return s + '</div>';
}
function quickItem(){
  const n = 1 + rnd(6), useFrame = n <= 5 && Math.random() < .4;
  const opts = shuffle(uniqOpts(n, [n - 1, n + 1, n + 2, n - 2], 3));
  return {kind:'choice', quick:n, q:'<div class="v87quick">' + (useFrame ? fiveFrameHTML(n) : diceHTML(n)) + '</div>How many dots? Look — do not count!',
    opts: opts.map(String), a: opts.indexOf(n), say:'How many dots? Look quickly. Try not to count.', spkLabel:'Hear it', audioRate:0.86, key:'quick:' + n + (useFrame ? 'f' : 'd')};
}
const MORE_EMOJI = ['🍎','⭐','🐟','🚗','🎈','🐞','🍪','🌸'];
function moreItem(){
  let x = 1 + rnd(9), y = 1 + rnd(9); while(y === x) y = 1 + rnd(9);
  const e1 = pick(MORE_EMOJI), fewer = Math.random() < .3;
  const g = (n, e) => '<span class="v87grp">' + Array(n).fill(e).join('') + '</span>';
  const ans = fewer ? (x < y ? 0 : 1) : (x > y ? 0 : 1);
  return {kind:'pic', more:{x, y, fewer}, q: fewer ? 'Which group has fewer?' : 'Which group has more?',
    opts:[g(x, e1), g(y, e1)], a: ans, say: fewer ? 'Which group has fewer?' : 'Which group has more?', spkLabel:'Hear it', key:'more:' + x + ':' + y + (fewer ? 'f' : '')};
}
const NEWM = {};
NEWM.quick = {id:'5A-4q', skill:'How many? Quick look', n:SHEET_N, sct:300, audio:1,
  lesson:{title:'Quick look', sub:'See how many without counting',
    demo:'<div class="v87quick">' + diceHTML(5) + fiveFrameHTML(3) + '</div><div class="cap">Dice show 5. The frame shows 3.</div>',
    steps:['Look at the dots for a second.','Say how many you see without counting one by one.','Dice patterns and frames help you see it fast.'],
    tip:'Seeing small amounts at a glance ("subitizing") is the foundation of number sense — it is how children later see that 7 is 5 and 2. Play with real dice and flash fingers: "how many fingers? quick!"'},
  gen(){ return quickItem(); }};
NEWM.more = {id:'5A-4m', skill:'Which has more? Which has fewer?', n:SHEET_N, sct:300, audio:1,
  lesson:{title:'More and fewer', sub:'Compare two groups',
    demo:'<div class="v87quick"><span class="v87grp">🍎🍎🍎🍎🍎</span><span class="v87grp">🍎🍎</span></div><div class="cap">5 is more than 2.</div>',
    steps:['Look at both groups.','Line them up in your head — which one has some left over?','The one with extra has more. The other has fewer.'],
    tip:'Line up real things side by side ("one for you, one for me") — the group with leftovers has more. "Fewer" is a new word for most 4-year-olds; use it often.'},
  gen(){ return moreItem(); }};

/* ---------- 2-digit number sense: compare, add or take away tens ---------- */
function compareItem(){
  const kind = rnd(3);
  if(kind < 2){
    let a = 10 + rnd(90), b = 10 + rnd(90);
    if(Math.random() < .35) b = a % 10 * 10 + Math.floor(a / 10);   /* 47 vs 74 */
    if(Math.random() < .1) b = a;
    if(b < 10) b += 10;
    const sym = a > b ? '>' : a < b ? '<' : '=';
    const opts = ['>','<','='];
    return {kind:'choice', cmp:{a, b}, q:'<div class="ln-big">' + a + ' &nbsp;▢&nbsp; ' + b + '</div>Which sign goes in the box?',
      opts:['&gt; greater than','&lt; less than','= equal'], labels:null, a: opts.indexOf(sym), sense:'cmp', key:'cmp:' + a + ':' + b,
      say: 'Compare ' + a + ' and ' + b + '. Which sign goes in the box?', spkLabel:'Hear it'};
  }
  const set = new Set(); while(set.size < 3) set.add(10 + rnd(90));
  const nums = [...set], big = Math.max(...nums);
  return {kind:'choice', cmp:{nums}, q:'Which number is the greatest?', opts: nums.map(String), a: nums.indexOf(big), sense:'cmp', key:'cmpg:' + nums.join(','),
    say:'Which number is the greatest?', spkLabel:'Hear it'};
}
function hundredChartHTML(start, end){
  const lo = Math.max(1, Math.floor((Math.min(start, end) - 1) / 10) * 10 + 1), hi = Math.min(100, Math.ceil(Math.max(start, end) / 10) * 10);
  let s = '<div class="v87hc">';
  for(let v = lo; v <= hi; v++) s += '<span class="' + (v === start ? 's' : v === end ? 'e' : ((v - start) % 10 === 0 && (v - start) * (end - start) > 0 && Math.abs(v - start) < Math.abs(end - start) ? 'h' : '')) + '">' + v + '</span>';
  return s + '</div>';
}
NEWM.compare = {id:'B-9c', skill:'Compare numbers: greater, less, equal', n:SHEET_N, sct:300,
  lesson:{title:'Greater or less', sub:'Compare the tens first',
    demo:'<div class="say">47 &lt; 74</div><div class="cap">4 tens is less than 7 tens.</div>',
    steps:['Look at the tens first. More tens means a bigger number.','If the tens are the same, compare the ones.','The open side of the sign faces the bigger number.'],
    tip:'47 and 74 use the same digits but are very different numbers — that is place value. Ask "how many tens?" for each. The sign’s open mouth "eats" the bigger number.'},
  gen(){ return compareItem(); }};
NEWM.tens = {id:'B-9m', skill:'Add or take away 10 and 20', n:SHEET_N, sct:240,
  lesson:{title:'Jump by tens', sub:'Adding 10 changes only the tens',
    demo:hundredChartHTML(34, 54) + '<div class="cap">34 + 20: jump down two rows to 54.</div>',
    steps:['Find the number on the hundred chart.','Adding 10 jumps one row down; taking away 10 jumps one row up.','The ones digit stays the same.'],
    tip:'This is mental math, not column work — encourage her to do it without writing. Ask "what changed, the tens or the ones?" Hundred charts are free to print.'},
  gen(){
    const t = pick([10, 10, 20, 30]), plus = Math.random() < .55;
    const a = plus ? 11 + rnd(89 - t - 10) : t + 1 + rnd(99 - t - 1);
    return Object.assign(mkNum(a, t, plus ? '+' : '−'), {stack:0, hc:true});
  }};

/* ---------- times-table runway ---------- */
function skipItem(){
  const step = pick([2, 5, 10]), start = step * (rnd(5)), len = 3;
  const run = range(0, len - 1).map(k => start + step * (k + 1));
  const a = start + step * (len + 1);
  const opts = uniqOpts(a, [a + step, a - 1, a + 1, a - step + 1], 4);
  return {kind:'seq', run: run.concat(['▢']), a, skip: step, opts, say:'Skip count by ' + step + 's. What comes next?', key:'skip:' + step + ':' + start};
}
function coinSkipItem(){
  const c = pick(['n','d']), k = 2 + rnd(6), coins = Array(k).fill(c);
  return {kind:'money', coins, a: k * (c === 'n' ? 5 : 10), q:'Count by ' + (c === 'n' ? '5s' : '10s') + '. How much money?', say:'Count by ' + (c === 'n' ? 'fives' : 'tens') + '. How much money?', key:'cskip:' + c + k};
}
function arrayHTML(r, c, e){
  let s = '<div class="v87arr" style="grid-template-columns:repeat(' + c + ',1.6rem)">';
  for(let k = 0; k < r * c; k++) s += '<span>' + (e || '●') + '</span>';
  return s + '</div>';
}
function groupsHTML(g, each, e){
  return '<div class="v87groups">' + Array.from({length:g}, () => '<span>' + Array(each).fill(e || '●').join('') + '</span>').join('') + '</div>';
}
function groupItem(){
  const g = 2 + rnd(4), each = 2 + rnd(4), a = g * each, type = rnd(3), e = pick(['🍎','⭐','🐞','🍪','●']);
  if(type === 0){
    const opts = uniqOpts(a, [g + each, a + each, a - each], 4);
    return {kind:'choice', grp:{g, each, as:'groups'}, q: groupsHTML(g, each, e) + '<b>' + g + ' groups of ' + each + '.</b> How many in all?', opts: opts.map(String), a: opts.indexOf(a),
      say: g + ' groups of ' + each + '. How many in all?', spkLabel:'Hear it', key:'grp:' + g + 'x' + each};
  }
  if(type === 1){
    const opts = uniqOpts(a, [g + each, a + g, a - g], 4);
    return {kind:'choice', grp:{g, each, as:'array'}, q: arrayHTML(g, each, e) + '<b>' + g + ' rows of ' + each + '.</b> How many in all?', opts: opts.map(String), a: opts.indexOf(a),
      say: g + ' rows of ' + each + '. How many in all?', spkLabel:'Hear it', key:'arr:' + g + 'x' + each};
  }
  const rep = Array(g).fill(each).join(' + ');
  const right = g + ' × ' + each, opts = shuffle([right, each + ' × ' + (g + 1), g + ' + ' + each, (g + 1) + ' × ' + (each + 1)]);
  return {kind:'choice', grp:{g, each, as:'rep'}, q:'<div class="ln-big">' + rep + '</div>Which is the same?', opts, a: opts.indexOf(right),
    say: 'Which is the same as ' + rep.replace(/\+/g, 'plus') + '?', spkLabel:'Hear it', key:'rep:' + g + 'x' + each};
}
NEWM.skip = {id:'C-0a', skill:'Skip counting by 2s, 5s and 10s', n:SHEET_N, sct:300,
  lesson:{title:'Skip counting', sub:'Count in jumps of the same size',
    demo:'<div class="say">5, 10, 15, 20</div><div class="cap">Jump by 5 each time — like counting nickels.</div>',
    steps:['Find the jump: how much more is each number?','Keep jumping by that much.','2s, 5s and 10s are the first ones to learn.'],
    tip:'Skip counting is the doorway to times tables: 5, 10, 15 is the 5 table. Count nickels by 5s and dimes by 10s; count socks in pairs by 2s. Even numbers are the ones you land on counting by 2s.'},
  gen(){ return Math.random() < .3 ? coinSkipItem() : skipItem(); }};
NEWM.groups = {id:'C-0b', skill:'Equal groups and arrays', n:SHEET_N, sct:360,
  lesson:{title:'Equal groups', sub:'Times means groups of the same size',
    demo:groupsHTML(3, 4) + '<div class="cap">3 groups of 4 is 4 + 4 + 4 = 12. That is 3 × 4.</div>',
    steps:['Count how many groups.','Count how many are in each group — they must all be the same.','Groups × how many in each = how many in all.'],
    tip:'Before memorising tables, she needs to see what 3 × 4 means. Make groups with real things — 3 plates, 4 grapes on each — and arrays with muffin tins or egg cartons. Turning an array sideways shows 3 × 4 = 4 × 3.'},
  gen(){ return groupItem(); }};
window.V87_NEWM = NEWM;

/* ---------- ladder ---------- */
if(!MATH.some(l => l.id === 'C-0a')){
  ins(MATH, 'after', 'B-9', [NEWM.compare, NEWM.tens]);
  ins(MATH, 'before', 'C-1', [NEWM.skip, NEWM.groups]);
  ins(MATH, 'after', '5A-4', [NEWM.quick, NEWM.more]);
  /* number bonds to 5 alongside counting, not only after counting to 100 */
  const b1 = MATH.find(l => l.id === '4A-B1');
  if(b1) ins(MATH, 'after', '5A-4m', [Object.assign({}, b1, {id:'5A-4b', skill:'Number bonds: parts of 3, 4 and 5'})]);
}

/* =====================================================================
   READING — phonics rebuilt with real word banks and short sentences
   ===================================================================== */
const GRAPH = ['igh','sh','ch','th','wh','ck','ng','nk','ll','ai','ay','ee','ea','oa','ow','ar','or','er','ir','ur'];
function markPattern(w, pat){
  if(pat === 'e'){ /* silent e: highlight the vowel and the final e */
    const m = /^(.*)([aeiou])([^aeiou]+)e$/.exec(w);
    return m ? H(m[1]) + '<b class="ph">' + m[2] + '</b>' + H(m[3]) + '<b class="ph">e</b>' : H(w);
  }
  if(pat === 'blend'){ const m = /^([^aeiou]{2})(.*)$/.exec(w), n = /^(.*[aeiou])([^aeiou]{2})$/.exec(w);
    if(m) return '<b class="ph">' + m[1] + '</b>' + H(m[2]); if(n) return H(n[1]) + '<b class="ph">' + n[2] + '</b>'; return H(w); }
  const i = w.indexOf(pat);
  return i < 0 ? H(w) : H(w.slice(0, i)) + '<b class="ph">' + pat + '</b>' + H(w.slice(i + pat.length));
}
function hearItem(row, lvId){
  const [w, ds, pat] = row, opts = shuffle([w].concat(ds));
  return {kind:'choice', ph:{w, pat}, q:'Listen, then tap the word you hear.', opts: opts.map(o => '<span class="v87w">' + H(o) + '</span>'), words: opts, a: opts.indexOf(w),
    say:'Listen. The word is ' + w + '. ' + w + '. Tap the word you hear.', spkLabel:'Hear the word', audioRate:0.8, key:'ph:' + lvId + ':' + w};
}
function sentItem(row, lvId){
  const [sent, q, ans, d1, d2] = row, opts = shuffle([ans, d1, d2]);
  return {kind:'choice', phs:true, q:'<div class="v87read">' + H(sent) + '</div>' + H(q), opts: opts.map(H), a: opts.indexOf(ans), key:'phs:' + lvId + ':' + sent.slice(0, 18)};
}
function phonicsLevel(id, skill, lesson, words, sents){
  return {id, skill, n:SHEET_N, sct:520, audio:1, lesson,
    build(n){
      const nS = Math.min(3, sents.length), nW = n - nS;
      const ws = [], deck = shuffle(words.slice());
      while(ws.length < nW){ if(!deck.length) deck.push(...shuffle(words.slice())); ws.push(deck.pop()); }
      const items = ws.map(r => hearItem(r, id)).concat(sample(sents, nS).map(r => sentItem(r, id)));
      return items;
    }};
}
const P = {};
P.dig = [['ship',['chip','sip'],'sh'],['shop',['chop','sop'],'sh'],['fish',['fich','fis'],'sh'],['dish',['dich','dis'],'sh'],['shed',['ched','sed'],'sh'],
  ['chin',['shin','cin'],'ch'],['chop',['shop','cop'],'ch'],['chick',['shick','cick'],'ch'],['lunch',['lunsh','lunc'],'ch'],['much',['mush','muc'],'ch'],
  ['thin',['chin','tin'],'th'],['bath',['bash','bat'],'th'],['math',['mash','mat'],'th'],['with',['wish','wit'],'th'],['this',['chis','tis'],'th'],
  ['when',['then','wen'],'wh'],['whip',['chip','wip'],'wh'],['which',['wich','shich'],'wh']];
P.digS = [['The fish is in the dish.','Where is the fish?','in the dish','in the ship','on the chin'],
  ['Seth has a big ship.','What does Seth have?','a ship','a shop','a shell'],
  ['Chad can chop the log.','What can Chad do?','chop the log','chat with the log','shop for a log'],
  ['Beth had a hot bath.','What did Beth have?','a hot bath','a hot dish','a hot chip'],
  ['When will the shop shut?','What will shut?','the shop','the ship','the shed'],
  ['The chick is thin.','Who is thin?','the chick','the fish','the moth']];
P.end = [['duck',['duk','dug'],'ck'],['sock',['sok','sog'],'ck'],['back',['bak','bag'],'ck'],['kick',['kik','kit'],'ck'],['rock',['rok','rot'],'ck'],
  ['ring',['rig','rin'],'ng'],['sing',['sig','sin'],'ng'],['king',['kig','kin'],'ng'],['long',['log','lon'],'ng'],
  ['sink',['sik','sing'],'nk'],['bank',['bak','bang'],'nk'],['pink',['pik','ping'],'nk'],
  ['ball',['bal','bell'],'ll'],['bell',['bel','ball'],'ll'],['hill',['hil','hall'],'ll'],['doll',['dol','dull'],'ll']];
P.endS = [['The duck is on the rock.','Where is the duck?','on the rock','in the sink','on the bell'],
  ['The king can sing.','Who can sing?','the king','the duck','the sock'],
  ['Jack has a pink sock.','What color is the sock?','pink','black','red'],
  ['The ball hit the bell.','What did the ball hit?','the bell','the hill','the sink'],
  ['Nick fell on the hill.','Where did Nick fall?','on the hill','in the sink','by the rock'],
  ['The doll is in the bank.','What is in the bank?','the doll','the duck','the ring']];
P.blend = [['stop',['sop','top'],'blend'],['flag',['fag','lag'],'blend'],['frog',['fog','rog'],'blend'],['clap',['cap','lap'],'blend'],['drum',['dum','rum'],'blend'],
  ['spin',['sin','pin'],'blend'],['plug',['pug','lug'],'blend'],['grin',['gin','rin'],'blend'],['step',['sep','tep'],'blend'],['crab',['cab','rab'],'blend'],
  ['swim',['sim','wim'],'blend'],['snap',['sap','nap'],'blend'],['trip',['tip','rip'],'blend'],['glad',['gad','lad'],'blend'],
  ['best',['bes','bet'],'blend'],['lamp',['lap','lam'],'blend'],['hand',['had','han'],'blend'],['jump',['jum','jup'],'blend'],['nest',['net','nes'],'blend'],['milk',['mil','mik'],'blend']];
P.blendS = [['The frog can swim.','What can the frog do?','swim','clap','drum'],
  ['Brad has a red flag.','What does Brad have?','a flag','a frog','a drum'],
  ['The crab is in the sand.','Where is the crab?','in the sand','on the step','in the nest'],
  ['Stop and clap your hands.','What do you do?','stop and clap','spin and jump','swim and grin'],
  ['The hen is in the nest.','Where is the hen?','in the nest','on the lamp','in the milk'],
  ['Glen can jump on the step.','What can Glen do?','jump','swim','spin']];
P.e1 = [['cape',['cap','cope'],'e'],['made',['mad','mede'],'e'],['cake',['cak','coke'],'e'],['game',['gam','gome'],'e'],['lake',['lak','like'],'e'],
  ['gate',['gat','gote'],'e'],['name',['nam','nome'],'e'],['kite',['kit','kate'],'e'],['bike',['bik','bake'],'e'],['time',['tim','tame'],'e'],
  ['ride',['rid','rode'],'e'],['five',['fiv','fave'],'e'],['pine',['pin','pane'],'e'],['hide',['hid','hade'],'e']];
P.e1S = [['Jake ate a cake by the lake.','Where was Jake?','by the lake','by the gate','at home'],
  ['Mike can ride his bike.','What can Mike ride?','his bike','a kite','a cake'],
  ['Kate made a kite.','What did Kate make?','a kite','a cake','a game'],
  ['It is time to hide.','What is it time to do?','hide','ride','bake'],
  ['We came to the gate.','Where did we come?','to the gate','to the lake','to the pine'],
  ['Dave gave me a plate.','What did Dave give me?','a plate','a cake','a kite']];
P.e2 = [['hope',['hop','hape'],'e'],['rope',['rop','ripe'],'e'],['home',['hom','hame'],'e'],['nose',['nos','nase'],'e'],['bone',['bon','bane'],'e'],
  ['note',['not','nute'],'e'],['cube',['cub','cabe'],'e'],['tube',['tub','tibe'],'e'],['cute',['cut','cate'],'e'],['mule',['mul','male'],'e'],['huge',['hug','hage'],'e'],['stove',['stov','stave'],'e']];
P.e2S = [['The dog has a bone.','What does the dog have?','a bone','a rope','a cube'],
  ['Rose has a cute mule.','What does Rose have?','a mule','a nose','a tube'],
  ['We hope to go home.','Where do we hope to go?','home','to the cube','to the rope'],
  ['Pete can use the rope.','What can Pete use?','the rope','the tube','the bone'],
  ['The note is on the stove.','Where is the note?','on the stove','on the nose','in the hole']];
P.ai = [['rain',['rane','rayn'],'ai'],['train',['trane','trayn'],'ai'],['paint',['pant','paynt'],'ai'],['snail',['snale','snayl'],'ai'],['chain',['chane','chayn'],'ai'],
  ['play',['plai','pley'],'ay'],['day',['dai','dey'],'ay'],['stay',['stai','stey'],'ay'],['tray',['trai','trey'],'ay'],['say',['sai','sey'],'ay'],['spray',['sprai','sprey'],'ay']];
P.aiS = [['The train is in the rain.','What is in the rain?','the train','the snail','the tray'],
  ['Can we play all day?','When can we play?','all day','in the rain','on the tray'],
  ['The snail is on the trail.','Where is the snail?','on the trail','on the train','in the pail'],
  ['Jay will paint the gate.','What will Jay paint?','the gate','the train','the tray'],
  ['Stay and play with me.','What will we do?','play','paint','spray']];
P.ee = [['tree',['trea','trie'],'ee'],['green',['grean','grene'],'ee'],['sleep',['sleap','slepe'],'ee'],['queen',['quean','quene'],'ee'],['sheep',['sheap','shepe'],'ee'],['three',['threa','thre'],'ee'],
  ['eat',['eet','ete'],'ea'],['seat',['seet','sete'],'ea'],['leaf',['leef','lefe'],'ea'],['team',['teem','teme'],'ea'],['dream',['dreem','dreme'],'ea']];
P.eeS = [['The sheep sleep under a tree.','Where do the sheep sleep?','under a tree','by the sea','on the street'],
  ['The queen has a green dress.','What color is the dress?','green','red','blue'],
  ['We eat a treat at the beach.','Where do we eat?','at the beach','in the tree','on the seat'],
  ['I see three bees.','How many bees?','three','two','four'],
  ['A leaf fell from the tree.','What fell?','a leaf','a seed','a bee']];
P.oa = [['boat',['bote','bowt'],'oa'],['coat',['cote','cowt'],'oa'],['goat',['gote','gowt'],'oa'],['soap',['sope','sowp'],'oa'],['toast',['toste','towst'],'oa'],
  ['snow',['snoa','sno'],'ow'],['grow',['groa','gro'],'ow'],['slow',['sloa','slo'],'ow'],
  ['light',['lite','lyte'],'igh'],['high',['hie','hy'],'igh'],['bright',['brite','bryte'],'igh'],['fight',['fite','fyte'],'igh']];
P.oaS = [['The goat is in the boat.','Where is the goat?','in the boat','on the road','in the snow'],
  ['Snow fell all night.','What fell?','snow','rain','light'],
  ['The light is bright.','What is bright?','the light','the boat','the snow'],
  ['The bowl has soap in it.','What is in the bowl?','soap','toast','snow'],
  ['Grow tall, little tree!','What will the tree do?','grow','glow','float'],
  ['I might fly my kite tonight.','What might I fly?','my kite','my boat','my coat']];
P.r = [['car',['cor','cur'],'ar'],['star',['stor','stir'],'ar'],['park',['pork','perk'],'ar'],['farm',['form','firm'],'ar'],['barn',['born','burn'],'ar'],
  ['corn',['carn','curn'],'or'],['fork',['fark','ferk'],'or'],['horn',['harn','hurn'],'or'],
  ['bird',['bard','bord'],'ir'],['girl',['garl','gorl'],'ir'],['turn',['tarn','torn'],'ur'],['her',['har','hor'],'er'],['fern',['farn','forn'],'er']];
P.rS = [['The car is in the barn.','Where is the car?','in the barn','in the park','on the porch'],
  ['The bird sat on the fern.','Where did the bird sit?','on the fern','on the car','on the fork'],
  ['Turn left at the park.','Where do you turn?','at the park','at the farm','at the corn'],
  ['Her shirt is dirty.','What is dirty?','her shirt','her skirt','her horse'],
  ['The horse ate the corn.','What did the horse eat?','the corn','the fork','the star'],
  ['A star is far away.','What is far away?','a star','a car','a jar']];
const L = (title, sub, demo, steps, tip) => ({title, sub, demo:'<div class="say">' + demo + '</div>', steps, tip});
const PH = [
  phonicsLevel('E-2', 'Digraphs: sh, ch, th, wh', L('Two letters, one sound', 'sh, ch, th and wh', 'sh + i + p → ship',
    ['Listen to the word.','Find the two letters that make one sound.','Tap the word that matches.'],
    'Say the sounds together: sh (finger on lips), ch (sneeze), th (tongue out). If she picks "sip" for ship, say both slowly and ask which one starts with "shh".'), P.dig, P.digS),
  phonicsLevel('E-2b', 'Word endings: -ck, -ng, -nk, -ll', L('Sounds that stick together', '-ck, -ng, -nk and -ll at the end', 'duck · ring · pink · bell',
    ['Listen to the end of the word.','-ck says /k/ after a short vowel; -ng and -nk are glued sounds.','Tap the word that matches.'],
    'These endings follow a short vowel: duck, ring, pink, bell. Have her say the word and hold the last sound: "rinnng". Glued sounds are learned as a chunk, not letter by letter.'), P.end, P.endS),
  phonicsLevel('E-3', 'Consonant blends', L('Blends', 'Two consonants — you hear both', 's + t + op → stop',
    ['Listen to the start and the end of the word.','In a blend you can hear both consonants.','Tap the word with both sounds.'],
    'Unlike sh or ch, both sounds in a blend are heard: s-t-op. If she drops one ("sop"), stretch it out together: "sssstop".'), P.blend, P.blendS),
  phonicsLevel('E-4', 'Silent e: a_e and i_e', L('Magic e', 'The e at the end makes the vowel say its name', 'cap → cape &nbsp; kit → kite',
    ['Listen to the middle sound: short or long?','A long a or i usually has an e at the end.','Tap the word that matches.'],
    'Contrast pairs out loud: cap/cape, kit/kite, hid/hide. The e is silent but it changes the vowel. Write a word on paper and let her add the e to "make magic".'), P.e1, P.e1S),
  phonicsLevel('E-4b', 'Silent e: o_e and u_e', L('Magic e with o and u', 'hop → hope, cub → cube', 'hop → hope &nbsp; cub → cube',
    ['Listen: does the vowel say its name?','If it does, look for the e at the end.','Tap the word that matches.'],
    'Same idea as a_e and i_e. u_e can say "you" (cube) or "oo" (tube) — both are fine.'), P.e2, P.e2S),
  phonicsLevel('E-5', 'Vowel teams: ai and ay', L('ai and ay', 'Both say the long a sound', 'rain · play',
    ['Listen for the long a sound.','ai is usually in the middle of a word, ay at the end.','Tap the word that matches.'],
    'Teach the position rule: ai in the middle (rain), ay at the end (play). That one rule makes most of these easy.'), P.ai, P.aiS),
  phonicsLevel('E-5b', 'Vowel teams: ee and ea', L('ee and ea', 'Both say the long e sound', 'tree · eat',
    ['Listen for the long e sound.','It is often spelled ee or ea.','Tap the word that matches — look carefully at the letters.'],
    'ee and ea sound the same, so spelling them is partly memory. Reading them is the main goal here; if she can read both, she is on track.'), P.ee, P.eeS),
  phonicsLevel('E-5c', 'Vowel teams: oa, ow and igh', L('oa, ow and igh', 'Long o and long i teams', 'boat · snow · light',
    ['Listen to the vowel sound.','Long o: oa in the middle, ow at the end. Long i: igh.','Tap the word that matches.'],
    'igh is a three-letter team — "the g and h are silent". oa is usually in the middle (boat), ow at the end (snow).'), P.oa, P.oaS),
  phonicsLevel('E-6', 'Bossy r: ar, or, er, ir, ur', L('Bossy r', 'The r changes the vowel', 'car · corn · bird · turn',
    ['Listen to the vowel with the r.','ar says "ar", or says "or"; er, ir and ur all say "er".','Tap the word that matches.'],
    'er, ir and ur sound the same, so this sheet never makes her choose between them by sound alone. Point out "the r is bossy — it changes the vowel".'), P.r, P.rS)
];
/* E-1: read the word, find the picture — with look-alike choices */
const E1 = ENG.find(l => l.id === 'E-1');
if(E1 && window.V85 && window.V85.readItemsFor) E1.build = n => window.V85.readItemsFor(n, FAMILIES.map(f => f[0].replace('-', '')));
if(!ENG.some(l => l.id === 'E-2b')){
  const at = ENG.findIndex(l => l.id === 'E-2');
  const oldIds = ['E-2','E-3','E-4','E-5'];
  for(let k = ENG.length - 1; k >= 0; k--) if(oldIds.includes(ENG[k].id)) ENG.splice(k, 1);
  if(at > -1) ENG.splice(at, 0, ...PH);
  /* spelling everyday words comes after the phonics patterns, not before */
  const twoA = [];
  for(let k = ENG.length - 1; k >= 0; k--) if(/^2A-\d+$/.test(ENG[k].id)) twoA.unshift(ENG.splice(k, 1)[0]);
  ins(ENG, 'after', 'E-6', twoA);
}

/* ---------- early reading: count the sounds, ending sounds ---------- */
const SOUND_WORDS = [['at',2],['in',2],['up',2],['on',2],['it',2],['me',2],['go',2],['bee',2],['egg',2],['zoo',2],
  ['cat',3],['dog',3],['sun',3],['fish',3],['ship',3],['cake',3],['moon',3],['bed',3],['pig',3],['shoe',2],
  ['frog',4],['stop',4],['lamp',4],['jump',4],['hand',4],['nest',4],['crab',4],['milk',4]];
function soundsItem(){
  const [w, n] = pick(SOUND_WORDS);
  const opts = [2, 3, 4].map(k => '<span class="v87bx">' + '<i></i>'.repeat(k) + '</span><small>' + k + '</small>');
  return {kind:'pic', cnt:{w, n}, q:'Say the word slowly. How many sounds?', opts, a: n - 2,
    say:'Say the word slowly: ' + w + '. ' + w + '. How many sounds do you hear?', spkLabel:'Hear the word', audioRate:0.75, key:'nsnd:' + w};
}
const END_WORDS = ['cat','dog','sun','bed','cup','bus','pig','hen','map','web','log','jam','van','net','tub','lip','bag','pan','pot','rug'];
function endItem(){
  const w = pick(END_WORDS), last = w[w.length - 1];
  const pool = 'bdgmnpst'.split('').filter(c => c !== last && c !== w[0]);
  const opts = shuffle([last].concat(sample(pool, 2)));
  return {kind:'choice', endS:{w, last}, q:'What sound do you hear at the <b>end</b>?', opts: opts.map(c => '<span class="v87w">' + c + '</span>'), a: opts.indexOf(last),
    say:'Listen: ' + w + '. ' + w + '. What sound do you hear at the end?', spkLabel:'Hear the word', audioRate:0.75, key:'endsnd:' + w};
}
const NEWE = {
  sounds:{id:'6A-6b', skill:'Tap the sounds: how many?', n:SHEET_N, sct:420, audio:1,
    lesson:{title:'Count the sounds', sub:'One box for each sound you hear',
      demo:'<div class="say">c · a · t → 3 sounds</div><div class="cap">fish is 3 sounds too: f · i · sh.</div>',
      steps:['Listen to the word.','Say it slowly and tap a finger for each sound.','Count your taps.'],
      tip:'Count sounds, not letters: "fish" has 4 letters but 3 sounds (f-i-sh). Use pennies on the table — push one forward for each sound. This skill (segmenting) is what makes spelling possible later.'},
    build(n){ return Array.from({length:n}, soundsItem); }},
  ending:{id:'6A-6c', skill:'Ending sounds', n:SHEET_N, sct:420, audio:1,
    lesson:{title:'The last sound', sub:'Listen to the end of the word',
      demo:'<div class="say">ca<b>t</b> → /t/</div><div class="cap">Stretch the word and listen to how it ends.</div>',
      steps:['Listen to the word.','Say it slowly and stop on the last sound.','Tap the letter that makes that sound.'],
      tip:'Most children hear first sounds easily but not last sounds. Play "I spy something that ends with /t/". Exaggerate the end: "ca-T".'},
    build(n){ return Array.from({length:n}, endItem); }}
};
if(!ENG.some(l => l.id === '6A-6b')) ins(ENG, 'after', '6A-6', [NEWE.sounds, NEWE.ending]);

/* =====================================================================
   Learn-it explanations for the new question types
   ===================================================================== */
const big = s => '<div class="ln-big">' + s + '</div>';
const explain0 = window.V87.explain;
window.V87.explain = function(it, Lv, sub){
  try{
    if(it.kind === 'math' && (it.op === '×' || it.op === '÷') && /^[CD]-/.test(Lv.id) && it.top <= 12 && it.bottom <= 12 || (it.kind === 'math' && it.op === '÷' && /^D-/.test(Lv.id) && it.a <= 12 && it.bottom <= 12)){
      const mul = it.op === '×', g = mul ? it.top : it.a, e = it.bottom, tot = g * e;
      const grp = n => n === 1 ? 'group' : 'groups';
      const pic = groupsHTML(g, e), steps = range(1, g).map(k => k * e).join(', ');
      if(mul) return [
        {html: big(it.top + ' × ' + it.bottom + ' = ?'), say: it.top + ' times ' + it.bottom + '.'},
        {html: pic + big(it.top + ' × ' + it.bottom), say: it.top + ' times ' + it.bottom + ' means ' + g + ' ' + grp(g) + ' of ' + e + '.'},
        {html: pic, say: g === 1 ? 'One group of ' + e + ' is just ' + e + '.' : 'Count by ' + e + 's: ' + steps + '.'},
        {html: pic + big(it.top + ' × ' + it.bottom + ' = <b class="ok">' + it.a + '</b>'), say: it.top + ' times ' + it.bottom + ' is ' + it.a + '.'}];
      return [
        {html: big(it.top + ' ÷ ' + it.bottom + ' = ?'), say: it.top + ' divided by ' + it.bottom + '.'},
        {html: big(it.top + ' ÷ ' + it.bottom) + '<p class="ln-stepline">How many groups of ' + e + ' make ' + it.top + '?</p>', say:'Ask: how many groups of ' + e + ' make ' + it.top + '?'},
        {html: pic, say:'Count by ' + e + 's until you reach ' + it.top + ': ' + steps + '. That is ' + g + ' ' + grp(g) + '.'},
        {html: pic + big(it.top + ' ÷ ' + it.bottom + ' = <b class="ok">' + it.a + '</b>'), say: it.top + ' divided by ' + it.bottom + ' is ' + it.a + ', because ' + it.a + ' times ' + e + ' is ' + it.top + '.'}];
    }
    if(it.quick) return [
      {html:'<div class="v87quick">' + diceHTML(Math.min(6, it.quick)) + '</div>', say:'How many dots? Look quickly.'},
      {html:'<div class="v87quick">' + diceHTML(Math.min(6, it.quick)) + '</div>', say:'Do not count one by one. Look at the pattern — like the dots on a dice.'},
      {html:'<div class="v87quick">' + diceHTML(Math.min(6, it.quick)) + '</div>' + big('<b class="ok">' + it.quick + '</b>'), say:'That pattern is ' + it.quick + '.'}];
    if(it.more){ const m = it.more, big1 = Math.max(m.x, m.y), small1 = Math.min(m.x, m.y);
      return [
        {html: it.opts.join(' '), say: it.q},
        {html: it.opts.join(' '), say:'Count each group: ' + m.x + ' and ' + m.y + '.'},
        {html: it.opts[it.a], say: m.fewer ? small1 + ' is fewer than ' + big1 + '. That group has fewer.' : big1 + ' is more than ' + small1 + '. That group has more.'}]; }
    if(it.sense === 'cmp' && it.cmp){
      if(it.cmp.nums){ const b = Math.max(...it.cmp.nums);
        return [{html: big(it.cmp.nums.join(' &nbsp; ')), say:'Which number is the greatest?'},
          {html: big(it.cmp.nums.join(' &nbsp; ')), say:'Compare the tens first. The most tens is the biggest number.'},
          {html: big('<b class="ok">' + b + '</b>'), say: b + ' is the greatest.'}]; }
      const a = it.cmp.a, b = it.cmp.b, sym = a > b ? '&gt;' : a < b ? '&lt;' : '=';
      const ta = Math.floor(a / 10), tb = Math.floor(b / 10);
      return [{html: big(a + ' ▢ ' + b), say:'Compare ' + a + ' and ' + b + '.'},
        {html: big(a + ' ▢ ' + b), say: ta !== tb ? 'Look at the tens first: ' + ta + ' tens and ' + tb + ' tens.' : 'The tens are the same, so look at the ones: ' + a % 10 + ' and ' + b % 10 + '.'},
        {html: big(a + ' <b class="ok">' + sym + '</b> ' + b), say: a === b ? 'They are equal.' : a + (a > b ? ' is greater than ' : ' is less than ') + b + '. The open side faces the bigger number.'}]; }
    if(it.hc){ const end = it.a;
      return [{html: hundredChartHTML(it.top, it.top) + big(it.top + ' ' + it.op + ' ' + it.bottom), say: it.top + (it.op === '+' ? ' plus ' : ' take away ') + it.bottom + '.'},
        {html: hundredChartHTML(it.top, end), say:'On the hundred chart, ' + (it.op === '+' ? 'each 10 is one row down.' : 'each 10 is one row up.') + ' The ones stay the same.'},
        {html: hundredChartHTML(it.top, end) + big(it.top + ' ' + it.op + ' ' + it.bottom + ' = <b class="ok">' + end + '</b>'), say:'So ' + it.top + (it.op === '+' ? ' plus ' : ' take away ') + it.bottom + ' is ' + end + '.'}]; }
    if(it.kind === 'seq' && it.skip){ const run = it.run.filter(v => v !== '▢');
      return [{html: big(it.run.join(', ').replace('▢', '?')), say:'What comes next?'},
        {html: big(it.run.join(', ').replace('▢', '?')), say:'Each number is ' + it.skip + ' more than the one before. We are counting by ' + it.skip + 's.'},
        {html: big(run.join(', ') + ', <b class="ok">' + it.a + '</b>'), say: run[run.length - 1] + ' plus ' + it.skip + ' is ' + it.a + '.'}]; }
    if(it.grp){ const g = it.grp.g, e = it.grp.each, a = g * e, steps = range(1, g).map(k => k * e).join(', ');
      const pic = it.grp.as === 'array' ? arrayHTML(g, e) : groupsHTML(g, e);
      return [{html: pic, say: it.grp.as === 'rep' ? 'Adding the same number again and again is the same as times.' : 'How many in all?'},
        {html: pic, say: g + (it.grp.as === 'array' ? ' rows' : ' groups') + ', with ' + e + ' in each. Count by ' + e + 's: ' + steps + '.'},
        {html: pic + big(g + ' × ' + e + ' = <b class="ok">' + a + '</b>'), say: g + ' groups of ' + e + ' is ' + a + '. We write it ' + g + ' times ' + e + '.'}]; }
    if(it.ph){ const w = it.ph.w;
      return [{html: big('🔊 ' + H(w)), say:'Listen: ' + w + '.'},
        {html: '<div class="ln-words">' + it.words.map(x => '<span>' + H(x) + '</span>').join('') + '</div>', say:'Look at every choice. Find the letters that make the sounds you heard.'},
        {html: big(markPattern(w, it.ph.pat)), say: w + '. ' + (it.ph.pat === 'e' ? 'The e at the end makes the vowel say its name.' : it.ph.pat === 'blend' ? 'You can hear both consonants together.' : 'These letters work together in ' + w + '.')}]; }
    if(it.cnt){ const w = it.cnt.w, n = it.cnt.n;
      return [{html: big('🔊 ' + H(w)), say:'Listen: ' + w + '.'},
        {html: '<span class="v87bx big">' + '<i></i>'.repeat(n) + '</span>', say:'Say it slowly and tap a finger for each sound.'},
        {html: '<span class="v87bx big">' + '<i class="on"></i>'.repeat(n) + '</span>' + big('<b class="ok">' + n + '</b>'), say: w + ' has ' + n + ' sounds.'}]; }
    if(it.endS){ const w = it.endS.w, l = it.endS.last;
      return [{html: big('🔊 ' + H(w)), say:'Listen: ' + w + '.'},
        {html: big(H(w.slice(0, -1)) + '<b class="ph">' + l + '</b>'), say:'Say it slowly and stop on the last sound.'},
        {html: big('<b class="ok">' + l + '</b>'), say:'The last sound is [[' + l + ']]. The letter ' + l + ' makes that sound.'}]; }
  }catch(e){ console.warn('v87 content explain', e); }
  return explain0(it, Lv, sub);
};

/* ---------- one-time: anyone already on the everyday-words spelling levels does phonics first ---------- */
const migrate3 = migrate;
window.migrate = migrate = function(){
  migrate3();
  DB.students.forEach(s => {
    if(s.v87c) return;
    s.v87c = dayKey();
    if(/^2A-\d+$/.test(s.english || '') && !(s.testDue && s.testDue.english)){
      s.english = 'E-1'; s.seen = (s.seen || []).filter(x => x !== 'e:E-1');
    }
  });
};

/* the generic "Directions: tap the speaker" line is noise on these questions */
const cellC = cell;
window.cell = cell = function(it, i, single, n){
  const d = cellC(it, i, single, n);
  try{
    if(it && (it.sense || it.clock || it.ruler || it.grp || it.cmp || it.quick || it.more || it.ph || it.cnt || it.endS)){
      d.querySelectorAll('.note').forEach(x => { if(/^Directions:/.test(x.textContent)) x.remove(); });
    }
  }catch(e){}
  return d;
};

/* ---------- no red clock for young children ---------- */
const render2 = render;
window.render = render = function(){
  render2();
  try{ document.body.classList.toggle('v87young', !!(me && (me.age || 0) < 7)); }catch(e){}
};
})();
