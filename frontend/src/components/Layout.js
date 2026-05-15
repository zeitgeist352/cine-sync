import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/browse',      label: 'Browse',       icon: '🎬' },
  { to: '/history',     label: 'Watch History', icon: '📖' },
  { to: '/watchlists',  label: 'Watchlists',   icon: '📋' },
  { to: '/feed',        label: 'My Feed',      icon: '✨' },
  { to: '/social',      label: 'Social',       icon: '👥' },
  { to: '/clubs',       label: 'Clubs',        icon: '🎭', note: 'Challenges & Parties' },
  { to: '/people',      label: 'People',       icon: '🎥' },
  { to: '/reviews',     label: 'Reviews',      icon: '⭐' },
  { to: '/badges',      label: 'Badges',       icon: '🏅' },
  { to: '/profile',     label: 'Profile',      icon: '👤' },
];

const ADMIN_NAV = { to: '/admin', label: 'Admin Panel', icon: '🛡️' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = user?.role === 'admin' ? [...NAV, ADMIN_NAV] : NAV;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810' }}>
      {/* Sidebar */}
      <aside style={{
        width: 230,
        background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a14 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto', flexShrink: 0,
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '28px 20px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, transparent 100%)',
        }}>
          <div style={{
            color: '#c9a227', fontWeight: 900, fontSize: 22, letterSpacing: 3,
            textShadow: '0 0 20px rgba(201,162,39,0.4)',
          }}>
            CINÉLOG
          </div>
          <div style={{ color: '#444', fontSize: 9, fontWeight: 600, letterSpacing: 2, marginTop: 3 }}>
            DISCOVERY PLATFORM
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {navItems.map((n, i) => (
            <NavLink
              key={n.to}
              to={n.to}
              onMouseEnter={() => setHoveredLink(n.to)}
              onMouseLeave={() => setHoveredLink(null)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 20px',
                color: isActive
                  ? (n.to === '/admin' ? '#e55' : '#c9a227')
                  : hoveredLink === n.to ? '#ddd' : '#888',
                background: isActive
                  ? (n.to === '/admin'
                    ? 'linear-gradient(90deg, rgba(220,50,50,0.1) 0%, transparent 100%)'
                    : 'linear-gradient(90deg, rgba(201,162,39,0.12) 0%, transparent 100%)')
                  : hoveredLink === n.to
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
                borderLeft: `3px solid ${isActive ? (n.to === '/admin' ? '#e55' : '#c9a227') : 'transparent'}`,
                fontSize: 13, fontWeight: isActive ? 700 : 400,
                transition: 'all 0.18s ease',
                textDecoration: 'none',
                animation: `fadeInUp 0.3s ease ${i * 0.04}s both`,
              })}
            >
              <span style={{ fontSize: 15, opacity: 0.85 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div>{n.label}</div>
                {n.note && <div style={{ fontSize: 9, color: '#555', letterSpacing: 0.5, marginTop: 1 }}>{n.note}</div>}
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '14px 18px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(201,162,39,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: user?.role === 'admin'
                ? 'linear-gradient(135deg, #e55, #c33)'
                : 'linear-gradient(135deg, #c9a227, #e8c84a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 14, color: '#000',
              boxShadow: user?.role === 'admin'
                ? '0 2px 10px rgba(220,50,50,0.35)'
                : '0 2px 10px rgba(201,162,39,0.35)',
              flexShrink: 0,
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#ddd', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username}
              </div>
              <div style={{ color: user?.role === 'admin' ? '#e55' : '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                {user?.role || 'standard'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#666', fontSize: 12, padding: '6px 0',
              borderRadius: 6, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,85,85,0.1)'; e.currentTarget.style.color = '#e55'; e.currentTarget.style.borderColor = 'rgba(229,85,85,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowX: 'hidden', background: '#080810' }}>
        <Outlet />
      </main>
    </div>
  );
}
