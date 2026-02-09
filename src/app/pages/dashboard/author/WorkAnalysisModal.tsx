import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Loader2, X, GitGraph, Clock } from 'lucide-react';
import mermaid from 'mermaid';
import { authorService } from '../../../services/authorService';
import { useQuery } from '@tanstack/react-query';

interface WorkAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: number | null;
}

export function WorkAnalysisModal({
  isOpen,
  onClose,
  workId,
}: WorkAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState('relationship');

  // Mermaid configuration
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Pretendard, sans-serif',
    });
  }, []);

  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['work-analysis', workId],
    queryFn: () => (workId ? authorService.getWorkAnalysis(workId) : null),
    enabled: isOpen && !!workId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0 bg-white">
        <DialogHeader className="p-6 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">작품 심층 분석</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p>AI가 작품을 분석하여 시각화하고 있습니다...</p>
          </div>
        ) : analysisData ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-4 border-b bg-slate-50/50">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="relationship" className="gap-2">
                  <GitGraph className="w-4 h-4" />
                  인물 관계도
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <Clock className="w-4 h-4" />
                  사건 타임라인
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 p-6">
              <TabsContent value="relationship" className="h-full mt-0">
                <div className="bg-white rounded-xl shadow-sm border p-6 min-h-full flex items-center justify-center overflow-auto">
                  <MermaidChart
                    chart={analysisData.relationship}
                    id="relationship-chart"
                  />
                </div>
              </TabsContent>
              <TabsContent value="timeline" className="h-full mt-0">
                <div className="bg-white rounded-xl shadow-sm border p-6 min-h-full flex items-center justify-center overflow-auto">
                  <MermaidChart
                    chart={analysisData.timeline}
                    id="timeline-chart"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
            <p>분석 데이터를 불러올 수 없습니다.</p>
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
        // Clear previous SVG to prevent ID conflicts or artifacts if needed
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (e) {
        console.error('Mermaid render error:', e);
        setError('차트를 렌더링하는 중 오류가 발생했습니다.');
      }
    };
    
    // Slight delay to ensure DOM is ready and prevent race conditions
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
