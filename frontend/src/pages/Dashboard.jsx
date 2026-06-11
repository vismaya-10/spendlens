import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import api from '../api';

const COLORS = { food: '#6366f1', transport: '#06b6d4', rent: '#f59e0b', shopping: '#ec4899', health: '#10b981', entertainment: '#f97316', utilities: '#8b5cf6', other: '#94a3b8' };

const currentMonth = () => new Date().toISOString().slice(0, 7);

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export default function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trend, setTrend] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [s, a] = await Promise.all([
          api.get(`/transactions/summary?month=${month}`),
          api.get(`/anomalies?month=${month}`)
        ]);
        const summaryData = s.data.map(d => ({ name: d._id, value: d.total, count: d.count }));
        setSummary(summaryData);
        setTotal(summaryData.reduce((acc, d) => acc + d.value, 0));
        setAlerts(a.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  useEffect(() => {
    const fetchTrend = async () => {
      const months = getLast6Months();
      const results = await Promise.all(
        months.map(m => api.get(`/transactions/summary?month=${m}`).then(r => ({
          month: m.slice(5) + '/' + m.slice(2, 4),
          total: r.data.reduce((sum, d) => sum + d.total, 0)
        })).catch(() => ({ month: m.slice(5) + '/' + m.slice(2, 4), total: 0 })))
      );
      setTrend(results);
    };
    fetchTrend();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ fontWeight: 600, color: 'var(--text)' }}>Dashboard</h2>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--card)', color: 'var(--text)' }} />
      </div>

      {/* Anomaly alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 12, fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>⚠️ Spending alerts</h3>
          {alerts.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', borderRadius: 10, marginBottom: 10,
              background: a.severity === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1px solid ${a.severity === 'high' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`,
            }}>
              <span style={{ fontSize: 20 }}>{a.severity === 'high' ? '🔴' : '🟡'}</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, color: a.severity === 'high' ? '#f87171' : '#fbbf24' }}>
                  {a.message}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                  This month: ₹{a.currentSpend.toLocaleString()} · Usual: ₹{a.avgSpend.toLocaleString()} · Z-score: {a.zScore}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text2)', padding: 40 }}>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Total card */}
          <div style={{ gridColumn: '1/-1', padding: 24, background: '#6366f1', borderRadius: 12, color: '#fff' }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Total spent this month</div>
            <div style={{ fontSize: 32, fontWeight: 600 }}>₹{total.toLocaleString()}</div>
          </div>

          {summary.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
              No transactions found for this month. Add some transactions first!
            </div>
          ) : (
            <>
              {/* Pie chart */}
              <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
                <h3 style={{ marginBottom: 16, fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>By category</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={summary} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                      {summary.map((entry, i) => <Cell key={i} fill={COLORS[entry.name] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart */}
              <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
                <h3 style={{ marginBottom: 16, fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>Spending breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={summary} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text2)' }} tickFormatter={v => `₹${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text2)' }} width={80} />
                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {summary.map((entry, i) => <Cell key={i} fill={COLORS[entry.name] || '#94a3b8'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* 6 month trend line chart */}
          <div style={{ gridColumn: '1/-1', padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
            <h3 style={{ marginBottom: 16, fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>6-month spending trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text2)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text2)' }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Total spent" />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
}