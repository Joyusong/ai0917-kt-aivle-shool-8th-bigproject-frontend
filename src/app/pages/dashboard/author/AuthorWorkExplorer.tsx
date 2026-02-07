import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Book,
  FileText,
  Plus,
  MoreVertical,
  Folder,
  File,
  Loader2,
  Info,
  CheckCircle2,
  BookOpen,
  AlertTriangle,
  Lock,
  ArrowDownAZ,
  ArrowUpAZ,
  Edit2,
  Trash2,
  FileBox,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../../../components/ui/context-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { cn } from '../../../components/ui/utils';
import { useQuery } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';
import { WorkResponseDto, ManuscriptDto } from '../../../types/author';

interface AuthorWorkExplorerProps {
  works: WorkResponseDto[];
  userId: string;
  selectedWorkId: number | null;
  selectedManuscriptId: number | null;
  onSelectWork: (workId: number) => void;
  onOpenMetadata: (work: WorkResponseDto) => void;
  onOpenLorebook: (work: WorkResponseDto) => void;
  onCreateWork: () => void;
  onRenameWork?: (work: WorkResponseDto) => void;
  onDeleteWork?: (workId: number) => void;
  onSelectManuscript?: (manuscript: ManuscriptDto) => void;
  onUploadManuscript?: (workId: number, nextEpisode?: number) => void;
  onEditManuscript?: (workId: number, manuscript: ManuscriptDto) => void;
  onRenameManuscript?: (
    workId: number,
    manuscriptId: number,
    newTitle: string,
  ) => void;
  onDeleteManuscript?: (workId: number, manuscriptId: number) => void;
  className?: string;
}

