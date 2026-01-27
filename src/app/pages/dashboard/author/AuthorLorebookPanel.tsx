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
} from '../../../components/ui/dialog';
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

interface AuthorLorebookPanelProps {
  workId: number;
  className?: string;
}

type Category =
  | 'characters'
  | 'places'
  | 'items'
  | 'groups'
  | 'worldviews'
  | 'plots';

export function AuthorLorebookPanel({
  workId,
  className,
}: AuthorLorebookPanelProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('characters');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // If null, it's create mode
  const queryClient = useQueryClient();

  // Fetch Lorebook/Work details
  const { data: work } = useQuery({
    queryKey: ['author', 'work', workId],
    queryFn: () => authorService.getWorkDetail(workId.toString()),
  });

  // Fetch Episode count for "Current n Episode"
  const { data: episodes } = useQuery({
    queryKey: ['author', 'work', workId, 'episodes'],
    queryFn: () => authorService.getEpisodes(workId.toString()),
  });

  // Fetch Data based on category
  const { data: characters } = useQuery({
    queryKey: ['author', 'work', workId, 'characters'],
    queryFn: () => authorService.getLorebookCharacters(workId.toString()),
    enabled: activeCategory === 'characters',
  });

  const { data: places } = useQuery({
    queryKey: ['author', 'work', workId, 'places'],
    queryFn: () => authorService.getLorebookPlaces(workId.toString()),
    enabled: activeCategory === 'places',
  });

  const { data: items } = useQuery({
    queryKey: ['author', 'work', workId, 'items'],
    queryFn: () => authorService.getLorebookItems(workId.toString()),
    enabled: activeCategory === 'items',
  });

  const { data: groups } = useQuery({
    queryKey: ['author', 'work', workId, 'groups'],
    queryFn: () => authorService.getLorebookGroups(workId.toString()),
    enabled: activeCategory === 'groups',
  });

  const { data: worldviews } = useQuery({
    queryKey: ['author', 'work', workId, 'worldviews'],
    queryFn: () => authorService.getLorebookWorldviews(workId.toString()),
    enabled: activeCategory === 'worldviews',
  });

  const { data: plots } = useQuery({
    queryKey: ['author', 'work', workId, 'plots'],
    queryFn: () => authorService.getLorebookPlots(workId.toString()),
    enabled: activeCategory === 'plots',
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      authorService.createLorebookEntry(
        workId.toString(),
        activeCategory,
        data,
      ),
    onSuccess: () => {
      toast.success('생성되었습니다.');
      setIsEditOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['author', 'work', workId, activeCategory],
      });
    },
    onError: () => toast.error('생성에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      authorService.updateLorebookEntry(
        workId.toString(),
        activeCategory,
        id,
        data,
      ),
    onSuccess: () => {
      toast.success('수정되었습니다.');
      setIsEditOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['author', 'work', workId, activeCategory],
      });
    },
    onError: () => toast.error('수정에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      authorService.deleteLorebookEntry(workId.toString(), activeCategory, id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({
        queryKey: ['author', 'work', workId, activeCategory],
      });
    },
    onError: () => toast.error('삭제에 실패했습니다.'),
  });

  const searchMutation = useMutation({
    mutationFn: ({ category, query }: { category: Category; query: string }) =>
      authorService.searchLorebook(workId.toString(), category, query),
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: () => toast.error('검색에 실패했습니다.'),
  });

  const exportMutation = useMutation({
    mutationFn: () => authorService.exportLorebook(workId.toString()),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${work?.title || 'work'}_설정집.md`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('설정집이 다운로드되었습니다.');
    },
    onError: () => toast.error('내보내기에 실패했습니다.'),
  });

  const handleExport = () => {
    if (confirm('설정집을 Markdown 파일로 다운로드하시겠습니까?')) {
      exportMutation.mutate();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('query') as string;
    const category = formData.get('category') as Category;
    if (!query) return;
    searchMutation.mutate({ category, query });
  };

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData as any);

    // Process tags/arrays if needed
    // For simplicity, splitting comma-separated strings for array fields
    if (activeCategory === 'characters' && data.traits) {
      data.traits = (data.traits as string)
        .split(',')
        .map((s) => s.trim()) as any;
    }
    if (activeCategory === 'worldviews' && data.tags) {
      data.tags = (data.tags as string).split(',').map((s) => s.trim()) as any;
    }
    if (activeCategory === 'groups' && data.members) {
      data.members = (data.members as string)
        .split(',')
        .map((s) => s.trim()) as any;
    }

    if (editingItem.id) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
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

  const renderContent = () => {
    let content = null;
    const commonProps = {
      onEdit: handleEditClick,
      onDelete: handleDeleteClick,
    };

    switch (activeCategory) {
      case 'characters':
        content = characters?.map((item) => (
          <LorebookCard
            key={item.id}
            item={item}
            title={item.name}
            description={item.description}
            tags={[item.role, item.age].filter(Boolean) as string[]}
            {...commonProps}
          />
        ));
        break;
      case 'places':
        content = places?.map((item) => (
          <LorebookCard
            key={item.id}
            item={item}
            title={item.name}
            description={item.description}
            tags={[item.location].filter(Boolean) as string[]}
            {...commonProps}
          />
        ));
        break;
      case 'items':
        content = items?.map((item) => (
          <LorebookCard
            key={item.id}
            item={item}
            title={item.name}
            description={item.description}
            tags={[item.type].filter(Boolean) as string[]}
            {...commonProps}
          />
        ));
        break;
      case 'groups':
        content = groups?.map((item) => (
          <LorebookCard
            key={item.id}
            item={item}
            title={item.name}
            description={item.description}
            {...commonProps}
          />
        ));
        break;
      case 'worldviews':
        content = worldviews?.map((item) => (
          <LorebookCard
            key={item.id}
            item={item}
            title={item.title}
            description={item.description}
            tags={[item.category]}
            {...commonProps}
          />
        ));
        break;
      case 'plots':
        content = plots?.map((item) => (
          <LorebookCard
            key={item.id}
            item={item}
            title={item.title}
            description={item.description}
            tags={[item.importance].filter(Boolean) as string[]}
            {...commonProps}
          />
        ));
        break;
    }

    if (!content || (Array.isArray(content) && content.length === 0)) {
      return (
        <div className="text-center text-muted-foreground py-8">
          데이터가 없습니다.
        </div>
      );
    }
    return content;
  };

  const renderFormFields = () => {
    switch (activeCategory) {
      case 'characters':
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
              <Label htmlFor="role">역할</Label>
              <Input
                id="role"
                name="role"
                defaultValue={editingItem?.role}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">나이</Label>
              <Input id="age" name="age" defaultValue={editingItem?.age} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
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
      case 'places':
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
              <Label htmlFor="location">위치</Label>
              <Input
                id="location"
                name="location"
                defaultValue={editingItem?.location}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
              />
            </div>
          </>
        );
      case 'items':
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
              <Label htmlFor="type">종류</Label>
              <Input id="type" name="type" defaultValue={editingItem?.type} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
              />
            </div>
          </>
        );
      case 'groups':
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
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="members">구성원 (쉼표로 구분)</Label>
              <Input
                id="members"
                name="members"
                defaultValue={editingItem?.members?.join(', ')}
              />
            </div>
          </>
        );
      case 'worldviews':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingItem?.title}
                required
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
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
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
      case 'plots':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingItem?.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">순서</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={editingItem?.order}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="importance">중요도</Label>
              <Select
                name="importance"
                defaultValue={editingItem?.importance || 'Sub'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="중요도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main">Main</SelectItem>
                  <SelectItem value="Sub">Sub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description}
                required
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
      <div className="h-12 px-4 border-b border-border flex items-center justify-between bg-card shrink-0">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-500" />
          설정집
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="유사도 검색"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-3 h-3" />
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

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Work Info */}
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {work?.title}
              <span className="text-xs font-normal text-muted-foreground">
                (
                {work?.status === 'COMPLETED'
                  ? '완결'
                  : `현재 ${episodes?.length || 0}화`}
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
                  'h-16 flex flex-col items-center justify-center gap-1',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent',
                )}
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="w-4 h-4" />
                <span className="text-xs">{cat.label}</span>
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

      {/* Similarity Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>유사도 검색</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="search-category">카테고리</Label>
                <Select name="category" defaultValue="characters">
                  <SelectTrigger id="search-category">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="search-query">검색 내용</Label>
                <div className="flex gap-2">
                  <Input
                    id="search-query"
                    name="query"
                    placeholder="검색할 내용을 입력하세요..."
                    required
                  />
                  <Button type="submit" disabled={searchMutation.isPending}>
                    {searchMutation.isPending ? '검색 중...' : '검색'}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-3 mt-4 border-t pt-4">
              <h4 className="text-sm font-semibold text-muted-foreground">
                검색 결과 ({searchResults.length})
              </h4>
              <div className="space-y-2">
                {searchResults.map((item) => (
                  <Card key={item.id} className="bg-muted/50">
                    <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-medium">
                        {item.name || item.title}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleEditClick(item)}
                        >
                          <Edit className="w-3 h-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categories.find((c) => c.id === activeCategory)?.label}{' '}
              {editingItem?.id ? '수정' : '생성'}
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
  tags,
  onEdit,
  onDelete,
}: {
  item: any;
  title: string;
  description: string;
  tags?: string[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card>
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-3 h-3 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {description}
        </p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] px-1 py-0 h-5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
