/* ===== V8.7 work space: write on the problem, scratch paper, ones-first typing ===== */
(function(){
'use strict';
const digits = n => String(Math.abs(n)).length;

/* ---------- freehand drawing on a canvas, stored as normalised strokes ---------- */
function drawStrokes(cv, strokes, color){
  const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  if(!r.width || !r.height) return;
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, r.width, r.height);
  c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 3.2; c.strokeStyle = color || '#5B6472';
  (strokes || []).forEach(s => {
    if(!s.length) return;
    c.beginPath(); c.moveTo(s[0][0] * r.width, s[0][1] * r.height);
    if(s.length === 1) c.lineTo(s[0][0] * r.width + 0.5, s[0][1] * r.height + 0.5);
    for(let k = 1; k < s.length; k++) c.lineTo(s[k][0] * r.width, s[k][1] * r.height);
    c.stroke();
  });
}
function wireDraw(cv, getStrokes, opt){
  opt = opt || {};
  let cur = null;
  const pt = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * 1000) / 1000, Math.round((e.clientY - r.top) / r.height * 1000) / 1000]; };
  cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', e => {
    if(opt.locked && opt.locked()) return;
    e.preventDefault(); e.stopPropagation();
    if(opt.onStart) opt.onStart();
    try{ cv.setPointerCapture(e.pointerId); }catch(err){}
    cur = [pt(e)]; getStrokes().push(cur);
    drawStrokes(cv, getStrokes(), opt.color);
  });
  cv.addEventListener('pointermove', e => {
    if(!cur) return; e.preventDefault();
    const p = pt(e), l = cur[cur.length - 1];
    if(Math.abs(p[0] - l[0]) + Math.abs(p[1] - l[1]) < 0.006) return;
    cur.push(p); drawStrokes(cv, getStrokes(), opt.color);
  });
  const end = e => { if(!cur) return; cur = null; if(opt.onEnd) opt.onEnd(); };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('click', e => e.stopPropagation());
}

/* ---------- the problem, laid out in columns with room above for marks ---------- */
function workGrid(it){
  const top = String(it.top), bot = String(it.bottom), n = Math.max(top.length, bot.length);
  const row = (s, op) => '<span class="op">' + (op || '') + '</span>' + Array.from({length:n}, (x, k) => {
    const ch = s[s.length - n + k]; return '<span class="d">' + (ch === undefined ? '' : ch) + '</span>';
  }).join('');
  return '<div class="g" style="grid-template-columns:30px repeat(' + n + ',var(--v88col))">' +
    '<span class="op"></span>' + Array(n).fill('<span class="d m"></span>').join('') +
    row(top) + row(bot, it.op) + '</div>';
}
function workEl(it, i, locked){
  const w = document.createElement('div');
  w.className = 'v88work';
  w.innerHTML = '<div class="gw">' + workGrid(it) + '<canvas class="v88mk" aria-label="Write your working here"></canvas>' +
    '<button class="v88clr" title="Clear my marks">✕</button></div>';
  const cv = w.querySelector('canvas'), clr = w.querySelector('.v88clr');
  if(!Array.isArray(it.marks)) it.marks = [];
  clr.style.display = it.marks.length && !locked ? '' : 'none';
  clr.onclick = e => { e.stopPropagation(); it.marks = []; drawStrokes(cv, it.marks); clr.style.display = 'none'; };
  wireDraw(cv, () => it.marks, {
    locked: () => phase === 'mark' || (phase === 'fix' && !it.wrong),
    onStart: () => {
      if(sel !== i){
        sel = i;
        document.querySelectorAll('#paper .sel').forEach(x => x.classList.remove('sel'));
        const c = w.closest('.prob, .item'); if(c) c.classList.add('sel');
        try{ drawFoot(); }catch(err){}
      }
    },
    onEnd: () => { clr.style.display = ''; }
  });
  requestAnimationFrame(() => drawStrokes(cv, it.marks));
  return w;
}

/* ---------- typed answers fill from the right, ones first, like paper ---------- */
function answerCells(it){
  const t = digits(it.top), b = digits(it.bottom);
  let n = it.op === '+' ? Math.max(t, b) + 1 : it.op === '×' ? t + b : Math.max(t, b);
  n = Math.max(n, String(it.given || '').length, 1);
  return Math.min(n, 5);
}
function cellsHTML(it, active){
  const g = String(it.given || ''), n = answerCells(it), pad = n - g.length;
  let s = '<span class="v88cells">';
  for(let k = 0; k < n; k++){
    const ch = k >= pad ? g[k - pad] : '';
    s += '<span class="c' + (active && k === pad - 1 ? ' cur' : '') + (ch ? ' f' : '') + '">' + ch + '</span>';
  }
  return s + '</span>';
}
const ones1st = it => it && it.kind === 'math' && it.stack && !it.penMath && !writeMode();
const keyIn0 = keyIn;
window.keyIn = keyIn = function(k){
  const it = sheet && sheet.items[sel];
  if(ones1st(it) && k !== '▶'){
    if(k === '⌫') it.given = String(it.given || '').slice(1);
    else if(String(it.given || '').length < answerCells(it) && /^[0-9]$/.test(k)) it.given = k + String(it.given || '');
    render();
    return;
  }
  return keyIn0(k);
};

