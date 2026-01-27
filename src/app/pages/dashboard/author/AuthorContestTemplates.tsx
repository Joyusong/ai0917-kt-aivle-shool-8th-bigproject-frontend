import { useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Loader2,
  Search,
  Star,
  CheckCircle2,
  Download,
  ArrowRight,
  AlertTriangle,
  FileText,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Progress } from '../../../components/ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../components/ui/alert';

import { ContestTemplateDto, WorkResponseDto } from '../../../types/author';
import { authorService } from '../../../services/authorService';
import { AuthorBreadcrumbContext } from './AuthorBreadcrumbContext';

export function AuthorContestTemplates() {
  const { setBreadcrumbs, onNavigate } = useContext(AuthorBreadcrumbContext);

  useEffect(() => {
    setBreadcrumbs([
      { label: '홈', onClick: () => onNavigate('home') },
      { label: '공모전' },
    ]);
  }, [setBreadcrumbs, onNavigate]);

  const { data: templates, isLoading } = useQuery<ContestTemplateDto[]>({
    queryKey: ['author', 'contest-templates'],
    queryFn: authorService.getContestTemplates,
  });

  // Mock Works for Dropdown
  const { data: works } = useQuery<WorkResponseDto[]>({
    queryKey: ['author', 'works'],
    queryFn: () => authorService.getWorks(''),
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContestTemplateDto | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState<string>('');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');

  // Track review status per template: 'idle' | 'processing' | 'done'
  const [reviewStatus, setReviewStatus] = useState<
    Record<number, 'idle' | 'processing' | 'done'>
  >({});

  const templateList = templates || [];

  const handleReviewClick = (template: ContestTemplateDto) => {
    if (reviewStatus[template.id] === 'done') {
      setSelectedTemplate(template);
      setIsResultModalOpen(true);
    } else {
      setSelectedTemplate(template);
      setIsReviewModalOpen(true);
      setSelectedWorkId('');
      setSelectedEpisodeId('');
    }
  };

  const handleStartReview = () => {
    if (!selectedWorkId) {
      toast.error('작품을 선택해주세요.');
      return;
    }

    if (!selectedTemplate) return;

    // 1. Close Modal & Set Processing
    setIsReviewModalOpen(false);
    setReviewStatus((prev) => ({
      ...prev,
      [selectedTemplate.id]: 'processing',
    }));

    // 2. Simulate API Call & Notification
    toast.promise(new Promise((resolve) => setTimeout(resolve, 3000)), {
      loading: '유사도 검사 및 설정집 정합성 분석 중...',
      success: () => {
        setReviewStatus((prev) => ({ ...prev, [selectedTemplate.id]: 'done' }));
        return '분석이 완료되었습니다! 결과를 확인해주세요.';
      },
      error: '분석 중 오류가 발생했습니다.',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="공모전 검색..." className="pl-8" />
        </div>
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80 px-3 py-1"
          >
            전체
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-accent px-3 py-1"
          >
            판타지
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-accent px-3 py-1"
          >
            로맨스
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templateList.length > 0 ? (
            templateList.map((template) => (
              <Card
                key={template.id}
                className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow border-border"
              >
                <div className="h-20 bg-gradient-to-r from-purple-500 to-indigo-600 relative p-3 flex flex-col justify-between">
                  <Badge className="self-start bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm text-xs">
                    {template.deadline}
                  </Badge>
                  <div className="text-white font-bold text-base drop-shadow-md line-clamp-1">
                    {template.title}
                  </div>
                  <Trophy className="absolute right-4 bottom-4 text-white/20 w-10 h-10 rotate-12" />
                </div>
                <CardContent className="flex-1 p-3 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">주최</span>
                      <span className="font-medium">{template.organizer}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">분야</span>
                      <span className="font-medium">{template.category}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">상금</span>
                      <span className="font-medium text-blue-600">
                        {template.prize}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-dashed">
                    {template.isAiSupported && (
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>AI 분석 템플릿 제공</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-3 bg-muted/30 border-t">
                  <Button
                    className="w-full h-8 text-xs group"
                    variant={
                      reviewStatus[template.id] === 'done'
                        ? 'outline'
                        : 'default'
                    }
                    onClick={() => handleReviewClick(template)}
                    disabled={reviewStatus[template.id] === 'processing'}
                  >
                    {reviewStatus[template.id] === 'processing' ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        분석 중...
                      </>
                    ) : reviewStatus[template.id] === 'done' ? (
                      <>
                        검토 확인
                        <ArrowRight className="ml-2 w-3 h-3" />
                      </>
                    ) : (
                      <>
                        공모전 제출 검토
                        <CheckCircle2 className="ml-2 w-3 h-3 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              진행 중인 공모전이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* Submission Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>공모전 제출 검토</DialogTitle>
            <DialogDescription>
              작품의 설정 정합성과 공모전 요강 적합성을 AI가 분석합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>검토할 작품</Label>
              <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                <SelectTrigger>
                  <SelectValue placeholder="작품을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {works?.map((work) => (
                    <SelectItem key={work.id} value={work.id.toString()}>
                      {work.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedWorkId && (
              <div className="space-y-2">
                <Label>검토 범위</Label>
                <Select
                  value={selectedEpisodeId}
                  onValueChange={setSelectedEpisodeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체 회차 (누적)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 회차 (누적)</SelectItem>
                    <SelectItem value="latest">최신 회차만</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">안내</AlertTitle>
              <AlertDescription className="text-blue-700 text-xs">
                설정집과 본문의 내용을 대조하여 정합성을 검사합니다. 회차 분량에
                따라 1분 이상 소요될 수 있습니다.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleStartReview} disabled={!selectedWorkId}>
              검토 요청
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Modal */}
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              검토 결과 보고서
            </DialogTitle>
            <DialogDescription>
              AI 분석 결과, 다음과 같은 정합성 이슈가 발견되었습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Summary Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>공모전 적합성</span>
                <span className="text-green-600">92%</span>
              </div>
              <Progress
                value={92}
                className="h-2 bg-green-100"
                indicatorClassName="bg-green-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>설정 정합성</span>
                <span className="text-orange-600">78%</span>
              </div>
              <Progress
                value={78}
                className="h-2 bg-orange-100"
                indicatorClassName="bg-orange-600"
              />
            </div>

            <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                발견된 이슈
              </h4>

              <div className="space-y-3">
                <div className="bg-white dark:bg-card p-3 rounded border border-orange-200 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Episode 5
                    </span>
                    <span className="text-xs text-muted-foreground">
                      캐릭터 성격 불일치
                    </span>
                  </div>
                  <p className="text-sm">
                    주인공 '강민우'의 성격 키워드는 [냉철, 신중]이나, 해당
                    회차에서 감정적으로 행동하는 장면이 빈번하게 등장합니다.
                    (신뢰도: 85%)
                  </p>
                </div>

                <div className="bg-white dark:bg-card p-3 rounded border border-orange-200 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Episode 8
                    </span>
                    <span className="text-xs text-muted-foreground">
                      설정 충돌
                    </span>
                  </div>
                  <p className="text-sm">
                    설정집상 '마나석'은 붉은색이나, 본문에서는 푸른색으로
                    묘사되었습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-sm text-blue-900 mb-2">
                💡 개선 제안
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  Episode 5의 대사를 수정하여 주인공의 냉철한 면모를
                  부각시키세요.
                </li>
                <li>
                  마나석 색상 묘사를 설정집에 맞게 '붉은색'으로 통일하세요.
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsResultModalOpen(false)}>
              확인 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
