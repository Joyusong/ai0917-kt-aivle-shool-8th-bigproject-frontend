import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  BookOpen,
  Database,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Loader2,
  Clock,
} from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthorBreadcrumbContext } from './AuthorBreadcrumbContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';
import { useNavigate } from 'react-router-dom';

interface AuthorHomeProps {
  integrationId: string;
}

export function AuthorHome({ integrationId }: AuthorHomeProps) {
  const { setBreadcrumbs, onNavigate } = useContext(AuthorBreadcrumbContext);
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([{ label: '홈' }]);
  }, [setBreadcrumbs]);

  // Fetch Dashboard Summary
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['author', 'dashboard', 'summary', integrationId],
    queryFn: () => authorService.getDashboardSummary(integrationId),
    enabled: !!integrationId,
  });

  // Fetch Dashboard Notices
  const { data: noticesPage } = useQuery({
    queryKey: ['author', 'dashboard', 'notices'],
    queryFn: () => authorService.getDashboardNotices(0, 5),
  });

  const notices = noticesPage?.content || [];

  // Carousel States
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  const handleNextNotice = () => {
    if (notices.length === 0) return;
    setCurrentNoticeIndex((prev) => (prev + 1) % notices.length);
  };

  const handlePrevNotice = () => {
    if (notices.length === 0) return;
    setCurrentNoticeIndex(
      (prev) => (prev - 1 + notices.length) % notices.length,
    );
  };

  const currentNotice = notices[currentNoticeIndex];

  // Notice Detail State
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [isNoticeDetailOpen, setIsNoticeDetailOpen] = useState(false);

  const handleNoticeClick = (notice: any) => {
    setSelectedNotice(notice);
    setIsNoticeDetailOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans p-4">
      {/* 1. 상단 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <div className="text-2xl font-bold text-foreground truncate">
                {isSummaryLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  summary?.ongoingCount || 0
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                연재 작품
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <div className="text-2xl font-bold text-foreground truncate">
                {isSummaryLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  summary?.settingBookCount || 0
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                전체 설정집
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <div className="text-2xl font-bold text-foreground truncate">
                {isSummaryLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  summary?.completedCount || 0
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                완결 작품
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. 배너 위젯 섹션 (공지사항) */}
      <div className="grid grid-cols-1 gap-6">
        {/* 공지사항 위젯 */}
        <Card className="border-border relative overflow-hidden group shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Megaphone className="w-4 h-4 text-primary" />
              주요 공지사항
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[120px] flex flex-col justify-center relative p-4 pt-0">
            {currentNotice ? (
              <div
                className="space-y-1.5 px-8 transition-all duration-300 hover:opacity-80 cursor-pointer"
                onClick={() => handleNoticeClick(currentNotice)}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      currentNotice.category === 'URGENT'
                        ? 'destructive'
                        : 'default'
                    }
                    className="text-[10px] h-5 px-1.5"
                  >
                    {currentNotice.category === 'URGENT' ? '긴급' : '공지'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(currentNotice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold line-clamp-1">
                  {currentNotice.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {currentNotice.content || '공지사항 내용을 확인하세요.'}
                </p>
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}

            {/* Navigation Arrows */}
            {notices.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/50 hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevNotice}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/50 hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNextNotice}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={isNoticeDetailOpen} onOpenChange={setIsNoticeDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>공지사항 상세</DialogTitle>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedNotice.category === 'URGENT'
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {selectedNotice.category === 'URGENT' ? '긴급' : '공지'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedNotice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{selectedNotice.title}</h3>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {selectedNotice.content}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsNoticeDetailOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
