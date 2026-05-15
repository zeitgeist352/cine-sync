import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const fmt = (v, digits = 1) => { const n = num(v); return n !== null ? n.toFixed(digits) : '—'; };

const btn = (variant = 'primary', extra = {}) => ({
  padding: '9px 22px', borderRadius: 8, fontWeight: 700, fontSize: 13,
  background: variant === 'primary' ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : variant === 'ghost' ? 'transparent' : '#1a1a2a',
  color: variant === 'primary' ? '#000' : '#ccc',
  border: variant === 'ghost' ? '1px solid rgba(255,255,255,0.1)' : 'none',
  cursor: 'pointer', transition: 'all 0.2s',
  ...extra,
});

export default function ContentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [cast, setCast] = useState([]);
  const [comments, setComments] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [status, setStatus] = useState({ watched: false, percentage: 0, rating: null, comment: '' });
  const [watchlists, setWatchlists] = useState([]);
  const [tab, setTab] = useState('reviews');
  const [commentText, setCommentText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [showWLModal, setShowWLModal] = useState(false);
  const [selectedEp, setSelectedEp] = useState(null);
  const [epWatchedSet, setEpWatchedSet] = useState(new Set());
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const cid = parseInt(id);
    if (isNaN(cid)) { setError('Invalid content ID.'); return; }
    setError(''); setContent(null); setLoaded(false);

    Promise.all([
      api.get(`/content/${cid}`),
      api.get(`/content/${cid}/reviews`).catch(() => ({ data: [] })),
      api.get(`/content/${cid}/cast`).catch(() => ({ data: [] })),
      api.get(`/content/${cid}/comments`).catch(() => ({ data: [] })),
      api.get(`/content/${cid}/episodes`).catch(() => ({ data: [] })),
    ]).then(([main, rev, cast, com, eps]) => {
      setContent(main.data);
      setReviews(Array.isArray(rev.data) ? rev.data : []);
      setCast(Array.isArray(cast.data) ? cast.data : []);
      setComments(Array.isArray(com.data) ? com.data : []);
      setEpisodes(Array.isArray(eps.data) ? eps.data : []);
      setLoaded(true);
    }).catch(() => setError('Failed to load content.'));

    if (user) {
      api.get(`/watch/status/${cid}`)
        .then(r => { setStatus(r.data); setCommentText(r.data.comment || ''); })
        .catch(() => { });
      api.get('/watchlists')
        .then(r => setWatchlists(Array.isArray(r.data) ? r.data : []))
        .catch(() => { });
    }
  }, [id, user]);

  const handleRate = async (r) => {
    try {
      await api.post('/ratings', { contentID: parseInt(id), rating: r });
      setStatus(s => ({ ...s, rating: r }));
      const { data } = await api.get(`/content/${id}`);
      setContent(data);
    } catch { }
  };

  const handleWatch = async () => {
    try {
      await api.post('/watch', { contentID: parseInt(id), percentage: 100 });
      setStatus(s => ({ ...s, watched: true, percentage: 100 }));
    } catch { }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.post('/comments', { contentID: parseInt(id), comment: commentText });
      setCommentText('');
      const { data } = await api.get(`/content/${id}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch { }
  };

  const handleDeleteComment = async (commentID) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/comments/${commentID}`);
      const { data } = await api.get(`/content/${id}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch { }
  };

  const handleAddToWL = async (wid) => {
    try {
      await api.post(`/watchlists/${wid}/contents`, { contentID: parseInt(id) });
      setShowWLModal(false);
    } catch { }
  };

  // Episode: mark as watched at computed percentage
  const handleMarkEpisodeWatched = async (ep, totalEps) => {
    const epIndex = episodes.findIndex(e => e.seasonNo === ep.seasonNo && e.episodeNo === ep.episodeNo);
    const pct = Math.round(((epIndex + 1) / totalEps) * 100);
    try {
      await api.post('/watch', { contentID: parseInt(id), percentage: pct });
      setStatus(s => ({ ...s, watched: pct >= 100, percentage: pct }));
      setEpWatchedSet(prev => new Set([...prev, `${ep.seasonNo}-${ep.episodeNo}`]));
      setSelectedEp(null);
    } catch { }
  };

  if (error) return (
    <div style={{ padding: 40 }}>
      <button style={btn('ghost')} onClick={() => navigate(-1)}>← Back</button>
      <div style={{ color: '#e55', marginTop: 16 }}>{error}</div>
    </div>
  );

  if (!content) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" />  Loading…
    </div>
  );

  const isSeries = content.contentType === 'Series';
  const globalScore   = num(content.globalScore);
  const criticScore   = num(content.criticScore);
  const weightedScore = num(content.weightedScore);

  // Group episodes by season
  const bySeason = episodes.reduce((acc, ep) => {
    if (!acc[ep.seasonNo]) acc[ep.seasonNo] = [];
    acc[ep.seasonNo].push(ep);
    return acc;
  }, {});

  return (
    <div style={{ padding: 40, maxWidth: 940, animation: 'fadeInUp 0.4s ease' }}>

      {/* Back */}
      <button
        style={{ color: '#555', fontSize: 12, marginBottom: 24, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#c9a227'}
        onMouseLeave={e => e.currentTarget.style.color = '#555'}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: '#c9a227', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
          {content.contentType?.toUpperCase()} · {content.genre?.toUpperCase()} · {content.date?.slice(0, 4)}
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, lineHeight: 1.1, letterSpacing: -0.5 }}>
          {content.title}
        </h1>
        <p style={{ color: '#999', lineHeight: 1.75, maxWidth: 680, fontSize: 14 }}>{content.synopsis}</p>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#0f0f1a', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
        {[
          weightedScore !== null && weightedScore > 0 && { label: 'WEIGHTED SCORE', value: weightedScore.toFixed(1), gold: true, tip: '60% critic + 40% user' },
          { label: 'USER SCORE', value: globalScore !== null && globalScore > 0 ? globalScore.toFixed(1) : '—', gold: !weightedScore },
          criticScore !== null && criticScore > 0 && { label: 'CRITIC SCORE', value: criticScore.toFixed(1), gold: false },
          { label: 'LANGUAGE', value: content.language?.slice(0, 3).toUpperCase() || 'ENG', gold: false },
          { label: 'MINUTES', value: content.duration || '—', gold: false },
        ].filter(Boolean).map((sc, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '16px 28px', borderRight: '1px solid rgba(255,255,255,0.05)' }} title={sc.tip || ''}>
            <div style={{ fontSize: 26, fontWeight: 900, color: sc.gold ? '#c9a227' : '#e0e0e0' }}>{sc.value}</div>
            <div style={{ fontSize: 9, color: '#555', letterSpacing: 1.5, marginTop: 4 }}>{sc.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {user && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <button style={btn('ghost')} onClick={() => setShowWLModal(true)}>+ Watchlist</button>
            <button
              style={btn(status.watched ? 'secondary' : 'primary')}
              onClick={handleWatch}
            >
              {status.watched ? '✓ Watched' : 'Mark Watched'}
            </button>
            {status.percentage > 0 && status.percentage < 100 && (
              <span style={{ color: '#666', fontSize: 12, alignSelf: 'center' }}>
                {Math.round(status.percentage)}% watched
              </span>
            )}
          </div>

          {/* Star rating */}
          {!isSeries && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: '#555', letterSpacing: 1.5, marginBottom: 10 }}>YOUR RATING</div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <span
                    key={n}
                    style={{ fontSize: 20, color: n <= (hoverRating || num(status.rating)) ? '#c9a227' : '#222', cursor: 'pointer', transition: 'color 0.1s, transform 0.1s', transform: hoverRating >= n ? 'scale(1.15)' : 'scale(1)' }}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(n)}
                  >★</span>
                ))}
                {status.rating != null && (
                  <span style={{ color: '#777', fontSize: 12, marginLeft: 8 }}>{status.rating}/10</span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Watchlist Modal */}
      {showWLModal && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setShowWLModal(false)}
        >
          <div
            className="modal-content"
            style={{ background: '#10101c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 28, width: 360 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Add to Watchlist</div>
            {watchlists.length === 0 && (
              <div style={{ color: '#555', fontSize: 13, marginBottom: 12 }}>No watchlists yet. Create one first.</div>
            )}
            {watchlists.map(wl => (
              <div
                key={wl.watchListID}
                style={{ padding: '11px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => handleAddToWL(wl.watchListID)}
              >
                <span>{wl.title}</span>
                <span style={{ color: '#555', fontSize: 11 }}>{wl.contentCount} items · {wl.visibility}</span>
              </div>
            ))}
            <button style={{ ...btn('ghost'), width: '100%', marginTop: 8 }} onClick={() => setShowWLModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' }}>Cast & Crew</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cast.map(c => (
              <div
                key={c.creatorID}
                onClick={() => navigate(`/creators/${c.creatorID}`)}
                style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '6px 14px', fontSize: 12, cursor: 'pointer', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.45)'; e.currentTarget.style.background = 'rgba(201,162,39,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#0f0f1a'; }}
              >
                <span style={{ color: '#c9a227', fontWeight: 600 }}>{c.name}</span>
                <span style={{ color: '#555' }}> · {c.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Episodes */}
      {isSeries && episodes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' }}>
            Episodes · {episodes.length} total
          </div>
          {Object.entries(bySeason).map(([season, eps]) => (
            <div key={season} style={{ marginBottom: 20 }}>
              <div style={{ color: '#777', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                SEASON {season}
              </div>
              {eps.map(ep => {
                const epKey = `${ep.seasonNo}-${ep.episodeNo}`;
                const watched = epWatchedSet.has(epKey);
                const isCurrentProgress = (() => {
                  const idx = episodes.findIndex(e => e.seasonNo === ep.seasonNo && e.episodeNo === ep.episodeNo);
                  const pct = Math.round(((idx + 1) / episodes.length) * 100);
                  return pct <= (status.percentage || 0);
                })();
                return (
                  <div
                    key={epKey}
                    onClick={() => setSelectedEp(ep)}
                    style={{
                      padding: '12px 16px', marginBottom: 6, borderRadius: 8,
                      border: `1px solid ${watched || isCurrentProgress ? 'rgba(201,162,39,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      background: watched || isCurrentProgress ? 'rgba(201,162,39,0.05)' : '#0f0f1a',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.4)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = watched || isCurrentProgress ? 'rgba(201,162,39,0.25)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: watched || isCurrentProgress ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: watched || isCurrentProgress ? '#c9a227' : '#555',
                      }}>
                        {watched || isCurrentProgress ? '✓' : ep.episodeNo}
                      </div>
                      <span style={{ color: watched || isCurrentProgress ? '#ddd' : '#aaa', fontSize: 13 }}>
                        S{ep.seasonNo}E{ep.episodeNo} – {ep.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {ep.episodeRating != null && (
                        <span style={{ color: '#c9a227', fontWeight: 700, fontSize: 12 }}>★ {fmt(ep.episodeRating)}</span>
                      )}
                      <span style={{ color: '#444', fontSize: 11 }}>View →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Episode Detail Modal */}
      {selectedEp && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setSelectedEp(null)}
        >
          <div
            className="modal-content"
            style={{ background: '#10101c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, width: 420, maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ color: '#c9a227', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>
              SEASON {selectedEp.seasonNo} · EPISODE {selectedEp.episodeNo}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
              {selectedEp.title}
            </div>
            {selectedEp.episodeRating != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span style={{ color: '#c9a227', fontSize: 22 }}>★</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{fmt(selectedEp.episodeRating)}</span>
                <span style={{ color: '#555', fontSize: 12 }}>episode rating</span>
              </div>
            )}
            {user && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: '#555', letterSpacing: 1.5, marginBottom: 8 }}>RATE EPISODE</div>
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <span
                      key={n}
                      style={{ fontSize: 20, color: n <= (hoverRating || selectedEp.userRating || 0) ? '#c9a227' : '#222', cursor: 'pointer', transition: 'color 0.1s, transform 0.1s', transform: hoverRating >= n ? 'scale(1.15)' : 'scale(1)' }}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={async () => {
                        try {
                          await api.post('/ratings', { contentID: parseInt(id), rating: n, seasonNo: selectedEp.seasonNo, episodeNo: selectedEp.episodeNo });
                          const eps = await api.get(`/content/${id}/episodes`);
                          setEpisodes(Array.isArray(eps.data) ? eps.data : []);
                          const { data } = await api.get(`/content/${id}`);
                          setContent(data);
                          setSelectedEp(prev => ({ ...prev, userRating: n, episodeRating: eps.data.find(e => e.seasonNo === prev.seasonNo && e.episodeNo === prev.episodeNo)?.episodeRating || prev.episodeRating }));
                        } catch { }
                      }}
                    >★</span>
                  ))}
                  {selectedEp.userRating != null && (
                    <span style={{ color: '#777', fontSize: 12, marginLeft: 8 }}>{selectedEp.userRating}/10</span>
                  )}
                </div>
              </div>
            )}
            <div style={{ color: '#666', fontSize: 12, marginBottom: 24 }}>
              Part of <span style={{ color: '#aaa' }}>{content.title}</span> · {episodes.length} total episodes
            </div>
            {user && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  style={btn('primary')}
                  onClick={() => handleMarkEpisodeWatched(selectedEp, episodes.length)}
                >
                  {epWatchedSet.has(`${selectedEp.seasonNo}-${selectedEp.episodeNo}`) ? '✓ Marked' : 'Mark Watched'}
                </button>
                <button style={btn('ghost')} onClick={() => setSelectedEp(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        {['reviews', 'comments'].map(t => (
          <button
            key={t}
            style={{
              padding: '10px 22px', background: 'none', border: 'none',
              color: tab === t ? '#c9a227' : '#555',
              borderBottom: tab === t ? '2px solid #c9a227' : '2px solid transparent',
              fontWeight: tab === t ? 700 : 400, fontSize: 13, transition: 'color 0.2s',
              textTransform: 'capitalize',
            }}
            onClick={() => setTab(t)}
          >
            {t === 'reviews' ? 'Critic Reviews' : 'Comments'}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div style={{ animation: 'fadeInUp 0.3s ease' }}>
          {reviews.length === 0 && <div style={{ color: '#555' }}>No official reviews yet.</div>}
          {reviews.map(r => (
            <div key={r.reviewID} style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 18, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700 }}>{r.name} {r.lastName}</span>
                <span style={{ color: '#c9a227', fontWeight: 800, fontSize: 18 }}>{fmt(r.points)}/10</span>
              </div>
              <div style={{ color: '#888', fontSize: 13, lineHeight: 1.7 }}>{r.review}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'comments' && (
        <div style={{ animation: 'fadeInUp 0.3s ease' }}>
          {user && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#555', letterSpacing: 1.5, marginBottom: 10 }}>YOUR COMMENT</div>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3}
                style={{ marginBottom: 10, resize: 'vertical' }}
              />
              <button style={btn()} onClick={handleComment}>Submit Comment</button>
            </div>
          )}
          {comments.length === 0 && <div style={{ color: '#555' }}>No comments yet. Be the first!</div>}
          {comments.map((c, i) => (
            <div key={i} style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, marginBottom: 10, animation: `fadeInUp 0.3s ease ${i * 0.05}s both` }}>
              <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{c.username}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#444', fontSize: 11 }}>{c.timestamp?.slice(0, 16)}</span>
                  {user && user.username === c.username && (
                    <button
                      onClick={() => handleDeleteComment(c.commentID)}
                      style={{ background: 'none', border: '1px solid rgba(220,50,50,0.2)', color: '#e55', borderRadius: 6, padding: '3px 8px', fontSize: 10, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{c.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
