import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const MemberNoticeBoard = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all'); // all | important

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/notices');
        setNotices(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); setTimeout(() => setVisible(true), 80); }
    };
    fetch();
  }, []);

  const displayed = filter === 'important'
    ? notices.filter((n) => n.important)
    : notices;

  const importantCount = notices.filter((n) => n.important).length;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDF8F8] font-sans">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C0000 0%, #991B1B 45%, #C2410C 100%)', minHeight: '200px' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 right-10 w-56 h-56 rounded-full border-[35px] border-white/5" />
          <div className="absolute bottom-0 -left-8 w-44 h-44 rounded-full border-[25px] border-white/5 translate-y-1/3" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className={`relative z-10 max-w-4xl mx-auto px-6 py-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={() => navigate('/member-dashboard')}
            className="flex items-center gap-2 text-red-200 text-xs font-semibold uppercase tracking-widest hover:text-white transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl shadow-lg">
                📌
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-widest"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  Notice Board
                </h1>
                <p className="text-red-200 text-sm mt-0.5">{notices.length} notices · {importantCount} important</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Filter tabs */}
        <div className={`flex gap-2 mb-8 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { key: 'all',       label: 'All Notices' },
            { key: 'important', label: `🚨 Important (${importantCount})` },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                filter === f.key
                  ? 'bg-gradient-to-r from-red-700 to-red-900 text-white border-transparent shadow-lg'
                  : 'bg-white border-red-200 text-red-700 hover:border-red-400'
              }`}
              style={{ fontFamily: "'Cinzel', serif" }}>
              {f.label}
            </button>
          ))}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📌</p>
            <p className="text-red-700 text-lg italic">No notices to display.</p>
          </div>
        )}

        <div className="space-y-4">
          {displayed.map((notice, i) => {
            const isOpen = expanded === notice._id;
            return (
              <div key={notice._id}
                className={`bg-white rounded-2xl border shadow hover:shadow-md transition-all duration-300 overflow-hidden ${
                  notice.important ? 'border-red-300' : 'border-red-100'
                }`}
                style={{ transitionDelay: `${i * 50}ms` }}>

                {/* Important top bar */}
                {notice.important && (
                  <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
                )}

                <button className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
                  onClick={() => setExpanded(isOpen ? null : notice._id)}>
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                      notice.important
                        ? 'bg-gradient-to-br from-red-600 to-red-800'
                        : 'bg-gradient-to-br from-red-100 to-red-200'
                    }`}>
                      {notice.important ? '🚨' : '📌'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {notice.title}
                        </h3>
                        {notice.important && (
                          <span className="text-xs bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider"
                            style={{ fontFamily: "'Cinzel', serif" }}>
                            Important
                          </span>
                        )}
                      </div>
                      {!isOpen && (
                        <p className="text-gray-800 text-base font-medium mt-1 line-clamp-2">{notice.body}</p>
                      )}
                      <p className="text-red-800 text-sm font-medium mt-1.5">
                        {formatDate(notice.createdAt)} · Posted by {notice.postedBy}
                      </p>
                    </div>
                  </div>

                  <span className={`flex-shrink-0 text-red-700 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div className="px-6 pb-6 border-t border-red-50">
                    <p className="text-gray-900 text-base font-medium leading-relaxed pt-4 whitespace-pre-wrap">
                      {notice.body}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default MemberNoticeBoard;
