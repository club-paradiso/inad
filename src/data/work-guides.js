// Public-source work guides for the in-game reference UX.
// These are educational checklists assembled from statutes and official public guidance.
// They are NOT Ministry of Justice internal manuals or non-public screening criteria.
export const WORK_GUIDES = [
  {
    id: 'primary-entry', categoryKo: '일반심사', categoryEn: 'Primary inspection',
    titleKo: '입국심사 기본 확인 순서', titleEn: 'Primary entry inspection checklist',
    summaryKo: '제12조의 공개 법정요건을 순서대로 확인합니다.', summaryEn: 'Walk through the public statutory requirements under Article 12.',
    stepsKo: ['여권과 필요한 경우 사증의 유효성을 확인', '필요한 경우 사전여행허가(K-ETA) 유효성 확인', '진술·서류상 입국목적과 체류자격의 일치 여부 확인', '허용 가능한 체류기간 확인', '제11조 입국금지·거부 대상 여부 확인', '요건이 충분히 증명되었는지 종합 확인'],
    stepsEn: ['Check passport validity and visa validity where required', 'Check K-ETA validity where required', 'Check whether stated purpose matches immigration status', 'Confirm the permitted period of stay', 'Check whether Article 11 grounds apply', 'Confirm that the entry requirements have been sufficiently established'],
    sources: ['ica', 'ica-decree', 'ica-rule']
  },
  {
    id: 'biometrics', categoryKo: '본인확인', categoryEn: 'Identity',
    titleKo: '생체정보·본인확인', titleEn: 'Biometrics and identity verification',
    summaryKo: '제12조의2에 따른 생체정보 제공 및 면제 여부를 확인합니다.', summaryEn: 'Check biometric collection and exemptions under Article 12-2.',
    stepsKo: ['생체정보 제공 대상인지 확인', '법정 면제대상 여부 확인', '여권 명의인과 현재 피심사인의 본인 동일성 확인', '정당한 면제 없이 제공을 거부하는 경우 후속 법적 판단 검토'],
    stepsEn: ['Determine whether biometric information is required', 'Check statutory exemptions', 'Verify that the traveler matches the passport holder', 'If biometrics are refused without an applicable exemption, review the statutory consequence'],
    sources: ['ica', 'ica-decree', 'ica-rule']
  },
  {
    id: 'keta', categoryKo: '무사증·K-ETA', categoryEn: 'Visa waiver · K-ETA',
    titleKo: 'K-ETA 및 한시 면제 확인', titleEn: 'K-ETA and temporary exemption check',
    summaryKo: 'K-ETA 필요 여부와 2026년 한시 면제 여부를 구분합니다.', summaryEn: 'Distinguish K-ETA requirements from the 2026 temporary exemption.',
    stepsKo: ['무사증 입국 대상 여부를 먼저 확인', 'K-ETA 적용 대상인지 확인', '2026년 한시 면제 대상국 여부 확인', '유효 K-ETA가 있는 경우 입국신고서 면제 여부도 함께 확인'],
    stepsEn: ['First determine visa-waiver eligibility', 'Check whether K-ETA applies', 'Check whether the traveler falls under the 2026 temporary exemption', 'If a valid K-ETA exists, also check the arrival-card exemption'],
    sources: ['keta-guide', 'keta-waiver', 'ica']
  },
  {
    id: 'arrival-card', categoryKo: '입국신고', categoryEn: 'Arrival declaration',
    titleKo: '전자입국신고(e-Arrival Card)', titleEn: 'Electronic Arrival Card',
    summaryKo: '전자입국신고 대상과 제외대상을 공개 안내 기준으로 확인합니다.', summaryEn: 'Check who must submit an e-Arrival Card and who is exempt.',
    stepsKo: ['입국신고서 작성 대상인지 확인', '유효 K-ETA·유효 외국인등록 등 공개된 제외사유 확인', '전자신고 제출시점과 유효기간 확인', '여권·체류예정지·입국목적 등 신고정보와 진술을 교차 확인'],
    stepsEn: ['Determine whether an arrival declaration is required', 'Check published exemptions such as valid K-ETA or valid foreigner registration', 'Check submission timing and validity', 'Cross-check declared passport, stay address and purpose information against the interview'],
    sources: ['earrival-notice', 'ica-decree']
  },
  {
    id: 'purpose-status', categoryKo: '입국목적', categoryEn: 'Purpose of entry',
    titleKo: '입국목적과 체류자격 일치 확인', titleEn: 'Purpose and immigration-status consistency',
    summaryKo: '국적이나 태도가 아니라 목적·자격·증빙의 일관성을 확인합니다.', summaryEn: 'Check consistency of purpose, status and evidence, not nationality or demeanor.',
    stepsKo: ['신고한 입국목적을 구체적으로 확인', '체류자격에서 허용되는 활동과 비교', '일정·숙소·초청·귀국계획 등 제출자료와 진술을 교차검증', '모순이 남으면 필요한 범위에서 추가 질문 또는 재심 검토'],
    stepsEn: ['Clarify the stated purpose of entry', 'Compare it with activities allowed by the immigration status', 'Cross-check itinerary, accommodation, invitation and departure plans', 'If material inconsistencies remain, consider proportionate follow-up questions or secondary inspection'],
    sources: ['ica', 'hikorea-shortterm', 'visa-navigator']
  },
  {
    id: 'secondary-review', categoryKo: '추가확인', categoryEn: 'Additional review',
    titleKo: '추가 확인·재심 전 체크', titleEn: 'Before additional or secondary review',
    summaryKo: '재심은 처벌이 아니라 입국요건 확인의 계속으로 다룹니다.', summaryEn: 'Treat secondary review as continued entry examination, not punishment.',
    stepsKo: ['현재까지 확인되지 않은 법정요건이 무엇인지 특정', '일반심사에서 해결 가능한 질문·조회가 남았는지 확인', '추가 확인이 필요한 이유를 사건기록에 남김', '국적·긴장도·외모만을 독립적인 재심 근거로 사용하지 않음'],
    stepsEn: ['Identify which statutory requirement remains unresolved', 'Check whether proportionate questions or lookups can resolve it at primary inspection', 'Record the reason additional review is needed', 'Do not use nationality, nervousness or appearance alone as a basis for secondary review'],
    sources: ['ica']
  },
  {
    id: 'refugee-port', categoryKo: '난민', categoryEn: 'Refugee',
    titleKo: '출입국항 난민신청', titleEn: 'Refugee application at a port of entry',
    summaryKo: '입국심사와 난민 회부심사를 구분해 처리합니다.', summaryEn: 'Keep ordinary entry inspection distinct from refugee referral review.',
    stepsKo: ['출입국항에서 난민신청 의사를 명확히 확인', '관할 출입국관서에 난민인정신청서 제출 절차 안내', '회부·불회부 절차가 별도 심사임을 구분', '법정 결정기간과 후속 절차 확인'],
    stepsEn: ['Confirm a clear intent to seek refugee recognition at the port of entry', 'Use the application procedure of the competent immigration office', 'Distinguish referral/non-referral review from ordinary admission inspection', 'Check the statutory decision period and follow-up procedure'],
    sources: ['refugee-act', 'refugee-decree', 'hikorea-refugee']
  },
  {
    id: 'refusal', categoryKo: '입국불허', categoryEn: 'Refusal',
    titleKo: '입국불허 판단 전 최종 확인', titleEn: 'Final check before refusal of entry',
    summaryKo: '제12조제4항의 요건 미증명과 관련 절차를 최종 확인합니다.', summaryEn: 'Review the Article 12(4) evidentiary basis and follow-up procedure.',
    stepsKo: ['충족되지 않았거나 증명되지 않은 제12조 요건을 특정', '사건기록의 질문·조회·제출자료가 그 판단을 뒷받침하는지 확인', '불필요하거나 무관한 요소가 판단에 섞이지 않았는지 확인', '입국불허 후 송환·출국대기 관련 후속 절차를 별도로 진행'],
    stepsEn: ['Identify the Article 12 requirement that is not met or not established', 'Confirm that questions, lookups and submitted evidence support the finding', 'Check that irrelevant factors have not influenced the decision', 'Handle repatriation and departure-waiting procedures separately after refusal'],
    sources: ['ica', 'ica-decree']
  }
];

export const workGuideById = (id) => WORK_GUIDES.find((g) => g.id === id) || null;
