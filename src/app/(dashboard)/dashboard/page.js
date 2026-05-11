'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading stats...</p>;

  const cards = [
    { 
      title: 'Total Tasks', 
      value: stats?.totalTasks || 0, 
      icon: BarChart3, 
      color: 'var(--primary)' 
    },
    { 
      title: 'Completed', 
      value: stats?.statusCounts?.DONE || 0, 
      icon: CheckCircle2, 
      color: '#10b981' 
    },
    { 
      title: 'In Progress', 
      value: stats?.statusCounts?.IN_PROGRESS || 0, 
      icon: Clock, 
      color: '#f59e0b' 
    },
    { 
      title: 'Overdue', 
      value: stats?.overdueCount || 0, 
      icon: AlertCircle, 
      color: '#ef4444' 
    },
  ];

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Welcome back! Here's what's happening today.</p>
        </div>
        <Link href="/dashboard/projects" className="btn btn-primary">
          <Plus size={20} />
          New Project
        </Link>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: `${card.color}20`, 
                color: card.color,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', fontWeight: '500' }}>{card.title}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <section className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Tasks</h2>
        {stats?.recentTasks?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.recentTasks.map(task => (
              <div key={task.id} style={{ 
                padding: '1rem', 
                background: 'var(--background)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontWeight: '600' }}>{task.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{task.status} • {task.priority}</p>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '99px', 
                  fontSize: '0.75rem', 
                  fontWeight: '600',
                  background: task.status === 'DONE' ? '#10b98120' : '#3b82f620',
                  color: task.status === 'DONE' ? '#10b981' : '#3b82f6'
                }}>
                  {task.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
            No tasks found. Start by creating a project!
          </div>
        )}
      </section>
    </div>
  );
}
