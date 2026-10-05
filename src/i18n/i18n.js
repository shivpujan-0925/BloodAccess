import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './locales/en.json'
import hiTranslation from './locales/hi.json'

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('bloodaccess_language') || 'en' : 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  })

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bloodaccess_language', lng)
    document.documentElement.lang = lng
  }
})

export default i18n
