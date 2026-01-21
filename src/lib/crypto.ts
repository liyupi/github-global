// 加密解密工具（简化版，用于快速开发）

/**
 * 简单的 Base64 编码（用于存储，非安全加密）
 * @param plaintext 明文
 * @returns Base64 编码的文本
 */
export function encrypt(plaintext: string): string {
  // 使用 Base64 编码（简化版，便于快速开发）
  return Buffer.from(plaintext, 'utf-8').toString('base64');
}

/**
 * 简单的 Base64 解码
 * @param encoded Base64 编码的文本
 * @returns 解码后的明文
 */
export function decrypt(encoded: string): string {
  // 使用 Base64 解码
  return Buffer.from(encoded, 'base64').toString('utf-8');
}
