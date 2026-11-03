// Overseas (CA/GB/NZ) interview phrasing — content only. Supplements data/dialogue-lexicon.js for the
// international cases: the shared lexicon was tuned to Korean-case wording, so common border phrasings
// ("where are you staying", "go home", "얼마나 계실") lacked a concept there. Interpretation help only:
// it decides which existing question was asked, never what is true.
// Korean stems match anywhere (spaces ignored); English stems match whole words or phrases.
import { CONCEPTS } from './dialogue-lexicon.js';

// Shared concepts that are meaningful in overseas cases. Korea-specific ones (e.g. WORK_KOREA,
// HOUSE_OWNER, REFUGEE) are ignored there, because their English stems fire on ordinary words.
export const SHARED_CONCEPTS = ['DURATION', 'LODGING', 'RETURN', 'MONEY', 'PAYER', 'CONTACT', 'RELATION', 'HOW_MET', 'JOB_HOME', 'WHO', 'SCHEDULE', 'COMPANION', 'BOOKING', 'INVITE', 'STUDY', 'IDENTITY', 'NAME', 'COMPANY', 'PROOF', 'EXPLAIN', 'FAMILY', 'MEET'];

export const ATLAS_CONCEPTS = {
  // The shared PURPOSE stems minus bare "trip"/"visit", which overseas questions use for other topics
  // ("How is the trip being paid for?", "Who are you visiting?").
  PURPOSE: {
    ko: [...CONCEPTS.PURPOSE.ko, '온 이유', '무슨 일로 오', '방문 목적', '무슨 일로 왔'],
    en: [...CONCEPTS.PURPOSE.en.filter((s) => !['trip', 'visit'].includes(s)), 'here for', 'trip for', 'what brings you', 'here to do', 'in the uk to do', 'visiting for']
  },
  DURATION: { ko: ['얼마나 계', '얼마나 있', '얼마나 머', '며칠', '몇 주', '기간'], en: ['how long', 'how many days', 'how many weeks', 'length of'] },
  LODGING: { ko: ['어디 묵', '어디서 묵', '어디에 묵', '숙소', '숙박', '어디서 지내', '어디에서 지내', '머물 곳', '지낼 곳'], en: ['where are you going to stay', 'where will you stay', 'where are you staying', 'where will you be staying', 'stay at', 'staying at', 'putting up', 'accommodation', 'place to stay', 'hotel'] },
  RETURN: { ko: ['돌아가', '귀국', '출국', '떠나', '나가는'], en: ['go home', 'going home', 'fly home', 'flying home', 'go back', 'going back', 'returning', 'return', 'leave', 'leaving', 'flight home', 'depart'] },
  PAYER: { ko: ['누가 내', '누가 부담', '경비는 누가', '비용은 누가', '돈은 누가', '누가 대'], en: ['paid for', 'paying for', 'who pays', 'who is paying', "who's paying", 'funding', 'funded', 'pay for'] },
  SUBMITTED: { ko: ['낸 서류', '제출', '냈', '접수'], en: ['hand in', 'handed in', 'submitted', 'submit', 'provided', 'lodged'] },
  WHICH_SOURCE: { ko: ['어떤 서류', '어느 서류', '어떤 자료', '어느 자료', '어떤 증거', '무슨 서류', '봐야', '보면 되', '확인하려면'], en: ['which document', 'which documents', 'what document', 'which papers', 'what papers', 'which paperwork', 'which evidence', 'which record', 'what should we check', 'what should i check', 'look at'] },
  RELATE: { ko: ['자료와 기록', '서류와 기록', '기록의 차이', '자료의 차이'], en: ['relate', 'relationship', 'connection'] },
  AFTER: { ko: ['그다음', '끝나고', '끝난 뒤', '이후', '다음엔', '나머지'], en: ['after', 'afterwards', 'once it ends', 'remaining', 'rest of', 'the remainder'] },
  PASSPORT: { ko: ['여권'], en: ['passport'] },
  // The shared PREVIOUS stems minus bare "before"/"전에" and "기록" (overseas cases say "days before the
  // conference" and "visit record" all the time); previous-visit phrasings are listed instead.
  PREVIOUS: {
    ko: [...CONCEPTS.PREVIOUS.ko.filter((s) => !['전에', '기록'].includes(s)), '왔을 때', '작년', '전에 온', '전에 와', '이전 방문', '전에 방문'],
    en: [...CONCEPTS.PREVIOUS.en.filter((s) => s !== 'before'), 'last time', 'been here before', 'visited before', 'been to', 'earlier visit', 'when you came']
  }
};

// "Show me / hand over <document>" asks for a document, not a question of the case: the player is
// pointed to the documents. Verbs are shared with the Korean engine; nouns are overseas paperwork.
export const DOC_NOUNS = { ko: ['여권', '서류', '항공권', '티켓', '초청장', '편지', '예약 확인', '증명서', '비자'], en: ['passport', 'document', 'documents', 'ticket', 'letter', 'invitation', 'papers', 'paperwork', 'visa', 'id'] };
