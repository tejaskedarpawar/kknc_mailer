import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PenLine, Send as SendIcon, Settings, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import ComposePage from './pages/ComposePage';
import SentPage from './pages/SentPage';
import SettingsPage from './pages/SettingsPage';
import { getStatus } from './services/api';

function App() {
  const [devMode, setDevMode] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkStatus = () => {
      getStatus()
        .then((res: any) => {
          if (!mounted) return;
          setDevMode(!!res.developmentMode);
          setServerOnline(true);
        })
        .catch(() => {
          if (!mounted) return;
          setServerOnline(false);
        });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    window.addEventListener('focus', checkStatus);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', checkStatus);
    };
  }, []);

  const navLink = (to: string, label: string, Icon: any) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 text-sm transition-colors rounded-lg ${
          isActive
            ? 'text-gold bg-gold/10'
            : 'text-text-secondary hover:text-text hover:bg-surface-hover'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg">
        {/* Top Nav */}
        <header className="h-16 border-b border-border bg-surface flex items-center px-6 justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold/15 rounded-lg flex items-center justify-center">
                <span className="text-gold font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-text leading-tight">KKNC Mailer</h1>
                <p className="text-[10px] text-text-muted tracking-wider uppercase">Internal Tool</p>
              </div>
            </div>

            <div className="w-px h-8 bg-border" />

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {navLink('/', 'Compose', PenLine)}
              {navLink('/sent', 'Sent', SendIcon)}
              {navLink('/settings', 'Settings', Settings)}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!serverOnline ? (
              <span className="flex items-center gap-1.5 text-xs text-error">
                <AlertTriangle size={13} />
                Server Offline
              </span>
            ) : devMode ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 text-warning text-xs rounded-full">
                <AlertTriangle size={12} />
                Dev Mode
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live SMTP
              </span>
            )}
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<ComposePage />} />
          <Route path="/sent" element={<SentPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
