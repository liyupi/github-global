// 类型定义

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  recommended: boolean;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileTreeNode[];
  isMarkdown?: boolean;
}

export interface TranslationProgress {
  status: string;
  progress: number;
  completedFiles: number;
  totalFiles: number;
  failedFiles: number;
  files: Array<{
    id: string;
    sourcePath: string;
    targetLanguage: string;
    status: string;
  }>;
  pullRequestUrl: string | null;
}

export interface CreateTranslationTaskRequest {
  repositoryId: string;
  targetLanguages: string[];
  type?: 'FULL' | 'INCREMENTAL';
}

export interface UpdateRepoConfigRequest {
  baseLanguage?: string;
  targetLanguages?: string[];
  includePaths?: string[];
  excludePaths?: string[];
  aiModel?: string;
}
