import React, { useMemo } from 'react';
import { theme as t } from '../../theme.js';

const PRIO_COLORS = { High: t.colors.danger, Medium: t.colors.warning, Low: t.colors.success };
const STATUS_COLORS = { 'To Do': t.colors.textMuted, 'In Progress': t.colors.info, Review: t.colors.gold, Done: t.colors.success };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CriticalPathView({ tasks, projects }) {
  const projMap = Object.fromEntries((projects || []).map(p => [p.id, p]));
  const taskMap = Object.fromEntries((tasks || []).map(tk => [tk.id, tk]));

  const chains = useMemo(() => {
    const active = (tasks || []).filter(tk => tk.status !== 'Done');
    const byProject = {};
    active.forEach(tk => {
      if (!byProject[tk.projectId]) byProject[tk.projectId] = [];
      byProject[tk.projectId].push(tk);
    });

    const result = [];
    for (const [projId, pTasks] of Object.entries(byProject)) {
      const hasBlockers = pTasks.filter(tk => tk.dependencies?.length > 0);
      const blockerIds = new Set(hasBlockers.flatMap(tk => tk.dependencies || []));
      const roots = pTasks.filter(tk => blockerIds.has(tk.id) && !tk.dependencies?.length);
      const standalone = pTasks.filter(tk => !tk.dependencies?.length && !blockerIds.has(tk.id) && tk.dueDate)
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

      const walked = new Set();
      const chainList = [];
      function walk(taskId, chain) {
        if (walked.has(taskId)) return;
        walked.add(taskId);
        const tk = taskMap[taskId]; if (!tk) return;
        chain.push(tk);
        pTasks.filter(t => t.dependencies?.includes(taskId)).forEach(dt => walk(dt.id, chain));
      }
      roots.forEach(r => { const chain = []; walk(r.id, chain); if (chain.length > 0) chainList.push(chain); });
      hasBlockers.filter(tk => !walked.has(tk.id)).forEach(tk => { walked.add(tk.id); chainList.push([tk]); });

      result.push({ projId, projName: projMap[projId]?.name || 'Unknown', chains: chainList, standalone: standalone.slice(0, 5) });
    }
    return result.sort((a, b) => b.chains.length - a.chains.length);
  }, [tasks, projects]);

  const now = new Date(); now.setHours(0, 0, 0, 0);

  return (
    <div style={{ background: t.colors.surface, borderRadius: t.radius.md, border: `1px solid ${t.colors.border}`, padding: t.spacing.md }}>
      <h3 style={{ margin: `0 0 ${t.spacing.sm}`, color: t.colors.navy, fontSize: '16px' }}>Critical Path — Dependency Chains</h3>
      <p style={{ fontSize: '12px', color: t.colors.textMuted, margin: `0 0 ${t.spacing.md}` }}>
        Tasks connected by dependencies shown as chains. Blocked tasks can't start until their blockers are done.
      </p>

      {chains.length === 0 && <div style={{ padding: t.spacing.lg, textAlign: 'center', color: t.colors.textMuted }}>No dependency chains found. Add "Blocked By" dependencies to see the critical path.</div>}

      {chains.map(({ projId, projName, chains: chainList, standalone }) => (
        <div key={projId} style={{ marginBottom: t.spacing.lg }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: t.colors.navy, marginBottom: t.spacing.sm, borderBottom: `2px solid ${t.colors.gold}`, paddingBottom: 4 }}>{projName}</div>
          {chainList.map((chain, ci) => (
            <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: t.spacing.sm, overflowX: 'auto', paddingBottom: 4 }}>
              {chain.map((tk, ti) => {
                const isOverdue = tk.dueDate && new Date(tk.dueDate) < now;
                const blocked = tk.dependencies?.some(id => taskMap[id]?.status !== 'Done');
                return (
                  <React.Fragment key={tk.id}>
                    {ti > 0 && <div style={{ width: 28, height: 2, background: t.colors.navy, flexShrink: 0, position: 'relative' }}>
                      <div style={{ position: 'absolute', right: -3, top: -4, fontSize: '10px', color: t.colors.navy }}>▶</div>
                    </div>}
                    <div style={{
                      minWidth: 140, padding: '8px 10px', borderRadius: t.radius.sm, flexShrink: 0,
                      border: `2px solid ${blocked ? t.colors.warning : isOverdue ? t.colors.danger : STATUS_COLORS[tk.status] || t.colors.border}`,
                      background: blocked ? '#fff7ed' : '#fff', opacity: blocked ? 0.8 : 1,
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: t.colors.text, marginBottom: 2 }}>{tk.title}</div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: 4, background: STATUS_COLORS[tk.status] || t.colors.border, color: '#fff' }}>{tk.status}</span>
                        {tk.priority && <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: 4, background: PRIO_COLORS[tk.priority], color: '#fff' }}>{tk.priority}</span>}
                        {tk.dueDate && <span style={{ fontSize: '10px', color: isOverdue ? t.colors.danger : t.colors.textMuted }}>{fmtDate(tk.dueDate)}</span>}
                        {blocked && <span style={{ fontSize: '10px', color: t.colors.warning, fontWeight: 600 }}>BLOCKED</span>}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          ))}
          {standalone.length > 0 && (
            <div style={{ marginTop: t.spacing.xs }}>
              <div style={{ fontSize: '11px', color: t.colors.textMuted, fontWeight: 600, marginBottom: 4 }}>Next Due (no dependencies):</div>
              <div style={{ display: 'flex', gap: t.spacing.xs, flexWrap: 'wrap' }}>
                {standalone.map(tk => (
                  <span key={tk.id} style={{ fontSize: '11px', padding: '3px 8px', background: t.colors.bg, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm }}>
                    {tk.title} — {fmtDate(tk.dueDate)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
