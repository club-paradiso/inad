// Source-faithful display and interaction labels for the document workbench.
// These functions describe submitted case-file records, NOT independent verification
// and NOT statutory grounds for a decision. They must never infer a document's
// validity from a portrait, a person's profile or their nationality.
export const INTERNAL_RECORD_TYPES = new Set(['BIOMETRIC', 'WATCHLIST']);
export const SUMMARY_RECORD_TYPES = new Set(['ENTRY BASIS']);

export function documentFields(doc) {
  return Object.fromEntries((doc?.fields || []).filter((r) => Array.isArray(r) && r.length >= 2)
    .map(([key, value]) => [String(key), String(value ?? '')]));
}

export function documentRecordKind(doc) {
  if (INTERNAL_RECORD_TYPES.has(doc?.k)) return 'internal';
  if (SUMMARY_RECORD_TYPES.has(doc?.k)) return 'summary';
  return 'submitted';
}

export function documentIsRequestable(doc) {
  return documentRecordKind(doc) === 'submitted';
}

export function documentNameOnRecord(doc) {
  // Never silently replace a missing or inconsistent document field with the
  // traveler's canonical profile. That would erase the very clue under review.
  const fields = documentFields(doc);
  return fields['성명'] || fields['Name'] || fields['NAME'] || '';
}

export function documentDisplayStatus(doc) {
  const fields = documentFields(doc);
  const explicit = fields['신고상태'] || fields['등록상태'] || fields['상태'] || fields['예약상태'] || '';
  const kind = documentRecordKind(doc);
  if (kind === 'internal') return explicit ? `내부 기록상 ${explicit} · 별도 확인 필요` : '기관 내부 기록 · 검토 필요';
  if (kind === 'summary') return '게임 내 입국근거 요약 · 공식 허가증 아님';
  if (explicit) return `제출 자료상 ${explicit} · 진위 확인 전`;
  return '제출 자료 · 상태 미기재 · 진위 확인 전';
}

export function biometricDisplay(doc) {
  const fields = documentFields(doc);
  const face = fields['얼굴일치율'] || '';
  const chip = fields['칩등록 얼굴'] || '';
  const finger = fields['지문'] || '';
  const status = fields['상태'] || '';
  const text = [chip, finger, status].join(' ');
  const refused = /REFUSED|거부|미제공/i.test(text);
  const mismatch = /MISMATCH|불일치|불합치|ERROR/i.test(text);
  const label = refused ? '생체정보 제공 거부 기록' :
    mismatch ? '서류에 불일치 기록' :
    face ? '서류의 대조 수치' : '대조 수치 미기재';
  return { label, face, refused, mismatch, note: '서류에 표시된 내용만 재현 · 자동 본인확인 판정 아님' };
}

export function documentRequestCopy(doc) {
  if (!doc || !documentIsRequestable(doc)) return null;
  const type = doc.k;
  const name = String(doc.t || '해당 자료');
  const question = type === 'PASSPORT'
    ? '여권 원본을 다시 제시해 주시겠습니까?'
    : type === 'E-ARRIVAL' ? '전자입국신고 제출 내역을 보여주시겠습니까?'
    : type === 'PNR' || type === 'BOARDING' ? '항공편 탑승·예약 자료를 보여주시겠습니까?'
    : type === 'HOTEL' ? '숙박 예약확인 자료를 제시해 주시겠습니까?'
    : type === 'STAY' ? '국내 체류지 자료를 제시해 주시겠습니까?'
    : type === 'VISA' ? '사증 자료를 제시해 주시겠습니까?'
    : type === 'RESIDENCE CARD' ? '외국인등록증을 제시해 주시겠습니까?'
    : type === 'ABTC' ? 'ABTC를 제시해 주시겠습니까?'
    : `${name} 자료를 제시해 주시겠습니까?`;
  return {
    question,
    response: `요청하신 ${name} 자료를 제시하겠습니다. 기재 내용과 진위 여부를 확인해 주세요.`,
    name
  };
}
