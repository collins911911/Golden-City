import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const STATUS_COLOR = {
  delivered: 'bg-green-100 text-green-700 border-green-200',
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  failed:    'bg-red-100 text-red-600 border-red-200',
};

const TYPE_LABEL = {
  group:     { label: 'Group',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
  selective: { label: 'Selective', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  birthday:  { label: 'Birthday',  color: 'bg-pink-50 text-pink-700 border-pink-200' },
  all:       { label: 'All',       color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const MessageHistory = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/messages/history');
        setMessages(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.type === filter);

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const deliveredCount = (msg) => msg.deliveryStatus?.filter((s) => s.status === 'delivered').length || 0;
  const failedCount    = (msg) => msg.deliveryStatus?.filter((s) => s.status === 'failed').length || 0;

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDFBF5] font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <button onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-amber-800 text-sm font-semibold uppercase tracking-widest hover:text-amber-800 transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-yellow-500 to-amber-700" />
            <h1 className="text-3xl font-bold text-amber-900 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
              Message History
            </h1>
          </div>
          <p className="text-amber-700 mt-1 ml-4 text-sm">{messages.length} messages sent total</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['all', 'group', 'selective', 'birthday'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-transparent shadow'
                  : 'bg-white border-amber-200 text-amber-700 hover:border-amber-400'
              }`}
              style={{ fontFamily: "'Cinzel', serif" }}>
              {f === 'all' ? 'All Messages' : f}
            </button>
          ))}
        </div>

        {/* Messages list */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-20 text-amber-700 text-lg italic">No messages yet.</div>
          )}
          {filtered.map((msg) => {
            const typeInfo = TYPE_LABEL[msg.type] || TYPE_LABEL.group;
            const isOpen = expanded === msg._id;
            return (
              <div key={msg._id}
                className="bg-white rounded-2xl border border-amber-100 shadow hover:shadow-md transition-all overflow-hidden">
                <button className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
                  onClick={() => setExpanded(isOpen ? null : msg._id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-sm font-bold border rounded-full px-2.5 py-0.5 ${typeInfo.color}`}
                        style={{ fontFamily: "'Cinzel', serif" }}>
                        {typeInfo.label}
                      </span>
                      {msg.group && (
                        <span className="text-sm bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2.5 py-0.5">
                          {msg.group}
                        </span>
                      )}
                      <span className="text-sm text-amber-700">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-amber-900 text-sm leading-relaxed line-clamp-2">{msg.content}</p>
                    <p className="text-amber-700 text-sm mt-1">Sent by: {msg.sentBy}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-amber-800">{msg.recipients?.length || 0} sent</span>
                    <span className="text-sm text-green-600">✓ {deliveredCount(msg)}</span>
                    {failedCount(msg) > 0 && <span className="text-sm text-red-500">✗ {failedCount(msg)}</span>}
                    <span className={`text-sm mt-1 text-amber-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>

                {/* Expanded delivery status */}
                {isOpen && msg.deliveryStatus?.length > 0 && (
                  <div className="border-t border-amber-50 px-6 py-4 bg-amber-50/30">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      Delivery Report
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {msg.deliveryStatus.map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-3 py-2">
                          <span className="text-sm text-amber-800 font-mono">{s.phone}</span>
                          <span className={`text-sm font-bold border rounded-full px-2 py-0.5 ${STATUS_COLOR[s.status] || STATUS_COLOR.pending}`}>
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
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

export default MessageHistory;
