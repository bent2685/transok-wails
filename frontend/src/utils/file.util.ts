/**
 * 计算文件大小
 * @param size 文件大小的字节数
 * @returns 文件大小 KB MB GB
 */
export const calcFileSize = (size: number) => {
  if (size < 1024) {
    return `${size}B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`
}
