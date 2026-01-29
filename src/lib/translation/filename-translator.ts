// 文件路径处理模块
// 翻译后的文件保持与源文件完全相同的路径结构

/**
 * 获取翻译后的目标路径
 * 
 * 规则：翻译后的文件路径完全保持与源文件一致，只是放在 translations/{语言代码}/ 目录下
 * 
 * 例如：
 * - 源文件：xxx/aaa/bbb/鱼皮的AI教程.md
 * - 英语翻译：translations/en/xxx/aaa/bbb/鱼皮的AI教程.md
 * - 日语翻译：translations/ja/xxx/aaa/bbb/鱼皮的AI教程.md
 * 
 * @param sourcePath 源文件路径
 * @param targetLang 目标语言代码
 * @param _baseLanguage 基准语言代码（保留参数以兼容现有调用）
 * @returns 翻译后的目标路径
 */
export function getTranslatedPath(
  sourcePath: string,
  targetLang: string,
  _baseLanguage: string
): string {
  // 直接保持原路径不变，只添加语言目录前缀
  return `translations/${targetLang}/${sourcePath}`;
}
