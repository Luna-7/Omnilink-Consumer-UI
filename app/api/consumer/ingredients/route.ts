import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    return NextResponse.json({
      text: `关于「${query || '成分'}」的分析：该成分主要提供滋润修护与屏障防护功效，性质温和稳定，适合多种肤质日常护理使用。`,
      styleTag: '成分资料检索',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '查询失败' },
      { status: 500 }
    );
  }
}
