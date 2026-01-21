"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, ArrowLeft, Save, Key, Trash2, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  const handleSaveApiKey = async () => {
    setIsSaving(true);
    // TODO: 实现保存 API Key 逻辑
    setTimeout(() => {
      setIsSaving(false);
      setHasExistingKey(true);
      setApiKey("");
    }, 1500);
  };

  const handleDeleteApiKey = async () => {
    if (confirm("确定要删除 API Key 吗?删除后将使用平台托管的 API Key。")) {
      // TODO: 实现删除 API Key 逻辑
      setHasExistingKey(false);
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
            <Link href="/dashboard">
              <Button variant="ghost">控制台</Button>
            </Link>
            <Button variant="ghost">退出登录</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回控制台
          </Button>
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">设置</h1>
          <p className="text-muted-foreground">管理你的账户和 API 配置</p>
        </div>

        {/* API Key 配置 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              OpenRouter API Key
            </CardTitle>
            <CardDescription>
              配置你自己的 OpenRouter API Key,享受无限制翻译
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasExistingKey ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">API Key 已配置</div>
                      <div className="text-sm text-muted-foreground">
                        你的翻译将使用自己的 API Key
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteApiKey}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  删除后将自动使用平台托管的 API Key (有每日限制)
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    输入你的 OpenRouter API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        placeholder="sk-or-v1-xxxxxxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      onClick={handleSaveApiKey}
                      disabled={!apiKey || isSaving}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    还没有 API Key?{" "}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      前往 OpenRouter 创建
                    </a>
                  </p>
                  <p>配置后的优势:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>无每日翻译次数限制</li>
                    <li>更快的翻译速度</li>
                    <li>完全掌控翻译成本</li>
                    <li>数据不经过平台</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用量统计 */}
        <Card>
          <CardHeader>
            <CardTitle>今日使用量</CardTitle>
            <CardDescription>
              {hasExistingKey
                ? "使用自己的 API Key,无平台限制"
                : "免费用户每日限制"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasExistingKey ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">今日翻译次数</span>
                  <span className="text-2xl font-bold">5 / 10</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: "50%" }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  还可以进行 5 次翻译任务。配置自己的 API Key 解除限制。
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">无限制使用</p>
                <p className="text-sm text-muted-foreground">
                  你正在使用自己的 API Key,享受无限制翻译服务
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 账户信息 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
            <CardDescription>你的 GitHub 账户信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                U
              </div>
              <div>
                <div className="font-medium text-lg">username</div>
                <div className="text-sm text-muted-foreground">user@example.com</div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                退出登录
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
