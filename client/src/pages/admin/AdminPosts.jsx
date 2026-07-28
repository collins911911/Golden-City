import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import PageLoader from '../../components/PageLoader';
import PostCard from '../../components/PostCard';

const AdminPosts = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const fileRef     = useRef();

  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [visible, setVisible]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview]   = useState(null);
  const [previewType, setPreviewType] = useState('');
  const [caption, setCaption]   = useState('');
  const [file, setFile]         = useState(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/posts');
      setPosts(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); setTimeout(() => setVisible(true), 80); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError('');
    const url = URL.createObjectURL(f);
    setPreview(url);
    setPreviewType(f.type.startsWith('video/') ? 'video' : 'image');
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select an image or video.'); return; }
    setUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('media',   file);
    formData.append('caption', caption);

    try {
      const token = JSON.parse(localStorage.getItem('gc_user') || '{}')?.token;
      const res = await axios.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setPosts((prev) => [res.data, ...prev]);
      setShowForm(false);
      setFile(null);
      setCaption('');
      setPreview(null);
      setUploadProgress(0);
      setSuccess('Post uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#FDFBF5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C5A00 0%, #B8860B 50%, #DAA520 100%)', minHeight: '180px' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full border-[40px] border-white -translate-y-1/2 translate-x-1/4" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-200/60 to-transparent" />

        <div className={`relative z-10 max-w-2xl mx-auto px-6 py-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-yellow-200 text-xs font-semibold uppercase tracking-widest hover:text-white transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl">
                🎬
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-widest"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  Posts
                </h1>
                <p className="text-yellow-200 text-sm mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''} shared</p>
              </div>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-xl bg-white/15 backdrop-blur border border-white/30 text-white font-bold uppercase tracking-widest text-sm hover:bg-white/25 transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                + Upload Post
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm text-center font-semibold">
            ✅ {success}
          </div>
        )}

        {/* Upload Form */}
        {showForm && (
          <div className="bg-white rounded-3xl border border-amber-100 shadow-xl p-6 mb-8">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}>
              New Post
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* File picker */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-amber-200 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all mb-4">
              <input ref={fileRef} type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden" />
              {preview ? (
                <div className="relative">
                  {previewType === 'video'
                    ? <video src={preview} className="w-full max-h-64 rounded-xl object-contain mx-auto" controls />
                    : <img src={preview} alt="Preview" className="w-full max-h-64 rounded-xl object-contain mx-auto" />
                  }
                  <p className="text-xs text-amber-400 mt-2">Click to change file</p>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-3">📸</div>
                  <p className="font-bold text-amber-700" style={{ fontFamily: "'Cinzel', serif" }}>
                    Click to select photo or video
                  </p>
                  <p className="text-amber-400 text-xs mt-1">JPG, PNG, GIF, MP4, MOV — up to 100MB</p>
                </div>
              )}
            </div>

            {/* Caption */}
            <textarea
              rows={3}
              placeholder="Write a caption... (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}
            />

            {/* Upload progress */}
            {uploading && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-amber-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleUpload} disabled={!file || uploading}
                className="flex-1 py-3 rounded-xl text-white font-bold uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-95"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, #92650A, #D4AF37, #92650A)',
                  boxShadow: '0 4px 20px rgba(184,134,11,0.4)',
                }}>
                {uploading ? `Uploading ${uploadProgress}%...` : 'Share Post ✝️'}
              </button>
              <button onClick={() => { setShowForm(false); setFile(null); setPreview(null); setCaption(''); }}
                className="px-6 py-3 rounded-xl border border-amber-200 text-amber-700 font-bold uppercase tracking-widest text-sm hover:bg-amber-50 transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Posts feed */}
        {posts.length === 0 && !showForm && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🎬</p>
            <p className="text-amber-300 text-lg italic">No posts yet. Upload your first one!</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={user?.id}
            isAdmin={true}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;600&display=swap');`}</style>
    </div>
  );
};

export default AdminPosts;
