"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ArrowLeft, Save, Languages, FolderTree, Loader2, AlertCircle } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

// 文件树节点类型
interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  isMarkdown?: boolean;
  children?: FileNode[];
}

export default function RepoConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // 状态
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 配置数据
  const [baseLanguage, setBaseLanguage] = useState("zh-CN");
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);

  // 加载仓库配置和文件树
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 并行获取仓库信息和文件树
        const [repoRes, filesRes] = await Promise.all([
          fetch(`/api/repos/${id}`),
          fetch(`/api/repos/${id}/files`),
        ]);

        if (!repoRes.ok) {
          if (repoRes.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch repository');
        }

        const repoData = await repoRes.json();
        const config = repoData.repository?.config;
        
        if (config) {
          setBaseLanguage(config.baseLanguage || 'zh-CN');
          setTargetLanguages(config.targetLanguages || []);
          setSelectedFiles(config.includePaths || []);
        }

        if (filesRes.ok) {
          const filesData = await filesRes.json();
          setFileTree(filesData.tree || []);
        }
      } catch (err: any) {
        console.error('Fetch config error:', err);
        setError(err.message || '加载配置失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleLanguageToggle = (code: string) => {
    if (targetLanguages.includes(code)) {
      setTargetLanguages(targetLanguages.filter((lang) => lang !== code));
    } else {
      setTargetLanguages([...targetLanguages, code]);
    }
  };

  const handleFileToggle = (path: string) => {
    if (selectedFiles.includes(path)) {
      setSelectedFiles(selectedFiles.filter((file) => file !== path));
    } else {
      setSelectedFiles([...selectedFiles, path]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const response = await fetch(`/api/repos/${id}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseLanguage,
          targetLanguages,
          includePaths: selectedFiles,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save configuration');
      }
      
      setSaveSuccess(true);
      // 2秒后跳转回仓库详情页
      setTimeout(() => {
        router.push(`/repo/${id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Save config error:', err);
      setSaveError(err.message || '保存配置失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 获取所有 Markdown 文件路径
  const getAllMarkdownFiles = (nodes: FileNode[]): string[] => {
    return nodes.flatMap((node) => {
      if (node.type === "file" && node.isMarkdown) return [node.path];
      if (node.type === "dir" && node.children) {
        return getAllMarkdownFiles(node.children);
      }
      return [];
    });
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path} style={{ marginLeft: `${level * 20}px` }}>
        {node.type === "file" && node.isMarkdown ? (
          <label className="flex items-center gap-2 py-2 cursor-pointer hover:bg-accent rounded px-2">
            <input
              type="checkbox"
              checked={selectedFiles.includes(node.path)}
              onChange={() => handleFileToggle(node.path)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm">{node.name}</span>
          </label>
        ) : node.type === "dir" ? (
          <div>
            <div className="flex items-center gap-2 py-2 px-2 font-medium text-sm">
              <FolderTree className="h-4 w-4 text-primary" />
              {node.name}
            </div>
            {node.children && renderFileTree(node.children, level + 1)}
          </div>
        ) : (
          <div className="py-2 px-2 text-sm text-muted-foreground">{node.name}</div>
        )}
      </div>
    ));
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">加载配置中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">加载失败</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/dashboard">
              <Button>返回控制台</Button>
            </Link>
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
        <Link href={`/repo/${id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回仓库详情
          </Button>
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">翻译配置</h1>
          <p className="text-muted-foreground">配置翻译语言和文件范围</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 语言配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                语言配置
              </CardTitle>
              <CardDescription>选择基准语言和目标翻译语言</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基准语言 */}
              <div>
                <label className="text-sm font-medium mb-2 block">基准语言 (源语言)</label>
                <select
                  value={baseLanguage}
                  onChange={(e) => setBaseLanguage(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              {/* 目标语言 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  目标语言 (已选择 {targetLanguages.length} 种)
                </label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                  {SUPPORTED_LANGUAGES.filter((lang) => lang.code !== baseLanguage).map(
                    (lang) => (
                      <label
                        key={lang.code}
                        className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={targetLanguages.includes(lang.code)}
                          onChange={() => handleLanguageToggle(lang.code)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{lang.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {lang.nativeName}
                          </div>
                        </div>
                      </label>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 文件范围配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                翻译范围
              </CardTitle>
              <CardDescription>
                选择要翻译的 Markdown 文件 (已选择 {selectedFiles.length} 个)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {fileTree.length > 0 ? (
                  renderFileTree(fileTree)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderTree className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>暂无可翻译的 Markdown 文件</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allMarkdownFiles = getAllMarkdownFiles(fileTree);
                    setSelectedFiles(allMarkdownFiles);
                  }}
                  disabled={fileTree.length === 0}
                >
                  全选
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
                  清空
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 保存按钮 */}
        <div className="mt-8 flex justify-end gap-4">
          <Link href={`/repo/${id}`}>
            <Button variant="outline">取消</Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving || targetLanguages.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存配置
              </>
            )}
          </Button>
        </div>
        
        {/* 保存结果提示 */}
        {saveError && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-600">
            配置保存成功！正在跳转...
          </div>
        )}

        {/* 配置预览 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">配置预览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">基准语言</div>
              <div className="font-medium">{baseLanguage}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">目标语言</div>
              <div className="font-medium">
                {targetLanguages.length > 0
                  ? targetLanguages.join(", ")
                  : "未选择"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">翻译文件</div>
              <div className="font-medium">
                {selectedFiles.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {selectedFiles.map((file) => (
                      <li key={file} className="text-sm">
                        {file}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "未选择"
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
