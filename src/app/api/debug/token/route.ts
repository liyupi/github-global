// 调试 API - 检查 GitHub Token 权限

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { getUserOctokit } from '@/lib/github/client';

/**
 * GET /api/debug/token - 检查当前用户的 GitHub Token 权限
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

    if (!user || !user.accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 400 });
    }

    const accessToken = decrypt(user.accessToken);
    const octokit = getUserOctokit(accessToken);

    const result: any = {
      userId: user.id,
      githubLogin: user.login,
      hasInstallationId: !!user.installationId,
      installationId: user.installationId,
    };

    // 1. 检查认证用户
    try {
      const { data: authUser } = await octokit.rest.users.getAuthenticated();
      result.authenticated = true;
      result.authenticatedAs = authUser.login;
    } catch (error: any) {
      result.authenticated = false;
      result.authError = error.message;
    }

    // 2. 检查 token scopes
    try {
      const { headers } = await octokit.request('GET /user');
      result.scopes = headers['x-oauth-scopes'] || 'None (GitHub App token)';
    } catch (error) {
      result.scopes = 'Unable to check';
    }

    // 3. 检查是否是 GitHub App token
    try {
      const { data: installations } = await octokit.rest.apps.listInstallationsForAuthenticatedUser();
      result.isGitHubAppToken = true;
      result.installationsCount = installations.total_count;
      result.installations = installations.installations.map((inst: any) => ({
        id: inst.id,
        account: inst.account.login,
        repositorySelection: inst.repository_selection,
      }));
    } catch (error) {
      result.isGitHubAppToken = false;
    }

    // 4. 测试仓库访问
    try {
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 1,
        sort: 'updated',
      });
      
      if (repos.length > 0) {
        const testRepo = repos[0];
        result.canReadRepos = true;
        result.testRepo = testRepo.full_name;

        // 测试读取 refs
        try {
          await octokit.rest.git.getRef({
            owner: testRepo.owner.login,
            repo: testRepo.name,
            ref: `heads/${testRepo.default_branch}`,
          });
          result.canReadRefs = true;

          // 测试创建分支权限（不实际创建）
          result.canWriteRefs = '需要实际测试';
        } catch (error: any) {
          result.canReadRefs = false;
          result.readRefsError = error.message;
        }
      }
    } catch (error: any) {
      result.canReadRepos = false;
      result.readReposError = error.message;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Debug token error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
