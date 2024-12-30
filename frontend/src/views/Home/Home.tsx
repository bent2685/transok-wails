import React, { useEffect, useRef, useState } from 'react'
import { GetAppInfo, GetLocalIp } from '@wa/services/systemService'
import { FileInfo, Uploader, UploaderEvent, UploaderRef } from '@/components/Uploader/Uploader'
import { Set, Delete, Get, GetKeys } from '@wa/services/StorageService'
import { Start, Stop } from '@wa/app/ginService'
import { cn } from '@/lib/utils'
import { useEventEmitter } from 'ahooks'
import { useConfirm } from '@/provider/confirm.provider'

const Home: React.FC = () => {
  const [appInfo, setAppInfo] = useState<Record<string, string>>({})
  const [fileList, setFileList] = useState<FileInfo[]>([])
  const [isShare, setIsShare] = useState<boolean | null>(null)
  const port = 9482
  const { confirm } = useConfirm()

  const uploaderRef = useRef<UploaderRef>(null)
  const event$ = useEventEmitter<UploaderEvent>()
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

  const syncIsShare = async () => {
    const keys = await GetKeys()
    if (!keys.includes('is-share')) {
      await Set('is-share', false)
      setIsShare(false)
      return
    }
    const isShareState = await Get('is-share')
    setIsShare(!!isShareState)
    const shareList = await Get('share-list')
    console.log('shareList', shareList)
    uploaderRef.current?.setShareList(shareList)
  }

  event$.useSubscription(async payload => {
    const { type, data } = payload
    if (type === 'copy-link') {
      console.log('复制链接', data)
      const ip = await GetLocalIp()
      const url = `http://${ip}:${port}/download/page`
      const ok = await confirm({
        title: '复制链接',
        description: url,
        confirmText: '复制',
        cancelText: '取消'
      })
      if (!ok) return
      window.navigator.clipboard.writeText(url)
    }
  })

  useEffect(() => {
    if (isShare === null) return
    if (isShare) {
      Start(`:${port}`)
      return
    }
    Stop()
  }, [isShare])

  useEffect(() => {
    GetAppInfo().then(setAppInfo)
    syncIsShare()
  }, [])
  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header>
          <div className="flex items-end my-1">
            <h1 className="font-900 text-(6 text) line-height-1em">{appInfo.name}</h1>
            <div className="w-1.5 h-1.5 bg-pri ml-1"></div>
          </div>
          <p className="text-(3 text2)">高效·快速·无限制 局域网文件分享</p>
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
    </>
  )
}

export default Home
