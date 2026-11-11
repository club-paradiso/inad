// Content for generated (non-authored) passengers — v13. Pure data, fictional.
//
// A generated passenger used to say one templated line ("개인 관광 목적입니다.") and differ from the next one only
// by name and nationality. This file gives each of them a trip: why they came, what they plan to do, what they do
// at home and how they pay for the stay, plus a speaking manner. `engines/passenger-story.js` picks from these
// pools with a seeded stream of its own.
//
// Rules for anything added here:
// - Nothing is chosen by nationality, sex or portrait. Pools are keyed by the declared entry basis only
//   (tourist / business / resident), and age is used solely to keep an occupation plausible.
// - A story never adds a fact that could change a verdict. It agrees with the declared purpose, the documents
//   and the frozen lookups of the case it decorates.
// - Tourist lines avoid the wording the generic statement-lock rule reads as paid work
//   (statement-lock-engine.js rule 4), so a routine tourist never produces a false contradiction.
// - No amounts of money: the game does not invent a minimum-funds threshold.

export const VOICES = [
  { id: 'plain', lead: [''], tail: [''] },
  { id: 'formal', lead: [''], tail: ['필요한 서류는 전부 여기 있습니다.', '확인이 필요한 것이 있으면 말씀해 주십시오.'] },
  { id: 'chatty', lead: ['안녕하세요. '], tail: ['비행이 길어서 조금 피곤하네요.', '기내에서 한숨도 못 잤습니다.'] },
  { id: 'nervous', lead: ['아, 네. '], tail: ['입국심사는 늘 긴장이 되네요.', '제가 더 보여 드려야 할 것이 있습니까?'] },
  { id: 'brisk', lead: [''], tail: [''], brief: true }
];

