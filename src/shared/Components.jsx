import React from 'react';
import { theme as t } from '../theme.js';

export function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, style = {} }) {
  const base = { border: 'none', borderRadius: t.radius.sm, cursor: disabled ? 'default' : 'pointer',
    fontWeight: 600, fontFamily: t.fonts.body, opacity: disabled ? 0.5 : 1, ...style };
  const sizes = { sm: { padding: '4px 10px', fontSize: '12px' }, md: { padding: '8px 16px', fontSize: '14px' } };
  const variants = {
    primary: { background: t.colors.navy, color: '#fff' },
    outline: { background: 'transparent', color: t.colors.navy, border: `1px solid ${t.colors.navy}` },
    danger: { background: t.colors.danger, color: '#fff' },
    ghost: { background: 'transparent', color: t.colors.textSecondary },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant] }}>{children}</button>;
}

export function Badge({ children, color }) {
  return <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 10, background: color || t.colors.info, color: '#fff', fontWeight: 600 }}>{children}</span>;
}

export function Modal({ open, onClose, title, children, width = '500px' }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.colors.surface, borderRadius: t.radius.lg, padding: t.spacing.lg, width, maxWidth: '95vw', maxHeight: '85vh', overflow: 'auto', boxShadow: t.shadows.md }}>
        <h3 style={{ margin: `0 0 ${t.spacing.md}`, fontFamily: t.fonts.heading, color: t.colors.navy }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, required, style = {} }) {
  return (
    <div style={{ marginBottom: t.spacing.sm }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary, display: 'block', marginBottom: 4 }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '8px 10px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '13px', fontFamily: t.fonts.body, boxSizing: 'border-box', ...style }} />
    </div>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <div style={{ marginBottom: t.spacing.sm }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary, display: 'block', marginBottom: 4 }}>{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 10px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '13px', fontFamily: t.fonts.body, boxSizing: 'border-box', resize: 'vertical' }} />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: t.spacing.sm }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary, display: 'block', marginBottom: 4 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: '13px', fontFamily: t.fonts.body }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
