import { useState } from 'react';
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
  FileText,
  Users,
  Search,
  Filter,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Input } from '../../../components/ui/input';

export function AuthorIPExpansion() {
  const [activeTab, setActiveTab] = useState('proposals');

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">IP 확장</h1>
        <p className="text-muted-foreground">
          내 작품의 OSMU(One Source Multi Use) 제안서를 검토하고 담당자와
          매칭합니다.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="proposals">제안서 검토</TabsTrigger>
          <TabsTrigger value="matching">담당자 매칭</TabsTrigger>
        </TabsList>

        {/* 제안서 검토 탭 */}
        <TabsContent value="proposals" className="mt-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="제안서 검색..."
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" /> 필터
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant={i === 1 ? 'default' : 'secondary'}
                      className="mb-2"
                    >
                      {i === 1 ? '검토 요청' : '검토 중'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      2026.01.2{i}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    암흑의 영역 - 웹툰화 제안
                  </CardTitle>
                  <CardDescription>웹툰 플랫폼 A사 제안</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    귀하의 작품 '암흑의 영역'의 독창적인 세계관과 캐릭터가
                    웹툰화에 매우 적합하다고 판단되어 제안드립니다.
                  </div>
                  <Button variant="ghost" className="w-full text-xs h-8">
                    상세 보기 <ChevronRight className="ml-1 w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 담당자 매칭 탭 */}
        <TabsContent value="matching" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>매칭 현황</CardTitle>
              <CardDescription>
                현재 진행 중인 담당자 매칭 현황입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">박지성 매니저</h4>
                        <p className="text-sm text-muted-foreground">
                          영상화 사업부 | 2차 저작권 담당
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            드라마
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            영화
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>2026.01.20 매칭됨</span>
                      </div>
                      <Button size="sm">메시지 보내기</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
