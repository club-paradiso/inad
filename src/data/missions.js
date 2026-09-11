// Data extracted verbatim from the v6.1 baseline (legacy/v6.1) — daily missions and optional challenge modes
// Legal/game content: do not edit without a documented review (docs/legal-baseline.md).
export const DAILY_MISSION_DEFS = {
 clean20:{id:'clean20',name:'정확한 심사 20건',desc:'오류 없이 종결한 승객을 오늘 누적 20명 이상 처리',target:20,reward:30,group:'volume'},
 secondary2:{id:'secondary2',name:'재심 후 정상입국 2건',desc:'재심을 거친 뒤 입국허가로 종결한 사건을 오늘 누적 2건 처리',target:2,reward:35,group:'volume'},
 interpreter2:{id:'interpreter2',name:'통역 지원 2건',desc:'통역을 실제 사용하여 종결한 사건을 오늘 누적 2건 처리',target:2,reward:30,group:'volume'},
 cleanShift:{id:'cleanShift',name:'무감찰 근무',desc:'감찰성 오류 없이 근무 1회를 완료',target:1,reward:35,group:'quality'},
 highOverall:{id:'highOverall',name:'종합평가 92+',desc:'종합평가 92 이상 근무를 오늘 1회 완료',target:1,reward:30,group:'quality'},
 efficient:{id:'efficient',name:'효율과 절차',desc:'처리효율 95 이상·절차 준수 95 이상 근무를 1회 완료',target:1,reward:30,group:'quality'},
 challengeWin:{id:'challengeWin',name:'특별근무 성공',desc:'선택형 특별근무 도전 1회를 성공',target:1,reward:35,group:'meta'},
 specialPerfect:{id:'specialPerfect',name:'특수절차 완전처리',desc:'난민 또는 특사경 사건 1건을 절차 100%·오류 0으로 완결',target:1,reward:40,group:'meta'},
 realistic:{id:'realistic',name:'실전 근무 88+',desc:'실전 난이도에서 종합평가 88 이상으로 근무 1회 완료',target:1,reward:40,group:'meta'}
};
export const CHALLENGES = {
 none:{id:'none',symbol:'—',name:'일반 근무',bonus:0,desc:'추가 목표 없이 기본 근무를 수행합니다.',rules:['기존 게임 규칙과 동일','별도 XP 보너스 없음']},
 proportion:{id:'proportion',symbol:'≋',name:'비례심사',bonus:55,desc:'불필요한 재심과 과잉 확인을 피하면서 필요한 절차는 모두 지키는 근무입니다.',rules:['과잉재심 0회','업무 비례성 96 이상','절차 준수율 95 이상']},
 congestion:{id:'congestion',symbol:'▲',name:'혼잡 대응',bonus:70,desc:'시작 대기열이 크게 늘어난 특별 운영상황에서 정확성과 운영 안정성을 함께 지킵니다.',rules:['시작 대기열 +18명','최고 대기 55명 이상 경험','종합평가 90 이상 · 운영 안정성 82 이상','감찰 Strike 0']},
 interpreter:{id:'interpreter',symbol:'통',name:'통역 지원 집중',bonus:65,desc:'언어장벽이 있는 승객에게 필요한 통역을 적절히 연결하고 정확한 진술을 확보합니다.',rules:['통역 사용 종결 사건 3건 이상','법률 정확도 95 이상','절차 준수율 95 이상','감찰성 오류 0']},
 specialist:{id:'specialist',symbol:'§',name:'특수절차 집중',bonus:90,desc:'난민 회부심사와 출입국사범 사건을 각각 완전한 절차로 처리합니다.',rules:['난민절차 사건 절차 100% · 오류 0','특사경 사건 절차 100% · 오류 0','법률 정확도 95 이상']},
 perfect:{id:'perfect',symbol:'100',name:'무오판 근무',bonus:80,desc:'36명 전체 근무를 감찰성 오류 없이 법률·절차 모두 완벽하게 마칩니다.',rules:['감찰성 오류 0','법률 정확도 100','절차 준수율 100','Strike 0']}
};
