import { Bell, Shield, Key, Smartphone, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";

export function AuthorAccount() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">계정 설정</CardTitle>
          <CardDescription>보안 및 알림 설정을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {/* Password Section */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">비밀번호 변경</h3>
                    <p className="text-sm text-muted-foreground">주기적인 비밀번호 변경으로 계정을 보호하세요.</p>
                  </div>
                </div>
                <Button variant="outline">변경</Button>
              </div>
            </div>

            {/* 2FA Section */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">2단계 인증</h3>
                    <p className="text-sm text-muted-foreground">로그인 시 추가 인증을 통해 보안을 강화합니다.</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>

            {/* Notifications Section */}
            <div className="p-6">
              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">알림 설정</h3>
                  <p className="text-sm text-muted-foreground">이메일 및 푸시 알림 수신 여부를 설정합니다.</p>
                </div>
              </div>
              
              <div className="space-y-4 pl-13">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-email" className="flex flex-col gap-1">
                    <span>이메일 알림</span>
                    <span className="font-normal text-xs text-muted-foreground">주요 업데이트 및 공지사항을 이메일로 받습니다.</span>
                  </Label>
                  <Switch id="notify-email" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-push" className="flex flex-col gap-1">
                    <span>마케팅 정보 수신</span>
                    <span className="font-normal text-xs text-muted-foreground">이벤트 및 프로모션 정보를 받습니다.</span>
                  </Label>
                  <Switch id="notify-push" />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 bg-red-50/50 dark:bg-red-900/10">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-600 dark:text-red-400">계정 삭제</h3>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80">계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다.</p>
                  </div>
                </div>
                <Button variant="destructive">계정 삭제</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
