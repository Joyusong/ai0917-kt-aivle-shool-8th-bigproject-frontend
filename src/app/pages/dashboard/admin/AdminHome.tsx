import {
  Server,
  Users,
  Database,
  Activity,
  TrendingUp,
  Zap,
  Settings,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import { format } from 'date-fns';
import { useState } from 'react';

export function AdminHome() {
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [modalLogPage, setModalLogPage] = useState(1);
  const LOGS_PER_PAGE = 5;
  const MODAL_LOGS_PER_PAGE = 6;

  // 1. Dashboard Summary (Top 4 Cards)
  const { data: summary } = useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: adminService.getDashboardSummary,
  });

  // 2. DAU Data
  const { data: dauData } = useQuery({
    queryKey: ['admin', 'dashboard', 'dau'],
    queryFn: adminService.getDashboardDau,
  });

  // 3. System Resources
  const { data: resources } = useQuery({
    queryKey: ['admin', 'dashboard', 'resources'],
    queryFn: adminService.getDashboardResources,
  });

  // 4. System Logs
  const { data: logsData, isError: isLogsError } = useQuery({
    queryKey: ['admin', 'dashboard', 'logs'],
    queryFn: () => adminService.getDashboardLogs(50),
  });

  const visibleLogs = logsData?.logs.slice(
    (logPage - 1) * LOGS_PER_PAGE,
    logPage * LOGS_PER_PAGE,
  );

  // 5. Deployment Info
  const { data: deployment } = useQuery({
    queryKey: ['admin', 'dashboard', 'deployment'],
    queryFn: adminService.getDashboardDeployment,
  });

  // 6. All Logs (for Modal)
  const { data: allLogsData } = useQuery({
    queryKey: ['admin', 'dashboard', 'logs', 'all'],
    queryFn: () => adminService.getDashboardLogs(100),
    enabled: isLogsModalOpen, // Only fetch when modal is open
  });

  const visibleModalLogs = allLogsData?.logs.slice(
    (modalLogPage - 1) * MODAL_LOGS_PER_PAGE,
    modalLogPage * MODAL_LOGS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      {/* 시스템 상태 Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  {summary?.serverStatus.status || 'Checking...'}
                </div>
                <div className="text-sm text-muted-foreground">서버 상태</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  {summary?.totalUsers?.toLocaleString() || '-'}
                </div>
                <div className="text-sm text-muted-foreground">총 사용자</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  {summary?.savedArtworks?.toLocaleString() || '-'}
                </div>
                <div className="text-sm text-muted-foreground">저장된 작품</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  {summary?.activeSessions?.toLocaleString() || '-'}
                </div>
                <div className="text-sm text-muted-foreground">활성 세션</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 서비스 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>일일 활성 사용자</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">오늘</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white">
                    {dauData?.today && dauData?.yesterday
                      ? `${(((dauData.today - dauData.yesterday) / dauData.yesterday) * 100).toFixed(1)}%`
                      : '0%'}
                  </Badge>
                  <span className="text-lg font-semibold text-foreground">
                    {dauData?.today?.toLocaleString() || '-'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">어제</span>
                <span className="text-lg text-muted-foreground">
                  {dauData?.yesterday?.toLocaleString() || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">7일 평균</span>
                <span className="text-lg text-muted-foreground">
                  {dauData?.sevenDayAverage?.toFixed(0) || '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span>시스템 리소스</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    CPU 사용률
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {resources?.cpuUsage || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${resources?.cpuUsage || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    메모리 사용률
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {resources?.memoryUsage || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${resources?.memoryUsage || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    스토리지 사용률
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {resources?.storageUsage || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${resources?.storageUsage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 시스템 로그 */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-foreground">
              최근 시스템 로그
            </h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLogsError ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              아직 개발되지 않았습니다
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {visibleLogs?.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        log.level === 'ERROR'
                          ? 'bg-red-500'
                          : log.level === 'WARNING'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">
                        {log.message}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), 'yyyy.MM.dd HH:mm:ss')}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${
                        log.level === 'ERROR'
                          ? 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400'
                          : log.level === 'WARNING'
                            ? 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400'
                            : 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400'
                      }`}
                    >
                      {log.category}
                    </Badge>
                  </div>
                ))}
                {(!visibleLogs || visibleLogs.length === 0) && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    로그가 없습니다.
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-border flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                  disabled={logPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {logPage}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogPage((p) => p + 1)}
                  disabled={
                    !logsData?.logs ||
                    logPage * LOGS_PER_PAGE >= logsData.logs.length
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* System Logs Modal */}
      <Dialog open={isLogsModalOpen} onOpenChange={setIsLogsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>시스템 로그 전체보기</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <div className="divide-y divide-border border rounded-md">
                {visibleModalLogs?.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        log.level === 'ERROR'
                          ? 'bg-red-500'
                          : log.level === 'WARNING'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">
                        {log.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.timestamp), 'yyyy.MM.dd HH:mm:ss')}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${
                        log.level === 'ERROR'
                          ? 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400'
                          : log.level === 'WARNING'
                            ? 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400'
                            : 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400'
                      }`}
                    >
                      {log.category}
                    </Badge>
                  </div>
                ))}
                {(!visibleModalLogs || visibleModalLogs.length === 0) && (
                  <div className="p-8 text-center text-muted-foreground">
                    로그가 없습니다.
                  </div>
                )}
              </div>

              {/* Modal Pagination */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalLogPage((p) => Math.max(1, p - 1))}
                  disabled={modalLogPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  이전
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {modalLogPage}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalLogPage((p) => p + 1)}
                  disabled={
                    !allLogsData?.logs ||
                    modalLogPage * MODAL_LOGS_PER_PAGE >=
                      allLogsData.logs.length
                  }
                >
                  다음
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 배포 현황 */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span>배포 현황</span>
            </CardTitle>
            <Badge className="bg-green-500 text-white">운영 중</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                현재 버전
              </div>
              <div className="text-lg font-semibold text-foreground">
                {deployment?.version || '-'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {deployment?.lastDeployment
                  ? format(
                      new Date(deployment.lastDeployment),
                      'yyyy.MM.dd 배포',
                    )
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">환경</div>
              <div className="text-lg font-semibold text-foreground">
                {deployment?.environment || '-'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                AWS Seoul (ap-northeast-2)
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                가동 시간
              </div>
              <div className="text-lg font-semibold text-foreground">
                {deployment?.uptime || '-'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                지난 30일 평균
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
