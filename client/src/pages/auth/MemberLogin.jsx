import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import PageLoader from '../../components/PageLoader';

// SVG Eye icons — clean, no emoji
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

const MemberLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [visible, setVisible]   = useState(false);
  const [form, setForm]         = useState({ phone: '', password: '' });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!form.phone || !form.password) {
      setError('Please enter your phone number and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/auth/member/login', form);
      login(res.data);
      navigate('/member-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}>

      {/* Background blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-yellow-50 blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 rounded-full bg-amber-50 blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo + heading */}
        <div className={`text-center mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="relative inline-flex mb-5">
            <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-25 blur-xl scale-150 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl mx-auto"
              style={{ boxShadow: '0 8px 32px rgba(212,175,55,0.5)' }}>
              <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
                <rect x="28" y="6" width="8" height="52" rx="3" fill="white" />
                <rect x="12" y="18" width="40" height="8" rx="3" fill="white" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-black text-amber-900 uppercase tracking-widest"
            style={{ fontFamily: "'Cinzel', serif" }}>
            Welcome Back
          </h1>
          <p className="text-amber-700 mt-1 font-bold text-lg">
            Golden City Church
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="w-8 h-px bg-amber-300" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-8 h-px bg-amber-300" />
          </div>
        </div>

        {/* Card */}
        <div className={`bg-white border border-amber-100 rounded-3xl shadow-2xl p-8 transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ boxShadow: '0 8px 40px rgba(212,175,55,0.15)' }}>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-base font-bold text-center">
              {error}
            </div>
          )}

          {/* Phone */}
          <div className="mb-5">
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-4 py-4 rounded-xl border-2 border-amber-200 bg-white text-black font-bold text-base placeholder-amber-300 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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

          {/* Login button */}
          <button
            onClick={handleLogin}
            className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, #92650A 0%, #D4AF37 50%, #92650A 100%)',
              boxShadow: '0 6px 24px rgba(212,175,55,0.45)',
            }}>
            Enter Member Portal
          </button>

          {/* Links */}
          <div className="text-center mt-6 space-y-3">
            <p className="text-base font-bold text-black">
              New member?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-amber-700 font-black underline underline-offset-2 hover:text-amber-900 transition-colors">
                Register here
              </button>
            </p>
            <p className="text-sm font-bold text-amber-500">
              <button
                onClick={() => navigate('/')}
                className="hover:text-amber-700 transition-colors">
                Back to Home
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs font-bold text-amber-300 mt-6 tracking-widest uppercase"
          style={{ fontFamily: "'Cinzel', serif" }}>
          {new Date().getFullYear()} Golden City Church
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default MemberLogin;