// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "英语", nativeName: "English" },
  { code: "zh-CN", name: "简体中文", nativeName: "Simplified Chinese" },
  { code: "zh-TW", name: "繁体中文", nativeName: "Traditional Chinese" },
  { code: "ja", name: "日语", nativeName: "Japanese" },
  { code: "ko", name: "韩语", nativeName: "Korean" },
  { code: "es", name: "西班牙语", nativeName: "Spanish" },
  { code: "fr", name: "法语", nativeName: "French" },
  { code: "de", name: "德语", nativeName: "German" },
  { code: "pt", name: "葡萄牙语", nativeName: "Portuguese" },
  { code: "ru", name: "俄语", nativeName: "Russian" },
  { code: "ar", name: "阿拉伯语", nativeName: "Arabic" },
  { code: "hi", name: "印地语", nativeName: "Hindi" },
  { code: "it", name: "意大利语", nativeName: "Italian" },
  { code: "nl", name: "荷兰语", nativeName: "Dutch" },
  { code: "pl", name: "波兰语", nativeName: "Polish" },
  { code: "tr", name: "土耳其语", nativeName: "Turkish" },
  { code: "vi", name: "越南语", nativeName: "Vietnamese" },
  { code: "th", name: "泰语", nativeName: "Thai" },
  { code: "id", name: "印尼语", nativeName: "Indonesian" },
  { code: "ms", name: "马来语", nativeName: "Malay" },
] as const;

// AI 模型列表
export const AI_MODELS = [
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    recommended: true,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    recommended: true,
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    provider: "Google",
    recommended: false,
  },
] as const;

// 限流配置
export const RATE_LIMITS = {
  freeUserDailyLimit: 10,
  freeUserFilesPerRequest: 5,
  freeUserCharsPerFile: 50000,
} as const;
