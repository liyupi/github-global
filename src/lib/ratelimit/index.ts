// 限流模块

import { prisma } from '@/lib/db';
import { RATE_LIMIT_CONFIG } from '@/config/constants';

/**
 * 检查用户是否达到限流
 */
export async function checkRateLimit(userId: string): Promise<boolean> {
  // 检查用户是否有自己的 API Key
  const hasApiKey = await prisma.apiKey.findFirst({
    where: {
      userId,
      provider: 'openrouter',
      isActive: true,
    },
  });

  // 如果有自己的 API Key，不限流
  if (hasApiKey) {
    return true;
  }

  // 检查今日使用量
  const today = new Date().toISOString().split('T')[0];
  const usage = await prisma.userUsage.findFirst({
    where: {
      userId,
      date: today,
    },
  });

  return (usage?.count || 0) < RATE_LIMIT_CONFIG.freeUserDailyLimit;
}

/**
 * 增加用户使用量
 */
export async function incrementUsage(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await prisma.userUsage.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      userId,
      date: today,
      count: 1,
    },
  });
}

/**
 * 获取用户今日使用量
 */
export async function getUserUsage(userId: string): Promise<{ count: number; limit: number; hasApiKey: boolean }> {
  const today = new Date().toISOString().split('T')[0];

  const hasApiKey = await prisma.apiKey.findFirst({
    where: {
      userId,
      provider: 'openrouter',
      isActive: true,
    },
  });

  if (hasApiKey) {
    return {
      count: 0,
      limit: -1, // -1 表示无限制
      hasApiKey: true,
    };
  }

  const usage = await prisma.userUsage.findFirst({
    where: {
      userId,
      date: today,
    },
  });

  return {
    count: usage?.count || 0,
    limit: RATE_LIMIT_CONFIG.freeUserDailyLimit,
    hasApiKey: false,
  };
}
