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
  CardDescription,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  Plus,
  Book,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  Users,
  Globe,
  BookOpen,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
import { authorService } from '../../../services/authorService';
import { WorkResponseDto } from '../../../types/author';
import { AuthorWritingEditor } from './AuthorWritingEditor';
import { Badge } from '../../../components/ui/badge';

interface AuthorWorksProps {
  integrationId: string;
}

// Mock data for settings display
const MOCK_SETTING_BOOKS = [
  {
    id: '1',
    title: '암흑의 영역 - 인물 사전',
    type: 'characters',
    count: 12,
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: '네오 서울 세계관 설정',
    type: 'worldview',
    count: 5,
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: '메인 스토리 플롯',
    type: 'plot',
    count: 8,
    updatedAt: new Date(),
  },
];

export function AuthorWorks({ integrationId }: AuthorWorksProps) {
  const [activeTab, setActiveTab] = useState('novel');
  const [selectedWork, setSelectedWork] = useState<WorkResponseDto | null>(
    null,
  );
  const [writingWork, setWritingWork] = useState<WorkResponseDto | null>(null);

  // Fetch Works
  const { data: works, isLoading } = useQuery({
    queryKey: ['author', 'works', integrationId],
    queryFn: () => authorService.getWorks(integrationId),
    enabled: !!integrationId,
  });

  // Filter works (Assuming all works are novels for now as backend doesn't distinguish yet)
  // If backend adds 'type' field later, we can filter properly.
  const novels = works || [];

  const handleWorkClick = (work: WorkResponseDto) => {
    setSelectedWork(work);
  };

  const handleStartWriting = (work: WorkResponseDto) => {
    setWritingWork(work);
    setSelectedWork(null); // Close modal if open
  };

  if (writingWork) {
    return (
      <AuthorWritingEditor
        workId={writingWork.id.toString()}
        initialTitle={writingWork.title}
        initialContent={writingWork.description} // Using description as initial content for now
        onClose={() => setWritingWork(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {novels.length > 0 ? (
                novels.map((work) => (
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
                              handleStartWriting(work);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            집필
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
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2 min-h-[40px]">
                        {work.description || '설명이 없습니다.'}
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="text-xs text-muted-foreground">
                          생성일:{' '}
                          {work.createdAt
                            ? format(new Date(work.createdAt), 'yyyy.MM.dd')
                            : '-'}
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWriting(work);
                          }}
                        >
                          집필하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  등록된 작품이 없습니다.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="setting" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_SETTING_BOOKS.map((setting) => (
              <Card
                key={setting.id}
                className="cursor-pointer hover:shadow-md transition-shadow group"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-1 flex items-center gap-2">
                    {setting.type === 'characters' && (
                      <Users className="w-4 h-4 text-blue-500" />
                    )}
                    {setting.type === 'worldview' && (
                      <Globe className="w-4 h-4 text-green-500" />
                    )}
                    {setting.type === 'plot' && (
                      <BookOpen className="w-4 h-4 text-purple-500" />
                    )}
                    {setting.title}
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    {setting.type === 'characters' && '등장인물 설정집'}
                    {setting.type === 'worldview' && '세계관/지리 설정집'}
                    {setting.type === 'plot' && '서사/시나리오 설정집'}
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{setting.count}개 항목</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(setting.updatedAt, 'yyyy.MM.dd')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Setting Card */}
            <Card className="flex flex-col items-center justify-center border-dashed cursor-pointer hover:bg-accent/50 transition-colors h-[160px]">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">새 설정집 만들기</span>
              </div>
            </Card>
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
            {selectedWork?.description ? (
              selectedWork.description
            ) : (
              <p className="text-muted-foreground text-center mt-20">
                작품 설명이 없습니다.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setSelectedWork(null)}>
              닫기
            </Button>
            <Button
              onClick={() => selectedWork && handleStartWriting(selectedWork)}
            >
              집필 모드로 열기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
