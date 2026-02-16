import React from 'react';
import { X, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface SelectedSettingCardProps {
  item: {
    id?: number;
    keyword: string;
    authorName?: string;
    workTitle: string;
    category: string;
    nickname?: string;
    background?: string;
    description?: string | object;
    species?: string;
  };
  onRemove: () => void;
  isCrown: boolean;
  onSelectCrown?: () => void;
  onClick?: () => void;
  hideRemove?: boolean;
  highlight?: string;
  hideDescription?: boolean;
}

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={i}
            className="bg-yellow-500/20 font-medium text-yellow-700 dark:text-yellow-300"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

const getFormattedValues = (val: any): string[] => {
  if (val === null || val === undefined) return [];
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (['None', 'null', 'undefined', '', ' ', '""', "''"].includes(trimmed))
      return [];
    if (trimmed.length > 100) return [];
    return [trimmed];
  }
  if (typeof val === 'number' || typeof val === 'boolean') return [String(val)];
  if (Array.isArray(val)) return val.flatMap(getFormattedValues);
  if (typeof val === 'object') {
    return Object.entries(val)
      .filter(
        ([k]) =>
          ![
            'id',
            'epNum',
            'userId',
            'workId',
            'created_at',
            'updated_at',
          ].includes(k),
      )
      .flatMap(([_, v]) => getFormattedValues(v));
  }
  return [String(val)];
};

const parseAndFormatJson = (
  str: string | object | undefined | null,
): string[] => {
  if (!str) return [];
  try {
    let parsed: any = str;
    if (
      typeof str === 'string' &&
      (str.trim().startsWith('{') || str.trim().startsWith('['))
    ) {
      try {
        parsed = JSON.parse(str);
      } catch (e) {
        return getFormattedValues(str);
      }
    }
    if (typeof parsed === 'object' && parsed !== null) {
      const keys = Object.keys(parsed);
      return keys.length === 1
        ? getFormattedValues(parsed[keys[0]])
        : getFormattedValues(parsed);
    }
    return getFormattedValues(parsed);
  } catch (e) {
    return getFormattedValues(str);
  }
};

export function SelectedSettingCard({
  item,
  onRemove,
  isCrown,
  onSelectCrown,
  onClick,
  hideRemove,
  highlight,
  hideDescription,
}: SelectedSettingCardProps) {
  const showCrown = isCrown || !!onSelectCrown;
  const descriptionValues = hideDescription
    ? []
    : parseAndFormatJson(item.description || item.background);

  return (
    <Card
      className={cn(
        'relative group transition-all duration-200 w-full min-h-[115px] flex flex-col border-2 overflow-hidden',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-md',
        isCrown
          ? 'border-yellow-500 bg-yellow-500/5 shadow-sm'
          : 'border-transparent bg-card shadow-none', // border 두께를 고정(border-2)하여 흔들림 방지
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 flex-1 flex flex-col relative min-w-0 h-full">
        {/* 1. 상단 라인 */}
        <div className="flex items-start justify-between w-full gap-2 min-w-0">
          <div
            className={cn(
              'flex flex-col min-w-0 flex-1',
              !hideRemove && 'pl-6',
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <h5 className="font-semibold text-sm text-foreground truncate shrink">
                <HighlightText text={item.keyword} highlight={highlight} />
              </h5>
              <Badge
                variant="outline"
                className="text-xs px-1 h-5 shrink-0 font-normal whitespace-nowrap"
              >
                {item.category}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {item.workTitle} {item.authorName && `· ${item.authorName}`}
            </div>
          </div>

          {showCrown && (
            <div
              className={cn(
                'p-1.5 rounded-full shrink-0 z-30 transition-colors',
                isCrown
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-muted-foreground hover:bg-accent',
                onSelectCrown && 'cursor-pointer',
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectCrown) onSelectCrown();
              }}
            >
              <Crown className={cn('w-4 h-4', isCrown && 'fill-amber-500')} />
            </div>
          )}
        </div>

        {/* 2. 설명 배지 리스트: 고정 높이 적용 */}
        {!hideDescription && descriptionValues.length > 0 && (
          <div
            className={cn(
              'mt-2.5 flex flex-wrap gap-1.5 min-w-0 items-start overflow-hidden',
              !hideRemove && 'pl-6',
            )}
            // height를 고정하여 내부 배지 줄 수에 상관없이 카드 높이 유지
            style={{
              marginRight: '32px',
              height: '46px',
            }}
          >
            {descriptionValues.slice(10).map((val, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className={cn(
                  'text-xs px-1.5 h-5 font-normal text-muted-foreground bg-muted/30 border-border/50 shrink-0',
                  'max-w-[120px] truncate block',
                )}
                title={val}
              >
                {val}
              </Badge>
            ))}
            {descriptionValues.length > 10 && (
              <span className="text-xs text-muted-foreground font-medium self-center px-1">
                +{descriptionValues.length - 10}
              </span>
            )}
          </div>
        )}

        {/* 3. 푸터 라인: CORE 배지 절대 위치 지정 */}
        <div
          className={cn(
            'mt-auto pt-2 flex items-center justify-between min-h-[24px]',
            !hideRemove && 'pl-6',
          )}
        >
          <div className="flex flex-wrap gap-1 min-w-0 flex-1 items-center">
            {item.species && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 h-5 bg-secondary/50 shrink-0"
              >
                {item.species}
              </Badge>
            )}
            {item.nickname && (
              <span className="text-xs text-muted-foreground truncate max-w-[100px] px-1.5 py-0.5 rounded border border-border/50 bg-background/50">
                {item.nickname}
              </span>
            )}
          </div>

          {/* CORE 배지: absolute로 배치하여 높이 변화 차단 */}
          {isCrown && (
            <span className="absolute bottom-3 right-3 text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200 z-10 shrink-0">
              CORE
            </span>
          )}
        </div>

        {/* 삭제 버튼 */}
        {!hideRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2.5 left-1 h-5 w-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-40"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
