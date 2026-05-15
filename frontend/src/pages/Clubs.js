import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';

const fmtScore = v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n.toFixed(1) : '—'; };
const statusColor = s => s === 'Completed' ? '#4caf50' : s === 'In Progress' ? '#c9a227' : '#555';

const primaryBtn = {
  background: 'linear-gradient(135deg,#c9a227,#e8c84a)', border: 'none',
  borderRadius: 8, padding: '8px 18px', fontWeight: 700, color: '#000',
  fontSize: 13, cursor: 'pointer',
};
const ghostBtn = {
  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '8px 18px', fontWeight: 700, color: '#aaa',
  fontSize: 13, cursor: 'pointer',
};

/** Debounced content-name search dropdown */
function ContentSearch({ onPick }) {
  const [q, setQ]         = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen]   = useState(false);
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

/** Debounced creator-name search dropdown */
function CreatorSearch({ onPick }) {
  const [q, setQ]         = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen]   = useState(false);
  const [picked, setPicked] = useState(null);
  const timer = useRef(null);

  const search = val => {
    setQ(val); setPicked(null); onPick(null);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      const { data } = await api.get('/creators', { params: { q: val } }).catch(() => ({ data: [] }));
      setResults(Array.isArray(data) ? data.slice(0, 8) : []);
      setOpen(true);
    }, 280);
  };

  const pick = item => {
    setPicked(item); setQ(item.name); setOpen(false); onPick(item.creatorID);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={q}
        onChange={e => search(e.target.value)}
        placeholder="Search creator by name…"
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{ borderColor: picked ? 'rgba(201,162,39,0.5)' : undefined }}
      />
      {picked && (
        <div style={{ fontSize: 10, color: '#4caf50', marginTop: 4 }}>
          ✓ {picked.role} · {picked.nationality}
        </div>
      )}
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#10101c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          {results.map(r => (
            <div
              key={r.creatorID}
              onMouseDown={() => pick(r)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
              <div style={{ color: '#555', fontSize: 11 }}>{r.role} · {r.nationality}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Clubs() {
  const [listTab, setListTab]   = useState('browse');
  const [detailTab, setDetailTab] = useState('members');
  const [clubs, setClubs]       = useState([]);
  const [mine, setMine]         = useState([]);
  const [memberStatus, setMemberStatus] = useState({});  // clubID → bool
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [criteria, setCriteria]     = useState([]);           // club criteria
  const [eligibility, setEligibility] = useState(null);       // { eligible, missing }
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [criteriaForm, setCriteriaForm] = useState({ type:'genre', genreName:'', threshold:1, creatorID:'', startOfEra:'', endOfEra:'' });
  const [currentUser, setCurrentUser] = useState(null);

  // Detail panel data
  const [members, setMembers]   = useState([]);
  const [memberProfiles, setMemberProfiles] = useState({});
  const [challenges, setChallenges] = useState([]);
  const [parties, setParties]   = useState([]);

  // Per-challenge join status and expanded members
  const [challengeJoined, setChallengeJoined] = useState({});  // challengeID → bool
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const [challengeMembers, setChallengeMembers] = useState({});      // challengeID → []
  const [challengeMembersLoading, setChallengeMembersLoading] = useState({});

  // Per-party join status
  const [partyJoined, setPartyJoined] = useState({});  // partyID → bool

  // Creation forms
  const [creatingClub, setCreatingClub] = useState(false);
  const [newClubTitle, setNewClubTitle] = useState('');
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    title: '', startDate: '', endDate: '',
    badgeName: '', badgeExplanation: '',
    mode: 'specific', contentType: 'Movie', genre: '', requiredCount: 1,
  });
  const [chSelectedContent, setChSelectedContent] = useState([]);
  const [chContentSearch, setChContentSearch] = useState('');
  const [chContentResults, setChContentResults] = useState([]);
  const [chSearching, setChSearching] = useState(false);
  const [creatingParty, setCreatingParty] = useState(false);
  const [partyForm, setPartyForm] = useState({ contentID: null, dateDate: '', dateTime: '', authorizedCinema: '', capacity: '' });
  const [partyError, setPartyError] = useState('');
  const [genres, setGenres] = useState([]);

  // ── Load club list ────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [allRes, mineRes, profileRes, genresRes] = await Promise.all([
      api.get('/clubs').catch(() => ({ data: [] })),
      api.get('/clubs/mine').catch(() => ({ data: [] })),
      api.get('/profile/me').catch(() => ({ data: null })),
      api.get('/genres').catch(() => ({ data: [] })),
    ]);
    setClubs(Array.isArray(allRes.data) ? allRes.data : []);
    setMine(Array.isArray(mineRes.data) ? mineRes.data : []);
    setGenres(Array.isArray(genresRes.data) ? genresRes.data : []);
    const s = {};
    (mineRes.data || []).forEach(c => { s[c.clubID] = true; });
    setMemberStatus(s);
    if (profileRes.data) setCurrentUser(profileRes.data);
  }, []);

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, [loadAll]);

  // Debounced content search for challenge creation (specific mode)
  useEffect(() => {
    if (!chContentSearch.trim()) { setChContentResults([]); return; }
    const t = setTimeout(async () => {
      setChSearching(true);
      const r = await api.get('/content', { params: { q: chContentSearch, limit: 20 } }).catch(() => ({ data: [] }));
      setChContentResults(Array.isArray(r.data) ? r.data : []);
      setChSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [chContentSearch]);

  // ── Load full detail for a selected club ─────────────────────────────────
  const loadClubDetail = useCallback(async (club) => {
    setDetailLoading(true);
    setMembers([]); setMemberProfiles({});
    setChallenges([]); setParties([]);
    setChallengeJoined({}); setPartyJoined({});
    setExpandedChallenge(null); setChallengeMembers({});
    setChSelectedContent([]); setChContentSearch(''); setChContentResults([]);
    setCriteria([]); setEligibility(null); setShowCriteriaForm(false);

    const [membersRes, challengesRes, partiesRes, myChallengesRes, criteriaRes, eligRes] = await Promise.all([
      api.get(`/clubs/${club.clubID}/members`).catch(() => ({ data: [] })),
      api.get('/challenges', { params: { clubID: club.clubID } }).catch(() => ({ data: [] })),
      api.get('/watchparties').catch(() => ({ data: [] })),
      api.get('/challenges/mine').catch(() => ({ data: [] })),
      api.get(`/clubs/${club.clubID}/criteria`).catch(() => ({ data: [] })),
      api.get(`/clubs/${club.clubID}/eligibility`).catch(() => ({ data: { eligible: true, missing: [] } })),
    ]);

    const memberList   = Array.isArray(membersRes.data) ? membersRes.data : [];
    const challengeList = Array.isArray(challengesRes.data) ? challengesRes.data : [];
    const allParties   = Array.isArray(partiesRes.data) ? partiesRes.data : [];
    const clubParties  = allParties.filter(p => p.clubID === club.clubID);
    const myChallenges = Array.isArray(myChallengesRes.data) ? myChallengesRes.data : [];

    setMembers(memberList);
    setChallenges(challengeList);
    setParties(clubParties);
    setCriteria(Array.isArray(criteriaRes.data) ? criteriaRes.data : []);
    setEligibility(eligRes.data || { eligible: true, missing: [] });

    // Build challenge join status from /challenges/mine
    const cj = {};
    myChallenges.forEach(c => { cj[c.challengeID] = true; });
    setChallengeJoined(cj);

    // Build party join status using the status endpoint
    const pj = {};
    await Promise.all(clubParties.map(async p => {
      const r = await api.get(`/watchparties/${p.partyID}/status`).catch(() => ({ data: { joined: false } }));
      pj[p.partyID] = !!r.data.joined;
    }));
    setPartyJoined(pj);

    // Fetch member profiles in background
    const profiles = {};
    await Promise.all(memberList.map(async m => {
      const r = await api.get(`/profile/${m.userID}`).catch(() => ({ data: null }));
      if (r.data) profiles[m.userID] = r.data;
    }));
    setMemberProfiles(profiles);
    setDetailLoading(false);
  }, []);

  const selectClub = club => {
    setSelected(club);
    setDetailTab('members');
    setCreatingChallenge(false);
    setCreatingParty(false);
    loadClubDetail(club);
  };

  // ── Club join / leave ─────────────────────────────────────────────────────
  const joinLeaveClub = async (e, club) => {
    e.stopPropagation();
    const wasJoined = !!memberStatus[club.clubID];
    if (wasJoined) {
      setMemberStatus(s => ({ ...s, [club.clubID]: false }));
      const res = await api.delete(`/clubs/${club.clubID}/leave`).catch(err => err.response);
      if (res?.data?.error) {
        setMemberStatus(s => ({ ...s, [club.clubID]: true }));
        return;
        return;
      }
    } else {
      const res = await api.post(`/clubs/${club.clubID}/join`).catch(err => err.response);
      if (res?.data?.error) {
        const missing = res.data.missing;
        if (missing?.length) {
          window.dispatchEvent(new CustomEvent('cinelog-toast', { detail: { type: 'error', message: `Requirements not met: ${missing.join(', ')}` } }));
        } else {
        }
        return;
      }
      setMemberStatus(s => ({ ...s, [club.clubID]: true }));
    }
    // Refresh list (member counts) and selected club header
    await loadAll();
    if (selected?.clubID === club.clubID) {
      const r = await api.get(`/clubs/${club.clubID}`).catch(() => ({ data: selected }));
      setSelected(r.data);
      // Reload members list only (not full detail to avoid state flicker)
      const mr = await api.get(`/clubs/${club.clubID}/members`).catch(() => ({ data: [] }));
      setMembers(Array.isArray(mr.data) ? mr.data : []);
    }
  };

  // ── Add criterion (moderator only) ───────────────────────────────────────
  const addCriterion = async () => {
    if (!selected) return;
    const payload = { type: criteriaForm.type };
    if (criteriaForm.type === 'genre') {
      if (!criteriaForm.genreName.trim()) {
        window.dispatchEvent(new CustomEvent('cinelog-toast', { detail: { type: 'error', message: 'Please select a genre.' } }));
        return;
      }
      payload.genreName  = criteriaForm.genreName.trim();
      payload.threshold  = parseInt(criteriaForm.threshold) || 1;
    } else if (criteriaForm.type === 'celebrity') {
      if (!criteriaForm.creatorID) return;
      payload.creatorID = parseInt(criteriaForm.creatorID);
      payload.threshold = parseInt(criteriaForm.threshold) || 1;
    } else if (criteriaForm.type === 'era') {
      if (!criteriaForm.startOfEra || !criteriaForm.endOfEra) return;
      payload.startOfEra = criteriaForm.startOfEra;
      payload.endOfEra   = criteriaForm.endOfEra;
      payload.threshold  = parseInt(criteriaForm.threshold) || 1;
    }

    if (payload.threshold <= 0) {
      window.dispatchEvent(new CustomEvent('cinelog-toast', { detail: { type: 'error', message: 'Requirement threshold must be at least 1' } }));
      return;
    }

    const res = await api.post(`/clubs/${selected.clubID}/criteria`, payload).catch(err => err.response);
    if (res?.data?.error) {
      window.dispatchEvent(new CustomEvent('cinelog-toast', { detail: { type: 'error', message: res.data.error } }));
      return;
    }
    setShowCriteriaForm(false);
    setCriteriaForm({ type:'genre', genreName:'', threshold:1, creatorID:'', startOfEra:'', endOfEra:'' });
    const r = await api.get(`/clubs/${selected.clubID}/criteria`).catch(() => ({ data: [] }));
    setCriteria(Array.isArray(r.data) ? r.data : []);
  };

  const deleteCriterion = async (criteriaID) => {
    await api.delete(`/clubs/${selected.clubID}/criteria/${criteriaID}`).catch(() => {});
    const r = await api.get(`/clubs/${selected.clubID}/criteria`).catch(() => ({ data: [] }));
    setCriteria(Array.isArray(r.data) ? r.data : []);
  };

  // ── Club creation ─────────────────────────────────────────────────────────
  const createClub = async () => {
    if (!newClubTitle.trim()) return;
    await api.post('/clubs', { title: newClubTitle }).catch(() => { });
    setNewClubTitle(''); setCreatingClub(false); loadAll();
  };

  // ── Challenge join ────────────────────────────────────────────────────────
  const joinChallenge = async (e, cid) => {
    e.stopPropagation();
    if (challengeJoined[cid]) return; // already joined
    // Optimistic
    setChallengeJoined(s => ({ ...s, [cid]: true }));
    setChallenges(prev => prev.map(c =>
      c.challengeID === cid ? { ...c, numOfMembers: (c.numOfMembers || 0) + 1 } : c
    ));
    const res = await api.post(`/challenges/${cid}/join`).catch(err => {
      // Rollback on error
      setChallengeJoined(s => ({ ...s, [cid]: false }));
      setChallenges(prev => prev.map(c =>
        c.challengeID === cid ? { ...c, numOfMembers: Math.max(0, (c.numOfMembers || 1) - 1) } : c
      ));
      return null;
    });
    if (res === null) return;
    // Refresh members panel if that challenge is expanded
    if (expandedChallenge === cid) {
      const r = await api.get(`/challenges/${cid}/members`).catch(() => ({ data: [] }));
      setChallengeMembers(m => ({ ...m, [cid]: Array.isArray(r.data) ? r.data : [] }));
    }
  };

  // ── Challenge creation ────────────────────────────────────────────────────
  const createChallenge = async () => {
    if (!selected || !challengeForm.title || !challengeForm.startDate || !challengeForm.endDate || !challengeForm.badgeName) return;
    if (challengeForm.mode === 'specific' && chSelectedContent.length === 0) return;
    if (challengeForm.mode === 'type_based' && !challengeForm.contentType) return;

    const payload = {
      title: challengeForm.title, clubID: selected.clubID,
      startDate: challengeForm.startDate, endDate: challengeForm.endDate,
      badgeName: challengeForm.badgeName, badgeExplanation: challengeForm.badgeExplanation,
    };
    if (challengeForm.mode === 'specific') {
      payload.contentIDs = chSelectedContent.map(c => c.contentID);
    } else {
      payload.contentType = challengeForm.contentType;
      payload.requiredCount = parseInt(challengeForm.requiredCount, 10);
      if (challengeForm.genre.trim()) payload.genre = challengeForm.genre.trim();
      
      if (payload.requiredCount <= 0 || isNaN(payload.requiredCount)) {
        window.dispatchEvent(new CustomEvent('cinelog-toast', { detail: { type: 'error', message: 'Required count must be at least 1' } }));
        return;
      }
    }

    const res = await api.post('/challenges', payload).catch(err => err.response);
    if (res?.data?.error) {
      window.dispatchEvent(new CustomEvent('cinelog-toast', { detail: { type: 'error', message: res.data.error } }));
      return;
    }
    setChallengeForm({ title: '', startDate: '', endDate: '', badgeName: '', badgeExplanation: '', mode: 'specific', contentType: 'Movie', genre: '', requiredCount: 1 });
    setChSelectedContent([]); setChContentSearch('');
    setCreatingChallenge(false);
    const r = await api.get('/challenges', { params: { clubID: selected.clubID } }).catch(() => ({ data: [] }));
    setChallenges(Array.isArray(r.data) ? r.data : []);
  };

  // ── Watch party join / leave ──────────────────────────────────────────────
  const joinLeaveParty = async (party) => {
    const wasJoined = !!partyJoined[party.partyID];
    // Optimistic: flip join state and adjust seat count
    setPartyJoined(s => ({ ...s, [party.partyID]: !wasJoined }));
    setParties(prev => prev.map(p =>
      p.partyID === party.partyID
        ? { ...p, joined: wasJoined ? Math.max(0, p.joined - 1) : p.joined + 1 }
        : p
    ));
    if (wasJoined) {
      await api.delete(`/watchparties/${party.partyID}/leave`).catch(() => {
        // Rollback
        setPartyJoined(s => ({ ...s, [party.partyID]: true }));
        setParties(prev => prev.map(p => p.partyID === party.partyID ? { ...p, joined: p.joined + 1 } : p));
      });
    } else {
      const res = await api.post(`/watchparties/${party.partyID}/join`).catch(err => err.response);
      if (res?.data?.error) {
        // Rollback
        setPartyJoined(s => ({ ...s, [party.partyID]: false }));
        setParties(prev => prev.map(p => p.partyID === party.partyID ? { ...p, joined: Math.max(0, p.joined - 1) } : p));
        return;
      }
    }
  };

  // ── Watch party creation ──────────────────────────────────────────────────
  const createParty = async () => {
    setPartyError('');
    if (!partyForm.contentID || !partyForm.dateDate || !partyForm.dateTime || !partyForm.authorizedCinema || !partyForm.capacity) {
      setPartyError('All fields are required.'); return;
    }
    const selectedDateTime = new Date(`${partyForm.dateDate}T${partyForm.dateTime}`);
    if (selectedDateTime < new Date()) {
      setPartyError('Watch party cannot be scheduled in the past.'); return;
    }
    await api.post('/watchparties', {
      contentID: partyForm.contentID, clubID: selected.clubID,
      date: `${partyForm.dateDate} ${partyForm.dateTime}:00`, authorizedCinema: partyForm.authorizedCinema,
      capacity: parseInt(partyForm.capacity),
    }).catch(() => { });
    setPartyForm({ contentID: null, dateDate: '', dateTime: '', authorizedCinema: '', capacity: '' });
    setCreatingParty(false);
    // Refresh parties list only
    const allRes = await api.get('/watchparties').catch(() => ({ data: [] }));
    const allParties = Array.isArray(allRes.data) ? allRes.data : [];
    const clubParties = allParties.filter(p => p.clubID === selected.clubID);
    setParties(clubParties);
    // Fetch join status for any new parties
    const pj = { ...partyJoined };
    await Promise.all(clubParties.map(async p => {
      if (pj[p.partyID] === undefined) {
        const r = await api.get(`/watchparties/${p.partyID}/status`).catch(() => ({ data: { joined: false } }));
        pj[p.partyID] = !!r.data.joined;
      }
    }));
    setPartyJoined(pj);
  };

  // ── Challenge expand (show members) ──────────────────────────────────────
  const toggleChallengeExpand = async (cid) => {
    if (expandedChallenge === cid) { setExpandedChallenge(null); return; }
    setExpandedChallenge(cid);
    if (!challengeMembers[cid]) {
      setChallengeMembersLoading(m => ({ ...m, [cid]: true }));
      const r = await api.get(`/challenges/${cid}/members`).catch(() => ({ data: [] }));
      setChallengeMembers(m => ({ ...m, [cid]: Array.isArray(r.data) ? r.data : [] }));
      setChallengeMembersLoading(m => ({ ...m, [cid]: false }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  const list = listTab === 'mine' ? mine : clubs;

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span className="spinner" /> Loading…
    </div>
  );

  return (
    <div style={{ padding: 36, animation: 'fadeInUp 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Clubs</h1>
          <div style={{ color: '#555', fontSize: 13 }}>Join communities · create challenges · host watch parties</div>
        </div>
        <button style={primaryBtn} onClick={() => setCreatingClub(true)}>+ Create Club</button>
      </div>

      {creatingClub && (
        <div style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 22, marginBottom: 24, animation: 'scaleIn 0.2s ease' }}>
          <div style={{ fontWeight: 800, color: '#c9a227', marginBottom: 14 }}>Create New Club</div>
          <input placeholder="Club name" value={newClubTitle} onChange={e => setNewClubTitle(e.target.value)} style={{ marginBottom: 14 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={primaryBtn} onClick={createClub}>Create</button>
            <button style={ghostBtn} onClick={() => { setCreatingClub(false); setNewClubTitle(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24 }}>
        {/* ── Club list ── */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
            {[['browse', 'All Clubs'], ['mine', 'My Clubs']].map(([t, l]) => (
              <button key={t} style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', color: listTab === t ? '#c9a227' : '#555', borderBottom: listTab === t ? '2px solid #c9a227' : '2px solid transparent', fontWeight: listTab === t ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setListTab(t)}>{l}</button>
            ))}
          </div>

          {list.length === 0
            ? <div style={{ color: '#555', fontSize: 13, padding: '20px 0' }}>{listTab === 'mine' ? "You haven't joined any clubs yet." : 'No clubs yet.'}</div>
            : list.map((club, i) => {
              const isSel    = selected?.clubID === club.clubID;
              const isMember = !!memberStatus[club.clubID];
              return (
                <div
                  key={club.clubID}
                  className="animate-fade-in"
                  style={{ background: isSel ? 'rgba(201,162,39,0.06)' : '#0f0f1a', border: `1px solid ${isSel ? 'rgba(201,162,39,0.35)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', animationDelay: `${i * 0.04}s` }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  onClick={() => selectClub(club)}
                >
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {club.title}
                      {club.hasCriteria > 0 && <span style={{ color: '#c9a227', fontSize: 10, marginLeft: 6 }}>🔑</span>}
                    </div>
                    <div style={{ color: '#555', fontSize: 11 }}>
                      👥 {club.numOfMembers} members{club.joinDate ? ` · Joined ${club.joinDate}` : ''}
                      {club.moderatorUsername && <span style={{ color: '#444', marginLeft: 6 }}>· 🛡 {club.moderatorUsername}</span>}
                    </div>
                  </div>
                  <button
                    style={{ background: isMember ? 'none' : 'linear-gradient(135deg,#c9a227,#e8c84a)', color: isMember ? '#aaa' : '#000', border: isMember ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 6, padding: '5px 12px', fontWeight: 700, fontSize: 11, flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={e => joinLeaveClub(e, club)}
                  >
                    {isMember ? 'Leave' : 'Join'}
                  </button>
                </div>
              );
            })
          }
        </div>

        {/* ── Detail panel ── */}
        <div style={{ flex: 1, background: '#0a0a14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 26, minHeight: 440 }}>
          {!selected ? (
            <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a3a', fontSize: 14 }}>
              Select a club to view details
            </div>
          ) : (
            <div style={{ animation: 'fadeInUp 0.28s ease' }}>
              {/* Club header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>{selected.title}</div>
                    {selected.moderatorUsername && (
                      <span style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                        🛡 {selected.moderatorUsername === currentUser?.username ? 'You moderate' : `Moderated by ${selected.moderatorUsername}`}
                      </span>
                    )}
                  </div>

                  {/* Criteria pills */}
                  {criteria.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {criteria.map((cr, i) => {
                        let label = '';
                        if (cr.type === 'genre')     label = `Watch ≥${cr.threshold} ${cr.genreName} films`;
                        if (cr.type === 'celebrity') label = `Watch ≥${cr.threshold} content by ${cr.creatorName}`;
                        if (cr.type === 'era')       label = `Watch ≥${cr.threshold} films from ${String(cr.startOfEra||'').slice(0,4)}–${String(cr.endOfEra||'').slice(0,4)}`;
                        return (
                          <div key={i} style={{ background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)', color: '#c9a227', fontSize: 11, padding: '3px 9px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                            🔑 {label}
                            {selected.moderatorUsername === currentUser?.username && (
                              <button onClick={() => deleteCriterion(cr.criteriaID)} style={{ background: 'none', border: 'none', color: '#e55', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Eligibility status (only when not a member) */}
                  {!memberStatus[selected.clubID] && eligibility && !eligibility.eligible && (
                    <div style={{ background: 'rgba(220,50,50,0.08)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                      <div style={{ color: '#e55', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Requirements not met:</div>
                      {eligibility.missing.map((m, i) => (
                        <div key={i} style={{ color: '#c88', fontSize: 12, marginBottom: 3 }}>• {m}</div>
                      ))}
                    </div>
                  )}
                  {!memberStatus[selected.clubID] && eligibility?.eligible && criteria.length > 0 && (
                    <div style={{ color: '#4caf50', fontSize: 12, marginBottom: 12 }}>✓ You meet all requirements to join</div>
                  )}

                  <div style={{ display: 'flex', gap: 28 }}>
                    {[
                      { n: selected.numOfMembers, l: 'MEMBERS' },
                      { n: challenges.length, l: 'CHALLENGES' },
                      { n: parties.length, l: 'PARTIES' },
                      { n: challenges.filter(c => c.groupProgress === 'Completed').length, l: 'COMPLETED' },
                    ].map(s => (
                      <div key={s.l} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#c9a227' }}>{s.n}</div>
                        <div style={{ fontSize: 9, color: '#555', letterSpacing: 1.5 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  {/* Club join/leave button in header */}
                  {(() => {
                    const isMember = !!memberStatus[selected.clubID];
                    const canJoin  = !isMember && (eligibility?.eligible !== false);
                    return (
                      <button
                        disabled={!isMember && eligibility?.eligible === false}
                        style={{
                          background: isMember ? 'none' : canJoin ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : '#1a1a2a',
                          color: isMember ? '#aaa' : canJoin ? '#000' : '#444',
                          border: isMember ? '1px solid rgba(255,255,255,0.1)' : canJoin ? 'none' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13,
                          cursor: (!isMember && !canJoin) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                        }}
                        onClick={e => joinLeaveClub(e, selected)}
                      >
                        {isMember ? 'Leave Club' : canJoin ? 'Join Club' : 'Requirements Not Met'}
                      </button>
                    );
                  })()}
                  {/* Moderator: add criteria button */}
                  {selected.moderatorUsername === currentUser?.username && !showCriteriaForm && (
                    <button
                      style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', color: '#c9a227', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setShowCriteriaForm(true)}
                    >
                      + Add Requirement
                    </button>
                  )}
                </div>
              </div>

              {/* Criterion creation form (moderator only) */}
              {showCriteriaForm && (
                <div style={{ background: '#141420', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 10, padding: 16, marginBottom: 18, animation: 'scaleIn 0.2s ease' }}>
                  <div style={{ fontWeight: 700, color: '#c9a227', marginBottom: 12, fontSize: 13 }}>Add Join Requirement</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {['genre','celebrity','era'].map(t => (
                      <button key={t} onClick={() => setCriteriaForm(f => ({ ...f, type: t }))} style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${criteriaForm.type === t ? 'rgba(201,162,39,0.5)' : 'rgba(255,255,255,0.08)'}`, background: criteriaForm.type === t ? 'rgba(201,162,39,0.12)' : 'transparent', color: criteriaForm.type === t ? '#c9a227' : '#666', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
                    ))}
                  </div>
                  {criteriaForm.type === 'genre' && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <select value={criteriaForm.genreName} onChange={e => setCriteriaForm(f => ({ ...f, genreName: e.target.value }))} style={{ flex: 2 }}>
                        <option value="" style={{ color: '#fff', background: '#141420' }}>Select Genre...</option>
                        {genres.map(g => <option key={g} value={g} style={{ color: '#fff', background: '#141420' }}>{g}</option>)}
                      </select>
                      <input type="number" min="1" placeholder="Min films" value={criteriaForm.threshold} onChange={e => setCriteriaForm(f => ({ ...f, threshold: e.target.value }))} style={{ flex: 1 }} />
                    </div>
                  )}
                  {criteriaForm.type === 'celebrity' && (
                    <div style={{ marginBottom: 12 }}>
                      <CreatorSearch onPick={cid => setCriteriaForm(f => ({ ...f, creatorID: cid }))} />
                      <input type="number" min="1" placeholder="Min content watched" value={criteriaForm.threshold} onChange={e => setCriteriaForm(f => ({ ...f, threshold: e.target.value }))} style={{ marginTop: 8, width: '100%' }} />
                    </div>
                  )}
                  {criteriaForm.type === 'era' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      <input type="date" placeholder="Start year" value={criteriaForm.startOfEra} onChange={e => setCriteriaForm(f => ({ ...f, startOfEra: e.target.value }))} />
                      <input type="date" placeholder="End year" value={criteriaForm.endOfEra} onChange={e => setCriteriaForm(f => ({ ...f, endOfEra: e.target.value }))} />
                      <input type="number" min="1" placeholder="Min films" value={criteriaForm.threshold} onChange={e => setCriteriaForm(f => ({ ...f, threshold: e.target.value }))} style={{ width: 100 }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={primaryBtn} onClick={addCriterion}>Add</button>
                    <button style={ghostBtn} onClick={() => setShowCriteriaForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Inner tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                {[
                  ['members', `Members (${members.length})`],
                  ['challenges', `Challenges (${challenges.length})`],
                  ['parties', `Watch Parties (${parties.length})`],
                  ['criteria', `Requirements (${criteria.length})`],
                ].map(([t, l]) => (
                  <button key={t} style={{ padding: '8px 18px', background: 'none', border: 'none', color: detailTab === t ? '#c9a227' : '#555', borderBottom: detailTab === t ? '2px solid #c9a227' : '2px solid transparent', fontWeight: detailTab === t ? 700 : 400, fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => { setDetailTab(t); setCreatingChallenge(false); setCreatingParty(false); }}>{l}</button>
                ))}
              </div>

              {detailLoading && <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#555' }}><span className="spinner" /> Loading…</div>}

              {/* ── Members tab ── */}
              {!detailLoading && detailTab === 'members' && (
                <div>
                  {members.length === 0
                    ? <div style={{ color: '#555', fontSize: 13 }}>No members yet.</div>
                    : members.map(m => {
                      const p = memberProfiles[m.userID];
                      const isMod = selected.moderatorID === m.userID;
                      return (
                        <div key={m.userID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isMod ? 'rgba(201,162,39,0.1)' : 'transparent', borderRadius: 8, marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#e8c84a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#000', flexShrink: 0 }}>{m.username?.[0]?.toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{m.username}</div>
                              <div style={{ color: '#555', fontSize: 11 }}>Joined {m.joinDate}</div>
                            </div>
                          </div>
                          {p && (
                            <div style={{ display: 'flex', gap: 20 }}>
                              {[{ n: p.watchedCount ?? 0, l: 'WATCHED' }, { n: fmtScore(p.avgRating), l: 'AVG' }, { n: p.badgeCount ?? 0, l: 'BADGES' }, { n: p.clubCount ?? 0, l: 'CLUBS' }].map(s => (
                                <div key={s.l} style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 15, fontWeight: 800, color: '#c9a227' }}>{s.n}</div>
                                  <div style={{ fontSize: 9, color: '#444', letterSpacing: 1 }}>{s.l}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              )}

              {/* ── Challenges tab ── */}
              {!detailLoading && detailTab === 'challenges' && (
                <div>
                  {!creatingChallenge && selected.moderatorID === currentUser?.userID && (
                    <button style={{ ...primaryBtn, marginBottom: 18, fontSize: 12 }} onClick={() => setCreatingChallenge(true)}>+ Create Challenge</button>
                  )}
                  {creatingChallenge && (
                    <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 18, marginBottom: 18, animation: 'scaleIn 0.2s ease' }}>
                      <div style={{ fontWeight: 700, color: '#c9a227', marginBottom: 14, fontSize: 14 }}>New Challenge for "{selected.title}"</div>

                      {/* Title + dates */}
                      <input placeholder="Challenge title" value={challengeForm.title} onChange={e => setChallengeForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', marginBottom: 12 }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>START DATE</div>
                          <input type="date" value={challengeForm.startDate} onChange={e => setChallengeForm(f => ({ ...f, startDate: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>END DATE</div>
                          <input type="date" value={challengeForm.endDate} onChange={e => setChallengeForm(f => ({ ...f, endDate: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                      </div>

                      {/* Badge */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: '#c9a227', letterSpacing: 1, marginBottom: 10 }}>BADGE (auto-awarded on completion)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>BADGE NAME *</div>
                            <input placeholder="e.g. Sci-Fi Connoisseur" value={challengeForm.badgeName} onChange={e => setChallengeForm(f => ({ ...f, badgeName: e.target.value }))} style={{ width: '100%' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>BADGE DESCRIPTION (optional)</div>
                            <input placeholder="What this badge represents" value={challengeForm.badgeExplanation} onChange={e => setChallengeForm(f => ({ ...f, badgeExplanation: e.target.value }))} style={{ width: '100%' }} />
                          </div>
                        </div>
                      </div>

                      {/* Challenge type */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 10 }}>CHALLENGE TYPE</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                          {[['specific', 'Specific Titles'], ['type_based', 'By Type / Count']].map(([v, l]) => (
                            <button key={v} onClick={() => setChallengeForm(f => ({ ...f, mode: v }))} style={{
                              padding: '6px 14px', borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: 'pointer',
                              background: challengeForm.mode === v ? 'linear-gradient(135deg,#c9a227,#e8c84a)' : 'rgba(255,255,255,0.04)',
                              color: challengeForm.mode === v ? '#000' : '#666',
                              border: challengeForm.mode === v ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            }}>{l}</button>
                          ))}
                        </div>

                        {challengeForm.mode === 'specific' ? (
                          <div>
                            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 8 }}>SEARCH & SELECT TITLES (members must watch all)</div>
                            <div style={{ position: 'relative', marginBottom: 10 }}>
                              <input
                                placeholder="Search by title…"
                                value={chContentSearch}
                                onChange={e => setChContentSearch(e.target.value)}
                                style={{ width: '100%' }}
                              />
                              {(chContentResults.length > 0 || chSearching) && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                                  {chSearching ? (
                                    <div style={{ padding: '10px 14px', color: '#555', fontSize: 12 }}>Searching…</div>
                                  ) : chContentResults.map(item => (
                                    <div key={item.contentID}
                                      onClick={() => {
                                        if (!chSelectedContent.find(c => c.contentID === item.contentID))
                                          setChSelectedContent(s => [...s, item]);
                                        setChContentSearch(''); setChContentResults([]);
                                      }}
                                      style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}
                                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.08)'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <span>{item.title}</span>
                                      <span style={{ color: '#555', fontSize: 10 }}>{item.contentType} · {item.genre}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {chSelectedContent.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {chSelectedContent.map(item => (
                                  <div key={item.contentID} style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 16, padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: '#c9a227' }}>{item.title}</span>
                                    <button onClick={() => setChSelectedContent(s => s.filter(c => c.contentID !== item.contentID))} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            <div>
                              <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>CONTENT TYPE</div>
                              <select value={challengeForm.contentType} onChange={e => setChallengeForm(f => ({ ...f, contentType: e.target.value }))} style={{ width: '100%' }}>
                                {['Movie', 'Series', 'LiveStream', 'ShortContent'].map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>GENRE (optional)</div>
                              <select value={challengeForm.genre} onChange={e => setChallengeForm(f => ({ ...f, genre: e.target.value }))} style={{ width: '100%' }}>
                                <option value="" style={{ color: '#fff', background: '#141420' }}>Any Genre</option>
                                {genres.map(g => <option key={g} value={g} style={{ color: '#fff', background: '#141420' }}>{g}</option>)}
                              </select>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>REQUIRED COUNT</div>
                              <input type="number" min="1" value={challengeForm.requiredCount} onChange={e => setChallengeForm(f => ({ ...f, requiredCount: e.target.value }))} style={{ width: '100%' }} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button style={primaryBtn} onClick={createChallenge}>Create</button>
                        <button style={ghostBtn} onClick={() => { setCreatingChallenge(false); setChallengeForm({ title: '', startDate: '', endDate: '', badgeName: '', badgeExplanation: '', mode: 'specific', contentType: 'Movie', genre: '', requiredCount: 1 }); setChSelectedContent([]); setChContentSearch(''); }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {challenges.length === 0
                    ? <div style={{ color: '#555', fontSize: 13 }}>No challenges for this club yet.</div>
                    : challenges.map(c => {
                      const isExp    = expandedChallenge === c.challengeID;
                      const isJoined = !!challengeJoined[c.challengeID];
                      const cMembers = challengeMembers[c.challengeID] || [];
                      const cLoading = !!challengeMembersLoading[c.challengeID];
                      return (
                        <div key={c.challengeID} style={{ background: '#141420', border: `1px solid ${isExp ? 'rgba(201,162,39,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, marginBottom: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                          <div
                            style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                            onClick={() => toggleChallengeExpand(c.challengeID)}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{c.title}</div>
                              <div style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>
                                📅 {c.startDate} → {c.endDate}
                                <span style={{ marginLeft: 10 }}>👥 {c.numOfMembers} participants</span>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor(c.groupProgress) }}>● {c.groupProgress || 'Not Started'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                              {isJoined ? (
                                <span style={{ background: 'rgba(76,175,80,0.12)', color: '#4caf50', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(76,175,80,0.3)' }}>✓ Joined</span>
                              ) : (
                                <button
                                  style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a)', border: 'none', borderRadius: 6, padding: '5px 12px', fontWeight: 700, fontSize: 11, color: '#000', cursor: 'pointer' }}
                                  onClick={e => joinChallenge(e, c.challengeID)}
                                >
                                  Join
                                </button>
                              )}
                              <span style={{ color: '#444', fontSize: 13, transition: 'transform 0.2s', display: 'inline-block', transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                            </div>
                          </div>

                          {isExp && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0f0f1a', padding: '14px 16px', animation: 'fadeInUp 0.2s ease' }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 12 }}>PARTICIPANTS ({cMembers.length})</div>
                              {cLoading ? (
                                <div style={{ display: 'flex', gap: 8, color: '#555', fontSize: 12 }}><span className="spinner" style={{ width: 14, height: 14 }} /> Loading…</div>
                              ) : cMembers.length === 0 ? (
                                <div style={{ color: '#555', fontSize: 12 }}>No participants yet.</div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                                  {cMembers.map(m => (
                                    <div key={m.userID} style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#e8c84a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000', flexShrink: 0 }}>{m.username?.[0]?.toUpperCase()}</div>
                                        <div>
                                          <div style={{ fontWeight: 700, fontSize: 12 }}>{m.username}</div>
                                          <div style={{ color: '#555', fontSize: 10 }}>{m.joinDate}</div>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 10, color: '#555' }}>Progress</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#c9a227' }}>{m.progress != null ? parseFloat(m.progress).toFixed(0) : 0}%</span>
                                      </div>
                                      <div style={{ background: '#1a1a2a', borderRadius: 3, height: 3, overflow: 'hidden' }}>
                                        <div style={{ background: 'linear-gradient(90deg,#c9a227,#e8c84a)', height: '100%', width: `${m.progress != null ? parseFloat(m.progress) : 0}%` }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              )}

              {/* ── Requirements tab ── */}
              {!detailLoading && detailTab === 'criteria' && (
                <div>
                  {criteria.length === 0 ? (
                    <div style={{ color: '#555', fontSize: 13 }}>
                      No join requirements set. Anyone can join this club.
                    </div>
                  ) : (
                    criteria.map((cr, i) => {
                      let desc = '';
                      if (cr.type === 'genre')     desc = `Must have watched at least ${cr.threshold} ${cr.genreName} film(s)`;
                      if (cr.type === 'celebrity') desc = `Must have watched at least ${cr.threshold} content featuring ${cr.creatorName}`;
                      if (cr.type === 'era')       desc = `Must have watched at least ${cr.threshold} film(s) released between ${String(cr.startOfEra||'').slice(0,10)} and ${String(cr.endOfEra||'').slice(0,10)}`;
                      return (
                        <div key={i} style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ color: '#c9a227', fontSize: 11, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{cr.type} requirement</div>
                            <div style={{ color: '#ddd', fontSize: 13 }}>{desc}</div>
                          </div>
                          {selected.moderatorUsername === currentUser?.username && (
                            <button onClick={() => deleteCriterion(cr.criteriaID)} style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.2)', color: '#e55', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Remove</button>
                          )}
                        </div>
                      );
                    })
                  )}
                  {selected.moderatorUsername === currentUser?.username && !showCriteriaForm && (
                    <button style={{ ...primaryBtn, marginTop: 12, fontSize: 12 }} onClick={() => setShowCriteriaForm(true)}>+ Add Requirement</button>
                  )}
                </div>
              )}

              {/* ── Watch Parties tab ── */}
              {!detailLoading && detailTab === 'parties' && (
                <div>
                  {!creatingParty && selected.moderatorID === currentUser?.userID && (
                    <button style={{ ...primaryBtn, marginBottom: 18, fontSize: 12 }} onClick={() => setCreatingParty(true)}>+ Create Watch Party</button>
                  )}
                  {creatingParty && (
                    <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 18, marginBottom: 18, animation: 'scaleIn 0.2s ease' }}>
                      <div style={{ fontWeight: 700, color: '#c9a227', marginBottom: 14, fontSize: 14 }}>New Watch Party for "{selected.title}"</div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>CONTENT</div>
                        <ContentSearch onPick={cid => setPartyForm(f => ({ ...f, contentID: cid }))} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>DATE & TIME</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="date" min={new Date().toISOString().split('T')[0]} value={partyForm.dateDate} onChange={e => setPartyForm(f => ({ ...f, dateDate: e.target.value }))} style={{ flex: 1 }} />
                          <input type="time" value={partyForm.dateTime} onChange={e => setPartyForm(f => ({ ...f, dateTime: e.target.value }))} style={{ flex: 1 }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>CINEMA</div>
                          <input placeholder="Cinema name" value={partyForm.authorizedCinema} onChange={e => setPartyForm(f => ({ ...f, authorizedCinema: e.target.value }))} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 6 }}>CAPACITY</div>
                          <input type="number" placeholder="Seats" value={partyForm.capacity} onChange={e => setPartyForm(f => ({ ...f, capacity: e.target.value }))} />
                        </div>
                      </div>
                      {partyError && <div style={{ color: '#e55', fontSize: 12, marginBottom: 10 }}>{partyError}</div>}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button style={primaryBtn} onClick={createParty}>Create</button>
                        <button style={ghostBtn} onClick={() => { setCreatingParty(false); setPartyForm({ contentID: null, dateDate: '', dateTime: '', authorizedCinema: '', capacity: '' }); setPartyError(''); }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {parties.length === 0
                    ? <div style={{ color: '#555', fontSize: 13 }}>No upcoming watch parties for this club.</div>
                    : parties.map(p => {
                      const isJoined = !!partyJoined[p.partyID];
                      const pct  = p.capacity > 0 ? (p.joined / p.capacity) * 100 : 0;
                      const full = !isJoined && p.joined >= p.capacity;
                      return (
                        <div key={p.partyID} style={{ background: '#141420', border: `1px solid ${isJoined ? 'rgba(201,162,39,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10, transition: 'border-color 0.2s' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                              <div style={{ color: '#c9a227', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>📍 {p.authorizedCinema}</div>
                              <div style={{ color: '#555', fontSize: 12, marginBottom: 10 }}>
                                🗓 {p.date?.replace('T', ' ')}
                                <span style={{ marginLeft: 10 }}>🎟 {p.joined}/{p.capacity} seats</span>
                                {full && <span style={{ color: '#e55', marginLeft: 6, fontWeight: 700 }}>FULL</span>}
                              </div>
                              <div style={{ background: '#1a1a2a', borderRadius: 4, height: 4, overflow: 'hidden', maxWidth: 200 }}>
                                <div style={{ background: full ? '#e55' : 'linear-gradient(90deg,#c9a227,#e8c84a)', height: '100%', width: `${Math.min(100, pct)}%`, transition: 'width 0.3s' }} />
                              </div>
                            </div>
                            <button
                              disabled={full}
                              style={{ background: isJoined ? 'none' : full ? '#1a1a2a' : 'linear-gradient(135deg,#c9a227,#e8c84a)', color: isJoined ? '#aaa' : full ? '#444' : '#000', border: isJoined ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 7, padding: '7px 16px', fontWeight: 700, fontSize: 12, cursor: full ? 'default' : 'pointer', flexShrink: 0, marginLeft: 14, transition: 'all 0.2s' }}
                              onClick={() => joinLeaveParty(p)}
                            >
                              {isJoined ? 'Leave' : full ? 'Full' : 'Join'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
