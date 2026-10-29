import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { state } from '../../src/js/state.js';
import { atlasScenario, atlasScenarios } from '../../src/data/atlas-scenarios.js';
import * as atlas from '../../src/js/engines/atlas-engine.js';
import { RELATIONSHIP_TYPES, compareFacts, evaluateDebrief, validateGraphState, normalizeGraph, createEmptyGraph } from '../../src/js/engines/atlas-graph-engine.js';
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
  atlas.callAtlasPassenger();
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
  atlas.callAtlasPassenger();
  const scenario = atlas.currentAtlasScenario();
  const caseState = atlas.activeAtlasCase();

  // Incomplete debrief
  const debriefBefore = evaluateDebrief(scenario, caseState);
  assert.equal(debriefBefore.discrepancyIdentified, false);
  assert.equal(debriefBefore.rating, 'incomplete');

  // Discover conflict and ask clarification, but do not verify statement yet
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

  // Unverified follow-up cannot be evaluated as complete
  const debriefMid = evaluateDebrief(scenario, caseState);
  assert.equal(debriefMid.discrepancyIdentified, true);
  assert.equal(debriefMid.followUpCompleted, false);
  assert.equal(debriefMid.rating, 'competent');

  // Verify statement against ticket
  atlas.atlasAction('clearFacts');
  atlas.atlasAction('selectFact', 'SIM-CA-01-F-TICKET');
  atlas.atlasAction('selectFact', 'SIM-CA-01-F-STMT');
  atlas.atlasCompare();

  const debriefAfter = evaluateDebrief(scenario, caseState);
  assert.equal(debriefAfter.discrepancyIdentified, true);
  assert.equal(debriefAfter.followUpCompleted, true);
  assert.ok(debriefAfter.score >= 80);
  assert.equal(debriefAfter.rating, 'thorough');
  assert.ok(debriefAfter.feedback.length >= 1);
});

test('validateGraphState and normalizeGraph hardening: history, bounds, and consistency', () => {
  const valid = createEmptyGraph();
  assert.equal(validateGraphState(valid), true);

  // History entry checks
  valid.history.push({
    time: Date.now(),
    factA: 'FACT-1',
    factB: 'FACT-2',
    type: RELATIONSHIP_TYPES.CONFLICT,
    findingId: 'FINDING-1'
  });
  assert.equal(validateGraphState(valid), true);

  // Negative / zero / NaN time rejected
  assert.equal(validateGraphState({ ...valid, history: [{ time: 0, factA: 'A', factB: 'B', type: 'MATCH', findingId: null }] }), false);
  assert.equal(validateGraphState({ ...valid, history: [{ time: -100, factA: 'A', factB: 'B', type: 'MATCH', findingId: null }] }), false);
  assert.equal(validateGraphState({ ...valid, history: [{ time: NaN, factA: 'A', factB: 'B', type: 'MATCH', findingId: null }] }), false);

  // Self comparison in history rejected
  assert.equal(validateGraphState({ ...valid, history: [{ time: 1000, factA: 'A', factB: 'A', type: 'MATCH', findingId: null }] }), false);

  // Invalid relationship type rejected
  assert.equal(validateGraphState({ ...valid, history: [{ time: 1000, factA: 'A', factB: 'B', type: 'INVALID_TYPE', findingId: null }] }), false);

  // Array bounds and uniqueness
  assert.equal(validateGraphState({ ...valid, selectedFacts: ['A', 'B', 'C'] }), false);
  assert.equal(validateGraphState({ ...valid, selectedFacts: ['A', 'A'] }), false);
  assert.equal(validateGraphState({ ...valid, discoveries: ['D1', 'D1'] }), false);

  // Backward compatibility: graph without history is valid
  const legacyNoHistory = { selectedFacts: [], discoveries: [], unlockedQuestions: [], evidenceRequests: [], investigationPath: null };
  assert.equal(validateGraphState(legacyNoHistory), true);

  // normalizeGraph sanitizes invalid entries and bounds safely
  const normalized = normalizeGraph({
    selectedFacts: ['A', 'B', 'C', 'A'],
    discoveries: ['D1', 123, 'D1', 'D2'],
    history: [
      { time: 1000, factA: 'A', factB: 'B', type: 'MATCH', findingId: null },
      { time: -1, factA: 'A', factB: 'B', type: 'MATCH', findingId: null }
    ]
  });
  assert.deepEqual(normalized.selectedFacts, ['A', 'B']);
  assert.deepEqual(normalized.discoveries, ['D1', 'D2']);
  assert.equal(normalized.history.length, 1);
  assert.equal(normalized.history[0].time, 1000);
});

