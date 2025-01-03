import BackBtn from '@/components/BackBtn/BacKBtn'
import { Input } from '@/components/ui/input'
import { GetVersion, GetAppInfo } from '@wa/services/SystemService'
import { BrowserOpenURL } from '@runtime/runtime'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Set, Get, GetKeys } from '@wa/services/StorageService'
import { useRef } from 'react'
import { Stop } from '@wa/app/ginService'
export interface ISettingItem {
  icon?: string
  label: string
  value?: string
  [key: string]: any
}

const Settings: React.FC = () => {
  const [version, setVersion] = useState('')
  const [appInfo, setAppInfo] = useState<Record<string, string>>({})
  const [language, setLanguage] = useState<string | null>(null)
  const [port, setPort] = useState<string>('9482')
  const { t, i18n } = useTranslation()

  const defaultLanguage = useRef()
  const commonSettings: ISettingItem[] = [
    {
      icon: 'i-tabler:language',
      label: t('settings.language'),
      node: (
        <div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zh_CN">简体中文</SelectItem>
              <SelectItem value="zh_TW">繁体中文</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      icon: 'i-tabler:server-cog',
      label: t('settings.port'),
      node: (
        <>
          <div>
            <input
              className="w-16 text-right text-(text 3.5)"
              value={port}
              onChange={async e => {
                const value = e.target.value
                if (!/^\d*$/.test(value)) return

                const numValue = parseInt(value || '0')
                if (numValue > 65535) return

                setPort(value)
                Stop()
                // 保存端口值到存储
                await Set('port', value)
              }}
              placeholder="9482"
            />
          </div>
        </>
      )
    }
  ]

  const otherSettings: ISettingItem[] = [
    {
      icon: 'i-tabler:brand-appstore',
      label: t('settings.name'),
      node: <div className="text-text2">{appInfo.name}</div>
    },
    {
      icon: 'i-tabler:info-circle',
      label: t('settings.version'),
      node: <div className="text-text2">{version}</div>
    },
    {
      icon: 'i-tabler:user-hexagon',
      label: t('settings.author'),
      node: <div className="text-text2">{appInfo.author}</div>
    },
    {
      icon: 'i-tabler:mail',
      label: t('settings.email'),
      node: <div className="text-text2">{appInfo.email}</div>
    },
    {
      icon: 'i-tabler:brand-github',
      label: 'Github',
      node: (
        <div
          className="text-text2 font-900 select-none cursor-pointer hover:(text-pri underline)"
          onClick={() => BrowserOpenURL('https://github.com/bent2685/transok-wails')}>
          transok-wails
        </div>
      )
    }
  ]

  /**
   * 改变语言
   * @param lang 语言
   */
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    Set('language', lang)
  }

  useEffect(() => {
    if (!language) return
    changeLanguage(language)
  }, [language])

  const getLanguageFromDb = async () => {
    const keys = await GetKeys()
    if (!keys.includes('language')) {
      await Set('language', 'en')
    }
    const lang = await Get('language')

    setLanguage(lang)
    defaultLanguage.current = lang
  }
  useEffect(() => {
    GetVersion().then(setVersion)
    GetAppInfo().then(setAppInfo)
    getLanguageFromDb()
    Get('port').then(async savedPort => {
      if (!savedPort) {
        await Set('port', '9482')
        setPort('9482')
        return
      }
      setPort(savedPort)
    })
  }, [])

  const renderItem = (item: ISettingItem) => {
    return (
      <div className="px-3 py-2 flex items-center">
        <div className="flex items-center">
          {item.icon && <div className={`${item.icon} text-4 mr-1.5`}></div>}
          <h3 className="text-4 font-900">{item.label}</h3>
        </div>
        <div className="flex-1"></div>
        <div className="text-4">{item.node}</div>
      </div>
    )
  }
  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center">
          <div className="flex-1 flex items-center">
            <BackBtn />
            <h1 className="font-900 text-(6 text) line-height-1em ml-2">{t('settings.title.settings')}</h1>
          </div>
        </header>
        <main>
          <h5 className="font-900 mt-6 text-text2">{t('settings.title.common')}</h5>
          <div className="rd-2 border-(2 solid border/40) mt-2">
            {commonSettings.map((item, index) => (
              <React.Fragment key={`common-${index}`}>
                <div>{renderItem(item)}</div>
                {index !== commonSettings.length - 1 && (
                  <div className="w-full px-2">
                    <div className="h-1px bg-border/70 w-full"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <h5 className="font-900 mt-6 text-text2">{t('settings.title.about')}</h5>
          <div className="rd-2 border-(2 solid border/40) mt-2">
            {otherSettings.map((item, index) => (
              <React.Fragment key={`other-${index}`}>
                <div>{renderItem(item)}</div>
                {index !== otherSettings.length - 1 && (
                  <div className="w-full px-2">
                    <div className="h-1px bg-border/70 w-full"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex-center px2 py-3">
            <p className="text-(3 text2) text-center">{t('settings.footer')}</p>
          </div>
        </main>
      </div>
    </>
  )
}

export default Settings
