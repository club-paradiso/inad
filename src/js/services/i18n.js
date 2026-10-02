// UI localization for INAD. Korean remains the source language and default locale.
// This layer deliberately does not touch case/legal state: it only translates rendered UI text.
import { storeGet, storeSet } from './storage.js';

const LOCALE_KEY = 'inad-locale';
const ATTRS = ['aria-label', 'title', 'placeholder', 'alt'];
const originalText = new WeakMap();
const originalAttrs = new WeakMap();
let locale = normalizeLocale(storeGet(LOCALE_KEY, 'ko'));
let observer = null;
let initialized = false;

const EXACT = new Map([
  ['대상자', 'Traveler'],
  ['인터뷰', 'Interview'],
  ['자료', 'Evidence'],
  ['판단', 'Assessment'],
  ['결정', 'Decision'],
  ['승객', 'Traveler'],
  ['운영', 'Operations'],
  ['작업 이동', 'Task navigation'],
  ['자료 보기', 'Evidence view'],
  ['입국 요건', 'Entry requirements'],
  ['확인 사항', 'Verified facts'],
  ['법적 근거', 'Legal basis'],
  ['단서', 'Clues'],
  ['진행 기록', 'Actions taken'],
  ['대기', 'Queue'],
  ['평균', 'Avg.'],
  ['평가', 'Rating'],
  ['허가', 'Admitted'],
  ['불허', 'Refused'],
  ['처리시간', 'Elapsed'],
  ['태도', 'Demeanor'],
  ['언어', 'Language'],
  ['긴장', 'Tension'],
  ['협조', 'Cooperation'],
  ['가상 인물', 'Fictional person'],
  ['출입국관리법 제12조제3항', 'Immigration Act Art. 12(3)'],
  ['제12조 입국심사', 'Art. 12 inspection'],
  ['추가 소명·사실확인', 'Further clarification / fact-finding'],
  ['제12조제4항 · 사유 선택', 'Art. 12(4) · select reason'],
  ['감식 · 조사 · 체포요건', 'Forensics · investigation · arrest review'],
  ['일반심사 중', 'Primary inspection in progress'],
  ['사건 조회 준비 완료 · 필요한 항목만 조회하십시오. 내부 규제코드·비공개 위험선별 알고리즘은 재현하지 않습니다.', 'Case lookup ready · query only what you need. Internal regulatory codes and non-public screening algorithms are not reproduced.'],
  ['다시 눌러 확정', 'Tap again to confirm'],
  ['현재 사건 요약 및 심사 단계', 'Current case summary and inspection stage'],
  ['판단 및 결정', 'Assessment and decision'],
  ['본문 바로가기', 'Skip to main content'],
  ['INAD: 제12조', 'INAD: Article 12'],
  ['인천공항 제2여객터미널 · 입국심사 시뮬레이션', 'Incheon Airport Terminal 2 · Immigration Inspection Simulation'],
  ['근무조', 'Duty shift'],
  ['근무 현황', 'Duty status'],
  ['처리', 'Processed'],
  ['종합평가', 'Overall rating'],
  ['보조 메뉴', 'Utility menu'],
  ['도움말', 'Help'],
  ['오늘의 미션', 'Daily missions'],
  ['근무기록', 'Duty records'],
  ['음향 켬', 'Sound on'],
  ['음향 끔', 'Sound off'],
  ['메뉴', 'Menu'],
  ['업무참고', 'Reference'],
  ['업무지침', 'Work Manual'],
  ['프로필', 'Profile'],
  ['설정', 'Settings'],
  ['법령·출처 등록부', 'Laws & Sources'],
  ['시스템·데이터', 'System & Data'],
  ['현장 운영 상황', 'Field operations status'],
  ['운영상황 정상', 'Normal operations'],
  ['현재 적용 중인 현장 이벤트가 없습니다.', 'No field event is currently active.'],
  ['난이도', 'Difficulty'],
  ['시나리오', 'Scenario'],
  ['캠페인', 'Campaign'],
  ['피로도', 'Fatigue'],
  ['도전', 'Challenge'],
  ['운영기록', 'Operations log'],
  ['대기 승객 현황', 'Waiting traveler status'],
  ['업무압박', 'Workload pressure'],
  ['보통', 'Moderate'],
  ['낮음', 'Low'],
  ['입국허가', 'Admitted'],
  ['재심', 'Secondary'],
  ['입국불허', 'Refused'],
  ['연계사건', 'Linked case'],
  ['캠페인 연계기록', 'Campaign-linked record'],
  ['선택정보', 'Optional information'],
  ['연계기록 열기', 'Open linked record'],
  ['현재 피심사인 초상', 'Current traveler portrait'],
  ['실시간 촬영', 'Live capture'],
  ['여권번호', 'Passport no.'],
  ['신청 체류', 'Requested stay'],
  ['입국목적', 'Purpose of entry'],
  ['입국편', 'Arrival flight'],
  ['입국기반', 'Entry basis'],
  ['일반심사', 'Primary inspection'],
  ['상호작용 상태', 'Interaction status'],
  ['판정근거 아님', 'Not a decision factor'],
  ['긴장도', 'Tension'],
  ['협조도', 'Cooperation'],
  ['주언어', 'Primary language'],
  ['한국어', 'Korean'],
  ['영어', 'English'],
  ['진술 기록', 'Interview record'],
  ['의사소통 확인', 'Communication check'],
  ['질문 언어 또는 통역을 선택하십시오.', 'Select a question language or an interpreter.'],
  ['통역 호출', 'Call interpreter'],
  ['질문 언어', 'Question language'],
  ['제출 서류', 'Submitted documents'],
  ['제출 서류 목록', 'Submitted document list'],
  ['입국요건 검토', 'Entry requirements review'],
  ['판단 준비도', 'Decision readiness'],
  ['0개 완료', '0 completed'],
  ['공개 기준 시뮬레이션', 'Public-criteria simulation'],
  ['전산 조회', 'System lookup'],
  ['전산 조회 항목', 'System lookup categories'],
  ['출입국기록', 'Immigration history'],
  ['사증·자격', 'Visa/status'],
  ['항공 PNR', 'Flight PNR'],
  ['국내관계', 'Domestic contacts'],
  ['동행인', 'Companions'],
  ['공개정보', 'Public information'],
  ['심사 결정', 'Inspection decision'],
  ['입국 허가', 'Admit'],
  ['입국재심 인계', 'Refer to secondary'],
  ['입국 불허가', 'Refuse entry'],
  ['출입국사범 절차', 'Immigration offense procedure'],
  ['특수절차', 'Special procedure'],
  ['추가 확인', 'Additional verification'],
  ['사유 선택', 'Select reason'],
  ['입국재심', 'Secondary inspection'],
  ['출입국관리법 제12조 입국심사의 계속', 'Continuation of immigration inspection under Article 12 of the Immigration Act'],
  ['일반 심사대 보기', 'Return to primary desk'],
  ['가상 시스템 · 실제 법무부 내부전산 또는 비공개 심사기준을 재현한 것이 아님', 'Fictional system · does not reproduce Ministry of Justice internal systems or non-public screening criteria'],
  ['감찰 경고', 'Inspection warnings'],
  ['감찰', 'Warnings'],
  ['대한민국 공항 입국심사 · FICTIONAL SIMULATION', 'REPUBLIC OF KOREA AIRPORT IMMIGRATION · FICTIONAL SIMULATION'],
  ['입국심사관 시뮬레이션', 'Immigration Officer Simulation'],
  ['인천공항출입국·외국인청', 'Incheon Airport Immigration Office'],
  ['제2여객터미널 · 입국심사장', 'Terminal 2 · Immigration Hall'],
  ['가상 시뮬레이션', 'Fictional simulation'],
  ['오늘의 근무 배치', "Today's duty roster"],
  ['다른 배치 생성', 'Generate another roster'],
  ['현재 근무 구성', 'Current duty setup'],
  ['표준 · 기본 근무 · 단일 근무 · 처음 근무 · 일반 근무', 'Standard · Normal duty · Single shift · Guided · No challenge'],
  ['시스템', 'System'],
  ['권장값', 'Defaults'],
  ['세부 설정', 'Advanced settings'],
  ['세부 설정 접기', 'Hide advanced settings'],
  ['근무 난이도', 'Duty difficulty'],
  ['법률상 정답은 동일하며 운영압박만 달라집니다.', 'Legal outcomes are unchanged; only operational pressure varies.'],
  ['훈련', 'Training'],
  ['표준', 'Standard'],
  ['실전', 'Realistic'],
  ['권장 모드 · 현장 이벤트 6회 · 기본 업무압박', 'Recommended · 6 field events · standard workload pressure'],
  ['완만한 유입 · 현장 이벤트 4회 · 시스템 지연 영향 축소', 'Slower arrivals · 4 field events · reduced system-delay impact'],
  ['빠른 유입 · 현장 이벤트 8회 · 혼잡·지연 영향 증가', 'Faster arrivals · 8 field events · stronger congestion/delay impact'],
  ['기본 근무', 'Normal duty'],
  ['단일 근무', 'Single shift'],
  ['처음 근무', 'Guided'],
  ['일반 근무', 'No challenge'],
  ['이전 근무 이어하기', 'Resume previous duty'],
  ['자동저장 · 승객 처리 완료 시 체크포인트 생성', 'Autosave · checkpoint created after each traveler'],
  ['금일 입국심사 브리핑', "Today's immigration briefing"],
  ['현재 대기', 'Currently waiting'],
  ['예정 현장 이벤트', 'Scheduled field events'],
  ['평가 방식', 'Scoring'],
  ['정확성 + 절차 + 효율 + 비례성', 'Accuracy + procedure + efficiency + proportionality'],
  ['제1근무조 시작', 'Start Shift 1'],
  ['접근성·조작 설정', 'Accessibility & controls'],
  ['화면 표시', 'Display'],
  ['설정은 게임 점수나 법률상 판단에 영향을 주지 않습니다.', 'These settings do not affect scores or legal decisions.'],
  ['글자 크기', 'Text size'],
  ['기본', 'Default'],
  ['크게', 'Large'],
  ['고대비', 'High contrast'],
  ['애니메이션 감소', 'Reduce motion'],
  ['단축키 표시', 'Show shortcuts'],
  ['키보드 단축키', 'Keyboard shortcuts'],
  ['음향·자막', 'Audio & captions'],
  ['사용 중', 'On'],
  ['사용 안 함', 'Off'],
  ['표시 중', 'Shown'],
  ['숨김', 'Hidden'],
  ['단축키 사용', 'Use shortcuts'],
  ['한 글자·숫자 단축키(K, H, 1–6, M 등)를 사용합니다. 끄면 Alt 조합·F1·Esc만 동작합니다.', 'Single-key shortcuts (K, H, 1–6, M …). When off, only Alt combinations, F1 and Esc work.'],
  ['주요 업무 텍스트를 조금 더 크게 표시합니다.', 'Shows the main working text slightly larger.'],
  ['텍스트와 패널 경계의 대비를 강화합니다.', 'Stronger contrast for text and panel borders.'],
  ['스캔·전환·알림 애니메이션을 최소화합니다.', 'Minimises scan, transition and alert animations.'],
  ['주요 버튼 모서리에 키보드 조작 힌트를 표시합니다.', 'Shows keyboard hints next to the main buttons.'],
  ['Tab / Shift+Tab과 Enter / Space는 브라우저 표준 포커스·버튼 조작을 그대로 사용합니다. 최종 결정은 오입력을 줄이기 위해 Alt 조합을 사용합니다.', 'Tab / Shift+Tab and Enter / Space work as standard browser focus and button controls. Final decisions use Alt combinations to reduce mistakes.'],
  ['업무참고 · 공개 기준', 'Reference · Public criteria'],
  ['도움말 · 심사관 업무 안내', 'Help · Immigration officer guide'],
  ['화면 안내 다시 보기', 'Replay interface tour'],
  ['핵심 심사 원칙', 'Core inspection principles'],
  ['법령·공개기준', 'Laws & public criteria'],
  ['근무기록·리플레이', 'Duty records & replay'],
  ['심사관 프로필', 'Officer profile'],
  ['닫기', 'Close'],
  ['확인', 'Confirm'],
  ['취소', 'Cancel'],
  ['계속', 'Continue'],
  ['다음', 'Next'],
  ['이전', 'Previous'],
  ['저장', 'Save'],
  ['불러오기', 'Import'],
  ['새 근무 배치를 생성했습니다.', 'A new duty roster was generated.'],
  ['이어할 저장된 근무가 없습니다.', 'There is no saved duty to resume.'],
  ['저장된 근무를 복원했습니다.', 'Saved duty restored.'],
  ['근무 시작', 'Start duty'],
  ['제1근무조 입국심사를 시작합니다.', 'Shift 1 immigration inspection is now starting.'],
  ['자동저장 복원', 'Autosave restored'],
  ['승객 호출', 'Traveler call'],
  ['12번 심사대로 오십시오.', 'Please proceed to inspection booth 12.'],
  ['현재 호출 승객', 'Current traveler'],
  ['대기 승객', 'Waiting traveler'],
  ['음향 시스템', 'Audio system'],
  ['효과음과 안내방송 차임을 사용합니다.', 'Sound effects and announcement chimes are enabled.'],
  ['음향을 끕니다. 화면 자막은 계속 표시됩니다.', 'Audio is off. On-screen captions remain available.'],
  ['한국어 직접', 'Korean, direct'],
  ['영어 직접', 'English, direct'],
  ['직접 의사소통 곤란', 'Direct communication difficult'],
  ['동행 사실 자체는 입국판정 근거가 아닙니다.', 'Travelling together is not a basis for the entry decision.'],
  ['동행인 기록', 'Companion record'],
  ['여권', 'Passport'],
  ['숙박예약', 'Accommodation booking'],
  ['입국자격 자료', 'Entry eligibility record'],
  ['항공예약', 'Flight booking'],
  ['동행여행 확인자료', 'Travel-party records'],
  ['신원', 'Identity'],
  ['입국자격', 'Entry eligibility'],
  ['여행계획', 'Travel plan'],
  ['체재능력', 'Means of stay'],
  ['충족', 'met'],
  ['일치', 'match'],
  ['확정', 'confirmed'],
  ['충분', 'sufficient'],
  ['미충족', 'not met'],
  ['미확인', 'unchecked'],
  ['정상', 'Normal'],
  ['주의', 'Caution'],
  ['경고', 'Warning'],
  ['법정 요건 확인 완료', 'Statutory requirements checked'],
  ['확인이 남은 항목 있음', 'Some items remain to be checked'],
  ['단서의 존재만으로 불허·체포를 결정하지 마십시오. 서로 독립된 진술·서류·전산정보를 교차검증해야 합니다.', 'Do not refuse or arrest on a clue alone. Cross-check independent statements, documents and records.'],
  ['근거 패널은 설명용입니다. 최종 판단은 심사관이 전체 사실관계와 법정 요건을 종합해 내립니다.', 'This panel explains; the officer decides on all facts and the statutory requirements.'],
  ['필요한 확인이 충분합니다. 전체 사실관계와 법적 근거를 종합해 판단하십시오.', 'The required checks are sufficient. Decide on all facts and the legal basis.'],
  ['아직 기록 없음', 'No actions yet'],
  ['직접 의사소통이 곤란합니다. 통역 호출을 권고합니다.', 'Direct communication is difficult. Calling an interpreter is advised.'],
  ['신원 미확인', 'identity unverified'],
  ['입국재심 진행 중 · 재심 인계 완료', 'Secondary inspection in progress'],
  ['결정 기록됨 · 후속 절차 또는 다음 승객', 'Decision recorded · follow-up or next traveler'],
  ['난민 회부 여부 결정 후 입국 판단', 'Decide on referral before entry'],
  ['출입국사범 조사 전용화면', 'Offence investigation screen'],
  ['감식 · 조사 · 긴급체포 요건', 'Forensics · investigation · arrest review'],
  ['현재 조사 상태 유지', 'Keeps the investigation status'],
  ['난민신청·회부심사 전용화면', 'Refugee claim · referral screen'],
  ['난민 회부심사 계속', 'Continue referral screening'],
  ['난민법 제6조 · 시행령 제5조', 'Refugee Act Art. 6 · Decree Art. 5'],
  ['출입국항 난민 회부심사', 'Port-of-entry refugee referral screening'],
  ['출입국사범 조사', 'Immigration-offence investigation'],
  ['입국불허 후 송환', 'Repatriation after entry refusal'],
  ['출입국관리법 제12조 · 추가 소명 및 사실확인', 'Immigration Act Art. 12 · further explanation and fact-finding'],
  ['난민법 제6조 · 난민법 시행령 제5조', 'Refugee Act Art. 6 · Enforcement Decree Art. 5'],
  ['출입국관리법 제47·48조 · 형사소송법 제200조의3', 'Immigration Act Arts. 47–48 · Criminal Procedure Act Art. 200-3'],
  ['출입국관리법 제76조 · 제76조의2', 'Immigration Act Arts. 76 and 76-2'],
  ['진술·소명 검토', 'Statements & explanation'],
  ['재심 작업목록', 'Secondary worklist'],
  ['증거·전산조회', 'Evidence · lookups'],
  ['재심 인계 사유', 'Reason for referral'],
  ['진술 비교', 'Statement comparison'],
  ['자동 모순 검토 보조', 'Inconsistency check aid'],
  ['최초 진술', 'First statement'],
  ['현재까지 확인된 진술', 'Latest confirmed statement'],
  ['최초 진술 기록 없음', 'No first statement recorded'],
  ['추가 질문', 'Follow-up questions'],
  ['추가 질문 완료', 'Follow-up questions done'],
  ['추가 확인을 위해 재심으로 인계됨', 'Referred to secondary for further checks'],
  ['진술 내용이 변경되었습니다. 변경 자체가 위반사실을 의미하지 않으며 추가 소명이 필요합니다.', 'The statement changed. A change is not itself a violation; further explanation is needed.'],
  ['재심의 성격', 'Nature of secondary inspection'],
  ['재심은 별도의 제재처분이 아니라 출입국관리법 제12조에 따른 입국심사의 계속입니다.', 'Secondary inspection is not a sanction; it continues the entry inspection under Immigration Act Art. 12.'],
  ['소명이 완료된 경우', 'When the explanation is complete'],
  ['입국불허 검토', 'Consider refusal'],
  ['법정 사유 선택', 'Choose a statutory reason'],
  ['난민신청·회부심사', 'Refugee claim · referral screening'],
  ['난민법 제6조 전용 절차로 이동', 'Go to the Refugee Act Art. 6 procedure'],
  ['문서감식·사범조사', 'Forensics · offence investigation'],
  ['구체적 범죄혐의 확인 절차', 'Procedure to establish a concrete offence'],
  ['재심 상태를 유지한 채 원 화면 확인', 'Keeps the secondary status'],
  ['난민신청 의사가 진술되지 않음 · 진술이 있어야 신청 절차를 개시합니다', 'No refugee claim stated · the procedure starts only after a stated claim'],
  ['회부심사 기록', 'Referral screening record'],
  ['최대 7일 · 게임상 시간 압축', 'Up to 7 days · compressed in game time'],
  ['절차 타임라인', 'Procedure timeline'],
  ['인터뷰상 확인사항', 'Findings from the interview'],
  ['사건 데이터', 'Case data'],
  ['회부심사 인터뷰', 'Referral interview'],
  ['진술 구체화', 'Detailing the statement'],
  ['회부심사 결정', 'Referral decision'],
  ['난민신청 의사 확인', 'Refugee claim stated'],
  ['난민인정신청 접수', 'Application received'],
  ['회부 여부 심사', 'Referral screening'],
  ['회부/불회부 결정', 'Refer / not refer'],
  ['출입국관리법상 입국심사', 'Entry inspection (Immigration Act)'],
  ['현재 단계', 'Current step'],
  ['진행 중', 'In progress'],
  ['현재 심사 중', 'Being examined now'],
  ['심사 완료', 'Examined'],
  ['심사 대기', 'Waiting'],
  ['완료', 'Done'],
  ['정치적 박해 주장', 'Political persecution claim'],
  ['종교적 박해 주장', 'Religious persecution claim'],
  ['특정 사회집단·정치적 견해 관련 박해 진술', 'Persecution for social group / political opinion'],
  ['취업·소득 목적 진술', 'Work / income purpose statement'],
  ['확인되지 않음', 'not established'],
  ['반복 확인', 'confirmed repeatedly'],
  ['미확인 · 해당 인터뷰 전', 'not checked · interview not yet held'],
  ['박해 사유 인터뷰(난민 질문)를 아직 하지 않았습니다. 불회부는 신청 사유를 검토한 뒤 판단하십시오.', 'The persecution interview has not been held. Decide non-referral only after examining the claim.'],
  ['회부심사 개시', 'Start referral screening'],
  ['난민인정심사 불회부', 'Do not refer to refugee status determination'],
  ['시행령 제5조제1항제7호 · 게임상 사실관계', 'Enforcement Decree Art. 5(1)(vii) · case facts in this game'],
  ['난민인정심사 회부', 'Refer to refugee status determination'],
  ['이 사건에서는 근거가 부족한 선택', 'Not supported by this case'],
  ['입국심사로 복귀', 'Return to entry inspection'],
  ['제12조상 입국 여부를 별도로 판단', 'Decide entry separately under Art. 12'],
  ['현재 절차 상태 유지', 'Keeps the procedure status'],
  ['난민인정 신청이 접수되었습니다. 회부 여부 심사를 개시하십시오.', 'The application was received. Start the referral screening.'],
  ['회부 여부를 판단할 수 있습니다. 이 케이스의 인터뷰·자료를 검토하십시오.', 'You can decide on referral. Review this case’s interview and documents.'],
  ['불회부 결정 후 입국심사로 복귀했습니다.', 'Returned to entry inspection after the non-referral decision.'],
  ['난민신청 절차를 진행하십시오.', 'Continue the refugee procedure.'],
  ['절차상 주의', 'Procedural note'],
  ['불회부 결정은 입국불허와 동일한 처분이 아닙니다. 불회부 후 출입국관리법에 따른 입국심사로 돌아갑니다.', 'Non-referral is not the same decision as entry refusal. After it, the entry inspection under the Immigration Act resumes.'],
  ['공개 법령 근거', 'Published legal basis'],
  ['신원·문서 감식', 'Identity & document forensics'],
  ['실제 얼굴 ↔ 여권상 명의', 'Live face ↔ passport holder'],
  ['여권/칩 사진', 'Passport / chip photo'],
  ['전자문서 이상', 'Electronic document anomaly'],
  ['문서 감식', 'Document forensics'],
  ['긴급체포 요건', 'Emergency-arrest requirements'],
  ['위·변조 판정 확보', 'Forgery finding secured'],
  ['전자칩/MRZ 이상 정밀확인 필요', 'Chip / MRZ anomaly needs examination'],
  ['조사 착수·분리 기록', 'Investigation opened · recorded separately'],
  ['감식 후 구체적 혐의 확립 필요', 'Concrete suspicion needed after forensics'],
  ['요건별 검토 단계', 'Requirement review'],
  ['자동 체포 금지', 'No automatic arrest'],
  ['조사 후속 질문', 'Investigation questions'],
  ['감식·조사 결과에 따라 해금', 'Unlocked by forensics / investigation'],
  ['조사 조치', 'Investigation steps'],
  ['여권·문서 감식 의뢰', 'Request passport & document forensics'],
  ['위변조 의심 문서 진위 확인', 'Verify a suspected forged document'],
  ['출입국사범 조사 전환', 'Open offence investigation'],
  ['입국심사와 형사·행정 조사를 분리 기록', 'Recorded separately from the entry inspection'],
  ['긴급체포 요건 검토', 'Review emergency-arrest requirements'],
  ['위조여권 발견만으로 자동 체포하지 않음', 'A forged passport alone does not trigger arrest'],
  ['긴급체포 집행', 'Execute emergency arrest'],
  ['모든 법정요건 확인 후 · 미충족 집행은 위법', 'Only when every statutory requirement is met · otherwise unlawful'],
  ['문서 감식으로 구체적 범죄혐의를 먼저 확인해야 합니다', 'Establish a concrete offence by forensics first'],
  ['출입국사범 조사 전환 후에만 검토할 수 있습니다 · 위조여권 발견만으로 자동 체포하지 않음', 'Only after an investigation is opened · a forged passport alone does not trigger arrest'],
  ['신문 전 통역 확보', 'Secure an interpreter before questioning'],
  ['통역 확보 필요 · 출입국관리법 제48조제6항: 국어가 통하지 않는 용의자의 진술은 통역인에게 통역하게 합니다.', 'Interpreter required · Immigration Act Art. 48(6): a suspect who does not understand Korean is questioned through an interpreter.'],
  ['특별사법경찰 범위', 'Special judicial police scope'],
  ['출입국관리 업무 종사 4~7급 공무원은 법정 범위의 출입국관리에 관한 범죄 등에 대해 사법경찰관 직무를 수행합니다.', 'Immigration officers of grades 4–7 act as judicial police officers for immigration offences within the statutory scope.'],
  ['조사 기록 원칙', 'Investigation record rule'],
  ['출입국관리법 제48조상 용의자 신문은 다른 출입국관리공무원이 참여하고, 진술은 조서에 기록하는 구조입니다. 일반 입국재심 인터뷰와 구분합니다.', 'Under Immigration Act Art. 48 a suspect is questioned with another officer present and the statement is recorded in a report — distinct from a secondary-inspection interview.'],
  ['형사소송법 제200조의3', 'Criminal Procedure Act Art. 200-3'],
  ['출입국관리법 제47·48조', 'Immigration Act Arts. 47–48'],
  ['장기 3년 이상 징역·금고 해당 범죄 및 범죄혐의의 상당한 이유', 'An offence punishable by 3+ years and probable cause'],
  ['증거인멸 또는 도망·도망 우려', 'Risk of destroying evidence or of flight'],
  ['체포영장을 받을 시간적 여유가 없는 긴급성', 'Urgency: no time to obtain a warrant'],
  ['송환 절차 타임라인', 'Repatriation timeline'],
  ['입국 불허가 결정·통지', 'Entry refusal decided and notified'],
  ['운수업자 송환지시', 'Repatriation order to the carrier'],
  ['출국대기실 인계', 'Hand over to the departure waiting room'],
  ['대한민국 밖으로 송환', 'Removed from Korea'],
  ['운항계획에 따라 진행', 'According to the flight schedule'],
  ['운수업자', 'Carrier'],
  ['송환대상 외국인을 비용과 책임으로 대한민국 밖으로 송환하는 절차를 진행합니다.', 'The carrier removes the person from Korea at its own cost and responsibility.'],
  ['후속 집행', 'Follow-up'],
  ['법정서식·대기장소', 'Statutory forms · waiting area'],
  ['송환지시서 발급', 'Issue repatriation order'],
  ['운수업자에게 제76조에 따른 송환지시', 'Art. 76 order to the carrier'],
  ['제76조의2 · 국가 관리 출국대기실', 'Art. 76-2 · state-run waiting room'],
  ['송환대기 처리 완료', 'Close the case'],
  ['사건을 종결하고 다음 승객 호출', 'Close the case and call the next traveler'],
  ['송환대기장소', 'Waiting area'],
  ['송환대상외국인은 출국 전까지 출국대기실에서 대기하는 것이 원칙이며, 법정 예외에 따라 출입국항 내 지정장소에서 조건부 대기가 가능합니다.', 'A person to be repatriated waits in the departure waiting room; statutory exceptions allow conditional waiting at a designated place in the port.'],
  ['INAD 표시', 'INAD label'],
  ['INAD는 게임상·항공운송상 상태표시이며 대한민국 법률상 처분명은 ‘입국 불허가’입니다.', 'INAD is an aviation/game status label; the legal decision under Korean law is “entry refusal”.'],
  ['상호작용 상태 · 판정근거 아님', 'Interaction state · not a basis for decisions'],
  ['언어·통역 · 판정근거 아님', 'Language & interpreting · not a basis for decisions'],
  ['직접 의사소통이 부족하면 통역을 호출하십시오.', 'Call an interpreter if direct communication is insufficient.'],
  ['동행여행 교차검증', 'Travel-party cross-check'],
  ['앞서 처리된 동행인 진술', 'Statements of companions already processed'],
  ['같은 PNR·숙소·동행관계는 진술 교차검증 자료입니다. 가족·단체여행이라는 이유 자체로 불리하게 판단하지 않습니다.', 'A shared PNR, lodging or relationship is cross-check material. Travelling as a family or group is never held against anyone.'],
  ['최근 진술·조회', 'Recent statements & lookups'],
  ['사건 기록', 'Case record'],
  ['확보 단서', 'Clues found'],
  ['아직 연결된 단서 없음', 'No clues linked yet'],
  ['요건 확인', 'Requirements confirmed'],
  ['질문', 'Ask'],
  ['신문', 'Question'],
  ['조회', 'Look up'],
  ['재조회', 'Look up again'],
  ['심사관', 'Officer'],
  ['피심사인', 'Traveler'],
  ['통역', 'Interpreter'],
  ['처리완료', 'Processed'],
  ['현재심사', 'In inspection'],
  ['방문목적', 'Purpose'],
  ['체류예정', 'Planned stay'],
  ['입국 불허가 사유 선택 · 출입국관리법 제12조제4항', 'Choose the refusal reason · Immigration Act Art. 12(4)'],
  ['유효한 여권·사증 요건 미충족', 'Valid passport / visa requirement not met'],
  ['사전여행허가 요건 미충족', 'Travel-authorisation (K-ETA) requirement not met'],
  ['입국목적과 체류자격 불일치 또는 목적 소명 실패', 'Purpose does not match the status, or not explained'],
  ['생체정보 제공·본인확인 절차 불응', 'Refused biometrics / identity verification'],
  ['대한민국의 이익 또는 공공안전 위해 우려', 'Risk to national interest or public safety'],
  ['경제·사회질서 또는 선량한 풍속 저해 우려', 'Risk to economic / social order or public morals'],
  ['강제퇴거 후 5년 미경과', 'Less than 5 years since deportation'],
  ['근거 조문 안내', 'Statutory references'],
  ['SIM 코드는 실제 법무부 내부 분류코드가 아닙니다.', 'SIM codes are not real Ministry of Justice codes.'],
  ['심사결정', 'Decision'],
  ['후속절차', 'Follow-up'],
  ['확대', 'Zoom'],
  ['제출자료', 'Submitted'],
  ['추가 확인 필요', 'Needs further check'],
  ['송환 절차 계속', 'Continue repatriation'],
  ['송환지시 · 출국대기실 · 사건 종결', 'Repatriation order · waiting room · close case'],
  ['입국재심 화면 다시 열기', 'Reopen secondary inspection'],
  ['재심 인계 사유 · 진술 비교 · 추가 확인', 'Referral reasons · statement comparison · follow-up'],
  ['기본사항', 'Basics'],
  ['여행·체류', 'Travel & stay'],
  ['추가소명', 'Further explanation'],
  ['통역 연결됨', 'Interpreter connected'],
  ['다음 승객 호출', 'Call next traveler'],
  ['운항정보 확인 중…', 'Checking flight data…'],
  ['저장소 사용 불가 · 이 브라우저에서는 진행이 저장되지 않습니다', 'Storage unavailable · progress is not saved in this browser'],
  ['근무 중에는 저장된 근무를 불러올 수 없습니다.', 'A saved duty cannot be loaded during a shift.'],
  ['근무를 시작한 뒤 화면 안내를 다시 볼 수 있습니다.', 'Start a duty to replay the screen guide.'],
  ['브라우저 저장소에 쓸 수 없어 진행이 저장되지 않았습니다.', 'Browser storage refused the write; progress was not saved.'],
  ['이렇게 기록할까요?', 'Record it as this?'],
  ['아니면 질문을 고쳐 다시 보내십시오.', 'Or edit your question and send it again.'],
  ['기록 없음', 'None recorded'],
  // v10 live interview
  ['질문 도움', 'Question help'],
  ['인터뷰 진술 기록', 'Interview statement record'],
  ['승객에게 직접 질문', 'Ask the traveler directly'],
  ['직접 질문하십시오', 'Ask your own question'],
  ['말하기', 'Speak'],
  ['라이브 인터뷰', 'Live interview'],
  ['승객 한 명과 직접 대화하는 단일 사건 · 설정 없이 바로 시작', 'Talk directly with one traveler · single case · starts with no setup'],
  ['라이브 인터뷰 사건을 찾지 못했습니다.', 'The live interview case could not be found.'],
  ['통역 지원', 'Interpreter support'],
  ['답변을 준비하고 있습니다', 'Preparing a reply'],
  ['제안', 'Suggested'],
  ['꺼짐', 'Off'],
  ['몰입 모드: 질문 제안을 표시하지 않습니다. 직접 질문하거나 카테고리 탭의 전체 질문 목록을 사용하십시오.', 'Immersive mode: no suggestions are shown. Ask directly or use the full question list under the category tabs.'],
  ['심사가 끝났습니다.', 'The inspection has ended.'],
  ['지금 제안할 질문이 없습니다. 자료를 확인하거나 직접 질문하십시오.', 'No question to suggest right now. Review the documents or ask directly.'],
  ['의사소통 · 질문이 충분히 전달되지 않았습니다', 'Communication · the question was not conveyed clearly enough'],
  ['안내', 'Guided'],
  ['전문', 'Professional'],
  ['몰입', 'Immersive'],
  ['질문이 충분히 전달되지 않았습니다. 질문 언어를 바꾸거나 통역을 연결하십시오.', 'The question was not conveyed clearly enough. Change the question language or connect an interpreter.'],
  ['혹시 이 질문입니까?', 'Did you mean this question?'],
  ['다른 말로 다시 질문하거나 아래 질문 목록을 사용하십시오.', 'Rephrase the question or use the question list below.'],
  ['듣는 중', 'Listening'],
  ['음성 질문은 보안 연결(https)에서만 사용할 수 있습니다.', 'Voice questions are available only over a secure (https) connection.'],
  ['이 브라우저는 음성 인식을 지원하지 않습니다. 직접 입력이나 질문 목록을 사용하십시오.', 'This browser does not support speech recognition. Type your question or use the question list.'],
  ['기기 내 음성 인식 언어 데이터를 내려받는 중입니다…', 'Downloading on-device speech recognition language data…'],
  ['마이크 권한이 없어 음성 질문을 사용할 수 없습니다. 직접 입력은 계속 사용할 수 있습니다.', 'Microphone access is not granted, so voice questions are unavailable. You can still type.'],
  ['음성이 들리지 않았습니다. 다시 말하거나 직접 입력하십시오.', 'No speech was detected. Speak again or type your question.'],
  ['음성 인식이 중단되었습니다. 직접 입력은 계속 사용할 수 있습니다.', 'Speech recognition stopped. You can still type.'],
  ['인식된 문장을 확인·수정한 뒤 [질문]을 누르십시오.', 'Check or edit the transcribed sentence, then press [Ask].'],
  ['음성 인식을 시작하지 못했습니다. 직접 입력을 사용하십시오.', 'Speech recognition could not start. Type your question instead.'],
  ['말씀하십시오. 다시 누르면 멈춥니다.', 'Speak now. Press again to stop.'],
  ['음성 질문 사용', 'Use voice questions'],
  ['이 브라우저에서는 기기 안에서만 처리하는 음성 인식을 사용할 수 없습니다.', 'On-device-only speech recognition is not available in this browser.'],
  ['말한 질문을 브라우저 음성 인식으로 글자로 바꿉니다. 인식된 문장은 질문란에 먼저 표시되고, 확인·수정한 뒤 직접 보내야 합니다.', 'Your spoken question is converted to text by browser speech recognition. The transcribed sentence appears in the question box first; check or edit it, then send it yourself.'],
  ['기기 내 처리만', 'On-device only'],
  ['— 음성이 이 기기를 떠나지 않습니다(지원 브라우저에서만).', '— Audio stays on this device (supported browsers only).'],
  ['브라우저 음성 인식 허용', 'Allow browser speech recognition'],
  ['— 브라우저 제공업체(예: Google, Apple)의 서버에서 음성이 처리될 수 있습니다.', '— Audio may be processed on the browser vendor’s servers (e.g. Google, Apple).'],
  ['INAD는 음성을 녹음·저장·전송하지 않습니다. 음성 사용 여부는 점수와 판정에 영향을 주지 않으며, 직접 입력과 질문 목록은 언제나 사용할 수 있습니다.', 'INAD does not record, store or transmit audio. Whether you use voice has no effect on scoring or decisions, and typing and the question list are always available.'],
  ['기기 내 처리만 사용', 'Use on-device only'],
  ['인터뷰 설정', 'Interview settings'],
  ['제안 질문의 양만 바뀝니다. 규칙·점수·정답은 같습니다.', 'Only the number of suggested questions changes. Rules, scoring and correct outcomes stay the same.'],
  ['안내 모드 따름', 'Follow guidance mode'],
  ['이어서 확인할 질문까지 4개', 'Up to 4, including follow-up questions'],
  ['열린 질문 3개', '3 open questions'],
  ['2개만', 'Only 2'],
  ['제안 없음 · 직접 질문', 'No suggestions · ask directly'],
  ['음성', 'Voice'],
  ['음성 사용은 선택입니다. 점수와 판정에 영향을 주지 않습니다.', 'Voice is optional. It does not affect scoring or decisions.'],
  ['음성 질문', 'Voice questions'],
  ['변경', 'Change'],
  ['음성으로 답변 듣기', 'Hear replies aloud'],
  ['승객의 답변을 기기 음성으로 읽어 줍니다. 자막과 기록은 항상 표시됩니다.', 'The traveler’s replies are read aloud with the device voice. Captions and the record are always shown.'],
  ['이 브라우저는 음성 합성을 지원하지 않습니다.', 'This browser does not support speech synthesis.'],
  ['사건 디브리핑', 'Case debrief'],
  ['판단에 쓰인 질문', 'Questions that informed the decision'],
  ['하지 않은 질문·절차', 'Questions and steps not taken'],
  ['바로잡힌 판단 시도', 'Corrected decision attempts'],
  ['사건 해설', 'Case note'],
  ['절차', 'Procedure'],
  ['심사 처리 결과 · 디브리핑', 'Inspection result · debrief'],
  ['같은 승객 다시 인터뷰', 'Interview the same traveler again'],
  ['시작 화면으로', 'Back to start screen']
]);

