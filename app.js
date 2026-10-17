/* ============================================================
   ADHD Self-Screening Questionnaire
   Single-page wizard · one question per screen · private & local
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   CONSTANTS & DATA
   ------------------------------------------------------------ */
const STORAGE_KEY = 'adhd_screen_v2';

const FREQ = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'];
const FREQ_HINT = ['0 · not at all', '1 · a little', '2 · some of the time', '3 · much of the time', '4 · most of the time'];
const SEV = ['None', 'Mild', 'Moderate', 'Severe'];

const DATA = {
  /* WHO-style 6-item adult attention screener (paraphrased) */
  asrs: [
    'How often do you have trouble wrapping up the final details of a project once the hard parts are done?',
    'How often do you have difficulty getting things in order when a task requires organisation?',
    'How often do you have problems remembering appointments or obligations?',
    'When a task requires a lot of thought, how often do you avoid or delay getting started?',
    'How often do you fidget or squirm with your hands or feet when you have to sit for a long time?',
    'How often do you feel overly active and compelled to do things, as if driven by a motor?'
  ],
  /* DSM-5 inattention (9) */
  inattention: [
    'Do you fail to give close attention to details, or make careless mistakes at work, study, or daily tasks?',
    'Do you have trouble sustaining attention during tasks, conversations, or reading?',
    'Do people say you don\u2019t seem to listen when spoken to directly?',
    'Do you start tasks but not finish them?',
    'Do you have trouble organising tasks, time, or belongings?',
    'Do you avoid or delay tasks that need sustained mental effort?',
    'Do you lose things needed for daily life \u2014 keys, wallet, phone, papers, medicines?',
    'Are you easily distracted by external noise, messages, or your own thoughts?',
    'Are you forgetful in daily routines \u2014 appointments, bills, chores, returning calls?'
  ],
  /* DSM-5 hyperactivity / impulsivity (9) */
  hyper: [
    'Do you fidget, tap your hands or feet, or squirm when seated?',
    'Do you get up from your seat when you are expected to stay seated?',
    'Do you feel restless or like you are \u201cdriven by a motor\u201d?',
    'Do you struggle to do leisure activities quietly?',
    'Are you often \u201con the go\u201d or uncomfortable being still?',
    'Do you talk excessively?',
    'Do you blurt out answers, interrupt, or finish other people\u2019s sentences?',
    'Do you have trouble waiting your turn in lines, conversations, or traffic?',
    'Do you intrude on others, interrupt conversations, or butt into activities?'
  ],
  /* Executive function & daily life */
  executive: [
    'Do you lose track of time \u2014 arriving late, or a \u201cfew minutes\u201d turning into an hour?',
    'Do you find it very hard to start a task, even one you want to do?',
    'Do you forget what you were doing halfway through it?',
    'Do you struggle to plan, prioritise, or break a project into steps?',
    'Is your space (desk, room, bag, phone) persistently disorganised?',
    'Do you enter a state of hyperfocus where time disappears and you can\u2019t stop?',
    'Do you procrastinate until a deadline creates panic-driven focus?',
    'Do you find it hard to switch from one task or topic to another?',
    'Do you feel overwhelmed by multi-step or \u201cboring\u201d tasks?',
    'Do you have trouble following multi-step spoken instructions?',
    'Do you misjudge how long tasks will take?',
    'Do you leave chores, paperwork, or admin unfinished for weeks?'
  ],
  /* Emotional regulation */
  emotion: [
    'Do you have intense emotional reactions that feel out of proportion?',
    'Do you feel rejection or criticism very deeply and take a long time to recover?',
    'Do you have a very low tolerance for frustration?',
    'Does your mood shift quickly and unpredictably?',
    'Do you find it hard to calm down once upset?',
    'Do noise, crowds, or textures easily overstimulate or overwhelm you?'
  ],
  /* Sleep & rest */
  sleep: [
    'Do you have trouble falling asleep, even when tired?',
    'Do racing thoughts keep you awake at night?',
    'Do you stay up late \u201cgetting revenge\u201d on the day, then struggle in the morning?',
    'Do you wake up feeling unrefreshed even after enough sleep?',
    'Is your sleep schedule very irregular from one day to the next?',
    'Do you snore loudly or wake up gasping or choking?',
    'Do you feel excessively sleepy during the day?',
    'Do you get an irresistible urge to move your legs at night?'
  ]
};

