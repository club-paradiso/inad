// Runtime issue collection and the built-in integrity check (v6.1 system centre semantics).
import { RELEASE } from '../../data/legal-baseline.js';
import { CASES } from '../../data/cases.js';
import { session } from '../state.js';
import { travelerMap } from '../engines/traveler-engine.js';
import { coreCaseMap } from '../engines/queue-engine.js';
import { storageWritable, storeGetRaw, parseJSON } from './storage.js';
import { META_KEY, PROGRESS_KEY } from '../engines/save-engine.js';

export const runtimeIssues = [];
export function installErrorCollectors() {
  window.addEventListener('error', (e) => runtimeIssues.push({ type: 'error', message: String(e.message || 'runtime error'), at: new Date().toISOString() }));
  window.addEventListener('unhandledrejection', (e) => runtimeIssues.push({ type: 'promise', message: String(e.reason?.message || e.reason || 'unhandled rejection'), at: new Date().toISOString() }));
}
const check = (name, status, detail) => ({ name, status, detail });

export function runDiagnostics() {
  const checks = []; const pool = [...travelerMap.values()];
  const uniqueIds = new Set(pool.map((t) => t.id)).size === pool.length;
  checks.push(check('여행객 데이터', pool.length >= 105 && uniqueIds ? 'pass' : 'fail', `${pool.length}명 · ID ${uniqueIds ? '정상' : '중복'}`));
  checks.push(check('핵심 사건', CASES.length === 12 ? 'pass' : 'fail', `${CASES.length}건`));
  let qok = false; try { qok = session.queue.length === 36 && session.queue.every((x) => travelerMap.has(x.travelerId) && (x.caseId ? coreCaseMap.has(x.caseId) : session.normalCaseMap.has(x.normalId))); } catch (e) { /* keep false */ }
  checks.push(check('현재 근무 큐', qok ? 'pass' : 'fail', `${session.queue.length}명 · 참조 ${qok ? '정상' : '오류'}`));
  const portrait = pool.every((t) => /^data:image\/(webp|png|jpeg);base64,/.test(t.portrait || '') || /assets\/portraits\/TRV-\d{4}\.webp$/.test(t.portrait || ''));
  const inline = pool.every((t) => /^data:image\//.test(t.portrait || ''));
  checks.push(check('초상화 에셋', portrait ? (inline ? 'pass' : 'warn') : 'fail', portrait ? (inline ? '내장 Data URI 정상' : '개발 모드 · 파일 에셋') : '누락 또는 외부 에셋'));
  const domIds = [...document.querySelectorAll('[id]')].map((x) => x.id), dups = domIds.filter((v, i, a) => a.indexOf(v) !== i); checks.push(check('DOM ID', dups.length ? 'fail' : 'pass', dups.length ? `${[...new Set(dups)].length}개 중복` : '중복 0'));
  const ext = [...document.querySelectorAll('[src],[href]')].filter((el) => /^https?:\/\//i.test(el.getAttribute('src') || el.getAttribute('href') || '')); checks.push(check('외부 네트워크 에셋', ext.length ? 'warn' : 'pass', ext.length ? `${ext.length}개 발견` : '0개'));
  checks.push(check('브라우저 저장소', storageWritable() ? 'pass' : 'warn', storageWritable() ? '읽기/쓰기 가능' : '사용 불가 · 세션은 플레이 가능'));
  const mr = storeGetRaw(META_KEY), pr = storeGetRaw(PROGRESS_KEY); checks.push(check('근무기록 저장영역', mr === null || parseJSON(mr) ? 'pass' : 'fail', mr === null ? '기록 없음' : 'JSON 정상')); checks.push(check('체크포인트 저장영역', pr === null || parseJSON(pr) ? 'pass' : 'fail', pr === null ? '체크포인트 없음' : 'JSON 정상'));
  let refs = true, bad = 0; try { for (const c of [...CASES, ...session.normalCases]) for (const a of (c.required || [])) { if (a.startsWith('QUESTION_') && !(c.questions || []).some((q) => q.id === a.slice(9))) { refs = false; bad++; } if (a.startsWith('LOOKUP_')) { const key = a.slice(7); if (!(c.lookups && Object.prototype.hasOwnProperty.call(c.lookups, key)) && !(key === 'forensic' && c.forensicEvidence)) { refs = false; bad++; } } } } catch (e) { refs = false; bad++; }
  checks.push(check('필수절차 데이터 참조', refs ? 'pass' : 'fail', refs ? '누락 0' : `${bad}개 불일치`));
  const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2; checks.push(check('현재 뷰포트', overflow ? 'warn' : 'pass', overflow ? '가로 오버플로 감지' : '가로 오버플로 0'));
  checks.push(check('런타임 오류 수집', runtimeIssues.length ? 'warn' : 'pass', `${runtimeIssues.length}건`));
  checks.push(check('법령 기준 버전', 'pass', `기준일 ${RELEASE.legalBaseline}`));
  checks.push(check('저장 스키마', 'pass', `INAD_SAVE_BUNDLE v${RELEASE.saveSchema}`));
  return checks;
}
export function diagnosticText() { const c = runDiagnostics(); const pass = c.filter((x) => x.status === 'pass').length, warn = c.filter((x) => x.status === 'warn').length, fail = c.filter((x) => x.status === 'fail').length; return [`INAD: 제12조 v${RELEASE.version} 진단 보고서`, `생성: ${new Date().toISOString()}`, `법령 기준일: ${RELEASE.legalBaseline}`, `결과: PASS ${pass} / WARN ${warn} / FAIL ${fail}`, '', ...c.map((x) => `[${x.status.toUpperCase()}] ${x.name} - ${x.detail}`), '', ...(runtimeIssues.length ? runtimeIssues.map((x) => `[RUNTIME] ${x.at} ${x.type}: ${x.message}`) : ['[RUNTIME] 기록된 오류 없음'])].join('\n'); }
export function downloadBlob(name, text, type = 'application/json') { const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 600); }
