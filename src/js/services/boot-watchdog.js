// Minimal, dependency-free boot watchdog.
// This is intentionally safe to load before the rest of the application so a client-side
// exception cannot leave users staring at what looks like an endless loading state.
// It is imported first by `app.js` (the browser entry) and must never be imported by engines or
// shared services: those modules also run under node:test, where `window` does not exist.

const failures = [];

function errorText(value) {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value || 'Unknown error');
  }
}

function remember(value) {
  const text = errorText(value);
  if (text && !failures.includes(text)) failures.push(text);
}

export function installBootWatchdog({ timeoutMs = 4000 } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (window.__inadBootWatchdog) return true;
  window.__inadBootWatchdog = true;

  window.addEventListener('error', (event) => {
    remember(event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    remember(event.reason);
  });

  // Normal boot is synchronous after DOMContentLoaded; four seconds leaves generous headroom on
  // slower mobile devices while still turning a silent hang into an actionable failure state.
  setTimeout(showBootFailure, timeoutMs);
  return true;
}

function coreBooted() {
  const seed = document.getElementById('sessionSeed')?.textContent?.trim();
  return Boolean(seed && seed !== '------');
}

function showBootFailure() {
  if (coreBooted() || document.getElementById('bootFailureNotice')) return;

  const start = document.getElementById('startOverlay');
  if (!start) {
    console.error('[INAD] Core boot did not complete and #startOverlay is missing.', failures);
    return;
  }

  const notice = document.createElement('section');
  notice.id = 'bootFailureNotice';
  notice.setAttribute('role', 'alert');
  notice.setAttribute('aria-live', 'assertive');
  notice.style.cssText = [
    'margin:16px auto',
    'max-width:760px',
    'padding:16px 18px',
    'border:1px solid #b44747',
    'border-radius:10px',
    'background:#2a1518',
    'color:#fff',
    'font:14px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'box-sizing:border-box'
  ].join(';');

  const title = document.createElement('strong');
  title.textContent = '초기화 오류 / Boot error';
  title.style.cssText = 'display:block;margin-bottom:6px;font-size:16px';

  const body = document.createElement('p');
  body.textContent = '시뮬레이터 초기화가 완료되지 않았습니다. 페이지를 새로고침해 복구할 수 있습니다.';
  body.style.cssText = 'margin:0 0 12px';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '새로고침 / Reload';
  button.style.cssText = 'padding:8px 12px;border:1px solid currentColor;border-radius:7px;background:transparent;color:inherit;font:inherit;cursor:pointer';
  button.addEventListener('click', () => location.reload());

  notice.append(title, body, button);
  start.prepend(notice);

  console.error('[INAD] Core boot did not complete.', failures);
}

installBootWatchdog();
