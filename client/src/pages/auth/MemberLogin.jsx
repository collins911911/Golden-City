import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios, { errorMessage } from '../../utils/axios';
import { CrossLogo, PasswordInput } from '../../components/AuthIcons';

const MemberLogin = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null); // { text, pending }
  const [showPass, setShowPass] = useState(false);
  const [form, setForm]         = useState({ phone: '', password: '' });

  const set = (key) => (e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setError(null); };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!form.phone || !form.password) {
      setError({ text: 'Please enter your phone number and password.' });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/auth/member/login', form);
      login(res.data);
      navigate('/member-dashboard', { replace: true });
    } catch (err) {
      // 403 = registration pending or rejected → show as information, not a red error
      setError({ text: errorMessage(err, 'Invalid phone number or password.'), pending: err.response?.status === 403 });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <CrossLogo size="w-20 h-20" />
          <h1 className="mt-5 text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-amber-700 font-medium mt-1">Golden City Church member portal</p>
        </div>

        <form onSubmit={handleLogin} noValidate
          className="bg-white border border-amber-100 rounded-3xl p-7 shadow-xl shadow-amber-100/60">

          {error && (
            <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium text-center border ${
              error.pending ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-red-50 border-red-200 text-red-700'
            }`} role="alert">
              {error.pending && <span className="block text-lg mb-1">⏳</span>}
              {error.text}
            </div>
          )}

          <div className="mb-4">
            <label className="gc-label" htmlFor="phone">Phone number</label>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel"
              placeholder="e.g. 08012345678"
              value={form.phone} onChange={set('phone')}
              className="gc-input" />
          </div>

          <div className="mb-6">
            <label className="gc-label" htmlFor="password">Password</label>
            <PasswordInput
              value={form.password}
              onChange={set('password')}
              placeholder="Your password"
              show={showPass}
              onToggle={() => setShowPass(!showPass)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="gc-btn-gold">
            {loading ? 'Signing in…' : 'Log in'}
          </button>

          <p className="text-center mt-6 text-gray-700">
            New member?{' '}
            <button type="button" onClick={() => navigate('/register')}
              className="text-amber-700 font-semibold underline underline-offset-2 hover:text-amber-900">
              Register here
            </button>
          </p>
          <p className="text-center mt-2">
            <button type="button" onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-amber-700">
              ← Back to home
            </button>
          </p>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Golden City Church
        </p>
      </div>
    </div>
  );
};

export default MemberLogin;
