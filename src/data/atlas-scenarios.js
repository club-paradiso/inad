// Authored synthetic exercises, not actual records or legal determinations.
// Every outcome uses SIMULATION_RULE. Shared presentation text is defined once.
const k = (ko, en) => ({ ko, en });
const ex = (id, countryId, personId, name, tKo, tEn, bKo, bEn, expectedOutcome, dKo, dEn, e1Ko, e1En, e2Ko, e2En, rKo, rEn) => ({
  id, countryId, personId, name, title: k(tKo, tEn), brief: k(bKo, bEn),
  expectedOutcome, debrief: k(dKo, dEn),
  evidence: [k(e1Ko, e1En), k(e2Ko, e2En)], reply: k(rKo, rEn)
});

const exerciseData = [
  ex("SIM-CA-01", "CA", "SIM-CA-P01", "Avery Morgan", "방문 기록의 날짜", "Visit dates", "항공권은 11월 12일 출국으로 되어 있으나 방문 기록에는 11월 21일로 기재되어 있습니다.", "The ticket shows departure on 12 November; the visit record says 21 November.", "review", "진술만으로 기록의 날짜가 수정되지는 않았습니다. 두 원문을 남기고 추가 대조를 요청합니다.", "The explanation does not amend the record. Retain both sources and request further review.", "항공권: 출국 2026-11-12", "Ticket: departure 2026-11-12", "방문 기록: 출국 2026-11-21", "Visit record: departure 2026-11-21", "기록을 작성할 때 날짜를 뒤집어 적었습니다. 항공권의 11월 12일이 맞습니다.", "I transposed the date when writing the visit record. The ticket date, 12 November, is correct."),
  ex("SIM-CA-02", "CA", "SIM-CA-P02", "Jordan Ellis", "누락된 숙박 확인", "Missing accommodation evidence", "방문 계획에는 친구 집에 머문다고 적혀 있지만 제출 자료에 숙박 확인이 없습니다.", "The visit plan mentions staying with a friend, but no accommodation confirmation is supplied.", "evidence", "누락된 자료가 무엇인지 구체적으로 기록합니다. 자료 미제출 자체를 입국불허 결론으로 바꾸지 않습니다.", "Specify the missing evidence. Missing evidence alone is not a legal refusal conclusion.", "방문 계획: 친구 집에서 8일 체류", "Visit plan: eight days at a friend’s home", "제출 목록: 여권 사본, 방문 계획만 접수", "Submission list: passport copy and visit plan only", "초대 메시지를 아직 제출하지 않았습니다.", "I have not submitted the invitation message yet."),
  ex("SIM-CA-03", "CA", "SIM-CA-P03", "Taylor Rowan", "같은 이름의 과거 기록", "Same-name historical record", "검색 결과의 과거 방문 기록은 현재 대상과 문서 식별자가 다릅니다.", "A historical visit returned by the search has a different document identifier.", "complete", "문서 식별자로 기록을 분리했습니다. 연습상 검토 완료이며 실제 입국허가를 뜻하지 않습니다.", "The identifiers separate the records. Completing this exercise does not grant entry.", "현재 대상: SIM-CA-P03 / 문서 SIM-CA-D03", "Current person: SIM-CA-P03 / document SIM-CA-D03", "과거 동명이인: SIM-CA-P90 / 문서 SIM-CA-D90", "Historical same-name person: SIM-CA-P90 / document SIM-CA-D90", "그 방문 기록은 제 것이 아닙니다. 제 문서 식별자는 현재 접수 자료와 같습니다.", "That visit is not mine. My document identifier matches the current submission."),
  ex("SIM-GB-01", "GB", "SIM-GB-P01", "Casey Lane", "인계 메모의 누락", "Incomplete handover", "담당 과업은 방문 일정 확인입니다. 이전 메모는 첨부를 참조하지만 첨부가 없습니다.", "The assigned task is to check the visit schedule. The previous note references an absent attachment.", "evidence", "과업 체크 표시가 첨부 자료를 대신할 수 없습니다. 일정표를 요청하고 인계 사유를 남깁니다.", "A task checkmark cannot replace evidence. Request the itinerary and record the handover reason.", "인계 메모: 일정표 첨부 확인 필요", "Handover note: verify attached itinerary", "접수 목록: 일정표 미접수", "Receipt list: itinerary not received", "일정표는 가지고 있습니다. 다시 제출하겠습니다.", "I have the itinerary. I will submit it again."),
  ex("SIM-GB-02", "GB", "SIM-GB-P02", "Riley Park", "초대장과 진술의 차이", "Discrepancy in invitation and statement", "초대장은 2일간의 행사이나 첫 진술은 10일간 체류하겠다고 설명합니다.", "The invitation covers a two-day event, but the opening statement describes a ten-day visit.", "review", "설명되지 않은 체류 기간을 표시하고 추가 검토로 인계합니다. 의심만으로 불허하지 않습니다.", "Flag the unexplained stay duration and refer for review. Do not refuse on suspicion alone.", "초대장: 행사 2026-11-04 ~ 2026-11-05", "Invitation: event 2026-11-04 to 2026-11-05", "첫 진술: 방문 일정 10일", "Opening statement: ten-day visit", "행사는 이틀간 진행되고 나머지 기간은 관광을 하려고 합니다.", "The event is two days; I plan to sightsee for the remainder."),
  ex("SIM-GB-03", "GB", "SIM-GB-P03", "Alex Finley", "완료된 과업의 근거", "Evidence for a completed task", "이전 담당자가 완료한 과업의 접수 번호와 새로 제출된 자료 번호가 일치합니다.", "The receipt number on the earlier task matches the newly submitted evidence.", "complete", "새 문서와 진술을 대조해 같은 자료임을 확인했습니다. 추가 질문 없이 검토를 완료합니다.", "Cross-checking confirmed the same evidence. Complete review without additional questioning.", "이전 과업: 접수 번호 SIM-GB-R03 확인 완료", "Earlier task: confirmed receipt SIM-GB-R03", "새 제출 자료: 참조 번호 SIM-GB-R03", "New submission: reference SIM-GB-R03", "이전에 제출했던 자료와 같은 번호의 서류를 다시 낸 것입니다.", "It is the same document under the same reference as the earlier submission."),
  ex("SIM-NZ-01", "NZ", "SIM-NZ-P01", "Sam Linden", "다른 신청의 식별자", "Different application identifier", "배정 활동의 첨부 표지에 적힌 신청 번호가 현재 대상의 신청 번호와 다릅니다.", "The application number on the attachment cover does not match the current application.", "review", "다른 신청의 첨부를 분리하고 추가 검토로 넘깁니다. 다른 대상의 서류로 판정하지 않습니다.", "Separate the mismatched attachment and refer for review. Do not decide on another file.", "현재 신청 번호: SIM-NZ-A01", "Current application: SIM-NZ-A01", "첨부 표지: SIM-NZ-A90", "Attachment cover: SIM-NZ-A90", "다른 신청의 서류가 섞여 들어간 것 같습니다. 제 번호는 A01입니다.", "A page from another application seems to be included. My number is A01."),
  ex("SIM-NZ-02", "NZ", "SIM-NZ-P02", "Robin Ash", "누락된 자료 요청", "Request missing evidence", "체류 계획은 1쪽만 접수되었고 둘째 페이지가 접수 확인에서 빠져 있습니다.", "Only page one of the stay plan was received; page two is missing from the receipt.", "evidence", "누락된 둘째 페이지와 필요한 정보(숙박 계획)를 특정해 요청합니다. 절차상 보완 기회를 제공합니다.", "Request the missing page and specify needed details. Provide the procedural chance to supply it.", "체류 계획 1쪽: 일정 요약 접수", "Stay plan page 1: trip summary received", "접수 확인: 둘째 페이지 미접수", "Receipt check: page two not received", "둘째 페이지에 숙박 계획이 적혀 있습니다. 바로 제출할 수 있습니다.", "The accommodation plan is on page two. I can supply it immediately."),
  ex("SIM-NZ-03", "NZ", "SIM-NZ-P03", "Drew Vale", "활동 결과와 후속 메모", "Activity outcome and follow-up note", "자료 확인 활동의 완료 번호와 후속 메모의 참조 번호가 일치합니다.", "The completed activity reference and follow-up note reference agree.", "complete", "배정 활동의 근거가 충분함을 확인했습니다. 불필요한 보완 요구 없이 검토를 마칩니다.", "Confirmed the assigned activity is supported. Finish review without unnecessary requests.", "완료 활동: 자료 SIM-NZ-A03 / SIM-NZ-E03 확인", "Completed activity: verified SIM-NZ-A03 / SIM-NZ-E03", "후속 메모: 참조 SIM-NZ-A03 / SIM-NZ-E03 부합", "Follow-up note: matches SIM-NZ-A03 / SIM-NZ-E03", "앞서 완료된 활동 기록과 후속 메모가 같은 사건을 다루고 있습니다.", "The earlier completed activity and note deal with the same case.")
];

