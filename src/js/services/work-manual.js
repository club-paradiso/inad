// Searchable public-source work manual overlay.
// This intentionally presents only statutes and public official guidance; it does not pretend
// to reproduce Ministry of Justice internal manuals, internal systems or non-public criteria.
import { WORK_GUIDES, workGuideById } from '../../data/work-guides.js';
import { sourceById } from '../../data/legal-sources.js';
import { showModal } from '../ui/modals.js';
import { byId, esc } from '../ui/dom.js';

const isEn = () => document.documentElement.lang === 'en' || document.documentElement.dataset.locale === 'en';
const t = (ko, en) => isEn() ? en : ko;
let lastQuery = '';

function guideText(g) {
  return [g.categoryKo, g.categoryEn, g.titleKo, g.titleEn, g.summaryKo, g.summaryEn, ...(g.stepsKo || []), ...(g.stepsEn || [])].join(' ').toLowerCase();
}
function sourceRows(ids = []) {
  return ids.map(sourceById).filter(Boolean).map((s) => `<div class="rule"><h3>${esc(s.title)}</h3><p><b>${esc(s.authority || '')}</b>${s.checked ? ` · ${t('확인', 'checked')} ${esc(s.checked)}` : ''}</p>${s.note ? `<p>${esc(s.note)}</p>` : ''}<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${t('공식 원문 열기', 'Open official source')}</a></p></div>`).join('');
}
function renderCards(query = '') {
  const q = query.trim().toLowerCase();
  const rows = q ? WORK_GUIDES.filter((g) => guideText(g).includes(q)) : WORK_GUIDES;
  const host = byId('manualResults');
  const count = byId('manualCount');
  if (count) count.textContent = t(`${rows.length}개 항목`, `${rows.length} items`);
  if (!host) return;
  host.innerHTML = rows.length ? rows.map((g) => `<button type="button" class="help-card" data-manual-guide="${esc(g.id)}"><b>${esc(isEn() ? g.titleEn : g.titleKo)}</b><span>${esc(isEn() ? g.summaryEn : g.summaryKo)}</span><em>${esc(isEn() ? g.categoryEn : g.categoryKo)}</em></button>`).join('') : `<div class="rule"><h3>${t('검색 결과 없음', 'No matching guide')}</h3><p>${t('다른 키워드로 검색하십시오.', 'Try a different keyword.')}</p></div>`;
}

export function openWorkManual(query = lastQuery) {
  lastQuery = query || '';
  showModal(t('업무지침 · 공개자료 기반', 'Work Manual · Public Sources'), `<div class="settings-grid"><section class="settings-section"><h3>${t('업무지침 검색', 'Search work guidance')}</h3><p>${t('법령·법무부·HiKorea 등 공개자료를 사건 처리 순서로 재구성한 교육용 체크리스트입니다. 실제 비공개 내부 편람이나 위험선별 기준을 재현하지 않습니다.', 'Educational checklists reorganized from statutes and public Ministry of Justice / HiKorea guidance. This does not reproduce non-public internal manuals or screening criteria.')}</p><div class="setting-row"><div class="setting-copy"><b>${t('검색', 'Search')}</b><span>${t('예: K-ETA, 입국목적, 난민, 생체정보', 'e.g. K-ETA, purpose, refugee, biometrics')}</span></div><input id="manualSearch" type="search" value="${esc(lastQuery)}" placeholder="${t('업무지침 검색', 'Search work manual')}" autocomplete="off"></div><div class="setting-row"><div class="setting-copy"><b>${t('현재 자료', 'Available guidance')}</b><span id="manualCount"></span></div><button type="button" id="manualSources">${t('출처 등록부 보기', 'Open source registry summary')}</button></div></section><section class="settings-section"><div class="help-grid" id="manualResults"></div></section></div>`, { size: 'wide' });
  renderCards(lastQuery);
  const input = byId('manualSearch');
  if (input) input.oninput = () => { lastQuery = input.value; renderCards(lastQuery); };
  const host = byId('manualResults');
  if (host) host.onclick = (e) => { const b = e.target.closest?.('[data-manual-guide]'); if (b) openGuide(b.dataset.manualGuide); };
  const src = byId('manualSources');
  if (src) src.onclick = () => openSourceSummary();
}

function openGuide(id) {
  const g = workGuideById(id); if (!g) return;
  const steps = isEn() ? g.stepsEn : g.stepsKo;
  showModal(isEn() ? g.titleEn : g.titleKo, `<div class="settings-grid"><section class="settings-section"><h3>${esc(isEn() ? g.categoryEn : g.categoryKo)}</h3><p>${esc(isEn() ? g.summaryEn : g.summaryKo)}</p><div class="rulegrid">${steps.map((step, i) => `<div class="rule"><h3>${String(i + 1).padStart(2, '0')}</h3><p>${esc(step)}</p></div>`).join('')}</div></section><section class="settings-section"><h3>${t('근거 확인', 'Verify sources')}</h3><p>${t('아래 자료는 게임 내부문서가 아니라 확인 가능한 공개 원문입니다.', 'These are verifiable public sources, not fictional internal documents.')}</p><div class="rulegrid">${sourceRows(g.sources)}</div></section><button type="button" id="manualBack">${t('업무지침 목록으로', 'Back to work manual')}</button></div>`, { size: 'wide' });
  const back = byId('manualBack'); if (back) back.onclick = () => openWorkManual(lastQuery);
}
function openSourceSummary() {
  const ids = [...new Set(WORK_GUIDES.flatMap((g) => g.sources || []))];
  showModal(t('업무지침 · 출처 확인', 'Work Manual · Source Verification'), `<div class="settings-grid"><section class="settings-section"><h3>${t('공개 출처', 'Public sources')}</h3><p>${t('업무지침 카드에서 사용하는 법령·공식 안내의 등록정보입니다.', 'Registry information for statutes and official guidance used by the work-manual cards.')}</p><div class="rulegrid">${sourceRows(ids)}</div></section><button type="button" id="manualBack">${t('업무지침 목록으로', 'Back to work manual')}</button></div>`, { size: 'wide' });
  const back = byId('manualBack'); if (back) back.onclick = () => openWorkManual(lastQuery);
}

function syncMenuLabel() {
  const b = byId('ruleBtn'); if (b) b.textContent = t('업무지침', 'Work Manual');
}
function intercept(e) {
  const target = e.target.closest?.('#ruleBtn, #helpRules');
  if (!target) return;
  e.preventDefault(); e.stopImmediatePropagation();
  openWorkManual();
}

document.addEventListener('click', intercept, true);
document.addEventListener('inad:localechange', syncMenuLabel);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncMenuLabel); else syncMenuLabel();
