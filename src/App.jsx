import React, { useState } from 'react';
import { theme as t } from './theme.js';
import { exportAll, importAll } from './storage.js';
import ProjectsPage from './features/projects/ProjectsPage.jsx';
import MyTasksPage from './features/mytasks/MyTasksPage.jsx';

const PAGES = ['Projects', 'My Tasks'];

export default function App() {
  const [page, setPage] = useState('Projects');

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const result = importAll(ev.target.result);
          alert(`Imported ${result.projects} projects, ${result.tasks} tasks. Refreshing...`);
          window.location.reload();
        } catch (err) { alert('Import failed: ' + err.message); }
      };
      reader.readAsText(f);
    };
    input.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: t.colors.bg }}>
      {/* Top Bar */}
      <div style={{
        background: t.colors.navy, padding: `${t.spacing.sm} ${t.spacing.lg}`,
        display: 'flex', alignItems: 'center', gap: t.spacing.lg, boxShadow: t.shadows.md,
      }}>
        <span style={{ color: t.colors.gold, fontWeight: 700, fontSize: '18px', fontFamily: t.fonts.heading }}>
          Project Manager
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {PAGES.map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              padding: '6px 16px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
              borderRadius: t.radius.sm, fontFamily: t.fonts.body,
              background: page === p ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: page === p ? '#fff' : 'rgba(255,255,255,0.7)',
            }}>{p}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button onClick={exportAll} style={{
            padding: '4px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: t.radius.sm, cursor: 'pointer',
          }}>Export Backup</button>
          <button onClick={handleImport} style={{
            padding: '4px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: t.radius.sm, cursor: 'pointer',
          }}>Import Backup</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: t.spacing.lg }}>
        {page === 'Projects' && <ProjectsPage />}
        {page === 'My Tasks' && <MyTasksPage />}
      </div>
    </div>
  );
}
