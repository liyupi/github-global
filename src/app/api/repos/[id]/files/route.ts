// 获取仓库文件树 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getInstallationOctokit, getUserOctokit } from '@/lib/github/client';
import { getFileTree } from '@/lib/github/operations';
import { decrypt } from '@/lib/crypto';

/**
 * GET /api/repos/:id/files - 获取仓库文件树
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const repository = await prisma.repository.findFirst({
      where: {
        id,
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

    let octokit;
    
    // 优先使用 Installation ID，否则使用用户的 access token
    if (repository.user.installationId) {
      octokit = await getInstallationOctokit(repository.user.installationId);
    } else if (repository.user.accessToken) {
      const accessToken = decrypt(repository.user.accessToken);
      octokit = getUserOctokit(accessToken);
    } else {
      return NextResponse.json(
        { error: 'No authentication method available' },
        { status: 400 }
      );
    }

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
