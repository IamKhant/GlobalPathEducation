import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

const COMPARE_STORAGE_KEY = 'gpe-compare-list'

export const useUserStore = defineStore('user', () => {
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

  async function fetchBookmarks() {
    try {
      const { data } = await api.get('/api/bookmarks')
      bookmarks.value = data
    } catch (error) {
      console.error(error)
      bookmarks.value = []
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
    bookmarks,
    compareList,
    bookmarkedIds,
    fetchBookmarks,
    toggleBookmark,
    clearBookmarks,
    addToCompare,
    removeFromCompare,
    clearCompareList,
  }
})
