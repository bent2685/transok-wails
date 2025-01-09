import BackBtn from '@/components/BackBtn/BacKBtn'
import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GetDiscoverList } from '@wa/handlers/DiscoverHandler'
import { handlers } from '@wa/models'
import { cn } from '@/lib/utils'
import { BrowserOpenURL } from '@runtime/runtime'

const POLLING_INTERVAL /* 轮询间隔 */ = 1000

const Discover: React.FC = () => {
  const { t } = useTranslation()
  const [discoverList, setDiscoverList] = useState<handlers.DiscoverDevice[]>([])
  const [error, setError] = useState<string>('')
  const timerRef = useRef<number>()

  const deviceIcons /* 设备类型图标 */ = [
    {
      icon: 'i-tabler:brand-apple',
      type: 'darwin'
    },
    {
      icon: 'i-tabler:brand-windows',
      type: 'windows'
    },
    {
      icon: 'i-tabler:device-desktop',
      type: 'other'
    }
  ]

  /* 获取设备列表 */
  const getDiscoverList = async () => {
    try {
      const list = await GetDiscoverList()
      console.log(list)
      setDiscoverList(list || [])
      setError('')
    } catch (err) {
      console.error('Failed to fetch discover list:', err)
      setError(t('discover.fetchError'))
    }

    // 设置下一次轮询
    timerRef.current = window.setTimeout(getDiscoverList, POLLING_INTERVAL)
  }

  useEffect(() => {
    getDiscoverList()

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, []) // 仅在组件挂载时执行一次

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center">
        <div className="flex-1 flex items-center">
          <BackBtn />
          <h1 className="font-900 text-(6 text) line-height-1em ml-2">{t('discover.title')}</h1>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center">
          <div className="i-tabler:loader text-(pri 5) animate-spin animate-duration-2000"></div>
        </div>
      </header>
      <main className="flex-1 overflow-auto my-4 hide-scrollbar">
        <div>
          {!discoverList?.length && (
            <div className="flex-center px-2 py-6 flex-col">
              <div className="i-tabler:playlist-x text-12 text-text2"></div>
              <p className="text-4 text-text2">{t('discover.noDevices')}</p>
            </div>
          )}

          {discoverList.map((device, index) => (
            <div className="flex items-center border-2 border-solid border-border rounded-lg p-2 mb-2" key={index}>
              <div className="flex items-center gap-2 truncate flex-1">
                <div
                  className={cn(
                    'text-text min-w-4 min-h-4',
                    deviceIcons.find(icon => icon.type === device.platform)?.icon || 'i-tabler:device-desktop'
                  )}></div>
                <div className="flex flex-col line-height-1em">
                  <span className="truncate font-bold text-(3.5 text) break-all">{device.uname}</span>
                  <span className="text-(3 text2) break-all">{device.address}</span>
                </div>
              </div>
              <div className="flex items-center pl-2">
                <div
                  className="cursor-pointer rd-full duration-300 bg-border/60 w-6 h-6 flex items-center justify-center hover:(bg-pri/30) active:(scale-95)"
                  onClick={() => {
                    // 浏览器打开address
                    BrowserOpenURL(`http://${device.address}/download/page`)
                  }}>
                  <div className="i-tabler:square-rounded-arrow-up text-text text-3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Discover
