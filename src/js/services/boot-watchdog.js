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

  // Inline styles on purpose (the stylesheet may be what failed), with the token values of danger-soft /
  // danger / danger-text and the dialog radius. One language: the stored UI language, Korean by default.
  let en = false; try { en = localStorage.getItem('inad-locale') === 'en'; } catch { /* storage blocked */ }
  const notice = document.createElement('section');
  notice.id = 'bootFailureNotice';
  notice.setAttribute('role', 'alert');
  notice.style.cssText = [
    'margin:16px auto',
    'max-width:760px',
    'padding:16px',
    'border:1px solid #a33239',
    'border-radius:6px',
    'background:#f5e3e4',
    'color:#81272e',
    'font:14px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'box-sizing:border-box'
  ].join(';');

  const title = document.createElement('strong');
  title.textContent = en ? 'Boot error' : '초기화 오류';
  title.style.cssText = 'display:block;margin-bottom:8px;font-size:16px';

  const body = document.createElement('p');
  body.textContent = en ? 'The simulator did not finish starting. Reloading the page usually recovers it.' : '시뮬레이터 초기화가 완료되지 않았습니다. 페이지를 새로고침해 복구할 수 있습니다.';
  body.style.cssText = 'margin:0 0 12px';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = en ? 'Reload' : '새로고침';
  button.style.cssText = 'min-height:44px;padding:8px 12px;border:1px solid currentColor;border-radius:4px;background:#fff;color:inherit;font:inherit;cursor:pointer';
  button.addEventListener('click', () => location.reload());

  notice.append(title, body, button);
  start.prepend(notice);

  console.error('[INAD] Core boot did not complete.', failures);
}

installBootWatchdog();
