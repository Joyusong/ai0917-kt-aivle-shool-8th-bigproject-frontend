import { Brain, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useState } from 'react';
import NaverLogin from '../../components/NaverLogin/NaverLoginButton';

interface LoginPageProps {
  onLogin: (userType: 'manager' | 'author' | 'admin') => void;
  onBack: () => void;
  onSignup: () => void;
}

export function LoginPage({ onLogin, onBack, onSignup }: LoginPageProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('manager');
  };

  const handleAdminLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    onLogin('admin');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">돌아가기</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-6">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl text-foreground mb-2">로그인</h1>
          <p className="text-muted-foreground">
            IP 관리 플랫폼에 오신 것을 환영합니다
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                아이디
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  className="pl-10 h-12 bg-input-background border-border text-foreground placeholder:text-muted-foreground rounded-md focus:border-primary focus:ring-1 focus:ring-ring"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                비밀번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  className="pl-10 h-12 bg-input-background border-border text-foreground placeholder:text-muted-foreground rounded-md focus:border-primary focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Remember Me & Find Links */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" className="border-border w-4 h-4" />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer text-[14px]"
                >
                  로그인 유지
                </label>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors text-[14px]"
                  onClick={handleAdminLogin}
                >
                  아이디 찾기
                </a>
                <span className="text-border">|</span>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  비밀번호 찾기
                </a>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground rounded-lg"
            >
              로그인
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-card text-muted-foreground">
                간편 로그인
              </span>
            </div>
          </div>

          {/* Naver Login */}
          <NaverLogin />

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            아직 계정이 없으신가요?{' '}
            <button
              onClick={onSignup}
              className="text-foreground hover:underline font-medium"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
