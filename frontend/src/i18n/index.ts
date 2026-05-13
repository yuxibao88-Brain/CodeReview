import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// Check localStorage for preferred language, or default to zh-CN
const savedLang = localStorage.getItem('code-review-lang') || 'zh-CN'

const i18n = createI18n({
  legacy: false, // For Vue 3 Composition API
  locale: savedLang,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
