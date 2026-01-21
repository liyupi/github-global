"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Globe, ArrowLeft, Settings, Play, GitBranch, Clock, CheckCircle2, FileText, Languages } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

// 模拟数据
const mockRepo = {
  id: "1",
  fullName: "username/my-awesome-project",
  owner: "username",
  name: "my-awesome-project",
  description: "一个很棒的开源项目",
  defaultBranch: "main",
  config: {
    baseLanguage: "zh-CN",
    targetLanguages: ["en", "ja", "ko"],
  },
  tasks: [
    {
      id: "task1",
      status: "COMPLETED",
      type: "FULL",
      targetLanguages: ["en", "ja"],
      progress: 100,
      totalFiles: 10,
      completedFiles: 10,
      failedFiles: 0,
      pullRequestUrl: "https://github.com/username/my-awesome-project/pull/1",
      createdAt: "2026-01-20T09:00:00Z",
      completedAt: "2026-01-20T09:30:00Z",
    },
    {
      id: "task2",
      status: "RUNNING",
      type: "INCREMENTAL",
      targetLanguages: ["ko"],
      progress: 45,
      totalFiles: 5,
      completedFiles: 2,
      failedFiles: 0,
      pullRequestUrl: null,
      createdAt: "2026-01-21T10:00:00Z",
      completedAt: null,
    },
  ],
};

export default function RepoDetailPage({ params }: { params: { id: string } }) {
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const handleCreateTask = () => {
    setIsCreatingTask(true);
    // TODO: 实现创建任务逻辑
    setTimeout(() => {
      setIsCreatingTask(false);
    }, 2000);
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
                {mockRepo.fullName}
              </h1>
              <p className="text-muted-foreground">{mockRepo.description}</p>
            </div>
            <Link href={`/repo/${params.id}/config`}>
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
                  <div className="font-medium">{getLanguageName(mockRepo.config.baseLanguage)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">目标语言</div>
                  <div className="font-medium">
                    {mockRepo.config.targetLanguages.map(getLanguageName).join(", ")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">默认分支</div>
                  <div className="font-medium">{mockRepo.defaultBranch}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="mb-8 flex gap-4">
          <Button size="lg" onClick={handleCreateTask} disabled={isCreatingTask}>
            <Play className="mr-2 h-5 w-5" />
            {isCreatingTask ? "创建中..." : "开始新翻译"}
          </Button>
          <Link href={`/repo/${params.id}/config`}>
            <Button size="lg" variant="outline">
              <Languages className="mr-2 h-5 w-5" />
              选择翻译范围
            </Button>
          </Link>
        </div>

        {/* 翻译任务列表 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">翻译任务</h2>
          
          {mockRepo.tasks.map((task) => (
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
                      目标语言: {task.targetLanguages.map(getLanguageName).join(", ")}
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

          {mockRepo.tasks.length === 0 && (
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
