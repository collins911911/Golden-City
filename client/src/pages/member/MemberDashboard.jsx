import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import PageLoader from '../../components/PageLoader';
import PostCard from '../../components/PostCard';

const CATEGORIES = [
  { id: 'men',              label: 'Men',                     emoji: '👨' },
  { id: 'women',            label: 'Women',                   emoji: '👩' },
  { id: 'youths',           label: 'Youths',                  emoji: '🧑' },
  { id: 'men-excos',        label: 'Men Excos',               emoji: '👔' },
  { id: 'women-excos',      label: 'Women Excos',             emoji: '👗' },
  { id: 'youth-excos',      label: 'Youth Excos',             emoji: '🎓' },
  { id: 'workers',          label: 'Workers',                 emoji: '🛠️' },
  { id: 'ffcc',             label: 'FFCC',                    emoji: '✝️' },
  { id: 'church-committee', label: 'Church Committee',        emoji: '📋' },
  { id: 'choir',            label: 'Choir & Instrumentalists',emoji: '🎵' },
];

const MemberDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [stats, setStats]           = useState({});
  const [notices, setNotices]       = useState([]);
  const [latestPost, setLatestPost] = useState(null);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [visible, setVisible]       = useState(false);
  const [time, setTime]             = useState(new Date());
  const [greeting, setGreeting]     = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else             setGreeting('Good Evening');

    const fetchData = async () => {
      try {
        const [noticesRes, postsRes] = await Promise.all([
          axios.get('/notices'),
          axios.get('/posts'),
        ]);
        setNotices(noticesRes.data.slice(0, 2));
        const posts = postsRes.data;
        if (posts.length > 0) setLatestPost(posts[0]);
        setUnviewedCount(posts.filter((p) => !p.views?.includes(user?.id)).length);

        try {
          const statsRes = await axios.get('/admin/stats');
          setStats(statsRes.data);
        } catch { setStats({}); }

      } catch { /* silent */ }
      finally { setLoading(false); setTimeout(() => setVisible(true), 80); }
    };
    fetchData();

    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, [user?.id]);

  if (loading) return <PageLoader />;

  const totalMembers   = stats.totalMembers || 0;
  const userCategories = user?.categories || [];

  return (
    <div className="min-h-screen bg-[#FDF8F8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <Navbar unviewedPosts={unviewedCount} />

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #6B0F0F 0%, #991B1B 40%, #B45309 100%)',
        minHeight: '280px',
      }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border-[50px] border-white/5" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full border-[35px] border-white/5" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <p className="text-red-200 text-xs uppercase tracking-[0.3em] font-semibold mb-1"
              style={{ fontFamily: "'Cinzel', serif" }}>
              {greeting}, {user?.name?.split(' ')[0]}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-widest leading-none"
              style={{ fontFamily: "'Cinzel', serif", textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
              Golden City
            </h1>
            <h2 className="text-xl text-red-200 uppercase tracking-[0.25em] font-semibold"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Church
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-px bg-amber-400/60" />
              <p className="text-red-100/80 text-sm italic"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}>
                "Raising a golden generation for God's Kingdom"
              </p>
            </div>
            {userCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {userCategories.map((cat) => {
                  const found = CATEGORIES.find((c) => c.id === cat);
                  return found ? (
                    <span key={cat}
                      className="text-xs bg-white/15 border border-white/20 text-white rounded-full px-3 py-1 backdrop-blur"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      {found.emoji} {found.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Right — clock + total */}
          <div className={`flex flex-col items-center md:items-end gap-3 transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold text-white tabular-nums tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-red-200 text-xs tracking-wide mt-0.5">
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-3">
              <span className="text-2xl">⛪</span>
              <div>
                <p className="text-2xl font-bold text-white tabular-nums"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {totalMembers}
                </p>
                <p className="text-red-200 text-xs uppercase tracking-widest">Registered Members</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Group Stats */}
        <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-red-600 to-amber-600" />
            <h3 className="text-lg font-bold text-red-900 uppercase tracking-widest"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Our Community
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <div key={cat.id}
                className="group bg-white rounded-2xl border border-red-100 shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 text-center overflow-hidden relative"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <p className="text-xs font-bold text-red-900 uppercase tracking-wider leading-tight"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {cat.label}
                </p>
                <p className="text-2xl font-black text-red-700 mt-1 tabular-nums"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {stats[cat.id] || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Latest Post — uses the SAME PostCard component ── */}
        {latestPost && (
          <div className={`transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-red-600 to-amber-600" />
                <h3 className="text-lg font-bold text-red-900 uppercase tracking-widest"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  Latest Post
                  {unviewedCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full animate-pulse">
                      {unviewedCount > 9 ? '9+' : unviewedCount}
                    </span>
                  )}
                </h3>
              </div>
              <button onClick={() => navigate('/member-posts')}
                className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-widest transition-colors"
                style={{ fontFamily: "'Cinzel', serif" }}>
                All Posts →
              </button>
            </div>

            {/* ✅ Uses the exact same PostCard — no duplicate code */}
            <PostCard
              post={latestPost}
              currentUserId={user?.id}
              isAdmin={false}
            />
          </div>
        )}

        {/* Quick Nav Cards */}
        <div className={`transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-red-600 to-amber-600" />
            <h3 className="text-lg font-bold text-red-900 uppercase tracking-widest"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Quick Access
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: 'Upcoming Events', sub: 'Yearly agenda & programmes', emoji: '📅', path: '/member-events' },
              { label: 'Notice Board',    sub: 'Church announcements',        emoji: '📌', path: '/member-notice' },
              { label: 'Weekly Schedule', sub: 'Activities & service times',  emoji: '🗓️', path: '/member-activities' },
            ].map((card) => (
              <button key={card.path} onClick={() => navigate(card.path)}
                className="group relative overflow-hidden rounded-2xl p-6 text-left shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #991B1B, #B45309)', boxShadow: '0 4px 24px rgba(153,27,27,0.3)' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="text-4xl block mb-3">{card.emoji}</span>
                <p className="text-white font-bold text-lg uppercase tracking-widest"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {card.label}
                </p>
                <p className="text-white/70 text-sm mt-1">{card.sub}</p>
                <div className="mt-4 flex items-center gap-1 text-white/60 text-xs font-semibold uppercase tracking-widest">
                  <span>View</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Latest Notices */}
        {notices.length > 0 && (
          <div className={`transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-red-600 to-amber-600" />
                <h3 className="text-lg font-bold text-red-900 uppercase tracking-widest"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  Latest Notices
                </h3>
              </div>
              <button onClick={() => navigate('/member-notice')}
                className="text-xs text-red-600 font-bold uppercase tracking-widest hover:text-red-800 transition-colors"
                style={{ fontFamily: "'Cinzel', serif" }}>
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n._id}
                  className={`bg-white rounded-2xl border shadow p-5 ${n.important ? 'border-red-300' : 'border-red-100'}`}>
                  {n.important && (
                    <span className="inline-block text-xs font-bold bg-red-600 text-white rounded-full px-3 py-0.5 mb-2 uppercase tracking-widest"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      🚨 Important
                    </span>
                  )}
                  <h4 className="font-bold text-red-900" style={{ fontFamily: "'Cinzel', serif" }}>{n.title}</h4>
                  <p className="text-red-700/80 text-sm mt-1 line-clamp-2">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,500&display=swap');`}</style>
    </div>
  );
};

export default MemberDashboard;