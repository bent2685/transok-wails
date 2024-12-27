import { ThemeName } from '@/hooks/theme.use'
import { atom } from 'jotai'

export const themeAtom = atom<ThemeName>('light')
