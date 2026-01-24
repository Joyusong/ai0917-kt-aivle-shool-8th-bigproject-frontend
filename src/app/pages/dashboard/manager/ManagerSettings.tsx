import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export function ManagerSettings() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-slate-900">
            시스템 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm text-slate-900 mb-4">
                AI 설정
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    자동 설정집 추출
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    AI 분석 자동 실행
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </label>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-sm text-slate-900 mb-4">
                알림 설정
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    새 설정집 등록 알림
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    AI 생성 완료 알림
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
