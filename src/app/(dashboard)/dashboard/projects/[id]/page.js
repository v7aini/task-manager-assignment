'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  Trash2, 
  Calendar,
  AlertCircle,
  MoreVertical,
  Filter,
  Users,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectDetailPage({ params }) {
  const { id: projectId } = params;
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    assigneeId: ''
  });

  const [newMember, setNewMember] = useState({
    email: '',
    role: 'MEMBER'
  });

  const [inviteError, setInviteError] = useState('');

  const fetchData = async () => {
    try {
      const pRes = await fetch('/api/projects');
      const pData = await pRes.json();
      const currentProject = pData.find(p => p.id === projectId);
      setProject(currentProject);

      const tRes = await fetch(`/api/projects/${projectId}/tasks`);
      const tData = await tRes.json();
      setTasks(tData);

      const mRes = await fetch(`/api/projects/${projectId}/members`);
      const mData = await mRes.json();
      setMembers(mData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        setShowTaskModal(false);
        setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setInviteError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowInviteModal(false);
        setNewMember({ email: '', role: 'MEMBER' });
        fetchData();
      } else {
        setInviteError(data.error || 'Failed to invite member');
      }
    } catch (err) {
      setInviteError('Failed to invite member');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading project details...</p>;
  if (!project) return <p>Project not found.</p>;

  const getPriorityColor = (p) => {
    switch(p) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return 'var(--muted-foreground)';
    }
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>{project.name}</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>{project.description || 'No description provided.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowInviteModal(true)} className="btn btn-secondary">
              <UserPlus size={20} />
              Team
            </button>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1.5rem' }}>
          <div className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            <Filter size={16} />
            Filter
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            {tasks.length} total tasks • {tasks.filter(t => t.status === 'DONE').length} completed
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
            <section key={status}>
              <h3 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '700', 
                color: 'var(--muted-foreground)', 
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {status.replace('_', ' ')}
                <span style={{ 
                  background: 'var(--secondary)', 
                  color: 'var(--foreground)', 
                  padding: '2px 8px', 
                  borderRadius: '99px',
                  fontSize: '0.75rem'
                }}>
                  {tasks.filter(t => t.status === status).length}
                </span>
              </h3>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => updateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: task.status === 'DONE' ? '#10b981' : 'var(--border)'
                      }}
                    >
                      <CheckSquare size={24} />
                    </button>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                        color: task.status === 'DONE' ? 'var(--muted-foreground)' : 'var(--foreground)'
                      }}>
                        {task.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '700', 
                          color: getPriorityColor(task.priority),
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <AlertCircle size={12} />
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        )}
                        {task.assignee && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users size={12} />
                            {task.assignee.name || task.assignee.email.split('@')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                        <button 
                          onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem', borderRadius: '8px' }}
                          title="Move to In Progress"
                        >
                          <Clock size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--destructive)' }}
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === status).length === 0 && (
                  <div style={{ 
                    padding: '1.5rem', 
                    border: '1px dashed var(--border)', 
                    borderRadius: 'var(--radius)',
                    textAlign: 'center',
                    color: 'var(--muted-foreground)',
                    fontSize: '0.875rem'
                  }}>
                    No tasks in this stage.
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        <aside>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} />
              Team Members
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {members.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'var(--secondary)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {member.user.name || member.user.email.split('@')[0]}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.875rem' }}
            >
              <Plus size={16} />
              Invite Member
            </button>
          </div>
        </aside>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.7)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', background: 'var(--card)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Design hero section"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Assign To</label>
                <select 
                  className="input"
                  value={newTask.assigneeId}
                  onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name || m.user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Priority</label>
                  <select 
                    className="input"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    className="input"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.7)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '400px', background: 'var(--card)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Invite Team Member</h2>
            <form onSubmit={handleInviteMember}>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input" 
                  placeholder="teammate@company.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select 
                  className="input"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {inviteError && <p style={{ color: 'var(--destructive)', marginBottom: '1rem', fontSize: '0.875rem' }}>{inviteError}</p>}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
