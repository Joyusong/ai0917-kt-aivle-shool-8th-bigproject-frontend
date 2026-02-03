import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Label,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Loader2,
  Users,
  Sparkles,
  Film,
  Tv,
  Play,
  Zap,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { managerService } from '../../../services/managerService';
import { adminService } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';

interface ManagerHomeProps {
  onNavigate?: (menu: string) => void;
}

export function ManagerHome({ onNavigate }: ManagerHomeProps) {
  const navigate = useNavigate();

  // Notice State
  const [isNoticeDetailOpen, setIsNoticeDetailOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);

  // Project State
  const [recentProjects, setRecentProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('manager_ip_projects');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.reverse() : [];
    } catch {
      return [];
    }
  });
  const [allProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('manager_ip_projects');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectDetailTab, setProjectDetailTab] = useState<'summary' | 'roadmap' | 'assets'>('summary');

  // 초기 상태에서 로컬스토리지를 읽어 최근 프로젝트를 구성합니다.

  const handleNextProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentProjectIndex((prev) =>
      prev === recentProjects.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentProjectIndex((prev) =>
      prev === 0 ? recentProjects.length - 1 : prev - 1
    );
  };

  const currentProject = recentProjects[currentProjectIndex];
  const nonLaunchedCount = allProjects.filter((p) => p?.stageName !== '런칭').length;

  // Fetch Admin Dashboard Summary for System Overview
  const { data: systemSummary, isLoading: isSystemLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: adminService.getDashboardSummary,
  });

  // Fetch Linked Authors (for count and chart)
  const { data: linkedAuthorsData, isLoading: isLinkedAuthorsLoading } = useQuery({
    queryKey: ['manager', 'authors', 'linked', 'list'], // Changed key to reflect list
    queryFn: () => managerService.getAuthors({ linked: true, size: 100 }), // Fetch up to 100 for stats
  });

  // Calculate Chart Data
  const totalLinkedAuthors = linkedAuthorsData?.totalElements ?? 0;
  const linkedAuthorsList = linkedAuthorsData?.content ?? [];
  const activeLinkedAuthors = linkedAuthorsList.filter(
    (a) => a.status === 'ACTIVE'
  ).length;
  const inactiveLinkedAuthors = totalLinkedAuthors - activeLinkedAuthors;

  const pieChartData = [
    { name: '접속 중', value: activeLinkedAuthors, color: '#0ea5e9' }, // Sky-500
    { name: '미접속', value: inactiveLinkedAuthors, color: '#94a3b8' }, // Slate-400
  ];

  // Fetch Notices
  const { data: noticesData } = useQuery({
    queryKey: ['notices', 'latest'],
    queryFn: () => adminService.getNotices(0, 5),
  });

  const notices = noticesData?.content || [];

  // Handlers
  const handleNoticeClick = (notice: any) => {
    setSelectedNotice(notice);
    setIsNoticeDetailOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. 상단 현황 섹션 (작가 현황 & 파이차트 & 제안 대기) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 승인 대기 제안 (축소됨) */}
        <Card className="border-border shadow-sm col-span-1 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5 transition">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                승인 대기 제안
              </span>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {isSystemLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                nonLaunchedCount
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              검토가 필요한 제안서
            </div>
          </CardContent>
        </Card>

        {/* 작가 접속 현황 파이차트 */}
        <Card className="border-border shadow-sm col-span-1 md:col-span-2 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5 transition">
          <CardContent className="p-0 h-[140px] flex items-center justify-center relative">
            {isLinkedAuthorsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : totalLinkedAuthors > 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="60%"
                      innerRadius={32}
                      outerRadius={46}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label
                        value={totalLinkedAuthors}
                        position="center"
                        fill="#334155"
                        fontSize={14}
                        fontWeight={700}
                      />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', right: 20 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">현재 대기 중인 작가 활동 데이터가 없습니다</div>
            )}
            <div className="absolute top-3 left-4 text-xs font-semibold text-muted-foreground">
              작가 활동 현황
            </div>
          </CardContent>
        </Card>

        {/* 관리 중인 작가 (축소됨) */}
        <Card className="border-border shadow-sm col-span-1 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5 transition">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                관리 중인 작가
              </span>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {isLinkedAuthorsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                totalLinkedAuthors
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              전담 멘토링 대상
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. 배너 위젯 섹션 (공지사항) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IP Expansion Projects Widget */}
        <Card className="border-border relative overflow-hidden group bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5 transition">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
              최근 IP 확장 프로젝트
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] flex flex-col justify-center relative">
            {currentProject ? (
              <div
                className="space-y-2 px-8 transition-all duration-300 hover:opacity-90 cursor-pointer"
                onClick={() => {
                  setSelectedProject(currentProject);
                  setProjectDetailTab("summary");
                  setIsProjectDetailOpen(true);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={`${
                      currentProject.format === 'drama'
                        ? 'text-purple-600 border-purple-200 bg-purple-50'
                        : currentProject.format === 'game'
                        ? 'text-green-600 border-green-200 bg-green-50'
                        : currentProject.format === 'movie'
                        ? 'text-orange-600 border-orange-200 bg-orange-50'
                        : 'text-blue-600 border-blue-200 bg-blue-50'
                    }`}
                  >
                    {currentProject.format === 'drama'
                      ? '드라마화'
                      : currentProject.format === 'game'
                      ? '게임화'
                      : currentProject.format === 'movie'
                      ? '영화화'
                      : '웹툰화'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(currentProject.id).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold line-clamp-1">
                  {currentProject.projectName}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  원작: {currentProject.workTitle || '미정'} | 예산:{' '}
                  {currentProject.budget
                    ? Number(currentProject.budget).toLocaleString() + '원'
                    : '미정'}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative inline-flex items-center w-32 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <span
                      className={`absolute inset-y-0 left-0 ${
                        currentProject.format === 'drama'
                          ? 'bg-purple-500'
                          : currentProject.format === 'game'
                          ? 'bg-green-500'
                          : currentProject.format === 'movie'
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${currentProject.progress ?? 0}%` }}
                    />
                  </div>
                  <Badge variant="outline" className="text-slate-700 border-slate-200 bg-white">
                    진행률 {currentProject.progress ?? 0}%
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                현재 대기 중인 과업이 없습니다
              </div>
            )}

            {/* Navigation Arrows */}
            {recentProjects.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition"
                  onClick={handlePrevProject}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition"
                  onClick={handleNextProject}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* 공지사항 위젯 */}
        <Card className="border-border relative overflow-hidden group bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5 transition">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="w-5 h-5 text-primary" />
              주요 공지사항
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notices.length > 0 ? (
              <div className="divide-y divide-border">
                {notices.map((notice: any) => (
                  <div
                    key={notice.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleNoticeClick(notice)}
                  >
                    <Badge
                      variant={
                        notice.category === 'URGENT'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="shrink-0"
                    >
                      {notice.category === 'URGENT' ? '긴급' : '공지'}
                    </Badge>
                    <span className="flex-1 text-sm font-medium truncate">
                      {notice.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                현재 대기 중인 공지사항이 없습니다
              </div>
            )}

            {/* Navigation Arrows */}
            {notices.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition"
                  onClick={handlePrevNotice}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition"
                  onClick={handleNextNotice}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={isNoticeDetailOpen} onOpenChange={setIsNoticeDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>공지사항 상세</DialogTitle>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedNotice.category === 'URGENT'
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {selectedNotice.category === 'URGENT' ? '긴급' : '공지'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedNotice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{selectedNotice.title}</h3>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {selectedNotice.content}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsNoticeDetailOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Detail Dialog */}
      <Dialog open={isProjectDetailOpen} onOpenChange={setIsProjectDetailOpen}>
        <DialogContent className="w-[92vw] max-w-7xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="font-bold break-keep">
                {selectedProject?.projectName || "프로젝트 상세"}
              </span>
              <Badge
                className={`${
                  selectedProject?.format === "drama"
                    ? "bg-purple-100 text-purple-700"
                    : selectedProject?.format === "game"
                    ? "bg-green-100 text-green-700"
                    : selectedProject?.format === "movie"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {selectedProject?.format === "drama"
                  ? "드라마화"
                  : selectedProject?.format === "game"
                  ? "게임화"
                  : selectedProject?.format === "movie"
                  ? "영화화"
                  : "웹툰화"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              프로젝트의 핵심 정보와 전략 현황을 확인하세요.
            </DialogDescription>
          </DialogHeader>

          <div
            className={`rounded-xl p-5 mb-6 ${
              selectedProject?.format === "drama"
                ? "bg-purple-50"
                : selectedProject?.format === "game"
                ? "bg-green-50"
                : selectedProject?.format === "movie"
                ? "bg-orange-50"
                : "bg-blue-50"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white text-slate-700 border border-slate-200">
                진행률 0%
              </Badge>
              <Badge className="bg-white text-slate-700 border border-slate-200">
                출시 예정일 미정
              </Badge>
              <Badge className="bg-white text-slate-700 border border-slate-200">
                현재 단계 기획
              </Badge>
            </div>
          </div>

          <Tabs
            value={projectDetailTab}
            onValueChange={(v) => setProjectDetailTab(v as "summary" | "roadmap" | "assets")}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="summary">전략 요약</TabsTrigger>
              <TabsTrigger value="roadmap">로드맵</TabsTrigger>
              <TabsTrigger value="assets">IP 자산</TabsTrigger>
            </TabsList>
          </Tabs>

          {projectDetailTab === "summary" && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                      원작
                    </span>
                    <span className="font-bold text-slate-900 break-keep tracking-tighter">
                      {selectedProject?.workTitle || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                      작가
                    </span>
                    <span className="font-bold text-slate-900 break-keep tracking-tighter">
                      {selectedProject?.authorName || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="text-xs text-slate-500 whitespace-nowrap break-keep">
                        타겟 오디언스
                      </div>
                      <div className="font-semibold text-slate-900 text-sm mt-1 break-keep tracking-tighter">
                        {(selectedProject?.targetAges || []).length > 0
                          ? selectedProject?.targetAges.join(", ")
                          : "전연령"}{" "}
                        /{" "}
                        {selectedProject?.targetGender === "male"
                          ? "남성"
                          : selectedProject?.targetGender === "female"
                          ? "여성"
                          : "남녀무관"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 break-keep">
                        설정된 타겟에 따른 선호도 지표
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="text-xs text-slate-500 whitespace-nowrap break-keep">
                        예산 집행률
                      </div>
                      <div className="font-semibold text-slate-900 text-sm mt-1 break-keep tracking-tighter">
                        {selectedProject?.budget
                          ? `${Number(selectedProject.budget).toLocaleString()}원`
                          : "미정"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 break-keep">
                        {selectedProject?.budget ? "총 예산 대비 집행 비용" : "예산 수립 필요"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="text-xs text-slate-500 whitespace-nowrap break-keep">
                        매체 적합성
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1.5 break-keep tracking-tighter">
                        원작 서사 구조 분석
                      </div>
                      <div className="text-xs text-slate-500 mt-2 break-keep">
                        3막 구조 및 세계 설정 반영
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {projectDetailTab === "roadmap" && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-5">
                <div className="font-semibold text-slate-900 mb-3">마일스톤 및 로드맵</div>
                {(() => {
                  const stages = ["기획", "계약", "제작", "검수", "런칭"];
                  const currentStageIndex = 1;
                  return (
                    <div className="flex items-center gap-4 mb-6">
                      {stages.map((stage, i) => (
                        <div key={stage} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === currentStageIndex
                                ? "bg-slate-200 text-slate-900 ring-2 ring-blue-200 shadow-sm"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {i + 1}
                          </div>
                          <span className="mt-1 text-[10px] text-slate-500">{stage}</span>
                          {i < stages.length - 1 && (
                            <div className="w-10 h-px bg-slate-200 mx-2 hidden md:block" />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-semibold text-slate-900 mb-2">체크리스트</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>기획안 작성</li>
                      <li>원작자 협의</li>
                      <li className="text-red-600">제작사 컨택 지연</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-semibold text-slate-900 mb-2">팀 협업 현황</div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-slate-100 text-slate-700">PD</Badge>
                      <Badge className="bg-slate-100 text-slate-700">작가</Badge>
                      <Badge className="bg-slate-100 text-slate-700">디자이너</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {projectDetailTab === "assets" && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-5">
                <div className="font-semibold text-slate-900 mb-3">IP 자산 동기화</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">캐릭터 시트</div>
                    <div className="font-bold text-slate-900 mt-1">시각화 비교 뷰</div>
                    <div className="text-xs text-slate-500 mt-1">엘레나, 루미나스 등 주요 캐릭터</div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                      <div className="w-8 h-8 rounded-full bg-slate-300" />
                      <div className="w-8 h-8 rounded-full bg-slate-100" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-white text-slate-700 border border-slate-200">#주인공</Badge>
                      <Badge className="bg-white text-slate-700 border border-slate-200">#라이벌</Badge>
                      <Badge className="bg-white text-slate-700 border border-slate-200">#조력자</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">세계관 설정집</div>
                    <div className="font-bold text-slate-900 mt-1">매체별 각색 데이터</div>
                    <div className="text-xs text-slate-500 mt-1">중세 판타지, 마법 체계</div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-white text-slate-700 border border-slate-200">#중세</Badge>
                      <Badge className="bg-white text-slate-700 border border-slate-200">#마법</Badge>
                      <Badge className="bg-white text-slate-700 border border-slate-200">#왕국</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsProjectDetailOpen(false);
                onNavigate?.('ip-expansion');
              }}
            >
              ip확장 페이지로 이동
            </Button>
            <Button onClick={() => setIsProjectDetailOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
