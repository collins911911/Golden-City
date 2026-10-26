import { useState } from 'react';
import axios, { errorMessage } from '../../utils/axios';
import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import PostCard from '../../components/PostCard';
import LoadingScreen from '../../components/LoadingScreen';
import usePosts from '../../hooks/usePosts';
import { useAuth } from '../../context/AuthContext';

const MAX = 1000;

const AdminPosts = () => {
  const { user } = useAuth();
  const { posts, total, hasMore, loading, loadingMore, error, loadMore, addPost, removePost, reload } = usePosts();

  const [text, setText]       = useState('');
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const publish = async () => {
    const clean = text.trim();
    if (!clean) { setFormError('Write something first.'); return; }
    setPosting(true);
    setFormError('');
    try {
      const res = await axios.post('/posts', { text: clean });
      addPost(res.data);
      setText('');
      setSuccess('Posted! Members have been notified.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(errorMessage(err, 'Could not post. Try again.'));
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const left = MAX - text.length;

  return (
    <div className="min-h-screen bg-[#FDFBF5]">
      <Navbar />
      <PageHeader title="Posts" icon="✍️" back="/admin-dashboard"
        subtitle={`${total} post${total !== 1 ? 's' : ''} · members can react and share`} />

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* Composer */}
        <section className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 mb-6">
          <div className="flex gap-3">
            <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <textarea
              rows={4}
              maxLength={MAX}
              placeholder="Share a word, announcement or encouragement with the church…"
              value={text}
              onChange={(e) => { setText(e.target.value); setFormError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) publish(); }}
              className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-[17px] leading-relaxed placeholder-gray-400"
            />
          </div>

          {formError && <p className="mt-2 text-sm text-red-600 font-medium">{formError}</p>}
          {success && <p className="mt-2 text-sm text-green-700 font-medium">✅ {success}</p>}

          <div className="mt-3 pt-3 border-t border-amber-50 flex items-center justify-between">
            <span className={`text-sm ${left < 50 ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
              {left} characters left
            </span>
            <button onClick={publish} disabled={posting || !text.trim()}
              className="px-6 py-2.5 rounded-full text-white font-semibold text-sm shadow transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #92650A, #D4AF37, #92650A)' }}>
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
            {error} <button onClick={reload} className="underline font-semibold ml-1">Retry</button>
          </div>
        )}

        {posts.length === 0 && !error && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-5xl mb-3">✍️</p>
            <p>No posts yet. Write the first one above.</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post._id} post={post} isAdmin onDelete={removePost} />
        ))}

        {hasMore && (
          <button onClick={loadMore} disabled={loadingMore}
            className="w-full py-3 rounded-xl border border-amber-200 text-amber-800 font-medium hover:bg-amber-50 transition-colors">
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        )}
      </main>
    </div>
  );
};

export default AdminPosts;
