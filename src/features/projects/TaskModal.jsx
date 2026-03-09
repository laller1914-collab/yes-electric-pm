import React, { useState, useEffect } from 'react';
import { theme as t } from '../../theme.js';
import { Modal, Input, TextArea, Select, Btn } from '../../shared/Components.jsx';
import DependencyPicker from './DependencyPicker.jsx';
import RecurrenceSettings from './RecurrenceSettings.jsx';

const emptyTask = { title: '', description: '', assignee: '', dueDate: '', priority: 'Medium',
  status: 'To Do', checklist: [], notes: [], dependencies: [],
  recurrence: { enabled: false, pattern: 'weekly', interval: 1, nextDue: '' } };

export default function TaskModal({ open, onClose, task, columns, onSave, onDelete, allTasks }) {
  const [form, setForm] = useState(emptyTask);
  const [newCheck, setNewCheck] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (task) setForm({ ...emptyTask, ...task });
    else setForm(emptyTask);
  }, [task, open]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addCheckItem = () => {
    if (!newCheck.trim()) return;
    set('checklist', [...(form.checklist || []), { text: newCheck.trim(), done: false }]);
    setNewCheck('');
  };

  const toggleCheck = (i) => {
    const cl = [...form.checklist]; cl[i] = { ...cl[i], done: !cl[i].done }; set('checklist', cl);
  };

  const removeCheck = (i) => set('checklist', form.checklist.filter((_, idx) => idx !== i));

  const addNote = () => {
    if (!newNote.trim()) return;
    set('notes', [...(form.notes || []), { text: newNote.trim(), timestamp: new Date().toISOString() }]);
    setNewNote('');
  };

  const handleSave = () => { onSave(form); onClose(); };

  return (
    <Modal open={open} onClose={onClose} title={task?.id ? 'Edit Task' : 'New Task'} width="560px">
      <Input label="Title" value={form.title} onChange={v => set('title', v)} required />
      <TextArea label="Description" value={form.description} onChange={v => set('description', v)} rows={3} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing.sm }}>
        <Input label="Assignee" value={form.assignee} onChange={v => set('assignee', v)} />
        <Input label="Due Date" type="date" value={form.dueDate} onChange={v => set('dueDate', v)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing.sm }}>
        <Select label="Priority" value={form.priority} onChange={v => set('priority', v)} options={['High', 'Medium', 'Low']} />
        <Select label="Status" value={form.status} onChange={v => set('status', v)} options={columns} />
      </div>

      <div style={{ marginTop: t.spacing.md }}>
        <DependencyPicker allTasks={allTasks || []} currentTaskId={task?.id} selected={form.dependencies || []} onChange={v => set('dependencies', v)} />
      </div>
      <div style={{ marginTop: t.spacing.md }}>
        <RecurrenceSettings value={form.recurrence} onChange={v => set('recurrence', v)} />
      </div>

      {/* Checklist */}
      <div style={{ marginTop: t.spacing.md }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary }}>Checklist</label>
        {(form.checklist || []).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <input type="checkbox" checked={item.done} onChange={() => toggleCheck(i)} />
            <span style={{ flex: 1, fontSize: '13px', textDecoration: item.done ? 'line-through' : 'none', color: item.done ? t.colors.textMuted : t.colors.text }}>{item.text}</span>
            <span style={{ cursor: 'pointer', color: t.colors.danger, fontSize: '14px' }} onClick={() => removeCheck(i)}>x</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <input value={newCheck} onChange={e => setNewCheck(e.target.value)} placeholder="Add item..." onKeyDown={e => e.key === 'Enter' && addCheckItem()}
            style={{ flex: 1, padding: '6px 10px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '13px' }} />
          <Btn size="sm" onClick={addCheckItem}>+</Btn>
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginTop: t.spacing.md }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary }}>Notes</label>
        {(form.notes || []).map((n, i) => (
          <div key={i} style={{ padding: '6px 0', borderBottom: `1px solid ${t.colors.border}` }}>
            <div style={{ fontSize: '13px', color: t.colors.text }}>{n.text}</div>
            <div style={{ fontSize: '11px', color: t.colors.textMuted }}>{new Date(n.timestamp).toLocaleString()}</div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add note..." onKeyDown={e => e.key === 'Enter' && addNote()}
            style={{ flex: 1, padding: '6px 10px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '13px' }} />
          <Btn size="sm" onClick={addNote}>+</Btn>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing.lg }}>
        <div>{task?.id && <Btn variant="danger" onClick={() => { onDelete(task.id); onClose(); }}>Delete</Btn>}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={!form.title.trim()}>Save</Btn>
        </div>
      </div>
    </Modal>
  );
}
