import {
  Sparkles,
  Upload,
  FileText,
  Edit,
  Trash2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { useState } from 'react';
import axios from 'axios';

export function AuthorManuscripts() {
  const [searchTitle, setSearchTitle] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [writer, setWriter] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [episode, setEpisode] = useState<string>('');
  const [txt, setTxt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [originals, setOriginals] = useState<
    {
      writer: string;
      title: string;
      subtitle?: string;
      episode?: number;
      updatedAt?: string;
      files?: { name: string; url: string; type: string }[];
    }[]
  >([
    {
      writer: '김작가',
      title: '암흑의 영역 연대기',
      subtitle: '서막',
      episode: 47,
      updatedAt: '2시간 전',
    },
    {
      writer: '이작가',
      title: '운명의 검',
      subtitle: '결말',
      episode: 120,
      updatedAt: '1일 전',
    },
    {
      writer: '박작가',
      title: '별빛 아카데미',
      subtitle: '입학식',
      episode: 85,
      updatedAt: '3일 전',
    },
  ]);
  const [createFiles, setCreateFiles] = useState<
    { name: string; url: string; type: string; file?: File }[]
  >([]);
  const [openView, setOpenView] = useState(false);
  const [selectedOriginal, setSelectedOriginal] = useState<
    (typeof originals)[number] | null
  >(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editWriter, setEditWriter] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editEpisode, setEditEpisode] = useState<string>('');
  const [editFiles, setEditFiles] = useState<
    { name: string; url: string; type: string }[]
  >([]);

  const filteredOriginals = searchTitle.trim()
    ? originals.filter((o) =>
        o.title.toLowerCase().includes(searchTitle.trim().toLowerCase()),
      )
    : originals;

  const onConfirmCreate = async () => {
    if (!newTitle.trim() || !writer.trim()) return;
    if (submitting) return;
    setSubmitting(true);
    const ep = episode ? Number(episode) : undefined;
    const vectorDbData = {
      txt,
      episode: ep,
      subtitle,
      check: {},
      title: newTitle,
      writer,
    };
    let sent = false;
    try {
      // 1. Try sending to AI Server
      const aiBaseUrl = import.meta.env.VITE_AI_BASE_URL;
      const aiEndpoint = `${aiBaseUrl}/novel`;
      if (aiEndpoint && txt.trim()) {
        try {
          await axios.post(aiEndpoint, vectorDbData, {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Content-Type': 'application/json',
            },
          });
          console.log('AI Server upload success');
        } catch (aiError) {
          console.warn(
            'AI Server upload failed (continuing to backend):',
            aiError,
          );
        }
      }

      // 2. Send to Backend (Main Server / MSW)
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('writer', writer);
      formData.append('subtitle', subtitle);
      if (episode) formData.append('episode', episode);
      if (txt) formData.append('content', txt);

      // Append files
      createFiles.forEach((f) => {
        if (f.file) {
          formData.append('file', f.file);
        }
      });

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.post(
        `${backendUrl}/api/v1/author/manuscript/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      alert('성공적으로 업로드되었습니다.');
      sent = true;
    } catch (e) {
      console.error(e);
      alert('업로드 중 오류가 발생했습니다.');
    }
    if (sent) {
      setOriginals([
        {
          writer,
          title: newTitle,
          subtitle,
          episode: ep,
          updatedAt: '방금 전',
          files: createFiles,
        },
        ...originals,
      ]);
    }
    setOpenCreate(false);
    setWriter('');
    setNewTitle('');
    setSubtitle('');
    setEpisode('');
    setTxt('');
    setCreateFiles([]);
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Upload Info */}
      <Card className="mb-6 border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-foreground mb-2">AI 자동 설정 추출</h3>
              <p className="text-sm text-muted-foreground mb-3">
                원문을 업로드하면 AI가 자동으로 인물, 세계관, 서사 설정을
                추출하여 설정집에 저장합니다. 원본 텍스트는 저장되지 않으며,
                추출된 설정만 관리됩니다.
              </p>
              <div className="text-xs text-muted-foreground">
                지원 형식: TXT, DOCX, PDF • 최대 파일 크기: 50MB
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-6">
        <Input
          placeholder="원문 검색..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="max-w-md"
        />
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setOpenCreate(true)}
        >
          <Upload className="w-4 h-4 mr-2" />새 원문 업로드
        </Button>
      </div>

      {filteredOriginals.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredOriginals.map((orig, idx) => (
              <div
                key={idx}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedOriginal(orig);
                  setSelectedIndex(originals.findIndex((o) => o === orig));
                  setIsEditing(false);
                  setEditWriter(orig.writer || '');
                  setEditTitle(orig.title || '');
                  setEditSubtitle(orig.subtitle || '');
                  setEditEpisode(
                    orig.episode !== undefined ? String(orig.episode) : '',
                  );
                  setEditFiles(orig.files || []);
                  setOpenView(true);
                }}
              >
                <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all">
                  <div className="aspect-[4/3] rounded mb-3 flex items-center justify-center overflow-hidden">
                    {orig.files &&
                    orig.files.find((f) => f.type.startsWith('image')) ? (
                      <img
                        src={
                          orig.files.find((f) => f.type.startsWith('image'))!
                            .url
                        }
                        alt={orig.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs text-foreground truncate mb-1">
                    {orig.title}
                  </div>
                  {orig.updatedAt && (
                    <div className="text-xs text-muted-foreground">
                      {orig.updatedAt}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>새 원문 업로드</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <div className="text-xs text-muted-foreground">
                writer(작가명)
              </div>
              <Input
                value={writer}
                onChange={(e) => setWriter(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                txt(원문 내용)
              </div>
              <Textarea
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                className="min-h-32"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">title(제목)</div>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                subtitle(소제목)
              </div>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">episode(회차)</div>
              <Input
                value={episode}
                onChange={(e) => setEpisode(e.target.value)}
                placeholder="숫자"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">원문 파일</div>
              <Input
                type="file"
                accept="*/*"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  const mapped = selected.map((f) => ({
                    file: f,
                    name: f.name,
                    url: URL.createObjectURL(f),
                    type: f.type,
                  }));
                  setCreateFiles((prev) => [...prev, ...mapped]);
                }}
              />
              {createFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {createFiles.map((f, i) =>
                    f.type.startsWith('image') ? (
                      <div
                        key={`${f.name}-${i}`}
                        className="bg-card border border-border rounded-lg p-3"
                      >
                        <img
                          src={f.url}
                          alt={f.name}
                          className="w-full aspect-[4/3] object-contain rounded mb-2 border border-border"
                        />
                        <div className="text-xs text-foreground truncate mb-1">
                          {f.name}
                        </div>
                        <a
                          href={f.url}
                          download={f.name}
                          className="text-xs text-blue-600 underline"
                        >
                          다운로드
                        </a>
                      </div>
                    ) : (
                      <div
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between bg-card border border-border rounded p-2"
                      >
                        <div className="text-xs text-foreground truncate">
                          {f.name}
                        </div>
                        <a
                          href={f.url}
                          download={f.name}
                          className="text-xs text-blue-600 underline ml-2"
                        >
                          다운로드
                        </a>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              취소
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={onConfirmCreate}
              disabled={submitting}
            >
              {submitting ? '처리 중...' : '확인'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? '원문 수정' : selectedOriginal?.title}
            </DialogTitle>
          </DialogHeader>
          {isEditing ? (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <div className="text-xs text-muted-foreground">
                  writer(작가명)
                </div>
                <Input
                  value={editWriter}
                  onChange={(e) => setEditWriter(e.target.value)}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">title(제목)</div>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  subtitle(소제목)
                </div>
                <Input
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  episode(회차)
                </div>
                <Input
                  value={editEpisode}
                  onChange={(e) => setEditEpisode(e.target.value)}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">원문 파일</div>
                <Input
                  type="file"
                  accept="*/*"
                  multiple
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    const mapped = selected.map((f) => ({
                      file: f,
                      name: f.name,
                      url: URL.createObjectURL(f),
                      type: f.type,
                    }));
                    setEditFiles((prev) => [...prev, ...mapped]);
                  }}
                />
                {editFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {editFiles.map((f, i) =>
                      f.type.startsWith('image') ? (
                        <div
                          key={`${f.name}-${i}`}
                          className="bg-card border border-border rounded-lg p-3"
                        >
                          <img
                            src={f.url}
                            alt={f.name}
                            className="w-full aspect-[4/3] object-contain rounded mb-2 border border-border"
                          />
                          <div className="text-xs text-foreground truncate mb-1">
                            {f.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={f.url}
                              download={f.name}
                              className="text-xs text-blue-600 underline"
                            >
                              다운로드
                            </a>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (
                                  confirm('정말 이 파일을 삭제하시겠습니까?')
                                ) {
                                  setEditFiles((prev) =>
                                    prev.filter((_, idx) => idx !== i),
                                  );
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={`${f.name}-${i}`}
                          className="flex items-center justify-between bg-card border border-border rounded p-2"
                        >
                          <div className="text-xs text-foreground truncate">
                            {f.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={f.url}
                              download={f.name}
                              className="text-xs text-blue-600 underline"
                            >
                              다운로드
                            </a>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (
                                  confirm('정말 이 파일을 삭제하시겠습니까?')
                                ) {
                                  setEditFiles((prev) =>
                                    prev.filter((_, idx) => idx !== i),
                                  );
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded p-4">
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  {selectedOriginal?.title}
                </h3>
                {selectedOriginal?.subtitle && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedOriginal.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{selectedOriginal?.writer}</span>
                  <span>•</span>
                  <span>{selectedOriginal?.episode}화</span>
                  <span>•</span>
                  <span>{selectedOriginal?.updatedAt}</span>
                </div>
              </div>

              {selectedOriginal?.files && selectedOriginal.files.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    첨부 파일
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOriginal.files.map((f, i) =>
                      f.type.startsWith('image') ? (
                        <div
                          key={i}
                          className="bg-card border border-border rounded-lg p-2"
                        >
                          <img
                            src={f.url}
                            alt={f.name}
                            className="w-full aspect-video object-cover rounded mb-1"
                          />
                          <a
                            href={f.url}
                            download={f.name}
                            className="text-xs text-blue-600 hover:underline block truncate"
                          >
                            {f.name}
                          </a>
                        </div>
                      ) : (
                        <div
                          key={i}
                          className="bg-card border border-border rounded p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs truncate">{f.name}</span>
                          </div>
                          <a
                            href={f.url}
                            download={f.name}
                            className="text-xs text-blue-600 hover:underline flex-shrink-0"
                          >
                            다운로드
                          </a>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                  첨부된 파일이 없습니다.
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
                <Button
                  onClick={() => {
                    // Update logic here
                    setIsEditing(false);
                  }}
                >
                  저장
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('정말 삭제하시겠습니까?')) {
                      setOriginals((prev) =>
                        prev.filter((o) => o !== selectedOriginal),
                      );
                      setOpenView(false);
                    }
                  }}
                >
                  삭제
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpenView(false)}>
                    닫기
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>수정</Button>
                </div>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
