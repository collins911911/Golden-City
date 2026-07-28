import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = ({ unviewedPosts = 0 }) => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const adminLinks = [
    { label: 'Dashboard',  path: '/admin-dashboard' },
    { label: 'Messages',   path: '/admin-messages' },
    { label: 'Members',    path: '/admin-members' },
    { label: 'Posts',      path: '/admin-posts' },
    { label: 'Agenda',     path: '/admin-agenda' },
    { label: 'Notice',     path: '/admin-notice' },
    { label: 'Activities', path: '/admin-activities' },
  ];

  const memberLinks = [
    { label: 'Dashboard',  path: '/member-dashboard' },
    { label: 'Posts',      path: '/member-posts',    dot: unviewedPosts > 0 },
    { label: 'Events',     path: '/member-events' },
    { label: 'Notice',     path: '/member-notice' },
    { label: 'Activities', path: '/member-activities' },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-yellow-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <button
          onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/member-dashboard')}
          className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow">
            <svg viewBox="0 0 64 64" className="w-5 h-5" fill="none">
              <rect x="28" y="6" width="8" height="52" rx="3" fill="white" />
              <rect x="12" y="18" width="40" height="8" rx="3" fill="white" />
            </svg>
          </div>
          <span className="text-base font-bold text-yellow-800 tracking-widest uppercase hidden sm:block"
            style={{ fontFamily: "'Cinzel', serif" }}>
            Golden City
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <button key={link.path} onClick={() => navigate(link.path)}
              className={`relative px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all duration-150 ${
                location.pathname === link.path
                  ? 'bg-yellow-500 text-white shadow'
                  : 'text-yellow-700 hover:bg-yellow-50 hover:text-yellow-900'
              }`}
              style={{ fontFamily: "'Cinzel', serif" }}>
              {link.label}
              {/* Red dot for unviewed posts */}
              {link.dot && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Right — user + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-yellow-800" style={{ fontFamily: "'Cinzel', serif" }}>
                {user.name}
              </span>
              {user.title && (
                <span className="text-[10px] text-yellow-500 uppercase tracking-wider">{user.title}</span>
              )}
            </div>
          )}
          <button onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-yellow-300 text-yellow-700 text-xs font-bold uppercase tracking-widest hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all duration-200"
            style={{ fontFamily: "'Cinzel', serif" }}>
            Logout
          </button>

          {/* Mobile menu */}
          <button className="md:hidden p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"
            onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-yellow-100 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <button key={link.path}
              onClick={() => { navigate(link.path); setMenuOpen(false); }}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest text-left transition-all ${
                location.pathname === link.path
                  ? 'bg-yellow-500 text-white'
                  : 'text-yellow-700 hover:bg-yellow-50'
              }`}
              style={{ fontFamily: "'Cinzel', serif" }}>
              {link.label}
              {link.dot && (
                <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');`}</style>
    </nav>
  );
};

export default Navbar;
