import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/api'
import { uiText } from '@/locales/en'

const DEFAULT_CURRENCY = 'AUD'
const DEFAULT_LANGUAGE = 'EN'
const CURRENCY_STORAGE_KEY = 'gpe-selected-currency'
const LANGUAGE_STORAGE_KEY = 'gpe-selected-language'

export const useSettingsStore = defineStore('settings', () => {
  const supportedCurrencies = ['AUD', 'USD', 'MYR', 'EUR', 'CAD', 'GBP', 'JPY', 'NZD']
  const supportedLanguages = [
    { code: 'EN', label: 'English' },
    { code: 'MS', label: 'Malay' },
    { code: 'MY', label: 'Myanmar/Burmese' },
    { code: 'ZH', label: 'Chinese' },
  ]
  const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY)
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  const selectedCurrency = ref(
    isCurrencyCode(savedCurrency) ? savedCurrency : DEFAULT_CURRENCY,
  )
  const selectedLanguage = ref(
    isSupportedLanguage(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE,
  )
  const ratesByPair = ref({})
  const uiTranslations = ref({})
  const loadingRates = ref(false)
  const loadingUiTranslations = ref(false)
  const rateError = ref('')
  const uiTranslationError = ref('')

  const frankfurterApiUrl =
    import.meta.env.VITE_FRANKFURTER_API_URL || 'https://api.frankfurter.dev'

  function isCurrencyCode(currency) {
    return /^[A-Z]{3}$/.test(currency || '')
  }

  function isSupportedLanguage(language) {
    return supportedLanguages.some((item) => item.code === language)
  }

  function setCurrency(currency) {
    const normalizedCurrency = currency?.trim().toUpperCase()
    if (!isCurrencyCode(normalizedCurrency)) return

    selectedCurrency.value = normalizedCurrency
    localStorage.setItem(CURRENCY_STORAGE_KEY, normalizedCurrency)
  }

  function setLanguage(language) {
    const normalizedLanguage = language?.trim().toUpperCase()
    if (!isSupportedLanguage(normalizedLanguage)) return

    selectedLanguage.value = normalizedLanguage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage)
    fetchUiTranslations()
  }

  function formatText(text, params = {}) {
    return Object.entries(params).reduce((result, [key, value]) => {
      return result.replaceAll(`{${key}}`, value)
    }, text)
  }

  function t(key, params = {}) {
    const text =
      selectedLanguage.value === 'EN'
        ? uiText[key]
        : uiTranslations.value[selectedLanguage.value]?.[key] || uiText[key]

    return formatText(text || key, params)
  }

  async function fetchUiTranslations() {
    if (selectedLanguage.value === 'EN') return

    try {
      loadingUiTranslations.value = true
      uiTranslationError.value = ''

      const { data } = await api.post('/api/translations/ui', {
        locale: selectedLanguage.value,
        entries: Object.entries(uiText).map(([key, text]) => ({ key, text })),
      })

      uiTranslations.value = {
        ...uiTranslations.value,
        [selectedLanguage.value]: data.translations || {},
      }
    } catch (error) {
      console.error(error)
      uiTranslationError.value = 'Failed to translate interface text.'
    } finally {
      loadingUiTranslations.value = false
    }
  }

  function pairKey(base, quote) {
    return `${base}:${quote}`
  }

  async function fetchRate(base, quote = selectedCurrency.value) {
    if (!base || !quote || base === quote) return

    const key = pairKey(base, quote)
    if (ratesByPair.value[key]) return

    try {
      loadingRates.value = true
      rateError.value = ''

      const { data } = await axios.get(`${frankfurterApiUrl}/v2/rate/${base}/${quote}`)
      ratesByPair.value[key] = data.rate
    } catch (error) {
      console.error(error)
      rateError.value = 'Failed to load exchange rates.'
    } finally {
      loadingRates.value = false
    }
  }

  async function fetchRatesForPrograms(programs) {
    const pairs = programs
      .map((program) => program.currency)
      .filter((currency) => currency && currency !== selectedCurrency.value)

    await Promise.all([...new Set(pairs)].map((currency) => fetchRate(currency)))
  }

  function convertAmount(amount, base, quote = selectedCurrency.value) {
    if (amount === 0 || amount === null || amount === undefined) return amount
    if (!base || base === quote) return amount

    const rate = ratesByPair.value[pairKey(base, quote)]
    return rate ? amount * rate : amount
  }

  function displayCurrencyFor(base, quote = selectedCurrency.value) {
    if (!base || base === quote) return quote

    return ratesByPair.value[pairKey(base, quote)] ? quote : base
  }

  function formatMoney(amount, base, freeLabel = 'Free') {
    if (amount === 0) return freeLabel
    if (amount === null || amount === undefined) return '-'

    const currency = displayCurrencyFor(base)
    const value = convertAmount(amount, base)

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return {
    supportedCurrencies,
    supportedLanguages,
    selectedCurrency,
    selectedLanguage,
    loadingRates,
    loadingUiTranslations,
    rateError,
    uiTranslationError,
    setCurrency,
    setLanguage,
    fetchUiTranslations,
    t,
    fetchRate,
    fetchRatesForPrograms,
    convertAmount,
    displayCurrencyFor,
    formatMoney,
  }
})
