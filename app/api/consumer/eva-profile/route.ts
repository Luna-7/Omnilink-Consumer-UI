import { NextResponse } from 'next/server';
import {
  emptyEvaProfile,
  editEvaProfile,
  advanceEvaProfile,
  readEvaProfile,
  type EvaProfile,
} from '@/lib/consumer-advisor/eva-onboarding';

let inMemoryProfile: EvaProfile = {
  ...emptyEvaProfile,
  name: '体验访客',
  stage: 'basic',
};

export async function GET() {
  return NextResponse.json({ profile: readEvaProfile(inMemoryProfile) });
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    if (payload.action === 'basic' || payload.action === 'service' || payload.action === 'answer') {
      inMemoryProfile = advanceEvaProfile(inMemoryProfile, payload);
    } else {
      inMemoryProfile = editEvaProfile(inMemoryProfile, payload);
    }
    return NextResponse.json({ profile: readEvaProfile(inMemoryProfile) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新档案失败' },
      { status: 500 }
    );
  }
}