const fu = (qKo, qEn, aKo, aEn) => ({ q: k(qKo, qEn), answer: k(aKo, aEn) });
const followUps = {
  "SIM-CA-01": fu("방문 기록과 항공권의 출국일 중 어느 쪽이 맞습니까?", "Which departure date is correct, the ticket or the visit record?", "항공권의 11월 12일이 맞습니다. 방문 기록은 작성할 때 날짜를 잘못 적었습니다.", "The ticket date of 12 November is correct; the visit record had the date transposed."),
  "SIM-CA-02": fu("체류와 관련해 실제 제출된 서류는 무엇입니까?", "Which documents were actually submitted about the stay?", "제출 목록에는 여권 사본과 방문 계획만 있고 숙박 확인은 없습니다.", "Only a passport copy and visit plan are listed; accommodation confirmation is absent."),
  "SIM-CA-03": fu("현재 대상과 과거 동명이인의 문서 식별자는 일치합니까?", "Do the document identifiers match for the current person and same-name record?", "현재 문서는 SIM-CA-D03, 과거 동명이인 문서는 SIM-CA-D90으로 다릅니다.", "The current document is SIM-CA-D03 and the historical document is SIM-CA-D90; they differ."),
  "SIM-GB-01": fu("인계 메모가 언급한 일정표는 실제 접수 목록에 있습니까?", "Is the itinerary mentioned in the handover note in the received list?", "인계 메모는 일정표를 참조하지만 접수 목록에는 일정표가 없습니다.", "The handover note references an itinerary, but none appears in the received list."),
  "SIM-GB-02": fu("초대장의 행사 날짜와 첫 진술의 방문 기간은 어떻게 다릅니까?", "How do the event dates differ from the stated visit length?", "초대장은 11월 4일부터 5일까지의 행사이고, 첫 진술은 방문 10일입니다.", "The invitation covers 4–5 November; the opening statement describes a ten-day visit."),
  "SIM-GB-03": fu("이전 과업과 재제출 자료의 참조번호는 무엇입니까?", "Which reference appears in both the earlier task and resubmitted evidence?", "양쪽 모두 SIM-GB-R03입니다.", "Both list SIM-GB-R03."),
  "SIM-NZ-01": fu("현재 신청 번호와 첨부 표지의 번호가 같은가요?", "Does the attachment cover match the current application identifier?", "현재 신청은 SIM-NZ-A01, 첨부 표지는 SIM-NZ-A90으로 서로 다릅니다.", "The current application is SIM-NZ-A01; the attachment cover says SIM-NZ-A90."),
  "SIM-NZ-02": fu("체류 계획의 몇 쪽이 접수 확인에서 빠져 있습니까?", "Which page of the stay plan is missing from the receipt?", "접수 확인에는 체류 계획의 둘째 페이지가 없습니다.", "The receipt is missing page two of the stay plan."),
  "SIM-NZ-03": fu("자료 확인 활동과 후속 메모가 가리키는 참조번호는 무엇입니까?", "Which references do the evidence activity and follow-up note share?", "두 기록 모두 SIM-NZ-A03 / SIM-NZ-E03을 가리킵니다.", "Both refer to SIM-NZ-A03 / SIM-NZ-E03.")
};

