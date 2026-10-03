import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { installAnalytics, recordEvent, analyticsSnapshot, resetAnalytics, ANALYTICS_STORAGE_KEY } from '../../src/js/services/analytics.js';

test('analytics: aggregates events without recording verbatim text or PII', () => {
  resetAnalytics();
  installAnalytics();

  // Record safe events
  recordEvent('session_start', { mode: 'live' });
  recordEvent('case_start', { caseId: 'ICN-S2-005' });
  recordEvent('interview_turn', { source: 'text', caseId: 'ICN-S2-005', text: 'IGNORE THIS TEXT' });
  recordEvent('interview_turn', { source: 'suggestion', caseId: 'ICN-S2-005' });
  recordEvent('interview_confirm');
  recordEvent('interview_confirm_accept');
  recordEvent('statement_lock_success', { caseId: 'ICN-S2-005' });
  recordEvent('case_complete', { caseId: 'ICN-S2-005' });

  const snap = analyticsSnapshot();
  assert.equal(snap.totals.sessionsStarted, 1);
  assert.equal(snap.totals.modesPlayed.live, 1);
  assert.equal(snap.totals.casesStarted, 1);
  assert.equal(snap.totals.casesCompleted, 1);
  assert.equal(snap.totals.questionsAsked, 2);
  assert.equal(snap.totals.inputSources.text, 1);
  assert.equal(snap.totals.inputSources.suggestion, 1);
  assert.equal(snap.totals.confirmationsOffered, 1);
  assert.equal(snap.totals.confirmationsAccepted, 1);
  assert.equal(snap.totals.statementLocksAttempted, 1);
  assert.equal(snap.totals.statementLocksSucceeded, 1);
  assert.equal(snap.totals.contradictionsFound, 1);

  // Invariant verification: Snapshot contains NO raw text fields
  const serialized = JSON.stringify(snap);
  assert.equal(serialized.includes('IGNORE THIS TEXT'), false);

  // Rates verification
  assert.equal(snap.rates.confirmationAcceptRate, 100);
  assert.equal(snap.rates.statementLockSuccessRate, 100);
  assert.equal(snap.rates.inputDistribution.text, 50);
  assert.equal(snap.rates.inputDistribution.suggestion, 50);
});

test('analytics: reset returns clean state', () => {
  recordEvent('premature_decision');
  resetAnalytics();
  const snap = analyticsSnapshot();
  assert.equal(snap.totals.prematureDecisions, 0);
  assert.equal(snap.totals.questionsAsked, 0);
});