const PATTERNS = [
  [/^심사번호\s+([A-Z]?\d+)$/, 'Inspection no. $1'],
  [/^제1근무조 · 기초 심사$/, 'Shift 1 · Basic inspection'],
  [/^제2근무조 · 재심·목적 확인$/, 'Shift 2 · Secondary / purpose review'],
  [/^제3근무조 · 특수사건$/, 'Shift 3 · Special cases'],
  [/^남은\s+(\d+)건$/, '$1 cases remaining'],
  [/^(\d+)개 완료$/, '$1 completed'],
  [/^(\d+)건 · (\d+)종$/, '$1 queries · $2 kinds'],
  [/^필수 절차 (\d+)\/(\d+)(.*)$/, 'Required steps $1/$2$3'],
  [/^자동저장 있음 · SESSION (.+) · (\d+)\/36 처리$/, 'Autosave available · SESSION $1 · $2/36 processed'],
  [/^이전 근무 이어하기 · (\d+)\/36$/, 'Resume previous duty · $1/36'],
  [/^SESSION (.+) · (\d+)명 처리 지점부터 근무를 이어갑니다\.$/, 'SESSION $1 · resuming from $2 travelers processed.'],
  [/^연계사건 · (.+)$/, 'Linked case · $1'],
  [/^도전 (.+) · 시나리오 (.+) · 일반승객 (\d+)명 · 동행여행 (\d+)팀 · 추가확인 변형 (\d+)명 · 핵심사건 (\d+)건$/, 'Challenge $1 · Scenario $2 · $3 regular travelers · $4 parties · $5 review variants · $6 key cases'],
  [/^현재 (.+) · 복잡한 질문은 이해도에 따라 통역이 필요할 수 있습니다\.$/, (m, x) => `Now: ${EXACT.get(x) || x} · complex questions may need an interpreter`, true],
  [/^현재 (.+) 수준이 제한적입니다\. 복잡한 질문에는 통역이 필요할 수 있습니다\.$/, (m, x) => `${EXACT.get(x) || x} is limited · complex questions may need an interpreter`, true],
  [/^(.+) ↔ 한국어 통역 중 · 유효 진술 확보 가능$/, 'Interpreting $1 ↔ Korean · statements are recordable', true],
  [/^(\d+)\/(\d+) · (\d+) 가능$/, '$1/$2 · $3 open'],
  [/^(.+) · 재질문 · 반복 질문은 효율에 반영$/, (m, x) => `${EXACT.get(x) || x} · asked before · repeats cost efficiency`, true],
  [/^(\d{4}-\d{2}-\d{2}) 공개 기준 시뮬레이션$/, 'Simulation · published law as of $1'],
  [/^법령 기준 (\S+) · DATA (\S+)$/, 'Law as of $1 · data $2'],
  [/^충족 (\d+)$/, 'Met $1'], [/^추가 확인 (\d+)$/, 'Review $1'], [/^미충족 (\d+)$/, 'Not met $1'], [/^미확인 (\d+)$/, 'Unchecked $1'],
  [/^문답:(.+)$/, 'Q: $1'], [/^조회:(.+)$/, 'Lookup: $1'],
  [/^(\d+)일$/, '$1 days'],
  [/^현재 (.+)$/, (m, x) => `Now: ${EXACT.get(x) || x}`, true],
  [/^(.+) 통역 호출$/, (m, lang) => `Call interpreter (${EXACT.get(lang) || lang})`, true], // the language name is data, not UI copy
  // v10 live interview: strings assembled from a fixed UI part and a data part (question text, names, labels stay Korean)
  [/^질문 도움 · (안내|표준|전문|몰입)$/, (m, x) => `Question help · ${EXACT.get(x)}`],
  [/^지금: (안내|기본|전문|몰입)$/, (m, x) => `Now: ${EXACT.get(x)}`],
  [/^(.+) 통역 연결$/, (m, lang) => `Connect interpreter (${EXACT.get(lang) || lang})`, true],
  [/^(.+) · 이어서 확인$/, (m, cat) => `${EXACT.get(cat) || cat} · follow-up`, true],
  [/^기록 질문 · (.+)$/, 'Recorded as · $1', true],
  [/^(.+) 가상 여행객 초상$/, 'Fictional traveler portrait · $1', true],
  [/^결정 근거 · (.+)$/, 'Basis for decision · $1', true],
  [/^확보한 단서 (\d+)$/, 'Clues found $1'], [/^놓친 핵심 단서 (\d+)$/, 'Key clues missed $1'],
  [/^먼저 필요: (.+)$/, 'Needed first: $1', true],
  [/^대화 (\d+)회 · 직접 입력 (\d+) · 음성 (\d+) · 제안 (\d+) · 목록 (\d+)(?: · 알아듣지 못한 질문 (\d+))? — 입력 방식은 점수와 판정에 반영되지 않습니다\.$/, (m, n, typed, voice, sugg, list, again) => `${n} turns · typed ${typed} · voice ${voice} · suggested ${sugg} · list ${list}${again ? ` · not understood ${again}` : ''} — input method does not affect scoring or decisions.`],
  [/^(\d+)회$/, '$1 times'],
  [/^(\d+)건$/, '$1 cases']
];

