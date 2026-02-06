import {
  FileText,
  Users,
  Activity,
  Bell,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useContext } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { managerService } from '../../../services/managerService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ManagerHomeProps {
  onNavigate?: (menu: string) => void;
}

export function ManagerHome({ onNavigate }: ManagerHomeProps) {
  const navigate = useNavigate();

  // Manager Dashboard Page
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['manager', 'dashboard', 'page'],
    queryFn: managerService.getDashboardPage,
  });
  const summary = pageData?.summary;
  const notices = pageData?.notices || [];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans p-1">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          담당 작가 및 작품 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Proposals */}
        <Card
          className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleNavigate('/manager/ip-expansion')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                승인 대기 제안
              </p>
              <div className="text-2xl font-bold text-foreground">
                {summary?.pendingProposals || 0}
              </div>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        {/* Managed Authors */}
        <Card
          className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleNavigate('/manager/authors')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                담당 작가
              </p>
              <div className="text-2xl font-bold text-foreground">
                {summary?.managedAuthors || 0}
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Active Authors */}
        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                활동 중인 작가
              </p>
              <div className="text-2xl font-bold text-foreground">
                {summary?.activeAuthors || 0}
              </div>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notices & Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notices */}
        <Card className="col-span-2 border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                최신 공지사항
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-primary"
              onClick={() => handleNavigate('/manager/notices')}
            >
              더보기 <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {notices.length > 0 ? (
              <div className="divide-y divide-border">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() =>
                      handleNavigate(`/manager/notices/${notice.id}`)
                    }
                  >
                    <div className="space-y-1 min-w-0 flex-1 mr-4">
                      <p className="text-sm font-medium leading-none group-hover:text-primary truncate transition-colors">
                        {notice.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{notice.writer}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(notice.createdAt), 'yyyy.MM.dd', {
                            locale: ko,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
