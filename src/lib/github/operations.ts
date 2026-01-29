// GitHub 操作封装

import { Octokit } from 'octokit';
import { FileTreeNode } from '@/types';
import { SKIP_DIRECTORIES } from '@/config/constants';

/**
 * 获取仓库内容
 */
export async function getRepoContents(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string = ''
) {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });
  return data;
}

/**
 * 获取仓库文件树
 */
export async function getFileTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string = '',
  markdownOnly: boolean = false
): Promise<FileTreeNode[]> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  const items = Array.isArray(data) ? data : [data];
  const result: FileTreeNode[] = [];

  // 保持 GitHub API 返回的原始顺序，不进行排序
  for (const item of items) {
    const isMarkdown = item.name.endsWith('.md') || item.name.endsWith('.mdx');
    
    if (item.type === 'file') {
      // 如果启用了 markdownOnly 模式，只保留 Markdown 文件
      if (markdownOnly && !isMarkdown) {
        continue;
      }
      
      const node: FileTreeNode = {
        name: item.name,
        path: item.path,
        type: 'file',
        isMarkdown,
      };
      result.push(node);
    } else if (item.type === 'dir' && !SKIP_DIRECTORIES.includes(item.name)) {
      // 递归获取子目录
      try {
        const children = await getFileTree(octokit, owner, repo, item.path, markdownOnly);
        
        // 如果启用了 markdownOnly 模式，只保留包含 Markdown 文件的目录
        if (markdownOnly && children.length === 0) {
          continue;
        }
        
        const node: FileTreeNode = {
          name: item.name,
          path: item.path,
          type: 'dir',
          children,
        };
        result.push(node);
      } catch (error) {
        console.error(`Error fetching directory ${item.path}:`, error);
      }
    }
  }

  return result;
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  content: string;
  sha: string;
}

/**
 * 获取文件内容
 */
export async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref,
  });

  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error('Path is not a file');
  }

  return Buffer.from(data.content, 'base64').toString('utf-8');
}

/**
 * 获取文件内容和 SHA（用于更新文件时）
 */
export async function getFileContentWithSha(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<FileInfo> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref,
  });

  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error('Path is not a file');
  }

  return {
    content: Buffer.from(data.content, 'base64').toString('utf-8'),
    sha: data.sha,
  };
}

/**
 * 获取文件 SHA（用于更新指定分支上的文件）
 */
export async function getFileSha(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (Array.isArray(data) || data.type !== 'file') {
      return null;
    }

    return data.sha;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * 创建分支
 */
export async function createBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  branchName: string,
  baseBranch: string
) {
  // 获取基础分支的 SHA
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });

  const baseSha = refData.object.sha;

  // 创建新分支
  const { data } = await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  return data;
}

/**
 * 创建或更新文件
 */
export async function createOrUpdateFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string
) {
  const { data } = await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
    sha,
  });

  return data;
}

/**
 * 创建 Pull Request
 */
export async function createPullRequest(
  octokit: Octokit,
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string
) {
  const { data } = await octokit.rest.pulls.create({
    owner,
    repo,
    title,
    body,
    head,
    base,
  });

  return data;
}

/**
 * 比较 Commits（变更检测）
 */
export async function compareCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  base: string,
  head: string
) {
  const { data } = await octokit.rest.repos.compareCommits({
    owner,
    repo,
    base,
    head,
  });

  return data;
}

/**
 * 获取仓库信息
 */
export async function getRepository(
  octokit: Octokit,
  owner: string,
  repo: string
) {
  const { data } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  return data;
}

/**
 * 检查文件是否存在
 */
export async function fileExists(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<boolean> {
  try {
    await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}
