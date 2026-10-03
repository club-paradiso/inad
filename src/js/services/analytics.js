// Privacy-First Product Analytics (v11):
// Collects coarse, anonymous operational telemetry for gameplay loops and question reliability.
//
// Invariants (Non-negotiable):
// - NO raw audio is ever captured or stored.
// - NO verbatim user-typed text or transcribed speech is ever captured or stored.
// - NO personal identifiers, IP addresses, or browser fingerprinting.
// - Works 100% offline. Aggregates are kept in browser localStorage under a dedicated key.
// - Completely fail-graceful: network failure or localStorage errors never break gameplay.

import { bus } from './bus.js';
import { jsonGet, jsonSet } from './storage.js';

export const ANALYTICS_STORAGE_KEY = 'inad-analytics-v11';
export const ANALYTICS_VERSION = 1;

const ALLOWED_EVENT_NAMES = new Set([
  'interview_turn',
  'interview_confirm',
  'interview_confirm_accept',
  'interview_clarification',
  'statement_lock_attempt',
  'statement_lock_success',
  'statement_lock_unmatched',
  'premature_decision',
  'case_start',
  'case_complete',
  'session_start',
  'session_complete',
  'debrief_open'
]);

function createEmptyAnalytics() {
  return {
    version: ANALYTICS_VERSION,
    firstSessionTime: Date.now(),
    lastUpdated: Date.now(),
    totals: {
      sessionsStarted: 0,
      sessionsCompleted: 0,
      casesStarted: 0,
      casesCompleted: 0,
      questionsAsked: 0,
      inputSources: {
        suggestion: 0,
        list: 0,
        text: 0,
        voice: 0
      },
      confirmationsOffered: 0,
      confirmationsAccepted: 0,
      clarificationsTriggered: 0,
      statementLocksAttempted: 0,
      statementLocksSucceeded: 0,
      contradictionsFound: 0,
      prematureDecisions: 0,
      modesPlayed: {
        live: 0,
        quick: 0,
        daily: 0,
        shift: 0
      }
    },
    cases: {} // coarse aggregates per caseId
  };
}

let memoryAnalytics = null;
let saveTimer = null;
let installed = false;
let sessionStartTime = 0;

function loadAnalytics() {
  if (memoryAnalytics) return memoryAnalytics;
  const loaded = jsonGet(ANALYTICS_STORAGE_KEY, null);
  if (loaded && loaded.version === ANALYTICS_VERSION && typeof loaded.totals === 'object') {
    memoryAnalytics = loaded;
  } else {
    memoryAnalytics = createEmptyAnalytics();
  }
  return memoryAnalytics;
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!memoryAnalytics) return;
    memoryAnalytics.lastUpdated = Date.now();
    try {
      jsonSet(ANALYTICS_STORAGE_KEY, memoryAnalytics);
    } catch {
      // Degrades silently if storage quota exceeded or disabled
    }
  }, 1000);
}

export function installAnalytics() {
  if (installed) return;
  installed = true;
  sessionStartTime = Date.now();
  loadAnalytics();

  bus.on('analytics', (e) => {
    if (!e || typeof e.name !== 'string' || !ALLOWED_EVENT_NAMES.has(e.name)) return;
    recordEvent(e.name, e);
  });
}

export function recordEvent(name, data = {}) {
  const store = loadAnalytics();
  const totals = store.totals;

  switch (name) {
    case 'session_start':
      totals.sessionsStarted++;
      if (data.mode && totals.modesPlayed[data.mode] !== undefined) {
        totals.modesPlayed[data.mode]++;
      }
      break;

    case 'session_complete':
      totals.sessionsCompleted++;
      break;

    case 'case_start':
      totals.casesStarted++;
      if (data.caseId) {
        store.cases[data.caseId] = store.cases[data.caseId] || { starts: 0, completions: 0, questions: 0, contradictions: 0 };
        store.cases[data.caseId].starts++;
      }
      break;

    case 'case_complete':
      totals.casesCompleted++;
      if (data.caseId) {
        store.cases[data.caseId] = store.cases[data.caseId] || { starts: 0, completions: 0, questions: 0, contradictions: 0 };
        store.cases[data.caseId].completions++;
      }
      break;

    case 'interview_turn':
      totals.questionsAsked++;
      if (data.source && totals.inputSources[data.source] !== undefined) {
        totals.inputSources[data.source]++;
      }
      if (data.caseId && store.cases[data.caseId]) {
        store.cases[data.caseId].questions++;
      }
      break;

    case 'interview_confirm':
      totals.confirmationsOffered++;
      break;

    case 'interview_confirm_accept':
      totals.confirmationsAccepted++;
      break;

    case 'interview_clarification':
      totals.clarificationsTriggered++;
      break;

    case 'statement_lock_attempt':
      totals.statementLocksAttempted++;
      break;

    case 'statement_lock_success':
      totals.statementLocksAttempted++;
      totals.statementLocksSucceeded++;
      totals.contradictionsFound++;
      if (data.caseId && store.cases[data.caseId]) {
        store.cases[data.caseId].contradictions++;
      }
      break;

    case 'statement_lock_unmatched':
      totals.statementLocksAttempted++;
      break;

    case 'premature_decision':
      totals.prematureDecisions++;
      break;
  }

  queueSave();
}

export function analyticsSnapshot() {
  const store = loadAnalytics();
  const totals = store.totals;
  const totalInput = Object.values(totals.inputSources).reduce((a, b) => a + b, 0);

  return {
    version: store.version,
    uptimeSeconds: Math.floor((Date.now() - sessionStartTime) / 1000),
    totals: { ...totals },
    rates: {
      confirmationAcceptRate: totals.confirmationsOffered > 0
        ? Math.round((totals.confirmationsAccepted / totals.confirmationsOffered) * 100) : 0,
      statementLockSuccessRate: totals.statementLocksAttempted > 0
        ? Math.round((totals.statementLocksSucceeded / totals.statementLocksAttempted) * 100) : 0,
      inputDistribution: {
        suggestion: totalInput > 0 ? Math.round((totals.inputSources.suggestion / totalInput) * 100) : 0,
        list: totalInput > 0 ? Math.round((totals.inputSources.list / totalInput) * 100) : 0,
        text: totalInput > 0 ? Math.round((totals.inputSources.text / totalInput) * 100) : 0,
        voice: totalInput > 0 ? Math.round((totals.inputSources.voice / totalInput) * 100) : 0
      }
    },
    cases: { ...store.cases }
  };
}

export function resetAnalytics() {
  memoryAnalytics = createEmptyAnalytics();
  try {
    jsonSet(ANALYTICS_STORAGE_KEY, memoryAnalytics);
  } catch {
    // Graceful
  }
}
