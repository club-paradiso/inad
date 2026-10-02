// INAD v10 dialogue lexicon — content only. Maps what an examiner might type or say (Korean or English) to
// interview *concepts*. The intent engine compares the concepts of an utterance with the concepts of each
// question of the current case (derived from the question text itself), so no question has to be hand-tagged.
// This is interpretation help, not law: it decides which existing question was asked, never what is true.
// Stems are matched as substrings of the normalised utterance (Korean particles stay attached, so stems are
// written without them); English stems are matched at word starts.

export const CONCEPTS = {
  PURPOSE: { ko: ['목적', '왜 오', '왜 왔', '무슨 일로', '무엇을 할', '뭐 할', '뭐하', '뭘 할', '무엇을 하', '하실 예정', '할 예정', '오신 이유', '방문 이유', '방문하', '관광', '여행 목적', '계획', '왜 한국', '뭐 하러', '무슨 일로', '왜 오셨', '일정이 없', '계획이 없', '한국 온 이유', '온 이유'], en: ['purpose', 'why are you', 'why did you come', 'reason for', 'what brings', 'what will you do', 'what are you going to do', 'plan to do', 'your plans', 'plans for', 'visit', 'tourism', 'sightseeing'] },
  DURATION: { ko: ['얼마나 머', '얼마 동안', '며칠', '기간', '체류 기간', '몇 일', '한 달 동안 머'], en: ['how long', 'how many days', 'duration', 'length of stay', 'days'] },
  LODGING: { ko: ['숙소', '숙박', '호텔', '묵', '머무는 곳', '머물 곳', '지낼 곳', '어디서 지내', '어디에서 지내', '어디에 머', '어디서 머', '어디서 자', '체류지', '체류합', '주소', '거처'], en: ['hotel', 'accommodation', 'where are you staying', 'where will you stay', 'where do you stay', 'lodging', 'address', 'sleep', 'place to stay'] },
  RETURN: { ko: ['귀국', '돌아가', '출국', '왕복', '리턴', '항공권', '비행기표', '티켓', '돌아갈', '다음 이동', '편도'], en: ['return', 'go back', 'going back', 'flight home', 'ticket', 'round trip', 'leave korea', 'leaving', 'departure', 'onward', 'one-way', 'one way', 'fly back', 'flight home'] },
  MONEY: { ko: ['돈', '경비', '비용', '체재비', '현금', '카드', '잔액', '자금', '얼마 가지', '얼마나 가지', '예산', '결제', '여비', '소지금', '얼마입'], en: ['money', 'cash', 'card', 'funds', 'budget', 'afford', 'how much', 'expenses', 'balance', 'savings'] },
  PAYER: { ko: ['누가 부담', '누가 내', '누가 지불', '누가 돈', '누가 계산', '부담합', '부담하', '대신 내', '지원해', '후원', '스폰서', '대 주', '대줍', '내 줍'], en: ['who pays', 'who paid', 'who is paying', 'sponsor', 'paid by', 'paying for', 'covering', 'cover the cost'] },
  RAISE_MONEY: { ko: ['마련', '구하', '벌어', '나중에 살', '살 비용', '살 돈'], en: ['how will you get', 'raise the money', 'pay for it later', 'buy it later', 'get the money'] },
  CONTACT: { ko: ['연락처', '전화번호', '번호', '010', '국내 연락', '연락하는'], en: ['contact', 'phone number', 'number', 'reach'] },
  RELATION: { ko: ['누구입', '누구예', '누구야', '누군', '관계', '아는 사람', '어떻게 알', '알게', '지인', '소개', '처음 만', '만난 적', '친구'], en: ['who is', 'who are', 'relationship', 'how do you know', 'how did you meet', 'know them', 'friend', 'introduced', 'met'] },
  HOW_MET: { ko: ['어떻게 알', '알게 되', '처음 어떻게', '어디서 알', '소개받', '만난 적', 'sns', '단체방', '온라인'], en: ['how do you know', 'how did you meet', 'how did you get to know', 'where did you meet', 'introduced', 'online'] },
  JOB_HOME: { ko: ['직업', '하는 일', '무슨 일을 하', '어떤 일을 하', '일을 하', '소득', '수입', '직장', '회사', '그만', '생계', '본국에서', '베트남에서', '무슨 일 하', '어떤 일 하', '요즘 뭐 하', '하고 지내', '뭐 했', '무슨 일 했', '어떤 일 했', '일 했', '일했'], en: ['job', 'occupation', 'what do you do', 'work at home', 'back home', 'in vietnam', 'for work', 'income', 'employer', 'employed', 'quit', 'living', 'profession'] },
  WORK_KOREA: { ko: ['일자리', '취업', '일할', '일하러', '면접', '구직', '공장', '알바', '아르바이트', '돈을 벌', '돈 벌', '돈벌', '일을 구', '일 구', '근무하', '근로', '보수', '급여', '임금', '월급', '돈을 받', '돈 받', '대가'], en: ['job in korea', 'work in korea', 'work here', 'employment', 'job interview', 'factory', 'earn', 'find work', 'looking for work', 'job offer', 'job here', 'jobs here', 'working here', 'offer you work', 'offered you', 'earn money', 'paid', 'salary', 'wage'] },
  WHO: { ko: ['누구', '누가', '누군'], en: ['who ', 'whom', 'whose'] },
  SEPARATE: { ko: ['따로', '별도', '본인 돈', '자기 돈', '혼자서'], en: ['own money', 'separately', 'your own', 'separate'] },
  PHONE: { ko: ['휴대전화', '핸드폰', '휴대폰', '스마트폰', '폰 ', '폰을', '폰으로', '폰 좀', '전화기'], en: ['phone', 'mobile', 'smartphone', 'cell'] },
  SHOW: { ko: ['보여', '제시', '확인할 수 있', '보여줄', '보여 주', '보여주', '보자', '볼게', '봐도', '확인할게', '확인해도'], en: ['show', 'present', 'let me see', 'can i see', 'proof'] },
  HOUSE_OWNER: { ko: ['거주자', '사는 사람', '사는 분', '집주인', '그 집', '주택', '누구 집', '누구네', '구로', '개인주택', '집에 사'], en: ['who lives', 'owner', 'house', 'whose place', 'whose home', 'residence there'] },
  SCHEDULE: { ko: ['일정', '스케줄', '계획', '어디 갈', '어디를 갈', '이동'], en: ['schedule', 'itinerary', 'agenda', 'plans', 'program'] },
  COMPANION: { ko: ['동행', '같이 온', '함께 온', '같이 여행', '함께 여행', '일행'], en: ['travel with', 'travelling with', 'traveling with', 'companion', 'with you', 'group'] },
  BOOKING: { ko: ['예약', '예약자', '명의', '확인서', '바우처'], en: ['booking', 'reservation', 'reserved', 'voucher', 'booked'] },
  INVITE: { ko: ['초청', '초대', '초청장', '초청사', '담당자', '거래처'], en: ['invite', 'invitation', 'inviter', 'host company', 'contact person'] },
  STUDY: { ko: ['학교', '학업', '공부', '유학', '학생', '등록', '수업', '장기 체류'], en: ['school', 'study', 'student', 'university', 'enrol', 'enroll', 'classes', 'course', 'long stay'] },
  RESIDENCE: { ko: ['체류카드', '외국인등록', '거소', '영주', '재입국'], en: ['residence card', 'registration card', 'permanent residence', 're-entry'] },
  PREVIOUS: { ko: ['전에', '이전에', '과거', '처음 오', '처음 방문', '방문한 적', '와 본 적', '입국한 적', '기록'], en: ['before', 'previous', 'first time', 'been to korea', 'last visit', 'history'] },
  IDENTITY: { ko: ['본명', '실명', '진짜 이름', '신원', '누구십', '여권 주인', '본인 여권'], en: ['real name', 'true name', 'identity', 'your name', 'whose passport'] },
  DOCUMENT_ORIGIN: { ko: ['구입했', '구매', '샀', '어디서 받', '발급', '위조', '만들'], en: ['buy', 'bought', 'purchase', 'obtain', 'issued', 'forged', 'made'] },
  DESTROY: { ko: ['버렸', '찢', '파기', '폐기', '없앴'], en: ['destroy', 'threw away', 'ripped', 'discard', 'get rid'] },
  MESSAGES: { ko: ['메시지', '문자', '대화', '카톡', '메신저'], en: ['message', 'text', 'chat', 'whatsapp'] },
  REFUGEE: { ko: ['난민', '보호', '박해', '위험', '돌아가면', '신청 의사', '망명'], en: ['refugee', 'asylum', 'protection', 'persecution', 'danger', 'afraid to return'] },
  FAMILY: { ko: ['가족', '부모', '자녀', '배우자', '형제'], en: ['family', 'parents', 'children', 'spouse', 'wife', 'husband', 'brother', 'sister'] },
  AGE: { ko: ['나이', '연령', '몇 살', '세 미만', '미성년', '17세'], en: ['age', 'how old', 'under 17', 'minor'] },
  OFFICIAL: { ko: ['공무', '정부', '국제기구', '외교', '공적 업무'], en: ['official', 'government', 'diplomat', 'international organisation', 'international organization'] },
  OTHER_DOCS: { ko: ['다른 서류', '나머지 서류', '서류는 다', '서류는 모두', '모두 정상', '만 거부', '만 거절', '만 안 하'], en: ['other documents', 'only the biometric', 'only biometric', 'everything else'] },
  EXEMPT: { ko: ['면제', '예외', '안 해도 되는'], en: ['exempt', 'exemption'] },
  CONSENT: { ko: ['응하', '동의', '협조', '하시겠'], en: ['comply', 'agree', 'consent', 'cooperate'] },
  BIOMETRIC: { ko: ['지문', '얼굴', '생체', '사진', '생체정보'], en: ['fingerprint', 'biometric', 'face', 'photo'] },
  EXPLAIN: { ko: ['설명', '소명', '이유'], en: ['explain', 'why', 'reason'] },
  TOOLS: { ko: ['공구', '장비', '샘플', '측정', '수하물', '짐', '가방'], en: ['tools', 'equipment', 'sample', 'luggage', 'baggage', 'bag'] },
  ROUTE: { ko: ['경유', '환승', '경로', '어디서 출발', '어디를 거쳐'], en: ['transit', 'route', 'via', 'connection', 'layover'] },
  ORDER: { ko: ['명령', '처분', '출국명령', '강제퇴거', '금지'], en: ['order', 'deport', 'ban', 'removal'] }
};

