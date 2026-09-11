// GENERATED from legacy/v6.1 by scripts/extract-legacy-data.js — 12 core scripted cases
// Legal/game content must not be altered here without a documented review (see docs/legal-baseline.md).
export const CASES = [
 {
  "id": "ICN-S1-001",
  "shift": 1,
  "name": "ROBERT VANCE",
  "nat": "미국",
  "code": "USA",
  "sex": "M",
  "dob": "1984-11-08",
  "passport": "585093217",
  "purpose": "반도체 기술 컨퍼런스 참석",
  "stay": "3일",
  "arrival": "KE086 · JFK → ICN",
  "return": "KE081 · ICN → JFK",
  "carrier": "대한항공",
  "basis": "지정 무사증 · 단기방문",
  "basisDetail": "일반여권 · 90일 이내 · K-ETA 한시면제(2026.12.31까지)",
  "eta": "한시면제",
  "arrivalCard": "전자입국신고 제출",
  "visa": "사증 불요",
  "watch": "이상 없음",
  "bio": "일치 99.4%",
  "chip": "정상",
  "risk": "LOW",
  "initial": "서울에서 3일간 열리는 반도체 컨퍼런스에 참석합니다. 호텔과 귀국편은 확정되어 있습니다.",
  "questions": [
   {
    "id": "purpose",
    "cat": "기본사항",
    "q": "방문 목적을 구체적으로 설명해 주십시오.",
    "a": "컨퍼런스 참석과 업계 관계자 미팅입니다. 한국에서 급여를 받거나 근무하지 않습니다.",
    "reveal": "purpose"
   },
   {
    "id": "hotel",
    "cat": "여행·체류",
    "q": "한국에서 어디에 체류합니까?",
    "a": "그랜드 워커힐 서울입니다. 제 이름으로 예약했습니다.",
    "reveal": "stay"
   },
   {
    "id": "return",
    "cat": "여행·체류",
    "q": "귀국 항공편은 언제입니까?",
    "a": "9월 8일 KE081편입니다. 발권 완료됐습니다.",
    "reveal": "travel"
   },
   {
    "id": "funds",
    "cat": "재정",
    "q": "체재비와 결제수단은 충분합니까?",
    "a": "회사 법인카드를 가지고 있고 호텔은 선결제했습니다.",
    "reveal": "funds"
   },
   {
    "id": "agenda",
    "cat": "여행·체류",
    "q": "컨퍼런스 일정과 별도 미팅 일정을 설명해 주십시오.",
    "a": "첫날은 컨퍼런스, 둘째 날 오전에 두 업체와 미팅이 있습니다. 행사 일정표와 캘린더 초청을 보여드릴 수 있습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_purpose"
    ]
   },
   {
    "id": "pay",
    "cat": "직업",
    "q": "한국 체류 중 한국 업체로부터 보수나 급여를 받습니까?",
    "a": "아닙니다. 미국 본사에서 급여를 받고 한국에서는 회의와 행사 참석만 합니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_purpose"
    ]
   },
   {
    "id": "samples",
    "cat": "추가소명",
    "q": "수하물에 업무용 장비나 샘플이 있습니까?",
    "a": "발표용 노트북과 회사 브로슈어뿐입니다. 판매할 물품이나 장비 설치용 공구는 없습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_agenda"
    ]
   },
   {
    "id": "sponsor",
    "cat": "재정",
    "q": "항공권·숙박비는 누가 부담합니까?",
    "a": "미국 본사가 출장비로 전액 부담합니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_funds"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "ROBERT VANCE"
     ],
     [
      "국적",
      "UNITED STATES OF AMERICA"
     ],
     [
      "여권번호",
      "585093217"
     ],
     [
      "만료일",
      "2034-05-03"
     ],
     [
      "전자칩",
      "VALID"
     ],
     [
      "MRZ",
      "VALID"
     ]
    ]
   },
   {
    "t": "전자입국신고",
    "k": "E-ARRIVAL",
    "fields": [
     [
      "신고상태",
      "제출 완료"
     ],
     [
      "입국목적",
      "CONFERENCE / BUSINESS VISIT"
     ],
     [
      "체류지",
      "Grand Walkerhill Seoul"
     ],
     [
      "국내연락처",
      "02-450-4500"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "입국편",
      "KE086"
     ],
     [
      "귀국편",
      "KE081"
     ],
     [
      "상태",
      "TICKETED"
     ],
     [
      "체류",
      "3 DAYS"
     ]
    ]
   },
   {
    "t": "컨퍼런스 등록증",
    "k": "SUPPORTING",
    "fields": [
     [
      "행사",
      "SEMICON TECH FORUM SEOUL"
     ],
     [
      "등록자",
      "ROBERT VANCE"
     ],
     [
      "일정",
      "2026-09-06 ~ 09-07"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "정상",
    "최근 5년 출입국 규제·체류위반 기록 없음."
   ],
   "visa": [
    "정상",
    "미국 일반여권. 지정 무사증 90일 적용 가능. K-ETA 한시면제 대상."
   ],
   "pnr": [
    "정상",
    "왕복 발권 완료. 귀국편 KE081 좌석 확약."
   ],
   "contact": [
    "정상",
    "호텔 대표번호와 신고 연락처 일치."
   ],
   "public": [
    "정상",
    "컨퍼런스 개최정보 및 등록자료 상호 일치."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "여권·생체정보 일치"
   ],
   "입국자격": [
    "ok",
    "충족",
    "무사증 입국 기반 확인"
   ],
   "입국목적": [
    "ok",
    "일치",
    "컨퍼런스 참석"
   ],
   "여행계획": [
    "ok",
    "확정",
    "왕복 발권"
   ],
   "체재능력": [
    "ok",
    "충분",
    "법인카드·숙박 선결제"
   ],
   "국내관계": [
    "ok",
    "확인",
    "숙박정보 일치"
   ]
  },
  "required": [
   "QUESTION_purpose",
   "QUESTION_return",
   "QUESTION_agenda"
  ],
  "resolution": {
   "type": "CLEAR",
   "reason": null
  },
  "difficulty": "초급",
  "note": "정상 입국자. 지나친 조사 자체가 감점 요소.",
  "travelerId": "TRV-0001",
  "displayNameKo": "로버트 밴스",
  "clues": [
   {
    "id": "rv1",
    "trigger": "INIT",
    "title": "입국기반",
    "text": "미국 일반여권 단기방문 기반. K-ETA 한시면제.",
    "kind": "context",
    "key": false
   },
   {
    "id": "rv2",
    "trigger": "QUESTION_purpose",
    "title": "활동 범위",
    "text": "회의·컨퍼런스 참석이며 국내 취업·급여 수령 진술 없음.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "rv3",
    "trigger": "QUESTION_agenda",
    "title": "일정 일치",
    "text": "행사 일정과 업체 미팅 일정이 체류기간 안에서 구체적으로 설명됨.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "rv4",
    "trigger": "LOOKUP_public",
    "title": "외부 확인",
    "text": "행사 개최정보와 등록자료가 일치함.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "rv5",
    "trigger": "QUESTION_samples",
    "title": "업무물품",
    "text": "노트북·브로슈어는 있으나 생산·설치 업무를 시사하는 물품은 없음.",
    "kind": "low",
    "key": false
   },
   {
    "id": "rv6",
    "trigger": "LOOKUP_pnr",
    "title": "귀국 의사",
    "text": "귀국편 발권·좌석 확약.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "rv7",
    "trigger": "QUESTION_sponsor",
    "title": "체재능력",
    "text": "출장비 본사 부담 진술과 법인카드 자료가 일치함.",
    "kind": "confirm",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S1-002",
  "shift": 1,
  "name": "MIO TANAKA",
  "nat": "일본",
  "code": "JPN",
  "sex": "F",
  "dob": "1998-03-12",
  "passport": "TR4928301",
  "purpose": "개인 관광",
  "stay": "4일",
  "arrival": "OZ101 · NRT → ICN",
  "return": "OZ102 · ICN → NRT",
  "carrier": "아시아나항공",
  "basis": "지정 무사증 · 단기방문",
  "basisDetail": "일반여권 · 90일 이내 · K-ETA 한시면제(2026.12.31까지)",
  "eta": "한시면제",
  "arrivalCard": "전자입국신고 제출",
  "visa": "사증 불요",
  "watch": "이상 없음",
  "bio": "일치 99.1%",
  "chip": "정상",
  "risk": "LOW",
  "initial": "친구와 서울 여행을 왔습니다. 홍대와 성수에 갈 예정입니다.",
  "questions": [
   {
    "id": "purpose",
    "cat": "기본사항",
    "q": "이번 여행 목적이 무엇입니까?",
    "a": "친구와 관광입니다. 쇼핑하고 카페에 갈 예정입니다.",
    "reveal": "purpose"
   },
   {
    "id": "hotel",
    "cat": "여행·체류",
    "q": "숙박지는 어디입니까?",
    "a": "명동의 호텔입니다. 예약 확인서가 있습니다.",
    "reveal": "stay"
   },
   {
    "id": "return",
    "cat": "여행·체류",
    "q": "일본으로 돌아가는 일정은 언제입니까?",
    "a": "4일 뒤 OZ102편입니다.",
    "reveal": "travel"
   },
   {
    "id": "companion",
    "cat": "국내관계",
    "q": "함께 여행하는 친구는 누구이며 같은 일정입니까?",
    "a": "일본인 대학 친구 유키입니다. 같은 항공편으로 입국했고 같은 호텔에 묵습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_purpose"
    ]
   },
   {
    "id": "friendKorea",
    "cat": "국내관계",
    "q": "한국에서 만날 지인이 있습니까?",
    "a": "서울에 교환학생으로 있는 친구를 하루 만날 예정입니다. 숙박이나 비용을 의존하지는 않습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_companion"
    ]
   },
   {
    "id": "budget",
    "cat": "재정",
    "q": "여행경비는 어떻게 준비했습니까?",
    "a": "해외결제 카드와 약간의 현금을 가지고 있고 숙박은 결제했습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_hotel"
    ]
   },
   {
    "id": "study",
    "cat": "추가소명",
    "q": "한국에서 수업이나 장기 체류 계획이 있습니까?",
    "a": "없습니다. 다음 주부터 일본에서 수업이 시작해서 돌아가야 합니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_return"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "MIO TANAKA"
     ],
     [
      "국적",
      "JAPAN"
     ],
     [
      "여권번호",
      "TR4928301"
     ],
     [
      "만료일",
      "2032-11-19"
     ],
     [
      "전자칩",
      "VALID"
     ],
     [
      "MRZ",
      "VALID"
     ]
    ]
   },
   {
    "t": "전자입국신고",
    "k": "E-ARRIVAL",
    "fields": [
     [
      "신고상태",
      "제출 완료"
     ],
     [
      "목적",
      "TOURISM"
     ],
     [
      "체류지",
      "Myeongdong Hotel"
     ],
     [
      "체류기간",
      "4 DAYS"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "입국",
      "OZ101"
     ],
     [
      "출국",
      "OZ102"
     ],
     [
      "상태",
      "TICKETED"
     ]
    ]
   },
   {
    "t": "호텔 바우처",
    "k": "HOTEL",
    "fields": [
     [
      "투숙객",
      "MIO TANAKA"
     ],
     [
      "기간",
      "2026-09-05 ~ 09-09"
     ],
     [
      "상태",
      "PAID"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "정상",
    "과거 단기 관광 2회, 모두 기간 내 출국."
   ],
   "visa": [
    "정상",
    "일본 일반여권 지정 무사증 대상. 90일 이내 관광 목적."
   ],
   "pnr": [
    "정상",
    "왕복 여정과 신고 체류기간 일치."
   ],
   "contact": [
    "정상",
    "호텔 예약자료 확인."
   ],
   "public": [
    "정상",
    "특이사항 없음."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "여권·생체정보 일치"
   ],
   "입국자격": [
    "ok",
    "충족",
    "무사증 요건 확인"
   ],
   "입국목적": [
    "ok",
    "일치",
    "개인 관광"
   ],
   "여행계획": [
    "ok",
    "확정",
    "왕복 발권"
   ],
   "체재능력": [
    "ok",
    "충분",
    "숙박 선결제"
   ],
   "국내관계": [
    "ok",
    "확인",
    "호텔 예약 일치"
   ]
  },
  "required": [
   "QUESTION_purpose",
   "QUESTION_companion"
  ],
  "resolution": {
   "type": "CLEAR",
   "reason": null
  },
  "difficulty": "초급",
  "note": "정상 관광객. 빨리 정확하게 처리하는 것이 목표.",
  "travelerId": "TRV-0002",
  "displayNameKo": "미오 다나카",
  "clues": [
   {
    "id": "mt1",
    "trigger": "INIT",
    "title": "여행 형태",
    "text": "4일 개인관광으로 신고.",
    "kind": "context",
    "key": false
   },
   {
    "id": "mt2",
    "trigger": "QUESTION_companion",
    "title": "동행자 확인",
    "text": "동행자와 같은 입국·숙박 일정.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "mt3",
    "trigger": "QUESTION_friendKorea",
    "title": "국내 지인",
    "text": "한국 지인을 만나지만 숙박·생계 의존관계는 아님.",
    "kind": "low",
    "key": false
   },
   {
    "id": "mt4",
    "trigger": "LOOKUP_pnr",
    "title": "왕복 일정",
    "text": "4일 체류와 왕복 발권이 일치함.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "mt5",
    "trigger": "LOOKUP_contact",
    "title": "호텔 확인",
    "text": "예약자료에 본인과 동행자 정보가 확인됨.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "mt6",
    "trigger": "QUESTION_study",
    "title": "귀국 필요성",
    "text": "일본 내 학업 일정으로 단기체류 설명과 부합.",
    "kind": "confirm",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S1-003",
  "shift": 1,
  "name": "JULIAN PARK",
  "nat": "캐나다",
  "code": "CAN",
  "sex": "M",
  "dob": "1991-06-30",
  "passport": "HG2918402",
  "purpose": "국내 체류지로 복귀",
  "stay": "장기체류",
  "arrival": "AC061 · YYZ → ICN",
  "return": "—",
  "carrier": "에어캐나다",
  "basis": "외국인등록증 소지자 재입국",
  "basisDetail": "유효한 외국인등록증 및 체류기간 내 재입국",
  "eta": "해당 없음",
  "arrivalCard": "신고 제외",
  "visa": "등록체류자격 F-2",
  "watch": "이상 없음",
  "bio": "일치 99.7%",
  "chip": "정상",
  "risk": "LOW",
  "initial": "캐나다에 가족 방문을 다녀왔고 서울 집으로 돌아가는 길입니다.",
  "questions": [
   {
    "id": "residence",
    "cat": "기본사항",
    "q": "국내 체류자격과 등록증을 제시해 주십시오.",
    "a": "F-2 외국인등록증입니다. 체류기간은 내년까지입니다.",
    "reveal": "basis"
   },
   {
    "id": "address",
    "cat": "여행·체류",
    "q": "현재 국내 체류지는 어디입니까?",
    "a": "서울 마포구이고 기존 신고 주소와 같습니다.",
    "reveal": "stay"
   },
   {
    "id": "expiry",
    "cat": "기본사항",
    "q": "등록증과 체류기간 만료일을 확인하겠습니다.",
    "a": "체류기간은 2027년 6월까지입니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_residence"
    ]
   },
   {
    "id": "trip",
    "cat": "여행·체류",
    "q": "캐나다에는 어떤 목적으로 다녀왔습니까?",
    "a": "가족 행사 때문에 18일 다녀왔습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_residence"
    ]
   },
   {
    "id": "job",
    "cat": "직업",
    "q": "현재 국내 활동과 직업은 무엇입니까?",
    "a": "서울의 게임회사에서 기획 업무를 하고 있습니다. 등록된 체류자격 범위 내 활동입니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_expiry"
    ]
   },
   {
    "id": "keta",
    "cat": "추가소명",
    "q": "K-ETA를 제출하지 않은 이유를 알고 있습니까?",
    "a": "등록외국인이라 이번 귀국에는 K-ETA가 필요하지 않는 것으로 알고 있습니다.",
    "reveal": "depth",
    "requires": [
     "LOOKUP_visa"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "JULIAN PARK"
     ],
     [
      "국적",
      "CANADA"
     ],
     [
      "여권번호",
      "HG2918402"
     ],
     [
      "전자칩",
      "VALID"
     ]
    ]
   },
   {
    "t": "외국인등록증",
    "k": "RESIDENCE CARD",
    "fields": [
     [
      "체류자격",
      "F-2"
     ],
     [
      "체류기간",
      "2027-04-14"
     ],
     [
      "등록상태",
      "VALID"
     ],
     [
      "체류지",
      "SEOUL MAPO-GU"
     ]
    ]
   },
   {
    "t": "입국편",
    "k": "BOARDING",
    "fields": [
     [
      "편명",
      "AC061"
     ],
     [
      "출발",
      "TORONTO"
     ],
     [
      "도착",
      "INCHEON"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "정상",
    "등록외국인 체류기록 정상. 출국기간 18일."
   ],
   "visa": [
    "정상",
    "유효 외국인등록증 및 체류기간 확인. 전자입국신고 제외 대상."
   ],
   "pnr": [
    "정상",
    "캐나다 방문 후 귀국 여정."
   ],
   "contact": [
    "정상",
    "등록 체류지 변경 없음."
   ],
   "public": [
    "정상",
    "조회 필요 정보 없음."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "등록정보·여권 일치"
   ],
   "입국자격": [
    "ok",
    "충족",
    "등록외국인 재입국"
   ],
   "입국목적": [
    "ok",
    "일치",
    "국내 체류 복귀"
   ],
   "여행계획": [
    "ok",
    "확인",
    "단기 해외방문"
   ],
   "체재능력": [
    "ok",
    "해당없음",
    "등록체류자"
   ],
   "국내관계": [
    "ok",
    "확인",
    "등록 체류지"
   ]
  },
  "required": [
   "QUESTION_residence",
   "QUESTION_expiry"
  ],
  "resolution": {
   "type": "CLEAR",
   "reason": null
  },
  "difficulty": "초급",
  "note": "국적보다 등록체류자격이 핵심인 케이스.",
  "travelerId": "TRV-0003",
  "displayNameKo": "줄리언 박",
  "clues": [
   {
    "id": "jp1",
    "trigger": "INIT",
    "title": "핵심 쟁점",
    "text": "캐나다 국적보다 유효한 국내 등록체류자격이 핵심.",
    "kind": "context",
    "key": false
   },
   {
    "id": "jp2",
    "trigger": "QUESTION_expiry",
    "title": "등록상태",
    "text": "등록증·체류기간 유효.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "jp3",
    "trigger": "LOOKUP_history",
    "title": "출국기간",
    "text": "18일 해외방문 후 재입국, 체류위반 없음.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "jp4",
    "trigger": "QUESTION_keta",
    "title": "K-ETA 미제출",
    "text": "등록외국인의 재입국 맥락에서 K-ETA 미제출 자체는 이상징후가 아님.",
    "kind": "low",
    "key": false
   },
   {
    "id": "jp5",
    "trigger": "LOOKUP_contact",
    "title": "주소 일치",
    "text": "기존 신고 주소와 현재 진술이 일치함.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "jp6",
    "trigger": "QUESTION_job",
    "title": "국내 활동",
    "text": "현재 체류자격 범위 내 활동으로 설명됨.",
    "kind": "confirm",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S1-004",
  "shift": 1,
  "name": "NGUYEN THI LAN",
  "nat": "베트남",
  "code": "VNM",
  "sex": "F",
  "dob": "1987-09-03",
  "passport": "C49011823",
  "purpose": "기업 미팅",
  "stay": "5일",
  "arrival": "VN414 · HAN → ICN",
  "return": "VN415 · ICN → HAN",
  "carrier": "베트남항공",
  "basis": "APEC 기업인여행카드(ABTC)",
  "basisDetail": "유효 ABTC · KOR 승인 표시 · 단기상용(C-3-4) 90일",
  "eta": "해당 없음",
  "arrivalCard": "전자입국신고 대상",
  "visa": "ABTC 기반 사증면제",
  "watch": "이상 없음",
  "bio": "일치 98.9%",
  "chip": "정상",
  "risk": "LOW",
  "initial": "한국 거래처와 신규 공급계약 미팅을 위해 왔습니다.",
  "questions": [
   {
    "id": "abtc",
    "cat": "기본사항",
    "q": "ABTC와 여권 정보가 일치합니까?",
    "a": "네. 여권번호와 성명 모두 같습니다. 카드에 KOR 승인도 있습니다.",
    "reveal": "basis"
   },
   {
    "id": "business",
    "cat": "국내관계",
    "q": "방문할 국내 업체와 업무 내용을 설명해 주십시오.",
    "a": "수원 소재 전자부품 회사와 공급계약 미팅입니다.",
    "reveal": "purpose"
   },
   {
    "id": "return",
    "cat": "여행·체류",
    "q": "출국 일정은 언제입니까?",
    "a": "5일 뒤 하노이로 돌아갑니다.",
    "reveal": "travel"
   },
   {
    "id": "kor",
    "cat": "기본사항",
    "q": "ABTC의 KOR 승인과 유효기간을 확인하겠습니다.",
    "a": "KOR 승인이 있고 카드 유효기간도 남아 있습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_abtc"
    ]
   },
   {
    "id": "agenda",
    "cat": "국내관계",
    "q": "이번 미팅의 구체적인 일정과 담당자를 설명해 주십시오.",
    "a": "수원 거래처에서 이틀간 계약조건과 품질기준을 검토합니다. 담당자는 박재현 차장입니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_business"
    ]
   },
   {
    "id": "pay",
    "cat": "직업",
    "q": "한국 업체에서 직접 급여·수당을 받거나 현장 근로를 합니까?",
    "a": "아닙니다. 베트남 회사 소속이고 출장비도 본사에서 지급됩니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_agenda"
    ]
   },
   {
    "id": "samples",
    "cat": "추가소명",
    "q": "수하물에 제품 샘플이 있습니까?",
    "a": "작은 전자부품 샘플 몇 개가 있습니다. 계약 미팅용이고 판매 목적은 아닙니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_agenda"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "NGUYEN THI LAN"
     ],
     [
      "국적",
      "VIET NAM"
     ],
     [
      "여권번호",
      "C49011823"
     ]
    ]
   },
   {
    "t": "ABTC",
    "k": "ABTC",
    "fields": [
     [
      "여권번호",
      "C49011823"
     ],
     [
      "승인국",
      "KOR"
     ],
     [
      "유효기간",
      "2028-01-22"
     ],
     [
      "상태",
      "VALID"
     ]
    ]
   },
   {
    "t": "출장 일정",
    "k": "BUSINESS",
    "fields": [
     [
      "업체",
      "SUWON COMPONENTS CO."
     ],
     [
      "일정",
      "2026-09-06 ~ 09-09"
     ],
     [
      "업무",
      "SUPPLY MEETING"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "왕복",
      "VN414 / VN415"
     ],
     [
      "상태",
      "TICKETED"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "정상",
    "ABTC 이용 단기상용 입국 3회, 모두 기간 내 출국."
   ],
   "visa": [
    "정상",
    "ABTC 인적사항·여권번호 일치, KOR 승인 확인."
   ],
   "pnr": [
    "정상",
    "왕복 발권 완료."
   ],
   "contact": [
    "정상",
    "국내 업체 대표번호·담당자 확인."
   ],
   "public": [
    "정상",
    "해당 업체 법인 공개정보 확인."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "여권·ABTC 일치"
   ],
   "입국자격": [
    "ok",
    "충족",
    "ABTC KOR 승인"
   ],
   "입국목적": [
    "ok",
    "일치",
    "단기상용 미팅"
   ],
   "여행계획": [
    "ok",
    "확정",
    "5일 왕복"
   ],
   "체재능력": [
    "ok",
    "충분",
    "회사 출장"
   ],
   "국내관계": [
    "ok",
    "확인",
    "거래처 확인"
   ]
  },
  "required": [
   "QUESTION_abtc",
   "LOOKUP_visa",
   "QUESTION_kor",
   "QUESTION_pay"
  ],
  "resolution": {
   "type": "CLEAR",
   "reason": null
  },
  "difficulty": "초급",
  "note": "베트남 국적이지만 ABTC라는 별도 입국 기반이 핵심.",
  "travelerId": "TRV-0006",
  "displayNameKo": "응우옌 티 란",
  "clues": [
   {
    "id": "nl1",
    "trigger": "QUESTION_abtc",
    "title": "카드-여권 일치",
    "text": "ABTC 인적사항과 여권번호 일치.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "nl2",
    "trigger": "QUESTION_kor",
    "title": "KOR 승인",
    "text": "ABTC KOR 승인·유효기간 확인.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "nl3",
    "trigger": "LOOKUP_contact",
    "title": "초청사 확인",
    "text": "거래처 담당자와 미팅 일정 확인.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "nl4",
    "trigger": "QUESTION_pay",
    "title": "활동 성격",
    "text": "국내 취업·급여 수령이 아니라 단기상용 회의로 설명됨.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "nl5",
    "trigger": "QUESTION_samples",
    "title": "부품 샘플",
    "text": "샘플 소지는 주의요소지만 그 자체로 취업·불허 근거가 되지 않음.",
    "kind": "low",
    "key": false
   },
   {
    "id": "nl6",
    "trigger": "LOOKUP_pnr",
    "title": "체류기간",
    "text": "5일 왕복 여정 일치.",
    "kind": "confirm",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S2-005",
  "shift": 2,
  "name": "TRAN VAN MINH",
  "nat": "베트남",
  "code": "VNM",
  "sex": "M",
  "dob": "1999-04-19",
  "passport": "B80219464",
  "purpose": "관광 및 명동 쇼핑",
  "stay": "30일",
  "arrival": "VN416 · HAN → ICN",
  "return": "없음",
  "carrier": "베트남항공",
  "basis": "단기일반 관광사증",
  "basisDetail": "C-3-9 단수사증 · 30일",
  "eta": "사증소지자 해당 없음",
  "arrivalCard": "전자입국신고 제출",
  "visa": "C-3-9 · VALID",
  "watch": "입국규제 없음",
  "bio": "일치 98.8%",
  "chip": "정상",
  "risk": "REVIEW",
  "initial": "관광하러 왔습니다. 명동에서 쇼핑하고 한 달 정도 머물 예정입니다.",
  "questions": [
   {
    "id": "purpose",
    "cat": "기본사항",
    "q": "30일 동안 구체적으로 무엇을 할 예정입니까?",
    "a": "쇼핑하고 관광합니다. 자세한 일정은 아직 없습니다.",
    "reveal": "purpose"
   },
   {
    "id": "return",
    "cat": "여행·체류",
    "q": "귀국 항공권이 없는 이유는 무엇입니까?",
    "a": "나중에 필요할 때 사려고 합니다.",
    "reveal": "travel"
   },
   {
    "id": "funds",
    "cat": "재정",
    "q": "현재 체재비와 결제수단은 얼마입니까?",
    "a": "현금 15만원 정도 있습니다. 카드 잔액은 잘 모르겠습니다.",
    "reveal": "funds"
   },
   {
    "id": "contact",
    "cat": "국내관계",
    "q": "국내 연락처 010-0000-0202는 누구입니까?",
    "a": "친구의 친구입니다. 정확한 이름은 모릅니다.",
    "reveal": "contact"
   },
   {
    "id": "phone",
    "cat": "추가소명",
    "q": "귀국편·숙소·초청관계를 확인할 수 있는 휴대전화 자료를 자발적으로 보여주시겠습니까?",
    "a": "휴대전화는 보여주고 싶지 않습니다.",
    "reveal": "phone"
   },
   {
    "id": "occupation",
    "cat": "직업",
    "q": "베트남에서 현재 하는 일과 소득원을 설명해 주십시오.",
    "a": "최근 일을 그만뒀습니다. 새 일자리를 알아보고 있습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_purpose"
    ]
   },
   {
    "id": "addressOwner",
    "cat": "국내관계",
    "q": "신고한 구로구 주택의 거주자는 누구입니까?",
    "a": "아까 말한 친구의 친구가 산다고 들었습니다. 이름은 잘 모릅니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_contact"
    ],
    "contradiction": true
   },
   {
    "id": "jobOffer",
    "cat": "추가소명",
    "q": "한국에서 일자리나 면접을 알아본 적이 있습니까?",
    "a": "온라인에서 공장 일이 있다는 글을 본 적은 있지만 일을 하기로 정한 것은 아닙니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_occupation",
     "LOOKUP_contact"
    ]
   },
   {
    "id": "returnMoney",
    "cat": "재정",
    "q": "귀국 항공권을 나중에 살 비용은 어떻게 마련합니까?",
    "a": "한국에 있는 동안 돈이 생기면 살 생각도 했습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_funds"
    ],
    "contradiction": true
   },
   {
    "id": "host",
    "cat": "국내관계",
    "q": "국내 연락처와 처음 어떻게 알게 되었습니까?",
    "a": "SNS 단체방에서 소개받았습니다. 직접 만난 적은 없습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_addressOwner"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "TRAN VAN MINH"
     ],
     [
      "국적",
      "VIET NAM"
     ],
     [
      "여권번호",
      "B80219464"
     ],
     [
      "전자칩",
      "VALID"
     ]
    ]
   },
   {
    "t": "사증",
    "k": "VISA",
    "fields": [
     [
      "체류자격",
      "C-3-9"
     ],
     [
      "입국횟수",
      "SINGLE"
     ],
     [
      "체류기간",
      "30 DAYS"
     ],
     [
      "상태",
      "VALID"
     ]
    ]
   },
   {
    "t": "전자입국신고",
    "k": "E-ARRIVAL",
    "fields": [
     [
      "목적",
      "TOURISM"
     ],
     [
      "체류지",
      "구로구 개인주택"
     ],
     [
      "연락처",
      "010-0000-0202"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "입국",
      "VN416"
     ],
     [
      "귀국편",
      "NONE"
     ],
     [
      "예약형태",
      "ONE-WAY"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "주의",
    "첫 대한민국 입국. 직접적인 위반 이력은 없음."
   ],
   "visa": [
    "정상",
    "C-3-9 단수사증 문서 유효. 사증 유효성은 입국허가 자체를 보장하지 않음."
   ],
   "pnr": [
    "주의",
    "편도 발권. 연결·귀국 예약 없음."
   ],
   "contact": [
    "경고",
    "SIM 데이터: 동일 번호가 과거 복수의 불법취업 알선 사건 관련 연락처로 반복 등장."
   ],
   "public": [
    "주의",
    "신고 체류지는 숙박업소가 아닌 개인주택. 숙소제공 관계 소명되지 않음."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "여권·사증 일치"
   ],
   "입국자격": [
    "ok",
    "문서유효",
    "C-3-9 자체는 유효"
   ],
   "입국목적": [
    "warn",
    "미해결",
    "관광 일정 구체성 부족"
   ],
   "여행계획": [
    "warn",
    "부족",
    "귀국편 없음"
   ],
   "체재능력": [
    "warn",
    "취약",
    "30일 대비 체재비 부족"
   ],
   "국내관계": [
    "warn",
    "미해결",
    "연락처 관계 불명"
   ]
  },
  "required": [
   "SECONDARY",
   "QUESTION_return",
   "QUESTION_funds",
   "QUESTION_contact",
   "LOOKUP_contact",
   "LOOKUP_pnr",
   "QUESTION_occupation",
   "QUESTION_addressOwner",
   "QUESTION_jobOffer"
  ],
  "resolution": {
   "type": "REFUSE",
   "reason": "SIM-A12-PUR"
  },
  "difficulty": "중급",
  "note": "휴대전화 거부 자체가 아니라 전체 소명자료를 종합하여 판단.",
  "travelerId": "TRV-0005",
  "displayNameKo": "쩐 반 민",
  "clues": [
   {
    "id": "tm1",
    "trigger": "LOOKUP_visa",
    "title": "사증 유효",
    "text": "C-3-9 문서 자체는 유효하며 사증 유효성만으로 입국허가가 확정되지는 않음.",
    "kind": "context",
    "key": false
   },
   {
    "id": "tm2",
    "trigger": "QUESTION_return",
    "title": "귀국편 부재",
    "text": "30일 체류 주장이나 귀국 예약 없음.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "tm3",
    "trigger": "QUESTION_funds",
    "title": "체재능력",
    "text": "현금 15만원, 카드 사용가능액 소명 못함.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "tm4",
    "trigger": "LOOKUP_contact",
    "title": "연락처 이상",
    "text": "동일 번호가 가상 사건DB의 불법취업 알선 연락처와 반복 연결.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "tm5",
    "trigger": "QUESTION_addressOwner",
    "title": "숙소 관계 모순",
    "text": "체류지 제공자의 이름·관계를 설명하지 못함.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "tm6",
    "trigger": "QUESTION_jobOffer",
    "title": "취업 관련 정보",
    "text": "한국 공장 일자리 정보를 찾아본 사실을 인정.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "tm7",
    "trigger": "QUESTION_returnMoney",
    "title": "귀국비용 진술",
    "text": "한국 체류 중 돈을 마련해 귀국편을 사겠다는 진술로 관광 목적 설명과 긴장 발생.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "tm8",
    "trigger": "QUESTION_phone",
    "title": "휴대전화 임의제시 거부",
    "text": "제시 거부 자체는 독립 불허사유가 아니며 다른 소명자료와 함께 평가해야 함.",
    "kind": "context",
    "key": false
   },
   {
    "id": "tm9",
    "trigger": "LOOKUP_history",
    "title": "초회 입국",
    "text": "직접적인 과거 위반 이력은 없음.",
    "kind": "low",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S2-006",
  "shift": 2,
  "name": "SITI RAHMA",
  "nat": "인도네시아",
  "code": "IDN",
  "sex": "F",
  "dob": "1995-02-10",
  "passport": "E71029411",
  "purpose": "개인 관광",
  "stay": "7일",
  "arrival": "GA878 · CGK → ICN",
  "return": "GA879 · ICN → CGK",
  "carrier": "가루다인도네시아",
  "basis": "단기 관광사증",
  "basisDetail": "C-3-9 복수사증 · 유효기간 내",
  "eta": "해당 없음",
  "arrivalCard": "전자입국신고 제출",
  "visa": "C-3-9 · MULTIPLE · VALID",
  "watch": "이상 없음",
  "bio": "일치 99.0%",
  "chip": "정상",
  "risk": "REVIEW",
  "initial": "서울과 부산을 여행합니다. 호텔은 친구가 대신 예약해 줬습니다.",
  "questions": [
   {
    "id": "hotel",
    "cat": "여행·체류",
    "q": "호텔 예약자가 본인이 아닌 이유는 무엇입니까?",
    "a": "같이 여행하는 친구가 두 사람 숙소를 한 번에 예약했습니다.",
    "reveal": "stay"
   },
   {
    "id": "friend",
    "cat": "국내관계",
    "q": "동행 친구의 성명과 입국편을 알려주십시오.",
    "a": "Nadia Putri이고 같은 GA878편입니다.",
    "reveal": "contact"
   },
   {
    "id": "return",
    "cat": "여행·체류",
    "q": "귀국 항공권을 제시해 주십시오.",
    "a": "GA879편으로 일주일 뒤 돌아갑니다.",
    "reveal": "travel"
   },
   {
    "id": "funds",
    "cat": "재정",
    "q": "여행경비는 어떻게 준비했습니까?",
    "a": "해외사용 카드와 현금이 있습니다.",
    "reveal": "funds"
   },
   {
    "id": "bookingName",
    "cat": "여행·체류",
    "q": "호텔 예약 확인서의 대표 예약자는 누구입니까?",
    "a": "Nadia Putri입니다. 저도 동반 투숙객으로 등록돼 있습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_hotel"
    ]
   },
   {
    "id": "separateFunds",
    "cat": "재정",
    "q": "친구와 별도로 본인 여행경비도 보유하고 있습니까?",
    "a": "네. 제 카드와 현금이 따로 있습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_funds"
    ]
   },
   {
    "id": "itinerary",
    "cat": "여행·체류",
    "q": "서울·부산 이동 일정은 어떻게 됩니까?",
    "a": "서울 3박 뒤 KTX로 부산에 가서 3박하고 인천에서 출국합니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_friend"
    ]
   },
   {
    "id": "work",
    "cat": "직업",
    "q": "한국에서 일하거나 보수를 받을 계획이 있습니까?",
    "a": "없습니다. 인도네시아 회사로 복귀해야 합니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_itinerary"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "SITI RAHMA"
     ],
     [
      "국적",
      "INDONESIA"
     ],
     [
      "여권번호",
      "E71029411"
     ]
    ]
   },
   {
    "t": "사증",
    "k": "VISA",
    "fields": [
     [
      "체류자격",
      "C-3-9"
     ],
     [
      "종류",
      "MULTIPLE"
     ],
     [
      "상태",
      "VALID"
     ]
    ]
   },
   {
    "t": "호텔 바우처",
    "k": "HOTEL",
    "fields": [
     [
      "예약자",
      "NADIA PUTRI"
     ],
     [
      "투숙객",
      "NADIA PUTRI + SITI RAHMA"
     ],
     [
      "기간",
      "7 NIGHTS"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "입국",
      "GA878"
     ],
     [
      "출국",
      "GA879"
     ],
     [
      "동반예약",
      "NADIA PUTRI"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "정상",
    "과거 한국 단기관광 1회, 기간 내 출국."
   ],
   "visa": [
    "정상",
    "C-3-9 복수사증 유효."
   ],
   "pnr": [
    "정상",
    "친구와 동일 예약번호, 왕복 발권 확인."
   ],
   "contact": [
    "정상",
    "호텔 투숙객 명단에 본인 성명 포함."
   ],
   "public": [
    "정상",
    "호텔 영업정보 정상."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "여권·사증 일치"
   ],
   "입국자격": [
    "ok",
    "충족",
    "C-3-9 유효"
   ],
   "입국목적": [
    "warn",
    "확인필요",
    "제3자 예약으로 추가 확인 필요"
   ],
   "여행계획": [
    "warn",
    "확인필요",
    "동행관계 확인 전"
   ],
   "체재능력": [
    "ok",
    "충분",
    "카드·현금"
   ],
   "국내관계": [
    "warn",
    "확인필요",
    "예약자와 관계 확인"
   ]
  },
  "required": [
   "SECONDARY",
   "QUESTION_friend",
   "LOOKUP_pnr",
   "LOOKUP_contact",
   "QUESTION_bookingName",
   "QUESTION_itinerary"
  ],
  "resolution": {
   "type": "CLEAR"
  },
  "difficulty": "중급",
  "note": "수상해 보이지만 재심 확인 후 소명되는 정상 케이스.",
  "travelerId": "TRV-0008",
  "displayNameKo": "시티 라흐마",
  "clues": [
   {
    "id": "sr1",
    "trigger": "QUESTION_hotel",
    "title": "타인 명의 예약",
    "text": "예약자가 친구라 처음에는 추가 확인 필요.",
    "kind": "unresolved",
    "key": false
   },
   {
    "id": "sr2",
    "trigger": "QUESTION_bookingName",
    "title": "동반투숙 등록",
    "text": "본인이 호텔 투숙객 명단에 포함됨.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "sr3",
    "trigger": "LOOKUP_pnr",
    "title": "동일 예약",
    "text": "친구와 동일 예약번호·왕복 여정 확인.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "sr4",
    "trigger": "LOOKUP_contact",
    "title": "숙박 확인",
    "text": "호텔에서 두 사람 모두 투숙예정자로 확인.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "sr5",
    "trigger": "QUESTION_itinerary",
    "title": "구체적 일정",
    "text": "서울-부산-인천 일정이 항공·숙박자료와 일치.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "sr6",
    "trigger": "QUESTION_separateFunds",
    "title": "독립 체재능력",
    "text": "본인 결제수단 별도 보유.",
    "kind": "confirm",
    "key": false
   },
   {
    "id": "sr7",
    "trigger": "LOOKUP_public",
    "title": "호텔 정상",
    "text": "예약 호텔의 영업정보 정상.",
    "kind": "low",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S2-007",
  "shift": 2,
  "name": "MARIA SANTOS",
  "nat": "필리핀",
  "code": "PHL",
  "sex": "F",
  "dob": "1993-12-01",
  "passport": "P62491082",
  "purpose": "관광",
  "stay": "10일",
  "arrival": "PR468 · MNL → ICN",
  "return": "PR469 · ICN → MNL",
  "carrier": "필리핀항공",
  "basis": "단기 관광사증",
  "basisDetail": "C-3-9 단수사증 · 15일",
  "eta": "해당 없음",
  "arrivalCard": "전자입국신고 제출",
  "visa": "C-3-9 · VALID",
  "watch": "이상 없음",
  "bio": "일치 98.5%",
  "chip": "정상",
  "risk": "REVIEW",
  "initial": "친구와 관광하러 왔고 강남 호텔에 묵습니다.",
  "questions": [
   {
    "id": "hotel",
    "cat": "여행·체류",
    "q": "강남 호텔 예약 확인서를 보여주십시오.",
    "a": "예약서를 지금 찾을 수 없습니다. 친구가 예약했습니다.",
    "reveal": "stay"
   },
   {
    "id": "friend",
    "cat": "국내관계",
    "q": "친구의 성명과 연락처를 알려주십시오.",
    "a": "한국에서 알게 된 사람인데 이름은 Alex라고만 압니다.",
    "reveal": "contact"
   },
   {
    "id": "work",
    "cat": "직업",
    "q": "현재 본국에서 하는 일은 무엇입니까?",
    "a": "지금은 일을 쉬고 있습니다. 한국에서는 마사지샵에서 잠깐 도와줄 수도 있습니다.",
    "reveal": "purpose"
   },
   {
    "id": "funds",
    "cat": "재정",
    "q": "여행경비는 얼마입니까?",
    "a": "약 20만원과 카드가 있는데 카드 한도는 모릅니다.",
    "reveal": "funds"
   },
   {
    "id": "hotelName",
    "cat": "여행·체류",
    "q": "예약했다고 한 호텔의 정확한 상호와 주소를 말해 주십시오.",
    "a": "강남 쪽이라고만 들었습니다. 정확한 이름은 기억나지 않습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_hotel"
    ],
    "contradiction": true
   },
   {
    "id": "alex",
    "cat": "국내관계",
    "q": "Alex의 성명·국적·관계·연락 경위를 설명해 주십시오.",
    "a": "SNS에서 알게 됐고 본명은 잘 모릅니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_friend"
    ],
    "contradiction": true
   },
   {
    "id": "massage",
    "cat": "직업",
    "q": "마사지샵에서 “도와준다”는 것이 어떤 활동입니까?",
    "a": "손님 응대나 마사지 일을 조금 할 수도 있습니다. 돈은 상황을 봐서 받을 수 있습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_work"
    ],
    "contradiction": true
   },
   {
    "id": "returnPlan",
    "cat": "여행·체류",
    "q": "왕복표가 있는데 예정대로 귀국할 계획입니까?",
    "a": "일이 잘 되면 조금 더 있고 싶습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_massage"
    ],
    "contradiction": true
   },
   {
    "id": "sponsor",
    "cat": "재정",
    "q": "한국 체류비를 누가 부담합니까?",
    "a": "Alex가 일부 도와준다고 했습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_alex"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "MARIA SANTOS"
     ],
     [
      "국적",
      "PHILIPPINES"
     ],
     [
      "여권번호",
      "P62491082"
     ]
    ]
   },
   {
    "t": "사증",
    "k": "VISA",
    "fields": [
     [
      "체류자격",
      "C-3-9"
     ],
     [
      "체류기간",
      "15 DAYS"
     ],
     [
      "상태",
      "VALID"
     ]
    ]
   },
   {
    "t": "전자입국신고",
    "k": "E-ARRIVAL",
    "fields": [
     [
      "목적",
      "TOURISM"
     ],
     [
      "체류지",
      "GANGNAM HOTEL"
     ],
     [
      "연락처",
      "010-0000-0707"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "입국",
      "PR468"
     ],
     [
      "출국",
      "PR469"
     ],
     [
      "상태",
      "TICKETED"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "주의",
    "과거 한국 방문 없음."
   ],
   "visa": [
    "정상",
    "C-3-9 사증 자체는 유효."
   ],
   "pnr": [
    "정상",
    "왕복 항공권 발권됨."
   ],
   "contact": [
    "경고",
    "기재된 호텔명·연락처로 예약 확인 불가. 연락처는 개인 휴대전화."
   ],
   "public": [
    "경고",
    "신고한 호텔 상호가 주소지에서 확인되지 않음."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "신원 일치"
   ],
   "입국자격": [
    "ok",
    "문서유효",
    "C-3-9 유효"
   ],
   "입국목적": [
    "warn",
    "미해결",
    "취업 가능성 언급"
   ],
   "여행계획": [
    "ok",
    "확정",
    "왕복 발권"
   ],
   "체재능력": [
    "warn",
    "취약",
    "경비 소명 부족"
   ],
   "국내관계": [
    "warn",
    "충돌",
    "숙소·연락처 확인 불가"
   ]
  },
  "required": [
   "SECONDARY",
   "QUESTION_work",
   "QUESTION_friend",
   "LOOKUP_contact",
   "LOOKUP_public",
   "QUESTION_hotelName",
   "QUESTION_massage"
  ],
  "resolution": {
   "type": "REFUSE",
   "reason": "SIM-A12-PUR"
  },
  "difficulty": "중급",
  "note": "사증은 유효하지만 관광 목적과 실제 활동 계획이 맞지 않는 사례.",
  "travelerId": "TRV-0011",
  "displayNameKo": "마리아 산토스",
  "clues": [
   {
    "id": "ms1",
    "trigger": "LOOKUP_visa",
    "title": "사증 유효",
    "text": "C-3-9 자체는 유효.",
    "kind": "context",
    "key": false
   },
   {
    "id": "ms2",
    "trigger": "QUESTION_hotelName",
    "title": "숙박 소명 실패",
    "text": "호텔 상호·주소를 설명하지 못함.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "ms3",
    "trigger": "LOOKUP_contact",
    "title": "숙박 불일치",
    "text": "기재 연락처로 호텔 예약 확인 불가.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "ms4",
    "trigger": "QUESTION_alex",
    "title": "국내관계 불명",
    "text": "숙소·비용 제공자의 실명과 관계를 설명하지 못함.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "ms5",
    "trigger": "QUESTION_massage",
    "title": "취업활동 진술",
    "text": "관광 체류 중 유상 가능성이 있는 마사지 업무를 할 수 있다고 진술.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "ms6",
    "trigger": "QUESTION_returnPlan",
    "title": "체류계획 변경 가능성",
    "text": "일이 되면 더 머물 수 있다는 진술.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "ms7",
    "trigger": "LOOKUP_pnr",
    "title": "왕복표 존재",
    "text": "왕복표 자체는 정상이라 단독으로는 불허 근거가 아님.",
    "kind": "low",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S2-008",
  "shift": 2,
  "name": "LI WEI",
  "nat": "중국",
  "code": "CHN",
  "sex": "M",
  "dob": "1988-05-15",
  "passport": "EJ3049821",
  "purpose": "거래처 방문 및 제품검수",
  "stay": "6일",
  "arrival": "KE894 · PVG → ICN",
  "return": "KE893 · ICN → PVG",
  "carrier": "대한항공",
  "basis": "단기상용사증",
  "basisDetail": "C-3-4 복수사증 · 유효기간 내",
  "eta": "해당 없음",
  "arrivalCard": "전자입국신고 제출",
  "visa": "C-3-4 · MULTIPLE · VALID",
  "watch": "이상 없음",
  "bio": "일치 99.2%",
  "chip": "정상",
  "risk": "REVIEW",
  "initial": "인천과 화성의 거래처에서 제품 검수와 회의를 합니다.",
  "questions": [
   {
    "id": "company",
    "cat": "국내관계",
    "q": "초청 회사와 담당자를 알려주십시오.",
    "a": "Hanseong Robotics이고 담당자는 김도현 부장입니다.",
    "reveal": "contact"
   },
   {
    "id": "purpose",
    "cat": "기본사항",
    "q": "한국에서 직접 생산 업무나 근로를 합니까?",
    "a": "아닙니다. 계약 전 제품검수와 회의만 합니다.",
    "reveal": "purpose"
   },
   {
    "id": "invite",
    "cat": "추가소명",
    "q": "초청장과 일정표를 제시해 주십시오.",
    "a": "회사에서 발급한 초청장과 6일 일정표입니다.",
    "reveal": "docs"
   },
   {
    "id": "inspection",
    "cat": "직업",
    "q": "제품 검수 과정에서 직접 조립·설치·수리 작업을 합니까?",
    "a": "아닙니다. 생산라인을 관찰하고 시험성적서와 샘플을 확인합니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_purpose"
    ]
   },
   {
    "id": "pay",
    "cat": "직업",
    "q": "한국 초청사로부터 임금이나 작업대가를 받습니까?",
    "a": "없습니다. 중국 본사 출장입니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_inspection"
    ]
   },
   {
    "id": "tools",
    "cat": "추가소명",
    "q": "수하물에 공구나 측정장비가 있습니까?",
    "a": "소형 측정기 하나가 있지만 검수 확인용이고 설비 설치용 공구는 없습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_inspection"
    ]
   },
   {
    "id": "schedule",
    "cat": "국내관계",
    "q": "6일 일정 중 현장 방문과 회의 일정을 설명해 주십시오.",
    "a": "첫 이틀은 인천 회의, 다음 이틀은 화성 공장 검수, 마지막 날 결과회의입니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_company"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "LI WEI"
     ],
     [
      "국적",
      "CHINA"
     ],
     [
      "여권번호",
      "EJ3049821"
     ]
    ]
   },
   {
    "t": "사증",
    "k": "VISA",
    "fields": [
     [
      "체류자격",
      "C-3-4"
     ],
     [
      "종류",
      "MULTIPLE"
     ],
     [
      "상태",
      "VALID"
     ]
    ]
   },
   {
    "t": "초청장",
    "k": "INVITATION",
    "fields": [
     [
      "초청사",
      "HANSEONG ROBOTICS"
     ],
     [
      "담당자",
      "KIM DOHYUN"
     ],
     [
      "목적",
      "PRODUCT INSPECTION / MEETING"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "왕복",
      "KE894 / KE893"
     ],
     [
      "체류",
      "6 DAYS"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "정상",
    "최근 3년 C-3-4 입국 4회, 평균 체류 4일."
   ],
   "visa": [
    "정상",
    "C-3-4 복수사증 유효."
   ],
   "pnr": [
    "정상",
    "왕복 발권 및 체류일정 일치."
   ],
   "contact": [
    "정상",
    "초청사 대표번호로 담당자 재직 및 미팅 일정 확인."
   ],
   "public": [
    "정상",
    "법인등기·사업장 공개정보와 초청장 일치."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "신원 일치"
   ],
   "입국자격": [
    "ok",
    "충족",
    "C-3-4 유효"
   ],
   "입국목적": [
    "warn",
    "확인필요",
    "상용활동 범위 확인"
   ],
   "여행계획": [
    "ok",
    "확정",
    "왕복 발권"
   ],
   "체재능력": [
    "ok",
    "충분",
    "회사 출장"
   ],
   "국내관계": [
    "warn",
    "확인필요",
    "초청회사 검증 전"
   ]
  },
  "required": [
   "SECONDARY",
   "QUESTION_company",
   "QUESTION_purpose",
   "LOOKUP_contact",
   "LOOKUP_public",
   "QUESTION_inspection",
   "QUESTION_pay"
  ],
  "resolution": {
   "type": "CLEAR"
  },
  "difficulty": "중급",
  "note": "재심은 곧 불허가 아니다. 확인 후 입국허가가 가능한 사례.",
  "travelerId": "TRV-0007",
  "displayNameKo": "리웨이",
  "clues": [
   {
    "id": "lw1",
    "trigger": "QUESTION_company",
    "title": "초청사 특정",
    "text": "회사·담당자·방문목적 구체적.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "lw2",
    "trigger": "LOOKUP_contact",
    "title": "초청 확인",
    "text": "대표번호를 통한 담당자 재직·미팅 확인.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "lw3",
    "trigger": "QUESTION_inspection",
    "title": "활동 경계",
    "text": "조립·설치가 아닌 관찰·검수로 진술.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "lw4",
    "trigger": "QUESTION_tools",
    "title": "측정장비",
    "text": "장비 소지가 수상해 보이나 검수 목적과 설명 가능.",
    "kind": "low",
    "key": false
   },
   {
    "id": "lw5",
    "trigger": "QUESTION_pay",
    "title": "보수 관계",
    "text": "국내 초청사로부터 임금 수령 없음.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "lw6",
    "trigger": "LOOKUP_public",
    "title": "법인 확인",
    "text": "초청장·법인 공개정보 일치.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "lw7",
    "trigger": "QUESTION_schedule",
    "title": "일정 구체성",
    "text": "6일 출장일정이 서류와 일치.",
    "kind": "confirm",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S3-009",
  "shift": 3,
  "name": "ELENA ROSTOVA",
  "nat": "독일 국적 주장",
  "code": "DEU?",
  "sex": "F",
  "dob": "1990-02-17",
  "passport": "C41X90217",
  "purpose": "개인 관광",
  "stay": "7일",
  "arrival": "LH712 · FRA → ICN",
  "return": "LH713 · ICN → FRA",
  "carrier": "루프트한자",
  "basis": "사증면제협정 적용 주장",
  "basisDetail": "독일 일반여권을 주장하나 여권 진위 및 신원 미확정",
  "eta": "한시면제 대상 주장",
  "arrivalCard": "전자입국신고 제출",
  "visa": "사증 불요 주장",
  "watch": "직접 일치 없음",
  "bio": "불일치 71.8%",
  "chip": "전자서명 오류",
  "risk": "CRITICAL",
  "initial": "독일에서 왔고 일주일 동안 서울을 여행합니다. 여권에 문제가 있다는 말을 이해할 수 없습니다.",
  "questions": [
   {
    "id": "identity",
    "cat": "기본사항",
    "q": "여권상 인적사항과 실제 신원을 다시 확인하겠습니다.",
    "a": "제 이름은 Elena Rostova이고 독일 시민입니다. 다른 이름은 사용하지 않습니다.",
    "reveal": "identity"
   },
   {
    "id": "route",
    "cat": "여행·체류",
    "q": "최근 이동 경로와 환승지를 설명하십시오.",
    "a": "프랑크푸르트에서 바로 왔습니다. 그 전에는 유럽 안에 있었습니다.",
    "reveal": "travel"
   },
   {
    "id": "phone",
    "cat": "추가소명",
    "q": "본인 동의하에 예약자료와 신원 관련 메시지를 제시하시겠습니까?",
    "a": "예약 화면 일부는 보여드리겠습니다.",
    "reveal": "phone"
   },
   {
    "id": "trueName",
    "cat": "기본사항",
    "q": "생체정보와 여권 정보가 일치하지 않습니다. 다른 신원을 사용한 적이 있습니까?",
    "a": "아니요. 이 여권은 제 여권이라고 들었습니다.",
    "reveal": "depth",
    "requires": [
     "LOOKUP_forensic"
    ],
    "contradiction": true
   },
   {
    "id": "purchase",
    "cat": "추가소명",
    "q": "이 여권을 언제, 어디에서 발급받았습니까?",
    "a": "몇 달 전 여행을 준비하면서 중개인을 통해 받았습니다. 독일 관청에 직접 간 것은 아닙니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_trueName"
    ],
    "contradiction": true
   },
   {
    "id": "companion",
    "cat": "국내관계",
    "q": "동일 예약군의 다른 승객과 관계가 있습니까?",
    "a": "공항에서 처음 봤습니다. 잘 모르는 사람입니다.",
    "reveal": "depth",
    "requires": [
     "LOOKUP_pnr"
    ],
    "contradiction": true
   },
   {
    "id": "messages",
    "cat": "추가소명",
    "q": "자발적으로 제시한 예약 화면에 “새 이름으로 통과”라는 메시지가 있습니다. 설명해 주십시오.",
    "a": "여행사 직원이 보낸 메시지입니다. 무슨 뜻인지 정확히 모릅니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_phone"
    ],
    "contradiction": true
   },
   {
    "id": "destroy",
    "cat": "추가소명",
    "q": "조사 전 휴대전화 메시지를 삭제하려 한 이유는 무엇입니까?",
    "a": "긴장해서 정리하려 했을 뿐입니다.",
    "reveal": "depth",
    "requires": [
     "INVESTIGATION"
    ],
    "contradiction": true
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "alert": true,
    "fields": [
     [
      "성명",
      "ELENA ROSTOVA"
     ],
     [
      "국적",
      "DEUTSCH"
     ],
     [
      "여권번호",
      "C41X90217"
     ],
     [
      "전자칩",
      "SIGNATURE ERROR"
     ],
     [
      "MRZ",
      "CHECKSUM FAIL"
     ]
    ]
   },
   {
    "t": "전자입국신고",
    "k": "E-ARRIVAL",
    "fields": [
     [
      "국적",
      "GERMANY"
     ],
     [
      "목적",
      "TOURISM"
     ],
     [
      "체류지",
      "SEOUL CENTRAL HOTEL"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "입국",
      "LH712"
     ],
     [
      "출국",
      "LH713"
     ],
     [
      "결제",
      "제3자 카드"
     ]
    ]
   },
   {
    "t": "생체대조 결과",
    "k": "BIOMETRIC",
    "alert": true,
    "fields": [
     [
      "얼굴일치율",
      "71.8%"
     ],
     [
      "칩등록 얼굴",
      "MISMATCH"
     ],
     [
      "지문",
      "부분 불일치"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "경고",
    "제시 여권번호로 과거 입출국기록 없음. 동일 생체정보와 연결된 별도 신원 기록 의심."
   ],
   "visa": [
    "경고",
    "독일 국적 주장 자체가 문서 진위 미확정으로 확정되지 않음."
   ],
   "pnr": [
    "주의",
    "제3자 결제. 동일 예약군에 신원 불명 승객 1명 존재."
   ],
   "contact": [
    "주의",
    "호텔 예약은 존재하나 결제자가 피심사인과 다름."
   ],
   "public": [
    "주의",
    "신원 검색 결과 공신력 있는 일치자료 부족."
   ],
   "forensic": [
    "치명",
    "감식 결과: 전자서명 불일치, 데이터페이지 변조 흔적, 타인 명의 진정여권 부정사용 정황. 출입국사범 조사 필요."
   ]
  },
  "evidence": {
   "신원": [
    "bad",
    "충돌",
    "생체정보·전자여권 불일치"
   ],
   "입국자격": [
    "bad",
    "미확정",
    "국적·여권 진위 미확정"
   ],
   "입국목적": [
    "warn",
    "보류",
    "신원 확정 선행 필요"
   ],
   "여행계획": [
    "warn",
    "주의",
    "제3자 결제"
   ],
   "체재능력": [
    "warn",
    "미확인",
    "결제관계 불명"
   ],
   "국내관계": [
    "warn",
    "미확인",
    "숙소 결제자 상이"
   ]
  },
  "required": [
   "SECONDARY",
   "LOOKUP_forensic",
   "INVESTIGATION",
   "ARREST_REVIEW",
   "QUESTION_trueName",
   "QUESTION_purchase"
  ],
  "resolution": {
   "type": "ARREST"
  },
  "difficulty": "상급",
  "special": "forgery",
  "note": "위조여권 발견이 곧 자동 긴급체포는 아니다. 범죄혐의 확인 후 별도 요건을 검토.",
  "travelerId": "TRV-0004",
  "displayNameKo": "엘레나 로스토바",
  "passportPortraitId": "TRV-0106",
  "clues": [
   {
    "id": "er1",
    "trigger": "INIT",
    "title": "전자문서 이상",
    "text": "칩 전자서명·MRZ 이상으로 재심 필요.",
    "kind": "unresolved",
    "key": true
   },
   {
    "id": "er2",
    "trigger": "LOOKUP_forensic",
    "title": "감식 판정",
    "text": "데이터페이지 변조·타인 명의 여권 부정사용 정황.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "er3",
    "trigger": "QUESTION_trueName",
    "title": "신원 진술 충돌",
    "text": "감식 결과가 있는데도 여권상 신원만 반복 주장.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "er4",
    "trigger": "QUESTION_purchase",
    "title": "비정상 취득경위",
    "text": "공식 발급기관이 아닌 중개인을 통해 여권을 받았다고 진술.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "er5",
    "trigger": "LOOKUP_pnr",
    "title": "예약군 이상",
    "text": "제3자 결제·신원 불명 동승객 존재.",
    "kind": "unresolved",
    "key": false
   },
   {
    "id": "er6",
    "trigger": "QUESTION_messages",
    "title": "메시지 단서",
    "text": "자발적 제시 화면에서 새 신원 사용을 암시하는 메시지 확인.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "er7",
    "trigger": "QUESTION_destroy",
    "title": "증거인멸 우려",
    "text": "조사 착수 후 관련 메시지 삭제 시도 정황.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "er8",
    "trigger": "LOOKUP_contact",
    "title": "호텔 예약",
    "text": "호텔 예약 자체는 존재함. 범죄혐의를 해소하지 못하는 주변정보.",
    "kind": "low",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S3-010",
  "shift": 3,
  "name": "AHMED AL-MANSOOR",
  "nat": "이집트",
  "code": "EGY",
  "sex": "M",
  "dob": "1996-07-21",
  "passport": "A70018422",
  "purpose": "관광 → 난민신청",
  "stay": "14일",
  "arrival": "QR858 · DOH → ICN",
  "return": "QR859 · ICN → DOH",
  "carrier": "카타르항공",
  "basis": "단기 관광사증",
  "basisDetail": "C-3-9 단수사증 · 30일",
  "eta": "해당 없음",
  "arrivalCard": "전자입국신고 제출",
  "visa": "C-3-9 · VALID",
  "watch": "이상 없음",
  "bio": "일치 99.1%",
  "chip": "정상",
  "risk": "SPECIAL",
  "initial": "서울 관광을 하려고 왔습니다. 돈은 많지 않고 숙소도 아직 확정하지 않았습니다.",
  "questions": [
   {
    "id": "purpose",
    "cat": "기본사항",
    "q": "구체적인 관광 일정과 체류지를 설명하십시오.",
    "a": "자세한 일정은 없습니다. 한국에서 일할 기회가 있으면 좋겠습니다.",
    "reveal": "purpose"
   },
   {
    "id": "funds",
    "cat": "재정",
    "q": "체류기간 동안 사용할 비용은 얼마나 있습니까?",
    "a": "아주 적습니다. 한국에서 돈을 벌고 싶습니다.",
    "reveal": "funds"
   },
   {
    "id": "refugee",
    "cat": "추가소명",
    "q": "본국으로 돌아갈 수 없는 박해 위험이 있다는 취지입니까?",
    "a": "정치적·종교적 박해는 없습니다. 그래도 한국에서 일하고 싶어서 난민신청을 하겠습니다.",
    "reveal": "refugee"
   },
   {
    "id": "persecution",
    "cat": "난민",
    "q": "귀국하면 누구에게 어떤 이유로 어떤 위해를 받을 우려가 있습니까?",
    "a": "특정한 사람에게 박해받는 것은 아닙니다. 경제적으로 어렵습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_refugee"
    ]
   },
   {
    "id": "family",
    "cat": "난민",
    "q": "가족은 현재 본국에서 생활하고 있습니까?",
    "a": "네. 가족은 본국에서 생활하고 있습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_persecution"
    ]
   },
   {
    "id": "route",
    "cat": "난민",
    "q": "한국에 오기 전 다른 국가에서 보호를 요청한 적이 있습니까?",
    "a": "없습니다. 관광비자로 바로 한국에 왔습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_persecution"
    ]
   },
   {
    "id": "workPlan",
    "cat": "직업",
    "q": "한국에서 어떤 일을 하고 싶다고 생각했습니까?",
    "a": "공장이나 식당에서 일해서 돈을 보내고 싶었습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_funds"
    ],
    "contradiction": true
   },
   {
    "id": "claimTiming",
    "cat": "추가소명",
    "q": "난민신청은 언제부터 생각했습니까?",
    "a": "입국이 어려울 수 있다는 말을 듣고 여기서 신청하면 머물 수 있다고 생각했습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_refugee"
    ],
    "contradiction": true
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "AHMED AL-MANSOOR"
     ],
     [
      "국적",
      "EGYPT"
     ],
     [
      "여권번호",
      "A70018422"
     ]
    ]
   },
   {
    "t": "사증",
    "k": "VISA",
    "fields": [
     [
      "체류자격",
      "C-3-9"
     ],
     [
      "상태",
      "VALID"
     ]
    ]
   },
   {
    "t": "전자입국신고",
    "k": "E-ARRIVAL",
    "fields": [
     [
      "목적",
      "TOURISM"
     ],
     [
      "체류지",
      "NOT CONFIRMED"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "귀국편",
      "QR859"
     ],
     [
      "상태",
      "RESERVATION HOLD"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "정상",
    "대한민국 출입국 이력 없음."
   ],
   "visa": [
    "정상",
    "C-3-9 사증 문서 유효."
   ],
   "pnr": [
    "주의",
    "귀국편 예약은 있으나 발권 완료 전."
   ],
   "contact": [
    "주의",
    "국내 체류지·연락처 미확정."
   ],
   "public": [
    "정상",
    "안보·범죄 규제정보 없음."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "신원 일치"
   ],
   "입국자격": [
    "ok",
    "문서유효",
    "C-3-9 유효"
   ],
   "입국목적": [
    "warn",
    "미해결",
    "취업 목적 진술"
   ],
   "여행계획": [
    "warn",
    "미확정",
    "귀국편 미발권"
   ],
   "체재능력": [
    "warn",
    "취약",
    "체재비 부족"
   ],
   "국내관계": [
    "warn",
    "미확정",
    "숙소 없음"
   ]
  },
  "required": [
   "SECONDARY",
   "QUESTION_refugee",
   "REFUGEE_CLAIM",
   "REFERRAL_SCREENING",
   "NON_REFERRAL",
   "RETURN_TO_ENTRY",
   "QUESTION_persecution",
   "QUESTION_workPlan"
  ],
  "resolution": {
   "type": "REFUSE",
   "reason": "SIM-A12-PUR"
  },
  "difficulty": "상급",
  "special": "refugee",
  "note": "난민 불회부와 입국불허는 별도 절차.",
  "travelerId": "TRV-0013",
  "displayNameKo": "아흐메드 알만수르",
  "clues": [
   {
    "id": "aa1",
    "trigger": "QUESTION_refugee",
    "title": "난민신청 명시",
    "text": "입국심사 중 난민신청 의사를 명확히 표시. 즉시 난민법 절차 분기.",
    "kind": "context",
    "key": true
   },
   {
    "id": "aa2",
    "trigger": "QUESTION_persecution",
    "title": "박해사유 진술",
    "text": "정치·종교·인종 등 구체적 박해행위 진술 없음.",
    "kind": "conflict",
    "key": true
   },
   {
    "id": "aa3",
    "trigger": "QUESTION_family",
    "title": "가족 상황",
    "text": "가족은 본국에서 현재 생활 중.",
    "kind": "context",
    "key": false
   },
   {
    "id": "aa4",
    "trigger": "QUESTION_workPlan",
    "title": "경제적 목적",
    "text": "한국에서 취업해 송금하려는 목적을 구체적으로 진술.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "aa5",
    "trigger": "QUESTION_claimTiming",
    "title": "신청 동기",
    "text": "입국곤란 상황에서 체류수단으로 신청을 떠올렸다는 진술.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "aa6",
    "trigger": "LOOKUP_public",
    "title": "규제정보",
    "text": "안보·범죄 규제정보는 없음. 난민판단과 별개의 요소.",
    "kind": "low",
    "key": false
   },
   {
    "id": "aa7",
    "trigger": "LOOKUP_visa",
    "title": "관광사증",
    "text": "C-3-9 문서는 유효하나 난민절차 후 별도 입국심사 필요.",
    "kind": "context",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S3-011",
  "shift": 3,
  "name": "BIKASH THAPA",
  "nat": "네팔",
  "code": "NPL",
  "sex": "M",
  "dob": "1994-10-08",
  "passport": "PA8831042",
  "purpose": "가족 방문",
  "stay": "20일",
  "arrival": "KE696 · KTM → ICN",
  "return": "KE695 · ICN → KTM",
  "carrier": "대한항공",
  "basis": "단기방문사증",
  "basisDetail": "C-3 계열 유효사증",
  "eta": "해당 없음",
  "arrivalCard": "전자입국신고 제출",
  "visa": "C-3 · VALID",
  "watch": "이상 없음",
  "bio": "제공 거부",
  "chip": "정상",
  "risk": "SPECIAL",
  "initial": "한국에 사는 사촌을 만나러 왔습니다. 지문은 제공하고 싶지 않습니다.",
  "questions": [
   {
    "id": "bio",
    "cat": "기본사항",
    "q": "입국심사에 필요한 생체정보 제공 절차에 응하시겠습니까?",
    "a": "싫습니다. 여권이 있으니 지문을 왜 제공해야 하는지 모르겠습니다.",
    "reveal": "bio"
   },
   {
    "id": "exempt",
    "cat": "추가소명",
    "q": "생체정보 제공 면제사유에 해당한다고 주장하는 근거가 있습니까?",
    "a": "없습니다. 그냥 제공하고 싶지 않습니다.",
    "reveal": "exempt"
   },
   {
    "id": "age",
    "cat": "생체정보",
    "q": "현재 연령이 17세 미만입니까?",
    "a": "아닙니다. 29세입니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_bio"
    ]
   },
   {
    "id": "official",
    "cat": "생체정보",
    "q": "외국정부·국제기구 업무 수행 등 면제사유가 있습니까?",
    "a": "없습니다. 개인 방문입니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_age"
    ]
   },
   {
    "id": "explain",
    "cat": "추가소명",
    "q": "생체정보 제공의 법적 절차와 미제공 시 결과를 안내했습니다. 다시 응하시겠습니까?",
    "a": "설명을 들었지만 그래도 지문과 얼굴정보 제공에 동의하지 않겠습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_exempt",
     "QUESTION_official"
    ]
   },
   {
    "id": "otherDocs",
    "cat": "추가소명",
    "q": "여권·귀국편·체류지는 모두 정상인데 생체정보 절차만 거부하는 것이 맞습니까?",
    "a": "네. 다른 서류에는 문제가 없습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_explain"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "BIKASH THAPA"
     ],
     [
      "국적",
      "NEPAL"
     ],
     [
      "전자칩",
      "VALID"
     ]
    ]
   },
   {
    "t": "사증",
    "k": "VISA",
    "fields": [
     [
      "종류",
      "C-3"
     ],
     [
      "상태",
      "VALID"
     ]
    ]
   },
   {
    "t": "전자입국신고",
    "k": "E-ARRIVAL",
    "fields": [
     [
      "목적",
      "FAMILY VISIT"
     ],
     [
      "체류",
      "20 DAYS"
     ]
    ]
   },
   {
    "t": "생체정보 절차",
    "k": "BIOMETRIC",
    "alert": true,
    "fields": [
     [
      "대상",
      "면제사유 없음"
     ],
     [
      "상태",
      "REFUSED"
     ],
     [
      "재안내",
      "완료"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "정상",
    "특이사항 없음."
   ],
   "visa": [
    "정상",
    "사증 유효."
   ],
   "pnr": [
    "정상",
    "왕복 발권."
   ],
   "contact": [
    "정상",
    "사촌 체류지 정보 확인."
   ],
   "public": [
    "정상",
    "특이사항 없음."
   ]
  },
  "evidence": {
   "신원": [
    "warn",
    "미완료",
    "생체 본인확인 미완료"
   ],
   "입국자격": [
    "ok",
    "문서유효",
    "사증 유효"
   ],
   "입국목적": [
    "ok",
    "일치",
    "가족 방문"
   ],
   "여행계획": [
    "ok",
    "확정",
    "왕복 발권"
   ],
   "체재능력": [
    "ok",
    "충분",
    "소명"
   ],
   "국내관계": [
    "ok",
    "확인",
    "사촌 관계 확인"
   ]
  },
  "required": [
   "QUESTION_bio",
   "QUESTION_exempt",
   "QUESTION_age",
   "QUESTION_official",
   "QUESTION_explain"
  ],
  "resolution": {
   "type": "REFUSE",
   "reason": "SIM-BIO-REF"
  },
  "difficulty": "상급",
  "note": "사증 유효성과 별개로 제12조의2 생체정보 제공의무를 다루는 사건.",
  "travelerId": "TRV-0009",
  "displayNameKo": "비카시 타파",
  "clues": [
   {
    "id": "bt1",
    "trigger": "QUESTION_bio",
    "title": "생체정보 거부",
    "text": "면제 여부 확인 전 단순 거부 의사 표시.",
    "kind": "unresolved",
    "key": true
   },
   {
    "id": "bt2",
    "trigger": "QUESTION_age",
    "title": "연령 면제 없음",
    "text": "17세 이상.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "bt3",
    "trigger": "QUESTION_official",
    "title": "직무 면제 없음",
    "text": "외국정부·국제기구 업무 등 주장 없음.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "bt4",
    "trigger": "QUESTION_exempt",
    "title": "기타 면제근거 없음",
    "text": "본인도 면제사유가 없다고 진술.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "bt5",
    "trigger": "QUESTION_explain",
    "title": "재고지 후 거부",
    "text": "절차와 결과 안내 후에도 생체정보 제공 불응.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "bt6",
    "trigger": "LOOKUP_pnr",
    "title": "기타 요건",
    "text": "왕복 발권 등 다른 여행요건은 정상.",
    "kind": "low",
    "key": false
   },
   {
    "id": "bt7",
    "trigger": "QUESTION_otherDocs",
    "title": "쟁점 한정",
    "text": "사건의 핵심은 국적·관광목적이 아니라 제12조의2 절차 불응임.",
    "kind": "context",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 },
 {
  "id": "ICN-S3-012",
  "shift": 3,
  "name": "KENJI MORITA",
  "nat": "일본",
  "code": "JPN",
  "sex": "M",
  "dob": "1978-01-24",
  "passport": "TZ1093820",
  "purpose": "관광",
  "stay": "3일",
  "arrival": "NH861 · HND → ICN",
  "return": "NH864 · ICN → HND",
  "carrier": "ANA",
  "basis": "지정 무사증 주장",
  "basisDetail": "일반적으로 일본 일반여권 90일 무사증 가능하나 개인별 입국금지 여부 별도 심사",
  "eta": "한시면제",
  "arrivalCard": "전자입국신고 제출",
  "visa": "사증 불요",
  "watch": "규제정보 확인 필요",
  "bio": "일치 99.3%",
  "chip": "정상",
  "risk": "CRITICAL",
  "initial": "주말 동안 서울 관광을 왔습니다. 예전 한국 체류 문제는 이미 끝난 것으로 알고 있습니다.",
  "questions": [
   {
    "id": "history",
    "cat": "과거입국",
    "q": "과거 대한민국에서 강제퇴거된 사실이 있습니까?",
    "a": "3년 전에 체류 문제로 출국 조치를 받았습니다. 이제는 다시 올 수 있다고 생각했습니다.",
    "reveal": "history"
   },
   {
    "id": "purpose",
    "cat": "기본사항",
    "q": "이번 입국 목적은 관광이 맞습니까?",
    "a": "네. 3일만 관광하고 돌아갑니다.",
    "reveal": "purpose"
   },
   {
    "id": "date",
    "cat": "과거입국",
    "q": "강제퇴거에 따라 출국한 날짜를 기억합니까?",
    "a": "2023년 8월 중순이었습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_history"
    ]
   },
   {
    "id": "order",
    "cat": "과거입국",
    "q": "당시 단순 출국명령이 아니라 강제퇴거명령을 받은 사실을 알고 있었습니까?",
    "a": "당시 서류를 받았지만 두 절차의 차이는 잘 몰랐습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_date"
    ]
   },
   {
    "id": "permission",
    "cat": "추가소명",
    "q": "그 이후 별도 입국허가나 규제해제 통지를 받은 적이 있습니까?",
    "a": "없습니다. 시간이 지나면 자동으로 괜찮아지는 줄 알았습니다.",
    "reveal": "depth",
    "requires": [
     "LOOKUP_history"
    ]
   },
   {
    "id": "hotel",
    "cat": "여행·체류",
    "q": "이번 여행의 호텔·귀국편은 정상적으로 준비했습니까?",
    "a": "네. 3일 호텔과 귀국편 모두 예약했습니다.",
    "reveal": "depth",
    "requires": [
     "QUESTION_purpose"
    ]
   }
  ],
  "docs": [
   {
    "t": "여권",
    "k": "PASSPORT",
    "fields": [
     [
      "성명",
      "KENJI MORITA"
     ],
     [
      "국적",
      "JAPAN"
     ],
     [
      "여권번호",
      "TZ1093820"
     ]
    ]
   },
   {
    "t": "전자입국신고",
    "k": "E-ARRIVAL",
    "fields": [
     [
      "목적",
      "TOURISM"
     ],
     [
      "체류",
      "3 DAYS"
     ]
    ]
   },
   {
    "t": "항공예약",
    "k": "PNR",
    "fields": [
     [
      "왕복",
      "NH861 / NH864"
     ],
     [
      "상태",
      "TICKETED"
     ]
    ]
   },
   {
    "t": "규제조회",
    "k": "WATCHLIST",
    "alert": true,
    "fields": [
     [
      "조치",
      "강제퇴거명령 후 출국"
     ],
     [
      "출국일",
      "2023-08-14"
     ],
     [
      "경과",
      "약 3년"
     ],
     [
      "상태",
      "ENTRY BAN ACTIVE"
     ]
    ]
   }
  ],
  "lookups": {
   "history": [
    "치명",
    "2023-08-14 강제퇴거명령에 따라 출국. 현재 5년 미경과."
   ],
   "visa": [
    "주의",
    "국적상 무사증 대상 여부와 별개로 제11조 개인별 입국금지 사유 심사 필요."
   ],
   "pnr": [
    "정상",
    "3일 왕복 발권."
   ],
   "contact": [
    "정상",
    "호텔 예약 확인."
   ],
   "public": [
    "정상",
    "현재 여행목적 자체의 별도 이상 없음."
   ]
  },
  "evidence": {
   "신원": [
    "ok",
    "확인",
    "신원 일치"
   ],
   "입국자격": [
    "bad",
    "입국금지",
    "강제퇴거 후 5년 미경과"
   ],
   "입국목적": [
    "ok",
    "일치",
    "관광"
   ],
   "여행계획": [
    "ok",
    "확정",
    "3일 왕복"
   ],
   "체재능력": [
    "ok",
    "충분",
    "소명"
   ],
   "국내관계": [
    "ok",
    "확인",
    "호텔 예약"
   ]
  },
  "required": [
   "QUESTION_history",
   "LOOKUP_history",
   "QUESTION_date",
   "QUESTION_order"
  ],
  "resolution": {
   "type": "REFUSE",
   "reason": "SIM-A11-DEPORT"
  },
  "difficulty": "상급",
  "note": "국적별 무사증 허용과 개인별 입국금지는 별개의 축이다.",
  "travelerId": "TRV-0012",
  "displayNameKo": "겐지 모리타",
  "clues": [
   {
    "id": "km1",
    "trigger": "QUESTION_purpose",
    "title": "현재 관광계획",
    "text": "현재 여행목적·귀국편 자체는 정상으로 보임.",
    "kind": "low",
    "key": false
   },
   {
    "id": "km2",
    "trigger": "QUESTION_history",
    "title": "과거 강제퇴거 진술",
    "text": "과거 체류문제로 출국조치를 받았음을 인정.",
    "kind": "unresolved",
    "key": true
   },
   {
    "id": "km3",
    "trigger": "QUESTION_date",
    "title": "출국일 특정",
    "text": "2023년 8월 강제퇴거에 따른 출국.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "km4",
    "trigger": "LOOKUP_history",
    "title": "공식 기록",
    "text": "2023-08-14 강제퇴거명령에 따라 출국, 현재 5년 미경과.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "km5",
    "trigger": "QUESTION_order",
    "title": "처분 성격",
    "text": "당시 처분이 단순 출국명령이 아닌 강제퇴거명령임을 확인.",
    "kind": "critical",
    "key": true
   },
   {
    "id": "km6",
    "trigger": "QUESTION_permission",
    "title": "규제해제 없음",
    "text": "별도 규제해제·입국허가 통지 없음.",
    "kind": "confirm",
    "key": true
   },
   {
    "id": "km7",
    "trigger": "QUESTION_hotel",
    "title": "현 여행자료",
    "text": "숙박·왕복표 정상이나 제11조 개인별 사유를 해소하지 못함.",
    "kind": "low",
    "key": false
   },
   {
    "id": "km8",
    "trigger": "LOOKUP_visa",
    "title": "국적과 개인규제 분리",
    "text": "일본 무사증 일반론과 제11조 개인별 입국금지는 별도 축.",
    "kind": "context",
    "key": false
   }
  ],
  "depthVersion": "v4.8"
 }
];
