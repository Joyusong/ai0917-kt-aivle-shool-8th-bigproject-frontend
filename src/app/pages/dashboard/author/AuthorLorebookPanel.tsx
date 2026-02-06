import { useState } from 'react';
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

type Category = 'all' | '인물' | '장소' | '물건' | '단체' | '세계' | '사건';

const toBackendCategory = (cat: string): string => {
  const map: Record<string, string> = {
    all: '*',
    인물: '인물',
    장소: '장소',
    물건: '물건',
    단체: '단체',
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

  // Similarity Check States
  const [isSimilarityCheckOpen, setIsSimilarityCheckOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<any>(null);
  const [similaritySearchResults, setSimilaritySearchResults] = useState<any[]>(
    [],
  );
  const [isConfirmed, setIsConfirmed] = useState(false);

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
        description =
          content.description ||
          content.배경 ||
          content.summary ||
          content.상세설명 ||
          content.설명 || // Added for Item type
          (Array.isArray(content.작중묘사)
            ? content.작중묘사.join(' ')
            : content.작중묘사) || // Added for Place type
          '';
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
      const settingsObj = { description, ...rest };
      const settings = JSON.stringify(settingsObj);

      return authorService.saveLorebookManual(userId, work!.title, workId, {
        keyword: lorebookTitle,
        subtitle: subtitle || '',
        settings,
        category: toBackendCategory(activeCategory) as any,
        episode: [],
      });
    },
    onSuccess: () => {
      toast.success('생성되었습니다.');
      setIsEditOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['author', 'lorebook', userId, work?.title, activeCategory],
      });
    },
    onError: () => toast.error('생성에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      const { name, title, description, subtitle, ...rest } = data;
      const lorebookTitle = name || title;
      const settingsObj = { description, ...rest };
      const settings = JSON.stringify(settingsObj);

      return authorService.updateLorebook(
        userId,
        work!.title,
        activeCategory,
        id,
        {
          keyword: lorebookTitle,
          subtitle: subtitle || '',
          settings,
        },
      );
    },
    onSuccess: () => {
      toast.success('수정되었습니다.');
      setIsEditOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['author', 'lorebook', userId, work?.title, activeCategory],
      });
    },
    onError: () => toast.error('수정에 실패했습니다.'),
  });

  const handleCreateClick = () => {
    setEditingItem({});
    setIsEditOpen(true);
  };

  const handleEditClick = (item: any) => {
    setEditingItem({ ...item });
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
        '단체',
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
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData as any);

    // Process tags/arrays
    if (activeCategory === '인물' && data.traits) {
      data.traits = (data.traits as string)
        .split(',')
        .map((s) => s.trim()) as any;
    }
    if (activeCategory === '세계' && data.tags) {
      data.tags = (data.tags as string).split(',').map((s) => s.trim()) as any;
    }
    if (activeCategory === '단체' && data.members) {
      data.members = (data.members as string)
        .split(',')
        .map((s) => s.trim()) as any;
    }
    if (activeCategory === '사건' && data.participants) {
      data.participants = (data.participants as string)
        .split(',')
        .map((s) => s.trim()) as any;
    }

    setPendingSaveData(data);

    // Perform Similarity Check단체 before saving
    // Use name or title or description as query
    const query = data.name || data.title || data.description || '';
    checkSimilarityMutation.mutate({ category: 'all', query });
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
    { id: '단체', label: '단체' },
    { id: '세계', label: '세계' },
    { id: '사건', label: '사건' },
  ];

  const searchCategories: { id: Category; label: string }[] = [
    { id: 'all', label: '전체' },
    ...categories,
  ];

  const getTagsForItem = (item: any) => {
    const category = item.category || activeCategory;
    switch (category) {
      case '인물':
        return [
          item.role,
          item['직업/신분'],
          item.age,
          item['연령'],
          ...(item.traits || item['성격'] || []),
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
      case '단체':
        return [item.leader, item['수장'], item.scale, item['규모']].filter(
          Boolean,
        ) as string[];
      case '세계':
        return [item.category].filter(Boolean) as string[];
      case '사건':
        return [
          item.importance,
          item['중요도'],
          item.date,
          item['발생 시점'],
        ].filter(Boolean) as string[];
      default:
        return [item.role, item.type, item.category].filter(
          Boolean,
        ) as string[];
    }
  };

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

    return items.map((item) => (
      <LorebookCard
        key={item.id}
        item={item}
        title={item.name}
        description={item.description}
        category={item.category}
        tags={getTagsForItem(item)}
        {...commonProps}
      />
    ));
  };

  const renderFormFields = () => {
    switch (activeCategory) {
      case '인물':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingItem?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">부제/별칭</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  defaultValue={editingItem?.subtitle}
                  placeholder="별명이나 이명 등"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">나이</Label>
                <Input id="age" name="age" defaultValue={editingItem?.age} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">성별</Label>
                <Input
                  id="gender"
                  name="gender"
                  defaultValue={editingItem?.gender}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">직업</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  defaultValue={editingItem?.occupation}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Input
                id="role"
                name="role"
                defaultValue={editingItem?.role}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appearance">외모 묘사</Label>
              <Textarea
                id="appearance"
                name="appearance"
                defaultValue={editingItem?.appearance}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personality">성격</Label>
              <Textarea
                id="personality"
                name="personality"
                defaultValue={editingItem?.personality}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="traits">특징 (쉼표로 구분)</Label>
              <Input
                id="traits"
                name="traits"
                defaultValue={editingItem?.traits?.join(', ')}
              />
            </div>
          </>
        );
      case '장소':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingItem?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">부제/별칭</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  defaultValue={editingItem?.subtitle}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">위치</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingItem?.location}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale">규모</Label>
                <Input
                  id="scale"
                  name="scale"
                  defaultValue={editingItem?.scale}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="atmosphere">분위기</Label>
              <Input
                id="atmosphere"
                name="atmosphere"
                defaultValue={editingItem?.atmosphere}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="function">기능/용도</Label>
              <Input
                id="function"
                name="function"
                defaultValue={editingItem?.function}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">소유자/관리자</Label>
              <Input
                id="owner"
                name="owner"
                defaultValue={editingItem?.owner}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history">역사/배경</Label>
              <Textarea
                id="history"
                name="history"
                defaultValue={editingItem?.history}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
                className="min-h-[100px]"
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
                  defaultValue={editingItem?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">부제/별칭</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  defaultValue={editingItem?.subtitle}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">종류</Label>
                <Input id="type" name="type" defaultValue={editingItem?.type} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank">등급/가치</Label>
                <Input id="rank" name="rank" defaultValue={editingItem?.rank} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="effect">효과/능력</Label>
              <Input
                id="effect"
                name="effect"
                defaultValue={editingItem?.effect}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">기원/출처</Label>
                <Input
                  id="origin"
                  name="origin"
                  defaultValue={editingItem?.origin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">재질</Label>
                <Input
                  id="material"
                  name="material"
                  defaultValue={editingItem?.material}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">소유자</Label>
              <Input
                id="owner"
                name="owner"
                defaultValue={editingItem?.owner}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history">내력/전설</Label>
              <Textarea
                id="history"
                name="history"
                defaultValue={editingItem?.history}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
                className="min-h-[100px]"
              />
            </div>
          </>
        );
      case '단체':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingItem?.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">부제/별칭</Label>
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={editingItem?.subtitle}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">유형</Label>
                <Input id="type" name="type" defaultValue={editingItem?.type} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale">규모</Label>
                <Input
                  id="scale"
                  name="scale"
                  defaultValue={editingItem?.scale}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">상징/문장</Label>
              <Input
                id="symbol"
                name="symbol"
                defaultValue={editingItem?.symbol}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">목적/이념</Label>
              <Input
                id="purpose"
                name="purpose"
                defaultValue={editingItem?.purpose}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity">주요 활동</Label>
              <Textarea
                id="activity"
                name="activity"
                defaultValue={editingItem?.activity}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history">역사</Label>
              <Textarea
                id="history"
                name="history"
                defaultValue={editingItem?.history}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="members">주요 구성원 (쉼표로 구분)</Label>
              <Input
                id="members"
                name="members"
                defaultValue={editingItem?.members?.join(', ')}
              />
            </div>
          </>
        );
      case '세계':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">세계관 명칭</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingItem?.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">부제/별칭</Label>
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={editingItem?.subtitle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                name="category"
                defaultValue={editingItem?.category}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geography">지리/환경</Label>
              <Textarea
                id="geography"
                name="geography"
                defaultValue={editingItem?.geography}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="culture">문화/사회</Label>
              <Textarea
                id="culture"
                name="culture"
                defaultValue={editingItem?.culture}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history">역사</Label>
              <Textarea
                id="history"
                name="history"
                defaultValue={editingItem?.history}
                className="min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="law">법률/규칙</Label>
                <Input id="law" name="law" defaultValue={editingItem?.law} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="magic">마법/기술</Label>
                <Input
                  id="magic"
                  name="magic"
                  defaultValue={editingItem?.magic}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="technology">기술 수준</Label>
                <Input
                  id="technology"
                  name="technology"
                  defaultValue={editingItem?.technology}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="race">종족 구성</Label>
                <Input id="race" name="race" defaultValue={editingItem?.race} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={editingItem?.tags?.join(', ')}
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
                defaultValue={editingItem?.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">부제/별칭</Label>
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={editingItem?.subtitle}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">발생 시점</Label>
                <Input
                  id="date"
                  name="date"
                  defaultValue={editingItem?.date}
                  placeholder="예: 2025년 1월 1일, 제1장 3화 등"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">발생 장소</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingItem?.location}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cause">원인/배경</Label>
              <Textarea
                id="cause"
                name="cause"
                defaultValue={editingItem?.cause}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flow">전개 과정</Label>
              <Textarea
                id="flow"
                name="flow"
                defaultValue={editingItem?.flow}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="result">결과</Label>
              <Textarea
                id="result"
                name="result"
                defaultValue={editingItem?.result}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="influence">영향/여파</Label>
              <Textarea
                id="influence"
                name="influence"
                defaultValue={editingItem?.influence}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">관련 인물 (쉼표로 구분)</Label>
              <Input
                id="participants"
                name="participants"
                defaultValue={editingItem?.participants?.join(', ')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
                className="min-h-[100px]"
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
        <h3 className="font-semibold text-sm flex items-center gap-2 shrink-0">
          <Settings className="w-4 h-4 text-purple-500" />
          설정집
        </h3>
        <div className="flex gap-1 shrink-0 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 mr-1"
            title="설정 검색"
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
        <div className="p-4 space-y-6 min-w-[320px]">
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
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                className={cn(
                  'h-12 flex items-center justify-center gap-1',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent',
                )}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="text-xs font-medium">{cat.label}</span>
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
                className="h-6 w-6 p-0"
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
              설정 검색
            </DialogTitle>
            <DialogDescription className="text-sm">
              작품 내 모든 설정을 검색합니다.
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

            <Button onClick={handleSearch} className="h-10 px-4 shrink-0">
              {searchMutation.isPending && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              검색
            </Button>
          </div>

          <ScrollArea className="flex-1 h-[400px] -mx-2 px-2">
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
              {editingItem?.id ? '설정 수정' : '새 설정 추가'}
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
              <Button type="submit">저장</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LorebookCard({
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
  return (
    <Card className="relative group">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <h5 className="font-semibold text-sm line-clamp-1">{title}</h5>
            {category && (
              <Badge variant="outline" className="text-[10px] px-1 h-5">
                {category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
