import React, { useState } from 'react';
import { 
  Bug, 
  Crop, 
  Image as ImageIcon, 
  AlertCircle, 
  User, 
  AtSign, 
  Check, 
  X, 
  Trash2, 
  Upload, 
  Terminal, 
  Camera,
  Plus
} from 'lucide-react';
import { useQAData } from '../context/QADataContext';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { PriorityLevel, ImageAttachment, ConsoleEntry } from '../types/qa';
import { ScreenshotCropModal } from './ScreenshotCropModal';

interface IssueReportModalProps {
  onClose: () => void;
  pageUrl?: string;
  viewport?: string;
  initialLogs?: ConsoleEntry[];
  initialImage?: ImageAttachment;
}

export const IssueReportModal: React.FC<IssueReportModalProps> = ({
  onClose,
  pageUrl = 'https://demo-shopsphere.store/cart',
  viewport = '1440x900',
  initialLogs = [],
  initialImage
}) => {
  const { activeWebsiteId, createIssue, teamMembers } = useQAData();
  const { user } = useAuth();
  const { t } = useThemeLanguage();

  const [title, setTitle] = useState('');
  const [generalDesc, setGeneralDesc] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('emergency');
  
  // Assign primary fixer
  const fixers = teamMembers.filter(m => m.role === 'fixer' || m.role === 'admin');
  const [assignedFixerId, setAssignedFixerId] = useState<string>(fixers[0]?.uid || 'dev_user_fixer_01');
  
  // Mention multiple fixers
  const [mentionedFixers, setMentionedFixers] = useState<string[]>([]);
  const [mentionInput, setMentionInput] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);

  // Multi-image attachments with descriptions
  const [images, setImages] = useState<ImageAttachment[]>(initialImage ? [initialImage] : []);
  const [showCropStudio, setShowCropStudio] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle image upload from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newImg: ImageAttachment = {
          id: 'img_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          dataUrl,
          description: `Attachment: ${file.name}`,
          fileName: file.name,
          timestamp: new Date().toISOString()
        };
        setImages(prev => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 1-Click snap current site feature
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
      ctx.fillText(`Target Webpage Snapshot: ${pageUrl}`, 70, 90);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(`Timestamp: ${new Date().toLocaleString()} | Viewport: ${viewport}`, 70, 125);

      ctx.fillStyle = '#334155';
      ctx.roundRect(70, 160, canvas.width - 140, 400, 12);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.font = '16px sans-serif';
      ctx.fillText('Live In-Page State Captured by ARD Test & Debug Systems', 100, 220);

      const dataUrl = canvas.toDataURL('image/png');
      const snapImg: ImageAttachment = {
        id: 'img_live_' + Date.now().toString(36),
        dataUrl,
        description: `Snapshot of active site at ${pageUrl}`,
        fileName: `active_site_${Date.now()}.png`,
        timestamp: new Date().toISOString()
      };
      setImages(prev => [...prev, snapImg]);
    }
  };

  const handleUpdateImageDescription = (id: string, newDesc: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, description: newDesc } : img));
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAddMention = (fixerName: string) => {
    if (!mentionedFixers.includes(fixerName)) {
      setMentionedFixers(prev => [...prev, fixerName]);
    }
    setMentionInput('');
    setShowMentionSuggestions(false);
  };

  const handleRemoveMention = (name: string) => {
    setMentionedFixers(prev => prev.filter(m => m !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage(t('modal.issueTitlePlaceholder'));
      return;
    }

    if (user?.isRestricted) {
      setErrorMessage(t('team.restrictedNotice'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const selectedFixer = fixers.find(f => f.uid === assignedFixerId) || fixers[0];

      await createIssue({
        websiteId: activeWebsiteId,
        title: title.trim(),
        generalDesc: generalDesc.trim() || 'No detailed description provided.',
        stepsToReproduce: stepsToReproduce.trim(),
        expectedBehavior: expectedBehavior.trim(),
        actualBehavior: actualBehavior.trim(),
        priority,
        status: 'pending',
        reporterId: user?.uid || 'guest_debugger',
        reporterName: user?.displayName || 'QA Debugger',
        reporterEmail: user?.email || 'qa@ard.internal',
        assignedFixerId: selectedFixer?.uid || 'dev_user_fixer_01',
        assignedFixerName: selectedFixer?.displayName || 'Unassigned',
        mentionedFixers,
        images,
        url: pageUrl,
        viewport,
        browser: 'Chrome 134 (Desktop / WebKit)',
        os: 'macOS 15.3 Sequoia',
        consoleLogs: initialLogs.length > 0 ? initialLogs : [
          { type: 'error', message: 'TypeError: Cannot read property "mount" of undefined at checkout.bundle.js:84', timestamp: '15:30:12' }
        ]
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit issue to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl w-full max-w-3xl shadow-2xl text-white light:text-slate-900 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
                <Bug className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-start">
                <h3 className="font-bold text-sm sm:text-base leading-tight">{t('modal.registerTitle')}</h3>
                <p className="text-[11px] text-slate-400 light:text-slate-500 truncate max-w-xs sm:max-w-md">{t('modal.registerSub')}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white light:hover:text-black p-1.5 rounded-lg hover:bg-slate-800 light:hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 light:text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5 text-start">
                {t('modal.issueTitle')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('modal.issueTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs sm:text-sm text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Priority (Emergency Red, High Orange, Normal Yellow/Green, Low Blue) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5 text-start">
                {t('modal.priority')} <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'emergency', labelKey: 'priority.emergency', descKey: 'priority.emergencyDesc', color: 'border-red-500/80 bg-red-500/10 text-red-300 light:text-red-700 ring-red-500', dot: 'bg-red-500' },
                  { id: 'high', labelKey: 'priority.high', descKey: 'priority.highDesc', color: 'border-orange-500/80 bg-orange-500/10 text-orange-300 light:text-orange-700 ring-orange-500', dot: 'bg-orange-500' },
                  { id: 'normal', labelKey: 'priority.normal', descKey: 'priority.normalDesc', color: 'border-yellow-500/80 bg-yellow-500/10 text-yellow-300 light:text-yellow-700 ring-yellow-500', dot: 'bg-yellow-500' },
                  { id: 'low', labelKey: 'priority.low', descKey: 'priority.lowDesc', color: 'border-sky-500/80 bg-sky-500/10 text-sky-300 light:text-sky-700 ring-sky-500', dot: 'bg-sky-500' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as PriorityLevel)}
                    className={`flex flex-col text-start p-2.5 rounded-xl border transition-all cursor-pointer ${
                      priority === p.id 
                        ? `${p.color} ring-2 shadow-md` 
                        : 'border-slate-700 dark:border-slate-700 light:border-slate-300 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 text-slate-400 light:text-slate-600 hover:bg-slate-800 light:hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`}></span>
                      <span className="font-semibold text-xs text-white dark:text-white light:text-slate-900">{t(p.labelKey).split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 light:text-slate-500">{t(p.descKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fixer Assignment & Mentions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Assign to Primary Fixer */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-start">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('modal.assignFixer')}</span>
                </label>
                <select
                  value={assignedFixerId}
                  onChange={(e) => setAssignedFixerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {fixers.map(f => (
                    <option key={f.uid} value={f.uid}>
                      {f.displayName} ({f.role === 'admin' ? 'Admin' : 'Developer'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mention Multiple Fixers (@) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-start">
                  <AtSign className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t('modal.mentionFixers')}</span>
                </label>
                
                <div className="relative">
                  <div className="flex items-center gap-1.5 flex-wrap p-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl min-h-[38px]">
                    {mentionedFixers.map(name => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 light:text-indigo-700 text-[11px] font-medium border border-indigo-500/30"
                      >
                        @{name.split(' ')[0]}
                        <button
                          type="button"
                          onClick={() => handleRemoveMention(name)}
                          className="hover:text-white light:hover:text-black cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    
                    <input
                      type="text"
                      placeholder={mentionedFixers.length === 0 ? "@mention..." : "..."}
                      value={mentionInput}
                      onChange={(e) => {
                        setMentionInput(e.target.value);
                        setShowMentionSuggestions(true);
                      }}
                      onFocus={() => setShowMentionSuggestions(true)}
                      className="bg-transparent text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none flex-1 min-w-[80px]"
                    />
                  </div>

                  {showMentionSuggestions && (
                    <div className="absolute top-full start-0 mt-1 w-full bg-slate-800 dark:bg-slate-850 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl shadow-xl p-1 z-30 max-h-40 overflow-y-auto">
                      {fixers
                        .filter(f => !mentionedFixers.includes(f.displayName))
                        .map(f => (
                          <button
                            key={f.uid}
                            type="button"
                            onClick={() => handleAddMention(f.displayName)}
                            className="w-full text-start px-3 py-1.5 text-xs text-slate-200 light:text-slate-800 hover:bg-slate-700/50 light:hover:bg-slate-100 rounded-lg flex items-center justify-between cursor-pointer"
                          >
                            <span>@{f.displayName}</span>
                            <span className="text-[10px] text-slate-400">{f.email}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Screenshots & Multi-Image Gallery */}
            <div>
              <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                <label className="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-start">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('modal.evidence')} ({images.length})</span>
                </label>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleSnapCurrentSite}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    title={t('modal.snapNow')}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('modal.snapNow').split(' ')[0]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCropStudio(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>{t('modal.cropAnnotate')}</span>
                  </button>

                  <label className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 light:text-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-slate-700 light:border-slate-300">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('modal.uploadImage')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {images.length === 0 ? (
                <div 
                  onClick={() => setShowCropStudio(true)}
                  className="border-2 border-dashed border-slate-700 dark:border-slate-700 light:border-slate-300 hover:border-indigo-500/60 rounded-xl p-5 text-center cursor-pointer bg-slate-800/30 dark:bg-slate-800/30 light:bg-slate-50 transition-colors"
                >
                  <Crop className="w-7 h-7 text-indigo-400 mx-auto mb-1.5 opacity-80" />
                  <p className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">{t('modal.noEvidence')}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{t('modal.clickCrop')}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {images.map((img, idx) => (
                    <div 
                      key={img.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/80 dark:border-slate-700 light:border-slate-300 rounded-xl"
                    >
                      <div className="w-20 h-16 rounded-lg bg-black overflow-hidden border border-slate-700 shrink-0">
                        <img 
                          src={img.dataUrl} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 w-full space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 light:text-slate-500">
                          <span className="font-mono text-slate-300 light:text-slate-800 font-medium">#{idx + 1}: {img.fileName}</span>
                          <span>{new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Specific description for this screenshot..."
                          value={img.description}
                          onChange={(e) => handleUpdateImageDescription(img.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700 light:hover:bg-slate-200 self-end sm:self-center transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Description & Reproduction */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5 text-start">
                  {t('modal.generalDesc')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('modal.descPlaceholder')}
                  value={generalDesc}
                  onChange={(e) => setGeneralDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 light:text-slate-600 mb-1 text-start">
                    {t('modal.steps')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="1. Go to cart&#10;2. Click apply coupon..."
                    value={stepsToReproduce}
                    onChange={(e) => setStepsToReproduce(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 light:text-slate-600 mb-1 text-start">
                    {t('modal.expectedVsActual')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Expected: 20% discount&#10;Actual: 40% discount deducted"
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Auto-Captured Environment Telemetry */}
            <div className="p-3 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-400 light:text-slate-600">
              <div className="font-semibold text-slate-300 dark:text-slate-300 light:text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('modal.telemetry')}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="truncate">
                  <span className="text-slate-500">Site: </span>
                  <span className="text-slate-300 light:text-slate-800 font-mono truncate">{pageUrl}</span>
                </div>
                <div>
                  <span className="text-slate-500">Viewport: </span>
                  <span className="text-slate-300 light:text-slate-800 font-mono">{viewport}</span>
                </div>
                <div>
                  <span className="text-slate-500">Browser: </span>
                  <span className="text-slate-300 light:text-slate-800 font-mono">Chrome 134 / macOS</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-400 light:text-slate-600 flex items-center gap-1.5">
                <span>Reporter:</span>
                <span className="text-white dark:text-white light:text-slate-900 font-medium">{user?.displayName || 'QA Debugger'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 text-slate-300 light:text-slate-800 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitting ? t('modal.submitting') : t('modal.submit')}</span>
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>

      {/* Embedded Screenshot Crop Studio if requested */}
      {showCropStudio && (
        <ScreenshotCropModal
          pageUrl={pageUrl}
          onClose={() => setShowCropStudio(false)}
          onSaveCrop={(attachment) => {
            setImages(prev => [...prev, attachment]);
          }}
        />
      )}
    </>
  );
};
