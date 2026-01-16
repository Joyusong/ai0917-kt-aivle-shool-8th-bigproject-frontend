import { useEffect, useMemo, useState } from 'react';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage as SignupPage2 } from './pages/auth/SignupPage2';
import { ManagerDashboard } from './pages/dashboard/ManagerDashboard';
import { AuthorDashboard } from './pages/dashboard/AuthorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import RedirectURI from './pages/auth/RedirectURI';

type Screen = 'landing' | 'login' | 'signup' | 'dashboard';
type UserType = 'manager' | 'author' | 'admin' | null;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userType, setUserType] = useState<UserType>(null);
  const [pendingSignupData, setPendingSignupData] = useState<Record<
    string,
    any
  > | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleSignInClick = () => navigate('/login');
  const handleSignupClick = () => navigate('/signup2');
  const handleGoHome = () => navigate('/');
  const handleLogout = () => {
    setUserType(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const handleSignupComplete = () => {
    setPendingSignupData(null);
    navigate('/login');
  };

  const handleLogin = (type: 'manager' | 'author' | 'admin') => {
    setUserType(type);
    localStorage.setItem('userRole', type);
    navigate('/');
  };

  const handleRequireSignup = (profile: Record<string, any>) => {
    setPendingSignupData(profile);
    navigate('/signup2');
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole') as UserType | null;
    setUserType(role);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route
          path="/"
          element={
            userType === 'manager' ? (
              <ManagerDashboard onLogout={handleLogout} onHome={handleGoHome} />
            ) : userType === 'author' ? (
              <AuthorDashboard onLogout={handleLogout} onHome={handleGoHome} />
            ) : userType === 'admin' ? (
              <AdminDashboard onLogout={handleLogout} onHome={handleGoHome} />
            ) : (
              <LandingPage onSignInClick={handleSignInClick} />
            )
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={handleLogin}
              onBack={handleGoHome}
              onSignup={handleSignupClick}
            />
          }
        />
        <Route
          path="/signup2"
          element={
            <SignupPage2
              initialData={pendingSignupData || undefined}
              onSignupComplete={handleSignupComplete}
              onBack={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/auth/naver/callback"
          element={
            <RedirectURI
              onLoginSuccess={handleLogin}
              onRequireSignup={handleRequireSignup}
              onFail={() => navigate('/login')}
            />
          }
        />
      </Routes>
    </div>
  );
}
