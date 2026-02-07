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
              value={formData['name'] || formData['keyword'] || ''}
              onChange={(v) => handleChange('name', v)}
            />
            <Field
              label="별명"
              value={formData['별명'] || []}
              isArray
              onChange={(v) => handleChange('별명', v)}
              onArrayChange={(idx, v) => handleArrayChange('별명', idx, v)}
              onAdd={() => handleAddArrayItem('별명')}
              onRemove={(idx) => handleRemoveArrayItem('별명', idx)}
            />
            <Field
              label="배경"
              value={formData['배경'] || []}
              isArray
              onChange={(v) => handleChange('배경', v)}
              onArrayChange={(idx, v) => handleArrayChange('배경', idx, v)}
              onAdd={() => handleAddArrayItem('배경')}
              onRemove={(idx) => handleRemoveArrayItem('배경', idx)}
            />
            <Field
              label="종족"
              value={formData['종족'] || []}
              isArray
              onChange={(v) => handleChange('종족', v)}
              onArrayChange={(idx, v) => handleArrayChange('종족', idx, v)}
              onAdd={() => handleAddArrayItem('종족')}
              onRemove={(idx) => handleRemoveArrayItem('종족', idx)}
            />
            <Field
              label="연령"
              value={formData['연령'] || formData['age'] || []}
              isArray
              onChange={(v) => handleChange('연령', v)}
              onArrayChange={(idx, v) => handleArrayChange('연령', idx, v)}
              onAdd={() => handleAddArrayItem('연령')}
              onRemove={(idx) => handleRemoveArrayItem('연령', idx)}
            />
            <Field
              label="직업/신분"
              value={formData['직업/신분'] || formData['role'] || []}
              isArray
              onChange={(v) => handleChange('직업/신분', v)}
              onArrayChange={(idx, v) => handleArrayChange('직업/신분', idx, v)}
              onAdd={() => handleAddArrayItem('직업/신분')}
              onRemove={(idx) => handleRemoveArrayItem('직업/신분', idx)}
            />
            <Field
              label="소속집단/가문"
              value={formData['소속집단/가문'] || []}
              isArray
              onChange={(v) => handleChange('소속집단/가문', v)}
              onArrayChange={(idx, v) =>
                handleArrayChange('소속집단/가문', idx, v)
              }
              onAdd={() => handleAddArrayItem('소속집단/가문')}
              onRemove={(idx) => handleRemoveArrayItem('소속집단/가문', idx)}
            />
            <Field
              label="외형"
              value={formData['외형'] || []}
              isArray
              onChange={(v) => handleChange('외형', v)}
              onArrayChange={(idx, v) => handleArrayChange('외형', idx, v)}
              onAdd={() => handleAddArrayItem('외형')}
              onRemove={(idx) => handleRemoveArrayItem('외형', idx)}
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
              value={formData['핵심 결핍'] || []}
              isArray
              onChange={(v) => handleChange('핵심 결핍', v)}
              onArrayChange={(idx, v) => handleArrayChange('핵심 결핍', idx, v)}
              onAdd={() => handleAddArrayItem('핵심 결핍')}
              onRemove={(idx) => handleRemoveArrayItem('핵심 결핍', idx)}
            />
            <Field
              label="내적 갈등"
              value={formData['내적 갈등'] || []}
              isArray
              onChange={(v) => handleChange('내적 갈등', v)}
              onArrayChange={(idx, v) => handleArrayChange('내적 갈등', idx, v)}
              onAdd={() => handleAddArrayItem('내적 갈등')}
              onRemove={(idx) => handleRemoveArrayItem('내적 갈등', idx)}
            />
            <Field
              label="외적 갈등"
              value={formData['외적 갈등'] || []}
              isArray
              onChange={(v) => handleChange('외적 갈등', v)}
              onArrayChange={(idx, v) => handleArrayChange('외적 갈등', idx, v)}
              onAdd={() => handleAddArrayItem('외적 갈등')}
              onRemove={(idx) => handleRemoveArrayItem('외적 갈등', idx)}
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
              value={formData['name'] || formData['keyword'] || ''}
              onChange={(v) => handleChange('name', v)}
            />
            <Field
              label="별칭"
              value={formData['별칭'] || []}
              isArray
              onChange={(v) => handleChange('별칭', v)}
              onArrayChange={(idx, v) => handleArrayChange('별칭', idx, v)}
              onAdd={() => handleAddArrayItem('별칭')}
              onRemove={(idx) => handleRemoveArrayItem('별칭', idx)}
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
            <Field
              label="역사"
              value={formData['역사'] || []}
              isArray
              onChange={(v) => handleChange('역사', v)}
              onArrayChange={(idx, v) => handleArrayChange('역사', idx, v)}
              onAdd={() => handleAddArrayItem('역사')}
              onRemove={(idx) => handleRemoveArrayItem('역사', idx)}
            />
            <Field
              label="위치"
              value={formData['위치'] || []}
              isArray
              onChange={(v) => handleChange('위치', v)}
              onArrayChange={(idx, v) => handleArrayChange('위치', idx, v)}
              onAdd={() => handleAddArrayItem('위치')}
              onRemove={(idx) => handleRemoveArrayItem('위치', idx)}
            />
            <Field
              label="집단"
              value={formData['집단'] || []}
              isArray
              onChange={(v) => handleChange('집단', v)}
              onArrayChange={(idx, v) => handleArrayChange('집단', idx, v)}
              onAdd={() => handleAddArrayItem('집단')}
              onRemove={(idx) => handleRemoveArrayItem('집단', idx)}
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
              label="작중묘사"
              value={formData['작중묘사'] || []}
              isArray
              onChange={(v) => handleChange('작중묘사', v)}
              onArrayChange={(idx, v) => handleArrayChange('작중묘사', idx, v)}
              onAdd={() => handleAddArrayItem('작중묘사')}
              onRemove={(idx) => handleRemoveArrayItem('작중묘사', idx)}
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
          </>
        );
      case '사건': // events
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={formData['name'] || formData['keyword'] || ''}
              onChange={(v) => handleChange('name', v)}
            />
            <Field
              label="관련 인물"
              value={formData['관련 인물'] || []}
              isArray
              onChange={(v) => handleChange('관련 인물', v)}
              onArrayChange={(idx, v) => handleArrayChange('관련 인물', idx, v)}
              onAdd={() => handleAddArrayItem('관련 인물')}
              onRemove={(idx) => handleRemoveArrayItem('관련 인물', idx)}
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
              label="트리거"
              value={formData['트리거'] || []}
              isArray
              onChange={(v) => handleChange('트리거', v)}
              onArrayChange={(idx, v) => handleArrayChange('트리거', idx, v)}
              onAdd={() => handleAddArrayItem('트리거')}
              onRemove={(idx) => handleRemoveArrayItem('트리거', idx)}
            />
            <Field
              label="영향 범위"
              value={formData['영향 범위'] || []}
              isArray
              onChange={(v) => handleChange('영향 범위', v)}
              onArrayChange={(idx, v) => handleArrayChange('영향 범위', idx, v)}
              onAdd={() => handleAddArrayItem('영향 범위')}
              onRemove={(idx) => handleRemoveArrayItem('영향 범위', idx)}
            />
            <Field
              label="변화점"
              value={formData['변화점'] || []}
              isArray
              onChange={(v) => handleChange('변화점', v)}
              onArrayChange={(idx, v) => handleArrayChange('변화점', idx, v)}
              onAdd={() => handleAddArrayItem('변화점')}
              onRemove={(idx) => handleRemoveArrayItem('변화점', idx)}
            />
          </>
        );
      case '물건': // items
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={formData['name'] || formData['keyword'] || ''}
              onChange={(v) => handleChange('name', v)}
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
              label="관련인물"
              value={formData['관련인물'] || []}
              isArray
              onChange={(v) => handleChange('관련인물', v)}
              onArrayChange={(idx, v) => handleArrayChange('관련인물', idx, v)}
              onAdd={() => handleAddArrayItem('관련인물')}
              onRemove={(idx) => handleRemoveArrayItem('관련인물', idx)}
            />
            <Field
              label="리스크"
              value={formData['리스크'] || []}
              isArray
              onChange={(v) => handleChange('리스크', v)}
              onArrayChange={(idx, v) => handleArrayChange('리스크', idx, v)}
              onAdd={() => handleAddArrayItem('리스크')}
              onRemove={(idx) => handleRemoveArrayItem('리스크', idx)}
            />
            <Field
              label="능력"
              value={formData['능력'] || []}
              isArray
              onChange={(v) => handleChange('능력', v)}
              onArrayChange={(idx, v) => handleArrayChange('능력', idx, v)}
              onAdd={() => handleAddArrayItem('능력')}
              onRemove={(idx) => handleRemoveArrayItem('능력', idx)}
            />
            <Field
              label="유래"
              value={formData['유래'] || []}
              isArray
              onChange={(v) => handleChange('유래', v)}
              onArrayChange={(idx, v) => handleArrayChange('유래', idx, v)}
              onAdd={() => handleAddArrayItem('유래')}
              onRemove={(idx) => handleRemoveArrayItem('유래', idx)}
            />
            <Field
              label="귀속상태"
              value={formData['귀속상태'] || []}
              isArray
              onChange={(v) => handleChange('귀속상태', v)}
              onArrayChange={(idx, v) => handleArrayChange('귀속상태', idx, v)}
              onAdd={() => handleAddArrayItem('귀속상태')}
              onRemove={(idx) => handleRemoveArrayItem('귀속상태', idx)}
            />
          </>
        );
      case '단체': // organizations
        return (
          <>
            <Field
              label="설정집명 (키워드)"
              value={formData['name'] || formData['keyword'] || ''}
              onChange={(v) => handleChange('name', v)}
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
              label="구성원"
              value={formData['구성원'] || []}
              isArray
              onChange={(v) => handleChange('구성원', v)}
              onArrayChange={(idx, v) => handleArrayChange('구성원', idx, v)}
              onAdd={() => handleAddArrayItem('구성원')}
              onRemove={(idx) => handleRemoveArrayItem('구성원', idx)}
            />
            <Field
              label="의사결정 구조"
              value={formData['의사결정 구조'] || []}
              isArray
              onChange={(v) => handleChange('의사결정 구조', v)}
              onArrayChange={(idx, v) =>
                handleArrayChange('의사결정 구조', idx, v)
              }
              onAdd={() => handleAddArrayItem('의사결정 구조')}
              onRemove={(idx) => handleRemoveArrayItem('의사결정 구조', idx)}
            />
            <Field
              label="유지 동력"
              value={formData['유지 동력'] || []}
              isArray
              onChange={(v) => handleChange('유지 동력', v)}
              onArrayChange={(idx, v) => handleArrayChange('유지 동력', idx, v)}
              onAdd={() => handleAddArrayItem('유지 동력')}
              onRemove={(idx) => handleRemoveArrayItem('유지 동력', idx)}
            />
            <Field
              label="대외적 평판"
              value={formData['대외적 평판'] || []}
              isArray
              onChange={(v) => handleChange('대외적 평판', v)}
              onArrayChange={(idx, v) =>
                handleArrayChange('대외적 평판', idx, v)
              }
              onAdd={() => handleAddArrayItem('대외적 평판')}
              onRemove={(idx) => handleRemoveArrayItem('대외적 평판', idx)}
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
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">
        {label}
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
          {(Array.isArray(value) ? value : []).map(
            (item: string, idx: number) => (
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
            ),
          )}
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
        />
      ) : (
        <Input
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(e.target.value)
          }
          className="h-9 text-sm"
        />
      )}
    </div>
  );
}
