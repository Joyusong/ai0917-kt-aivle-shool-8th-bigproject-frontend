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
  description: string;
  status: WorkStatus;
  statusDescription: string;
  createdAt: string;
}

export interface WorkCreateRequestDto {
  title: string;
  userIntegrationId: string;
  writer: string;
  description: string;
  status: WorkStatus;
}

export interface WorkUpdateRequestDto {
  id: number;
  title: string;
  description: string;
  status: WorkStatus;
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

// Episode DTOs
export interface EpisodeDto {
  id: number;
  workId: number;
  title: string;
  order: number;
  status: WorkStatus;
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
