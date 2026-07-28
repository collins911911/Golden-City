import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import PageLoader from '../../components/PageLoader';

// SVG Eye icons
const EyeOpen = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// Check icon for selected category
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CATEGORIES = [
  { id: 'men',              label: 'Men' },
  { id: 'women',            label: 'Women' },
  { id: 'youths',           label: 'Youths' },
  { id: 'men-excos',        label: 'Men Excos' },
  { id: 'women-excos',      label: 'Women Excos' },
  { id: 'youth-excos',      label: 'Youth Excos' },
  { id: 'workers',          label: 'Workers' },
  { id: 'ffcc',             label: 'FFCC' },
  { id: 'church-committee', label: 'Church Committee' },
  { id: 'choir',            label: 'Choir / Instrumentalist' },
];

const MemberRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', dateOfBirth: '',
    password: '', confirmPassword: '', categories: [],
  });

  const toggleCategory = (id) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.phone || !form.dateOfBirth || !form.password) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (form.categories.length === 0) {
      setError('Please select at least one group.'); return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/auth/member/register', {
        name:        form.name,
        phone:       form.phone,
        dateOfBirth: form.dateOfBirth,
        password:    form.password,
        categories:  form.categories,
      });
      login(res.data);
      navigate('/member-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}>

      {/* Background blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-yellow-50 blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full bg-amber-50 blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-30 blur-lg scale-125 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-xl mx-auto"
              style={{ boxShadow: '0 4px 24px rgba(212,175,55,0.45)' }}>
              <svg viewBox="0 0 64 64" className="w-8 h-8" fill="none">
                <rect x="28" y="6" width="8" height="52" rx="3" fill="white" />
                <rect x="12" y="18" width="40" height="8" rx="3" fill="white" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-black text-black uppercase tracking-widest"
            style={{ fontFamily: "'Cinzel', serif" }}>
            Join Golden City
          </h1>
          <p className="text-amber-700 font-bold text-lg mt-1">
            Register as a church member
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="w-8 h-px bg-amber-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <div className="w-8 h-px bg-amber-300" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-amber-100 rounded-3xl shadow-2xl p-8"
          style={{ boxShadow: '0 8px 40px rgba(212,175,55,0.12)' }}>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-base font-bold text-center">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="mb-5">
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-4 rounded-xl border-2 border-amber-200 bg-white text-black font-bold text-base placeholder-amber-300 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 08012345678"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-4 py-4 rounded-xl border-2 border-amber-200 bg-white text-black font-bold text-base placeholder-amber-300 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Date of Birth */}
          <div className="mb-5">
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
              className="w-full px-4 py-4 rounded-xl border-2 border-amber-200 bg-white text-black font-bold text-base focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Create a password (min 6 characters)"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-4 pr-14 rounded-xl border-2 border-amber-200 bg-white text-black font-bold text-base placeholder-amber-300 focus:outline-none focus:border-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-800 transition-colors">
                {showPass ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-4 py-4 pr-14 rounded-xl border-2 border-amber-200 bg-white text-black font-bold text-base placeholder-amber-300 focus:outline-none focus:border-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConf(!showConf)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-800 transition-colors">
                {showConf ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {/* Password match indicator */}
            {form.confirmPassword.length > 0 && (
              <p className={`text-sm mt-2 font-bold ${form.password === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                {form.password === form.confirmPassword
                  ? 'Passwords match'
                  : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="mb-7">
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-3"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Select Your Group(s)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const selected = form.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      selected
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white border-amber-200 text-black hover:border-amber-500 hover:bg-amber-50'
                    }`}>
                    {/* Checkbox */}
                    <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selected
                        ? 'bg-white border-white'
                        : 'border-amber-400'
                    }`}>
                      {selected && (
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-black truncate ${selected ? 'text-white' : 'text-black'}`}
                      style={{ fontFamily: "'Cinzel', serif" }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, #92650A 0%, #D4AF37 50%, #92650A 100%)',
              boxShadow: '0 6px 24px rgba(212,175,55,0.45)',
            }}>
            Register Now
          </button>

          {/* Login link */}
          <div className="text-center mt-5">
            <p className="text-base font-bold text-black">
              Already registered?{' '}
              <button
                onClick={() => navigate('/member-login')}
                className="text-amber-700 font-black underline underline-offset-2 hover:text-amber-900 transition-colors"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default MemberRegister;