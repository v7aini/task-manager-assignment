'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Settings, 
  LogOut,
  Users
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyItems: 'center' }}>
        <p style={{ margin: 'auto' }}>Loading...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Team', href: '/dashboard/team', icon: Users },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'var(--primary)', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white'
          }}>T</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>TeamFlow</h2>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name} style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    href={item.href}
                    className={`btn ${isActive ? 'btn-primary' : ''}`}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'flex-start',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? 'white' : 'var(--muted-foreground)',
                      padding: '0.75rem 1rem'
                    }}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'var(--secondary)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {user.name?.charAt(0) || user.email.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || 'User'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="btn"
            style={{ 
              width: '100%', 
              justifyContent: 'flex-start', 
              color: 'var(--destructive)',
              padding: '0.75rem 1rem'
            }}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
