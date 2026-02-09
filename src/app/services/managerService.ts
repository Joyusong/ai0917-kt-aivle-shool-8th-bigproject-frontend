import apiClient from '../api/axios';
import { PageResponse } from '../types/common';
import {
  IPTrendDashboardDto,
  IPTrendReportDto,
  IPTrendPreviewDto,
  AuthorSummaryDto,
  ManagerAuthorDto,
  ManagerAuthorDetailDto,
  ManagerDashboardSummaryDto,
  ManagerDashboardPageResponseDto,
} from '../types/manager';
import { LorebookDto, IPProposalDto, IPMatchingDto } from '../types/author';

export const managerService = {
  // Manager Dashboard
  getDashboardPage: async () => {
    const response = await apiClient.get<ManagerDashboardPageResponseDto>(
      '/api/v1/manager/dashboard',
    );
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await apiClient.get<ManagerDashboardSummaryDto>(
      '/api/v1/manager/dashboard/summary',
    );
    return response.data;
  },

  // IP Trend Analysis
  getIPTrend: async () => {
    const response = await apiClient.get<IPTrendDashboardDto>(
      '/api/v1/manager/iptrend',
    );
    return response.data;
  },

  getIPTrendList: async (page = 0, size = 10) => {
    const response = await apiClient.get<PageResponse<IPTrendReportDto>>(
      '/api/v1/manager/iptrend/list',
      { params: { page, size } },
    );
    return response.data;
  },

  getIPTrendPreview: async (id: number) => {
    const response = await apiClient.get<IPTrendPreviewDto>(
      `/api/v1/manager/iptrend/preview/${id}`,
    );
    return response.data;
  },

  getIPTrendReport: async () => {
    const response = await apiClient.get('/api/v1/manager/iptrend/report', {
      responseType: 'blob',
    });
    return response.data;
  },

  generateIPTrend: async (data: {
    analysisDate?: string;
    dataSource?: string;
    forceRegenerate?: boolean;
  }) => {
    const response = await apiClient.post(
      '/api/v1/manager/iptrend/generate',
      data,
    );
    return response.data;
  },

  downloadIPTrendReport: async (id: number) => {
    const response = await apiClient.get(
      `/api/v1/manager/iptrend/download/${id}`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  // Author Management
  getAuthors: async (params: {
    keyword?: string;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await apiClient.get<PageResponse<ManagerAuthorDto>>(
      '/api/v1/manager/authors',
      { params },
    );
    return response.data;
  },

  getAuthorsSummary: async () => {
    const response = await apiClient.get<AuthorSummaryDto>(
      '/api/v1/manager/authors/summary',
    );
    return response.data;
  },

  getAuthorDetail: async (id: number) => {
    const response = await apiClient.get<ManagerAuthorDetailDto>(
      `/api/v1/manager/authors/${id}`,
    );
    return response.data;
  },

  matchAuthor: async (pwd: string) => {
    const response = await apiClient.post(`/api/v1/manager/authors/${pwd}`);
    return response.data;
  },

  getWorks: async (authorId: number) => {
    const response = await apiClient.get(
      `/api/v1/manager/authors/${authorId}/works`,
    );
    return response.data;
  },

  getLorebooks: async (workId: number) => {
    const response = await apiClient.get<LorebookDto[]>(
      `/api/v1/manager/works/${workId}/lorebooks`,
    );
    return response.data;
  },

  getLorebooksByAuthorAndTitle: async (
    userId: string | number,
    title: string,
    workId: number,
  ) => {
    const response = await apiClient.get<LorebookDto[]>(
      `/api/v1/author/${userId}/${title}/lorebook`,
      { params: { workId } },
    );
    return response.data;
  },

  // IP Expansion
  getIPProposals: async (
    managerId: number | string = 'me',
    page = 0,
    size = 10,
  ) => {
    const response = await apiClient.get<PageResponse<IPProposalDto>>(
      `/api/v1/manager/ipext/${managerId}`,
      { params: { page, size } },
    );
    return response.data;
  },

  getIPProposalDetail: async (
    id: number,
    managerId: string | number = 'me',
  ) => {
    const response = await apiClient.get<IPProposalDto>(
      `/api/v1/manager/ipext/${managerId}/${id}`,
    );
    return response.data;
  },

  getManagerAuthors: async (managerId: number | string) => {
    const response = await apiClient.get<ManagerAuthorDto[]>(
      `/api/v1/manager/ipext/${managerId}/author`,
    );
    return response.data;
  },

  getAuthorWorks: async (integrationId: string | number) => {
    const response = await apiClient.get<any[]>(
      `/api/v1/manager/ipext/${integrationId}/authorwork`,
    );
    return response.data;
  },

  getAuthorWorkLorebooks: async (workId: number) => {
    const response = await apiClient.get<LorebookDto[]>(
      `/api/v1/manager/ipext/${workId}/authorworklorebook`,
    );
    return response.data;
  },

  checkConflicts: async (data: any) => {
    const response = await apiClient.post(
      '/api/v1/ai/manager/ipext/settings',
      data,
    );
    return response.data;
  },

  createIPExpansionProject: async (data: any) => {
    const response = await apiClient.post('/api/v1/ai/manager/ipext', data);
    return response.data;
  },

  updateIPProposal: async (
    id: number,
    data: any,
    managerId: string | number = 'me',
  ) => {
    const response = await apiClient.patch(
      `/api/v1/manager/ipext/${managerId}/${id}`,
      data,
    );
    return response.data;
  },

  deleteIPExpansionProject: async (id: number) => {
    const response = await apiClient.delete(`/api/v1/manager/ipext/${id}`);
    return response.data;
  },

  proposeIPExpansionProject: async (id: number) => {
    const response = await apiClient.put(`/api/v1/manager/ipext/${id}/propose`);
    return response.data;
  },

  getIPProposalPreview: async (id: number) => {
    const response = await apiClient.get(`/api/v1/manager/ipext/preview/${id}`);
    return response.data;
  },

  downloadIPProposal: async (id: number) => {
    const response = await apiClient.get(
      `/api/v1/manager/ipext/download/${id}`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  // IP Matching
  getIPMatching: async () => {
    const response = await apiClient.get<IPMatchingDto[]>(
      '/api/v1/manager/ipext/matching',
    );
    return response.data;
  },
};
