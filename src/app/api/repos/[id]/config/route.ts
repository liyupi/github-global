// 仓库配置 API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UpdateRepoConfigRequest } from '@/types';

/**
 * PUT /api/repos/:id/config - 更新仓库配置
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = await prisma.repository.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { config: true },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    const body: UpdateRepoConfigRequest = await request.json();
    const { baseLanguage, targetLanguages, includePaths, excludePaths, aiModel } = body;

    // 更新或创建配置
    const config = await prisma.repoConfig.upsert({
      where: { repositoryId: params.id },
      update: {
        ...(baseLanguage && { baseLanguage }),
        ...(targetLanguages && { targetLanguages }),
        ...(includePaths !== undefined && { includePaths }),
        ...(excludePaths !== undefined && { excludePaths }),
        ...(aiModel !== undefined && { aiModel }),
      },
      create: {
        repositoryId: params.id,
        baseLanguage: baseLanguage || 'zh-CN',
        targetLanguages: targetLanguages || ['en'],
        includePaths: includePaths || null,
        excludePaths: excludePaths || null,
        aiModel: aiModel || null,
      },
    });

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Update config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
