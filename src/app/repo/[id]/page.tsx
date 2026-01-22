"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Globe, ArrowLeft, Settings, Play, GitBranch, Clock, CheckCircle2, FileText, Languages, Loader2, AlertCircle } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

// 类型定义
interface TranslationTask {
  id: string;
  status: string;
  type: string;
  targetLanguages: string[];
  progress: number;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  pullRequestUrl: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface RepoConfig {
  baseLanguage: string;
  targetLanguages: string[];
}

interface Repository {
  id: string;
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  defaultBranch: string;
  config: RepoConfig | null;
  translationTasks: TranslationTask[];
}

export default function RepoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // 加载仓库详情
  const fetchRepo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/repos/${id}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          throw new Error('仓库不存在');
        }
        throw new Error('Failed to fetch repository');
      }
      
      const data = await response.json();
      setRepo(data.repository);
    } catch (err: any) {
      console.error('Fetch repo error:', err);
      setError(err.message || '加载仓库详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepo();
  }, [id]);

  // 创建翻译任务
  const handleCreateTask = async () => {
    if (!repo?.config?.targetLanguages?.length) {
      setTaskError('请先配置目标翻译语言');
      return;
    }

    setIsCreatingTask(true);
    setTaskError(null);
    
    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryId: id,
          targetLanguages: repo.config.targetLanguages,
          type: 'FULL',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create translation task');
      }
      
      // 创建成功，刷新页面数据
      await fetchRepo();
    } catch (err: any) {
      console.error('Create task error:', err);
      setTaskError(err.message || '创建翻译任务失败');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: "bg-green-500/10 text-green-500",
      RUNNING: "bg-primary/10 text-primary",
      FAILED: "bg-destructive/10 text-destructive",
      PENDING: "bg-muted text-muted-foreground",
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.name || code;
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !repo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">加载失败</h3>
            <p className="text-muted-foreground mb-4">{error || '仓库不存在'}</p>
            <Link href="/dashboard">
              <Button>返回控制台</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tasks = repo.translationTasks || [];
  const config = repo.config;

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
            <Link href="/dashboard">
              <Button variant="ghost">控制台</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost">设置</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回仓库列表
          </Button>
        </Link>

        {/* 仓库信息 */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <GitBranch className="h-8 w-8 text-primary" />
                {repo.fullName}
              </h1>
              <p className="text-muted-foreground">{repo.description || '暂无描述'}</p>
            </div>
            <Link href={`/repo/${id}/config`}>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                配置
              </Button>
            </Link>
          </div>

          {/* 配置信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">翻译配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">基准语言</div>
                  <div className="font-medium">{getLanguageName(config?.baseLanguage || 'zh-CN')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">目标语言</div>
                  <div className="font-medium">
                    {config?.targetLanguages?.length 
                      ? config.targetLanguages.map(getLanguageName).join(", ")
                      : '未配置'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">默认分支</div>
                  <div className="font-medium">{repo.defaultBranch}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="mb-8">
          <div className="flex gap-4 flex-wrap">
            <Button size="lg" onClick={handleCreateTask} disabled={isCreatingTask}>
              {isCreatingTask ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  开始新翻译
                </>
              )}
            </Button>
            <Link href={`/repo/${id}/config`}>
              <Button size="lg" variant="outline">
                <Languages className="mr-2 h-5 w-5" />
                配置翻译选项
              </Button>
            </Link>
          </div>
          {taskError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {taskError}
            </div>
          )}
        </div>

        {/* 翻译任务列表 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">翻译任务</h2>
          
          {tasks.map((task) => (
            <Card key={task.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {task.type === "FULL" ? "全量翻译" : "增量翻译"}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                        {task.status === "COMPLETED" && "已完成"}
                        {task.status === "RUNNING" && "运行中"}
                        {task.status === "FAILED" && "失败"}
                        {task.status === "PENDING" && "等待中"}
                      </span>
                    </div>
                    <CardDescription>
                      目标语言: {(task.targetLanguages as string[]).map(getLanguageName).join(", ")}
                    </CardDescription>
                  </div>
                  {task.pullRequestUrl && (
                    <a href={task.pullRequestUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        查看 PR
                      </Button>
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 进度条 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">翻译进度</span>
                    <span className="font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} />
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">总文件数</div>
                      <div className="font-medium">{task.totalFiles}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-muted-foreground">已完成</div>
                      <div className="font-medium">{task.completedFiles}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">创建时间</div>
                      <div className="font-medium">
                        {new Date(task.createdAt).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {tasks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">还没有翻译任务</h3>
                <p className="text-muted-foreground mb-4">
                  点击上方按钮创建第一个翻译任务
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
