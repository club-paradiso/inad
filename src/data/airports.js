// Public-airport-inspired gameplay profiles.
// Airport identity and codes are real; all workload modifiers below are explicitly fictional
// balancing variables. They must never be treated as real staffing, risk or enforcement data.
export const AIRPORTS = [
  {
    id: 'icn-t2', code: 'ICN', nameKo: '인천국제공항 T2', nameEn: 'Incheon International Airport T2',
    locationKo: '제2여객터미널 · 입국심사장', locationEn: 'Terminal 2 · Immigration Hall',
    profileKo: '국가 허브형 · 가장 복합적인 기본 프리셋', profileEn: 'National hub · most complex baseline preset',
    rating: 4, arrivalFactor: 1.00, eventDelta: 0, eventImpact: 1.00, workFactor: 1.00, lookupFactor: 1.00, interpreterExtra: 0, fatigueFactor: 1.00,
    simBooths: 18
  },
  {
    id: 'gmp', code: 'GMP', nameKo: '김포국제공항', nameEn: 'Gimpo International Airport',
    locationKo: '국제선 · 입국심사장', locationEn: 'International Terminal · Immigration Hall',
    profileKo: '수도권 단거리 국제선형 · 비교적 완만한 운영압박', profileEn: 'Metro short-haul international · lower operational pressure',
    rating: 3, arrivalFactor: .82, eventDelta: -1, eventImpact: .92, workFactor: .96, lookupFactor: .98, interpreterExtra: 0, fatigueFactor: .96,
    simBooths: 12
  },
  {
    id: 'pus', code: 'PUS', nameKo: '김해국제공항', nameEn: 'Gimhae International Airport',
    locationKo: '국제선 · 입국심사장', locationEn: 'International Terminal · Immigration Hall',
    profileKo: '동남권 관문형 · 중간 수준의 승객 흐름과 운영변수', profileEn: 'Southeast gateway · medium passenger flow and operational events',
    rating: 3, arrivalFactor: .90, eventDelta: 0, eventImpact: .96, workFactor: .98, lookupFactor: 1.00, interpreterExtra: 2, fatigueFactor: .98,
    simBooths: 14
  },
  {
    id: 'cju', code: 'CJU', nameKo: '제주국제공항', nameEn: 'Jeju International Airport',
    locationKo: '국제선 · 입국심사장', locationEn: 'International Terminal · Immigration Hall',
    profileKo: '관광지 관문형 · 단체승객과 도착편 집중 이벤트가 잦은 게임 프리셋', profileEn: 'Tourism gateway · gameplay preset with more group-arrival surges',
    rating: 4, arrivalFactor: 1.03, eventDelta: 1, eventImpact: 1.03, workFactor: 1.00, lookupFactor: 1.00, interpreterExtra: 3, fatigueFactor: 1.02,
    simBooths: 14
  },
  {
    id: 'cjj', code: 'CJJ', nameKo: '청주국제공항', nameEn: 'Cheongju International Airport',
    locationKo: '국제선 · 입국심사장', locationEn: 'International Terminal · Immigration Hall',
    profileKo: '중부권 관문형 · 대기열은 낮지만 지원자원 변수가 있는 프리셋', profileEn: 'Central regional gateway · lower queues with some support-resource friction',
    rating: 3, arrivalFactor: .74, eventDelta: -1, eventImpact: .92, workFactor: .98, lookupFactor: 1.03, interpreterExtra: 4, fatigueFactor: .96,
    simBooths: 9
  },
  {
    id: 'tae', code: 'TAE', nameKo: '대구국제공항', nameEn: 'Daegu International Airport',
    locationKo: '국제선 · 입국심사장', locationEn: 'International Terminal · Immigration Hall',
    profileKo: '지역 국제선형 · 낮은 혼잡과 적은 현장 이벤트', profileEn: 'Regional international · lower congestion and fewer field events',
    rating: 2, arrivalFactor: .68, eventDelta: -1, eventImpact: .88, workFactor: .95, lookupFactor: 1.02, interpreterExtra: 4, fatigueFactor: .94,
    simBooths: 8
  },
  {
    id: 'mwx', code: 'MWX', nameKo: '무안국제공항', nameEn: 'Muan International Airport',
    locationKo: '국제선 · 입국심사장', locationEn: 'International Terminal · Immigration Hall',
    profileKo: '서남권 지역형 · 낮은 유입량 대신 일부 지원 절차가 느린 게임 프리셋', profileEn: 'Southwest regional · low arrivals with slower simulated support steps',
    rating: 2, arrivalFactor: .60, eventDelta: -2, eventImpact: .86, workFactor: .94, lookupFactor: 1.04, interpreterExtra: 6, fatigueFactor: .93,
    simBooths: 7
  },
  {
    id: 'yny', code: 'YNY', nameKo: '양양국제공항', nameEn: 'Yangyang International Airport',
    locationKo: '국제선 · 입국심사장', locationEn: 'International Terminal · Immigration Hall',
    profileKo: '소규모 지역형 · 가장 낮은 대기압박의 입문 프리셋', profileEn: 'Small regional · lowest queue pressure for beginners',
    rating: 1, arrivalFactor: .52, eventDelta: -2, eventImpact: .82, workFactor: .92, lookupFactor: 1.05, interpreterExtra: 7, fatigueFactor: .90,
    simBooths: 6
  }
];

export const DEFAULT_AIRPORT_ID = 'icn-t2';
export const airportById = (id) => AIRPORTS.find((a) => a.id === id) || AIRPORTS[0];
