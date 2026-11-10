// NPC Intelligence Layer — approved conversational lead-ins (reviewed presentation content, no case facts).
// A lead is said before a passenger line ("아…", "그게…"). A model may only pick one of these ids; it never writes
// the words. Every text here must pass dialogue-guard checkLead (no content token at all) — enforced by
// tests/unit/npc-layer.test.js. `kinds` lists the turn kinds a lead may precede; `en` is a gloss for prompts and
// documentation only (the interview record shows `ko`).
export const NPC_LEADS = {
  ah:          { ko: '아…', en: 'Ah…', kinds: ['answer', 'withheld'] },
  ah_short:    { ko: '아,', en: 'Oh,', kinds: ['answer'] },
  um:          { ko: '음,', en: 'Um,', kinds: ['answer', 'withheld'] },
  ellipsis:    { ko: '…', en: '…', kinds: ['answer', 'withheld'] },
  yes:         { ko: '네.', en: 'Yes.', kinds: ['answer', 'withheld'] },
  yes_comma:   { ko: '네,', en: 'Yes,', kinds: ['answer', 'withheld'] },
  that_is:     { ko: '그건…', en: 'That is…', kinds: ['answer', 'withheld'] },
  well:        { ko: '그게…', en: 'Well…', kinds: ['answer', 'withheld'] },
  honestly:    { ko: '…솔직히 말씀드리면,', en: 'To be honest,', kinds: ['answer'] },
  that_number: { ko: '그 번호는요…', en: 'That number…', kinds: ['answer'] },
  one_moment:  { ko: '잠시만요,', en: 'One moment,', kinds: ['answer', 'withheld'] },
  as_said:     { ko: '아까 말씀드린 대로,', en: 'As I said,', kinds: ['withheld'] },
  sorry:       { ko: '죄송합니다,', en: 'Sorry,', kinds: ['withheld'] }
};
