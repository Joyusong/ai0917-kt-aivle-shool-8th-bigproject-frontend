import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Loader2,
  Play,
  RefreshCw,
  Terminal,
  MessageSquare,
  Maximize2,
  X,
  Sparkles,
  Server,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const PROMPT_TEMPLATES = [
  {
    id: 'free',
    label: '자유 입력 (Free)',
    description: '빈 화면에서 자유롭게 입력합니다.',
    content: '',
  },
  {
    id: 'novel_start',
    label: '📖 소설 도입부 생성',
    description: '장르와 주인공 설정을 바탕으로 첫 장면을 만듭니다.',
    content: `장르: 판타지\n주인공 이름: 강민우\n주인공 특징: 마력을 느끼지 못하는 마법사 가문의 장남\n\n위 설정을 바탕으로 독자의 호기심을 자극하는 소설의 첫 도입부(약 500자)를 흥미진진하게 작성해줘.`,
  },
  {
    id: 'character_creation',
    label: '👤 입체적 캐릭터 빌딩',
    description: '단순한 설정을 깊이 있는 캐릭터로 확장합니다.',
    content: `이름: \n나이: \n직업: \n성격 키워드: \n\n위 정보를 바탕으로 입체적인 등장인물 설정을 상세히 만들어줘.\n1. 외모 묘사\n2. 말투와 습관\n3. 남들에게 말 못 할 비밀\n4. 이 캐릭터의 치명적인 약점`,
  },
  {
    id: 'plot_twist',
    label: '⚡ 반전 전개 아이디어',
    description: '위기 상황을 타개할 반전 아이디어를 제안받습니다.',
    content: `현재 상황: 주인공이 믿었던 동료에게 배신당해 절벽 끝에 몰림.\n\n이 상황에서 독자가 전혀 예상하지 못한 충격적인 반전 전개 아이디어 3가지를 제안해줘. (각 아이디어는 개연성이 있어야 함)`,
  },
];

/**
 * AI Lab Page (Ver 2.0 - 아지트 에디션)
 *
 * 🏠 여기가 우리의 아지트야!
 * AI 기능을 맘껏 테스트하고, 모달이나 각종 UI 컴포넌트들을 실험해보는 공간이지.
 *
 * [새로 추가된 것들]
 * 1. ✨ 모달(Dialog) 놀이터: 팝업창 띄우는 법을 마스터해보자!
 * 2. 🤖 AI 페르소나 테스트: AI 말투를 바꿔보는 실험
 */
