import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean | string>
  slotConfirm: (options: SlotConfirmOptions) => Promise<boolean | PromiseLike<boolean>>
  commonFooter: (props: CommonFooterProps) => ReactNode
}

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isPrompt?: boolean
  defaultValue?: string
}

interface SlotConfirmOptions {
  title: string
  description?: string
  children: ReactNode | ((props: { onConfirm: () => void; onCancel: () => void }) => ReactNode)
  renderFooter?: (props: {
    onConfirm: () => void
    onCancel: () => void
    confirmText?: string
    cancelText?: string
  }) => ReactNode
  confirmText?: string
  cancelText?: string
}

interface CommonFooterProps {
  onConfirm: () => void
  onCancel: () => void
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
  const [inputValue, setInputValue] = useState<string>('')
  const [resolveReject, setResolveReject] = useState<{
    resolve: (value: boolean | string) => void
    reject: () => void
  } | null>(null)
  const [slotState, setSlotState] = useState<SlotConfirmOptions | null>(null)
  const { t } = useTranslation()

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean | string>((resolve, reject) => {
      setConfirmState(options)
      setInputValue(options.defaultValue || '')
      setResolveReject({ resolve, reject })
    })
  }, [])

  const handleConfirm = () => {
    if (resolveReject) {
      resolveReject.resolve(confirmState?.isPrompt ? inputValue : true)
      setConfirmState(null)
    }
  }

  const handleCancel = () => {
    if (resolveReject) {
      resolveReject.resolve(false)
      setConfirmState(null)
    }
  }

  const slotConfirm = useCallback((options: SlotConfirmOptions) => {
    return new Promise<boolean | PromiseLike<boolean>>((resolve, reject) => {
      setSlotState(options)
      setResolveReject({ resolve: resolve as never, reject })
    })
  }, [])

  const execSubmit = () => {
    if (resolveReject) {
      resolveReject.resolve(true)
      setSlotState(null)
    }
  }

  const execClose = () => {
    if (resolveReject) {
      resolveReject.resolve(false)
      setSlotState(null)
    }
  }

  const commonFooter = useCallback(
    (props: CommonFooterProps) => {
      return (
        <>
          <Button variant="outline" size="sm" onClick={props.onCancel}>
            {props.cancelText || t('dialog.cancel')}
          </Button>
          <Button size="sm" onClick={props.onConfirm}>
            {props.confirmText || t('dialog.confirm')}
          </Button>
        </>
      )
    },
    [t]
  )

  return (
    <ConfirmContext.Provider value={{ confirm, slotConfirm, commonFooter }}>
      {children}
      <Dialog open={!!confirmState} onOpenChange={() => setConfirmState(null)}>
        {confirmState && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmState.title}</DialogTitle>
              <DialogDescription>{confirmState.description}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              {confirmState.isPrompt && (
                <Textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={t('dialog.placeholder')}
                  className="resize-none hide-scrollbar bg-bg2 border-border text-text focus-visible:(ring-pri/40 border-pri/40) min-h-32"
                />
              )}
            </DialogBody>
            <DialogFooter className="justify-between">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                {confirmState.cancelText || t('dialog.cancel')}
              </Button>
              <Button size="sm" onClick={handleConfirm}>
                {confirmState.confirmText || t('dialog.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!slotState} onOpenChange={() => setSlotState(null)}>
        {slotState && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{slotState.title}</DialogTitle>
              {slotState.description && <DialogDescription>{slotState.description}</DialogDescription>}
            </DialogHeader>
            <DialogBody>
              {typeof slotState.children === 'function'
                ? slotState.children({ onConfirm: execSubmit, onCancel: execClose })
                : slotState.children}
            </DialogBody>
            {slotState.renderFooter && (
              <DialogFooter>
                {slotState.renderFooter({
                  onConfirm: execSubmit,
                  onCancel: execClose,
                  confirmText: slotState.confirmText,
                  cancelText: slotState.cancelText
                })}
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  )
}
