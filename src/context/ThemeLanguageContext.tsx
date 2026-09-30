import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'en' | 'fa' | 'ps';
export type AppTheme = 'light' | 'dark' | 'system';

interface ThemeLanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  effectiveTheme: 'light' | 'dark';
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Brand & Header
    'brand.title': 'ARD Test & Debug Systems',
    'brand.sub': 'Professional QA Platform',
    'brand.extTag': 'QA EXT',
    'nav.sandbox': 'In-Page QA Testbed',
    'nav.dashboard': 'Issues & Workflow',
    'nav.team': 'Fixers & Team',
    'nav.backup': 'Backup & Export',
    'nav.download': 'Download Ext',
    'nav.logBug': 'Log Bug',
    'nav.switchPersona': 'Switch Role Persona',
    'nav.firebase': 'Firebase',
    'nav.targetWebsite': 'Target Website',
    'nav.addWebsite': 'Add Target Website',
    'nav.allWebsites': 'Isolated Website Databases',

    // Priorities
    'priority.emergency': 'Emergency (Red)',
    'priority.emergencyDesc': 'Blocker / App crash',
    'priority.high': 'High (Orange)',
    'priority.highDesc': 'Major workflow glitch',
    'priority.normal': 'Normal (Yellow)',
    'priority.normalDesc': 'Standard defect',
    'priority.low': 'Low (Blue)',
    'priority.lowDesc': 'Minor cosmetic issue',

    // Status tabs
    'status.all': 'All Issues',
    'status.pending': 'Pending Review',
    'status.in_progress': 'In Progress',
    'status.fixed': 'Fixed / Resolved',
    'status.delayed': 'Delayed / Blocked',
    'status.discarded': 'Discarded',

    // Floating Grammarly Widget
    'widget.title': 'ARD In-Page QA',
    'widget.activeOnPage': 'Extension Active on this Page',
    'widget.registerBug': 'Register New Bug',
    'widget.cropArea': 'Screenshot & Crop Area',
    'widget.seeAllIssues': 'See All Issues & To-Do',
    'widget.console': 'Console & Diagnostics',
    'widget.snapWebpage': 'Instant Webpage Screenshot',
    'widget.clickTooltip': 'Click to Log Bug or Crop Screen',

    // Modal & Form
    'modal.registerTitle': 'Register New Bug / Problem',
    'modal.registerSub': 'Capture visual evidence, assign fixers, and log diagnostics',
    'modal.issueTitle': 'Issue Summary / Title',
    'modal.issueTitlePlaceholder': 'e.g. Checkout modal hangs on 3D-Secure card verification...',
    'modal.priority': 'Priority Level (Color Coded)',
    'modal.assignFixer': 'Assign Primary Fixer (Dev)',
    'modal.mentionFixers': 'Mention Multiple Fixers',
    'modal.evidence': 'Screenshots & Visual Evidence',
    'modal.cropAnnotate': 'Crop & Annotate',
    'modal.uploadImage': 'Upload Image',
    'modal.noEvidence': 'No screenshots attached yet',
    'modal.clickCrop': 'Click to crop area of target website or upload from disk',
    'modal.generalDesc': 'General Description',
    'modal.descPlaceholder': 'Explain the symptom, root problem, or behavior observed...',
    'modal.steps': 'Steps to Reproduce',
    'modal.expectedVsActual': 'Expected vs Actual',
    'modal.telemetry': 'Auto-Captured Environment Telemetry',
    'modal.cancel': 'Cancel',
    'modal.submit': 'Register Bug to Team',
    'modal.submitting': 'Registering...',
    'modal.snapNow': 'Snap Current Active Webpage',

    // Forward
    'forward.btn': 'Forward to Fixer',
    'forward.title': 'Forward Issue to Next Fixer',
    'forward.targetLabel': 'Target Fixer (Developer)',
    'forward.noteLabel': 'Handoff Note / Context',
    'forward.confirm': 'Forward Issue',
    'forward.history': 'Fixer Handoff & Forward History',

    // Team
    'team.title': 'Fixers, Debuggers & Team Access',
    'team.sub': 'Fixers and admins can update permissions, restrict debuggers, or remove inactive members.',
    'team.addMember': 'Add Member',
    'team.searchPlaceholder': 'Filter team members by name or email...',
    'team.restrict': 'Restrict Debugger',
    'team.unrestrict': 'Unrestrict Debugger',
    'team.restrictedNotice': 'This debugger is restricted from logging new bugs or altering tickets.',
    'team.accountStatus': 'Account Status',
    'team.active': 'Active & Allowed',
    'team.restricted': 'Restricted',

    // Backup
    'backup.title': 'Database Backup, Recovery & Export',
    'backup.sub': 'Export issues to JSON or CSV, create snapshot archives, and execute disaster recovery restores.',
    'backup.jsonTitle': 'Full Database JSON Backup',
    'backup.csvTitle': 'Export Issues to CSV',
    'backup.restoreTitle': 'Disaster Recovery Restore',
    'backup.downloadJson': 'Download JSON Backup',
    'backup.downloadCsv': 'Export CSV Spreadsheet',
    'backup.selectRestore': 'Select Backup File to Restore',
    'backup.print': 'Print Audit Summary',

    // Extension & Auto-install
    'ext.heroTitle': 'Deploy ARD Test & Debug Systems to Any Browser & Site',
    'ext.heroSub': 'Auto-download ready package, bypass Chrome trust prompts, or run 1-click in-page auto-installer.',
    'ext.autoDownloadBtn': 'Auto-Download Extension (.zip)',
    'ext.autoInstallBtn': '1-Click Direct Auto-Install & Activate',
    'ext.launchSimulator': 'Launch Live In-Page QA Simulator',
    'ext.step1Title': '1-Click Auto Download',
    'ext.step1Desc': 'Direct package with Manifest V3 and preconfigured Firebase connection.',
    'ext.step2Title': 'Auto Load in Chrome',
    'ext.step2Desc': 'In chrome://extensions toggle Developer mode, click Load unpacked.',
    'ext.step3Title': 'Grammarly Icon Appears',
    'ext.step3Desc': 'The floating ARD bug badge docks right onto any webpage tested.',
    'ext.directActiveAlert': 'ARD QA In-Page Extension activated directly on this session!',
    'ext.embedTitle': 'Embed Script for Any Website',

    // Theme & Language
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'theme.system': 'System Default',
    'lang.en': 'English',
    'lang.fa': 'دری (Dari)',
    'lang.ps': 'پښتو (Pashto)',
  },
  fa: {
    // Brand & Header (Dari)
    'brand.title': 'سیستم‌های تست و اشکال‌زدایی ARD',
    'brand.sub': 'پلتفرم حرفه‌ای تضمین کیفیت نرم‌افزار',
    'brand.extTag': 'افزونه QA',
    'nav.sandbox': 'محیط تست زنده وب‌سایت',
    'nav.dashboard': 'مشکلات و روند کاری',
    'nav.team': 'توسعه‌دهندگان و تیم',
    'nav.backup': 'پشتیبان‌گیری و خروجی',
    'nav.download': 'دانلود افزونه',
    'nav.logBug': 'ثبت باگ',
    'nav.switchPersona': 'تغییر نقش کاربری',
    'nav.firebase': 'فایربیس',
    'nav.targetWebsite': 'وب‌سایت هدف',
    'nav.addWebsite': 'افزودن وب‌سایت هدف',
    'nav.allWebsites': 'دیتابیس‌های مجزای وب‌سایت',

    // Priorities
    'priority.emergency': 'اضطراری (سرخ)',
    'priority.emergencyDesc': 'مسدودکننده / توقف کامل برنامه',
    'priority.high': 'بالا (نارنجی)',
    'priority.highDesc': 'اشکال عمده در روند کاری',
    'priority.normal': 'عادی (زرد)',
    'priority.normalDesc': 'اشکال استاندارد',
    'priority.low': 'پایین (آبی)',
    'priority.lowDesc': 'مورد ظاهری جزئی',

    // Status tabs
    'status.all': 'تمام مشکلات',
    'status.pending': 'در انتظار بررسی',
    'status.in_progress': 'در حال کار',
    'status.fixed': 'حل‌شده / رفع‌گردیده',
    'status.delayed': 'به‌تعویق‌افتاده / متوقف',
    'status.discarded': 'رد شده',

    // Floating Grammarly Widget
    'widget.title': 'ابزار تضمین کیفیت ARD',
    'widget.activeOnPage': 'افزونه در این صفحه فعال است',
    'widget.registerBug': 'ثبت باگ / مشکل جدید',
    'widget.cropArea': 'عکس صفحه و برش محدوده',
    'widget.seeAllIssues': 'مشاهده تمام مشکلات و کارها',
    'widget.console': 'کنسول و خطایابی',
    'widget.snapWebpage': 'عکس فوری از وب‌سایت فعلی',
    'widget.clickTooltip': 'برای ثبت باگ یا برش صفحه کلیک کنید',

    // Modal & Form
    'modal.registerTitle': 'ثبت باگ یا مشکل جدید',
    'modal.registerSub': 'ثبت شواهد تصویری، انتساب به سازنده و بررسی خطاهای سیستم',
    'modal.issueTitle': 'عنوان / خلاصه مشکل',
    'modal.issueTitlePlaceholder': 'مثلاً: پنجره پرداخت در مرحله تایید بانکی متوقف می‌شود...',
    'modal.priority': 'درجه اولویت (دارای رنگ)',
    'modal.assignFixer': 'انتساب به توسعه‌دهنده اصلی',
    'modal.mentionFixers': 'اشاره به چندین توسعه‌دهنده (@)',
    'modal.evidence': 'عکس‌های صفحه و شواهد تصویری',
    'modal.cropAnnotate': 'برش و علامت‌گذاری',
    'modal.uploadImage': 'بارگذاری عکس',
    'modal.noEvidence': 'هنوز عکسی ضمیمه نشده است',
    'modal.clickCrop': 'برای برش محدوده باگ از وب‌سایت یا بارگذاری کلیک کنید',
    'modal.generalDesc': 'توضیحات عمومی',
    'modal.descPlaceholder': 'نشانه، علت احتمالی یا رفتار مشاهده شده را شرح دهید...',
    'modal.steps': 'مراحل بازآفرینی باگ',
    'modal.expectedVsActual': 'رفتار مورد انتظار در برابر رفتار واقعی',
    'modal.telemetry': 'اطلاعات محیطی ضبط‌شده به صورت خودکار',
    'modal.cancel': 'انصراف',
    'modal.submit': 'ارسال باگ به تیم',
    'modal.submitting': 'در حال ثبت...',
    'modal.snapNow': 'عکسبرداری خودکار از صفحه فعال',

    // Forward
    'forward.btn': 'ارجاع به توسعه‌دهنده',
    'forward.title': 'ارجاع مشکل به توسعه‌دهنده دیگر',
    'forward.targetLabel': 'توسعه‌دهنده مقصد',
    'forward.noteLabel': 'یادداشت ارجاع و توضیحات',
    'forward.confirm': 'تایید و ارجاع',
    'forward.history': 'تاریخچه ارجاع‌های مشکل',

    // Team
    'team.title': 'توسعه‌دهندگان، آزمایش‌کنندگان و دسترسی‌ها',
    'team.sub': 'مدیران و توسعه‌دهندگان می‌توانند نقش‌ها را ویرایش و آزمایش‌کنندگان را محدود کنند.',
    'team.addMember': 'افزودن عضو جدید',
    'team.searchPlaceholder': 'جستجو در اعضا بر اساس نام یا ایمیل...',
    'team.restrict': 'محدود کردن آزمایش‌کننده',
    'team.unrestrict': 'رفع محدودیت آزمایش‌کننده',
    'team.restrictedNotice': 'این آزمایش‌کننده از ثبت باگ جدید یا ویرایش اطلاعات منع شده است.',
    'team.accountStatus': 'وضعیت حساب',
    'team.active': 'فعال و مجاز',
    'team.restricted': 'محدود شده',

    // Backup
    'backup.title': 'پشتیبان‌گیری، بازیابی و خروجی دیتابیس',
    'backup.sub': 'خروجی به صورت JSON و CSV، ایجاد پشتیبان و بازیابی کامل اطلاعات.',
    'backup.jsonTitle': 'پشتیبان کامل دیتابیس به فرمت JSON',
    'backup.csvTitle': 'خروجی مشکلات به فرمت جدول CSV',
    'backup.restoreTitle': 'بازیابی اطلاعات از فایل پشتیبان',
    'backup.downloadJson': 'دانلود پشتیبان JSON',
    'backup.downloadCsv': 'دانلود خروجی CSV',
    'backup.selectRestore': 'انتخاب فایل پشتیبان جهت بازیابی',
    'backup.print': 'چاپ گزارش ارزیابی باگ‌ها',

    // Extension & Auto-install
    'ext.heroTitle': 'راه‌اندازی سیستم‌های تست و اشکال‌زدایی ARD در هر مرورگر',
    'ext.heroSub': 'دانلود خودکار بسته افزونه، عبور از محدودیت‌های کروم و نصب مستقیم با یک کلیک.',
    'ext.autoDownloadBtn': 'دانلود خودکار افزونه (.zip)',
    'ext.autoInstallBtn': 'نصب و فعال‌سازی مستقیم با ۱ کلیک',
    'ext.launchSimulator': 'اجرای شبیه‌ساز زنده در صفحه',
    'ext.step1Title': 'دانلود خودکار',
    'ext.step1Desc': 'بسته آماده Manifest V3 متصل به فایربیس.',
    'ext.step2Title': 'بارگذاری در کروم',
    'ext.step2Desc': 'در chrome://extensions حالت توسعه‌دهنده را روشن و Load unpacked را بزنید.',
    'ext.step3Title': 'ظاهر شدن آیکون شناور',
    'ext.step3Desc': 'نشانگر شناور ARD مثل گرامرلی روی هر سایت تست ظاهر می‌شود.',
    'ext.directActiveAlert': 'افزونه ARD به طور مستقیم در این تب فعال گردید!',
    'ext.embedTitle': 'کد اسکریپت جهت جایگذاری در هر سایت',

    // Theme & Language
    'theme.light': 'حالت روشن',
    'theme.dark': 'حالت تاریک',
    'theme.system': 'پیش‌فرض سیستم',
    'lang.en': 'English',
    'lang.fa': 'دری (Dari)',
    'lang.ps': 'پښتو (Pashto)',
  },
  ps: {
    // Brand & Header (Pashto)
    'brand.title': 'د ARD د ټیسټ او ډیبګ سیسټمونه',
    'brand.sub': 'د سافټویر د کیفیت تضمین مسلکي پلیټفارم',
    'brand.extTag': 'د QA اکستنشن',
    'nav.sandbox': 'په پاڼه کې د ازموینې ساحه',
    'nav.dashboard': 'ستونزې او د کار بهیر',
    'nav.team': 'جوړوونکي او ډله',
    'nav.backup': 'بیک اپ او صادرول',
    'nav.download': 'اکستنشن کښته کول',
    'nav.logBug': 'خرابي ثبتول',
    'nav.switchPersona': 'د رول بدلول',
    'nav.firebase': 'فایربیس',
    'nav.targetWebsite': 'هدف ویب پاڼه',
    'nav.addWebsite': 'نوې هدف ویب پاڼه ورزیاتول',
    'nav.allWebsites': 'د هرې ویب پاڼې جلا ډیټابیسونه',

    // Priorities
    'priority.emergency': 'بېړنی (سور)',
    'priority.emergencyDesc': 'بندیز کوونکی / د پروګرام بشپړ درېدل',
    'priority.high': 'لوړ (نارنجي)',
    'priority.highDesc': 'په کاري بهیر کې لویه ستونزه',
    'priority.normal': 'نورمال (ژېړ)',
    'priority.normalDesc': 'معیاري ستونزه',
    'priority.low': 'ټیټ (آبي)',
    'priority.lowDesc': 'کوچنۍ ظاهري مسله',

    // Status tabs
    'status.all': 'ټولې ستونزې',
    'status.pending': 'د کتنې په تمه',
    'status.in_progress': 'تر کار لاندې',
    'status.fixed': 'حل شوې / جوړه شوې',
    'status.delayed': 'ځنډول شوې / بنده شوې',
    'status.discarded': 'رد شوې',

    // Floating Grammarly Widget
    'widget.title': 'د ARD په پاڼه کې د ازموینې وسیله',
    'widget.activeOnPage': 'اکستنشن په دې پاڼه فعال دی',
    'widget.registerBug': 'نوې ستونزه ثبتول',
    'widget.cropArea': 'د پردې عکس او ټوټه کول',
    'widget.seeAllIssues': 'ټولې ستونزې او کارونه کتل',
    'widget.console': 'کنسول او معلومات',
    'widget.snapWebpage': 'د اوسنۍ ویب پاڼې چټک انځور اخیستل',
    'widget.clickTooltip': 'د خرابۍ ثبتولو یا سکرین کراپ لپاره کلیک وکړئ',

    // Modal & Form
    'modal.registerTitle': 'د نوې خرابۍ یا ستونزې ثبتول',
    'modal.registerSub': 'انځوریز ثبوتونه، پراخوونکي ته سپارل او تخنیکي ثبت',
    'modal.issueTitle': 'د ستونزې لنډیز / سرلیک',
    'modal.issueTitlePlaceholder': 'لکه: د تادیاتو کړکۍ د تایید پر مهال کنګل کیږي...',
    'modal.priority': 'د لومړیتوب کچه (رنګونه)',
    'modal.assignFixer': 'اصلي جوړوونکي (ډیولپر) ته سپارل',
    'modal.mentionFixers': 'نورو همکارانو ته اشاره (@)',
    'modal.evidence': 'د سکرین انځورونه او ثبوتونه',
    'modal.cropAnnotate': 'انځور کراپ او نښه کول',
    'modal.uploadImage': 'انځور پورته کول',
    'modal.noEvidence': 'تر اوسه کوم انځور نه دی تړل شوی',
    'modal.clickCrop': 'له ویب پاڼې د خرابۍ ځای کراپ کولو لپاره دلته کلیک وکړئ',
    'modal.generalDesc': 'عمومي تشریح',
    'modal.descPlaceholder': 'پېښه، ممکنه سرچینه یا لیدل شوی حالت بیان کړئ...',
    'modal.steps': 'د خرابۍ د بیا لیدلو مرحلې',
    'modal.expectedVsActual': 'تمه شوی حالت په مقابل کې د رښتیني حالت',
    'modal.telemetry': 'د سیسټم خپلسري راټول شوي معلومات',
    'modal.cancel': 'لغوه کول',
    'modal.submit': 'ډلې ته د خرابۍ استول',
    'modal.submitting': 'د ثبتېدو په حال کې...',
    'modal.snapNow': 'له اوسنۍ پاڼې سمدستي انځور واخلئ',

    // Forward
    'forward.btn': 'بل کس ته سپارل',
    'forward.title': 'ستونزه بل پراخوونکي ته سپارل',
    'forward.targetLabel': 'مقصدي ډیولپر',
    'forward.noteLabel': 'د سپارلو یادښت او تشریح',
    'forward.confirm': 'تایید او سپارل',
    'forward.history': 'د سپارلو تاریخچه',

    // Team
    'team.title': 'جوړوونکي، ازمویونکي او د لاسرسي مدیریت',
    'team.sub': 'مسوولین کولی شي د کاروونکو رولونه سم او کسان محدود کړي.',
    'team.addMember': 'نوی غړی ورزیاتول',
    'team.searchPlaceholder': 'د نوم یا ایمیل له لارې لټون...',
    'team.restrict': 'ازمویونکی محدودول',
    'team.unrestrict': 'د ازمویونکي بندیز لرې کول',
    'team.restrictedNotice': 'دا ازمویونکی د نویو خرابیو له ثبتولو یا بدلولو منع شوی دی.',
    'team.accountStatus': 'د اکاونټ حالت',
    'team.active': 'فعال او مجاز',
    'team.restricted': 'محدود شوی',

    // Backup
    'backup.title': 'د ډیټابیس بیک اپ، بېرته راګرځول او صادرول',
    'backup.sub': 'د JSON او CSV فایلونو اخیستل، د ډیټابیس ساتنه او بیا پرځای کول.',
    'backup.jsonTitle': 'د بشپړ ډیټابیس JSON بیک اپ',
    'backup.csvTitle': 'د جدول CSV په بڼه صادرول',
    'backup.restoreTitle': 'له مخکیني فایل څخه بېرته راګرځول',
    'backup.downloadJson': 'د JSON بیک اپ کښته کول',
    'backup.downloadCsv': 'د CSV جدول کښته کول',
    'backup.selectRestore': 'د بېرته راګرځولو لپاره فایل غوره کړئ',
    'backup.print': 'د ارزونې راپور چاپول',

    // Extension & Auto-install
    'ext.heroTitle': 'په هر براوزر کې د ARD ټیسټ او ډیبګ سیسټمونو فعالول',
    'ext.heroSub': 'خپلسری ډاونلوډ، د کروم محدودیتونو تېرول او په ۱ کلیک مستقیم لګول.',
    'ext.autoDownloadBtn': 'اکستنشن خپلسری کښته کول (.zip)',
    'ext.autoInstallBtn': 'په ۱ کلیک مستقیم نصب او فعالول',
    'ext.launchSimulator': 'په پاڼه کې ازموینه پیل کړئ',
    'ext.step1Title': 'خپلسری ډاونلوډ',
    'ext.step1Desc': 'له فایربیس سره تړل شوی بشپړ Manifest V3 پیکج.',
    'ext.step2Title': 'په کروم کې پورته کول',
    'ext.step2Desc': 'په chrome://extensions کې Developer mode چالان او Load unpacked ووهئ.',
    'ext.step3Title': 'د ګرامرلي په څېر آیکون',
    'ext.step3Desc': 'د ARD نښه په هر وېب سایټ کې د ستونزو ثبت لپاره تکیه کوي.',
    'ext.directActiveAlert': 'د ARD اکستنشن سمدستي په دې پاڼه کې فعال شو!',
    'ext.embedTitle': 'په هره ویب پاڼه کې د داخلولو کوډ',

    // Theme & Language
    'theme.light': 'روښانه حالت',
    'theme.dark': 'تاریک حالت',
    'theme.system': 'د سیسټم اصلي حالت',
    'lang.en': 'English',
    'lang.fa': 'دری (Dari)',
    'lang.ps': 'پښتو (Pashto)',
  }
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('ard_app_lang') as AppLanguage) || 'en';
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('ard_app_theme') as AppTheme) || 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: 'light' | 'dark' = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;
  const dir: 'ltr' | 'rtl' = language === 'fa' || language === 'ps' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('ard_app_lang', language);
    document.documentElement.lang = language === 'fa' ? 'fa-AF' : language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  useEffect(() => {
    localStorage.setItem('ard_app_theme', theme);
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme, effectiveTheme]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
  };

  const setTheme = (thm: AppTheme) => {
    setThemeState(thm);
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key]) return langDict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return key;
  };

  return (
    <ThemeLanguageContext.Provider value={{
      language,
      setLanguage,
      theme,
      setTheme,
      effectiveTheme,
      dir,
      t
    }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) throw new Error('useThemeLanguage must be used within ThemeLanguageProvider');
  return context;
};
