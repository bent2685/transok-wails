/* Copy text */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    // Prefer Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback to document.execCommand
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
    console.error('Copy failed:', error)
    return false
  }
}
