import React from 'react';
import { theme as t } from '../../theme.js';

export default function RecurrenceSettings({ value, onChange }) {
  const r = value || { enabled: false, pattern: 'weekly', interval: 1, nextDue: '' };
  const set = (k, v) => onChange({ ...r, [k]: v });

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary, cursor: 'pointer' }}>
        <input type="checkbox" checked={r.enabled} onChange={e => set('enabled', e.target.checked)} /> Recurring Task
      </label>
      {r.enabled && (
        <div style={{ display: 'flex', gap: t.spacing.sm, marginTop: t.spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={r.pattern} onChange={e => set('pattern', e.target.value)}
            style={{ padding: '4px 8px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '12px' }}>
            {['daily', 'weekly', 'monthly'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span style={{ fontSize: '12px', color: t.colors.textMuted }}>every</span>
          <input type="number" min="1" max="52" value={r.interval} onChange={e => set('interval', Number(e.target.value))}
            style={{ width: 50, padding: '4px 6px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '12px' }} />
          <span style={{ fontSize: '12px', color: t.colors.textMuted }}>Next:</span>
          <input type="date" value={r.nextDue} onChange={e => set('nextDue', e.target.value)}
            style={{ padding: '4px 6px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '12px' }} />
        </div>
      )}
    </div>
  );
}
