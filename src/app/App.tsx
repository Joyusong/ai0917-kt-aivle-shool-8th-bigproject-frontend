import { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from 'react-router-dom';
import apiClient from './api/axios';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ManagerDashboard } from './pages/dashboard/ManagerDashboard';
import { AuthorDashboard } from './pages/dashboard/AuthorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsPage from './pages/legal/TermsPage';
import { Loader2 } from 'lucide-react';

type UserType = 'Manager' | 'Author' | 'Admin' | null;

export default function App() {
  const [userType, setUserType] = useState<UserType>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // 앱 초기 로드시 세션 확인 (HttpOnly Cookie)
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 백엔드에서 쿠키를 확인하여 사용자 정보를 반환하는 엔드포인트 호출
        // (API 경로는 백엔드 구현에 따라 다를 수 있음, /api/v1/auth/me 로 가정)
        const res = await apiClient.get('/api/v1/auth/me');
        if (res.data && res.data.role) {
          setUserType(res.data.role as UserType);
        }
      } catch (error) {
        // 인증 실패 또는 세션 없음
        setUserType(null);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (type: UserType) => {
    // 토큰 저장 로직 제거 (쿠키가 자동으로 처리됨)
    setUserType(type);
    navigate('/', { replace: true });
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUserType(null);
      navigate('/login');
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

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
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
