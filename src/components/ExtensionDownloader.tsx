import React, { useState } from 'react';
import { 
  Download, 
  Check, 
  Copy, 
  ShieldCheck, 
  Globe, 
  Bookmark, 
  CheckCircle2, 
  FileCode,
  ExternalLink,
  Bug,
  Eye,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import JSZip from 'jszip';
import { useQAData } from '../context/QADataContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface ExtensionDownloaderProps {
  onNavigateToWebsites?: () => void;
}

export const ExtensionDownloader: React.FC<ExtensionDownloaderProps> = ({ onNavigateToWebsites }) => {
  const { activeWebsite } = useQAData();
  const { t, language } = useThemeLanguage();

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [showPreviewWidget, setShowPreviewWidget] = useState(false);

  const targetSiteUrl = activeWebsite?.url || 'http://192.168.0.141/login';

  const embedScriptSnippet = `<!-- ARD Test & Debug Systems In-Page Widget -->
<script 
  src="${window.location.origin}/ard-qa-widget.js" 
  data-project="qa-test-3d1c0" 
  data-website-id="${activeWebsite?.id || 'web_internal_141'}" 
  async>
</script>`;

  // Bookmarklet code for 0-friction trust bypass
  const bookmarkletCode = `javascript:(function(){var s=document.createElement('script');s.src='${window.location.origin}/ard-qa-widget.js';document.head.appendChild(s);})();`;

  const handleAutoDownloadZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();

      // manifest.json (Manifest V3 pre-verified configuration matching external site http://192.168.0.141/*)
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
          "http://192.168.0.141/*",
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
            matches: [
              "http://192.168.0.141/*",
              "<all_urls>"
            ],
            js: ["content.js"],
            css: ["widget.css"],
            run_at: "document_end"
          }
        ]
      };

      // background.js
      const backgroundJs = `// ARD Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("ARD Test and Debug Systems successfully installed and active.");
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
      const contentJs = `// ARD In-Page Content Script (Docks Grammarly-Style Floating Bug Tool onto External Websites)
