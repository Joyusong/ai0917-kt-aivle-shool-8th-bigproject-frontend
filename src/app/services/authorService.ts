import apiClient from '../api/axios';
import axios from 'axios';
import {
  AuthorDashboardSummaryDto,
  AuthorMyPageDto,
  AuthorNoticeDto,
  ContestTemplateDto,
  ContestTemplateCreateRequestDto,
  ExtractSettingRequest,
  ExtractSettingResponse,
  IPMatchingDto,
  IPProposalDto,
  LorebookDto,
  LorebookCharacterDto,
  LorebookWorldviewDto,
  LorebookPlotDto,
  LorebookPlaceDto,
  LorebookItemDto,
  LorebookGroupDto,
  WorkCreateRequestDto,
  WorkResponseDto,
  WorkStatus,
  WorkUpdateRequestDto,
  EpisodeDto,
  EpisodeDetailDto,
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
      { params: { integrationId } },
    );
    return response.data;
  },

  getDashboardNotices: async (page = 0, size = 5) => {
    const response = await apiClient.get<PageResponse<AuthorNoticeDto>>(
      '/api/v1/author/dashboard/notice',
      { params: { page, size } },
    );
    return response.data;
  },

  // Works
  getWorks: async (integrationId: string) => {
    // CSV defines /api/v1/author/works
    // integrationId might not be needed if session is used, or as query param
    const response = await apiClient.get<WorkResponseDto[]>(
      '/api/v1/author/works',
    );
    return response.data;
  },

  getWorkDetail: async (workId: string) => {
    const response = await apiClient.get<WorkResponseDto>(
      `/api/v1/author/works/${workId}`,
    );
    return response.data;
  },

  getEpisodes: async (workId: string) => {
    const response = await apiClient.get<EpisodeDto[]>(
      `/api/v1/author/works/${workId}/episodes`,
    );
    return response.data;
  },

  getEpisodeDetail: async (workId: string, episodeId: string) => {
    const response = await apiClient.get<EpisodeDetailDto>(
      `/api/v1/author/works/${workId}/episodes/${episodeId}`,
    );
    return response.data;
  },

  createEpisode: async (workId: string, title: string) => {
    const response = await apiClient.post<EpisodeDto>(
      `/api/v1/author/works/${workId}/episodes`,
      { title },
    );
    return response.data;
  },

  updateEpisode: async (
    workId: string,
    episodeId: string,
    content: string,
    title?: string,
  ) => {
    const response = await apiClient.put<EpisodeDetailDto>(
      `/api/v1/author/works/${workId}/episodes/${episodeId}`,
      { content, title },
    );
    return response.data;
  },

  publishEpisode: async (workId: string, episodeId: string) => {
    const response = await apiClient.post<EpisodeDto>(
      `/api/v1/author/works/${workId}/episodes/${episodeId}/publish`,
    );
    return response.data;
  },

  createWork: async (data: WorkCreateRequestDto) => {
    const response = await apiClient.post<number>('/api/v1/author/works', data);
    return response.data;
  },

  updateWork: async (p0: string, data: WorkUpdateRequestDto) => {
    const response = await apiClient.patch<number>(
      '/api/v1/author/works',
      data,
    );
    return response.data;
  },

  updateWorkStatus: async (id: number, status: WorkStatus) => {
    const response = await apiClient.patch<number>(
      `/api/v1/author/works/${id}/status`,
      null,
      { params: { status } },
    );
    return response.data;
  },

  deleteWork: async (id: number) => {
    await apiClient.delete(`/api/v1/author/works/${id}`);
  },

  // Lorebooks (Settings)
  getLorebooks: async () => {
    const response = await apiClient.get<LorebookDto[]>(
      '/api/v1/author/lorebook',
    );
    return response.data;
  },

  getLorebookCharacters: async (workId: string) => {
    const response = await apiClient.get<LorebookCharacterDto[]>(
      `/api/v1/author/lorebook/${workId}/characters`,
    );
    return response.data;
  },

  getLorebookWorldviews: async (workId: string) => {
    const response = await apiClient.get<LorebookWorldviewDto[]>(
      `/api/v1/author/lorebook/${workId}/worldview`,
    );
    return response.data;
  },

  getLorebookPlots: async (workId: string) => {
    const response = await apiClient.get<LorebookPlotDto[]>(
      `/api/v1/author/lorebook/${workId}/plot`,
    );
    return response.data;
  },

  getLorebookPlaces: async (workId: string) => {
    const response = await apiClient.get<LorebookPlaceDto[]>(
      `/api/v1/author/lorebook/${workId}/places`,
    );
    return response.data;
  },

  getLorebookItems: async (workId: string) => {
    const response = await apiClient.get<LorebookItemDto[]>(
      `/api/v1/author/lorebook/${workId}/items`,
    );
    return response.data;
  },

  getLorebookGroups: async (workId: string) => {
    const response = await apiClient.get<LorebookGroupDto[]>(
      `/api/v1/author/lorebook/${workId}/groups`,
    );
    return response.data;
  },

  // Lorebook Mutations (Generic-like pattern for simplicity in service, though specific in implementation)
  createLorebookEntry: async (workId: string, category: string, data: any) => {
    // category: characters, places, items, groups, worldview, plot
    // Mapping category to endpoint path component
    const pathMap: Record<string, string> = {
      characters: 'characters',
      places: 'places',
      items: 'items',
      groups: 'groups',
      worldviews: 'worldview',
      plots: 'plot',
    };
    const path = pathMap[category];
    if (!path) throw new Error(`Invalid category: ${category}`);

    const response = await apiClient.post(
      `/api/v1/author/lorebook/${workId}/${path}`,
      data,
    );
    return response.data;
  },

  updateLorebookEntry: async (
    workId: string,
    category: string,
    id: number,
    data: any,
  ) => {
    const pathMap: Record<string, string> = {
      characters: 'characters',
      places: 'places',
      items: 'items',
      groups: 'groups',
      worldviews: 'worldview',
      plots: 'plot',
    };
    const path = pathMap[category];
    if (!path) throw new Error(`Invalid category: ${category}`);

    const response = await apiClient.put(
      `/api/v1/author/lorebook/${workId}/${path}/${id}`,
      data,
    );
    return response.data;
  },

  deleteLorebookEntry: async (workId: string, category: string, id: number) => {
    const pathMap: Record<string, string> = {
      characters: 'characters',
      places: 'places',
      items: 'items',
      groups: 'groups',
      worldviews: 'worldview',
      plots: 'plot',
    };
    const path = pathMap[category];
    if (!path) throw new Error(`Invalid category: ${category}`);

    await apiClient.delete(`/api/v1/author/lorebook/${workId}/${path}/${id}`);
  },

  searchLorebook: async (workId: string, category: string, query: string) => {
    const response = await apiClient.get<any[]>(
      `/api/v1/author/lorebook/${workId}/search`,
      { params: { category, query } },
    );
    return response.data;
  },

  exportLorebook: async (workId: string) => {
    const response = await apiClient.get(
      `/api/v1/author/lorebook/${workId}/export`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  // IP Expansion
  getIPProposals: async () => {
    const response = await apiClient.get<IPProposalDto[]>(
      '/api/v1/author/ip-expansion/proposals',
    );
    return response.data;
  },

  getIPMatching: async () => {
    const response = await apiClient.get<IPMatchingDto[]>(
      '/api/v1/author/ip-expansion/matching',
    );
    return response.data;
  },

  // Contest Templates
  getContestTemplates: async () => {
    const response = await apiClient.get<ContestTemplateDto[]>(
      '/api/v1/author/contest/templates',
    );
    return response.data;
  },

  createContestTemplate: async (data: ContestTemplateCreateRequestDto) => {
    const response = await apiClient.post<ContestTemplateDto>(
      '/api/v1/author/contest/templates',
      data,
    );
    return response.data;
  },

  // My Page
  getMyPage: async (userId: string) => {
    const response = await apiClient.get<AuthorMyPageDto>(
      `/api/v1/author/${userId}/mypage`,
    );
    return response.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await apiClient.patch(
      `/api/v1/author/${userId}/mypage/profile`,
      data,
    );
    return response.data;
  },

  changePassword: async (userId: string, data: any) => {
    const response = await apiClient.patch(
      `/api/v1/author/${userId}/mypage/pwd`,
      data,
    );
    return response.data;
  },
};
