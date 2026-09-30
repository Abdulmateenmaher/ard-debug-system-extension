import React, { useState } from 'react';
import { 
  Users, 
  Trash2, 
  UserPlus, 
  Check, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Search, 
  Globe, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { useQAData } from '../context/QADataContext';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { UserRole } from '../types/qa';

export const TeamManagement: React.FC = () => {
  const { 
    teamMembers, 
    websites, 
    updateDebuggerStatus, 
    removeTeamMember, 
    addTeamMember,
    updateWebsiteAllowedDebuggers 
  } = useQAData();
  
  const { user } = useAuth();
  const { t } = useThemeLanguage();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('debugger');
  const [searchMember, setSearchMember] = useState('');

  const isFixerOrAdmin = user?.role === 'fixer' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    await addTeamMember({
      uid: 'user_' + Date.now().toString(36),
      email: newEmail.trim(),
      displayName: newName.trim(),
      role: newRole,
      isRestricted: false,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=120&auto=format&fit=crop&q=80`
    });

    setNewEmail('');
    setNewName('');
    setShowAddModal(false);
  };

  const handleToggleDebuggerWebsiteAccess = async (websiteId: string, debuggerUid: string) => {
    const website = websites.find(w => w.id === websiteId);
    if (!website) return;

    const currentAllowed = website.allowedDebuggerIds || [];
    let updated: string[];

    if (currentAllowed.includes(debuggerUid)) {
      updated = currentAllowed.filter(id => id !== debuggerUid);
    } else {
      updated = [...currentAllowed, debuggerUid];
    }

    await updateWebsiteAllowedDebuggers(websiteId, updated);
  };

  const filteredMembers = teamMembers.filter(m => 
    m.displayName.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.email.toLowerCase().includes(searchMember.toLowerCase())
  );

  const debuggers = teamMembers.filter(m => m.role === 'debugger');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 p-4 sm:p-5 rounded-2xl shadow-xl transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 tracking-tight">
              {t('team.title')}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 light:text-indigo-700 font-mono">
              {teamMembers.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-600">
            {t('team.sub')}
          </p>
        </div>

        {isFixerOrAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('team.addMember')}</span>
          </button>
        )}
      </div>

      {!isFixerOrAdmin && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 light:text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Viewing as QA Tester. Switch persona in top menu to Fixer (Sarah Chen) or Admin to edit permissions.</span>
        </div>
      )}

      {/* Website Scoping & Debugger Access Control (Panel requested by user) */}
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
              Website Debugger Access &amp; Membership
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 light:text-slate-600">
            Only authorized debuggers checked by admin can join and log bugs on each target site.
          </span>
        </div>

        <div className="space-y-3">
          {websites.map(site => {
            const allowedList = site.allowedDebuggerIds || [];
            return (
              <div 
                key={site.id}
                className="p-3.5 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-50 border border-slate-700/60 dark:border-slate-700 light:border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                    <span>{site.name}</span>
                    <span className="font-mono text-[10px] text-emerald-400 light:text-emerald-700 px-1.5 py-0.2 rounded bg-emerald-500/10">
                      {site.url}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 light:text-slate-500 truncate mt-0.5">
                    {site.description || 'Target QA node'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">Authorized Debuggers:</span>
                  {debuggers.map(d => {
                    const isAllowed = allowedList.includes(d.uid);
                    return (
                      <button
                        key={d.uid}
                        disabled={!isAdmin}
                        onClick={() => handleToggleDebuggerWebsiteAccess(site.id, d.uid)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          isAllowed
                            ? 'bg-indigo-600/30 text-indigo-200 light:text-indigo-800 border border-indigo-500/40'
                            : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 light:text-slate-600 opacity-60'
                        } ${isAdmin ? 'cursor-pointer hover:opacity-100' : 'cursor-default'}`}
                        title={isAdmin ? `Toggle ${d.displayName} access to ${site.name}` : undefined}
                      >
                        {isAllowed && <Check className="w-3 h-3 text-indigo-400" />}
                        <span>{d.displayName.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t('team.searchPlaceholder')}
          value={searchMember}
          onChange={(e) => setSearchMember(e.target.value)}
          className="w-full ps-9 pe-3 py-2 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.uid}
            className={`bg-slate-900 dark:bg-slate-900 light:bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between ${
              member.isRestricted 
                ? 'border-rose-500/40 bg-rose-950/10 light:bg-rose-50/50' 
                : 'border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 border border-slate-700 dark:border-slate-700 light:border-slate-300 overflow-hidden flex items-center justify-center font-bold text-sm text-indigo-400 shrink-0">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.displayName} className="w-full h-full object-cover" />
                  ) : (
                    member.displayName.substring(0, 2).toUpperCase()
                  )}
                </div>

                <div className="min-w-0 text-start">
                  <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900 flex items-center gap-1.5 truncate">
                    <span className="truncate">{member.displayName}</span>
                    {member.uid === user?.uid && (
                      <span className="text-[10px] text-indigo-400 font-mono shrink-0">(You)</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 light:text-slate-600 truncate">{member.email}</p>
                </div>
              </div>

              {/* Role badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold shrink-0 ${
                member.role === 'admin' 
                  ? 'bg-rose-500/20 text-rose-300 light:text-rose-700 border border-rose-500/30'
                  : member.role === 'fixer'
                  ? 'bg-indigo-500/20 text-indigo-300 light:text-indigo-700 border border-indigo-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 light:text-emerald-700 border border-emerald-500/30'
              }`}>
                {member.role}
              </span>
            </div>

            {/* Status indicators */}
            <div className="space-y-2 mb-4 text-start">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 light:text-slate-600">{t('team.accountStatus')}:</span>
                {member.isRestricted ? (
                  <span className="text-rose-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> {t('team.restricted')}
                  </span>
                ) : (
                  <span className="text-emerald-400 light:text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> {t('team.active')}
                  </span>
                )}
              </div>

              {member.isRestricted && (
                <p className="text-[11px] text-rose-300/90 light:text-rose-700 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {t('team.restrictedNotice')}
                </p>
              )}
            </div>

            {/* Action Bar */}
            {isFixerOrAdmin && (
              <div className="pt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between gap-2">
                {member.role === 'debugger' && (
                  <button
                    onClick={() => updateDebuggerStatus(member.uid, !member.isRestricted)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      member.isRestricted 
                        ? 'bg-emerald-600/20 text-emerald-300 light:text-emerald-700 hover:bg-emerald-600/30 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 light:text-rose-700 hover:bg-rose-500/30 border border-rose-500/30'
                    }`}
                  >
                    {member.isRestricted ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{t('team.unrestrict')}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t('team.restrict')}</span>
                      </>
                    )}
                  </button>
                )}

                {member.uid !== user?.uid && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.displayName} from the testing team?`)) {
                        removeTeamMember(member.uid);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 rounded-lg transition-colors ms-auto cursor-pointer"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white light:text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">{t('team.addMember')}</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white light:hover:text-black text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1 text-start">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1 text-start">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@ard.internal"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1 text-start">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="debugger">QA Debugger / Tester</option>
                  <option value="fixer">Fixer / Developer</option>
                  <option value="admin">QA Project Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  {t('team.addMember')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
