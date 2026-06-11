import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const name = JSON.parse(localStorage.getItem('user') || '{}').name;
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 32px', height: 60,
      borderBottom: '1px solid var(--border)',
      background: 'var(--card)'
    }}>
      <span style={{ fontWeight: 600, fontSize: 18, color: '#6366f1' }}>SpendLens</span>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: 14 }}>Dashboard</Link>
        <Link to="/transactions" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: 14 }}>Transactions</Link>
        <Link to="/budgets" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: 14 }}>Budgets</Link>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{name}</span>

        {/* Dark/Light toggle */}
        <button onClick={() => setDark(!dark)} style={{
          padding: '6px 14px', borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--bg2)',
          color: 'var(--text)',
          cursor: 'pointer', fontSize: 14
        }}>
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>

        <button onClick={logout} style={{
          padding: '6px 14px', borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--bg2)',
          color: 'var(--text)',
          cursor: 'pointer', fontSize: 13
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}