/* Choice-based question groups */
const CHILDHOOD = [
  { id: 'ch1', text: 'Did any of these symptoms start before you were 12 years old?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'ch2', text: 'Were they present in two or more settings as a child \u2014 home, school, social activities?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'ch3', text: 'Did parents, teachers, or report cards describe you as distracted, talkative, restless, or \u201cnot working to potential\u201d?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'ch4', text: 'Were you ever told you were lazy, unmotivated, or a daydreamer?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'ch5', text: 'Did you struggle with homework, deadlines, or following instructions at school?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'ch6', text: 'Were you ever held back a year, or given remedial or extra classes?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'ch7', text: 'Do these symptoms still affect you now, not only in childhood?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'ch8', text: 'Did symptoms become more obvious after leaving structured school life (college, work, or running a home)?', opts: ['Yes', 'No', 'Not sure'] }
];

const DURATION = [
  { id: 'du1', text: 'Have your symptoms been present for at least 6 months?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'du2', text: 'Are they continuous, or only during periods of stress, low mood, or anxiety?', opts: ['Continuous', 'Only during stress or low mood', 'Mixed / varies', 'Not sure'] },
  { id: 'du3', text: 'Do they show up in almost all environments, or mainly in one place?', opts: ['Almost all environments', 'Mainly at home', 'Mainly at work or study', 'Not sure'] },
  { id: 'du4', text: 'Have symptoms been getting worse, staying the same, or improving over the years?', opts: ['Getting worse', 'Staying the same', 'Getting better', 'Fluctuates a lot', 'Not sure'] },
  { id: 'du5', text: 'Do deadlines, novelty, or pressure help you focus \u2014 but only at the last minute?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'du6', text: 'Does caffeine or any stimulant noticeably help your focus?', opts: ['Yes', 'No', 'Not sure'] }
];

const FAMILY = [
  { id: 'fm1', text: 'Does anyone in your biological family have ADHD?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'fm2', text: 'Does anyone in your family have a mental-health, developmental, or learning condition?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'fm3', text: 'Did you experience significant early stress, neglect, or trauma?', opts: ['Yes', 'No', 'Prefer not to say'] },
  { id: 'fm4', text: 'Were you born prematurely or with a low birth weight?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'fm5', text: 'Did your mother smoke, drink, or use substances during pregnancy?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'fm6', text: 'Were there complications during your birth, such as a lack of oxygen?', opts: ['Yes', 'No', 'Not sure'] }
];

const TREATMENT = [
  { id: 'tr1', text: 'Have you ever taken medication for attention, focus, or ADHD?', opts: ['Yes', 'No', 'Not sure'] },
  { id: 'tr2', text: 'Have you ever had therapy, counselling, or ADHD coaching?', opts: ['Yes', 'No'] }
];

const COMORBID = [
  'Anxiety or excessive worry', 'Depression / low mood', 'Bipolar disorder',
  'PTSD or trauma reactions', 'OCD / intrusive thoughts & rituals', 'Social anxiety',
  'Panic attacks', 'Dyslexia or another learning disability', 'Autism-spectrum traits',
  'Tics or Tourette syndrome', 'Eating disorder', 'Borderline / other personality disorder',
  'None of these'
];

const MEDICAL = [
  'Sleep apnea / loud snoring with gasping', 'Chronic insomnia', 'Restless legs at night',
  'Thyroid problem', 'Anemia / iron deficiency', 'Vitamin B12 deficiency',
  'Head injury or concussion', 'Epilepsy / seizures', 'Chronic pain', 'Chronic fatigue',
  'Hearing or vision problems', 'Heart condition / high blood pressure',
  'Hormonal issues (PCOS, menopause, low testosterone)', 'None of these'
];

const SUBSTANCES = [
  'Alcohol', 'Cannabis', 'Nicotine / vaping', 'Caffeine (heavy use)',
  'Recreational stimulants', 'Cocaine', 'Opioids / painkillers',
  'Benzodiazepines (non-prescribed)', 'Sleeping pills (non-prescribed)',
  'MDMA / party drugs', 'None of these'
];

const AREAS = [
  'Work / career', 'Study / college', 'Home / chores', 'Relationships / family',
  'Parenting', 'Money / bills / finances', 'Driving / road safety',
  'Health / taking medicines', 'Sleep routine', 'Self-care / hygiene',
  'Social life', 'Screen time / gaming', 'Time management'
];

/* ------------------------------------------------------------
   STATE
   ------------------------------------------------------------ */
let STEPS = [];
const LABELS = {};          // id -> {text, section, num, kind}
let answers = {};
let idx = 0;
let autoAdvance = true;
let autoSuppressed = false;
let finished = false;

/* ------------------------------------------------------------
   SMALL HELPERS
   ------------------------------------------------------------ */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function todayStr() {
  try {
    return new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) { return new Date().toISOString().slice(0, 10); }
}
function mean(arr) { return arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : 0; }
function countGE(idList, t) {
  let c = 0;
  idList.forEach(function (id) { const v = answers[id]; if (typeof v === 'number' && v >= t) c++; });
  return c;
}

/* ------------------------------------------------------------
   STEP BUILDING
   ------------------------------------------------------------ */
function sectionStep(eyebrow, key) {
  const m = sectionMeta[key];
  return { kind: 'section', eyebrow: eyebrow, title: m.title, blurb: m.blurb, key: key };
}
function scaleStep(id, key, num, text) {
  return { kind: 'scale', id: id, section: key, num: num, text: text };
}
function choiceStep(id, key, text, opts) {
  return { kind: 'choice', id: id, section: key, text: text, opts: opts };
}
function textStep(id, key, label, placeholder, optional) {
  return { kind: 'text', id: id, section: key, label: label, ph: placeholder, optional: !!optional };
}
function multiStep(id, key, question, options) {
  return { kind: 'multi', id: id, section: key, question: question, options: options, optional: true };
}

const sectionMeta = {
  about:     { title: 'About You',                    blurb: 'A few basics to put your answers in context. Nothing here is uploaded or shared anywhere.' },
  asrs:      { title: 'Quick Attention Screener',      blurb: 'Six questions adapted from the WHO adult ADHD screener. Answer for the past 6 months.' },
  inattention:{ title: 'Inattention \u2014 DSM-5',      blurb: 'Nine core inattention symptoms from the DSM-5. Rate how often each applied over the past 6 months.' },
  hyper:     { title: 'Hyperactivity & Impulsivity',   blurb: 'Nine core hyperactive-impulsive symptoms from the DSM-5.' },
  executive: { title: 'Executive Function & Daily Life',blurb: 'Common, real-world struggles linked to ADHD. These add rich context for your clinician.' },
  emotion:   { title: 'Emotional Regulation',          blurb: 'Emotional intensity and rejection-sensitivity are frequently part of ADHD.' },
  sleep:     { title: 'Sleep & Rest',                  blurb: 'Sleep problems can both mimic and worsen ADHD, so they matter for diagnosis.' },
  child:     { title: 'Childhood Onset & History',     blurb: 'DSM-5 requires some symptoms before age 12. Answer as best you can \u2014 \u201cNot sure\u201d is fine.' },
  impair:    { title: 'Settings & Impairment',         blurb: 'Tick every area where symptoms cause real problems, then rate how severe each is.' },
  duration:  { title: 'Duration & Pattern',            blurb: 'How long symptoms have lasted, and when they show up.' },
  comorbid:  { title: 'Other Conditions That Mimic ADHD', blurb: 'These are not disqualifying \u2014 they simply need to be ruled out or treated alongside ADHD. Tick any that apply.' },
  substances:{ title: 'Substances',                    blurb: 'Substance use affects attention and mood. Be honest \u2014 this is for you and your clinician only.' },
  family:    { title: 'Family & Early History',        blurb: 'ADHD is highly heritable, and early-life factors can matter.' },
  treatment: { title: 'Treatment History',             blurb: 'If you have never had treatment, just answer and skip the optional details.' }
};

function buildSteps() {
  STEPS = [];
  STEPS.push({ kind: 'intro' });

  STEPS.push({
    kind: 'fields', id: 'demo', section: 'about',
    fields: [
      { name: 'age', label: 'Age', type: 'number', min: 6, max: 110, ph: 'e.g. 27' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['', 'Female', 'Male', 'Non-binary', 'Prefer not to say'] },
      { name: 'city', label: 'City / region', type: 'text', ph: 'e.g. Bengaluru (optional)' },
      { name: 'occupation', label: 'Current main activity', type: 'select', options: ['', 'Student', 'Working professional', 'Self-employed', 'Homemaker', 'Unemployed', 'Retired', 'Other'] },
      { name: 'screenDate', label: 'Date of this screen', type: 'text', value: todayStr() }
    ]
  });

  STEPS.push(sectionStep('Part A', 'asrs'));
  DATA.asrs.forEach(function (t, i) { STEPS.push(scaleStep('asrs' + (i + 1), 'asrs', 'A' + (i + 1), t)); });

  STEPS.push(sectionStep('Part B', 'inattention'));
  DATA.inattention.forEach(function (t, i) { STEPS.push(scaleStep('in' + (i + 1), 'inattention', 'B' + (i + 1), t)); });

  STEPS.push(sectionStep('Part C', 'hyper'));
  DATA.hyper.forEach(function (t, i) { STEPS.push(scaleStep('hy' + (i + 1), 'hyper', 'C' + (i + 1), t)); });

  STEPS.push(sectionStep('Part D', 'executive'));
  DATA.executive.forEach(function (t, i) { STEPS.push(scaleStep('ex' + (i + 1), 'executive', 'D' + (i + 1), t)); });

  STEPS.push(sectionStep('Part E', 'emotion'));
  DATA.emotion.forEach(function (t, i) { STEPS.push(scaleStep('em' + (i + 1), 'emotion', 'E' + (i + 1), t)); });

  STEPS.push(sectionStep('Part F', 'sleep'));
  DATA.sleep.forEach(function (t, i) { STEPS.push(scaleStep('sl' + (i + 1), 'sleep', 'F' + (i + 1), t)); });

  STEPS.push(sectionStep('Part G', 'child'));
  CHILDHOOD.forEach(function (q) { STEPS.push(choiceStep(q.id, 'child', q.text, q.opts)); });

  STEPS.push(sectionStep('Part H', 'impair'));
  STEPS.push({ kind: 'areas', id: 'areas', section: 'impair' });
  STEPS.push(textStep('q25', 'impair', 'Have symptoms caused repeated failures, warnings, breakups, accidents, or money problems?', 'Describe briefly\u2026', true));

  STEPS.push(sectionStep('Part I', 'duration'));
  DURATION.forEach(function (q) { STEPS.push(choiceStep(q.id, 'duration', q.text, q.opts)); });

  STEPS.push(sectionStep('Part J', 'comorbid'));
  STEPS.push(multiStep('comorbid', 'comorbid', 'Which of these have you experienced or been diagnosed with?', COMORBID));
  STEPS.push(multiStep('medical', 'comorbid', 'Do you have any of these medical conditions?', MEDICAL));
  STEPS.push(textStep('q26', 'comorbid', 'Anything to add about the conditions you ticked?', 'Optional notes\u2026', true));

  STEPS.push(sectionStep('Part K', 'substances'));
  STEPS.push(multiStep('substances', 'substances', 'Which have you used in the past year?', SUBSTANCES));
  STEPS.push(textStep('q27', 'substances', 'How often, and does it affect you?', 'e.g. Cannabis 2\u20133 times a week; no alcohol', true));

  STEPS.push(sectionStep('Part L', 'family'));
  FAMILY.forEach(function (q) { STEPS.push(choiceStep(q.id, 'family', q.text, q.opts)); });

  STEPS.push(sectionStep('Part M', 'treatment'));
  TREATMENT.forEach(function (q) { STEPS.push(choiceStep(q.id, 'treatment', q.text, q.opts)); });
  STEPS.push(textStep('tr_meds', 'treatment', 'Which medication(s), and what dose?', 'e.g. Methylphenidate 10 mg twice daily \u2014 or \u201cdon\u2019t remember\u201d', true));
  STEPS.push(textStep('tr_help', 'treatment', 'How did it help?', 'e.g. Could finish one task at a time', true));
  STEPS.push(textStep('tr_side', 'treatment', 'What side effects did you get?', 'e.g. Headache, appetite loss, trouble sleeping', true));
  STEPS.push(textStep('tr_stop', 'treatment', 'Why did you stop?', 'e.g. Not available locally, cost, side effects', true));
  STEPS.push(textStep('tr_other', 'treatment', 'Any other treatment \u2014 therapy, coaching, lifestyle changes?', 'Optional\u2026', true));
  STEPS.push(textStep('q28', 'treatment', 'Anything else you want your clinician to know?', 'Anything at all\u2026', true));

  STEPS.push({ kind: 'final' });

  /* build label index */
  Object.keys(LABELS).forEach(function (k) { delete LABELS[k]; });
  STEPS.forEach(function (s) {
    if (s.id && s.text) LABELS[s.id] = { text: s.text, section: s.section, num: s.num || '', kind: s.kind };
    if (s.id && s.label) LABELS[s.id] = { text: s.label, section: s.section, num: '', kind: s.kind };
    if (s.kind === 'multi') LABELS[s.id] = { text: s.question, section: s.section, num: '', kind: 'multi' };
    if (s.kind === 'areas') LABELS[s.id] = { text: 'Life areas affected', section: s.section, num: '', kind: 'areas' };
  });
}

/* count of answerable questions per section */
function sectionQuestionCount(key) {
  return STEPS.filter(function (s) {
    return s.section === key && ['scale', 'choice', 'multi', 'areas', 'fields', 'text'].indexOf(s.kind) !== -1;
  }).length;
}
function totalQuestions() {
  return STEPS.filter(function (s) { return isQuestionKind(s.kind); }).length;
}

/* ------------------------------------------------------------
   PERSISTENCE
   ------------------------------------------------------------ */
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: answers, idx: idx, auto: autoAdvance }));
  } catch (e) { /* storage unavailable - ignore */ }
}
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o && typeof o === 'object') return o;
  } catch (e) { }
  return null;
}
function clearSaved() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
}

