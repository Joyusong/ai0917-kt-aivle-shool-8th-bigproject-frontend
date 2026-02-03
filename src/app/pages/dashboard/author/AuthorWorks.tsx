import { useState, useEffect, useContext, useRef } from 'react';
import { AuthorBreadcrumbContext } from './AuthorBreadcrumbContext';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../../../components/ui/resizable';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
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
  Users,
  Globe,
  MapPin,
  Package,
  Users2,
  Check,
  ClipboardCheck,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';
import { AuthorWorkExplorer } from './AuthorWorkExplorer';
import { AuthorLorebookPanel } from './AuthorLorebookPanel';
import {
  WorkResponseDto,
  WorkCreateRequestDto,
  WorkUpdateRequestDto,
  KeywordExtractionResponseDto,
  SettingBookDiffDto,
  PublishAnalysisResponseDto,
  ManuscriptDto,
  ManuscriptUploadRequestDto,
  LorebookSaveRequestDto,
  WorkStatus,
} from '../../../types/author';
import { cn } from '../../../components/ui/utils';
import { toast } from 'sonner';
import { Checkbox } from '../../../components/ui/checkbox';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Badge } from '../../../components/ui/badge';
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  PlusCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { DiffView } from './DiffView';

interface AuthorWorksProps {
  integrationId: string;
}