// open: first statement · brief: the same in a few words · purpose: answer to the purpose question ·
// plan: answer to "what exactly will you do"
export const TRIP_THEMES = {
  tourist: [
    { id: 'palace', open: '관광하러 왔습니다. 서울에서 고궁과 한옥마을을 둘러보려고 합니다.', brief: '관광입니다. 고궁을 보러 왔습니다.', purpose: '관광입니다. 경복궁과 북촌 한옥마을을 직접 보고 싶어서 왔습니다.', plan: '첫날은 경복궁과 북촌을 걷고, 다음 날은 창덕궁 후원 관람을 예약해 뒀습니다. 남는 날에는 인사동과 남산에 갈 생각입니다.' },
    { id: 'food', open: '여행 왔습니다. 한국 음식을 먹으러 다니는 것이 이번 여행의 목적입니다.', brief: '여행입니다. 먹으러 왔습니다.', purpose: '관광입니다. 시장 음식과 한식당을 찾아다니려고 왔습니다.', plan: '광장시장과 망원시장을 먼저 가고, 하루는 전주에 당일로 다녀오려고 합니다. 저녁 식당 한 곳은 미리 예약했습니다.' },
    { id: 'concert', open: '공연을 보러 왔습니다. 주말 콘서트 표를 예매해 뒀습니다.', brief: '콘서트 보러 왔습니다.', purpose: '관광입니다. 주말 콘서트 관람이 가장 큰 일정이고 나머지는 서울 구경입니다.', plan: '토요일 저녁 공연 표가 있습니다. 그 전에는 홍대와 성수동을 돌아다니고, 공연 다음 날은 쉬다가 돌아갑니다.' },
    { id: 'hiking', open: '등산하러 왔습니다. 북한산과 설악산에 올라가 보려고 합니다.', brief: '등산 여행입니다.', purpose: '관광입니다. 한국의 산을 걸어 보고 싶어서 왔습니다.', plan: '서울에 있는 동안 북한산에 하루 가고, 하루는 속초까지 버스로 가서 설악산 케이블카 쪽을 걷습니다. 숙소는 계속 서울입니다.' },
    { id: 'drama', open: '여행입니다. 드라마에 나온 장소들을 직접 보고 싶어서 왔습니다.', brief: '여행입니다. 촬영지 구경입니다.', purpose: '관광입니다. 좋아하는 한국 드라마 촬영지를 돌아보려고 합니다.', plan: '서울 시내 촬영지 몇 곳과 남이섬을 하루씩 갑니다. 촬영지 지도는 미리 만들어 왔습니다.' },
    { id: 'museum', open: '전시를 보러 왔습니다. 박물관과 미술관 몇 곳을 돌 계획입니다.', brief: '박물관 여행입니다.', purpose: '관광입니다. 국립중앙박물관과 미술관을 보는 것이 목적입니다.', plan: '국립중앙박물관에 하루를 쓰고, 다음 날은 리움과 국립현대미술관에 갑니다. 한 곳은 시간 예약을 해 뒀습니다.' },
    { id: 'temple', open: '쉬러 왔습니다. 서울을 구경하고 하루는 사찰 체험을 해 보려고 합니다.', brief: '휴가입니다. 쉬러 왔습니다.', purpose: '관광입니다. 휴가를 내고 조용히 쉬다 가려고 합니다.', plan: '서울 시내를 천천히 걷고, 하루는 사찰 당일 체험 프로그램에 참가합니다. 무리한 일정은 잡지 않았습니다.' },
    { id: 'shopping', open: '관광 겸 쇼핑하러 왔습니다. 명동과 성수동을 돌아다닐 생각입니다.', brief: '관광하고 쇼핑하러 왔습니다.', purpose: '관광입니다. 쇼핑과 카페 구경이 주된 일정입니다.', plan: '명동과 성수동, 동대문을 하루씩 돌고, 마지막 날에는 선물을 사서 돌아갑니다.' },
    { id: 'photo', open: '사진을 찍으러 왔습니다. 서울 야경과 한강을 담아 가려고 합니다.', brief: '사진 여행입니다.', purpose: '관광입니다. 취미로 사진을 찍는데 서울 풍경을 찍고 싶었습니다.', plan: '낮에는 익선동과 서촌 골목을, 저녁에는 한강 다리와 남산 야경을 찍습니다. 하루는 수원 화성에 다녀옵니다.' },
    { id: 'history', open: '역사에 관심이 있어서 왔습니다. 전쟁기념관과 비무장지대 견학을 신청했습니다.', brief: '역사 탐방 여행입니다.', purpose: '관광입니다. 한국 현대사와 관련된 곳을 직접 보려고 합니다.', plan: '전쟁기념관과 서대문형무소역사관을 보고, 하루는 여행사 버스로 비무장지대 견학에 참가합니다.' }
  ],
  business: [
    { id: 'supplier', open: '출장입니다. 거래처와 내년 공급 일정을 협의하러 왔습니다.', brief: '출장입니다. 거래처 회의가 있습니다.', purpose: '업무 회의입니다. 한국 거래처와 내년도 부품 공급 일정을 협의합니다.', plan: '이틀 동안 거래처 회의실에서 회의를 하고, 마지막 날 오전에 정리 회의를 한 뒤 출국합니다.', job: '본국 제조회사 구매팀에서 근무합니다.' },
    { id: 'expo', open: '전시회를 참관하러 왔습니다. 회사에서 업계 동향을 보고 오라고 했습니다.', brief: '출장입니다. 전시회 참관입니다.', purpose: '업무 회의 참석입니다. 산업 전시회를 참관하고 부스 담당자들과 면담합니다.', plan: '전시회장에 이틀 가고, 둘째 날 오후에 미리 약속한 업체 두 곳과 면담이 있습니다.', job: '본국 유통회사 상품기획 부서에서 근무합니다.' },
    { id: 'branch', open: '회의 때문에 왔습니다. 한국 지사와 분기 실적 회의가 있습니다.', brief: '출장입니다. 지사 회의입니다.', purpose: '업무 회의입니다. 한국 지사와 분기 실적을 점검하는 회의에 참석합니다.', plan: '지사 사무실에서 하루 종일 회의를 하고, 다음 날은 지사 직원들과 내년 계획을 논의합니다.', job: '본사 재무 부서에서 근무합니다.' },
    { id: 'quality', open: '품질 회의에 참석하러 왔습니다. 협력사와 납품 부품 문제를 논의합니다.', brief: '출장입니다. 품질 회의입니다.', purpose: '업무 회의입니다. 협력사가 납품한 부품의 불량 원인을 함께 검토합니다.', plan: '첫날은 협력사 회의실에서 자료를 검토하고, 둘째 날 개선 일정에 합의하면 돌아갑니다. 회의만 하고 현장 작업은 하지 않습니다.', job: '본국 회사 품질관리 부서에서 근무합니다.' },
    { id: 'software', open: '업무 협의를 하러 왔습니다. 저희 회사가 도입하려는 소프트웨어의 조건을 논의합니다.', brief: '출장입니다. 도입 협의입니다.', purpose: '업무 회의입니다. 한국 업체 소프트웨어의 도입 조건과 일정을 협의합니다.', plan: '이틀간 시연을 보고 계약 조건을 논의합니다. 서명은 본사 검토 후에 하기 때문에 이번에는 회의만 합니다.', job: '본국 회사 전산 부서에서 근무합니다.' },
    { id: 'seminar', open: '업계 세미나에 참석하러 왔습니다. 발표를 듣고 담당자들과 인사하는 일정입니다.', brief: '출장입니다. 세미나 참석입니다.', purpose: '업무 회의 참석입니다. 업계 세미나에서 발표를 듣고 관계자들과 면담합니다.', plan: '세미나가 이틀 열리고, 마지막 날에는 주최 측이 마련한 간담회에 참석합니다.', job: '본국 회사 사업개발 부서에서 근무합니다.' }
  ],
  resident: [
    { id: 'vacation', open: '방학 동안 집에 다녀왔습니다. 곧 개강이라 학교로 돌아가는 길입니다.', brief: '방학이 끝나서 돌아왔습니다.', purpose: '국내 체류지로 돌아가는 길입니다. 방학 동안 본국 집에 다녀왔습니다.', plan: '방학에 맞춰 본국 집에서 지냈고, 개강 전에 수강 신청을 하려고 돌아왔습니다.' },
    { id: 'family', open: '가족 행사가 있어서 잠깐 본국에 다녀왔습니다. 학교로 돌아갑니다.', brief: '본국에 다녀오는 길입니다.', purpose: '국내 체류지로 돌아가는 길입니다. 가족 행사에 참석하고 왔습니다.', plan: '가족 결혼식에 참석하느라 일주일쯤 나갔다 왔습니다. 이번 주부터 다시 수업에 들어갑니다.' },
    { id: 'conference', open: '학회 발표가 있어서 며칠 나갔다 왔습니다. 기숙사로 돌아갑니다.', brief: '학회에 다녀오는 길입니다.', purpose: '국내 체류지로 돌아가는 길입니다. 해외 학회에서 발표하고 왔습니다.', plan: '지도교수님과 함께 해외 학회에 참석해 포스터 발표를 했습니다. 연구실 일정 때문에 바로 돌아왔습니다.' }
  ]
};

