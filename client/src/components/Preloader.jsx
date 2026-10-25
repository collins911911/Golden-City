import { useEffect, useState } from 'react';

// Splash screen — shown once per browser session, about 1.2 seconds
const Preloader = ({ onComplete }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 900);
    const doneTimer = setTimeout(() => onComplete(), 1250);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${
      exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div className="relative flex items-center justify-center mb-6">
        <span className="absolute inline-flex h-32 w-32 rounded-full bg-yellow-200 opacity-40 animate-ping" />
        <div className="relative z-10 w-24 h-24 rounded-full border-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(212,175,55,0.35)' }}>
          <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
            <rect x="28" y="6" width="8" height="52" rx="3" fill="#D4AF37" />
            <rect x="12" y="18" width="40" height="8" rx="3" fill="#D4AF37" />
          </svg>
        </div>
      </div>
      <h1 className="font-display text-3xl font-bold tracking-[0.18em] text-yellow-700 uppercase">Golden City</h1>
      <p className="font-display mt-1 text-sm tracking-[0.3em] text-yellow-500 uppercase">Church</p>
    </div>
  );
};

export default Preloader;
