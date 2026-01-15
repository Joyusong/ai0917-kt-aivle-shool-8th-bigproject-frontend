import {
  Brain,
  BookOpen,
  Database,
  Lightbulb,
  Bell,
  Upload,
  ChevronDown,
  Sparkles,
  TrendingUp,
  AlertCircle,
  FileText,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  Globe,
  Users as UsersIcon,
  BookMarked,
  AlertTriangle,
  CheckCircle,
  Clock,
  Megaphone,
  ChevronRight,
  User,
  Settings,
  Home,
  Download,
  Menu,
  ChevronsLeft,
  ChevronsRight,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useState } from "react";
import { ThemeToggle } from "../../components/ui/theme-toggle";

interface AuthorDashboardProps {
  onLogout: () => void;
  onHome?: () => void;
}

export function AuthorDashboard({
  onLogout,
  onHome,
}: AuthorDashboardProps) {
  const [activeMenu, setActiveMenu] = useState("home");
  const [settingsCategory, setSettingsCategory] =
    useState("characters");
  const [showProfileDropdown, setShowProfileDropdown] =
    useState(false);
  const [
    showNotificationDropdown,
    setShowNotificationDropdown,
  ] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    // Close sidebar on mobile when menu is clicked
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className="flex h-screen bg-background"
      data-role="author"
    >
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
              style={{ backgroundColor: "var(--role-primary)" }}
            >
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold text-sidebar-foreground">
                IPSUM
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "var(--role-primary)" }}
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
            onClick={() => handleMenuClick("home")}
            className={`w-full hidden md:flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "home"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={
              activeMenu === "home"
                ? { backgroundColor: "var(--role-primary)" }
                : {}
            }
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">홈</span>
          </button>

          <button
            onClick={() => handleMenuClick("manuscripts")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "manuscripts"
                ? "text-white"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={
              activeMenu === "manuscripts"
                ? { backgroundColor: "var(--role-primary)" }
                : {}
            }
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">원문</span>
          </button>

          <button
            onClick={() => handleMenuClick("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "settings"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={
              activeMenu === "settings"
                ? { backgroundColor: "var(--role-primary)" }
                : {}
            }
          >
            <Database className="w-5 h-5" />
            <span className="text-sm font-medium">설정집</span>
          </button>

          <button
            onClick={() => handleMenuClick("notice")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "notice"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={
              activeMenu === "notice"
                ? { backgroundColor: "var(--role-primary)" }
                : {}
            }
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
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold"
                style={{
                  backgroundColor: "var(--role-primary)",
                }}
              >
                김
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">
                  김민지
                </div>
                <div className="text-xs text-muted-foreground">
                  작가
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-lg shadow-lg py-1">
                <button
                  onClick={() => {
                    handleMenuClick("mypage");
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-accent transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">마이페이지</span>
                </button>
                <button
                  onClick={() => {
                    handleMenuClick("account-settings");
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
                  backgroundColor: "var(--role-primary)",
                }}
              >
                김
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground font-medium">
                  김민지
                </div>
                <div className="text-xs text-muted-foreground">
                  작가
                </div>
              </div>
            </div>

            <button
              onClick={() => handleMenuClick("mypage")}
              className="w-full flex items-center gap-3 px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">마이페이지</span>
            </button>
            <button
              onClick={() =>
                handleMenuClick("account-settings")
              }
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
            className={`flex items-center justify-between ${!sidebarOpen ? "ml-16" : ""}`}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">홈</span>
              {activeMenu !== "home" && (
                <>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {activeMenu === "manuscripts" && "원문"}
                    {activeMenu === "settings" && "설정집"}
                    {activeMenu === "notice" && "공지사항"}
                    {activeMenu === "mypage" && "마이페이지"}
                    {activeMenu === "account-settings" &&
                      "설정"}
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
                    setShowNotificationDropdown(
                      !showNotificationDropdown,
                    )
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
          {activeMenu === "home" && <HomeTab />}
          {activeMenu === "manuscripts" && <ManuscriptsTab />}
          {activeMenu === "settings" && (
            <SettingsTab
              settingsCategory={settingsCategory}
              setSettingsCategory={setSettingsCategory}
            />
          )}
          {activeMenu === "notice" && <AuthorNoticeTab />}
          {activeMenu === "mypage" && <AuthorMyPageTab />}
          {activeMenu === "account-settings" && (
            <AuthorAccountSettingsTab />
          )}
        </main>
      </div>
    </div>
  );
}

// Home Tab Component
function HomeTab() {
  return (
    <div className="space-y-6">
      {/* 작품 현황 Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  3
                </div>
                <div className="text-sm text-muted-foreground">
                  진행 중인 작품
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  5
                </div>
                <div className="text-sm text-muted-foreground">
                  생성된 설정집
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  2
                </div>
                <div className="text-sm text-muted-foreground">
                  완결 작품
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 공지사항 Section */}
      <Card className="border-border">
        <CardHeader className="border-b border-border flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-foreground">
              공지사항
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-foreground">
                    Lorem ipsum dolor sit amet consectetur
                  </span>
                  <Badge className="bg-orange-500 text-white text-xs">
                    N
                  </Badge>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                2026.01.08
              </span>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-foreground">
                    Sed do eiusmod tempor incididunt
                  </span>
                  <Badge className="bg-orange-500 text-white text-xs">
                    N
                  </Badge>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                2026.01.08
              </span>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex-1">
                <span className="text-sm text-foreground">
                  Duis aute irure dolor in reprehenderit
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                2025.12.24
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Manuscripts Tab Component (파일 탐색기 스타일)
function ManuscriptsTab() {
  return (
    <>
      {/* Upload Info */}
      <Card className="mb-6 border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-foreground mb-2">
                AI 자동 설정 추출
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                원문을 업로드하면 AI가 자동으로 인물, 세계관,
                서사 설정을 추출하여 설정집에 저장합니다. 원본
                텍스트는 저장되지 않으며, 추출된 설정만
                관리됩니다.
              </p>
              <div className="text-xs text-muted-foreground">
                지원 형식: TXT, DOCX, PDF • 최대 파일 크기: 50MB
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-6">
        <Input
          placeholder="파일 검색..."
          className="max-w-md"
        />
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="w-4 h-4 mr-2" />새 파일 업로드
        </Button>
      </div>

      <div className="mb-6"></div>

      {/* File Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Active Novel */}
        <div className="group cursor-pointer">
          <div className="bg-card border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 hover:shadow-md transition-all">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-700 to-slate-900 rounded mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="text-xs text-foreground truncate mb-1">
              암흑의 영역 연대기
            </div>
            <div className="text-xs text-muted-foreground">
              47화 • 2시간 전
            </div>
            <Badge className="bg-green-500 text-white text-xs mt-2">
              활성
            </Badge>
          </div>
        </div>

        {/* Completed Novel 1 */}
        <div className="group cursor-pointer">
          <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <div className="aspect-[4/3] bg-gradient-to-br from-purple-700 to-purple-900 rounded mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="text-xs text-foreground truncate mb-1">
              운명의 검
            </div>
            <div className="text-xs text-muted-foreground">
              완결 • 120화
            </div>
            <Badge
              variant="outline"
              className="border-border text-muted-foreground text-xs mt-2"
            >
              완결
            </Badge>
          </div>
        </div>

        {/* Completed Novel 2 */}
        <div className="group cursor-pointer">
          <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <div className="aspect-[4/3] bg-gradient-to-br from-blue-700 to-blue-900 rounded mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="text-xs text-foreground truncate mb-1">
              별빛 아카데미
            </div>
            <div className="text-xs text-muted-foreground">
              완결 • 85화
            </div>
            <Badge
              variant="outline"
              className="border-border text-muted-foreground text-xs mt-2"
            >
              완결
            </Badge>
          </div>
        </div>

        {/* Chapter Files */}
        <div className="group cursor-pointer">
          <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <div className="aspect-[4/3] bg-muted rounded mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-xs text-foreground truncate mb-1">
              47화 - 선택의 순간
            </div>
            <div className="text-xs text-muted-foreground">
              2시간 전
            </div>
          </div>
        </div>

        <div className="group cursor-pointer">
          <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <div className="aspect-[4/3] bg-muted rounded mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-xs text-foreground truncate mb-1">
              46화 - 진실의 파편
            </div>
            <div className="text-xs text-muted-foreground">1일 전</div>
          </div>
        </div>

        <div className="group cursor-pointer">
          <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <div className="aspect-[4/3] bg-muted rounded mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-xs text-foreground truncate mb-1">
              45화 - 어둠 속의 빛
            </div>
            <div className="text-xs text-muted-foreground">2일 전</div>
          </div>
        </div>

        <div className="group cursor-pointer">
          <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <div className="aspect-[4/3] bg-muted rounded mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-xs text-foreground truncate mb-1">
              44화 - 배신자
            </div>
            <div className="text-xs text-muted-foreground">3일 전</div>
          </div>
        </div>

        <div className="group cursor-pointer">
          <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <div className="aspect-[4/3] bg-muted rounded mb-3 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-xs text-foreground truncate mb-1">
              43화 - 그림자의 속삭임
            </div>
            <div className="text-xs text-muted-foreground">4일 전</div>
          </div>
        </div>
      </div>
    </>
  );
}

// Settings Tab Component (3개 카테고리만)
function SettingsTab({
  settingsCategory,
  setSettingsCategory,
}: {
  settingsCategory: string;
  setSettingsCategory: (cat: string) => void;
}) {
  return (
    <>
      {/* AI Review Section - 상단에 배치 */}
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button
          variant="outline"
          className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Download className="w-4 h-4 mr-2" />
          공모전 템플릿 불러오기
        </Button>
      </div>

      <Card className="border-border shadow-sm mb-6">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>AI 검토 결과</span>
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="border-border"
            >
              전체 재검토
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm text-foreground mb-1">
                  역설적 설정 발견
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  엘레나의 나이가 12화(18세)와 45화(20세)에서
                  불일치. 작품 내 시간 경과는 3개월.
                </p>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  수정하기
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm text-foreground mb-1">
                  2차 창작 활용 제안
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  "그림자 왕국"의 정치 체계는 게임/드라마 각색에
                  적합합니다. 권력 구조를 상세화하면 더
                  좋습니다.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  AI 초안 생성
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <Tabs
            value={settingsCategory}
            onValueChange={setSettingsCategory}
          >
            <div className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
              <TabsList className="bg-transparent flex flex-wrap gap-1 sm:gap-2">
                <TabsTrigger
                  value="characters"
                  className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 px-6"
                >
                  <UsersIcon className="w-4 h-4 mr-2" />
                  인물
                </TabsTrigger>
                <TabsTrigger
                  value="world"
                  className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 px-6"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  세계관
                </TabsTrigger>
                <TabsTrigger
                  value="narrative"
                  className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 px-6"
                >
                  <BookMarked className="w-4 h-4 mr-2" />
                  서사
                </TabsTrigger>
              </TabsList>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />새 항목 추가
                </Button>
              </div>
            </div>

            <div className="p-6">
              <TabsContent value="characters" className="mt-0">
                <CharactersContent />
              </TabsContent>

              <TabsContent value="world" className="mt-0">
                <WorldContent />
              </TabsContent>

              <TabsContent value="narrative" className="mt-0">
                <NarrativeContent />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}

// Characters Content
function CharactersContent() {
  return (
    <div className="space-y-6">
      {/* Category Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm text-foreground mb-1">
              인물 설정 가이드
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>포함 내용:</strong> 주/조연 프로필, 인물
              관계도, 핵심 욕망
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>2차 창작 활용:</strong> 캐스팅, 캐릭터
              굿즈, 스핀오프 주인공 선정
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-3xl overflow-hidden">
                  👤
                </div>
                <Badge className="bg-blue-600 text-white text-[11px] sm:text-xs px-2 py-0.5">
                  주인공
                </Badge>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm sm:text-base text-foreground">
                      엘레나 쉐도우본
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      나이:
                    </span>
                    <span className="ml-2 text-foreground">
                      18세
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      출신:
                    </span>
                    <span className="ml-2 text-foreground">
                      그림자 왕국
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      직업:
                    </span>
                    <span className="ml-2 text-foreground">
                      암살자
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      핵심 욕망:
                    </span>
                    <span className="ml-2 text-foreground">
                      정체성 찾기
                    </span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  그림자 조작 마법에 능숙하며, 점차 자신의 소속과
                  정체성에 대해 고민하기 시작한다.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-3xl overflow-hidden">
                  🧙
                </div>
                <Badge
                  variant="outline"
                  className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 text-[11px] sm:text-xs px-2 py-0.5"
                >
                  멘토
                </Badge>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm sm:text-base text-foreground">
                      마스터 루미나스
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      나이:
                    </span>
                    <span className="ml-2 text-foreground">
                      65세
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      출신:
                    </span>
                    <span className="ml-2 text-foreground">
                      빛의 연합
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      직업:
                    </span>
                    <span className="ml-2 text-foreground">
                      대마법사
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      핵심 욕망:
                    </span>
                    <span className="ml-2 text-foreground">
                      평화 수호
                    </span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  지혜롭고 자비로운 빛의 마법사. 엘레나의
                  잠재력을 알아보고 편견을 넘어 그녀를 지도하려
                  한다.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// World Content
function WorldContent() {
  return (
    <div className="space-y-6">
      {/* Category Info */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <h4 className="text-sm text-foreground mb-1">
              세계관 설정 가이드
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>포함 내용:</strong> 시간(연표),
              공간(지리), 시스템(규칙)
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>2차 창작 활용:</strong> CG/세트장 설계,
              게임 밸런스, 설정 오류 검토
            </p>
          </div>
        </div>
      </div>

      {/* World Settings */}
      <div className="space-y-4">
        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg text-foreground">
                그림자 왕국
              </h4>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-muted-foreground mb-1">
                    시간 (연표)
                  </div>
                  <div className="text-foreground">
                    건국 300년, 현재 그림자력 1223년
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    공간 (지리)
                  </div>
                  <div className="text-foreground">
                    대륙 북부, 에레보스 산맥 너머
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    시스템 (규칙)
                  </div>
                  <div className="text-foreground">
                    절대 군주제, 그림자 마법 중심
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="text-muted-foreground leading-relaxed">
                  영원한 황혼에 잠긴 왕국. 300년 전 대마법사
                  카엘루스가 태양을 봉인하고 건국했다. 그림자
                  마법이 발달했으며 빛의 마법은 금지되어 있다.
                  수도는 검은 화산암으로 지어진 옵시디언 성채.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg text-foreground">
                빛의 연합
              </h4>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-muted-foreground mb-1">
                    시간 (연표)
                  </div>
                  <div className="text-foreground">
                    연합 결성 200년
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    공간 (지리)
                  </div>
                  <div className="text-foreground">
                    대륙 남부, 크리스탈 평원
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    시스템 (규칙)
                  </div>
                  <div className="text-foreground">
                    연방제, 5개 도시국가 연합
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                  <div className="text-muted-foreground leading-relaxed">
                    그림자 왕국에 대항하기 위해 결성된 연합. 빛의
                    마법을 수호하며, 태양 신전을 중심으로 종교와
                    정치가 밀접하게 연결되어 있다.
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Narrative Content
function NarrativeContent() {
  return (
    <div className="space-y-6">
      {/* Category Info */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BookMarked className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <h4 className="text-sm text-foreground mb-1">
              서사 설정 가이드
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>포함 내용:</strong> 주요 사건 흐름, 미회수
              복선, 핵심 명장면
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>2차 창작 활용:</strong> 시나리오 각색,
              회차별 구성, 애니메이션 콘티
            </p>
          </div>
        </div>
      </div>

      {/* Narrative Settings */}
      <div className="space-y-4">
        {/* Main Story Arc */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground">
                주요 사건 흐름
              </CardTitle>
              <Button size="sm" variant="ghost">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    1
                  </div>
                  <div className="w-0.5 h-full bg-green-200 dark:bg-green-800 mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-sm text-foreground">
                      암살자의 임무
                    </h5>
                    <Badge
                      variant="outline"
                      className="border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 text-xs"
                    >
                      1-10화
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    엘레나가 그림자 군주로부터 침투 임무를 받고
                    준비
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    2
                  </div>
                  <div className="w-0.5 h-full bg-green-200 dark:bg-green-800 mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-sm text-foreground">
                      빛의 연합 침투
                    </h5>
                    <Badge
                      variant="outline"
                      className="border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 text-xs"
                    >
                      11-25화
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    루미나스와의 만남, 예상 밖의 환대에 혼란
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    3
                  </div>
                  <div className="w-0.5 h-full bg-blue-200 dark:bg-blue-800 mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-sm text-foreground">
                      정체성의 혼란
                    </h5>
                    <Badge className="bg-blue-500 text-white text-xs">
                      26-47화 (진행중)
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    자신의 소속과 신념에 대해 깊이 고민
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-sm text-foreground">
                      진실의 발견
                    </h5>
                    <Badge
                      variant="outline"
                      className="border-border text-muted-foreground text-xs"
                    >
                      48-60화 (예정)
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    그림자 왕국의 숨겨진 비밀과 최종 선택
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Foreshadowing */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground">
                미회수 복선
              </CardTitle>
              <Button size="sm" variant="ghost">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-foreground mb-1">
                    엘레나의 어머니
                  </div>
                  <div className="text-sm text-muted-foreground">
                    3화에서 언급된 엘레나 어머니의 정체. 빛의
                    연합과 관련 암시
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-foreground mb-1">
                    그림자 단검의 저주
                  </div>
                  <div className="text-sm text-muted-foreground">
                    12화에서 루미나스가 경고한 단검의 부작용.
                    아직 미발현
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Scenes */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground">
                핵심 명장면
              </CardTitle>
              <Button size="sm" variant="ghost">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-foreground">
                    첫 만남 (15화)
                  </div>
                  <Badge
                    variant="outline"
                    className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 text-xs"
                  >
                    감정적 전환점
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  엘레나와 루미나스가 처음 마주치는 장면. 긴장감
                  속에서 예상치 못한 따뜻함.
                </div>
              </div>

              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-foreground">
                    그림자 각성 (32화)
                  </div>
                  <Badge
                    variant="outline"
                    className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-xs"
                  >
                    액션 하이라이트
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  엘레나가 진정한 그림자의 힘을 각성하는 전투
                  장면. 시각적 연출 포인트.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Author Notice Tab
function AuthorNoticeTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg text-foreground font-semibold">
              전체 공지사항
            </h2>
            <p className="text-sm text-muted-foreground">
              총 25개의 공지사항
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[
              {
                title: "Lorem ipsum dolor sit amet consectetur",
                date: "2026.01.08",
                isNew: true,
                desc: "Consectetur adipiscing elit sed do eiusmod tempor.",
              },
              {
                title: "Sed do eiusmod tempor incididunt",
                date: "2026.01.08",
                isNew: true,
                desc: "Ut labore et dolore magna aliqua enim ad minim.",
              },
              {
                title: "Ut enim ad minim veniam quis nostrud",
                date: "2026.01.08",
                isNew: true,
                desc: "Exercitation ullamco laboris nisi ut aliquip.",
              },
              {
                title: "Duis aute irure dolor in reprehenderit",
                date: "2025.12.24",
                isNew: false,
                desc: "Voluptate velit esse cillum dolore eu fugiat.",
              },
              {
                title: "Excepteur sint occaecat cupidatat",
                date: "2025.12.23",
                isNew: false,
                desc: "Non proident sunt in culpa qui officia deserunt.",
              },
            ].map((notice, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-5 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base text-foreground">
                      {notice.title}
                    </span>
                    {notice.isNew && (
                      <Badge className="bg-orange-500 text-white text-xs">
                        N
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notice.desc}
                  </p>
                </div>
                <div className="ml-6 text-right">
                  <div className="text-sm text-foreground">
                    {notice.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Author MyPage Tab
function AuthorMyPageTab() {
  return (
    <div className="max-w-4xl space-y-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">
            프로필 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
              김
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  이름
                </label>
                <Input
                  defaultValue="김민지"
                  className="max-w-sm"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  이메일
                </label>
                <Input
                  defaultValue="author@example.com"
                  className="max-w-sm"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  역할
                </label>
                <div className="text-foreground">작가</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">
            작품 통계
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                진행 중인 작품
              </div>
              <div className="text-3xl text-foreground font-bold">
                3
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                완결 작품
              </div>
              <div className="text-3xl text-foreground font-bold">
                2
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                생성된 설정집
              </div>
              <div className="text-3xl text-foreground font-bold">
                5
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          프로필 업데이트
        </Button>
        <Button variant="outline" className="border-border">
          비밀번호 변경
        </Button>
      </div>
    </div>
  );
}

// Author Account Settings Tab
function AuthorAccountSettingsTab() {
  return (
    <div className="max-w-4xl">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">
            계정 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm text-foreground mb-4">
                알림 설정
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    설정집 생성 완료 알림
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    AI 분석 완료 알림
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    새 공지사항 알림
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-primary"
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h4 className="text-sm text-foreground mb-4">
                개인정보 설정
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    작품 공개 여부
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    프로필 공개 여부
                  </span>
                  <input type="checkbox" className="w-4 h-4 accent-primary" />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
