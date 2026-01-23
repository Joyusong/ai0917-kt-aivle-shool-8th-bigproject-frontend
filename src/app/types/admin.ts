import { UserRole } from './common';

export interface UserListResponseDto {
  id: number;
  name: string;
  email: string;
  siteEmail?: string;
  role: UserRole;
  createdAt: string;
}

export interface UserCreateRequestDto {
  name: string;
  email: string;
  siteEmail?: string;
  sitePwd?: string;
  role: UserRole;
  mobile?: string;
}

export interface UserUpdateRequestDto {
  role: UserRole;
}

export interface AccessSummaryResponseDto {
  adminCount: number;
  managerCount: number;
  authorCount: number;
}

export interface UserDetailResponseDto {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  birthYear: string;
  gender: string;
}

export interface SystemNotice {
  id: number;
  source: 'SYSTEM_METRIC' | 'SYSTEM_LOG' | 'DEPLOYMENT' | 'ADMIN_CUSTOM';
  message: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  createdAt: string;
  isRead: boolean;
}

export interface SystemNoticeResponseDto {
  notices: SystemNotice[];
  totalCount: number;
  unreadCount: number;
}

// Dashboard DTOs
export interface ServerStatusDto {
  status: string;
  message: string;
}

export interface DashboardSummaryResponseDto {
  serverStatus: ServerStatusDto;
  totalUsers: number;
  savedArtworks: number;
  activeSessions: number;
}

export interface DailyDauDto {
  date: string;
  count: number;
}

export interface DauResponseDto {
  today: number;
  yesterday: number;
  sevenDayAverage: number;
  dailyData: DailyDauDto[];
}

export interface ResourceUsageResponseDto {
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  timestamp: string;
}

export interface SystemLogDto {
  id: number;
  level: string;
  message: string;
  category: string;
  timestamp: string;
}

export interface SystemLogsResponseDto {
  logs: SystemLogDto[];
  totalCount: number;
}

export interface DeploymentInfoResponseDto {
  version: string;
  environment: string;
  uptime: string;
  lastDeployment: string;
}
