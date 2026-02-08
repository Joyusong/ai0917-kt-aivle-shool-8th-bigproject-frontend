import React from 'react';
import { X, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { Badge } from './ui/badge';

interface SelectedSettingCardProps {
  item: {
    id: number;
    keyword: string;
    authorName: string;
    workTitle: string;
    category: string;
    // Extra fields from setting_format.txt
    nickname?: string;
    background?: string;
    species?: string;
  };
  onRemove: () => void;
  isCrown: boolean;
  onSelectCrown: () => void;
}

export function SelectedSettingCard({
  item,
  onRemove,
  isCrown,
  onSelectCrown,
}: SelectedSettingCardProps) {
  return (
    <div
      className={cn(
        'bg-white p-3 rounded-lg border shadow-sm relative group transition-all duration-200',
        isCrown
          ? 'border-yellow-500 shadow-md ring-1 ring-yellow-500 bg-yellow-50/10'
          : 'border-slate-200 hover:border-slate-300',
      )}
    >
      {/* Crown Selection (Radio Logic) */}
      <div
        className="absolute top-2.5 right-2.5 z-10 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onSelectCrown();
        }}
      >
        <Crown
          className={cn(
            'w-4 h-4 transition-colors',
            isCrown
              ? 'fill-yellow-500 text-yellow-500'
              : 'text-slate-300 hover:text-slate-400',
          )}
        />
      </div>

      {/* Remove Button - Positioned Top Left to avoid Crown conflict */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-2 h-5 w-5 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="w-3 h-3" />
      </Button>
      <div className="pt-1 pl-6 pr-8">
        {' '}
        {/* Added padding for icons */}
        <div
          className="font-bold text-sm mb-1 text-slate-800 truncate"
          title={item.keyword}
        >
          {item.keyword}
        </div>
        <div className="text-xs text-slate-500 flex flex-col gap-1">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
            <span className="truncate">
              {item.authorName} / {item.workTitle}
            </span>
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge
              variant="secondary"
              className="w-fit text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-600 border-slate-200 font-medium leading-none"
            >
              {item.category}
            </Badge>
            {item.species && (
              <Badge
                variant="outline"
                className="w-fit text-[10px] px-1.5 py-0 h-4 text-slate-500 border-slate-200 font-normal leading-none"
              >
                {item.species}
              </Badge>
            )}
          </div>
          {item.nickname && (
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              "{item.nickname}"
            </div>
          )}
          {item.background && (
            <div className="text-[10px] text-slate-400 line-clamp-2 leading-snug mt-0.5">
              {item.background}
            </div>
          )}
        </div>
      </div>

      {isCrown && (
        <div className="absolute bottom-2 right-2">
          <span className="text-[9px] font-bold text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-full">
            CORE
          </span>
        </div>
      )}
    </div>
  );
}
