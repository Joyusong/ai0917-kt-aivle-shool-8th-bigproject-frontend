import { Megaphone, Plus, Award } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { adminService } from '../../../services/adminService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';

interface ManagerHomeProps {
  onNavigate?: (menu: string) => void;
}

export function ManagerHome({ onNavigate }: ManagerHomeProps) {
  interface DashboardNotice {
    id: number;
    title: string;
    createdAt: string;
    isNew?: boolean;
    content?: string;
    writer?: string;
  }

  const [notices, setNotices] = useState<DashboardNotice[]>([]);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<DashboardNotice | null>(
    null,
  );

  const authAxios = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL || '',
    });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return instance;
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      await authAxios.get(`/api/v1/manager/dashboard`);
    } catch {
      setNotices((prev) => prev);
    }
  }, [authAxios]);

  const fetchDashboardNotices = useCallback(async () => {
    try {
      const data = await adminService.getNotices(0, 5);
      const list = data?.content || [];
      setNotices(
        list.map((n: any) => ({
          id: n.id,
          title: n.title,
          createdAt: n.createdAt,
          content: n.content,
          writer: n.writer,
          isNew: false,
        })),
      );
    } catch {
      setNotices([]);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchDashboard();
      fetchDashboardNotices();
    }, 0);
  }, [fetchDashboard, fetchDashboardNotices]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Notice Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-border">
          <CardHeader className="border-b border-border p-4 p-[16px]">
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-foreground truncate">
                  공지사항
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 flex-shrink-0"
                onClick={() => onNavigate?.('notice')}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedNotice(n);
                    setNoticeModalOpen(true);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-foreground">{n.title}</span>
                      {n.isNew && (
                        <Badge className="bg-orange-500 text-white text-xs">
                          N
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(n.createdAt), 'yyyy. M. d. a h:mm', {
                      locale: ko,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Dialog open={noticeModalOpen} onOpenChange={setNoticeModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedNotice?.title || '공지사항'}</DialogTitle>
              <DialogDescription className="flex items-center justify-between">
                <span>{selectedNotice?.writer || ''}</span>
                <span className="text-sm text-muted-foreground">
                  {selectedNotice?.createdAt
                    ? format(
                        new Date(selectedNotice.createdAt),
                        'yyyy. M. d. a h:mm',
                        { locale: ko },
                      )
                    : ''}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-sm text-foreground">
              {selectedNotice?.content || '내용이 없습니다.'}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
