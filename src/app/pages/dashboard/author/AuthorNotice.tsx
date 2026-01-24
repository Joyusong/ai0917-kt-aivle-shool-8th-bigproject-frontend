import { AdminNotices } from '../admin/AdminNotices';

interface AuthorNoticeProps {
  integrationId: string;
}

export function AuthorNotice({ integrationId }: AuthorNoticeProps) {
  // AdminNotices를 재사용하되, readOnly 모드로 전달하여 수정/삭제/생성 기능을 비활성화합니다.
  return (
    <div className="space-y-6">
      <AdminNotices readOnly={true} />
    </div>
  );
}
