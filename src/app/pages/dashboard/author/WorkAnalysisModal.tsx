import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Label } from '../../../components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/ui/command';
import {
  Loader2,
  GitGraph,
  Clock,
  PlayCircle,
  Check,
  ChevronsUpDown,
  Maximize2,
} from 'lucide-react';
import { authorService } from '../../../services/authorService';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '../../../components/ui/utils';
import { Mermaid } from '../../../components/Mermaid';

interface WorkAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: number | null;
  userId: string;
}

export function WorkAnalysisModal({
  isOpen,
  onClose,
  workId,
  userId,
}: WorkAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState('relationship');
  const [relationshipChart, setRelationshipChart] = useState<string>('');
  const [timelineChart, setTimelineChart] = useState<string>('');
  const [selectedEpisodes, setSelectedEpisodes] = useState<number[]>([]);

  // Initialize mermaid lazily in MermaidChart component

  const [searchQuery, setSearchQuery] = useState('');

  const relationshipRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    if (!document.fullscreenElement) {
      ref.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Relationship Analysis Mutation
  const analyzeRelationshipMutation = useMutation({
    mutationFn: async () => {
      if (!workId) return;
      return await authorService.analyzeRelationship(workId, userId, '*');
    },
    onSuccess: (data) => {
      if (data) {
        // Ensure graph type is specified
        let chartData = data;
        if (
          !chartData.trim().startsWith('graph') &&
          !chartData.trim().startsWith('sequenceDiagram') &&
          !chartData.trim().startsWith('classDiagram')
        ) {
          chartData = `graph TD\n${chartData}`;
        }
        setRelationshipChart(chartData);
      }
    },
  });

  // Fetch relationship analysis when modal opens - REMOVED for manual trigger preference
  // useEffect(() => {
  //   if (
  //     isOpen &&
  //     workId &&
  //     activeTab === 'relationship' &&
  //     !relationshipChart
  //   ) {
  //     analyzeRelationshipMutation.mutate();
  //   }
  // }, [isOpen, workId, activeTab, relationshipChart]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('relationship');
      setRelationshipChart('');
      setTimelineChart('');
      setSelectedEpisodes([]);
      setSearchQuery('');
      analyzeRelationshipMutation.reset();
      analyzeTimelineMutation.reset();
    }
  }, [isOpen]);

  // Reset charts when work changes while open
  useEffect(() => {
    if (isOpen && workId) {
      setRelationshipChart('');
      setTimelineChart('');
      setSelectedEpisodes([]);
      setSearchQuery('');
      analyzeRelationshipMutation.reset();
      analyzeTimelineMutation.reset();
    }
  }, [workId, isOpen]);

  const { data: episodes, isLoading: isLoadingEpisodes } = useQuery({
    queryKey: ['timeline-episodes', workId],
    queryFn: () => (workId ? authorService.getTimelineEpisodes(workId) : []),
    enabled: isOpen && !!workId && activeTab === 'timeline',
  });

  const analyzeTimelineMutation = useMutation({
    mutationFn: async () => {
      if (!workId || selectedEpisodes.length === 0) return;
      return await authorService.analyzeTimeline(
        workId,
        userId,
        selectedEpisodes,
      );
    },
    onSuccess: (data) => {
      if (data) {
        // Remove title line if present
        const cleanedData = data
          .split('\n')
          .filter((line) => !line.trim().startsWith('title'))
          .join('\n');
        setTimelineChart(cleanedData);
      }
    },
  });

  const toggleEpisode = (episodeId: number) => {
    setSelectedEpisodes((prev) =>
      prev.includes(episodeId)
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId],
    );
  };

  const handleSelectAll = () => {
    if (!episodes) return;
    if (selectedEpisodes.length === episodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(episodes.map((ep) => ep.ep_num));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[70vh] mx-auto flex flex-col p-0 gap-0 bg-background text-foreground">
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold">
              작품 심층 분석
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4 border-b bg-muted/50">
            <TabsList className="bg-muted">
              <TabsTrigger value="relationship" className="gap-2">
                <GitGraph className="w-4 h-4" />
                전체 인물 관계도
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Clock className="w-4 h-4" />
                사건 타임라인
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden bg-muted/30">
            <TabsContent
              value="relationship"
              className="h-full mt-0 p-6 flex flex-col"
            >
              <div className="bg-card rounded-xl shadow-sm border h-full overflow-hidden relative flex flex-col group">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFullscreen(relationshipRef)}
                  className="absolute top-3 right-3 z-10 bg-background/50 backdrop-blur-sm hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={!relationshipChart}
                  title="전체화면"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                <div
                  ref={relationshipRef}
                  className="w-full h-full p-2 flex items-center justify-center bg-card"
                >
                  {analyzeRelationshipMutation.isPending ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p>전체 인물 관계도를 분석하고 있습니다...</p>
                    </div>
                  ) : relationshipChart ? (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto">
                      <Mermaid chart={relationshipChart} showControls={false} />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                      <Button
                        onClick={() => analyzeRelationshipMutation.mutate()}
                        variant="outline"
                      >
                        <GitGraph className="w-4 h-4 mr-2" />
                        관계도 분석 시작
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="h-full mt-0 flex flex-col">
              <div className="flex flex-col h-full bg-muted/30">
                {/* Control Bar */}
                <div className="bg-card border-b p-4 flex items-center justify-between gap-4 shrink-0 shadow-sm z-10">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 w-full">
                      <Checkbox
                        id="select-all"
                        checked={
                          !!episodes &&
                          episodes.length > 0 &&
                          selectedEpisodes.length === episodes.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                      <Label
                        htmlFor="select-all"
                        className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        전체 선택
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-[280px] justify-between h-9 px-3 text-sm font-normal',
                              selectedEpisodes.length === 0 &&
                                'text-muted-foreground',
                            )}
                          >
                            <span className="truncate">
                              {selectedEpisodes.length > 0
                                ? `${selectedEpisodes.length}개 회차 선택됨`
                                : '분석할 회차를 선택해주세요'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="회차 검색..." />
                            <CommandList>
                              <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                              <CommandGroup heading="회차 목록">
                                {episodes?.map((ep) => (
                                  <CommandItem
                                    key={ep.ep_num}
                                    value={`${ep.ep_num} ${ep.subtitle}`}
                                    onSelect={() => toggleEpisode(ep.ep_num)}
                                    className="cursor-pointer"
                                  >
                                    <div
                                      className={cn(
                                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                        selectedEpisodes.includes(ep.ep_num)
                                          ? 'bg-primary text-primary-foreground'
                                          : 'opacity-50 [&_svg]:invisible',
                                      )}
                                    >
                                      <Check className={cn('h-4 w-4')} />
                                    </div>
                                    <span className="font-medium mr-2">
                                      {ep.ep_num}화
                                    </span>
                                    <span className="text-muted-foreground truncate flex-1">
                                      {ep.subtitle}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <Button
                        onClick={() => analyzeTimelineMutation.mutate()}
                        disabled={
                          selectedEpisodes.length === 0 ||
                          analyzeTimelineMutation.isPending
                        }
                        size="sm"
                        className="gap-2 px-4"
                      >
                        {analyzeTimelineMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                        분석
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 p-6 overflow-hidden">
                  <div
                    ref={timelineRef}
                    className="w-full h-full bg-card rounded-xl border shadow-sm overflow-hidden relative flex flex-col group"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFullscreen(timelineRef)}
                      className="absolute top-3 right-3 z-10 bg-background/50 backdrop-blur-sm hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={!timelineChart}
                      title="전체화면"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>

                    {analyzeTimelineMutation.isPending ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground animate-in fade-in duration-300">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <div className="text-center space-y-1">
                          <p className="font-medium text-foreground">
                            사건 타임라인을 분석하고 있습니다...
                          </p>
                          <p className="text-sm">
                            선택하신 회차의 분량에 따라 시간이 소요될 수
                            있습니다.
                          </p>
                        </div>
                      </div>
                    ) : timelineChart ? (
                      <div className="w-full h-full p-4 overflow-auto bg-card">
                        <Mermaid
                          chart={timelineChart}
                          className="h-full w-full"
                          showControls={false}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-4 p-8 text-center">
                        <div className="p-6 rounded-full bg-muted/50 ring-1 ring-border">
                          <Clock className="w-12 h-12 stroke-1" />
                        </div>
                        <div className="max-w-sm space-y-2">
                          <h3 className="font-medium text-foreground text-lg">
                            사건 타임라인 분석
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            상단 메뉴에서 분석하고 싶은 회차를 선택한 후<br />
                            <span className="font-medium text-primary">
                              분석하기
                            </span>{' '}
                            버튼을 눌러주세요.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-4 border-t bg-card flex justify-end shrink-0">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
