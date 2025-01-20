import BackBtn from '@/components/BackBtn/BacKBtn'
import { copyText, getLocalIpsDepth } from '@/utils/common.util'
import { Get } from '@wa/services/StorageService'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface IViewAllUrl {}

/**
 * 查看所有分享链接
 * @param props
 * @returns
 */
const ViewAllUrl: React.FC<IViewAllUrl> = props => {
  const { t } = useTranslation()
  const [allUrl, setAllUrl] = useState<string[]>([])
  const [port, setPort] = useState('')
  const syncAllUrl = async () => {
    const ips = await getLocalIpsDepth(-1)
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
            <h1 className="font-900 text-(4 text) line-height-1em ml-2">{t('allurl.title')}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto my-4 hide-scrollbar px-2">
          <div className="text-3.5 mb-3 font-900">{t('dialog.copyLink.desc')}</div>
          <div>
            {!allUrl?.length && (
              <div className="flex-center px-2 py-6 flex-col">
                <div className="i-tabler:playlist-x text-12 text-text2"></div>
                <p className="text-4 text-text2">{t('allurl.empty')}</p>
              </div>
            )}
          </div>

          {allUrl.map((url, index) => (
            <div
              key={index}
              onClick={() => {
                copyText(url)
                toast.success(t('dialog.copyLink.success'))
              }}
              className="text-3.5 my-2 flex items-center cursor-pointer group border-(2px solid border) p2 rd-2">
              <div className="inline text-text2 group-hover:text-text duration-300 flex-1 truncate">{url}</div>
              <div className="i-tabler:copy inline-block group-hover:text-pri ml-1 duration-300 w-4 h-4"></div>
            </div>
          ))}
        </main>
      </div>
    </>
  )
}

export default ViewAllUrl