// Occupations for tourists. min/max are ages that keep the line plausible; they carry no other meaning.
export const HOME_JOBS = [
  { min: 23, max: 62, a: '초등학교 교사입니다. 방학에 맞춰 휴가를 냈습니다.' },
  { min: 23, max: 62, a: '병원에서 간호사로 근무합니다. 연차를 모아서 왔습니다.' },
  { min: 24, max: 64, a: '회계 사무소에서 근무합니다.' },
  { min: 22, max: 60, a: '그래픽 디자이너입니다. 프리랜서라 일정은 제가 조정합니다.' },
  { min: 18, max: 27, a: '대학생입니다. 학기가 끝나서 여행을 왔습니다.' },
  { min: 25, max: 65, a: '작은 카페를 운영합니다. 제가 없는 동안은 가족이 가게를 봅니다.' },
  { min: 23, max: 62, a: '은행에서 근무합니다.' },
  { min: 23, max: 60, a: '소프트웨어 개발자입니다. 회사에 휴가를 냈습니다.' },
  { min: 24, max: 64, a: '물류회사 사무직입니다.' },
  { min: 60, max: 99, a: '공무원으로 일하다 퇴직했습니다. 지금은 연금으로 생활합니다.' },
  { min: 22, max: 60, a: '호텔 프런트에서 근무합니다. 비수기라 휴가를 받았습니다.' },
  { min: 25, max: 64, a: '약사입니다. 약국은 동료가 맡아 주고 있습니다.' }
];
export const JOB_FALLBACK = '지금은 일을 쉬고 있습니다. 쉬는 동안 여행을 왔습니다.';
export const JOB_MINOR = '학생입니다. 학교 방학이라 왔습니다.';

