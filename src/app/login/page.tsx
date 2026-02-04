"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar, Footer } from "@/components/layout";
import { Loader2, AlertCircle, Github } from "lucide-react";

// 登录页面内容组件
function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查 URL 中的错误参数
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'OAuthSignin':
        case 'OAuthCallback':
          setError('GitHub 授权失败，请检查网络连接后重试');
          break;
        case 'OAuthCreateAccount':
          setError('创建账户失败，请稍后重试');
          break;
        case 'Callback':
          setError('回调处理失败，请重试');
          break;
        case 'AccessDenied':
          setError('访问被拒绝，请确认已授权访问');
          break;
        case 'Configuration':
          setError('服务器配置错误，请联系管理员');
          break;
        default:
          setError('登录失败，请稍后重试');
      }
    }
  }, [searchParams]);

  // 如果已登录，跳转到 setup 页面检查安装状态
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/setup');
    }
  }, [status, router]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 直接调用 signIn，会自动处理 OAuth 流程
      await signIn('github', { 
        callbackUrl: '/setup',
      });
    } catch (err) {
      console.error('Login error:', err);
      setError('登录失败，请检查网络连接后重试');
      setIsLoading(false);
    }
  };

  // 加载中状态
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={null} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={null} />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">登录 GitHub Global</CardTitle>
            <CardDescription>
              使用 GitHub 账号登录，开始翻译你的项目文档
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-destructive font-medium">登录失败</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white rounded-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  正在跳转...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-5 w-5" />
                  使用 GitHub 登录
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              登录即表示您同意我们的服务条款和隐私政策
            </p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}

// 加载状态组件
function LoginLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={null} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// 主页面组件 - 用 Suspense 包裹
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
