import { Brain, Lock, User, Mail, ArrowLeft, UserCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useState } from 'react';
import axios from 'axios';

interface SignupPageProps {
  onSignupComplete: () => void;
  onBack: () => void;
  initialData?: Partial<{
    username: string;
    name: string;
    email: string;
    nickname: string;
    naverId: string;
    provider: 'naver';
  }>;
}

export function SignupPage({
  onSignupComplete,
  onBack,
  initialData,
}: SignupPageProps) {
  const [formData, setFormData] = useState({
    username: initialData?.username ?? '',
    password: '',
    passwordConfirm: '',
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    nickname: initialData?.nickname ?? '',
    naverId: initialData?.naverId ?? '',
    provider: initialData?.provider ?? 'naver',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8080/auth/naver/complete-signup',
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        },
      );
      onSignupComplete();
    } catch (err) {
      console.error(err);
      alert('회원가입 처리 중 오류가 발생했습니다.');
    }
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
          <span className="text-sm">로그인으로 돌아가기</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-6">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl text-foreground mb-2">회원가입</h1>
          <p className="text-muted-foreground">새 계정을 만들어 시작하세요</p>
        </div>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
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
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  readOnly={Boolean(initialData?.username)}
                  required
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Confirm Input */}
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-foreground">
                비밀번호 확인
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  className="pl-10 h-12 bg-input-background border-border text-foreground placeholder:text-muted-foreground rounded-md focus:border-primary focus:ring-1 focus:ring-ring"
                  value={formData.passwordConfirm}
                  onChange={(e) =>
                    handleChange('passwordConfirm', e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                이름
              </Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="pl-10 h-12 bg-input-background border-border text-foreground placeholder:text-muted-foreground rounded-md focus:border-primary focus:ring-1 focus:ring-ring"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  readOnly={Boolean(initialData?.name)}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                이메일
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className="pl-10 h-12 bg-input-background border-border text-foreground placeholder:text-muted-foreground rounded-md focus:border-primary focus:ring-1 focus:ring-ring"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  readOnly={Boolean(initialData?.email)}
                  required
                />
              </div>
            </div>

            {/* Nickname Input */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-foreground">
                닉네임
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nickname"
                  type="text"
                  placeholder="닉네임을 입력하세요"
                  className="pl-10 h-12 bg-input-background border-border text-foreground placeholder:text-muted-foreground rounded-md focus:border-primary focus:ring-1 focus:ring-ring"
                  value={formData.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  readOnly={Boolean(initialData?.nickname)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:opacity-90 rounded-lg mt-6"
            >
              회원가입
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
