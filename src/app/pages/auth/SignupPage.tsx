import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Checkbox } from '../../components/ui/checkbox';

interface SignupPageProps {
  onSignupComplete: () => void;
  onBack: () => void;
}

type PendingProfile = {
  naverId: string;
  name: string;
  gender: string;
  birthday: string;
  birthYear: string;
  mobile: string;
};

export function SignupPage({ onSignupComplete, onBack }: SignupPageProps) {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

  const [isLoading, setIsLoading] = useState(true);

  // ✅ 서버(pendingSignup 쿠키)에서 받아온 네이버 정보
  const [pending, setPending] = useState<PendingProfile | null>(null);

  // ✅ 사용자가 입력할 값 (사이트 계정)
  const [formData, setFormData] = useState({
    siteEmail: '',
    sitePwd: '',
    sitePwdConfirm: '',
    mobile: '',
    name: '',
  });

  const [termsAgree, setTermsAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ 1) 페이지 로딩 시 pending 프로필 가져오기
  useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/v1/signup/naver/pending`,
          {
            withCredentials: true, // ⭐ pendingSignup 쿠키 보내기
          },
        );

        const p: PendingProfile = res.data;

        setPending(p);

        // 화면 기본값 채우기
        setFormData((prev) => ({
          ...prev,
          name: p.name ?? '',
          mobile: p.mobile ?? '',
        }));
      } catch (err) {
        console.error(err);
        alert(
          '네이버 인증 정보(pending)가 없습니다. 네이버 로그인을 다시 진행해주세요.',
        );
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadPending();
  }, [backendUrl, navigate]);

  // ✅ 2) 가입 완료 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAgree || !privacyAgree) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    if (!formData.siteEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    if (!formData.sitePwd.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (formData.sitePwd !== formData.sitePwdConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // ✅ 백엔드 SignupController 경로에 맞춤
      const res = await axios.post(
        `${backendUrl}/api/v1/signup/naver/complete`,
        {
          siteEmail: formData.siteEmail,
          sitePwd: formData.sitePwd,
        },
        {
          withCredentials: true, // ⭐ pendingSignup 쿠키 포함
        },
      );

      if (res.status === 200 || res.status === 201) {
        alert('회원가입 신청이 완료되었습니다. (로그인 쿠키가 발급되었습니다)');
        onSignupComplete();
      }
    } catch (err) {
      console.error(err);
      alert(
        '회원가입 처리 중 오류가 발생했습니다. (이메일 인증 여부/중복 이메일 등을 확인)',
      );
    }
  };

  if (isLoading) return null; // 로딩중 깜빡임 방지
  if (!pending) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 md:px-6 md:py-12">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">로그인으로 돌아가기</span>
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-6">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            프로필 완성
          </h1>
          <p className="text-muted-foreground text-sm">
            네이버 인증이 완료되었습니다. <br /> 추가 정보를 입력하여 작가
            가입을 완료하세요.
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* ✅ 사이트 이메일 입력 */}
              <div className="space-y-2">
                <Label className="text-xs font-bold ml-1">이메일</Label>
                <Input
                  value={formData.siteEmail}
                  onChange={(e) => handleChange('siteEmail', e.target.value)}
                  className="h-12"
                  placeholder="name@example.com"
                  required
                />
              </div>

              {/* ✅ 비밀번호 설정 */}
              <div className="space-y-2">
                <Label className="text-xs font-bold ml-1">비밀번호 설정</Label>
                <Input
                  type="password"
                  placeholder="8자 이상 입력하세요"
                  value={formData.sitePwd}
                  onChange={(e) => handleChange('sitePwd', e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold ml-1">비밀번호 확인</Label>
                <Input
                  type="password"
                  value={formData.sitePwdConfirm}
                  onChange={(e) =>
                    handleChange('sitePwdConfirm', e.target.value)
                  }
                  className="h-12"
                  required
                />
              </div>
            </div>

            <hr className="border-border/60" />

            {/* ✅ 네이버에서 온 값 (읽기용) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold ml-1">이름</Label>
                <Input
                  value={formData.name}
                  readOnly
                  className="h-12 bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold ml-1">연락처</Label>
                <Input
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAgree}
                  onCheckedChange={(v) => setTermsAgree(Boolean(v))}
                />
                <label
                  htmlFor="terms"
                  className="text-[13px] text-muted-foreground flex-1 cursor-pointer"
                >
                  서비스 이용약관 동의 (필수)
                </label>
                <Link
                  to="/terms"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  보기
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="privacy"
                  checked={privacyAgree}
                  onCheckedChange={(v) => setPrivacyAgree(Boolean(v))}
                />
                <label
                  htmlFor="privacy"
                  className="text-[13px] text-muted-foreground flex-1 cursor-pointer"
                >
                  개인정보처리방침 동의 (필수)
                </label>
                <Link
                  to="/privacy"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  보기
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-13 text-base font-bold shadow-md active:scale-[0.98] transition-all"
              disabled={!termsAgree || !privacyAgree}
            >
              IP.AI 작가 신청 완료
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
