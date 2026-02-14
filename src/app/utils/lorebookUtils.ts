export const getTagsForItem = (item: any, defaultCategory = '인물') => {
  const category = item.category || defaultCategory;
  const flatten = (val: any) => (Array.isArray(val) ? val : [val]);

  switch (category) {
    case '인물':
      return [
        ...flatten(item.species || item['종족']),
        ...flatten(item.role || item['직업/신분']),
        ...flatten(item.age || item['연령']),
        ...flatten(item.traits || item['성격']),
      ].filter(Boolean) as string[];
    case '장소':
      return [
        item.location,
        item['위치'],
        item.scale,
        item['규모'],
        ...flatten(item['분위기']),
        ...(item['집단'] || []),
      ].filter(Boolean) as string[];
    case '물건':
      return [
        item.type,
        item['종류'],
        item.grade,
        item['등급'],
        ...(item['관련인물'] || []),
      ].filter(Boolean) as string[];
    case '집단':
      return [item.leader, item['수장'], item.scale, item['규모']].filter(
        Boolean,
      ) as string[];
    case '세계':
      return [...flatten(item['종류']), ...flatten(item['분위기'])].filter(
        Boolean,
      ) as string[];
    case '사건':
      return [
        item.importance,
        item['중요도'],
        item.date,
        item['발생 시점'],
      ].filter(Boolean) as string[];
    default:
      return [item.role, item.type, item.category].filter(Boolean) as string[];
  }
};
