import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const TABS = ['discover', 'following', 'followers', 'creators'];

const followBtn = (active) => ({
  background: active ? 'none' : 'linear-gradient(135deg,#c9a227,#e8c84a)',
  color: active ? '#aaa' : '#000',
  border: active ? '1px solid rgba(255,255,255,0.1)' : 'none',
  borderRadius: 8, padding: '7px 18px', fontWeight: 700, fontSize: 12,
  cursor: 'pointer', transition: 'all 0.2s',
});

export default function Social() {
  const [tab, setTab]           = useState('discover');
  const [query, setQuery]       = useState('');
  const [users, setUsers]       = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [followStatus, setFollowStatus]   = useState({});
  const [creatorStatus, setCreatorStatus] = useState({});
  const [searching, setSearching] = useState(false);

  const loadSocial = useCallback(async () => {
    const [fwing, fwers, crs, myCrs] = await Promise.all([
      api.get('/social/following').catch(() => ({ data: [] })),
      api.get('/social/followers').catch(() => ({ data: [] })),
      api.get('/creators').catch(() => ({ data: [] })),
      api.get('/social/creators').catch(() => ({ data: [] })),
    ]);
    setFollowing(fwing.data);
    setFollowers(fwers.data);
    setCreators(crs.data);
    const cs = {};
    myCrs.data.forEach(c => { cs[c.creatorID] = true; });
    setCreatorStatus(cs);
    const fs = {};
    fwing.data.forEach(u => { fs[u.userID] = true; });
    setFollowStatus(fs);
  }, []);

  useEffect(() => { loadSocial(); }, [loadSocial]);

  const searchUsers = useCallback(async () => {
    setSearching(true);
    try { const { data } = await api.get('/users', { params: { q: query } }); setUsers(data); }
    catch { setUsers([]); }
    setSearching(false);
  }, [query]);

  useEffect(() => { if (tab === 'discover') searchUsers(); }, [tab, searchUsers]);

  const toggleFollow = async (uid) => {
    if (followStatus[uid]) {
      await api.delete(`/social/follow/${uid}`).catch(() => { });
      setFollowStatus(s => ({ ...s, [uid]: false }));
      setFollowing(f => f.filter(u => u.userID !== uid));
    } else {
      await api.post(`/social/follow/${uid}`).catch(() => { });
      setFollowStatus(s => ({ ...s, [uid]: true }));
    }
  };

  const toggleCreator = async (cid) => {
    if (creatorStatus[cid]) {
      await api.delete(`/social/creators/${cid}/follow`).catch(() => { });
      setCreatorStatus(s => ({ ...s, [cid]: false }));
    } else {
      await api.post(`/social/creators/${cid}/follow`).catch(() => { });
      setCreatorStatus(s => ({ ...s, [cid]: true }));
    }
    loadSocial();
  };

  const userRow = (u, showFollow = true) => (
    <div key={u.userID} style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#e8c84a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#000', flexShrink: 0 }}>
          {u.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{u.username}</div>
          <div style={{ color: '#555', fontSize: 12 }}>{u.name} {u.lastName}{u.watchedCount != null ? ` · ${u.watchedCount} watched` : ''}</div>
        </div>
      </div>
      {showFollow && (
        <button style={followBtn(followStatus[u.userID])} onClick={() => toggleFollow(u.userID)}>
          {followStatus[u.userID] ? 'Unfollow' : 'Follow'}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ padding: 36, maxWidth: 900, animation: 'fadeInUp 0.35s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Social</h1>
        <div style={{ color: '#555', fontSize: 13 }}>Connect with users and follow your favourite creators</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t}
            style={{
              padding: '9px 20px', background: 'none', border: 'none',
              color: tab === t ? '#c9a227' : '#555',
              borderBottom: tab === t ? '2px solid #c9a227' : '2px solid transparent',
              fontWeight: tab === t ? 700 : 400, fontSize: 13, transition: 'color 0.2s',
            }}
            onClick={() => setTab(t)}
          >
            {t === 'following' ? `Following (${following.length})` :
             t === 'followers' ? `Followers (${followers.length})` :
             t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'discover' && (
        <div style={{ animation: 'fadeInUp 0.25s ease' }}>
          <input
            placeholder="Search users by username…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchUsers()}
            style={{ marginBottom: 16, maxWidth: 340 }}
          />
          {searching ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#555' }}><span className="spinner" /> Searching…</div>
          ) : users.length === 0 ? (
            <div style={{ color: '#555' }}>Type a username and press Enter to search.</div>
          ) : (
            <div className="stagger-children">{users.map(u => userRow(u, true))}</div>
          )}
        </div>
      )}

      {tab === 'following' && (
        <div style={{ animation: 'fadeInUp 0.25s ease' }}>
          {following.length === 0
            ? <div style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>You're not following anyone yet.</div>
            : <div className="stagger-children">{following.map(u => userRow(u, true))}</div>
          }
        </div>
      )}

      {tab === 'followers' && (
        <div style={{ animation: 'fadeInUp 0.25s ease' }}>
          {followers.length === 0
            ? <div style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>No followers yet.</div>
            : <div className="stagger-children">{followers.map(u => userRow(u, false))}</div>
          }
        </div>
      )}

      {tab === 'creators' && (
        <div style={{ animation: 'fadeInUp 0.25s ease' }}>
          {creators.length === 0
            ? <div style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>No creators found.</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }} className="stagger-children">
                {creators.map((c, i) => (
                  <div
                    key={c.creatorID}
                    className="card-hover animate-fade-in"
                    style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 16px', animationDelay: `${i * 0.04}s` }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,162,39,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#c9a227', marginBottom: 12 }}>
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{c.name}</div>
                    <div style={{ color: '#c9a227', fontSize: 11, fontWeight: 700, marginBottom: 2, letterSpacing: 0.5 }}>{c.role}</div>
                    <div style={{ color: '#555', fontSize: 11, marginBottom: 14 }}>{c.nationality} · {c.numOfFollowers} followers</div>
                    <button
                      style={{ ...followBtn(creatorStatus[c.creatorID]), width: '100%' }}
                      onClick={() => toggleCreator(c.creatorID)}
                    >
                      {creatorStatus[c.creatorID] ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
