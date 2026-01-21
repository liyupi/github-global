// 仓库管理 API - 列表和导入

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getUserOctokit } from '@/lib/github/client';
import { getRepository } from '@/lib/github/operations';
import { decrypt } from '@/lib/crypto';

/**
 * GET /api/repos - 获取用户仓库列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repos = await prisma.repository.findMany({
      where: { userId: session.user.id },
      include: {
        config: true,
        translationTasks: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ repos });
  } catch (error) {
    console.error('Get repos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/repos - 导入仓库
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Missing repoUrl' },
        { status: 400 }
      );
    }

    // 解析仓库 URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL' },
        { status: 400 }
      );
    }

    const [, owner, repoName] = match;
    const cleanRepoName = repoName.replace(/\.git$/, '');

    // 获取用户的 GitHub token
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.accessToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found' },
        { status: 400 }
      );
    }

    const accessToken = decrypt(user.accessToken);
    const octokit = getUserOctokit(accessToken);

    // 获取仓库信息
    const repoData = await getRepository(octokit, owner, cleanRepoName);

    // 检查仓库是否已导入
    const existing = await prisma.repository.findUnique({
      where: { githubRepoId: repoData.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Repository already imported' },
        { status: 409 }
      );
    }

    // 创建仓库记录
    const repository = await prisma.repository.create({
      data: {
        userId: session.user.id,
        githubRepoId: repoData.id,
        owner: repoData.owner.login,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        defaultBranch: repoData.default_branch,
        isPrivate: repoData.private,
      },
    });

    // 创建默认配置
    await prisma.repoConfig.create({
      data: {
        repositoryId: repository.id,
        baseLanguage: 'zh-CN',
        targetLanguages: ['en'],
      },
    });

    return NextResponse.json({
      success: true,
      repository: {
        id: repository.id,
        fullName: repository.fullName,
        owner: repository.owner,
        name: repository.name,
      },
    });
  } catch (error: any) {
    console.error('Import repo error:', error);
    
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Repository not found or no access' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
