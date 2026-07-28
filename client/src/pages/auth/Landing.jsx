import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden relative">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-yellow-50 opacity-70 blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-yellow-100 opacity-50 blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Top nav bar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-yellow-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 64 64" className="w-6 h-6" fill="none">
              <rect x="28" y="6" width="8" height="52" rx="3" fill="white" />
              <rect x="12" y="18" width="40" height="8" rx="3" fill="white" />
            </svg>
          </div>
          <span
            className="text-lg font-bold text-yellow-800 tracking-widest uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Golden City
          </span>
        </div>

        {/* Hidden admin link */}
        <button
          onClick={() => navigate('/gc-admin')}
          className="text-xs text-yellow-300 hover:text-yellow-500 transition-colors tracking-widest uppercase"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Admin
        </button>
      </nav>

      {/* Hero section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Cross emblem */}
        <div className={`mb-8 transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div
            className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center mx-auto shadow-2xl"
            style={{ boxShadow: '0 8px 40px rgba(212,175,55,0.4)' }}
          >
            <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
              <rect x="28" y="6" width="8" height="52" rx="3" fill="white" />
              <rect x="12" y="18" width="40" height="8" rx="3" fill="white" />
            </svg>
          </div>
        </div>

        {/* Church name */}
        <h1
          className={`text-5xl md:text-6xl font-bold text-yellow-800 uppercase tracking-widest leading-tight transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Golden City
        </h1>
        <h2
          className={`text-2xl md:text-3xl font-semibold text-yellow-600 uppercase tracking-[0.3em] mt-1 transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Church
        </h2>

        {/* Divider */}
        <div className={`flex items-center gap-3 my-6 transition-all duration-1000 delay-400 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-yellow-400" />
        </div>

        {/* Motto */}
        <p
          className={`text-base md:text-lg text-yellow-700 italic font-medium max-w-md tracking-wide transition-all duration-1000 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          "Raising a golden generation for God's Kingdom"
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 mt-10 transition-all duration-1000 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Join the Community → goes to register */}
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Join the Community
          </button>

          {/* Member Portal → goes to login, login page has register link */}
          <button
            onClick={() => navigate('/member-login')}
            className="px-10 py-4 rounded-full border-2 border-yellow-400 text-yellow-700 font-bold uppercase tracking-widest text-sm hover:bg-yellow-50 hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Member Portal
          </button>

        </div>

        {/* Small helper text under buttons */}
        <p className={`mt-4 text-xs text-yellow-400 transition-all duration-1000 delay-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          New member? Click <span className="font-semibold text-yellow-500">Join the Community</span> to register,
          or <span className="font-semibold text-yellow-500">Member Portal</span> to log in.
        </p>
      </main>

      {/* Bottom ornament */}
      <footer className="relative z-10 py-4 text-center">
        <p
          className="text-xs text-yellow-300 tracking-widest uppercase"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          © {new Date().getFullYear()} Golden City Church
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@1,500&display=swap');
      `}</style>
    </div>
  );
};

export default Landing;
