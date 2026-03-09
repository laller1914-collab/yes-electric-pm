import React from 'react';
import { theme as t } from '../../theme.js';
import { queryItems } from '../../storage.js';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MultiProjectDash({ projects, onSelect }) {
  const allTasks = queryItems('tasks');
  const now = new Date(); now.setHours(0, 0, 0, 0);

  const stats = projects.map(pj => {
    const pTasks = allTasks.filter(tk => tk.projectId === pj.id);
    const done = pTasks.filter(tk => tk.status === 'Done').length;
    const total = pTasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const overdue = pTasks.filter(tk => tk.status !== 'Done' && tk.dueDate && new Date(tk.dueDate) < now).length;
    const blocked = pTasks.filter(tk => tk.status !== 'Done' && tk.dependencies?.length > 0).length;
    const nextDue = pTasks.filter(tk => tk.status !== 'Done' && tk.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    return { ...pj, done, total, pct, overdue, blocked, nextDue: nextDue?.dueDate };
  });

  const active = stats.filter(s => s.pct < 100);
  const completed = stats.filter(s => s.pct === 100 && s.total > 0);
  const totalOverdue = stats.reduce((s, p) => s + p.overdue, 0);
  const totalBlocked = stats.reduce((s, p) => s + p.blocked, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: t.spacing.sm, marginBottom: t.spacing.lg, flexWrap: 'wrap' }}>
        {[
          { label: 'Active Projects', val: active.length, color: t.colors.navy },
          { label: 'Total Overdue', val: totalOverdue, color: t.colors.danger },
          { label: 'Blocked Tasks', val: totalBlocked, color: t.colors.warning },
        ].map(s => (
          <div key={s.label} style={{ flex: '1 1 120px', background: t.colors.surface, borderRadius: t.radius.md, padding: t.spacing.md, border: `1px solid ${t.colors.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '12px', color: t.colors.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: t.spacing.md }}>
        {active.map(pj => (
          <div key={pj.id} onClick={() => onSelect(pj)} style={{
            background: t.colors.surface, borderRadius: t.radius.md, padding: t.spacing.md,
            border: `1px solid ${t.colors.border}`, cursor: 'pointer', boxShadow: t.shadows.sm,
          }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: t.colors.navy, marginBottom: t.spacing.sm }}>{pj.name}</div>
            <div style={{ height: 6, background: t.colors.bg, borderRadius: 3, overflow: 'hidden', marginBottom: t.spacing.sm }}>
              <div style={{ height: '100%', width: `${pj.pct}%`, background: pj.pct >= 75 ? t.colors.success : pj.pct >= 40 ? t.colors.info : t.colors.warning, borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: t.colors.textMuted }}>
              <span>{pj.pct}% ({pj.done}/{pj.total})</span>
              {pj.overdue > 0 && <span style={{ color: t.colors.danger, fontWeight: 600 }}>{pj.overdue} overdue</span>}
              {pj.blocked > 0 && <span style={{ color: t.colors.warning }}>{pj.blocked} blocked</span>}
            </div>
            {pj.nextDue && <div style={{ fontSize: '11px', color: t.colors.textMuted, marginTop: 4 }}>Next due: {fmtDate(pj.nextDue)}</div>}
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <div style={{ marginTop: t.spacing.lg }}>
          <h4 style={{ color: t.colors.textMuted, fontSize: '13px', marginBottom: t.spacing.sm }}>Completed ({completed.length})</h4>
          {completed.map(pj => (
            <div key={pj.id} onClick={() => onSelect(pj)} style={{
              padding: `${t.spacing.sm} ${t.spacing.md}`, background: '#f0fdf4', borderRadius: t.radius.sm,
              marginBottom: 4, cursor: 'pointer', fontSize: '13px', color: t.colors.success,
            }}>{pj.name} — {pj.total} tasks</div>
          ))}
        </div>
      )}
    </div>
  );
}
