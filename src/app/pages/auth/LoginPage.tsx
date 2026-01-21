import { Brain, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // HttpOnly 쿠키 방식 로그인 요청
      const res = await apiClient.post('/api/v1/auth/me', {
        email,
        password,
      });

      // 로그인 성공 시 역할 정보가 응답에 포함되어 있다고 가정
      // 예: { message: "Success", role: "Author" }
      const userRole = res.data.role as 'Manager' | 'Author' | 'Admin';

      onLogin(userRole);
    } catch (error) {
      console.error('Login failed:', error);
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col items-center justify-center p-6 text-slate-900 font-sans antialiased">
      <div className="w-full max-w-[360px] flex flex-col gap-6">
        {/* [Top] Navigation & Branding */}
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
            <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">
              반가워요!
            </h1>
          </div>
        </header>

        {/* [Main] Authentication Card */}
        <main className="bg-white border border-slate-200/80 rounded-[2rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Section: Signup (Social) */}
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

          {/* Divider */}
          <div className="flex items-center px-8 py-1">
            <div className="flex-1 border-t border-slate-100" />
            <span className="px-4 text-[10px] font-black text-slate-200 tracking-[0.2em] uppercase">
              또는
            </span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {/* Section: Login (Email) */}
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
                    className="pl-11 h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/10 text-[14px] font-medium transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  title="비밀번호"
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
                    className="pl-11 h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/10 text-[14px] font-medium transition-all"
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
                {isLoading ? '확인 중...' : '로그인'}
              </Button>
            </form>

            <footer className="mt-8 flex justify-center items-center gap-4 text-[11px] text-slate-400 font-bold border-t border-slate-100/80 pt-6">
              <button
                type="button"
                className="hover:text-primary transition-colors"
                onClick={() => onLogin('Author')}
              >
                아이디 찾기
              </button>
              <div className="w-px h-3 bg-slate-200" />
              <button
                type="button"
                className="hover:text-slate-900 transition-colors"
                onClick={() => onLogin('Admin')}
              >
                비밀번호 찾기
              </button>
            </footer>
          </section>
        </main>

        {/* [Bottom] Approval Notice */}
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
