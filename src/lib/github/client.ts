// GitHub API 客户端封装

import { App, Octokit } from 'octokit';
import { readFileSync } from 'fs';
import { join } from 'path';

// 初始化 GitHub App
export function createGitHubApp() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
  const privateKeyEnv = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId) {
    throw new Error('GITHUB_APP_ID not configured');
  }

  // 从环境变量或文件读取私钥
  let privateKey: string;
  
  if (privateKeyEnv) {
    // 优先使用环境变量中的私钥
    privateKey = privateKeyEnv.replace(/\\n/g, '\n');
  } else if (privateKeyPath) {
    // 从文件读取私钥
    try {
      const fullPath = join(process.cwd(), privateKeyPath);
      privateKey = readFileSync(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read private key from ${privateKeyPath}: ${(error as Error).message}`);
    }
  } else {
    throw new Error('GitHub App private key not configured. Set GITHUB_APP_PRIVATE_KEY or GITHUB_APP_PRIVATE_KEY_PATH');
  }

  return new App({
    appId,
    privateKey,
  });
}

// 获取 Installation Octokit 客户端
export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  try {
    const app = createGitHubApp();
    const octokit = await app.getInstallationOctokit(installationId);
    
    // 验证 octokit 对象是否正确初始化
    if (!octokit || !octokit.rest || !octokit.rest.repos) {
      throw new Error('Failed to initialize Octokit client');
    }
    
    return octokit;
  } catch (error) {
    console.error('[GitHub] Failed to get installation octokit:', error);
    throw new Error(`Failed to authenticate with GitHub App: ${(error as Error).message}`);
  }
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
