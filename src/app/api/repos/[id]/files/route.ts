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
      try {
        octokit = await getInstallationOctokit(repository.user.installationId);
      } catch (installError: any) {
        console.warn('[Files API] Installation token failed, trying user token:', installError.message);
        
        // Installation 失效（404表示 installation 不存在），尝试使用用户 token
        if (repository.user.accessToken) {
          const accessToken = decrypt(repository.user.accessToken);
          octokit = getUserOctokit(accessToken);
          
          // 清除失效的 installationId
          if (installError.status === 404) {
            await prisma.user.update({
              where: { id: repository.user.id },
              data: { installationId: null },
            });
            console.log('[Files API] Cleared invalid installationId for user:', repository.user.id);
          }
        } else {
          // 没有可用的认证方式，返回需要重新安装的错误
          return NextResponse.json(
            { 
              error: 'GitHub App installation expired. Please reinstall the GitHub App.',
              code: 'INSTALLATION_EXPIRED'
            },
            { status: 401 }
          );
        }
      }
    } else if (repository.user.accessToken) {
      const accessToken = decrypt(repository.user.accessToken);
      octokit = getUserOctokit(accessToken);
    } else {
      return NextResponse.json(
        { error: 'No authentication method available. Please log in again.' },
        { status: 400 }
      );
    }

    // 递归获取文件树（只返回 Markdown 文件和包含 Markdown 的目录）
    const tree = await getFileTree(
      octokit,
      repository.owner,
      repository.name,
      '',
      true  // markdownOnly = true
    );

    return NextResponse.json({ tree });
  } catch (error: any) {
    console.error('Get file tree error:', error);
    
    // 检查是否是 installation 相关的错误（可能在调用 API 时才触发）
    const isInstallationError = 
      error.status === 404 && 
      (error.message?.includes('installation') || 
       error.message?.includes('Installation') ||
       error.message?.includes('access-token'));
    
    if (isInstallationError) {
      return NextResponse.json(
        { 
          error: 'GitHub App installation expired. Please reinstall the GitHub App.',
          code: 'INSTALLATION_EXPIRED'
        },
        { status: 401 }
      );
    }
    
    // 检查是否是权限不足
    if (error.status === 403) {
      return NextResponse.json(
        { 
          error: 'Permission denied. Please check repository access permissions.',
          code: 'PERMISSION_DENIED'
        },
        { status: 403 }
      );
    }
    
    // 检查是否是仓库不存在
    if (error.status === 404) {
      return NextResponse.json(
        { 
          error: 'Repository not found on GitHub. It may have been deleted or renamed.',
          code: 'REPO_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