function normalizeLocale(value) { return value === 'en' ? 'en' : 'ko'; }
function hasHangul(value) { return /[가-힣]/.test(value || ''); }

export function translateString(value) {
  if (!value || !hasHangul(value)) return value;
  const trimmed = value.trim();
  const exact = EXACT.get(trimmed);
  if (exact) return value.replace(trimmed, exact);
  for (const [pattern, replacement, keepsData] of PATTERNS) {
    if (!pattern.test(trimmed)) continue;
    const out = trimmed.replace(pattern, replacement);
    // a half-translated string (Korean UI copy left inside) is worse than the original: keep the original
    return hasHangul(out) && !keepsData ? value : value.replace(trimmed, out);
  }
  return value;
}

function ignored(node) {
  const parent = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return !!parent?.closest?.('[data-i18n-control], script, style, code, pre');
}

// `written` remembers what this layer itself put into a node/attribute. Our own write fires a mutation; without
// this check the translation would be stored as the "original" and switching back to Korean kept English.
const writtenText = new WeakMap();
function applyTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE || ignored(node)) return;
  const ours = writtenText.has(node) && writtenText.get(node) === node.data;
  if (locale === 'ko') {
    const original = originalText.get(node);
    if (ours && original !== undefined) { node.data = original; }
    writtenText.delete(node);
    return;
  }
  if (ours || !hasHangul(node.data)) return;
  originalText.set(node, node.data);
  const translated = translateString(node.data);
  if (translated !== node.data) { writtenText.set(node, translated); node.data = translated; }
}

