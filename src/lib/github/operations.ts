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
  path: string = ''
): Promise<FileTreeNode[]> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  const items = Array.isArray(data) ? data : [data];
  const result: FileTreeNode[] = [];

  for (const item of items) {
    const node: FileTreeNode = {
      name: item.name,
      path: item.path,
      type: item.type === 'dir' ? 'dir' : 'file',
    };

    if (item.type === 'file') {
      node.isMarkdown = item.name.endsWith('.md') || item.name.endsWith('.mdx');
    }

    if (item.type === 'dir' && !SKIP_DIRECTORIES.includes(item.name)) {
      try {
        node.children = await getFileTree(octokit, owner, repo, item.path);
      } catch (error) {
        console.error(`Error fetching directory ${item.path}:`, error);
        node.children = [];
      }
    }

    result.push(node);
  }

  return result.sort((a, b) => {
    // 目录优先
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
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
    basehead: `${base}...${head}`,
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
