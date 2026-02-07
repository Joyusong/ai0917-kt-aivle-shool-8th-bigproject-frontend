import {
  Search,
  ArrowUpDown,
  Sparkles,
  Grid3x3,
  List,
  FileText,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axios';
import { toast } from 'sonner';

export function ManagerWorkAnalysis() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
  const [selectedAuthorWorkId, setSelectedAuthorWorkId] = useState<string>('');

  const works = [
    {
      id: 1,
      title: '암흑의 영역 연대기',
      author: '김민지',
      category: '인물',
      genre: '판타지',
      gradient: 'from-slate-700 to-slate-900',
    },
    {
      id: 2,
      title: '운명의 검',
      author: '이재원',
      category: '서사',
      genre: '무협',
      gradient: 'from-purple-700 to-purple-900',
    },
    {
      id: 3,
      title: '별빛 아카데미',
      author: '박수진',
      category: '세계관',
      genre: '학원',
      gradient: 'from-blue-700 to-blue-900',
    },
    {
      id: 4,
      title: '시간의 문',
      author: '최현우',
      category: '서사',
      genre: 'SF',
      gradient: 'from-green-700 to-green-900',
    },
    {
      id: 5,
      title: '마법 학원',
      author: '정서연',
      category: '인물',
      genre: '판타지',
      gradient: 'from-orange-700 to-orange-900',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="작품명, 작가명 검색..."
              className="pl-10 w-full sm:w-64 md:w-80"
            />
          </div>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full sm:w-[130px] flex-1 sm:flex-initial">
              <SelectValue placeholder="필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 보기</SelectItem>
              <SelectItem value="author">작가별</SelectItem>
              <SelectItem value="genre">장르별</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px] flex-1 sm:flex-initial">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              <SelectItem value="characters">인물</SelectItem>
              <SelectItem value="world">세계관</SelectItem>
              <SelectItem value="narrative">서사</SelectItem>
              <SelectItem value="place">장소</SelectItem>
              <SelectItem value="item">물건</SelectItem>
              <SelectItem value="group">집단</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 flex-1 sm:flex-initial"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            최신순
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1 sm:flex-initial"
            onClick={() => setShowAnalysisModal(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">AI 작품 분석</span>
            <span className="sm:hidden">분석</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {works.map((work) => (
            <Card
              key={work.id}
              className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedWork(work)}
            >
              <CardContent className="p-3">
                <div
                  className={`aspect-[4/3] bg-gradient-to-br ${work.gradient} rounded-lg mb-2 flex items-center justify-center`}
                >
                  <FileText className="w-8 h-8 text-white opacity-80" />
                </div>
                <div className="text-sm text-slate-900 mb-1 truncate">
                  {work.title}
                </div>
                <div className="text-xs text-slate-500 mb-2">{work.author}</div>
                <div className="flex gap-1">
                  <Badge
                    className={`${
                      work.category === '인물'
                        ? 'bg-blue-500'
                        : work.category === '세계관'
                          ? 'bg-green-500'
                          : 'bg-purple-500'
                    } text-white text-xs`}
                  >
                    {work.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI 작품 분석 Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>작품 분석</DialogTitle>
          </DialogHeader>
          {/* Linked Authors */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">작가 선택</div>
              <LinkedAuthorsSelect
                value={selectedAuthorId}
                onChange={(v) => {
                  setSelectedAuthorId(v);
                  setSelectedAuthorWorkId('');
                }}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">작품 선택</div>
              <AuthorWorksSelect
                authorId={selectedAuthorId}
                value={selectedAuthorWorkId}
                onChange={(v) => setSelectedAuthorWorkId(v)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAnalysisModal(false)}
            >
              취소
            </Button>
            <Button
              disabled={!selectedAuthorId || !selectedAuthorWorkId}
              onClick={() => {
                toast.info(
                  'AI 서버 준비 중입니다. 서버 가동 후 분석을 시작할게요.',
                );
                setShowAnalysisModal(false);
              }}
            >
              분석
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-slate-900 font-semibold">
                  {selectedWork.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedWork.author} · {selectedWork.genre}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedWork(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Category Badge */}
              <div>
                <Badge
                  className={`${
                    selectedWork.category === '인물'
                      ? 'bg-blue-500'
                      : selectedWork.category === '세계관'
                        ? 'bg-green-500'
                        : 'bg-purple-500'
                  } text-white`}
                >
                  {selectedWork.category}
                </Badge>
              </div>

              {/* Work Info */}
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-base text-slate-900">
                    작품 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">장르</div>
                      <div className="text-sm text-slate-900">
                        {selectedWork.genre}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">
                        카테고리
                      </div>
                      <div className="text-sm text-slate-900">
                        {selectedWork.category}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">등록일</div>
                      <div className="text-sm text-slate-900">2024.01.15</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">상태</div>
                      <Badge className="bg-green-500 text-white">
                        분석 완료
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Preview */}
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-base text-slate-900">
                    설정집 미리보기
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-900 mb-2">
                        주요 인물
                      </div>
                      <div className="text-sm text-slate-600">
                        엘레나, 루미나스, 다크로드 등 15명의 캐릭터가
                        분석되었습니다.
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-900 mb-2">
                        세계관 설정
                      </div>
                      <div className="text-sm text-slate-600">
                        중세 판타지 세계관, 마법 체계, 7개 왕국의 정치 구조 등이
                        포함되어 있습니다.
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-900 mb-2">
                        서사 구조
                      </div>
                      <div className="text-sm text-slate-600">
                        3막 구조, 주요 갈등 요소, 클라이맥스 분석이
                        완료되었습니다.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI 분석 결과
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      장르 적합도
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: '92%' }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-900 font-semibold">
                        92%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      IP 확장 가능성
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: '88%' }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-900 font-semibold">
                        88%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      캐릭터 완성도
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: '95%' }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-900 font-semibold">
                        95%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LinkedAuthorsSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data } = useQuery({
    queryKey: ['manager', 'authors', 'linked', 'list'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/manager/authors', {
        params: { size: 100, sort: 'name,asc', linked: true },
      });
      const page = res.data as any;
      const items = page?.content ?? [];
      return items.map((a: any) => ({ id: a.id, name: a.name })) as {
        id: number;
        name: string;
      }[];
    },
  });
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="연동된 작가를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {data?.map((a) => (
          <SelectItem key={a.id} value={String(a.id)}>
            {a.name}
          </SelectItem>
        ))}
        {!data || data.length === 0 ? (
          <SelectItem value="__empty" disabled>
            연동된 작가 없음
          </SelectItem>
        ) : null}
      </SelectContent>
    </Select>
  );
}

function AuthorWorksSelect({
  authorId,
  value,
  onChange,
}: {
  authorId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { data } = useQuery({
    queryKey: ['manager', 'authors', 'works', authorId],
    queryFn: async () => {
      if (!authorId) return [];
      const res = await apiClient.get(
        `/api/v1/manager/authors/${authorId}/works`,
      );
      return res.data as { id: number; title: string }[];
    },
    enabled: !!authorId,
  });
  return (
    <Select value={value} onValueChange={onChange} disabled={!authorId}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            authorId ? '작품을 선택하세요' : '작가를 먼저 선택하세요'
          }
        />
      </SelectTrigger>
      <SelectContent>
        {data?.map((w) => (
          <SelectItem key={w.id} value={String(w.id)}>
            {w.title}
          </SelectItem>
        ))}
        {authorId && (!data || data.length === 0) ? (
          <SelectItem value="__empty" disabled>
            선택된 작가의 작품이 없습니다
          </SelectItem>
        ) : null}
      </SelectContent>
    </Select>
  );
}
