<template>
  <div id="app">
    <AppNavbar />
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <AppFooter />
    <CompareBar v-if="userStore.compareList.length > 0" />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuth } from '@clerk/vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import CompareBar from '@/components/CompareBar.vue'
import { useUserStore } from '@/stores/user'
import { useProgramStore } from '@/stores/programs'

const { isSignedIn } = useAuth()
const userStore = useUserStore()
const programStore = useProgramStore()

onMounted(async () => {
  await programStore.fetchMeta()
  if (isSignedIn.value) {
    await userStore.fetchBookmarks()
  }
})

watch(isSignedIn, async (signedIn) => {
  if (signedIn) {
    await userStore.fetchBookmarks()
  } else {
    userStore.clearBookmarks()
  }
})
</script>
