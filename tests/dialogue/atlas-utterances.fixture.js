// Held-out paraphrases for overseas free-text questions (authored without seeing the matcher).
export const ATLAS_UTTERANCES = [
  // ── Canada ──
  { caseId: 'SIM-CA-01', questionId: 'clarify', ko: '이 두 기록이 서로 어떤 관계인지 말해 주세요', en: 'how do these two records relate to each other?' },
  { caseId: 'SIM-CA-01', questionId: 'source', ko: '어떤 서류를 보면 되나요', en: 'what should I be looking at to check this' },
  { caseId: 'SIM-CA-01', questionId: 'crosscheck', ko: '항공권 날짜랑 방문 기록 날짜 중에 뭐가 맞아요?', en: 'ticket or visit record, which departure date is the right one' },
  { caseId: 'SIM-CA-01', questionId: 'clarify_dates', ko: '출국 날짜가 왜 서로 다르게 적혀 있죠?', en: 'why are the two departure dates not the same?' },

  { caseId: 'SIM-CA-02', questionId: 'clarify', ko: '제출 자료랑 기록이 어떻게 연결되는지 설명해 주세요', en: 'can you explain how the submission and the record fit together' },
  { caseId: 'SIM-CA-02', questionId: 'source', ko: '확인하려면 어느 서류를 봐야 합니까', en: 'which document do I need to check?' },
  { caseId: 'SIM-CA-02', questionId: 'crosscheck', ko: '숙박 관련해서 실제로 낸 서류가 뭐예요?', en: 'what did you actually hand in for your accommodation?' },
  { caseId: 'SIM-CA-02', questionId: 'ca02_return', ko: '귀국 날짜가 언제예요?', en: 'what date do you fly home' },
  { caseId: 'SIM-CA-02', questionId: 'ca02_host', ko: '친구 집 주소랑 전화번호 좀 알려주세요', en: "what's your friend's address and phone number" },

  { caseId: 'SIM-CA-03', questionId: 'clarify', ko: '이 자료하고 기록 사이 관계를 설명해 보세요', en: 'explain how this record relates to your submission' },
  { caseId: 'SIM-CA-03', questionId: 'source', ko: '어떤 자료로 확인하면 될까요', en: 'which evidence do we look at here' },
  { caseId: 'SIM-CA-03', questionId: 'crosscheck', ko: '동명이인 기록의 문서 번호가 본인 것과 같나요?', en: 'is the document number on the same-name record the same as yours' },
  { caseId: 'SIM-CA-03', questionId: 'ca03_prior', ko: '캐나다 와 본 적 있으세요?', en: 'been to canada before?' },

  { caseId: 'SIM-CA-04', questionId: 'ca04_purpose', ko: '무슨 일로 오셨어요', en: 'what are you here for?' },
  { caseId: 'SIM-CA-04', questionId: 'ca04_stay', ko: '체류 기간이 어떻게 되나요', en: 'how many days will you be here' },
  { caseId: 'SIM-CA-04', questionId: 'ca04_booking', ko: '비행기표는 누가 끊었어요?', en: 'who made the flight booking' },
  { caseId: 'SIM-CA-04', questionId: 'ca04_spelling', ko: '티켓 이름 철자가 여권이랑 왜 달라요?', en: "why doesn't the ticket name match the spelling in your passport" },

  { caseId: 'SIM-CA-05', questionId: 'ca05_purpose', ko: '방문하시는 이유가 뭔가요', en: "what's the reason for your trip" },
  { caseId: 'SIM-CA-05', questionId: 'ca05_prior', ko: '전에 캐나다 오신 적 있어요?', en: 'have you been in canada before this trip?' },
  { caseId: 'SIM-CA-05', questionId: 'ca05_eta', ko: 'eTA 신청한 게 언제예요?', en: 'when did you put in the eta application' },
  { caseId: 'SIM-CA-05', questionId: 'ca05_renewal', ko: '이메일에 나온 여권번호랑 지금 여권 번호가 왜 다르죠', en: "why isn't the passport number in the confirmation email the same as this passport?" },
  { caseId: 'SIM-CA-05', questionId: 'ca05_link', ko: '예전 여권하고 새 여권이 연결된다는 걸 보여줄 서류 낼 수 있어요?', en: 'can you give us anything linking your old passport to the new one' },

  { caseId: 'SIM-CA-06', questionId: 'ca06_purpose', ko: '이번에 무슨 목적으로 오셨나요', en: 'why are you visiting this time?' },
  { caseId: 'SIM-CA-06', questionId: 'ca06_stay', ko: '며칠 있다 가세요?', en: 'how long will you be in canada' },
  { caseId: 'SIM-CA-06', questionId: 'ca06_company', ko: '직업이 뭐예요', en: 'what is your job' },
  { caseId: 'SIM-CA-06', questionId: 'ca06_registration', ko: '등록증에 부스 직원으로 나와 있는데 왜 그렇죠?', en: 'why does your fair registration say exhibitor booth staff' },

  { caseId: 'SIM-CA-07', questionId: 'ca07_purpose', ko: '캐나다엔 무슨 일로 오셨어요', en: 'what is the purpose of this trip' },
  { caseId: 'SIM-CA-07', questionId: 'ca07_stay', ko: '귀국은 언제 하세요?', en: 'when do you fly back' },
  { caseId: 'SIM-CA-07', questionId: 'ca07_letter', ko: '초대장 받은 게 언제예요', en: 'when did you get the invitation letter' },
  { caseId: 'SIM-CA-07', questionId: 'ca07_address', ko: '초대장에 나온 그 주소에서 지낼 건가요?', en: 'are you staying at the address in the invitation?' },
  { caseId: 'SIM-CA-07', questionId: 'ca07_contact', ko: '지금 초청인한테 연락 가능해요?', en: 'can we reach your host right now' },

  { caseId: 'SIM-CA-08', questionId: 'ca08_stay', ko: '체류 기간 얼마나 돼요?', en: 'how long is your stay' },
  { caseId: 'SIM-CA-08', questionId: 'ca08_where', ko: '어디서 지내세요', en: 'where are you going to stay?' },
  { caseId: 'SIM-CA-08', questionId: 'ca08_plans', ko: '여기 있는 동안 뭐 하실 거예요?', en: 'what will you do while you are here' },
  { caseId: 'SIM-CA-08', questionId: 'ca08_reconcile', ko: '12월 20일이라고 했다가 2월이라고 했는데 실제 계획은 뭐예요?', en: 'you said 20 december first and now february, so which one is it' },

  { caseId: 'SIM-CA-09', questionId: 'ca09_purpose', ko: '무슨 일로 방문하셨어요', en: 'reason for your visit?' },
  { caseId: 'SIM-CA-09', questionId: 'ca09_stay', ko: '얼마 동안 계실 건가요', en: 'how long are you here for' },
  { caseId: 'SIM-CA-09', questionId: 'ca09_where', ko: '숙소는 어디예요?', en: 'where will you be staying while here' },
  { caseId: 'SIM-CA-09', questionId: 'ca09_enclosure', ko: '안내문에 나온 좌석 확인서 받으셨나요', en: 'did you get the seating confirmation the notice mentions?' },

  { caseId: 'SIM-CA-10', questionId: 'ca10_purpose', ko: '여행 목적이 뭔가요', en: 'what brings you to canada' },
  { caseId: 'SIM-CA-10', questionId: 'ca10_hotel', ko: '숙소 어디로 잡으셨어요', en: 'where are you putting up while in toronto' },
  { caseId: 'SIM-CA-10', questionId: 'ca10_return', ko: '언제 귀국하세요?', en: 'what day do you go home?' },
  { caseId: 'SIM-CA-10', questionId: 'ca10_booking', ko: '호텔은 어떤 식으로 예약했어요?', en: 'how was the hotel booked' },

  { caseId: 'SIM-CA-11', questionId: 'ca11_purpose', ko: '방문 목적 말씀해 주세요', en: 'what is the reason for the visit' },
  { caseId: 'SIM-CA-11', questionId: 'ca11_prior', ko: '예전에 캐나다 온 적 있습니까', en: 'is this your first time in canada?' },
  { caseId: 'SIM-CA-11', questionId: 'ca11_booking', ko: '항공권 예약 누가 했어요?', en: 'who booked the flights' },
  { caseId: 'SIM-CA-11', questionId: 'ca11_dob', ko: '여권이랑 예약서 생일이 다른데 어떤 게 맞아요?', en: 'the date of birth on your passport and booking differ, which is right' },
  { caseId: 'SIM-CA-11', questionId: 'ca11_2025', ko: '작년 3월에 왔을 때 무슨 여권 썼어요?', en: 'what passport did you travel on last march' },

  { caseId: 'SIM-CA-12', questionId: 'ca12_itinerary', ko: '여행 일정 좀 설명해 주세요', en: 'take me through your travel plans' },
  { caseId: 'SIM-CA-12', questionId: 'ca12_return', ko: '귀국일이 언제죠', en: 'when is your flight home?' },
  { caseId: 'SIM-CA-12', questionId: 'ca12_dates', ko: '바우처엔 투어가 14일 시작인데 17일에 도착하셨잖아요, 어떻게 된 거예요?', en: 'voucher says the tour starts on the 14th but you landed on the 17th, why' },
  { caseId: 'SIM-CA-12', questionId: 'ca12_phone', ko: '바뀐 바우처 지금 보여줄 수 있어요?', en: 'can you pull up the updated voucher for me now' },

  // ── United Kingdom ──
  { caseId: 'SIM-GB-01', questionId: 'clarify', ko: '이 자료들이 서로 어떤 관계인지 설명 부탁드려요', en: 'please explain how these records link up' },
  { caseId: 'SIM-GB-01', questionId: 'source', ko: '어느 서류 확인하면 돼요', en: 'which evidence am I supposed to check' },
  { caseId: 'SIM-GB-01', questionId: 'crosscheck', ko: '인계 메모에 있는 일정표, 전 창구에 냈어요?', en: 'did you give the previous desk the itinerary from the handover note?' },
  { caseId: 'SIM-GB-01', questionId: 'gb01_itinerary_contents', ko: '일정표에 뭐가 적혀 있어요?', en: "what's in your itinerary" },

  { caseId: 'SIM-GB-02', questionId: 'clarify', ko: '자료랑 기록이 왜 다른지 설명해 주세요', en: 'can you explain the relationship between the documents and the record' },
  { caseId: 'SIM-GB-02', questionId: 'source', ko: '어떤 증거를 봐야 하나요', en: 'what evidence should be checked' },
  { caseId: 'SIM-GB-02', questionId: 'crosscheck', ko: '초대장 행사 날짜랑 말한 체류 기간이 어떻게 차이 나요?', en: 'how do the dates on the invitation compare with the length of visit you told us' },
  { caseId: 'SIM-GB-02', questionId: 'gb02_remaining_days', ko: '행사 끝나고 나머지 기간엔 뭐 해요?', en: 'what will you do once the event is over?' },

  { caseId: 'SIM-GB-03', questionId: 'clarify', ko: '이 자료와 기록의 관계를 설명해 주시겠어요', en: 'how does this document relate to the earlier record' },
  { caseId: 'SIM-GB-03', questionId: 'source', ko: '어떤 자료를 확인해야 되죠', en: 'which documents do we compare' },
  { caseId: 'SIM-GB-03', questionId: 'crosscheck', ko: '오늘 낸 서류에 참조번호 뭐라고 돼 있어요?', en: 'what reference number is on the paper you gave in today' },
  { caseId: 'SIM-GB-03', questionId: 'gb03_why_again', ko: '같은 서류를 왜 또 냈어요?', en: 'why did you hand in the same document a second time?' },

  { caseId: 'SIM-GB-04', questionId: 'gb04_purpose', ko: '왜 오셨고 얼마나 있을 거예요?', en: 'reason for the trip and how long?' },
  { caseId: 'SIM-GB-04', questionId: 'gb04_return', ko: '돌아가는 일정 확인되는 서류 있어요?', en: 'have you got anything that shows your return trip' },
  { caseId: 'SIM-GB-04', questionId: 'gb04_stay', ko: '숙소는 어디세요', en: 'where will you stay?' },
  { caseId: 'SIM-GB-04', questionId: 'gb04_form_ref', ko: '양식에 예약번호 어떻게 써 넣었어요?', en: 'how did you write the booking reference on the form' },

  { caseId: 'SIM-GB-05', questionId: 'gb05_purpose', ko: '어떤 목적으로 방문하셨어요', en: "what's the purpose of your trip" },
  { caseId: 'SIM-GB-05', questionId: 'gb05_stay', ko: '며칠 머물러요?', en: 'how long are you in the uk for' },
  { caseId: 'SIM-GB-05', questionId: 'gb05_payment', ko: '강연하고 돈 받으세요?', en: 'do you get paid for giving the talk?' },
  { caseId: 'SIM-GB-05', questionId: 'gb05_programme', ko: '프로그램엔 26일 기조연설로 나와 있는데 주최 측이랑 뭐라고 정했어요?', en: "the programme has you down for the keynote on the 26th, what's been agreed with the organisers" },
  { caseId: 'SIM-GB-05', questionId: 'gb05_email', ko: '주최 측이 강연료 계좌 달라고 한 메일에 답장했어요?', en: 'did you answer the organiser email asking for your bank details for the fee' },

  { caseId: 'SIM-GB-06', questionId: 'gb06_purpose', ko: '방문 이유랑 기간 알려 주세요', en: 'why are you here and for how long' },
  { caseId: 'SIM-GB-06', questionId: 'gb06_authorisation', ko: '여행 허가 신청은 어떻게 했어요?', en: 'how did you get your travel authorisation' },
  { caseId: 'SIM-GB-06', questionId: 'gb06_passport', ko: '이 여권 언제 나온 거예요? 다른 여권도 있어요?', en: 'when was this passport issued, and do you have another one?' },
  { caseId: 'SIM-GB-06', questionId: 'gb06_entry', ko: '신청할 때 여권번호는 어떻게 넣었어요', en: 'how did you type in your passport number on the application' },

  { caseId: 'SIM-GB-07', questionId: 'gb07_purpose', ko: '누구 만나러 오셨어요?', en: 'who have you come to see' },
  { caseId: 'SIM-GB-07', questionId: 'gb07_stay', ko: '얼마나 계실 거예요', en: 'how long will you be staying?' },
  { caseId: 'SIM-GB-07', questionId: 'gb07_previous', ko: '영국 전에 와 본 적 있어요?', en: 'have you been to the uk before' },
  { caseId: 'SIM-GB-07', questionId: 'gb07_address', ko: '초청인 주소가 지난번 방문 때랑 다른데 왜 그래요?', en: "why is your host's address not the same as on your last visit" },

  { caseId: 'SIM-GB-08', questionId: 'gb08_purpose', ko: '방문 목적이랑 일정 말씀해 주세요', en: "what's the purpose of the trip and your schedule?" },
  { caseId: 'SIM-GB-08', questionId: 'gb08_previous', ko: '영국 와 보신 적 있어요?', en: 'ever visited the uk before?' },
  { caseId: 'SIM-GB-08', questionId: 'gb08_stay', ko: '숙소는 어디예요', en: 'where are you going to stay' },
  { caseId: 'SIM-GB-08', questionId: 'gb08_passport', ko: '지금 여권 전에 다른 여권 쓴 적 있어요?', en: 'did you have a different passport before this one' },

  { caseId: 'SIM-GB-09', questionId: 'gb09_purpose', ko: '무슨 일로 영국에 오셨어요', en: 'what are you in the uk to do?' },
  { caseId: 'SIM-GB-09', questionId: 'gb09_length', ko: '체류 기간 어떻게 돼요', en: 'how long is your stay' },
  { caseId: 'SIM-GB-09', questionId: 'gb09_fees', ko: '학비랑 생활비는 어떻게 충당하세요?', en: 'how are you paying for the course and living expenses' },
  { caseId: 'SIM-GB-09', questionId: 'gb09_after', ko: '과정이 12월 4일에 끝나던데 그다음엔 뭐 해요?', en: 'your course finishes on 4 december, what happens after that?' },

  { caseId: 'SIM-GB-10', questionId: 'gb10_purpose', ko: '방문 목적이 뭐예요', en: 'what is the trip for' },
  { caseId: 'SIM-GB-10', questionId: 'gb10_funds', ko: '여행 경비는 누가 내요?', en: 'who is paying for this trip?' },
  { caseId: 'SIM-GB-10', questionId: 'gb10_return', ko: '언제 귀국해요', en: 'when are you heading home' },
  { caseId: 'SIM-GB-10', questionId: 'gb10_company', ko: '회사에서 비용 낸다고 하셨는데 고용주 서신엔 지원 없다고 돼 있어요', en: 'you said the company was paying but your employer letter says they are not funding the trip' },
  { caseId: 'SIM-GB-10', questionId: 'gb10_flights', ko: '비행기표 값은 어떻게 냈어요?', en: 'how did you pay for your flights' },

  { caseId: 'SIM-GB-11', questionId: 'gb11_purpose', ko: '무슨 일로 오셨어요?', en: 'why are you visiting' },
  { caseId: 'SIM-GB-11', questionId: 'gb11_plan', ko: '일정 순서대로 말해 줄래요', en: 'walk me through your schedule' },
  { caseId: 'SIM-GB-11', questionId: 'gb11_edinburgh', ko: '에든버러에선 어디서 묵어요?', en: 'where do you stay in edinburgh?' },
  { caseId: 'SIM-GB-11', questionId: 'gb11_funds', ko: '여행비는 어떻게 마련했어요', en: "how are you funding the trip" },
  { caseId: 'SIM-GB-11', questionId: 'gb11_london', ko: '양식에 쓴 런던 호텔 예약이 취소돼 있던데요', en: 'the london hotel on your form has been cancelled' },

  { caseId: 'SIM-GB-12', questionId: 'gb12_purpose', ko: '방문하신 목적 말씀해 주세요', en: 'what is the reason for your visit?' },
  { caseId: 'SIM-GB-12', questionId: 'gb12_costs', ko: '출장비랑 월급은 누가 대요?', en: 'who covers the trip costs and pays your salary' },
  { caseId: 'SIM-GB-12', questionId: 'gb12_previous', ko: '전에 여기 온 적 있으세요', en: 'have you been here before?' },
  { caseId: 'SIM-GB-12', questionId: 'gb12_letters', ko: '방문처 회사 편지엔 18일까지 프로젝트팀에 배치된다고 돼 있네요', en: "the host company's letter says you're placed on a project team until the 18th" },
  { caseId: 'SIM-GB-12', questionId: 'gb12_original', ko: '귀국편을 19일에서 12일로 왜 바꿨어요?', en: 'why did you change your return flight from the 19th to the 12th' },

  // ── New Zealand ──
  { caseId: 'SIM-NZ-01', questionId: 'clarify', ko: '이 자료랑 기록 관계 좀 설명해 주세요', en: 'explain the link between these records please' },
  { caseId: 'SIM-NZ-01', questionId: 'source', ko: '어떤 서류로 확인하나요', en: 'which document should I verify against' },
  { caseId: 'SIM-NZ-01', questionId: 'crosscheck', ko: '첨부 표지 번호랑 지금 신청 번호가 같아요?', en: 'is the number on the attachment cover the same as your application number?' },
  { caseId: 'SIM-NZ-01', questionId: 'nz01_letter', ko: '신청할 때 무슨 추천서 냈어요?', en: 'what reference letter did you attach to the application' },

  { caseId: 'SIM-NZ-02', questionId: 'clarify', ko: '이 자료들이 어떻게 연결되는지 설명해 줄래요', en: 'how do these records relate' },
  { caseId: 'SIM-NZ-02', questionId: 'source', ko: '어느 자료 보면 돼요?', en: 'what evidence should we be checking?' },
  { caseId: 'SIM-NZ-02', questionId: 'crosscheck', ko: '접수 확인에서 체류 계획 몇 쪽이 빠졌어요?', en: 'which page of your stay plan is missing from the receipt' },
  { caseId: 'SIM-NZ-02', questionId: 'nz02_missing_page', ko: '빠진 2쪽에는 무슨 내용이 있어요?', en: "what's on page two of the stay plan, the one that's missing?" },

  { caseId: 'SIM-NZ-03', questionId: 'clarify', ko: '자료와 기록의 연관성을 설명해 주세요', en: 'can you explain how these records are connected' },
  { caseId: 'SIM-NZ-03', questionId: 'source', ko: '확인할 자료가 어떤 거예요', en: 'which evidence do I check?' },
  { caseId: 'SIM-NZ-03', questionId: 'crosscheck', ko: '확인 활동이랑 후속 메모가 같은 참조번호를 쓰나요? 번호가 뭐예요?', en: 'what reference do the activity and the follow-up note both point to' },
  { caseId: 'SIM-NZ-03', questionId: 'nz03_since', ko: '활동 끝난 다음에 새로 보낸 서류 있어요?', en: 'anything new submitted after the activity was closed?' },

  { caseId: 'SIM-NZ-04', questionId: 'nz04_purpose', ko: '이번 여행 계획 좀 말해 주세요', en: 'what are your plans on this trip' },
  { caseId: 'SIM-NZ-04', questionId: 'nz04_email', ko: 'NZeTA 승인 메일 언제 받았어요?', en: 'when did the nzeta approval email come through?' },
  { caseId: 'SIM-NZ-04', questionId: 'nz04_applied', ko: 'NZeTA 신청할 때 어떤 여권으로 했어요? 여권 또 있어요?', en: 'what passport did you apply for the nzeta with, and do you have another' },
  { caseId: 'SIM-NZ-04', questionId: 'nz04_return', ko: '돌아가는 비행기 언제예요', en: 'when do you fly out?' },

  { caseId: 'SIM-NZ-05', questionId: 'nz05_letter', ko: '최근에 보낸 서류가 뭐예요?', en: "what's the latest document you sent in" },
  { caseId: 'SIM-NZ-05', questionId: 'nz05_role', ko: '신청서에 쓴 직무가 뭐였어요', en: 'what job did you put on the application?' },
  { caseId: 'SIM-NZ-05', questionId: 'nz05_change', ko: '신청하고 나서 고용주가 왜 바뀌었는지 설명해 주세요', en: 'how come your employer changed after you applied' },
  { caseId: 'SIM-NZ-05', questionId: 'nz05_start', ko: '새 일은 언제부터 시작해요?', en: 'start date for the new job?' },

  { caseId: 'SIM-NZ-06', questionId: 'nz06_host', ko: '초청인이랑 무슨 사이예요?', en: "what's your relationship with your host" },
  { caseId: 'SIM-NZ-06', questionId: 'nz06_plans', ko: '여기 있는 동안 뭐 할 계획이에요', en: 'what do you plan to do during your stay?' },
  { caseId: 'SIM-NZ-06', questionId: 'nz06_address', ko: '신청서 주소랑 편지 주소가 왜 달라요?', en: "why doesn't the address on your application match the host letter" },
  { caseId: 'SIM-NZ-06', questionId: 'nz06_contact', ko: '초청인한테 연락할 수 있는 방법 있어요?', en: 'how can we get in touch with your host' },

  { caseId: 'SIM-NZ-07', questionId: 'nz07_tour', ko: '투어 일정 간략하게 알려 주세요', en: 'give me a quick rundown of the tour' },
  { caseId: 'SIM-NZ-07', questionId: 'nz07_return', ko: '뉴질랜드에서 언제 출국해요?', en: 'when are you leaving new zealand' },
  { caseId: 'SIM-NZ-07', questionId: 'nz07_after', ko: '투어 끝나고 20일까지 어디 있을 거예요?', en: 'where are you between the end of the tour and the 20th?' },
  { caseId: 'SIM-NZ-07', questionId: 'nz07_friend', ko: '퀸스타운 친구 주소 알아요?', en: 'do you have the address of your friend in queenstown' },

  { caseId: 'SIM-NZ-08', questionId: 'nz08_funds', ko: '신고한 돈은 어디에 들어 있어요?', en: 'where is the money you declared kept' },
  { caseId: 'SIM-NZ-08', questionId: 'nz08_upload', ko: '은행 명세서 어떻게 냈어요', en: 'how did you send in the bank statement?' },
  { caseId: 'SIM-NZ-08', questionId: 'nz08_page2', ko: '명세서 두 번째 장엔 뭐가 있어요?', en: "what's on the second page of your statement" },
  { caseId: 'SIM-NZ-08', questionId: 'nz08_plans', ko: '도착하고 나서 뭐 할 거예요?', en: 'what do you plan to do once you arrive' },

  { caseId: 'SIM-NZ-09', questionId: 'nz09_purpose', ko: '어떤 일로 오셨어요', en: 'what brings you to new zealand?' },
  { caseId: 'SIM-NZ-09', questionId: 'nz09_declared', ko: '현금 신고는 왜 하신 거예요?', en: 'why did you declare that cash' },
  { caseId: 'SIM-NZ-09', questionId: 'nz09_gift', ko: '그 돈 어디다 쓸 거예요?', en: 'what are you going to use the cash for?' },
  { caseId: 'SIM-NZ-09', questionId: 'nz09_stay', ko: '어디서 지내실 거예요', en: 'where will you be staying' },
  { caseId: 'SIM-NZ-09', questionId: 'nz09_onward', ko: '결혼식 끝나고 일정은요?', en: 'what happens after the wedding?' },

  { caseId: 'SIM-NZ-10', questionId: 'nz10_purpose', ko: '방문 이유가 뭔가요', en: 'what is the purpose of your trip' },
  { caseId: 'SIM-NZ-10', questionId: 'nz10_work', ko: '지금 직업이 뭐예요?', en: 'what is your occupation' },
  { caseId: 'SIM-NZ-10', questionId: 'nz10_previous', ko: '전에 뉴질랜드 비자나 NZeTA 신청해 본 적 있어요? 다른 이름 쓴 적은요?', en: 'any previous nz visa or nzeta applications, or other names used?' },
  { caseId: 'SIM-NZ-10', questionId: 'nz10_return', ko: '언제 돌아가요?', en: 'when do you go back' },

  { caseId: 'SIM-NZ-11', questionId: 'nz11_conf', ko: '학회 일정이 어떻게 돼요?', en: "what's the conference schedule" },
  { caseId: 'SIM-NZ-11', questionId: 'nz11_before', ko: '학회 시작 전에는 며칠 동안 뭐 해요?', en: 'what are you doing in the days before the conference?' },
  { caseId: 'SIM-NZ-11', questionId: 'nz11_spelling', ko: '학회 등록 어떤 식으로 했어요?', en: 'how did you sign up for the conference' },
  { caseId: 'SIM-NZ-11', questionId: 'nz11_after', ko: '호텔 체크아웃하고 출국 전까지 어디서 지내요?', en: 'where are you staying after you check out of the hotel until you leave?' },
  { caseId: 'SIM-NZ-11', questionId: 'nz11_return', ko: '귀국 비행기 예약돼 있어요?', en: 'do you have a confirmed flight home' },

  { caseId: 'SIM-NZ-12', questionId: 'nz12_sponsor', ko: '후원자랑 어떤 관계세요?', en: 'how are you related to your sponsor' },
  { caseId: 'SIM-NZ-12', questionId: 'nz12_stay', ko: '있는 동안 어디서 지내요', en: 'where are you staying while you visit?' },
  { caseId: 'SIM-NZ-12', questionId: 'nz12_signed', ko: '후원 신고서에 서명한 날짜가 언제예요?', en: 'when did the sponsor sign the declaration' },
  { caseId: 'SIM-NZ-12', questionId: 'nz12_arrival', ko: '언제 도착해요?', en: 'what is your arrival date?' }
];

export const ATLAS_NEGATIVES = [
  '안녕하세요',
  '좋은 아침입니다',
  '오늘 날씨 진짜 덥네요',
  '점심 뭐 드셨어요?',
  '문서 열어 줘',
  '다음 승객 불러',
  'ㅋㅋㅋㅋ',
  'ㅁㄴㅇㄹ ㅁㄴㅇㄹ',
  '수고하셨습니다',
  '음악 좀 틀어 주세요',
  'hello there',
  'good morning',
  'thanks, that is all',
  'open the document',
  'zoom in on page two',
  "what's the weather like today",
  'asdfgh qwerty',
  'tell me a joke',
  'who won the football last night',
  'save my progress'
];
