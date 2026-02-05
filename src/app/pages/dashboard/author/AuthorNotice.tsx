import { useState, useEffect, useCallback, useContext } from 'react';
import { authorService } from '../../../services/authorService';
import { AuthorBreadcrumbContext } from './AuthorBreadcrumbContext';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  X as CloseIcon,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { AuthorNoticeDto } from '../../../types/author';

interface AuthorNoticeProps {
  integrationId: string;
}

export function AuthorNotice({ integrationId }: AuthorNoticeProps) {
  const { setBreadcrumbs, onNavigate } = useContext(AuthorBreadcrumbContext);

  useEffect(() => {
    setBreadcrumbs([
      { label: '홈', onClick: () => onNavigate('home') },
      { label: '공지사항' },
    ]);
  }, [setBreadcrumbs, onNavigate]);

  const [notices, setNotices] = useState<AuthorNoticeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState<AuthorNoticeDto | null>(
    null,
  );

  // Search is purely visual for now as API doesn't support it
  const [searchInput, setSearchInput] = useState('');

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      // API currently doesn't support keyword search, so we just fetch page
      const data = await authorService.getDashboardNotices(page, 10);
      setNotices(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('데이터 로드 실패', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm gap-0">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4 border-b">
          <span>공지사항 목록</span>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="제목 검색"
                  className="pl-9 h-9 bg-background"
                  value={searchInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchInput(e.target.value)
                  }
                  disabled // Disabled since API doesn't support it yet
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-semibold text-xs">
                <tr>
                  <th className="px-4 py-3 w-40 text-center hidden md:table-cell">
                    작성일
                  </th>
                  <th className="px-4 py-3 text-left w-auto">제목</th>
                  <th className="px-4 py-3 w-28 text-center hidden sm:table-cell">
                    작성자
                  </th>
                  <th className="px-4 py-3 w-20 text-center hidden sm:table-cell">
                    첨부
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {notices.map((n) => (
                  <tr
                    key={n.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedNotice(n)}
                  >
                    <td className="px-4 py-4 text-center text-muted-foreground hidden md:table-cell">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                          {n.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground sm:hidden" />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {n.writer}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      {n.originalFilename && (
                        <FileText className="w-4 h-4 mx-auto text-blue-400" />
                      )}
                    </td>
                  </tr>
                ))}
                {notices.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      공지사항이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1.5 py-4 border-t bg-slate-50/30">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages || 1 }, (_, i) => (
              <Button
                key={i}
                variant={page === i ? 'default' : 'ghost'}
                className={`h-8 w-8 p-0 ${page === i ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page >= (totalPages || 1) - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedNotice(null)}
        >
          <Card
            className="w-full max-w-lg shadow-2xl border-none"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <CardHeader className="border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">공지사항 상세</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedNotice(null)}
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedNotice.title}
                  </h3>
                  <div className="flex gap-2 mt-2 text-xs text-slate-500">
                    <span>작성자: {selectedNotice.writer}</span>
                    <span>|</span>
                    <span>
                      날짜:{' '}
                      {new Date(selectedNotice.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-wrap min-h-[150px] text-sm leading-relaxed">
                  {selectedNotice.content}
                </div>
                {selectedNotice.originalFilename && (
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-white">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm flex-1 truncate">
                      {selectedNotice.originalFilename}
                    </span>
                    {/* Download button could be added here if API supports it */}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setSelectedNotice(null)}>닫기</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
