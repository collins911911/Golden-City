import { useState, useRef, useEffect } from 'react';
import axios, { errorMessage } from '../utils/axios';
import { sharePostAsImage } from '../utils/shareImage';
import { refreshBadge } from '../utils/badge';

// ── Icons ─────────────────────────────────────────────────────
const ThumbIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m0 11V11m0 11h10a2 2 0 002-2v-1.5M7 11l5-9 .5 4.5H17a2 2 0 012 2l-1.5 6a2 2 0 01-2 2H7"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      fill={filled ? 'currentColor' : 'none'} fillOpacity={filled ? 0.15 : 0} />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      fill={filled ? 'currentColor' : 'none'} fillOpacity={filled ? 0.2 : 0} />
  </svg>
);

const PrayIcon = () => <span className="text-lg leading-none" aria-hidden="true">🙏</span>;

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const REACTIONS = [
  { type: 'likes', label: 'Like',  Icon: ThumbIcon, on: 'bg-blue-600 text-white',  idle: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600' },
  { type: 'loves', label: 'Love',  Icon: HeartIcon, on: 'bg-red-600 text-white',   idle: 'text-gray-600 hover:bg-red-50 hover:text-red-600' },
  { type: 'amens', label: 'Amen',  Icon: PrayIcon,  on: 'bg-gray-900 text-white',  idle: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' },
];

// "2m", "3h", "Mon 4", "12 Oct 2025"
const timeAgo = (date) => {
  const d    = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PostCard = ({ post, isAdmin = false, onDelete }) => {
  const cardRef = useRef(null);

  const [counts, setCounts]   = useState({ likes: post.likes || 0, loves: post.loves || 0, amens: post.amens || 0 });
  const [mine, setMine]       = useState(post.myReaction || null);
  const [views, setViews]     = useState(post.views || 0);
  const [shares, setShares]   = useState(post.shares || 0);
  const [busy, setBusy]       = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice]   = useState(null); // { type: 'error' | 'ok', text }

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  // Count a view once the post has been on screen for 1.5 seconds
  useEffect(() => {
    if (post.viewed || !cardRef.current) return;
    let timer;
    let done = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !done) {
        timer = setTimeout(async () => {
          done = true;
          observer.disconnect();
          try {
            const res = await axios.post(`/posts/${post._id}/view`);
            setViews(res.data.views);
            refreshBadge();
          } catch { /* a missed view is not important */ }
        }, 1500);
      } else {
        clearTimeout(timer);
      }
    }, { threshold: 0.6 });
    observer.observe(cardRef.current);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [post._id, post.viewed]);

  const react = async (type) => {
    if (busy) return;
    setBusy(true);

    // Update the screen instantly, fix it up when the server answers
    const before   = { counts, mine };
    const removing = mine === type;
    const next = { ...counts };
    if (mine) next[mine] = Math.max(0, next[mine] - 1);
    if (!removing) next[type] += 1;
    setCounts(next);
    setMine(removing ? null : type);
    if (!removing && navigator.vibrate) navigator.vibrate(15);

    try {
      const res = await axios.post(`/posts/${post._id}/react`, { type });
      setCounts({ likes: res.data.likes, loves: res.data.loves, amens: res.data.amens });
      setMine(res.data.myReaction);
    } catch (err) {
      setCounts(before.counts);
      setMine(before.mine);
      flash('error', errorMessage(err, 'Could not save your reaction.'));
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const result = await sharePostAsImage({ ...post });
      if (result !== 'cancelled') {
        axios.post(`/posts/${post._id}/share`).then((r) => setShares(r.data.shares)).catch(() => {});
        if (result === 'downloaded') flash('ok', 'Image saved — you can now post it anywhere.');
      }
    } catch {
      flash('error', 'Could not create the image. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
    } catch (err) {
      setDeleting(false);
      flash('error', errorMessage(err, 'Could not delete the post.'));
    }
  };

  const total = counts.likes + counts.loves + counts.amens;

  return (
    <article ref={cardRef}
      className={`bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow mb-4 ${deleting ? 'opacity-50' : ''}`}>

      {/* Header */}
      <header className="flex items-start gap-3 px-5 pt-5">
        <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold text-base shadow">
          {post.postedBy?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 truncate">{post.postedBy}</span>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-500" fill="currentColor" aria-label="Church admin">
              <path d="M12 2l2.4 2.2 3.2-.4.9 3.1 2.9 1.5-1 3.1 1 3.1-2.9 1.5-.9 3.1-3.2-.4L12 22l-2.4-2.2-3.2.4-.9-3.1-2.9-1.5 1-3.1-1-3.1 2.9-1.5.9-3.1 3.2.4z" />
              <path d="M8.5 12.5l2.2 2.2 4.8-4.8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            <span className="text-gray-400 text-sm">· {timeAgo(post.createdAt)}</span>
          </div>
          {post.postedByTitle && <p className="text-amber-600 text-xs font-medium">{post.postedByTitle}</p>}
        </div>
        {isAdmin && (
          <button onClick={remove} disabled={deleting}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
            aria-label="Delete post" title="Delete post">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        )}
      </header>

      {/* Text */}
      <p className="px-5 pt-3 pb-4 text-[17px] leading-relaxed text-gray-900 whitespace-pre-wrap break-words">
        {post.text}
      </p>

      {/* Stats */}
      <div className="px-5 pb-2 flex items-center justify-between text-sm text-gray-500">
        <span className="flex items-center gap-1.5"><EyeIcon /> {views} {views === 1 ? 'view' : 'views'}</span>
        <span>
          {total > 0 && `${total} reaction${total === 1 ? '' : 's'}`}
          {total > 0 && shares > 0 && ' · '}
          {shares > 0 && `${shares} share${shares === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Actions */}
      <div className="border-t border-amber-50 px-2 py-2 grid grid-cols-4 gap-1">
        {REACTIONS.map(({ type, label, Icon, on, idle }) => (
          <button key={type} onClick={() => react(type)} disabled={busy}
            aria-pressed={mine === type}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              mine === type ? `${on} shadow` : idle
            }`}>
            <Icon filled={mine === type} />
            <span>{counts[type] > 0 ? counts[type] : label}</span>
          </button>
        ))}
        <button onClick={share} disabled={sharing}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-all active:scale-95 disabled:opacity-60">
          {sharing
            ? <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            : <ShareIcon />}
          <span>Share</span>
        </button>
      </div>

      {notice && (
        <p className={`text-center text-sm font-medium px-4 pb-3 ${notice.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
          {notice.text}
        </p>
      )}
    </article>
  );
};

export default PostCard;
