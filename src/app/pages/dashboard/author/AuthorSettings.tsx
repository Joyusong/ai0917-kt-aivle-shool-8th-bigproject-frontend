import {
  Sparkles,
  Download,
  AlertTriangle,
  Lightbulb,
  Users as UsersIcon,
  Globe,
  BookMarked,
  Plus,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

interface AuthorSettingsProps {
  settingsCategory: 'characters' | 'world' | 'narrative';
  setSettingsCategory: (category: 'characters' | 'world' | 'narrative') => void;
}

export function AuthorSettings({
  settingsCategory,
  setSettingsCategory,
}: AuthorSettingsProps) {
  return (
    <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            설정집 관리
          </h2>
          <p className="text-sm text-muted-foreground">
            AI가 분석한 작품의 설정을 관리하고 편집합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI 재분석
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      <Card className="flex-1 border-border flex flex-col overflow-hidden">
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setSettingsCategory("characters")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                settingsCategory === "characters"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <UsersIcon className="w-4 h-4" />
              인물
            </button>
            <button
              onClick={() => setSettingsCategory("world")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                settingsCategory === "world"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-4 h-4" />
              세계관
            </button>
            <button
              onClick={() => setSettingsCategory("narrative")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                settingsCategory === "narrative"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookMarked className="w-4 h-4" />
              서사
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {settingsCategory === "characters" && <CharactersContent />}
          {settingsCategory === "world" && <WorldContent />}
          {settingsCategory === "narrative" && <NarrativeContent />}
        </div>
      </Card>
    </div>
  );
}

function CharactersContent() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">주요 인물 3</Badge>
          <Badge variant="outline">조연 12</Badge>
          <Badge variant="outline">단역 5</Badge>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> 인물 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Character Card 1 */}
        <Card className="group hover:shadow-md transition-all border-border cursor-pointer">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                {/* Avatar Image Placeholder */}
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <UsersIcon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">카일라스</CardTitle>
                <div className="text-xs text-muted-foreground">주인공, 검사</div>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-2">
              <div className="text-sm text-muted-foreground line-clamp-2">
                제국의 마지막 황태자이자 검술의 천재. 차가운 성격이지만 내면에는 뜨거운 복수심을 품고 있다.
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                <Badge variant="secondary" className="text-xs">냉철함</Badge>
                <Badge variant="secondary" className="text-xs">검술 천재</Badge>
                <Badge variant="secondary" className="text-xs">복수귀</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Card 2 */}
        <Card className="group hover:shadow-md transition-all border-border cursor-pointer">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <UsersIcon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">엘리나</CardTitle>
                <div className="text-xs text-muted-foreground">히로인, 마법사</div>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-2">
              <div className="text-sm text-muted-foreground line-clamp-2">
                고대 마법의 계승자. 밝고 명랑하지만 과거의 기억을 잃은 미스터리한 소녀.
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                <Badge variant="secondary" className="text-xs">천재 마법사</Badge>
                <Badge variant="secondary" className="text-xs">기억상실</Badge>
                <Badge variant="secondary" className="text-xs">치유</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conflict Warning Card */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>설정 충돌 감지</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800 dark:text-amber-400 mb-3">
              '카일라스'의 나이 설정이 1화와 25화에서 다르게 묘사되었습니다. (1화: 17세, 25화: 19세)
            </p>
            <Button size="sm" variant="outline" className="w-full border-amber-200 hover:bg-amber-100 text-amber-700 dark:border-amber-800 dark:hover:bg-amber-900/30 dark:text-amber-400">
              확인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WorldContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
           {/* Geography */}
           <Card className="border-border">
             <CardHeader>
               <CardTitle className="text-lg text-foreground">지리 / 장소</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                 <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md flex-shrink-0"></div>
                 <div>
                   <h4 className="font-medium text-foreground">제국 수도 '아르카디아'</h4>
                   <p className="text-sm text-muted-foreground mt-1">대륙 중앙에 위치한 거대한 마법 도시. 5개의 구역으로 나뉘어 있으며...</p>
                 </div>
               </div>
               <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                 <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md flex-shrink-0"></div>
                 <div>
                   <h4 className="font-medium text-foreground">침묵의 숲</h4>
                   <p className="text-sm text-muted-foreground mt-1">마수들이 서식하는 위험한 숲. 고대 유적의 입구가 숨겨져 있다고 전해진다.</p>
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* History/Culture */}
           <Card className="border-border">
             <CardHeader>
               <CardTitle className="text-lg text-foreground">역사 / 문화</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground text-sm">등록된 역사 설정이 없습니다.</p>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium">
                <Lightbulb className="w-4 h-4" />
                <span>AI 아이디어 제안</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                현재 '마법 체계'에 대한 설정이 부족합니다. 4대 원소 기반의 마법 시스템을 제안해드릴까요?
              </p>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                제안 보기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NarrativeContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">타임라인</h3>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" /> 사건 추가
        </Button>
      </div>

      <div className="relative pl-8 border-l-2 border-border space-y-8">
        {/* Timeline Item 1 */}
        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-blue-500 border-4 border-background"></div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">제국력 385년</span>
              <Badge variant="outline">프롤로그</Badge>
            </div>
            <h4 className="font-medium text-foreground mb-1">황태자의 추방</h4>
            <p className="text-sm text-muted-foreground">카일라스가 누명을 쓰고 제국에서 추방당함. 북부 변경백에게 의탁하게 됨.</p>
          </div>
        </div>

        {/* Timeline Item 2 */}
        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 border-4 border-background"></div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">제국력 388년</span>
              <Badge variant="outline">1부 초반</Badge>
            </div>
            <h4 className="font-medium text-foreground mb-1">엘리나와의 만남</h4>
            <p className="text-sm text-muted-foreground">북부 숲에서 기억을 잃은 엘리나를 구조. 그녀의 마법 재능을 발견함.</p>
          </div>
        </div>

         {/* Timeline Item 3 */}
         <div className="relative">
          <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 border-4 border-background"></div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">제국력 389년</span>
              <Badge variant="outline">1부 중반</Badge>
            </div>
            <h4 className="font-medium text-foreground mb-1">아카데미 입학</h4>
            <p className="text-sm text-muted-foreground">신분을 숨기고 제국 아카데미에 입학. 라이벌 '베르나르'와 조우.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
