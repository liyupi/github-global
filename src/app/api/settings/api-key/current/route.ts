// 删除当前激活的 API Key

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/settings/api-key/current - 删除当前激活的 API Key
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 删除用户所有激活的 OpenRouter API Key
    const result = await prisma.apiKey.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'openrouter',
        isActive: true,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'No active API Key found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
