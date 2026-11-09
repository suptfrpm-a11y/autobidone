import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Catches any crash so the user never sees a blank white page.
// A crash right after sign-in is fixed by one reload, so we reload once automatically
// and show the real error message if it happens again.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[AutoBid] App crashed:', error);
    try {
      const last = Number(sessionStorage.getItem('autobid_last_reload') || 0);
      if (Date.now() - last > 15000) {
        sessionStorage.setItem('autobid_last_reload', String(Date.now()));
        window.location.reload();
      }
    } catch {
      /* storage unavailable: just show the message */
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif', textAlign: 'center', color: '#374151' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 13, marginBottom: 16, maxWidth: 480, wordBreak: 'break-word' }}>
            {String(this.state.error.message || this.state.error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#dc2626', color: '#fff', border: 0, borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
