import BackBtn from '@/components/BackBtn/BacKBtn'
import { Input } from '@/components/ui/input'
import { GetVersion, GetAppInfo } from '@wa/services/SystemService'
import { BrowserOpenURL } from '@runtime/runtime'
import React, { useEffect, useState } from 'react'

export interface ISettingItem {
  icon?: string
  label: string
  value?: string
  [key: string]: any
}

const Settings: React.FC = () => {
  const [version, setVersion] = useState('')
  const [appInfo, setAppInfo] = useState<Record<string, string>>({})
  const commonSettings: ISettingItem[] = [
    {
      icon: 'i-tabler:language',
      label: '语言',
      node: <div>中文</div>
    },
    {
      icon: 'i-tabler:server-cog',
      label: '端口',
      node: (
        <>
          <div>
            <input className="w-16 text-right text-(text 3.5)" placeholder="8080" />
          </div>
        </>
      )
    }
  ]

  const otherSettings: ISettingItem[] = [
    {
      icon: 'i-tabler:brand-appstore',
      label: '应用名称',
      node: <div className="text-text2">{appInfo.name}</div>
    },
    {
      icon: 'i-tabler:info-circle',
      label: '版本',
      node: <div className="text-text2">{version}</div>
    },
    {
      icon: 'i-tabler:user-hexagon',
      label: '作者',
      node: <div className="text-text2">{appInfo.author}</div>
    },
    {
      icon: 'i-tabler:mail',
      label: '邮箱',
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

  useEffect(() => {
    GetVersion().then(setVersion)
    GetAppInfo().then(setAppInfo)
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
            <h1 className="font-900 text-(6 text) line-height-1em ml-2">设置</h1>
          </div>
        </header>
        <main>
          <h5 className="font-900 mt-6 text-text2">通用设置</h5>
          <div className="rd-2 border-(2 solid border/40) mt-2">
            {commonSettings.map((item, index) => (
              <>
                <div key={index}>{renderItem(item)}</div>
                {index !== commonSettings.length - 1 && (
                  <div className="w-full px-2">
                    <div className="h-1px bg-border/70 w-full"></div>
                  </div>
                )}
              </>
            ))}
          </div>

          <h5 className="font-900 mt-6 text-text2">关于</h5>
          <div className="rd-2 border-(2 solid border/40) mt-2">
            {otherSettings.map((item, index) => (
              <>
                <div key={index}>{renderItem(item)}</div>
                {index !== otherSettings.length - 1 && (
                  <div className="w-full px-2">
                    <div className="h-1px bg-border/70 w-full"></div>
                  </div>
                )}
              </>
            ))}
          </div>


          <div className='flex-center px2 py-3'>
            <p className='text-(3 text2)'>喜欢的话可以给我的仓库点个star</p>
          </div>
        </main>
      </div>
    </>
  )
}

export default Settings
