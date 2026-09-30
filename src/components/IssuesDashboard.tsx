import React, { useState, useRef } from 'react';
import { 
  Bug, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Hourglass, 
  Trash2, 
  Image as ImageIcon, 
  Plus, 
  Check,
  ChevronDown,
  MessageSquare,
  Send,
  Paperclip,
  X
} from 'lucide-react';
import { useQAData } from '../context/QADataContext';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Issue, IssueStatus, PriorityLevel, IssueChatMessage } from '../types/qa';

interface IssuesDashboardProps {
  onOpenNewIssue: () => void;
}

export const IssuesDashboard: React.FC<IssuesDashboardProps> = ({ onOpenNewIssue }) => {
  const { 
    issues, 
    activeWebsite, 
    activeWebsiteId, 
    updateIssue, 
    forwardIssue, 
    deleteIssue,
    addChatMessage,
    teamMembers,
    filterTab,
    setFilterTab,
    searchQuery,
    setSearchQuery
  } = useQAData();
  
  const { user } = useAuth();
  const { t } = useThemeLanguage();

  const [viewScope, setViewScope] = useState<'all' | 'my'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Forward modal state
  const [forwardModalIssue, setForwardModalIssue] = useState<Issue | null>(null);
  const [targetFixerId, setTargetFixerId] = useState<string>('');
  const [forwardNote, setForwardNote] = useState<string>('');

  // Status update menu
  const [statusMenuIssueId, setStatusMenuIssueId] = useState<string | null>(null);

  // Chat message state inside detail drawer
  const [chatInputText, setChatInputText] = useState('');
  const [chatAttachedImage, setChatAttachedImage] = useState<string | null>(null);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Filter issues for current website
  const siteIssues = issues.filter(i => i.websiteId === activeWebsiteId);

  // Tab grouping
  const pendingCount = siteIssues.filter(i => i.status === 'pending').length;
  const inProgressCount = siteIssues.filter(i => i.status === 'in_progress').length;
  const fixedCount = siteIssues.filter(i => i.status === 'fixed').length;
  const delayedCount = siteIssues.filter(i => i.status === 'delayed').length;
  const discardedCount = siteIssues.filter(i => i.status === 'discarded').length;

  const filteredIssues = siteIssues.filter(issue => {
    if (filterTab !== 'all' && issue.status !== filterTab) return false;
    if (viewScope === 'my' && issue.reporterId !== user?.uid) return false;
    if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.generalDesc.toLowerCase().includes(q);
      const matchAssignee = issue.assignedFixerName.toLowerCase().includes(q);
      const matchReporter = issue.reporterName.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchAssignee || matchReporter;
    }

    return true;
  });

  const fixers = teamMembers.filter(m => m.role === 'fixer' || m.role === 'admin');

  const handleOpenForward = (issue: Issue) => {
    setForwardModalIssue(issue);
    const otherFixer = fixers.find(f => f.uid !== issue.assignedFixerId) || fixers[0];
    setTargetFixerId(otherFixer?.uid || '');
    setForwardNote('');
  };

  const handleConfirmForward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forwardModalIssue || !targetFixerId) return;

    const targetFixer = fixers.find(f => f.uid === targetFixerId);
    if (!targetFixer) return;

    await forwardIssue(
      forwardModalIssue.id,
      targetFixer.uid,
      targetFixer.displayName,
      forwardNote
    );

    if (selectedIssue && selectedIssue.id === forwardModalIssue.id) {
      setSelectedIssue(prev => prev ? {
        ...prev,
        assignedFixerId: targetFixer.uid,
        assignedFixerName: targetFixer.displayName
      } : null);
    }

    setForwardModalIssue(null);
  };

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    await updateIssue(issueId, { status: newStatus });
    setStatusMenuIssueId(null);
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Chat message submission
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    if (!chatInputText.trim() && !chatAttachedImage) return;

    setIsSendingChat(true);
    try {
      await addChatMessage(selectedIssue.id, chatInputText, chatAttachedImage || undefined);
      
      // Update local selectedIssue for instant display
      const newMsg: IssueChatMessage = {
        id: 'msg_' + Date.now().toString(36),
        senderId: user?.uid || 'guest_user',
        senderName: user?.displayName || 'Team Member',
        senderRole: user?.role || 'debugger',
        text: chatInputText.trim(),
        imageUrl: chatAttachedImage || undefined,
        timestamp: new Date().toISOString(),
        mentionedUsers: selectedIssue.mentionedFixers || []
      };

      setSelectedIssue(prev => prev ? {
        ...prev,
        chatMessages: [...(prev.chatMessages || []), newMsg]
      } : null);

      setChatInputText('');
      setChatAttachedImage(null);

      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setChatAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'emergency':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 light:text-red-700 border border-red-500/30">{t('priority.emergency')}</span>;
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/20 text-orange-300 light:text-orange-700 border border-orange-500/30">{t('priority.high')}</span>;
      case 'normal':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/20 text-yellow-300 light:text-yellow-700 border border-yellow-500/30">{t('priority.normal')}</span>;
      case 'low':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 light:text-sky-700 border border-sky-500/30">{t('priority.low')}</span>;
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 light:text-amber-700 border border-amber-500/30"><Clock className="w-3 h-3" /> {t('status.pending')}</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 light:text-blue-700 border border-blue-500/30"><Hourglass className="w-3 h-3" /> {t('status.in_progress')}</span>;
      case 'fixed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 light:text-emerald-700 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> {t('status.fixed')}</span>;
      case 'delayed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-300 light:text-purple-700 border border-purple-500/30"><AlertTriangle className="w-3 h-3" /> {t('status.delayed')}</span>;
      case 'discarded':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-700 light:bg-slate-200 text-slate-400 light:text-slate-700 border border-slate-600 light:border-slate-300"><XCircle className="w-3 h-3" /> {t('status.discarded')}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 p-4 sm:p-5 rounded-2xl shadow-xl transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 tracking-tight">
              {t('nav.dashboard')}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 light:text-indigo-700 font-mono">
              {activeWebsite?.name}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({activeWebsite?.url})
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-600">
            Track defects, forward tasks to developers, chat between mentioned engineers with images, and manage resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Scope Toggle */}
          <div className="flex items-center bg-slate-800 dark:bg-slate-800 light:bg-slate-100 p-1 rounded-xl border border-slate-700 light:border-slate-300">
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewScope === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black'
              }`}
            >
              All Team ({siteIssues.length})
            </button>
            <button
              onClick={() => setViewScope('my')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewScope === 'my' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black'
              }`}
            >
              My Reported ({siteIssues.filter(i => i.reporterId === user?.uid).length})
            </button>
          </div>

          <button
            onClick={onOpenNewIssue}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('nav.logBug')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Grouping */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
        {[
          { id: 'all', labelKey: 'status.all', count: siteIssues.length },
          { id: 'pending', labelKey: 'status.pending', count: pendingCount, color: 'text-amber-400 light:text-amber-600' },
          { id: 'in_progress', labelKey: 'status.in_progress', count: inProgressCount, color: 'text-blue-400 light:text-blue-600' },
          { id: 'fixed', labelKey: 'status.fixed', count: fixedCount, color: 'text-emerald-400 light:text-emerald-600' },
          { id: 'delayed', labelKey: 'status.delayed', count: delayedCount, color: 'text-purple-400 light:text-purple-600' },
          { id: 'discarded', labelKey: 'status.discarded', count: discardedCount, color: 'text-slate-400' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              filterTab === tab.id
                ? 'border-indigo-500 text-white dark:text-white light:text-slate-900 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200/60'
                : 'border-transparent text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-black hover:bg-slate-850 light:hover:bg-slate-100'
            }`}
          >
            <span>{t(tab.labelKey)}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 ${tab.color || ''}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Priority Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('team.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-3 py-2 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 light:text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
          </span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl text-xs text-slate-200 light:text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="emergency">{t('priority.emergency')}</option>
            <option value="high">{t('priority.high')}</option>
            <option value="normal">{t('priority.normal')}</option>
            <option value="low">{t('priority.low')}</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl">
          <Bug className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-slate-800">No issues matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Use the Grammarly widget in the live testbed on http://192.168.0.141/login or click Log Bug.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              
              {/* Left Column: Priority, Title, Metadata, Mentions */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPriorityBadge(issue.priority)}
                  {getStatusBadge(issue.status)}
                  <span className="text-[11px] text-slate-400 font-mono">{issue.id}</span>
                  <span className="text-[11px] text-slate-400">·</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-xs">{issue.url}</span>
                </div>

                <h3 
                  onClick={() => setSelectedIssue(issue)}
                  className="font-bold text-sm text-white dark:text-white light:text-slate-900 hover:text-indigo-400 transition-colors cursor-pointer truncate text-start"
                >
                  {issue.title}
                </h3>

                <p className="text-xs text-slate-400 light:text-slate-600 line-clamp-2 text-start">
                  {issue.generalDesc}
                </p>

                {/* Fixers, Mentions, Chat Counter */}
                <div className="flex items-center gap-3 text-xs text-slate-400 light:text-slate-600 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300 dark:text-slate-300 light:text-slate-800 font-medium">Assigned: {issue.assignedFixerName}</span>
                  </div>

                  {issue.mentionedFixers && issue.mentionedFixers.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Mentioned:</span>
                      {issue.mentionedFixers.map(m => (
                        <span key={m} className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 light:text-indigo-700 text-[10px] border border-indigo-500/20">
                          @{m.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Discussion Chat Indicator */}
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{issue.chatMessages?.length || 0} chat replies</span>
                  </button>

                  {issue.images && issue.images.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 light:text-emerald-700 font-mono">
                      <ImageIcon className="w-3 h-3" />
                      <span>{issue.images.length} screenshots</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                
                {/* Chat Button */}
                <button
                  onClick={() => setSelectedIssue(issue)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 light:text-indigo-700 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat ({issue.chatMessages?.length || 0})</span>
                </button>

                {/* Forward to Next Fixer */}
                <button
                  onClick={() => handleOpenForward(issue)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  title={t('forward.btn')}
                >
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>Forward</span>
                </button>

                {/* Status Quick Changer */}
                <div className="relative">
                  <button
                    onClick={() => setStatusMenuIssueId(statusMenuIssueId === issue.id ? null : issue.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>Status</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {statusMenuIssueId === issue.id && (
                    <div className="absolute end-0 top-full mt-1 w-44 bg-slate-800 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-800 light:border-slate-200 rounded-xl shadow-2xl p-1 z-30">
                      {[
                        { id: 'pending', labelKey: 'status.pending' },
                        { id: 'in_progress', labelKey: 'status.in_progress' },
                        { id: 'fixed', labelKey: 'status.fixed' },
                        { id: 'delayed', labelKey: 'status.delayed' },
                        { id: 'discarded', labelKey: 'status.discarded' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => handleStatusChange(issue.id, st.id as IssueStatus)}
                          className={`w-full text-start px-3 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            issue.status === st.id ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700/60 light:hover:bg-slate-100'
                          }`}
                        >
                          <span>{t(st.labelKey)}</span>
                          {issue.status === st.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedIssue(issue)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Details
                </button>

                {/* Delete Issue */}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this issue?')) {
                      deleteIssue(issue.id);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Delete issue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Forward Modal */}
      {forwardModalIssue && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white light:text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-indigo-400 rtl:rotate-180" />
                <h3 className="font-bold text-base">{t('forward.title')}</h3>
              </div>
              <button 
                onClick={() => setForwardModalIssue(null)}
                className="text-slate-400 hover:text-white light:hover:text-black text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 light:text-slate-600 mb-4 text-start">
              Handoff <span className="text-white dark:text-white light:text-slate-900 font-medium">"{forwardModalIssue.title}"</span> to another developer.
            </p>

            <form onSubmit={handleConfirmForward} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1 text-start">
                  {t('forward.targetLabel')}
                </label>
                <select
                  value={targetFixerId}
                  onChange={(e) => setTargetFixerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {fixers.map(f => (
                    <option key={f.uid} value={f.uid}>
                      {f.displayName} ({f.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1 text-start">
                  {t('forward.noteLabel')}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Investigated backend webhook; handing over to UI specialist..."
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForwardModalIssue(null)}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  {t('forward.confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Issue Detail Drawer with CHAT BETWEEN MENTIONED PEOPLE (Image and Text) */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl w-full max-w-4xl shadow-2xl text-white light:text-slate-900 my-auto overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-50">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {getPriorityBadge(selectedIssue.priority)}
                {getStatusBadge(selectedIssue.status)}
                <span className="text-xs text-slate-400 font-mono">{selectedIssue.id}</span>
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-white light:hover:text-black text-lg p-1 rounded-lg hover:bg-slate-800 light:hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 mb-2 text-start">{selectedIssue.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 light:text-slate-600 flex-wrap">
                  <span>URL: <span className="text-indigo-400 font-mono truncate">{selectedIssue.url}</span></span>
                  <span>Viewport: <strong className="text-slate-300 light:text-slate-700">{selectedIssue.viewport}</strong></span>
                  <span>Browser: <strong className="text-slate-300 light:text-slate-700">{selectedIssue.browser}</strong></span>
                </div>
              </div>

              {/* Assignment & Mentions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 border border-slate-700/60 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 light:text-slate-600 block mb-1">{t('modal.assignFixer')}</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white dark:text-white light:text-slate-900">{selectedIssue.assignedFixerName}</span>
                    <button
                      onClick={() => handleOpenForward(selectedIssue)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
                    >
                      {t('forward.btn')}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 light:text-slate-600 block mb-1">Mentioned in Discussion</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {selectedIssue.mentionedFixers && selectedIssue.mentionedFixers.length > 0 ? (
                      selectedIssue.mentionedFixers.map(m => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 light:text-indigo-700 text-[11px] font-medium border border-indigo-500/30">
                          @{m}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">None mentioned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* General Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider mb-2 text-start">{t('modal.generalDesc')}</h4>
                <div className="p-4 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-50 border border-slate-700/40 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-slate-200 light:text-slate-800 leading-relaxed whitespace-pre-wrap text-start">
                  {selectedIssue.generalDesc}
                </div>
              </div>

              {/* Visual Evidence / Screenshots */}
              {selectedIssue.images && selectedIssue.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider mb-3 text-start">
                    {t('modal.evidence')} ({selectedIssue.images.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedIssue.images.map((img, i) => (
                      <div key={img.id} className="bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl overflow-hidden">
                        <div className="h-44 sm:h-48 bg-black flex items-center justify-center overflow-hidden">
                          <img 
                            src={img.dataUrl} 
                            alt={`Bug attachment ${i+1}`} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-3 text-xs border-t border-slate-700 light:border-slate-300 text-start">
                          <p className="font-semibold text-white dark:text-white light:text-slate-900">{img.description || `Screenshot #${i+1}`}</p>
                          <p className="text-[10px] text-slate-400 light:text-slate-500 mt-0.5">{img.fileName} · {new Date(img.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAT BETWEEN MENTIONED PEOPLE (Image & Text) */}
              <div className="p-4 bg-slate-850 dark:bg-slate-900 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 dark:border-slate-800 light:border-slate-200">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-bold text-xs sm:text-sm text-white dark:text-white light:text-slate-900">
                      Chat &amp; Discussion Between Mentioned Team Members
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 light:text-slate-500">
                    {selectedIssue.chatMessages?.length || 0} messages
                  </span>
                </div>

                {/* Messages List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pe-1">
                  {(!selectedIssue.chatMessages || selectedIssue.chatMessages.length === 0) ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No discussion yet. Send a message or screenshot below to collaborate with @mentioned fixers!
                    </div>
                  ) : (
                    selectedIssue.chatMessages.map((msg) => {
                      const isMe = msg.senderId === user?.uid;
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 light:text-slate-500">
                            <span className="font-semibold text-slate-300 light:text-slate-700">{msg.senderName}</span>
                            <span className="uppercase px-1 py-0.2 rounded bg-slate-800 light:bg-slate-200 font-mono text-[9px]">{msg.senderRole}</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div className={`p-3 rounded-2xl text-xs max-w-md ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-slate-800 dark:bg-slate-800 light:bg-white text-slate-200 light:text-slate-900 border border-slate-700 light:border-slate-300 rounded-tl-none shadow-sm'
                          }`}>
                            {msg.text && <p className="leading-relaxed whitespace-pre-wrap text-start">{msg.text}</p>}
                            
                            {/* Attached Image in Chat */}
                            {msg.imageUrl && (
                              <div className="mt-2 rounded-xl overflow-hidden border border-black/20 max-w-xs">
                                <img 
                                  src={msg.imageUrl} 
                                  alt="attachment" 
                                  className="w-full h-auto max-h-52 object-cover cursor-pointer hover:opacity-95" 
                                  onClick={() => window.open(msg.imageUrl, '_blank')}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Attached Image Preview before sending */}
                {chatAttachedImage && (
                  <div className="relative inline-block border-2 border-indigo-500 rounded-xl overflow-hidden">
                    <img src={chatAttachedImage} alt="preview" className="w-24 h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => setChatAttachedImage(null)}
                      className="absolute top-1 end-1 bg-black/70 hover:bg-black text-white rounded-full p-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Reply Form */}
                <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-2 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
                  <label className="p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-750 text-slate-300 light:text-slate-700 cursor-pointer border border-slate-700 light:border-slate-300" title="Attach Image or Screenshot">
                    <Paperclip className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleChatImageUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Reply to mentioned fixers &amp; debuggers..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={isSendingChat || (!chatInputText.trim() && !chatAttachedImage)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-50 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 light:text-slate-600">Status:</span>
                {(['pending', 'in_progress', 'fixed', 'delayed', 'discarded'] as IssueStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedIssue.id, st)}
                    className={`px-2 py-0.5 rounded-lg text-xs capitalize transition-colors cursor-pointer ${
                      selectedIssue.status === st 
                        ? 'bg-indigo-600 text-white font-semibold' 
                        : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 light:text-slate-700'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-200 light:text-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
