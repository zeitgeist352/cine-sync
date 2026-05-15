import React, { useState, useEffect } from 'react';

export default function GlobalToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { type, message } = e.detail;
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, type, message }]);
      
      // Auto-remove toast after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    window.addEventListener('cinelog-toast', handleToast);
    return () => window.removeEventListener('cinelog-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      zIndex: 99999
    }}>
      {toasts.map(t => (
        <div key={t.id} className="animate-slide-r" style={{
          background: t.type === 'error' ? 'rgba(220, 50, 50, 0.95)' : 'rgba(201, 162, 39, 0.95)',
          color: t.type === 'error' ? '#fff' : '#111',
          padding: '14px 20px',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontWeight: 600,
          fontSize: 14,
          minWidth: 240,
          maxWidth: 350,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          border: `1px solid ${t.type === 'error' ? 'rgba(255, 100, 100, 0.5)' : 'rgba(255, 220, 100, 0.5)'}`
        }}>
          <span style={{ fontSize: 20 }}>{t.type === 'error' ? '⚠️' : '✅'}</span>
          <span style={{ lineHeight: 1.4 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
