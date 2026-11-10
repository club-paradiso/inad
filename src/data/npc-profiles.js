// NPC Intelligence Layer — immutable character profiles (authored presentation data, reviewed with personas.js).
// A profile says HOW a passenger talks and moves, never WHAT is true: no case fact, no answer, no clue, no verdict
// hint. It is the only character information a model ever receives (engines/npc-context.js), so every field must
// stay safe to show a player. Temperament and reactions are acting directions: they are never read by the legal,
// case, score or decision engines (tests/unit/npc-layer.test.js pins this) and say nothing about admissibility.
//
// pace: slow | normal | brisk · formality: formal | polite | casual
// temperament: anxious | calm | impatient | reserved | cheerful | tired | firm | precise
// leads: approved lead-in ids (data/npc-leads.js) this person would use; reactions/gestures: default acting per turn kind.
export const DEFAULT_PROFILE = {
  preferredLanguage: 'ko', formality: 'polite', pace: 'normal', temperament: 'calm',
  style: 'Answers plainly and politely.', habits: [],
  leads: ['ah', 'um', 'yes', 'yes_comma'],
  reactions: { answer: 'plain', repeat: 'plain', withheld: 'withheld', clarify: 'confused', multi: 'considering', document: 'document', meta: 'neutral' },
  gestures: { answer: 'none', repeat: 'nod', withheld: 'glance-aside', clarify: 'head-tilt', multi: 'head-tilt', document: 'check-document', meta: 'nod' }
};

const p = (o) => ({ ...DEFAULT_PROFILE, ...o, reactions: { ...DEFAULT_PROFILE.reactions, ...(o.reactions || {}) }, gestures: { ...DEFAULT_PROFILE.gestures, ...(o.gestures || {}) } });

export const NPC_PROFILES = {
  'ICN-S2-005': p({ pace: 'slow', temperament: 'anxious', style: 'First trip abroad; short, polite answers; never volunteers detail.', habits: ['short answers', 'pauses before money, contact or work questions'], leads: ['ah', 'um', 'ellipsis', 'that_is', 'well', 'honestly', 'that_number', 'one_moment', 'as_said', 'sorry'], reactions: { repeat: 'hesitant' }, gestures: { answer: 'glance-down', repeat: 'glance-down' } }),
  'ICN-S1-001': p({ pace: 'brisk', temperament: 'impatient', formality: 'formal', style: 'Seasoned business traveller; complete, quick answers; mildly impatient with repeats.', habits: ['answers fully'], leads: ['ah_short', 'um', 'yes', 'yes_comma'], reactions: { repeat: 'plain' }, gestures: { repeat: 'nod' } }),
  'ICN-S1-002': p({ temperament: 'cheerful', style: 'Shy but cheerful first-time visitor; short answers.', habits: ['smiles briefly'], leads: ['ah', 'yes', 'yes_comma'], gestures: { answer: 'nod' } }),
  'ICN-S2-006': p({ temperament: 'anxious', style: 'Slightly anxious, eager to show bookings.', habits: ['offers documents'], leads: ['ah', 'um', 'one_moment', 'yes_comma'], reactions: { repeat: 'considering' }, gestures: { answer: 'check-document' } }),
  'ICN-S3-010': p({ pace: 'slow', temperament: 'tired', style: 'Exhausted, plain spoken.', habits: ['long pauses'], leads: ['ellipsis', 'um', 'well'], gestures: { answer: 'glance-down' } }),
  'ICN-S3-011': p({ temperament: 'firm', style: 'Calm and firm; listens and keeps his position.', habits: ['steady eye contact'], leads: ['yes', 'yes_comma', 'um'], reactions: { withheld: 'neutral' }, gestures: { withheld: 'none' } }),
  'ICN-S1-003': p({ temperament: 'calm', formality: 'casual', style: 'Relaxed returning resident; plain answers.', leads: ['ah_short', 'yes', 'yes_comma'] }),
  'ICN-S1-004': p({ pace: 'brisk', temperament: 'precise', formality: 'formal', style: 'Organised purchasing manager; names and dates.', leads: ['yes', 'yes_comma'], gestures: { answer: 'none' } }),
  'ICN-S2-007': p({ temperament: 'calm', formality: 'casual', style: 'Easy-going; vague about details left to others (acting only).', leads: ['um', 'ah', 'well'], reactions: { answer: 'considering' } }),
  'ICN-S2-008': p({ temperament: 'precise', formality: 'formal', style: 'Quality engineer; precise and slightly formal.', leads: ['yes', 'um'] }),
  'ICN-S3-009': p({ temperament: 'firm', style: 'Composed and insistent (acting only).', leads: ['yes', 'yes_comma'], reactions: { repeat: 'neutral' } }),
  'ICN-S3-012': p({ temperament: 'cheerful', style: 'Polite weekend tourist.', leads: ['ah', 'yes', 'yes_comma'] })
};

export function profileFor(caseId) { return NPC_PROFILES[caseId] || DEFAULT_PROFILE; }
