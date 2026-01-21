import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../api/axios';
import {
  Megaphone,
  X as CloseIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';

// --- 타입 정의 ---
interface Notice {
  id: number;
  title: string;
  content: string;
  originalFilename: string | null;
  writer: string;
  createdAt: string;
}

interface PageResponse {
  content: Notice[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 모달/폼 상태
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);

  // 1. 목록 조회
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PageResponse>('/api/v1/admin/notice', {
        params: { keyword, page, size: 10 },
      });
      setNotices(res.data.content);
      setTotalElements(res.data.totalElements);
    } catch (error) {
      console.error('데이터 로드 실패', error);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // 2. 저장/수정
  const handleSave = async () => {
    if (!title.trim()) return alert('제목을 입력해주세요.');

    const formData = new FormData();
    formData.append('data', JSON.stringify({ title, content }));
    if (selectedFile) formData.append('file', selectedFile);

    try {
      if (editingId) {
        await apiClient.patch(`/api/v1/admin/notice/${editingId}`, formData);
      } else {
        await apiClient.post('/api/v1/admin/notice', formData);
      }
      closeModal();
      fetchNotices();
    } catch (e) {
      alert('저장 실패');
    }
  };

  // 3. 삭제
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/notice/${id}`);
      fetchNotices();
    } catch (e) {
      alert('삭제 실패');
    }
  };

  // [추가] 기존 첨부파일만 별도 삭제 기능
  const handleDeleteFile = async () => {
    if (!editingId || !confirm('첨부파일을 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/notice/${editingId}/file`);
      setExistingFileName(null);
      alert('파일이 삭제되었습니다.');
      fetchNotices();
    } catch (e) {
      alert('파일 삭제 실패');
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const res = await apiClient.get(`/api/v1/admin/notice/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('다운로드 실패');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg text-foreground font-semibold">공지사항</h2>
            <p className="text-sm text-muted-foreground">
              시스템 공지사항을 관리합니다.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />새 공지 작성
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl text-foreground font-bold">
                  {totalElements}
                </div>
                <div className="text-sm text-muted-foreground">
                  전체 공지사항
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List Card */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
            <CardTitle className="text-foreground">공지사항 목록</CardTitle>
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="제목 검색..."
                className="pl-10"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                    첨부
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : notices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-muted-foreground"
                    >
                      데이터가 존재하지 않습니다.
                    </td>
                  </tr>
                ) : (
                  notices.map((n) => (
                    <tr
                      key={n.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {n.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {n.title}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {n.originalFilename && (
                          <button
                            onClick={() =>
                              handleDownload(n.id, n.originalFilename!)
                            }
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <FileText className="w-5 h-5 mx-auto" />
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground text-sm">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(n.id);
                              setTitle(n.title);
                              setContent(n.content);
                              setShowModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(n.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {loading ? (
              <div className="p-10 text-center">
                <Loader2 className="animate-spin mx-auto text-blue-600" />
              </div>
            ) : notices.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                데이터가 존재하지 않습니다.
              </div>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{n.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(n.id);
                          setTitle(n.title);
                          setContent(n.content);
                          setShowModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(n.id)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{n.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {n.originalFilename && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <button
                        onClick={() =>
                          handleDownload(n.id, n.originalFilename!)
                        }
                        className="text-sm text-blue-500 hover:underline truncate"
                      >
                        {n.originalFilename}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <Card className="w-full max-w-2xl shadow-xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
              <CardTitle>
                {editingId ? '공지사항 수정' : '새 공지사항 등록'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <CloseIcon className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">공지 제목</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="공지사항 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">상세 내용</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-48"
                  placeholder="내용을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">파일 첨부</label>
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {editingId && !selectedFile && (
                  <p className="text-[10px] text-muted-foreground">
                    * 기존 파일을 유지하려면 비워두세요.
                  </p>
                )}
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t bg-muted/10">
              <Button variant="outline" onClick={closeModal}>
                취소
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                저장하기
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
