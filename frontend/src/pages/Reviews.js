import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const btn = (v = 'primary') => ({
  background: v === 'primary' ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : 'none',
  color: v === 'primary' ? '#000' : v === 'danger' ? '#e55' : '#aaa',
  border: v === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  transition: 'all 0.2s',
});

const smallBtn = (v = 'ghost') => ({
  background: 'none',
  border: '1px solid rgba(255,255,255,0.1)',
  color: v === 'danger' ? '#e55' : '#aaa',
  borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer',
  transition: 'all 0.2s',
});

/** Debounced content-name search dropdown */
function ContentSearch({ onPick }) {
  const [q, setQ]           = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen]     = useState(false);
  const [picked, setPicked] = useState(null);
  const timer = useRef(null);

  const search = val => {
    setQ(val); setPicked(null); onPick(null);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      const { data } = await api.get('/content', { params: { q: val, limit: 8 } }).catch(() => ({ data: [] }));
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    }, 280);
  };

  const pick = item => {
    setPicked(item); setQ(item.title); setOpen(false); onPick(item.contentID);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={q}
        onChange={e => search(e.target.value)}
        placeholder="Search content by name…"
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{ borderColor: picked ? 'rgba(201,162,39,0.5)' : undefined }}
      />
      {picked && (
        <div style={{ fontSize: 10, color: '#4caf50', marginTop: 4 }}>
          ✓ {picked.contentType} · {picked.genre} · {picked.date?.slice(0, 4)}
        </div>
      )}
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#10101c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          {results.map(r => (
            <div
              key={r.contentID}
              onMouseDown={() => pick(r)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div>
              <div style={{ color: '#555', fontSize: 11 }}>{r.contentType} · {r.genre} · {r.date?.slice(0, 4)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Reviews() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm] = useState({ contentID: null, points: '', review: '' });
  const [error, setError]       = useState('');

  const isCritic = user?.role === 'critic';

  const load = useCallback(async () => {
    if (!isCritic) { setLoading(false); return; }
    const { data } = await api.get('/reviews').catch(() => ({ data: [] }));
    setReviews(data); setLoading(false);
  }, [isCritic]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setError('');
    if (!form.contentID) { setError('Please select a content item.'); return; }
    if (!form.points)    { setError('Score is required.'); return; }
    const pts = parseFloat(form.points);
    if (pts < 0 || pts > 10) { setError('Score must be 0–10.'); return; }
    await api.post('/reviews', { contentID: form.contentID, points: pts, review: form.review }).catch(() => {});
    setCreating(false); setForm({ contentID: null, points: '', review: '' }); load();
  };

  const update = async (rid) => {
    await api.put(`/reviews/${rid}`, { points: parseFloat(editing.points), review: editing.review }).catch(() => {});
    setEditing(null); load();
  };

  const del = async (rid) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    await api.delete(`/reviews/${rid}`).catch(() => {});
    load();
  };

  if (!isCritic) return (
    <div style={{ padding: 36, maxWidth: 900, animation: 'fadeInUp 0.35s ease' }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 24 }}>Official Reviews</h1>
      <div style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>📝</div>
        <div style={{ color: '#aaa', marginBottom: 8 }}>Only verified critics can submit official reviews.</div>
        <div style={{ color: '#555', fontSize: 13 }}>
          Your account type: <span style={{ color: '#c9a227', fontWeight: 700 }}>{user?.role || 'standard'}</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: '#444' }}>
          You can still rate and comment on content from any content detail page.
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  return (
    <div style={{ padding: 36, maxWidth: 900, animation: 'fadeInUp 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>My Reviews</h1>
          <div style={{ color: '#555', fontSize: 13 }}>Official critic reviews you've submitted</div>
        </div>
        <button style={btn()} onClick={() => { setCreating(true); setError(''); }}>+ New Review</button>
      </div>

      {creating && (
        <div style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, marginBottom: 24, animation: 'scaleIn 0.2s ease' }}>
          <div style={{ fontWeight: 800, color: '#c9a227', marginBottom: 16 }}>Submit Official Review</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>CONTENT</div>
            <ContentSearch onPick={cid => setForm(f => ({ ...f, contentID: cid }))} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>SCORE (0 – 10)</div>
            <input
              type="number" placeholder="e.g. 8.5" min="0" max="10" step="0.1"
              value={form.points}
              onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
              style={{ maxWidth: 160 }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>REVIEW TEXT</div>
            <textarea
              placeholder="Write your review…"
              rows={4}
              value={form.review}
              onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && <div style={{ color: '#e55', fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btn()} onClick={submit}>Submit</button>
            <button style={btn('ghost')} onClick={() => { setCreating(false); setError(''); setForm({ contentID: null, points: '', review: '' }); }}>Cancel</button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={{ color: '#555', textAlign: 'center', padding: '60px 0' }}>No reviews yet. Click "+ New Review" to submit one.</div>
      ) : (
        <div className="stagger-children">
          {reviews.map((r, i) => (
            <div
              key={r.reviewID}
              className="card-hover animate-fade-in"
              style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 22px', marginBottom: 10, animationDelay: `${i * 0.05}s` }}
            >
              {editing?.reviewID === r.reviewID ? (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>SCORE (0–10)</div>
                    <input
                      type="number" min="0" max="10" step="0.1"
                      value={editing.points}
                      onChange={e => setEditing(ed => ({ ...ed, points: e.target.value }))}
                      style={{ width: 120 }}
                    />
                  </div>
                  <textarea
                    rows={4} value={editing.review}
                    onChange={e => setEditing(ed => ({ ...ed, review: e.target.value }))}
                    style={{ resize: 'vertical', marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={btn()} onClick={() => update(r.reviewID)}>Save</button>
                    <button style={btn('ghost')} onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/content/${r.contentID}`)}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3, color: '#eee' }}>{r.title}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#c9a227', fontWeight: 900, fontSize: 22 }}>{r.points}/10</span>
                      <button style={smallBtn()} onClick={() => setEditing({ reviewID: r.reviewID, points: r.points, review: r.review || '' })}>Edit</button>
                      <button style={smallBtn('danger')} onClick={() => del(r.reviewID)}>Delete</button>
                    </div>
                  </div>
                  {r.review && <div style={{ color: '#888', fontSize: 13, lineHeight: 1.7 }}>{r.review}</div>}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