function attrMapFor(el) {
  let map = originalAttrs.get(el);
  if (!map) { map = new Map(); originalAttrs.set(el, map); }
  return map;
}

const writtenAttrs = new WeakMap();
function applyAttributes(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE || ignored(el)) return;
  const map = attrMapFor(el);
  let written = writtenAttrs.get(el); if (!written) { written = new Map(); writtenAttrs.set(el, written); }
  for (const attr of ATTRS) {
    const value = el.getAttribute(attr);
    const ours = written.has(attr) && written.get(attr) === value;
    if (locale === 'ko') {
      if (ours && map.has(attr)) el.setAttribute(attr, map.get(attr));
      written.delete(attr);
      continue;
    }
    if (ours || !value || !hasHangul(value)) continue;
    map.set(attr, value);
    const translated = translateString(value);
    if (translated !== value) { written.set(attr, translated); el.setAttribute(attr, translated); }
  }
}

// Language of parts (WCAG 3.1.2): in the English UI, case data stays Korean (statements, names, records).
// An element whose text is Korean with no English words is marked lang="ko" so screen readers voice it as Korean;
// the mark is dropped when English appears in it or the UI returns to Korean.
const LATIN_WORD = /[A-Za-z]{2,}/;
function markLang(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE || ignored(el)) return;
  const ours = el.dataset.i18nLang === 'ko';
  if (locale !== 'en') { if (ours) { el.removeAttribute('lang'); delete el.dataset.i18nLang; } return; }
  const text = el.textContent || '', korean = hasHangul(text) && !LATIN_WORD.test(text);
  if (korean && !el.hasAttribute('lang')) { el.setAttribute('lang', 'ko'); el.dataset.i18nLang = 'ko'; }
  else if (!korean && ours) { el.removeAttribute('lang'); delete el.dataset.i18nLang; }
}
function markLangWithin(root) {
  const el = root?.nodeType === Node.TEXT_NODE ? root.parentElement : root;
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
  if (locale !== 'en') { el.querySelectorAll('[data-i18n-lang]').forEach(markLang); markLang(el); return; }
  const parents = new Set(); const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (hasHangul(n.data) && n.parentElement) parents.add(n.parentElement);
  parents.forEach(markLang); markLang(el);
}

