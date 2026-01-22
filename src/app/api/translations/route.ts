// 翻译任务 API - 创建任务

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit, incrementUsage } from '@/lib/ratelimit';
import { translationQueue } from '@/lib/queue/local-queue';
import { executeTranslation } from '@/lib/translation/engine';
import { CreateTranslationTaskRequest } from '@/types';

// 初始化队列处理器
translationQueue.setProcessor(async (data) => {
  return await executeTranslation(data);
});

/**
 * POST /api/translations - 创建翻译任务
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 解析请求体
    const body: CreateTranslationTaskRequest = await request.json();
    const { repositoryId, targetLanguages, type = 'FULL' } = body;

    // 3. 验证参数
    if (!repositoryId || !targetLanguages?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: repositoryId and targetLanguages' },
        { status: 400 }
      );
    }

    // 4. 检查限流
    const canProceed = await checkRateLimit(session.user.id);
    if (!canProceed) {
      return NextResponse.json(
        { error: 'Daily limit exceeded. Please try again tomorrow or add your own API key.' },
        { status: 429 }
      );
    }

    // 5. 验证仓库归属
    const repository = await prisma.repository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // 6. 创建翻译任务
    const task = await prisma.translationTask.create({
      data: {
        userId: session.user.id,
        repositoryId,
        targetLanguages,
        type,
      },
    });

    // 7. 增加使用量计数
    await incrementUsage(session.user.id);

    // 8. 添加到任务队列
    await translationQueue.add({
      taskId: task.id,
      userId: session.user.id,
      repositoryId,
      targetLanguages: targetLanguages as string[],
    });

    return NextResponse.json({
      success: true,
      taskId: task.id,
    });
  } catch (error) {
    console.error('Create translation task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
