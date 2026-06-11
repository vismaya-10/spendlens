import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 16, border: '1px solid #e5e7eb', width: 360 }}>
        <h2 style={{ marginBottom: 8, fontWeight: 600 }}>Welcome back</h2>
        <p style={{ color: '#9ca3af', marginBottom: 28, fontSize: 14 }}>Sign in to SpendLens</p>
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          style={inputStyle} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={inputStyle} />
        <button onClick={submit} disabled={loading} style={btnStyle}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 }}>
          No account? <Link to="/register" style={{ color: '#6366f1' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { display: 'block', width: '100%', marginBottom: 14, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', outline: 'none' };
const btnStyle = { width: '100%', padding: '11px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 15, cursor: 'pointer' };