/* ------------------------------------------------------------
   ANSWER ACCESS
   ------------------------------------------------------------ */
function isAnswered(step) {
  if (step.kind === 'scale') return typeof answers[step.id] === 'number';
  if (step.kind === 'choice') return answers[step.id] != null;
  if (step.kind === 'multi') return Array.isArray(answers[step.id]) ? answers[step.id].length > 0 : true;
  if (step.kind === 'areas') return !!answers[step.id];
  if (step.kind === 'text') return true;
  if (step.kind === 'fields') return true;
  return true;
}
function isOptional(step) {
  return !!(step.optional || step.kind === 'multi' || step.kind === 'text' || step.kind === 'fields' || step.kind === 'areas');
}

/* ------------------------------------------------------------
   RENDER
   ------------------------------------------------------------ */
const app = document.getElementById('app');
const resultsEl = document.getElementById('results');

function isQuestionKind(k) {
  return ['scale', 'choice', 'multi', 'areas', 'text'].indexOf(k) !== -1;
}
function progressHTML(step) {
  const total = totalQuestions();
  let answered = 0;
  for (let i = 0; i < idx; i++) if (isQuestionKind(STEPS[i].kind)) answered++;
  const shown = Math.min(answered + 1, total);
  const pct = Math.round(answered / total * 100);
  return '' +
    '<div class="progress-mini" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
    '<div class="progress-count">' + (step && step.kind === 'final' ? 'Done' : shown + ' of ' + total) + '</div>';
}

function setFocusMode(on) {
  document.body.classList.toggle('focus', !!on);
}

function renderStep() {
  const step = STEPS[idx];
  let inner = '';

  setFocusMode(step.kind !== 'intro');

  if (step.kind === 'intro') { renderIntro(); return; }
  if (step.kind === 'section') { renderSection(step); return; }
  if (step.kind === 'final') { renderFinal(); return; }

  if (step.kind === 'fields') inner = renderFields(step);
  else if (step.kind === 'scale') inner = renderScale(step);
  else if (step.kind === 'choice') inner = renderChoice(step);
  else if (step.kind === 'multi') inner = renderMulti(step);
  else if (step.kind === 'areas') inner = renderAreas(step);
  else if (step.kind === 'text') inner = renderText(step);

  const nav = renderNav(step);
  app.innerHTML = progressHTML(step) + '<div class="card">' + inner + '</div>' + nav;

  wireStep(step);
  app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  focusFirst();
}

function renderIntro() {
  const saved = loadSaved();
  const hasProgress = saved && saved.answers && Object.keys(saved.answers).length > 0;
  const qCount = totalQuestions();
  const mins = Math.max(3, Math.round(qCount * 0.13));
  app.innerHTML = '' +
    '<div class="card section-card">' +
    '<div class="notice"><strong>This is not a diagnosis.</strong> It is a structured self-report screen that helps you estimate symptom severity and prepare a clear summary for a psychiatrist. Only a qualified clinician can diagnose ADHD or prescribe medication.</div>' +
    '<span class="eyebrow">Before you begin</span>' +
    '<h2>About ' + qCount + ' questions, one at a time</h2>' +
    '<p>It takes roughly ' + mins + '\u2013' + (mins + 4) + ' minutes. Your answers stay on this device \u2014 nothing is uploaded.</p>' +
    '<ul class="intro-list">' +
    '<li><span class="dot">\u2713</span><span>Answer for the <strong>past 6 months</strong> unless a question says otherwise.</span></li>' +
    '<li><span class="dot">\u2713</span><span>Be honest \u2014 there are no right or wrong answers, and no one sees this but you.</span></li>' +
    '<li><span class="dot">\u2713</span><span>On rating questions, just tap a number and it moves on automatically.</span></li>' +
    '<li><span class="dot">\u2713</span><span>Keyboard: <span class="kbd">1</span>\u2013<span class="kbd">5</span> to rate, <span class="kbd">\u2190</span>/<span class="kbd">\u2192</span> to move, <span class="kbd">Enter</span> for next.</span></li>' +
    '</ul>' +
    '<label class="setting-row"><input type="checkbox" id="autoChkIntro"' + (autoAdvance ? ' checked' : '') + '><span>Auto-advance to the next question after I answer</span></label>' +
    '<div class="nav">' +
    (hasProgress ?
      '<button type="button" class="btn btn-ghost" id="freshBtn">Start over</button>' +
      '<div class="spacer"></div>' +
      '<button type="button" class="btn btn-primary" id="resumeBtn">Resume where I left off \u2192</button>'
      :
      '<div class="spacer"></div>' +
      '<button type="button" class="btn btn-primary" id="beginBtn">Begin \u2192</button>') +
    '</div>' +
    '</div>';

  const begin = document.getElementById('beginBtn');
  const resume = document.getElementById('resumeBtn');
  const fresh = document.getElementById('freshBtn');
  const autoIntro = document.getElementById('autoChkIntro');
  if (autoIntro) autoIntro.addEventListener('change', function () { autoAdvance = autoIntro.checked; save(); });
  if (begin) begin.addEventListener('click', function () { answers = {}; idx = 1; save(); renderStep(); });
  if (resume) resume.addEventListener('click', function () {
    const s = loadSaved();
    if (s) { answers = s.answers || {}; idx = Math.min(s.idx || 1, STEPS.length - 1); if (s.idx === STEPS.length - 1 && finished) idx = 1; }
    autoAdvance = s && typeof s.auto === 'boolean' ? s.auto : autoAdvance;
    renderStep();
  });
  if (fresh) fresh.addEventListener('click', function () {
    answers = {}; idx = 0; clearSaved(); renderStep();
  });
}

