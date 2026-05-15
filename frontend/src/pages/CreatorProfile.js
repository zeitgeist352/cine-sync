import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const fmt = v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n.toFixed(1) : '—'; };

const roleColor = role => {
  const r = (role || '').toLowerCase();
  if (r.includes('director'))                        return '#c9a227';
  if (r.includes('actor') || r.includes('actress'))  return '#7c9de8';
  if (r.includes('producer'))                        return '#9de87c';
  if (r.includes('writer'))                          return '#e87c9d';
  return '#aaa';
};

export default function CreatorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creator, setCreator]   = useState(null);
  const [content, setContent]   = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const cid = parseInt(id);
    if (isNaN(cid)) { setError('Invalid creator.'); setLoading(false); return; }

    Promise.all([
      api.get(`/creators/${cid}`),
      api.get(`/creators/${cid}/content`).catch(() => ({ data: [] })),
    ]).then(([cr, co]) => {
      setCreator(cr.data);
      setContent(Array.isArray(co.data) ? co.data : []);
    }).catch(() => setError('Creator not found.')).finally(() => setLoading(false));

    if (user) {
      api.get('/social/creators').catch(() => ({ data: [] })).then(r => {
        const list = Array.isArray(r.data) ? r.data : [];
        setFollowing(list.some(c => c.creatorID === cid));
      });
    }
  }, [id, user]);

  const toggleFollow = async () => {
    const was = following;
    setFollowing(!was);
    setCreator(c => c ? { ...c, numOfFollowers: Math.max(0, (c.numOfFollowers || 0) + (was ? -1 : 1)) } : c);
    const url = `/social/creators/${id}/follow`;
    await (was ? api.delete(url) : api.post(url)).catch(() => {
      setFollowing(was);
      setCreator(c => c ? { ...c, numOfFollowers: Math.max(0, (c.numOfFollowers || 0) + (was ? 1 : -1)) } : c);
    });
  };

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  if (error || !creator) return (
    <div style={{ padding: 40 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, marginBottom: 16 }}
      >
        ← Back
      </button>
      <div style={{ color: '#e55' }}>{error || 'Creator not found.'}</div>
    </div>
  );

  const isDirector = (creator.role || '').toLowerCase().includes('director');

  // Group content by type
  const byType = content.reduce((acc, c) => {
    const t = c.contentType || 'Other';
    if (!acc[t]) acc[t] = [];
    acc[t].push(c);
    return acc;
  }, {});

  return (
    <div style={{ padding: 40, maxWidth: 920, animation: 'fadeInUp 0.35s ease' }}>
      {/* Back */}
      <button
        style={{ color: '#555', fontSize: 12, marginBottom: 24, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#c9a227'}
        onMouseLeave={e => e.currentTarget.style.color = '#555'}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, marginBottom: 36, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg,#1a1a2a,#252535)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38, border: '3px solid rgba(255,255,255,0.07)',
          boxShadow: '0 0 32px rgba(0,0,0,0.5)', flexShrink: 0,
        }}>
          {isDirector ? '🎬' : '🎭'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: roleColor(creator.role), marginBottom: 6 }}>
            {(creator.role || '').toUpperCase()}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 14, lineHeight: 1.1 }}>{creator.name}</h1>

          <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#0f0f1a', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
            {[
              creator.nationality && { label: 'NATIONALITY', value: creator.nationality },
              creator.age        && { label: 'AGE',         value: creator.age },
              creator.gender     && { label: 'GENDER',      value: creator.gender },
              { label: 'CREDITS',    value: content.length, gold: true },
              { label: 'FOLLOWERS',  value: (creator.numOfFollowers || 0).toLocaleString() },
            ].filter(Boolean).map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '12px 22px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.gold ? '#c9a227' : '#ddd' }}>{s.value}</div>
                <div style={{ fontSize: 9, color: '#555', letterSpacing: 1.5, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {user && (
            <button
              onClick={toggleFollow}
              style={{
                background: following ? 'none' : 'linear-gradient(135deg,#c9a227,#e8c84a)',
                color: following ? '#aaa' : '#000',
                border: following ? '1px solid rgba(255,255,255,0.1)' : 'none',
                borderRadius: 8, padding: '9px 24px', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {following ? '✓ Following' : '+ Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Filmography */}
      {content.length === 0 ? (
        <div style={{ color: '#555' }}>No filmography found.</div>
      ) : (
        Object.entries(byType).map(([type, items]) => (
          <div key={type} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 16 }}>
              {type.toUpperCase()} ({items.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {items.map((c, i) => (
                <div
                  key={c.contentID}
                  className="card-hover animate-fade-in"
                  onClick={() => navigate(`/content/${c.contentID}`)}
                  style={{
                    background: '#0f0f1a',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10, padding: '14px 16px',
                    cursor: 'pointer', animationDelay: `${i * 0.03}s`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </div>
                    <div style={{ color: '#555', fontSize: 11 }}>
                      {c.genre}{c.date ? ` · ${c.date.slice(0, 4)}` : ''}
                    </div>
                  </div>
                  {c.globalScore > 0 && (
                    <span style={{ color: '#c9a227', fontWeight: 800, fontSize: 13, flexShrink: 0, marginLeft: 12 }}>
                      ★ {fmt(c.globalScore)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
