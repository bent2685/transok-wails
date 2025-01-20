import { GetLocalIp } from '@wa/services/SystemService'

/* 复制文本 */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // 降级使用 document.execCommand
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const result = document.execCommand('copy')
    textArea.remove()
    return result
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/* 通过递归获取n层ip, 如果是127.0.0.1则停止递归 */
export const getLocalIpsDepth = async (depth: number, excludeIps: string[] = []): Promise<string[]> => {
  // 如果depth不为-1且小于等于0，则返回当前结果
  if (depth !== -1 && depth <= 0) {
    return excludeIps
  }

  const ip = await GetLocalIp(excludeIps)
  if (ip === '127.0.0.1') {
    excludeIps.push(ip)
    return excludeIps
  }
  return getLocalIpsDepth(depth === -1 ? -1 : depth - 1, [...excludeIps, ip])
}
