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
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
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
import { WorkResponseDto, EpisodeDto } from '../../../types/author';

interface AuthorWorkExplorerProps {
  works: WorkResponseDto[];
  selectedWorkId: number | null;
  selectedEpisodeId: number | null;
  onSelectWork: (workId: number) => void;
  onSelectEpisode: (workId: number, episode: EpisodeDto) => void;
  onOpenMetadata: (work: WorkResponseDto) => void;
  onOpenLorebook: (work: WorkResponseDto) => void;
  onCreateWork: () => void;
  onCreateEpisode: (workId: number) => void;
  onReviewRequired?: (workId: number, episode: EpisodeDto) => void;
  onRenameWork?: (work: WorkResponseDto) => void;
  onDeleteWork?: (workId: number) => void;
  onRenameEpisode?: (workId: number, episode: EpisodeDto) => void;
  onDeleteEpisode?: (workId: number, episodeId: number) => void;
  processingStatus?: Record<
    number,
    'EXTRACTING' | 'ANALYZING' | 'REVIEW_READY'
  >;
  className?: string;
}

export function AuthorWorkExplorer({
  works,
  selectedWorkId,
  selectedEpisodeId,
  processingStatus,
  onSelectWork,
  onSelectEpisode,
  onOpenMetadata,
  onOpenLorebook,
  onCreateWork,
  onCreateEpisode,
  onReviewRequired,
  onRenameWork,
  onDeleteWork,
  onRenameEpisode,
  onDeleteEpisode,
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
              isSelected={selectedWorkId === work.id}
              selectedEpisodeId={selectedEpisodeId}
              onSelectWork={onSelectWork}
              onSelectEpisode={onSelectEpisode}
              onOpenMetadata={() => onOpenMetadata(work)}
              onOpenLorebook={() => onOpenLorebook(work)}
              onCreateEpisode={() => onCreateEpisode(work.id)}
              onReviewRequired={onReviewRequired}
              onRenameWork={onRenameWork}
              onDeleteWork={onDeleteWork}
              onRenameEpisode={onRenameEpisode}
              onDeleteEpisode={onDeleteEpisode}
              processingStatus={processingStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface WorkItemProps {
  work: WorkResponseDto;
  isSelected: boolean;
  selectedEpisodeId: number | null;
  onSelectWork: (id: number) => void;
  onSelectEpisode: (workId: number, episode: EpisodeDto) => void;
  onOpenMetadata: () => void;
  onOpenLorebook: () => void;
  onCreateEpisode: () => void;
  onReviewRequired?: (workId: number, episode: EpisodeDto) => void;
  onRenameWork?: (work: WorkResponseDto) => void;
  onDeleteWork?: (workId: number) => void;
  onRenameEpisode?: (workId: number, episode: EpisodeDto) => void;
  onDeleteEpisode?: (workId: number, episodeId: number) => void;
  processingStatus?: Record<
    number,
    'EXTRACTING' | 'ANALYZING' | 'REVIEW_READY'
  >;
}

function WorkItem({
  work,
  isSelected,
  selectedEpisodeId,
  onSelectWork,
  onSelectEpisode,
  onOpenMetadata,
  onOpenLorebook,
  onCreateEpisode,
  onReviewRequired,
  onRenameWork,
  onDeleteWork,
  onRenameEpisode,
  onDeleteEpisode,
  processingStatus,
}: WorkItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch episodes when opened
  const { data: episodes, isLoading } = useQuery({
    queryKey: ['author', 'work', work.id, 'episodes'],
    queryFn: () => authorService.getEpisodes(work.id.toString()),
    enabled: isOpen,
  });

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      onSelectWork(work.id);
    }
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedEpisodes = episodes
    ? [...episodes].sort((a, b) =>
        sortOrder === 'asc' ? a.id - b.id : b.id - a.id,
      )
    : [];

  const latestEpisodeId = episodes
    ? Math.max(...episodes.map((e) => e.id), -1)
    : -1;

  return (
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
                'ml-2 text-[10px] px-1.5 py-0.5 rounded-full border shrink-0',
                work.status === 'COMPLETED'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-blue-500 text-blue-600 bg-blue-50',
              )}
            >
              {work.status === 'COMPLETED' ? '완결' : '연재중'}
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-32">
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCreateEpisode();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            원문 생성
          </ContextMenuItem>
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onOpenMetadata();
            }}
          >
            <Info className="w-4 h-4 mr-2" />
            메타데이터 보기
          </ContextMenuItem>
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onOpenLorebook();
            }}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            설정집 보기
          </ContextMenuItem>
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onRenameWork?.(work);
            }}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            이름 변경
          </ContextMenuItem>
          <ContextMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteWork?.(work.id);
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            작품 삭제
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              toggleSort();
            }}
          >
            {sortOrder === 'asc' ? (
              <>
                <ArrowDownAZ className="w-4 h-4 mr-2" />
                최신순 정렬
              </>
            ) : (
              <>
                <ArrowUpAZ className="w-4 h-4 mr-2" />
                1화부터 정렬
              </>
            )}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <CollapsibleContent className="pl-6 space-y-1">
        {isLoading ? (
          <div className="flex items-center py-2 px-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            로딩 중...
          </div>
        ) : (
          sortedEpisodes.map((episode, index) => {
            const isLatest = episode.id === latestEpisodeId;
            const isCompletedWork = work.status === 'COMPLETED';
            const status = processingStatus?.[episode.id];

            // Only the latest episode is editable unless marked readonly by backend
            const isReadOnly = episode.isReadOnly || !isLatest;
            const episodeWithReadOnly = {
              ...episode,
              isReadOnly,
            };

            return (
              <ContextMenu key={episode.id}>
                <ContextMenuTrigger>
                  <div
                    className={cn(
                      'flex items-center p-2 rounded-md hover:bg-accent/50 cursor-pointer text-xs transition-colors',
                      selectedEpisodeId === episode.id &&
                        'bg-accent text-accent-foreground font-medium',
                      status === 'ANALYZING' && 'animate-pulse bg-blue-500/10',
                      status === 'REVIEW_READY' && 'bg-orange-500/10',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (status === 'REVIEW_READY') {
                        onReviewRequired?.(work.id, episodeWithReadOnly);
                      } else if (episode.isReviewPending && onReviewRequired) {
                        onReviewRequired(work.id, episodeWithReadOnly);
                      } else {
                        onSelectEpisode(work.id, episodeWithReadOnly);
                      }
                    }}
                  >
                    <FileText className="w-3 h-3 mr-2 text-muted-foreground" />
                    <span className="truncate flex-1">{episode.title}</span>
                    {isReadOnly && (
                      <Lock className="w-3 h-3 text-muted-foreground ml-2" />
                    )}

                    {/* Processing Status Indicators */}
                    {status === 'ANALYZING' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Loader2 className="w-3 h-3 text-blue-500 ml-2 animate-spin" />
                          </TooltipTrigger>
                          <TooltipContent>AI 분석 중...</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {(status === 'REVIEW_READY' || episode.isReviewPending) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="w-3 h-3 text-orange-500 ml-2" />
                          </TooltipTrigger>
                          <TooltipContent>설정집 확인 필요</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-32">
                  <ContextMenuItem
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameEpisode?.(work.id, episode);
                    }}
                  >
                    <Edit2 className="w-3 h-3 mr-2" />
                    이름 변경
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEpisode?.(work.id, episode.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    원문 삭제
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })
        )}
        {episodes?.length === 0 && (
          <div className="py-2 px-2 text-xs text-muted-foreground italic">
            에피소드가 없습니다.
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
