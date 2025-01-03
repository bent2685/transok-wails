import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './locales/en.json'
import zhTranslation from './locales/zh_CN.json'
import zhTwTranslation from './locales/zh_TW.json'
import jaTranslation from './locales/ja.json'
import { Get, GetKeys, Set } from '@wa/services/StorageService'

export const initI18n = async () => {
  let lang = 'en'
  try {
    const keys = await GetKeys()
    if (!keys.includes('language')) {
      await Set('language', 'en')
    }
    const storedLang = await Get('language')
    if (storedLang) {
      lang = storedLang
    }
  } catch (error) {
    console.error('Failed to initialize language settings:', error)
  }

  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: enTranslation
      },
      zh_CN: {
        translation: zhTranslation
      },
      zh_TW: {
        translation: zhTwTranslation
      },
      ja: {
        translation: jaTranslation
      }
    },
    lng: lang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
}
