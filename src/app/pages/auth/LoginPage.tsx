import {
  Brain,
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Check,
  Eye,
  EyeOff,
  User,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NaverLogin from '../../components/NaverLogin/NaverLoginButton';
import { authService } from '../../services/authService';
import { Logo } from '../../components/common/Logo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';

import { UserRole } from '../../types/common';

interface LoginPageProps {
  onLogin: (userType: UserRole) => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password Reset State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0); // 0: Request, 1: Verify, 2: Reset
  const [resetData, setResetData] = useState({
    name: '',
    siteEmail: '',
    code: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [isDeactivatedModalOpen, setIsDeactivatedModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Password Strength Logic
  const getStrengthScore = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++; // Uppercase
    if (/[0-9]/.test(pwd)) score++; // Number
    if (/[!@#$%^&*(),.?":{}|<> ]/.test(pwd)) score++; // Special char
    return score;
  };

  const strengthScore = getStrengthScore(resetData.newPassword);

  const resetPwdValidation = {
    length: resetData.newPassword.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<> ]/.test(resetData.newPassword),
    match:
      resetData.newPassword !== '' &&
      resetData.newPassword === resetData.newPasswordConfirm,
  };

  /**
   * 1. 자동 로그인 및 리다이렉트 처리
   * 백엔드 네이버 콜백 성공 시 /auth/callback으로 리다이렉트되는데,
   * 이곳에서 현재 세션의 Role을 확인하고 메인으로 진입시킵니다.
   */
  useEffect(() => {
    const checkSession = async () => {
      // URL이 /auth/callback 이거나 페이지 진입 시 세션 확인
      if (location.pathname === '/login') {
        try {
          // 백엔드에 현재 쿠키를 기반으로 내 정보 조회
          const res = await authService.me();
          if (res.role) {
            if (res.role === 'Deactivated') {
              setIsDeactivatedModalOpen(true);
              return;
            }
            onLogin(res.role);
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
      // HttpOnly 쿠키가 설정되므로 응답 바디의 role에 의존하지 않고 세션을 재확인합니다.
      await authService.login({
        siteEmail: email,
        sitePwd: password,
      });

      // 세션 확인 (쿠키가 잘 설정되었는지 확인)
      const user = await authService.me();
      if (user.role) {
        if (user.role === 'Deactivated') {
          setIsDeactivatedModalOpen(true);
          return;
        }
        onLogin(user.role);
      } else {
        // Role이 없는 경우 (예: 승인 대기 등)
        if (user.type === 'PENDING') {
          alert('관리자 승인 대기 중인 계정입니다.');
        } else {
          alert('로그인에 성공했으나 권한 정보를 불러올 수 없습니다.');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '로그인에 실패했습니다.';
      if (message.includes('비활성화') || message.includes('Deactivated')) {
        setIsDeactivatedModalOpen(true);
      } else {
        alert(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Password Reset Handlers ---

  const handleResetRequest = async () => {
    if (!resetData.siteEmail || !resetData.name) {
      alert('이름과 이메일을 입력해주세요.');
      return;
    }
    if (!resetData.siteEmail.includes('@')) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }
    setResetLoading(true);
    try {
      await authService.requestPasswordResetCode({
        siteEmail: resetData.siteEmail,
        name: resetData.name,
      });
      alert('인증 코드가 이메일로 발송되었습니다.');
      setResetStep(1);
    } catch (error: any) {
      alert(error.response?.data?.message || '인증 요청에 실패했습니다.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetVerify = async () => {
    if (!resetData.code) {
      alert('인증 코드를 입력해주세요.');
      return;
    }
    setResetLoading(true);
    try {
      await authService.verifyPasswordResetCode({
        email: resetData.siteEmail,
        code: resetData.code,
      });
      alert('인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
      setResetStep(2);
    } catch (error: any) {
      alert(error.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetComplete = async () => {
    if (!resetPwdValidation.length) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (!resetPwdValidation.special) {
      alert('비밀번호에 특수문자를 포함해야 합니다.');
      return;
    }
    if (!resetPwdValidation.match) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setResetLoading(true);
    try {
      await authService.resetPassword({
        siteEmail: resetData.siteEmail,
        newPassword: resetData.newPassword,
        newPasswordConfirm: resetData.newPasswordConfirm,
      });
      alert('비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.');
      setIsResetOpen(false);
      setResetStep(0);
      setResetData({
        name: '',
        siteEmail: '',
        code: '',
        newPassword: '',
        newPasswordConfirm: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans antialiased transition-colors duration-300">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        <header className="flex flex-col items-center gap-8">
          <div className="w-full flex justify-between items-center">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>돌아가기</span>
            </button>
            <ThemeToggle />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="scale-150 py-4">
              <Logo />
            </div>
            <h1 className="text-2xl font-black tracking-tight dark:text-foreground">
              반가워요!
            </h1>
          </div>
        </header>

        <main className="bg-card border border-border/80 shadow-sm overflow-hidden transition-colors duration-300 rounded-[2rem]">
          {/* 네이버 로그인 */}
          <section className="p-8 pb-7 space-y-5">
            <div className="flex justify-start">
              <span className="text-xs font-extrabold text-primary bg-primary/5 dark:bg-primary/20 px-2.5 py-1 rounded-full tracking-tighter">
                처음 오셨나요?
              </span>
            </div>
            <NaverLogin />
            <p className="text-xs text-muted-foreground text-center font-semibold tracking-tight">
              네이버로 가입 신청을 시작하세요.
            </p>
          </section>

          {/* 이메일 로그인 */}
          <section className="p-8 pt-7 bg-muted/30 border-t border-border/50 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-black text-muted-foreground ml-1 uppercase tracking-wider"
                >
                  이메일
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-11 h-12 bg-background border-border rounded-xl focus-visible:ring-primary/10 text-sm placeholder:text-muted-foreground/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-black text-muted-foreground ml-1 uppercase tracking-wider"
                >
                  비밀번호
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showLoginPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-11 pr-10 h-12 bg-background border-border rounded-xl focus-visible:ring-primary/10 text-sm placeholder:text-muted-foreground/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd(!showLoginPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold text-sm shadow-lg shadow-primary/10 transition-all active:scale-[0.97]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    '로그인'
                  )}
                </Button>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(true)}
                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    계정 접근에 문제가 있나요?
                  </button>
                </div>
              </div>
            </form>
          </section>
        </main>

        <div className="w-full bg-muted/40 border border-border/50 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm transition-colors">
          <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground font-bold leading-tight tracking-tight">
            관리자 승인 후{' '}
            <span className="text-primary font-black underline underline-offset-4 decoration-primary/30">
              이메일 로그인
            </span>
            이 가능합니다.
          </p>
        </div>
      </div>

      {/* 비밀번호 찾기 모달 */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md bg-card dark:bg-card rounded-2xl border-0 shadow-2xl dark:shadow-primary/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center pb-2 flex items-center justify-center gap-2 dark:text-foreground">
              <KeyRound className="w-5 h-5 text-primary" />
              계정 복구 지원
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              본인 확인 후 비밀번호를 재설정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Step 0: Request Code */}
            {resetStep === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">
                    이름
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="가입된 이름"
                      value={resetData.name}
                      onChange={(e) =>
                        setResetData({ ...resetData, name: e.target.value })
                      }
                      className="pl-9 h-11 rounded-xl bg-muted/30 border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">
                    이메일
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="가입된 이메일"
                        value={resetData.siteEmail}
                        onChange={(e) =>
                          setResetData({
                            ...resetData,
                            siteEmail: e.target.value,
                          })
                        }
                        className="pl-9 h-11 rounded-xl bg-muted/30 border-border"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleResetRequest}
                      disabled={resetLoading}
                      className="h-11 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {resetLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        '인증요청'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Verify Code */}
            {resetStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-3 bg-primary/10 text-primary text-xs rounded-lg font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  이메일로 발송된 인증코드를 입력해주세요.
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">
                    인증코드
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="123456"
                      value={resetData.code}
                      onChange={(e) =>
                        setResetData({ ...resetData, code: e.target.value })
                      }
                      className="h-11 rounded-xl bg-muted/30 border-border text-center tracking-widest font-mono text-lg"
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      onClick={handleResetVerify}
                      disabled={resetLoading}
                      className="h-11 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {resetLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        '확인'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setResetStep(0)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    이메일 다시 입력하기
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Reset Password */}
            {resetStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-muted-foreground">
                      새 비밀번호
                    </Label>
                    {resetData.newPassword.length > 0 && (
                      <span
                        className={`text-xs font-bold ${
                          strengthScore <= 2
                            ? 'text-destructive dark:text-red-400'
                            : strengthScore === 3
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {strengthScore <= 2
                          ? '사용불가'
                          : strengthScore === 3
                            ? '보통'
                            : '안전함'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted-foreground" />
                    <Input
                      type={showResetPwd ? 'text' : 'password'}
                      placeholder="8자 이상, 특수문자 포함"
                      value={resetData.newPassword}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          newPassword: e.target.value,
                        })
                      }
                      className="pl-9 pr-10 h-11 rounded-xl bg-slate-50 dark:bg-background border-slate-200 dark:border-border dark:text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPwd(!showResetPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-foreground hover:text-slate-600 dark:hover:text-foreground"
                    >
                      {showResetPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {/* Strength Meter Bar */}
                  {resetData.newPassword.length > 0 && (
                    <div className="flex gap-1 h-1 mt-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 rounded-full transition-colors duration-300 ${
                            step <= strengthScore
                              ? strengthScore <= 2
                                ? 'bg-red-400'
                                : strengthScore === 3
                                  ? 'bg-orange-400'
                                  : 'bg-green-500'
                              : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">
                    새 비밀번호 확인
                  </Label>
                  <div className="relative">
                    <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="비밀번호 재입력"
                      value={resetData.newPasswordConfirm}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          newPasswordConfirm: e.target.value,
                        })
                      }
                      className={`pl-9 h-11 rounded-xl bg-slate-50 border-slate-200 ${
                        resetPwdValidation.match && resetData.newPasswordConfirm
                          ? 'bg-blue-50/30 border-blue-200'
                          : ''
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <ValidationItem
                    isValid={resetPwdValidation.length}
                    text="8자 이상"
                  />
                  <ValidationItem
                    isValid={resetPwdValidation.special}
                    text="특수문자"
                  />
                  <ValidationItem
                    isValid={resetPwdValidation.match}
                    text="일치 확인"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleResetComplete}
                  disabled={
                    resetLoading ||
                    !resetPwdValidation.match ||
                    !resetPwdValidation.length ||
                    !resetPwdValidation.special
                  }
                  className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                >
                  {resetLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    '비밀번호 변경하기'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Deactivated Account Modal */}
      <Dialog
        open={isDeactivatedModalOpen}
        onOpenChange={setIsDeactivatedModalOpen}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-card rounded-2xl border-0 shadow-2xl dark:shadow-primary/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center pb-2 flex items-center justify-center gap-2 dark:text-foreground text-destructive">
              <ShieldCheck className="w-6 h-6" />
              계정 비활성화 알림
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground pt-2">
              비활성화된 계정입니다.
              <br />
              관리자에게 문의해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <Button
              onClick={() => setIsDeactivatedModalOpen(false)}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
        isValid ? 'text-blue-600' : 'text-slate-300'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
          isValid ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
        }`}
      >
        <Check
          className={`w-2.5 h-2.5 text-white ${
            isValid ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      {text}
    </div>
  );
}
