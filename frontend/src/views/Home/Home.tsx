import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GetAppInfo, GetLocalIps } from '@wa/services/SystemService'
import { FileInfo, Uploader, UploaderEvent, UploaderRef } from '@/components/Uploader/Uploader'
import { Set, Delete, Get, GetKeys } from '@wa/services/StorageService'
import { Start, Stop } from '@wa/app/ginService'
import { cn } from '@/lib/utils'
import { useEventEmitter } from 'ahooks'
import { useConfirm } from '@/provider/confirm.provider'
import { GetShareList } from '@wa/services/fileService'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DialogCaptcha, { DialogCaptchaRef } from '@/components/Captcha/DialogCaptcha'
import { GetCaptcha, SetCaptcha } from '@wa/services/ShareService'
import { copyText } from '@/utils/common.util'
import { toast } from 'sonner'
const Home: React.FC = () => {
  const { t } = useTranslation()
  const [appInfo, setAppInfo] = useState<Record<string, string>>({})
  const [fileList, setFileList] = useState<FileInfo[]>([])
  const [isShare, setIsShare] = useState<boolean | null>(null)
  const [port, setPort] = useState<string>('9482')
  const navigate = useNavigate()
  const captchaRef = useRef<DialogCaptchaRef>(null)
  const { confirm, slotConfirm, commonFooter } = useConfirm()

  const [captcha, setCaptcha] /* Share captcha */ = useState<string>('')
  const uploaderRef /* Uploader */ = useRef<UploaderRef>(null)
  const event$ /* Event hub */ = useEventEmitter<UploaderEvent>()

  const actionList /* Action list */ = [
    {
      icon: 'i-tabler:device-desktop-search',
      onClick: () => navigate('/discover')
    },
    {
      icon: 'i-tabler:lock',
      onClick: () =>
        captchaRef.current?.show({
          callback: async (code, done) => {
            SetCaptcha(code)
            setCaptcha(code)
            done()
          },
          initialValue: captcha
        })
    },
    {
      icon: 'i-tabler:settings',
      onClick: () => navigate('/settings')
    }
  ]

  /**
   * Callback after file selection/addition
   * @param files
   */
  const handleFileSelect = (files: FileInfo[]) => {
    setFileList(files)
    Set('share-list', files)
    if (!files?.length) {
      setIsShare(false)
      Set('is-share', false)
    }
  }

  /**
   * Toggle sharing state
   * @returns
   */
  const toggleShare = async () => {
    const isShareState = !isShare
    setIsShare(isShareState)
    if (!isShareState) {
      await Set('is-share', false)
      return
    }
    await Set('share-list', fileList)
    await Set('is-share', true)
  }

  /**
   * Sync sharing state
   * @returns
   */
  const syncIsShare = async () => {
    const keys = await GetKeys()
    if (!keys.includes('is-share')) {
      await Set('is-share', false)
      setIsShare(false)
      return
    }
    const isShareState = await Get('is-share')
    setIsShare(!!isShareState)
    const shareList = await GetShareList()
    uploaderRef.current?.setShareList(shareList)
  }

  /**
   * Sync sharing captcha
   */
  const syncCaptcha = async () => {
    const captcha = await GetCaptcha()
    setCaptcha(captcha)
  }

  /**
   * Event subscription
   */
  event$.useSubscription(async payload => {
    const { type, data } = payload
    if (type === 'copy-link') {
      const ips = (await GetLocalIps()).slice(0, 3)
      const urlList = ips.map(ip => `http://${ip}:${port}/download/page`)

      const ok = await slotConfirm({
        title: t('dialog.copyLink.title'),
        description: t('dialog.copyLink.desc'),
        children: ({ onConfirm, onCancel }) => (
          <div className="flex flex-col gap-1.5">
            {urlList.map((url, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 px-3 py-2 rd-2 cursor-pointer border border-solid border-border bg-bg2/40 duration-200 hover:(bg-pri/10 border-pri/40) active:(scale-[0.99])"
                onClick={async () => {
                  await copyText(url)
                  onConfirm()
                }}>
                <span className="i-tabler:link text-(3.5 text2) group-hover:text-pri duration-200 shrink-0"></span>
                <span className="flex-1 truncate font-mono text-(3 text) tracking-[0.2px]">{url}</span>
                <span className="i-tabler:copy text-(3.5 text2) group-hover:text-pri duration-200 shrink-0"></span>
              </div>
            ))}
          </div>
        ),
        renderFooter: ({ onCancel }) => (
          <button
            type="button"
            className="group inline-flex items-center gap-1 text-(3 text2) cursor-pointer bg-transparent border-none hover:text-pri duration-200 ml-auto"
            onClick={() => {
              onCancel()
              navigate('/allurl')
            }}>
            <span className="tracking-[0.3px]">{t('common.seeAll')}</span>
            <span className="i-tabler:chevron-right duration-200 group-hover:translate-x-0.5"></span>
          </button>
        )
      })
    }
  })

  useEffect(() => {
    if (isShare === null) return

    let interval: NodeJS.Timeout | null = null

    // Always sync share-list regardless of sharing state
    interval = setInterval(async () => {
      const shareList = await GetShareList()
      console.log('shareList', shareList)
      event$.emit({
        type: 'share-list',
        data: shareList || []
      })
    }, 1000)

    if (isShare) {
      Start(`:${port}`)
    }

    if (!isShare) {
      Stop()
    }

    event$.emit({
      type: 'is-running',
      data: isShare
    })

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isShare])

  useEffect(() => {
    GetAppInfo().then(setAppInfo)
    Get('port').then(port => {
      if (!port) {
        Set('port', '9482')
        setPort('9482')
        return
      }
      setPort(port)
    })
    syncIsShare()
    syncCaptcha()
  }, [])
  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden select-none">
        <header className="flex items-center pb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-end">
              <h1 className="font-900 text-7.5 line-height-0.95em text-text tracking-[-1.2px]">{appInfo.name}</h1>
              <div className="w-2 h-2 bg-pri ml-1 mb-1.5 rd-0.5"></div>
            </div>
            <p className="text-(3 text2) mt-1.5 tracking-[0.1px]">{t('home.title')}</p>
          </div>
          <div className="flex items-center gap-2">
            {actionList.map((action, index) => (
              <div
                key={index}
                className="w-8.5 h-8.5 duration-200 bg-bg2 border border-solid border-border rd-2 flex-center cursor-pointer hover:(bg-pri/15 border-pri/40) active:(scale-92)"
                onClick={action.onClick}>
                <div className={cn('text-(text 3.8)', action.icon)}></div>
              </div>
            ))}
          </div>
        </header>
        <main className="flex-1 flex flex-col overflow-hidden">
          <Uploader ref={uploaderRef} multiple onFileSelect={handleFileSelect} event$={event$} />
        </main>
        {!!fileList.length && (
          <div className="pos-fixed bottom-0 w-full left-0 flex-center py-7 bg-gradient-to-t from-bg0 via-bg0/85 to-transparent pointer-events-none">
            <motion.button
              type="button"
              onClick={toggleShare}
              className="pointer-events-auto relative w-14 h-14 rd-full bg-pri flex-center cursor-pointer border-none outline-none text-white"
              initial={false}
              animate={{
                boxShadow: isShare
                  ? '0 10px 30px -4px hsl(var(--primary-color) / 0.6)'
                  : '0 8px 24px -6px hsl(var(--primary-color) / 0.45)'
              }}
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
              {/* 激活态外圈呼吸光晕 —— 常驻 DOM，通过 animate 切换状态避免闪帧 */}
              <motion.span
                className="absolute inset-0 rd-full bg-pri pointer-events-none"
                animate={
                  isShare
                    ? { opacity: [0, 0.35, 0], scale: [1, 1.22, 1.22] }
                    : { opacity: 0, scale: 1 }
                }
                transition={
                  isShare
                    ? { duration: 1.6, repeat: Infinity, ease: 'easeOut', times: [0, 0.45, 1] }
                    : { duration: 0.25 }
                }
              />
              <motion.span
                className="absolute inset-0 rd-full border border-solid border-pri pointer-events-none"
                animate={
                  isShare
                    ? { opacity: [0, 0.5, 0], scale: [1, 1.35, 1.35] }
                    : { opacity: 0, scale: 1 }
                }
                transition={
                  isShare
                    ? { duration: 1.6, repeat: Infinity, ease: 'easeOut', times: [0, 0.45, 1], delay: 0.5 }
                    : { duration: 0.25 }
                }
              />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isShare ? 'stop' : 'start'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className="relative flex-center text-white">
                  <div
                    className={cn(
                      '!text-white text-6',
                      isShare ? 'i-tabler:player-stop' : 'i-tabler:broadcast'
                    )}
                    style={{ color: '#ffffff' }}></div>
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        )}
      </div>

      <DialogCaptcha ref={captchaRef} maxLength={5} confirmText={t('dialog.confirm')} />
    </>
  )
}

export default Home
