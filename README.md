# GitHub Global - 一站式 GitHub 仓库多语言翻译平台

> 零配置,一键翻译,让你的 GitHub 项目走向全球

## 🌐 项目简介

GitHub Global 是一个 SaaS 平台,帮助开源项目作者将文档自动翻译成多种语言,扩大国际影响力。

### 核心特性

- ✅ **即开即用** - 无需配置 GitHub Actions、无需本地环境
- ✅ **SaaS 服务** - 提供现成的网页服务,在线操作
- ✅ **多模型支持** - 通过 OpenRouter 统一接入多种 AI 模型
- ✅ **智能同步** - 自动检测 GitHub 提交变更,增量翻译
- ✅ **可视化配置** - 通过界面选择翻译范围,无需手写配置文件

## 🚀 快速启动

> 📖 **推荐阅读**: [简化配置说明](./docs/简化配置说明.md) - 无需 openssl 命令的快速配置指南

### 前置要求

- Node.js >= 20.0.0
- npm >= 10.0.0
- MySQL >= 8.0

### 1. 克隆项目

```bash
git clone https://github.com/your-username/github-global.git
cd github-global
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量示例文件:

```bash
cp .env.example .env
```

编辑 `.env` 文件,填入以下必需配置:

```env
# 数据库连接
DATABASE_URL="mysql://user:password@localhost:3306/github_global"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"

# GitHub App 配置 (需要先创建 GitHub App)
GITHUB_APP_ID="your-app-id"
GITHUB_APP_CLIENT_ID="your-client-id"
GITHUB_APP_CLIENT_SECRET="your-client-secret"
GITHUB_APP_PRIVATE_KEY="your-private-key"

# 加密密钥 (用于加密存储敏感信息)
ENCRYPTION_KEY="your-32-byte-hex-key"

# OpenRouter API Key (可选,用于平台托管模式)
PLATFORM_OPENROUTER_API_KEY="sk-or-v1-xxx"
```

### 4. 创建 GitHub App

1. 访问 [GitHub Developer Settings](https://github.com/settings/apps)
2. 点击 "New GitHub App"
3. 填写以下信息:
   - **App Name**: GitHub Global (或你自己的名称)
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`
   - **Webhook URL**: `http://localhost:3000/api/webhooks/github` (可选)
4. 配置权限:
   - Repository permissions:
     - Contents: Read & Write
     - Metadata: Read
     - Pull requests: Read & Write
   - Account permissions:
     - Email addresses: Read
5. 创建后,记录以下信息到 `.env`:
   - App ID
   - Client ID
   - Client Secret
   - Private Key (点击 "Generate a private key" 下载)

### 5. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库 Schema (开发环境)
npm run db:push

# 或运行迁移 (生产环境)
npm run db:migrate
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
github-global/
├── src/
│   ├── app/                      # Next.js App Router 页面
│   │   ├── (auth)/              # 认证相关页面
│   │   ├── dashboard/           # 仪表盘
│   │   ├── repo/[id]/           # 仓库详情
│   │   ├── api/                 # API 路由
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/              # React 组件
│   │   ├── ui/                  # 基础 UI 组件
│   │   └── ...
│   ├── lib/                     # 核心库
│   │   ├── constants.ts         # 常量定义
│   │   └── utils.ts             # 工具函数
│   └── types/                   # TypeScript 类型
├── prisma/
│   └── schema.prisma            # 数据库 Schema
├── public/                      # 静态资源
├── docs/                        # 文档
│   ├── 需求规格文档.md
│   ├── 技术实现方案文档.md
│   └── 后端API接口文档.md
├── .env.example                 # 环境变量示例
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🎨 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 组件**: Tailwind CSS + Radix UI
- **编程语言**: TypeScript
- **数据库**: MySQL 8.0
- **ORM**: Prisma 6.0
- **认证**: NextAuth.js v5
- **GitHub 集成**: Octokit + GitHub App
- **AI 接入**: OpenRouter API

## 🔧 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# Prisma 相关
npm run db:generate      # 生成 Prisma Client
npm run db:push          # 推送 Schema 到数据库
npm run db:migrate       # 运行数据库迁移
npm run db:studio        # 打开 Prisma Studio
```

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 构建并启动
cd docker
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

### 环境变量配置

在 `docker/docker-compose.yml` 中配置环境变量,或创建 `.env` 文件。

## 📖 使用说明

### 1. 登录

使用 GitHub 账号登录系统。

### 2. 导入仓库

在仪表盘页面输入 GitHub 仓库 URL,点击"导入仓库"。

### 3. 配置翻译

- 选择基准语言(源语言)
- 选择目标语言(可多选)
- 选择要翻译的文件范围
- (可选)配置自己的 OpenRouter API Key

### 4. 开始翻译

点击"开始翻译"按钮,系统会:
1. 获取仓库文件
2. 调用 AI 进行翻译
3. 创建翻译分支
4. 生成 Pull Request

### 5. 合并翻译

在 GitHub 上查看并合并 PR,翻译内容将添加到仓库的 `translations/` 目录下。

## 🌍 支持的语言

- 英语 (English)
- 简体中文 (Simplified Chinese)
- 繁体中文 (Traditional Chinese)
- 日语 (Japanese)
- 韩语 (Korean)
- 西班牙语 (Spanish)
- 法语 (French)
- 德语 (German)
- 葡萄牙语 (Portuguese)
- 俄语 (Russian)
- 更多语言...

## 🤖 支持的 AI 模型

- Claude 3.5 Sonnet (推荐)
- GPT-4o (推荐)
- Gemini Pro 1.5
- 更多模型...

## 🔒 安全说明

- GitHub Access Token 使用 AES-256-GCM 加密存储
- OpenRouter API Key 加密存储
- 支持用户自带 API Key,数据不经过平台
- 所有 API 接口需要认证

## 📝 API 文档

详细的 API 接口文档请查看: [后端API接口文档.md](./docs/后端API接口文档.md)

## 🐛 常见问题

### Q: 如何生成 ENCRYPTION_KEY?

```bash
# 使用 Node.js 生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Q: 如何生成 NEXTAUTH_SECRET?

```bash
# 使用 openssl
openssl rand -base64 32
```

### Q: MySQL 连接失败?

确保 MySQL 服务已启动,并且 `DATABASE_URL` 配置正确:

```env
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"
```

### Q: GitHub App 回调失败?

检查 GitHub App 的 Callback URL 是否正确配置为:
`http://localhost:3000/api/auth/callback/github`

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📧 联系方式

- 作者: 鱼皮
- 项目地址: [GitHub](https://github.com/your-username/github-global)

---

**让你的 GitHub 项目走向全球! 🌏**
