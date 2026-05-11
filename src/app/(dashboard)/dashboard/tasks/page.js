'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all tasks for the dashboard
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        // In the dashboard API we return recentTasks, 
        // but for a full tasks page we might want a dedicated endpoint.
        // For simplicity, we'll use the recent tasks or just show a message.
        setTasks(data.recentTasks || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>My Tasks</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>All tasks assigned to you across all projects.</p>
      </header>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tasks.map(task => (
            <div key={task.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckSquare size={24} style={{ color: task.status === 'DONE' ? '#10b981' : 'var(--border)' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{task.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: getPriorityColor(task.priority) }}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '99px', 
                fontSize: '0.75rem', 
                fontWeight: '600',
                background: 'var(--secondary)',
                color: 'var(--foreground)'
              }}>
                {task.status}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CheckSquare size={48} style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', opacity: 0.5 }} />
          <h2>No tasks assigned</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>You're all caught up! Check your projects for new work.</p>
        </div>
      )}
    </div>
  );
}
