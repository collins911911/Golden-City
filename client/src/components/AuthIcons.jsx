// Small shared pieces for the login / register pages

export const EyeOpen = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeClosed = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const CrossLogo = ({ size = 'w-16 h-16' }) => (
  <div className={`relative ${size} rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto`}
    style={{ boxShadow: '0 6px 28px rgba(212,175,55,0.45)' }}>
    <svg viewBox="0 0 64 64" className="w-1/2 h-1/2" fill="none">
      <rect x="28" y="6" width="8" height="52" rx="3" fill="white" />
      <rect x="12" y="18" width="40" height="8" rx="3" fill="white" />
    </svg>
  </div>
);

// Password input with show/hide button
export const PasswordInput = ({ value, onChange, placeholder, show, onToggle, onKeyDown, autoComplete }) => (
  <div className="relative">
    <input
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      autoComplete={autoComplete}
      className="gc-input pr-12"
    />
    <button type="button" onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-amber-600 hover:text-amber-800">
      {show ? <EyeClosed /> : <EyeOpen />}
    </button>
  </div>
);
