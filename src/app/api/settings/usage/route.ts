// 用户使用量查询

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserUsage } from '@/lib/ratelimit';

/**
 * GET /api/settings/usage - 获取用户使用量
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await getUserUsage(session.user.id);
    const today = new Date().toISOString().split('T')[0];

    return NextResponse.json({
      today: {
        date: today,
        count: usage.count,
        limit: usage.limit,
      },
      hasApiKey: usage.hasApiKey,
    });
  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