function walk(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) { applyTextNode(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
  if (root.nodeType === Node.ELEMENT_NODE) applyAttributes(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) applyTextNode(node);
    else applyAttributes(node);
    node = walker.nextNode();
  }
}

function languageButton(id, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = id;
  button.className = className;
  button.dataset.i18nControl = 'true';
  button.addEventListener('click', () => setLocale(locale === 'ko' ? 'en' : 'ko'));
  return button;
}

function ensureControls() {
  const topActions = document.querySelector('.top-actions');
  if (topActions && !document.getElementById('uiLanguageBtn')) {
    const button = languageButton('uiLanguageBtn', 'iconbtn');
    const more = topActions.querySelector('.more-wrap');
    topActions.insertBefore(button, more || null);
  }
  const startActions = document.querySelector('#setupBar .setup-actions');
  if (startActions && !document.getElementById('startLanguageBtn')) {
    const button = languageButton('startLanguageBtn', '');
    startActions.insertBefore(button, startActions.firstChild);
  }
}

function syncControls() {
  const english = locale === 'en';
  const text = english ? '한국어' : 'English';
  const label = english ? '한국어 UI로 전환' : 'Switch UI to English';
  for (const id of ['uiLanguageBtn', 'startLanguageBtn']) {
    const button = document.getElementById(id);
    if (!button) continue;
    // MutationObserver observes childList/aria-label/title. Avoid writing identical values,
    // otherwise the observer can schedule itself forever after any UI render.
    if (button.textContent !== text) button.textContent = text;
    if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
    if (button.title !== label) button.title = label;
    // the button names the other language in that language
    if (button.lang !== (english ? 'ko' : 'en')) button.lang = english ? 'ko' : 'en';
  }
}

