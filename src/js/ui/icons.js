// Inline SVG icon set (documents + UI). Monochrome, stroke-based, inherits currentColor.
const base = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const DOC = {
  'PASSPORT': '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 10h6M12 7c1 2 1 4 0 6M8 16h8"/>',
  'E-ARRIVAL': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h5M8 16h4"/><path d="m14 16 2 2 4-5"/>',
  'PNR': '<path d="M3 11h18M6 8l3 3-3 3M18 5v14"/><path d="M12 7l5-3v6z"/>',
  'BOARDING': '<path d="M3 8h18v8H3z"/><path d="M8 8v8M15 8v8M5 12h1M10 12h3M17 12h2"/>',
  'HOTEL': '<path d="M4 20V6h11v14M15 10h5v10M7 9h2M11 9h2M7 13h2M11 13h2M7 17h2M11 17h2M17 13h1M17 16h1"/>',
  'STAY': '<path d="M4 19h16M6 19V9l6-5 6 5v10M9 19v-5h6v5"/>',
  'VISA': '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="3"/><path d="M14 9h4M14 12h4M14 15h3"/>',
  'ENTRY BASIS': '<path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/><path d="m8 12 2.5 2.5L16 9"/>',
  'RESIDENCE CARD': '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="2.5"/><path d="M5.5 16c1-2 4-2 5 0M13 9h5M13 12h5M13 15h4"/>',
  'ABTC': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  'BIOMETRIC': '<path d="M7 4c3-2 7-2 10 0M5 7c4-3 10-3 14 0M5 11c0 6 3 9 7 9M19 11c0 5-2 8-5 10M8 10c0 4 1 7 4 9M16 10c0 4-1 7-3 9M12 9c1 0 2 1 2 3 0 3-1 5-2 7"/>',
  'WATCHLIST': '<path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/><path d="M12 8v5M12 16h.01"/>',
  'INVITATION': '<path d="M4 5h16v14H4zM4 8l8 5 8-5"/>',
  'BUSINESS': '<rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V4h6v3M4 12h16M10 12v2h4v-2"/>',
  'SUPPORTING': '<path d="M6 3h9l4 4v14H6zM15 3v5h5M9 12h6M9 16h6"/>'
};
const UI = {
  clear: '<path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/><path d="m8 12 2.5 2.5L16 9"/>',
  secondary: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4M8 11h6M11 8v6"/>',
  refuse: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  sjp: '<path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/><path d="M9 12h6M12 9v6"/>',
  history: '<path d="M4 6v5h5"/><path d="M5 11a7 7 0 1 0 2-5"/><path d="M12 8v4l3 2"/>',
  visa: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 9h8M8 13h6"/>',
  plane: '<path d="M3 11h18M8 11 5 7M8 11l-3 4M16 11l3-6M16 11l3 6"/>',
  contact: '<circle cx="9" cy="8" r="3"/><path d="M4 19c0-4 2-6 5-6s5 2 5 6M16 10h4M18 8v4"/>',
  party: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 20c0-4 3-6 6-6s6 2 6 6M14 14c3 0 6 2 6 6"/>',
  public: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9"/>',
  zoom: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4M9 11h4M11 9v4"/>',
  speaker: '<path d="M4 14h3l5 4V6L7 10H4z"/><path d="M16 9c1.8 1.7 1.8 4.3 0 6M19 6c3.5 3.3 3.5 8.7 0 12"/>'
};
export const docIcon = (type) => base(DOC[type] || DOC.SUPPORTING);
export const uiIcon = (name) => `<svg class="ui-svg" viewBox="0 0 24 24" aria-hidden="true">${UI[name] || UI.public}</svg>`;
