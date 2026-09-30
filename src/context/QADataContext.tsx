import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { useAuth } from './AuthContext';
import { 
  Issue, 
  Website, 
  UserProfile, 
  PriorityLevel, 
  IssueStatus, 
  ImageAttachment,
  IssueChatMessage
} from '../types/qa';

interface QADataContextType {
  websites: Website[];
  activeWebsiteId: string;
  activeWebsite: Website | null;
  issues: Issue[];
  teamMembers: UserProfile[];
  setActiveWebsiteId: (id: string) => void;
  createIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'forwardHistory' | 'chatMessages'>) => Promise<Issue>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
  forwardIssue: (id: string, toFixerId: string, toFixerName: string, note: string) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  addChatMessage: (issueId: string, text: string, imageUrl?: string) => Promise<void>;
  createWebsite: (name: string, url: string, description?: string, allowedDebuggerIds?: string[]) => Promise<Website>;
  updateWebsiteAllowedDebuggers: (websiteId: string, debuggerIds: string[]) => Promise<void>;
  deleteWebsite: (id: string) => Promise<void>;
  updateDebuggerStatus: (memberId: string, isRestricted: boolean) => Promise<void>;
  removeTeamMember: (memberId: string) => Promise<void>;
  addTeamMember: (member: Omit<UserProfile, 'createdAt'>) => Promise<void>;
  exportBackupJSON: () => string;
  exportIssuesCSV: () => string;
  restoreFromJSON: (jsonString: string) => boolean;
  filterTab: string;
  setFilterTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Target Website: http://192.168.0.141/login
const INITIAL_WEBSITES: Website[] = [
  {
    id: 'web_internal_141',
    name: 'Internal Portal (192.168.0.141)',
    url: 'http://192.168.0.141/login',
    description: 'Enterprise Internal Portal & Authentication Gateway under QA Testing',
    ownerId: 'admin_user_01',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'active',
    issueCount: 2,
    allowedDebuggerIds: ['qa_user_debugger_01', 'qa_user_debugger_02']
  }
];

const INITIAL_MEMBERS: UserProfile[] = [
  {
    uid: 'dev_user_fixer_01',
    email: 'sarah.dev@ard.internal',
    displayName: 'Sarah Chen (Lead Fixer / Dev)',
    role: 'fixer',
    isRestricted: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    uid: 'dev_user_fixer_02',
    email: 'david.kim@ard.internal',
    displayName: 'David Kim (Backend Fixer)',
    role: 'fixer',
    isRestricted: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    uid: 'qa_user_debugger_01',
    email: 'alex.qa@ard.internal',
    displayName: 'Alex Rivers (QA Tester)',
    role: 'debugger',
    isRestricted: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString()
  },
  {
    uid: 'qa_user_debugger_02',
    email: 'marcus.qa@ard.internal',
    displayName: 'Marcus Vance (QA Debugger)',
    role: 'debugger',
    isRestricted: false,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  }
];

