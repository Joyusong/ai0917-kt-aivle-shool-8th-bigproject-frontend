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
