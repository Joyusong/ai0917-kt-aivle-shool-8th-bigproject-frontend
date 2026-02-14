import { useState, useEffect } from 'react';
import {
  Users,
  Globe,
  BookOpen,
  Plus,
  Settings,
  Download,
  MapPin,
  Package,
  Users2,
  Search,
  Edit,
  Trash2,
  Loader2,
  Network,
  BarChart3,
} from 'lucide-react';
import { WorkAnalysisModal } from './WorkAnalysisModal';
import { DynamicSettingEditor } from '../../../components/dashboard/author/DynamicSettingEditor';
import { LorebookCard } from '../../../components/dashboard/author/LorebookCard';
import { getTagsForItem } from '../../../utils/lorebookUtils';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { cn } from '../../../components/ui/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';
import { toast } from 'sonner';
import { AnalysisResultModal } from './AnalysisResultModal';
import { Checkbox } from '../../../components/ui/checkbox';

interface AuthorLorebookPanelProps {
  workId: number;
  userId: string;
  className?: string;
}

type Category = 'all' | '인물' | '장소' | '물건' | '집단' | '세계' | '사건';

const toBackendCategory = (cat: string): string => {
  const map: Record<string, string> = {
    all: '*',
    인물: '인물',
    장소: '장소',
    물건: '물건',
    집단: '집단',
    세계: '세계',
    사건: '사건',
    전체: '*',
  };
  return map[cat] || cat;
};

