import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { state } from '../../src/js/state.js';
import { atlasScenario, atlasScenarios } from '../../src/data/atlas-scenarios.js';
import * as atlas from '../../src/js/engines/atlas-engine.js';
import { RELATIONSHIP_TYPES, compareFacts, evaluateDebrief } from '../../src/js/engines/atlas-graph-engine.js';
import * as save from '../../src/js/engines/save-engine.js';

beforeEach(() => {
  resetStorage();
  Object.assign(state, {
    countryId: 'KR',
    airportId: 'icn-t2',
    sessionMode: 'shift',
    scenarioId: 'normal',
    rulesetVersion: 'kr-v6.1',
    started: false,
    atlas: { sessions: {}, view: 'counter', krContext: null, storageBlocked: false, saveStatus: 'idle' }
  });
});

test('typed evidence comparison: Canada SIM-CA-01 date conflict and explanation', () => {
  const scenario = atlasScenario('CA', 'SIM-CA-01');
  assert.ok(scenario);
  assert.equal(scenario.facts.length, 3);

  // 1. Ticket vs Visit Record -> CONFLICT
  const resConflict = compareFacts(scenario, 'SIM-CA-01-F-TICKET', 'SIM-CA-01-F-VISIT');
  assert.equal(resConflict.ok, true);
  assert.equal(resConflict.comparison.type, RELATIONSHIP_TYPES.CONFLICT);
  assert.equal(resConflict.comparison.findingId, 'CA01_DATE_CONFLICT');
  assert.deepEqual(resConflict.comparison.unlocks.questions, ['clarify_dates']);

  // 2. Ticket vs Statement -> MATCH
  const resMatch = compareFacts(scenario, 'SIM-CA-01-F-TICKET', 'SIM-CA-01-F-STMT');
  assert.equal(resMatch.ok, true);
  assert.equal(resMatch.comparison.type, RELATIONSHIP_TYPES.MATCH);
  assert.equal(resMatch.comparison.findingId, 'CA01_TICKET_MATCHES_STMT');

  // 3. Visit Record vs Statement -> UNVERIFIED (official record unamended)
  const resUnverified = compareFacts(scenario, 'SIM-CA-01-F-VISIT', 'SIM-CA-01-F-STMT');
  assert.equal(resUnverified.ok, true);
  assert.equal(resUnverified.comparison.type, RELATIONSHIP_TYPES.UNVERIFIED);
  assert.equal(resUnverified.comparison.findingId, 'CA01_RECORD_UNAMENDED');
});

test('typed evidence comparison: UK SIM-GB-02 event vs declared duration gap', () => {
  const scenario = atlasScenario('GB', 'SIM-GB-02');
  assert.ok(scenario);

  // 1. Event (2 days) vs Declared Stay (10 days) -> UNVERIFIED (gap, not misconduct)
  const resGap = compareFacts(scenario, 'SIM-GB-02-F-EVENT', 'SIM-GB-02-F-STAY');
  assert.equal(resGap.ok, true);
  assert.equal(resGap.comparison.type, RELATIONSHIP_TYPES.UNVERIFIED);
  assert.equal(resGap.comparison.findingId, 'GB02_DURATION_GAP');
  assert.deepEqual(resGap.comparison.unlocks.questions, ['gb02_remaining_days']);

  // 2. Event vs Tourism statement -> MATCH
  const resStmt = compareFacts(scenario, 'SIM-GB-02-F-EVENT', 'SIM-GB-02-F-TOURISM');
  assert.equal(resStmt.ok, true);
  assert.equal(resStmt.comparison.type, RELATIONSHIP_TYPES.MATCH);
  assert.equal(resStmt.comparison.findingId, 'GB02_ITINERARY_SEPARATED');
});

test('typed evidence comparison: NZ SIM-NZ-02 missing stay plan page 2', () => {
  const scenario = atlasScenario('NZ', 'SIM-NZ-02');
  assert.ok(scenario);

  // 1. Page 1 summary vs Receipt Check Page 2 Absent -> MISSING
  const resMissing = compareFacts(scenario, 'SIM-NZ-02-F-PAGE1', 'SIM-NZ-02-F-RECEIPT-PAGE2');
  assert.equal(resMissing.ok, true);
  assert.equal(resMissing.comparison.type, RELATIONSHIP_TYPES.MISSING);
  assert.equal(resMissing.comparison.findingId, 'NZ02_PAGE2_MISSING');
  assert.ok(resMissing.comparison.unlocks.evidenceRequests.includes('SIM-NZ-02-REQ-PAGE2'));

  // 2. Receipt Check vs Statement -> MATCH (confirms page 2 contents)
  const resConfirm = compareFacts(scenario, 'SIM-NZ-02-F-RECEIPT-PAGE2', 'SIM-NZ-02-F-PAGE2-DETAIL');
  assert.equal(resConfirm.ok, true);
  assert.equal(resConfirm.comparison.type, RELATIONSHIP_TYPES.MATCH);
  assert.equal(resConfirm.comparison.findingId, 'NZ02_PAGE2_CONFIRMED');
});

