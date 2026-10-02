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
  offTopic: ['그건 이번 입국과 관련된 질문인가요? 다시 말씀해 주시겠어요?'],
  // free text that most likely repeats a question already answered: confirm before the (v9-costed) re-ask
  repeatCheck: ['앞서 말씀드린 것과 같은 질문이신가요?']
};

export const PERSONAS = {
  'ICN-S2-005': {
    voice: { lang: 'ko', register: 'polite-short', rate: 0.96, pitch: 1.0 },
    note: 'First trip abroad. Answers briefly and politely; slows down when money, the contact or work comes up. Never volunteers.',
    en: {
      purpose: 'What exactly will you do in Korea?',
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
  },
  'ICN-S1-001': {
    voice: { lang: 'ko', register: 'business-relaxed', rate: 1.0, pitch: 1.0 },
    note: 'Seasoned business traveller, jet-lagged, answers fully and quickly. Nothing to hide; mildly impatient with repeats.',
    en: {
      purpose: 'What is the purpose of your visit, in detail?', hotel: 'Where are you staying in Korea?', return: 'When is your return flight?',
      funds: 'Do you have enough money and means of payment for the stay?', agenda: 'What is your conference and meeting schedule?',
      pay: 'Will you receive any pay or salary from a Korean company?', samples: 'Do you have work equipment or samples in your luggage?',
      sponsor: 'Who pays for the flight and the hotel?'
    },
    delivery: { purpose: { mood: 'plain' }, agenda: { mood: 'considered' }, pay: { mood: 'plain', lead: '아,' }, samples: { mood: 'considered', lead: '음,' }, sponsor: { mood: 'plain' } },
    withheld: {
      agenda: '서울에서 3일간 열리는 반도체 컨퍼런스에 참석합니다.',
      pay: '서울에서 3일간 열리는 반도체 컨퍼런스에 참석합니다.',
      samples: '컨퍼런스 참석입니다.',
      sponsor: '호텔과 귀국편은 확정되어 있습니다.'
    }
  },
  'ICN-S1-002': {
    voice: { lang: 'ko', register: 'polite-light', rate: 1.02, pitch: 1.05 },
    note: 'First trip with a university friend; a little shy, cheerful, answers short. Campaign holiday-arc anchor (recurring presence).',
    en: {
      purpose: 'What is the purpose of this trip?', hotel: 'Where are you staying?', return: 'When are you going back to Japan?',
      companion: 'Who is the friend you travel with, and do you share the schedule?', friendKorea: 'Will you meet anyone you know in Korea?',
      budget: 'How did you prepare your travel money?', study: 'Do you plan to take classes or stay long in Korea?'
    },
    delivery: { purpose: { mood: 'plain' }, companion: { mood: 'plain' }, friendKorea: { mood: 'considered', lead: '아,' }, budget: { mood: 'plain' }, study: { mood: 'considered', lead: '음,' } },
    withheld: {
      companion: '친구와 서울 여행을 왔습니다.',
      friendKorea: '홍대와 성수에 갈 예정입니다.',
      budget: '체류지는 Myeongdong Hotel입니다.',
      study: '출국은 OZ102입니다.'
    }
  },
  'ICN-S2-006': {
    voice: { lang: 'ko', register: 'polite-careful', rate: 0.98, pitch: 1.02 },
    note: 'Looks suspicious on paper (booked by a friend) and knows it; slightly anxious, eager to show the bookings. Explained after secondary.',
    en: {
      hotel: 'Why is the hotel not booked in your name?', friend: 'What is your companion’s name and arrival flight?', return: 'Please show me your return ticket.',
      funds: 'How did you prepare your travel money?', bookingName: 'Who is the lead name on the hotel booking?',
      separateFunds: 'Do you have your own money, separate from your friend?', itinerary: 'What is your Seoul–Busan itinerary?',
      work: 'Do you plan to work or be paid in Korea?'
    },
    delivery: { hotel: { mood: 'considered', lead: '아,' }, bookingName: { mood: 'plain' }, separateFunds: { mood: 'plain', lead: '네,' }, itinerary: { mood: 'plain' }, work: { mood: 'plain' } },
    withheld: {
      bookingName: '호텔은 친구가 대신 예약해 줬습니다.',
      separateFunds: '서울과 부산을 여행합니다.',
      itinerary: '서울과 부산을 여행합니다.',
      work: '서울과 부산을 여행합니다.'
    }
  },
  'ICN-S3-010': {
    voice: { lang: 'ko', register: 'tired-plain', rate: 0.94, pitch: 0.98 },
    note: 'Exhausted, money worries; says openly that he wants work. The refugee procedure follows the law whatever his delivery; never play it for sympathy or suspicion.',
    en: {
      purpose: 'Explain your sightseeing schedule and where you will stay.', funds: 'How much money do you have for the stay?',
      refugee: 'Are you saying you face persecution if you return?', persecution: 'Who would harm you at home, and why?',
      family: 'Does your family live in your home country now?', route: 'Did you ask for protection in another country before coming?',
      workPlan: 'What work did you want to do in Korea?', claimTiming: 'When did you start thinking of applying for refugee status?'
    },
    delivery: { purpose: { mood: 'considered' }, funds: { mood: 'hesitant', lead: '그게…' }, refugee: { mood: 'considered' }, persecution: { mood: 'considered', lead: '음,' }, workPlan: { mood: 'hesitant' }, claimTiming: { mood: 'hesitant', lead: '…' } },
    withheld: {
      persecution: '서울 관광을 하려고 왔습니다.',
      family: '서울 관광을 하려고 왔습니다.',
      route: '서울 관광을 하려고 왔습니다.',
      workPlan: '돈은 많지 않습니다.',
      claimTiming: '서울 관광을 하려고 왔습니다.'
    }
  },
  'ICN-S3-011': {
    voice: { lang: 'ko', register: 'firm-quiet', rate: 0.96, pitch: 0.98 },
    note: 'Calm and firm: everything else is in order, he simply refuses fingerprints. Not hostile; listens to the explanation and keeps his position.',
    en: {
      bio: 'Will you complete the biometric procedure required for entry?', exempt: 'Do you claim any ground for exemption from biometrics?',
      age: 'Are you under 17?', official: 'Are you on official government or international-organisation business?',
      explain: 'I have explained the legal procedure and the consequences. Will you comply now?', otherDocs: 'Your passport, flight and address are fine — is it only the biometrics you refuse?'
    },
    delivery: { bio: { mood: 'considered' }, exempt: { mood: 'plain' }, explain: { mood: 'considered', lead: '음,' }, otherDocs: { mood: 'plain', lead: '네,' } },
    withheld: {
      age: '한국에 사는 사촌을 만나러 왔습니다.',
      official: '한국에 사는 사촌을 만나러 왔습니다.',
      explain: '지문은 제공하고 싶지 않습니다.',
      otherDocs: '한국에 사는 사촌을 만나러 왔습니다.'
    }
  },
  'ICN-S1-003': {
    voice: { lang: 'ko', register: 'resident-easy', rate: 1.02, pitch: 1.0 },
    note: 'Registered resident coming home from a family visit; relaxed, answers plainly, a little surprised to be asked about K-ETA.',
    en: {
      residence: 'Please show your status of stay and registration card.', address: 'What is your current address in Korea?',
      expiry: 'I will check your registration card and the expiry of your period of stay.', trip: 'What was the purpose of your trip to Canada?',
      job: 'What is your current activity and job in Korea?', keta: 'Do you know why you did not submit a K-ETA?'
    },
    delivery: { residence: { mood: 'plain', lead: '네,' }, address: { mood: 'plain' }, expiry: { mood: 'plain' }, trip: { mood: 'plain' }, job: { mood: 'plain' }, keta: { mood: 'considered', lead: '아,' } },
    withheld: {
      expiry: '등록증은 F-2 외국인등록증입니다.',
      trip: '캐나다에 가족 방문을 다녀왔습니다.',
      job: '서울 집으로 돌아가는 길입니다.',
      keta: '서울 집으로 돌아가는 길입니다.'
    }
  },
  'ICN-S1-004': {
    voice: { lang: 'ko', register: 'business-precise', rate: 1.0, pitch: 1.02 },
    note: 'Purchasing manager on a short supplier trip; organised, answers with names and dates. Nothing to hide.',
    en: {
      abtc: 'Do your ABTC and passport details match?', business: 'Please describe the Korean company you will visit and the work.',
      return: 'When do you leave Korea?', kor: 'I will check the KOR approval and the validity of your ABTC.',
      agenda: 'Please describe the meeting schedule and your contact person.', pay: 'Will you receive salary or allowances from a Korean company, or do on-site work?',
      samples: 'Do you have product samples in your luggage?'
    },
    delivery: { abtc: { mood: 'plain', lead: '네.' }, business: { mood: 'plain' }, agenda: { mood: 'considered' }, pay: { mood: 'plain', lead: '아,' }, samples: { mood: 'considered', lead: '음,' } },
    withheld: {
      kor: 'ABTC 유효기간은 2028-01-22입니다.',
      agenda: '한국 거래처와 신규 공급계약 미팅을 위해 왔습니다.',
      pay: '한국 거래처와 신규 공급계약 미팅을 위해 왔습니다.',
      samples: '한국 거래처와 신규 공급계약 미팅을 위해 왔습니다.'
    }
  },
  'ICN-S2-007': {
    voice: { lang: 'ko', register: 'casual-vague', rate: 1.0, pitch: 1.04 },
    note: 'Easy-going and vague about details she left to others. The vagueness is acting only; the facts are in the answers and the lookups, never in her manner.',
    en: {
      hotel: 'Please show the Gangnam hotel booking confirmation.', friend: 'What is your friend’s name and contact number?',
      work: 'What do you do in your home country now?', funds: 'How much money do you have for the trip?',
      hotelName: 'Tell me the exact name and address of the hotel you say is booked.', alex: 'Explain Alex’s name, nationality, relationship and how you got in touch.',
      massage: 'What does “helping out” at a massage shop mean?', returnPlan: 'You have a return ticket — will you leave as planned?',
      sponsor: 'Who pays for your stay in Korea?'
    },
    delivery: { hotel: { mood: 'considered', lead: '아,' }, friend: { mood: 'considered' }, work: { mood: 'plain' }, hotelName: { mood: 'considered', lead: '음,' }, alex: { mood: 'hesitant' }, massage: { mood: 'hesitant', lead: '그게…' }, returnPlan: { mood: 'considered' }, sponsor: { mood: 'considered' } },
    withheld: {
      hotelName: '강남 호텔에 묵습니다.',
      alex: '친구와 관광하러 왔습니다.',
      massage: '친구와 관광하러 왔습니다.',
      returnPlan: 'PR469로 출국합니다.',
      sponsor: '친구와 관광하러 왔습니다.'
    }
  },
  'ICN-S2-008': {
    voice: { lang: 'ko', register: 'engineer-plain', rate: 0.98, pitch: 0.98 },
    note: 'Quality engineer sent by head office; precise, slightly formal, careful to separate inspection from hands-on work.',
    en: {
      company: 'Tell me the inviting company and the contact person.', purpose: 'Will you do production work or any employment in Korea yourself?',
      invite: 'Please present the invitation letter and the schedule.', inspection: 'During the inspection, will you assemble, install or repair anything yourself?',
      pay: 'Will you receive wages or payment for work from the Korean company?', tools: 'Do you have tools or measuring equipment in your luggage?',
      schedule: 'Describe the site visits and meetings during the six days.'
    },
    delivery: { company: { mood: 'plain' }, purpose: { mood: 'plain', lead: '아,' }, invite: { mood: 'plain', lead: '네,' }, inspection: { mood: 'considered' }, pay: { mood: 'plain' }, tools: { mood: 'considered', lead: '음,' }, schedule: { mood: 'considered' } },
    withheld: {
      inspection: '인천과 화성의 거래처에서 제품 검수와 회의를 합니다.',
      pay: '인천과 화성의 거래처에서 제품 검수와 회의를 합니다.',
      tools: '인천과 화성의 거래처에서 제품 검수와 회의를 합니다.',
      schedule: '인천과 화성의 거래처에서 제품 검수와 회의를 합니다.'
    }
  },
  'ICN-S3-009': {
    voice: { lang: 'ko', register: 'composed-insistent', rate: 0.98, pitch: 1.0 },
    note: 'Composed and insistent that the passport is hers. Her calm or tension is acting only: identity is decided by the forensic and biometric results and the procedure, never by demeanour.',
    en: {
      identity: 'I will check your passport details against your actual identity.', route: 'Describe your recent route and transit points.',
      phone: 'With your consent, will you show booking records and identity-related messages?', trueName: 'Your biometrics do not match the passport. Have you used another identity?',
      purchase: 'When and where was this passport issued to you?', companion: 'Are you related to the other passenger on the same booking?',
      messages: 'The booking screen you showed has a message saying “pass with the new name”. Explain it.', destroy: 'Why did you try to delete phone messages before the investigation?'
    },
    delivery: { identity: { mood: 'plain' }, route: { mood: 'plain' }, phone: { mood: 'considered', lead: '음,' }, trueName: { mood: 'considered' }, purchase: { mood: 'hesitant', lead: '그건…' }, companion: { mood: 'plain' }, messages: { mood: 'hesitant' }, destroy: { mood: 'hesitant', lead: '…' } },
    withheld: {
      trueName: 'ELENA ROSTOVA입니다. 독일에서 왔습니다.',
      purchase: '여권에 문제가 있다는 말을 이해할 수 없습니다.',
      companion: '일주일 동안 서울을 여행합니다.',
      messages: '여권에 문제가 있다는 말을 이해할 수 없습니다.',
      destroy: '여권에 문제가 있다는 말을 이해할 수 없습니다.'
    }
  },
  'ICN-S3-012': {
    voice: { lang: 'ko', register: 'polite-unaware', rate: 0.98, pitch: 1.0 },
    note: 'Polite weekend tourist who honestly believes the old matter is closed. The entry ban follows from the record and the law, not from his sincerity.',
    en: {
      history: 'Have you ever been deported from Korea?', purpose: 'Is the purpose of this entry tourism?',
      date: 'Do you remember the date you left Korea under the deportation order?', order: 'Did you know at the time that it was a deportation order, not a simple departure order?',
      permission: 'Since then, have you received separate entry permission or notice that the restriction was lifted?', hotel: 'Did you book the hotel and return flight for this trip as usual?'
    },
    delivery: { history: { mood: 'considered', lead: '아,' }, purpose: { mood: 'plain', lead: '네.' }, date: { mood: 'considered' }, order: { mood: 'hesitant', lead: '음,' }, permission: { mood: 'considered' }, hotel: { mood: 'plain' } },
    withheld: {
      date: '예전 한국 체류 문제는 이미 끝난 것으로 알고 있습니다.',
      order: '예전 한국 체류 문제는 이미 끝난 것으로 알고 있습니다.',
      permission: '예전 한국 체류 문제는 이미 끝난 것으로 알고 있습니다.',
      hotel: '주말 동안 서울 관광을 왔습니다.'
    }
  }
};

export function personaFor(caseId) { return { ...GENERIC_PERSONA, ...(PERSONAS[caseId] || {}) }; }
