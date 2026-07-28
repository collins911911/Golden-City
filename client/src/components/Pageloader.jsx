const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      {/* Spinning gold ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-yellow-100" />
        <div
          className="absolute inset-0 rounded-full border-4 border-t-yellow-500 border-r-yellow-400 border-b-transparent border-l-transparent animate-spin"
        />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        </div>
      </div>
      <p
        className="mt-4 text-xs tracking-[0.25em] text-yellow-600 uppercase font-semibold"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Loading...
      </p>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap');
      `}</style>
    </div>
  );
};

export default PageLoader;
