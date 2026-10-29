// Authored synthetic exercises, not actual records or legal determinations.
// Every outcome uses SIMULATION_RULE. Shared presentation text is defined once.
const exerciseData = [
  {
    "id": "SIM-CA-01",
    "countryId": "CA",
    "personId": "SIM-CA-P01",
    "name": "Avery Morgan",
    "title": {
      "ko": "방문 기록의 날짜",
      "en": "Visit dates"
    },
    "brief": {
      "ko": "항공권은 11월 12일 출국으로 되어 있으나 방문 기록에는 11월 21일로 기재되어 있습니다.",
      "en": "The ticket shows departure on 12 November; the visit record says 21 November."
    },
    "expectedOutcome": "review",
    "debrief": {
      "ko": "진술만으로 기록의 날짜가 수정되지는 않았습니다. 두 원문을 남기고 추가 대조를 요청합니다.",
      "en": "The explanation does not amend the record. Retain both sources and request further review."
    },
    "evidence": [
      {
        "ko": "항공권: 출국 2026-11-12",
        "en": "Ticket: departure 2026-11-12"
      },
      {
        "ko": "방문 기록: 출국 2026-11-21",
        "en": "Visit record: departure 2026-11-21"
      }
    ],
    "reply": {
      "ko": "기록을 작성할 때 날짜를 뒤집어 적었습니다. 항공권의 11월 12일이 맞습니다.",
      "en": "I transposed the date when writing the visit record. The ticket date, 12 November, is correct."
    }
  },
  {
    "id": "SIM-CA-02",
    "countryId": "CA",
    "personId": "SIM-CA-P02",
    "name": "Jordan Ellis",
    "title": {
      "ko": "누락된 숙박 확인",
      "en": "Missing accommodation evidence"
    },
    "brief": {
      "ko": "방문 계획에는 친구 집에 머문다고 적혀 있지만 제출 자료에 숙박 확인이 없습니다.",
      "en": "The visit plan mentions staying with a friend, but no accommodation confirmation is supplied."
    },
    "expectedOutcome": "evidence",
    "debrief": {
      "ko": "누락된 자료가 무엇인지 구체적으로 기록합니다. 자료 미제출 자체를 입국불허 결론으로 바꾸지 않습니다.",
      "en": "Specify the missing evidence. Missing evidence alone is not a legal refusal conclusion."
    },
    "evidence": [
      {
        "ko": "방문 계획: 친구 집에서 8일 체류",
        "en": "Visit plan: eight days at a friend’s home"
      },
      {
        "ko": "제출 목록: 여권 사본, 방문 계획만 접수",
        "en": "Submission list: passport copy and visit plan only"
      }
    ],
    "reply": {
      "ko": "초대 메시지를 아직 제출하지 않았습니다.",
      "en": "I have not submitted the invitation message yet."
    }
  },
  {
    "id": "SIM-CA-03",
    "countryId": "CA",
    "personId": "SIM-CA-P03",
    "name": "Taylor Rowan",
    "title": {
      "ko": "같은 이름의 과거 기록",
      "en": "Same-name historical record"
    },
    "brief": {
      "ko": "검색 결과의 과거 방문 기록은 현재 대상과 문서 식별자가 다릅니다.",
      "en": "A historical visit returned by the search has a different document identifier."
    },
    "expectedOutcome": "complete",
    "debrief": {
      "ko": "문서 식별자로 기록을 분리했습니다. 연습상 검토 완료이며 실제 입국허가를 뜻하지 않습니다.",
      "en": "The identifiers separate the records. Completing this exercise does not grant entry."
    },
    "evidence": [
      {
        "ko": "현재 대상: SIM-CA-P03 / 문서 SIM-CA-D03",
        "en": "Current person: SIM-CA-P03 / document SIM-CA-D03"
      },
      {
        "ko": "과거 동명이인: SIM-CA-P90 / 문서 SIM-CA-D90",
        "en": "Historical same-name person: SIM-CA-P90 / document SIM-CA-D90"
      }
    ],
    "reply": {
      "ko": "그 방문 기록은 제 것이 아닙니다. 제 문서 식별자는 현재 접수 자료와 같습니다.",
      "en": "That visit is not mine. My document identifier matches the current submission."
    }
  },
  {
    "id": "SIM-GB-01",
    "countryId": "GB",
    "personId": "SIM-GB-P01",
    "name": "Casey Lane",
    "title": {
      "ko": "인계 메모의 누락",
      "en": "Incomplete handover"
    },
    "brief": {
      "ko": "담당 과업은 방문 일정 확인입니다. 이전 메모는 첨부를 참조하지만 첨부가 없습니다.",
      "en": "The assigned task is to check the visit schedule. The previous note references an absent attachment."
    },
    "expectedOutcome": "evidence",
    "debrief": {
      "ko": "과업 체크 표시가 첨부 자료를 대신할 수 없습니다. 일정표를 요청하고 인계 사유를 남깁니다.",
      "en": "A task checkmark cannot replace evidence. Request the itinerary and record the handover reason."
    },
    "evidence": [
      {
        "ko": "인계 메모: 일정표 첨부 확인 필요",
        "en": "Handover note: itinerary attachment needs review"
      },
      {
        "ko": "접수 목록: 일정표 미접수",
        "en": "Receipt: itinerary not received"
      }
    ],
    "reply": {
      "ko": "일정표를 보냈다고 생각했지만 접수 목록에는 없습니다. 다시 제출하겠습니다.",
      "en": "I thought I sent the itinerary, but it is not on the receipt. I will submit it again."
    }
  },
  {
    "id": "SIM-GB-02",
    "countryId": "GB",
    "personId": "SIM-GB-P02",
    "name": "Riley Park",
    "title": {
      "ko": "초대장과 인터뷰의 차이",
      "en": "Invitation and interview conflict"
    },
    "brief": {
      "ko": "초대장에는 이틀간 행사 참석이라고 적혀 있으나 첫 진술은 열흘이라고 합니다.",
      "en": "The invitation describes a two-day event, while the opening statement says ten days."
    },
    "expectedOutcome": "review",
    "debrief": {
      "ko": "설명되지 않은 기간을 표시하고 추가 검토로 넘깁니다. 방문자 규칙의 확정 적용 결과가 아닙니다.",
      "en": "Flag the unexplained period for further review. This is not a definitive application of the Visitor Rules."
    },
    "evidence": [
      {
        "ko": "초대장: 행사 2026-11-04 ~ 2026-11-05",
        "en": "Invitation: event 2026-11-04 to 2026-11-05"
      },
      {
        "ko": "첫 진술: 방문 일정 10일",
        "en": "Opening statement: ten-day visit"
      }
    ],
    "reply": {
      "ko": "행사는 이틀이고 나머지 일정은 아직 설명하지 않았습니다.",
      "en": "The event lasts two days. I have not explained the remainder of the trip."
    }
  },
  {
    "id": "SIM-GB-03",
    "countryId": "GB",
    "personId": "SIM-GB-P03",
    "name": "Alex Finley",
    "title": {
      "ko": "완료된 과업의 근거",
      "en": "Evidence behind a completed task"
    },
    "brief": {
      "ko": "이전 과업의 접수 번호와 새로 제출한 자료의 번호가 일치합니다. 원문 확인이 필요합니다.",
      "en": "The earlier task receipt matches the new submission reference. Check the source documents."
    },
    "expectedOutcome": "complete",
    "debrief": {
      "ko": "원문과 진술로 같은 자료임을 확인했습니다. 과업 검토 완료와 실제 입국허가는 별개입니다.",
      "en": "The sources and statement identify the same evidence. Task completion is separate from permission to enter."
    },
    "evidence": [
      {
        "ko": "이전 과업: 자료 접수 SIM-GB-R03",
        "en": "Earlier task: evidence received SIM-GB-R03"
      },
      {
        "ko": "새 자료: 재제출 참조 SIM-GB-R03",
        "en": "New evidence: resubmission reference SIM-GB-R03"
      }
    ],
    "reply": {
      "ko": "같은 자료를 다시 제출한 것입니다. 접수 번호를 확인해 주세요.",
      "en": "I resubmitted the same evidence. Please compare the receipt references."
    }
  },
  {
    "id": "SIM-NZ-01",
    "countryId": "NZ",
    "personId": "SIM-NZ-P01",
    "name": "Sam Linden",
    "title": {
      "ko": "신청 활동의 다른 식별자",
      "en": "Activity linked to another application"
    },
    "brief": {
      "ko": "검토 활동은 현재 신청에 배정되어 있으나 첨부 표지의 신청 번호가 다릅니다.",
      "en": "The activity is assigned to this application, but the attachment cover names another application."
    },
    "expectedOutcome": "review",
    "debrief": {
      "ko": "현재 신청과 다른 첨부를 구분하여 추가 검토합니다. 다른 활동의 결과를 자동으로 취소하지 않습니다.",
      "en": "Separate the mismatched attachment for further review. Do not automatically invalidate other activities."
    },
    "evidence": [
      {
        "ko": "현재 신청: SIM-NZ-A01",
        "en": "Current application: SIM-NZ-A01"
      },
      {
        "ko": "첨부 표지: SIM-NZ-A90",
        "en": "Attachment cover: SIM-NZ-A90"
      }
    ],
    "reply": {
      "ko": "다른 신청의 표지가 섞인 것 같습니다. 현재 신청 자료로 다시 확인해 주세요.",
      "en": "A cover from another application appears to have been included. Please check the current application evidence."
    }
  },
  {
    "id": "SIM-NZ-02",
    "countryId": "NZ",
    "personId": "SIM-NZ-P02",
    "name": "Robin Ash",
    "title": {
      "ko": "미확인 자료 요청",
      "en": "Request outstanding evidence"
    },
    "brief": {
      "ko": "자료 활동에는 체류 계획이 접수되었다고 표시되지만 해당 문서의 둘째 페이지가 없습니다.",
      "en": "The evidence activity lists a stay plan, but its second page is missing."
    },
    "expectedOutcome": "evidence",
    "debrief": {
      "ko": "누락된 페이지와 필요한 정보를 적어 요청합니다. 신청 전체의 허가 여부를 이 연습에서 결정하지 않습니다.",
      "en": "Request the missing page and specify the information needed. This exercise does not decide the whole application."
    },
    "evidence": [
      {
        "ko": "체류 계획 1쪽: 여행 일정 요약",
        "en": "Stay plan page 1: trip summary"
      },
      {
        "ko": "접수 확인: 2쪽 미접수",
        "en": "Receipt check: page 2 absent"
      }
    ],
    "reply": {
      "ko": "둘째 페이지에 숙박 계획이 있습니다. 빠진 페이지를 제출하겠습니다.",
      "en": "The accommodation plan is on page two. I will supply the missing page."
    }
  },
  {
    "id": "SIM-NZ-03",
    "countryId": "NZ",
    "personId": "SIM-NZ-P03",
    "name": "Drew Vale",
    "title": {
      "ko": "활동 결과와 후속 메모",
      "en": "Activity result and follow-up note"
    },
    "brief": {
      "ko": "자료 확인 활동의 참조와 후속 메모가 같은 신청의 같은 문서를 가리킵니다.",
      "en": "The evidence activity and follow-up note refer to the same document in the same application."
    },
    "expectedOutcome": "complete",
    "debrief": {
      "ko": "배정 활동의 근거 연결을 확인했습니다. 이는 가상 활동 완료이며 비자 발급이나 입국허가가 아닙니다.",
      "en": "The assigned activity has a traceable evidence link. This fictional completion is neither a visa grant nor entry permission."
    },
    "evidence": [
      {
        "ko": "활동 자료: SIM-NZ-A03 / SIM-NZ-E03",
        "en": "Activity evidence: SIM-NZ-A03 / SIM-NZ-E03"
      },
      {
        "ko": "후속 메모: SIM-NZ-A03 / SIM-NZ-E03 확인",
        "en": "Follow-up note: SIM-NZ-A03 / SIM-NZ-E03 checked"
      }
    ],
    "reply": {
      "ko": "그 문서가 최신 제출본입니다. 후속 메모의 참조도 동일합니다.",
      "en": "That is the latest submission. The follow-up note has the same reference."
    }
  }
];
// Optional source-comparison questions: case-specific, fully grounded in the two visible records.
// Added without changing prior save IDs, completion gates, or authoritative legal rules.
const followUps = {
  "SIM-CA-01": {
    "q": {
      "ko": "항공권과 방문 기록에 적힌 출국일은 각각 언제입니까?",
      "en": "What departure date appears in each source?"
    },
    "answer": {
      "ko": "항공권은 2026년 11월 12일, 방문 기록은 11월 21일입니다.",
      "en": "The ticket says 12 November 2026; the visit record says 21 November."
    }
  },
  "SIM-CA-02": {
    "q": {
      "ko": "숙박 확인과 관련해 실제로 접수된 자료는 무엇입니까?",
      "en": "Which documents were actually submitted about the stay?"
    },
    "answer": {
      "ko": "제출 목록에는 여권 사본과 방문 계획만 있고 숙박 확인은 없습니다.",
      "en": "Only a passport copy and visit plan are listed; accommodation confirmation is absent."
    }
  },
  "SIM-CA-03": {
    "q": {
      "ko": "현재 대상과 과거 동명이인의 문서 식별자는 일치합니까?",
      "en": "Do the document identifiers match for the current person and same-name record?"
    },
    "answer": {
      "ko": "현재 문서는 SIM-CA-D03, 과거 동명이인 문서는 SIM-CA-D90으로 다릅니다.",
      "en": "The current document is SIM-CA-D03 and the historical document is SIM-CA-D90; they differ."
    }
  },
  "SIM-GB-01": {
    "q": {
      "ko": "인계 메모가 언급한 일정표는 실제 접수 목록에 있습니까?",
      "en": "Is the itinerary mentioned in the handover note in the received list?"
    },
    "answer": {
      "ko": "인계 메모는 일정표를 참조하지만 접수 목록에는 일정표가 없습니다.",
      "en": "The handover note references an itinerary, but none appears in the received list."
    }
  },
  "SIM-GB-02": {
    "q": {
      "ko": "초대장의 행사 날짜와 첫 진술의 방문 기간은 어떻게 다릅니까?",
      "en": "How do the event dates differ from the stated visit length?"
    },
    "answer": {
      "ko": "초대장은 11월 4일부터 5일까지의 행사이고, 첫 진술은 방문 10일입니다.",
      "en": "The invitation covers 4–5 November; the opening statement describes a ten-day visit."
    }
  },
  "SIM-GB-03": {
    "q": {
      "ko": "이전 과업과 재제출 자료의 참조번호는 무엇입니까?",
      "en": "Which reference appears in both the earlier task and resubmitted evidence?"
    },
    "answer": {
      "ko": "양쪽 모두 SIM-GB-R03입니다.",
      "en": "Both list SIM-GB-R03."
    }
  },
  "SIM-NZ-01": {
    "q": {
      "ko": "현재 신청 번호와 첨부 표지의 번호가 같은가요?",
      "en": "Does the attachment cover match the current application identifier?"
    },
    "answer": {
      "ko": "현재 신청은 SIM-NZ-A01, 첨부 표지는 SIM-NZ-A90으로 서로 다릅니다.",
      "en": "The current application is SIM-NZ-A01; the attachment cover says SIM-NZ-A90."
    }
  },
  "SIM-NZ-02": {
    "q": {
      "ko": "체류 계획의 몇 쪽이 접수 확인에서 빠져 있습니까?",
      "en": "Which page of the stay plan is missing from the receipt?"
    },
    "answer": {
      "ko": "접수 확인에는 체류 계획의 둘째 페이지가 없습니다.",
      "en": "The receipt is missing page two of the stay plan."
    }
  },
  "SIM-NZ-03": {
    "q": {
      "ko": "자료 확인 활동과 후속 메모가 가리키는 참조번호는 무엇입니까?",
      "en": "Which references do the evidence activity and follow-up note share?"
    },
    "answer": {
      "ko": "두 기록 모두 SIM-NZ-A03 / SIM-NZ-E03을 가리킵니다.",
      "en": "Both refer to SIM-NZ-A03 / SIM-NZ-E03."
    }
  }
};
const documentTitles = [{"ko":"제출 자료","en":"Submitted evidence"},{"ko":"연결 기록","en":"Linked record"}];
const syntheticNotice = {"ko":"합성 문서 · 보안특징 및 진위 판별 기능 없음","en":"Synthetic document · no security-feature or authenticity checking"};
const questions = [{"id":"clarify","q":{"ko":"자료와 기록의 차이를 설명해 주세요.","en":"Please explain the relationship between these records."}},{"id":"source","q":{"ko":"어느 자료를 확인하면 됩니까?","en":"Which evidence should we check?"},"answer":{"ko":"현재 접수된 제출 자료와 연결 기록을 함께 확인해 주세요.","en":"Please compare the submitted evidence with the linked record."}}];
const recordTitles = [{"ko":"현재 접수 기록","en":"Current submission"},{"ko":"관련 기록 · 대조 필요","en":"Related record · compare identifiers"}];
const taskDefinitions = [{"id":"identity","title":{"ko":"대상과 사건 식별자 대조","en":"Compare person and case identifiers"},"documentIndex":0},{"id":"evidence","title":{"ko":"연결 자료와 진술 대조","en":"Compare linked evidence and statement"},"documentIndex":1},{"id":"handover","title":{"ko":"미확인 사항과 다음 행동 기록","en":"Record unresolved facts and next action"},"documentIndex":1}];
export const ATLAS_SCENARIOS = exerciseData.map(({ evidence, reply, ...c }) => {
  const documents = evidence.map((page, i) => ({ id: c.id + '-DOC' + (i + 1), title: documentTitles[i], pages: i === 0 ? [page, syntheticNotice] : [page] }));
  return { ...c, ruleClass: 'SIMULATION_RULE', rulesetVersion: 'atlas-procedure-1', documents,
    questions: [...questions.map(q => ({ ...q, answer: q.answer || reply })), { id: 'crosscheck', ...followUps[c.id] }],
    records: evidence.map((detail, i) => ({ id: c.id + '-REC' + (i + 1), title: recordTitles[i], detail, documentId: documents[i].id })),
    tasks: taskDefinitions.map(({ id, title, documentIndex }) => ({ id, title, documentId: documents[documentIndex].id })) };
});
export function atlasScenarios(countryId) { return ATLAS_SCENARIOS.filter((c) => c.countryId === countryId); }
export function atlasScenario(countryId, id) { return ATLAS_SCENARIOS.find((c) => c.countryId === countryId && c.id === id) || null; }
