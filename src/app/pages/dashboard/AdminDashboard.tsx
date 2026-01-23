import {
  Brain,
  LayoutDashboard,
  Bell,
  ChevronDown,
  LogOut,
  Megaphone,
  ChevronRight,
  Menu,
  Shield,
  ChevronsLeft,
  Check,
  CheckCheck,
  KeyRound,
  User,
} from 'lucide-react';
import { maskName } from '../../utils/format';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { AdminHome } from './admin/AdminHome';
import { AdminNotices } from './admin/AdminNotices';
import { AdminPermissions } from './admin/AdminPermissions';
import { AdminMyPage } from './admin/AdminMyPage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { authService } from '../../services/authService';
import { format } from 'date-fns';

interface AdminDashboardProps {
  onLogout: () => void;
  onHome?: () => void;
}

export function AdminDashboard({ onLogout, onHome }: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('home');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Outside click handler for notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowActivityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch User Profile
  const { data: userData } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
  });

  const userName =
    userData && 'name' in userData
      ? (userData.name as string)
      : '시스템 관리자';

  // Fetch System Notices
  const { data: noticeData } = useQuery({
    queryKey: ['admin', 'notices'],
    queryFn: () => adminService.getSystemNotices(true),
    refetchInterval: 30000, // 30s polling
  });

  const notices = noticeData?.notices || [];
  const unreadNotices = notices.filter((n) => !n.isRead);
  const unreadCount = unreadNotices.length;

  // Show only unread notices in the dropdown
  const displayedNotices = unreadNotices;

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed', error);
      onLogout();
    }
  };

  // Mark as Read Mutation
  const readMutation = useMutation({
    mutationFn: ({ source, id }: { source: string; id: number }) =>
      adminService.markSystemNoticeAsRead(source, id),
    onMutate: async ({ source, id }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'notices'] });
      const previousNotices = queryClient.getQueryData(['admin', 'notices']);

      queryClient.setQueryData(['admin', 'notices'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notices: old.notices.map((notice: any) =>
            notice.source === source && notice.id === id
              ? { ...notice, isRead: true }
              : notice,
          ),
        };
      });

      return { previousNotices };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['admin', 'notices'], context?.previousNotices);
    },
    onSuccess: () => {
      // 즉시 재조회(invalidateQueries)를 하면 백엔드 DB 반영 시차로 인해
      // 읽음 처리된 알림이 다시 '안 읽음' 상태로 조회되어 깜빡이는 현상이 발생함.
      // 따라서 Optimistic Update(onMutate)를 믿고, 다음 정기 폴링(30초) 때까지 재조회를 보류함.
      // queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] });
    },
  });

  const handleRead = (source: string, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    readMutation.mutate({ source, id });
  };

  const handleMarkAllRead = async () => {
    if (unreadNotices.length === 0) return;
    try {
      await adminService.markAllSystemNoticesAsRead();
      queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] });
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      alert('비밀번호가 변경되었습니다.');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    },
  });

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 4) {
      alert('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    passwordMutation.mutate({
      currentPassword,
      newPassword,
      newPasswordConfirm: confirmPassword,
    });
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    // Close sidebar on mobile when menu is clicked
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background" data-role="admin">
      {/* Sidebar Open Button (when closed) */}
      {!sidebarOpen && (
        <Button
          onClick={() => setSidebarOpen(true)}
          size="icon"
          className="fixed top-4 left-4 z-50 bg-card shadow-lg border border-border text-muted-foreground hover:bg-accent"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-full md:w-64' : 'w-0'} bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden fixed md:relative h-full z-40`}
      >
        {/* Close Button */}
        {sidebarOpen && (
          <Button
            onClick={() => setSidebarOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-3 z-10 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          >
            <ChevronsLeft className="w-5 h-5" />
          </Button>
        )}

        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <button
            onClick={onHome}
            className="flex items-center gap-3 w-full text-left rounded-lg p-2 transition-colors"
            aria-label="홈으로 이동"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--role-primary)' }}
            >
              <Brain className="w-6 h-6 text-white dark:text-black" />
            </div>
            <div>
              <div className="text-base font-semibold text-sidebar-foreground">
                IPSUM
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: 'var(--role-primary)' }}
              >
                관리자
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Home - Hidden on mobile */}
          <button
            onClick={() => handleMenuClick('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'home'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'home'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium">홈</span>
          </button>

          <button
            onClick={() => handleMenuClick('permissions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'permissions'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'permissions'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">권한</span>
          </button>

          <button
            onClick={() => handleMenuClick('notices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'notices'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'notices'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-sm font-medium">공지사항</span>
          </button>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-sidebar-border">
          {/* Desktop: Dropdown style */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center gap-3 p-3 bg-sidebar-accent rounded-lg hover:bg-muted transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold"
                style={{ backgroundColor: 'var(--role-primary)' }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">
                  {maskName(userName)}
                </div>
                <div className="text-xs text-muted-foreground">Admin</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    handleMenuClick('mypage');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-accent transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">마이페이지</span>
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-accent transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="text-sm">비밀번호 변경</span>
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">로그아웃</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile: Expanded style */}
          <div className="md:hidden space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent rounded-lg">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold"
                style={{ backgroundColor: 'var(--role-primary)' }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground font-medium">
                  {maskName(userName)}
                </div>
                <div className="text-xs text-muted-foreground">Admin</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-8 py-4">
          <div
            className={`flex items-center justify-between ${!sidebarOpen ? 'ml-16' : ''}`}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => handleMenuClick('home')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                홈
              </button>
              {activeMenu !== 'home' && (
                <>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {activeMenu === 'notices' && '공지사항'}
                    {activeMenu === 'permissions' && '권한'}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="relative" ref={notificationDropdownRef}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="border-border relative"
                  onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Button>

                {showActivityDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[32rem] bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-3 sm:p-4 border-b border-border flex justify-between items-center">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                        시스템 알림
                      </h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
                          onClick={handleMarkAllRead}
                          title="모두 읽음 처리"
                        >
                          <CheckCheck className="w-4 h-4 mr-1" />
                          모두 읽음
                        </Button>
                      )}
                    </div>
                    <div
                      className="max-h-[300px] overflow-y-auto"
                      onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } =
                          e.currentTarget;
                        if (scrollHeight - scrollTop <= clientHeight + 50) {
                          setVisibleCount((prev) => prev + 4);
                        }
                      }}
                    >
                      {displayedNotices.length > 0 ? (
                        <div className="divide-y divide-border">
                          {displayedNotices
                            .slice(0, visibleCount)
                            .map((notice) => (
                              <div
                                key={`${notice.source}-${notice.id}`}
                                className={`p-4 hover:bg-muted/50 transition-colors ${!notice.isRead ? 'bg-blue-50/10' : ''}`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1 py-0 ${
                                          notice.level === 'ERROR'
                                            ? 'border-red-500 text-red-500'
                                            : notice.level === 'WARNING'
                                              ? 'border-yellow-500 text-yellow-500'
                                              : 'border-blue-500 text-blue-500'
                                        }`}
                                      >
                                        {notice.level}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {format(
                                          new Date(notice.createdAt),
                                          'MM.dd HH:mm',
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground leading-snug break-keep">
                                      {notice.message}
                                    </p>
                                  </div>
                                  {!notice.isRead && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-blue-500"
                                      onClick={(e) =>
                                        handleRead(notice.source, notice.id, e)
                                      }
                                      title="읽음 처리"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          새로운 알림이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {activeMenu === 'home' && <AdminHome />}
          {activeMenu === 'notices' && <AdminNotices />}
          {activeMenu === 'permissions' && <AdminPermissions />}
          {activeMenu === 'mypage' && (
            <AdminMyPage
              userData={userData}
              onChangePassword={() => setShowPasswordModal(true)}
            />
          )}
        </main>
      </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
            <DialogDescription>
              계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 사용 중인 비밀번호"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 (4자 이상)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              취소
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={passwordMutation.isPending}
            >
              {passwordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
