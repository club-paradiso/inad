# Legal baseline (frozen for v7.0)

- 공개 검증 기준일: **2026-09-07** (`src/data/legal-baseline.js` `RELEASE.legalBaseline`)
- 표시 법령: 출입국관리법(2026-01-23 시행), 난민법(2016-12-20), 난민법 시행령(2025-09-19), 형사소송법(2026-07-01; 2026-10-02 일부 시행 예정 개정은 기준일과 구분해 표시)
- 게임 판정 로직은 v6.1과 동일하게 동결되었습니다. v7.0은 렌더링·아키텍처 재구축 릴리스이며 법률 재검증 릴리스가 아닙니다.

## 구현된 상태 구분 (합치지 않음)
| 상태/절차 | 구현 위치 |
|---|---|
| 입국심사 (PRIMARY) / 입국재심 (SECONDARY) — 제12조 심사의 계속 | `legal-engine.validateSecondary`, `case-engine.secondary` |
| 입국허가 (ADMITTED) | `validateClear` |
| 입국불허 (ENTRY_REFUSED) — 제12조제3항·제4항, 제12조의2, 제11조 사유 7종 | `validateRefusal`, `REFUSAL_REASONS` |
| 송환지시 → 출국대기실 — 제76조, 제76조의2 | `procedureAction('repat-order' / 'waiting-room')` |
| 난민신청 → 회부심사 → 불회부 → 입국심사 복귀 — 난민법 제6조, 시행령 제5조 | `refugeeFlow`, `procedureAction('start-referral' / 'non-referral' / 'return-to-entry')` |
| 출입국사범 조사 · 감식 · 통역(제48조제6항) · 긴급체포 요건검토(형사소송법 제200조의3) | `validateSjpEntry`, `validateInvestigation`, `validateArrestReview`, `validateArrestExecution` |

## 불변식 (테스트로 보장)
- 국적은 입국기반 산정에만 사용 (`tests/unit/invariants.test.js`).
- 긴장도·협조도·언어능력·통역·동행 여부·난이도·시나리오·캠페인 이월은 판정에 영향 없음.
- 불회부 ≠ 입국불허, 재심 ≠ 불허, 위조여권 발견 ≠ 자동 체포.

## 열린 검토 사항
`docs/legal-review.md` 참조. 변경은 공식 법령·정부 공개자료 확인 후에만.
