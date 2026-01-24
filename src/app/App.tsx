import { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ManagerDashboard } from './pages/dashboard/ManagerDashboard';
import { AuthorDashboard } from './pages/dashboard/AuthorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsPage from './pages/legal/TermsPage';
import { authService } from './services/authService';
import AILabPage from './pages/lab/AILabPage';

type UserType = 'Manager' | 'Author' | 'Admin' | null;

export default function App() {
  const [userType, setUserType] = useState<UserType>(() => {
    // Only use userRole for initial state to prevent flash, but verification is needed
    const role = localStorage.getItem('userRole') as UserType;
    return role || null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const user = await authService.me();
        if (user.role) {
          setUserType(user.role);
          localStorage.setItem('userRole', user.role);
        } else {
          // If no role (e.g. pending or anon), consider logged out for dashboard purposes
          setUserType(null);
          localStorage.removeItem('userRole');
        }
      } catch (error) {
        setUserType(null);
        localStorage.removeItem('userRole');
      }
    };

    // Verify session on mount and on route changes that might imply auth state change
    verifySession();
  }, [location.pathname]); // Re-check on path change might be too frequent, but safe for ensuring auth

  const handleLogin = (type: UserType) => {
    localStorage.setItem('userRole', type!);
    setUserType(type);
    navigate('/', { replace: true });
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
    localStorage.removeItem('userRole');
    localStorage.removeItem('msw-session-role'); // Clear MSW session role
    // localStorage.clear(); // Avoid clearing everything if not necessary
    setUserType(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* 권한별 대시보드 */}
        <Route
          path="/"
          element={
            userType === 'Manager' ? (
              <ManagerDashboard
                onLogout={handleLogout}
                onHome={() => navigate('/')}
              />
            ) : userType === 'Author' ? (
              <AuthorDashboard
                onLogout={handleLogout}
                onHome={() => navigate('/')}
              />
            ) : userType === 'Admin' ? (
              <AdminDashboard
                onLogout={handleLogout}
                onHome={() => navigate('/')}
              />
            ) : (
              <LandingPage onSignInClick={() => navigate('/login')} />
            )
          }
        />

        {/* 인증 라우트 */}
        <Route
          path="/login"
          element={
            userType ? (
              <Navigate to="/" />
            ) : (
              <LoginPage
                onLogin={(t) => handleLogin(t)}
                onBack={() => navigate('/')}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            <SignupPage
              onSignupComplete={() => navigate('/login')}
              onBack={() => navigate('/login')}
            />
          }
        />

        {/* 법적 약관 및 404 */}
        <Route path="/lab" element={<AILabPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
