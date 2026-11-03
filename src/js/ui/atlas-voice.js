// Overseas push-to-talk (v11). Same rules as the Korean v10 voice question (ui/live-interview.js):
// the microphone is off until the player chooses, on-device recognition is preferred, the browser's own
// service is an explicit opt-in, INAD never records, stores or sends audio, and the recognised text only
// fills the question box: the player reviews or corrects it and presses Ask. The choice is the shared
// `inad-voice` preference, so it is the same in every country.
import { preferences } from '../state.js';
import { saveInterviewPreferences } from '../engines/save-engine.js';
import { sttSupport, createRecognizer, onDeviceStatus, installOnDevice } from '../services/speech.js';
import { atlasText as text } from '../services/i18n.js';
import { byId } from './dom.js';
import { showModal, closeModal } from './modals.js';
import { announceA11y } from './toast.js';

const l = (ko, en) => text({ ko, en });
const LANGS = { ko: 'ko-KR', en: { CA: 'en-CA', GB: 'en-GB', NZ: 'en-NZ' } };
let recognizer = null, starting = false, hooks = { onText() {}, onDone() {}, onStatus() {} };

export function voiceAvailable() { return sttSupport('browser').available; }
export function voiceListening() { return !!recognizer?.active; }
export function recognitionLang(countryId, interviewLanguage) { return interviewLanguage === 'ko' ? LANGS.ko : LANGS.en[countryId] || 'en-GB'; }
// Ends any session (case change, replay, country switch). Nothing heard is kept.
export function stopVoice() { recognizer?.abort(); recognizer = null; starting = false; }

// hooks: onText(transcript) while listening, onDone(transcript) at the end, onStatus(message).
export function toggleVoice(lang, h) {
  hooks = h;
  if (recognizer?.active) { recognizer.stop(); return; }
  if (preferences.voice === 'off') { showConsent(lang); return; }
  start(lang);
}

async function start(lang) {
  if (starting || recognizer?.active) return; starting = true;
  try {
    const support = sttSupport(preferences.voice);
    if (!support.available) {
      if (support.reason === 'no-on-device') return showConsent(lang, true);
      return hooks.onStatus(support.reason === 'insecure' ? l('음성 질문은 보안 연결(https)에서만 사용할 수 있습니다.', 'Voice questions need a secure (https) connection.') : l('이 브라우저는 음성 인식을 지원하지 않습니다. 직접 입력이나 질문 목록을 사용하세요.', 'This browser does not support speech recognition. Type or choose a question.'));
    }
    if (preferences.voice === 'local') {
      const st = await onDeviceStatus(lang);
      if (st === 'downloadable') { hooks.onStatus(l('기기 내 음성 인식 언어 데이터를 내려받는 중입니다…', 'Downloading on-device speech data…')); if (!(await installOnDevice(lang))) return showConsent(lang, true); }
      else if (st === 'unavailable') return showConsent(lang, true);
    }
    let heard = '';
    recognizer = createRecognizer({
      lang, mode: preferences.voice,
      onInterim: (t) => { heard = t; hooks.onText(t); },
      onFinal: (t) => { heard = t; hooks.onText(t); },
      onError: (code) => hooks.onStatus(code === 'not-allowed' || code === 'service-not-allowed' ? l('마이크 권한이 없어 음성 질문을 사용할 수 없습니다. 직접 입력은 계속 사용할 수 있습니다.', 'Microphone access is blocked. You can still type your question.') : code === 'no-speech' ? l('음성이 들리지 않았습니다. 다시 말하거나 직접 입력하세요.', 'No speech was heard. Try again or type.') : l('음성 인식이 중단되었습니다. 직접 입력은 계속 사용할 수 있습니다.', 'Speech recognition stopped. You can still type.')),
      onEnd: () => { recognizer = null; hooks.onDone(heard.trim()); }
    });
    if (!recognizer && preferences.voice === 'local') return showConsent(lang, true);
    if (!recognizer || !recognizer.start()) { recognizer = null; return hooks.onStatus(l('음성 인식을 시작하지 못했습니다. 직접 입력을 사용하세요.', 'Could not start speech recognition. Please type.')); }
    hooks.onDone(null); // re-render with the listening state
    announceA11y(l('말씀하세요. 다시 누르면 멈춥니다.', 'Speak now. Press again to stop.'));
  } finally { starting = false; }
}

function showConsent(lang, noLocalHint = false) {
  const noLocal = noLocalHint || !sttSupport('local').available;
  showModal(l('음성 질문 사용', 'Use voice questions'), `<div class="voice-consent" data-i18n-control><p>${noLocal ? l('이 브라우저에서는 기기 안에서만 처리하는 음성 인식을 사용할 수 없습니다.', 'This browser cannot recognise speech on the device only.') : l('말한 질문을 음성 인식으로 글자로 바꿉니다. 인식된 문장은 질문란에 먼저 표시되고, 확인·수정한 뒤 직접 보내야 합니다.', 'Your spoken question is turned into text. It appears in the question box first; review or correct it and send it yourself.')}</p>
  <ul class="voice-consent-list"><li><b>${l('기기 내 처리만', 'On this device only')}</b> — ${l('음성이 이 기기를 떠나지 않습니다(지원 브라우저에서만).', 'Audio never leaves this device (supported browsers only).')}</li><li><b>${l('브라우저 음성 인식 허용', 'Allow browser speech recognition')}</b> — ${l('브라우저 제공업체(예: Google, Apple)의 서버에서 음성이 처리될 수 있습니다.', 'Audio may be processed on the browser vendor\'s servers (for example Google or Apple).')}</li></ul>
  <p class="modal-note">${l('INAD는 음성을 녹음·저장·전송하지 않습니다. 음성 사용 여부는 점수와 판정에 영향을 주지 않으며, 직접 입력과 질문 목록은 언제나 사용할 수 있습니다.', 'INAD never records, stores or sends audio. Using voice does not affect scores or outcomes; typing and the question list always work.')}</p>
  <div class="voice-actions"><button type="button" class="act primary" id="atlasVoiceLocal"${noLocal ? ' disabled' : ''}>${l('기기 내 처리만 사용', 'Use on this device only')}</button><button type="button" class="act" id="atlasVoiceBrowser">${l('브라우저 음성 인식 허용', 'Allow browser recognition')}</button><button type="button" class="act" id="atlasVoiceOff" data-autofocus>${l('사용 안 함', 'Don\'t use voice')}</button></div></div>`);
  const choose = (v) => { preferences.voice = v; saveInterviewPreferences(); closeModal(); if (v !== 'off') start(lang); };
  byId('atlasVoiceLocal').onclick = () => choose('local');
  byId('atlasVoiceBrowser').onclick = () => choose('browser');
  byId('atlasVoiceOff').onclick = () => choose('off');
}
