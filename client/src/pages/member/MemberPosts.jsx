import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import PageLoader from '../../components/PageLoader';
import PostCard from '../../components/PostCard';

const MemberPosts = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/posts');
        setPosts(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); setTimeout(() => setVisible(true), 80); }
    };
    fetchPosts();
  }, []);

  const handleDelete = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  if (loading) return <PageLoader />;

  const unviewedCount = posts.filter((p) => !p.views?.includes(user?.id)).length;

  return (
    <div className="min-h-screen bg-[#FDF8F8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6B0F0F 0%, #991B1B 50%, #B45309 100%)', minHeight: '180px' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border-[25px] border-white/5" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className={`relative z-10 max-w-2xl mx-auto px-6 py-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={() => navigate('/member-dashboard')}
            className="flex items-center gap-2 text-red-200 text-xs font-semibold uppercase tracking-widest hover:text-white transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl">
              🎬
              {unviewedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                  {unviewedCount > 9 ? '9+' : unviewedCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Church Posts
              </h1>
              <p className="text-red-200 text-sm mt-0.5">
                {posts.length} post{posts.length !== 1 ? 's' : ''}
                {unviewedCount > 0 && ` · ${unviewedCount} new`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {posts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🎬</p>
            <p className="text-red-300 text-lg italic">No posts yet.</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={user?.id}
            isAdmin={false}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;600&display=swap');`}</style>
    </div>
  );
};

export default MemberPosts;
