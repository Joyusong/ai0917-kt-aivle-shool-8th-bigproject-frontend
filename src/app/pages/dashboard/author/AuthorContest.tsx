import { Trophy, Search as SearchIcon, BadgeCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import apiClient from '../../../api/axios';
import { useQuery } from '@tanstack/react-query';

interface AuthorContestProps {
  integrationId?: string;
}

interface Contest {
  id: number | string;
  title: string;
  organizer: string;
  deadline: string;
  category?: string;
}

export function AuthorContest({}: AuthorContestProps) {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: contestPage, isLoading } = useQuery({
    queryKey: ['author', 'contest', page, size],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/author/dashboard/contest', {
        params: { page, size },
      });
      return res.data;
    },
  });

  const contests: Contest[] = Array.isArray(contestPage)
    ? contestPage
    : contestPage?.content || [];
  const totalPages: number = contestPage?.totalPages ?? 0;

  const filtered = useMemo(() => {
    if (!keyword) return contests;
    const lower = keyword.toLowerCase();
    return contests.filter(
      (c) =>
        (c.title ?? '').toLowerCase().includes(lower) ||
        (c.organizer ?? '').toLowerCase().includes(lower) ||
        (c.category ?? '').toLowerCase().includes(lower),
    );
  }, [keyword, contests]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-foreground">공모전</CardTitle>
        </div>
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="공모전 검색..."
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
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            로딩 중...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            진행 중인 공모전이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium line-clamp-1">
                      {c.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      주관: {c.organizer}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.category && (
                      <Badge variant="outline" className="text-xs">
                        {c.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      마감: {formatDate(c.deadline)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
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
                className={`h-8 w-8 p-0 ${page === i ? 'bg-amber-600 text-white' : 'text-slate-600'}`}
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
      </CardContent>
    </Card>
  );
}
