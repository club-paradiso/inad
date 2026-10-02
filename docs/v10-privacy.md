# INAD v10 — Privacy

INAD is a fictional simulation. v10 adds input methods that could touch personal data (voice, potentially camera) and
an optional server-side model. The rules below are implemented and tested where marked.

## 1. Microphone (implemented)
- Off by default (`inad-voice = off`). The microphone is used only while push-to-talk is active, after a consent sheet.
- Modes: **기기 내 처리만** — Chrome's on-device recognition (`processLocally = true`); audio does not leave the device.
  **브라우저 음성 인식 허용** — the browser's own service, which may send audio to the browser vendor (Google for Chrome,
  Apple for Safari). The sheet says so before anything starts.
- INAD never records, stores or uploads audio. Only the recognised *text* exists, in the question box, until the
  examiner sends or clears it.
- The choice is changeable any time in 인터뷰 설정; denying the browser permission leaves text and buttons.
- Voice use never changes score or outcome (unit + E2E).

## 2. Spoken replies (implemented)
Off by default (`inad-tts`). `speechSynthesis` with on-device voices preferred; no INAD network traffic.

## 3. Transcript (implemented)
The interview record lives in memory for the current case. Shift checkpoints (v9 schema, unchanged) never contain the
record; single-case live interviews write nothing at all. Debrief statistics count input surfaces, not content.

## 4. Camera (not implemented — rules for any future work)
Default off; explicit opt-in per session; frames processed locally in the browser and discarded; no upload, no
storage, no biometric identification or face recognition, no emotion, deception, trust or criminality inference.
Permitted signals: face present/absent, coarse head orientation, nod/shake, looking toward the screen — used only for
NPC pacing (wait, resume), never for score or outcome. Shape Detection `FaceDetector` is effectively unavailable; a
self-hosted MediaPipe FaceLandmarker (~10 MB WASM + model, same-origin) would be the candidate.

## 5. Analytics (implemented as in-memory counters)
Events: `interview_turn {source, kind, route}`, `live_start`, `live_retry`, `case_complete {mode, label}`. No text,
audio, camera data, identifiers or timestamps per event; counted in memory for the page (`INADSystem.analytics()`),
never stored or sent. A future sink must be opt-in, aggregate-only, and documented here first.

## 6. Optional model (`/api/npc`)
When configured, the utterance text (≤ 240 characters) and the case's question texts go to the configured inference
provider for classification. No account, device or session identifier is sent; responses are `no-store`. The client
IP is held in memory per function instance for rate limiting only. Operators must choose a provider whose data-use
terms match this; self-hosting keeps the text inside the operator's infrastructure.

## 7. Stored keys added in v10
`inad-assist`, `inad-voice`, `inad-tts` — preferences only, carried in the portable save bundle like other preferences.
`inad-daily-v10` — Case-of-the-Day results (date, case id, decision, procedure %, key-clue counts, question count,
turn counts by input surface, procedural path); no text, kept 30 days, local only, not in the bundle.
