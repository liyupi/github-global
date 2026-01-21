#!/bin/bash

# GitHub Global 项目快速启动脚本

echo "🚀 GitHub Global - 快速启动脚本"
echo "================================="
echo ""

# 检查 Node.js
echo "📦 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js,请先安装 Node.js >= 20.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 版本过低,需要 >= 20.0.0"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 检查 MySQL
echo "🗄️  检查 MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  未检测到 MySQL,请确保 MySQL 已安装并运行"
fi
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi
echo "✅ 依赖安装完成"
echo ""

# 检查环境变量
echo "🔧 检查环境变量..."
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件"
    echo "📝 正在创建 .env 文件..."
    
    cat > .env << 'EOF'
# 数据库
DATABASE_URL="mysql://root:password@localhost:3306/github_global"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-please-change-in-production"

# 加密密钥 (开发环境示例)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# GitHub App (需要配置)
GITHUB_APP_ID=""
GITHUB_APP_CLIENT_ID=""
GITHUB_APP_CLIENT_SECRET=""
GITHUB_APP_PRIVATE_KEY=""

# OpenRouter API Key (可选)
PLATFORM_OPENROUTER_API_KEY=""
EOF
    
    echo "✅ .env 文件已创建"
    echo "⚠️  请编辑 .env 文件,填入 GitHub App 配置"
    echo ""
else
    echo "✅ .env 文件已存在"
fi
echo ""

# 生成 Prisma Client
echo "🔨 生成 Prisma Client..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo "❌ Prisma Client 生成失败"
    exit 1
fi
echo "✅ Prisma Client 生成完成"
echo ""

# 询问是否初始化数据库
echo "🗄️  数据库初始化"
read -p "是否初始化数据库? (需要 MySQL 已运行) [y/N]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在初始化数据库..."
    npm run db:push
    if [ $? -eq 0 ]; then
        echo "✅ 数据库初始化完成"
    else
        echo "⚠️  数据库初始化失败,请检查 MySQL 连接"
    fi
else
    echo "⏭️  跳过数据库初始化"
fi
echo ""

# 完成
echo "================================="
echo "✅ 项目设置完成!"
echo ""
echo "📝 下一步:"
echo "1. 编辑 .env 文件,配置 GitHub App 信息"
echo "   访问: https://github.com/settings/apps/new"
echo ""
echo "2. 启动开发服务器:"
echo "   npm run dev"
echo ""
echo "3. 访问应用:"
echo "   http://localhost:3000"
echo ""
echo "📖 详细文档:"
echo "   - 快速启动: docs/快速启动说明.md"
echo "   - 需求文档: docs/需求规格文档.md"
echo "   - 技术方案: docs/技术实现方案文档.md"
echo ""
echo "🎉 祝开发顺利!"
