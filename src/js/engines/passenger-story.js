// Passenger stories for generated passengers (v13, pure, DOM-free).
//
// Gives every generated passenger a trip of their own — opening statement, concrete plan, lodging, funds,
// occupation — and writes a "looks odd, turns out fine" anomaly into the submitted document instead of
// announcing it. Content lives in data/passenger-stories.js; nothing here branches on a case id.
//
// Guarantees (tests/unit/passenger-story.test.js):
// - Own seeded stream (seed + traveller id): the roster stream of queue-engine is not consumed, so which
//   passenger appears where, and how each case resolves, is exactly what it was before.
// - `required`, `resolution` and `evidence` are never touched. Story questions are optional.
// - Idempotent: applying twice (once at generation, once after travel parties rewrite stay and hotel)
//   yields the same case.
// - Nationality, sex and portrait are never read.
import { hashSeed, makeRng, pick } from './rng.js';
import { VOICES, TRIP_THEMES, HOME_JOBS, JOB_FALLBACK, JOB_MINOR, FUNDS, SCHOOLS, MAJORS, STORY_QUESTIONS, REVIEW_ANOMALIES, PAID_ACTIVITY, nightsOf } from '../../data/passenger-stories.js';

const REFERENCE_YEAR = 2026;
export const STORY_QUESTION_IDS = ['plan', 'lodging', 'funds', 'job'];

export function storyKind(c) {
  if (/재입국/.test(c?.basis || '')) return 'resident';
  if (/상용/.test(c?.basis || '') || /업무|출장|회의/.test(c?.purpose || '')) return 'business';
  return 'tourist';
}

// The anomaly a secondary-clear case gets. The roster stream picks a name; a name that does not fit the
// passenger's entry basis (a hotel anomaly for a resident who has no hotel) is replaced deterministically.
export function resolveAnomaly(name, kind, key) {
  if (REVIEW_ANOMALIES[name]?.kinds.includes(kind)) return name;
  const fits = Object.keys(REVIEW_ANOMALIES).filter((k) => REVIEW_ANOMALIES[k].kinds.includes(kind));
  return fits[hashSeed(key) % fits.length];
}

function setField(doc, key, value) {
  if (!doc) return; const row = (doc.fields ||= []).find((x) => x[0] === key);
  if (row) row[1] = value; else doc.fields.push([key, value]);
}
function putQuestion(c, q) { const i = c.questions.findIndex((x) => x.id === q.id); if (i >= 0) c.questions[i] = q; else c.questions.push(q); }
const lodgingName = (c) => { const d = (c.docs || []).find((x) => x.k === 'HOTEL'); return (d?.fields || []).find((x) => x[0] === '숙박')?.[1] || ''; };

// Deterministic choices for one passenger. Exposed for tests; the case is not modified.
// `group` (a travel-party id) makes everyone in the party tell the same trip; manner, job and funds stay their own.
export function storyFor(c, seed, group = null) {
  const rng = makeRng(hashSeed(`${seed}|STORY|${c.travelerId}`));
  const kind = storyKind(c); const voice = pick(VOICES, rng); const own = pick(TRIP_THEMES[kind], rng);
  const theme = group ? pick(TRIP_THEMES[kind], makeRng(hashSeed(`${seed}|TRIP|${group}`))) : own;
  const lead = pick(voice.lead, rng), tail = pick(voice.tail, rng);
  const age = REFERENCE_YEAR - Number(String(c.dob || '').slice(0, 4) || REFERENCE_YEAR - 30);
  const jobs = HOME_JOBS.filter((j) => age >= j.min && age <= j.max);
  const job = kind === 'business' ? theme.job : kind === 'resident' ? `${pick(SCHOOLS, rng)} ${pick(MAJORS, rng)}에 재학 중입니다.` : (age < 18 ? JOB_MINOR : jobs.length ? pick(jobs, rng).a : JOB_FALLBACK);
  const funds = pick(FUNDS[kind], rng);
  const paid = pick(PAID_ACTIVITY[kind] || PAID_ACTIVITY.tourist, rng);
  return { kind, voice: voice.id, theme, opening: `${lead}${voice.brief ? theme.brief : theme.open}${tail ? ' ' + tail : ''}`, job, funds, paid };
}

