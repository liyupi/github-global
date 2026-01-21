"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, Plus, GitBranch, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

// 模拟数据
const mockRepos = [
  {
    id: "1",
    fullName: "username/my-awesome-project",
    description: "一个很棒的开源项目",
    defaultBranch: "main",
    lastSyncedAt: "2026-01-20T10:00:00Z",
    config: {
      baseLanguage: "zh-CN",
      targetLanguages: ["en", "ja", "ko"],
    },
    latestTask: {
      status: "COMPLETED",
      progress: 100,
      createdAt: "2026-01-20T09:00:00Z",
    },
  },
  {
    id: "2",
    fullName: "username/another-repo",
    description: "另一个项目",
    defaultBranch: "main",
    lastSyncedAt: null,
    config: {
      baseLanguage: "zh-CN",
      targetLanguages: ["en"],
    },
    latestTask: null,
  },
];

export default function DashboardPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    // TODO: 实现导入逻辑
    setTimeout(() => {
      setIsImporting(false);
      setRepoUrl("");
    }, 2000);
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
                className="flex-1"
              />
              <Button onClick={handleImport} disabled={!repoUrl || isImporting}>
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
          </CardContent>
        </Card>

        {/* 仓库列表 */}
        <div className="space-y-4">
          {mockRepos.map((repo) => (
            <Card key={repo.id} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      {repo.fullName}
                    </CardTitle>
                    <CardDescription>{repo.description}</CardDescription>
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
                    <div className="font-medium">{repo.config.baseLanguage}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">目标语言</div>
                    <div className="font-medium">
                      {repo.config.targetLanguages.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">最新任务</div>
                    <div className="flex items-center gap-2">
                      {repo.latestTask ? (
                        <>
                          {getStatusIcon(repo.latestTask.status)}
                          <span className="font-medium">
                            {repo.latestTask.status === "COMPLETED" && "已完成"}
                            {repo.latestTask.status === "RUNNING" && "运行中"}
                            {repo.latestTask.status === "FAILED" && "失败"}
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
          ))}
        </div>

        {mockRepos.length === 0 && (
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
    </div>
  );
}
