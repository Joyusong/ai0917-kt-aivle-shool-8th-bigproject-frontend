import { useState, useEffect } from 'react';
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

  // Fetch relationship analysis when modal opens
  useEffect(() => {
    if (
      isOpen &&
      workId &&
      activeTab === 'relationship' &&
      !relationshipChart
    ) {
      analyzeRelationshipMutation.mutate();
    }
  }, [isOpen, workId, activeTab]);

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
      <DialogContent className="max-w-[95vw] h-[85vh] flex flex-col p-0 gap-0 bg-background text-foreground">
        <DialogHeader className="p-6 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            작품 심층 분석
          </DialogTitle>
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
              <div className="bg-card rounded-xl shadow-sm border h-full overflow-auto relative flex flex-col">
                <div className="min-w-full min-h-full p-6 flex items-center justify-center">
                  {analyzeRelationshipMutation.isPending ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p>전체 인물 관계도를 분석하고 있습니다...</p>
                    </div>
                  ) : relationshipChart ? (
                    <Mermaid chart={relationshipChart} />
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
              {/* Episode Selection Bar (Top) */}
              <div className="bg-card border-b flex flex-wrap items-center gap-6 p-4 shrink-0">
                <div className="flex items-center gap-4 flex-1 min-w-[300px] max-w-2xl">
                  <h3 className="font-medium text-sm text-foreground shrink-0">
                    에피소드 선택
                  </h3>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="flex-1 w-full justify-between text-left font-normal"
                        disabled={isLoadingEpisodes || !episodes}
                      >
                        {selectedEpisodes.length > 0
                          ? `${selectedEpisodes.length}개 에피소드 선택됨`
                          : '분석할 에피소드를 선택하세요'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[230px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="에피소드 검색..." />
                        <CommandList>
                          <CommandEmpty>에피소드가 없습니다.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="select-all"
                              onSelect={handleSelectAll}
                              className="font-medium text-primary justify-center text-center bg-muted/50 hover:bg-muted my-1 cursor-pointer"
                            >
                              {episodes &&
                              selectedEpisodes.length === episodes.length
                                ? '전체 해제'
                                : '전체 선택'}
                            </CommandItem>
                            {episodes?.map((ep) => (
                              <CommandItem
                                key={ep.ep_num}
                                value={`${ep.ep_num}화 ${ep.subtitle}`}
                                onSelect={() => toggleEpisode(ep.ep_num)}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedEpisodes.includes(ep.ep_num)
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                <span className="truncate">
                                  {ep.ep_num}화. {ep.subtitle}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                  <Button
                    onClick={() => analyzeTimelineMutation.mutate()}
                    disabled={
                      selectedEpisodes.length === 0 ||
                      analyzeTimelineMutation.isPending
                    }
                    className="gap-2 px-6"
                  >
                    {analyzeTimelineMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                    분석 시작
                  </Button>
                </div>
              </div>

              {/* Chart Area (Bottom) */}
              <div className="flex-1 p-6 overflow-hidden flex flex-col bg-muted/30">
                <div className="bg-card rounded-xl shadow-sm border flex-1 overflow-auto relative flex flex-col">
                  <div className="min-w-full min-h-full p-6 flex items-center justify-center">
                    {timelineChart ? (
                      <Mermaid chart={timelineChart} />
                    ) : (
                      <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>상단에서 에피소드를 선택하여 분석을 시작하세요.</p>
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
