// Live interview controller (v10): the question box, push-to-talk, clarification choices, interview settings,
// and the choreography between the engine result and the passenger stage. Engine calls only — the dispatcher
// (engines/interview-engine.js) is the single path to the case.
import { $, byId, esc } from './dom.js';
import { state, preferences, assistLevel } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { submitUtterance } from '../engines/interview-engine.js';
import { questionUnlocked } from '../engines/clue-engine.js';
import { saveInterviewPreferences } from '../engines/save-engine.js';
import { holdReplies, releaseReplies } from './interview-panel.js';
import { setStageState, reactionDelay, actLine, stopActing } from './passenger-stage.js';
import { showModal, closeModal } from './modals.js';
import { toast, announceA11y } from './toast.js';
import { sttSupport, createRecognizer, onDeviceStatus, installOnDevice, speakLine, stopSpeaking, ttsSupport } from '../services/speech.js';
import { storeGet } from '../services/storage.js';

let pendingTimer = 0, recognizer = null, onRender = () => {};
const reduced = () => document.body.classList.contains('pref-reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const ASSIST_TEXT = { guided: '안내', standard: '기본', professional: '전문', immersive: '몰입' };

function setStatus(html) { const el = byId('askStatus'); if (el) el.innerHTML = html; }
function flush() { if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = 0; releaseReplies(); } }

// One turn: engine first (state is final at once), then the passenger thinks, answers and is captioned.
export function submitTurn({ text = '', questionId = null, source = 'text' } = {}) {
  const c = current(); if (!c || state.ended) return null;
  flush(); stopSpeaking(); stopActing(); setStatus('');
  const from = state.logs.length;
  holdReplies(from, reduced() ? 0 : 1500);
  if (!reduced()) setStageState('thinking');
  const r = submitUtterance({ text, questionId, source });
  if (!r || r.kind === 'empty' || r.kind === 'ended' || r.kind === 'none') { releaseReplies(); setStageState('idle'); return r; }
  const delay = reduced() ? 0 : reactionDelay(r.mood || 'plain');
  holdReplies(from, delay); onRender();
  const finish = () => {
    pendingTimer = 0; releaseReplies();
    const line = state.logs.slice(from).filter((x) => x.type === 'alien').pop();
    if (line) {
      actLine(line.text, { mood: line.mood || r.mood, lead: line.lead || '' });
      if (preferences.tts && ttsSupport()) speakLine(`${line.lead ? line.lead + ' ' : ''}${line.text}`, { lang: 'ko-KR', rate: 0.98 });
    } else setStageState('idle');
    if (r.kind === 'ambiguous' || r.kind === 'unknown') offerCandidates(r.candidates || []);
    if (r.kind === 'language') setStatus('질문이 충분히 전달되지 않았습니다. 질문 언어를 바꾸거나 통역을 연결하십시오.');
  };
  if (delay) pendingTimer = setTimeout(finish, delay); else finish();
  return r;
}

// "혹시 이 질문입니까?" — only questions that are already open are offered (a locked question's text stays hidden).
function offerCandidates(ids) {
  const c = current(); if (!c || assistLevel() === 'immersive') return;
  const qs = ids.map((id) => c.questions.find((q) => q.id === id)).filter((q) => q && questionUnlocked(q) && !state.asked.has(q.id)).slice(0, 2);
  if (!qs.length) { setStatus('다른 말로 다시 질문하거나 아래 질문 목록을 사용하십시오.'); return; }
  setStatus(`<span>혹시 이 질문입니까?</span>${qs.map((q) => `<button type="button" data-cand="${esc(q.id)}">${esc(q.q)}</button>`).join('')}`);
  byId('askStatus').querySelectorAll('[data-cand]').forEach((b) => { b.onclick = () => { submitTurn({ questionId: b.dataset.cand, source: 'clarify' }); byId('askInput')?.focus(); }; });
}

