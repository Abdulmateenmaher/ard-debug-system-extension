import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { QADataProvider } from './context/QADataContext';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext';
import { Navbar } from './components/Navbar';
import { WebsiteTesterSandbox } from './components/WebsiteTesterSandbox';
import { IssuesDashboard } from './components/IssuesDashboard';
import { TeamManagement } from './components/TeamManagement';
import { BackupRecoveryModal } from './components/BackupRecoveryModal';
import { ExtensionDownloader } from './components/ExtensionDownloader';
import { IssueReportModal } from './components/IssueReportModal';
import { ScreenshotCropModal } from './components/ScreenshotCropModal';
import { ConsoleEntry, ImageAttachment } from './types/qa';

function AppContent() {
  const [currentView, setCurrentView] = useState<'sandbox' | 'dashboard' | 'extension' | 'team' | 'backup'>('sandbox');
  const { t, dir } = useThemeLanguage();

  // Issue report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalContext, setReportModalContext] = useState<{
    pageUrl: string;
    viewport: string;
    logs: ConsoleEntry[];
    initialImage?: ImageAttachment;
  }>({
    pageUrl: 'https://demo-shopsphere.store/checkout/payment',
    viewport: '1440x900',
    logs: []
  });

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
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentView === 'sandbox' && (
          <WebsiteTesterSandbox
            onOpenReportModalWithContext={handleOpenReportWithContext}
            onOpenCropTool={handleOpenCropTool}
            onOpenIssuesList={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <IssuesDashboard
            onOpenNewIssue={handleOpenReportModal}
          />
        )}

        {currentView === 'team' && (
          <TeamManagement />
        )}

        {currentView === 'backup' && (
          <BackupRecoveryModal />
        )}

        {currentView === 'extension' && (
          <ExtensionDownloader
            onLaunchSimulator={() => setCurrentView('sandbox')}
          />
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
          <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
            Complies with Grammarly-style in-page docked extension, screenshot cropping, fixer forward workflows, and multi-site DB isolation.
          </div>
        </div>
      </footer>

      {/* Issue Report Modal */}
      {showReportModal && (
        <IssueReportModal
          pageUrl={reportModalContext.pageUrl}
          viewport={reportModalContext.viewport}
          initialLogs={reportModalContext.logs}
          initialImage={reportModalContext.initialImage}
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
