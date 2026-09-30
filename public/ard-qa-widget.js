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
      message: (e.message || 'Unknown script error') + ' at ' + (e.filename || '') + ':' + (e.lineno || ''),
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
      z-index: 2147483640;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
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
      padding: 9px 12px;
      margin-bottom: 6px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      text-decoration: none;
      box-sizing: border-box;
      transition: all 0.15s;
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

    /* Modal Overlay & Dialog Styles */
    #ard-popup-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 2147483647;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      direction: ltr;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    }
    #ard-popup-dialog {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 20px;
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(225, 29, 72, 0.15);
      color: #f8fafc;
      overflow: hidden;
      animation: ardModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes ardModalIn {
      from { opacity: 0; transform: scale(0.95) translateY(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .ard-modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #111827;
    }
    .ard-modal-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ard-badge-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgba(225, 29, 72, 0.2);
      color: #fb7185;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(225, 29, 72, 0.3);
    }
    .ard-modal-body {
      padding: 18px 20px;
      overflow-y: auto;
      max-height: calc(90vh - 140px);
      box-sizing: border-box;
    }
    .ard-modal-footer {
      padding: 14px 20px;
      border-top: 1px solid #1e293b;
      background: #111827;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
    }
    .ard-input-group {
      margin-bottom: 14px;
    }
    .ard-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 5px;
    }
    .ard-input, .ard-select, .ard-textarea {
      width: 100%;
      padding: 9px 12px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      color: #ffffff;
      font-size: 12px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s;
      font-family: inherit;
    }
    .ard-input:focus, .ard-select:focus, .ard-textarea:focus {
      border-color: #6366f1;
    }
    .ard-textarea {
      resize: vertical;
      min-height: 60px;
    }
    .ard-priority-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .ard-p-btn {
      padding: 7px 6px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid #334155;
      background: #1e293b;
      color: #cbd5e1;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
    }
    .ard-p-btn.active-emergency {
      background: rgba(225, 29, 72, 0.2);
      border-color: #e11d48;
      color: #fb7185;
    }
    .ard-p-btn.active-high {
      background: rgba(249, 115, 22, 0.2);
      border-color: #f97316;
      color: #fb923c;
    }
    .ard-p-btn.active-normal {
      background: rgba(234, 179, 8, 0.2);
      border-color: #eab308;
      color: #fde047;
    }
    .ard-p-btn.active-low {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
      color: #60a5fa;
    }
    .ard-context-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1e293b;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      color: #94a3b8;
      border: 1px solid #334155;
      margin-right: 6px;
      margin-bottom: 8px;
    }
  `;
  document.head.appendChild(style);

  // Create DOM root
  const root = document.createElement('div');
  root.id = 'ard-floating-root';
  root.innerHTML = `
    <div id="ard-orb-menu">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #1e293b;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:24px;height:24px;border-radius:6px;background:rgba(225,29,72,0.2);display:flex;align-items:center;justify-content:center;color:#f43f5e;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>
          </div>
          <div>
            <div style="font-size:12px;font-weight:700;">ARD In-Page Bug Tool</div>
            <div style="font-size:10px;color:#94a3b8;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${window.location.hostname}</div>
          </div>
        </div>
        <button id="ard-close-menu" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:18px;line-height:1;padding:4px;margin-left:auto;">&times;</button>
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
        <span style="color:#818cf8;">v2.6.0</span>
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

  // In-Page Popup Modal: "Register New Bug / Problem"
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'ard-popup-overlay';
  modalOverlay.innerHTML = `
    <div id="ard-popup-dialog">
      <!-- Modal Header -->
      <div class="ard-modal-header">
        <div class="ard-modal-title">
          <div class="ard-badge-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>
          </div>
          <div>
            <div style="font-size:14px;font-weight:700;">Register New Bug / Problem</div>
            <div style="font-size:11px;color:#94a3b8;font-weight:400;">Log defect directly from active webpage into ARD Systems</div>
          </div>
        </div>
        <button id="ard-modal-close-x" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:22px;line-height:1;padding:4px;">&times;</button>
      </div>

      <!-- Modal Body (Form view) -->
      <div class="ard-modal-body" id="ard-modal-form-view">
        <!-- Context Pills -->
        <div style="margin-bottom:12px;">
          <div class="ard-context-pill">
            <span style="color:#6366f1;">Target:</span>
            <span id="ard-modal-target-url" style="color:#f8fafc;font-weight:600;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${window.location.href}</span>
          </div>
          <div class="ard-context-pill">
            <span style="color:#38bdf8;">Viewport:</span>
            <span id="ard-modal-viewport" style="color:#f8fafc;">${window.innerWidth}x${window.innerHeight}</span>
          </div>
          <div class="ard-context-pill" id="ard-modal-errors-pill">
            <span style="color:#f43f5e;">Errors:</span>
            <span id="ard-modal-errors-count" style="color:#f8fafc;">0</span>
          </div>
        </div>

        <!-- Issue Title -->
        <div class="ard-input-group">
          <label class="ard-label">Issue / Problem Title <span style="color:#f43f5e;">*</span></label>
          <input type="text" id="ard-form-title" class="ard-input" placeholder="e.g. CSRF token mismatch on login submit or button unresponsive" required />
        </div>

        <!-- Priority Selector -->
        <div class="ard-input-group">
          <label class="ard-label">Priority Level <span style="color:#f43f5e;">*</span></label>
          <div class="ard-priority-grid">
            <button type="button" class="ard-p-btn active-emergency" data-priority="emergency">🔴 Emergency (P0)</button>
            <button type="button" class="ard-p-btn" data-priority="high">🟠 High (P1)</button>
            <button type="button" class="ard-p-btn" data-priority="normal">🟡 Normal (P2)</button>
            <button type="button" class="ard-p-btn" data-priority="low">🔵 Low (P3)</button>
          </div>
        </div>

        <!-- Category & Component -->
        <div class="ard-input-group" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label class="ard-label">Category / Area</label>
            <select id="ard-form-category" class="ard-select">
              <option value="Authentication & Login">Authentication & Login</option>
              <option value="UI & Visual Layout">UI & Visual Layout</option>
              <option value="API & Network Connection">API & Network Connection</option>
              <option value="Form Validation">Form Validation</option>
              <option value="Performance & Crash">Performance & Crash</option>
              <option value="Security & CSRF">Security & CSRF</option>
            </select>
          </div>
          <div>
            <label class="ard-label">Assign Primary Fixer</label>
            <select id="ard-form-fixer" class="ard-select">
              <option value="Sarah Chen (Lead Fixer / Dev)">Sarah Chen (Lead Fixer)</option>
              <option value="David Kim (Backend Fixer)">David Kim (Backend)</option>
              <option value="Alex Rivers (QA Tester)">Alex Rivers (QA)</option>
            </select>
          </div>
        </div>

        <!-- General Description -->
        <div class="ard-input-group">
          <label class="ard-label">Detailed Problem Description</label>
          <textarea id="ard-form-desc" class="ard-textarea" placeholder="Explain the defect behavior encountered on this page..."></textarea>
        </div>

        <!-- Steps to Reproduce -->
        <div class="ard-input-group">
          <label class="ard-label">Steps to Reproduce</label>
          <textarea id="ard-form-steps" class="ard-textarea" placeholder="1. Open page&#10;2. Click submit button&#10;3. Notice error response"></textarea>
        </div>

        <!-- Expected vs Actual Result -->
        <div class="ard-input-group" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label class="ard-label">Expected Behavior</label>
            <input type="text" id="ard-form-expected" class="ard-input" placeholder="e.g. Successfully authenticate and redirect" />
          </div>
          <div>
            <label class="ard-label">Actual Behavior</label>
            <input type="text" id="ard-form-actual" class="ard-input" placeholder="e.g. 419 token expired or silent failure" />
          </div>
        </div>

        <!-- Console Errors Preview Accordion -->
        <div class="ard-input-group" id="ard-logs-accordion" style="background:#131d31;border:1px solid #1e293b;border-radius:10px;padding:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;" id="ard-logs-header">
            <span style="font-size:11px;font-weight:600;color:#94a3b8;display:flex;align-items:center;gap:6px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#f43f5e;display:inline-block;"></span>
              Captured Diagnostic Console Logs (<span id="ard-logs-count">0</span>)
            </span>
            <span style="font-size:10px;color:#38bdf8;">Auto-Attached</span>
          </div>
          <div id="ard-logs-list" style="margin-top:8px;font-family:monospace;font-size:10px;color:#cbd5e1;max-height:80px;overflow-y:auto;line-height:1.5;">
            No runtime errors detected yet on this page.
          </div>
        </div>
      </div>

      <!-- Success Screen View (hidden by default) -->
      <div class="ard-modal-body" id="ard-modal-success-view" style="display:none;text-align:center;padding:32px 20px;">
        <div style="width:56px;height:56px;border-radius:18px;background:rgba(16,185,129,0.2);color:#34d399;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:1px solid rgba(16,185,129,0.3);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style="font-size:17px;font-weight:700;color:#ffffff;margin:0 0 6px;">Bug Registered Successfully!</h3>
        <p style="font-size:12px;color:#94a3b8;margin:0 0 16px;">Defect logged into ARD Test & Debug Systems and assigned to lead fixer.</p>
        
        <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:14px;max-width:400px;margin:0 auto 20px;text-align:left;">
          <div style="font-size:11px;color:#94a3b8;">Issue Ticket ID:</div>
          <div id="ard-success-ticket-id" style="font-size:13px;font-weight:700;color:#38bdf8;font-family:monospace;margin-bottom:6px;">ISS-141-8932</div>
          <div style="font-size:11px;color:#94a3b8;">Target Page:</div>
          <div id="ard-success-url" style="font-size:12px;color:#f8fafc;word-break:break-all;">${window.location.href}</div>
        </div>

        <div style="display:flex;gap:10px;justify-content:center;">
          <button id="ard-btn-view-hub" class="ard-btn ard-btn-primary" style="width:auto;padding:10px 18px;">
            Open ARD Dashboard
          </button>
          <button id="ard-btn-another" class="ard-btn ard-btn-secondary" style="width:auto;padding:10px 18px;">
            Log Another Issue
          </button>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="ard-modal-footer" id="ard-modal-footer">
        <button id="ard-btn-cancel" class="ard-btn ard-btn-secondary" style="width:auto;margin:0;">
          Cancel
        </button>
        <button id="ard-btn-open-studio" class="ard-btn ard-btn-secondary" style="width:auto;margin:0;">
          Open in Full ARD Studio
        </button>
        <button id="ard-btn-submit-bug" class="ard-btn ard-btn-primary" style="width:auto;margin:0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Register Bug</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  // References
  const badge = document.getElementById('ard-orb-badge');
  const menu = document.getElementById('ard-orb-menu');
  const closeBtn = document.getElementById('ard-close-menu');
  const reportBtn = document.getElementById('ard-action-report');
  const hubBtn = document.getElementById('ard-action-hub');
  const errCountSpan = document.getElementById('ard-err-count');

  // Modal references
  const modalCloseX = document.getElementById('ard-modal-close-x');
  const modalCancel = document.getElementById('ard-btn-cancel');
  const modalSubmit = document.getElementById('ard-btn-submit-bug');
  const modalOpenStudio = document.getElementById('ard-btn-open-studio');
  const modalFormView = document.getElementById('ard-modal-form-view');
  const modalSuccessView = document.getElementById('ard-modal-success-view');
  const modalFooter = document.getElementById('ard-modal-footer');

  // Form input references
  const inputTitle = document.getElementById('ard-form-title');
  const inputCategory = document.getElementById('ard-form-category');
  const inputFixer = document.getElementById('ard-form-fixer');
  const inputDesc = document.getElementById('ard-form-desc');
  const inputSteps = document.getElementById('ard-form-steps');
  const inputExpected = document.getElementById('ard-form-expected');
  const inputActual = document.getElementById('ard-form-actual');
  const priorityBtns = document.querySelectorAll('.ard-p-btn');
  let selectedPriority = 'emergency';

  priorityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      priorityBtns.forEach(b => {
        b.className = 'ard-p-btn';
      });
      const p = btn.getAttribute('data-priority');
      selectedPriority = p;
      btn.className = 'ard-p-btn active-' + p;
    });
  });

  function updateLogsPreview() {
    const logsCountEl = document.getElementById('ard-logs-count');
    const logsListEl = document.getElementById('ard-logs-list');
    const modalErrorsCount = document.getElementById('ard-modal-errors-count');
    if (logsCountEl) logsCountEl.textContent = capturedLogs.length;
    if (modalErrorsCount) modalErrorsCount.textContent = capturedLogs.length;
    if (errCountSpan) errCountSpan.textContent = capturedLogs.length;

    if (logsListEl) {
      if (capturedLogs.length === 0) {
        logsListEl.innerHTML = '<span style="color:#94a3b8;">No runtime errors detected yet on this page.</span>';
      } else {
        logsListEl.innerHTML = capturedLogs.slice(-5).map(l => 
          `<div style="margin-bottom:3px;border-bottom:1px solid #1e293b;padding-bottom:2px;">
            <span style="color:#f43f5e;">[${l.timestamp}]</span> ${l.message.substring(0, 120)}
          </div>`
        ).join('');
      }
    }
  }

  function openRegisterModal() {
    menu.style.display = 'none';
    modalFormView.style.display = 'block';
    modalSuccessView.style.display = 'none';
    modalFooter.style.display = 'flex';
    modalOverlay.style.display = 'flex';
    document.getElementById('ard-modal-target-url').textContent = window.location.href;
    document.getElementById('ard-modal-viewport').textContent = window.innerWidth + 'x' + window.innerHeight;
    updateLogsPreview();
    setTimeout(() => {
      if (inputTitle) inputTitle.focus();
    }, 100);
  }

  function closeRegisterModal() {
    modalOverlay.style.display = 'none';
  }

  // Orb click toggles quick menu
  badge.addEventListener('click', () => {
    const isShowing = menu.style.display === 'block';
    menu.style.display = isShowing ? 'none' : 'block';
    updateLogsPreview();
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.style.display = 'none';
  });

  // Clicking "Report Bug on this Page" launches the in-page popup modal: "Register New Bug / Problem"
  reportBtn.addEventListener('click', () => {
    openRegisterModal();
  });

  hubBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    window.open(ARD_HUB_URL, '_blank');
  });

  modalCloseX.addEventListener('click', closeRegisterModal);
  modalCancel.addEventListener('click', closeRegisterModal);

  // Close on backdrop click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeRegisterModal();
    }
  });

  // Submit Bug
  modalSubmit.addEventListener('click', () => {
    const titleVal = inputTitle.value.trim();
    if (!titleVal) {
      inputTitle.style.borderColor = '#f43f5e';
      inputTitle.focus();
      return;
    }
    inputTitle.style.borderColor = '#334155';

    const ticketId = 'ISS-' + (window.location.hostname.replace(/[^a-zA-Z0-9]/g, '') || 'WEB').substring(0, 6) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const issueData = {
      id: 'iss_ext_' + Date.now().toString(36),
      ticketId: ticketId,
      title: titleVal,
      priority: selectedPriority,
      category: inputCategory.value,
      assignedFixerName: inputFixer.value,
      generalDesc: inputDesc.value.trim() || 'Logged via in-page popup on ' + window.location.href,
      stepsToReproduce: inputSteps.value.trim() || '1. Navigate to ' + window.location.href,
      expectedBehavior: inputExpected.value.trim() || 'Application should function without errors',
      actualBehavior: inputActual.value.trim() || 'Encountered defect described in issue title',
      url: window.location.href,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      consoleLogs: capturedLogs,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Save to LocalStorage queue for ARD Hub
    try {
      const existingQueue = JSON.parse(localStorage.getItem('ard_qa_external_issues') || '[]');
      existingQueue.unshift(issueData);
      localStorage.setItem('ard_qa_external_issues', JSON.stringify(existingQueue));
    } catch(e) {}

    // Broadcast across tabs
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('ard_qa_sync');
        bc.postMessage({ type: 'ARD_REGISTER_BUG', payload: issueData });
        bc.close();
      }
    } catch(e) {}

    // Post message to parent / any listener
    try {
      window.postMessage({ type: 'ARD_REGISTER_BUG', payload: issueData }, '*');
    } catch(e) {}

    // Show Success State
    document.getElementById('ard-success-ticket-id').textContent = ticketId;
    document.getElementById('ard-success-url').textContent = window.location.href;
    modalFormView.style.display = 'none';
    modalFooter.style.display = 'none';
    modalSuccessView.style.display = 'block';

    const viewHubBtn = document.getElementById('ard-btn-view-hub');
    const anotherBtn = document.getElementById('ard-btn-another');

    viewHubBtn.onclick = () => {
      window.open(ARD_HUB_URL + '?action=view_issue&ticket=' + encodeURIComponent(ticketId) + '&url=' + encodeURIComponent(window.location.href), '_blank');
      closeRegisterModal();
    };

    anotherBtn.onclick = () => {
      inputTitle.value = '';
      inputDesc.value = '';
      inputSteps.value = '';
      inputExpected.value = '';
      inputActual.value = '';
      modalSuccessView.style.display = 'none';
      modalFormView.style.display = 'block';
      modalFooter.style.display = 'flex';
      inputTitle.focus();
    };
  });

  // Open in Full ARD Studio
  modalOpenStudio.addEventListener('click', () => {
    const titleVal = encodeURIComponent(inputTitle.value.trim());
    const descVal = encodeURIComponent(inputDesc.value.trim());
    const urlVal = encodeURIComponent(window.location.href);
    const viewportVal = encodeURIComponent(window.innerWidth + 'x' + window.innerHeight);
    const fullUrl = ARD_HUB_URL + `?action=report&url=${urlVal}&title=${titleVal}&priority=${selectedPriority}&desc=${descVal}&viewport=${viewportVal}`;
    window.open(fullUrl, '_blank');
    closeRegisterModal();
  });

  // Global trigger helper
  window.__ARD_OPEN_REPORT_MODAL__ = openRegisterModal;

  console.log('[ARD QA] In-Page Bug Tool & Register Modal docked onto external site:', window.location.href);
})();
