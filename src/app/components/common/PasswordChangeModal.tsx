import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

interface PasswordChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => Promise<void>;
}

export function PasswordChangeModal({
  open,
  onOpenChange,
  onSubmit,
}: PasswordChangeModalProps) {
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password Strength Logic
  const getStrengthScore = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++; // Uppercase
    if (/[0-9]/.test(pwd)) score++; // Number
    if (/[!@#$%^&*(),.?":{}|<> ]/.test(pwd)) score++; // Special char
    return score;
  };

  const strengthScore = getStrengthScore(passwordForm.newPassword);

  const resetPwdValidation = {
    length: passwordForm.newPassword.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<> ]/.test(passwordForm.newPassword),
    match:
      passwordForm.newPassword !== '' &&
      passwordForm.newPassword === passwordForm.confirmPassword,
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!resetPwdValidation.length) {
      alert('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (!resetPwdValidation.special) {
      alert('새 비밀번호에 특수문자를 포함해야 합니다.');
      return;
    }
    if (!resetPwdValidation.match) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          newPasswordConfirm: passwordForm.confirmPassword,
        });
      } else {
        await authService.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          newPasswordConfirm: passwordForm.confirmPassword,
        });
      }
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      onOpenChange(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      await authService.logout();
      navigate('/');
    } catch (error: any) {
      console.error('Password change failed', error);
      alert(
        error.response?.data?.message ||
          '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val: boolean) => {
        if (!val) {
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogDescription>안전한 비밀번호로 변경해주세요.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPwd ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
              >
                {showCurrentPwd ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">새 비밀번호</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPwd ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPwd(!showNewPwd)}
              >
                {showNewPwd ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {/* Strength Meter */}
            <div className="flex gap-1 h-1 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-full transition-colors ${
                    strengthScore >= i
                      ? strengthScore <= 2
                        ? 'bg-red-500'
                        : strengthScore === 3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              8자 이상, 대문자, 숫자, 특수문자 포함
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPwd ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              >
                {showConfirmPwd ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {passwordForm.newPassword !== '' &&
              passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-red-500">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handlePasswordChange}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            비밀번호 변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