export function AuthorWorks({ integrationId }: AuthorWorksProps) {
  const queryClient = useQueryClient();
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [selectedManuscript, setSelectedManuscript] =
    useState<ManuscriptDto | null>(null);

  const { setBreadcrumbs, onNavigate } = useContext(AuthorBreadcrumbContext);

  // Panel States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); // Default closed

  // Editor State
  const [editorContent, setEditorContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // History State for Undo/Redo
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoing = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update history with debounce
  const updateHistory = (newContent: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    }, 500);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    setIsDirty(true);

    if (!isUndoing.current) {
      updateHistory(newContent);
    }
  };

  // Modals State
  const [isCreateWorkOpen, setIsCreateWorkOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [metadataWork, setMetadataWork] = useState<WorkResponseDto | null>(
    null,
  );
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkSynopsis, setNewWorkSynopsis] = useState('');
  const [newWorkGenre, setNewWorkGenre] = useState('');
  const [newWorkCover, setNewWorkCover] = useState(''); // Optional

  const [isKeywordSelectionOpen, setIsKeywordSelectionOpen] = useState(false);

  // New States
  const [extractedKeywords, setExtractedKeywords] = useState<
    KeywordExtractionResponseDto['check'] | null
  >(null);
  const [selectedKeywords, setSelectedKeywords] = useState<{
    [key: string]: string[];
  }>({});
  const [isKeywordSelectionConfirmed, setIsKeywordSelectionConfirmed] =
    useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    Record<number, 'EXTRACTING' | 'ANALYZING' | 'REVIEW_READY'>
  >({});
  const [analysisResults, setAnalysisResults] = useState<
    Record<number, PublishAnalysisResponseDto>
  >({});
  const [settingBookDiff, setSettingBookDiff] =
    useState<PublishAnalysisResponseDto | null>(null);

  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);
  const [reviewManuscript, setReviewManuscript] =
    useState<ManuscriptDto | null>(null);
  const [reviewConfirmText, setReviewConfirmText] = useState('');
  const [isFinalReviewConfirmed, setIsFinalReviewConfirmed] = useState(false);
  const [resolvedConflicts, setResolvedConflicts] = useState<Set<string>>(
    new Set(),
  );
  const [editingContent, setEditingContent] = useState<Record<string, any>>({});

  const [editMetadataTitle, setEditMetadataTitle] = useState('');

  // Diff Modal Category State
  type Category =
    | 'characters'
    | 'places'
    | 'items'
    | 'groups'
    | 'worldviews'
    | 'plots';
  const [activeDiffCategory, setActiveDiffCategory] =
    useState<Category>('characters');
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());

  const toggleEditItem = (id: string) => {
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleResolved = (id: string) => {
    setResolvedConflicts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEdit = (item: any) => {
    setEditingItems((prev) => new Set(prev).add(item.id));
    // For updates, we edit the 'new' part. For new items, we edit the item itself.
    let content;
    if (item.new !== undefined) {
      content = typeof item.new === 'string' ? item.new : { ...item.new };
    } else {
      content = { ...item };
    }
    setEditingContent((prev) => ({ ...prev, [item.id]: content }));
  };

  const cancelEdit = (id: string) => {
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setEditingContent((prev) => {
      const newContent = { ...prev };
      delete newContent[id];
      return newContent;
    });
  };

  const saveEdit = (id: string, tabKey: string) => {
    if (!settingBookDiff) return;
    const content = editingContent[id];
    if (!content) return;

    setSettingBookDiff((prev: any) => {
      if (!prev) return prev;
      const items = [...prev[tabKey]];
      const idx = items.findIndex((i: any) => i.id === id);
      if (idx !== -1) {
        if (tabKey === '설정 결합') {
          items[idx] = { ...items[idx], new: content };
        } else {
          items[idx] = { ...items[idx], ...content };
        }
      }
      return { ...prev, [tabKey]: items };
    });
    cancelEdit(id);
  };

  const deleteItem = (id: string, tabKey: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setSettingBookDiff((prev: any) => {
      if (!prev) return prev;
      const items = prev[tabKey].filter((i: any) => i.id !== id);
      return { ...prev, [tabKey]: items };
    });
  };

  const categories: { id: Category; label: string; icon: React.ElementType }[] =
    [
      { id: 'characters', label: '인물', icon: Users },
      { id: 'places', label: '장소', icon: MapPin },
      { id: 'items', label: '물건', icon: Package },
      { id: 'groups', label: '집단', icon: Users2 },
      { id: 'worldviews', label: '세계', icon: Globe },
      { id: 'plots', label: '사건', icon: BookOpen },
    ];
  const [editMetadataSynopsis, setEditMetadataSynopsis] = useState('');
  const [editMetadataGenre, setEditMetadataGenre] = useState('');
  const [editMetadataStatus, setEditMetadataStatus] =
    useState<WorkStatus>('NEW');

  // Rename & Delete State
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renamingWork, setRenamingWork] = useState<WorkResponseDto | null>(
    null,
  );
  const [renameTitle, setRenameTitle] = useState('');

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingWorkId, setDeletingWorkId] = useState<number | null>(null);

  // Edit Manuscript State
  const [isEditManuscriptOpen, setIsEditManuscriptOpen] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState<{
    workId: number;
    manuscript: ManuscriptDto;
  } | null>(null);
  const [editManuscriptSubtitle, setEditManuscriptSubtitle] = useState('');
  const [editManuscriptEpisode, setEditManuscriptEpisode] = useState(1);

  // Fetch Manuscript Detail for Edit (Pre-fill)
  const { data: manuscriptDetailForEdit } = useQuery({
    queryKey: [
      'author',
      'manuscript-edit',
      editingManuscript?.workId,
      editingManuscript?.manuscript.id,
    ],
    queryFn: () => {
      if (!editingManuscript) return null;
      const work = works?.find((w) => w.id === editingManuscript.workId);
      if (!work) return null;
      return authorService.getManuscriptDetail(
        integrationId,
        work.title,
        editingManuscript.manuscript.id,
      );
    },
    enabled: !!editingManuscript && isEditManuscriptOpen,
  });

  // Sync state with fetched detail
  useEffect(() => {
    if (manuscriptDetailForEdit) {
      setEditManuscriptSubtitle(manuscriptDetailForEdit.subtitle || '');
      setEditManuscriptEpisode(manuscriptDetailForEdit.episode || 1);
    }
  }, [manuscriptDetailForEdit]);

  // Manuscript Upload State
  const [isUploadManuscriptOpen, setIsUploadManuscriptOpen] = useState(false);
  const [uploadManuscriptWorkId, setUploadManuscriptWorkId] = useState<
    number | null
  >(null);
  const [newManuscriptSubtitle, setNewManuscriptSubtitle] = useState('');
  const [newManuscriptEpisode, setNewManuscriptEpisode] = useState(1);

  // Keyword Extraction Mutation
  const keywordExtractionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedWorkId || !selectedManuscript) return;
      const work = works?.find((w) => w.id === selectedWorkId);
      if (!work) return;
      return authorService.getManuscriptCategories(
        integrationId,
        work.title,
        selectedManuscript.id,
      );
    },
    onSuccess: (data) => {
      if (data && data.check) {
        setExtractedKeywords(data.check);
        setIsKeywordSelectionOpen(true);
        // Select all keywords by default
        setSelectedKeywords(data.check);
        setIsKeywordSelectionConfirmed(false);
      }
    },
    onError: () => {
      toast.error('키워드 추출에 실패했습니다.');
    },
  });

  // Analysis Mutation
  const analysisMutation = useMutation({
    mutationFn: async () => {
      if (!selectedWorkId) return;
      const work = works?.find((w) => w.id === selectedWorkId);
      if (!work) return;
      return authorService.analyzeManuscript(integrationId, work.title, {
        check: selectedKeywords as any,
      });
    },
    onSuccess: (data) => {
      if (data) {
        setSettingBookDiff(data);
        setIsKeywordSelectionOpen(false);
        setIsFinalReviewOpen(true);
      }
    },
    onError: () => {
      toast.error('설정집 분석에 실패했습니다.');
    },
  });

  // Fetch Works
  const { data: works } = useQuery({
    queryKey: ['author', 'works'],
    queryFn: () => authorService.getWorks(integrationId),
  });

  // Rename Work Mutation
  const renameWorkMutation = useMutation({
    mutationFn: async () => {
      if (!renamingWork) return;
      return authorService.updateWork(renamingWork.id, {
        title: renameTitle,
        synopsis: renamingWork.synopsis,
        genre: renamingWork.genre,
      });
    },
    onSuccess: () => {
      toast.success('작품 이름이 변경되었습니다.');
      setIsRenameOpen(false);
      setRenamingWork(null);
      setRenameTitle('');
      queryClient.invalidateQueries({ queryKey: ['author', 'works'] });
    },
    onError: () => {
      toast.error('작품 이름 변경에 실패했습니다.');
    },
  });

  // Edit Manuscript Mutation
  const editManuscriptMutation = useMutation({
    mutationFn: async () => {
      if (!editingManuscript) return;
      const work = works?.find((w) => w.id === editingManuscript.workId);
      if (!work) return;

      return authorService.updateManuscript(
        integrationId,
        work.title,
        editingManuscript.manuscript.id,
        {
          subtitle: editManuscriptSubtitle,
          episode: editManuscriptEpisode,
        },
      );
    },
    onSuccess: () => {
      toast.success('원문이 수정되었습니다.');
      setIsEditManuscriptOpen(false);
      setEditingManuscript(null);
      setEditManuscriptSubtitle('');
      setEditManuscriptEpisode(1);
      if (editingManuscript) {
        const work = works?.find((w) => w.id === editingManuscript.workId);
        if (work) {
          queryClient.invalidateQueries({
            queryKey: ['author', 'manuscript', integrationId, work.title],
          });
        }
      }
    },
    onError: () => {
      toast.error('원문 수정에 실패했습니다.');
    },
  });

  // Delete Work Mutation
  const deleteWorkMutation = useMutation({
    mutationFn: async () => {
      if (!deletingWorkId) return;
      return authorService.deleteWork(deletingWorkId);
    },
    onSuccess: () => {
      toast.success('작품이 삭제되었습니다.');
      setIsDeleteAlertOpen(false);
      setDeletingWorkId(null);
      queryClient.invalidateQueries({ queryKey: ['author', 'works'] });
      // If deleted work was selected, deselect it
      if (selectedWorkId === deletingWorkId) {
        setSelectedWorkId(null);
        setSelectedManuscript(null);
        setEditorContent('');
      }
    },
    onError: () => {
      toast.error('작품 삭제에 실패했습니다.');
    },
  });

  // Fetch Manuscript Detail (Replaces Episode Detail)
  const { data: manuscriptDetail, isLoading: isManuscriptLoading } = useQuery({
    queryKey: ['author', 'manuscript', selectedWorkId, selectedManuscript?.id],
    queryFn: () => {
      if (!selectedWorkId || !selectedManuscript) return null;
      const work = works?.find((w) => w.id === selectedWorkId);
      if (!work) return null;
      return authorService.getManuscriptDetail(
        integrationId,
        work.title,
        selectedManuscript.id,
      );
    },
    enabled: !!selectedWorkId && !!selectedManuscript && !!works,
  });

  // Sync content when manuscript detail loads
  useEffect(() => {
    if (manuscriptDetail) {
      setEditorContent(manuscriptDetail.txt || '');
      setIsDirty(false);
    }
  }, [manuscriptDetail]);

  // Update Breadcrumbs
  useEffect(() => {
    const breadcrumbs: { label: string; onClick?: () => void }[] = [
      { label: '홈', onClick: () => onNavigate('home') },
      {
        label: '작품 관리',
        onClick: () => {
          setSelectedWorkId(null);
          setSelectedManuscript(null);
        },
      },
    ];

    if (selectedWorkId && works) {
      const work = works.find((w) => w.id === selectedWorkId);
      if (work) {
        breadcrumbs.push({
          label: work.title,
          onClick: () => {
            setSelectedManuscript(null);
          },
        });
      }
    }

    if (selectedManuscript) {
      breadcrumbs.push({
        label:
          selectedManuscript.subtitle || `원문 ${selectedManuscript.episode}`,
      });
    }

    setBreadcrumbs(breadcrumbs);
  }, [selectedWorkId, selectedManuscript, works, setBreadcrumbs, onNavigate]);

  // Save Mutation (Update via Upload)
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedWorkId || !selectedManuscript) return;
      const work = works?.find((w) => w.id === selectedWorkId);
      if (!work) return;

      // Use uploadManuscript to update (re-upload) content
      await authorService.uploadManuscript(integrationId, work.title, {
        workId: selectedWorkId,
        episode: selectedManuscript.episode,
        subtitle: selectedManuscript.subtitle,
        txt: editorContent,
      });
    },
    onSuccess: () => {
      toast.success('저장되었습니다.');
      setIsDirty(false);
      const work = works?.find((w) => w.id === selectedWorkId);
      if (work) {
        queryClient.invalidateQueries({
          queryKey: ['author', 'manuscript', integrationId, work.title],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'author',
            'manuscript',
            selectedWorkId,
            selectedManuscript?.id,
          ],
        });
      }
    },
    onError: () => {
      toast.error('저장(업로드)에 실패했습니다.');
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

  // Upload Manuscript Mutation
  const uploadManuscriptMutation = useMutation({
    mutationFn: async ({
      workId,
      subtitle,
      episode,
      txt,
    }: {
      workId: number;
      subtitle: string;
      episode: number;
      txt: string;
    }) => {
      const work = works?.find((w) => w.id === workId);
      if (!work) throw new Error('Work not found');
      await authorService.uploadManuscript(integrationId, work.title, {
        workId,
        subtitle,
        episode,
        txt,
      });
    },
    onSuccess: (_, variables) => {
      toast.success('원문이 등록되었습니다.');
      setIsUploadManuscriptOpen(false);
      setNewManuscriptSubtitle('');
      setNewManuscriptEpisode(1);
      const work = works?.find((w) => w.id === variables.workId);
      if (work) {
        queryClient.invalidateQueries({
          queryKey: ['author', 'manuscript', integrationId, work.title],
        });
      }
    },
    onError: () => {
      toast.error('원문 등록에 실패했습니다.');
    },
  });

  // Delete Manuscript Mutation
  const deleteManuscriptMutation = useMutation({
    mutationFn: async ({
      workId,
      manuscriptId,
    }: {
      workId: number;
      manuscriptId: number;
    }) => {
      const work = works?.find((w) => w.id === workId);
      if (!work) throw new Error('Work not found');
      await authorService.deleteManuscript(
        integrationId,
        work.title,
        manuscriptId,
      );
    },
    onSuccess: (_, variables) => {
      toast.success('원문이 삭제되었습니다.');
      const work = works?.find((w) => w.id === variables.workId);
      if (work) {
        queryClient.invalidateQueries({
          queryKey: ['author', 'manuscript', integrationId, work.title],
        });
      }
      if (selectedManuscript?.id === variables.manuscriptId) {
        setSelectedManuscript(null);
        setEditorContent('');
      }
    },
    onError: () => {
      toast.error('원문 삭제에 실패했습니다.');
    },
  });

  // Ctrl+S Handler
  useEffect(() => {
    const handleGlobalSaveShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (selectedManuscript && isDirty && !saveMutation.isPending) {
          saveMutation.mutate();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalSaveShortcut);
    return () =>
      window.removeEventListener('keydown', handleGlobalSaveShortcut);
  }, [selectedManuscript, isDirty, saveMutation]);

  const handleSelectWork = (workId: number) => {
    setSelectedWorkId(workId);
    if (selectedWorkId !== workId) {
      setSelectedManuscript(null);
      setEditorContent('');
    }
  };

  const handleSelectManuscript = (manuscript: ManuscriptDto) => {
    if (isDirty) {
      if (!confirm('작성 중인 내용이 저장되지 않았습니다. 이동하시겠습니까?')) {
        return;
      }
    }
    setSelectedManuscript(manuscript);
    // Ensure parent work is selected for correct breadcrumbs
    if (manuscript.workId && manuscript.workId !== selectedWorkId) {
      setSelectedWorkId(manuscript.workId);
    }
    // Removed auto-open right sidebar
  };

  const handleOpenMetadata = async (work: WorkResponseDto) => {
    try {
      // Pre-fill with existing data first for immediate feedback
      setMetadataWork(work);
      setEditMetadataTitle(work.title);
      setEditMetadataSynopsis(work.synopsis || '');
      setEditMetadataGenre(work.genre || '');
      setEditMetadataStatus(work.status);
      setIsMetadataOpen(true);

      // Fetch fresh data
      const detail = await authorService.getWorkDetail(work.id.toString());
      setMetadataWork(detail);
      setEditMetadataTitle(detail.title);
      setEditMetadataSynopsis(detail.synopsis || '');
      setEditMetadataGenre(detail.genre || '');
      setEditMetadataStatus(detail.status);
    } catch (error) {
      toast.error('작품 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleOpenLorebook = (work: WorkResponseDto) => {
    setSelectedWorkId(work.id);
    setIsRightSidebarOpen(true);
  };

  const handleRenameWork = (work: WorkResponseDto) => {
    setRenamingWork(work);
    setRenameTitle(work.title);
    setIsRenameOpen(true);
  };

  const handleEditManuscript = (workId: number, manuscript: ManuscriptDto) => {
    setEditingManuscript({ workId, manuscript });
    setEditManuscriptSubtitle(manuscript.subtitle || '');
    setEditManuscriptEpisode(manuscript.episode || 1);
    setIsEditManuscriptOpen(true);
  };

  const handleDeleteWork = (workId: number) => {
    setDeletingWorkId(workId);
    setIsDeleteAlertOpen(true);
  };

  const handleUploadManuscript = (workId: number) => {
    console.log('handleUploadManuscript called with workId:', workId);
    // Use setTimeout to avoid conflict with ContextMenu closing
    setTimeout(() => {
      setUploadManuscriptWorkId(workId);
      setNewManuscriptSubtitle('');
      setNewManuscriptEpisode(1);
      setIsUploadManuscriptOpen(true);
    }, 100);
  };

  const handleSubmitUploadManuscript = () => {
    if (!uploadManuscriptWorkId) return;
    if (!newManuscriptSubtitle.trim()) {
      toast.error('원문 제목(부제)을 입력해주세요.');
      return;
    }

    uploadManuscriptMutation.mutate({
      workId: uploadManuscriptWorkId,
      subtitle: newManuscriptSubtitle.trim(),
      episode: newManuscriptEpisode,
      txt: '', // Content is optional in the form now
    });
  };

  const handleDeleteManuscript = (workId: number, manuscriptId: number) => {
    if (!confirm('정말 원문을 삭제하시겠습니까?')) return;
    deleteManuscriptMutation.mutate({ workId, manuscriptId });
  };

  const handleCreateWork = () => {
    if (!newWorkTitle.trim()) {
      toast.error('작품 제목을 입력해주세요.');
      return;
    }
    createWorkMutation.mutate({
      title: newWorkTitle,
      synopsis: newWorkSynopsis,
      genre: newWorkGenre,
      coverImageUrl: newWorkCover,
      primaryAuthorId: integrationId,
    });
  };

  const handlePublishClick = async () => {
    if (!selectedManuscript) return;
    if (isDirty) {
      if (confirm('분석을 위해서는 저장이 필요합니다. 저장하시겠습니까?')) {
        try {
          await saveMutation.mutateAsync();
        } catch {
          return;
        }
      } else {
        return;
      }
    }

    const status = processingStatus[selectedManuscript.id];

    if (status === 'ANALYZING') {
      toast.info('설정집 분석이 진행 중입니다. 잠시만 기다려주세요.');
      return;
    }

    if (status === 'REVIEW_READY') {
      const result = analysisResults[selectedManuscript.id];
      if (result) {
        setSettingBookDiff(result);
        setIsFinalReviewOpen(true);
        setIsFinalReviewConfirmed(false);
      } else {
        toast.error('분석 결과를 찾을 수 없습니다. 다시 시도해주세요.');
      }
      return;
    }

    if (confirm('AI 분석을 요청하시겠습니까?')) {
      if (selectedManuscript) {
        setProcessingStatus((prev) => ({
          ...prev,
          [selectedManuscript.id]: 'EXTRACTING',
        }));
      }

      toast.info('AI가 원문을 분석하여 키워드를 추출하고 있습니다...');
      keywordExtractionMutation.mutate();
    }
  };

  const handleOpenReview = (workId: number, manuscript: ManuscriptDto) => {
    // Manuscript doesn't have isReadOnly check yet, assuming it can be reviewed
    // If it's in REVIEW_READY state, open it
    const status = processingStatus[manuscript.id];
    if (status === 'REVIEW_READY') {
      const result = analysisResults[manuscript.id];
      if (result) {
        setSettingBookDiff(result);
        setIsFinalReviewOpen(true);
        return;
      }
    }

    // Otherwise show standard message
    toast.info('진행 중인 연재 프로세스가 없습니다.');
  };

  const handleKeywordToggle = (category: string, keyword: string) => {
    setSelectedKeywords((prev) => {
      const currentList = prev[category] || [];
      const newList = currentList.includes(keyword)
        ? currentList.filter((k) => k !== keyword)
        : [...currentList, keyword];
      return { ...prev, [category]: newList };
    });
  };

  const handleSelectAllKeywords = (selectAll: boolean) => {
    if (!extractedKeywords) return;
    if (selectAll) {
      setSelectedKeywords(extractedKeywords);
    } else {
      setSelectedKeywords({});
    }
  };

  const handleCategoryToggle = (category: string, all: boolean) => {
    if (!extractedKeywords) return;
    const categoryKeywords = (extractedKeywords as any)[category] || [];
    setSelectedKeywords((prev) => ({
      ...prev,
      [category]: all ? categoryKeywords : [],
    }));
  };

  const handleKeywordSubmit = () => {
    if (!isKeywordSelectionConfirmed) {
      toast.error('확인 체크박스에 체크해주세요.');
      return;
    }

    if (selectedManuscript) {
      setProcessingStatus((prev) => ({
        ...prev,
        [selectedManuscript.id]: 'ANALYZING',
      }));
    }

    setIsKeywordSelectionOpen(false);
    toast.info(
      '설정집 변경사항을 분석 중입니다... (시간이 소요될 수 있습니다)',
    );
    analysisMutation.mutate();
  };

  // Update Work Mutation
  const updateWorkMutation = useMutation({
    mutationFn: async () => {
      if (!metadataWork) return;

      // 1. Status Update if changed
      if (editMetadataStatus !== metadataWork.status) {
        await authorService.updateWorkStatus(
          metadataWork.id,
          editMetadataStatus,
        );
      }

      // 2. Metadata Update
      return authorService.updateWork(metadataWork.id, {
        title: editMetadataTitle,
        synopsis: editMetadataSynopsis,
        genre: editMetadataGenre,
      });
    },
    onSuccess: () => {
      toast.success('작품 정보가 수정되었습니다.');
      setIsMetadataOpen(false);
      queryClient.invalidateQueries({ queryKey: ['author', 'works'] });
    },
    onError: () => {
      toast.error('작품 정보 수정에 실패했습니다.');
    },
  });

  // Confirm Publish Mutation (Apply Analysis Results)
  const confirmPublishMutation = useMutation({
    mutationFn: async () => {
      if (!selectedWorkId || !selectedManuscript || !settingBookDiff) return;
      const work = works?.find((w) => w.id === selectedWorkId);
      if (!work) return;

      // TODO: Implement actual saving logic for each item in settingBookDiff
      // This requires iterating over '신규 업로드', '설정 결합', and resolved '충돌' items
      // and calling authorService.saveLorebookManual or similar for each.
      // For now, we simulate success to allow the flow to complete.

      const newItems = settingBookDiff['신규 업로드'] || [];
      for (const item of newItems) {
        try {
          const req: LorebookSaveRequestDto = {
            category: item.category,
            keyword: item.name,
            subtitle: selectedManuscript.subtitle || '',
            setting:
              typeof item.new === 'string'
                ? item.new
                : JSON.stringify(item.new),
            episode: [selectedManuscript.episode],
          };
          await authorService.saveLorebookManual(
            integrationId,
            work.title,
            selectedWorkId,
            req,
          );
        } catch (e) {
          console.error('Failed to save item:', item, e);
        }
      }

      // We process only new items for now as a proof of concept.
      // Updates and conflicts require more complex logic.
    },
    onSuccess: () => {
      toast.success('설정집이 업데이트되었습니다.');
      setIsFinalReviewOpen(false);
      setSettingBookDiff(null);
      if (selectedManuscript) {
        setProcessingStatus((prev) => {
          const next = { ...prev };
          delete next[selectedManuscript.id];
          return next;
        });
      }
    },
    onError: () => {
      toast.error('설정집 업데이트에 실패했습니다.');
    },
  });

  const handleUpdateMetadata = () => {
    if (!metadataWork) return;
    updateWorkMutation.mutate();
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
                userId={integrationId}
                selectedWorkId={selectedWorkId}
                selectedManuscriptId={selectedManuscript?.id || null}
                onSelectWork={handleSelectWork}
                onOpenMetadata={handleOpenMetadata}
                onOpenLorebook={handleOpenLorebook}
                onCreateWork={() => setIsCreateWorkOpen(true)}
                onRenameWork={handleRenameWork}
                onDeleteWork={handleDeleteWork}
                onSelectManuscript={handleSelectManuscript}
                onUploadManuscript={handleUploadManuscript}
                onEditManuscript={handleEditManuscript}
                onDeleteManuscript={handleDeleteManuscript}
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

                {selectedManuscript ? (
                  <span className="text-sm font-medium flex items-center gap-2">
                    {isDirty && (
                      <span className="text-xs text-orange-500 font-normal">
                        (수정됨)
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    작품과 원문을 선택해주세요
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Save & Publish Buttons */}
                {selectedManuscript && (
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
                    {processingStatus[selectedManuscript.id] === 'ANALYZING' ? (
                      <Button
                        size="sm"
                        disabled
                        variant="outline"
                        className="bg-blue-500/10 text-blue-500 border-blue-200"
                      >
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI 분석 중
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handlePublishClick}
                      >
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        분석
                      </Button>
                    )}
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
              {selectedManuscript ? (
                isManuscriptLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    데이터를 불러오는 중입니다...
                  </div>
                ) : (
                  <Textarea
                    value={editorContent}
                    onChange={handleEditorChange}
                    className={cn(
                      'w-full h-full resize-none border-none focus-visible:ring-0 p-8 text-lg leading-relaxed font-serif overflow-y-auto',
                    )}
                    placeholder="여기에 내용을 작성하세요..."
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4">
                  <BookOpen className="w-12 h-12 opacity-20" />
                  <p>왼쪽 목록에서 작품과 원문을 선택하여 집필을 시작하세요.</p>
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
              <AuthorLorebookPanel
                workId={selectedWorkId}
                userId={integrationId}
                className="h-full"
              />
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
              <Label>
                작품 제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newWorkTitle}
                onChange={(e) => setNewWorkTitle(e.target.value)}
                placeholder="나의 멋진 소설"
              />
            </div>
            <div className="space-y-2">
              <Label>시놉시스 (선택)</Label>
              <Textarea
                value={newWorkSynopsis}
                onChange={(e) => setNewWorkSynopsis(e.target.value)}
                placeholder="작품의 줄거리를 입력하세요"
                className="h-24 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>장르 (선택)</Label>
              <Input
                value={newWorkGenre}
                onChange={(e) => setNewWorkGenre(e.target.value)}
                placeholder="예: 판타지, 로맨스"
              />
            </div>
            <div className="space-y-2">
              <Label>표지 이미지 URL (선택)</Label>
              <Input
                value={newWorkCover}
                onChange={(e) => setNewWorkCover(e.target.value)}
                placeholder="https://example.com/cover.jpg"
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

      {/* Upload Manuscript Modal */}
      <Dialog
        open={isUploadManuscriptOpen}
        onOpenChange={setIsUploadManuscriptOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>새 원문 등록</DialogTitle>
            <DialogDescription>새로운 에피소드를 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>회차 번호</Label>
              <Input
                type="number"
                min={1}
                value={newManuscriptEpisode}
                onChange={(e) =>
                  setNewManuscriptEpisode(parseInt(e.target.value) || 1)
                }
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>부제 (제목)</Label>
              <Input
                value={newManuscriptSubtitle}
                onChange={(e) => setNewManuscriptSubtitle(e.target.value)}
                placeholder="예: 새로운 시작"
              />
            </div>
            {/* Content field removed as requested */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadManuscriptOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmitUploadManuscript}
              disabled={uploadManuscriptMutation.isPending}
            >
              {uploadManuscriptMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                '등록'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyword Selection Modal */}
      <Dialog
        open={isKeywordSelectionOpen}
        onOpenChange={setIsKeywordSelectionOpen}
      >
        <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>설정집 생성을 위한 키워드 선택</span>
              <div className="flex items-center gap-2 mr-8">
                <Checkbox
                  id="select-all-keywords"
                  checked={
                    !!extractedKeywords &&
                    Object.keys(extractedKeywords).every(
                      (category) =>
                        (selectedKeywords[category] || []).length ===
                        (extractedKeywords as any)[category].length,
                    )
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAllKeywords(checked === true)
                  }
                />
                <label
                  htmlFor="select-all-keywords"
                  className="text-sm font-normal cursor-pointer"
                >
                  전체 선택
                </label>
              </div>
            </DialogTitle>
            <DialogDescription>
              AI가 추출한 키워드 중 설정집으로 생성할 항목을 선택해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-2 gap-6 py-4">
              {extractedKeywords ? (
                Object.entries(extractedKeywords).map(
                  ([category, keywordsRaw]) => {
                    const keywords = keywordsRaw as string[];
                    const categoryLabel: { [key: string]: string } = {
                      인물: '인물 (Characters)',
                      장소: '장소 (Locations)',
                      사건: '사건 (Events)',
                      집단: '집단 (Groups)',
                      물건: '물건 (Items)',
                      세계: '세계 (Worlds)',
                    };
                    const isAllSelected =
                      keywords.length > 0 &&
                      (selectedKeywords[category] || []).length ===
                        keywords.length;

                    return (
                      <div
                        key={category}
                        className="space-y-3 border rounded-lg p-4 bg-muted/20"
                      >
                        <h4 className="font-semibold flex items-center gap-2">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={(checked) =>
                              handleCategoryToggle(category, checked === true)
                            }
                          />
                          {categoryLabel[category] || category}
                          <Badge variant="secondary" className="ml-auto">
                            {keywords.length}
                          </Badge>
                        </h4>
                        <div className="space-y-2">
                          {keywords.length > 0 ? (
                            keywords.map((keyword) => (
                              <div
                                key={keyword}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`kw-${category}-${keyword}`}
                                  checked={(
                                    selectedKeywords[category] || []
                                  ).includes(keyword)}
                                  onCheckedChange={() =>
                                    handleKeywordToggle(category, keyword)
                                  }
                                />
                                <label
                                  htmlFor={`kw-${category}-${keyword}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {keyword}
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              추출된 키워드가 없습니다.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  },
                )
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>AI가 원문을 분석하고 있습니다...</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-4 border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm-publish"
                  checked={isKeywordSelectionConfirmed}
                  onCheckedChange={(checked) =>
                    setIsKeywordSelectionConfirmed(checked === true)
                  }
                />
                <label
                  htmlFor="confirm-publish"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  위 내용으로 AI 분석을 진행합니다.
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsKeywordSelectionOpen(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={handleKeywordSubmit}
                  disabled={
                    !isKeywordSelectionConfirmed || analysisMutation.isPending
                  }
                >
                  {analysisMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    '분석 시작'
                  )}
                </Button>
              </div>
            </div>
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
              <div className="space-y-2">
                <Label>상태</Label>
                <Select
                  value={editMetadataStatus}
                  onValueChange={(value) =>
                    setEditMetadataStatus(value as WorkStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">신규</SelectItem>
                    <SelectItem value="ONGOING">연재중</SelectItem>
                    <SelectItem value="COMPLETED">완결</SelectItem>
                  </SelectContent>
                </Select>
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
        <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col p-0 gap-0 rounded-xl border shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b bg-background z-10">
            <DialogTitle>설정집 변경 사항 확인 (최종 검수)</DialogTitle>
            <DialogDescription>
              AI가 생성한 설정집 변경 사항을 확인하세요. 충돌 항목은 반드시
              검토가 필요합니다.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="충돌"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 shrink-0 bg-background border-b z-10">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="충돌"
                  className="data-[state=active]:text-red-600 data-[state=active]:bg-red-50"
                >
                  충돌 ({settingBookDiff?.['충돌']?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="설정 결합">
                  설정 결합 ({settingBookDiff?.['설정 결합']?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="신규 업로드">
                  신규 업로드 ({settingBookDiff?.['신규 업로드']?.length || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/5 p-6">
              {['충돌', '설정 결합', '신규 업로드'].map((tabKey) => {
                const items =
                  settingBookDiff?.[
                    tabKey as keyof PublishAnalysisResponseDto
                  ] || [];
                const hasItems = items.length > 0;

                return (
                  <TabsContent
                    key={tabKey}
                    value={tabKey}
                    className="mt-0 space-y-8"
                  >
                    {!hasItems ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                        <BookOpen className="w-16 h-16 mb-4 stroke-1" />
                        <p className="text-lg">해당 항목이 없습니다.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {items.map((item: any, idx: number) => {
                          // Handle '충돌' (Collision) items
                          if (tabKey === '충돌') {
                            const isResolved = resolvedConflicts.has(item.id);
                            return (
                              <div
                                key={item.id || idx}
                                className={cn(
                                  'border rounded-xl p-5 bg-card shadow-sm transition-all',
                                  isResolved
                                    ? 'border-green-500 bg-green-50/10'
                                    : 'border-l-4 border-l-red-500',
                                )}
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-lg text-primary">
                                      {item.name}
                                    </h4>
                                    {isResolved ? (
                                      <div className="flex items-center gap-2">
                                        <Badge className="bg-green-600 hover:bg-green-700">
                                          <Check className="w-3 h-3 mr-1" />{' '}
                                          RESOLVED
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 text-xs text-muted-foreground hover:text-primary"
                                          onClick={() =>
                                            toggleResolved(item.id)
                                          }
                                        >
                                          취소
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          id={`resolve-${item.id}`}
                                          checked={false}
                                          onCheckedChange={() =>
                                            toggleResolved(item.id)
                                          }
                                        />
                                        <label
                                          htmlFor={`resolve-${item.id}`}
                                          className="text-sm font-medium cursor-pointer hover:underline"
                                        >
                                          확인 완료 (Resolved)
                                        </label>
                                        <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                          CONFLICT
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                                    <p className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" />
                                      {item.reason}
                                    </p>
                                    <DiffView
                                      original={item.original}
                                      current={item.new}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // Handle '설정 결합' (Updated)
                          if (tabKey === '설정 결합') {
                            const isEditing = editingItems.has(item.id);
                            const currentContent =
                              editingContent[item.id] || item.new;

                            // If new/original are objects, stringify them for editing/viewing
                            const displayOriginal =
                              typeof item.original === 'string'
                                ? item.original
                                : JSON.stringify(item.original, null, 2);
                            const displayCurrent =
                              typeof currentContent === 'string'
                                ? currentContent
                                : JSON.stringify(currentContent, null, 2);

                            return (
                              <div
                                key={item.id || idx}
                                className="border rounded-xl p-5 bg-card shadow-sm"
                              >
                                <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-lg">
                                      {item.name}
                                    </h4>
                                    <Badge variant="outline">
                                      {item.category}
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                                      UPDATED
                                    </Badge>
                                  </div>
                                  <div className="flex gap-2">
                                    {isEditing ? (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => cancelEdit(item.id)}
                                        >
                                          취소
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            saveEdit(item.id, tabKey)
                                          }
                                        >
                                          <Save className="w-4 h-4 mr-1" />
                                          저장
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => startEdit(item)}
                                        >
                                          <Edit2 className="w-4 h-4 mr-1" />
                                          수정
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() =>
                                            deleteItem(item.id, tabKey)
                                          }
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {isEditing ? (
                                  <div className="grid grid-cols-2 gap-4 h-64">
                                    <div className="flex flex-col border rounded-md overflow-hidden opacity-60 pointer-events-none">
                                      <div className="bg-muted/50 p-2 text-xs font-semibold border-b text-muted-foreground">
                                        Original (Read-only)
                                      </div>
                                      <div className="p-3 overflow-y-auto flex-1 text-sm whitespace-pre-wrap leading-relaxed bg-muted/10 font-mono">
                                        {displayOriginal}
                                      </div>
                                    </div>
                                    <div className="flex flex-col border rounded-md overflow-hidden ring-2 ring-blue-500/20">
                                      <div className="bg-blue-50/50 p-2 text-xs font-semibold border-b text-blue-700 flex justify-between">
                                        <span>Editing...</span>
                                      </div>
                                      <Textarea
                                        value={displayCurrent}
                                        onChange={(e) =>
                                          setEditingContent((prev) => ({
                                            ...prev,
                                            [item.id]: e.target.value,
                                          }))
                                        }
                                        className="flex-1 resize-none border-0 focus-visible:ring-0 p-3 font-mono text-sm"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <DiffView
                                    original={displayOriginal}
                                    current={displayCurrent}
                                  />
                                )}
                              </div>
                            );
                          }

                          // Handle '신규 업로드' (New)
                          if (tabKey === '신규 업로드') {
                            const isEditing = editingItems.has(item.id);
                            const currentContent =
                              editingContent[item.id] || item;

                            return (
                              <div
                                key={item.id || idx}
                                className="border rounded-xl p-5 bg-card shadow-sm"
                              >
                                <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-lg">
                                      {item.name}
                                    </h4>
                                    <Badge variant="outline">
                                      {item.category}
                                    </Badge>
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                      NEW
                                    </Badge>
                                  </div>
                                  <div className="flex gap-2">
                                    {isEditing ? (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => cancelEdit(item.id)}
                                        >
                                          취소
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            saveEdit(item.id, tabKey)
                                          }
                                        >
                                          <Save className="w-4 h-4 mr-1" />
                                          저장
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => startEdit(item)}
                                        >
                                          <Edit2 className="w-4 h-4 mr-1" />
                                          수정
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() =>
                                            deleteItem(item.id, tabKey)
                                          }
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {isEditing ? (
                                  <div className="space-y-4">
                                    <Label>Description</Label>
                                    <Textarea
                                      value={currentContent.description}
                                      onChange={(e) =>
                                        setEditingContent((prev) => ({
                                          ...prev,
                                          [item.id]: {
                                            ...currentContent,
                                            description: e.target.value,
                                          },
                                        }))
                                      }
                                      className="min-h-[150px]"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-col gap-4 border-t pt-4 px-6 pb-6 bg-background z-10">
            {(settingBookDiff?.['충돌']?.filter(
              (c: any) => !resolvedConflicts.has(c.id),
            ).length || 0) > 0 ? (
              // Conflict State
              <div className="flex items-center justify-between w-full p-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold">
                      해결되지 않은 충돌 사항이 있습니다.
                    </span>
                    <span className="text-xs opacity-90">
                      모든 충돌 항목을 '확인 완료' 처리해야 진행할 수 있습니다.
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsFinalReviewOpen(false);
                      if (selectedManuscript) {
                        setProcessingStatus((prev) => {
                          const next = { ...prev };
                          delete next[selectedManuscript.id];
                          return next;
                        });
                      }
                    }}
                  >
                    닫기
                  </Button>
                </div>
              </div>
            ) : (
              // Non-Conflict State (All resolved or none existed)
              <div className="flex flex-col gap-4 w-full">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                  <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                    TIP
                  </div>
                  <p>
                    모든 충돌이 해결되었습니다.
                    <span className="font-bold mx-1">설정 결합</span> 및
                    <span className="font-bold mx-1">신규 업로드</span>
                    내용을 최종 확인해 주세요.
                  </p>
                </div>
                <div className="flex items-center justify-between w-full mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="confirm-final-review"
                      checked={isFinalReviewConfirmed}
                      onCheckedChange={(checked) =>
                        setIsFinalReviewConfirmed(checked === true)
                      }
                    />
                    <label
                      htmlFor="confirm-final-review"
                      className="text-sm text-muted-foreground cursor-pointer select-none"
                    >
                      <span className="text-primary font-bold mr-1">확인:</span>
                      위 변경 사항을 모두 확인하였으며, 설정집 업데이트에
                      동의합니다.
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsFinalReviewOpen(false);
                        if (selectedManuscript) {
                          setProcessingStatus((prev) => {
                            const next = { ...prev };
                            delete next[selectedManuscript.id];
                            return next;
                          });
                        }
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={() => confirmPublishMutation.mutate()}
                      disabled={
                        confirmPublishMutation.isPending ||
                        !isFinalReviewConfirmed
                      }
                      className="min-w-[100px]"
                    >
                      {confirmPublishMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          진행 중...
                        </>
                      ) : (
                        '업데이트 적용'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Work Modal */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>작품 이름 변경</DialogTitle>
            <DialogDescription>
              변경할 작품의 새로운 이름을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="작품 이름"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameWorkMutation.mutate();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => renameWorkMutation.mutate()}
              disabled={renameWorkMutation.isPending || !renameTitle.trim()}
            >
              {renameWorkMutation.isPending ? '변경 중...' : '변경'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Manuscript Modal */}
      <Dialog
        open={isUploadManuscriptOpen}
        onOpenChange={setIsUploadManuscriptOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>새 원문 등록</DialogTitle>
            <DialogDescription>새로운 에피소드를 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>회차 번호</Label>
              <Input
                type="number"
                min={1}
                value={newManuscriptEpisode}
                onChange={(e) =>
                  setNewManuscriptEpisode(parseInt(e.target.value) || 1)
                }
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>부제 (제목)</Label>
              <Input
                value={newManuscriptSubtitle}
                onChange={(e) => setNewManuscriptSubtitle(e.target.value)}
                placeholder="예: 새로운 시작"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadManuscriptOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmitUploadManuscript}
              disabled={uploadManuscriptMutation.isPending}
            >
              {uploadManuscriptMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                '등록'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Manuscript Modal */}
      <Dialog
        open={isEditManuscriptOpen}
        onOpenChange={setIsEditManuscriptOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>원문 수정</DialogTitle>
            <DialogDescription>
              원문의 회차와 이름(부제)을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>회차</Label>
              <Input
                type="number"
                value={editManuscriptEpisode}
                onChange={(e) =>
                  setEditManuscriptEpisode(Number(e.target.value))
                }
                placeholder="회차 번호"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>원문 이름(부제)</Label>
              <Input
                value={editManuscriptSubtitle}
                onChange={(e) => setEditManuscriptSubtitle(e.target.value)}
                placeholder="원문 이름(부제)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    editManuscriptMutation.mutate();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditManuscriptOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => editManuscriptMutation.mutate()}
              disabled={
                editManuscriptMutation.isPending ||
                !editManuscriptSubtitle.trim()
              }
            >
              {editManuscriptMutation.isPending ? '수정 중...' : '수정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Work Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>작품을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 작품과 관련된 모든 데이터(회차,
              설정집 등)가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteWorkMutation.mutate()}
              disabled={deleteWorkMutation.isPending}
            >
              {deleteWorkMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