/* ---------- hook into the worksheet ---------- */
const cell0 = cell;
window.cell = cell = function(it, i, single, n){
  const d = cell0(it, i, single, n);
  try{
    if(it && it.kind === 'math' && it.stack){
      const st = d.querySelector('.stack');
      if(st){
        const locked = phase === 'mark' || (phase === 'fix' && !it.wrong);
        if(writeMode() || it.penMath){
          const bar = st.querySelector('.bar');
          while(st.firstChild && st.firstChild !== bar) st.removeChild(st.firstChild);
          st.insertBefore(workEl(it, i, locked), bar);
          st.classList.add('v88stack');
        } else {
          const ans = st.querySelector('.ans');
          if(ans){ ans.outerHTML = cellsHTML(it, i === sel && !locked); }
        }
      }
    }
  }catch(e){ console.warn('v87 work', e); }
  return d;
};
/* marks belong to one sheet: never carried into a repeat */
const build0 = buildSheet;
window.buildSheet = buildSheet = function(subject){
  const sh = build0(subject);
  try{ sh.items.forEach(it => { delete it.marks; }); }catch(e){}
  return sh;
};
const snap0 = snapshotSheet;
window.snapshotSheet = snapshotSheet = function(){
  const s = snap0();
  try{ s.items.forEach((o, k) => { const it = sheet.items[k]; if(it && it.marks && it.marks.length) o.marks = it.marks.map(st => st.filter((p, j) => j % 2 === 0 || j === st.length - 1)); }); }catch(e){}
  return s;
};
/* the sheet review shows her working next to the answer */
const review0 = openSheetReview;
window.openSheetReview = openSheetReview = function(snap){
  review0(snap);
  try{
    const rows = document.querySelectorAll('#svBody .svrow');
    let r = 0;
    snap.items.forEach(it => {
      if(it.kind === 'passage') return;
      const row = rows[r++];
      if(!row || !it.marks || !it.marks.length || it.kind !== 'math') return;
      const w = document.createElement('div');
      w.className = 'v88work v88rev';
      w.innerHTML = '<small>Her working</small><div class="gw">' + workGrid(it) + '<canvas class="v88mk"></canvas></div>';
      row.insertBefore(w, row.querySelector('.svagain'));
      const cv = w.querySelector('canvas');
      requestAnimationFrame(() => drawStrokes(cv, it.marks));
    });
  }catch(e){ console.warn('v87 review', e); }
};
/* "practice this again" starts clean */
document.addEventListener('click', e => {
  if(e.target && e.target.classList && e.target.classList.contains('svagain')){
    try{ (me.misses || []).forEach(m => { if(m.item) delete m.item.marks; }); }catch(err){}
  }
}, true);

/* ---------- scratch paper ---------- */
const scr = document.createElement('div');
scr.id = 'v88scratch';
scr.innerHTML = '<div class="bar"><b>Scratch paper</b><span>Work it out here. This is not checked.</span>' +
  '<button id="v88sClear">Clear</button><button id="v88sDone" class="go">Done</button></div><canvas></canvas>';
document.body.appendChild(scr);
let SCR = [];
const scv = scr.querySelector('canvas');
wireDraw(scv, () => SCR, {color:'#1F2A44'});
const openScratch = () => { scr.classList.add('on'); requestAnimationFrame(() => drawStrokes(scv, SCR, '#1F2A44')); };
scr.querySelector('#v88sClear').onclick = () => { SCR = []; drawStrokes(scv, SCR, '#1F2A44'); };
scr.querySelector('#v88sDone').onclick = () => { scr.classList.remove('on'); };
window.addEventListener('resize', () => { if(scr.classList.contains('on')) drawStrokes(scv, SCR, '#1F2A44'); });
const book = document.getElementById('book');
if(book){
  const b = document.createElement('button');
  b.className = 'book v88sbtn'; b.id = 'v88scratchBtn'; b.textContent = '✏️'; b.title = 'Scratch paper';
  b.onclick = openScratch;
  book.insertAdjacentElement('afterend', b);
}
/* only on math sheets; a new sheet starts with clean scratch paper */
const render0 = render;
window.render = render = function(){
  render0();
  try{
    const b = document.getElementById('v88scratchBtn');
    if(b) b.style.display = sheet && sheet.subject === 'math' ? '' : 'none';
    if(sheet !== window.__v88sheet){ window.__v88sheet = sheet; SCR = []; scr.classList.remove('on'); }
  }catch(e){}
};
window.V87W = {workGrid, drawStrokes, cellsHTML, answerCells};
})();
