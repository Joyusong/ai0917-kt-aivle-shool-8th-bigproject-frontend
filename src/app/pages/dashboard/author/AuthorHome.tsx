import {
  BookOpen,
  Database,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Megaphone,
  PenTool,
  TrendingUp,
  Plus,
  LayoutDashboard,
  Loader2,
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

  // Fetch Contest Templates
  const { data: contests } = useQuery({
    queryKey: ['author', 'contest-templates'],
    queryFn: authorService.getContestTemplates,
  });

  const notices = noticesPage?.content || [];
  const contestList = contests || [];

  // Carousel States
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [currentContestIndex, setCurrentContestIndex] = useState(0);

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

  const handleNextContest = () => {
    if (contestList.length === 0) return;
    setCurrentContestIndex((prev) => (prev + 1) % contestList.length);
  };

  const handlePrevContest = () => {
    if (contestList.length === 0) return;
    setCurrentContestIndex(
      (prev) => (prev - 1 + contestList.length) % contestList.length,
    );
  };

  const currentNotice = notices[currentNoticeIndex];
  const currentContest = contestList[currentContestIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <LayoutDashboard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">홈</h1>
            <p className="text-sm text-muted-foreground">
              작가님의 창작 활동 현황을 한눈에 확인하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 1. 상단 통계 카드 (기존 유지) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* 2. 배너 위젯 섹션 (공지사항 & 공모전) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 공지사항 위젯 */}
        <Card className="border-border relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="w-5 h-5 text-primary" />
              주요 공지사항
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] flex flex-col justify-center relative">
            {currentNotice ? (
              <div className="space-y-2 px-8 transition-all duration-300">
                <Badge
                  variant={
                    currentNotice.category === 'URGENT'
                      ? 'destructive'
                      : 'default'
                  }
                  className="mb-1"
                >
                  {currentNotice.category === 'URGENT' ? '긴급' : '공지'}
                </Badge>
                <h3 className="text-lg font-bold line-clamp-1">
                  {currentNotice.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {currentNotice.content || '공지사항 내용을 확인하세요.'}
                </p>
                <span className="text-xs text-muted-foreground block mt-2">
                  {new Date(currentNotice.createdAt).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}

            {/* Navigation Arrows */}
            {notices.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevNotice}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNextNotice}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* 공모전 위젯 */}
        <Card className="border-border relative overflow-hidden group bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
              진행 중인 공모전
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] flex flex-col justify-center relative">
            {currentContest ? (
              <div className="space-y-2 px-8 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-background/80">
                    {currentContest.dDay}
                  </Badge>
                  <Badge className="bg-amber-500 hover:bg-amber-600">
                    {currentContest.prize}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold line-clamp-1">
                  {currentContest.title}
                </h3>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>#{currentContest.category}</span>
                  <span>|</span>
                  <span>{currentContest.organizer || '주최사'}</span>
                </div>
                <Button
                  size="sm"
                  variant="link"
                  className="p-0 h-auto text-indigo-600 dark:text-indigo-400"
                  onClick={() => onNavigate('contest-templates')}
                >
                  자세히 보기 &rarr;
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                진행 중인 공모전이 없습니다.
              </div>
            )}

            {/* Navigation Arrows */}
            {contestList.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevContest}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNextContest}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. 추가 유용 위젯 (바로가기 & 통계 등) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 빠른 작업 실행 */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              빠른 작업
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 hover:bg-accent/50 hover:border-primary/50 transition-all"
                onClick={() => onNavigate('works')}
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <span>새 작품 만들기</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 hover:bg-accent/50 hover:border-primary/50 transition-all"
                onClick={() => onNavigate('contest-templates')}
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <span>공모전 도전하기</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 집필 통계 (Placeholder) */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              이번 주 집필 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px] flex items-end justify-between px-2 pb-2">
              {[40, 70, 30, 85, 50, 20, 60].map((height, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <div
                    className="w-8 bg-primary/20 rounded-t-sm transition-all group-hover:bg-primary/40 relative"
                    style={{ height: `${height}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {height * 100}자
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {['월', '화', '수', '목', '금', '토', '일'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
