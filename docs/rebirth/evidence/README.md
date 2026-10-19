# Evidence register — 2026-10-19 UTC

기준 SHA `2bbdb4d8c5936640b8790e430aaa21b360b7d901`. 아래 파일은 이번 로컬 실행 결과다. E2E 로그는 Git 공백 검사를 위해 행 끝 공백만 정리했으며 출력 내용은 보존했다. 일부 npm 프록시 환경 경고는 명령 성공과 별개다. 로그의 `held-out`은 저장소의 기존 fixture 이름이지 이번에 새로 모집한 사람 데이터가 아니다.

## 환경과 명령

Linux, Node **v24.19.0**, npm **11.9.0**. CI는 `.github/workflows/ci.yml`의 Node22를 사용하므로 완전히 동일한 환경은 아니다.

```sh
git clone https://github.com/club-paradiso/inad.git
cd inad
git rev-parse HEAD
npm ci
npm run lint
npm run test:unit
npm run build
npm run test:integrity
npm run eval:dialogue
npx playwright install chromium
npm run test:e2e -- --max-failures=1
git diff --exit-code -- index.html
cmp AGENTS.md CLAUDE.md
sha256sum legacy/v6.1/INAD_Article12_v6_1_KR.html
```

| 원문 | 결과 |
|---|---|
| [install.log](install.log) | 설치 성공 |
| [lint.log](lint.log) | 84 modules, 58 tooling parse 성공 |
| [unit.log](unit.log) | 147 passed, 0 failed |
| [build.log](build.log) | DOM ID91, marker7, portrait105, 1697KB |
| [integrity.log](integrity.log) | 10 passed |
| [dialogue.log](dialogue.log) | tuned152/152, held-out145/145; provider 미실행 |
| [browser-install.log](browser-install.log) | Chromium ZIP 손상으로 다운로드 실패 |
| [e2e.log](e2e.log) | 실행 파일 부재: 1 failed, 1 interrupted, 106 not run |
| [focused-reproduction.log](focused-reproduction.log) | 미조회 정보 공개, NaN, 미해제 후속질문, Lock 필수 토큰0 |
| [deployed-artifact.json](deployed-artifact.json) | 운영 HTTP 본문과 fresh build byte/hash 동일 |

운영 본문은 `https://inad-gray.vercel.app/`에서 HTTP GET으로 받았다. 크기 1,738,139 bytes. SHA-256 `c7c44546a0fbf28abf1aeb40a954d6b9d266cb08f651d9dbe6ccb0d1341fa47c`. 외부 API의 현재 응답이나 서버 환경 변수까지 동일함을 보장하지 않는다. legacy SHA-256 `53bee5c1a4fe72a78f5e42eca1f3de0e11623e5d2ded752e995116c742a3a812`도 이번에 일치 확인.

## 최소 소스 재현

저장소 파일을 수정하지 않고 아래 Node 입력으로 같은 경계를 확인할 수 있다. 수치/프로필을 UI 전체 초기화 없이 만드는 격리 probe이며 실제 화면 재현으로 보완했다.

```sh
node --input-type=module <<'JS'
import './tests/unit/setup.js';
import { CASES } from './src/data/cases.js';
import { state } from './src/js/state.js';
import { evaluateStatementLock } from './src/js/engines/statement-lock-engine.js';
import { questionUnlocked } from './src/js/engines/clue-engine.js';
const c = CASES.find(x => x.id === 'ICN-S2-005');
state.performed = ['QUESTION_contact'];
state.looked = new Set();
state.discoveredClues = new Set();
state.behavior = { stress: 41, rapport: 74 };
const result = evaluateStatementLock(
  { questionId: 'contact', text: c.questions.find(q => q.id === 'contact').a },
  { type: 'doc', key: 'E-ARRIVAL', fieldName: '연락처' }, c);
console.log({ result, looked: [...state.looked], performed: state.performed,
  stress: String(state.behavior.stress), finite: Number.isFinite(state.behavior.stress),
  jobOfferUnlocked: questionUnlocked(c.questions.find(q => q.id === 'jobOffer'), state.performed) });
JS
```

관찰: `ok:true`, `clueId:tm4`, 조회0, `stress:'NaN'`, `jobOfferUnlocked:false`. 후속질문에는 별도로 `QUESTION_occupation`과 `LOOKUP_contact`가 필요하다. `unlockQuestions` 선언만으로 해제된다고 문서화하면 안 된다.

