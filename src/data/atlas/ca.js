// Canada · authored synthetic exercises (v11 scenario contract, docs/v11/SCENARIO_SCHEMA.md).
// Fictional people and records. Outcomes are SIMULATION_RULE feedback, never a legal determination.
const L = (ko, en) => ({ ko, en });
const NOTICE = L('합성 문서 · 보안특징 및 진위 판별 기능 없음', 'Synthetic document · no security-feature or authenticity checking');

export const CASES = [
  {
    id: 'SIM-CA-01', countryId: 'CA', personId: 'SIM-CA-P01', name: 'Avery Morgan',
    difficulty: 'intro', category: 'record',
    title: L('방문 기록의 날짜', 'Visit dates'),
    brief: L('항공권은 11월 12일 출국으로 되어 있으나 방문 기록에는 11월 21일로 기재되어 있습니다.', 'The ticket shows departure on 12 November; the visit record says 21 November.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('가족 방문', 'Family visit') },
      { label: L('제출 자료', 'Submitted'), value: L('항공권 · 방문 기록', 'Ticket · visit record') }
    ],
    opening: L('안녕하세요. 가족을 만나러 왔습니다.', 'Hello. I am here to visit family.'),
    documents: [
      { id: 'SIM-CA-01-DOC1', title: L('제출 자료', 'Submitted evidence'), pages: [L('항공권: 출국 2026-11-12', 'Ticket: departure 2026-11-12'), NOTICE] },
      { id: 'SIM-CA-01-DOC2', title: L('연결 기록', 'Linked record'), pages: [L('방문 기록: 출국 2026-11-21', 'Visit record: departure 2026-11-21')] }
    ],
    records: [
      { id: 'SIM-CA-01-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('항공권: 출국 2026-11-12', 'Ticket: departure 2026-11-12'), documentId: 'SIM-CA-01-DOC1' },
      { id: 'SIM-CA-01-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('방문 기록: 출국 2026-11-21', 'Visit record: departure 2026-11-21'), documentId: 'SIM-CA-01-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-01-F-TICKET', sourceType: 'document', sourceId: 'SIM-CA-01-DOC1', page: 0, label: L('항공권: 출국 2026-11-12', 'Ticket: departure 2026-11-12') },
      { id: 'SIM-CA-01-F-VISIT', sourceType: 'document', sourceId: 'SIM-CA-01-DOC2', page: 0, label: L('방문 기록: 출국 2026-11-21', 'Visit record: departure 2026-11-21') },
      { id: 'SIM-CA-01-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-01-STMT', label: L('진술: 방문 기록 작성 시 날짜 오기 (12일 정류)', 'Statement: Transposed date on visit record'), questionIds: ['clarify_dates', 'clarify'] }
    ],
    questions: [
      { id: 'clarify', q: L('자료와 기록의 차이를 설명해 주세요.', 'Please explain the relationship between these records.'), answer: L('기록을 작성할 때 날짜를 뒤집어 적었습니다. 항공권의 11월 12일이 맞습니다.', 'I transposed the date when writing the visit record. The ticket date, 12 November, is correct.') },
      { id: 'source', q: L('어느 자료를 확인하면 됩니까?', 'Which evidence should we check?'), answer: L('현재 접수된 제출 자료와 연결 기록을 함께 확인해 주세요.', 'Please compare the submitted evidence with the linked record.') },
      { id: 'crosscheck', q: L('방문 기록과 항공권의 출국일 중 어느 쪽이 맞습니까?', 'Which departure date is correct, the ticket or the visit record?'), answer: L('항공권의 11월 12일이 맞습니다. 방문 기록은 작성할 때 날짜를 잘못 적었습니다.', 'The ticket date of 12 November is correct; the visit record had the date transposed.') },
      { id: 'clarify_dates', q: L('방문 기록과 항공권 출국일이 다른 이유는 무엇입니까?', 'Why do departure dates differ?'), answer: L('12일과 21일을 뒤집어 적었습니다. 항공권 11월 12일이 맞습니다.', 'I transposed 12 and 21. Ticket 12 Nov is correct.') }
    ],
    comparisons: [
      { id: 'COMP-CA-01-DATES', facts: ['SIM-CA-01-F-TICKET', 'SIM-CA-01-F-VISIT'], type: 'CONFLICT', findingId: 'CA01_DATE_CONFLICT', title: L('출국일 불일치', 'Date conflict'), explanation: L('항공권(11-12)과 방문기록(11-21) 상충.', 'Ticket (12 Nov) contradicts visit record (21 Nov).'), unlocks: { questions: ['clarify_dates'] } },
      { id: 'COMP-CA-01-TICKET-STMT', facts: ['SIM-CA-01-F-TICKET', 'SIM-CA-01-F-STMT'], type: 'MATCH', findingId: 'CA01_TICKET_MATCHES_STMT', title: L('항공권과 진술 일치', 'Ticket matches statement'), explanation: L('항공권 출국일과 오기 진술 부합.', 'Ticket supports statement.') },
      { id: 'COMP-CA-01-VISIT-STMT', facts: ['SIM-CA-01-F-VISIT', 'SIM-CA-01-F-STMT'], type: 'UNVERIFIED', findingId: 'CA01_RECORD_UNAMENDED', title: L('방문 기록 미정정', 'Record unamended'), explanation: L('진술만으로 기록 미정정.', 'Statement does not amend record.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('진술이 항공권과 맞더라도 방문 기록 자체는 정정되지 않았습니다. 상충 기록을 남긴 채 검토를 닫으면 안 됩니다.', 'The statement fits the ticket, but the visit record itself is unamended. Closing the review leaves a conflicting record behind.'),
      evidence: L('필요한 자료는 이미 접수되어 있습니다. 문제는 누락이 아니라 기록 간 상충입니다.', 'The needed documents are already on file. The issue is a conflict between records, not missing evidence.'),
      review: L('두 원문을 보존하고 기록 정정 여부를 추가 검토로 넘기는 것이 근거와 맞습니다.', 'Retaining both sources and referring the record correction for further review matches the evidence.')
    },
    assessment: {
      issue: ['CA01_DATE_CONFLICT'],
      distinguish: ['CA01_RECORD_UNAMENDED', 'CA01_TICKET_MATCHES_STMT'],
      resolve: { findings: ['CA01_TICKET_MATCHES_STMT'], questions: ['clarify_dates', 'clarify'], requests: [] },
      feedback: {
        issueHit: L('출국일 상충 확인', 'Date conflict confirmed'), issueMiss: L('출국일 불일치 미확인', 'Date conflict missed'),
        resolveHit: L('날짜 오기 진술 검증', 'Statement verified'), resolveMiss: L('진술 대조 미완료', 'Follow-up comparison incomplete')
      }
    },
    debrief: L('진술만으로 기록의 날짜가 수정되지는 않았습니다. 두 원문을 남기고 추가 대조를 요청합니다.', 'The explanation does not amend the record. Retain both sources and request further review.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-02', countryId: 'CA', personId: 'SIM-CA-P02', name: 'Jordan Ellis',
    difficulty: 'standard', category: 'accommodation',
    title: L('누락된 숙박 확인', 'Missing accommodation evidence'),
    brief: L('방문 계획에는 친구 집에 머문다고 적혀 있지만 제출 자료에 숙박 확인이 없습니다.', 'The visit plan mentions staying with a friend, but no accommodation confirmation is supplied.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친구 방문 · 관광', 'Visiting a friend · sightseeing') },
      { label: L('예정 체류', 'Stated stay'), value: L('8일', 'Eight days') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 사본 · 방문 계획 · 왕복 항공권', 'Passport copy · visit plan · return ticket') }
    ],
    opening: L('안녕하세요. 토론토에 사는 친구를 만나러 왔습니다.', 'Hello. I am here to see a friend who lives in Toronto.'),
    documents: [
      { id: 'SIM-CA-02-DOC1', title: L('제출 자료', 'Submitted evidence'), pages: [L('방문 계획: 친구 집에서 8일 체류', 'Visit plan: eight days at a friend’s home'), NOTICE] },
      { id: 'SIM-CA-02-DOC2', title: L('연결 기록', 'Linked record'), pages: [L('제출 목록: 여권 사본, 방문 계획만 접수', 'Submission list: passport copy and visit plan only')] },
      { id: 'SIM-CA-02-DOC3', title: L('왕복 항공권', 'Return ticket'), pages: [L('탑승객 ELLIS/JORDAN · 토론토 도착 2026-11-18 · 귀국 2026-11-26', 'Passenger ELLIS/JORDAN · arrives Toronto 2026-11-18 · returns 2026-11-26')] }
    ],
    records: [
      { id: 'SIM-CA-02-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('방문 계획: 친구 집에서 8일 체류', 'Visit plan: eight days at a friend’s home'), documentId: 'SIM-CA-02-DOC1' },
      { id: 'SIM-CA-02-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('제출 목록: 여권 사본, 방문 계획만 접수', 'Submission list: passport copy and visit plan only'), documentId: 'SIM-CA-02-DOC2' },
      { id: 'SIM-CA-02-REC3', title: L('방문 계획 입력 내역', 'Visit plan entry detail'), detail: L('숙박 제공자: Priya Natarajan · 숙박지 주소 칸 공란 · 연락처 미기재', 'Host: Priya Natarajan · accommodation address field blank · no contact number'), documentId: 'SIM-CA-02-DOC1' }
    ],
    facts: [
      { id: 'SIM-CA-02-F-PLAN', sourceType: 'document', sourceId: 'SIM-CA-02-DOC1', page: 0, label: L('방문 계획: 친구 집에서 8일 체류', 'Visit plan: eight days at a friend’s home') },
      { id: 'SIM-CA-02-F-LIST', sourceType: 'document', sourceId: 'SIM-CA-02-DOC2', page: 0, label: L('제출 목록: 여권 사본, 방문 계획만 접수 · 숙박 확인 없음', 'Submission list: passport copy and visit plan only · no accommodation confirmation') },
      { id: 'SIM-CA-02-F-TICKET', sourceType: 'document', sourceId: 'SIM-CA-02-DOC3', page: 0, label: L('항공권: 2026-11-18 도착 · 2026-11-26 귀국 (8일)', 'Ticket: arrives 2026-11-18 · returns 2026-11-26 (eight days)') },
      { id: 'SIM-CA-02-F-ADDR', sourceType: 'record', sourceId: 'SIM-CA-02-REC3', label: L('입력 내역: 숙박 제공자 이름만 있고 주소·연락처 없음', 'Entry detail: host name only, no address or contact') },
      { id: 'SIM-CA-02-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-02-STMT', questionIds: ['clarify'], label: L('진술: 초대 메시지를 아직 제출하지 않았습니다', 'Statement: I have not submitted the invitation message yet') },
      { id: 'SIM-CA-02-F-REQ', sourceType: 'request', sourceId: 'SIM-CA-02-REQ-ACCOM', requestId: 'SIM-CA-02-REQ-ACCOM', label: L('보완 요청: 숙박 제공자의 숙박 확인(주소·기간) 제출 대기', 'Request: host’s accommodation confirmation (address and dates) awaited') }
    ],
    questions: [
      { id: 'clarify', q: L('자료와 기록의 차이를 설명해 주세요.', 'Please explain the relationship between these records.'), answer: L('초대 메시지를 아직 제출하지 않았습니다.', 'I have not submitted the invitation message yet.') },
      { id: 'source', q: L('어느 자료를 확인하면 됩니까?', 'Which evidence should we check?'), answer: L('현재 접수된 제출 자료와 연결 기록을 함께 확인해 주세요.', 'Please compare the submitted evidence with the linked record.') },
      { id: 'crosscheck', q: L('체류와 관련해 실제 제출된 서류는 무엇입니까?', 'Which documents were actually submitted about the stay?'), answer: L('여권 사본과 방문 계획, 항공권만 냈습니다. 숙박 확인은 따로 내지 않았습니다.', 'Only my passport copy, the visit plan and my ticket. I did not hand in a separate accommodation confirmation.') },
      { id: 'ca02_return', q: L('언제 돌아가십니까?', 'When are you returning?'), answer: L('11월 26일 비행기로 돌아갑니다.', 'I fly back on 26 November.') },
      { id: 'ca02_host', q: L('머무를 친구 집의 주소와 연락처를 알려 주시겠습니까?', 'Could you give me the address and phone number of the friend you are staying with?'), answer: L('친구 이름은 Priya Natarajan이고 토론토에 삽니다. 주소는 휴대전화 메시지에 있는데 정확한 번지는 지금 기억나지 않습니다.', 'My friend is Priya Natarajan and she lives in Toronto. The address is in a message on my phone, but I cannot remember the exact street number right now.') }
    ],
    comparisons: [
      { id: 'COMP-CA-02-PLAN-LIST', facts: ['SIM-CA-02-F-PLAN', 'SIM-CA-02-F-LIST'], type: 'MISSING', findingId: 'CA02_ACCOM_MISSING', title: L('숙박 확인 미제출', 'Accommodation confirmation not supplied'), explanation: L('방문 계획은 친구 집 숙박을 전제로 하지만 제출 목록에는 이를 확인하는 자료가 없습니다.', 'The visit plan relies on a stay at a friend’s home, but nothing on the submission list confirms it.'), unlocks: { questions: ['ca02_host'] } },
      { id: 'COMP-CA-02-PLAN-TICKET', facts: ['SIM-CA-02-F-PLAN', 'SIM-CA-02-F-TICKET'], type: 'MATCH', findingId: 'CA02_LENGTH_CONSISTENT', title: L('체류 기간 일치', 'Length of stay consistent'), explanation: L('방문 계획의 8일과 항공권의 도착·귀국일이 맞습니다. 쟁점은 기간이 아니라 숙박지입니다.', 'The eight days in the plan match the ticket dates. The open point is the accommodation, not the length of stay.') },
      { id: 'COMP-CA-02-ADDR-STMT', facts: ['SIM-CA-02-F-ADDR', 'SIM-CA-02-F-STMT'], type: 'UNVERIFIED', findingId: 'CA02_HOST_UNVERIFIED', title: L('숙박 제공자 미확인', 'Host details unverified'), explanation: L('입력 내역에는 이름만 있고, 초대 메시지는 아직 제출되지 않았습니다. 숙박지를 확인할 자료가 없습니다.', 'The entry gives only a name and the invitation message has not been supplied. Nothing yet confirms where the stay will be.'), unlocks: { requests: ['SIM-CA-02-REQ-ACCOM'] } },
      { id: 'COMP-CA-02-LIST-REQ', facts: ['SIM-CA-02-F-LIST', 'SIM-CA-02-F-REQ'], type: 'MISSING', findingId: 'CA02_REQUEST_SPECIFIED', title: L('보완 항목 특정', 'Missing item specified'), explanation: L('보완 요청이 빠진 자료(주소와 기간이 적힌 숙박 확인)를 구체적으로 지정했습니다. 제출 전까지 검토는 열려 있습니다.', 'The request names the missing item precisely: an accommodation confirmation with address and dates. The review stays open until it arrives.') }
    ],
    requests: [
      { id: 'SIM-CA-02-REQ-ACCOM', title: L('숙박 제공자의 숙박 확인(주소·기간 포함) 요청', 'Request host’s accommodation confirmation with address and dates'), result: L('요청 기록됨: Priya Natarajan 명의의 숙박 확인(주소·체류 기간 포함) 제출 대기.', 'Request logged: accommodation confirmation from Priya Natarajan, with address and dates of stay, awaited.') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('숙박지를 확인하는 자료가 하나도 없습니다. 주소조차 비어 있는 상태에서 검토를 닫을 수 없습니다.', 'Nothing confirms the accommodation; even the address is blank. The review cannot close with that gap.'),
      evidence: L('체류 기간은 항공권과 맞고 빠진 것은 숙박 확인 하나입니다. 그 자료를 구체적으로 요청하는 것이 근거와 맞습니다.', 'The stay length matches the ticket and the single gap is the accommodation confirmation. Requesting that specific item matches the evidence.'),
      review: L('서로 상충하는 자료는 없습니다. 자료가 빠진 것이지 모순이 있는 것이 아니므로 추가 검토로 넘길 근거가 부족합니다.', 'No two sources contradict each other. Something is missing rather than in conflict, so there is no basis for referral.')
    },
    assessment: {
      issue: ['CA02_ACCOM_MISSING'],
      distinguish: ['CA02_LENGTH_CONSISTENT'],
      resolve: { findings: ['CA02_HOST_UNVERIFIED', 'CA02_REQUEST_SPECIFIED'], questions: ['ca02_host', 'clarify'], requests: ['SIM-CA-02-REQ-ACCOM'] },
      feedback: {
        issueHit: L('숙박 확인 누락 확인', 'Missing accommodation evidence identified'), issueMiss: L('숙박 확인 누락 미확인', 'Missing accommodation evidence not identified'),
        resolveHit: L('보완 항목을 특정해 요청', 'Specific missing item requested'), resolveMiss: L('보완 항목 미특정', 'Missing item not specified or requested')
      }
    },
    debrief: L('누락된 자료가 무엇인지 구체적으로 기록하고 요청합니다. 자료 미제출 자체를 입국불허 결론으로 바꾸지 않습니다.', 'Specify and request the missing evidence. Missing evidence alone is not a legal refusal conclusion.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-03', countryId: 'CA', personId: 'SIM-CA-P03', name: 'Taylor Rowan',
    difficulty: 'intro', category: 'false-positive',
    title: L('같은 이름의 과거 기록', 'Same-name historical record'),
    brief: L('검색 결과의 과거 방문 기록은 현재 대상과 문서 식별자가 다릅니다.', 'A historical visit returned by the search has a different document identifier.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('관광', 'Sightseeing') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 현재 접수 자료', 'Passport · current submission') }
    ],
    opening: L('안녕하세요. 밴쿠버 관광을 하러 왔습니다.', 'Hello. I am here to see Vancouver.'),
    documents: [
      { id: 'SIM-CA-03-DOC1', title: L('제출 자료', 'Submitted evidence'), pages: [L('현재 대상: SIM-CA-P03 / 문서 SIM-CA-D03', 'Current person: SIM-CA-P03 / document SIM-CA-D03'), NOTICE] },
      { id: 'SIM-CA-03-DOC2', title: L('연결 기록', 'Linked record'), pages: [L('과거 동명이인: SIM-CA-P90 / 문서 SIM-CA-D90', 'Historical same-name person: SIM-CA-P90 / document SIM-CA-D90')] },
      { id: 'SIM-CA-03-DOC3', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 ROWAN, TAYLOR · 생년월일 1991-04-09 · 문서 SIM-CA-D03', 'Name ROWAN, TAYLOR · date of birth 1991-04-09 · document SIM-CA-D03')] }
    ],
    records: [
      { id: 'SIM-CA-03-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('현재 대상: SIM-CA-P03 / 문서 SIM-CA-D03', 'Current person: SIM-CA-P03 / document SIM-CA-D03'), documentId: 'SIM-CA-03-DOC1' },
      { id: 'SIM-CA-03-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('과거 동명이인: SIM-CA-P90 / 문서 SIM-CA-D90', 'Historical same-name person: SIM-CA-P90 / document SIM-CA-D90'), documentId: 'SIM-CA-03-DOC2' },
      { id: 'SIM-CA-03-REC3', title: L('과거 기록 상세', 'Historical record detail'), detail: L('SIM-CA-P90 · 생년월일 1978-12-02 · 문서 SIM-CA-D90 · 2019-06 방문', 'SIM-CA-P90 · date of birth 1978-12-02 · document SIM-CA-D90 · visit 2019-06'), documentId: 'SIM-CA-03-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-03-F-CUR', sourceType: 'document', sourceId: 'SIM-CA-03-DOC1', page: 0, label: L('현재 접수: SIM-CA-P03 / 문서 SIM-CA-D03', 'Current submission: SIM-CA-P03 / document SIM-CA-D03') },
      { id: 'SIM-CA-03-F-HIST', sourceType: 'document', sourceId: 'SIM-CA-03-DOC2', page: 0, label: L('과거 동명이인: SIM-CA-P90 / 문서 SIM-CA-D90', 'Historical same-name record: SIM-CA-P90 / document SIM-CA-D90') },
      { id: 'SIM-CA-03-F-PASS', sourceType: 'document', sourceId: 'SIM-CA-03-DOC3', page: 0, label: L('여권: 생년월일 1991-04-09 · 문서 SIM-CA-D03', 'Passport: date of birth 1991-04-09 · document SIM-CA-D03') },
      { id: 'SIM-CA-03-F-HIST-DOB', sourceType: 'record', sourceId: 'SIM-CA-03-REC3', label: L('과거 기록: 생년월일 1978-12-02 · 문서 SIM-CA-D90', 'Historical record: date of birth 1978-12-02 · document SIM-CA-D90') },
      { id: 'SIM-CA-03-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-03-STMT', questionIds: ['clarify'], label: L('진술: 그 방문 기록은 제 것이 아닙니다', 'Statement: That visit is not mine') }
    ],
    questions: [
      { id: 'clarify', q: L('자료와 기록의 차이를 설명해 주세요.', 'Please explain the relationship between these records.'), answer: L('그 방문 기록은 제 것이 아닙니다. 제 문서 식별자는 현재 접수 자료와 같습니다.', 'That visit is not mine. My document identifier matches the current submission.') },
      { id: 'source', q: L('어느 자료를 확인하면 됩니까?', 'Which evidence should we check?'), answer: L('현재 접수된 제출 자료와 연결 기록을 함께 확인해 주세요.', 'Please compare the submitted evidence with the linked record.') },
      { id: 'crosscheck', q: L('현재 대상과 과거 동명이인의 문서 식별자는 일치합니까?', 'Do the document identifiers match for the current person and same-name record?'), answer: L('제 문서는 SIM-CA-D03입니다. 그 기록의 문서 번호는 제 것이 아닙니다.', 'My document is SIM-CA-D03. The document number on that record is not mine.') },
      { id: 'ca03_prior', q: L('이전에 캐나다를 방문한 적이 있습니까?', 'Have you visited Canada before?'), answer: L('이번이 첫 캐나다 방문입니다.', 'This is my first visit to Canada.') }
    ],
    comparisons: [
      { id: 'COMP-CA-03-IDS', facts: ['SIM-CA-03-F-CUR', 'SIM-CA-03-F-HIST'], type: 'CONFLICT', findingId: 'CA03_IDS_DIFFER', title: L('사람·문서 식별자 상이', 'Person and document identifiers differ'), explanation: L('이름은 같지만 사람 식별자(P03/P90)와 문서 식별자(D03/D90)가 모두 다릅니다.', 'The names are the same, but both the person identifier (P03/P90) and the document identifier (D03/D90) differ.'), unlocks: { questions: ['ca03_prior'] } },
      { id: 'COMP-CA-03-DOB', facts: ['SIM-CA-03-F-PASS', 'SIM-CA-03-F-HIST-DOB'], type: 'CONFLICT', findingId: 'CA03_DOB_DIFFER', title: L('생년월일 상이', 'Dates of birth differ'), explanation: L('여권 생년월일(1991-04-09)과 과거 기록 생년월일(1978-12-02)이 다릅니다. 같은 사람의 기록으로 볼 근거가 없습니다.', 'The passport date of birth (1991-04-09) and the historical record (1978-12-02) differ. Nothing links the two records to one person.') },
      { id: 'COMP-CA-03-CUR-PASS', facts: ['SIM-CA-03-F-CUR', 'SIM-CA-03-F-PASS'], type: 'MATCH', findingId: 'CA03_CURRENT_MATCHES', title: L('현재 접수와 여권 일치', 'Current submission matches passport'), explanation: L('현재 접수 자료의 문서 식별자 SIM-CA-D03이 여권과 같습니다.', 'The current submission carries document SIM-CA-D03, the same as the passport.') },
      { id: 'COMP-CA-03-STMT', facts: ['SIM-CA-03-F-STMT', 'SIM-CA-03-F-HIST-DOB'], type: 'MATCH', findingId: 'CA03_STMT_SUPPORTED', title: L('진술이 기록과 부합', 'Statement supported by records'), explanation: L('과거 기록의 생년월일과 문서가 현재 대상과 다르므로 “제 기록이 아니다”라는 진술과 맞습니다.', 'The historical record’s date of birth and document differ from the current person, which fits the statement that the visit is not theirs.') }
    ],
    requests: [],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('문서 식별자와 생년월일이 모두 달라 과거 기록은 다른 사람의 것입니다. 남은 쟁점이 없으므로 연습상 검토를 완료합니다.', 'Both the document identifier and the date of birth differ, so the historical record belongs to someone else. Nothing is outstanding and the exercise review can close.'),
      evidence: L('필요한 식별 자료는 이미 모두 있습니다. 추가 자료를 요구할 이유가 없습니다.', 'All the identifying evidence needed is already on file. There is no reason to ask for more.'),
      review: L('이름이 같다는 것만으로는 상충이 아닙니다. 식별자가 기록을 분리하므로 추가 검토로 넘길 쟁점이 남지 않습니다.', 'A shared name is not a conflict. The identifiers separate the records, so no issue remains for referral.')
    },
    assessment: {
      issue: ['CA03_IDS_DIFFER'],
      distinguish: ['CA03_STMT_SUPPORTED'],
      resolve: { findings: ['CA03_DOB_DIFFER', 'CA03_CURRENT_MATCHES'], questions: ['clarify', 'ca03_prior'], requests: [] },
      feedback: {
        issueHit: L('동명이인 기록 식별자 차이 확인', 'Same-name identifier difference found'), issueMiss: L('식별자 대조 미실시', 'Identifiers not compared'),
        resolveHit: L('생년월일·문서로 기록 분리', 'Records separated by date of birth and document'), resolveMiss: L('기록 분리 근거 미확인', 'Separation of records not established')
      }
    },
    debrief: L('문서 식별자와 생년월일로 기록을 분리했습니다. 이름이 같다는 것은 근거가 아닙니다. 연습상 검토 완료이며 실제 입국허가를 뜻하지 않습니다.', 'The document identifier and date of birth separate the records; a shared name is not evidence. Completing this exercise does not grant entry.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-04', countryId: 'CA', personId: 'SIM-CA-P04', name: 'Kseniia Volkova',
    difficulty: 'intro', category: 'identity',
    title: L('항공권과 여권의 이름 표기', 'Name spelling on ticket and passport'),
    brief: L('항공권 탑승객 이름은 XENIA, 여권 이름은 KSENIIA로 되어 있습니다. 같은 사람인지 확인이 필요합니다.', 'The ticket names the passenger XENIA; the passport reads KSENIIA. Confirm whether both refer to the same person.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친구의 전시회 관람 · 관광', 'Friend’s exhibition · sightseeing') },
      { label: L('예정 체류', 'Stated stay'), value: L('11일', 'Eleven days') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 왕복 항공권', 'Passport · return ticket') }
    ],
    opening: L('안녕하세요. 토론토에서 열리는 친구 전시회를 보러 왔습니다.', 'Hello. I have come to see a friend’s exhibition in Toronto.'),
    documents: [
      { id: 'SIM-CA-04-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 VOLKOVA, KSENIIA · 생년월일 1994-02-17 · 여권번호 SIMCA04P5521', 'Name VOLKOVA, KSENIIA · date of birth 1994-02-17 · passport no. SIMCA04P5521'), NOTICE] },
      { id: 'SIM-CA-04-DOC2', title: L('왕복 항공권', 'Return ticket'), pages: [L('탑승객 VOLKOVA/XENIA MS · 예약번호 SIMCA04Q7 · 도착 2026-11-09 · 귀국 2026-11-20', 'Passenger VOLKOVA/XENIA MS · booking SIMCA04Q7 · arrives 2026-11-09 · returns 2026-11-20')] }
    ],
    records: [
      { id: 'SIM-CA-04-REC1', title: L('예약 상세 조회', 'Booking detail'), detail: L('예약 SIMCA04Q7 · 탑승객 여행서류: 여권번호 SIMCA04P5521 · 생년월일 1994-02-17', 'Booking SIMCA04Q7 · passenger travel document: passport no. SIMCA04P5521 · date of birth 1994-02-17'), documentId: 'SIM-CA-04-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-04-F-PASS-NAME', sourceType: 'document', sourceId: 'SIM-CA-04-DOC1', page: 0, label: L('여권 성명: KSENIIA VOLKOVA', 'Passport name: KSENIIA VOLKOVA') },
      { id: 'SIM-CA-04-F-PASS-ID', sourceType: 'document', sourceId: 'SIM-CA-04-DOC1', page: 0, label: L('여권: 번호 SIMCA04P5521 · 생년월일 1994-02-17', 'Passport: no. SIMCA04P5521 · date of birth 1994-02-17') },
      { id: 'SIM-CA-04-F-TICKET-NAME', sourceType: 'document', sourceId: 'SIM-CA-04-DOC2', page: 0, label: L('항공권 탑승객: XENIA VOLKOVA', 'Ticket passenger: XENIA VOLKOVA') },
      { id: 'SIM-CA-04-F-BOOKING-ID', sourceType: 'record', sourceId: 'SIM-CA-04-REC1', label: L('예약 상세: 여권번호 SIMCA04P5521 · 생년월일 1994-02-17', 'Booking detail: passport no. SIMCA04P5521 · date of birth 1994-02-17') },
      { id: 'SIM-CA-04-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-04-STMT', questionIds: ['ca04_spelling'], label: L('진술: 항공권은 제가 평소 쓰는 영문 이름으로 예약했습니다', 'Statement: I booked the ticket with the English spelling I normally use') }
    ],
    questions: [
      { id: 'ca04_purpose', q: L('방문 목적은 무엇입니까?', 'What is the purpose of your visit?'), answer: L('토론토에서 열리는 친구 전시회를 보고 시내를 둘러볼 예정입니다.', 'I am going to my friend’s exhibition in Toronto and will look around the city.') },
      { id: 'ca04_stay', q: L('얼마나 머무르십니까?', 'How long are you staying?'), answer: L('11월 20일까지 11일 동안 머뭅니다.', 'Eleven days, until 20 November.') },
      { id: 'ca04_booking', q: L('항공권은 누가 예약했습니까?', 'Who booked your ticket?'), answer: L('제가 항공사 웹사이트에서 직접 예약했습니다.', 'I booked it myself on the airline’s website.') },
      { id: 'ca04_spelling', q: L('항공권의 영문 이름이 여권과 다른 이유는 무엇입니까?', 'Why is the name on your ticket spelled differently from your passport?'), answer: L('항공권은 제가 평소 쓰는 영문 이름으로 예약했습니다. 여권은 다른 로마자 표기 방식을 따라서 KSENIIA로 되어 있습니다.', 'I booked the ticket with the English spelling I normally use. My passport follows a different romanisation, so it reads KSENIIA.') }
    ],
    comparisons: [
      { id: 'COMP-CA-04-NAME', facts: ['SIM-CA-04-F-PASS-NAME', 'SIM-CA-04-F-TICKET-NAME'], type: 'CONFLICT', findingId: 'CA04_NAME_SPELLING', title: L('이름 표기 차이', 'Name spelling differs'), explanation: L('여권은 KSENIIA, 항공권은 XENIA입니다. 성은 같지만 이름 표기가 다르므로 다른 식별자로 같은 사람인지 확인해야 합니다.', 'The passport reads KSENIIA and the ticket XENIA. The surname matches but the given name does not, so other identifiers must confirm whether this is one person.'), unlocks: { questions: ['ca04_spelling'] } },
      { id: 'COMP-CA-04-IDS', facts: ['SIM-CA-04-F-PASS-ID', 'SIM-CA-04-F-BOOKING-ID'], type: 'MATCH', findingId: 'CA04_IDENTIFIERS_MATCH', title: L('여권번호·생년월일 일치', 'Passport number and date of birth match'), explanation: L('예약에 등록된 여권번호와 생년월일이 제시된 여권과 같습니다. 예약은 이 여권 소지인의 것입니다.', 'The passport number and date of birth held on the booking are those of the passport presented. The booking belongs to this passport holder.') },
      { id: 'COMP-CA-04-STMT', facts: ['SIM-CA-04-F-TICKET-NAME', 'SIM-CA-04-F-STMT'], type: 'MATCH', findingId: 'CA04_SPELLING_EXPLAINED', title: L('표기 차이 설명', 'Spelling difference explained'), explanation: L('진술은 항공권 표기가 평소 쓰는 영문 이름이라고 설명하며, 같은 이름의 다른 로마자 표기와 부합합니다.', 'The statement explains the ticket spelling as the English form the traveller uses, which fits a different romanisation of the same name.') }
    ],
    requests: [],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('예약에 등록된 여권번호와 생년월일이 여권과 같습니다. 이름 차이는 로마자 표기 차이로 확인되었고 남은 쟁점이 없습니다.', 'The booking holds the same passport number and date of birth as the passport. The name difference is a romanisation variant and nothing remains outstanding.'),
      evidence: L('예약 상세 기록이 이미 두 자료를 연결합니다. 추가 자료가 필요하지 않습니다.', 'The booking detail already links the two documents. No further evidence is needed.'),
      review: L('식별자가 일치하므로 상충이 해소되었습니다. 표기 변형만으로 추가 검토로 넘기는 것은 근거가 없습니다.', 'The matching identifiers resolve the difference. A spelling variant alone gives no basis for referral.')
    },
    assessment: {
      issue: ['CA04_NAME_SPELLING'],
      distinguish: ['CA04_SPELLING_EXPLAINED'],
      resolve: { findings: ['CA04_IDENTIFIERS_MATCH'], questions: ['ca04_spelling'], requests: [] },
      feedback: {
        issueHit: L('이름 표기 차이 확인', 'Name spelling difference identified'), issueMiss: L('이름 표기 차이 미확인', 'Name spelling difference missed'),
        resolveHit: L('여권번호·생년월일로 동일인 확인', 'Same person confirmed by passport number and date of birth'), resolveMiss: L('고유 식별자 대조 미실시', 'Unique identifiers not compared')
      }
    },
    debrief: L('이름 표기는 언어와 표기 방식에 따라 달라질 수 있습니다. 이름만 보지 말고 여권번호와 생년월일 같은 고유 식별자를 대조해 동일인임을 확인합니다. 연습상 검토 완료이며 실제 입국허가를 뜻하지 않습니다.', 'Name spellings vary with romanisation. Rather than relying on the name, compare unique identifiers such as passport number and date of birth. Completing this exercise does not grant entry.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-05', countryId: 'CA', personId: 'SIM-CA-P05', name: 'Ines Carvalho',
    difficulty: 'standard', category: 'requirements',
    title: L('eTA 기록과 새 여권번호', 'eTA record and a new passport number'),
    brief: L('제출한 eTA 확인 이메일의 여권번호가 현재 제시한 여권번호와 다릅니다. 기록 대조 연습이며 자격 여부는 판단하지 않습니다.', 'The passport number on the submitted eTA confirmation email differs from the passport presented. This is a record-matching exercise; eligibility is not assessed.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친척 방문', 'Visiting relatives') },
      { label: L('예정 체류', 'Stated stay'), value: L('2주', 'Two weeks') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · eTA 확인 이메일 사본', 'Passport · copy of eTA confirmation email') }
    ],
    opening: L('안녕하세요. 밴쿠버에 사는 사촌을 만나러 왔습니다.', 'Hello. I am here to visit my cousin in Vancouver.'),
    documents: [
      { id: 'SIM-CA-05-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 CARVALHO, INES · 여권번호 SIMCA05N9032 · 발급일 2026-10-02', 'Name CARVALHO, INES · passport no. SIMCA05N9032 · issued 2026-10-02'), NOTICE] },
      { id: 'SIM-CA-05-DOC2', title: L('eTA 확인 이메일 사본', 'eTA confirmation email copy'), pages: [L('eTA 확인(2025-06-11 발송): 성명 INES CARVALHO · 연결 여권번호 SIMCA05N4471', 'eTA confirmation (sent 2025-06-11): name INES CARVALHO · linked passport no. SIMCA05N4471')] }
    ],
    records: [
      { id: 'SIM-CA-05-REC1', title: L('eTA 기록 대조(합성)', 'eTA record match (synthetic)'), detail: L('여권번호 SIMCA05N9032로 연결된 eTA 기록 없음 · SIMCA05N4471로 연결된 기록 1건', 'No eTA record linked to passport no. SIMCA05N9032 · one record linked to SIMCA05N4471'), documentId: 'SIM-CA-05-DOC2' },
      { id: 'SIM-CA-05-REC2', title: L('이전 방문 기록', 'Previous visit record'), detail: L('2025-07 방문 · INES CARVALHO · 여권번호 SIMCA05N4471', 'Visit 2025-07 · INES CARVALHO · passport no. SIMCA05N4471'), documentId: 'SIM-CA-05-DOC1' }
    ],
    facts: [
      { id: 'SIM-CA-05-F-PASS', sourceType: 'document', sourceId: 'SIM-CA-05-DOC1', page: 0, label: L('현재 여권: SIMCA05N9032 · 2026-10-02 발급', 'Current passport: SIMCA05N9032 · issued 2026-10-02') },
      { id: 'SIM-CA-05-F-EMAIL', sourceType: 'document', sourceId: 'SIM-CA-05-DOC2', page: 0, label: L('eTA 확인 이메일: 연결 여권번호 SIMCA05N4471', 'eTA confirmation email: linked passport no. SIMCA05N4471') },
      { id: 'SIM-CA-05-F-NOLINK', sourceType: 'record', sourceId: 'SIM-CA-05-REC1', label: L('기록 대조: 현재 여권번호에 연결된 eTA 기록 없음', 'Record match: no eTA record linked to the current passport number') },
      { id: 'SIM-CA-05-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-05-STMT', questionIds: ['ca05_renewal'], label: L('진술: 올해 10월에 여권을 새로 발급받았고 eTA 정보는 바꾸지 않았습니다', 'Statement: I got a new passport this October and did not update my eTA details') },
      { id: 'SIM-CA-05-F-REQ', sourceType: 'request', sourceId: 'SIM-CA-05-REQ-LINK', requestId: 'SIM-CA-05-REQ-LINK', label: L('보완 요청: 이전 여권 또는 여권 갱신 안내문 사본 제출 대기', 'Request: copy of previous passport or passport renewal notice awaited') }
    ],
    questions: [
      { id: 'ca05_purpose', q: L('방문 목적은 무엇입니까?', 'What is the purpose of your visit?'), answer: L('밴쿠버에 사는 사촌 집에서 2주 동안 지낼 예정입니다.', 'I will spend two weeks at my cousin’s home in Vancouver.') },
      { id: 'ca05_prior', q: L('이전에 캐나다를 방문한 적이 있습니까?', 'Have you visited Canada before?'), answer: L('작년 7월에 한 번 왔습니다.', 'Once, last July.') },
      { id: 'ca05_eta', q: L('eTA는 언제 신청하셨습니까?', 'When did you apply for your eTA?'), answer: L('작년 여름 방문 전에 신청했고 그때 확인 이메일을 받았습니다.', 'Before my visit last summer. That is when I received the confirmation email.') },
      { id: 'ca05_renewal', q: L('확인 이메일의 여권번호가 지금 여권과 다른 이유는 무엇입니까?', 'Why does the passport number in the email differ from your current passport?'), answer: L('올해 10월에 여권을 새로 발급받았고 eTA 정보는 바꾸지 않았습니다. 이전 여권은 집에 두고 왔습니다.', 'I got a new passport this October and did not update my eTA details. I left my old passport at home.') },
      { id: 'ca05_link', q: L('이전 여권과 새 여권의 관계를 보여 줄 자료를 제출할 수 있습니까?', 'Can you provide something that shows how your old and new passports relate?'), answer: L('이전 여권은 집에 있지만, 갱신할 때 받은 안내문이 이메일에 있어서 사본을 보낼 수 있습니다.', 'My old passport is at home, but the renewal notice I received is in my email, so I can send a copy.') }
    ],
    comparisons: [
      { id: 'COMP-CA-05-NUMBER', facts: ['SIM-CA-05-F-PASS', 'SIM-CA-05-F-EMAIL'], type: 'CONFLICT', findingId: 'CA05_NUMBER_MISMATCH', title: L('여권번호 불일치', 'Passport numbers differ'), explanation: L('eTA 확인 이메일은 SIMCA05N4471, 현재 여권은 SIMCA05N9032입니다. 현재 여권은 이메일보다 나중에 발급되었습니다.', 'The eTA email lists SIMCA05N4471; the current passport is SIMCA05N9032 and was issued after the email.'), unlocks: { questions: ['ca05_renewal'] } },
      { id: 'COMP-CA-05-NOLINK', facts: ['SIM-CA-05-F-PASS', 'SIM-CA-05-F-NOLINK'], type: 'MISSING', findingId: 'CA05_NO_LINK_CURRENT', title: L('현재 여권에 연결된 기록 없음', 'No record linked to current passport'), explanation: L('현재 여권번호로는 연결된 eTA 기록이 나오지 않습니다. 이 연습은 기록 연결만 확인하며 자격은 판단하지 않습니다.', 'No eTA record is linked to the current passport number. This exercise checks record links only, not eligibility.'), unlocks: { questions: ['ca05_link'], requests: ['SIM-CA-05-REQ-LINK'] } },
      { id: 'COMP-CA-05-STMT', facts: ['SIM-CA-05-F-EMAIL', 'SIM-CA-05-F-STMT'], type: 'UNVERIFIED', findingId: 'CA05_RENEWAL_UNDOCUMENTED', title: L('여권 갱신 진술 미확인', 'Renewal statement undocumented'), explanation: L('갱신 진술은 발급일과 맞지만, 두 여권번호가 같은 사람의 것임을 보여 주는 자료는 아직 없습니다.', 'The renewal account fits the issue date, but nothing on file yet shows both passport numbers belong to the same holder.') },
      { id: 'COMP-CA-05-REQ', facts: ['SIM-CA-05-F-NOLINK', 'SIM-CA-05-F-REQ'], type: 'MISSING', findingId: 'CA05_LINK_EVIDENCE_REQUESTED', title: L('연결 자료 요청', 'Link evidence requested'), explanation: L('두 여권번호를 연결하는 특정 자료를 요청했습니다. 접수 전까지 기록 연결은 확인되지 않은 상태로 남습니다.', 'A specific document linking the two passport numbers has been requested. Until it arrives, the link remains unconfirmed.') }
    ],
    requests: [
      { id: 'SIM-CA-05-REQ-LINK', title: L('이전 여권 또는 여권 갱신 안내문 사본 요청', 'Request a copy of the previous passport or the passport renewal notice'), result: L('요청 기록됨: 이전 여권(SIMCA05N4471) 또는 갱신 안내문 사본 제출 대기. 접수 후 두 여권번호의 연결을 대조합니다.', 'Request logged: copy of previous passport (SIMCA05N4471) or renewal notice awaited. The link between the two numbers will be compared on receipt.') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('현재 여권에 연결된 기록이 없고 두 번호를 잇는 자료도 없습니다. 연결이 확인되지 않은 채 검토를 닫을 수 없습니다.', 'No record is linked to the current passport and nothing links the two numbers. The review cannot close while the link is unconfirmed.'),
      evidence: L('설명은 그럴듯하지만 두 여권번호를 연결하는 자료가 빠져 있습니다. 그 자료를 특정해 요청하는 것이 근거와 맞습니다.', 'The explanation is plausible, but the document linking the two passport numbers is missing. Requesting that specific item matches the evidence.'),
      review: L('상충하는 진술이나 자료는 없습니다. 특정 자료 하나로 확인할 수 있는 공백이므로 추가 검토로 넘길 단계가 아닙니다.', 'No statements or documents contradict each other. A single specific document can close the gap, so referral is premature.')
    },
    assessment: {
      issue: ['CA05_NUMBER_MISMATCH', 'CA05_NO_LINK_CURRENT'],
      distinguish: ['CA05_RENEWAL_UNDOCUMENTED'],
      resolve: { findings: ['CA05_LINK_EVIDENCE_REQUESTED'], questions: ['ca05_renewal', 'ca05_link'], requests: ['SIM-CA-05-REQ-LINK'] },
      feedback: {
        issueHit: L('여권번호와 기록 연결 공백 확인', 'Number mismatch and missing link identified'), issueMiss: L('여권번호 대조 미실시', 'Passport numbers not compared'),
        resolveHit: L('연결 자료를 특정해 요청', 'Linking document requested'), resolveMiss: L('연결 자료 미요청', 'Linking document not requested')
      }
    },
    debrief: L('여권을 갱신하면 번호가 바뀌어 이전 기록과 연결되지 않을 수 있습니다. 설명만으로 기록을 연결하지 않고, 두 번호를 잇는 자료를 구체적으로 요청합니다. 이 연습은 eTA 자격이나 유효성을 판단하지 않습니다.', 'A renewed passport carries a new number that may not link to earlier records. Do not link records on an explanation alone; request the document that connects the numbers. This exercise does not decide eTA eligibility or validity.'),
    sources: ['CA-ETA', 'CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-06', countryId: 'CA', personId: 'SIM-CA-P06', name: 'Leon Abara',
    difficulty: 'standard', category: 'purpose',
    title: L('박람회 등록 유형', 'Trade fair registration type'),
    brief: L('바이어로 박람회를 참관한다고 했지만, 제출한 등록 확인서의 등록 유형을 대조해야 합니다.', 'The traveller says he is visiting a trade fair as a buyer. The registration type on the submitted confirmation needs to be compared.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('박람회 참관 · 공급사 미팅', 'Trade fair visit · supplier meetings') },
      { label: L('예정 체류', 'Stated stay'), value: L('5일', 'Five days') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 박람회 등록 확인서 · 회사 서신', 'Passport · fair registration · company letter') }
    ],
    opening: L('안녕하세요. 토론토 박람회에 참관하러 왔습니다.', 'Hello. I am here to visit a trade fair in Toronto.'),
    documents: [
      { id: 'SIM-CA-06-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 ABARA, LEON · 여권번호 SIMCA06K2280', 'Name ABARA, LEON · passport no. SIMCA06K2280'), NOTICE] },
      { id: 'SIM-CA-06-DOC2', title: L('박람회 등록 확인서', 'Fair registration confirmation'), pages: [L('가상 박람회 North Shore Home Expo 2026 · 등록자 Leon Abara · 등록 유형: 출품사 부스 직원(B14) · 2026-11-24–26', 'Fictional North Shore Home Expo 2026 · registrant Leon Abara · type: exhibitor booth staff (B14) · 2026-11-24–26')] },
      { id: 'SIM-CA-06-DOC3', title: L('회사 서신', 'Company letter'), pages: [L('2026-11-10 작성: Leon Abara는 구매 담당으로 박람회를 참관하고 공급사 미팅에 참석함', 'Dated 2026-11-10: Leon Abara, purchasing lead, will visit the fair and attend supplier meetings')] }
    ],
    records: [
      { id: 'SIM-CA-06-REC1', title: L('박람회 등록 내역(합성)', 'Fair registration detail (synthetic)'), detail: L('등록자 Leon Abara · 유형 출품사 부스 직원 · 2026-10-14 등록 · 변경 이력 없음', 'Registrant Leon Abara · type exhibitor booth staff · registered 2026-10-14 · no change history'), documentId: 'SIM-CA-06-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-06-F-REG', sourceType: 'document', sourceId: 'SIM-CA-06-DOC2', page: 0, label: L('등록 확인서: 출품사 부스 직원(B14)', 'Registration: exhibitor booth staff (B14)') },
      { id: 'SIM-CA-06-F-LETTER', sourceType: 'document', sourceId: 'SIM-CA-06-DOC3', page: 0, label: L('회사 서신: 구매 담당으로 참관·미팅 참석', 'Company letter: visiting as purchasing lead, attending meetings') },
      { id: 'SIM-CA-06-F-REC', sourceType: 'record', sourceId: 'SIM-CA-06-REC1', label: L('등록 내역: 부스 직원 · 변경 이력 없음', 'Registration detail: booth staff · no change history') },
      { id: 'SIM-CA-06-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-06-STMT', questionIds: ['ca06_purpose'], label: L('진술: 바이어로서 박람회를 둘러보고 공급사들과 미팅을 합니다', 'Statement: I will look around the fair as a buyer and meet suppliers') },
      { id: 'SIM-CA-06-F-STMT2', sourceType: 'statement', sourceId: 'SIM-CA-06-STMT2', questionIds: ['ca06_registration'], label: L('진술: 동료가 팀 전체를 한 번에 등록했습니다', 'Statement: A colleague registered the whole team at once') }
    ],
    questions: [
      { id: 'ca06_purpose', q: L('이번 방문 목적은 무엇입니까?', 'What is the purpose of this visit?'), answer: L('바이어로서 박람회를 둘러보고 공급사들과 미팅을 합니다.', 'I will look around the fair as a buyer and meet suppliers.') },
      { id: 'ca06_stay', q: L('얼마나 머무르십니까?', 'How long are you staying?'), answer: L('11월 23일에 도착해서 28일까지 닷새 머뭅니다.', 'I arrive on 23 November and stay five days, until the 28th.') },
      { id: 'ca06_company', q: L('어떤 일을 하십니까?', 'What do you do for work?'), answer: L('가정용 조명을 수입하는 회사에서 구매를 맡고 있습니다.', 'I handle purchasing for a company that imports home lighting.') },
      { id: 'ca06_registration', q: L('등록 확인서에는 출품사 부스 직원으로 되어 있습니다. 어떻게 된 일입니까?', 'The registration lists you as exhibitor booth staff. Can you explain that?'), answer: L('동료가 팀 전체를 한 번에 등록했습니다. 저는 부스에 있지 않고 미팅만 합니다.', 'A colleague registered the whole team at once. I will not be on the stand; I am only attending meetings.') }
    ],
    comparisons: [
      { id: 'COMP-CA-06-ROLE', facts: ['SIM-CA-06-F-REG', 'SIM-CA-06-F-STMT'], type: 'CONFLICT', findingId: 'CA06_ROLE_CONFLICT', title: L('등록 유형과 진술 상충', 'Registration type conflicts with statement'), explanation: L('진술은 바이어 참관이지만 등록 확인서는 출품사 부스 직원입니다.', 'The statement describes a buyer’s visit; the registration lists exhibitor booth staff.'), unlocks: { questions: ['ca06_registration'] } },
      { id: 'COMP-CA-06-DOCS', facts: ['SIM-CA-06-F-REG', 'SIM-CA-06-F-LETTER'], type: 'CONFLICT', findingId: 'CA06_DOCS_DISAGREE', title: L('두 제3자 자료 상충', 'Two third-party documents disagree'), explanation: L('박람회 주최 측 확인서와 회사 서신이 같은 사람의 역할을 다르게 적고 있습니다.', 'The organiser’s confirmation and the company letter describe the same person’s role differently.') },
      { id: 'COMP-CA-06-LETTER', facts: ['SIM-CA-06-F-LETTER', 'SIM-CA-06-F-STMT'], type: 'MATCH', findingId: 'CA06_LETTER_SUPPORTS_STMT', title: L('회사 서신과 진술 일치', 'Company letter matches statement'), explanation: L('회사 서신은 진술과 같이 참관과 미팅을 적고 있습니다. 그러나 주최 측 기록을 바꾸지는 못합니다.', 'The company letter, like the statement, describes a visit and meetings. It does not change the organiser’s record.') },
      { id: 'COMP-CA-06-REC', facts: ['SIM-CA-06-F-REC', 'SIM-CA-06-F-STMT2'], type: 'UNVERIFIED', findingId: 'CA06_EXPLANATION_UNSUPPORTED', title: L('등록 경위 미확인', 'Registration explanation unconfirmed'), explanation: L('일괄 등록 설명은 가능하지만 주최 측 등록 내역에는 변경 이력이 없고 유형도 그대로입니다. 이 데스크에서 확인할 수 없습니다.', 'A team registration is possible, but the organiser’s record shows no change and the same type. It cannot be confirmed at this desk.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('주최 측 기록과 회사 서신이 역할을 다르게 적고 있습니다. 상충이 남은 상태로 검토를 닫으면 한쪽 기록만 받아들이는 셈입니다.', 'The organiser’s record and the company letter describe the role differently. Closing now would accept one record and ignore the other.'),
      evidence: L('관련 자료는 이미 모두 있고 서로 상충합니다. 같은 회사의 서신을 하나 더 받아도 주최 측 기록은 바뀌지 않습니다.', 'The relevant documents are all on file and contradict each other. Another letter from the same company would not change the organiser’s record.'),
      review: L('두 제3자 자료가 역할을 다르게 적고, 설명은 기록으로 확인되지 않습니다. 원문을 모두 보존하고 추가 검토로 넘기는 것이 근거와 맞습니다.', 'Two third-party documents disagree on the role and the explanation is not borne out by the record. Retaining all sources and referring for further review matches the evidence.')
    },
    assessment: {
      issue: ['CA06_ROLE_CONFLICT', 'CA06_DOCS_DISAGREE'],
      distinguish: ['CA06_LETTER_SUPPORTS_STMT'],
      resolve: { findings: ['CA06_EXPLANATION_UNSUPPORTED'], questions: ['ca06_registration'], requests: [] },
      feedback: {
        issueHit: L('등록 유형 상충 확인', 'Registration conflict identified'), issueMiss: L('등록 유형 대조 미실시', 'Registration type not compared'),
        resolveHit: L('설명과 주최 측 기록 대조', 'Explanation tested against organiser record'), resolveMiss: L('등록 경위 미검증', 'Explanation not tested against the record')
      }
    },
    debrief: L('진술과 회사 서신이 일치해도 주최 측 기록은 다른 역할을 보여 줍니다. 어느 쪽이 맞는지 이 데스크에서 정하지 않고, 세 자료를 모두 남겨 추가 검토로 넘깁니다. 이는 위반 판단이 아닙니다.', 'Even though the statement and company letter agree, the organiser’s record shows a different role. Rather than choosing between them here, retain all three sources and refer for further review. This is not a finding of wrongdoing.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-07', countryId: 'CA', personId: 'SIM-CA-P07', name: 'Amara Lindgren',
    difficulty: 'advanced', category: 'third-party',
    title: L('초청장 주소와 초청인 기록', 'Invitation address and host record'),
    brief: L('초청인 자택에서 3주간 머문다는 초청장을 제출했습니다. 초청장 내용과 초청인 관련 기록을 대조해야 합니다.', 'The traveller submits an invitation to stay three weeks at the host’s home. Compare the invitation with the host’s record.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친구 방문 · 연말 휴가', 'Visiting a friend · year-end holiday') },
      { label: L('예정 체류', 'Stated stay'), value: L('3주', 'Three weeks') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 초청장 · 왕복 항공권', 'Passport · invitation letter · return ticket') }
    ],
    opening: L('안녕하세요. 친구 집에서 연말을 보내려고 왔습니다.', 'Hello. I am spending the holidays at a friend’s home.'),
    documents: [
      { id: 'SIM-CA-07-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 LINDGREN, AMARA · 여권번호 SIMCA07T6610', 'Name LINDGREN, AMARA · passport no. SIMCA07T6610'), NOTICE] },
      { id: 'SIM-CA-07-DOC2', title: L('초청장', 'Invitation letter'), pages: [L('2026-11-01 작성 · 초청인 Daniel Achterberg · 주소 42 Larch Street, Toronto · 2026-12-02–12-23 초청인 자택 숙박', 'Dated 2026-11-01 · host Daniel Achterberg · 42 Larch Street, Toronto · stay at host’s home 2026-12-02–12-23')] },
      { id: 'SIM-CA-07-DOC3', title: L('왕복 항공권', 'Return ticket'), pages: [L('탑승객 LINDGREN/AMARA · 토론토 도착 2026-12-02 · 귀국 2026-12-23', 'Passenger LINDGREN/AMARA · arrives Toronto 2026-12-02 · returns 2026-12-23')] }
    ],
    records: [
      { id: 'SIM-CA-07-REC1', title: L('초청인 주소 기록(합성)', 'Host address record (synthetic)'), detail: L('Daniel Achterberg · 현재 주소 7 Birchmount Court, Mississauga · 2026-08-19 주소 변경', 'Daniel Achterberg · current address 7 Birchmount Court, Mississauga · address changed 2026-08-19'), documentId: 'SIM-CA-07-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-07-F-LETTER-ADDR', sourceType: 'document', sourceId: 'SIM-CA-07-DOC2', page: 0, label: L('초청장 주소: 42 Larch Street, Toronto (2026-11-01 작성)', 'Invitation address: 42 Larch Street, Toronto (dated 2026-11-01)') },
      { id: 'SIM-CA-07-F-LETTER-STAY', sourceType: 'document', sourceId: 'SIM-CA-07-DOC2', page: 0, label: L('초청장 체류: 2026-12-02–12-23', 'Invitation stay: 2026-12-02 to 12-23') },
      { id: 'SIM-CA-07-F-TICKET', sourceType: 'document', sourceId: 'SIM-CA-07-DOC3', page: 0, label: L('항공권: 2026-12-02 도착 · 2026-12-23 귀국', 'Ticket: arrives 2026-12-02 · returns 2026-12-23') },
      { id: 'SIM-CA-07-F-HOST', sourceType: 'record', sourceId: 'SIM-CA-07-REC1', label: L('초청인 기록: 2026-08-19부터 Mississauga 주소', 'Host record: Mississauga address since 2026-08-19') },
      { id: 'SIM-CA-07-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-07-STMT', questionIds: ['ca07_address'], label: L('진술: 이사했다고 들었지만 새 집에는 아직 가 보지 않았습니다', 'Statement: He told me he had moved, but I have not been to the new place yet') },
      { id: 'SIM-CA-07-F-REQ', sourceType: 'request', sourceId: 'SIM-CA-07-REQ-HOST', requestId: 'SIM-CA-07-REQ-HOST', label: L('초청인 회신: 현재 주소 7 Birchmount Court에서 12-02–12-23 숙박 제공 확인', 'Host reply: confirms stay at current address, 7 Birchmount Court, 12-02 to 12-23') }
    ],
    questions: [
      { id: 'ca07_purpose', q: L('어떤 목적으로 오셨습니까?', 'What brings you to Canada?'), answer: L('대학 시절 친구 Daniel의 집에서 연말을 보내려고 왔습니다.', 'I am spending the holidays at the home of Daniel, a friend from university.') },
      { id: 'ca07_stay', q: L('언제 돌아가십니까?', 'When are you going back?'), answer: L('12월 23일에 돌아갑니다.', 'On 23 December.') },
      { id: 'ca07_letter', q: L('초청장은 언제 받으셨습니까?', 'When did you receive the invitation?'), answer: L('11월 초에 Daniel이 이메일로 보내 줬습니다.', 'Daniel emailed it to me at the beginning of November.') },
      { id: 'ca07_address', q: L('초청장에 적힌 주소에서 지내실 예정입니까?', 'Will you be staying at the address on the invitation?'), answer: L('작년에는 Larch Street 집에서 지냈습니다. 이사했다고 들었지만 새 집에는 아직 가 보지 않았습니다.', 'Last year I stayed at his place on Larch Street. He told me he had moved, but I have not been to the new place yet.') },
      { id: 'ca07_contact', q: L('초청인과 지금 연락할 수 있습니까?', 'Can the host be contacted now?'), answer: L('네, Daniel이 공항에 마중 나와 있어서 전화하면 바로 받을 겁니다.', 'Yes, Daniel is waiting for me in arrivals. He will pick up if you call.') }
    ],
    comparisons: [
      { id: 'COMP-CA-07-ADDR', facts: ['SIM-CA-07-F-LETTER-ADDR', 'SIM-CA-07-F-HOST'], type: 'CONFLICT', findingId: 'CA07_ADDRESS_CONFLICT', title: L('초청장 주소와 초청인 기록 상충', 'Invitation address conflicts with host record'), explanation: L('초청장은 11월에 작성됐지만 8월 이전 주소를 적고 있습니다. 초청인 기록의 현재 주소는 Mississauga입니다.', 'The invitation was written in November but gives an address the record shows he left in August. The current address is in Mississauga.'), unlocks: { questions: ['ca07_address'] } },
      { id: 'COMP-CA-07-DATES', facts: ['SIM-CA-07-F-LETTER-STAY', 'SIM-CA-07-F-TICKET'], type: 'MATCH', findingId: 'CA07_DATES_MATCH', title: L('체류 기간 일치', 'Stay dates match'), explanation: L('초청장의 체류 기간과 항공권 도착·귀국일이 같습니다.', 'The invitation’s stay dates match the ticket’s arrival and return.') },
      { id: 'COMP-CA-07-STMT', facts: ['SIM-CA-07-F-HOST', 'SIM-CA-07-F-STMT'], type: 'UNVERIFIED', findingId: 'CA07_MOVE_UNCONFIRMED', title: L('이사 진술 미확인', 'Move not yet confirmed by host'), explanation: L('진술은 기록상 주소 변경과 맞지만, 실제 숙박할 주소는 초청인에게서 확인되지 않았습니다.', 'The statement fits the recorded change of address, but the host has not confirmed where the stay will be.'), unlocks: { questions: ['ca07_contact'], requests: ['SIM-CA-07-REQ-HOST'] } },
      { id: 'COMP-CA-07-REQ', facts: ['SIM-CA-07-F-HOST', 'SIM-CA-07-F-REQ'], type: 'MATCH', findingId: 'CA07_HOST_CONFIRMS', title: L('초청인 확인과 기록 일치', 'Host confirmation matches record'), explanation: L('초청인 회신의 주소가 기록상 현재 주소와 같고, 숙박 기간도 초청장과 같습니다.', 'The address in the host’s reply is the recorded current address, and the dates match the invitation.') }
    ],
    requests: [
      { id: 'SIM-CA-07-REQ-HOST', title: L('초청인에게 현재 주소와 숙박 제공 확인 요청', 'Ask the host to confirm his current address and the stay'), result: L('초청인 회신(합성): 8월에 Mississauga로 이사함. 초청장은 작년 양식을 다시 써서 이전 주소가 남았음. 7 Birchmount Court에서 12월 2일–23일 숙박 제공 확인.', 'Host reply (synthetic): moved to Mississauga in August; reused last year’s letter template, which kept the old address; confirms the stay at 7 Birchmount Court from 2 to 23 December.') }
    ],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('초청인이 기록상 현재 주소에서의 숙박을 직접 확인했고 기간도 항공권과 같습니다. 주소 차이는 양식 재사용으로 설명되었고 남은 쟁점이 없습니다.', 'The host confirmed the stay at his recorded current address and the dates match the ticket. The old address came from a reused template and nothing remains outstanding.'),
      evidence: L('필요한 확인은 요청으로 이 자리에서 받을 수 있었고 이미 도착했습니다. 더 기다릴 자료가 없습니다.', 'The needed confirmation could be obtained here by request and has arrived. No further evidence is outstanding.'),
      review: L('주소 차이는 초청인 확인과 기록으로 해소되었습니다. 추가 검토로 넘길 상충이 남지 않습니다.', 'The address difference is resolved by the host’s confirmation and the record. No conflict remains to refer.')
    },
    assessment: {
      issue: ['CA07_ADDRESS_CONFLICT'],
      distinguish: ['CA07_DATES_MATCH'],
      resolve: { findings: ['CA07_MOVE_UNCONFIRMED', 'CA07_HOST_CONFIRMS'], questions: ['ca07_address', 'ca07_contact'], requests: ['SIM-CA-07-REQ-HOST'] },
      feedback: {
        issueHit: L('초청장 주소 상충 확인', 'Invitation address conflict identified'), issueMiss: L('초청장과 초청인 기록 미대조', 'Invitation not compared with host record'),
        resolveHit: L('초청인 확인으로 주소 해소', 'Address resolved by host confirmation'), resolveMiss: L('초청인 확인 미요청', 'Host confirmation not requested')
      }
    },
    debrief: L('제3자 서류의 오래된 정보는 흔합니다. 진술만으로 결론을 내리지 않고 서류를 쓴 사람에게 확인을 받아 기록과 대조했습니다. 연습상 검토 완료이며 실제 입국허가를 뜻하지 않습니다.', 'Out-of-date details in third-party letters are common. Instead of concluding on the traveller’s word, the author of the letter confirmed the facts and the reply was compared with the record. Completing this exercise does not grant entry.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-08', countryId: 'CA', personId: 'SIM-CA-P08', name: 'Tomasz Wierzbicki',
    difficulty: 'advanced', category: 'statement',
    title: L('서로 다른 체류 기간 진술', 'Inconsistent accounts of the stay'),
    brief: L('누나의 출산을 돕기 위해 방문했습니다. 항공권·가족 서신·진술에 나타난 체류 기간을 대조해야 합니다.', 'The traveller is here to help his sister around the birth of her baby. Compare the length of stay in the ticket, family letter and his statements.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('가족 방문', 'Family visit') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 왕복 항공권 · 가족 서신', 'Passport · return ticket · family letter') }
    ],
    opening: L('안녕하세요. 밴쿠버에 사는 누나를 도우러 왔습니다.', 'Hello. I have come to help my sister in Vancouver.'),
    documents: [
      { id: 'SIM-CA-08-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 WIERZBICKI, TOMASZ · 여권번호 SIMCA08M7714', 'Name WIERZBICKI, TOMASZ · passport no. SIMCA08M7714'), NOTICE] },
      { id: 'SIM-CA-08-DOC2', title: L('왕복 항공권', 'Return ticket'), pages: [L('탑승객 WIERZBICKI/TOMASZ · 밴쿠버 도착 2026-12-06 · 귀국 2026-12-20', 'Passenger WIERZBICKI/TOMASZ · arrives Vancouver 2026-12-06 · returns 2026-12-20')] },
      { id: 'SIM-CA-08-DOC3', title: L('가족 서신', 'Family letter'), pages: [L('누나 작성: 출산 예정일 2026-12-12 · 동생이 출산 전후 2주간 도와주러 옴', 'From his sister: due date 2026-12-12 · her brother is coming for two weeks around the birth')] }
    ],
    records: [
      { id: 'SIM-CA-08-REC1', title: L('항공 예약 상세 조회', 'Booking detail'), detail: L('귀국편 날짜 변경 가능 운임 · 2026-11-30 귀국편 변경 문의 기록 · 변경 미확정', 'Return date changeable fare · enquiry about changing the return flight logged 2026-11-30 · no change made'), documentId: 'SIM-CA-08-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-08-F-TICKET', sourceType: 'document', sourceId: 'SIM-CA-08-DOC2', page: 0, label: L('항공권: 2026-12-06 도착 · 2026-12-20 귀국', 'Ticket: arrives 2026-12-06 · returns 2026-12-20') },
      { id: 'SIM-CA-08-F-LETTER', sourceType: 'document', sourceId: 'SIM-CA-08-DOC3', page: 0, label: L('가족 서신: 출산 전후 2주간 방문', 'Family letter: two-week visit around the birth') },
      { id: 'SIM-CA-08-F-REC', sourceType: 'record', sourceId: 'SIM-CA-08-REC1', label: L('예약 상세: 귀국편 변경 문의(11-30) · 변경 미확정', 'Booking detail: return-change enquiry (30 Nov) · no change made') },
      { id: 'SIM-CA-08-F-STMT1', sourceType: 'statement', sourceId: 'SIM-CA-08-STMT1', questionIds: ['ca08_stay'], label: L('진술: 2주 머물고 12월 20일에 돌아갑니다', 'Statement: I am staying two weeks and going back on 20 December') },
      { id: 'SIM-CA-08-F-STMT2', sourceType: 'statement', sourceId: 'SIM-CA-08-STMT2', questionIds: ['ca08_plans'], label: L('진술: 누나가 회복할 때까지 곁에 있을 생각입니다. 2월쯤 될 것 같습니다', 'Statement: I plan to stay with her until she recovers. That will probably be around February') },
      { id: 'SIM-CA-08-F-STMT3', sourceType: 'statement', sourceId: 'SIM-CA-08-STMT3', questionIds: ['ca08_reconcile'], label: L('진술: 아직 정하지 않았습니다. 상황을 보고 항공권을 바꿀 수도 있습니다', 'Statement: I have not decided yet. I might change my ticket depending on how things go') }
    ],
    questions: [
      { id: 'ca08_stay', q: L('얼마나 머무르십니까?', 'How long are you staying?'), answer: L('2주 머물고 12월 20일에 돌아갑니다.', 'I am staying two weeks and going back on 20 December.') },
      { id: 'ca08_where', q: L('어디에 머무르십니까?', 'Where will you be staying?'), answer: L('밴쿠버에 있는 누나 집에서 지냅니다.', 'At my sister’s home in Vancouver.') },
      { id: 'ca08_plans', q: L('체류하는 동안 무엇을 하실 예정입니까?', 'What will you be doing during your stay?'), answer: L('누나가 곧 출산합니다. 누나가 회복할 때까지 곁에 있을 생각입니다. 2월쯤 될 것 같습니다.', 'My sister is about to give birth. I plan to stay with her until she recovers. That will probably be around February.') },
      { id: 'ca08_reconcile', q: L('처음에는 12월 20일에 돌아간다고 하셨고, 지금은 2월쯤이라고 하셨습니다. 어느 쪽이 계획입니까?', 'You first said you return on 20 December, and now around February. Which is the plan?'), answer: L('솔직히 아직 정하지 않았습니다. 상황을 보고 항공권을 바꿀 수도 있습니다.', 'To be honest, I have not decided yet. I might change my ticket depending on how things go.') }
    ],
    comparisons: [
      { id: 'COMP-CA-08-STMTS', facts: ['SIM-CA-08-F-STMT1', 'SIM-CA-08-F-STMT2'], type: 'CONFLICT', findingId: 'CA08_STATEMENTS_CONFLICT', title: L('두 진술의 체류 기간 상충', 'Two statements give different stays'), explanation: L('한 진술은 12월 20일 귀국, 다른 진술은 2월쯤까지 체류를 말합니다.', 'One statement gives a return on 20 December; the other a stay until around February.'), unlocks: { questions: ['ca08_reconcile'] } },
      { id: 'COMP-CA-08-TICKET', facts: ['SIM-CA-08-F-TICKET', 'SIM-CA-08-F-STMT1'], type: 'MATCH', findingId: 'CA08_TICKET_MATCHES_FIRST', title: L('항공권과 첫 진술 일치', 'Ticket matches first statement'), explanation: L('항공권 귀국일은 첫 진술의 12월 20일과 같습니다.', 'The ticket’s return date matches the first statement, 20 December.') },
      { id: 'COMP-CA-08-LETTER', facts: ['SIM-CA-08-F-LETTER', 'SIM-CA-08-F-STMT2'], type: 'CONFLICT', findingId: 'CA08_LETTER_VS_SECOND', title: L('가족 서신과 둘째 진술 상충', 'Family letter conflicts with second statement'), explanation: L('가족 서신은 2주 방문을 적고 있어 2월까지 머문다는 진술과 맞지 않습니다.', 'The family letter describes a two-week visit, which does not fit a stay until February.') },
      { id: 'COMP-CA-08-REC', facts: ['SIM-CA-08-F-REC', 'SIM-CA-08-F-STMT3'], type: 'UNVERIFIED', findingId: 'CA08_PLAN_UNSETTLED', title: L('귀국 계획 미확정', 'Return plan unsettled'), explanation: L('예약 기록의 변경 문의와 “아직 정하지 않았다”는 진술이 맞습니다. 어느 체류 기간도 확정된 자료가 없습니다.', 'The logged change enquiry fits the statement that he has not decided. No source settles the length of stay.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('서류는 2주를 가리키지만 본인 진술은 2월까지일 수 있다고 하고 계획도 정해지지 않았습니다. 상충을 남긴 채 검토를 닫을 수 없습니다.', 'The documents point to two weeks, but his own statements allow for February and the plan is undecided. The review cannot close with that conflict.'),
      evidence: L('정해지지 않은 계획은 어떤 서류로도 확인되지 않습니다. 빠진 자료가 아니라 진술끼리의 상충이 쟁점입니다.', 'No document can confirm a plan that has not been made. The issue is a conflict between statements, not missing evidence.'),
      review: L('진술끼리, 그리고 서신과 진술이 서로 다릅니다. 모든 진술을 그대로 기록하고 추가 검토로 넘기는 것이 근거와 맞습니다.', 'The statements conflict with each other and with the letter. Recording every statement verbatim and referring for further review matches the evidence.')
    },
    assessment: {
      issue: ['CA08_STATEMENTS_CONFLICT'],
      distinguish: ['CA08_TICKET_MATCHES_FIRST'],
      resolve: { findings: ['CA08_LETTER_VS_SECOND', 'CA08_PLAN_UNSETTLED'], questions: ['ca08_reconcile'], requests: [] },
      feedback: {
        issueHit: L('진술 간 상충 확인', 'Conflict between statements identified'), issueMiss: L('진술 간 상충 미확인', 'Conflict between statements missed'),
        resolveHit: L('상충을 서류·기록과 대조', 'Conflict tested against documents and record'), resolveMiss: L('후속 질문·기록 대조 미완료', 'Follow-up and record comparison incomplete')
      }
    },
    debrief: L('가족 사정으로 계획이 바뀌는 것은 흔한 일이며 잘못이 아닙니다. 다만 진술끼리 체류 기간이 다르고 확정된 자료도 없으므로 모든 진술을 그대로 남기고 추가 검토로 넘깁니다. 이 연습은 허용 체류 기간을 계산하지 않습니다.', 'Plans changing for family reasons is common and is not wrongdoing. But the statements give different stays and nothing settles it, so record every statement as given and refer for further review. This exercise does not compute an authorised length of stay.'),
    sources: ['CA-ENF4', 'CA-IRPR', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-09', countryId: 'CA', personId: 'SIM-CA-P09', name: 'Ottilie Marchetti',
    difficulty: 'standard', category: 'missing',
    title: L('도착하지 않은 첨부 자료', 'An enclosure that never arrived'),
    brief: L('딸의 졸업식 참석을 위해 방문했습니다. 하객 안내문과 접수 내역을 대조해야 합니다.', 'The traveller is here for her daughter’s graduation. Compare the guest notice with the submission log.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('졸업식 참석', 'Attending a graduation') },
      { label: L('예정 체류', 'Stated stay'), value: L('1주', 'One week') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 졸업식 하객 안내문 · 왕복 항공권', 'Passport · graduation guest notice · return ticket') }
    ],
    opening: L('안녕하세요. 딸의 대학 졸업식에 참석하러 왔습니다.', 'Hello. I am here for my daughter’s university graduation.'),
    documents: [
      { id: 'SIM-CA-09-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 MARCHETTI, OTTILIE · 여권번호 SIMCA09G1186', 'Name MARCHETTI, OTTILIE · passport no. SIMCA09G1186'), NOTICE] },
      { id: 'SIM-CA-09-DOC2', title: L('졸업식 하객 안내문', 'Graduation guest notice'), pages: [L('가상 대학교 졸업식 2026-12-11 밴쿠버 · 하객 Ottilie Marchetti · “하객 좌석 확인서 별도 첨부”', 'Fictional university graduation, Vancouver, 2026-12-11 · guest Ottilie Marchetti · “Guest seating confirmation attached separately”')] },
      { id: 'SIM-CA-09-DOC3', title: L('왕복 항공권', 'Return ticket'), pages: [L('탑승객 MARCHETTI/OTTILIE · 밴쿠버 도착 2026-12-08 · 귀국 2026-12-15', 'Passenger MARCHETTI/OTTILIE · arrives Vancouver 2026-12-08 · returns 2026-12-15')] }
    ],
    records: [
      { id: 'SIM-CA-09-REC1', title: L('자료 접수 내역', 'Submission log'), detail: L('사전 제출 이메일 첨부 표시 2건 · 수신 1건(하객 안내문) · 두 번째 첨부 수신 실패', 'Advance submission email: two attachments listed · one received (guest notice) · second attachment failed to arrive'), documentId: 'SIM-CA-09-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-09-F-CEREMONY', sourceType: 'document', sourceId: 'SIM-CA-09-DOC2', page: 0, label: L('하객 안내문: 졸업식 2026-12-11', 'Guest notice: graduation on 2026-12-11') },
      { id: 'SIM-CA-09-F-ENCL', sourceType: 'document', sourceId: 'SIM-CA-09-DOC2', page: 0, label: L('하객 안내문: 좌석 확인서 별도 첨부', 'Guest notice: seating confirmation attached separately') },
      { id: 'SIM-CA-09-F-TICKET', sourceType: 'document', sourceId: 'SIM-CA-09-DOC3', page: 0, label: L('항공권: 2026-12-08 도착 · 2026-12-15 귀국', 'Ticket: arrives 2026-12-08 · returns 2026-12-15') },
      { id: 'SIM-CA-09-F-LOG', sourceType: 'record', sourceId: 'SIM-CA-09-REC1', label: L('접수 내역: 첨부 2건 중 1건만 수신', 'Submission log: only one of two attachments received') },
      { id: 'SIM-CA-09-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-09-STMT', questionIds: ['ca09_enclosure'], label: L('진술: 딸이 이메일로 다시 보내 준다고 했는데 아직 못 받았습니다', 'Statement: My daughter said she would email it again, but I have not received it yet') },
      { id: 'SIM-CA-09-F-REQ', sourceType: 'request', sourceId: 'SIM-CA-09-REQ-SEAT', requestId: 'SIM-CA-09-REQ-SEAT', label: L('보완 요청: 하객 좌석 확인서 제출 대기', 'Request: guest seating confirmation awaited') }
    ],
    questions: [
      { id: 'ca09_purpose', q: L('방문 목적은 무엇입니까?', 'What is the purpose of your visit?'), answer: L('딸의 대학 졸업식에 참석하러 왔습니다.', 'I am attending my daughter’s university graduation.') },
      { id: 'ca09_stay', q: L('얼마나 머무르십니까?', 'How long are you staying?'), answer: L('12월 15일까지 일주일 머뭅니다.', 'One week, until 15 December.') },
      { id: 'ca09_where', q: L('어디에 머무르십니까?', 'Where will you be staying?'), answer: L('딸이 사는 아파트에서 지냅니다.', 'At my daughter’s flat.') },
      { id: 'ca09_enclosure', q: L('안내문에 적힌 좌석 확인서를 받으셨습니까?', 'Did you receive the seating confirmation mentioned in the notice?'), answer: L('딸이 이메일로 다시 보내 준다고 했는데 아직 못 받았습니다.', 'My daughter said she would email it again, but I have not received it yet.') }
    ],
    comparisons: [
      { id: 'COMP-CA-09-ENCL', facts: ['SIM-CA-09-F-ENCL', 'SIM-CA-09-F-LOG'], type: 'MISSING', findingId: 'CA09_ENCLOSURE_MISSING', title: L('첨부 자료 미수신', 'Enclosure not received'), explanation: L('안내문은 좌석 확인서가 별도로 첨부된다고 하지만, 접수 내역상 두 번째 첨부는 도착하지 않았습니다.', 'The notice says a seating confirmation is attached separately, but the log shows the second attachment never arrived.'), unlocks: { questions: ['ca09_enclosure'], requests: ['SIM-CA-09-REQ-SEAT'] } },
      { id: 'COMP-CA-09-DATES', facts: ['SIM-CA-09-F-CEREMONY', 'SIM-CA-09-F-TICKET'], type: 'MATCH', findingId: 'CA09_CEREMONY_IN_STAY', title: L('졸업식이 체류 기간 안', 'Graduation falls within the stay'), explanation: L('12월 11일 졸업식이 항공권의 12월 8일–15일 체류 기간 안에 있습니다.', 'The graduation on 11 December falls within the 8–15 December stay on the ticket.') },
      { id: 'COMP-CA-09-STMT', facts: ['SIM-CA-09-F-LOG', 'SIM-CA-09-F-STMT'], type: 'MATCH', findingId: 'CA09_STMT_CONSISTENT', title: L('진술과 접수 내역 일치', 'Statement consistent with log'), explanation: L('첨부를 아직 받지 못했다는 진술이 접수 내역의 수신 실패와 맞습니다.', 'The statement that the attachment has not been received fits the failed delivery in the log.') },
      { id: 'COMP-CA-09-REQ', facts: ['SIM-CA-09-F-ENCL', 'SIM-CA-09-F-REQ'], type: 'MISSING', findingId: 'CA09_REQUEST_SPECIFIC', title: L('빠진 첨부를 특정해 요청', 'Missing enclosure requested by name'), explanation: L('안내문이 언급한 그 자료를 특정해 요청했습니다. 접수 전까지 검토는 열려 있습니다.', 'The exact item the notice refers to has been requested. The review stays open until it arrives.') }
    ],
    requests: [
      { id: 'SIM-CA-09-REQ-SEAT', title: L('하객 좌석 확인서 재제출 요청', 'Request the guest seating confirmation again'), result: L('요청 기록됨: 하객 좌석 확인서 제출 대기. 졸업생 측에서 다시 보낼 예정.', 'Request logged: guest seating confirmation awaited; the graduate will resend it.') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('안내문이 스스로 언급한 첨부 자료가 접수되지 않았습니다. 빠진 자료를 남긴 채 검토를 닫을 수 없습니다.', 'The enclosure the notice itself refers to was never received. The review cannot close with that item missing.'),
      evidence: L('다른 자료는 서로 맞고 빠진 것은 좌석 확인서 하나입니다. 그 자료를 특정해 요청하는 것이 근거와 맞습니다.', 'Everything else agrees and the only gap is the seating confirmation. Requesting that specific item matches the evidence.'),
      review: L('상충하는 자료는 없습니다. 전송 실패로 빠진 자료일 뿐이므로 추가 검토로 넘길 근거가 없습니다.', 'Nothing conflicts; an attachment simply failed to arrive. There is no basis for referral.')
    },
    assessment: {
      issue: ['CA09_ENCLOSURE_MISSING'],
      distinguish: ['CA09_CEREMONY_IN_STAY', 'CA09_STMT_CONSISTENT'],
      resolve: { findings: ['CA09_REQUEST_SPECIFIC'], questions: ['ca09_enclosure'], requests: ['SIM-CA-09-REQ-SEAT'] },
      feedback: {
        issueHit: L('미수신 첨부 확인', 'Missing enclosure identified'), issueMiss: L('안내문과 접수 내역 미대조', 'Notice not compared with submission log'),
        resolveHit: L('빠진 첨부를 특정해 요청', 'Missing enclosure requested'), resolveMiss: L('보완 요청 미발행', 'Request not issued')
      }
    },
    debrief: L('자료가 스스로 언급한 첨부가 있는지 접수 내역으로 확인합니다. 전송 실패는 잘못이 아니며, 빠진 자료를 구체적으로 요청하는 것으로 충분합니다.', 'Use the submission log to check that every enclosure a document mentions has arrived. A failed transmission is not wrongdoing; requesting the specific missing item is enough.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-10', countryId: 'CA', personId: 'SIM-CA-P10', name: 'Elodie Brandt',
    difficulty: 'standard', category: 'false-positive',
    title: L('호텔 예약 날짜 판독', 'Reading the hotel booking dates'),
    brief: L('자동 판독 결과 호텔 체크인이 항공권 도착일과 맞지 않는다는 표시가 붙었습니다.', 'The automatic reading flags the hotel check-in as inconsistent with the ticket’s arrival date.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('겨울 휴가', 'Winter holiday') },
      { label: L('예정 체류', 'Stated stay'), value: L('7박', 'Seven nights') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 호텔 예약 확인서 · 왕복 항공권', 'Passport · hotel booking · return ticket') }
    ],
    opening: L('안녕하세요. 토론토에서 일주일 휴가를 보내려고 왔습니다.', 'Hello. I am here for a week’s holiday in Toronto.'),
    documents: [
      { id: 'SIM-CA-10-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 BRANDT, ELODIE · 여권번호 SIMCA10H4402', 'Name BRANDT, ELODIE · passport no. SIMCA10H4402'), NOTICE] },
      { id: 'SIM-CA-10-DOC2', title: L('호텔 예약 확인서', 'Hotel booking confirmation'), pages: [L('투숙객 Elodie Brandt · 체크인 03/12/2026 · 체크아웃 10/12/2026 · 7박', 'Guest Elodie Brandt · check-in 03/12/2026 · check-out 10/12/2026 · 7 nights')] },
      { id: 'SIM-CA-10-DOC3', title: L('왕복 항공권', 'Return ticket'), pages: [L('탑승객 BRANDT/ELODIE · 토론토 도착 2026-12-03 · 귀국 2026-12-10', 'Passenger BRANDT/ELODIE · arrives Toronto 2026-12-03 · returns 2026-12-10')] }
    ],
    records: [
      { id: 'SIM-CA-10-REC1', title: L('자동 판독 결과(합성)', 'Automatic reading (synthetic)'), detail: L('호텔 체크인 2026-03-12 · 체크아웃 2026-10-12로 판독 · 항공권 도착일과 불일치 표시', 'Hotel check-in read as 2026-03-12 · check-out 2026-10-12 · flagged as not matching ticket arrival'), documentId: 'SIM-CA-10-DOC2' },
      { id: 'SIM-CA-10-REC2', title: L('예약 원본 조회', 'Original booking lookup'), detail: L('날짜 형식 DD/MM/YYYY · 체크인 2026년 12월 3일 · 체크아웃 2026년 12월 10일 · 7박', 'Date format DD/MM/YYYY · check-in 3 December 2026 · check-out 10 December 2026 · 7 nights'), documentId: 'SIM-CA-10-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-10-F-HOTEL', sourceType: 'document', sourceId: 'SIM-CA-10-DOC2', page: 0, label: L('예약 확인서: 03/12/2026–10/12/2026 · 7박', 'Booking: 03/12/2026–10/12/2026 · 7 nights') },
      { id: 'SIM-CA-10-F-TICKET', sourceType: 'document', sourceId: 'SIM-CA-10-DOC3', page: 0, label: L('항공권: 2026-12-03 도착 · 2026-12-10 귀국', 'Ticket: arrives 2026-12-03 · returns 2026-12-10') },
      { id: 'SIM-CA-10-F-AUTO', sourceType: 'record', sourceId: 'SIM-CA-10-REC1', label: L('자동 판독: 체크인 2026-03-12 · 불일치 표시', 'Automatic reading: check-in 2026-03-12 · mismatch flag') },
      { id: 'SIM-CA-10-F-FORMAT', sourceType: 'record', sourceId: 'SIM-CA-10-REC2', label: L('예약 원본: DD/MM 형식 · 2026년 12월 3일–10일', 'Original booking: DD/MM format · 3–10 December 2026') },
      { id: 'SIM-CA-10-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-10-STMT', questionIds: ['ca10_hotel'], label: L('진술: 시내 호텔에 12월 3일부터 일주일 묵습니다', 'Statement: I am staying at a hotel downtown for a week from 3 December') }
    ],
    questions: [
      { id: 'ca10_purpose', q: L('방문 목적은 무엇입니까?', 'What is the purpose of your visit?'), answer: L('토론토에서 겨울 휴가를 보냅니다.', 'A winter holiday in Toronto.') },
      { id: 'ca10_hotel', q: L('어디에 묵으십니까?', 'Where are you staying?'), answer: L('시내 호텔에 12월 3일부터 일주일 묵습니다.', 'I am staying at a hotel downtown for a week from 3 December.') },
      { id: 'ca10_return', q: L('언제 돌아가십니까?', 'When are you returning?'), answer: L('12월 10일에 돌아갑니다.', 'On 10 December.') },
      { id: 'ca10_booking', q: L('호텔 예약은 어떻게 하셨습니까?', 'How did you book the hotel?'), answer: L('온라인 예약 사이트에서 했습니다. 확인서는 사이트에서 보낸 그대로 출력했습니다.', 'Through an online booking site. I printed the confirmation exactly as the site sent it.') }
    ],
    comparisons: [
      { id: 'COMP-CA-10-AUTO', facts: ['SIM-CA-10-F-AUTO', 'SIM-CA-10-F-TICKET'], type: 'CONFLICT', findingId: 'CA10_AUTO_FLAG', title: L('자동 판독과 항공권 불일치', 'Automatic reading conflicts with ticket'), explanation: L('자동 판독은 체크인을 3월 12일로 읽어 12월 3일 도착과 맞지 않는다고 표시했습니다.', 'The automatic reading took check-in as 12 March, which does not fit arrival on 3 December.'), unlocks: { questions: ['ca10_booking'] } },
      { id: 'COMP-CA-10-RAW', facts: ['SIM-CA-10-F-HOTEL', 'SIM-CA-10-F-AUTO'], type: 'UNVERIFIED', findingId: 'CA10_FORMAT_AMBIGUOUS', title: L('날짜 형식 불분명', 'Date format ambiguous'), explanation: L('확인서의 03/12/2026은 3월 12일로도 12월 3일로도 읽힐 수 있습니다. 확인서만으로는 형식을 알 수 없습니다.', '03/12/2026 on the confirmation can be read as 12 March or 3 December. The confirmation alone does not say which.') },
      { id: 'COMP-CA-10-FORMAT', facts: ['SIM-CA-10-F-FORMAT', 'SIM-CA-10-F-TICKET'], type: 'MATCH', findingId: 'CA10_FORMAT_RESOLVES', title: L('예약 원본과 항공권 일치', 'Original booking matches ticket'), explanation: L('예약 원본은 일/월 형식이며 12월 3일–10일로, 항공권 도착·귀국일과 같습니다.', 'The original booking uses day/month format and runs 3–10 December, matching the ticket exactly.') },
      { id: 'COMP-CA-10-STMT', facts: ['SIM-CA-10-F-HOTEL', 'SIM-CA-10-F-STMT'], type: 'MATCH', findingId: 'CA10_STMT_FITS', title: L('진술과 예약 확인서 부합', 'Statement fits the booking'), explanation: L('12월 3일부터 일주일이라는 진술이 확인서의 7박과 맞습니다.', 'The statement of a week from 3 December fits the seven nights on the confirmation.') }
    ],
    requests: [],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('불일치 표시는 날짜 형식을 잘못 읽은 결과입니다. 예약 원본이 12월 3일–10일로 항공권과 같으므로 남은 쟁점이 없습니다.', 'The flag came from reading the date in the wrong format. The original booking runs 3–10 December, matching the ticket, and nothing remains outstanding.'),
      evidence: L('예약 원본 조회가 이미 날짜를 확인해 줍니다. 추가 자료가 필요하지 않습니다.', 'The original booking lookup already confirms the dates. No further evidence is needed.'),
      review: L('상충은 판독 오류에서 생겼고 원본 기록으로 해소되었습니다. 추가 검토로 넘길 쟁점이 없습니다.', 'The conflict came from a reading error and the original record resolves it. Nothing remains to refer.')
    },
    assessment: {
      issue: ['CA10_AUTO_FLAG'],
      distinguish: ['CA10_FORMAT_AMBIGUOUS'],
      resolve: { findings: ['CA10_FORMAT_RESOLVES'], questions: ['ca10_hotel', 'ca10_booking'], requests: [] },
      feedback: {
        issueHit: L('자동 판독 불일치 확인', 'Automatic-reading mismatch identified'), issueMiss: L('자동 판독 표시 미검토', 'Automatic flag not examined'),
        resolveHit: L('원본 기록으로 날짜 형식 확인', 'Date format confirmed from original record'), resolveMiss: L('예약 원본 미대조', 'Original booking not compared')
      }
    },
    debrief: L('자동 표시는 출발점일 뿐 결론이 아닙니다. 03/12처럼 일·월 순서가 모호한 날짜는 원본 기록으로 형식을 확인합니다. 여행자는 잘못한 것이 없습니다. 연습상 검토 완료이며 실제 입국허가를 뜻하지 않습니다.', 'An automatic flag is a starting point, not a conclusion. Where day and month are ambiguous, as in 03/12, confirm the format from the original record. The traveller did nothing wrong. Completing this exercise does not grant entry.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-11', countryId: 'CA', personId: 'SIM-CA-P11', name: 'Ivo Santangelo',
    difficulty: 'advanced', category: 'referral',
    title: L('같은 여권번호, 다른 생년월일', 'One passport number, two dates of birth'),
    brief: L('여권과 항공 예약 확인서의 생년월일이 다릅니다. 이전 방문 기록까지 대조해 이 데스크에서 해소할 수 있는 문제인지 판단해야 합니다.', 'The passport and booking show different dates of birth. Compare the previous visit record as well and decide whether this can be resolved at this desk.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친구 방문 · 관광', 'Visiting a friend · sightseeing') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 항공 예약 확인서', 'Passport · flight booking confirmation') }
    ],
    opening: L('안녕하세요. 친구를 만나고 관광도 하려고 왔습니다.', 'Hello. I am here to see a friend and do some sightseeing.'),
    documents: [
      { id: 'SIM-CA-11-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 SANTANGELO, IVO · 생년월일 1987-04-17 · 여권번호 SIMCA11R3309 · 발급일 2024-05-20', 'Name SANTANGELO, IVO · date of birth 1987-04-17 · passport no. SIMCA11R3309 · issued 2024-05-20'), NOTICE] },
      { id: 'SIM-CA-11-DOC2', title: L('항공 예약 확인서', 'Flight booking confirmation'), pages: [L('탑승객 SANTANGELO/IVO · 생년월일 1987-07-14 · 여권번호 SIMCA11R3309 · 토론토 도착 2026-11-27', 'Passenger SANTANGELO/IVO · date of birth 1987-07-14 · passport no. SIMCA11R3309 · arrives Toronto 2026-11-27')] }
    ],
    records: [
      { id: 'SIM-CA-11-REC1', title: L('이전 방문 기록', 'Previous visit record'), detail: L('2025-03 방문 · SANTANGELO, IVO · 여권번호 SIMCA11R3309 · 생년월일 1987-07-14', 'Visit 2025-03 · SANTANGELO, IVO · passport no. SIMCA11R3309 · date of birth 1987-07-14'), documentId: 'SIM-CA-11-DOC1' }
    ],
    facts: [
      { id: 'SIM-CA-11-F-PASS', sourceType: 'document', sourceId: 'SIM-CA-11-DOC1', page: 0, label: L('여권: 생년월일 1987-04-17 · SIMCA11R3309 · 2024-05-20 발급', 'Passport: date of birth 1987-04-17 · SIMCA11R3309 · issued 2024-05-20') },
      { id: 'SIM-CA-11-F-BOOKING', sourceType: 'document', sourceId: 'SIM-CA-11-DOC2', page: 0, label: L('예약 확인서: 생년월일 1987-07-14 · SIMCA11R3309', 'Booking: date of birth 1987-07-14 · SIMCA11R3309') },
      { id: 'SIM-CA-11-F-PRIOR', sourceType: 'record', sourceId: 'SIM-CA-11-REC1', label: L('2025-03 방문 기록: SIMCA11R3309 · 생년월일 1987-07-14', 'March 2025 visit record: SIMCA11R3309 · date of birth 1987-07-14') },
      { id: 'SIM-CA-11-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-11-STMT', questionIds: ['ca11_dob'], label: L('진술: 예전 여권에 생년월일이 잘못 적혀 있었고 2024년에 새 여권을 받으면서 고쳐졌습니다', 'Statement: My old passport had the wrong date of birth, and it was corrected when I got a new passport in 2024') },
      { id: 'SIM-CA-11-F-AIRLINE', sourceType: 'request', sourceId: 'SIM-CA-11-REQ-AIRLINE', requestId: 'SIM-CA-11-REQ-AIRLINE', label: L('항공사 회신: 예약 시 승객이 직접 입력한 생년월일 1987-07-14', 'Airline reply: date of birth 1987-07-14 entered by the passenger when booking') }
    ],
    questions: [
      { id: 'ca11_purpose', q: L('방문 목적은 무엇입니까?', 'What is the purpose of your visit?'), answer: L('친구를 만나고 나이아가라 쪽도 둘러볼 예정입니다.', 'I am seeing a friend and will also visit the Niagara area.') },
      { id: 'ca11_prior', q: L('이전에 캐나다를 방문한 적이 있습니까?', 'Have you visited Canada before?'), answer: L('작년 3월에 한 번 왔습니다.', 'Once, in March last year.') },
      { id: 'ca11_booking', q: L('항공권은 누가 예약했습니까?', 'Who booked your ticket?'), answer: L('제가 항공사 앱으로 예약했습니다.', 'I booked it myself in the airline’s app.') },
      { id: 'ca11_dob', q: L('여권과 예약 확인서의 생년월일이 다릅니다. 어느 쪽이 맞습니까?', 'Your passport and booking give different dates of birth. Which is correct?'), answer: L('여권의 4월 17일이 맞습니다. 예전 여권에 생년월일이 잘못 적혀 있었고 2024년에 새 여권을 받으면서 고쳐졌습니다.', 'The passport date, 17 April, is correct. My old passport had the wrong date of birth, and it was corrected when I got a new passport in 2024.') },
      { id: 'ca11_2025', q: L('작년 3월 방문 때는 어떤 여권을 사용하셨습니까?', 'Which passport did you use for your visit last March?'), answer: L('지금 가지고 있는 이 여권을 썼습니다.', 'This one, the passport I have now.') }
    ],
    comparisons: [
      { id: 'COMP-CA-11-DOB', facts: ['SIM-CA-11-F-PASS', 'SIM-CA-11-F-BOOKING'], type: 'CONFLICT', findingId: 'CA11_DOB_CONFLICT', title: L('여권과 예약의 생년월일 상충', 'Passport and booking dates of birth conflict'), explanation: L('같은 여권번호인데 여권은 1987-04-17, 예약 확인서는 1987-07-14입니다.', 'Under the same passport number, the passport gives 1987-04-17 and the booking 1987-07-14.'), unlocks: { questions: ['ca11_dob'], requests: ['SIM-CA-11-REQ-AIRLINE'] } },
      { id: 'COMP-CA-11-PRIOR', facts: ['SIM-CA-11-F-PASS', 'SIM-CA-11-F-PRIOR'], type: 'CONFLICT', findingId: 'CA11_RECORD_TWO_DOBS', title: L('같은 여권번호에 두 생년월일', 'Two dates of birth under one passport number'), explanation: L('2025년 방문 기록은 현재 여권번호에 1987-07-14를 연결하고 있어 여권 자체와 다릅니다.', 'The 2025 visit record links 1987-07-14 to the current passport number, which differs from the passport itself.'), unlocks: { questions: ['ca11_2025'] } },
      { id: 'COMP-CA-11-STMT', facts: ['SIM-CA-11-F-STMT', 'SIM-CA-11-F-PRIOR'], type: 'CONFLICT', findingId: 'CA11_EXPLANATION_TIMING', title: L('정정 시점 설명과 기록 상충', 'Correction timing conflicts with record'), explanation: L('2024년 새 여권에서 정정됐다는 설명과 달리, 그 여권번호로 된 2025년 기록에는 여전히 7월 14일이 있습니다.', 'The account says the date was corrected in the 2024 passport, yet a 2025 record under that same passport number still shows 14 July.') },
      { id: 'COMP-CA-11-AIRLINE', facts: ['SIM-CA-11-F-BOOKING', 'SIM-CA-11-F-AIRLINE'], type: 'MATCH', findingId: 'CA11_BOOKING_SELF_ENTERED', title: L('예약 생년월일은 승객 입력값', 'Booking date of birth was self-entered'), explanation: L('항공사 회신은 예약 생년월일이 승객이 입력한 값임을 확인할 뿐, 어느 날짜가 맞는지는 알려 주지 않습니다.', 'The airline confirms the booking date was entered by the passenger; it says nothing about which date is correct.') }
    ],
    requests: [
      { id: 'SIM-CA-11-REQ-AIRLINE', title: L('항공사에 예약 생년월일 입력 경위 조회', 'Ask the airline how the booking date of birth was entered'), result: L('항공사 회신(합성): 예약 생년월일 1987-07-14는 승객이 앱에서 직접 입력한 값. 별도 확인 절차 없음.', 'Airline reply (synthetic): the booking date of birth, 1987-07-14, was entered by the passenger in the app; the airline does not verify it.') }
    ],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('같은 여권번호에 두 생년월일이 연결된 기록이 남아 있고, 정정 시점 설명도 기록과 맞지 않습니다. 검토를 닫을 근거가 없습니다.', 'A record still links two dates of birth to one passport number, and the account of when it was corrected does not fit the record. There is no basis to close.'),
      evidence: L('여행자가 낼 수 있는 자료로는 2025년 기록 자체의 불일치가 해소되지 않습니다. 항공사 조회도 어느 날짜가 맞는지 알려 주지 않습니다.', 'Nothing the traveller can supply resolves the inconsistency inside the 2025 record, and the airline check cannot say which date is correct.'),
      review: L('신원 기록 사이의 상충이 이 데스크에서 정정될 수 없습니다. 세 자료와 진술을 모두 남기고 추가 검토로 넘기는 것이 근거와 맞습니다.', 'A conflict between identity records cannot be corrected at this desk. Retaining all three sources and the statement and referring for further review matches the evidence.')
    },
    assessment: {
      issue: ['CA11_DOB_CONFLICT', 'CA11_RECORD_TWO_DOBS'],
      distinguish: ['CA11_BOOKING_SELF_ENTERED'],
      resolve: { findings: ['CA11_EXPLANATION_TIMING'], questions: ['ca11_dob', 'ca11_2025'], requests: [] },
      feedback: {
        issueHit: L('신원 기록 상충 확인', 'Identity record conflict identified'), issueMiss: L('생년월일 대조 미실시', 'Dates of birth not compared'),
        resolveHit: L('설명과 기록 시점 대조', 'Explanation tested against record timing'), resolveMiss: L('정정 시점 미검증', 'Correction timing not tested')
      }
    },
    debrief: L('생년월일 오류와 정정은 실제로 일어납니다. 그러나 정정됐다는 여권번호로 된 이후 기록에도 이전 날짜가 남아 있어 이 데스크에서 기록을 바로잡을 수 없습니다. 항공사 조회는 결론을 바꾸지 않습니다. 모든 자료를 남겨 추가 검토로 넘기며, 이는 위반 판단이 아닙니다.', 'Date-of-birth errors and corrections do happen. But a later record under the supposedly corrected passport still carries the old date, and this desk cannot correct identity records. The airline check changes nothing. Retain everything and refer for further review; this is not a finding of wrongdoing.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  },
  {
    id: 'SIM-CA-12', countryId: 'CA', personId: 'SIM-CA-P12', name: 'Selin Arkwright',
    difficulty: 'advanced', category: 'complex',
    title: L('재예약된 투어 일정', 'A rebooked tour'),
    brief: L('밴쿠버 도착 후 로키 산맥 겨울 투어에 합류한다고 했습니다. 투어 바우처·항공권·운영사 기록을 함께 대조해야 합니다.', 'The traveller says she will join a winter Rockies tour after landing in Vancouver. Compare the tour voucher, ticket and operator records together.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('단체 관광', 'Guided tour') },
      { label: L('예정 체류', 'Stated stay'), value: L('10일', 'Ten days') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 · 투어 바우처 출력본 · 왕복 항공권', 'Passport · printed tour voucher · return ticket') }
    ],
    opening: L('안녕하세요. 로키 산맥 겨울 투어에 참가하러 왔습니다.', 'Hello. I am here to join a winter tour of the Rockies.'),
    documents: [
      { id: 'SIM-CA-12-DOC1', title: L('여권 신원면(합성)', 'Passport data page (synthetic)'), pages: [L('성명 ARKWRIGHT, SELIN · 여권번호 SIMCA12W5057', 'Name ARKWRIGHT, SELIN · passport no. SIMCA12W5057'), NOTICE] },
      { id: 'SIM-CA-12-DOC2', title: L('투어 바우처 출력본', 'Printed tour voucher'), pages: [L('바우처 SIMCA12V-A · 로키 겨울 투어 2026-12-14–12-21 · 숙소 Glacier Lodge(가상) · 2026-09-20 발행', 'Voucher SIMCA12V-A · Rockies winter tour 2026-12-14–12-21 · lodging Glacier Lodge (fictional) · issued 2026-09-20')] },
      { id: 'SIM-CA-12-DOC3', title: L('왕복 항공권', 'Return ticket'), pages: [L('탑승객 ARKWRIGHT/SELIN · 밴쿠버 도착 2026-12-17 · 귀국 2026-12-27', 'Passenger ARKWRIGHT/SELIN · arrives Vancouver 2026-12-17 · returns 2026-12-27')] }
    ],
    records: [
      { id: 'SIM-CA-12-REC1', title: L('투어 운영사 예약 조회(합성)', 'Tour operator booking (synthetic)'), detail: L('바우처 SIMCA12V-A 취소 · 재예약 SIMCA12V-B 2026-11-03 발행 · 세부 일정·숙소는 조회되지 않음', 'Voucher SIMCA12V-A cancelled · rebooking SIMCA12V-B issued 2026-11-03 · new dates and lodging not shown'), documentId: 'SIM-CA-12-DOC2' },
      { id: 'SIM-CA-12-REC2', title: L('숙소 예약 조회(합성)', 'Lodging booking (synthetic)'), detail: L('Glacier Lodge · 2026-12-14–12-21 예약 취소 · 같은 이름의 다른 예약 없음', 'Glacier Lodge · 2026-12-14–12-21 booking cancelled · no other booking under this name'), documentId: 'SIM-CA-12-DOC2' }
    ],
    facts: [
      { id: 'SIM-CA-12-F-VOUCHER', sourceType: 'document', sourceId: 'SIM-CA-12-DOC2', page: 0, label: L('바우처 A: 투어 2026-12-14–12-21 · Glacier Lodge', 'Voucher A: tour 2026-12-14–12-21 · Glacier Lodge') },
      { id: 'SIM-CA-12-F-TICKET', sourceType: 'document', sourceId: 'SIM-CA-12-DOC3', page: 0, label: L('항공권: 2026-12-17 도착 · 2026-12-27 귀국', 'Ticket: arrives 2026-12-17 · returns 2026-12-27') },
      { id: 'SIM-CA-12-F-REBOOK', sourceType: 'record', sourceId: 'SIM-CA-12-REC1', label: L('운영사 기록: 바우처 A 취소 · 재예약 B 발행(세부 미표시)', 'Operator record: voucher A cancelled · rebooking B issued (details not shown)') },
      { id: 'SIM-CA-12-F-LODGE', sourceType: 'record', sourceId: 'SIM-CA-12-REC2', label: L('숙소 기록: Glacier Lodge 예약 취소 · 다른 예약 없음', 'Lodging record: Glacier Lodge booking cancelled · no other booking') },
      { id: 'SIM-CA-12-F-STMT', sourceType: 'statement', sourceId: 'SIM-CA-12-STMT', questionIds: ['ca12_dates'], label: L('진술: 투어 회사가 일정을 옮겨 주었습니다. 새 바우처는 이메일로 받았는데 출력해 온 것은 예전 것입니다', 'Statement: The tour company moved my dates. I got the new voucher by email, but the one I printed is the old one') },
      { id: 'SIM-CA-12-F-REQ', sourceType: 'request', sourceId: 'SIM-CA-12-REQ-VOUCHER', requestId: 'SIM-CA-12-REQ-VOUCHER', label: L('보완 요청: 재예약 바우처 SIMCA12V-B 사본 제출 대기', 'Request: copy of rebooked voucher SIMCA12V-B awaited') }
    ],
    questions: [
      { id: 'ca12_itinerary', q: L('여행 일정을 말씀해 주시겠습니까?', 'Could you walk me through your itinerary?'), answer: L('밴쿠버에 도착해서 로키 산맥 투어에 합류하고, 투어가 끝나면 밴쿠버에서 며칠 쉬다가 돌아갑니다.', 'I land in Vancouver, join the Rockies tour, and after the tour I rest in Vancouver for a few days before flying home.') },
      { id: 'ca12_return', q: L('언제 돌아가십니까?', 'When are you returning?'), answer: L('12월 27일에 돌아갑니다.', 'On 27 December.') },
      { id: 'ca12_dates', q: L('바우처의 투어 시작일은 12월 14일인데 도착은 17일입니다. 설명해 주시겠습니까?', 'The voucher has the tour starting on 14 December, but you arrive on the 17th. Can you explain?'), answer: L('항공편이 바뀌어서 투어 회사가 일정을 옮겨 주었습니다. 새 바우처는 이메일로 받았는데 출력해 온 것은 예전 것입니다.', 'My flight changed. The tour company moved my dates. I got the new voucher by email, but the one I printed is the old one.') },
      { id: 'ca12_phone', q: L('새 바우처를 지금 보여 주실 수 있습니까?', 'Can you show me the new voucher now?'), answer: L('휴대전화 배터리가 다 돼서 지금은 열 수 없습니다. 투어 회사에서 다시 보내 줄 수는 있습니다.', 'My phone battery is dead, so I cannot open it right now. The tour company can send it again.') }
    ],
    comparisons: [
      { id: 'COMP-CA-12-DATES', facts: ['SIM-CA-12-F-VOUCHER', 'SIM-CA-12-F-TICKET'], type: 'CONFLICT', findingId: 'CA12_TOUR_BEFORE_ARRIVAL', title: L('투어 시작이 도착보다 앞섬', 'Tour starts before arrival'), explanation: L('바우처의 투어는 12월 14일 시작인데 항공권 도착은 12월 17일입니다.', 'The voucher tour starts on 14 December, but the ticket arrives on 17 December.'), unlocks: { questions: ['ca12_dates'] } },
      { id: 'COMP-CA-12-REBOOK', facts: ['SIM-CA-12-F-VOUCHER', 'SIM-CA-12-F-REBOOK'], type: 'CONFLICT', findingId: 'CA12_VOUCHER_SUPERSEDED', title: L('제출 바우처 취소됨', 'Submitted voucher superseded'), explanation: L('운영사 기록상 제출한 바우처 A는 취소되었고 재예약 B가 발행되었습니다.', 'The operator record shows the submitted voucher A was cancelled and rebooking B issued.'), unlocks: { questions: ['ca12_phone'] } },
      { id: 'COMP-CA-12-STMT', facts: ['SIM-CA-12-F-STMT', 'SIM-CA-12-F-REBOOK'], type: 'MATCH', findingId: 'CA12_REBOOK_CONFIRMED', title: L('재예약 진술과 운영사 기록 일치', 'Rebooking statement matches operator record'), explanation: L('일정이 옮겨졌다는 진술이 운영사의 재예약 기록과 맞습니다. 다만 새 일정과 숙소는 아직 확인되지 않았습니다.', 'The statement that the dates moved fits the operator’s rebooking record. The new dates and lodging are still unconfirmed.') },
      { id: 'COMP-CA-12-LODGE', facts: ['SIM-CA-12-F-LODGE', 'SIM-CA-12-F-TICKET'], type: 'MISSING', findingId: 'CA12_NO_CURRENT_LODGING', title: L('체류 기간 숙소 미확인', 'No lodging evidenced for the stay'), explanation: L('기존 숙소 예약은 취소되었고 다른 예약은 없어, 12월 17일–27일 숙소를 보여 주는 자료가 없습니다.', 'The original lodging was cancelled and no other booking exists, so nothing shows where she stays from 17 to 27 December.'), unlocks: { requests: ['SIM-CA-12-REQ-VOUCHER'] } },
      { id: 'COMP-CA-12-REQ', facts: ['SIM-CA-12-F-REBOOK', 'SIM-CA-12-F-REQ'], type: 'UNVERIFIED', findingId: 'CA12_NEW_VOUCHER_REQUESTED', title: L('재예약 바우처 요청', 'Rebooked voucher requested'), explanation: L('재예약 B의 일정과 숙소를 확인할 바우처를 특정해 요청했습니다. 접수 후 항공권과 대조합니다.', 'The voucher showing rebooking B’s dates and lodging has been requested by reference. It will be compared with the ticket on receipt.') }
    ],
    requests: [
      { id: 'SIM-CA-12-REQ-VOUCHER', title: L('재예약 바우처 SIMCA12V-B 사본 요청', 'Request a copy of rebooked voucher SIMCA12V-B'), result: L('요청 기록됨: 재예약 바우처 SIMCA12V-B 사본 제출 대기. 접수 후 투어 일정과 숙소를 항공권과 대조합니다.', 'Request logged: copy of rebooked voucher SIMCA12V-B awaited. Tour dates and lodging will be compared with the ticket on receipt.') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('재예약 사실은 확인되었지만 새 일정과 숙소는 어느 자료에도 없습니다. 체류 기간의 숙소가 비어 있는 채로 검토를 닫을 수 없습니다.', 'The rebooking is confirmed, but no source shows the new dates or lodging. The review cannot close with the stay unaccounted for.'),
      evidence: L('진술은 운영사 기록과 맞고, 빠진 것은 재예약 바우처 하나입니다. 그 자료를 특정해 요청하는 것이 근거와 맞습니다.', 'The statement fits the operator record and the single gap is the rebooked voucher. Requesting that specific item matches the evidence.'),
      review: L('진술과 기록이 서로 맞으므로 해소되지 않는 상충은 없습니다. 특정 자료 하나로 확인할 수 있으니 추가 검토는 이릅니다.', 'The statement and the record agree, so there is no unresolvable conflict. One specific document can confirm the rest, so referral is premature.')
    },
    assessment: {
      issue: ['CA12_TOUR_BEFORE_ARRIVAL', 'CA12_VOUCHER_SUPERSEDED'],
      distinguish: ['CA12_REBOOK_CONFIRMED'],
      resolve: { findings: ['CA12_NO_CURRENT_LODGING', 'CA12_NEW_VOUCHER_REQUESTED'], questions: ['ca12_dates', 'ca12_phone'], requests: ['SIM-CA-12-REQ-VOUCHER'] },
      feedback: {
        issueHit: L('바우처와 항공권 상충 확인', 'Voucher–ticket conflict identified'), issueMiss: L('바우처와 항공권 미대조', 'Voucher not compared with ticket'),
        resolveHit: L('숙소 공백 확인 후 재예약 바우처 요청', 'Lodging gap found and rebooked voucher requested'), resolveMiss: L('숙소 공백 또는 보완 요청 누락', 'Lodging gap or request missed')
      }
    },
    debrief: L('여러 자료가 얽힌 사건은 각 상충의 원인을 따로 확인합니다. 날짜 차이는 재예약 기록으로 설명되지만, 그 결과 숙소 자료가 비게 되었습니다. 남은 공백을 메울 자료 하나를 특정해 요청합니다.', 'In a multi-source case, trace each conflict separately. The date gap is explained by the rebooking record, but that leaves no lodging evidence. Request the one document that closes the remaining gap.'),
    sources: ['CA-ENF4', 'CA-IRPA']
  }
];
