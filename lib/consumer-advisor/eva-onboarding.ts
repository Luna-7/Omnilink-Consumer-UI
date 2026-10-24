export interface EvaMemory {
  id: string;
  domain: string;
  text: string;
  createdAt?: string;
}

export interface EvaPreferences {
  clothing: string;
  other: string;
}

export interface EvaProfile {
  name: string;
  ageRange: string;
  gender: string;
  service: string | null;
  stage: 'basic' | 'choice' | 'quiz' | 'done';
  answers: Record<string, string>;
  preferences: EvaPreferences;
  memories: EvaMemory[];
}

export const emptyEvaProfile: EvaProfile = {
  name: '',
  ageRange: '不填写',
  gender: '不填写',
  service: null,
  stage: 'basic',
  answers: {},
  preferences: {
    clothing: '',
    other: '',
  },
  memories: [],
};

export const EVA_SERVICES = [
  { id: 'clothing', label: '穿搭灵感与规划' },
  { id: 'interior', label: '空间美学与家具' },
  { id: 'lifestyle', label: '生活方式与好物' },
];

export interface EvaQuestion {
  key: string;
  prompt: string;
  options: string[];
}

export function questionsForService(serviceId: string): EvaQuestion[] {
  if (serviceId === 'clothing') {
    return [
      {
        key: 'style',
        prompt: '你平时更偏好哪种穿搭风格？',
        options: ['极简日常', '复古工装', '慵懒松弛', '精致通勤'],
      },
      {
        key: 'color',
        prompt: '在色彩搭配上，你更倾向于：',
        options: ['黑白灰与大地色', '柔和低饱和浅色', '明快跳色点缀', '随心搭配'],
      },
      {
        key: 'scenario',
        prompt: '近期最需要解决的穿搭场景是：',
        options: ['日常通勤工作', '周末聚会出游', '重要活动亮相', '居家生活'],
      },
    ];
  }
  if (serviceId === 'interior') {
    return [
      {
        key: 'space',
        prompt: '你想要改造或布置的空间主要是：',
        options: ['起居客厅', '卧室休息区', '办公与书房', '阳台与休闲角'],
      },
      {
        key: 'aesthetic',
        prompt: '你更喜欢哪种空间美学氛围？',
        options: ['日系原木侘寂', '包豪斯现代工业', '法式中古复古', '北欧轻简舒适'],
      },
      {
        key: 'lighting',
        prompt: '对于空间照明与氛围感，你的期望是：',
        options: ['温暖漫反射点光源', '明亮通透充足采光', '层次分明的氛围重点灯', '自然光为主'],
      },
    ];
  }
  return [
    {
      key: 'pref1',
      prompt: '你希望优先探索的好物方向是：',
      options: ['经典质感', '前沿设计', '实用性价比', '自然舒适'],
    },
    {
      key: 'pref2',
      prompt: '你的挑选重点是：',
      options: ['独特设计感', '高品质材质', '多场景通用', '环保可持续'],
    },
  ];
}

export function readEvaProfile(raw?: unknown): EvaProfile {
  if (!raw || typeof raw !== 'object') return emptyEvaProfile;
  const p = raw as Partial<EvaProfile>;
  return {
    name: typeof p.name === 'string' ? p.name : '',
    ageRange: typeof p.ageRange === 'string' ? p.ageRange : '不填写',
    gender: typeof p.gender === 'string' ? p.gender : '不填写',
    service: typeof p.service === 'string' ? p.service : null,
    stage: p.stage || 'basic',
    answers: p.answers && typeof p.answers === 'object' ? { ...p.answers } : {},
    preferences: {
      clothing: p.preferences?.clothing || '',
      other: p.preferences?.other || '',
    },
    memories: Array.isArray(p.memories) ? [...p.memories] : [],
  };
}

export function editEvaProfile(current: EvaProfile, patch: Record<string, any>): EvaProfile {
  const next: EvaProfile = {
    ...current,
    answers: { ...current.answers },
    preferences: { ...current.preferences },
    memories: [...current.memories],
  };

  if (patch.action === 'update') {
    if (typeof patch.name === 'string') next.name = patch.name;
    if (typeof patch.ageRange === 'string') next.ageRange = patch.ageRange;
    if (typeof patch.gender === 'string') next.gender = patch.gender;
    if (patch.preferences) {
      next.preferences = { ...next.preferences, ...patch.preferences };
    }
  } else if (patch.action === 'memory') {
    next.memories.push({
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      domain: patch.domain || 'other',
      text: patch.text || '',
      createdAt: new Date().toISOString(),
    });
  } else if (patch.action === 'forget') {
    next.memories = next.memories.filter((m) => m.id !== patch.id);
  }

  return next;
}

export function advanceEvaProfile(current: EvaProfile, payload: Record<string, any>): EvaProfile {
  const next: EvaProfile = {
    ...current,
    answers: { ...current.answers },
    preferences: { ...current.preferences },
    memories: [...current.memories],
  };

  if (payload.action === 'basic') {
    if (payload.name) next.name = payload.name;
    if (payload.ageRange) next.ageRange = payload.ageRange;
    if (payload.gender) next.gender = payload.gender;
    next.stage = 'choice';
  } else if (payload.action === 'service') {
    next.service = payload.service;
    if (payload.service === 'browse') {
      next.stage = 'done';
    } else {
      next.stage = 'quiz';
    }
  } else if (payload.action === 'answer') {
    const qList = next.service ? questionsForService(next.service) : [];
    const unanswered = qList.find((q) => !(q.key in next.answers));
    if (unanswered) {
      next.answers[unanswered.key] = payload.answer;
      const remaining = qList.filter((q) => !(q.key in next.answers));
      if (remaining.length === 0) {
        next.stage = 'done';
      }
    } else {
      next.stage = 'done';
    }
  }

  return next;
}
