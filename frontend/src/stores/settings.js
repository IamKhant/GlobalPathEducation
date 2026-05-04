import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const DEFAULT_CURRENCY = 'AUD'
const STORAGE_KEY = 'gpe-selected-currency'

export const useSettingsStore = defineStore('settings', () => {
  const supportedCurrencies = ['AUD', 'USD', 'MYR', 'EUR', 'CAD', 'GBP', 'JPY', 'NZD']
  const savedCurrency = localStorage.getItem(STORAGE_KEY)
  const selectedCurrency = ref(
    isCurrencyCode(savedCurrency) ? savedCurrency : DEFAULT_CURRENCY,
  )
  const ratesByPair = ref({})
  const loadingRates = ref(false)
  const rateError = ref('')

  const frankfurterApiUrl =
    import.meta.env.VITE_FRANKFURTER_API_URL || 'https://api.frankfurter.dev'

  function isCurrencyCode(currency) {
    return /^[A-Z]{3}$/.test(currency || '')
  }

  function setCurrency(currency) {
    const normalizedCurrency = currency?.trim().toUpperCase()
    if (!isCurrencyCode(normalizedCurrency)) return

    selectedCurrency.value = normalizedCurrency
    localStorage.setItem(STORAGE_KEY, normalizedCurrency)
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
    selectedCurrency,
    loadingRates,
    rateError,
    setCurrency,
    fetchRate,
    fetchRatesForPrograms,
    convertAmount,
    displayCurrencyFor,
    formatMoney,
  }
})
