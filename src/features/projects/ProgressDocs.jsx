import React from 'react';
import { theme as t } from '../../theme.js';

function generateMarkdown(project, tasks) {
  const now = new Date().toISOString().slice(0, 10);
  const fmtD = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
  const pTasks = tasks.filter(tk => tk.projectId === project.id);
  const done = pTasks.filter(tk => tk.status === 'Done').length;
  const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
  let md = `# ${project.name} — Progress Report\n**Date:** ${now} | **Progress:** ${pct}% (${done}/${pTasks.length})\n\n`;
  const groups = { 'Overdue': [], 'In Progress': [], 'To Do': [], 'Review': [], 'Done': [] };
  pTasks.forEach(tk => {
    if (tk.status === 'Done') groups['Done'].push(tk);
    else if (tk.dueDate && new Date(tk.dueDate) < new Date()) groups['Overdue'].push(tk);
    else if (groups[tk.status]) groups[tk.status].push(tk);
    else groups['To Do'].push(tk);
  });
  for (const [label, items] of Object.entries(groups)) {
    if (!items.length) continue;
    md += `## ${label}\n`;
    items.forEach(tk => {
      const check = tk.status === 'Done' ? '[x]' : '[ ]';
      md += `- ${check} **${tk.title}** | Due: ${fmtD(tk.dueDate)} | ${tk.priority || 'Med'} | ${tk.assignee || 'Unassigned'}\n`;
    });
    md += '\n';
  }
  return md;
}

export default function ProgressDocs({ project, tasks }) {
  const download = () => {
    const md = generateMarkdown(project, tasks);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${project.name.replace(/\s+/g, '_')}_progress.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={download} style={{
      padding: '5px 12px', fontSize: '12px', background: t.colors.gold, color: '#fff',
      border: 'none', borderRadius: t.radius.sm, cursor: 'pointer', fontWeight: 600,
    }}>Export Progress</button>
  );
}
