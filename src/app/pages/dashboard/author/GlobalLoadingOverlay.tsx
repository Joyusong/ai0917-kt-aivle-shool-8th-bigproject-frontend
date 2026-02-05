import React, { useEffect, useState } from 'react';

interface GlobalLoadingOverlayProps {
  isVisible: boolean;
}

export function GlobalLoadingOverlay({ isVisible }: GlobalLoadingOverlayProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-6 p-8 rounded-xl shadow-2xl bg-card border border-border max-w-sm w-full mx-4">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute w-full h-full rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute w-full h-full rounded-full border-4 border-t-primary animate-spin"></div>
          <span className="text-xl font-bold font-mono text-primary">
            {elapsedTime}s
          </span>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AI 분석 중...
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            작품의 세계를 탐험하고 있습니다.
            <br />
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
