import apiClient from '../api/axios';
import {
  AccessSummaryResponseDto,
  DashboardSummaryResponseDto,
  DauResponseDto,
  ResourceUsageResponseDto,
  SystemLogsResponseDto,
  DeploymentInfoResponseDto,
  SystemNoticeResponseDto,
  UserCreateRequestDto,
  UserDetailResponseDto,
  UserListResponseDto,
  UserUpdateRequestDto,
} from '../types/admin';
import { PageResponse, UserRole } from '../types/common';

export const adminService = {
  // Dashboard
  getDashboardSummary: async () => {
    const response = await apiClient.get<DashboardSummaryResponseDto>(
      '/api/v1/admin/dashboard/summary',
    );
    return response.data;
  },

  getDashboardDau: async () => {
    const response = await apiClient.get<DauResponseDto>(
      '/api/v1/admin/dashboard/dau',
    );
    return response.data;
  },

  getDashboardResources: async () => {
    const response = await apiClient.get<ResourceUsageResponseDto>(
      '/api/v1/admin/dashboard/resources',
    );
    return response.data;
  },

  getDashboardLogs: async (limit: number = 50) => {
    const response = await apiClient.get<SystemLogsResponseDto>(
      '/api/v1/admin/dashboard/logs',
      {
        params: { limit },
      },
    );
    return response.data;
  },

  getDashboardDeployment: async () => {
    const response = await apiClient.get<DeploymentInfoResponseDto>(
      '/api/v1/admin/dashboard/deployment',
    );
    return response.data;
  },

  // System Notices
  getSystemNotices: async (unreadOnly: boolean = false) => {
    const params = unreadOnly ? { read: false } : {};
    const response = await apiClient.get<SystemNoticeResponseDto>(
      '/api/v1/admin/sysnotice',
      { params },
    );
    return response.data;
  },

  markSystemNoticeAsRead: async (source: string, id: number) => {
    await apiClient.patch(`/api/v1/admin/sysnotice/${source}/${id}/read`);
  },

  markAllSystemNoticesAsRead: async () => {
    await apiClient.patch('/api/v1/admin/sysnotice/read-all');
  },

  // Notice Management
  getNotices: async (page: number, size: number, keyword?: string) => {
    const params: any = { page, size };
    if (keyword) params.keyword = keyword;
    const response = await apiClient.get('/api/v1/admin/notice', { params });
    return response.data;
  },

  getNoticeDetail: async (id: number) => {
    const response = await apiClient.get(`/api/v1/admin/notice/${id}`);
    return response.data;
  },

  createNotice: async (formData: FormData) => {
    const response = await apiClient.post('/api/v1/admin/notice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateNotice: async (id: number, formData: FormData) => {
    const response = await apiClient.patch(
      `/api/v1/admin/notice/${id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  deleteNotice: async (id: number) => {
    await apiClient.delete(`/api/v1/admin/notice/${id}`);
  },

  downloadNoticeFile: async (id: number) => {
    const response = await apiClient.get(
      `/api/v1/admin/notice/${id}/download`,
      {
        responseType: 'blob',
      },
    );
    return response.data;
  },

  // Access Management
  getSummary: async () => {
    const response = await apiClient.get<AccessSummaryResponseDto>(
      '/api/v1/admin/access/summary',
    );
    return response.data;
  },

  getUsers: async (
    page: number,
    size: number,
    keyword?: string,
    role?: UserRole | '',
  ) => {
    const params: any = { page, size };
    if (keyword) params.keyword = keyword;
    if (role) params.role = role;

    const response = await apiClient.get<PageResponse<UserListResponseDto>>(
      '/api/v1/admin/access/users',
      { params },
    );
    return response.data;
  },

  getUserDetail: async (id: number) => {
    const response = await apiClient.get<UserDetailResponseDto>(
      `/api/v1/admin/access/users/${id}`,
    );
    return response.data;
  },

  createUser: async (data: UserCreateRequestDto) => {
    const response = await apiClient.post('/api/v1/admin/access/users', data);
    return response.data;
  },

  updateUserRole: async (id: number, role: UserRole) => {
    const data: UserUpdateRequestDto = { role };
    const response = await apiClient.patch(
      `/api/v1/admin/access/users/${id}`,
      data,
    );
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await apiClient.delete(`/api/v1/admin/access/users/${id}`);
    return response.data;
  },
};
