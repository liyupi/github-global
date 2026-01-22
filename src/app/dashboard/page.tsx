"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, Plus, GitBranch, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

// 仓库类型定义
interface Repository {
  id: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  lastSyncedAt: string | null;
  config: {
    baseLanguage: string;
    targetLanguages: string[];
  } | null;
  translationTasks: Array<{
    status: string;
    progress: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // 加载仓库列表
  const fetchRepos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/repos');
      
      if (!response.ok) {
        if (response.status === 401) {
          // 未登录，跳转到登录页
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch repositories');
      }
      
      const data = await response.json();
      setRepos(data.repos || []);
    } catch (err) {
      console.error('Fetch repos error:', err);
      setError('加载仓库列表失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载时获取仓库列表
  useEffect(() => {
    fetchRepos();
  }, []);

  // 导入仓库
  const handleImport = async () => {
    if (!repoUrl.trim()) return;
    
    setIsImporting(true);
    setImportError(null);
    
    try {
      const response = await fetch('/api/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import repository');
      }
      
      // 导入成功，刷新列表
      setRepoUrl("");
      await fetchRepos();
    } catch (err: any) {
      console.error('Import repo error:', err);
      setImportError(err.message || '导入仓库失败，请检查 URL 是否正确');
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "RUNNING":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GitHub Global</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost">设置</Button>
            </Link>
            <Button variant="ghost">退出登录</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">我的仓库</h1>
          <p className="text-muted-foreground">管理你的翻译项目</p>
        </div>

        {/* 导入仓库卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              导入新仓库
            </CardTitle>
            <CardDescription>
              输入 GitHub 仓库 URL 开始翻译
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="https://github.com/username/repo-name"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                className="flex-1"
              />
              <Button onClick={handleImport} disabled={!repoUrl.trim() || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    导入仓库
                  </>
                )}
              </Button>
            </div>
            {importError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {importError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 加载状态 */}
        {isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">加载中...</p>
            </CardContent>
          </Card>
        )}

        {/* 错误提示 */}
        {error && !isLoading && (
          <Card className="text-center py-12 border-destructive">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchRepos} className="mt-4" variant="outline">
                重试
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 仓库列表 */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {repos.map((repo) => {
              const latestTask = repo.translationTasks?.[0] || null;
              const config = repo.config;
              
              return (
                <Card key={repo.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-primary" />
                          {repo.fullName}
                        </CardTitle>
                        <CardDescription>{repo.description || '暂无描述'}</CardDescription>
                      </div>
                      <Link href={`/repo/${repo.id}`}>
                        <Button>管理</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">基准语言</div>
                        <div className="font-medium">{config?.baseLanguage || 'zh-CN'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">目标语言</div>
                        <div className="font-medium">
                          {config?.targetLanguages?.join(", ") || '未配置'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">最新任务</div>
                        <div className="flex items-center gap-2">
                          {latestTask ? (
                            <>
                              {getStatusIcon(latestTask.status)}
                              <span className="font-medium">
                                {latestTask.status === "COMPLETED" && "已完成"}
                                {latestTask.status === "RUNNING" && "运行中"}
                                {latestTask.status === "PENDING" && "等待中"}
                                {latestTask.status === "FAILED" && "失败"}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">暂无任务</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {repos.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">还没有仓库</h3>
                  <p className="text-muted-foreground mb-4">
                    导入你的第一个 GitHub 仓库开始翻译
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
