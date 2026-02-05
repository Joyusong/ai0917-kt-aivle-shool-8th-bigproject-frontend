import React, { useEffect, useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Plus, X } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';

interface DynamicSettingEditorProps {
  data: any; // Object or JSON string
  category: string;
  onChange: (newData: any) => void;
}

export function DynamicSettingEditor({
  data,
  category,
  onChange,
}: DynamicSettingEditorProps) {
  const [formData, setFormData] = useState<any>({});
  const [isRawMode, setIsRawMode] = useState(false);

  useEffect(() => {
    let parsed = data;
    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        parsed = { description: data }; // Fallback
      }
    }
    setFormData(parsed || {});
  }, [data]);

  const handleChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleArrayChange = (key: string, index: number, value: string) => {
    const currentArray = Array.isArray(formData[key]) ? [...formData[key]] : [];
    currentArray[index] = value;
    handleChange(key, currentArray);
  };

  const handleAddArrayItem = (key: string) => {
    const currentArray = Array.isArray(formData[key]) ? [...formData[key]] : [];
    currentArray.push('');
    handleChange(key, currentArray);
  };

  const handleRemoveArrayItem = (key: string, index: number) => {
    const currentArray = Array.isArray(formData[key]) ? [...formData[key]] : [];
    currentArray.splice(index, 1);
    handleChange(key, currentArray);
  };

  // Define fields based on category
  const renderFields = () => {
    switch (category) {
      case '인물': // characters
        return (
          <>
            <Field
              label="이름 (별명)"
              value={formData['별명'] || formData['name'] || ''}
              onChange={(v) => handleChange('별명', v)}
            />
            <Field
              label="직업/신분"
              value={formData['직업/신분'] || formData['role'] || ''}
              onChange={(v) => handleChange('직업/신분', v)}
            />
            <Field
              label="나이"
              value={formData['연령'] || formData['age'] || ''}
              onChange={(v) => handleChange('연령', v)}
            />
            <Field
              label="성격"
              value={formData['성격'] || formData['traits'] || []}
              isArray
              onChange={(v) => handleChange('성격', v)}
              onArrayChange={(idx, v) => handleArrayChange('성격', idx, v)}
              onAdd={() => handleAddArrayItem('성격')}
              onRemove={(idx) => handleRemoveArrayItem('성격', idx)}
            />
            <Field
              label="외형"
              value={formData['외형'] || ''}
              onChange={(v) => handleChange('외형', v)}
              isTextarea
            />
            <Field
              label="배경"
              value={formData['배경'] || ''}
              onChange={(v) => handleChange('배경', v)}
              isTextarea
            />
          </>
        );
      case '장소': // places
        return (
          <>
            <Field
              label="위치"
              value={formData['위치'] || formData['location'] || ''}
              onChange={(v) => handleChange('위치', v)}
            />
            <Field
              label="분위기"
              value={formData['분위기'] || formData['atmosphere'] || ''}
              onChange={(v) => handleChange('분위기', v)}
            />
            <Field
              label="설명"
              value={formData['작중묘사'] || formData['description'] || []}
              isArray
              onChange={(v) => handleChange('작중묘사', v)}
              onArrayChange={(idx, v) => handleArrayChange('작중묘사', idx, v)}
              onAdd={() => handleAddArrayItem('작중묘사')}
              onRemove={(idx) => handleRemoveArrayItem('작중묘사', idx)}
            />
          </>
        );
      // Add other cases as needed, fallback to generic
      default:
        // Generic renderer for unknown categories or "all"
        return Object.keys(formData).map((key) => {
          if (['ep_num', 'category', 'id', 'name'].includes(key)) return null;
          const val = formData[key];
          if (Array.isArray(val)) {
            return (
              <Field
                key={key}
                label={key}
                value={val}
                isArray
                onChange={(v) => handleChange(key, v)}
                onArrayChange={(idx, v) => handleArrayChange(key, idx, v)}
                onAdd={() => handleAddArrayItem(key)}
                onRemove={(idx) => handleRemoveArrayItem(key, idx)}
              />
            );
          }
          if (typeof val === 'string' || typeof val === 'number') {
            return (
              <Field
                key={key}
                label={key}
                value={val}
                onChange={(v) => handleChange(key, v)}
                isTextarea={String(val).length > 50}
              />
            );
          }
          return null;
        });
    }
  };

  return (
    <div className="space-y-4 p-1">
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsRawMode(!isRawMode)}
          className="text-xs text-muted-foreground"
        >
          {isRawMode ? '폼 모드로 보기' : 'JSON 원본 보기'}
        </Button>
      </div>

      {isRawMode ? (
        <Textarea
          value={JSON.stringify(formData, null, 2)}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData(parsed);
              onChange(parsed);
            } catch (err) {
              // Allow typing invalid JSON temporarily
            }
          }}
          className="font-mono text-xs min-h-[300px]"
        />
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {renderFields()}
          {/* Always show description if not handled above */}
          {!formData['description'] && !['인물', '장소'].includes(category) && (
            <Field
              label="설명"
              value={formData['description'] || ''}
              onChange={(v) => handleChange('description', v)}
              isTextarea
            />
          )}
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: any;
  onChange: (val: any) => void;
  isArray?: boolean;
  onArrayChange?: (index: number, val: string) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  isTextarea?: boolean;
}

function Field({
  label,
  value,
  onChange,
  isArray,
  onArrayChange,
  onAdd,
  onRemove,
  isTextarea,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {isArray ? (
        <div className="space-y-2">
          {(value as string[]).map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={item}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onArrayChange?.(idx, e.target.value)
                }
                className="h-8 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-red-400 hover:text-red-500"
                onClick={() => onRemove?.(idx)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="w-full h-8 text-xs dashed border-muted-foreground/30"
          >
            <Plus className="w-3 h-3 mr-1" /> 항목 추가
          </Button>
        </div>
      ) : isTextarea ? (
        <Textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          className="min-h-[80px] text-sm resize-none"
        />
      ) : (
        <Input
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          className="h-9 text-sm"
        />
      )}
    </div>
  );
}
