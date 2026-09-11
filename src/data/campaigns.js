// Data extracted verbatim from the v6.1 baseline (legacy/v6.1) — three-day campaigns and their branching narrative arcs
// Legal/game content: do not edit without a documented review (docs/legal-baseline.md).
export const CAMPAIGNS = {
 none:{id:'none',name:'단일 근무',desc:'캠페인 없이 한 근무만 플레이합니다.',bonus:0,perfectBonus:0,days:[]},
 holiday:{id:'holiday',name:'연휴 입국 러시',desc:'연휴 전후 도착편 집중과 누적 전산부하를 3일 연속 관리합니다.',bonus:180,perfectBonus:90,days:[
  {title:'DAY 1 · 연휴 전야',scenario:'arrival',note:'도착편 집중이 시작됩니다.'},
  {title:'DAY 2 · 입국 정점',scenario:'arrival',note:'대기열과 입국객 유입이 가장 높은 날입니다.'},
  {title:'DAY 3 · 잔여 대기·전산 부하',scenario:'systems',note:'누적 대기와 전산 조회부하를 정리합니다.'}
 ]},
 recovery:{id:'recovery',name:'전산 복구 주간',desc:'불안정한 조회환경을 견디고 정상화 이후 운영품질을 검증합니다.',bonus:170,perfectBonus:80,days:[
  {title:'DAY 1 · 장애 발생',scenario:'systems',note:'출입국 전산조회가 전반적으로 지연됩니다.'},
  {title:'DAY 2 · 부분 복구',scenario:'systems',note:'복구 중이지만 조회지연이 계속됩니다.'},
  {title:'DAY 3 · 정상화 검증',scenario:'normal',note:'정상 운영으로 복귀한 뒤 누적 업무를 정리합니다.'}
 ]},
 nightops:{id:'nightops',name:'야간 특수근무',desc:'야간편·통역 수요·새벽 운영부담을 연속해서 처리합니다.',bonus:190,perfectBonus:100,days:[
  {title:'DAY 1 · 야간편 집중',scenario:'night',note:'야간근무 피로와 입국편 유입이 겹칩니다.'},
  {title:'DAY 2 · 심야 통역수요',scenario:'interpreter',note:'통역 연결 대기시간이 길어지는 근무입니다.'},
  {title:'DAY 3 · 새벽 특수운영',scenario:'night',note:'누적 피로 속에서 마지막 야간근무를 수행합니다.'}
 ]}
};
export const CAMPAIGN_ARCS = {
 holiday:{title:'연휴 예약망 연계검증',theme:'공통 예약업체·셔틀·여행사 코드가 반복될 때, 단순 연관성과 실제 사건 연계를 구분합니다.',chapters:[
  {anchor:'ICN-S1-002',title:'HJ-42 예약군 기준선',summary:'정상 관광객의 단체예약·공동 셔틀 자료를 기준선으로 확보합니다.',link:'Seoul Gate Travel의 예약블록 HJ-42와 공항 셔틀 SG-17이 정상 여행상품에 사용됨.',actions:[['source','PNR 원자료 확인','HJ-42 예약블록의 실제 PNR·투숙객 범위를 확인했습니다.'],['entity','여행사·셔틀 사업자 대조','여행사와 SG-17 셔틀 운영주체가 정상 영업 중인 별도 사업자임을 확인했습니다.'],['relevance','관련성 기준선 작성','공통 업체 사용만으로 개별 승객의 위법성을 추정하지 않는 기준선을 사건기록에 남겼습니다.']]},
  {anchor:'ICN-S2-005',title:'SG-17 코드 재등장',summary:'전일과 같은 셔틀 코드가 보이지만 동일 PNR·숙소·예약군인지는 별도로 검증해야 합니다.',link:'현재 승객 자료에 SG-17 셔틀 표기가 있으나 전일 HJ-42 예약군과 직접 연결된다는 근거는 아직 없음.',actions:[['source','전일 예약군 기록 불러오기','전일 HJ-42 원자료와 현재 PNR을 나란히 불러왔습니다.'],['entity','현재 예약·숙소 분리대조','현재 예약번호·숙소가 HJ-42와 별개임을 확인했습니다.'],['relevance','연계성 분리평가','셔틀 사업자 공통 사용은 주변정보로 분리하고, 현재 승객의 입국목적은 독립 증거로 판단하도록 표시했습니다.']]},
  {anchor:'ICN-S2-006',title:'여행사 코드의 세 번째 등장',summary:'같은 여행사를 이용한 가족예약이 다시 등장합니다. 이전 사건의 인상을 그대로 전이하지 마십시오.',link:'Seoul Gate Travel 예약이지만 가족 단독 PNR·숙소·귀국편이 별도로 존재함.',actions:[['source','가족 PNR 원자료 확인','가족 단독 PNR과 귀국편을 확인했습니다.'],['entity','여행사 예약범위 확인','전일 사건들과 예약번호·투숙객·결제주체가 분리돼 있음을 확인했습니다.'],['relevance','선입견 배제 검토','반복 상호명은 맥락정보로만 남기고 현재 승객의 소명자료를 독립 평가했습니다.']]}
 ]},
 recovery:{title:'전자여권 검증 복구 추적',theme:'전산장애 중 발견된 실제 위조와 복구 이후 발생하는 시스템성 경보를 구분합니다.',chapters:[
  {anchor:'ICN-S3-009',title:'장애 중 실제 위조 기준자료',summary:'전산 불안정 상황에서도 오프라인 감식으로 실제 위조 특성을 확정해 기준자료를 남깁니다.',link:'감식기록 F-091 · 칩 전자서명·MRZ·생체정보의 복합 불일치.',actions:[['source','오프라인 감식기록 고정','F-091 감식결과와 원본 해시를 보존했습니다.'],['entity','서명 인증서 체인 대조','단순 통신오류가 아닌 전자서명 불일치를 확인했습니다.'],['relevance','위조 특성 기준선 작성','복구 이후 유사 경보가 나와도 F-091의 실제 위조 특성과 별도로 비교하도록 기준선을 만들었습니다.']]},
  {anchor:'ICN-S2-008',title:'복구 직후 유사 경보',summary:'전일 위조사건과 비슷해 보이는 전자칩 경보가 복구 캐시에서 발생했습니다. 같은 사건으로 단정하지 마십시오.',link:'서명키 캐시 재동기화 시간대와 겹치며 F-091의 문서 물리특성과 일치하지 않음.',actions:[['source','전일 F-091 기록 비교','전일 감식 기준자료를 현재 문서와 비교했습니다.'],['entity','서명키 실시간 재검증','복구된 인증서 체인에서 현재 전자여권 서명이 정상 검증됐습니다.'],['relevance','시스템성 경보 분리','현재 경보를 복구 지연으로 분류하고 개별 입국요건 판단과 분리했습니다.']]},
  {anchor:'ICN-S1-001',title:'항공사 e-Document 동기화 지연',summary:'문서 데이터 반영시간 차이가 다시 나타납니다. 원출처와 타임스탬프를 확인해 시스템 지연인지 구분합니다.',link:'항공사 e-doc 전송시각과 입국심사 전산 반영시각 사이 지연 로그 존재.',actions:[['source','원출처 타임스탬프 확인','항공사 전송 원본과 수신시각을 비교했습니다.'],['entity','여권·PNR 원문 대조','여권정보와 항공예약 원문이 서로 일치합니다.'],['relevance','복구 영향 종결평가','복구지연을 문서 진위 문제와 분리하고 캠페인 감식기록을 종결했습니다.']]}
 ]},
 nightops:{title:'유사 초청사명 엔터티 추적',theme:'야간근무 중 비슷한 회사명·연락처가 반복될 때 실제 동일 법인인지 확인합니다.',chapters:[
  {anchor:'ICN-S2-008',title:'정상 초청사 기준선',summary:'정상 출장객의 초청사 ‘미래로보틱스’ 법인정보와 담당자 연락망을 기준선으로 저장합니다.',link:'가상 법인 미래로보틱스 · 사업자코드 SIM-MR-204 · 담당자 연락처 검증 완료.',actions:[['source','초청장 원본 대조','초청장과 사증·출장일정의 법인명이 일치합니다.'],['entity','법인 식별자 확인','SIM-MR-204 법인정보와 공식 연락처를 기준선으로 저장했습니다.'],['relevance','정상 초청관계 기준선','유사 상호명이 등장할 때 법인번호·주소·담당자를 우선 비교하도록 표시했습니다.']]},
  {anchor:'ICN-S2-005',title:'유사 상호명 등장',summary:'‘미래테크서비스’라는 비슷한 명칭이 등장하지만 전일 법인과 동일하다는 근거는 없습니다.',link:'상호명은 유사하지만 법인 식별자·주소·대표번호가 다름.',actions:[['source','전일 초청사 기록 호출','미래로보틱스 기준 법인정보를 불러왔습니다.'],['entity','법인번호·주소 비교','현재 자료의 미래테크서비스는 SIM-MTS-771로 별도 법인임을 확인했습니다.'],['relevance','동명이인·유사상호 분리','유사 상호는 현재 입국목적 판단의 직접 근거가 아님을 명시했습니다.']]},
  {anchor:'ICN-S1-001',title:'컨퍼런스 파트너 명단 재등장',summary:'정상 컨퍼런스 참가자료에 미래로보틱스가 파트너사로 등장합니다. 전일 엔터티 분리기록을 활용합니다.',link:'행사 공식 참가사 명단의 미래로보틱스 식별자 SIM-MR-204가 DAY 1 기준선과 일치.',actions:[['source','행사 참가사 원문 확인','컨퍼런스 공식 참가사 명단 원문을 확인했습니다.'],['entity','법인 식별자 재대조','SIM-MR-204가 DAY 1 정상 초청사와 동일함을 확인했습니다.'],['relevance','3일 엔터티 추적 종결','유사 상호와 실제 동일 법인을 구별한 연계기록을 캠페인 종결자료로 저장했습니다.']]}
 ]}
};
