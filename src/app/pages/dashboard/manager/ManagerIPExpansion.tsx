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
  Layout,
  Info,
  ClipboardList,
  RefreshCw,
} from 'lucide-react';
import { IPProposalCommentDto } from '../../../types/author';
import { ManagerCommentResponseDto } from '../../../types/manager';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
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
import { authService } from '../../../services/authService';
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
          <span
            key={i}
            className="bg-yellow-500/20 font-medium text-yellow-700 dark:text-yellow-300"
          >
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

// Formats definition moved to module scope
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

const SettingComparison = ({
  original,
  updated,
}: {
  original: any;
  updated: any;
}) => {
  if (!original && !updated) return null;

  const allKeys = Array.from(
    new Set([...Object.keys(original || {}), ...Object.keys(updated || {})]),
  );

  return (
    <div className="border rounded-md overflow-hidden text-xs border-border">
      <div className="grid grid-cols-2 bg-muted border-b font-bold text-foreground">
        <div className="p-2 border-r border-border flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
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

        let origClass =
          'p-2 border-r border-border bg-card text-muted-foreground';
        let newClass = 'p-2 bg-card text-muted-foreground';

        if (isAdded) {
          newClass =
            'p-2 bg-green-500/10 text-green-700 dark:text-green-400 font-medium';
        } else if (isDeleted) {
          origClass =
            'p-2 border-r border-border bg-destructive/10 text-destructive font-medium decoration-destructive';
        } else if (isModified) {
          origClass =
            'p-2 border-r border-border bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
          newClass =
            'p-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-medium';
        }

        const formatValue = (val: any) => {
          if (val === null || val === undefined) return '-';
          if (Array.isArray(val)) {
            if (val.length === 0) return '-';
            if (typeof val[0] === 'object') {
              return val.map((item, i) => (
                <div
                  key={i}
                  className="mb-1 last:mb-0 pl-2 border-l-2 border-border"
                >
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="flex gap-1">
                      <span className="font-semibold text-muted-foreground">
                        {k}:
                      </span>
                      <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              ));
            }
            return val.join(', ');
          }
          if (typeof val === 'object') {
            return (
              <div className="pl-2 border-l-2 border-border">
                {Object.entries(val).map(([k, v]) => (
                  <div key={k} className="flex gap-1">
                    <span className="font-semibold text-muted-foreground">
                      {k}:
                    </span>
                    <span>{String(v)}</span>
                  </div>
                ))}
              </div>
            );
          }
          return String(val);
        };

        return (
          <div
            key={key}
            className="grid grid-cols-2 border-b last:border-0 border-border"
          >
            <div className={origClass}>
              <span className="font-bold mr-2 text-xs text-muted-foreground block mb-1">
                {key}
              </span>
              {formatValue(origVal)}
            </div>
            <div className={newClass}>
              <span className="font-bold mr-2 text-xs text-muted-foreground block mb-1">
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

const LorebookContentViewer = ({
  content,
  keyword,
}: {
  content: string | object;
  keyword: string;
}) => {
  let parsedContent: any = content;

  if (typeof content === 'string') {
    try {
      if (content.startsWith('{') || content.startsWith('[')) {
        parsedContent = JSON.parse(content);
      }
    } catch (e) {
      // plain string
    }
  }

  if (typeof parsedContent === 'string') {
    return <div className="whitespace-pre-wrap">{parsedContent}</div>;
  }

  if (typeof parsedContent === 'object' && parsedContent !== null) {
    const entries = Object.entries(parsedContent).filter(([key]) => {
      // Filter out keys that match the keyword or generic name keys
      return (
        key !== keyword &&
        key !== '이름' &&
        key !== 'name' &&
        key !== '설정집명' &&
        key !== 'id'
      );
    });

    if (entries.length === 0) {
      return <div className="text-muted-foreground italic">내용 없음</div>;
    }

    return (
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="bg-muted/50 rounded p-3 border border-border"
          >
            <div className="text-xs font-bold text-muted-foreground mb-1">
              {key}
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : String(value)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="whitespace-pre-wrap">{String(content)}</div>;
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
        // 게임 전용 추가 카드
        core_fun: {
          title: '핵심 재미요소',
          sub: '플레이어가 경험할 핵심적인 재미 요소와 루프.',
          icon: Sparkles,
        },
        genre: {
          title: '게임 장르',
          sub: '게임의 장르 및 스타일 (예: RPG, FPS, 시뮬레이션).',
          icon: Gamepad2,
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

const STATUS_MAP: Record<string, string> = {
  NEW: '신규',
  PENDING_APPROVAL: '승인대기',
  APPROVED: '승인',
  REJECTED: '반려',
  DELETED: '삭제',
  COMPLETED: '완료',
};

const FORMAT_MAP: Record<string, string> = {
  WEBTOON: '웹툰',
  DRAMA: '드라마',
  MOVIE: '영화',
  GAME: '게임',
  SPINOFF: '스핀오프',
  COMMERCIAL_IMAGE: '상업 이미지',
};

export function ManagerIPExpansion() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
  });

  const { data: proposalsData, isLoading } = useQuery({
    queryKey: ['manager', 'ip-expansion', 'proposals', page, me?.integrationId],
    queryFn: () =>
      managerService.getIPProposals(me?.integrationId || 'me', page, PAGE_SIZE),
    enabled: !!me?.integrationId,
  });

  const proposals = proposalsData?.content || [];

  const createMutation = useMutation({
    mutationFn: managerService.createIPExpansionProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });
      // System Notification Simulation
      toast.success('IP 확장 프로젝트 생성이 완료되었습니다!', {
        duration: 5000,
        icon: '✅',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      managerId,
    }: {
      id: number;
      data: any;
      managerId: string;
    }) => managerService.updateIPProposal(id, data, managerId),
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
    onMutate: async (id) => {
      const queryKey = [
        'manager',
        'ip-expansion',
        'proposals',
        page,
        me?.integrationId,
      ];
      await queryClient.cancelQueries({ queryKey });
      const previousProposals = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.filter((p: any) => p.id !== id),
          totalElements: Math.max(0, (old.totalElements || 0) - 1),
        };
      });

      return { previousProposals, queryKey };
    },
    onError: (err, id, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(context.queryKey, context.previousProposals);
      }
      toast.error('프로젝트 삭제에 실패했습니다.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });
    },
    onSuccess: () => {
      setSelectedProject(null);
      toast.success('프로젝트가 삭제되었습니다.');
    },
  });

  const handleCreateProject = (project: any) => {
    // Immediate feedback and close dialog for long-running process
    setIsCreateDialogOpen(false);

    if (editingProject) {
      updateMutation.mutate({
        id: editingProject.id,
        data: project,
        managerId: editingProject.managerId || 'me',
      });
    } else {
      createMutation.mutate(project);
    }
  };

  const handleEditProject = async (project: any) => {
    if (me?.integrationId) {
      try {
        // Use the same endpoint as Detail view to ensure we get populated data (e.g. lorebooks)
        const detail = await managerService.getIPExpansionDetail(
          me.integrationId,
          project.id,
        );

        // Pre-fill fix: If lorebooks (objects) are missing but lorebookIds exist, fetch and populate them
        if (
          (!detail.lorebooks || detail.lorebooks.length === 0) &&
          detail.lorebookIds &&
          detail.lorebookIds.length > 0 &&
          (detail.workId || project.workId)
        ) {
          try {
            const workId = detail.workId || project.workId;
            const allLorebooks =
              await managerService.getAuthorWorkLorebooks(workId);

            // Map IDs to full objects
            const selectedLorebooks = allLorebooks.filter((lb: any) =>
              detail.lorebookIds.includes(lb.lorebookId || lb.id),
            );

            // Attach to detail object for the form to use
            detail.lorebooks = selectedLorebooks;
            detail.processed_lorebooks = selectedLorebooks; // Also set processed_lorebooks as fallback
          } catch (err) {
            console.error('Failed to fetch lorebooks for pre-fill', err);
          }
        }

        setEditingProject(detail);
      } catch (error) {
        console.error('Failed to fetch detail for edit', error);
        setEditingProject(project);
      }
    } else {
      setEditingProject(project);
    }
    setSelectedProject(null);
    setIsCreateDialogOpen(true);
  };

  const handleOpenDetail = async (proposal: any) => {
    // Ensure we have both ID and manager ID
    if (!proposal || !proposal.id || proposal.id === 'undefined') {
      console.error('Invalid proposal ID');
      return;
    }

    // Use me.integrationId if available
    const managerId = me?.integrationId;

    if (managerId) {
      try {
        const detail = await managerService.getIPExpansionDetail(
          managerId,
          proposal.id,
        );
        setSelectedProject(detail);
      } catch (error) {
        console.error('Failed to fetch detail', error);
        toast.error('상세 정보를 불러오는데 실패했습니다.');
        // Still open modal with available summary data, but warn user
        setSelectedProject(proposal);
      }
    } else {
      // If no manager ID, we can't fetch details properly
      toast.error('매니저 정보를 찾을 수 없습니다.');
      setSelectedProject(proposal);
    }
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
        <div></div>
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

      {/* Project List - Card Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[200px] rounded-lg border border-border bg-muted animate-pulse"
            />
          ))
        ) : proposals && proposals.length > 0 ? (
          proposals.map((proposal) => {
            const formatId = (
              proposal.targetFormat || proposal.format
            )?.toLowerCase();
            const formatItem = formats.find((f) => f.id === formatId);
            const Icon = formatItem?.icon || Zap;

            return (
              <Card
                key={proposal.id}
                className="group cursor-pointer hover:shadow-md transition-all border-border overflow-hidden"
                onClick={() => {
                  if (proposal.status === 'NEW') {
                    toast.info('AI 분석이 진행 중입니다.');
                    return;
                  }
                  handleOpenDetail(proposal);
                }}
              >
                <CardHeader className="p-0">
                  <div
                    className={cn(
                      'h-16 bg-gradient-to-br relative overflow-hidden',
                      formatItem?.color === 'green'
                        ? 'from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40'
                        : formatItem?.color === 'purple'
                          ? 'from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40'
                          : formatItem?.color === 'blue'
                            ? 'from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40'
                            : formatItem?.color === 'red'
                              ? 'from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40'
                              : formatItem?.color === 'amber'
                                ? 'from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40'
                                : formatItem?.color === 'pink'
                                  ? 'from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/40'
                                  : 'from-muted/50 to-muted dark:from-muted/10 dark:to-muted/20',
                    )}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon
                        className={cn(
                          'w-6 h-6 opacity-20',
                          formatItem?.color === 'green'
                            ? 'text-green-600 dark:text-green-400'
                            : formatItem?.color === 'purple'
                              ? 'text-purple-600 dark:text-purple-400'
                              : formatItem?.color === 'blue'
                                ? 'text-blue-600 dark:text-blue-400'
                                : formatItem?.color === 'red'
                                  ? 'text-red-600 dark:text-red-400'
                                  : formatItem?.color === 'amber'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : formatItem?.color === 'pink'
                                      ? 'text-pink-600 dark:text-pink-400'
                                      : 'text-muted-foreground',
                        )}
                      />
                    </div>
                    <Badge className="absolute top-2 left-2 bg-card/90 dark:bg-card/50 shadow-sm backdrop-blur-sm text-foreground hover:bg-card/90 dark:hover:bg-card/50 border-0 text-xs h-5 px-1.5">
                      {formatItem?.title ||
                        proposal.targetFormat ||
                        proposal.format ||
                        'Unknown'}
                    </Badge>
                    <Badge
                      className={cn(
                        'absolute top-2 right-2 shadow-sm border-0 text-xs h-5 px-1.5',
                        proposal.status === 'APPROVED'
                          ? 'bg-emerald-500 hover:bg-emerald-600'
                          : proposal.status === 'PENDING_APPROVAL'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : proposal.status === 'REJECTED'
                              ? 'bg-destructive hover:bg-destructive/90'
                              : 'bg-muted-foreground hover:bg-muted-foreground/90',
                      )}
                    >
                      {proposal.statusDescription ||
                        (proposal.status === 'NEW'
                          ? '신규'
                          : proposal.status === 'PENDING_APPROVAL'
                            ? '승인 대기'
                            : proposal.status === 'APPROVED'
                              ? '승인됨'
                              : proposal.status === 'REJECTED'
                                ? '반려됨'
                                : proposal.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pb-0">
                  <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-xs">
                    {proposal.title}
                  </h3>
                </CardContent>
                <div className="p-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {proposal.createdAt || proposal.receivedAt
                      ? new Date(
                          proposal.createdAt || proposal.receivedAt || '',
                        ).toLocaleDateString()
                      : '-'}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full h-60 flex flex-col items-center justify-center gap-3 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                진행 중인 프로젝트가 없습니다
              </p>
              <p className="text-sm mt-1 text-muted-foreground">
                새로운 IP 확장 프로젝트를 시작해보세요.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {proposalsData && proposalsData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-muted-foreground"
          >
            이전
          </Button>
          <div className="text-sm font-medium text-muted-foreground px-4">
            <span className="text-foreground">{page + 1}</span>
            <span className="mx-1 text-muted-foreground">/</span>
            {proposalsData.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(proposalsData.totalPages - 1, p + 1))
            }
            disabled={page >= proposalsData.totalPages - 1}
            className="text-muted-foreground"
          >
            다음
          </Button>
        </div>
      )}

      <CreateIPExpansionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          // If we were editing, return to detail view on close (cancellation)
          if (editingProject) {
            setSelectedProject(editingProject);
          }
          setEditingProject(null);
        }}
        onCreated={handleCreateProject}
        initialData={editingProject}
      />

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          managerId={me?.integrationId}
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
  managerId,
  isOpen,
  onClose,
  onPropose,
  onEdit,
  onDelete,
}: {
  project: any;
  managerId?: string;
  isOpen: boolean;
  onClose: () => void;
  onPropose: (id: number) => void;
  onEdit: (project: any) => void;
  onDelete: (id: number) => void;
}) {
  const [showPdfFullScreen, setShowPdfFullScreen] = useState(false);
  const [showLorebookListModal, setShowLorebookListModal] = useState(false);
  const [lorebookFilter, setLorebookFilter] = useState('전체'); // New State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLorebookDetail, setSelectedLorebookDetail] =
    useState<any>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [showFinalDecisionConfirm, setShowFinalDecisionConfirm] =
    useState(false);
  const [pendingFinalDecision, setPendingFinalDecision] = useState<
    'APPROVED' | 'REJECTED' | null
  >(null);

  const confirmFinalDecision = () => {
    if (pendingFinalDecision && project.id) {
      updateStatusMutation.mutate({
        id: project.id,
        status: pendingFinalDecision,
      });
      setShowFinalDecisionConfirm(false);
    }
  };

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      managerService.updateIPProposalStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });

      // Optimistically update to the new value
      queryClient.setQueriesData(
        { queryKey: ['manager', 'ip-expansion', 'proposals'] },
        (old: any) => {
          if (!old || !old.content) return old;
          return {
            ...old,
            content: old.content.map((p: any) =>
              p.id === id
                ? {
                    ...p,
                    status,
                    statusDescription:
                      status === 'APPROVED' ? '승인됨' : '반려됨',
                  }
                : p,
            ),
          };
        },
      );

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: (data, variables) => {
      toast.success(
        `프로젝트가 ${variables.status === 'APPROVED' ? '최종 승인' : '반려'}되었습니다.`,
      );
      setShowReviewModal(false);
      onClose();
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.log(err);
      toast.error('상태 변경에 실패했습니다.');
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });
    },
  });

  const handleFinalDecision = (status: 'APPROVED' | 'REJECTED') => {
    if (!project.id) return;
    setPendingFinalDecision(status);
    setShowFinalDecisionConfirm(true);
  };

  const comments = reviewData?.comments || [];
  const allApproved =
    Array.isArray(comments) &&
    comments.length > 0 &&
    comments.every((c: any) => c.status === 'APPROVED');
  const anyRejected =
    Array.isArray(comments) &&
    comments.some((c: any) => c.status === 'REJECTED');

  const { data: lorebooks } = useQuery({
    queryKey: ['manager', 'proposal-lorebooks', managerId, project.id],
    queryFn: async () => {
      if (!managerId || !project.id) return [];
      return managerService.getProposalLorebooks(
        managerId,
        project.id.toString(),
      );
    },
    enabled: !!managerId && !!project.id,
  });

  // Fetch PDF Blob and create Object URL
  useEffect(() => {
    let active = true;
    const fetchPdf = async () => {
      if (!project.id) return;
      try {
        // Use the API that returns a blob
        const blob = await managerService.getIPProposalPreview(project.id);

        // Robust check: Real PDFs start with %PDF
        // If it starts with { or [, it's likely JSON (DTO or Error)
        const header = await blob.slice(0, 10).text();
        if (
          header.trim().startsWith('{') ||
          header.trim().startsWith('[') ||
          blob.type === 'application/json'
        ) {
          console.warn('PDF Preview returned JSON, likely DTO or error');
          // Optionally log the content
          // const text = await blob.text();
          // console.log('Response content:', text);
          return;
        }

        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          if (active) setPdfBlobUrl(url);
        }
      } catch (e) {
        console.error('Failed to load PDF preview', e);
      }
    };

    fetchPdf();

    return () => {
      active = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [project.id]);

  const handleDownloadPdf = async () => {
    if (!project.id) {
      toast.error('PDF 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const blob = await managerService.getIPProposalDownload(project.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.title}_기획제안서.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('PDF 다운로드에 실패했습니다.');
    }
  };

  const handleOpenReviewModal = async () => {
    try {
      const data = await managerService.getProposalComments(project.id);
      setReviewData(data);
      setShowReviewModal(true);
    } catch (e) {
      toast.error('검토 내역을 불러오는데 실패했습니다.');
      setReviewData(null);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(project.id);
    setShowDeleteConfirm(false);
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
              className="bg-destructive hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final Decision Confirmation Dialog */}
      <AlertDialog
        open={showFinalDecisionConfirm}
        onOpenChange={setShowFinalDecisionConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              프로젝트를 최종{' '}
              {pendingFinalDecision === 'APPROVED' ? '승인' : '반려'}
              하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingFinalDecision === 'APPROVED'
                ? '승인 처리 시 작가에게 알림이 전송되며, 프로젝트가 다음 단계로 진행됩니다.'
                : '반려 처리 시 작가에게 알림이 전송되며, 프로젝트가 반려 상태로 변경됩니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFinalDecision}
              className={
                pendingFinalDecision === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {pendingFinalDecision === 'APPROVED' ? '승인' : '반려'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[85vw] lg:max-w-4xl max-h-[90vh] p-0 gap-0 rounded-xl overflow-y-auto flex flex-col bg-card shadow-2xl border-0">
          <ScrollArea className="flex-1">
            {/* Hero Header */}
            <div
              className={cn(
                'relative h-40 flex items-end p-6 overflow-hidden shrink-0',
                'bg-muted/30 border-b border-border',
              )}
            >
              <div className="relative z-10 w-full flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-card border-border text-muted-foreground hover:bg-accent uppercase tracking-wider shadow-sm text-xs">
                      {project.targetFormat || project.format || 'FORMAT'}
                    </Badge>
                    <Badge
                      variant={
                        project.status === 'APPROVED'
                          ? 'default'
                          : project.status === 'PENDING_APPROVAL'
                            ? 'outline'
                            : 'destructive'
                      }
                      className={cn(
                        'border-0 text-xs',
                        project.status === 'APPROVED'
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : project.status === 'PENDING_APPROVAL'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                      )}
                    >
                      {project.status === 'APPROVED'
                        ? '승인'
                        : project.status === 'PENDING_APPROVAL'
                          ? '승인 대기'
                          : '반려'}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
                    {project.title}
                  </DialogTitle>
                  <div className="text-muted-foreground text-xs mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />{' '}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-0.5 h-3 bg-border" />
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />{' '}
                      {project.matchedAuthorNames &&
                      project.matchedAuthorNames.length > 0
                        ? project.matchedAuthorNames.join(', ')
                        : project.authorName || '작가 미정'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* 1. PDF Preview */}
              <div className="w-full h-[500px] bg-muted dark:bg-muted/20 rounded-xl overflow-hidden border border-border shadow-sm">
                <PdfPreview
                  isFullScreen={false}
                  className="h-full w-full"
                  onFullScreen={() => setShowPdfFullScreen(true)}
                  pdfUrl={pdfBlobUrl || undefined}
                  onDownload={handleDownloadPdf}
                />
              </div>

              {/* 2. Core Content Strategy (6 Grid) */}
              <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  핵심 내용 요약
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    const strategy = getContentStrategy(
                      project.targetFormat || project.format,
                    ) as any;
                    return [
                      {
                        key: 'valueProp',
                        content: project.expMarket,
                        color: 'text-rose-600 dark:text-rose-400',
                        bg: 'bg-rose-50 dark:bg-rose-900/20',
                      },
                      {
                        key: 'adaptation',
                        content: project.expCreative,
                        color: 'text-indigo-600 dark:text-indigo-400',
                        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                      },
                      {
                        key: 'visual',
                        content: project.expVisual,
                        color: 'text-pink-600 dark:text-pink-400',
                        bg: 'bg-pink-50 dark:bg-pink-900/20',
                      },
                      {
                        key: 'world',
                        content: project.expWorld,
                        color: 'text-purple-600 dark:text-purple-400',
                        bg: 'bg-purple-50 dark:bg-purple-900/20',
                      },
                      {
                        key: 'business',
                        content: project.expBusiness,
                        color: 'text-emerald-600 dark:text-emerald-400',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                      },
                      {
                        key: 'feasibility',
                        content: project.expProduction,
                        color: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50 dark:bg-blue-900/20',
                      },
                    ].map((item: any, i) => {
                      const strategyItem = strategy[item.key];
                      const Icon = strategyItem?.icon || item.icon;

                      return (
                        <Card
                          key={i}
                          className="border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 bg-card"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                              <div className={`p-1.5 rounded-md ${item.bg}`}>
                                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                              </div>
                              <div>
                                <div>{strategyItem?.title || item.title}</div>
                                {strategyItem?.sub && (
                                  <div className="text-xs text-muted-foreground font-normal mt-0.5">
                                    {strategyItem.sub}
                                  </div>
                                )}
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {item.content || '내용이 없습니다.'}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
                </div>
              </section>

              {/* 3. Input Setting Summary & Lorebooks */}
              <div className="space-y-6 pt-6 border-t border-border">
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground pt-6 border-t border-border">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  입력 설정 요약
                </h3>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    {
                      label: '원천 설정집 (Source Settings)',
                      value: `${project.lorebookIds?.length || 0}개`,
                      icon: BookOpen,
                      color: 'text-indigo-600',
                      bg: 'bg-indigo-50',
                      onClick: () => setShowLorebookListModal(true),
                    },
                    {
                      label: '포맷 (Format)',
                      value: project.targetFormat || project.format,
                      icon: Film,
                      color: 'text-muted-foreground',
                      bg: 'bg-muted',
                    },
                    {
                      label: '장르 (Genre)',
                      value: project.targetGenre || '미지정',
                      icon: Sparkles,
                      color: 'text-amber-600',
                      bg: 'bg-amber-50',
                    },
                    {
                      label: '타겟 (Target)',
                      value: `${
                        Array.isArray(project.targetAges)
                          ? project.targetAges.join(', ')
                          : project.targetAges || '전연령'
                      } / ${
                        project.targetGender === 'male'
                          ? '남성'
                          : project.targetGender === 'female'
                            ? '여성'
                            : '통합'
                      }`,
                      icon: Users,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                    },
                    {
                      label: '예산 (Budget)',
                      value:
                        project.budgetScale === 'SMALL'
                          ? '저예산'
                          : project.budgetScale === 'LARGE'
                            ? '블록버스터'
                            : project.budgetScale === 'MEDIUM'
                              ? '중형 예산'
                              : project.budgetScale || '미정',
                      icon: DollarSign,
                      color: 'text-green-600',
                      bg: 'bg-green-50',
                    },
                    {
                      label: '세계관 설정 (World)',
                      value:
                        project.worldSetting === 'SHARED'
                          ? '공유 세계관'
                          : project.worldSetting === 'ORIGINAL'
                            ? '독자 세계관'
                            : project.worldSetting === 'PARALLEL'
                              ? '평행 우주'
                              : project.worldSetting || '미지정',
                      icon: Globe,
                      color: 'text-indigo-600',
                      bg: 'bg-indigo-50',
                    },
                    {
                      label: '톤앤매너 (Tone)',
                      value: project.toneAndManner || '미지정',
                      icon: Palette,
                      color: 'text-purple-600',
                      bg: 'bg-purple-50',
                    },
                    // Format Specific Details
                    ...((project.targetFormat === 'WEBTOON' ||
                      project.format === 'webtoon') &&
                    (project.mediaDetail || project.mediaDetails)
                      ? [
                          {
                            label: '작화 스타일',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.style || '미지정',
                            icon: ImageIcon,
                            color: 'text-pink-600 dark:text-pink-400',
                            bg: 'bg-pink-50 dark:bg-pink-900/20',
                          },
                          {
                            label: '연출 호흡',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.pacing || '미지정',
                            icon: Clock,
                            color: 'text-indigo-600 dark:text-indigo-400',
                            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                          },
                          {
                            label: '엔딩 포인트',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.endingPoint || '미지정',
                            icon: Target,
                            color: 'text-rose-600 dark:text-rose-400',
                            bg: 'bg-rose-50 dark:bg-rose-900/20',
                          },
                        ]
                      : []),
                    ...((project.targetFormat === 'DRAMA' ||
                      project.format === 'drama') &&
                    (project.mediaDetail || project.mediaDetails)
                      ? [
                          {
                            label: '시즌 구성',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.seasonType || '미지정',
                            icon: Calendar,
                            color: 'text-pink-600 dark:text-pink-400',
                            bg: 'bg-pink-50 dark:bg-pink-900/20',
                          },
                          {
                            label: '회차당 분량',
                            value: `${(project.mediaDetail || project.mediaDetails)?.episodeDuration || 60}분`,
                            icon: Clock,
                            color: 'text-indigo-600 dark:text-indigo-400',
                            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                          },
                          {
                            label: '서브 포커스',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.subFocus || '미지정',
                            icon: Zap,
                            color: 'text-yellow-600 dark:text-yellow-400',
                            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                          },
                        ]
                      : []),
                    ...((project.targetFormat === 'MOVIE' ||
                      project.format === 'movie') &&
                    (project.mediaDetail || project.mediaDetails)
                      ? [
                          {
                            label: '러닝타임',
                            value: `${(project.mediaDetail || project.mediaDetails)?.runningTime || 120}분`,
                            icon: Clock,
                            color: 'text-indigo-600 dark:text-indigo-400',
                            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                          },
                          {
                            label: '컬러 테마',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.colorTheme || '미지정',
                            icon: Palette,
                            color: 'text-purple-600 dark:text-purple-400',
                            bg: 'bg-purple-50 dark:bg-purple-900/20',
                          },
                          {
                            label: '중점 막(Act)',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.focusAct || '미지정',
                            icon: Layout,
                            color: 'text-emerald-600 dark:text-emerald-400',
                            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                          },
                        ]
                      : []),
                    ...(project.targetFormat === 'GAME' ||
                    project.format === 'game'
                      ? [
                          {
                            label: '게임 장르',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.gameGenre || '미지정',
                            icon: Gamepad2,
                            color: 'text-purple-600 dark:text-purple-400',
                            bg: 'bg-purple-50 dark:bg-purple-900/20',
                          },
                          {
                            label: '핵심 재미',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.coreFun || '미지정',
                            icon: Sparkles,
                            color: 'text-amber-600 dark:text-amber-400',
                            bg: 'bg-amber-50 dark:bg-amber-900/20',
                          },
                          {
                            label: '타겟 플랫폼',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.platform || '미지정',
                            icon: Monitor,
                            color: 'text-blue-600 dark:text-blue-400',
                            bg: 'bg-blue-50 dark:bg-blue-900/20',
                          },
                          {
                            label: '핵심 루프',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.coreLoop || '미지정',
                            icon: RefreshCw,
                            color: 'text-indigo-600 dark:text-indigo-400',
                            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                          },
                          {
                            label: '수익 모델 (BM)',
                            value:
                              (project.mediaDetail || project.mediaDetails)
                                ?.platformBM || '미지정',
                            icon: DollarSign,
                            color: 'text-green-600 dark:text-green-400',
                            bg: 'bg-green-50 dark:bg-green-900/20',
                          },
                        ]
                      : []),
                    ...(project.additionalRequest
                      ? [
                          {
                            label: '추가 요청사항',
                            value: project.additionalRequest,
                            icon: MessageSquare,
                            color: 'text-muted-foreground',
                            bg: 'bg-muted/50',
                            isFullWidth: true,
                          },
                        ]
                      : []),
                    ...(project.addPrompt
                      ? [
                          {
                            label: '추가 요청사항 (Prompt)',
                            value: project.addPrompt,
                            icon: MessageSquare,
                            color: 'text-muted-foreground',
                            bg: 'bg-muted/50',
                            isFullWidth: true,
                          },
                        ]
                      : []),
                  ].map((item: any, i) => (
                    <div
                      key={i}
                      onClick={item.onClick}
                      className={cn(
                        `flex items-start gap-3 p-3 rounded-lg border border-border ${item.bg}`,
                        item.onClick &&
                          'cursor-pointer hover:bg-opacity-80 transition-colors',
                        item.isFullWidth &&
                          'col-span-1 md:col-span-2 lg:col-span-3',
                      )}
                    >
                      <div
                        className={`p-1.5 rounded-md bg-background/60 shrink-0`}
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                          {item.label}
                        </p>
                        <p
                          className={cn(
                            'text-sm font-semibold text-foreground',
                            item.isFullWidth
                              ? 'whitespace-pre-wrap leading-relaxed'
                              : 'truncate',
                          )}
                        >
                          {item.value || '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 bg-background border-t flex items-center justify-between z-20">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-muted-foreground"
            >
              닫기
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                className="gap-2 bg-background text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-none dark:bg-red-950/20 dark:border-red-900/50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" /> 삭제
              </Button>
              <Button
                variant="outline"
                onClick={() => onEdit(project)}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/30"
              >
                <Edit className="w-4 h-4 mr-2" /> 수정
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenReviewModal}
                className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-900/30"
              >
                <ClipboardList className="w-4 h-4 mr-2" /> 검토 내역
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPdfFullScreen} onOpenChange={setShowPdfFullScreen}>
        <DialogContent className="!w-screen !h-screen !max-w-none rounded-none border-0 p-0 overflow-y-auto bg-background">
          <div className="relative w-full min-h-full flex items-center justify-center p-8">
            <PdfPreview
              className="w-full h-full shadow-none border-0"
              isFullScreen={true}
              pdfUrl={pdfBlobUrl || undefined}
              onDownload={handleDownloadPdf}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>검토 내역</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Stats Header */}
            {reviewData && (
              <div className="bg-muted p-3 rounded-lg border mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    전체 검토 현황
                  </span>
                  <span className="font-bold text-lg text-foreground">
                    {reviewData.authorCommentCurrentCount} /{' '}
                    {reviewData.totalAuthorCount}명
                  </span>
                </div>
              </div>
            )}

            {reviewData?.matchedAuthors &&
            reviewData.matchedAuthors.length > 0 ? (
              reviewData.matchedAuthors.map(
                (authorName: string, idx: number) => {
                  const comment = reviewData.comments?.find(
                    (c: any) => c.authorName === authorName,
                  );

                  return (
                    <div
                      key={idx}
                      className="bg-card p-4 rounded-lg space-y-3 border border-border shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                            {authorName.charAt(0)}
                          </div>
                          <span className="font-bold text-foreground text-sm">
                            {authorName}
                          </span>
                        </div>
                        {comment ? (
                          <Badge
                            variant={
                              comment.status === 'APPROVED'
                                ? 'default'
                                : comment.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className={cn(
                              'text-xs px-2 py-0.5',
                              comment.status === 'APPROVED' &&
                                'bg-emerald-600 hover:bg-emerald-700',
                              comment.status === 'REJECTED' &&
                                'bg-rose-600 hover:bg-rose-700',
                              comment.status === 'ARCHIVED' &&
                                'bg-muted-foreground hover:bg-muted-foreground/80',
                            )}
                          >
                            {comment.status === 'APPROVED'
                              ? '승인'
                              : comment.status === 'REJECTED'
                                ? '반려'
                                : comment.status === 'ARCHIVED'
                                  ? '미사용'
                                  : '대기'}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs bg-muted/50 text-muted-foreground border-border font-normal"
                          >
                            아직 검토하지 않음
                          </Badge>
                        )}
                      </div>
                      {comment && (
                        <div className="pl-10">
                          <div className="bg-muted/50 p-3 rounded-md text-sm text-foreground whitespace-pre-wrap">
                            {comment.comment}
                          </div>
                          <p className="text-xs text-muted-foreground text-right mt-1.5">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                },
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>매칭된 작가가 없습니다.</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              className="flex-1 sm:flex-none"
            >
              닫기
            </Button>
            {allApproved &&
              !['APPROVED', 'REJECTED'].includes(project.status) && (
                <Button
                  onClick={() => handleFinalDecision('APPROVED')}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  최종 승인
                </Button>
              )}
            {anyRejected &&
              !['APPROVED', 'REJECTED'].includes(project.status) && (
                <Button
                  onClick={() => handleFinalDecision('REJECTED')}
                  variant="destructive"
                  className="flex-1 sm:flex-none"
                >
                  최종 반려
                </Button>
              )}
          </DialogFooter>
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
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">작가</span>
                  <span className="font-medium">
                    {selectedLorebookDetail.authorName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">작품</span>
                  <span className="font-medium">
                    {selectedLorebookDetail.workTitle}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-sm text-muted-foreground">
                  내용
                </h4>
                <div className="p-4 bg-card border border-border rounded-lg min-h-[100px] text-sm leading-relaxed">
                  {(() => {
                    if (!selectedLorebookDetail.description)
                      return '내용이 없습니다.';

                    let descData = selectedLorebookDetail.description;

                    // Try to parse if string
                    if (typeof descData === 'string') {
                      try {
                        // Check if it looks like JSON
                        if (descData.trim().startsWith('{')) {
                          descData = JSON.parse(descData);
                        }
                      } catch (e) {
                        // Keep as string if parsing fails
                      }
                    }

                    // If it is an object (and was parsed successfully or was already an object)
                    if (typeof descData === 'object' && descData !== null) {
                      // The user requested to exclude the first key (which is the Lorebook Name)
                      // So we take the first value from the object
                      const values = Object.values(descData);
                      if (values.length > 0) {
                        const innerData = values[0];

                        // If the inner data is an object (e.g. { "Char1": "...", "Char2": "..." })
                        if (
                          typeof innerData === 'object' &&
                          innerData !== null
                        ) {
                          return (
                            <div className="space-y-4">
                              {Object.entries(innerData).map(([key, value]) => (
                                <div key={key} className="flex flex-col gap-1">
                                  <span className="font-bold text-foreground bg-muted px-2 py-1 rounded inline-block w-fit text-xs">
                                    {key}
                                  </span>
                                  <div className="text-muted-foreground whitespace-pre-wrap pl-1">
                                    {Array.isArray(value) ? (
                                      <ul className="list-disc list-inside">
                                        {value.map((v: any, i: number) => (
                                          <li key={i}>{String(v)}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      String(value)
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // If the inner data is just a string or other primitive
                        return (
                          <span className="whitespace-pre-wrap">
                            {String(innerData)}
                          </span>
                        );
                      }
                    }

                    // Fallback: Render string
                    return (
                      <span className="whitespace-pre-wrap">
                        {String(descData)}
                      </span>
                    );
                  })()}
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

      <Dialog
        open={showLorebookListModal}
        onOpenChange={setShowLorebookListModal}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto flex flex-col bg-muted/30">
          <DialogHeader className="px-1">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              원천 데이터 상세
            </DialogTitle>
            {/* Filter Bar */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {['전체', '인물', '장소', '물건', '집단', '세계', '사건'].map(
                (cat) => (
                  <Button
                    key={cat}
                    variant={lorebookFilter === cat ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs rounded-full px-3 shrink-0"
                    onClick={() => setLorebookFilter(cat)}
                  >
                    {cat}
                  </Button>
                ),
              )}
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {lorebooks
                ?.filter(
                  (lb) =>
                    lorebookFilter === '전체' || lb.category === lorebookFilter,
                )
                .map((lorebook, index) => {
                  // Determine if this is the core lorebook (first item in the original list)
                  const isCore =
                    lorebooks.length > 0 &&
                    lorebook.lorebookId === lorebooks[0].lorebookId;

                  return (
                    <SelectedSettingCard
                      key={lorebook.lorebookId}
                      item={lorebook}
                      onRemove={() => {}}
                      isCrown={isCore}
                      hideRemove={true}
                    />
                  );
                })}
              {(!lorebooks ||
                lorebooks.filter(
                  (lb) =>
                    lorebookFilter === '전체' || lb.category === lorebookFilter,
                ).length === 0) && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  해당 카테고리의 설정집이 없습니다.
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 mt-2 border-t">
            <Button
              variant="outline"
              onClick={() => setShowLorebookListModal(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      else if (l.category === '집단') counts.groups++;
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
      (l) => l.lorebookId === selectedCrownSetting,
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
        color: 'bg-muted text-muted-foreground border-border',
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
    if (!categoriesPresent.has('집단'))
      tips.push({
        label: '집단 미포함',
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
    osmuStrategy: [] as string[],
    marketingPoints: [] as string[],
  });

  // Media Specific Details State
  const [mediaDetails, setMediaDetails] = useState<any>({});
  const [mediaPrompt, setMediaPrompt] = useState('');

  // Search States
  const [authorSearch, setAuthorSearch] = useState('');
  const [workSearch, setWorkSearch] = useState('');
  const [lorebookSearch, setLorebookSearch] = useState('');
  const [selectedLorebookSearch, setSelectedLorebookSearch] = useState('');
  const [viewingLorebook, setViewingLorebook] = useState<any>(null);

  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllSpinoffs, setShowAllSpinoffs] = useState(false);
  const [showCoreSettingDetail, setShowCoreSettingDetail] = useState(false);

  // Fetch Current User (Manager)
  const [managerId, setManagerId] = useState<string>('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await authService.me();
        if (me.integrationId) {
          setManagerId(me.integrationId);
        }
      } catch (e) {
        console.error('Failed to fetch manager info', e);
      }
    };
    fetchMe();
  }, []);
  const { data: userData } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled: isOpen,
  });

  // Data Queries
  const { data: authors } = useQuery({
    queryKey: [
      'manager',
      'authors',
      'list',
      userData?.integrationId || userData?.userId,
    ],
    queryFn: () => {
      const managerId = userData?.integrationId || userData?.userId;
      if (!managerId) return [];
      return managerService.getManagerAuthors(managerId);
    },
    enabled:
      isOpen &&
      currentStep === 1 &&
      !!(userData?.integrationId || userData?.userId),
  });

  const { data: works } = useQuery({
    queryKey: [
      'manager',
      'author-works',
      selectedAuthor?.integrationId || selectedAuthor?.id,
    ],
    queryFn: async () => {
      const authId = selectedAuthor?.integrationId || selectedAuthor?.id;
      if (!authId) return [];
      try {
        return await managerService.getAuthorWorks(authId);
      } catch (error) {
        console.error('Failed to fetch author works:', error);
        return [];
      }
    },
    enabled: !!(selectedAuthor?.integrationId || selectedAuthor?.id),
  });

  const { data: lorebooks } = useQuery({
    queryKey: [
      'manager',
      'lorebooks',
      selectedAuthor?.id,
      selectedWork?.workId,
    ],
    queryFn: () =>
      selectedWork?.workId
        ? managerService.getAuthorWorkLorebooks(selectedWork.workId)
        : Promise.resolve([]),
    enabled: !!selectedWork?.workId,
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
    const list = Array.isArray(authors)
      ? authors
      : (authors as any).content || [];
    return list.filter((a: any) =>
      a.name.toLowerCase().includes(authorSearch.toLowerCase()),
    );
  }, [authors, authorSearch]);

  const filteredWorks = useMemo(() => {
    if (!works) return [];
    const list = Array.isArray(works) ? works : (works as any).content || [];
    return list.filter((w: any) =>
      w.title.toLowerCase().includes(workSearch.toLowerCase()),
    );
  }, [works, workSearch]);

  const filteredLorebooks = useMemo(() => {
    if (!lorebooks) return [];
    const list = Array.isArray(lorebooks)
      ? lorebooks
      : (lorebooks as any).content || [];
    let filtered = list.filter((l: any) =>
      l.keyword.toLowerCase().includes(lorebookSearch.toLowerCase()),
    );
    if (lorebookCategoryTab !== 'all') {
      const categoryMap: Record<string, string[]> = {
        characters: ['인물'],
        places: ['장소'],
        items: ['물건'],
        groups: ['집단', '집단'],
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

  const filteredSelectedLorebooks = useMemo(() => {
    if (!selectedLorebooks) return [];
    return selectedLorebooks.filter((l: any) =>
      l.keyword.toLowerCase().includes(selectedLorebookSearch.toLowerCase()),
    );
  }, [selectedLorebooks, selectedLorebookSearch]);

  const toggleAllLorebooks = (checked: boolean) => {
    if (checked) {
      // Add all visible lorebooks that aren't already selected
      const newSelected = [...selectedLorebooks];
      filteredLorebooks.forEach((lorebook: any) => {
        if (!newSelected.some((s) => s.lorebookId === lorebook.lorebookId)) {
          newSelected.push({
            ...lorebook,
            authorName: selectedAuthor?.name,
            workTitle: selectedWork?.title,
            authorId: selectedAuthor?.id,
            workId: selectedWork?.workId,
          });
        }
      });
      setSelectedLorebooks(newSelected);
    } else {
      // Remove all visible lorebooks
      const newSelected = selectedLorebooks.filter(
        (s) =>
          !filteredLorebooks.some((l: any) => l.lorebookId === s.lorebookId),
      );
      setSelectedLorebooks(newSelected);
    }
  };

  const toggleLorebook = (lorebook: any) => {
    setSelectedLorebooks((prev) => {
      const exists = prev.find(
        (item) => item.lorebookId === lorebook.lorebookId,
      );
      if (exists) {
        return prev.filter((item) => item.lorebookId !== lorebook.lorebookId);
      } else {
        if (!selectedAuthor || !selectedWork) return prev;
        return [
          ...prev,
          {
            ...lorebook,
            authorName: selectedAuthor.name,
            workTitle: selectedWork.title,
            authorId: selectedAuthor.id,
            workId: selectedWork.workId,
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
        // Set Author & Work info
        if (initialData.authorId) {
          setSelectedAuthor({
            id: initialData.authorId,
            name: initialData.authorName || 'Unknown Author',
            // Add other fields if necessary for consistency, though id/name are most used
          });
        }
        if (initialData.workId) {
          setSelectedWork({
            workId: initialData.workId,
            title: initialData.workTitle || 'Unknown Work',
            // Add other fields if necessary
          });
        }

        // Try to use processed_lorebooks if available, otherwise use lorebooks (legacy) or empty
        const lorebooksToSet =
          initialData.processed_lorebooks || initialData.lorebooks || [];
        setSelectedLorebooks(lorebooksToSet);

        // Set Crown Setting
        if (initialData.crownSettingId) {
          setSelectedCrownSetting(initialData.crownSettingId);
        } else if (lorebooksToSet.length > 0) {
          // Default to first lorebook if not specified
          setSelectedCrownSetting(
            lorebooksToSet[0].lorebookId || lorebooksToSet[0].id,
          );
        }

        setConflictConfirmed(true);
        setStep3Confirmed(true);
        setStep4Confirmed(true);
        setStep5Confirmed(true);
        setStep6Confirmed(true);

        // Map targetFormat/format
        const rawFormat = initialData.targetFormat || initialData.format;
        setSelectedFormat(rawFormat ? rawFormat.toLowerCase() : null);

        // Map Genre & Universe
        // Support both old structure (strategy object) and new flat DTO structure
        if (initialData.strategy) {
          // Legacy/Mock structure support
          setSelectedGenres(
            initialData.strategy.genres ||
              (initialData.strategy.genre ? [initialData.strategy.genre] : []),
          );
          setTargetGenre(initialData.strategy.targetGenre || '');
          setUniverseSetting(initialData.strategy.universe);
        } else {
          // New DTO structure
          const genres = [];
          if (initialData.targetGenre) genres.push(initialData.targetGenre);
          setSelectedGenres(genres);
          setTargetGenre(initialData.targetGenre || '');

          // Map worldSetting enum to universeSetting
          if (
            initialData.worldSetting === 'PARALLEL_WORLD' ||
            initialData.worldSetting === 'parallel'
          ) {
            setUniverseSetting('parallel');
          } else {
            setUniverseSetting('shared');
          }
        }

        // Map Business
        if (initialData.business) {
          setBusiness(initialData.business);
        } else {
          // Map budget scale
          let budget = (initialData.budgetScale || 'medium').toLowerCase();
          if (budget === 'small') budget = 'low';
          if (budget === 'large') budget = 'high';
          if (budget === 'blockbuster') budget = 'very_high';

          // Map from flat DTO fields
          setBusiness({
            targetAge: initialData.targetAges || [],
            targetGender: (initialData.targetGender || 'all').toLowerCase(),
            budgetRange: budget,
            toneManner: initialData.toneAndManner || '',
            osmuStrategy: [], // Not present in DTO
            marketingPoints: [], // Not present in DTO
          });
        }

        // Pre-fill Project Title
        if (initialData.title) {
          setProjectTitle(initialData.title);
        }

        // Map Media Details (Backend DTO -> Frontend State)
        const rawMedia =
          initialData.mediaDetail || initialData.mediaDetails || {};

        // Reverse map platform for Game
        let gamePlatform = rawMedia.platform || rawMedia.platformBM;
        if (gamePlatform === 'MOBILE_F2P') gamePlatform = 'mobile';
        if (
          gamePlatform === 'PC_CONSOLE_PACKAGE' ||
          gamePlatform === 'PC_PACKAGE'
        )
          gamePlatform = 'pc_console';

        setMediaDetails({
          ...rawMedia,
          // Webtoon
          style: rawMedia.artStyle || rawMedia.style,
          pacing: rawMedia.directionPace || rawMedia.pacing,
          endingPoint: rawMedia.endingPoint || rawMedia.endingPoint,
          colorTone: rawMedia.colorTone || rawMedia.colorTone,

          // Drama
          seasonType: rawMedia.broadcastStrategy || rawMedia.seasonType,
          episodeDuration: rawMedia.episodeRuntime || rawMedia.episodeDuration,
          subFocus: rawMedia.subElement || rawMedia.subFocus,

          // Movie
          runningTime: rawMedia.runtime || rawMedia.runningTime,
          colorTheme: rawMedia.colorTheme || rawMedia.colorTheme,
          focusAct: rawMedia.threeActFocus || rawMedia.focusAct,

          // Game
          gameGenre: rawMedia.gameGenre || rawMedia.gameGenre,
          coreLoop: rawMedia.coreFun || rawMedia.coreLoop,
          platform: gamePlatform,

          // Spinoff
          spinoffType: rawMedia.direction || rawMedia.spinoffType,
          targetCharacter: rawMedia.mainCharacter || rawMedia.targetCharacter,
          publishPace: rawMedia.serializationPace || rawMedia.publishPace,

          // Commercial
          visualFormat: rawMedia.visualFormat || rawMedia.visualFormat,
          purpose: rawMedia.purpose || rawMedia.purpose,
          targetProduct: rawMedia.targetProduct || rawMedia.targetProduct,
        });

        setMediaPrompt(initialData.addPrompt || initialData.mediaPrompt || '');

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
          osmuStrategy: [],
          marketingPoints: [],
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
          lorebooks: selectedLorebooks.map((l) => ({
            id: l.lorebookId || l.id,
            lorebookId: l.lorebookId || l.id,
            title: l.keyword || l.title,
            category: l.category,
            description: l.description,
            setting: l.setting,
          })),
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
    if (!projectTitle.trim()) {
      toast.error('프로젝트 명을 입력해주세요.');
      // Scroll to top or focus title input if possible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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

  const confirmCreate = async () => {
    let currentManagerId = managerId;
    if (!currentManagerId) {
      try {
        const me = await authService.me();
        if (me.integrationId) {
          currentManagerId = me.integrationId;
          setManagerId(me.integrationId);
        }
      } catch (e) {
        console.error('Failed to fetch manager info', e);
      }
    }

    if (!currentManagerId) {
      toast.error('Manager ID를 찾을 수 없습니다. 다시 로그인해주세요.');
      return;
    }

    // Map budget range to API enum
    const mapBudgetScale = (range: string) => {
      switch (range) {
        case 'low':
          return 'SMALL';
        case 'medium':
          return 'MEDIUM';
        case 'high':
          return 'LARGE';
        case 'very_high':
          return 'BLOCKBUSTER';
        default:
          return 'MEDIUM';
      }
    };

    // Map platform to platformBM
    const mapPlatformBM = (platform: string) => {
      if (platform === 'mobile') return 'MOBILE_F2P';
      if (platform === 'pc_console') return 'PC_PACKAGE';
      return platform ? platform.toUpperCase() : undefined;
    };

    // Add work info to processed_lorebooks
    const processedLorebooksWithWorkInfo = (
      conflictResult?.processed_lorebooks || []
    ).map((lb: any) => ({
      ...lb,
      workId: selectedWork?.workId || selectedWork?.id,
      workTitle: selectedWork?.title,
    }));

    onCreated({
      managerId: currentManagerId,
      title: projectTitle,
      lorebookIds: (() => {
        const ids = selectedLorebooks.map((l: any) => l.lorebookId || l.id);
        if (selectedCrownSetting) {
          // Move crown setting to first position
          return [
            selectedCrownSetting,
            ...ids.filter((id: number) => id !== selectedCrownSetting),
          ];
        }
        return ids;
      })(),
      targetFormat: selectedFormat?.toUpperCase(),
      targetGenre: targetGenre || selectedGenres[0] || 'FANTASY',
      worldSetting: universeSetting.toUpperCase(),
      targetAges: business.targetAge,
      targetGender: business.targetGender.toUpperCase(),
      budgetScale: mapBudgetScale(business.budgetRange),
      toneAndManner: business.toneManner,
      addPrompt: mediaPrompt,
      mediaDetail: {
        ...mediaDetails,
        gameGenre: mediaDetails.gameGenre,
        coreFun: mediaDetails.coreLoop?.toUpperCase(),
        platformBM: mapPlatformBM(mediaDetails.platform),
      },
      processed_lorebooks: processedLorebooksWithWorkInfo,
    });
    toast.success(
      '제안서 생성 요청이 완료되었습니다. (예상 소요시간: 15~20분)',
    );
    setShowCreateConfirm(false);
  };

  // Formats used to be here, now at module scope

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
          <div className="flex items-center justify-between px-6 py-2 border-b bg-background z-10">
            <div>
              <DialogTitle className="text-base font-bold">
                {initialData
                  ? 'IP 확장 프로젝트 수정'
                  : '새로운 IP 확장 프로젝트 생성'}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs">
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
          <div className="px-6 py-4 bg-muted/30 border-b shrink-0">
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
                            ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                            : isCompleted
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border-2 border-muted text-muted-foreground',
                        )}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : step}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium absolute -bottom-4 w-20 text-center',
                          isActive
                            ? 'text-foreground'
                            : isCompleted
                              ? 'text-muted-foreground'
                              : 'text-muted/50',
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    {step < 6 && (
                      <div
                        className={cn(
                          'w-10 sm:w-16 h-[2px] mx-1 mb-2',
                          isCompleted ? 'bg-primary' : 'bg-muted',
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-muted/30 relative">
            {currentStep === 1 && (
              <div className="h-full p-4 max-w-[1600px] mx-auto flex flex-col">
                {/* Step 1: Selection */}
                <div className="flex-1 min-h-0 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full min-h-0">
                    {/* 1. Authors */}
                    <Card className="flex flex-col min-h-[500px] lg:h-full border-border shadow-sm hover:border-ring transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-card shrink-0">
                        <h3 className="font-bold flex items-center gap-2 text-foreground text-base">
                          <Users className="w-4 h-4 text-muted-foreground" />{' '}
                          작가 선택
                        </h3>
                        <div className="relative mt-2">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                          <Input
                            placeholder="작가 검색..."
                            className="pl-9 h-9 text-sm bg-muted/50 border-input focus-visible:ring-ring"
                            value={authorSearch}
                            onChange={(e) => setAuthorSearch(e.target.value)}
                          />
                        </div>
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-card overflow-y-auto">
                        <div className="p-3 space-y-1.5">
                          {filteredAuthors.map((author: any) => (
                            <div
                              key={author.id}
                              onClick={() => {
                                if (selectedAuthor?.id === author.id) return;
                                setSelectedAuthor(author);
                                setSelectedWork(null);
                              }}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm border border-transparent',
                                selectedAuthor?.id === author.id
                                  ? 'bg-primary text-primary-foreground shadow-md transform scale-[1.01]'
                                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border',
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
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
                                      ? 'text-primary-foreground/80'
                                      : 'text-muted-foreground',
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
                    <Card className="flex flex-col min-h-[500px] lg:h-full border-border shadow-sm hover:border-ring transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-card shrink-0">
                        <h3 className="font-bold flex items-center gap-2 text-foreground text-base">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />{' '}
                          작품 선택
                        </h3>
                        <div className="relative mt-2">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                          <Input
                            placeholder="작품 검색..."
                            className="pl-9 h-9 text-sm bg-muted/50 border-input focus-visible:ring-ring"
                            value={workSearch}
                            onChange={(e) => setWorkSearch(e.target.value)}
                            disabled={!selectedAuthor}
                          />
                        </div>
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-card overflow-y-auto">
                        {!selectedAuthor ? (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center min-h-[200px]">
                            <Users className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">
                              작가를 먼저 선택해주세요
                            </p>
                          </div>
                        ) : filteredWorks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center min-h-[200px]">
                            <p className="text-sm">등록된 작품이 없습니다</p>
                          </div>
                        ) : (
                          <div className="p-3 space-y-1.5">
                            {filteredWorks.map((work: any) => (
                              <div
                                key={work.workId}
                                onClick={() => {
                                  if (selectedWork?.workId === work.workId)
                                    return;
                                  setSelectedWork(work);
                                }}
                                className={cn(
                                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm border border-transparent',
                                  selectedWork?.workId === work.workId
                                    ? 'bg-primary text-primary-foreground shadow-md transform scale-[1.01]'
                                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border',
                                )}
                              >
                                {work.coverImageUrl ? (
                                  <img
                                    src={work.coverImageUrl}
                                    alt={work.title}
                                    className="w-10 h-14 object-cover rounded-md shadow-sm bg-muted"
                                  />
                                ) : (
                                  <div className="w-10 h-14 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
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
                                      selectedWork?.workId === work.workId
                                        ? 'text-primary-foreground/80'
                                        : 'text-muted-foreground',
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
                    <Card className="flex flex-col min-h-[500px] lg:h-full border-border shadow-sm hover:border-ring transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-card shrink-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold flex items-center gap-2 text-foreground text-base">
                            설정집 선택
                          </h3>
                          {selectedWork && filteredLorebooks.length > 0 && (
                            <label
                              htmlFor="select-all-lorebooks"
                              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors"
                            >
                              <Checkbox
                                id="select-all-lorebooks"
                                checked={
                                  filteredLorebooks.length > 0 &&
                                  filteredLorebooks.every((l: any) =>
                                    selectedLorebooks.some(
                                      (s) => s.lorebookId === l.lorebookId,
                                    ),
                                  )
                                }
                                onCheckedChange={(checked) =>
                                  toggleAllLorebooks(!!checked)
                                }
                              />
                              <span className="text-xs text-muted-foreground font-medium select-none">
                                전체 선택
                              </span>
                            </label>
                          )}
                        </div>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                          <Input
                            placeholder="키워드 검색..."
                            className="pl-9 h-9 text-sm bg-muted/50 border-input focus-visible:ring-ring"
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
                            <TabsList className="w-full grid grid-cols-7 h-auto p-1 bg-muted/50">
                              {[
                                { id: 'all', label: '전체' },
                                { id: 'characters', label: '인물' },
                                { id: 'places', label: '장소' },
                                { id: 'items', label: '물건' },
                                { id: 'groups', label: '집단' },
                                { id: 'worldviews', label: '세계' },
                                { id: 'plots', label: '사건' },
                              ].map((tab) => (
                                <TabsTrigger
                                  key={tab.id}
                                  value={tab.id}
                                  className="text-xs font-bold px-0.5 py-1.5 h-7 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center justify-center transition-all text-muted-foreground"
                                >
                                  {tab.label}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </Tabs>
                        )}
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-card scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overflow-y-auto">
                        {!selectedWork ? (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center min-h-[200px]">
                            <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">
                              작품을 먼저 선택해주세요
                            </p>
                          </div>
                        ) : filteredLorebooks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center min-h-[200px]">
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
                                  (item) =>
                                    item.lorebookId === lorebook.lorebookId,
                                );

                                // Parse setting for display
                                let settingContent = lorebook.setting;
                                try {
                                  if (typeof settingContent === 'string') {
                                    settingContent = JSON.parse(settingContent);
                                  }
                                } catch (e) {}

                                let summary = lorebook.description;
                                try {
                                  if (
                                    typeof summary === 'string' &&
                                    summary.trim().startsWith('{')
                                  ) {
                                    const parsed = JSON.parse(summary);
                                    if (
                                      typeof parsed === 'object' &&
                                      parsed !== null
                                    ) {
                                      const values = Object.values(parsed);
                                      if (values.length > 0) {
                                        // Use the first value as the description
                                        const firstValue = values[0];
                                        if (typeof firstValue === 'string') {
                                          summary = firstValue;
                                        } else if (
                                          typeof firstValue === 'object' &&
                                          firstValue !== null
                                        ) {
                                          summary = Object.values(firstValue)
                                            .filter(
                                              (v) =>
                                                typeof v === 'string' ||
                                                typeof v === 'number',
                                            )
                                            .join(' ');
                                        }
                                      }
                                    }
                                  }
                                } catch (e) {}

                                // Truncate and clean summary
                                if (summary) {
                                  // Remove keyword if it starts with it (case insensitive)
                                  const keyword = lorebook.keyword || '';
                                  if (
                                    keyword &&
                                    summary
                                      .toLowerCase()
                                      .startsWith(keyword.toLowerCase())
                                  ) {
                                    summary = summary
                                      .substring(keyword.length)
                                      .trim();
                                    // Remove leading colon or hyphen if present
                                    summary = summary.replace(/^[:\-\s]+/, '');
                                  }

                                  // Truncate to ~50 chars with ...
                                  if (summary.length > 50) {
                                    summary = summary.substring(0, 50) + '...';
                                  }
                                }

                                if (!summary) {
                                  if (
                                    typeof settingContent === 'object' &&
                                    settingContent !== null
                                  ) {
                                    summary =
                                      settingContent.description ||
                                      settingContent.summary ||
                                      Object.entries(settingContent)
                                        .filter(
                                          ([k, v]) =>
                                            !['id', 'image'].includes(k) &&
                                            (typeof v === 'string' ||
                                              typeof v === 'number'),
                                        )
                                        .slice(0, 3)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(' / ');
                                  } else if (
                                    typeof settingContent === 'string'
                                  ) {
                                    summary = settingContent;
                                  }
                                }

                                return (
                                  <div
                                    key={`${lorebook.lorebookId}-${index}`}
                                    className={cn(
                                      'flex items-start gap-3 p-3 rounded-lg transition-all border text-sm group relative',
                                      isSelected
                                        ? 'bg-muted/50 border-primary/50 ring-1 ring-primary/50 shadow-sm'
                                        : 'bg-card border-border hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm',
                                    )}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() =>
                                        toggleLorebook(lorebook)
                                      }
                                      className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <div
                                      className="flex-1 min-w-0 cursor-pointer select-none"
                                      onClick={() => toggleLorebook(lorebook)}
                                    >
                                      <div className="font-bold flex items-center gap-2 text-foreground">
                                        <HighlightText
                                          text={lorebook.keyword}
                                          highlight={lorebookSearch}
                                        />
                                        <Badge
                                          variant="secondary"
                                          className="text-xs h-4 px-1 bg-muted text-muted-foreground border-border"
                                        >
                                          {lorebook.category}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                        {summary}
                                      </p>
                                    </div>
                                    {/* Maximize icon removed as per request */}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        )}
                      </ScrollArea>
                    </Card>

                    {/* 4. Selected List */}
                    <Card className="flex flex-col overflow-hidden min-h-[500px] lg:h-full border-border shadow-sm bg-muted/20">
                      <CardHeader className="py-4 px-4 border-b bg-muted/40 shrink-0 space-y-2">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold flex items-center gap-2 text-foreground text-base">
                                <Check className="w-4 h-4 text-muted-foreground" />{' '}
                                선택된 설정집 ({selectedLorebooks.length})
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                다양한 작품의 설정집을 조합할 수 있습니다.
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                            <Input
                              placeholder="선택된 설정집 검색..."
                              className="pl-9 h-9 text-sm bg-background border-input focus-visible:ring-ring"
                              value={selectedLorebookSearch}
                              onChange={(e) =>
                                setSelectedLorebookSearch(e.target.value)
                              }
                            />
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
                                      <span className="inline-block cursor-pointer">
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            'font-medium border text-xs px-2.5 h-6 hover:opacity-80 transition-opacity',
                                            badge.color,
                                          )}
                                        >
                                          {badge.label}
                                        </Badge>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="z-[1000] bg-popover text-popover-foreground border shadow-xl">
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
                                    className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  className="p-4 max-w-[300px] space-y-3 z-[100] bg-popover border-border text-popover-foreground shadow-xl"
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
                                        <span className="text-xs text-muted-foreground leading-tight">
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
                      <ScrollArea className="flex-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overflow-y-auto">
                        {filteredSelectedLorebooks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center min-h-[200px]">
                            <p className="text-sm font-medium">
                              {selectedLorebookSearch
                                ? '검색 결과가 없습니다.'
                                : '선택된 설정집이 없습니다.'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 space-y-2">
                            {filteredSelectedLorebooks.map((item, idx) => (
                              <SelectedSettingCard
                                key={item.lorebookId}
                                item={item}
                                highlight={selectedLorebookSearch}
                                onRemove={() => {
                                  setSelectedLorebooks((prev) =>
                                    prev.filter(
                                      (l) => l.lorebookId !== item.lorebookId,
                                    ),
                                  );
                                  if (
                                    selectedCrownSetting === item.lorebookId
                                  ) {
                                    setSelectedCrownSetting(null);
                                  }
                                }}
                                isCrown={
                                  selectedCrownSetting === item.lorebookId
                                }
                                onSelectCrown={() =>
                                  setSelectedCrownSetting((prev) =>
                                    prev === item.lorebookId
                                      ? null
                                      : item.lorebookId,
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
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">
                    설정 충돌 검수
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    선택한 설정집들 간의 논리적 충돌 가능성을 분석했습니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-border shadow-sm bg-card">
                  <CardHeader className="border-b bg-muted/40 py-3 px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold">AI 분석 결과</span>
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs h-5"
                        >
                          {Object.values(conflictResult?.충돌 || {}).reduce(
                            (acc: number, items: any) =>
                              acc + (Array.isArray(items) ? items.length : 0),
                            0,
                          )}
                          건의 충돌 감지
                        </Badge>
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        Analysis ID: #EXP-
                        {Math.floor(Math.random() * 10000)
                          .toString()
                          .padStart(4, '0')}
                      </span>
                    </div>
                  </CardHeader>
                  <ScrollArea className="flex-1 bg-card">
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
                                className="group p-4 rounded-lg border border-border bg-muted/20 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300 cursor-pointer"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-bold text-foreground flex items-center gap-2 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-xs text-muted-foreground group-hover:border-amber-300 group-hover:text-amber-600 transition-colors">
                                      !
                                    </span>
                                    {category} - {itemName}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-normal text-muted-foreground border-border"
                                  >
                                    상세 보기 &gt;
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground text-xs leading-relaxed pl-7 line-clamp-2">
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
                        <div className="text-center py-10 text-muted-foreground">
                          충돌 사항이 발견되지 않았습니다.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <CardFooter className="bg-muted/80 border-t p-4 shrink-0 backdrop-blur-sm">
                    <label
                      htmlFor="conflict-agree"
                      className="flex items-center gap-3 w-full p-3 rounded-lg border border-transparent hover:bg-card hover:border-border hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <Checkbox
                        id="conflict-agree"
                        checked={conflictConfirmed}
                        onCheckedChange={(c) => setConflictConfirmed(!!c)}
                        className="w-4 h-4 border-2 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
                      />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground select-none block w-full transition-colors">
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
                          <pre className="text-xs bg-muted text-foreground p-4 rounded-md overflow-auto max-h-[300px]">
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

                <Dialog
                  open={!!viewingLorebook}
                  onOpenChange={(open) => !open && setViewingLorebook(null)}
                >
                  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {viewingLorebook?.keyword}
                        <Badge variant="outline">
                          {viewingLorebook?.category}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        설정집 상세 정보입니다.
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 p-4 bg-muted/50 rounded-md border border-border">
                      <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                        {(() => {
                          if (!viewingLorebook) return '';
                          let content = viewingLorebook.setting;
                          try {
                            if (typeof content === 'string') {
                              const parsed = JSON.parse(content);
                              return JSON.stringify(parsed, null, 2);
                            }
                            return JSON.stringify(content, null, 2);
                          } catch (e) {
                            return content;
                          }
                        })()}
                      </pre>
                    </ScrollArea>
                    <DialogFooter>
                      <Button onClick={() => setViewingLorebook(null)}>
                        닫기
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
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">
                    확장 포맷 선택
                  </h2>
                  <p className="text-sm text-muted-foreground">
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
                              ? 'border-primary bg-muted/50 shadow-md scale-[1.01]'
                              : isRecommended
                                ? 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-300 hover:shadow-md ring-1 ring-indigo-100'
                                : 'border-border bg-card hover:border-border/80 hover:shadow-sm',
                          )}
                        >
                          {isRecommended && (
                            <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-bl-lg z-10">
                              AI 추천
                            </div>
                          )}
                          <div
                            className={cn(
                              'mb-3 w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                              selectedFormat === format.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground group-hover:bg-muted/80',
                            )}
                          >
                            <format.icon className="w-5 h-5" />
                          </div>
                          <div className="font-bold text-foreground text-base mb-1.5">
                            {format.title}
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed opacity-90">
                            {format.desc}
                          </div>
                          {selectedFormat === format.id && (
                            <div className="absolute top-3 right-3 text-primary bg-card rounded-full p-0.5 shadow-sm">
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Checkbox
                      id="step3-confirm"
                      checked={step3Confirmed}
                      onCheckedChange={(c) => setStep3Confirmed(!!c)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium select-none text-muted-foreground">
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
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">
                    비즈니스 전략
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    타겟 독자층과 예산 규모를 설정하여 현실적인 기획안을
                    도출합니다.
                  </p>
                </div>

                <Card className="border-border shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    {/* Target Age & Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-foreground">
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
                                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                  : 'bg-card hover:bg-muted/50 text-muted-foreground border-border',
                              )}
                            >
                              {age}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-foreground">
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
                                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                  : 'bg-card hover:bg-muted/50 text-muted-foreground border-border',
                              )}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-muted" />

                    {/* Budget */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-foreground">
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
                                ? 'bg-primary border-primary shadow-sm'
                                : 'bg-card hover:bg-muted/50 border-border',
                            )}
                          >
                            <div
                              className={cn(
                                'font-bold text-xs',
                                business.budgetRange === opt.val
                                  ? 'text-primary-foreground'
                                  : 'text-foreground',
                              )}
                            >
                              {opt.label}
                            </div>
                            <div
                              className={cn(
                                'text-xs mt-0.5',
                                business.budgetRange === opt.val
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {opt.sub}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-muted" />

                    {/* Tone & Manner */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-foreground">
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
                        className="h-9 text-sm bg-muted/50 border-input focus-visible:ring-ring"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 border-t p-4 flex justify-end">
                    <label
                      htmlFor="step4-confirm"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        id="step4-confirm"
                        checked={step4Confirmed}
                        onCheckedChange={(c) => setStep4Confirmed(!!c)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary w-4 h-4"
                      />
                      <span className="text-sm font-medium select-none text-muted-foreground">
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
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">
                    매체 및 장르 상세 설정
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {formats.find((f) => f.id === selectedFormat)?.title}
                    </span>{' '}
                    포맷에 최적화된 장르와 가이드라인을 설정합니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-border shadow-sm bg-card">
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                      {/* Genre & Universe Section */}
                      <div className="space-y-6">
                        {/* Conditional Genre Selection */}
                        {!['commercial'].includes(selectedFormat || '') && (
                          <>
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold text-foreground flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-muted-foreground" />
                                장르 선택 (단일 선택 가능)
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {selectedGenres.length}개 선택됨
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setShowAllGenres(!showAllGenres)
                                  }
                                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
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
                                          ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-[1.02]'
                                          : 'bg-card text-muted-foreground border-border hover:bg-muted/50 hover:border-border/80',
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
                        <div className="pt-6 border-t border-border">
                          <Label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
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
                                    ? 'bg-primary border-primary text-primary-foreground shadow-md'
                                    : 'bg-card border-border hover:border-border/80 hover:bg-muted/50',
                                )}
                              >
                                <div
                                  className={cn(
                                    'w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0',
                                    universeSetting === option.id
                                      ? 'border-primary-foreground'
                                      : 'border-muted-foreground',
                                  )}
                                >
                                  {universeSetting === option.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-xs">
                                    {option.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs mt-0.5',
                                      universeSetting === option.id
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground',
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

                      <div className="h-px bg-border" />

                      {/* Dynamic Content based on selectedFormat */}
                      {selectedFormat === 'webtoon' && (
                        <div className="space-y-6">
                          {/* Style Selection */}
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
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
                                      ? 'bg-primary border-primary shadow-md'
                                      : 'bg-card hover:bg-muted/50 border-border',
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'font-bold mb-1 text-xs',
                                      mediaDetails.style === style.id
                                        ? 'text-primary-foreground'
                                        : 'text-foreground',
                                    )}
                                  >
                                    {style.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs',
                                      mediaDetails.style === style.id
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground',
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
                            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
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
                                      ? 'bg-muted border-primary ring-1 ring-primary'
                                      : 'bg-card border-border hover:bg-muted/50',
                                  )}
                                >
                                  <div>
                                    <div className="font-bold text-foreground text-xs">
                                      {pacing.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {pacing.desc}
                                    </div>
                                  </div>
                                  {mediaDetails.pacing === pacing.id && (
                                    <Check className="w-3.5 h-3.5 text-primary" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Detailed Inputs Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-foreground">
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
                                <SelectTrigger className="h-9 text-xs bg-muted/50 border-input">
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
                              <Label className="text-xs font-bold text-foreground">
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
                                className="h-9 text-xs bg-muted/50 border-input"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'movie' && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
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
                                      ? 'bg-primary border-primary text-primary-foreground'
                                      : 'bg-card border-border text-muted-foreground hover:bg-muted/50',
                                  )}
                                >
                                  <div className="font-bold text-xs">
                                    {time.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs mt-0.5',
                                      mediaDetails.runningTime === time.id
                                        ? 'text-primary-foreground/80'
                                        : 'text-muted-foreground/80',
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
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                className="h-9 text-xs bg-muted/50 border-input"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                <SelectTrigger className="h-9 text-xs bg-muted/50 border-input">
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
                            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
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
                                    ? 'bg-muted border-primary ring-1 ring-primary'
                                    : 'bg-card border-border hover:bg-muted/50',
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                  <Film className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-foreground text-xs">
                                    단막극/미니시리즈
                                  </div>
                                  <div className="text-xs text-muted-foreground">
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
                                    ? 'bg-muted border-primary ring-1 ring-primary'
                                    : 'bg-card border-border hover:bg-muted/50',
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                  <Tv className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-foreground text-xs">
                                    멀티 시즌
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    장기적인 세계관 확장 가능
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                <SelectTrigger className="h-9 text-xs bg-muted/50 border-input">
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
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                className="h-9 text-xs bg-muted/50 border-input"
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
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                className="h-9 text-xs bg-muted/50 border-input"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                <SelectTrigger className="h-9 text-xs bg-muted/50 border-input">
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
                            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Gamepad2 className="w-3.5 h-3.5 text-muted-foreground" />
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
                                    ? 'bg-muted border-primary ring-1 ring-primary'
                                    : 'bg-card border-border hover:bg-muted/50',
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                  <Smartphone className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-foreground text-xs">
                                    모바일 (F2P)
                                  </div>
                                  <div className="text-xs text-muted-foreground">
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
                                    ? 'bg-muted border-primary ring-1 ring-primary'
                                    : 'bg-card border-border hover:bg-muted/50',
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                                  <Monitor className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-foreground text-xs">
                                    PC/콘솔 (Package)
                                  </div>
                                  <div className="text-xs text-muted-foreground">
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
                            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
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
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'bg-card border-border hover:bg-muted/50',
                                    )}
                                  >
                                    <div className="font-bold text-xs">
                                      {type.label}
                                    </div>
                                    <div
                                      className={cn(
                                        'text-xs mt-0.5',
                                        mediaDetails.spinoffType === type.id
                                          ? 'text-primary-foreground/80'
                                          : 'text-muted-foreground',
                                      )}
                                    >
                                      {type.desc}
                                    </div>
                                  </div>
                                ))}
                              {!showAllSpinoffs && (
                                <div
                                  onClick={() => setShowAllSpinoffs(true)}
                                  className="cursor-pointer p-3 rounded-lg border border-dashed border-border flex flex-col items-center justify-center hover:bg-muted/50 transition-all"
                                >
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mb-1">
                                    <Plus className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                  <span className="text-xs text-muted-foreground font-medium">
                                    더보기
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                className="h-9 text-xs bg-muted/50 border-input"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                <SelectTrigger className="h-9 text-xs bg-muted/50 border-input">
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
                            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
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
                                      ? 'bg-primary border-primary text-primary-foreground'
                                      : 'bg-card border-border hover:bg-muted/50',
                                  )}
                                >
                                  <div className="font-bold text-xs">
                                    {type.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs mt-0.5',
                                      mediaDetails.visualFormat === type.id
                                        ? 'text-primary-foreground/80'
                                        : 'text-muted-foreground',
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
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                className="h-9 text-xs bg-muted/50 border-input"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-muted-foreground">
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
                                className="h-9 text-xs bg-muted/50 border-input"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Common Prompt Field (Enhanced) */}
                      <div className="pt-6 border-t border-border">
                        <Label className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          추가 프롬프트 (선택사항)
                        </Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          AI에게 전달할 특별한 지시사항이나 제약조건이 있다면
                          자유롭게 적어주세요.
                        </p>
                        <Textarea
                          placeholder="예: 주인공의 의상은 붉은색을 메인으로..."
                          className="min-h-[100px] text-sm bg-muted/50 border-border focus-visible:ring-primary resize-none"
                          value={mediaPrompt}
                          onChange={(e) => setMediaPrompt(e.target.value)}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  <CardFooter className="bg-muted/50 border-t p-4 flex justify-end shrink-0">
                    <label
                      htmlFor="step5-confirm"
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <Checkbox
                        id="step5-confirm"
                        checked={step5Confirmed}
                        onCheckedChange={(c) => setStep5Confirmed(!!c)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary w-4 h-4"
                      />
                      <span className="text-sm font-medium select-none text-muted-foreground group-hover:text-foreground">
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
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">
                    최종 검토 및 생성
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    설정하신 내용을 바탕으로 AI가 IP 확장 제안서를 생성합니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-border shadow-sm bg-muted/20">
                  <ScrollArea className="flex-1">
                    <div className="p-5 space-y-5">
                      {/* 1. Project Title & Overview */}
                      <section className="bg-card rounded-xl p-4 border border-border shadow-sm">
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-foreground">
                          <FileText className="w-4 h-4 text-primary" />
                          프로젝트 제안서 생성 개요
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground">
                              프로젝트 제목
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              value={projectTitle}
                              onChange={(e) => setProjectTitle(e.target.value)}
                              placeholder={`${selectedWork?.title || '작품'} ${
                                formats.find((f) => f.id === selectedFormat)
                                  ?.title || '확장'
                              } 프로젝트`}
                              className="font-bold text-base h-10 bg-background border-input focus-visible:ring-primary"
                            />
                          </div>
                        </div>
                      </section>

                      {/* 2. Configuration Summary Grid */}
                      <section>
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-3 px-1 text-foreground">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          입력 설정 요약
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* [Card 1] Source Setting (Priority) */}
                          <div
                            onClick={() => setShowReferenceModal(true)}
                            className="bg-card rounded-lg p-3 border border-border shadow-sm flex items-start gap-2.5 relative group hover:border-primary/50 transition-colors cursor-pointer order-first"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs font-bold text-muted-foreground">
                                  원천 설정집
                                </p>
                              </div>
                              <p className="text-xs font-bold text-foreground truncate">
                                {selectedLorebooks.find(
                                  (l) => l.lorebookId === selectedCrownSetting,
                                )?.keyword ||
                                  selectedLorebooks[0]?.keyword ||
                                  '선택된 설정집 없음'}
                                {selectedLorebooks.length > 1 &&
                                  ` 외 ${selectedLorebooks.length - 1}건`}
                              </p>
                            </div>
                          </div>

                          {/* [Card 2] Planning Direction (New) */}
                          <div
                            onClick={() => setShowPlanningDirectionModal(true)}
                            className="bg-card rounded-lg p-3 border border-border shadow-sm flex items-start gap-2.5 relative group hover:border-primary/50 transition-colors cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                              <Zap className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-muted-foreground mb-0.5">
                                기획 방향
                              </p>
                              <p className="text-xs font-bold text-foreground truncate">
                                {analysisBadges.length > 0
                                  ? `${analysisBadges[0].label} 등 ${analysisBadges.length}개 전략`
                                  : 'AI 분석 완료'}
                              </p>
                            </div>
                          </div>

                          {/* [Card 3] Auto-Generation Rules */}
                          <div
                            onClick={() => setShowAutoGenerationModal(true)}
                            className="bg-card rounded-lg p-3 border border-border shadow-sm flex items-start gap-2.5 relative group cursor-pointer hover:border-amber-400 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-muted-foreground mb-0.5">
                                AI 생성 규칙
                              </p>
                              <p className="text-xs font-bold text-foreground truncate">
                                {unselectedCategoryTips.length > 0
                                  ? `${unselectedCategoryTips.length}개 요소 제외됨`
                                  : '모든 설정 요소 포함'}
                              </p>
                            </div>
                          </div>

                          {/* [Card 4] Conflict Summary */}
                          {conflictResult &&
                            Object.keys(conflictResult.충돌 || {}).length >
                              0 && (
                              <div
                                onClick={() => setCurrentStep(2)}
                                className="bg-card rounded-lg p-3 border border-border shadow-sm flex items-start gap-2.5 relative group cursor-pointer hover:border-destructive/50 transition-colors col-span-full"
                              >
                                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-destructive/10 text-destructive">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </div>
                                <div className="overflow-hidden w-full">
                                  <p className="text-xs font-bold text-muted-foreground mb-0.5">
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
                                                  <span className="font-bold text-foreground min-w-[60px]">
                                                    {category}/{itemName}
                                                  </span>
                                                  <span className="text-muted-foreground truncate">
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
                              label: '확장 포맷',
                              value:
                                formats.find((f) => f.id === selectedFormat)
                                  ?.title || '미지정',
                              icon: Layout,
                              color: 'text-purple-600',
                              bg: 'bg-purple-50',
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
                            {
                              label: '톤앤매너',
                              value: business.toneManner || '미지정',
                              icon: Palette,
                              color: 'text-purple-600',
                              bg: 'bg-purple-50',
                            },
                            {
                              label: '세계관 설정',
                              value:
                                universeSetting === 'shared'
                                  ? '공유 세계관'
                                  : '평행 세계관',
                              icon: Globe,
                              color: 'text-indigo-600',
                              bg: 'bg-indigo-50',
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
                                  {
                                    label: '채색 톤',
                                    value: mediaDetails.colorTone || '미지정',
                                    icon: Palette,
                                    color: 'text-purple-600',
                                    bg: 'bg-purple-50',
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
                                  {
                                    label: '서브 요소',
                                    value: mediaDetails.subFocus || '미지정',
                                    icon: Zap,
                                    color: 'text-yellow-600',
                                    bg: 'bg-yellow-50',
                                  },
                                ]
                              : []),
                            ...(selectedFormat === 'movie'
                              ? [
                                  {
                                    label: '러닝타임',
                                    value: `${mediaDetails.runningTime || 120}분`,
                                    icon: Clock,
                                    color: 'text-indigo-600',
                                    bg: 'bg-indigo-50',
                                  },
                                  {
                                    label: '컬러 테마',
                                    value: mediaDetails.colorTheme || '미지정',
                                    icon: Palette,
                                    color: 'text-purple-600',
                                    bg: 'bg-purple-50',
                                  },
                                  {
                                    label: '3막 구조',
                                    value: mediaDetails.focusAct || '미지정',
                                    icon: Layout,
                                    color: 'text-emerald-600',
                                    bg: 'bg-emerald-50',
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
                                  {
                                    label: '핵심 재미요소',
                                    value: mediaDetails.coreLoop || '미지정',
                                    icon: Zap,
                                    color: 'text-yellow-600',
                                    bg: 'bg-yellow-50',
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
                                  {
                                    label: '연재 호흡',
                                    value: mediaDetails.publishPace || '미지정',
                                    icon: Clock,
                                    color: 'text-emerald-600',
                                    bg: 'bg-emerald-50',
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
                                  {
                                    label: '활용 목적',
                                    value:
                                      mediaDetails.usagePurpose || '미지정',
                                    icon: Target,
                                    color: 'text-indigo-600',
                                    bg: 'bg-indigo-50',
                                  },
                                  {
                                    label: '타겟 상품군',
                                    value:
                                      mediaDetails.targetProduct || '미지정',
                                    icon: Package,
                                    color: 'text-emerald-600',
                                    bg: 'bg-emerald-50',
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
                              color: 'text-muted-foreground',
                              bg: 'bg-muted',
                            },
                          ]
                            .filter(
                              (item) =>
                                item.value !== '미지정' &&
                                item.label !== '원천 설정집',
                            )
                            .map((item, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  // Click handler removed since '원천 설정집' is filtered out
                                }}
                                className={cn(
                                  'bg-card rounded-lg p-3 border border-border shadow-sm flex items-start gap-2.5 relative group',
                                )}
                              >
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
                                  <p className="text-xs font-bold text-muted-foreground mb-0.5">
                                    {item.label}
                                  </p>
                                  <p className="text-xs font-bold text-foreground truncate">
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
                  <div className="p-4 bg-background border-t border-border flex items-center justify-center gap-3 shrink-0">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group border border-transparent hover:border-border">
                      <Checkbox
                        ref={confirmCheckboxRef}
                        id="step6-confirm"
                        checked={step6Confirmed}
                        onCheckedChange={(c) => setStep6Confirmed(!!c)}
                        className="w-4 h-4 border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary transition-colors"
                      />
                      <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors select-none">
                        위 내용으로 IP 확장 프로젝트 생성을 시작합니다.
                      </span>
                    </label>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-3 border-t bg-background flex justify-between items-center z-10">
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
                  {initialData ? '프로젝트 수정' : '프로젝트 생성'}
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
            <DialogTitle>원천 설정집 상세</DialogTitle>
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
                  { id: 'groups', label: '집단' },
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
                        groups: '집단',
                        worldviews: '세계관',
                        plots: '사건',
                      }[referenceModalTab],
                )
                .sort((a, b) => {
                  if (a.lorebookId === selectedCrownSetting) return -1;
                  if (b.lorebookId === selectedCrownSetting) return 1;
                  return 0;
                })
                .map((lorebook, i) => (
                  <div
                    key={i}
                    className={`bg-card p-4 rounded-lg border shadow-sm relative ${
                      selectedCrownSetting === lorebook.lorebookId
                        ? 'border-amber-400 ring-1 ring-amber-400'
                        : 'border-border'
                    }`}
                  >
                    {/* Crown Icon for Core Lorebook */}
                    {selectedCrownSetting === lorebook.lorebookId && (
                      <div className="absolute top-4 right-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>핵심 설정집 (원천 데이터)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2 pr-8">
                      <div className="font-bold text-lg text-foreground flex items-center gap-2">
                        {lorebook.keyword}
                      </div>
                      <Badge variant="secondary">{lorebook.category}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          작가:
                        </span>{' '}
                        {lorebook.authorName}
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          작품:
                        </span>{' '}
                        {lorebook.workTitle}
                      </div>
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
                      groups: '집단',
                      worldviews: '세계관',
                      plots: '사건',
                    }[referenceModalTab],
              ).length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  해당 카테고리의 원천 설정집이 없습니다.
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
        <DialogContent className="!w-screen !h-screen !max-w-none rounded-none border-0 p-0 overflow-hidden bg-background [&>button:last-child]:hidden">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-muted-foreground hover:bg-muted z-50 rounded-full w-10 h-10 p-0"
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
                  className="bg-muted/50 p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn('text-xs', badge.color)}>
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {badge.tooltip}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
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
                  className="bg-muted/50 p-3 rounded-lg border border-border flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0 text-muted-foreground text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm mb-1">
                      {tip.label}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tip.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4 flex flex-col items-center gap-2">
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
