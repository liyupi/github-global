// 常量配置

import { Language, AIModel } from '@/types';

// 支持的语言列表
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: '英语', nativeName: 'English' },
  { code: 'zh-CN', name: '简体中文', nativeName: 'Simplified Chinese' },
  { code: 'zh-TW', name: '繁体中文', nativeName: 'Traditional Chinese' },
  { code: 'ja', name: '日语', nativeName: 'Japanese' },
  { code: 'ko', name: '韩语', nativeName: 'Korean' },
  { code: 'es', name: '西班牙语', nativeName: 'Spanish' },
  { code: 'fr', name: '法语', nativeName: 'French' },
  { code: 'de', name: '德语', nativeName: 'German' },
  { code: 'pt', name: '葡萄牙语', nativeName: 'Portuguese' },
  { code: 'ru', name: '俄语', nativeName: 'Russian' },
  { code: 'ar', name: '阿拉伯语', nativeName: 'Arabic' },
  { code: 'hi', name: '印地语', nativeName: 'Hindi' },
  { code: 'it', name: '意大利语', nativeName: 'Italian' },
  { code: 'nl', name: '荷兰语', nativeName: 'Dutch' },
  { code: 'pl', name: '波兰语', nativeName: 'Polish' },
  { code: 'tr', name: '土耳其语', nativeName: 'Turkish' },
  { code: 'vi', name: '越南语', nativeName: 'Vietnamese' },
  { code: 'th', name: '泰语', nativeName: 'Thai' },
  { code: 'id', name: '印尼语', nativeName: 'Indonesian' },
  { code: 'ms', name: '马来语', nativeName: 'Malay' },
];

// 支持的 AI 模型列表
export const SUPPORTED_AI_MODELS: AIModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    recommended: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    recommended: true,
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    recommended: false,
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    recommended: false,
  },
];

// 默认 AI 模型
export const DEFAULT_AI_MODEL = 'anthropic/claude-3.5-sonnet';

// 模型优先级（用于 fallback）
export const MODEL_PRIORITY = [
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4o',
  'google/gemini-pro-1.5',
  'anthropic/claude-3-haiku',
];

// 限流配置
export const RATE_LIMIT_CONFIG = {
  freeUserDailyLimit: 10,           // 每日 10 次翻译任务
  freeUserFilesPerRequest: 5,       // 每次最多 5 个文件
  freeUserCharsPerFile: 50000,      // 每文件最多 50000 字符
};

// OpenRouter 配置
export const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  maxTokens: 4096,
  temperature: 0.3,  // 翻译任务使用较低温度
};

// 需要跳过的目录
export const SKIP_DIRECTORIES = [
  'node_modules',
  '.git',
  '.github',
  'dist',
  'build',
  '.next',
  'vendor',
  '__pycache__',
  'translations', // 跳过已翻译的目录
];

// 语言名称映射（用于 README 链接）
export const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ja': '日本語',
  'ko': '한국어',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'pt': 'Português',
  'ru': 'Русский',
  'ar': 'العربية',
  'hi': 'हिन्दी',
  'it': 'Italiano',
  'nl': 'Nederlands',
  'pl': 'Polski',
  'tr': 'Türkçe',
  'vi': 'Tiếng Việt',
  'th': 'ไทย',
  'id': 'Bahasa Indonesia',
  'ms': 'Bahasa Melayu',
};
