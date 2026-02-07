import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { managerService } from '../../../services/managerService';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import {
  Search,
  User,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AuthorSummaryDto,
  ManagerAuthorDto,
  ManagerAuthorDetailDto,
} from '../../../types/manager';

export function ManagerAuthorManagement() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<'name,asc' | 'workCount,desc'>('name,asc');
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [manualAuthorId, setManualAuthorId] = useState('');
  const [linking, setLinking] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Summary
  const { data: summary } = useQuery<AuthorSummaryDto>({
    queryKey: ['manager', 'authors', 'summary'],
    queryFn: () => managerService.getAuthorsSummary(),
  });

  // Fetch Authors List
  const { data: authorPage } = useQuery({
    queryKey: ['manager', 'authors', 'list', page, keyword, sort],
    queryFn: () =>
      managerService.getAuthors({
        page,
        size: 10,
        keyword,
        sort,
      }),
  });

  // Fetch Author Detail
  const { data: authorDetail } = useQuery<ManagerAuthorDetailDto | null>({
    queryKey: ['manager', 'authors', 'detail', selectedAuthorId],
    queryFn: () =>
      selectedAuthorId
        ? managerService.getAuthorDetail(selectedAuthorId)
        : null,
    enabled: !!selectedAuthorId,
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(0);
      // keyword state is already updated via onChange
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {summary?.totalAuthors || 0}
              </div>
              <div className="text-sm text-muted-foreground">전체 작가</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {summary?.newAuthors || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                신규 가입 (이번달)
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {summary?.activeAuthors || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                활동 중인 작가
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Author List */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>작가 목록</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="작가 이름 검색..."
                  className="pl-9"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
              <Select
                value={sort}
                onValueChange={(v) =>
                  setSort(v as 'name,asc' | 'workCount,desc')
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name,asc">이름순</SelectItem>
                  <SelectItem value="workCount,desc">작품수순</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowIdModal(true)}>
                작가 ID 입력
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>작품 수</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorPage?.content?.map((author: ManagerAuthorDto) => (
                <TableRow
                  key={author.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedAuthorId(author.id)}
                >
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell>{author.email}</TableCell>
                  <TableCell>{author.workCount}</TableCell>
                  <TableCell>
                    {format(new Date(author.createdAt), 'yyyy.MM.dd')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        author.status === 'ACTIVE' ? 'default' : 'secondary'
                      }
                    >
                      {author.status === 'ACTIVE' ? '활동중' : '휴면'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!authorPage?.content || authorPage.content.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-center p-4 gap-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page + 1} / {authorPage?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) =>
                  Math.min((authorPage?.totalPages || 1) - 1, p + 1),
                )
              }
              disabled={page >= (authorPage?.totalPages || 1) - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedAuthorId}
        onOpenChange={(open) => !open && setSelectedAuthorId(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>작가 상세 정보</DialogTitle>
          </DialogHeader>
          {authorDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">이름</div>
                  <div className="font-medium">{authorDetail.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">이메일</div>
                  <div className="font-medium">{authorDetail.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">가입일</div>
                  <div className="font-medium">
                    {format(new Date(authorDetail.createdAt), 'yyyy.MM.dd')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">최근 접속</div>
                  <div className="font-medium">
                    {authorDetail.lastLogin
                      ? format(
                          new Date(authorDetail.lastLogin),
                          'yyyy.MM.dd HH:mm',
                        )
                      : '-'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> 최근 작품
                </h4>
                <div className="border rounded-lg divide-y">
                  {authorDetail.recentWorks?.map((work: any) => (
                    <div
                      key={work.id}
                      className="p-3 flex justify-between items-center"
                    >
                      <span>{work.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(work.createdAt), 'yyyy.MM.dd')}
                      </span>
                    </div>
                  ))}
                  {(!authorDetail.recentWorks ||
                    authorDetail.recentWorks.length === 0) && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      작품이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              Loading...
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Manual Author ID Modal */}
      <Dialog open={showIdModal} onOpenChange={setShowIdModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>작가 ID 입력</DialogTitle>
            <DialogDescription>
              운영자와 작가의 매칭 기능 • 작가에게서 전달받은 키를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="예: AUTH-ABCDE"
              value={manualAuthorId}
              onChange={(e) => setManualAuthorId(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={linking || !manualAuthorId.trim()}
              onClick={async () => {
                try {
                  setLinking(true);
                  const data = await managerService.matchAuthor(
                    encodeURIComponent(manualAuthorId.trim()),
                  );
                  if (data?.authorId) {
                    setSelectedAuthorId(Number(data.authorId));
                  }
                  await queryClient.invalidateQueries({
                    queryKey: ['manager', 'authors'],
                  });
                  toast.success('작가와 운영자 연동이 완료되었습니다.');
                  setShowIdModal(false);
                  setManualAuthorId('');
                } catch (e) {
                  toast.error('연동에 실패했습니다. 키를 확인해주세요.');
                } finally {
                  setLinking(false);
                }
              }}
            >
              연동
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
