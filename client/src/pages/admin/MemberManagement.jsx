import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const CATEGORIES = [
  { id: 'men',              label: 'Men',                   emoji: '👨' },
  { id: 'women',            label: 'Women',                 emoji: '👩' },
  { id: 'youths',           label: 'Youths',                emoji: '🧑' },
  { id: 'men-excos',        label: 'Men Excos',             emoji: '👔' },
  { id: 'women-excos',      label: 'Women Excos',           emoji: '👗' },
  { id: 'youth-excos',      label: 'Youth Excos',           emoji: '🎓' },
  { id: 'workers',          label: 'Workers',               emoji: '🛠️' },
  { id: 'ffcc',             label: 'FFCC',                  emoji: '✝️' },
  { id: 'church-committee', label: 'Church Committee',      emoji: '📋' },
  { id: 'choir',            label: 'Choir / Instrumentalist', emoji: '🎵' },
];

const MemberManagement = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await axios.get('/admin/members');
      setMembers(res.data);
    } catch { setError('Could not load members.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    const matchGroup = filterGroup === 'all' || m.categories?.includes(filterGroup);
    return matchSearch && matchGroup;
  });

  const openEdit = (member) => {
    setEditing(member._id);
    setEditForm({ name: member.name, phone: member.phone, dateOfBirth: member.dateOfBirth, categories: [...member.categories] });
  };

  const toggleEditCat = (id) => {
    setEditForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`/admin/members/${editing}`, editForm);
      setSuccess('Member updated successfully.');
      setEditing(null);
      fetchMembers();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Update failed.'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`/admin/members/${id}`);
      setMembers((prev) => prev.filter((m) => m._id !== id));
      setDeleting(null);
      setSuccess('Member removed.');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Delete failed.'); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDFBF5] font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
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
              <div>
                <h1 className="text-3xl font-bold text-amber-900 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
                  Members
                </h1>
                <p className="text-amber-700 text-sm">{members.length} total registered</p>
              </div>
            </div>
          </div>
        </div>

        {success && <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm text-center font-semibold">{success}</div>}
        {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm text-center">{error}</div>}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow p-5 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700">🔍</span>
            <input type="text" placeholder="Search name or phone..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/30 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
          </div>
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/30 text-sm text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            style={{ fontFamily: "'Cinzel', serif" }}>
            <option value="all">All Groups</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
        </div>

        {/* Member cards */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-amber-700 text-lg italic">No members found.</div>
          )}
          {filtered.map((member) => (
            <div key={member._id} className="bg-white rounded-2xl border border-amber-100 shadow hover:shadow-md transition-shadow overflow-hidden">
              {editing === member._id ? (
                /* Edit form */
                <div className="p-6">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
                    Editing Member
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <input type="text" placeholder="Full name" value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    <input type="tel" placeholder="Phone" value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    <input type="date" value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.id} onClick={() => toggleEditCat(cat.id)}
                        className={`flex items-center gap-1 px-2 py-2 rounded-xl border text-sm font-medium transition-all ${
                          editForm.categories?.includes(cat.id)
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-amber-200 text-amber-700 hover:border-amber-400'
                        }`}>
                        <span>{cat.emoji}</span><span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveEdit} disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold uppercase tracking-widest disabled:opacity-50 hover:shadow-lg transition-all"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="px-6 py-2.5 rounded-xl border border-amber-200 text-amber-700 text-sm font-bold uppercase tracking-widest hover:bg-amber-50 transition-all"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Member row */
                <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm shadow"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-amber-900" style={{ fontFamily: "'Cinzel', serif" }}>{member.name}</p>
                      <p className="text-amber-700 text-sm">{member.phone} · DOB: {member.dateOfBirth}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.categories?.map((c) => {
                          const cat = CATEGORIES.find((x) => x.id === c);
                          return (
                            <span key={c} className="text-sm bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2 py-0.5">
                              {cat?.emoji} {cat?.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(member)}
                      className="px-4 py-2 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-widest hover:bg-amber-50 transition-all"
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      Edit
                    </button>
                    {deleting === member._id ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-red-500 font-semibold">Sure?</span>
                        <button onClick={() => confirmDelete(member._id)}
                          className="px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all">
                          Yes
                        </button>
                        <button onClick={() => setDeleting(null)}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest">
                          No
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleting(member._id)}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                        style={{ fontFamily: "'Cinzel', serif" }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;