function renderSection(step) {
  const count = sectionQuestionCount(step.key);
  app.innerHTML = '' +
    progressHTML(step) +
    '<div class="card section-card">' +
    '<span class="eyebrow">' + esc(step.eyebrow) + '</span>' +
    '<h2>' + esc(step.title) + '</h2>' +
    '<p>' + esc(step.blurb) + '</p>' +
    '<span class="section-count">' + count + ' question' + (count === 1 ? '' : 's') + '</span>' +
    '<div class="nav">' +
    '<button type="button" class="btn btn-ghost" id="backBtn">\u2190 Back</button>' +
    '<div class="spacer"></div>' +
    '<button type="button" class="btn btn-primary" id="nextBtn">Continue \u2192</button>' +
    '</div>' +
    '</div>';
  $('#backBtn', app).addEventListener('click', back);
  $('#nextBtn', app).addEventListener('click', next);
  app.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderFields(step) {
  let h = '<p class="q-eyebrow">About You</p><h2 class="q-text" style="font-size:20px">' + esc('A few details') + '</h2>';
  const d = answers[step.id] || {};
  step.fields.forEach(function (f) {
    const val = d[f.name] != null ? d[f.name] : (f.value || '');
    h += '<label class="field"><span>' + esc(f.label) + '</span>';
    if (f.type === 'select') {
      h += '<select name="' + f.name + '">' + f.options.map(function (o) {
        return '<option value="' + esc(o) + '"' + (String(val) === o ? ' selected' : '') + '>' + (o === '' ? '\u2014 select \u2014' : esc(o)) + '</option>';
      }).join('') + '</select>';
    } else {
      h += '<input type="' + f.type + '" name="' + f.name + '"' +
        (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '') +
        ' value="' + esc(val) + '" placeholder="' + esc(f.ph || '') + '">';
    }
    h += '</label>';
  });
  return h;
}

function renderScale(step) {
  const cur = answers[step.id];
  let h = '<p class="q-eyebrow">' + esc(step.num) + '</p>' +
    '<p class="q-text">' + esc(step.text) + '</p>' +
    '<div class="scale" role="radiogroup" aria-label="' + esc(step.num + ' ' + step.text) + '">';
  FREQ.forEach(function (lab, i) {
    h += '<label class="opt">' +
      '<input type="radio" name="' + step.id + '" value="' + i + '"' + (cur === i ? ' checked' : '') + '>' +
      '<span class="opt-face"><b class="opt-num">' + i + '</b><span class="opt-lab">' + esc(lab) + '</span></span>' +
      '</label>';
  });
  h += '</div>';
  const note = answers[step.id + '_note'] || '';
  h += '<button type="button" class="note-toggle" id="noteToggle">' + (note ? '\u2212 Hide note' : '+ Add a note (optional)') + '</button>' +
    '<div class="note-field"' + (note ? '' : ' hidden') + '>' +
    '<textarea id="noteField" placeholder="Optional: a brief real-life example\u2026">' + esc(note) + '</textarea>' +
    '</div>';
  return h;
}

function renderChoice(step) {
  const cur = answers[step.id];
  let h = '<p class="q-eyebrow">' + (step.num ? esc(step.num) : '') + '</p>' +
    '<p class="q-text">' + esc(step.text) + '</p>' +
    '<div class="pills" role="radiogroup" aria-label="' + esc(step.text) + '">';
  step.opts.forEach(function (o) {
    h += '<label class="pill">' +
      '<input type="radio" name="' + step.id + '" value="' + esc(o) + '"' + (cur === o ? ' checked' : '') + '>' +
      '<span class="pill-face">' + esc(o) + '</span>' +
      '</label>';
  });
  h += '</div>';
  return h;
}

function renderMulti(step) {
  const cur = Array.isArray(answers[step.id]) ? answers[step.id] : [];
  let h = '<p class="q-eyebrow">Tick all that apply</p>' +
    '<p class="q-text" style="font-size:19px">' + esc(step.question) + '</p>' +
    '<p class="q-help">Select as many as fit. Choose \u201cNone of these\u201d if nothing applies.</p>' +
    '<div class="checklist">';
  step.options.forEach(function (o, i) {
    const checked = cur.indexOf(o) !== -1;
    h += '<label class="check' + (checked ? ' checked' : '') + '">' +
      '<input type="checkbox" name="' + step.id + '" value="' + esc(o) + '" data-multi="' + step.id + '"' + (checked ? ' checked' : '') + '>' +
      '<span>' + esc(o) + '</span>' +
      '</label>';
  });
  h += '</div>';
  return h;
}

function renderAreas(step) {
  const cur = answers[step.id] || {};
  let h = '<p class="q-eyebrow">Part H</p>' +
    '<p class="q-text" style="font-size:19px">Where do symptoms cause problems?</p>' +
    '<p class="q-help">Tick each area affected, then rate its severity. If none, just leave them unticked.</p>' +
    '<div class="area-list">';
  AREAS.forEach(function (a, i) {
    const on = Object.prototype.hasOwnProperty.call(cur, a);
    const sev = on ? cur[a] : 0;
    h += '<div class="area-row' + (on ? ' on' : '') + '" data-area-row="' + i + '">' +
      '<label class="check" style="min-width:150px">' +
      '<input type="checkbox" data-area-chk="' + esc(a) + '"' + (on ? ' checked' : '') + '>' +
      '<span>' + esc(a) + '</span>' +
      '</label>' +
      '<select data-area-sev="' + esc(a) + '"' + (on ? '' : ' disabled') + '>' +
      SEV.map(function (s, si) { return '<option value="' + si + '"' + (Number(sev) === si ? ' selected' : '') + '>' + si + ' \u2013 ' + s + '</option>'; }).join('') +
      '</select>' +
      '</div>';
  });
  h += '</div>';
  return h;
}

function renderText(step) {
  const cur = answers[step.id] || '';
  return '<p class="q-eyebrow">Optional</p>' +
    '<p class="q-text" style="font-size:19px">' + esc(step.label) + '</p>' +
    '<p class="q-help">You can skip this if it does not apply.</p>' +
    '<textarea id="' + step.id + '" placeholder="' + esc(step.ph || '') + '">' + esc(cur) + '</textarea>';
}

function renderNav(step) {
  const opt = isOptional(step);
  const showSkip = opt && step.kind !== 'fields';
  return '<div class="nav">' +
    '<button type="button" class="btn btn-ghost" id="backBtn">\u2190 Back</button>' +
    '<div class="spacer"></div>' +
    (showSkip ? '<button type="button" class="btn btn-text" id="skipBtn">Skip</button>' : '') +
    '<button type="button" class="btn btn-primary" id="nextBtn">' + (isLastQuestion() ? 'See results \u2192' : 'Next \u2192') + '</button>' +
    '</div>';
}

function isLastQuestion() {
  for (let i = idx + 1; i < STEPS.length; i++) {
    if (['scale', 'choice', 'multi', 'areas', 'fields', 'text'].indexOf(STEPS[i].kind) !== -1) return false;
  }
  return true;
}

/* ------------------------------------------------------------
   WIRING PER STEP
   ------------------------------------------------------------ */
function wireStep(step) {
  if (step.kind === 'fields') {
    $$('input,select', app).forEach(function (inp) {
      inp.addEventListener('input', collectFields);
      inp.addEventListener('change', collectFields);
    });
  }

  if (step.kind === 'scale') {
    autoSuppressed = false;
    $$('input[type=radio]', app).forEach(function (r) {
      r.addEventListener('change', function () {
        answers[step.id] = parseInt(r.value, 10);
        save();
        if (autoAdvance && !autoSuppressed) {
          setTimeout(function () { if (STEPS[idx] === step) next(true); }, 380);
        }
      });
    });
    const toggle = $('#noteToggle', app);
    if (toggle) toggle.addEventListener('click', function () {
      const field = $('.note-field', app);
      const hidden = field.hasAttribute('hidden');
      if (hidden) { field.removeAttribute('hidden'); toggle.textContent = '\u2212 Hide note'; autoSuppressed = true; $('#noteField', app).focus(); }
      else { field.setAttribute('hidden', ''); toggle.textContent = '+ Add a note (optional)'; }
    });
    const nf = $('#noteField', app);
    if (nf) nf.addEventListener('input', function () { answers[step.id + '_note'] = nf.value; save(); });
  }

  if (step.kind === 'choice') {
    $$('input[type=radio]', app).forEach(function (r) {
      r.addEventListener('change', function () {
        answers[step.id] = r.value;
        save();
        if (autoAdvance) setTimeout(function () { if (STEPS[idx] === step) next(true); }, 320);
      });
    });
  }

  if (step.kind === 'multi') {
    const sel = 'input[type=checkbox][data-multi="' + step.id + '"]';
    const boxes = $$(sel, app);
    boxes.forEach(function (c) {
      c.addEventListener('change', function () {
        const label = c.closest('.check');
        let list = Array.isArray(answers[step.id]) ? answers[step.id].slice() : [];
        const isNone = /^none/i.test(c.value);
        if (c.checked) {
          if (isNone) {
            list = [c.value];
            boxes.forEach(function (o) { if (o !== c) { o.checked = false; const l = o.closest('.check'); if (l) l.classList.remove('checked'); } });
          } else {
            list = list.filter(function (v) { return !/^none/i.test(v); });
            boxes.forEach(function (o) { if (/^none/i.test(o.value)) { o.checked = false; const l = o.closest('.check'); if (l) l.classList.remove('checked'); } });
            if (list.indexOf(c.value) === -1) list.push(c.value);
          }
        } else {
          list = list.filter(function (v) { return v !== c.value; });
        }
        if (label) label.classList.toggle('checked', c.checked);
        answers[step.id] = list;
        save();
      });
    });
  }

  if (step.kind === 'areas') {
    $$('input[data-area-chk]', app).forEach(function (c) {
      c.addEventListener('change', function () {
        const name = c.getAttribute('data-area-chk');
        const row = c.closest('.area-row');
        const sel = $('select[data-area-sev="' + cssEsc(name) + '"]', app);
        const cur = answers[step.id] || {};
        if (c.checked) {
          sel.disabled = false;
          if (!(name in cur)) cur[name] = 0;
          row.classList.add('on');
        } else {
          sel.disabled = true;
          sel.value = '0';
          delete cur[name];
          row.classList.remove('on');
        }
        answers[step.id] = cur;
        save();
      });
    });
    $$('select[data-area-sev]', app).forEach(function (sel) {
      sel.addEventListener('change', function () {
        const name = sel.getAttribute('data-area-sev');
        const cur = answers[step.id] || {};
        cur[name] = parseInt(sel.value, 10);
        answers[step.id] = cur;
        save();
      });
    });
  }

  if (step.kind === 'text') {
    const ta = document.getElementById(step.id);
    if (ta) ta.addEventListener('input', function () { answers[step.id] = ta.value; save(); });
  }

  const backBtn = $('#backBtn', app);
  if (backBtn) backBtn.addEventListener('click', back);
  const nextBtn = $('#nextBtn', app);
  if (nextBtn) nextBtn.addEventListener('click', function () { next(false); });
  const skipBtn = $('#skipBtn', app);
  if (skipBtn) skipBtn.addEventListener('click', function () {
    if (step.kind === 'text' && answers[step.id] == null) answers[step.id] = '';
    next(false, true);
  });
  const autoChk = $('#autoChk', app);
  if (autoChk) autoChk.addEventListener('change', function () { autoAdvance = autoChk.checked; save(); });
}

function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }

