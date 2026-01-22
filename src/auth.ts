import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/db"
import { encrypt } from "@/lib/crypto"

// 支持两种环境变量命名方式
const githubClientId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_APP_CLIENT_ID
const githubClientSecret = process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_APP_CLIENT_SECRET

// 启动时检查环境变量配置（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  const hasSecret = !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const hasGithubConfig = !!(githubClientId && githubClientSecret);
  
  if (!hasSecret) console.warn('[Auth] ⚠️  AUTH_SECRET not configured');
  if (!hasGithubConfig) console.warn('[Auth] ⚠️  GitHub App credentials not configured');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // AUTH_SECRET 会自动从环境变量读取，但为了兼容 NEXTAUTH_SECRET 也手动设置
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true, // 开发环境需要
  providers: [
    GitHub({
      clientId: githubClientId!,
      clientSecret: githubClientSecret!,
      authorization: {
        params: {
          // 请求必要的权限：用户信息 + 仓库读写权限
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!account || !profile) {
          console.error('[Auth] Missing account or profile data');
          return false;
        }

        // 检查用户是否已存在
        const githubId = typeof profile.id === 'number' ? profile.id : parseInt(String(profile.id));
        
        const existingUser = await prisma.user.findUnique({
          where: { githubId },
        });

        if (existingUser) {
          // 更新用户信息和 token
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              login: String(profile.login),
              name: profile.name ? String(profile.name) : null,
              email: profile.email ? String(profile.email) : null,
              avatarUrl: profile.avatar_url ? String(profile.avatar_url) : null,
              accessToken: encrypt(account.access_token!),
            },
          });
        } else {
          // 创建新用户
          await prisma.user.create({
            data: {
              githubId,
              login: String(profile.login),
              name: profile.name ? String(profile.name) : null,
              email: profile.email ? String(profile.email) : null,
              avatarUrl: profile.avatar_url ? String(profile.avatar_url) : null,
              accessToken: encrypt(account.access_token!),
            },
          });
        }

        return true;
      } catch (error) {
        console.error('[Auth] SignIn callback error:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // 登录后检查是否需要安装 GitHub App
      // 如果 URL 已经是 /setup，直接返回
      if (url.startsWith(baseUrl + '/setup')) {
        return url;
      }
      // 登录成功后跳转到 setup 页面检查安装状态
      return baseUrl + '/setup';
    },
    async jwt({ token, user, account, profile }) {
      if (profile) {
        const githubId = typeof profile.id === 'number' ? profile.id : parseInt(String(profile.id));
        token.githubId = githubId;
        token.login = String(profile.login);
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.githubId) {
        // 从数据库获取用户信息
        const githubId = typeof token.githubId === 'number' ? token.githubId : parseInt(String(token.githubId));
        const user = await prisma.user.findUnique({
          where: { githubId },
        });

        if (user) {
          Object.assign(session.user, {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatarUrl,
          });
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
