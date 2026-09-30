/**
 * ARD Test & Debug Systems - In-Page Floating Extension & Injection Widget
 * Docks onto external target websites (such as http://192.168.0.141/login).
 * Injected via Chrome/Edge extension or 1-Click Bookmarklet.
 */
(function() {
  if (window.__ARD_QA_WIDGET_LOADED__) {
    console.log('[ARD QA] Widget already active on this webpage.');
    const existing = document.getElementById('ard-floating-root');
    if (existing) {
      existing.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }
  window.__ARD_QA_WIDGET_LOADED__ = true;

  // Hub URL where ARD Test & Debug Systems is hosted
  const ARD_HUB_URL = window.__ARD_HUB_URL__ || (
    document.currentScript && document.currentScript.src 
      ? new URL(document.currentScript.src).origin 
      : window.location.origin
  );

  // Capture console errors on this external webpage
  const capturedLogs = [];
  const origConsoleError = console.error;
  console.error = function(...args) {
    capturedLogs.push({
      type: 'error',
      message: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
      timestamp: new Date().toLocaleTimeString()
    });
    origConsoleError.apply(console, args);
  };

  window.addEventListener('error', function(e) {
    capturedLogs.push({
      type: 'error',
      message: e.message + ' at ' + (e.filename || '') + ':' + (e.lineno || ''),
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Inject styles
  const style = document.createElement('style');
  style.id = 'ard-widget-styles';
  style.textContent = `
    #ard-floating-root {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
      direction: ltr;
    }
    #ard-orb-badge {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, #e11d48, #4f46e5);
      box-shadow: 0 10px 25px -4px rgba(225, 29, 72, 0.45), 0 6px 12px -3px rgba(79, 70, 229, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #ffffff;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    }
    #ard-orb-badge:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 14px 28px -4px rgba(225, 29, 72, 0.6);
    }
    #ard-orb-menu {
      display: none;
      position: absolute;
      bottom: 64px;
      right: 0;
      width: 310px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.7);
      padding: 14px;
      color: #f8fafc;
      animation: ardFadeUp 0.18s ease-out forwards;
    }
    @keyframes ardFadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ard-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 6px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      text-decoration: none;
      box-sizing: border-box;
      transition: background 0.15s;
    }
    .ard-btn-primary {
      background: #e11d48;
      color: #ffffff;
    }
    .ard-btn-primary:hover {
      background: #be123c;
    }
    .ard-btn-secondary {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
    }
    .ard-btn-secondary:hover {
      background: #334155;
      color: #ffffff;
    }
  `;
  document.head.appendChild(style);

  // Create DOM root
  const root = document.createElement('div');
  root.id = 'ard-floating-root';
  root.innerHTML = `
    <div id="ard-orb-menu">
      <div style="display:flex;align-items:center;justify-content:between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #1e293b;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:24px;height:24px;border-radius:6px;background:rgba(225,29,72,0.2);display:flex;align-items:center;justify-content:center;color:#f43f5e;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>
          </div>
          <div>
            <div style="font-size:12px;font-weight:700;">ARD In-Page Bug Tool</div>
            <div style="font-size:10px;color:#94a3b8;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${window.location.hostname}</div>
          </div>
        </div>
        <button id="ard-close-menu" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;line-height:1;padding:4px;margin-left:auto;">&times;</button>
      </div>

      <button id="ard-action-report" class="ard-btn ard-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
        <span>Report Bug on this Page</span>
      </button>

      <button id="ard-action-hub" class="ard-btn ard-btn-secondary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
        <span>Open ARD QA Dashboard</span>
      </button>

      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1e293b;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between;align-items:center;">
        <span>Errors caught: <b id="ard-err-count" style="color:#f43f5e;">0</b></span>
        <span style="color:#818cf8;">v2.5.0</span>
      </div>
    </div>

    <div id="ard-orb-badge" title="ARD Test & Debug: Click to log bug on this site">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="m8 2 1.88 1.88"/>
        <path d="M14.12 3.88 16 2"/>
        <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
        <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6 6"/>
        <path d="M12 20v-9"/>
        <path d="M6.53 9C4.6 8.8 3 7.1 3 5"/>
        <path d="M6 13H2"/>
        <path d="M3 21c0-2.1 1.7-3.9 3.8-4"/>
        <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/>
        <path d="M22 13h-4"/>
        <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
      </svg>
    </div>
  `;
  document.body.appendChild(root);

  const badge = document.getElementById('ard-orb-badge');
  const menu = document.getElementById('ard-orb-menu');
  const closeBtn = document.getElementById('ard-close-menu');
  const reportBtn = document.getElementById('ard-action-report');
  const hubBtn = document.getElementById('ard-action-hub');
  const errCountSpan = document.getElementById('ard-err-count');

  badge.addEventListener('click', () => {
    const isShowing = menu.style.display === 'block';
    menu.style.display = isShowing ? 'none' : 'block';
    if (errCountSpan) errCountSpan.textContent = capturedLogs.length;
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.style.display = 'none';
  });

  reportBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    const currentUrl = window.location.href;
    const targetUrl = ARD_HUB_URL + '?action=report&url=' + encodeURIComponent(currentUrl) +
      '&viewport=' + encodeURIComponent(window.innerWidth + 'x' + window.innerHeight);
    window.open(targetUrl, '_blank');
  });

  hubBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    window.open(ARD_HUB_URL, '_blank');
  });

  console.log('[ARD QA] Floating Bug Tool docked onto external site:', window.location.href);
})();
