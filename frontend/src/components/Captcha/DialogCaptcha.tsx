import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import Captcha from './Captcha'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

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
    const [shake, setShake] = useState(0)
    const [callback, setCallback] = useState<((code: string, done: () => void) => Promise<void>) | null>(null)

    useImperativeHandle(ref, () => ({
      show: ({ callback: cb, initialValue = '' }) => {
        setOpen(true)
        setCode(initialValue)
        setError('')
        setCallback(() => cb)
      }
    }))

    const triggerShake = () => setShake(s => s + 1)

    const handleVerify = async () => {
      if (code.length !== maxLength) {
        setError(t('dialog.captcha.incomplete'))
        triggerShake()
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
        triggerShake()
      } finally {
        setLoading(false)
      }
    }

    const handleOpenChange = (open: boolean) => {
      if (!open) setCallback(null)
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

    const filled = code.length
    const progress = Math.min(filled / maxLength, 1)
    const canSubmit = code.length === maxLength && !loading

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-4">
          <DialogHeader className="items-center text-center pr-0 gap-1.5">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.05 }}
              className="relative w-11 h-11 rd-2.5 bg-pri flex-center shrink-0 shadow-[0_8px_20px_-6px_hsl(var(--primary-color)/0.55)] mb-1">
              <span className="i-tabler:shield-lock text-white text-6"></span>
            </motion.div>
            <DialogTitle>{title || t('dialog.captcha.title')}</DialogTitle>
            <p className="text-(3.2 text2) leading-[1.6] text-center max-w-72">
              {description || t('dialog.captcha.description', { length: maxLength })}
            </p>
          </DialogHeader>

          <DialogBody className="items-center gap-5 pt-4">
            {/* 验证码 + 进度轨 */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                key={shake}
                animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}>
                <Captcha value={code} onChange={setCode} disabled={loading} maxLength={maxLength} />
              </motion.div>
              <div
                className={cn(
                  'relative w-60 h-[3px] rd-full overflow-hidden duration-300',
                  filled > 0 ? 'bg-bg2' : 'bg-transparent'
                )}>
                <motion.div
                  className="absolute inset-y-0 left-0 bg-pri rd-full"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key={error}
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden">
                  <div className="flex items-center justify-center gap-1.5 text-(3 destructive)">
                    <span className="i-tabler:alert-triangle text-3.5"></span>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogBody>

          <DialogFooter className="justify-between">
            {/* 次级操作组：左侧文字链 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="text-(3.2 text2) bg-transparent border-none cursor-pointer px-2.5 h-8 rd-2 hover:(text-text bg-bg2) duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                {cancelText || t('dialog.cancel')}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="inline-flex items-center gap-1 text-(3.2 text2) bg-transparent border-none cursor-pointer px-2.5 h-8 rd-2 hover:(text-text bg-bg2) duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <span className="i-tabler:refresh text-3.5"></span>
                {t('dialog.captcha.reset')}
              </button>
            </div>

            {/* 主操作：橄榄色 CTA */}
            <motion.button
              type="button"
              onClick={handleVerify}
              disabled={!canSubmit}
              whileHover={canSubmit ? { y: -1 } : undefined}
              whileTap={canSubmit ? { scale: 0.96 } : undefined}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className={cn(
                'relative inline-flex items-center gap-1.5 h-9 px-4 rd-2 font-700 text-3.2 cursor-pointer border-none duration-200 overflow-hidden min-w-22 justify-center',
                canSubmit
                  ? 'bg-pri text-white shadow-[0_8px_20px_-6px_hsl(var(--primary-color)/0.6)]'
                  : 'bg-transparent text-text2 border border-solid border-border cursor-not-allowed'
              )}>
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center gap-1.5">
                    <span className="i-tabler:loader-2 text-3.8 animate-spin"></span>
                    {verifyingText || t('dialog.verifying')}
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center gap-1.5">
                    <span className="i-tabler:check text-3.8"></span>
                    {confirmText || t('dialog.verify')}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

DialogCaptcha.displayName = 'DialogCaptcha'

export default DialogCaptcha
