import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { profile } from 'console';

interface RedirectURIProps {
  onLoginSuccess: (type: 'manager' | 'author' | 'admin') => void;
  onRequireSignup: (profile: Record<string, any>) => void;
  onFail: () => void;
}

const RedirectURI: React.FC<RedirectURIProps> = ({
  onLoginSuccess,
  onRequireSignup,
  onFail,
}) => {
  const navigate = useNavigate();
  const isRequestSent = useRef(false); // React 18+ StrictMode 중복 요청 방지

  useEffect(() => {
    // 1. URL에서 네이버 인증 코드(code)와 상태(state) 추출
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const authenticateUser = async () => {
      // 인증 코드는 1회용이므로 중복 요청 방지
      if (isRequestSent.current) return;
      isRequestSent.current = true;

      try {
        // 2. 백엔드로 인증 코드 전송
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/naver/user`,
          {
            code,
            state,
          },
        );

        // 3. 백엔드 응답 결과에 따른 분기 처리
        const { role, isNewMember, accessToken } = response.data;
        alert(response.data);

        if (!isNewMember) {
          // [CASE 1] 기존 회원: 토큰 저장 및 대시보드 이동
          if (accessToken) localStorage.setItem('accessToken', accessToken);
          onLoginSuccess(role);
          navigate('/');
        } else if (isNewMember) {
          // [CASE 2] 신규 회원: 네이버 정보를 App 상태에 저장하고 회원가입으로 이동
          alert('가입 정보가 없습니다. 회원가입 페이지로 이동합니다.');
          onRequireSignup(response.data);
          navigate('/'); // App.tsx의 currentScreen 상태가 'signup'으로 바뀌어 출력됨
        }
      } catch (error) {
        console.error('네이버 로그인 인증 실패:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        navigate('/');
        onFail();
      }
    };

    if (code) {
      authenticateUser();
    } else {
      console.error('인증 코드가 누락되었습니다.');
      navigate('/');
      onFail();
    }
  }, [navigate, onLoginSuccess, onRequireSignup, onFail]);

  return (
    <Container>
      <StatusText>네이버 계정 정보를 확인하고 있습니다...</StatusText>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
`;

const StatusText = styled.p`
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
`;

export default RedirectURI;
