import React, { createContext, useState, useContext, ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export const useConfirm = () => {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null)
  const [resolveReject, setResolveReject] = useState<{
    resolve: (value: boolean) => void
    reject: () => void
  } | null>(null)

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve, reject) => {
      setConfirmState(options)
      setResolveReject({ resolve, reject })
    })
  }

  const handleConfirm = () => {
    if (resolveReject) {
      resolveReject.resolve(true)
      setConfirmState(null)
    }
  }

  const handleCancel = () => {
    if (resolveReject) {
      resolveReject.resolve(false)
      setConfirmState(null)
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={!!confirmState} onOpenChange={() => setConfirmState(null)}>
        {confirmState && (
          <DialogContent className="bg-bg shadow-2xl w-80 rd-3">
            <DialogHeader>
              <DialogTitle>{confirmState.title}</DialogTitle>
              <DialogDescription>{confirmState.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="">
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={handleCancel} className='mr-2'>
                  {confirmState.cancelText || '取消'}
                </Button>
                <Button size="sm" onClick={handleConfirm}>
                  {confirmState.confirmText || '确认'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  )
}
