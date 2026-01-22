export const maskName = (name: string): string => {
  if (!name) return '';
  if (name.length <= 1) return name;
  if (name.length === 2) {
    return name[0] + '*';
  }
  // For 3 or more characters, mask the middle characters
  // e.g., 홍길동 -> 홍*동, 남궁민수 -> 남**수
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};
