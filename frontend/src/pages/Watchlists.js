import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const btn = (v = 'primary') => ({
  background: v === 'primary' ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : 'none',
  color: v === 'primary' ? '#000' : v === 'danger' ? '#e55' : '#aaa',
  border: v === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  transition: 'all 0.2s',
});

export default function Watchlists() {
  const navigate = useNavigate();
  const [lists, setLists]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [contents, setContents] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading]   = useState(true);

  const loadLists = useCallback(async () => {
    const { data } = await api.get('/watchlists').catch(() => ({ data: [] }));
    setLists(data);
  }, []);

  useEffect(() => { loadLists().finally(() => setLoading(false)); }, [loadLists]);

  const selectList = async (wl) => {
    setSelected(wl);
    const { data } = await api.get(`/watchlists/${wl.watchListID}/contents`).catch(() => ({ data: [] }));
    setContents(data);
  };

  const create = async () => {
    if (!newTitle.trim()) return;
    await api.post('/watchlists', { title: newTitle, visibility });
    setNewTitle(''); setVisibility('public'); setCreating(false);
    loadLists();
  };

  const deleteList = async () => {
    if (!selected) return;
    if (!window.confirm('Are you sure you want to delete this watchlist? This action cannot be undone.')) return;
    await api.delete(`/watchlists/${selected.watchListID}`).catch(() => { });
    setSelected(null); setContents([]); loadLists();
  };

  const removeContent = async (cid) => {
    await api.delete(`/watchlists/${selected.watchListID}/contents/${cid}`).catch(() => { });
    setContents(cs => cs.filter(c => c.contentID !== cid));
    loadLists();
  };

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  return (
    <div style={{ padding: 36, maxWidth: 1020, animation: 'fadeInUp 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>Watchlists</h1>
        <button style={btn()} onClick={() => setCreating(true)}>+ New Watchlist</button>
      </div>

      {creating && (
        <div style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, marginBottom: 24, animation: 'scaleIn 0.2s ease' }}>
          <div style={{ fontWeight: 800, color: '#c9a227', marginBottom: 16 }}>Create Watchlist</div>
          <input placeholder="Watchlist title" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ marginBottom: 12 }} />
          <select value={visibility} onChange={e => setVisibility(e.target.value)} style={{ marginBottom: 16 }}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btn()} onClick={create}>Create</button>
            <button style={btn('ghost')} onClick={() => { setCreating(false); setNewTitle(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24 }}>
        {/* List panel */}
        <div style={{ width: 250, flexShrink: 0 }}>
          {lists.length === 0 && (
            <div style={{ color: '#555', fontSize: 13, padding: '20px 0' }}>No watchlists yet.</div>
          )}
          {lists.map((wl, i) => (
            <div
              key={wl.watchListID}
              className="animate-fade-in"
              style={{
                background: selected?.watchListID === wl.watchListID ? 'rgba(201,162,39,0.08)' : '#0f0f1a',
                border: `1px solid ${selected?.watchListID === wl.watchListID ? 'rgba(201,162,39,0.35)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 10, padding: '12px 16px', marginBottom: 8, cursor: 'pointer',
                transition: 'all 0.2s', animationDelay: `${i * 0.04}s`,
              }}
              onMouseEnter={e => { if (selected?.watchListID !== wl.watchListID) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { if (selected?.watchListID !== wl.watchListID) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              onClick={() => selectList(wl)}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{wl.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#555', fontSize: 11 }}>{wl.contentCount} items</span>
                <span style={{ color: '#444', fontSize: 11 }}>{wl.visibility}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Contents panel */}
        {selected ? (
          <div style={{ flex: 1, animation: 'slideInRight 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{selected.title}</div>
                <div style={{ color: '#555', fontSize: 12 }}>{selected.visibility} · {contents.length} items</div>
              </div>
              <button style={btn('danger')} onClick={deleteList}>Delete List</button>
            </div>

            {contents.length === 0 ? (
              <div style={{ color: '#555', padding: '40px 0' }}>
                This watchlist is empty. Add content from the content detail page.
              </div>
            ) : (
              <div className="stagger-children">
                {contents.map((c, i) => (
                  <div
                    key={c.contentID}
                    className="card-hover animate-fade-in"
                    style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: `${i * 0.04}s` }}
                  >
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/content/${c.contentID}`)}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ color: '#555', fontSize: 11 }}>{c.contentType} · {c.genre} · {c.date?.slice(0, 4)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ color: '#c9a227', fontWeight: 700 }}>★ {c.globalScore != null ? Number(c.globalScore).toFixed(1) : '—'}</span>
                      <button
                        style={{ background: 'none', border: 'none', color: '#555', fontSize: 16, lineHeight: 1, padding: '0 4px', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#e55'}
                        onMouseLeave={e => e.currentTarget.style.color = '#555'}
                        onClick={() => removeContent(c.contentID)}
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : lists.length > 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 14 }}>
            Select a watchlist to see its contents
          </div>
        )}
      </div>
    </div>
  );
}