export function getLocale() { return locale; }

export function setLocale(value) {
  locale = normalizeLocale(value);
  storeSet(LOCALE_KEY, locale);
  if (typeof document === 'undefined') return locale;
  ensureControls();
  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;
  document.title = locale === 'en' ? 'INAD: Article 12' : 'INAD: 제12조';
  if (document.body) { walk(document.body); markLangWithin(document.body); }
  syncControls();
  document.dispatchEvent(new CustomEvent('inad:localechange', { detail: { locale } }));
  return locale;
}

function mutationHandler(records) {
  for (const record of records) {
    const target = record.target?.nodeType === Node.ELEMENT_NODE ? record.target : record.target?.parentElement;
    if (target?.closest?.('[data-i18n-control]')) continue;
    if (record.type === 'characterData') { applyTextNode(record.target); markLang(target); }
    else if (record.type === 'attributes') applyAttributes(record.target);
    else { for (const node of record.addedNodes) { walk(node); markLangWithin(node); } markLang(target); }
  }
  ensureControls();
  syncControls();
}

export function initI18n() {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;
  ensureControls();
  setLocale(locale);
  if (!document.body || typeof MutationObserver === 'undefined') return;
  observer = new MutationObserver(mutationHandler);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initI18n, { once: true });
  else initI18n();
}
