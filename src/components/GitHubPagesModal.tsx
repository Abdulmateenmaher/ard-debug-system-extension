import React, { useState } from 'react';
import { 
  Github, 
  Check, 
  Copy, 
  ExternalLink, 
  Download, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Sparkles,
  Layers,
  ArrowRight,
  X
} from 'lucide-react';
import JSZip from 'jszip';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useThemeLanguage();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState('');
  const [repoName, setRepoName] = useState('ard-test-debug');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen) return null;

  const repoUrl = githubUser.trim() 
    ? `https://github.com/${githubUser.trim()}/${repoName.trim() || 'ard-test-debug'}` 
    : `https://github.com/YOUR_USERNAME/${repoName.trim() || 'ard-test-debug'}`;

  const pagesUrl = githubUser.trim()
    ? `https://${githubUser.trim()}.github.io/${repoName.trim() || 'ard-test-debug'}/`
    : `https://YOUR_USERNAME.github.io/${repoName.trim() || 'ard-test-debug'}/`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  const handleDownloadDistZip = async () => {
    try {
      setIsExporting(true);
      const zip = new JSZip();

      // Read current HTML
      const htmlContent = document.documentElement.outerHTML;
      zip.file('index.html', htmlContent);
      zip.file('404.html', htmlContent);

      // Add readme with deploy info
      zip.file('README.md', `# ARD Test and Debug Systems - GitHub Pages Build
This archive contains the pre-compiled distribution ready to be deployed to GitHub Pages or any static web host.

## Hosting on GitHub Pages
1. Push to your repo's 'gh-pages' branch OR
2. Upload this folder's contents to your GitHub repo root in a 'gh-pages' branch.
3. In GitHub Settings > Pages, select 'Deploy from a branch' > 'gh-pages' / (root).
`);

      // Add .nojekyll so GitHub Pages doesn't ignore files starting with underscore
      zip.file('.nojekyll', '');

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ard-test-debug-gh-pages-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } catch (err) {
      console.error('Failed to export zip', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 border border-slate-700 dark:border-slate-700 light:border-slate-300 flex items-center justify-center text-white light:text-slate-900 shadow-inner">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{language === 'fa' ? 'انتشار در GitHub Pages' : language === 'ps' ? 'په GitHub Pages کې خپرول' : 'Publish to GitHub Pages'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  {language === 'fa' ? 'آماده انتشار' : language === 'ps' ? 'خپرولو ته چمتو' : 'Deploy Ready'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                {language === 'fa' 
                  ? 'پیکربندی خودکار Vite، گردش‌کار اکشن‌های گیت‌هاب و مسیرهای نسبی' 
                  : language === 'ps'
                  ? 'د Vite اتومات ترتیب، د ګیټ هب ایکشنز او اړوند لارې'
                  : 'Automated Vite relative base setup, GitHub Actions CI/CD workflow & SPA 404 handling'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Readiness Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 rounded-xl border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
                  {language === 'fa' ? 'مسیرهای نسبی Base: ./' : language === 'ps' ? 'اړونده لاره Base: ./' : 'Relative Base: ./'}
                </div>
                <div className="text-[11px] text-slate-400 light:text-slate-600 mt-0.5">
                  {language === 'fa' ? 'فایل‌های CSS/JS بدون خطای ۴۰۴ در زیرشاخه‌ها لود می‌شوند' : language === 'ps' ? 'فایلونه په هر ادرس کې سم چلیږي' : 'Assets load without 404 on any repo subpath'}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 rounded-xl border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
                  {language === 'fa' ? 'اکشن خودکار GitHub' : language === 'ps' ? 'د ګیټ هب اتومات کار' : 'GitHub Actions CI/CD'}
                </div>
                <div className="text-[11px] text-slate-400 light:text-slate-600 mt-0.5">
                  <code className="text-indigo-400 font-mono text-[10px]">.github/workflows/deploy.yml</code>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 rounded-xl border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
                  {language === 'fa' ? 'فایل SPA 404' : language === 'ps' ? 'د SPA 404 فایل' : 'SPA 404 Fallback'}
                </div>
                <div className="text-[11px] text-slate-400 light:text-slate-600 mt-0.5">
                  {language === 'fa' ? 'جلوگیری از خطای رفرش در گیت‌هاب' : language === 'ps' ? 'د رفرش پر مهال د ستونزې مخنیوی' : 'Preserves routing upon browser refresh'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive URL Generator */}
          <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-800/50 to-slate-900/60 rounded-xl border border-indigo-500/20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'fa' ? 'تنظیم آدرس ریپازیتوری شما' : language === 'ps' ? 'ستاسو د ریپوزیټري ادرس تنظیم' : 'Target GitHub Repository Details'}</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  {language === 'fa' ? 'نام کاربری گیت‌هاب (Username)' : language === 'ps' ? 'د ګیټ هب کارن نوم' : 'GitHub Username / Organization'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. your-github-username"
                  value={githubUser}
                  onChange={e => setGithubUser(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 dark:bg-slate-950 light:bg-white border border-slate-700 dark:border-slate-800 light:border-slate-300 rounded-lg text-xs font-mono text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  {language === 'fa' ? 'نام ریپازیتوری (Repository Name)' : language === 'ps' ? 'د ریپوزیټري نوم' : 'Repository Name'}
                </label>
                <input
                  type="text"
                  placeholder="ard-test-debug"
                  value={repoName}
                  onChange={e => setRepoName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 dark:bg-slate-950 light:bg-white border border-slate-700 dark:border-slate-800 light:border-slate-300 rounded-lg text-xs font-mono text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {githubUser && (
              <div className="mt-3 pt-3 border-t border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-300 dark:text-slate-300 light:text-slate-700">
                  {language === 'fa' ? 'آدرس نهایی سایت در GitHub Pages:' : language === 'ps' ? 'په GitHub Pages کې وروستی ادرس:' : 'Your Live GitHub Pages Site URL:'}
                </span>
                <span className="font-mono text-emerald-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-emerald-500/30 break-all">
                  {pagesUrl}
                </span>
              </div>
            )}
          </div>

          {/* Step 1: Git Push Commands */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">1</span>
                <span>{language === 'fa' ? 'ارسال کد به ریپازیتوری گیت‌هاب' : language === 'ps' ? 'ګیټ هب ته د کوډ پورته کول' : 'Push Repository to GitHub'}</span>
              </span>
              <button
                onClick={() => copyToClipboard(`git remote add origin ${repoUrl}.git\ngit branch -M main\ngit push -u origin main`, 'git-push')}
                className="text-[11px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
              >
                {copiedStep === 'git-push' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStep === 'git-push' ? (language === 'fa' ? 'کپی شد!' : language === 'ps' ? 'کاپي شو!' : 'Copied!') : (language === 'fa' ? 'کپی دستورات' : language === 'ps' ? 'کاپي کول' : 'Copy Commands')}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto relative group">
              <div className="text-slate-500 text-[11px] mb-1"># Terminal / Command Prompt</div>
              <div className="text-emerald-400 font-medium">git remote add origin {repoUrl}.git</div>
              <div className="text-sky-300">git branch -M main</div>
              <div className="text-amber-300">git push -u origin main</div>
            </div>
          </div>

          {/* Step 2: GitHub Pages Activation in Repo Settings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">2</span>
                <span>{language === 'fa' ? 'فعال‌سازی در تنظیمات GitHub Repository' : language === 'ps' ? 'د ګیټ هب په ترتیباتو کې فعالول' : 'Enable GitHub Pages in Repo Settings'}</span>
              </span>
              {githubUser && (
                <a
                  href={`${repoUrl}/settings/pages`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  <span>{language === 'fa' ? 'باز کردن تنظیمات ریپازیتوری' : language === 'ps' ? 'د ترتیباتو خلاصول' : 'Open Repo Settings'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="p-3.5 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100 rounded-xl border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 text-xs space-y-2 text-slate-300 dark:text-slate-300 light:text-slate-700">
              <div className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>
                  {language === 'fa' 
                    ? 'به ریپازیتوری خود بروید و روی برگه Settings کلیک کنید.' 
                    : language === 'ps'
                    ? 'خپل ریپوزیټري ته لاړ شئ او Settings وټاکئ.'
                    : 'Navigate to your GitHub Repository and click on Settings.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>
                  {language === 'fa'
                    ? 'در منوی سمت چپ، روی گزینه Pages کلیک کنید.'
                    : language === 'ps'
                    ? 'په چپ مینو کې Pages وټاکئ.'
                    : 'In the left sidebar, click on Pages.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>
                  {language === 'fa'
                    ? 'در بخش Build and deployment، مقدار Source را روی GitHub Actions بگذارید (گردش‌کار خودکار فعال می‌شود).'
                    : language === 'ps'
                    ? 'د Source په برخه کې GitHub Actions وټاکئ.'
                    : 'Under Build and deployment, change Source to "GitHub Actions" (it auto-runs our workflow!).'}
                </span>
              </div>
            </div>
          </div>

          {/* Alternative CLI or Zip Download */}
          <div className="pt-2 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
                {language === 'fa' ? 'روش دستی: دانلود بسته آماده برای انتشار' : language === 'ps' ? 'لاسي طریقه: د خپرولو بسته ډاونلوډ کړئ' : 'Alternative: Instant ZIP Bundle Export'}
              </div>
              <div className="text-[11px] text-slate-400 light:text-slate-600">
                {language === 'fa' ? 'شامل index.html، فایل 404.html، و .nojekyll آماده هاستینگ' : language === 'ps' ? 'ټول چمتو شوي فایلونه په یو کلیک ډاونلوډ کړئ' : 'Exports static bundle with .nojekyll and 404 fallback'}
              </div>
            </div>

            <button
              onClick={handleDownloadDistZip}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {exportComplete ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{language === 'fa' ? 'دانلود شد!' : language === 'ps' ? 'ډاونلوډ شو!' : 'Downloaded!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? (language === 'fa' ? 'در حال بسته‌بندی...' : language === 'ps' ? 'د بسته کولو په حال کې...' : 'Zipping...') : (language === 'fa' ? 'دانلود فایل فشرده (ZIP)' : language === 'ps' ? 'د ZIP ډاونلوډ' : 'Download Static Bundle (ZIP)')}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 light:text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {language === 'fa' ? 'سازگار با تمام دامنه و ساب‌دامین‌های GitHub Pages' : language === 'ps' ? 'د GitHub Pages له هر ډول ادرس سره پوره برابری لري' : 'Fully compatible with custom domains and subpath repos'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 dark:text-slate-200 light:text-slate-800 transition-colors"
          >
            {language === 'fa' ? 'بستن' : language === 'ps' ? 'بندول' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
