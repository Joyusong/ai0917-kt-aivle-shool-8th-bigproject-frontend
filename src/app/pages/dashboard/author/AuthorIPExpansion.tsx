import { useState, useContext, useEffect } from 'react';
import { AuthorBreadcrumbContext } from './AuthorBreadcrumbContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Search,
  Filter,
  ChevronRight,
  Loader2,
  Share2,
  CheckCircle,
  Lock,
  ClipboardList,
  Plus,
} from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';
import { IPProposalDto } from '../../../types/author';
import { format, differenceInCalendarDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { toast } from 'sonner';

interface AuthorIPExpansionProps {
  defaultTab?: string;
}

export function AuthorIPExpansion({
  defaultTab = 'proposals',
}: AuthorIPExpansionProps) {
  const { setBreadcrumbs, onNavigate } = useContext(AuthorBreadcrumbContext);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedProposal, setSelectedProposal] =
    useState<IPProposalDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generatedAuthorCode, setGeneratedAuthorCode] = useState('');

  useEffect(() => {
    const breadcrumbs: { label: string; onClick?: () => void }[] = [
      { label: '홈', onClick: () => onNavigate('home') },
      { label: 'IP 제안서', onClick: () => setActiveTab('proposals') },
    ];

    setBreadcrumbs(breadcrumbs);
  }, [setBreadcrumbs, onNavigate, activeTab]);

  // Fetch Proposals
  const { data: proposals, isLoading: isProposalsLoading } = useQuery({
    queryKey: ['author', 'ip-proposals'],
    queryFn: authorService.getIPProposals,
  });

  const { data: myManager, refetch: refetchMyManager } = useQuery({
    queryKey: ['author', 'my-manager'],
    queryFn: authorService.getMyManager,
  });

  const proposalList = proposals || [];

  const handleOpenDetail = (proposal: IPProposalDto) => {
    setSelectedProposal(proposal);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 담당 매니저 정보 카드 */}
      {myManager && myManager.managerName ? (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {myManager.managerName.charAt(0)}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${myManager.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                  aria-label={myManager.isOnline ? '접속중' : '오프라인'}
                  title={myManager.isOnline ? '접속중' : '오프라인'}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  담당 운영자: {myManager.managerName}
                </h3>
                <p className="text-sm text-blue-700">
                  {myManager.managerSiteEmail || myManager.managerEmail}
                </p>
                {/* 매칭일 표시는 요청에 따라 제거 */}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-medium">
                IP 확장을 위한 1:1 지원을 받고 있습니다
              </p>
              <Button
                size="sm"
                variant="destructive"
                className="mt-2"
                onClick={async () => {
                  const ok = window.confirm('운영자와의 연동을 끊을까요?');
                  if (!ok) return;
                  try {
                    await authorService.unlinkManager();
                    await refetchMyManager();
                    toast.success('연결을 끊었습니다');
                  } catch (e) {
                    toast.error('연결 끊기에 실패했습니다');
                  }
                }}
              >
                연결 끊기
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* 제안서 검토 탭 */}
        <TabsContent value="proposals" className="mt-6 space-y-6">
          <div className="flex items-center justify-end gap-2">
            {/* 운영자와 매칭되지 않은 경우에만 작가 ID 생성 버튼 표시 */}
            {(!myManager || !myManager.managerName) && (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={async () => {
                  try {
                    const code = await authorService.generateAuthorCode();
                    setGeneratedAuthorCode(code);
                    setIsGenerateOpen(true);
                  } catch (err) {
                    toast.error('작가 ID 생성에 실패했습니다.');
                  }
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> 작가 ID 생성
              </Button>
            )}
          </div>

          {isProposalsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {proposalList.length > 0 ? (
                proposalList.map((proposal) => (
                  <Card
                    key={proposal.id}
                    className="hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => handleOpenDetail(proposal)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge
                          variant={
                            proposal.status === 'PENDING'
                              ? 'default'
                              : 'secondary'
                          }
                          className="mb-2"
                        >
                          {proposal.statusDescription}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {proposal.receivedAt
                            ? format(
                                new Date(proposal.receivedAt),
                                'yyyy.MM.dd',
                              )
                            : '-'}
                        </span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {proposal.title}
                      </CardTitle>
                      <CardDescription>{proposal.sender}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                        {proposal.content}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  도착한 제안서가 없습니다.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Generated Author ID Modal */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>생성된 작가 ID</DialogTitle>
            <DialogDescription>
              아래 코드를 복사하여 필요한 곳에 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input readOnly value={generatedAuthorCode} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Proposal Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>제안서 상세 내용</DialogTitle>
            <DialogDescription>
              {selectedProposal?.sender}에서 보낸 제안서입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <span className="font-semibold text-sm">제목</span>
              <div className="col-span-3 font-medium">
                {selectedProposal?.title}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <span className="font-semibold text-sm">보낸 사람</span>
              <div className="col-span-3">{selectedProposal?.sender}</div>
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <span className="font-semibold text-sm">받은 날짜</span>
              <div className="col-span-3">
                {selectedProposal?.receivedAt
                  ? format(new Date(selectedProposal.receivedAt), 'yyyy.MM.dd')
                  : '-'}
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <span className="font-semibold text-sm">제안 내용</span>
              <div className="p-4 bg-muted/50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap h-[200px] overflow-y-auto">
                {selectedProposal?.content}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-700 dark:text-blue-300">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>
                제안을 수락하면 자동으로 계약 단계로 넘어가며, 담당자가
                배정됩니다.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                toast.info('추후 업데이트 예정입니다.');
                setIsDetailOpen(false);
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              거절하기
            </Button>
            <Button
              onClick={() => {
                toast.info('추후 업데이트 예정입니다.');
                setIsDetailOpen(false);
              }}
            >
              수락하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
