// Dialogue guard (pure): checks that a line a passenger says carries no case fact the examiner has not been given.
// Used on authored persona lines (unit tests), on every model output from /api/npc (server and client), and by the
// dialogue eval harness. A line passes only if each of its content tokens (numbers, Latin words, Hangul words with
// particles trimmed) already appears in the public record: the initial statement, the submitted documents, the
// passenger card fields and the answers the examiner has already obtained.

const DISCOURSE = new Set(['네', '아', '음', '그게', '그건', '그건요', '저기', '솔직히', '말씀드리면', '말씀드리자면', '사실은', '글쎄요', '잠시만요', '죄송합니다', '다시', '한', '번', '말씀해', '주시겠습니까', '주시겠어요', '무엇을', '물으시는지', '잘', '모르겠습니다', '여쭤봐', '천천히', '무슨', '뜻인지', '여기', '있습니다', '안녕하세요', '감사합니다', '알겠습니다', '그', '번호는요', '아까', '말씀드린', '대로입니다', '대로', '이번', '입국과', '관련된', '질문인가요', '질문', '질문이신가요', '앞서', '것과', '같은', '예', '좀', '이', '저', '제가', '저는']);
const PARTICLES = /(은|는|이|가|을|를|에|에서|에게|으로|로|과|와|도|만|의|요|입니다|습니다|합니다|입니까|예요|이에요|였습니다|했습니다|하고|이고|이며|이다|다)$/;

export function contentTokens(text) {
  const out = new Set(); const t = String(text || '').normalize('NFKC').toLowerCase();
  for (const m of t.matchAll(/\d[\d,.-]*/g)) out.add(m[0].replace(/[,.-]+$/, ''));
  for (const m of t.matchAll(/[a-z][a-z'-]{2,}/g)) out.add(m[0]);
  for (const m of t.matchAll(/[가-힣]+/g)) {
    let w = m[0]; if (DISCOURSE.has(w)) continue;
    for (let i = 0; i < 2 && w.length > 1 && PARTICLES.test(w); i++) w = w.replace(PARTICLES, '');
    if (w.length >= 2 && !DISCOURSE.has(w)) out.add(w);
  }
  return out;
}

export function publicRecord(c, revealedIds = []) {
  const parts = [c.initial, c.name, c.displayNameKo, c.nat, c.purpose, c.stay, c.arrival, c.return, c.basis, c.basisDetail, c.visa];
  for (const d of c.docs || []) { parts.push(d.t); for (const [k, v] of d.fields || []) parts.push(k, v); }
  for (const q of c.questions || []) if (revealedIds.includes(q.id)) parts.push(q.q, q.a);
  return parts.filter(Boolean).join(' \n ').normalize('NFKC').toLowerCase();
}

// ok=false lists the tokens that are not on record (a would-be new fact).
export function checkLine(line, c, revealedIds = []) {
  const rec = publicRecord(c, revealedIds); const stray = [...contentTokens(line)].filter((tok) => !rec.includes(tok));
  return { ok: stray.length === 0, stray };
}

// Terms that only an answer not yet obtained would contain — the leakage probe for model output.
export function hiddenTerms(c, revealedIds = []) {
  const rec = publicRecord(c, revealedIds); const out = new Set();
  for (const q of c.questions || []) if (!revealedIds.includes(q.id)) for (const tok of contentTokens(q.a)) if (!rec.includes(tok)) out.add(tok);
  return out;
}

// A lead-in ("아…", "솔직히 말씀드리면,") must carry no content at all and stay short.
export function checkLead(lead) {
  const s = String(lead || '').trim(); if (!s) return { ok: true, stray: [] };
  if (s.length > 24) return { ok: false, stray: ['too-long'] };
  const stray = [...contentTokens(s)]; return { ok: stray.length === 0, stray };
}
