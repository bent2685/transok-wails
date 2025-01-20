import { lazy } from 'react'
import { Navigate, RouteObject, useRoutes } from 'react-router-dom'

export type RouteType = RouteObject & {
  meta?: Record<string, any>
  label?: string
  children?: RouteType[]
}

const HomeView /* 主页 */ = lazy(() => import('../views/Home/Home'))
const SettingsView /* 设置页面 */ = lazy(() => import('../views/Settings/Settings'))
const DiscoverView /* 设备发现页面(未启用) */ = lazy(() => import('../views/Discover/Discover'))
const ViewAllUrlView /* 展示所有分享url页 */ = lazy(() => import('../views/ViewAllUrl/ViewAllUrl'))

export const routes: RouteType[] = [
  {
    path: '/',
    element: <Navigate to="/home" />
  },
  {
    path: '/home',
    element: <HomeView />
  },
  {
    path: '/settings',
    element: <SettingsView />
  },
  {
    path: '/discover',
    element: <DiscoverView />
  },
  {
    path: '/allurl',
    element: <ViewAllUrlView />
  }
]
const RoterConfig = () => {
  const route = useRoutes(routes)
  return route
}

export const getPath = (id: string, arr: RouteType[] = routes): string => {
  for (const route of arr) {
    if (route.id === id) {
      return route.path || ''
    }

    if (route.children) {
      const childPath = getPath(id, route.children)
      if (childPath) {
        return `${route.path}/${childPath}`
      }
    }
  }
  return ''
}

export default RoterConfig
