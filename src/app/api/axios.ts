import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 토큰 재발급 중인지 상태 저장
let isRefreshing = false;
// 재발급 대기 중인 요청들을 담는 큐
let refreshSubscribers: ((token: string) => void)[] = [];

// 큐에 요청 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// 재발급 완료 후 대기 중인 요청들 일괄 실행
const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// [Request Interceptor] 모든 요청에 Access Token 주입
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// [Response Interceptor] 401 에러 시 토큰 재발급 로직
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { config, response } = error;
    const originalRequest = config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고, 재시도한 적이 없는 요청일 때
    if (response?.status === 401 && !originalRequest._retry) {
      // 이미 재발급 중이라면 큐에서 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((accessToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 서버의 /refresh 엔드포인트 호출 (refreshToken 쿠키는 withCredentials에 의해 자동 포함)
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // 상태 초기화 및 대기 중인 요청들 실행
        isRefreshing = false;
        onRefreshed(newAccessToken);

        // 현재 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh마저 실패하면(로그인 만료) 강제 로그아웃
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        // Landing Page('/')나 Login Page('/login')가 아닐 경우에만 리다이렉트
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/' &&
          window.location.pathname !== '/signup'
        ) {
          window.location.href = '/login'; // 혹은 리덕스/recoil 로그아웃 액션 실행
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
