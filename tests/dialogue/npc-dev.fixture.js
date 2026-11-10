// NPC Intelligence Layer development corpus: lines used while building follow-up, multi-question and acting
// behaviour. Tuning happens here only; the independent measurement is npc-heldout-2026-11.fixture.js.
export const NPC_DEV_SINGLE = {
  'ICN-S2-005': [
    ['목적이랑 귀국 항공권 얘기 좀 해 주세요', 'multi:purpose+return'],
    ['How much money do you have and who is your contact?', 'multi:funds+contact'],
    ['국내 연락처는 누구고, 돈은 얼마 있어요?', 'multi:contact+funds'],
    ['저녁 뭐 드셨어요?', 'unknown']
  ]
};
export const NPC_DEV_DIALOGUES = [
  { caseId: 'ICN-S2-005', note: 'contact → the house → how they met', turns: [
    ['국내 연락처는 누구입니까', 'contact'],
    ['그럼 그 사람이 사는 곳이 신고하신 주택이에요?', 'addressOwner'],
    ['그 친구분은 처음에 어디서 알게 됐어요?', 'host']
  ] },
  { caseId: 'ICN-S2-005', note: 'funds → paying for the ticket later', turns: [
    ['현금 얼마 있습니까', 'funds'],
    ['그 돈으로 귀국표는 어떻게 사요?', 'returnMoney']
  ] },
  { caseId: 'ICN-S2-005', note: 'English follow-up and repeat', turns: [
    ['Who is the contact number on your form?', 'contact'],
    ['Who lives in that house then?', 'addressOwner'],
    ['Who is the contact number on your form?', 'contact']
  ] }
];
