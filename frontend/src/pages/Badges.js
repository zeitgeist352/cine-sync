import { useEffect, useState } from 'react';
import api from '../api/client';

const BADGE_ICONS = ['🏅', '🎖', '🏆', '⭐', '💎', '🔥', '🎯', '🌟'];

export default function Badges() {
  const [progress, setProgress] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/badges/progress')
      .then(r => setProgress(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProgress([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter: "all" shows badges where user joined the challenge or badge has no challenge
  // "earned" shows only earned ones
  // We exclude badges with a challenge the user has NOT joined (userProgress is null and challengeID is not null)
  const earned = progress.filter(b => b.earned);
  const relevant = progress.filter(b => b.earned || b.userProgress !== null || !b.challengeID);
  const displayed = tab === 'earned' ? earned : relevant;

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  return (
    <div style={{ padding: 36, maxWidth: 960, animation: 'fadeInUp 0.35s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Badges</h1>
        <div style={{ color: '#555', fontSize: 13 }}>Track your achievement progress and earned badges</div>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Earned', value: earned.length, color: '#4caf50' },
          { label: 'In Progress', value: relevant.filter(b => !b.earned && b.userProgress !== null).length, color: '#c9a227' },
          { label: 'Available', value: relevant.length, color: '#666' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 20px', textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        {[['all', `My Badges (${relevant.length})`], ['earned', `Earned (${earned.length})`]].map(([t, l]) => (
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
            {l}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div style={{ color: '#555', padding: '40px 0', textAlign: 'center' }}>
          {tab === 'earned'
            ? 'No badges earned yet. Join group challenges to earn badges!'
            : 'Join challenges to unlock badges.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }} className="stagger-children">
          {displayed.map((b, i) => {
            const pct = b.userProgress != null ? Math.round(parseFloat(b.userProgress)) : null;
            const isEarned = !!b.earned;
            const icon = BADGE_ICONS[b.id % BADGE_ICONS.length];
            return (
              <div
                key={b.id}
                className="card-hover animate-fade-in"
                style={{
                  background: isEarned
                    ? 'linear-gradient(135deg, rgba(201,162,39,0.12) 0%, rgba(15,15,26,1) 60%)'
                    : '#0f0f1a',
                  border: `1px solid ${isEarned ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12, padding: 22,
                  opacity: !isEarned && b.userProgress === null ? 0.65 : 1,
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {/* Icon + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: isEarned ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                    boxShadow: isEarned ? '0 0 20px rgba(201,162,39,0.3)' : 'none',
                  }}>
                    {icon}
                  </div>
                  {isEarned ? (
                    <span style={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(76,175,80,0.3)' }}>
                      ✓ Earned
                    </span>
                  ) : pct !== null ? (
                    <span style={{ color: '#c9a227', fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                  ) : null}
                </div>

                {/* Name & Description */}
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6, color: isEarned ? '#c9a227' : '#e0e0e0' }}>
                  {b.name}
                </div>
                {b.explanation && (
                  <div style={{ color: '#777', fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>
                    {b.explanation}
                  </div>
                )}

                {/* Challenge info */}
                {b.challengeTitle && (
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>
                    Challenge: <span style={{ color: '#888' }}>{b.challengeTitle}</span>
                    {b.endDate && <span> · ends {b.endDate}</span>}
                  </div>
                )}

                {/* Progress bar */}
                {!isEarned && pct !== null && (
                  <div>
                    <div style={{ background: '#1a1a2a', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          background: 'linear-gradient(90deg, #c9a227, #e8c84a)',
                          height: '100%', width: `${pct}%`, borderRadius: 6,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 5 }}>
                      {pct}% complete · {b.groupProgress || 'In Progress'}
                    </div>
                  </div>
                )}

                {isEarned && b.earnedAt && (
                  <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Earned {b.earnedAt}</div>
                )}

                {!isEarned && pct === null && !b.challengeID && (
                  <div style={{ fontSize: 11, color: '#555' }}>Join the challenge to start earning</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
