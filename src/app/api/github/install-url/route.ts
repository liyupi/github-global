// 获取 GitHub App 安装 URL

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * GET /api/github/install-url - 获取 GitHub App 安装链接
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取 GitHub App 的 slug（App 名称）
    // Slug 是 GitHub App 在 URL 中的标识符，例如：github-global
    const appSlug = process.env.GITHUB_APP_SLUG;
    
    if (!appSlug) {
      return NextResponse.json(
        { 
          error: 'GitHub App slug not configured. Please add GITHUB_APP_SLUG to your .env file',
          hint: 'GITHUB_APP_SLUG is the name of your GitHub App in lowercase with hyphens (e.g., "github-global")'
        },
        { status: 500 }
      );
    }

    // 构建 GitHub App 安装 URL
    // 格式：https://github.com/apps/{app-slug}/installations/new
    // 用户点击后会跳转到 GitHub 的安装页面，选择仓库后会回调到我们的应用
    const baseUrl = request.nextUrl.origin;
    const state = Buffer.from(JSON.stringify({ 
      returnTo: '/setup',
      timestamp: Date.now() 
    })).toString('base64');
    
    const installUrl = `https://github.com/apps/${appSlug}/installations/new?state=${state}`;

    return NextResponse.json({
      installUrl,
      message: '将跳转到 GitHub App 安装页面，选择要授权的仓库后会自动返回',
      appSlug,
    });
  } catch (error: any) {
    console.error('Get install URL error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
