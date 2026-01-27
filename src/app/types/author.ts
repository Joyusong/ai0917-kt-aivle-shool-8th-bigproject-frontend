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

// Contest Template
export interface ContestTemplateDto {
  id: number;
  title: string;
  organizer: string;
  category: string;
  prize: string;
  deadline: string;
  description: string;
  isAiSupported: boolean;
}

export interface ContestTemplateCreateRequestDto {
  title: string;
  organizer: string;
  category: string;
  prize: string;
  deadline: string;
  description: string;
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
