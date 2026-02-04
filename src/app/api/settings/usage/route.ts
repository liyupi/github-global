// 用户使用量查询

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserUsage } from '@/lib/ratelimit';
import { prisma } from '@/lib/db';

/**
 * GET /api/settings/usage - 获取用户使用量和默认模型
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await getUserUsage(session.user.id);
    const today = new Date().toISOString().split('T')[0];

    // 获取当前激活的 API Key 的默认模型
    const activeApiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: 'openrouter',
        isActive: true,
      },
      select: {
        defaultModel: true,
      },
    });

    return NextResponse.json({
      today: {
        date: today,
        count: usage.count,
        limit: usage.limit,
      },
      hasApiKey: usage.hasApiKey,
      defaultModel: activeApiKey?.defaultModel || null,
    });
  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
