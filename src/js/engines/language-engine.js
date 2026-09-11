// Communication / interpreter logic. Language ability is a UX variable only — it gates whether an
// answer counts as a verified statement, never whether a person is admissible.
import { ENGLISH_PRIMARY, LANGUAGE_META, LANG_LEVEL } from '../../data/language.js';
import { session, state } from '../state.js';
import { getTraveler } from './traveler-engine.js';
import { behaviorHash, behaviorAdjust } from './behavior-engine.js';
import { spendWork } from './operation-engine.js';
import { addLog } from './log.js';
import { bus, notify } from '../services/bus.js';

export function languageProfileFor(c) {
  const t = getTraveler(c.travelerId), code = t.nationality.code || c.code || 'XXX', meta = LANGUAGE_META[code] || ['기타 언어', 'Other'];
  const h = behaviorHash(t.id + '|LANG|' + (session.seed || 0));
  let ko = [0, 0, 1, 1, 1, 2, 2, 3][h % 8];
  if ((c.basis || '').includes('체류') || (c.basis || '').includes('재입국')) ko = Math.min(4, ko + 1);
  let en = ENGLISH_PRIMARY.has(code) ? 4 : [1, 1, 2, 2, 2, 3, 3, 4][(h >>> 4) % 8];
  if ((h >>> 8) % 7 === 0 && !ENGLISH_PRIMARY.has(code)) { ko = 0; en = 1; }
  if (c.special === 'refugee') { ko = Math.min(ko, 1); en = Math.min(en, 2); }
  if (c.special === 'forgery') { ko = Math.min(ko, 1); }
  const initial = ko >= 2 ? 'ko' : en >= 2 ? 'en' : 'none';
  return { primary: meta[0], primaryEn: meta[1], korean: ko, english: en, mode: initial, interpreterActive: false, interpreterUsed: false, failedAttempts: 0, assistedTurns: 0, lastEvent: '언어 확인' };
}
export function languageLabel(v) { return `${LANG_LEVEL[Math.max(0, Math.min(4, v))]} · L${v}`; }
export function languageModeLabel(l = state.language) { if (!l) return '-'; if (l.interpreterActive) return `${l.primary} 통역`; if (l.mode === 'ko') return '한국어 직접'; if (l.mode === 'en') return '영어 직접'; return '직접 의사소통 곤란'; }
export function questionLanguageThreshold(q) { return ['기본사항', '여행·체류'].includes(q.cat) ? 2 : ['재정', '국내관계', '직업', '과거입국'].includes(q.cat) ? 3 : 3; }
export function currentLanguageLevel(l = state.language) { if (!l) return 0; if (l.interpreterActive) return 4; return l.mode === 'ko' ? l.korean : l.mode === 'en' ? l.english : 0; }
export function communicationReady(q, l = state.language) { if (!l) return { ok: true }; if (l.interpreterActive) return { ok: true, via: 'interpreter' }; const need = questionLanguageThreshold(q), have = currentLanguageLevel(l); return { ok: have >= need, have, need, partial: have === need - 1 }; }
export function languageMisunderstanding(q, check) { const l = state.language, mode = l.mode === 'ko' ? '한국어' : l.mode === 'en' ? '영어' : '현재 언어'; if (check.partial) return `죄송합니다. ${mode} 질문을 정확히 이해했는지 확신이 없습니다. 다시 설명해 주실 수 있습니까?`; return `죄송합니다. 질문을 충분히 이해하지 못했습니다.`; }

// Returns true when the question can be recorded as a verified statement.
export function handleLanguageBarrier(q) {
  const check = communicationReady(q); if (check.ok) return true;
  spendWork(check.partial ? 8 : 10, 'language'); state.language.failedAttempts++; behaviorAdjust(check.partial ? 4 : 7, -1, '질문 이해 어려움');
  addLog('officer', q.q); addLog('alien', languageMisunderstanding(q, check)); addLog('system', `언어 이해가 충분하지 않아 이 응답은 사실확인 완료로 기록하지 않았습니다. 질문 언어를 바꾸거나 ${state.language.primary} 통역을 호출하십시오.`);
  notify.sound('beep', { f: 360, d: .06 }); bus.emit('changed');
  return false;
}
export function setInterviewLanguage(mode) { const l = state.language; if (!l) return; if (mode === 'ko' || mode === 'en') { l.interpreterActive = false; l.mode = mode; l.lastEvent = (mode === 'ko' ? '한국어' : '영어') + ' 직접 질문 선택'; spendWork(3, 'language'); addLog('system', `${mode === 'ko' ? '한국어' : '영어'} 직접 질문 모드로 전환했습니다. 언어능력은 입국판정 근거가 아닙니다.`); bus.emit('changed'); } }
export function requestInterpreter() {
  const l = state.language; if (!l || l.interpreterActive) return false;
  spendWork(30, 'interpreter'); l.interpreterActive = true; l.interpreterUsed = true; l.mode = 'interpreter'; l.assistedTurns = 0; l.lastEvent = l.primary + ' 통역 연결'; state.stats.interpreter++; behaviorAdjust(-6, 4, '통역 지원 연결');
  addLog('interpreter', `${l.primary} 통역 지원이 연결되었습니다. 이후 질문과 답변은 게임 화면에서 한국어로 번역하여 표시합니다.`);
  notify.sound('interpreter'); notify.announce('통역 지원', `${l.primary} 통역 지원이 연결되었습니다.`, 'INTERPRETER', 2100); bus.emit('changed');
  return true;
}
