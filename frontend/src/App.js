import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import GlobalToast from './components/GlobalToast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Browse from './pages/Browse';
import ContentDetail from './pages/ContentDetail';
import WatchHistory from './pages/WatchHistory';
import Watchlists from './pages/Watchlists';
import Feed from './pages/Feed';
import Social from './pages/Social';
import Clubs from './pages/Clubs';
import Reviews from './pages/Reviews';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import People from './pages/People';
import CreatorProfile from './pages/CreatorProfile';
import Admin from './pages/Admin';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#c9a227', fontWeight: 900, fontSize: 22, letterSpacing: 3, marginBottom: 20, textShadow: '0 0 20px rgba(201,162,39,0.4)' }}>CINÉLOG</div>
        <span className="spinner" />
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/browse" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalToast />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/browse" replace />} />
            <Route path="browse" element={<Browse />} />
            <Route path="content/:id" element={<ContentDetail />} />
            <Route path="history" element={<WatchHistory />} />
            <Route path="watchlists" element={<Watchlists />} />
            <Route path="feed" element={<Feed />} />
            <Route path="social" element={<Social />} />
            <Route path="clubs" element={<Clubs />} />
            {/* Challenges and watch parties live inside clubs */}
            <Route path="watchparties" element={<Navigate to="/clubs" replace />} />
            <Route path="challenges" element={<Navigate to="/clubs" replace />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="badges" element={<Badges />} />
            <Route path="profile" element={<Profile />} />
            <Route path="people" element={<People />} />
            <Route path="creators/:id" element={<CreatorProfile />} />
            <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