const INITIAL_ISSUES: Issue[] = [
  {
    id: 'iss_141_01',
    websiteId: 'web_internal_141',
    title: 'CSRF token mismatch on http://192.168.0.141/login authentication post',
    generalDesc: 'When submitting the login credentials form on http://192.168.0.141/login, the CSRF token cookie expires prematurely over HTTP internal network connection, resulting in a 419 Page Expired response.',
    stepsToReproduce: '1. Navigate to http://192.168.0.141/login\n2. Fill username and password\n3. Click Login button\n4. Observe 419 Page Expired error banner',
    expectedBehavior: 'Authenticate user session and redirect to dashboard',
    actualBehavior: 'CSRF token verification failed on POST /login',
    priority: 'emergency',
    status: 'pending',
    reporterId: 'qa_user_debugger_01',
    reporterName: 'Alex Rivers (QA Tester)',
    reporterEmail: 'alex.qa@ard.internal',
    assignedFixerId: 'dev_user_fixer_01',
    assignedFixerName: 'Sarah Chen (Lead Fixer / Dev)',
    mentionedFixers: ['Sarah Chen (Lead Fixer / Dev)', 'David Kim (Backend Fixer)'],
    images: [
      {
        id: 'img_csrf_1',
        dataUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80',
        description: 'Login page network dump showing 419 CSRF mismatch on http://192.168.0.141/login',
        fileName: 'login_419_mismatch.png',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ],
    url: 'http://192.168.0.141/login',
    viewport: '1440x900',
    browser: 'Chrome 134 / Linux & Windows',
    os: 'Ubuntu 24.04 LTS / Win11',
    consoleLogs: [
      { type: 'error', message: 'POST http://192.168.0.141/login 419 (unknown status)', timestamp: '14:10:02' },
      { type: 'warn', message: 'Cookie "XSRF-TOKEN" was rejected because it lacked the "SameSite" attribute.', timestamp: '14:10:02' }
    ],
    forwardHistory: [],
    chatMessages: [
      {
        id: 'msg_1',
        senderId: 'qa_user_debugger_01',
        senderName: 'Alex Rivers (QA Tester)',
        senderRole: 'debugger',
        text: 'Hi @Sarah, I confirmed this happens every time on the internal IP 192.168.0.141 when testing behind the local proxy.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        mentionedUsers: ['Sarah Chen (Lead Fixer / Dev)']
      },
      {
        id: 'msg_2',
        senderId: 'dev_user_fixer_01',
        senderName: 'Sarah Chen (Lead Fixer / Dev)',
        senderRole: 'fixer',
        text: 'Thanks Alex! Checking the Session domain configuration in .env now. Looks like SESSION_SECURE_COOKIE was set to true on an HTTP local subnet.',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        mentionedUsers: ['Alex Rivers (QA Tester)']
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'iss_141_02',
    websiteId: 'web_internal_141',
    title: 'Password visibility toggle button overlaps input border on mobile view',
    generalDesc: 'On screen widths under 480px, the eye icon on http://192.168.0.141/login overflows into the right padding.',
    stepsToReproduce: 'Open http://192.168.0.141/login in responsive mode at 390px, tap password input',
    expectedBehavior: 'Password toggle fits inside input with 12px right padding',
    actualBehavior: 'Icon crosses the border container',
    priority: 'normal',
    status: 'in_progress',
    reporterId: 'qa_user_debugger_02',
    reporterName: 'Marcus Vance (QA Debugger)',
    reporterEmail: 'marcus.qa@ard.internal',
    assignedFixerId: 'dev_user_fixer_02',
    assignedFixerName: 'David Kim (Backend Fixer)',
    mentionedFixers: ['David Kim (Backend Fixer)'],
    images: [],
    url: 'http://192.168.0.141/login',
    viewport: '390x844',
    browser: 'Mobile Chrome',
    os: 'Android 15',
    consoleLogs: [],
    forwardHistory: [],
    chatMessages: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const QADataContext = createContext<QADataContextType | undefined>(undefined);

export const QADataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [websites, setWebsites] = useState<Website[]>(() => {
    const saved = localStorage.getItem('ard_websites');
    return saved ? JSON.parse(saved) : INITIAL_WEBSITES;
  });

  const [activeWebsiteId, setActiveWebsiteId] = useState<string>(() => {
    const saved = localStorage.getItem('ard_active_web_id');
    return saved || 'web_internal_141';
  });

  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem('ard_issues');
    return saved ? JSON.parse(saved) : INITIAL_ISSUES;
  });

  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('ard_team_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [filterTab, setFilterTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('ard_websites', JSON.stringify(websites));
  }, [websites]);

  useEffect(() => {
    localStorage.setItem('ard_active_web_id', activeWebsiteId);
  }, [activeWebsiteId]);

  useEffect(() => {
    localStorage.setItem('ard_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('ard_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Synchronize bugs registered via external in-page popup modal / Chrome extension
  useEffect(() => {
    const handleIncomingExternalIssue = (extIssue: any) => {
      if (!extIssue || !extIssue.title) return;

      setIssues(prev => {
        if (prev.some(i => i.id === extIssue.id || (i.title === extIssue.title && i.url === extIssue.url))) {
          return prev;
        }

        // Match against existing websites
        const targetWeb = websites.find(w => w.url === extIssue.url) || 
                          websites.find(w => extIssue.url && w.url.includes(new URL(extIssue.url).hostname)) ||
                          websites.find(w => w.id === 'web_internal_141') ||
                          websites[0];

        const newIssue: Issue = {
          id: extIssue.id || ('iss_ext_' + Date.now().toString(36)),
          websiteId: targetWeb?.id || 'web_internal_141',
          title: extIssue.title,
          generalDesc: extIssue.generalDesc || 'Logged directly via in-page popup modal on ' + (extIssue.url || 'external site'),
          stepsToReproduce: extIssue.stepsToReproduce || '',
          expectedBehavior: extIssue.expectedBehavior || '',
          actualBehavior: extIssue.actualBehavior || '',
          priority: extIssue.priority || 'emergency',
          status: 'pending',
          reporterId: 'qa_ext_debugger',
          reporterName: 'External QA Debugger',
          reporterEmail: 'debugger@external.target',
          assignedFixerId: 'dev_user_fixer_01',
          assignedFixerName: extIssue.assignedFixerName || 'Sarah Chen (Lead Fixer / Dev)',
          mentionedFixers: ['Sarah Chen (Lead Fixer / Dev)'],
          images: [],
          url: extIssue.url || targetWeb?.url || 'http://192.168.0.141/login',
          viewport: extIssue.viewport || '1440x900',
          browser: 'Chrome 134 (In-Page Injected Widget)',
          os: 'Active OS',
          consoleLogs: extIssue.consoleLogs || [],
          createdAt: extIssue.timestamp || new Date().toISOString(),
          updatedAt: extIssue.timestamp || new Date().toISOString(),
          forwardHistory: [],
          chatMessages: []
        };

        // Increment count on matching website
        setWebsites(wList => wList.map(w => w.id === newIssue.websiteId ? { ...w, issueCount: (w.issueCount || 0) + 1 } : w));

        return [newIssue, ...prev];
      });
    };

    // 1. Process queued issues from localStorage
    try {
      const queued = JSON.parse(localStorage.getItem('ard_qa_external_issues') || '[]');
      if (Array.isArray(queued) && queued.length > 0) {
        queued.forEach(handleIncomingExternalIssue);
      }
    } catch (e) {}

    // 2. BroadcastChannel listener across tabs
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('ard_qa_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'ARD_REGISTER_BUG' && event.data?.payload) {
            handleIncomingExternalIssue(event.data.payload);
          }
        };
      } catch (e) {}
    }

    // 3. Storage event listener for cross-tab localStorage updates
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'ard_qa_external_issues' && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (Array.isArray(list) && list.length > 0) {
            handleIncomingExternalIssue(list[0]);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 4. Window postMessage listener
    const handleMessageEvent = (e: MessageEvent) => {
      if (e.data?.type === 'ARD_REGISTER_BUG' && e.data?.payload) {
        handleIncomingExternalIssue(e.data.payload);
      }
    };
    window.addEventListener('message', handleMessageEvent);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('message', handleMessageEvent);
    };
  }, [websites]);

  // Firestore sync for active website
  useEffect(() => {
    if (!activeWebsiteId) return;

    try {
      const issuesCol = collection(db, 'websites', activeWebsiteId, 'issues');
      const unsubscribe = onSnapshot(issuesCol, (snapshot) => {
        if (!snapshot.empty) {
          const remoteIssues: Issue[] = [];
          snapshot.forEach((d) => {
            remoteIssues.push({ id: d.id, ...d.data() } as Issue);
          });
          setIssues(prev => {
            const otherWebsiteIssues = prev.filter(i => i.websiteId !== activeWebsiteId);
            return [...remoteIssues, ...otherWebsiteIssues];
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `websites/${activeWebsiteId}/issues`);
      });

      return () => unsubscribe();
    } catch (e) {
      // offline fallback
    }
  }, [activeWebsiteId]);

  const activeWebsite = websites.find(w => w.id === activeWebsiteId) || websites[0] || null;

  const createIssue = useCallback(async (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'forwardHistory' | 'chatMessages'>): Promise<Issue> => {
    if (user?.isRestricted) {
      throw new Error('Your account is restricted from submitting new issues.');
    }

    // Check if debugger is allowed on this website (membership requirement)
    if (activeWebsite?.allowedDebuggerIds && user?.role === 'debugger') {
      if (!activeWebsite.allowedDebuggerIds.includes(user.uid)) {
        throw new Error(`Only authorized debuggers assigned by admin can join and log bugs on ${activeWebsite.name}.`);
      }
    }

    const newId = 'iss_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newIssue: Issue = {
      ...issueData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      forwardHistory: [],
      chatMessages: []
    };

    setIssues(prev => [newIssue, ...prev]);
    setWebsites(prev => prev.map(w => w.id === issueData.websiteId ? { ...w, issueCount: w.issueCount + 1 } : w));

    try {
      const issueRef = doc(db, 'websites', issueData.websiteId, 'issues', newId);
      await setDoc(issueRef, newIssue);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `websites/${issueData.websiteId}/issues/${newId}`);
    }

    return newIssue;
  }, [user, activeWebsite]);

  const updateIssue = useCallback(async (id: string, updates: Partial<Issue>) => {
    const now = new Date().toISOString();
    setIssues(prev => prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: now } : i));

    const targetIssue = issues.find(i => i.id === id);
    if (targetIssue) {
      try {
        const issueRef = doc(db, 'websites', targetIssue.websiteId, 'issues', id);
        await updateDoc(issueRef, { ...updates, updatedAt: now });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `websites/${targetIssue.websiteId}/issues/${id}`);
      }
    }
  }, [issues]);

  const forwardIssue = useCallback(async (id: string, toFixerId: string, toFixerName: string, note: string) => {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    const historyEntry = {
      id: 'fwd_' + Date.now().toString(36),
      fromFixerId: user?.uid || 'fixer_01',
      fromFixerName: user?.displayName || 'Fixer',
      toFixerId,
      toFixerName,
      note: note.trim() || 'Forwarded for investigation.',
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...(issue.forwardHistory || []), historyEntry];

    await updateIssue(id, {
      assignedFixerId: toFixerId,
      assignedFixerName: toFixerName,
      forwardHistory: updatedHistory,
      status: issue.status === 'fixed' || issue.status === 'discarded' ? 'in_progress' : issue.status
    });
  }, [issues, user, updateIssue]);

  // Add chat message between mentioned people (image and text)
  const addChatMessage = useCallback(async (issueId: string, text: string, imageUrl?: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const newMessage: IssueChatMessage = {
      id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      senderId: user?.uid || 'guest_user',
      senderName: user?.displayName || 'Team Member',
      senderRole: user?.role || 'debugger',
      text: text.trim(),
      imageUrl: imageUrl || undefined,
      timestamp: new Date().toISOString(),
      mentionedUsers: issue.mentionedFixers || []
    };

    const updatedMessages = [...(issue.chatMessages || []), newMessage];

    await updateIssue(issueId, {
      chatMessages: updatedMessages
    });
  }, [issues, user, updateIssue]);

  const deleteIssue = useCallback(async (id: string) => {
    const target = issues.find(i => i.id === id);
    setIssues(prev => prev.filter(i => i.id !== id));

    if (target) {
      setWebsites(prev => prev.map(w => w.id === target.websiteId ? { ...w, issueCount: Math.max(0, w.issueCount - 1) } : w));
      try {
        await deleteDoc(doc(db, 'websites', target.websiteId, 'issues', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `websites/${target.websiteId}/issues/${id}`);
      }
    }
  }, [issues]);

  const createWebsite = useCallback(async (name: string, url: string, description?: string, allowedDebuggerIds?: string[]): Promise<Website> => {
    const newId = 'web_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newWebsite: Website = {
      id: newId,
      name,
      url: url.startsWith('http') ? url : `http://${url}`,
      description: description || 'Target application under test',
      ownerId: user?.uid || 'admin_user_01',
      createdAt: new Date().toISOString(),
      status: 'active',
      issueCount: 0,
      allowedDebuggerIds: allowedDebuggerIds || ['qa_user_debugger_01', 'qa_user_debugger_02']
    };

    setWebsites(prev => [...prev, newWebsite]);
    setActiveWebsiteId(newId);

    try {
      await setDoc(doc(db, 'websites', newId), newWebsite);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `websites/${newId}`);
    }

    return newWebsite;
  }, [user]);

  const updateWebsiteAllowedDebuggers = useCallback(async (websiteId: string, debuggerIds: string[]) => {
    setWebsites(prev => prev.map(w => w.id === websiteId ? { ...w, allowedDebuggerIds: debuggerIds } : w));
    try {
      await updateDoc(doc(db, 'websites', websiteId), { allowedDebuggerIds: debuggerIds });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `websites/${websiteId}`);
    }
  }, []);

  const deleteWebsite = useCallback(async (id: string) => {
    if (websites.length <= 1) {
      throw new Error('You must maintain at least one website environment.');
    }
    setWebsites(prev => prev.filter(w => w.id !== id));
    setIssues(prev => prev.filter(i => i.websiteId !== id));

    const remaining = websites.filter(w => w.id !== id);
    if (remaining.length > 0) {
      setActiveWebsiteId(remaining[0].id);
    }

    try {
      await deleteDoc(doc(db, 'websites', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `websites/${id}`);
    }
  }, [websites]);

  const updateDebuggerStatus = useCallback(async (memberId: string, isRestricted: boolean) => {
    setTeamMembers(prev => prev.map(m => m.uid === memberId ? { ...m, isRestricted } : m));
    try {
      await updateDoc(doc(db, 'users', memberId), { isRestricted });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${memberId}`);
    }
  }, []);

  const removeTeamMember = useCallback(async (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.uid !== memberId));
    try {
      await deleteDoc(doc(db, 'users', memberId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${memberId}`);
    }
  }, []);

  const addTeamMember = useCallback(async (member: Omit<UserProfile, 'createdAt'>) => {
    const newMember: UserProfile = {
      ...member,
      createdAt: new Date().toISOString()
    };
    setTeamMembers(prev => [...prev, newMember]);
    try {
      await setDoc(doc(db, 'users', member.uid), newMember);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${member.uid}`);
    }
  }, []);

  const exportBackupJSON = useCallback(() => {
    const backupPayload = {
      exportVersion: '2.5.0',
      platform: 'ARD Test and Debug Systems',
      exportedAt: new Date().toISOString(),
      activeWebsite,
      websites,
      issues,
      teamMembers
    };
    return JSON.stringify(backupPayload, null, 2);
  }, [activeWebsite, websites, issues, teamMembers]);

  const exportIssuesCSV = useCallback(() => {
    const currentIssues = issues.filter(i => i.websiteId === activeWebsiteId);
    const headers = ['ID', 'Title', 'Priority', 'Status', 'Reporter', 'AssignedFixer', 'URL', 'ImagesCount', 'ChatMessagesCount', 'CreatedAt'];
    const rows = currentIssues.map(i => [
      `"${i.id}"`,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      `"${i.priority}"`,
      `"${i.status}"`,
      `"${i.reporterName}"`,
      `"${i.assignedFixerName}"`,
      `"${i.url}"`,
      `"${i.images?.length || 0}"`,
      `"${i.chatMessages?.length || 0}"`,
      `"${i.createdAt}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }, [issues, activeWebsiteId]);

  const restoreFromJSON = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.websites) && Array.isArray(data.issues)) {
        setWebsites(data.websites);
        setIssues(data.issues);
        if (data.activeWebsite?.id) {
          setActiveWebsiteId(data.activeWebsite.id);
        }
        if (Array.isArray(data.teamMembers)) {
          setTeamMembers(data.teamMembers);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid backup JSON format:', e);
      return false;
    }
  }, []);

  return (
    <QADataContext.Provider value={{
      websites,
      activeWebsiteId,
      activeWebsite,
      issues,
      teamMembers,
      setActiveWebsiteId,
      createIssue,
      updateIssue,
      forwardIssue,
      deleteIssue,
      addChatMessage,
      createWebsite,
      updateWebsiteAllowedDebuggers,
      deleteWebsite,
      updateDebuggerStatus,
      removeTeamMember,
      addTeamMember,
      exportBackupJSON,
      exportIssuesCSV,
      restoreFromJSON,
      filterTab,
      setFilterTab,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </QADataContext.Provider>
  );
};

export const useQAData = () => {
  const context = useContext(QADataContext);
  if (!context) throw new Error('useQAData must be used within a QADataProvider');
  return context;
};
