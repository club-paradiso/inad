// New Zealand · authored synthetic exercises (v11 scenario contract, docs/v11/SCENARIO_SCHEMA.md).
// Fictional people, applications and records at fictional Auckland/Christchurch review desks.
// Activity-oriented review (application context → assigned activity → hand over), per NZ-A16.
// Outcomes are SIMULATION_RULE feedback, never a legal determination or visa decision.
const L = (ko, en) => ({ ko, en });
const NOTICE = L('합성 문서 · 보안특징 및 진위 판별 기능 없음', 'Synthetic document · no security-feature or authenticity checking');
const SOURCE_Q = L('어느 자료를 확인하면 됩니까?', 'Which evidence should we check?');
const SOURCE_A = L('현재 접수된 제출 자료와 연결 기록을 함께 확인해 주세요.', 'Please compare the submitted evidence with the linked record.');

export const CASES = [
  // ── SIM-NZ-01 · legacy (identifiers preserved) ─────────────────────────────
  {
    id: 'SIM-NZ-01', countryId: 'NZ', personId: 'SIM-NZ-P01', name: 'Sam Linden',
    difficulty: 'intro', category: 'identity',
    title: L('다른 신청의 식별자', 'Different application identifier'),
    brief: L('배정 활동의 첨부 표지에 적힌 신청 번호가 현재 대상의 신청 번호와 다릅니다.', 'The application number on the attachment cover does not match the current application.'),
    profile: [
      { label: L('배정 활동', 'Assigned activity'), value: L('신청서에 첨부된 추천서 확인', 'Verify the reference letter attached to the application') },
      { label: L('제출 자료', 'Submitted'), value: L('신청 요약 · 첨부 표지 · 첨부 문서', 'Application summary · attachment cover · attachment') }
    ],
    opening: L('안녕하세요. 제 신청서를 확인하신다고 들었습니다.', 'Hello. I was told you are checking my application.'),
    documents: [
      { id: 'SIM-NZ-01-DOC1', title: L('제출 자료', 'Submitted evidence'), pages: [L('현재 신청 번호: SIM-NZ-A01 · 신청인 Sam Linden', 'Current application: SIM-NZ-A01 · applicant Sam Linden'), NOTICE] },
      { id: 'SIM-NZ-01-DOC2', title: L('연결 기록', 'Linked record'), pages: [L('첨부 표지: SIM-NZ-A90 · 첨부 1쪽', 'Attachment cover: SIM-NZ-A90 · 1 page attached')] },
      { id: 'SIM-NZ-01-DOC3', title: L('첨부 문서', 'Attached document'), pages: [L('추천서: 신청인 "S. Lindgren-Hart" · 발행 Harbourside Joinery(더니든) · 2026-10-19', 'Reference letter: applicant "S. Lindgren-Hart" · issued by Harbourside Joinery, Dunedin · 2026-10-19')] }
    ],
    records: [
      { id: 'SIM-NZ-01-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('현재 신청 번호: SIM-NZ-A01 · 신청인 Sam Linden', 'Current application: SIM-NZ-A01 · applicant Sam Linden'), documentId: 'SIM-NZ-01-DOC1' },
      { id: 'SIM-NZ-01-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('첨부 표지: SIM-NZ-A90 · 첨부 1쪽', 'Attachment cover: SIM-NZ-A90 · 1 page attached'), documentId: 'SIM-NZ-01-DOC2' },
      { id: 'SIM-NZ-01-REC3', title: L('신청 색인 조회', 'Application index search'), detail: L('SIM-NZ-A90: 다른 고객(SIM-NZ-P90)이 접수한 신청 · SIM-NZ-P01과 연결 없음', 'SIM-NZ-A90: lodged by a different client (SIM-NZ-P90) · no link to SIM-NZ-P01'), documentId: 'SIM-NZ-01-DOC2' }
    ],
    facts: [
      { id: 'SIM-NZ-01-F-APP', sourceType: 'document', sourceId: 'SIM-NZ-01-DOC1', page: 0, label: L('현재 신청 번호: SIM-NZ-A01', 'Current application: SIM-NZ-A01') },
      { id: 'SIM-NZ-01-F-COVER', sourceType: 'document', sourceId: 'SIM-NZ-01-DOC2', page: 0, label: L('첨부 표지: SIM-NZ-A90', 'Attachment cover: SIM-NZ-A90') },
      { id: 'SIM-NZ-01-F-INDEX', sourceType: 'record', sourceId: 'SIM-NZ-01-REC3', label: L('색인: A90은 다른 고객 P90의 신청', 'Index: A90 belongs to a different client, P90') },
      { id: 'SIM-NZ-01-F-ATTACH', sourceType: 'document', sourceId: 'SIM-NZ-01-DOC3', page: 0, label: L('첨부 추천서: 신청인 S. Lindgren-Hart, 더니든 목공소', 'Attached reference: applicant S. Lindgren-Hart, Dunedin joinery') },
      { id: 'SIM-NZ-01-F-LETTER', sourceType: 'statement', sourceId: 'SIM-NZ-01-STMT', questionIds: ['nz01_letter'], label: L('진술: 블레넘 포도원 고용주의 추천서 한 쪽 제출', 'Statement: submitted a one-page reference from a Blenheim vineyard employer') }
    ],
    questions: [
      { id: 'clarify', q: L('자료와 기록의 차이를 설명해 주세요.', 'Please explain the relationship between these records.'), answer: L('제 신청 번호는 A01입니다. 다른 번호는 처음 봅니다.', 'My application number is A01. I don\'t recognise the other number.') },
      { id: 'source', q: SOURCE_Q, answer: SOURCE_A },
      { id: 'crosscheck', q: L('현재 신청 번호와 첨부 표지의 번호가 같습니까?', 'Does the attachment cover match the current application identifier?'), answer: L('표지를 따로 만든 적은 없습니다. 제가 아는 번호는 A01뿐입니다.', 'I never made a cover sheet. The only number I know is A01.') },
      { id: 'nz01_letter', q: L('신청서와 함께 어떤 추천서를 제출하셨습니까?', 'Which reference letter did you submit with your application?'), answer: L('블레넘에 있는 포도원 고용주가 써 준 한 쪽짜리 추천서입니다. 포도원 매니저가 서명했습니다.', 'A one-page letter from my employer at a vineyard in Blenheim. The vineyard manager signed it.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-01-ID', facts: ['SIM-NZ-01-F-APP', 'SIM-NZ-01-F-COVER'], type: 'CONFLICT', findingId: 'NZ01_APP_ID_CONFLICT', title: L('신청 번호 불일치', 'Application number conflict'), explanation: L('현재 신청(A01)과 첨부 표지(A90)의 번호가 다릅니다.', 'The current application (A01) and the attachment cover (A90) carry different numbers.'), unlocks: { questions: ['nz01_letter'] } },
      { id: 'COMP-NZ-01-INDEX', facts: ['SIM-NZ-01-F-COVER', 'SIM-NZ-01-F-INDEX'], type: 'MATCH', findingId: 'NZ01_ATTACHMENT_OTHER_FILE', title: L('첨부는 다른 신청의 것', 'Attachment belongs to another file'), explanation: L('색인 조회 결과 A90은 다른 고객의 신청이므로 첨부가 잘못 편철되었습니다.', 'The index shows A90 is another client\'s application, so the attachment has been misfiled into this one.') },
      { id: 'COMP-NZ-01-LETTER', facts: ['SIM-NZ-01-F-LETTER', 'SIM-NZ-01-F-ATTACH'], type: 'CONFLICT', findingId: 'NZ01_LETTER_NOT_APPLICANTS', title: L('진술한 추천서와 첨부 불일치', 'Described letter differs from attachment'), explanation: L('진술한 블레넘 포도원 추천서가 아니라 다른 이름의 더니든 목공소 추천서가 첨부되어 있습니다.', 'The attachment is a Dunedin joinery reference in another name, not the Blenheim vineyard letter described.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('배정 활동은 이 신청인의 추천서 확인입니다. 다른 신청의 문서로 활동을 완료하면 잘못된 근거가 기록에 남습니다.', 'The activity is to verify this applicant\'s reference. Completing it on another application\'s document leaves the wrong evidence on the file.'),
      evidence: L('본인 추천서는 나중에 필요할 수 있지만, 먼저 다른 신청의 문서가 이 파일에 편철된 오류를 분리해 넘겨야 합니다. 편철 오류는 자료 누락이 아닙니다.', 'The applicant\'s own letter may be needed later, but first another application\'s document must be separated from this file. A misfiling is not missing evidence.'),
      review: L('잘못 편철된 첨부를 분리하고 파일 정정을 추가 검토로 넘기는 것이 근거와 맞습니다. 다른 대상의 서류로 판단하지 않습니다.', 'Separating the misfiled attachment and referring the file correction for further review matches the evidence. Nothing is decided on another person\'s document.')
    },
    assessment: {
      issue: ['NZ01_APP_ID_CONFLICT'],
      distinguish: ['NZ01_LETTER_NOT_APPLICANTS'],
      resolve: { findings: ['NZ01_ATTACHMENT_OTHER_FILE'], questions: ['nz01_letter'], requests: [] },
      feedback: {
        issueHit: L('신청 번호 불일치 확인', 'Application number conflict found'), issueMiss: L('첨부 표지 번호 미대조', 'Attachment cover number not compared'),
        resolveHit: L('첨부가 다른 신청의 것임을 확인', 'Attachment traced to another application'), resolveMiss: L('색인 조회 또는 추천서 진술 미대조', 'Index search or letter statement not compared')
      }
    },
    debrief: L('다른 신청의 첨부를 분리하고 추가 검토로 넘깁니다. 다른 대상의 서류로 판정하지 않습니다.', 'Separate the mismatched attachment and refer for review. Do not decide on another file.'),
    sources: ['NZ-A16', 'NZ-ACT']
  },

  // ── SIM-NZ-02 · legacy (identifiers preserved; tests depend on this case) ──
  {
    id: 'SIM-NZ-02', countryId: 'NZ', personId: 'SIM-NZ-P02', name: 'Robin Ash',
    difficulty: 'intro', category: 'missing',
    title: L('누락된 자료 요청', 'Request missing evidence'),
    brief: L('체류 계획은 1쪽만 접수되었고 둘째 페이지가 접수 확인에서 빠져 있습니다.', 'Only page one of the stay plan was received; page two is missing from the receipt.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('관광 · 오클랜드와 로토루아', 'Holiday · Auckland and Rotorua') },
      { label: L('체류 기간', 'Stated stay'), value: L('12일 (12월 3일–14일)', '12 days (3–14 December)') },
      { label: L('제출 자료', 'Submitted'), value: L('체류 계획(2쪽 중 1쪽) · 접수 확인', 'Stay plan (1 of 2 pages) · receipt check') }
    ],
    opening: L('안녕하세요. 체류 계획 때문에 연락 주셨다고 들었습니다.', 'Hello. I understand there is a question about my stay plan.'),
    documents: [
      { id: 'SIM-NZ-02-DOC1', title: L('제출 자료', 'Submitted evidence'), pages: [L('체류 계획 1쪽(전체 2쪽): 일정 요약 · 오클랜드 12월 3–9일, 로토루아 12월 10–14일', 'Stay plan page 1 of 2: trip summary · Auckland 3–9 Dec, Rotorua 10–14 Dec'), NOTICE] },
      { id: 'SIM-NZ-02-DOC2', title: L('연결 기록', 'Linked record'), pages: [L('접수 확인: 둘째 페이지 미접수 · 2쪽 중 1쪽 보관', 'Receipt check: page two not received · 1 of 2 pages on file')] }
    ],
    records: [
      { id: 'SIM-NZ-02-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('체류 계획 1쪽(전체 2쪽): 일정 요약 · 오클랜드 12월 3–9일, 로토루아 12월 10–14일', 'Stay plan page 1 of 2: trip summary · Auckland 3–9 Dec, Rotorua 10–14 Dec'), documentId: 'SIM-NZ-02-DOC1' },
      { id: 'SIM-NZ-02-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('접수 확인: 둘째 페이지 미접수 · 2쪽 중 1쪽 보관', 'Receipt check: page two not received · 1 of 2 pages on file'), documentId: 'SIM-NZ-02-DOC2' }
    ],
    facts: [
      { id: 'SIM-NZ-02-F-PAGE1', sourceType: 'document', sourceId: 'SIM-NZ-02-DOC1', page: 0, label: L('체류 계획 1쪽: 일정 요약 접수', 'Stay plan page 1: trip summary received') },
      { id: 'SIM-NZ-02-F-RECEIPT-PAGE2', sourceType: 'document', sourceId: 'SIM-NZ-02-DOC2', page: 0, label: L('접수 확인: 둘째 페이지 미접수', 'Receipt check: page two not received') },
      { id: 'SIM-NZ-02-F-PAGE2-DETAIL', sourceType: 'statement', sourceId: 'SIM-NZ-02-STMT', questionIds: ['nz02_missing_page'], label: L('진술: 2쪽에 숙박 계획 포함 (보완 제출 가능)', 'Statement: Page 2 contains accommodation details') },
      { id: 'SIM-NZ-02-F-REQUESTED', sourceType: 'request', sourceId: 'SIM-NZ-02-REQ-PAGE2', requestId: 'SIM-NZ-02-REQ-PAGE2', label: L('요청 결과: 2쪽 보완 요청 기록 · 접수 대기', 'Request result: page 2 requested · awaiting receipt') }
    ],
    questions: [
      { id: 'clarify', q: L('자료와 기록의 차이를 설명해 주세요.', 'Please explain the relationship between these records.'), answer: L('체류 계획은 파일 하나로 보냈습니다. 일부가 안 들어갔다면 다시 보내겠습니다.', 'I sent the whole stay plan as one file. If part of it did not come through, I will send it again.') },
      { id: 'source', q: SOURCE_Q, answer: SOURCE_A },
      { id: 'crosscheck', q: L('체류 계획의 몇 쪽이 접수 확인에서 빠져 있습니까?', 'Which page of the stay plan is missing from the receipt?'), answer: L('잘 모르겠습니다. 두 쪽 다 올라간 줄 알았습니다.', 'I am not sure. I thought both pages had uploaded.') },
      { id: 'nz02_missing_page', q: L('누락된 체류 계획 둘째 쪽에는 어떤 내용이 있습니까?', 'What is on the missing page 2 of the stay plan?'), answer: L('둘째 쪽은 숙박 계획입니다. 오클랜드에서는 사촌 집에, 로토루아에서는 로지에 묵습니다. 바로 보완 제출하겠습니다.', 'Page 2 is my accommodation plan: my cousin\'s place in Auckland, then a lodge in Rotorua. I can submit it straight away.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-02-MISSING', facts: ['SIM-NZ-02-F-PAGE1', 'SIM-NZ-02-F-RECEIPT-PAGE2'], type: 'MISSING', findingId: 'NZ02_PAGE2_MISSING', title: L('체류 계획 2쪽 미접수 확인', 'Page 2 missing'), explanation: L('체류 계획은 2쪽 중 1쪽만 접수되었습니다. 2쪽이 접수 확인에 없습니다.', 'Only page 1 of the two-page stay plan is on file; page 2 is absent from the receipt.'), unlocks: { questions: ['nz02_missing_page'], requests: ['SIM-NZ-02-REQ-PAGE2'] } },
      { id: 'COMP-NZ-02-STMT-PAGE2', facts: ['SIM-NZ-02-F-RECEIPT-PAGE2', 'SIM-NZ-02-F-PAGE2-DETAIL'], type: 'MATCH', findingId: 'NZ02_PAGE2_CONFIRMED', title: L('누락 진술 부합', 'Omission confirmed'), explanation: L('누락된 2쪽의 내용(숙박 계획)과 보완 제출 의사를 확인했습니다.', 'The content of the missing page (accommodation plan) and the offer to supply it are confirmed.') },
      { id: 'COMP-NZ-02-PENDING', facts: ['SIM-NZ-02-F-REQUESTED', 'SIM-NZ-02-F-PAGE2-DETAIL'], type: 'UNVERIFIED', findingId: 'NZ02_PAGE2_PENDING', title: L('2쪽 원문 미접수', 'Page itself not yet on file'), explanation: L('진술은 2쪽 내용을 설명하지만 2쪽 원문은 아직 접수되지 않았습니다.', 'The statement describes page 2, but the page itself has not yet been received.') }
    ],
    requests: [
      { id: 'SIM-NZ-02-REQ-PAGE2', title: L('체류 계획 2쪽 요청', 'Request stay plan page 2'), result: L('요청 기록됨: 체류 계획 2쪽(숙박 계획) 보완 제출 요청 · 접수 대기', 'Request recorded: stay plan page 2 (accommodation plan) requested from the applicant · awaiting receipt') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('숙박 계획이 적힌 2쪽이 접수되지 않았습니다. 진술만으로 누락된 쪽을 대신해 검토를 닫을 수 없습니다.', 'The page with the accommodation plan has not been received. The statement cannot stand in for the missing page.'),
      evidence: L('누락된 2쪽과 필요한 정보(숙박 계획)를 특정해 요청하는 것이 근거와 맞습니다. 보완 기회를 제공합니다.', 'Requesting the specific missing page and the information it holds (accommodation) matches the evidence and gives the chance to supply it.'),
      review: L('자료 사이에 상충은 없습니다. 쪽이 빠졌을 뿐이며 신청인이 바로 보완할 수 있습니다.', 'Nothing conflicts. A page is missing, and the applicant can supply it straight away.')
    },
    assessment: {
      issue: ['NZ02_PAGE2_MISSING'],
      distinguish: ['NZ02_PAGE2_MISSING'],
      resolve: { findings: ['NZ02_PAGE2_CONFIRMED'], questions: ['nz02_missing_page'], requests: ['SIM-NZ-02-REQ-PAGE2'] },
      feedback: {
        issueHit: L('2쪽 누락 확인', 'Missing page 2 identified'), issueMiss: L('체류 계획 쪽수 미대조', 'Stay plan pages not compared'),
        resolveHit: L('누락 내용 특정 후 보완 요청', 'Missing content specified and requested'), resolveMiss: L('누락 내용 확인 또는 보완 요청 미완료', 'Missing content not confirmed or not requested')
      }
    },
    debrief: L('누락된 둘째 페이지와 필요한 정보(숙박 계획)를 특정해 요청합니다. 절차상 보완 기회를 제공합니다.', 'Request the missing page and specify needed details. Provide the procedural chance to supply it.'),
    sources: ['NZ-A16', 'NZ-Y35']
  },

  // ── SIM-NZ-03 · legacy (identifiers preserved) ─────────────────────────────
  {
    id: 'SIM-NZ-03', countryId: 'NZ', personId: 'SIM-NZ-P03', name: 'Drew Vale',
    difficulty: 'intro', category: 'record',
    title: L('활동 결과와 후속 메모', 'Activity outcome and follow-up note'),
    brief: L('자료 확인 활동의 완료 번호와 후속 메모의 참조 번호가 일치합니다.', 'The completed activity reference and follow-up note reference agree.'),
    profile: [
      { label: L('배정 활동', 'Assigned activity'), value: L('자금 자료 확인 결과 재확인', 'Re-check the completed funds evidence activity') },
      { label: L('제출 자료', 'Submitted'), value: L('활동 기록 · 후속 메모 · 은행 잔고 요약', 'Activity record · follow-up note · bank statement summary') }
    ],
    opening: L('안녕하세요. 서류 확인이 남았다고 해서 왔습니다.', 'Hello. I was told there was a document check still open.'),
    documents: [
      { id: 'SIM-NZ-03-DOC1', title: L('제출 자료', 'Submitted evidence'), pages: [L('완료 활동: 자료 SIM-NZ-A03 / SIM-NZ-E03 확인 · 2026-11-06', 'Completed activity: verified SIM-NZ-A03 / SIM-NZ-E03 · 2026-11-06'), NOTICE] },
      { id: 'SIM-NZ-03-DOC2', title: L('연결 기록', 'Linked record'), pages: [L('후속 메모: 참조 SIM-NZ-A03 / SIM-NZ-E03 부합', 'Follow-up note: matches SIM-NZ-A03 / SIM-NZ-E03')] },
      { id: 'SIM-NZ-03-DOC3', title: L('증빙 SIM-NZ-E03', 'Evidence item SIM-NZ-E03'), pages: [L('은행 잔고 요약 · 예금주 Drew Vale · 신청 SIM-NZ-A03 · 발행 2026-11-02', 'Bank statement summary · holder Drew Vale · application SIM-NZ-A03 · issued 2026-11-02')] }
    ],
    records: [
      { id: 'SIM-NZ-03-REC1', title: L('현재 접수 기록', 'Current submission'), detail: L('완료 활동: 자료 SIM-NZ-A03 / SIM-NZ-E03 확인 · 2026-11-06', 'Completed activity: verified SIM-NZ-A03 / SIM-NZ-E03 · 2026-11-06'), documentId: 'SIM-NZ-03-DOC1' },
      { id: 'SIM-NZ-03-REC2', title: L('관련 기록 · 대조 필요', 'Related record · compare identifiers'), detail: L('후속 메모: 참조 SIM-NZ-A03 / SIM-NZ-E03 부합', 'Follow-up note: matches SIM-NZ-A03 / SIM-NZ-E03'), documentId: 'SIM-NZ-03-DOC2' },
      { id: 'SIM-NZ-03-REC3', title: L('증빙 색인', 'Evidence index'), detail: L('SIM-NZ-E03: SIM-NZ-A03에만 연결 · 1건 · 접수 2026-11-03 · 이후 추가 접수 없음', 'SIM-NZ-E03: linked to SIM-NZ-A03 only · one item · received 2026-11-03 · nothing received since'), documentId: 'SIM-NZ-03-DOC3' }
    ],
    facts: [
      { id: 'SIM-NZ-03-F-ACTIVITY', sourceType: 'document', sourceId: 'SIM-NZ-03-DOC1', page: 0, label: L('완료 활동: A03 / E03 확인', 'Completed activity: A03 / E03 verified') },
      { id: 'SIM-NZ-03-F-NOTE', sourceType: 'document', sourceId: 'SIM-NZ-03-DOC2', page: 0, label: L('후속 메모: A03 / E03 참조', 'Follow-up note: refers to A03 / E03') },
      { id: 'SIM-NZ-03-F-EVIDENCE', sourceType: 'document', sourceId: 'SIM-NZ-03-DOC3', page: 0, label: L('증빙 E03: 예금주 Drew Vale, 신청 A03', 'Evidence E03: holder Drew Vale, application A03') },
      { id: 'SIM-NZ-03-F-INDEX', sourceType: 'record', sourceId: 'SIM-NZ-03-REC3', label: L('색인: E03은 A03에만 연결, 11월 3일 이후 추가 접수 없음', 'Index: E03 linked to A03 only, nothing received after 3 Nov') },
      { id: 'SIM-NZ-03-F-NONEW', sourceType: 'statement', sourceId: 'SIM-NZ-03-STMT', questionIds: ['nz03_since'], label: L('진술: 11월 초 은행 자료 1회 제출, 이후 추가 제출 없음', 'Statement: sent the bank statement once in early November, nothing since') }
    ],
    questions: [
      { id: 'clarify', q: L('자료와 기록의 차이를 설명해 주세요.', 'Please explain the relationship between these records.'), answer: L('제 신청은 A03 하나뿐입니다. 다른 신청은 없습니다.', 'I only have the one application, A03. There is no other.') },
      { id: 'source', q: SOURCE_Q, answer: SOURCE_A },
      { id: 'crosscheck', q: L('자료 확인 활동과 후속 메모가 가리키는 참조번호는 무엇입니까?', 'Which references do the evidence activity and follow-up note share?'), answer: L('내부 메모는 제가 볼 수 없지만, 제 신청 번호는 A03입니다.', 'I cannot see your notes, but my application number is A03.') },
      { id: 'nz03_since', q: L('활동이 완료된 뒤 새로 제출한 자료가 있습니까?', 'Have you sent anything new since the activity was completed?'), answer: L('아니요, 없습니다. 은행 자료는 11월 초에 한 번 보냈고 그 뒤로는 아무것도 보내지 않았습니다.', 'No, nothing. I sent the bank statement once, at the start of November, and nothing after that.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-03-REFS', facts: ['SIM-NZ-03-F-ACTIVITY', 'SIM-NZ-03-F-NOTE'], type: 'MATCH', findingId: 'NZ03_REFS_MATCH', title: L('활동과 메모의 참조 일치', 'Activity and note references agree'), explanation: L('완료 활동과 후속 메모가 같은 신청(A03)과 증빙(E03)을 가리킵니다.', 'The completed activity and the follow-up note point to the same application (A03) and evidence item (E03).'), unlocks: { questions: ['nz03_since'] } },
      { id: 'COMP-NZ-03-EVIDENCE', facts: ['SIM-NZ-03-F-EVIDENCE', 'SIM-NZ-03-F-INDEX'], type: 'MATCH', findingId: 'NZ03_EVIDENCE_LINKED', title: L('증빙이 이 신청에 연결됨', 'Evidence linked to this application'), explanation: L('증빙 E03의 예금주와 신청 번호가 색인과 일치하며 다른 신청에 연결되어 있지 않습니다.', 'E03\'s holder and application number agree with the index; it is not linked to any other application.'), unlocks: { requests: ['SIM-NZ-03-REQ-NEWSTMT'] } },
      { id: 'COMP-NZ-03-NONEW', facts: ['SIM-NZ-03-F-NONEW', 'SIM-NZ-03-F-INDEX'], type: 'MATCH', findingId: 'NZ03_NO_NEW_EVIDENCE', title: L('추가 자료 없음 확인', 'No newer evidence'), explanation: L('추가 제출이 없다는 진술이 색인과 맞습니다. 완료된 활동의 근거가 바뀌지 않았습니다.', 'The statement that nothing new was sent agrees with the index; the basis of the completed activity is unchanged.') }
    ],
    requests: [
      { id: 'SIM-NZ-03-REQ-NEWSTMT', title: L('최신 은행 잔고 자료 요청', 'Request an updated bank statement'), result: L('요청 기록됨. 기존 자료가 배정 활동을 이미 뒷받침하므로 새로 확인될 정보는 없습니다.', 'Request recorded. The existing statement already supports the assigned activity; no new information is expected.') }
    ],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('활동, 메모, 증빙, 색인이 모두 같은 신청을 가리키고 새 자료도 없습니다. 연습상 검토 완료이며 실제 비자 결정을 뜻하지 않습니다.', 'Activity, note, evidence and index all point to one application and nothing new arrived. Completing the exercise is not a visa decision.'),
      evidence: L('필요한 증빙은 이미 접수되어 확인되었습니다. 근거 없이 새 자료를 요구하면 불필요한 부담만 생깁니다.', 'The needed evidence is on file and verified. Asking for more without a reason only adds an unnecessary burden.'),
      review: L('넘길 상충이나 미해결 사항이 없습니다. 일치하는 기록을 추가 검토로 보낼 이유가 없습니다.', 'There is no conflict or open point to hand over. Agreeing records give no reason for further review.')
    },
    assessment: {
      issue: ['NZ03_REFS_MATCH'],
      distinguish: ['NZ03_EVIDENCE_LINKED'],
      resolve: { findings: ['NZ03_EVIDENCE_LINKED', 'NZ03_NO_NEW_EVIDENCE'], questions: ['nz03_since'], requests: [] },
      feedback: {
        issueHit: L('활동과 메모의 참조 일치 확인', 'Activity and note references confirmed'), issueMiss: L('활동·메모 참조 미대조', 'Activity and note references not compared'),
        resolveHit: L('증빙 연결과 추가 자료 없음 확인', 'Evidence link and absence of new evidence confirmed'), resolveMiss: L('증빙 색인 또는 진술 미대조', 'Evidence index or statement not compared')
      }
    },
    debrief: L('배정 활동의 근거가 충분함을 확인했습니다. 불필요한 보완 요구 없이 검토를 마칩니다.', 'Confirmed the assigned activity is supported. Finish review without unnecessary requests.'),
    sources: ['NZ-A16']
  },

  // ── SIM-NZ-04 · NZeTA record vs passport number transposition ──────────────
  {
    id: 'SIM-NZ-04', countryId: 'NZ', personId: 'SIM-NZ-P04', name: 'Mila Horvat',
    difficulty: 'standard', category: 'identity',
    title: L('조회되지 않은 NZeTA', 'NZeTA not found'),
    brief: L('이전 근무조 인계 메모에 따르면 여권 번호로 NZeTA를 조회했으나 결과가 없었습니다. 재확인이 배정되었습니다.', 'The previous shift\'s handover note says an NZeTA search on the passport number returned nothing. A re-check has been assigned.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('관광 · 오클랜드와 노스랜드', 'Holiday · Auckland and Northland') },
      { label: L('체류 기간', 'Stated stay'), value: L('9일', '9 days') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 정보면 · NZeTA 승인 이메일 사본', 'Passport data page · copy of NZeTA approval email') }
    ],
    opening: L('안녕하세요. 제 NZeTA에 문제가 있나요? 출발 전에 승인 메일을 받았는데요.', 'Hello. Is there a problem with my NZeTA? I got an approval email before I left.'),
    documents: [
      { id: 'SIM-NZ-04-DOC1', title: L('여권 정보면 (합성)', 'Passport data page (synthetic)'), pages: [L('여권 번호 KX4718263 · Mila Horvat · 생년월일 1990-05-21 · 만료 2031-08-14', 'Passport no. KX4718263 · Mila Horvat · born 1990-05-21 · expires 2031-08-14'), NOTICE] },
      { id: 'SIM-NZ-04-DOC2', title: L('인계 메모', 'Handover note'), pages: [L('이전 근무조: 여권 KX4781263으로 NZeTA 조회 · 결과 없음 · 재확인 바람', 'Previous shift: NZeTA search on passport KX4781263 · no result · please re-check')] },
      { id: 'SIM-NZ-04-DOC3', title: L('NZeTA 승인 이메일 사본', 'NZeTA approval email copy'), pages: [L('NZeTA 승인 2026-10-30 · 여권 끝자리 …8263 · 신청인 Mila Horvat', 'NZeTA approved 2026-10-30 · passport ending …8263 · applicant Mila Horvat')] }
    ],
    records: [
      { id: 'SIM-NZ-04-REC1', title: L('NZeTA 조회 · KX4718263', 'NZeTA search · KX4718263'), detail: L('기록 있음 · 상태 승인 · Mila Horvat · 생년월일 1990-05-21 · 승인 2026-10-30', 'Record found · status approved · Mila Horvat · born 1990-05-21 · approved 2026-10-30'), documentId: 'SIM-NZ-04-DOC3' },
      { id: 'SIM-NZ-04-REC2', title: L('NZeTA 조회 · KX4781263', 'NZeTA search · KX4781263'), detail: L('해당 여권 번호로 조회된 기록 없음', 'No record held for this passport number'), documentId: 'SIM-NZ-04-DOC2' }
    ],
    facts: [
      { id: 'SIM-NZ-04-F-PASSPORT', sourceType: 'document', sourceId: 'SIM-NZ-04-DOC1', page: 0, label: L('여권 번호 KX4718263', 'Passport number KX4718263') },
      { id: 'SIM-NZ-04-F-NOTE', sourceType: 'document', sourceId: 'SIM-NZ-04-DOC2', page: 0, label: L('인계 메모 조회 번호 KX4781263', 'Handover note searched KX4781263') },
      { id: 'SIM-NZ-04-F-NZETA', sourceType: 'record', sourceId: 'SIM-NZ-04-REC1', label: L('NZeTA 기록: KX4718263 승인, 이름·생년월일 일치', 'NZeTA record: KX4718263 approved, name and date of birth agree') },
      { id: 'SIM-NZ-04-F-NORESULT', sourceType: 'record', sourceId: 'SIM-NZ-04-REC2', label: L('KX4781263 조회 결과 없음', 'No record for KX4781263') },
      { id: 'SIM-NZ-04-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-04-STMT', questionIds: ['nz04_applied'], label: L('진술: 지금 가진 여권 하나로 10월 말 신청', 'Statement: applied in late October with the one passport she holds') }
    ],
    questions: [
      { id: 'nz04_purpose', q: L('이번 방문 일정을 말씀해 주세요.', 'Please tell me about your plans for this visit.'), answer: L('오클랜드에서 나흘, 노스랜드에서 닷새 지내고 돌아갑니다.', 'Four days in Auckland, then five in Northland, and then I fly home.') },
      { id: 'nz04_email', q: L('NZeTA 승인 메일은 언제 받으셨습니까?', 'When did you receive the NZeTA approval email?'), answer: L('10월 30일에 받았습니다. 사본을 같이 냈습니다.', 'On 30 October. I handed in a copy with my passport.') },
      { id: 'nz04_applied', q: L('NZeTA는 어떤 여권으로 신청하셨습니까? 다른 여권이 있습니까?', 'Which passport did you use for the NZeTA? Do you hold any other passport?'), answer: L('10월 말에 지금 가진 이 여권으로 신청했습니다. 여권은 이것 하나뿐입니다.', 'I applied in late October with this passport. It is the only passport I have.') },
      { id: 'nz04_return', q: L('귀국 항공편은 언제입니까?', 'When is your return flight?'), answer: L('12월 12일 오클랜드 출발입니다.', 'It leaves Auckland on 12 December.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-04-NUMBER', facts: ['SIM-NZ-04-F-PASSPORT', 'SIM-NZ-04-F-NOTE'], type: 'CONFLICT', findingId: 'NZ04_NOTE_NUMBER_DIFFERS', title: L('메모의 여권 번호 상이', 'Note used a different number'), explanation: L('여권은 KX4718263인데 메모의 조회 번호는 KX4781263입니다. 가운데 두 자리가 뒤바뀌었습니다.', 'The passport reads KX4718263 but the note searched KX4781263: two middle digits are transposed.'), unlocks: { questions: ['nz04_applied'] } },
      { id: 'COMP-NZ-04-RECORD', facts: ['SIM-NZ-04-F-PASSPORT', 'SIM-NZ-04-F-NZETA'], type: 'MATCH', findingId: 'NZ04_NZETA_MATCHES', title: L('여권과 NZeTA 기록 일치', 'Passport matches NZeTA record'), explanation: L('정확한 여권 번호로 조회하면 이름·생년월일이 일치하는 승인 기록이 있습니다.', 'Searching the correct passport number returns an approved record with matching name and date of birth.') },
      { id: 'COMP-NZ-04-NORESULT', facts: ['SIM-NZ-04-F-NOTE', 'SIM-NZ-04-F-NORESULT'], type: 'MATCH', findingId: 'NZ04_NO_RESULT_EXPLAINED', title: L('결과 없음의 원인 확인', 'Empty search explained'), explanation: L('결과 없음은 뒤바뀐 번호로 조회했기 때문이며 신청인 기록의 문제가 아닙니다.', 'The empty result came from searching the transposed number, not from anything in the traveller\'s record.') },
      { id: 'COMP-NZ-04-STMT', facts: ['SIM-NZ-04-F-STMT', 'SIM-NZ-04-F-NZETA'], type: 'MATCH', findingId: 'NZ04_APPLIED_SAME_PASSPORT', title: L('신청 진술과 기록 일치', 'Statement matches record'), explanation: L('이 여권으로 10월 말 신청했다는 진술이 10월 30일 승인 기록과 맞습니다.', 'The statement that she applied with this passport in late October agrees with the 30 October approval.') }
    ],
    requests: [],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('결과 없음은 메모의 번호 전치 때문이었고 정확한 번호로는 일치하는 승인 기록이 있습니다. 연습상 검토 완료이며 실제 입국허가를 뜻하지 않습니다.', 'The empty search came from a transposed number in the note; the correct number has a matching approval. Completing the exercise does not grant entry.'),
      evidence: L('NZeTA 기록과 여권이 이미 일치합니다. 여행자에게 새 자료를 요구할 근거가 없습니다.', 'The NZeTA record and passport already agree. There is no basis to ask the traveller for anything more.'),
      review: L('메모의 기재 오류는 대조로 해소되었습니다. 이 오류를 여행자 문제로 넘기면 안 됩니다.', 'The note\'s transcription error is resolved by comparison. It must not be handed over as the traveller\'s problem.')
    },
    assessment: {
      issue: ['NZ04_NOTE_NUMBER_DIFFERS'],
      distinguish: ['NZ04_NO_RESULT_EXPLAINED'],
      resolve: { findings: ['NZ04_NZETA_MATCHES'], questions: ['nz04_applied'], requests: [] },
      feedback: {
        issueHit: L('메모의 번호 전치 확인', 'Transposed number in note found'), issueMiss: L('여권 번호와 메모 번호 미대조', 'Passport and note numbers not compared'),
        resolveHit: L('정확한 번호로 NZeTA 기록 확인', 'NZeTA record confirmed on the correct number'), resolveMiss: L('NZeTA 기록 또는 신청 진술 미대조', 'NZeTA record or application statement not compared')
      }
    },
    debrief: L('의심은 인계 메모의 숫자 전치에서 생겼습니다. 여권 원문 번호로 다시 조회하고 진술과 대조하면 기록이 일치하므로 검토를 마칩니다.', 'The doubt came from transposed digits in the handover note. Re-searching the passport\'s own number and checking the statement shows the record agrees, so the review closes.'),
    sources: ['NZ-NZETA', 'NZ-A16']
  },

  // ── SIM-NZ-05 · change of circumstances after lodgement ───────────────────
  {
    id: 'SIM-NZ-05', countryId: 'NZ', personId: 'SIM-NZ-P05', name: 'Ana Ruatapu-Grey',
    difficulty: 'standard', category: 'referral',
    title: L('신청 후 바뀐 고용주', 'Employer changed after lodgement'),
    brief: L('배정 활동은 신청서에 적힌 고용 제안서 확인입니다. 최근 접수된 고용 제안서는 다른 회사 명의입니다.', 'The assigned activity is to verify the job offer named in the application. The most recently received offer letter is from a different company.'),
    profile: [
      { label: L('신청 맥락', 'Application context'), value: L('취업 신청(모의) SIM-NZ-A05 · 접수 2026-11-02', 'Work application (simulated) SIM-NZ-A05 · lodged 2026-11-02') },
      { label: L('배정 활동', 'Assigned activity'), value: L('신청서상 고용 제안서 확인 · 범위 밖 사항은 인계', 'Verify the job offer named in the application · hand over anything outside it') },
      { label: L('제출 자료', 'Submitted'), value: L('신청 요약 · 새 고용 제안서 · 활동 지시', 'Application summary · new offer letter · activity sheet') }
    ],
    opening: L('안녕하세요. 새 고용 제안서를 보냈는데 잘 들어갔는지 궁금했습니다.', 'Hello. I sent a new job offer letter and wanted to check it arrived.'),
    documents: [
      { id: 'SIM-NZ-05-DOC1', title: L('신청 요약', 'Application summary'), pages: [L('신청 SIM-NZ-A05 · 접수 2026-11-02 · 고용주 Kōwhai Orchards Ltd(호크스베이) · 직무 과수원 감독', 'Application SIM-NZ-A05 · lodged 2026-11-02 · employer Kōwhai Orchards Ltd, Hawke\'s Bay · role orchard supervisor'), NOTICE] },
      { id: 'SIM-NZ-05-DOC2', title: L('새 고용 제안서', 'New offer letter'), pages: [L('Southern Cross Packhouse Ltd(넬슨) · 직무 포장장 코디네이터 · 시작 2026-12-07 · 작성 2026-11-20', 'Southern Cross Packhouse Ltd, Nelson · role packhouse coordinator · start 2026-12-07 · dated 2026-11-20')] },
      { id: 'SIM-NZ-05-DOC3', title: L('배정 활동 지시', 'Activity sheet'), pages: [L('활동: 신청서에 기재된 고용 제안서를 신청 내용과 대조 · 활동 범위 밖 사항은 평가 담당자에게 인계', 'Activity: compare the job offer named in the application with the application details · hand anything outside this activity to the assessing officer')] }
    ],
    records: [
      { id: 'SIM-NZ-05-REC1', title: L('보관 중인 원 고용 제안서', 'Original offer on file'), detail: L('Kōwhai Orchards Ltd 고용 제안서 · 작성 2026-10-28 · 신청과 함께 2026-11-02 접수', 'Kōwhai Orchards Ltd offer letter · dated 2026-10-28 · received with the application on 2026-11-02'), documentId: 'SIM-NZ-05-DOC1' }
    ],
    facts: [
      { id: 'SIM-NZ-05-F-APP', sourceType: 'document', sourceId: 'SIM-NZ-05-DOC1', page: 0, label: L('신청서 고용주: Kōwhai Orchards, 과수원 감독', 'Application employer: Kōwhai Orchards, orchard supervisor') },
      { id: 'SIM-NZ-05-F-NEW', sourceType: 'document', sourceId: 'SIM-NZ-05-DOC2', page: 0, label: L('새 제안서: Southern Cross Packhouse, 11월 20일 작성', 'New offer: Southern Cross Packhouse, dated 20 Nov') },
      { id: 'SIM-NZ-05-F-ACTIVITY', sourceType: 'document', sourceId: 'SIM-NZ-05-DOC3', page: 0, label: L('활동 범위: 신청서상 제안서만 확인, 범위 밖은 인계', 'Activity scope: only the offer named in the application; hand over the rest') },
      { id: 'SIM-NZ-05-F-ORIG', sourceType: 'record', sourceId: 'SIM-NZ-05-REC1', label: L('원 제안서: Kōwhai Orchards, 10월 28일 작성', 'Original offer: Kōwhai Orchards, dated 28 Oct') },
      { id: 'SIM-NZ-05-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-05-STMT', questionIds: ['nz05_change'], label: L('진술: 11월 15일 원 직무 취소, 이후 포장장 제안 수락', 'Statement: original role cut on 15 Nov, then accepted the packhouse offer') }
    ],
    questions: [
      { id: 'nz05_letter', q: L('최근 어떤 서류를 보내셨습니까?', 'What did you send most recently?'), answer: L('11월 20일자 고용 제안서입니다. 받자마자 올렸습니다.', 'An offer letter dated 20 November. I uploaded it as soon as I got it.') },
      { id: 'nz05_role', q: L('신청서에 적은 직무를 말씀해 주세요.', 'Please describe the role named in your application.'), answer: L('호크스베이 과수원 감독 자리였습니다. 수확 인력을 관리하는 일이었습니다.', 'It was an orchard supervisor job in Hawke\'s Bay, managing the harvest crew.') },
      { id: 'nz05_change', q: L('신청 후 고용주가 바뀐 경위를 설명해 주시겠습니까?', 'Could you explain how your employer changed after you applied?'), answer: L('11월 15일에 Kōwhai Orchards에서 감독 자리가 없어졌다고 연락이 왔습니다. 며칠 뒤 Southern Cross에서 포장장 일을 제안해서 그 제안서를 보냈습니다.', 'On 15 November Kōwhai Orchards told me the supervisor role had been cut. A few days later Southern Cross offered me the packhouse job, so I sent their letter.') },
      { id: 'nz05_start', q: L('새 직무는 언제 시작합니까?', 'When does the new role start?'), answer: L('12월 7일부터입니다.', 'On 7 December.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-05-EMPLOYER', facts: ['SIM-NZ-05-F-APP', 'SIM-NZ-05-F-NEW'], type: 'CONFLICT', findingId: 'NZ05_EMPLOYER_CHANGED', title: L('신청서와 새 제안서의 고용주 상이', 'Employer differs from application'), explanation: L('신청서의 고용주와 직무가 새 제안서의 회사·직무와 다릅니다.', 'The employer and role in the application differ from the company and role in the new letter.'), unlocks: { questions: ['nz05_change'] } },
      { id: 'COMP-NZ-05-ORIG', facts: ['SIM-NZ-05-F-APP', 'SIM-NZ-05-F-ORIG'], type: 'MATCH', findingId: 'NZ05_ORIGINAL_MATCHES', title: L('원 제안서는 신청서와 일치', 'Original offer matches application'), explanation: L('접수 당시의 원 제안서는 신청서 내용과 일치합니다. 다만 이후 상황이 바뀌었습니다.', 'The original offer on file matches the application as lodged, but circumstances have since changed.') },
      { id: 'COMP-NZ-05-EXPLAINED', facts: ['SIM-NZ-05-F-NEW', 'SIM-NZ-05-F-STMT'], type: 'MATCH', findingId: 'NZ05_CHANGE_EXPLAINED', title: L('변경 경위 진술 부합', 'Change explained'), explanation: L('원 직무 취소 후 새 제안을 받았다는 진술이 11월 20일 제안서 날짜와 맞습니다.', 'The account of the role being cut and a new offer following fits the 20 November letter date.') },
      { id: 'COMP-NZ-05-SCOPE', facts: ['SIM-NZ-05-F-ACTIVITY', 'SIM-NZ-05-F-STMT'], type: 'UNVERIFIED', findingId: 'NZ05_OUTSIDE_ACTIVITY', title: L('변경 사항은 활동 범위 밖', 'Change lies outside the activity'), explanation: L('고용주 변경은 신청 후의 상황 변화로, 이 활동이 확인할 수 있는 범위를 넘습니다. 평가 담당자에게 인계할 사항입니다.', 'The new employer is a change in circumstances after lodgement, beyond what this activity can verify. It is a point for the assessing officer.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('원 제안서를 확인해 활동을 닫으면 이미 바뀐 사실을 근거로 기록이 남습니다. 변경 사항을 인계해야 합니다.', 'Closing the activity on the original offer records a fact that has already changed. The change must be handed over.'),
      evidence: L('새 제안서는 이미 접수되었고 경위도 설명되었습니다. 추가 자료로는 바뀐 제안이 신청에 어떻게 반영되는지를 판단할 수 없습니다.', 'The new letter is on file and the change is explained. More documents would not decide how the changed offer bears on the application.'),
      review: L('신청 후 상황 변화를 원문과 진술로 정리해 평가 담당자에게 인계하는 것이 활동 범위와 근거에 맞습니다.', 'Recording the post-lodgement change with its sources and handing it to the assessing officer fits both the activity scope and the evidence.')
    },
    assessment: {
      issue: ['NZ05_EMPLOYER_CHANGED'],
      distinguish: ['NZ05_ORIGINAL_MATCHES'],
      resolve: { findings: ['NZ05_CHANGE_EXPLAINED', 'NZ05_OUTSIDE_ACTIVITY'], questions: ['nz05_change'], requests: [] },
      feedback: {
        issueHit: L('고용주 변경 확인', 'Change of employer identified'), issueMiss: L('신청서와 새 제안서 미대조', 'Application and new letter not compared'),
        resolveHit: L('변경 경위와 활동 범위 정리', 'Change explained and scoped for handover'), resolveMiss: L('변경 경위 또는 활동 범위 미확인', 'Change explanation or activity scope not established')
      }
    },
    debrief: L('원 제안서는 신청서와 맞지만 신청 후 고용주가 바뀌었습니다. 활동 범위 안에서 사실을 정리하고, 변경이 신청에 미치는 영향은 평가 담당자에게 넘깁니다.', 'The original offer matches the application, but the employer changed after lodgement. Record the facts within the activity and hand the effect of the change to the assessing officer.'),
    sources: ['NZ-Y35', 'NZ-A16']
  },

  // ── SIM-NZ-06 · host letter vs address record ─────────────────────────────
  {
    id: 'SIM-NZ-06', countryId: 'NZ', personId: 'SIM-NZ-P06', name: 'Jonas Weller',
    difficulty: 'standard', category: 'accommodation',
    title: L('초청인 주소 두 곳', 'Two host addresses'),
    brief: L('신청서의 숙박 주소와 초청인 편지의 주소가 다릅니다. 숙박 확인 활동이 배정되었습니다.', 'The accommodation address in the application differs from the address in the host\'s letter. An accommodation check has been assigned.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('친구 방문 · 크라이스트처치', 'Visiting a friend · Christchurch') },
      { label: L('체류 기간', 'Stated stay'), value: L('14일 (12월 4일–18일)', '14 days (4–18 December)') },
      { label: L('제출 자료', 'Submitted'), value: L('신청 요약 · 초청인 편지(2쪽)', 'Application summary · host letter (2 pages)') }
    ],
    opening: L('안녕하세요. 친구 Hannah 집에 머물 예정입니다.', 'Hello. I am staying with my friend Hannah.'),
    documents: [
      { id: 'SIM-NZ-06-DOC1', title: L('신청 요약', 'Application summary'), pages: [L('숙박: 친구 H. Pirika · 7/180 Papanui Road, 크라이스트처치 · 12월 4일–18일', 'Accommodation: friend H. Pirika · 7/180 Papanui Road, Christchurch · 4–18 Dec'), NOTICE] },
      { id: 'SIM-NZ-06-DOC2', title: L('초청인 편지', 'Host letter'), pages: [L('본인 Hannah Pirika는 22 Tui Street, 크라이스트처치에서 12월 4일–18일 Jonas Weller를 숙박시킵니다.', 'I, Hannah Pirika, of 22 Tui Street, Christchurch, will host Jonas Weller from 4 to 18 December.'), L('작성일 2026-11-12 · 서명란 공란 · 연락처 미기재', 'Dated 2026-11-12 · signature line blank · no contact details given')] }
    ],
    records: [
      { id: 'SIM-NZ-06-REC1', title: L('신청 기록 · 숙박 주소', 'Application record · accommodation'), detail: L('숙박 주소 7/180 Papanui Road · 입력 2026-10-14 · 이후 변경 없음', 'Accommodation 7/180 Papanui Road · entered 2026-10-14 · not updated since'), documentId: 'SIM-NZ-06-DOC1' }
    ],
    facts: [
      { id: 'SIM-NZ-06-F-APP', sourceType: 'document', sourceId: 'SIM-NZ-06-DOC1', page: 0, label: L('신청서 숙박 주소: 7/180 Papanui Road', 'Application address: 7/180 Papanui Road') },
      { id: 'SIM-NZ-06-F-HOST', sourceType: 'document', sourceId: 'SIM-NZ-06-DOC2', page: 0, label: L('초청인 편지 주소: 22 Tui Street', 'Host letter address: 22 Tui Street') },
      { id: 'SIM-NZ-06-F-UNSIGNED', sourceType: 'document', sourceId: 'SIM-NZ-06-DOC2', page: 1, label: L('편지: 11월 12일 작성, 서명·연락처 없음', 'Letter: dated 12 Nov, no signature or contact') },
      { id: 'SIM-NZ-06-F-ENTERED', sourceType: 'record', sourceId: 'SIM-NZ-06-REC1', label: L('신청 주소 입력 10월 14일, 이후 미변경', 'Application address entered 14 Oct, never updated') },
      { id: 'SIM-NZ-06-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-06-STMT', questionIds: ['nz06_address'], label: L('진술: Hannah가 11월 초 Tui Street로 이사, 이사 후 편지 작성', 'Statement: Hannah moved to Tui Street in early November and wrote the letter afterwards') }
    ],
    questions: [
      { id: 'nz06_host', q: L('초청인과는 어떤 관계입니까?', 'How do you know your host?'), answer: L('대학 때부터 친구입니다. 크라이스트처치에 산 지 몇 년 됐습니다.', 'We have been friends since university. She has lived in Christchurch for a few years.') },
      { id: 'nz06_plans', q: L('머무는 동안 계획은 무엇입니까?', 'What are your plans while you are here?'), answer: L('크라이스트처치에 머물면서 아카로아와 캔터베리 쪽을 둘러볼 생각입니다.', 'I will stay in Christchurch and take day trips to Akaroa and around Canterbury.') },
      { id: 'nz06_address', q: L('신청서와 편지의 주소가 다른 이유가 무엇입니까?', 'Why does the address in your application differ from the letter?'), answer: L('Hannah가 11월 초에 Tui Street로 이사했습니다. 편지는 이사한 뒤에 써 준 것이고, 저는 신청서를 고칠 생각을 못 했습니다.', 'Hannah moved to Tui Street at the start of November. She wrote the letter after the move, and I didn\'t think to update my application.') },
      { id: 'nz06_contact', q: L('초청인에게 연락할 방법이 있습니까?', 'Is there a way to contact your host?'), answer: L('제 휴대전화에 번호가 있습니다. 편지에 적어 달라고 하겠습니다.', 'I have her number on my phone. I can ask her to add it to the letter.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-06-ADDRESS', facts: ['SIM-NZ-06-F-APP', 'SIM-NZ-06-F-HOST'], type: 'CONFLICT', findingId: 'NZ06_ADDRESS_CONFLICT', title: L('숙박 주소 불일치', 'Accommodation address conflict'), explanation: L('신청서는 Papanui Road, 초청인 편지는 Tui Street로 서로 다릅니다.', 'The application gives Papanui Road; the host letter gives Tui Street.'), unlocks: { questions: ['nz06_address'] } },
      { id: 'COMP-NZ-06-TIMING', facts: ['SIM-NZ-06-F-STMT', 'SIM-NZ-06-F-ENTERED'], type: 'MATCH', findingId: 'NZ06_TIMING_CONSISTENT', title: L('이사 시점과 기록 시점 부합', 'Move timing consistent'), explanation: L('신청 주소는 10월 14일에 입력되었고 이사는 11월 초라는 진술과 시점이 맞습니다.', 'The application address was entered on 14 October, before the early-November move described.') },
      { id: 'COMP-NZ-06-UNSIGNED', facts: ['SIM-NZ-06-F-STMT', 'SIM-NZ-06-F-UNSIGNED'], type: 'UNVERIFIED', findingId: 'NZ06_HOST_UNCONFIRMED', title: L('초청인 확인 없음', 'Host has not confirmed'), explanation: L('이사 진술은 그럴듯하지만 편지에 서명과 연락처가 없어 초청인이 새 주소를 확인한 근거가 없습니다.', 'The account is plausible, but the letter has no signature or contact, so nothing from the host confirms the new address.'), unlocks: { requests: ['SIM-NZ-06-REQ-HOST'] } }
    ],
    requests: [
      { id: 'SIM-NZ-06-REQ-HOST', title: L('서명된 초청인 편지(현 주소·연락처 포함) 요청', 'Request a signed host letter with current address and contact'), result: L('요청 기록됨: 초청인의 서명, 현 주소, 연락처가 담긴 편지 보완 요청 · 접수 대기', 'Request recorded: a host letter with signature, current address and contact details has been requested · awaiting receipt') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('주소 차이에 대한 설명은 그럴듯하지만 서명 없는 편지로는 초청인이 확인했다고 볼 수 없습니다.', 'The explanation is plausible, but an unsigned letter does not show the host has confirmed it.'),
      evidence: L('필요한 것은 특정 자료 하나입니다. 서명과 연락처가 있는 초청인 편지를 요청하면 주소 문제가 확인됩니다.', 'One specific item is needed. A signed host letter with contact details would confirm the address.'),
      review: L('이사 시점은 기록과 맞고 상충은 보완 자료로 해결됩니다. 설명 가능한 주소 차이를 추가 검토로 넘길 필요는 없습니다.', 'The move timing fits the record and a supporting letter would settle it. An explainable address change does not need further review.')
    },
    assessment: {
      issue: ['NZ06_ADDRESS_CONFLICT'],
      distinguish: ['NZ06_TIMING_CONSISTENT'],
      resolve: { findings: ['NZ06_HOST_UNCONFIRMED'], questions: ['nz06_address'], requests: ['SIM-NZ-06-REQ-HOST'] },
      feedback: {
        issueHit: L('숙박 주소 불일치 확인', 'Address conflict found'), issueMiss: L('신청 주소와 편지 주소 미대조', 'Application and letter addresses not compared'),
        resolveHit: L('미서명 편지 확인 후 보완 요청', 'Unsigned letter noted and confirmation requested'), resolveMiss: L('편지 서명란 확인 또는 보완 요청 누락', 'Signature line not checked or confirmation not requested')
      }
    },
    debrief: L('주소 차이는 이사로 설명되고 시점도 맞습니다. 다만 편지에 서명과 연락처가 없으므로, 확대하지 않고 서명된 편지를 요청합니다.', 'The address difference is explained by a move with consistent timing. The letter is unsigned with no contact, so request a signed letter rather than escalate.'),
    sources: ['NZ-A16', 'NZ-Y35']
  },

  // ── SIM-NZ-07 · tour itinerary vs domestic flight booking ─────────────────
  {
    id: 'SIM-NZ-07', countryId: 'NZ', personId: 'SIM-NZ-P07', name: 'Keiko Marsden',
    difficulty: 'standard', category: 'purpose',
    title: L('투어 이후의 국내선', 'A domestic flight after the tour'),
    brief: L('단체 투어는 12월 12일 퀸스타운에서 끝나고 국제선은 13일 출발입니다. 함께 제출된 국내선 예약을 확인해야 합니다.', 'The group tour ends in Queenstown on 12 December and the international flight leaves on the 13th. The domestic booking submitted with them needs checking.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('단체 관광 투어', 'Guided group tour') },
      { label: L('체류 기간', 'Stated stay'), value: L('10일 · 12월 13일 오클랜드 출국', '10 days · departing Auckland 13 December') },
      { label: L('제출 자료', 'Submitted'), value: L('도착 정보 · 투어 일정표 · 국내선 예약', 'Arrival details · tour itinerary · domestic booking') }
    ],
    opening: L('안녕하세요. 남북섬 투어를 하러 왔습니다.', 'Hello. I am here for a tour of both islands.'),
    documents: [
      { id: 'SIM-NZ-07-DOC1', title: L('도착 정보', 'Arrival details'), pages: [L('목적: 단체 투어 · 예정 체류 10일 · 출국 2026-12-13 오클랜드', 'Purpose: group tour · intended stay 10 days · departure 2026-12-13 from Auckland'), NOTICE] },
      { id: 'SIM-NZ-07-DOC2', title: L('투어 일정표', 'Tour itinerary'), pages: [L('Southern Lakes 소규모 투어 · 12월 3일–12일 · 오클랜드, 로토루아, 웰링턴, 퀸스타운 · 12월 12일 퀸스타운 해산', 'Southern Lakes small-group tour · 3–12 Dec · Auckland, Rotorua, Wellington, Queenstown · ends in Queenstown on 12 Dec')] },
      { id: 'SIM-NZ-07-DOC3', title: L('국내선 예약', 'Domestic flight booking'), pages: [L('퀸스타운 → 오클랜드 · 2026-12-20 · 승객 1명 · 편도', 'Queenstown → Auckland · 2026-12-20 · 1 passenger · one way')] }
    ],
    records: [
      { id: 'SIM-NZ-07-REC1', title: L('국제선 예약 기록', 'International booking record'), detail: L('오클랜드 출발 2026-12-13 · 2026-09-02 예약 이후 변경 없음', 'Departs Auckland 2026-12-13 · unchanged since booked on 2026-09-02'), documentId: 'SIM-NZ-07-DOC1' }
    ],
    facts: [
      { id: 'SIM-NZ-07-F-STATED', sourceType: 'document', sourceId: 'SIM-NZ-07-DOC1', page: 0, label: L('도착 정보: 10일 체류, 12월 13일 출국', 'Arrival details: 10-day stay, departing 13 Dec') },
      { id: 'SIM-NZ-07-F-TOUR', sourceType: 'document', sourceId: 'SIM-NZ-07-DOC2', page: 0, label: L('투어: 12월 3일–12일, 퀸스타운 해산', 'Tour: 3–12 Dec, ends in Queenstown') },
      { id: 'SIM-NZ-07-F-DOMESTIC', sourceType: 'document', sourceId: 'SIM-NZ-07-DOC3', page: 0, label: L('국내선: 퀸스타운→오클랜드 12월 20일', 'Domestic: Queenstown→Auckland on 20 Dec') },
      { id: 'SIM-NZ-07-F-INTL', sourceType: 'record', sourceId: 'SIM-NZ-07-REC1', label: L('국제선: 12월 13일 오클랜드 출발, 변경 없음', 'International: departs Auckland 13 Dec, unchanged') },
      { id: 'SIM-NZ-07-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-07-STMT', questionIds: ['nz07_after'], label: L('진술: 투어 후 퀸스타운 친구 집에서 1주 더 머물 예정, 국제선은 아직 미변경', 'Statement: will stay a further week with a friend in Queenstown; international flight not yet changed') }
    ],
    questions: [
      { id: 'nz07_tour', q: L('투어 일정을 간단히 말씀해 주세요.', 'Please outline the tour for me.'), answer: L('오클랜드에서 시작해 로토루아, 웰링턴을 거쳐 퀸스타운에서 끝나는 열흘짜리 투어입니다.', 'It is a ten-day tour starting in Auckland, through Rotorua and Wellington, finishing in Queenstown.') },
      { id: 'nz07_return', q: L('언제 출국하십니까?', 'When do you leave New Zealand?'), answer: L('국제선은 12월 13일 오클랜드 출발로 예약되어 있습니다.', 'My international flight is booked from Auckland on 13 December.') },
      { id: 'nz07_after', q: L('투어가 끝난 뒤 12월 20일까지는 어디에 계십니까?', 'Where will you be between the end of the tour and 20 December?'), answer: L('투어가 끝나면 퀸스타운에 사는 친구 집에서 일주일 더 지내려고 합니다. 그래서 20일 국내선을 샀고, 국제선은 나중에 바꿀 생각인데 아직 바꾸지는 않았습니다.', 'After the tour I am staying with a friend in Queenstown for another week. That is why I booked the domestic flight on the 20th. I plan to move my international flight, but I haven\'t done it yet.') },
      { id: 'nz07_friend', q: L('퀸스타운 친구의 주소를 알고 계십니까?', 'Do you know your friend\'s address in Queenstown?'), answer: L('Frankton 쪽이라는 것만 알고 정확한 주소는 휴대전화 메시지에 있습니다.', 'Somewhere in Frankton. The exact address is in a message on my phone.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-07-FLIGHTS', facts: ['SIM-NZ-07-F-DOMESTIC', 'SIM-NZ-07-F-INTL'], type: 'CONFLICT', findingId: 'NZ07_DEPARTURE_CONFLICT', title: L('국내선이 국제선 출발 이후', 'Domestic flight after international departure'), explanation: L('12월 20일 국내선은 12월 13일 국제선 출발보다 일주일 늦습니다. 두 예약이 함께 성립하지 않습니다.', 'The 20 December domestic flight is a week after the 13 December international departure; the two bookings cannot both stand.'), unlocks: { questions: ['nz07_after', 'nz07_friend'] } },
      { id: 'COMP-NZ-07-TOUR', facts: ['SIM-NZ-07-F-TOUR', 'SIM-NZ-07-F-STATED'], type: 'MATCH', findingId: 'NZ07_TOUR_FITS_STATED', title: L('투어와 신고 체류 일치', 'Tour fits the stated stay'), explanation: L('투어 일정은 신고한 10일 체류와 13일 출국에 맞습니다.', 'The tour fits the stated 10-day stay and 13 December departure.') },
      { id: 'COMP-NZ-07-DOMESTIC', facts: ['SIM-NZ-07-F-STMT', 'SIM-NZ-07-F-DOMESTIC'], type: 'MATCH', findingId: 'NZ07_DOMESTIC_EXPLAINED', title: L('국내선 날짜 설명됨', 'Domestic date explained'), explanation: L('투어 후 일주일 더 머문다는 진술이 20일 국내선과 맞습니다.', 'Staying a further week after the tour accounts for the flight on the 20th.') },
      { id: 'COMP-NZ-07-STAY', facts: ['SIM-NZ-07-F-STMT', 'SIM-NZ-07-F-STATED'], type: 'CONFLICT', findingId: 'NZ07_STAY_EXCEEDS_STATED', title: L('실제 계획이 신고 체류보다 김', 'Plan is longer than the stated stay'), explanation: L('진술상 계획은 약 17일이지만 도착 정보는 10일, 13일 출국으로 남아 있고 국제선도 바뀌지 않았습니다.', 'The described plan runs about 17 days, but the arrival details still state 10 days and a 13 December departure, and the international booking is unchanged.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('투어 자체는 신고와 맞지만 국내선과 진술은 더 긴 체류를 보여 줍니다. 신고 내용과 다른 계획을 남긴 채 닫을 수 없습니다.', 'The tour fits, but the domestic flight and statement show a longer stay. The review cannot close with the plan differing from what was stated.'),
      evidence: L('여행자는 국제선을 아직 바꾸지 않았다고 했습니다. 요청할 수 있는 새 예약 자료가 없으므로 자료 요청으로는 상충이 해소되지 않습니다.', 'The traveller says the international flight has not been changed, so there is no updated booking to request. A request will not resolve the conflict.'),
      review: L('신고한 체류와 실제 계획의 차이를 원문과 진술로 정리해 추가 검토로 넘기는 것이 근거와 맞습니다. 더 오래 머무는 것 자체를 문제로 보지 않습니다.', 'Recording the gap between the stated stay and the actual plan and referring it for further review matches the evidence. A longer stay is not itself treated as a problem.')
    },
    assessment: {
      issue: ['NZ07_DEPARTURE_CONFLICT'],
      distinguish: ['NZ07_TOUR_FITS_STATED', 'NZ07_DOMESTIC_EXPLAINED'],
      resolve: { findings: ['NZ07_STAY_EXCEEDS_STATED'], questions: ['nz07_after'], requests: [] },
      feedback: {
        issueHit: L('국내선·국제선 날짜 상충 확인', 'Flight date conflict found'), issueMiss: L('국내선과 국제선 기록 미대조', 'Domestic and international bookings not compared'),
        resolveHit: L('신고 체류와 실제 계획의 차이 확인', 'Gap between stated stay and plan established'), resolveMiss: L('진술과 신고 체류 미대조', 'Statement not compared with the stated stay')
      }
    },
    debrief: L('투어는 신고와 맞지만 국내선이 국제선 출발 뒤에 있습니다. 진술로 이유는 설명되나 신고 체류와 예약이 바뀌지 않았으므로 차이를 정리해 추가 검토로 넘깁니다.', 'The tour matches the stated trip, but the domestic flight falls after the international departure. The statement explains why, yet the stated stay and booking are unchanged, so record the gap and refer it.'),
    sources: ['NZ-A16', 'NZ-ACT']
  },

  // ── SIM-NZ-08 · funds evidence page gap ───────────────────────────────────
  {
    id: 'SIM-NZ-08', countryId: 'NZ', personId: 'SIM-NZ-P08', name: 'Ines Carvalho-Lund',
    difficulty: 'standard', category: 'requirements',
    title: L('빠진 잔고 요약 쪽', 'The missing balance page'),
    brief: L('워킹홀리데이형 신청(모의)의 자금 자료 확인이 배정되었습니다. 은행 명세서는 1쪽과 3쪽만 보입니다.', 'A funds check is assigned on a working-holiday style application (simulated). The bank statement shows only pages 1 and 3.'),
    profile: [
      { label: L('신청 맥락', 'Application context'), value: L('워킹홀리데이형 신청(모의) SIM-NZ-A08', 'Working-holiday style application (simulated) SIM-NZ-A08') },
      { label: L('배정 활동', 'Assigned activity'), value: L('신고한 자금과 은행 명세서 대조', 'Compare declared funds with the bank statement') },
      { label: L('제출 자료', 'Submitted'), value: L('신청 요약 · 은행 명세서', 'Application summary · bank statement') }
    ],
    opening: L('안녕하세요. 은행 명세서에 문제가 있다고 들었습니다.', 'Hello. I heard there is something wrong with my bank statement.'),
    documents: [
      { id: 'SIM-NZ-08-DOC1', title: L('신청 요약', 'Application summary'), pages: [L('신청 SIM-NZ-A08 · 신고 자금 NZD 4,800 · 증빙: 은행 명세서(10월분)', 'Application SIM-NZ-A08 · declared funds NZD 4,800 · evidence: bank statement (October)'), NOTICE] },
      { id: 'SIM-NZ-08-DOC2', title: L('은행 명세서', 'Bank statement'), pages: [L('1/3쪽 · 예금주 I. Carvalho-Lund · 기간 10월 1–31일 · 기초 잔액 NZD 1,150 · 거래 내역 시작', 'Page 1 of 3 · holder I. Carvalho-Lund · period 1–31 Oct · opening balance NZD 1,150 · transactions begin'), L('3/3쪽 · 거래 내역 끝 · 기말 잔액: 2쪽 요약 참조', 'Page 3 of 3 · transactions end · closing balance: see summary on page 2')] }
    ],
    records: [
      { id: 'SIM-NZ-08-REC1', title: L('신청인 기록', 'Applicant record'), detail: L('SIM-NZ-P08 · Ines Carvalho-Lund · 생년월일 1999-02-08 · 은행 명세서 2개 면 업로드', 'SIM-NZ-P08 · Ines Carvalho-Lund · born 1999-02-08 · bank statement uploaded as 2 sheets'), documentId: 'SIM-NZ-08-DOC2' }
    ],
    facts: [
      { id: 'SIM-NZ-08-F-DECLARED', sourceType: 'document', sourceId: 'SIM-NZ-08-DOC1', page: 0, label: L('신고 자금 NZD 4,800', 'Declared funds NZD 4,800') },
      { id: 'SIM-NZ-08-F-P1', sourceType: 'document', sourceId: 'SIM-NZ-08-DOC2', page: 0, label: L('명세서 1/3쪽: 기초 잔액 NZD 1,150', 'Statement page 1 of 3: opening balance NZD 1,150') },
      { id: 'SIM-NZ-08-F-P3', sourceType: 'document', sourceId: 'SIM-NZ-08-DOC2', page: 1, label: L('명세서 3/3쪽: 기말 잔액은 2쪽 요약 참조', 'Statement page 3 of 3: closing balance on page 2 summary') },
      { id: 'SIM-NZ-08-F-HOLDER', sourceType: 'record', sourceId: 'SIM-NZ-08-REC1', label: L('신청인 기록: Ines Carvalho-Lund, 명세서 2개 면 업로드', 'Applicant record: Ines Carvalho-Lund, statement uploaded as 2 sheets') },
      { id: 'SIM-NZ-08-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-08-STMT', questionIds: ['nz08_page2'], label: L('진술: 2쪽에 잔고 요약, 스캔 중 빠뜨림', 'Statement: page 2 holds the balance summary and was missed when scanning') }
    ],
    questions: [
      { id: 'nz08_funds', q: L('신고하신 자금은 어디에 있습니까?', 'Where are the funds you declared held?'), answer: L('제 저축 계좌에 있습니다. 10월 명세서를 냈습니다.', 'In my savings account. I sent the October statement.') },
      { id: 'nz08_upload', q: L('명세서는 어떻게 제출하셨습니까?', 'How did you submit the statement?'), answer: L('집에서 스캔해서 올렸습니다.', 'I scanned it at home and uploaded it.') },
      { id: 'nz08_page2', q: L('명세서 2쪽에는 무엇이 있습니까?', 'What is on page 2 of the statement?'), answer: L('2쪽에 월말 잔고 요약이 있습니다. 스캐너에 종이가 걸려서 그 쪽을 빠뜨린 것 같습니다. 다시 보낼 수 있습니다.', 'Page 2 has the month-end balance summary. The paper jammed in the scanner and I must have missed that page. I can send it again.') },
      { id: 'nz08_plans', q: L('도착 후 계획은 무엇입니까?', 'What are your plans after arrival?'), answer: L('웰링턴에서 몇 주 지내면서 일자리를 찾고, 그 뒤 남섬을 여행할 계획입니다.', 'A few weeks in Wellington looking for work, then travelling around the South Island.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-08-GAP', facts: ['SIM-NZ-08-F-P1', 'SIM-NZ-08-F-P3'], type: 'MISSING', findingId: 'NZ08_PAGE_GAP', title: L('명세서 2쪽 누락', 'Statement page 2 missing'), explanation: L('1/3쪽 다음이 3/3쪽입니다. 기말 잔액이 있는 2쪽이 접수되지 않았습니다.', 'Page 1 of 3 is followed by page 3 of 3; page 2, which holds the closing balance, was not received.'), unlocks: { questions: ['nz08_page2'], requests: ['SIM-NZ-08-REQ-P2'] } },
      { id: 'COMP-NZ-08-FUNDS', facts: ['SIM-NZ-08-F-DECLARED', 'SIM-NZ-08-F-P1'], type: 'UNVERIFIED', findingId: 'NZ08_FUNDS_NOT_SHOWN', title: L('신고 자금 미확인', 'Declared funds not shown'), explanation: L('보이는 쪽에는 기초 잔액만 있어 신고한 NZD 4,800을 확인할 수 없습니다. 부족하다는 뜻이 아니라 확인할 쪽이 없다는 뜻입니다.', 'The pages on file show only the opening balance, so the declared NZD 4,800 cannot be checked. This means the page is absent, not that funds are short.') },
      { id: 'COMP-NZ-08-HOLDER', facts: ['SIM-NZ-08-F-P1', 'SIM-NZ-08-F-HOLDER'], type: 'MATCH', findingId: 'NZ08_HOLDER_MATCH', title: L('예금주 일치', 'Account holder matches'), explanation: L('명세서 예금주와 신청인 기록이 같은 사람입니다.', 'The account holder and the applicant record are the same person.') },
      { id: 'COMP-NZ-08-SUMMARY', facts: ['SIM-NZ-08-F-STMT', 'SIM-NZ-08-F-P3'], type: 'MATCH', findingId: 'NZ08_SUMMARY_ON_PAGE2', title: L('잔고 요약 위치 확인', 'Balance summary located'), explanation: L('3쪽이 2쪽 요약을 가리키고, 진술도 2쪽에 잔고 요약이 있다고 합니다. 필요한 자료가 특정되었습니다.', 'Page 3 points to a page-2 summary and the statement says the same; the needed item is identified.') }
    ],
    requests: [
      { id: 'SIM-NZ-08-REQ-P2', title: L('은행 명세서 2쪽(잔고 요약) 요청', 'Request bank statement page 2 (balance summary)'), result: L('요청 기록됨: 10월 명세서 2/3쪽 보완 요청 · 접수 대기', 'Request recorded: October statement page 2 of 3 requested · awaiting receipt') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('신고 자금을 보여 주는 쪽이 접수되지 않았습니다. 배정 활동을 확인 없이 닫을 수 없습니다.', 'The page showing the declared funds has not been received. The activity cannot close unchecked.'),
      evidence: L('빠진 2쪽과 그 안의 잔고 요약을 특정해 요청하는 것이 맞습니다. 예금주는 일치하므로 다른 문제는 없습니다.', 'Requesting the specific missing page and its balance summary is right. The holder matches, so nothing else is in question.'),
      review: L('상충하는 자료는 없습니다. 쪽 하나가 빠졌을 뿐이며 신청인이 보완할 수 있습니다.', 'Nothing conflicts. One page is missing and the applicant can supply it.')
    },
    assessment: {
      issue: ['NZ08_PAGE_GAP', 'NZ08_FUNDS_NOT_SHOWN'],
      distinguish: ['NZ08_HOLDER_MATCH'],
      resolve: { findings: ['NZ08_SUMMARY_ON_PAGE2'], questions: ['nz08_page2'], requests: ['SIM-NZ-08-REQ-P2'] },
      feedback: {
        issueHit: L('명세서 쪽 누락 확인', 'Missing statement page identified'), issueMiss: L('명세서 쪽 번호 미대조', 'Statement page numbers not compared'),
        resolveHit: L('잔고 요약 쪽 특정 후 요청', 'Balance page specified and requested'), resolveMiss: L('필요한 쪽 특정 또는 요청 누락', 'Needed page not specified or not requested')
      }
    },
    debrief: L('쪽 번호를 대조하면 기말 잔액이 있는 2쪽만 빠졌습니다. 자금이 부족하다고 추정하지 않고, 그 쪽을 특정해 요청합니다.', 'Comparing page numbers shows only page 2, with the closing balance, is missing. Do not assume funds are short; request that page.'),
    sources: ['NZ-A16', 'NZ-Y35']
  },

  // ── SIM-NZ-09 · cash declaration explained by a documented event ───────────
  {
    id: 'SIM-NZ-09', countryId: 'NZ', personId: 'SIM-NZ-P09', name: 'Rahim Osterberg',
    difficulty: 'advanced', category: 'false-positive',
    title: L('신고된 현금과 결혼식', 'Declared cash and a wedding'),
    brief: L('도착 시 NZD 14,500 현금이 신고되어 대기열에서 확인 대상으로 분류되었습니다. 신고 내용과 제출 자료를 대조합니다.', 'NZD 14,500 in cash was declared on arrival and the queue flagged it for checking. Compare the declaration with the submitted documents.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('여동생 결혼식 참석 · 크라이스트처치', 'Sister\'s wedding · Christchurch') },
      { label: L('체류 기간', 'Stated stay'), value: L('14일', '14 days') },
      { label: L('제출 자료', 'Submitted'), value: L('도착 정보 · 현금 신고서 · 출금 영수증과 청첩장', 'Arrival details · cash report · withdrawal receipt and invitation') }
    ],
    opening: L('안녕하세요. 현금 신고 때문에 오라고 하셨지요? 신고서에 다 적었습니다.', 'Hello. Is this about the cash I declared? I filled in the form.'),
    documents: [
      { id: 'SIM-NZ-09-DOC1', title: L('도착 정보', 'Arrival details'), pages: [L('목적: 가족 결혼식, 크라이스트처치 12월 12일 · 체류 14일 · 숙박: 여동생 E. Osterberg 집', 'Purpose: family wedding, Christchurch, 12 Dec · stay 14 days · staying with sister E. Osterberg'), NOTICE] },
      { id: 'SIM-NZ-09-DOC2', title: L('현금 신고서 (모의)', 'Cash report (simulated)'), pages: [L('신고 금액 NZD 14,500 · 출처: 2026-11-28 환전소 인출 · 용도: 가족 결혼 축의금', 'Declared NZD 14,500 · source: currency exchange withdrawal 2026-11-28 · use: family wedding gift'), L('권종 내역: NZD 100권 145장 · 신고인 서명', 'Denominations: 145 × NZD 100 notes · signed by declarant')] },
      { id: 'SIM-NZ-09-DOC3', title: L('출금 영수증 · 청첩장', 'Withdrawal receipt · invitation'), pages: [L('환전소 영수증: NZD 14,500 · 2026-11-28 · 고객 R. Osterberg', 'Exchange receipt: NZD 14,500 · 2026-11-28 · customer R. Osterberg'), L('청첩장: Elin Osterberg와 Matiu Tane · 2026-12-12 · 크라이스트처치 식물원', 'Invitation: Elin Osterberg and Matiu Tane · 2026-12-12 · Christchurch Botanic Gardens')] }
    ],
    records: [
      { id: 'SIM-NZ-09-REC1', title: L('방문 신청 기록', 'Visit record'), detail: L('목적: 가족 결혼식 · 초청 가족 Elin Osterberg(크라이스트처치) · 입력 2026-10-20', 'Purpose: family wedding · host family member Elin Osterberg, Christchurch · entered 2026-10-20'), documentId: 'SIM-NZ-09-DOC1' },
      { id: 'SIM-NZ-09-REC2', title: L('도착 현금 신고 기록', 'Arrival cash report record'), detail: L('2026-12-01 도착 시 신고 · NZD 14,500 · 신고서와 금액 일치', 'Lodged on arrival 2026-12-01 · NZD 14,500 · amount agrees with the form'), documentId: 'SIM-NZ-09-DOC2' }
    ],
    facts: [
      { id: 'SIM-NZ-09-F-CASH', sourceType: 'document', sourceId: 'SIM-NZ-09-DOC2', page: 0, label: L('현금 신고: NZD 14,500, 11월 28일 인출, 결혼 축의금', 'Cash report: NZD 14,500, withdrawn 28 Nov, wedding gift') },
      { id: 'SIM-NZ-09-F-RECEIPT', sourceType: 'document', sourceId: 'SIM-NZ-09-DOC3', page: 0, label: L('영수증: NZD 14,500, 11월 28일, R. Osterberg', 'Receipt: NZD 14,500, 28 Nov, R. Osterberg') },
      { id: 'SIM-NZ-09-F-INVITE', sourceType: 'document', sourceId: 'SIM-NZ-09-DOC3', page: 1, label: L('청첩장: Elin Osterberg 결혼식 12월 12일 크라이스트처치', 'Invitation: Elin Osterberg\'s wedding, 12 Dec, Christchurch') },
      { id: 'SIM-NZ-09-F-PURPOSE', sourceType: 'record', sourceId: 'SIM-NZ-09-REC1', label: L('방문 기록: 가족 결혼식, 초청 가족 Elin Osterberg', 'Visit record: family wedding, host Elin Osterberg') },
      { id: 'SIM-NZ-09-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-09-STMT', questionIds: ['nz09_gift'], label: L('진술: 가족이 모은 축의금을 결혼식에서 여동생 Elin에게 전달', 'Statement: family-pooled gift money to be handed to his sister Elin at the wedding') }
    ],
    questions: [
      { id: 'nz09_purpose', q: L('방문 목적을 말씀해 주세요.', 'What is the purpose of your visit?'), answer: L('여동생 Elin의 결혼식이 12월 12일 크라이스트처치에서 있습니다.', 'My sister Elin is getting married in Christchurch on 12 December.') },
      { id: 'nz09_declared', q: L('현금은 왜 신고하셨습니까?', 'Why did you declare the cash?'), answer: L('큰 금액이라 신고해야 한다고 들었습니다. 그래서 도착하자마자 신고서를 냈습니다.', 'I was told a large amount has to be declared, so I filled in the form as soon as I landed.') },
      { id: 'nz09_gift', q: L('그 현금은 어디에 쓰실 예정입니까?', 'What is the cash for?'), answer: L('가족들이 함께 모은 결혼 축의금입니다. 11월 28일에 찾아서 가져왔고, 결혼식 날 여동생 Elin에게 직접 전달할 겁니다.', 'It is wedding gift money the whole family pooled. I collected it on 28 November and will hand it to my sister Elin on the wedding day.') },
      { id: 'nz09_stay', q: L('어디에서 머무십니까?', 'Where are you staying?'), answer: L('크라이스트처치의 여동생 집에서 지냅니다.', 'At my sister\'s home in Christchurch.') },
      { id: 'nz09_onward', q: L('결혼식 뒤 일정은 어떻게 됩니까?', 'What are your plans after the wedding?'), answer: L('가족과 며칠 더 지내다가 12월 15일에 돌아갑니다.', 'A few more days with the family, then I fly home on 15 December.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-09-SOURCE', facts: ['SIM-NZ-09-F-CASH', 'SIM-NZ-09-F-RECEIPT'], type: 'MATCH', findingId: 'NZ09_CASH_SOURCE_MATCH', title: L('현금 출처 일치', 'Cash source matches'), explanation: L('신고 금액과 날짜가 본인 명의 환전 영수증과 일치합니다.', 'The declared amount and date agree with an exchange receipt in his own name.'), unlocks: { questions: ['nz09_gift'], requests: ['SIM-NZ-09-REQ-BANK'] } },
      { id: 'COMP-NZ-09-EVENT', facts: ['SIM-NZ-09-F-INVITE', 'SIM-NZ-09-F-PURPOSE'], type: 'MATCH', findingId: 'NZ09_EVENT_MATCHES_PURPOSE', title: L('결혼식과 방문 목적 일치', 'Wedding matches stated purpose'), explanation: L('청첩장의 신부·날짜·장소가 10월에 입력된 방문 기록과 같습니다.', 'The bride, date and place on the invitation match the visit record entered in October.') },
      { id: 'COMP-NZ-09-GIFT', facts: ['SIM-NZ-09-F-STMT', 'SIM-NZ-09-F-INVITE'], type: 'MATCH', findingId: 'NZ09_GIFT_EXPLAINED', title: L('축의금 용도 설명 부합', 'Gift use explained'), explanation: L('축의금을 결혼식에서 Elin에게 전달한다는 진술이 청첩장과 맞습니다.', 'Handing the gift to Elin at the wedding is consistent with the invitation.') },
      { id: 'COMP-NZ-09-USE', facts: ['SIM-NZ-09-F-CASH', 'SIM-NZ-09-F-STMT'], type: 'MATCH', findingId: 'NZ09_USE_CONSISTENT', title: L('신고서 용도와 진술 일치', 'Declared use matches statement'), explanation: L('신고서에 적은 용도와 진술이 같습니다. 금액이 크다는 사실만으로는 아무것도 증명되지 않습니다.', 'The use written on the form and the statement agree. A large amount on its own proves nothing.') }
    ],
    requests: [
      { id: 'SIM-NZ-09-REQ-BANK', title: L('6개월 은행 거래 내역 요청', 'Request six months of bank statements'), result: L('요청 기록됨. 현금 출처는 이미 영수증으로 확인되어 새로 확인될 정보는 없습니다.', 'Request recorded. The cash source is already shown by the receipt; no new information is expected.') }
    ],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('현금은 정상 신고되었고 출처·용도·행사가 서로 일치합니다. 연습상 검토 완료이며 실제 입국허가를 뜻하지 않습니다.', 'The cash was properly declared and its source, use and the event all agree. Completing the exercise does not grant entry.'),
      evidence: L('출처는 본인 명의 영수증으로 이미 확인됩니다. 거래 내역을 더 요구할 근거가 없으며 불필요한 요청은 감점됩니다.', 'The receipt in his name already shows the source. There is no basis for more statements, and an unneeded request costs points.'),
      review: L('대기열 표시는 금액 때문일 뿐이고, 대조 결과 남은 상충이 없습니다. 신고한 현금을 의심 사유로 넘기지 않습니다.', 'The queue flag was about the amount only, and no conflict remains after comparison. Properly declared cash is not a reason to refer.')
    },
    assessment: {
      issue: ['NZ09_CASH_SOURCE_MATCH'],
      distinguish: ['NZ09_USE_CONSISTENT'],
      resolve: { findings: ['NZ09_EVENT_MATCHES_PURPOSE', 'NZ09_GIFT_EXPLAINED'], questions: ['nz09_gift'], requests: [] },
      feedback: {
        issueHit: L('신고 현금의 출처 확인', 'Source of declared cash confirmed'), issueMiss: L('신고서와 영수증 미대조', 'Cash report and receipt not compared'),
        resolveHit: L('결혼식과 축의금 용도 확인', 'Wedding and gift use confirmed'), resolveMiss: L('청첩장·방문 기록·진술 대조 미완료', 'Invitation, visit record or statement not compared')
      }
    },
    debrief: L('대기열 표시는 금액에서 나왔을 뿐입니다. 신고서, 영수증, 청첩장, 방문 기록, 진술이 모두 맞으므로 추가 요청 없이 검토를 마칩니다.', 'The flag came only from the amount. The report, receipt, invitation, visit record and statement all agree, so the review closes without further requests.'),
    sources: ['NZ-A16', 'NZ-ACT']
  },

  // ── SIM-NZ-10 · previous application note belongs to another applicant ─────
  {
    id: 'SIM-NZ-10', countryId: 'NZ', personId: 'SIM-NZ-P10', name: 'Lena Kowalczyk-Hale',
    difficulty: 'advanced', category: 'record',
    title: L('이름이 비슷한 과거 메모', 'A past note under a similar name'),
    brief: L('이력 확인 활동에서 이름 검색으로 2024년 신청 메모가 나왔습니다. 메모에는 고용주 미확인이라고 적혀 있습니다.', 'A name search for the history check returned a 2024 application note saying an employer could not be verified.'),
    profile: [
      { label: L('신청 맥락', 'Application context'), value: L('방문 신청(모의) SIM-NZ-A10 · 첫 신청으로 기재', 'Visitor application (simulated) SIM-NZ-A10 · stated as first application') },
      { label: L('배정 활동', 'Assigned activity'), value: L('과거 출입국 이력 메모 확인', 'Check previous immigration history notes') },
      { label: L('제출 자료', 'Submitted'), value: L('여권 정보면 · 검색된 과거 메모 · 활동 지시', 'Passport data page · retrieved past note · activity sheet') }
    ],
    opening: L('안녕하세요. 뉴질랜드는 이번이 처음입니다.', 'Hello. This is my first time coming to New Zealand.'),
    documents: [
      { id: 'SIM-NZ-10-DOC1', title: L('여권 정보면 (합성)', 'Passport data page (synthetic)'), pages: [L('Lena Kowalczyk-Hale · 생년월일 1994-03-17 · 여권 PW2093371', 'Lena Kowalczyk-Hale · born 1994-03-17 · passport PW2093371'), NOTICE] },
      { id: 'SIM-NZ-10-DOC2', title: L('검색된 과거 메모', 'Retrieved past note'), pages: [L('2024 신청 메모 · 고객 SIM-NZ-C61 · L. Kowalczyk · 생년월일 1994-07-13 · 신고 고용주 확인 불가', '2024 application note · client SIM-NZ-C61 · L. Kowalczyk · born 1994-07-13 · declared employer could not be verified')] },
      { id: 'SIM-NZ-10-DOC3', title: L('배정 활동 지시', 'Activity sheet'), pages: [L('활동: 신청인 SIM-NZ-A10의 과거 이력 메모 확인 · 이름 검색 결과는 고객 번호와 생년월일로 대조', 'Activity: check history notes for applicant SIM-NZ-A10 · match name-search results by client number and date of birth')] }
    ],
    records: [
      { id: 'SIM-NZ-10-REC1', title: L('현재 고객 기록', 'Current client record'), detail: L('고객 SIM-NZ-C10 · Lena Kowalczyk-Hale · 생년월일 1994-03-17 · 여권 PW2093371 · 과거 신청 없음', 'Client SIM-NZ-C10 · Lena Kowalczyk-Hale · born 1994-03-17 · passport PW2093371 · no previous applications'), documentId: 'SIM-NZ-10-DOC1' },
      { id: 'SIM-NZ-10-REC2', title: L('고객 SIM-NZ-C61 기록', 'Client SIM-NZ-C61 record'), detail: L('고객 SIM-NZ-C61 · Lucja Kowalczyk · 생년월일 1994-07-13 · 2024 신청 1건 · C10과 연결 없음', 'Client SIM-NZ-C61 · Lucja Kowalczyk · born 1994-07-13 · one application in 2024 · no link to C10'), documentId: 'SIM-NZ-10-DOC2' }
    ],
    facts: [
      { id: 'SIM-NZ-10-F-PASSPORT', sourceType: 'document', sourceId: 'SIM-NZ-10-DOC1', page: 0, label: L('여권: 생년월일 1994-03-17', 'Passport: born 1994-03-17') },
      { id: 'SIM-NZ-10-F-NOTE', sourceType: 'document', sourceId: 'SIM-NZ-10-DOC2', page: 0, label: L('과거 메모: 고객 C61, 생년월일 1994-07-13', 'Past note: client C61, born 1994-07-13') },
      { id: 'SIM-NZ-10-F-CLIENT', sourceType: 'record', sourceId: 'SIM-NZ-10-REC1', label: L('현재 고객 C10: 여권·생년월일 일치, 과거 신청 없음', 'Current client C10: passport and date of birth agree, no previous applications') },
      { id: 'SIM-NZ-10-F-OTHER', sourceType: 'record', sourceId: 'SIM-NZ-10-REC2', label: L('고객 C61: Lucja Kowalczyk, 1994-07-13, C10과 연결 없음', 'Client C61: Lucja Kowalczyk, 1994-07-13, no link to C10') },
      { id: 'SIM-NZ-10-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-10-STMT', questionIds: ['nz10_previous'], label: L('진술: 이전 신청 없음, 다른 이름 사용한 적 없음', 'Statement: no earlier application, never used another name') }
    ],
    questions: [
      { id: 'nz10_purpose', q: L('방문 목적을 말씀해 주세요.', 'What is the purpose of your visit?'), answer: L('웰링턴에서 열리는 친구 결혼식에 갑니다. 그 뒤 며칠 여행할 예정입니다.', 'A friend\'s wedding in Wellington, then a few days of travel.') },
      { id: 'nz10_work', q: L('현재 하시는 일은 무엇입니까?', 'What do you do for work?'), answer: L('도서관 사서로 일하고 있습니다.', 'I work as a librarian.') },
      { id: 'nz10_previous', q: L('이전에 뉴질랜드 비자나 NZeTA를 신청한 적이 있습니까? 다른 이름을 쓴 적이 있습니까?', 'Have you applied for a New Zealand visa or NZeTA before, or used another name?'), answer: L('아니요, 이번이 처음입니다. Kowalczyk-Hale은 늘 써 온 이름이고 다른 이름을 쓴 적은 없습니다.', 'No, this is my first application. Kowalczyk-Hale is the name I have always used, and I have never used another name.') },
      { id: 'nz10_return', q: L('언제 돌아가십니까?', 'When do you return?'), answer: L('12월 14일에 출국합니다.', 'I leave on 14 December.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-10-DOB', facts: ['SIM-NZ-10-F-PASSPORT', 'SIM-NZ-10-F-NOTE'], type: 'CONFLICT', findingId: 'NZ10_DOB_MISMATCH', title: L('생년월일 불일치', 'Date of birth differs'), explanation: L('여권 생년월일(1994-03-17)과 메모의 생년월일(1994-07-13)이 다릅니다. 이름 검색만으로 같은 사람이라 볼 수 없습니다.', 'The passport date of birth (1994-03-17) differs from the note (1994-07-13). A name search alone does not make them the same person.'), unlocks: { questions: ['nz10_previous'] } },
      { id: 'COMP-NZ-10-CLIENTS', facts: ['SIM-NZ-10-F-NOTE', 'SIM-NZ-10-F-OTHER'], type: 'MATCH', findingId: 'NZ10_NOTE_BELONGS_C61', title: L('메모는 다른 고객의 것', 'Note belongs to another client'), explanation: L('메모의 고객 번호와 생년월일은 고객 C61 기록과 같으며 C61은 현재 고객과 연결이 없습니다.', 'The note\'s client number and date of birth match client C61, who has no link to the current client.') },
      { id: 'COMP-NZ-10-IDENTITY', facts: ['SIM-NZ-10-F-PASSPORT', 'SIM-NZ-10-F-CLIENT'], type: 'MATCH', findingId: 'NZ10_IDENTITY_MATCHES_CLIENT', title: L('여권과 현재 고객 기록 일치', 'Passport matches current client'), explanation: L('여권 번호와 생년월일이 고객 C10 기록과 일치합니다.', 'Passport number and date of birth match client C10.') },
      { id: 'COMP-NZ-10-NOPRIOR', facts: ['SIM-NZ-10-F-STMT', 'SIM-NZ-10-F-CLIENT'], type: 'MATCH', findingId: 'NZ10_NO_PRIOR_CONFIRMED', title: L('과거 신청 없음 확인', 'No previous application confirmed'), explanation: L('첫 신청이라는 진술이 과거 신청 없음으로 기록된 C10과 맞습니다.', 'The statement that this is a first application agrees with C10 showing no previous applications.') }
    ],
    requests: [],
    expectedOutcome: 'complete',
    outcomeFeedback: {
      complete: L('메모는 생년월일과 고객 번호가 다른 사람의 것이며 이 파일에 편철된 것도 아닙니다. 연습상 검토 완료이며 실제 비자 결정을 뜻하지 않습니다.', 'The note belongs to someone with a different date of birth and client number, and it is not filed in this application. Completing the exercise is not a visa decision.'),
      evidence: L('신원과 이력은 기록으로 이미 확인되었습니다. 다른 사람의 메모 때문에 신청인에게 자료를 요구할 근거가 없습니다.', 'Identity and history are already settled by the records. Another person\'s note is no reason to ask this applicant for anything.'),
      review: L('이름이 비슷하다는 이유만으로 다른 고객의 메모를 이 신청인의 문제로 넘기면 안 됩니다. 남은 상충이 없습니다.', 'A similar name is no reason to hand another client\'s note over as this applicant\'s issue. No conflict remains.')
    },
    assessment: {
      issue: ['NZ10_DOB_MISMATCH'],
      distinguish: ['NZ10_NOTE_BELONGS_C61'],
      resolve: { findings: ['NZ10_IDENTITY_MATCHES_CLIENT', 'NZ10_NO_PRIOR_CONFIRMED'], questions: ['nz10_previous'], requests: [] },
      feedback: {
        issueHit: L('생년월일 불일치 확인', 'Date-of-birth mismatch found'), issueMiss: L('여권과 메모의 생년월일 미대조', 'Passport and note dates of birth not compared'),
        resolveHit: L('메모를 다른 고객으로 분리하고 이력 확인', 'Note separated and history confirmed'), resolveMiss: L('고객 기록 또는 진술 미대조', 'Client record or statement not compared')
      }
    },
    debrief: L('이름 검색은 고객 C61의 메모를 가져왔을 뿐입니다. 생년월일과 고객 번호로 분리하면 현재 신청인의 기록은 깨끗합니다. SIM-NZ-01과 달리 이 파일에 편철된 것이 아니므로 정정할 것이 없습니다.', 'The name search only pulled client C61\'s note. Separated by date of birth and client number, the applicant\'s record is clear. Unlike SIM-NZ-01, nothing was filed into this application, so there is nothing to correct.'),
    sources: ['NZ-A16']
  },

  // ── SIM-NZ-11 · three documents, two discrepancies, one material ──────────
  {
    id: 'SIM-NZ-11', countryId: 'NZ', personId: 'SIM-NZ-P11', name: 'Nadia Brennan',
    difficulty: 'advanced', category: 'complex',
    title: L('두 가지 차이, 하나의 쟁점', 'Two discrepancies, one issue'),
    brief: L('학회 참석 방문입니다. 신청 정보, 학회 등록 확인서, 호텔 예약을 함께 대조해야 합니다.', 'A conference visit. The application details, conference registration and hotel booking all need to be compared.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('학회 참석(오클랜드) 후 여행', 'Conference in Auckland, then travel') },
      { label: L('체류 기간', 'Stated stay'), value: L('14일 (12월 3일–17일)', '14 days (3–17 December)') },
      { label: L('제출 자료', 'Submitted'), value: L('신청 정보 · 학회 등록 확인서 · 호텔 예약', 'Application details · conference registration · hotel booking') }
    ],
    opening: L('안녕하세요. 오클랜드 학회에 발표하러 왔습니다.', 'Hello. I am presenting at a conference in Auckland.'),
    documents: [
      { id: 'SIM-NZ-11-DOC1', title: L('신청 정보', 'Application details'), pages: [L('Nadia Brennan · 여권 끝자리 …5521 · 체류 12월 3일–17일 · 숙박: 호텔', 'Nadia Brennan · passport ending …5521 · stay 3–17 Dec · accommodation: hotel'), NOTICE] },
      { id: 'SIM-NZ-11-DOC2', title: L('학회 등록 확인서', 'Conference registration'), pages: [L('등록자 "Nadia Brenan" · 등록 SIM-NZ-11-CONF · 학회 12월 8일–10일, 오클랜드', 'Registrant "Nadia Brenan" · registration SIM-NZ-11-CONF · conference 8–10 Dec, Auckland')] },
      { id: 'SIM-NZ-11-DOC3', title: L('호텔 예약', 'Hotel booking'), pages: [L('오클랜드 시내 호텔 · 체크인 12월 3일 · 체크아웃 12월 10일 · 7박 · 투숙객 N. Brennan', 'Auckland city hotel · check-in 3 Dec · check-out 10 Dec · 7 nights · guest N. Brennan')] }
    ],
    records: [
      { id: 'SIM-NZ-11-REC1', title: L('신청 기록', 'Application record'), detail: L('출국 예정 2026-12-17 · 숙박 항목: 호텔 1건', 'Planned departure 2026-12-17 · accommodation: one hotel entry'), documentId: 'SIM-NZ-11-DOC1' },
      { id: 'SIM-NZ-11-REC2', title: L('학회 등록 조회', 'Conference registration lookup'), detail: L('SIM-NZ-11-CONF · 등록자 여권 끝자리 …5521 · 연락 이메일이 신청서와 같음', 'SIM-NZ-11-CONF · registrant passport ending …5521 · contact email same as application'), documentId: 'SIM-NZ-11-DOC2' }
    ],
    facts: [
      { id: 'SIM-NZ-11-F-NAME', sourceType: 'document', sourceId: 'SIM-NZ-11-DOC1', page: 0, label: L('신청 정보: Nadia Brennan, 여권 …5521', 'Application: Nadia Brennan, passport …5521') },
      { id: 'SIM-NZ-11-F-CONFNAME', sourceType: 'document', sourceId: 'SIM-NZ-11-DOC2', page: 0, label: L('학회 등록자: "Nadia Brenan"', 'Conference registrant: "Nadia Brenan"') },
      { id: 'SIM-NZ-11-F-CONFREG', sourceType: 'record', sourceId: 'SIM-NZ-11-REC2', label: L('등록 조회: 여권 …5521, 이메일 일치', 'Registration lookup: passport …5521, email agrees') },
      { id: 'SIM-NZ-11-F-HOTEL', sourceType: 'document', sourceId: 'SIM-NZ-11-DOC3', page: 0, label: L('호텔: 12월 3일–10일, 7박', 'Hotel: 3–10 Dec, 7 nights') },
      { id: 'SIM-NZ-11-F-DEPART', sourceType: 'record', sourceId: 'SIM-NZ-11-REC1', label: L('신청 기록: 12월 17일 출국, 숙박은 호텔 1건', 'Application record: departs 17 Dec, one hotel entry') },
      { id: 'SIM-NZ-11-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-11-STMT', questionIds: ['nz11_after'], label: L('진술: 12월 10–17일 라글란 친구 바크, 서면 자료 없음', 'Statement: 10–17 Dec at a friend\'s bach in Raglan, nothing in writing') }
    ],
    questions: [
      { id: 'nz11_conf', q: L('학회 일정을 말씀해 주세요.', 'Please tell me about the conference.'), answer: L('12월 8일부터 10일까지이고 저는 9일에 발표합니다.', 'It runs from 8 to 10 December, and I present on the 9th.') },
      { id: 'nz11_before', q: L('학회 전 며칠은 어떻게 보내십니까?', 'How will you spend the days before the conference?'), answer: L('시차 적응을 하고 발표 준비를 하면서 오클랜드를 좀 둘러볼 생각입니다.', 'Getting over the jet lag, preparing my talk and seeing a bit of Auckland.') },
      { id: 'nz11_spelling', q: L('학회 등록은 어떻게 하셨습니까?', 'How did you register for the conference?'), answer: L('학회 웹사이트에서 직접 등록했습니다. 이름을 급하게 쳤던 것 같습니다.', 'Online, on the conference website. I typed my name in a hurry.') },
      { id: 'nz11_after', q: L('호텔 체크아웃 후 출국까지는 어디에 머무십니까?', 'Where will you stay between hotel check-out and departure?'), answer: L('12월 10일부터 17일까지 라글란에 있는 친구 바크에서 지냅니다. 친구가 말로 초대했을 뿐이라 서면으로 된 건 아직 없습니다.', 'From 10 to 17 December at a friend\'s bach in Raglan. She invited me in conversation, so I have nothing in writing yet.') },
      { id: 'nz11_return', q: L('귀국 항공편은 확정되어 있습니까?', 'Is your return flight booked?'), answer: L('네, 12월 17일 오클랜드 출발입니다.', 'Yes, from Auckland on 17 December.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-11-NAME', facts: ['SIM-NZ-11-F-NAME', 'SIM-NZ-11-F-CONFNAME'], type: 'CONFLICT', findingId: 'NZ11_NAME_SPELLING', title: L('등록 이름 철자 차이', 'Registration name spelling differs'), explanation: L('신청 정보는 Brennan, 학회 등록은 Brenan으로 철자가 한 글자 다릅니다.', 'The application says Brennan; the registration says Brenan, one letter different.'), unlocks: { questions: ['nz11_spelling'] } },
      { id: 'COMP-NZ-11-REGISTRANT', facts: ['SIM-NZ-11-F-CONFREG', 'SIM-NZ-11-F-NAME'], type: 'MATCH', findingId: 'NZ11_REGISTRANT_SAME_PERSON', title: L('등록자는 같은 사람', 'Registrant is the same person'), explanation: L('등록 조회의 여권 끝자리와 이메일이 신청 정보와 같습니다. 철자 차이는 쟁점이 아닙니다.', 'The lookup\'s passport digits and email match the application, so the spelling is not an issue.') },
      { id: 'COMP-NZ-11-NIGHTS', facts: ['SIM-NZ-11-F-DEPART', 'SIM-NZ-11-F-HOTEL'], type: 'MISSING', findingId: 'NZ11_NIGHTS_UNCOVERED', title: L('7박 숙박 근거 없음', 'Seven nights without accommodation evidence'), explanation: L('출국은 12월 17일인데 호텔은 10일 체크아웃입니다. 10–17일 숙박 근거가 제출되지 않았습니다.', 'Departure is 17 December but the hotel ends on the 10th; nothing covers 10–17 December.'), unlocks: { questions: ['nz11_after'] } },
      { id: 'COMP-NZ-11-LATER', facts: ['SIM-NZ-11-F-STMT', 'SIM-NZ-11-F-HOTEL'], type: 'UNVERIFIED', findingId: 'NZ11_LATER_STAY_UNSUPPORTED', title: L('후반 숙박 미확인', 'Later stay unconfirmed'), explanation: L('라글란 체류 진술은 일정 공백을 설명하지만 확인할 서면 자료가 없습니다.', 'The Raglan stay explains the gap in dates, but nothing in writing confirms it.'), unlocks: { requests: ['SIM-NZ-11-REQ-ACCOM'] } }
    ],
    requests: [
      { id: 'SIM-NZ-11-REQ-ACCOM', title: L('12월 10–17일 숙박 확인 요청', 'Request accommodation confirmation for 10–17 December'), result: L('요청 기록됨: 라글란 숙박 제공자의 확인서(주소·기간) 보완 요청 · 접수 대기', 'Request recorded: confirmation from the Raglan host (address and dates) requested · awaiting receipt') }
    ],
    expectedOutcome: 'evidence',
    outcomeFeedback: {
      complete: L('이름 철자는 해결되었지만 후반 7박의 숙박 근거가 없습니다. 하나만 확인하고 닫으면 쟁점이 남습니다.', 'The spelling is resolved, but seven nights have no accommodation evidence. Closing after one check leaves the real point open.'),
      evidence: L('철자 차이는 등록 조회로 해소되고, 남은 쟁점은 10–17일 숙박입니다. 그 기간의 숙박 확인서를 특정해 요청하는 것이 맞습니다.', 'The lookup settles the spelling; the remaining point is 10–17 December. Requesting confirmation for those nights is right.'),
      review: L('상충은 없습니다. 철자 차이는 같은 사람으로 확인되었고 숙박은 자료로 보완할 수 있습니다.', 'Nothing conflicts. The spelling belongs to the same person, and the accommodation can be supported with a document.')
    },
    assessment: {
      issue: ['NZ11_NIGHTS_UNCOVERED'],
      distinguish: ['NZ11_REGISTRANT_SAME_PERSON', 'NZ11_NAME_SPELLING'],
      resolve: { findings: ['NZ11_LATER_STAY_UNSUPPORTED'], questions: ['nz11_after'], requests: ['SIM-NZ-11-REQ-ACCOM'] },
      feedback: {
        issueHit: L('후반 7박 숙박 공백 확인', 'Seven-night accommodation gap found'), issueMiss: L('출국일과 호텔 기간 미대조', 'Departure and hotel dates not compared'),
        resolveHit: L('공백 기간 특정 후 숙박 확인 요청', 'Gap specified and confirmation requested'), resolveMiss: L('진술 대조 또는 숙박 확인 요청 누락', 'Statement not compared or confirmation not requested')
      }
    },
    debrief: L('차이는 두 가지입니다. 이름 철자는 등록 조회로 같은 사람임이 확인되어 중요하지 않습니다. 출국일과 호텔 기간 사이 7박은 근거가 없으므로 그 기간의 숙박 확인서를 요청합니다.', 'There are two discrepancies. The spelling is immaterial once the lookup shows the same registrant. The seven nights between hotel check-out and departure have no support, so request confirmation for them.'),
    sources: ['NZ-A16', 'NZ-Y35']
  },

  // ── SIM-NZ-12 · sponsor declaration signed after travel and receipt ───────
  {
    id: 'SIM-NZ-12', countryId: 'NZ', personId: 'SIM-NZ-P12', name: 'Oskar Thielmann',
    difficulty: 'advanced', category: 'third-party',
    title: L('나중 날짜의 후원 서명', 'A sponsor signature dated later'),
    brief: L('후원자 확인 활동이 배정되었습니다. 후원 신고서의 서명일과 접수·여행 일정을 대조해야 합니다.', 'A sponsor check is assigned. The sponsor declaration\'s signature date must be compared with the receipt and travel dates.'),
    profile: [
      { label: L('방문 목적', 'Stated purpose'), value: L('이모 가족 방문 · 타우랑가', 'Visiting his aunt\'s family · Tauranga') },
      { label: L('신청 맥락', 'Application context'), value: L('후원 방문 신청(모의) SIM-NZ-A12 · 접수 2026-11-09', 'Sponsored visit application (simulated) SIM-NZ-A12 · lodged 2026-11-09') },
      { label: L('제출 자료', 'Submitted'), value: L('신청 요약 · 후원 신고서 · 후원자 신분·주소 자료', 'Application summary · sponsor declaration · sponsor ID and address page') }
    ],
    opening: L('안녕하세요. 이모가 후원해 주셔서 방문하게 되었습니다.', 'Hello. My aunt is sponsoring my visit.'),
    documents: [
      { id: 'SIM-NZ-12-DOC1', title: L('신청 요약', 'Application summary'), pages: [L('신청 SIM-NZ-A12 · 접수 2026-11-09 · 후원 신고서 첨부 · 도착 예정 2026-12-01', 'Application SIM-NZ-A12 · lodged 2026-11-09 · sponsor declaration attached · arrival planned 2026-12-01'), NOTICE] },
      { id: 'SIM-NZ-12-DOC2', title: L('후원 신고서', 'Sponsor declaration'), pages: [L('후원자 Marama Whitfield · 12 Kahikatea Drive, 타우랑가 · 피후원자 Oskar Thielmann', 'Sponsor Marama Whitfield · 12 Kahikatea Drive, Tauranga · sponsoring Oskar Thielmann'), L('후원자 서명 · 서명일 2026-12-09', 'Sponsor signature · signed 2026-12-09')] },
      { id: 'SIM-NZ-12-DOC3', title: L('후원자 신분·주소 자료', 'Sponsor ID and address page'), pages: [L('Marama Whitfield · 주소 12 Kahikatea Drive, 타우랑가 · 공과금 고지서 2026-10', 'Marama Whitfield · address 12 Kahikatea Drive, Tauranga · utility bill, October 2026')] }
    ],
    records: [
      { id: 'SIM-NZ-12-REC1', title: L('문서 접수 기록', 'Document receipt log'), detail: L('후원 신고서 2쪽 · 접수 2026-11-09 · 신청과 함께 접수', 'Sponsor declaration, 2 pages · received 2026-11-09 · lodged with the application'), documentId: 'SIM-NZ-12-DOC2' }
    ],
    facts: [
      { id: 'SIM-NZ-12-F-ARRIVAL', sourceType: 'document', sourceId: 'SIM-NZ-12-DOC1', page: 0, label: L('도착 예정 2026-12-01', 'Arrival planned 2026-12-01') },
      { id: 'SIM-NZ-12-F-SIGNED', sourceType: 'document', sourceId: 'SIM-NZ-12-DOC2', page: 1, label: L('후원 신고서 서명일 2026-12-09', 'Sponsor declaration signed 2026-12-09') },
      { id: 'SIM-NZ-12-F-RECEIVED', sourceType: 'record', sourceId: 'SIM-NZ-12-REC1', label: L('접수 기록: 후원 신고서 2026-11-09 접수', 'Receipt log: sponsor declaration received 2026-11-09') },
      { id: 'SIM-NZ-12-F-DECLADDR', sourceType: 'document', sourceId: 'SIM-NZ-12-DOC2', page: 0, label: L('신고서 후원자 주소: 12 Kahikatea Drive', 'Declaration sponsor address: 12 Kahikatea Drive') },
      { id: 'SIM-NZ-12-F-IDADDR', sourceType: 'document', sourceId: 'SIM-NZ-12-DOC3', page: 0, label: L('주소 자료: 12 Kahikatea Drive', 'Address page: 12 Kahikatea Drive') },
      { id: 'SIM-NZ-12-F-STMT', sourceType: 'statement', sourceId: 'SIM-NZ-12-STMT', questionIds: ['nz12_signed'], label: L('진술: 이모가 신청 전 11월 초에 서명, 영상 통화로 지켜봄', 'Statement: his aunt signed in early November before he applied; he watched on a video call') }
    ],
    questions: [
      { id: 'nz12_sponsor', q: L('후원자와는 어떤 관계입니까?', 'What is your relationship to the sponsor?'), answer: L('어머니의 언니, 제 이모입니다. 타우랑가에 오래 사셨습니다.', 'She is my mother\'s older sister, my aunt. She has lived in Tauranga for many years.') },
      { id: 'nz12_stay', q: L('방문 기간 동안 어디에 머무십니까?', 'Where will you stay during the visit?'), answer: L('이모 댁에서 지냅니다. 3주 정도 있을 예정입니다.', 'At my aunt\'s house, for about three weeks.') },
      { id: 'nz12_signed', q: L('후원 신고서는 언제 서명되었습니까?', 'When was the sponsor declaration signed?'), answer: L('제가 신청하기 전, 11월 초에 이모가 부엌 식탁에서 서명했습니다. 영상 통화로 직접 봤습니다. 날짜를 어떻게 적으셨는지는 모르겠습니다.', 'My aunt signed it at her kitchen table in early November, before I applied. I watched on a video call. I don\'t know what date she wrote.') },
      { id: 'nz12_arrival', q: L('도착일은 언제입니까?', 'When do you arrive?'), answer: L('12월 1일에 도착합니다.', 'On 1 December.') }
    ],
    comparisons: [
      { id: 'COMP-NZ-12-AFTER-TRAVEL', facts: ['SIM-NZ-12-F-SIGNED', 'SIM-NZ-12-F-ARRIVAL'], type: 'CONFLICT', findingId: 'NZ12_SIGNED_AFTER_TRAVEL', title: L('서명일이 도착일 이후', 'Signed after planned arrival'), explanation: L('서명일(12월 9일)이 도착 예정일(12월 1일)보다 늦습니다.', 'The signature date (9 December) is later than the planned arrival (1 December).'), unlocks: { questions: ['nz12_signed'] } },
      { id: 'COMP-NZ-12-AFTER-RECEIPT', facts: ['SIM-NZ-12-F-SIGNED', 'SIM-NZ-12-F-RECEIVED'], type: 'CONFLICT', findingId: 'NZ12_SIGNED_AFTER_RECEIPT', title: L('서명일이 접수일 이후', 'Signed after it was received'), explanation: L('11월 9일에 접수된 문서에 12월 9일 서명일이 적혀 있습니다. 두 날짜가 함께 성립하지 않습니다.', 'A document received on 9 November carries a 9 December signature date; both cannot be right.'), unlocks: { questions: ['nz12_signed'] } },
      { id: 'COMP-NZ-12-ADDRESS', facts: ['SIM-NZ-12-F-DECLADDR', 'SIM-NZ-12-F-IDADDR'], type: 'MATCH', findingId: 'NZ12_SPONSOR_DETAILS_MATCH', title: L('후원자 주소 일치', 'Sponsor address agrees'), explanation: L('신고서와 주소 자료의 후원자 주소가 같습니다. 쟁점은 서명일뿐입니다.', 'The declaration and address page give the same sponsor address; only the signature date is in question.') },
      { id: 'COMP-NZ-12-STMT-RECEIPT', facts: ['SIM-NZ-12-F-STMT', 'SIM-NZ-12-F-RECEIVED'], type: 'MATCH', findingId: 'NZ12_STMT_FITS_RECEIPT', title: L('진술은 접수일과 부합', 'Statement fits receipt date'), explanation: L('11월 초 서명 진술은 11월 9일 접수 기록과 맞습니다.', 'An early-November signing fits the 9 November receipt.') },
      { id: 'COMP-NZ-12-STMT-SIGNED', facts: ['SIM-NZ-12-F-STMT', 'SIM-NZ-12-F-SIGNED'], type: 'UNVERIFIED', findingId: 'NZ12_DATE_UNEXPLAINED', title: L('문서상 서명일 미해명', 'Written date still unexplained'), explanation: L('진술은 신고서에 적힌 12월 9일을 설명하거나 정정하지 못합니다. 후원자 본인의 문서이므로 이 활동에서 확정할 수 없습니다.', 'The statement neither explains nor corrects the 9 December date on the form. It is the sponsor\'s own document, so this activity cannot settle it.') }
    ],
    requests: [],
    expectedOutcome: 'review',
    outcomeFeedback: {
      complete: L('접수 전에 서명했다는 진술이 있어도 문서의 서명일은 그대로입니다. 날짜가 상충하는 후원 신고서를 근거로 활동을 닫을 수 없습니다.', 'Even with the statement, the form still bears a date after its own receipt. The activity cannot close on a declaration with conflicting dates.'),
      evidence: L('새로 서명한 신고서로는 접수 당시 문서에 왜 나중 날짜가 있는지 설명되지 않습니다. 원 문서의 상충은 평가 담당자가 다룰 사항입니다.', 'A newly signed form would not explain why the document lodged in November carries a December date. That conflict is for the assessing officer.'),
      review: L('서명일, 접수일, 도착일의 상충과 주소 일치를 기록하고 추가 검토로 넘기는 것이 근거와 맞습니다. 위조로 단정하지 않습니다.', 'Recording the conflict between signature, receipt and arrival dates, and that the address agrees, then referring it, matches the evidence. Nothing is presumed forged.')
    },
    assessment: {
      issue: ['NZ12_SIGNED_AFTER_RECEIPT', 'NZ12_SIGNED_AFTER_TRAVEL'],
      distinguish: ['NZ12_SPONSOR_DETAILS_MATCH'],
      resolve: { findings: ['NZ12_DATE_UNEXPLAINED'], questions: ['nz12_signed'], requests: [] },
      feedback: {
        issueHit: L('서명일 상충 확인', 'Signature date conflict found'), issueMiss: L('서명일과 접수·도착일 미대조', 'Signature date not compared with receipt or arrival'),
        resolveHit: L('진술로 서명일이 해소되지 않음 확인', 'Statement shown not to settle the date'), resolveMiss: L('서명일과 진술 미대조', 'Statement not compared with the written date')
      }
    },
    debrief: L('11월 9일 접수된 신고서에 12월 9일 서명일이 있어 날짜가 성립하지 않습니다. 진술은 접수일과 맞지만 문서를 정정하지 못하므로, 위조로 단정하지 않고 추가 검토로 넘깁니다.', 'A declaration received on 9 November is dated 9 December, which cannot both be true. The statement fits the receipt but cannot correct the document, so refer it without presuming forgery.'),
    sources: ['NZ-A16', 'NZ-Y35', 'NZ-ACT']
  }
];
