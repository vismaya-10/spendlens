import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

const CATEGORIES = ['food', 'transport', 'rent', 'shopping', 'health', 'entertainment', 'utilities', 'other'];
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [form, setForm] = useState({ category: 'food', limit: '' });

  const load = async () => {
    const res = await api.get(`/budgets?month=${month}`);
    setBudgets(res.data);
  };

  useEffect(() => { load(); }, [month]);

  const save = async () => {
    if (!form.limit) return toast.error('Enter a limit');
    await api.post('/budgets', { ...form, limit: parseFloat(form.limit), month });
    toast.success('Budget saved');
    setForm({ category: 'food', limit: '' });
    load();
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600 }}>Budgets</h2>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }} />
      </div>

      {/* Set budget */}
      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 28, display: 'flex', gap: 12 }}>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Monthly limit (₹)" type="number" value={form.limit}
          onChange={e => setForm({ ...form, limit: e.target.value })}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }} />
        <button onClick={save}
          style={{ padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
          Set budget
        </button>
      </div>

      {/* Budget progress bars */}
      {budgets.length === 0 ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No budgets set for this month</p> :
        budgets.map((b, i) => (
          <div key={i} style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{b.category}</div>
              <div style={{ fontSize: 13, color: b.percent > 100 ? '#ef4444' : '#6b7280' }}>
                ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()} ({b.percent}%)
              </div>
            </div>
            <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4 }}>
              <div style={{
                height: 8,
                width: `${Math.min(b.percent, 100)}%`,
                background: b.percent > 100 ? '#ef4444' : b.percent > 80 ? '#f59e0b' : '#6366f1',
                borderRadius: 4,
                transition: 'width 0.3s'
              }} />
            </div>
            {b.percent > 100 && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>Over budget by ₹{(b.spent - b.limit).toLocaleString()}</p>}
          </div>
        ))
      }
    </div>
  );
}