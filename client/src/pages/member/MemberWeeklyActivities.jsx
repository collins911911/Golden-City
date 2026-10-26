import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const DAY_STYLES = {
  Sunday:    { grad: 'from-red-700 to-red-900',     light: 'bg-red-50 border-red-200',    text: 'text-red-900',    dot: 'bg-red-600' },
  Monday:    { grad: 'from-red-800 to-amber-800',   light: 'bg-amber-50 border-amber-200', text: 'text-amber-900',  dot: 'bg-amber-600' },
  Tuesday:   { grad: 'from-red-700 to-red-800',     light: 'bg-red-50 border-red-200',    text: 'text-red-900',    dot: 'bg-red-500' },
  Wednesday: { grad: 'from-amber-700 to-red-800',   light: 'bg-red-50 border-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
  Thursday:  { grad: 'from-red-900 to-red-700',     light: 'bg-red-50 border-red-200',    text: 'text-red-900',    dot: 'bg-red-700' },
  Friday:    { grad: 'from-amber-800 to-red-900',   light: 'bg-amber-50 border-amber-100', text: 'text-amber-900',  dot: 'bg-amber-700' },
  Saturday:  { grad: 'from-red-800 to-amber-700',   light: 'bg-amber-50 border-amber-200', text: 'text-amber-900',  dot: 'bg-amber-600' },
};

const MemberWeeklyActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [visible, setVisible]       = useState(false);
  const [activeDay, setActiveDay]   = useState(null);

  useEffect(() => {
    // Set active day to today
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setActiveDay(todayName);

    const fetch = async () => {
      try {
        const res = await axios.get('/activities');
        setActivities(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); setTimeout(() => setVisible(true), 80); }
    };
    fetch();
  }, []);

  // Group activities by day
  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = activities.filter((a) => a.day === day).sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  const daysWithActivities = DAYS.filter((d) => grouped[d].length > 0);
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const displayedDay  = activeDay || daysWithActivities[0];
  const displayedActs = grouped[displayedDay] || [];
  const style         = DAY_STYLES[displayedDay] || DAY_STYLES.Sunday;

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDF8F8] font-sans">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6B0F0F 0%, #B91C1C 50%, #92400E 100%)', minHeight: '200px' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-8 w-72 h-72 rounded-full border-[45px] border-white/5" />
          <div className="absolute -bottom-10 left-10 w-52 h-52 rounded-full border-[30px] border-white/5" />
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
              🗓️
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Weekly Schedule
              </h1>
              <p className="text-red-200 text-sm mt-0.5">{activities.length} activities this week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Day selector tabs */}
        <div className={`transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex gap-2 flex-wrap mb-8">
            {DAYS.map((day) => {
              const hasActs  = grouped[day].length > 0;
              const isActive = activeDay === day;
              const isToday  = day === todayName;
              const s        = DAY_STYLES[day];
              return (
                <button key={day}
                  onClick={() => setActiveDay(day)}
                  disabled={!hasActs}
                  className={`relative px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${s.grad} text-white border-transparent shadow-lg scale-105`
                      : hasActs
                        ? 'bg-white border-red-200 text-red-700 hover:border-red-400 hover:shadow'
                        : 'bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {day.slice(0, 3)}
                  {isToday && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                  )}
                  {hasActs && (
                    <span className={`ml-1.5 text-sm ${isActive ? 'text-white/70' : 'text-red-700'}`}>
                      {grouped[day].length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activities for selected day */}
        {displayedDay && (
          <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Day header */}
            <div className={`rounded-2xl bg-gradient-to-r ${style.grad} px-6 py-4 mb-5 flex items-center justify-between shadow-lg`}
              style={{ boxShadow: '0 4px 20px rgba(153,27,27,0.3)' }}>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-[0.3em]"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {displayedDay === todayName ? "Today's Activities" : 'Activities'}
                </p>
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {displayedDay}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white/30 tabular-nums"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  {displayedActs.length}
                </p>
                <p className="text-white/50 text-xs uppercase tracking-widest">
                  {displayedActs.length === 1 ? 'activity' : 'activities'}
                </p>
              </div>
            </div>

            {/* Timeline */}
            {displayedActs.length === 0 ? (
              <div className="text-center py-16 text-red-200 italic text-lg">No activities on this day.</div>
            ) : (
              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-red-300 via-red-200 to-transparent rounded-full" />

                <div className="space-y-4">
                  {displayedActs.map((act, i) => (
                    <div key={act._id}
                      className={`relative bg-white rounded-2xl border ${style.light} shadow hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden`}
                      style={{ transitionDelay: `${i * 60}ms` }}>

                      {/* Timeline dot */}
                      <div className={`absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${style.dot} border-2 border-white shadow`} />

                      {/* Left accent */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${style.grad}`} />

                      <div className="flex items-center gap-5 px-5 py-4 pl-6">
                        {/* Time */}
                        <div className="flex-shrink-0 text-center min-w-[56px]">
                          <p className={`text-lg font-black tabular-nums ${style.text}`}
                            style={{ fontFamily: "'Cinzel', serif" }}>
                            {act.time}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-10 bg-red-100 flex-shrink-0" />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-base ${style.text}`}
                            style={{ fontFamily: "'Cinzel', serif" }}>
                            {act.title}
                          </h4>
                          {act.location && (
                            <p className="text-red-700 text-sm mt-0.5 flex items-center gap-1">
                              <span>📍</span>{act.location}
                            </p>
                          )}
                          {act.description && (
                            <p className="text-red-600/70 text-sm mt-1">{act.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {activities.length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🗓️</p>
            <p className="text-red-700 text-lg italic">No activities scheduled yet.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default MemberWeeklyActivities;
