import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const BirthdaySettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');
  const [visible, setVisible]   = useState(false);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [charCount, setCharCount] = useState(0);

  const [settings, setSettings] = useState({
    template: "Happy Birthday {name}! 🎉🎂 The Golden City Church family celebrates you today. May God bless you abundantly and grant you many more glorious years. We love you! 🙏✝️",
    sendTime: '08:00',
    enabled:  true,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [settRes, bdRes] = await Promise.all([
          axios.get('/admin/birthday-settings'),
          axios.get('/admin/birthday-today'),
        ]);
        if (settRes.data) {
          setSettings(settRes.data);
          setCharCount(settRes.data.template?.length || 0);
        }
        setTodayBirthdays(bdRes.data || []);
      } catch { /* use defaults */ }
      finally { setLoading(false); setTimeout(() => setVisible(true), 80); }
    };
    fetchAll();
  }, []);

  const handleTemplateChange = (e) => {
    setSettings((prev) => ({ ...prev, template: e.target.value }));
    setCharCount(e.target.value.length);
  };

  const handleSave = async () => {
    if (!settings.template.trim()) {
      setError('Template cannot be empty.'); return;
    }
    setSaving(true); setError('');
    try {
      await axios.put('/admin/birthday-settings', settings);
      setSuccess('Birthday settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Could not save settings. Try again.'); }
    finally { setSaving(false); }
  };

  const previewMessage = settings.template.replace(/{name}/gi, 'Brother Emmanuel');
  const smsUnits = Math.ceil(charCount / 160) || 1;

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDFBF5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C5A00 0%, #B8860B 50%, #DAA520 100%)', minHeight: '180px' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full border-[40px] border-white -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border-[25px] border-white translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-200/60 to-transparent" />

        <div className={`relative z-10 max-w-3xl mx-auto px-6 py-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-yellow-200 text-xs font-semibold uppercase tracking-widest hover:text-white transition-colors mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ← Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl shadow-lg">
              🎂
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Birthday Settings
              </h1>
              <p className="text-yellow-200 text-sm mt-0.5">
                Auto-SMS fires every day at {settings.sendTime} — Lagos time
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm text-center font-semibold">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Today's Birthdays */}
        {todayBirthdays.length > 0 && (
          <div className={`bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ fontFamily: "'Cinzel', serif" }}>
              🎂 Today's Birthdays — {todayBirthdays.length} {todayBirthdays.length === 1 ? 'person' : 'people'}
            </p>
            <div className="flex flex-wrap gap-2">
              {todayBirthdays.map((m) => (
                <div key={m._id}
                  className="flex items-center gap-2 bg-white border border-amber-200 rounded-full px-3 py-1.5 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-amber-900">{m.name}</span>
                  <span className="text-xs text-amber-400">{m.phone}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main settings card */}
        <div className={`bg-white rounded-3xl border border-amber-100 shadow-xl overflow-hidden transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          {/* Toggle */}
          <div className="p-6 border-b border-amber-50 flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-900 text-lg" style={{ fontFamily: "'Cinzel', serif" }}>
                Auto Birthday SMS
              </p>
              <p className="text-amber-500 text-sm mt-0.5">
                {settings.enabled
                  ? '✅ Enabled — system will auto-send on birthdays'
                  : '⛔ Disabled — no birthday SMS will be sent'}
              </p>
            </div>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                settings.enabled
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                  : 'bg-gray-200'
              }`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                settings.enabled ? 'left-7' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Send time — display only, cron is fixed at 8am */}
          <div className="p-6 border-b border-amber-50">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1"
              style={{ fontFamily: "'Cinzel', serif" }}>
              Send Time
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-2xl font-black text-amber-800 tabular-nums"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                    8:00 AM
                  </p>
                  <p className="text-amber-400 text-xs">Lagos time — every day</p>
                </div>
              </div>
              <p className="text-amber-500 text-sm italic">
                The system checks birthdays every day at 8:00 AM and sends SMS automatically.
              </p>
            </div>
          </div>

          {/* Message template */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Message Template
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${charCount > 160 ? 'text-amber-600 font-bold' : 'text-amber-300'}`}>
                  {charCount}/160
                </span>
                {charCount > 0 && (
                  <span className="text-xs bg-amber-50 border border-amber-200 text-amber-600 rounded-full px-2 py-0.5">
                    {smsUnits} SMS unit{smsUnits > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-amber-400 italic mb-3">
              Use{' '}
              <code className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-lg font-mono">
                {'{name}'}
              </code>{' '}
              — it will be replaced with each member's actual name automatically.
            </p>

            <textarea
              rows={5}
              value={settings.template}
              onChange={handleTemplateChange}
              className="w-full px-4 py-4 rounded-2xl border border-amber-200 bg-amber-50/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none transition-all text-sm leading-relaxed"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}
            />

            {/* Live preview */}
            <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Cinzel', serif" }}>
                Live Preview — how it will look to the member
              </p>
              <p className="text-sm text-amber-900 leading-relaxed">{previewMessage}</p>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full py-4 rounded-2xl text-white font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, #92650A 0%, #D4AF37 50%, #92650A 100%)',
                boxShadow: '0 4px 20px rgba(184,134,11,0.4)',
              }}>
              {saving ? 'Saving...' : 'Save Birthday Settings ✝️'}
            </button>
          </div>
        </div>

        {/* Info box */}
        <div className={`bg-white rounded-2xl border border-amber-100 shadow p-5 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Cinzel', serif" }}>
            ℹ️ How It Works
          </p>
          <div className="space-y-2 text-sm text-amber-700">
            <p>🕗 Every day at <strong>8:00 AM Lagos time</strong>, the system automatically checks MongoDB for members whose birthday matches today's date.</p>
            <p>📱 Each birthday member receives a <strong>personalised SMS</strong> with their name inserted where you placed <code className="bg-amber-50 border border-amber-100 px-1 rounded text-xs">{'{name}'}</code>.</p>
            <p>📜 Every sent birthday SMS is logged in <strong>Message History</strong> with delivery status.</p>
            <p>🔑 Make sure your <strong>Termii API key</strong> is set in the server <code className="bg-amber-50 border border-amber-100 px-1 rounded text-xs">.env</code> file for SMS to actually send.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BirthdaySettings;
