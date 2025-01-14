import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import Captcha from './Captcha'
import { useTranslation } from 'react-i18next'

export interface DialogCaptchaRef {
  show: (options: { callback: (code: string, done: () => void) => Promise<void>; initialValue?: string }) => void
}

interface IDialogCaptchaProps {
  title?: string
  description?: string
  maxLength?: number
  confirmText?: string
  cancelText?: string
  verifyingText?: string
}

const DialogCaptcha = forwardRef<DialogCaptchaRef, IDialogCaptchaProps>(
  ({ title, description, maxLength = 6, confirmText, cancelText, verifyingText }, ref) => {
    const { t } = useTranslation()

    const [open, setOpen] = useState(false)
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [callback, setCallback] = useState<((code: string, done: () => void) => Promise<void>) | null>(null)

    useImperativeHandle(ref, () => ({
      show: ({ callback: cb, initialValue = '' }) => {
        setOpen(true)
        setCode(initialValue)
        setError('')
        setCallback(() => cb)
      }
    }))

    const handleVerify = async () => {
      if (code.length !== maxLength) {
        setError(t('dialog.captcha.incomplete'))
        return
      }

      setLoading(true)
      setError('')

      try {
        if (callback) {
          await callback(code, () => {
            setOpen(false)
            setCode('')
            setCallback(null)
          })
        }
      } catch (err) {
        setError(t('dialog.captcha.verifyFailed'))
      } finally {
        setLoading(false)
      }
    }

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        setCallback(null)
      }
      setOpen(open)
    }

    const handleReset = async () => {
      setCode('')
      setError('')
      try {
        if (callback) {
          await callback('', () => {
            setOpen(false)
            setCallback(null)
          })
        }
      } catch (err) {
        setError(t('dialog.captcha.verifyFailed'))
      }
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-bg shadow-2xl w-80 rd-3">
          <DialogHeader className="">
            <div className="flex justify-start">
              <div className="text-(3 white) inline-block bg-pri rd-full font-900 px-2 py-1 line-height-1em">BETA</div>
            </div>
            <DialogTitle>{title || t('dialog.captcha.title')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {description || t('dialog.captcha.description', { length: maxLength })}
            </p>

            <Captcha value={code} onChange={setCode} disabled={loading} maxLength={maxLength} />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" className="mr-2" onClick={() => setOpen(false)} disabled={loading}>
                {cancelText || t('dialog.cancel')}
              </Button>
              <Button variant="outline" size="sm" className="mr-2" onClick={handleReset} disabled={loading}>
                {t('dialog.captcha.reset')}
              </Button>
              <Button size="sm" onClick={handleVerify} disabled={code.length !== maxLength || loading}>
                {loading ? verifyingText || t('dialog.verifying') : confirmText || t('dialog.verify')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

DialogCaptcha.displayName = 'DialogCaptcha'

export default DialogCaptcha
