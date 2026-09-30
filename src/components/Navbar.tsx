import React, { useState } from 'react';
import { 
  Bug, 
  Globe, 
  Plus, 
  Download, 
  Users, 
  Database, 
  LayoutDashboard, 
  ChevronDown, 
  UserCheck, 
  Sun, 
  Moon, 
  Laptop, 
  Languages, 
  Menu, 
  X, 
  Camera, 
  Layers, 
  Sparkles, 
  Github,
  ExternalLink
} from 'lucide-react';
import { useQAData } from '../context/QADataContext';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage, AppLanguage, AppTheme } from '../context/ThemeLanguageContext';
import { UserRole } from '../types/qa';

interface NavbarProps {
  currentView: 'dashboard' | 'websites' | 'extension' | 'team' | 'backup';
  setCurrentView: (view: 'dashboard' | 'websites' | 'extension' | 'team' | 'backup') => void;
  onOpenNewIssue: () => void;
  onSnapCurrentSite: () => void;
  onOpenGitHubPages?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setCurrentView, 
  onOpenNewIssue,
  onSnapCurrentSite,
  onOpenGitHubPages
}) => {
  const { 
    websites, 
    activeWebsiteId, 
    setActiveWebsiteId, 
    activeWebsite, 
    createWebsite, 
    issues 
  } = useQAData();
  
  const { user, switchPersona, firestoreOnline } = useAuth();
  const { language, setLanguage, theme, setTheme, effectiveTheme, t, dir } = useThemeLanguage();

  const [showWebsiteMenu, setShowWebsiteMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  const [showNewWebsiteModal, setShowNewWebsiteModal] = useState(false);
  const [newWebName, setNewWebName] = useState('');
  const [newWebUrl, setNewWebUrl] = useState('');
  const [newWebDesc, setNewWebDesc] = useState('');

  const currentWebIssues = issues.filter(i => i.websiteId === activeWebsiteId);
  const openIssuesCount = currentWebIssues.filter(i => i.status === 'pending' || i.status === 'in_progress').length;

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebName.trim()) return;
    await createWebsite(newWebName.trim(), newWebUrl.trim() || 'https://demo.app', newWebDesc.trim());
    setNewWebName('');
    setNewWebUrl('');
    setNewWebDesc('');
    setShowNewWebsiteModal(false);
    setShowWebsiteMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 light:bg-white/95 backdrop-blur-md border-b border-slate-800 dark:border-slate-800 light:border-slate-200 text-white light:text-slate-900 select-none transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform text-white">
                <Bug className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-start">
                <div className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1.5 text-white dark:text-white light:text-slate-900">
                  <span>ARD</span>
                  <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 dark:text-indigo-300 light:text-indigo-600 font-mono font-medium border border-indigo-500/30">
                    {t('brand.extTag')}
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-normal truncate max-w-[120px] sm:max-w-none">
                  {t('brand.title')}
                </div>
              </div>
            </button>

            {/* Target Website Selector & External Site Direct Launcher */}
            <div className="relative hidden xl:flex items-center gap-1">
              <button
                onClick={() => setShowWebsiteMenu(!showWebsiteMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 dark:bg-slate-900 light:bg-slate-100 hover:bg-slate-800 border border-slate-700/80 dark:border-slate-800 light:border-slate-300 rounded-xl text-xs font-medium text-slate-200 dark:text-slate-200 light:text-slate-700 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="max-w-[130px] truncate">{activeWebsite?.name || t('nav.targetWebsite')}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-700/60 dark:bg-slate-800 light:bg-slate-200 rounded text-slate-300 light:text-slate-700 font-mono">
                  {openIssuesCount}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Direct button to launch external website in new tab */}
              {activeWebsite?.url && (
                <a
                  href={activeWebsite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-slate-800/80 dark:bg-slate-900 light:bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-400 border border-slate-700/80 dark:border-slate-800 light:border-slate-300 transition-colors cursor-pointer"
                  title={`Launch external site ${activeWebsite.url} in new tab`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {showWebsiteMenu && (
                <div className="absolute top-full start-0 mt-1.5 w-72 bg-slate-800 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-800 light:border-slate-200 rounded-xl shadow-2xl p-2 z-50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                    {t('nav.allWebsites')}
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {websites.map(site => {
                      const siteOpenBugs = issues.filter(i => i.websiteId === site.id && (i.status === 'pending' || i.status === 'in_progress')).length;
                      return (
                        <button
                          key={site.id}
                          onClick={() => {
                            setActiveWebsiteId(site.id);
                            setShowWebsiteMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-start text-xs transition-colors ${
                            site.id === activeWebsiteId 
                              ? 'bg-indigo-600/30 text-white dark:text-white light:text-indigo-900 border border-indigo-500/40' 
                              : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/50 light:hover:bg-slate-100'
                          }`}
                        >
                          <div className="min-w-0 pe-2">
                            <p className="font-medium truncate">{site.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{site.url}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${siteOpenBugs > 0 ? 'bg-rose-500/20 text-rose-300 light:text-rose-600' : 'bg-emerald-500/20 text-emerald-300 light:text-emerald-700'}`}>
                            {siteOpenBugs}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-700 dark:border-slate-800 light:border-slate-200">
                    <button
                      onClick={() => {
                        setShowNewWebsiteModal(true);
                        setShowWebsiteMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('nav.addWebsite')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Central Navigation Views (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 dark:bg-slate-900/90 light:bg-slate-100 p-1 rounded-xl border border-slate-700/60 dark:border-slate-800 light:border-slate-200">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentView === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-slate-700/60 light:hover:bg-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-rose-300" />
              <span>{t('nav.dashboard')}</span>
              <span className="text-[10px] bg-slate-900/60 light:bg-white px-1.5 py-0.2 rounded-full font-mono text-slate-300 light:text-slate-800">{currentWebIssues.length}</span>
            </button>

            <button
              onClick={() => setCurrentView('websites')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentView === 'websites' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-slate-700/60 light:hover:bg-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-300" />
              <span>{t('nav.websites')}</span>
              <span className="text-[10px] bg-slate-900/60 light:bg-white px-1.5 py-0.2 rounded-full font-mono text-slate-300 light:text-slate-800">{websites.length}</span>
            </button>

            <button
              onClick={() => setCurrentView('extension')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentView === 'extension' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-slate-700/60 light:hover:bg-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-sky-300" />
              <span>{t('nav.download')}</span>
            </button>

            <button
              onClick={() => setCurrentView('team')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentView === 'team' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-slate-700/60 light:hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('nav.team')}</span>
            </button>

            <button
              onClick={() => setCurrentView('backup')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentView === 'backup' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-slate-700/60 light:hover:bg-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('nav.backup')}</span>
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Snap Webpage Screenshot Button */}
            <button
              onClick={onSnapCurrentSite}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 light:text-slate-800 text-xs font-medium rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 transition-all cursor-pointer"
              title={t('widget.snapWebpage')}
            >
              <Camera className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{t('widget.snapWebpage').split(' ')[0]}</span>
            </button>

            {/* Log Bug Primary CTA */}
            <button
              onClick={onOpenNewIssue}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">{t('nav.logBug')}</span>
            </button>

            {/* GitHub Pages Deploy Helper */}
            {onOpenGitHubPages && (
              <button
                onClick={onOpenGitHubPages}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 light:text-slate-800 text-xs font-semibold rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 transition-all cursor-pointer"
                title="Publish to GitHub Pages"
              >
                <Github className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">GitHub Pages</span>
              </button>
            )}

            {/* Language Selector (English, Dari, Pashto) */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-1.5 bg-slate-800/80 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-200 light:text-slate-700 transition-colors flex items-center gap-1 text-xs"
                title="Switch Language (English / دری / پښتو)"
              >
                <Languages className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-semibold uppercase">{language}</span>
              </button>

              {showLangMenu && (
                <div className="absolute top-full end-0 mt-1.5 w-40 bg-slate-800 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-800 light:border-slate-200 rounded-xl shadow-2xl p-1 z-50">
                  <button
                    onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                    className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      language === 'en' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/50 light:hover:bg-slate-100'
                    }`}
                  >
                    <span>English</span>
                    <span className="text-[10px] opacity-70">EN</span>
                  </button>

                  <button
                    onClick={() => { setLanguage('fa'); setShowLangMenu(false); }}
                    className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      language === 'fa' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/50 light:hover:bg-slate-100'
                    }`}
                  >
                    <span>دری (Dari)</span>
                    <span className="text-[10px] opacity-70">FA</span>
                  </button>

                  <button
                    onClick={() => { setLanguage('ps'); setShowLangMenu(false); }}
                    className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      language === 'ps' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/50 light:hover:bg-slate-100'
                    }`}
                  >
                    <span>پښتو (Pashto)</span>
                    <span className="text-[10px] opacity-70">PS</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light / System Mode Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-1.5 bg-slate-800/80 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-200 light:text-slate-700 transition-colors"
                title="Theme: Dark, Light, System"
              >
                {effectiveTheme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </button>

              {showThemeMenu && (
                <div className="absolute top-full end-0 mt-1.5 w-36 bg-slate-800 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-800 light:border-slate-200 rounded-xl shadow-2xl p-1 z-50">
                  <button
                    onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                    className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                      theme === 'light' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/50 light:hover:bg-slate-100'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('theme.light')}</span>
                  </button>

                  <button
                    onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                    className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                      theme === 'dark' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/50 light:hover:bg-slate-100'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t('theme.dark')}</span>
                  </button>

                  <button
                    onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                    className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                      theme === 'system' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/50 light:hover:bg-slate-100'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('theme.system')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Persona Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-1.5 p-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700/80 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-xs text-slate-200 light:text-slate-800 transition-colors"
                title={t('nav.switchPersona')}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 light:text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                  {user?.displayName ? user.displayName.substring(0, 2) : 'QA'}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {showPersonaMenu && (
                <div className="absolute end-0 top-full mt-2 w-72 bg-slate-800 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-800 light:border-slate-200 rounded-xl shadow-2xl p-2.5 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700 dark:border-slate-800 light:border-slate-200 mb-2">
                    <div>
                      <p className="text-xs font-semibold text-white dark:text-white light:text-slate-900">{user?.displayName}</p>
                      <p className="text-[11px] text-slate-400">{user?.email}</p>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 light:text-indigo-600 border border-indigo-500/30">
                      {user?.role}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-400 mb-1.5">
                    {t('nav.switchPersona')}:
                  </p>
                  
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        switchPersona('debugger');
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-start transition-colors ${
                        user?.role === 'debugger' ? 'bg-indigo-600/30 text-white dark:text-white light:text-indigo-900 border border-indigo-500/40' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/60 light:hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="font-medium">Alex Rivers (QA Tester)</div>
                        <div className="text-[10px] text-slate-400">Reports bugs, uploads crops, views shared issues</div>
                      </div>
                      {user?.role === 'debugger' && <UserCheck className="w-4 h-4 text-indigo-400" />}
                    </button>

                    <button
                      onClick={() => {
                        switchPersona('fixer');
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-start transition-colors ${
                        user?.role === 'fixer' ? 'bg-indigo-600/30 text-white dark:text-white light:text-indigo-900 border border-indigo-500/40' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/60 light:hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="font-medium">Sarah Chen (Lead Fixer / Dev)</div>
                        <div className="text-[10px] text-slate-400">Forwards issues, updates status, manages debuggers</div>
                      </div>
                      {user?.role === 'fixer' && <UserCheck className="w-4 h-4 text-indigo-400" />}
                    </button>

                    <button
                      onClick={() => {
                        switchPersona('admin');
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-start transition-colors ${
                        user?.role === 'admin' ? 'bg-indigo-600/30 text-white dark:text-white light:text-indigo-900 border border-indigo-500/40' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/60 light:hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="font-medium">Admin Maher</div>
                        <div className="text-[10px] text-slate-400">Adds websites, separate databases, full backup &amp; recovery</div>
                      </div>
                      {user?.role === 'admin' && <UserCheck className="w-4 h-4 text-indigo-400" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300"
            >
              {showMobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileNav && (
          <div className="lg:hidden border-t border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900 dark:bg-slate-950 light:bg-white p-3 space-y-1.5 animate-in slide-in-from-top-2">
            <button
              onClick={() => { setCurrentView('dashboard'); setShowMobileNav(false); }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                currentView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-rose-400" />
                <span>{t('nav.dashboard')}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 font-mono">
                {currentWebIssues.length}
              </span>
            </button>

            <button
              onClick={() => { setCurrentView('websites'); setShowMobileNav(false); }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                currentView === 'websites' ? 'bg-indigo-600 text-white' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>{t('nav.websites')}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 font-mono">
                {websites.length}
              </span>
            </button>

            <button
              onClick={() => { setCurrentView('extension'); setShowMobileNav(false); }}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentView === 'extension' ? 'bg-indigo-600 text-white' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-100'
              }`}
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>{t('nav.download')}</span>
            </button>

            <button
              onClick={() => { setCurrentView('team'); setShowMobileNav(false); }}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentView === 'team' ? 'bg-indigo-600 text-white' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>{t('nav.team')}</span>
            </button>

            <button
              onClick={() => { setCurrentView('backup'); setShowMobileNav(false); }}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentView === 'backup' ? 'bg-indigo-600 text-white' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>{t('nav.backup')}</span>
            </button>

            {onOpenGitHubPages && (
              <button
                onClick={() => { onOpenGitHubPages(); setShowMobileNav(false); }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-100"
              >
                <Github className="w-4 h-4 text-indigo-400" />
                <span>GitHub Pages Deploy</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Add New Target Website Modal */}
      {showNewWebsiteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white light:text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">{t('nav.addWebsite')}</h3>
              </div>
              <button 
                onClick={() => setShowNewWebsiteModal(false)}
                className="text-slate-400 hover:text-white light:hover:text-black text-lg"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 light:text-slate-500 mb-4">
              {t('nav.allWebsites')}
            </p>

            <form onSubmit={handleAddWebsite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">Website Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme SaaS Customer Portal"
                  value={newWebName}
                  onChange={(e) => setNewWebName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-sm text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">Target Base URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://app.example.com"
                  value={newWebUrl}
                  onChange={(e) => setNewWebUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-sm text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Staging testing for Q3 release..."
                  value={newWebDesc}
                  onChange={(e) => setNewWebDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-sm text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWebsiteModal(false)}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 text-slate-300 light:text-slate-700 text-xs font-medium rounded-lg"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md"
                >
                  {t('nav.addWebsite')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
