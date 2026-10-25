// Full-screen spinner shown while a page loads its data
const LoadingScreen = ({ label = 'Loading…' }) => (
  <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-4 border-yellow-100" />
      <div className="absolute inset-0 rounded-full border-4 border-t-yellow-500 border-r-yellow-400 border-b-transparent border-l-transparent animate-spin" />
    </div>
    <p className="mt-4 text-sm text-yellow-700 font-medium">{label}</p>
  </div>
);

export default LoadingScreen;
