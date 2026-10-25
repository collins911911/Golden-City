import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const SelectiveMessage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`/admin/members/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const toggleSelect = (member) => {
    setSelected((prev) =>
      prev.find((m) => m._id === member._id)
        ? prev.filter((m) => m._id !== member._id)
        : [...prev, member]
    );
  };

  const removeSelected = (id) => setSelected((prev) => prev.filter((m) => m._id !== id));

  const handleSend = async () => {
    if (selected.length === 0) { setError('Select at least one member.'); return; }
    if (!message.trim()) { setError('Please type a message.'); return; }
    setError('');
    setSending(true);
    try {
      await axios.post('/messages/selective', {
        recipients: selected.map((m) => m.phone),
        content: message,
        sentBy: user?.name,
      });
      setSent(true);
      setSelected([]);
      setMessage('');
      setQuery('');
    } catch (err) {
      setError(err.response?.data?.message || 'Send failed. Try again.');
    } finally {
      setSending(false);
    }
  };

  if (sending) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDFBF5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-amber-600 text-sm font-semibold uppercase tracking-widest hover:text-amber-800 transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-yellow-500 to-amber-700" />
            <h1 className="text-3xl font-bold text-amber-900 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
              Selective Message
            </h1>
          </div>
          <p className="text-amber-600 mt-1 ml-4 text-sm">Search and pick specific members to message</p>
        </div>

        {sent && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-bold text-green-800" style={{ fontFamily: "'Cinzel', serif" }}>Message Sent!</p>
              <p className="text-green-600 text-sm">Your SMS was delivered to the selected members.</p>
            </div>
            <button onClick={() => setSent(false)} className="ml-auto text-green-400 hover:text-green-600 text-xl">×</button>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="bg-white rounded-3xl border border-amber-100 shadow-xl overflow-hidden">
          {/* Step 1: Search */}
          <div className="p-6 border-b border-amber-50">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
              1. Search Members
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400">🔍</span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by name or phone number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-sm"
              />
              {searching && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs animate-pulse">
                  Searching...
                </span>
              )}
            </div>

            {/* Search results */}
            {results.length > 0 && (
              <div className="mt-3 border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
                {results.map((member) => {
                  const isSelected = selected.find((m) => m._id === member._id);
                  return (
                    <button
                      key={member._id}
                      onClick={() => toggleSelect(member)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left border-b border-amber-50 last:border-0 transition-colors ${
                        isSelected ? 'bg-amber-50' : 'bg-white hover:bg-amber-50/50'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-amber-900 text-sm">{member.name}</p>
                        <p className="text-amber-400 text-xs">{member.phone} · {member.categories?.join(', ')}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'bg-amber-500 border-amber-500' : 'border-amber-300'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {query && !searching && results.length === 0 && (
              <p className="text-center text-amber-400 text-sm mt-3 italic">No members found for "{query}"</p>
            )}
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="px-6 py-4 border-b border-amber-50 bg-amber-50/30">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                Selected ({selected.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((m) => (
                  <span
                    key={m._id}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-semibold rounded-full px-3 py-1.5 shadow-sm"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {m.name}
                    <button
                      onClick={() => removeSelected(m._id)}
                      className="text-white/70 hover:text-white ml-0.5 text-sm leading-none"
                    >×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Message composer */}
          <div className="p-6">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
              2. Compose Message
            </p>
            <textarea
              rows={5}
              placeholder="Type your personal message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm leading-relaxed transition-all"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}
            />
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={handleSend}
              disabled={selected.length === 0 || !message.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              style={{ fontFamily: "'Cinzel', serif", boxShadow: '0 4px 20px rgba(184,134,11,0.4)' }}
            >
              Send to {selected.length} {selected.length === 1 ? 'Member' : 'Members'} →
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SelectiveMessage;
