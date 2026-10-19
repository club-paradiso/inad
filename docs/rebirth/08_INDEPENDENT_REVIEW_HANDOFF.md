# 08 — Independent review handoff

상태: **준비 완료, 실행하지 않음**. 이번 환경의 `command -v claude`는 실행 파일을 찾지 못했다. Claude 계정·Opus5.5 실제 선택 가능 여부·cross-model orchestration은 확인되지 않았다. 제공된 Work 모델을 임의로 전환했다고 주장하지 않는다.

## reviewer와 author의 책임 분리

저자는 현재 감사·제안·점수표를 작성했다. reviewer는 이를 승인하는 역할이 아니라 **재현 가능한 반례를 찾아 권고를 기각할 수 있는 독립 검토자**다. author의 가중합/새 게임명/아키텍처를 유지할 의무가 없다. 첫 review pass는 gameplay 변경 없이 문서 보고만 한다. 두 모델의 동의도 사람 플레이테스트를 대체하지 않는다.

## 실행 환경에서 먼저 확인할 것

- Repo `https://github.com/club-paradiso/inad`, production `https://inad-gray.vercel.app`.
- 감사 baseline `2bbdb4d8c5936640b8790e430aaa21b360b7d901`, package/tag10.0.0. 현재 main이 달라졌다면 baseline worktree와 현재 diff를 분리해 읽을 것.
- 전략 branch `strategy/inad-rebirth-phase-0`; 정확한 최신 doc commit/PR은 저장소에서 조회. main에 문서가 있다고 가정하지 말 것.
- AGENTS/CLAUDE 둘 다 읽고 차이가 없는지 확인. legacy/v6.1는 동결. root index.html/dist는 생성물.
- 기존 source는 vanillaJS, shared state+bus. local Node24 결과와 CI Node22 차이 인지.
- 실제 Claude Code 설치버전/계정의 모델 선택 화면에서 **Opus5.5가 제공되는지 확인**. 모델명 문자열을 추측해 호출하지 말 것. 없다면 실행 불가와 실제 선택 가능한 모델만 보고하고 새 유료 연결 없이 이 handoff를 보존.

## 그대로 전달할 독립 검토 프롬프트

```text
MISSION: INAD REBIRTH independent adversarial review — documentation only

Model: Claude Code, Claude Opus 5.5 only if actually available in this environment.
If unavailable, do not pretend to use it or purchase access. Report the observed
availability and preserve the handoff for the owner to select an available model.
Usage: one comprehensive independent review session. Planning range: 40,000–100,000
cumulative input/output tokens, bounded by actual platform quota/context. Do not
consume tokens for their own sake. No autonomous repeat-review loop or sub-agent swarm.
Language: Korean report, English identifiers. Do not use U+202F narrow no-break spaces.

Authority: read repository/history/docs, install existing dependencies, run existing
tests, inspect public production read-only, create a review-only docs branch and Draft PR.
No gameplay/code/data/token/config/generated HTML changes. No merge or deployment.
Do not contact people, create paid services, or run a model provider benchmark with
paid credentials. Existing production/legacy behavior must remain byte-identical.

Repository: https://github.com/club-paradiso/inad
Audit baseline: 2bbdb4d8c5936640b8790e430aaa21b360b7d901
Strategy branch: strategy/inad-rebirth-phase-0 (resolve its actual head before review).
Read AGENTS.md, CLAUDE.md, docs/rebirth/README.md and all 00–08 documents plus evidence.
Do not rely on report prose where source or execution can settle the claim.

Tasks:
1. Establish baseline/current main/strategy head separately. Record exact SHAs.
2. Reproduce F1 hidden contact lookup disclosure and F2 NaN independently. Confirm
   whether F3 unlockQuestions and F6 analytics statements accurately describe emitters.
   Distinguish old remote CI from your fresh E2E. Do not fix failures in this review.
3. Challenge PIVOT versus CONTINUE/REBUILD/ARCHIVE. Recompute the scorecard and state
   which single assumption changes the ranking. Do not defer to the author's E choice.
4. Attack the proposed provenance game: is source withdrawal a meaningful decision,
   or just a new way to click the correct authored answer? Can all actions be exhausted
   without tradeoffs? Do 3 slots arbitrarily withhold procedural rights?
5. Walk RB-R01 on paper through every check combination, withdrawal/undo, unsupported
   claim, duplicate command, reload, budget exhaustion, and valid handoff. Find contradictions
   in its canon, initial visibility, acquisition guards, support propagation and outcomes.
6. Inspect the technical seams. Identify exactly which reused modules secretly import
   production state/bus/DOM. Show a minimal pure domain boundary. Do not propose a
   framework, graph editor, cloud backend, model fine-tune or free-form NPC without necessity.
7. Challenge legal/ethical scope: unsupported is not false; one corrected fact is not
   total admissibility; nationality/appearance/language/stress must not become risk scores.
   Do not invent legal authorities or reconstruct nonpublic enforcement criteria.
8. Audit playtest denominators, partial-completion definitions, novelty questions,
   next-case behavioral evidence, content authoring cost, and archive thresholds.
9. Deliver findings first: severity, evidence class, file/symbol/SHA, reproducible counterexample,
   user impact, minimum remedy, and whether it blocks the next 12–20h domain spike.
10. End with an independent GO / GO WITH CONDITIONS / BLOCK for the spike, plus the
    strongest argument for archiving. Document disagreement rather than averaging it away.

Output: docs/rebirth/09_INDEPENDENT_REVIEW.md in a new review branch/Draft PR.
Include commands/results, unknowns, and actual model availability. No implementation.
```

