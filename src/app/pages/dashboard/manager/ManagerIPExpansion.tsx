import {
  Zap,
  Film,
  Tv,
  Play,
  Sparkles,
  Calendar,
  Trash2,
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
  Settings2,
  Palette,
  MessageSquare,
  List,
  Eye,
  ArrowRight,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../components/ui/alert-dialog";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';
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

export function ManagerIPExpansion() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const { data: proposalsData, isLoading } = useQuery({
    queryKey: ['manager', 'ip-expansion', 'proposals', page],
    queryFn: () => managerService.getIPProposals(page, 12),
  });

  const proposals = proposalsData?.content || [];
  const totalPages = proposalsData?.totalPages || 1;

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

  const confirmDelete = () => {
    if (selectedProject) {
      handleDelete(selectedProject.id);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 프로젝트가 영구적으로 삭제됩니다.
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
            proposals.map((proposal: any) => (
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

      {/* Pagination */}
      {proposals.length > 0 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(0, p - 1));
                  }}
                  className={
                    page === 0
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(i);
                    }}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages - 1, p + 1));
                  }}
                  className={
                    page === totalPages - 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
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
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 프로젝트는 복구할 수 없습니다. 정말 삭제하시겠습니까?
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
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                <div className="flex-1 flex flex-col space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                    비주얼 컨셉 프리뷰
                  </h3>
                  <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 min-h-[300px]">
                    <VisualPreview className="w-full h-full object-cover" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full"
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                    참조 설정집 ({project.lorebooks?.length || 0})
                  </h3>
                  {project.lorebooks && project.lorebooks.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setShowReferenceModal(true)}
                    >
                      상세보기
                    </Button>
                  )}
                </div>
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

      <Dialog open={showReferenceModal} onOpenChange={setShowReferenceModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>참조 설정집 상세</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {project.lorebooks?.map((lorebook: any, i: number) => (
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

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-screen w-screen h-screen p-0 overflow-hidden bg-black/90 border-0 shadow-none flex items-center justify-center rounded-none">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                onClick={() => setShowPreviewModal(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div
              className={cn(
                'w-full h-full max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col',
                'bg-gradient-to-br',
                project.format === 'webtoon'
                  ? 'from-green-100 to-emerald-50'
                  : project.format === 'drama'
                    ? 'from-purple-100 to-indigo-50'
                    : project.format === 'movie'
                      ? 'from-red-100 to-orange-50'
                      : 'from-slate-100 to-gray-50',
              )}
            >
              <div className="w-24 h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center mb-6 text-slate-700 mx-auto mt-auto">
                <ImageIcon className="w-12 h-12" />
              </div>
              <h2 className="font-bold text-slate-900 text-3xl mb-2 text-center">
                {project.format ? project.format.toUpperCase() : '확장 포맷'}
              </h2>
              <p className="text-lg text-slate-600 font-medium text-center mb-auto">
                {project.mediaDetails?.style
                  ? `${project.mediaDetails.style} 스타일`
                  : '스타일 미정'}
              </p>
            </div>
          </div>
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
    budgetRange: 'medium',
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

  const filteredLorebooks = useMemo(() => {
    if (!lorebooks) return [];
    let filtered = lorebooks.filter((l: any) =>
      l.keyword.toLowerCase().includes(lorebookSearch.toLowerCase()),
    );
    if (lorebookCategoryTab !== 'all') {
      filtered = filtered.filter(
        (l: any) =>
          l.category?.toLowerCase() === lorebookCategoryTab.toLowerCase(),
      );
    }
    return filtered;
  }, [lorebooks, lorebookSearch, lorebookCategoryTab]);

  const toggleAllLorebooks = (checked: boolean) => {
    if (checked) {
      const newSelected = [...selectedLorebooks];
      filteredLorebooks.forEach((lorebook: any) => {
        if (!newSelected.some((s) => s.id === lorebook.id)) {
          newSelected.push(lorebook);
        }
      });
      setSelectedLorebooks(newSelected);
    } else {
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

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
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

        setCurrentStep(3);
      } else {
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
        setProjectTitle('');
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
      }
      return;
    }
    if (!projectTitle.trim()) {
      toast.error('프로젝트 제목을 입력해주세요.');
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
    toast.success(
      '제안서 생성 요청이 완료되었습니다. (예상 소요시간: 15~20분)',
    );
    setShowCreateConfirm(false);
  };

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
          <div className="flex-1 overflow-hidden bg-slate-50 relative">
            <ScrollArea className="h-full">
              <div className="p-6 pb-24 min-h-full">
                {/* Step 1: Selection */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-12 gap-6 h-[800px]">
                    {/* Column 1: Author */}
                    <div className="col-span-3 h-full">
                      <Card className="flex flex-col h-full border-slate-200 shadow-md hover:shadow-lg transition-all overflow-hidden bg-white">
                        <CardHeader className="py-5 px-6 border-b bg-white shrink-0">
                          <h3 className="font-bold flex items-center gap-2 text-slate-900 text-lg">
                            <Users className="w-6 h-6 text-slate-500" /> 작가
                            선택
                          </h3>
                          <div className="relative mt-4">
                            <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                            <Input
                              placeholder="작가 검색..."
                              className="pl-11 h-12 text-base bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                              value={authorSearch}
                              onChange={(e) => setAuthorSearch(e.target.value)}
                            />
                          </div>
                        </CardHeader>
                        <ScrollArea className="flex-1 bg-white">
                          <div className="p-4 space-y-3">
                            {filteredAuthors.map((author: any) => (
                              <div
                                key={author.id}
                                onClick={() => {
                                  setSelectedAuthor(author);
                                  setSelectedWork(null);
                                }}
                                className={cn(
                                  'flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all text-base border border-transparent',
                                  selectedAuthor?.id === author.id
                                    ? 'bg-slate-900 text-white shadow-lg transform scale-[1.02]'
                                    : 'hover:bg-slate-50 text-slate-700 hover:border-slate-100',
                                )}
                              >
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                                  {author.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold truncate text-base">
                                    <HighlightText
                                      text={author.name}
                                      highlight={authorSearch}
                                    />
                                  </div>
                                  <div
                                    className={cn(
                                      'text-xs truncate mt-1',
                                      selectedAuthor?.id === author.id
                                        ? 'text-slate-300'
                                        : 'text-slate-500',
                                    )}
                                  >
                                    작품 {author.workCount || 0}개 보유
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-50" />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>

                    {/* Column 2: Work */}
                    <div className="col-span-3 h-full">
                      <Card className="flex flex-col h-full border-slate-200 shadow-md hover:shadow-lg transition-all overflow-hidden bg-white">
                        <CardHeader className="py-5 px-6 border-b bg-white shrink-0">
                          <h3 className="font-bold flex items-center gap-2 text-slate-900 text-lg">
                            <BookOpen className="w-6 h-6 text-slate-500" /> 작품
                            선택
                          </h3>
                          <div className="relative mt-4">
                            <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                            <Input
                              placeholder="작품 검색..."
                              className="pl-11 h-12 text-base bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                              value={workSearch}
                              onChange={(e) => setWorkSearch(e.target.value)}
                              disabled={!selectedAuthor}
                            />
                          </div>
                        </CardHeader>
                        <ScrollArea className="flex-1 bg-white">
                          <div className="p-4 space-y-3">
                            {!selectedAuthor ? (
                              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-base">
                                <Users className="w-10 h-10 mb-3 opacity-20" />
                                작가를 먼저 선택해주세요
                              </div>
                            ) : filteredWorks.length === 0 ? (
                              <div className="p-5 text-center text-slate-400 text-base">
                                검색 결과가 없습니다.
                              </div>
                            ) : (
                              filteredWorks.map((work: any) => (
                                <div
                                  key={work.id}
                                  onClick={() => setSelectedWork(work)}
                                  className={cn(
                                    'flex gap-5 p-4 rounded-xl cursor-pointer transition-all text-base border border-transparent',
                                    selectedWork?.id === work.id
                                      ? 'bg-slate-900 text-white shadow-lg transform scale-[1.02]'
                                      : 'hover:bg-slate-50 text-slate-700 hover:border-slate-100',
                                  )}
                                >
                                  <div className="w-16 h-20 bg-slate-200 rounded-lg shrink-0 overflow-hidden shadow-sm">
                                    {work.coverImageUrl ? (
                                      <img
                                        src={work.coverImageUrl}
                                        alt={work.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                        <ImageIcon className="w-8 h-8" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="font-bold truncate text-base mb-2">
                                      <HighlightText
                                        text={work.title}
                                        highlight={workSearch}
                                      />
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        'w-fit text-xs px-2 py-0.5',
                                        selectedWork?.id === work.id
                                          ? 'bg-slate-700 text-slate-200'
                                          : 'bg-slate-100 text-slate-500',
                                      )}
                                    >
                                      {work.genre}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>

                    {/* Column 3: Lorebook List */}
                    <div className="col-span-3 h-full">
                      <Card className="flex flex-col h-full border-slate-200 shadow-md hover:shadow-lg transition-all overflow-hidden bg-white">
                        <CardHeader className="py-5 px-6 border-b bg-white shrink-0 space-y-4">
                          <h3 className="font-bold flex items-center gap-2 text-slate-900 text-lg">
                            <Wand2 className="w-6 h-6 text-slate-500" /> 설정집
                            선택
                          </h3>
                          <Tabs
                            value={lorebookCategoryTab}
                            onValueChange={setLorebookCategoryTab}
                            className="w-full"
                          >
                            <TabsList className="w-full grid grid-cols-4 bg-slate-100 h-10">
                              <TabsTrigger
                                value="all"
                                className="text-xs px-1 h-8"
                              >
                                전체
                              </TabsTrigger>
                              <TabsTrigger
                                value="인물"
                                className="text-xs px-1 h-8"
                              >
                                인물
                              </TabsTrigger>
                              <TabsTrigger
                                value="세계"
                                className="text-xs px-1 h-8"
                              >
                                세계
                              </TabsTrigger>
                              <TabsTrigger
                                value="기타"
                                className="text-xs px-1 h-8"
                              >
                                기타
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                          <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                            <Input
                              placeholder="키워드 검색..."
                              className="pl-11 h-11 text-sm bg-slate-50"
                              value={lorebookSearch}
                              onChange={(e) =>
                                setLorebookSearch(e.target.value)
                              }
                              disabled={!selectedWork}
                            />
                          </div>
                          <div className="flex items-center gap-2 px-1">
                            <Checkbox
                              id="select-all"
                              checked={
                                filteredLorebooks.length > 0 &&
                                filteredLorebooks.every((l: any) =>
                                  selectedLorebooks.some((s) => s.id === l.id),
                                )
                              }
                              onCheckedChange={(checked) =>
                                toggleAllLorebooks(!!checked)
                              }
                              disabled={
                                !selectedWork || filteredLorebooks.length === 0
                              }
                              className="w-5 h-5"
                            />
                            <Label
                              htmlFor="select-all"
                              className="text-sm text-slate-600 cursor-pointer select-none"
                            >
                              전체 선택 ({filteredLorebooks.length})
                            </Label>
                          </div>
                        </CardHeader>
                        <ScrollArea className="flex-1 bg-white">
                          <div className="p-4 space-y-3">
                            {!selectedWork ? (
                              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-base">
                                <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                                작품을 먼저 선택해주세요
                              </div>
                            ) : filteredLorebooks.length === 0 ? (
                              <div className="p-5 text-center text-slate-400 text-base">
                                설정집 데이터가 없습니다.
                              </div>
                            ) : (
                              filteredLorebooks.map((lorebook: any) => {
                                const isSelected = selectedLorebooks.some(
                                  (s) => s.id === lorebook.id,
                                );
                                return (
                                  <div
                                    key={lorebook.id}
                                    className={cn(
                                      'flex items-start gap-3 p-4 rounded-xl border transition-all hover:bg-slate-50 cursor-pointer',
                                      isSelected
                                        ? 'border-indigo-200 bg-indigo-50/50'
                                        : 'border-slate-100 bg-white',
                                    )}
                                    onClick={() => toggleLorebook(lorebook)}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      className="mt-1 w-5 h-5"
                                      onCheckedChange={() =>
                                        toggleLorebook(lorebook)
                                      }
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-base text-slate-800 truncate pr-2">
                                          <HighlightText
                                            text={lorebook.keyword}
                                            highlight={lorebookSearch}
                                          />
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-2 py-0.5 h-6 bg-white shrink-0"
                                        >
                                          {lorebook.category}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                        {lorebook.setting}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>

                    {/* Column 4: Selected Lorebooks */}
                    <div className="col-span-3 h-full">
                      <Card className="flex flex-col h-full border-indigo-100 shadow-md hover:shadow-lg transition-all bg-indigo-50/30 overflow-hidden">
                        <CardHeader className="py-5 px-6 border-b border-indigo-100 bg-indigo-50/50 shrink-0">
                          <h3 className="font-bold flex items-center gap-2 text-indigo-900 text-lg">
                            <Check className="w-6 h-6 text-indigo-600" /> 선택된
                            설정집
                            <Badge className="bg-indigo-600 hover:bg-indigo-700 ml-auto text-sm px-2.5 h-6">
                              {selectedLorebooks.length}
                            </Badge>
                          </h3>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                          <div className="p-4 space-y-3">
                            {selectedLorebooks.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-40 text-indigo-300 text-base">
                                <Sparkles className="w-10 h-10 mb-3 opacity-50" />
                                선택된 항목이 없습니다
                              </div>
                            ) : (
                              selectedLorebooks.map((item, idx) => (
                                <div
                                  key={`${item.id}-${idx}`}
                                  className="bg-white p-5 rounded-xl border border-indigo-100 shadow-md group relative hover:shadow-lg transition-all"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg text-indigo-950 truncate">
                                      {item.keyword}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLorebook(item);
                                      }}
                                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                    >
                                      <X className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="truncate max-w-[100px]">
                                      {item.authorName}
                                    </span>
                                    <span className="w-0.5 h-3 bg-slate-300" />
                                    <span className="truncate max-w-[120px]">
                                      {item.workTitle}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Step 2: Conflict Check */}
                {currentStep === 2 && (
                  <div className="max-w-6xl mx-auto space-y-10">
                    <Card className="border-slate-200 shadow-lg overflow-hidden bg-white">
                      <CardHeader className="border-b bg-slate-50/50 py-6 px-10">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3 text-slate-800 text-xl">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                            <span className="font-bold">AI 분석 결과</span>
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-sm"
                            >
                              3건의 충돌 감지
                            </Badge>
                          </CardTitle>
                          <span className="text-sm font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded">
                            Analysis ID: #EXP-2024-001
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                          {[
                            {
                              type: 'Lore Conflict',
                              severity: 'high',
                              title: '설정 충돌 감지: 마법 체계',
                              desc: "선택한 설정집 '고대 마법'과 '현대 마법학' 간의 마나 운영 방식이 상충됩니다.",
                            },
                            {
                              type: 'Character',
                              severity: 'medium',
                              title: '캐릭터 성격 불일치 가능성',
                              desc: "주인공의 성격 키워드 '냉철함'이 개그 장르 확장에 부적합할 수 있습니다.",
                            },
                            {
                              type: 'Timeline',
                              severity: 'low',
                              title: '타임라인 정합성 확인 필요',
                              desc: '프리퀄 제작 시 원작 3권의 회상 장면과 충돌할 가능성이 있습니다.',
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="p-10 flex gap-8 hover:bg-slate-50 transition-colors"
                            >
                              <div
                                className={cn(
                                  'w-16 h-16 rounded-full flex items-center justify-center shrink-0',
                                  item.severity === 'high'
                                    ? 'bg-red-100 text-red-600'
                                    : item.severity === 'medium'
                                      ? 'bg-amber-100 text-amber-600'
                                      : 'bg-blue-100 text-blue-600',
                                )}
                              >
                                <AlertCircle className="w-8 h-8" />
                              </div>
                              <div>
                                <div className="flex items-center gap-4 mb-3">
                                  <h4 className="font-bold text-slate-900 text-xl">
                                    {item.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="text-sm px-2.5 py-0.5"
                                  >
                                    {item.type}
                                  </Badge>
                                </div>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="bg-slate-100 p-10 rounded-xl border border-slate-200 flex items-start gap-6">
                      <Checkbox
                        id="conflict-confirm"
                        checked={conflictConfirmed}
                        onCheckedChange={(c) => setConflictConfirmed(!!c)}
                        className="mt-1 w-7 h-7 border-slate-400 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                      />
                      <div className="space-y-3">
                        <Label
                          htmlFor="conflict-confirm"
                          className="font-bold text-slate-900 text-xl cursor-pointer"
                        >
                          위 충돌 내용을 확인하였으며, 이에 대한 수정 제안을
                          받아들이겠습니다.
                        </Label>
                        <p className="text-lg text-slate-500">
                          AI가 제안하는 수정 방향을 기반으로 기획서를
                          작성합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Format & Genre */}
                {currentStep === 3 && (
                  <div className="max-w-5xl mx-auto space-y-10">
                    <section>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                        <Target className="w-6 h-6 text-slate-500" /> 확장 포맷
                        선택
                      </h3>
                      <div className="grid grid-cols-3 gap-8">
                        {formats.map((format) => (
                          <Card
                            key={format.id}
                            className={cn(
                              'cursor-pointer transition-all hover:shadow-lg border-2 relative overflow-hidden group h-[220px]',
                              selectedFormat === format.id
                                ? 'border-indigo-600 bg-indigo-50/30'
                                : 'border-transparent hover:border-slate-200 bg-white shadow-sm',
                            )}
                            onClick={() => setSelectedFormat(format.id)}
                          >
                            <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center z-10 relative">
                              <div
                                className={cn(
                                  'w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 shadow-sm',
                                  selectedFormat === format.id
                                    ? 'bg-indigo-600 text-white shadow-indigo-200'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600',
                                )}
                              >
                                <format.icon className="w-8 h-8" />
                              </div>
                              <h4
                                className={cn(
                                  'font-bold text-xl mb-2',
                                  selectedFormat === format.id
                                    ? 'text-indigo-900'
                                    : 'text-slate-900',
                                )}
                              >
                                {format.title}
                              </h4>
                              <p className="text-base text-slate-500 font-medium">
                                {format.desc}
                              </p>
                            </CardContent>
                            {selectedFormat === format.id && (
                              <div className="absolute top-4 right-4 text-indigo-600">
                                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5" />
                                </div>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </section>

                    <div className="grid grid-cols-2 gap-10">
                      <section>
                        <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-900">
                          <Palette className="w-6 h-6 text-slate-500" /> 장르
                          전략
                        </h3>
                        <RadioGroup
                          value={genreStrategy}
                          onValueChange={(v: any) => setGenreStrategy(v)}
                          className="grid grid-cols-1 gap-6"
                        >
                          <div
                            className={cn(
                              'flex items-start space-x-5 p-6 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50',
                              genreStrategy === 'original'
                                ? 'border-indigo-600 bg-indigo-50/10'
                                : 'border-slate-100 bg-white',
                            )}
                            onClick={() => setGenreStrategy('original')}
                          >
                            <RadioGroupItem
                              value="original"
                              id="g-original"
                              className="mt-1"
                            />
                            <div className="space-y-2">
                              <Label
                                htmlFor="g-original"
                                className="font-bold text-lg cursor-pointer"
                              >
                                원작 장르 유지
                              </Label>
                              <p className="text-base text-slate-500 leading-relaxed">
                                원작의 고유한 분위기와 장르적 특성을 그대로
                                유지하여 기존 팬덤을 공략합니다.
                              </p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              'flex items-start space-x-5 p-6 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50',
                              genreStrategy === 'varied'
                                ? 'border-indigo-600 bg-indigo-50/10'
                                : 'border-slate-100 bg-white',
                            )}
                            onClick={() => setGenreStrategy('varied')}
                          >
                            <RadioGroupItem
                              value="varied"
                              id="g-varied"
                              className="mt-1"
                            />
                            <div className="space-y-2">
                              <Label
                                htmlFor="g-varied"
                                className="font-bold text-lg cursor-pointer"
                              >
                                장르 변주 (Mix & Match)
                              </Label>
                              <p className="text-base text-slate-500 leading-relaxed">
                                새로운 장르적 요소를 결합하여 대중성을
                                확대하거나 새로운 재미를 창출합니다.
                              </p>
                              {genreStrategy === 'varied' && (
                                <div className="mt-4">
                                  <Input
                                    placeholder="예: 로맨스 스릴러, 학원물 등"
                                    value={targetGenre}
                                    onChange={(e) =>
                                      setTargetGenre(e.target.value)
                                    }
                                    className="bg-white h-11 text-base"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </RadioGroup>
                      </section>

                      <section>
                        <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-900">
                          <Monitor className="w-6 h-6 text-slate-500" /> 세계관
                          설정
                        </h3>
                        <RadioGroup
                          value={universeSetting}
                          onValueChange={(v: any) => setUniverseSetting(v)}
                          className="grid grid-cols-1 gap-6"
                        >
                          <div
                            className={cn(
                              'flex items-start space-x-5 p-6 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50',
                              universeSetting === 'shared'
                                ? 'border-indigo-600 bg-indigo-50/10'
                                : 'border-slate-100 bg-white',
                            )}
                            onClick={() => setUniverseSetting('shared')}
                          >
                            <RadioGroupItem
                              value="shared"
                              id="u-shared"
                              className="mt-1"
                            />
                            <div className="space-y-2">
                              <Label
                                htmlFor="u-shared"
                                className="font-bold text-lg cursor-pointer"
                              >
                                공유 세계관 (Shared Universe)
                              </Label>
                              <p className="text-base text-slate-500 leading-relaxed">
                                원작과 동일한 시공간을 배경으로 하여 사건이나
                                인물이 연결됩니다.
                              </p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              'flex items-start space-x-5 p-6 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50',
                              universeSetting === 'parallel'
                                ? 'border-indigo-600 bg-indigo-50/10'
                                : 'border-slate-100 bg-white',
                            )}
                            onClick={() => setUniverseSetting('parallel')}
                          >
                            <RadioGroupItem
                              value="parallel"
                              id="u-parallel"
                              className="mt-1"
                            />
                            <div className="space-y-2">
                              <Label
                                htmlFor="u-parallel"
                                className="font-bold text-lg cursor-pointer"
                              >
                                평행 세계 (Parallel Universe)
                              </Label>
                              <p className="text-base text-slate-500 leading-relaxed">
                                설정은 공유하되, 독립적인 사건 전개나 다른
                                결말을 가집니다.
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </section>
                    </div>

                    <div className="flex justify-end pt-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="step3-confirm"
                          checked={step3Confirmed}
                          onCheckedChange={(c) => setStep3Confirmed(!!c)}
                        />
                        <Label
                          htmlFor="step3-confirm"
                          className="text-sm font-medium cursor-pointer"
                        >
                          확장 전략 설정을 완료했습니다.
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Business */}
                {currentStep === 4 && (
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm space-y-10">
                      <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                          <Users className="w-6 h-6 text-slate-500" /> 타겟
                          오디언스
                        </h3>
                        <div className="grid grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <Label className="text-slate-700 text-base font-bold">
                              연령대
                            </Label>
                            <div className="flex flex-wrap gap-3">
                              {['10대', '20대', '30대', '40대+'].map((age) => (
                                <Badge
                                  key={age}
                                  variant="outline"
                                  className={cn(
                                    'cursor-pointer px-4 py-2 text-base hover:bg-slate-100',
                                    business.targetAge.includes(age)
                                      ? 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
                                      : 'text-slate-500 border-slate-200',
                                  )}
                                  onClick={() => {
                                    const newAges = business.targetAge.includes(
                                      age,
                                    )
                                      ? business.targetAge.filter(
                                          (a) => a !== age,
                                        )
                                      : [...business.targetAge, age];
                                    setBusiness({
                                      ...business,
                                      targetAge: newAges,
                                    });
                                  }}
                                >
                                  {age}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <Label className="text-slate-700 text-base font-bold">
                              성별
                            </Label>
                            <Select
                              value={business.targetGender}
                              onValueChange={(v) =>
                                setBusiness({ ...business, targetGender: v })
                              }
                            >
                              <SelectTrigger className="h-11 text-base">
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all" className="text-base">
                                  전체
                                </SelectItem>
                                <SelectItem value="male" className="text-base">
                                  남성
                                </SelectItem>
                                <SelectItem
                                  value="female"
                                  className="text-base"
                                >
                                  여성
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                          <Target className="w-6 h-6 text-slate-500" /> 예산
                          규모
                        </h3>
                        <RadioGroup
                          value={business.budgetRange}
                          onValueChange={(v) =>
                            setBusiness({ ...business, budgetRange: v })
                          }
                          className="grid grid-cols-3 gap-6"
                        >
                          {[
                            { id: 'low', label: '저예산 (Low)' },
                            { id: 'medium', label: '중형 (Medium)' },
                            { id: 'high', label: '블록버스터 (High)' },
                          ].map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                'flex items-center space-x-3 p-5 rounded-lg border transition-all cursor-pointer hover:bg-slate-50',
                                business.budgetRange === item.id
                                  ? 'border-indigo-600 bg-indigo-50/10'
                                  : 'border-slate-200',
                              )}
                              onClick={() =>
                                setBusiness({
                                  ...business,
                                  budgetRange: item.id,
                                })
                              }
                            >
                              <RadioGroupItem
                                value={item.id}
                                id={`b-${item.id}`}
                                className="w-5 h-5"
                              />
                              <Label
                                htmlFor={`b-${item.id}`}
                                className="cursor-pointer font-bold text-base"
                              >
                                {item.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                          <MessageSquare className="w-6 h-6 text-slate-500" />{' '}
                          톤앤매너
                        </h3>
                        <Textarea
                          placeholder="작품의 전반적인 분위기나 마케팅 소구점을 입력하세요."
                          className="h-32 resize-none bg-slate-50 border-slate-200 text-base p-4"
                          value={business.toneManner}
                          onChange={(e) =>
                            setBusiness({
                              ...business,
                              toneManner: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        <div>
                          <div className="text-[10px] text-slate-500 mb-1">Age</div>
                          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: "45%" }} />
                            <div className="h-full bg-green-500" style={{ width: "40%" }} />
                            <div className="h-full bg-slate-400" style={{ width: "15%" }} />
                          </div>
                          <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                            <span>20대 45%</span>
                            <span>30대 40%</span>
                            <span>기타 15%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 mb-1">Gender</div>
                          {(() => {
                            const maleRatio =
                              createdProject?.targetGender === "male"
                                ? 70
                                : createdProject?.targetGender === "female"
                                ? 30
                                : 50;
                            const femaleRatio = 100 - maleRatio;
                            return (
                              <>
                                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${maleRatio}%` }}
                                  />
                                  <div
                                    className="h-full bg-pink-500"
                                    style={{ width: `${femaleRatio}%` }}
                                  />
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                  <span>남성 {maleRatio}%</span>
                                  <span>여성 {femaleRatio}%</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="step4-confirm"
                          checked={step4Confirmed}
                          onCheckedChange={(c) => setStep4Confirmed(!!c)}
                        />
                        <Label
                          htmlFor="step4-confirm"
                          className="text-sm font-medium cursor-pointer"
                        >
                          사업 전략 설정을 완료했습니다.
                        </Label>
                      </div>
                      {(() => {
                        const budgetValue = createdProject?.budget
                          ? Number(createdProject.budget)
                          : undefined;
                        const scale =
                          budgetValue == null
                            ? "mid"
                            : budgetValue < 50_000_000
                            ? "low"
                            : budgetValue < 200_000_000
                            ? "mid"
                            : "high";
                        const base =
                          "flex items-center gap-2 mt-3 text-[10px] text-slate-600";
                        return (
                          <div className={base}>
                            <div
                              className={`px-2 py-1 rounded-md border ${
                                scale === "low"
                                  ? "bg-blue-50 border-blue-200 text-blue-700"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              Low
                            </div>
                            <div
                              className={`px-2 py-1 rounded-md border ${
                                scale === "mid"
                                  ? "bg-blue-50 border-blue-200 text-blue-700"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              Mid
                            </div>
                            <div
                              className={`px-2 py-1 rounded-md border ${
                                scale === "high"
                                  ? "bg-blue-50 border-blue-200 text-blue-700"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              High
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Step 5: Media Details */}
                {currentStep === 5 && (
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm space-y-10">
                      <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                          <Settings2 className="w-6 h-6 text-slate-500" />{' '}
                          매체별 상세 설정
                        </h3>
                        <div className="grid grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <Label className="font-bold text-slate-700 text-base">
                              AI 비주얼 스타일
                            </Label>
                            <Select
                              value={mediaDetails.style || 'default'}
                              onValueChange={(v) =>
                                setMediaDetails({ ...mediaDetails, style: v })
                              }
                            >
                              <SelectTrigger className="h-11 text-base">
                                <SelectValue placeholder="스타일 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="default"
                                  className="text-base"
                                >
                                  기본 (Default)
                                </SelectItem>
                                <SelectItem
                                  value="realistic"
                                  className="text-base"
                                >
                                  실사풍 (Realistic)
                                </SelectItem>
                                <SelectItem value="anime" className="text-base">
                                  애니메이션 (Anime)
                                </SelectItem>
                                <SelectItem value="noir" className="text-base">
                                  누아르 (Noir)
                                </SelectItem>
                                <SelectItem value="oil" className="text-base">
                                  유화 (Oil Painting)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-slate-500">
                              제안서에 포함될 컨셉 아트의 화풍을 결정합니다.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <Label className="font-bold text-slate-700 text-base">
                              플랫폼/채널
                            </Label>
                            <Input
                              placeholder="예: 넷플릭스, 네이버웹툰, 스팀"
                              value={mediaDetails.platform || ''}
                              onChange={(e) =>
                                setMediaDetails({
                                  ...mediaDetails,
                                  platform: e.target.value,
                                })
                              }
                              className="h-11 text-base"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                          <Sparkles className="w-6 h-6 text-indigo-500" /> 추가
                          프롬프트
                        </h3>
                        <Textarea
                          placeholder="AI가 제안서를 생성할 때 참고할 추가적인 지시사항을 자유롭게 입력하세요."
                          className="h-40 resize-none bg-slate-50 border-slate-200 text-base p-4"
                          value={mediaPrompt}
                          onChange={(e) => setMediaPrompt(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="step5-confirm"
                          checked={step5Confirmed}
                          onCheckedChange={(c) => setStep5Confirmed(!!c)}
                        />
                        <Label
                          htmlFor="step5-confirm"
                          className="text-sm font-medium cursor-pointer"
                        >
                          매체 상세 설정을 완료했습니다.
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Review */}
                {currentStep === 6 && (
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-lg space-y-10">
                      <div className="text-center pb-8 border-b border-slate-100">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 mb-6 shadow-sm">
                          <Check className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                          프로젝트 생성 준비 완료
                        </h2>
                        <p className="text-lg text-slate-500">
                          입력하신 정보를 바탕으로 AI가 기획 제안서를
                          생성합니다.
                        </p>
                      </div>

                      <div className="space-y-5">
                        <Label className="font-bold text-xl text-slate-900">
                          프로젝트 제목
                        </Label>
                        <Input
                          placeholder="프로젝트 제목을 입력하세요"
                          className="h-14 text-xl font-medium px-5 border-slate-300 focus-visible:ring-indigo-500"
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-base text-slate-600 bg-slate-50 p-8 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">
                            원작
                          </span>
                          <span className="font-bold text-slate-900 text-lg">
                            {selectedWork?.title || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">
                            작가
                          </span>
                          <span className="font-bold text-slate-900 text-lg">
                            {selectedAuthor?.name || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">
                            확장 포맷
                          </span>
                          <span className="font-bold text-slate-900 text-lg capitalize">
                            {selectedFormat || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">
                            참조 설정집
                          </span>
                          <span className="font-bold text-slate-900 text-lg">
                            {selectedLorebooks.length}개
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t flex justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6"
              >
                이전
              </Button>
              {currentStep < 6 ? (
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="bg-slate-900 text-white hover:bg-slate-800 px-8"
                >
                  다음 <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="confirm-create"
                      ref={confirmCheckboxRef}
                      checked={step6Confirmed}
                      onCheckedChange={(c) => setStep6Confirmed(!!c)}
                    />
                    <Label
                      htmlFor="confirm-create"
                      className="text-sm font-medium cursor-pointer"
                    >
                      위 내용으로 제안서를 생성하는 것에 동의합니다.
                    </Label>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    제안서 생성
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
