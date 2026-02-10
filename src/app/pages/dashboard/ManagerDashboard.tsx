import {
  Brain,
  LayoutDashboard,
  Zap,
  Grid3x3,
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Megaphone,
  Menu,
  ChevronsLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  LogOut,
  Settings,
  User,
  CheckCheck,
  Check,
} from 'lucide-react';
import { maskName } from '../../utils/format';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Suspense, lazy, useState, useRef, useEffect } from 'react';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { managerService } from '../../services/managerService';
import { ManagerNotice as ManagerNoticeType } from '../../types/manager';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ManagerHome = lazy(() =>
  import('./manager/ManagerHome').then((m) => ({ default: m.ManagerHome })),
);
const ManagerIPTrend = lazy(() =>
  import('./manager/ManagerIPTrend').then((m) => ({
    default: m.ManagerIPTrend,
  })),
);
const ManagerIPExpansion = lazy(() =>
  import('./manager/ManagerIPExpansion').then((m) => ({
    default: m.ManagerIPExpansion,
  })),
);
const ManagerAuthorManagement = lazy(() =>
  import('./manager/ManagerAuthorManagement').then((m) => ({
    default: m.ManagerAuthorManagement,
  })),
);
const ManagerNotice = lazy(() =>
  import('./manager/ManagerNotice').then((m) => ({ default: m.ManagerNotice })),
);
const ManagerMyPage = lazy(() =>
  import('./manager/ManagerMyPage').then((m) => ({ default: m.ManagerMyPage })),
);

import { PasswordChangeModal } from '../../components/dashboard/PasswordChangeModal';
import { Logo } from '../../components/common/Logo';

interface ManagerDashboardProps {
  onLogout: () => void;
  onHome?: () => void;
}

function DashboardContentLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export function ManagerDashboard({ onLogout, onHome }: ManagerDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('home');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  const [newNotification, setNewNotification] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
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

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Fetch User Profile
  const { data: userData } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
  });

  const userName =
    userData && 'name' in userData ? (userData.name as string) : '매니저님';
  const userInitial = userName.charAt(0);
  const integrationId =
    userData && 'integrationId' in userData && userData.integrationId
      ? userData.integrationId
      : userData && 'userId' in userData
        ? String(userData.userId)
        : '';

  // System Notices (Real-time)
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['manager', 'system-notices', integrationId],
    queryFn: async () => {
      // console.log('Fetching notices for:', integrationId);
      if (!integrationId) return { notices: [], count: 0 };
      try {
        const result = await managerService.getNotices(integrationId);
        // console.log('Notices fetched:', result);
        return result;
      } catch (error) {
        // console.error('Error fetching notices:', error);
        return { notices: [], count: 0 };
      }
    },
    enabled: !!integrationId,
    refetchInterval: 60000,
  });

  const notifications = notificationsData?.notices || [];
  const unreadCount = notifications.filter(
    (n: ManagerNoticeType) => !n.isRead,
  ).length;

  // SSE Subscription
  useEffect(() => {
    if (!integrationId) return;

    const eventSource = new EventSource(
      managerService.getSystemNoticeSubscribeUrl(integrationId),
      { withCredentials: true },
    );

    eventSource.onopen = () => {
      console.log('SSE Connected');
    };

    eventSource.addEventListener('system-notice', (event) => {
      console.log('New Notification:', event.data);
      try {
        const newNotice = JSON.parse(event.data);
        toast.info(newNotice.title || '새로운 알림이 도착했습니다.');
        setNewNotification(true);
        refetchNotifications();
      } catch (e) {
        console.error('Failed to parse notification', e);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [integrationId, refetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (!integrationId) return;
    try {
      await managerService.markAllNoticesAsRead(integrationId);
      refetchNotifications();
      toast.success('모든 알림을 읽음 처리했습니다.');
    } catch (error) {
      toast.error('알림 읽음 처리에 실패했습니다.');
    }
  };

  const handleNotificationClick = async (notice: ManagerNoticeType) => {
    if (!notice.isRead && integrationId) {
      try {
        await managerService.markNoticeAsRead(integrationId, notice.id);
        refetchNotifications();
      } catch (error) {
        console.error('Failed to mark notice as read', error);
      }
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
    <div className="flex h-screen bg-background font-sans" data-role="manager">
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

        <div
          className="h-16 flex items-center px-6 border-b border-sidebar-border cursor-pointer"
          onClick={() => handleMenuClick('home')}
        >
          <Logo />
        </div>

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
            onClick={() => handleMenuClick('ip-expansion')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'ip-expansion'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'ip-expansion'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">IP 확장</span>
          </button>

          <button
            onClick={() => handleMenuClick('ip-trend-analysis')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'ip-trend-analysis'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'ip-trend-analysis'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">IP 트렌드</span>
          </button>

          <button
            onClick={() => handleMenuClick('author-management')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'author-management'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'author-management'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">작가</span>
          </button>

          <button
            onClick={() => handleMenuClick('notice')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'notice'
                ? 'text-white'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'notice'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-sm font-medium">공지사항</span>
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
              className="w-full flex items-center gap-3 p-3 bg-sidebar-accent hover:bg-muted transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold"
                style={{ backgroundColor: 'var(--role-primary)' }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {maskName(userName)}
                </div>
                <div className="text-xs text-muted-foreground">운영자</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showProfileDropdown && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border shadow-lg py-1 z-50">
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: 'var(--role-primary)' }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground font-medium">
                  {maskName(userName)}
                </div>
                <div className="text-xs text-muted-foreground">운영자</div>
              </div>
            </div>

            <button
              onClick={() => handleMenuClick('mypage')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">마이페이지</span>
            </button>
            <div className="border-t border-sidebar-border my-2"></div>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center">
          <div
            className={`w-full flex items-center justify-between ${!sidebarOpen ? 'ml-16' : ''}`}
          >
            <div>
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
                      {activeMenu === 'ip-trend-analysis' && 'IP 트렌드 분석'}
                      {activeMenu === 'ip-expansion' && 'IP 확장'}
                      {activeMenu === 'author-management' && '작가'}
                      {activeMenu === 'notice' && '공지사항'}
                      {activeMenu === 'mypage' && '마이페이지'}
                      {activeMenu === 'settings' && '설정'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="relative" ref={notificationDropdownRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground relative"
                  onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                >
                  <Bell className="w-5 h-5" />
                  {(unreadCount > 0 || newNotification) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-card" />
                  )}
                </Button>

                {showActivityDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[32rem] bg-card border border-border rounded-lg shadow-xl z-50">
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border flex justify-between items-center">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                        시스템 알림
                      </h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
                          onClick={handleMarkAllAsRead}
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
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-border">
                          {notifications
                            .slice(0, visibleCount)
                            .map((notice: ManagerNoticeType) => (
                              <div
                                key={notice.id}
                                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                                  !notice.isRead ? 'bg-blue-50/10' : ''
                                }`}
                                onClick={() => handleNotificationClick(notice)}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1 py-0 ${
                                          notice.source === 'AUTHOR_PROPOSAL'
                                            ? 'border-blue-500 text-blue-500'
                                            : notice.source === 'IP_EXTREND'
                                              ? 'border-purple-500 text-purple-500'
                                              : 'border-green-500 text-green-500'
                                        }`}
                                      >
                                        {notice.source === 'AUTHOR_PROPOSAL'
                                          ? '작가 제안'
                                          : notice.source === 'IP_EXTREND'
                                            ? '트렌드'
                                            : 'IP 확장'}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {format(
                                          new Date(notice.createdAt),
                                          'yyyy.MM.dd HH:mm',
                                        )}
                                      </span>
                                    </div>
                                    <p
                                      className={`text-sm ${
                                        !notice.isRead
                                          ? 'font-medium text-foreground'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {notice.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {notice.message}
                                    </p>
                                  </div>
                                  {!notice.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-primary shrink-0"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (!integrationId) return;
                                        try {
                                          await managerService.markNoticeAsRead(
                                            integrationId,
                                            notice.id,
                                          );
                                          refetchNotifications();
                                          toast.success(
                                            '알림을 읽음 처리했습니다.',
                                          );
                                        } catch (error) {
                                          toast.error(
                                            '알림 읽음 처리에 실패했습니다.',
                                          );
                                        }
                                      }}
                                      title="읽음 처리"
                                    >
                                      <CheckCheck className="w-4 h-4" />
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
          <Suspense fallback={<DashboardContentLoader />}>
            {activeMenu === 'home' && (
              <ManagerHome onNavigate={handleMenuClick} />
            )}
            {activeMenu === 'notice' && <ManagerNotice />}
            {activeMenu === 'ip-trend-analysis' && <ManagerIPTrend />}
            {activeMenu === 'ip-expansion' && <ManagerIPExpansion />}
            {activeMenu === 'author-management' && <ManagerAuthorManagement />}
            {activeMenu === 'mypage' && (
              <ManagerMyPage
                userData={userData}
                onChangePassword={() => setShowPasswordModal(true)}
              />
            )}
          </Suspense>
          {/* {activeMenu === 'settings' && <ManagerSettings />} */}
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