export function AuthorWorkExplorer({
  works,
  userId,
  selectedWorkId,
  selectedManuscriptId,
  onSelectWork,
  onOpenMetadata,
  onOpenLorebook,
  onCreateWork,
  onRenameWork,
  onDeleteWork,
  onSelectManuscript,
  onUploadManuscript,
  onEditManuscript,
  onRenameManuscript,
  onDeleteManuscript,
  className,
}: AuthorWorkExplorerProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full border-r border-border bg-card/50',
        className,
      )}
    >
      <div className="h-12 px-4 border-b border-border flex items-center shrink-0 whitespace-nowrap">
        <span className="font-semibold text-sm flex items-center gap-2 whitespace-nowrap min-w-0">
          <Folder className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">내 작품</span>
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={onCreateWork}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>새 작품 생성</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {works.map((work) => (
            <WorkItem
              key={work.id}
              work={work}
              userId={userId}
              isSelected={selectedWorkId === work.id}
              selectedManuscriptId={selectedManuscriptId}
              onSelectWork={onSelectWork}
              onOpenMetadata={() => onOpenMetadata(work)}
              onOpenLorebook={() => onOpenLorebook(work)}
              onRenameWork={onRenameWork}
              onDeleteWork={onDeleteWork}
              onSelectManuscript={onSelectManuscript}
              onUploadManuscript={onUploadManuscript}
              onEditManuscript={onEditManuscript}
              onRenameManuscript={onRenameManuscript}
              onDeleteManuscript={onDeleteManuscript}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface WorkItemProps {
  work: WorkResponseDto;
  userId: string;
  isSelected: boolean;
  selectedManuscriptId: number | null;
  onSelectWork: (id: number) => void;
  onOpenMetadata: () => void;
  onOpenLorebook: () => void;
  onRenameWork?: (work: WorkResponseDto) => void;
  onDeleteWork?: (workId: number) => void;
  onSelectManuscript?: (manuscript: ManuscriptDto) => void;
  onUploadManuscript?: (workId: number, nextEpisode?: number) => void;
  onEditManuscript?: (workId: number, manuscript: ManuscriptDto) => void;
  onRenameManuscript?: (
    workId: number,
    manuscriptId: number,
    newTitle: string,
  ) => void;
  onDeleteManuscript?: (workId: number, manuscriptId: number) => void;
}

function WorkItem({
  work,
  userId,
  isSelected,
  selectedManuscriptId,
  onSelectWork,
  onOpenMetadata,
  onOpenLorebook,
  onRenameWork,
  onDeleteWork,
  onSelectManuscript,
  onUploadManuscript,
  onEditManuscript,
  onRenameManuscript,
  onDeleteManuscript,
}: WorkItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [manuscriptToRename, setManuscriptToRename] =
    useState<ManuscriptDto | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Fetch manuscripts when opened
  const { data: manuscriptsPage } = useQuery({
    queryKey: ['author', 'manuscript', userId, work.title],
    queryFn: () =>
      authorService.getManuscripts(userId, work.title, 0, 10, work.id),
    enabled: isOpen && !!userId,
    placeholderData: (previousData) => previousData,
  });

  const manuscripts = (manuscriptsPage?.content || [])
    .slice()
    .sort((a, b) => b.episode - a.episode);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      onSelectWork(work.id);
    }
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                'flex items-center w-full p-2 rounded-md hover:bg-accent/50 group cursor-pointer text-sm transition-colors whitespace-nowrap',
                isSelected && 'bg-accent text-accent-foreground',
              )}
              onClick={handleToggle}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onOpenLorebook();
              }}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 mr-2 shrink-0"
                >
                  {isOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <Book className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
              <span className="truncate flex-1 text-left">{work.title}</span>
              <span
                className={cn(
                  'ml-2 text-xs px-1.5 py-0.5 rounded-full border shrink-0',
                  work.status === 'COMPLETED'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : work.status === 'NEW'
                      ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                      : 'border-blue-500 text-blue-600 bg-blue-50',
                )}
              >
                {work.status === 'COMPLETED'
                  ? '완결'
                  : work.status === 'NEW'
                    ? '신규'
                    : '연재중'}
              </span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-32">
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                const maxEpisode =
                  manuscripts.length > 0
                    ? Math.max(...manuscripts.map((m) => m.episode || 0))
                    : 0;
                onUploadManuscript?.(work.id, maxEpisode + 1);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              원문 생성
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                onOpenMetadata();
              }}
            >
              <Info className="w-4 h-4 mr-2" />
              메타데이터 수정
            </ContextMenuItem>
            <ContextMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => {
                onDeleteWork?.(work.id);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              작품 삭제
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <CollapsibleContent className="pl-6 space-y-1">
          {/* Manuscripts Section */}
          {manuscripts && manuscripts.length > 0 ? (
            <div className="mb-2">
              {manuscripts.map((manuscript) => {
                const ManuscriptContent = (
                  <div
                    className={cn(
                      'flex items-center w-full p-2 rounded-md hover:bg-accent/50 cursor-pointer text-sm transition-colors whitespace-nowrap',
                      selectedManuscriptId === manuscript.id &&
                        'bg-accent text-accent-foreground',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectManuscript?.(manuscript);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1 text-left">
                      <span className="text-xs text-muted-foreground mr-0.5">
                        ({manuscript.episode}화)
                      </span>
                      {manuscript.subtitle || '무제'}
                    </span>
                    {/* ReadOnly Lock Icon for Manuscript Item */}
                    {manuscript.readOnly && (
                      <Lock className="w-3 h-3 text-slate-400 ml-auto mr-2" />
                    )}
                  </div>
                );

                if (manuscript.readOnly) {
                  return <div key={manuscript.id}>{ManuscriptContent}</div>;
                }

                return (
                  <ContextMenu key={manuscript.id}>
                    <ContextMenuTrigger>{ManuscriptContent}</ContextMenuTrigger>
                    <ContextMenuContent className="w-32">
                      <ContextMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setManuscriptToRename(manuscript);
                          setRenameInput(manuscript.subtitle || '');
                          setIsRenameDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        원문 이름 변경
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteManuscript?.(work.id, manuscript.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        원문 삭제
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          ) : (
            <div className="py-2 px-2 text-xs text-muted-foreground italic">
              데이터가 없습니다.
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>원문 이름 변경</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              placeholder="원문 이름을 입력하세요"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (manuscriptToRename && renameInput.trim()) {
                    onRenameManuscript?.(
                      work.id,
                      manuscriptToRename.id,
                      renameInput.trim(),
                    );
                    setIsRenameDialogOpen(false);
                  }
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                if (manuscriptToRename && renameInput.trim()) {
                  onRenameManuscript?.(
                    work.id,
                    manuscriptToRename.id,
                    renameInput.trim(),
                  );
                  setIsRenameDialogOpen(false);
                }
              }}
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