export const FUNDS = {
  tourist: [
    '신용카드를 주로 쓰고, 현금은 조금만 환전해 왔습니다.',
    '모아 둔 여행 자금으로 왔습니다. 카드와 현금을 같이 가져왔습니다.',
    '숙소와 항공권은 미리 결제했고, 나머지는 카드로 쓸 생각입니다.',
    '체크카드에 여행 자금을 넣어 왔습니다. 숙박비는 이미 결제했습니다.'
  ],
  business: [
    '출장비는 회사가 부담합니다. 한국에서 따로 받는 보수는 없습니다.',
    '항공권과 숙박은 회사가 결제했고, 식비는 법인카드로 씁니다. 한국에서 받는 돈은 없습니다.'
  ],
  resident: [
    '등록금은 장학금으로 내고, 생활비는 부모님이 보내 주십니다.',
    '생활비는 본국 가족이 송금해 줍니다. 계좌 내역을 보여 드릴 수 있습니다.'
  ]
};

export const SCHOOLS = ['한빛대학교', '새솔대학교', '다온대학교', '누리대학교'];
export const MAJORS = ['경영학 석사과정', '컴퓨터공학 학부과정', '한국어교육 석사과정', '국제관계학 학부과정', '기계공학 박사과정'];

export const STORY_QUESTIONS = {
  plan: { cat: '여행·체류', q: '한국에서의 일정을 구체적으로 말씀해 주십시오.', reveal: 'purpose' },
  planResident: { cat: '여행·체류', q: '이번에는 어떤 일로 출국했다가 돌아오는 길입니까?', reveal: 'purpose' },
  lodging: { cat: '여행·체류', q: '한국에서는 어느 숙소에서 묵습니까?', reveal: 'stay' },
  funds: { cat: '재정', q: '체류 경비는 어떻게 준비했습니까?', reveal: 'funds' },
  job: { cat: '직업', q: '본국에서는 어떤 직업을 가지고 있습니까?' },
  jobResident: { cat: '직업', q: '국내에서는 어느 학교에서 무엇을 공부합니까?' }
};

