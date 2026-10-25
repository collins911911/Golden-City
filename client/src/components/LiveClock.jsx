import { useEffect, useState } from 'react';

// Ticking clock in its own component, so only this small piece
// re-renders every second (not the whole dashboard).
const LiveClock = ({ timeClass = '', dateClass = '', dateOptions }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <p className={timeClass}>
        {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className={dateClass}>
        {now.toLocaleDateString('en-US', dateOptions || { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </>
  );
};

export default LiveClock;
