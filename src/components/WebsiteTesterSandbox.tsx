import React, { useState } from 'react';
import { 
  Globe, 
  Terminal, 
  Lock, 
  User, 
  Key, 
  AlertCircle, 
  Camera, 
  MousePointer, 
  Server, 
  Check, 
  RefreshCw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { GrammarlyWidget } from './GrammarlyWidget';
import { useQAData } from '../context/QADataContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { ConsoleEntry, ImageAttachment } from '../types/qa';

interface WebsiteTesterSandboxProps {
  onOpenReportModalWithContext: (context: {
    pageUrl: string;
    viewport: string;
    logs: ConsoleEntry[];
    initialCrop?: ImageAttachment;
  }) => void;
  onOpenCropTool: (pageUrl: string, snapshotSrc?: string) => void;
  onOpenIssuesList: () => void;
}

export const WebsiteTesterSandbox: React.FC<WebsiteTesterSandboxProps> = ({
  onOpenReportModalWithContext,
  onOpenCropTool,
  onOpenIssuesList
}) => {
  const { activeWebsite, issues, activeWebsiteId } = useQAData();
  const { t } = useThemeLanguage();

  const [targetUrl, setTargetUrl] = useState(activeWebsite?.url || 'http://192.168.0.141/login');
  const [username, setUsername] = useState('admin.test');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Intentional QA defect triggers on http://192.168.0.141/login
  const [triggeredDefect, setTriggeredDefect] = useState<string | null>(null);

  // Inspector mode simulation
  const [inspectorActive, setInspectorActive] = useState(false);
  const [hoveredSelector, setHoveredSelector] = useState<string | null>(null);

  // Live Console logs for 192.168.0.141
  const [capturedLogs, setCapturedLogs] = useState<ConsoleEntry[]>([
    {
      type: 'warn',
      message: 'HTTP connection to 192.168.0.141 is unencrypted. Session tokens may be exposed.',
      timestamp: new Date().toLocaleTimeString(),
      source: 'auth_client.js:32'
    }
  ]);

  const [showConsoleDrawer, setShowConsoleDrawer] = useState(false);

  const siteIssues = issues.filter(i => i.websiteId === activeWebsiteId);
  const openIssuesCount = siteIssues.filter(i => i.status === 'pending' || i.status === 'in_progress').length;

  const triggerConsoleError = (msg: string) => {
    const newLog: ConsoleEntry = {
      type: 'error',
      message: msg,
      timestamp: new Date().toLocaleTimeString(),
      source: '192.168.0.141/login'
    };
    setCapturedLogs(prev => [newLog, ...prev]);
  };

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLogin(true);
    setTriggeredDefect(null);

    setTimeout(() => {
      setIsSubmittingLogin(false);
      // Simulate CSRF / LDAP defect on 192.168.0.141
      setTriggeredDefect('419_CSRF');
      triggerConsoleError('POST http://192.168.0.141/login 419 (Page Expired: CSRF token mismatch)');
      triggerConsoleError('Uncaught (in promise) Error: Invalid anti-forgery token for session on 192.168.0.141');
    }, 900);
  };

  const triggerIntentionalDefect = (type: 'csrf' | 'timeout' | 'ldap' | 'xss') => {
    if (type === 'csrf') {
      setTriggeredDefect('419_CSRF');
      triggerConsoleError('POST http://192.168.0.141/login 419 (Page Expired: CSRF token mismatch)');
    } else if (type === 'timeout') {
      setTriggeredDefect('504_TIMEOUT');
      triggerConsoleError('HTTP 504 Gateway Timeout: LDAP server on 192.168.0.141:389 failed to respond in 5000ms');
    } else if (type === 'ldap') {
      setTriggeredDefect('500_AUTH_FAIL');
      triggerConsoleError('Internal Server Error 500: Database lock on table users_auth_cache at 192.168.0.141');
    } else if (type === 'xss') {
      setTriggeredDefect('SANITIZATION_ERROR');
      triggerConsoleError('Warning: Input field #username contains unsanitized characters (<script> detected)');
    }
  };

  // Generate real visual canvas representation of http://192.168.0.141/login
  const generateSiteSnapshotDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&auto=format&fit=crop&q=80';

    // Dark backdrop
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Browser navigation bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, 50);

    // Traffic light dots
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(25, 25, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(45, 25, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(65, 25, 6, 0, Math.PI * 2); ctx.fill();

    // Address bar with user's exact website
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(100, 10, canvas.width - 200, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`http://192.168.0.141/login`, 120, 30);

    // Login Box Container
    const boxX = 350;
    const boxY = 120;
    const boxW = 500;
    const boxH = 540;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();

    // Brand on Login
    ctx.fillStyle = '#6366f1';
    ctx.beginPath(); ctx.arc(boxX + 250, boxY + 70, 32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ARD', boxX + 250, boxY + 78);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Internal Portal Sign-In', boxX + 250, boxY + 140);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Host: http://192.168.0.141/login', boxX + 250, boxY + 165);

    // Defect Highlight banner if active
    ctx.textAlign = 'left';
    if (triggeredDefect === '419_CSRF') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.roundRect(boxX + 30, boxY + 190, boxW - 60, 50, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('419 Page Expired: CSRF Token Mismatch on 192.168.0.141', boxX + 45, boxY + 220);
    } else if (triggeredDefect === '504_TIMEOUT') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.roundRect(boxX + 30, boxY + 190, boxW - 60, 50, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('504 Gateway Timeout: LDAP Auth Server Unreachable', boxX + 45, boxY + 220);
    }

    // Input fields mock
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(boxX + 30, boxY + 260, boxW - 60, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px monospace';
    ctx.fillText(username || 'admin.test', boxX + 50, boxY + 288);

    ctx.fillStyle = '#0f172a';
    ctx.roundRect(boxX + 30, boxY + 325, boxW - 60, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('••••••••••••', boxX + 50, boxY + 353);

    // Sign In Button
    ctx.fillStyle = '#4f46e5';
    ctx.roundRect(boxX + 30, boxY + 410, boxW - 60, 46, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sign In to 192.168.0.141', boxX + 250, boxY + 438);

    // Footer Watermark
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(`ARD Test & Debug Capture · Target: http://192.168.0.141/login · ${new Date().toLocaleString()}`, 40, canvas.height - 30);

    return canvas.toDataURL('image/png');
  };

  const handleCaptureSiteSnapshot = () => {
    const dataUrl = generateSiteSnapshotDataUrl();
    const newCropAttachment: ImageAttachment = {
      id: 'img_141_' + Date.now().toString(36),
      dataUrl,
      description: `Defect screenshot on http://192.168.0.141/login (${triggeredDefect || 'Auth State'})`,
      fileName: `snapshot_192.168.0.141_${Date.now()}.png`,
      timestamp: new Date().toISOString()
    };

    onOpenReportModalWithContext({
      pageUrl: 'http://192.168.0.141/login',
      viewport: '1440x900',
      logs: capturedLogs,
      initialCrop: newCropAttachment
    });
  };

  const handleOpenCropStudioForCurrentSite = () => {
    const dataUrl = generateSiteSnapshotDataUrl();
    onOpenCropTool('http://192.168.0.141/login', dataUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      
      {/* Browser Chrome Simulation Bar */}
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative transition-colors">
        
        {/* Top Browser Navigation Bar */}
        <div className="px-3 sm:px-4 py-2.5 bg-slate-950/90 dark:bg-slate-950/90 light:bg-slate-100 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 light:text-slate-600 hidden md:inline">
              Host: 192.168.0.141 (Port 80)
            </span>
          </div>

          {/* Browser Address Bar: http://192.168.0.141/login */}
          <div className="flex-1 max-w-xl flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl text-xs text-slate-300 light:text-slate-800 min-w-0">
            <Server className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="bg-transparent font-mono text-[11px] sm:text-xs text-emerald-400 light:text-emerald-700 w-full focus:outline-none"
            />
            <span className="ms-auto text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 light:text-indigo-600 font-mono shrink-0">
              TARGET SITE
            </span>
          </div>

          {/* Simulation Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Take Screenshot of http://192.168.0.141/login */}
            <button
              onClick={handleCaptureSiteSnapshot}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Snap screenshot of http://192.168.0.141/login"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Snap Site</span>
            </button>

            {/* DOM Inspector */}
            <button
              onClick={() => setInspectorActive(!inspectorActive)}
              className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                inspectorActive 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700'
              }`}
              title="Toggle Element Inspector mode"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>

            {/* Console Log Trigger Drawer Button */}
            <button
              onClick={() => setShowConsoleDrawer(!showConsoleDrawer)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                capturedLogs.some(l => l.type === 'error')
                  ? 'bg-rose-500/20 text-rose-300 light:text-rose-700 border border-rose-500/30'
                  : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700'
              }`}
              title="Toggle captured console logs"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{capturedLogs.length}</span>
            </button>
          </div>
        </div>

        {/* Intentional Defect Injection Toolbar for Testing */}
        <div className="px-4 py-2 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100/80 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 light:text-slate-600">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300 light:text-slate-700">Intentionally Trigger Defects on 192.168.0.141:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => triggerIntentionalDefect('csrf')}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 light:text-rose-700 border border-rose-500/30 text-[11px] font-medium cursor-pointer"
            >
              CSRF 419 Mismatch
            </button>
            <button
              onClick={() => triggerIntentionalDefect('timeout')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 light:text-amber-700 border border-amber-500/30 text-[11px] font-medium cursor-pointer"
            >
              504 LDAP Timeout
            </button>
            <button
              onClick={() => triggerIntentionalDefect('ldap')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 light:text-purple-700 border border-purple-500/30 text-[11px] font-medium cursor-pointer"
            >
              500 DB Lock
            </button>
            <button
              onClick={() => triggerIntentionalDefect('xss')}
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 light:text-sky-700 border border-sky-500/30 text-[11px] font-medium cursor-pointer"
            >
              Unsanitized Input
            </button>
          </div>
        </div>

        {/* Live Target Website Content Canvas: http://192.168.0.141/login */}
        <div className="bg-slate-950 dark:bg-slate-950 light:bg-slate-50 p-6 sm:p-12 min-h-[560px] text-white light:text-slate-900 relative transition-colors flex items-center justify-center">
          
          {/* Main Login Card on http://192.168.0.141/login */}
          <div 
            onMouseEnter={() => setHoveredSelector('div.login-card-container')}
            className={`w-full max-w-md bg-slate-900 dark:bg-slate-900 light:bg-white border rounded-3xl p-6 sm:p-8 shadow-2xl relative transition-all ${
              inspectorActive && hoveredSelector === 'div.login-card-container'
                ? 'ring-2 ring-indigo-500 border-indigo-500'
                : 'border-slate-800 dark:border-slate-800 light:border-slate-200'
            }`}
          >
            {/* Logo & Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center font-extrabold text-xl text-white mx-auto mb-3 shadow-lg shadow-indigo-600/30">
                ARD
              </div>
              <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-900 tracking-tight">
                Internal Portal Sign-In
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500 mt-1 font-mono">
                http://192.168.0.141/login
              </p>
            </div>

            {/* Error Banner when defect is triggered */}
            {triggeredDefect === '419_CSRF' && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 light:text-rose-900 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-rose-300 light:text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>419 | Page Expired (CSRF Token Mismatch)</span>
                </div>
                <p className="text-[11px] text-rose-300/90 light:text-rose-700 leading-relaxed">
                  Session token was invalidated over HTTP connection. Click the floating ARD extension icon on the bottom right to log this bug with full screenshot &amp; logs!
                </p>
              </div>
            )}

            {triggeredDefect === '504_TIMEOUT' && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-500/20 border-2 border-amber-500 text-amber-200 light:text-amber-900 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 light:text-amber-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>504 Gateway Timeout (LDAP 192.168.0.141:389)</span>
                </div>
                <p className="text-[11px] text-amber-300/90 light:text-amber-700 leading-relaxed">
                  Authentication backend failed to respond within threshold.
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSimulateLogin} className="space-y-4 text-xs">
              <div onMouseEnter={() => setHoveredSelector('input#username')}>
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold mb-1">
                  Username or Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full ps-9 pe-3 py-2.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div onMouseEnter={() => setHoveredSelector('input#password')}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold">
                    Password
                  </label>
                  <a href="#reset" onClick={(e) => e.preventDefault()} className="text-[11px] text-indigo-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full ps-9 pe-3 py-2.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-slate-400 light:text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Remember this browser</span>
                </label>
                <span className="text-[11px] text-slate-500">Domain: INTERNAL_CORP</span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingLogin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with 192.168.0.141...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 text-center text-[11px] text-slate-500">
              Target testing node: <span className="font-mono text-slate-400">192.168.0.141:80</span>
            </div>
          </div>

          {/* The Grammarly-style floating icon docked right onto http://192.168.0.141/login! */}
          <GrammarlyWidget
            onOpenReportModal={() => onOpenReportModalWithContext({
              pageUrl: 'http://192.168.0.141/login',
              viewport: '1440x900',
              logs: capturedLogs
            })}
            onOpenCropTool={handleOpenCropStudioForCurrentSite}
            onOpenIssuesList={onOpenIssuesList}
            onOpenConsoleInspector={() => setShowConsoleDrawer(true)}
            onSnapCurrentSite={handleCaptureSiteSnapshot}
            openIssuesCount={openIssuesCount}
            consoleErrorsCount={capturedLogs.filter(l => l.type === 'error').length}
          />

        </div>

        {/* Console & Diagnostics Bottom Drawer */}
        {showConsoleDrawer && (
          <div className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950 dark:bg-slate-950 light:bg-white p-4 max-h-60 overflow-y-auto space-y-2 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-800">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Diagnostics Stream for http://192.168.0.141/login ({capturedLogs.length} events)</span>
              </div>
              <button
                onClick={() => setShowConsoleDrawer(false)}
                className="text-slate-400 hover:text-white light:hover:text-black text-xs px-2 py-0.5 rounded hover:bg-slate-800 light:hover:bg-slate-100 cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

            <div className="font-mono text-xs space-y-1">
              {capturedLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={`p-1.5 rounded flex items-start gap-2 ${
                    log.type === 'error' 
                      ? 'bg-rose-950/40 light:bg-rose-50 text-rose-300 light:text-rose-700' 
                      : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 light:text-slate-800'
                  }`}
                >
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className={`font-bold shrink-0 uppercase text-[10px] px-1 rounded ${
                    log.type === 'error' ? 'bg-rose-500/20 text-rose-300 light:text-rose-700' : 'bg-amber-500/20 text-amber-300 light:text-amber-700'
                  }`}>
                    {log.type}
                  </span>
                  <span className="flex-1 break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
