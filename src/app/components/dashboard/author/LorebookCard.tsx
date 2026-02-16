import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Edit, Trash2, Network } from 'lucide-react';
import { getTagsForItem } from '../../../utils/lorebookUtils';

export function LorebookCard({
  item,
  title,
  description,
  tags = [],
  category,
  onEdit,
  onDelete,
  onAnalyze,
}: {
  item: any;
  title: string;
  description: string;
  tags?: string[];
  category?: string;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onAnalyze?: () => void;
}) {
  const isCharacter = category === '인물';
  const isWorld = category === '세계';

  // Helper to extract displayable content fields
  const getDisplayContent = () => {
    if (!item) return [];

    const excludedKeys = [
      'id',
      'name',
      'title',
      'description',
      'category',
      'tags',
      'score',
      'similarity',
      'sim',
      'distance',
      'keyword',
      'subtitle',
      'episode',
      'setting',
      'epNum',
      'created_at',
      'updated_at',
      'work_id',
      'user_id',
      'userId',
      'workId',
      '별명',
      '기술/능력',
      '인물관계',
      '규칙',
      '금기',
      '필수 제약',
      'summary',
      '설명',
      '상세설명',
      '배경',
      '작중묘사',
      '외형', // Exclude fields likely used in description
      // Exclude fields already displayed as tags to prevent duplication
      '종족',
      'species',
      '직업/신분',
      'role',
      '연령',
      'age',
      '성격',
      'traits',
      '위치',
      'location',
      '규모',
      'scale',
      '분위기',
      '집단',
      '종류',
      'type',
      '등급',
      'grade',
      '관련인물',
      '수장',
      'leader',
      '중요도',
      'importance',
      '발생 시점',
      'date',
      '외적 갈등', // User specific exclusion based on preference for cleaner card
      '내적 갈등',
      '핵심 결핍',
      '행동 패턴',
      '대사',
    ];

    return Object.entries(item)
      .filter(([key, value]) => {
        return (
          !excludedKeys.includes(key) &&
          value !== null &&
          value !== undefined &&
          String(value).trim() !== '' &&
          String(value).trim() !== '""' &&
          typeof value !== 'object' // Simple values only for card view, or handle arrays specifically
        );
      })
      .slice(0, 4); // Limit to 4 items
  };

  const displayFields = getDisplayContent();

  return (
    <Card className="relative group hover:border-primary/50 transition-colors h-full flex flex-col">
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-base line-clamp-1">{title}</h5>
              {category && (
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 h-5 shrink-0 font-normal text-muted-foreground"
                >
                  {category}
                </Badge>
              )}
            </div>
            {isCharacter && item['별명'] && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(Array.isArray(item['별명']) ? item['별명'] : [item['별명']])
                  .filter(
                    (a: any) => a && typeof a === 'string' && a.trim() !== '',
                  )
                  .map((alias: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                    >
                      {alias}
                    </span>
                  ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {isCharacter && onAnalyze && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                onClick={onAnalyze}
                title="인물 관계도 분석"
              >
                <Network className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted"
              onClick={() => onEdit(item)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Dynamic Fields Display - Only show if not covered by tags/description */}
        {displayFields.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-md mt-auto">
            {displayFields.map(([key, value]) => (
              <div key={key} className="flex gap-1.5 truncate items-center">
                <span className="font-medium opacity-70 shrink-0 text-xs">
                  {key}
                </span>
                <span className="truncate">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Counts for Arrays */}
        <div className="flex gap-3 text-xs text-muted-foreground mt-2">
          {isCharacter && (
            <>
              {item['기술/능력'] &&
                Array.isArray(item['기술/능력']) &&
                item['기술/능력'].length > 0 && (
                  <span className="flex items-center gap-1">
                    기술{' '}
                    <span className="font-medium text-foreground">
                      {item['기술/능력'].length}
                    </span>
                    개
                  </span>
                )}
              {item['인물관계'] &&
                Array.isArray(item['인물관계']) &&
                item['인물관계'].length > 0 && (
                  <span className="flex items-center gap-1">
                    관계{' '}
                    <span className="font-medium text-foreground">
                      {item['인물관계'].length}
                    </span>
                    명
                  </span>
                )}
            </>
          )}

          {isWorld && (
            <>
              {item['규칙'] &&
                Array.isArray(item['규칙']) &&
                item['규칙'].length > 0 && (
                  <span className="flex items-center gap-1">
                    규칙{' '}
                    <span className="font-medium text-foreground">
                      {item['규칙'].length}
                    </span>
                    개
                  </span>
                )}
              {item['금기'] &&
                Array.isArray(item['금기']) &&
                item['금기'].length > 0 && (
                  <span className="flex items-center gap-1">
                    금기{' '}
                    <span className="font-medium text-foreground">
                      {item['금기'].length}
                    </span>
                    개
                  </span>
                )}
            </>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 mt-auto border-t border-border/50">
            {tags.slice(0, 5).map((tag, i) => (
              <span
                key={i}
                className="text-xs font-medium text-foreground/80 px-1"
              >
                {tag}
              </span>
            ))}
            {tags.length > 5 && (
              <span className="text-xs text-muted-foreground px-1">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
