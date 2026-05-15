import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function WatchHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/watch/history')
      .then(r => setHistory(Array.isArray(r.data) ? r.data : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  return (
    <div style={{ padding: 36, maxWidth: 900, animation: 'fadeInUp 0.35s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Watch History</h1>
        <div style={{ color: '#555', fontSize: 13 }}>{history.length} items watched</div>
      </div>

      {history.length === 0 ? (
        <div style={{ color: '#555', textAlign: 'center', padding: '60px 0' }}>
          No watch history yet. Start watching something!
        </div>
      ) : (
        <div className="stagger-children">
          {history.map((h, i) => (
            <div
              key={i}
              className="card-hover animate-fade-in"
              style={{
                background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
                padding: '18px 22px', marginBottom: 10, cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                animationDelay: `${Math.min(i, 9) * 0.04}s`,
              }}
              onClick={() => navigate(`/content/${h.contentID}`)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{h.title}</div>
                <div style={{ color: '#555', fontSize: 12, marginBottom: h.comment ? 6 : 0 }}>
                  {h.genre} · {h.timestamp?.slice(0, 16)}
                </div>
                {h.comment && (
                  <div style={{ color: '#777', fontSize: 12, fontStyle: 'italic' }}>"{h.comment}"</div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 100 }}>
                {h.rating != null && (
                  <span style={{ color: '#c9a227', fontWeight: 700, fontSize: 14 }}>★ {h.rating}/10</span>
                )}
                <div style={{ background: '#1a1a2a', borderRadius: 4, height: 4, width: 80, overflow: 'hidden' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ background: 'linear-gradient(90deg,#c9a227,#e8c84a)', height: '100%', width: `${h.percentage || 0}%`, borderRadius: 4 }}
                  />
                </div>
                <span style={{ color: '#555', fontSize: 11 }}>{h.percentage || 0}% watched</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
