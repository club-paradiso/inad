// Data extracted verbatim from the v6.1 baseline (legacy/v6.1) — career achievements (incl. v5.9 campaign achievements appended at the end)
// Legal/game content: do not edit without a documented review (docs/legal-baseline.md).
export const ACHIEVEMENTS = [
{id:'first_shift',icon:'▣',name:'첫 근무 완료',desc:'근무 1회를 끝까지 완료',test:c=>c.completedShifts>=1},
{id:'first_s',icon:'S',name:'최우수 평정',desc:'S등급을 처음 획득',test:c=>c.sGrades>=1},
{id:'realistic_s',icon:'▲',name:'실전의 정석',desc:'실전 난이도에서 S등급 획득',test:c=>c.realisticS>=1},
{id:'clean_shift',icon:'✓',name:'무감찰 근무',desc:'감찰성 오류 없이 한 근무 완료',test:c=>c.cleanShifts>=1},
{id:'clean_100',icon:'100',name:'무오판 100명',desc:'오류 없이 처리한 승객 누적 100명',test:c=>c.cleanPassengers>=100},
{id:'secondary_10',icon:'↺',name:'재심은 결론이 아니다',desc:'재심 후 정상 입국허가 10건',test:c=>c.secondaryClears>=10},
{id:'proportion_3',icon:'≋',name:'비례성 유지',desc:'과잉재심 0회 근무를 3회 완료',test:c=>c.zeroOverSecondaryShifts>=3},
{id:'refugee_perfect',icon:'R',name:'회부심사 완전처리',desc:'난민 절차 사건을 오류 없이 완결',test:c=>c.refugeePerfect>=1},
{id:'sjp_perfect',icon:'§',name:'절차가 먼저다',desc:'특사경 사건을 오류 없이 완결',test:c=>c.sjpPerfect>=1},
{id:'all_modes',icon:'III',name:'전 근무환경 경험',desc:'훈련·표준·실전 근무를 모두 완료',test:c=>Object.values(c.difficultyCompleted||{}).every(Boolean)},
{id:'ten_shifts',icon:'10',name:'열 번째 교대',desc:'근무 10회 완료',test:c=>c.completedShifts>=10},
{id:'five_hundred',icon:'500',name:'500명 심사',desc:'누적 심사 승객 500명',test:c=>c.totalPassengers>=500},
{id:'first_challenge',icon:'◆',name:'첫 특별근무 성공',desc:'선택형 도전과제 1회 성공',test:c=>(c.challengeWins||0)>=1},
{id:'challenge_master',icon:'◆10',name:'도전근무 전문가',desc:'선택형 도전과제 누적 10회 성공',test:c=>(c.challengeWins||0)>=10},
{id:'daily_first',icon:'☀',name:'오늘의 임무 완료',desc:'하루의 일일 미션 3종을 모두 완료',test:c=>(c.dailyFullDays||0)>=1},
{id:'daily_week',icon:'7D',name:'일주일 연속 근무목표',desc:'일일 미션 3종 완료를 7일 연속 달성',test:c=>(c.bestDailyStreak||0)>=7}
,
{id:'campaign_first',icon:'3D',name:'첫 3일 캠페인 완주',desc:'시나리오 캠페인 1회를 끝까지 완료',test:c=>(c.campaignsCompleted||0)>=1},
{id:'campaign_perfect',icon:'3S',name:'완벽한 3일',desc:'한 캠페인의 3일을 모두 S등급으로 완료',test:c=>(c.campaignPerfect||0)>=1}
];
