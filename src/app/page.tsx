// 首页

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">
          🌐 GitHub Global
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          一站式 GitHub 仓库多语言翻译 SaaS 平台
        </p>
        <p className="text-lg text-gray-500 mb-12">
          帮助开源项目作者将文档自动翻译成多种语言，扩大国际影响力
        </p>
        
        <div className="space-y-4">
          <a
            href="/api/auth/signin"
            className="inline-block bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
          >
            使用 GitHub 登录
          </a>
          
          <div className="text-sm text-gray-500">
            <p>✅ 即开即用 - 无需配置 GitHub Actions</p>
            <p>✅ 多模型支持 - 通过 OpenRouter 统一接入</p>
            <p>✅ 智能同步 - 自动检测变更，增量翻译</p>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>Powered by Next.js 15 + OpenRouter + GitHub App</p>
      </footer>
    </div>
  );
}
