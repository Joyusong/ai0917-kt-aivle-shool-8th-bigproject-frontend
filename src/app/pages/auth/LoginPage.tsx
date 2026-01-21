import {
  Brain,
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NaverLogin from '../../components/NaverLogin/NaverLoginButton';
import apiClient from '../../api/axios';

interface LoginPageProps {
  onLogin: (userType: 'Manager' | 'Author' | 'Admin') => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 1. 자동 로그인 및 리다이렉트 처리
   * 백엔드 네이버 콜백 성공 시 /auth/callback으로 리다이렉트되는데,
   * 이곳에서 현재 세션의 Role을 확인하고 메인으로 진입시킵니다.
   */
  useEffect(() => {
    const checkSession = async () => {
      // URL이 /auth/callback 이거나 페이지 진입 시 세션 확인
      if (
        location.pathname === '/auth/callback' ||
        location.pathname === '/login'
      ) {
        try {
          // 백엔드에 현재 쿠키를 기반으로 내 정보 조회
          const res = await apiClient.get('/api/v1/auth/me');
          if (res.data.role) {
            onLogin(res.data.role);
          }
        } catch (err) {
          // 세션이 없으면 로그인 페이지 유지
          console.log('No active session found');
        }
      }
    };
    checkSession();
  }, [location.pathname]);

  // 이메일 로그인 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      // 백엔드 AuthController 구조에 맞춘 로그인 요청
      const res = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
      });

      // 백엔드 응답에서 Role 추출 (HttpOnly 쿠키는 헤더에 저장됨)
      const userRole = res.data.role;
      if (userRole) {
        onLogin(userRole);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '로그인에 실패했습니다.';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col items-center justify-center p-6 text-slate-900 font-sans antialiased">
      <div className="w-full max-w-[360px] flex flex-col gap-6">
        <header className="flex flex-col items-center gap-8">
          <div className="w-full flex justify-start">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>돌아가기</span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-primary shadow-xl shadow-primary/20 ring-1 ring-primary/10">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">반가워요!</h1>
          </div>
        </header>

        <main className="bg-white border border-slate-200/80 rounded-[2rem] shadow-sm overflow-hidden">
          {/* 네이버 로그인: 백엔드 Controller의 /api/v1/auth/naver/login 호출 */}
          <section className="p-8 pb-7 space-y-5">
            <div className="flex justify-start">
              <span className="text-[11px] font-extrabold text-primary bg-primary/5 px-2.5 py-1 rounded-full tracking-tighter">
                처음 오셨나요?
              </span>
            </div>
            <NaverLogin />
            <p className="text-[12px] text-slate-400 text-center font-semibold tracking-tight">
              네이버로 가입 신청을 시작하세요.
            </p>
          </section>

          <div className="flex items-center px-8 py-1">
            <div className="flex-1 border-t border-slate-100" />
            <span className="px-4 text-[10px] font-black text-slate-200 tracking-[0.2em] uppercase">
              또는
            </span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {/* 이메일 로그인 */}
          <section className="p-8 pt-7 bg-slate-50/40 border-t border-slate-100/50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider"
                >
                  이메일
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-11 h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/10 text-[14px]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider"
                >
                  비밀번호
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/10 text-[14px]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-bold text-[14px] shadow-lg shadow-primary/10 transition-all active:scale-[0.97] mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '로그인'
                )}
              </Button>
            </form>
          </section>
        </main>

        <div className="w-full bg-slate-200/40 border border-slate-200/50 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="text-[11px] text-slate-500 font-bold leading-tight tracking-tight">
            관리자 승인 후{' '}
            <span className="text-primary font-black underline underline-offset-4 decoration-primary/30">
              이메일 로그인
            </span>
            이 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