// Anomalies that look like a problem and turn out not to be one (the case stays CLEAR). The anomaly is written
// into the submitted document, so the examiner meets it by reading the document — the clue is no longer handed
// over at the start of the case. `kinds` lists the entry bases the anomaly makes sense for.
export const REVIEW_ANOMALIES = {
  companionHotel: {
    kinds: ['tourist', 'business'], doc: 'HOTEL',
    fields: () => [['예약자', '동행인 명의 · 피심사인 아님']],
    question: { cat: '추가소명', q: '숙박예약 명의가 본인이 아닌 이유를 설명해 주십시오.', a: '동행인이 두 사람 객실을 함께 예약했습니다. 제 이름도 투숙객 명단에 등록되어 있습니다.', requires: ['QUESTION_purpose'] },
    lookup: ['contact', '주의', '예약 대표명의는 동행인이지만 투숙객 명단에서 피심사인 성명과 동일 숙박기간이 확인됩니다.'],
    clues: [['DOC_HOTEL', '숙박 명의', '숙박예약 대표명의가 피심사인과 다름.', 'unresolved'], ['LOOKUP_contact', '의심 해소', '동행예약 투숙객 명단에서 피심사인 성명이 확인됨.', 'confirm']]
  },
  pnrAgency: {
    kinds: ['tourist', 'business'], doc: 'PNR',
    fields: () => [['발권처', '여행사 단체 발권 · 개인 앱 조회 불가']],
    question: { cat: '추가소명', q: '귀국편 예약내역을 본인 휴대전화에서 바로 제시하지 못하는 이유가 있습니까?', a: '여행사가 단체 예약으로 발권해 제 앱에는 안 보이지만 예약번호와 전자티켓이 있습니다.', requires: ['QUESTION_return'] },
    lookup: ['pnr', '주의', '여행사 단체예약 PNR에서 피심사인의 귀국편 전자티켓과 좌석상태가 확인됩니다.'],
    clues: [['DOC_PNR', '귀국편 표시', '개인 앱에서 귀국편이 즉시 조회되지 않음.', 'unresolved'], ['LOOKUP_pnr', '의심 해소', '단체 PNR에서 유효 전자티켓과 귀국편이 확인됨.', 'confirm']],
    returnDelivery: 'agency'
  },
  friendContact: {
    kinds: ['tourist', 'business'], doc: 'ENTRY BASIS',
    fields: () => [['국내 연락처', '개인 지인 · 숙박업소·초청기관 아님']],
    question: { cat: '국내관계', q: '전자입국신고의 국내 연락처와 어떤 관계입니까?', a: '예전에 알게 된 지인입니다. 숙박이나 일자리를 제공받는 관계는 아니고 하루 만나서 식사할 예정입니다.', requires: ['QUESTION_purpose'] },
    lookup: ['contact', '주의', '국내 연락처는 개인 지인이나 숙박·고용주·초청자로 등록된 이력은 확인되지 않습니다.'],
    clues: [['DOC_ENTRY BASIS', '국내 지인', '숙박업소나 초청기관이 아닌 개인 연락처를 신고함.', 'unresolved'], ['LOOKUP_contact', '의심 해소', '고용·숙박 제공 등 목적불일치를 뒷받침할 관계는 확인되지 않음.', 'confirm']]
  },
  // The name on the ticket differs from the passport by one letter. Carriers tie a booking to the passport number,
  // so the record settles it; a typo alone says nothing about the traveller.
  ticketName: {
    kinds: ['tourist', 'business'], doc: 'PNR',
    fields: (c) => [['탑승객 성명', misspelt(c.name)]],
    question: { cat: '추가소명', q: '항공권의 영문 성명이 여권과 한 글자 다릅니다. 이유를 알고 있습니까?', a: '예약할 때 제가 철자를 잘못 입력했습니다. 항공사에 문의했더니 여권번호가 같아서 탑승에는 문제가 없다고 했습니다.', requires: ['QUESTION_return'] },
    lookup: ['pnr', '주의', '예약 성명의 철자 한 글자가 여권과 다르지만, 예약에 연결된 여권번호와 생년월일은 피심사인과 일치합니다.'],
    clues: [['DOC_PNR', '성명 철자', '항공권의 영문 성명이 여권과 한 글자 다름.', 'unresolved'], ['LOOKUP_pnr', '의심 해소', '예약에 연결된 여권번호·생년월일이 피심사인과 일치함.', 'confirm']]
  },
  // The hotel booking covers fewer nights than the declared stay.
  staySpan: {
    kinds: ['tourist'], doc: 'HOTEL',
    fields: (c) => [['숙박기간', `첫 ${Math.max(1, nightsOf(c) - 2)}박만 예약`]],
    question: { cat: '추가소명', q: '숙박 예약이 체류 기간보다 짧습니다. 나머지 기간은 어디에서 지냅니까?', a: '뒤쪽 일정은 부산으로 내려가서 지냅니다. 그쪽 숙소는 따로 예약했고 확인 메일을 보여 드릴 수 있습니다.', requires: ['QUESTION_stay'] },
    lookup: ['contact', '주의', '피심사인이 제시한 두 번째 숙소의 예약 확인 메일이 해당 숙박시설의 예약 기록과 일치합니다.'],
    clues: [['DOC_HOTEL', '숙박 기간', '숙박 예약 기간이 신청한 체류 기간보다 짧음.', 'unresolved'], ['LOOKUP_contact', '의심 해소', '나머지 기간의 숙소 예약이 별도로 확인됨.', 'confirm']]
  },
  // Registered resident whose period of stay ends soon. Still inside the period on the day of arrival.
  stayExpiry: {
    kinds: ['resident'], doc: 'RESIDENCE CARD',
    fields: () => [['체류기간', '만료일 임박 · 입국일 현재 유효']],
    question: { cat: '추가소명', q: '체류기간 만료일이 얼마 남지 않았습니다. 이후 계획이 있습니까?', a: '다음 학기 등록을 마쳤습니다. 만료 전에 체류기간 연장을 신청하려고 서류를 준비해 뒀습니다.', requires: ['QUESTION_purpose'] },
    lookup: ['visa', '주의', '체류기간 만료일이 가깝지만 입국일 현재 유효한 체류기간 안에 있으며 등록 상태에 이상이 없습니다.'],
    clues: [['DOC_RESIDENCE CARD', '체류기간', '체류기간 만료일이 가까움.', 'unresolved'], ['LOOKUP_visa', '의심 해소', '입국일 현재 체류기간이 유효하고 등록 상태가 정상임.', 'confirm']]
  }
};

