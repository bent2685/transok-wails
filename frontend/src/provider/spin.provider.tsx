import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SpinContextType {
  spin: (message?: string, timeout?: number) => void
  stop: () => void
}

const SpinContext = createContext<SpinContextType>({
  spin: () => {},
  stop: () => {}
})

interface SpinProviderProps {
  children: React.ReactNode
  timeout?: number // 默认超时时间（毫秒）
}

export const SpinProvider: React.FC<SpinProviderProps> = ({ children, timeout = 10000 }) => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [showCancel, setShowCancel] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const cancelTimeoutRef = useRef<NodeJS.Timeout>()

  const stop = useCallback(() => {
    setLoading(false)
    setMessage('')
    setShowCancel(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (cancelTimeoutRef.current) {
      clearTimeout(cancelTimeoutRef.current)
    }
  }, [])

  const spin = useCallback(
    (msg?: string, customTimeout?: number) => {
      setLoading(true)
      setMessage(msg || '加载中...')
      setShowCancel(false)

      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (cancelTimeoutRef.current) {
        clearTimeout(cancelTimeoutRef.current)
      }

      // 设置超时后显示取消按钮
      cancelTimeoutRef.current = setTimeout(() => {
        setShowCancel(true)
      }, customTimeout || timeout)

      // 设置自动关闭（可选）
      // timeoutRef.current = setTimeout(() => {
      //   stop()
      // }, (customTimeout || timeout) * 2)
    },
    [timeout, stop]
  )

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (cancelTimeoutRef.current) {
        clearTimeout(cancelTimeoutRef.current)
      }
    }
  }, [])

  return (
    <SpinContext.Provider value={{ spin, stop }}>
      {children}
      {loading && (
        <div
          className={cn(
            'fixed inset-0 z-10086',
            'flex flex-col items-center justify-center',
            'bg-background/80 backdrop-blur-sm'
          )}>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-lg font-medium text-foreground">{message}</div>
            {showCancel && (
              <Button variant="outline" onClick={stop} className="mt-4">
                取消加载
              </Button>
            )}
          </div>
        </div>
      )}
    </SpinContext.Provider>
  )
}

export const useSpin = () => {
  const context = useContext(SpinContext)
  if (!context) {
    throw new Error('useSpin must be used within a SpinProvider')
  }
  return context
}
