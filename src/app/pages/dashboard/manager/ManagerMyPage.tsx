import {
  User,
  Mail,
  Calendar,
  Phone,
  Lock,
  UserX,
  Shield,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { format } from 'date-fns';

interface ManagerMyPageProps {
  onChangePassword: () => void;
  userData: any;
}

export function ManagerMyPage({
  onChangePassword,
  userData,
}: ManagerMyPageProps) {
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!userData?.userId) return;
    if (
      confirm(
        '정말로 계정 탈퇴(비활성화)를 신청하시겠습니까?\n이 작업은 되돌릴 수 없으며, 탈퇴 후 7일의 유예기간이 적용됩니다.',
      )
    ) {
      try {
        await authService.deactivateUser(userData.userId);
        alert(
          '계정이 비활성화(탈퇴) 처리되었습니다.\n7일 후 데이터가 영구 삭제됩니다.',
        );
        await authService.logout();
        navigate('/');
      } catch (error) {
        console.error('Account deletion failed', error);
        alert('계정 탈퇴 처리에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-muted-foreground">정보를 불러오는 중입니다...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">마이페이지</h1>
            <p className="text-sm text-muted-foreground">
              관리자님의 프로필 정보와 계정 설정을 관리하세요.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* 오른쪽: 상세 정보 및 계정 관리 */}
        <div className="md:col-span-8 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />내 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-normal">
                    이름
                  </Label>
                  <div className="font-medium flex items-center gap-2">
                    {userData.name || '알 수 없음'}
                  </div>
                  <Separator />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-normal">
                    이메일
                  </Label>
                  <div className="font-medium flex items-center gap-2">
                    {userData.email || '알 수 없음'}
                  </div>
                  <Separator />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-normal">
                    권한
                  </Label>
                  <div className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground/50" />
                    {userData.role || 'Manager'}
                  </div>
                  <Separator />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-normal">
                    전화번호
                  </Label>
                  <div className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground/50" />
                    {userData.mobile || '-'}
                  </div>
                  <Separator />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground font-normal">
                    가입일
                  </Label>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground/50" />
                    {userData.createdAt
                      ? format(new Date(userData.createdAt), 'yyyy년 MM월 dd일 HH:mm')
                      : '-'}
                  </div>
                  <Separator />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 px-6 py-3">
              <p className="text-xs text-muted-foreground">
                * 내 정보는 시스템 관리자에 의해 관리됩니다.
              </p>
            </CardFooter>
          </Card>

          <Card className="shadow-sm border-destructive/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive/80">
                <Lock className="w-5 h-5" />
                계정 보안
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={onChangePassword}
                  variant="outline"
                  className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  비밀번호 변경
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteAccount}
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  회원 탈퇴 (비활성화)
                </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 px-6 py-3">
              <p className="text-xs text-muted-foreground">
                * 계정 탈퇴 신청 후 7일의 유예 기간이 지나면 모든 개인정보 및
                데이터는 영구 삭제됩니다.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
