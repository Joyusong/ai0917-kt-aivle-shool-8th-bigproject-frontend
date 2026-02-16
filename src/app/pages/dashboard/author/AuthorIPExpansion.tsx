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
  File,
  RefreshCw,
} from 'lucide-react';
import { IPProposalCommentDto, IPProposalDto } from '../../../types/author';
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
import React, { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axios';
import { cn } from '../../../components/ui/utils';
import { managerService } from '../../../services/managerService';
import { authorService } from '../../../services/authorService';
import { toast } from 'sonner';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Checkbox } from '../../../components/ui/checkbox';
import { AuthorBreadcrumbContext } from './AuthorBreadcrumbContext';

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

// Formats definition
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

interface AuthorIPExpansionProps {
  defaultTab?: string;
}

export function AuthorIPExpansion({
  defaultTab = 'proposals',
}: AuthorIPExpansionProps) {
  const { setBreadcrumbs, onNavigate } = useContext(AuthorBreadcrumbContext);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedProposal, setSelectedProposal] =
    useState<IPProposalDto | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generatedAuthorCode, setGeneratedAuthorCode] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const breadcrumbs: { label: string; onClick?: () => void }[] = [
      { label: '홈', onClick: () => onNavigate('home') },
      { label: 'IP 제안서', onClick: () => setActiveTab('proposals') },
    ];

    setBreadcrumbs(breadcrumbs);
  }, [setBreadcrumbs, onNavigate, activeTab]);

  const { data: myManager, refetch: refetchMyManager } = useQuery({
    queryKey: ['author', 'my-manager'],
    queryFn: authorService.getMyManager,
  });

  const { data: me } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authorService.getMyPage,
  });

  // Fetch Proposals (Author's IP Expansion Comments)
  const { data: proposalsPage, isLoading: isProposalsLoading } = useQuery({
    queryKey: ['author', 'ip-proposals', me?.integrationId],
    queryFn: async () => {
      if (!me?.integrationId) return { content: [] };
      // Use author-specific comment proposals API as requested
      return authorService.getCommentProposals(me.integrationId);
    },
    enabled: !!me?.integrationId,
  });

  const proposalList = proposalsPage?.content || [];

  const handleOpenDetail = async (proposal: IPProposalDto) => {
    if (!me?.integrationId) return;
    // Ensure we have a manager ID to query the manager API
    const managerId = myManager?.managerIntegrationId;
    if (!managerId) {
      toast.error('담당 매니저 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      // Use Manager API for IP Expansion Detail as requested
      const detail = await managerService.getIPExpansionDetail(
        managerId,
        proposal.id,
      );
      setSelectedProposal(detail);
    } catch (error) {
      console.error('Failed to fetch detail:', error);
      toast.error('제안서 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const [showReviewConfirm, setShowReviewConfirm] = useState(false);
  const [pendingReviewAction, setPendingReviewAction] = useState<{
    action: 'APPROVED' | 'REJECTED';
    comment: string;
  } | null>(null);

  const handleReviewAction = (
    action: 'APPROVED' | 'REJECTED',
    comment: string,
  ) => {
    setPendingReviewAction({ action, comment });
    setShowReviewConfirm(true);
  };

  const confirmReviewAction = async () => {
    if (!selectedProposal || !me?.integrationId || !pendingReviewAction) return;

    const { action, comment } = pendingReviewAction;

    try {
      const data = {
        proposalId: selectedProposal.id,
        authorIntegrationId: me.integrationId,
        status: action,
        comment,
      };

      if (action === 'APPROVED') {
        await authorService.createProposalComment(data);
        toast.success('제안서가 승인되었습니다.');
      } else {
        await authorService.createProposalComment(data);
        toast.success('제안서가 반려되었습니다.');
      }
      setSelectedProposal(null);
      setPendingReviewAction(null);
      setShowReviewConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['author', 'ip-proposals'] });
    } catch (error) {
      toast.error(
        `${action === 'APPROVED' ? '승인' : '반려'} 처리 중 오류가 발생했습니다.`,
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-20">
      {/* 담당 매니저 정보 카드 */}
      {myManager && myManager.managerName ? (
        <Card className="bg-gradient-to-r from-[#0984E3]/5 to-[#0984E3]/10 dark:from-[#0984E3]/20 dark:to-[#0984E3]/10 border-[#0984E3]/20 dark:border-[#0984E3]/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0984E3]/10 dark:bg-[#0984E3]/20 flex items-center justify-center text-[#0984E3] dark:text-[#0984E3] font-bold text-lg border border-[#0984E3]/20 dark:border-[#0984E3]/30">
                {myManager.managerName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  담당 운영자: {myManager.managerName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {myManager.managerSiteEmail || myManager.managerEmail}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#0984E3] dark:text-[#0984E3] font-medium">
                IP 확장을 위한 1:1 지원을 받고 있습니다
              </p>
              <Button
                size="sm"
                variant="destructive"
                className="mt-2"
                onClick={async () => {
                  const ok = window.confirm('운영자와의 연동을 끊을까요?');
                  if (!ok) return;
                  try {
                    await authorService.unlinkManager();
                    await refetchMyManager();
                    toast.success('연결을 끊었습니다');
                  } catch (e) {
                    toast.error('연결 끊기에 실패했습니다');
                  }
                }}
              >
                연결 끊기
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* 제안서 검토 탭 */}
        <TabsContent value="proposals" className="mt-6 space-y-6">
          <div className="flex items-center justify-end gap-2">
            {/* 운영자와 매칭되지 않은 경우에만 작가 ID 생성 버튼 표시 */}
            {(!myManager || !myManager.managerName) && (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={async () => {
                  try {
                    const code = await authorService.generateAuthorCode();
                    setGeneratedAuthorCode(code);
                    setIsGenerateOpen(true);
                  } catch (err) {
                    toast.error('작가 코드 생성에 실패했습니다.');
                  }
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> 작가 코드 생성
              </Button>
            )}
          </div>

          {isProposalsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {!myManager?.managerIntegrationId ? (
                <div className="col-span-full h-60 flex flex-col items-center justify-center gap-3 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      담당 매니저와 연동되지 않았습니다
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      매니저와 연동 후 제안서를 확인하실 수 있습니다.
                    </p>
                  </div>
                </div>
              ) : proposalList.length > 0 ? (
                proposalList.map((proposal) => {
                  let formatId = (
                    proposal.targetFormat ||
                    proposal.format ||
                    proposal.ipProposal?.targetFormat ||
                    proposal.ipProposal?.format ||
                    proposal.target_format ||
                    ''
                  )?.toLowerCase();

                  // Handle mapping for Korean format names
                  const formatMap: Record<string, string> = {
                    웹툰: 'webtoon',
                    드라마: 'drama',
                    게임: 'game',
                    영화: 'movie',
                    스핀오프: 'spinoff',
                    '상업 이미지': 'commercial',
                    commercial_image: 'commercial',
                  };

                  if (formatMap[formatId]) {
                    formatId = formatMap[formatId];
                  }

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
                    <Sparkles className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      도착한 제안서가 없습니다
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      매니저로부터 새로운 IP 확장 제안이 오면 이곳에 표시됩니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={showReviewConfirm} onOpenChange={setShowReviewConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              제안서를{' '}
              {pendingReviewAction?.action === 'APPROVED' ? '승인' : '반려'}
              하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReviewAction?.action === 'APPROVED'
                ? '승인 처리 시 다음 단계로 진행되며, 매니저에게 알림이 전송됩니다.'
                : '반려 처리 시 사유가 전달되며, 매니저에게 알림이 전송됩니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReviewAction}
              className={
                pendingReviewAction?.action === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {pendingReviewAction?.action === 'APPROVED' ? '승인' : '반려'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Modal */}
      {selectedProposal && (
        <AuthorProjectDetailModal
          project={selectedProposal}
          managerId={myManager?.managerIntegrationId}
          authorId={me?.integrationId}
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onAction={handleReviewAction}
        />
      )}

      {/* Author ID Generation Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>작가 ID 생성 완료</DialogTitle>
            <DialogDescription>
              아래 ID를 담당 운영자에게 전달하여 연동을 요청하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded text-center">
            <span className="text-2xl font-bold tracking-wider select-all text-foreground">
              {generatedAuthorCode}
            </span>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsGenerateOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuthorProjectDetailModal({
  project,
  managerId,
  authorId,
  isOpen,
  onClose,
  onAction,
}: {
  project: any;
  managerId?: string;
  authorId?: string;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'APPROVED' | 'REJECTED', comment: string) => void;
}) {
  const queryClient = useQueryClient();
  const [showPdfFullScreen, setShowPdfFullScreen] = useState(false);
  const [showLorebookListModal, setShowLorebookListModal] = useState(false);
  const [lorebookFilter, setLorebookFilter] = useState('전체'); // New State
  const [selectedLorebookDetail, setSelectedLorebookDetail] =
    useState<any>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>(
    'APPROVED',
  );
  const [actionComment, setActionComment] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch existing comment if any
  const { data: existingComment, refetch: refetchComment } = useQuery({
    queryKey: ['author', 'proposal-comment-detail', project.id, authorId],
    queryFn: async () => {
      if (!authorId || !project.id) return null;
      try {
        const detail = await authorService.getProposalCommentDetail(
          project.id,
          authorId,
        );
        return detail?.myComment || null;
      } catch (e) {
        return null;
      }
    },
    enabled: !!authorId && showReviewModal && !!project.id,
  });

  // Sync existing comment to state when loaded
  useEffect(() => {
    if (existingComment) {
      // Map Korean status to English Enum if necessary
      // 백엔드에서 Enum Name이 아닌 Description(한글)을 반환하는 경우가 있어 매핑 처리
      const statusMap: Record<string, 'APPROVED' | 'REJECTED'> = {
        승인: 'APPROVED',
        반려: 'REJECTED',
        대기: 'APPROVED', // 대기 상태는 승인(기본값)으로 처리
        '승인 대기': 'APPROVED',
        미사용: 'APPROVED',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        PENDING: 'APPROVED',
        ARCHIVED: 'APPROVED',
      };

      const rawStatus = (existingComment.status || '').trim();
      const mappedStatus = statusMap[rawStatus] || 'APPROVED';

      console.log('Status Mapping:', { raw: rawStatus, mapped: mappedStatus });

      setActionType(mappedStatus);
      setActionComment(existingComment.comment);
    }
  }, [existingComment]);

  const { data: lorebooks } = useQuery({
    queryKey: ['author', 'proposal-lorebooks', managerId, project.id],
    queryFn: async () => {
      if (!managerId || !project.id) return [];
      return authorService.getManagerIPExpansionLorebooks(
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
      setIsLoadingPdf(true);
      try {
        // Use the API that returns a blob
        const blob = await managerService.getIPProposalPreview(project.id);

        // Check 1: Blob type
        if (blob.type === 'application/json') {
          console.warn('PDF Preview returned JSON type, likely DTO or error');
          return;
        }

        // Check 2: Header bytes (reliable for PDF)
        const header = await blob.slice(0, 10).text(); // Read first 10 bytes
        if (
          header.trim().startsWith('{') ||
          header.trim().startsWith('[') ||
          blob.type === 'application/json'
        ) {
          console.warn(
            'PDF Preview returned JSON content, likely DTO or error',
          );
          return;
        }

        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          if (active) setPdfBlobUrl(url);
        }
      } catch (e) {
        console.error('Failed to load PDF preview', e);
      } finally {
        if (active) setIsLoadingPdf(false);
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

  const handleReviewSubmitConfirm = () => {
    if (actionType === 'REJECTED' && !actionComment.trim()) {
      toast.error('반려 사유를 입력해주세요.');
      return;
    }
    setShowConfirmDialog(true);
  };

  const reviewMutation = useMutation({
    mutationFn: async ({
      isUpdate,
      data,
    }: {
      isUpdate: boolean;
      data: any;
    }) => {
      if (isUpdate) {
        return authorService.updateProposalComment(project.id, data);
      } else {
        return authorService.createProposalComment(data);
      }
    },
    onMutate: async ({ isUpdate, data }) => {
      await queryClient.cancelQueries({ queryKey: ['author', 'ip-proposals'] });
      await queryClient.cancelQueries({
        queryKey: ['author', 'proposal-comment-detail', project.id, authorId],
      });

      const previousProposals = queryClient.getQueriesData({
        queryKey: ['author', 'ip-proposals'],
      });
      const previousDetail = queryClient.getQueryData([
        'author',
        'proposal-comment-detail',
        project.id,
        authorId,
      ]);

      queryClient.setQueryData(
        ['author', 'proposal-comment-detail', project.id, authorId],
        (old: any) => {
          return {
            ...(old || {}),
            status: data.status,
            comment: data.comment,
            updatedAt: new Date().toISOString(),
          };
        },
      );

      queryClient.setQueriesData(
        { queryKey: ['author', 'ip-proposals'] },
        (old: any) => {
          if (!old || !old.content) return old;
          return {
            ...old,
            content: old.content.map((p: any) =>
              p.id === project.id ? { ...p, myStatus: data.status } : p,
            ),
          };
        },
      );

      return { previousProposals, previousDetail };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ['author', 'proposal-comment-detail', project.id, authorId],
          context.previousDetail,
        );
      }
      if (context?.previousProposals) {
        context.previousProposals.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('처리 중 오류가 발생했습니다.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['author', 'ip-proposals'] });
      queryClient.invalidateQueries({
        queryKey: ['author', 'proposal-comment-detail'],
      });
    },
  });

  const executeReviewSubmit = () => {
    if (!authorId) {
      toast.error('작가 정보를 찾을 수 없습니다.');
      return;
    }

    const isUpdate = !!existingComment;
    const data = isUpdate
      ? {
          authorIntegrationId: authorId,
          status: actionType,
          comment: actionComment,
        }
      : {
          proposalId: project.id,
          authorIntegrationId: authorId,
          status: actionType,
          comment: actionComment,
        };

    reviewMutation.mutate(
      { isUpdate, data },
      {
        onSuccess: () => {
          toast.success(
            actionType === 'APPROVED'
              ? '제안서가 승인되었습니다.'
              : '제안서가 반려되었습니다.',
          );
          setShowReviewModal(false);
          setIsEditMode(false);
          setShowConfirmDialog(false);
        },
      },
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            'p-0 gap-0 rounded-xl overflow-y-auto flex flex-col bg-card shadow-2xl border-0 transition-all duration-300',
            isExpanded
              ? 'w-screen h-screen max-w-none max-h-none rounded-none'
              : 'max-w-[85vw] lg:max-w-4xl max-h-[90vh]',
          )}
        >
          {/* Maximize/Minimize Button */}
          <div className="absolute top-4 right-12 z-50 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground bg-background/50 hover:bg-background/80 h-6 w-6 rounded-full"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>

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
              <div className="w-full h-[500px] bg-muted/30 rounded-xl overflow-hidden border border-border shadow-sm">
                <PdfPreview
                  isFullScreen={false}
                  className="h-full w-full"
                  onFullScreen={() => setShowPdfFullScreen(true)}
                  pdfUrl={pdfBlobUrl || undefined}
                  onDownload={handleDownloadPdf}
                  isLoading={isLoadingPdf}
                  fileName={
                    project.ipProposal?.filePath?.split('/').pop() ||
                    project.title
                  }
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
                              {item.content || '내용 없음'}
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
                      color: 'text-indigo-600 dark:text-indigo-400',
                      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                      onClick: () => setShowLorebookListModal(true),
                    },
                    {
                      label: '포맷 (Format)',
                      value: project.targetFormat || project.format,
                      icon: Film,
                      color: 'text-muted-foreground',
                      bg: 'bg-muted/50',
                    },
                    {
                      label: '장르 (Genre)',
                      value: project.targetGenre || '미지정',
                      icon: Sparkles,
                      color: 'text-muted-foreground',
                      bg: 'bg-muted/50',
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
                      color: 'text-muted-foreground',
                      bg: 'bg-muted/50',
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
                      color: 'text-green-600 dark:text-green-400',
                      bg: 'bg-green-50 dark:bg-green-900/20',
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
                                ?.genre || '미지정',
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                onClick={() => setShowReviewModal(true)}
              >
                <Check className="w-4 h-4" />
                검토
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {existingComment && !isEditMode
                ? '제안서 검토 내역'
                : '제안서 검토'}
            </DialogTitle>
            <DialogDescription>
              {existingComment && !isEditMode
                ? '작성된 검토 내용을 확인합니다.'
                : '제안서에 대한 승인 또는 반려 결정을 내려주세요.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {existingComment && !isEditMode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    상태:
                  </span>
                  <Badge
                    variant={
                      existingComment.status === '승인'
                        ? 'default'
                        : 'destructive'
                    }
                    className={
                      existingComment.status === '승인'
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }
                  >
                    {existingComment.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    검토 코멘트
                  </span>
                  <div className="p-3 bg-muted/50 rounded-md text-sm text-foreground whitespace-pre-wrap">
                    {existingComment.comment || '내용 없음'}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setActionType('APPROVED')}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200',
                      actionType === 'APPROVED'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-border hover:border-emerald-200 hover:bg-accent',
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                        actionType === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div
                        className={cn(
                          'font-bold',
                          actionType === 'APPROVED'
                            ? 'text-emerald-700'
                            : 'text-foreground',
                        )}
                      >
                        승인 (Approve)
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        제안서를 승인하고 다음 단계로 진행합니다
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActionType('REJECTED')}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200',
                      actionType === 'REJECTED'
                        ? 'border-rose-500 bg-rose-50/50'
                        : 'border-border hover:border-rose-200 hover:bg-accent',
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                        actionType === 'REJECTED'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <X className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div
                        className={cn(
                          'font-bold',
                          actionType === 'REJECTED'
                            ? 'text-rose-700'
                            : 'text-foreground',
                        )}
                      >
                        반려 (Reject)
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        제안서를 반려하고 사유를 전달합니다
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    {actionType === 'APPROVED' ? '승인 사유' : '반려 사유'}
                  </Label>
                  <Textarea
                    placeholder={
                      actionType === 'APPROVED'
                        ? '승인 관련 전달사항이 있다면 입력해주세요.'
                        : '반려 사유를 상세히 입력해주세요.'
                    }
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            {existingComment && !isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  닫기
                </Button>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  수정
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (existingComment) {
                      setIsEditMode(false);
                      setActionType(existingComment.status);
                      setActionComment(existingComment.comment);
                    } else {
                      setShowReviewModal(false);
                    }
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleReviewSubmitConfirm}>
                  {existingComment ? '수정완료' : '제출하기'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lorebook Detail Modal */}
      <Dialog
        open={!!selectedLorebookDetail}
        onOpenChange={() => setSelectedLorebookDetail(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLorebookDetail?.title || selectedLorebookDetail?.name}
            </DialogTitle>
            <DialogDescription>설정집 상세 내용</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <LorebookContentViewer
              content={selectedLorebookDetail?.content}
              keyword={
                selectedLorebookDetail?.title || selectedLorebookDetail?.name
              }
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showLorebookListModal}
        onOpenChange={setShowLorebookListModal}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto flex flex-col bg-background">
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
                  (lb: any) =>
                    lorebookFilter === '전체' || lb.category === lorebookFilter,
                )
                .map((lorebook: any, index: number) => {
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
                  (lb: any) =>
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

      {/* PDF Full Screen Modal */}
      <Dialog open={showPdfFullScreen} onOpenChange={setShowPdfFullScreen}>
        <DialogContent className="!w-screen !h-screen !max-w-none rounded-none border-0 p-0 overflow-y-auto bg-background">
          <div className="relative w-full min-h-full flex items-center justify-center p-8">
            <PdfPreview
              className="w-full h-full shadow-none border-0"
              isFullScreen={true}
              pdfUrl={pdfBlobUrl || undefined}
              onDownload={handleDownloadPdf}
              fileName={
                project.ipProposal?.filePath?.split('/').pop() || project.title
              }
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'APPROVED' ? '승인' : '반려'} 확인
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'APPROVED'
                ? '제안서를 승인하시겠습니까?'
                : '제안서를 반려하시겠습니까?'}
              <br />
              {existingComment && '기존 검토 내용이 수정됩니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeReviewSubmit}
              className={
                actionType === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
