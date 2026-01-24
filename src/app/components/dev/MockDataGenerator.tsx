import { useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { adminService } from '../../services/adminService';
import { Copy, Database, X } from 'lucide-react';

export function MockDataGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedJson, setGeneratedJson] = useState('');
  const [loading, setLoading] = useState(false);

  const generateNoticeData = async () => {
    setLoading(true);
    try {
      // Fetch first 100 notices
      const data = await adminService.getNotices(0, 100, '');
      const notices = data.content.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        writer: n.writer,
        createdAt: n.createdAt,
        originalFilename: n.originalFilename,
      }));

      const jsonString = JSON.stringify(notices, null, 2);
      setGeneratedJson(`// src/mocks/handlers.ts에 추가할 핸들러 예시입니다.
// 기존 핸들러 배열에 아래 코드를 추가하거나 교체하세요.

http.get('\${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/notice', () => {
  return HttpResponse.json({
    content: ${jsonString},
    totalElements: ${data.totalElements},
    totalPages: ${data.totalPages},
    number: 0,
    size: 10
  });
}),`);
    } catch (e) {
      console.error(e);
      setGeneratedJson(
        '데이터 로드 실패: 백엔드 서버가 실행 중인지 확인하세요.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg bg-slate-900 text-white hover:bg-slate-800"
        onClick={() => setIsOpen(true)}
      >
        <Database className="w-4 h-4 mr-2" /> MSW Data
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b py-4">
          <CardTitle>MSW Mock Data Generator</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            현재 백엔드(또는 상태)에 있는 데이터를 조회하여 MSW 핸들러 코드로
            변환해줍니다.
          </p>
          <div className="flex gap-2">
            <Button onClick={generateNoticeData} disabled={loading}>
              공지사항 데이터 추출
            </Button>
            {/* 추후 다른 데이터 추출 버튼 추가 가능 */}
          </div>

          <div className="flex-1 relative border rounded-md bg-slate-950 text-slate-50 font-mono text-xs overflow-hidden">
            <textarea
              className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono"
              value={generatedJson}
              readOnly
              placeholder="버튼을 누르면 여기에 코드가 생성됩니다."
            />
            {generatedJson && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => {
                  navigator.clipboard.writeText(generatedJson);
                  alert('클립보드에 복사되었습니다.');
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
