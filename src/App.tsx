import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { QADataProvider } from './context/QADataContext';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext';
import { Navbar } from './components/Navbar';
import { ExternalWebsitesManager } from './components/ExternalWebsitesManager';
import { IssuesDashboard } from './components/IssuesDashboard';
import { TeamManagement } from './components/TeamManagement';
import { BackupRecoveryModal } from './components/BackupRecoveryModal';
import { ExtensionDownloader } from './components/ExtensionDownloader';
import { IssueReportModal } from './components/IssueReportModal';
import { ScreenshotCropModal } from './components/ScreenshotCropModal';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import { ConsoleEntry, ImageAttachment } from './types/qa';

function AppContent() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'websites' | 'extension' | 'team' | 'backup'>('dashboard');
  const { t, dir } = useThemeLanguage();

  // GitHub Pages deployment modal state
  const [showGitHubPagesModal, setShowGitHubPagesModal] = useState(false);

  // Issue report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalContext, setReportModalContext] = useState<{
    pageUrl: string;
    viewport: string;
    logs: ConsoleEntry[];
    initialImage?: ImageAttachment;
    initialTitle?: string;
    initialPriority?: 'emergency' | 'high' | 'normal' | 'low';
    initialDesc?: string;
    initialSteps?: string;
    initialExpected?: string;
    initialActual?: string;
  }>({
    pageUrl: 'http://192.168.0.141/login',
    viewport: '1440x900',
    logs: []
  });

  // Listen for query params triggered from external website extension / bookmarklet (e.g. ?action=report&url=http%3A%2F%2F192.168.0.141%2Flogin)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const targetUrl = params.get('url');
      const viewport = params.get('viewport');
      const title = params.get('title');
      const priority = params.get('priority') as 'emergency' | 'high' | 'normal' | 'low' | null;
      const desc = params.get('desc');
      const steps = params.get('steps');
      const expected = params.get('expected');
      const actual = params.get('actual');

      if (action === 'report' && (targetUrl || title)) {
        setReportModalContext(prev => ({
          ...prev,
          pageUrl: targetUrl ? decodeURIComponent(targetUrl) : prev.pageUrl,
          viewport: viewport ? decodeURIComponent(viewport) : prev.viewport,
          initialTitle: title ? decodeURIComponent(title) : prev.initialTitle,
          initialPriority: priority || prev.initialPriority || 'emergency',
          initialDesc: desc ? decodeURIComponent(desc) : prev.initialDesc,
          initialSteps: steps ? decodeURIComponent(steps) : prev.initialSteps,
          initialExpected: expected ? decodeURIComponent(expected) : prev.initialExpected,
          initialActual: actual ? decodeURIComponent(actual) : prev.initialActual
        }));
        setShowReportModal(true);
        // Clean URL without triggering reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, []);

  // Direct Crop Studio state
  const [showCropStudio, setShowCropStudio] = useState(false);
  const [cropTargetUrl, setCropTargetUrl] = useState('https://demo-shopsphere.store/checkout/payment');
  const [cropBaseImage, setCropBaseImage] = useState<string | undefined>(undefined);

  const handleOpenReportModal = () => {
    setShowReportModal(true);
  };

  const handleOpenReportWithContext = (context: {
    pageUrl: string;
    viewport: string;
    logs: ConsoleEntry[];
    initialCrop?: ImageAttachment;
  }) => {
    setReportModalContext({
      pageUrl: context.pageUrl,
      viewport: context.viewport,
      logs: context.logs,
      initialImage: context.initialCrop
    });
    setShowReportModal(true);
  };

  const handleOpenCropTool = (url: string, snapshotSrc?: string) => {
    setCropTargetUrl(url);
    setCropBaseImage(snapshotSrc);
    setShowCropStudio(true);
  };

  const handleCropSaved = (attachment: ImageAttachment) => {
    setReportModalContext(prev => ({
      ...prev,
      pageUrl: cropTargetUrl,
      initialImage: attachment
    }));
    setShowReportModal(true);
  };

  // 1-Click snap current site from navbar or global trigger
  const handleSnapCurrentSite = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1e293b';
      ctx.roundRect(40, 40, canvas.width - 80, canvas.height - 80, 16);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`Target Webpage Snapshot: ${reportModalContext.pageUrl}`, 70, 90);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(`Timestamp: ${new Date().toLocaleString()} | Viewport: 1440x900`, 70, 125);

      ctx.fillStyle = '#334155';
      ctx.roundRect(70, 160, canvas.width - 140, 400, 12);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.font = '16px sans-serif';
      ctx.fillText('Live Site State Captured by ARD Test and Debug Systems', 100, 220);

      const dataUrl = canvas.toDataURL('image/png');
      const snapImg: ImageAttachment = {
        id: 'img_snap_global_' + Date.now().toString(36),
        dataUrl,
        description: `Snapshot of active site at ${reportModalContext.pageUrl}`,
        fileName: `active_site_${Date.now()}.png`,
        timestamp: new Date().toISOString()
      };

      setReportModalContext(prev => ({
        ...prev,
        initialImage: snapImg
      }));
      setShowReportModal(true);
    }
  };

  return (
    <div 
      dir={dir}
      className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white transition-colors"
    >
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewIssue={handleOpenReportModal}
        onSnapCurrentSite={handleSnapCurrentSite}
        onOpenGitHubPages={() => setShowGitHubPagesModal(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <IssuesDashboard
            onOpenNewIssue={handleOpenReportModal}
          />
        )}

        {currentView === 'websites' && (
          <ExternalWebsitesManager
            onOpenReportModalWithUrl={(url) => {
              setReportModalContext(prev => ({ ...prev, pageUrl: url }));
              setShowReportModal(true);
            }}
            onNavigateToIssues={() => setCurrentView('dashboard')}
            onNavigateToExtension={() => setCurrentView('extension')}
          />
        )}

        {currentView === 'extension' && (
          <ExtensionDownloader
            onNavigateToWebsites={() => setCurrentView('websites')}
          />
        )}

        {currentView === 'team' && (
          <TeamManagement />
        )}

        {currentView === 'backup' && (
          <BackupRecoveryModal />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 dark:border-slate-900 light:border-slate-200 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white py-4 px-6 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-slate-400 dark:text-slate-400 light:text-slate-700">
              {t('brand.title')}
            </span>
            <span>·</span>
            <span>Firebase Synced: <code className="text-indigo-400 font-mono">qa-test-3d1c0</code></span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
            <span>Complies with Grammarly-style in-page docked extension, screenshot cropping, fixer forward workflows, and multi-site DB isolation.</span>
            <button
              onClick={() => setShowGitHubPagesModal(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 cursor-pointer shrink-0"
            >
              Publish to GitHub Pages
            </button>
          </div>
        </div>
      </footer>

      {/* GitHub Pages Deploy Modal */}
      <GitHubPagesModal
        isOpen={showGitHubPagesModal}
        onClose={() => setShowGitHubPagesModal(false)}
      />

      {/* Issue Report Modal (Register New Bug / Problem) */}
      {showReportModal && (
        <IssueReportModal
          pageUrl={reportModalContext.pageUrl}
          viewport={reportModalContext.viewport}
          initialLogs={reportModalContext.logs}
          initialImage={reportModalContext.initialImage}
          initialTitle={reportModalContext.initialTitle}
          initialPriority={reportModalContext.initialPriority}
          initialDesc={reportModalContext.initialDesc}
          initialSteps={reportModalContext.initialSteps}
          initialExpected={reportModalContext.initialExpected}
          initialActual={reportModalContext.initialActual}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Standalone Crop Studio */}
      {showCropStudio && (
        <ScreenshotCropModal
          pageUrl={cropTargetUrl}
          baseImageSrc={cropBaseImage}
          onClose={() => setShowCropStudio(false)}
          onSaveCrop={handleCropSaved}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeLanguageProvider>
      <AuthProvider>
        <QADataProvider>
          <AppContent />
        </QADataProvider>
      </AuthProvider>
    </ThemeLanguageProvider>
  );
}
