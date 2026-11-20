/**
 * 检测用户系统语言
 */
export function detectLanguage(): 'zh' | 'non-zh' {
  // process.env.LANG: zh_CN.UTF-8
  // Intl.DateTimeFormat().resolvedOptions().locale: zh-CN
  const lang =
    process.env.LANG || Intl.DateTimeFormat().resolvedOptions().locale || ''

  if (/^zh/.test(lang)) {
    return 'zh'
  }

  return 'non-zh'
}