test('statement fact chip gating: chips and selections locked until question is asked', () => {
  atlas.selectCountry('CA');
  atlas.selectAtlasCase('SIM-CA-01');
  atlas.callAtlasPassenger();
  const v = atlas.activeAtlasCase();

  // Initially, statement fact cannot be selected
  assert.equal(atlas.atlasAction('selectFact', 'SIM-CA-01-F-STMT'), false);
  assert.deepEqual(v.graph.selectedFacts, []);

  // Asking an unrelated question (e.g. source) does NOT unlock statement fact
  assert.equal(atlas.atlasAction('ask', 'source'), true);
  assert.equal(atlas.atlasAction('selectFact', 'SIM-CA-01-F-STMT'), false);

  // Asking clarify unlocks statement fact selection
  assert.equal(atlas.atlasAction('ask', 'clarify'), true);
  assert.equal(atlas.atlasAction('selectFact', 'SIM-CA-01-F-STMT'), true);
  assert.ok(v.graph.selectedFacts.includes('SIM-CA-01-F-STMT'));

  // SIM-GB-02 statement fact locked until gb02_remaining_days is asked
  atlas.selectCountry('GB');
  atlas.selectAtlasCase('SIM-GB-02');
  const vGB = atlas.activeAtlasCase();
  assert.equal(atlas.atlasAction('selectFact', 'SIM-GB-02-F-TOURISM'), false);
  assert.equal(atlas.atlasAction('ask', 'clarify'), true);
  assert.equal(atlas.atlasAction('selectFact', 'SIM-GB-02-F-TOURISM'), false);

  // Discover gap and unlock remaining days
  atlas.atlasAction('selectFact', 'SIM-GB-02-F-EVENT');
  atlas.atlasAction('selectFact', 'SIM-GB-02-F-STAY');
  atlas.atlasCompare();
  assert.equal(atlas.atlasAction('ask', 'gb02_remaining_days'), true);
  assert.equal(atlas.atlasAction('selectFact', 'SIM-GB-02-F-TOURISM'), true);
  assert.ok(vGB.graph.selectedFacts.includes('SIM-GB-02-F-TOURISM'));

  // SIM-NZ-02 statement fact locked until nz02_missing_page is asked
  atlas.selectCountry('NZ');
  atlas.selectAtlasCase('SIM-NZ-02');
  const vNZ = atlas.activeAtlasCase();
  assert.equal(atlas.atlasAction('selectFact', 'SIM-NZ-02-F-PAGE2-DETAIL'), false);
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-PAGE1');
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-RECEIPT-PAGE2');
  atlas.atlasCompare();
  assert.equal(atlas.atlasAction('ask', 'nz02_missing_page'), true);
  assert.equal(atlas.atlasAction('selectFact', 'SIM-NZ-02-F-PAGE2-DETAIL'), true);
  assert.ok(vNZ.graph.selectedFacts.includes('SIM-NZ-02-F-PAGE2-DETAIL'));
});

test('atlasRequestEvidence engine validation: prerequisite discovery and scenario check', () => {
  atlas.selectCountry('NZ');
  atlas.selectAtlasCase('SIM-NZ-02');
  const v = atlas.activeAtlasCase();

  // Invalid request IDs rejected
  assert.equal(atlas.atlasRequestEvidence('NON_EXISTENT_REQ'), false);
  assert.equal(atlas.atlasAction('requestEvidence', 'NON_EXISTENT_REQ'), false);

  // Valid request ID rejected BEFORE prerequisite discovery (NZ02_PAGE2_MISSING)
  assert.equal(atlas.atlasRequestEvidence('SIM-NZ-02-REQ-PAGE2'), false);
  assert.deepEqual(v.graph.evidenceRequests, []);

  // Compare to discover NZ02_PAGE2_MISSING
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-PAGE1');
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-RECEIPT-PAGE2');
  atlas.atlasCompare();
  assert.ok(v.graph.discoveries.includes('NZ02_PAGE2_MISSING'));

  // Now evidence request succeeds
  assert.equal(atlas.atlasRequestEvidence('SIM-NZ-02-REQ-PAGE2'), true);
  assert.deepEqual(v.graph.evidenceRequests, ['SIM-NZ-02-REQ-PAGE2']);

  // Idempotent call succeeds without duplicate
  assert.equal(atlas.atlasRequestEvidence('SIM-NZ-02-REQ-PAGE2'), true);
  assert.deepEqual(v.graph.evidenceRequests, ['SIM-NZ-02-REQ-PAGE2']);
});

