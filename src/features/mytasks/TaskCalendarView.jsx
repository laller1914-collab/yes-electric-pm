import React, { useState } from 'react';
import { theme as t } from '../../theme.js';

const PRIO_COLORS = { High: t.colors.danger, Medium: t.colors.warning, Low: t.colors.success };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

export default function TaskCalendarView({ tasks, projects, onToggleDone }) {
  const [month, setMonth] = useState(new Date());
  const projMap = Object.fromEntries((projects || []).map(p => [p.id, p]));

  const year = month.getFullYear(), mo = month.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, mo, d));

  const tasksByDate = {};
  (tasks || []).forEach(tk => {
    if (!tk.dueDate) return;
    const key = tk.dueDate.slice(0, 10);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(tk);
  });

  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ background: t.colors.surface, borderRadius: t.radius.md, border: `1px solid ${t.colors.border}`, padding: t.spacing.md }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
        <button onClick={() => setMonth(new Date(year, mo - 1, 1))} style={{ background: 'none', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, padding: '4px 12px', cursor: 'pointer' }}>&lsaquo;</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing.sm }}>
          <span style={{ fontWeight: 700, fontSize: '16px', color: t.colors.navy }}>{monthLabel}</span>
          <button onClick={() => setMonth(new Date())} style={{ background: t.colors.bg, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, padding: '2px 8px', cursor: 'pointer', fontSize: '11px' }}>Today</button>
        </div>
        <button onClick={() => setMonth(new Date(year, mo + 1, 1))} style={{ background: 'none', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, padding: '4px 12px', cursor: 'pointer' }}>&rsaquo;</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: t.colors.textMuted, padding: '4px 0' }}>{d}</div>)}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} style={{ minHeight: 80, background: '#fafafa' }} />;
          const key = date.toISOString().slice(0, 10);
          const dayTasks = tasksByDate[key] || [];
          const isToday = sameDay(date, today);
          return (
            <div key={key} style={{ minHeight: 80, padding: '2px 4px', background: isToday ? '#eff6ff' : t.colors.surface, border: `1px solid ${isToday ? t.colors.info : t.colors.border}`, overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', fontWeight: isToday ? 700 : 400, color: isToday ? t.colors.info : t.colors.textMuted, marginBottom: 2 }}>{date.getDate()}</div>
              {dayTasks.slice(0, 3).map(tk => (
                <div key={tk.id} onClick={() => onToggleDone?.(tk)} style={{
                  fontSize: '10px', padding: '1px 4px', marginBottom: 1, borderRadius: 3, cursor: 'pointer',
                  background: tk.status === 'Done' ? '#d1fae5' : (PRIO_COLORS[tk.priority] || t.colors.info) + '20',
                  borderLeft: `2px solid ${tk.status === 'Done' ? t.colors.success : PRIO_COLORS[tk.priority] || t.colors.info}`,
                  textDecoration: tk.status === 'Done' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }} title={`${tk.title} — ${projMap[tk.projectId]?.name || ''}`}>{tk.title}</div>
              ))}
              {dayTasks.length > 3 && <div style={{ fontSize: '9px', color: t.colors.textMuted, textAlign: 'center' }}>+{dayTasks.length - 3} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
