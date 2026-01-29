import { UserRole } from './common';

export interface ExtractSettingRequest {
  txt: string;
  episode?: number;
  subtitle: string;
  check: Record<string, never>; // empty object
  title: string;
  writer: string;
}

export interface ExtractSettingResponse {
  [key: string]: any;
}

// Dashboard
export interface AuthorDashboardSummaryDto {
  ongoingCount: number;
  settingBookCount: number;
  completedCount: number;
}

// Work Status Enum
export type WorkStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'DROPPED';

// Work DTOs
export interface WorkResponseDto {
  id: number;
  title: string;
  writer: string;
  synopsis?: string;
  genre?: string;
  coverImageUrl?: string;
  description: string;
  status: WorkStatus;
  statusDescription: string;
  createdAt: string;
  universeId?: number;
}

export interface WorkCreateRequestDto {
  title: string;
  integrationId: string; // Changed from userIntegrationId to match service
  writer?: string;
  description: string;
  status?: WorkStatus;
  synopsis?: string;
  genre?: string;
  coverImageUrl?: string;
}

export interface WorkUpdateRequestDto {
  id: number;
  title: string;
  description: string;
  status: WorkStatus;
  synopsis?: string;
  genre?: string;
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
  title: string;
  description: string;
  updatedAt: string;
  count?: number;
}

export interface LorebookCharacterDto {
  id: number;
  name: string;
  role: string;
  description: string;
  age?: string;
  traits?: string[];
}

export interface LorebookWorldviewDto {
  id: number;
  title: string;
  category: string;
  description: string;
  tags?: string[];
}

export interface LorebookPlotDto {
  id: number;
  title: string;
  order: number;
  description: string;
  importance?: 'Main' | 'Sub';
}

export interface LorebookPlaceDto {
  id: number;
  name: string;
  description: string;
  location?: string;
}

export interface LorebookItemDto {
  id: number;
  name: string;
  description: string;
  type?: string;
}

export interface LorebookGroupDto {
  id: number;
  name: string;
  description: string;
  members?: string[];
}

// Episode DTOs
export interface EpisodeDto {
  id: number;
  workId: number;
  episodeNumber?: number;
  title: string;
  subtitle?: string;
  order: number;
  status: WorkStatus;
  wordCount?: number;
  isReadOnly?: boolean;
  isAnalyzed?: boolean;
  isReviewPending?: boolean;
  content: string; // Added content for convenience if needed
  updatedAt: string;
}

export interface EpisodeDetailDto extends EpisodeDto {
  content: string;
}

// Publish Process
export interface KeywordExtractionRequestDto {
  content: string;
  episodeId?: number;
}

export interface KeywordExtractionResponseDto {
  keywords: {
    characters: string[];
    locations: string[];
    events: string[];
    groups: string[];
    items: string[];
    worlds: string[];
  };
}

export interface PublishAnalysisRequestDto {
  selectedKeywords: {
    characters: string[];
    locations: string[];
    events: string[];
    groups: string[];
    items: string[];
    worlds: string[];
  };
}

// New API Structure for Analysis Response
export type AnalysisCategoryMap = {
  [key: string]: string[][]; // [name, description][]
};

export interface PublishAnalysisResponseDto {
  충돌: AnalysisCategoryMap;
  '설정 결합': AnalysisCategoryMap;
  '신규 업로드': AnalysisCategoryMap;
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
  sender: string;
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  statusDescription: string;
  content: string;
  receivedAt: string;
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
