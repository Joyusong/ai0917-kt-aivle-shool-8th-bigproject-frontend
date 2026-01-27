import { useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Loader2,
  Search,
  Star,
  ArrowRight,
  Download,
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
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

import { authorService } from '../../../services/authorService';
import { AuthorBreadcrumbContext } from './AuthorBreadcrumbContext';
import { ContestTemplateDto } from '../../../types/author';

export function AuthorContestTemplates() {
  const { setBreadcrumbs, onNavigate } = useContext(AuthorBreadcrumbContext);

  useEffect(() => {
    setBreadcrumbs([
      { label: '홈', onClick: () => onNavigate('home') },
      { label: '공모전 템플릿' },
    ]);
  }, [setBreadcrumbs, onNavigate]);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['author', 'contest-templates'],
    queryFn: authorService.getContestTemplates,
  });

  const templateList = templates || [];

  const handleDownload = (templateTitle: string) => {
    toast.success(`${templateTitle} 템플릿을 다운로드합니다.`);
    // Mock download behavior
    setTimeout(() => {
      // In a real app, this would trigger a file download
    }, 1000);
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
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-accent px-3 py-1"
          >
            스릴러
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
                <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600 relative p-6 flex flex-col justify-between">
                  <Badge className="self-start bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                    {template.deadline}
                  </Badge>
                  <div className="text-white font-bold text-lg drop-shadow-md line-clamp-1">
                    {template.title}
                  </div>
                  <Trophy className="absolute right-4 bottom-4 text-white/20 w-16 h-16 rotate-12" />
                </div>
                <CardContent className="flex-1 p-6 pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">주최</span>
                      <span className="font-medium">{template.organizer}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">분야</span>
                      <span className="font-medium">{template.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">상금</span>
                      <span className="font-medium text-blue-600">
                        {template.prize}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-dashed">
                    {template.isAiSupported && (
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>AI 분석 템플릿 제공</span>
                      </div>
                    )}
                    <Button className="w-full group" variant="default">
                      템플릿 사용하기{' '}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-muted/30 border-t">
                  <Button
                    className="w-full group"
                    variant="outline"
                    onClick={() => handleDownload(template.title)}
                  >
                    <Download className="mr-2 w-4 h-4" />
                    다운로드
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
    </div>
  );
}
