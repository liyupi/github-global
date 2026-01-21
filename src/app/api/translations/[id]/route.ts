// 翻译任务详情 API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/translations/:id - 获取翻译任务详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.translationTask.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        translatedFiles: {
          select: {
            id: true,
            sourcePath: true,
            targetPath: true,
            targetLanguage: true,
            status: true,
            errorMessage: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Get translation task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/translations/:id - 取消翻译任务
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.translationTask.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // 只能取消 PENDING 或 RUNNING 状态的任务
    if (task.status !== 'PENDING' && task.status !== 'RUNNING') {
      return NextResponse.json(
        { error: 'Cannot cancel completed or failed task' },
        { status: 400 }
      );
    }

    await prisma.translationTask.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel translation task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
