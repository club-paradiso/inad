// "판단 근거" (decision basis) views: workbench panel, result-modal section, source registry dialog.
import { $$, byId, esc } from './dom.js';
import { showModal } from './modals.js';
import { state } from '../state.js';
import { current } from '../engines/queue-engine.js';
import { decisionBasis, overallBasisSummary, STATUS_LABEL, CONFIDENCE_LABEL, LEGAL_SOURCES, DECISION_RULES, DOMAINS } from '../engines/decision-model.js';

const statusChip = (s) => `<span class="basis-status ${s.toLowerCase()}">${STATUS_LABEL[s] || s}</span>`;
function ruleHTML(r) { return `<div class="basis-rule"><div class="basis-rule-head"><b>${esc(r.title)}</b><span class="basis-conf ${r.status.toLowerCase()}">${esc(CONFIDENCE_LABEL[r.status])}</span></div><div class="basis-law">${esc(r.legalBasis)}</div><p>${esc(r.explanation)}</p>${r.sources.length ? `<div class="basis-sources">${r.sources.map((id) => { const s = LEGAL_SOURCES.find((x) => x.id === id); return s ? `<span title="${esc(s.title)} · 확인 ${esc(s.checked)}">${esc(s.title)}${s.effective ? ` (시행 ${esc(s.effective)})` : ''}</span>` : ''; }).join('')}</div>` : ''}</div>`; }
export function basisNodesHTML(nodes, { open = false } = {}) {
  return nodes.map((n) => `<details class="basis-node ${n.status.toLowerCase()}"${open ? ' open' : ''}><summary><span class="basis-domain">${esc(n.label)}</span>${statusChip(n.status)}<span class="basis-summary">${esc(n.summary)}</span></summary><div class="basis-body">${n.rules.map(ruleHTML).join('')}</div></details>`).join('');
}
export function renderBasisPanel() {
  const el = byId('basisBoard'); if (!el) return; const c = current(); if (!c) return;
  const nodes = decisionBasis(c, state); const sum = overallBasisSummary(nodes);
  el.innerHTML = `<div class="basis-head"><span>판단 근거 · 출입국관리법 제12조제3항</span><b>${esc(sum.headline)}</b></div><div class="basis-legend"><span>충족 ${sum.pass}</span><span>추가 확인 ${sum.review}</span><span>미충족 ${sum.fail}</span><span>미확인 ${sum.pending}</span><button type="button" class="basis-registry-btn" id="basisRegistryBtn">법령·출처 등록부</button></div><div class="basis-list">${basisNodesHTML(nodes)}</div><p class="basis-foot">근거 패널은 설명용입니다. 최종 판단은 심사관이 전체 사실관계와 법정 요건을 종합해 내리며, 시뮬레이션 요소는 별도로 표시됩니다.</p>`;
  byId('basisRegistryBtn').onclick = showSourceRegistry;
}
export function basisSectionHTML(c, st) { const nodes = decisionBasis(c, st); const sum = overallBasisSummary(nodes); return `<div class="record-section basis-result"><h3>판단 근거 · ${esc(sum.headline)}</h3><div class="basis-list compact">${basisNodesHTML(nodes)}</div></div>`; }
export function showSourceRegistry() {
  const byTier = [...LEGAL_SOURCES].sort((a, b) => a.tier - b.tier);
  showModal('법령·출처 등록부', `<p class="modal-note">이 시뮬레이션의 판단 근거 노드가 인용하는 공개 자료입니다. 상위 등급(법률 → 시행령 → 시행규칙 → 고시·공고 → 본부 자료 → 하이코리아 → 지방관서 → 기타 정부기관) 자료가 우선하며, 확인일 이후 변경될 수 있습니다.</p><div class="registry-list">${byTier.map((s) => `<div class="registry-row"><div class="registry-tier">T${s.tier}</div><div><b>${esc(s.title)}</b><span>${esc(s.authority)}${s.effective ? ` · 시행 ${esc(s.effective)}` : ''} · 확인 ${esc(s.checked)}${s.lawId ? ` · 법령ID ${esc(s.lawId)}` : ''}</span>${s.note ? `<p>${esc(s.note)}</p>` : ''}<small class="mono">${esc(s.url)}</small></div><em>${DECISION_RULES.filter((r) => r.sources.includes(s.id)).length}개 규칙</em></div>`).join('')}</div><div class="record-section"><h3>판단 영역</h3><div class="registry-domains">${Object.values(DOMAINS).sort((a, b) => a.order - b.order).map((d) => `<span>${esc(d.label)}</span>`).join('')}</div></div><p class="record-warning">확인 상태 표기: ${Object.entries(CONFIDENCE_LABEL).map(([k, v]) => `${k} = ${esc(v)}`).join(' · ')}</p>`, { size: 'wide' });
}
