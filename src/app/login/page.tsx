// 登录页面

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">登录 GitHub Global</h1>
        
        <p className="text-gray-600 mb-8 text-center">
          使用 GitHub 账号登录，开始翻译你的项目文档
        </p>

        <a
          href="/api/auth/signin"
          className="block w-full bg-black text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          使用 GitHub 登录
        </a>

        <p className="mt-6 text-sm text-gray-500 text-center">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
