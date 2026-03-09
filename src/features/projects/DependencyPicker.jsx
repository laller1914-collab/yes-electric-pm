import React, { useState } from 'react';
import { theme as t } from '../../theme.js';

export default function DependencyPicker({ allTasks, currentTaskId, selected, onChange }) {
  const [search, setSearch] = useState('');
  const available = (allTasks || []).filter(tk => tk.id !== currentTaskId && tk.status !== 'Done');
  const filtered = search ? available.filter(tk => tk.title.toLowerCase().includes(search.toLowerCase())) : available;

  return (
    <div>
      <label style={{ fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary }}>Blocked By</label>
      {selected.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '4px 0' }}>
          {selected.map(id => {
            const tk = allTasks.find(t => t.id === id);
            return <span key={id} style={{ fontSize: '11px', padding: '2px 8px', background: t.colors.navy, color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              {tk?.title || id} <span onClick={() => onChange(selected.filter(s => s !== id))} style={{ cursor: 'pointer' }}>x</span>
            </span>;
          })}
        </div>
      )}
      <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '6px 10px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '12px', marginTop: 4, boxSizing: 'border-box' }} />
      {search && (
        <div style={{ maxHeight: 120, overflow: 'auto', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, marginTop: 2 }}>
          {filtered.slice(0, 8).map(tk => (
            <label key={tk.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.includes(tk.id)} onChange={() => {
                onChange(selected.includes(tk.id) ? selected.filter(s => s !== tk.id) : [...selected, tk.id]);
              }} /> {tk.title}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