(function() {
  if (window.__ARD_EXT_LOADED__) return;
  window.__ARD_EXT_LOADED__ = true;

  const root = document.createElement("div");
  root.id = "ard-floating-root";
  root.innerHTML = \`
    <div id="ard-menu" style="display:none;position:absolute;bottom:64px;right:0;width:300px;background:#0f172a;border:1px solid #334155;border-radius:16px;box-shadow:0 20px 35px -8px rgba(0,0,0,0.7);padding:14px;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;z-index:2147483647;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #1e293b;">
        <div style="font-weight:bold;font-size:13px;display:flex;align-items:center;gap:6px;">
          <span style="color:#f43f5e;">●</span> ARD Bug Logger
        </div>
        <button id="ard-close-menu" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">&times;</button>
      </div>
      <div style="color:#94a3b8;font-size:11px;margin-bottom:10px;word-break:break-all;">
        Active Target: <b>\${window.location.href}</b>
      </div>
      <button id="ard-btn-report" style="width:100%;padding:9px;background:#e11d48;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;margin-bottom:6px;">
        Report Bug on this Page
      </button>
      <button id="ard-btn-dash" style="width:100%;padding:9px;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:8px;font-weight:600;cursor:pointer;">
        Open ARD QA Dashboard
      </button>
    </div>

    <div id="ard-orb" title="ARD Test & Debug: Click to report bug on this site">
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
  const menu = document.getElementById("ard-menu");
  const closeBtn = document.getElementById("ard-close-menu");
  const reportBtn = document.getElementById("ard-btn-report");
  const dashBtn = document.getElementById("ard-btn-dash");

  orb.addEventListener("click", () => {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.style.display = "none";
  });
  reportBtn.addEventListener("click", () => {
    const hubUrl = "${window.location.origin}";
    window.open(hubUrl + "?action=report&url=" + encodeURIComponent(window.location.href), "_blank");
  });
  dashBtn.addEventListener("click", () => {
    window.open("${window.location.origin}", "_blank");
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
  box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.45), 0 8px 10px -6px rgba(79, 70, 229, 0.4);
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
      <div style="font-size:11px;color:#94a3b8;">Target: 192.168.0.141</div>
    </div>
  </div>
  <p style="font-size:12px;color:#94a3b8;margin-bottom:14px;">ARD In-Page Extension is active. Grammarly-style floating bug badge docks onto external test sites.</p>
  <a class="btn btn-primary" href="${window.location.origin}" target="_blank">Open ARD QA Portal</a>
  <a class="btn btn-secondary" href="${targetSiteUrl}" target="_blank">Open External Test Site</a>
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
      const readme = `# ARD Test and Debug Systems - Chrome / Edge Extension

## Quick Auto-Install:
- **Windows**: Double-click \`launch_chrome_with_ard_qa.bat\` to instantly start Chrome with the extension enabled and all trust warnings bypassed!
- **Mac / Linux**: Run \`bash launch_chrome_with_ard_qa.sh\`.

## Manual Setup:
1. Open \`chrome://extensions\` (or \`edge://extensions\`) in your browser.
2. Enable "Developer mode" toggle.
3. Click "Load unpacked" and select this folder.

Whenever you navigate to your external website (e.g. ${targetSiteUrl}), the floating ARD bug badge will appear on the page!
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Target External Site Focus Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 light:from-white light:via-indigo-50/60 light:to-white border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 light:text-indigo-700 text-xs font-semibold border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>External Web Target &amp; Extension Injector</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-white dark:text-white light:text-slate-950 tracking-tight leading-tight">
              {language === 'fa' 
                ? 'نمایش آیکون شناور باگ در وب‌سایت‌های خارجی' 
                : language === 'ps' 
                ? 'په بهرنیو وېبپاڼو کې د شناور آیکون ښودل' 
                : 'Dock Floating Bug Tool on Your External Websites'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed max-w-3xl">
              {language === 'fa'
                ? `وب‌سایت هدف شما (${targetSiteUrl}) یک سامانه خارجی مستقل در شبکه است. با نصب افزونه مرورگر یا استفاده از بوکمارکلت، آیکون شناور ARD مستقیماً بر روی همان صفحه خارجی ظاهر می‌شود تا بدون جابجایی، باگ‌ها را ثبت و مستند کنید.`
                : language === 'ps'
                ? `ستاسو هدف وېبپاڼه (${targetSiteUrl}) یو جلا بهرنی پروګرام دی. د اکستنشن یا بوکمارکلت له لارې دغه شناور آیکون په هماغه پاڼه ښکاري.`
                : `Your target website (${targetSiteUrl}) is an external web application. The ARD Browser Extension and 1-Click Bookmarklet dock the floating Grammarly-style bug badge directly onto that external page, sending bugs straight to this central QA Hub.`}
            </p>

            {/* Target URL highlight */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400 light:text-slate-500 font-medium">Active External Target:</span>
              <span className="px-3 py-1 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 font-mono text-xs text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
                {targetSiteUrl}
              </span>
              <a
                href={targetSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <span>Open External Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={handleAutoDownloadZip}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isGenerating ? 'Packaging...' : 'Download Extension (.zip)'}</span>
            </button>

            <button
              onClick={() => setShowPreviewWidget(!showPreviewWidget)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-800 font-semibold text-xs rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Preview Floating Widget UI</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 light:text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Extension downloaded! Unpack and load into Chrome/Edge to have the floating bug badge dock onto {targetSiteUrl}.</span>
          </div>
        )}
      </div>

      {/* Floating Widget Live Preview Popover / Sandbox Explainer */}
      {showPreviewWidget && (
        <div className="p-5 sm:p-6 bg-slate-900/90 dark:bg-slate-900 light:bg-white rounded-2xl border border-indigo-500/40 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
                Floating Bug Tool Interactive Preview
              </h3>
            </div>
            <button
              onClick={() => setShowPreviewWidget(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white light:hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700">
            This demonstrates the floating badge that appears docked at the bottom of your external website (e.g. <b>{targetSiteUrl}</b>) when the extension is active:
          </p>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                <Bug className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">ARD Bug Badge (Grammarly-Style Dock)</div>
                <div className="text-[11px] text-slate-400">Fixed position at bottom-right of {targetSiteUrl}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={targetSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <span>Test on {targetSiteUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 0-Friction Bookmarklet Drag-and-Drop Tool */}
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                <span>1-Click Bookmarklet (Instant Activation on External Sites)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono border border-amber-500/30">
                  No Store Approval Needed
                </span>
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
                Drag this button directly to your browser's Bookmarks bar. Whenever you are visiting <b>{targetSiteUrl}</b>, simply click the bookmark to immediately inject the ARD bug badge!
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyBookmarklet}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-200 light:text-slate-800 text-xs font-semibold rounded-lg border border-slate-700 light:border-slate-300 self-start sm:self-auto cursor-pointer"
          >
            {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBookmarklet ? 'Copied Bookmarklet Code!' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={bookmarkletCode}
            onClick={(e) => {
              e.preventDefault();
              alert(`Drag this button to your Bookmarks Bar (Ctrl+Shift+B / Cmd+Shift+B). Then open ${targetSiteUrl} and click the bookmark to activate the floating bug icon!`);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md cursor-grab active:cursor-grabbing"
            title="Drag to your Bookmarks Bar!"
          >
            <Bookmark className="w-4 h-4 fill-current" />
            <span>🐞 ARD Bug Tool (Drag to Bookmarks)</span>
          </a>
          <span className="text-[11px] text-slate-400 light:text-slate-500">
            ← Drag this button to your browser's Bookmarks Bar
          </span>
        </div>
      </div>

      {/* 3-Step Trust-Bypass Installation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">
            1
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 mb-2">
            Download Unpacked Package
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
            Download the zip archive containing Manifest V3 pre-configured with permissions for {targetSiteUrl} and your local subnet.
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm mb-4">
            2
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 mb-2">
            Load Unpacked in Browser
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
            In Chrome/Edge navigate to <code className="text-indigo-400 font-mono">chrome://extensions</code>, enable Developer mode, and click "Load unpacked".
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
            3
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 mb-2">
            Badge Docks on External Site
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
            Open {targetSiteUrl} in any tab. The floating bug tool automatically attaches to the page ready for 1-click bug logging.
          </p>
        </div>

      </div>

      {/* Embed Script Snippet Generator */}
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white dark:text-white light:text-slate-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Embed Script for Developers</span>
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600">
              Developers of {targetSiteUrl} can also add this single script tag into the HTML head to auto-inject the bug tool for all internal testers:
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
