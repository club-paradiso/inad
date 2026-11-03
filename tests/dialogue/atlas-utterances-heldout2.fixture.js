// Second held-out set for overseas free-text questions (authored without seeing the matcher, its lexicon
// or the first fixture). Measure once; do not tune against it.
export const ATLAS_HELDOUT = [
  // SIM-CA-01
  { caseId: 'SIM-CA-01', questionId: 'clarify', ko: '이 기록들이 서로 어떻게 연결되는지 설명 좀 해 주실래요?', en: 'how do these records fit together' },
  { caseId: 'SIM-CA-01', questionId: 'source', ko: '어떤 자료부터 보면 될까요', en: 'okay, which piece of evidence should I be looking at?' },
  { caseId: 'SIM-CA-01', questionId: 'crosscheck', ko: '항공권 날짜랑 방문기록 날짜 중에 맞는 건 어느 쪽이에요?', en: 'ticket or visit record — which departure date is the right one?' },
  { caseId: 'SIM-CA-01', questionId: 'clarify_dates', ko: '출국 날짜가 왜 서로 다르게 나와 있죠?', en: 'why do the two departure dates not line up' },

  // SIM-CA-02
  { caseId: 'SIM-CA-02', questionId: 'clarify', ko: '네, 그럼 이 기록들 관계부터 설명해 주세요', en: 'can you walk me through how these records relate to each other?' },
  { caseId: 'SIM-CA-02', questionId: 'source', ko: '확인할 자료가 뭐예요?', en: 'what evidence do we check here' },
  { caseId: 'SIM-CA-02', questionId: 'crosscheck', ko: '체류 관련해서 실제로 낸 서류가 뭐였죠?', en: 'which papers did you actually hand in about your stay?' },
  { caseId: 'SIM-CA-02', questionId: 'ca02_return', ko: '귀국은 언제?', en: 'when do you fly back' },
  { caseId: 'SIM-CA-02', questionId: 'ca02_host', ko: '지내실 친구분 집 주소랑 전화번호 좀 알려주세요', en: "what's your friend's address and phone number, the one you're staying with?" },

  // SIM-CA-03
  { caseId: 'SIM-CA-03', questionId: 'clarify', ko: '이 기록들 사이에 무슨 관계가 있는지 말씀해 주시겠어요?', en: 'explain the link between these records for me' },
  { caseId: 'SIM-CA-03', questionId: 'source', ko: '어느자료 확인하면 돼요', en: 'so which evidence do we look at?' },
  { caseId: 'SIM-CA-03', questionId: 'crosscheck', ko: '지금 이분하고 예전 동명이인 기록의 문서 번호가 같나요?', en: 'do the document numbers for you and the same-name record actually match' },
  { caseId: 'SIM-CA-03', questionId: 'ca03_prior', ko: '캐나다 전에 와 보신 적 있어요?', en: 'ever been to canada before' },

  // SIM-CA-04
  { caseId: 'SIM-CA-04', questionId: 'ca04_purpose', ko: '무슨 일로 오셨어요?', en: 'reason for the trip?' },
  { caseId: 'SIM-CA-04', questionId: 'ca04_stay', ko: '체류 기간은요?', en: 'stay how long?' },
  { caseId: 'SIM-CA-04', questionId: 'ca04_booking', ko: '비행기표 예약은 누가 하셨어요?', en: 'who made the flight booking for you' },
  { caseId: 'SIM-CA-04', questionId: 'ca04_spelling', ko: '표에 적힌 영문 이름 철자가 여권이랑 왜 달라요?', en: "why doesn't the spelling of your name on the ticket match the passport?" },

  // SIM-CA-05
  { caseId: 'SIM-CA-05', questionId: 'ca05_purpose', ko: '네, 이번 방문은 어떤 목적이세요?', en: 'what are you here for' },
  { caseId: 'SIM-CA-05', questionId: 'ca05_prior', ko: '캐나다 방문은 처음이 아니신가요? 전에 오신 적 있어요?', en: 'have you come to canada before?' },
  { caseId: 'SIM-CA-05', questionId: 'ca05_eta', ko: 'eta 신청 언제 했어요', en: 'when did you put in the eTA application?' },
  { caseId: 'SIM-CA-05', questionId: 'ca05_renewal', ko: '이메일에 적힌 여권번호가 지금 여권이랑 다른 건 왜죠?', en: "the email shows a different passport number from the one you're holding — why?" },
  { caseId: 'SIM-CA-05', questionId: 'ca05_link', ko: '예전 여권하고 새 여권이 연결된다는 걸 보여 줄 서류 있으세요?', en: 'anything you can give me that links your old passport to the new one' },

  // SIM-CA-06
  { caseId: 'SIM-CA-06', questionId: 'ca06_purpose', ko: '이번엔 무슨 목적으로 오셨나요', en: 'so what brings you here this time?' },
  { caseId: 'SIM-CA-06', questionId: 'ca06_stay', ko: '며칠 계세요?', en: 'how many days are you here for' },
  { caseId: 'SIM-CA-06', questionId: 'ca06_company', ko: '직업이 어떻게 되세요?', en: "what's your job?" },
  { caseId: 'SIM-CA-06', questionId: 'ca06_registration', ko: '등록 확인서엔 출품사 부스 직원이라고 돼 있는데 이건 뭐예요?', en: 'your registration says booth staff for an exhibitor, what is that about' },

  // SIM-CA-07
  { caseId: 'SIM-CA-07', questionId: 'ca07_purpose', ko: '캐나다엔 어쩐 일로 오셨어요?', en: 'why are you coming to canada' },
  { caseId: 'SIM-CA-07', questionId: 'ca07_stay', ko: '돌아가는 날은 언제예요?', en: 'okay, and when do you head back home?' },
  { caseId: 'SIM-CA-07', questionId: 'ca07_letter', ko: '초청장 받은 게 언제였어요?', en: 'when did that invitation letter come to you' },
  { caseId: 'SIM-CA-07', questionId: 'ca07_address', ko: '초청장에 나온 주소에서 지내시는 거 맞아요?', en: 'are you going to stay at the address written on the invite?' },
  { caseId: 'SIM-CA-07', questionId: 'ca07_contact', ko: '지금 초청하신 분이랑 연락 닿을 수 있나요', en: 'can we reach your host right now' },

  // SIM-CA-08
  { caseId: 'SIM-CA-08', questionId: 'ca08_stay', ko: '얼마나있어요?', en: 'how long will you be in the country' },
  { caseId: 'SIM-CA-08', questionId: 'ca08_where', ko: '숙소는?', en: 'where are you going to stay?' },
  { caseId: 'SIM-CA-08', questionId: 'ca08_plans', ko: '여기 있는 동안 뭐 하실 거예요?', en: 'what are you planning to do while you are here' },
  { caseId: 'SIM-CA-08', questionId: 'ca08_reconcile', ko: '아까는 12월 20일 귀국이라더니 지금은 2월이라고 하시네요. 어느 게 맞아요?', en: 'earlier you told me december 20th, now you say february — which one is it?' },

  // SIM-CA-09
  { caseId: 'SIM-CA-09', questionId: 'ca09_purpose', ko: '방문하신 이유가 뭐예요', en: "what's the reason for your visit?" },
  { caseId: 'SIM-CA-09', questionId: 'ca09_stay', ko: '네, 체류는 며칠 예정이세요?', en: 'how long you staying' },
  { caseId: 'SIM-CA-09', questionId: 'ca09_where', ko: '어디서 지내세요?', en: 'where will you be put up during the trip?' },
  { caseId: 'SIM-CA-09', questionId: 'ca09_enclosure', ko: '안내문에 나온 좌석 확인서는 받으셨어요?', en: 'did the seat confirmation the notice mentions ever reach you' },

  // SIM-CA-10
  { caseId: 'SIM-CA-10', questionId: 'ca10_purpose', ko: '무슨 목적으로 오셨는지요', en: 'purpose of visit?' },
  { caseId: 'SIM-CA-10', questionId: 'ca10_hotel', ko: '어느 숙소에 묵으세요?', en: 'where are you staying while in town' },
  { caseId: 'SIM-CA-10', questionId: 'ca10_return', ko: '언제 출국하실 거예요?', en: "what's your return date?" },
  { caseId: 'SIM-CA-10', questionId: 'ca10_booking', ko: '호텔은 어떤 식으로 예약하셨어요?', en: 'how did you go about booking the hotel' },

  // SIM-CA-11
  { caseId: 'SIM-CA-11', questionId: 'ca11_purpose', ko: '여행 목적 말씀해 주세요', en: 'what brings you over?' },
  { caseId: 'SIM-CA-11', questionId: 'ca11_prior', ko: '전에도 캐나다 오신 적 있으세요', en: 'is this your first visit to canada or have you been before?' },
  { caseId: 'SIM-CA-11', questionId: 'ca11_booking', ko: '항공편은 누가 잡아줬어요?', en: 'who booked the flight' },
  { caseId: 'SIM-CA-11', questionId: 'ca11_dob', ko: '여권 생년월일이랑 예약확인서 생년월일이 다른데 뭐가 맞아요?', en: 'your date of birth on the booking is different from the passport, which is right?' },
  { caseId: 'SIM-CA-11', questionId: 'ca11_2025', ko: '작년 3월에 오셨을 때는 무슨 여권 쓰셨어요?', en: 'last march when you came, what passport did you travel on' },

  // SIM-CA-12
  { caseId: 'SIM-CA-12', questionId: 'ca12_itinerary', ko: '일정 쭉 한번 설명해 주실래요?', en: 'take me through your travel plan day by day' },
  { caseId: 'SIM-CA-12', questionId: 'ca12_return', ko: '귀국일이 언제예요', en: 'when are you flying home?' },
  { caseId: 'SIM-CA-12', questionId: 'ca12_dates', ko: '바우처엔 투어가 14일 시작인데 17일에 도착하셨네요? 어떻게 된 거예요', en: 'the voucher says the tour starts on the 14th but you got here on the 17th, how come?' },
  { caseId: 'SIM-CA-12', questionId: 'ca12_phone', ko: '새로 받은 바우처 지금 보여 주실 수 있어요?', en: 'can you pull up the new voucher for me now' },

  // SIM-GB-01
  { caseId: 'SIM-GB-01', questionId: 'clarify', ko: '기록들끼리 어떤 관계인지 설명해주세요', en: 'tell me how these records are related' },
  { caseId: 'SIM-GB-01', questionId: 'source', ko: '어떤 증거 자료를 보면 되나요?', en: 'which evidence do I need to check?' },
  { caseId: 'SIM-GB-01', questionId: 'crosscheck', ko: '인계 메모에 있는 일정표, 앞 창구에 내셨어요?', en: 'the itinerary in the handover note — did you give that to the last desk' },
  { caseId: 'SIM-GB-01', questionId: 'gb01_itinerary_contents', ko: '일정표에 뭐가 적혀 있어요?', en: "what's in your itinerary?" },

  // SIM-GB-02
  { caseId: 'SIM-GB-02', questionId: 'clarify', ko: '네 그럼, 이 기록들 서로 무슨 관계예요?', en: 'okay, how are these records connected?' },
  { caseId: 'SIM-GB-02', questionId: 'source', ko: '어느 자료를 확인해야 해요', en: 'what evidence should we be checking' },
  { caseId: 'SIM-GB-02', questionId: 'crosscheck', ko: '초대장 행사 날짜하고 말씀하신 체류 기간이 어떻게 차이 나요?', en: "the event dates on the invite vs the length of stay you told me — what's the difference?" },
  { caseId: 'SIM-GB-02', questionId: 'gb02_remaining_days', ko: '행사 끝나고 남은 기간엔 뭐 하실 거예요?', en: 'what will you do once the event is over' },

  // SIM-GB-03
  { caseId: 'SIM-GB-03', questionId: 'clarify', ko: '이 기록들 관계를 좀 설명해 주시겠어요', en: 'could you explain how these records relate?' },
  { caseId: 'SIM-GB-03', questionId: 'source', ko: '확인할 증거가 어떤 건가요?', en: 'which evidence are we meant to check' },
  { caseId: 'SIM-GB-03', questionId: 'crosscheck', ko: '오늘 제출한 서류에 참조번호 뭐라고 돼있어요?', en: "what reference number is on the paper you handed in today?" },
  { caseId: 'SIM-GB-03', questionId: 'gb03_why_again', ko: '똑같은 서류를 왜 또 내셨어요?', en: 'why did you send in the same document a second time' },

  // SIM-GB-04
  { caseId: 'SIM-GB-04', questionId: 'gb04_purpose', ko: '무슨 일로 오셨고 얼마나 계세요?', en: 'why are you here and for how long' },
  { caseId: 'SIM-GB-04', questionId: 'gb04_return', ko: '돌아가는 표 같은 거 보여줄 수 있는 게 있어요?', en: 'got anything that proves your return trip?' },
  { caseId: 'SIM-GB-04', questionId: 'gb04_stay', ko: '숙소 어디예요', en: 'where are you staying' },
  { caseId: 'SIM-GB-04', questionId: 'gb04_form_ref', ko: '양식에 예약번호를 어떻게 기입하셨어요?', en: 'how did you write the booking reference on the form?' },

  // SIM-GB-05
  { caseId: 'SIM-GB-05', questionId: 'gb05_purpose', ko: '네, 방문 목적이 어떻게 되시죠', en: 'what are you visiting for' },
  { caseId: 'SIM-GB-05', questionId: 'gb05_stay', ko: '체류 기간?', en: 'how long are you in the uk for?' },
  { caseId: 'SIM-GB-05', questionId: 'gb05_payment', ko: '발표하고 돈 받으세요?', en: 'do you get paid for giving the talk' },
  { caseId: 'SIM-GB-05', questionId: 'gb05_programme', ko: '프로그램에 26일 기조연설자로 나와 있던데 주최측이랑 어떻게 얘기된 거예요?', en: "you're on the programme for the keynote on the 26th — what was agreed with the organisers?" },
  { caseId: 'SIM-GB-05', questionId: 'gb05_email', ko: '주최측이 강연료 받을 계좌 달라고 메일 보냈던데 답장하셨어요?', en: 'the organiser emailed asking for your bank details for the fee, did you answer it' },

  // SIM-GB-06
  { caseId: 'SIM-GB-06', questionId: 'gb06_purpose', ko: '방문 목적이랑 기간 말씀해 주세요', en: 'why are you visiting and how long for?' },
  { caseId: 'SIM-GB-06', questionId: 'gb06_authorisation', ko: '여행허가 신청은 어떻게 하셨어요', en: 'how did you go about getting your travel authorisation' },
  { caseId: 'SIM-GB-06', questionId: 'gb06_passport', ko: '이 여권 발급일이 언제고, 다른 여권도 가지고 계세요?', en: 'when was this passport issued, and do you have another one?' },
  { caseId: 'SIM-GB-06', questionId: 'gb06_entry', ko: '신청할 때 여권번호 어떻게 입력했어요?', en: 'when you applied, how did you type in your passport number' },

  // SIM-GB-07
  { caseId: 'SIM-GB-07', questionId: 'gb07_purpose', ko: '누구 만나러 오셨어요?', en: 'who are you here to see?' },
  { caseId: 'SIM-GB-07', questionId: 'gb07_stay', ko: '얼마 동안 계세요', en: 'how long is the stay' },
  { caseId: 'SIM-GB-07', questionId: 'gb07_previous', ko: '전에 영국 와보신 적 있어요?', en: 'been to the uk before?' },
  { caseId: 'SIM-GB-07', questionId: 'gb07_address', ko: '초청하신 분 주소가 지난번 방문 때랑 다르네요. 왜 그런 거예요?', en: "your host's address has changed since the last visit, what happened there" },

  // SIM-GB-08
  { caseId: 'SIM-GB-08', questionId: 'gb08_purpose', ko: '오신 목적하고 일정 좀 알려주세요', en: "what's the purpose of the trip and what's the plan?" },
  { caseId: 'SIM-GB-08', questionId: 'gb08_previous', ko: '영국은 처음이세요 아니면 전에 오셨어요?', en: 'have you visited the uk before' },
  { caseId: 'SIM-GB-08', questionId: 'gb08_stay', ko: '어디서 묵으세요?', en: 'where will you stay?' },
  { caseId: 'SIM-GB-08', questionId: 'gb08_passport', ko: '이 여권 이전에 쓰던 다른 여권 있어요?', en: 'did you have a different passport before this one' },

  // SIM-GB-09
  { caseId: 'SIM-GB-09', questionId: 'gb09_purpose', ko: '방문 목적이 뭔가요', en: 'what is the reason you are here?' },
  { caseId: 'SIM-GB-09', questionId: 'gb09_length', ko: '얼마나 머물 예정이에요?', en: 'how long will you be staying' },
  { caseId: 'SIM-GB-09', questionId: 'gb09_fees', ko: '학비랑 생활비는 어떻게 대세요?', en: "so who's covering the course fees and your living costs?" },
  { caseId: 'SIM-GB-09', questionId: 'gb09_after', ko: '과정이 12월 4일에 끝나는데 그 다음엔 뭐 하세요?', en: 'your course finishes on 4 december, what happens after that' },

  // SIM-GB-10
  { caseId: 'SIM-GB-10', questionId: 'gb10_purpose', ko: '무슨 목적으로 오셨어요', en: 'reason for visiting?' },
  { caseId: 'SIM-GB-10', questionId: 'gb10_funds', ko: '여행 경비는 어떻게 마련했어요?', en: "who's paying for this trip" },
  { caseId: 'SIM-GB-10', questionId: 'gb10_return', ko: '언제 귀국해요?', en: 'when are you going home?' },
  { caseId: 'SIM-GB-10', questionId: 'gb10_company', ko: '처음엔 회사가 낸다고 하셨는데 고용주 편지엔 회사 지원 없다고 돼 있어요', en: 'you said the company pays, but your employer letter says they are not funding the trip' },
  { caseId: 'SIM-GB-10', questionId: 'gb10_flights', ko: '비행기표 결제는 어떻게 했어요?', en: 'how did you pay for the flights' },

  // SIM-GB-11
  { caseId: 'SIM-GB-11', questionId: 'gb11_purpose', ko: '오신 목적은요?', en: 'what is your visit for' },
  { caseId: 'SIM-GB-11', questionId: 'gb11_plan', ko: '네, 그럼 일정 쭉 말씀해 주세요', en: 'okay, next — run me through your plans' },
  { caseId: 'SIM-GB-11', questionId: 'gb11_edinburgh', ko: '에든버러에선 어디서 자요?', en: 'where are you staying in edinburgh?' },
  { caseId: 'SIM-GB-11', questionId: 'gb11_funds', ko: '여행비는 어떻게 충당하세요', en: 'how are you funding the trip' },
  { caseId: 'SIM-GB-11', questionId: 'gb11_london', ko: '양식에 쓴 런던 호텔 예약이 취소된 걸로 나오는데요', en: 'the london hotel on your form comes up as cancelled' },

  // SIM-GB-12
  { caseId: 'SIM-GB-12', questionId: 'gb12_purpose', ko: '방문목적 말씀해주세요', en: 'what brings you to the uk?' },
  { caseId: 'SIM-GB-12', questionId: 'gb12_costs', ko: '출장비하고 월급은 누가 내요?', en: 'who covers the trip costs and pays your salary' },
  { caseId: 'SIM-GB-12', questionId: 'gb12_previous', ko: '예전에 오신 적 있으세요?', en: 'have you been here before on a previous trip?' },
  { caseId: 'SIM-GB-12', questionId: 'gb12_letters', ko: '방문처 편지엔 18일까지 프로젝트팀에 배치된다고 쓰여 있네요', en: "the host company's letter says you're placed with a project team until the 18th" },
  { caseId: 'SIM-GB-12', questionId: 'gb12_original', ko: '11월 2일에 귀국편을 19일에서 12일로 당기셨던데 왜 바꿨어요?', en: 'on 2 november your return got moved from the 19th to the 12th, why did you change it' },

  // SIM-NZ-01
  { caseId: 'SIM-NZ-01', questionId: 'clarify', ko: '기록들 사이 관계 설명 부탁드려요', en: 'please explain how these records relate to one another' },
  { caseId: 'SIM-NZ-01', questionId: 'source', ko: '어느 자료 봐야 돼요?', en: 'which evidence do we check' },
  { caseId: 'SIM-NZ-01', questionId: 'crosscheck', ko: '첨부 표지 번호가 지금 신청번호랑 같아요?', en: 'is the number on the attachment cover the same as the current application number?' },
  { caseId: 'SIM-NZ-01', questionId: 'nz01_letter', ko: '신청서에 어떤 추천서 같이 내셨어요?', en: 'what reference letter went in with your application' },

  // SIM-NZ-02
  { caseId: 'SIM-NZ-02', questionId: 'clarify', ko: '이 기록들은 서로 어떤 관계죠', en: 'explain the relationship between these records please' },
  { caseId: 'SIM-NZ-02', questionId: 'source', ko: '확인해야 할 자료 어느 거예요?', en: 'which evidence should I check?' },
  { caseId: 'SIM-NZ-02', questionId: 'crosscheck', ko: '접수확인에 체류계획 몇 페이지가 빠졌어요?', en: 'what page of the stay plan is missing from the receipt' },
  { caseId: 'SIM-NZ-02', questionId: 'nz02_missing_page', ko: '빠진 체류 계획 2쪽엔 뭐가 적혀 있었어요?', en: 'what was on page 2 of the stay plan, the one that went missing?' },

  // SIM-NZ-03
  { caseId: 'SIM-NZ-03', questionId: 'clarify', ko: '네, 이 기록들 관계부터 짚어 주시겠어요?', en: 'how do these records relate' },
  { caseId: 'SIM-NZ-03', questionId: 'source', ko: '어떤 자료를 확인하면 될까요', en: 'what evidence should we check first?' },
  { caseId: 'SIM-NZ-03', questionId: 'crosscheck', ko: '자료확인 활동이랑 후속 메모에 공통으로 나오는 참조번호가 뭐예요?', en: 'which reference numbers show up in both the evidence activity and the follow-up note' },
  { caseId: 'SIM-NZ-03', questionId: 'nz03_since', ko: '활동 끝난 다음에 새로 보낸 자료 있으세요?', en: 'have you sent in anything new after the activity was closed?' },

  // SIM-NZ-04
  { caseId: 'SIM-NZ-04', questionId: 'nz04_purpose', ko: '이번 방문 일정이 어떻게 되세요?', en: 'tell me about your plans for this trip' },
  { caseId: 'SIM-NZ-04', questionId: 'nz04_email', ko: 'nzeta 승인메일 언제 받았어요', en: 'when did the nzeta approval email come through?' },
  { caseId: 'SIM-NZ-04', questionId: 'nz04_applied', ko: 'NZeTA 신청할 때 무슨 여권 썼어요? 다른 여권도 있어요?', en: 'which passport was the nzeta applied on, and do you have another passport' },
  { caseId: 'SIM-NZ-04', questionId: 'nz04_return', ko: '돌아가는 비행기 언제예요?', en: 'when is your flight home?' },

  // SIM-NZ-05
  { caseId: 'SIM-NZ-05', questionId: 'nz05_letter', ko: '가장 최근에 보내신 서류가 뭐예요?', en: 'what was the last thing you sent us' },
  { caseId: 'SIM-NZ-05', questionId: 'nz05_role', ko: '신청서에 쓴 직무 설명해 주세요', en: 'describe the job you put on your application?' },
  { caseId: 'SIM-NZ-05', questionId: 'nz05_change', ko: '신청하고 나서 고용주가 바뀐 건 어떻게 된 거예요?', en: 'how did your employer end up changing after you applied' },
  { caseId: 'SIM-NZ-05', questionId: 'nz05_start', ko: '새 일은 언제부터 시작해요?', en: 'when do you start the new job?' },

  // SIM-NZ-06
  { caseId: 'SIM-NZ-06', questionId: 'nz06_host', ko: '초청한 분이랑 무슨 사이예요?', en: "what's your relationship with the person hosting you" },
  { caseId: 'SIM-NZ-06', questionId: 'nz06_plans', ko: '여기 계시는 동안 뭐 하실 계획이에요', en: 'what do you plan to do while in new zealand?' },
  { caseId: 'SIM-NZ-06', questionId: 'nz06_address', ko: '신청서 주소랑 편지 주소가 왜 달라요?', en: 'why is the address on your application not the same as on the letter' },
  { caseId: 'SIM-NZ-06', questionId: 'nz06_contact', ko: '초청인한테 연락할 수 있는 방법 있어요?', en: 'any way we can get in touch with your host?' },

  // SIM-NZ-07
  { caseId: 'SIM-NZ-07', questionId: 'nz07_tour', ko: '투어 일정 간단하게 알려주세요', en: 'give me a quick rundown of the tour' },
  { caseId: 'SIM-NZ-07', questionId: 'nz07_return', ko: '뉴질랜드에서 언제 나가세요?', en: 'when do you leave the country' },
  { caseId: 'SIM-NZ-07', questionId: 'nz07_after', ko: '투어 끝나고 12월 20일까진 어디 계실 거예요?', en: 'after the tour ends, where are you until 20 december?' },
  { caseId: 'SIM-NZ-07', questionId: 'nz07_friend', ko: '퀸스타운 친구 주소 아세요?', en: "do you have your friend's address in queenstown" },

  // SIM-NZ-08
  { caseId: 'SIM-NZ-08', questionId: 'nz08_funds', ko: '신고한 자금은 어디에 보관돼 있어요?', en: 'where is the money you declared being held?' },
  { caseId: 'SIM-NZ-08', questionId: 'nz08_upload', ko: '명세서 제출은 어떤 방법으로 했어요', en: 'how did you send in the statement' },
  { caseId: 'SIM-NZ-08', questionId: 'nz08_page2', ko: '명세서 두번째 장에 뭐 있어요?', en: "what's on the second page of the statement?" },
  { caseId: 'SIM-NZ-08', questionId: 'nz08_plans', ko: '도착하고 나서 계획은요?', en: 'what are you going to do once you arrive' },

  // SIM-NZ-09
  { caseId: 'SIM-NZ-09', questionId: 'nz09_purpose', ko: '어떤 목적으로 방문하셨어요?', en: 'why are you visiting?' },
  { caseId: 'SIM-NZ-09', questionId: 'nz09_declared', ko: '현금 신고는 왜 하신 거예요', en: 'what made you declare the cash' },
  { caseId: 'SIM-NZ-09', questionId: 'nz09_gift', ko: '그 현금은 뭐에 쓰실 돈이에요?', en: 'what is that cash going to be used for?' },
  { caseId: 'SIM-NZ-09', questionId: 'nz09_stay', ko: '어디서 머무르세요', en: 'where are you staying' },
  { caseId: 'SIM-NZ-09', questionId: 'nz09_onward', ko: '결혼식 끝나고는 어떻게 하실 거예요?', en: "what's next after the wedding" },

  // SIM-NZ-10
  { caseId: 'SIM-NZ-10', questionId: 'nz10_purpose', ko: '방문 목적이요?', en: 'what is the purpose of this trip' },
  { caseId: 'SIM-NZ-10', questionId: 'nz10_work', ko: '지금 무슨 일 하세요?', en: 'what do you do for a living?' },
  { caseId: 'SIM-NZ-10', questionId: 'nz10_previous', ko: '전에 뉴질랜드 비자나 NZeTA 신청해 본 적 있어요? 다른 이름 쓴 적은요?', en: 'ever applied for a nz visa or nzeta before, or gone by another name' },
  { caseId: 'SIM-NZ-10', questionId: 'nz10_return', ko: '귀국 언제 하세요', en: 'when are you heading back?' },

  // SIM-NZ-11
  { caseId: 'SIM-NZ-11', questionId: 'nz11_conf', ko: '학회 일정 좀 말씀해 주세요', en: 'tell me about the conference schedule' },
  { caseId: 'SIM-NZ-11', questionId: 'nz11_before', ko: '학회 시작 전 며칠 동안은 뭐 하세요?', en: 'what are you doing in the days before the conference starts?' },
  { caseId: 'SIM-NZ-11', questionId: 'nz11_spelling', ko: '학회 등록 어떻게 했어요', en: 'how did you sign up for the conference' },
  { caseId: 'SIM-NZ-11', questionId: 'nz11_after', ko: '호텔 체크아웃하고 출국 전까지는 어디서 지내요?', en: 'between checking out of the hotel and your flight out, where will you stay?' },
  { caseId: 'SIM-NZ-11', questionId: 'nz11_return', ko: '귀국편 확정됐어요?', en: 'is your flight home confirmed' },

  // SIM-NZ-12
  { caseId: 'SIM-NZ-12', questionId: 'nz12_sponsor', ko: '후원해 주시는 분이랑 어떤 관계세요?', en: 'how are you related to your sponsor?' },
  { caseId: 'SIM-NZ-12', questionId: 'nz12_stay', ko: '방문하는 동안 숙소는 어디예요', en: 'where will you be staying during the visit' },
  { caseId: 'SIM-NZ-12', questionId: 'nz12_signed', ko: '후원 신고서 서명 날짜가 언제예요?', en: 'when did the sponsor sign the declaration?' },
  { caseId: 'SIM-NZ-12', questionId: 'nz12_arrival', ko: '도착일이 언제죠', en: 'what date do you arrive' },
];

export const ATLAS_HELDOUT_NEGATIVES = [
  'good afternoon',
  '좋은 저녁입니다',
  'good morning sir',
  '안녕하세요 반갑습니다',
  'good evening',
  '좋은 아침이에요',
  'thank you very much',
  '감사합니다',
  'thanks for waiting',
  '기다려 주셔서 고맙습니다',
  'sorry about the wait',
  '죄송합니다 잠시만요',
  'nice weather today huh',
  '오늘 날씨 좋네요',
  'busy day today',
  '비행 힘드셨죠?',
  'open the second document',
  '두 번째 서류 열어',
  '다음 승객',
  'next passenger please',
  'close this panel',
  '메모 저장해',
  'can I see your passport?',
  '여권 보여 주세요',
  'first time here?',
  '처음 오셨어요?',
  'have you been here before?',
  'anything to declare?',
  'look at the camera please',
  '카메라 봐 주세요',
  '지문 찍어 주세요',
  'please remove your hat',
  'one moment please',
  '잠깐만 기다려 주세요',
  'asdfgh jkl',
  'ㅁㄴㅇㄹ ㅋㅋㅋ',
  'qwerty zzz',
  '?????',
  'blah blah testing 123',
  '뷁뷁 아아아',
];
