import { useEffect, useState } from 'react';

const Preloader = ({ onComplete }) => {
  const [phase, setPhase] = useState('enter'); // enter → hold → exit

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase('exit'), 2200);
    const doneTimer = setTimeout(() => onComplete(), 3000);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Gold ring pulse */}
      <div className="relative flex items-center justify-center mb-6">
        <span className="absolute inline-flex h-36 w-36 rounded-full bg-yellow-200 opacity-40 animate-ping" />
        <span className="absolute inline-flex h-28 w-28 rounded-full border-4 border-yellow-400 opacity-60 animate-pulse" />

        {/* Logo circle */}
        <div
          className={`relative z-10 w-24 h-24 rounded-full border-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-2xl flex items-center justify-center transition-transform duration-700 ${
            phase === 'enter' ? 'scale-100' : 'scale-95'
          }`}
          style={{ boxShadow: '0 0 40px rgba(212,175,55,0.35)' }}
        >
          {/* Cross icon as church symbol — replace with <img src="/logo.png"> when logo is ready */}
          <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
            <rect x="28" y="6" width="8" height="52" rx="3" fill="#D4AF37" />
            <rect x="12" y="18" width="40" height="8" rx="3" fill="#D4AF37" />
          </svg>
        </div>
      </div>

      {/* Church name */}
      <h1
        className={`text-3xl font-bold tracking-widest text-yellow-700 uppercase transition-all duration-700 ${
          phase === 'enter' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.18em' }}
      >
        Golden City
      </h1>
      <p
        className={`mt-1 text-sm tracking-[0.3em] text-yellow-500 uppercase font-medium transition-all duration-700 delay-100 ${
          phase === 'enter' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Church
      </p>

      {/* Loading bar */}
      <div className="mt-10 w-48 h-1 rounded-full bg-yellow-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-[load_2s_ease-in-out_forwards]"
          style={{
            animation: 'load 2s ease-in-out forwards',
          }}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        @keyframes load {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
