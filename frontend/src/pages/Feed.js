import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Feed() {
  const navigate  = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      const { data } = await api.get('/feed');
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { loadFeed(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await api.post('/feed/refresh').catch(() => { });
    setLoading(true);
    await loadFeed();
    setRefreshing(false);
  };

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  return (
    <div style={{ padding: 36, maxWidth: 900, animation: 'fadeInUp 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>My Feed</h1>
          <div style={{ color: '#555', fontSize: 13 }}>Personalised short content based on your watch history</div>
        </div>
        <button
          style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}
          onClick={handleRefresh} disabled={refreshing}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.1)'; }}
        >
          {refreshing ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Refreshing…</> : '↻ Refresh Feed'}
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
          <div style={{ color: '#555', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
            Your feed is empty. Watch some content to get personalised recommendations.
          </div>
          <button
            style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a)', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, color: '#000' }}
            onClick={handleRefresh} disabled={refreshing}
          >
            {refreshing ? 'Generating…' : 'Generate Feed'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }} className="stagger-children">
          {items.map((item, i) => (
            <div
              key={i}
              className="card-hover animate-fade-in"
              style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, cursor: 'pointer', animationDelay: `${Math.min(i, 11) * 0.04}s` }}
              onClick={() => navigate(`/content/${item.contentID}`)}
            >
              <div style={{ fontSize: 10, color: '#c9a227', fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
                SHORT · {item.genre?.toUpperCase() || '—'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, lineHeight: 1.4 }}>{item.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#c9a227', fontWeight: 700, fontSize: 13 }}>
                  ★ {item.globalScore != null ? Number(item.globalScore).toFixed(1) : '—'}
                </span>
                {item.mainCategory && (
                  <span style={{ color: '#444', fontSize: 11, background: '#1a1a2a', padding: '3px 8px', borderRadius: 10 }}>
                    {item.mainCategory}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
