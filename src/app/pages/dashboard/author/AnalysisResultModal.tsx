import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, X } from 'lucide-react';
import mermaid from 'mermaid';

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
  // Mermaid configuration
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Pretendard, sans-serif',
    });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0 bg-white">
        <DialogHeader className="p-6 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p>데이터를 분석하여 시각화하고 있습니다...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : mermaidCode ? (
          <div className="flex-1 overflow-auto bg-slate-50 p-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 min-h-full flex items-center justify-center overflow-auto">
              <MermaidChart chart={mermaidCode} id="analysis-chart" />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
            <p>데이터가 없습니다.</p>
          </div>
        )}

        <div className="p-4 border-t bg-white flex justify-end shrink-0">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MermaidChart({ chart, id }: { chart: string; id: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      try {
        setError(null);
        const { svg } = await mermaid.render(id + Math.random().toString(36).substr(2, 9), chart);
        setSvg(svg);
      } catch (e) {
        console.error('Mermaid render error:', e);
        setError('차트를 렌더링하는 중 오류가 발생했습니다.');
      }
    };

    const timer = setTimeout(() => {
      renderChart();
    }, 100);

    return () => clearTimeout(timer);
  }, [chart, id]);

  if (error) {
    return (
      <div className="text-red-500 text-sm flex flex-col items-center gap-2">
        <X className="w-6 h-6" />
        {error}
        <pre className="text-xs bg-slate-100 p-2 rounded mt-2 max-w-lg overflow-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      className="mermaid w-full h-full flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
