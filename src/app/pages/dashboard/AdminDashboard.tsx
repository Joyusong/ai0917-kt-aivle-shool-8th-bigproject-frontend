import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';
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
  ShieldCheck,
} from 'lucide-react';
import { maskName } from '../../utils/format';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { PasswordChangeModal } from '../../components/dashboard/PasswordChangeModal';
import { AdminHome } from './admin/AdminHome';
import { AdminNotices } from './admin/AdminNotices';
import { AdminPermissions } from './admin/AdminPermissions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { authService } from '../../services/authService';
import { format } from 'date-fns';
import { Logo } from '../../components/common/Logo';
import { cn } from '../../components/ui/utils';

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
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Outside click handler for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowActivityDropdown(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
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

    // Optimistic Update
    const previousNotices = queryClient.getQueryData(['admin', 'notices']);
    queryClient.setQueryData(['admin', 'notices'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        notices: old.notices.map((notice: any) => ({
          ...notice,
          isRead: true,
        })),
      };
    });

    try {
      await adminService.markAllSystemNoticesAsRead();
      // Success - let the next poll sync or invalidate if strict consistency needed
      // queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] });
    } catch (error) {
      console.error('Failed to mark all as read', error);
      // Revert on error
      queryClient.setQueryData(['admin', 'notices'], previousNotices);
    }
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    // Close sidebar on mobile when menu is clicked
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className="flex h-screen bg-background font-sans antialiased"
      data-role="admin"
    >
      {/* Sidebar Open Button (when closed) */}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-sidebar border-r border-sidebar-border flex flex-col fixed md:relative h-full z-40 transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-full md:w-56' : 'w-0 md:w-16',
        )}
      >
        {/* Close Button */}
        {sidebarOpen && (
          <Button
            onClick={() => setSidebarOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-3 z-10 text-muted-foreground hover:text-foreground hover:bg-muted md:flex hidden"
          >
            <ChevronsLeft className="w-5 h-5" />
          </Button>
        )}

        {/* Logo */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-sidebar-border cursor-pointer transition-all duration-300',
            sidebarOpen ? 'px-6' : 'justify-center px-0',
          )}
          onClick={() => {
            if (!sidebarOpen) setSidebarOpen(true);
            else handleMenuClick('home');
          }}
        >
          <Logo role="Admin" collapsed={!sidebarOpen} />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {/* Home - Hidden on mobile */}
          <button
            onClick={() => handleMenuClick('home')}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg transition-all duration-200 group relative',
              sidebarOpen ? 'px-4 py-3' : 'justify-center py-3 px-0',
              activeMenu === 'home'
                ? 'text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent',
            )}
            style={
              activeMenu === 'home'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
            title={!sidebarOpen ? '홈' : undefined}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                'text-sm font-medium whitespace-nowrap transition-all duration-200',
                !sidebarOpen && 'hidden opacity-0 w-0',
              )}
            >
              홈
            </span>
          </button>

          <button
            onClick={() => handleMenuClick('permissions')}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg transition-all duration-200 group relative',
              sidebarOpen ? 'px-4 py-3' : 'justify-center py-3 px-0',
              activeMenu === 'permissions'
                ? 'text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent',
            )}
            style={
              activeMenu === 'permissions'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
            title={!sidebarOpen ? '권한' : undefined}
          >
            <Shield className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                'text-sm font-medium whitespace-nowrap transition-all duration-200',
                !sidebarOpen && 'hidden opacity-0 w-0',
              )}
            >
              권한
            </span>
          </button>

          <button
            onClick={() => handleMenuClick('notices')}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg transition-all duration-200 group relative',
              sidebarOpen ? 'px-4 py-3' : 'justify-center py-3 px-0',
              activeMenu === 'notices'
                ? 'text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent',
            )}
            style={
              activeMenu === 'notices'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
            title={!sidebarOpen ? '공지사항' : undefined}
          >
            <Megaphone className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                'text-sm font-medium whitespace-nowrap transition-all duration-200',
                !sidebarOpen && 'hidden opacity-0 w-0',
              )}
            >
              공지사항
            </span>
          </button>
        </nav>

        {/* Profile Section */}
        <div
          className="border-t border-sidebar-border"
          ref={profileDropdownRef}
        >
          {/* Desktop: Dropdown style */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={cn(
                'w-full flex items-center gap-3 hover:bg-muted transition-colors',
                sidebarOpen ? 'p-3' : 'justify-center p-3',
              )}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0"
                style={{
                  backgroundColor: 'var(--role-primary)',
                }}
              >
                {userName.charAt(0)}
              </div>

              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-sidebar-foreground truncate">
                      {maskName(userName)}
                    </div>
                    <div className="text-xs text-muted-foreground">관리자</div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform shrink-0',
                      showProfileDropdown ? 'rotate-180' : '',
                    )}
                  />
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div
                className={cn(
                  'absolute bg-card border border-border shadow-lg py-1 z-50 rounded-md',
                  sidebarOpen
                    ? 'bottom-full left-4 right-4 mb-2'
                    : 'bottom-0 left-full ml-2 w-56 mb-4',
                )}
              >
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-destructive flex items-center gap-2"
                >
                  <LogOut size={16} />
                  로그아웃
                </button>
              </div>
            )}
          </div>

          {/* Mobile: Expanded style */}
          <div className="md:hidden space-y-2">
            <div className="flex items-center gap-3 bg-sidebar-accent rounded-lg">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold"
                style={{ backgroundColor: 'var(--role-primary)' }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground font-medium">
                  {maskName(userName)}
                </div>
                <div className="text-xs text-muted-foreground">관리자</div>
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
        <header
          className={cn(
            'h-16 bg-card border-b border-border px-4 md:px-8 flex items-center transition-[padding] duration-300 ease-in-out',
            !sidebarOpen && 'pl-16',
          )}
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Breadcrumb */}
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => handleMenuClick('home')}
                      className="cursor-pointer"
                    >
                      홈
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {activeMenu !== 'home' && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {activeMenu === 'notices' && '공지사항'}
                          {activeMenu === 'permissions' && '권한'}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
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
                                        className={`text-xs px-1 py-0 ${
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
        </main>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </div>
  );
}
