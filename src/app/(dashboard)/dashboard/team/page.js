'use client';

import { Users, UserPlus } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Team Management</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Collaborate with your team members across projects.</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={20} />
          Invite Member
        </button>
      </header>

      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Users size={48} style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', opacity: 0.5 }} />
        <h2>Team Collaboration</h2>
        <p style={{ color: 'var(--muted-foreground)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          This feature is coming soon! You'll be able to invite teammates, assign roles, and manage permissions.
        </p>
        <button className="btn btn-secondary">Learn More</button>
      </div>
    </div>
  );
}
