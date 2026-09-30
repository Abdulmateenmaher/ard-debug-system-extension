import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Plus, 
  Bug, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Copy, 
  Check, 
  Sparkles, 
  Bookmark, 
  Layers, 
  Download, 
  Trash2,
  Eye,
  Info
} from 'lucide-react';
import { useQAData } from '../context/QADataContext';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Website } from '../types/qa';

interface ExternalWebsitesManagerProps {
  onOpenReportModalWithUrl: (url: string) => void;
  onNavigateToIssues: (websiteId: string) => void;
  onNavigateToExtension: () => void;
}

export const ExternalWebsitesManager: React.FC<ExternalWebsitesManagerProps> = ({
  onOpenReportModalWithUrl,
  onNavigateToIssues,
  onNavigateToExtension
}) => {
  const { 
    websites, 
    activeWebsiteId, 
    setActiveWebsiteId, 
    createWebsite, 
    deleteWebsite, 
    issues, 
    teamMembers,
    updateWebsiteAllowedDebuggers
  } = useQAData();
  
  const { user } = useAuth();
  const { t, language } = useThemeLanguage();

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteDesc, setNewSiteDesc] = useState('');
  const [editingPermissionsSiteId, setEditingPermissionsSiteId] = useState<string | null>(null);

  // 1-Click Bookmarklet code
  const bookmarkletCode = `javascript:(function(){var s=document.createElement('script');s.src='${window.location.origin}/ard-qa-widget.js';document.head.appendChild(s);})();`;
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCreateNewWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteUrl.trim()) return;

    let formattedUrl = newSiteUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    await createWebsite(newSiteName.trim(), formattedUrl, newSiteDesc.trim());
    setNewSiteName('');
    setNewSiteUrl('');
    setNewSiteDesc('');
    setShowAddModal(false);
  };

  const handleToggleDebugger = async (site: Website, debuggerId: string) => {
    const current = site.allowedDebuggerIds || [];
    const updated = current.includes(debuggerId)
      ? current.filter(id => id !== debuggerId)
      : [...current, debuggerId];
    await updateWebsiteAllowedDebuggers(site.id, updated);
  };

  const debuggers = teamMembers.filter(m => m.role === 'debugger');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner explaining external sites architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 light:from-white light:via-indigo-50/60 light:to-white border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900">
                  {language === 'fa' ? 'مدیریت وب‌سایت‌های خارجی تحت تست' : language === 'ps' ? 'د ازمویل کیدونکو بهرنیو وېبپاڼو مدیریت' : 'External Target Web Applications'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  External QA Targets
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {language === 'fa' 
                  ? 'وب‌سایت‌های تست شما (مانند http://192.168.0.141/login) برنامه‌های خارجی مستقل در شبکه هستند. افزونه مرورگر ARD آیکون شناور باگ را مستقیماً بر روی همان صفحه خارجی نمایش می‌دهد.'
                  : language === 'ps'
                  ? 'ستاسو د ازموینې وېبپاڼې (لکه http://192.168.0.141/login) په شبکه کې جلا بهرني پروګرامونه دي. د ARD اکستنشن دغه شناور ایښودل شوی آیکون په خپله بهرنۍ وېبپاڼه کې ښیي.'
                  : 'Your target websites (e.g. http://192.168.0.141/login) are external web applications running on your network or internet. The ARD browser extension and bookmarklet dock the floating bug icon directly onto the external website.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fa' ? 'افزودن وب‌سایت خارجی' : language === 'ps' ? 'د نوې بهرنۍ وېبپاڼې زیاتول' : 'Register External Site'}</span>
            </button>
            <button
              onClick={onNavigateToExtension}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-800 rounded-xl text-xs font-semibold border border-slate-700 dark:border-slate-700 light:border-slate-300 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>{language === 'fa' ? 'دریافت افزونه' : language === 'ps' ? 'د افزونې ډاونلوډ' : 'Get Extension'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Websites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {websites.map(site => {
          const siteIssues = issues.filter(i => i.websiteId === site.id);
          const openCount = siteIssues.filter(i => i.status === 'pending' || i.status === 'in_progress').length;
          const emergencyCount = siteIssues.filter(i => i.priority === 'emergency' && i.status !== 'fixed' && i.status !== 'discarded').length;
          const isSelected = site.id === activeWebsiteId;

          return (
            <div 
              key={site.id}
              className={`bg-slate-900/90 dark:bg-slate-900 light:bg-white rounded-2xl border p-5 sm:p-6 transition-all shadow-lg flex flex-col justify-between ${
                isSelected 
                  ? 'border-indigo-500/60 ring-2 ring-indigo-500/20' 
                  : 'border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 flex items-center justify-center text-indigo-400 font-bold">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                        <span>{site.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                            Active in QA Hub
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 line-clamp-1">
                        {site.description || 'Target web application monitored by ARD Test & Debug Systems'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {site.id !== 'web_internal_141' && (
                      <button
                        onClick={() => deleteWebsite(site.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
                        title="Delete Website"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* External URL Box with Direct Launch */}
                <div className="my-3 p-3 bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
                    <span className="font-mono text-xs text-emerald-400 dark:text-emerald-400 light:text-emerald-700 truncate select-all">
                      {site.url}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyToClipboard(site.url, site.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-black hover:bg-slate-800 light:hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedUrl === site.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    
                    {/* The crucial action: Open the actual external website in a new tab */}
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                      title={`Open external website ${site.url} in new tab`}
                    >
                      <span>Open External Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Info Note: Explains how the extension operates on this external site */}
                <div className="flex items-start gap-2 p-2.5 bg-indigo-950/30 dark:bg-indigo-950/30 light:bg-indigo-50/70 border border-indigo-500/20 rounded-xl text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 mb-4">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    {language === 'fa'
                      ? `هنگام باز کردن ${site.url} در مرورگر، افزونه ARD آیکون شناور باگ را در پایین صفحه نمایش می‌دهد تا خطاها مستقیماً به اینجا ارسال شوند.`
                      : language === 'ps'
                      ? `کله چې تاسو په براوزر کې ${site.url} خلاص کړئ، د ARD اکستنشن به شناور آیکون په هماغه پاڼه کې وښیي.`
                      : `When you open ${site.url} in your browser, the ARD Extension injects the floating bug badge onto that external page for 1-click bug logging.`}
                  </span>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2.5 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 rounded-xl border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 text-center">
                    <div className="text-[10px] text-slate-400 light:text-slate-600 uppercase tracking-wider font-semibold">Total Issues</div>
                    <div className="text-base font-bold text-white dark:text-white light:text-slate-900 mt-0.5">{siteIssues.length}</div>
                  </div>

                  <div className="p-2.5 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 rounded-xl border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 text-center">
                    <div className="text-[10px] text-slate-400 light:text-slate-600 uppercase tracking-wider font-semibold">Open / In Progress</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">{openCount}</div>
                  </div>

                  <div className="p-2.5 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 rounded-xl border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 text-center">
                    <div className="text-[10px] text-slate-400 light:text-slate-600 uppercase tracking-wider font-semibold">Emergency Blocker</div>
                    <div className="text-base font-bold text-rose-400 mt-0.5">{emergencyCount}</div>
                  </div>
                </div>

                {/* Allowed Debuggers / Testers */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 light:text-slate-600 font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{language === 'fa' ? 'تست‌کننده‌های مجاز (Debuggers):' : language === 'ps' ? 'مجاز ټسټ کوونکي:' : 'Authorized QA Debuggers:'}</span>
                    </span>
                    <button
                      onClick={() => setEditingPermissionsSiteId(editingPermissionsSiteId === site.id ? null : site.id)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                    >
                      {editingPermissionsSiteId === site.id ? 'Done' : 'Manage Access'}
                    </button>
                  </div>

                  {editingPermissionsSiteId === site.id ? (
                    <div className="p-3 bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 space-y-2">
                      <div className="text-[11px] text-slate-400 light:text-slate-600">Select which debuggers can log bugs for this external site:</div>
                      {debuggers.map(deb => {
                        const isAllowed = (site.allowedDebuggerIds || []).includes(deb.uid);
                        return (
                          <label key={deb.uid} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 dark:bg-slate-900/60 light:bg-white text-xs cursor-pointer hover:bg-slate-900 light:hover:bg-slate-50">
                            <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-medium">{deb.displayName}</span>
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              onChange={() => handleToggleDebugger(site, deb.uid)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {(site.allowedDebuggerIds && site.allowedDebuggerIds.length > 0) ? (
                        site.allowedDebuggerIds.map(dId => {
                          const mem = teamMembers.find(m => m.uid === dId);
                          return (
                            <span key={dId} className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300">
                              {mem?.displayName || dId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">All team debuggers have access</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveWebsiteId(site.id);
                      onNavigateToIssues(site.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-semibold rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Issues ({siteIssues.length})</span>
                  </button>

                  <button
                    onClick={() => onOpenReportModalWithUrl(site.url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 light:text-rose-700 text-xs font-semibold rounded-xl border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <Bug className="w-3.5 h-3.5 text-rose-400" />
                    <span>Log Bug for Site</span>
                  </button>
                </div>

                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <span>Launch External App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-Click Bookmarklet Tool (Instant Floating Icon on External Site without installing unpacked extension) */}
      <div className="p-5 sm:p-6 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                <span>{language === 'fa' ? 'فعال‌سازی فوری آیکون شناور با بوکمارکلت (1-Click Bookmarklet)' : language === 'ps' ? 'په ۱ کلیک سره د شناور آیکون فعالول' : 'Instant 1-Click Bookmarklet Injector'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono border border-rose-500/30">
                  Zero Install
                </span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                {language === 'fa'
                  ? 'این دکمه را به نوار بوک‌مارک مرورگر بکشید. سپس هر زمان در وب‌سایت http://192.168.0.141/login هستید، روی آن کلیک کنید تا آیکون شناور باگ ظاهر شود.'
                  : language === 'ps'
                  ? 'دا تڼۍ خپل بوکمارک بار ته کش کړئ. کله چې په http://192.168.0.141/login وېبپاڼه کې یاست، کلیک ورباندې وکړئ.'
                  : 'Drag this button to your browser Bookmarks Bar. When browsing http://192.168.0.141/login, click it to instantly dock the floating bug icon on that external website.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Draggable bookmarklet link */}
            <a
              href={bookmarkletCode}
              onClick={e => {
                e.preventDefault();
                alert('Drag this button to your browser bookmarks bar (Ctrl+Shift+B / Cmd+Shift+B). Then open http://192.168.0.141/login and click it!');
              }}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/25 transition-all cursor-grab active:cursor-grabbing flex items-center gap-2"
              title="Drag to your Bookmarks Bar"
            >
              <Bug className="w-4 h-4" />
              <span>🐞 ARD Bug Tool (Drag to Bookmarks)</span>
            </a>

            <button
              onClick={() => {
                navigator.clipboard.writeText(bookmarkletCode);
                setCopiedBookmarklet(true);
                setTimeout(() => setCopiedBookmarklet(false), 2500);
              }}
              className="p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300 transition-colors cursor-pointer"
              title="Copy Bookmarklet Code"
            >
              {copiedBookmarklet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Register New Website Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
              {language === 'fa' ? 'ثبت وب‌سایت خارجی جدید' : language === 'ps' ? 'د نوې بهرنۍ وېبپاڼې ثبتول' : 'Register New External Website'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
              {language === 'fa'
                ? 'آدرس وب‌سایت یا پورتال خارجی تحت تست را وارد کنید (مانند http://192.168.0.141/login).'
                : language === 'ps'
                ? 'د بهرنۍ ازمویل کیدونکې وېبپاڼې بشپړ ادرس ورکړئ.'
                : 'Enter the external URL or intranet portal under QA testing.'}
            </p>

            <form onSubmit={handleCreateNewWebsite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Website / System Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ERP Gateway / Staging Store"
                  value={newSiteName}
                  onChange={e => setNewSiteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  External URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. http://192.168.0.141/login or https://app.company.internal"
                  value={newSiteUrl}
                  onChange={e => setNewSiteUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs font-mono text-emerald-400 light:text-emerald-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Target environment, VPN requirements, credentials..."
                  value={newSiteDesc}
                  onChange={e => setNewSiteDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Register Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
