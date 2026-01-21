import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  X as CloseIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Paperclip,
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
import { Badge } from '../../../components/ui/badge';

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
  const navigate = useNavigate();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);

  const authAxios = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL || '',
    });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    instance.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 403) {
          alert('관리자 권한이 없습니다.');
          navigate('/');
        }
        return Promise.reject(err);
      },
    );
    return instance;
  }, [navigate]);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authAxios.get<PageResponse>('/api/v1/admin/notice', {
        params: { keyword, page, size: 10 },
      });
      setNotices(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('데이터 로드 실패', error);
    } finally {
      setLoading(false);
    }
  }, [authAxios, keyword, page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSave = async () => {
    if (!title.trim()) return alert('제목을 입력해주세요.');

    const formData = new FormData();
    // [핵심 수정] 백엔드 @RequestPart("data") String을 위한 JSON Blob 처리
    const dataBlob = new Blob([JSON.stringify({ title, content })], {
      type: 'application/json',
    });
    formData.append('data', dataBlob);

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      setLoading(true);
      if (editingId) {
        await authAxios.patch(`/api/v1/admin/notice/${editingId}`, formData);
      } else {
        await authAxios.post('/api/v1/admin/notice', formData);
      }
      alert('공지사항이 저장되었습니다.');
      closeModal();
      fetchNotices();
    } catch (e: any) {
      alert(e.response?.data?.message || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await authAxios.delete(`/api/v1/admin/notice/${id}`);
      fetchNotices();
    } catch (e) {
      alert('삭제 실패');
    }
  };

  // [추가] 기존 첨부파일만 별도 삭제 기능
  const handleDeleteFile = async () => {
    if (!editingId || !confirm('첨부파일을 삭제하시겠습니까?')) return;
    try {
      await authAxios.delete(`/api/v1/admin/notice/${editingId}/file`);
      setExistingFileName(null);
      alert('파일이 삭제되었습니다.');
      fetchNotices();
    } catch (e) {
      alert('파일 삭제 실패');
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const res = await authAxios.get(`/api/v1/admin/notice/${id}/download`, {
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
    setExistingFileName(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats (생략 - 동일) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
            <Megaphone />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              공지사항 관리
            </h2>
            <p className="text-sm text-muted-foreground">
              총 {totalElements}개의 공지가 있습니다.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> 새 공지 작성
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>공지사항 목록</CardTitle>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr className="text-xs text-muted-foreground uppercase">
                  <th className="px-6 py-3 w-20">ID</th>
                  <th className="px-6 py-3 text-left">제목</th>
                  <th className="px-6 py-3 w-24">첨부</th>
                  <th className="px-6 py-3 w-32 text-center">등록일</th>
                  <th className="px-6 py-3 w-24 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : (
                  notices.map((n) => (
                    <tr
                      key={n.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {n.id}
                      </td>
                      <td className="px-6 py-4 font-medium">{n.title}</td>
                      <td className="px-6 py-4 text-center">
                        {n.originalFilename && (
                          <button
                            onClick={() =>
                              handleDownload(n.id, n.originalFilename!)
                            }
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FileText className="w-5 h-5 mx-auto" />
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">
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
                              setExistingFileName(n.originalFilename);
                              setShowModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(n.id)}
                            className="text-red-500"
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

          {/* Pagination UI */}
          <div className="p-4 border-t flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={page === i ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(i)}
                className={page === i ? 'bg-blue-600' : ''}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
                  placeholder="제목을 입력하세요"
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
                {existingFileName && !selectedFile && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 rounded-md mb-2">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Paperclip className="w-4 h-4" />
                      <span className="truncate max-w-[300px]">
                        {existingFileName}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteFile}
                      className="text-red-500 h-7"
                    >
                      삭제
                    </Button>
                  </div>
                )}
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={closeModal}>
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                저장하기
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
