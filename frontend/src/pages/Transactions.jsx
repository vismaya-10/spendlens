import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

const CATEGORIES = ['food', 'transport', 'rent', 'shopping', 'health', 'entertainment', 'utilities', 'other'];
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [form, setForm] = useState({ title: '', amount: '', category: 'other', date: '', note: '' });
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    const res = await api.get(`/transactions?month=${month}`);
    setTxns(res.data);
  };

  useEffect(() => { load(); }, [month]);

  const add = async () => {
    if (!form.title || !form.amount) return toast.error('Title and amount are required');
    setLoading(true);
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      setForm({ title: '', amount: '', category: 'other', date: '', note: '' });
      toast.success('Transaction added');
      load();
    } catch { toast.error('Failed to add'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    await api.delete(`/transactions/${id}`);
    toast.success('Deleted');
    load();
  };

  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/transactions/import', fd);
    toast.success(`Imported ${res.data.imported} transactions`);
    load();
  };

  const exportCSV = () => {
    const headers = ['title', 'amount', 'category', 'date', 'note'];
    const rows = txns.map(t => [
      t.title,
      t.amount,
      t.category,
      new Date(t.date).toISOString().slice(0, 10),
      t.note || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600 }}>Transactions</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }} />
          <button onClick={() => fileRef.current.click()}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 13 }}>
            Import CSV
          </button>
          <button onClick={exportCSV}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 13 }}>
            Export CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importCSV} />
        </div>
      </div>

      <div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 24, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12 }}>
        <input placeholder="Title (e.g. Zomato order)" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} style={inp} />
        <input placeholder="Amount (₹)" type="number" value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })} style={inp} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} />
        <input placeholder="Note (optional)" value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })} style={{ ...inp, gridColumn: '1/4' }} />
        <button onClick={add} disabled={loading}
          style={{ padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
        CSV format: title, amount, category, date (YYYY-MM-DD), note
      </p>

      <div>
        {txns.length === 0 ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No transactions this month</p> :
          txns.map(t => (
            <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', fontSize: 12 }}>{t.category}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(t.date).toLocaleDateString('en-IN')} {t.note && `· ${t.note}`}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontWeight: 600, color: '#6366f1' }}>₹{t.amount.toLocaleString()}</span>
                <button onClick={() => remove(t._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

const inp = { padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' };