function collectFields() {
  const d = {};
  $$('input,select', app).forEach(function (inp) {
    if (inp.name) d[inp.name] = inp.value;
  });
  answers.demo = d;
  save();
}

/* ------------------------------------------------------------
   NAVIGATION
   ------------------------------------------------------------ */
function focusFirst() {
  const step = STEPS[idx];
  if (step.kind === 'scale') {
    const checked = $('input[type=radio]:checked', app);
    const target = checked || $('input[type=radio]', app);
    if (target) target.focus({ preventScroll: true });
  }
}

function next(auto, skipValidation) {
  const step = STEPS[idx];
  if (!skipValidation && !auto && step && !isAnswered(step) && !isOptional(step)) {
    shake();
    toast('Please choose an answer to continue');
    return;
  }
  if (idx < STEPS.length - 1) {
    idx++;
    autoSuppressed = false;
    save();
    renderStep();
  }
}

function back() {
  if (idx > 0) { idx--; autoSuppressed = false; save(); renderStep(); }
}

function shake() {
  const card = $('.card', app);
  if (!card) return;
  card.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(0)' }],
    { duration: 260, easing: 'ease-in-out' }
  );
}

/* ------------------------------------------------------------
   FINAL STEP
   ------------------------------------------------------------ */
function renderFinal() {
  app.innerHTML = '' +
    progressHTML({ kind: 'final' }) +
    '<div class="card section-card" style="text-align:center">' +
    '<span class="eyebrow">All done</span>' +
    '<h2>Your answers are ready</h2>' +
    '<p>We\u2019ll now work out a self-report impression and build two things for you: an easy-to-read result, and a summary you can share with your clinician.</p>' +
    '<div class="nav" style="justify-content:center">' +
    '<button type="button" class="btn btn-ghost" id="backBtn">\u2190 Back</button>' +
    '<button type="button" class="btn btn-primary" id="submitBtn">See my results \u2192</button>' +
    '</div>' +
    '</div>';
  $('#backBtn', app).addEventListener('click', back);
  $('#submitBtn', app).addEventListener('click', function () { finished = true; showResults(); });
}

/* ------------------------------------------------------------
   SCORING
   ------------------------------------------------------------ */
function ids(prefix, n) { const a = []; for (let i = 1; i <= n; i++) a.push(prefix + i); return a; }

function asrsPositiveCount() {
  const th = [2, 2, 2, 3, 3, 3];
  let c = 0;
  for (let i = 0; i < 6; i++) {
    const v = answers['asrs' + (i + 1)];
    if (typeof v === 'number' && v >= th[i]) c++;
  }
  return c;
}

function score() {
  const inatt = countGE(ids('in', 9), 3);
  const hyper = countGE(ids('hy', 9), 3);
  const exec = countGE(ids('ex', 12), 3);
  const emo = countGE(ids('em', 6), 3);
  const sleep = countGE(ids('sl', 8), 3);
  const asrs = asrsPositiveCount();

  const inattTotal = ids('in', 9).reduce(function (s, id) { return s + (answers[id] || 0); }, 0);
  const hyperTotal = ids('hy', 9).reduce(function (s, id) { return s + (answers[id] || 0); }, 0);

  const areasObj = answers.areas || {};
  const areaNames = Object.keys(areasObj);
  const areaSevs = areaNames.map(function (k) { return areasObj[k]; });
  const impairmentAvg = mean(areaSevs);
  const severeAreas = areaSevs.filter(function (v) { return v === 3; }).length;

  const totalSymptoms = inatt + hyper;
  const meetsThreshold = inatt >= 5 || hyper >= 5;

  let presentation;
  if (inatt >= 5 && hyper >= 5) presentation = 'Combined presentation (inattentive + hyperactive-impulsive)';
  else if (inatt >= 5) presentation = 'Predominantly inattentive presentation';
  else if (hyper >= 5) presentation = 'Predominantly hyperactive-impulsive presentation';
  else presentation = 'Below the DSM-5 symptom-count threshold';

  let severity, tone;
  if (!meetsThreshold && asrs < 4) { severity = 'Below symptom threshold'; tone = 'gray'; }
  else if (totalSymptoms >= 14 || severeAreas >= 3 || impairmentAvg >= 2.5) { severity = 'Severe (self-report)'; tone = 'red'; }
  else if (totalSymptoms >= 10 || impairmentAvg >= 1.5 || severeAreas >= 1 || asrs >= 5) { severity = 'Moderate (self-report)'; tone = 'amber'; }
  else { severity = 'Mild (self-report)'; tone = 'green'; }

  return {
    inatt: inatt, hyper: hyper, exec: exec, emo: emo, sleep: sleep, asrs: asrs,
    inattTotal: inattTotal, hyperTotal: hyperTotal, totalSymptoms: totalSymptoms,
    areaNames: areaNames, areaSevs: areaSevs, impairmentAvg: impairmentAvg, severeAreas: severeAreas,
    meetsThreshold: meetsThreshold, presentation: presentation, severity: severity, tone: tone
  };
}