// What a passenger who intends paid activity on a short-term basis says once the examiner asks for specifics.
// Each line states both the activity and the pay, because that pair — not a nervous manner — is the ground.
export const PAID_ACTIVITY = {
  tourist: [
    { a: '지인이 운영하는 매장에서 약 2주 동안 일을 도와주고 현금으로 사례비를 받기로 했습니다.', lookup: '국내 연락처가 영업장 운영자로 확인되며 피심사인의 단기 근로 제공 정황과 진술이 일치합니다.' },
    { a: '사실은 지인 식당 주방에서 머무는 동안 일을 하기로 했습니다. 숙식을 제공받고 주마다 급여를 받기로 했습니다.', lookup: '국내 연락처가 음식점 사업자로 확인되며 피심사인이 진술한 근로 제공 계획과 일치합니다.' },
    { a: '아는 사람 농장에서 수확 일을 돕기로 했습니다. 일한 날마다 일당을 받기로 했습니다.', lookup: '국내 연락처가 농장 운영자로 확인되며 피심사인이 진술한 일당 근로 계획과 일치합니다.' }
  ],
  business: [
    { a: '회의는 하루뿐입니다. 나머지 기간에는 거래처 공장에서 설비 설치 일을 하고 작업비를 받기로 했습니다.', lookup: '국내 연락처가 설비 설치를 발주한 사업장으로 확인되며 피심사인이 진술한 유상 작업 계획과 일치합니다.' }
  ]
};

export function nightsOf(c) { const d = Number(String(c?.stay || '').match(/\d+/)?.[0] || 0); return Math.max(1, d - 1); }
// One letter dropped from the given name, the way a hurried booking form produces it.
export function misspelt(name) {
  const parts = String(name || '').trim().split(/\s+/); const g = parts[0] || '';
  if (g.length < 4) return [g + g.slice(-1), ...parts.slice(1)].join(' ');
  const i = Math.floor(g.length / 2); return [g.slice(0, i) + g.slice(i + 1), ...parts.slice(1)].join(' ');
}
