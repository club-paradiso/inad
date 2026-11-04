// Presentation-only inspection workflow guidance. Never reads case resolution, hidden evidence or required verdict actions.
// The player still performs questions/lookups and reviews submitted materials.
const LOOKUPS = {
  history: ['출입국기록', 'Entry history'],
  visa: ['사증·입국자격', 'Visa / status'],
  pnr: ['항공 PNR', 'Flight PNR'],
  contact: ['국내관계', 'Local contact'],
  party: ['동행인', 'Travel party'],
  public: ['공개정보', 'Public information'],
  forensic: ['문서감식', 'Document examination']
};

export function unmetQuestionPrerequisites(q, c, performed = []) {
  const done = new Set(performed);
  return (q?.requires || []).filter((action) => !done.has(action)).map((action) => {
    if (action.startsWith('QUESTION_')) {
      const dep = c?.questions?.find((item) => item.id === action.slice(9));
      // Do not expose a question behind a separate prerequisite. Only an unlocked question may be named.
      const visible = !!dep && (dep.requires || []).every((item) => done.has(item));
      return {
        kind: 'question', key: action, target: visible ? dep.id : null,
        category: visible ? dep.cat : null,
        ko: visible ? `먼저 질문 · ${dep.q}` : '다른 선행 질문을 먼저 완료해야 합니다',
        en: visible ? `Ask first · ${dep.q}` : 'Complete another prerequisite question first'
      };
    }
    if (action.startsWith('LOOKUP_')) {
      const kind = action.slice(7), label = LOOKUPS[kind];
      return { kind: 'lookup', key: action, target: kind, ko: label ? `전산 조회 · ${label[0]}` : '선행 전산 조회', en: label ? `Look up · ${label[1]}` : 'Required lookup' };
    }
    return { kind: 'other', key: action, target: null, ko: '선행 절차 확인 필요', en: 'Prerequisite action required' };
  });
}

// Based only on a public document type, NOT on its hidden case outcome or authenticity.
const PLANS = {
  PASSPORT: ['primary-entry', [
    ['성명·여권번호가 대상자 및 다른 제출자료와 일치하는지 대조', 'Cross-check name and passport number against the traveler and other documents'],
    ['유효기간·신원확인 사항을 확인', 'Check validity and identity details'],
    ['불일치 시 독립된 정보로 추가 확인', 'Use an independent source to follow up on discrepancies']
  ]],
  VISA: ['primary-entry', [
    ['사증 요구 대상인지 먼저 확인', 'Check whether a visa is required'],
    ['사증 내용·기간과 입국목적을 교차 확인', 'Cross-check visa terms, dates and travel purpose'],
    ['추가 확인 사항은 별도 자료·질문으로 대조', 'Resolve open questions against separate evidence or interview']
  ]],
  'ENTRY BASIS': ['primary-entry', [
    ['입국 근거의 적용요건을 확인', 'Check the stated basis for entry'],
    ['필요한 허가·유효기간을 확인', 'Check applicable authorization and validity'],
    ['관련 신고·입국목적과 교차 확인', 'Cross-check declaration and entry purpose']
  ]],
  'E-ARRIVAL': ['arrival-card', [
    ['입국신고 대상 또는 제외대상인지 확인', 'Check arrival-declaration applicability or exemption'],
    ['여권·입국목적·체류지·연락처를 대조', 'Compare passport, purpose, address and contact details'],
    ['진술과 맞지 않는 사항은 추가 확인', 'Follow up any inconsistency with the interview']
  ]],
  PNR: ['purpose-status', [
    ['여행 일정과 입국·귀국편 정보를 대조', 'Compare itinerary with arrival and return flights'],
    ['예약자·기간이 진술과 맞는지 확인', 'Check booking holder and dates against the interview'],
    ['예약정보만으로 실제 입국목적을 단정하지 않음', 'Do not treat booking data alone as proof of travel purpose']
  ]],
  BOARDING: ['purpose-status', [
    ['탑승자·입국편을 확인', 'Check passenger and flight details'],
    ['일정·귀국계획을 진술과 대조', 'Compare itinerary and return plan with statements'],
    ['추가 입증이 필요한 사항은 별도로 확인', 'Verify any unresolved details separately']
  ]],
  HOTEL: ['purpose-status', [
    ['숙박자·주소·기간을 확인', 'Check booking holder, address and dates'],
    ['진술한 체류지·방문목적과 대조', 'Cross-check the stated address and purpose'],
    ['불일치 시 진술이나 다른 자료로 확인', 'Resolve differences using statements or other evidence']
  ]],
  STAY: ['purpose-status', [
    ['체류지·기간과 명의인을 확인', 'Check address, dates and named traveler'],
    ['입국신고·진술 내용과 교차 확인', 'Cross-check declaration and statements'],
    ['미확인 사항을 기록하고 추가 확인', 'Record unresolved items for follow-up']
  ]],
  BIOMETRIC: ['biometrics', [
    ['법령상 생체정보 대상·면제 여부 확인', 'Check applicability and exemptions'],
    ['여권 명의와 신원확인 결과를 교차 확인', 'Cross-check passport holder and identity result'],
    ['단일 수치만으로 결론 내리지 않음', 'Do not decide based on a single simulated measure']
  ]]
};

export function documentReviewPlan(doc) {
  const [guideId, steps] = PLANS[doc?.k] || ['primary-entry', [
    ['자료의 명의·날짜·출처를 확인', 'Check document holder, dates and stated source'],
    ['진술과 별도 전산정보를 교차 확인', 'Cross-check statements and independent records'],
    ['확인되지 않은 사항은 따로 기록', 'Record anything that remains unverified']
  ]];
  return { guideId, checks: steps.map(([ko, en]) => ({ ko, en })) };
}
