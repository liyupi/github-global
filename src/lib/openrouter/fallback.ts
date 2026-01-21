// 模型 Fallback 策略

import { createChatCompletion, withRetry, ModelUnavailableError } from './client';
import { buildTranslationPrompt } from './prompts';
import { MODEL_PRIORITY } from '@/config/constants';

/**
 * 使用 Fallback 机制进行翻译
 */
export async function translateWithFallback(
  content: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey: string,
  preferredModel?: string
): Promise<string> {
  // 如果指定了模型，优先使用
  const models = preferredModel
    ? [preferredModel, ...MODEL_PRIORITY.filter(m => m !== preferredModel)]
    : MODEL_PRIORITY;

  for (const model of models) {
    try {
      const prompt = buildTranslationPrompt(content, sourceLanguage, targetLanguage, model);

      const response = await withRetry(() => createChatCompletion(prompt, apiKey));

      return response.choices[0].message.content;
    } catch (error) {
      if (error instanceof ModelUnavailableError) {
        console.warn(`Model ${model} unavailable, trying next...`);
        continue;
      }
      // 其他错误直接抛出
      throw error;
    }
  }

  throw new Error('All models unavailable');
}
