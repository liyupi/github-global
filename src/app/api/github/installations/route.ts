// GitHub App Installations API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { getUserOctokit } from '@/lib/github/client';

/**
 * GET /api/github/installations - 获取用户的 GitHub App 安装列表
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

    // 获取用户的所有 GitHub App 安装
    const { data: installations } = await octokit.rest.apps.listInstallationsForAuthenticatedUser();

    // 如果找到安装，更新用户的 installationId（使用第一个）
    if (installations.total_count > 0 && !user.installationId) {
      const firstInstallation = installations.installations[0];
      await prisma.user.update({
        where: { id: user.id },
        data: { installationId: firstInstallation.id },
      });
      
      console.log(`[GitHub] Updated user ${user.login} with installation ID: ${firstInstallation.id}`);
    }

    return NextResponse.json({
      installations: installations.installations.map((inst) => ({
        id: inst.id,
        account: inst.account.login,
        repositorySelection: inst.repository_selection,
        permissions: inst.permissions,
      })),
      totalCount: installations.total_count,
      currentInstallationId: user.installationId,
    });
  } catch (error: any) {
    console.error('Get installations error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
