import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  X as CloseIcon,
  Search,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { cloneElement } from 'react';
import { adminService } from '../../../services/adminService';
import { UserRole } from '../../../types/common';
import {
  UserCreateRequestDto,
  UserListResponseDto,
} from '../../../types/admin';
import { maskName } from '../../../utils/format';

// Role Labels and Helpers
const ROLE_LABELS: Record<UserRole, string> = {
  Admin: '관리자',
  Manager: '매니저',
  Author: '작가',
};

const getRoleBadge = (role: UserRole) => {
  const styles = {
    Admin: 'bg-red-500 text-white hover:bg-red-600',
    Manager: 'bg-blue-500 text-white hover:bg-blue-600',
    Author: 'bg-green-500 text-white hover:bg-green-600',
  };
  return styles[role] || 'bg-gray-500 text-white';
};

const getGradient = (role: UserRole) => {
  const gradients = {
    Admin: 'from-red-500 to-pink-600',
    Manager: 'from-blue-500 to-purple-600',
    Author: 'from-green-500 to-teal-600',
  };
  return gradients[role] || 'from-gray-500 to-gray-600';
};

export function AdminPermissions() {
  const queryClient = useQueryClient();

  // Local State
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListResponseDto | null>(
    null,
  );
  const [editRole, setEditRole] = useState<UserRole>('Manager');
  const [newForm, setNewForm] = useState<UserCreateRequestDto>({
    name: '',
    email: '',
    role: 'Manager',
    siteEmail: '',
    sitePwd: '',
    mobile: '',
  });

  // Effects
  useEffect(() => {
    if (selectedUser) {
      setEditRole(selectedUser.role);
    }
  }, [selectedUser]);

  // Queries
  const { data: summary } = useQuery({
    queryKey: ['adminSummary'],
    queryFn: adminService.getSummary,
  });

  const { data: userPage } = useQuery({
    queryKey: ['adminUsers', page, keyword, roleFilter],
    queryFn: () => adminService.getUsers(page, 10, keyword, roleFilter),
  });

  const users = userPage?.content || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminSummary'] });
      setShowCreateModal(false);
      setNewForm({
        name: '',
        email: '',
        role: 'Manager',
        siteEmail: '',
        sitePwd: '',
        mobile: '',
      });
      alert('사용자가 추가되었습니다.');
    },
    onError: () => {
      alert('사용자 추가에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminSummary'] });
      setShowEditModal(false);
      setSelectedUser(null);
      alert('사용자 권한이 수정되었습니다.');
    },
    onError: () => {
      alert('권한 수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminSummary'] });
      alert('사용자가 삭제되었습니다.');
    },
    onError: () => {
      alert('삭제 실패');
    },
  });

  // Handlers
  const handleCreate = () => {
    if (!newForm.name || !newForm.email) return;
    createMutation.mutate(newForm);
  };

  const handleDelete = (user: UserListResponseDto) => {
    if (user.role === 'Admin')
      return alert('관리자 권한은 삭제할 수 없습니다.');
    if (!confirm(`${user.name}님의 모든 권한을 회수하시겠습니까?`)) return;
    deleteMutation.mutate(user.id);
  };

  const handleUpdate = (role: UserRole) => {
    if (!selectedUser) return;
    updateMutation.mutate({ id: selectedUser.id, role });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      {/* Header */}
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="관리자"
          count={summary?.adminCount || 0}
          icon={<Shield />}
          color="text-red-600"
          bg="bg-red-100 dark:bg-red-900/20"
        />
        <StatCard
          title="매니저"
          count={summary?.managerCount || 0}
          icon={<Users />}
          color="text-blue-600"
          bg="bg-blue-100 dark:bg-blue-900/20"
        />
        <StatCard
          title="작가"
          count={summary?.authorCount || 0}
          icon={<FileText />}
          color="text-green-600"
          bg="bg-green-100 dark:bg-green-900/20"
        />
      </div>

      {/* User List */}
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
              onChange={(e) => setRoleFilter(e.target.value as UserRole)}
            >
              <option value="">모든 역할</option>
              <option value="Admin">관리자</option>
              <option value="Manager">매니저</option>
              <option value="Author">작가</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 text-left font-medium">사용자</th>
                  <th className="p-4 text-left font-medium">이메일</th>
                  <th className="p-4 text-left font-medium">역할</th>
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
                        <span className="font-medium">
                          {maskName(user.name)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {user.siteEmail || user.email}
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`${getRoleBadge(user.role)} border-none`}
                        >
                          {ROLE_LABELS[user.role]}
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
                      colSpan={4}
                      className="p-8 text-center text-muted-foreground"
                    >
                      사용자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${getGradient(user.role)} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
                      >
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {maskName(user.name)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.siteEmail || '-'}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getRoleBadge(user.role)} border-none`}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={user.role === 'Admin'}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                    >
                      권한 수정
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-destructive hover:text-destructive"
                      disabled={user.role === 'Admin'}
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                사용자가 없습니다.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              총 {userPage?.totalElements || 0}명 중{' '}
              {userPage?.totalElements === 0 ? 0 : page * 10 + 1}-
              {Math.min((page + 1) * 10, userPage?.totalElements || 0)}명
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="sr-only">이전 페이지</span>
              </Button>
              <div className="flex items-center px-2 text-sm font-medium">
                {page + 1} / {userPage?.totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) =>
                    Math.min((userPage?.totalPages || 1) - 1, p + 1),
                  )
                }
                disabled={page >= (userPage?.totalPages || 1) - 1}
              >
                <ChevronRight className="w-4 h-4" />
                <span className="sr-only">다음 페이지</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
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
                    setNewForm({ ...newForm, role: e.target.value as UserRole })
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
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? '처리중...' : '사용자 추가'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>권한 수정</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditModal(false)}
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(selectedUser.role)} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {selectedUser.name[0]}
                </div>
                <div>
                  <div className="font-medium">
                    {maskName(selectedUser.name)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">역할 변경</label>
                <select
                  className="w-full border rounded-md p-2 bg-background"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                >
                  <option value="Manager">매니저 (Manager)</option>
                  <option value="Author">작가 (Author)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  * 관리자(Admin) 권한은 변경할 수 없습니다.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={() => handleUpdate(editRole)}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? '저장 중...' : '변경 사항 저장'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
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
