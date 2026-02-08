import {
  Zap,
  Film,
  Tv,
  Play,
  Sparkles,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Check,
  AlertCircle,
  X,
  BookOpen,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Clapperboard,
  Calendar,
  Users,
  Clock,
  Target,
  Loader2,
  Trash2,
  Wand2,
  Music,
  Video,
  FileText,
  AlertTriangle,
  Send,
  Edit,
  Maximize2,
  Minimize2,
  Gamepad,
  Gamepad2,
  Settings2,
  Palette,
  MessageSquare,
  List,
  MapPin,
  Package,
  Users2,
  Globe,
  Settings,
  DollarSign,
  BarChart,
  ChevronDown,
  Megaphone,
  GitBranch,
  User,
  Crown,
  HelpCircle,
  Info,
} from 'lucide-react';
import { PdfPreview, VisualPreview } from '../../../components/ProjectPreviews';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { SelectedSettingCard } from '../../../components/SelectedSettingCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axios';
import { cn } from '../../../components/ui/utils';
import { managerService } from '../../../services/managerService';
import { toast } from 'sonner';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Checkbox } from '../../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';

// Helper to highlight search matches
const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-100 font-medium text-yellow-900">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

// Helper to parse conflict reason
const parseConflictReason = (text: string) => {
  if (!text) return '';
  const match = text.match(/\[판단사유:\s*(.*?)\]/);
  return match ? match[1] : text.replace('[결과: 충돌]', '').trim();
};

