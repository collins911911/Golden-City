import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import Preloader     from './components/Preloader';
import LoadingScreen from './components/LoadingScreen';

// Pages load only when opened → the first screen appears much faster
const Landing        = lazy(() => import('./pages/auth/Landing'));
const MemberRegister = lazy(() => import('./pages/auth/MemberRegister'));
const MemberLogin    = lazy(() => import('./pages/auth/MemberLogin'));
const AdminLogin     = lazy(() => import('./pages/auth/AdminLogin'));

// Admin pages
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const Registrations    = lazy(() => import('./pages/admin/Registrations'));
const GroupMessage     = lazy(() => import('./pages/admin/GroupMessage'));
const SelectiveMessage = lazy(() => import('./pages/admin/SelectiveMessage'));
const MemberManagement = lazy(() => import('./pages/admin/MemberManagement'));
const MessageHistory   = lazy(() => import('./pages/admin/MessageHistory'));
const BirthdaySettings = lazy(() => import('./pages/admin/BirthdaySettings'));
const AgendaManager    = lazy(() => import('./pages/admin/AgendaManager'));
const NoticeBoard      = lazy(() => import('./pages/admin/NoticeBoard'));
const WeeklyActivities = lazy(() => import('./pages/admin/WeeklyActivities'));
const AdminPosts       = lazy(() => import('./pages/admin/AdminPosts'));

// Member pages
const MemberDashboard        = lazy(() => import('./pages/member/MemberDashboard'));
const UpcomingEvents         = lazy(() => import('./pages/member/UpcomingEvents'));
const MemberNoticeBoard      = lazy(() => import('./pages/member/MemberNoticeBoard'));
const MemberWeeklyActivities = lazy(() => import('./pages/member/MemberWeeklyActivities'));
const MemberPosts            = lazy(() => import('./pages/member/MemberPosts'));

// Protected route wrappers
const Protected = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to={role === 'admin' ? '/gc-admin' : '/member-login'} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};
const Admin  = ({ children }) => <Protected role="admin">{children}</Protected>;
const Member = ({ children }) => <Protected role="member">{children}</Protected>;

// Logged-in people skip the login pages
const GuestOnly = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'admin')  return <Navigate to="/admin-dashboard" replace />;
  if (user?.role === 'member') return <Navigate to="/member-dashboard" replace />;
  return children;
};

// Start every new page at the top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Splash only once per browser session
const splashSeen = () => {
  try { return sessionStorage.getItem('gc_splash') === '1'; } catch { return true; }
};

const App = () => {
  const [ready, setReady] = useState(splashSeen);
  const done = useCallback(() => {
    try { sessionStorage.setItem('gc_splash', '1'); } catch { /* ignore */ }
    setReady(true);
  }, []);

  if (!ready) return <Preloader onComplete={done} />;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"             element={<GuestOnly><Landing /></GuestOnly>} />
          <Route path="/register"     element={<GuestOnly><MemberRegister /></GuestOnly>} />
          <Route path="/member-login" element={<GuestOnly><MemberLogin /></GuestOnly>} />
          <Route path="/gc-admin"     element={<GuestOnly><AdminLogin /></GuestOnly>} />

          {/* ── Admin ── */}
          <Route path="/admin-dashboard"      element={<Admin><AdminDashboard /></Admin>} />
          <Route path="/admin-registrations"  element={<Admin><Registrations /></Admin>} />
          <Route path="/admin-messages"        element={<Admin><GroupMessage /></Admin>} />
          <Route path="/admin-selective"       element={<Admin><SelectiveMessage /></Admin>} />
          <Route path="/admin-members"         element={<Admin><MemberManagement /></Admin>} />
          <Route path="/admin-message-history" element={<Admin><MessageHistory /></Admin>} />
          <Route path="/admin-birthday"        element={<Admin><BirthdaySettings /></Admin>} />
          <Route path="/admin-agenda"          element={<Admin><AgendaManager /></Admin>} />
          <Route path="/admin-notice"          element={<Admin><NoticeBoard /></Admin>} />
          <Route path="/admin-activities"      element={<Admin><WeeklyActivities /></Admin>} />
          <Route path="/admin-posts"           element={<Admin><AdminPosts /></Admin>} />

          {/* ── Member ── */}
          <Route path="/member-dashboard"  element={<Member><MemberDashboard /></Member>} />
          <Route path="/member-events"     element={<Member><UpcomingEvents /></Member>} />
          <Route path="/member-notice"     element={<Member><MemberNoticeBoard /></Member>} />
          <Route path="/member-activities" element={<Member><MemberWeeklyActivities /></Member>} />
          <Route path="/member-posts"      element={<Member><MemberPosts /></Member>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
