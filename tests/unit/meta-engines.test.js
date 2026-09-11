import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './setup.js';
import { state, session, resetSessionState } from '../../src/js/state.js';
import { buildSession } from '../../src/js/engines/queue-engine.js';
import { languageProfileFor, communicationReady, questionLanguageThreshold, currentLanguageLevel } from '../../src/js/engines/language-engine.js';
import { dailyMissionIds, missionIncrement, levelInfo, sessionXP, applySessionCareer, careerTemplate, evaluateAchievements, challengeEvaluation, challengeCfg, ACHIEVEMENTS, DAILY_MISSION_DEFS } from '../../src/js/engines/achievement-engine.js';
import { freshCampaign, saveCampaign, loadCampaign, advanceCampaign, campaignDaySeed, campaignCarryFromSession, CAMPAIGNS } from '../../src/js/engines/campaign-engine.js';
import { saveMeta, emptyMeta, loadMeta } from '../../src/js/engines/save-engine.js';
import { partyCrossCheck, travelPartyFor } from '../../src/js/engines/companion-engine.js';
import { CASES } from '../../src/data/cases.js';

beforeEach(() => { resetStorage(); buildSession(500001); resetSessionState(); });

test('language profile is deterministic per traveller+seed and forced low for refugee/forgery cases', () => {
  const c = CASES.find((x) => x.id === 'ICN-S3-010'); const l = languageProfileFor(c);
  assert.ok(l.korean <= 1 && l.english <= 2);
  const f = languageProfileFor(CASES.find((x) => x.id === 'ICN-S3-009')); assert.ok(f.korean <= 1);
  assert.deepEqual(languageProfileFor(CASES[0]), languageProfileFor(CASES[0]));
  const us = languageProfileFor(CASES[0]); assert.equal(us.english, 4, 'USA traveller speaks English L4'); assert.equal(us.mode, us.korean >= 2 ? 'ko' : 'en');
});

test('communication gate: basic questions need L2, sensitive ones L3, interpreter always ok', () => {
  assert.equal(questionLanguageThreshold({ cat: '기본사항' }), 2); assert.equal(questionLanguageThreshold({ cat: '재정' }), 3); assert.equal(questionLanguageThreshold({ cat: '추가소명' }), 3);
  const l = { mode: 'en', korean: 0, english: 2, interpreterActive: false };
  assert.equal(communicationReady({ cat: '기본사항' }, l).ok, true);
  const r = communicationReady({ cat: '재정' }, l); assert.equal(r.ok, false); assert.equal(r.partial, true);
  assert.equal(communicationReady({ cat: '재정' }, { ...l, interpreterActive: true }).ok, true);
  assert.equal(currentLanguageLevel({ mode: 'none', korean: 1, english: 1, interpreterActive: false }), 0);
});

test('daily missions: one per group, deterministic per date', () => {
  const ids = dailyMissionIds('2026-09-11'); assert.equal(ids.length, 3);
  assert.deepEqual(ids.map((id) => DAILY_MISSION_DEFS[id].group), ['volume', 'quality', 'meta']);
  assert.deepEqual(ids, dailyMissionIds('2026-09-11'));
  assert.equal(missionIncrement('secondary2', { reports: [{ label: '입국 허가', actions: ['SECONDARY'] }, { label: '입국 허가', actions: [] }] }), 1);
  assert.equal(missionIncrement('cleanShift', { mistakes: [] }), 1);
});

test('career: XP, levels and achievements accumulate from completed sessions only', () => {
  const c = careerTemplate();
  applySessionCareer(c, { grade: 'S', difficulty: 'realistic', overall: 95, stats: { processed: 36 }, reports: [{ label: '입국 허가', actions: ['SECONDARY'], mistakes: [] }], mistakes: [], overSecondary: 0, challengeId: 'none', scenarioId: 'normal' });
  assert.equal(c.completedShifts, 1); assert.equal(c.sGrades, 1); assert.equal(c.realisticS, 1); assert.equal(c.secondaryClears, 1);
  assert.equal(c.xp, sessionXP({ grade: 'S', difficulty: 'realistic', overall: 95, stats: { processed: 36 } }));
  const unlocked = evaluateAchievements(c); assert.ok(unlocked.includes('first_shift') && unlocked.includes('first_s') && unlocked.includes('realistic_s'));
  assert.equal(levelInfo(0).level, 1); assert.equal(levelInfo(250).level, 2); assert.equal(levelInfo(1000).level, 3);
  assert.equal(ACHIEVEMENTS.length, 18);
});

test('challenge evaluation is game-only and only succeeds on final evaluation', () => {
  state.challengeId = 'perfect'; state.started = true; state.mistakes = []; state.strikes = 0; state.score = 100; state.reports = [];
  assert.equal(challengeCfg().id, 'perfect');
  assert.equal(challengeEvaluation(false).success, false);
  assert.equal(challengeEvaluation(true).success, true);
  state.mistakes = [{}]; assert.equal(challengeEvaluation(true).success, false);
  state.challengeId = 'none';
});

test('campaign progression: day seeds derive from the base seed; results advance the day with carry-over', () => {
  saveMeta(emptyMeta());
  state.campaignId = 'holiday'; const c = freshCampaign('holiday'); saveCampaign(c);
  assert.equal(campaignDaySeed(c), campaignDaySeed({ ...c }));
  assert.notEqual(campaignDaySeed(c), campaignDaySeed({ ...c, day: 1 }));
  const r = advanceCampaign({ id: 's1', grade: 'A', overall: 90, ops: 90, pressurePeak: 40, peakFatigue: 30, scenarioId: 'arrival', mistakes: [], breaksTaken: 0 });
  assert.equal(r.completed, false); assert.equal(r.nextDay, 1); assert.equal(loadCampaign().day, 1); assert.equal(loadCampaign().active, true);
  assert.deepEqual(campaignCarryFromSession({ grade: 'F', failed: true }), { backlog: 8, fatigue: 22, label: '중대한 업무부담 이월' });
  const f = advanceCampaign({ id: 's2', grade: 'F', failed: true, overall: 40, ops: 50, mistakes: [{}] });
  assert.equal(f.failed, true); assert.equal(loadCampaign().active, false);
  assert.equal(loadMeta().campaignHistory.length, 1);
  assert.equal(CAMPAIGNS.holiday.days.length, 3);
  state.campaignId = 'none';
});

test('companion cross-check returns context only and never a verdict', () => {
  const party = session.parties[0]; state.caseIndex = party.members[0].queueIndex;
  const x = partyCrossCheck(travelPartyFor());
  assert.ok(['pending', 'ok', 'review'].includes(x.status)); assert.ok(!('verdict' in x));
});
