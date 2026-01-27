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
} from 'lucide-react';
import { maskName } from '../../utils/format';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';

import { ManagerHome } from './manager/ManagerHome';
import { ManagerWorkAnalysis } from './manager/ManagerWorkAnalysis';
import { ManagerIPTrend } from './manager/ManagerIPTrend';
import { ManagerIPExpansion } from './manager/ManagerIPExpansion';
import { ManagerAuthorManagement } from './manager/ManagerAuthorManagement';
import { Manager3DAssets } from './manager/Manager3DAssets';
import { ManagerNotice } from './manager/ManagerNotice';
import { ManagerContestTemplates } from './manager/ManagerContestTemplates';
import { ManagerMyPage } from './manager/ManagerMyPage';
import { ManagerSettings } from './manager/ManagerSettings';
import { PasswordChangeModal } from '../../components/common/PasswordChangeModal';
import { Logo } from '../../components/common/Logo';

interface ManagerDashboardProps {
  onLogout: () => void;
  onHome?: () => void;
}

export function ManagerDashboard({ onLogout, onHome }: ManagerDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('home');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

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

        <div className="p-6 border-b border-sidebar-border">
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
            onClick={() => handleMenuClick('3d-assets')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === '3d-assets'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === '3d-assets'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="text-sm font-medium">3D 배경 에셋</span>
          </button>

          <button
            onClick={() => handleMenuClick('work-analysis')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'work-analysis'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'work-analysis'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">작품 분석</span>
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
            <span className="text-sm font-medium">IP 트렌드 분석</span>
          </button>

          <button
            onClick={() => handleMenuClick('contest-templates')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === 'contest-templates'
                ? 'text-white dark:text-black'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
            style={
              activeMenu === 'contest-templates'
                ? { backgroundColor: 'var(--role-primary)' }
                : {}
            }
          >
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">공모전 템플릿</span>
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
        <div className="p-4 border-t border-sidebar-border">
          {/* Desktop: Dropdown style */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white dark:text-black text-sm"
                style={{ backgroundColor: 'var(--role-primary)' }}
              >
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm text-sidebar-foreground truncate">
                  {maskName(userName)}
                </div>
                <div className="text-xs text-muted-foreground">Manager</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
              />
            </button>

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
                <div className="text-xs text-muted-foreground">PD</div>
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
              onClick={() => handleMenuClick('settings')}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-8 py-4">
          <div
            className={`flex items-center justify-between ${!sidebarOpen ? 'ml-16' : ''}`}
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
                      {activeMenu === 'work-analysis' && '작품 분석'}
                      {activeMenu === '3d-assets' && '3D 배경 에셋'}
                      {activeMenu === 'ip-trend-analysis' && 'IP 트렌드 분석'}
                      {activeMenu === 'ip-expansion' && 'IP 확장'}
                      {activeMenu === 'author-management' && '작가'}
                      {activeMenu === 'contest-templates' && '공모전 템플릿'}
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
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                >
                  <Bell className="w-5 h-5" />
                </Button>

                {showActivityDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[32rem] bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                        최근 활동
                      </h3>
                    </div>
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      새로운 알림이 없습니다.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {activeMenu === 'home' && (
            <ManagerHome onNavigate={handleMenuClick} />
          )}
          {activeMenu === 'work-analysis' && <ManagerWorkAnalysis />}
          {activeMenu === '3d-assets' && <Manager3DAssets />}
          {activeMenu === 'notice' && <ManagerNotice />}
          {activeMenu === 'ip-trend-analysis' && <ManagerIPTrend />}
          {activeMenu === 'ip-expansion' && <ManagerIPExpansion />}
          {activeMenu === 'author-management' && <ManagerAuthorManagement />}
          {activeMenu === 'contest-templates' && <ManagerContestTemplates />}
          {activeMenu === 'mypage' && (
            <ManagerMyPage
              userData={userData}
              onChangePassword={() => setShowPasswordModal(true)}
            />
          )}
          {activeMenu === 'settings' && <ManagerSettings />}
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