// Write the anomaly of a secondary-clear case: document field, follow-up question, lookup result, clues.
// Returns the `required` list (same shape the generator always used).
export function applyReviewAnomaly(c, name) {
  const spec = REVIEW_ANOMALIES[name]; const [kind, tone, text] = spec.lookup;
  c.anomaly = name;
  putQuestion(c, { id: 'detail', cat: spec.question.cat, q: spec.question.q, a: spec.question.a, reveal: 'depth', requires: spec.question.requires });
  c.lookups[kind] = [tone, text];
  c.clues = spec.clues.map(([trigger, title, body, clueKind], i) => ({ id: 'n' + (i + 1), trigger, title, text: body, kind: clueKind, key: true }));
  if (spec.returnDelivery) c.returnDelivery = spec.returnDelivery;
  return ['SECONDARY', 'QUESTION_detail', 'LOOKUP_' + kind];
}

export function applyPassengerStory(c, seed, group = null) {
  const s = storyFor(c, seed, group); const variant = c.sessionVariant || '';
  c.story = { kind: s.kind, voice: s.voice, theme: s.theme.id };
  // First statement: what this person would say at the counter. It never names the outcome of the case.
  c.initial = variant === 'generated-refuse-bioRefusal' ? `${s.opening} 그런데 지문과 사진은 꼭 찍어야 합니까?` : s.opening;
  const purpose = c.questions.find((q) => q.id === 'purpose'); if (purpose) purpose.a = s.theme.purpose;
  // The stay answer follows the record (a travel party shares the lead's stay).
  const stay = c.questions.find((q) => q.id === 'stay');
  if (stay) stay.a = s.kind === 'resident' ? '학업이 끝날 때까지 체류자격에 따라 머뭅니다.' : `${c.stay} 머물 예정입니다.`;
  if (s.kind === 'resident') {
    putQuestion(c, { id: 'plan', ...STORY_QUESTIONS.planResident, a: s.theme.plan });
    putQuestion(c, { id: 'job', ...STORY_QUESTIONS.jobResident, a: s.job });
  } else {
    putQuestion(c, { id: 'plan', ...STORY_QUESTIONS.plan, a: s.theme.plan });
    const hotel = lodgingName(c), nights = nightsOf(c);
    const span = c.anomaly === 'staySpan' ? `처음 ${Math.max(1, nights - 2)}박은 ${hotel}에 예약했습니다.` : `${hotel}에 ${nights}박을 예약했습니다.`;
    if (hotel) putQuestion(c, { id: 'lodging', ...STORY_QUESTIONS.lodging, a: c.anomaly === 'companionHotel' ? `${hotel}입니다. 예약은 동행인이 했습니다.` : span });
    putQuestion(c, { id: 'job', ...STORY_QUESTIONS.job, a: s.job });
  }
  putQuestion(c, { id: 'funds', ...STORY_QUESTIONS.funds, a: s.funds });
  // Documents carry what the story says: nights booked, and the anomaly where there is one.
  const hotelDoc = (c.docs || []).find((d) => d.k === 'HOTEL');
  if (hotelDoc && c.anomaly !== 'staySpan') setField(hotelDoc, '숙박기간', `${nightsOf(c)}박`);
  const spec = REVIEW_ANOMALIES[c.anomaly];
  if (spec) { const doc = (c.docs || []).find((d) => d.k === spec.doc); for (const [k, v] of spec.fields(c)) setField(doc, k, v); }
  if (variant === 'generated-refuse-purposeMismatch') {
    const detail = c.questions.find((q) => q.id === 'detail'); if (detail) detail.a = s.paid.a;
    c.lookups.contact = ['불일치', s.paid.lookup];
    setField((c.docs || []).find((d) => d.k === 'ENTRY BASIS'), '국내 연락처', '개인 지인 · 숙박업소·초청기관 아님');
  }
  return c;
}
