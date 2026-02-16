import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, Maximize2 } from 'lucide-react';
import { Mermaid } from '../../../components/Mermaid';

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mermaidCode: string | null;
  isLoading: boolean;
  error?: string | null;
}

export function AnalysisResultModal({
  isOpen,
  onClose,
  title,
  mermaidCode,
  isLoading,
  error,
}: AnalysisResultModalProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!chartRef.current) return;
    if (!document.fullscreenElement) {
      chartRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] h-[95vh] flex flex-col p-0 gap-0 bg-background text-foreground">
        <DialogHeader className="p-6 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>데이터를 분석하여 시각화하고 있습니다...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-destructive">
            <p>{error}</p>
          </div>
        ) : mermaidCode ? (
          <div className="flex-1 overflow-hidden bg-muted/30 p-6 relative">
            <div 
              ref={chartRef}
              className="w-full h-full bg-background rounded-lg border shadow-sm relative flex items-center justify-center overflow-hidden group"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="absolute top-3 right-3 z-10 bg-background/50 backdrop-blur-sm hover:bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="전체화면"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <div className="w-full h-full p-4 flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto">
                <Mermaid chart={mermaidCode} showControls={false} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <p>데이터가 없습니다.</p>
          </div>
        )}

        <div className="p-4 border-t bg-card flex justify-end shrink-0">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
