import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Settings,
  Users,
  Globe,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Plus,
  X
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
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
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';

interface AuthorWritingEditorProps {
  workId: string;
  initialTitle?: string;
  initialContent?: string;
  onClose: () => void;
}

// Mock data for settings
const MOCK_SETTINGS = {
  characters: [
    { id: '1', name: '김철수', role: '주인공', description: '28세, 평범한 회사원이지만 숨겨진 능력을 가지고 있다. 성격은 소심하지만 정의롭다.' },
    { id: '2', name: '이영희', role: '조력자', description: '25세, 천재 해커. 철수의 능력을 가장 먼저 알아본 사람. 냉철하고 분석적이다.' },
    { id: '3', name: '박부장', role: '빌런', description: '45세, 철수의 상사. 회사의 이익을 위해서라면 물불 가리지 않는 냉혈한.' },
  ],
  worldview: [
    { id: '1', name: '네오 서울', type: '지리', description: '2050년의 서울. 고도로 발달한 기술과 낙후된 구시가지가 공존하는 사이버펑크 도시.' },
    { id: '2', name: '마나 시스템', type: '설정', description: '전 세계 인구의 10%만이 사용할 수 있는 특수 에너지. 등급에 따라 사회적 지위가 결정된다.' },
  ],
  plot: [
    { id: '1', name: '발단', type: '메인', description: '철수가 우연히 마나 코어를 줍게 되고, 능력을 각성한다.' },
    { id: '2', name: '전개', type: '메인', description: '이영희와 만나 마나 시스템의 진실을 파헤치기 시작한다.' },
  ]
};

export function AuthorWritingEditor({ workId, initialTitle = '', initialContent = '', onClose }: AuthorWritingEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save simulation
  useEffect(() => {
    const timer = setInterval(() => {
      if (content !== initialContent) { // Simple check for demo
        handleSave();
      }
    }, 30000); // Auto-save every 30s

    return () => clearInterval(timer);
  }, [content]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-lg font-bold border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
              placeholder="제목 없는 작품"
            />
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] h-4 px-1">Novel</Badge>
              {isSaving ? (
                <span>저장 중...</span>
              ) : lastSaved ? (
                <span>마지막 저장: {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span>작성 중</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={isSidebarOpen ? 'bg-accent' : ''}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            참고 자료
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-12 px-8 min-h-full bg-background">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[calc(100vh-200px)] resize-none border-none focus-visible:ring-0 text-lg leading-relaxed p-0 shadow-none bg-transparent"
              placeholder="여기에 내용을 작성하세요..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Sidebar - Reference Materials */}
        {isSidebarOpen && (
          <div className="w-80 border-l border-border bg-card flex flex-col shadow-xl z-10 transition-all duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                설정집
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <Tabs defaultValue="characters" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-10">
                <TabsTrigger 
                  value="characters" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-10"
                >
                  <Users className="w-4 h-4 mr-1" /> 인물
                </TabsTrigger>
                <TabsTrigger 
                  value="worldview" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-10"
                >
                  <Globe className="w-4 h-4 mr-1" /> 세계관
                </TabsTrigger>
                <TabsTrigger 
                  value="plot" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-10"
                >
                  <BookOpen className="w-4 h-4 mr-1" /> 서사
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="characters" className="mt-0 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">등장인물 목록</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Plus className="w-3 h-3" /></Button>
                  </div>
                  {MOCK_SETTINGS.characters.map((char) => (
                    <Card key={char.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-sm font-bold flex justify-between">
                          {char.name}
                          <Badge variant="secondary" className="text-[10px] h-5">{char.role}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-3">{char.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="worldview" className="mt-0 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">세계관 설정 목록</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Plus className="w-3 h-3" /></Button>
                  </div>
                  {MOCK_SETTINGS.worldview.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-sm font-bold flex justify-between">
                          {item.name}
                          <Badge variant="outline" className="text-[10px] h-5">{item.type}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="plot" className="mt-0 space-y-4">
                   <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">서사/플롯 목록</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Plus className="w-3 h-3" /></Button>
                  </div>
                  {MOCK_SETTINGS.plot.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-sm font-bold flex justify-between">
                          {item.name}
                          <Badge variant="outline" className="text-[10px] h-5">{item.type}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
