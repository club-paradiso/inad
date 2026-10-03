// Data extracted verbatim from the v6.1 baseline (legacy/v6.1) — release/legal baseline metadata and the statutory refusal reason catalogue
// Legal/game content: do not edit without a documented review (docs/legal-baseline.md).
export const RELEASE = {version:'10.0',label:'RELEASE',legalBaseline:'2026-09-07',dataVersion:'6.1',saveSchema:1,build:'2026.10.03',laws:[
 {name:'출입국관리법',lawId:'001707',effective:'2026.01.23',note:'현행'},
 {name:'난민법',lawId:'011546',effective:'2016.12.20',note:'현행'},
 {name:'난민법 시행령',lawId:'011878',effective:'2025.09.19',note:'현행'},
 {name:'형사소송법',lawId:'001671',effective:'2026.07.01',note:'현행'}
],
// Amendments after the baseline date, with their effective date (Asia/Seoul). Metadata only: no verdict reads it.
// Reviewed in docs/legal-review.md (item 3): the 긴급체포 requirements of 제200조의3 are unchanged in the 2026-10-02 text.
scheduled:[{law:'형사소송법',effective:'2026-10-02',note:'형사소송법 일부개정 조항이 2026.10.02부터 시행됩니다. 본 빌드의 법령 기준일은 2026.09.07이며, 긴급체포(제200조의3) 요건은 시행본과 대조해 변경이 없음을 확인했습니다. 그 밖의 인용 조문은 별도 검토 대상입니다.'}]};
// localStorage keys that make up a save bundle (unchanged since v6.1 for compatibility)
export const SAVE_KEYS = ['inad-meta-v54','inad-progress-v54','inad-campaign-v58','inad-contrast','inad-font','inad-guidance','inad-reduce-motion','inad-shortcut-hints','inad-tutorial-seen','inadBest'];
// [code, label, statutory basis]
export const REFUSAL_REASONS = [
['SIM-A12-DOC','유효한 여권·사증 요건 미충족','출입국관리법 제12조제3항제1호 및 제4항'],
['SIM-A12-KETA','사전여행허가 요건 미충족','출입국관리법 제12조제3항제1호의2 및 제4항'],
['SIM-A12-PUR','입국목적과 체류자격 불일치 또는 목적 소명 실패','출입국관리법 제12조제3항제2호 및 제4항'],
['SIM-BIO-REF','생체정보 제공·본인확인 절차 불응','출입국관리법 제12조의2제2항'],
['SIM-A11-SEC','대한민국의 이익 또는 공공안전 위해 우려','출입국관리법 제11조제1항제3호 + 제12조제3항제4호'],
['SIM-A11-ORD','경제·사회질서 또는 선량한 풍속 저해 우려','출입국관리법 제11조제1항제4호 + 제12조제3항제4호'],
['SIM-A11-DEPORT','강제퇴거 후 5년 미경과','출입국관리법 제11조제1항제6호 + 제12조제3항제4호']];
