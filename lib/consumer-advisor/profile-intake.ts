export interface ProfileSection {
  label: string;
  keys: string[];
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  { label: '基础信息', keys: ['name', 'ageRange', 'gender'] },
  { label: '风格倾向', keys: ['style', 'color'] },
];

export function isProfileGoal(goal: string): boolean {
  return goal.includes('档案') || goal.includes('建档') || goal.includes('资料');
}

export function profileFieldLabel(field: string): string {
  const map: Record<string, string> = {
    name: '称呼',
    ageRange: '年龄段',
    gender: '性别',
    style: '风格偏好',
    color: '色彩偏好',
  };
  return map[field] || field;
}

export function profileQuestionMeta(question?: string) {
  if (!question) return null;
  return {
    section: '风格偏好',
    index: 1,
    total: 3,
  };
}
