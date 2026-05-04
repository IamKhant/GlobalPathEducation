<template>
  <div class="py-4 bookmarks-page">
    <div class="container">
      <h1 class="section-heading mb-1">Saved Programs</h1>
      <p class="section-subheading mb-4">{{ userStore.bookmarks.length }} programs saved</p>

      <div v-if="loading" class="row g-4">
        <div v-for="i in 3" :key="i" class="col-md-6 col-lg-4">
          <div class="program-card">
            <div class="card-body">
              <div class="placeholder-glow">
                <div class="placeholder col-12 mb-2" style="height: 80px"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="userStore.bookmarks.length === 0" class="text-center py-5">
        <div class="fs-1 mb-3">🔖</div>
        <h5>No saved programs yet</h5>
        <p class="text-muted">Browse programs and click the bookmark icon to save them here.</p>
        <RouterLink to="/programs" class="btn btn-gpe-primary">Browse Programs</RouterLink>
      </div>

      <div v-else class="row g-4">
        <div v-for="b in userStore.bookmarks" :key="b.id" class="col-md-6 col-lg-4">
          <ProgramCard :program="b.program" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ProgramCard from '@/components/ProgramCard.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(true)

onMounted(async () => {
  await userStore.fetchBookmarks()
  loading.value = false
})
</script>
<style scoped>
.bookmarks-page {
  min-height: 70vh;
}
</style>
