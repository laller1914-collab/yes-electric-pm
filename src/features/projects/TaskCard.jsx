import React from 'react';
import { theme as t } from '../../theme.js';
import { Badge } from '../../shared/Components.jsx';

const priorityColors = { High: t.colors.danger, Medium: t.colors.warning, Low: t.colors.success };

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function TaskCard({ task, columns, onMove, onClick }) {
  const pColor = priorityColors[task.priority] || t.colors.info;
  const overdue = task.status !== 'Done' && isOverdue(task.dueDate);
  const checklist = task.checklist || [];
  const done = checklist.filter(c => c.done).length;

  return (
    <div onClick={() => onClick(task)} style={{
      background: t.colors.surface, borderRadius: t.radius.md, padding: '12px',
      boxShadow: t.shadows.sm, cursor: 'pointer', borderLeft: `3px solid ${pColor}`,
    }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: t.colors.text, marginBottom: '8px' }}>{task.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {task.assignee && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.colors.navy, color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(task.assignee)}</div>
        )}
        {task.dueDate && (
          <span style={{ fontSize: '12px', color: overdue ? t.colors.danger : t.colors.textMuted, fontWeight: overdue ? 600 : 400 }}>
            {overdue ? 'Overdue: ' : ''}{formatDate(task.dueDate)}
          </span>
        )}
        <Badge color={pColor}>{task.priority || 'Medium'}</Badge>
        {checklist.length > 0 && <span style={{ fontSize: '11px', color: t.colors.textMuted }}>{done}/{checklist.length}</span>}
        {task.dependencies?.length > 0 && <span style={{ fontSize: '11px' }}>🔗{task.dependencies.length}</span>}
        {task.recurrence?.enabled && <span style={{ fontSize: '11px' }}>🔄</span>}
      </div>
      <div style={{ marginTop: '8px' }} onClick={e => e.stopPropagation()}>
        <select value="" onChange={e => { if (e.target.value) onMove(task, e.target.value); e.target.value = ''; }}
          style={{ fontSize: '11px', padding: '2px 6px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, color: t.colors.textSecondary, background: 'transparent', cursor: 'pointer' }}>
          <option value="">Move to...</option>
          {columns.filter(c => c !== task.status).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}
