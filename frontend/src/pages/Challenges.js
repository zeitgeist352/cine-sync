import { useCallback, useEffect, useState } from 'react';
// Challenge creation lives in Clubs.js (under the club's Challenges tab)
import api from '../api/client';

const btn = (v = 'primary') => ({
  background: v === 'primary' ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : 'none',
  color: v === 'primary' ? '#000' : '#aaa',
  border: v === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  transition: 'all 0.2s',
});

const statusColor = (s) =>
  s === 'Completed' ? '#4caf50' : s === 'In Progress' ? '#c9a227' : '#555';


export default function Challenges() {
  const [tab, setTab] = useState('browse');
  const [all, setAll] = useState([]);
  const [mine, setMine] = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [members, setMembers] = useState({});
  const [membersLoading, setMembersLoading] = useState({});
  const [myProgress, setMyProgress] = useState({});
  const [challengeContent, setChallengeContent] = useState({});

  const loadAll = useCallback(async () => {
    const [allRes, mineRes] = await Promise.all([
      api.get('/challenges').catch(() => ({ data: [] })),
      api.get('/challenges/mine').catch(() => ({ data: [] })),
    ]);
    setAll(allRes.data);
    setMine(mineRes.data);
    const s = {}, p = {};
    mineRes.data.forEach(c => {
      s[c.challengeID] = true;
      if (c.progress != null) p[c.challengeID] = parseFloat(c.progress);
    });
    setJoinStatus(s);
    setMyProgress(p);
  }, []);

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, [loadAll]);

  const toggleExpand = async (challengeID) => {
    if (expanded === challengeID) { setExpanded(null); return; }
    setExpanded(challengeID);
    if (!members[challengeID]) {
      setMembersLoading(m => ({ ...m, [challengeID]: true }));
      const r = await api.get(`/challenges/${challengeID}/members`).catch(() => ({ data: [] }));
      setMembers(m => ({ ...m, [challengeID]: Array.isArray(r.data) ? r.data : [] }));
      setMembersLoading(m => ({ ...m, [challengeID]: false }));
    }
    if (!challengeContent[challengeID]) {
      const r = await api.get(`/challenges/${challengeID}/content`).catch(() => ({ data: null }));
      if (r.data) setChallengeContent(cc => ({ ...cc, [challengeID]: r.data }));
    }
  };

  const joinChallenge = async (id) => {
    await api.post(`/challenges/${id}/join`).catch(() => { });
    setJoinStatus(s => ({ ...s, [id]: true }));
    loadAll();
    if (expanded === id) {
      const r = await api.get(`/challenges/${id}/members`).catch(() => ({ data: [] }));
      setMembers(m => ({ ...m, [id]: Array.isArray(r.data) ? r.data : [] }));
    }
  };


  const list = tab === 'mine' ? mine : all;

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  return (
    <div style={{ padding: 36, maxWidth: 960, animation: 'fadeInUp 0.35s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Group Challenges</h1>
        <div style={{ color: '#555', fontSize: 13 }}>Browse all challenges · create them from inside a Club</div>
      </div>


      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        {[['browse', 'All Challenges'], ['mine', 'My Challenges']].map(([t, l]) => (
          <button
            key={t}
            style={{
              padding: '9px 22px', background: 'none', border: 'none',
              color: tab === t ? '#c9a227' : '#555',
              borderBottom: tab === t ? '2px solid #c9a227' : '2px solid transparent',
              fontWeight: tab === t ? 700 : 400, fontSize: 13, transition: 'color 0.2s',
            }}
            onClick={() => setTab(t)}
          >
            {l} {t === 'mine' && `(${mine.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>
          {tab === 'mine' ? "You haven't joined any challenges yet." : 'No challenges available.'}
        </div>
      ) : (
        <div className="stagger-children">
          {list.map((c, i) => {
            const prog = myProgress[c.challengeID] ?? (c.progress != null ? parseFloat(c.progress) : null);
            const isExpanded = expanded === c.challengeID;
            const challengeMembers = members[c.challengeID] || [];
            const isLoading = membersLoading[c.challengeID];
            const cc = challengeContent[c.challengeID];
            return (
              <div
                key={c.challengeID}
                className="animate-fade-in"
                style={{
                  background: '#0f0f1a',
                  border: `1px solid ${isExpanded ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12, marginBottom: 12, overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {/* Card header */}
                <div
                  style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                  onClick={() => toggleExpand(c.challengeID)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{c.title}</div>
                    <div style={{ color: '#555', fontSize: 12, marginBottom: 8 }}>
                      {c.startDate} → {c.endDate}
                      {c.numOfMembers !== undefined && (
                        <span style={{ marginLeft: 14, color: '#666' }}>
                          👥 {c.numOfMembers} participant{c.numOfMembers !== 1 ? 's' : ''}
                        </span>
                      )}
                      {c.challengeType === 'type_based' && (
                        <span style={{ marginLeft: 14, color: '#444', fontSize: 11 }}>
                          {c.requiredCount}× {c.contentType}{c.genre ? ` · ${c.genre}` : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: statusColor(c.groupProgress) }}>
                        ● {c.groupProgress || 'Not Started'}
                      </span>
                      {prog != null && (
                        <span style={{ color: '#555', fontSize: 11 }}>Your progress: {prog.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {joinStatus[c.challengeID] ? (
                      <span style={{ background: 'rgba(76,175,80,0.12)', color: '#4caf50', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(76,175,80,0.3)' }}>
                        ✓ Joined
                      </span>
                    ) : tab === 'browse' && (
                      <button
                        style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a)', color: '#000', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 12 }}
                        onClick={e => { e.stopPropagation(); joinChallenge(c.challengeID); }}
                      >
                        Join
                      </button>
                    )}
                    <span style={{ color: '#444', fontSize: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                  </div>
                </div>

                {/* Progress bar */}
                {prog != null && (
                  <div style={{ padding: '0 20px 4px', background: '#0a0a14' }}>
                    <div style={{ background: '#1a1a2a', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                      <div
                        className="progress-bar-fill"
                        style={{ background: 'linear-gradient(90deg,#c9a227,#e8c84a)', height: '100%', width: `${prog}%`, borderRadius: 4 }}
                      />
                    </div>
                  </div>
                )}

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0a0a14', padding: '18px 20px', animation: 'fadeInUp 0.25s ease' }}>

                    {/* What to watch */}
                    {cc && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 10 }}>
                          WHAT TO WATCH
                        </div>
                        {cc.type === 'specific' ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {(cc.content || []).map(item => (
                              <div key={item.contentID} style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 8, padding: '6px 12px', fontSize: 12,
                              }}>
                                <span style={{ color: '#e0e0e0' }}>{item.title}</span>
                                <span style={{ color: '#444', marginLeft: 8, fontSize: 11 }}>{item.contentType}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: '#888' }}>
                            Watch <span style={{ color: '#c9a227', fontWeight: 700 }}>{cc.requiredCount}</span> {cc.contentType}{cc.genre ? <span> · <span style={{ color: '#aaa' }}>{cc.genre}</span></span> : ''} title{cc.requiredCount !== 1 ? 's' : ''} after the challenge start date.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Members */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 14 }}>
                      MEMBERS ({challengeMembers.length})
                    </div>
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#555', fontSize: 13 }}>
                        <span className="spinner" style={{ width: 16, height: 16 }} /> Loading members…
                      </div>
                    ) : challengeMembers.length === 0 ? (
                      <div style={{ color: '#555', fontSize: 13 }}>No members yet.</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                        {challengeMembers.map(m => (
                          <div key={m.userID} style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#e8c84a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#000', flexShrink: 0 }}>
                                {m.username?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{m.username}</div>
                                <div style={{ color: '#555', fontSize: 10 }}>Joined {m.joinDate}</div>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 10, color: '#555' }}>Progress</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: parseFloat(m.progress) >= 100 ? '#4caf50' : '#c9a227' }}>
                                  {m.progress != null ? parseFloat(m.progress).toFixed(0) : 0}%
                                </span>
                              </div>
                              <div style={{ background: '#1a1a2a', borderRadius: 3, height: 4, overflow: 'hidden' }}>
                                <div style={{
                                  background: parseFloat(m.progress) >= 100
                                    ? 'linear-gradient(90deg,#4caf50,#81c784)'
                                    : 'linear-gradient(90deg,#c9a227,#e8c84a)',
                                  height: '100%',
                                  width: `${m.progress != null ? parseFloat(m.progress) : 0}%`,
                                  borderRadius: 3,
                                }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