test('invalid and fallback comparisons are deterministic and never throw', () => {
  const scenario = atlasScenario('CA', 'SIM-CA-01');
  assert.equal(compareFacts(null, 'A', 'B').ok, false);
  assert.equal(compareFacts(scenario, '', 'B').ok, false);
  assert.equal(compareFacts(scenario, 'SIM-CA-01-F-TICKET', 'SIM-CA-01-F-TICKET').ok, false);
  assert.equal(compareFacts(scenario, 'UNKNOWN_1', 'UNKNOWN_2').ok, false);

  // Cross-case facts are rejected
  assert.equal(compareFacts(scenario, 'SIM-CA-01-F-TICKET', 'SIM-GB-02-F-EVENT').ok, false);
});

test('dynamic investigative question unlock gates and branch routing', () => {
  atlas.selectCountry('CA');
  atlas.selectAtlasCase('SIM-CA-01');
  const c = atlas.currentAtlasScenario();
  const v = atlas.activeAtlasCase();

  // Initially locked: clarify_dates cannot be asked
  assert.equal(atlas.atlasAction('ask', 'clarify_dates'), false);
  assert.equal(v.asked.includes('clarify_dates'), false);

  // Route A: Records first
  atlas.atlasAction('selectFact', 'SIM-CA-01-F-TICKET');
  atlas.atlasAction('selectFact', 'SIM-CA-01-F-VISIT');
  assert.deepEqual(v.graph.selectedFacts, ['SIM-CA-01-F-TICKET', 'SIM-CA-01-F-VISIT']);

  const cmp = atlas.atlasCompare();
  assert.equal(cmp.ok, true);
  assert.equal(cmp.comparison.type, RELATIONSHIP_TYPES.CONFLICT);
  assert.equal(v.graph.investigationPath, 'records_first');
  assert.ok(v.graph.discoveries.includes('CA01_DATE_CONFLICT'));
  assert.ok(v.graph.unlockedQuestions.includes('clarify_dates'));

  // Now unlocked: clarify_dates can be asked
  assert.equal(atlas.atlasAction('ask', 'clarify_dates'), true);
  assert.ok(v.asked.includes('clarify_dates'));
});

test('branch routing: interview-first path', () => {
  atlas.selectCountry('GB');
  atlas.selectAtlasCase('SIM-GB-02');
  const v = atlas.activeAtlasCase();

  // Route B: Interview first
  assert.equal(atlas.atlasAction('ask', 'clarify'), true);
  assert.equal(v.graph.investigationPath, 'interview_first');

  // Then compare evidence
  atlas.atlasAction('selectFact', 'SIM-GB-02-F-EVENT');
  atlas.atlasAction('selectFact', 'SIM-GB-02-F-STAY');
  const cmp = atlas.atlasCompare();
  assert.equal(cmp.ok, true);
  assert.equal(cmp.comparison.type, RELATIONSHIP_TYPES.UNVERIFIED);
  assert.equal(v.graph.investigationPath, 'interview_first');
  assert.ok(v.graph.discoveries.includes('GB02_DURATION_GAP'));
  assert.ok(v.graph.unlockedQuestions.includes('gb02_remaining_days'));
});

test('simulated evidence request in NZ SIM-NZ-02', () => {
  atlas.selectCountry('NZ');
  atlas.selectAtlasCase('SIM-NZ-02');
  const v = atlas.activeAtlasCase();

  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-PAGE1');
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-RECEIPT-PAGE2');
  atlas.atlasCompare();

  assert.ok(v.graph.discoveries.includes('NZ02_PAGE2_MISSING'));
  assert.equal(v.graph.evidenceRequests.includes('SIM-NZ-02-REQ-PAGE2'), false);

  // Explicit evidence request action
  assert.equal(atlas.atlasAction('requestEvidence', 'SIM-NZ-02-REQ-PAGE2'), true);
  assert.ok(v.graph.evidenceRequests.includes('SIM-NZ-02-REQ-PAGE2'));
});

