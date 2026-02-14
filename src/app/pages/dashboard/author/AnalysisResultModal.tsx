import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2 } from 'lucide-react';
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0 bg-background text-foreground">
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
          <div className="flex-1 overflow-auto bg-muted/30 p-6">
            <Mermaid chart={mermaidCode} />
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
