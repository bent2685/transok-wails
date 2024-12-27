import { lazy } from 'react'
import { Navigate, RouteObject, useRoutes } from 'react-router-dom'

export type RouteType = RouteObject & {
  meta?: Record<string, any>
  label?: string
  children?: RouteType[]
}

const HomeView = lazy(() => import('../views/Home/Home'))
export const routes: RouteType[] = [
  {
    path: '/',
    element: <Navigate to="/home" />
  },
  {
    path: '/home',
    element: <HomeView />
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
