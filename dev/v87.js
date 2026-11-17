/* =====================================================================
   V8.7 — lighter days, story problems and mixed review on every sheet,
   base-ten block lessons for carrying and borrowing, "Trade a ten",
   and an applied-math stop (money, time, measuring, stories) before
   times tables. Layers on V8.6; saved progress is never erased.
   ===================================================================== */
(function(){
'use strict';
const H = s => esc(String(s == null ? '' : s));
const range = (a, b) => { const o = []; for(let x = a; x <= b; x++) o.push(x); return o; };
const KINDS = new Set(['story2','trade','money']);
window.V87_KINDS = KINDS;
const young = s => (s && (s.age || 0) <= 5);

/* =====================================================================
   1. DAILY AMOUNT — sheets per subject, questions per sheet
   ===================================================================== */
const defaultDaily0 = defaultDailySheets;
window.defaultDailySheets = defaultDailySheets = function(age){
  if(age <= 5) return 2;
  if(age <= 7) return 3;
  return defaultDaily0(age);
};
window.v87PerDay = function(sub){
  if(!me) return 3;
  const v = sub === 'english' ? me.perDayEng : sub === 'math' ? me.perDayMath : null;
  return v || me.perDay || defaultDailySheets(me.age);
};
const qPer = () => (me && me.qPerSheet) || (young(me) ? 6 : 10);
window.v87QPer = qPer;

window.paintPerDay = paintPerDay = function(){
  const row = (id, vals, cur, set) => {
    const r = document.getElementById(id); if(!r) return;
    r.innerHTML = '';
    vals.forEach(n => {
      const b = document.createElement('button');
      b.textContent = n; b.setAttribute('aria-pressed', String(cur === n));
      b.onclick = () => { set(n); save(); paintPerDay(); try{ paintHome(); }catch(e){} };
      r.appendChild(b);
    });
  };
  row('perDayMathRow', [1,2,3,4,5,6], v87PerDay('math'), n => me.perDayMath = n);
  row('perDayEngRow', [1,2,3,4,5,6], v87PerDay('english'), n => me.perDayEng = n);
  row('qPerRow', [6,8,10], qPer(), n => me.qPerSheet = n);
  const m = v87PerDay('math'), e = v87PerDay('english'), q = qPer();
  const mins = Math.round((m + e) * q * 0.42);
  const h = document.getElementById('perDayHint');
  if(h) h.innerHTML = '<b>Each day:</b> ' + m + ' math ' + (m === 1 ? 'sheet' : 'sheets') + ' and ' + e + ' reading ' + (e === 1 ? 'sheet' : 'sheets') +
    ', about ' + q + ' questions each — roughly ' + Math.max(5, mins - 5) + '–' + (mins + 5) + ' minutes in all. ' +
    'Moving up still takes 3 good days on a level, so fewer sheets does not slow her down — it just takes the grind out. ' +
    'If she is tired or frustrated, stop after a right answer; tomorrow goes better.';
};

/* =====================================================================
   2. VISUALS
   ===================================================================== */
/* base-ten blocks: rods of ten and loose ones */
function blocksHTML(o){
  o = o || {};
  const rods = o.rods || 0, ones = o.ones || 0;
  let s = '<div class="v87blk' + (o.small ? ' sm' : '') + '">';
  s += '<span class="rods">';
  for(let k = 0; k < rods; k++){
    let c = 'rod';
    if(o.newRod && k === rods - 1) c += ' fresh';
    if(o.goneRods && k >= rods - o.goneRods) c += ' gone';
    if(o.tapRods) c += ' tap';
    if(o.hiRods) c += ' hi';
    if(o.altRods && k >= rods - o.altRods && !(o.newRod && k === rods - 1)) c += ' alt';
    s += '<i class="' + c + '" data-k="' + k + '">' + '<b></b>'.repeat(10) + '</i>';
  }
  s += '</span><span class="ones">';
  for(let k = 0; k < ones; k++){
    let c = 'cube';
    if(o.fresh && k < o.fresh) c += ' fresh';
    if(o.altOnes && k >= ones - o.altOnes) c += ' alt';
    if(o.goneOnes && k >= ones - o.goneOnes) c += ' gone';
    if(o.hiOnes) c += ' hi';
    s += '<b class="' + c + '"></b>';
  }
  return s + '</span></div>';
}
/* written column problem with the marks a child would write */
function colHTML(x, y, op, st){
  st = st || {};
  const xT = Math.floor(x / 10), xO = x % 10, yT = Math.floor(y / 10), yO = y % 10;
  const ans = op === '+' ? x + y : x - y, aH = Math.floor(ans / 100), aT = Math.floor(ans / 10) % 10, aO = ans % 10;
  const cell = (cls, v) => '<span class="' + cls + '">' + v + '</span>';
  const mark = st.borrow ? cell('h', '') + cell('t mk', xT - 1) + cell('o', '')
             : st.carry ? cell('h', '') + cell('t mk', '1') + cell('o', '') : cell('h', '') + cell('t', '') + cell('o', '');
  const topT = xT ? (st.borrow ? '<s>' + xT + '</s>' : String(xT)) : '';
  const topO = (st.borrow ? '<sup>1</sup>' : '') + xO;
  const showO = st.ones || st.done, showT = st.tens || st.done;
  const hiT = st.hiTens ? ' hi' : '', hiO = st.hiOnes ? ' hi' : '';
  return '<div class="v87col">' +
    '<div class="r m"><span class="op"></span>' + mark + '</div>' +
    '<div class="r"><span class="op"></span>' + cell('h', '') + cell('t' + hiT, topT) + cell('o' + hiO, topO) + '</div>' +
    '<div class="r"><span class="op">' + op + '</span>' + cell('h', '') + cell('t' + hiT, yT || '') + cell('o' + hiO, yO) + '</div>' +
    '<div class="bar"></div>' +
    '<div class="r a"><span class="op"></span>' + cell('h', showT && aH ? aH : '') + cell('t', showT && ans >= 10 ? aT : '') + cell('o', showO ? aO : '') + '</div></div>';
}
const big = s => '<div class="ln-big">' + s + '</div>';
const pair = (a, b) => '<div class="v87pair">' + a + b + '</div>';

/* bar models (Singapore) */
function barHTML(it, solved){
  const Q = solved ? '<b class="okv">' + it.a + '</b>' : '<b class="qv">?</b>';
  const n = v => '<b>' + v + '</b>';
  const seg = (v, label, cls) => '<span class="seg ' + (cls || '') + '" style="flex:' + Math.max(v, 1) + ' 1 0">' + label + '</span>';
  const t = it.type, x = it.x, y = it.y;
  if(t === 'join' || t === 'partW' || t === 'sep' || t === 'partP'){
    const whole = (t === 'join' || t === 'partW') ? x + y : x;
    const wl = (t === 'join' || t === 'partW') ? Q : n(x);
    let segs;
    if(t === 'join' || t === 'partW') segs = seg(x, n(x)) + seg(y, n(y), 'b2');
    else if(t === 'sep') segs = seg(x - y, Q, 'unk') + seg(y, n(y) + '<small>given away</small>', 'gone');
    else segs = seg(y, n(y)) + seg(x - y, Q, 'unk');
    return '<div class="v87bar"><div class="whole"><span>' + wl + '</span></div><div class="track">' + segs + '</div></div>';
  }
  if(t === 'comp'){
    return '<div class="v87cmp">' +
      '<div class="r"><i>' + H(it.p1) + '</i><div class="track">' + seg(x, n(x)) + '</div></div>' +
      '<div class="r"><i>' + H(it.p2) + '</i><div class="track">' + seg(y, n(y), 'b2') + seg(x - y, Q, 'unk dash') + '</div></div></div>';
  }
  /* compMore: p2 has y more than p1 (x) */
  return '<div class="v87cmp">' +
    '<div class="r"><i>' + H(it.p1) + '</i><div class="track">' + seg(x, n(x)) + seg(y, '', 'void') + '</div></div>' +
    '<div class="r"><i>' + H(it.p2) + '</i><div class="track">' + seg(x, n(x), 'same') + seg(y, n(y) + '<small>more</small>', 'b2') + '</div><em>= ' + Q + '</em></div></div>';
}
/* coins */
const COIN = {q:{v:25, cls:'q', t:'25¢'}, d:{v:10, cls:'d', t:'10¢'}, n:{v:5, cls:'n', t:'5¢'}, p:{v:1, cls:'p', t:'1¢'}};
function coinsHTML(coins, hi){
  return '<div class="v87coins">' + coins.map((c, k) => '<span class="coin ' + COIN[c].cls + (hi && hi.includes(k) ? ' hi' : '') + '">' + COIN[c].t + '</span>').join('') + '</div>';
}
/* analog clock */
function clockSVG(h, m){
  const ang = d => (d - 90) * Math.PI / 180;
  const hd = ((h % 12) + m / 60) * 30, md = m * 6;
  let s = '<svg viewBox="0 0 200 200" class="v87clk" aria-hidden="true"><circle cx="100" cy="100" r="94" class="face"/>';
  for(let k = 1; k <= 12; k++){
    const a = ang(k * 30);
    s += '<text x="' + (100 + 74 * Math.cos(a)).toFixed(1) + '" y="' + (100 + 74 * Math.sin(a) + 8).toFixed(1) + '">' + k + '</text>';
  }
  for(let k = 0; k < 60; k++){
    const a = ang(k * 6), r1 = k % 5 ? 88 : 84;
    s += '<line x1="' + (100 + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (100 + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (100 + 92 * Math.cos(a)).toFixed(1) + '" y2="' + (100 + 92 * Math.sin(a)).toFixed(1) + '" class="tick"/>';
  }
  s += '<line x1="100" y1="100" x2="' + (100 + 46 * Math.cos(ang(hd))).toFixed(1) + '" y2="' + (100 + 46 * Math.sin(ang(hd))).toFixed(1) + '" class="hh"/>';
  s += '<line x1="100" y1="100" x2="' + (100 + 72 * Math.cos(ang(md))).toFixed(1) + '" y2="' + (100 + 72 * Math.sin(ang(md))).toFixed(1) + '" class="mh"/>';
  return s + '<circle cx="100" cy="100" r="6" class="hub"/></svg>';
}
/* ruler in inches with an object on it */
function rulerSVG(start, end, color, label){
  const x0 = 20, u = 34;
  let s = '<svg viewBox="0 0 380 118" class="v87rul" aria-hidden="true">';
  s += '<rect x="' + (x0 + start * u) + '" y="14" width="' + ((end - start) * u) + '" height="26" rx="12" fill="' + color + '"/>';
  s += '<polygon points="' + (x0 + end * u) + ',27 ' + (x0 + end * u - 12) + ',16 ' + (x0 + end * u - 12) + ',38" fill="' + color + '" opacity=".75"/>';
  s += '<rect x="' + x0 + '" y="54" width="' + (10 * u) + '" height="44" rx="4" class="body"/>';
  for(let k = 0; k <= 10; k++){
    s += '<line x1="' + (x0 + k * u) + '" y1="54" x2="' + (x0 + k * u) + '" y2="72" class="tk"/>';
    s += '<text x="' + (x0 + k * u) + '" y="90">' + k + '</text>';
    if(k < 10) s += '<line x1="' + (x0 + k * u + u / 2) + '" y1="54" x2="' + (x0 + k * u + u / 2) + '" y2="63" class="tk"/>';
  }
  s += '<text x="' + (x0 + 10 * u + 6) + '" y="80" class="unit">in</text>';
  return s + '</svg>';
}

/* =====================================================================
   3. QUESTION BUILDERS
   ===================================================================== */
const NAMES = ['Sam','Mia','Leo','Ava','Ben','Zoe','Max','Lily','Noah','Ella','Omar','Nina','Jack','Ruby'];
const THINGS = ['stickers','marbles','shells','cards','beads','stamps','blocks','crayons','buttons','rocks'];
function story2(type, x, y){
  const ps = sample(NAMES, 2), p1 = ps[0], p2 = ps[1], th = pick(THINGS);
  let a, text;
  if(type === 'join'){ a = x + y; text = p1 + ' has ' + x + ' ' + th + '. ' + p1 + ' gets ' + y + ' more. How many ' + th + ' does ' + p1 + ' have now?'; }
  else if(type === 'partW'){ a = x + y; text = p1 + ' has ' + x + ' red ' + th + ' and ' + y + ' blue ' + th + '. How many ' + th + ' does ' + p1 + ' have in all?'; }
  else if(type === 'compMore'){ a = x + y; text = p1 + ' has ' + x + ' ' + th + '. ' + p2 + ' has ' + y + ' more than ' + p1 + '. How many ' + th + ' does ' + p2 + ' have?'; }
  else if(type === 'sep'){ a = x - y; text = p1 + ' has ' + x + ' ' + th + '. ' + p1 + ' gives ' + y + ' to ' + p2 + '. How many ' + th + ' does ' + p1 + ' have left?'; }
  else if(type === 'partP'){ a = x - y; text = p1 + ' has ' + x + ' ' + th + '. ' + y + ' of them are red and the rest are blue. How many are blue?'; }
  else { type = 'comp'; a = x - y; text = p1 + ' has ' + x + ' ' + th + '. ' + p2 + ' has ' + y + ' ' + th + '. How many more ' + th + ' does ' + p1 + ' have than ' + p2 + '?'; }
  return {kind:'story2', type, x, y, a, p1, p2, th, text, q:text, say:text, audioRate:0.86, key:'s2:' + type + ':' + x + ':' + y};
}
const ADD_TYPES = ['join','partW','compMore'], SUB_TYPES = ['sep','partP','comp'];
function storyFromMath(it){
  if(!it || it.kind !== 'math') return null;
  const x = it.top, y = it.bottom;
  if(!(x >= 2 && y >= 2) || it.a >= 1000) return null;
  if(it.op === '+') return story2(pick(ADD_TYPES), x, y);
  if(it.op === '−' && x - y >= 1) return story2(pick(SUB_TYPES), x, y);
  return null;
}
window.v87story2 = story2;

/* "does it make sense?" — estimate, or use the opposite operation */
function senseFromMath(it){
  if(!it || it.kind !== 'math' || (it.op !== '+' && it.op !== '−')) return null;
  const x = it.top, y = it.bottom, op = it.op, ans = it.a;
  if(!(ans >= 1)) return null;
  const big = Math.max(x, y, ans), u = big >= 200 ? 100 : 10;
  const r = v => Math.round(v / u) * u;
  const est = op === '+' ? r(x) + r(y) : r(x) - r(y);
  if(big >= 20 && ans % u !== u / 2 && est === r(ans) && est > 0 && Math.random() < .55){
    const start = Math.max(u, est - u * rnd(3));
    let opts = [0,1,2,3].map(k => start + k * u);
    if(!opts.includes(est)) opts = [est - u, est, est + u, est + 2 * u].filter(v => v > 0);
    const q = 'About how much is <b>' + x + ' ' + op + ' ' + y + '</b>? Do not work it out — think in ' + (u === 10 ? 'tens' : 'hundreds') + '.';
    return {kind:'choice', sense:'est', q, opts: opts.map(String), a: opts.indexOf(est), key:'sense:e:' + x + op + y, given:null, spkLabel:'Hear it',
      say:'About how much is ' + x + (op === '+' ? ' plus ' : ' minus ') + y + '? Do not work it out. Think in ' + (u === 10 ? 'tens' : 'hundreds') + '.',
      ex:{x, y, op, ans, u, rx:r(x), ry:r(y), est}};
  }
  let q, a, opts;
  if(op === '−'){ q = ans + ' + ' + y + ' = ' + x + '.  So <b>' + x + ' − ' + y + ' = ?</b>'; a = ans; opts = [ans, y, x, x + y]; }
  else { q = x + ' + ' + y + ' = ' + ans + '.  So <b>' + ans + ' − ' + y + ' = ?</b>'; a = x; opts = [x, y, ans, ans + y]; }
  opts = [...new Set(opts)];
  for(let k = 1; opts.length < 4 && k < 40; k++){ const v = a + 10 * k; if(!opts.includes(v)) opts.push(v); }
  opts = shuffle(opts);
  const said = op === '−' ? ans + ' plus ' + y + ' equals ' + x + '. So ' + x + ' minus ' + y + ' equals what?' : x + ' plus ' + y + ' equals ' + ans + '. So ' + ans + ' minus ' + y + ' equals what?';
  return {kind:'choice', sense:'inv', q, opts: opts.map(String), a: opts.indexOf(a), key:'sense:i:' + x + op + y, given:null, ex:{x, y, op, ans}, say:said, spkLabel:'Hear it'};
}

/* trade a ten */
const tw = n => n + (n === 1 ? ' ten' : ' tens'), ow = n => n + (n === 1 ? ' one' : ' ones');
function tradeItem(ask){
  const t = 2 + rnd(7), o = rnd(10), n = t * 10 + o;
  ask = ask || pick(['ones','ones','tens','same']);
  if(ask === 'ones') return {kind:'trade', ask, t, o, n, a: o + 10, key:'tr:o:' + n,
    q: n + ' is ' + tw(t) + ' and ' + ow(o) + '. Trade one ten for ten ones. Now there are ' + tw(t - 1) + ' and how many ones?',
    say: n + ' is ' + tw(t) + ' and ' + ow(o) + '. Trade one ten for ten ones. Now there are ' + tw(t - 1) + ' and how many ones?'};
  if(ask === 'tens') return {kind:'trade', ask, t, o, n, a: t - 1, key:'tr:t:' + n,
    q: 'Trade one ten in ' + n + ' for ten ones. How many tens are left?', say: 'Trade one ten in ' + n + ' for ten ones. How many tens are left?'};
  return {kind:'trade', ask:'same', t, o, n, a: n, key:'tr:s:' + n,
    q: tw(t - 1) + ' and ' + ow(o + 10) + '. What number is that?', say: tw(t - 1) + ' and ' + ow(o + 10) + '. What number is that?'};
}
function tradeVisual(it, solved){
  if(it.ask === 'same' && !solved) return blocksHTML({rods: it.t - 1, ones: it.o + 10, fresh: 10});
  if(it.ask === 'same') return blocksHTML({rods: it.t, ones: it.o, newRod: true});
  return solved ? blocksHTML({rods: it.t - 1, ones: it.o + 10, fresh: 10}) : blocksHTML({rods: it.t, ones: it.o});
}

/* money: pennies, nickels, dimes */
function moneyItem(){
  let coins, total, g = 0;
  do {
    const d = rnd(5), nk = rnd(4), p = rnd(6);
    coins = [].concat(Array(d).fill('d'), Array(nk).fill('n'), Array(p).fill('p'));
    total = d * 10 + nk * 5 + p;
  } while((total < 6 || new Set(coins).size < 2 || coins.length > 11) && g++ < 50);
  coins = shuffle(coins);
  return {kind:'money', coins, a: total, q:'How much money is this? (in cents)', say:'How much money is this? Count the coins.', key:'mo:' + coins.slice().sort().join('')};
}

/* telling time to the hour and half hour */
const fmt = (h, m) => h + ':' + (m ? '30' : '00');
function clockItem(){
  const h = 1 + rnd(12), m = pick([0, 30]);
  const nx = h % 12 + 1, pv = (h + 10) % 12 + 1;
  const c = new Set([fmt(h, m), fmt(h, 30 - m), m ? fmt(nx, 30) : fmt(nx, 0), m ? fmt(pv, 0) : fmt(pv, 30)]);
  let k = 2; while(c.size < 4){ c.add(fmt((h + k) % 12 + 1, m)); k++; }
  const opts = shuffle([...c]);
  return {kind:'choice', clock:{h, m}, say:'What time is it? Look at the short hand, then the long hand.', spkLabel:'Hear it', q:'<div class="v87clkwrap">' + clockSVG(h, m) + '</div>What time is it?', opts, a: opts.indexOf(fmt(h, m)), given:null, key:'clk:' + fmt(h, m)};
}

/* measuring with a ruler */
const RULE_THINGS = [['crayon','#E8590C'],['pencil','#F2B705'],['ribbon','#C2255C'],['straw','#2B8A3E'],['worm','#B5651D'],['key','#868E96']];
function rulerItem(){
  const start = Math.random() < .3 ? 1 + rnd(2) : 0, len = 2 + rnd(6), end = start + len;
  const th = pick(RULE_THINGS);
  const c = new Set([len, len + 1, len - 1]);
  if(start) c.add(end);
  let k = 2; while(c.size < 4){ c.add(len + k); k++; }
  const opts = shuffle([...c].filter(v => v >= 1).slice(0, 4));
  while(opts.length < 4){ const v = len + opts.length + 1; if(!opts.includes(v)) opts.push(v); }
  return {kind:'choice', ruler:{start, end, len, name: th[0]}, say:'How long is the ' + th[0] + '?' + (start ? ' Careful, look where it starts.' : ''), spkLabel:'Hear it', q:'<div class="v87rulwrap">' + rulerSVG(start, end, th[1]) + '</div>How long is the ' + th[0] + '?' +
    (start ? ' <small>(Careful — look where it starts.)</small>' : ''), opts: opts.map(v => v + (v === 1 ? ' inch' : ' inches')),
    a: opts.indexOf(len), given:null, key:'rul:' + start + ':' + end + ':' + th[0]};
}

/* =====================================================================
   4. NEW LEVELS
   ===================================================================== */
const NEW = {};
NEW.trade = {id:'B-6t', skill:'Trade a ten for ten ones', n:SHEET_N, sct:330,
  lesson:{title:'Trade a ten', sub:'One ten is the same as ten ones',
    demo:'<div class="say">34 = 3 tens + 4 ones = 2 tens + 14 ones</div><div class="cap">Same amount — one ten was traded for ten ones.</div>',
    steps:['A ten stick is ten ones stuck together.','Break one ten into ten ones.','Now there is one less ten and ten more ones — the number stays the same.'],
    tip:'This is the whole idea behind borrowing. Before she borrows on paper, she needs to know that 34 can be 2 tens and 14 ones. ' +
        'Trade a dime for ten pennies, or snap a ten-stick of Legos apart. Ask: "Did we lose any? Is it still 34?"'},
  gen(){ return tradeItem(); }};
NEW.money = {id:'B-10a', skill:'Counting money: pennies, nickels and dimes', n:SHEET_N, sct:420,
  lesson:{title:'Counting coins', sub:'Biggest coins first, then count on',
    demo:coinsHTML(['d','d','n','p','p']) + '<div class="cap">10, 20 … 25 … 26, 27. That is 27¢.</div>',
    steps:['Find the coins worth the most (dimes are 10¢).','Count them by tens: 10, 20, 30…','Count on the nickels by fives, then the pennies by ones.'],
    tip:'Real coins beat any screen here. Put a handful on the table and have her sort them first — dimes, nickels, pennies — then count on from the biggest. ' +
        'A dime is smaller than a nickel but worth more; that surprises most kids, so say it out loud.'},
  gen(){ return moneyItem(); }};
NEW.time = {id:'B-10b', skill:'Telling time: o’clock and half past', n:SHEET_N, sct:300,
  lesson:{title:'Telling time', sub:'The short hand is the hour, the long hand is the minutes',
    demo:'<div class="v87clkwrap sm">' + clockSVG(3, 30) + '</div><div class="cap">Short hand just past 3, long hand on 6: half past 3, 3:30.</div>',
    steps:['Find the short hand — it tells the hour.','Find the long hand — on 12 means o’clock, on 6 means half past.','Half past: the short hand is halfway to the next number.'],
    tip:'Say the time out loud during the day ("it is 7 o’clock — dinner"). A real analog clock in the kitchen helps more than anything. ' +
        'The common mistake at half past is reading the next hour, because the short hand is halfway there.'},
  gen(){ return clockItem(); }};
NEW.ruler = {id:'B-10c', skill:'Measuring with a ruler', n:SHEET_N, sct:300,
  lesson:{title:'Measuring', sub:'Line up at 0 and read where it ends',
    demo:'<div class="v87rulwrap sm">' + rulerSVG(0, 5, '#E8590C') + '</div><div class="cap">Starts at 0, ends at 5 — 5 inches long.</div>',
    steps:['Look where the thing starts — it should be at 0.','Look where it ends.','If it does not start at 0, count the spaces between start and end.'],
    tip:'Let her measure real things with a real ruler: a spoon, a crayon, her foot. The tricky case is something that does not start at 0 — counting the spaces (not the lines) is the key idea.'},
  gen(){ return rulerItem(); }};
NEW.stories = {id:'B-10d', skill:'Story problems: add or take away?', n:8, sct:600,
  lesson:{title:'Add or take away', sub:'The story tells you what to do — not the words',
    demo:'<div class="say">Sam has 45. Mia has 18. How many more does Sam have?</div><div class="cap">Draw two bars. The extra bit is 45 − 18 = 27.</div>',
    steps:['Read the story. What do we know? What is missing?','Draw a bar picture: parts and a whole, or two bars to compare.','Whole missing → add. Part or difference missing → take away.'],
    tip:'Every story on this sheet is mixed: some add, some take away, and the words will not tell her which. That is the real test of understanding. ' +
        'Ask her to point to the part of the bar picture that is missing before she works anything out. "How many more" stories are the hardest — that is normal.'},
  gen(){
    const t = pick(ADD_TYPES.concat(SUB_TYPES));
    if(ADD_TYPES.includes(t)){ const x = 12 + rnd(55), y = 11 + rnd(Math.min(40, 98 - x - 11)); return story2(t, x, y); }
    const x = 31 + rnd(65), y = 11 + rnd(x - 21); return story2(t, x, y);
  }};
window.V87_NEW = NEW;
function insBefore(list, id, items){ const i = list.findIndex(l => l.id === id); if(i < 0) return false; list.splice(i, 0, ...items); return true; }
function insAfter(list, id, items){ const i = list.findIndex(l => l.id === id); if(i < 0) return false; list.splice(i + 1, 0, ...items); return true; }
if(!MATH.some(l => l.id === 'B-6t')){
  insBefore(MATH, 'B-7', [NEW.trade]);
  insAfter(MATH, 'B-9', [NEW.money, NEW.time, NEW.ruler, NEW.stories]);
}

/* =====================================================================
   5. EVERY SHEET: stories, a "does it make sense?" question, mixed review
   ===================================================================== */
const MIX_KINDS = new Set(['math','seq','count','bond','tens','story','story2','trade','money','choice']);
function masteredMath(){
  const list = ladder('math'), cur = list.findIndex(l => l.id === me.math);
  const done = new Set();
  (me.history || []).forEach(h => { if(h.subject === 'math' && h.mastered) done.add(h.level); });
  Object.keys(me.skillStats || {}).forEach(k => {
    const i = k.indexOf(':'), v = me.skillStats[k];
    if(k.slice(0, i) === 'math' && v && v.passes >= 1) done.add(k.slice(i + 1));
  });
  return list.filter((l, ix) => ix < cur && done.has(l.id));
}
function oneFrom(L, single){
  let raw = [];
  try { if(typeof L.gen === 'function'){ for(let g = 0; g < 5; g++) raw.push(L.gen()); } else raw = L.build(4); } catch(e){ return null; }
  if(raw.some(i => i && i.kind === 'passage')) return null;
  const ok = raw.filter(it => it && MIX_KINDS.has(it.kind) && !it.hw && !(it.kind === 'choice' && (it.phoneme || (it.say && !it.sense && !it.clock && !it.ruler)) && !single));
  if(!ok.length) return null;
  const it = JSON.parse(JSON.stringify(pick(ok)));
  if(it.kind === 'math'){ it.stack = L.stack; if(writeMode()) it.penMath = true; }
  return it;
}
function mixItems(n, keys, single){
  if(n <= 0) return [];
  const done = masteredMath();
  if(!done.length) return [];
  const recent = done.slice(-6), older = done.slice(0, -6), out = [];
  for(let g = 0; out.length < n && g < 24; g++){
    const L = (older.length && Math.random() < .3) ? pick(older) : pick(recent);
    const it = oneFrom(L, single);
    if(!it || keys.has(it.key)) continue;
    keys.add(it.key);
    Object.assign(it, {review:true, mixed:true, lv:L.id, given:(it.kind === 'choice' || it.kind === 'pic') ? null : ''});
    seqSafe(it);
    out.push(it);
  }
  return out;
}
const storyLevel = lv => /^B-\d+$/.test(lv) || lv === 'A-1' || lv === 'A-2' || lv === 'E-1' || lv === 'E-2';
function daysAtLevel(sub, lv){
  return new Set((me.history || []).filter(h => h.subject === sub && h.level === lv).map(h => h.d)).size;
}
function compose(sh){
  if(!sh || sh.isTest || sh.isCheckup || !me) return sh;
  const Q = qPer(), L = lvl(sh.subject, sh.level), cap = Q >= 10 ? 2 : 1;
  const items = sh.items;
  /* keep spaced-review items, keep at most `cap` repair items */
  const ret = items.filter(i => i.retention), rep = items.filter(i => i.review && !i.retention);
  const oldKeep = ret.concat(rep.slice(0, Math.max(0, cap - ret.length)));
  let core = items.filter(i => !i.review && !i.retention);
  if(items.some(i => i.kind === 'passage')){
    sh.items = items.filter(i => !i.review || oldKeep.includes(i));
    return sh;
  }
  const early = daysAtLevel(sh.subject, sh.level) < 2;
  const isMath = sh.subject === 'math';
  const mixedN = (isMath && !early) ? Math.max(0, cap - oldKeep.length) : 0;
  const mixed = mixItems(mixedN, new Set(core.map(i => i.key)), !!sh.single);
  const target = Math.max(3, Math.min(core.length, Q) - oldKeep.length - mixed.length);
  const plain = it => it.kind !== 'aloud' && it.kind !== 'story' && it.kind !== 'story2';
  while(core.length > target){
    let k = -1;
    for(let j = core.length - 1; j >= 0; j--) if(plain(core[j])){ k = j; break; }
    if(k < 0) break;
    core.splice(k, 1);
  }
  let stories = 0, senses = 0;
  if(isMath && storyLevel(sh.level)){
    const want = Q >= 8 ? 2 : 1, slots = Q >= 8 ? [2, 6] : [2];
    const mathIdx = () => core.map((it, k) => k).filter(k => core[k].kind === 'math');
    slots.slice(0, want).forEach(p => {
      const idx = mathIdx(); if(!idx.length) return;
      const k = idx.reduce((b, j) => Math.abs(j - p) < Math.abs(b - p) ? j : b, idx[0]);
      const st = storyFromMath(core[k]);
      if(st){ core[k] = Object.assign({given:''}, st); stories++; }
    });
    if(Q >= 8){
      const idx = mathIdx();
      for(let t = idx.length - 1; t >= 0; t--){
        const s = senseFromMath(core[idx[t]]);
        if(s){ core[idx[t]] = s; senses++; break; }
      }
    }
  }
  const extra = oldKeep.concat(mixed);
  const spots = [3, 7, 5, 9];
  extra.forEach((it, k) => core.splice(Math.min(core.length, spots[k % spots.length] + k), 0, it));
  /* in a worksheet grid, the quick problems come first and the
     full-width ones (stories, pictures, questions) follow them */
  if(!sh.single){
    const wide = it => it.kind === 'story2' || it.kind === 'story' || it.kind === 'choice' || it.kind === 'pic' || it.kind === 'trade' || it.kind === 'money';
    if(core.some(wide) && core.some(it => !wide(it))) core = core.filter(it => !wide(it)).concat(core.filter(wide));
  }
  sh.items = core;
  sh.sct = Math.round((L.sct || sh.sct) * Math.min(1, Q / (L.n || 10))) + 25 * stories + 10 * senses;
  sh.v87 = {Q, stories, senses, mixed: mixed.length, early};
  return sh;
}
window.v87compose = compose;
const buildSheet1 = buildSheet;
window.buildSheet = buildSheet = function(subject){
  let sh = buildSheet1(subject);
  try{ sh = compose(sh); }catch(e){ console.error('v87 compose', e); }
  return sh;
};

/* mastery is judged on this level's own questions — review never blocks moving up.
   One slip is allowed when there are at least 6 of them; fewer must all be right. */
window.v87AccuracyOK = function(score, total){
  const l = live().filter(i => !i.review && !i.retention && !i.mixed);
  if(!l.length) return total ? score / total >= 0.9 : false;
  const miss = l.filter(i => i.firstWrong).length;
  return l.length >= 6 ? miss <= Math.max(1, Math.floor(l.length / 10)) : miss === 0;
};

/* =====================================================================
   6. DRAWING THE NEW QUESTION TYPES ON THE WORKSHEET
   ===================================================================== */
function visualFor(it, solved){
  if(it.kind === 'story2') return barHTML(it, solved);
  if(it.kind === 'trade') return tradeVisual(it, solved);
  if(it.kind === 'money') return coinsHTML(it.coins);
  return '';
}
function nextOpen(i){
  if(sheet.single) return afterAnswer();
  const l = activeIdx(), at = l.indexOf(i);
  const nx = l.slice(at + 1).concat(l.slice(0, Math.max(0, at))).find(k => !answered(sheet.items[k]));
  if(nx !== undefined) sel = nx;
  render();
}
function padEl(it, i){
  const p = document.createElement('div'); p.className = 'v87pad';
  ['1','2','3','4','5','6','7','8','9','⌫','0','✓'].forEach(k => {
    const b = document.createElement('button'); b.textContent = k; if(k === '✓') b.className = 'go';
    b.onclick = e => {
      e.stopPropagation();
      if(k === '⌫') it.given = String(it.given || '').slice(0, -1);
      else if(k === '✓'){ if(String(it.given || '').length) return nextOpen(i); return; }
      else if(String(it.given || '').length < 4) it.given = String(it.given || '') + k;
      sel = i; render();
    };
    p.appendChild(b);
  });
  return p;
}
function v87cell(it, i, single, n){
  const d = document.createElement('div');
  d.className = 'v87cell item' + (i === sel ? ' sel' : '') + (phase === 'fix' && it.wrong ? ' redo' : '');
  if(single) d.style.cssText = 'border:none;text-align:center;padding:18px 16px';
  const num = single ? '' : '<span class="n">' + (n || i + 1) + '</span>' + (it.review ? '<span class="rev">REVIEW</span>' : '');
  const locked = phase === 'mark' || (phase === 'fix' && !it.wrong);
  const unit = it.kind === 'money' ? '¢' : '';
  const spk = '<button class="speak v87spk">🔊 ' + (it.kind === 'story2' ? 'Hear the story' : 'Hear it') + '</button>';
  const vis = '<div class="v87vis">' + visualFor(it, !!it.reveal) + '</div>';
  const ask = it.kind === 'story2' ? '<p class="v87story">' + H(it.text) + '</p>' : '<p class="v87ask">' + H(it.q) + '</p>';
  const g = String(it.given || '');
  d.innerHTML = num + '<div class="v87spkrow">' + spk + '</div>' + (it.kind === 'story2' ? ask + vis : vis + ask) +
    '<div class="v87ansrow"><span class="v87ans' + (g ? '' : ' empty') + '">' + H(g) + '</span>' + (unit ? '<span class="u">' + unit + '</span>' : '') + markHTML(it) + '</div>' +
    (it.reveal ? '<div class="v87reveal">Answer: ' + it.a + unit + '</div>' : '');
  if(!locked && (i === sel || single)) d.appendChild(padEl(it, i));
  d.onclick = () => selectMe(i);
  const s = d.querySelector('.v87spk');
  if(s) s.onclick = e => { e.stopPropagation(); say(it.say || strip(it.q || ''), it.audioRate || 0.86); };
  return d;
}
const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const cell1 = cell;
window.cell = cell = function(it, i, single, n){ return (it && KINDS.has(it.kind)) ? v87cell(it, i, single, n) : cell1(it, i, single, n); };
const usable1 = usable;
window.usable = usable = function(it){
  if(it && KINDS.has(it.kind)){
    if(typeof it.a !== 'number') return false;
    if(it.kind === 'story2') return !!it.type && typeof it.x === 'number' && typeof it.y === 'number' && !!it.text;
    if(it.kind === 'trade') return typeof it.t === 'number' && typeof it.o === 'number' && !!it.ask;
    if(it.kind === 'money') return Array.isArray(it.coins) && it.coins.length > 0;
  }
  return usable1(it);
};
const isRight1 = isRight;
window.isRight = isRight = function(it){
  if(it && KINDS.has(it.kind)) return String(it.given || '').trim() !== '' && Number(it.given) === it.a;
  return isRight1(it);
};
const asked1 = askedText;
window.askedText = askedText = function(it){
  if(it && it.clock) return 'Clock showing ' + fmt(it.clock.h, it.clock.m) + ' — what time is it?';
  if(it && it.ruler) return 'Ruler: ' + it.ruler.name + ' from ' + it.ruler.start + ' to ' + it.ruler.end + ' in — how long?';
  if(it && it.kind === 'money') return 'Coins: ' + it.coins.map(c => COIN[c].t).join(' ');
  return asked1(it);
};
const EXTRA = ['type','x','y','p1','p2','th','text','t','o','n','ask','coins','mixed','sense','ex','clock','ruler','lv'];
const snap1 = snapshotSheet;
window.snapshotSheet = snapshotSheet = function(){
  const s = snap1();
  try{ s.items.forEach((o, k) => { const it = sheet.items[k]; if(it) EXTRA.forEach(f => { if(it[f] !== undefined && o[f] === undefined) o[f] = it[f]; }); }); }catch(e){}
  return s;
};

/* =====================================================================
   7. LEARN IT — step-by-step examples for the new ideas
   ===================================================================== */
function blocksSteps(it){
  const x = it.top, y = it.bottom, op = it.op;
  const xT = Math.floor(x / 10), xO = x % 10, yT = Math.floor(y / 10), yO = y % 10, ans = op === '+' ? x + y : x - y;
  const tens = (n, w) => n + (n === 1 ? ' ten' : ' tens') + (w ? '' : '');
  const ones = n => n + (n === 1 ? ' one' : ' ones');
  if(op === '−'){
    const need = xO < yO;
    const s = [];
    s.push({html: pair(blocksHTML({rods:xT, ones:xO}), colHTML(x, y, op, {})), say:'Let’s work out ' + x + ' take away ' + y + '. ' + x + ' is ' + tens(xT) + ' and ' + ones(xO) + '.'});
    s.push({html: pair(blocksHTML({rods:xT, ones:xO, hiOnes:true}), colHTML(x, y, op, {hiOnes:true})),
      say: need ? 'Always start with the ones. Can we take ' + yO + ' from ' + xO + '? No — there are not enough ones. Trade one ten for ten ones.'
                : 'Always start with the ones. Can we take ' + yO + ' from ' + xO + '? Yes — there are enough ones.'});
    if(need) s.push({html: pair(blocksHTML({rods:xT - 1, ones:xO + 10, fresh:10}), colHTML(x, y, op, {borrow:true, hiOnes:true})),
      say:'Break one ten into ten ones. Now there are ' + tens(xT - 1) + ' and ' + ones(xO + 10) + '. On paper, cross out the ' + xT + ', write ' + (xT - 1) + ', and put a little 1 in front of the ' + xO + '.'});
    const onesNow = need ? xO + 10 : xO, rodsNow = need ? xT - 1 : xT;
    s.push({html: pair(blocksHTML({rods:rodsNow, ones:onesNow, fresh: need ? 10 : 0, goneOnes:yO}), colHTML(x, y, op, {borrow:need, ones:true, hiOnes:true})),
      say: onesNow + ' take away ' + yO + ' is ' + (onesNow - yO) + '. Write ' + (onesNow - yO) + ' in the ones.'});
    s.push({html: pair(blocksHTML({rods:rodsNow, ones:onesNow, fresh: need ? 10 : 0, goneOnes:yO, goneRods:yT, hiRods:true}), colHTML(x, y, op, {borrow:need, ones:true, tens:true, hiTens:true})),
      say:'Now the tens: ' + rodsNow + ' take away ' + yT + ' is ' + (rodsNow - yT) + '.'});
    s.push({html: pair(blocksHTML({rods:rodsNow - yT, ones:onesNow - yO}), colHTML(x, y, op, {borrow:need, done:true})) + big(x + ' − ' + y + ' = <b class="ok">' + ans + '</b>'),
      say: x + ' take away ' + y + ' is ' + ans + '.'});
    return s;
  }
  const sum = xO + yO, carry = sum >= 10;
  const s = [];
  s.push({html: pair('<div class="v87two">' + blocksHTML({rods:xT, ones:xO, small:true}) + '<b class="pl">+</b>' + blocksHTML({rods:yT, ones:yO, small:true, altRods:yT, altOnes:yO}) + '</div>', colHTML(x, y, op, {})),
    say:'Let’s work out ' + x + ' plus ' + y + '. ' + x + ' is ' + tens(xT) + ' and ' + ones(xO) + '. ' + y + ' is ' + tens(yT) + ' and ' + ones(yO) + '.'});
  s.push({html: pair(blocksHTML({rods:xT + yT, ones:sum, altRods:yT, altOnes:yO, hiOnes:true}), colHTML(x, y, op, {hiOnes:true})),
    say: carry ? 'Start with the ones: ' + xO + ' plus ' + yO + ' is ' + sum + '. That is too many for the ones place — bundle ten ones into a new ten.'
               : 'Start with the ones: ' + xO + ' plus ' + yO + ' is ' + sum + '.'});
  if(carry) s.push({html: pair(blocksHTML({rods:xT + yT + 1, ones:sum - 10, newRod:true}), colHTML(x, y, op, {carry:true, ones:true, hiOnes:true})),
    say:'Ten ones make one ten. Now there are ' + ones(sum - 10) + ' — write ' + (sum - 10) + ' — and carry the new ten: write a little 1 above the tens.'});
  else s.push({html: pair(blocksHTML({rods:xT + yT, ones:sum, altRods:yT, altOnes:yO}), colHTML(x, y, op, {ones:true, hiOnes:true})), say:'Write ' + sum + ' in the ones.'});
  const tt = xT + yT + (carry ? 1 : 0);
  s.push({html: pair(blocksHTML({rods:tt, ones:sum % 10, newRod:carry, hiRods:true}), colHTML(x, y, op, {carry, ones:true, tens:true, hiTens:true})),
    say:'Now the tens: ' + (carry ? '1 plus ' : '') + xT + ' plus ' + yT + ' is ' + tt + '.' + (tt >= 10 ? ' That is ' + tt + ' tens — write ' + (tt % 10) + ' in the tens and 1 in the hundreds, because ten tens make a hundred.' : '')});
  s.push({html: pair(blocksHTML({rods:tt, ones:sum % 10}), colHTML(x, y, op, {carry, done:true})) + big(x + ' + ' + y + ' = <b class="ok">' + ans + '</b>'),
    say: x + ' plus ' + y + ' is ' + ans + '.'});
  return s;
}
function storySteps(it){
  const t = it.type, x = it.x, y = it.y, a = it.a;
  const head = '<p class="ln-stepline">' + H(it.text) + '</p>';
  const hint = {join:'Draw a bar with two parts: ' + x + ' and ' + y + '. We want the whole bar.',
    partW:'Two parts: ' + x + ' red and ' + y + ' blue. We want the whole bar.',
    compMore: it.p2 + '’s bar is as long as ' + it.p1 + '’s, plus ' + y + ' more. We want all of ' + it.p2 + '’s bar.',
    sep:'The whole bar is ' + x + '. ' + y + ' are given away. We want the part that is left.',
    partP:'The whole bar is ' + x + '. One part is ' + y + '. We want the other part.',
    comp:'Draw two bars and line them up. The extra bit on ' + it.p1 + '’s bar is how many more.'}[t];
  const add = ADD_TYPES.includes(t);
  const how = add ? 'We know both parts and the whole is missing, so we add: ' + x + ' plus ' + y + '.'
                  : (t === 'comp' ? 'The difference is missing, so we take away: ' + x + ' minus ' + y + '.' : 'A part is missing, so we take away: ' + x + ' minus ' + y + '.');
  const end = {join: it.p1 + ' has ' + a + ' now.', partW: a + ' in all.', compMore: it.p2 + ' has ' + a + '.',
    sep: it.p1 + ' has ' + a + ' left.', partP: a + ' are blue.', comp: it.p1 + ' has ' + a + ' more.'}[t];
  return [
    {html: head, say: it.text},
    {html: head + barHTML(it, false), say: hint},
    {html: barHTML(it, false) + big(x + (add ? ' + ' : ' − ') + y), say: how},
    {html: barHTML(it, true) + big(x + (add ? ' + ' : ' − ') + y + ' = <b class="ok">' + a + '</b>'), say: x + (add ? ' plus ' : ' minus ') + y + ' is ' + a + '. ' + end}];
}
function tradeSteps(it){
  const t = it.t, o = it.o, n = it.n;
  if(it.ask === 'same') return [
    {html: blocksHTML({rods:t - 1, ones:o + 10, fresh:10}), say:'Here are ' + tw(t - 1) + ' and ' + ow(o + 10) + '.'},
    {html: blocksHTML({rods:t - 1, ones:o + 10, fresh:10, hiOnes:true}), say:'Ten of the ones can be bundled back into a ten.'},
    {html: blocksHTML({rods:t, ones:o, newRod:true}), say:'Now it is ' + tw(t) + ' and ' + ow(o) + '.'},
    {html: blocksHTML({rods:t, ones:o}) + big('<b class="ok">' + n + '</b>'), say:'So it is ' + n + '. Trading never changes the number.'}];
  const end = it.ask === 'ones' ? 'So there are ' + (o + 10) + ' ones now.' : (t - 1) + (t - 1 === 1 ? ' ten is' : ' tens are') + ' left.';
  return [
    {html: blocksHTML({rods:t, ones:o}), say: n + ' is ' + tw(t) + ' and ' + ow(o) + '.'},
    {html: blocksHTML({rods:t, ones:o, tapRods:true}), say:'Break one ten stick into ten ones.'},
    {html: blocksHTML({rods:t - 1, ones:o + 10, fresh:10}), say:'Now there are ' + tw(t - 1) + ' and ' + ow(o + 10) + '.'},
    {html: blocksHTML({rods:t - 1, ones:o + 10, fresh:10}) + big('<b class="ok">' + it.a + '</b>'), say: end + ' It is still ' + n + '.'}];
}
function moneySteps(it){
  const order = it.coins.map((c, k) => k).sort((a, b) => COIN[it.coins[b]].v - COIN[it.coins[a]].v);
  let run = 0; const counts = [];
  order.forEach(k => { run += COIN[it.coins[k]].v; counts.push(run); });
  const nD = it.coins.filter(c => c === 'd').length;
  const sorted = order.map(k => it.coins[k]);
  return [
    {html: coinsHTML(it.coins), say:'How much money is this?'},
    {html: coinsHTML(sorted), say:'Sort the coins: biggest value first. ' + (nD ? 'Dimes are 10 cents each.' : 'Nickels are 5 cents each.')},
    {html: coinsHTML(sorted, range(0, sorted.length - 1)), say:'Count on: ' + counts.join(', ') + '.'},
    {html: coinsHTML(sorted) + big('<b class="ok">' + it.a + '¢</b>'), say:'That makes ' + it.a + ' cents.'}];
}
function senseSteps(it){
  const e = it.ex;
  if(it.sense === 'est') return [
    {html: big(e.x + ' ' + e.op + ' ' + e.y), say:'About how much is ' + e.x + ' ' + (e.op === '+' ? 'plus' : 'minus') + ' ' + e.y + '?'},
    {html: big(e.x + ' → ' + e.rx + ' &nbsp; ' + e.y + ' → ' + e.ry), say: e.x + ' is close to ' + e.rx + '. ' + e.y + ' is close to ' + e.ry + '.'},
    {html: big(e.rx + ' ' + e.op + ' ' + e.ry + ' = ' + e.est), say: e.rx + ' ' + (e.op === '+' ? 'plus' : 'minus') + ' ' + e.ry + ' is ' + e.est + '.'},
    {html: big('about <b class="ok">' + e.est + '</b>'), say:'So it is about ' + e.est + '. The exact answer is ' + e.ans + ' — close!'}];
  const sub = e.op === '−';
  const fact = sub ? e.ans + ' + ' + e.y + ' = ' + e.x : e.x + ' + ' + e.y + ' = ' + e.ans;
  const askd = sub ? e.x + ' − ' + e.y : e.ans + ' − ' + e.y, res = sub ? e.ans : e.x;
  return [
    {html: big(fact), say:'Here is a fact we know: ' + fact.replace('+', 'plus').replace('=', 'equals') + '.'},
    {html: big(fact) + big(askd + ' = ?'), say:'Adding and taking away undo each other.'},
    {html: big(askd + ' = <b class="ok">' + res + '</b>'), say:'If ' + fact.replace('+', 'plus').replace('=', 'equals') + ', then ' + askd.replace('−', 'take away') + ' is ' + res + '. So the answer is ' + res + '.'}];
}
function clockSteps(it){
  const h = it.clock.h, m = it.clock.m, svg = '<div class="v87clkwrap">' + clockSVG(h, m) + '</div>';
  return [
    {html: svg, say:'What time is it?'},
    {html: svg, say: m ? 'The short hand is just past ' + h + ', halfway to the next number. So the hour is ' + h + '.' : 'The short hand points to ' + h + '. So the hour is ' + h + '.'},
    {html: svg, say: m ? 'The long hand is on the 6. That means half past.' : 'The long hand is on the 12. That means o’clock.'},
    {html: svg + big('<b class="ok">' + fmt(h, m) + '</b>'), say: m ? 'So it is half past ' + h + ', ' + h + ' thirty.' : 'So it is ' + h + ' o’clock.'}];
}
function rulerSteps(it){
  const r = it.ruler, svg = '<div class="v87rulwrap">' + rulerSVG(r.start, r.end, '#E8590C') + '</div>';
  return [
    {html: svg, say:'How long is the ' + r.name + '?'},
    {html: svg, say: r.start ? 'Careful: the ' + r.name + ' starts at ' + r.start + ', not at 0.' : 'The ' + r.name + ' starts at 0.'},
    {html: svg, say:'It ends at ' + r.end + '.'},
    {html: svg + big('<b class="ok">' + r.len + ' inches</b>'), say: r.start ? 'Count the spaces from ' + r.start + ' to ' + r.end + ': ' + r.len + '. It is ' + r.len + ' inches long.' : 'So it is ' + r.len + ' inches long.'}];
}
function explain(it, L){
  try{
    if(it.kind === 'math' && band(L.id) === 'B' && (it.op === '+' || it.op === '−') && it.top < 100 && it.bottom < 100) return blocksSteps(it);
    if(it.kind === 'story2') return storySteps(it);
    if(it.kind === 'trade') return tradeSteps(it);
    if(it.kind === 'money') return moneySteps(it);
    if(it.kind === 'choice' && it.sense && it.ex) return senseSteps(it);
    if(it.kind === 'choice' && it.clock) return clockSteps(it);
    if(it.kind === 'choice' && it.ruler) return rulerSteps(it);
  }catch(e){ console.warn('v87 explain', e); }
  return null;
}

/* guided "try it with me": she makes the trade herself, then types */
function keypad(LN, onGo, lock){
  const pad = document.createElement('div'); pad.className = 'pad ln-pad';
  ['1','2','3','4','5','6','7','8','9','⌫','0','✓'].forEach(k => {
    const b = document.createElement('button'); b.className = 'key' + (k === '✓' ? ' go' : ''); b.textContent = k; b.disabled = lock;
    b.onclick = () => {
      if(k === '⌫') LN.entry = String(LN.entry || '').slice(0, -1);
      else if(k === '✓'){ if(String(LN.entry || '').length) onGo(Number(LN.entry)); return; }
      else if(String(LN.entry || '').length < 4) LN.entry = String(LN.entry || '') + k;
      window.V87._repaint();
    };
    pad.appendChild(b);
  });
  return pad;
}
function tryView(it, box, LN, check, paint, lock){
  const solved = LN.solved || LN.reveal;
  window.V87._repaint = paint;
  const ansBox = v => '<span class="ln-ans">' + (solved ? it.a : (LN.entry || '?')) + '</span>' + (v || '');
  if(it.kind === 'math' && band(LN.L.id) === 'B' && (it.op === '+' || it.op === '−') && it.top < 100 && it.bottom < 100){
    const x = it.top, y = it.bottom, op = it.op, xT = Math.floor(x / 10), xO = x % 10, yT = Math.floor(y / 10), yO = y % 10;
    const needB = op === '−' && xO < yO, needC = op === '+' && xO + yO >= 10;
    const done = !!it._rg || !(needB || needC) || solved;
    let vis;
    if(op === '−') vis = (done && needB) ? blocksHTML({rods:xT - 1, ones:xO + 10, fresh:10}) : blocksHTML({rods:xT, ones:xO, tapRods: needB && !done});
    else vis = (done && needC) ? blocksHTML({rods:xT + yT + 1, ones:xO + yO - 10, newRod:true}) : blocksHTML({rods:xT + yT, ones:xO + yO, altRods:yT, altOnes:yO});
    box.innerHTML = pair(vis, colHTML(x, y, op, {borrow: done && needB, carry: done && needC, done: solved})) +
      '<p class="ln-stepline">' + (!done ? (needB ? 'Not enough ones to take away ' + yO + '. <b>Tap a ten stick</b> to trade it for 10 ones.'
                                                   : 'That is ' + (xO + yO) + ' ones — too many! <b>Bundle 10 ones</b> into a ten.')
                                          : 'Now work it out: ' + x + ' ' + op + ' ' + y + ' = ' + ansBox()) + '</p>';
    if(!done && needB) box.querySelectorAll('.v87blk .rod').forEach(r => r.onclick = () => { it._rg = true; say('One ten is ten ones.', 0.86); paint(); });
    if(!done && needC){
      const b = document.createElement('button'); b.className = 'big gold v87bundle'; b.textContent = 'Bundle 10 ones → 1 ten';
      b.onclick = () => { it._rg = true; say('Ten ones make one ten.', 0.86); paint(); };
      box.appendChild(b);
    }
    if(done) box.appendChild(keypad(LN, v => check(v === it.a), lock));
    return box;
  }
  if(KINDS.has(it.kind)){
    const unit = it.kind === 'money' ? '¢' : '';
    box.innerHTML = (it.kind === 'story2' ? '<p class="ln-stepline">' + H(it.text) + '</p>' + barHTML(it, solved)
                                          : visualFor(it, solved) + '<p class="ln-stepline">' + H(it.q) + '</p>') +
      big(ansBox(unit));
    box.appendChild(keypad(LN, v => check(v === it.a), lock));
    return box;
  }
  return null;
}
window.V87 = {explain, tryView, blocksHTML, colHTML, barHTML, coinsHTML, clockSVG, rulerSVG, story2, tradeItem, moneyItem, clockItem, rulerItem, senseFromMath, compose, _repaint: () => {}};

/* =====================================================================
   8. ONE-TIME MOVE ONTO V8.7 — nothing is erased
   ===================================================================== */
const migrate2 = migrate;
window.migrate = migrate = function(){
  migrate2();
  DB.students.forEach(s => {
    if(s.v87) return;
    s.v87 = dayKey();
    const age = s.age || 0;
    s.perDayMath = s.perDayEng = age <= 5 ? 2 : age <= 7 ? 3 : (s.perDay || defaultDailySheets(age));
    if(!s.qPerSheet) s.qPerSheet = age <= 5 ? 6 : 10;
    /* the new block lessons replay once for the 2-digit levels still ahead */
    const list = MATH.map(l => l.id), at = list.indexOf(s.math);
    ['B-1','B-2','B-3','B-4','B-5','B-6','B-7','B-8','B-9'].forEach(id => { if(list.indexOf(id) >= at) s.seen = (s.seen || []).filter(x => x !== 'm:' + id); });
    if(['B-7','B-8','B-9'].includes(s.math) && !(s.testDue && s.testDue.math)){
      s.v87return = s.math; s.math = 'B-6t';
      s.seen = (s.seen || []).filter(x => x !== 'm:B-6t' && x !== 'm:' + s.v87return);
    }
  });
};
const addStudent2 = addStudent;
window.addStudent = addStudent = function(name, age){
  const s = addStudent2(name, age);
  s.v87 = dayKey();
  s.perDayMath = s.perDayEng = defaultDailySheets(age);
  s.qPerSheet = age <= 5 ? 6 : 10;
  save();
  return s;
};
/* after the "Trade a ten" refresher she goes straight back to her level */
(function(){ const b = document.getElementById('v85SetLv'); if(b) b.addEventListener('click', () => { if(me && me.v87return && me.math !== 'B-6t'){ delete me.v87return; save(); } }); })();
const finish2 = finish;
window.finish = finish = function(){
  const lv = sheet && sheet.level, sub = sheet && sheet.subject, skip = !sheet || sheet.isTest || sheet.isCheckup;
  finish2();
  if(skip || sub !== 'math' || !me || !me.v87return) return;
  const list = ladder('math'), at = id => list.findIndex(l => l.id === id), past = at(me.math) > at('B-6t');
  if(!past) return;                       /* still on (or stepped back below) the refresher: keep the return point */
  if(lv === 'B-6t'){
    {
      if(at(me.v87return) > at(me.math)){
        me.math = me.v87return;
        try{
          const L = lvl('math', me.math), m = $('rMsg'), note = 'Next time: ' + L.id + ' — ' + L.skill + ' (back to her level after the trade-a-ten refresher).';
          m.textContent = /Next time: [^.]+\./.test(m.textContent) ? m.textContent.replace(/Next time: [^.]+\./, note) : m.textContent + ' ' + note;
        }catch(e){}
      }
      delete me.v87return; save();
    }
  } else { delete me.v87return; save(); }   /* moved past it some other way (e.g. a parent changed her level) */
};
})();
