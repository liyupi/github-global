// GitHub API 客户端封装

import { App } from '@octokit/app';
import { Octokit } from 'octokit';
import { readFileSync } from 'fs';
import { join } from 'path';

// 初始化 GitHub App
export function createGitHubApp() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH || './private-key.pem';

  if (!appId) {
    throw new Error('GITHUB_APP_ID not configured');
  }

  // 从文件读取私钥
  let privateKey: string;
  try {
    const fullPath = join(process.cwd(), privateKeyPath);
    privateKey = readFileSync(fullPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read private key from ${privateKeyPath}: ${(error as Error).message}`);
  }

  return new App({
    appId,
    privateKey,
  });
}

// 获取 Installation Octokit 客户端
export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const app = createGitHubApp();
  return await app.getInstallationOctokit(installationId);
}

// 获取用户的 Octokit 客户端（使用 access token）
export function getUserOctokit(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
    throttle: {
      onRateLimit: (retryAfter: number, options: any) => {
        console.warn(`Rate limit hit, retrying after ${retryAfter}s`);
        if (options.request.retryCount <= 2) {
          return true; // 重试
        }
        return false;
      },
      onSecondaryRateLimit: (retryAfter: number, options: any) => {
        console.warn(`Secondary rate limit hit`);
        return false;
      },
    },
  });
}