export function AuthorLorebookPanel({
  workId,
  userId,
  className,
}: AuthorLorebookPanelProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('인물');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<Category>('all');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // If null, it's create mode
  const [editorData, setEditorData] = useState<any>({});

  // Similarity Check States
  const [isSimilarityCheckOpen, setIsSimilarityCheckOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<any>(null);
  const [similaritySearchResults, setSimilaritySearchResults] = useState<any[]>(
    [],
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);

  // Analysis State
  const [isAnalysisResultModalOpen, setIsAnalysisResultModalOpen] =
    useState(false);
  const [isWorkAnalysisModalOpen, setIsWorkAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const queryClient = useQueryClient();

  // Fetch Lorebook/Work details
  const { data: work } = useQuery({
    queryKey: ['author', 'work', workId],
    queryFn: () => authorService.getWorkDetail(workId.toString()),
  });

  // Fetch Manuscript count (Re장소 Episode count)
  const { data: manuscriptsPage } = useQuery({
    queryKey: ['author', 'manuscripts', workId],
    queryFn: () =>
      authorService.getManuscripts(userId, work!.title, 0, 1000, workId), // Fetch mostly all to count
    enabled: !!work?.title && !!userId,
  });
  const manuscriptCount = manuscriptsPage?.totalElements || 0;

  // Fetch Data based on category (Unified)
  const { data: lorebooksData } = useQuery({
    queryKey: ['author', 'lorebook', userId, work?.title, activeCategory],
    queryFn: () => {
      if (activeCategory === 'all') {
        // For display, use default pagination or small size if needed, but here we just fetch
        return authorService.getLorebooks(userId, work!.title, workId);
      }
      return authorService.getLorebooksByCategory(
        userId,
        work!.title,
        activeCategory,
        workId,
      );
    },
    enabled: !!work?.title && !!userId,
  });

  // Fetch ALL Data for Counts (size=1000 to ensure we get all for counting)
  const { data: allLorebooksData } = useQuery({
    queryKey: ['author', 'lorebook', userId, work?.title, 'all', 'counts'],
    queryFn: () =>
      authorService.getLorebooks(userId, work!.title, workId, 0, 1000),
    enabled: !!work?.title && !!userId,
  });

  const allLorebooks =
    allLorebooksData?.content ||
    (Array.isArray(allLorebooksData) ? allLorebooksData : []) ||
    [];

  const categoryCounts = allLorebooks.reduce(
    (acc: any, item: any) => {
      let cat = item.category || '미분류';
      // Normalize category names if backend returns English or different variations
      if (cat === 'Place' || cat === 'place') cat = '장소';
      else if (cat === 'Person' || cat === 'person' || cat === 'Character')
        cat = '인물';
      else if (cat === 'Item' || cat === 'item' || cat === 'Object')
        cat = '물건';
      else if (
        cat === 'Organization' ||
        cat === 'Group' ||
        cat === 'group' ||
        cat === 'organization'
      )
        cat = '집단';
      else if (cat === 'World' || cat === 'Setting') cat = '세계';
      else if (cat === 'Event' || cat === 'Incident') cat = '사건';

      acc[cat] = (acc[cat] || 0) + 1;
      acc['all'] = (acc['all'] || 0) + 1;
      return acc;
    },
    { all: 0 },
  );

  const lorebooks =
    (lorebooksData?.content
      ? lorebooksData.content
      : Array.isArray(lorebooksData)
        ? lorebooksData
        : []) || [];

  const displayItems =
    lorebooks
      .filter(
        (item: any, index: number, self: any[]) =>
          index === self.findIndex((t) => t.id === item.id),
      )
      .map((item: any) => {
        let parsedSettings: any = {};
        try {
          // item.setting is JsonNode (any), which can be an object or a JSON string depending on serialization
          if (item.setting && typeof item.setting === 'object') {
            parsedSettings = item.setting;
          } else if (typeof item.setting === 'string') {
            parsedSettings = JSON.parse(item.setting);
          }
        } catch (e) {
          console.error('Failed to parse settings', e);
        }

        // Handle nested structure: { "Keyword": { ... } }
        let content = parsedSettings;
        const keyword = item.keyword;
        if (keyword && parsedSettings[keyword]) {
          content = parsedSettings[keyword];
        }

        // Handle Event type where content is a string
        let description = '';
        if (typeof content === 'string') {
          description = content;
        } else {
          const descField =
            content.description ||
            content.배경 ||
            content.summary ||
            content.상세설명 ||
            content.설명 || // Added for Item type
            content.작중묘사; // Added for Place type

          if (Array.isArray(descField)) {
            description = descField.join(' ');
          } else if (typeof descField === 'string') {
            description = descField;
          }
        }

        return {
          ...item,
          name: keyword || '',
          title: keyword || '',
          description,
          ...(typeof content === 'object' ? content : {}),
        };
      }) || [];

  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const { name, title, description, subtitle, episode, ...rest } = data;
      const lorebookTitle = name || title;

      // Wrap dynamic fields into a 'settings' JSON string as expected by Backend DTO
      const settingObj = {
        [lorebookTitle]: {
          description: description,
          ...rest,
        },
      };

      const payload = {
        keyword: lorebookTitle,
        subtitle: subtitle || '',
        category: toBackendCategory(activeCategory),
        settings: JSON.stringify(settingObj),
        episode: episode,
      };

      return authorService.createLorebookSpecific(
        userId,
        work!.title,
        workId,
        payload,
      );
    },
    onSuccess: () => {
      toast.success('설정집이 생성되었습니다.');
      setIsEditOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['author', 'lorebook', userId, work?.title, activeCategory],
      });
      // Also invalidate 'all' for counts
      queryClient.invalidateQueries({
        queryKey: ['author', 'lorebook', userId, work?.title, 'all'],
      });
    },
    onError: (error: any) => {
      console.error(error);
      const msg = error?.response?.data?.message || '생성에 실패했습니다.';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      const { name, title, description, subtitle, category, episode, ...rest } =
        data;
      const lorebookTitle = name || title;

      // Wrap dynamic fields into a 'settings' JSON string as expected by Backend DTO
      const settingObj = {
        [lorebookTitle]: {
          description: description,
          ...rest,
        },
      };

      const payload = {
        category: category,
        keyword: lorebookTitle,
        subtitle: subtitle || '',
        settings: JSON.stringify(settingObj),
        episode: episode,
      };

      // Use item's category if activeCategory is 'all', otherwise use activeCategory
      const categoryToUse =
        activeCategory === 'all' && editingItem?.category
          ? editingItem.category
          : activeCategory;

      return authorService.updateLorebookSpecific(
        userId,
        work!.title,
        toBackendCategory(categoryToUse),
        id.toString(),
        work!.id,
        payload,
      );
    },
    onSuccess: () => {
      toast.success('설정집이 수정되었습니다.');
      setIsEditOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['author', 'lorebook', userId, work?.title, activeCategory],
      });
      // Also invalidate 'all' for counts
      queryClient.invalidateQueries({
        queryKey: ['author', 'lorebook', userId, work?.title, 'all'],
      });
    },
    onError: () => toast.error('수정에 실패했습니다.'),
  });

  const handleCreateClick = () => {
    setEditingItem({});
    setEditorData({});
    setIsEditOpen(true);
  };

  const handleEditClick = (item: any) => {
    setEditingItem({ ...item });
    setEditorData({ ...item });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCharacterAnalysis = async (characterName: string) => {
    setIsAnalyzing(true);
    setIsAnalysisResultModalOpen(true);
    setAnalysisResult('');

    try {
      const data = await authorService.analyzeRelationship(
        workId,
        userId,
        characterName,
      );
      // Sanitize Mermaid code to handle special characters in labels
      const sanitizedData =
        typeof data === 'string'
          ? data.replace(/((?:--|==|-.|~~)[>])\|([^"|\n]+)\|/g, '$1|"$2"|')
          : data;
      setAnalysisResult(sanitizedData);
    } catch (error) {
      console.error(error);
      toast.error('인물 관계도 분석에 실패했습니다.');
      setIsAnalysisResultModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      authorService.deleteLorebook(userId, work!.title, activeCategory, id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['author', 'lorebook', userId, work?.title, activeCategory],
      });
      // Also invalidate 'all' for counts
      queryClient.invalidateQueries({
        queryKey: ['author', 'lorebook', userId, work?.title, 'all'],
      });
    },
    onError: () => toast.error('삭제에 실패했습니다.'),
  });

  const searchMutation = useMutation({
    mutationFn: ({ category, query }: { category: string; query: string }) =>
      authorService.searchLorebookSimilarity(userId, work!.title, {
        category: toBackendCategory(category) as any,
        user_query: query,
        user_id: userId,
        work_id: workId,
        sim: 0.1, // Lower threshold
        limit: 5, // Default topK
      }),
    onSuccess: (data) => {
      // Transform tuple data to object
      // Data format: [[id, category, settingObj, episodes, score], ...]
      if (!Array.isArray(data)) {
        setSearchResults([]);
        return;
      }

      const transformed = data.map((item: any) => {
        let id, category, setting, episodes, score;

        if (Array.isArray(item)) {
          [id, category, setting, episodes, score] = item;
        } else {
          // Handle object response
          ({ id, category, setting, episodes, score } = item);
          // Fallback for score if named differently
          if (score === undefined) {
            score = item.similarity || item.sim || item.distance || item.score;
          }
        }

        try {
          if (typeof setting === 'string') {
            setting = JSON.parse(setting);
          }
        } catch (e) {
          console.error('Failed to parse setting JSON', e);
        }

        // Extract keyword/title from setting object keys
        // setting is like { "강 팀장": { ... } }
        let keyword = '';
        let content: any = {};

        if (setting && typeof setting === 'object') {
          const keys = Object.keys(setting);
          if (keys.length > 0) {
            keyword = keys[0];
            content = setting[keyword] || {};
          }
        }

        // Handle description
        let description = '';
        if (typeof content === 'string') {
          description = content;
        } else if (content) {
          description =
            content.description ||
            content.summary ||
            content.설명 ||
            content.상세설명 ||
            content.배경 ||
            content.외형 ||
            '';
        }

        return {
          id,
          category,
          keyword: keyword || '제목 없음',
          name: keyword || '제목 없음', // For LorebookCard title
          title: keyword || '제목 없음',
          description,
          setting,
          score,
          ...content, // Spread content for getTagsForItem
        };
      });

      setSearchResults(transformed);
    },
    onError: () => toast.error('검색에 실패했습니다.'),
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (searchMutation.isPending) {
      setSearchTimer(0);
      interval = setInterval(() => {
        setSearchTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTimer(0);
    }
    return () => clearInterval(interval);
  }, [searchMutation.isPending]);

  const checkSimilarityMutation = useMutation({
    mutationFn: ({ category, query }: { category: string; query: string }) =>
      authorService.searchLorebookSimilarity(userId, work!.title, {
        category: toBackendCategory('all') as any, // Always check against all
        user_query: query,
        user_id: userId,
        work_id: workId,
        sim: 0.6,
        limit: 5,
      }),
    onSuccess: (data) => {
      setSimilaritySearchResults(data);
      setIsSimilarityCheckOpen(true);
      setIsConfirmed(false);
    },
    onError: () => toast.error('유사도 검사에 실패했습니다.'),
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      // Fetch all lorebooks using wildcard '*' to ensure full export
      const response = await authorService.getLorebooks(
        userId,
        work!.title,
        workId,
        0,
        1000,
      );

      let items: any[] = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (
        (response as any)?.content &&
        Array.isArray((response as any).content)
      ) {
        items = (response as any).content;
      } else if (
        (response as any)?.data &&
        Array.isArray((response as any).data)
      ) {
        items = (response as any).data;
      }

      if (items.length === 0) {
        throw new Error('NO_DATA');
      }

      let md = `# ${work?.title || '작품'} 설정집\n\n`;
      md += `> 생성일: ${new Date().toLocaleDateString()}\n\n`;

      // Table of Contents
      md += `## 목차\n`;
      const categoryOrder = [
        '인물',
        '장소',
        '물건',
        '집단',
        '세계',
        '사건',
        '미분류',
      ];

      // Group by category
      const grouped: Record<string, any[]> = {};
      items.forEach((item: any) => {
        const cat = item.category || '미분류';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      const sortedCategories = Object.keys(grouped).sort((a, b) => {
        const idxA = categoryOrder.indexOf(a);
        const idxB = categoryOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });

      sortedCategories.forEach((cat) => {
        md += `- [${cat}](#${cat})\n`;
      });
      md += `\n---\n\n`;

      sortedCategories.forEach((cat) => {
        md += `## ${cat}\n\n`;
        grouped[cat].forEach((item) => {
          let settings: any = {};
          try {
            if (typeof item.setting === 'object') settings = item.setting;
            else if (typeof item.setting === 'string')
              settings = JSON.parse(item.setting);
          } catch (e) {}

          // If nested keyword structure
          if (item.keyword && settings[item.keyword]) {
            settings = settings[item.keyword];
          }

          md += `### ${item.keyword || '제목 없음'}\n`;
          if (item.subtitle) md += `**부제**: ${item.subtitle}\n\n`;

          if (typeof settings === 'string') {
            md += `> ${settings}\n\n`;
          } else {
            // Add description/summary first
            const desc =
              settings.description ||
              settings.summary ||
              settings.설명 ||
              settings.상세설명;
            if (desc) md += `> ${desc}\n\n`;

            // Add other fields
            Object.entries(settings).forEach(([key, value]) => {
              if (
                [
                  'description',
                  'summary',
                  '설명',
                  '상세설명',
                  'name',
                  'title',
                  'keyword',
                ].includes(key)
              )
                return;

              md += `- **${key}**: `;

              if (Array.isArray(value)) {
                if (value.length === 0) {
                  md += '(없음)\n';
                } else if (typeof value[0] !== 'object') {
                  md += `${value.join(', ')}\n`;
                } else {
                  md += '\n';
                  value.forEach((subItem: any) => {
                    // Special handling for relationships (인물관계)
                    if (key === '인물관계' || key === 'relationships') {
                      const relation = subItem.관계 || subItem.relation || '';
                      const target =
                        subItem.대상이름 || subItem.targetName || '';
                      const detail =
                        subItem.상세내용 || subItem.description || '';
                      md += `  - **${target}**`;
                      if (relation) md += ` (${relation})`;
                      if (detail) md += `: ${detail}`;
                      md += '\n';
                    } else {
                      // Generic object array
                      md += `  - `;
                      const parts: string[] = [];
                      Object.entries(subItem).forEach(([k, v]) => {
                        if (v) parts.push(`${k}: ${v}`);
                      });
                      md += parts.join(', ') + '\n';
                    }
                  });
                }
              } else if (typeof value === 'object' && value !== null) {
                md += '\n';
                Object.entries(value).forEach(([subKey, subValue]) => {
                  md += `  - **${subKey}**: ${subValue}\n`;
                });
              } else {
                md += `${value}\n`;
              }
            });
          }

          md += `\n---\n\n`;
        });
      });

      return md;
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(
        new Blob([data], { type: 'text/markdown' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${work?.title || 'work'}_설정집.md`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('설정집이 Markdown으로 다운로드되었습니다.');
    },
    onError: (error) => {
      if (error.message === 'NO_DATA') {
        toast.error('내보낼 설정 데이터가 없습니다.');
      } else {
        toast.error('내보내기에 실패했습니다.');
      }
    },
  });

  const handleExport = () => {
    if (confirm('설정집을 Markdown 파일로 다운로드하시겠습니까?')) {
      exportMutation.mutate();
    }
  };

  // Update searchCategory when activeCategory changes, but only if search is not open (optional, but good UX)
  // Actually, let's just init it when opening or let user change it.

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    searchMutation.mutate({ category: searchCategory, query: searchQuery });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Always use editorData as it is now updated in real-time for all categories
    let data = { ...editorData };

    // Process tags/arrays (Legacy support for other categories)
    if (activeCategory === '집단' && typeof data.members === 'string') {
      data.members = data.members.split(',').map((s: string) => s.trim());
    }
    if (activeCategory === '사건' && typeof data.participants === 'string') {
      data.participants = data.participants
        .split(',')
        .map((s: string) => s.trim());
    }

    setPendingSaveData(data);

    // Perform Similarity Check집단 before saving
    // Use name or title or description as query
    // const query = data.name || data.title || data.description || '';
    // checkSimilarityMutation.mutate({ category: 'all', query });

    // Bypass Similarity Check as per user request
    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmSave = () => {
    if (!pendingSaveData) return;

    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data: pendingSaveData });
    } else {
      createMutation.mutate(pendingSaveData);
    }
    setIsSimilarityCheckOpen(false);
    setIsConfirmed(false);
    setPendingSaveData(null);
  };

  const categories: { id: Category; label: string }[] = [
    { id: '인물', label: '인물' },
    { id: '장소', label: '장소' },
    { id: '물건', label: '물건' },
    { id: '집단', label: '집단' },
    { id: '세계', label: '세계' },
    { id: '사건', label: '사건' },
  ];

  const searchCategories: { id: Category; label: string }[] = [
    { id: 'all', label: '전체' },
    ...categories,
  ];

  const renderContent = () => {
    const commonProps = {
      onEdit: handleEditClick,
      onDelete: handleDeleteClick,
    };

    const items = displayItems
      .slice()
      .sort((a: any, b: any) => b.id - a.id) as any[];

    if (!items || items.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          데이터가 없습니다.
        </div>
      );
    }

    return items.map((item) => {
      const getDescription = () => {
        if (Array.isArray(item['배경'])) return item['배경'].join(' ');
        if (Array.isArray(item['설명'])) return item['설명'].join(' ');
        if (Array.isArray(item['작중묘사'])) return item['작중묘사'].join(' ');
        if (Array.isArray(item.description)) return item.description.join(' ');
        return item.description || '';
      };

      return (
        <LorebookCard
          key={item.id}
          item={item}
          title={item.name}
          description={getDescription()}
          category={item.category}
          tags={getTagsForItem(item, activeCategory)}
          {...commonProps}
          onAnalyze={
            item.category === '인물'
              ? () => handleCharacterAnalysis(item.name)
              : undefined
          }
        />
      );
    });
  };

  const renderFormFields = () => {
    return (
      <DynamicSettingEditor
        data={editorData}
        category={activeCategory}
        onChange={setEditorData}
      />
    );
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setEditingItem(null);
      setEditorData({});
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full border-l border-border bg-card/50',
        className,
      )}
    >
      <div className="h-12 px-4 border-b border-border flex items-center justify-between bg-card shrink-0 whitespace-nowrap overflow-hidden">
        <h3 className="font-semibold text-sm flex items-center gap-2 flex-1 min-w-0 truncate">
          <Settings className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="truncate">설정집</span>
        </h3>
        <div className="flex gap-1 flex-1 justify-end ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 mr-1"
            title="작품 분석"
            onClick={() => setIsWorkAnalysisModalOpen(true)}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 mr-1"
            title="설정집 검색"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="내보내기"
            onClick={handleExport}
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-scroll overflow-x-hidden h-full">
        <div className="p-4 space-y-6">
          {/* Work Info */}
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {work?.title}
              <span className="text-xs font-normal text-muted-foreground">
                (
                {work?.status === 'COMPLETED'
                  ? '완결'
                  : `현재 ${manuscriptCount}화`}
                )
              </span>
            </h2>
          </div>

          {/* Category Grid */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                className={cn(
                  'h-12 flex-1 min-w-[80px] flex items-center justify-center gap-1',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent',
                )}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="text-xs font-medium">{cat.label}</span>
                <span className="text-[10px] ml-1 opacity-70">
                  ({categoryCounts[cat.id] || 0})
                </span>
              </Button>
            ))}
          </div>

          {/* Content List */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
            <div className="col-span-full flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {categories.find((c) => c.id === activeCategory)?.label} 목록
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                onClick={handleCreateClick}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[90vw] lg:max-w-[1000px] h-[80vh] flex flex-col gap-6 p-6">
          <DialogHeader className="px-0 pt-0 pb-2 border-b shrink-0">
            <DialogTitle className="text-lg font-semibold">
              설정집 검색
            </DialogTitle>
            <DialogDescription className="text-sm">
              작품 내 설정을 유사도 기반으로 검색합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={searchCategory}
              onValueChange={(val) => setSearchCategory(val as Category)}
            >
              <SelectTrigger className="w-[120px] h-10 text-xs shrink-0">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                {searchCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="찾고 싶은 내용을 문장으로 설명해주세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch(e);
                }}
                className="pl-9 h-10 text-sm w-full"
              />
            </div>

            <Button
              onClick={handleSearch}
              className="h-10 px-4 shrink-0"
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  검색 중... {searchTimer}s
                </>
              ) : (
                '검색'
              )}
            </Button>
          </div>

          <ScrollArea className="flex-1 -mx-2 px-2 overflow-y-auto border rounded-md">
            {searchResults.length > 0 ? (
              <div className="space-y-3 p-2">
                {searchResults.map((item) => (
                  <LorebookCard
                    key={item.id}
                    item={item}
                    title={item.title || item.name}
                    description={item.description}
                    category={item.category}
                    tags={getTagsForItem(item)}
                    onEdit={(item) => {
                      handleEditClick(item);
                      setIsSearchOpen(false); // Close search when editing
                    }}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-10 min-h-[300px]">
                <Search className="w-8 h-8 opacity-20" />
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Similarity Check Dialog */}
      <Dialog
        open={isSimilarityCheckOpen}
        onOpenChange={setIsSimilarityCheckOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>유사 설정 확인</DialogTitle>
            <DialogDescription>
              생성/수정하려는 설정과 유사한 기존 설정이 발견되었습니다. 중복
              여부를 확인해주세요.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[300px] border rounded-md p-4">
            {checkSimilarityMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : similaritySearchResults.length > 0 ? (
              <div className="space-y-4">
                {similaritySearchResults.map((result, idx) => {
                  let setting = result.setting;
                  let keyword = result.keyword;
                  let description = '';

                  try {
                    if (typeof setting === 'string')
                      setting = JSON.parse(setting);
                  } catch (e) {}

                  if (setting && typeof setting === 'object') {
                    const keys = Object.keys(setting);
                    if (keys.length > 0) {
                      const key = keys[0];
                      if (!keyword) keyword = key;
                      const content = setting[key];
                      if (content) {
                        description =
                          content.description ||
                          content.summary ||
                          content.배경 ||
                          content.설명 ||
                          content.상세설명 ||
                          content.작중묘사 ||
                          '';
                        if (Array.isArray(description))
                          description = description.join(' ');
                      }
                    }
                  }

                  return (
                    <Card key={idx} className="bg-muted/50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          {keyword || '제목 없음'}
                          <Badge variant="outline" className="text-[10px]">
                            {result.category}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 text-xs text-muted-foreground">
                        {description || '설명 없음'}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                유사한 설정이 발견되지 않았습니다.
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            <div className="flex items-center gap-2 p-2 border rounded bg-muted/20">
              <Checkbox
                id="confirm-check"
                checked={isConfirmed}
                onCheckedChange={(c) => setIsConfirmed(c === true)}
              />
              <label
                htmlFor="confirm-check"
                className="text-sm cursor-pointer select-none"
              >
                유사한 설정을 확인하였으며, 계속 진행합니다.
              </label>
            </div>
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant="outline"
                onClick={() => setIsSimilarityCheckOpen(false)}
              >
                취소
              </Button>
              <Button onClick={handleConfirmSave} disabled={!isConfirmed}>
                {editingItem?.id ? '수정 완료' : '생성 완료'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="sm:max-w-[90vw] lg:max-w-[1200px] h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>
              {editingItem?.id ? '설정집 수정' : '설정집 생성'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSave}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {renderFormFields()}
            </div>
            <DialogFooter className="p-4 border-t bg-muted/20 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit">{editingItem?.id ? '수정' : '생성'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AnalysisResultModal
        isOpen={isAnalysisResultModalOpen}
        onClose={() => setIsAnalysisResultModalOpen(false)}
        mermaidCode={analysisResult}
        title="인물 관계도 분석 결과"
        isLoading={isAnalyzing}
      />

      <WorkAnalysisModal
        isOpen={isWorkAnalysisModalOpen}
        onClose={() => setIsWorkAnalysisModalOpen(false)}
        workId={workId}
        userId={userId}
      />
    </div>
  );
}

// Removed LorebookCard component definition from here
// Removed getTagsForItem function definition from here
