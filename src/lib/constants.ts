// 从 config/constants 重新导出
export { 
  SUPPORTED_LANGUAGES, 
  SUPPORTED_AI_MODELS,
  DEFAULT_AI_MODEL,
  MODEL_PRIORITY,
  RATE_LIMIT_CONFIG,
  OPENROUTER_CONFIG,
} from '@/config/constants';

// 为了向后兼容，保留旧的导出名
export { SUPPORTED_AI_MODELS as AI_MODELS } from '@/config/constants';
export { RATE_LIMIT_CONFIG as RATE_LIMITS } from '@/config/constants';
