// 支持的语言列表

import { NextResponse } from 'next/server';
import { SUPPORTED_LANGUAGES } from '@/config/constants';

/**
 * GET /api/constants/languages - 获取支持的语言列表
 */
export async function GET() {
  return NextResponse.json({
    languages: SUPPORTED_LANGUAGES,
  });
}
