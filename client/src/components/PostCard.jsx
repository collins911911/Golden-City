import { useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';

// ── Beautiful SVG Icons ───────────────────────────────────────

const ThumbIcon = ({ filled, animating }) => (
  <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-all duration-300 ${animating ? 'scale-125' : 'scale-100'}`} fill="none">
    <path
      d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m0 11V11m0 11h10a2 2 0 002-2v-1.5M7 11l5-9 .5 4.5H17a2 2 0 012 2l-1.5 6a2 2 0 01-2 2H7"
      stroke={filled ? '#2563eb' : '#9ca3af'}
      strokeWidth={filled ? '2' : '1.5'}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? '#dbeafe' : 'none'}
    />
  </svg>
);

const HeartIcon = ({ filled, animating }) => (
  <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-all duration-300 ${animating ? 'scale-125' : 'scale-100'}`} fill="none">
    <path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={filled ? '#dc2626' : '#9ca3af'}
      strokeWidth={filled ? '2' : '1.5'}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? '#fee2e2' : 'none'}
    />
  </svg>
);

const AmenIcon = ({ filled, animating }) => (
  <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-all duration-300 ${animating ? 'scale-125' : 'scale-100'}`} fill="none">
    {/* Left hand */}
    <path
      d="M6 15V9.5C6 8.67 6.67 8 7.5 8S9 8.67 9 9.5V13"
      stroke={filled ? '#111827' : '#9ca3af'}
      strokeWidth={filled ? '2' : '1.5'}
      strokeLinecap="round"
    />
    {/* Right hand */}
    <path
      d="M18 15V9.5C18 8.67 17.33 8 16.5 8S15 8.67 15 9.5V13"
      stroke={filled ? '#111827' : '#9ca3af'}
      strokeWidth={filled ? '2' : '1.5'}
      strokeLinecap="round"
    />
    {/* Palms joined */}
    <path
      d="M9 13V7.5C9 6.67 9.67 6 10.5 6S12 6.67 12 7.5M15 13V7.5C15 6.67 14.33 6 13.5 6S12 6.67 12 7.5V6"
      stroke={filled ? '#111827' : '#9ca3af'}
      strokeWidth={filled ? '2' : '1.5'}
      strokeLinecap="round"
    />
    {/* Bottom cup / base */}
    <path
      d="M6 15C6 18 8 20 12 20C16 20 18 18 18 15"
      stroke={filled ? '#111827' : '#9ca3af'}
      strokeWidth={filled ? '2' : '1.5'}
      strokeLinecap="round"
      fill={filled ? '#f3f4f6' : 'none'}
    />
    {/* Center line joining hands */}
    <path
      d="M12 6V4"
      stroke={filled ? '#111827' : '#9ca3af'}
      strokeWidth={filled ? '2' : '1.5'}
      strokeLinecap="round"
    />
  </svg>
);

// ── Floating +1 animation ─────────────────────────────────────
const FloatBadge = ({ show, color }) => (
  <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-black pointer-events-none transition-all duration-500 ${
    show ? 'opacity-100 -translate-y-2' : 'opacity-0 translate-y-0'
  } ${color}`}>
    +1
  </span>
);

