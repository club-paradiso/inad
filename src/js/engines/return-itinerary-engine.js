// Return/onward flight evidence is a separate, procedural part of the case file.
// A PNR reservation is not an issued e-ticket and a return ticket is not the inbound boarding pass.
// Pure, deterministic projection: never fabricate a ticket number for a scripted case.
// These records cannot independently establish a legal ground for refusal.

const str = (x) => String(x ?? '').trim();
const get = (fields, names) => names.map((key) => str(fields[key])).find(Boolean) || '';
const flightCode = (value) => str(value).match(/\b[A-Z]{2,4}\d{2,4}\b/)?.[0] || '';
const airport = (value) => str(value).match(/\bICN\s*→\s*([A-Z]{3})\b/)?.[1] || '';

export function returnItineraryFor(c, { looked = new Set() } = {}) {
  if (!c) return { status: 'unknown', presentable: false, flight: '', destination: '', title: '여정 확인자료' };
  const pnr = (c.docs || []).find((d) => d.k === 'PNR');
  const fields = Object.fromEntries((pnr?.fields || []).map(([label, value]) => [str(label), str(value)]));
  const returnField = get(fields, ['귀국편', '출국', '귀국/이동']);
  const roundTrip = get(fields, ['왕복']);
  const returnRaw = returnField || (roundTrip ? roundTrip.split('/').at(-1).trim() : '');
  const returnText = str(c.return);
  const flight = flightCode(returnRaw) || flightCode(returnText);
  const destination = airport(returnText) ||
    airport(get(fields, ['귀국여정', '출국여정', '귀국/이동']));
  const bookingRef = get(fields, ['예약번호', '공동 PNR', '예약코드']);
  const ticketNo = get(fields, ['전자항공권번호', '티켓번호']);
  const rawStatus = get(fields, ['발권상태', '상태', '예약상태', '예약형태']).toUpperCase();
  const allStatus = [rawStatus, get(fields, ['발권상태', '예약형태']), returnRaw].join(' ').toUpperCase();

  // Returning to an existing Korean residence is distinct from a short-term visitor
  // lacking evidence. Do not create a negative "missing return ticket" signal.
  const resident = /등록외국인 재입국|국내 체류지로 복귀/.test(str(c.basis) + ' ' + str(c.purpose)) ||
    (returnText === '—' && (c.docs || []).some((d) => d.k === 'RESIDENCE CARD'));
  let status;
  if (resident) status = 'not-applicable';
  else if (!pnr) status = 'unsubmitted';
  else if (/\bNONE\b|ONE.WAY|없음/.test(allStatus) || returnText === '없음') status = 'missing';
  else if (/HOLD|PENDING|WAITLIST|예약\s*보류|미발권/.test(allStatus)) status = 'held';
  else if (/TICKETED|ISSUED|발권\s*완료|왕복\s*발권\s*확인/.test(allStatus) || ticketNo) status = 'ticketed';
  else if (flight || /CONFIRMED|예약\s*확정/.test(allStatus)) status = 'reserved';
  else status = 'unverified';

  // Agency-booked travelers can show a valid booking reference after a lookup,
  // but cannot automatically hand over a personal-app e-ticket they do not have.
  const agency = c.returnDelivery === 'agency';
  const verifiedAgency = looked.has('pnr');
  const presentable = ['ticketed', 'reserved', 'held'].includes(status) && (!agency || verifiedAgency);
  const title = status === 'ticketed' ? '귀국·후속 이동 전자항공권' :
    status === 'held' ? '귀국·후속 이동 예약 보류 내역' :
    '귀국·후속 이동 예약확인서';
  const labels = {
    ticketed: '발권 완료', reserved: '예약 확인 · 발권 미확인',
    held: '예약 보류 · 미발권', missing: '확보한 귀국·후속 이동 항공편 없음',
    unsubmitted: '항공예약 증빙 미제출', unverified: '귀국·후속 이동 증빙 미확인',
    'not-applicable': '국내 기존 체류지로 재입국'
  };
  const statusLabel = labels[status];
  let response;
  if (status === 'not-applicable') response = '기존 체류자격으로 한국에 돌아왔습니다. 이번 입국에 대한 별도 귀국편은 예약하지 않았습니다.';
  else if (agency && !verifiedAgency) response = '여행사 단체예약이라 개인 앱에서는 전자항공권을 바로 열 수 없습니다. 단체 예약번호와 PNR 조회로 확인해 주십시오.';
  else if (status === 'ticketed') response = '귀국 또는 다음 목적지로 가는 전자항공권을 제출하겠습니다.';
  else if (status === 'reserved') response = '예약확인서는 있습니다. 전자항공권 발권 여부는 추가 확인이 필요합니다.';
  else if (status === 'held') response = '귀국편 예약은 보류 상태이고 아직 발권된 전자항공권은 없습니다. 예약 내역을 제시하겠습니다.';
  else if (status === 'missing') response = '현재 제출할 수 있는 귀국 또는 제3국행 항공권이 없습니다.';
  else response = '귀국 또는 후속 이동 항공권을 지금 제시할 수 없습니다. 예약자료를 추가 확인해야 합니다.';

  const rows = [
    ['승객', str(c.name)],
    ...(flight ? [['항공편', flight]] : []),
    ...(destination ? [['도착지', destination]] : []),
    ...(str(c.stay) && str(c.stay) !== '장기체류' ? [['예정 체류', str(c.stay)]] : []),
    ...(bookingRef ? [['예약번호', bookingRef]] : []),
    ...(ticketNo ? [['항공권번호', ticketNo]] : []),
    ['증빙 상태', statusLabel]
  ];
  return { status, statusLabel, presentable, flight, destination, bookingRef, ticketNo,
    title, rows, agency, response, hasPNR: Boolean(pnr) };
}
