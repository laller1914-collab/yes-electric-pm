import React, { useState } from 'react';
import { theme as t } from '../../theme.js';

const PRIO_COLORS = { High: t.colors.danger, Medium: t.colors.warning, Low: t.colors.success };

export default function TimelineView({ tasks }) {
  const [weeks, setWeeks] = useState(8);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const start = new Date(now); start.setDate(start.getDate() - 7);
  const end = new Date(now); end.setDate(end.getDate() + weeks * 7);
  const totalDays = Math.round((end - start) / 86400000);
  const withDates = tasks.filter(tk => tk.dueDate && tk.status !== 'Done');

  const fmtDay = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const pct = (date) => {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return Math.max(0, Math.min(100, ((d - start) / (end - start)) * 100));
  };
  const todayPct = pct(now);

  return (
    <div style={{ background: t.colors.surface, borderRadius: t.radius.md, border: `1px solid ${t.colors.border}`, padding: t.spacing.md }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: t.colors.navy }}>Timeline</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[4, 8, 12].map(w => (
            <button key={w} onClick={() => setWeeks(w)} style={{
              padding: '3px 10px', fontSize: '11px', border: `1px solid ${weeks === w ? t.colors.navy : t.colors.border}`,
              borderRadius: t.radius.sm, background: weeks === w ? t.colors.navy : 'transparent',
              color: weeks === w ? '#fff' : t.colors.text, cursor: 'pointer',
            }}>{w}w</button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', minHeight: withDates.length * 36 + 30 }}>
        {/* Date labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: t.colors.textMuted, marginBottom: 8 }}>
          <span>{fmtDay(start)}</span><span>{fmtDay(now)}</span><span>{fmtDay(end)}</span>
        </div>
        {/* Today line */}
        <div style={{ position: 'absolute', left: `${todayPct}%`, top: 20, bottom: 0, width: 2, background: t.colors.danger, zIndex: 1 }}>
          <span style={{ position: 'absolute', top: -14, left: -14, fontSize: '9px', color: t.colors.danger, fontWeight: 700 }}>TODAY</span>
        </div>
        {/* Tasks */}
        {withDates.map((tk, i) => {
          const left = pct(tk.dueDate);
          const color = PRIO_COLORS[tk.priority] || t.colors.info;
          const blocked = tk.dependencies?.length > 0;
          return (
            <div key={tk.id} style={{ position: 'absolute', top: 24 + i * 36, left: `${Math.max(0, left - 10)}%`, right: `${Math.max(0, 100 - left)}%`, minWidth: 120 }}>
              <div style={{ padding: '4px 8px', borderRadius: t.radius.sm, background: color + '20', borderLeft: `3px solid ${color}`, fontSize: '11px', fontWeight: 500, color: t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: blocked ? 0.6 : 1 }}>
                {tk.title} {blocked ? '🔗' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
