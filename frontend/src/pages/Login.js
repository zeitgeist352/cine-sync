import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('signin');
  const [form, setForm] = useState({ username: '', password: '', email: '', name: '', lastName: '', dateOfBirth: '', role: 'standard' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSignIn = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username: form.username.trim(), password: form.password });
      login(data.token, data.user);
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: form.username.trim(), email: form.email.trim(),
        password: form.password, name: form.name.trim(),
        lastName: form.lastName.trim(), age: calculateAge(form.dateOfBirth), role: form.role,
      });
      login(data.token, data.user);
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const field = (label, children) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: '#555', letterSpacing: 1.5, marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: '#080810',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(15,15,26,0.95)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '40px 44px', width: 400, maxWidth: '90vw',
        backdropFilter: 'blur(20px)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ color: '#c9a227', fontWeight: 900, fontSize: 26, letterSpacing: 3, textShadow: '0 0 24px rgba(201,162,39,0.4)' }}>
            CINÉLOG
          </div>
          <div style={{ color: '#444', fontSize: 10, letterSpacing: 2, marginTop: 4 }}>
            ENTERTAINMENT DISCOVERY PLATFORM
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28 }}>
          {['signin', 'register'].map(t => (
            <button
              key={t}
              style={{
                flex: 1, padding: '9px 0', background: 'none', border: 'none',
                color: tab === t ? '#c9a227' : '#555',
                borderBottom: tab === t ? '2px solid #c9a227' : '2px solid transparent',
                fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'color 0.2s',
              }}
              onClick={() => { setTab(t); setError(''); }}
            >
              {t === 'signin' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn}>
            {field('USERNAME', <input value={form.username} onChange={set('username')} placeholder="your_username" required />)}
            {field('PASSWORD', <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />)}
            {error && <div style={{ color: '#e55', fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px 0', background: 'linear-gradient(135deg,#c9a227,#e8c84a)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 14, marginTop: 4, cursor: 'pointer', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
              <div style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginBottom: 10, textAlign: 'center' }}>DEMO ACCOUNTS</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => { setForm(f => ({ ...f, username: 'aral_m', password: 'password123' })); setError(''); }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#777', fontSize: 11, padding: '7px 0', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,162,39,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  Standard user
                </button>
                <button type="button" onClick={() => { setForm(f => ({ ...f, username: 'arthur_v', password: 'password123' })); setError(''); }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#777', fontSize: 11, padding: '7px 0', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,162,39,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  Critic user
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
              <div>
                {field('FIRST NAME', <input value={form.name} onChange={set('name')} placeholder="Ada" required />)}
              </div>
              <div>
                {field('LAST NAME', <input value={form.lastName} onChange={set('lastName')} placeholder="Lovelace" required />)}
              </div>
            </div>
            {field('BIRTH DATE', <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />)}
            {field('USERNAME', <input value={form.username} onChange={set('username')} placeholder="ada_lovelace" required />)}
            {field('EMAIL', <input type="email" value={form.email} onChange={set('email')} placeholder="ada@mail.com" required />)}
            {field('PASSWORD', <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />)}
            {field('ROLE', (
              <select value={form.role} onChange={set('role')}>
                <option value="standard">General Viewer</option>
                <option value="critic">Verified Critic</option>
              </select>
            ))}
            {error && <div style={{ color: '#e55', fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px 0', background: 'linear-gradient(135deg,#c9a227,#e8c84a)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
