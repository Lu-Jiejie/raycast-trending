import { getPreferenceValues } from '@raycast/api'

// i18n
const lang = getPreferenceValues<Preferences>().lang || 'en'
export const t = (en: string, zh: string) => ({ en, zh })[lang] || en
