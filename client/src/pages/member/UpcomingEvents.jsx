import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const UpcomingEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [filter, setFilter]   = useState('upcoming'); // upcoming | all

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/agenda');
        setEvents(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); setTimeout(() => setVisible(true), 80); }
    };
    fetch();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const displayed = events
    .filter((e) => {
      const d = new Date(e.date);
      return filter === 'upcoming' ? d >= today : true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group by month
  const grouped = displayed.reduce((acc, event) => {
    const d     = new Date(event.date);
    const key   = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const isToday = (dateStr) => {
    const d = new Date(dateStr);
    return d.toDateString() === new Date().toDateString();
  };

  const isPast = (dateStr) => new Date(dateStr) < today;

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDF8F8] font-sans">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6B0F0F 0%, #991B1B 50%, #B45309 100%)', minHeight: '200px' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border-[40px] border-white/5" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border-[30px] border-white/5 translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className={`relative z-10 max-w-4xl mx-auto px-6 py-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={() => navigate('/member-dashboard')}
            className="flex items-center gap-2 text-red-200 text-xs font-semibold uppercase tracking-widest hover:text-white transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl shadow-lg">
              📅
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Upcoming Events
              </h1>
              <p className="text-red-200 text-sm mt-0.5">{displayed.length} events scheduled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Filter tabs */}
        <div className={`flex gap-2 mb-8 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'all',      label: 'All Events' },
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

        {/* Events grouped by month */}
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📅</p>
            <p className="text-red-700 text-lg italic">No events scheduled yet.</p>
          </div>
        )}

        <div className="space-y-10">
          {Object.entries(grouped).map(([month, monthEvents], gi) => (
            <div key={month}
              className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${gi * 100 + 200}ms` }}>

              {/* Month header */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xs font-bold text-red-700 uppercase tracking-[0.3em]"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {month}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-red-200 to-transparent" />
              </div>

              <div className="space-y-3">
                {monthEvents.map((event) => {
                  const d      = new Date(event.date);
                  const today_ = isToday(event.date);
                  const past   = isPast(event.date);

                  return (
                    <div key={event._id}
                      className={`group relative bg-white rounded-2xl border shadow hover:shadow-lg transition-all duration-300 overflow-hidden ${
                        today_ ? 'border-red-400 ring-2 ring-red-200' :
                        past   ? 'border-gray-200 opacity-75' : 'border-red-100 hover:border-red-300'
                      }`}>

                      {today_ && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-amber-400 to-red-500" />
                      )}

                      <div className="flex items-center gap-5 px-5 py-4">
                        {/* Date block */}
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-sm ${
                          today_ ? 'bg-gradient-to-br from-red-600 to-red-800'
                                 : past ? 'bg-gray-100' : 'bg-gradient-to-br from-red-700 to-amber-700'
                        }`}>
                          <span className={`text-xs font-bold uppercase leading-none ${today_ || !past ? 'text-white' : 'text-gray-600'}`}
                            style={{ fontFamily: "'Cinzel', serif" }}>
                            {MONTHS[d.getMonth()]}
                          </span>
                          <span className={`text-2xl font-black leading-none ${today_ || !past ? 'text-white' : 'text-gray-600'}`}
                            style={{ fontFamily: "'Cinzel', serif" }}>
                            {d.getDate()}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {event.title}
                            </h4>
                            {today_ && (
                              <span className="text-xs bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider animate-pulse"
                                style={{ fontFamily: "'Cinzel', serif" }}>
                                Today
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-gray-800 text-base font-medium mt-1 whitespace-pre-wrap">{event.description}</p>
                          )}
                          {event.time && (
                            <p className="text-amber-800 text-sm font-semibold mt-1">⏰ {event.time}</p>
                          )}
                        </div>

                        {/* Day of week */}
                        <div className="flex-shrink-0 text-right hidden sm:block">
                          <p className="text-xs text-red-700 font-semibold uppercase tracking-widest"
                            style={{ fontFamily: "'Cinzel', serif" }}>
                            {d.toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default UpcomingEvents;
