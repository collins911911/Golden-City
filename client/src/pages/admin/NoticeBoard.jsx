import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import PageLoader from '../../components/PageLoader';

const NoticeBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [success, setSuccess] = useState('');
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [important, setImportant] = useState(false);

  const fetchNotices = async () => {
    try { const res = await axios.get('/notices'); setNotices(res.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const resetForm = () => { setTitle(''); setBody(''); setImportant(false); };

  const handleSubmit = async () => {
    if (!title || !body) return;
    try {
      if (editing) {
        await axios.put(`/notices/${editing}`, { title, body, important });
        flash('Notice updated!');
        setEditing(null);
      } else {
        await axios.post('/notices', { title, body, important, postedBy: user?.name });
        flash('Notice posted!');
        setAdding(false);
      }
      resetForm();
      fetchNotices();
    } catch { }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/notices/${id}`);
    setNotices((p) => p.filter((n) => n._id !== id));
    flash('Notice removed.');
  };

  const openEdit = (notice) => {
    setEditing(notice._id);
    setAdding(false);
    setTitle(notice.title);
    setBody(notice.body);
    setImportant(notice.important);
  };

  const cancelForm = () => {
    setAdding(false);
    setEditing(null);
    resetForm();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#FDFBF5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-amber-600 text-sm font-semibold uppercase tracking-widest hover:text-amber-800 transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-yellow-500 to-amber-700" />
              <h1 className="text-3xl font-bold text-amber-900 uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Notice Board
              </h1>
            </div>
            {!adding && !editing && (
              <button onClick={() => setAdding(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold uppercase tracking-widest shadow hover:shadow-lg transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                + Post Notice
              </button>
            )}
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm text-center font-semibold">
            {success}
          </div>
        )}

        {/* ── INLINE FORM — no inner component ── */}
        {(adding || editing) && (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-lg p-6 mb-6">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}>
              {editing ? 'Edit Notice' : 'New Notice'}
            </p>

            <input
              type="text"
              placeholder="Notice Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
            />

            <textarea
              rows={4}
              placeholder="Notice body — write what the congregation needs to know..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}
            />

            {/* Important toggle */}
            <div className="flex items-center gap-3 mb-5 cursor-pointer select-none"
              onClick={() => setImportant((prev) => !prev)}>
              <div className={`relative w-10 h-5 rounded-full transition-all duration-200 ${important ? 'bg-red-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${important ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-amber-800 font-semibold">Mark as Important 🚨</span>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                {editing ? 'Update' : 'Post Notice'}
              </button>
              <button onClick={cancelForm}
                className="px-6 py-2.5 rounded-xl border border-amber-200 text-amber-700 text-sm font-bold uppercase tracking-widest hover:bg-amber-50 transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notices list */}
        <div className="space-y-4">
          {notices.length === 0 && (
            <div className="text-center py-16 text-amber-300 text-lg italic">No notices posted yet.</div>
          )}
          {notices.map((notice) => (
            <div key={notice._id}
              className={`bg-white rounded-2xl border shadow hover:shadow-md transition-shadow overflow-hidden ${notice.important ? 'border-red-200' : 'border-amber-100'}`}>
              {notice.important && (
                <div className="bg-red-500 px-5 py-1.5">
                  <p className="text-white text-xs font-bold uppercase tracking-widest">🚨 Important Notice</p>
                </div>
              )}
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 text-lg mb-1"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      {notice.title}
                    </h3>
                    <p className="text-amber-700 leading-relaxed text-sm">{notice.body}</p>
                    <p className="text-amber-400 text-xs mt-3">
                      Posted by {notice.postedBy} · {new Date(notice.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(notice)}
                      className="px-4 py-2 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-widest hover:bg-amber-50 transition-all"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(notice._id)}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;600&display=swap');`}</style>
    </div>
  );
};

export default NoticeBoard;
