// 翻译进度 SSE API

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/translations/:id/progress - 获取翻译进度（SSE）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const taskId = params.id;

  // 验证任务归属
  const task = await prisma.translationTask.findFirst({
    where: {
      id: taskId,
      userId: session.user.id,
    },
  });

  if (!task) {
    return new Response('Task not found', { status: 404 });
  }

  // 创建 SSE 响应
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // 轮询任务状态
      const pollInterval = setInterval(async () => {
        try {
          const currentTask = await prisma.translationTask.findUnique({
            where: { id: taskId },
            include: {
              translatedFiles: {
                select: {
                  id: true,
                  sourcePath: true,
                  targetLanguage: true,
                  status: true,
                },
              },
            },
          });

          if (!currentTask) {
            clearInterval(pollInterval);
            controller.close();
            return;
          }

          sendEvent({
            status: currentTask.status,
            progress: currentTask.progress,
            completedFiles: currentTask.completedFiles,
            totalFiles: currentTask.totalFiles,
            failedFiles: currentTask.failedFiles,
            files: currentTask.translatedFiles,
            pullRequestUrl: currentTask.pullRequestUrl,
          });

          // 如果任务完成或失败，停止轮询
          if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(currentTask.status)) {
            clearInterval(pollInterval);
            controller.close();
          }
        } catch (error) {
          console.error('Error polling task status:', error);
          clearInterval(pollInterval);
          controller.close();
        }
      }, 1000); // 每秒轮询一次

      // 清理
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
