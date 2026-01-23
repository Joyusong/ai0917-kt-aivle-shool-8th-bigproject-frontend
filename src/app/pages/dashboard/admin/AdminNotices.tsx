import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../api/axios';
import { adminService } from '../../../services/adminService';
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
  ExternalLink,
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

// --- 인터페이스 ---
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
  const [searchInput, setSearchInput] = useState(''); // New state for input
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 모달 제어 상태
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null,
  );
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writer, setWriter] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);

  // 1. 목록 조회
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getNotices(page, 10, keyword);
      setNotices(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('데이터 로드 실패', error);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 2. 저장 (등록/수정)
  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !writer.trim()) {
      return alert('모든 필드를 입력해주세요.');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('writer', writer);
    // CSV에 status가 있지만 기존 코드에 없으므로 생략 혹은 필요 시 추가
    // formData.append('status', 'POSTED');

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      setLoading(true);
      if (modalMode === 'edit' && selectedNotice) {
        await adminService.updateNotice(selectedNotice.id, formData);
      } else {
        await adminService.createNotice(formData);
      }
      alert('성공적으로 처리되었습니다.');
      closeModal();
      fetchNotices();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || '처리 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await adminService.deleteNotice(id);
      fetchNotices();
    } catch (error) {
      console.error('삭제 실패', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedNotice(null);
    setTitle('');
    setContent('');
    setWriter('');
    setSelectedFile(null);
  };

  const openView = (notice: Notice) => {
    setSelectedNotice(notice);
    setModalMode('view');
  };

  const openEdit = (e: React.MouseEvent, notice: Notice) => {
    e.stopPropagation(); // 제목 클릭 이벤트 방지
    setSelectedNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setWriter(notice.writer);
    setExistingFileName(notice.originalFilename);
    setModalMode('edit');
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const blob = await adminService.downloadNoticeFile(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              공지사항 관리
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              시스템 공지사항을 등록하고 관리합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="검색..."
                className="pl-9 h-9 bg-white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              onClick={() => setModalMode('create')}
              className="bg-blue-600 hover:bg-blue-700 h-9"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" /> 새 공지
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b uppercase font-semibold text-xs">
                <tr>
                  <th className="px-4 py-3 w-16 text-center">ID</th>
                  <th className="px-4 py-3 text-left">제목</th>
                  <th className="px-4 py-3 w-28 text-center hidden sm:table-cell">
                    작성자
                  </th>
                  <th className="px-4 py-3 w-20 text-center hidden sm:table-cell">
                    첨부
                  </th>
                  <th className="px-4 py-3 w-40 text-center hidden md:table-cell">
                    작성일
                  </th>
                  <th className="px-4 py-3 w-28 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notices.map((n) => (
                  <tr
                    key={n.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => openView(n)}
                  >
                    <td className="px-4 py-4 text-center text-slate-400 font-mono text-xs">
                      {n.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {n.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-300 sm:hidden" />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {n.writer}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      {n.originalFilename && (
                        <FileText className="w-4 h-4 mx-auto text-blue-400" />
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-500 hidden md:table-cell">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600"
                          onClick={(e) => openEdit(e, n)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(n.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-center gap-1.5 py-4 border-t bg-slate-50/30">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={page === i ? 'default' : 'ghost'}
                className={`h-8 w-8 p-0 ${page === i ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- 통합 모달 (작성/수정/보기) --- */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-none">
            <CardHeader className="border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">
                {modalMode === 'view'
                  ? '공지사항 상세'
                  : modalMode === 'edit'
                    ? '공지 수정'
                    : '새 공지 등록'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <CloseIcon className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {modalMode === 'view' && selectedNotice ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedNotice.title}
                    </h3>
                    <div className="flex gap-2 mt-2 text-xs text-slate-500">
                      <span>작성자: {selectedNotice.writer}</span>
                      <span>|</span>
                      <span>
                        날짜:{' '}
                        {new Date(selectedNotice.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-wrap min-h-[150px] text-sm leading-relaxed">
                    {selectedNotice.content}
                  </div>
                  {selectedNotice.originalFilename && (
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-white">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm flex-1 truncate">
                        {selectedNotice.originalFilename}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() =>
                          handleDownload(
                            selectedNotice.id,
                            selectedNotice.originalFilename!,
                          )
                        }
                      >
                        다운로드
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      작성자
                    </label>
                    <Input
                      value={writer}
                      onChange={(e) => setWriter(e.target.value)}
                      placeholder="작성자 이름"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      제목
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="공지 제목"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      내용
                    </label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="h-40 resize-none"
                      placeholder="내용을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      파일 첨부
                    </label>
                    <Input
                      type="file"
                      className="text-xs cursor-pointer"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
            <div className="p-4 border-t bg-slate-50/50 flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal}>
                닫기
              </Button>
              {modalMode !== 'view' && (
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 px-8 text-white"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    '저장하기'
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
