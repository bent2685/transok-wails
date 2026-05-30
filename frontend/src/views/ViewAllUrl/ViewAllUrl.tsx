import BackBtn from '@/components/BackBtn/BacKBtn'
import { cn } from '@/lib/utils'
import { copyText } from '@/utils/common.util'
import { GetLocalIps } from '@wa/services/SystemService'
import { Get } from '@wa/services/StorageService'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface IViewAllUrl {}

/**
 * View all sharing links
 * @param props
 * @returns
 */
const ViewAllUrl: React.FC<IViewAllUrl> = props => {
  const { t } = useTranslation()
  const [allUrl, setAllUrl] = useState<string[]>([])
  const [port, setPort] = useState('')
  const syncAllUrl = async () => {
    const ips = await GetLocalIps()
    const urlList = ips.map(ip => `http://${ip}:${port}/download/page`)
    setAllUrl(urlList)
  }

  useEffect(() => {
    syncAllUrl()
  }, [port])

  useEffect(() => {
    Get('port').then(async port => {
      setPort(port)
    })
  }, [])

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center">
          <div className="flex-1 flex items-center">
            <BackBtn />
            <h1 className="font-900 text-(6 text) line-height-1em ml-2">{t('allurl.title')}</h1>
          </div>
          {!!allUrl.length && (
            <span className="font-mono text-(3 text2) tabular-nums px-2 py-0.5 rd-full border border-solid border-border">
              {String(allUrl.length).padStart(2, '0')}
            </span>
          )}
        </header>

        <main className="flex-1 overflow-auto my-4 hide-scrollbar px-2">
          <div className="text-(2.75 text2) mb-3 font-600 tracking-[1.5px] uppercase">{t('dialog.copyLink.desc')}</div>

          {!allUrl?.length && (
            <div className="flex-center px-2 py-16 flex-col">
              <div className="i-tabler:playlist-x text-12 text-text2"></div>
              <p className="text-4 text-text2 mt-1">{t('allurl.empty')}</p>
            </div>
          )}

          {allUrl.map((url, index) => (
            <div
              key={index}
              onClick={() => {
                copyText(url)
                toast.success(t('dialog.copyLink.success'))
              }}
              className={cn(
                'group flex items-center gap-2.5 px-2.5 py-2.5 my-1.5 rd-2 cursor-pointer border border-solid duration-200 active:scale-[0.99]',
                index === 0
                  ? 'border-pri/45 bg-pri/8 hover:(border-pri/60 bg-pri/12)'
                  : 'border-border bg-bg/40 hover:(border-pri/40 bg-pri/8)'
              )}>
              <span className="font-mono text-(3 text2) tabular-nums shrink-0 w-5 text-center group-hover:text-pri duration-200">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="w-px self-stretch bg-border group-hover:bg-pri/40 duration-200 shrink-0"></span>
              <span className="flex-1 truncate font-mono text-(3 text) tracking-[0.2px]">{url}</span>
              {index === 0 && <span className="i-tabler:star-filled text-(3 pri) shrink-0"></span>}
              <span className="i-tabler:copy text-(3.5 text2) group-hover:text-pri duration-200 shrink-0"></span>
            </div>
          ))}
        </main>
      </div>
    </>
  )
}

export default ViewAllUrl
