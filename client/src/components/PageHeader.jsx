import { useNavigate } from 'react-router-dom';

// Gold banner used at the top of pages
const PageHeader = ({ title, subtitle, icon, back, action }) => {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7C5A00 0%, #B8860B 50%, #DAA520 100%)' }}>
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border-[40px] border-white/10 pointer-events-none" />
      <div className="relative max-w-2xl mx-auto px-5 py-8">
        {back && (
          <button onClick={() => navigate(back)}
            className="text-yellow-100 text-sm font-medium hover:text-white transition-colors mb-4">
            ← Dashboard
          </button>
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-3xl">
                {icon}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-widest">{title}</h1>
              {subtitle && <p className="text-yellow-100 text-sm mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
