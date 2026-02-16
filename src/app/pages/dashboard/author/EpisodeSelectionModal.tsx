import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { authorService } from '../../../services/authorService';
import { ManuscriptDto } from '../../../types/author';

interface EpisodeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: number;
  userId: string;
  workTitle: string;
  onConfirm: (episodeIds: number[]) => void;
}

export function EpisodeSelectionModal({
  isOpen,
  onClose,
  workId,
  userId,
  workTitle,
  onConfirm,
}: EpisodeSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all manuscripts (limit 1000 for now)
  const { data: manuscriptsPage, isLoading } = useQuery({
    queryKey: ['author', 'manuscripts', 'all', workId],
    queryFn: () =>
      authorService.getManuscripts(userId, workTitle, 0, 1000, workId),
    enabled: isOpen && !!workId,
  });

  const manuscripts = manuscriptsPage?.content || [];

  const filteredManuscripts = manuscripts.filter(
    (m) =>
      m.episode.toString().includes(searchQuery) ||
      (m.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const allFilteredSelected = filteredManuscripts.every((m) =>
      selectedIds.includes(m.id),
    );

    if (allFilteredSelected) {
      // Deselect all FILTERED items
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredManuscripts.find((m) => m.id === id)),
      );
    } else {
      // Select all FILTERED items
      const newIds = [...selectedIds];
      filteredManuscripts.forEach((m) => {
        if (!newIds.includes(m.id)) {
          newIds.push(m.id);
        }
      });
      setSelectedIds(newIds);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>회차 선택</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            placeholder="예: 1화, 프롤로그, 주요 사건 등..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
            autoFocus
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={
                filteredManuscripts.length > 0 &&
                filteredManuscripts.every((m) => selectedIds.includes(m.id))
              }
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              전체 선택 ({filteredManuscripts.length}개)
            </label>
          </div>
        </div>

        <ScrollArea className="h-[300px] border rounded-md p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredManuscripts.map((m) => (
                <div key={m.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ep-${m.id}`}
                    checked={selectedIds.includes(m.id)}
                    onCheckedChange={() => handleToggle(m.id)}
                  />
                  <label
                    htmlFor={`ep-${m.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                  >
                    <span className="text-muted-foreground mr-1">
                      {m.episode}화.
                    </span>
                    {m.subtitle || '무제'}
                  </label>
                </div>
              ))}
              {manuscripts.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  회차가 없습니다.
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <p className="text-xs text-muted-foreground w-full text-right mb-2">
            * 최소 1개 이상의 회차를 선택해야 합니다.
          </p>
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              onClick={() => {
                onConfirm(selectedIds);
                onClose();
              }}
              disabled={selectedIds.length === 0}
            >
              분석 시작 ({selectedIds.length}개)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