export default function AILabPage() {
  // 1. 상태 관리 (State Management)
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('friend');
  const [selectedTemplate, setSelectedTemplate] = useState('free');

  // API 설정 상태
  const [useRealApi, setUseRealApi] = useState(false);
  const [apiUrl, setApiUrl] = useState(
    'http://localhost:8000/api/v1/ai/generate',
  );

  // 타자기 효과를 위한 Ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 2. AI 응답 처리 (Simulation or Real API)
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsStreaming(true);
    setResult('');
    setJsonData(null);

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (useRealApi) {
      await handleRealApiCall();
    } else {
      handleSimulation();
    }
  };

  // 2-1. 시뮬레이션 모드
  const handleSimulation = () => {
    // AI 페르소나에 따른 응답 변화 (재미 요소!)
    const dummyResponse = `[AI 친구]: 안녕! 네가 입력한 "${prompt}"에 대해 생각해봤어.\n\n이건 정말 흥미로운 주제인걸? 내가 분석한 내용을 알려줄게.\n\n1. ✨ 핵심은 바로 이것!\n2. 💡 이런 아이디어는 어때?\n3. 🚀 당장 시도해보자!\n\n(이 응답은 실제 AI가 아니라, 우리가 만든 시뮬레이션이야. 멋지지?)`;

    const dummyJson = {
      status: 'success',
      model: 'friend-bot-v1',
      tokens: {
        prompt: prompt.length,
        completion: dummyResponse.length,
      },
      metadata: {
        vibe: 'friendly',
        timestamp: new Date().toISOString(),
      },
    };

    let currentIndex = 0;

    intervalRef.current = setInterval(() => {
      if (currentIndex < dummyResponse.length) {
        setResult((prev) => prev + dummyResponse[currentIndex]);
        currentIndex++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsStreaming(false);
        setJsonData(dummyJson);
      }
    }, 30);
  };

  // 2-2. Real API 모드 (FastAPI 연동)
  const handleRealApiCall = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 토큰이 있다면 추가 (없으면 무시됨)
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          prompt: prompt,
          // 필요한 다른 파라미터들도 여기에 추가 가능
          temperature: 0.7,
        }),
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // 스트리밍 응답 처리 (Server-Sent Events or Chunked Transfer)
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // JSON 응답인 경우와 텍스트 스트림인 경우 구분 필요
          // 여기서는 단순 텍스트 스트리밍 또는 줄바꿈된 JSON 스트림이라고 가정
          // 실제 백엔드 구현에 따라 파싱 로직을 조정해야 함

          // 1. 단순 텍스트 누적
          fullText += chunk;
          setResult((prev) => prev + chunk);
        }

        setJsonData({
          status: 'success',
          source: 'FastAPI',
          rawResponse: 'Streaming Completed',
        });
      } else {
        // 스트리밍이 아닌 단일 JSON 응답일 경우
        const data = await response.json();
        setResult(data.answer || JSON.stringify(data, null, 2));
        setJsonData(data);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        setResult(`❌ 오류 발생: ${error.message}`);
        setJsonData({ error: error.message });
      }
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  function handleTemplateChange(value: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center border-b pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              AI Creative Lab
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            우리의 상상력이 실현되는 비밀 아지트 ⛺
          </p>
        </div>

        {/* 모달(Dialog) 실험실 */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-dashed border-2">
              <Maximize2 className="h-4 w-4" />
              모달 띄워보기
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>🎉 짠! 이게 바로 모달이야</DialogTitle>
              <DialogDescription>
                사용자의 주의를 집중시키고 싶을 때 사용하는 팝업창이지. 배경이
                어두워지면서(Overlay) 이 창만 돋보이게 돼.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm">
                "로그인이 필요합니다" 또는 "정말 삭제하시겠습니까?" 같은 중요한
                메시지를 띄울 때 딱이야!
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setModalOpen(false)}>
                확인했어! (닫기)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* 왼쪽: 컨트롤 패널 (4칸 차지) */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                Prompt Station
              </CardTitle>
              <CardDescription>AI 친구에게 말을 걸어보자</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  AI 페르소나 (말투 선택)
                </Label>
                <Select
                  value={selectedPersona}
                  onValueChange={setSelectedPersona}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="페르소나 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friend">다정한 친구 (반말)</SelectItem>
                    <SelectItem value="expert">
                      냉철한 전문가 (존댓말)
                    </SelectItem>
                    <SelectItem value="writer">
                      감성적인 소설가 (문학적)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  프롬프트 템플릿 (빠른 시작)
                </Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="템플릿 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPT_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate !== 'free' && (
                  <p className="text-[10px] text-muted-foreground ml-1">
                    *{' '}
                    {
                      PROMPT_TEMPLATES.find((t) => t.id === selectedTemplate)
                        ?.description
                    }
                  </p>
                )}
              </div>

              <Textarea
                placeholder="오늘 기분은 어때? AI에게 하고 싶은 말을 적어봐..."
                className="min-h-[200px] resize-none focus-visible:ring-purple-500"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                onClick={handleGenerate}
                disabled={isStreaming || !prompt.trim()}
                size="lg"
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    열심히 생각하는 중... 🧠
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    실행 (Run)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 개발자 노트 (팁) */}
          <Card className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center text-yellow-700 dark:text-yellow-500">
                <Terminal className="mr-2 h-4 w-4" />
                멘토의 쪽지 📝
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                <span className="font-bold text-foreground">
                  💡 멘토의 조언:
                </span>{' '}
                POSTMAN은 JSON 데이터를 날것으로 보여주지만, 여기서는
                <strong> 스트리밍 응답을 실시간 타자기 효과</strong>로 볼 수
                있고, 위의 <strong>페르소나 선택</strong>처럼 미리 정의된 시스템
                프롬프트를 쉽게 주입해서 테스트할 수 있어! 시나리오 검증에 훨씬
                유리하지. 😉
              </p>
              <div className="pt-2 border-t border-yellow-200 dark:border-yellow-800/30 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <Label
                    htmlFor="api-mode"
                    className="font-bold text-foreground flex items-center gap-2"
                  >
                    <Server className="h-3 w-3" /> Real API 모드
                  </Label>
                  <Switch
                    id="api-mode"
                    checked={useRealApi}
                    onCheckedChange={setUseRealApi}
                  />
                </div>

                {useRealApi && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label className="text-[10px]">
                      API Endpoint (FastAPI)
                    </Label>
                    <Input
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="h-7 text-xs bg-white dark:bg-black"
                      placeholder="http://..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 결과 화면 (8칸 차지) */}
        <div className="md:col-span-8 space-y-6">
          <Tabs defaultValue="preview" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
                >
                  📱 미리보기 (Preview)
                </TabsTrigger>
                <TabsTrigger
                  value="json"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
                >
                  ⚙️ 데이터 (JSON)
                </TabsTrigger>
              </TabsList>

              {/* 상태 뱃지 */}
              {isStreaming ? (
                <Badge
                  variant="outline"
                  className="border-purple-500 text-purple-500 animate-pulse gap-1"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  Streaming...
                </Badge>
              ) : result ? (
                <Badge
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                >
                  완료됨 ✨
                </Badge>
              ) : (
                <Badge variant="secondary">대기 중</Badge>
              )}
            </div>

            <TabsContent value="preview" className="mt-0">
              <Card className="min-h-[500px] flex flex-col shadow-sm border-slate-200 dark:border-slate-800">
                <CardContent className="flex-1 p-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg font-mono text-sm leading-7 overflow-auto whitespace-pre-wrap">
                  {result ? (
                    <div className="animate-in fade-in duration-300">
                      {result}
                      {isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-purple-500 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                      <Sparkles className="h-12 w-12 text-slate-300" />
                      <p>AI 친구가 여기서 답변을 기다리고 있어...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="json" className="mt-0">
              <Card className="min-h-[500px] border-slate-200 dark:border-slate-800">
                <CardContent className="p-0">
                  <pre className="h-[500px] p-6 bg-[#1e1e1e] text-[#d4d4d4] rounded-lg overflow-auto text-xs font-mono leading-relaxed">
                    {jsonData
                      ? JSON.stringify(jsonData, null, 2)
                      : '// 데이터가 도착하면 여기에 표시돼.\n// 백엔드 개발자와 소통할 때 이 화면을 보여주면 좋아!'}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
