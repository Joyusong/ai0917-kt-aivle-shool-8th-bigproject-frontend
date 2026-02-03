import { UserRole } from './common';

// Dashboard
export interface AuthorDashboardSummaryDto {
  ongoingCount: number;
  settingBookCount: number;
  completedCount: number;
}

// Work Status Enum
export type WorkStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'DROPPED' | 'NEW' | 'DELETED';

// Work DTOs
export interface WorkResponseDto {
  id: number;
  universeId?: number;
  primaryAuthorId: string;
  title: string;
  synopsis?: string;
  genre?: string;
  status: WorkStatus;
  statusDescription?: string;
  coverImageUrl?: string;
  createdAt: string;
  // Legacy fields support if needed, otherwise remove
  writer?: string; 
  description?: string;
}

export interface WorkCreateRequestDto {
  title: string;
  synopsis?: string;
  genre?: string;
  coverImageUrl?: string;
  primaryAuthorId: string;
  universeId?: number;
}

export interface WorkUpdateRequestDto {
  title?: string;
  synopsis?: string;
  genre?: string;
  coverImageUrl?: string;
}

// Notice DTO (Author View)
export interface AuthorNoticeDto {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  writer: string;
  originalFilename?: string;
  category?: string;
}

// Lorebook DTO
export interface LorebookDto {
  id: number;
  userId: string;
  workId: number;
  category: string;
  keyword: string;
  setting: any; // JsonNode can be object or string depending on parsing
  epNum?: number[];
}

// Publish Process
export interface KeywordExtractionRequestDto {
  content: string;
  episodeId?: number;
}

export interface KeywordExtractionResponseDto {
  check: {
    인물: string[];
    세계: string[];
    장소: string[];
    사건: string[];
    물건: string[];
    집단: string[];
  };
}

export interface PublishAnalysisRequestDto {
  check: {
    인물: string[];
    세계: string[];
    장소: string[];
    사건: string[];
    물건: string[];
    집단: string[];
  };
}

export interface PublishAnalysisResponseDto {
  충돌: Record<string, string>[];
  '설정 결합': any[];
  '신규 업로드': any[];
}

export interface LorebookSimilarityRequestDto {
  category: string;
  user_query: string;
  user_id: string;
  work_id: number;
  sim: number;
  limit: number;
}

export interface LorebookSaveRequestDto {
  category: string;
  keyword: string;
  subtitle: string;
  setting: string;
  episode?: number[];
}

export interface LorebookUpdateRequestDto {
  keyword: string;
  setting: string;
}

export interface AuthorManagerResponseDto {
  managerId: string;
  managerName: string;
  managerEmail: string;
  managerIntegrationId: string;
  linkedAt: string;
}

export interface ManuscriptDto {
  id: number;
  userId: string;
  workId: number;
  title: string;
  episode: number;
  subtitle: string;
  txt?: string;
}

export interface ManuscriptDetailDto extends ManuscriptDto {
  txt: string;
}

export interface ManuscriptUploadRequestDto {
  workId: number;
  episode: number;
  subtitle: string;
  txt: string;
}

export interface LorebookSimilarityResponseDto {
  id: number;
  title: string;
  description: string;
  category: string;
  similarity: number;
}

// Legacy types (kept for compatibility if needed, but likely replaced)
export interface SettingBookDiffDto {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'NEW' | 'MODIFIED' | 'DELETED' | 'UNCHANGED' | 'UPDATED';
  // Specific fields
  title?: string;
  role?: string;
  age?: string;
  traits?: string[];
  location?: string;
  type?: string;
  members?: string[];
  tags?: string[];
  importance?: 'Main' | 'Sub';
  order?: number;
}

// IP Expansion
export interface IPProposalDto {
  id: number;
  title: string;
  sender?: string;
  authorName?: string;
  status:
    | 'PENDING'
    | 'REVIEWING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'APPROVED'
    | 'PROPOSED';
  statusDescription: string;
  content?: string;
  receivedAt?: string;
  createdAt?: string;
}

export interface IPMatchingDto {
  id: number;
  managerName: string;
  department: string;
  role: string;
  tags: string[];
  matchedAt: string;
}

// My Page
export interface AuthorMyPageDto {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  worksCount: number;
  ipExpansionCount: number;
}

export interface AuthorManagerResponseDto {
  ok: boolean;
  managerIntegrationId: string;
  managerName: string;
  managerSiteEmail: string;
}
