import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitHub Global - 一站式 GitHub 仓库多语言翻译平台',
  description: '帮助开源项目作者将文档自动翻译成多种语言，扩大国际影响力',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
