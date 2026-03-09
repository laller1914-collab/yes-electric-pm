import React, { useState, useEffect } from 'react';
import { theme as t } from '../../theme.js';
import { queryItems, patchItem } from '../../storage.js';
import TaskCalendarView from './TaskCalendarView.jsx';
import CriticalPathView from './CriticalPathView.jsx';

const PRIO_COLORS = { High: t.colors.danger, Medium: t.colors.warning, Low: t.colors.success };

function downloadAllProjects(projects, tasks) {
  const now = new Date().toISOString().slice(0, 10);
  let md = `# All Projects — Progress Report\n**Generated:** ${now}\n\n`;
  const fmtD = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
  for (const pj of projects) {
    const pTasks = tasks.filter(tk => tk.projectId === pj.id);
    const done = pTasks.filter(tk => tk.status === 'Done').length;
    const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
    md += `## ${pj.name} (${pct}% — ${done}/${pTasks.length})\n`;
    const active = pTasks.filter(tk => tk.status !== 'Done').sort((a, b) => (a.dueDate || 'z').localeCompare(b.dueDate || 'z'));
    const completed = pTasks.filter(tk => tk.status === 'Done');
    if (active.length) active.forEach(tk => { md += `- [ ] **${tk.title}** | ${tk.status} | Due: ${fmtD(tk.dueDate)} | ${tk.priority || 'Med'} | ${tk.assignee || 'Unassigned'}\n`; });
    if (completed.length) { md += `\nCompleted:\n`; completed.slice(0, 10).forEach(tk => { md += `- [x] ${tk.title}\n`; }); if (completed.length > 10) md += `  _...+${completed.length - 10} more_\n`; }
    md += '\n---\n\n';
  }
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `all_projects_${now}.md`; a.click(); URL.revokeObjectURL(url);
}

function getEndOfWeek() { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + (7 - d.getDay())); return d; }
function getEndOfMonth() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0); }

function classify(task) {
  if (task.status === 'Done') return 'done';
  if (!task.dueDate) return 'noDueDate';
  const d = new Date(task.dueDate); const now = new Date(); d.setHours(0,0,0,0); now.setHours(0,0,0,0);
  if (d <= now) return 'today';
  if (d <= getEndOfWeek()) return 'thisWeek';
  if (d <= getEndOfMonth()) return 'thisMonth';
  return 'later';
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''; }

const SECTIONS = ['today', 'thisWeek', 'thisMonth', 'later', 'noDueDate', 'done'];
const LABELS = { today: 'Due Today', thisWeek: 'This Week', thisMonth: 'This Month', later: 'Later', noDueDate: 'No Due Date', done: 'Recently Completed' };

function TaskRow({ tk, sec, projMap, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing.sm, padding: `6px ${t.spacing.md}`, borderBottom: `1px solid ${t.colors.border}`, background: tk.status === 'Done' ? '#f9fafb' : '#fff' }}>
      <input type="checkbox" checked={tk.status === 'Done'} onChange={() => onToggle(tk)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: t.colors.navy }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: t.colors.text, textDecoration: tk.status === 'Done' ? 'line-through' : 'none' }}>{tk.title}</div>
        <div style={{ fontSize: '11px', color: t.colors.textMuted }}>{projMap[tk.projectId]?.name || 'Unknown'} · {tk.assignee || 'Unassigned'}</div>
      </div>
      {tk.priority && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: 8, background: PRIO_COLORS[tk.priority] || t.colors.border, color: '#fff', fontWeight: 600 }}>{tk.priority}</span>}
      {tk.dueDate && <span style={{ fontSize: '11px', color: t.colors.textMuted, whiteSpace: 'nowrap' }}>{fmtDate(tk.dueDate)}</span>}
      {tk.dependencies?.length > 0 && <span style={{ fontSize: '12px' }}>🔗</span>}
      {tk.recurrence?.enabled && <span style={{ fontSize: '12px' }}>🔄</span>}
    </div>
  );
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [view, setView] = useState('list');

  const load = () => {
    setTasks(queryItems('tasks', [], 'dueDate', 'asc'));
    setProjects(queryItems('projects', [], 'createdAt', 'desc'));
  };
  useEffect(() => { load(); }, []);

  const projMap = Object.fromEntries(projects.map(p => [p.id, p]));
  const grouped = {}; SECTIONS.forEach(s => { grouped[s] = []; });
  tasks.forEach(tk => { const sec = classify(tk); if (grouped[sec]) grouped[sec].push(tk); });

  const toggleDone = (task) => {
    const isDone = task.status === 'Done';
    patchItem('tasks', task.id, { status: isDone ? 'To Do' : 'Done', completedAt: isDone ? null : new Date().toISOString() });
    load();
  };

  const toggle = (sec) => setCollapsed(p => ({ ...p, [sec]: !p[sec] }));
  const open = tasks.filter(tk => tk.status !== 'Done');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
        <h2 style={{ color: t.colors.navy, margin: 0 }}>My Tasks</h2>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[['list', 'List'], ['calendar', 'Calendar'], ['critical', 'Critical Path']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 14px', fontSize: '12px', border: `1px solid ${view === v ? t.colors.navy : t.colors.border}`,
              borderRadius: t.radius.sm, background: view === v ? t.colors.navy : 'transparent',
              color: view === v ? '#fff' : t.colors.text, cursor: 'pointer', fontWeight: 500,
            }}>{label}</button>
          ))}
          <button onClick={() => downloadAllProjects(projects, tasks)} style={{
            padding: '5px 14px', fontSize: '12px', border: `1px solid ${t.colors.gold}`,
            borderRadius: t.radius.sm, background: t.colors.gold, color: '#fff', cursor: 'pointer', fontWeight: 600,
          }}>Download All Reports</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: t.spacing.sm, marginBottom: t.spacing.md, flexWrap: 'wrap' }}>
        {[
          { label: 'Open', val: open.length, color: t.colors.navy },
          { label: 'Today', val: grouped.today.length, color: t.colors.danger },
          { label: 'This Week', val: grouped.thisWeek.length, color: t.colors.info },
          { label: 'This Month', val: grouped.thisMonth.length, color: t.colors.gold },
        ].map(s => (
          <div key={s.label} style={{ flex: '1 1 100px', background: t.colors.surface, borderRadius: t.radius.md, padding: `${t.spacing.sm} ${t.spacing.md}`, border: `1px solid ${t.colors.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '11px', color: t.colors.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {view === 'calendar' ? (
        <TaskCalendarView tasks={tasks} projects={projects} onToggleDone={toggleDone} />
      ) : view === 'critical' ? (
        <CriticalPathView tasks={tasks} projects={projects} />
      ) : (
        SECTIONS.map(sec => {
          const items = grouped[sec];
          if (items.length === 0 && (sec === 'done' || sec === 'later' || sec === 'noDueDate')) return null;
          return (
            <div key={sec} style={{ marginBottom: t.spacing.sm }}>
              <div onClick={() => toggle(sec)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                padding: `6px ${t.spacing.md}`, background: t.colors.surface, borderRadius: t.radius.sm, border: `1px solid ${t.colors.border}`,
              }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: t.colors.text }}>{LABELS[sec]} ({items.length})</span>
                <span style={{ color: t.colors.textMuted, fontSize: '12px' }}>{collapsed[sec] ? '▶' : '▼'}</span>
              </div>
              {!collapsed[sec] && items.map(tk => <TaskRow key={tk.id} tk={tk} sec={sec} projMap={projMap} onToggle={toggleDone} />)}
            </div>
          );
        })
      )}
    </div>
  );
}
