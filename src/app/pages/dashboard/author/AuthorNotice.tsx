import { Megaphone, Loader2, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';

interface AuthorNoticeProps {
  integrationId: string;
}

export function AuthorNotice({ integrationId }: AuthorNoticeProps) {
  const { data: noticesPage, isLoading } = useQuery({
    queryKey: ['author', 'dashboard', 'notices', 'full'],
    queryFn: () => authorService.getDashboardNotices(0, 20),
  });

  const notices = noticesPage?.content || [];

  return (
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
          {isLoading ? (
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
  );
}
