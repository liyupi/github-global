"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ArrowLeft, Save, Languages, FolderTree } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

// 模拟文件树数据
const mockFileTree = [
  {
    name: "README.md",
    path: "README.md",
    type: "file" as const,
    isMarkdown: true,
  },
  {
    name: "docs",
    path: "docs",
    type: "dir" as const,
    children: [
      {
        name: "guide.md",
        path: "docs/guide.md",
        type: "file" as const,
        isMarkdown: true,
      },
      {
        name: "api.md",
        path: "docs/api.md",
        type: "file" as const,
        isMarkdown: true,
      },
    ],
  },
  {
    name: "src",
    path: "src",
    type: "dir" as const,
    children: [
      {
        name: "index.ts",
        path: "src/index.ts",
        type: "file" as const,
        isMarkdown: false,
      },
    ],
  },
];

export default function RepoConfigPage({ params }: { params: { id: string } }) {
  const [baseLanguage, setBaseLanguage] = useState("zh-CN");
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["en", "ja"]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>(["README.md", "docs/guide.md"]);
  const [isSaving, setIsSaving] = useState(false);

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
    // TODO: 实现保存逻辑
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  const renderFileTree = (nodes: typeof mockFileTree, level = 0) => {
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
        <Link href={`/repo/${params.id}`}>
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
                {renderFileTree(mockFileTree)}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allMarkdownFiles = mockFileTree
                      .flatMap((node) => {
                        if (node.type === "file" && node.isMarkdown) return [node.path];
                        if (node.type === "dir" && node.children) {
                          return node.children
                            .filter((child) => child.type === "file" && child.isMarkdown)
                            .map((child) => child.path);
                        }
                        return [];
                      });
                    setSelectedFiles(allMarkdownFiles);
                  }}
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
          <Link href={`/repo/${params.id}`}>
            <Button variant="outline">取消</Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving || targetLanguages.length === 0 || selectedFiles.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "保存中..." : "保存配置"}
          </Button>
        </div>

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
