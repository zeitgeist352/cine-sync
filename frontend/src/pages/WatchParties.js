import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const btn = (v = 'primary') => ({
  background: v === 'primary' ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : 'none',
  color: v === 'primary' ? '#000' : '#aaa',
  border: v === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  transition: 'all 0.2s',
});

export default function WatchParties() {
  const [parties, setParties]     = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const [clubs, setClubs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [form, setForm] = useState({ contentID: '', clubID: '', date: '', authorizedCinema: '', capacity: '' });
  const [formError, setFormError] = useState('');

  const setF = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const load = useCallback(async () => {
    const { data } = await api.get('/watchparties').catch(() => ({ data: [] }));
    setParties(data);
    const statuses = {};
    await Promise.all(data.map(async p => {
      const r = await api.get(`/watchparties/${p.partyID}/status`).catch(() => ({ data: { joined: false } }));
      statuses[p.partyID] = r.data.joined;
    }));
    setJoinStatus(statuses);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
    api.get('/clubs').then(r => setClubs(Array.isArray(r.data) ? r.data : [])).catch(() => { });
  }, [load]);

  const joinLeave = async (party) => {
    if (joinStatus[party.partyID]) {
      await api.delete(`/watchparties/${party.partyID}/leave`).catch(() => { });
      setJoinStatus(s => ({ ...s, [party.partyID]: false }));
    } else {
      const res = await api.post(`/watchparties/${party.partyID}/join`).catch(e => e.response);
      if (res?.data?.error) { return; }
      setJoinStatus(s => ({ ...s, [party.partyID]: true }));
    }
    load();
  };

  const createParty = async () => {
    setFormError('');
    if (!form.contentID || !form.clubID || !form.date || !form.authorizedCinema || !form.capacity) {
      setFormError('All fields are required.'); return;
    }
    await api.post('/watchparties', {
      contentID: parseInt(form.contentID), clubID: parseInt(form.clubID),
      date: form.date, authorizedCinema: form.authorizedCinema, capacity: parseInt(form.capacity),
    }).catch(() => { });
    setCreating(false);
    setForm({ contentID: '', clubID: '', date: '', authorizedCinema: '', capacity: '' });
    load();
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
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Watch Parties</h1>
          <div style={{ color: '#555', fontSize: 13 }}>Upcoming cinema events organised by clubs</div>
        </div>
        <button style={btn()} onClick={() => setCreating(true)}>+ Create Party</button>
      </div>

      {creating && (
        <div style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, marginBottom: 24, animation: 'scaleIn 0.2s ease' }}>
          <div style={{ fontWeight: 800, color: '#c9a227', marginBottom: 16 }}>Create Watch Party</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input name="contentID" type="number" placeholder="Content ID" value={form.contentID} onChange={setF} />
            <select name="clubID" value={form.clubID} onChange={setF}>
              <option value="">Select Club</option>
              {clubs.map(c => <option key={c.clubID} value={c.clubID}>{c.title}</option>)}
            </select>
            <input name="date" type="datetime-local" value={form.date} onChange={setF} />
            <input name="authorizedCinema" placeholder="Cinema name" value={form.authorizedCinema} onChange={setF} />
            <input name="capacity" type="number" placeholder="Capacity" value={form.capacity} onChange={setF} />
          </div>
          {formError && <div style={{ color: '#e55', fontSize: 12, marginBottom: 12 }}>{formError}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btn()} onClick={createParty}>Create</button>
            <button style={btn('ghost')} onClick={() => { setCreating(false); setFormError(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {parties.length === 0 ? (
        <div style={{ color: '#555', textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎟</div>
          No upcoming watch parties scheduled.
        </div>
      ) : (
        <div className="stagger-children">
          {parties.map((p, i) => {
            const pct  = p.capacity > 0 ? (p.joined / p.capacity) * 100 : 0;
            const full = p.joined >= p.capacity;
            const joined = joinStatus[p.partyID];
            return (
              <div
                key={p.partyID}
                className="card-hover animate-fade-in"
                style={{ background: '#0f0f1a', border: `1px solid ${joined ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '20px 22px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', animationDelay: `${i * 0.05}s` }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                  <div style={{ color: '#c9a227', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>📍 {p.authorizedCinema}</div>
                  <div style={{ color: '#555', fontSize: 12, marginBottom: 12 }}>
                    🗓 {p.date?.replace('T', ' ')} · 🎟 {p.joined}/{p.capacity} seats
                    {full && <span style={{ color: '#e55', marginLeft: 8, fontWeight: 700 }}>FULL</span>}
                  </div>
                  <div style={{ background: '#1a1a2a', borderRadius: 4, height: 5, width: '60%', overflow: 'hidden' }}>
                    <div className="progress-bar-fill" style={{ background: full ? '#e55' : 'linear-gradient(90deg,#c9a227,#e8c84a)', height: '100%', width: `${Math.min(100, pct)}%`, borderRadius: 4 }} />
                  </div>
                </div>
                <button
                  style={{
                    background: joined ? 'none' : full ? '#1a1a2a' : 'linear-gradient(135deg,#c9a227,#e8c84a)',
                    color: joined ? '#aaa' : full ? '#444' : '#000',
                    border: joined ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 12,
                    flexShrink: 0, marginLeft: 16, transition: 'all 0.2s',
                  }}
                  disabled={!joined && full}
                  onClick={() => joinLeave(p)}
                >
                  {joined ? 'Leave' : full ? 'Full' : 'Join'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
