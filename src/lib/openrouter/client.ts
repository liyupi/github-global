// OpenRouter API 客户端

import { OPENROUTER_CONFIG } from '@/config/constants';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export class ModelUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelUnavailableError';
  }
}

/**
 * 调用 OpenRouter Chat Completion API
 */
export async function createChatCompletion(
  request: ChatCompletionRequest,
  apiKey: string
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://github-global.com',
      'X-Title': 'GitHub Global',
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens || OPENROUTER_CONFIG.maxTokens,
      temperature: request.temperature ?? OPENROUTER_CONFIG.temperature,
      stream: request.stream || false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new OpenRouterError(
      error.error?.message || 'OpenRouter API request failed',
      response.status,
      error
    );
  }

  return response.json();
}

/**
 * 重试机制
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof OpenRouterError) {
        // 401: 无效 API Key，不重试
        if (error.statusCode === 401) throw error;

        // 429: Rate Limit，等待后重试
        if (error.statusCode === 429) {
          const delay = Math.min(
            config.baseDelay * Math.pow(2, attempt),
            config.maxDelay
          );
          console.warn(`Rate limit hit, retrying after ${delay}ms`);
          await sleep(delay);
          continue;
        }

        // 503: 服务不可用，使用备用模型
        if (error.statusCode === 503) {
          throw new ModelUnavailableError(error.message);
        }
      }

      // 其他错误，指数退避重试
      if (attempt < config.maxRetries - 1) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        console.warn(`Request failed, retrying after ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
