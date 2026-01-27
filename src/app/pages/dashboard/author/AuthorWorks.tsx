import { useState, useEffect, useContext, useRef } from 'react';
import { AuthorBreadcrumbContext } from './AuthorBreadcrumbContext';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../../../components/ui/resizable';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Save,
  Sidebar,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelLeftClose,
  PanelRightOpen,
  PanelLeftOpen,
  BookOpen,
  Send,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';
import { AuthorWorkExplorer } from './AuthorWorkExplorer';
import { AuthorLorebookPanel } from './AuthorLorebookPanel';
import {
  EpisodeDto,
  WorkResponseDto,
  WorkCreateRequestDto,
  WorkUpdateRequestDto,
} from '../../../types/author';
import { cn } from '../../../components/ui/utils';
import { toast } from 'sonner';

interface AuthorWorksProps {
  integrationId: string;
}

export function AuthorWorks({ integrationId }: AuthorWorksProps) {
  const queryClient = useQueryClient();
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeDto | null>(
    null,
  );

  const { setBreadcrumbs, onNavigate } = useContext(AuthorBreadcrumbContext);

  // Panel States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); // Default closed

  // Editor State
  const [editorContent, setEditorContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Modals State
  const [isCreateWorkOpen, setIsCreateWorkOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [metadataWork, setMetadataWork] = useState<WorkResponseDto | null>(
    null,
  );
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [isPublishPasswordOpen, setIsPublishPasswordOpen] = useState(false);
  const [publishPassword, setPublishPassword] = useState('');
  const [isKeywordSelectionOpen, setIsKeywordSelectionOpen] = useState(false);

  // New States
  const [keywordSelection, setKeywordSelection] = useState({
    characters: '',
    places: '',
    items: '',
    groups: '',
    worldviews: '',
    plots: '',
  });
  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);
  const [reviewEpisode, setReviewEpisode] = useState<EpisodeDto | null>(null);
  const [reviewConfirmText, setReviewConfirmText] = useState('');

  const [editMetadataTitle, setEditMetadataTitle] = useState('');
  const [editMetadataSynopsis, setEditMetadataSynopsis] = useState('');
  const [editMetadataGenre, setEditMetadataGenre] = useState('');

  // Fetch Works
  const { data: works } = useQuery({
    queryKey: ['author', 'works'],
    queryFn: () => authorService.getWorks(integrationId),
  });

  // Fetch Episode Content
  const { data: episodeDetail, isLoading: isEpisodeLoading } = useQuery({
    queryKey: ['author', 'episode', selectedWorkId, selectedEpisode?.id],
    queryFn: () =>
      selectedWorkId && selectedEpisode
        ? authorService.getEpisodeDetail(
            selectedWorkId.toString(),
            selectedEpisode.id.toString(),
          )
        : null,
    enabled: !!selectedWorkId && !!selectedEpisode,
  });

  // Sync content when episode detail loads
  useEffect(() => {
    if (episodeDetail) {
      setEditorContent(episodeDetail.content);
      setIsDirty(false);
    }
  }, [episodeDetail]);

  // Update Breadcrumbs
  useEffect(() => {
    const breadcrumbs: { label: string; onClick?: () => void }[] = [
      { label: '홈', onClick: () => onNavigate('home') },
      {
        label: '작품 관리',
        onClick: () => {
          setSelectedWorkId(null);
          setSelectedEpisode(null);
        },
      },
    ];

    if (selectedWorkId && works) {
      const work = works.find((w) => w.id === selectedWorkId);
      if (work) {
        breadcrumbs.push({
          label: work.title,
          onClick: () => {
            setSelectedEpisode(null);
          },
        });
      }
    }

    if (selectedEpisode) {
      breadcrumbs.push({
        label: selectedEpisode.title,
      });
    }

    setBreadcrumbs(breadcrumbs);
  }, [selectedWorkId, selectedEpisode, works, setBreadcrumbs, onNavigate]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedWorkId || !selectedEpisode) return;
      await authorService.updateEpisode(
        selectedWorkId.toString(),
        selectedEpisode.id.toString(),
        editorContent,
      );
    },
    onSuccess: () => {
      toast.success('저장되었습니다.');
      setIsDirty(false);
      queryClient.invalidateQueries({
        queryKey: ['author', 'episode', selectedWorkId, selectedEpisode?.id],
      });
    },
  });

  // Create Work Mutation
  const createWorkMutation = useMutation({
    mutationFn: async (data: WorkCreateRequestDto) => {
      await authorService.createWork(data);
    },
    onSuccess: () => {
      toast.success('작품이 생성되었습니다.');
      setIsCreateWorkOpen(false);
      setNewWorkTitle('');
      queryClient.invalidateQueries({ queryKey: ['author', 'works'] });
    },
  });

  // Ctrl+S Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (selectedEpisode && isDirty && !saveMutation.isPending) {
          if (selectedEpisode.isReadOnly) {
            toast.error('읽기 전용 에피소드는 저장할 수 없습니다.');
            return;
          }
          saveMutation.mutate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEpisode, isDirty, saveMutation]);

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedEpisode?.isReadOnly) return;
    setEditorContent(e.target.value);
    setIsDirty(true);
  };

  const handleSelectWork = (workId: number) => {
    setSelectedWorkId(workId);
    if (selectedWorkId !== workId) {
      setSelectedEpisode(null);
      setEditorContent('');
    }
  };

  const handleSelectEpisode = (workId: number, episode: EpisodeDto) => {
    if (isDirty) {
      if (!confirm('작성 중인 내용이 저장되지 않았습니다. 이동하시겠습니까?')) {
        return;
      }
    }
    setSelectedWorkId(workId);
    setSelectedEpisode(episode);
    // Removed auto-open right sidebar
  };

  const handleOpenMetadata = (work: WorkResponseDto) => {
    setMetadataWork(work);
    setIsMetadataOpen(true);
  };

  const handleOpenLorebook = (work: WorkResponseDto) => {
    setSelectedWorkId(work.id);
    setIsRightSidebarOpen(true);
  };

  const handleCreateWork = () => {
    if (!newWorkTitle.trim()) {
      toast.error('작품 제목을 입력해주세요.');
      return;
    }
    createWorkMutation.mutate({
      title: newWorkTitle,
      description: '',
      integrationId,
    });
  };

  const handlePublishClick = () => {
    if (!selectedEpisode) return;
    setIsPublishPasswordOpen(true);
  };

  const handlePasswordSubmit = () => {
    // Mock password check
    if (publishPassword === '1234') {
      // Mock password
      setIsPublishPasswordOpen(false);
      setPublishPassword('');

      if (selectedEpisode?.isAnalyzed) {
        toast.info('기존 분석 데이터를 바탕으로 설정집을 업데이트합니다.');
        handleKeywordSubmit();
      } else {
        setIsKeywordSelectionOpen(true);
      }
    } else {
      toast.error('비밀번호가 일치하지 않습니다. (테스트: 1234)');
    }
  };

  const handleOpenReview = (workId: number, episode: EpisodeDto) => {
    setReviewEpisode(episode);
    setIsFinalReviewOpen(true);
  };

  const handleFinalPublish = () => {
    if (reviewConfirmText !== '연재합니다') {
      toast.error("'연재합니다'를 정확히 입력해주세요.");
      return;
    }

    // Call publish API
    if (selectedWorkId && reviewEpisode) {
      authorService
        .publishEpisode(selectedWorkId.toString(), reviewEpisode.id.toString())
        .then(() => {
          toast.success('성공적으로 연재되었습니다.');
          setIsFinalReviewOpen(false);
          setReviewConfirmText('');
          setReviewEpisode(null);
          queryClient.invalidateQueries({
            queryKey: ['author', 'work', selectedWorkId, 'episodes'],
          });
        })
        .catch(() => {
          toast.error('연재 처리에 실패했습니다.');
        });
    }
  };

  const handleKeywordSubmit = () => {
    // Mock AI generation call
    toast.success('설정집 생성이 요청되었습니다. 잠시 후 알림을 확인해주세요.');
    setIsKeywordSelectionOpen(false);

    // Simulate AI completion after 2 seconds for demo purposes
    setTimeout(() => {
      toast.info('AI 설정집 생성이 완료되었습니다. 최종 확인을 진행해주세요.');
      // In a real app, this would be a server push or polling.
      // Here we optimistically update the cache to show the alert icon.
      if (selectedWorkId && selectedEpisode) {
        queryClient.setQueryData(
          ['author', 'work', selectedWorkId, 'episodes'],
          (oldData: EpisodeDto[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map((ep) =>
              ep.id === selectedEpisode.id
                ? { ...ep, isReviewPending: true }
                : ep,
            );
          },
        );
      }
    }, 2000);
  };

  // Update Work Mutation
  const updateWorkMutation = useMutation({
    mutationFn: async (data: WorkUpdateRequestDto) => {
      if (!metadataWork) return;
      await authorService.updateWork(metadataWork.id.toString(), data);
    },
    onSuccess: () => {
      toast.success('작품 정보가 수정되었습니다.');
      setIsMetadataOpen(false);
      queryClient.invalidateQueries({ queryKey: ['author', 'works'] });
    },
  });

  const handleUpdateMetadata = () => {
    if (!metadataWork) return;
    updateWorkMutation.mutate({
      title: editMetadataTitle,
      synopsis: editMetadataSynopsis,
      genre: editMetadataGenre,
      id: 0,
      description: '',
      status: 'ONGOING',
    });
  };

  return (
    <div className="h-[calc(100vh-6rem)] -m-4 bg-background overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Sidebar: Work Explorer */}
        {isLeftSidebarOpen && (
          <>
            <ResizablePanel defaultSize={20} minSize={15}>
              <AuthorWorkExplorer
                works={works || []}
                selectedWorkId={selectedWorkId}
                selectedEpisodeId={selectedEpisode?.id || null}
                onSelectWork={handleSelectWork}
                onSelectEpisode={handleSelectEpisode}
                onOpenMetadata={handleOpenMetadata}
                onOpenLorebook={handleOpenLorebook}
                onCreateWork={() => setIsCreateWorkOpen(true)}
                onReviewRequired={handleOpenReview}
                className="h-full"
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* Center: Editor */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* Editor Toolbar */}
            <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                  title={
                    isLeftSidebarOpen ? '사이드바 접기' : '사이드바 펼치기'
                  }
                >
                  {isLeftSidebarOpen ? (
                    <ChevronsLeft className="w-4 h-4" />
                  ) : (
                    <ChevronsRight className="w-4 h-4" />
                  )}
                </Button>

                {selectedEpisode ? (
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {works?.find((w) => w.id === selectedWorkId)?.title}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span>{selectedEpisode.title}</span>
                    {selectedEpisode.isReadOnly && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                        읽기 전용
                      </span>
                    )}
                    {isDirty && (
                      <span className="text-xs text-orange-500 font-normal">
                        (수정됨)
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    작품과 회차를 선택해주세요
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Save & Publish Buttons */}
                {selectedEpisode && !selectedEpisode.isReadOnly && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveMutation.mutate()}
                      disabled={!isDirty || saveMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => toast.info('연재 기능 준비 중입니다.')} // Placeholder for now
                    >
                      <Send className="w-4 h-4 mr-2" />
                      연재
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  disabled={!selectedWorkId} // Enable if work is selected
                  title={isRightSidebarOpen ? '설정집 접기' : '설정집 펼치기'}
                >
                  {isRightSidebarOpen ? (
                    <ChevronsRight className="w-4 h-4" />
                  ) : (
                    <ChevronsLeft className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 relative bg-background overflow-y-auto">
              {selectedEpisode ? (
                isEpisodeLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    데이터를 불러오는 중입니다...
                  </div>
                ) : (
                  <Textarea
                    value={editorContent}
                    onChange={handleEditorChange}
                    readOnly={selectedEpisode.isReadOnly}
                    className={cn(
                      'w-full h-full resize-none border-none focus-visible:ring-0 p-8 text-lg leading-relaxed font-serif overflow-y-auto',
                      selectedEpisode.isReadOnly &&
                        'bg-secondary/10 cursor-default',
                    )}
                    placeholder="여기에 내용을 작성하세요..."
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4">
                  <BookOpen className="w-12 h-12 opacity-20" />
                  <p>왼쪽 목록에서 작품과 회차를 선택하여 집필을 시작하세요.</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        {/* Right Sidebar: Lorebook */}
        {isRightSidebarOpen && selectedWorkId && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20}>
              <AuthorLorebookPanel workId={selectedWorkId} className="h-full" />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Create Work Modal */}
      <Dialog open={isCreateWorkOpen} onOpenChange={setIsCreateWorkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 작품 생성</DialogTitle>
            <DialogDescription>
              새로운 작품의 제목을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>작품 제목</Label>
              <Input
                value={newWorkTitle}
                onChange={(e) => setNewWorkTitle(e.target.value)}
                placeholder="나의 멋진 소설"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateWorkOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleCreateWork}
              disabled={createWorkMutation.isPending}
            >
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Password Modal */}
      <Dialog
        open={isPublishPasswordOpen}
        onOpenChange={setIsPublishPasswordOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>연재를 위한 보안 확인</DialogTitle>
            <DialogDescription>
              연재를 진행하려면 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={publishPassword}
              onChange={(e) => setPublishPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPublishPasswordOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handlePasswordSubmit}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyword Selection Modal */}
      <Dialog
        open={isKeywordSelectionOpen}
        onOpenChange={setIsKeywordSelectionOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>설정집 생성을 위한 키워드 선택</DialogTitle>
            <DialogDescription>
              AI가 설정집을 생성하기 위해 각 카테고리별 핵심 키워드를
              입력해주세요. (30초 이내 권장)
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>인물 (Characters)</Label>
              <Input
                value={keywordSelection.characters}
                onChange={(e) =>
                  setKeywordSelection({
                    ...keywordSelection,
                    characters: e.target.value,
                  })
                }
                placeholder="예: 주인공, 조력자 이름"
              />
            </div>
            <div className="space-y-2">
              <Label>장소 (Places)</Label>
              <Input
                value={keywordSelection.places}
                onChange={(e) =>
                  setKeywordSelection({
                    ...keywordSelection,
                    places: e.target.value,
                  })
                }
                placeholder="예: 주요 배경, 도시 이름"
              />
            </div>
            <div className="space-y-2">
              <Label>물건 (Items)</Label>
              <Input
                value={keywordSelection.items}
                onChange={(e) =>
                  setKeywordSelection({
                    ...keywordSelection,
                    items: e.target.value,
                  })
                }
                placeholder="예: 중요 아이템"
              />
            </div>
            <div className="space-y-2">
              <Label>집단 (Groups)</Label>
              <Input
                value={keywordSelection.groups}
                onChange={(e) =>
                  setKeywordSelection({
                    ...keywordSelection,
                    groups: e.target.value,
                  })
                }
                placeholder="예: 조직, 길드"
              />
            </div>
            <div className="space-y-2">
              <Label>세계 (Worldviews)</Label>
              <Input
                value={keywordSelection.worldviews}
                onChange={(e) =>
                  setKeywordSelection({
                    ...keywordSelection,
                    worldviews: e.target.value,
                  })
                }
                placeholder="예: 마법 시스템, 역사"
              />
            </div>
            <div className="space-y-2">
              <Label>사건 (Plots)</Label>
              <Input
                value={keywordSelection.plots}
                onChange={(e) =>
                  setKeywordSelection({
                    ...keywordSelection,
                    plots: e.target.value,
                  })
                }
                placeholder="예: 주요 갈등, 사건"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsKeywordSelectionOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleKeywordSubmit}>설정집 자동 생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Metadata Modal */}
      <Dialog open={isMetadataOpen} onOpenChange={setIsMetadataOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>작품 메타데이터 수정</DialogTitle>
          </DialogHeader>
          {metadataWork && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>제목</Label>
                <Input
                  value={editMetadataTitle}
                  onChange={(e) => setEditMetadataTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>시놉시스</Label>
                <Textarea
                  value={editMetadataSynopsis}
                  onChange={(e) => setEditMetadataSynopsis(e.target.value)}
                  placeholder="시놉시스를 입력하세요."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>장르</Label>
                <Input
                  value={editMetadataGenre}
                  onChange={(e) => setEditMetadataGenre(e.target.value)}
                  placeholder="장르를 입력하세요 (예: 판타지, 로맨스)"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMetadataOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleUpdateMetadata}
              disabled={updateWorkMutation.isPending}
            >
              수정 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Review Modal */}
      <Dialog open={isFinalReviewOpen} onOpenChange={setIsFinalReviewOpen}>
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>설정집 변경 사항 확인 (최종 검수)</DialogTitle>
            <DialogDescription>
              AI가 생성한 설정집 변경 사항을 확인하세요. 왼쪽은 이전 버전,
              오른쪽은 업데이트된 버전입니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex gap-4 py-4">
            {/* Left Column: Before */}
            <div className="flex-1 border rounded-md p-4 flex flex-col bg-muted/20">
              <h4 className="font-semibold mb-4 text-center">이전 설정집</h4>
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground h-full min-h-[200px]">
                    <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                    <p>기존 설정집 데이터가 없습니다.</p>
                    <p className="text-sm">(첫 연재 시에는 비어있습니다)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Icon */}
            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>

            {/* Right Column: After */}
            <div className="flex-1 border rounded-md p-4 flex flex-col bg-muted/20">
              <h4 className="font-semibold mb-4 text-center">
                업데이트된 설정집
              </h4>
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {/* Mock Changed Item */}
                  <div className="border border-orange-500 bg-orange-500/5 rounded-lg p-4 relative">
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                        변경됨
                      </span>
                    </div>
                    <h5 className="font-bold mb-2">주인공 (강민우)</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      인물 / 주요 인물
                    </p>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-semibold">특징:</span> 정의로움,
                        불의를 참지 못함,{' '}
                        <span className="text-orange-600 font-bold bg-orange-100 px-1 rounded">
                          새로운 능력 각성
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">상태:</span>{' '}
                        <span className="text-orange-600 font-bold bg-orange-100 px-1 rounded">
                          부상 회복 중
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Mock New Item */}
                  <div className="border border-green-500 bg-green-500/5 rounded-lg p-4 relative">
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                        신규
                      </span>
                    </div>
                    <h5 className="font-bold mb-2">마력의 수정</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      물건 / 아이템
                    </p>
                    <div className="text-sm">
                      <p>
                        동굴 깊은 곳에서 발견된 푸른 빛을 내는 수정. 강력한
                        마력을 품고 있다.
                      </p>
                    </div>
                  </div>

                  {/* Mock Unchanged Item */}
                  <div className="border bg-card rounded-lg p-4 opacity-70">
                    <h5 className="font-bold mb-2">오래된 검</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      물건 / 무기
                    </p>
                    <div className="text-sm">
                      <p>녹이 슬었지만 여전히 날카로운 검.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-4 bg-yellow-500/10 p-4 rounded-md border border-yellow-500/50">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700 font-medium">
                연재 버튼을 누르면 현재 내용으로 확정되며, 이후에는 수정할 수
                없습니다.
              </p>
            </div>

            <div className="flex items-center gap-4 justify-end">
              <span className="text-sm text-muted-foreground">
                확인을 위해 "연재합니다"를 입력해주세요:
              </span>
              <Input
                value={reviewConfirmText}
                onChange={(e) => setReviewConfirmText(e.target.value)}
                className="w-40"
                placeholder="연재합니다"
              />
              <Button
                variant="outline"
                onClick={() => setIsFinalReviewOpen(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleFinalPublish}
                disabled={reviewConfirmText !== '연재합니다'}
                className="bg-green-600 hover:bg-green-700"
              >
                연재하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
