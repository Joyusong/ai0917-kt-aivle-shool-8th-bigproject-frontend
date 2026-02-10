import apiClient from '../api/axios';
import {
  AuthorDashboardSummaryDto,
  AuthorMyPageDto,
  AuthorNoticeDto,
  IPMatchingDto,
  IPProposalDto,
  LorebookDto,
  LorebookSimilarityRequestDto,
  WorkCreateRequestDto,
  WorkResponseDto,
  WorkStatus,
  WorkUpdateRequestDto,
  KeywordExtractionRequestDto,
  KeywordExtractionResponseDto,
  PublishAnalysisRequestDto,
  PublishAnalysisResponseDto,
  AuthorManagerResponseDto,
  ManuscriptDto,
  ManuscriptDetailDto,
  ManuscriptUploadRequestDto,
  LorebookSaveRequestDto,
  LorebookUpdateRequestDto,
  LorebookConflictSolveRequestDto,
} from '../types/author';
import { PageResponse } from '../types/common';
import { AuthMeResponse } from '../types/auth';

export const authorService = {
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

  downloadNoticeAttachment: async (noticeId: number) => {
    const response = await apiClient.get(
      `/api/v1/author/notices/${noticeId}/attachment`,
      {
        responseType: 'blob',
      },
    );
    return response.data;
  },

  // System Notices (Real-time)
  getSystemNotices: async (integrationId: string) => {
    const response = await apiClient.get<any>('/api/v1/author/sysnotice', {
      params: { integrationId },
    });
    // Backend returns list directly or wrapped
    // User requirement: GET /api/v1/author/sysnotice?integrationId={authorIntegrationid}
    const notices = Array.isArray(response.data)
      ? response.data
      : response.data.notices || [];
      
    // Normalize notices to ensure 'read' property exists (handle 'isRead' from backend if present)
    const normalizedNotices = notices.map((n: any) => ({
      ...n,
      read: n.read !== undefined ? n.read : (n.isRead !== undefined ? n.isRead : false),
    }));

    return {
      content: normalizedNotices,
      totalElements: normalizedNotices.length,
      totalPages: 1,
      last: true,
      size: normalizedNotices.length,
      number: 0,
      page: 0,
    } as PageResponse<AuthorNoticeDto>;
  },

  getSystemNoticeSubscribeUrl: (integrationId: string) => {
    // SSE URL
    const baseUrl =
      apiClient.defaults.baseURL || import.meta.env.VITE_BACKEND_URL;
    return `${baseUrl}/api/v1/author/sysnotice/subscribe?integrationId=${integrationId}`;
  },

  readSystemNotice: async (
    id: number,
    source: string,
    integrationId: string,
  ) => {
    await apiClient.patch(
      `/api/v1/author/sysnotice/${source}/${id}/read`,
      null,
      {
        params: { integrationId },
      },
    );
  },

  readAllSystemNotices: async (integrationId: string) => {
    await apiClient.patch('/api/v1/author/sysnotice/read-all', null, {
      params: { integrationId },
    });
  },

  // Works
  getWorks: async (integrationId: string) => {
    // CSV defines /api/v1/author/works
    // integrationId might not be needed if session is used, or as query param
    const response = await apiClient.get<WorkResponseDto[]>(
      '/api/v1/author/works',
      { params: { authorId: integrationId } },
    );
    return response.data;
  },

  getWorkDetail: async (workId: string) => {
    const response = await apiClient.get<WorkResponseDto>(
      `/api/v1/author/works/${workId}`,
    );
    return response.data;
  },

  // Manuscripts (Replaces Episodes)
  getManuscripts: async (
    userId: string,
    title: string,
    page: number = 0,
    size: number = 10,
    workId?: number,
    sort?: string,
  ) => {
    const response = await apiClient.get<PageResponse<ManuscriptDto>>(
      `/api/v1/author/${userId}/${title}/manuscript/list`,
      { params: { workId, page, size, sort } },
    );
    return response.data;
  },

  // AI Analysis for Works
  publishAnalysis: async (workId: string, data: PublishAnalysisRequestDto) => {
    // Redirected to Backend
    const response = await apiClient.post<PublishAnalysisResponseDto>(
      `/api/v1/ai/author/setting`,
      { workId, ...data },
    );
    return response.data;
  },

  getWorkAnalysis: async (workId: number) => {
    const response = await apiClient.get<{
      relationship: string;
      timeline: string;
    }>(`/api/v1/ai/author/works/${workId}/analysis`);
    return response.data;
  },

  // Analysis - Relationship
  analyzeRelationship: async (
    workId: number,
    userId: string,
    target: string,
  ) => {
    const response = await apiClient.post<string>(
      `/api/v1/ai/author/works/${workId}/analysis/relationships`,
      { user_id: userId, target: target },
    );
    return response.data;
  },

  // Analysis - Timeline
  getTimelineEpisodes: async (workId: number) => {
    const response = await apiClient.get<
      { ep_num: number; subtitle: string; id: number }[]
    >(`/api/v1/ai/author/works/${workId}/analysis/timeline/episodes`);
    return response.data;
  },

  analyzeTimeline: async (workId: number, userId: string, target: number[]) => {
    const response = await apiClient.post<string>(
      `/api/v1/ai/author/works/${workId}/analysis/timeline`,
      { user_id: userId, target: target },
    );
    return response.data;
  },

  getCharacterAnalysis: async (workId: number, characterName: string) => {
    const response = await apiClient.get<{ relationship: string }>(
      `/api/v1/ai/author/works/${workId}/character/${encodeURIComponent(characterName)}/relationship`,
    );
    return response.data;
  },

  getFullRelationshipAnalysis: async (workId: number) => {
    const response = await apiClient.get<{ relationship: string }>(
      `/api/v1/ai/author/works/${workId}/relationship`,
    );
    return response.data;
  },

  publishConfirm: async (workId: string) => {
    const response = await apiClient.post(
      `/api/v1/author/works/${workId}/publish/confirm`,
    );
    return response.data;
  },

  // IP Expansion (Manager Integration)
  getManagerIPExpansions: async (managerId: string) => {
    const response = await apiClient.get<PageResponse<IPProposalDto>>(
      `/api/v1/manager/ipext/${managerId}`,
    );
    return response.data.content;
  },

  getManagerIPExpansionDetail: async (managerId: string, ipextId: string) => {
    const response = await apiClient.get<IPProposalDto>(
      `/api/v1/manager/ipext/${managerId}/${ipextId}`,
    );
    return response.data;
  },

  approveIPProposal: async (id: number, comment?: string) => {
    const response = await apiClient.post(
      `/api/v1/author/ip-expansion/proposals/${id}/approve`,
      { comment },
    );
    return response.data;
  },

  rejectIPProposal: async (id: number, reason: string) => {
    const response = await apiClient.post(
      `/api/v1/author/ip-expansion/proposals/${id}/reject`,
      { reason },
    );
    return response.data;
  },

  saveAfterConflict: async (
    userId: string,
    title: string,
    workId: number,
    data: LorebookConflictSolveRequestDto,
  ) => {
    const response = await apiClient.post<string>(
      `/api/v1/ai/author/${userId}/${title}/lorebook/conflict_solve`,
      data,
      { params: { workId } },
    );
    return response.data;
  },

  createWork: async (data: WorkCreateRequestDto) => {
    const response = await apiClient.post<number>('/api/v1/author/works', data);
    return response.data;
  },

  updateWork: async (id: number, data: WorkUpdateRequestDto) => {
    const response = await apiClient.patch<number>(
      `/api/v1/author/works/${id}`,
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

  // Manuscripts (Original Text)
  uploadManuscript: async (
    userId: string,
    title: string,
    data: ManuscriptUploadRequestDto,
  ) => {
    const response = await apiClient.post(
      `/api/v1/author/${userId}/${title}/manuscript/upload`,
      data,
    );
    return response.data;
  },

  updateManuscriptContent: async (
    userId: string,
    title: string,
    data: {
      workId: number;
      episode: number;
      subtitle: string;
      txt: string;
    },
  ) => {
    const response = await apiClient.patch(
      `/api/v1/author/${userId}/${title}/manuscript/upload`,
      data,
    );
    return response.data;
  },

  updateManuscript: async (
    userId: string,
    title: string,
    manuscriptId: number,
    data: { subtitle?: string },
  ) => {
    const response = await apiClient.patch(
      `/api/v1/author/${userId}/${title}/manuscript/${manuscriptId}`,
      data,
    );
    return response.data;
  },

  getManuscriptDetail: async (
    userId: string,
    title: string,
    manuscriptId: number,
  ) => {
    const response = await apiClient.get<ManuscriptDetailDto>(
      `/api/v1/author/${userId}/${title}/manuscript/${manuscriptId}`,
    );
    return response.data;
  },

  deleteManuscript: async (
    userId: string,
    title: string,
    manuscriptId: number,
  ) => {
    await apiClient.delete(
      `/api/v1/author/${userId}/${title}/manuscript/${manuscriptId}`,
    );
  },

  // AI Analysis for Manuscripts
  getManuscriptCategories: async (
    userId: string,
    title: string,
    episodeId: number,
    workId: number,
    epNum: number,
    subtitle: string,
  ) => {
    const response = await apiClient.post<KeywordExtractionResponseDto>(
      `/api/v1/author/${userId}/${title}/manuscript/categories`,
      { episodeId, workId, epNum, subtitle },
    );
    return response.data;
  },

  analyzeManuscript: async (
    userId: string,
    title: string,
    workId: number,
    data: PublishAnalysisRequestDto,
  ) => {
    const response = await apiClient.post<PublishAnalysisResponseDto>(
      `/api/v1/author/${userId}/${title}/manuscript/setting`,
      data,
      { params: { workId } },
    );
    return response.data;
  },

  // Lorebooks (Settings)
  getLorebooks: async (userId: string, title: string, workId: number) => {
    const response = await apiClient.get<any>(
      `/api/v1/author/${userId}/${title}/lorebook`,
      { params: { workId } },
    );
    return response.data.content || response.data;
  },

  getLorebooksByCategory: async (
    userId: string,
    title: string,
    category: string,
    workId: number,
  ) => {
    const response = await apiClient.get<LorebookDto[]>(
      `/api/v1/author/${userId}/${title}/lorebook/${category}`,
      { params: { workId } },
    );
    return response.data;
  },

  deleteLorebook: async (
    userId: string,
    title: string,
    category: string,
    lorebookId: number,
  ) => {
    await apiClient.delete(
      `/api/v1/author/${userId}/${title}/lorebook/${category}/${lorebookId}`,
    );
  },

  searchLorebookSimilarity: async (
    userId: string,
    title: string,
    data: LorebookSimilarityRequestDto,
  ) => {
    const response = await apiClient.post<any[]>(
      `/api/v1/ai/author/${userId}/${title}/lorebook/userq`,
      data,
    );
    return response.data;
  },

  saveLorebookManual: async (
    userId: string,
    title: string,
    workId: number,
    data: LorebookSaveRequestDto,
  ) => {
    const response = await apiClient.post<number>(
      `/api/v1/author/${userId}/${title}/lorebook`,
      data,
      { params: { workId } },
    );
    return response.data;
  },

  // Specific Create API (User Request)
  createLorebookSpecific: async (
    userId: string,
    title: string,
    workId: number,
    data: any, // Using any to be flexible with the request body as per user request
  ) => {
    const response = await apiClient.post(
      `/api/v1/ai/author/${userId}/${title}/lorebook/setting_save`,
      data,
      { params: { workId } },
    );
    return response.data;
  },

  // 설정집 특정 항목 수정 (PATCH)
  updateLorebookSpecific: async (
    userId: string,
    title: string,
    tag: string,
    itemId: string,
    workId: number,
    data: any,
  ) => {
    try {
      const response = await apiClient.patch(
        `/api/v1/ai/author/${userId}/${title}/lorebook/${tag}/${itemId}`,
        data,
        { params: { workId } },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update lorebook specific item:', error);
      throw error;
    }
  },

  updateLorebook: async (
    userId: string,
    title: string,
    category: string,
    lorebookId: number,
    data: LorebookUpdateRequestDto,
  ) => {
    const response = await apiClient.patch(
      `/api/v1/ai/author/${userId}/${title}/lorebook/${category}/${lorebookId}`,
      data,
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

  // IP Expansion (Manager's List for Author)
  // Replaced by getManagerIPExpansions and getManagerIPExpansionDetail above
  // Kept for backward compatibility if needed, but should be removed eventually

  getIPMatching: async () => {
    const response = await apiClient.get<IPMatchingDto[]>(
      '/api/v1/author/ip-expansion/matching',
    );
    return response.data;
  },

  // Author ID Code Generation (Author-Manager linkage)
  generateAuthorCode: async () => {
    const response = await apiClient.post('/api/v1/author/manager/code');
    const data = response.data;

    // Check if data is an object and has 'code' property
    if (data && typeof data === 'object' && 'code' in data) {
      return String(data.code);
    }

    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  },

  // Get My Manager Info
  getMyManager: async () => {
    const response = await apiClient.get<AuthorManagerResponseDto>(
      '/api/v1/author/manager',
    );
    return response.data;
  },
  // Unlink from Manager 연결 끊기
  unlinkManager: async () => {
    const response = await apiClient.delete('/api/v1/author/manager');
    return response.data;
  },

  // My Page
  getMyPage: async () => {
    const response = await apiClient.get<AuthMeResponse>(`/api/v1/auth/me`);
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.post(`/api/v1/auth/password/reset`, data);
    return response.data;
  },
};
