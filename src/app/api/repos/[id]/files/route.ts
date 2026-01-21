// 获取仓库文件树 API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getInstallationOctokit } from '@/lib/github/client';
import { getFileTree } from '@/lib/github/operations';

/**
 * GET /api/repos/:id/files - 获取仓库文件树
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

    const repository = await prisma.repository.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { user: true },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    if (!repository.user.installationId) {
      return NextResponse.json(
        { error: 'GitHub App not installed' },
        { status: 400 }
      );
    }

    const octokit = await getInstallationOctokit(repository.user.installationId);

    // 递归获取文件树
    const tree = await getFileTree(
      octokit,
      repository.owner,
      repository.name,
      ''
    );

    return NextResponse.json({ tree });
  } catch (error) {
    console.error('Get file tree error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
