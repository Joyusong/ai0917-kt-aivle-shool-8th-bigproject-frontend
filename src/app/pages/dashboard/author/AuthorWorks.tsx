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
  Send,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
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
  LorebookConflictSolveRequestDto,
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
  User,
  MapPin,
  BookOpen,
  Users,
  Globe,
  Box,
  LayoutGrid,
  Info,
} from 'lucide-react';

const extractConflictItems = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const items: any[] = [];
  // data is an object where keys are categories (e.g., "인물", "세계")
  Object.entries(data).forEach(([category, entities]) => {
    if (Array.isArray(entities)) {
      entities.forEach((entityObj: any) => {
        // entityObj structure can vary.
        // It might be { "EntityName": "AnalysisString", "신규설정": {...}, "기존설정": {...} }
        // or { "이름": "EntityName", "분석": "AnalysisString", ... }

        const keys = Object.keys(entityObj);
        // Find the key that is NOT '신규설정', '기존설정', '분석', '이름' if possible to guess the entity name
        // or if there is an explicit '이름' key, use that.

        let nameKey = keys.find(
          (k) => k !== '신규설정' && k !== '기존설정' && k !== '분석',
        );
        let entityName = nameKey;
        let analysisStr = '';

        if (entityObj['이름']) {
          entityName = entityObj['이름'];
          nameKey = '이름'; // Treat as found
        }

        // Try to find analysis string
        if (entityObj['분석']) {
          analysisStr = entityObj['분석'];
        } else if (nameKey && typeof entityObj[nameKey] === 'string') {
          analysisStr = entityObj[nameKey];
        }

        if (entityName) {
          const newSettings =
            entityObj['신규설정'] ||
            (nameKey && entityObj[nameKey] !== analysisStr
              ? entityObj[nameKey]
              : null);
          const oldSettings = entityObj['기존설정'];

          // Parse analysis string: [결과: 충돌] [판단사유: ...]
          const resultMatch = analysisStr.match(/\[결과:\s*(.*?)\]/);
          const reasonMatch = analysisStr.match(/\[판단사유:\s*([\s\S]*?)\]/);

          const result = resultMatch ? resultMatch[1].trim() : '충돌';
          // If reason is captured, use it. Otherwise use the whole string.
          let reason = reasonMatch ? reasonMatch[1].trim() : analysisStr;

          items.push({
            id: `${category}-${entityName}-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            name: entityName,
            category: category,
            reason: reason,
            original:
              oldSettings || '기존 설정은 분석 내용에 포함되어 있습니다.',
            new: newSettings || '신규 설정 정보를 찾을 수 없습니다.',
            result: result,
            rawAnalysis: analysisStr,
          });
        }
      });
    }
  });
  return items;
};

import { DynamicSettingEditor } from '../../../components/dashboard/author/DynamicSettingEditor';
import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { DiffView } from './DiffView';
import { SettingViewer } from './SettingViewer';

const normalizeAnalysisData = (data: PublishAnalysisResponseDto): any => {
  const inferCategory = (content: any): string => {
    if (!content || typeof content !== 'object') return '기타';
    const keys = Object.keys(content);
    if (
      keys.includes('직업/신분') ||
      keys.includes('성격') ||
      keys.includes('인물관계')
    )
      return '인물';
    if (
      keys.includes('위치') ||
      keys.includes('분위기') ||
      keys.includes('지형')
    )
      return '장소';
    if (keys.includes('종류') || keys.includes('용도') || keys.includes('등급'))
      return '물건';
    if (keys.includes('일시') || keys.includes('주체') || keys.includes('원인'))
      return '사건';
    if (keys.includes('규모') || keys.includes('목적') || keys.includes('상징'))
      return '집단';
    if (keys.includes('종류') || keys.includes('규칙') || keys.includes('금기'))
      return '세계';
    return '기타';
  };

  const cleanValue = (val: any): any => {
    if (val === null || val === 'None' || val === 'null' || val === 'Null')
      return '';
    if (Array.isArray(val)) return val.map(cleanValue);
    if (typeof val === 'object') {
      const cleaned: any = {};
      for (const [k, v] of Object.entries(val)) {
        cleaned[k] = cleanValue(v);
      }
      return cleaned;
    }
    return val;
  };

  const unwrapItem = (item: any, maxDepth = 5) => {
    let current = item;
    for (let i = 0; i < maxDepth; i++) {
      // Handle standard array wrapping [item]
      if (Array.isArray(current) && current.length === 1) {
        current = current[0];
      }
      // Handle 3-level tuple wrapping [[id, map, eps]] -> [id, map, eps]
      else if (
        Array.isArray(current) &&
        current.length === 1 &&
        Array.isArray(current[0])
      ) {
        current = current[0];
      } else {
        break;
      }
    }
    return current;
  };

  const unwrapList = (item: any, maxDepth = 5) => {
    let current = item;
    for (let i = 0; i < maxDepth; i++) {
      if (Array.isArray(current) && current.length === 1) {
        const inner = current[0];
        // If inner is array:
        if (Array.isArray(inner)) {
          // If inner is empty [], it's an empty list. Unwrap to it.
          if (inner.length === 0) {
            current = inner;
            continue;
          }
          // Check first element of inner to guess if inner is a List or a Tuple.
          const first = inner[0];

          // If first is Array (Tuple) or Object (Item), then inner is a List of Items.
          // So current is [List]. We MUST unwrap.
          if (
            Array.isArray(first) ||
            (typeof first === 'object' && first !== null)
          ) {
            current = inner;
            continue;
          }

          // If first is primitive (id), then inner is likely a Tuple Item.
          // So current is [Tuple]. We must NOT unwrap.
          return current;
        }

        // If inner is Object (Item), then current is [Item]. We must NOT unwrap.
        if (typeof inner === 'object' && inner !== null) {
          return current;
        }

        // If inner is primitive, continue unwrapping
        current = inner;
      } else {
        break;
      }
    }
    return current;
  };

  const processItem = (
    rawItem: any,
    defaultCategory: string,
    existingSettingsMap?: Record<string, any>,
  ) => {
    const item = unwrapItem(rawItem);

    // Case 1: Tuple [id, contentMap, episodes]
    if (Array.isArray(item) && item.length >= 2) {
      const id = item[0];
      const contentMap = item[1];
      const episodes = item[2];

      if (contentMap && typeof contentMap === 'object') {
        const entries = Object.entries(contentMap);
        if (entries.length > 0) {
          const [name, content] = entries[0];
          const category =
            defaultCategory !== '기타'
              ? defaultCategory
              : inferCategory(content);

          let original = (content as any)?.original || null;
          const newContent = (content as any)?.new || content;
          const reason =
            (content as any)?.reason || '설정 충돌이 감지되었습니다.';

          if (!original && existingSettingsMap && name) {
            const existing = existingSettingsMap[name];
            if (existing) {
              // If existing is an object with description, use it, otherwise use existing itself
              original = existing.description || existing;
              // If original is still an object with 'setting', use that
              if (
                original &&
                typeof original === 'object' &&
                original.setting
              ) {
                original = original.setting;
              }
            }
          }

          return {
            id,
            name,
            category,
            description:
              typeof newContent === 'string'
                ? newContent
                : JSON.stringify(cleanValue(newContent), null, 2),
            original: cleanValue(original),
            new: cleanValue(newContent),
            reason,
            episodes,
          };
        }
      }
    }

    // Case 3: Handle Conflict Object Structure (Name: Reason, 신규설정: ...)
    if ('신규설정' in item || '기존설정' in item) {
      const reservedKeys = [
        '신규설정',
        '기존설정',
        '분석',
        '이름',
        'id',
        'category',
      ];
      const nameKey = Object.keys(item).find((k) => !reservedKeys.includes(k));

      const category = item.category || defaultCategory;
      let entityName = item['이름'] || nameKey || 'Unknown';
      let analysisStr = '';

      // Try to find analysis string (Reason)
      if (item['분석']) {
        analysisStr = item['분석'];
      } else if (nameKey && typeof item[nameKey] === 'string') {
        analysisStr = item[nameKey];
      }

      const newSettings =
        item['신규설정'] ||
        (nameKey && item[nameKey] !== analysisStr ? item[nameKey] : null);
      // For original, first try explicit '기존설정', then fall back to existing map lookup
      let oldSettings = item['기존설정'];

      if (!oldSettings && existingSettingsMap && entityName) {
        const existing = existingSettingsMap[entityName];
        if (existing) {
          oldSettings = existing.description || existing;
          if (
            oldSettings &&
            typeof oldSettings === 'object' &&
            oldSettings.setting
          ) {
            oldSettings = oldSettings.setting;
          }
        }
      }

      // Parse analysis string: [결과: 충돌] [판단사유: ...]
      const resultMatch = analysisStr.match(/\[결과:\s*(.*?)\]/);
      const reasonMatch = analysisStr.match(/\[판단사유:\s*([\s\S]*?)\]/);
      const result = resultMatch ? resultMatch[1].trim() : '충돌';
      // If reason is captured, use it. Otherwise use the whole string.
      const reason = reasonMatch ? reasonMatch[1].trim() : analysisStr;

      return {
        id: item.id || `${category}-${entityName}`,
        name: entityName,
        category: category,
        reason: reason,
        original: cleanValue(oldSettings), // Use looked up original
        new: cleanValue(newSettings),
        result: result,
        rawAnalysis: analysisStr,
      };
    }

    // Case 2: Standard Object
    let name = item.name;
    let description = item.description || item.setting;
    const category = item.category || defaultCategory;

    if (!name) {
      const reservedKeys = ['ep_num', 'category', 'id', 'original', 'new'];
      const contentEntry = Object.entries(item).find(
        ([key]) => !reservedKeys.includes(key),
      );

      if (contentEntry) {
        name = contentEntry[0];
        const content = contentEntry[1];
        description =
          typeof content === 'string'
            ? content
            : JSON.stringify(cleanValue(content), null, 2);
      }
    }

    let original = item.original;
    if (!original && existingSettingsMap && name) {
      const existing = existingSettingsMap[name];
      if (existing) {
        original = existing.description || existing;
        if (original && typeof original === 'object' && original.setting) {
          original = original.setting;
        }
      }
    }

    return {
      ...cleanValue(item),
      category: category,
      name: name || 'Unknown',
      description: description || '',
      id: item.id || `${category}-${name}`,
      original: original || null,
    };
  };

  const normalize = (
    section: any,
    existingSettingsMap?: Record<string, any>,
  ) => {
    if (!section) return [];

    // 1. Handle if section is an array (e.g. "기존설정" list or "충돌" list)
    // Use unwrapList to preserve the list structure (don't unwrap [Tuple] to Tuple)
    let targetList = unwrapList(section);

    if (!Array.isArray(targetList)) {
      // If it's an object (keyed by category), flatten it
      if (targetList && typeof targetList === 'object') {
        return Object.entries(targetList).flatMap(([category, items]) => {
          if (!Array.isArray(items)) return [];
          return items.map((item) =>
            processItem(item, category, existingSettingsMap),
          );
        });
      }
      return [];
    }

    // It is an array. Map each item.
    return targetList.map((item: any) =>
      processItem(item, '기타', existingSettingsMap),
    );
  };

  // 1. Normalize '기존설정' first to create a lookup map
  const normalizedExisting = normalize(data['기존설정']);
  const existingMap: Record<string, any> = {};
  if (Array.isArray(normalizedExisting)) {
    normalizedExisting.forEach((item: any) => {
      if (item.name) existingMap[item.name] = item;
    });
  }

  return {
    충돌: normalize(data['충돌'], existingMap),
    '설정 결합': normalize(data['설정 결합'], existingMap),
    '신규 업로드': normalize(data['신규 업로드']),
    기존설정: normalizedExisting,
  };
};

const REVIEW_CATEGORIES = [
  { id: 'all', label: '전체', icon: LayoutGrid },
  { id: '인물', label: '인물', icon: User },
  { id: '장소', label: '장소', icon: MapPin },
  { id: '사건', label: '사건', icon: BookOpen },
  { id: '집단', label: '집단', icon: Users },
  { id: '세계', label: '세계', icon: Globe },
  { id: '아이템', label: '아이템', icon: Box },
];

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

  const [reviewCategory, setReviewCategory] = useState<string>('all');

  // Reset create work form when opened
  useEffect(() => {
    if (isCreateWorkOpen) {
      setNewWorkTitle('');
      setNewWorkSynopsis('');
      setNewWorkGenre('');
      setNewWorkCover('');
    }
  }, [isCreateWorkOpen]);

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
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
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
      // Inject name if missing in content but present in item (Pre-fill)
      if (
        typeof content === 'object' &&
        !content.name &&
        !content.keyword &&
        item.name
      ) {
        content.name = item.name;
      }
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
        // Helper to update name/title if present in content
        const updateName = (target: any, source: any) => {
          const newName = source.name || source.keyword || source.title;
          if (newName) {
            target.name = newName;
            if (target.keyword) target.keyword = newName;
          }
          return target;
        };

        if (tabKey === '설정 결합') {
          items[idx] = { ...items[idx], new: content };
          updateName(items[idx], content);
        } else {
          items[idx] = { ...items[idx], ...content };
          updateName(items[idx], content);
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
        selectedManuscript.workId,
        selectedManuscript.episode,
        selectedManuscript.subtitle,
      );
    },
    onSuccess: (data) => {
      if (data) {
        // Handle both wrapped 'check' property and direct map response
        const checkData = (data as any).check || data;
        setExtractedKeywords(checkData);
        setIsKeywordSelectionOpen(true);
        // Select all keywords by default
        setSelectedKeywords(checkData);
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
      return authorService.analyzeManuscript(
        integrationId,
        work.title,
        work.id,
        selectedKeywords as any,
      );
    },
    onSuccess: (data) => {
      if (data) {
        setSettingBookDiff(normalizeAnalysisData(data));
        setIsKeywordSelectionOpen(false);
        setIsFinalReviewOpen(true);

        if (selectedManuscript) {
          setProcessingStatus((prev) => ({
            ...prev,
            [selectedManuscript.id]: 'REVIEW_READY',
          }));
          setAnalysisResults((prev) => ({
            ...prev,
            [selectedManuscript.id]: data,
          }));

          // Optimistically update selectedManuscript to readOnly
          setSelectedManuscript((prev) =>
            prev ? { ...prev, readOnly: true } : null,
          );

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: [
              'author',
              'manuscript',
              selectedWorkId,
              selectedManuscript.id,
            ],
          });
          queryClient.invalidateQueries({ queryKey: ['author', 'works'] });
        }
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

  // Rename Manuscript Mutation (Inline)
  const renameManuscriptMutation = useMutation({
    mutationFn: async ({
      workId,
      manuscriptId,
      subtitle,
    }: {
      workId: number;
      manuscriptId: number;
      subtitle: string;
    }) => {
      const work = works?.find((w) => w.id === workId);
      if (!work) throw new Error('Work not found');

      // Assuming we keep the existing episode number
      // We need to fetch the manuscript to get the episode number if the API requires it
      // For now, let's assume updateManuscript allows partial updates or we just send what we have.
      // The service definition: updateManuscript: async (..., data: { subtitle?: string; epNum?: number })
      // So sending just subtitle is fine.
      return authorService.updateManuscript(
        integrationId,
        work.title,
        manuscriptId,
        {
          subtitle,
        },
      );
    },
    onSuccess: (_, variables) => {
      // toast.success('원문 이름이 변경되었습니다.'); // User might want silent update, but success feedback is usually good.
      // "화면 상에서는 사용자가 알아채지 못하도록 반짝임 같은 게 없어야 해" refers to the list refresh flickering.
      // React Query's invalidateQueries usually handles this gracefully if keys match.
      const work = works?.find((w) => w.id === variables.workId);
      if (work) {
        queryClient.invalidateQueries({
          queryKey: ['author', 'manuscript', integrationId, work.title],
        });
      }
    },
    onError: () => {
      toast.error('원문 이름 변경에 실패했습니다.');
    },
  });

  const handleRenameManuscript = (
    workId: number,
    manuscriptId: number,
    newTitle: string,
  ) => {
    renameManuscriptMutation.mutate({
      workId,
      manuscriptId,
      subtitle: newTitle,
    });
  };

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
    mutationFn: async (options?: { silent?: boolean }) => {
      if (!selectedWorkId || !selectedManuscript) return;
      const work = works?.find((w) => w.id === selectedWorkId);
      if (!work) return;

      // Use updateManuscriptContent to update content via PATCH
      await authorService.updateManuscriptContent(integrationId, work.title, {
        workId: selectedWorkId,
        episode: selectedManuscript.episode,
        subtitle: selectedManuscript.subtitle || '',
        txt: editorContent,
      });
    },
    onSuccess: (_, variables) => {
      if (!variables?.silent) {
        toast.success('저장되었습니다.');
      }
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
        txt,
      });
    },
    onSuccess: async (_, variables) => {
      toast.success('원문이 등록되었습니다.');
      setIsUploadManuscriptOpen(false);
      setNewManuscriptSubtitle('');
      setNewManuscriptEpisode(1);
      const work = works?.find((w) => w.id === variables.workId);
      if (work) {
        // Automatically update status to ONGOING if it is NEW
        if (work.status === 'NEW') {
          try {
            await authorService.updateWorkStatus(work.id, 'ONGOING');
          } catch (e) {
            console.error('Failed to auto-update work status', e);
          }
        }

        queryClient.invalidateQueries({
          queryKey: ['author', 'manuscript', integrationId, work.title],
        });
        queryClient.invalidateQueries({ queryKey: ['author', 'works'] });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || '';
      if (message.includes('분석이 완료되지 않아')) {
        toast.error('이전 원고의 분석을 먼저 수행해주세요.');
      } else {
        toast.error('원문 등록에 실패했습니다.');
      }
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
          saveMutation.mutate({});
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

  const handleUploadManuscript = (workId: number, nextEpisode?: number) => {
    // Use setTimeout to avoid conflict with ContextMenu closing
    setTimeout(() => {
      setUploadManuscriptWorkId(workId);
      setNewManuscriptSubtitle('');
      setNewManuscriptEpisode(nextEpisode || 1);
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
      if (!confirm('작성 중인 내용이 저장되지 않았습니다. 저장하시겠습니까?')) {
        return;
      }
      try {
        await saveMutation.mutateAsync({ silent: true });
      } catch {
        return;
      }
    }

    const status = processingStatus[selectedManuscript.id];

    if (status === 'ANALYZING') {
      toast.info('AI 서버 준비 중입니다. 서버 가동 후 분석을 시작할게요.');
      return;
    }

    if (status === 'REVIEW_READY') {
      const result = analysisResults[selectedManuscript.id];
      if (result) {
        setSettingBookDiff(normalizeAnalysisData(result));
        setIsFinalReviewOpen(true);
        setIsFinalReviewConfirmed(false);
      } else {
        toast.error('분석 결과를 찾을 수 없습니다. 다시 시도해주세요.');
      }
      return;
    }

    // Start extraction immediately (no confirmation dialog as requested for smoother flow)
    if (selectedManuscript) {
      setProcessingStatus((prev) => ({
        ...prev,
        [selectedManuscript.id]: 'EXTRACTING',
      }));
    }

    toast.info('AI가 원문을 분석하여 키워드를 추출하고 있습니다...');
    keywordExtractionMutation.mutate();
  };

  const handleOpenReview = (workId: number, manuscript: ManuscriptDto) => {
    // Manuscript doesn't have isReadOnly check yet, assuming it can be reviewed
    // If it's in REVIEW_READY state, open it
    const status = processingStatus[manuscript.id];
    if (status === 'REVIEW_READY') {
      const result = analysisResults[manuscript.id];
      if (result) {
        setSettingBookDiff(normalizeAnalysisData(result));
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
      <div className="flex flex-col gap-1">
        <span className="font-bold">설정집 분석 시작</span>
        <span className="text-xs">
          AI가 선택된 키워드를 기반으로 상세 설정을 분석하고 있습니다. (예상
          소요시간: 30초)
        </span>
      </div>,
      { duration: 4000 },
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
      if (!selectedWorkId || !selectedManuscript || !settingBookDiff) {
        console.error('DEBUG: Missing required state', {
          selectedWorkId,
          selectedManuscript,
          settingBookDiff,
        });
        return;
      }

      const work = works?.find((w) => w.id === selectedWorkId);
      if (!work) {
        console.error('DEBUG: Work not found for id', selectedWorkId);
        return;
      }

      // For now, we simulate success to allow the flow to complete.

      // Helper function to reconstruct the setting object structure
      const reconstructSection = (sectionItems: any[]) => {
        if (!sectionItems || sectionItems.length === 0) return [];

        const grouped: Record<string, any[]> = {};

        sectionItems.forEach((item) => {
          const category = item.category;
          const keyword = item.name;

          // Find setting data logic (reused)
          let settingData = item[keyword];
          if (!settingData) {
            if (item.new) {
              settingData = item.new;
            } else {
              const reservedKeys = [
                'ep_num',
                'category',
                'id',
                'original',
                'new',
                'name',
                'description',
              ];
              const contentEntry = Object.entries(item).find(
                ([k]) => !reservedKeys.includes(k),
              );
              if (contentEntry) settingData = contentEntry[1];
            }
          }
          if (!settingData && item.description) {
            settingData = item.description;
          }

          if (!grouped[category]) {
            grouped[category] = [];
          }

          // Construct the item object: { [keyword]: settingData, ep_num: ... }
          grouped[category].push({
            [keyword]: settingData,
            ep_num: item.ep_num || [selectedManuscript.episode],
          });
        });

        return grouped;
      };

      try {
        const finalSetting = {
          '설정 결합': reconstructSection(
            Array.isArray(settingBookDiff['설정 결합'])
              ? settingBookDiff['설정 결합']
              : [],
          ),
          '신규 업로드': reconstructSection(
            Array.isArray(settingBookDiff['신규 업로드'])
              ? settingBookDiff['신규 업로드']
              : [],
          ),
        };

        const req: LorebookConflictSolveRequestDto = {
          setting: finalSetting,
          episodes: selectedManuscript.id,
        };

        console.log('DEBUG: Sending conflict solve req:', req);

        await authorService.saveAfterConflict(
          integrationId,
          work.title,
          selectedWorkId,
          req,
        );
        console.log('DEBUG: Conflict solve save success');
      } catch (e) {
        console.error('Failed to save conflict solve:', e);
        toast.error('설정집 업데이트에 실패했습니다.');
        return; // Exit on error
      }
    },
    onSuccess: () => {
      setIsPublishSuccess(true);
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

      // Invalidate queries to refresh UI
      if (selectedWorkId) {
        const work = works?.find((w) => w.id === selectedWorkId);
        if (work) {
          queryClient.invalidateQueries({
            queryKey: ['author', 'manuscript', integrationId, work.title],
          });
          queryClient.invalidateQueries({
            queryKey: ['author', 'lorebook', integrationId, work.title],
          });
        }
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
  // Loading Timer State
  const [elapsedTime, setElapsedTime] = useState(0);
  const isGlobalLoading =
    keywordExtractionMutation.isPending || analysisMutation.isPending;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGlobalLoading) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGlobalLoading]);

  const handleCloseFinalReview = () => {
    setIsFinalReviewOpen(false);
    // Reset workflow to initial state
    setExtractedKeywords(null);
    setSelectedKeywords({});
    setIsKeywordSelectionConfirmed(false);
    setSettingBookDiff(null);
    setResolvedConflicts(new Set());
    setEditingItems(new Set());
    setEditingContent({});

    if (selectedManuscript) {
      setProcessingStatus((prev) => {
        const next = { ...prev };
        delete next[selectedManuscript.id];
        return next;
      });
      setAnalysisResults((prev) => {
        const next = { ...prev };
        delete next[selectedManuscript.id];
        return next;
      });

      // Revert readOnly if not published successfully
      if (!isPublishSuccess) {
        setSelectedManuscript((prev) =>
          prev && prev.readOnly ? { ...prev, readOnly: false } : prev,
        );
      }
    }
    // Reset success flag for next time
    setIsPublishSuccess(false);
  };

  return (
    <div className="h-[calc(100vh-6rem)] -m-4 bg-background overflow-hidden relative">
      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6 p-8 rounded-xl shadow-2xl bg-card border border-border max-w-sm w-full mx-4">
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute w-full h-full rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]"></div>
              <div className="absolute w-full h-full rounded-full border-4 border-t-primary animate-spin"></div>
              <span className="text-xl font-bold font-mono text-primary">
                {elapsedTime}s
              </span>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI 분석 중...
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                작품의 세계를 탐험하고 있습니다.
                <br />
                잠시만 기다려주세요.
              </p>
            </div>
          </div>
        </div>
      )}

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
                onRenameManuscript={handleRenameManuscript}
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
                      <span className="text-xs text-orange-500 dark:text-orange-400 font-normal">
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
                {selectedManuscript &&
                  !selectedManuscript.readOnly &&
                  processingStatus[selectedManuscript.id] !==
                    'REVIEW_READY' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveMutation.mutate({})}
                        disabled={!isDirty || saveMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        저장
                      </Button>
                      {processingStatus[selectedManuscript.id] ===
                      'ANALYZING' ? (
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
                    readOnly={selectedManuscript?.readOnly}
                    className={cn(
                      'w-full h-full resize-none border-none focus-visible:ring-0 p-8 text-lg leading-relaxed font-serif overflow-y-auto',
                      selectedManuscript?.readOnly &&
                        'bg-muted text-muted-foreground cursor-not-allowed',
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
              <Label>장르 (선택)</Label>
              <Input
                value={newWorkGenre}
                onChange={(e) => setNewWorkGenre(e.target.value)}
                placeholder="예: 판타지, 로맨스"
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
          {analysisMutation.isPending ? (
            <div className="h-[60vh] relative">
              <GlobalLoadingOverlay isVisible={true} />
            </div>
          ) : (
            <>
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
                                  handleCategoryToggle(
                                    category,
                                    checked === true,
                                  )
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
                        !isKeywordSelectionConfirmed ||
                        analysisMutation.isPending
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
            </>
          )}
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
                <Input value={editMetadataTitle} disabled />
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
      <Dialog
        open={isFinalReviewOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsFinalReviewOpen(true);
          } else {
            handleCloseFinalReview();
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col p-0 gap-0 rounded-xl border shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b bg-background z-10">
            <DialogTitle>설정집 변경 사항 확인 (최종 검수)</DialogTitle>
            <DialogDescription>
              AI가 생성한 설정집 변경 사항을 확인하세요. 충돌 항목은 반드시
              검토가 필요합니다.
            </DialogDescription>
            <div className="pt-4 flex items-center gap-2">
              {/* Filter moved to inside tabs */}
            </div>
          </DialogHeader>

          <Tabs
            defaultValue="충돌"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 shrink-0 bg-background border-b z-10">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="충돌"
                  className="data-[state=active]:text-red-600 data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-900/20 dark:data-[state=active]:text-red-400"
                >
                  충돌 ({extractConflictItems(settingBookDiff?.['충돌']).length}
                  )
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
                let rawItems: any[] = [];
                if (tabKey === '충돌') {
                  rawItems = extractConflictItems(settingBookDiff?.['충돌']);
                } else {
                  rawItems =
                    (settingBookDiff?.[
                      tabKey as keyof PublishAnalysisResponseDto
                    ] as any[]) || [];
                }

                const items = rawItems.filter(
                  (item) =>
                    reviewCategory === 'all' ||
                    item.category === reviewCategory,
                );
                const hasItems = items.length > 0;

                return (
                  <TabsContent
                    key={tabKey}
                    value={tabKey}
                    className="mt-0 space-y-8"
                  >
                    <div className="flex items-center gap-2 mb-4 px-1 overflow-x-auto pb-2 scrollbar-hide">
                      {REVIEW_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = reviewCategory === cat.id;
                        return (
                          <Button
                            key={cat.id}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                              'h-8 rounded-full flex items-center gap-1.5 transition-all',
                              isSelected
                                ? 'shadow-md'
                                : 'text-muted-foreground bg-transparent border-dashed hover:border-solid',
                            )}
                            onClick={() => setReviewCategory(cat.id)}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-xs">{cat.label}</span>
                          </Button>
                        );
                      })}
                    </div>
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
                                    <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                                      {item.name}
                                      {item.result && (
                                        <Badge
                                          variant="outline"
                                          className="text-red-600 border-red-200 bg-red-50"
                                        >
                                          {item.result}
                                        </Badge>
                                      )}
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
                                        <div className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-bold rounded">
                                          CONFLICT
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Conflict Reason Box */}
                                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-lg flex items-start gap-3 text-sm animate-in fade-in zoom-in-95 duration-200">
                                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-1">
                                      <span className="font-bold text-red-700 dark:text-red-300">
                                        판단 사유
                                      </span>
                                      <p className="text-red-600 dark:text-red-400 leading-relaxed break-keep">
                                        {item.reason}
                                      </p>
                                    </div>
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
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
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
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                                  <div className="grid grid-cols-2 gap-4 h-auto min-h-[16rem]">
                                    <div className="flex flex-col border rounded-md overflow-hidden opacity-60 pointer-events-none">
                                      <div className="bg-muted/50 p-2 text-xs font-semibold border-b text-muted-foreground">
                                        Original (Read-only)
                                      </div>
                                      <div className="p-3 overflow-y-auto flex-1 text-sm bg-muted/10">
                                        <SettingViewer data={item.original} />
                                      </div>
                                    </div>
                                    <div className="flex flex-col border rounded-md overflow-hidden ring-2 ring-primary/20 bg-card">
                                      <div className="bg-primary/10 p-2 text-xs font-semibold border-b text-primary flex justify-between">
                                        <span>Editing...</span>
                                      </div>
                                      <div className="p-4 overflow-y-auto flex-1">
                                        <DynamicSettingEditor
                                          data={
                                            typeof currentContent === 'string'
                                              ? JSON.parse(currentContent)
                                              : currentContent
                                          }
                                          category={item.category}
                                          onChange={(newData) =>
                                            setEditingContent((prev) => ({
                                              ...prev,
                                              [item.id]: newData,
                                            }))
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-4 h-64">
                                    <div className="flex flex-col border rounded-md overflow-hidden bg-muted/20">
                                      <div className="bg-muted/50 p-2 text-xs font-semibold border-b text-muted-foreground">
                                        Original
                                      </div>
                                      <div className="p-3 overflow-y-auto flex-1 text-sm bg-card/50">
                                        <SettingViewer data={item.original} />
                                      </div>
                                    </div>
                                    <div className="flex flex-col border rounded-md overflow-hidden ring-1 ring-primary/20 bg-primary/5">
                                      <div className="bg-primary/10 p-2 text-xs font-semibold border-b text-primary">
                                        Updated
                                      </div>
                                      <div className="p-3 overflow-y-auto flex-1 text-sm">
                                        <SettingViewer data={currentContent} />
                                      </div>
                                    </div>
                                  </div>
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
                                  <div className="bg-muted/30 p-4 rounded-lg border border-muted/50">
                                    <DynamicSettingEditor
                                      data={currentContent.description}
                                      category={item.category}
                                      onChange={(newData) =>
                                        setEditingContent((prev) => ({
                                          ...prev,
                                          [item.id]: {
                                            ...currentContent,
                                            description:
                                              JSON.stringify(newData),
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                ) : (
                                  <div className="bg-muted/30 p-5 rounded-lg border border-muted/50">
                                    <SettingViewer data={item.description} />
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
            {((settingBookDiff?.['충돌'] as any[])?.filter(
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
                  <Button variant="outline" onClick={handleCloseFinalReview}>
                    닫기
                  </Button>
                </div>
              </div>
            ) : (
              // Non-Conflict State (All resolved or none existed)
              <div className="flex flex-col gap-4 w-full">
                {/* Only show success message if there were conflicts initially */}
                {((settingBookDiff?.['충돌'] as any[])?.length || 0) > 0 &&
                  ((settingBookDiff?.['충돌'] as any[])?.filter(
                    (c: any) => !resolvedConflicts.has(c.id),
                  ).length || 0) === 0 && (
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
                  )}
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
                    <Button variant="ghost" onClick={handleCloseFinalReview}>
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
              원문의 이름(부제)을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
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
              className="bg-destructive hover:bg-destructive/90"
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