const iq = (id, qKo, qEn, aKo, aEn) => ({ id, q: k(qKo, qEn), answer: k(aKo, aEn) });
const investigativeFollowUps = {
  "SIM-CA-01": [iq("clarify_dates", "방문 기록과 항공권 출국일이 다른 이유는 무엇입니까?", "Why do departure dates differ?", "12일과 21일을 뒤집어 적었습니다. 항공권 11월 12일이 맞습니다.", "I transposed 12 and 21. Ticket 12 Nov is correct.")],
  "SIM-GB-02": [iq("gb02_remaining_days", "행사 후 남은 체류 기간에는 무엇을 하실 예정입니까?", "What are your plans after the event?", "행사 후 8일간 런던 등을 관광할 계획입니다.", "I plan to sightsee for remaining 8 days.")],
  "SIM-NZ-02": [iq("nz02_missing_page", "누락된 체류 계획 둘째 쪽에는 어떤 내용이 있습니까?", "What is on missing page 2?", "호텔 예약 등 숙박 계획입니다. 바로 보완 제출하겠습니다.", "Accommodation details. I can submit right away.")]
};

const df = (id, sourceId, sourceType, ko, en, questionIds) => ({ id, sourceId, sourceType, label: k(ko, en), page: 0, ...(questionIds ? { questionIds } : {}) });
const authoredCaseFacts = {
  "SIM-CA-01": [
    df("SIM-CA-01-F-TICKET", "SIM-CA-01-DOC1", "document", "항공권: 출국 2026-11-12", "Ticket: departure 2026-11-12"),
    df("SIM-CA-01-F-VISIT", "SIM-CA-01-DOC2", "document", "방문 기록: 출국 2026-11-21", "Visit record: departure 2026-11-21"),
    df("SIM-CA-01-F-STMT", "SIM-CA-01-STMT", "statement", "진술: 방문 기록 작성 시 날짜 오기 (12일 정류)", "Statement: Transposed date on visit record", ["clarify_dates", "clarify"])
  ],
  "SIM-GB-02": [
    df("SIM-GB-02-F-EVENT", "SIM-GB-02-DOC1", "document", "초대장: 행사 2026-11-04 ~ 2026-11-05", "Invitation: event 2026-11-04 to 2026-11-05"),
    df("SIM-GB-02-F-STAY", "SIM-GB-02-DOC2", "document", "첫 진술: 방문 일정 10일", "Opening statement: ten-day visit"),
    df("SIM-GB-02-F-TOURISM", "SIM-GB-02-STMT", "statement", "진술: 행사 외 8일간 개인 관광 일정", "Statement: 8 days personal tourism", ["gb02_remaining_days"])
  ],
  "SIM-NZ-02": [
    df("SIM-NZ-02-F-PAGE1", "SIM-NZ-02-DOC1", "document", "체류 계획 1쪽: 일정 요약 접수", "Stay plan page 1: trip summary received"),
    df("SIM-NZ-02-F-RECEIPT-PAGE2", "SIM-NZ-02-DOC2", "document", "접수 확인: 둘째 페이지 미접수", "Receipt check: page two not received"),
    df("SIM-NZ-02-F-PAGE2-DETAIL", "SIM-NZ-02-STMT", "statement", "진술: 2쪽에 숙박 계획 포함 (보완 제출 가능)", "Statement: Page 2 contains accommodation details", ["nz02_missing_page"])
  ]
};

