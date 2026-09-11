// Rule registry for the traceable decision model. Each node is explanatory metadata attached to the
// existing (frozen) verdict logic — it never changes an outcome. `status` distinguishes what the
// public record supports:
//   CONFIRMED  — directly stated in a current statute/decree/rule or an official notice
//   INFERRED   — reasonably follows from public sources but is not spelled out
//   SIMULATED  — a game construct for training/decision-support (labelled as such in the UI)
//   NOT_PUBLICLY_VERIFIED — real practice may exist but no public source was found; modelled only as simulation
export const DOMAINS = {
  DOCUMENT_VALIDITY: { id: 'DOCUMENT_VALIDITY', label: '여권·사증 유효성', short: '문서', order: 1 },
  TRAVEL_AUTHORIZATION: { id: 'TRAVEL_AUTHORIZATION', label: '입국 근거·사전여행허가', short: '입국근거', order: 2 },
  ARRIVAL_DECLARATION: { id: 'ARRIVAL_DECLARATION', label: '입국신고(전자입국신고)', short: '입국신고', order: 3 },
  BIOMETRICS: { id: 'BIOMETRICS', label: '생체정보·본인확인', short: '생체', order: 4 },
  PURPOSE_COMPATIBILITY: { id: 'PURPOSE_COMPATIBILITY', label: '입국목적과 체류자격의 부합', short: '목적', order: 5 },
  PERIOD_OF_STAY: { id: 'PERIOD_OF_STAY', label: '체류기간·체류계획', short: '기간', order: 6 },
  ENTRY_RESTRICTIONS: { id: 'ENTRY_RESTRICTIONS', label: '입국금지·거부 대상 여부', short: '규제', order: 7 },
  ADDITIONAL_VERIFICATION: { id: 'ADDITIONAL_VERIFICATION', label: '추가 확인(재심·교차검증)', short: '추가확인', order: 8 },
  REFUGEE: { id: 'REFUGEE', label: '출입국항 난민신청', short: '난민', order: 9 },
  INVESTIGATION: { id: 'INVESTIGATION', label: '출입국사범 조사·긴급체포', short: '사범', order: 10 },
  REPATRIATION: { id: 'REPATRIATION', label: '송환·출국대기', short: '송환', order: 11 }
};

