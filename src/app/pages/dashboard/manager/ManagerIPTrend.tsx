import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  FileText,
  Calendar,
  X,
  Maximize2,
  Minimize2,
  TrendingUp,
  BarChart3,
  Clock,
  Filter,
  Download,
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
import { managerService } from '../../../services/managerService';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker 설정 (public 폴더나 CDN 활용)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfThumbnail({ fileUrl }: { fileUrl: string }) {
  return (
    <div className="w-full h-40 overflow-hidden bg-slate-100 rounded-t-lg relative flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <BarChart3 className="w-10 h-10 text-slate-300" />
      </div>
      <Document
        file={fileUrl}
        loading={
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            로딩 중...
          </div>
        }
        error={null}
        className="opacity-50"
      >
        <Page
          pageNumber={1}
          width={200}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
}

export function ManagerIPTrend() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [gridPreviewUrl, setGridPreviewUrl] = useState<string | null>(null);

  // Load dummy PDF for grid previews (demo purpose) - DISABLED to prevent multiple worker instantiations
  /*
  useEffect(() => {
    let active = true;
    // Load a dummy report to show as preview in the grid
    managerService
      .downloadIPTrendReport(100) // Dummy ID
      .then((blob) => {
        if (active && blob) {
          setGridPreviewUrl(window.URL.createObjectURL(blob));
        }
      })
      .catch((err) => console.error('Failed to load grid preview', err));

    return () => {
      active = false;
      // Note: In a real app, we might want to revoke this, but since it's reused for all cards,
      // we keep it until unmount or let browser handle it.
    };
  }, []);
  */

  // Fetch IP Trend Dashboard Data (Summary & Stats)
  const { data: trendData, isLoading: isTrendLoading } = useQuery({
    queryKey: ['manager', 'iptrend', 'dashboard'],
    queryFn: managerService.getIPTrend,
  });

  // Fetch Reports List
  const { data: reportsData, isLoading: isReportsLoading } = useQuery({
    queryKey: ['manager', 'iptrend', 'list', selectedYear],
    queryFn: () => managerService.getIPTrendList(0, 10), // Pagination TODO
  });

  // Fetch Preview Data when ID is selected
  const { data: previewData, isLoading: isPreviewLoading } = useQuery({
    queryKey: ['manager', 'iptrend', 'preview', previewId],
    queryFn: () =>
      previewId
        ? managerService.getIPTrendPreview(previewId)
        : Promise.resolve(null),
    enabled: !!previewId,
  });

  // Fetch Blob for Preview to prevent auto-download
  useEffect(() => {
    let active = true;
    if (previewId) {
      managerService
        .downloadIPTrendReport(previewId)
        .then((blob) => {
          if (active && blob) {
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
          }
        })
        .catch((err) => {
          console.error('Failed to load PDF blob', err);
        });
    } else {
      setPdfUrl(null);
    }
    return () => {
      active = false;
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [previewId]);

  const stats = [
    {
      title: '전체 리포트',
      value: `${trendData?.statistics?.totalReports ?? 0}건`,
      description: '누적 생성 리포트',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: '완료된 리포트',
      value: `${trendData?.statistics?.completedReports ?? 0}건`,
      description: '정상 처리됨',
      icon: CheckCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: '최근 생성일',
      value: trendData?.statistics?.lastGeneratedAt
        ? new Date(trendData.statistics.lastGeneratedAt).toLocaleDateString()
        : '-',
      description: '마지막 업데이트',
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
  ];

  const handleDownload = async (id: number) => {
    try {
      const blob = await managerService.downloadIPTrendReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isTrendLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="border-slate-200 shadow-sm animate-pulse"
              >
                <CardContent className="p-6 h-[100px] bg-slate-50" />
              </Card>
            ))
          : stats.map((stat, index) => (
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

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 pt-8">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">리포트 목록</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            {reportsData?.totalElements ?? 0}
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
              {Array.from(
                { length: currentYear - 2025 + 1 },
                (_, i) => currentYear - i,
              ).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(reportsData?.content || []).map((report) => (
          <Card
            key={report.id}
            className="group cursor-pointer hover:shadow-md transition-all duration-200 border-slate-200 overflow-hidden"
            onClick={() => setPreviewId(report.id)}
          >
            <div className="bg-slate-100 relative overflow-hidden group-hover:shadow-inner transition-all">
              {/* PDF Preview (First Page Crop) */}
              {gridPreviewUrl ? (
                <PdfThumbnail fileUrl={gridPreviewUrl} />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <BarChart3 className="w-10 h-10 text-slate-300 group-hover:text-slate-400 transition-colors" />
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                <Button variant="secondary" size="sm" className="shadow-sm">
                  미리보기
                </Button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3 z-20">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-md text-xs font-medium shadow-sm',
                    report.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : report.status === 'FAILED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700',
                  )}
                >
                  {report.status}
                </span>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3
                    className="font-semibold text-slate-900 line-clamp-1"
                    title={report.fileName}
                  >
                    {report.fileName?.replace(/\.pdf$/i, '') || '제목 없음'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal (Full Screen Support) */}
      <Dialog
        open={!!previewId}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewId(null);
            setIsFullScreen(false);
          }
        }}
      >
        <DialogContent
          className={cn(
            'flex flex-col p-0 gap-0 transition-all duration-300',
            isFullScreen
              ? '!w-screen !h-screen !max-w-none rounded-none border-0'
              : '!max-w-[90vw] !w-[70vw] h-[90vh] rounded-xl',
          )}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-[100] shrink-0 relative min-h-[60px]">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-bold">
                {previewData?.fileName || '리포트 미리보기'}
              </DialogTitle>
              {previewData && (
                <>
                  <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {previewData.analysisDate}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-medium',
                      previewData.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : previewData.status === 'FAILED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700',
                    )}
                  >
                    {previewData.status}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {previewId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleDownload(previewId)}
                >
                  <Download className="w-4 h-4" />
                  다운로드
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-slate-500 hover:text-slate-900"
              >
                {isFullScreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </Button>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* PDF Viewer Area */}
          <div className="flex-1 bg-slate-100 overflow-hidden relative">
            {isPreviewLoading || (previewId && !pdfUrl) ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                <FileText className="w-16 h-16 opacity-20" />
                <p>미리보기 파일을 불러올 수 없습니다.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
