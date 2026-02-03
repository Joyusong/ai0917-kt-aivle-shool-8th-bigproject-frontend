import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Loader2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
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
import { adminService } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ManagerHomeProps {
  onNavigate?: (menu: string) => void;
}

export function ManagerHome({ onNavigate }: ManagerHomeProps) {
  const navigate = useNavigate();

  // Notice State
  const [isNoticeDetailOpen, setIsNoticeDetailOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);

  // Fetch Admin Dashboard Summary for System Overview
  const { data: systemSummary, isLoading: isSystemLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: adminService.getDashboardSummary,
  });

  // Fetch DAU for Traffic Overview
  const { data: dauData } = useQuery({
    queryKey: ['admin', 'dashboard', 'dau'],
    queryFn: adminService.getDashboardDau,
  });

  // Fetch Notices
  const { data: noticesData } = useQuery({
    queryKey: ['notices', 'latest'],
    queryFn: () => adminService.getNotices(0, 5),
  });

  const notices = noticesData?.content || [];

  // Handlers
  const handleNoticeClick = (notice: any) => {
    setSelectedNotice(notice);
    setIsNoticeDetailOpen(true);
  };

  // Calculate Growth Rate
  const growthRate =
    dauData?.today && dauData?.yesterday
      ? ((dauData.today - dauData.yesterday) / dauData.yesterday) * 100
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 배너 위젯 섹션 (공지사항) */}
      <div className="grid grid-cols-1 gap-6">
        {/* 공지사항 위젯 */}
        <Card className="border-border relative overflow-hidden">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                주요 공지사항
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
                onClick={() => navigate('/manager/notices')}
              >
                더보기 <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notices.length > 0 ? (
              <div className="divide-y divide-border">
                {notices.map((notice: any) => (
                  <div
                    key={notice.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleNoticeClick(notice)}
                  >
                    <Badge
                      variant={
                        notice.category === 'URGENT'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="shrink-0"
                    >
                      {notice.category === 'URGENT' ? '긴급' : '공지'}
                    </Badge>
                    <span className="flex-1 text-sm font-medium truncate">
                      {notice.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                등록된 공지사항이 없습니다.
              </div>
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
