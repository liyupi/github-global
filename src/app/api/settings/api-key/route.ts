// 用户 API Key 设置

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/crypto';

/**
 * POST /api/settings/api-key - 保存 API Key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider = 'openrouter', apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing apiKey' },
        { status: 400 }
      );
    }

    // 加密 API Key
    const encryptedKey = encrypt(apiKey);

    // 先禁用所有旧的 API Key
    await prisma.apiKey.updateMany({
      where: {
        userId: session.user.id,
        provider,
      },
      data: {
        isActive: false,
      },
    });

    // 创建新的 API Key
    await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        provider,
        encryptedKey,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'API Key saved successfully',
    });
  } catch (error) {
    console.error('Save API key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/settings/api-key - 获取 API Key 列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        provider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // 不返回加密的 key
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
