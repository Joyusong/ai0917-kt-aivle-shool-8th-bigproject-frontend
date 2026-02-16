import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '../../components/ui/dialog';

import { authService } from '../../services/authService';

export function SignupPage({
  onSignupComplete,
  onBack,
}: {
  onSignupComplete: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();

  // 이메일 인증 관련 상태
  const [emailCode, setEmailCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 비밀번호 표시 상태
  const [showPwd, setShowPwd] = useState(false);

  const [formData, setFormData] = useState({
    siteEmail: '',
    sitePwd: '',
    sitePwdConfirm: '',
    name: '',
    mobile: '',
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });

  const pwdValidation = {
    length: formData.sitePwd.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<> ]/.test(formData.sitePwd),
    match:
      formData.sitePwd !== '' && formData.sitePwd === formData.sitePwdConfirm,
  };

  // 비밀번호 강도 계산 (0-4)
  const getStrengthScore = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++; // 대문자
    if (/[0-9]/.test(pwd)) score++; // 숫자
    if (/[!@#$%^&*(),.?":{}|<> ]/.test(pwd)) score++; // 특수문자
    return score;
  };

  const strengthScore = getStrengthScore(formData.sitePwd);

  // 1. Pending Data Query
  const {
    data: pendingData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['signupPending'],
    queryFn: authService.getPendingSignup,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      navigate('/login');
    }
  }, [isError, navigate]);

  useEffect(() => {
    if (pendingData) {
      setFormData((prev) => ({
        ...prev,
        name: pendingData.name ?? '',
        mobile: pendingData.mobile ?? '',
      }));
    }
  }, [pendingData]);

  // 2. Email Code Request Mutation
  const requestEmailCodeMutation = useMutation({
    mutationFn: authService.requestEmailCode,
    onSuccess: () => {
      setIsCodeSent(true);
      setEmailCode(''); // 이전 코드 초기화
      alert('인증번호가 발송되었습니다. 메일함을 확인해주세요.');
    },
    onError: () => {
      alert('인증번호 발송에 실패했습니다.');
    },
  });

  const handleRequestEmailCode = () => {
    if (!formData.siteEmail.includes('@'))
      return alert('올바른 이메일을 입력해주세요.');

    requestEmailCodeMutation.mutate({ email: formData.siteEmail });
  };

  // 3. Email Code Verify Mutation
  const verifyEmailCodeMutation = useMutation({
    mutationFn: authService.verifyEmailCode,
    onSuccess: (data) => {
      if (data.ok) {
        setIsEmailVerified(true);
      } else {
        alert('인증번호가 일치하지 않습니다. 다시 확인해주세요.');
      }
    },
    onError: () => {
      alert('인증 확인 중 오류가 발생했습니다.');
    },
  });

  const handleVerifyEmailCode = () => {
    if (emailCode.length < 4) return;
    verifyEmailCodeMutation.mutate({
      email: formData.siteEmail,
      code: emailCode,
    });
  };

  // 4. Complete Signup Mutation
  const completeSignupMutation = useMutation({
    mutationFn: authService.completeSignup,
    onSuccess: (data) => {
      if (data.ok) onSignupComplete();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || '가입 중 오류가 발생했습니다.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) return alert('먼저 이메일 인증을 완료해주세요.');

    completeSignupMutation.mutate({
      siteEmail: formData.siteEmail,
      sitePwd: formData.sitePwd,
    });
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 text-foreground">
      <div className="w-full max-w-[380px] space-y-10">
        <header className="space-y-4">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">계정 만들기</h1>
            <p className="text-sm text-muted-foreground font-medium">
              거의 다 왔습니다! 이메일 인증을 진행해주세요.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Verification Group */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground ml-1">
              이메일 주소
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.siteEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, siteEmail: e.target.value })
                  }
                  disabled={isEmailVerified}
                  className={`h-12 rounded-xl border-border ${
                    isEmailVerified ? 'bg-muted/50 text-muted-foreground' : ''
                  }`}
                />
                {isEmailVerified && (
                  <Check className="absolute right-3 top-3.5 w-5 h-5 text-primary" />
                )}
              </div>
              {!isEmailVerified && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRequestEmailCode}
                  disabled={requestEmailCodeMutation.isPending}
                  className="h-12 px-4 font-bold rounded-xl border-border hover:bg-muted/50 transition-colors"
                >
                  {requestEmailCodeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCodeSent ? (
                    '재발송'
                  ) : (
                    '인증요청'
                  )}
                </Button>
              )}
            </div>

            {/* 인증번호 입력창 (발송 후에만 등장) */}
            {isCodeSent && !isEmailVerified && (
              <div className="flex gap-2 mt-2 animate-in slide-in-from-top-2 duration-300">
                <Input
                  placeholder="인증번호 6자리"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className="h-12 rounded-xl border-border flex-1"
                />
                <Button
                  type="button"
                  onClick={handleVerifyEmailCode}
                  disabled={
                    verifyEmailCodeMutation.isPending || emailCode.length < 4
                  }
                  className="h-12 px-6 font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {verifyEmailCodeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    '확인'
                  )}
                </Button>
              </div>
            )}

            {isEmailVerified && (
              <p className="text-xs text-primary font-bold flex items-center gap-1.5 ml-1 animate-in fade-in duration-300">
                <ShieldCheck className="w-3.5 h-3.5" /> 이메일 인증이 성공적으로
                완료되었습니다.
              </p>
            )}
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <Label className="text-sm font-semibold text-foreground">
                비밀번호 설정
              </Label>
              {formData.sitePwd.length > 0 && (
                <span
                  className={`text-xs font-bold ${
                    strengthScore <= 2
                      ? 'text-destructive'
                      : strengthScore === 3
                        ? 'text-orange-500'
                        : 'text-green-500'
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

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="비밀번호 (8자 이상, 특수문자 포함)"
                  value={formData.sitePwd}
                  onChange={(e) =>
                    setFormData({ ...formData, sitePwd: e.target.value })
                  }
                  className="h-12 border-border rounded-xl focus:ring-ring pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Strength Meter Bar */}
              {formData.sitePwd.length > 0 && (
                <div className="flex gap-1 h-1 mt-1 px-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 rounded-full transition-colors duration-300 ${
                        step <= strengthScore
                          ? strengthScore <= 2
                            ? 'bg-destructive'
                            : strengthScore === 3
                              ? 'bg-orange-400'
                              : 'bg-green-600 dark:bg-green-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              )}

              <Input
                type="password"
                placeholder="비밀번호 재확인"
                value={formData.sitePwdConfirm}
                onChange={(e) =>
                  setFormData({ ...formData, sitePwdConfirm: e.target.value })
                }
                className={`h-12 border-border rounded-xl focus:ring-ring ${
                  pwdValidation.match && formData.sitePwdConfirm
                    ? 'bg-primary/10 border-primary/20'
                    : ''
                }`}
              />
            </div>

            <div className="flex gap-3 px-1">
              <ValidationItem isValid={pwdValidation.length} text="8자 이상" />
              <ValidationItem isValid={pwdValidation.special} text="특수문자" />
              <ValidationItem isValid={pwdValidation.match} text="일치 확인" />
            </div>
          </div>

          {/* Identity (ReadOnly) */}
          <div className="p-4 bg-muted/50 rounded-2xl border border-border flex justify-between items-center text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">본인 인증 정보</p>
              <p className="font-bold">
                {formData.name} · {formData.mobile}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Check className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Agreements (iframe modal) */}
          <div className="space-y-3 pt-2">
            <AgreementRow
              id="terms"
              label="서비스 이용약관 동의 (필수)"
              checked={agreements.terms}
              onCheckedChange={(v: any) =>
                setAgreements({ ...agreements, terms: !!v })
              }
              url="/terms"
            />
            <AgreementRow
              id="privacy"
              label="개인정보 처리방침 동의 (필수)"
              checked={agreements.privacy}
              onCheckedChange={(v: any) =>
                setAgreements({ ...agreements, privacy: !!v })
              }
              url="/privacy"
            />
          </div>

          <Button
            type="submit"
            disabled={
              !isEmailVerified ||
              !pwdValidation.match ||
              !pwdValidation.length ||
              !pwdValidation.special ||
              !agreements.terms ||
              !agreements.privacy ||
              completeSignupMutation.isPending
            }
            className="w-full h-14 bg-primary text-primary-foreground rounded-[18px] font-bold text-base shadow-xl disabled:bg-muted disabled:shadow-none disabled:text-muted-foreground transition-all active:scale-[0.98] hover:bg-primary/90"
          >
            {completeSignupMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '회원가입 완료'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// 헬퍼 컴포넌트들
function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
        isValid ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
          isValid ? 'bg-primary border-primary' : 'bg-background border-border'
        }`}
      >
        <Check
          className={`w-2.5 h-2.5 text-primary-foreground ${
            isValid ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      {text}
    </div>
  );
}

function AgreementRow({ id, label, checked, onCheckedChange, url }: any) {
  return (
    <div className="flex items-center justify-between group p-1 hover:bg-accent rounded-lg transition-colors -mx-1 px-1">
      <div className="flex items-center gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="w-5 h-5 border-border rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label
          htmlFor={id}
          className="text-sm text-muted-foreground font-bold cursor-pointer group-hover:text-foreground"
        >
          {label}
        </Label>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="text-xs font-bold text-muted-foreground hover:text-foreground underline underline-offset-4 px-2 py-1"
          >
            보기
          </button>
        </DialogTrigger>
        <DialogContent className="w-[90vw] max-w-[480px] h-[70vh] p-0 rounded-[24px] overflow-hidden">
          <iframe
            src={url}
            className="w-full h-full border-none bg-background"
            title={label}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
