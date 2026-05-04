import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useProgramStore = defineStore('programs', () => {
  const programs = ref([])
  const featuredPrograms = ref([])
  const filters = ref({
    search: '',
    country: '',
    type: '',
    specialization: '',
    duration: '',
    sort: '',
  })
  const meta = ref({
    countries: [],
    types: [],
  })
  const currentPage = ref(1)
  const total = ref(0)
  const totalPages = ref(1)
  const loading = ref(false)
  const error = ref('')

  function activeParams(page = 1, extraParams = {}) {
    const params = {
      page,
      limit: 12,
      ...extraParams,
    }

    Object.entries(filters.value).forEach(([key, value]) => {
      if (value) params[key] = value
    })

    return params
  }

  async function fetchPrograms(options = {}) {
    const params = typeof options === 'number'
      ? activeParams(options)
      : activeParams(options.page || 1, options)

    try {
      loading.value = true
      error.value = ''

      const { data } = await api.get('/api/programs', {
        params,
      })

      programs.value = data.data || []
      currentPage.value = data.pagination?.page || params.page || 1
      total.value = data.pagination?.total || programs.value.length
      totalPages.value = data.pagination?.totalPages || 1
      return data
    } catch (err) {
      console.error(err)
      error.value = 'Failed to load programs.'
      programs.value = []
      total.value = 0
      totalPages.value = 1
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchFeaturedPrograms() {
    const data = await fetchPrograms({ limit: 6 })
    featuredPrograms.value = data?.data || []
  }

  async function fetchMeta() {
    try {
      const { data } = await api.get('/api/programs/meta')
      meta.value = {
        countries: data.countries || [],
        types: data.types || [],
      }
    } catch (err) {
      console.error(err)
      meta.value = {
        countries: [],
        types: [],
      }
    }
  }

  function setFilter(key, value) {
    if (key in filters.value) {
      filters.value[key] = value
    }
  }

  function resetFilters() {
    filters.value = {
      search: '',
      country: '',
      type: '',
      specialization: '',
      duration: '',
      sort: '',
    }
  }

  return {
    programs,
    featuredPrograms,
    filters,
    meta,
    currentPage,
    total,
    totalPages,
    loading,
    error,
    fetchPrograms,
    fetchFeaturedPrograms,
    fetchMeta,
    setFilter,
    resetFilters,
  }
})
