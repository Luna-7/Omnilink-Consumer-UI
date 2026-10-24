export interface AdvisorTaskStep {
  stepNo: number;
  label: string;
  outputSummary?: string;
  status: 'pending' | 'running' | 'completed' | 'waiting_for_user' | 'failed';
}

export interface AdvisorLook {
  title: string;
  currency: string;
  total: number;
  reason: string;
  productIds: string[];
}

export interface AdvisorProductSummary {
  id: string;
  name: string;
  storeName?: string;
  currency: string;
  price: number;
  storeSlug?: string;
  source?: string;
}

export interface AdvisorTaskResult {
  mode?: string;
  summary?: string;
  source?: string;
  products: AdvisorProductSummary[];
  profile?: {
    selfReported: Record<string, string>;
  };
  looks: AdvisorLook[];
  unknowns: string[];
}

export interface AdvisorTask {
  goal: string;
  status: 'waiting_for_user' | 'running' | 'completed' | 'failed' | 'cancelled';
  question?: string;
  answers: string[];
  steps: AdvisorTaskStep[];
  result?: AdvisorTaskResult;
  preview?: boolean;
  errorMessage?: string;
  revision?: string | number;
}

export function advisorQuestionOptions(question?: string): string[] {
  return ['日常通勤', '周末度假', '正式宴会', '极简松弛'];
}

export function isStyleDiscoveryGoal(goal: string): boolean {
  return goal.includes('风格') || goal.includes('探索');
}

export function styleDirectionFromAnswers(goal: string, answers: string[]): string {
  return answers.join(' · ') || '个性化风格推荐';
}
