import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../components/ui/utils';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  role?: 'Manager' | 'Author' | 'Admin' | 'Default';
  collapsed?: boolean;
}

export function Logo({ className, onClick, role, collapsed }: LogoProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getThemeColors = () => {
    // 1. Role prop 우선 적용
    if (role === 'Manager') {
      return {
        dot: 'bg-[#0984E3]',
        text: 'text-[#0984E3]',
        ping: 'bg-[#0984E3]',
      };
    }
    if (role === 'Author') {
      return {
        dot: 'bg-[#6C5CE7]',
        text: 'text-[#6C5CE7]',
        ping: 'bg-[#6C5CE7]',
      };
    }
    if (role === 'Admin') {
      return {
        dot: 'bg-[#2D3436]',
        text: 'text-[#2D3436]',
        ping: 'bg-[#2D3436]',
      };
    }

    // 2. 기존 URL 기반 폴백 (하위 호환성 유지)
    if (location.pathname.includes('/manager')) {
      return {
        dot: 'bg-[#0984E3]',
        text: 'text-[#0984E3]',
        ping: 'bg-[#0984E3]',
      };
    }
    if (location.pathname.includes('/author')) {
      return {
        dot: 'bg-[#6C5CE7]',
        text: 'text-[#6C5CE7]',
        ping: 'bg-[#6C5CE7]',
      };
    }
    if (location.pathname.includes('/admin')) {
      return {
        dot: 'bg-[#2D3436]',
        text: 'text-[#2D3436]',
        ping: 'bg-[#2D3436]',
      };
    }
    return {
      dot: 'bg-foreground',
      text: 'text-foreground',
      ping: 'bg-foreground',
    };
  };

  const theme = getThemeColors();

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
        collapsed ? 'justify-center' : '',
        className,
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          'group relative flex flex-col items-center cursor-pointer select-none',
          collapsed ? 'px-0 py-2' : 'px-4 py-2',
        )}
      >
        {/* 메인 로고 영역 */}
        <div className="flex items-baseline tracking-tighter transition-all duration-500 ease-in-out">
          {/* IP: 본질 (정적이고 단단하게) */}
          <span
            className={cn(
              'font-black text-foreground transition-transform duration-300 group-hover:scale-105',
              collapsed ? 'text-xl' : 'text-2xl',
            )}
          >
            IP
          </span>

          {/* . : 중심점 (정적인 강조) */}
          <span
            className={cn(
              'relative flex mb-1',
              collapsed ? 'mx-0.5 h-1.5 w-1.5' : 'mx-1 h-2 w-2',
            )}
          >
            <span
              className={cn(
                'relative inline-flex rounded-full',
                collapsed ? 'h-1.5 w-1.5' : 'h-2 w-2',
                theme.dot,
              )}
            ></span>
          </span>

          {/* SUM: 확장 (부드러운 이동) */}
          {!collapsed && (
            <span className="text-2xl font-extralight text-foreground/80 transition-all duration-300 group-hover:text-foreground">
              SUM
            </span>
          )}
        </div>

        {/* 하단 툴팁형 ergo: 논리적 가교 */}
        {!collapsed && (
          <div className="absolute -bottom-1 flex flex-col items-center">
            <span
              className={cn(
                'opacity-0 translate-y-1 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0 text-xs font-black italic tracking-[0.3em]',
                theme.text,
              )}
            >
              ergo
            </span>
            {/* 툴팁을 받쳐주는 미세한 광채 (선택 사항) */}
            <div className="w-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/40 to-transparent transition-all duration-700 group-hover:w-12"></div>
          </div>
        )}
      </div>
    </div>
  );
}
