# INAD REBIRTH — Phase 0 / 1

조사일: **2026-10-19 UTC** · 기준: [`2bbdb4d8c5936640b8790e430aaa21b360b7d901`](https://github.com/club-paradiso/inad/commit/2bbdb4d8c5936640b8790e430aaa21b360b7d901) · 권고: **PIVOT, 단일 사건 실험에 한정**.

이 문서는 현재 제품의 감사와 미구현 설계 제안이다. 새 게임의 재미·독창성·시장성은 검증되지 않았다. 기존 프로덕션, 엔진, 사건 데이터, 저장 형식, 디자인 토큰, 생성 HTML, `legacy/`를 변경하지 않는다. Phase 0/1의 문서 커밋과 Draft PR만 승인된 작업이다.

## 읽는 순서

| 문서 | 결정에 필요한 내용 |
|---|---|
| [00_EXECUTIVE_DECISION.md](00_EXECUTIVE_DECISION.md) | 계속·전환·재구축·중단 중 선택, 결론을 뒤집을 조건 |
| [01_REPOSITORY_FORENSIC_AUDIT.md](01_REPOSITORY_FORENSIC_AUDIT.md) | 기준선, 실제 구조, 재현 오류, 테스트와 배포 증거 |
| [02_COMPETITIVE_ORIGINALITY_AUDIT.md](02_COMPETITIVE_ORIGINALITY_AUDIT.md) | 10개 게임, 동작 단위 비교, IP와 창작 차별화 구분 |
| [03_GAME_DIRECTIONS.md](03_GAME_DIRECTIONS.md) | 다섯 대안, 가중 평가, 상위 두 후보 반론 |
| [04_RECOMMENDED_GAME_DESIGN.md](04_RECOMMENDED_GAME_DESIGN.md) | 플레이어가 실제로 하는 행동과 반복의 변화 |
| [05_TECHNICAL_REBUILD_PLAN.md](05_TECHNICAL_REBUILD_PLAN.md) | 재사용·교체, 제안 ADR, 상태/저장 경계, AI 책임 |
| [06_VERTICAL_SLICE_SPEC.md](06_VERTICAL_SLICE_SPEC.md) | 한 사건의 정사, 입력/출력, 상태, UI, fixture |
| [07_VALIDATION_AND_ROADMAP.md](07_VALIDATION_AND_ROADMAP.md) | 8–12명 외부 검증, 중단 기준, 비용/일정 범위 |
| [08_INDEPENDENT_REVIEW_HANDOFF.md](08_INDEPENDENT_REVIEW_HANDOFF.md) | Claude Code 독립 검토 및 승인 후 첫 구현 임무 |
| [evidence/README.md](evidence/README.md) | 실행 로그, 재현 명령, 브라우저 관찰 범위 |

## 증거 표기

- **VERIFIED**: 직접 읽은 소스, 이번 실행 결과, 이번 브라우저 관찰. 소스가 존재한다는 사실과 사용자 경험이 정상이라는 사실은 별개다.
- **DOCUMENTED**: 기존 README·기획·릴리스 노트의 주장. 실행 증거로 대체하지 않는다.
- **EXTERNALLY VERIFIED**: 개발자 자료·공식 상점 설명·공적 법률자료에서 확인. 경쟁작을 이번에 직접 플레이했다는 뜻은 아니다.
- **INFERRED**: 위 증거에서 도출한 해석·전략 판단.
- **PROPOSED**: 미구현 설계, 목표, 예산, 테스트 기준.
- **UNKNOWN**: 이번 작업에서 확인하지 못함.

## 완료와 제한

| 게이트 | 상태와 근거 |
|---|---|
| 저장소·주요 엔진·문서·이력 | 완료, 01 참조 |
| 배포 버전 확인 | 완료, 운영 HTML과 새 로컬 빌드의 SHA-256 일치 |
| 설치/lint/unit/build/integrity/dialogue | 실행 완료, 원문 로그 보관 |
| 새 로컬 E2E | **미완료**: Chromium 다운로드 손상과 실행 파일 부재. 과거 CI 통과와 구분 |
| 운영 데스크톱 플레이 | 부분 완료: 시작→질문→문서→진술 대조 오류, 언어 전환 확인 |
| 운영 모바일·전체 사건 종료·보조공학 | **미검증**: 이번 브라우저 제어에 viewport 설정 없음, 로컬 브라우저 설치 실패 |
| 경쟁작·IP·대안·권고·단일 사건 명세 | 작성 완료, 02–06의 출처와 가정 참조 |
| Figma·자산별 권리 정리 | 원격 metadata 확인: 접근된 snapshot은 v7.2 audit page. v10 디자인 일치·자산별 권리는 **미검증** |
| 외부 사람 플레이테스트 | **실시하지 않음**: 프로토콜만 작성 |
| 독립 Claude 검토 | **실시하지 않음**: `claude` 실행 파일 없음, Opus 5.5 접근 확인 불가 |
| 전용 브랜치와 Draft PR | 이 문서를 포함한 PR에서 확인. main 병합·배포 승인 아님 |

모델명 변경/실행 라우팅을 제어하거나 확인한 것으로 주장하지 않는다. 요청된 Astra Pro 설정을 강제로 적용했다는 증거는 없으며, 제공된 Work 세션에서 작업했다. 처리 토큰 목표를 소진할 목적으로 반복하지 않았다.
