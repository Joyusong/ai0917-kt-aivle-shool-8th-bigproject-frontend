import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';
import { AuthorBreadcrumbContext } from './author/AuthorBreadcrumbContext';
import {
  BookOpen,
  Database,
  Megaphone,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  ChevronsLeft,
  Home,
  User,
  Settings,
  ChevronRight,
  FileText,
  KeyRound,
  Trophy,
  FlaskConical,
  Check,
  CheckCheck,
} from 'lucide-react';
import { maskName } from '../../utils/format';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { authorService } from '../../services/authorService';
import { AuthorNoticeDto } from '../../types/author';
import { PasswordChangeModal } from '../../components/dashboard/PasswordChangeModal';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Import sub-components
import { AuthorHome } from './author/AuthorHome';
import { AuthorWorks } from './author/AuthorWorks';
import { AuthorNotice } from './author/AuthorNotice';
import { AuthorMyPage } from './author/AuthorMyPage';
import { AuthorIPExpansion } from './author/AuthorIPExpansion';
import { AuthorAccount } from './author/AuthorAccount';

import { Logo } from '../../components/common/Logo';

interface AuthorDashboardProps {
  onLogout: () => void;
  onHome?: () => void;
}

export function AuthorDashboard({ onLogout, onHome }: AuthorDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('home');
  const [settingsCategory, setSettingsCategory] = useState<
    'characters' | 'world' | 'narrative'
  >('characters');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const [newNotification, setNewNotification] = useState(false);

  // Fetch User Profile
  const { data: userData } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
  });

  const userName =
    userData && 'name' in userData ? (userData.name as string) : '김민지';
  const userInitial = userName.charAt(0);
  // Use integrationId if available (for API calls requiring it), fallback to userId
  const integrationId =
    userData && 'integrationId' in userData && userData.integrationId
      ? userData.integrationId
      : userData && 'userId' in userData
        ? String(userData.userId)
        : '';

  // System Notices (Real-time)
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['author', 'system-notices', integrationId],
    queryFn: () => {
      if (!integrationId)
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 0,
          number: 0,
          last: true,
          page: 0,
        };
      return authorService.getSystemNotices(integrationId);
    },
    enabled: !!integrationId,
    // Poll every minute as fallback if SSE fails or just to sync
    refetchInterval: 60000,
  });

  const notifications = notificationsData?.content || [];
  const unreadCount = notifications.filter(
    (n: AuthorNoticeDto) => !n.read,
  ).length;

  // SSE Subscription
  useEffect(() => {
    if (!integrationId) return;

    const eventSource = new EventSource(
      authorService.getSystemNoticeSubscribeUrl(integrationId),
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

  const handleNotificationClick = async (notice: AuthorNoticeDto) => {
    if (!notice.read && integrationId) {
      try {
        // source is required for the API: /api/v1/author/sysnotice/{source}/{id}/read
        // Assuming notice object has 'source' field. If not, we might need to fallback or check type.
        // Based on DTO, it should have it.
        const source = notice.source || 'system';
        await authorService.readSystemNotice(notice.id, source, integrationId);
        refetchNotifications();
      } catch (error) {
        console.error('Failed to mark notice as read', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!integrationId) return;
    try {
      await authorService.readAllSystemNotices(integrationId);
      refetchNotifications();
      toast.success('모든 알림을 읽음 처리했습니다.');
    } catch (error) {
      toast.error('알림 읽음 처리에 실패했습니다.');
    }
  };

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
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleMenuClick = useCallback((menu: string) => {
    setActiveMenu(menu);
    // Close sidebar on mobile when menu is clicked
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleSubMenuClick = (menu: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(menu);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  // Context value
  const breadcrumbContextValue = useMemo(
    () => ({
      setBreadcrumbs,
      onNavigate: handleMenuClick,
    }),
    [handleMenuClick],
  );

  return (
    <div className="flex h-screen bg-background" data-role="author">
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
        {/* Toggle Button */}
        {sidebarOpen && (
          <Button
            onClick={() => setSidebarOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-3 z-10 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ChevronsLeft className="w-5 h-5" />
          </Button>
        )}

        {/* Logo */}
        <div
          className="h-16 flex items-center px-6 border-b border-sidebar-border cursor-pointer"
          onClick={() => handleMenuClick('home')}
        >
          <Logo />
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
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">홈</span>
          </button>

          <button
            onClick={() => handleMenuClick('works')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'works'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'works'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">작품</span>
          </button>

          {/* IP 확장장 */}
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
            <Database className="w-5 h-5" />
            <span className="text-sm font-medium">IP 확장</span>
          </button>

          <button
            onClick={() => handleMenuClick('notice')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'notice'
                ? 'text-white dark:text-black'
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
                style={{
                  backgroundColor: 'var(--role-primary)',
                }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">
                  {maskName(userName)}
                </div>
                <div className="text-xs text-muted-foreground">작가</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
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
                    setShowProfileDropdown(false);
                    onLogout();
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
                style={{
                  backgroundColor: 'var(--role-primary)',
                }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground font-medium">
                  {maskName(userName)}
                </div>
                <div className="text-xs text-muted-foreground">작가</div>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center">
          <div
            className={`w-full flex items-center justify-between ${!sidebarOpen ? 'ml-16' : ''}`}
          >
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {item.onClick ? (
                        <BreadcrumbLink
                          className="cursor-pointer"
                          onClick={item.onClick}
                        >
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="relative" ref={notificationDropdownRef}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="border-border relative"
                  onClick={() =>
                    setShowNotificationDropdown(!showNotificationDropdown)
                  }
                >
                  <Bell className="w-4 h-4" />
                  {(unreadCount > 0 || newNotification) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-card" />
                  )}
                </Button>

                {showNotificationDropdown && (
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
                            .map((notice: AuthorNoticeDto) => (
                              <div
                                key={notice.id}
                                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                                  !notice.read ? 'bg-blue-50/10' : ''
                                }`}
                                onClick={() => handleNotificationClick(notice)}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1 py-0 ${
                                          notice.category === 'URGENT' ||
                                          notice.category === 'ERROR'
                                            ? 'border-red-500 text-red-500'
                                            : notice.category === 'WARNING'
                                              ? 'border-yellow-500 text-yellow-500'
                                              : 'border-blue-500 text-blue-500'
                                        }`}
                                      >
                                        {notice.category ||
                                          notice.source ||
                                          'SYSTEM'}
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
                                        !notice.read
                                          ? 'font-medium text-foreground'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {notice.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {notice.content}
                                    </p>
                                  </div>
                                  {!notice.read && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
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
        <AuthorBreadcrumbContext.Provider value={breadcrumbContextValue}>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {activeMenu === 'home' && (
              <AuthorHome integrationId={integrationId} />
            )}
            {activeMenu === 'works' && (
              <AuthorWorks integrationId={integrationId} />
            )}
            {activeMenu === 'ip-expansion' && <AuthorIPExpansion />}
            {activeMenu === 'notice' && (
              <AuthorNotice integrationId={integrationId} />
            )}
            {activeMenu === 'mypage' && (
              <AuthorMyPage
                userData={userData}
                onChangePassword={() => setShowPasswordModal(true)}
              />
            )}
            {activeMenu === 'account-settings' && <AuthorAccount />}
          </main>
        </AuthorBreadcrumbContext.Provider>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </div>
  );
}
