import { id } from 'date-fns/locale';
import apiClient from '../api/axios';
import {
  AuthMeResponse,
  SignupPendingResponse,
  EmailRequest,
  EmailVerifyRequest,
  EmailVerifyResponse,
  SignupCompleteRequest,
  SignupCompleteResponse,
  LoginRequest,
  LoginResponse,
  PasswordResetCodeRequest,
  PasswordResetVerifyRequest,
  PasswordResetRequest,
} from '../types/auth';

export const authService = {
  me: async () => {
    const response = await apiClient.get<AuthMeResponse>('/api/v1/auth/me');
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/login',
      data,
    );
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  },

  getPendingSignup: async () => {
    const response = await apiClient.get<SignupPendingResponse>(
      '/api/v1/signup/naver/pending',
    );
    return response.data;
  },

  requestEmailCode: async (data: EmailRequest) => {
    const response = await apiClient.post('/api/v1/signup/email/request', data);
    return response.data;
  },

  verifyEmailCode: async (data: EmailVerifyRequest) => {
    const response = await apiClient.post<EmailVerifyResponse>(
      '/api/v1/signup/email/verify',
      data,
    );
    return response.data;
  },

  completeSignup: async (data: SignupCompleteRequest) => {
    const response = await apiClient.post<SignupCompleteResponse>(
      '/api/v1/signup/naver/complete',
      data,
    );
    return response.data;
  },

  deactivateUser: async (data: { id: number }) => {
    const response = await apiClient.post('/api/v1/auth/deactivated', data);
    return response.data;
  },

  // Password Reset
  requestPasswordResetCode: async (data: PasswordResetCodeRequest) => {
    const response = await apiClient.post(
      '/api/v1/signup/password/email/request',
      data,
    );
    return response.data;
  },

  verifyPasswordResetCode: async (data: PasswordResetVerifyRequest) => {
    const response = await apiClient.post('/api/v1/signup/email/verify', data);
    return response.data;
  },

  resetPassword: async (data: PasswordResetRequest) => {
    const response = await apiClient.post(
      '/api/v1/signup/password/reset',
      data,
    );
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.patch(
      '/api/v1/signup/password/reset',
      data,
    );
    return response.data;
  },
};
