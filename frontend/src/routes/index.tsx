import { lazy } from 'react'
import { Navigate, RouteObject, useRoutes } from 'react-router-dom'

export type RouteType = RouteObject & {
  meta?: Record<string, any>
  label?: string
  children?: RouteType[]
}

const HomeView = lazy(() => import('../views/Home/Home'))
const SettingsView = lazy(() => import('../views/Settings/Settings'))
const DiscoverView = lazy(() => import('../views/Discover/Discover'))
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
