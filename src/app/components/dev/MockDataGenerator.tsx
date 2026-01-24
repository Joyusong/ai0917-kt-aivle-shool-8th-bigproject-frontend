import { useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Copy, Database, X, FileJson, Play } from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';

// CSV에서 추출한 Admin 및 User Test 관련 API 프리셋
const API_PRESETS = `Test,0,Hello,GET,/api/v1,/hello
Test,0,NaverHello,GET,/api/v1,/auth/naver/hello
Test,0,SQL DATA Get,GET,/api/v1,/api/test
User,1,이메일 로그인 (자체 로그인),GET,/api/v1,/auth/login
User,1,네이버 로그인,GET,/api/v1,/auth/naver/login
User,1,네이버 로그인 인증 요청 콜백,GET,/api/v1,/auth/naver/callback
User,1,사용자 상태 조회,GET,/api/v1,/auth/me
User,1,사용자 로그아웃,POST,/api/v1,/auth/logout
User,1,비밀번호 찾기,POST,/api/v1,/auth/findpwd
admin,2,관리자 대시보드 ,GET,/api/v1,/admin/dashboard
admin,2,관리자 대시보드 통계,GET,/api/v1,/admin/dashboard/summary
admin,2,일일 활성 사용자(DAU) 데이터,GET,/api/v1,/admin/dashboard/dau
admin,2,시스템 리소스 사용량 조회,GET,/api/v1,/admin/dashboard/resources
admin,2,최근 시스템 로그 목록 조회,GET,/api/v1,/admin/dashboard/logs
admin,2,배포 및 환경 정보 조회,GET,/api/v1,/admin/dashboard/deployment
admin,3,관리자 권한 조회,GET,/api/v1,/admin/access
admin,3,권한별 사용자 요약 조회,GET,/api/v1,/admin/access/summary
admin,3,사용자 목록 조회 및 검색,GET,/api/v1,/admin/access/users
admin,3,사용자 상세 권한 조회,GET,/api/v1,/admin/access/users/{id}
admin,3,새 사용자 추가 및 권한 부여,POST,/api/v1,/admin/access/users
admin,3,사용자 권한/상태 정보 수정,PATCH,/api/v1,/admin/access/users/{id}
admin,3,사용자 권한 회수 및 삭제,DELETE,/api/v1,/admin/access/users/{id}
admin,4,공지사항 목록 조회,GET,/api/v1,/admin/notice
admin,4,공지사항 상세 조회,GET,/api/v1,/admin/notice/{id}
admin,4,새 공지사항 작성,POST,/api/v1,/admin/notice
admin,4,공지사항 정보 수정,PATCH,/api/v1,/admin/notice/{id}
admin,4,공지사항 파일 삭제 ,DELETE,/api/v1,/admin/notice/{id}/file
admin,4,공지사항 파일 다운로드,GET,/api/v1,/admin/notice/{id}/download
admin,4,공지사항 삭제,DELETE,/api/v1,/admin/notice/{id}
admin,5,최근 알림 목록 조회,GET,/api/v1,/admin/sysnotice
admin,5,알림 통계 조회,GET,/api/v1,/admin/sysnotice/stats
admin,5,실시간 알림 구독 ( 1시간 ),GET,/api/v1,/admin/sysnotice/subscribe
admin,5,알림 읽음 처리,PATCH,/api/v1,/admin/sysnotice/{source}/{id}/read`;

export function MockDataGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputCsv, setInputCsv] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const loadPreset = () => {
    setInputCsv(API_PRESETS);
  };

  const generateHandlers = () => {
    if (!inputCsv.trim()) return;

    const lines = inputCsv.split('\n');
    const handlers = lines
      .map((line) => {
        const parts = line.split(',');
        // CSV format assumption: Category, Index, Name, Method, Prefix, Path
        // We need Method (index 3), Prefix (index 4), Path (index 5)
        if (parts.length < 6) return null;

        const method = parts[3]?.trim().toLowerCase();
        const prefix = parts[4]?.trim();
        const path = parts[5]?.trim();
        const name = parts[2]?.trim();

        if (!method || !prefix || !path) return null;

        const fullPath = `\${import.meta.env.VITE_BACKEND_URL}${prefix}${path}`;

        // Convert path parameters {id} to :id for MSW if needed,
        // but MSW supports :id syntax. The CSV uses {id}, so we replace {id} with :id
        const mswPath = fullPath.replace(/{([^}]+)}/g, ':$1');

        return `  // ${name}
  http.${method}('${mswPath}', () => {
    return HttpResponse.json({
      message: 'Mock response for ${name}',
      // Add your mock data fields here
    });
  }),`;
      })
      .filter(Boolean)
      .join('\n\n');

    const code = `import { http, HttpResponse } from 'msw';

export const handlers = [
${handlers}
];`;
    setGeneratedCode(code);
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg bg-slate-900 text-white hover:bg-slate-800 opacity-20 hover:opacity-100 transition-all duration-300 group"
        onClick={() => setIsOpen(true)}
        title="MSW Mock Data Generator"
      >
        <Database className="w-4 h-4" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap group-hover:ml-2">
          MSW Data
        </span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b py-4">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            MSW Mock Data Generator
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 p-4">
          {/* Left Column: Input */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Label className="font-semibold">API Definition (CSV)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPreset}
                className="text-xs h-7"
              >
                <FileJson className="w-3 h-3 mr-1" />
                Load Admin/User Preset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: Category, Index, Name, Method, Prefix, Path...
            </p>
            <Textarea
              className="flex-1 font-mono text-xs resize-none"
              placeholder="Paste your CSV rows here..."
              value={inputCsv}
              onChange={(e) => setInputCsv(e.target.value)}
            />
            <Button onClick={generateHandlers} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Generate Handlers
            </Button>
          </div>

          {/* Right Column: Output */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center h-7">
              <Label className="font-semibold">Generated MSW Code</Label>
              {generatedCode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    alert('Copied to clipboard!');
                  }}
                  className="text-xs h-7"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              )}
            </div>
            <div className="flex-1 relative border rounded-md bg-slate-950 text-slate-50 font-mono text-xs overflow-hidden">
              <textarea
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-xs"
                value={generatedCode}
                readOnly
                placeholder="Generated code will appear here..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
