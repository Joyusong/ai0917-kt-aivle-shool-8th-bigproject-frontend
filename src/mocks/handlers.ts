import { http, HttpResponse } from 'msw';

export const handlers = [
  // Hello
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/hello', () => {
    return HttpResponse.json({
      message: 'Mock response for Hello',
      // Add your mock data fields here
    });
  }),

  // NaverHello
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/auth/naver/hello', () => {
    return HttpResponse.json({
      message: 'Mock response for NaverHello',
      // Add your mock data fields here
    });
  }),

  // SQL DATA Get
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/api/test', () => {
    return HttpResponse.json({
      message: 'Mock response for SQL DATA Get',
      // Add your mock data fields here
    });
  }),

  // 이메일 로그인 (자체 로그인)
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/auth/login', () => {
    return HttpResponse.json({
      message: 'Mock response for 이메일 로그인 (자체 로그인)',
      // Add your mock data fields here
    });
  }),

  // 네이버 로그인
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/auth/naver/login', () => {
    return HttpResponse.json({
      message: 'Mock response for 네이버 로그인',
      // Add your mock data fields here
    });
  }),

  // 네이버 로그인 인증 요청 콜백
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/auth/naver/callback',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 네이버 로그인 인증 요청 콜백',
        // Add your mock data fields here
      });
    },
  ),

  // 사용자 상태 조회
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/auth/me', () => {
    return HttpResponse.json({
      message: 'Mock response for 사용자 상태 조회',
      // Add your mock data fields here
    });
  }),

  // 사용자 로그아웃
  http.post('$:import.meta.env.VITE_BACKEND_URL/api/v1/auth/logout', () => {
    return HttpResponse.json({
      message: 'Mock response for 사용자 로그아웃',
      // Add your mock data fields here
    });
  }),

  // 비밀번호 찾기
  http.post('$:import.meta.env.VITE_BACKEND_URL/api/v1/auth/findpwd', () => {
    return HttpResponse.json({
      message: 'Mock response for 비밀번호 찾기',
      // Add your mock data fields here
    });
  }),

  // 관리자 대시보드
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/dashboard', () => {
    return HttpResponse.json({
      message: 'Mock response for 관리자 대시보드',
      // Add your mock data fields here
    });
  }),

  // 관리자 대시보드 통계
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/dashboard/summary',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 관리자 대시보드 통계',
        // Add your mock data fields here
      });
    },
  ),

  // 일일 활성 사용자(DAU) 데이터
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/dashboard/dau',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 일일 활성 사용자(DAU) 데이터',
        // Add your mock data fields here
      });
    },
  ),

  // 시스템 리소스 사용량 조회
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/dashboard/resources',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 시스템 리소스 사용량 조회',
        // Add your mock data fields here
      });
    },
  ),

  // 최근 시스템 로그 목록 조회
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/dashboard/logs',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 최근 시스템 로그 목록 조회',
        // Add your mock data fields here
      });
    },
  ),

  // 배포 및 환경 정보 조회
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/dashboard/deployment',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 배포 및 환경 정보 조회',
        // Add your mock data fields here
      });
    },
  ),

  // 관리자 권한 조회
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/access', () => {
    return HttpResponse.json({
      message: 'Mock response for 관리자 권한 조회',
      // Add your mock data fields here
    });
  }),

  // 권한별 사용자 요약 조회
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/access/summary',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 권한별 사용자 요약 조회',
        // Add your mock data fields here
      });
    },
  ),

  // 사용자 목록 조회 및 검색
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/access/users',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 사용자 목록 조회 및 검색',
        // Add your mock data fields here
      });
    },
  ),

  // 사용자 상세 권한 조회
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/access/users/:id',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 사용자 상세 권한 조회',
        // Add your mock data fields here
      });
    },
  ),

  // 새 사용자 추가 및 권한 부여
  http.post(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/access/users',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 새 사용자 추가 및 권한 부여',
        // Add your mock data fields here
      });
    },
  ),

  // 사용자 권한/상태 정보 수정
  http.patch(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/access/users/:id',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 사용자 권한/상태 정보 수정',
        // Add your mock data fields here
      });
    },
  ),

  // 사용자 권한 회수 및 삭제
  http.delete(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/access/users/:id',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 사용자 권한 회수 및 삭제',
        // Add your mock data fields here
      });
    },
  ),

  // 공지사항 목록 조회
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/notice', () => {
    return HttpResponse.json({
      message: 'Mock response for 공지사항 목록 조회',
      // Add your mock data fields here
    });
  }),

  // 공지사항 상세 조회
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/notice/:id', () => {
    return HttpResponse.json({
      message: 'Mock response for 공지사항 상세 조회',
      // Add your mock data fields here
    });
  }),

  // 새 공지사항 작성
  http.post('$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/notice', () => {
    return HttpResponse.json({
      message: 'Mock response for 새 공지사항 작성',
      // Add your mock data fields here
    });
  }),

  // 공지사항 정보 수정
  http.patch(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/notice/:id',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 공지사항 정보 수정',
        // Add your mock data fields here
      });
    },
  ),

  // 공지사항 파일 삭제
  http.delete(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/notice/:id/file',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 공지사항 파일 삭제',
        // Add your mock data fields here
      });
    },
  ),

  // 공지사항 파일 다운로드
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/notice/:id/download',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 공지사항 파일 다운로드',
        // Add your mock data fields here
      });
    },
  ),

  // 공지사항 삭제
  http.delete(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/notice/:id',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 공지사항 삭제',
        // Add your mock data fields here
      });
    },
  ),

  // 최근 알림 목록 조회
  http.get('$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/sysnotice', () => {
    return HttpResponse.json({
      message: 'Mock response for 최근 알림 목록 조회',
      // Add your mock data fields here
    });
  }),

  // 알림 통계 조회
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/sysnotice/stats',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 알림 통계 조회',
        // Add your mock data fields here
      });
    },
  ),

  // 실시간 알림 구독 ( 1시간 )
  http.get(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/sysnotice/subscribe',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 실시간 알림 구독 ( 1시간 )',
        // Add your mock data fields here
      });
    },
  ),

  // 알림 읽음 처리
  http.patch(
    '$:import.meta.env.VITE_BACKEND_URL/api/v1/admin/sysnotice/:source/:id/read',
    () => {
      return HttpResponse.json({
        message: 'Mock response for 알림 읽음 처리',
        // Add your mock data fields here
      });
    },
  ),
];
