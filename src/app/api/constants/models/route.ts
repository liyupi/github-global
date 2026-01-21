// 支持的 AI 模型列表

import { NextResponse } from 'next/server';
import { SUPPORTED_AI_MODELS } from '@/config/constants';

/**
 * GET /api/constants/models - 获取支持的 AI 模型列表
 */
export async function GET() {
  return NextResponse.json({
    models: SUPPORTED_AI_MODELS,
  });
}
