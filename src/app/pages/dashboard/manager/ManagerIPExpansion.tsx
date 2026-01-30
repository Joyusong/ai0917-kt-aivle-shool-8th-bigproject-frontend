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
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/axios";

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
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("");
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [targetAges, setTargetAges] = useState<string[]>([]);
  const [targetGender, setTargetGender] = useState<string>("all");

  // Reset states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedFormat(null);
      setSelectedAuthorId("");
      setSelectedWorkId("");
      setProjectName("");
      setBudget("");
      setTargetAges([]);
      setTargetGender("all");
    }
  }, [isOpen]);

  const toggleTargetAge = (age: string) => {
    setTargetAges((prev) =>
      prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age],
    );
  };

  // Fetch works to get the title for summary
  const { data: works } = useQuery({
    queryKey: ["manager", "authors", "works", selectedAuthorId],
    queryFn: async () => {
      if (!selectedAuthorId) return [];
      const res = await apiClient.get(
        `/api/v1/manager/authors/${selectedAuthorId}/works`,
      );
      return res.data as { id: number; title: string }[];
    },
    enabled: !!selectedAuthorId,
  });

  const selectedWorkTitle =
    works?.find((w) => String(w.id) === selectedWorkId)?.title || "";

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

  const selectedFormatData = formats.find((f) => f.id === selectedFormat);
  const themeColor = selectedFormatData?.color || "blue";

  const getThemeClass = (type: "bg" | "text" | "ring" | "border" | "bgLight") => {
    const colors: Record<string, Record<string, string>> = {
      blue: {
        bg: "bg-blue-600",
        text: "text-blue-600",
        ring: "ring-blue-100",
        border: "border-blue-200",
        bgLight: "bg-blue-50",
      },
      purple: {
        bg: "bg-purple-600",
        text: "text-purple-600",
        ring: "ring-purple-100",
        border: "border-purple-200",
        bgLight: "bg-purple-50",
      },
      green: {
        bg: "bg-green-600",
        text: "text-green-600",
        ring: "ring-green-100",
        border: "border-green-200",
        bgLight: "bg-green-50",
      },
      orange: {
        bg: "bg-orange-600",
        text: "text-orange-600",
        ring: "ring-orange-100",
        border: "border-orange-200",
        bgLight: "bg-orange-50",
      },
    };
    return colors[themeColor][type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>새로운 IP 확장 프로젝트 생성</DialogTitle>
          <DialogDescription>
            원작 소설을 기반으로 새로운 미디어 믹스 프로젝트를 시작합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Steps */}
          <div className="flex items-center justify-center mb-10 px-4">
            <div className="flex items-center w-full max-w-2xl relative justify-between">
              {/* Step 1 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                    currentStep > 1
                      ? `${getThemeClass("bg")} text-white ring-4 ${getThemeClass("ring")}`
                      : currentStep === 1
                        ? `${getThemeClass("bg")} text-white ring-4 ${getThemeClass("ring")} scale-110`
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
                </div>
                <span
                  className={`text-xs font-medium mt-2 absolute -bottom-6 w-20 text-center transition-colors duration-300 ${
                    currentStep >= 1 ? getThemeClass("text") : "text-slate-400"
                  }`}
                >
                  기본 정보
                </span>
              </div>

              {/* Connector 1-2 */}
              <div className="flex-1 h-1 mx-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${getThemeClass("bg")} ${
                    currentStep > 1 ? "w-full" : "w-0"
                  }`}
                />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                    currentStep > 2
                      ? `${getThemeClass("bg")} text-white ring-4 ${getThemeClass("ring")}`
                      : currentStep === 2
                        ? `${getThemeClass("bg")} text-white ring-4 ${getThemeClass("ring")} scale-110`
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-5 h-5" /> : "2"}
                </div>
                <span
                  className={`text-xs font-medium mt-2 absolute -bottom-6 w-20 text-center transition-colors duration-300 ${
                    currentStep >= 2 ? getThemeClass("text") : "text-slate-400"
                  }`}
                >
                  확장 전략
                </span>
              </div>

              {/* Connector 2-3 */}
              <div className="flex-1 h-1 mx-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${getThemeClass("bg")} ${
                    currentStep > 2 ? "w-full" : "w-0"
                  }`}
                />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                    currentStep >= 3
                      ? `${getThemeClass("bg")} text-white ring-4 ${getThemeClass("ring")} scale-110`
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs font-medium mt-2 absolute -bottom-6 w-20 text-center transition-colors duration-300 ${
                    currentStep >= 3 ? getThemeClass("text") : "text-slate-400"
                  }`}
                >
                  생성 완료
                </span>
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>작가 선택</Label>
                <LinkedAuthorsSelect
                  value={selectedAuthorId}
                  onChange={(v) => {
                    setSelectedAuthorId(v);
                    setSelectedWorkId("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>작품 선택</Label>
                <AuthorWorksSelect
                  authorId={selectedAuthorId}
                  value={selectedWorkId}
                  onChange={(v) => setSelectedWorkId(v)}
                />
              </div>
              <div className="space-y-2">
                <Label>프로젝트명</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="프로젝트 이름을 입력하세요"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* 1. Media Selection (Formats) - Hero */}
              <div className="grid grid-cols-2 gap-4">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                      selectedFormat === format.id
                        ? `border-${format.color}-500 bg-${format.color}-50 shadow-md ring-2 ring-${format.color}-200 ring-offset-2 scale-[1.02] opacity-100`
                        : `border-slate-200 hover:border-slate-300 hover:shadow-sm ${
                            selectedFormat ? "opacity-50 hover:opacity-100" : "opacity-100"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedFormat === format.id
                            ? `bg-${format.color}-100 text-${format.color}-600`
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        }`}
                      >
                        <format.icon
                          className={`w-5 h-5 transition-transform duration-300 ${
                            selectedFormat === format.id ? "scale-110" : ""
                          }`}
                        />
                      </div>
                      <div className="font-semibold text-slate-900">
                        {format.title}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 relative z-10">
                      {format.desc}
                    </p>
                    {selectedFormat === format.id && (
                      <div
                        className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${format.color}-100 rounded-full opacity-50 blur-xl`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* 2. Compact Target Audience */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>타겟 오디언스 설정</Label>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {/* Age - Compact */}
                  <div className="flex-1 space-y-2">
                    <span className="text-xs font-medium text-slate-500">
                      주요 연령층
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["10대", "20대", "30대", "40대", "50대 이상"].map(
                        (age) => (
                          <div
                            key={age}
                            onClick={() => toggleTargetAge(age)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                              targetAges.includes(age)
                                ? `${getThemeClass("bg")} text-white shadow-sm`
                                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {age}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Separator for desktop */}
                  <div className="hidden sm:block w-px bg-slate-200 my-1"></div>

                  {/* Gender - Compact */}
                  <div className="w-full sm:w-auto min-w-[180px] space-y-2">
                    <span className="text-xs font-medium text-slate-500">
                      타겟 성별
                    </span>
                    <div className="flex gap-1">
                      {[
                        { id: "all", label: "남녀무관" },
                        { id: "male", label: "남성" },
                        { id: "female", label: "여성" },
                      ].map((gender) => (
                        <div
                          key={gender.id}
                          onClick={() => setTargetGender(gender.id)}
                          className={`flex-1 py-1.5 text-center rounded-md text-xs font-medium cursor-pointer transition-all ${
                            targetGender === gender.id
                              ? `${getThemeClass("bgLight")} ${getThemeClass("text")} ${getThemeClass("border")} border`
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {gender.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Budget */}
              <div className="space-y-2">
                <Label>
                  예상 예산{" "}
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    (선택)
                  </span>
                </Label>
                <Input
                  type="text"
                  value={budget ? Number(budget).toLocaleString() : ""}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");
                    if (rawValue === "" || !isNaN(Number(rawValue))) {
                      setBudget(rawValue);
                    }
                  }}
                  placeholder="미정"
                  className="text-right"
                />
                <p className="text-xs text-slate-500 text-right">
                  예산을 설정하면 더 정확한 사업 계획 수립이 가능합니다.
                </p>
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

              <div className="bg-slate-50 rounded-lg p-6 max-w-sm mx-auto mt-6 text-left space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium whitespace-nowrap">
                    확장 형태
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {formats.find((f) => f.id === selectedFormat)?.title || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium whitespace-nowrap">
                    원작
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {selectedWorkTitle || "미정"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium whitespace-nowrap">
                    예산
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {budget ? Number(budget).toLocaleString() + "원" : "미정"}
                  </span>
                </div>
                <div className="flex justify-between items-start text-sm">
                  <span className="text-slate-500 font-medium whitespace-nowrap mt-0.5">
                    타겟
                  </span>
                  <span className="font-bold text-slate-900 text-right ml-4 break-keep">
                    {targetAges.length > 0 ? targetAges.join(", ") : "전연령"}
                    {" / "}
                    {targetGender === "male"
                      ? "남성"
                      : targetGender === "female"
                        ? "여성"
                        : "남녀무관"}
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
              disabled={
                (currentStep === 1 && !selectedAuthorId) ||
                (currentStep === 2 && !selectedFormat)
              }
              className={`${getThemeClass("bg")} text-white hover:opacity-90 transition-opacity`}
            >
              다음
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className={`${getThemeClass("bg")} text-white hover:opacity-90 transition-opacity`}
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

function LinkedAuthorsSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data } = useQuery({
    queryKey: ["manager", "authors", "linked", "list"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/manager/authors", {
        params: { size: 100, sort: "name,asc", linked: true },
      });
      const page = res.data as any;
      const items = page?.content ?? [];
      return items.map((a: any) => ({ id: a.id, name: a.name })) as {
        id: number;
        name: string;
      }[];
    },
  });
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="연동된 작가를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {data?.map((a) => (
          <SelectItem key={a.id} value={String(a.id)}>
            {a.name}
          </SelectItem>
        ))}
        {!data || data.length === 0 ? (
          <SelectItem value="__empty" disabled>
            연동된 작가 없음
          </SelectItem>
        ) : null}
      </SelectContent>
    </Select>
  );
}

function AuthorWorksSelect({
  authorId,
  value,
  onChange,
}: {
  authorId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { data } = useQuery({
    queryKey: ["manager", "authors", "works", authorId],
    queryFn: async () => {
      if (!authorId) return [];
      const res = await apiClient.get(
        `/api/v1/manager/authors/${authorId}/works`,
      );
      return res.data as { id: number; title: string }[];
    },
    enabled: !!authorId,
  });
  return (
    <Select value={value} onValueChange={onChange} disabled={!authorId}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={authorId ? "작품을 선택하세요" : "작가를 먼저 선택하세요"} />
      </SelectTrigger>
      <SelectContent>
        {data?.map((w) => (
          <SelectItem key={w.id} value={String(w.id)}>
            {w.title}
          </SelectItem>
        ))}
        {authorId && (!data || data.length === 0) ? (
          <SelectItem value="__empty" disabled>
            선택된 작가의 작품이 없습니다
          </SelectItem>
        ) : null}
      </SelectContent>
    </Select>
  );
}