/* ------------------------------------------------------------
   FLAGS
   ------------------------------------------------------------ */
function multiHas(id, needle) {
  const list = answers[id];
  if (!Array.isArray(list)) return false;
  return list.some(function (v) { return v.toLowerCase().indexOf(needle.toLowerCase()) !== -1; });
}
function yes(id) { return answers[id] === 'Yes'; }
function noOrUnsure(id) { return answers[id] === 'No' || answers[id] === 'Not sure'; }

function buildFlags(r) {
  const flags = [];

  if (r.asrs >= 4) flags.push({ t: 'ok', x: 'The 6-item attention screener came back <strong>positive</strong> (' + r.asrs + '/6 above threshold).' });
  else flags.push({ t: 'info', x: 'The 6-item attention screener was not positive (' + r.asrs + '/6). A negative screen does not rule out ADHD.' });

  if (yes('ch1')) flags.push({ t: 'ok', x: 'Childhood onset before age 12 reported \u2014 this supports an ADHD assessment.' });
  else if (answers.ch1) flags.push({ t: 'warn', x: 'Childhood onset before 12 is <strong>not clearly established</strong> (' + esc(answers.ch1) + '). DSM-5 requires it \u2014 try to find school reports or ask family.' });

  if (noOrUnsure('ch2')) flags.push({ t: 'warn', x: 'Symptoms in <strong>two or more settings</strong> in childhood is not confirmed. Try to recall both school and home.' });
  if (answers.ch7 === 'No') flags.push({ t: 'warn', x: 'Current symptoms were reported as not persisting \u2014 worth discussing with your clinician.' });

  if (multiHas('comorbid', 'Anxiety')) flags.push({ t: 'warn', x: 'Anxiety reported. Anxiety can both mimic and worsen ADHD, and must be assessed.' });
  if (multiHas('comorbid', 'Depression')) flags.push({ t: 'warn', x: 'Depression or low mood reported. Low mood causes concentration problems that can look like ADHD.' });
  if (multiHas('comorbid', 'Bipolar')) flags.push({ t: 'warn', x: 'Bipolar disorder reported. Stimulant treatment needs careful psychiatric assessment in this context.' });
  if (multiHas('comorbid', 'PTSD')) flags.push({ t: 'warn', x: 'PTSD or trauma reported. Trauma can produce attention and regulation problems similar to ADHD.' });
  if (multiHas('comorbid', 'OCD')) flags.push({ t: 'warn', x: 'OCD symptoms reported. Intrusive thoughts can disrupt attention and mimic ADHD.' });
  if (multiHas('comorbid', 'learning disability')) flags.push({ t: 'warn', x: 'A learning disability was reported \u2014 it often co-occurs with ADHD and needs separate assessment.' });
  if (multiHas('comorbid', 'Autism')) flags.push({ t: 'warn', x: 'Autism-spectrum traits reported \u2014 overlapping features with ADHD should be disentangled.' });

  if (multiHas('medical', 'Sleep apnea')) flags.push({ t: 'warn', x: 'Possible sleep apnea. Untreated apnea causes severe daytime inattention and must be ruled out.' });
  if (multiHas('medical', 'Thyroid')) flags.push({ t: 'warn', x: 'Thyroid problem reported \u2014 thyroid dysfunction is a classic mimic of ADHD and should be checked.' });
  if (multiHas('medical', 'Anemia')) flags.push({ t: 'warn', x: 'Anemia / iron deficiency reported \u2014 low iron can impair attention and energy.' });
  if (multiHas('medical', 'B12')) flags.push({ t: 'warn', x: 'B12 deficiency reported \u2014 it can cause poor concentration and memory.' });
  if (multiHas('medical', 'Head injury')) flags.push({ t: 'warn', x: 'Head injury reported \u2014 post-concussive symptoms can resemble ADHD.' });
  if (multiHas('medical', 'Hormonal')) flags.push({ t: 'info', x: 'Hormonal factors reported \u2014 these can affect focus, mood, and energy.' });

  if (multiHas('substances', 'Cannabis')) flags.push({ t: 'warn', x: 'Cannabis use reported \u2014 heavy use can cause motivation and attention problems.' });
  if (multiHas('substances', 'Alcohol')) flags.push({ t: 'warn', x: 'Alcohol use reported \u2014 it affects sleep and cognition and should be discussed.' });
  if (multiHas('substances', 'Stimulant') || multiHas('substances', 'Cocaine')) flags.push({ t: 'warn', x: 'Recreational stimulant use reported \u2014 this affects assessment and treatment planning.' });

  if (yes('fm1')) flags.push({ t: 'ok', x: 'Family history of ADHD \u2014 ADHD is highly heritable, which supports assessment.' });

  if (yes('tr1')) flags.push({ t: 'info', x: 'Previous ADHD medication trial reported \u2014 this response history is very useful for your clinician; details are in the summary.' });

  if (r.areaNames.length === 0) flags.push({ t: 'warn', x: 'No impairment areas were selected. A diagnosis generally requires symptoms to cause impairment in 2+ settings.' });

  if (!flags.some(function (f) { return f.t === 'warn'; })) {
    flags.push({ t: 'info', x: 'No major red flags were identified in this screen. This does not rule ADHD in or out \u2014 confirm with a clinician.' });
  }
  return flags;
}

/* ------------------------------------------------------------
   SUMMARY TEXT
   ------------------------------------------------------------ */
function demoVal(name) {
  const d = answers.demo || {};
  return d[name] && String(d[name]).trim() ? String(d[name]).trim() : '\u2014';
}

function ratedVeryOften(prefix, n) {
  const rows = [];
  for (let i = 1; i <= n; i++) {
    const v = answers[prefix + i];
    if (typeof v === 'number' && v >= 3 && LABELS[prefix + i]) rows.push({ text: LABELS[prefix + i].text, v: v, note: answers[prefix + i + '_note'] });
  }
  return rows;
}

function lineForMulti(id) {
  const list = answers[id];
  if (!Array.isArray(list) || !list.length) return '\u2014';
  return list.join(', ');
}
function lineForText(id) {
  const v = answers[id];
  return v && String(v).trim() ? String(v).trim().replace(/\s+/g, ' ') : '\u2014';
}
function lineForChoice(id) { return answers[id] != null ? answers[id] : '\u2014'; }

