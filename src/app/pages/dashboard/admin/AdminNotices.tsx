import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService } from '../../../services/adminService';
import { authService } from '../../../services/authService';
import { maskName } from '../../../utils/format';
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

interface AdminNoticesProps {
  readOnly?: boolean;
}

export function AdminNotices({ readOnly = false }: AdminNoticesProps) {
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
  const [currentUser, setCurrentUser] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(''); // Role 상태 추가
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [deleteFile, setDeleteFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 0. 사용자 정보 조회
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await authService.me();
        setCurrentUser(me.name || '');
        setCurrentUserEmail(me.siteEmail || '');
        setCurrentUserRole(me.role || ''); // Role 설정
      } catch (e) {
        console.error('사용자 정보 로드 실패', e);
      }
    };
    fetchMe();
  }, []);

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
    if (!title.trim() || !content.trim()) {
      return alert('제목과 내용을 입력해주세요.');
    }

    const formData = new FormData();
    const noticeData = {
      title,
      content,
      writer: maskName(currentUser),
      status: 'POSTED',
      deleteFile,
    };

    // JSON 데이터를 Blob으로 변환하여 Content-Type을 application/json으로 명시
    const jsonBlob = new Blob([JSON.stringify(noticeData)], {
      type: 'application/json',
    });
    formData.append('data', jsonBlob);

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      setLoading(true);
      if (modalMode === 'edit' && selectedNotice) {
        // 파일 삭제 플래그가 있고, 기존 파일이 있었다면 삭제 API 호출
        if (deleteFile && selectedNotice.originalFilename) {
          try {
            await adminService.deleteNoticeFile(selectedNotice.id);
          } catch (e) {
            console.error('파일 삭제 실패:', e);
            // 파일 삭제 실패 시 진행 여부 결정 (일단 진행)
          }
        }
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
    setExistingFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openView = async (notice: Notice) => {
    try {
      const detail = await adminService.getNoticeDetail(notice.id);
      setSelectedNotice(detail);
    } catch {
      setSelectedNotice(notice);
    }
    setModalMode('view');
  };

  const openEdit = async (e: React.MouseEvent, notice: Notice) => {
    e.stopPropagation();
    let detail: Notice | null = null;
    try {
      detail = await adminService.getNoticeDetail(notice.id);
    } catch {
      detail = notice;
    }
    if (detail) {
      setSelectedNotice(detail);
      setTitle(detail.title);
      setContent(detail.content);
      setWriter(detail.writer);
      setExistingFileName(detail.originalFilename);
    }
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header - Title removed as per request */}
      {!readOnly && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              setModalMode('create');
              setWriter(currentUserEmail);
            }}
            className="bg-blue-600 hover:bg-blue-700 h-9"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" /> 새 공지
          </Button>
        </div>
      )}

      <Card className="border-border shadow-sm gap-0">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4 border-b">
          <span>공지사항 목록</span>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="제목 입력 (Enter)"
                  className="pl-9 h-9 bg-background"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-semibold text-xs">
                <tr>
                  <th className="px-4 py-3 w-40 text-center hidden md:table-cell">
                    작성일
                  </th>
                  <th className="px-4 py-3 text-left w-auto">제목</th>
                  <th className="px-4 py-3 w-28 text-center hidden sm:table-cell">
                    작성자
                  </th>
                  <th className="px-4 py-3 w-20 text-center hidden sm:table-cell">
                    첨부
                  </th>
                  {!readOnly && (
                    <th className="px-4 py-3 w-28 text-center">관리</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {notices.map((n) => (
                  <tr
                    key={n.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => openView(n)}
                  >
                    <td className="px-4 py-4 text-center text-muted-foreground hidden md:table-cell">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                          {n.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground sm:hidden" />
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
                    {!readOnly && (
                      <td
                        className="px-4 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 disabled:opacity-30"
                            onClick={(e) => openEdit(e, n)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 disabled:opacity-30"
                            onClick={() => handleDelete(n.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
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
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <Card
            className="w-full max-w-lg shadow-2xl border-none"
            onClick={(e) => e.stopPropagation()}
          >
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
                    <div className="text-sm font-medium text-foreground px-3 py-2 bg-muted/50 rounded-md">
                      {modalMode === 'create' ? (
                        <>
                          <span className="mr-2">{maskName(currentUser)}</span>
                          <span className="text-muted-foreground text-xs">
                            ({currentUserEmail})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">{writer}</span>
                        </>
                      )}
                    </div>
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
                    <div className="flex items-center gap-2">
                      {!existingFileName && !selectedFile && (
                        <Input
                          type="file"
                          className="text-xs cursor-pointer flex-1"
                          ref={fileInputRef}
                          onChange={(e) =>
                            setSelectedFile(e.target.files?.[0] || null)
                          }
                        />
                      )}
                      {(selectedFile || existingFileName) && (
                        <div className="flex-1 flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-sm truncate flex-1">
                            {existingFileName || selectedFile?.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 shrink-0"
                            onClick={() => {
                              if (!confirm('정말 첨부파일을 삭제하시겠습니까?'))
                                return;

                              // UI에서만 즉시 제거 (낙관적 업데이트)
                              setSelectedFile(null);
                              setExistingFileName(null);
                              setDeleteFile(true);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            title="파일 삭제"
                          >
                            <CloseIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
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