// Helper component for setting comparison
const SettingComparison = ({
  original,
  updated,
}: {
  original: any;
  updated: any;
}) => {
  if (!original && !updated) return null;

  // Collect all keys from both objects
  const allKeys = Array.from(
    new Set([...Object.keys(original || {}), ...Object.keys(updated || {})]),
  );

  return (
    <div className="border rounded-md overflow-hidden text-xs">
      <div className="grid grid-cols-2 bg-slate-100 border-b font-bold text-slate-700">
        <div className="p-2 border-r flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          기존 설정 (Original)
        </div>
        <div className="p-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          신규 설정 (Updated)
        </div>
      </div>
      {allKeys.map((key) => {
        const origVal = original?.[key];
        const newVal = updated?.[key];
        const isAdded = !origVal && newVal;
        const isDeleted = origVal && !newVal;
        const isModified =
          origVal &&
          newVal &&
          JSON.stringify(origVal) !== JSON.stringify(newVal);

        let origClass = 'p-2 border-r bg-white text-slate-600';
        let newClass = 'p-2 bg-white text-slate-600';

        if (isAdded) {
          newClass = 'p-2 bg-green-50 text-green-700 font-medium';
        } else if (isDeleted) {
          origClass =
            'p-2 border-r bg-red-50 text-red-700 font-medium decoration-red-300';
        } else if (isModified) {
          origClass = 'p-2 border-r bg-yellow-50 text-yellow-700';
          newClass = 'p-2 bg-yellow-50 text-yellow-700 font-medium';
        }

        const formatValue = (val: any) => {
          if (Array.isArray(val)) return val.join(', ');
          return String(val || '-');
        };

        return (
          <div key={key} className="grid grid-cols-2 border-b last:border-0">
            <div className={origClass}>
              <span className="font-bold mr-2 text-[10px] text-slate-400 block mb-1">
                {key}
              </span>
              {formatValue(origVal)}
            </div>
            <div className={newClass}>
              <span className="font-bold mr-2 text-[10px] text-slate-400 block mb-1">
                {key}
              </span>
              {formatValue(newVal)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

function getContentStrategy(formatId: string | null) {
  const common = {
    valueProp: {
      title: 'IP 원천 가치 및 시장성 분석',
      desc: '원작의 핵심 키워드, 독자 반응 데이터(댓글, 평점), 유사 성공 사례 비교 분석.',
      sub: '장르적 특성에 따른 주 타겟층(예: 2030 남성)과 원작의 팬덤 유지율 등을 지표로 제시합니다.',
      icon: Target,
    },
    adaptation: {
      title: '매체 최적화 각색 시나리오',
      desc: '원작의 방대한 서사를 선택된 매체의 호흡과 문법에 맞게 재구성합니다.',
      sub: '매체별 스토리텔링 구조 재설계',
      icon: FileText,
    },
    visual: {
      title: '캐릭터 및 비주얼 가이드',
      desc: 'AI가 분석한 캐릭터의 외형 묘사와 성격을 시각적으로 구체화합니다.',
      sub: '매체별 비주얼 스타일 최적화',
      icon: Palette,
    },
    world: {
      title: '코어 메커니즘 및 세계관 자산',
      desc: '원작의 설정을 매체에 맞는 자산으로 변환합니다.',
      sub: '매체별 핵심 재미 요소 및 규칙 정의',
      icon: Globe,
    },
    business: {
      title: '타겟팅 및 비즈니스 모델',
      desc: '수익 구조와 마케팅 전략을 구체화합니다.',
      sub: '매체별 수익화(BM) 모델 수립',
      icon: Target,
    },
    feasibility: {
      title: '제작 난이도 및 리소스 리포트',
      desc: '실제 제작에 들어가는 비용과 기술적 난이도를 시뮬레이션합니다.',
      sub: '제작 효율성 및 리스크 분석',
      icon: Settings2,
    },
  };

  switch (formatId) {
    case 'webtoon':
      return {
        ...common,
        adaptation: {
          ...common.adaptation,
          sub: "주간 연재를 위한 회당 호흡, '절단신공' 포인트.",
        },
        visual: {
          ...common.visual,
          sub: '그림체 방향성, 선화 느낌, 채색 톤 가이드.',
        },
        business: {
          ...common.business,
          sub: '굿즈화 연계 가능성이 높은 아이템/캐릭터 선정 및 팝업스토어 기획.',
        },
      };
    case 'drama':
    case 'movie':
      return {
        ...common,
        adaptation: {
          ...common.adaptation,
          sub: '3막 구조나 시즌제 에피소드 배분.',
        },
        visual: {
          ...common.visual,
          sub: '배우의 이미지와 싱크로율을 매칭한 캐스팅 페르소나.',
        },
        business: {
          ...common.business,
          sub: '글로벌 OTT(넷플릭스 등) 선호 장르 분석을 통한 판권 수출 전략.',
        },
        feasibility: {
          ...common.feasibility,
          sub: '일상적 배경 위주의 촬영 가능 여부(로케이션 비용 절감).',
        },
      };
    case 'game':
      return {
        ...common,
        adaptation: {
          ...common.adaptation,
          sub: '플레이어의 동기 부여를 위한 메인 퀘스트라인.',
        },
        visual: {
          ...common.visual,
          sub: '3D 모델링을 위한 전후좌우 캐릭터 시트.',
        },
        world: {
          ...common.world,
          sub: '성장 트리, 전투 시스템, 수집 요소 등 게임의 재미 루프.',
        },
        business: {
          ...common.business,
          sub: '아이템 파밍 및 멀티플레이어 경쟁(PvP) 구조를 통한 수익화.',
        },
        feasibility: {
          ...common.feasibility,
          sub: '원작 설정 기반의 밸런싱 완료 여부 및 개발 우선순위.',
        },
      };
    case 'spinoff':
      return {
        ...common,
        adaptation: {
          ...common.adaptation,
          sub: "주간 연재를 위한 회당 호흡, '절단신공' 포인트.",
        },
        visual: {
          ...common.visual,
          sub: '그림체 방향성, 선화 느낌, 채색 톤 가이드.',
        },
        world: {
          ...common.world,
          sub: '본편의 설정을 해치지 않는 프리퀄/시퀄의 타임라인 설계.',
        },
        business: {
          ...common.business,
          sub: '굿즈화 연계 가능성이 높은 아이템/캐릭터 선정 및 팝업스토어 기획.',
        },
      };
    case 'commercial':
      return {
        ...common,
        visual: {
          ...common.visual,
          sub: '3D 모델링을 위한 전후좌우 캐릭터 시트.',
        },
        business: {
          ...common.business,
          sub: '굿즈화 연계 가능성이 높은 아이템/캐릭터 선정 및 팝업스토어 기획.',
        },
      };
    default:
      return common;
  }
}

export function ManagerIPExpansion() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;
  const queryClient = useQueryClient();

  const { data: proposalsData, isLoading } = useQuery({
    queryKey: ['manager', 'ip-expansion', 'proposals', page],
    queryFn: () => managerService.getIPProposals(page, PAGE_SIZE),
  });

  const proposals = proposalsData?.content || [];

  const createMutation = useMutation({
    mutationFn: managerService.createIPExpansionProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });
      setIsCreateDialogOpen(false);
      toast.success('새로운 IP 확장 프로젝트가 생성되었습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      managerService.updateIPProposal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });
      setIsCreateDialogOpen(false);
      toast.success('프로젝트가 수정되었습니다.');
    },
  });

  const proposeMutation = useMutation({
    mutationFn: managerService.proposeIPExpansionProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });
      setSelectedProject(null);
      toast.success('작가에게 제안서를 전송했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: managerService.deleteIPExpansionProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });
      setSelectedProject(null);
      toast.success('프로젝트 상태가 삭제됨으로 변경되었습니다.');
    },
    onError: () => {
      toast.error('프로젝트 삭제에 실패했습니다.');
    },
  });

  const handleCreateProject = (project: any) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: project });
    } else {
      createMutation.mutate(project);
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setSelectedProject(null);
    setIsCreateDialogOpen(true);
  };

  const handlePropose = (id: number) => {
    proposeMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            IP 확장
          </h1>
          <p className="text-slate-500 mt-2">
            다양한 IP 확장 프로젝트를 관리하고 제안서를 생성합니다.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setIsCreateDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          신규 프로젝트
        </Button>
      </div>

      {/* Project List */}
      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              로딩 중...
            </div>
          ) : proposals && proposals.length > 0 ? (
            proposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="cursor-pointer hover:shadow-md transition-all group"
                onClick={() => setSelectedProject(proposal)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant={
                        proposal.status === 'APPROVED'
                          ? 'default'
                          : proposal.status === 'REVIEWING'
                            ? 'secondary'
                            : proposal.status === 'PENDING'
                              ? 'outline'
                              : proposal.status === 'REJECTED'
                                ? 'destructive'
                                : 'secondary'
                      }
                      className={cn(
                        proposal.status === 'APPROVED' &&
                          'bg-green-600 hover:bg-green-700',
                        proposal.status === 'REVIEWING' &&
                          'bg-blue-100 text-blue-700 hover:bg-blue-200',
                        proposal.status === 'PENDING' &&
                          'border-amber-500 text-amber-600',
                      )}
                    >
                      {proposal.status === 'APPROVED'
                        ? '승인'
                        : proposal.status === 'REVIEWING'
                          ? '검토'
                          : proposal.status === 'PENDING'
                            ? '승인 대기'
                            : proposal.status === 'REJECTED'
                              ? '반려'
                              : proposal.statusDescription || proposal.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(
                        proposal.createdAt || proposal.receivedAt || Date.now(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {proposal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 line-clamp-3">
                    {proposal.content || '프로젝트 상세 내용이 없습니다.'}
                  </p>
                </CardContent>
                <CardFooter className="text-sm text-slate-400 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{proposal.authorName || '작가 미정'}</span>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
              <p className="font-medium text-slate-900">
                진행 중인 프로젝트가 없습니다
              </p>
              <p className="text-sm mt-1">
                새로운 IP 확장 프로젝트를 시작해보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {proposalsData && proposalsData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-slate-600"
          >
            이전
          </Button>
          <div className="text-sm font-medium text-slate-600 px-4">
            <span className="text-slate-900">{page + 1}</span>
            <span className="mx-1 text-slate-400">/</span>
            {proposalsData.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(proposalsData.totalPages - 1, p + 1))
            }
            disabled={page >= proposalsData.totalPages - 1}
            className="text-slate-600"
          >
            다음
          </Button>
        </div>
      )}

      <CreateIPExpansionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingProject(null);
        }}
        onCreated={handleCreateProject}
        initialData={editingProject}
      />

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onPropose={handlePropose}
          onEdit={handleEditProject}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onPropose,
  onEdit,
  onDelete,
}: {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onPropose: (id: number) => void;
  onEdit: (project: any) => void;
  onDelete: (id: number) => void;
}) {
  const [showPdfFullScreen, setShowPdfFullScreen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLorebookDetail, setSelectedLorebookDetail] =
    useState<any>(null);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(project.id);
    setShowDeleteConfirm(false);
  };

  // Mock Content Strategy - Updated for 6 Core Elements
  const contentStrategy = project.contentStrategy || {
    differentiation:
      project.differentiation ||
      '기존 장르의 문법을 비트는 반전 요소와 입체적인 캐릭터 관계성을 통해 차별화된 재미를 선사합니다.',
    keyReason:
      '현재 트렌드인 "회귀/빙의/환생" 키워드를 독창적으로 해석하여, 2030 타겟층의 강력한 공감을 이끌어낼 수 있는 서사입니다.',
    successGrounds:
      '원작의 탄탄한 팬덤 데이터와 유사 성공 사례(예: 재벌집 막내아들)의 흥행 공식을 분석했을 때, 높은 시장 점유율이 예측됩니다.',
    coreNarrative:
      project.content ||
      '주인공의 내면적 갈등과 외부의 위협이 교차하며 전개되는 긴장감 넘치는 서사 구조를 가집니다.',
    worldBuilding:
      '기존 세계관의 규칙을 비틀어 새로운 마법 체계와 기술이 공존하는 독창적인 디스토피아를 구축합니다.',
    visualStyle:
      '누아르 풍의 어두운 색채와 네온 사인이 대비되는 강렬한 비주얼로 몰입감을 극대화합니다.',
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 프로젝트 데이터가 영구적으로
              삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] lg:max-w-7xl max-h-[95vh] p-0 gap-0 rounded-2xl overflow-y-auto flex flex-col bg-white shadow-2xl border-0">
          <ScrollArea className="flex-1">
            {/* Hero Header */}
            <div
              className={cn(
                'relative h-48 flex items-end p-8 overflow-hidden shrink-0',
                'bg-slate-50 border-b border-slate-100',
              )}
            >
              <div className="relative z-10 w-full flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-white border-slate-200 text-slate-500 hover:bg-slate-50 uppercase tracking-wider shadow-sm">
                      {project.format || 'FORMAT'}
                    </Badge>
                    <Badge
                      variant={
                        project.status === 'APPROVED'
                          ? 'default'
                          : project.status === 'REVIEWING'
                            ? 'secondary'
                            : project.status === 'PENDING'
                              ? 'outline'
                              : 'destructive'
                      }
                      className={cn(
                        'border-0',
                        project.status === 'APPROVED'
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : project.status === 'REVIEWING'
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : project.status === 'PENDING'
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-rose-500 text-white hover:bg-rose-600',
                      )}
                    >
                      {project.status === 'APPROVED'
                        ? '승인'
                        : project.status === 'REVIEWING'
                          ? '검토'
                          : project.status === 'PENDING'
                            ? '승인 대기'
                            : '반려'}
                    </Badge>
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                    {project.title}
                  </h2>
                  <div className="text-slate-500 text-sm mt-3 flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />{' '}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />{' '}
                      {project.authorName || '작가 미정'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-12">
              {/* Feedback Section (Only for PENDING status) */}
              {project.status === 'PENDING' && (
                <div
                  id="feedback-section"
                  className="bg-indigo-50 border border-indigo-100 rounded-xl p-6"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-900 mb-4">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    작가 피드백 및 평가
                  </h3>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-bold text-slate-900 mr-2">
                            {project.authorName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                        <Badge className="bg-indigo-200 text-indigo-800 hover:bg-indigo-300 border-0">
                          검토 중
                        </Badge>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-indigo-100 text-slate-700 text-sm leading-relaxed shadow-sm">
                        "제안해주신 기획안 잘 확인했습니다. 전반적으로 흥미로운
                        방향성이네요. 다만 타겟 연령대를 조금 더 낮춰서 10대
                        후반도 포함할 수 있을지 검토 부탁드립니다. 비주얼 컨셉은
                        아주 마음에 듭니다."
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />{' '}
                          답장하기
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. PDF Preview & Overview */}
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                {/* Left: PDF & Visual Preview */}
                <div className="w-full lg:w-1/2 shrink-0 flex flex-col gap-4">
                  <div className="h-[300px]">
                    <VisualPreview
                      project={project}
                      isFullScreen={false}
                      className="h-full object-contain"
                      onFullScreen={() => setShowPreviewModal(true)}
                    />
                  </div>
                  <div className="h-[200px]">
                    <PdfPreview
                      isFullScreen={false}
                      className="h-full"
                      onFullScreen={() => setShowPdfFullScreen(true)}
                    />
                  </div>
                </div>

                {/* Right: Project Overview */}
                <div className="w-full lg:w-1/2 flex flex-col space-y-4 shrink-0">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Target className="w-5 h-5 text-slate-500" />
                    프로젝트 개요
                  </h3>
                  <Card className="h-full border-slate-100 shadow-sm bg-white">
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                          Source Work
                        </div>
                        <div className="font-bold text-slate-900 text-lg">
                          {project.workTitle || '-'}
                        </div>
                      </div>
                      <div className="h-px bg-slate-50" />
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                          Target Audience
                        </div>
                        <div className="font-medium text-slate-700">
                          {project.business?.targetAge?.join(', ') || '미정'} /{' '}
                          <span className="capitalize">
                            {project.business?.targetGender === 'male'
                              ? '남성'
                              : project.business?.targetGender === 'female'
                                ? '여성'
                                : '전체'}
                          </span>
                        </div>
                      </div>
                      <div className="h-px bg-slate-50" />
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                          Budget Scale
                        </div>
                        <div className="font-medium text-slate-700 capitalize flex items-center gap-2">
                          {project.business?.budgetRange === 'low'
                            ? '저예산 (Low)'
                            : project.business?.budgetRange === 'high'
                              ? '블록버스터 (High)'
                              : '중형 예산 (Medium)'}
                        </div>
                      </div>
                      <div className="h-px bg-slate-50" />
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                          Strategy
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                          >
                            {project.strategy?.genre === 'varied'
                              ? '장르 변주'
                              : '원작 유지'}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                          >
                            {project.strategy?.universe === 'parallel'
                              ? '평행 세계'
                              : '공유 세계관'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 2. Core Content Strategy (6 Grid) */}
              <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  IP 확장 기획 제안서 핵심 내용
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    {
                      title: '차별점 (Differentiation)',
                      icon: Zap,
                      content: contentStrategy.differentiation,
                      color: 'text-indigo-600',
                      bg: 'bg-indigo-50',
                    },
                    {
                      title: '기획 필요성 (Key Reason)',
                      icon: Target,
                      content: contentStrategy.keyReason,
                      color: 'text-rose-600',
                      bg: 'bg-rose-50',
                    },
                    {
                      title: '성공 근거 (Success Grounds)',
                      icon: BarChart,
                      content: contentStrategy.successGrounds,
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50',
                    },
                    {
                      title: '핵심 서사 (Core Narrative)',
                      icon: BookOpen,
                      content: contentStrategy.coreNarrative,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                    },
                    {
                      title: '세계관 확장 (World Building)',
                      icon: Monitor,
                      content: contentStrategy.worldBuilding,
                      color: 'text-purple-600',
                      bg: 'bg-purple-50',
                    },
                    {
                      title: '비주얼 스타일 (Visual Style)',
                      icon: ImageIcon,
                      content: contentStrategy.visualStyle,
                      color: 'text-pink-600',
                      bg: 'bg-pink-50',
                    },
                  ].map((item, i) => (
                    <Card
                      key={i}
                      className="border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                          <div className={`p-2 rounded-lg ${item.bg}`}>
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* 3. Input Setting Summary & Lorebooks */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <Settings className="w-5 h-5 text-slate-500" />
                  입력 설정 요약
                </h3>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    {
                      label: 'Source Work',
                      value: project.workTitle,
                      icon: BookOpen,
                      color: 'text-slate-600',
                      bg: 'bg-slate-50',
                    },
                    {
                      label: 'Author',
                      value: project.authorName,
                      icon: Users,
                      color: 'text-slate-600',
                      bg: 'bg-slate-50',
                    },
                    {
                      label: 'Format',
                      value: project.format,
                      icon: Film,
                      color: 'text-slate-600',
                      bg: 'bg-slate-50',
                    },
                    {
                      label: '장르 설정',
                      value: project.strategy?.genres
                        ? project.strategy.genres.join(', ')
                        : project.strategy?.genre || '미지정',
                      icon: Sparkles,
                      color: 'text-amber-600',
                      bg: 'bg-amber-50',
                    },
                    {
                      label: '타겟 연령/성별',
                      value: `${
                        project.business?.targetAge?.join(', ') || '전연령'
                      } / ${
                        project.business?.targetGender === 'male'
                          ? '남성'
                          : project.business?.targetGender === 'female'
                            ? '여성'
                            : '통합'
                      }`,
                      icon: Users,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                    },
                    {
                      label: '예산 규모',
                      value: project.business?.budgetRange || '미정',
                      icon: DollarSign,
                      color: 'text-green-600',
                      bg: 'bg-green-50',
                    },
                    // Format Specific Details
                    ...(project.format === 'webtoon'
                      ? [
                          {
                            label: '작화 스타일',
                            value:
                              [
                                {
                                  id: 'realistic',
                                  label: '실사체',
                                },
                                {
                                  id: 'casual',
                                  label: '캐주얼/SD',
                                },
                                {
                                  id: 'martial_arts',
                                  label: '무협/극화체',
                                },
                                {
                                  id: 'us_comics',
                                  label: '미국 코믹스',
                                },
                              ].find(
                                (i) => i.id === project.mediaDetails?.style,
                              )?.label || '미지정',
                            icon: ImageIcon,
                            color: 'text-pink-600',
                            bg: 'bg-pink-50',
                          },
                          {
                            label: '연출 호흡',
                            value:
                              [
                                {
                                  id: 'fast',
                                  label: '빠른 전개',
                                },
                                {
                                  id: 'emotional',
                                  label: '감정선 중심',
                                },
                                {
                                  id: 'suspense',
                                  label: '긴장감 조성',
                                },
                              ].find(
                                (i) => i.id === project.mediaDetails?.pacing,
                              )?.label || '미지정',
                            icon: Clock,
                            color: 'text-indigo-600',
                            bg: 'bg-indigo-50',
                          },
                          {
                            label: '엔딩 포인트',
                            value:
                              [
                                {
                                  id: 'cliffhanger',
                                  label: '절단신공',
                                },
                                {
                                  id: 'resolution',
                                  label: '에피소드 완결',
                                },
                                {
                                  id: 'preview',
                                  label: '다음 화 예고',
                                },
                              ].find(
                                (i) =>
                                  i.id === project.mediaDetails?.endingPoint,
                              )?.label || '미지정',
                            icon: Target,
                            color: 'text-rose-600',
                            bg: 'bg-rose-50',
                          },
                        ]
                      : []),
                    ...(project.format === 'drama'
                      ? [
                          {
                            label: '편성 전략',
                            value:
                              project.mediaDetails?.seasonType === 'limited'
                                ? '미니시리즈 (16부작)'
                                : project.mediaDetails?.seasonType ===
                                    'seasonal'
                                  ? '시즌제 드라마'
                                  : '일일/주말 드라마',
                            icon: Calendar,
                            color: 'text-pink-600',
                            bg: 'bg-pink-50',
                          },
                          {
                            label: '회차당 분량',
                            value: `${project.mediaDetails?.episodeDuration || 60}분`,
                            icon: Clock,
                            color: 'text-indigo-600',
                            bg: 'bg-indigo-50',
                          },
                        ]
                      : []),
                    ...(project.format === 'game'
                      ? [
                          {
                            label: '게임 장르',
                            value:
                              [
                                { id: 'rpg', label: 'RPG' },
                                {
                                  id: 'simulation',
                                  label: '시뮬레이션',
                                },
                                { id: 'action', label: '액션/어드벤처' },
                                {
                                  id: 'puzzle',
                                  label: '퍼즐/캐주얼',
                                },
                                { id: 'strategy', label: '전략/TCG' },
                                { id: 'sports', label: '스포츠/레이싱' },
                                { id: 'fps', label: '슈팅 (FPS/TPS)' },
                                {
                                  id: 'combat',
                                  label: '전투/경쟁',
                                },
                                {
                                  id: 'collection',
                                  label: '수집형',
                                },
                                { id: 'story', label: '비주얼 노벨' },
                              ].find(
                                (i) => i.id === project.mediaDetails?.gameGenre,
                              )?.label || '미지정',
                            icon: Gamepad2,
                            color: 'text-pink-600',
                            bg: 'bg-pink-50',
                          },
                          {
                            label: '플랫폼',
                            value:
                              [
                                { id: 'mobile', label: '모바일' },
                                { id: 'pc', label: 'PC' },
                                { id: 'console', label: '콘솔' },
                                {
                                  id: 'multi',
                                  label: '멀티플랫폼',
                                },
                              ].find(
                                (i) => i.id === project.mediaDetails?.platform,
                              )?.label || '미지정',
                            icon: Monitor,
                            color: 'text-indigo-600',
                            bg: 'bg-indigo-50',
                          },
                        ]
                      : []),
                    ...(project.format === 'spinoff'
                      ? [
                          {
                            label: '스핀오프 유형',
                            value:
                              [
                                { id: 'prequel', label: '프리퀄' },
                                { id: 'sequel', label: '시퀄' },
                                { id: 'side', label: '외전' },
                                { id: 'if', label: 'IF 스토리' },
                              ].find(
                                (i) =>
                                  i.id === project.mediaDetails?.spinoffType,
                              )?.label || '미지정',
                            icon: GitBranch,
                            color: 'text-pink-600',
                            bg: 'bg-pink-50',
                          },
                          {
                            label: '주인공 캐릭터',
                            value:
                              project.mediaDetails?.targetCharacter || '미지정',
                            icon: User,
                            color: 'text-indigo-600',
                            bg: 'bg-indigo-50',
                          },
                        ]
                      : []),
                    ...(project.format === 'commercial'
                      ? [
                          {
                            label: '비주얼 포맷',
                            value:
                              [
                                { id: '2d', label: '2D 애니메이션' },
                                { id: '3d', label: '3D 그래픽' },
                                { id: 'live', label: '실사 촬영' },
                                {
                                  id: 'motion',
                                  label: '모션 그래픽',
                                },
                              ].find(
                                (i) =>
                                  i.id === project.mediaDetails?.visualFormat,
                              )?.label || '미지정',
                            icon: ImageIcon,
                            color: 'text-pink-600',
                            bg: 'bg-pink-50',
                          },
                        ]
                      : []),
                    {
                      label: '제작 톤앤매너',
                      value: project.mediaDetails?.tone || '미지정',
                      icon: Palette,
                      color: 'text-purple-600',
                      bg: 'bg-purple-50',
                    },
                    {
                      label: '핵심 재미요소',
                      value: project.mediaDetails?.coreLoop || '미지정',
                      icon: Zap,
                      color: 'text-yellow-600',
                      bg: 'bg-yellow-50',
                    },
                    {
                      label: '비즈니스 모델',
                      value: project.mediaDetails?.bmStrategy || '미지정',
                      icon: BarChart,
                      color: 'text-cyan-600',
                      bg: 'bg-cyan-50',
                    },
                    {
                      label: '세계관 설정',
                      value: project.mediaDetails?.worldSetting || '미지정',
                      icon: Globe,
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50',
                    },
                    {
                      label: '캐릭터 각색',
                      value:
                        project.mediaDetails?.characterAdaptation || '미지정',
                      icon: Users,
                      color: 'text-pink-600',
                      bg: 'bg-pink-50',
                    },
                    {
                      label: '플랫폼 전략',
                      value: project.mediaDetails?.platformStrategy || '미지정',
                      icon: Smartphone,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                    },
                    {
                      label: '마케팅 포인트',
                      value: project.mediaDetails?.marketingPoint || '미지정',
                      icon: Megaphone,
                      color: 'text-orange-600',
                      bg: 'bg-orange-50',
                    },
                    {
                      label: '추가 프롬프트',
                      value: project.mediaPrompt || '없음',
                      icon: MessageSquare,
                      color: 'text-slate-600',
                      bg: 'bg-slate-50',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3"
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          item.bg,
                          item.color,
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-500 mb-1">
                          {item.label}
                        </p>
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lorebooks with Expand Icon */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-600">
                    선택된 설정집
                  </div>
                  {project.lorebooks && project.lorebooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {project.lorebooks.map((lorebook: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative group"
                        >
                          <div className="flex justify-between items-start">
                            <div
                              className="font-bold text-slate-800 truncate pr-6"
                              title={lorebook.keyword}
                            >
                              {lorebook.keyword}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                              onClick={() =>
                                setSelectedLorebookDetail(lorebook)
                              }
                            >
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="h-px bg-slate-50" />
                          <div className="text-xs text-slate-500 space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">카테고리</span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5"
                              >
                                {lorebook.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                      선택된 설정집이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 bg-white border-t flex items-center justify-between z-20">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-slate-500"
            >
              닫기
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                className="gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-none"
              >
                <Trash2 className="w-4 h-4" /> 삭제
              </Button>
              <Button variant="outline" onClick={() => onEdit(project)}>
                <Edit className="w-4 h-4 mr-2" /> 수정
              </Button>
              {project.status === 'PENDING' && (
                <Button
                  onClick={() => {
                    const element = document.getElementById('feedback-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <MessageSquare className="w-4 h-4" /> 피드백 보기
                </Button>
              )}
              {project.status !== 'APPROVED' &&
                project.status !== 'PENDING' &&
                project.status !== 'PROPOSED' && (
                  <Button
                    onClick={() => onPropose(project.id)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Send className="w-4 h-4" /> 작가에게 제안하기
                  </Button>
                )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPdfFullScreen} onOpenChange={setShowPdfFullScreen}>
        <DialogContent className="!w-screen !h-screen !max-w-none rounded-none border-0 p-0 overflow-hidden bg-slate-50">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <PdfPreview
              className="w-full h-full shadow-none border-0"
              isFullScreen={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="!w-screen !h-screen !max-w-none rounded-none border-0 p-0 overflow-hidden bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <VisualPreview
              className="w-full h-full object-contain"
              isFullScreen={true}
              project={project}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedLorebookDetail}
        onOpenChange={() => setSelectedLorebookDetail(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>설정집 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedLorebookDetail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {selectedLorebookDetail.keyword}
                </h3>
                <Badge>{selectedLorebookDetail.category}</Badge>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">작가</span>
                  <span className="font-medium">
                    {selectedLorebookDetail.authorName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">작품</span>
                  <span className="font-medium">
                    {selectedLorebookDetail.workTitle}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-sm text-slate-500">내용</h4>
                <div className="p-4 bg-white border rounded-lg min-h-[100px] text-sm leading-relaxed">
                  {selectedLorebookDetail.description || '내용이 없습니다.'}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedLorebookDetail(null)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 프로젝트 데이터가 영구적으로
              삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CreateIPExpansionDialog({
  isOpen,
  onClose,
  onCreated,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: any) => void;
  initialData?: any;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');

  // UI States
  const [lorebookCategoryTab, setLorebookCategoryTab] = useState('all');
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [referenceModalTab, setReferenceModalTab] = useState('all');
  const [showPdfFullScreen, setShowPdfFullScreen] = useState(false);

  // New Modals for Step 6
  const [showPlanningDirectionModal, setShowPlanningDirectionModal] =
    useState(false);
  const [showAutoGenerationModal, setShowAutoGenerationModal] = useState(false);

  const confirmCheckboxRef = useRef<HTMLButtonElement>(null);

  // Selection State
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [selectedLorebooks, setSelectedLorebooks] = useState<any[]>([]);
  const [selectedCrownSetting, setSelectedCrownSetting] = useState<
    number | null
  >(null);

  // Conflict Check States
  const [conflictResult, setConflictResult] = useState<any>(null);
  const [isConflictChecking, setIsConflictChecking] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const [showConflictDetail, setShowConflictDetail] = useState(false);

  const analysisBadges = useMemo(() => {
    if (selectedLorebooks.length === 0) return [];

    const badges = [];
    const total = selectedLorebooks.length;
    const workIds = new Set(selectedLorebooks.map((l) => l.workId));

    // Counts
    const counts: Record<string, number> = {
      characters: 0,
      places: 0,
      items: 0,
      groups: 0,
      plots: 0,
      worldviews: 0,
    };

    selectedLorebooks.forEach((l) => {
      if (l.category === '인물') counts.characters++;
      else if (l.category === '장소') counts.places++;
      else if (l.category === '물건') counts.items++;
      else if (l.category === '단체') counts.groups++;
      else if (l.category === '사건') counts.plots++;
      else if (l.category === '세계' || l.category === '세계관')
        counts.worldviews++;
    });

    // Helper for threshold
    const isHigh = (count: number) => {
      if (total < 5) return count >= 2;
      return count / total >= 0.4;
    };

    // 1. Work Faithful
    if (workIds.size === 1) {
      badges.push({
        label: '작품 충실형',
        tooltip:
          '원작의 설정 체계를 계승하여 정통성 있는 확장을 진행합니다. \n추천 확장: 스핀오프, 상업적 이미지',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
      });
    }

    // 2. Multi Universe
    if (workIds.size >= 2) {
      badges.push({
        label: '멀티 유니버스',
        tooltip:
          '서로 다른 IP가 결합된 새로운 형태의 융합 기획을 시도합니다. \n추천 확장: 게임, 영화',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
      });
    }

    // 3. Character Narrative
    if (isHigh(counts.characters)) {
      badges.push({
        label: '캐릭터 서사형',
        tooltip:
          '인물 간 관계와 서사를 중심으로 한 기획에 유리합니다. \n추천 확장: 드라마, 스핀오프',
        color: 'bg-pink-100 text-pink-700 border-pink-200',
      });
    }

    // 4. World Building
    if (isHigh(counts.places + counts.worldviews)) {
      badges.push({
        label: '월드 빌딩형',
        tooltip:
          '독창적인 배경과 물리 법칙을 바탕으로 한 기획에 적합합니다. \n추천 확장: 게임, 영화',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      });
    }

    // 5. Item Mechanic
    const crownItem = selectedLorebooks.find(
      (l) => l.id === selectedCrownSetting,
    );
    const isCrownItem = crownItem?.category === '물건';
    if (isHigh(counts.items) || isCrownItem) {
      badges.push({
        label: '아이템 메카닉형',
        tooltip:
          '아이템의 기능이나 수집 요소를 중심으로 한 기획에 최적화되어 있습니다. \n추천 확장: 게임, 상업적 이미지',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
      });
    }

    // 6. Ensemble/Political
    if (isHigh(counts.groups)) {
      badges.push({
        label: '군상극/정치형',
        tooltip:
          '집단 간 대립과 권력 구조를 다루는 기획에 유리합니다. \n추천 확장: 드라마, 게임',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
      });
    }

    // 7. History/Chronicle
    if (isHigh(counts.plots)) {
      badges.push({
        label: '역사/연대기형',
        tooltip:
          'IP 내 중요 사건과 타임라인을 확장하는 기획에 적합합니다. \n추천 확장: 영화, 드라마',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
      });
    }

    return badges.slice(0, 5);
  }, [selectedLorebooks, selectedCrownSetting]);

  const recommendedFormats = useMemo(() => {
    const recommended = new Set<string>();
    analysisBadges.forEach((badge) => {
      if (badge.tooltip.includes('추천 확장:')) {
        const part = badge.tooltip.split('추천 확장:')[1];
        if (part) {
          if (part.includes('스핀오프')) recommended.add('spinoff');
          if (part.includes('상업적 이미지')) recommended.add('commercial');
          if (part.includes('게임')) recommended.add('game');
          if (part.includes('영화')) recommended.add('movie');
          if (part.includes('드라마')) recommended.add('drama');
          if (part.includes('웹툰')) recommended.add('webtoon');
        }
      }
    });
    return Array.from(recommended);
  }, [analysisBadges]);

  const unselectedCategoryTips = useMemo(() => {
    const tips = [];
    const categoriesPresent = new Set(selectedLorebooks.map((l) => l.category));

    // Check missing
    if (!categoriesPresent.has('인물'))
      tips.push({
        label: '인물 미포함',
        text: '전체 기획 톤에 부합하는 새로운 주인공을 자동 생성합니다.',
      });
    if (
      !categoriesPresent.has('세계') &&
      !categoriesPresent.has('세계관') &&
      !categoriesPresent.has('장소')
    )
      tips.push({
        label: '세계/장소 미포함',
        text: '설정의 배경이 되는 최적의 공간적 환경을 구성합니다.',
      });
    if (!categoriesPresent.has('물건'))
      tips.push({
        label: '물건 미포함',
        text: '개연성을 완성할 필수 소품과 도구들을 시스템이 제안합니다.',
      });
    if (!categoriesPresent.has('단체'))
      tips.push({
        label: '단체 미포함',
        text: '대립하거나 협력할 관계 기반의 가상 세력을 추가합니다.',
      });
    if (!categoriesPresent.has('사건'))
      tips.push({
        label: '사건 미포함',
        text: '설정들을 유기적으로 엮어줄 논리적인 연결 사건을 생성합니다.',
      });

    return tips;
  }, [selectedLorebooks]);

  // Conflict Check State
  const [conflictConfirmed, setConflictConfirmed] = useState(false);

  // Verification States
  const [step3Confirmed, setStep3Confirmed] = useState(false);
  const [step4Confirmed, setStep4Confirmed] = useState(false);
  const [step5Confirmed, setStep5Confirmed] = useState(false);
  const [step6Confirmed, setStep6Confirmed] = useState(false);

  // Expansion Type & Genre State
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [targetGenre, setTargetGenre] = useState('');
  const [universeSetting, setUniverseSetting] = useState<'shared' | 'parallel'>(
    'shared',
  );

  // Business State
  const [business, setBusiness] = useState({
    targetAge: [] as string[],
    targetGender: 'all',
    budgetRange: 'medium', // low, medium, high, very_high
    toneManner: '',
  });

  // Media Specific Details State
  const [mediaDetails, setMediaDetails] = useState<any>({});
  const [mediaPrompt, setMediaPrompt] = useState('');

  // Search States
  const [authorSearch, setAuthorSearch] = useState('');
  const [workSearch, setWorkSearch] = useState('');
  const [lorebookSearch, setLorebookSearch] = useState('');

  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllSpinoffs, setShowAllSpinoffs] = useState(false);
  const [showCoreSettingDetail, setShowCoreSettingDetail] = useState(false);

  // Data Queries
  const { data: authors } = useQuery({
    queryKey: ['manager', 'authors', 'list'],
    queryFn: () => managerService.getAuthors({}),
    enabled: isOpen && currentStep === 1,
  });

  const { data: works } = useQuery({
    queryKey: ['manager', 'author-works', selectedAuthor?.id],
    queryFn: async () => {
      if (!selectedAuthor?.id) return [];
      try {
        return await managerService.getAuthorWorks(selectedAuthor.id);
      } catch (error) {
        console.error('Failed to fetch author works:', error);
        return [];
      }
    },
    enabled: !!selectedAuthor?.id,
  });

  const { data: lorebooks } = useQuery({
    queryKey: ['manager', 'lorebooks', selectedAuthor?.id, selectedWork?.id],
    queryFn: () =>
      selectedWork?.id
        ? managerService.getAuthorWorkLorebooks(selectedWork.id)
        : Promise.resolve([]),
    enabled: !!selectedWork?.id,
  });

  const categories = [
    { id: 'characters', label: '인물', icon: Users },
    { id: 'places', label: '장소', icon: MapPin },
    { id: 'items', label: '물건', icon: Package },
    { id: 'groups', label: '집단', icon: Users2 },
    { id: 'worldviews', label: '세계', icon: Globe },
    { id: 'plots', label: '사건', icon: BookOpen },
  ];

  const filteredAuthors = useMemo(() => {
    if (!authors) return [];
    const list = authors.content || [];
    return list.filter((a: any) =>
      a.name.toLowerCase().includes(authorSearch.toLowerCase()),
    );
  }, [authors, authorSearch]);

  const filteredWorks = useMemo(() => {
    if (!works) return [];
    return works.filter((w: any) =>
      w.title.toLowerCase().includes(workSearch.toLowerCase()),
    );
  }, [works, workSearch]);

  const filteredLorebooks = useMemo(() => {
    if (!lorebooks || !Array.isArray(lorebooks)) return [];
    let filtered = lorebooks.filter((l: any) =>
      l.keyword.toLowerCase().includes(lorebookSearch.toLowerCase()),
    );
    if (lorebookCategoryTab !== 'all') {
      const categoryMap: Record<string, string[]> = {
        characters: ['인물'],
        places: ['장소'],
        items: ['물건'],
        groups: ['단체', '집단'],
        worldviews: ['세계', '세계관'],
        plots: ['사건'],
      };

      const targetCategories = categoryMap[lorebookCategoryTab];

      if (targetCategories) {
        filtered = filtered.filter(
          (l: any) =>
            targetCategories.includes(l.category) ||
            l.category === lorebookCategoryTab,
        );
      } else {
        filtered = filtered.filter(
          (l: any) => l.category === lorebookCategoryTab,
        );
      }
    }
    return filtered;
  }, [lorebooks, lorebookSearch, lorebookCategoryTab]);

  const toggleAllLorebooks = (checked: boolean) => {
    if (checked) {
      // Add all visible lorebooks that aren't already selected
      const newSelected = [...selectedLorebooks];
      filteredLorebooks.forEach((lorebook: any) => {
        if (!newSelected.some((s) => s.id === lorebook.id)) {
          newSelected.push({
            ...lorebook,
            authorName: selectedAuthor?.name,
            workTitle: selectedWork?.title,
            authorId: selectedAuthor?.id,
            workId: selectedWork?.id,
          });
        }
      });
      setSelectedLorebooks(newSelected);
    } else {
      // Remove all visible lorebooks
      const newSelected = selectedLorebooks.filter(
        (s) => !filteredLorebooks.some((l: any) => l.id === s.id),
      );
      setSelectedLorebooks(newSelected);
    }
  };

  const toggleLorebook = (lorebook: any) => {
    setSelectedLorebooks((prev) => {
      const exists = prev.find((item) => item.id === lorebook.id);
      if (exists) {
        return prev.filter((item) => item.id !== lorebook.id);
      } else {
        if (!selectedAuthor || !selectedWork) return prev;
        return [
          ...prev,
          {
            ...lorebook,
            authorName: selectedAuthor.name,
            workTitle: selectedWork.title,
            authorId: selectedAuthor.id,
            workId: selectedWork.id,
          },
        ];
      }
    });
  };

  // Reset on open or update with initialData
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode: Pre-fill data
        // For editing, we might need to populate selectedLorebooks first.
        setSelectedLorebooks(initialData.lorebooks || []);
        // Set Crown Setting
        if (initialData.crownSettingId) {
          setSelectedCrownSetting(initialData.crownSettingId);
        } else if (initialData.lorebooks && initialData.lorebooks.length > 0) {
          setSelectedCrownSetting(initialData.lorebooks[0].id);
        }
        setConflictConfirmed(true);
        setStep3Confirmed(true);
        setStep4Confirmed(true);
        setStep5Confirmed(true);
        setStep6Confirmed(true);

        setSelectedFormat(initialData.format);
        if (initialData.strategy) {
          setSelectedGenres(
            initialData.strategy.genres ||
              (initialData.strategy.genre ? [initialData.strategy.genre] : []),
          );
          setTargetGenre(initialData.strategy.targetGenre || '');
          setUniverseSetting(initialData.strategy.universe);
        }
        if (initialData.business) {
          setBusiness(initialData.business);
        }
        setMediaDetails(initialData.mediaDetails || {});
        setMediaPrompt(initialData.mediaPrompt || '');

        // Start from step 3 for editing
        setCurrentStep(3);
      } else {
        // Create Mode: Reset to defaults
        setCurrentStep(1);
        setSelectedAuthor(null);
        setSelectedWork(null);
        setSelectedLorebooks([]);
        setConflictConfirmed(false);
        setStep3Confirmed(false);
        setStep4Confirmed(false);
        setStep5Confirmed(false);
        setStep6Confirmed(false);
        setSelectedFormat(null);
        setSelectedGenres([]);
        setTargetGenre('');
        setUniverseSetting('shared');
        setBusiness({
          targetAge: [],
          targetGender: 'all',
          budgetRange: 'medium',
          toneManner: '',
        });
        setMediaDetails({});
        setMediaPrompt('');
        setAuthorSearch('');
        setWorkSearch('');
        setLorebookSearch('');
        setConflictResult(null);
        setSelectedConflict(null);
        setShowConflictDetail(false);
      }
    }
  }, [isOpen, initialData]);

  const handleNext = async () => {
    // Step 1 Validation
    if (currentStep === 1) {
      if (!selectedAuthor) {
        toast.error('작가를 선택해주세요.');
        return;
      }
      if (!selectedWork) {
        toast.error('작품을 선택해주세요.');
        return;
      }
      if (selectedLorebooks.length < 2) {
        toast.error('최소 2개 이상의 설정집을 선택해주세요.');
        return;
      }
      if (!selectedCrownSetting) {
        toast.error('중심이 될 핵심 설정(왕관)을 하나 지정하세요.');
        return;
      }

      // Conflict Check API Call
      setIsConflictChecking(true);
      try {
        const result = await managerService.checkConflicts({
          lorebookIds: selectedLorebooks.map((l) => l.id),
          crownId: selectedCrownSetting,
        });
        setConflictResult(result);
        setCurrentStep(2);
      } catch (error) {
        console.error('Conflict check failed:', error);
        toast.error('설정 충돌 검수 중 오류가 발생했습니다.');
      } finally {
        setIsConflictChecking(false);
      }
      return;
    }

    // Step 2 Validation
    if (currentStep === 2) {
      if (!conflictConfirmed) {
        toast.error('설정 충돌 검수 내용을 확인하고 동의해주세요.');
        return;
      }
    }

    // Step 3 Validation
    if (currentStep === 3) {
      if (!selectedFormat) {
        toast.error('확장 포맷을 선택해주세요.');
        return;
      }
      if (!step3Confirmed) {
        toast.error('확장 포맷 내용을 확인하고 동의해주세요.');
        return;
      }
    }

    // Step 4 Validation
    if (currentStep === 4) {
      if (business.targetAge.length === 0) {
        toast.error('비즈니스 전략 단계에서 타겟 연령대를 선택해주세요.');
        return;
      }
      if (!business.budgetRange) {
        toast.error('비즈니스 전략 단계에서 예산 규모를 선택해주세요.');
        return;
      }
      if (!business.toneManner.trim()) {
        toast.error('비즈니스 전략 단계에서 톤앤매너 키워드를 입력해주세요.');
        return;
      }
      if (!step4Confirmed) {
        toast.error('비즈니스 전략 내용을 확인하고 동의해주세요.');
        return;
      }
    }

    // Step 5 Validation
    if (currentStep === 5) {
      if (
        !['commercial'].includes(selectedFormat || '') &&
        selectedGenres.length === 0
      ) {
        toast.error(
          '매체 상세 설정 단계에서 최소 하나 이상의 장르를 선택해주세요.',
        );
        return;
      }

      if (
        selectedFormat === 'webtoon' &&
        (!mediaDetails.style ||
          !mediaDetails.pacing ||
          !mediaDetails.endingPoint ||
          !mediaDetails.colorTone)
      ) {
        toast.error(
          '웹툰 상세 설정(스타일, 연출 호흡, 엔딩 포인트, 채색 톤)을 모두 입력해주세요.',
        );
        return;
      }
      if (
        selectedFormat === 'drama' &&
        (!mediaDetails.seasonType ||
          !mediaDetails.episodeDuration ||
          !mediaDetails.subFocus)
      ) {
        toast.error(
          '드라마 상세 설정(편성 전략, 회차당 분량, 서브 요소)을 모두 입력해주세요.',
        );
        return;
      }
      if (
        selectedFormat === 'game' &&
        (!mediaDetails.gameGenre ||
          !mediaDetails.coreLoop ||
          !mediaDetails.platform)
      ) {
        toast.error(
          '게임 상세 설정(장르, 핵심 재미요소, 플랫폼)을 모두 입력해주세요.',
        );
        return;
      }
      if (
        selectedFormat === 'spinoff' &&
        (!mediaDetails.spinoffType ||
          !mediaDetails.targetCharacter ||
          !mediaDetails.publishPace)
      ) {
        toast.error(
          '스핀오프 상세 설정(방향성, 주인공 캐릭터, 연재 호흡)을 모두 입력해주세요.',
        );
        return;
      }
      if (
        selectedFormat === 'commercial' &&
        (!mediaDetails.visualFormat ||
          !mediaDetails.usagePurpose ||
          !mediaDetails.targetProduct)
      ) {
        toast.error(
          '상업 이미지 상세 설정(비주얼 포맷, 활용 목적, 타겟 상품군)을 모두 입력해주세요.',
        );
        return;
      }

      if (
        selectedFormat === 'movie' &&
        (!mediaDetails.runningTime ||
          !mediaDetails.colorTheme ||
          !mediaDetails.focusAct)
      ) {
        toast.error(
          '영화 상세 설정(러닝타임, 컬러 테마, 3막 구조)을 모두 입력해주세요.',
        );
        return;
      }

      if (!step5Confirmed) {
        toast.error('매체 상세 설정 내용을 확인하고 동의해주세요.');
        return;
      }
    }

    if (currentStep < 6) setCurrentStep((c) => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((c) => c - 1);
  };

  const handleCreate = async () => {
    if (!step6Confirmed) {
      toast.error('프로젝트 생성을 위해 내용 확인 및 동의가 필요합니다.');
      if (confirmCheckboxRef.current) {
        confirmCheckboxRef.current.focus();
        // Add a temporary highlight effect or shake animation if possible
        confirmCheckboxRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }
    setShowCreateConfirm(true);
  };

  const confirmCreate = () => {
    onCreated({
      authorId: selectedAuthor?.id,
      workId: selectedWork?.id,
      title: projectTitle,
      lorebookIds: selectedLorebooks.map((l: any) => l.id),
      crownLorebookId: selectedCrownSetting,
      format: selectedFormat,
      strategy: {
        genres: selectedGenres,
        targetGenre,
        universe: universeSetting,
      },
      business,
      mediaDetails,
      mediaPrompt,
    });
    // Just mock notification
    toast.success(
      '제안서 생성 요청이 완료되었습니다. (예상 소요시간: 15~20분)',
    );
    setShowCreateConfirm(false);
  };

  // Formats
  const formats = [
    {
      id: 'webtoon',
      title: '웹툰',
      icon: BookOpen,
      desc: '원작의 시각화 및 웹툰 플랫폼 연재',
      color: 'green',
    },
    {
      id: 'drama',
      title: '드라마',
      icon: Tv,
      desc: 'OTT 및 방송사 드라마 제작',
      color: 'purple',
    },
    {
      id: 'game',
      title: '게임',
      icon: Smartphone,
      desc: '모바일 및 PC 게임 개발',
      color: 'blue',
    },
    {
      id: 'movie',
      title: '영화',
      icon: Clapperboard,
      desc: '극장 상영용 장편 영화 제작',
      color: 'red',
    },
    {
      id: 'spinoff',
      title: '스핀오프',
      icon: Zap,
      desc: '조연 캐릭터 중심의 새로운 스토리',
      color: 'amber',
    },
    {
      id: 'commercial',
      title: '상업 이미지',
      icon: ImageIcon,
      desc: '광고 및 브랜드 콜라보레이션 이미지',
      color: 'pink',
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            'flex flex-col p-0 gap-0 transition-all duration-300 shadow-2xl overflow-hidden',
            isFullScreen
              ? '!w-screen !h-screen !max-w-none rounded-none border-0'
              : '!max-w-[95vw] !w-[90vw] h-[92vh] rounded-xl',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-2 border-b bg-white z-10">
            <div>
              <DialogTitle className="text-base font-bold">
                {initialData
                  ? 'IP 확장 프로젝트 수정'
                  : '새로운 IP 확장 프로젝트 생성'}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[10px]">
                6단계 프로세스를 통해 AI 기반 기획 제안서를 생성합니다.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="h-8 w-8"
              >
                {isFullScreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Steps */}
          <div className="px-6 py-4 bg-slate-50 border-b shrink-0">
            <div className="flex items-center justify-center max-w-3xl mx-auto">
              {[
                '설정집 선택',
                '충돌 검수',
                '확장 포맷',
                '비즈니스',
                '매체 상세',
                '최종 검토',
              ].map((label, index) => {
                const step = index + 1;
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;

                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center gap-1 relative">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10',
                          isActive
                            ? 'bg-slate-900 text-white shadow-lg scale-110'
                            : isCompleted
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border-2 border-slate-200 text-slate-400',
                        )}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : step}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-medium absolute -bottom-4 w-20 text-center',
                          isActive
                            ? 'text-slate-900'
                            : isCompleted
                              ? 'text-slate-500'
                              : 'text-slate-300',
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    {step < 6 && (
                      <div
                        className={cn(
                          'w-10 sm:w-16 h-[2px] mx-1 mb-2',
                          isCompleted ? 'bg-slate-900' : 'bg-slate-200',
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
            {currentStep === 1 && (
              <div className="h-full p-4 max-w-[1600px] mx-auto flex flex-col">
                {/* Step 1: Selection */}
                <div className="flex-1 min-h-0 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full min-h-0">
                    {/* 1. Authors */}
                    <Card className="flex flex-col min-h-[500px] lg:h-full border-slate-200 shadow-sm hover:border-slate-300 transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-white shrink-0">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 text-base">
                          <Users className="w-4 h-4 text-slate-500" /> 작가 선택
                        </h3>
                        <div className="relative mt-2">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                          <Input
                            placeholder="작가 검색..."
                            className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                            value={authorSearch}
                            onChange={(e) => setAuthorSearch(e.target.value)}
                          />
                        </div>
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-white overflow-y-auto">
                        <div className="p-3 space-y-1.5">
                          {filteredAuthors.map((author: any) => (
                            <div
                              key={author.id}
                              onClick={() => {
                                setSelectedAuthor(author);
                                setSelectedWork(null);
                              }}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm border border-transparent',
                                selectedAuthor?.id === author.id
                                  ? 'bg-slate-900 text-white shadow-md transform scale-[1.01]'
                                  : 'hover:bg-slate-50 text-slate-700 hover:border-slate-200',
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                {author.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold truncate">
                                  <HighlightText
                                    text={author.name}
                                    highlight={authorSearch}
                                  />
                                </div>
                                <div
                                  className={cn(
                                    'text-xs truncate mt-0.5',
                                    selectedAuthor?.id === author.id
                                      ? 'text-slate-300'
                                      : 'text-slate-500',
                                  )}
                                >
                                  작품 {author.workCount || 0}개
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-50" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>

                    {/* 2. Works */}
                    <Card className="flex flex-col min-h-[500px] lg:h-full border-slate-200 shadow-sm hover:border-slate-300 transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-white shrink-0">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 text-base">
                          <BookOpen className="w-4 h-4 text-slate-500" /> 작품
                          선택
                        </h3>
                        <div className="relative mt-2">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                          <Input
                            placeholder="작품 검색..."
                            className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                            value={workSearch}
                            onChange={(e) => setWorkSearch(e.target.value)}
                            disabled={!selectedAuthor}
                          />
                        </div>
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-white overflow-y-auto">
                        {!selectedAuthor ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center min-h-[200px]">
                            <Users className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">
                              작가를 먼저 선택해주세요
                            </p>
                          </div>
                        ) : filteredWorks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center min-h-[200px]">
                            <p className="text-sm">등록된 작품이 없습니다</p>
                          </div>
                        ) : (
                          <div className="p-3 space-y-1.5">
                            {filteredWorks.map((work: any) => (
                              <div
                                key={work.id}
                                onClick={() => setSelectedWork(work)}
                                className={cn(
                                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm border border-transparent',
                                  selectedWork?.id === work.id
                                    ? 'bg-slate-900 text-white shadow-md transform scale-[1.01]'
                                    : 'hover:bg-slate-50 text-slate-700 hover:border-slate-200',
                                )}
                              >
                                {work.coverImageUrl ? (
                                  <img
                                    src={work.coverImageUrl}
                                    alt={work.title}
                                    className="w-10 h-14 object-cover rounded-md shadow-sm bg-slate-200"
                                  />
                                ) : (
                                  <div className="w-10 h-14 rounded-md bg-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                                    No Img
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold line-clamp-2 leading-tight">
                                    <HighlightText
                                      text={work.title}
                                      highlight={workSearch}
                                    />
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs mt-1',
                                      selectedWork?.id === work.id
                                        ? 'text-slate-300'
                                        : 'text-slate-500',
                                    )}
                                  >
                                    {work.genre || '장르 미정'}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </Card>

                    {/* 3. Lorebooks */}
                    <Card className="flex flex-col min-h-[500px] lg:h-full border-slate-200 shadow-sm hover:border-slate-300 transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-white shrink-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold flex items-center gap-2 text-slate-800 text-base">
                            설정집 선택
                          </h3>
                          {selectedWork && filteredLorebooks.length > 0 && (
                            <label
                              htmlFor="select-all-lorebooks"
                              className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
                            >
                              <Checkbox
                                id="select-all-lorebooks"
                                checked={
                                  filteredLorebooks.length > 0 &&
                                  filteredLorebooks.every((l: any) =>
                                    selectedLorebooks.some(
                                      (s) => s.id === l.id,
                                    ),
                                  )
                                }
                                onCheckedChange={(checked) =>
                                  toggleAllLorebooks(!!checked)
                                }
                              />
                              <span className="text-xs text-slate-500 font-medium select-none">
                                전체 선택
                              </span>
                            </label>
                          )}
                        </div>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                          <Input
                            placeholder="키워드 검색..."
                            className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                            value={lorebookSearch}
                            onChange={(e) => setLorebookSearch(e.target.value)}
                            disabled={!selectedWork}
                          />
                        </div>
                        {selectedWork && (
                          <Tabs
                            value={lorebookCategoryTab}
                            onValueChange={setLorebookCategoryTab}
                            className="w-full"
                          >
                            <TabsList className="w-full grid grid-cols-7 h-auto p-1 bg-slate-100/80">
                              {[
                                { id: 'all', label: '전체' },
                                { id: 'characters', label: '인물' },
                                { id: 'places', label: '장소' },
                                { id: 'items', label: '물건' },
                                { id: 'groups', label: '단체' },
                                { id: 'worldviews', label: '세계' },
                                { id: 'plots', label: '사건' },
                              ].map((tab) => (
                                <TabsTrigger
                                  key={tab.id}
                                  value={tab.id}
                                  className="text-[10px] font-bold px-0.5 py-1.5 h-7 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center justify-center transition-all text-slate-500"
                                >
                                  {tab.label}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </Tabs>
                        )}
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-white scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent overflow-y-auto">
                        {!selectedWork ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center min-h-[200px]">
                            <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">
                              작품을 먼저 선택해주세요
                            </p>
                          </div>
                        ) : filteredLorebooks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center min-h-[200px]">
                            <p className="text-sm">
                              {lorebookCategoryTab === 'all'
                                ? '등록된 설정집이 없습니다'
                                : '해당 카테고리의 설정집이 없습니다'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 space-y-2">
                            {filteredLorebooks.map(
                              (lorebook: any, index: number) => {
                                const isSelected = selectedLorebooks.some(
                                  (item) => item.id === lorebook.id,
                                );
                                return (
                                  <label
                                    key={`${lorebook.id}-${index}`}
                                    className={cn(
                                      'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border text-sm group',
                                      isSelected
                                        ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-400 shadow-sm'
                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm',
                                    )}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() =>
                                        toggleLorebook(lorebook)
                                      }
                                      className="mt-0.5 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                    />
                                    <div className="flex-1 min-w-0 select-none">
                                      <div className="font-bold flex items-center gap-2 text-slate-800">
                                        <HighlightText
                                          text={lorebook.keyword}
                                          highlight={lorebookSearch}
                                        />
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] h-4 px-1 bg-slate-100 text-slate-600 border-slate-200"
                                        >
                                          {lorebook.category}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                        {typeof lorebook.setting === 'string'
                                          ? lorebook.setting
                                          : JSON.stringify(lorebook.setting)}
                                      </p>
                                    </div>
                                  </label>
                                );
                              },
                            )}
                          </div>
                        )}
                      </ScrollArea>
                    </Card>

                    {/* 4. Selected List */}
                    <Card className="flex flex-col overflow-hidden min-h-[500px] lg:h-full border-slate-200 shadow-sm bg-slate-50/50">
                      <CardHeader className="py-4 px-4 border-b bg-slate-100/50 shrink-0 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold flex items-center gap-2 text-slate-800 text-base">
                              <Check className="w-4 h-4 text-slate-500" />{' '}
                              선택된 설정집 ({selectedLorebooks.length})
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              다양한 작품의 설정집을 조합할 수 있습니다.
                            </p>
                          </div>
                        </div>

                        {/* Analysis Badges & Unselected Guide */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <TooltipProvider>
                            {analysisBadges.length > 0 && (
                              <>
                                {analysisBadges.map((badge, idx) => (
                                  <Tooltip key={idx} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'cursor-pointer font-medium border text-xs px-2.5 h-6 hover:opacity-80 transition-opacity',
                                          badge.color,
                                        )}
                                      >
                                        {badge.label}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="z-[1000] bg-slate-900 text-white border-0 shadow-xl">
                                      <p className="max-w-[240px] text-xs leading-relaxed font-medium">
                                        {badge.tooltip}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </>
                            )}

                            {/* Unselected Category Guide */}
                            {unselectedCategoryTips.length > 0 && (
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  className="p-4 max-w-[300px] space-y-3 z-[100] bg-slate-900 border-slate-800 text-white shadow-xl"
                                >
                                  <div className="font-bold mb-1 text-sm flex items-center gap-2">
                                    <Info className="w-4 h-4 text-sky-400" />
                                    미선택 카테고리 가이드
                                  </div>
                                  <ul className="space-y-2.5">
                                    {unselectedCategoryTips.map((tip, idx) => (
                                      <li
                                        key={idx}
                                        className="flex flex-col gap-1"
                                      >
                                        <span className="font-bold text-xs text-sky-200">
                                          {tip.label}
                                        </span>
                                        <span className="text-[11px] text-slate-300 leading-tight">
                                          {tip.text}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TooltipProvider>
                        </div>
                      </CardHeader>
                      <ScrollArea className="flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent overflow-y-auto">
                        {selectedLorebooks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center min-h-[200px]">
                            <p className="text-sm font-medium">
                              선택된 설정집이 없습니다.
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 space-y-2">
                            {selectedLorebooks.map((item, idx) => (
                              <SelectedSettingCard
                                key={item.id}
                                item={item}
                                onRemove={() => {
                                  setSelectedLorebooks((prev) =>
                                    prev.filter((l) => l.id !== item.id),
                                  );
                                  if (selectedCrownSetting === item.id) {
                                    setSelectedCrownSetting(null);
                                  }
                                }}
                                isCrown={selectedCrownSetting === item.id}
                                onSelectCrown={() =>
                                  setSelectedCrownSetting((prev) =>
                                    prev === item.id ? null : item.id,
                                  )
                                }
                              />
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Conflict Check */}
            {currentStep === 2 && (
              <div className="w-full max-w-[900px] mx-auto py-6 h-full flex flex-col">
                <div className="text-center mb-6 shrink-0">
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-slate-900">
                    설정 충돌 검수
                  </h2>
                  <p className="text-sm text-slate-500">
                    선택한 설정집들 간의 논리적 충돌 가능성을 분석했습니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-slate-200 shadow-sm bg-white">
                  <CardHeader className="border-b bg-slate-50/50 py-3 px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold">AI 분석 결과</span>
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-5"
                        >
                          {Object.values(conflictResult?.충돌 || {}).reduce(
                            (acc: number, items: any) =>
                              acc + (Array.isArray(items) ? items.length : 0),
                            0,
                          )}
                          건의 충돌 감지
                        </Badge>
                      </CardTitle>
                      <span className="text-[10px] text-slate-400">
                        Analysis ID: #EXP-
                        {Math.floor(Math.random() * 10000)
                          .toString()
                          .padStart(4, '0')}
                      </span>
                    </div>
                  </CardHeader>
                  <ScrollArea className="flex-1 bg-white">
                    <div className="p-5 space-y-3">
                      {Object.entries(conflictResult?.충돌 || {}).flatMap(
                        ([category, items]: [string, any]) =>
                          items.flatMap((item: any, idx: number) => {
                            const itemName = Object.keys(item).find(
                              (k) => !['신규설정', '기존설정'].includes(k),
                            );
                            if (!itemName) return null;
                            const description = item[itemName];
                            const reason = parseConflictReason(description);

                            return (
                              <div
                                key={`${category}-${idx}`}
                                onClick={() => {
                                  setSelectedConflict({
                                    ...item,
                                    itemName,
                                    category,
                                  });
                                  setShowConflictDetail(true);
                                }}
                                className="group p-4 rounded-lg border border-slate-100 bg-slate-50/30 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300 cursor-pointer"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 group-hover:border-amber-300 group-hover:text-amber-600 transition-colors">
                                      !
                                    </span>
                                    {category} - {itemName}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-normal text-slate-400 border-slate-200"
                                  >
                                    상세 보기 &gt;
                                  </Badge>
                                </div>
                                <p className="text-slate-600 text-xs leading-relaxed pl-7 line-clamp-2">
                                  {reason}
                                </p>
                              </div>
                            );
                          }),
                      )}
                      {(!conflictResult ||
                        Object.values(conflictResult?.충돌 || {}).every(
                          (items: any) => !items.length,
                        )) && (
                        <div className="text-center py-10 text-slate-500">
                          충돌 사항이 발견되지 않았습니다.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <CardFooter className="bg-slate-50/80 border-t p-4 shrink-0 backdrop-blur-sm">
                    <label
                      htmlFor="conflict-agree"
                      className="flex items-center gap-3 w-full p-3 rounded-lg border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <Checkbox
                        id="conflict-agree"
                        checked={conflictConfirmed}
                        onCheckedChange={(c) => setConflictConfirmed(!!c)}
                        className="w-4 h-4 border-2 border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-colors"
                      />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 select-none block w-full transition-colors">
                        위의 잠재적 충돌 내용을 확인하였으며, 이를 인지하고
                        프로젝트를 진행합니다.
                      </span>
                    </label>
                  </CardFooter>
                </Card>

                <Dialog
                  open={showConflictDetail}
                  onOpenChange={setShowConflictDetail}
                >
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>설정 충돌 상세 분석</DialogTitle>
                      <DialogDescription>
                        기존 설정과 신규 설정 간의 충돌 내용을 비교하고 병합
                        방식을 결정하세요.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                      <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-md text-sm border border-amber-100">
                        <span className="font-bold mr-2">[AI 판단 사유]</span>
                        {selectedConflict &&
                          parseConflictReason(
                            selectedConflict[selectedConflict.itemName],
                          )}
                      </div>

                      <Tabs defaultValue="merge" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="merge">
                            설정 결합 (Merge)
                          </TabsTrigger>
                          <TabsTrigger value="raw">Raw Data</TabsTrigger>
                        </TabsList>
                        <TabsContent value="merge" className="mt-4">
                          <SettingComparison
                            original={selectedConflict?.기존설정}
                            updated={selectedConflict?.신규설정}
                          />
                        </TabsContent>
                        <TabsContent value="raw">
                          <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-[300px]">
                            {JSON.stringify(selectedConflict, null, 2)}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setShowConflictDetail(false)}>
                        확인
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Step 3: Expansion Format */}
            {currentStep === 3 && (
              <div className="w-full max-w-[900px] mx-auto py-6 h-full">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-slate-900">
                    확장 포맷 선택
                  </h2>
                  <p className="text-sm text-slate-500">
                    IP 확장의 방향성을 결정하는 포맷을 선택합니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formats.map((format) => {
                      const isRecommended = recommendedFormats.includes(
                        format.id,
                      );
                      return (
                        <div
                          key={format.id}
                          onClick={() => setSelectedFormat(format.id)}
                          className={cn(
                            'cursor-pointer rounded-xl border-2 p-5 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group',
                            selectedFormat === format.id
                              ? 'border-slate-900 bg-slate-50 shadow-md scale-[1.01]'
                              : isRecommended
                                ? 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-300 hover:shadow-md ring-1 ring-indigo-100'
                                : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm',
                          )}
                        >
                          {isRecommended && (
                            <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                              AI 추천
                            </div>
                          )}
                          <div
                            className={cn(
                              'mb-3 w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                              selectedFormat === format.id
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
                            )}
                          >
                            <format.icon className="w-5 h-5" />
                          </div>
                          <div className="font-bold text-slate-900 text-base mb-1.5">
                            {format.title}
                          </div>
                          <div className="text-xs text-slate-500 leading-relaxed opacity-90">
                            {format.desc}
                          </div>
                          {selectedFormat === format.id && (
                            <div className="absolute top-3 right-3 text-slate-900 bg-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t flex justify-end">
                  <label
                    htmlFor="step3-confirm"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      id="step3-confirm"
                      checked={step3Confirmed}
                      onCheckedChange={(c) => setStep3Confirmed(!!c)}
                      className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 w-4 h-4"
                    />
                    <span className="text-sm font-medium select-none text-slate-700">
                      위 포맷으로 확장을 진행합니다.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Business */}
            {currentStep === 4 && (
              <div className="w-full max-w-[700px] mx-auto py-6 h-full">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-slate-900">
                    비즈니스 전략
                  </h2>
                  <p className="text-sm text-slate-500">
                    타겟 독자층과 예산 규모를 설정하여 현실적인 기획안을
                    도출합니다.
                  </p>
                </div>

                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    {/* Target Age & Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-800">
                          타겟 연령대
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {['10대', '20대', '30대', '40대 이상'].map((age) => (
                            <div
                              key={age}
                              onClick={() => {
                                setBusiness((prev) => {
                                  const exists = prev.targetAge.includes(age);
                                  return {
                                    ...prev,
                                    targetAge: exists
                                      ? prev.targetAge.filter((a) => a !== age)
                                      : [...prev.targetAge, age],
                                  };
                                });
                              }}
                              className={cn(
                                'cursor-pointer px-3 py-1.5 rounded-full border text-xs transition-all font-medium select-none',
                                business.targetAge.includes(age)
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200',
                              )}
                            >
                              {age}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-800">
                          타겟 성별<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { val: 'all', label: '전체' },
                            { val: 'male', label: '남성' },
                            { val: 'female', label: '여성' },
                          ].map((opt) => (
                            <div
                              key={opt.val}
                              onClick={() =>
                                setBusiness({
                                  ...business,
                                  targetGender: opt.val,
                                })
                              }
                              className={cn(
                                'cursor-pointer py-1.5 rounded-lg border text-xs transition-all font-medium text-center select-none',
                                business.targetGender === opt.val
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200',
                              )}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Budget */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">
                        예산 규모<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          {
                            val: 'low',
                            label: '저예산',
                            sub: '인디/실험적',
                          },
                          {
                            val: 'medium',
                            label: '중예산',
                            sub: '일반 상업',
                          },
                          {
                            val: 'high',
                            label: '고예산',
                            sub: '블록버스터',
                          },
                          {
                            val: 'very_high',
                            label: '초대형',
                            sub: '글로벌 타겟',
                          },
                        ].map((opt) => (
                          <div
                            key={opt.val}
                            onClick={() =>
                              setBusiness({
                                ...business,
                                budgetRange: opt.val,
                              })
                            }
                            className={cn(
                              'cursor-pointer p-3 rounded-lg border text-left transition-all select-none',
                              business.budgetRange === opt.val
                                ? 'bg-slate-900 border-slate-900 shadow-sm'
                                : 'bg-white hover:bg-slate-50 border-slate-200',
                            )}
                          >
                            <div
                              className={cn(
                                'font-bold text-xs',
                                business.budgetRange === opt.val
                                  ? 'text-white'
                                  : 'text-slate-800',
                              )}
                            >
                              {opt.label}
                            </div>
                            <div
                              className={cn(
                                'text-[10px] mt-0.5',
                                business.budgetRange === opt.val
                                  ? 'text-slate-300'
                                  : 'text-slate-400',
                              )}
                            >
                              {opt.sub}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Tone & Manner */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">
                        톤앤매너 키워드
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        placeholder="예: 어두운, 희망적인, 코믹한, 진지한..."
                        value={business.toneManner}
                        onChange={(e) =>
                          setBusiness({
                            ...business,
                            toneManner: e.target.value,
                          })
                        }
                        className="h-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 border-t p-4 flex justify-end">
                    <label
                      htmlFor="step4-confirm"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        id="step4-confirm"
                        checked={step4Confirmed}
                        onCheckedChange={(c) => setStep4Confirmed(!!c)}
                        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 w-4 h-4"
                      />
                      <span className="text-sm font-medium select-none text-slate-700">
                        비즈니스 전략 확인 완료
                      </span>
                    </label>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Step 5: Media Details & Genre */}
            {currentStep === 5 && (
              <div className="w-full max-w-[900px] mx-auto py-6 h-full flex flex-col">
                <div className="text-center mb-6 shrink-0">
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-slate-900">
                    매체 및 장르 상세 설정
                  </h2>
                  <p className="text-sm text-slate-500">
                    <span className="font-bold text-slate-900">
                      {formats.find((f) => f.id === selectedFormat)?.title}
                    </span>{' '}
                    포맷에 최적화된 장르와 가이드라인을 설정합니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-slate-200 shadow-sm bg-white">
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                      {/* Genre & Universe Section */}
                      <div className="space-y-6">
                        {/* Conditional Genre Selection */}
                        {!['commercial'].includes(selectedFormat || '') && (
                          <>
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-slate-500" />
                                장르 선택 (단일 선택 가능)
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 font-medium">
                                  {selectedGenres.length}개 선택됨
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setShowAllGenres(!showAllGenres)
                                  }
                                  className="h-6 text-xs text-slate-500 hover:text-slate-900"
                                >
                                  {showAllGenres ? (
                                    <>
                                      접기{' '}
                                      <ChevronDown className="w-3 h-3 ml-1 rotate-180" />
                                    </>
                                  ) : (
                                    <>
                                      더 보기{' '}
                                      <ChevronDown className="w-3 h-3 ml-1" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {[
                                { id: 'romance', label: '로맨스' },
                                { id: 'fantasy', label: '판타지' },
                                { id: 'martial_arts', label: '무협' },
                                { id: 'modern', label: '현대물' },
                                { id: 'thriller', label: '스릴러/공포' },
                                { id: 'sf', label: 'SF' },
                                { id: 'sports', label: '스포츠' },
                                { id: 'comedy', label: '일상/개그' },
                                { id: 'mystery', label: '추리' },
                                { id: 'history', label: '역사' },
                                { id: 'drama', label: '드라마' },
                                { id: 'action', label: '액션' },
                              ]
                                .slice(0, showAllGenres ? undefined : 6)
                                .map((genre) => {
                                  const isSelected = selectedGenres.includes(
                                    genre.id,
                                  );
                                  return (
                                    <div
                                      key={genre.id}
                                      onClick={() => {
                                        setSelectedGenres([genre.id]);
                                      }}
                                      className={cn(
                                        'flex items-center justify-center p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all text-center select-none',
                                        isSelected
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-[1.02]'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
                                      )}
                                    >
                                      {genre.label}
                                    </div>
                                  );
                                })}
                            </div>
                          </>
                        )}

                        {/* Universe Setting */}
                        <div className="pt-6 border-t border-slate-100">
                          <Label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                            <Globe className="w-3.5 h-3.5 text-slate-500" />
                            세계관 설정
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              {
                                id: 'shared',
                                label: '공유 세계관 (Shared)',
                                desc: '원작 설정을 공유하며 확장',
                              },
                              {
                                id: 'parallel',
                                label: '평행 세계 (Parallel)',
                                desc: '독자적인 노선으로 재해석',
                              },
                            ].map((option) => (
                              <div
                                key={option.id}
                                onClick={() =>
                                  setUniverseSetting(option.id as any)
                                }
                                className={cn(
                                  'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                                  universeSetting === option.id
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                                )}
                              >
                                <div
                                  className={cn(
                                    'w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0',
                                    universeSetting === option.id
                                      ? 'border-white'
                                      : 'border-slate-300',
                                  )}
                                >
                                  {universeSetting === option.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-xs">
                                    {option.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-[10px] mt-0.5',
                                      universeSetting === option.id
                                        ? 'text-slate-300'
                                        : 'text-slate-500',
                                    )}
                                  >
                                    {option.desc}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      {/* Dynamic Content based on selectedFormat */}
                      {selectedFormat === 'webtoon' && (
                        <div className="space-y-6">
                          {/* Style Selection */}
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                              그림체 스타일
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                {
                                  id: 'realistic',
                                  label: '실사체',
                                  desc: '영화같은 몰입감',
                                },
                                {
                                  id: 'casual',
                                  label: '캐주얼/SD',
                                  desc: '가볍고 귀여운',
                                },
                                {
                                  id: 'martial_arts',
                                  label: '무협/극화체',
                                  desc: '강렬한 선화',
                                },
                                {
                                  id: 'us_comics',
                                  label: '미국 코믹스',
                                  desc: '역동적인 명암',
                                },
                              ].map((style) => (
                                <div
                                  key={style.id}
                                  onClick={() =>
                                    setMediaDetails({
                                      ...mediaDetails,
                                      style: style.id,
                                    })
                                  }
                                  className={cn(
                                    'cursor-pointer p-3 rounded-lg border text-left transition-all hover:-translate-y-1 duration-200',
                                    mediaDetails.style === style.id
                                      ? 'bg-slate-900 border-slate-900 shadow-md'
                                      : 'bg-white hover:bg-slate-50 border-slate-200',
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'font-bold mb-1 text-xs',
                                      mediaDetails.style === style.id
                                        ? 'text-white'
                                        : 'text-slate-800',
                                    )}
                                  >
                                    {style.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-[10px]',
                                      mediaDetails.style === style.id
                                        ? 'text-slate-300'
                                        : 'text-slate-400',
                                    )}
                                  >
                                    {style.desc}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Pacing Selection */}
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              연출 호흡
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {[
                                {
                                  id: 'fast',
                                  label: '빠른 전개',
                                  desc: '액션/스릴러 중심',
                                },
                                {
                                  id: 'emotional',
                                  label: '감정선 중심',
                                  desc: '드라마/로맨스',
                                },
                                {
                                  id: 'suspense',
                                  label: '긴장감 조성',
                                  desc: '미스터리/공포',
                                },
                              ].map((pacing) => (
                                <div
                                  key={pacing.id}
                                  onClick={() =>
                                    setMediaDetails({
                                      ...mediaDetails,
                                      pacing: pacing.id,
                                    })
                                  }
                                  className={cn(
                                    'cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all',
                                    mediaDetails.pacing === pacing.id
                                      ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                      : 'bg-white border-slate-200 hover:bg-slate-50',
                                  )}
                                >
                                  <div>
                                    <div className="font-bold text-slate-800 text-xs">
                                      {pacing.label}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      {pacing.desc}
                                    </div>
                                  </div>
                                  {mediaDetails.pacing === pacing.id && (
                                    <Check className="w-3.5 h-3.5 text-slate-900" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Detailed Inputs Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                회차별 엔딩 포인트
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Select
                                value={mediaDetails.endingPoint}
                                onValueChange={(v) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    endingPoint: v,
                                  })
                                }
                              >
                                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value="cliffhanger"
                                    className="text-xs"
                                  >
                                    절단신공 (Cliffhanger)
                                  </SelectItem>
                                  <SelectItem
                                    value="resolution"
                                    className="text-xs"
                                  >
                                    에피소드 완결형
                                  </SelectItem>
                                  <SelectItem
                                    value="preview"
                                    className="text-xs"
                                  >
                                    다음 화 예고 강조
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                채색 톤
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                placeholder="예: 파스텔톤, 누아르 흑백..."
                                value={mediaDetails.colorTone || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    colorTone: e.target.value,
                                  })
                                }
                                className="h-9 text-xs bg-slate-50 border-slate-200"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'movie' && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              러닝타임 & 구조
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {[
                                {
                                  id: '90',
                                  label: '90분 내외',
                                  desc: '컴팩트한 전개',
                                },
                                {
                                  id: '120',
                                  label: '120분 (표준)',
                                  desc: '안정적인 3막 구조',
                                },
                                {
                                  id: '150',
                                  label: '150분 이상',
                                  desc: '대서사시/블록버스터',
                                },
                              ].map((time) => (
                                <div
                                  key={time.id}
                                  onClick={() =>
                                    setMediaDetails({
                                      ...mediaDetails,
                                      runningTime: time.id,
                                    })
                                  }
                                  className={cn(
                                    'cursor-pointer p-3 rounded-lg border text-center transition-all',
                                    mediaDetails.runningTime === time.id
                                      ? 'bg-slate-900 border-slate-900 text-white'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                                  )}
                                >
                                  <div className="font-bold text-xs">
                                    {time.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-[10px] mt-0.5',
                                      mediaDetails.runningTime === time.id
                                        ? 'text-slate-300'
                                        : 'text-slate-400',
                                    )}
                                  >
                                    {time.desc}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                시각적 컬러 테마
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                placeholder="예: 차가운 블루톤..."
                                value={mediaDetails.colorTheme || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    colorTheme: e.target.value,
                                  })
                                }
                                className="h-9 text-xs bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                3막 구조 강조 구간
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Select
                                value={mediaDetails.focusAct}
                                onValueChange={(v) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    focusAct: v,
                                  })
                                }
                              >
                                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="act1" className="text-xs">
                                    1막: 설정 및 도발적 사건
                                  </SelectItem>
                                  <SelectItem value="act2" className="text-xs">
                                    2막: 갈등의 고조 및 대립
                                  </SelectItem>
                                  <SelectItem value="act3" className="text-xs">
                                    3막: 클라이막스 및 해결
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'drama' && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              편성 전략
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div
                                onClick={() =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    seasonType: 'miniseries',
                                  })
                                }
                                className={cn(
                                  'cursor-pointer p-3 rounded-lg border transition-all flex items-center gap-3',
                                  mediaDetails.seasonType === 'miniseries'
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50',
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                  <Film className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 text-xs">
                                    단막극/미니시리즈
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    1시즌 완결, 밀도 높은 전개
                                  </div>
                                </div>
                              </div>
                              <div
                                onClick={() =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    seasonType: 'multi_season',
                                  })
                                }
                                className={cn(
                                  'cursor-pointer p-3 rounded-lg border transition-all flex items-center gap-3',
                                  mediaDetails.seasonType === 'multi_season'
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50',
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                  <Tv className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 text-xs">
                                    멀티 시즌
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    장기적인 세계관 확장 가능
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                회차당 분량
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Select
                                value={mediaDetails.episodeDuration}
                                onValueChange={(v) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    episodeDuration: v,
                                  })
                                }
                              >
                                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30" className="text-xs">
                                    30분 (시트콤/숏폼)
                                  </SelectItem>
                                  <SelectItem value="60" className="text-xs">
                                    60분 (표준)
                                  </SelectItem>
                                  <SelectItem value="80" className="text-xs">
                                    80분 이상 (스페셜)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                강조하고 싶은 서브 요소
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                placeholder="예: 서브 남주의 서사..."
                                value={mediaDetails.subFocus || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    subFocus: e.target.value,
                                  })
                                }
                                className="h-9 text-xs bg-slate-50 border-slate-200"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'game' && (
                        <div className="space-y-6">
                          {/* Game Genre & Core Loop */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                게임 장르
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                placeholder="예: 수집형 RPG..."
                                value={mediaDetails.gameGenre || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    gameGenre: e.target.value,
                                  })
                                }
                                className="h-9 text-xs bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                핵심 재미요소 (Core Loop)
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Select
                                value={mediaDetails.coreLoop}
                                onValueChange={(v) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    coreLoop: v,
                                  })
                                }
                              >
                                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value="growth"
                                    className="text-xs"
                                  >
                                    성장 및 육성 (RPG)
                                  </SelectItem>
                                  <SelectItem
                                    value="combat"
                                    className="text-xs"
                                  >
                                    전투 및 경쟁 (PvP)
                                  </SelectItem>
                                  <SelectItem
                                    value="collection"
                                    className="text-xs"
                                  >
                                    수집 및 도감 (Gacha)
                                  </SelectItem>
                                  <SelectItem value="story" className="text-xs">
                                    스토리 및 선택 (Visual Novel)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Platform & BM */}
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Gamepad2 className="w-3.5 h-3.5 text-slate-500" />
                              플랫폼 및 BM 전략
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div
                                onClick={() =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    platform: 'mobile',
                                  })
                                }
                                className={cn(
                                  'cursor-pointer p-3 rounded-lg border transition-all flex items-center gap-3',
                                  mediaDetails.platform === 'mobile'
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50',
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <Smartphone className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 text-xs">
                                    모바일 (F2P)
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    광고/인앱결제 수익화
                                  </div>
                                </div>
                              </div>
                              <div
                                onClick={() =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    platform: 'pc_console',
                                  })
                                }
                                className={cn(
                                  'cursor-pointer p-3 rounded-lg border transition-all flex items-center gap-3',
                                  mediaDetails.platform === 'pc_console'
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50',
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                  <Monitor className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 text-xs">
                                    PC/콘솔 (Package)
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    판매 수익 및 DLC
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'spinoff' && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-slate-500" />
                              스핀오프 방향성
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {[
                                {
                                  id: 'prequel',
                                  label: '프리퀄',
                                  desc: '과거 시점의 이야기',
                                },
                                {
                                  id: 'sequel',
                                  label: '시퀄',
                                  desc: '미래 시점의 이야기',
                                },
                                {
                                  id: 'side_story',
                                  label: '외전',
                                  desc: '동시간대 다른 장소',
                                },
                                {
                                  id: 'if_story',
                                  label: 'IF 스토리',
                                  desc: '만약의 세계',
                                },
                                {
                                  id: 'crossover',
                                  label: '크로스오버',
                                  desc: '타 작품과 결합',
                                },
                                {
                                  id: 'remake',
                                  label: '리메이크',
                                  desc: '현대적 재해석',
                                },
                                {
                                  id: 'character_story',
                                  label: '캐릭터 열전',
                                  desc: '특정 인물 중심',
                                },
                                {
                                  id: 'au',
                                  label: 'AU',
                                  desc: '대체 우주 설정',
                                },
                              ]
                                .slice(0, showAllSpinoffs ? undefined : 3)
                                .map((type) => (
                                  <div
                                    key={type.id}
                                    onClick={() =>
                                      setMediaDetails({
                                        ...mediaDetails,
                                        spinoffType: type.id,
                                      })
                                    }
                                    className={cn(
                                      'cursor-pointer p-3 rounded-lg border text-center transition-all',
                                      mediaDetails.spinoffType === type.id
                                        ? 'bg-slate-900 border-slate-900 text-white'
                                        : 'bg-white border-slate-200 hover:bg-slate-50',
                                    )}
                                  >
                                    <div className="font-bold text-xs">
                                      {type.label}
                                    </div>
                                    <div
                                      className={cn(
                                        'text-[10px] mt-0.5',
                                        mediaDetails.spinoffType === type.id
                                          ? 'text-slate-300'
                                          : 'text-slate-500',
                                      )}
                                    >
                                      {type.desc}
                                    </div>
                                  </div>
                                ))}
                              {!showAllSpinoffs && (
                                <div
                                  onClick={() => setShowAllSpinoffs(true)}
                                  className="cursor-pointer p-3 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center hover:bg-slate-50 transition-all"
                                >
                                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                                    <Plus className="w-3 h-3 text-slate-500" />
                                  </div>
                                  <span className="text-xs text-slate-500 font-medium">
                                    더보기
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                주인공 캐릭터 (Target Character)
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                placeholder="예: 조연 B, 악역 C..."
                                value={mediaDetails.targetCharacter || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    targetCharacter: e.target.value,
                                  })
                                }
                                className="h-9 text-xs bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                연재 호흡
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Select
                                value={mediaDetails.publishPace}
                                onValueChange={(v) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    publishPace: v,
                                  })
                                }
                              >
                                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value="weekly"
                                    className="text-xs"
                                  >
                                    주간 연재 (웹소설/웹툰)
                                  </SelectItem>
                                  <SelectItem
                                    value="volume"
                                    className="text-xs"
                                  >
                                    단행본 출간
                                  </SelectItem>
                                  <SelectItem value="short" className="text-xs">
                                    단편 옴니버스
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'commercial' && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                              비주얼 포맷
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {[
                                {
                                  id: '2d_illust',
                                  label: '2D 일러스트',
                                  desc: '고해상도 홍보용',
                                },
                                {
                                  id: '3d_model',
                                  label: '3D 모델링',
                                  desc: '피규어/메타버스',
                                },
                                {
                                  id: 'sd_character',
                                  label: 'SD 캐릭터',
                                  desc: '이모티콘/굿즈',
                                },
                              ].map((type) => (
                                <div
                                  key={type.id}
                                  onClick={() =>
                                    setMediaDetails({
                                      ...mediaDetails,
                                      visualFormat: type.id,
                                    })
                                  }
                                  className={cn(
                                    'cursor-pointer p-3 rounded-lg border text-center transition-all',
                                    mediaDetails.visualFormat === type.id
                                      ? 'bg-slate-900 border-slate-900 text-white'
                                      : 'bg-white border-slate-200 hover:bg-slate-50',
                                  )}
                                >
                                  <div className="font-bold text-xs">
                                    {type.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-[10px] mt-0.5',
                                      mediaDetails.visualFormat === type.id
                                        ? 'text-slate-300'
                                        : 'text-slate-500',
                                    )}
                                  >
                                    {type.desc}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                활용 목적
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                placeholder="예: 팝업스토어 포스터..."
                                value={mediaDetails.usagePurpose || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    usagePurpose: e.target.value,
                                  })
                                }
                                className="h-9 text-xs bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700">
                                타겟 상품군
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                placeholder="예: 의류, 문구..."
                                value={mediaDetails.targetProduct || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    targetProduct: e.target.value,
                                  })
                                }
                                className="h-9 text-xs bg-slate-50 border-slate-200"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Common Prompt Field (Enhanced) */}
                      <div className="pt-6 border-t border-slate-100">
                        <Label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          추가 프롬프트 (선택사항)
                        </Label>
                        <p className="text-xs text-slate-500 mb-2">
                          AI에게 전달할 특별한 지시사항이나 제약조건이 있다면
                          자유롭게 적어주세요.
                        </p>
                        <Textarea
                          placeholder="예: 주인공의 의상은 붉은색을 메인으로..."
                          className="min-h-[100px] text-sm bg-slate-50 border-slate-200 focus-visible:ring-slate-400 resize-none"
                          value={mediaPrompt}
                          onChange={(e) => setMediaPrompt(e.target.value)}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  <CardFooter className="bg-slate-50 border-t p-4 flex justify-end shrink-0">
                    <label
                      htmlFor="step5-confirm"
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <Checkbox
                        id="step5-confirm"
                        checked={step5Confirmed}
                        onCheckedChange={(c) => setStep5Confirmed(!!c)}
                        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 w-4 h-4"
                      />
                      <span className="text-sm font-medium select-none text-slate-700 group-hover:text-slate-900">
                        매체 상세 설정 확인 완료
                      </span>
                    </label>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Step 6: Final Review */}
            {currentStep === 6 && (
              <div className="max-w-[1000px] mx-auto py-4 h-full flex flex-col">
                <div className="text-center mb-4 shrink-0">
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-slate-900">
                    최종 검토 및 생성
                  </h2>
                  <p className="text-xs text-slate-500">
                    설정하신 내용을 바탕으로 AI가 IP 확장 제안서를 생성합니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-slate-200 shadow-sm bg-slate-50/50">
                  <ScrollArea className="flex-1">
                    <div className="p-5 space-y-5">
                      {/* 1. Project Title & Overview */}
                      <section className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-slate-800">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          프로젝트 제안서 생성 개요
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500">
                              프로젝트 제목
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              value={projectTitle}
                              onChange={(e) => setProjectTitle(e.target.value)}
                              placeholder={`${selectedWork?.title || '작품'} ${
                                formats.find((f) => f.id === selectedFormat)
                                  ?.title || '확장'
                              } 프로젝트`}
                              className="font-bold text-base h-10 bg-white border-slate-300 focus-visible:ring-indigo-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              {
                                label: '예상 분량',
                                value: '약 15~20페이지',
                              },
                              {
                                label: '포함 이미지',
                                value: '없음 (텍스트 중심)',
                              },
                              {
                                label: '소요 시간',
                                value: '약 10분 내외',
                              },
                              {
                                label: '소모 크레딧',
                                value: '50 Credits',
                              },
                            ]
                              .filter((item) => item.value !== '미지정')
                              .map((item, i) => (
                                <div
                                  key={i}
                                  className="bg-slate-50 rounded-lg p-2.5 border border-slate-100"
                                >
                                  <span className="text-[10px] text-slate-500 font-medium block mb-0.5">
                                    {item.label}
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">
                                    {item.value}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </section>

                      {/* Visual Preview */}
                      <section className="mb-6">
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-3 px-1 text-slate-800">
                          <Monitor className="w-4 h-4 text-slate-500" />
                          기획안 미리보기
                        </h3>
                        <PdfPreview
                          isFullScreen={false}
                          className="w-full h-[240px]"
                          onFullScreen={() => setShowPdfFullScreen(true)}
                        />
                      </section>

                      {/* 2. Configuration Summary Grid */}
                      <section>
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-3 px-1 text-slate-800">
                          <Settings className="w-4 h-4 text-slate-500" />
                          입력 설정 요약
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* [New Card 0] Source Setting (Reference Data) */}
                          <div
                            onClick={() => setShowReferenceModal(true)}
                            className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm flex items-start gap-2.5 relative group hover:border-blue-400 transition-colors cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-500 mb-0.5">
                                원천 설정집
                              </p>
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {selectedLorebooks.length}개의 설정집 참조
                              </p>
                            </div>
                          </div>

                          {/* [New Card 1] Core Setting */}
                          <div
                            onClick={() => setShowCoreSettingDetail(true)}
                            className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm flex items-start gap-2.5 relative group hover:border-yellow-400 transition-colors cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-yellow-50 text-yellow-600">
                              <Crown className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-500 mb-0.5">
                                핵심 설정
                              </p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                      {selectedLorebooks.find(
                                        (l) => l.id === selectedCrownSetting,
                                      )?.keyword || '미지정'}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent className="z-[1000] bg-slate-900 text-white border-0 shadow-xl">
                                    <p>
                                      카테고리:{' '}
                                      {selectedLorebooks.find(
                                        (l) => l.id === selectedCrownSetting,
                                      )?.category || '-'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>

                          {/* [New Card 2] Planning Direction */}
                          <div
                            onClick={() => setShowPlanningDirectionModal(true)}
                            className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm flex items-start gap-2.5 relative group cursor-pointer hover:border-indigo-400 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600">
                              <Zap className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-500 mb-0.5">
                                기획 방향성
                              </p>
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {analysisBadges.length > 0
                                  ? analysisBadges
                                      .map((b) => b.label)
                                      .join(', ')
                                  : '분석 중...'}
                              </p>
                            </div>
                          </div>

                          {/* [New Card 3] Auto-Generation Rules */}
                          <div
                            onClick={() => setShowAutoGenerationModal(true)}
                            className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm flex items-start gap-2.5 relative group cursor-pointer hover:border-amber-400 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-500 mb-0.5">
                                자동 생성 지침
                              </p>
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {unselectedCategoryTips.length > 0
                                  ? unselectedCategoryTips
                                      .map((t) =>
                                        t.label.replace(' 미포함', ''),
                                      )
                                      .join(', ')
                                  : '모든 요소 포함됨'}
                              </p>
                            </div>
                          </div>

                          {/* [New Card 4] Conflict Summary */}
                          {conflictResult &&
                            Object.keys(conflictResult.충돌 || {}).length >
                              0 && (
                              <div
                                onClick={() => setCurrentStep(2)}
                                className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm flex items-start gap-2.5 relative group cursor-pointer hover:border-red-400 transition-colors col-span-full"
                              >
                                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-red-50 text-red-600">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </div>
                                <div className="overflow-hidden w-full">
                                  <p className="text-[10px] font-bold text-slate-500 mb-0.5">
                                    설정 충돌 해결
                                  </p>
                                  <div className="space-y-1">
                                    {Object.entries(conflictResult?.충돌 || {})
                                      .flatMap(
                                        ([category, items]: [string, any]) =>
                                          items.map(
                                            (item: any, idx: number) => {
                                              const itemName = Object.keys(
                                                item,
                                              ).find(
                                                (k) =>
                                                  ![
                                                    '신규설정',
                                                    '기존설정',
                                                  ].includes(k),
                                              );
                                              if (!itemName) return null;
                                              const reason =
                                                parseConflictReason(
                                                  item[itemName],
                                                );
                                              return (
                                                <div
                                                  key={`${category}-${idx}`}
                                                  className="flex items-start gap-2 text-xs"
                                                >
                                                  <span className="font-bold text-slate-700 min-w-[60px]">
                                                    {category}/{itemName}
                                                  </span>
                                                  <span className="text-slate-600 truncate">
                                                    {reason}
                                                  </span>
                                                </div>
                                              );
                                            },
                                          ),
                                      )
                                      .slice(0, 3)}
                                  </div>
                                </div>
                              </div>
                            )}

                          {[
                            {
                              label: '참조 데이터',
                              value: `${selectedLorebooks.length}개의 설정집`,
                              icon: BookOpen,
                              color: 'text-indigo-600',
                              bg: 'bg-indigo-50',
                            },
                            {
                              label: '장르 설정',
                              value:
                                selectedGenres.length > 0
                                  ? selectedGenres
                                      .map((g) => {
                                        const found = [
                                          { id: 'romance', label: '로맨스' },
                                          { id: 'fantasy', label: '판타지' },
                                          { id: 'martial_arts', label: '무협' },
                                          { id: 'modern', label: '현대물' },
                                          { id: 'thriller', label: '스릴러' },
                                          { id: 'sf', label: 'SF' },
                                          { id: 'sports', label: '스포츠' },
                                          { id: 'comedy', label: '코믹' },
                                          { id: 'mystery', label: '추리' },
                                          { id: 'history', label: '역사' },
                                          { id: 'drama', label: '드라마' },
                                          { id: 'action', label: '액션' },
                                        ].find((i) => i.id === g);
                                        return found ? found.label : g;
                                      })
                                      .join(', ')
                                  : '미지정',
                              icon: Sparkles,
                              color: 'text-amber-600',
                              bg: 'bg-amber-50',
                            },
                            {
                              label: '타겟 연령/성별',
                              value: `${
                                business.targetAge.join(', ') || '전연령'
                              } / ${
                                business.targetGender === 'male'
                                  ? '남성'
                                  : business.targetGender === 'female'
                                    ? '여성'
                                    : '통합'
                              }`,
                              icon: Users,
                              color: 'text-blue-600',
                              bg: 'bg-blue-50',
                            },
                            {
                              label: '예산 규모',
                              value: business.budgetRange
                                ? business.budgetRange === 'low'
                                  ? '저예산 (Low)'
                                  : business.budgetRange === 'high'
                                    ? '블록버스터 (High)'
                                    : '중형 예산 (Medium)'
                                : '미정',
                              icon: DollarSign,
                              color: 'text-green-600',
                              bg: 'bg-green-50',
                            },
                            // Format Specific Details
                            ...(selectedFormat === 'webtoon'
                              ? [
                                  {
                                    label: '작화 스타일',
                                    value:
                                      [
                                        {
                                          id: 'realistic',
                                          label: '실사체',
                                        },
                                        {
                                          id: 'casual',
                                          label: '캐주얼/SD',
                                        },
                                        {
                                          id: 'martial_arts',
                                          label: '무협/극화체',
                                        },
                                        {
                                          id: 'us_comics',
                                          label: '미국 코믹스',
                                        },
                                      ].find((i) => i.id === mediaDetails.style)
                                        ?.label || '미지정',
                                    icon: ImageIcon,
                                    color: 'text-pink-600',
                                    bg: 'bg-pink-50',
                                  },
                                  {
                                    label: '연출 호흡',
                                    value:
                                      [
                                        {
                                          id: 'fast',
                                          label: '빠른 전개',
                                        },
                                        {
                                          id: 'emotional',
                                          label: '감정선 중심',
                                        },
                                        {
                                          id: 'suspense',
                                          label: '긴장감 조성',
                                        },
                                      ].find(
                                        (i) => i.id === mediaDetails.pacing,
                                      )?.label || '미지정',
                                    icon: Clock,
                                    color: 'text-indigo-600',
                                    bg: 'bg-indigo-50',
                                  },
                                  {
                                    label: '엔딩 포인트',
                                    value:
                                      [
                                        {
                                          id: 'cliffhanger',
                                          label: '절단신공',
                                        },
                                        {
                                          id: 'resolution',
                                          label: '에피소드 완결',
                                        },
                                        {
                                          id: 'preview',
                                          label: '다음 화 예고',
                                        },
                                      ].find(
                                        (i) =>
                                          i.id === mediaDetails.endingPoint,
                                      )?.label || '미지정',
                                    icon: Target,
                                    color: 'text-rose-600',
                                    bg: 'bg-rose-50',
                                  },
                                ]
                              : []),
                            ...(selectedFormat === 'drama'
                              ? [
                                  {
                                    label: '편성 전략',
                                    value:
                                      mediaDetails.seasonType === 'limited'
                                        ? '미니시리즈 (16부작)'
                                        : mediaDetails.seasonType === 'seasonal'
                                          ? '시즌제 드라마'
                                          : '일일/주말 드라마',
                                    icon: Calendar,
                                    color: 'text-pink-600',
                                    bg: 'bg-pink-50',
                                  },
                                  {
                                    label: '회차당 분량',
                                    value: `${mediaDetails.episodeDuration || 60}분`,
                                    icon: Clock,
                                    color: 'text-indigo-600',
                                    bg: 'bg-indigo-50',
                                  },
                                ]
                              : []),
                            ...(selectedFormat === 'game'
                              ? [
                                  {
                                    label: '게임 장르',
                                    value:
                                      [
                                        { id: 'rpg', label: 'RPG' },
                                        {
                                          id: 'simulation',
                                          label: '시뮬레이션',
                                        },
                                        {
                                          id: 'action',
                                          label: '액션/어드벤처',
                                        },
                                        {
                                          id: 'puzzle',
                                          label: '퍼즐/캐주얼',
                                        },
                                        { id: 'strategy', label: '전략/TCG' },
                                        {
                                          id: 'sports',
                                          label: '스포츠/레이싱',
                                        },
                                        { id: 'fps', label: '슈팅 (FPS/TPS)' },
                                        {
                                          id: 'combat',
                                          label: '전투/경쟁',
                                        },
                                        {
                                          id: 'collection',
                                          label: '수집형',
                                        },
                                        { id: 'story', label: '비주얼 노벨' },
                                      ].find(
                                        (i) => i.id === mediaDetails.gameGenre,
                                      )?.label || '미지정',
                                    icon: Gamepad2,
                                    color: 'text-pink-600',
                                    bg: 'bg-pink-50',
                                  },
                                  {
                                    label: '플랫폼',
                                    value:
                                      [
                                        { id: 'mobile', label: '모바일' },
                                        { id: 'pc', label: 'PC' },
                                        { id: 'console', label: '콘솔' },
                                        {
                                          id: 'multi',
                                          label: '멀티플랫폼',
                                        },
                                      ].find(
                                        (i) => i.id === mediaDetails.platform,
                                      )?.label || '미지정',
                                    icon: Monitor,
                                    color: 'text-indigo-600',
                                    bg: 'bg-indigo-50',
                                  },
                                ]
                              : []),
                            ...(selectedFormat === 'spinoff'
                              ? [
                                  {
                                    label: '스핀오프 유형',
                                    value:
                                      [
                                        { id: 'prequel', label: '프리퀄' },
                                        { id: 'sequel', label: '시퀄' },
                                        { id: 'side', label: '외전' },
                                        { id: 'if', label: 'IF 스토리' },
                                      ].find(
                                        (i) =>
                                          i.id === mediaDetails.spinoffType,
                                      )?.label || '미지정',
                                    icon: GitBranch,
                                    color: 'text-pink-600',
                                    bg: 'bg-pink-50',
                                  },
                                  {
                                    label: '주인공 캐릭터',
                                    value:
                                      mediaDetails.targetCharacter || '미지정',
                                    icon: User,
                                    color: 'text-indigo-600',
                                    bg: 'bg-indigo-50',
                                  },
                                ]
                              : []),
                            ...(selectedFormat === 'commercial'
                              ? [
                                  {
                                    label: '비주얼 포맷',
                                    value:
                                      [
                                        { id: '2d', label: '2D 애니메이션' },
                                        { id: '3d', label: '3D 그래픽' },
                                        { id: 'live', label: '실사 촬영' },
                                        {
                                          id: 'motion',
                                          label: '모션 그래픽',
                                        },
                                      ].find(
                                        (i) =>
                                          i.id === mediaDetails.visualFormat,
                                      )?.label || '미지정',
                                    icon: ImageIcon,
                                    color: 'text-pink-600',
                                    bg: 'bg-pink-50',
                                  },
                                ]
                              : []),
                            {
                              label: '제작 톤앤매너',
                              value: mediaDetails.tone || '미지정',
                              icon: Palette,
                              color: 'text-purple-600',
                              bg: 'bg-purple-50',
                            },
                            {
                              label: '핵심 재미요소',
                              value: mediaDetails.coreLoop || '미지정',
                              icon: Zap,
                              color: 'text-yellow-600',
                              bg: 'bg-yellow-50',
                            },
                            {
                              label: '비즈니스 모델',
                              value: mediaDetails.bmStrategy || '미지정',
                              icon: BarChart,
                              color: 'text-cyan-600',
                              bg: 'bg-cyan-50',
                            },
                            {
                              label: '세계관 설정',
                              value: mediaDetails.worldSetting || '미지정',
                              icon: Globe,
                              color: 'text-emerald-600',
                              bg: 'bg-emerald-50',
                            },
                            {
                              label: '캐릭터 각색',
                              value:
                                mediaDetails.characterAdaptation || '미지정',
                              icon: Users,
                              color: 'text-pink-600',
                              bg: 'bg-pink-50',
                            },
                            {
                              label: '플랫폼 전략',
                              value: mediaDetails.platformStrategy || '미지정',
                              icon: Smartphone,
                              color: 'text-blue-600',
                              bg: 'bg-blue-50',
                            },
                            {
                              label: '마케팅 포인트',
                              value: mediaDetails.marketingPoint || '미지정',
                              icon: Megaphone,
                              color: 'text-orange-600',
                              bg: 'bg-orange-50',
                            },
                            {
                              label: '추가 프롬프트',
                              value: mediaPrompt || '없음',
                              icon: MessageSquare,
                              color: 'text-slate-600',
                              bg: 'bg-slate-50',
                            },
                          ]
                            .filter((item) => item.value !== '미지정')
                            .map((item, i) => (
                              <div
                                key={i}
                                className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm flex items-start gap-2.5 relative group"
                              >
                                {item.label === '참조 데이터' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1.5 right-1.5 h-5 w-5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setShowReferenceModal(true)}
                                  >
                                    <Maximize2 className="w-3 h-3" />
                                  </Button>
                                )}
                                {/* Reference Data Modal - Crown Logic */}
                                {item.label === '참조 데이터' &&
                                  selectedCrownSetting && (
                                    <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>핵심 설정 포함됨</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  )}
                                <div
                                  className={cn(
                                    'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                                    item.bg,
                                    item.color,
                                  )}
                                >
                                  <item.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-[10px] font-bold text-slate-500 mb-0.5">
                                    {item.label}
                                  </p>
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {item.value}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </section>
                      {/* Duplicate Configuration Summary Removed */}
                    </div>
                  </ScrollArea>

                  {/* Final Consent Checkbox */}
                  <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-center gap-3 shrink-0">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-200">
                      <Checkbox
                        ref={confirmCheckboxRef}
                        id="step6-confirm"
                        checked={step6Confirmed}
                        onCheckedChange={(c) => setStep6Confirmed(!!c)}
                        className="w-4 h-4 border-2 border-slate-300 data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900 transition-colors"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors select-none">
                        위 내용으로 IP 확장 프로젝트 생성을 시작합니다.
                      </span>
                    </label>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-3 border-t bg-white flex justify-between items-center z-10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={
                currentStep === 1 || (!!initialData && currentStep === 3)
              }
              size="sm"
            >
              이전
            </Button>
            <div className="flex gap-2">
              {currentStep < 6 ? (
                <Button onClick={handleNext} size="sm">
                  다음
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  size="sm"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  프로젝트 생성
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showCreateConfirm} onOpenChange={setShowCreateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 생성하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              AI가 제안서를 생성하는 데 약 15~20분이 소요됩니다.
              <br />
              생성 중에는 다른 작업을 계속하실 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreate} className="bg-primary">
              생성 시작
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reference Data Modal */}
      <Dialog open={showReferenceModal} onOpenChange={setShowReferenceModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>참조 설정집 상세</DialogTitle>
            <Tabs
              value={referenceModalTab}
              onValueChange={setReferenceModalTab}
              className="mt-4"
            >
              <TabsList className="grid grid-cols-7 w-full">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'characters', label: '인물' },
                  { id: 'places', label: '장소' },
                  { id: 'items', label: '물건' },
                  { id: 'groups', label: '단체' },
                  { id: 'worldviews', label: '세계' },
                  { id: 'plots', label: '사건' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="text-xs px-1"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4 overflow-y-auto mt-4">
            <div className="space-y-4">
              {selectedLorebooks
                .filter(
                  (lb) =>
                    referenceModalTab === 'all' ||
                    lb.category ===
                      {
                        characters: '인물',
                        places: '장소',
                        items: '물건',
                        groups: '단체',
                        worldviews: '세계관',
                        plots: '사건',
                      }[referenceModalTab],
                )
                .map((lorebook, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg text-slate-800">
                        {lorebook.keyword}
                      </div>
                      <Badge variant="secondary">{lorebook.category}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                      <div>
                        <span className="font-semibold text-slate-500">
                          작가:
                        </span>{' '}
                        {lorebook.authorName}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">
                          작품:
                        </span>{' '}
                        {lorebook.workTitle}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 whitespace-pre-wrap">
                      {typeof lorebook.setting === 'string'
                        ? lorebook.setting
                        : JSON.stringify(lorebook.setting, null, 2)}
                    </div>
                  </div>
                ))}
              {selectedLorebooks.filter(
                (lb) =>
                  referenceModalTab === 'all' ||
                  lb.category ===
                    {
                      characters: '인물',
                      places: '장소',
                      items: '물건',
                      groups: '단체',
                      worldviews: '세계관',
                      plots: '사건',
                    }[referenceModalTab],
              ).length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  해당 카테고리의 참조 설정집이 없습니다.
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowReferenceModal(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Screen Preview Modal */}
      <Dialog open={showPdfFullScreen} onOpenChange={setShowPdfFullScreen}>
        <DialogContent className="!w-screen !h-screen !max-w-none rounded-none border-0 p-0 overflow-hidden bg-slate-50 [&>button:last-child]:hidden">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-slate-500 hover:bg-slate-200 z-50 rounded-full w-10 h-10 p-0"
              onClick={() => setShowPdfFullScreen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <PdfPreview
              className="w-full h-full shadow-none border-0"
              isFullScreen={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* [New Modal] Planning Direction Detail */}
      <Dialog
        open={showPlanningDirectionModal}
        onOpenChange={setShowPlanningDirectionModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />
              기획 방향성 상세
            </DialogTitle>
            <DialogDescription>
              AI가 분석한 프로젝트의 핵심 기획 방향과 추천 확장 전략입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {analysisBadges.length > 0 ? (
              analysisBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn('text-xs', badge.color)}>
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {badge.tooltip}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-4">
                분석된 기획 방향성이 없습니다.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPlanningDirectionModal(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* [New Modal] Auto-Generation Rules Detail */}
      <Dialog
        open={showAutoGenerationModal}
        onOpenChange={setShowAutoGenerationModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              자동 생성 지침 상세
            </DialogTitle>
            <DialogDescription>
              부족한 설정 요소를 보완하기 위해 시스템이 적용할 생성 원칙입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {unselectedCategoryTips.length > 0 ? (
              unselectedCategoryTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm mb-1">
                      {tip.label}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {tip.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-4 flex flex-col items-center gap-2">
                <Check className="w-8 h-8 text-green-500" />
                <p>모든 필수 설정 요소가 포함되어 있습니다.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAutoGenerationModal(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
