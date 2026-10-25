import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_COLORS = {
  Monday:    'from-amber-400 to-yellow-500',
  Tuesday:   'from-yellow-500 to-amber-600',
  Wednesday: 'from-amber-500 to-yellow-600',
  Thursday:  'from-yellow-400 to-amber-500',
  Friday:    'from-amber-600 to-yellow-700',
  Saturday:  'from-yellow-600 to-amber-700',
  Sunday:    'from-amber-700 to-yellow-800',
};

const WeeklyActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [editing, setEditing]       = useState(null);
  const [success, setSuccess]       = useState('');

  // ── Each field is its own state — no object, no re-mount bug ──
  const [actTitle, setActTitle]           = useState('');
  const [actDay, setActDay]               = useState('Sunday');
  const [actTime, setActTime]             = useState('');
  const [actLocation, setActLocation]     = useState('');
  const [actDescription, setActDescription] = useState('');

  const fetchActivities = async () => {
    try { const res = await axios.get('/activities'); setActivities(res.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchActivities(); }, []);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const resetForm = () => {
    setActTitle('');
    setActDay('Sunday');
    setActTime('');
    setActLocation('');
    setActDescription('');
  };

  const handleSubmit = async () => {
    if (!actTitle || !actTime) return;
    const payload = {
      title:       actTitle,
      day:         actDay,
      time:        actTime,
      location:    actLocation,
      description: actDescription,
    };
    try {
      if (editing) {
        await axios.put(`/activities/${editing}`, payload);
        flash('Activity updated!');
        setEditing(null);
      } else {
        await axios.post('/activities', payload);
        flash('Activity added!');
        setAdding(false);
      }
      resetForm();
      fetchActivities();
    } catch { }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/activities/${id}`);
    setActivities((p) => p.filter((a) => a._id !== id));
    flash('Deleted.');
  };

  const openEdit = (act) => {
    setEditing(act._id);
    setAdding(false);
    setActTitle(act.title);
    setActDay(act.day);
    setActTime(act.time);
    setActLocation(act.location || '');
    setActDescription(act.description || '');
  };

  const cancelForm = () => {
    setAdding(false);
    setEditing(null);
    resetForm();
  };

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = activities.filter((a) => a.day === day);
    return acc;
  }, {});

  if (loading) return <LoadingScreen />;

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
                Weekly Schedule
              </h1>
            </div>
            {!adding && !editing && (
              <button onClick={() => setAdding(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold uppercase tracking-widest shadow hover:shadow-lg transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                + Add Activity
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
              {editing ? 'Edit Activity' : 'New Activity'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Activity Title *"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                className="px-4 py-3 rounded-xl border border-amber-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <select
                value={actDay}
                onChange={(e) => setActDay(e.target.value)}
                className="px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                style={{ fontFamily: "'Cinzel', serif" }}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input
                type="time"
                value={actTime}
                onChange={(e) => setActTime(e.target.value)}
                className="px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                type="text"
                placeholder="Location (optional)"
                value={actLocation}
                onChange={(e) => setActLocation(e.target.value)}
                className="px-4 py-3 rounded-xl border border-amber-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <textarea
              rows={2}
              placeholder="Description (optional)"
              value={actDescription}
              onChange={(e) => setActDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
            />

            <div className="flex gap-3">
              <button onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                {editing ? 'Update' : 'Add Activity'}
              </button>
              <button onClick={cancelForm}
                className="px-6 py-2.5 rounded-xl border border-amber-200 text-amber-700 text-sm font-bold uppercase tracking-widest hover:bg-amber-50 transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Activities grouped by day */}
        <div className="space-y-4">
          {activities.length === 0 && (
            <div className="text-center py-16 text-amber-300 text-lg italic">No activities added yet.</div>
          )}
          {DAYS.map((day) => (
            grouped[day].length > 0 && (
              <div key={day} className="bg-white rounded-2xl border border-amber-100 shadow overflow-hidden">
                <div className={`bg-gradient-to-r ${DAY_COLORS[day]} px-6 py-3 flex items-center justify-between`}>
                  <p className="text-white font-bold uppercase tracking-widest text-sm"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                    {day}
                  </p>
                  <span className="text-white/70 text-xs">
                    {grouped[day].length} {grouped[day].length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
                <div className="divide-y divide-amber-50">
                  {grouped[day].map((act) => (
                    <div key={act._id} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-black text-amber-700 tabular-nums min-w-[56px]">
                          {act.time}
                        </p>
                        <div>
                          <p className="font-bold text-amber-900"
                            style={{ fontFamily: "'Cinzel', serif" }}>
                            {act.title}
                          </p>
                          {act.location && <p className="text-amber-400 text-xs">📍 {act.location}</p>}
                          {act.description && <p className="text-amber-600 text-sm">{act.description}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(act)}
                          className="px-4 py-2 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-widest hover:bg-amber-50 transition-all"
                          style={{ fontFamily: "'Cinzel', serif" }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(act._id)}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                          style={{ fontFamily: "'Cinzel', serif" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyActivities;
