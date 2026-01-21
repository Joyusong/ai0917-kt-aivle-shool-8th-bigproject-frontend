// Login.jsx
import React from 'react';
import { Button } from '../ui/button';

const NaverLogin = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

  // ✅ 백엔드 컨트롤러: /api/v1/auth/naver/login
  const naverLoginUrl = `${backendUrl}/api/v1/auth/naver/login`;

  const handleNaverLogin = () => {
    window.location.href = naverLoginUrl;
  };

  return (
    <Button
      type="button"
      className="w-full h-12 bg-[#03C75A] hover:bg-[#02B350] text-white border-0 rounded-lg"
      onClick={handleNaverLogin}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
      </svg>
      네이버로 시작하기
    </Button>
  );
};

export default NaverLogin;
