"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar, Footer } from "@/components/layout";
import { ArrowLeft, Save, Languages, FolderTree, Loader2, AlertCircle, CheckCircle2, RefreshCw, ChevronRight, ChevronDown, FileText } from "lucide-react";
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
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  // 状态
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needReinstall, setNeedReinstall] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 配置数据
  const [baseLanguage, setBaseLanguage] = useState("zh-CN");
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  // 检查登录状态
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

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
          if (repoRes.status === 403) {
            throw new Error('没有权限访问该仓库');
          }
          if (repoRes.status === 404) {
            throw new Error('仓库不存在或已被删除');
          }
          throw new Error('加载仓库配置失败');
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
        } else {
          // 检查是否是 installation 过期的错误
          const filesError = await filesRes.json().catch(() => ({}));
          if (filesError.code === 'INSTALLATION_EXPIRED') {
            setNeedReinstall(true);
          }
          // 文件树加载失败不阻止页面显示，只是文件选择功能不可用
          console.warn('Failed to load file tree:', filesError);
        }
      } catch (err: any) {
        console.error('Fetch config error:', err);
        setError(err.message || '加载配置失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionStatus === 'authenticated') {
      fetchData();
    }
  }, [id, router, sessionStatus]);

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

  const handleDirToggle = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allDirs = getAllDirPaths(fileTree);
    setExpandedDirs(new Set(allDirs));
  };

  const handleCollapseAll = () => {
    setExpandedDirs(new Set());
  };

  // 获取所有目录路径
  const getAllDirPaths = (nodes: FileNode[]): string[] => {
    return nodes.flatMap((node) => {
      if (node.type === "dir") {
        return [node.path, ...(node.children ? getAllDirPaths(node.children) : [])];
      }
      return [];
    });
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
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        }
        throw new Error(data.error || '保存配置失败');
      }
      
      setSaveSuccess(true);
      // 1.5秒后跳转回仓库详情页
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
      <div key={node.path} style={{ marginLeft: `${level * 16}px` }}>
        {node.type === "file" && node.isMarkdown ? (
          <label className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-accent rounded px-2">
            <input
              type="checkbox"
              checked={selectedFiles.includes(node.path)}
              onChange={() => handleFileToggle(node.path)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">{node.name}</span>
          </label>
        ) : node.type === "dir" ? (
          <div>
            <button
              type="button"
              onClick={() => handleDirToggle(node.path)}
              className="flex items-center gap-1 py-1.5 px-2 font-medium text-sm hover:bg-accent rounded w-full text-left"
            >
              {expandedDirs.has(node.path) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <FolderTree className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{node.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {node.children?.length || 0}
              </span>
            </button>
            {expandedDirs.has(node.path) && node.children && renderFileTree(node.children, level + 1)}
          </div>
        ) : null}
      </div>
    ));
  };

  // Session 加载中
  if (sessionStatus === 'loading') {
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

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={session?.user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">加载配置中...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={session?.user} />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="text-center py-12 max-w-md w-full">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">加载失败</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重试
                </Button>
                <Link href="/dashboard">
                  <Button>返回控制台</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session?.user} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* 返回按钮 */}
          <Link href={`/repo/${id}`}>
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回仓库详情
            </Button>
          </Link>

          {/* 页面标题 */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">翻译配置</h1>
            <p className="text-muted-foreground">配置翻译语言和文件范围</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            {/* 语言配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
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
                  <div className="border rounded-lg p-3 md:p-4 max-h-80 md:max-h-96 overflow-y-auto space-y-1">
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
                          <div className="flex-1 min-w-0">
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
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <FolderTree className="h-5 w-5" />
                  翻译范围
                </CardTitle>
                <CardDescription>
                  选择要翻译的 Markdown 文件 (已选择 {selectedFiles.length} 个)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-3 md:p-4 max-h-80 md:max-h-96 overflow-y-auto">
                  {needReinstall ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                      <p className="text-amber-600 font-medium mb-2">GitHub App 授权已过期</p>
                      <p className="text-sm text-muted-foreground mb-4">请重新安装 GitHub App 以获取文件列表</p>
                      <Link href="/setup">
                        <Button size="sm">重新安装 GitHub App</Button>
                      </Link>
                    </div>
                  ) : fileTree.length > 0 ? (
                    renderFileTree(fileTree)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderTree className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>暂无可翻译的 Markdown 文件</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allMarkdownFiles = getAllMarkdownFiles(fileTree);
                      setSelectedFiles(allMarkdownFiles);
                    }}
                    disabled={fileTree.length === 0}
                  >
                    全选文件
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
                    清空选择
                  </Button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExpandAll}
                    disabled={fileTree.length === 0}
                  >
                    展开全部
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCollapseAll}
                    disabled={fileTree.length === 0}
                  >
                    折叠全部
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 保存按钮 */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <Link href={`/repo/${id}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">取消</Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={isSaving || targetLanguages.length === 0}
              className="w-full sm:w-auto"
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
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{saveError}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-600">配置保存成功！正在跳转...</p>
            </div>
          )}

          {/* 配置预览 */}
          <Card className="mt-6 md:mt-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">配置预览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">基准语言</div>
                  <div className="font-medium">
                    {SUPPORTED_LANGUAGES.find(l => l.code === baseLanguage)?.name || baseLanguage}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-sm text-muted-foreground mb-1">目标语言</div>
                  <div className="font-medium">
                    {targetLanguages.length > 0
                      ? targetLanguages.map(code => 
                          SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code
                        ).join(", ")
                      : <span className="text-amber-600">未选择</span>}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">翻译文件</div>
                <div className="font-medium">
                  {selectedFiles.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file) => (
                        <li key={file} className="text-sm truncate">
                          {file}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">未选择（将翻译所有 Markdown 文件）</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
