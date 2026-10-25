import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';
import LiveClock from '../../components/LiveClock';
import usePushNotifications from '../../hooks/usePushNotifications';

const CATEGORIES = [
  { id: 'men',              label: 'Men',                      emoji: '👨' },
  { id: 'women',            label: 'Women',                    emoji: '👩' },
  { id: 'youths',           label: 'Youths',                   emoji: '🧑' },
  { id: 'men-excos',        label: 'Men Excos',                emoji: '👔' },
  { id: 'women-excos',      label: 'Women Excos',              emoji: '👗' },
  { id: 'youth-excos',      label: 'Youth Excos',              emoji: '🎓' },
  { id: 'workers',          label: 'Workers',                  emoji: '🛠️' },
  { id: 'ffcc',             label: 'FFCC',                     emoji: '✝️' },
  { id: 'church-committee', label: 'Church Committee',         emoji: '📋' },
  { id: 'choir',            label: 'Choir & Instrumentalists', emoji: '🎵' },
];

const TOP_GROUPS = [
  { id: 'men',    label: 'Men',    emoji: '👨' },
  { id: 'women',  label: 'Women',  emoji: '👩' },
  { id: 'youths', label: 'Youths', emoji: '🧑' },
];

const AdminDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [stats, setStats]     = useState({});
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [postCount, setPostCount] = useState(0);
  usePushNotifications(); // admins get "new registration" alerts

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, postsRes] = await Promise.all([
          axios.get('/admin/stats'),
          axios.get('/posts?limit=1'),
        ]);
        setStats(statsRes.data);
        setPostCount(postsRes.data.total || 0);
      } catch { /* dashboard still shows */ }
      finally { setLoading(false); setTimeout(() => setVisible(true), 80); }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingScreen />;

  const totalMembers = stats.totalMembers || 0;


  return (
    <div className="min-h-screen bg-[#FDFBF5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <Navbar />

      {/* Hero Banner */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C5A00 0%, #B8860B 35%, #DAA520 65%, #C8960A 100%)', minHeight: '320px' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full border-[40px] border-white -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full border-[30px] border-white translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border-[20px] border-white -translate-y-1/2" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-60" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left */}
          <div className={`flex items-center gap-6 transition-all duration-1000 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-30 blur-xl scale-125" />
              <div className="relative w-24 h-24 rounded-full border-4 border-yellow-200 bg-white/10 backdrop-blur flex items-center justify-center shadow-2xl"
                style={{ boxShadow: '0 0 40px rgba(255,215,0,0.4)' }}>
                <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
                  <rect x="28" y="4" width="8" height="56" rx="3" fill="white" />
                  <rect x="10" y="16" width="44" height="8" rx="3" fill="white" />
                  <circle cx="32" cy="8" r="4" fill="#DAA520" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-yellow-200 text-xs uppercase tracking-[0.35em] font-semibold mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Welcome, {user?.title || user?.name}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-none uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif", textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                Golden City
              </h1>
              <h2 className="text-xl md:text-2xl text-yellow-200 uppercase tracking-[0.25em] font-semibold"
                style={{ fontFamily: "'Cinzel', serif" }}>Church</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-px bg-yellow-300 opacity-60" />
                <p className="text-yellow-100 text-sm italic opacity-90"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem' }}>
                  "Raising a golden generation for God's Kingdom"
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className={`flex flex-col items-center md:items-end gap-3 transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="bg-white/10 backdrop-blur border border-yellow-200/30 rounded-2xl px-6 py-4 text-center">
              <LiveClock
                timeClass="font-display text-2xl font-bold text-white tabular-nums tracking-widest"
                dateClass="text-yellow-200 text-xs tracking-widest mt-0.5" />
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur border border-yellow-200/40 rounded-2xl px-6 py-3"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div className="w-10 h-10 rounded-full bg-yellow-400/30 border border-yellow-300/50 flex items-center justify-center text-xl">⛪</div>
              <div>
                <p className="text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "'Cinzel', serif" }}>
                  {totalMembers}
                </p>
                <p className="text-yellow-200 text-xs uppercase tracking-widest">Registered Members</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Top 3 quick message cards */}
        <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-yellow-500 to-amber-700" />
            <h3 className="text-lg font-bold text-amber-900 uppercase tracking-widest"
              style={{ fontFamily: "'Cinzel', serif" }}>Quick Message</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {TOP_GROUPS.map((g, i) => (
              <button key={g.id}
                onClick={() => navigate(`/admin-messages?group=${g.id}`)}
                className="group relative overflow-hidden rounded-2xl p-6 text-left shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #7C5A00, #B8860B)', animationDelay: `${i * 100}ms`, boxShadow: '0 4px 24px rgba(184,134,11,0.35)' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative z-10">
                  <span className="text-4xl block mb-3">{g.emoji}</span>
                  <p className="text-white font-bold text-xl uppercase tracking-widest"
                    style={{ fontFamily: "'Cinzel', serif" }}>{g.label}</p>
                  <p className="text-yellow-200 text-xs mt-1">{stats[g.id] || 0} members · tap to message</p>
                  <div className="mt-4 flex items-center gap-1 text-yellow-300 text-xs font-semibold uppercase tracking-widest">
                    <span>Send Message</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* All Categories Grid */}
        <div className={`transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-yellow-500 to-amber-700" />
            <h3 className="text-lg font-bold text-amber-900 uppercase tracking-widest"
              style={{ fontFamily: "'Cinzel', serif" }}>All Groups</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <button key={cat.id}
                onClick={() => navigate(`/admin-messages?group=${cat.id}`)}
                className="group relative bg-white border border-amber-100 rounded-2xl p-5 text-center shadow hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider leading-tight"
                  style={{ fontFamily: "'Cinzel', serif" }}>{cat.label}</p>
                <p className="text-amber-500 text-xs mt-1 font-semibold tabular-nums">{stats[cat.id] || 0} members</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {[
            { label: 'Message History', icon: '📜', path: '/admin-message-history' },
            { label: 'Yearly Agenda',   icon: '📅', path: '/admin-agenda' },
            { label: 'Notice Board',    icon: '📌', path: '/admin-notice' },
            { label: 'Weekly Schedule', icon: '🗓️', path: '/admin-activities' },
          ].map((action) => (
            <button key={action.path} onClick={() => navigate(action.path)}
              className="group flex items-center gap-3 bg-white border border-amber-100 rounded-2xl px-5 py-4 shadow hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider group-hover:text-amber-700"
                style={{ fontFamily: "'Cinzel', serif" }}>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button onClick={() => navigate('/admin-registrations')}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-5 py-4 shadow hover:shadow-lg hover:border-green-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
            <span className="text-2xl">📝</span>
            <div className="text-left">
              <p className="text-xs font-bold text-green-900 uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>Registrations</p>
              <p className="text-xs text-green-700 mt-0.5">
                {stats.pendingRegistrations > 0
                  ? `${stats.pendingRegistrations} waiting for approval`
                  : 'No pending requests'}
              </p>
            </div>
            {stats.pendingRegistrations > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                {stats.pendingRegistrations}
              </span>
            )}
          </button>

          <button onClick={() => navigate('/admin-members')}
            className="group flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-5 py-4 shadow hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
            <span className="text-2xl">👥</span>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>Member Management</p>
              <p className="text-xs text-amber-500 mt-0.5">View, edit, delete members</p>
            </div>
          </button>

          <button onClick={() => navigate('/admin-birthday')}
            className="group flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-5 py-4 shadow hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
            <span className="text-2xl">🎂</span>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>Birthday Settings</p>
              <p className="text-xs text-amber-500 mt-0.5">Auto-SMS template & schedule</p>
            </div>
          </button>

          {/* ── NEW: Posts quick action ── */}
          <button onClick={() => navigate('/admin-posts')}
            className="group flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-5 py-4 shadow hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
            <span className="text-2xl">✍️</span>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>Posts</p>
              <p className="text-xs text-amber-500 mt-0.5">{postCount} post{postCount !== 1 ? 's' : ''} · write & share</p>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
