import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

// Live badge counts: admins → pending registrations, members → unseen posts.
// Refreshes every 60 seconds and when the tab is opened again.
const useBadgeCount = (isAdmin) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = isAdmin
          ? await axios.get('/registrations/count')
          : await axios.get('/posts/unviewed-count');
        if (alive) setCount(isAdmin ? res.data.pending : res.data.count);
      } catch { /* badge is optional */ }
    };
    load();
    const timer = setInterval(load, 60000);
    const onFocus = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('gc:badge-refresh', load);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('gc:badge-refresh', load);
    };
  }, [isAdmin]);
  return count;
};

const Badge = ({ count }) => (count > 0 ? (
  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
    {count > 9 ? '9+' : count}
  </span>
) : null);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const badge   = useBadgeCount(isAdmin);

  const adminLinks = [
    { label: 'Dashboard',     path: '/admin-dashboard' },
    { label: 'Registrations', path: '/admin-registrations', badge },
    { label: 'Messages',      path: '/admin-messages' },
    { label: 'Members',       path: '/admin-members' },
    { label: 'Posts',         path: '/admin-posts' },
    { label: 'Agenda',        path: '/admin-agenda' },
    { label: 'Notice',        path: '/admin-notice' },
    { label: 'Activities',    path: '/admin-activities' },
  ];

  const memberLinks = [
    { label: 'Dashboard',  path: '/member-dashboard' },
    { label: 'Posts',      path: '/member-posts', badge },
    { label: 'Events',     path: '/member-events' },
    { label: 'Notice',     path: '/member-notice' },
    { label: 'Activities', path: '/member-activities' },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

  const go = (path) => { navigate(path); setMenuOpen(false); };
  const handleLogout = () => {
    logout();
    navigate(isAdmin ? '/gc-admin' : '/member-login', { replace: true });
  };

  return (
    <nav className="font-sans sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-yellow-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <button onClick={() => go(isAdmin ? '/admin-dashboard' : '/member-dashboard')}
          className="flex items-center gap-2.5" aria-label="Home">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow">
            <svg viewBox="0 0 64 64" className="w-5 h-5" fill="none">
              <rect x="28" y="6" width="8" height="52" rx="3" fill="white" />
              <rect x="12" y="18" width="40" height="8" rx="3" fill="white" />
            </svg>
          </div>
          <span className="font-display text-base font-bold text-yellow-800 tracking-widest uppercase hidden sm:block">
            Golden City
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <button key={link.path} onClick={() => go(link.path)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-yellow-500 text-white shadow'
                  : 'text-yellow-800 hover:bg-yellow-50'
              }`}>
              {link.label}
              <Badge count={link.badge} />
            </button>
          ))}
        </div>

        {/* Right — user + logout + menu */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-yellow-900">{user.name}</span>
              {user.title && <span className="text-xs text-yellow-600">{user.title}</span>}
            </div>
          )}
          <button onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-yellow-300 text-yellow-800 text-sm font-medium hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-colors">
            Logout
          </button>

          <button className="relative lg:hidden p-2 rounded-lg hover:bg-yellow-50 text-yellow-700"
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
            {!menuOpen && <Badge count={badge} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-t border-yellow-100 bg-white px-4 py-3 grid grid-cols-2 gap-2">
          {links.map((link) => (
            <button key={link.path} onClick={() => go(link.path)}
              className={`relative px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
                location.pathname === link.path ? 'bg-yellow-500 text-white' : 'text-yellow-800 bg-yellow-50/60 hover:bg-yellow-100'
              }`}>
              {link.label}
              {link.badge > 0 && (
                <span className="ml-2 inline-flex min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full text-[11px] font-bold text-white items-center justify-center">
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
