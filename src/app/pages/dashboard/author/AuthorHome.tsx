import {
  BookOpen,
  Database,
  CheckCircle,
  Megaphone,
  Loader2,
  Calendar,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';

interface AuthorHomeProps {
  integrationId: string;
}

export function AuthorHome({ integrationId }: AuthorHomeProps) {
  // Fetch Dashboard Summary
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['author', 'dashboard', 'summary', integrationId],
    queryFn: () => authorService.getDashboardSummary(integrationId),
    enabled: !!integrationId,
  });

  // Fetch Dashboard Notices
  const { data: noticesPage, isLoading: isNoticesLoading } = useQuery({
    queryKey: ['author', 'dashboard', 'notices'],
    queryFn: () => authorService.getDashboardNotices(0, 5),
  });

  const notices = noticesPage?.content || [];

  return (
    <div className="space-y-6">
      {/* 작품 현황 Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  {isSummaryLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    summary?.ongoingCount || 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  진행 중인 작품
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  {isSummaryLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    summary?.settingBookCount || 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  생성된 설정집
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  {isSummaryLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    summary?.completedCount || 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">완결 작품</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 공지사항 Section */}
      <Card className="border-border">
        <CardHeader className="border-b border-border flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-foreground">공지사항</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {isNoticesLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : notices.length > 0 ? (
              notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`${
                          notice.category === 'URGENT'
                            ? 'border-red-500 text-red-500'
                            : 'border-blue-500 text-blue-500'
                        }`}
                      >
                        {notice.category === 'URGENT' ? '긴급' : '일반'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">
                        {notice.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{notice.writer}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(notice.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
