import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';

interface MermaidProps {
  chart: string;
  className?: string;
  showControls?: boolean;
}

export function Mermaid({
  chart,
  className,
  showControls = true,
}: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // 전체화면용 컨테이너
  const uniqueId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Mermaid 설정 (최초 1회)
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      themeVariables: { fontSize: '16px' },
      flowchart: { htmlLabels: true, curve: 'basis' },
      // 타임라인 등 다른 차트도 꽉 차게 나오도록 설정 추가
      // useMaxWidth: false, // This is deprecated in newer versions but sometimes useful.
      // Instead we control via CSS.
    });
  }, []);

  // 2. 차트 렌더링 로직 (비동기 방식 유지)
  useEffect(() => {
    const renderChart = async () => {
      if (ref.current && chart) {
        try {
          // 렌더링 전에 기존 내용을 비워주는 게 안전해!
          ref.current.innerHTML = '';
          const { svg } = await mermaid.render(uniqueId.current, chart);
          ref.current.innerHTML = svg;

          // [핵심] 렌더링 직후 SVG 내부의 스타일을 강제로 조작해서 꽉 차게 만들어!
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
            svgElement.style.maxWidth = 'none';
          }
        } catch (error) {
          console.error('Mermaid render error:', error);
          ref.current.innerHTML =
            '<div class="text-red-500 text-sm">Syntax Error</div>';
        }
      }
    };
    renderChart();
  }, [chart]);

  // 3. 전체화면 토글 및 상태 감지
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative bg-card border rounded-lg overflow-hidden flex flex-col items-center justify-center 
        ${isFullscreen ? 'w-screen h-screen p-10 fixed top-0 left-0 z-50' : 'w-full min-h-[400px] p-4'} ${className || ''}`}
    >
      {/* 전체화면 버튼: 우측 상단 배치 */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-accent"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* 차트가 그려질 영역 */}
      <div
        ref={ref}
        className="mermaid w-full h-full flex items-center justify-center overflow-hidden"
      />

      <style>{`
        /* 렌더링된 SVG가 컨테이너에 꽉 차도록 강제하는 마법의 CSS */
        .mermaid svg {
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain; /* 비율 유지하며 꽉 채우기 */
        }
        :fullscreen .mermaid {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
