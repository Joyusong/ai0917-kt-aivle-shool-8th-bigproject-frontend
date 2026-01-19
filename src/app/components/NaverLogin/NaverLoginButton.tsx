import React, { useMemo } from 'react';
import { Button } from '../ui/button';

const NaverLogin: React.FC = () => {
  const CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
  const CALLBACK_URL = encodeURIComponent(
    import.meta.env.VITE_NAVER_CALLBACK_URL,
  );

  // 컴포넌트가 다시 그려져도 STATE 값이 바뀌지 않도록 고정
  const NAVER_AUTH_URL = useMemo(() => {
    const STATE = crypto.randomUUID();
    return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${CLIENT_ID}&state=${STATE}&redirect_uri=${CALLBACK_URL}`;
  }, [CLIENT_ID, CALLBACK_URL]);

  const handleLogin = (): void => {
    // alert은 테스트 후에 지워주셔도 됩니다.
    window.location.href = NAVER_AUTH_URL;
  };

  return (
    <Button
      type="button"
      className="w-full h-12 bg-[#03C75A] hover:bg-[#02B350] text-white border-0 rounded-lg"
      onClick={handleLogin}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
      </svg>
      네이버로 시작하기
    </Button>
  );
};

export default NaverLogin;