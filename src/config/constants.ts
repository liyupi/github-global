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

// 支持的 AI 模型列表（基于 OpenRouter 排行榜前 20 的主流文本大模型）
// 参考：https://openrouter.ai/rankings
export const SUPPORTED_AI_MODELS: AIModel[] = [
  // === 推荐模型（性价比高、翻译效果好） ===
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    recommended: true,
    description: '性价比之王，中文翻译效果出色',
  },
  {
    id: 'google/gemini-2.5-flash-preview',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    recommended: true,
    description: '速度快、成本低、效果好',
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    recommended: true,
    description: '综合能力强，翻译质量高',
  },
  
  // === Google 系列 ===
  {
    id: 'google/gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    recommended: false,
    description: 'Google 最强模型，效果出色',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    recommended: false,
    description: '平衡速度与效果',
  },
  
  // === Anthropic Claude 系列 ===
  {
    id: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    recommended: false,
    description: 'Anthropic 旗舰模型',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    recommended: false,
    description: '经典高质量模型',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    recommended: false,
    description: '速度快、成本低',
  },

  // === OpenAI 系列 ===
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    recommended: false,
    description: 'OpenAI 多模态旗舰模型',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    recommended: false,
    description: '速度快、成本低',
  },
  {
    id: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    recommended: false,
    description: 'OpenAI 最新模型',
  },
  {
    id: 'openai/o3-mini',
    name: 'o3-mini',
    provider: 'OpenAI',
    recommended: false,
    description: '推理能力强',
  },

  // === 国产模型 ===
  {
    id: 'qwen/qwen-turbo',
    name: 'Qwen Turbo',
    provider: '阿里云',
    recommended: false,
    description: '通义千问，中文能力强',
  },
  {
    id: 'qwen/qwen-plus',
    name: 'Qwen Plus',
    provider: '阿里云',
    recommended: false,
    description: '通义千问增强版',
  },
  {
    id: 'qwen/qwen-max',
    name: 'Qwen Max',
    provider: '阿里云',
    recommended: false,
    description: '通义千问旗舰版',
  },

  // === xAI Grok 系列 ===
  {
    id: 'x-ai/grok-3-beta',
    name: 'Grok 3',
    provider: 'xAI',
    recommended: false,
    description: 'xAI 最新模型',
  },
  {
    id: 'x-ai/grok-2',
    name: 'Grok 2',
    provider: 'xAI',
    recommended: false,
    description: 'xAI 旗舰模型',
  },

  // === Meta Llama 系列 ===
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    recommended: false,
    description: '开源大模型，效果不错',
  },
  
  // === 其他热门模型 ===
  {
    id: 'mistralai/mistral-large-2411',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    recommended: false,
    description: '欧洲领先的 AI 模型',
  },
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    recommended: false,
    description: '企业级 AI 模型',
  },
];

// 默认 AI 模型（性价比高、翻译效果好）
export const DEFAULT_AI_MODEL = 'deepseek/deepseek-chat';

// 模型优先级（用于 fallback）
export const MODEL_PRIORITY = [
  'deepseek/deepseek-chat',
  'google/gemini-2.5-flash-preview',
  'qwen/qwen-turbo',
  'anthropic/claude-3.5-haiku',
  'openai/gpt-4o-mini',
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
