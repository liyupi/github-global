"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasInstallation, setHasInstallation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkInstallation = async () => {
    try {
      setIsChecking(true);
      setError(null);

      const response = await fetch('/api/github/installations');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to check installation');
      }

      const data = await response.json();
      
      if (data.totalCount > 0) {
        setHasInstallation(true);
        // 安装成功，跳转到控制台
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setHasInstallation(false);
      }
    } catch (err: any) {
      console.error('Check installation error:', err);
      setError(err.message || '检查安装状态失败');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkInstallation();
  }, []);

  const [installUrl, setInstallUrl] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  // 获取安装 URL
  useEffect(() => {
    const fetchInstallUrl = async () => {
      try {
        const response = await fetch('/api/github/install-url');
        const data = await response.json();
        
        if (data.installUrl) {
          setInstallUrl(data.installUrl);
        } else {
          setError(data.error || '无法获取安装链接');
        }
      } catch (err: any) {
        console.error('Fetch install URL error:', err);
        setError('获取安装链接失败');
      } finally {
        setIsLoadingUrl(false);
      }
    };

    fetchInstallUrl();
  }, []);

  // 检查 URL 中是否有 installation_id 参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const installationId = params.get('installation_id');
    
    if (installationId) {
      // 用户刚完成安装，重新检查
      checkInstallation();
    }
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">检查安装状态...</p>
        </div>
      </div>
    );
  }

  if (hasInstallation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">安装成功！</h2>
            <p className="text-muted-foreground mb-4">
              正在跳转到控制台...
            </p>
            <Loader2 className="h-6 w-6 text-primary mx-auto animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GitHub Global</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">完成最后一步设置</h1>
          <p className="text-xl text-muted-foreground">
            安装 GitHub App 以授权访问你的仓库
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              为什么需要安装 GitHub App？
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              GitHub Global 使用 GitHub App 来访问你的仓库。相比传统的 OAuth 授权，GitHub App 提供：
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>更细粒度的权限控制</strong> - 只请求必要的权限
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>更高的安全性</strong> - Token 自动过期，降低泄露风险
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>选择性授权</strong> - 你可以选择授权哪些仓库
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>安装步骤</CardTitle>
            <CardDescription>按照以下步骤完成 GitHub App 安装</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">点击下方按钮</h3>
                <p className="text-sm text-muted-foreground">
                  将跳转到 GitHub App 安装页面
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">选择要授权的仓库</h3>
                <p className="text-sm text-muted-foreground">
                  选择 "All repositories"（推荐）或 "Only select repositories"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">确认安装</h3>
                <p className="text-sm text-muted-foreground">
                  点击 "Install" 按钮，完成后会自动返回
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4">
          {isLoadingUrl ? (
            <Button size="lg" disabled className="w-full max-w-md">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              加载中...
            </Button>
          ) : installUrl ? (
            <a 
              href={installUrl}
              className="w-full max-w-md"
            >
              <Button size="lg" className="w-full">
                <ExternalLink className="mr-2 h-5 w-5" />
                一键安装 GitHub App
              </Button>
            </a>
          ) : (
            <div className="w-full max-w-md p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                请在 .env 文件中配置 <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">GITHUB_APP_SLUG</code>
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Slug 是你的 GitHub App 名称（小写，用连字符分隔）
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center max-w-md">
            安装完成后会自动返回，或点击下方按钮手动检查
          </p>

          <Button 
            variant="outline"
            size="lg"
            onClick={checkInstallation}
            disabled={isChecking}
            className="w-full max-w-md"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                检查中...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                重新检查安装状态
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm max-w-md">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          )}
        </div>

        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">需要的权限说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Repository Contents</span>
              <span className="font-medium">读取和写入</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pull Requests</span>
              <span className="font-medium">读取和写入</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metadata</span>
              <span className="font-medium">只读</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              这些权限用于读取你的仓库文件、创建翻译分支和提交 Pull Request。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
