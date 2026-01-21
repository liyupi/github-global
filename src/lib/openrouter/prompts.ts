// 翻译 Prompt 构建

import { ChatCompletionRequest } from './client';
import { DEFAULT_AI_MODEL } from '@/config/constants';

/**
 * 构建翻译 Prompt
 */
export function buildTranslationPrompt(
  content: string,
  sourceLanguage: string,
  targetLanguage: string,
  model: string = DEFAULT_AI_MODEL
): ChatCompletionRequest {
  return {
    model,
    messages: [
      {
        role: 'system',
        content: `You are a professional technical documentation translator. Your task is to translate Markdown documents from ${sourceLanguage} to ${targetLanguage}.

Rules:
1. Preserve all Markdown formatting (headers, lists, code blocks, links, etc.)
2. Do NOT translate code snippets, variable names, function names, or technical identifiers
3. Do NOT translate URLs, file paths, or command-line examples
4. Preserve the original document structure exactly
5. Maintain a professional and accurate translation tone
6. Keep inline code (\`code\`) untranslated
7. Translate comments in code blocks if they are in the source language
8. Preserve all HTML tags and their attributes
9. Keep emojis and special characters as-is
10. Do NOT add any explanations or notes - output ONLY the translated content

Output only the translated Markdown content, nothing else.`,
      },
      {
        role: 'user',
        content: `Translate the following Markdown content from ${sourceLanguage} to ${targetLanguage}:\n\n${content}`,
      },
    ],
    temperature: 0.3,
  };
}

/**
 * 构建 README 链接插入位置分析 Prompt
 */
export function buildReadmeAnalysisPrompt(
  content: string,
  model: string = DEFAULT_AI_MODEL
): ChatCompletionRequest {
  return {
    model,
    messages: [
      {
        role: 'system',
        content: `You are a Markdown structure analyzer. Analyze the README file and determine the best position to insert a language switcher section.

Return ONLY a JSON object with this structure:
{
  "position": <line_number>,
  "reason": "<brief explanation>"
}

Position priority:
1. If there's already a translations/language section, return its line number
2. After the main title and description, before the first ## heading
3. Before the table of contents (TOC)
4. At the very beginning (line 0) as fallback

Count line numbers starting from 0.`,
      },
      {
        role: 'user',
        content: `Analyze this README and suggest where to insert the language switcher:\n\n${content}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 200,
  };
}
