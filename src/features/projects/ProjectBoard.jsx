import React, { useState, useEffect } from 'react';
import { theme as t } from '../../theme.js';
import { queryItems, addItem, patchItem, removeItem } from '../../storage.js';
import { Btn, Badge } from '../../shared/Components.jsx';
import { DEFAULT_COLUMNS } from './projectTemplates.js';
import TaskCard from './TaskCard.jsx';
import TaskModal from './TaskModal.jsx';
import TimelineView from './TimelineView.jsx';
import ProgressDocs from './ProgressDocs.jsx';

export default function ProjectBoard({ project, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const [addToCol, setAddToCol] = useState(null);
  const [view, setView] = useState('board');

  const columns = project.columns || DEFAULT_COLUMNS;

  const loadTasks = () => {
    setTasks(queryItems('tasks', [['projectId', '==', project.id]], 'createdAt', 'asc'));
  };

  useEffect(() => { loadTasks(); }, [project.id]);

  const assignees = [...new Set(tasks.map(tk => tk.assignee).filter(Boolean))];

  const filtered = tasks.filter(tk => {
    if (filterAssignee && tk.assignee !== filterAssignee) return false;
    if (filterPriority && tk.priority !== filterPriority) return false;
    if (search && !tk.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const moveTask = (task, newStatus) => {
    const patch = { status: newStatus };
    if (newStatus === 'Done') patch.completedAt = new Date().toISOString();
    else patch.completedAt = null;
    patchItem('tasks', task.id, patch);
    loadTasks();
  };

  const openNew = (col) => { setAddToCol(col); setEditTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditTask(task); setAddToCol(null); setModalOpen(true); };

  const handleSave = (form) => {
    if (editTask?.id) {
      patchItem('tasks', editTask.id, form);
    } else {
      addItem('tasks', { ...form, projectId: project.id, status: addToCol || form.status || 'To Do', completedAt: null });
    }
    loadTasks();
  };

  const handleDelete = (id) => { removeItem('tasks', id); loadTasks(); };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.md, flexWrap: 'wrap' }}>
        <Btn variant="outline" size="sm" onClick={onBack}>Back</Btn>
        <h3 style={{ color: t.colors.navy, margin: 0 }}>{project.name}</h3>
        <Badge color={t.colors.info}>{project.type}</Badge>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {['board', 'timeline'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 12px', fontSize: '12px', border: `1px solid ${view === v ? t.colors.navy : t.colors.border}`,
              borderRadius: t.radius.sm, background: view === v ? t.colors.navy : 'transparent',
              color: view === v ? '#fff' : t.colors.text, cursor: 'pointer', fontWeight: 500,
            }}>{v === 'board' ? 'Board' : 'Timeline'}</button>
          ))}
        </div>
        <ProgressDocs project={project} tasks={tasks} />
      </div>

      <div style={{ display: 'flex', gap: t.spacing.sm, marginBottom: t.spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
          style={{ padding: '6px 12px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '13px', width: 200 }} />
        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
          style={{ padding: '6px 10px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '13px' }}>
          <option value="">All Assignees</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ padding: '6px 10px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '13px' }}>
          <option value="">All Priorities</option>
          {['High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {view === 'timeline' ? (
        <TimelineView tasks={filtered} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: t.spacing.md, minHeight: 400 }}>
          {columns.map(col => {
            const colTasks = filtered.filter(tk => tk.status === col);
            return (
              <div key={col} style={{ background: t.colors.bg, borderRadius: t.radius.md, padding: t.spacing.sm, minHeight: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm, padding: '4px 8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: t.colors.navy }}>{col}</span>
                  <span style={{ fontSize: '12px', color: t.colors.textMuted }}>{colTasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {colTasks.map(tk => (
                    <TaskCard key={tk.id} task={tk} columns={columns} onMove={moveTask} onClick={openEdit} />
                  ))}
                </div>
                <Btn variant="ghost" size="sm" onClick={() => openNew(col)}
                  style={{ marginTop: t.spacing.sm, width: '100%', textAlign: 'center', border: `1px dashed ${t.colors.border}` }}>
                  + Add Task
                </Btn>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} task={editTask}
        columns={columns} onSave={handleSave} onDelete={handleDelete} allTasks={tasks} />
    </div>
  );
}
