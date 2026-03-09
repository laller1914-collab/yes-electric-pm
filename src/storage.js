// localStorage CRUD — replaces Firestore for standalone app

function getStore(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function queryItems(collection, filters = [], sortField = 'createdAt', sortDir = 'asc') {
  let items = getStore(collection);
  for (const [field, op, value] of filters) {
    if (op === '==') items = items.filter(i => i[field] === value);
  }
  items.sort((a, b) => {
    const av = a[sortField] || '', bv = b[sortField] || '';
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
  return items;
}

export function addItem(collection, data) {
  const items = getStore(collection);
  const item = { ...data, id: genId(), createdAt: new Date().toISOString() };
  items.push(item);
  setStore(collection, items);
  return item.id;
}

export function patchItem(collection, id, updates) {
  const items = getStore(collection);
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) { items[idx] = { ...items[idx], ...updates }; setStore(collection, items); }
}

export function removeItem(collection, id) {
  const items = getStore(collection).filter(i => i.id !== id);
  setStore(collection, items);
}

export function exportAll() {
  const data = {
    projects: getStore('projects'),
    tasks: getStore('tasks'),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `pm-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); URL.revokeObjectURL(url);
}

export function importAll(jsonStr) {
  const data = JSON.parse(jsonStr);
  if (data.projects) setStore('projects', data.projects);
  if (data.tasks) setStore('tasks', data.tasks);
  return { projects: (data.projects || []).length, tasks: (data.tasks || []).length };
}
