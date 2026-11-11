// Field notes (v12). Shown only in the debrief, after the case has ended.
// Each note says what the case turns on ("lead") and the misjudgement it is built to tempt ("trap").
// They explain reasoning under the public statute text already cited by the case (출입국관리법 제7조·제11조·
// 제12조·제12조의2, 난민법 제6조, 형사소송법 제200조의3; verified against law.go.kr text on 2026-11-11).
// They add no case fact, describe no internal screening standard and are never read by a verdict or a score.
export const FIELD_NOTES = {
  'ICN-S1-001': {
    lead: { ko: '무사증 단기방문에서 가릴 것은 하나입니다. 회의에 참석하는 것인지, 국내에서 보수를 받고 일하는 것인지. 일정과 비용을 누가 부담하는지가 맞으면 목적 확인은 끝납니다.', en: 'A visa-free short visit turns on one thing: attending a meeting, or working for pay in Korea. Once the schedule and who pays for the trip line up, the purpose is established.' },
    trap: { ko: '확인이 끝난 사람을 계속 붙잡는 것도 오판입니다. 질문 하나가 늘 때마다 뒤에 선 줄 전체가 기다립니다.', en: 'Holding someone after the checks are done is also a misjudgement. Every extra question is paid for by the whole queue.' }
  },
  'ICN-S1-002': {
    lead: { ko: '단기 관광은 숙소, 귀국편, 동행자 진술이 서로 맞는지만 보면 됩니다. 셋이 맞으면 보냅니다.', en: 'For a short holiday, check that lodging, return flight and the companion account agree. If they do, admit.' },
    trap: { ko: '국내에 아는 사람이 있다는 말에 반응하지 마십시오. 지인을 만나는 것과 지인에게 숙식·생계를 기대는 것은 다른 사실입니다.', en: 'Do not react to "I know someone here." Meeting a friend and depending on one for lodging or income are different facts.' }
  },
  'ICN-S1-003': {
    lead: { ko: '등록외국인의 재입국은 국적이 아니라 등록 상태와 체류기간이 기준입니다(제7조제2항제1호). 등록증이 유효하고 기간 안이면 사증을 다시 볼 이유가 없습니다.', en: 'A registered resident re-entering is judged on registration and period of stay, not nationality (Art. 7(2)1). With a valid card inside its period there is no visa to look for.' },
    trap: { ko: 'K-ETA가 없다고 멈추지 마십시오. 사전여행허가는 사증 없이 들어오는 사람을 위한 제도이고, 등록외국인의 재입국과는 축이 다릅니다.', en: 'Do not stop on a missing K-ETA. Travel authorisation is for visa-free arrivals; a resident re-entry runs on a different axis.' }
  },
  'ICN-S1-004': {
    lead: { ko: '국적만 보면 사증이 필요해 보이지만, 입국 근거는 사람마다 다릅니다. 이 사건은 카드의 KOR 승인과 여권번호 일치, 두 가지로 근거가 섭니다.', en: 'Nationality alone suggests a visa, but the basis of entry is individual. Here it rests on two things: the KOR endorsement and the passport number on the card.' },
    trap: { ko: '샘플을 들고 왔다는 것은 취업의 근거가 아닙니다. 상용과 취업을 가르는 것은 물건이 아니라 보수를 누가 주는가입니다.', en: 'Carrying samples is not evidence of employment. What separates business from work is who pays, not what is in the bag.' }
  },
  'ICN-S2-005': {
    lead: { ko: '사증이 유효한 것과 입국목적이 체류자격에 맞는 것은 별개의 요건입니다(제12조제3항제1호·제2호). 귀국편, 체재비, 숙소를 내준 사람 — 관광객이면 막힘없이 답하는 세 가지가 모두 비어 있습니다.', en: 'A valid visa and a purpose that fits the status are separate requirements (Art. 12(3)1 and 2). Return flight, funds, who provides the lodging — three things a tourist answers without thinking are all empty here.' },
    trap: { ko: '휴대전화 제시 거부나 연락처 조회 한 줄로 결론 내리지 마십시오. 요건을 갖추었음을 증명하는 것은 입국하려는 사람의 몫이지만(제12조제4항), 불허의 근거는 조회 한 줄이 아니라 확인된 사실 전체에서 나와야 합니다.', en: 'Do not conclude from a refused phone or one database line. The traveller must prove the requirements (Art. 12(4)), but the ground for refusal has to rest on the whole of what was established, not on one line.' }
  },
  'ICN-S2-006': {
    lead: { ko: '남이 예약해 준 숙소는 확인할 이유이지 결론이 아닙니다. 예약자와의 관계, 투숙객 명단, 같은 예약번호의 귀국편 — 확인 가능한 사실로 바꾸면 끝나는 사건입니다.', en: 'Lodging booked by someone else is a reason to check, not a conclusion. Relationship to the booker, the guest list, a return flight on the same booking — turn it into checkable facts and the case closes.' },
    trap: { ko: '재심은 불허로 가는 대기실이 아닙니다. 소명된 사람을 재심에서 허가하는 것이 재심의 정상적인 결과입니다.', en: 'Secondary is not a waiting room for refusal. Admitting someone whose account checks out is the normal outcome of secondary.' }
  },
  'ICN-S2-007': {
    lead: { ko: '왕복표와 유효한 사증이 있어도, 관광으로 들어와 보수를 받는 일을 하겠다는 진술이 나오면 목적이 체류자격과 맞지 않습니다(제12조제3항제2호). 결정적인 것은 조회 결과가 아니라 본인의 말입니다.', en: 'Even with a return ticket and a valid visa, a statement about doing paid work on a tourist entry means the purpose does not fit the status (Art. 12(3)2). What decides it is the traveller\'s own words, not a lookup.' },
    trap: { ko: '숙소 이름을 못 댄다는 것만으로는 부족합니다. 친구가 예약한 여행자도 이름을 모릅니다. 006번 사건과 갈리는 지점은 그다음 확인에서 무엇이 나오느냐입니다.', en: 'Not knowing the hotel name is not enough. A traveller whose friend booked does not know it either. What separates this case from 006 is what the next check returns.' }
  },
  'ICN-S2-008': {
    lead: { ko: '단기상용의 경계는 활동의 성격입니다. 회의·검수·상담은 범위 안이고, 국내 업체에서 임금을 받는 근로는 범위 밖입니다. 초청사가 실재하고 보수 관계가 없으면 허가합니다.', en: 'Short-term business is bounded by the nature of the activity. Meetings, inspection and consultation are inside; waged work for a Korean firm is outside. A real host and no pay from it means admit.' },
    trap: { ko: '측정 장비를 들고 있다는 사실에 끌려가지 마십시오. 장비는 검수하러 온 사람도 들고 옵니다.', en: 'Do not be led by the measuring equipment. Someone who came to inspect brings it too.' }
  },
  'ICN-S3-009': {
    lead: { ko: '절차는 한 계단씩입니다. 판독 이상은 재심 사유이고, 감식 결과가 나와야 범죄혐의가 되며, 긴급체포는 형사소송법 제200조의3의 세 요건을 하나씩 확인한 뒤의 일입니다.', en: 'One step at a time. A reader anomaly is a reason for secondary; forensics makes it a criminal suspicion; an emergency arrest comes only after each of the three elements of Criminal Procedure Act Art. 200-3 is confirmed.' },
    trap: { ko: '위조가 의심된다고 곧바로 불허하거나 체포로 건너뛰는 것이 가장 흔한 실수입니다. 국어가 통하지 않으면 신문 전에 통역부터 확보합니다(제48조제6항).', en: 'Jumping from suspected forgery straight to refusal or arrest is the most common error. If the suspect does not understand Korean, secure an interpreter before questioning (Art. 48(6)).' }
  },
  'ICN-S3-010': {
    lead: { ko: '난민신청 의사가 나오는 순간 입국심사는 멈추고 난민법 제6조 절차가 먼저입니다. 회부 여부를 정한 뒤에야 다시 출입국관리법상 입국심사로 돌아옵니다.', en: 'The moment an asylum claim is voiced, entry inspection pauses and Refugee Act Art. 6 comes first. Only after the referral decision does entry inspection resume.' },
    trap: { ko: '불회부와 입국불허는 근거 법률이 다른 두 개의 결정입니다. 하나의 결정으로 묶어 처리하지 마십시오.', en: 'Non-referral and refusal of entry are two decisions under two statutes. Do not merge them into one.' }
  },
  'ICN-S3-011': {
    lead: { ko: '쟁점은 하나, 생체정보 제공 의무입니다(제12조의2). 면제 사유 — 17세 미만, 외국정부·국제기구 업무, 대통령령이 정한 사람 — 를 먼저 지우고, 절차와 결과를 다시 알린 뒤에도 거부하면 그때 불허를 검토합니다.', en: 'One issue: the duty to provide biometrics (Art. 12-2). Rule out the exemptions first — under 17, foreign government or international organisation business, persons set by decree — and consider refusal only if the traveller still declines after being told the procedure and its consequence.' },
    trap: { ko: '사증도 왕복표도 정상이라는 점이 판단을 흐립니다. 다른 요건이 다 맞아도 이 의무는 따로 섭니다. 반대로, 거부 의사 한마디에 면제 사유 확인도 안내도 없이 불허하면 판단의 근거가 비게 됩니다.', en: 'A valid visa and return ticket cloud the judgement. This duty stands apart from every other requirement. Equally, refusing on the first "no" without checking exemptions or explaining leaves the decision without a basis.' }
  },
  'ICN-S3-012': {
    lead: { ko: '국적에 따른 무사증 허용과 개인에 대한 입국금지는 서로 다른 축입니다(제11조제1항제6호). 판단의 근거는 본인의 기억이 아니라 공식 기록의 처분 종류와 출국일입니다.', en: 'Visa-free access by nationality and an individual entry ban are separate axes (Art. 11(1)6). The basis is the type of order and the departure date in the official record, not the traveller\'s recollection.' },
    trap: { ko: '출국명령과 강제퇴거명령을 같은 것으로 읽지 마십시오. 처분의 종류를 확인하지 않고 "과거에 문제가 있었다"만으로 불허하면 사유를 특정할 수 없습니다.', en: 'Do not read a departure order and a deportation order as the same thing. Refusing on "there was a problem before" without confirming the type of order leaves the ground unspecified.' }
  }
};

export function fieldNote(caseId, locale = 'ko') {
  const n = FIELD_NOTES[caseId]; if (!n) return null;
  const pick = (x) => x[locale] || x.ko;
  return { lead: pick(n.lead), trap: pick(n.trap) };
}
