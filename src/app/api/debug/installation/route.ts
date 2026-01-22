// 调试 API - 测试 GitHub App Installation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { createGitHubApp } from '@/lib/github/client';

/**
 * GET /api/debug/installation - 测试 GitHub App Installation 配置
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result: any = {
      userId: user.id,
      githubLogin: user.login,
      installationId: user.installationId,
      hasInstallationId: !!user.installationId,
    };

    // 测试 GitHub App 配置
    try {
      const app = createGitHubApp();
      result.githubAppConfigured = true;
      
      // 获取 App 信息
      const { data: appInfo } = await app.octokit.rest.apps.getAuthenticated();
      result.appName = appInfo.name;
      result.appSlug = appInfo.slug;
      result.appId = appInfo.id;
    } catch (error: any) {
      result.githubAppConfigured = false;
      result.githubAppError = error.message;
    }

    // 如果有 Installation ID，测试是否能获取 Installation Octokit
    if (user.installationId) {
      try {
        const app = createGitHubApp();
        const installationOctokit = await app.getInstallationOctokit(user.installationId);
        
        result.installationOctokitCreated = true;
        result.hasRestAPI = !!installationOctokit.rest;
        result.hasReposAPI = !!(installationOctokit.rest && installationOctokit.rest.repos);
        
        // 测试能否访问仓库
        if (installationOctokit.rest && installationOctokit.rest.repos) {
          try {
            const { data: repos } = await installationOctokit.rest.apps.listReposAccessibleToInstallation();
            result.accessibleRepos = repos.total_count;
            result.reposList = repos.repositories.slice(0, 3).map((r: any) => r.full_name);
          } catch (error: any) {
            result.reposAccessError = error.message;
          }
        }
      } catch (error: any) {
        result.installationOctokitCreated = false;
        result.installationOctokitError = error.message;
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Debug installation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
