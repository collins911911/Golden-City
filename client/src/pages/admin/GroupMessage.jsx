import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import PageLoader from '../../components/PageLoader';

const CATEGORIES = [
  { id: 'men',              label: 'Men',                      emoji: '👨' },
  { id: 'women',            label: 'Women',                    emoji: '👩' },
  { id: 'youths',           label: 'Youths',                   emoji: '🧑' },
  { id: 'men-excos',        label: 'Men Excos',                emoji: '👔' },
  { id: 'women-excos',      label: 'Women Excos',              emoji: '👗' },
  { id: 'youth-excos',      label: 'Youth Excos',              emoji: '🎓' },
  { id: 'workers',          label: 'Workers',                  emoji: '🛠️' },
  { id: 'ffcc',             label: 'FFCC',                     emoji: '✝️' },
  { id: 'church-committee', label: 'Church Committee',         emoji: '📋' },
  { id: 'choir',            label: 'Choir & Instrumentalists', emoji: '🎵' },
  { id: 'all',              label: 'Everyone (All Members)',   emoji: '⛪' },
];

const GroupMessage = () => {
  const { user }       = useAuth();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const preselect      = searchParams.get('group') || '';

  const [selectedGroups, setSelectedGroups] = useState(preselect ? [preselect] : []);
  const [message, setMessage]               = useState('');
  const [totalCount, setTotalCount]         = useState(0);
  const [sending, setSending]               = useState(false);
  const [sent, setSent]                     = useState(false);
  const [error, setError]                   = useState('');
  const [stats, setStats]                   = useState({});

  useEffect(() => {
    // Fetch stats to show per-group counts
    axios.get('/admin/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (preselect) setSelectedGroups([preselect]);
  }, [preselect]);

  // Recalculate total when groups change
  useEffect(() => {
    if (selectedGroups.length === 0) { setTotalCount(0); return; }
    const fetchCount = async () => {
      try {
        if (selectedGroups.includes('all')) {
          setTotalCount(stats.totalMembers || 0);
          return;
        }
        // Get unique members across all selected groups
        const res = await axios.get(
          `/admin/members/count?groups=${selectedGroups.join(',')}`
        );
        setTotalCount(res.data.count || 0);
      } catch {
        // Fallback — sum the stats (may double count but gives rough idea)
        const sum = selectedGroups.reduce((acc, g) => acc + (stats[g] || 0), 0);
        setTotalCount(sum);
      }
    };
    fetchCount();
  }, [selectedGroups, stats]);

  const toggleGroup = (id) => {
    setError('');
    if (id === 'all') {
      // Selecting "all" clears others and vice versa
      setSelectedGroups((prev) =>
        prev.includes('all') ? [] : ['all']
      );
      return;
    }
    setSelectedGroups((prev) => {
      const withoutAll = prev.filter((g) => g !== 'all');
      return withoutAll.includes(id)
        ? withoutAll.filter((g) => g !== id)
        : [...withoutAll, id];
    });
  };

  const handleSend = async () => {
    if (selectedGroups.length === 0) { setError('Please select at least one group.'); return; }
    if (!message.trim())             { setError('Please type a message.'); return; }
    setError('');
    setSending(true);
    try {
      await axios.post('/messages/group', {
        groups:  selectedGroups,
        group:   selectedGroups[0],
        content: message,
        sentBy:  user?.name,
      });
      setSent(true);
      setMessage('');
      setSelectedGroups([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send. Try again.');
    } finally {
      setSending(false); }
  };

  if (sending) return <PageLoader />;

  const charCount = message.length;
  const smsUnits  = Math.ceil(charCount / 160) || 1;

  return (
    <div className="min-h-screen bg-[#FDFBF5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-amber-600 text-sm font-semibold uppercase tracking-widest hover:text-amber-800 transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-yellow-500 to-amber-700" />
            <h1 className="text-3xl font-bold text-amber-900 uppercase tracking-widest"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Group Message
            </h1>
          </div>
          <p className="text-amber-600 mt-1 ml-4 text-sm">
            Select one or more groups — members in multiple selected groups receive the SMS only once
          </p>
        </div>

        {sent && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-bold text-green-800" style={{ fontFamily: "'Cinzel', serif" }}>Message Sent!</p>
              <p className="text-green-600 text-sm">Your SMS has been dispatched.</p>
            </div>
            <button onClick={() => setSent(false)} className="ml-auto text-green-400 hover:text-green-600 text-xl">×</button>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-amber-100 shadow-xl overflow-hidden">

          {/* Step 1 — Group selector */}
          <div className="p-6 border-b border-amber-50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                1. Select Group(s)
              </p>
              {selectedGroups.length > 0 && (
                <button onClick={() => setSelectedGroups([])}
                  className="text-xs text-amber-400 hover:text-amber-600 underline transition-colors">
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const selected = selectedGroups.includes(cat.id);
                const count    = cat.id === 'all' ? (stats.totalMembers || 0) : (stats[cat.id] || 0);
                return (
                  <button key={cat.id} onClick={() => toggleGroup(cat.id)}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                      selected
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 border-transparent text-white shadow-md scale-[1.02]'
                        : 'bg-white border-amber-100 text-amber-800 hover:border-amber-400 hover:bg-amber-50'
                    }`}>
                    {/* Checkbox indicator */}
                    <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      selected ? 'bg-white border-white' : 'border-amber-300'
                    }`}>
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-amber-600" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{cat.emoji}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${selected ? 'text-white' : ''}`}
                        style={{ fontFamily: selected ? "'Cinzel', serif" : 'inherit' }}>
                        {cat.label}
                      </p>
                      <p className={`text-[10px] ${selected ? 'text-white/70' : 'text-amber-400'}`}>
                        {count} members
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected summary */}
            {selectedGroups.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-amber-500 font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  Sending to:
                </span>
                {selectedGroups.map((id) => {
                  const cat = CATEGORIES.find((c) => c.id === id);
                  return (
                    <span key={id}
                      className="inline-flex items-center gap-1 bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold rounded-full px-3 py-1">
                      {cat?.emoji} {cat?.label}
                      <button onClick={() => toggleGroup(id)}
                        className="ml-1 text-amber-400 hover:text-amber-700 font-bold">×</button>
                    </span>
                  );
                })}
                <span className="ml-auto text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  ~{totalCount} recipients
                </span>
              </div>
            )}
          </div>

          {/* Step 2 — Compose */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                2. Compose Message
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${charCount > 160 ? 'text-amber-600' : 'text-amber-300'}`}>
                  {charCount}/160
                </span>
                {charCount > 0 && (
                  <span className="text-xs text-amber-400 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                    {smsUnits} SMS
                  </span>
                )}
              </div>
            </div>

            <textarea
              rows={6}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm leading-relaxed transition-all"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}
            />
          </div>

          {/* Send button */}
          <div className="px-6 pb-6">
            <button onClick={handleSend}
              disabled={selectedGroups.length === 0 || !message.trim()}
              className="w-full py-4 rounded-2xl text-white font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, #92650A 0%, #D4AF37 50%, #92650A 100%)',
                boxShadow: '0 4px 20px rgba(184,134,11,0.4)',
              }}>
              {selectedGroups.length === 0
                ? 'Select a Group First'
                : `Send to ${totalCount} Member${totalCount !== 1 ? 's' : ''} →`}
            </button>
          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;1,500&display=swap');`}</style>
    </div>
  );
};

export default GroupMessage;
