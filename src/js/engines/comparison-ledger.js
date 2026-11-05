// Visible-record comparison helpers. Only already displayed passenger replies and executed
// lookup results may be offered; never consult hidden case answers, resolution or required actions.
// The notes are examiner-entered training annotations, not verified facts or legal verdict inputs.

const LOOKUP_LABELS = {
  history: ['출입국기록', 'Entry history'],
  visa: ['사증·입국자격', 'Visa / entry status'],
  pnr: ['항공 예약', 'Flight reservation'],
  contact: ['국내관계', 'Local contact'],
  party: ['동행인', 'Travel party'],
  public: ['공개정보', 'Public record'],
  forensic: ['문서감식', 'Document examination']
};

export function availableCompareSources(st) {
  const statements = (st?.logs || []).flatMap((line, i) => line?.type === 'alien' && typeof line.text === 'string' && line.text.trim()
    ? [{ id: 'statement:' + i, type: 'statement', index: i, ko: '승객 진술 ' + (i + 1), en: 'Traveler statement ' + (i + 1), text: line.text }]
    : []);
  const seen = new Set();
  const lookups = (st?.queries || []).flatMap((q) => {
    if (!q?.kind || seen.has(q.kind) || typeof q.text !== 'string') return [];
    seen.add(q.kind);
    const label = LOOKUP_LABELS[q.kind] || [q.kind, q.kind];
    return [{ id: 'lookup:' + q.kind, type: 'lookup', ko: '전산 조회 · ' + label[0], en: 'Lookup · ' + label[1], text: q.text, tone: q.t }];
  });
  return [...statements, ...lookups];
}

export function comparisonSummary(st) {
  const rows = Object.values(st?.comparisonNotes || {}).filter((row) => row && (row.status === 'checked' || row.status === 'followup'));
  return { total: rows.length, checked: rows.filter((row) => row.status === 'checked').length, followup: rows.filter((row) => row.status === 'followup').length };
}

export function safeComparisonNote(text) {
  return String(text ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 240);
}
