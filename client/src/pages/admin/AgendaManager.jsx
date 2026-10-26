import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const AgendaManager = () => {
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [success, setSuccess] = useState('');
  const [form, setForm]       = useState({
    title: '', description: '', date: '', time: '', year: new Date().getFullYear(),
  });

  const fetchItems = async () => {
    try { const res = await axios.get('/agenda'); setItems(res.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const resetForm = () => setForm({ title: '', description: '', date: '', time: '', year: new Date().getFullYear() });

  const handleSubmit = async () => {
    if (!form.title || !form.date) return;
    try {
      if (editing) {
        await axios.put(`/agenda/${editing}`, form);
        flash('Agenda item updated!');
        setEditing(null);
      } else {
        await axios.post('/agenda', form);
        flash('Agenda item added!');
        setAdding(false);
      }
      resetForm();
      fetchItems();
    } catch { }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/agenda/${id}`);
    setItems((p) => p.filter((i) => i._id !== id));
    flash('Deleted.');
  };

  const openEdit = (item) => {
    setEditing(item._id);
    setAdding(false);
    setForm({
      title: item.title,
      description: item.description || '',
      date: item.date,
      time: item.time || '',
      year: item.year,
    });
  };

  const cancelForm = () => {
    setAdding(false);
    setEditing(null);
    resetForm();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDFBF5] font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-amber-800 text-sm font-semibold uppercase tracking-widest hover:text-amber-800 transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-yellow-500 to-amber-700" />
              <h1 className="text-3xl font-bold text-amber-900 uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Yearly Agenda
              </h1>
            </div>
            {!adding && !editing && (
              <button onClick={() => setAdding(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold uppercase tracking-widest shadow hover:shadow-lg transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                + Add Event
              </button>
            )}
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm text-center font-semibold">
            {success}
          </div>
        )}

        {/* ── INLINE FORM — not a sub-component ── */}
        {(adding || editing) && (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-lg p-6 mb-6">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}>
              {editing ? 'Edit Agenda Item' : 'New Agenda Item'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                placeholder="Event Title *"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-gray-900 text-base font-semibold placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-gray-900 text-base font-semibold placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                className="px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-gray-900 text-base font-semibold placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder="Year"
                value={form.year}
                onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                className="px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-gray-900 text-base font-semibold placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <textarea
              rows={3}
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-gray-900 text-base font-medium placeholder-gray-400 resize-none focus:outline-none focus:border-amber-500 mb-4"
            />

            <div className="flex gap-3">
              <button onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                {editing ? 'Update' : 'Add Event'}
              </button>
              <button onClick={cancelForm}
                className="px-6 py-2.5 rounded-xl border border-amber-200 text-amber-700 text-sm font-bold uppercase tracking-widest hover:bg-amber-50 transition-all"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Items list */}
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="text-center py-16 text-amber-700 text-lg italic">No agenda items yet.</div>
          )}
          {[...items].sort((a, b) => new Date(a.date) - new Date(b.date)).map((item) => (
            <div key={item._id}
              className="bg-white rounded-2xl border border-amber-100 shadow hover:shadow-md transition-shadow px-6 py-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex flex-col items-center justify-center shadow text-white flex-shrink-0">
                  <span className="text-xs font-bold leading-none uppercase">
                    {new Date(item.date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-lg font-black leading-none">{new Date(item.date).getDate()}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{item.title}</p>
                  {item.time && <p className="text-amber-800 text-sm font-semibold">⏰ {item.time}</p>}
                  {item.description && <p className="text-gray-800 text-base font-medium mt-1 whitespace-pre-wrap">{item.description}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)}
                  className="px-4 py-2 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-widest hover:bg-amber-50 transition-all"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(item._id)}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgendaManager;