// Field notes are debrief-only commentary (src/data/field-notes.js), so they stay out of the entry bundle: the
// build ships them as their own hashed file and this loader fetches it once, right after boot, long before the
// first debrief can open. If the file has not arrived (offline, slow link) the debrief simply has no note —
// notes add no case fact and nothing else waits on them.
let notes = null, pending = null;
export function preloadFieldNotes() {
  if (!pending) pending = import('../../data/field-notes.js').then((m) => { notes = m; }).catch(() => { pending = null; });
  return pending;
}
export function fieldNoteNow(caseId, locale = 'ko') { return notes ? notes.fieldNote(caseId, locale) : null; }
