import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../components/ui/utils';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export function Logo({ className, onClick }: LogoProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // Logic: If in dashboard, go to dashboard home. Else go to landing home.
    if (location.pathname.startsWith('/dashboard')) {
      if (location.pathname.includes('/admin')) {
        navigate('/dashboard/admin');
      } else if (location.pathname.includes('/manager')) {
        navigate('/dashboard/manager');
      } else if (location.pathname.includes('/author')) {
        navigate('/dashboard/author');
      } else {
        // Fallback for generic dashboard path
        navigate('/dashboard/admin'); // Default or check role?
        // Better to check auth service role?
        // But for now URL based is consistent with "current dashboard".
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 cursor-pointer select-none',
        className,
      )}
      onClick={handleClick}
    >
      <div className="group relative flex flex-col items-center cursor-pointer select-none px-4 py-2">
        {/* 메인 로고 영역 */}
        <div className="flex items-baseline tracking-tighter transition-all duration-500 ease-in-out">
          {/* IP: 본질 (살짝 기울어짐 효과) */}
          <span className="text-2xl font-black text-foreground transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
            IP
          </span>

          {/* . : 중심점 (에너지 파동 효과) */}
          <span className="relative mx-1 flex h-2 w-2 mb-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6C5CE7] opacity-20"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6C5CE7]"></span>
          </span>

          {/* SUM: 확장 (간격이 벌어지는 애니메이션) */}
          <span className="text-2xl font-extralight text-foreground/80 transition-all duration-500 group-hover:translate-x-1 group-hover:text-foreground">
            SUM
          </span>
        </div>

        {/* 하단 툴팁형 ergo: 논리적 가교 */}
        <div className="absolute -bottom-1 flex flex-col items-center">
          <span className="opacity-0 translate-y-1 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0 text-[9px] font-black italic tracking-[0.3em] text-[#6C5CE7]">
            ergo
          </span>
          {/* 툴팁을 받쳐주는 미세한 광채 (선택 사항) */}
          <div className="w-0 h-[1px] bg-gradient-to-r from-transparent via-[#6C5CE7]/40 to-transparent transition-all duration-700 group-hover:w-12"></div>
        </div>
      </div>
    </div>
  );
}
