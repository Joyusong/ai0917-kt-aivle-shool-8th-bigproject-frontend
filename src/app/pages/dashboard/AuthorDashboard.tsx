import {
  Brain,
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
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useState } from 'react';
import { ThemeToggle } from '../../components/ui/theme-toggle';

// Import sub-components
import { AuthorHome } from './author/AuthorHome';
import { AuthorManuscripts } from './author/AuthorManuscripts';
import { AuthorSettings } from './author/AuthorSettings';
import { AuthorNotice } from './author/AuthorNotice';
import { AuthorMyPage } from './author/AuthorMyPage';
import { AuthorAccount } from './author/AuthorAccount';

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

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    // Close sidebar on mobile when menu is clicked
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

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
        <div className="p-6 border-b border-sidebar-border">
          <button
            onClick={onHome}
            className="flex items-center gap-3 w-full text-left hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
            aria-label="홈으로 이동"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--role-primary)' }}
            >
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold text-sidebar-foreground">
                IPSUM
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: 'var(--role-primary)' }}
              >
                작가 스튜디오
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Home - Hidden on mobile */}
          <button
            onClick={() => handleMenuClick('home')}
            className={`w-full hidden md:flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
            onClick={() => handleMenuClick('manuscripts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'manuscripts'
                ? 'text-white'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'manuscripts'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">원문</span>
          </button>

          <button
            onClick={() => handleMenuClick('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'settings'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'settings'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <Database className="w-5 h-5" />
            <span className="text-sm font-medium">설정집</span>
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
        <div className="p-4 border-t border-sidebar-border">
          {/* Desktop: Dropdown style */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center gap-3 p-3 bg-sidebar-accent rounded-lg hover:bg-muted transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--role-primary)',
                }}
              >
                김
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">
                  김민지
                </div>
                <div className="text-xs text-muted-foreground">작가</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-lg shadow-lg py-1">
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
                    handleMenuClick('account-settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-accent transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">설정</span>
                </button>
                <div className="border-t border-border my-1"></div>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors rounded-lg"
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
                김
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground font-medium">
                  김민지
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
            <button
              onClick={() => handleMenuClick('account-settings')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">설정</span>
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
        <header className="bg-card border-b border-border px-4 md:px-8 py-4">
          <div
            className={`flex items-center justify-between ${!sidebarOpen ? 'ml-16' : ''}`}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">홈</span>
              {activeMenu !== 'home' && (
                <>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {activeMenu === 'manuscripts' && '원문'}
                    {activeMenu === 'settings' && '설정집'}
                    {activeMenu === 'notice' && '공지사항'}
                    {activeMenu === 'mypage' && '마이페이지'}
                    {activeMenu === 'account-settings' && '설정'}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="border-border"
                  onClick={() =>
                    setShowNotificationDropdown(!showNotificationDropdown)
                  }
                >
                  <Bell className="w-4 h-4" />
                </Button>

                {showNotificationDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[32rem] bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-3 sm:p-4 border-b border-border">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                        최근 활동
                      </h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1 truncate">
                            암흑의 영역 연대기 - 47화
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            2시간 전 업로드됨
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white text-[10px] sm:text-xs flex-shrink-0">
                          활성
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1 truncate">
                            암흑의 영역 연대기 - 46화
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            1일 전 업로드됨
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded flex items-center justify-center flex-shrink-0">
                          <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1 truncate">
                            설정집 자동 생성 완료
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            2일 전
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {activeMenu === 'home' && <AuthorHome />}
          {activeMenu === 'manuscripts' && <AuthorManuscripts />}
          {activeMenu === 'settings' && (
            <AuthorSettings
              settingsCategory={settingsCategory}
              setSettingsCategory={setSettingsCategory}
            />
          )}
          {activeMenu === 'notice' && <AuthorNotice />}
          {activeMenu === 'mypage' && <AuthorMyPage />}
          {activeMenu === 'account-settings' && <AuthorAccount />}
        </main>
      </div>
    </div>
  );
}
