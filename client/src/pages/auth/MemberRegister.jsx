import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { errorMessage } from '../../utils/axios';
import { CrossLogo, PasswordInput } from '../../components/AuthIcons';

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

const isValidPhone = (p) => /^(\+?234|0)[789][01]\d{8}$/.test(p.replace(/[\s-]/g, ''));

// Shown after the request is sent
const RequestSubmitted = ({ name, onLogin }) => (
  <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md bg-white border border-amber-100 rounded-3xl p-8 shadow-xl shadow-amber-100/60 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center text-4xl">✓</div>
      <h1 className="mt-5 text-2xl font-bold text-gray-900">Request submitted</h1>
      <p className="mt-2 text-gray-600">
        Thank you{name ? `, ${name.split(' ')[0]}` : ''}! Your request to join the Golden City member portal has been sent.
      </p>

      <ol className="mt-6 text-left space-y-3">
        {[
          'A church admin will review your details.',
          'You will receive an SMS once you are approved (or if anything is missing).',
          'After approval, log in with your phone number and the password you just created.',
        ].map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="w-7 h-7 shrink-0 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
            <span className="text-gray-700">{step}</span>
          </li>
        ))}
      </ol>

      <button onClick={onLogin} className="gc-btn-gold mt-8">Go to login</button>
    </div>
  </div>
);

const MemberRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [form, setForm] = useState({
    name: '', phone: '', dateOfBirth: '', password: '', confirmPassword: '', categories: [],
  });

  const set = (key) => (e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setError(''); };

  const toggleCategory = (id) => {
    setError('');
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone || !form.dateOfBirth || !form.password) {
      setError('Please fill in all fields.'); return;
    }
    if (!isValidPhone(form.phone)) {
      setError('Enter a valid phone number, e.g. 08012345678.'); return;
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
        name:        form.name.trim(),
        phone:       form.phone,
        dateOfBirth: form.dateOfBirth,
        password:    form.password,
        categories:  form.categories,
      });
      setSubmitted(res.data.name || form.name);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(errorMessage(err, 'Registration failed. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <RequestSubmitted name={submitted} onLogin={() => navigate('/member-login')} />;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <CrossLogo />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Join Golden City</h1>
          <p className="text-amber-700 font-medium mt-1">Request access to the member portal</p>
        </div>

        <form onSubmit={handleSubmit} noValidate
          className="bg-white border border-amber-100 rounded-3xl p-7 shadow-xl shadow-amber-100/60">

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium text-center" role="alert">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="gc-label" htmlFor="name">Full name</label>
            <input id="name" type="text" autoComplete="name" placeholder="Enter your full name"
              value={form.name} onChange={set('name')} className="gc-input" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="gc-label" htmlFor="phone">Phone number</label>
              <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="08012345678"
                value={form.phone} onChange={set('phone')} className="gc-input" />
            </div>
            <div>
              <label className="gc-label" htmlFor="dob">Date of birth</label>
              <input id="dob" type="date" max={today}
                value={form.dateOfBirth} onChange={set('dateOfBirth')} className="gc-input" />
            </div>
          </div>

          <div className="mb-4">
            <label className="gc-label">Password</label>
            <PasswordInput value={form.password} onChange={set('password')}
              placeholder="At least 6 characters" autoComplete="new-password"
              show={showPass} onToggle={() => setShowPass(!showPass)} />
          </div>

          <div className="mb-6">
            <label className="gc-label">Confirm password</label>
            <PasswordInput value={form.confirmPassword} onChange={set('confirmPassword')}
              placeholder="Repeat your password" autoComplete="new-password"
              show={showConf} onToggle={() => setShowConf(!showConf)} />
            {form.confirmPassword.length > 0 && (
              <p className={`text-sm mt-1.5 font-medium ${form.password === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                {form.password === form.confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          <fieldset className="mb-7">
            <legend className="gc-label mb-2">Your group(s)</legend>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const selected = form.categories.includes(cat.id);
                return (
                  <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                    aria-pressed={selected}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left text-sm font-medium transition-colors ${
                      selected
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white border-amber-200 text-gray-800 hover:border-amber-400 hover:bg-amber-50'
                    }`}>
                    <span className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selected ? 'bg-white border-white' : 'border-amber-400'
                    }`}>
                      {selected && (
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="gc-btn-gold">
            {loading ? 'Sending request…' : 'Send registration request'}
          </button>

          <p className="text-center mt-6 text-gray-700">
            Already approved?{' '}
            <button type="button" onClick={() => navigate('/member-login')}
              className="text-amber-700 font-semibold underline underline-offset-2 hover:text-amber-900">
              Log in here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default MemberRegister;
