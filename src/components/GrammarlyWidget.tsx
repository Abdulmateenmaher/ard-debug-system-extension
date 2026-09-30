import React, { useState } from 'react';
import { 
  Bug, 
  Crop, 
  Plus, 
  LayoutList, 
  Terminal, 
  ChevronRight,
  Camera,
  CheckCircle,
  X
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface GrammarlyWidgetProps {
  onOpenReportModal: () => void;
  onOpenCropTool: () => void;
  onOpenIssuesList: () => void;
  onOpenConsoleInspector: () => void;
  onSnapCurrentSite: () => void;
  openIssuesCount: number;
  consoleErrorsCount: number;
}

export const GrammarlyWidget: React.FC<GrammarlyWidgetProps> = ({
  onOpenReportModal,
  onOpenCropTool,
  onOpenIssuesList,
  onOpenConsoleInspector,
  onSnapCurrentSite,
  openIssuesCount,
  consoleErrorsCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useThemeLanguage();

  return (
    <div className="fixed end-4 sm:end-6 bottom-6 sm:bottom-8 z-50 flex flex-col items-end select-none">
      
      {/* Quick Action Popup Menu (Grammarly style expander) */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur-md border border-slate-700/80 dark:border-slate-700 light:border-slate-300 rounded-2xl shadow-2xl p-3 text-white light:text-slate-900 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Bug className="w-3.5 h-3.5" />
              </div>
              <div className="text-start">
                <h4 className="text-xs font-bold leading-tight">{t('widget.title')}</h4>
                <p className="text-[10px] text-slate-400 light:text-slate-500">{t('widget.activeOnPage')}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white light:hover:text-black text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 light:hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {/* Instant Snapshot of active site */}
            <button
              onClick={() => {
                setIsOpen(false);
                onSnapCurrentSite();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-750 light:hover:bg-slate-200 text-slate-200 light:text-slate-800 text-xs font-medium transition-colors group cursor-pointer border border-slate-750 light:border-slate-200"
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{t('widget.snapWebpage')}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 light:text-emerald-700 font-mono">
                Auto
              </span>
            </button>

            {/* Register Bug CTA */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenReportModal();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-medium text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t('widget.registerBug')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Crop & Annotate */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCropTool();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 text-xs font-medium transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Crop className="w-4 h-4 text-indigo-400" />
                <span>{t('widget.cropArea')}</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-white light:group-hover:text-black">Studio</span>
            </button>

            {/* See All Issues */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenIssuesList();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 text-xs font-medium transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-amber-400" />
                <span>{t('widget.seeAllIssues')}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 dark:bg-slate-800 light:bg-slate-200 font-mono text-slate-300 light:text-slate-700">
                {openIssuesCount}
              </span>
            </button>

            {/* Console Inspector */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenConsoleInspector();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 text-xs font-medium transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>{t('widget.console')}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${consoleErrorsCount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400'}`}>
                {consoleErrorsCount}
              </span>
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ARD Active
            </span>
            <span className="font-mono">Grammarly Dock</span>
          </div>

        </div>
      )}

      {/* Floating Grammarly-style Pulsing Orb */}
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover Tooltip when collapsed */}
        {!isOpen && isHovered && (
          <div className="absolute end-full me-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 px-3 py-1.5 rounded-xl shadow-xl text-white light:text-slate-900 text-xs font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('widget.clickTooltip')}</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open ARD QA Debugger"
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-indigo-600 p-0.5 shadow-2xl shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none cursor-pointer"
        >
          {/* Inner Glowing Badge */}
          <div className="w-full h-full rounded-[14px] bg-slate-900/90 dark:bg-slate-950/90 light:bg-white/95 transition-colors flex items-center justify-center relative overflow-hidden">
            
            {/* Ambient pulse */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent"></div>
            
            <Bug className="w-5 h-5 sm:w-6 sm:h-6 text-white dark:text-white light:text-rose-600 relative z-10 transition-transform group-hover:rotate-12" />

            {/* Open issues badge counter */}
            {openIssuesCount > 0 && (
              <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md border-2 border-slate-900 dark:border-slate-950 light:border-white">
                {openIssuesCount > 9 ? '9+' : openIssuesCount}
              </span>
            )}

            {/* Error indicator dot */}
            {consoleErrorsCount > 0 && (
              <span className="absolute bottom-1 end-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 dark:ring-slate-950 light:ring-white animate-ping"></span>
            )}
          </div>
        </button>
      </div>

    </div>
  );
};