// ── Main PostCard ─────────────────────────────────────────────
const PostCard = ({ post, currentUserId, isAdmin, onDelete }) => {
  const videoRef = useRef(null);
  const cardRef  = useRef(null);
  const timerRef = useRef(null);

  const getCurrentReaction = () => {
    if (post.likes?.includes(currentUserId)) return 'likes';
    if (post.loves?.includes(currentUserId)) return 'loves';
    if (post.amens?.includes(currentUserId)) return 'amens';
    return null;
  };

  const [reactions, setReactions] = useState({
    likes: post.likes?.length || 0,
    loves: post.loves?.length || 0,
    amens: post.amens?.length || 0,
  });
  const [myReaction, setMyReaction]     = useState(getCurrentReaction());
  const [viewCount, setViewCount]       = useState(post.views?.length || 0);
  const [viewCounted, setViewCounted]   = useState(post.views?.includes(currentUserId) || false);
  const [reacting, setReacting]         = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [animating, setAnimating]       = useState(null); // which button is animating
  const [floatShow, setFloatShow]       = useState(null); // which +1 to show

  // ── Intersection observer ─────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (videoRef.current) videoRef.current.play().catch(() => {});
        if (!viewCounted) {
          timerRef.current = setTimeout(async () => {
            try {
              const res = await axios.post(`/posts/${post._id}/view`);
              setViewCount(res.data.views);
              setViewCounted(true);
            } catch { /* silent */ }
          }, 2000);
        }
      } else {
        if (videoRef.current) videoRef.current.pause();
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    }, { threshold: 0.5 });

    if (cardRef.current) observer.observe(cardRef.current);
    return () => { observer.disconnect(); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [post._id, viewCounted]);

  // ── React handler ─────────────────────────────────────────
  const handleReact = async (type) => {
    if (reacting) return;
    setReacting(true);

    // Trigger animation
    setAnimating(type);
    setTimeout(() => setAnimating(null), 400);

    // Show +1 float only if adding (not removing)
    const isRemoving = myReaction === type;
    if (!isRemoving) {
      setFloatShow(type);
      setTimeout(() => setFloatShow(null), 800);
    }

    try {
      const res = await axios.post(`/posts/${post._id}/react`, { type });
      setReactions({ likes: res.data.likes, loves: res.data.loves, amens: res.data.amens });
      setMyReaction(
        res.data.userReactions.liked  ? 'likes'
        : res.data.userReactions.loved  ? 'loves'
        : res.data.userReactions.amened ? 'amens'
        : null
      );
    } catch { /* silent */ }
    finally { setReacting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch { setDeleting(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const totalReactions = reactions.likes + reactions.loves + reactions.amens;

  return (
    <div ref={cardRef}
      className="bg-white rounded-3xl border border-amber-100 shadow-lg overflow-hidden mb-6 hover:shadow-xl transition-all duration-300">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-amber-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-black text-base shadow-md"
            style={{ fontFamily: "'Cinzel', serif" }}>
            {post.postedBy?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-black text-amber-900 text-sm tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
              {post.postedBy}
            </p>
            {post.postedByTitle && <p className="text-amber-400 text-xs font-medium">{post.postedByTitle}</p>}
            <p className="text-amber-300 text-[10px] mt-0.5">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={handleDelete} disabled={deleting}
            className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg"
            style={{ fontFamily: "'Cinzel', serif" }}>
            {deleting ? '...' : 'Delete'}
          </button>
        )}
      </div>

      {/* ── Media — full width ── */}
      <div className="w-full bg-black">
        {post.mediaType === 'video' ? (
          <video ref={videoRef} src={post.mediaUrl}
            className="w-full object-cover"
            style={{ maxHeight: '520px', minHeight: '200px' }}
            controls muted playsInline loop />
        ) : (
          <img src={post.mediaUrl} alt={post.caption || 'Church post'}
            className="w-full object-cover"
            style={{ maxHeight: '520px', minHeight: '150px' }}
            loading="lazy" />
        )}
      </div>

      {/* ── Caption ── */}
      {post.caption && (
        <div className="px-5 pt-4 pb-2">
          <p className="text-amber-900 leading-relaxed font-medium"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem' }}>
            {post.caption}
          </p>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className="px-5 pt-3 pb-1 flex items-center justify-between">
        {/* View count */}
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-400" fill="none">
            <path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span className="text-xs font-bold text-amber-500">
            {viewCount} {viewCount === 1 ? 'view' : 'views'}
          </span>
        </div>

        {/* Reaction summary */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-3">
            {reactions.likes > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-blue-500">
                <ThumbIcon filled={true} animating={false} />
                {reactions.likes}
              </span>
            )}
            {reactions.loves > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                <HeartIcon filled={true} animating={false} />
                {reactions.loves}
              </span>
            )}
            {reactions.amens > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-gray-700">
                <AmenIcon filled={true} animating={false} />
                {reactions.amens}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 my-2 h-px bg-amber-50" />

      {/* ── Reaction buttons ── */}
      <div className="px-4 pb-4 flex items-center gap-2">

        {/* 👍 Like */}
        <div className="relative flex-1">
          <FloatBadge show={floatShow === 'likes'} color="text-blue-600" />
          <button onClick={() => handleReact('likes')} disabled={reacting}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              myReaction === 'likes'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                : myReaction !== null
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95'
            }`}
            style={{ fontFamily: "'Cinzel', serif" }}>
            <ThumbIcon filled={myReaction === 'likes'} animating={animating === 'likes'} />
            <span className="text-[11px]">
              {myReaction === 'likes' ? 'Liked' : 'Like'}
            </span>
          </button>
        </div>

        {/* ❤️ Love */}
        <div className="relative flex-1">
          <FloatBadge show={floatShow === 'loves'} color="text-red-600" />
          <button onClick={() => handleReact('loves')} disabled={reacting}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              myReaction === 'loves'
                ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105'
                : myReaction !== null
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 active:scale-95'
            }`}
            style={{ fontFamily: "'Cinzel', serif" }}>
            <HeartIcon filled={myReaction === 'loves'} animating={animating === 'loves'} />
            <span className="text-[11px]">
              {myReaction === 'loves' ? 'Loved' : 'Love'}
            </span>
          </button>
        </div>

        {/* 🤲 Amen */}
        <div className="relative flex-1">
          <FloatBadge show={floatShow === 'amens'} color="text-gray-700" />
          <button onClick={() => handleReact('amens')} disabled={reacting}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              myReaction === 'amens'
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-300 scale-105'
                : myReaction !== null
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-200 hover:text-gray-800 active:scale-95'
            }`}
            style={{ fontFamily: "'Cinzel', serif" }}>
            <AmenIcon filled={myReaction === 'amens'} animating={animating === 'amens'} />
            <span className="text-[11px]">
              {myReaction === 'amens' ? 'Amen 🙏' : 'Amen'}
            </span>
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] text-amber-300 italic pb-3">
        {myReaction ? 'Tap your reaction to remove it' : 'React once — Like, Love or Amen'}
      </p>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;600&display=swap');
      `}</style>
    </div>
  );
};

export default PostCard;
