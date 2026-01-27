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
  onReviewRequired?: (workId: number, episode: EpisodeDto) => void;
  className?: string;
}

export function AuthorWorkExplorer({
  works,
  selectedWorkId,
  selectedEpisodeId,
  onSelectWork,
  onSelectEpisode,
  onOpenMetadata,
  onOpenLorebook,
  onCreateWork,
  onReviewRequired,
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
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto shrink-0"
                onClick={onCreateWork}
              >
                <Plus className="w-4 h-4" />
              </Button>
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
              onReviewRequired={onReviewRequired}
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
  onReviewRequired?: (workId: number, episode: EpisodeDto) => void;
}

function WorkItem({
  work,
  isSelected,
  selectedEpisodeId,
  onSelectWork,
  onSelectEpisode,
  onOpenMetadata,
  onOpenLorebook,
  onReviewRequired,
}: WorkItemProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
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

        {/* Icons Group */}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMetadata();
                  }}
                >
                  <Info className="w-3 h-3 text-muted-foreground hover:text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>메타데이터 보기</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLorebook();
                  }}
                >
                  <BookOpen className="w-3 h-3 text-muted-foreground hover:text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>설정집 보기</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <CollapsibleContent className="pl-6 space-y-1">
        {isLoading ? (
          <div className="flex items-center py-2 px-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            로딩 중...
          </div>
        ) : (
          episodes?.map((episode, index) => {
            const isLastEpisode = index === episodes.length - 1;
            const isCompletedWork = work.status === 'COMPLETED';

            return (
              <div
                key={episode.id}
                className={cn(
                  'flex items-center p-2 rounded-md hover:bg-accent/50 cursor-pointer text-xs transition-colors',
                  selectedEpisodeId === episode.id &&
                    'bg-accent text-accent-foreground font-medium',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (episode.isReviewPending && onReviewRequired) {
                    onReviewRequired(work.id, episode);
                  } else {
                    onSelectEpisode(work.id, episode);
                  }
                }}
              >
                <FileText className="w-3 h-3 mr-2 text-muted-foreground" />
                <span className="truncate flex-1">{episode.title}</span>
                {!isLastEpisode && (
                  <Lock className="w-3 h-3 text-muted-foreground ml-2" />
                )}
                {isLastEpisode && (
                  <span
                    className={cn(
                      'ml-2 text-[10px] px-1.5 py-0.5 rounded-full border',
                      isCompletedWork
                        ? 'border-green-500 text-green-600 bg-green-50'
                        : 'border-blue-500 text-blue-600 bg-blue-50',
                    )}
                  >
                    {isCompletedWork ? '완결' : '연재중'}
                  </span>
                )}
                {episode.isReviewPending && (
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