test('evidence graph save compatibility and migration', () => {
  // Legacy save snapshot without graph property
  const legacySession = {
    version: 1,
    view: 'counter',
    sessions: {
      CA: {
        countryId: 'CA',
        sessionMode: 'simulation',
        rulesetVersion: 'atlas-procedure-1',
        airportId: 'ca-yyz',
        difficulty: 'guided',
        interviewLanguage: 'en',
        activeId: 'SIM-CA-01',
        cases: {
          'SIM-CA-01': {
            countryId: 'CA',
            scenarioId: 'SIM-CA-01',
            rulesetVersion: 'atlas-procedure-1',
            asked: ['clarify'],
            reviewed: ['SIM-CA-01-DOC1', 'SIM-CA-01-DOC2'],
            tasks: ['identity'],
            selectedDoc: 'SIM-CA-01-DOC1',
            pages: { 'SIM-CA-01-DOC1': 0, 'SIM-CA-01-DOC2': 0 },
            zoom: 100,
            search: '',
            searched: false,
            selectedRecord: null,
            notes: 'Legacy save note without graph.',
            outcome: null,
            completed: false,
            rationale: ''
          }
        }
      }
    }
  };

  // Validates cleanly under validateAtlasSave
  assert.equal(atlas.validateAtlasSave(legacySession), true);

  // Store and load legacy session
  localStorage.setItem(atlas.ATLAS_KEY, JSON.stringify(legacySession));
  atlas.loadAtlas();
  atlas.selectCountry('CA');

  const loadedCase = atlas.activeAtlasCase();
  assert.ok(loadedCase);
  // Graph is normalized on the fly
  assert.ok(loadedCase.graph);
  assert.deepEqual(loadedCase.graph.selectedFacts, []);
  assert.deepEqual(loadedCase.graph.discoveries, []);

  // Now perform new investigation actions on loaded legacy save
  atlas.atlasAction('selectFact', 'SIM-CA-01-F-TICKET');
  atlas.atlasAction('selectFact', 'SIM-CA-01-F-VISIT');
  atlas.atlasCompare();
  assert.ok(loadedCase.graph.discoveries.includes('CA01_DATE_CONFLICT'));

  // Validates with the new graph property present
  assert.equal(atlas.validateAtlasSave(atlas.atlasSnapshot()), true);

  // Round trip bundle export/import preserves graph state
  const bundle = save.makeBundle();
  assert.equal(save.validateBundle(bundle).ok, true);
  resetStorage();
  assert.equal(save.applyBundle(bundle).ok, true);

  const restored = JSON.parse(localStorage.getItem(atlas.ATLAS_KEY));
  assert.ok(restored.sessions.CA.cases['SIM-CA-01'].graph.discoveries.includes('CA01_DATE_CONFLICT'));
});

test('evidence-based debrief evaluation', () => {
  atlas.selectCountry('CA');
  atlas.selectAtlasCase('SIM-CA-01');
  const scenario = atlas.currentAtlasScenario();
  const caseState = atlas.activeAtlasCase();

  // Incomplete debrief
  const debriefBefore = evaluateDebrief(scenario, caseState);
  assert.equal(debriefBefore.discrepancyIdentified, false);
  assert.equal(debriefBefore.rating, 'incomplete');

  // Discover conflict and complete follow-up
  atlas.atlasAction('selectFact', 'SIM-CA-01-F-TICKET');
  atlas.atlasAction('selectFact', 'SIM-CA-01-F-VISIT');
  atlas.atlasCompare();
  atlas.atlasAction('ask', 'clarify_dates');
  atlas.atlasAction('document', 'SIM-CA-01-DOC1');
  atlas.atlasAction('review', 'SIM-CA-01-DOC1');
  atlas.atlasAction('document', 'SIM-CA-01-DOC2');
  atlas.atlasAction('review', 'SIM-CA-01-DOC2');
  atlas.atlasAction('notes', '12th on ticket vs 21st on visit record; transposition explained.');
  caseState.rationale = 'The traveler transposed dates when writing visit record. Retain both.';

  const debriefAfter = evaluateDebrief(scenario, caseState);
  assert.equal(debriefAfter.discrepancyIdentified, true);
  assert.equal(debriefAfter.followUpCompleted, true);
  assert.ok(debriefAfter.score >= 80);
  assert.equal(debriefAfter.rating, 'thorough');
  assert.ok(debriefAfter.feedback.length >= 1);
});
