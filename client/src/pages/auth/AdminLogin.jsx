import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import LoadingScreen from '../../components/LoadingScreen';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', passcode: '' });

  const handleLogin = async () => {
    setError('');
    if (!form.username || !form.password || !form.passcode) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/auth/admin/login', form);
      login(res.data);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-yellow-50" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-200 opacity-20 blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Emblem */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-2xl mb-4"
            style={{ boxShadow: '0 8px 32px rgba(212,175,55,0.45)' }}
          >
            <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
              <rect x="28" y="6" width="8" height="52" rx="3" fill="white" />
              <rect x="12" y="18" width="40" height="8" rx="3" fill="white" />
            </svg>
          </div>
          <h1
            className="text-xl font-bold text-yellow-800 uppercase tracking-[0.2em]"
          >
            Admin Access
          </h1>
          <p className="text-xs text-yellow-500 tracking-widest mt-0.5 uppercase">
            Golden City Church
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-yellow-100 shadow-2xl p-8">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-yellow-200 bg-yellow-50/30 text-gray-800 font-bold placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-yellow-200 bg-yellow-50/30 text-gray-800 font-bold placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-700 transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.033 10.033 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21f-9 9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Passcode */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2">
              Admin Passcode
            </label>
            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                placeholder="Enter passcode"
                value={form.passcode}
                onChange={(e) => setForm({ ...form, passcode: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-yellow-200 bg-yellow-50/30 text-gray-800 font-bold placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-700 transition-colors"
                aria-label={showCode ? 'Hide passcode' : 'Show passcode'}
              >
                {showCode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.033 10.033 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21f-9 9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            Enter Dashboard
          </button>
        </div>

        <p className="text-center text-xs text-yellow-300 mt-6 tracking-widest uppercase">
          Authorised Personnel Only
        </p>
      </div>

    </div>
  );
};

export default AdminLogin;