import { cloneElement, useCallback, useEffect, useState } from 'react';
import {
  Shield,
  Users,
  FileText,
  X as CloseIcon,
  Search,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import apiClient from '../../../api/axios';

// 1. 타입 정의
type Role = 'Admin' | 'Manager' | 'Author';
type Status = 'ACTIVE' | 'INACTIVE';

const ROLE_LABELS: Record<Role, string> = {
  Admin: '관리자',
  Manager: '매니저',
  Author: '작가',
};

interface AccessUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  date: string;
}

export function AdminPermissions() {
  // 상태 관리
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [summary, setSummary] = useState({
    adminCount: 0,
    managerCount: 0,
    authorCount: 0,
  });
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [page, setPage] = useState(0);

  // 모달 제어
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AccessUser | null>(null);

  // 등록용 폼 상태
  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    role: 'Manager' as Role,
  });

  // 스타일 헬퍼
  const getRoleBadge = (role: Role) => {
    const styles = {
      Admin: 'bg-red-500 text-white hover:bg-red-600',
      Manager: 'bg-blue-500 text-white hover:bg-blue-600',
      Author: 'bg-green-500 text-white hover:bg-green-600',
    };
    return styles[role];
  };

  const getGradient = (role: Role) => {
    const gradients = {
      Admin: 'from-red-500 to-pink-600',
      Manager: 'from-blue-500 to-purple-600',
      Author: 'from-green-500 to-teal-600',
    };
    return gradients[role];
  };

  // API 1: 요약 정보 조회 (AccessSummaryResponseDto 필드 매핑)
  const fetchSummary = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/access/summary');
      setSummary({
        adminCount: res.data.adminCount || 0,
        managerCount: res.data.managerCount || 0,
        authorCount: res.data.authorCount || 0,
      });
    } catch (err) {
      console.error('Summary fetch error', err);
    }
  }, []);

  // API 2: 사용자 목록 조회
  const fetchUsers = useCallback(async () => {
    try {
      const params = {
        keyword: keyword || undefined,
        role: roleFilter || undefined,
        page,
        size: 10,
      };
      const res = await apiClient.get('/api/v1/admin/access/users', { params });
      // 백엔드 반환 구조 (new UserPageResponse)에 맞춰 content 추출
      setUsers(res.data.users?.content || res.data.content || []);
    } catch (err) {
      setUsers([]);
    }
  }, [keyword, roleFilter, page]);

  useEffect(() => {
    fetchSummary();
    fetchUsers();
  }, [fetchSummary, fetchUsers]);

  // API 3: 사용자 생성 (UserCreateRequestDto)
  const handleCreate = async () => {
    if (!newForm.name || !newForm.email) return;
    try {
      await apiClient.post('/api/v1/admin/access/users', newForm);
      setShowCreateModal(false);
      setNewForm({ name: '', email: '', role: 'Manager' });
      fetchUsers();
      fetchSummary();
    } catch (err) {
      alert('사용자 추가에 실패했습니다.');
    }
  };

  // API 4: 사용자 삭제 (DELETE)
  const handleDelete = async (user: AccessUser) => {
    if (user.role === 'Admin')
      return alert('관리자 권한은 삭제할 수 없습니다.');
    if (!confirm(`${user.name}님의 모든 권한을 회수하시겠습니까?`)) return;
    try {
      await apiClient.delete(`/api/v1/admin/access/users/${user.id}`);
      fetchUsers();
      fetchSummary();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">권한 관리</h1>
            <p className="text-sm text-muted-foreground">
              사용자별 시스템 접근 권한을 관리합니다.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> 새 사용자 추가
        </Button>
      </div>

      {/* 요약 카드 (AccessSummaryResponseDto 필드 반영) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="관리자"
          count={summary.adminCount}
          icon={<Shield />}
          color="text-red-600"
          bg="bg-red-100 dark:bg-red-900/20"
        />
        <StatCard
          title="매니저"
          count={summary.managerCount}
          icon={<Users />}
          color="text-blue-600"
          bg="bg-blue-100 dark:bg-blue-900/20"
        />
        <StatCard
          title="작가"
          count={summary.authorCount}
          icon={<FileText />}
          color="text-green-600"
          bg="bg-green-100 dark:bg-green-900/20"
        />
      </div>

      {/* 사용자 목록 리스트 */}
      <Card className="border-border">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4 border-b">
          <CardTitle className="text-lg">사용자 리스트</CardTitle>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 w-full md:w-64"
                placeholder="이름 또는 이메일 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 bg-background text-sm flex-1 md:flex-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role)}
            >
              <option value="">모든 역할</option>
              <option value="Admin">관리자</option>
              <option value="Manager">매니저</option>
              <option value="Author">작가</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 text-left font-medium">사용자</th>
                  <th className="p-4 text-left font-medium">이메일</th>
                  <th className="p-4 text-left font-medium">역할</th>
                  <th className="p-4 text-left font-medium">상태</th>
                  <th className="p-4 text-center font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(user.role)} flex items-center justify-center text-white font-bold text-xs shadow-sm`}
                        >
                          {user.name[0]}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`${getRoleBadge(user.role)} border-none`}
                        >
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            user.status === 'ACTIVE' ? 'default' : 'outline'
                          }
                          className={
                            user.status === 'ACTIVE'
                              ? 'bg-green-500 hover:bg-green-600'
                              : ''
                          }
                        >
                          {user.status === 'ACTIVE' ? '활성' : '휴면'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={user.role === 'Admin'}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                        >
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={user.role === 'Admin'}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      사용자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 새 사용자 추가 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>새 사용자 등록</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateModal(false)}
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">이름</label>
                <Input
                  placeholder="홍길동"
                  value={newForm.name}
                  onChange={(e) =>
                    setNewForm({ ...newForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">이메일</label>
                <Input
                  type="email"
                  placeholder="example@aivle.com"
                  value={newForm.email}
                  onChange={(e) =>
                    setNewForm({ ...newForm, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">부여할 역할</label>
                <select
                  className="w-full border rounded-md p-2 bg-background"
                  value={newForm.role}
                  onChange={(e) =>
                    setNewForm({ ...newForm, role: e.target.value as Role })
                  }
                >
                  <option value="Manager">매니저 (Manager)</option>
                  <option value="Author">작가 (Author)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreate}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  사용자 추가
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ title, count, icon, color, bg }: any) {
  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          {cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">
            {count.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
