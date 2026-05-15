import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const TYPES = ['Movie', 'Series', 'LiveStream', 'ShortContent'];
const EMOJIS = { Movie: '🎬', Series: '📺', LiveStream: '📡', ShortContent: '🎞️' };
const TYPE_COLORS = { Movie: '#c9a227', Series: '#4a9eff', LiveStream: '#e05c5c', ShortContent: '#7bc67e' };

const fmtYear  = (d) => { if (!d) return '—'; const s = String(d); return s.length >= 4 ? s.slice(0, 4) : '—'; };
const fmtScore = (v) => { if (v == null || v === '') return 'N/A'; const n = Number(v); return Number.isFinite(n) ? n.toFixed(1) : 'N/A'; };

export default function Browse() {
  const [items, setItems]   = useState([]);
  const [genres, setGenres] = useState([]);
  const [q, setQ]           = useState('');
  const [genre, setGenre]   = useState('');
  const [type, setType]     = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const navigate = useNavigate();

  // Fetch available genres from DB on mount
  useEffect(() => {
    api.get('/genres').then(r => setGenres(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [genre, type]);

  const load = async (search = '') => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (genre)  params.genre = genre;
      if (type)   params.type  = type;
      if (search) params.q     = search;
      const { data } = await api.get('/content', { params });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setItems([]); setError(err.response?.data?.error || 'Failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  const featured = items.length > 0 ? items[0] : null;

  return (
    <div style={{ padding: 36, color: '#e0e0e0', animation: 'fadeInUp 0.35s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 4, letterSpacing: -0.5 }}>Browse & Discover</h1>
        <div style={{ color: '#555', fontSize: 13 }}>Movies, series, livestreams, and short content</div>
      </div>

      {/* Featured */}
      {featured && (
        <div
          onClick={() => navigate(`/content/${featured.contentID}`)}
          style={{
            background: 'linear-gradient(135deg, #12121f 0%, #0d0d1a 50%, #0a0a14 100%)',
            border: '1px solid rgba(201,162,39,0.2)',
            borderRadius: 16, padding: '32px 36px', marginBottom: 32, cursor: 'pointer',
            position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 11, color: '#c9a227', fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>
            ✦ TOP RATED
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10, letterSpacing: -0.5 }}>
            {featured.title || 'Untitled'}
          </h2>
          <div style={{ color: '#777', fontSize: 13, marginBottom: 20 }}>
            {featured.contentType} · {fmtYear(featured.date)} · {featured.language || '—'} ·{' '}
            <span style={{ color: '#c9a227', fontWeight: 700 }}>★ {fmtScore(featured.globalScore)}</span>
          </div>
          <button style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a)', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, color: '#000', fontSize: 13, boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
            View Details
          </button>
        </div>
      )}

      {/* Search + Type filter */}
      <form
        onSubmit={e => { e.preventDefault(); load(q); }}
        style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}
      >
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search content by title…"
          style={{ flex: 1, minWidth: 220, maxWidth: 420 }}
        />
        <select value={type} onChange={e => setType(e.target.value)} style={{ width: 160 }}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          type="submit"
          style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a)', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, color: '#000', whiteSpace: 'nowrap' }}
        >
          Search
        </button>
      </form>

      {/* Genre chips — loaded from DB */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {['All', ...genres].map(g => {
          const active = g === 'All' ? !genre : genre === g;
          return (
            <span
              key={g}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: active ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : 'transparent',
                color: active ? '#000' : '#777',
                border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                fontWeight: active ? 700 : 400,
                transition: 'all 0.2s',
              }}
              onClick={() => setGenre(g === 'All' ? '' : genre === g ? '' : g)}
            >
              {g}
            </span>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 12 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ color: '#e05c5c', textAlign: 'center', padding: 60 }}>{error}</div>
      ) : items.length === 0 ? (
        <div style={{ color: '#555', textAlign: 'center', padding: 60 }}>No content found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(162px,1fr))', gap: 16 }} className="stagger-children">
          {items.map((item, i) => (
            <div
              key={item.contentID}
              className="card-hover animate-fade-in"
              style={{
                background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
                overflow: 'hidden', cursor: 'pointer',
                animationDelay: `${Math.min(i, 11) * 0.04}s`,
              }}
              onClick={() => navigate(`/content/${item.contentID}`)}
            >
              {/* Thumbnail */}
              <div style={{
                height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${TYPE_COLORS[item.contentType] || '#c9a227'}18 0%, #0d0d1a 100%)`,
                fontSize: 44, position: 'relative',
              }}>
                {EMOJIS[item.contentType] || '🎬'}
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: TYPE_COLORS[item.contentType] || '#c9a227',
                  color: '#000', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, letterSpacing: 0.5,
                }}>
                  {String(item.contentType || 'CONTENT').toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5, color: '#eee', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.title || 'Untitled'}
                </div>
                <div style={{ color: '#666', fontSize: 11 }}>
                  {item.genre || '—'} · {fmtYear(item.date)}
                </div>
                <div style={{ color: '#c9a227', fontWeight: 700, fontSize: 12, marginTop: 4 }}>
                  ★ {fmtScore(item.globalScore)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
