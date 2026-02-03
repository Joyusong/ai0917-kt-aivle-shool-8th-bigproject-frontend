import apiClient from '../api/axios';
import { PageResponse } from '../types/common';
import {
  IPTrendDashboardDto,
  IPTrendReportDto,
  IPTrendPreviewDto,
  AuthorSummaryDto,
  ManagerAuthorDto,
  ManagerAuthorDetailDto,
} from '../types/manager';
import { LorebookDto, IPProposalDto, IPMatchingDto } from '../types/author';

export const managerService = {
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
    linked?: boolean;
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

  getLorebooks: async (workId: number) => {
    // Note: Assuming a manager-specific endpoint or using a shared one.
    // Since manager should have access, we might need a specific endpoint.
    // For now, let's assume there is an endpoint to get lorebooks by workId for manager.
    const response = await apiClient.get<LorebookDto[]>(
      `/api/v1/manager/works/${workId}/lorebooks`,
    );
    return response.data;
  },

  // IP Expansion
  getIPProposals: async (page = 0, size = 12) => {
    const response = await apiClient.get<PageResponse<IPProposalDto>>(
      '/api/v1/manager/ip-expansion/proposals',
      { params: { page, size } },
    );
    return response.data;
  },

  getIPMatching: async () => {
    const response = await apiClient.get<IPMatchingDto[]>(
      '/api/v1/manager/ip-expansion/matching',
    );
    return response.data;
  },

  createIPExpansionProject: async (data: any) => {
    const response = await apiClient.post(
      '/api/v1/manager/ip-expansion/proposals',
      data,
    );
    return response.data;
  },

  proposeIPExpansionProject: async (id: number) => {
    const response = await apiClient.put(
      `/api/v1/manager/ip-expansion/proposals/${id}/propose`,
    );
    return response.data;
  },

  deleteIPExpansionProject: async (id: number) => {
    const response = await apiClient.delete(
      `/api/v1/manager/ip-expansion/proposals/${id}`,
    );
    return response.data;
  },
};
