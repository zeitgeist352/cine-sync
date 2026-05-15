import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const TABS = ['Stats', 'Analytics', 'Users', 'Content', 'Comments', 'Reviews', 'Critics', 'Clubs', 'Creators'];

const card = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '18px 22px',
};

const tbl = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
};

const th = {
  textAlign: 'left',
  padding: '9px 12px',
  background: 'rgba(255,255,255,0.04)',
  color: '#888',
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: 0.5,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const td = {
  padding: '9px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  color: '#ccc',
  verticalAlign: 'middle',
};

const btnDanger = {
  background: 'rgba(220,50,50,0.15)',
  border: '1px solid rgba(220,50,50,0.3)',
  color: '#e55',
  borderRadius: 5,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
};

const btnPrimary = {
  background: 'rgba(201,162,39,0.15)',
  border: '1px solid rgba(201,162,39,0.3)',
  color: '#c9a227',
  borderRadius: 5,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
  marginRight: 6,
};

const input = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  color: '#ddd',
  padding: '6px 10px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const badge = (color) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  background: color === 'admin'   ? 'rgba(255,100,100,0.15)' :
               color === 'critic' ? 'rgba(201,162,39,0.15)'  :
               color === 'Movie'  ? 'rgba(80,160,255,0.15)'  :
               color === 'Series' ? 'rgba(120,220,100,0.15)' :
               color === 'ShortContent' ? 'rgba(200,100,255,0.15)' :
               'rgba(255,255,255,0.08)',
  color: color === 'admin'   ? '#e55'    :
         color === 'critic'  ? '#c9a227' :
         color === 'Movie'   ? '#5af'    :
         color === 'Series'  ? '#7ec'    :
         color === 'ShortContent' ? '#c7f' :
         '#aaa',
});

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:28, maxWidth:380, width:'90%' }}>
        <div style={{ color:'#ddd', marginBottom:20, fontSize:14 }}>{message}</div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button style={{ ...btnPrimary, margin:0 }} onClick={onCancel}>Cancel</button>
          <button style={btnDanger} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ title, fields, values, onSave, onCancel }) {
  const [form, setForm] = useState(values);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:28, maxWidth:480, width:'90%' }}>
        <div style={{ color:'#c9a227', fontWeight:700, fontSize:15, marginBottom:18 }}>{title}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {fields.map(f => (
            <div key={f.key}>
              <div style={{ color:'#888', fontSize:11, marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>{f.label}</div>
              {f.type === 'select' ? (
                <select
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  style={{ ...input }}
                >
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  rows={4}
                  style={{ ...input, resize:'vertical' }}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  style={input}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
          <button style={{ ...btnPrimary, margin:0, background:'rgba(255,255,255,0.05)', color:'#888', borderColor:'rgba(255,255,255,0.08)' }} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnPrimary, margin:0 }} onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Stats ─────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)); }, []);
  if (!stats) return <div style={{ color:'#555', padding:40 }}>Loading...</div>;
  const items = [
    { label: 'Total Users',       value: stats.totalUsers,    icon: '👥' },
    { label: 'Total Content',     value: stats.totalContent,  icon: '🎬' },
    { label: 'Movies',            value: stats.totalMovies,   icon: '🎥' },
    { label: 'Series',            value: stats.totalSeries,   icon: '📺' },
    { label: 'Short Contents',    value: stats.totalShorts,   icon: '✂️' },
    { label: 'Critics',           value: stats.totalCritics,  icon: '⭐' },
    { label: 'Comments',          value: stats.totalComments, icon: '💬' },
    { label: 'Official Reviews',  value: stats.totalReviews,  icon: '📝' },
    { label: 'Clubs',             value: stats.totalClubs,    icon: '🎭' },
    { label: 'Watch Logs',        value: stats.totalWatchLogs,icon: '📖' },
    { label: 'Creators',          value: stats.totalCreators, icon: '🎭' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:14 }}>
      {items.map(it => (
        <div key={it.label} style={{ ...card, textAlign:'center' }}>
          <div style={{ fontSize:28, marginBottom:8 }}>{it.icon}</div>
          <div style={{ color:'#c9a227', fontWeight:800, fontSize:26 }}>{it.value}</div>
          <div style={{ color:'#666', fontSize:12, marginTop:4 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Users ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(() => api.get('/admin/users').then(r => setUsers(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const deleteUser = async (uid) => {
    await api.delete(`/admin/users/${uid}`);
    setConfirm(null);
    load();
  };

  const saveUser = async (form) => {
    await api.put(`/admin/users/${editing.userID}`, form);
    setEditing(null);
    load();
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {confirm && <ConfirmModal message={`Delete user "${confirm.username}"? This will delete all their data.`} onConfirm={() => deleteUser(confirm.userID)} onCancel={() => setConfirm(null)} />}
      {editing && <EditModal
        title={`Edit User: ${editing.username}`}
        fields={[
          { key:'username', label:'Username' },
          { key:'email',    label:'Email' },
          { key:'name',     label:'First Name' },
          { key:'lastName', label:'Last Name' },
          { key:'age',      label:'Age', type:'number' },
          { key:'role',     label:'Role', type:'select', options:['standard','critic'] },
        ]}
        values={{ username:editing.username, email:editing.email, name:editing.name, lastName:editing.lastName, age:editing.age, role:editing.role }}
        onSave={saveUser}
        onCancel={() => setEditing(null)}
      />}
      <div style={{ marginBottom:14 }}>
        <input style={{ ...input, maxWidth:320 }} placeholder="Search by username or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {['ID','Username','Email','Name','Age','Role','Watched','Comments','Ratings','Engagement','Actions'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.userID}>
                <td style={td}><span style={{ color:'#555' }}>#{u.userID}</span></td>
                <td style={{ ...td, fontWeight:600, color:'#ddd' }}>{u.username}</td>
                <td style={{ ...td, color:'#888' }}>{u.email}</td>
                <td style={td}>{u.name} {u.lastName}</td>
                <td style={td}>{u.age ?? '—'}</td>
                <td style={td}><span style={badge(u.role)}>{u.role}</span></td>
                <td style={td}>{u.watchCount}</td>
                <td style={td}>{u.commentCount}</td>
                <td style={td}>{u.ratingCount}</td>
                <td style={td}><span style={{ color:'#c9a227', fontWeight:700 }}>{u.engagementScore}</span></td>
                <td style={td}>
                  {u.role !== 'admin' && (
                    <>
                      <button style={btnPrimary} onClick={() => setEditing(u)}>Edit</button>
                      <button style={btnDanger} onClick={() => setConfirm(u)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ color:'#555', padding:20, textAlign:'center' }}>No users found.</div>}
      </div>
    </div>
  );
}

// ── Tab: Content ───────────────────────────────────────────────────────────────
function ContentTab() {
  const [content, setContent] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const load = useCallback(() =>
    api.get('/admin/content')
      .then(r => setContent(Array.isArray(r.data) ? r.data : []))
      .catch(() => setContent([])),
  []);
  useEffect(() => { load(); }, [load]);

  const filtered = content.filter(c => {
    const title  = (c.title  || '').toLowerCase();
    const genre  = (c.genre  || '').toLowerCase();
    const needle = search.toLowerCase();
    const matchSearch = title.includes(needle) || genre.includes(needle);
    const matchType   = typeFilter === 'All' || c.contentType === typeFilter;
    return matchSearch && matchType;
  });

  const saveContent = async (form) => {
    await api.put(`/admin/content/${editing.contentID}`, form);
    setEditing(null);
    load();
  };

  return (
    <div>
      {confirm && <ConfirmModal message={`Delete "${confirm.title}"? All associated data will be removed.`} onConfirm={async () => { await api.delete(`/admin/content/${confirm.contentID}`); setConfirm(null); load(); }} onCancel={() => setConfirm(null)} />}
      {editing && <EditModal
        title={`Edit: ${editing.title}`}
        fields={[
          { key:'title',    label:'Title' },
          { key:'genre',    label:'Genre' },
          { key:'language', label:'Language' },
          { key:'producer', label:'Producer' },
          { key:'duration', label:'Duration (min)', type:'number' },
          { key:'synopsis', label:'Synopsis', type:'textarea' },
        ]}
        values={{ title:editing.title, genre:editing.genre, language:editing.language, producer:editing.producer, duration:editing.duration, synopsis:editing.synopsis }}
        onSave={saveContent}
        onCancel={() => setEditing(null)}
      />}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        <input style={{ ...input, maxWidth:280 }} placeholder="Search by title or genre..." value={search} onChange={e => setSearch(e.target.value)} />
        {['All','Movie','Series','ShortContent','LiveStream'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            background: typeFilter === t ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${typeFilter === t ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: typeFilter === t ? '#c9a227' : '#666',
            borderRadius:6, padding:'5px 12px', fontSize:12, cursor:'pointer',
          }}>{t}</button>
        ))}
      </div>
      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {['ID','Title','Type','Genre','Language','Score','Critic','Comments','Reviews','Actions'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.contentID}>
                <td style={td}><span style={{ color:'#555' }}>#{c.contentID}</span></td>
                <td style={{ ...td, fontWeight:600, color:'#ddd', maxWidth:200 }}>{c.title}</td>
                <td style={td}><span style={badge(c.contentType)}>{c.contentType}</span></td>
                <td style={td}>{c.genre}</td>
                <td style={td}>{c.language}</td>
                <td style={td}>{c.globalScore > 0 ? Number(c.globalScore).toFixed(1) : '—'}</td>
                <td style={td}>{c.criticScore > 0 ? Number(c.criticScore).toFixed(1) : '—'}</td>
                <td style={td}>{c.commentCount}</td>
                <td style={td}>{c.reviewCount}</td>
                <td style={td}>
                  <button style={btnPrimary} onClick={() => setEditing(c)}>Edit</button>
                  <button style={btnDanger} onClick={() => setConfirm(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ color:'#555', padding:20, textAlign:'center' }}>No content found.</div>}
      </div>
    </div>
  );
}

// ── Tab: Comments ──────────────────────────────────────────────────────────────
function CommentsTab() {
  const [comments, setComments] = useState([]);
  const [confirm, setConfirm]   = useState(null);
  const [search, setSearch]     = useState('');

  const load = useCallback(() => api.get('/admin/comments').then(r => setComments(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const filtered = comments.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.contentTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {confirm && <ConfirmModal
        message={`Delete comment by "${confirm.username}" on "${confirm.contentTitle}"?`}
        onConfirm={async () => { await api.delete(`/admin/comments/${confirm.userID}/${confirm.contentID}`); setConfirm(null); load(); }}
        onCancel={() => setConfirm(null)}
      />}
      <div style={{ marginBottom:14 }}>
        <input style={{ ...input, maxWidth:360 }} placeholder="Search comments, users, or content..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {['User','Content','Date','Comment','Actions'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i}>
                <td style={{ ...td, fontWeight:600, color:'#ddd', whiteSpace:'nowrap' }}>{c.username}</td>
                <td style={{ ...td, color:'#888', whiteSpace:'nowrap' }}>{c.contentTitle}</td>
                <td style={{ ...td, color:'#555', whiteSpace:'nowrap', fontSize:11 }}>
                  {new Date(c.timestamp).toLocaleDateString()}
                </td>
                <td style={{ ...td, maxWidth:400, color:'#bbb' }}>
                  {c.comment.length > 120 ? c.comment.slice(0,120) + '…' : c.comment}
                </td>
                <td style={td}>
                  <button style={btnDanger} onClick={() => setConfirm(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ color:'#555', padding:20, textAlign:'center' }}>No comments found.</div>}
      </div>
    </div>
  );
}

// ── Tab: Reviews ───────────────────────────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [confirm, setConfirm]  = useState(null);
  const [editing, setEditing]  = useState(null);
  const [search, setSearch]    = useState('');

  const load = useCallback(() => api.get('/admin/reviews').then(r => setReviews(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const filtered = reviews.filter(r =>
    r.criticUsername.toLowerCase().includes(search.toLowerCase()) ||
    r.contentTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {confirm && <ConfirmModal
        message={`Delete review by "${confirm.criticUsername}" for "${confirm.contentTitle}"?`}
        onConfirm={async () => { await api.delete(`/admin/reviews/${confirm.reviewID}`); setConfirm(null); load(); }}
        onCancel={() => setConfirm(null)}
      />}
      {editing && <EditModal
        title={`Edit Review #${editing.reviewID}`}
        fields={[
          { key:'points', label:'Points (0–10)', type:'number' },
          { key:'review', label:'Review Text', type:'textarea' },
        ]}
        values={{ points: editing.points, review: editing.review }}
        onSave={async (form) => { await api.put(`/admin/reviews/${editing.reviewID}`, form); setEditing(null); load(); }}
        onCancel={() => setEditing(null)}
      />}
      <div style={{ marginBottom:14 }}>
        <input style={{ ...input, maxWidth:360 }} placeholder="Search by critic or content..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {['ID','Critic','Content','Points','Review','Actions'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.reviewID}>
                <td style={td}><span style={{ color:'#555' }}>#{r.reviewID}</span></td>
                <td style={{ ...td, fontWeight:600, color:'#c9a227' }}>{r.criticUsername}</td>
                <td style={{ ...td, color:'#aaa' }}>{r.contentTitle}</td>
                <td style={td}>
                  <span style={{ color: r.points >= 8 ? '#4caf50' : r.points >= 6 ? '#c9a227' : '#e55', fontWeight:700 }}>
                    {r.points}/10
                  </span>
                </td>
                <td style={{ ...td, maxWidth:360, color:'#bbb', fontSize:12 }}>
                  {r.review.length > 100 ? r.review.slice(0,100) + '…' : r.review}
                </td>
                <td style={td}>
                  <button style={btnPrimary} onClick={() => setEditing(r)}>Edit</button>
                  <button style={btnDanger}  onClick={() => setConfirm(r)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ color:'#555', padding:20, textAlign:'center' }}>No reviews found.</div>}
      </div>
    </div>
  );
}

// ── Tab: Critics ───────────────────────────────────────────────────────────────
function CriticsTab() {
  const [critics, setCritics] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => api.get('/admin/critics').then(r => setCritics(r.data)), []);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {confirm && <ConfirmModal
        message={`Demote "${confirm.username}" from critic to standard user? Their reviews will be deleted.`}
        onConfirm={async () => { await api.post(`/admin/critics/${confirm.userID}/demote`); setConfirm(null); load(); }}
        onCancel={() => setConfirm(null)}
      />}
      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {['ID','Username','Email','Name','Reviews','Avg Points','Actions'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {critics.map(c => (
              <tr key={c.userID}>
                <td style={td}><span style={{ color:'#555' }}>#{c.userID}</span></td>
                <td style={{ ...td, fontWeight:600, color:'#c9a227' }}>{c.username}</td>
                <td style={{ ...td, color:'#888' }}>{c.email}</td>
                <td style={td}>{c.name} {c.lastName}</td>
                <td style={td}>{c.reviewCount}</td>
                <td style={td}>
                  <span style={{ color: c.avgPointsGiven >= 8 ? '#4caf50' : c.avgPointsGiven >= 6 ? '#c9a227' : '#e55', fontWeight:700 }}>
                    {c.avgPointsGiven ? parseFloat(c.avgPointsGiven).toFixed(2) : '—'}
                  </span>
                </td>
                <td style={td}>
                  <button style={btnDanger} onClick={() => setConfirm(c)}>Demote</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Clubs ─────────────────────────────────────────────────────────────────
function ClubsTab() {
  const [clubs, setClubs]     = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => api.get('/admin/clubs').then(r => setClubs(r.data)), []);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {confirm && <ConfirmModal
        message={`Delete club "${confirm.title}"? All memberships, challenges, and parties will be removed.`}
        onConfirm={async () => { await api.delete(`/admin/clubs/${confirm.clubID}`); setConfirm(null); load(); }}
        onCancel={() => setConfirm(null)}
      />}
      {editing && <EditModal
        title={`Edit Club: ${editing.title}`}
        fields={[{ key:'title', label:'Club Title' }]}
        values={{ title: editing.title }}
        onSave={async (form) => { await api.put(`/admin/clubs/${editing.clubID}`, form); setEditing(null); load(); }}
        onCancel={() => setEditing(null)}
      />}
      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {['ID','Title','Moderator','Members','Criteria','Challenges','Parties','Actions'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {clubs.map(c => (
              <tr key={c.clubID}>
                <td style={td}><span style={{ color:'#555' }}>#{c.clubID}</span></td>
                <td style={{ ...td, fontWeight:600, color:'#ddd' }}>{c.title}</td>
                <td style={td}>
                  {c.moderatorUsername
                    ? <span style={{ color:'#c9a227', fontWeight:600 }}>🛡 {c.moderatorUsername}</span>
                    : <span style={{ color:'#444' }}>—</span>}
                </td>
                <td style={td}>{c.numOfMembers}</td>
                <td style={td}>
                  {c.criteriaCount > 0
                    ? <span style={{ color:'#4caf50', fontWeight:700 }}>{c.criteriaCount} set</span>
                    : <span style={{ color:'#444' }}>None</span>}
                </td>
                <td style={td}>{c.challengeCount}</td>
                <td style={td}>{c.partyCount}</td>
                <td style={td}>
                  <button style={btnPrimary} onClick={() => setEditing(c)}>Edit</button>
                  <button style={btnDanger}  onClick={() => setConfirm(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Analytics ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [tab, setTab]               = useState('engagement');
  const [engagement, setEngagement] = useState(null);
  const [trends, setTrends]         = useState(null);
  const [growth, setGrowth]         = useState(null);
  const [loading, setLoading]       = useState(false);

  const loadData = useCallback(async (t) => {
    setLoading(true);
    try {
      if (t === 'engagement' && !engagement) {
        const r = await api.get('/admin/analytics/engagement'); setEngagement(r.data);
      } else if (t === 'trends' && !trends) {
        const r = await api.get('/admin/analytics/trends'); setTrends(r.data);
      } else if (t === 'growth' && !growth) {
        const r = await api.get('/admin/analytics/growth'); setGrowth(r.data);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  }, [engagement, trends, growth]);

  useEffect(() => { loadData(tab); }, [tab]); // eslint-disable-line

  const subTabs = [
    { key:'engagement', label:'User Engagement' },
    { key:'trends',     label:'Content Trends'  },
    { key:'growth',     label:'Platform Growth' },
  ];

  const barWidth = (val, max) => max > 0 ? `${Math.round((val / max) * 100)}%` : '0%';

  return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {subTabs.map(st => (
          <button key={st.key} onClick={() => setTab(st.key)} style={{
            padding:'6px 14px', borderRadius:6,
            border:`1px solid ${tab === st.key ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.06)'}`,
            background: tab === st.key ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.03)',
            color: tab === st.key ? '#c9a227' : '#666',
            fontWeight: tab === st.key ? 700 : 400, fontSize:12, cursor:'pointer',
          }}>{st.label}</button>
        ))}
      </div>
      {loading && <div style={{ color:'#555', padding:20 }}>Loading analytics…</div>}

      {tab === 'engagement' && engagement && !loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ ...card, display:'flex', gap:28, flexWrap:'wrap', alignItems:'center' }}>
            <div>
              <div style={{ color:'#555', fontSize:11, letterSpacing:1 }}>AVG WATCH COMPLETION</div>
              <div style={{ color:'#c9a227', fontWeight:900, fontSize:32 }}>{engagement.avgCompletion}%</div>
            </div>
            {engagement.completionBuckets?.map(b => (
              <div key={b.bucket} style={{ borderLeft:'1px solid rgba(255,255,255,0.06)', paddingLeft:16 }}>
                <div style={{ color:'#555', fontSize:10, marginBottom:3 }}>{b.bucket}</div>
                <div style={{ color:'#ddd', fontWeight:700 }}>{b.count}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>TOP 10 MOST ACTIVE USERS</div>
            <table style={tbl}>
              <thead><tr>{['#','Username','Watched','Completion','Comments','Ratings','Engagement'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{engagement.topWatchers?.map((u,i)=>(
                <tr key={u.userID}>
                  <td style={{ ...td, color:'#555' }}>{i+1}</td>
                  <td style={{ ...td, fontWeight:600, color:'#ddd' }}>{u.username}</td>
                  <td style={td}>{u.watchCount}</td>
                  <td style={td}>{u.avgCompletion ?? '—'}%</td>
                  <td style={td}>{u.commentCount}</td>
                  <td style={td}>{u.ratingCount}</td>
                  <td style={td}><span style={{ color:'#c9a227', fontWeight:700 }}>{u.engagementScore}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div style={card}>
            <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>GENRE WATCH DISTRIBUTION</div>
            {(() => {
              const maxW = Math.max(...(engagement.genreDistribution||[]).map(g=>g.totalWatches));
              return engagement.genreDistribution?.map(g=>(
                <div key={g.genre} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ color:'#ddd', fontSize:13 }}>{g.genre}</span>
                    <span style={{ color:'#666', fontSize:11 }}>{g.totalWatches} watches · {g.uniqueViewers} viewers</span>
                  </div>
                  <div style={{ background:'#1a1a2a', borderRadius:4, height:6, overflow:'hidden' }}>
                    <div style={{ background:'linear-gradient(90deg,#c9a227,#e8c84a)', height:'100%', width:barWidth(g.totalWatches, maxW), transition:'width 0.6s' }} />
                  </div>
                </div>
              ));
            })()}
          </div>
          <div style={card}>
            <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>MOST ACTIVE CLUBS</div>
            <table style={tbl}>
              <thead><tr>{['Club','Members','Challenges','Watch Parties'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{engagement.mostActiveClubs?.map(c=>(
                <tr key={c.clubID}>
                  <td style={{ ...td, fontWeight:600, color:'#ddd' }}>{c.title}</td>
                  <td style={td}>{c.numOfMembers}</td>
                  <td style={td}>{c.challenges}</td>
                  <td style={td}>{c.parties}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'trends' && trends && !loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={card}>
            <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>MOST WATCHED CONTENT</div>
            <table style={tbl}>
              <thead><tr>{['#','Title','Type','Genre','Viewers','Weighted ★','User ★','Critic ★'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{trends.mostWatched?.map((c,i)=>(
                <tr key={c.contentID}>
                  <td style={{ ...td, color:'#555' }}>{i+1}</td>
                  <td style={{ ...td, fontWeight:600, color:'#ddd' }}>{c.title}</td>
                  <td style={td}><span style={badge(c.contentType)}>{c.contentType}</span></td>
                  <td style={td}>{c.genre}</td>
                  <td style={td}>{c.viewerCount}</td>
                  <td style={{ ...td, color:'#c9a227', fontWeight:700 }}>{c.weightedScore > 0 ? c.weightedScore : '—'}</td>
                  <td style={td}>{c.userScore > 0 ? c.userScore : '—'}</td>
                  <td style={td}>{c.criticScore > 0 ? c.criticScore : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div style={card}>
            <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:4 }}>TOP RATED — WEIGHTED SCORE</div>
            <div style={{ color:'#555', fontSize:11, marginBottom:14 }}>Formula: Weighted = 60% Critic Score + 40% User Score</div>
            <table style={tbl}>
              <thead><tr>{['#','Title','Weighted ★','Critic ★','User ★','Total Ratings'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{trends.topRated?.map((c,i)=>(
                <tr key={c.contentID}>
                  <td style={{ ...td, color:'#555' }}>{i+1}</td>
                  <td style={{ ...td, fontWeight:600, color:'#ddd' }}>{c.title}</td>
                  <td style={{ ...td, color:'#c9a227', fontWeight:800 }}>{c.weightedScore}</td>
                  <td style={td}>{c.criticScore > 0 ? c.criticScore : '—'}</td>
                  <td style={td}>{c.userScore > 0 ? c.userScore : '—'}</td>
                  <td style={td}>{c.ratingCount}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div style={card}>
            <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>GENRE PERFORMANCE</div>
            <table style={tbl}>
              <thead><tr>{['Genre','# Titles','Avg Weighted','Avg User','Avg Critic'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{trends.genreScores?.map(g=>(
                <tr key={g.genre}>
                  <td style={{ ...td, fontWeight:600, color:'#ddd' }}>{g.genre}</td>
                  <td style={td}>{g.contentCount}</td>
                  <td style={{ ...td, color:'#c9a227', fontWeight:700 }}>{g.avgWeighted > 0 ? g.avgWeighted : '—'}</td>
                  <td style={td}>{g.avgUser > 0 ? g.avgUser : '—'}</td>
                  <td style={td}>{g.avgCritic > 0 ? g.avgCritic : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'growth' && growth && !loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={card}>
              <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>USER ROLE DISTRIBUTION</div>
              {growth.userRoles?.map(r=>(
                <div key={r.role} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color:'#ddd' }}>{r.role}</span>
                  <span style={{ color:'#c9a227', fontWeight:700 }}>{r.count}</span>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>CONTENT BY TYPE</div>
              {growth.contentByType?.map(t=>(
                <div key={t.contentType} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={badge(t.contentType)}>{t.contentType}</span>
                  <span style={{ color:'#c9a227', fontWeight:700 }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={card}>
            <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>CONTENT ADDED BY YEAR</div>
            {(() => {
              const maxC = Math.max(...(growth.contentByYear||[]).map(y=>y.count));
              return growth.contentByYear?.map(y=>(
                <div key={y.year} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ color:'#888', fontSize:12 }}>{y.year}</span>
                    <span style={{ color:'#ddd', fontWeight:600 }}>{y.count}</span>
                  </div>
                  <div style={{ background:'#1a1a2a', borderRadius:3, height:5 }}>
                    <div style={{ background:'linear-gradient(90deg,#c9a227,#e8c84a)', height:'100%', width:barWidth(y.count, maxC) }} />
                  </div>
                </div>
              ));
            })()}
          </div>
          <div style={card}>
            <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:14 }}>CRITIC PERFORMANCE REPORT</div>
            <table style={tbl}>
              <thead><tr>{['Critic','Reviews Written','Avg Points Given','Unique Titles Reviewed'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{growth.criticStats?.map(c=>(
                <tr key={c.username}>
                  <td style={{ ...td, fontWeight:600, color:'#c9a227' }}>{c.username}</td>
                  <td style={td}>{c.reviewCount}</td>
                  <td style={td}>
                    <span style={{ color: c.avgPoints >= 8 ? '#4caf50' : c.avgPoints >= 6 ? '#c9a227' : '#e55', fontWeight:700 }}>
                      {c.avgPoints ?? '—'}/10
                    </span>
                  </td>
                  <td style={td}>{c.uniqueContentReviewed}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Creators ──────────────────────────────────────────────────────────────
function CreatorsTab() {
  const [creators, setCreators] = useState([]);
  const [confirm, setConfirm]   = useState(null);
  const [editing, setEditing]   = useState(null);
  const [search, setSearch]     = useState('');

  const load = useCallback(() => api.get('/admin/creators').then(r => setCreators(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const filtered = creators.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nationality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {confirm && <ConfirmModal
        message={`Delete creator "${confirm.name}"? They will be removed from all content.`}
        onConfirm={async () => { await api.delete(`/admin/creators/${confirm.creatorID}`); setConfirm(null); load(); }}
        onCancel={() => setConfirm(null)}
      />}
      {editing && <EditModal
        title={`Edit Creator: ${editing.name}`}
        fields={[
          { key:'name',        label:'Name' },
          { key:'age',         label:'Age', type:'number' },
          { key:'gender',      label:'Gender', type:'select', options:['Male','Female','Non-binary','Other'] },
          { key:'nationality', label:'Nationality' },
          { key:'role',        label:'Role', type:'select', options:['Actor','Director','Producer','Writer'] },
        ]}
        values={{ name:editing.name, age:editing.age, gender:editing.gender, nationality:editing.nationality, role:editing.role }}
        onSave={async (form) => { await api.put(`/admin/creators/${editing.creatorID}`, form); setEditing(null); load(); }}
        onCancel={() => setEditing(null)}
      />}
      <div style={{ marginBottom:14 }}>
        <input style={{ ...input, maxWidth:320 }} placeholder="Search by name or nationality..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {['ID','Name','Role','Gender','Nationality','Age','Followers','Content','Actions'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.creatorID}>
                <td style={td}><span style={{ color:'#555' }}>#{c.creatorID}</span></td>
                <td style={{ ...td, fontWeight:600, color:'#ddd' }}>{c.name}</td>
                <td style={td}>
                  <span style={{ color: c.role === 'Director' ? '#c9a227' : '#aaa' }}>{c.role}</span>
                </td>
                <td style={td}>{c.gender}</td>
                <td style={td}>{c.nationality}</td>
                <td style={td}>{c.age}</td>
                <td style={td}>{c.numOfFollowers.toLocaleString()}</td>
                <td style={td}>{c.contentCount}</td>
                <td style={td}>
                  <button style={btnPrimary} onClick={() => setEditing(c)}>Edit</button>
                  <button style={btnDanger}  onClick={() => setConfirm(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ color:'#555', padding:20, textAlign:'center' }}>No creators found.</div>}
      </div>
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState('Stats');

  const tabContent = {
    Stats:     <StatsTab />,
    Analytics: <AnalyticsTab />,
    Users:     <UsersTab />,
    Content:   <ContentTab />,
    Comments:  <CommentsTab />,
    Reviews:   <ReviewsTab />,
    Critics:   <CriticsTab />,
    Clubs:     <ClubsTab />,
    Creators:  <CreatorsTab />,
  };

  return (
    <div style={{ padding:'32px 28px', maxWidth:1400, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ color:'#c9a227', fontWeight:900, fontSize:22, letterSpacing:1, marginBottom:4 }}>
          Admin Dashboard
        </div>
        <div style={{ color:'#555', fontSize:13 }}>
          Platform management — manage all users, content, comments, and reviews
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:22, flexWrap:'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding:'7px 16px',
              borderRadius:7,
              border: `1px solid ${activeTab === tab ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.06)'}`,
              background: activeTab === tab ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.03)',
              color: activeTab === tab ? '#c9a227' : '#666',
              fontWeight: activeTab === tab ? 700 : 400,
              fontSize:13,
              cursor:'pointer',
              transition:'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {tabContent[activeTab]}
    </div>
  );
}
