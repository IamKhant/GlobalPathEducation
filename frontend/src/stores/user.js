import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  const bookmarks = ref([])
  const compareList = ref([])

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
      bookmarks.value = bookmarks.value.filter((item) => (item.program?.id || item.id) !== program.id)

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
        bookmarks.value = bookmarks.value.filter((item) => (item.program?.id || item.id) !== program.id)
      }
    }
  }

  function clearBookmarks() {
    bookmarks.value = []
  }

  function addToCompare(program) {
    const alreadyAdded = compareList.value.some((item) => item.id === program.id)

    if (!alreadyAdded && compareList.value.length < 3) {
      compareList.value.push(program)
    }
  }

  function removeFromCompare(programId) {
    compareList.value = compareList.value.filter((program) => program.id !== programId)
  }

  function clearCompare() {
    compareList.value = []
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
    clearCompare,
  }
})