export const DECISION_RULES = [
  { id: 'R-12-1-DOC', domain: 'DOCUMENT_VALIDITY', title: '여권과 사증이 유효할 것 (사증은 이 법에서 요구하는 경우만)', legalBasis: '출입국관리법 제12조제3항제1호', sources: ['ica'], status: 'CONFIRMED', explanation: '입국심사관은 여권과, 사증이 요구되는 경우 그 사증의 유효성을 심사한다. 여권 진위(전자칩·MRZ)와 명의 일치는 이 요건의 확인 요소다.' },
  { id: 'R-12-4-BURDEN', domain: 'DOCUMENT_VALIDITY', title: '요건 증명 실패 시 입국 불허가 가능', legalBasis: '출입국관리법 제12조제4항', sources: ['ica'], status: 'CONFIRMED', explanation: '외국인이 제3항 각 호의 요건을 갖추었음을 증명하지 못하면 입국을 허가하지 아니할 수 있다. 증명 책임은 입국하려는 외국인에게 있다.' },
  { id: 'R-7-VISA', domain: 'TRAVEL_AUTHORIZATION', title: '유효한 여권과 법무부장관이 발급한 사증 소지 원칙', legalBasis: '출입국관리법 제7조제1항', sources: ['ica'], status: 'CONFIRMED', explanation: '사증 소지가 원칙이고, 제7조제2항 각 호(재입국허가·사증면제협정·별도 입국허가·난민여행증명서)는 예외다.' },
  { id: 'R-7-2-WAIVER', domain: 'TRAVEL_AUTHORIZATION', title: '사증면제협정 국민(B-1)·관광통과 무사증 입국허가(B-2)·재입국허가 면제', legalBasis: '출입국관리법 제7조제2항제1호·제2호·제3호, 시행령 제8조, 시행령 제15조제7항', sources: ['ica', 'ica-decree', 'keta-guide', 'visa-navigator'], status: 'CONFIRMED', explanation: '사증 없이 입국할 수 있는 근거는 협정(B-1), 법무부장관이 정하는 관광·통과 목적 입국허가(B-2), 재입국허가(면제)로 나뉜다. 무사증입국 대상은 112개 국가·지역(B-1 67, B-2 45)이다. 국적은 이 근거 산정에만 쓰인다.' },
  { id: 'R-7-3-KETA', domain: 'TRAVEL_AUTHORIZATION', title: '사전여행허가(K-ETA)가 요구되는 경우 사전여행허가서가 유효할 것', legalBasis: '출입국관리법 제7조의3, 제12조제3항제1호의2', sources: ['ica', 'keta-guide', 'keta-waiver'], status: 'CONFIRMED', explanation: '사증 없이 입국할 수 있는 외국인에게 법무부장관이 사전여행허가를 받도록 할 수 있다. K-ETA는 사증이 아니며, 2026-12-31까지 22개국 국민에게 한시 면제 중이다(면제 대상도 유료로 신청 가능).' },
  { id: 'R-ABTC', domain: 'TRAVEL_AUTHORIZATION', title: 'APEC 기업인여행카드(ABTC) 소지자의 무사증 입국 편의', legalBasis: '법무부 K-ETA 안내(ABTC 소지자 K-ETA 제외) · 하이코리아 공개 안내', sources: ['keta-guide', 'hikorea-shortterm'], status: 'INFERRED', explanation: '공식 안내상 ABTC 소지자는 K-ETA 신청 제외 대상이다. ABTC의 KOR 승인과 단기상용(C-3-4) 체류기간 안내는 하이코리아 공개 안내에 근거하되, 세부 조건은 최신 안내로 확인해야 한다.' },
  { id: 'R-DEC-15-DECL', domain: 'ARRIVAL_DECLARATION', title: '입국심사 시 여권과 입국신고서(전자문서 포함) 제출 및 질문 답변', legalBasis: '출입국관리법 제12조제1항, 시행령 제15조제1항·제2항', sources: ['ica', 'ica-decree', 'earrival-notice'], status: 'CONFIRMED', explanation: '외국인은 여권과 입국신고서를 제출하고 질문에 답하여야 하며, 심사관은 입국의 적격 여부와 그 밖에 필요한 사항을 확인한다. 전자입국신고(e-Arrival Card)는 2025-02-24부터 시행된 온라인 입국신고서다.' },
  { id: 'R-DECL-EXEMPT', domain: 'ARRIVAL_DECLARATION', title: '입국신고서 제출 생략: 유효한 외국인등록·국내거소신고·법무부장관이 정하는 경우(유효 K-ETA 소지자 등)', legalBasis: '시행령 제15조제1항 단서 각 호 · 전자입국신고 시행 안내', sources: ['ica-decree', 'earrival-notice', 'keta-guide'], status: 'CONFIRMED', explanation: '등록외국인, 유효 K-ETA 소지자, 승무원 등은 신고 제외 대상이고 사증 소지자와 K-ETA 면제 대상자는 신고 대상이다. 제출 정보는 여권·입국·출국·입국목적·체류예정지 및 연락처·직업 정보다.' },
  { id: 'R-12-2-BIO', domain: 'BIOMETRICS', title: '생체정보 제공 및 본인확인 절차 응답 의무, 불응 시 입국 불허가 가능', legalBasis: '출입국관리법 제12조의2제1항·제2항', sources: ['ica'], status: 'CONFIRMED', explanation: '17세 미만, 외국정부·국제기구 업무 수행자와 동반가족, 대통령령으로 정하는 사람은 면제된다. 면제 대상이 아닌 사람이 제공하지 않으면 입국을 허가하지 아니할 수 있다.' },
  { id: 'R-12-3-2-PURPOSE', domain: 'PURPOSE_COMPATIBILITY', title: '입국목적이 체류자격에 맞을 것', legalBasis: '출입국관리법 제12조제3항제2호, 제10조', sources: ['ica', 'hikorea-shortterm', 'visa-navigator'], status: 'CONFIRMED', explanation: '단기방문(C-3)·사증면제(B-1)·관광통과(B-2)는 영리목적 활동을 포함하지 않는다. 진술·제출자료·전산정보로 실제 목적이 체류자격 범위 안에 있는지 확인한다.' },
  { id: 'R-12-3-3-PERIOD', domain: 'PERIOD_OF_STAY', title: '체류기간이 법무부령으로 정하는 바에 따라 정하여졌을 것', legalBasis: '출입국관리법 제12조제3항제3호, 시행규칙 제18조의3 및 별표 1', sources: ['ica', 'ica-rule', 'visa-navigator'], status: 'CONFIRMED', explanation: 'B-1은 3개월 이내(연장 불가), C계열은 90일 이내(연장 불가)가 공개 기준이다. 신청 체류기간과 귀국 계획이 허용 범위 안에 있는지 확인한다.' },
  { id: 'R-11-BAN', domain: 'ENTRY_RESTRICTIONS', title: '제11조 입국금지·거부 대상이 아닐 것', legalBasis: '출입국관리법 제12조제3항제4호, 제11조제1항 각 호·제2항', sources: ['ica'], status: 'CONFIRMED', explanation: '공중위생 위해, 위법 무기 반입, 공공안전 위해 우려, 경제·사회질서·풍속 저해 우려, 구호 필요(체류비용 부담능력 없음 포함), 강제퇴거 후 5년 미경과 등이 법정 사유다. 국적 자체는 사유가 아니다.' },
  { id: 'R-13-COND', domain: 'ADDITIONAL_VERIFICATION', title: '조건부 입국허가 (72시간 범위, 특별심사 필요 시)', legalBasis: '출입국관리법 제13조, 시행령 제16조', sources: ['ica', 'ica-decree'], status: 'CONFIRMED', explanation: '제12조제3항제1호 요건을 일정 기간 내 갖출 수 있는 사람, 제11조 해당 의심 또는 제2호 요건 미충족 의심으로 특별히 심사할 필요가 있는 사람에게 청장 등이 조건부 입국을 허가할 수 있다. 이 시뮬레이션에서는 플레이 가능한 조치로 구현하지 않았다(참고 표시만).' },
  { id: 'R-SECONDARY', domain: 'ADDITIONAL_VERIFICATION', title: '입국재심 — 제12조 입국심사의 계속(추가 확인)', legalBasis: '출입국관리법 제12조제3항·제4항 (재심 절차 자체의 세부 운영은 공개 법령에 규정되지 않음) · 인천공항출입국·외국인청 편제상 "입국재심" 명칭 사용', sources: ['ica', 'icn-office'], status: 'INFERRED', explanation: '공식 기관 편제에서 "입국재심"이라는 명칭이 확인되지만, 재심의 질문 순서·기준은 공개되어 있지 않다. 이 시뮬레이션의 재심 화면과 "SECONDARY"라는 영문 표기는 시뮬레이션용 일반 용어다.' },
  { id: 'R-PARTY', domain: 'ADDITIONAL_VERIFICATION', title: '동행인 진술 교차검증 (시뮬레이션 요소)', legalBasis: '해당 공개 규정 없음', sources: [], status: 'SIMULATED', explanation: '같은 PNR·숙소·동행관계는 진술의 일관성을 확인하는 맥락정보로만 쓰인다. 동행 사실 자체는 어떤 법정 요건에도 해당하지 않는다.' },
  { id: 'R-REF-6', domain: 'REFUGEE', title: '입국심사 시 난민인정신청 → 7일 이내 회부 여부 결정(미결정 시 입국허가)', legalBasis: '난민법 제6조제1항·제3항, 시행령 제5조제2항·제3항', sources: ['refugee-act', 'refugee-decree', 'hikorea-refugee'], status: 'CONFIRMED', explanation: '출입국항에서 난민인정신청서를 제출한 사람에 대해 법무부장관은 7일 이내에 회부 여부를 결정하고, 결정된 사람은 지체 없이 출입국관리법에 따른 입국심사를 받는다.' },
  { id: 'R-REF-NONREF', domain: 'REFUGEE', title: '불회부 사유와 불회부결정통지서 — 불회부는 입국불허가 아님', legalBasis: '난민법 시행령 제5조제1항 각 호(제7호: 오로지 경제적인 이유 등 명백히 이유 없는 경우), 제5조제7항', sources: ['refugee-decree'], status: 'CONFIRMED', explanation: '불회부 결정 후에도 출입국관리법상 입국심사를 별도로 받으며, 회부 결정 시에는 입국허가 또는 조건부 입국허가(90일 범위)를 한다.' },
  { id: 'R-SJP-47', domain: 'INVESTIGATION', title: '출입국사범 조사 · 용의자 신문 · 통역', legalBasis: '출입국관리법 제47조, 제48조제2항·제3항·제6항, 제12조의4', sources: ['ica', 'sjp-act'], status: 'CONFIRMED', explanation: '강제퇴거 대상 의심 외국인(용의자)을 조사할 수 있고, 신문에는 다른 출입국관리공무원이 참여하며 진술은 조서에 적는다. 국어가 통하지 않는 사람의 진술은 통역인에게 통역하게 하여야 한다. 위조·변조 여권은 보관 대상이다.' },
  { id: 'R-CPA-200-3', domain: 'INVESTIGATION', title: '긴급체포 요건 — 장기 3년 이상 범죄의 상당한 이유 + (증거인멸 우려 또는 도망 우려) + 영장을 받을 시간적 여유 없는 긴급성; 체포 후 즉시 검사 승인·긴급체포서 작성', legalBasis: '형사소송법 제200조의3제1항~제3항', sources: ['cpa'], status: 'CONFIRMED', explanation: '모든 요건이 확인되어야 하며 위조여권 발견만으로 체포가 자동화되지 않는다. 2026-10-02 시행 개정으로 조문상 체포 주체 표기가 "사법경찰관"으로 정리된다(요건 변화 없음).' },
  { id: 'R-76-REPAT', domain: 'REPATRIATION', title: '입국 불허가자에 대한 송환지시 · 송환기한 · 출국대기실 대기 원칙', legalBasis: '출입국관리법 제76조제1항제3호·제2항, 제76조의2제1항, 제76조의3', sources: ['ica'], status: 'CONFIRMED', explanation: '제12조제4항으로 입국이 허가되지 않은 사람은 운수업자가 비용과 책임으로 지체 없이 송환하고, 출국 전까지 출국대기실에서 대기하는 것이 원칙이다(예외: 출입국항 내 지정장소 조건부 대기). 국가가 관리비용을 부담하되 운수업자 귀책 시 운수업자가 부담한다.' },
  { id: 'R-REPORT-MOJ', domain: 'REPATRIATION', title: '중요 사안의 입국 불허가 결정은 지체 없이 법무부장관에게 보고', legalBasis: '시행령 제15조제6항', sources: ['ica-decree'], status: 'CONFIRMED', explanation: '이 시뮬레이션은 보고 단계를 플레이 요소로 구현하지 않고 절차 맥락으로만 표시한다.' },
  { id: 'R-INAD-TERM', domain: 'REPATRIATION', title: '"INAD"는 항공운송상 상태표시, 법률상 처분명은 "입국 불허가"', legalBasis: '출입국관리법 제12조제4항 문언("입국을 허가하지 아니할 수 있다")', sources: ['ica'], status: 'INFERRED', explanation: '화면의 ENTRY REFUSED / INAD 표기는 시뮬레이션·항공 실무 용어이며 법률 용어는 입국 불허가다.' },
  { id: 'R-BEHAVIOR', domain: 'ADDITIONAL_VERIFICATION', title: '긴장도·협조도·언어능력·통역 사용은 판정 근거가 아님', legalBasis: '제12조제3항 요건 목록에 해당 요소 없음', sources: ['ica'], status: 'SIMULATED', explanation: '법정 요건은 문서·사전여행허가·목적·기간·제11조 사유뿐이다. 행동·언어 변수는 대화 연출용이며 이 시뮬레이션은 이를 판정에 사용하지 않는다.' }
];
export const ruleById = (id) => DECISION_RULES.find((r) => r.id === id) || null;
export const rulesForDomain = (d) => DECISION_RULES.filter((r) => r.domain === d);