// Generic, non-question intents. Matched before questions; they never create evidence.
export const META_INTENTS = {
  GREETING: { ko: ['안녕하', '반갑', '어서 오', '여기로 오'], en: ['hello', 'hi ', 'good morning', 'good afternoon', 'good evening', 'welcome'] },
  THANKS: { ko: ['감사합', '고맙', '수고하'], en: ['thank', 'thanks'] },
  REPEAT: { ko: ['다시 말해', '다시 한번 말', '뭐라고 하', '못 들었', '다시 말씀'], en: ['say that again', 'repeat that', 'pardon', 'come again', 'sorry what'] },
  INTERPRETER: { ko: ['통역'], en: ['interpreter', 'translator', 'translation'] },
  LANG_KO: { ko: ['한국어로', '한국말로', '한국어 하', '한국말 하'], en: ['in korean', 'speak korean'] },
  LANG_EN: { ko: ['영어로', '영어 하', '영어할'], en: ['in english', 'speak english', 'do you speak english'] },
  WAIT: { ko: ['잠시만', '잠깐만', '기다려', '확인하겠습', '확인해 보겠'], en: ['one moment', 'wait', 'hold on', 'let me check'] }
};

// Asking the passenger to hand over a document. Opens that document in the workbench; no evidence is created
// (the documents were submitted at the counter and are already on file).
export const DOC_REQUESTS = {
  PASSPORT: { ko: ['여권'], en: ['passport'] },
  VISA: { ko: ['사증', '비자'], en: ['visa'] },
  'E-ARRIVAL': { ko: ['입국신고', '입국 신고'], en: ['arrival card', 'e-arrival', 'arrival form'] },
  PNR: { ko: ['항공권', '예약 내역', '탑승권', '이티켓', 'e티켓'], en: ['ticket', 'itinerary', 'boarding pass', 'e-ticket'] },
  HOTEL: { ko: ['호텔 예약', '숙박 예약', '바우처', '예약 확인서'], en: ['hotel booking', 'hotel voucher', 'reservation confirmation'] },
  INVITATION: { ko: ['초청장'], en: ['invitation letter'] },
  'RESIDENCE CARD': { ko: ['체류카드', '외국인등록증'], en: ['residence card'] }
};
export const DOC_REQUEST_VERBS = { ko: ['보여', '제시', '주시겠', '주십시오', '주세요', '볼 수', '확인하겠', '꺼내'], en: ['show', 'see', 'may i', 'can i', 'give me', 'hand', 'let me'] };

// Words with no interview meaning, dropped before the character-bigram comparison.
export const STOPWORDS_KO = ['습니다', '십시오', '주십시오', '해주세요', '해 주세요', '주세요', '입니까', '합니까', '습니까', '니까', '인가요', '나요', '해요', '어요', '세요', '있습', '그리고', '그럼', '혹시', '좀', '제가', '당신', '본인', '귀하', '선생님', '말씀', '구체적으로', '설명해', '알려', '대해', '대한', '대하'];
export const STOPWORDS_EN = ['the', 'a', 'an', 'to', 'of', 'in', 'is', 'are', 'you', 'your', 'do', 'does', 'did', 'please', 'can', 'could', 'would', 'me', 'i', 'and', 'or', 'for', 'on', 'at', 'it', 'this', 'that', 'what', 'tell', 'about', 'will', 'have', 'has', 'been', 'was', 'were'];
