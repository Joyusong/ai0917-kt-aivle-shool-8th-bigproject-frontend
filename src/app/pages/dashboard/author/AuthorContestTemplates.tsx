import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Search, Trophy, Calendar, ArrowRight, Star } from 'lucide-react';
import { Input } from '../../../components/ui/input';

export function AuthorContestTemplates() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">공모전 템플릿</h1>
            <p className="text-muted-foreground">
              진행 중인 공모전에 맞춰 작품을 준비할 수 있는 AI 템플릿을 제공합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="공모전 검색..."
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">전체</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent px-3 py-1">판타지</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent px-3 py-1">로맨스</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent px-3 py-1">스릴러</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow border-border">
            <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600 relative p-6 flex flex-col justify-between">
              <Badge className="self-start bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                D-{10 * i}
              </Badge>
              <div className="text-white font-bold text-lg drop-shadow-md">
                2026 제 {i}회<br/>글로벌 스토리 공모전
              </div>
              <Trophy className="absolute right-4 bottom-4 text-white/20 w-16 h-16 rotate-12" />
            </div>
            <CardContent className="flex-1 p-6 pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">주최</span>
                  <span className="font-medium">스토리M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">분야</span>
                  <span className="font-medium">웹소설 / 웹툰 시나리오</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">상금</span>
                  <span className="font-medium text-blue-600">총 1억 {i}천만원</span>
                </div>
              </div>
              <div className="pt-2 border-t border-dashed">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>AI 분석 템플릿 제공</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  수상작 분석 데이터를 기반으로 한 장르별 맞춤형 시놉시스 템플릿을 활용해보세요.
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/30 border-t">
              <Button className="w-full group" variant="default">
                템플릿 사용하기 <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
