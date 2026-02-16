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
    <div className="w-full h-40 overflow-hidden bg-muted rounded-t-lg relative flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <BarChart3 className="w-10 h-10 text-muted-foreground/30" />
      </div>
      <Document
        file={fileUrl}
        loading={
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
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
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8; // Grid 4x2 layout

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
    queryKey: ['manager', 'iptrend', 'list', selectedYear, page],
    queryFn: () => managerService.getIPTrendList(page, PAGE_SIZE, selectedYear),
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
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: '완료된 리포트',
      value: `${trendData?.statistics?.completedReports ?? 0}건`,
      description: '정상 처리됨',
      icon: CheckCircle,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: '최근 생성일',
      value: trendData?.statistics?.lastGeneratedAt
        ? new Date(trendData.statistics.lastGeneratedAt).toLocaleDateString()
        : '-',
      description: '마지막 업데이트',
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-500/10',
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
              <Card key={i} className="border-border shadow-sm animate-pulse">
                <CardContent className="p-6 h-[100px] bg-muted/50" />
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card key={index} className="border-border shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-8">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">리포트 목록</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            {reportsData?.totalElements ?? 0}
          </span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(reportsData?.content || []).map((report) => (
          <Card
            key={report.id}
            className="group cursor-pointer hover:shadow-md transition-all duration-200 border-border overflow-hidden"
            onClick={() => setPreviewId(report.id)}
          >
            <div className="bg-muted relative overflow-hidden group-hover:shadow-inner transition-all">
              {/* PDF Preview (First Page Crop) */}
              {gridPreviewUrl ? (
                <PdfThumbnail fileUrl={gridPreviewUrl} />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-muted/50 group-hover:bg-muted transition-colors relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <FileText className="w-12 h-12 text-muted-foreground/20" />
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                <Button variant="secondary" size="sm" className="shadow-sm">
                  미리보기
                </Button>
              </div>

              {/* Status Badge - Only show if NOT completed */}
              {report.status !== 'COMPLETED' && (
                <div className="absolute top-3 right-3 z-20">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-medium shadow-sm',
                      report.status === 'FAILED'
                        ? 'bg-destructive/10 text-destructive dark:text-destructive'
                        : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
                    )}
                  >
                    {report.status}
                  </span>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3
                    className="font-semibold text-foreground line-clamp-1"
                    title={report.fileName}
                  >
                    {report.fileName?.replace(/\.pdf$/i, '') || '제목 없음'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {reportsData && reportsData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-muted-foreground"
          >
            이전
          </Button>
          <div className="text-sm font-medium text-muted-foreground px-4">
            <span className="text-foreground">{page + 1}</span>
            <span className="mx-1 text-muted-foreground">/</span>
            {reportsData.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(reportsData.totalPages - 1, p + 1))
            }
            disabled={page >= reportsData.totalPages - 1}
            className="text-muted-foreground"
          >
            다음
          </Button>
        </div>
      )}

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
          <div className="flex items-center justify-between px-6 py-4 border-b bg-background z-[100] shrink-0 relative min-h-[60px]">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-bold">
                {previewData?.fileName || '리포트 미리보기'}
              </DialogTitle>
              {previewData && (
                <>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {previewData.analysisDate}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-medium',
                      previewData.status === 'COMPLETED'
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : previewData.status === 'FAILED'
                          ? 'bg-destructive/10 text-destructive dark:text-destructive'
                          : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
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
                className="text-muted-foreground hover:text-foreground"
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
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* PDF Viewer Area */}
          <div className="flex-1 bg-muted overflow-hidden relative">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4">
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
