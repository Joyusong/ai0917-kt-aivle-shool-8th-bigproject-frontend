import {
  Award,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  FileText,
  Users,
  Target,
  DollarSign,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { useState } from "react";

export function ManagerContestTemplates() {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="템플릿 검색..."
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setIsTemplateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          새 템플릿 만들기
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "판타지 웹소설 공모전",
            category: "웹소설",
            prize: "5,000만원",
            duration: "30일",
            status: "사용중",
            color: "purple",
          },
          {
            title: "로맨스 단편 공모전",
            category: "웹소설",
            prize: "1,000만원",
            duration: "14일",
            status: "대기",
            color: "pink",
          },
          {
            title: "신인 작가 발굴 프로젝트",
            category: "종합",
            prize: "3,000만원",
            duration: "60일",
            status: "사용중",
            color: "blue",
          },
        ].map((template, idx) => (
          <Card
            key={idx}
            className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div
                className={`w-10 h-10 bg-${template.color}-100 rounded-lg flex items-center justify-center`}
              >
                <Award
                  className={`w-5 h-5 text-${template.color}-600`}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 -mr-2"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                {template.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {template.category}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />총 상금
                  </span>
                  <span className="font-medium text-slate-900">
                    {template.prize}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    진행 기간
                  </span>
                  <span className="font-medium text-slate-900">
                    {template.duration}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Badge
                  variant={
                    template.status === "사용중"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    template.status === "사용중"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }
                >
                  {template.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-purple-600"
                >
                  상세보기
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>공모전 템플릿 생성</DialogTitle>
            <DialogDescription>
              새로운 공모전 진행을 위한 템플릿을 설정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  기본 정보
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">
                      공모전 명칭
                    </label>
                    <Input placeholder="예: 2024 판타지 웹소설 공모전" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-600">
                        카테고리
                      </label>
                      <Input placeholder="웹소설" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-600">
                        진행 기간
                      </label>
                      <Input placeholder="30일" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  심사 기준
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">
                      대중성 (조회수/좋아요)
                    </span>
                    <Input className="w-20 text-right" defaultValue="40" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">
                      작품성 (심사위원)
                    </span>
                    <Input className="w-20 text-right" defaultValue="30" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">
                      성실성 (연재 주기)
                    </span>
                    <Input className="w-20 text-right" defaultValue="30" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  상금 및 특전
                </h4>
                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        대상 (1명)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 h-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="상금 (만원)" />
                      <Input placeholder="특전 (예: 출판 계약)" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-dashed border-slate-300 text-slate-500 hover:text-purple-600 hover:border-purple-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    수상 부문 추가
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTemplateModalOpen(false)}
            >
              취소
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              템플릿 저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
