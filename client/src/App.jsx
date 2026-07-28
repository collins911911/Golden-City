import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';

import Preloader      from './components/Preloader';
import Landing        from './pages/auth/Landing';
import MemberRegister from './pages/auth/MemberRegister';
import MemberLogin    from './pages/auth/MemberLogin';
import AdminLogin     from './pages/auth/AdminLogin';

// Admin pages
import AdminDashboard   from './pages/admin/AdminDashboard';
import GroupMessage     from './pages/admin/GroupMessage';
import SelectiveMessage from './pages/admin/SelectiveMessage';
import MemberManagement from './pages/admin/MemberManagement';
import MessageHistory   from './pages/admin/MessageHistory';
import BirthdaySettings from './pages/admin/BirthdaySettings';
import AgendaManager    from './pages/admin/AgendaManager';
import NoticeBoard      from './pages/admin/NoticeBoard';
import WeeklyActivities from './pages/admin/WeeklyActivities';
import AdminPosts       from './pages/admin/AdminPosts';       // ← NEW

// Member pages
import MemberDashboard        from './pages/member/MemberDashboard';
import UpcomingEvents         from './pages/member/UpcomingEvents';
import MemberNoticeBoard      from './pages/member/MemberNoticeBoard';
import MemberWeeklyActivities from './pages/member/MemberWeeklyActivities';
import MemberPosts            from './pages/member/MemberPosts';  // ← NEW

// Protected route wrappers
const Protected = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/member-login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const Admin  = ({ children }) => <Protected role="admin">{children}</Protected>;
const Member = ({ children }) => <Protected role="member">{children}</Protected>;

const App = () => {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const handlePreloaderComplete = useCallback(() => setPreloaderDone(true), []);

  return (
    <>
      {!preloaderDone && <Preloader onComplete={handlePreloaderComplete} />}

      {preloaderDone && (
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/"             element={<Landing />} />
            <Route path="/register"     element={<MemberRegister />} />
            <Route path="/member-login" element={<MemberLogin />} />
            <Route path="/gc-admin"     element={<AdminLogin />} />

            {/* ── Admin ── */}
            <Route path="/admin-dashboard"       element={<Admin><AdminDashboard /></Admin>} />
            <Route path="/admin-messages"         element={<Admin><GroupMessage /></Admin>} />
            <Route path="/admin-selective"        element={<Admin><SelectiveMessage /></Admin>} />
            <Route path="/admin-members"          element={<Admin><MemberManagement /></Admin>} />
            <Route path="/admin-message-history"  element={<Admin><MessageHistory /></Admin>} />
            <Route path="/admin-birthday"         element={<Admin><BirthdaySettings /></Admin>} />
            <Route path="/admin-agenda"           element={<Admin><AgendaManager /></Admin>} />
            <Route path="/admin-notice"           element={<Admin><NoticeBoard /></Admin>} />
            <Route path="/admin-activities"       element={<Admin><WeeklyActivities /></Admin>} />
            <Route path="/admin-posts"            element={<Admin><AdminPosts /></Admin>} />

            {/* ── Member ── */}
            <Route path="/member-dashboard"  element={<Member><MemberDashboard /></Member>} />
            <Route path="/member-events"     element={<Member><UpcomingEvents /></Member>} />
            <Route path="/member-notice"     element={<Member><MemberNoticeBoard /></Member>} />
            <Route path="/member-activities" element={<Member><MemberWeeklyActivities /></Member>} />
            <Route path="/member-posts"      element={<Member><MemberPosts /></Member>} />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
