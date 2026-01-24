import apiClient from '../api/axios';
import axios from 'axios';
import {
  ExtractSettingRequest,
  ExtractSettingResponse,
  AuthorDashboardSummaryDto,
  WorkResponseDto,
  WorkCreateRequestDto,
  WorkUpdateRequestDto,
  WorkStatus,
  AuthorNoticeDto
} from '../types/author';
import { PageResponse } from '../types/common';

// AI Service URL could be different from Main Backend
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL;

export const authorService = {
  // AI Service
  extractSettings: async (data: ExtractSettingRequest) => {
    if (!AI_BASE_URL) {
      throw new Error('AI_BASE_URL is not defined');
    }
    const response = await axios.post<ExtractSettingResponse>(
      `${AI_BASE_URL}/novel`,
      data,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
        // Explicitly set withCredentials to false as the original code didn't use it
        // and it might be a cross-origin request to a server not expecting cookies
        withCredentials: false,
      },
    );
    return response.data;
  },

  // Dashboard
  getDashboardSummary: async (integrationId: string) => {
    const response = await apiClient.get<AuthorDashboardSummaryDto>(
      '/api/v1/author/dashboard/summary',
      { params: { integrationId } }
    );
    return response.data;
  },

  getDashboardNotices: async (page = 0, size = 5) => {
    const response = await apiClient.get<PageResponse<AuthorNoticeDto>>(
      '/api/v1/author/dashboard/notice',
      { params: { page, size } }
    );
    return response.data;
  },

  // Works
  getWorks: async (integrationId: string) => {
    const response = await apiClient.get<WorkResponseDto[]>(
      `/api/v1/author/works/${integrationId}`
    );
    return response.data;
  },

  createWork: async (data: WorkCreateRequestDto) => {
    const response = await apiClient.post<number>('/api/v1/author/works', data);
    return response.data;
  },

  updateWork: async (data: WorkUpdateRequestDto) => {
    const response = await apiClient.patch<number>('/api/v1/author/works', data);
    return response.data;
  },

  updateWorkStatus: async (id: number, status: WorkStatus) => {
    const response = await apiClient.patch<number>(
      `/api/v1/author/works/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  deleteWork: async (id: number) => {
    await apiClient.delete(`/api/v1/author/works/${id}`);
  }
};