## 운영 브라우저 관찰 — 직접 확인

Cloud browser, **1363×936 CSS px**, 2026-10-19. 시작 화면에 v10.0 표시. 그 시점의 가로 overflow 없음. 대표 시작 버튼, 통역, 제안질문, 대조 dialog, 문서 필드, 한/영 전환을 직접 조작했다.

1. `인터뷰 시작` → ICN-S2-005.
2. `통역 호출`.
3. 제안질문 `국내 연락처 010-0000-0202는 누구입니까?`.
4. 답변 `친구의 친구입니다. 정확한 이름은 모릅니다.` 뒤 `진술 대조: 증거자료와 대조`.
5. **조회 버튼은 누르지 않은 채** 전자입국신고 문서의 연락처 번호 선택.
6. ‘전산망상 불법취업 알선 번호로 확인’ 문구와 새 단서, 긴장도 `NaN` 관찰.
7. English 전환 후 chrome 일부는 영어, 질문·대사·대조/coach 일부는 한국어로 남음.

임의 JS로 게임 상태를 조작하지 않았다. 위 Node probe와 별개로 정상 UI 입력만 사용했다. 전체 처분→디브리핑→다음 승객은 이번 수동 플레이에서 완료하지 않았다. 모바일 viewport 변경 API가 제공되지 않았고 로컬 Playwright 브라우저 설치도 실패해 모바일 직접 관찰은 없다. 기존 CI의 모바일 관련 검사는 과거 자동 증거일 뿐이다.

## GitHub 원격 증거 — 로컬 재실행과 구분

- [기준 커밋](https://github.com/club-paradiso/inad/commit/2bbdb4d8c5936640b8790e430aaa21b360b7d901), [PR18](https://github.com/club-paradiso/inad/pull/18).
- [CI run37096281243](https://github.com/club-paradiso/inad/actions/runs/37096281243), [verify job111126771716](https://github.com/club-paradiso/inad/actions/runs/37096281243/job/111126771716): 2026-10-03 로그를 이번에 읽음. dist108 passed. legacy19 passed /86 skipped /3 failed. 세 실패는 `playtest-cohorts.spec.js`가 v6.1에 없는 `#liveStartBtn`을 기대한 A/B/C 흐름. 다음 src parity 단계는 skip. source-integrity job은 success.
- GitHub commit-status의 Vercel success 및 Production deployment ID6823184738이 기준 SHA를 가리킴. 사이트 HTML 일치로 배포 상태를 별도 확인.
- 기본 branch main, tag v10.0.0, GitHub Releases API 빈 배열, PR2–18 모두 merged, non-PR issue1 closed를 조회. 공개 이슈에 없다는 이유로 제품 결함이 없다고 해석하지 않는다.

원격 로그 수치는 역사적 결과다. 최신 PR의 CI나 2026-10-19 local E2E 성공으로 재표현하지 않는다. API 원본 전체는 계정/사용자 정보의 불필요한 복제를 피하기 위해 커밋하지 않고, 필요한 링크와 결과만 기록했다.

## Figma 읽기 전용 확인

[지정 파일](https://www.figma.com/design/l2pIaUKNdiFnzpDMsUnFy8)의 metadata를 조회했다. 접근된 snapshot의 top-level page는 `2:2`, `01 — Current Product Audit` 한 개였다. page 조회는 section `37:2`의 v7.2/main845d74c 표기, desktop `37:4` 1440×1000, mobile `37:54` 390×844 구조 와이어프레임을 반환했다. [원문 XML](figma-audit-metadata.xml)을 보관한다. 이 과거 구조 자료는 현재 v10의 모바일 플레이 성공 또는 최신 디자인 동기화의 증거가 아니다. canvas를 변경하지 않았다.

Desktop frame `37:4`의 screenshot도 도구의 inline image로 직접 확인했다. 문서·질문·판단 패널을 표시한 과거 구조 와이어프레임이며, 현재 실행 화면의 캡처가 아니다. screenshot asset URL의 직접 다운로드는 HTML `Site Unavailable`을 반환해 이미지 파일로 사용하지 않았다. metadata·inline screenshot 열람 성공과 HTTP asset 다운로드 실패를 구분한다.
