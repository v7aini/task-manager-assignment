'use client';

import { useState, useEffect } from 'react';
import { Plus, Briefcase, ChevronRight, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      
      if (res.ok) {
        setShowModal(false);
        setNewProject({ name: '', description: '' });
        fetchProjects();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create project');
    }
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Projects</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage and track your team's projects.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={20} />
          New Project
        </button>
      </header>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'var(--secondary)', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <Briefcase size={20} />
                  </div>
                  <button className="btn" style={{ padding: '0.25rem', color: 'var(--muted-foreground)' }}>
                    <MoreVertical size={16} />
                  </button>
                </div>
                
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>{project.name}</h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--muted-foreground)', 
                  marginBottom: '1.5rem',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {project.description || 'No description provided.'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: '500' }}>
                    {project._count?.tasks || 0} Tasks
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>
                    View Project
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Briefcase size={48} style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ marginBottom: '0.5rem' }}>No projects yet</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>Get started by creating your first project.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Create Project
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
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
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Website Redesign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea 
                  className="input" 
                  rows="4" 
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  style={{ resize: 'none' }}
                ></textarea>
              </div>
              {error && <p style={{ color: 'var(--destructive)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
