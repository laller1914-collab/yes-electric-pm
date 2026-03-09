import React, { useState } from 'react';
import { theme as t } from '../../theme.js';
import { Modal, Input, Select, Btn } from '../../shared/Components.jsx';
import { PROJECT_TYPES, DEFAULT_COLUMNS } from './projectTemplates.js';

export default function NewProjectModal({ open, onClose, onSave }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('General');

  const save = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, columns: DEFAULT_COLUMNS, status: 'active' });
    setName(''); setType('General'); onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project" width="400px">
      <Input label="Project Name" value={name} onChange={setName} required />
      <Select label="Type" value={type} onChange={setType} options={PROJECT_TYPES} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: t.spacing.sm, marginTop: t.spacing.md }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={!name.trim()}>Create</Btn>
      </div>
    </Modal>
  );
}
