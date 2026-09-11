// Data extracted from the v6.1 baseline (legacy/v6.1) — operational game variables: difficulty, scenarios, field events, shift targets
// 2026-09-11 balance review: training/standard pressure was reduced without changing legal outcomes.
// 2026-09-11 efficiency review: processing-time pressure is intentionally forgiving outside Realistic mode.
export const DIFFICULTY_CONFIG = {
 training:{label:'훈련',arrivalEvery:150,eventCount:3,impact:.35,workFactor:.72,desc:'넉넉한 처리시간과 크게 완화된 운영압박 · 효율보다 절차 학습 우선'},
 standard:{label:'표준',arrivalEvery:100,eventCount:5,impact:.72,workFactor:.88,desc:'적당한 처리시간 여유와 완화된 현장 이벤트'},
 realistic:{label:'실전',arrivalEvery:60,eventCount:8,impact:1.15,workFactor:1.02,desc:'빠른 승객 유입과 높은 운영압박 · 숙련자용'}
};
export const SCENARIOS = {
 normal:{id:'normal',name:'기본 근무',desc:'추가 운영변수 없음',backlog:0,arrivalFactor:1,lookupFactor:1,interpreterExtra:0,fatigueFactor:1},
 arrival:{id:'arrival',name:'도착편 집중',desc:'초기 대기 증가와 빠른 유입',backlog:10,arrivalFactor:1.18,lookupFactor:1,interpreterExtra:0,fatigueFactor:1},
 systems:{id:'systems',name:'전산 불안정',desc:'전산조회 상시 지연',backlog:0,arrivalFactor:1,lookupFactor:1.24,interpreterExtra:0,fatigueFactor:1},
 interpreter:{id:'interpreter',name:'통역 수요 증가',desc:'통역 연결 상시 지연',backlog:0,arrivalFactor:1,lookupFactor:1,interpreterExtra:16,fatigueFactor:1},
 night:{id:'night',name:'야간근무',desc:'피로 누적 증가·초기 대기 소폭 상승',backlog:4,arrivalFactor:1.04,lookupFactor:1,interpreterExtra:0,fatigueFactor:1.18}
};
export const FIELD_EVENT_TYPES = [
 {id:'ARRIVAL_SURGE',tone:'bad',title:'도착편 입국객 집중',desc:'복수 도착편 승객이 짧은 시간에 입국심사장으로 유입되고 있습니다.',effect:'대기열 증가',backlog:8,duration:3},
 {id:'BOOTH_OUTAGE',tone:'warn',title:'인접 심사대 단말 장애',desc:'인접 심사대 일부가 일시 중단되어 주변 심사대에 처리량이 분산됩니다.',effect:'처리시간 +8%',backlog:4,timeFactor:1.08,duration:3},
 {id:'SYSTEM_LATENCY',tone:'warn',title:'출입국 전산조회 지연',desc:'출입국기록·PNR 등 조회 응답시간이 평소보다 길어지고 있습니다.',effect:'전산조회 지연',lookupFactor:1.55,duration:3},
 {id:'INTERPRETER_QUEUE',tone:'warn',title:'통역 지원 대기 증가',desc:'동시간대 통역 요청이 몰려 통역 연결까지 추가 시간이 필요합니다.',effect:'통역 호출 지연',interpreterExtra:25,duration:3},
 {id:'FLIGHT_DELAY',tone:'relief',title:'일부 도착편 지연',desc:'후속 도착편이 지연되어 잠시 입국장 유입량이 감소했습니다.',effect:'대기열 완화',backlog:-6,duration:2},
 {id:'RELIEF_BOOTH',tone:'relief',title:'지원 심사대 추가 운영',desc:'지원 인력이 투입되어 인접 심사대가 추가 개방되었습니다.',effect:'대기열 완화',backlog:-7,timeFactor:.96,duration:3},
 {id:'GROUP_WAVE',tone:'bad',title:'단체승객 동시 도착',desc:'대규모 단체승객이 한꺼번에 도착해 대기열 밀도가 높아졌습니다.',effect:'대기 +10명',backlog:10,duration:3},
 {id:'NETWORK_RECOVERY',tone:'relief',title:'전산망 정상화',desc:'직전 지연 구간이 해소되어 시스템 응답이 안정화되었습니다.',effect:'처리 정상화',backlog:-3,timeFactor:.97,duration:2}
];
// These are game targets, not published airport service standards. They are deliberately generous in the learning modes.
export const SHIFT_TARGETS = {1:{avg:80,label:'기초 심사'},2:{avg:135,label:'재심·목적 확인'},3:{avg:200,label:'특수사건'}};
