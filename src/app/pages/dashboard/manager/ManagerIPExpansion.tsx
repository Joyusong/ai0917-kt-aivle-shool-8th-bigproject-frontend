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
} from 'lucide-react';
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
  const queryClient = useQueryClient();

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['manager', 'ip-expansion', 'proposals'],
    queryFn: managerService.getIPProposals,
  });

  const createMutation = useMutation({
    mutationFn: managerService.createIPExpansionProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manager', 'ip-expansion', 'proposals'],
      });
      setIsCreateDialogOpen(false);
      toast.success(
        editingProject
          ? '프로젝트가 수정되었습니다.'
          : '새로운 IP 확장 프로젝트가 생성되었습니다.',
      );
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
    createMutation.mutate(project);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        proposal.status === 'PENDING'
                          ? 'outline'
                          : proposal.status === 'PROPOSED'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {proposal.statusDescription || proposal.status}
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(project.id);
    setShowDeleteConfirm(false);
  };

  // Mock Content Strategy if not present
  const contentStrategy = project.contentStrategy || {
    coreNarrative:
      project.content ||
      '주인공의 내면적 갈등과 외부의 위협이 교차하며 전개되는 긴장감 넘치는 서사 구조를 가집니다.',
    characterArc:
      '평범했던 인물이 시련을 통해 각성하고, 주변 인물들과의 관계 속에서 성장하는 입체적인 변화를 그립니다.',
    worldBuilding:
      '기존 세계관의 규칙을 비틀어 새로운 마법 체계와 기술이 공존하는 독창적인 디스토피아를 구축합니다.',
    themeMessage:
      '희망과 절망 사이에서 인간의 의지가 만들어내는 기적에 대한 철학적인 메시지를 전달합니다.',
    visualStyle:
      '누아르 풍의 어두운 색채와 네온 사인이 대비되는 강렬한 비주얼로 몰입감을 극대화합니다.',
    differentiation:
      '예측 불가능한 반전과 기존 클리셰를 파괴하는 전개로 독자들에게 신선한 충격을 제공합니다.',
  };

  const PdfPreview = ({ className }: { className?: string }) => {
    return (
      <div
        className={cn(
          'bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center p-6',
          className,
        )}
      >
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          PDF 제안서 미리보기
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-[200px]">
          생성된 제안서 내용을 PDF 형식으로 미리 확인할 수 있습니다.
        </p>
        <Button variant="outline" className="gap-2 bg-white">
          <FileText className="w-4 h-4" />
          PDF 열기
        </Button>
      </div>
    );
  };

  const VisualPreview = ({
    className,
    isFullScreen = false,
  }: {
    className?: string;
    isFullScreen?: boolean;
  }) => {
    const format = project.format || 'webtoon';

    return (
      <div
        className={cn(
          'bg-slate-50 rounded-2xl overflow-hidden relative group border border-slate-200 shadow-sm',
          isFullScreen ? 'w-full h-full' : 'aspect-video',
          className,
        )}
      >
        {/* Abstract Gradient Background based on Format */}
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-700 group-hover:scale-105 bg-gradient-to-br',
            format === 'webtoon' && 'from-green-50 to-emerald-100',
            format === 'drama' && 'from-purple-50 to-indigo-100',
            format === 'movie' && 'from-red-50 to-orange-100',
            format === 'game' && 'from-blue-50 to-sky-100',
            !['webtoon', 'drama', 'movie', 'game'].includes(format) &&
              'from-slate-50 to-gray-100',
          )}
        />

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div
            className={cn(
              'w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border transition-transform duration-300 group-hover:scale-110',
              'bg-white border-white/50 text-slate-700',
            )}
          >
            {format === 'webtoon' && <ImageIcon className="w-10 h-10" />}
            {format === 'drama' && <Video className="w-10 h-10" />}
            {format === 'movie' && <Film className="w-10 h-10" />}
            {format === 'game' && <Gamepad className="w-10 h-10" />}
            {!['webtoon', 'drama', 'movie', 'game'].includes(format) && (
              <Sparkles className="w-10 h-10" />
            )}
          </div>

          <p className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            {format === 'webtoon' && '웹툰 스타일 컷 미리보기'}
            {format === 'drama' && '드라마 시네마틱 룩 미리보기'}
            {format === 'movie' && '영화 포스터 컨셉 미리보기'}
            {format === 'game' && '게임 인게임 화면 미리보기'}
            {!['webtoon', 'drama', 'movie', 'game'].includes(format) &&
              `${format} 비주얼 컨셉`}
          </p>
          <p className="text-sm text-slate-500 font-medium">
            {format === 'webtoon' && 'AI가 생성한 주요 장면 스케치'}
            {format === 'drama' && '주요 로케이션 및 무드 보드'}
            {format === 'movie' && '키 비주얼 및 타이틀 로고'}
            {format === 'game' && 'UI/UX 및 캐릭터 모델링 컨셉'}
            {!['webtoon', 'drama', 'movie', 'game'].includes(format) &&
              'AI 기반 비주얼 컨셉 제안'}
          </p>
        </div>

        {/* Overlay Info */}
        {!isFullScreen && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-slate-200/50 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm mb-0.5 text-slate-900">
                Visual Concept Generated by AI
              </h4>
              <p className="text-xs text-slate-500">
                {project.mediaDetails?.style
                  ? `${project.mediaDetails.style} Style`
                  : 'Style Analysis Pending'}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-slate-200/50 h-8 text-slate-700"
              onClick={() => setShowPreviewModal(true)}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              크게 보기
            </Button>
          </div>
        )}
      </div>
    );
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
                        project.status === 'PROPOSED' ? 'default' : 'outline'
                      }
                      className={cn(
                        'border-0',
                        project.status === 'PROPOSED'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-slate-200 text-slate-600',
                      )}
                    >
                      {project.statusDescription}
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
              {/* 1. Visual Preview & Summary */}
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                      <ImageIcon className="w-5 h-5 text-indigo-500" />
                      비주얼 & PDF 프리뷰
                    </h3>
                  </div>
                  <Tabs defaultValue="visual" className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="visual">Visual Concept</TabsTrigger>
                      <TabsTrigger value="pdf">PDF Report</TabsTrigger>
                    </TabsList>
                    <TabsContent value="visual" className="flex-1 mt-0">
                      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 min-h-[300px] h-full">
                        <VisualPreview className="w-full h-full object-cover" />
                      </div>
                    </TabsContent>
                    <TabsContent value="pdf" className="flex-1 mt-0">
                      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 min-h-[300px] h-full">
                        <PdfPreview className="w-full h-full" />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="w-full lg:w-[400px] flex flex-col space-y-4 shrink-0">
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

              {/* Reference Lorebooks */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <BookOpen className="w-5 h-5 text-slate-500" />
                  참조 설정집 ({project.lorebooks?.length || 0})
                </h3>
                {project.lorebooks && project.lorebooks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {project.lorebooks.map((lorebook: any, i: number) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className="font-bold text-slate-800 truncate"
                            title={lorebook.keyword}
                          >
                            {lorebook.keyword}
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] shrink-0 bg-slate-50 text-slate-600 border-slate-100"
                          >
                            {lorebook.category}
                          </Badge>
                        </div>
                        <div className="h-px bg-slate-50" />
                        <div className="text-xs text-slate-500 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">작가</span>
                            <span className="font-medium text-slate-700 truncate max-w-[100px]">
                              {lorebook.authorName}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">작품</span>
                            <span
                              className="font-medium text-slate-700 truncate max-w-[100px]"
                              title={lorebook.workTitle}
                            >
                              {lorebook.workTitle}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    참조된 설정집이 없습니다.
                  </div>
                )}
              </div>

              {/* 2. Core Content Strategy (6 Grid) */}
              <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  IP 확장 기획 제안서
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    {
                      title: '핵심 서사 (Core Narrative)',
                      icon: BookOpen,
                      content: contentStrategy.coreNarrative,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                    },
                    {
                      title: '캐릭터 아크 (Character Arc)',
                      icon: Users,
                      content: contentStrategy.characterArc,
                      color: 'text-green-600',
                      bg: 'bg-green-50',
                    },
                    {
                      title: '세계관 확장 (World Building)',
                      icon: Monitor,
                      content: contentStrategy.worldBuilding,
                      color: 'text-purple-600',
                      bg: 'bg-purple-50',
                    },
                    {
                      title: '주제 및 메시지 (Theme)',
                      icon: AlertCircle,
                      content: contentStrategy.themeMessage,
                      color: 'text-amber-600',
                      bg: 'bg-amber-50',
                    },
                    {
                      title: '비주얼 스타일 (Visual Style)',
                      icon: ImageIcon,
                      content: contentStrategy.visualStyle,
                      color: 'text-pink-600',
                      bg: 'bg-pink-50',
                    },
                    {
                      title: '차별화 요소 (Differentiation)',
                      icon: Zap,
                      content: contentStrategy.differentiation,
                      color: 'text-indigo-600',
                      bg: 'bg-indigo-50',
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
              {project.status !== 'PROPOSED' && (
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

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0 overflow-hidden bg-black/95 border-0">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-50 rounded-full w-10 h-10 p-0"
              onClick={() => setShowPreviewModal(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <VisualPreview
              className="w-full h-full object-contain"
              isFullScreen={true}
            />
          </div>
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const confirmCheckboxRef = useRef<HTMLButtonElement>(null);

  // Selection State
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [selectedLorebooks, setSelectedLorebooks] = useState<any[]>([]);

  // Conflict Check State
  const [conflictConfirmed, setConflictConfirmed] = useState(false);

  // Verification States
  const [step3Confirmed, setStep3Confirmed] = useState(false);
  const [step4Confirmed, setStep4Confirmed] = useState(false);
  const [step5Confirmed, setStep5Confirmed] = useState(false);
  const [step6Confirmed, setStep6Confirmed] = useState(false);

  // Expansion Type & Genre State
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [genreStrategy, setGenreStrategy] = useState<'original' | 'varied'>(
    'original',
  );
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

  // Data Queries
  const { data: authors } = useQuery({
    queryKey: ['manager', 'authors', 'list'],
    queryFn: () => managerService.getAuthors({}),
    enabled: isOpen && currentStep === 1,
  });

  const { data: works } = useQuery({
    queryKey: ['manager', 'works', selectedAuthor?.id],
    queryFn: async () => {
      if (!selectedAuthor?.id) return [];
      const res = await apiClient.get(
        `/api/v1/manager/authors/${selectedAuthor.id}/works`,
      );
      return res.data;
    },
    enabled: !!selectedAuthor?.id,
  });

  const { data: lorebooks } = useQuery({
    queryKey: ['manager', 'lorebooks', selectedWork?.id],
    queryFn: () =>
      selectedWork?.id
        ? managerService.getLorebooks(selectedWork.id)
        : Promise.resolve([]),
    enabled: !!selectedWork?.id,
  });

  // Derived Data
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

  const categoryMap: Record<string, string> = {
    characters: '인물',
    places: '장소',
    items: '물건',
    groups: '집단',
    worldviews: '세계',
    plots: '사건',
  };

  const filteredLorebooks = useMemo(() => {
    if (!lorebooks) return [];
    let filtered = lorebooks.filter((l: any) =>
      l.keyword.toLowerCase().includes(lorebookSearch.toLowerCase()),
    );
    if (lorebookCategoryTab !== 'all') {
      const targetCategory = categoryMap[lorebookCategoryTab];
      if (targetCategory) {
        filtered = filtered.filter((l: any) => l.category === targetCategory);
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
          newSelected.push(lorebook);
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
        setConflictConfirmed(true);
        setStep3Confirmed(true);
        setStep4Confirmed(true);
        setStep5Confirmed(true);
        setStep6Confirmed(true);

        setSelectedFormat(initialData.format);
        if (initialData.strategy) {
          setGenreStrategy(initialData.strategy.genre);
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
        setGenreStrategy('original');
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
      }
    }
  }, [isOpen, initialData]);

  const handleNext = () => {
    if (currentStep === 1 && selectedLorebooks.length === 0) {
      toast.error('최소 하나 이상의 설정집을 선택해주세요.');
      return;
    }
    if (currentStep === 2 && !conflictConfirmed) {
      toast.error('충돌 내용을 확인하고 동의해주세요.');
      // Optional: Focus logic for step 2 if needed
      return;
    }
    if (currentStep === 3 && !step3Confirmed) {
      toast.error('확장 포맷 및 전략 내용을 확인해주세요.');
      return;
    }
    if (currentStep === 4 && !step4Confirmed) {
      toast.error('사업 전략 내용을 확인해주세요.');
      return;
    }
    if (currentStep === 5 && !step5Confirmed) {
      toast.error('매체 상세 설정을 확인해주세요.');
      return;
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
      title: projectTitle,
      lorebooks: selectedLorebooks,
      format: selectedFormat,
      strategy: {
        genre: genreStrategy,
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
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-10">
            <div>
              <DialogTitle className="text-xl font-bold">
                {initialData
                  ? 'IP 확장 프로젝트 수정'
                  : '새로운 IP 확장 프로젝트 생성'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                6단계 프로세스를 통해 AI 기반 기획 제안서를 생성합니다.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                {isFullScreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Steps */}
          <div className="px-6 py-8 bg-slate-50 border-b shrink-0">
            <div className="flex items-center justify-center max-w-4xl mx-auto">
              {[
                '설정집 선택',
                '충돌 검수',
                '확장/장르',
                '비즈니스',
                '매체 상세',
                '최종 검토',
              ].map((label, index) => {
                const step = index + 1;
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;

                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center gap-2 relative">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all z-10',
                          isActive
                            ? 'bg-slate-900 text-white shadow-lg scale-110'
                            : isCompleted
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border-2 border-slate-200 text-slate-400',
                        )}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : step}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium absolute -bottom-6 w-20 text-center',
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
                          'w-12 sm:w-20 h-[2px] mx-2 mb-4',
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
              <div className="h-full p-6 max-w-[1800px] mx-auto flex flex-col">
                {/* Step 1: Selection */}
                <div className="flex-1 min-h-0 flex flex-col gap-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                    {/* 1. Authors */}
                    <Card className="flex flex-col h-[500px] lg:h-full border-slate-200 shadow-sm hover:border-slate-300 transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-white shrink-0">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800">
                          <Users className="w-4 h-4 text-slate-500" /> 작가 선택
                        </h3>
                        <div className="relative mt-2">
                          <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
                          <Input
                            placeholder="작가 검색..."
                            className="pl-8 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                            value={authorSearch}
                            onChange={(e) => setAuthorSearch(e.target.value)}
                          />
                        </div>
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-white overflow-y-auto">
                        <div className="p-2 space-y-1">
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
                                  ? 'bg-slate-900 text-white shadow-sm'
                                  : 'hover:bg-slate-50 text-slate-700 hover:border-slate-100',
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                {author.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  <HighlightText
                                    text={author.name}
                                    highlight={authorSearch}
                                  />
                                </div>
                                <div
                                  className={cn(
                                    'text-xs truncate',
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
                    <Card className="flex flex-col h-[500px] lg:h-full border-slate-200 shadow-sm hover:border-slate-300 transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-white shrink-0">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800">
                          <BookOpen className="w-4 h-4 text-slate-500" /> 작품
                          선택
                        </h3>
                        <div className="relative mt-2">
                          <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
                          <Input
                            placeholder="작품 검색..."
                            className="pl-8 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                            value={workSearch}
                            onChange={(e) => setWorkSearch(e.target.value)}
                            disabled={!selectedAuthor}
                          />
                        </div>
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-white overflow-y-auto">
                        {!selectedAuthor ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center min-h-[200px]">
                            <Users className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">작가를 먼저 선택해주세요</p>
                          </div>
                        ) : filteredWorks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center min-h-[200px]">
                            <p className="text-sm">등록된 작품이 없습니다</p>
                          </div>
                        ) : (
                          <div className="p-2 space-y-1">
                            {filteredWorks.map((work: any) => (
                              <div
                                key={work.id}
                                onClick={() => setSelectedWork(work)}
                                className={cn(
                                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm border border-transparent',
                                  selectedWork?.id === work.id
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'hover:bg-slate-50 text-slate-700 hover:border-slate-100',
                                )}
                              >
                                {work.coverImageUrl ? (
                                  <img
                                    src={work.coverImageUrl}
                                    alt={work.title}
                                    className="w-10 h-14 object-cover rounded shadow-sm bg-slate-200"
                                  />
                                ) : (
                                  <div className="w-10 h-14 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-400">
                                    No Img
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium line-clamp-2">
                                    <HighlightText
                                      text={work.title}
                                      highlight={workSearch}
                                    />
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs',
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
                    <Card className="flex flex-col h-[500px] lg:h-full border-slate-200 shadow-sm hover:border-slate-300 transition-colors overflow-hidden">
                      <CardHeader className="py-4 px-4 border-b bg-white shrink-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold flex items-center gap-2 text-slate-800">
                            <Wand2 className="w-4 h-4 text-slate-500" /> 설정집
                            선택
                          </h3>
                          {selectedWork && filteredLorebooks.length > 0 && (
                            <div className="flex items-center gap-2">
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
                              <label
                                htmlFor="select-all-lorebooks"
                                className="text-xs text-slate-500 cursor-pointer select-none"
                              >
                                전체 선택
                              </label>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
                          <Input
                            placeholder="키워드 검색..."
                            className="pl-8 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
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
                            <TabsList className="w-full grid grid-cols-7 h-auto p-1 bg-slate-100">
                              {[
                                { id: 'all', label: '전체', icon: List },
                                {
                                  id: 'characters',
                                  label: '인물',
                                  icon: Users,
                                },
                                { id: 'places', label: '장소', icon: MapPin },
                                { id: 'items', label: '물건', icon: Package },
                                { id: 'groups', label: '집단', icon: Users2 },
                                {
                                  id: 'worldviews',
                                  label: '세계',
                                  icon: Globe,
                                },
                                { id: 'plots', label: '사건', icon: BookOpen },
                              ].map((tab) => (
                                <TabsTrigger
                                  key={tab.id}
                                  value={tab.id}
                                  className="text-[10px] px-0.5 py-1 h-6 data-[state=active]:bg-white flex items-center justify-center gap-1"
                                >
                                  {tab.icon && <tab.icon className="w-3 h-3" />}
                                  {tab.label}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </Tabs>
                        )}
                      </CardHeader>
                      <ScrollArea className="flex-1 bg-white scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent overflow-y-auto">
                        {!selectedWork ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center min-h-[200px]">
                            <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">작품을 먼저 선택해주세요</p>
                          </div>
                        ) : filteredLorebooks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center min-h-[200px]">
                            <p className="text-sm">
                              {lorebookCategoryTab === 'all'
                                ? '등록된 설정집이 없습니다'
                                : '해당 카테고리의 설정집이 없습니다'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 space-y-2">
                            {filteredLorebooks.map((lorebook: any) => {
                              const isSelected = selectedLorebooks.some(
                                (item) => item.id === lorebook.id,
                              );
                              return (
                                <div
                                  key={lorebook.id}
                                  onClick={() => toggleLorebook(lorebook)}
                                  className={cn(
                                    'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border text-sm',
                                    isSelected
                                      ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-400'
                                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50',
                                  )}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    className="mt-1 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium flex items-center gap-2">
                                      <HighlightText
                                        text={lorebook.keyword}
                                        highlight={lorebookSearch}
                                      />
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] h-5 px-1 bg-slate-100 text-slate-600"
                                      >
                                        {lorebook.category}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                      {typeof lorebook.setting === 'string'
                                        ? lorebook.setting
                                        : JSON.stringify(lorebook.setting)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </Card>

                    {/* 4. Selected List */}
                    <Card className="flex flex-col overflow-hidden h-[500px] lg:h-full border-slate-200 shadow-sm bg-slate-50/50">
                      <CardHeader className="py-4 px-4 border-b bg-slate-100/50 shrink-0">
                        <h3 className="font-bold flex items-center gap-2 text-slate-700">
                          <Check className="w-4 h-4" /> 선택된 설정집 (
                          {selectedLorebooks.length})
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          다양한 작품의 설정집을 조합할 수 있습니다.
                        </p>
                      </CardHeader>
                      <ScrollArea className="flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent overflow-y-auto">
                        {selectedLorebooks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center min-h-[200px]">
                            <p className="text-sm">선택된 설정집이 없습니다.</p>
                          </div>
                        ) : (
                          <div className="p-2 space-y-2">
                            {selectedLorebooks.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group hover:border-slate-300 transition-colors"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-transparent"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLorebooks((prev) =>
                                      prev.filter((l) => l.id !== item.id),
                                    );
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                                <div className="font-bold text-sm mb-1 text-slate-800">
                                  {item.keyword}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-col gap-0.5">
                                  <span>작가: {item.authorName}</span>
                                  <span>작품: {item.workTitle}</span>
                                  <span className="inline-block bg-slate-100 rounded px-1.5 py-0.5 w-fit mt-1">
                                    {item.category}
                                  </span>
                                </div>
                              </div>
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
              <div className="w-full max-w-[1000px] mx-auto py-6 h-full flex flex-col">
                <div className="text-center mb-8 shrink-0">
                  <h2 className="text-2xl font-bold mb-2 tracking-tight text-slate-900">
                    설정 충돌 검수
                  </h2>
                  <p className="text-slate-500">
                    선택한 설정집들 간의 논리적 충돌 가능성을 분석했습니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-slate-200 shadow-sm bg-white">
                  <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold">AI 분석 결과</span>
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-amber-50 text-amber-700 border-amber-200"
                        >
                          3건의 충돌 감지
                        </Badge>
                      </CardTitle>
                      <span className="text-xs text-slate-400">
                        Analysis ID: #EXP-2024-001
                      </span>
                    </div>
                  </CardHeader>
                  {/* Inner Scroll Area for Conflict Content */}
                  <ScrollArea className="flex-1 bg-white">
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="group p-5 rounded-xl border border-slate-100 bg-slate-50/30 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-500 group-hover:border-amber-300 group-hover:text-amber-600 transition-colors">
                                {i}
                              </span>
                              성격 특성 충돌 가능성
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-xs font-normal text-slate-400 border-slate-200"
                            >
                              개연성 지수 -15%
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed pl-8">
                            '냉철한 이성' 특성을 가진 주인공 A와 '감정적 폭발'
                            특성을 가진 조연 B의 상호작용 시뮬레이션에서 개연성
                            오류가 발생할 확률이 높습니다. 특정 시나리오에서 두
                            캐릭터의 대화가 루프에 빠질 수 있습니다.
                          </p>
                          <div className="mt-4 pl-8 flex gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-white border border-slate-200 text-slate-500"
                            >
                              주인공 A
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-white border border-slate-200 text-slate-500"
                            >
                              조연 B
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <CardFooter className="bg-slate-50/80 border-t p-6 shrink-0 backdrop-blur-sm">
                    <div
                      className="flex items-center gap-3 w-full p-4 rounded-xl border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() => setConflictConfirmed(!conflictConfirmed)}
                    >
                      <Checkbox
                        id="conflict-agree"
                        checked={conflictConfirmed}
                        onCheckedChange={(c) => setConflictConfirmed(!!c)}
                        className="w-5 h-5 border-2 border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-colors"
                      />
                      <label
                        htmlFor="conflict-agree"
                        className="text-base font-medium text-slate-600 group-hover:text-slate-900 cursor-pointer select-none block w-full transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        위의 잠재적 충돌 내용을 확인하였으며, 이를 인지하고
                        프로젝트를 진행합니다.
                      </label>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Step 3: Expansion Type & Genre */}
            {currentStep === 3 && (
              <div className="w-full max-w-[1100px] mx-auto py-8 h-full">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold mb-2 tracking-tight text-slate-900">
                    확장 포맷 및 전략
                  </h2>
                  <p className="text-slate-500">
                    IP 확장의 방향성과 핵심 전략을 수립합니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Format Selection (Left Column) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                        <Film className="w-5 h-5 text-slate-500" /> 확장 포맷
                      </h3>
                      <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-full">
                        필수 선택
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formats.map((format) => (
                        <div
                          key={format.id}
                          onClick={() => setSelectedFormat(format.id)}
                          className={cn(
                            'cursor-pointer rounded-xl border-2 p-5 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group',
                            selectedFormat === format.id
                              ? 'border-slate-900 bg-slate-50 shadow-md'
                              : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm',
                          )}
                        >
                          <div
                            className={cn(
                              'mb-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                              selectedFormat === format.id
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
                            )}
                          >
                            <format.icon className="w-5 h-5" />
                          </div>
                          <div className="font-bold text-slate-900 mb-1">
                            {format.title}
                          </div>
                          <div className="text-xs text-slate-500 leading-tight opacity-80">
                            {format.desc}
                          </div>
                          {selectedFormat === format.id && (
                            <div className="absolute top-3 right-3 text-slate-900 bg-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strategy Selection (Right Column) */}
                  <div className="lg:col-span-5 space-y-8">
                    {/* Genre Strategy */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                        <Wand2 className="w-5 h-5 text-slate-500" /> 장르 전략
                      </h3>
                      <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-1 bg-slate-50/50">
                          <RadioGroup
                            value={genreStrategy}
                            onValueChange={(v: any) => setGenreStrategy(v)}
                            className="grid grid-cols-2 gap-1"
                          >
                            <div className="relative">
                              <RadioGroupItem
                                value="original"
                                id="g-original"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="g-original"
                                className="flex flex-col items-center justify-center py-4 px-2 rounded-lg cursor-pointer transition-all border border-slate-200 bg-white hover:bg-white peer-data-[state=checked]:bg-slate-900 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-offset-1 peer-data-[state=checked]:ring-slate-900 peer-data-[state=checked]:text-white text-slate-500 shadow-sm"
                              >
                                <span className="font-bold text-sm">
                                  원작 유지
                                </span>
                                <span className="text-[10px] opacity-70 mt-1">
                                  오리지널리티 강화
                                </span>
                              </Label>
                            </div>
                            <div className="relative">
                              <RadioGroupItem
                                value="varied"
                                id="g-varied"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="g-varied"
                                className="flex flex-col items-center justify-center py-4 px-2 rounded-lg cursor-pointer transition-all border border-slate-200 bg-white peer-data-[state=checked]:bg-slate-900 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-offset-1 peer-data-[state=checked]:ring-slate-900 peer-data-[state=checked]:text-white text-slate-500 shadow-sm"
                              >
                                <span className="font-bold text-sm">
                                  장르 변주
                                </span>
                                <span className="text-[10px] opacity-70 mt-1">
                                  새로운 재미 요소
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {genreStrategy === 'varied' && (
                          <div className="p-4 bg-white border-t border-slate-100 animate-in fade-in slide-in-from-top-1">
                            <Label className="text-xs font-bold mb-2 block text-slate-500 uppercase tracking-wider">
                              Target Genre
                            </Label>
                            <Input
                              placeholder="예: 사이버펑크, 로맨스 판타지..."
                              value={targetGenre}
                              onChange={(e) => setTargetGenre(e.target.value)}
                              className="bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                            />
                          </div>
                        )}
                      </Card>
                    </div>

                    {/* Universe Setting */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                        <Target className="w-5 h-5 text-slate-500" /> 세계관
                        설정
                      </h3>
                      <div className="space-y-3">
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
                            onClick={() => setUniverseSetting(option.id as any)}
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                              universeSetting === option.id
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                            )}
                          >
                            <div
                              className={cn(
                                'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                                universeSetting === option.id
                                  ? 'border-white'
                                  : 'border-slate-300',
                              )}
                            >
                              {universeSetting === option.id && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm">
                                {option.label}
                              </div>
                              <div
                                className={cn(
                                  'text-xs mt-0.5',
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
                </div>

                <div className="mt-12 pt-6 border-t flex justify-end">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => setStep3Confirmed(!step3Confirmed)}
                  >
                    <Checkbox
                      id="step3-confirm"
                      checked={step3Confirmed}
                      onCheckedChange={(c) => setStep3Confirmed(!!c)}
                      className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                    />
                    <label
                      htmlFor="step3-confirm"
                      className="text-sm font-medium cursor-pointer select-none text-slate-700"
                    >
                      위 전략으로 확장을 진행합니다.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Business */}
            {currentStep === 4 && (
              <div className="w-full max-w-[800px] mx-auto py-10 h-full">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold mb-2 tracking-tight text-slate-900">
                    비즈니스 전략
                  </h2>
                  <p className="text-slate-500">
                    타겟 독자층과 예산 규모를 설정하여 현실적인 기획안을
                    도출합니다.
                  </p>
                </div>

                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-8 space-y-8">
                    {/* Target Age & Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-base font-bold text-slate-800">
                          타겟 연령대
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
                                'cursor-pointer px-4 py-2 rounded-full border text-sm transition-all font-medium select-none',
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

                      <div className="space-y-3">
                        <Label className="text-base font-bold text-slate-800">
                          타겟 성별
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
                                'cursor-pointer py-2 rounded-lg border text-sm transition-all font-medium text-center select-none',
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
                    <div className="space-y-3">
                      <Label className="text-base font-bold text-slate-800">
                        예산 규모
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
                              'cursor-pointer p-3 rounded-xl border text-left transition-all select-none',
                              business.budgetRange === opt.val
                                ? 'bg-slate-900 border-slate-900 shadow-sm'
                                : 'bg-white hover:bg-slate-50 border-slate-200',
                            )}
                          >
                            <div
                              className={cn(
                                'font-bold text-sm',
                                business.budgetRange === opt.val
                                  ? 'text-white'
                                  : 'text-slate-800',
                              )}
                            >
                              {opt.label}
                            </div>
                            <div
                              className={cn(
                                'text-xs mt-1',
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
                    <div className="space-y-3">
                      <Label className="text-base font-bold text-slate-800">
                        톤앤매너 키워드
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
                        className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 border-t p-6 flex justify-end">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setStep4Confirmed(!step4Confirmed)}
                    >
                      <Checkbox
                        id="step4-confirm"
                        checked={step4Confirmed}
                        onCheckedChange={(c) => setStep4Confirmed(!!c)}
                        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                      />
                      <label
                        htmlFor="step4-confirm"
                        className="text-sm font-medium cursor-pointer select-none text-slate-700"
                      >
                        비즈니스 전략 확인 완료
                      </label>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Step 5: Media Details */}
            {currentStep === 5 && (
              <div className="w-full max-w-[1000px] mx-auto py-6 h-full flex flex-col">
                <div className="text-center mb-8 shrink-0">
                  <h2 className="text-2xl font-bold mb-2 tracking-tight text-slate-900">
                    매체 상세 설정
                  </h2>
                  <p className="text-slate-500">
                    선택한{' '}
                    <span className="font-bold text-slate-900">
                      {formats.find((f) => f.id === selectedFormat)?.title}
                    </span>{' '}
                    포맷에 최적화된 제작 가이드라인을 설정합니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-slate-200 shadow-sm bg-white">
                  <ScrollArea className="flex-1">
                    <div className="p-8 space-y-10">
                      {/* Dynamic Content based on selectedFormat */}
                      {selectedFormat === 'webtoon' && (
                        <div className="space-y-8">
                          {/* Style Selection */}
                          <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-slate-500" />
                              그림체 스타일
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                    'cursor-pointer p-4 rounded-xl border text-left transition-all hover:-translate-y-1 duration-200',
                                    mediaDetails.style === style.id
                                      ? 'bg-slate-900 border-slate-900 shadow-md'
                                      : 'bg-white hover:bg-slate-50 border-slate-200',
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'font-bold mb-1',
                                      mediaDetails.style === style.id
                                        ? 'text-white'
                                        : 'text-slate-800',
                                    )}
                                  >
                                    {style.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs',
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
                          <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              연출 호흡
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                {
                                  id: 'fast',
                                  label: '빠른 전개',
                                  desc: '액션/스릴러 중심, 컷 전환이 빠름',
                                },
                                {
                                  id: 'emotional',
                                  label: '감정선 중심',
                                  desc: '드라마/로맨스, 인물 표정 강조',
                                },
                                {
                                  id: 'suspense',
                                  label: '긴장감 조성',
                                  desc: '미스터리/공포, 컷 간의 여백 활용',
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
                                    'cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all',
                                    mediaDetails.pacing === pacing.id
                                      ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                      : 'bg-white border-slate-200 hover:bg-slate-50',
                                  )}
                                >
                                  <div>
                                    <div className="font-bold text-slate-800 text-sm">
                                      {pacing.label}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      {pacing.desc}
                                    </div>
                                  </div>
                                  {mediaDetails.pacing === pacing.id && (
                                    <Check className="w-4 h-4 text-slate-900" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Detailed Inputs Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                회차별 엔딩 포인트
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
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cliffhanger">
                                    절단신공 (Cliffhanger)
                                  </SelectItem>
                                  <SelectItem value="resolution">
                                    에피소드 완결형
                                  </SelectItem>
                                  <SelectItem value="preview">
                                    다음 화 예고 강조
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                채색 톤
                              </Label>
                              <Input
                                placeholder="예: 파스텔톤, 누아르 흑백, 비비드..."
                                value={mediaDetails.colorTone || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    colorTone: e.target.value,
                                  })
                                }
                                className="h-11 bg-slate-50 border-slate-200"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'movie' && (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              러닝타임 & 구조
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    'cursor-pointer p-4 rounded-xl border text-center transition-all',
                                    mediaDetails.runningTime === time.id
                                      ? 'bg-slate-900 border-slate-900 text-white'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                                  )}
                                >
                                  <div className="font-bold">{time.label}</div>
                                  <div
                                    className={cn(
                                      'text-xs mt-1',
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                시각적 컬러 테마
                              </Label>
                              <Input
                                placeholder="예: 차가운 블루톤, 따뜻한 앰버..."
                                value={mediaDetails.colorTheme || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    colorTheme: e.target.value,
                                  })
                                }
                                className="h-11 bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                3막 구조 강조 구간
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
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="act1">
                                    1막: 설정 및 도발적 사건
                                  </SelectItem>
                                  <SelectItem value="act2">
                                    2막: 갈등의 고조 및 대립
                                  </SelectItem>
                                  <SelectItem value="act3">
                                    3막: 클라이막스 및 해결
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'drama' && (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              편성 전략
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div
                                onClick={() =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    seasonType: 'miniseries',
                                  })
                                }
                                className={cn(
                                  'cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-4',
                                  mediaDetails.seasonType === 'miniseries'
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50',
                                )}
                              >
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                  <Film className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">
                                    단막극/미니시리즈
                                  </div>
                                  <div className="text-xs text-slate-500">
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
                                  'cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-4',
                                  mediaDetails.seasonType === 'multi_season'
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50',
                                )}
                              >
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                  <Tv className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">
                                    멀티 시즌
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    장기적인 세계관 확장 가능
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                회차당 분량
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
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">
                                    30분 (시트콤/숏폼)
                                  </SelectItem>
                                  <SelectItem value="60">
                                    60분 (표준)
                                  </SelectItem>
                                  <SelectItem value="80">
                                    80분 이상 (스페셜)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                강조하고 싶은 서브 요소
                              </Label>
                              <Input
                                placeholder="예: 서브 남주의 서사, 악역의 과거..."
                                value={mediaDetails.subFocus || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    subFocus: e.target.value,
                                  })
                                }
                                className="h-11 bg-slate-50 border-slate-200"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'game' && (
                        <div className="space-y-8">
                          {/* Game Genre & Core Loop */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                게임 장르
                              </Label>
                              <Input
                                placeholder="예: 수집형 RPG, 액션 로그라이크..."
                                value={mediaDetails.gameGenre || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    gameGenre: e.target.value,
                                  })
                                }
                                className="h-11 bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                핵심 재미요소 (Core Loop)
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
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="growth">
                                    성장 및 육성 (RPG)
                                  </SelectItem>
                                  <SelectItem value="combat">
                                    전투 및 경쟁 (PvP)
                                  </SelectItem>
                                  <SelectItem value="collection">
                                    수집 및 도감 (Gacha)
                                  </SelectItem>
                                  <SelectItem value="story">
                                    스토리 및 선택 (Visual Novel)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Platform & BM */}
                          <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                              <Gamepad2 className="w-4 h-4 text-slate-500" />
                              플랫폼 및 BM 전략
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div
                                onClick={() =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    platform: 'mobile',
                                  })
                                }
                                className={cn(
                                  'cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-4',
                                  mediaDetails.platform === 'mobile'
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50',
                                )}
                              >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">
                                    모바일 (F2P)
                                  </div>
                                  <div className="text-xs text-slate-500">
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
                                  'cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-4',
                                  mediaDetails.platform === 'pc_console'
                                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50',
                                )}
                              >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                  <Monitor className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">
                                    PC/콘솔 (Package)
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    판매 수익 및 DLC
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'spinoff' && (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-slate-500" />
                              스핀오프 방향성
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              ].map((type) => (
                                <div
                                  key={type.id}
                                  onClick={() =>
                                    setMediaDetails({
                                      ...mediaDetails,
                                      spinoffType: type.id,
                                    })
                                  }
                                  className={cn(
                                    'cursor-pointer p-4 rounded-xl border text-center transition-all',
                                    mediaDetails.spinoffType === type.id
                                      ? 'bg-slate-900 border-slate-900 text-white'
                                      : 'bg-white border-slate-200 hover:bg-slate-50',
                                  )}
                                >
                                  <div className="font-bold text-sm">
                                    {type.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs mt-1',
                                      mediaDetails.spinoffType === type.id
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                주인공 캐릭터 (Target Character)
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
                                className="h-11 bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                연재 호흡
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
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                  <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="weekly">
                                    주간 연재 (웹소설/웹툰)
                                  </SelectItem>
                                  <SelectItem value="volume">
                                    단행본 출간
                                  </SelectItem>
                                  <SelectItem value="short">
                                    단편 옴니버스
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedFormat === 'commercial' && (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-slate-500" />
                              비주얼 포맷
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    'cursor-pointer p-4 rounded-xl border text-center transition-all',
                                    mediaDetails.visualFormat === type.id
                                      ? 'bg-slate-900 border-slate-900 text-white'
                                      : 'bg-white border-slate-200 hover:bg-slate-50',
                                  )}
                                >
                                  <div className="font-bold text-sm">
                                    {type.label}
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs mt-1',
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                활용 목적
                              </Label>
                              <Input
                                placeholder="예: 팝업스토어 포스터, SNS 광고..."
                                value={mediaDetails.usagePurpose || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    usagePurpose: e.target.value,
                                  })
                                }
                                className="h-11 bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-slate-700">
                                타겟 상품군
                              </Label>
                              <Input
                                placeholder="예: 의류, 문구, 식품..."
                                value={mediaDetails.targetProduct || ''}
                                onChange={(e) =>
                                  setMediaDetails({
                                    ...mediaDetails,
                                    targetProduct: e.target.value,
                                  })
                                }
                                className="h-11 bg-slate-50 border-slate-200"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Common Prompt Field (Enhanced) */}
                      <div className="pt-6 border-t border-slate-100">
                        <Label className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          추가 프롬프트 (선택사항)
                        </Label>
                        <p className="text-sm text-slate-500 mb-3">
                          AI에게 전달할 특별한 지시사항이나 제약조건이 있다면
                          자유롭게 적어주세요.
                        </p>
                        <Textarea
                          placeholder="예: 주인공의 의상은 붉은색을 메인으로 해주세요. 배경은 사이버펑크 느낌이 강해야 합니다."
                          className="min-h-[120px] bg-slate-50 border-slate-200 focus-visible:ring-slate-400 resize-none"
                          value={mediaPrompt}
                          onChange={(e) => setMediaPrompt(e.target.value)}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  <CardFooter className="bg-slate-50 border-t p-6 flex justify-end shrink-0">
                    <div
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => setStep5Confirmed(!step5Confirmed)}
                    >
                      <Checkbox
                        id="step5-confirm"
                        checked={step5Confirmed}
                        onCheckedChange={(c) => setStep5Confirmed(!!c)}
                        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                      />
                      <label
                        htmlFor="step5-confirm"
                        className="text-sm font-medium cursor-pointer select-none text-slate-700 group-hover:text-slate-900"
                      >
                        매체 상세 설정 확인 완료
                      </label>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Step 6: Final Review */}
            {currentStep === 6 && (
              <div className="max-w-[1000px] mx-auto py-6 h-full flex flex-col">
                <div className="text-center mb-8 shrink-0">
                  <h2 className="text-2xl font-bold mb-2 tracking-tight text-slate-900">
                    최종 검토 및 생성
                  </h2>
                  <p className="text-slate-500">
                    설정하신 내용을 바탕으로 AI가 IP 확장 제안서를 생성합니다.
                  </p>
                </div>

                <Card className="flex-1 flex flex-col border-slate-200 shadow-sm bg-slate-50/50">
                  <ScrollArea className="flex-1">
                    <div className="p-8 space-y-8">
                      {/* 1. Visual Preview Section */}
                      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-6 text-slate-800">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          생성될 결과물 미리보기
                        </h3>
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                          {/* Visual Placeholder */}
                          <div className="w-full md:w-1/3 aspect-[3/4] rounded-xl overflow-hidden relative shadow-lg group">
                            <div
                              className={cn(
                                'absolute inset-0 bg-gradient-to-br',
                                selectedFormat === 'webtoon'
                                  ? 'from-green-100 to-emerald-50'
                                  : selectedFormat === 'drama'
                                    ? 'from-purple-100 to-indigo-50'
                                    : selectedFormat === 'movie'
                                      ? 'from-red-100 to-orange-50'
                                      : 'from-slate-100 to-gray-50',
                              )}
                            />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-700">
                                {formats.find((f) => f.id === selectedFormat)
                                  ?.icon ? (
                                  React.createElement(
                                    formats.find(
                                      (f) => f.id === selectedFormat,
                                    )!.icon,
                                    { className: 'w-8 h-8' },
                                  )
                                ) : (
                                  <ImageIcon className="w-8 h-8" />
                                )}
                              </div>
                              <h4 className="font-bold text-slate-900 text-lg mb-1">
                                {formats.find((f) => f.id === selectedFormat)
                                  ?.title || '확장 포맷'}
                              </h4>
                              <p className="text-xs text-slate-500">
                                {mediaDetails.style
                                  ? `${
                                      mediaDetails.style === 'realistic'
                                        ? '실사체'
                                        : mediaDetails.style === 'casual'
                                          ? '캐주얼/SD'
                                          : mediaDetails.style ===
                                              'martial_arts'
                                            ? '무협/극화체'
                                            : mediaDetails.style === 'us_comics'
                                              ? '미국 코믹스'
                                              : mediaDetails.style
                                    } 스타일`
                                  : '스타일 미정'}
                              </p>
                            </div>

                            {/* Overlay Badge */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                              <Badge className="bg-black/80 hover:bg-black/90 text-white border-0 backdrop-blur-sm">
                                AI Generation Ready
                              </Badge>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 space-y-6 w-full">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-500">
                                  프로젝트 제목
                                </Label>
                                <Input
                                  value={projectTitle}
                                  onChange={(e) =>
                                    setProjectTitle(e.target.value)
                                  }
                                  placeholder={`${selectedWork?.title || '작품'} ${
                                    formats.find((f) => f.id === selectedFormat)
                                      ?.title || '확장'
                                  } 프로젝트`}
                                  className="font-bold text-lg h-12 bg-white border-slate-300 focus-visible:ring-indigo-500"
                                />
                              </div>
                              <p className="text-slate-600 leading-relaxed">
                                선택하신{' '}
                                <span className="font-semibold text-slate-900">
                                  {selectedLorebooks.length}개의 설정집
                                </span>
                                을 기반으로,
                                <span className="font-semibold text-slate-900">
                                  {' '}
                                  {genreStrategy === 'original'
                                    ? '원작의 감성을 유지하며'
                                    : '새로운 장르로 변주하여'}
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {' '}
                                  {business.targetAge.join(', ') || '전연령'}
                                </span>{' '}
                                타겟의
                                <span className="font-semibold text-slate-900">
                                  {' '}
                                  {
                                    formats.find((f) => f.id === selectedFormat)
                                      ?.title
                                  }
                                </span>{' '}
                                기획안을 생성합니다.
                              </p>

                              <div className="pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowReferenceModal(true)}
                                  className="gap-2 text-slate-600"
                                >
                                  <List className="w-4 h-4" /> 설정 요약
                                  전체보기
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {[
                                {
                                  label: '예상 분량',
                                  value: '약 15~20페이지',
                                },
                                {
                                  label: '포함 이미지',
                                  value: '컨셉 아트 5종 이상',
                                },
                                {
                                  label: '소요 시간',
                                  value: '약 10분 내외',
                                },
                                {
                                  label: '소모 크레딧',
                                  value: '50 Credits',
                                },
                              ].map((item, i) => (
                                <div
                                  key={i}
                                  className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border border-slate-100"
                                >
                                  <span className="text-xs text-slate-500 font-medium">
                                    {item.label}
                                  </span>
                                  <span className="text-sm font-bold text-slate-700">
                                    {item.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 1.5 Content Strategy Preview */}
                      <section>
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-4 px-1 text-slate-800">
                          <FileText className="w-5 h-5 text-slate-500" />
                          제안서 핵심 구성 요소 (Content Strategy)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(
                            getContentStrategy(selectedFormat),
                          ).map(([key, strategy]: [string, any]) => (
                            <Card
                              key={key}
                              className="border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
                            >
                              <CardContent className="p-5 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                  <strategy.icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                                    {strategy.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                    {strategy.desc}
                                  </p>
                                  <div className="bg-slate-50 px-2 py-1.5 rounded text-[11px] font-medium text-slate-600 border border-slate-100 inline-block">
                                    💡 {strategy.sub}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>

                      {/* 2. Configuration Summary Grid */}
                      <section>
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-4 px-1 text-slate-800">
                          <Settings2 className="w-5 h-5 text-slate-500" />
                          설정 요약
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            {
                              label: '참조 데이터',
                              value: `${selectedLorebooks.length}개의 설정집`,
                              sub: selectedLorebooks
                                .map((l) => l.keyword)
                                .join(', '),
                              icon: BookOpen,
                              action: (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs px-2 ml-auto"
                                  onClick={() => setShowReferenceModal(true)}
                                >
                                  상세보기
                                </Button>
                              ),
                            },
                            {
                              label: '확장 전략',
                              value:
                                genreStrategy === 'original'
                                  ? '원작 장르 유지'
                                  : `장르 변주 (${targetGenre})`,
                              sub:
                                universeSetting === 'shared'
                                  ? '공유 세계관'
                                  : '평행 세계',
                              icon: Wand2,
                            },
                            {
                              label: '타겟/예산',
                              value: `${business.targetAge.join(', ') || '전연령'} / ${business.targetGender === 'male' ? '남성' : business.targetGender === 'female' ? '여성' : '전체'}`,
                              sub: `예산 규모: ${business.budgetRange === 'low' ? '저예산' : business.budgetRange === 'high' ? '블록버스터' : '중형 예산'}`,
                              icon: Target,
                            },
                            {
                              label: '매체 설정',
                              value: mediaDetails.style
                                ? `${mediaDetails.style} 스타일`
                                : '스타일 미정',
                              sub:
                                mediaDetails.seasonType === 'movie'
                                  ? '단편 영화'
                                  : mediaDetails.seasonType === 'series'
                                    ? '시리즈물'
                                    : '형식 미정',
                              icon: Film,
                            },
                            {
                              label: '톤앤매너',
                              value: business.toneManner || 'AI 추천',
                              sub: '전반적인 분위기',
                              icon: Palette,
                            },
                            {
                              label: '추가 요청',
                              value: mediaPrompt
                                ? '사용자 지정 프롬프트 포함'
                                : '없음',
                              sub: mediaPrompt
                                ? mediaPrompt.length > 20
                                  ? mediaPrompt.substring(0, 20) + '...'
                                  : mediaPrompt
                                : '-',
                              icon: MessageSquare,
                            },
                          ].map((item: any, i) => (
                            <div
                              key={i}
                              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                                <item.icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-bold text-slate-400 mb-0.5">
                                    {item.label}
                                  </div>
                                  {item.action}
                                </div>
                                <div className="font-bold text-slate-800 text-sm truncate">
                                  {item.value}
                                </div>
                                <div className="text-xs text-slate-500 truncate mt-0.5">
                                  {item.sub}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </ScrollArea>

                  {/* Final Consent Checkbox */}
                  <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-center gap-3 shrink-0">
                    <label className="flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-200">
                      <Checkbox
                        ref={confirmCheckboxRef}
                        id="step6-confirm"
                        checked={step6Confirmed}
                        onCheckedChange={(c) => setStep6Confirmed(!!c)}
                        className="w-5 h-5 border-2 border-slate-300 data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900 transition-colors"
                      />
                      <span className="text-base font-bold text-slate-600 group-hover:text-slate-900 transition-colors select-none">
                        위 내용으로 IP 확장 프로젝트 생성을 시작합니다.
                      </span>
                    </label>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-4 border-t bg-white flex justify-between items-center z-10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              이전
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              {currentStep < 6 ? (
                <Button onClick={handleNext}>
                  다음
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Wand2 className="w-4 h-4" />
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
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4 overflow-y-auto">
            <div className="space-y-4">
              {selectedLorebooks.map((lorebook, i) => (
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
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowReferenceModal(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Screen Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-[90vw] h-[90vh] p-0 overflow-y-auto bg-transparent border-0 shadow-none flex items-center justify-center">
          <div className="relative w-full h-full max-w-[600px] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={() => setShowPreviewModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div
              className={cn(
                'flex-1 bg-gradient-to-br flex flex-col items-center justify-center p-10',
                selectedFormat === 'webtoon'
                  ? 'from-green-100 to-emerald-50'
                  : selectedFormat === 'drama'
                    ? 'from-purple-100 to-indigo-50'
                    : selectedFormat === 'movie'
                      ? 'from-red-100 to-orange-50'
                      : 'from-slate-100 to-gray-50',
              )}
            >
              <div className="w-24 h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center mb-6 text-slate-700">
                {formats.find((f) => f.id === selectedFormat)?.icon ? (
                  React.createElement(
                    formats.find((f) => f.id === selectedFormat)!.icon,
                    { className: 'w-12 h-12' },
                  )
                ) : (
                  <ImageIcon className="w-12 h-12" />
                )}
              </div>
              <h2 className="font-bold text-slate-900 text-3xl mb-2">
                {formats.find((f) => f.id === selectedFormat)?.title ||
                  '확장 포맷'}
              </h2>
              <p className="text-lg text-slate-600 font-medium">
                {mediaDetails.style
                  ? `${
                      mediaDetails.style === 'realistic'
                        ? '실사체'
                        : mediaDetails.style === 'casual'
                          ? '캐주얼/SD'
                          : mediaDetails.style === 'martial_arts'
                            ? '무협/극화체'
                            : mediaDetails.style === 'us_comics'
                              ? '미국 코믹스'
                              : mediaDetails.style
                    } 스타일`
                  : '스타일 미정'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
