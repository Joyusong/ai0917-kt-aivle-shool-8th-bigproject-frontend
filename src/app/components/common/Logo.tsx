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
      className={cn("flex items-center gap-2 cursor-pointer select-none", className)}
      onClick={handleClick}
    >
      <div className="text-2xl font-black tracking-tighter text-foreground hover:opacity-80 transition-opacity">
        IP.SUM
      </div>
    </div>
  );
}
