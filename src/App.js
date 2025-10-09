import { useMemo, useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const addTask = () => {
    const text = newTask.trim();
    if (!text) return;
    const task = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    setTasks((prev) => [task, ...prev]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = (id) => {
    const text = editingText.trim();
    if (!text) return; // do not allow empty text
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text, updatedAt: new Date().toISOString() } : t)));
    setEditingId(null);
    setEditingText('');
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [tasks]);

  const onKeyDownNew = (e) => {
    if (e.key === 'Enter') addTask();
  };

  const onKeyDownEdit = (e, id) => {
    if (e.key === 'Enter') saveEdit(id);
    if (e.key === 'Escape') cancelEdit();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={{ margin: 0 }}>Task Manager</h1>
        <p style={{ marginTop: 8, color: '#666' }}>Add, edit, complete, delete, and filter your tasks.</p>

        <div style={styles.row}>
          <input
            aria-label="New task"
            placeholder="What needs to be done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={onKeyDownNew}
            style={styles.input}
          />
          <button onClick={addTask} style={styles.primaryBtn} disabled={!newTask.trim()}>
            Add
          </button>
        </div>

        <div style={{ ...styles.row, marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
          <FilterButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterButton label="Active" active={filter === 'active'} onClick={() => setFilter('active')} />
          <FilterButton label="Completed" active={filter === 'completed'} onClick={() => setFilter('completed')} />
          <div style={{ flex: 1 }} />
          <span style={{ color: '#555' }}>
            Total: {counts.total} · Active: {counts.active} · Completed: {counts.completed}
          </span>
          <button onClick={clearCompleted} style={styles.secondaryBtn} disabled={counts.completed === 0}>
            Clear completed
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div style={styles.empty}>
            {tasks.length === 0 && <p>No tasks yet. Add your first task above.</p>}
            {tasks.length > 0 && filter === 'active' && <p>You are all caught up! No active tasks.</p>}
            {tasks.length > 0 && filter === 'completed' && <p>No tasks have been completed yet.</p>}
            {tasks.length > 0 && filter === 'all' && <p>No tasks match the current criteria.</p>}
          </div>
        ) : (
          <ul style={styles.list}>
            {filteredTasks.map((t) => (
              <li key={t.id} style={styles.listItem}>
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTask(t.id)}
                  aria-label={t.completed ? 'Mark as pending' : 'Mark as completed'}
                />

                {editingId === t.id ? (
                  <input
                    style={{ ...styles.input, flex: 1, margin: '0 8px' }}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => onKeyDownEdit(e, t.id)}
                    autoFocus
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, margin: '0 8px' }}>
                    <span
                      style={{
                        textDecoration: t.completed ? 'line-through' : 'none',
                        color: t.completed ? '#888' : '#222',
                      }}
                    >
                      {t.text}
                    </span>
                    <StatusBadge completed={t.completed} />
                  </div>
                )}

                {editingId === t.id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.primaryBtn} onClick={() => saveEdit(t.id)} disabled={!editingText.trim()}>
                      Save
                    </button>
                    <button style={styles.secondaryBtn} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.secondaryBtn} onClick={() => startEdit(t)} disabled={t.completed}>
                      Edit
                    </button>
                    <button style={styles.dangerBtn} onClick={() => deleteTask(t.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <footer style={{ marginTop: 16, color: '#888', fontSize: 12 }}>
          Tip: Press Enter to quickly add or save.
        </footer>
      </div>
    </div>
  );
}

function StatusBadge({ completed }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: '2px 6px',
        borderRadius: 999,
        background: completed ? '#e6ffed' : '#fff6e6',
        border: `1px solid ${completed ? '#b7eb8f' : '#ffd591'}`,
        color: completed ? '#237804' : '#ad6800',
      }}
    >
      {completed ? 'Completed' : 'Pending'}
    </span>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.secondaryBtn,
        background: active ? '#e6f4ff' : '#f5f5f5',
        borderColor: active ? '#91caff' : '#d9d9d9',
        color: active ? '#0958d9' : '#333',
      }}
    >
      {label}
    </button>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 720,
    background: 'white',
    border: '1px solid #f0f0f0',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  row: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: 8,
    outline: 'none',
  },
  list: {
    margin: '16px 0 0 0',
    padding: 0,
    listStyle: 'none',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 8px',
    border: '1px solid #f0f0f0',
    borderRadius: 8,
    marginTop: 8,
    background: '#fff',
  },
  primaryBtn: {
    padding: '10px 14px',
    background: '#1677ff',
    color: 'white',
    border: '1px solid #1677ff',
    borderRadius: 8,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '8px 12px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #d9d9d9',
    borderRadius: 8,
    cursor: 'pointer',
  },
  dangerBtn: {
    padding: '8px 12px',
    background: '#fff1f0',
    color: '#a8071a',
    border: '1px solid #ffa39e',
    borderRadius: 8,
    cursor: 'pointer',
  },
  empty: {
    marginTop: 24,
    padding: 24,
    textAlign: 'center',
    color: '#666',
    background: '#fafafa',
    border: '1px dashed #d9d9d9',
    borderRadius: 8,
  },
};

export default App;
