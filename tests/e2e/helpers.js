// Shared E2E helpers. Every flow drives the real UI; `INADTest` is a small test hook
// (exposed by the app, or shimmed onto the v6.1 baseline) used only for seeding,
// jumping to a queue position and reading state for assertions.
import { expect } from '@playwright/test';

export const ENTRY = process.env.INAD_ENTRY || '/index.html';
const TARGET = process.env.INAD_TARGET || 'dist';

// v6.1 declares everything as classic-script globals; expose the same hook surface.
const LEGACY_SHIM = `Object.defineProperty(window,'INADTest',{configurable:true,get(){return {
  seed:()=>SESSION_SEED,
  regenerate:(s)=>{regenerateSession(s);renderQueue();renderTop();},
  queue:()=>SHIFT_QUEUE.map((q,i)=>{const c=q.caseId?coreCaseMap.get(q.caseId):normalCaseMap.get(q.normalId);return {index:i,shift:q.shift,travelerId:q.travelerId,caseId:q.caseId,normalId:q.normalId,id:c.id,special:c.special||null,resolution:c.resolution,required:c.required||[],sessionVariant:c.sessionVariant||null,basis:c.basis}}),
  state:()=>({caseIndex:state.caseIndex,stage:state.stage,strikes:state.strikes,score:state.score,started:state.started,ended:state.ended,stats:{...state.stats},performed:state.performed.slice(),asked:[...state.asked],looked:[...state.looked],refugeeStep:state.refugeeStep,repatriationStep:state.repatriationStep,forensic:state.forensic,investigation:state.investigation,arrestReview:state.arrestReview,reports:state.reports.map(r=>({label:r.label,caseId:r.caseId,procedure:r.procedure,interpreter:r.interpreter,actions:r.actions})),mistakes:state.mistakes.map(m=>m.msg),language:state.language?{mode:state.language.mode,korean:state.language.korean,english:state.language.english,interpreterActive:state.language.interpreterActive,interpreterUsed:state.language.interpreterUsed}:null,behavior:state.behavior?{stress:state.behavior.stress,rapport:state.behavior.rapport}:null,campaignId:state.campaignId,campaignDay:state.campaignDay,difficulty:state.difficulty,scenarioId:state.scenarioId}),
  current:()=>{const c=current();return {id:c.id,travelerId:c.travelerId,special:c.special||null,required:c.required||[],resolution:c.resolution,questions:c.questions.map(q=>({id:q.id,cat:q.cat,q:q.q,requires:q.requires||[]})),docs:c.docs.map(d=>d.t)}},
  jump:(i)=>{state.caseIndex=i;initCase(true);},
  languageFor:(i)=>{const q=SHIFT_QUEUE[i];const c=q.caseId?coreCaseMap.get(q.caseId):normalCaseMap.get(q.normalId);const l=languageProfileFor(c);return {mode:l.mode,korean:l.korean,english:l.english}},
  partyFor:(i)=>{const q=SHIFT_QUEUE[i];const p=PARTY_BY_TRAVELER.get(q.travelerId);return p?{id:p.id,mode:p.mode,members:p.members.map(m=>m.queueIndex)}:null},
  campaignSave:()=>loadCampaign(),
  progressSave:()=>loadProgressSave(),
  meta:()=>loadMeta(),
  version:()=>'6.1'
}}});`;

export async function openGame(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  if (TARGET === 'legacy') await page.addInitScript(LEGACY_SHIM);
  await page.goto(ENTRY);
  await expect(page.locator('#startBtn')).toBeVisible();
  return errors;
}

export async function expectNoErrors(errors) {
  expect(errors, 'no page errors / console errors').toEqual([]);
}

export const hook = (page, fn, ...args) => page.evaluate(([src, a]) => {
  // eslint-disable-next-line no-new-func
  return new Function('INADTest', 'args', 'return (' + src + ')(INADTest, ...args)')(window.INADTest, a);
}, [fn.toString(), args]);

export const getState = (page) => hook(page, (T) => T.state());
export const getQueue = (page) => hook(page, (T) => T.queue());
export const currentCase = (page) => hook(page, (T) => T.current());

export async function setSeed(page, seed) {
  await hook(page, (T, s) => T.regenerate(s), seed);
  await expect(page.locator('#sessionSeed')).toHaveText(String(seed));
}

// Choose guidance (expert = no tutorial) and other start options through the real start screen.
export async function chooseStartOption(page, selector) {
  const toggle = page.locator('#v6AdvancedToggle, #setupAdvancedToggle');
  if (await toggle.count()) {
    const expanded = await toggle.first().getAttribute('aria-expanded');
    if (expanded !== 'true') { await toggle.first().click(); await expect(toggle.first()).toHaveAttribute('aria-expanded', 'true'); }
  }
  const el = page.locator(selector);
  await el.scrollIntoViewIfNeeded();
  await el.click();
  await expect(el).toHaveClass(/on/);
}

export async function startShift(page, { guidance = 'expert' } = {}) {
  await chooseStartOption(page, `[data-guidance="${guidance}"]`);
  await page.locator('#startBtn').click();
  await expect(page.locator('#briefStart')).toBeVisible();
  await page.locator('#briefStart').click();
  await expect(page.locator('#startOverlay')).toHaveClass(/hide/);
  await expect(page.locator('#log .msg').first()).toBeVisible();
}