const dc = (id, facts, type, findingId, koT, enT, koE, enE, unlocks) => ({ id, facts, type, findingId, title: k(koT, enT), explanation: k(koE, enE), unlocks });
const authoredCaseComparisons = {
  "SIM-CA-01": [
    dc("COMP-CA-01-DATES", ["SIM-CA-01-F-TICKET", "SIM-CA-01-F-VISIT"], "CONFLICT", "CA01_DATE_CONFLICT", "출국일 불일치", "Date conflict", "항공권(11-12)과 방문기록(11-21) 상충.", "Ticket (12 Nov) contradicts visit record (21 Nov).", { questions: ["clarify_dates"], tasks: ["evidence"] }),
    dc("COMP-CA-01-TICKET-STMT", ["SIM-CA-01-F-TICKET", "SIM-CA-01-F-STMT"], "MATCH", "CA01_TICKET_MATCHES_STMT", "항공권과 진술 일치", "Ticket matches statement", "항공권 출국일과 오기 진술 부합.", "Ticket supports statement.", { tasks: ["handover"] }),
    dc("COMP-CA-01-VISIT-STMT", ["SIM-CA-01-F-VISIT", "SIM-CA-01-F-STMT"], "UNVERIFIED", "CA01_RECORD_UNAMENDED", "방문 기록 미정정", "Record unamended", "진술만으로 기록 미정정.", "Statement does not amend record.", { tasks: ["handover"] })
  ],
  "SIM-GB-02": [
    dc("COMP-GB-02-GAP", ["SIM-GB-02-F-EVENT", "SIM-GB-02-F-STAY"], "UNVERIFIED", "GB02_DURATION_GAP", "행사·체류 기간 차이 식별", "Duration gap recognized", "초대장 행사 기간(이틀)과 전체 체류(열흘) 차이 식별.", "Gap between 2-day event and 10-day stay.", { questions: ["gb02_remaining_days"], tasks: ["evidence"] }),
    dc("COMP-GB-02-EVENT-TOURISM", ["SIM-GB-02-F-EVENT", "SIM-GB-02-F-TOURISM"], "MATCH", "GB02_ITINERARY_SEPARATED", "행사·관광 일정 구분", "Schedules separated", "공식 행사와 개인 관광 일정 구분 확인.", "Official event separated from tourism.", { tasks: ["handover"] }),
    dc("COMP-GB-02-STAY-TOURISM", ["SIM-GB-02-F-STAY", "SIM-GB-02-F-TOURISM"], "MATCH", "GB02_TOTAL_DAYS_ACCOUNTED", "총 체류 일수 해명 부합", "Total duration accounted", "행사 2일과 관광 8일로 총 10일 체류 해명 부합.", "2 days event + 8 days tourism accounts for 10 days.", { tasks: ["handover"] })
  ],
  "SIM-NZ-02": [
    dc("COMP-NZ-02-MISSING", ["SIM-NZ-02-F-PAGE1", "SIM-NZ-02-F-RECEIPT-PAGE2"], "MISSING", "NZ02_PAGE2_MISSING", "체류 계획 2쪽 미접수 확인", "Page 2 missing", "체류 계획 1쪽 접수 · 2쪽 미접수 확인.", "Page 1 present · page 2 missing.", { questions: ["nz02_missing_page"], tasks: ["evidence"], evidenceRequests: ["SIM-NZ-02-REQ-PAGE2"] }),
    dc("COMP-NZ-02-STMT-PAGE2", ["SIM-NZ-02-F-RECEIPT-PAGE2", "SIM-NZ-02-F-PAGE2-DETAIL"], "MATCH", "NZ02_PAGE2_CONFIRMED", "누락 진술 부합", "Omission confirmed", "누락 2쪽 내용(숙박 계획) 및 보완 제출 확인.", "Page 2 accommodation details confirmed.", { tasks: ["handover"] })
  ]
};

