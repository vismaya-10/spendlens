import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (!form.name || !form.email || !form.password)
      return toast.error('All fields are required');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      console.log('Register response:', res.data);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        console.log('Token saved:', localStorage.getItem('token'));
        navigate('/');
      } else {
        toast.error('No token received from server');
      }
    } catch (err) {
      console.error('Register error:', err);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 16, border: '1px solid #e5e7eb', width: 360 }}>
        <h2 style={{ marginBottom: 8, fontWeight: 600 }}>Create account</h2>
        <p style={{ color: '#9ca3af', marginBottom: 28, fontSize: 14 }}>Start tracking your spending</p>
        <input placeholder="Name" type="text" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
        <button onClick={submit} disabled={loading} style={btnStyle}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 }}>
          Already have an account? <Link to="/login" style={{ color: '#6366f1' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { display: 'block', width: '100%', marginBottom: 14, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', outline: 'none' };
const btnStyle = { width: '100%', padding: '11px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 15, cursor: 'pointer' };