test('evaluateDebrief rigor for UK and NZ vertical slices', () => {
  // SIM-GB-02
  atlas.selectCountry('GB');
  atlas.selectAtlasCase('SIM-GB-02');
  const scenarioGB = atlas.currentAtlasScenario();
  const caseGB = atlas.activeAtlasCase();

  atlas.atlasAction('document', 'SIM-GB-02-DOC1');
  atlas.atlasAction('review', 'SIM-GB-02-DOC1');
  atlas.atlasAction('document', 'SIM-GB-02-DOC2');
  atlas.atlasAction('review', 'SIM-GB-02-DOC2');
  atlas.atlasAction('selectFact', 'SIM-GB-02-F-EVENT');
  atlas.atlasAction('selectFact', 'SIM-GB-02-F-STAY');
  atlas.atlasCompare();
  atlas.atlasAction('ask', 'gb02_remaining_days');
  caseGB.rationale = 'Ten day stay accounts for two day event and eight days tourism.';

  // Asking question alone does not complete follow-up
  const dGB1 = evaluateDebrief(scenarioGB, caseGB);
  assert.equal(dGB1.discrepancyIdentified, true);
  assert.equal(dGB1.followUpCompleted, false);
  assert.equal(dGB1.rating, 'competent');

  // Comparing tourism statement completes follow-up
  atlas.atlasAction('clearFacts');
  atlas.atlasAction('selectFact', 'SIM-GB-02-F-STAY');
  atlas.atlasAction('selectFact', 'SIM-GB-02-F-TOURISM');
  atlas.atlasCompare();

  const dGB2 = evaluateDebrief(scenarioGB, caseGB);
  assert.equal(dGB2.followUpCompleted, true);
  assert.equal(dGB2.missingDistinguished, true);
  assert.equal(dGB2.rating, 'thorough');

  // SIM-NZ-02
  atlas.selectCountry('NZ');
  atlas.selectAtlasCase('SIM-NZ-02');
  const scenarioNZ = atlas.currentAtlasScenario();
  const caseNZ = atlas.activeAtlasCase();

  atlas.atlasAction('document', 'SIM-NZ-02-DOC1');
  atlas.atlasAction('review', 'SIM-NZ-02-DOC1');
  atlas.atlasAction('document', 'SIM-NZ-02-DOC2');
  atlas.atlasAction('review', 'SIM-NZ-02-DOC2');
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-PAGE1');
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-RECEIPT-PAGE2');
  atlas.atlasCompare();
  caseNZ.rationale = 'Stay plan page 2 absent from receipt. Requested omission follow-up.';

  // Without request & confirmation, followUpCompleted is false
  const dNZ1 = evaluateDebrief(scenarioNZ, caseNZ);
  assert.equal(dNZ1.discrepancyIdentified, true);
  assert.equal(dNZ1.followUpCompleted, false);

  // Lodge request and confirm with statement
  atlas.atlasRequestEvidence('SIM-NZ-02-REQ-PAGE2');
  atlas.atlasAction('ask', 'nz02_missing_page');
  atlas.atlasAction('clearFacts');
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-RECEIPT-PAGE2');
  atlas.atlasAction('selectFact', 'SIM-NZ-02-F-PAGE2-DETAIL');
  atlas.atlasCompare();

  const dNZ2 = evaluateDebrief(scenarioNZ, caseNZ);
  assert.equal(dNZ2.followUpCompleted, true);
  assert.equal(dNZ2.rating, 'thorough');
});
