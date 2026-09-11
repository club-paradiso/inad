// Data extracted verbatim from the v6.1 baseline (legacy/v6.1) — entry-basis lookup tables used by the queue generator
// Legal/game content: do not edit without a documented review (docs/legal-baseline.md).
export const VISA_FREE_RANDOM_CODES = new Set(['USA', 'JPN']);
export const AIRPORT_BY_CODE = {USA:'JFK',JPN:'NRT',VNM:'SGN',CHN:'PVG',IDN:'CGK',NPL:'KTM',PHL:'MNL',EGY:'CAI',THA:'BKK',IND:'DEL',MNG:'UBN',MYS:'KUL',SGP:'SIN',DEU:'FRA',FRA:'CDG',GBR:'LHR',ESP:'MAD',ITA:'FCO',NLD:'AMS',POL:'WAW',CZE:'PRG',MAR:'CMN',KAZ:'ALA',UZB:'TAS',BGD:'DAC',ZAF:'JNB',KEN:'NBO',NGA:'LOS',GHA:'ACC',AUS:'SYD',CAN:'YYZ'};
export const FICTIONAL_HOTELS = ['서울 센트럴 호텔','명동 시티 호텔','한강 비즈니스 호텔','을지로 스테이','마포 리버 호텔','인사동 가든 호텔','송파 어반 스테이'];
export const FICTIONAL_CARRIERS = ['가상항공 A','가상항공 B','가상항공 C','가상항공 D'];
export const PARTY_TYPES = [
 {type:'family',label:'가족여행',size:3,purpose:'가족 관광',relation:['보호자','배우자','자녀']},
 {type:'couple',label:'부부·연인 여행',size:2,purpose:'개인 관광',relation:['동행인','동행인']},
 {type:'business',label:'출장팀',size:3,purpose:'업무 회의 참석',relation:['팀장','동료','동료']},
 {type:'friends',label:'친구 여행',size:2,purpose:'개인 관광',relation:['친구','친구']},
 {type:'tour',label:'소규모 단체관광',size:4,purpose:'단체 관광',relation:['대표예약자','동행인','동행인','동행인']}
];