// ---- voice ---------------------------------------------------------------------------------------------
function sttLang() { const l = state.language; if (l && l.mode === 'en' && !l.interpreterActive) return 'en-US'; return storeGet('inad-locale', 'ko') === 'en' ? 'en-US' : 'ko-KR'; }
function setMic(on) { const b = byId('micBtn'); if (!b) return; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '듣는 중' : '말하기'; }
function stopListening() { recognizer?.stop(); }
async function startListening() {
  const support = sttSupport(preferences.voice);
  if (!support.available) {
    if (support.reason === 'no-on-device') { showVoiceConsent('no-on-device'); return; }
    toast(support.reason === 'insecure' ? '음성 질문은 보안 연결(https)에서만 사용할 수 있습니다.' : '이 브라우저는 음성 인식을 지원하지 않습니다. 직접 입력이나 질문 목록을 사용하십시오.');
    return;
  }
  const lang = sttLang();
  if (preferences.voice === 'local') {
    const st = await onDeviceStatus(lang);
    if (st === 'downloadable') { setStatus('기기 내 음성 인식 언어 데이터를 내려받는 중입니다…'); const ok = await installOnDevice(lang); if (!ok) { setStatus(''); showVoiceConsent('no-on-device'); return; } setStatus(''); }
    else if (st === 'unavailable') { showVoiceConsent('no-on-device'); return; }
  }
  const input = byId('askInput');
  recognizer = createRecognizer({
    lang, mode: preferences.voice,
    onInterim: (t) => { input.value = t; },
    onFinal: (t) => { input.value = t; },
    onError: (code) => { setMic(false); setStatus(code === 'not-allowed' || code === 'service-not-allowed' ? '마이크 권한이 없어 음성 질문을 사용할 수 없습니다. 직접 입력은 계속 사용할 수 있습니다.' : code === 'no-speech' ? '음성이 들리지 않았습니다. 다시 말하거나 직접 입력하십시오.' : '음성 인식이 중단되었습니다. 직접 입력은 계속 사용할 수 있습니다.'); setStageState('idle'); },
    onEnd: () => { setMic(false); recognizer = null; if (input.value.trim()) { setStatus('인식된 문장을 확인·수정한 뒤 [질문]을 누르십시오.'); input.focus(); input.dataset.source = 'voice'; } setStageState('idle'); }
  });
  if (!recognizer || !recognizer.start()) { setMic(false); toast('음성 인식을 시작하지 못했습니다. 직접 입력을 사용하십시오.'); return; }
  setMic(true); setStageState('listening'); announceA11y('음성 질문 듣는 중'); setStatus('말씀하십시오. 다시 누르면 멈춥니다.');
}
function showVoiceConsent(reason = '') {
  const noLocal = reason === 'no-on-device';
  showModal('음성 질문 사용', `<div class="voice-consent"><p>${noLocal ? '이 브라우저에서는 기기 안에서만 처리하는 음성 인식을 사용할 수 없습니다.' : '말한 질문을 브라우저 음성 인식으로 글자로 바꿉니다. 인식된 문장은 질문란에 먼저 표시되고, 확인·수정한 뒤 직접 보내야 합니다.'}</p>
  <ul class="voice-consent-list"><li><b>기기 내 처리만</b> — 음성이 이 기기를 떠나지 않습니다(지원 브라우저에서만).</li><li><b>브라우저 음성 인식 허용</b> — 브라우저 제공업체(예: Google, Apple)의 서버에서 음성이 처리될 수 있습니다.</li></ul>
  <p class="modal-note">INAD는 음성을 녹음·저장·전송하지 않습니다. 음성 사용 여부는 점수와 판정에 영향을 주지 않으며, 직접 입력과 질문 목록은 언제나 사용할 수 있습니다.</p>
  <div class="voice-actions"><button type="button" class="act primary" id="voiceLocal"${noLocal ? ' disabled' : ''}>기기 내 처리만 사용</button><button type="button" class="act" id="voiceBrowser">브라우저 음성 인식 허용</button><button type="button" class="act" id="voiceOff">사용 안 함</button></div></div>`);
  byId('voiceLocal').onclick = () => { preferences.voice = 'local'; saveInterviewPreferences(); closeModal(); startListening(); };
  byId('voiceBrowser').onclick = () => { preferences.voice = 'browser'; saveInterviewPreferences(); closeModal(); startListening(); };
  byId('voiceOff').onclick = () => { preferences.voice = 'off'; saveInterviewPreferences(); closeModal(); };
}

