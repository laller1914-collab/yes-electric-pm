import React, { useState, useEffect } from 'react';
import { theme as t } from '../../theme.js';
import { queryItems, addItem, removeItem } from '../../storage.js';
import { Btn, Badge } from '../../shared/Components.jsx';
import NewProjectModal from './NewProjectModal.jsx';
import ProjectBoard from './ProjectBoard.jsx';
import MultiProjectDash from './MultiProjectDash.jsx';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [hubView, setHubView] = useState('cards');

  const load = () => setProjects(queryItems('projects', [], 'createdAt', 'desc'));
  useEffect(() => { load(); }, []);

  const handleCreate = (data) => { addItem('projects', data); load(); };
  const handleDelete = (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    removeItem('projects', id);
    const tasks = queryItems('tasks', [['projectId', '==', id]]);
    tasks.forEach(tk => removeItem('tasks', tk.id));
    load(); setSelected(null);
  };

  if (selected) {
    return <ProjectBoard project={selected} onBack={() => { setSelected(null); load(); }} />;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
        <h2 style={{ color: t.colors.navy, margin: 0 }}>Projects</h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['cards', 'overview'].map(v => (
            <button key={v} onClick={() => setHubView(v)} style={{
              padding: '5px 14px', fontSize: '12px', border: `1px solid ${hubView === v ? t.colors.navy : t.colors.border}`,
              borderRadius: t.radius.sm, background: hubView === v ? t.colors.navy : 'transparent',
              color: hubView === v ? '#fff' : t.colors.text, cursor: 'pointer', fontWeight: 500,
            }}>{v === 'cards' ? 'Cards' : 'Overview'}</button>
          ))}
          <Btn onClick={() => setShowNew(true)}>+ New Project</Btn>
        </div>
      </div>

      {hubView === 'overview' ? (
        <MultiProjectDash projects={projects} onSelect={setSelected} />
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: t.spacing.xl, color: t.colors.textMuted }}>
          No projects yet. Create one to get started!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: t.spacing.md }}>
          {projects.map(pj => {
            const tasks = queryItems('tasks', [['projectId', '==', pj.id]]);
            const done = tasks.filter(tk => tk.status === 'Done').length;
            const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            return (
              <div key={pj.id} onClick={() => setSelected(pj)} style={{
                background: t.colors.surface, borderRadius: t.radius.md, padding: t.spacing.md,
                border: `1px solid ${t.colors.border}`, cursor: 'pointer', boxShadow: t.shadows.sm,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: t.colors.navy }}>{pj.name}</span>
                  <Badge color={t.colors.info}>{pj.type}</Badge>
                </div>
                <div style={{ height: 6, background: t.colors.bg, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: t.colors.success, borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: t.colors.textMuted }}>
                  <span>{pct}% complete ({done}/{tasks.length})</span>
                  <span onClick={e => { e.stopPropagation(); handleDelete(pj.id); }} style={{ color: t.colors.danger, cursor: 'pointer' }}>Delete</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewProjectModal open={showNew} onClose={() => setShowNew(false)} onSave={handleCreate} />
    </div>
  );
}
