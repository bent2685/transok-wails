import React, { useEffect, useRef, useState } from 'react'
import { GetAppInfo, GetLocalIp } from '@wa/services/SystemService'
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
import { copyText, getLocalIpsDepth } from '@/utils/common.util'
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

  const [captcha, setCaptcha] /* 分享密钥 */ = useState<string>('')
  const uploaderRef /* 上传器 */ = useRef<UploaderRef>(null)
  const event$ /* 事件总栈 */ = useEventEmitter<UploaderEvent>()

  const actionList /* 操作列表 */ = [
    // { 暂时移除
    //   icon: 'i-tabler:device-desktop-search',
    //   onClick: () => navigate('/discover')
    // },
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
   * 文件选择/添加后回调
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
   * 切换分享状态
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
   * 同步分享状态
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
   * 同步分享密钥
   */
  const syncCaptcha = async () => {
    const captcha = await GetCaptcha()
    setCaptcha(captcha)
  }

  /**
   * 事件订阅
   */
  event$.useSubscription(async payload => {
    const { type, data } = payload
    if (type === 'copy-link') {
      const ips = await getLocalIpsDepth(2)
      const urlList = ips.map(ip => `http://${ip}:${port}/download/page`)

      const ok = await slotConfirm({
        title: t('dialog.copyLink.title'),
        description: t('dialog.copyLink.desc'),
        children: ({ onConfirm, onCancel }) => (
          <div className="text-4">
            {urlList.map((url, index) => (
              <div
                key={index}
                className="text-3 my-2 flex items-center cursor-pointer group justify-center"
                onClick={async () => {
                  await copyText(url)
                  onConfirm()
                }}>
                <div className="inline text-text2 group-hover:text-text duration-300">{url}</div>
                <div className="i-tabler:copy inline-block group-hover:text-pri ml-1 duration-300"></div>
              </div>
            ))}
          </div>
        ),
        renderFooter: ({ onCancel }) => (
          <div
            className="flex-center text-3.5 mt-3 cursor-pointer hover:(text-pri) duration-300"
            onClick={() => {
              onCancel()
              navigate('/allurl')
            }}>
            <span>{t('common.seeAll')}</span>
            <div className="i-tabler:chevron-right"></div>
          </div>
        )
      })
    }
  })

  useEffect(() => {
    if (isShare === null) return

    let interval: NodeJS.Timeout | null = null

    // 无论是否分享，都需要同步share-list
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center">
          <div className="flex-1">
            <div className="flex items-end mb-1">
              <h1 className="font-900 text-(6 text) line-height-1em">{appInfo.name}</h1>
              <div className="w-1.5 h-1.5 bg-pri ml-1"></div>
            </div>
            <p className="text-(3 text2)">{t('home.title')}</p>
          </div>
          <div className="flex items-center">
            {actionList.map((action, index) => (
              <div
                key={index}
                className="w-8 h-8 duration-300 bg-bg2 rd-5 flex-center cursor-pointer hover:(bg-pri/20) active:(bg-pri/40 scale-95) not-last:mr-3"
                onClick={action.onClick}>
                <div className={cn('text-(text 3.5)', action.icon)}></div>
              </div>
            ))}
          </div>
        </header>
        <main className="mt-4 flex-1 flex flex-col overflow-hidden">
          <Uploader ref={uploaderRef} multiple onFileSelect={handleFileSelect} event$={event$} />
        </main>
        {!!fileList.length && (
          <div className="pos-fixed bottom-0 w-full left-0 flex-center py-8 bg-gradient-to-t from-bg2 to-transparent">
            <div
              className={cn(
                'bg-pri w-13 h-13 duration-300 rd-5 cursor-pointer flex-center shadow-sm shadow-pri/60 hover:(brightness-80)',
                isShare ? 'animate-spin animate-duration-4000' : 'brightness-130'
              )}
              onClick={toggleShare}>
              <div className={cn('text-(text white)', isShare ? 'i-tabler:hand-stop' : 'i-tabler:share')}></div>
            </div>
          </div>
        )}
      </div>

      <DialogCaptcha ref={captchaRef} maxLength={5} confirmText={t('dialog.confirm')} />
    </>
  )
}

export default Home
