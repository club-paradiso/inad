// Single application state tree. All mutation happens in engines (never in UI renderers).
// `session` holds the generated duty roster for the current seed; `state` holds the live
// inspection/game state; `preferences` are persisted accessibility settings.
import { storeGet } from './services/storage.js';

export function emptyStats() { return { processed: 0, admitted: 0, secondary: 0, refused: 0, refugee: 0, investigation: 0, interpreter: 0 }; }

export const session = {
  seed: 0,
  normalCases: [],          // ACTIVE_NORMAL_CASES (24 generated passengers)
  queue: [],                // SHIFT_QUEUE (36 items: {shift, travelerId, caseId|null, normalId|null})
  normalCaseMap: new Map(),
  parties: [],              // SESSION_PARTIES
  partyByTraveler: new Map(),
  partyArchive: new Map()   // travelerId → archived statement (survives across cases, saved in checkpoint)
};

export const state = {
  caseIndex: 0, strikes: 0, score: 100, efficiency: 100, proportionality: 100,
  audio: true, soundCues: 0, announcements: 0,
  difficulty: 'standard', challengeId: 'none', challengeApplied: false,
  scenarioId: 'normal', scenarioApplied: false,
  campaignId: 'none', campaignDay: 0, campaignApplied: false, campaignCarryBacklog: 0, campaignCarryFatigue: 0, campaignResult: null,
  guidance: storeGet('inad-guidance', 'guided'), tutorialPrimaryShown: false, tutorialIndex: 0, guidedGuardUsed: false,
  stage: 'PRIMARY', asked: new Set(), questionCounts: new Map(), looked: new Set(), performed: [], logs: [], queries: [],
  selectedDoc: 0, qcat: '기본사항', ended: false, caseStart: Date.now(), caseWorkSeconds: 0, simSeconds: 0, totalCaseSeconds: 0,
  overSecondary: 0, repeatedLookups: 0, repeatedQuestions: 0, rushed: 0, pressurePeak: 37, fatigue: 0, peakFatigue: 0, breaksTaken: 0,
  eventsSeen: 0, activeEvent: null, eventSchedule: [], eventHistory: [], backlogOffset: 0,
  refugeeStep: 0, forensic: false, investigation: false, arrestReview: false, repatriationStep: 0, procedureMode: null,
  discoveredClues: new Set(), behavior: null, language: null, party: null,
  started: false, stats: emptyStats(), reports: [], mistakes: [], sessionSaved: false, newAchievements: [], newDailyRewards: []
};

// Reset the per-session counters (v6.1 regenerateSession semantics; campaign fields are preserved by the caller).
export function resetSessionState() {
  Object.assign(state, {
    caseIndex: 0, reports: [], mistakes: [], sessionSaved: false, soundCues: 0, announcements: 0, stats: emptyStats(),
    score: 100, efficiency: 100, proportionality: 100, strikes: 0, totalCaseSeconds: 0, simSeconds: 0, caseWorkSeconds: 0,
    overSecondary: 0, repeatedLookups: 0, repeatedQuestions: 0, rushed: 0, pressurePeak: 37, fatigue: 0, peakFatigue: 0,
    breaksTaken: 0, eventsSeen: 0, activeEvent: null, eventHistory: [], backlogOffset: 0, challengeApplied: false, scenarioApplied: false
  });
}

export const preferences = {
  font: storeGet('inad-font', 'standard'),
  contrast: storeGet('inad-contrast', '0') === '1',
  reduceMotion: storeGet('inad-reduce-motion', '0') === '1',
  shortcutHints: storeGet('inad-shortcut-hints', '1') === '1'
};
