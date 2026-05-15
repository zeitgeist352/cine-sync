import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const roleColor = role => {
  const r = (role || '').toLowerCase();
  if (r.includes('director'))               return '#c9a227';
  if (r.includes('actor') || r.includes('actress')) return '#7c9de8';
  if (r.includes('producer'))               return '#9de87c';
  if (r.includes('writer'))                 return '#e87c9d';
  return '#888';
};

export default function People() {
  const [q, setQ]               = useState('');
  const [roleFilter, setRole]   = useState('All');
  const [roles, setRoles]       = useState([]);   // loaded from DB
  const [creators, setCreators] = useState([]);
  const [loading, setLoading]   = useState(true);
  const timer = useRef(null);
  const navigate = useNavigate();

  // Fetch distinct roles from DB
  useEffect(() => {
    api.get('/creators/roles').then(r => {
      setRoles(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {});
  }, []);

  const load = useCallback(async (search, role) => {
    setLoading(true);
    const params = {};
    if (search) params.q = search;
    if (role && role !== 'All') params.role = role;
    const { data } = await api.get('/creators', { params }).catch(() => ({ data: [] }));
    setCreators(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load('', 'All'); }, [load]);

  const handleSearch = val => {
    setQ(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(val, roleFilter), 280);
  };

  const handleRole = role => {
    setRole(role);
    clearTimeout(timer.current);
    load(q, role);
  };

  return (
    <div style={{ padding: 36, maxWidth: 1100, animation: 'fadeInUp 0.35s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>People</h1>
        <div style={{ color: '#555', fontSize: 13 }}>Browse and search actors, directors, and other creators</div>
      </div>

      {/* Search + filter row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 340px' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          <input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name…"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...roles].map(r => (
            <button
              key={r}
              onClick={() => handleRole(r)}
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: roleFilter === r ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : 'rgba(255,255,255,0.04)',
                color: roleFilter === r ? '#000' : '#777',
                border: roleFilter === r ? 'none' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
          <span className="spinner" /> Loading…
        </div>
      ) : creators.length === 0 ? (
        <div style={{ color: '#555', padding: '60px 0', textAlign: 'center' }}>
          No creators found{q ? ` for "${q}"` : ''}.
        </div>
      ) : (
        <>
          <div style={{ color: '#444', fontSize: 12, marginBottom: 18 }}>{creators.length} creator{creators.length !== 1 ? 's' : ''} found</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {creators.map((c, i) => (
              <div
                key={c.creatorID}
                className="card-hover animate-fade-in"
                onClick={() => navigate(`/creators/${c.creatorID}`)}
                style={{
                  background: '#0f0f1a',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '20px 18px',
                  cursor: 'pointer', animationDelay: `${i * 0.025}s`,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#1e1e30,#2a2a3a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 14,
                  border: '2px solid rgba(255,255,255,0.06)',
                }}>
                  {(c.role || '').toLowerCase().includes('director') ? '🎬' : '🎭'}
                </div>

                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4, color: '#ddd', lineHeight: 1.3 }}>{c.name}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: roleColor(c.role), marginBottom: 10 }}>{c.role}</div>

                {c.nationality && (
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>
                    <span style={{ marginRight: 4 }}>🌍</span>{c.nationality}
                  </div>
                )}
                {c.numOfFollowers > 0 && (
                  <div style={{ fontSize: 11, color: '#444' }}>
                    <span style={{ marginRight: 4 }}>👥</span>{c.numOfFollowers.toLocaleString()} followers
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
