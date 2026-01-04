'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import axios from 'axios';

interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  taskCount: number;
  memberCount: number;
  progress: number;
  members: any[];
  tasks: any[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { showError, showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('todo');
  const [currentRole, setCurrentRole] = useState<string>('STAFF');

  useEffect(() => {
    fetchProjectDetails();
    fetchRole();
  }, []);

  const fetchRole = async () => {
    try {
      const res = await axios.get('/api/team');
      const teams = res.data.teams;
      const currentTeamId = localStorage.getItem('currentTeamId');
      const activeTeam = teams.find((t: any) => t.id === currentTeamId) || teams[0];
      if (activeTeam?.myRole) {
         setCurrentRole(activeTeam.myRole);
      }
    } catch (err) {
      console.error('Failed to fetch role', err);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      // Note: We need to implement GET /api/projects/[id]
      const res = await fetch(`/api/projects/${params.id}`);
      
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      } else {
        showError('Project not found');
      }
    } catch (e) {
      showError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
       const res = await fetch(`/api/projects/${params.id}/tasks`, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({ title: newTaskTitle, status: newTaskStatus })
       });

       if (res.ok) {
           showSuccess('Task added');
           setNewTaskTitle('');
           fetchProjectDetails(); // Refresh
       } else {
           const err = await res.json();
           showError(err.error || 'Failed to add task');
       }
    } catch (e) {
        showError('Network error adding task');
        console.error(e);
    }
  };

  // Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`/api/projects/${params.id}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inviteEmail, role: inviteRole })
        });
        const data = await res.json();
        if (res.ok) {
            showSuccess('Member added');
            setInviteEmail('');
            fetchProjectDetails();
        } else {
            showError(data.error || 'Failed to add member');
        }
    } catch (e) {
        showError('Invite error');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${params.id}/members`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        showSuccess('Member removed');
        fetchProjectDetails();
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to remove member');
      }
    } catch (e) {
      showError('Remove member error');
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
      // Optimistic update
      if (!project) return;
      
      try {
          // Backend Call (We need PUT /api/projects/[id]/tasks - currently POST and GET exist)
          // Wait, we didn't implement PUT /tasks/[taskId]. 
          // Let's implement /api/projects/[id]/tasks/update (or just handle it in current route, but standard is /tasks/[id])
          
          // Actually, let's just create a new route /api/tasks/[id] or similar or add PUT to the existing list route?
          // No, usually /api/projects/[id]/tasks/[taskId]
          
          // For now, let's assume we will build /api/projects/[id]/tasks/[taskId] next.
          // Or we can add logic to the main tasks route? No, cleaner to strictly separate.
          
          // Let's skip the API call for a split second and define the UI logic first.
          
          // To save time, we'll patch the task via a new Action.
      } catch (e) {}
  };

  if (loading) return <div className="p-8 text-center">Loading Project...</div>;
  if (!project) return <div className="p-8 text-center">Project not found</div>;

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622]">
      {/* Header */}
      <div className="bg-white dark:bg-[#192233] border-b border-slate-200 dark:border-[#232f48] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="py-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link href="/dashboard/projects" className="hover:text-slate-900 dark:hover:text-white">Projects</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white font-medium">{project.name}</span>
                </div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            {project.name}
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                project.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                                {project.status}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">{project.description}</p>
                    </div>
                    {['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole) && (
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className="px-3 py-1.5 text-sm font-medium border border-slate-300 dark:border-[#324467] rounded-md hover:bg-slate-50 dark:hover:bg-[#232f48] transition-colors text-slate-700 dark:text-slate-300"
                        >
                            Settings
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 -mb-px overflow-x-auto">
                {['overview', 'tasks', 'team', ...(['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole) ? ['settings'] : [])].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                            activeTab === tab 
                            ? 'border-[#135bec] text-[#135bec] dark:text-blue-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#192233] p-6 rounded-xl border border-slate-200 dark:border-[#232f48]">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Project Progress</h3>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex-1 h-3 bg-slate-100 dark:bg-[#101622] rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <span className="text-sm font-medium text-emerald-600">{project.progress}%</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            {project.tasks.filter((t: any) => t.status === 'done').length} of {project.taskCount} tasks completed
                        </p>
                    </div>

                    {/* Recent Activity (Placeholder) */}
                    <div className="bg-white dark:bg-[#192233] p-6 rounded-xl border border-slate-200 dark:border-[#232f48]">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Activity</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#135bec] font-bold">U</div>
                                <div>
                                    <p className="text-slate-900 dark:text-white"><span className="font-semibold">User</span> updated status</p>
                                    <p className="text-slate-500 text-xs">2 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#192233] p-6 rounded-xl border border-slate-200 dark:border-[#232f48]">
                        <h3 className="text-sm font-semibold uppercase text-slate-500 mb-4 tracking-wider">Details</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Start Date</dt>
                                <dd className="text-slate-900 dark:text-white">Jan 1, 2026</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Team Size</dt>
                                <dd className="text-slate-900 dark:text-white">{project.memberCount} members</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        )}

        {/* TASKS TAB (Board) */}
        {activeTab === 'tasks' && (
            <div>
                 <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        placeholder="Add a new task..." 
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48] rounded-lg focus:ring-2 focus:ring-[#135bec] outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    <select 
                        value={newTaskStatus}
                        onChange={e => setNewTaskStatus(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48] rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#135bec] outline-none"
                    >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-[#135bec] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Add</button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['todo', 'in_progress', 'done'].map(status => (
                        <div key={status} className="bg-slate-100 dark:bg-[#192233]/50 border border-transparent dark:border-[#232f48] p-4 rounded-xl min-h-[500px]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold capitalize text-slate-700 dark:text-slate-300">{status.replace('_', ' ')}</h3>
                                <span className="bg-slate-200 dark:bg-[#101622] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold border dark:border-[#232f48]">
                                    {project.tasks.filter((t: any) => t.status === status).length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {project.tasks.filter((t: any) => t.status === status).map((task: any) => (
                                    <div key={task.id} className="bg-white dark:bg-[#192233] p-3 rounded-lg border border-slate-200 dark:border-[#232f48] shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{task.title}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                                task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                task.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                                {task.priority || 'Medium'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {project.tasks.filter((t: any) => t.status === status).length === 0 && (
                                    <div className="text-center py-8 text-slate-400 text-sm italic">No tasks</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}




        {activeTab === 'team' && (
            <div className="bg-white dark:bg-[#192233] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-[#232f48] flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Project Members</h3>
                </div>
                
                {/* Invite Form - Hidden for Staff */}
                {['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole) && (
                    <div className="p-4 bg-slate-50 dark:bg-[#101622] border-b border-slate-200 dark:border-[#232f48]">
                        <form onSubmit={handleInvite} className="flex gap-2">
                            <input 
                                type="email" 
                                placeholder="Enter colleague's email..." 
                                className="flex-1 px-3 py-2 border border-slate-200 dark:border-[#324467] rounded-md bg-white dark:bg-[#192233] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#135bec] outline-none"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                required
                            />
                            <select 
                                value={inviteRole}
                                onChange={e => setInviteRole(e.target.value)}
                                className="px-3 py-2 border border-slate-200 dark:border-[#324467] rounded-md bg-white dark:bg-[#192233] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#135bec] outline-none"
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                            </select>
                            <button type="submit" className="px-4 py-2 bg-[#135bec] text-white rounded-md hover:bg-blue-700 transition-colors">Invite</button>
                        </form>
                    </div>
                )}

                <div className="divide-y divide-slate-100 dark:divide-[#232f48]">
                    {project.members && project.members.length > 0 ? project.members.map((member: any) => (
                        <div key={member.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                    {member.userId?.substring(0, 1) || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">User {member.userId}</p>
                                    <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                                </div>
                            </div>
                            {['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole) && (
                                <button 
                                  onClick={() => handleRemoveMember(member.userId)}
                                  className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            )}
                        </div>
                    )) : (
                        <div className="p-8 text-center text-slate-500">No members assigned yet.</div>
                    )}
                </div>
            </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8">
                {/* General Settings */}
                <div className="bg-white dark:bg-[#192233] p-6 rounded-xl border border-slate-200 dark:border-[#232f48]">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">General Settings</h3>
                    <form className="space-y-4" onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            const updates = {
                                name: formData.get('name') as string,
                                description: formData.get('description') as string,
                                status: formData.get('status') as string
                            };
                            
                            const res = await fetch(`/api/projects/${params.id}`, {
                                method: 'PATCH',
                                headers: { 
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(updates)
                            });
                            
                            if (res.ok) {
                                showSuccess('Project updated');
                                fetchProjectDetails();
                            } else {
                                const err = await res.json();
                                showError(err.error || 'Update failed');
                            }
                        } catch (err) {
                            showError('Update failed');
                        }
                    }}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                            <input 
                                name="name"
                                type="text" 
                                defaultValue={project.name}
                                className="w-full px-4 py-2 bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48] rounded-lg focus:ring-2 focus:ring-[#135bec] outline-none text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea 
                                name="description"
                                defaultValue={project.description}
                                rows={3}
                                className="w-full px-4 py-2 bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48] rounded-lg focus:ring-2 focus:ring-[#135bec] outline-none text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                            <select 
                                name="status"
                                defaultValue={project.status}
                                className="w-full px-4 py-2 bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48] rounded-lg outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-[#135bec]"
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="px-4 py-2 bg-[#135bec] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-200 dark:border-red-900/30">
                    <h3 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-400">Danger Zone</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                        Deleting a project is irreversible. All tasks and data associated with this project will be permanently removed.
                    </p>
                    <button 
                        onClick={async () => {
                            if (!confirm('Are you sure you want to delete this project?')) return;
                            try {
                                const res = await fetch(`/api/projects/${params.id}`, {
                                    method: 'DELETE',
                                });
                                if (res.ok) {
                                    window.location.href = '/dashboard/projects';
                                } else {
                                    showError('Delete failed');
                                }
                            } catch (e) {
                                showError('Delete error');
                            }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        Delete Project
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
