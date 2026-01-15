import {
  Brain,
  LayoutDashboard,
  Database,
  TrendingUp,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Users,
  Zap,
  BarChart3,
  Activity,
  FileText,
  Grid3x3,
  List,
  Filter,
  ArrowUpDown,
  Film,
  Tv,
  Play,
  Sparkles,
  Plus,
  X,
  Check,
  AlertCircle,
  Globe,
  BookMarked,
  Users as UsersIcon,
  User,
  Megaphone,
  ChevronRight,
  ChevronsLeft,
  Award,
  Menu,
  X as CloseIcon,
  History,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useState } from "react";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

interface ManagerDashboardProps {
  onLogout: () => void;
  onHome?: () => void;
}

export function ManagerDashboard({
  onLogout,
  onHome,
}: ManagerDashboardProps) {
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
    <div className="flex h-screen bg-background" data-role="manager">
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

        <div className="p-6 border-b border-sidebar-border">
          <button
            onClick={onHome}
            className="flex items-center gap-3 w-full text-left hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
            aria-label="홈으로 이동"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--role-primary)' }}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sidebar-foreground font-semibold">
                IPSUM
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--role-primary)' }}>
                운영자 포털
              </div>
            </div>
          </button>
        </div>

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
            onClick={() => handleMenuClick("ip-expansion")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "ip-expansion"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "ip-expansion" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">IP 확장</span>
          </button>

          <button
            onClick={() => handleMenuClick("3d-assets")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "3d-assets"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "3d-assets" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="text-sm font-medium">
              3D 배경 에셋
            </span>
          </button>

          <button
            onClick={() => handleMenuClick("work-analysis")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "work-analysis"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "work-analysis" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">
              작품 분석
            </span>
          </button>

          <button
            onClick={() => handleMenuClick("ip-trend-analysis")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "ip-trend-analysis"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "ip-trend-analysis" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">
              IP 트렌드 분석
            </span>
          </button>

          <button
            onClick={() => handleMenuClick("contest-templates")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "contest-templates"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "contest-templates" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">
              공모전 템플릿
            </span>
          </button>

          <button
            onClick={() => handleMenuClick("author-management")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "author-management"
                ? "text-white dark:text-black"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "author-management" ? { backgroundColor: 'var(--role-primary)' } : {}}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">작가</span>
          </button>

          <button
            onClick={() => handleMenuClick("notice")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeMenu === "notice"
                ? "text-white"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            style={activeMenu === "notice" ? { backgroundColor: 'var(--role-primary)' } : {}}
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white dark:text-black text-sm" style={{ backgroundColor: 'var(--role-primary)' }}>
                김
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm text-sidebar-foreground truncate">
                  김민수
                </div>
                <div className="text-xs text-muted-foreground">PD</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? "rotate-180" : ""}`}
              />
            </button>

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
                    handleMenuClick("settings");
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--role-primary)' }}>
                김
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sidebar-foreground font-medium">
                  김민수
                </div>
                <div className="text-xs text-muted-foreground">PD</div>
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
              onClick={() => handleMenuClick("settings")}
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
          <div className={`flex items-center justify-between ${!sidebarOpen ? 'ml-16' : ''}`}>
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">홈</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  {activeMenu === "home" && "대시보드"}
                  {activeMenu === "work-analysis" &&
                    "작품 분석"}
                  {activeMenu === "3d-assets" && "3D 배경 에셋"}
                  {activeMenu === "ip-trend-analysis" &&
                    "IP 트렌드 분석"}
                  {activeMenu === "ip-expansion" && "IP 확장"}
                  {activeMenu === "author-management" && "작가"}
                  {activeMenu === "contest-templates" &&
                    "공모전 템플릿"}
                  {activeMenu === "notice" && "공지사항"}
                  {activeMenu === "mypage" && "마이페이지"}
                  {activeMenu === "settings" && "설정"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() =>
                    setShowActivityDropdown(
                      !showActivityDropdown,
                    )
                  }
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
                    <div className="max-h-[60vh] overflow-auto">
                      <div className="p-2.5 sm:p-3 hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm text-foreground">
                              새 설정집 등록
                            </div>
                            <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                              "암흑의 영역 연대기" - 김민지 작가
                            </div>
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            5분 전
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm text-foreground">
                              스핀오프 초안 생성 완료
                            </div>
                            <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                              "별빛 아카데미: 사이드 스토리"
                            </div>
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            15분 전
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm text-foreground">
                              영화 각색 제안 승인
                            </div>
                            <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                              "운명의 검" 극장용 각색
                            </div>
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            1시간 전
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm text-foreground">
                              새 작가 등록
                            </div>
                            <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                              이재원 작가 가입 승인
                            </div>
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">
                            2시간 전
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
          {activeMenu === "home" && <HomeScreen />}
          {activeMenu === "work-analysis" && (
            <WorkAnalysisScreen />
          )}
          {activeMenu === "3d-assets" && <ThreeDAssetsScreen />}
          {activeMenu === "notice" && <NoticeScreen />}
          {activeMenu === "ip-trend-analysis" && (
            <IPTrendAnalysisScreen />
          )}
          {activeMenu === "ip-expansion" && (
            <IPExpansionScreen />
          )}
          {activeMenu === "author-management" && (
            <AuthorManagementScreen />
          )}
          {activeMenu === "contest-templates" && (
            <ContestTemplatesScreen />
          )}
          {activeMenu === "mypage" && <MyPageScreen />}
          {activeMenu === "settings" && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}

// Home Screen
function HomeScreen() {
  const contests = [
    {
      id: "1",
      title: "Lorem Ipsum Writing Contest 2026",
      organizer: "Lorem Foundation",
      deadline: "2026.03.31",
      category: "Fantasy",
    },
    {
      id: "2",
      title: "Dolor Sit Amet Literary Award",
      organizer: "Dolor Association",
      deadline: "2026.04.15",
      category: "SF",
    },
    {
      id: "3",
      title: "Consectetur Adipiscing Novel Prize",
      organizer: "Adipiscing Institute",
      deadline: "2026.05.20",
      category: "Romance",
    },
    {
      id: "4",
      title: "Sed Do Eiusmod Fiction Contest",
      organizer: "Eiusmod Society",
      deadline: "2026.06.10",
      category: "Mystery",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 2 Column Grid: Notice & Contests - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notice Section */}
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
              >
                <Plus className="w-5 h-5" />
              </Button>
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
                      Sed do eiusmod tempor incididunt ut labore
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
                      Ut enim ad minim veniam quis nostrud
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

              <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <span className="text-sm text-foreground">
                    Excepteur sint occaecat cupidatat
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  2025.12.23
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contest Section */}
        <Card className="border-border">
          <CardHeader className="border-b border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-foreground truncate">
                  공모전
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 h-8 w-8 flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {contests.map((contest) => (
                <div
                  key={contest.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm text-foreground font-medium mb-1">
                        {contest.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contest.organizer}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 text-xs"
                    >
                      {contest.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      마감: {contest.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Work Analysis Screen
function WorkAnalysisScreen() {
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    "grid",
  );
  const [filterBy, setFilterBy] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedWork, setSelectedWork] = useState<any>(null);

  const works = [
    {
      id: 1,
      title: "암흑의 영역 연대기",
      author: "김민지",
      category: "인물",
      genre: "판타지",
      gradient: "from-slate-700 to-slate-900",
    },
    {
      id: 2,
      title: "운명의 검",
      author: "이재원",
      category: "서사",
      genre: "무협",
      gradient: "from-purple-700 to-purple-900",
    },
    {
      id: 3,
      title: "별빛 아카데미",
      author: "박수진",
      category: "세계관",
      genre: "학원",
      gradient: "from-blue-700 to-blue-900",
    },
    {
      id: 4,
      title: "시간의 문",
      author: "최현우",
      category: "서사",
      genre: "SF",
      gradient: "from-green-700 to-green-900",
    },
    {
      id: 5,
      title: "마법 학원",
      author: "정서연",
      category: "인물",
      genre: "판타지",
      gradient: "from-orange-700 to-orange-900",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="작품명, 작가명 검색..."
              className="pl-10 w-full sm:w-64 md:w-80"
            />
          </div>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white flex-1 sm:flex-initial"
          >
            <option value="all">전체 보기</option>
            <option value="author">작가별</option>
            <option value="genre">장르별</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white flex-1 sm:flex-initial"
          >
            <option value="all">전체 카테고리</option>
            <option value="characters">인물</option>
            <option value="world">세계관</option>
            <option value="narrative">서사</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 flex-1 sm:flex-initial"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            최신순
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1 sm:flex-initial">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">AI 작품 분석</span>
            <span className="sm:hidden">분석</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {works.map((work) => (
            <Card
              key={work.id}
              className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedWork(work)}
            >
              <CardContent className="p-3">
                <div
                  className={`aspect-[4/3] bg-gradient-to-br ${work.gradient} rounded-lg mb-2 flex items-center justify-center`}
                >
                  <FileText className="w-8 h-8 text-white opacity-80" />
                </div>
                <div className="text-sm text-slate-900 mb-1 truncate">
                  {work.title}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  {work.author}
                </div>
                <div className="flex gap-1">
                  <Badge
                    className={`${
                      work.category === "인물"
                        ? "bg-blue-500"
                        : work.category === "세계관"
                          ? "bg-green-500"
                          : "bg-purple-500"
                    } text-white text-xs`}
                  >
                    {work.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Work Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-slate-900 font-semibold">
                  {selectedWork.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedWork.author} · {selectedWork.genre}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedWork(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Category Badge */}
              <div>
                <Badge
                  className={`${
                    selectedWork.category === "인물"
                      ? "bg-blue-500"
                      : selectedWork.category === "세계관"
                        ? "bg-green-500"
                        : "bg-purple-500"
                  } text-white`}
                >
                  {selectedWork.category}
                </Badge>
              </div>

              {/* Work Info */}
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-base text-slate-900">
                    작품 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">
                        장르
                      </div>
                      <div className="text-sm text-slate-900">
                        {selectedWork.genre}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">
                        카테고리
                      </div>
                      <div className="text-sm text-slate-900">
                        {selectedWork.category}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">
                        등록일
                      </div>
                      <div className="text-sm text-slate-900">
                        2024.01.15
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">
                        상태
                      </div>
                      <Badge className="bg-green-500 text-white">
                        분석 완료
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Preview */}
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-base text-slate-900">
                    설정집 미리보기
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-900 mb-2">
                        주요 인물
                      </div>
                      <div className="text-sm text-slate-600">
                        엘레나, 루미나스, 다크로드 등 15명의
                        캐릭터가 분석되었습니다.
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-900 mb-2">
                        세계관 설정
                      </div>
                      <div className="text-sm text-slate-600">
                        중세 판타지 세계관, 마법 체계, 7개
                        왕국의 정치 구조 등이 포함되어 있습니다.
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-900 mb-2">
                        서사 구조
                      </div>
                      <div className="text-sm text-slate-600">
                        3막 구조, 주요 갈등 요소, 클라이맥스
                        분석이 완료되었습니다.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI 분석 결과
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      장르 적합도
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: "92%" }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-900 font-semibold">
                        92%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      IP 확장 가능성
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: "88%" }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-900 font-semibold">
                        88%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      캐릭터 완성도
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-900 font-semibold">
                        85%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// IP Trend Analysis Screen
function IPTrendAnalysisScreen() {
  return (
    <div className="space-y-6">
      {/* Popular Genres */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            인기 장르 순위
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    판타지
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +24%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    로맨스
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +18%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    무협
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +15%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "78%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    현대 판타지
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +12%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    SF
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +8%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Works Ranking */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            작품 순위 (조회수 기준)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              {
                rank: 1,
                title: "암흑의 영역 연대기",
                author: "김민지",
                views: "1,254,892",
                change: "+15%",
                color: "from-blue-500 to-blue-600",
              },
              {
                rank: 2,
                title: "별빛 아카데미",
                author: "박수진",
                views: "1,128,456",
                change: "+22%",
                color: "from-purple-500 to-purple-600",
              },
              {
                rank: 3,
                title: "운명의 검",
                author: "이재원",
                views: "987,234",
                change: "+8%",
                color: "from-green-500 to-green-600",
              },
              {
                rank: 4,
                title: "시간의 문",
                author: "최현우",
                views: "856,123",
                change: "+12%",
                color: "from-orange-500 to-orange-600",
              },
              {
                rank: 5,
                title: "마법 학원",
                author: "정서연",
                views: "745,892",
                change: "+18%",
                color: "from-red-500 to-red-600",
              },
            ].map((work) => (
              <div
                key={work.rank}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${work.color} rounded-lg flex items-center justify-center text-white font-bold`}
                >
                  {work.rank}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    {work.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {work.author}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {work.views}
                  </div>
                  <div className="text-xs text-green-600">
                    {work.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  급상승 키워드
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  다크 판타지, 회귀물, 먼치킨
                </p>
                <Badge className="bg-blue-500 text-white text-xs">
                  HOT
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  IP 확장 트렌드
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  웹툰 → 드라마 전환율 상승
                </p>
                <Badge className="bg-purple-500 text-white text-xs">
                  +32%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  글로벌 시장
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  북미 판타지 수요 증가
                </p>
                <Badge className="bg-green-500 text-white text-xs">
                  +45%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// IP Expansion Screen
function IPExpansionScreen() {
  const [showCreateDialog, setShowCreateDialog] =
    useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    "grid",
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="원작명, 작가명 검색..."
              className="pl-10 w-full sm:w-72 md:w-80"
            />
          </div>

          <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white flex-1 sm:flex-initial">
            <option value="all">전체 카테고리</option>
            <option value="movie">영화</option>
            <option value="drama">드라마</option>
            <option value="animation">애니메이션</option>
            <option value="spinoff">스핀오프</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 flex-1 sm:flex-initial"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            최신순
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full justify-end md:w-auto">
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            2차 창작 제안 생성
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-3">
            <div className="aspect-[4/3] bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-2 flex items-center justify-center">
              <Film className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                <Film className="w-3 h-3 text-white" />
              </div>
              <Badge className="bg-red-500 text-white text-xs">
                영화
              </Badge>
            </div>
            <div className="text-sm text-slate-900 mb-1 truncate">
              암흑의 영역 - 극장판
            </div>
            <div className="text-xs text-slate-500">
              원작: 암흑의 영역 연대기
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-3">
            <div className="aspect-[4/3] bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg mb-2 flex items-center justify-center">
              <Tv className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                <Tv className="w-3 h-3 text-white" />
              </div>
              <Badge className="bg-yellow-600 text-white text-xs">
                드라마
              </Badge>
            </div>
            <div className="text-sm text-slate-900 mb-1 truncate">
              운명의 검 시즌 1
            </div>
            <div className="text-xs text-slate-500">
              원작: 운명의 검
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-3">
            <div className="aspect-[4/3] bg-gradient-to-br from-green-500 to-green-600 rounded-lg mb-2 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
              <Badge className="bg-green-600 text-white text-xs">
                애니메이션
              </Badge>
            </div>
            <div className="text-sm text-slate-900 mb-1 truncate">
              별빛 아카데미 애니
            </div>
            <div className="text-xs text-slate-500">
              원작: 별빛 아카데미
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-3">
            <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mb-2 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <Badge className="bg-purple-600 text-white text-xs">
                스핀오프
              </Badge>
            </div>
            <div className="text-sm text-slate-900 mb-1 truncate">
              엘레나 외전
            </div>
            <div className="text-xs text-slate-500">
              원작: 암흑의 영역 연대기
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-4">
            <div className="aspect-[4/3] bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-3 flex items-center justify-center">
              <Film className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                <Film className="w-3 h-3 text-white" />
              </div>
              <Badge className="bg-red-500 text-white text-xs">
                영화
              </Badge>
            </div>
            <div className="text-sm text-slate-900 mb-1 truncate">
              마법 학원: 기원
            </div>
            <div className="text-xs text-slate-500">
              원작: 마법 학원
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateIPExpansionDialog
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
}

// Create IP Expansion Dialog
function CreateIPExpansionDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Confirmed, setStep1Confirmed] = useState(false);
  const [step2Confirmed, setStep2Confirmed] = useState(false);
  const [step3Confirmed, setStep3Confirmed] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState<
    string[]
  >([]);
  const [selectedIPType, setSelectedIPType] = useState("");
  const [showFinalConfirm, setShowFinalConfirm] =
    useState(false);

  const canProceed = () => {
    if (currentStep === 1)
      return step1Confirmed && selectedSettings.length > 0;
    if (currentStep === 2)
      return step2Confirmed && selectedIPType !== "";
    if (currentStep === 3) return step3Confirmed;
    return false;
  };

  const handleGenerate = () => {
    setShowFinalConfirm(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-slate-900 font-semibold">
                2차 창작 제안 생성
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 ${currentStep >= 1 ? "text-blue-600" : "text-slate-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200"}`}
                >
                  1
                </div>
                <span className="text-sm font-medium">
                  설정집 선택
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div
                className={`flex items-center gap-2 ${currentStep >= 2 ? "text-blue-600" : "text-slate-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-200"}`}
                >
                  2
                </div>
                <span className="text-sm font-medium">
                  IP 분야 선택
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div
                className={`flex items-center gap-2 ${currentStep >= 3 ? "text-blue-600" : "text-slate-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-200"}`}
                >
                  3
                </div>
                <span className="text-sm font-medium">
                  세부 옵션
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Step 1: 설정집 선택 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg text-slate-900 mb-4">
                    설정집 선택 (다중 선택 가능)
                  </h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="설정집 검색..."
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "암흑의 영역 연대기",
                      "운명의 검",
                      "별빛 아카데미",
                      "시간의 문",
                      "마법 학원",
                    ].map((setting) => (
                      <Card
                        key={setting}
                        className={`cursor-pointer transition-all ${
                          selectedSettings.includes(setting)
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => {
                          if (
                            selectedSettings.includes(setting)
                          ) {
                            setSelectedSettings(
                              selectedSettings.filter(
                                (s) => s !== setting,
                              ),
                            );
                          } else {
                            setSelectedSettings([
                              ...selectedSettings,
                              setting,
                            ]);
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg mb-3 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-sm text-slate-900 mb-2">
                            {setting}
                          </div>
                          <div className="flex gap-1">
                            <Badge className="bg-blue-500 text-white text-xs">
                              인물
                            </Badge>
                            <Badge className="bg-green-500 text-white text-xs">
                              세계관
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    checked={step1Confirmed}
                    onChange={(e) =>
                      setStep1Confirmed(e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-slate-700">
                    선택한 설정집이 맞습니다
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: IP 분야 선택 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg text-slate-900 mb-4">
                    IP 확장 분야 선택
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedIPType === "movie"
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedIPType("movie")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                            <Film className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-lg text-slate-900 mb-1">
                              영화
                            </div>
                            <div className="text-sm text-slate-500">
                              극장용 영화 각색
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedIPType === "drama"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedIPType("drama")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                            <Tv className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-lg text-slate-900 mb-1">
                              드라마 시리즈
                            </div>
                            <div className="text-sm text-slate-500">
                              TV 드라마 각색
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedIPType === "animation"
                          ? "border-green-500 bg-green-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() =>
                        setSelectedIPType("animation")
                      }
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-lg text-slate-900 mb-1">
                              애니메이션
                            </div>
                            <div className="text-sm text-slate-500">
                              애니메이션 시리즈
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedIPType === "spinoff"
                          ? "border-purple-500 bg-purple-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() =>
                        setSelectedIPType("spinoff")
                      }
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-lg text-slate-900 mb-1">
                              스핀오프
                            </div>
                            <div className="text-sm text-slate-500">
                              외전 및 파생 작품
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    checked={step2Confirmed}
                    onChange={(e) =>
                      setStep2Confirmed(e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-slate-700">
                    선택한 IP 분야가 맞습니다
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: 세부 옵션 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg text-slate-900 mb-4">
                    세부 옵션 설정
                  </h3>

                  {selectedIPType === "movie" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">
                          영화 길이
                        </label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                          <option>90분 (단편)</option>
                          <option>120분 (일반)</option>
                          <option>150분 (장편)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedIPType === "drama" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">
                          시즌 구성
                        </label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                          <option>1시즌 (8부작)</option>
                          <option>1시즌 (12부작)</option>
                          <option>1시즌 (16부작)</option>
                          <option>다시즌 (2시즌 이상)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedIPType === "animation" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">
                          회차 수
                        </label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                          <option>12회 (1쿨)</option>
                          <option>24회 (2쿨)</option>
                          <option>48회 (4쿨)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedIPType === "spinoff" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">
                          스핀오프 유형
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-slate-700">
                              인물 다중 설정
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              disabled={
                                selectedSettings.length < 2
                              }
                            />
                            <span className="text-sm text-slate-700">
                              세계관 통합{" "}
                              {selectedSettings.length < 2 &&
                                "(2개 이상 선택 필요)"}
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-slate-700">
                              옴니버스
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-slate-700">
                              평행세계
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-slate-700 mb-2 block">
                      필수 제약사항 (선택사항)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none"
                      rows={4}
                      placeholder="AI 생성 시 반드시 고려해야 할 제약사항을 입력하세요..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    checked={step3Confirmed}
                    onChange={(e) =>
                      setStep3Confirmed(e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-slate-700">
                    세부 옵션 설정이 완료되었습니다
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep > 1)
                  setCurrentStep(currentStep - 1);
                else onClose();
              }}
            >
              {currentStep === 1 ? "취소" : "이전"}
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 3 ? (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!canProceed()}
                  onClick={() =>
                    setCurrentStep(currentStep + 1)
                  }
                >
                  다음
                </Button>
              ) : (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={!canProceed()}
                  onClick={handleGenerate}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 가이드라인 초안 생성
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Final Confirmation Modal */}
      {showFinalConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-slate-900">
                최종 확인
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-600 mb-2">
                    선택한 설정집
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSettings.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="border-blue-300 text-blue-700"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-2">
                    IP 확장 분야
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {selectedIPType === "movie" && "영화"}
                    {selectedIPType === "drama" &&
                      "드라마 시리즈"}
                    {selectedIPType === "animation" &&
                      "애니메이션"}
                    {selectedIPType === "spinoff" && "스핀오프"}
                  </Badge>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-slate-700">
                      AI 가이드라인 초안 생성은 약 2-3분
                      소요됩니다. 생성을 시작하시겠습니까?
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFinalConfirm(false)}
              >
                취소
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  // Generate logic here
                  setShowFinalConfirm(false);
                  onClose();
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                생성 시작
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

// Author Management Screen
function AuthorManagementScreen() {
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    "grid",
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="작가명 검색..."
              className="pl-10 w-full sm:w-72 md:w-80"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 flex-1 sm:flex-initial"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            이름순
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full justify-end md:w-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            "김민지",
            "이재원",
            "박수진",
            "최현우",
            "정서연",
            "한지수",
            "송민호",
            "윤아름",
          ].map((name, idx) => (
            <Card
              key={name}
              className="border-slate-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            >
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white text-lg sm:text-xl">
                  {name[0]}
                </div>
                <div className="text-sm text-slate-900 mb-2">
                  {name}
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  {idx + 3}개 작품
                </div>
                <Badge
                  variant="outline"
                  className="border-green-300 text-green-600 text-xs"
                >
                  활성
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {/* Desktop Table View */}
          <Card className="border-slate-200 hidden md:block">
            <CardContent className="p-0">
              <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-sm text-slate-600 px-6 py-4">
                    작가
                  </th>
                  <th className="text-left text-sm text-slate-600 px-6 py-4">
                    작품 수
                  </th>
                  <th className="text-left text-sm text-slate-600 px-6 py-4">
                    가입일
                  </th>
                  <th className="text-left text-sm text-slate-600 px-6 py-4">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {["김민지", "이재원", "박수진", "최현우"].map(
                  (name, idx) => (
                    <tr
                      key={name}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                            {name[0]}
                          </div>
                          <span className="text-sm text-slate-900">
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {idx + 3}개
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        2023.0{idx + 1}.15
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="border-green-300 text-green-600 text-xs"
                        >
                          활성
                        </Badge>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {["김민지", "이재원", "박수진", "최현우"].map(
            (name, idx) => (
              <Card key={name} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                      {name[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {name}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">작품 수</span>
                      <span className="text-slate-900">{idx + 3}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">가입일</span>
                      <span className="text-slate-900">2023.0{idx + 1}.15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">상태</span>
                      <Badge
                        variant="outline"
                        className="border-green-300 text-green-600 text-xs"
                      >
                        활성
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
        </>
      )}
    </div>
  );
}

// 3D Background Assets Screen
function ThreeDAssetsScreen() {
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    "grid",
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="에셋명, 카테고리 검색..."
              className="pl-10 w-full sm:w-72 md:w-80"
            />
          </div>

          <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white flex-1 sm:flex-initial">
            <option value="all">전체 카테고리</option>
            <option value="interior">실내</option>
            <option value="exterior">실외</option>
            <option value="fantasy">판타지</option>
            <option value="modern">현대</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 flex-1 sm:flex-initial"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            최신순
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full justify-end md:w-auto">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />새 에셋 업로드
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-3">
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg mb-2 flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 text-white opacity-50" />
              </div>
              <div className="text-sm text-slate-900 mb-1 truncate">
                판타지 성 내부
              </div>
              <div className="text-xs text-slate-500 mb-2">
                실내 · 판타지
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500 text-white text-xs">
                  승인됨
                </Badge>
                <span className="text-xs text-slate-400">
                  2024.01.15
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-3">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg mb-2 flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 text-white opacity-50" />
              </div>
              <div className="text-sm text-slate-900 mb-1 truncate">
                현대 도시 거리
              </div>
              <div className="text-xs text-slate-500 mb-2">
                실외 · 현대
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500 text-white text-xs">
                  승인됨
                </Badge>
                <span className="text-xs text-slate-400">
                  2024.01.14
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-3">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-700 to-purple-900 rounded-lg mb-2 flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 text-white opacity-50" />
              </div>
              <div className="text-sm text-slate-900 mb-1 truncate">
                마법 학원 교실
              </div>
              <div className="text-xs text-slate-500 mb-2">
                실내 · 판타지
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-yellow-500 text-white text-xs">
                  검토중
                </Badge>
                <span className="text-xs text-slate-400">
                  2024.01.13
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-3">
              <div className="aspect-[4/3] bg-gradient-to-br from-green-700 to-green-900 rounded-lg mb-2 flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 text-white opacity-50" />
              </div>
              <div className="text-sm text-slate-900 mb-1 truncate">
                중세 마을 광장
              </div>
              <div className="text-xs text-slate-500 mb-2">
                실외 · 판타지
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500 text-white text-xs">
                  승인됨
                </Badge>
                <span className="text-xs text-slate-400">
                  2024.01.12
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-3">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-700 to-orange-900 rounded-lg mb-2 flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 text-white opacity-50" />
              </div>
              <div className="text-sm text-slate-900 mb-1 truncate">
                미래 도시 전경
              </div>
              <div className="text-xs text-slate-500 mb-2">
                실외 · SF
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500 text-white text-xs">
                  승인됨
                </Badge>
                <span className="text-xs text-slate-400">
                  2024.01.11
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-3">
              <div className="aspect-[4/3] bg-gradient-to-br from-red-700 to-red-900 rounded-lg mb-2 flex items-center justify-center">
                <Grid3x3 className="w-8 h-8 text-white opacity-50" />
              </div>
              <div className="text-sm text-slate-900 mb-1 truncate">
                고급 레스토랑
              </div>
              <div className="text-xs text-slate-500 mb-2">
                실내 · 현대
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500 text-white text-xs">
                  승인됨
                </Badge>
                <span className="text-xs text-slate-400">
                  2024.01.10
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Notice Screen
function NoticeScreen() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg text-slate-900 font-semibold">
              전체 공지사항
            </h2>
            <p className="text-sm text-slate-500">
              총 25개의 공지사항
            </p>
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base text-slate-900">
                    Lorem ipsum dolor sit amet consectetur
                  </span>
                  <Badge className="bg-orange-500 text-white text-xs">
                    N
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Consectetur adipiscing elit sed do eiusmod
                  tempor incididunt ut labore.
                </p>
              </div>
              <div className="ml-6 text-right">
                <div className="text-sm text-slate-900 mb-1">
                  2026.01.08
                </div>
                <div className="text-xs text-slate-500">
                  Admin
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base text-slate-900">
                    Sed do eiusmod tempor incididunt
                  </span>
                  <Badge className="bg-orange-500 text-white text-xs">
                    N
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Ut labore et dolore magna aliqua enim ad minim
                  veniam quis nostrud.
                </p>
              </div>
              <div className="ml-6 text-right">
                <div className="text-sm text-slate-900 mb-1">
                  2026.01.08
                </div>
                <div className="text-xs text-slate-500">
                  Tech Team
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base text-slate-900">
                    Ut enim ad minim veniam quis nostrud
                  </span>
                  <Badge className="bg-orange-500 text-white text-xs">
                    N
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Exercitation ullamco laboris nisi ut aliquip
                  ex ea commodo consequat.
                </p>
              </div>
              <div className="ml-6 text-right">
                <div className="text-sm text-slate-900 mb-1">
                  2026.01.08
                </div>
                <div className="text-xs text-slate-500">
                  Education
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base text-slate-900">
                    Duis aute irure dolor in reprehenderit
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Voluptate velit esse cillum dolore eu fugiat
                  nulla pariatur.
                </p>
              </div>
              <div className="ml-6 text-right">
                <div className="text-sm text-slate-900 mb-1">
                  2025.12.24
                </div>
                <div className="text-xs text-slate-500">
                  Admin
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base text-slate-900">
                    Excepteur sint occaecat cupidatat
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Non proident sunt in culpa qui officia
                  deserunt mollit anim.
                </p>
              </div>
              <div className="ml-6 text-right">
                <div className="text-sm text-slate-900 mb-1">
                  2025.12.23
                </div>
                <div className="text-xs text-slate-500">
                  Admin
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base text-slate-900">
                    Laborum deserunt mollit anim id est
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Sed ut perspiciatis unde omnis iste natus
                  error sit voluptatem.
                </p>
              </div>
              <div className="ml-6 text-right">
                <div className="text-sm text-slate-900 mb-1">
                  2025.12.20
                </div>
                <div className="text-xs text-slate-500">
                  Admin
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300"
        >
          &lt;&lt;
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-blue-600"
        >
          1
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300"
        >
          2
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300"
        >
          3
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300"
        >
          &gt;&gt;
        </Button>
      </div>
    </div>
  );
}

// Contest Templates Screen
function ContestTemplatesScreen() {
  const [selectedContest, setSelectedContest] = useState<
    string | null
  >(null);

  const contests = [
    {
      id: "1",
      title: "Lorem Ipsum Writing Contest 2026",
      organizer: "Lorem Foundation",
      deadline: "2026.03.31",
      category: "Fantasy",
      prize: "$10,000",
    },
    {
      id: "2",
      title: "Dolor Sit Amet Literary Award",
      organizer: "Dolor Association",
      deadline: "2026.04.15",
      category: "SF",
      prize: "$8,000",
    },
    {
      id: "3",
      title: "Consectetur Adipiscing Novel Prize",
      organizer: "Adipiscing Institute",
      deadline: "2026.05.20",
      category: "Romance",
      prize: "$5,000",
    },
    {
      id: "4",
      title: "Sed Do Eiusmod Fiction Contest",
      organizer: "Eiusmod Society",
      deadline: "2026.06.10",
      category: "Mystery",
      prize: "$7,500",
    },
    {
      id: "5",
      title: "Tempor Incididunt Story Competition",
      organizer: "Tempor Organization",
      deadline: "2026.07.01",
      category: "Fantasy",
      prize: "$6,000",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg text-slate-900 font-semibold">
              공모전 게시판
            </h2>
            <p className="text-sm text-slate-500">
              공모전을 선택하고 AI 템플릿을 생성하세요
            </p>
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-sm text-slate-600 px-6 py-4">
                  공모전명
                </th>
                <th className="text-left text-sm text-slate-600 px-6 py-4">
                  주최
                </th>
                <th className="text-left text-sm text-slate-600 px-6 py-4">
                  장르
                </th>
                <th className="text-left text-sm text-slate-600 px-6 py-4">
                  마감일
                </th>
                <th className="text-left text-sm text-slate-600 px-6 py-4">
                  상금
                </th>
                <th className="text-left text-sm text-slate-600 px-6 py-4">
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest) => (
                <tr
                  key={contest.id}
                  className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${selectedContest === contest.id ? "bg-blue-50" : ""}`}
                  onClick={() => setSelectedContest(contest.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${selectedContest === contest.id ? "bg-blue-600" : "bg-slate-300"}`}
                      ></div>
                      <span className="text-sm text-slate-900 font-medium">
                        {contest.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {contest.organizer}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="border-purple-300 text-purple-600 text-xs"
                    >
                      {contest.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {contest.deadline}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                    {contest.prize}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContest(contest.id);
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI 템플릿 생성
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedContest}
        onOpenChange={(open) => {
          if (!open) setSelectedContest(null);
        }}
      >
        <DialogContent className="max-w-xl">
          {selectedContest && (
            <>
              <DialogHeader>
                <DialogTitle>선택된 공모전</DialogTitle>
                <DialogDescription>
                  공모전 정보를 확인하고 AI 템플릿을 생성하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">
                    공모전명
                  </div>
                  <div className="text-base text-slate-900 font-semibold">
                    {contests.find((c) => c.id === selectedContest)?.title}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      주최기관
                    </div>
                    <div className="text-sm text-slate-900">
                      {contests.find((c) => c.id === selectedContest)?.organizer}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      장르
                    </div>
                    <div className="text-sm text-slate-900">
                      {contests.find((c) => c.id === selectedContest)?.category}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      마감일
                    </div>
                    <div className="text-sm text-slate-900">
                      {contests.find((c) => c.id === selectedContest)?.deadline}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      상금
                    </div>
                    <div className="text-sm text-slate-900 font-semibold">
                      {contests.find((c) => c.id === selectedContest)?.prize}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  이 공모전에 맞는 설정집 템플릿을 AI가 자동으로 생성합니다.
                  생성된 템플릿은 작가들이 공모전에 참여할 때 참고용으로 사용할 수 있습니다.
                </p>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedContest(null)}
                >
                  닫기
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 템플릿 생성
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// MyPage Screen
function MyPageScreen() {
  return (
    <div className="max-w-4xl space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-slate-900">
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
                <label className="text-sm text-slate-500 mb-1 block">
                  이름
                </label>
                <Input
                  defaultValue="김민수"
                  className="max-w-sm"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1 block">
                  이메일
                </label>
                <Input
                  defaultValue="manager@example.com"
                  className="max-w-sm"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1 block">
                  역할
                </label>
                <div className="text-slate-900">PD</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-slate-900">
            활동 통계
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-500 mb-1">
                관리 중인 설정집
              </div>
              <div className="text-3xl text-slate-900 font-bold">
                247
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">
                승인한 IP 프로젝트
              </div>
              <div className="text-3xl text-slate-900 font-bold">
                43
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">
                관리 작가 수
              </div>
              <div className="text-3xl text-slate-900 font-bold">
                128
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          프로필 업데이트
        </Button>
        <Button variant="outline" className="border-slate-300">
          비밀번호 변경
        </Button>
      </div>
    </div>
  );
}

// Settings Screen
function SettingsScreen() {
  return (
    <div className="max-w-4xl">
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-slate-900">
            시스템 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm text-slate-900 mb-4">
                AI 설정
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    자동 설정집 추출
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    AI 분석 자동 실행
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-sm text-slate-900 mb-4">
                알림 설정
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    새 설정집 등록 알림
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    AI 생성 완료 알림
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