// Connect an interpreter when direct communication is too limited for complex questions.
// (Interpreter use never changes a legal outcome; it only makes statements recordable.)
export async function ensureCommunication(page) {
  const st = await getState(page);
  const l = st.language; if (!l) return;
  const level = l.interpreterActive ? 4 : l.mode === 'ko' ? l.korean : l.mode === 'en' ? l.english : 0;
  if (level < 3) { await page.locator('#langInterp').click(); await expect(page.locator('#langInterp')).toContainText('통역 연결됨'); }
}

export async function jumpTo(page, index) {
  await hook(page, (T, i) => T.jump(i), index);
  await expect(page.locator('#caseId')).toContainText('A' + String(index + 1).padStart(3, '0'));
}

// Ask a question through the interview panel: pick the category tab, then click the question button.
export async function ask(page, qid) {
  const c = await currentCase(page);
  const q = c.questions.find((x) => x.id === qid);
  if (!q) throw new Error(`question ${qid} not in case ${c.id}`);
  await page.locator('#qtabs .qtab', { hasText: q.cat }).click();
  const btn = page.locator('#questions .qbtn', { hasText: q.q });
  await expect(btn).toBeEnabled();
  await btn.click();
  return q;
}

export async function lookup(page, kind) {
  await page.locator(`.lookup-tabs button[data-lu="${kind}"]`).click();
  await expect(page.locator('#terminal .line').first()).toBeVisible();
}

export async function continueDoc(page) {
  await expect(page.locator('#docContinue')).toBeVisible();
  await page.locator('#docContinue').click();
}

export async function expectResult(page, label) {
  await expect(page.locator('#modalTitle')).toHaveText('심사 처리 결과');
  await expect(page.locator('#modalBody')).toContainText(label);
}

export async function nextCase(page) {
  await page.locator('#nextCase').click();
}

export async function procAct(page, act) {
  const b = page.locator(`#procBody [data-proc-act="${act}"]`);
  await expect(b).toBeVisible();
  await b.click();
}

export async function findQueueIndex(page, pred) {
  const queue = await getQueue(page);
  const hit = queue.find(pred);
  if (!hit) throw new Error('no queue item matches predicate');
  return hit.index;
}

// Generic solver for procedurally generated normal passengers (resolution is always CLEAR):
// satisfies every required action through the UI, then admits.
export async function solveNormalCase(page) {
  const c = await currentCase(page);
  if (c.resolution.type !== 'CLEAR') throw new Error(`solveNormalCase: case ${c.id} is not a CLEAR case`);
  const st = await getState(page);
  if (st.language && st.language.mode === 'none') {
    await page.locator('#langInterp').click();
    await expect(page.locator('#langInterp')).toContainText('통역 연결됨');
  }
  const asked = new Set();
  async function askWithDeps(qid) {
    if (asked.has(qid)) return;
    const q = c.questions.find((x) => x.id === qid);
    for (const dep of q.requires || []) {
      if (dep.startsWith('QUESTION_')) await askWithDeps(dep.slice(9));
      else if (dep.startsWith('LOOKUP_')) await lookup(page, dep.slice(7));
    }
    await ask(page, qid);
    asked.add(qid);
  }
  for (const r of c.required) {
    if (r === 'SECONDARY') {
      await page.locator('#secondaryBtn').click();
      await expect(page.locator('#procedureScreen')).toHaveClass(/on/);
      await procAct(page, 'back');
    } else if (r.startsWith('QUESTION_')) await askWithDeps(r.slice(9));
    else if (r.startsWith('LOOKUP_')) await lookup(page, r.slice(7));
    else throw new Error('unsupported requirement ' + r);
  }
  await page.locator('#clearBtn').click();
  await continueDoc(page);
  await expectResult(page, '입국 허가');
}

export async function afterNext(page) {
  // After "다음 승객 호출" a shift transition briefing may appear.
  const begin = page.locator('#beginShift');
  await page.waitForTimeout(150);
  if (await begin.isVisible()) await begin.click();
  await expect(page.locator('#modal')).not.toHaveClass(/on/);
}

// FNV-1a as used by the game for seed derivation (campaign day seeds).
export function hashSeed(v) {
  let h = 2166136261 >>> 0;
  for (const ch of String(v)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export const campaignDaySeed = (base, id, day) => 100000 + (hashSeed(`${base}|CAMPAIGN|${id}|DAY|${day}`) % 900000);

export async function tabTo(page, id, max = 60) {
  for (let i = 0; i < max; i++) {
    const active = await page.evaluate(() => document.activeElement && document.activeElement.id);
    if (active === id) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('could not reach #' + id + ' with Tab');
}
export async function tabToSelector(page, selector, max = 60) {
  for (let i = 0; i < max; i++) {
    const hit = await page.evaluate((sel) => !!(document.activeElement && document.activeElement.matches(sel)), selector);
    if (hit) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('could not reach ' + selector + ' with Tab');
}
