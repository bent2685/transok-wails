import TitleBar from '@/components/TitleBar/TItleBar'
import React, { useEffect, useState } from 'react'
import RouterView from '@/routes'
import { GetPlatform } from '@wa/services/systemService'
interface IMainLayoutProps {}

const MainLayout: React.FC<IMainLayoutProps> = props => {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    GetPlatform().then(platform => {
      setIsMac(platform === 'darwin')
    })
  }, [])

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {isMac && <TitleBar />}
      <div className="flex flex-col flex-1 overflow-hidden px-3 py-2">
        <RouterView />
      </div>
    </div>
  )
}

export default MainLayout
