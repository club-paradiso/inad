// Presentation guidance only. Reads actions the player performed, never a case's hidden solution,
// clue count, risk labels, nationality or required actions. It cannot enable or block a verdict.
export const LOOKUP_TOOLS = Object.freeze([
  { id: 'history', ko: '방문 이력', en: 'Travel history', help: '과거 입출국과 체류 기록을 진술과 대조', helpEn: 'Compare past visits and stays with the interview' },
  { id: 'visa', ko: '입국 자격', en: 'Entry status', help: '사증·체류자격 기록과 방문 목적 확인', helpEn: 'Check visa and status records against travel purpose' },
  { id: 'pnr', ko: '항공 예약', en: 'Flight booking', help: '항공 PNR: 예약·발권·귀국 일정 확인', helpEn: 'PNR: booking, ticket issuance and return itinerary' },
  { id: 'contact', ko: '국내 연락처', en: 'Local contact', help: '신고한 연락처·초청 관계와 진술 대조', helpEn: 'Compare the declared contact and invitation with statements' },
  { id: 'party', ko: '동행 기록', en: 'Travel party', help: '연결된 동행 기록 확인 · 동행 자체는 위험 근거가 아님', helpEn: 'Read linked travel-party records; traveling together is not a risk indicator' },
  { id: 'public', ko: '공개 자료', en: 'Public records', help: '사건에 준비된 공개 자료와 진술 대조', helpEn: 'Compare authored public records with statements' }
]);

export function lookupPresentation(tone, en = false) {
  const labels = { 정상: ['조회 결과', 'Result'], 주의: ['확인 사항', 'Check details'], 경고: ['추가 확인', 'Follow up'], 치명: ['중요 확인', 'Important finding'] };
  return (labels[tone] || labels.정상)[en ? 1 : 0];
}

export function inspectionStep(st) {
  if (st.ended) return 'complete';
  if (st.stage !== 'PRIMARY') return 'procedure';
  if (!st.asked?.size) return 'question';
  // Reading and thinking are free. These are wayfinding suggestions, not a completion checklist.
  if (!st.looked?.size) return 'evidence';
  return 'assessment';
}

// Public row names map to navigation, not to an automatic query or a hidden case prerequisite.
export function inspectionDestination(row) {
  const links = {
    '신원': { task: 'evidence', control: 'wbTabEntry', ko: '신원 자료 보기', en: 'View identity' },
    '입국자격': { task: 'evidence', lookup: 'visa', ko: '입국 자격 확인으로', en: 'Find entry status' },
    '여행계획': { task: 'evidence', lookup: 'pnr', ko: '항공 예약 확인으로', en: 'Find travel records' },
    '국내관계': { task: 'evidence', lookup: 'contact', ko: '국내 연락처 확인으로', en: 'Find local contacts' },
    '동행일정': { task: 'evidence', lookup: 'party', ko: '동행 기록 확인으로', en: 'Find party records' },
    '입국목적': { task: 'interview', control: 'askInput', ko: '목적 질문으로', en: 'Ask about purpose' },
    '체재능력': { task: 'interview', control: 'askInput', ko: '체재비 질문으로', en: 'Ask about funds' }
  };
  return links[row] || null;
}