const documentTitles = [k("제출 자료", "Submitted evidence"), k("연결 기록", "Linked record")];
const syntheticNotice = k("합성 문서 · 보안특징 및 진위 판별 기능 없음", "Synthetic document · no security-feature or authenticity checking");
const questions = [{ id: "clarify", q: k("자료와 기록의 차이를 설명해 주세요.", "Please explain the relationship between these records.") }, { id: "source", q: k("어느 자료를 확인하면 됩니까?", "Which evidence should we check?"), answer: k("현재 접수된 제출 자료와 연결 기록을 함께 확인해 주세요.", "Please compare the submitted evidence with the linked record.") }];
const recordTitles = [k("현재 접수 기록", "Current submission"), k("관련 기록 · 대조 필요", "Related record · compare identifiers")];
const taskDefinitions = [{ id: "identity", title: k("대상과 사건 식별자 대조", "Compare person and case identifiers"), documentIndex: 0 }, { id: "evidence", title: k("연결 자료와 진술 대조", "Compare linked evidence and statement"), documentIndex: 1 }, { id: "handover", title: k("미확인 사항과 다음 행동 기록", "Record unresolved facts and next action"), documentIndex: 1 }];

export const ATLAS_SCENARIOS = exerciseData.map(({ evidence, reply, ...c }) => {
  const documents = evidence.map((page, i) => ({ id: c.id + '-DOC' + (i + 1), title: documentTitles[i], pages: i === 0 ? [page, syntheticNotice] : [page] }));
  return {
    ...c,
    ruleClass: 'SIMULATION_RULE',
    rulesetVersion: 'atlas-procedure-1',
    documents,
    questions: [...questions.map(q => ({ ...q, answer: q.answer || reply })), { id: 'crosscheck', ...followUps[c.id] }],
    investigativeQuestions: investigativeFollowUps[c.id] || [],
    facts: authoredCaseFacts[c.id] || [],
    comparisons: authoredCaseComparisons[c.id] || [],
    records: evidence.map((detail, i) => ({ id: c.id + '-REC' + (i + 1), title: recordTitles[i], detail, documentId: documents[i].id })),
    tasks: taskDefinitions.map(({ id, title, documentIndex }) => ({ id, title, documentId: documents[documentIndex].id }))
  };
});
export function atlasScenarios(countryId) { return ATLAS_SCENARIOS.filter((c) => c.countryId === countryId); }
export function atlasScenario(countryId, id) { return ATLAS_SCENARIOS.find((c) => c.countryId === countryId && c.id === id) || null; }
