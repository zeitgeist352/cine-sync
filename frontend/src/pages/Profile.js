import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentWatches, setRecentWatches] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', lastName: '', dateOfBirth: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchProfile = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/profile/me').catch(() => ({ data: null })),
      api.get('/watch/history').catch(() => ({ data: [] })),
      api.get('/profile/me/top-genres').catch(() => ({ data: [] })),
    ]).then(([profileRes, historyRes, genresRes]) => {
      setProfile(profileRes.data);
      setRecentWatches((historyRes.data || []).slice(0, 6));
      setTopGenres(genresRes.data || []);
      if (profileRes.data) {
        setEditForm({
          name: profileRes.data.name || '',
          lastName: profileRes.data.lastName || '',
          dateOfBirth: '', // Start empty, calculate age if user selects
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const ageToSave = editForm.dateOfBirth ? calculateAge(editForm.dateOfBirth) : profile?.age;
      await api.put('/profile/me', {
        name: editForm.name,
        lastName: editForm.lastName,
        age: ageToSave,
      });
      setSaveMsg('Profile updated!');
      setEditing(false);
      fetchProfile();
    } catch {
      setSaveMsg('Failed to update.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  const stats = [
    { label: 'WATCHED',    value: profile?.watchedCount ?? 0,     icon: '🎬', color: '#e8c84a' },
    { label: 'AVG RATING', value: profile?.avgRating ? parseFloat(profile.avgRating).toFixed(1) : '—', icon: '⭐', color: '#f0a830' },
    { label: 'WATCHLISTS', value: profile?.watchListCount ?? 0,    icon: '📋', color: '#6ec6ff' },
    { label: 'FOLLOWING',  value: profile?.followingCount ?? 0,    icon: '➡️', color: '#81c784' },
    { label: 'FOLLOWERS',  value: profile?.followerCount ?? 0,     icon: '👥', color: '#ba68c8' },
    { label: 'CLUBS',      value: profile?.clubCount ?? 0,         icon: '🎭', color: '#ff8a65' },
    { label: 'BADGES',     value: profile?.badgeCount ?? 0,        icon: '🏅', color: '#ffd54f' },
    ...(user?.role === 'critic' ? [{ label: 'REVIEWS', value: profile?.officialReviewCount ?? 0, icon: '📝', color: '#ef5350' }] : []),
  ];

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const infoRows = [
    { key: 'USERNAME',    value: profile?.username  || user?.username || '—',  icon: '👤' },
    { key: 'EMAIL',       value: profile?.email     || user?.email    || '—',  icon: '✉️' },
    { key: 'FULL NAME',   value: (profile?.name && profile?.lastName) ? `${profile.name} ${profile.lastName}` : '—', icon: '🪪' },
    { key: 'AGE',         value: profile?.age != null ? `${profile.age} years old` : '—', icon: '🎂' },
    { key: 'ROLE',        value: (user?.role || 'standard').charAt(0).toUpperCase() + (user?.role || 'standard').slice(1), icon: '🎖️' },
    ...(memberSince ? [{ key: 'MEMBER SINCE', value: memberSince, icon: '📅' }] : []),
  ];

  const genreColors = ['#c9a227', '#6ec6ff', '#ba68c8', '#ff8a65', '#81c784', '#ef5350', '#ffd54f'];

  return (
    <div style={{ padding: '32px 40px 60px', maxWidth: 920, animation: 'fadeInUp 0.35s ease' }}>

      {/* ── Profile Header ────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 28, marginBottom: 36,
        background: 'linear-gradient(135deg, rgba(201,162,39,0.06) 0%, rgba(20,20,32,0.5) 60%, rgba(186,104,200,0.04) 100%)',
        padding: '28px 32px', borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: '50%', width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(186,104,200,0.05) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #c9a227, #e8c84a, #f0a830, #c9a227)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 3,
            boxShadow: '0 0 40px rgba(201,162,39,0.35), 0 8px 32px rgba(0,0,0,0.5)',
            animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: '#0d0d1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 36, color: '#c9a227',
              letterSpacing: -1,
            }}>
              {(profile?.username || user?.username)?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
          {/* Online indicator */}
          <div style={{
            position: 'absolute', bottom: 4, right: 4, width: 14, height: 14,
            background: '#4caf50', borderRadius: '50%', border: '2.5px solid #0d0d1a',
            boxShadow: '0 0 8px rgba(76,175,80,0.6)',
          }} />
        </div>

        {/* User info */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.5, lineHeight: 1.2 }}>
              {profile?.username || user?.username}
            </div>
            <div style={{
              display: 'inline-block', color: '#c9a227', fontSize: 10, fontWeight: 700,
              letterSpacing: 2, padding: '3px 10px', borderRadius: 20,
              background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.25)',
            }}>
              {(user?.role || 'STANDARD').toUpperCase()}
            </div>
          </div>
          <div style={{ color: '#666', fontSize: 14, marginBottom: 10 }}>
            {profile?.name} {profile?.lastName}
            {profile?.email && <span style={{ marginLeft: 12, color: '#555' }}>· {profile.email}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: editing ? 'rgba(229,85,85,0.12)' : 'rgba(201,162,39,0.12)',
                border: `1px solid ${editing ? 'rgba(229,85,85,0.3)' : 'rgba(201,162,39,0.25)'}`,
                color: editing ? '#e55' : '#c9a227',
                padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {editing ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
            {saveMsg && (
              <div style={{
                fontSize: 12, padding: '5px 12px', borderRadius: 8,
                background: saveMsg.includes('updated') ? 'rgba(76,175,80,0.12)' : 'rgba(229,85,85,0.12)',
                color: saveMsg.includes('updated') ? '#81c784' : '#e55',
                border: `1px solid ${saveMsg.includes('updated') ? 'rgba(76,175,80,0.2)' : 'rgba(229,85,85,0.2)'}`,
                animation: 'fadeInUp 0.25s ease',
              }}>
                {saveMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Form ─────────────────────────────────────── */}
      {editing && (
        <div style={{
          background: '#0f0f1a', border: '1px solid rgba(201,162,39,0.15)',
          borderRadius: 14, padding: 24, marginBottom: 28,
          animation: 'fadeInUp 0.3s ease',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 2, marginBottom: 18 }}>
            EDIT PROFILE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 10, color: '#555', letterSpacing: 1.5, display: 'block', marginBottom: 6 }}>FIRST NAME</label>
              <input
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                style={{
                  background: '#141420', border: '1px solid #2a2a3a', color: '#e0e0e0',
                  borderRadius: 8, padding: '9px 13px', fontSize: 13, width: '100%', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#555', letterSpacing: 1.5, display: 'block', marginBottom: 6 }}>LAST NAME</label>
              <input
                value={editForm.lastName}
                onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                style={{
                  background: '#141420', border: '1px solid #2a2a3a', color: '#e0e0e0',
                  borderRadius: 8, padding: '9px 13px', fontSize: 13, width: '100%', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#555', letterSpacing: 1.5, display: 'block', marginBottom: 6 }}>BIRTH DATE</label>
              <input
                type="date"
                value={editForm.dateOfBirth}
                onChange={e => setEditForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                style={{
                  background: '#141420', border: '1px solid #2a2a3a', color: '#e0e0e0', colorScheme: 'dark',
                  borderRadius: 8, padding: '9px 13px', fontSize: 13, width: '100%', outline: 'none',
                }}
              />
              {profile?.age && !editForm.dateOfBirth && (
                <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>Current age: {profile.age}</div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #c9a227, #e8c84a)',
                border: 'none', color: '#000', padding: '8px 22px', borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                opacity: saving ? 0.6 : 1, transition: 'all 0.2s',
              }}
            >
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Stats Grid ────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 14 }}>
          YOUR ACTIVITY
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }} className="stagger-children">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="card-hover animate-fade-in"
              style={{
                background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '16px 12px', textAlign: 'center',
                animationDelay: `${i * 0.05}s`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)`,
              }} />
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, marginBottom: 4, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two Column: Top Genres + Account Info ──────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>

        {/* Top Genres */}
        <div style={{
          background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 18 }}>
            TOP GENRES
          </div>
          {topGenres.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topGenres.map((g, i) => {
                const maxCount = topGenres[0]?.count || 1;
                const pct = Math.round((g.count / maxCount) * 100);
                return (
                  <div key={g.genre}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>{g.genre}</span>
                      <span style={{ fontSize: 12, color: '#666' }}>{g.count} watched</span>
                    </div>
                    <div style={{
                      height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden',
                    }}>
                      <div className="progress-bar-fill" style={{
                        height: '100%', width: `${pct}%`, borderRadius: 3,
                        background: `linear-gradient(90deg, ${genreColors[i % genreColors.length]}, ${genreColors[i % genreColors.length]}88)`,
                        animationDelay: `${i * 0.1}s`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎬</div>
              Start watching to see your genre breakdown
            </div>
          )}
        </div>

        {/* Account Info */}
        <div style={{
          background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 18 }}>
            ACCOUNT INFO
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {infoRows.map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: '#444', letterSpacing: 1.5, marginBottom: 2 }}>{item.key}</div>
                  <div style={{
                    color: '#bbb', fontSize: 13, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Watch History ──────────────────────────── */}
      <div style={{
        background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14, padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2 }}>
            RECENTLY WATCHED
          </div>
          {recentWatches.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                color: '#888', padding: '4px 12px', borderRadius: 6, fontSize: 11,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.3)'; e.currentTarget.style.color = '#c9a227'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#888'; }}
            >
              View All →
            </button>
          )}
        </div>
        {recentWatches.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {recentWatches.map((w, i) => (
              <div
                key={`${w.contentID}-${i}`}
                className="card-hover animate-fade-in"
                onClick={() => navigate(`/content/${w.contentID}`)}
                style={{
                  background: '#141420', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
                  animationDelay: `${i * 0.05}s`,
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    fontWeight: 700, fontSize: 14, color: '#ddd', lineHeight: 1.3,
                    flex: 1, marginRight: 8,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {w.title}
                  </div>
                  {w.rating && (
                    <div style={{
                      background: 'rgba(201,162,39,0.12)', color: '#c9a227',
                      padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      ⭐ {w.rating}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {w.genre && (
                    <span style={{
                      fontSize: 10, color: '#888', background: 'rgba(255,255,255,0.04)',
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      {w.genre}
                    </span>
                  )}
                  {w.percentage != null && (
                    <span style={{ fontSize: 10, color: '#666' }}>
                      {parseFloat(w.percentage).toFixed(0)}% watched
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                {w.percentage != null && (
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${parseFloat(w.percentage)}%`,
                      background: parseFloat(w.percentage) >= 100
                        ? 'linear-gradient(90deg, #4caf50, #81c784)'
                        : 'linear-gradient(90deg, #c9a227, #e8c84a)',
                      borderRadius: 2, transition: 'width 0.6s ease',
                    }} />
                  </div>
                )}
                {w.comment && (
                  <div style={{
                    fontSize: 11, color: '#666', fontStyle: 'italic',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    "{w.comment}"
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: 30 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📖</div>
            <div style={{ marginBottom: 6 }}>No watch history yet</div>
            <button
              onClick={() => navigate('/browse')}
              style={{
                background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.25)',
                color: '#c9a227', padding: '6px 16px', borderRadius: 8, fontSize: 12,
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              Browse Content →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
