import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import PostCard from '../../components/PostCard';
import LoadingScreen from '../../components/LoadingScreen';
import usePosts from '../../hooks/usePosts';

const MemberPosts = () => {
  const { posts, total, hasMore, loading, loadingMore, error, loadMore, reload } = usePosts();

  if (loading) return <LoadingScreen />;

  const unseen = posts.filter((p) => !p.viewed).length;

  return (
    <div className="min-h-screen bg-[#FDF8F8]">
      <Navbar />
      <PageHeader title="Church Posts" icon="📣" back="/member-dashboard"
        subtitle={`${total} post${total !== 1 ? 's' : ''}${unseen > 0 ? ` · ${unseen} new` : ''}`} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
            {error} <button onClick={reload} className="underline font-semibold ml-1">Retry</button>
          </div>
        )}

        {posts.length === 0 && !error && (
          <div className="text-center py-24 text-gray-600">
            <p className="text-5xl mb-3">📣</p>
            <p>No posts yet. Check back soon.</p>
          </div>
        )}

        {posts.map((post) => <PostCard key={post._id} post={post} />)}

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

export default MemberPosts;
