import {
  Brain,
  LayoutDashboard,
  Bell,
  ChevronDown,
  LogOut,
  Users,
  Activity,
  FileText,
  Megaphone,
  ChevronRight,
  Menu,
  X as CloseIcon,
  Shield,
  Server,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronsLeft,
  Clock,
  Zap,
  Settings,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import { ThemeToggle } from "../../components/ui/theme-toggle";

interface AdminDashboardProps {
  onLogout: () => void;
  onHome?: () => void;
}

export function AdminDashboard({
  onLogout,
  onHome,
}: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState("home");
  const [showProfileDropdown, setShowProfileDropdown] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showActivityDropdown, setShowActivityDropdown] =
    useState(false);

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
        className={`${sidebarOpen ? "w-full md:w-64" : "w-0"} bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden fixed md:relative h-full z-40`}
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
            className="flex items-center gap-3 w-full text-left hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
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
            onClick={() => handleMenuClick("home")}
            className={`w-full hidden md:flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "home"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "home" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium">홈</span>
          </button>

          <button
            onClick={() => handleMenuClick("permissions")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "permissions"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "permissions" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">권한</span>
          </button>

          <button
            onClick={() => handleMenuClick("notices")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "notices"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "notices" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-sm font-medium">
              공지사항
            </span>
          </button>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-sidebar-border">
          {/* Desktop: Dropdown style */}
          <div className="hidden md:block relative">
            <button
              onClick={() =>
                setShowProfileDropdown(!showProfileDropdown)
              }
              className="w-full flex items-center gap-3 p-3 bg-sidebar-accent rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold" style={{ backgroundColor: 'var(--role-primary)' }}>
                관
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">
                  시스템 관리자
                </div>
                <div className="text-xs text-muted-foreground">
                  Admin
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileDropdown(false);
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
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold" style={{ backgroundColor: 'var(--role-primary)' }}>
                관
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground font-medium">
                  시스템 관리자
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
          <div className={`flex items-center justify-between ${!sidebarOpen ? 'ml-16' : ''}`}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">홈</span>
              {activeMenu !== "home" && (
                <>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {activeMenu === "notices" && "공지사항"}
                    {activeMenu === "permissions" && "권한"}
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
                    setShowActivityDropdown(!showActivityDropdown)
                  }
                >
                  <Bell className="w-4 h-4" />
                </Button>

                {showActivityDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[32rem] bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-3 sm:p-4 border-b border-border">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                        시스템 알림
                      </h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1">
                            서버 상태 정상
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            5분 전
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1">
                            신규 사용자 5명 가입
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            1시간 전
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1">
                            데이터베이스 백업 필요
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            3시간 전
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
          {activeMenu === "home" && <HomeTab />}
          {activeMenu === "notices" && <NoticesTab />}
          {activeMenu === "permissions" && <PermissionsTab />}
        </main>
      </div>
    </div>
  );
}

// Home Tab Component
function HomeTab() {
  return (
    <div className="space-y-6">
      {/* 시스템 상태 Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  정상
                </div>
                <div className="text-sm text-muted-foreground">
                  서버 상태
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  1,247
                </div>
                <div className="text-sm text-muted-foreground">
                  총 사용자
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  3,482
                </div>
                <div className="text-sm text-muted-foreground">
                  저장된 작품
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  87
                </div>
                <div className="text-sm text-muted-foreground">
                  활성 세션
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 서비스 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>일일 활성 사용자</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  오늘
                </span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white">
                    +15%
                  </Badge>
                  <span className="text-lg font-semibold text-foreground">
                    352
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  어제
                </span>
                <span className="text-lg text-muted-foreground">
                  306
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  7일 평균
                </span>
                <span className="text-lg text-muted-foreground">
                  289
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span>시스템 리소스</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    CPU 사용률
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    42%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "42%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    메모리 사용률
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    68%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: "68%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    스토리지 사용률
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    55%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "55%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 시스템 로그 */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span>최근 시스템 로그</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  데이터베이스 백업 완료
                </div>
                <div className="text-xs text-muted-foreground">
                  2026.01.09 14:32:15
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 shrink-0"
              >
                성공
              </Badge>
            </div>

            <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  신규 사용자 계정 5개 생성
                </div>
                <div className="text-xs text-muted-foreground">
                  2026.01.09 13:45:22
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 shrink-0"
              >
                정보
              </Badge>
            </div>

            <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 bg-yellow-500 rounded-full shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  API 응답 시간 증가 감지
                </div>
                <div className="text-xs text-muted-foreground">
                  2026.01.09 12:18:44
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400 shrink-0"
              >
                경고
              </Badge>
            </div>

            <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  서버 재시작 완료
                </div>
                <div className="text-xs text-muted-foreground">
                  2026.01.09 11:05:33
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 shrink-0"
              >
                성공
              </Badge>
            </div>

            <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  시스템 업데이트 적용
                </div>
                <div className="text-xs text-muted-foreground">
                  2026.01.09 09:22:11
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 shrink-0"
              >
                업데이트
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 배포 현황 */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span>배포 현황</span>
            </CardTitle>
            <Badge className="bg-green-500 text-white">
              운영 중
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                현재 버전
              </div>
              <div className="text-lg font-semibold text-foreground">
                v2.4.1
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                2026.01.05 배포
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                환경
              </div>
              <div className="text-lg font-semibold text-foreground">
                Production
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                AWS Seoul (ap-northeast-2)
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                가동 시간
              </div>
              <div className="text-lg font-semibold text-foreground">
                99.8%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                지난 30일 평균
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Notices Tab Component
function NoticesTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg text-foreground font-semibold">
              공지사항
            </h2>
          </div>
        </div>
        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
          <Megaphone className="w-4 h-4 mr-2" />새 공지사항 작성
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[
              {
                title: "Lorem ipsum dolor sit amet consectetur",
                date: "2026.01.08",
                status: "published",
                views: 1523,
              },
              {
                title: "Sed do eiusmod tempor incididunt",
                date: "2026.01.08",
                status: "published",
                views: 892,
              },
              {
                title: "Ut enim ad minim veniam quis nostrud",
                date: "2026.01.07",
                status: "published",
                views: 654,
              },
              {
                title: "Duis aute irure dolor in reprehenderit",
                date: "2025.12.24",
                status: "draft",
                views: 0,
              },
              {
                title: "Excepteur sint occaecat cupidatat",
                date: "2025.12.23",
                status: "published",
                views: 2341,
              },
            ].map((notice, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 hover:bg-muted/50 cursor-pointer transition-colors gap-4 md:gap-0"
              >
                <div className="flex items-start md:items-center gap-4 flex-1">
                  <div className="text-sm text-muted-foreground font-medium min-w-[40px] pt-1 md:pt-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                      <span className="text-base text-foreground font-medium truncate max-w-full">
                        {notice.title}
                      </span>
                      {notice.status === "published" ? (
                        <Badge className="bg-green-500 text-white text-xs shrink-0">
                          게시됨
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground text-xs shrink-0"
                        >
                          임시저장
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{notice.date}</span>
                      <span>조회수 {notice.views}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end w-full md:w-auto pl-14 md:pl-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border"
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Permissions Tab Component
interface PermissionEditModalProps {
  user: any;
  onClose: () => void;
  onSave: (user: any) => void;
}

function PermissionEditModal({
  user,
  onClose,
  onSave,
}: PermissionEditModalProps) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);

  const handleSave = () => {
    onSave({ ...user, role, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            권한 수정
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${user.initialGradient} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
              {user.initial}
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-medium text-foreground truncate">
                {user.name}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground break-all">
                {user.email}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm text-muted-foreground">
                역할
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              >
                <option value="운영자">운영자</option>
                <option value="작가">작가</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-xs sm:text-sm text-muted-foreground">
                상태
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              >
                <option value="활성">활성</option>
                <option value="휴면">휴면</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-muted-foreground">
              가입일
            </div>
            <div className="text-sm text-foreground">
              {user.date}
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5 border-t border-border flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-3 sm:px-4 text-sm"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="px-3 sm:px-4 text-sm bg-purple-600 hover:bg-purple-700 text-white"
          >
            수정 완료
          </Button>
        </div>
      </div>
    </div>
  );
}

const initialUsers = [
  {
    name: "시스템 관리자",
    email: "admin@example.com",
    role: "관리자",
    roleBadge: "bg-red-500 text-white",
    status: "활성",
    statusBadge: "bg-green-500 text-white",
    date: "2023.01.15",
    initial: "관",
    initialGradient: "from-red-500 to-pink-600",
  },
  {
    name: "박지영",
    email: "operator1@example.com",
    role: "운영자",
    roleBadge: "bg-blue-500 text-white",
    status: "활성",
    statusBadge: "bg-green-500 text-white",
    date: "2024.05.22",
    initial: "박",
    initialGradient: "from-blue-500 to-purple-600",
  },
  {
    name: "김민지",
    email: "author1@example.com",
    role: "작가",
    roleBadge: "bg-green-500 text-white",
    status: "활성",
    statusBadge: "bg-green-500 text-white",
    date: "2025.11.03",
    initial: "김",
    initialGradient: "from-green-500 to-teal-600",
  },
  {
    name: "이서준",
    email: "author2@example.com",
    role: "작가",
    roleBadge: "bg-green-500 text-white",
    status: "휴면",
    statusBadge: "border-border text-muted-foreground",
    statusVariant: "outline",
    date: "2025.08.14",
    initial: "이",
    initialGradient: "from-yellow-500 to-orange-600",
  },
];

function PermissionsTab() {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const applyRoleStatusStyles = (user: any) => {
    let roleBadge = user.roleBadge;
    let statusBadge = user.statusBadge;
    let statusVariant = user.statusVariant;

    if (user.role === "관리자") {
      roleBadge = "bg-red-500 text-white";
    } else if (user.role === "운영자") {
      roleBadge = "bg-blue-500 text-white";
    } else {
      roleBadge = "bg-green-500 text-white";
    }

    if (user.status === "휴면") {
      statusVariant = "outline";
      statusBadge = "border-border text-muted-foreground";
    } else {
      statusVariant = undefined;
      statusBadge = "bg-green-500 text-white";
    }

    return {
      ...user,
      roleBadge,
      statusBadge,
      statusVariant,
    };
  };

  const handleEditClick = (user: any) => {
    if (user.role === "관리자") {
      return;
    }
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSavePermission = (updatedUser: any) => {
    const styledUser = applyRoleStatusStyles(updatedUser);
    setUsers((prev) =>
      prev.map((user) =>
        user.email === styledUser.email ? styledUser : user
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg text-foreground font-semibold">
              권한
            </h2>
          </div>
        </div>
        <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white">
          <Users className="w-4 h-4 mr-2" />새 사용자 추가
        </Button>
      </div>

      {/* 역할별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  3
                </div>
                <div className="text-sm text-muted-foreground">
                  관리자
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  12
                </div>
                <div className="text-sm text-muted-foreground">
                  운영자
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  1,232
                </div>
                <div className="text-sm text-muted-foreground">
                  작가
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 사용자 목록 */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
            <CardTitle className="text-foreground">
              사용자 목록
            </CardTitle>
            <Input
              placeholder="사용자 검색..."
              className="w-full md:max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {users.map((user, idx) => (
                  <tr key={idx} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${user.initialGradient} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                          {user.initial}
                        </div>
                        <span className="text-sm text-foreground">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={user.roleBadge}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={user.statusVariant as any}
                        className={user.statusBadge}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border"
                        onClick={() => handleEditClick(user)}
                        disabled={user.role === "관리자"}
                      >
                        수정
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {users.map((user, idx) => (
              <div key={idx} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${user.initialGradient} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                      {user.initial}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground break-all">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border"
                    onClick={() => handleEditClick(user)}
                    disabled={user.role === "관리자"}
                  >
                    수정
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">역할</span>
                  <Badge className={user.roleBadge}>{user.role}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">상태</span>
                  <Badge variant={user.statusVariant as any} className={user.statusBadge}>{user.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">가입일</span>
                  <span className="text-foreground">{user.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {showEditModal && selectedUser && (
        <PermissionEditModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleSavePermission}
        />
      )}
    </div>
  );
}
