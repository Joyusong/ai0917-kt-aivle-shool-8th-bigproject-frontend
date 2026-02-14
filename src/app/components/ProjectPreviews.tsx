import {
  FileText,
  Maximize2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Video,
  ImageIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import { useState, useEffect, useRef } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker Setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfPreview = ({
  className,
  isFullScreen = false,
  onFullScreen,
  pdfUrl,
  onDownload,
  isLoading,
  fileName,
}: {
  className?: string;
  isFullScreen?: boolean;
  onFullScreen?: () => void;
  pdfUrl?: string;
  onDownload?: () => void;
  isLoading?: boolean;
  fileName?: string;
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // Update container width for responsive page rendering
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-card rounded-2xl overflow-hidden relative border border-border shadow-sm flex flex-col items-center justify-center text-center group',
        isFullScreen ? 'w-full h-full p-0' : 'p-6 h-full min-h-[300px]',
        className,
      )}
    >
      {pdfUrl ? (
        <div className="w-full h-full flex flex-col relative bg-muted/50">
          <div className="flex-1 overflow-auto p-4 relative">
            <div className="flex justify-center min-h-full">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <p className="text-sm text-muted-foreground animate-pulse">
                      PDF 미리보기를 불러오는 중...
                    </p>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center gap-2 text-destructive self-center mt-20">
                    <FileText className="w-8 h-8" />
                    <span className="text-xs">PDF를 불러올 수 없습니다.</span>
                  </div>
                }
                className="max-w-full shadow-lg"
              >
                <Page
                  pageNumber={pageNumber}
                  width={
                    isFullScreen
                      ? Math.min(containerWidth * 0.8 * scale, 1000 * scale)
                      : Math.min(containerWidth - 48, 600)
                  }
                  scale={isFullScreen ? scale : 1}
                  className="bg-card shadow-sm"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur shadow-md rounded-full px-3 py-1.5 z-10 border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium min-w-[3rem] text-foreground">
              {pageNumber} / {numPages || '-'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground"
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {isFullScreen && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground"
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs font-medium min-w-[3rem] text-foreground">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground"
                  onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Top Actions */}
          {!isFullScreen && (
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              {onDownload && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow-sm bg-background/90 hover:bg-background text-foreground"
                  onClick={onDownload}
                  title="다운로드"
                >
                  <FileText className="w-4 h-4" />
                </Button>
              )}
              {onFullScreen && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow-sm bg-background/90 hover:bg-background text-foreground"
                  onClick={onFullScreen}
                  title="전체화면"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {fileName || 'IP 확장 기획 제안서.pdf'}
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-[240px]">
              AI가 생성한 기획 제안서의 전체 내용을 PDF 형식으로 미리볼 수
              있습니다.
            </p>
            <div className="flex gap-3">
              {onDownload && (
                <Button
                  variant="outline"
                  className="gap-2 bg-background hover:bg-accent"
                  onClick={onDownload}
                >
                  <FileText className="w-4 h-4" />
                  PDF 다운로드
                </Button>
              )}
              {!isFullScreen && onFullScreen && (
                <Button
                  variant="ghost"
                  className="gap-2 text-muted-foreground hover:bg-accent"
                  onClick={onFullScreen}
                >
                  <Maximize2 className="w-4 h-4" />
                  전체화면
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const VisualPreview = ({
  className,
  isFullScreen = false,
  onFullScreen,
  imageUrl,
  type = 'image',
}: {
  className?: string;
  isFullScreen?: boolean;
  onFullScreen?: () => void;
  imageUrl?: string;
  type?: 'image' | 'video';
}) => {
  return (
    <div
      className={cn(
        'bg-card rounded-2xl overflow-hidden relative border border-border shadow-sm flex flex-col items-center justify-center text-center group',
        isFullScreen ? 'w-full h-full p-0' : 'p-6 h-full min-h-[300px]',
        className,
      )}
    >
      {imageUrl ? (
        <div className="w-full h-full relative">
          {type === 'video' ? (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <Video className="w-12 h-12 text-white opacity-50" />
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Visual Preview"
              className="w-full h-full object-cover"
            />
          )}
          {!isFullScreen && onFullScreen && (
            <div className="absolute top-2 right-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-sm bg-background/90 hover:bg-background text-foreground"
                onClick={onFullScreen}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              비주얼 컨셉 이미지
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-[240px]">
              생성된 비주얼 컨셉 아트를 미리볼 수 있습니다.
            </p>
            {!isFullScreen && onFullScreen && (
              <Button
                variant="outline"
                className="gap-2 bg-background hover:bg-accent"
                onClick={onFullScreen}
              >
                <Maximize2 className="w-4 h-4" />
                전체화면
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
