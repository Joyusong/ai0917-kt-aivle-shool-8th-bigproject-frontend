import {
  Zap,
  Film,
  Tv,
  Play,
  Sparkles,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Check,
  AlertCircle,
  X,
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useState } from "react";

function CreateIPExpansionDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(
    null,
  );

  const formats = [
    {
      id: "webtoon",
      title: "웹툰화",
      icon: Film,
      desc: "원작의 시각화 및 웹툰 플랫폼 연재",
      color: "blue",
    },
    {
      id: "drama",
      title: "드라마화",
      icon: Tv,
      desc: "OTT 및 방송사 드라마 제작",
      color: "purple",
    },
    {
      id: "game",
      title: "게임화",
      icon: Play,
      desc: "모바일 및 PC 게임 개발",
      color: "green",
    },
    {
      id: "movie",
      title: "영화화",
      icon: Film,
      desc: "극장판 영화 제작",
      color: "orange",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>새로운 IP 확장 프로젝트 생성</DialogTitle>
          <DialogDescription>
            원작 소설을 기반으로 새로운 미디어 믹스 프로젝트를
            시작합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  currentStep === 1
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                1
              </div>
              <div className="w-12 h-1 bg-slate-100">
                <div
                  className={`h-full bg-blue-600 transition-all ${
                    currentStep > 1 ? "w-full" : "w-0"
                  }`}
                />
              </div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  currentStep === 2
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                2
              </div>
              <div className="w-12 h-1 bg-slate-100">
                <div
                  className={`h-full bg-blue-600 transition-all ${
                    currentStep > 2 ? "w-full" : "w-0"
                  }`}
                />
              </div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  currentStep === 3
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedFormat === format.id
                        ? `border-${format.color}-500 bg-${format.color}-50`
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedFormat === format.id
                            ? `bg-${format.color}-100 text-${format.color}-600`
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <format.icon className="w-5 h-5" />
                      </div>
                      <div className="font-semibold text-slate-900">
                        {format.title}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">
                      {format.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>원작 작품 선택</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="확장할 원작 소설을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      암흑의 영역 연대기
                    </SelectItem>
                    <SelectItem value="2">운명의 검</SelectItem>
                    <SelectItem value="3">별빛 아카데미</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>프로젝트명</Label>
                <Input placeholder="프로젝트 이름을 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label>예상 예산</Label>
                <Input
                  type="number"
                  placeholder="단위: 만원"
                  className="text-right"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                프로젝트 생성 준비 완료
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                선택하신 정보로 IP 확장 프로젝트를 생성합니다.
                <br />
                생성 후에는 프로젝트 관리 페이지로 이동합니다.
              </p>

              <div className="bg-slate-50 rounded-lg p-6 max-w-sm mx-auto mt-6 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">확장 형태</span>
                  <span className="font-medium text-slate-900">
                    웹툰화
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">원작</span>
                  <span className="font-medium text-slate-900">
                    암흑의 영역 연대기
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">예산</span>
                  <span className="font-medium text-slate-900">
                    50,000,000원
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              이전
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 && !selectedFormat}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              다음
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              프로젝트 생성
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ManagerIPExpansion() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">
                +12%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              24
            </div>
            <div className="text-sm text-slate-500">
              진행 중인 프로젝트
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Film className="w-5 h-5 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-100">
                +5%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              8
            </div>
            <div className="text-sm text-slate-500">
              웹툰화 확정
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Tv className="w-5 h-5 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-600 hover:bg-green-100">
                +2%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              3
            </div>
            <div className="text-sm text-slate-500">
              영상화 계약
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-orange-600" />
              </div>
              <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100">
                New
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              2
            </div>
            <div className="text-sm text-slate-500">
              게임화 논의
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            IP 확장 프로젝트
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="프로젝트 검색..."
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              신규 프로젝트
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[
            {
              title: "암흑의 영역 - 웹툰화",
              status: "제작 중",
              progress: 65,
              type: "웹툰",
              icon: Film,
              color: "blue",
              date: "2024.12.30",
            },
            {
              title: "운명의 검 - 드라마",
              status: "기획 단계",
              progress: 20,
              type: "드라마",
              icon: Tv,
              color: "purple",
              date: "2025.02.15",
            },
            {
              title: "별빛 아카데미 - 게임",
              status: "계약 완료",
              progress: 10,
              type: "게임",
              icon: Play,
              color: "green",
              date: "2025.03.01",
            },
          ].map((project, idx) => (
            <Card
              key={idx}
              className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 bg-${project.color}-100 rounded-lg flex items-center justify-center`}
                    >
                      <project.icon
                        className={`w-5 h-5 text-${project.color}-600`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        출시 예정: {project.date}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600">
                        진행률
                      </span>
                      <span className="text-xs font-bold text-blue-600">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${project.color}-500 rounded-full`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Badge
                      variant="outline"
                      className="text-slate-600 border-slate-200"
                    >
                      {project.status}
                    </Badge>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500 font-medium">
                        +3
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CreateIPExpansionDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
