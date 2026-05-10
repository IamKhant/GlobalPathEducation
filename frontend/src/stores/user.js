import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

const COMPARE_STORAGE_KEY = 'gpe-compare-list'

export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  const profileLoading = ref(false)
  const profileSaving = ref(false)
  const bookmarks = ref([])
  const compareList = ref(loadCompareList())

  function loadCompareList() {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error(error)
      return []
    }
  }

  function saveCompareList() {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList.value))
  }

  const bookmarkedIds = computed(() => {
    return new Set(bookmarks.value.map((bookmark) => bookmark.program?.id || bookmark.id))
  })
  const role = computed(() => profile.value?.role || 'student')
  const isConsultant = computed(() => role.value === 'consultant')
  const isAdmin = computed(() => role.value === 'admin')
  const isStaff = computed(() => ['consultant', 'admin'].includes(role.value))

  async function fetchBookmarks() {
    try {
      const { data } = await api.get('/api/bookmarks')
      bookmarks.value = data
    } catch (error) {
      console.error(error)
      bookmarks.value = []
    }
  }

  async function fetchProfile() {
    profileLoading.value = true

    try {
      const { data } = await api.get('/api/users/me')
      profile.value = data
      return data
    } catch (error) {
      console.error(error)
      profile.value = null
      return null
    } finally {
      profileLoading.value = false
    }
  }

  async function updateProfile(payload) {
    profileSaving.value = true

    try {
      const { data } = await api.patch('/api/users/me', payload)
      profile.value = data
      return data
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      profileSaving.value = false
    }
  }

  async function toggleBookmark(program) {
    if (bookmarkedIds.value.has(program.id)) {
      bookmarks.value = bookmarks.value.filter(
        (item) => (item.program?.id || item.id) !== program.id,
      )

      try {
        await api.delete(`/api/bookmarks/${program.id}`)
      } catch (error) {
        console.error(error)
      }
    } else {
      bookmarks.value.push({ id: `pending-${program.id}`, program })

      try {
        const { data } = await api.post('/api/bookmarks', {
          programId: program.id,
        })

        bookmarks.value = bookmarks.value.map((item) => {
          return item.id === `pending-${program.id}` ? data : item
        })
      } catch (error) {
        console.error(error)
        bookmarks.value = bookmarks.value.filter(
          (item) => (item.program?.id || item.id) !== program.id,
        )
      }
    }
  }

  function clearBookmarks() {
    bookmarks.value = []
  }

  function clearProfile() {
    profile.value = null
  }

  function addToCompare(program) {
    const alreadyExists = compareList.value.some((item) => item.id === program.id)

    if (alreadyExists) return

    if (compareList.value.length >= 3) {
      alert('You can compare up to 3 programs at a time.')
      return
    }

    compareList.value.push(program)
    saveCompareList()
  }

  function removeFromCompare(programId) {
    compareList.value = compareList.value.filter((item) => item.id !== programId)
    saveCompareList()
  }

  function clearCompareList() {
    compareList.value = []
    saveCompareList()
  }

  return {
    profile,
    profileLoading,
    profileSaving,
    role,
    isConsultant,
    isAdmin,
    isStaff,
    bookmarks,
    compareList,
    bookmarkedIds,
    fetchProfile,
    updateProfile,
    clearProfile,
    fetchBookmarks,
    toggleBookmark,
    clearBookmarks,
    addToCompare,
    removeFromCompare,
    clearCompareList,
  }
})