function fullSummary(r) {
  const L = [];
  const ln = function (s) { L.push(s == null ? '' : s); };
  const rule = function () { L.push('-'.repeat(60)); };
  const pad = function (s, n) { s = String(s); return (s + ' '.repeat(Math.max(0, n - s.length))).slice(0, Math.max(n, s.length)); };

  ln('ADHD SELF-SCREENING SUMMARY  (self-report \u2014 not a diagnosis)');
  rule();
  ln('Date: ' + demoVal('screenDate') + '   |   Age: ' + demoVal('age') + '   |   Gender: ' + demoVal('gender'));
  ln('Location: ' + demoVal('city') + '   |   Main activity: ' + demoVal('occupation'));
  ln('');

  ln('SCREEN IMPRESSION');
  ln('  Presentation : ' + r.presentation);
  ln('  Severity     : ' + r.severity);
  ln('  Adult screener (6-item) : ' + r.asrs + '/6 above threshold ' + (r.asrs >= 4 ? '(positive)' : '(negative)'));
  ln('');

  ln('CORE SYMPTOM SCORES  (past 6 months)');
  ln('  Inattention               : ' + r.inatt + '/9 rated Often or worse   (sum ' + r.inattTotal + '/36)');
  ln('  Hyperactivity/impulsivity : ' + r.hyper + '/9 rated Often or worse   (sum ' + r.hyperTotal + '/36)');
  ln('  DSM-5 threshold           : ' + (r.meetsThreshold ? 'MET' : 'NOT MET') + '  (needs 5+ in either domain)');
  ln('');

  ln('ADDITIONAL DOMAINS  (rated Often or worse)');
  ln('  Executive function : ' + r.exec + '/12');
  ln('  Emotional regulation: ' + r.emo + '/6');
  ln('  Sleep & rest        : ' + r.sleep + '/8');
  ln('');

  ln('SYMPTOMS RATED "OFTEN" OR WORSE, WITH EXAMPLES');
  let any = false;
  [['Inattention', 'in', 9], ['Hyperactivity/impulsivity', 'hy', 9], ['Executive', 'ex', 12], ['Emotional', 'em', 6], ['Sleep', 'sl', 8]].forEach(function (grp) {
    ratedVeryOften(grp[1], grp[2]).forEach(function (row) {
      any = true;
      const tag = row.v === 4 ? 'Very Often' : 'Often';
      ln('  [' + grp[0] + ' \u2014 ' + tag + '] ' + row.text);
      if (row.note) ln('        e.g. ' + row.note);
    });
  });
  if (!any) ln('  (none reported at this frequency)');
  ln('');

  ln('CHILDHOOD ONSET & HISTORY');
  CHILDHOOD.forEach(function (q) { ln('  ' + pad(lineForChoice(q.id), 10) + ' ' + q.text); });
  ln('');

  ln('IMPAIRMENT BY LIFE AREA');
  if (r.areaNames.length) {
    r.areaNames.forEach(function (name) { ln('  ' + pad(name, 26) + ' ' + SEV[answers.areas[name]]); });
    ln('  Average severity: ' + r.impairmentAvg.toFixed(1) + '/3   |   Severe areas: ' + r.severeAreas);
  } else {
    ln('  (no areas selected)');
  }
  const fn = lineForText('q25');
  if (fn !== '\u2014') ln('  Function note: ' + fn);
  ln('');

  ln('DURATION & PATTERN');
  DURATION.forEach(function (q) { ln('  ' + pad(lineForChoice(q.id), 24) + ' ' + q.text); });
  ln('');

  ln('OTHER CONDITIONS REPORTED');
  ln('  Psychiatric/developmental : ' + lineForMulti('comorbid'));
  ln('  Medical                   : ' + lineForMulti('medical'));
  const q26 = lineForText('q26');
  if (q26 !== '\u2014') ln('  Notes                     : ' + q26);
  ln('');

  ln('SUBSTANCES');
  ln('  Used in past year : ' + lineForMulti('substances'));
  ln('  Frequency/impact  : ' + lineForText('q27'));
  ln('');

  ln('FAMILY & EARLY HISTORY');
  FAMILY.forEach(function (q) { ln('  ' + pad(lineForChoice(q.id), 10) + ' ' + q.text); });
  ln('');

  ln('TREATMENT HISTORY');
  ln('  Ever took ADHD medication : ' + lineForChoice('tr1'));
  ln('  Ever had therapy/coaching : ' + lineForChoice('tr2'));
  ln('  Medication & dose         : ' + lineForText('tr_meds'));
  ln('  How it helped             : ' + lineForText('tr_help'));
  ln('  Side effects              : ' + lineForText('tr_side'));
  ln('  Why stopped               : ' + lineForText('tr_stop'));
  ln('  Other treatment           : ' + lineForText('tr_other'));
  const q28 = lineForText('q28');
  if (q28 !== '\u2014') ln('  Additional comments       : ' + q28);
  ln('');

  ln('CLINICIAN FLAGS');
  buildFlags(r).forEach(function (f) { ln('  \u2022 ' + String(f.x).replace(/<[^>]+>/g, '')); });
  ln('');
  rule();
  ln('Note: amphetamine-based medicines (Adderall, Vyvanse) are not available in every country;');
  ln('available options vary by region (e.g. methylphenidate and atomoxetine). This is a');
  ln('self-report screen, not a clinical diagnosis.');
  return L.join('\n');
}

function shortMessage(r) {
  const bits = [];
  bits.push('Hello, I completed an ADHD self-screening questionnaire and would like to be assessed.');
  bits.push('');
  bits.push('Quick summary: I am ' + demoVal('age') + (demoVal('occupation') !== '\u2014' ? ' (' + demoVal('occupation') + ')' : '') + '.');
  bits.push('The self-report suggests: ' + r.severity + '.');
  bits.push('Presentation: ' + r.presentation + '.');
  bits.push('Symptom scores: inattention ' + r.inatt + '/9, hyperactivity/impulsivity ' + r.hyper + '/9 rated "Often or worse" (DSM-5 threshold ' + (r.meetsThreshold ? 'met' : 'not met') + ').');
  bits.push('Affected life areas: ' + (r.areaNames.length ? r.areaNames.length + ' areas (avg severity ' + r.impairmentAvg.toFixed(1) + '/3)' : 'none selected') + '.');
  bits.push('Adult screener: ' + (r.asrs >= 4 ? 'positive' : 'negative') + ' (' + r.asrs + '/6).');
  bits.push('');
  bits.push('The full structured summary is below so you have the detail before we meet. Thank you.');
  bits.push('');
  bits.push('-------------------------------------------');
  bits.push('');
  bits.push(fullSummary(r));
  return bits.join('\n');
}

/* ------------------------------------------------------------
   RESULTS RENDERING
   ------------------------------------------------------------ */
