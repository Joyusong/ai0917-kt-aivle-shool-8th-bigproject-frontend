import { Megaphone, Loader2, FileText, Search as SearchIcon, X as CloseIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';
import { useState, useMemo } from 'react';

interface AuthorNoticeProps {
  integrationId: string;
}

export function AuthorNotice({ integrationId }: AuthorNoticeProps) {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const { data: noticesPage, isLoading } = useQuery({
    queryKey: ['author', 'dashboard', 'notices', 'full', page, size],
    queryFn: () => authorService.getDashboardNotices(page, size),
  });

  const notices = noticesPage?.content || [];
  const totalPages = noticesPage?.totalPages || 0;

  const filtered = useMemo(() => {
    if (!keyword) return notices;
    const lower = keyword.toLowerCase();
    return notices.filter(
      (n: any) =>
        (n.title ?? '').toLowerCase().includes(lower) ||
        (n.content ?? '').toLowerCase().includes(lower),
    );
  }, [keyword, notices]);

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-foreground">공지사항</CardTitle>
        </div>
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="공지 검색..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setKeyword(searchInput);
                setPage(0);
              }
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length > 0 ? (
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
                {filtered.map((notice) => (
                  <tr
                    key={notice.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelected(notice)}
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
            <div className="p-8 text-center text-muted-foreground">
              등록된 공지사항이 없습니다.
            </div>
          )}

          {(!keyword ? totalPages > 1 : filtered.length > size) && (
            <div className="flex items-center justify-center gap-1.5 py-4 border-t bg-slate-50/30">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                {'<'}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
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
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                {'>'}
              </Button>
            </div>
          )}

          {selected && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>공지 상세</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                    <CloseIcon className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-lg font-bold">{selected.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      작성자: {selected.writer || '운영자'} | 날짜: {formatDate(selected.createdAt)}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-md p-4 text-sm whitespace-pre-wrap min-h-[120px]">
                    {selected.content || '내용이 없습니다.'}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
