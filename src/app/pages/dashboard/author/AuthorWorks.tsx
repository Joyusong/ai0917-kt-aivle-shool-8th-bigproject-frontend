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
import { Plus, Book, FileText, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
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

interface AuthorWorksProps {
  integrationId: string;
}

export function AuthorWorks({ integrationId }: AuthorWorksProps) {
  const [activeTab, setActiveTab] = useState('novel');
  const [selectedWork, setSelectedWork] = useState<WorkResponseDto | null>(null);

  // Fetch Works
  const { data: works, isLoading } = useQuery({
    queryKey: ['author', 'works', integrationId],
    queryFn: () => authorService.getWorks(integrationId),
    enabled: !!integrationId,
  });

  // Filter works (Assuming all works are novels for now as backend doesn't distinguish yet)
  // If backend adds 'type' field later, we can filter properly.
  const novels = works || [];
  const settings: WorkResponseDto[] = []; // Placeholder for now

  const handleWorkClick = (work: WorkResponseDto) => {
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
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {work.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        생성일:{' '}
                        {work.createdAt
                          ? format(new Date(work.createdAt), 'yyyy.MM.dd HH:mm')
                          : '-'}
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
          )}
        </TabsContent>

        <TabsContent value="setting" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.length > 0 ? (
              settings.map((work) => (
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
                    <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {work.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      생성일:{' '}
                      {work.createdAt
                        ? format(new Date(work.createdAt), 'yyyy.MM.dd HH:mm')
                        : '-'}
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
            <Button>편집 모드로 열기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
