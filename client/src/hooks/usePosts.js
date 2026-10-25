import { useState, useEffect, useCallback } from 'react';
import axios, { errorMessage } from '../utils/axios';

// Loads posts 20 at a time with a "Load more" option
const usePosts = (limit = 20) => {
  const [posts, setPosts]     = useState([]);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async (p = 1) => {
    p === 1 ? setLoading(true) : setLoadingMore(true);
    setError('');
    try {
      const res = await axios.get(`/posts?page=${p}&limit=${limit}`);
      setPosts((prev) => (p === 1 ? res.data.posts : [...prev, ...res.data.posts]));
      setHasMore(res.data.hasMore);
      setTotal(res.data.total);
      setPage(p);
    } catch (err) {
      setError(errorMessage(err, 'Could not load posts.'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [limit]);

  useEffect(() => { load(1); }, [load]);

  const loadMore = () => hasMore && !loadingMore && load(page + 1);
  const addPost    = (post) => { setPosts((prev) => [post, ...prev]); setTotal((t) => t + 1); };
  const removePost = (id)   => { setPosts((prev) => prev.filter((p) => p._id !== id)); setTotal((t) => t - 1); };

  return { posts, total, hasMore, loading, loadingMore, error, reload: () => load(1), loadMore, addPost, removePost };
};

export default usePosts;
