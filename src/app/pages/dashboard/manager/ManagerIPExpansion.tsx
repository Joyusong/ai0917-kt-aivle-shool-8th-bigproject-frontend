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
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: {
    id?: string | number;
    format: string | null;
    projectName: string;
    authorId: string;
    authorName: string;
    workId: string;
    workTitle: string;
    budget: string;
    targetAges: string[];
    targetGender: string;
    dossiers: string[];
  }) => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(
    null,
  );
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
  const [selectedWorkIds, setSelectedWorkIds] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [targetAges, setTargetAges] = useState<string[]>([]);
  const [targetGender, setTargetGender] = useState<string>("all");
  const [dossiers, setDossiers] = useState<string[]>([]);

  // Reset states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedFormat(null);
      setSelectedAuthorIds([]);
      setSelectedWorkIds([]);
      setProjectName("");
      setBudget("");
      setTargetAges([]);
      setTargetGender("all");
      setDossiers([]);
    }
  }, [isOpen]);

  const toggleTargetAge = (age: string) => {
    setTargetAges((prev) =>
      prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age],
    );
  };
  const toggleDossier = (key: string) => {
    setDossiers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // Fetch works for selected authors (aggregate)
  const { data: works } = useQuery({
    queryKey: ["manager", "authors", "works", "multi", selectedAuthorIds.slice().sort().join(",")],
    queryFn: async () => {
      if (!selectedAuthorIds.length) return [];
      const results = await Promise.all(
        selectedAuthorIds.map((aid) =>
          apiClient.get(`/api/v1/manager/authors/${aid}/works`),
        ),
      );
      const merged = results.flatMap((r, idx) => {
        const aid = selectedAuthorIds[idx];
        const arr = (r.data as { id: number; title: string }[]) || [];
        return arr.map((w) => ({ ...w, authorId: Number(aid) }));
      });
      return merged as { id: number; title: string; authorId: number }[];
    },
    enabled: selectedAuthorIds.length > 0,
  });

  const selectedWorkTitle =
    works && selectedWorkIds.length
      ? works
          .filter((w) => selectedWorkIds.includes(String(w.id)))
          .map((w) => w.title)
          .join(", ")
      : "";

  const { data: authors } = useQuery({
    queryKey: ["manager", "authors", "list"],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/manager/authors`);
      const data = res.data as
        | { id: number; name: string }[]
        | { content?: { id: number; name: string }[] };
      return Array.isArray(data) ? data : data?.content ?? [];
    },
  });

  const selectedAuthorName =
    authors && selectedAuthorIds.length
      ? authors
          .filter((a) => selectedAuthorIds.includes(String(a.id)))
          .map((a) => a.name)
          .join(", ")
      : "";

  const handleCreate = () => {
    const createdId = Date.now();
    onCreated({
      id: createdId,
      format: selectedFormat,
      projectName,
      authorId: selectedAuthorIds.join(","),
      authorName: selectedAuthorName,
      workId: selectedWorkIds.join(","),
      workTitle: selectedWorkTitle || "",
      budget,
      targetAges,
      targetGender,
      dossiers,
    });
    onClose();
  };

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
      <DialogContent className="max-w-6xl">
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
                  values={selectedAuthorIds}
                  onChange={(v) => {
                    setSelectedAuthorIds(v);
                    setSelectedWorkIds([]);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>작품 선택</Label>
                <AuthorWorksSelect
                  authorIds={selectedAuthorIds}
                  values={selectedWorkIds}
                  onChange={(v) => setSelectedWorkIds(v)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  종류별 설정집{" "}
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    (선택)
                  </span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["인물", "세계관", "서사", "장소", "물건", "집단"].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleDossier(key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                        dossiers.includes(key)
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
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
              <p className="text-slate-500 max-w-xl mx-auto">
                선택하신 정보로 IP 확장 프로젝트를 생성합니다.
                <br />
                생성 후에는 프로젝트 관리 페이지로 이동합니다.
              </p>

              <div className="bg-slate-50 rounded-lg p-6 max-w-xl mx-auto mt-6 text-left space-y-4">
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
                (currentStep === 1 && selectedAuthorIds.length === 0) ||
                (currentStep === 2 && !selectedFormat)
              }
              className={`${getThemeClass("bg")} text-white hover:opacity-90 transition-opacity`}
            >
              다음
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"summary" | "roadmap" | "assets">(
    "summary",
  );
  type CreatedProject = {
    id?: string | number;
    format: string | null;
    projectName: string;
    authorId: string;
    authorName: string;
    workId: string;
    workTitle: string;
    budget: string;
    targetAges: string[];
    targetGender: string;
    dossiers: string[];
  };
  const [createdProject, setCreatedProject] = useState<
    | CreatedProject
    | null
  >(null);
  const [projects, setProjects] = useState<CreatedProject[]>([]);

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
          {projects.map((p) => {
            const meta =
              p.format === "drama"
                ? { icon: Tv, color: "purple", label: "드라마" }
                : p.format === "game"
                ? { icon: Play, color: "green", label: "게임" }
                : p.format === "movie"
                ? { icon: Film, color: "orange", label: "영화" }
                : { icon: Film, color: "blue", label: "웹툰" };
            const Title = `${p.workTitle || p.projectName} - ${meta.label}`;
            const Progress = 0;
            const Status = "기획 단계";
            return (
              <Card
                key={p.id}
                className="border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => {
                  setCreatedProject(p);
                  setDetailTab("summary");
                  setIsDetailModalOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-${meta.color}-100 rounded-lg flex items-center justify-center`}
                      >
                        <meta.icon className={`w-5 h-5 text-${meta.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {Title}
                        </h3>
                        <p className="text-xs text-slate-500">출시 예정: 미정</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">진행률</span>
                        <span className="text-xs font-bold text-blue-600">
                          {Progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${meta.color}-500 rounded-full`}
                          style={{ width: `${Progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <Badge variant="outline" className="text-slate-600 border-slate-200">
                        {Status}
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
            );
          })}
        </div>
      </div>

      <CreateIPExpansionDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(p) => {
          setCreatedProject(p);
          setDetailTab("summary");
          setIsDetailModalOpen(true);
        }}
      />

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="w-[92vw] max-w-7xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="font-bold break-keep">
                {createdProject?.projectName || "프로젝트 상세"}
              </span>
              <Badge
                className={`${
                  createdProject?.format === "drama"
                    ? "bg-purple-100 text-purple-700"
                    : createdProject?.format === "game"
                    ? "bg-green-100 text-green-700"
                    : createdProject?.format === "movie"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {createdProject?.format === "drama"
                  ? "드라마화"
                  : createdProject?.format === "game"
                  ? "게임화"
                  : createdProject?.format === "movie"
                  ? "영화화"
                  : "웹툰화"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              프로젝트의 핵심 정보와 전략 현황을 확인하세요.
            </DialogDescription>
          </DialogHeader>

          <div
            className={`rounded-xl p-5 mb-6 ${
              createdProject?.format === "drama"
                ? "bg-purple-50"
                : createdProject?.format === "game"
                ? "bg-green-50"
                : createdProject?.format === "movie"
                ? "bg-orange-50"
                : "bg-blue-50"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white text-slate-700 border border-slate-200">
                진행률 0%
              </Badge>
              <Badge className="bg-white text-slate-700 border border-slate-200">
                출시 예정일 미정
              </Badge>
              <Badge className="bg-white text-slate-700 border border-slate-200">
                현재 단계 기획
              </Badge>
            </div>
          </div>

          <Tabs
            value={detailTab}
            onValueChange={(v) => setDetailTab(v as "summary" | "roadmap" | "assets")}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="summary">전략 요약</TabsTrigger>
              <TabsTrigger value="roadmap">로드맵</TabsTrigger>
              <TabsTrigger value="assets">IP 자산</TabsTrigger>
            </TabsList>
          </Tabs>

          {detailTab === "summary" && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                      원작
                    </span>
                    <span className="font-bold text-slate-900 break-keep tracking-tighter">
                      {createdProject?.workTitle || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                      작가
                    </span>
                    <span className="font-bold text-slate-900 break-keep tracking-tighter">
                      {createdProject?.authorName || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="text-xs text-slate-500 whitespace-nowrap break-keep">
                        타겟 오디언스
                      </div>
                      <div className="font-semibold text-slate-900 text-sm mt-1 break-keep tracking-tighter">
                        {(createdProject?.targetAges || []).length > 0
                          ? createdProject?.targetAges.join(", ")
                          : "전연령"}{" "}
                        /{" "}
                        {createdProject?.targetGender === "male"
                          ? "남성"
                          : createdProject?.targetGender === "female"
                          ? "여성"
                          : "남녀무관"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 break-keep">
                        설정된 타겟에 따른 선호도 지표
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="text-xs text-slate-500 whitespace-nowrap break-keep">
                        예산 집행률
                      </div>
                      <div className="font-semibold text-slate-900 text-sm mt-1 break-keep tracking-tighter">
                        {createdProject?.budget
                          ? `${Number(createdProject.budget).toLocaleString()}원`
                          : "미정"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 break-keep">
                        {createdProject?.budget ? "총 예산 대비 집행 비용" : "예산 수립 필요"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="text-xs text-slate-500 whitespace-nowrap break-keep">
                        매체 적합성
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1.5 break-keep tracking-tighter">
                        원작 서사 구조 분석
                      </div>
                      <div className="text-xs text-slate-500 mt-2 break-keep">
                        3막 구조 및 세계 설정 반영
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {detailTab === "roadmap" && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-5">
                <div className="font-semibold text-slate-900 mb-3">마일스톤 및 로드맵</div>
                {(() => {
                  const stages = ["기획", "계약", "제작", "검수", "런칭"];
                  const currentStageIndex = 1;
                  return (
                    <div className="flex items-center gap-4 mb-6">
                      {stages.map((stage, i) => (
                        <div key={stage} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === currentStageIndex
                                ? "bg-slate-200 text-slate-900 ring-2 ring-blue-200 shadow-sm"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {i + 1}
                          </div>
                          <span className="mt-1 text-[10px] text-slate-500">{stage}</span>
                          {i < stages.length - 1 && (
                            <div className="w-10 h-px bg-slate-200 mx-2 hidden md:block" />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-semibold text-slate-900 mb-2">체크리스트</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>기획안 작성</li>
                      <li>원작자 협의</li>
                      <li className="text-red-600">제작사 컨택 지연</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-semibold text-slate-900 mb-2">팀 협업 현황</div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-slate-100 text-slate-700">PD</Badge>
                      <Badge className="bg-slate-100 text-slate-700">작가</Badge>
                      <Badge className="bg-slate-100 text-slate-700">디자이너</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {detailTab === "assets" && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-5">
                <div className="font-semibold text-slate-900 mb-3">IP 자산 동기화</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">캐릭터 시트</div>
                    <div className="font-bold text-slate-900 mt-1">시각화 비교 뷰</div>
                    <div className="text-xs text-slate-500 mt-1">엘레나, 루미나스 등 주요 캐릭터</div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                      <div className="w-8 h-8 rounded-full bg-slate-300" />
                      <div className="w-8 h-8 rounded-full bg-slate-100" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-white text-slate-700 border border-slate-200">#주인공</Badge>
                      <Badge className="bg-white text-slate-700 border border-slate-200">#라이벌</Badge>
                      <Badge className="bg-white text-slate-700 border border-slate-200">#조력자</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">세계관 설정집</div>
                    <div className="font-bold text-slate-900 mt-1">매체별 각색 데이터</div>
                    <div className="text-xs text-slate-500 mt-1">중세 판타지, 마법 체계</div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-white text-slate-700 border border-slate-200">#중세</Badge>
                      <Badge className="bg-white text-slate-700 border border-slate-200">#마법</Badge>
                      <Badge className="bg-white text-slate-700 border border-slate-200">#왕국</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (createdProject) {
                  setProjects((prev) => {
                    const exists = prev.some((q) => q.id === createdProject.id);
                    return exists ? prev : [createdProject, ...prev];
                  });
                  setIsDetailModalOpen(false);
                }
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LinkedAuthorsSelect({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
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
    <div className="border border-slate-200 rounded-md p-2 max-h-48 overflow-auto">
      {data?.map((a) => {
        const id = String(a.id);
        const checked = values.includes(id);
        return (
          <label key={a.id} className="flex items-center gap-2 py-1 px-2 cursor-pointer">
            <input
              type="checkbox"
              className="accent-slate-900"
              checked={checked}
              onChange={() => {
                if (checked) {
                  onChange(values.filter((v) => v !== id));
                } else {
                  onChange([...values, id]);
                }
              }}
            />
            <span className="text-sm">{a.name}</span>
          </label>
        );
      })}
      {!data || data.length === 0 ? (
        <div className="text-xs text-slate-500 px-2 py-1">연동된 작가 없음</div>
      ) : null}
    </div>
  );
}

function AuthorWorksSelect({
  authorIds,
  values,
  onChange,
}: {
  authorIds: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const { data } = useQuery({
    queryKey: ["manager", "authors", "works", "multi", authorIds.slice().sort().join(",")],
    queryFn: async () => {
      if (!authorIds.length) return [];
      const results = await Promise.all(
        authorIds.map((aid) =>
          apiClient.get(`/api/v1/manager/authors/${aid}/works`),
        ),
      );
      const merged = results.flatMap((r, idx) => {
        const aid = authorIds[idx];
        const arr = (r.data as { id: number; title: string }[]) || [];
        return arr.map((w) => ({ ...w, authorId: Number(aid) }));
      });
      return merged as { id: number; title: string; authorId: number }[];
    },
    enabled: authorIds.length > 0,
  });
  return (
    <div className="border border-slate-200 rounded-md p-2 max-h-48 overflow-auto">
      {!authorIds.length ? (
        <div className="text-xs text-slate-500 px-2 py-1">작가를 먼저 선택하세요</div>
      ) : (
        data?.map((w) => {
          const id = String(w.id);
          const checked = values.includes(id);
          return (
            <label key={w.id} className="flex items-center gap-2 py-1 px-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-slate-900"
                checked={checked}
                onChange={() => {
                  if (checked) {
                    onChange(values.filter((v) => v !== id));
                  } else {
                    onChange([...values, id]);
                  }
                }}
              />
              <span className="text-sm">{w.title}</span>
            </label>
          );
        })
      )}
      {authorIds.length > 0 && (!data || data.length === 0) ? (
        <div className="text-xs text-slate-500 px-2 py-1">선택된 작가의 작품이 없습니다</div>
      ) : null}
    </div>
  );
}