function showResults() {
  const r = score();
  const blurb = {
    gray: 'Your answers do not currently meet the DSM-5 symptom-count threshold. Symptoms may still be worth discussing with a clinician.',
    green: 'Symptoms meet the threshold with mild impairment. A clinician should still confirm the diagnosis and rule out other causes.',
    amber: 'Symptoms meet the threshold and cause moderate, real-world problems. This is the most common range for adults seeking an assessment.',
    red: 'Many severe symptoms plus significant impairment across settings. This warrants a prompt psychiatric assessment.'
  }[r.tone];

  const pctA = Math.round(r.inattTotal / 36 * 100);
  const pctB = Math.round(r.hyperTotal / 36 * 100);

  let flagsHTML = buildFlags(r).map(function (f) {
    const cls = f.t === 'ok' ? 'ok' : (f.t === 'info' ? 'info' : '');
    return '<li class="' + cls + '">' + f.x + '</li>';
  }).join('');

  resultsEl.innerHTML = '' +
    '<div class="banner b-' + r.tone + '">' +
    '<h3>Self-Report Impression</h3>' +
    '<div class="big">' + esc(r.severity) + '</div>' +
    '<p><strong>' + esc(r.presentation) + '</strong> \u2014 ' + blurb + '</p>' +
    '</div>' +

    '<div class="card">' +
    '<p class="q-eyebrow">Score Breakdown</p>' +
    '<div class="statgrid">' +
    '<div class="stat"><div class="k">Inattention</div><div class="v">' + r.inatt + ' / 9</div><div class="s">rated Often or worse \u00b7 sum ' + r.inattTotal + '/36</div>' +
    '<div class="bar"><i style="width:' + pctA + '%"></i></div></div>' +
    '<div class="stat"><div class="k">Hyperactivity / Impulsivity</div><div class="v">' + r.hyper + ' / 9</div><div class="s">rated Often or worse \u00b7 sum ' + r.hyperTotal + '/36</div>' +
    '<div class="bar"><i style="width:' + pctB + '%;background:linear-gradient(90deg,var(--accent-2),var(--accent))"></i></div></div>' +
    '<div class="stat"><div class="k">Adult Screener (6-item)</div><div class="v" style="color:' + (r.asrs >= 4 ? 'var(--green)' : 'var(--muted)') + '">' + r.asrs + ' / 6</div><div class="s">' + (r.asrs >= 4 ? 'positive screen' : 'below the cutoff') + '</div></div>' +
    '<div class="stat"><div class="k">DSM-5 Threshold</div><div class="v" style="color:' + (r.meetsThreshold ? 'var(--green)' : 'var(--red)') + '">' + (r.meetsThreshold ? 'MET' : 'NOT MET') + '</div><div class="s">needs 5+ symptoms in either domain</div></div>' +
    '<div class="stat"><div class="k">Impairment Areas</div><div class="v">' + r.areaNames.length + '</div><div class="s">avg severity ' + r.impairmentAvg.toFixed(1) + '/3 \u00b7 ' + r.severeAreas + ' severe</div></div>' +
    '<div class="stat"><div class="k">Supporting Domains</div><div class="v">' + (r.exec + r.emo + r.sleep) + '</div><div class="s">exec ' + r.exec + '/12 \u00b7 emotion ' + r.emo + '/6 \u00b7 sleep ' + r.sleep + '/8</div></div>' +
    '</div>' +
    '</div>' +

    '<div class="card">' +
    '<p class="q-eyebrow">Flags &amp; Notes for Your Clinician</p>' +
    '<ul class="flags">' + flagsHTML + '</ul>' +
    '</div>' +

    '<div class="card share-card">' +
    '<p class="q-eyebrow">Share With Your Therapist</p>' +
    '<p class="sub">Two versions are prepared for you. Nothing is sent anywhere automatically \u2014 you choose how to share.</p>' +
    '<div class="seg-tabs no-print">' +
    '<button type="button" data-tab="short" class="active">Short message</button>' +
    '<button type="button" data-tab="full">Full summary</button>' +
    '</div>' +
    '<textarea id="shortBox" readonly></textarea>' +
    '<textarea id="fullBox" readonly hidden></textarea>' +
    '<div class="share-btns no-print">' +
    '<button type="button" class="btn btn-primary small" id="copyShort">Copy short message</button>' +
    '<button type="button" class="btn btn-ghost small" id="copyFull">Copy full summary</button>' +
    '<button type="button" class="btn btn-ghost small" id="shareBtn">Share\u2026</button>' +
    '<button type="button" class="btn btn-ghost small" id="waBtn">WhatsApp</button>' +
    '<button type="button" class="btn btn-ghost small" id="mailBtn">Email</button>' +
    '<button type="button" class="btn btn-ghost small" id="printBtn">Print / Save PDF</button>' +
    '<button type="button" class="btn btn-ghost small" id="retakeBtn">Retake test</button>' +
    '</div>' +
    '<div class="disclaimer">' +
    '<strong>Reminder:</strong> this screen cannot diagnose ADHD and cannot prescribe medication. ' +
    'Controlled stimulants are regulated and only a qualified clinician can prescribe them; availability and rules vary by country. ' +
    'Discuss all options with a qualified psychiatrist or physician.' +
    '</div>' +
    '</div>';

  const short = shortMessage(r);
  const full = fullSummary(r);
  $('#shortBox', resultsEl).value = short;
  $('#fullBox', resultsEl).value = full;

  resultsEl.hidden = false;
  app.hidden = true;
  $('#hero', document).classList.add('compact');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  wireResults(short, full);
}

function wireResults(short, full) {
  const tabs = $$('.seg-tabs button', resultsEl);
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      const shortTab = t.getAttribute('data-tab') === 'short';
      $('#shortBox', resultsEl).hidden = !shortTab;
      $('#fullBox', resultsEl).hidden = shortTab;
    });
  });

  const copyShort = $('#copyShort', resultsEl);
  const copyFull = $('#copyFull', resultsEl);
  if (copyShort) copyShort.addEventListener('click', function () { copyText(short, 'Short message copied'); });
  if (copyFull) copyFull.addEventListener('click', function () { copyText(full, 'Full summary copied'); });

  const shareBtn = $('#shareBtn', resultsEl);
  if (shareBtn) shareBtn.addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({ title: 'ADHD self-screening summary', text: short }).catch(function () { });
    } else {
      copyText(short, 'Sharing not supported \u2014 message copied instead');
    }
  });

  const waBtn = $('#waBtn', resultsEl);
  if (waBtn) waBtn.addEventListener('click', function () {
    const url = 'https://wa.me/?text=' + encodeURIComponent(short);
    window.open(url, '_blank', 'noopener');
  });

  const mailBtn = $('#mailBtn', resultsEl);
  if (mailBtn) mailBtn.addEventListener('click', function () {
    const subject = 'ADHD self-screening summary';
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(short);
  });

  const printBtn = $('#printBtn', resultsEl);
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  const retakeBtn = $('#retakeBtn', resultsEl);
  if (retakeBtn) retakeBtn.addEventListener('click', function () {
    if (!confirm('Clear all answers and start over?')) return;
    answers = {}; idx = 0; finished = false; clearSaved();
    resultsEl.hidden = true; resultsEl.innerHTML = '';
    app.hidden = false;
    $('#hero', document).classList.remove('compact');
    renderStep();
  });
}

async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg || 'Copied');
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg || 'Copied'); }
    catch (e2) { toast('Copy failed \u2014 please select and copy manually'); }
    document.body.removeChild(ta);
  }
}

/* ------------------------------------------------------------
   TOAST
   ------------------------------------------------------------ */
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
}

/* ------------------------------------------------------------
   KEYBOARD
   ------------------------------------------------------------ */
document.addEventListener('keydown', function (e) {
  if (resultsEl.hidden === false) return;
  const step = STEPS[idx];
  if (!step) return;
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  const typing = tag === 'TEXTAREA' || (tag === 'INPUT' && document.activeElement.type !== 'radio' && document.activeElement.type !== 'checkbox') || tag === 'SELECT';

  if (e.key === 'Enter' && !typing) {
    if (step.kind === 'intro') { const b = $('#beginBtn', app); if (b) b.click(); return; }
    if (step.kind === 'section') { const b = $('#nextBtn', app); if (b) b.click(); return; }
    if (step.kind === 'final') { const b = $('#submitBtn', app); if (b) b.click(); return; }
    e.preventDefault();
    next(false);
    return;
  }
  if (typing) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); next(false); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }

  if (step.kind === 'scale' && /^[1-5]$/.test(e.key)) {
    const v = parseInt(e.key, 10) - 1;
    const input = $('input[name="' + step.id + '"][value="' + v + '"]', app);
    if (input) { input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); }
  } else if (step.kind === 'choice' && /^[1-9]$/.test(e.key)) {
    const v = parseInt(e.key, 10) - 1;
    const opts = $$('input[name="' + step.id + '"]', app);
    if (opts[v]) { opts[v].checked = true; opts[v].dispatchEvent(new Event('change', { bubbles: true })); }
  }
});

/* ------------------------------------------------------------
   INIT
   ------------------------------------------------------------ */
function init() {
  buildSteps();

  const saved = loadSaved();
  if (saved && saved.answers && Object.keys(saved.answers).length) {
    answers = saved.answers || {};
    autoAdvance = typeof saved.auto === 'boolean' ? saved.auto : true;
    idx = 0; /* always start at intro so people see the disclaimer */
  }

  /* hero meta */
  const qCount = totalQuestions();
  const mins = Math.max(3, Math.round(qCount * 0.13));
  document.getElementById('heroMeta').innerHTML =
    '<span>' + qCount + ' questions</span>' +
    '<span>\u2248 ' + mins + '\u2013' + (mins + 4) + ' min</span>' +
    '<span>Private \u00b7 on-device</span>' +
    '<span>DSM-5 informed</span>';

  renderStep();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
