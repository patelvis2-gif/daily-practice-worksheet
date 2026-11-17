"""Build Daily Practice V8.7 from the V8.6 page plus the V8.7 layer.
Run from the repo root:  python3 dev/build87.py   (writes index.html)"""
import pathlib
d = pathlib.Path(__file__).parent
out = (d / 'base-v86.html').read_text()

def rep(a, b, count=1):
    global out
    n = out.count(a)
    assert n == count, (a[:80], n)
    out = out.replace(a, b)

# version
rep('Daily Practice — V8.6', 'Daily Practice — V8.7')
rep('Daily Practice V8.6', 'Daily Practice V8.7')

# sheets a day, per subject
rep("const perDay = () => me.perDay || defaultDailySheets(me.age);",
    "const perDay = (sub) => (typeof v87PerDay === 'function' ? v87PerDay(sub) : (me.perDay || defaultDailySheets(me.age)));")
rep("const left = perDay() - sheetsForDay(sheet.subject, assignmentDay);",
    "const left = perDay(sheet.subject) - sheetsForDay(sheet.subject, assignmentDay);")
rep("sheetsTomorrow(sheet.subject) < perDay() &&", "sheetsTomorrow(sheet.subject) < perDay(sheet.subject) &&")
rep("return ['math','english'].every(sub=>sheetsForDay(sub,k) >= perDay());",
    "return ['math','english'].every(sub=>sheetsForDay(sub,k) >= perDay(sub));")
rep("const m = blocked('math') ? 0 : Math.max(0, goal - sheetsForDay('math', k));",
    "const m = blocked('math') ? 0 : Math.max(0, perDay('math') - sheetsForDay('math', k));")
rep("const e = blocked('english') ? 0 : Math.max(0, goal - sheetsForDay('english', k));",
    "const e = blocked('english') ? 0 : Math.max(0, perDay('english') - sheetsForDay('english', k));")
rep("const nm = sheetsToday('math'), ne = sheetsToday('english'), goal = perDay();\n  const dm = nm >= goal, de = ne >= goal;",
    "const nm = sheetsToday('math'), ne = sheetsToday('english'), goalM = perDay('math'), goalE = perDay('english');\n  const dm = nm >= goalM, de = ne >= goalE;")
rep("(dm ? m.skill + ' · today complete · '+Math.min(sheetsTomorrow('math'),goal)+'/'+goal+' tomorrow sheets done' : m.skill + ' · sheet ' + (nm+1) + ' of ' + goal);",
    "(dm ? m.skill + ' · today complete · '+Math.min(sheetsTomorrow('math'),goalM)+'/'+goalM+' tomorrow sheets done' : m.skill + ' · sheet ' + (nm+1) + ' of ' + goalM);")
rep("(de ? e.skill + ' · today complete · '+Math.min(sheetsTomorrow('english'),goal)+'/'+goal+' tomorrow sheets done' : e.skill + ' · sheet ' + (ne+1) + ' of ' + goal);",
    "(de ? e.skill + ' · today complete · '+Math.min(sheetsTomorrow('english'),goalE)+'/'+goalE+' tomorrow sheets done' : e.skill + ' · sheet ' + (ne+1) + ' of ' + goalE);")
rep("$('doneMath').innerHTML = dots(nm, goal);\n  $('doneEng').innerHTML  = dots(ne, goal);",
    "$('doneMath').innerHTML = dots(nm, goalM);\n  $('doneEng').innerHTML  = dots(ne, goalE);")
rep("    : goal + ' short sheets of each — daily repetition builds mastery.';",
    "    : (goalM === goalE ? goalM + ' short sheets of each' : goalM + ' math and ' + goalE + ' reading sheets') + ' today — a little every day builds mastery.';")
rep("function startTomorrowSubject(subject){\n  const goal=perDay();", "function startTomorrowSubject(subject){\n  const goal=perDay(subject);")
rep("$('cardMath').onclick = () => sheetsToday('math')>=perDay() ?", "$('cardMath').onclick = () => sheetsToday('math')>=perDay('math') ?")
rep("$('cardEng').onclick  = () => sheetsToday('english')>=perDay() ?", "$('cardEng').onclick  = () => sheetsToday('english')>=perDay('english') ?")
rep("(me.history||[]).filter(h=>h.subject===sub && (h.assignedFor||h.d)===k && h.d <= k).length >= goal);",
    "(me.history||[]).filter(h=>h.subject===sub && (h.assignedFor||h.d)===k && h.d <= k).length >= perDay(sub));")
rep("""    <h4>Sheets a day</h4>
    <div class="ages" id="perDayRow"></div>""",
"""    <h4>Daily amount</h4>
    <label class="hint" style="display:block;text-align:left;margin:0 0 4px">Math sheets a day</label>
    <div class="ages" id="perDayMathRow"></div>
    <label class="hint" style="display:block;text-align:left;margin:10px 0 4px">Reading sheets a day</label>
    <div class="ages" id="perDayEngRow"></div>
    <label class="hint" style="display:block;text-align:left;margin:10px 0 4px">Questions per sheet</label>
    <div class="ages" id="qPerRow"></div>
    <div id="perDayRow" style="display:none"></div>""")

# student picker uses the per-subject amounts
rep("const sk=dayKey(), sg=s.perDay||defaultDailySheets(s.age);",
    "const sk=dayKey(), sgM=s.perDayMath||s.perDay||defaultDailySheets(s.age), sgE=s.perDayEng||s.perDay||defaultDailySheets(s.age);")
rep("const dm=sm>=sg, de=se>=sg;", "const dm=sm>=sgM, de=se>=sgE;")
rep("(sg+' sheets / subject target')", "(sgM===sgE ? sgM+' sheets a subject today' : sgM+' math + '+sgE+' reading sheets today')")

# mastery: judged on this level's own questions
rep("const accuracyMastered = pct >= (earlyLearner ? 0.90 : 0.90);",
    "const accuracyMastered = (!sheet.isTest && typeof v87AccuracyOK === 'function') ? v87AccuracyOK(score, total) : pct >= 0.90;")

# Learn it hooks
rep("let explainSteps = function(it, L, subject){\n  const b0 = band(L.id);",
    "let explainSteps = function(it, L, subject){\n  if(window.V87 && window.V87.explain){ const r87 = window.V87.explain(it, L, subject); if(r87) return r87; }\n  const b0 = band(L.id);")
rep("const TRYABLE = new Set(['math','seq','count','choice','pic','tiles','spell','bond','tens','story']);",
    "const TRYABLE = new Set(['math','seq','count','choice','pic','tiles','spell','bond','tens','story','story2','trade','money']);")
rep("function tryView(it){\n  const box = document.createElement('div'); box.className = 'ln-try';\n  const lock = LN.solved;",
    "function tryView(it){\n  const box = document.createElement('div'); box.className = 'ln-try';\n  const lock = LN.solved;\n  if(window.V87 && window.V87.tryView){ const v87 = window.V87.tryView(it, box, LN, check, paint, lock); if(v87) return v87; }")
# monthly check-ups can include the new question types
rep("['math','seq','count','choice','pic','spell','tiles','bond','tens','story'].includes(it.kind)",
    "['math','seq','count','choice','pic','spell','tiles','bond','tens','story','story2','trade','money'].includes(it.kind)")

tail = '<style>\n' + (d / 'v87.css').read_text() + '</style>\n<script>\n' + (d / 'v87.js').read_text() + '\n</script>\n'
assert out.count('</body>') == 1
out = out.replace('</body>', tail + '</body>')
(d.parent / 'index.html').write_text(out)
print('built', len(out))
