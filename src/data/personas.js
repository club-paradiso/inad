// INAD v10 passenger personas — presentation content for the dialogue layer (docs/v10-live-interview-spec.md §4).
// A persona never adds a case fact. It may only say:
//   · the canonical answer from src/data/cases.js (recorded through case-engine ask(), unchanged), optionally led by
//     a non-factual discourse marker (`lead`), with a delivery mood the avatar acts out;
//   · `withheld` lines for questions whose disclosure condition is not met yet — restating only what is already
//     public (the initial statement, submitted documents). tests/unit/dialogue.test.js checks this for every line;
//   · clarification / greeting / hand-over lines with no case content.
// Moods are acting directions (motion-grammar.js), never evidence: a hesitant delivery is not a sign of anything.

export const GENERIC_PERSONA = {
  clarify: ['죄송합니다. 질문을 다시 한 번 말씀해 주시겠습니까?', '무엇을 물으시는지 잘 모르겠습니다. 다시 여쭤봐 주시겠어요?'],
  greeting: ['안녕하세요.'],
  thanks: ['네.'],
  handover: ['네, 여기 있습니다.'],
  wait: ['네.'],
  // {initial} is the passenger's own opening statement (public).
  withheldDefault: '아까 말씀드린 대로입니다. {initial}',
  offTopic: ['그건 이번 입국과 관련된 질문인가요? 다시 말씀해 주시겠어요?']
};

export const PERSONAS = {
  'ICN-S2-005': {
    voice: { lang: 'ko', register: 'polite-short', rate: 0.96, pitch: 1.0 },
    note: 'First trip abroad. Answers briefly and politely; slows down when money, the contact or work comes up. Never volunteers.',
    en: {
      purpose: 'What exactly will you do during the 30 days?',
      return: "Why don't you have a return ticket?",
      funds: 'How much money do you have for the stay and how will you pay?',
      contact: 'Who is your contact in Korea, the number 010-0000-0202?',
      phone: 'Would you voluntarily show me phone records for your return flight, lodging or host?',
      occupation: 'What do you do in Vietnam now and what is your income?',
      addressOwner: 'Who lives at the house in Guro that you declared?',
      jobOffer: 'Have you looked for a job or a job interview in Korea?',
      returnMoney: 'How will you get the money for the return ticket later?',
      host: 'How did you first get to know your contact in Korea?'
    },
    delivery: {
      purpose: { mood: 'plain' },
      return: { mood: 'considered', lead: '아…' },
      funds: { mood: 'considered', lead: '음,' },
      contact: { mood: 'hesitant', lead: '그 번호는요…' },
      phone: { mood: 'hesitant', lead: '그건…' },
      occupation: { mood: 'considered' },
      addressOwner: { mood: 'hesitant', lead: '아…' },
      jobOffer: { mood: 'hesitant', lead: '…솔직히 말씀드리면,' },
      returnMoney: { mood: 'hesitant', lead: '그게…' },
      host: { mood: 'considered' }
    },
    // Disclosure conditions are the case's own `requires` lists. Until they are met the passenger answers with
    // what is already on record (initial statement · E-ARRIVAL · PNR) and the question stays open.
    withheld: {
      occupation: '관광하러 왔습니다. 명동에서 쇼핑하고 한 달 정도 머물 예정입니다.',
      addressOwner: '체류지는 구로구 개인주택입니다.',
      jobOffer: '관광하러 왔습니다. 명동에서 쇼핑하고 한 달 정도 머물 예정입니다.',
      returnMoney: '귀국편은 없습니다.',
      host: '연락처는 010-0000-0202입니다.'
    },
    clarify: ['죄송합니다. 다시 한 번 천천히 말씀해 주시겠어요?', '…무슨 뜻인지 잘 모르겠습니다.'],
    greeting: ['안녕하세요.'],
    handover: ['네, 여기 있습니다.']
  }
};

export function personaFor(caseId) { return { ...GENERIC_PERSONA, ...(PERSONAS[caseId] || {}) }; }
