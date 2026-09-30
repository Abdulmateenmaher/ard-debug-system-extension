import React, { useState } from 'react';
import { 
  Download, 
  Chrome, 
  Check, 
  Copy, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Globe, 
  Bookmark, 
  CheckCircle2, 
  FileCode,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import JSZip from 'jszip';
import { useQAData } from '../context/QADataContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface ExtensionDownloaderProps {
  onLaunchSimulator: () => void;
}

export const ExtensionDownloader: React.FC<ExtensionDownloaderProps> = ({ onLaunchSimulator }) => {
  const { activeWebsite } = useQAData();
  const { t } = useThemeLanguage();

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [directActivated, setDirectActivated] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  const embedScriptSnippet = `<!-- ARD Test & Debug Systems Widget -->
<script 
  src="${window.location.origin}/ard-qa-widget.js" 
  data-project="qa-test-3d1c0" 
  data-website-id="${activeWebsite?.id || 'web_store_01'}" 
  async>
</script>`;

  // Bookmarklet code for 0-friction trust bypass
  const bookmarkletCode = `javascript:(function(){var s=document.createElement('script');s.src='${window.location.origin}/ard-qa-widget.js';s.dataset.project='qa-test-3d1c0';s.dataset.websiteId='${activeWebsite?.id || 'web_store_01'}';document.head.appendChild(s);alert('ARD QA Widget Activated on this Page!');})();`;

  const handleAutoDownloadZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();

      // manifest.json (Manifest V3 pre-verified configuration)
      const manifest = {
        manifest_version: 3,
        name: "ARD Test and Debug Systems",
        version: "2.5.0",
        description: "ARD Test and Debug Systems - Professional in-page QA bug logging, visual crop annotations, console error capture, and fixer handoffs synced to Firebase.",
        permissions: [
          "activeTab",
          "scripting",
          "storage"
        ],
        host_permissions: [
          "<all_urls>"
        ],
        action: {
          default_popup: "popup.html",
          default_title: "ARD Test and Debug Systems"
        },
        background: {
          service_worker: "background.js"
        },
        content_scripts: [
          {
            matches: ["<all_urls>"],
            js: ["content.js"],
            css: ["widget.css"],
            run_at: "document_end"
          }
        ]
      };

      // background.js
      const backgroundJs = `// ARD Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("ARD Test and Debug Systems successfully installed and trusted.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureVisibleTab") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse({ dataUrl: dataUrl });
    });
    return true;
  }
});
`;

      // content.js
      const contentJs = `// ARD In-Page Content Script (Grammarly-Style Floating Orb)
(function() {
  if (document.getElementById("ard-floating-root")) return;

  const root = document.createElement("div");
  root.id = "ard-floating-root";
  root.innerHTML = \`
    <div id="ard-orb" title="ARD Test & Debug: Click to report bug">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
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
  \`;
  document.body.appendChild(root);

  const orb = document.getElementById("ard-orb");
  orb.addEventListener("click", () => {
    const appUrl = "${window.location.origin}";
    window.open(appUrl + "?url=" + encodeURIComponent(window.location.href), "_blank");
  });
})();
`;

      // widget.css
      const widgetCss = `#ard-floating-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2147483647;
}

#ard-orb {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e11d48, #4f46e5);
  box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
}

#ard-orb:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(225, 29, 72, 0.6);
}
`;

      // popup.html
      const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 320px;
      margin: 0;
      padding: 16px;
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .logo {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #e11d48, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      box-sizing: border-box;
      margin-bottom: 8px;
    }
    .btn-primary { background: #e11d48; color: white; }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">A</div>
    <div>
      <strong style="font-size:14px;">ARD Test &amp; Debug</strong>
      <div style="font-size:11px;color:#94a3b8;">Firebase qa-test-3d1c0</div>
    </div>
  </div>
  <p style="font-size:12px;color:#94a3b8;margin-bottom:14px;">ARD In-Page Extension is active. Grammarly-style floating bug badge is attached.</p>
  <a class="btn btn-primary" href="${window.location.origin}" target="_blank">Open ARD QA Portal</a>
  <a class="btn btn-secondary" href="${window.location.origin}" target="_blank">View All Issues &amp; Workflow</a>
</body>
</html>
`;

      // 1-Click Trust Bypass launch scripts for Windows & macOS/Linux
      const batScript = `@echo off
echo Starting Google Chrome with ARD Test and Debug Systems extension loaded...
start chrome.exe --load-extension="%~dp0" --disable-extensions-file-access-check --no-first-run
echo ARD QA Extension is now active in Chrome!
`;

      const shScript = `#!/usr/bin/env bash
echo "Launching Google Chrome with ARD Test and Debug Systems loaded..."
EXT_DIR="$(cd "$(dirname "\$0")" && pwd)"
if [[ "\$OSTYPE" == "darwin"* ]]; then
  open -a "Google Chrome" --args --load-extension="\$EXT_DIR" --disable-extensions-file-access-check
else
  google-chrome --load-extension="\$EXT_DIR" --disable-extensions-file-access-check &
fi
echo "ARD QA Extension is now active!"
`;

      // README.md with clear instructions
      const readme = `# ARD Test and Debug Systems - Chrome Extension

## Quick Auto-Install:
- **Windows**: Double-click \`launch_chrome_with_ard_qa.bat\` to instantly start Chrome with the extension enabled and all trust warnings bypassed!
- **Mac / Linux**: Run \`bash launch_chrome_with_ard_qa.sh\`.

## Manual Setup in 3 clicks:
1. Open \`chrome://extensions\` in your Chrome browser.
2. Enable "Developer mode" in the top-right corner.
3. Click "Load unpacked" and pick this extracted folder!

Connected Firebase Database: qa-test-3d1c0
Platform: ARD Test and Debug Systems
`;

      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("background.js", backgroundJs);
      zip.file("content.js", contentJs);
      zip.file("widget.css", widgetCss);
      zip.file("popup.html", popupHtml);
      zip.file("launch_chrome_with_ard_qa.bat", batScript);
      zip.file("launch_chrome_with_ard_qa.sh", shScript);
      zip.file("README.md", readme);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ard-test-and-debug-systems-extension.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (e) {
      console.error("Zip generation error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectInstallAndActivate = () => {
    setDirectActivated(true);
    // Automatically trigger floating widget in current session
    setTimeout(() => {
      onLaunchSimulator();
    }, 800);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(embedScriptSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 3000);
  };

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Hero Installer Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 light:from-slate-100 light:via-white light:to-indigo-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-3xl p-6 sm:p-10 shadow-2xl transition-colors">
        <div className="max-w-3xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 light:text-indigo-700 text-xs font-semibold border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chrome Manifest V3 · Trust-Bypass Self-Installer Included</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-950 tracking-tight leading-tight">
            {t('ext.heroTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
            {t('ext.heroSub')}
          </p>

          {/* Action Buttons: Auto-download & Direct Auto-install */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            
            {/* Automatic Download with Trust Bypass Scripts */}
            <button
              onClick={handleAutoDownloadZip}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isGenerating ? 'Packaging...' : t('ext.autoDownloadBtn')}</span>
            </button>

            {/* 1-Click Direct In-Page Auto-Install & Activate */}
            <button
              onClick={handleDirectInstallAndActivate}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{t('ext.autoInstallBtn')}</span>
            </button>

            {/* Launch In-Page Simulator */}
            <button
              onClick={onLaunchSimulator}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 text-white light:text-slate-900 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 light:border-slate-300 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{t('ext.launchSimulator')}</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 light:text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Extension downloaded! Double-click "launch_chrome_with_ard_qa.bat" (Windows) or load unpacked into Chrome to bypass trust dialogs.</span>
            </div>
          )}

          {directActivated && (
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-200 light:text-indigo-900 text-xs flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{t('ext.directActiveAlert')} Redirecting to target site...</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-Step Trust-Bypass Installation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">
            1
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 mb-2">
            {t('ext.step1Title')}
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
            {t('ext.step1Desc')}
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm mb-4">
            2
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 mb-2">
            {t('ext.step2Title')}
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
            {t('ext.step2Desc')}
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
            3
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 mb-2">
            {t('ext.step3Title')}
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
            {t('ext.step3Desc')}
          </p>
        </div>

      </div>

      {/* 0-Friction Bookmarklet Drag-and-Drop Tool */}
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Instant Bookmarklet (Bypasses Any Chrome Extension Store Warning)</span>
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600">
              Drag this button directly to your Chrome Bookmarks bar. Whenever you are testing ANY website on the web, click the bookmark to immediately inject the ARD QA Grammarly widget!
            </p>
          </div>

          <button
            onClick={handleCopyBookmarklet}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-200 light:text-slate-800 text-xs font-semibold rounded-lg border border-slate-700 light:border-slate-300 self-start sm:self-auto cursor-pointer"
          >
            {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBookmarklet ? 'Copied Bookmarklet Code!' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <a
            href={bookmarkletCode}
            onClick={(e) => {
              e.preventDefault();
              alert("Drag this button to your Bookmarks Bar (Ctrl+Shift+B) to use on any website!");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs rounded-xl shadow-md cursor-grab active:cursor-grabbing"
            title="Drag to your Bookmarks Bar!"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>🐞 ARD QA In-Page Activator</span>
          </a>
          <span className="text-[11px] text-slate-400 light:text-slate-500">
            ← Drag this button to your Chrome Bookmarks Bar
          </span>
        </div>
      </div>

      {/* Embed Script Snippet Generator */}
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>{t('ext.embedTitle')}</span>
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600">
              Paste this script tag into your web application HTML head to enable the widget for your whole testing team:
            </p>
          </div>

          <button
            onClick={handleCopySnippet}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 text-slate-200 light:text-slate-800 text-xs font-semibold rounded-lg border border-slate-700 light:border-slate-300 transition-colors self-start sm:self-auto cursor-pointer"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet ? 'Copied to Clipboard!' : 'Copy Script Tag'}</span>
          </button>
        </div>

        <div className="bg-black/90 p-3 sm:p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
          {embedScriptSnippet}
        </div>
      </div>

    </div>
  );
};
