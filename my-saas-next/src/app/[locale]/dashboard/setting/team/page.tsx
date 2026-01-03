'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  joinedAt: string;
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('STAFF');
  const [isInviting, setIsInviting] = useState(false);
  
  const { showSuccess, showError } = useToast();

  // Get current team ID from localStorage or context if available?
  // Ideally, valid token in header implies current team context for the backend
  // The endpoints rely on header Authorization -> JWT -> Team Context.
  
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      const response = await fetch('/api/team/members', {
        // headers: {
        //   'Authorization': `Bearer ${token}`
        // }
      });
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
      } else {
         // Silently fail or show message? showing error is safer
         console.error('Failed to fetch members:', data.error);
         // Don't show toast on load failure to avoid spamming if auth issue, mostly console
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setIsInviting(true);
    try {
      const token = localStorage.getItem('token');
      
      let activeTeamId = localStorage.getItem('currentTeamId');
      
      // If team ID is missing, try to fetch it from /api/auth/me
      if (!activeTeamId) {
          const meRes = await fetch('/api/auth/me', {
              // headers: { 'Authorization': `Bearer ${token}` }
          });
          if (meRes.ok) {
              const meData = await meRes.json();
              if (meData.activeTeam) {
                  activeTeamId = meData.activeTeam.id;
                  localStorage.setItem('currentTeamId', activeTeamId || '');
              }
          }
      }

      if (!activeTeamId) {
          throw new Error("Could not identify active team. Please refresh or switch teams.");
      }

      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            teamId: activeTeamId,
            email: inviteEmail, 
            role: inviteRole 
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(`Invitation created!`);
        setIsInviteOpen(false);
        setInviteEmail('');
        
        // Show the link to the user
        if (data.inviteUrl) {
            prompt('Copy this invitation link:', data.inviteUrl);
        }
      } else {
        throw new Error(data.error || 'Failed to send invite');
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      // const token = localStorage.getItem('token');
      const response = await fetch(`/api/team/members?userId=${userId}`, {
        method: 'DELETE',
        // headers: {
        //   'Authorization': `Bearer ${token}`
        // }
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess('Member removed successfully');
        setMembers(members.filter(m => m.userId !== userId));
      } else {
        throw new Error(data.error || 'Failed to remove member');
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your team members and their permissions.</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Invite Member
        </button>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Invite New Member</h3>
                <form onSubmit={handleInvite} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="colleague@company.com"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select 
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                        >
                            <option value="STAFF">Staff (Operational)</option>
                            <option value="MANAGER">Manager (Operational Mgmt)</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button 
                            type="button"
                            onClick={() => setIsInviteOpen(false)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isInviting}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Joined</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                 <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading team members...</td>
                 </tr>
              ) : members.length === 0 ? (
                 <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No members found (which is weird, you should be here).</td>
                 </tr>
              ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                            member.role === 'MANAGER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400'
                          }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button 
                            onClick={() => handleRemoveMember(member.userId)}
                            className="text-gray-400 hover:text-red-500 transition-colors tooltip"
                            title="Remove Member"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
