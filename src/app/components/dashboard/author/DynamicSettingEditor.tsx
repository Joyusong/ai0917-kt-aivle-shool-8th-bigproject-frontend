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
    // Ensure name/title fallback
    if (parsed) {
        if (!parsed.name && parsed.title) parsed.name = parsed.title;
        if (!parsed.name && parsed.keyword) parsed.name = parsed.keyword;
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

  const handleAddArrayItem = (key: string, initialValue: any = '') => {
    const currentArray = Array.isArray(formData[key]) ? [...formData[key]] : [];
    currentArray.push(initialValue);
    handleChange(key, currentArray);
  };

  const handleRemoveArrayItem = (key: string, index: number) => {
    const currentArray = Array.isArray(formData[key]) ? [...formData[key]] : [];
    currentArray.splice(index, 1);
    handleChange(key, currentArray);
  };

  const handleObjectArrayChange = (
    key: string,
    index: number,
    field: string,
    value: string,
  ) => {
    const currentArray = Array.isArray(formData[key]) ? [...formData[key]] : [];
    if (typeof currentArray[index] !== 'object') {
      currentArray[index] = {};
    }
    currentArray[index] = { ...currentArray[index], [field]: value };
    handleChange(key, currentArray);
  };

  // Define fields based on category
  const renderFields = () => {
    switch (category) {
      case '인물': // characters
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={
                formData['name'] ||
                formData['title'] ||
                formData['keyword'] ||
                ''
              }
              onChange={(v) => handleChange('name', v)}
              required
              autoFocus
              placeholder="예: 홍길동"
            />
            <Field
              label="별명"
              value={formData['별명'] || ''}
              onChange={(v) => handleChange('별명', v)}
            />
            <Field
              label="부제/별칭"
              value={formData['subtitle'] || ''}
              onChange={(v) => handleChange('subtitle', v)}
            />
            <Field
              label="배경"
              value={formData['배경'] || ''}
              onChange={(v) => handleChange('배경', v)}
              isTextarea
            />
            <Field
              label="종족"
              value={formData['종족'] || ''}
              onChange={(v) => handleChange('종족', v)}
            />
            <Field
              label="연령"
              value={formData['연령'] || formData['age'] || ''}
              onChange={(v) => handleChange('연령', v)}
            />
            <Field
              label="직업/신분"
              value={formData['직업/신분'] || formData['role'] || ''}
              onChange={(v) => handleChange('직업/신분', v)}
            />
            <Field
              label="소속집단/가문"
              value={formData['소속집단/가문'] || ''}
              onChange={(v) => handleChange('소속집단/가문', v)}
            />
            <Field
              label="외형"
              value={formData['외형'] || ''}
              onChange={(v) => handleChange('외형', v)}
              isTextarea
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
              label="기술/능력"
              value={formData['기술/능력'] || []}
              isObjectArray
              objectFields={[
                { key: '기술명', label: '기술명' },
                { key: '숙련도/강도', label: '숙련도/강도' },
                { key: '상세효과', label: '상세효과' },
              ]}
              onObjectArrayChange={(idx, field, val) =>
                handleObjectArrayChange('기술/능력', idx, field, val)
              }
              onAdd={() =>
                handleAddArrayItem('기술/능력', {
                  기술명: '',
                  '숙련도/강도': '',
                  상세효과: '',
                })
              }
              onRemove={(idx) => handleRemoveArrayItem('기술/능력', idx)}
            />
            <Field
              label="인물관계"
              value={formData['인물관계'] || []}
              isObjectArray
              objectFields={[
                { key: '대상이름', label: '대상이름' },
                { key: '관계', label: '관계' },
                { key: '상세내용', label: '상세내용' },
              ]}
              onObjectArrayChange={(idx, field, val) =>
                handleObjectArrayChange('인물관계', idx, field, val)
              }
              onAdd={() =>
                handleAddArrayItem('인물관계', {
                  대상이름: '',
                  관계: '',
                  상세내용: '',
                })
              }
              onRemove={(idx) => handleRemoveArrayItem('인물관계', idx)}
            />
            <Field
              label="핵심 결핍"
              value={formData['핵심 결핍'] || ''}
              onChange={(v) => handleChange('핵심 결핍', v)}
            />
            <Field
              label="내적 갈등"
              value={formData['내적 갈등'] || ''}
              onChange={(v) => handleChange('내적 갈등', v)}
            />
            <Field
              label="외적 갈등"
              value={formData['외적 갈등'] || ''}
              onChange={(v) => handleChange('외적 갈등', v)}
            />
            <Field
              label="대사"
              value={formData['대사'] || []}
              isArray
              onChange={(v) => handleChange('대사', v)}
              onArrayChange={(idx, v) => handleArrayChange('대사', idx, v)}
              onAdd={() => handleAddArrayItem('대사')}
              onRemove={(idx) => handleRemoveArrayItem('대사', idx)}
            />
            <Field
              label="행동 패턴"
              value={formData['행동 패턴'] || []}
              isArray
              onChange={(v) => handleChange('행동 패턴', v)}
              onArrayChange={(idx, v) => handleArrayChange('행동 패턴', idx, v)}
              onAdd={() => handleAddArrayItem('행동 패턴')}
              onRemove={(idx) => handleRemoveArrayItem('행동 패턴', idx)}
            />
          </>
        );
      case '세계': // world
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={formData['name'] || formData['keyword'] || ''}
              onChange={(v) => handleChange('name', v)}
              required
              autoFocus
              placeholder="예: 마법 세계"
            />
            <Field
              label="부제/별칭"
              value={formData['subtitle'] || ''}
              onChange={(v) => handleChange('subtitle', v)}
            />
            <Field
              label="종류"
              value={formData['종류'] || []}
              isArray
              onChange={(v) => handleChange('종류', v)}
              onArrayChange={(idx, v) => handleArrayChange('종류', idx, v)}
              onAdd={() => handleAddArrayItem('종류')}
              onRemove={(idx) => handleRemoveArrayItem('종류', idx)}
            />
            <Field
              label="설명"
              value={formData['설명'] || []}
              isArray
              onChange={(v) => handleChange('설명', v)}
              onArrayChange={(idx, v) => handleArrayChange('설명', idx, v)}
              onAdd={() => handleAddArrayItem('설명')}
              onRemove={(idx) => handleRemoveArrayItem('설명', idx)}
            />
            <Field
              label="규칙"
              value={formData['규칙'] || []}
              isArray
              onChange={(v) => handleChange('규칙', v)}
              onArrayChange={(idx, v) => handleArrayChange('규칙', idx, v)}
              onAdd={() => handleAddArrayItem('규칙')}
              onRemove={(idx) => handleRemoveArrayItem('규칙', idx)}
            />
            <Field
              label="금기"
              value={formData['금기'] || []}
              isArray
              onChange={(v) => handleChange('금기', v)}
              onArrayChange={(idx, v) => handleArrayChange('금기', idx, v)}
              onAdd={() => handleAddArrayItem('금기')}
              onRemove={(idx) => handleRemoveArrayItem('금기', idx)}
            />
            <Field
              label="필수 제약"
              value={formData['필수 제약'] || []}
              isArray
              onChange={(v) => handleChange('필수 제약', v)}
              onArrayChange={(idx, v) => handleArrayChange('필수 제약', idx, v)}
              onAdd={() => handleAddArrayItem('필수 제약')}
              onRemove={(idx) => handleRemoveArrayItem('필수 제약', idx)}
            />
            <Field
              label="분위기"
              value={formData['분위기'] || []}
              isArray
              onChange={(v) => handleChange('분위기', v)}
              onArrayChange={(idx, v) => handleArrayChange('분위기', idx, v)}
              onAdd={() => handleAddArrayItem('분위기')}
              onRemove={(idx) => handleRemoveArrayItem('분위기', idx)}
            />
          </>
        );
      case '장소': // places
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={
                formData['name'] ||
                formData['title'] ||
                formData['keyword'] ||
                ''
              }
              onChange={(v) => handleChange('name', v)}
              required
              autoFocus
              placeholder="예: 왕궁"
            />
            <Field
              label="부제/별칭"
              value={formData['subtitle'] || ''}
              onChange={(v) => handleChange('subtitle', v)}
            />
            <Field
              label="위치"
              value={formData['location'] || ''}
              onChange={(v) => handleChange('location', v)}
            />
            <Field
              label="규모"
              value={formData['scale'] || ''}
              onChange={(v) => handleChange('scale', v)}
            />
            <Field
              label="분위기"
              value={formData['atmosphere'] || ''}
              onChange={(v) => handleChange('atmosphere', v)}
            />
            <Field
              label="기능/용도"
              value={formData['function'] || ''}
              onChange={(v) => handleChange('function', v)}
            />
            <Field
              label="소유자/관리자"
              value={formData['owner'] || ''}
              onChange={(v) => handleChange('owner', v)}
            />
            <Field
              label="역사/배경"
              value={formData['history'] || ''}
              onChange={(v) => handleChange('history', v)}
              isTextarea
            />
            <Field
              label="하부지역"
              value={formData['하부지역'] || []}
              isArray
              onChange={(v) => handleChange('하부지역', v)}
              onArrayChange={(idx, v) => handleArrayChange('하부지역', idx, v)}
              onAdd={() => handleAddArrayItem('하부지역')}
              onRemove={(idx) => handleRemoveArrayItem('하부지역', idx)}
            />
            <Field
              label="규칙"
              value={formData['규칙'] || []}
              isArray
              onChange={(v) => handleChange('규칙', v)}
              onArrayChange={(idx, v) => handleArrayChange('규칙', idx, v)}
              onAdd={() => handleAddArrayItem('규칙')}
              onRemove={(idx) => handleRemoveArrayItem('규칙', idx)}
            />
            <Field
              label="상세 설명"
              value={formData['description'] || ''}
              onChange={(v) => handleChange('description', v)}
              isTextarea
            />
          </>
        );
      case '사건': // events
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={
                formData['name'] ||
                formData['title'] ||
                formData['keyword'] ||
                ''
              }
              onChange={(v) => handleChange('name', v)}
              required
              autoFocus
              placeholder="예: 왕위 계승 전쟁"
            />
            <Field
              label="부제/별칭"
              value={formData['subtitle'] || ''}
              onChange={(v) => handleChange('subtitle', v)}
            />
            <Field
              label="유형"
              value={formData['type'] || ''}
              onChange={(v) => handleChange('type', v)}
            />
            <Field
              label="발생 시점"
              value={formData['date'] || ''}
              onChange={(v) => handleChange('date', v)}
            />
            <Field
              label="발생 장소"
              value={formData['location'] || ''}
              onChange={(v) => handleChange('location', v)}
            />
            <Field
              label="원인/배경"
              value={formData['cause'] || ''}
              onChange={(v) => handleChange('cause', v)}
              isTextarea
            />
            <Field
              label="전개 과정"
              value={formData['flow'] || ''}
              onChange={(v) => handleChange('flow', v)}
              isTextarea
            />
            <Field
              label="결과"
              value={formData['result'] || ''}
              onChange={(v) => handleChange('result', v)}
              isTextarea
            />
            <Field
              label="영향/여파"
              value={formData['influence'] || ''}
              onChange={(v) => handleChange('influence', v)}
              isTextarea
            />
            <Field
              label="관련 인물"
              value={formData['participants'] || []}
              isArray
              onChange={(v) => handleChange('participants', v)}
              onArrayChange={(idx, v) =>
                handleArrayChange('participants', idx, v)
              }
              onAdd={() => handleAddArrayItem('participants')}
              onRemove={(idx) => handleRemoveArrayItem('participants', idx)}
            />
            <Field
              label="상세 설명"
              value={formData['description'] || ''}
              onChange={(v) => handleChange('description', v)}
              isTextarea
            />
          </>
        );
      case '물건': // items
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={
                formData['name'] ||
                formData['keyword'] ||
                formData['title'] ||
                ''
              }
              onChange={(v) => handleChange('name', v)}
              required
              autoFocus
              placeholder="예: 전설의 검"
            />
            <Field
              label="부제/별칭"
              value={formData['subtitle'] || ''}
              onChange={(v) => handleChange('subtitle', v)}
            />
            <Field
              label="종류"
              value={formData['type'] || ''}
              onChange={(v) => handleChange('type', v)}
            />
            <Field
              label="등급/가치"
              value={formData['rank'] || ''}
              onChange={(v) => handleChange('rank', v)}
            />
            <Field
              label="효과/능력"
              value={formData['effect'] || ''}
              onChange={(v) => handleChange('effect', v)}
            />
            <Field
              label="기원/출처"
              value={formData['origin'] || ''}
              onChange={(v) => handleChange('origin', v)}
            />
            <Field
              label="재질"
              value={formData['material'] || ''}
              onChange={(v) => handleChange('material', v)}
            />
            <Field
              label="소유자"
              value={formData['owner'] || ''}
              onChange={(v) => handleChange('owner', v)}
            />
            <Field
              label="내력/전설"
              value={formData['history'] || ''}
              onChange={(v) => handleChange('history', v)}
              isTextarea
            />
            <Field
              label="상세 설명"
              value={formData['description'] || ''}
              onChange={(v) => handleChange('description', v)}
              isTextarea
            />
          </>
        );
      case '집단': // organizations
      case '단체':
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={
                formData['name'] ||
                formData['keyword'] ||
                formData['title'] ||
                ''
              }
              onChange={(v) => handleChange('name', v)}
              required
              autoFocus
              placeholder="예: 제국 기사단"
            />
            <Field
              label="부제/별칭"
              value={formData['subtitle'] || ''}
              onChange={(v) => handleChange('subtitle', v)}
            />
            <Field
              label="유형"
              value={formData['type'] || ''}
              onChange={(v) => handleChange('type', v)}
            />
            <Field
              label="규모"
              value={formData['scale'] || ''}
              onChange={(v) => handleChange('scale', v)}
            />
            <Field
              label="목적/목표"
              value={formData['purpose'] || ''}
              onChange={(v) => handleChange('purpose', v)}
            />
            <Field
              label="주요 활동"
              value={formData['activity'] || ''}
              onChange={(v) => handleChange('activity', v)}
              isTextarea
            />
            <Field
              label="상징/문장"
              value={formData['symbol'] || ''}
              onChange={(v) => handleChange('symbol', v)}
            />
            <Field
              label="조직도/계급"
              value={formData['hierarchy'] || ''}
              onChange={(v) => handleChange('hierarchy', v)}
              isTextarea
            />
            <Field
              label="규율/규칙"
              value={formData['rules'] || ''}
              onChange={(v) => handleChange('rules', v)}
              isTextarea
            />
            <Field
              label="역사/연혁"
              value={formData['history'] || ''}
              onChange={(v) => handleChange('history', v)}
              isTextarea
            />
            <Field
              label="주요 소속원"
              value={formData['members'] || []}
              isArray
              onChange={(v) => handleChange('members', v)}
              onArrayChange={(idx, v) => handleArrayChange('members', idx, v)}
              onAdd={() => handleAddArrayItem('members')}
              onRemove={(idx) => handleRemoveArrayItem('members', idx)}
            />
            <Field
              label="상세 설명"
              value={formData['description'] || ''}
              onChange={(v) => handleChange('description', v)}
              isTextarea
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
          type="button"
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
          <p className="text-xs text-muted-foreground mt-4">
            * 모든 항목은 필수 입력 사항입니다.
          </p>
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: any;
  onChange?: (val: any) => void;
  isArray?: boolean;
  onArrayChange?: (index: number, val: string) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  isTextarea?: boolean;
  isObjectArray?: boolean;
  objectFields?: { key: string; label: string }[];
  onObjectArrayChange?: (index: number, field: string, val: string) => void;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
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
  isObjectArray,
  objectFields,
  onObjectArrayChange,
  required,
  autoFocus,
  placeholder,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {isObjectArray ? (
        <div className="space-y-2">
          {(Array.isArray(value) ? value : []).map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-3 border rounded-md bg-muted/20 space-y-2 relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-red-400 hover:text-red-500"
                onClick={() => onRemove?.(idx)}
              >
                <X className="w-3 h-3" />
              </Button>
              {objectFields?.map((field) => (
                <div key={field.key} className="grid grid-cols-4 items-center">
                  <span className="text-xs text-muted-foreground col-span-1">
                    {field.label}
                  </span>
                  <Input
                    value={item[field.key] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onObjectArrayChange?.(idx, field.key, e.target.value)
                    }
                    className="h-8 text-sm col-span-3"
                  />
                </div>
              ))}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="w-full h-8 text-xs dashed border-muted-foreground/30"
          >
            <Plus className="w-3 h-3 mr-1" /> 항목 추가
          </Button>
        </div>
      ) : isArray ? (
        <div className="space-y-2">
          {(Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : []
          ).map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={item}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onArrayChange?.(idx, e.target.value)
                }
                className="h-8 text-sm"
              />
              <Button
                type="button"
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
            type="button"
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
            onChange?.(e.target.value)
          }
          className="min-h-[80px] text-sm resize-none"
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
        />
      ) : (
        <Input
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(e.target.value)
          }
          className="h-9 text-sm"
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