// ---- interview settings ---------------------------------------------------------------------------------
export function showInterviewSettings() {
  const lvl = preferences.assist || '';
  const opt = (v, label, desc) => `<button type="button" class="assist-opt ${lvl === v ? 'on' : ''}" data-assist="${v}" aria-pressed="${lvl === v}"><b>${label}</b><span>${desc}</span></button>`;
  showModal('인터뷰 설정', `<div class="settings-grid"><section class="settings-section"><h3>질문 도움</h3><p>제안 질문의 양만 바뀝니다. 규칙·점수·정답은 같습니다.</p><div class="assist-grid">
    ${opt('', '안내 모드 따름', `지금: ${ASSIST_TEXT[assistLevel()]}`)}${opt('guided', '안내', '이어서 확인할 질문까지 4개')}${opt('standard', '기본', '열린 질문 3개')}${opt('professional', '전문', '2개만')}${opt('immersive', '몰입', '제안 없음 · 직접 질문')}</div></section>
    <section class="settings-section"><h3>음성</h3><p>음성 사용은 선택입니다. 점수와 판정에 영향을 주지 않습니다.</p>
    <div class="setting-row"><div class="setting-copy"><b>음성 질문</b><span>${preferences.voice === 'off' ? '사용 안 함' : preferences.voice === 'local' ? '기기 내 처리만' : '브라우저 음성 인식 허용'}</span></div><button type="button" class="act" id="voiceSettings">변경</button></div>
    <div class="setting-row"><div class="setting-copy"><b id="pref-tts-label">음성으로 답변 듣기</b><span id="pref-tts-desc">${ttsSupport() ? '승객의 답변을 기기 음성으로 읽어 줍니다. 자막과 기록은 항상 표시됩니다.' : '이 브라우저는 음성 합성을 지원하지 않습니다.'}</span></div><button class="setting-toggle" type="button" role="switch" id="ttsToggle" aria-checked="${preferences.tts}" aria-labelledby="pref-tts-label" aria-describedby="pref-tts-desc"${ttsSupport() ? '' : ' disabled'}><span aria-hidden="true">${preferences.tts ? '사용 중' : '사용 안 함'}</span></button></div></section></div>`);
  document.querySelectorAll('[data-assist]').forEach((b) => { b.onclick = () => { preferences.assist = b.dataset.assist; saveInterviewPreferences(); syncAssistButton(); onRender(); showInterviewSettings(); }; });
  byId('voiceSettings').onclick = () => showVoiceConsent();
  byId('ttsToggle').onclick = () => { preferences.tts = !preferences.tts; saveInterviewPreferences(); if (!preferences.tts) stopSpeaking(); showInterviewSettings(); };
}
export function syncAssistButton() { const b = byId('assistBtn'); if (b) b.textContent = `질문 도움 · ${ASSIST_TEXT[assistLevel()]}`; }

export function bindLiveInterview({ render } = {}) {
  onRender = render || onRender;
  const form = byId('askForm'), input = byId('askInput');
  form.addEventListener('submit', (e) => {
    e.preventDefault(); const text = input.value.trim(); if (!text) { input.focus(); return; }
    const source = input.dataset.source === 'voice' ? 'voice' : 'text'; delete input.dataset.source; input.value = '';
    submitTurn({ text, source }); input.focus();
  });
  input.addEventListener('input', () => { if (!recognizer) delete input.dataset.source; setStageState(input.value ? 'listening' : 'idle'); });
  input.addEventListener('blur', () => { if (!input.value) setStageState('idle'); });
  const mic = byId('micBtn');
  if (!sttSupport('browser').available) mic.hidden = true;
  mic.onclick = () => { if (recognizer?.active) { stopListening(); return; } if (preferences.voice === 'off') showVoiceConsent(); else startListening(); };
  byId('assistBtn').onclick = showInterviewSettings; syncAssistButton();
}
export function resetLiveInterview() { flush(); stopSpeaking(); recognizer?.abort(); recognizer = null; setMic(false); setStatus(''); const i = byId('askInput'); if (i) { i.value = ''; delete i.dataset.source; } }
