// United Kingdom · authored synthetic exercises (v11 scenario contract, docs/v11/SCENARIO_SCHEMA.md).
// Fictional people, organisations and records at fictional Heathrow/Manchester desks.
// Outcomes are SIMULATION_RULE feedback, never a legal determination or a visit decision.
const L = (ko, en) => ({ ko, en });
const NOTICE = L('합성 문서 · 보안특징 및 진위 판별 기능 없음', 'Synthetic document · no security-feature or authenticity checking');
const SOURCE_ANSWER = L('현재 접수된 제출 자료와 연결 기록을 함께 확인해 주세요.', 'Please compare the submitted evidence with the linked record.');
const SOURCE_Q = L('어느 자료를 확인하면 됩니까?', 'Which evidence should we check?');
const CLARIFY_Q = L('자료와 기록의 차이를 설명해 주세요.', 'Please explain the relationship between these records.');

export const CASES = [
  // ── SIM-GB-01 · legacy (handover) ─────────────────────────────────────────
  {
    id: 'SIM-GB-01', countryId: 'GB', personId: 'SIM-GB-P01', name: 'Casey Lane',
    difficulty: 'intro', category: 'missing',
    title: L('인계 메모의 누락', 'Incomplete handover'),
    brief: L('담당 과업은 방문 일정 확인입니다. 이전 메모는 첨부를 참조하지만 첨부가 없습니다.', 'The assigned task is to check the visit schedule. The previous note references an absent attachment.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('관광', 'Holiday') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-11-09 ~ 2026-11-16 (8일)', '9–16 November 2026 (8 days)') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 사본 · 귀국 항공권 · 인계 메모', 'Passport copy · return ticket · handover note') }
    ],
    opening: L('안녕하세요. 아까 다른 창구에서 일정을 확인받았는데, 여기서 다시 본다고 들었습니다.', 'Hello. My plans were looked at by another desk earlier, and I was told you would check them again.'),
    documents: [
      { id: 'SIM-GB-01-DOC1', title: L('인계 메모', 'Handover note'), pages: [L('인계 메모: 일정표 첨부 확인 필요 (2026-11-09 08:40, 이전 창구)', 'Handover note: verify attached itinerary (09 Nov 2026, 08:40, previous desk)'), NOTICE] },
      { id: 'SIM-GB-01-DOC2', title: L('접수 목록', 'Receipt list'), pages: [L('접수 목록: 여권 사본 · 귀국 항공권 (2026-11-16 히스로 출발) · 일정표 미접수', 'Receipt list: passport copy · return ticket (departs Heathrow 2026-11-16) · itinerary not received')] },
      { id: 'SIM-GB-01-DOC3', title: L('과업 기록', 'Task log'), pages: [L('과업 「방문 일정 확인」: 완료 표시 (이전 창구, 08:41) · 연결 자료: 없음', 'Task "visit schedule check": marked done (previous desk, 08:41) · linked evidence: none')] }
    ],
    records: [
      { id: 'SIM-GB-01-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('인계 메모: 일정표 첨부 확인 필요', 'Handover note: verify attached itinerary'), documentId: 'SIM-GB-01-DOC1' },
      { id: 'SIM-GB-01-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('접수 목록: 일정표 미접수', 'Receipt list: itinerary not received'), documentId: 'SIM-GB-01-DOC2' },
      { id: 'SIM-GB-01-REC3', title: L('과업 이력', 'Task history'), detail: L('08:41 이전 창구에서 「방문 일정 확인」을 완료로 표시. 첨부 필드 비어 있음.', 'Visit schedule check marked done by the previous desk at 08:41. Attachment field empty.'), documentId: 'SIM-GB-01-DOC3' }
    ],
    facts: [
      { id: 'SIM-GB-01-F-NOTE', sourceType: 'document', sourceId: 'SIM-GB-01-DOC1', page: 0, label: L('인계 메모: 첨부된 일정표를 확인하라고 기재', 'Handover note: refers to an attached itinerary') },
      { id: 'SIM-GB-01-F-RECEIPT', sourceType: 'document', sourceId: 'SIM-GB-01-DOC2', page: 0, label: L('접수 목록: 일정표 미접수', 'Receipt list: itinerary not received') },
      { id: 'SIM-GB-01-F-TICKET', sourceType: 'document', sourceId: 'SIM-GB-01-DOC2', page: 0, label: L('접수 목록: 귀국 항공권 2026-11-16 출발', 'Receipt list: return ticket departs 2026-11-16') },
      { id: 'SIM-GB-01-F-TASK', sourceType: 'record', sourceId: 'SIM-GB-01-REC3', label: L('과업 이력: 완료 표시, 첨부 없음', 'Task history: marked done, no attachment') },
      { id: 'SIM-GB-01-F-STMT', sourceType: 'statement', sourceId: 'SIM-GB-01-STMT', questionIds: ['clarify'], label: L('진술: 일정표를 가지고 있으며 다시 제출하겠다', 'Statement: has the itinerary and will submit it again') },
      { id: 'SIM-GB-01-F-PLAN', sourceType: 'statement', sourceId: 'SIM-GB-01-STMT-PLAN', questionIds: ['gb01_itinerary_contents'], label: L('진술: 일정은 11월 9일~16일, 런던과 바스', 'Statement: itinerary covers 9–16 November, London and Bath') }
    ],
    questions: [
      { id: 'clarify', q: CLARIFY_Q, answer: L('일정표는 가지고 있습니다. 다시 제출하겠습니다.', 'I have the itinerary. I will submit it again.') },
      { id: 'source', q: SOURCE_Q, answer: SOURCE_ANSWER },
      { id: 'crosscheck', q: L('인계 메모에 적힌 일정표를 이전 창구에 제출하셨습니까?', 'Did you hand in the itinerary mentioned in the handover note?'), answer: L('보여 드리긴 했는데 바로 돌려받았습니다. 사본이 남았는지는 모르겠습니다.', 'I showed it, and it was handed straight back. I do not know whether a copy was kept.') },
      { id: 'gb01_itinerary_contents', q: L('일정표에는 어떤 내용이 들어 있습니까?', 'What does your itinerary cover?'), answer: L('일정은 11월 9일부터 16일까지이고, 런던과 바스에 머뭅니다. 휴대전화에 PDF로 있습니다.', 'It covers 9 to 16 November, London and Bath. I have it as a PDF on my phone.') }
    ],
    comparisons: [
      { id: 'COMP-GB-01-MISSING', facts: ['SIM-GB-01-F-NOTE', 'SIM-GB-01-F-RECEIPT'], type: 'MISSING', findingId: 'GB01_ITINERARY_NOT_RECEIVED', title: L('참조된 일정표 미접수', 'Referenced itinerary not received'), explanation: L('인계 메모는 첨부된 일정표를 가리키지만 접수 목록에는 일정표가 없습니다.', 'The handover note points to an attached itinerary, but none appears on the receipt list.'), unlocks: { questions: ['gb01_itinerary_contents'], requests: ['SIM-GB-01-REQ-ITIN'] } },
      { id: 'COMP-GB-01-CHECKMARK', facts: ['SIM-GB-01-F-TASK', 'SIM-GB-01-F-RECEIPT'], type: 'UNVERIFIED', findingId: 'GB01_CHECKMARK_WITHOUT_EVIDENCE', title: L('근거 없는 완료 표시', 'Checkmark without evidence'), explanation: L('과업은 완료로 표시됐지만 연결된 자료가 없고 접수 목록에도 일정표가 없습니다. 표시만으로 확인했다고 볼 수 없습니다.', 'The task is marked done, but nothing is linked and the itinerary is not on the receipt list. The checkmark alone does not show a check took place.') },
      { id: 'COMP-GB-01-ABSENCE', facts: ['SIM-GB-01-F-STMT', 'SIM-GB-01-F-RECEIPT'], type: 'MATCH', findingId: 'GB01_ABSENCE_CONFIRMED', title: L('진술과 접수 목록 부합', 'Statement fits the receipt list'), explanation: L('다시 제출하겠다는 진술은 일정표가 아직 접수되지 않았다는 목록과 맞습니다.', 'Offering to submit it again is consistent with the itinerary not yet being on file.') },
      { id: 'COMP-GB-01-PLAN', facts: ['SIM-GB-01-F-PLAN', 'SIM-GB-01-F-TICKET'], type: 'MATCH', findingId: 'GB01_PLAN_FITS_TICKET', title: L('설명한 일정과 항공권 부합', 'Described plan fits the ticket'), explanation: L('설명한 일정의 마지막 날(11월 16일)이 귀국 항공권과 같습니다. 다만 진술일 뿐 일정표 자체는 아닙니다.', 'The described plan ends on 16 November, the ticket date. It is still a description, not the itinerary itself.') }
    ],
    requests: [
      { id: 'SIM-GB-01-REQ-ITIN', title: L('인계 메모가 언급한 일정표 제출 요청', 'Request the itinerary named in the handover note'), result: L('요청 기록됨. 여행자가 휴대전화의 PDF를 보내기로 했으며, 아직 접수 목록에는 없습니다.', 'Request recorded. The traveller will send the PDF from their phone; it is not yet on the receipt list.') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('과업 기록에는 완료 표시만 있고 일정표는 접수되지 않았습니다. 설명한 일정이 항공권과 맞아도 자료를 대신하지 못합니다. 아무도 보여 줄 수 없는 확인에 기대어 닫는 것입니다.', 'The task log shows a checkmark, but no itinerary is on file. The described plan fits the ticket, but a description is not the document. Closing would rely on a check nobody can show.'),
      evidence: L('맞습니다. 빠진 자료(인계 메모가 언급한 일정표)를 특정해 요청하고, 인계 사유를 기록했습니다.', 'Correct. The specific missing item, the itinerary named in the handover note, is identified and requested, and the handover reason is recorded.'),
      review: L('상충하는 내용은 없습니다. 설명은 항공권과 맞고 여행자는 자료를 낼 수 있습니다. 빠진 첨부를 추가 검토로 넘기면 단순한 누락을 과도하게 키웁니다.', 'Nothing conflicts: the account fits the ticket and the traveller can supply the document. Referring a missing attachment escalates a simple gap.')
    },
    assessment: {
      issue: ['GB01_ITINERARY_NOT_RECEIVED'],
      distinguish: ['GB01_PLAN_FITS_TICKET', 'GB01_ABSENCE_CONFIRMED'],
      resolve: { findings: ['GB01_CHECKMARK_WITHOUT_EVIDENCE'], questions: ['clarify', 'gb01_itinerary_contents'], requests: ['SIM-GB-01-REQ-ITIN'] },
      feedback: {
        issueHit: L('참조된 일정표의 미접수 확인', 'Absent itinerary identified'), issueMiss: L('인계 메모와 접수 목록 미대조', 'Handover note not compared with the receipt list'),
        resolveHit: L('근거 없는 완료 표시 확인 · 일정표 요청', 'Unsupported checkmark noted · itinerary requested'), resolveMiss: L('과업 기록 대조 또는 자료 요청 미완료', 'Task log comparison or request incomplete')
      }
    },
    debrief: L('과업 체크 표시가 첨부 자료를 대신할 수 없습니다. 일정표를 요청하고 인계 사유를 남깁니다.', 'A task checkmark cannot replace evidence. Request the itinerary and record the handover reason.'),
    sources: ['GB-VISIT', 'GB-RULES']
  },

  // ── SIM-GB-02 · legacy (vertical slice; tests depend on these identifiers) ─────
  {
    id: 'SIM-GB-02', countryId: 'GB', personId: 'SIM-GB-P02', name: 'Riley Park',
    difficulty: 'standard', category: 'purpose',
    title: L('초대장과 진술의 차이', 'Discrepancy in invitation and statement'),
    brief: L('초대장은 2일간의 행사이나 첫 진술은 10일간 체류하겠다고 설명합니다.', 'The invitation covers a two-day event, but the opening statement describes a ten-day visit.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('행사 참석', 'Attending an event') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('10일', 'Ten days') },
      { label: L('제출 자료', 'Submitted'), value: L('행사 초대장 · 첫 진술 기록', 'Event invitation · opening statement record') }
    ],
    opening: L('안녕하세요. 맨체스터에서 열리는 행사에 왔고, 열흘 머물 예정입니다.', 'Hello. I am here for an event in Manchester, and I will be staying ten days.'),
    documents: [
      { id: 'SIM-GB-02-DOC1', title: L('행사 초대장', 'Event invitation'), pages: [L('초대장: 행사 2026-11-04 ~ 2026-11-05 · 장소 Northgate 전시장, 맨체스터 (가상 주최)', 'Invitation: event 2026-11-04 to 2026-11-05 · Northgate Exhibition Hall, Manchester (fictional organiser)'), NOTICE] },
      { id: 'SIM-GB-02-DOC2', title: L('첫 진술 기록', 'Opening statement record'), pages: [L('첫 진술: 방문 일정 10일', 'Opening statement: ten-day visit')] }
    ],
    records: [
      { id: 'SIM-GB-02-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('초대장: 행사 2026-11-04 ~ 2026-11-05', 'Invitation: event 2026-11-04 to 2026-11-05'), documentId: 'SIM-GB-02-DOC1' },
      { id: 'SIM-GB-02-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('첫 진술: 방문 일정 10일', 'Opening statement: ten-day visit'), documentId: 'SIM-GB-02-DOC2' },
      { id: 'SIM-GB-02-REC3', title: L('귀국 예약 기록', 'Return booking record'), detail: L('귀국편: 2026-11-13 맨체스터 출발 · 2026-09-20 예약', 'Return flight: departs Manchester 2026-11-13 · booked 2026-09-20'), documentId: 'SIM-GB-02-DOC2' }
    ],
    facts: [
      { id: 'SIM-GB-02-F-EVENT', sourceType: 'document', sourceId: 'SIM-GB-02-DOC1', page: 0, label: L('초대장: 행사 2026-11-04 ~ 2026-11-05', 'Invitation: event 2026-11-04 to 2026-11-05') },
      { id: 'SIM-GB-02-F-STAY', sourceType: 'document', sourceId: 'SIM-GB-02-DOC2', page: 0, label: L('첫 진술: 방문 일정 10일', 'Opening statement: ten-day visit') },
      { id: 'SIM-GB-02-F-TOURISM', sourceType: 'statement', sourceId: 'SIM-GB-02-STMT', questionIds: ['gb02_remaining_days'], label: L('진술: 행사 외 8일간 개인 관광 일정', 'Statement: 8 days personal tourism') },
      { id: 'SIM-GB-02-F-RETURN', sourceType: 'record', sourceId: 'SIM-GB-02-REC3', label: L('귀국 예약: 2026-11-13 출발', 'Return booking: departs 2026-11-13') }
    ],
    questions: [
      { id: 'clarify', q: CLARIFY_Q, answer: L('행사는 이틀간 진행되고 나머지 기간은 관광을 하려고 합니다.', 'The event is two days; I plan to sightsee for the remainder.') },
      { id: 'source', q: SOURCE_Q, answer: SOURCE_ANSWER },
      { id: 'crosscheck', q: L('초대장의 행사 날짜와 말씀하신 방문 기간은 어떻게 다릅니까?', 'How do the event dates differ from the visit length you gave?'), answer: L('행사 자체는 11월 4일과 5일입니다. 열흘은 여행 전체 기간을 말씀드린 겁니다.', 'The event itself is on 4 and 5 November. Ten days is the length of my whole trip.') },
      { id: 'gb02_remaining_days', q: L('행사 후 남은 체류 기간에는 무엇을 하실 예정입니까?', 'What are your plans after the event?'), answer: L('행사 후 8일간 런던 등을 관광할 계획입니다.', 'I plan to sightsee in London and elsewhere for the remaining 8 days.') }
    ],
    comparisons: [
      { id: 'COMP-GB-02-GAP', facts: ['SIM-GB-02-F-EVENT', 'SIM-GB-02-F-STAY'], type: 'UNVERIFIED', findingId: 'GB02_DURATION_GAP', title: L('행사·체류 기간 차이 식별', 'Duration gap recognized'), explanation: L('초대장 행사 기간(이틀)과 전체 체류(열흘)의 차이를 식별했습니다. 차이 자체는 잘못을 뜻하지 않습니다.', 'Gap between the 2-day event and the 10-day stay. A gap is not, by itself, wrongdoing.'), unlocks: { questions: ['gb02_remaining_days'] } },
      { id: 'COMP-GB-02-EVENT-TOURISM', facts: ['SIM-GB-02-F-EVENT', 'SIM-GB-02-F-TOURISM'], type: 'MATCH', findingId: 'GB02_ITINERARY_SEPARATED', title: L('행사·관광 일정 구분', 'Schedules separated'), explanation: L('공식 행사 이틀과 개인 관광 일정이 겹치지 않게 구분됩니다.', 'The two event days are kept separate from the personal sightseeing.') },
      { id: 'COMP-GB-02-STAY-TOURISM', facts: ['SIM-GB-02-F-STAY', 'SIM-GB-02-F-TOURISM'], type: 'MATCH', findingId: 'GB02_TOTAL_DAYS_ACCOUNTED', title: L('총 체류 일수 해명 부합', 'Total duration accounted'), explanation: L('행사 2일과 관광 8일로 총 10일 체류가 설명됩니다.', '2 days event + 8 days tourism accounts for 10 days.') },
      { id: 'COMP-GB-02-STAY-RETURN', facts: ['SIM-GB-02-F-STAY', 'SIM-GB-02-F-RETURN'], type: 'MATCH', findingId: 'GB02_RETURN_FITS_STAY', title: L('귀국 예약과 체류 기간 부합', 'Return booking fits the stay'), explanation: L('11월 4일부터 13일 출발까지는 열흘로, 첫 진술의 체류 기간과 맞습니다.', 'From 4 November to the 13 November departure is ten days, matching the opening statement.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('일수는 맞아떨어지지만 열흘 중 여드레는 진술로만 뒷받침되고, 초대장은 행사만 다룹니다. 이 연습에서는 초대장 범위와 진술한 체류의 차이를 기록해 넘기며, 진술만으로 닫지 않습니다.', 'The days add up, but eight of the ten rest on the statement alone and the invitation covers only the event. In this exercise the difference between the invitation and the declared stay is recorded and referred, not closed on a statement.'),
      evidence: L('빠진 자료로 특정할 것이 없습니다. 초대장은 행사에 대해 온전하고 귀국 예약도 체류와 맞습니다. 관광을 증명하라는 요청은 목적이 분명한 요청이 아닙니다.', 'No specific document is missing: the invitation is complete for the event and the return booking fits the stay. Asking for proof of sightseeing would not be a targeted request.'),
      review: L('맞습니다. 차이를 표시하고, 진술이 일수를 설명한다는 점까지 대조한 뒤, 진술로만 뒷받침되는 부분을 추가 검토(모의)로 넘깁니다. 의심만으로 불허하지 않습니다.', 'Correct. The gap is flagged, the account is shown to cover the days, and the part supported only by statement is referred for further examination (simulated). Nothing is refused on suspicion.')
    },
    assessment: {
      issue: ['GB02_DURATION_GAP'],
      distinguish: ['GB02_ITINERARY_SEPARATED', 'GB02_TOTAL_DAYS_ACCOUNTED'],
      resolve: { findings: ['GB02_TOTAL_DAYS_ACCOUNTED'], questions: ['gb02_remaining_days'], requests: [] },
      feedback: {
        issueHit: L('행사·체류 기간 분리 확인', 'Duration gap separated'), issueMiss: L('기간 차이 미대조', 'Duration gap unexamined'),
        resolveHit: L('관광 일정 해명 확인', 'Tourism itinerary confirmed'), resolveMiss: L('잔여 체류 조사 미완료', 'Remaining stay inquiry incomplete')
      }
    },
    debrief: L('설명되지 않은 체류 기간을 표시하고 추가 검토로 인계합니다. 의심만으로 불허하지 않습니다.', 'Flag the unexplained stay duration and refer for review. Do not refuse on suspicion alone.'),
    sources: ['GB-RULES', 'GB-VISIT', 'GB-ACT']
  },

  // ── SIM-GB-03 · legacy (completed task) ───────────────────────────────────
  {
    id: 'SIM-GB-03', countryId: 'GB', personId: 'SIM-GB-P03', name: 'Alex Finley',
    difficulty: 'intro', category: 'record',
    title: L('완료된 과업의 근거', 'Evidence for a completed task'),
    brief: L('이전 담당자가 완료한 과업의 접수 번호와 새로 제출된 자료 번호가 일치합니다.', 'The receipt number on the earlier task matches the newly submitted evidence.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('가족 방문', 'Visiting family') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-11-18 ~ 2026-11-25 (7박)', '18–25 November 2026 (7 nights)') },
      { label: L('제출 자료', 'Submitted'), value: L('숙박 확인서 (재제출)', 'Accommodation confirmation (resubmitted)') }
    ],
    opening: L('안녕하세요. 숙박 확인서 원본을 가져오라고 하셔서 다시 왔습니다.', 'Hello. I was asked to bring the original accommodation confirmation, so I have come back with it.'),
    documents: [
      { id: 'SIM-GB-03-DOC1', title: L('이전 과업 기록', 'Earlier task record'), pages: [L('이전 과업: 접수 번호 SIM-GB-R03 확인 완료', 'Earlier task: confirmed receipt SIM-GB-R03'), NOTICE] },
      { id: 'SIM-GB-03-DOC2', title: L('새 제출 자료', 'New submission'), pages: [L('새 제출 자료: 참조 번호 SIM-GB-R03', 'New submission: reference SIM-GB-R03')] },
      { id: 'SIM-GB-03-DOC3', title: L('재제출 문서 본문', 'Resubmitted document'), pages: [L('숙박 확인서 · 참조 SIM-GB-R03 · 발행일 02/11/2026 · 2026-11-18 ~ 2026-11-25 (7박) · 1쪽', 'Accommodation confirmation · ref SIM-GB-R03 · issued 02/11/2026 · 18–25 Nov 2026 (7 nights) · 1 page')] }
    ],
    records: [
      { id: 'SIM-GB-03-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('이전 과업: 접수 번호 SIM-GB-R03 확인 완료', 'Earlier task: confirmed receipt SIM-GB-R03'), documentId: 'SIM-GB-03-DOC1' },
      { id: 'SIM-GB-03-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('새 제출 자료: 참조 번호 SIM-GB-R03', 'New submission: reference SIM-GB-R03'), documentId: 'SIM-GB-03-DOC2' },
      { id: 'SIM-GB-03-REC3', title: L('접수 이력', 'Receipt history'), detail: L('접수 SIM-GB-R03: 숙박 확인서, 발행일 2026-11-02, 7박, 1쪽', 'Receipt SIM-GB-R03: accommodation confirmation, issued 2026-11-02, 7 nights, 1 page'), documentId: 'SIM-GB-03-DOC3' }
    ],
    facts: [
      { id: 'SIM-GB-03-F-EARLIER', sourceType: 'document', sourceId: 'SIM-GB-03-DOC1', page: 0, label: L('이전 과업: 접수 번호 SIM-GB-R03', 'Earlier task: receipt SIM-GB-R03') },
      { id: 'SIM-GB-03-F-NEW', sourceType: 'document', sourceId: 'SIM-GB-03-DOC2', page: 0, label: L('새 제출 자료: 참조 번호 SIM-GB-R03', 'New submission: reference SIM-GB-R03') },
      { id: 'SIM-GB-03-F-CONTENT', sourceType: 'document', sourceId: 'SIM-GB-03-DOC3', page: 0, label: L('재제출 문서: 발행일 02/11/2026 · 7박 · 1쪽', 'Resubmitted document: issued 02/11/2026 · 7 nights · 1 page') },
      { id: 'SIM-GB-03-F-RECEIPT', sourceType: 'record', sourceId: 'SIM-GB-03-REC3', label: L('접수 이력: 발행일 2026-11-02 · 7박 · 1쪽', 'Receipt history: issued 2026-11-02 · 7 nights · 1 page') },
      { id: 'SIM-GB-03-F-STMT', sourceType: 'statement', sourceId: 'SIM-GB-03-STMT', questionIds: ['clarify'], label: L('진술: 이전에 제출한 것과 같은 번호의 같은 서류', 'Statement: same document under the same reference as before') }
    ],
    questions: [
      { id: 'clarify', q: CLARIFY_Q, answer: L('이전에 제출했던 자료와 같은 번호의 서류를 다시 낸 것입니다.', 'It is the same document under the same reference as the earlier submission.') },
      { id: 'source', q: SOURCE_Q, answer: SOURCE_ANSWER },
      { id: 'crosscheck', q: L('오늘 내신 서류에는 어떤 참조번호가 적혀 있습니까?', 'Which reference is on the document you handed in today?'), answer: L('SIM-GB-R03입니다. 지난번 창구에서 받은 번호와 같습니다.', 'SIM-GB-R03, the same number the earlier desk gave me.') },
      { id: 'gb03_why_again', q: L('같은 서류를 다시 제출하신 이유는 무엇입니까?', 'Why have you submitted the same document again?'), answer: L('지난번에는 휴대전화 화면만 보여 드려서, 출력한 원본을 가져오라고 하셨습니다.', 'Last time I only showed it on my phone, so I was asked to bring a printed copy.') }
    ],
    comparisons: [
      { id: 'COMP-GB-03-REF', facts: ['SIM-GB-03-F-EARLIER', 'SIM-GB-03-F-NEW'], type: 'MATCH', findingId: 'GB03_REFERENCE_MATCH', title: L('참조번호 일치', 'Reference matches'), explanation: L('이전 과업과 새 제출 자료가 같은 번호 SIM-GB-R03을 가리킵니다.', 'The earlier task and the new submission carry the same reference, SIM-GB-R03.'), unlocks: { questions: ['gb03_why_again'] } },
      { id: 'COMP-GB-03-CONTENT', facts: ['SIM-GB-03-F-CONTENT', 'SIM-GB-03-F-RECEIPT'], type: 'MATCH', findingId: 'GB03_CONTENT_MATCHES_RECEIPT', title: L('문서 본문과 접수 이력 일치', 'Document matches the receipt history'), explanation: L('02/11/2026은 일·월 순서로 2026년 11월 2일입니다. 발행일, 7박, 1쪽이 접수 이력과 모두 같습니다.', '02/11/2026 is day-month order, so 2 November 2026. Issue date, 7 nights and page count all match the receipt history.') },
      { id: 'COMP-GB-03-STMT', facts: ['SIM-GB-03-F-STMT', 'SIM-GB-03-F-NEW'], type: 'MATCH', findingId: 'GB03_STATEMENT_FITS', title: L('진술과 제출 자료 부합', 'Statement fits the submission'), explanation: L('같은 서류를 다시 냈다는 진술이 새 제출 자료의 참조번호와 맞습니다.', 'The account of resubmitting the same document fits the reference on the new submission.') }
    ],
    requests: [],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('맞습니다. 참조번호뿐 아니라 문서 본문(발행일·박수·쪽수)까지 접수 이력과 일치합니다. 남은 사항이 없습니다. 연습상 검토 완료이며 실제 입국 허가가 아닙니다.', 'Correct. Not only the reference but the document itself (issue date, nights, pages) matches the receipt history. Nothing is outstanding. Completing the exercise does not grant entry.'),
      evidence: L('필요한 자료는 이미 접수돼 있고 이전 접수 내용과 같습니다. 같은 서류를 또 요청할 이유가 없습니다.', 'The needed document is on file and matches the earlier receipt. There is no reason to request it again.'),
      review: L('상충이 없습니다. 02/11/2026은 일·월 표기일 뿐 2월 11일이 아닙니다. 표기 방식을 상충으로 보면 불필요한 추가 검토가 됩니다.', 'There is no conflict. 02/11/2026 is day-month notation, not 11 February. Treating the date format as a conflict leads to an unnecessary referral.')
    },
    assessment: {
      issue: ['GB03_REFERENCE_MATCH'],
      distinguish: ['GB03_STATEMENT_FITS'],
      resolve: { findings: ['GB03_CONTENT_MATCHES_RECEIPT'], questions: ['clarify', 'gb03_why_again'], requests: [] },
      feedback: {
        issueHit: L('참조번호 일치 확인', 'Matching reference confirmed'), issueMiss: L('두 참조번호 미대조', 'References not compared'),
        resolveHit: L('문서 본문과 접수 이력 대조 완료', 'Document checked against the receipt history'), resolveMiss: L('번호만 보고 본문 미대조', 'Reference checked, document content not')
      }
    },
    debrief: L('새 문서와 진술을 대조해 같은 자료임을 확인했습니다. 추가 질문 없이 검토를 완료합니다.', 'Cross-checking confirmed the same evidence. Complete review without additional questioning.'),
    sources: ['GB-VISIT']
  },

  // ── SIM-GB-04 · booking reference typo (false positive, trap request) ──────
  {
    id: 'SIM-GB-04', countryId: 'GB', personId: 'SIM-GB-P04', name: 'Leilani Brooks',
    difficulty: 'intro', category: 'false-positive',
    title: L('한 글자 다른 예약 번호', 'One character out'),
    brief: L('히스로 도착 창구. 방문 정보 양식의 귀국 예약 번호가 출력한 확인서의 번호와 한 글자 다릅니다.', 'Heathrow arrivals desk. The return booking reference on the visit details form differs by one character from the printed confirmation.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('휴가', 'Holiday') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-11-20 ~ 2026-11-26 (6박)', '20–26 November 2026 (6 nights)') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 방문 정보 양식 · 귀국 일정 확인서', 'Passport · visit details form · return itinerary printout') }
    ],
    opening: L('안녕하세요. 일주일 정도 휴가로 왔습니다.', 'Hello. I am here on holiday for about a week.'),
    documents: [
      { id: 'SIM-GB-04-DOC1', title: L('여권 정보면 (합성)', 'Passport data page (synthetic)'), pages: [L('성명 LEILANI BROOKS · 여권 번호 SX5502917 · 생년월일 1994-05-14', 'Name LEILANI BROOKS · passport no. SX5502917 · date of birth 1994-05-14'), NOTICE] },
      { id: 'SIM-GB-04-DOC2', title: L('방문 정보 양식', 'Visit details form'), pages: [L('귀국 예약 번호: KT4B0Q · 귀국 2026-11-26 히스로 출발 · 숙소: 켄싱턴 호텔 6박', 'Return booking ref: KT4B0Q · return 2026-11-26 from Heathrow · stay: hotel in Kensington, 6 nights')] },
      { id: 'SIM-GB-04-DOC3', title: L('귀국 일정 확인서', 'Return itinerary printout'), pages: [L('승객 BROOKS/LEILANI · 예약 번호 KT4BOQ · 2026-11-26 21:05 히스로 출발 · 편명 XA 412', 'Passenger BROOKS/LEILANI · booking ref KT4BOQ · departs Heathrow 2026-11-26 21:05 · flight XA 412')] }
    ],
    records: [
      { id: 'SIM-GB-04-REC1', title: L('예약 기록 조회 (모의)', 'Booking record search (simulated)'), detail: L('「KT4B0Q」 조회: 결과 없음. 「KT4BOQ」 조회: BROOKS/LEILANI · 2026-11-26 21:05 히스로 출발 XA 412 · 여권 끝자리 2917.', 'Search "KT4B0Q": no result. Search "KT4BOQ": BROOKS/LEILANI · departs Heathrow 2026-11-26 21:05, XA 412 · passport ending 2917.'), documentId: 'SIM-GB-04-DOC2' }
    ],
    facts: [
      { id: 'SIM-GB-04-F-PASSPORT', sourceType: 'document', sourceId: 'SIM-GB-04-DOC1', page: 0, label: L('여권: LEILANI BROOKS · SX5502917', 'Passport: LEILANI BROOKS · SX5502917') },
      { id: 'SIM-GB-04-F-FORMREF', sourceType: 'document', sourceId: 'SIM-GB-04-DOC2', page: 0, label: L('양식: 예약 번호 KT4B0Q (다섯째 자리 숫자 0)', 'Form: booking ref KT4B0Q (fifth character is the digit 0)') },
      { id: 'SIM-GB-04-F-PRINTREF', sourceType: 'document', sourceId: 'SIM-GB-04-DOC3', page: 0, label: L('확인서: 예약 번호 KT4BOQ (다섯째 자리 문자 O) · 11-26 XA 412', 'Printout: booking ref KT4BOQ (fifth character is the letter O) · 26 Nov XA 412') },
      { id: 'SIM-GB-04-F-RECORD', sourceType: 'record', sourceId: 'SIM-GB-04-REC1', label: L('예약 기록: KT4BOQ · BROOKS/LEILANI · 11-26 XA 412 · 여권 끝자리 2917', 'Booking record: KT4BOQ · BROOKS/LEILANI · 26 Nov XA 412 · passport ending 2917') },
      { id: 'SIM-GB-04-F-STMT', sourceType: 'statement', sourceId: 'SIM-GB-04-STMT', questionIds: ['gb04_form_ref'], label: L('진술: 휴대전화 화면을 보고 양식에 손으로 옮겨 적었다', 'Statement: copied the reference onto the form by hand from her phone') }
    ],
    questions: [
      { id: 'gb04_purpose', q: L('방문 목적과 기간을 말씀해 주세요.', 'What brings you here, and for how long?'), answer: L('휴가입니다. 20일에 도착했고 26일 밤 비행기로 돌아갑니다.', 'A holiday. I arrived on the 20th and fly home on the night of the 26th.') },
      { id: 'gb04_return', q: L('귀국 일정을 확인할 수 있는 자료가 있습니까?', 'Do you have anything showing your return journey?'), answer: L('네, 출력한 확인서가 있습니다. 26일 21시 5분 히스로 출발입니다.', 'Yes, I have a printout. It leaves Heathrow at 21:05 on the 26th.') },
      { id: 'gb04_stay', q: L('어디에 머무십니까?', 'Where are you staying?'), answer: L('켄싱턴에 있는 호텔에 6박 예약했습니다.', 'I have six nights booked at a hotel in Kensington.') },
      { id: 'gb04_form_ref', q: L('양식의 예약 번호는 어떻게 적으셨습니까?', 'How did you fill in the booking reference on the form?'), answer: L('휴대전화 화면을 보고 손으로 옮겨 적었습니다. 영문 O를 숫자 0으로 썼을 수도 있겠네요.', 'I copied it by hand from my phone screen. I may have written the letter O as a zero.') }
    ],
    comparisons: [
      { id: 'COMP-GB-04-REF', facts: ['SIM-GB-04-F-FORMREF', 'SIM-GB-04-F-PRINTREF'], type: 'CONFLICT', findingId: 'GB04_REFERENCE_DIFFERS', title: L('예약 번호 한 글자 차이', 'References differ by one character'), explanation: L('양식은 KT4B0Q(숫자 0), 확인서는 KT4BOQ(문자 O)입니다. 나머지 다섯 글자는 같습니다.', 'The form has KT4B0Q (digit 0); the printout has KT4BOQ (letter O). The other five characters are identical.'), unlocks: { questions: ['gb04_form_ref'], requests: ['SIM-GB-04-REQ-AIRLINE'] } },
      { id: 'COMP-GB-04-RECORD', facts: ['SIM-GB-04-F-PRINTREF', 'SIM-GB-04-F-RECORD'], type: 'MATCH', findingId: 'GB04_PRINTOUT_MATCHES_RECORD', title: L('확인서와 예약 기록 일치', 'Printout matches the booking record'), explanation: L('예약 번호, 날짜, 시각, 편명이 예약 기록과 모두 같습니다.', 'Reference, date, time and flight number all match the booking record.') },
      { id: 'COMP-GB-04-IDENT', facts: ['SIM-GB-04-F-RECORD', 'SIM-GB-04-F-PASSPORT'], type: 'MATCH', findingId: 'GB04_BOOKING_BELONGS_TO_TRAVELLER', title: L('예약 기록의 승객이 본인', 'Booking belongs to the traveller'), explanation: L('예약 기록의 성명과 여권 끝자리 2917이 여권과 같습니다.', 'The name and passport digits 2917 on the booking record match the passport.') },
      { id: 'COMP-GB-04-STMT', facts: ['SIM-GB-04-F-STMT', 'SIM-GB-04-F-FORMREF'], type: 'MATCH', findingId: 'GB04_TRANSCRIPTION_EXPLAINED', title: L('옮겨 적기 오류 설명', 'Transcription slip explained'), explanation: L('손으로 옮겨 적었다는 설명은 O와 0 한 글자만 다른 양식의 오류와 맞습니다.', 'Copying by hand fits a form that differs only by O versus 0.') }
    ],
    requests: [
      { id: 'SIM-GB-04-REQ-AIRLINE', title: L('항공사 예약 확인서 별도 요청', 'Request a separate airline booking confirmation'), result: L('항공사 확인서에도 KT4BOQ가 적혀 있습니다. 예약 기록이 이미 보여 준 내용 외에 더해지는 것은 없습니다.', 'The airline confirmation also shows KT4BOQ. It adds nothing the booking record had not already shown.') }
    ],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('맞습니다. 확인서와 예약 기록이 같은 번호이고, 기록의 성명·편명·여권 끝자리가 본인과 맞습니다. 양식은 O 대신 0을 쓴 옮겨 적기 오류이며 다른 예약이 아닙니다.', 'Correct. The printout and the booking record carry the same reference, and the record\'s name, flight and passport digits match the traveller. The form shows 0 for O, a transcription slip, not a different booking.'),
      evidence: L('예약 기록이 이미 귀국 일정을 확인해 줍니다. 항공사 확인서를 또 요청하면 있는 내용을 반복할 뿐입니다.', 'The booking record already confirms the return journey. Requesting another airline confirmation only repeats what is on file.'),
      review: L('한 글자 오기는 설명됐고 모든 원본 자료가 같은 예약을 가리킵니다. 미해결 상충이 아니며, 넘기면 오타를 의심으로 다루는 셈입니다.', 'A one-character slip is explained and every primary source points to the same booking. It is not an unresolved conflict; referring it treats a typo as suspicion.')
    },
    assessment: {
      issue: ['GB04_REFERENCE_DIFFERS'],
      distinguish: ['GB04_TRANSCRIPTION_EXPLAINED'],
      resolve: { findings: ['GB04_PRINTOUT_MATCHES_RECORD', 'GB04_BOOKING_BELONGS_TO_TRAVELLER'], questions: ['gb04_form_ref', 'gb04_return'], requests: [] },
      feedback: {
        issueHit: L('예약 번호 한 글자 차이 확인', 'One-character difference spotted'), issueMiss: L('양식과 확인서 번호 미대조', 'Form and printout references not compared'),
        resolveHit: L('예약 기록으로 같은 예약임을 확인', 'Booking record confirms the same booking'), resolveMiss: L('예약 기록·여권 대조 미완료', 'Booking record or passport comparison incomplete')
      }
    },
    debrief: L('한 글자 차이는 원본 자료로 확인합니다. 확인서·예약 기록·여권이 모두 같은 예약과 같은 사람을 가리키므로 양식의 오기를 기록하고 검토를 완료합니다.', 'Check a one-character difference against the primary sources. The printout, booking record and passport all point to the same booking and person, so note the form slip and complete the review.'),
    sources: ['GB-VISIT', 'GB-RULES']
  },

  // ── SIM-GB-05 · speaker payment terms (conflict between documents) ─────────
  {
    id: 'SIM-GB-05', countryId: 'GB', personId: 'SIM-GB-P05', name: 'Tobias Achterberg',
    difficulty: 'standard', category: 'purpose',
    title: L('무보수 발표와 사례금', 'Unpaid talk or honorarium'),
    brief: L('맨체스터 도착 창구. 초청장은 무보수 발표로 적혀 있지만 행사 프로그램과 주최 측 이메일은 다른 조건을 보여 줍니다.', 'Manchester arrivals desk. The invitation describes an unpaid talk, but the programme and an organiser email show different terms.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('포럼 발표', 'Speaking at a forum') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-11-24 ~ 2026-11-27', '24–27 November 2026') },
      { label: L('제출 자료', 'Submitted'), value: L('초청장 · 행사 프로그램 · 주최 측 이메일 사본', 'Invitation · programme · copy of organiser email') }
    ],
    opening: L('안녕하세요. 포럼에서 발표하러 왔습니다.', 'Hello. I am here to speak at a forum.'),
    documents: [
      { id: 'SIM-GB-05-DOC1', title: L('초청장', 'Invitation letter'), pages: [L('Northern Urban Water Forum (가상) · Tobias Achterberg 귀하 · 2026-11-25 패널 발표 · 발표자 보수 없음, 교통비는 영수증으로 정산 · 2026-09-14 발행', 'Northern Urban Water Forum (fictional) · to Tobias Achterberg · panel talk 2026-11-25 · speakers are unpaid; travel reimbursed against receipts · dated 2026-09-14'), NOTICE] },
      { id: 'SIM-GB-05-DOC2', title: L('행사 프로그램', 'Forum programme'), pages: [L('2026-11-26 09:30 기조연설 T. Achterberg · 「기조연설자에게는 사례금 £750이 지급됩니다」', '26 Nov 2026 09:30 keynote, T. Achterberg · "Keynote speakers receive an honorarium of £750"')] },
      { id: 'SIM-GB-05-DOC3', title: L('주최 측 이메일 사본', 'Organiser email (printed)'), pages: [L('2026-10-12 주최 측 이메일: 「강연료와 사례금 지급을 위해 계좌 정보를 보내 주세요.」', 'Organiser email, 12 Oct 2026: "Please send your bank details for the speaker fee and honorarium."')] }
    ],
    records: [
      { id: 'SIM-GB-05-REC1', title: L('여행 예약 기록', 'Travel booking record'), detail: L('도착 2026-11-24 맨체스터 · 출발 2026-11-27 맨체스터 · 2026-09-18 예약', 'Arrives Manchester 2026-11-24 · departs Manchester 2026-11-27 · booked 2026-09-18'), documentId: 'SIM-GB-05-DOC1' }
    ],
    facts: [
      { id: 'SIM-GB-05-F-INVITE', sourceType: 'document', sourceId: 'SIM-GB-05-DOC1', page: 0, label: L('초청장: 11-25 패널 발표, 무보수, 교통비만 정산', 'Invitation: panel talk 25 Nov, unpaid, travel costs only') },
      { id: 'SIM-GB-05-F-PROGRAMME', sourceType: 'document', sourceId: 'SIM-GB-05-DOC2', page: 0, label: L('프로그램: 11-26 기조연설, 사례금 £750', 'Programme: keynote 26 Nov, honorarium £750') },
      { id: 'SIM-GB-05-F-EMAIL', sourceType: 'document', sourceId: 'SIM-GB-05-DOC3', page: 0, label: L('주최 측 이메일: 강연료·사례금 지급용 계좌 요청', 'Organiser email: asks for bank details for a fee and honorarium') },
      { id: 'SIM-GB-05-F-BOOKING', sourceType: 'record', sourceId: 'SIM-GB-05-REC1', label: L('예약 기록: 11-24 도착, 11-27 출발', 'Booking record: arrives 24 Nov, departs 27 Nov') },
      { id: 'SIM-GB-05-F-UNPAID', sourceType: 'statement', sourceId: 'SIM-GB-05-STMT', questionIds: ['gb05_payment'], label: L('진술: 무보수 발표이며 교통비만 영수증으로 정산받는다', 'Statement: unpaid talk, only travel costs reimbursed against receipts') },
      { id: 'SIM-GB-05-F-CHANGE', sourceType: 'statement', sourceId: 'SIM-GB-05-STMT-CHANGE', questionIds: ['gb05_programme'], label: L('진술: 10월에 기조연설로 바뀌었고 사례금 이야기를 들었지만 금액은 정하지 않았다', 'Statement: moved to the keynote in October; told of an honorarium, amount not agreed') }
    ],
    questions: [
      { id: 'gb05_purpose', q: L('방문 목적을 말씀해 주세요.', 'What is the purpose of your visit?'), answer: L('Northern Urban Water Forum에서 발표합니다. 행사는 25일과 26일 이틀입니다.', 'I am speaking at the Northern Urban Water Forum. It runs on the 25th and 26th.') },
      { id: 'gb05_stay', q: L('얼마나 머무십니까?', 'How long are you staying?'), answer: L('24일에 도착해서 27일에 떠납니다.', 'I arrived on the 24th and leave on the 27th.') },
      { id: 'gb05_payment', q: L('발표에 대해 보수를 받으십니까?', 'Are you being paid for the talk?'), answer: L('아니요, 무보수 발표입니다. 기차표 같은 교통비만 영수증으로 정산받습니다.', 'No, it is an unpaid talk. Only travel costs like train tickets are reimbursed against receipts.') },
      { id: 'gb05_programme', q: L('프로그램에는 26일 기조연설이 적혀 있습니다. 주최 측과 어떻게 정하셨습니까?', 'The programme lists you for the keynote on the 26th. What did you agree with the organiser?'), answer: L('처음엔 25일 패널이었는데 10월에 기조연설로 바뀌었습니다. 사례금 이야기는 들었지만 금액은 아직 정하지 않았습니다.', 'I was first on a panel on the 25th, then in October they moved me to the keynote. I was told of an honorarium, but no amount has been agreed.') },
      { id: 'gb05_email', q: L('주최 측 이메일은 강연료 지급용 계좌를 요청합니다. 회신하셨습니까?', 'The organiser email asks for bank details for a speaker fee. Did you reply?'), answer: L('아직 회신하지 않았습니다. 강연료가 무엇을 뜻하는지 먼저 물어보려고 했습니다.', 'Not yet. I meant to ask them first what the fee refers to.') }
    ],
    comparisons: [
      { id: 'COMP-GB-05-TERMS', facts: ['SIM-GB-05-F-INVITE', 'SIM-GB-05-F-PROGRAMME'], type: 'CONFLICT', findingId: 'GB05_ROLE_AND_TERMS_DIFFER', title: L('역할·보수 조건 불일치', 'Role and terms differ'), explanation: L('초청장은 25일 무보수 패널, 프로그램은 26일 사례금 지급 기조연설입니다. 두 문서가 역할과 날짜와 보수에서 다릅니다.', 'The invitation says an unpaid panel on the 25th; the programme says a paid keynote on the 26th. Role, date and payment all differ.'), unlocks: { questions: ['gb05_programme'] } },
      { id: 'COMP-GB-05-ACCOUNT', facts: ['SIM-GB-05-F-EMAIL', 'SIM-GB-05-F-UNPAID'], type: 'CONFLICT', findingId: 'GB05_PAYMENT_ACCOUNT_DIFFERS', title: L('이메일과 무보수 진술 불일치', 'Email conflicts with "unpaid"'), explanation: L('주최 측은 강연료와 사례금 지급을 위한 계좌를 요청했지만, 진술은 교통비 정산만 받는다고 합니다.', 'The organiser asks for bank details for a fee and honorarium; the statement says only travel costs are reimbursed.'), unlocks: { questions: ['gb05_email'] } },
      { id: 'COMP-GB-05-DATES', facts: ['SIM-GB-05-F-BOOKING', 'SIM-GB-05-F-PROGRAMME'], type: 'MATCH', findingId: 'GB05_DATES_COVERED', title: L('예약이 행사 날짜를 포함', 'Booking covers the forum dates'), explanation: L('24일 도착, 27일 출발은 25일과 26일 행사를 모두 포함합니다. 날짜는 문제가 아닙니다.', 'Arriving on the 24th and leaving on the 27th covers both forum days. The dates are not the issue.') },
      { id: 'COMP-GB-05-CHANGE', facts: ['SIM-GB-05-F-CHANGE', 'SIM-GB-05-F-PROGRAMME'], type: 'MATCH', findingId: 'GB05_ROLE_CHANGE_EXPLAINED', title: L('역할 변경 설명 부합', 'Role change explained'), explanation: L('10월에 기조연설로 바뀌었다는 설명은 프로그램 내용과 맞고, 9월에 발행된 초청장이 바뀐 역할을 반영하지 못한 이유가 됩니다.', 'A move to the keynote in October fits the programme and explains why the September invitation shows the old role.') },
      { id: 'COMP-GB-05-STATEMENTS', facts: ['SIM-GB-05-F-CHANGE', 'SIM-GB-05-F-UNPAID'], type: 'CONFLICT', findingId: 'GB05_STATEMENTS_DIFFER', title: L('보수에 관한 두 진술 불일치', 'Two answers about payment differ'), explanation: L('처음에는 무보수라고 했고, 이후에는 사례금 이야기를 들었다고 했습니다. 보수 조건은 문서로도 진술로도 정리되지 않았습니다.', 'First the talk is unpaid; later an honorarium was mentioned. The payment terms are settled neither by the documents nor by the answers.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('역할 변경은 설명됐지만, 보수를 받는지에 대해 문서들과 본인의 답이 여전히 엇갈립니다. 닫으면 근거가 뒷받침하지 않는 답을 기록하게 됩니다.', 'The role change is explained, but the documents and his own answers still disagree about whether he will be paid. Closing would record an answer the evidence does not support.'),
      evidence: L('관련 문서는 이미 모두 있고, 서로 맞지 않습니다. 지금 새로 받는 주최 측 서신으로는 어느 조건이 적용되는지 정리되지 않습니다. 누락이 아니라 상충입니다.', 'Every relevant document is already here, and they disagree. A fresh organiser letter obtained now would not settle which terms apply. This is a conflict, not a gap.'),
      review: L('맞습니다. 초청장·프로그램·이메일·진술 사이의 보수 조건 상충을 출처별로 기록하고 추가 검토(모의)로 넘깁니다. 이 연습은 어떤 활동이 허용되는지 판단하지 않습니다.', 'Correct. Record the conflicting payment terms by source, invitation, programme, email and answers, and refer for further examination (simulated). This exercise does not decide whether any activity is permitted.')
    },
    assessment: {
      issue: ['GB05_ROLE_AND_TERMS_DIFFER', 'GB05_PAYMENT_ACCOUNT_DIFFERS'],
      distinguish: ['GB05_DATES_COVERED', 'GB05_ROLE_CHANGE_EXPLAINED'],
      resolve: { findings: ['GB05_STATEMENTS_DIFFER'], questions: ['gb05_programme', 'gb05_email'], requests: [] },
      feedback: {
        issueHit: L('문서 간 보수 조건 상충 확인', 'Conflicting payment terms identified'), issueMiss: L('초청장과 프로그램·이메일 미대조', 'Invitation not compared with programme or email'),
        resolveHit: L('진술끼리도 엇갈림을 확인', 'Answers shown to conflict as well'), resolveMiss: L('후속 진술 대조 미완료', 'Follow-up answers not compared')
      }
    },
    debrief: L('날짜와 역할 변경은 설명되지만 보수 조건은 문서와 진술 모두에서 엇갈립니다. 허용 여부를 판단하지 말고, 출처별 상충을 기록해 추가 검토로 넘깁니다.', 'The dates and the role change are explained, but the payment terms conflict across documents and answers. Do not judge permissibility; record each conflicting source and refer for further review.'),
    sources: ['GB-RULES', 'GB-VISIT']
  },

  // ── SIM-GB-06 · travel authorisation record mismatch ────────────────────
  {
    id: 'SIM-GB-06', countryId: 'GB', personId: 'SIM-GB-P06', name: 'Priya Castellane',
    difficulty: 'standard', category: 'requirements',
    title: L('여행 허가 기록의 여권 번호', 'Passport number on the authorisation record'),
    brief: L('히스로 도착 창구. 여행 허가 기록(모의)은 확인서 참조로는 조회되지만 여권 번호로는 조회되지 않습니다.', 'Heathrow arrivals desk. The travel authorisation record (simulated) is found by its reference, but not by the passport number.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친구 방문', 'Visiting a friend') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-12-03 ~ 2026-12-17', '3–17 December 2026') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 여행 허가 확인서 (모의) · 방문 계획', 'Passport · travel authorisation confirmation (simulated) · visit plan') }
    ],
    opening: L('안녕하세요. 리즈에 사는 친구를 만나러 왔습니다.', 'Hello. I am visiting a friend who lives in Leeds.'),
    documents: [
      { id: 'SIM-GB-06-DOC1', title: L('여권 정보면 (합성)', 'Passport data page (synthetic)'), pages: [L('성명 PRIYA CASTELLANE · 여권 번호 PC71480362 · 생년월일 1988-09-30 · 발급 2024-02-19', 'Name PRIYA CASTELLANE · passport no. PC71480362 · date of birth 1988-09-30 · issued 2024-02-19'), NOTICE] },
      { id: 'SIM-GB-06-DOC2', title: L('여행 허가 확인서 (모의)', 'Travel authorisation confirmation (simulated)'), pages: [L('참조 SIM-GB-TA-0662 · 성명 PRIYA CASTELLANE · 생년월일 30/09/1988 · 여권 번호 PC71840362', 'Reference SIM-GB-TA-0662 · name PRIYA CASTELLANE · date of birth 30/09/1988 · passport no. PC71840362')] },
      { id: 'SIM-GB-06-DOC3', title: L('방문 계획', 'Visit plan'), pages: [L('리즈의 친구 집 방문 2026-12-03 ~ 2026-12-17 · 귀국 항공권 2026-12-17', 'Staying with a friend in Leeds 2026-12-03 to 2026-12-17 · return ticket 2026-12-17')] }
    ],
    records: [
      { id: 'SIM-GB-06-REC1', title: L('여행 허가 기록 (모의) · 참조 조회', 'Travel authorisation record (simulated) · by reference'), detail: L('참조 SIM-GB-TA-0662 조회: PRIYA CASTELLANE · 생년월일 1988-09-30 · 여권 번호 PC71840362.', 'Search by reference SIM-GB-TA-0662: PRIYA CASTELLANE · date of birth 1988-09-30 · passport no. PC71840362.'), documentId: 'SIM-GB-06-DOC2' },
      { id: 'SIM-GB-06-REC2', title: L('여행 허가 기록 (모의) · 여권 번호 조회', 'Travel authorisation record (simulated) · by passport'), detail: L('여권 번호 PC71480362 조회: 기록 없음.', 'Search by passport no. PC71480362: no record returned.'), documentId: 'SIM-GB-06-DOC1' }
    ],
    facts: [
      { id: 'SIM-GB-06-F-PASSPORT', sourceType: 'document', sourceId: 'SIM-GB-06-DOC1', page: 0, label: L('여권 번호 PC71480362', 'Passport no. PC71480362') },
      { id: 'SIM-GB-06-F-IDENT', sourceType: 'document', sourceId: 'SIM-GB-06-DOC1', page: 0, label: L('여권: PRIYA CASTELLANE · 생년월일 1988-09-30', 'Passport: PRIYA CASTELLANE · born 1988-09-30') },
      { id: 'SIM-GB-06-F-CONFIRM', sourceType: 'document', sourceId: 'SIM-GB-06-DOC2', page: 0, label: L('확인서: 여권 번호 PC71840362', 'Confirmation: passport no. PC71840362') },
      { id: 'SIM-GB-06-F-RECORD', sourceType: 'record', sourceId: 'SIM-GB-06-REC1', label: L('허가 기록: 성명·생년월일 같음, 여권 번호 PC71840362', 'Authorisation record: same name and date of birth, passport no. PC71840362') },
      { id: 'SIM-GB-06-F-NORECORD', sourceType: 'record', sourceId: 'SIM-GB-06-REC2', label: L('여권 번호로 조회 시 허가 기록 없음', 'No authorisation record found for the passport number') },
      { id: 'SIM-GB-06-F-STMT', sourceType: 'statement', sourceId: 'SIM-GB-06-STMT', questionIds: ['gb06_entry'], label: L('진술: 신청 때 여권을 보며 직접 입력했고 숫자를 바꿔 적었을 수 있다', 'Statement: typed the number in herself and may have swapped digits') }
    ],
    questions: [
      { id: 'gb06_purpose', q: L('방문 목적과 기간을 말씀해 주세요.', 'What is the purpose and length of your visit?'), answer: L('리즈에 사는 친구 집에 2주 머뭅니다. 17일에 돌아갑니다.', 'I am staying with a friend in Leeds for two weeks. I fly back on the 17th.') },
      { id: 'gb06_authorisation', q: L('여행 허가는 어떻게 신청하셨습니까?', 'How did you apply for your travel authorisation?'), answer: L('지난달 휴대전화로 신청했고, 받은 확인서를 출력해 왔습니다.', 'I applied on my phone last month and printed the confirmation I received.') },
      { id: 'gb06_passport', q: L('이 여권은 언제 발급받으셨습니까? 다른 여권이 있습니까?', 'When was this passport issued? Do you hold any other?'), answer: L('2024년 2월에 발급받았습니다. 다른 여권은 없습니다.', 'It was issued in February 2024. I do not have any other passport.') },
      { id: 'gb06_entry', q: L('신청할 때 여권 번호를 어떻게 입력하셨습니까?', 'How did you enter your passport number when you applied?'), answer: L('여권을 보면서 직접 입력했습니다. 숫자를 바꿔 적었을 수도 있겠네요.', 'I typed it in myself while looking at the passport. I may have swapped some digits.') }
    ],
    comparisons: [
      { id: 'COMP-GB-06-NUMBER', facts: ['SIM-GB-06-F-PASSPORT', 'SIM-GB-06-F-RECORD'], type: 'CONFLICT', findingId: 'GB06_PASSPORT_NUMBER_DIFFERS', title: L('여권 번호 두 자리 뒤바뀜', 'Two digits transposed'), explanation: L('여권은 PC71480362, 허가 기록은 PC71840362입니다. 넷째·다섯째 자리(4·8)가 뒤바뀌어 있습니다.', 'The passport reads PC71480362; the record reads PC71840362. The fourth and fifth digits (4 and 8) are swapped.'), unlocks: { questions: ['gb06_entry'] } },
      { id: 'COMP-GB-06-NORECORD', facts: ['SIM-GB-06-F-NORECORD', 'SIM-GB-06-F-PASSPORT'], type: 'MISSING', findingId: 'GB06_NO_RECORD_FOR_PASSPORT', title: L('제시한 여권으로는 기록 없음', 'No record for the passport presented'), explanation: L('제시한 여권 번호로 조회하면 허가 기록이 나오지 않습니다.', 'Searching by the passport presented returns no authorisation record.') },
      { id: 'COMP-GB-06-IDENT', facts: ['SIM-GB-06-F-IDENT', 'SIM-GB-06-F-RECORD'], type: 'MATCH', findingId: 'GB06_NAME_DOB_MATCH', title: L('성명·생년월일 일치', 'Name and date of birth match'), explanation: L('기록의 성명과 생년월일은 여권과 같습니다. 같은 사람의 신청으로 보이지만 번호 불일치는 남습니다.', 'The record\'s name and date of birth match the passport. It looks like her application, but the number mismatch remains.') },
      { id: 'COMP-GB-06-CONFIRM', facts: ['SIM-GB-06-F-CONFIRM', 'SIM-GB-06-F-RECORD'], type: 'MATCH', findingId: 'GB06_CONFIRMATION_MATCHES_RECORD', title: L('확인서와 기록 일치', 'Confirmation matches the record'), explanation: L('확인서에도 같은 번호 PC71840362가 있습니다. 화면 표시 오류가 아니라 기록에 입력된 번호 자체가 다릅니다.', 'The printed confirmation shows the same PC71840362. The difference is in the number on the record, not a display fault.') },
      { id: 'COMP-GB-06-STMT', facts: ['SIM-GB-06-F-STMT', 'SIM-GB-06-F-CONFIRM'], type: 'UNVERIFIED', findingId: 'GB06_STATEMENT_DOES_NOT_AMEND', title: L('진술로 기록이 정정되지 않음', 'Statement does not amend the record'), explanation: L('입력 실수라는 설명은 그럴듯하지만, 진술만으로 기록의 번호가 바뀌지는 않습니다.', 'A typing slip is a plausible account, but a statement does not change the number on the record.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('성명과 생년월일은 맞지만 기록의 여권 번호가 다르고, 제시한 여권으로는 기록이 나오지 않습니다. 진술로는 기록이 정정되지 않습니다.', 'Name and date of birth match, but the record carries a different passport number and nothing is found for the passport presented. A statement does not amend the record.'),
      evidence: L('여행자가 가진 자료로는 기록 내용을 바꿀 수 없습니다. 그녀의 확인서도 같은 번호를 반복합니다. 빠진 자료가 아니라 기록 자체의 불일치입니다.', 'Nothing the traveller holds can change what the record says; her confirmation repeats the same number. The issue is the record itself, not a missing document.'),
      review: L('맞습니다. 두 번호를 그대로 보존하고 기록 불일치를 추가 검토(모의)로 넘깁니다. 이 연습은 여행 허가의 유효성이나 효력을 판단하지 않습니다.', 'Correct. Preserve both numbers and refer the record mismatch for further examination (simulated). This exercise does not decide whether any authorisation is valid or what it allows.')
    },
    assessment: {
      issue: ['GB06_PASSPORT_NUMBER_DIFFERS', 'GB06_NO_RECORD_FOR_PASSPORT'],
      distinguish: ['GB06_NAME_DOB_MATCH', 'GB06_CONFIRMATION_MATCHES_RECORD'],
      resolve: { findings: ['GB06_STATEMENT_DOES_NOT_AMEND'], questions: ['gb06_entry'], requests: [] },
      feedback: {
        issueHit: L('여권 번호 뒤바뀜 확인', 'Transposed digits identified'), issueMiss: L('여권과 허가 기록 번호 미대조', 'Passport and record numbers not compared'),
        resolveHit: L('진술이 기록을 정정하지 않음을 확인', 'Statement shown not to amend the record'), resolveMiss: L('입력 경위 확인 또는 대조 미완료', 'Entry account not asked or compared')
      }
    },
    debrief: L('성명과 생년월일이 같아도 기록의 여권 번호가 다르면 같은 기록으로 처리하지 않습니다. 두 번호와 설명을 기록하고 추가 검토로 넘깁니다.', 'Matching name and date of birth do not make a record with a different passport number the same record. Record both numbers and the account, and refer for further review.'),
    sources: ['GB-ETA', 'GB-VISIT']
  },

  // ── SIM-GB-07 · host letter vs host address on file ────────────────────────
  {
    id: 'SIM-GB-07', countryId: 'GB', personId: 'SIM-GB-P07', name: 'Kwame Holloway',
    difficulty: 'standard', category: 'accommodation',
    title: L('초청인의 새 주소', 'The host\'s new address'),
    brief: L('히스로 도착 창구. 초청인 서신의 주소가 이전 방문 때 기록된 초청인 주소와 다릅니다.', 'Heathrow arrivals desk. The address in the host letter differs from the host address recorded on the previous visit.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('가족 친구 방문', 'Visiting a family friend') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-11-28 ~ 2026-12-12', '28 November – 12 December 2026') },
      { label: L('제출 자료', 'Submitted'), value: L('초청인 서신 · 방문 정보 양식 · 귀국 항공권', 'Host letter · visit details form · return ticket') }
    ],
    opening: L('안녕하세요. 브리스틀에 사는 가족 친구 댁에 2주 머물러 왔습니다.', 'Hello. I am here to stay two weeks with a family friend in Bristol.'),
    documents: [
      { id: 'SIM-GB-07-DOC1', title: L('초청인 서신', 'Host letter'), pages: [L('Ruth Penhaligon 작성: 「Kwame Holloway가 2026-11-28부터 12-12까지 Flat 3, 14 Albion Road, Bristol의 제 집에 머뭅니다.」 · 2026-10-30 작성', 'From Ruth Penhaligon: "Kwame Holloway will stay with me at Flat 3, 14 Albion Road, Bristol, from 28 Nov to 12 Dec 2026." · dated 30 Oct 2026'), NOTICE] },
      { id: 'SIM-GB-07-DOC2', title: L('방문 정보 양식', 'Visit details form'), pages: [L('영국 내 주소: Flat 3, 14 Albion Road, Bristol · 체류 2026-11-28 ~ 2026-12-12', 'UK address: Flat 3, 14 Albion Road, Bristol · stay 28 Nov – 12 Dec 2026')] },
      { id: 'SIM-GB-07-DOC3', title: L('귀국 항공권', 'Return ticket'), pages: [L('2026-12-12 15:40 히스로 출발 · 2026-10-02 예약', 'Departs Heathrow 2026-12-12 15:40 · booked 2026-10-02')] }
    ],
    records: [
      { id: 'SIM-GB-07-REC1', title: L('이전 방문 기록', 'Previous visit record'), detail: L('2025-03 방문 · 초청인 Ruth Penhaligon · 초청인 주소 7 Kestrel Close, Bath · 예정대로 출국', 'Visit March 2025 · host Ruth Penhaligon · host address 7 Kestrel Close, Bath · departed as booked'), documentId: 'SIM-GB-07-DOC1' }
    ],
    facts: [
      { id: 'SIM-GB-07-F-LETTER', sourceType: 'document', sourceId: 'SIM-GB-07-DOC1', page: 0, label: L('초청인 서신: 14 Albion Road, Bristol에 숙박', 'Host letter: staying at 14 Albion Road, Bristol') },
      { id: 'SIM-GB-07-F-DATES', sourceType: 'document', sourceId: 'SIM-GB-07-DOC1', page: 0, label: L('초청인 서신: 11-28 ~ 12-12', 'Host letter: 28 Nov – 12 Dec') },
      { id: 'SIM-GB-07-F-FORM', sourceType: 'document', sourceId: 'SIM-GB-07-DOC2', page: 0, label: L('양식 주소: 14 Albion Road, Bristol', 'Form address: 14 Albion Road, Bristol') },
      { id: 'SIM-GB-07-F-TICKET', sourceType: 'document', sourceId: 'SIM-GB-07-DOC3', page: 0, label: L('귀국: 2026-12-12 히스로 출발', 'Return: departs Heathrow 2026-12-12') },
      { id: 'SIM-GB-07-F-PREV', sourceType: 'record', sourceId: 'SIM-GB-07-REC1', label: L('이전 방문 기록: 초청인 주소 7 Kestrel Close, Bath (2025-03)', 'Previous visit: host address 7 Kestrel Close, Bath (March 2025)') },
      { id: 'SIM-GB-07-F-MOVE', sourceType: 'statement', sourceId: 'SIM-GB-07-STMT', questionIds: ['gb07_address'], label: L('진술: 초청인이 2026년 8월 바스에서 브리스틀로 이사했다', 'Statement: the host moved from Bath to Bristol in August 2026') }
    ],
    questions: [
      { id: 'gb07_purpose', q: L('누구를 방문하십니까?', 'Who are you visiting?'), answer: L('어머니의 오랜 친구인 루스 펜할리건 씨입니다. 그분 댁에 머뭅니다.', 'Ruth Penhaligon, an old friend of my mother\'s. I am staying at her home.') },
      { id: 'gb07_stay', q: L('얼마나 머무십니까?', 'How long are you staying?'), answer: L('11월 28일부터 12월 12일까지 2주입니다.', 'Two weeks, from 28 November to 12 December.') },
      { id: 'gb07_previous', q: L('이전에 영국에 오신 적이 있습니까?', 'Have you visited before?'), answer: L('작년 3월에 같은 분을 뵈러 왔습니다.', 'Yes, I visited the same friend in March last year.') },
      { id: 'gb07_address', q: L('초청인 주소가 이전 방문 때와 다릅니다. 어떻게 된 일입니까?', 'Your host\'s address is different from your last visit. Can you explain?'), answer: L('루스 씨가 올해 8월에 바스에서 브리스틀로 이사했습니다. 새집은 저도 처음 가 봅니다.', 'Ruth moved from Bath to Bristol in August this year. It is my first time at the new place.') }
    ],
    comparisons: [
      { id: 'COMP-GB-07-ADDRESS', facts: ['SIM-GB-07-F-LETTER', 'SIM-GB-07-F-PREV'], type: 'CONFLICT', findingId: 'GB07_HOST_ADDRESS_DIFFERS', title: L('초청인 주소 불일치', 'Host address differs'), explanation: L('서신은 브리스틀 주소, 이전 방문 기록은 바스 주소입니다. 초청인은 같은 사람입니다.', 'The letter gives a Bristol address; the previous visit record gives Bath. The host is the same person.'), unlocks: { questions: ['gb07_address'] } },
      { id: 'COMP-GB-07-FORM', facts: ['SIM-GB-07-F-LETTER', 'SIM-GB-07-F-FORM'], type: 'MATCH', findingId: 'GB07_FORM_MATCHES_LETTER', title: L('양식과 서신 주소 일치', 'Form matches the letter'), explanation: L('양식의 주소는 서신의 주소와 같습니다.', 'The address on the form is the same as in the letter.') },
      { id: 'COMP-GB-07-DATES', facts: ['SIM-GB-07-F-DATES', 'SIM-GB-07-F-TICKET'], type: 'MATCH', findingId: 'GB07_DATES_FIT_TICKET', title: L('서신 기간과 귀국편 부합', 'Letter dates fit the ticket'), explanation: L('서신의 마지막 날 12월 12일에 귀국편이 출발합니다.', 'The return flight leaves on 12 December, the last day in the letter.') },
      { id: 'COMP-GB-07-MOVE', facts: ['SIM-GB-07-F-MOVE', 'SIM-GB-07-F-PREV'], type: 'UNVERIFIED', findingId: 'GB07_MOVE_UNCONFIRMED', title: L('이사 설명 미확인', 'House move not yet shown'), explanation: L('이사는 흔한 설명이고 기록의 옛 주소와도 맞지만, 초청인이 지금 브리스틀 주소에 산다는 자료는 아직 없습니다.', 'A move is an ordinary explanation and fits the old address on file, but nothing yet shows the host now lives at the Bristol address.'), unlocks: { requests: ['SIM-GB-07-REQ-HOSTADDR'] } }
    ],
    requests: [
      { id: 'SIM-GB-07-REQ-HOSTADDR', title: L('초청인의 현 주소 확인 자료 요청 (임대 계약서 등)', 'Request evidence of the host\'s current address (e.g. tenancy agreement)'), result: L('요청 기록됨. 초청인이 14 Albion Road 임대 계약서를 이메일로 보내기로 했으며, 아직 접수되지 않았습니다.', 'Request recorded. The host will email the tenancy agreement for 14 Albion Road; it has not yet been received.') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('새 주소는 서신과 양식에서 일관되지만, 이사를 뒷받침하는 것은 진술뿐이고 기록에는 여전히 옛 주소가 있습니다.', 'The new address is consistent across the letter and form, but the only source for the move is the traveller\'s account; the record still shows the old address.'),
      evidence: L('맞습니다. 빠진 것은 한 가지, 초청인이 지금 14 Albion Road에 산다는 자료입니다. 그것을 요청하고 사유를 기록합니다.', 'Correct. The gap is one specific item: something showing the host now lives at 14 Albion Road. Request it and record why.'),
      review: L('자료 하나로 정리될 수 없는 상충은 없습니다. 이사는 평범한 설명이며, 추가 검토로 넘기면 단순한 누락을 키웁니다.', 'Nothing here conflicts beyond what one document can settle. A house move is an ordinary explanation; referring it escalates a simple gap.')
    },
    assessment: {
      issue: ['GB07_HOST_ADDRESS_DIFFERS'],
      distinguish: ['GB07_FORM_MATCHES_LETTER', 'GB07_DATES_FIT_TICKET'],
      resolve: { findings: ['GB07_MOVE_UNCONFIRMED'], questions: ['gb07_address'], requests: ['SIM-GB-07-REQ-HOSTADDR'] },
      feedback: {
        issueHit: L('초청인 주소 차이 확인', 'Host address difference found'), issueMiss: L('서신과 이전 방문 기록 미대조', 'Letter not compared with the previous visit record'),
        resolveHit: L('이사 설명 확인 · 현 주소 자료 요청', 'Move explained · current-address evidence requested'), resolveMiss: L('이사 설명 확인 또는 자료 요청 미완료', 'Move not asked about or evidence not requested')
      }
    },
    debrief: L('주소 차이는 이사로 설명될 수 있지만 진술만으로는 확인되지 않습니다. 초청인의 현 주소를 보여 주는 자료 한 가지를 요청하고 이유를 남깁니다.', 'An address change may be explained by a move, but the account alone does not show it. Request the one document that shows the host\'s current address and record why.'),
    sources: ['GB-VISIT', 'GB-RULES']
  },

  // ── SIM-GB-08 · prior-visit note attached to another file (trap request) ────
  {
    id: 'SIM-GB-08', countryId: 'GB', personId: 'SIM-GB-P08', name: 'Jonah Whitlock',
    difficulty: 'advanced', category: 'record',
    title: L('다른 파일의 방문 메모', 'A note from another file'),
    brief: L('맨체스터 도착 창구. 사건에 첨부된 이전 방문 메모는 같은 이름이지만 다른 여권 번호를 적고 있습니다.', 'Manchester arrivals desk. A prior-visit note attached to the case has the same name but a different passport number.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친구 전시회 개막 참석 · 관광', 'Friend\'s exhibition opening · sightseeing') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-12-01 ~ 2026-12-06', '1–6 December 2026') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 귀국 항공권', 'Passport · return ticket') }
    ],
    opening: L('안녕하세요. 친구 전시회 개막에 맞춰 닷새 정도 왔습니다.', 'Hello. I am here for about five days for a friend\'s exhibition opening.'),
    documents: [
      { id: 'SIM-GB-08-DOC1', title: L('여권 정보면 (합성)', 'Passport data page (synthetic)'), pages: [L('성명 JONAH WHITLOCK · 여권 번호 RW8817342 · 발급 2022-05-11 · 생년월일 1990-03-07', 'Name JONAH WHITLOCK · passport no. RW8817342 · issued 2022-05-11 · date of birth 1990-03-07'), NOTICE] },
      { id: 'SIM-GB-08-DOC2', title: L('사건에 첨부된 이전 방문 메모', 'Prior-visit note attached to this case'), pages: [L('메모 (파일 SIM-GB-P91): JONAH WHITLOCK · 생년월일 07/03/1990 · 여권 번호 RW2290415 · 2025-06 맨체스터 방문, 예약보다 늦게 출국', 'Note (file SIM-GB-P91): JONAH WHITLOCK · date of birth 07/03/1990 · passport no. RW2290415 · Manchester visit June 2025, departed later than booked')] },
      { id: 'SIM-GB-08-DOC3', title: L('귀국 항공권', 'Return ticket'), pages: [L('2026-12-06 19:10 맨체스터 출발 · 2026-10-02 예약', 'Departs Manchester 2026-12-06 19:10 · booked 2026-10-02')] }
    ],
    records: [
      { id: 'SIM-GB-08-REC1', title: L('현재 여권 번호 조회', 'Search by current passport'), detail: L('파일 SIM-GB-P08 · 이전 방문 1회: 2024-04-08 ~ 2024-04-15 히스로, 예정대로 출국.', 'File SIM-GB-P08 · one previous visit: Heathrow 8–15 April 2024, departed as booked.'), documentId: 'SIM-GB-08-DOC1' },
      { id: 'SIM-GB-08-REC2', title: L('메모 파일 조회', 'Search by the note\'s file'), detail: L('파일 SIM-GB-P91 · 여권 RW2290415, 2019-08 발급, 2029-08까지 유효, 2025-06 여행에 사용 · SIM-GB-P08과 별도 파일.', 'File SIM-GB-P91 · passport RW2290415, issued 2019-08, valid to 2029-08, used for travel June 2025 · separate from file SIM-GB-P08.'), documentId: 'SIM-GB-08-DOC2' }
    ],
    facts: [
      { id: 'SIM-GB-08-F-PASSPORT', sourceType: 'document', sourceId: 'SIM-GB-08-DOC1', page: 0, label: L('여권: RW8817342 · 2022-05 발급 · 생년월일 1990-03-07', 'Passport: RW8817342 · issued May 2022 · born 1990-03-07') },
      { id: 'SIM-GB-08-F-NOTEID', sourceType: 'document', sourceId: 'SIM-GB-08-DOC2', page: 0, label: L('메모: 파일 SIM-GB-P91 · 여권 RW2290415', 'Note: file SIM-GB-P91 · passport RW2290415') },
      { id: 'SIM-GB-08-F-NOTEDOB', sourceType: 'document', sourceId: 'SIM-GB-08-DOC2', page: 0, label: L('메모: 생년월일 07/03/1990', 'Note: date of birth 07/03/1990') },
      { id: 'SIM-GB-08-F-HISTORY', sourceType: 'record', sourceId: 'SIM-GB-08-REC1', label: L('현재 파일 P08: 2024-04 방문 1회, 예정대로 출국', 'Current file P08: one visit April 2024, departed as booked') },
      { id: 'SIM-GB-08-F-P91', sourceType: 'record', sourceId: 'SIM-GB-08-REC2', label: L('파일 P91: 여권 RW2290415, 2029년까지 유효, 2025-06 사용', 'File P91: passport RW2290415, valid to 2029, used June 2025') },
      { id: 'SIM-GB-08-F-STMT', sourceType: 'statement', sourceId: 'SIM-GB-08-STMT', questionIds: ['gb08_previous'], label: L('진술: 2024년 4월 런던에 한 번 왔고 맨체스터는 처음이다', 'Statement: one visit to London in April 2024; first time in Manchester') },
      { id: 'SIM-GB-08-F-OLDPP', sourceType: 'statement', sourceId: 'SIM-GB-08-STMT-PP', questionIds: ['gb08_passport'], label: L('진술: 이전 여권은 2022년에 만료됐고 지금은 이 여권 하나뿐이다', 'Statement: previous passport expired in 2022; this is his only passport') }
    ],
    questions: [
      { id: 'gb08_purpose', q: L('방문 목적과 일정을 말씀해 주세요.', 'What is the purpose and plan of your visit?'), answer: L('친구 전시회가 2일에 개막합니다. 그 뒤로 며칠 둘러보고 6일 저녁에 돌아갑니다.', 'My friend\'s exhibition opens on the 2nd. I will look around for a few days and fly back on the evening of the 6th.') },
      { id: 'gb08_previous', q: L('이전에 영국을 방문한 적이 있습니까?', 'Have you been to the UK before?'), answer: L('2024년 4월에 런던에 일주일 다녀갔습니다. 맨체스터는 이번이 처음입니다.', 'Once, a week in London in April 2024. This is my first time in Manchester.') },
      { id: 'gb08_stay', q: L('어디에 머무십니까?', 'Where are you staying?'), answer: L('전시회 근처 호텔에 5박 예약했습니다.', 'I have five nights booked at a hotel near the gallery.') },
      { id: 'gb08_passport', q: L('이 여권 전에 다른 여권을 쓰셨습니까?', 'Did you use a different passport before this one?'), answer: L('네, 이전 여권은 2022년에 만료돼서 새로 받았습니다. 지금은 이 여권 하나뿐입니다.', 'Yes, my old one expired in 2022 and I got this one. It is the only passport I have now.') }
    ],
    comparisons: [
      { id: 'COMP-GB-08-NUMBER', facts: ['SIM-GB-08-F-PASSPORT', 'SIM-GB-08-F-NOTEID'], type: 'CONFLICT', findingId: 'GB08_DOCUMENT_NUMBER_DIFFERS', title: L('여권 번호 불일치', 'Passport numbers differ'), explanation: L('현재 여권은 RW8817342, 메모는 RW2290415입니다. 이름이 같아도 다른 문서 번호입니다.', 'The current passport is RW8817342; the note gives RW2290415. Same name, different document number.'), unlocks: { questions: ['gb08_passport'] } },
      { id: 'COMP-GB-08-DOB', facts: ['SIM-GB-08-F-PASSPORT', 'SIM-GB-08-F-NOTEDOB'], type: 'MATCH', findingId: 'GB08_DOB_SAME_DATE', title: L('생년월일은 같은 날짜', 'Dates of birth are the same day'), explanation: L('07/03/1990은 일·월 순서로 1990년 3월 7일이며 여권과 같습니다. 이름과 생년월일이 같다는 것만으로 같은 사람의 기록이 되지는 않습니다.', '07/03/1990 in day-month order is 7 March 1990, as on the passport. A shared name and date of birth do not by themselves make it the same person\'s record.'), unlocks: { requests: ['SIM-GB-08-REQ-OLDPP'] } },
      { id: 'COMP-GB-08-FILE', facts: ['SIM-GB-08-F-NOTEID', 'SIM-GB-08-F-HISTORY'], type: 'CONFLICT', findingId: 'GB08_NOTE_ON_DIFFERENT_FILE', title: L('메모가 다른 파일 소속', 'Note belongs to another file'), explanation: L('메모는 파일 P91의 것이고, 현재 여행자의 파일은 P08입니다. 메모가 이 사건에 잘못 첨부됐습니다.', 'The note is from file P91; this traveller\'s file is P08. The note has been attached to the wrong case.') },
      { id: 'COMP-GB-08-HISTORY', facts: ['SIM-GB-08-F-HISTORY', 'SIM-GB-08-F-STMT'], type: 'MATCH', findingId: 'GB08_HISTORY_MATCHES_STATEMENT', title: L('방문 이력과 진술 일치', 'History matches his account'), explanation: L('현재 파일의 2024년 4월 히스로 방문 1회가 그의 설명과 같습니다.', 'His file\'s single Heathrow visit in April 2024 matches his account.') },
      { id: 'COMP-GB-08-OLDPP', facts: ['SIM-GB-08-F-P91', 'SIM-GB-08-F-OLDPP'], type: 'CONFLICT', findingId: 'GB08_NOTE_PASSPORT_NOT_HIS_OLD_ONE', title: L('메모의 여권은 이전 여권이 아님', 'Note passport is not his old one'), explanation: L('그의 이전 여권은 2022년에 만료됐지만, 메모의 여권은 2029년까지 유효하며 2025년에 사용됐습니다. 같은 여권일 수 없습니다.', 'His previous passport expired in 2022; the note\'s passport is valid to 2029 and was used in 2025. They cannot be the same passport.') }
    ],
    requests: [
      { id: 'SIM-GB-08-REQ-OLDPP', title: L('만료된 이전 여권 제시 요청', 'Ask to see the expired previous passport'), result: L('여행자는 만료된 여권을 가지고 있지 않습니다. 파일 식별자 대조 외에 더해지는 내용은 없습니다.', 'The traveller does not carry the expired passport. Nothing is added beyond the file identifiers already compared.') }
    ],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('맞습니다. 이름과 생년월일은 같지만(07/03/1990은 같은 날), 메모는 2025년에도 쓰인 다른 여권과 파일 P91에 속합니다. 이 여행자의 파일 P08은 그의 설명과 맞는 2024년 방문 1회뿐입니다. 잘못 첨부된 메모를 기록하고 완료합니다.', 'Correct. Name and date of birth are shared (07/03/1990 is the same day), but the note belongs to file P91 and a passport still used in 2025. This traveller\'s file P08 shows one 2024 visit that matches his account. Record the mis-attached note and complete.'),
      evidence: L('만료된 여권을 요청해도 더해지는 것이 없습니다. 파일 식별자가 이미 두 기록을 분리합니다.', 'Requesting the expired passport adds nothing: the file identifiers already separate the two records.'),
      review: L('파일 식별자를 대조하면 이 여행자에 관한 미해결 상충은 남지 않습니다. 넘기면 다른 사람의 메모를 그의 사건으로 옮기게 됩니다.', 'Once the file identifiers are compared, nothing about this traveller is unresolved. Referring would carry another person\'s note into his case.')
    },
    assessment: {
      issue: ['GB08_DOCUMENT_NUMBER_DIFFERS'],
      distinguish: ['GB08_DOB_SAME_DATE', 'GB08_NOTE_PASSPORT_NOT_HIS_OLD_ONE'],
      resolve: { findings: ['GB08_NOTE_ON_DIFFERENT_FILE', 'GB08_HISTORY_MATCHES_STATEMENT'], questions: ['gb08_previous', 'gb08_passport'], requests: [] },
      feedback: {
        issueHit: L('메모의 여권 번호 불일치 확인', 'Note passport mismatch found'), issueMiss: L('여권과 메모 번호 미대조', 'Passport and note numbers not compared'),
        resolveHit: L('메모의 파일 분리 · 본인 이력 확인', 'Note separated by file · own history checked'), resolveMiss: L('파일 식별자 또는 본인 이력 대조 미완료', 'File identifier or own history comparison incomplete')
      }
    },
    debrief: L('같은 이름과 생년월일은 출발점일 뿐입니다. 문서 번호와 파일 식별자가 메모를 다른 사람의 것으로 분리하고, 본인 이력은 진술과 맞습니다. 잘못 첨부된 메모를 기록하고 검토를 완료합니다.', 'A shared name and date of birth are only a starting point. The document number and file identifier separate the note as another person\'s, and his own history matches his account. Record the mis-attachment and complete the review.'),
    sources: ['GB-VISIT', 'GB-ACT']
  },

  // ── SIM-GB-09 · short-course enrolment vs stay ───────────────────────────
  {
    id: 'SIM-GB-09', countryId: 'GB', personId: 'SIM-GB-P09', name: 'Yuki Fenwick',
    difficulty: 'standard', category: 'document',
    title: L('과정 기간과 체류 기간', 'Course dates and stay'),
    brief: L('맨체스터 도착 창구. 단기 과정 등록 확인서는 12월 4일에 끝나지만 진술한 체류는 12월 20일까지입니다.', 'Manchester arrivals desk. The short-course enrolment letter ends on 4 December, but the stated stay runs to 20 December.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('단기 과정 수강', 'Short course') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-11-15 ~ 2026-12-20', '15 November – 20 December 2026') },
      { label: L('제출 자료', 'Submitted'), value: L('등록 확인서 · 방문 정보 양식 · 숙소 확인서', 'Enrolment letter · visit details form · residence booking') }
    ],
    opening: L('안녕하세요. 요크에서 정원 디자인 단기 과정을 들으러 왔습니다.', 'Hello. I am here for a short course in garden design in York.'),
    documents: [
      { id: 'SIM-GB-09-DOC1', title: L('등록 확인서', 'Enrolment letter'), pages: [L('Calder School of Garden Design (가상), 요크 · Yuki Fenwick 등록 · 1모듈 2026-11-16 ~ 2026-12-04 · 수업료 완납', 'Calder School of Garden Design (fictional), York · Yuki Fenwick enrolled · Module 1: 16 Nov – 4 Dec 2026 · fees paid in full'), NOTICE] },
      { id: 'SIM-GB-09-DOC2', title: L('방문 정보 양식', 'Visit details form'), pages: [L('체류 2026-11-15 ~ 2026-12-20 · 목적: 단기 과정 · 주소: 요크 학생 기숙사', 'Stay 15 Nov – 20 Dec 2026 · purpose: short course · address: student residence, York')] },
      { id: 'SIM-GB-09-DOC3', title: L('숙소 확인서', 'Residence booking'), pages: [L('요크 학생 기숙사 · 2026-11-15 ~ 2026-12-19 (34박) · 선결제', 'Student residence, York · 15 Nov – 19 Dec 2026 (34 nights) · prepaid')] }
    ],
    records: [
      { id: 'SIM-GB-09-REC1', title: L('귀국 예약 기록', 'Return booking record'), detail: L('2026-12-20 10:15 맨체스터 출발 · 2026-09-01 예약', 'Departs Manchester 2026-12-20 10:15 · booked 2026-09-01'), documentId: 'SIM-GB-09-DOC2' }
    ],
    facts: [
      { id: 'SIM-GB-09-F-MOD1', sourceType: 'document', sourceId: 'SIM-GB-09-DOC1', page: 0, label: L('등록 확인서: 1모듈 11-16 ~ 12-04', 'Enrolment: Module 1, 16 Nov – 4 Dec') },
      { id: 'SIM-GB-09-F-STAY', sourceType: 'document', sourceId: 'SIM-GB-09-DOC2', page: 0, label: L('양식: 체류 11-15 ~ 12-20', 'Form: stay 15 Nov – 20 Dec') },
      { id: 'SIM-GB-09-F-RES', sourceType: 'document', sourceId: 'SIM-GB-09-DOC3', page: 0, label: L('숙소: 11-15 ~ 12-19 (34박)', 'Residence: 15 Nov – 19 Dec (34 nights)') },
      { id: 'SIM-GB-09-F-RETURN', sourceType: 'record', sourceId: 'SIM-GB-09-REC1', label: L('귀국 예약: 12-20 출발', 'Return booking: departs 20 Dec') },
      { id: 'SIM-GB-09-F-MOD2', sourceType: 'statement', sourceId: 'SIM-GB-09-STMT', questionIds: ['gb09_after'], label: L('진술: 2모듈(12-07 ~ 12-18)도 등록했고 확인 메일은 출력하지 못했다', 'Statement: also enrolled on Module 2 (7–18 Dec); confirmation email not printed') }
    ],
    questions: [
      { id: 'gb09_purpose', q: L('방문 목적을 말씀해 주세요.', 'What is the purpose of your visit?'), answer: L('요크에서 정원 디자인 단기 과정을 듣습니다.', 'I am taking a short course in garden design in York.') },
      { id: 'gb09_length', q: L('얼마나 머무십니까?', 'How long are you staying?'), answer: L('11월 15일부터 12월 20일까지입니다. 기숙사에 머뭅니다.', 'From 15 November to 20 December, in the student residence.') },
      { id: 'gb09_fees', q: L('수업료와 체류 비용은 어떻게 마련하셨습니까?', 'How are your course fees and living costs covered?'), answer: L('수업료는 이미 냈고 기숙사도 선결제했습니다. 생활비는 제 저축으로 씁니다.', 'The fees are paid and the residence is prepaid. Living costs come from my savings.') },
      { id: 'gb09_after', q: L('등록 확인서의 과정은 12월 4일에 끝납니다. 그 뒤에는 무엇을 하십니까?', 'The course in your letter ends on 4 December. What are you doing after that?'), answer: L('12월 7일부터 18일까지 2모듈도 등록했습니다. 확인 메일은 받았는데 출력하지 못했습니다.', 'I am also enrolled on Module 2, from 7 to 18 December. I have the confirmation email but did not print it.') }
    ],
    comparisons: [
      { id: 'COMP-GB-09-GAP', facts: ['SIM-GB-09-F-MOD1', 'SIM-GB-09-F-STAY'], type: 'UNVERIFIED', findingId: 'GB09_STAY_EXTENDS_PAST_COURSE', title: L('체류가 과정 종료 후까지 이어짐', 'Stay runs past the course'), explanation: L('등록된 과정은 12월 4일에 끝나지만 체류는 12월 20일까지입니다. 남는 16일을 설명하는 자료가 없습니다.', 'The enrolled course ends on 4 December; the stay runs to 20 December. Nothing on file covers the remaining 16 days.'), unlocks: { questions: ['gb09_after'] } },
      { id: 'COMP-GB-09-RES', facts: ['SIM-GB-09-F-RES', 'SIM-GB-09-F-STAY'], type: 'MATCH', findingId: 'GB09_RESIDENCE_FITS_STAY', title: L('숙소 기간과 체류 부합', 'Residence fits the stay'), explanation: L('기숙사는 12월 19일 밤까지이고 20일 오전에 떠납니다.', 'The residence runs to the night of 19 December, and she leaves on the morning of the 20th.') },
      { id: 'COMP-GB-09-RETURN', facts: ['SIM-GB-09-F-RETURN', 'SIM-GB-09-F-STAY'], type: 'MATCH', findingId: 'GB09_RETURN_FITS_STAY', title: L('귀국 예약과 체류 부합', 'Return booking fits the stay'), explanation: L('9월에 예약한 귀국편이 양식의 마지막 날과 같습니다.', 'The return booked in September matches the last day on the form.') },
      { id: 'COMP-GB-09-MOD2', facts: ['SIM-GB-09-F-MOD2', 'SIM-GB-09-F-MOD1'], type: 'MISSING', findingId: 'GB09_MODULE2_NOT_DOCUMENTED', title: L('2모듈 등록 자료 없음', 'Module 2 not documented'), explanation: L('2모듈 설명은 날짜상 체류와 맞지만, 등록 확인서에는 1모듈만 있습니다.', 'Module 2 would fit the stay dates, but the enrolment letter covers Module 1 only.'), unlocks: { requests: ['SIM-GB-09-REQ-MOD2'] } }
    ],
    requests: [
      { id: 'SIM-GB-09-REQ-MOD2', title: L('2모듈 등록 확인 자료 요청', 'Request the Module 2 enrolment confirmation'), result: L('요청 기록됨. 여행자가 학교에서 받은 2모듈 확인 메일을 전달하기로 했으며, 아직 접수되지 않았습니다.', 'Request recorded. The traveller will forward the Module 2 confirmation email from the school; not yet on file.') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('숙소와 귀국 예약은 체류와 맞지만 과정 자료는 1모듈만 다룹니다. 2모듈은 진술로만 뒷받침됩니다.', 'The residence and return booking fit the stay, but the course evidence covers Module 1 only. Module 2 rests on the statement.'),
      evidence: L('맞습니다. 남은 기간을 뒷받침할 자료는 2모듈 확인서 하나입니다. 그것을 요청하고 사유를 기록합니다.', 'Correct. One specific document, the Module 2 confirmation, would cover the remaining weeks. Request it and record why.'),
      review: L('상충은 없습니다. 2모듈을 반영하면 날짜가 모두 맞습니다. 이것은 모순이 아니라 빠진 자료입니다.', 'Nothing conflicts: once Module 2 is accounted for, all the dates fit. This is a missing document, not a contradiction.')
    },
    assessment: {
      issue: ['GB09_STAY_EXTENDS_PAST_COURSE'],
      distinguish: ['GB09_RESIDENCE_FITS_STAY', 'GB09_RETURN_FITS_STAY'],
      resolve: { findings: ['GB09_MODULE2_NOT_DOCUMENTED'], questions: ['gb09_after'], requests: ['SIM-GB-09-REQ-MOD2'] },
      feedback: {
        issueHit: L('과정 종료 후 체류 기간 확인', 'Stay beyond the course identified'), issueMiss: L('등록 확인서와 체류 기간 미대조', 'Enrolment dates not compared with the stay'),
        resolveHit: L('2모듈 설명 확인 · 확인서 요청', 'Module 2 explained · confirmation requested'), resolveMiss: L('후속 질문 또는 자료 요청 미완료', 'Follow-up or request incomplete')
      }
    },
    debrief: L('숙소와 귀국편은 체류와 맞고, 남는 기간은 2모듈로 설명됩니다. 그 설명을 뒷받침할 확인서 하나를 요청하고 이유를 남깁니다.', 'The residence and return fit the stay, and the extra weeks are explained by Module 2. Request the one confirmation that would support that and record why.'),
    sources: ['GB-RULES', 'GB-VISIT']
  },

  // ── SIM-GB-10 · who funds the trip (resolved by a bank letter) ────────────
  {
    id: 'SIM-GB-10', countryId: 'GB', personId: 'SIM-GB-P10', name: 'Marisol Quaye',
    difficulty: 'advanced', category: 'statement',
    title: L('누가 여행 비용을 냅니까', 'Who is paying for the trip'),
    brief: L('히스로 도착 창구. 첫 진술, 방문 정보 양식, 고용주 서신이 여행 비용 부담자를 서로 다르게 적고 있습니다.', 'Heathrow arrivals desk. The opening statement, the visit details form and the employer letter each name a different source of funds.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('휴가 (에든버러)', 'Holiday (Edinburgh)') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-11-23 ~ 2026-12-04', '23 November – 4 December 2026') },
      { label: L('제출 자료', 'Submitted'), value: L('방문 정보 양식 · 고용주 서신 · 숙소 예약', 'Visit details form · employer letter · guesthouse booking') }
    ],
    opening: L('안녕하세요. 휴가로 에든버러에 갑니다. 회사가 비용을 내는 거예요.', 'Hello. I am going to Edinburgh on holiday. My company is paying for the trip.'),
    documents: [
      { id: 'SIM-GB-10-DOC1', title: L('방문 정보 양식', 'Visit details form'), pages: [L('MARISOL QUAYE · 체류 2026-11-23 ~ 2026-12-04 · 여행 비용 부담: 본인', 'MARISOL QUAYE · stay 23 Nov – 4 Dec 2026 · trip funded by: self'), NOTICE] },
      { id: 'SIM-GB-10-DOC2', title: L('고용주 서신', 'Employer letter'), pages: [L('Tidewell Analytics (가상): 연차 휴가 11-23 ~ 12-04 승인 · 개인 여행이며 회사가 비용을 지원하지 않음 · 2026-10-28', 'Tidewell Analytics (fictional): annual leave 23 Nov – 4 Dec approved · personal travel, not funded by the company · 28 Oct 2026')] },
      { id: 'SIM-GB-10-DOC3', title: L('숙소 예약', 'Guesthouse booking'), pages: [L('에든버러 게스트하우스 11박 · 2026-10-05 카드(끝자리 4471, M QUAYE)로 전액 결제', 'Edinburgh guesthouse, 11 nights · paid in full 2026-10-05 by card ending 4471 (M QUAYE)')] }
    ],
    records: [
      { id: 'SIM-GB-10-REC1', title: L('첫 진술 기록', 'Opening statement record'), detail: L('첫 진술: 「회사가 비용을 내는 거예요.」', 'Opening statement: "My company is paying for the trip."'), documentId: 'SIM-GB-10-DOC1' }
    ],
    facts: [
      { id: 'SIM-GB-10-F-FORM', sourceType: 'document', sourceId: 'SIM-GB-10-DOC1', page: 0, label: L('양식: 비용 부담 본인', 'Form: funded by self') },
      { id: 'SIM-GB-10-F-EMPLOYER', sourceType: 'document', sourceId: 'SIM-GB-10-DOC2', page: 0, label: L('고용주 서신: 개인 휴가, 회사 비용 지원 없음', 'Employer letter: personal leave, not funded by the company') },
      { id: 'SIM-GB-10-F-HOTEL', sourceType: 'document', sourceId: 'SIM-GB-10-DOC3', page: 0, label: L('숙소: 본인 명의 카드로 전액 결제', 'Guesthouse: paid in full by her own card') },
      { id: 'SIM-GB-10-F-OPEN', sourceType: 'record', sourceId: 'SIM-GB-10-REC1', label: L('첫 진술: 회사가 비용을 낸다', 'Opening statement: the company is paying') },
      { id: 'SIM-GB-10-F-MEANING', sourceType: 'statement', sourceId: 'SIM-GB-10-STMT', questionIds: ['gb10_company'], label: L('진술: 회사 돈이 아니라 월급으로 낸다는 뜻이었다', 'Statement: meant she pays from her salary, not company money') },
      { id: 'SIM-GB-10-F-AUNT', sourceType: 'statement', sourceId: 'SIM-GB-10-STMT-AUNT', questionIds: ['gb10_flights'], label: L('진술: 항공권은 10월 초 이모가 보내 준 640파운드로 샀다', 'Statement: flights bought with £640 her aunt sent in early October') },
      { id: 'SIM-GB-10-F-BANK', sourceType: 'request', sourceId: 'SIM-GB-10-REQ-BANK', requestId: 'SIM-GB-10-REQ-BANK', label: L('은행 서신: 매월 급여 입금 · 10-03 A. QUAYE 송금 £640 「항공권」 · 잔액 £4,210', 'Bank letter: monthly salary credits · 3 Oct transfer £640 from A. QUAYE "flights" · balance £4,210') }
    ],
    questions: [
      { id: 'gb10_purpose', q: L('방문 목적을 말씀해 주세요.', 'What is the purpose of your visit?'), answer: L('휴가입니다. 에든버러에서 11박 합니다.', 'A holiday. Eleven nights in Edinburgh.') },
      { id: 'gb10_funds', q: L('여행 비용은 어떻게 마련하셨습니까?', 'How is the trip being paid for?'), answer: L('제가 냅니다. 숙소도 제 카드로 결제했습니다.', 'I am paying. I paid for the guesthouse with my own card.') },
      { id: 'gb10_return', q: L('언제 돌아가십니까?', 'When do you go home?'), answer: L('12월 4일입니다. 5일부터 다시 출근해야 합니다.', 'On 4 December. I am back at work on the 5th.') },
      { id: 'gb10_company', q: L('처음에 회사가 비용을 낸다고 하셨는데, 고용주 서신에는 회사 지원이 없다고 되어 있습니다.', 'You first said your company is paying, but the employer letter says the company is not funding it.'), answer: L('회사 돈이 아니라 월급으로 낸다는 뜻이었습니다. 제가 말을 잘못했네요. 급여가 들어오는 계좌의 은행 서신이 가방에 있습니다.', 'I meant I pay from my salary, not company money. I put it badly. I have a letter from the bank where my salary goes, in my bag.') },
      { id: 'gb10_flights', q: L('항공권은 어떻게 결제하셨습니까?', 'How were the flights paid for?'), answer: L('항공권은 10월 초에 이모가 보내 준 640파운드로 샀습니다.', 'I bought the flights with £640 my aunt sent me in early October.') }
    ],
    comparisons: [
      { id: 'COMP-GB-10-OPEN-EMPLOYER', facts: ['SIM-GB-10-F-OPEN', 'SIM-GB-10-F-EMPLOYER'], type: 'CONFLICT', findingId: 'GB10_FUNDER_STATEMENTS_DIFFER', title: L('첫 진술과 고용주 서신 불일치', 'Opening statement conflicts with employer letter'), explanation: L('첫 진술은 회사가 낸다고 하지만, 고용주 서신은 회사가 지원하지 않는다고 합니다.', 'The opening statement says the company pays; the employer letter says it does not.'), unlocks: { questions: ['gb10_company'] } },
      { id: 'COMP-GB-10-FORM-OPEN', facts: ['SIM-GB-10-F-FORM', 'SIM-GB-10-F-OPEN'], type: 'CONFLICT', findingId: 'GB10_FORM_AND_OPENING_DIFFER', title: L('양식과 첫 진술 불일치', 'Form conflicts with the opening statement'), explanation: L('양식은 본인 부담, 첫 진술은 회사 부담입니다. 항공권 비용은 어느 자료에도 나오지 않습니다.', 'The form says self-funded; the opening statement says the company. Neither shows how the flights were paid.'), unlocks: { questions: ['gb10_flights'] } },
      { id: 'COMP-GB-10-HOTEL', facts: ['SIM-GB-10-F-HOTEL', 'SIM-GB-10-F-FORM'], type: 'MATCH', findingId: 'GB10_HOTEL_PAID_BY_TRAVELLER', title: L('숙소는 본인 결제', 'Guesthouse paid by her'), explanation: L('본인 명의 카드 결제는 양식의 본인 부담과 맞습니다.', 'Payment by her own card fits the form\'s "self".') },
      { id: 'COMP-GB-10-MEANING', facts: ['SIM-GB-10-F-MEANING', 'SIM-GB-10-F-EMPLOYER'], type: 'UNVERIFIED', findingId: 'GB10_SALARY_EXPLANATION_UNVERIFIED', title: L('월급 설명 미확인', 'Salary explanation not yet shown'), explanation: L('월급으로 낸다는 설명은 고용주 서신과 맞을 수 있지만 아직 자료로 확인되지 않았습니다. 본인이 언급한 은행 서신이 확인 수단입니다.', 'Paying from salary could fit the employer letter but is not yet shown. The bank letter she mentions would show it.'), unlocks: { requests: ['SIM-GB-10-REQ-BANK'] } },
      { id: 'COMP-GB-10-BANK-SALARY', facts: ['SIM-GB-10-F-BANK', 'SIM-GB-10-F-MEANING'], type: 'MATCH', findingId: 'GB10_SALARY_CREDITS_SHOWN', title: L('급여 입금 확인', 'Salary credits shown'), explanation: L('은행 서신에 매월 급여 입금이 있어 「회사가 낸다」는 말이 월급을 뜻했다는 설명과 맞습니다.', 'The bank letter shows monthly salary credits, fitting her account that "the company pays" meant her salary.') },
      { id: 'COMP-GB-10-BANK-AUNT', facts: ['SIM-GB-10-F-BANK', 'SIM-GB-10-F-AUNT'], type: 'MATCH', findingId: 'GB10_AUNT_TRANSFER_SHOWN', title: L('이모의 송금 확인', 'Aunt\'s transfer shown'), explanation: L('10월 3일 A. QUAYE의 £640 송금(「항공권」)이 진술과 같습니다.', 'The £640 transfer from A. QUAYE on 3 October, marked "flights", matches her account.') }
    ],
    requests: [
      { id: 'SIM-GB-10-REQ-BANK', title: L('여행자가 언급한 은행 서신 제시 요청', 'Ask to see the bank letter the traveller mentions'), result: L('은행 서신(2026-11-20): 예금주 MARISOL QUAYE · Tidewell Analytics 급여 매월 입금 · 2026-10-03 A. QUAYE 송금 £640, 메모 「flights」 · 잔액 £4,210.', 'Bank letter (20 Nov 2026): account holder MARISOL QUAYE · monthly salary credits from Tidewell Analytics · 3 Oct 2026 transfer £640 from A. QUAYE, reference "flights" · balance £4,210.') }
    ],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('맞습니다. 「회사」, 「본인」, 「이모」라는 세 설명이 은행 서신으로 정리됩니다. 급여 입금, 항공권용 £640 송금, 본인 카드로 결제한 숙소. 남은 사항이 없습니다.', 'Correct. The three accounts, "company", "self" and "aunt", are reconciled by the bank letter: salary credits, a £640 transfer for the flights and the guesthouse on her own card. Nothing is outstanding.'),
      evidence: L('결정적 자료는 창구에서 이미 제시돼 대조됐습니다. 더 요청할 것이 남아 있지 않습니다.', 'The deciding document was available at the desk and has been compared. Nothing further is outstanding.'),
      review: L('진술은 표현이 달랐을 뿐 내용은 은행 서신과 맞습니다. 자료 하나로 풀린 차이를 추가 검토로 넘기면 과도한 처리입니다.', 'The answers differed in wording, not substance, once compared with the bank letter. Referring a difference one document resolved is an over-escalation.')
    },
    assessment: {
      issue: ['GB10_FUNDER_STATEMENTS_DIFFER', 'GB10_FORM_AND_OPENING_DIFFER'],
      distinguish: ['GB10_HOTEL_PAID_BY_TRAVELLER', 'GB10_SALARY_EXPLANATION_UNVERIFIED'],
      resolve: { findings: ['GB10_SALARY_CREDITS_SHOWN', 'GB10_AUNT_TRANSFER_SHOWN'], questions: ['gb10_company', 'gb10_flights'], requests: ['SIM-GB-10-REQ-BANK'] },
      feedback: {
        issueHit: L('비용 부담자 진술 차이 확인', 'Conflicting funding accounts found'), issueMiss: L('첫 진술과 서류 미대조', 'Opening statement not compared with the documents'),
        resolveHit: L('은행 서신으로 세 설명 정리', 'Bank letter reconciles the accounts'), resolveMiss: L('은행 서신 요청 또는 대조 미완료', 'Bank letter not requested or not compared')
      }
    },
    debrief: L('비용 부담자에 대한 말이 엇갈릴 때는 바로 넘기지 말고 무엇을 뜻했는지 묻고, 그 설명을 확인할 자료 하나를 봅니다. 은행 서신이 세 설명을 모두 뒷받침하므로 검토를 완료합니다.', 'When accounts of who pays differ, ask what was meant before escalating, and look at the one document that can confirm it. The bank letter supports all three accounts, so complete the review.'),
    sources: ['GB-VISIT', 'GB-RULES']
  },

  // ── SIM-GB-11 · wedding trip with a cancelled London booking ────────────────
  {
    id: 'SIM-GB-11', countryId: 'GB', personId: 'SIM-GB-P11', name: 'Anika Brennan',
    difficulty: 'advanced', category: 'complex',
    title: L('결혼식 일정과 런던 숙소', 'Wedding trip and the London nights'),
    brief: L('히스로 도착 창구. 결혼식 초대장, 초청인 서신, 귀국편, 숙소 예약을 함께 대조해야 합니다.', 'Heathrow arrivals desk. A wedding invitation, a host letter, a return flight and a hotel booking need to be compared together.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친구 결혼식 참석', 'Attending a friend\'s wedding') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-12-08 ~ 2026-12-15', '8–15 December 2026') },
      { label: L('제출 자료', 'Submitted'), value: L('방문 정보 양식 · 결혼식 초대장 · 초청인 서신 · 귀국 항공권', 'Visit details form · wedding invitation · host letter · return ticket') }
    ],
    opening: L('안녕하세요. 에든버러에서 열리는 친구 결혼식에 왔습니다.', 'Hello. I am here for a friend\'s wedding in Edinburgh.'),
    documents: [
      { id: 'SIM-GB-11-DOC1', title: L('방문 정보 양식', 'Visit details form'), pages: [L('ANIKA BRENNAN · 체류 2026-12-08 ~ 12-15 · 런던 12-08 ~ 12-10 호텔(예약 HN-55120) · 에든버러 12-10 ~ 12-15 초청인 댁', 'ANIKA BRENNAN · stay 8–15 Dec 2026 · London 8–10 Dec, hotel (booking HN-55120) · Edinburgh 10–15 Dec, with host'), NOTICE] },
      { id: 'SIM-GB-11-DOC2', title: L('결혼식 초대장', 'Wedding invitation'), pages: [L('Isla MacLeod와 Rowan Adeyemi의 결혼식 · 2026년 12월 12일(토) 에든버러 · 초대 손님 Anika Brennan', 'The wedding of Isla MacLeod and Rowan Adeyemi · Saturday 12 December 2026, Edinburgh · guest: Anika Brennan')] },
      { id: 'SIM-GB-11-DOC3', title: L('초청인 서신', 'Host letter'), pages: [L('Fiona MacLeod(신부 어머니): 「Anika가 Isla의 결혼식을 위해 12월 10일부터 15일까지 에든버러 저희 집에 머뭅니다.」', 'From Fiona MacLeod (mother of the bride): "Anika will stay with us in Edinburgh from 10 to 15 December for Isla\'s wedding."')] },
      { id: 'SIM-GB-11-DOC4', title: L('귀국 항공권', 'Return ticket'), pages: [L('2026-12-15 14:20 에든버러 출발 · 2026-09-12 예약', 'Departs Edinburgh 2026-12-15 14:20 · booked 2026-09-12')] }
    ],
    records: [
      { id: 'SIM-GB-11-REC1', title: L('숙박 예약 번호 조회 (모의)', 'Hotel booking reference check (simulated)'), detail: L('예약 HN-55120 · 런던 12-08 ~ 12-10 · 2026-11-20 투숙객이 취소.', 'Booking HN-55120 · London 8–10 Dec · cancelled by the guest on 2026-11-20.'), documentId: 'SIM-GB-11-DOC1' }
    ],
    facts: [
      { id: 'SIM-GB-11-F-LONDON', sourceType: 'document', sourceId: 'SIM-GB-11-DOC1', page: 0, label: L('양식: 런던 12-08 ~ 12-10 호텔, 예약 HN-55120', 'Form: London 8–10 Dec, hotel booking HN-55120') },
      { id: 'SIM-GB-11-F-EDI', sourceType: 'document', sourceId: 'SIM-GB-11-DOC1', page: 0, label: L('양식: 에든버러 12-10 ~ 12-15 초청인 댁', 'Form: Edinburgh 10–15 Dec with host') },
      { id: 'SIM-GB-11-F-WEDDING', sourceType: 'document', sourceId: 'SIM-GB-11-DOC2', page: 0, label: L('초대장: 12-12(토) 에든버러 예식', 'Invitation: wedding Sat 12 Dec, Edinburgh') },
      { id: 'SIM-GB-11-F-HOST', sourceType: 'document', sourceId: 'SIM-GB-11-DOC3', page: 0, label: L('초청인 서신: 에든버러 12-10 ~ 12-15 숙박', 'Host letter: Edinburgh 10–15 Dec') },
      { id: 'SIM-GB-11-F-TICKET', sourceType: 'document', sourceId: 'SIM-GB-11-DOC4', page: 0, label: L('귀국: 12-15 에든버러 출발', 'Return: departs Edinburgh 15 Dec') },
      { id: 'SIM-GB-11-F-CANCEL', sourceType: 'record', sourceId: 'SIM-GB-11-REC1', label: L('예약 기록: HN-55120, 11-20 취소', 'Booking record: HN-55120 cancelled 20 Nov') },
      { id: 'SIM-GB-11-F-REBOOK', sourceType: 'statement', sourceId: 'SIM-GB-11-STMT', questionIds: ['gb11_london'], label: L('진술: 11월에 취소하고 다른 숙소를 다시 예약했으며 확인 메일만 있다', 'Statement: cancelled in November and rebooked elsewhere; has only the confirmation email') }
    ],
    questions: [
      { id: 'gb11_purpose', q: L('방문 목적을 말씀해 주세요.', 'What is the purpose of your visit?'), answer: L('대학 친구 아일라의 결혼식이 12일 에든버러에서 있습니다.', 'My university friend Isla is getting married in Edinburgh on the 12th.') },
      { id: 'gb11_plan', q: L('일정을 말씀해 주세요.', 'Can you take me through your plans?'), answer: L('8일에 런던에 도착해서 이틀 있다가 10일에 기차로 에든버러로 갑니다. 15일에 에든버러에서 귀국합니다.', 'I land in London on the 8th, spend two days there, take the train to Edinburgh on the 10th and fly home from Edinburgh on the 15th.') },
      { id: 'gb11_edinburgh', q: L('에든버러에서는 어디에 머무십니까?', 'Where are you staying in Edinburgh?'), answer: L('신부 어머니 피오나 씨 댁에 머뭅니다. 그분이 써 주신 서신을 가져왔습니다.', 'With Fiona, the bride\'s mother. I have brought the letter she wrote.') },
      { id: 'gb11_funds', q: L('여행 비용은 어떻게 마련하셨습니까?', 'How are you paying for the trip?'), answer: L('제가 모은 돈으로 냅니다. 항공권은 9월에 샀습니다.', 'From my own savings. I bought the flights in September.') },
      { id: 'gb11_london', q: L('양식에 적힌 런던 호텔 예약이 취소된 것으로 나옵니다.', 'The London hotel booking on your form shows as cancelled.'), answer: L('맞아요, 11월에 취소하고 더 저렴한 곳으로 다시 예약했습니다. 확인 메일은 있는데 양식은 고치지 못했어요.', 'Yes, I cancelled it in November and rebooked somewhere cheaper. I have the confirmation email but did not update the form.') }
    ],
    comparisons: [
      { id: 'COMP-GB-11-WEDDING', facts: ['SIM-GB-11-F-WEDDING', 'SIM-GB-11-F-HOST'], type: 'MATCH', findingId: 'GB11_WEDDING_WITHIN_HOST_STAY', title: L('예식일이 초청 기간 안', 'Wedding falls within the host stay'), explanation: L('12월 12일 예식은 초청인 댁 숙박 기간(10~15일) 안에 있습니다.', 'The 12 December wedding falls within the 10–15 December stay with the host.') },
      { id: 'COMP-GB-11-EDINBURGH', facts: ['SIM-GB-11-F-EDI', 'SIM-GB-11-F-HOST'], type: 'MATCH', findingId: 'GB11_FORM_MATCHES_HOST', title: L('양식과 초청인 서신 일치', 'Form matches the host letter'), explanation: L('에든버러 일정이 양식과 서신에서 같습니다.', 'The Edinburgh dates are the same on the form and in the letter.') },
      { id: 'COMP-GB-11-RETURN', facts: ['SIM-GB-11-F-TICKET', 'SIM-GB-11-F-HOST'], type: 'MATCH', findingId: 'GB11_RETURN_FITS_HOST_DATES', title: L('귀국편과 초청 기간 부합', 'Return fits the host dates'), explanation: L('15일 에든버러 출발이 초청 기간의 마지막 날과 같습니다.', 'The 15 December departure from Edinburgh is the last day of the host stay.') },
      { id: 'COMP-GB-11-CANCELLED', facts: ['SIM-GB-11-F-LONDON', 'SIM-GB-11-F-CANCEL'], type: 'CONFLICT', findingId: 'GB11_LONDON_BOOKING_CANCELLED', title: L('런던 예약 취소됨', 'London booking cancelled'), explanation: L('양식이 적은 런던 호텔 예약 HN-55120은 11월 20일에 취소됐습니다. 8~10일 숙소를 보여 주는 자료가 없습니다.', 'The London booking HN-55120 on the form was cancelled on 20 November. Nothing on file shows where she stays on 8–10 December.'), unlocks: { questions: ['gb11_london'] } },
      { id: 'COMP-GB-11-REBOOK', facts: ['SIM-GB-11-F-REBOOK', 'SIM-GB-11-F-CANCEL'], type: 'MISSING', findingId: 'GB11_NEW_BOOKING_NOT_ON_FILE', title: L('새 예약 자료 없음', 'Replacement booking not on file'), explanation: L('재예약 설명은 취소 기록과 맞지만, 새 예약은 아직 아무도 보지 못했습니다.', 'Rebooking fits the cancellation record, but nobody has yet seen the new booking.'), unlocks: { requests: ['SIM-GB-11-REQ-BOOKING'] } }
    ],
    requests: [
      { id: 'SIM-GB-11-REQ-BOOKING', title: L('런던 8~10일 새 숙소 예약 확인 요청', 'Request the replacement London booking for 8–10 December'), result: L('요청 기록됨. 여행자가 새 숙소 확인 메일을 보내기로 했으며, 아직 접수되지 않았습니다.', 'Request recorded. The traveller will send the new booking confirmation email; not yet on file.') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('결혼식, 초청인 댁 숙박, 귀국편은 모두 맞지만, 런던 이틀은 취소된 예약과 아무도 보지 못한 새 예약에 기대고 있습니다.', 'The wedding, host stay and return all line up, but the London nights rest on a cancelled booking and a replacement nobody has seen.'),
      evidence: L('맞습니다. 남은 것은 런던 새 숙소 예약 한 가지입니다. 나머지 일정은 서로 맞으므로 그 자료를 요청하고 사유를 기록합니다.', 'Correct. One specific document is outstanding, the replacement London booking. The rest of the itinerary is consistent; request it and record why.'),
      review: L('빠진 것은 여행자가 가지고 있다고 말하는 예약 확인서 하나입니다. 미해결 상충이 아니라 요청할 자료입니다.', 'The only gap is a booking confirmation the traveller says she holds. That calls for a request, not a referral of an unresolved conflict.')
    },
    assessment: {
      issue: ['GB11_LONDON_BOOKING_CANCELLED'],
      distinguish: ['GB11_WEDDING_WITHIN_HOST_STAY', 'GB11_FORM_MATCHES_HOST', 'GB11_RETURN_FITS_HOST_DATES'],
      resolve: { findings: ['GB11_NEW_BOOKING_NOT_ON_FILE'], questions: ['gb11_london'], requests: ['SIM-GB-11-REQ-BOOKING'] },
      feedback: {
        issueHit: L('런던 예약 취소 확인', 'Cancelled London booking found'), issueMiss: L('양식의 예약 번호 미조회', 'Booking reference on the form not checked'),
        resolveHit: L('재예약 설명 확인 · 새 예약 요청', 'Rebooking explained · replacement requested'), resolveMiss: L('후속 질문 또는 자료 요청 미완료', 'Follow-up or request incomplete')
      }
    },
    debrief: L('여러 자료가 서로 맞아도 한 구간이 비면 그 구간을 특정합니다. 결혼식 일정은 일관되고, 런던 이틀의 숙소 자료 하나만 요청하면 됩니다.', 'When most sources agree, pin down the one stretch that is not covered. The wedding plans are consistent; only the London booking needs to be requested.'),
    sources: ['GB-VISIT', 'GB-RULES']
  },

  // ── SIM-GB-12 · two business letters that do not agree ────────────────────
  {
    id: 'SIM-GB-12', countryId: 'GB', personId: 'SIM-GB-P12', name: 'Farid Lowell',
    difficulty: 'advanced', category: 'complex',
    title: L('맞지 않는 두 서신', 'Two letters that disagree'),
    brief: L('맨체스터 도착 창구. 고용주 서신과 방문처 서신이 방문 기간과 내용을 다르게 적고 있고, 귀국편은 최근에 변경됐습니다.', 'Manchester arrivals desk. The employer letter and the host company letter give different dates and activities, and the return flight was recently changed.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('고객사 회의', 'Client meetings') },
      { label: L('진술한 체류 기간', 'Stated length of stay'), value: L('2026-12-07 ~ 2026-12-12', '7–12 December 2026') },
      { label: L('제출 자료', 'Submitted'), value: L('고용주 서신 · 방문처 서신 · 귀국 항공권', 'Employer letter · host company letter · return ticket') }
    ],
    opening: L('안녕하세요. 고객사와 회의가 있어서 출장 왔습니다.', 'Hello. I am here on a business trip for meetings with a client.'),
    documents: [
      { id: 'SIM-GB-12-DOC1', title: L('고용주 서신', 'Employer letter'), pages: [L('Brightmoor Engineering (가상) · 2026-10-18: Farid Lowell(여권 끝자리 6604)은 12-07 ~ 12-11 Haldane Rail Systems와 고객 회의에 참석하고 12-12 귀국합니다. 급여는 당사가 지급합니다.', 'Brightmoor Engineering (fictional) · 18 Oct 2026: Farid Lowell (passport ending 6604) attends client meetings with Haldane Rail Systems, 7–11 Dec, returning 12 Dec. He remains on our payroll.'), NOTICE] },
      { id: 'SIM-GB-12-DOC2', title: L('방문처 서신', 'Host company letter'), pages: [L('Haldane Rail Systems (가상) · 2026-10-20: Farid Lowell을 12-07 ~ 12-18 당사 프로젝트팀에 배치하며 매일 현장 근무합니다. 협약 번호 HRS-PL-118.', 'Haldane Rail Systems (fictional) · 20 Oct 2026: we welcome Farid Lowell to a placement with our project team, 7–18 Dec, on site daily. Agreement ref HRS-PL-118.')] },
      { id: 'SIM-GB-12-DOC3', title: L('귀국 항공권', 'Return ticket'), pages: [L('2026-12-12 18:40 맨체스터 출발', 'Departs Manchester 2026-12-12 18:40')] }
    ],
    records: [
      { id: 'SIM-GB-12-REC1', title: L('이전 방문 기록', 'Previous visit record'), detail: L('2026-06-15 ~ 06-18 방문 · 진술한 목적: Haldane Rail Systems 회의 · 예정대로 출국.', 'Visit 15–18 June 2026 · stated purpose: meetings with Haldane Rail Systems · departed as booked.'), documentId: 'SIM-GB-12-DOC1' },
      { id: 'SIM-GB-12-REC2', title: L('귀국 예약 변경 기록', 'Return booking change record'), detail: L('2026-11-02 변경: 귀국일 2026-12-19 → 2026-12-12. 최초 예약 2026-10-15.', 'Changed 2026-11-02: return moved from 2026-12-19 to 2026-12-12. Originally booked 2026-10-15.'), documentId: 'SIM-GB-12-DOC3' }
    ],
    facts: [
      { id: 'SIM-GB-12-F-EMPLOYER', sourceType: 'document', sourceId: 'SIM-GB-12-DOC1', page: 0, label: L('고용주 서신(10-18): 회의 12-07 ~ 12-11, 12-12 귀국', 'Employer letter (18 Oct): meetings 7–11 Dec, return 12 Dec') },
      { id: 'SIM-GB-12-F-HOSTCO', sourceType: 'document', sourceId: 'SIM-GB-12-DOC2', page: 0, label: L('방문처 서신(10-20): 프로젝트팀 배치 12-07 ~ 12-18, 매일 현장', 'Host letter (20 Oct): project-team placement 7–18 Dec, on site daily') },
      { id: 'SIM-GB-12-F-TICKET', sourceType: 'document', sourceId: 'SIM-GB-12-DOC3', page: 0, label: L('항공권: 12-12 귀국', 'Ticket: return 12 Dec') },
      { id: 'SIM-GB-12-F-PREV', sourceType: 'record', sourceId: 'SIM-GB-12-REC1', label: L('이전 방문: 2026-06 회의, 예정대로 출국', 'Previous visit: June 2026 meetings, departed as booked') },
      { id: 'SIM-GB-12-F-CHANGE', sourceType: 'record', sourceId: 'SIM-GB-12-REC2', label: L('예약 변경: 11-02에 귀국일 12-19 → 12-12', 'Booking change: on 2 Nov, return moved from 19 Dec to 12 Dec') },
      { id: 'SIM-GB-12-F-STMT', sourceType: 'statement', sourceId: 'SIM-GB-12-STMT', questionIds: ['gb12_purpose'], label: L('진술: 고객사 회의에 참석하고 12일에 귀국한다', 'Statement: attending client meetings and returning on the 12th') },
      { id: 'SIM-GB-12-F-WHY', sourceType: 'statement', sourceId: 'SIM-GB-12-STMT-WHY', questionIds: ['gb12_letters', 'gb12_original'], label: L('진술: 11월 초 계획이 바뀌어 회의만 하고 돌아가기로 했다', 'Statement: plans changed in early November to meetings only') }
    ],
    questions: [
      { id: 'gb12_purpose', q: L('방문 목적을 말씀해 주세요.', 'What is the purpose of your visit?'), answer: L('Haldane Rail Systems와 고객 회의에 참석합니다. 12일에 돌아갑니다.', 'I am attending client meetings with Haldane Rail Systems. I go back on the 12th.') },
      { id: 'gb12_costs', q: L('출장 비용과 급여는 누가 부담합니까?', 'Who pays for the trip and your salary?'), answer: L('회사 출장이라 제 회사가 냅니다. 급여도 회사에서 받습니다.', 'It is a work trip, so my employer pays. My salary comes from them as well.') },
      { id: 'gb12_previous', q: L('이전에 오신 적이 있습니까?', 'Have you visited before?'), answer: L('6월에 같은 회사와 회의하러 나흘 왔습니다.', 'In June, for four days of meetings with the same company.') },
      { id: 'gb12_letters', q: L('방문처 서신에는 18일까지 프로젝트팀 배치로 적혀 있습니다.', 'The host company letter describes a project-team placement until the 18th.'), answer: L('원래는 더 길게 있을 계획이었는데, 11월 초에 계획이 바뀌어서 회의만 하고 돌아가기로 했습니다.', 'At first I was meant to stay longer, but plans changed in early November and it became meetings only.') },
      { id: 'gb12_original', q: L('귀국편이 11월 2일에 19일에서 12일로 변경됐습니다. 왜 바꾸셨습니까?', 'Your return was moved from the 19th to the 12th on 2 November. Why?'), answer: L('말씀드린 대로 11월 초에 계획이 바뀌어서 회의만 하고 돌아가기로 했습니다. 방문처 서신은 그 전에 받은 거라 고치지 않았습니다.', 'As I said, plans changed in early November to meetings only. The host letter came before that, so it was never updated.') }
    ],
    comparisons: [
      { id: 'COMP-GB-12-LETTERS', facts: ['SIM-GB-12-F-EMPLOYER', 'SIM-GB-12-F-HOSTCO'], type: 'CONFLICT', findingId: 'GB12_LETTERS_DIFFER', title: L('두 서신의 기간·내용 불일치', 'Letters differ on dates and activity'), explanation: L('고용주 서신은 12월 7~11일 회의와 12일 귀국, 방문처 서신은 12월 7~18일 프로젝트팀 배치입니다.', 'The employer letter says meetings 7–11 December and return on the 12th; the host letter says a project-team placement 7–18 December.'), unlocks: { questions: ['gb12_letters'] } },
      { id: 'COMP-GB-12-TICKET', facts: ['SIM-GB-12-F-TICKET', 'SIM-GB-12-F-EMPLOYER'], type: 'MATCH', findingId: 'GB12_TICKET_FITS_EMPLOYER_LETTER', title: L('항공권과 고용주 서신 부합', 'Ticket fits the employer letter'), explanation: L('현재 항공권의 12일 귀국은 고용주 서신과 같습니다.', 'The current ticket\'s 12 December return matches the employer letter.') },
      { id: 'COMP-GB-12-ORIGINAL', facts: ['SIM-GB-12-F-CHANGE', 'SIM-GB-12-F-HOSTCO'], type: 'MATCH', findingId: 'GB12_ORIGINAL_RETURN_FITS_HOST', title: L('최초 귀국일은 방문처 서신과 부합', 'Original return fits the host letter'), explanation: L('10월에 예약한 최초 귀국일 19일은 18일까지라는 방문처 서신과 맞습니다. 귀국일은 11월 2일에야 12일로 바뀌었습니다.', 'The original 19 December return, booked in October, fits a placement to the 18th. It was moved to the 12th only on 2 November.'), unlocks: { questions: ['gb12_original'] } },
      { id: 'COMP-GB-12-TIMING', facts: ['SIM-GB-12-F-WHY', 'SIM-GB-12-F-EMPLOYER'], type: 'CONFLICT', findingId: 'GB12_TIMING_DOES_NOT_FIT', title: L('설명한 시점과 고용주 서신 불일치', 'Timeline does not fit the employer letter'), explanation: L('계획이 11월 초에 바뀌었다고 했지만, 10월 18일자 고용주 서신은 이미 12일 귀국으로 적혀 있었습니다. 그때 항공권은 아직 19일이었습니다.', 'He says plans changed in early November, but the employer letter of 18 October already gave a 12 December return, while the ticket still said the 19th.') },
      { id: 'COMP-GB-12-PREVIOUS', facts: ['SIM-GB-12-F-PREV', 'SIM-GB-12-F-STMT'], type: 'MATCH', findingId: 'GB12_PREVIOUS_VISIT_CONSISTENT', title: L('이전 방문과 진술 부합', 'Previous visit consistent'), explanation: L('6월 방문도 같은 회사와의 회의였고 예정대로 출국했습니다. 다만 이전 방문은 이번 서신들의 차이를 설명하지 않습니다.', 'The June visit was also for meetings with the same company and ended as booked. It does not explain the difference between these letters.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('항공권은 고용주 서신과 맞지만, 방문처 서신은 여전히 다른 기간과 내용을 적고 있고, 설명한 시점도 고용주 서신 날짜와 맞지 않습니다. 닫으면 서로 모순되는 서신 두 통이 남습니다.', 'The ticket fits the employer letter, but the host letter still gives different dates and activity, and his timeline does not fit the employer letter\'s date. Closing leaves two contradicting letters on file.'),
      evidence: L('지금 새 서신을 받아도 10월의 두 서신이 왜 달랐는지, 고용주 서신이 왜 변경 전부터 12일이었는지는 설명되지 않습니다. 누락이 아니라 상충입니다.', 'A fresh letter now would not explain why the October letters disagree, or why the employer letter gave 12 December before the stated change. This is a conflict, not a missing document.'),
      review: L('맞습니다. 두 서신, 예약 변경, 설명한 시점을 출처별로 기록하고 추가 검토(모의)로 넘깁니다. 이 연습은 어떤 활동이 허용되는지 판단하지 않으며, 이전 방문이 이번 사안을 정리해 주지도 않습니다.', 'Correct. Record the two letters, the booking change and his timeline by source, and refer for further examination (simulated). This exercise does not decide whether any activity is permitted, and the earlier visit does not settle this one.')
    },
    assessment: {
      issue: ['GB12_LETTERS_DIFFER'],
      distinguish: ['GB12_TICKET_FITS_EMPLOYER_LETTER', 'GB12_PREVIOUS_VISIT_CONSISTENT'],
      resolve: { findings: ['GB12_ORIGINAL_RETURN_FITS_HOST', 'GB12_TIMING_DOES_NOT_FIT'], questions: ['gb12_letters', 'gb12_original'], requests: [] },
      feedback: {
        issueHit: L('두 서신의 상충 확인', 'Conflicting letters identified'), issueMiss: L('고용주 서신과 방문처 서신 미대조', 'Employer and host letters not compared'),
        resolveHit: L('예약 변경과 설명 시점까지 대조', 'Booking change and timeline compared'), resolveMiss: L('변경 기록 또는 시점 대조 미완료', 'Booking change or timeline not compared')
      }
    },
    debrief: L('맞는 자료(항공권, 이전 방문)가 있어도 두 서신의 상충과 시점 불일치는 남습니다. 각 출처를 기록하고 추가 검토로 넘깁니다. 허용 여부는 판단하지 않습니다.', 'Consistent items (the ticket, the earlier visit) do not remove the conflict between the letters or the timeline mismatch. Record each source and refer for further review, without judging permissibility.'),
    sources: ['GB-RULES', 'GB-VISIT', 'GB-ACT']
  }
];
