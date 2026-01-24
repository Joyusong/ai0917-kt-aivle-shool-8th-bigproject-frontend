import {
  BookOpen,
  Database,
  CheckCircle,
  Megaphone,
  Loader2,
  Trophy,
  X as CloseIcon,
} from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';

interface AuthorHomeProps {
  integrationId: string;
  onNavigate?: (menu: string) => void;
}

export function AuthorHome({ integrationId, onNavigate }: AuthorHomeProps) {
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
  const contests = [
    { id: 1, title: '판타지 웹소설 공모전', organizer: 'K-웹소설 협회', deadline: '2026-02-20' },
    { id: 2, title: '로맨스 단편 공모전', organizer: '로맨스연합', deadline: '2026-03-05' },
  ];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

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

      {/* 공지사항 + 공모전 (나란히) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 공지사항 Section */}
        <Card className="border-border">
          <CardHeader className="border-b border-border flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-foreground">공지사항</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:bg-blue-50 h-8 w-8"
              onClick={() => onNavigate?.('notice')}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isNoticesLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : notices.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">작성자</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">첨부</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">작성일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {notices.map((notice: any) => (
                      <tr
                        key={notice.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedNotice(notice);
                          setModalOpen(true);
                        }}
                      >
                        <td className="px-4 py-3 text-sm text-foreground">{notice.id}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{notice.title}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{notice.writer || '운영자'}</td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {notice.originalFilename && <FileText className="w-4 h-4 text-blue-600" />}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{formatDate(notice.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">등록된 공지사항이 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 공모전 Section */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-foreground">공모전</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {contests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  진행 중인 공모전이 없습니다.
                </div>
              ) : (
                contests.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground font-medium line-clamp-1">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        주관: {c.organizer}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      마감: {new Date(c.deadline).toLocaleDateString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {modalOpen && selectedNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>공지 상세</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedNotice(null);
                }}
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-lg font-bold">{selectedNotice.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  작성자: {selectedNotice.writer || '운영자'} | 날짜: {formatDate(selectedNotice.createdAt)}
                </div>
              </div>
              <div className="bg-muted/30 rounded-md p-4 text-sm whitespace-pre-wrap min-h-[120px]">
                {selectedNotice.content || '내용이 없습니다.'}
              </div>
              {selectedNotice.originalFilename && (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-white">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-sm flex-1 truncate">{selectedNotice.originalFilename}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
