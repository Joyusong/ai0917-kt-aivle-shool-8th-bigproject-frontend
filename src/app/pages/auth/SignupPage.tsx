import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Loader2,
  Check,
  X,
  ShieldCheck,
  Mail,
  Lock,
  Smartphone,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';

export function SignupPage({
  onSignupComplete,
  onBack,
}: {
  onSignupComplete: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailCode, setEmailCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [formData, setFormData] = useState({
    siteEmail: '',
    sitePwd: '',
    sitePwdConfirm: '',
    name: '',
    mobile: '',
  });

  // 비밀번호 검증 상태
  const pwdValidation = {
    length: formData.sitePwd.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<> ]/.test(formData.sitePwd),
    match:
      formData.sitePwd !== '' && formData.sitePwd === formData.sitePwdConfirm,
  };

  useEffect(() => {
    if (!token) {
      alert('네이버 인증 정보가 없습니다. 다시 로그인 해주세요.');
      navigate('/login', { replace: true });
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await apiClient.get('/api/v1/signup/naver/pending');
        setFormData((prev) => ({
          ...prev,
          name: res.data.name ?? '',
          mobile: res.data.mobile ?? '',
        }));
      } catch (err) {
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    loadPending();
  }, [navigate]);

  const handleRequestEmailCode = async () => {
    if (!formData.siteEmail.includes('@')) return;
    try {
      await apiClient.post('/api/v1/signup/email/request', {
        email: formData.siteEmail,
      });
      setIsCodeSent(true);
    } catch (err) {
      alert('발송 실패');
    }
  };

  const handleVerifyEmailCode = async () => {
    try {
      const res = await apiClient.post('/api/v1/signup/email/verify', {
        email: formData.siteEmail,
        code: emailCode,
      });
      if (res.data.ok) setIsEmailVerified(true);
    } catch (err) {
      alert('인증 실패');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdValidation.length || !pwdValidation.special || !pwdValidation.match)
      return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/signup/naver/complete', {
        siteEmail: formData.siteEmail,
        sitePwd: formData.sitePwd,
      });
      if (res.data.ok) onSignupComplete();
    } catch (err) {
      alert('가입 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-slate-200" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 antialiased text-slate-900">
      <div className="w-full max-w-[380px] space-y-10">
        {/* Header */}
        <header className="space-y-4">
          <button
            onClick={onBack}
            className="p-0 h-auto text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              계정 만들기
            </h1>
            <p className="text-sm text-slate-500">
              네이버 인증이 확인되었습니다. 나머지 정보를 입력해주세요.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Email Verification */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[13px] font-medium text-slate-700"
              >
                이메일 주소
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.siteEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, siteEmail: e.target.value })
                  }
                  disabled={isEmailVerified}
                  className="h-11 rounded-md border-slate-200 focus-visible:ring-slate-400"
                />
                {!isEmailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRequestEmailCode}
                    className="h-11 px-4 text-xs font-semibold border-slate-200"
                  >
                    {isCodeSent ? '재요청' : '인증'}
                  </Button>
                )}
              </div>
            </div>

            {isCodeSent && !isEmailVerified && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                <Input
                  placeholder="인증코드 6자리"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className="h-11 border-slate-200"
                />
                <Button
                  type="button"
                  onClick={handleVerifyEmailCode}
                  className="h-11 px-6 font-bold bg-slate-900 text-white"
                >
                  확인
                </Button>
              </div>
            )}
            {isEmailVerified && (
              <p className="text-[12px] text-blue-600 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> 이메일 인증이 완료되었습니다.
              </p>
            )}
          </div>

          {/* Section 2: Password with Validation */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-slate-700">
                비밀번호 설정
              </Label>
              <Input
                type="password"
                placeholder="비밀번호 입력"
                value={formData.sitePwd}
                onChange={(e) =>
                  setFormData({ ...formData, sitePwd: e.target.value })
                }
                className="h-11 border-slate-200 focus-visible:ring-slate-400"
              />
              <Input
                type="password"
                placeholder="비밀번호 재입력"
                value={formData.sitePwdConfirm}
                onChange={(e) =>
                  setFormData({ ...formData, sitePwdConfirm: e.target.value })
                }
                className="h-11 border-slate-200 focus-visible:ring-slate-400"
              />
            </div>

            {/* Password Checklist */}
            <div className="grid grid-cols-2 gap-y-2 px-1">
              <ValidationItem isValid={pwdValidation.length} text="8자 이상" />
              <ValidationItem
                isValid={pwdValidation.special}
                text="특수문자 포함"
              />
              <ValidationItem
                isValid={pwdValidation.match}
                text="비밀번호 일치"
              />
            </div>
          </div>

          {/* Section 3: Identity (ReadOnly) */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">이름</span>
              <span className="text-slate-900 font-semibold">
                {formData.name}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">휴대폰 번호</span>
              <span className="text-slate-900 font-semibold">
                {formData.mobile}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={
              !isEmailVerified ||
              !pwdValidation.match ||
              !pwdValidation.length ||
              !pwdValidation.special ||
              isSubmitting
            }
            className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 rounded-md font-semibold transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '가입 완료하기'
            )}
          </Button>
        </form>

        <footer className="text-center">
          <p className="text-[12px] text-slate-400 font-medium">
            가입 시 서비스{' '}
            <span className="underline cursor-pointer">이용약관</span> 및{' '}
            <span className="underline cursor-pointer">개인정보처리방침</span>에
            동의하게 됩니다.
          </p>
        </footer>
      </div>
    </div>
  );
}

// 비밀번호 검증 아이템 컴포넌트
function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${isValid ? 'text-blue-600' : 'text-slate-300'}`}
    >
      {isValid ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <X className="w-3.5 h-3.5" />
      )}
      {text}
    </div>
  );
}
