import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axios';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
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

interface AuthorSummary {
  totalAuthors: number;
  newAuthors: number;
  activeAuthors: number;
}

interface Author {
  id: number;
  name: string;
  email: string;
  workCount: number;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface AuthorDetail extends Author {
  recentWorks: { id: number; title: string; createdAt: string }[];
  lastLogin: string;
}

export function ManagerAuthorManagement() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);

  // Fetch Summary
  const { data: summary } = useQuery<AuthorSummary>({
    queryKey: ['manager', 'authors', 'summary'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/manager/authors/summary');
      return res.data;
    },
  });

  // Fetch Authors List
  const { data: authorPage } = useQuery({
    queryKey: ['manager', 'authors', 'list', page, keyword],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/manager/authors/list', {
        params: { page, size: 10, keyword, sort: 'createdAt,desc' },
      });
      return res.data;
    },
  });

  // Fetch Author Detail
  const { data: authorDetail } = useQuery<AuthorDetail>({
    queryKey: ['manager', 'authors', 'detail', selectedAuthorId],
    queryFn: async () => {
      if (!selectedAuthorId) return null;
      const res = await apiClient.get(
        `/api/v1/manager/authors/${selectedAuthorId}`,
      );
      return res.data;
    },
    enabled: !!selectedAuthorId,
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(0);
      // keyword state is already updated via onChange
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorPage?.content?.map((author: Author) => (
                <TableRow key={author.id}>
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAuthorId(author.id)}
                    >
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!authorPage?.content || authorPage.content.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
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
                  {authorDetail.recentWorks?.map((work) => (
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
    </div>
  );
}
