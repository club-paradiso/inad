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
  }
];
