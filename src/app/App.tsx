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

type UserType = 'Manager' | 'Author' | 'Admin' | null;

export default function App() {
  const [userType, setUserType] = useState<UserType>(() => {
    const role = localStorage.getItem('userRole') as UserType;
    const token = localStorage.getItem('accessToken');
    return role && token ? role : null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Keep redirect behavior tied to route changes if needed
  }, [location.pathname]);

  const handleLogin = (type: UserType, token: string) => {
    localStorage.setItem('userRole', type!);
    localStorage.setItem('accessToken', token);
    setUserType(type);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.clear();
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
                onLogin={(t) => handleLogin(t, 'test-token')}
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
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
