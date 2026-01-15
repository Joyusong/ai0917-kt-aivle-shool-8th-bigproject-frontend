import { useState } from 'react';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage as SignupPage2 } from './pages/auth/SignupPage2';
import { ManagerDashboard } from './pages/dashboard/ManagerDashboard';
import { AuthorDashboard } from './pages/dashboard/AuthorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { Routes, Route, useLocation } from 'react-router-dom'; // useLocation 추가
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

  const location = useLocation(); // 현재 URL 경로를 파악하기 위함

  // 핸들러 함수들 (기존과 동일)
  const handleSignInClick = () => setCurrentScreen('login');
  const handleSignupClick = () => setCurrentScreen('signup');
  const handleGoHome = () => setCurrentScreen('landing');
  const handleLogout = () => {
    setUserType(null);
    setCurrentScreen('landing');
  };

  const handleSignupComplete = () => {
    setPendingSignupData(null);
    setCurrentScreen('login');
  };

  // 로그인 성공 시 호출 (기존 회원)
  const handleLogin = (type: 'manager' | 'author' | 'admin') => {
    setUserType(type);
    setCurrentScreen('dashboard');
  };

  // 신규 회원일 때 호출 (RedirectURI에서 호출함)
  const handleRequireSignup = (profile: Record<string, any>) => {
    setPendingSignupData(profile);
    setCurrentScreen('signup');
  };

  // 현재 네이버 콜백 페이지인지 확인
  const isNaverCallback = location.pathname === '/auth/naver/callback';

  return (
    <div className="min-h-screen bg-background">
      {/* 1. 네이버 콜백 페이지가 아닐 때만 기존 화면들을 렌더링 (교체 방식) */}
      {!isNaverCallback ? (
        <>
          {currentScreen === 'landing' && (
            <LandingPage onSignInClick={handleSignInClick} />
          )}

          {currentScreen === 'login' && (
            <LoginPage
              onLogin={handleLogin}
              onBack={handleGoHome}
              onSignup={handleSignupClick}
            />
          )}

          {currentScreen === 'signup' && (
            <SignupPage2
              initialData={pendingSignupData || undefined}
              onSignupComplete={handleSignupComplete}
              onBack={() => setCurrentScreen('login')}
            />
          )}

          {currentScreen === 'dashboard' && userType === 'manager' && (
            <ManagerDashboard onLogout={handleLogout} onHome={handleGoHome} />
          )}

          {currentScreen === 'dashboard' && userType === 'author' && (
            <AuthorDashboard onLogout={handleLogout} onHome={handleGoHome} />
          )}

          {currentScreen === 'dashboard' && userType === 'admin' && (
            <AdminDashboard onLogout={handleLogout} onHome={handleGoHome} />
          )}
        </>
      ) : (
        /* 2. 네이버 콜백 경로일 때는 오직 이 라우터만 작동 (화면 겹침 방지) */
        <Routes>
          <Route
            path="/auth/naver/callback"
            element={
              <RedirectURI
                onLoginSuccess={handleLogin}
                onRequireSignup={handleRequireSignup}
                onFail={() => setCurrentScreen('login')}
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}
