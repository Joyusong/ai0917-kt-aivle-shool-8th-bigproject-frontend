import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  X as CloseIcon,
  Search,
  UserX,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Clock,
  Trash2,
} from 'lucide-react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
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
import { authService } from '../../../services/authService';

// Role Labels and Helpers
const ROLE_LABELS: Record<UserRole, string> = {
  Admin: '관리자',
  Manager: '매니저',
  Author: '작가',
  Deactivated: '비활성화',
};

const getRoleBadge = (role: UserRole) => {
  const styles = {
    Admin: 'bg-red-500 text-white hover:bg-red-600',
    Manager: 'bg-blue-500 text-white hover:bg-blue-600',
    Author: 'bg-green-500 text-white hover:bg-green-600',
    Deactivated: 'bg-gray-500 text-white hover:bg-gray-600',
  };
  return styles[role] || 'bg-gray-500 text-white';
};

const getGradient = (role: UserRole) => {
  const gradients = {
    Admin: 'from-red-500 to-pink-600',
    Manager: 'from-blue-500 to-purple-600',
    Author: 'from-green-500 to-teal-600',
    Deactivated: 'from-gray-400 to-gray-500',
  };
  return gradients[role] || 'from-gray-500 to-gray-600';
};

const getDDayBadge = (dateStr: string, role: UserRole) => {
  if (role !== 'Deactivated') return null;

  const lastActivityDate = new Date(dateStr);
  const deletionDate = new Date(lastActivityDate);
  deletionDate.setDate(deletionDate.getDate() + 7); // 7 days grace period
  deletionDate.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = deletionDate.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let colorClass = 'bg-green-100 text-green-700 hover:bg-green-200';
  if (diffDays <= 3)
    colorClass = 'bg-orange-100 text-orange-700 hover:bg-orange-200';
  if (diffDays <= 1) colorClass = 'bg-red-100 text-red-700 hover:bg-red-200';

  const label =
    diffDays > 0
      ? `D-${diffDays}`
      : diffDays === 0
        ? 'D-Day'
        : `D+${Math.abs(diffDays)}`;

  return (
    <Badge variant="outline" className={`${colorClass} border-none`}>
      {label}
    </Badge>
  );
};

export function AdminPermissions() {
  const queryClient = useQueryClient();

  // Local State
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
    queryKey: ['adminUsers', page, searchQuery, roleFilter],
    queryFn: () => adminService.getUsers(page, 10, searchQuery, roleFilter),
    placeholderData: keepPreviousData,
  });

  const users = (userPage?.content || []).sort((a, b) => {
    const roleOrder: Record<string, number> = {
      Admin: 0,
      Manager: 1,
      Author: 2,
      Deactivated: 3,
    };
    const roleA = roleOrder[a.role] ?? 99;
    const roleB = roleOrder[b.role] ?? 99;
    return roleA - roleB;
  });

  // Mutations
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
    mutationFn: ({ id }: { id: number }) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminSummary'] });
      alert('사용자 계정이 삭제되었습니다.');
    },
    onError: () => {
      alert('계정 삭제에 실패했습니다.');
    },
  });

  // Handlers
  const handleDelete = (user: UserListResponseDto) => {
    if (user.role === 'Admin')
      return alert('관리자 계정은 삭제할 수 없습니다.');
    if (
      !confirm(
        `${user.name} 사용자를 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      )
    )
      return;
    deleteMutation.mutate({ id: user.id });
  };

  const handleUpdate = (role: UserRole) => {
    if (!selectedUser) return;
    updateMutation.mutate({ id: selectedUser.id, role });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header removed as per request */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <StatCard
          title="비활성화"
          count={summary?.deactivatedCount || 0}
          icon={<Users className="opacity-50" />}
          color="text-gray-600"
          bg="bg-gray-100 dark:bg-gray-900/20"
        />
      </div>

      {/* User List - Removed internal scroll containers to prevent double scroll */}
      <Card className="border-border shadow-sm gap-0">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4 border-b">
          <span>사용자 목록</span>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="flex gap-2 w-full md:w-auto flex-1 md:flex-none">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 w-full md:w-64"
                  placeholder="이름/이메일 검색 (Enter)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchQuery(keyword);
                      setPage(0);
                    }
                  }}
                />
              </div>
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
              <option value="Deactivated">비활성화</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-semibold text-xs text-left">
                <tr>
                  <th className="px-6 py-4">사용자</th>
                  <th className="px-6 py-4">이메일</th>
                  <th className="px-6 py-4">역할</th>
                  <th className="px-6 py-4">마지막 활동일</th>
                  <th className="px-6 py-4">생성일</th>
                  <th className="px-6 py-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(user.role)} flex items-center justify-center text-white font-bold text-xs shadow-sm`}
                          >
                            {user.name[0]}
                          </div>
                          <span className="font-medium text-foreground">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {user.siteEmail || user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`${getRoleBadge(user.role)} border-none font-normal`}
                        >
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {user.lastActivityAt ? (
                          <div className="flex items-center gap-2">
                            {getDDayBadge(user.lastActivityAt, user.role)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                user.lastActivityAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={user.role === 'Admin'}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={user.role === 'Admin'}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(user)}
                            title="계정 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-12 text-center text-muted-foreground"
                    >
                      검색된 사용자가 없습니다.
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
                          {user.name}
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
                    {user.lastActivityAt && (
                      <div className="flex items-center gap-2 mr-auto">
                        {getDDayBadge(user.lastActivityAt, user.role)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(user.lastActivityAt).toLocaleDateString()}
                          {user.role === 'Deactivated' && ' 삭제 예정'}
                        </span>
                      </div>
                    )}
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
                      <Trash2 className="w-4 h-4 mr-1" />
                      계정 삭제
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
              {Math.min((page + 1) * 10, userPage?.totalElements || 0)}번째
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
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
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals remain the same (fixed position ensures they sit above all scrolls) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-md shadow-2xl">
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-md shadow-2xl">
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
                  <div className="font-medium">{selectedUser.name}</div>
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
                  <option value="Admin">관리자</option>
                  <option value="Manager">매니저</option>
                  <option value="Author">작가</option>
                  <option value="Deactivated">비활성화</option>
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
