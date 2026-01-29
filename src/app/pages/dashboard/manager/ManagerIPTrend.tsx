import { useState } from 'react';
import {
  FileText,
  Calendar,
  X,
  Maximize2,
  Minimize2,
  TrendingUp,
  BarChart3,
  Clock,
  Filter,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../../components/ui/dialog';
import { cn } from '../../../components/ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

// Mock Data for Reports
const REPORTS = [
  {
    id: 1,
    title: '2025년 1월 IP 트렌드 심층 분석',
    date: '2025-01-15',
    summary: '판타지 장르의 웹툰화 전환율 상승에 따른 IP 확장 전략 제언',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    title: '2024년 12월 글로벌 시장 동향',
    date: '2024-12-28',
    summary: '북미/유럽 시장에서의 K-웹소설 소비 패턴 및 키워드 분석',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 3,
    title: '2024년 11월 장르 키워드 트렌드',
    date: '2024-11-10',
    summary: '회귀/빙의/환생(회빙환) 클리셰의 변주와 독자 반응 추이',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 4,
    title: '2024년 10월 신진 작가 발굴 리포트',
    date: '2024-10-30',
    summary: '플랫폼 별 신인 작가 유입 현황 및 성공 사례 분석',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 5,
    title: '2024년 9월 OSMU 성공 사례 분석',
    date: '2024-09-15',
    summary: '성공적인 영상화 사례를 통한 2차 저작권 수익화 모델 연구',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 6,
    title: '2024년 8월 IP 트렌드 요약',
    date: '2024-08-01',
    summary: '전월 대비 장르별 매출 증감 및 주요 이슈 정리',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
];

// Summary Data
const SUMMARY_STATS = [
  {
    title: '이번 달 리포트',
    value: '1건',
    description: '전월 대비 동일',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    title: '전체 발행 리포트',
    value: '24건',
    description: '2024-2025 누적',
    icon: BarChart3,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    title: '최근 업데이트',
    value: '2025.01.15',
    description: '7일 전',
    icon: Clock,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    title: '주요 키워드',
    value: '회빙환, OSMU',
    description: '가장 많이 언급됨',
    icon: TrendingUp,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
];

export function ManagerIPTrend() {
  const [selectedReport, setSelectedReport] = useState<
    (typeof REPORTS)[0] | null
  >(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2025');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Summary Section */}
      <div className="space-y-6">
        {/* Summary Cards - Minimal & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_STATS.map((stat, index) => (
            <Card key={index} className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 pt-8">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">리포트 목록</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            {REPORTS.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">필터:</span>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="연도 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025년</SelectItem>
              <SelectItem value="2024">2024년</SelectItem>
              <SelectItem value="2023">2023년</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {REPORTS.map((report) => (
          <Card
            key={report.id}
            className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden cursor-pointer h-full flex flex-col bg-white"
            onClick={() => setSelectedReport(report)}
          >
            {/* PDF Thumbnail Simulation */}
            <div
              className={`h-48 ${report.bgColor} relative p-4 flex items-center justify-center overflow-hidden`}
            >
              {/* Document Page Look */}
              <div className="w-full h-full bg-white shadow-md rounded-sm border border-slate-100 p-3 flex flex-col gap-2 group-hover:-translate-y-2 transition-transform duration-300 relative z-10">
                {/* Skeleton Text Lines */}
                <div className="w-2/3 h-3 bg-slate-200 rounded-sm" />
                <div className="w-full h-1.5 bg-slate-100 rounded-sm mt-1" />
                <div className="w-full h-1.5 bg-slate-100 rounded-sm" />
                <div className="w-4/5 h-1.5 bg-slate-100 rounded-sm" />

                <div className="w-full flex-1 bg-slate-50 rounded-sm mt-2 border border-dashed border-slate-200 flex items-center justify-center">
                  <FileText className={`w-6 h-6 ${report.color} opacity-30`} />
                </div>
              </div>

              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Calendar className="w-3 h-3" />
                {report.date}
              </div>
              <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
                {report.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-4 px-4">
              <p className="text-xs text-slate-600 line-clamp-2">
                {report.summary}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PDF Preview Dialog */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReport(null);
            setIsFullScreen(false);
          }
        }}
      >
        <DialogContent
          className={cn(
            'flex flex-col p-0 gap-0 transition-all duration-300 bg-slate-900/95 backdrop-blur-sm',
            isFullScreen
              ? '!w-screen !h-screen !max-w-none !rounded-none !border-0'
              : 'max-w-6xl w-full h-[85vh] rounded-xl border-slate-700',
          )}
        >
          <DialogHeader className="p-4 border-b border-slate-700 shrink-0 flex flex-row items-center justify-between space-y-0 bg-slate-900 text-white z-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-slate-800`}>
                <FileText className={`w-5 h-5 text-slate-200`} />
              </div>
              <div>
                <DialogTitle className="text-base text-slate-100">
                  {selectedReport?.title}
                </DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedReport?.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? '화면 축소' : '전체 화면'}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {isFullScreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          {/* PDF Content Area (Iframe) */}
          <div className="flex-1 bg-slate-800 relative overflow-hidden flex items-center justify-center">
            {selectedReport && (
              <iframe
                src="/sample.pdf"
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            )}

            {/* Fallback/Loading State if needed */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="text-slate-600 flex flex-col items-center gap-2">
                <p>PDF 미리보기 로딩 중...</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
