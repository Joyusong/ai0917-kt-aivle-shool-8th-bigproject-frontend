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
} from 'lucide-react';
import { DynamicSettingEditor } from '../../../components/dashboard/author/DynamicSettingEditor';
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

  // Fetch ALL Data for Counts
  const { data: allLorebooksData } = useQuery({
    queryKey: ['author', 'lorebook', userId, work?.title, 'all'],
    queryFn: () => authorService.getLorebooks(userId, work!.title, workId),
    enabled: !!work?.title && !!userId,
  });

  const allLorebooks = Array.isArray(allLorebooksData)
    ? allLorebooksData
    : (allLorebooksData as any)?.data &&
        Array.isArray((allLorebooksData as any).data)
      ? (allLorebooksData as any).data
      : [];

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

  const lorebooks = Array.isArray(lorebooksData)
    ? lorebooksData
    : (lorebooksData as any)?.data && Array.isArray((lorebooksData as any).data)
      ? (lorebooksData as any).data
      : [];

  const displayItems =
    lorebooks.map((item: any) => {
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
      const { name, title, description, subtitle, ...rest } = data;
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
      const { name, title, description, subtitle, ...rest } = data;
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
        settings: JSON.stringify(settingObj),
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
        if (!Array.isArray(item)) return item; // Fallback if already object

        const [id, category, setting, episodes, score] = item;

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditorData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
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
        />
      );
    });
  };

  const renderFormFields = () => {
    if (activeCategory === '인물' || activeCategory === '세계') {
      return (
        <DynamicSettingEditor
          data={editorData}
          category={activeCategory}
          onChange={setEditorData}
        />
      );
    }

    switch (activeCategory) {
      case '장소':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={editorData.name || ''}
                  onChange={handleInputChange}
                  placeholder="예: 마법사의 탑"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">부제/별칭</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={editorData.subtitle || ''}
                  onChange={handleInputChange}
                  placeholder="예: 고대 마법의 중심지"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">위치</Label>
                <Input
                  id="location"
                  name="location"
                  value={editorData.location || ''}
                  onChange={handleInputChange}
                  placeholder="예: 왕국 북부 숲 속"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale">규모</Label>
                <Input
                  id="scale"
                  name="scale"
                  value={editorData.scale || ''}
                  onChange={handleInputChange}
                  placeholder="예: 높이 100m, 5층 건물"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="atmosphere">분위기</Label>
              <Input
                id="atmosphere"
                name="atmosphere"
                value={editorData.atmosphere || ''}
                onChange={handleInputChange}
                placeholder="예: 신비롭고 조용함"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="function">기능/용도</Label>
              <Input
                id="function"
                name="function"
                value={editorData.function || ''}
                onChange={handleInputChange}
                placeholder="예: 마법 연구 및 교육"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">소유자/관리자</Label>
              <Input
                id="owner"
                name="owner"
                value={editorData.owner || ''}
                onChange={handleInputChange}
                placeholder="예: 대마법사 엘리온"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history">역사/배경</Label>
              <Textarea
                id="history"
                name="history"
                value={editorData.history || ''}
                onChange={handleInputChange}
                className="min-h-[60px]"
                placeholder="예: 300년 전 건설되어..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                value={editorData.description || ''}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
                placeholder="상세한 묘사를 입력하세요."
              />
            </div>
          </>
        );
      case '물건':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={editorData.name || ''}
                  onChange={handleInputChange}
                  placeholder="예: 엑스칼리버"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">부제/별칭</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={editorData.subtitle || ''}
                  onChange={handleInputChange}
                  placeholder="예: 약속된 승리의 검"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">종류</Label>
                <Input
                  id="type"
                  name="type"
                  value={editorData.type || ''}
                  onChange={handleInputChange}
                  placeholder="예: 장검, 아티팩트"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank">등급/가치</Label>
                <Input
                  id="rank"
                  name="rank"
                  value={editorData.rank || ''}
                  onChange={handleInputChange}
                  placeholder="예: S급, 전설 등급"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="effect">효과/능력</Label>
              <Input
                id="effect"
                name="effect"
                value={editorData.effect || ''}
                onChange={handleInputChange}
                placeholder="예: 모든 상처 치유, 빛의 일격"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">기원/출처</Label>
                <Input
                  id="origin"
                  name="origin"
                  value={editorData.origin || ''}
                  onChange={handleInputChange}
                  placeholder="예: 호수의 여인"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">재질</Label>
                <Input
                  id="material"
                  name="material"
                  value={editorData.material || ''}
                  onChange={handleInputChange}
                  placeholder="예: 정령석, 미스릴"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">소유자</Label>
              <Input
                id="owner"
                name="owner"
                value={editorData.owner || ''}
                onChange={handleInputChange}
                placeholder="예: 아서 왕"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history">내력/전설</Label>
              <Textarea
                id="history"
                name="history"
                value={editorData.history || ''}
                onChange={handleInputChange}
                className="min-h-[60px]"
                placeholder="예: 바위에 꽂혀 있던 검..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                value={editorData.description || ''}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
                placeholder="상세한 묘사를 입력하세요."
              />
            </div>
          </>
        );
      case '집단':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                value={editorData.name || ''}
                onChange={handleInputChange}
                required
                placeholder="예: 그림자 길드"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">부제/별칭</Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={editorData.subtitle || ''}
                onChange={handleInputChange}
                placeholder="예: 어둠 속의 수호자들"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">유형</Label>
                <Input
                  id="type"
                  name="type"
                  value={editorData.type || ''}
                  onChange={handleInputChange}
                  placeholder="예: 비밀결사, 상인 조합"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale">규모</Label>
                <Input
                  id="scale"
                  name="scale"
                  value={editorData.scale || ''}
                  onChange={handleInputChange}
                  placeholder="예: 500명 규모, 3개 대륙 활동"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">상징/문장</Label>
              <Input
                id="symbol"
                name="symbol"
                value={editorData.symbol || ''}
                onChange={handleInputChange}
                placeholder="예: 검은 독수리 문장"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">목적/이념</Label>
              <Input
                id="purpose"
                name="purpose"
                value={editorData.purpose || ''}
                onChange={handleInputChange}
                placeholder="예: 왕권 수호 및 정보 수집"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity">주요 활동</Label>
              <Textarea
                id="activity"
                name="activity"
                value={editorData.activity || ''}
                onChange={handleInputChange}
                className="min-h-[60px]"
                placeholder="예: 암살, 첩보, 밀무역"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history">역사</Label>
              <Textarea
                id="history"
                name="history"
                value={editorData.history || ''}
                onChange={handleInputChange}
                className="min-h-[60px]"
                placeholder="예: 1차 대전쟁 직후 설립..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                value={editorData.description || ''}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
                placeholder="상세한 묘사를 입력하세요."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="members">주요 구성원 (쉼표로 구분)</Label>
              <Input
                id="members"
                name="members"
                value={
                  Array.isArray(editorData.members)
                    ? editorData.members.join(', ')
                    : editorData.members || ''
                }
                onChange={handleInputChange}
                placeholder="예: 길드장, 부길드장, 행동대장"
              />
            </div>
          </>
        );
      case '사건':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">사건명</Label>
              <Input
                id="title"
                name="title"
                value={editorData.title || ''}
                onChange={handleInputChange}
                required
                placeholder="예: 대화재 사건"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">부제/별칭</Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={editorData.subtitle || ''}
                onChange={handleInputChange}
                placeholder="예: 왕궁을 뒤흔든 밤"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">발생 시점</Label>
                <Input
                  id="date"
                  name="date"
                  value={editorData.date || ''}
                  onChange={handleInputChange}
                  placeholder="예: 제국력 520년 3월 15일"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">발생 장소</Label>
                <Input
                  id="location"
                  name="location"
                  value={editorData.location || ''}
                  onChange={handleInputChange}
                  placeholder="예: 수도 중앙 광장"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cause">원인/배경</Label>
              <Textarea
                id="cause"
                name="cause"
                value={editorData.cause || ''}
                onChange={handleInputChange}
                className="min-h-[60px]"
                placeholder="예: 마법 실험 실패"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flow">전개 과정</Label>
              <Textarea
                id="flow"
                name="flow"
                value={editorData.flow || ''}
                onChange={handleInputChange}
                className="min-h-[60px]"
                placeholder="예: 폭발 후 화재 확산, 진압 시도"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="result">결과</Label>
              <Textarea
                id="result"
                name="result"
                value={editorData.result || ''}
                onChange={handleInputChange}
                className="min-h-[60px]"
                placeholder="예: 왕궁 별관 소실"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="influence">영향/여파</Label>
              <Textarea
                id="influence"
                name="influence"
                value={editorData.influence || ''}
                onChange={handleInputChange}
                className="min-h-[60px]"
                placeholder="예: 마법 금지법 제정"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">관련 인물 (쉼표로 구분)</Label>
              <Input
                id="participants"
                name="participants"
                value={
                  Array.isArray(editorData.participants)
                    ? editorData.participants.join(', ')
                    : editorData.participants || ''
                }
                onChange={handleInputChange}
                placeholder="예: 마법사 길드, 왕실 근위대"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                value={editorData.description || ''}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
                placeholder="상세한 묘사를 입력하세요."
              />
            </div>
          </>
        );
      default:
        return null;
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
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
        <DialogContent className="max-w-xl max-h-[80vh] flex flex-col p-6 gap-6">
          <DialogHeader className="px-0 pt-0 pb-2 border-b">
            <DialogTitle className="text-lg font-semibold">
              설정집 검색
            </DialogTitle>
            <DialogDescription className="text-sm">
              작품 내 설정을 유사도 기반으로 검색합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
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

          <ScrollArea className="flex-1 h-[50vh] -mx-2 px-2 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
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
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-10">
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
        <DialogContent className="max-w-2xl">
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
                {similaritySearchResults.map((result, idx) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {result.keyword}
                        <Badge variant="outline" className="text-[10px]">
                          {result.category}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-xs text-muted-foreground">
                      {typeof result.setting === 'string'
                        ? JSON.parse(result.setting).description
                        : result.setting?.description || '설명 없음'}
                    </CardContent>
                  </Card>
                ))}
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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? '설정집 수정' : '설정집 생성'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              {renderFormFields()}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">{editingItem?.id ? '수정' : '생성'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LorebookCard({
  item,
  title,
  description,
  tags = [],
  category,
  onEdit,
  onDelete,
}: {
  item: any;
  title: string;
  description: string;
  tags?: string[];
  category?: string;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}) {
  const isCharacter = category === '인물';
  const isWorld = category === '세계';

  return (
    <Card className="relative group hover:border-primary/50 transition-colors">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-sm line-clamp-1">{title}</h5>
              {category && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 h-5 shrink-0"
                >
                  {category}
                </Badge>
              )}
            </div>
            {isCharacter &&
              item['별명'] &&
              Array.isArray(item['별명']) &&
              item['별명'].length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item['별명'].map((alias: string, i: number) => (
                    <span
                      key={i}
                      className="text-[10px] text-muted-foreground bg-muted px-1 rounded"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onEdit(item)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>

        {isCharacter && (
          <div className="flex gap-2 text-[10px] text-muted-foreground">
            {item['기술/능력'] &&
              Array.isArray(item['기술/능력']) &&
              item['기술/능력'].length > 0 && (
                <span>기술 {item['기술/능력'].length}개</span>
              )}
            {item['인물관계'] &&
              Array.isArray(item['인물관계']) &&
              item['인물관계'].length > 0 && (
                <span>관계 {item['인물관계'].length}명</span>
              )}
          </div>
        )}

        {isWorld && (
          <div className="flex gap-2 text-[10px] text-muted-foreground">
            {item['규칙'] &&
              Array.isArray(item['규칙']) &&
              item['규칙'].length > 0 && (
                <span>규칙 {item['규칙'].length}개</span>
              )}
            {item['금기'] &&
              Array.isArray(item['금기']) &&
              item['금기'].length > 0 && (
                <span>금기 {item['금기'].length}개</span>
              )}
            {item['필수 제약'] &&
              Array.isArray(item['필수 제약']) &&
              item['필수 제약'].length > 0 && (
                <span>제약 {item['필수 제약'].length}개</span>
              )}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 5).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1">
                {tag}
              </Badge>
            ))}
            {tags.length > 5 && (
              <span className="text-[10px] text-muted-foreground">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const getTagsForItem = (item: any, defaultCategory = '인물') => {
  const category = item.category || defaultCategory;
  const flatten = (val: any) => (Array.isArray(val) ? val : [val]);

  switch (category) {
    case '인물':
      return [
        ...flatten(item.species || item['종족']),
        ...flatten(item.role || item['직업/신분']),
        ...flatten(item.age || item['연령']),
        ...flatten(item.traits || item['성격']),
      ].filter(Boolean) as string[];
    case '장소':
      return [
        item.location,
        item['위치'],
        item.scale,
        item['규모'],
        item['분위기'],
        ...(item['집단'] || []),
      ].filter(Boolean) as string[];
    case '물건':
      return [
        item.type,
        item['종류'],
        item.grade,
        item['등급'],
        ...(item['관련인물'] || []),
      ].filter(Boolean) as string[];
    case '집단':
      return [item.leader, item['수장'], item.scale, item['규모']].filter(
        Boolean,
      ) as string[];
    case '세계':
      return [...flatten(item['종류']), ...flatten(item['분위기'])].filter(
        Boolean,
      ) as string[];
    case '사건':
      return [
        item.importance,
        item['중요도'],
        item.date,
        item['발생 시점'],
      ].filter(Boolean) as string[];
    default:
      return [item.role, item.type, item.category].filter(Boolean) as string[];
  }
};