## reviewer에게 반드시 묻는 반증 질문

| 질문 | 발견하면 바꿀 것 |
|---|---|
| F1에서 정상 UI가 해당 target을 실제 허용하는가? | 소스만의 취약점인지 운영 재현인지 구분. 현재 감사는 둘 다 재현했다고 기록 |
| `LOCK_` 없는 required와 optional mechanic이 반드시 재미 부족을 의미하는가? | 인과 과장을 줄인다. 선택적 gameplay도 재미있을 수 있으며 사람 증거 필요 |
| source 계보 공개가 너무 쉬워 ‘다 읽기’가 최적 아닌가? | 첫case 교육성/후속 난도의 설계, 철회와 확인의 선택을 다시 평가 |
| initial support를 전부 unsupported로 표시하면 퍼즐 답을 알려주지 않는가? | draft의 주장과 검토 후 상태를 구분. unassessed 상태/전파 시점 명료화 |
| E06/E07을 받기 전 predicate가 hidden truth를 보고 있지 않은가? | acquired/observed boundary를 mandatory gate로 유지 |
| 두 기관이 같은 원본을 쓴다고 원본 사실 자체가 틀린가? | 사실 부정과 독립성 철회를 엄격히 분리 |
| 슬롯3은 인위적 퍼즐 budget인가,실제 권리 제한으로 읽히는가? | free response/valid handoff 보장과 fiction framing. 비용 없는 대안 비교도 실험 |
| 원장2+행사1이 원장2+이력1보다 정당하게 다른 결과인가? | 확정할 수 있는 scope가 실제 달라지는지 검증, 허위 선택이면 action재설계 |
| 다음case 제작이 엔진 특례를 요구하는가? |1case 전용 coding을 범용 engine이라고 포장하지 않음 |
|83–159h가 실제로 과소 추정인가? | 항목별 추정 수정, 첫 승인 범위 축소, 전체 재작성 거부 가능 |

## 승인 이후 첫 engineering mission — 지금은 실행 금지

첫 구현은 전체 UI가 아니라 **독립적인 headless 도메인 spike**다. 목표는 새 게임이 기술적으로 자기 규칙을 지킬 수 있는지 확인하는 것. 별도 branch `prototype/inad-rebirth-domain`(충돌 시 suffix), baseline/전략 문서 버전 고정, main merge·deployment 없음.

소유자가 이 구현 범위를 명시 승인한 뒤에만 다음 지시를 실행한다.

```text
Model: Claude Code Opus 5.5 if verified available; otherwise use only the model explicitly
selected by the owner after availability check. Usage: one implementation pass and one
focused adversarial verification pass, planning 40k–80k cumulative input/output tokens;
actual quota prevails. Human effort budget: 12–20 focused hours. No runtime model calls.

Build only the RB-R01 headless domain described in docs/rebirth/05 and 06:
- isolated case definition, schema/reference validation, ReviewState initializer;
- pure reduceReview, deriveSupport, visibleCaseView, validateHandoff;
- Evidence vs Claim vs Adoption separation, acquired/observed guards;
- check costs/idempotency, withdrawal/undo, handoff scope and replay;
- deterministic fixtures F01–F13, especially no hidden source disclosure and
  withdrawing one source while another sufficient independent source remains.

Use the smallest new isolated source/test area agreed in the independent review.
Do not import production global state, alter existing legal rules, replace the app entry,
modify old save keys, implement the full UI, add a framework, or deploy.
Run existing relevant regression checks and report failures without deleting them.
Deliver a Draft PR with changed file list, domain contracts, evidence of invariants,
remaining ambiguities, and an honest estimate for the one-case UI. Stop after this spike.
```

이후 UI 임무는 독립 review와 domain gate 결과를 보고 별도로 정한다. 현재 production의 NaN/정보누설/CI target 문제를 먼저 고칠 필요가 있으면 **기존 제품 maintenance PR**로 따로 범위를 승인한다. 새 게임 설계 PR에 숨겨 수정하지 않는다.
