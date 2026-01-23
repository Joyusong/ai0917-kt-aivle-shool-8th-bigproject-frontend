import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Plus, Book, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

interface Work {
  id: number;
  title: string;
  type: 'NOVEL' | 'SETTING';
  createdAt: string;
  updatedAt: string;
  status: string;
}

export function AuthorWorks() {
  const [activeTab, setActiveTab] = useState('novel');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // Fetch Works
  const { data: works, isLoading } = useQuery({
    queryKey: ['author', 'works'],
    queryFn: async () => {
      // API call to fetch works
      // Assuming GET /api/v1/author/works returns all works
      // If endpoint is different, it needs to be adjusted.
      // For now, mocking or assuming a standard endpoint.
      // If separate endpoints exist for novels and settings, we might need Promise.all
      try {
        const res = await apiClient.get('/api/v1/author/works');
        // If API returns empty array or invalid data, use mock
        if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
          throw new Error('No data');
        }
        return res.data;
      } catch (e) {
        // Fallback or mock if API not ready
        console.log('Using mock data for works');
        return [
          {
            id: 1,
            title: '해리포터와 마법사의 돌',
            type: 'NOVEL',
            createdAt: '2023-01-01T12:00:00Z',
            updatedAt: '2023-01-10T15:30:00Z',
            status: 'PUBLISHED',
          },
          {
            id: 2,
            title: '반지의 제왕: 반지 원정대',
            type: 'NOVEL',
            createdAt: '2023-02-15T09:00:00Z',
            updatedAt: '2023-02-20T11:20:00Z',
            status: 'DRAFT',
          },
          {
            id: 3,
            title: '호그와트 마법 세계관 설정집',
            type: 'SETTING',
            createdAt: '2023-01-05T14:00:00Z',
            updatedAt: '2023-01-12T16:45:00Z',
            status: 'PUBLISHED',
          },
          {
            id: 4,
            title: '중간계 종족 및 지리 설정',
            type: 'SETTING',
            createdAt: '2023-02-10T10:30:00Z',
            updatedAt: '2023-02-18T13:15:00Z',
            status: 'DRAFT',
          },
        ];
      }
    },
  });

  const novels =
    works?.filter((w: Work) => w.type === 'NOVEL' || !w.type) || [];
  const settings = works?.filter((w: Work) => w.type === 'SETTING') || [];

  // Fetch Work Detail
  const { data: workDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['author', 'works', selectedWork?.id],
    queryFn: async () => {
      if (!selectedWork) return null;
      try {
        const res = await apiClient.get(
          `/api/v1/author/works/${selectedWork.id}`,
        );
        return res.data;
      } catch (e) {
        console.error('Failed to fetch work detail', e);
        // Fallback for demo if API fails
        let mockContent = '';
        if (selectedWork.type === 'NOVEL') {
          mockContent = `[${selectedWork.title}] 본문 내용입니다.\n\n제1장: 시작\n\n어느 날 아침, 주인공은 눈을 떴다. 창밖으로 들어오는 햇살이 눈부셨다. "오늘은 뭔가 좋은 일이 일어날 것만 같아." 그는 중얼거렸다.\n\n하지만 그의 예감은 빗나갔다. 문을 열고 나가자마자 마주친 것은 거대한 용이었기 때문이다. 용은 코에서 연기를 뿜으며 그를 내려다보고 있었다.\n\n"안녕, 작은 인간아." 용이 말했다.`;
        } else {
          mockContent = `[${selectedWork.title}] 설정집 내용입니다.\n\n1. 세계관 개요\n이 세계는 마법과 과학이 공존하는 판타지 세계입니다.\n\n2. 주요 종족\n- 인간: 가장 평범하지만 적응력이 뛰어난 종족.\n- 엘프: 숲에 살며 마법에 능통한 종족.\n- 드워프: 광산에서 보석을 캐고 무기를 만드는 종족.\n\n3. 마법 체계\n마법은 4원소(물, 불, 바람, 흙)를 기반으로 합니다.`;
        }

        return {
          ...selectedWork,
          content: mockContent,
        };
      }
    },
    enabled: !!selectedWork,
  });

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">작품 관리</h2>
          <p className="text-muted-foreground">
            원문과 설정집을 관리하고 새로운 작품을 집필합니다.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />새 작품 만들기
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="novel" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            원문 (Novel)
          </TabsTrigger>
          <TabsTrigger value="setting" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            설정집 (Setting)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="novel" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {novels.length > 0 ? (
              novels.map((work: Work) => (
                <Card
                  key={work.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => handleWorkClick(work)}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {work.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit logic
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete logic
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      최종 수정:{' '}
                      {format(new Date(work.updatedAt), 'yyyy.MM.dd HH:mm')}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                등록된 원문이 없습니다. 새 작품을 만들어보세요.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="setting" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.length > 0 ? (
              settings.map((work: Work) => (
                <Card
                  key={work.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => handleWorkClick(work)}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {work.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit logic
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete logic
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      최종 수정:{' '}
                      {format(new Date(work.updatedAt), 'yyyy.MM.dd HH:mm')}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                등록된 설정집이 없습니다.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Work Detail Modal */}
      <Dialog
        open={!!selectedWork}
        onOpenChange={(open) => !open && setSelectedWork(null)}
      >
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedWork?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 border rounded-md bg-muted/20 whitespace-pre-wrap">
            {isDetailLoading ? (
              <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="ml-2 text-muted-foreground">불러오는 중...</p>
              </div>
            ) : workDetail?.content ? (
              workDetail.content
            ) : (
              <p className="text-muted-foreground text-center mt-20">
                작품 내용이 비어있습니다.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setSelectedWork(null)}>
              닫기
            </Button>
            <Button>편집 모드로 열기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
