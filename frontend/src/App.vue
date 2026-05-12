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
import { useSettingsStore } from '@/stores/settings'

const { isSignedIn } = useAuth()
const userStore = useUserStore()
const programStore = useProgramStore()
const settingsStore = useSettingsStore()

onMounted(async () => {
  await settingsStore.fetchUiTranslations()
  await programStore.fetchMeta()
  if (isSignedIn.value) {
    await Promise.all([userStore.fetchBookmarks(), userStore.fetchProfile()])
  }
})

watch(isSignedIn, async (signedIn) => {
  if (signedIn) {
    await Promise.all([userStore.fetchBookmarks(), userStore.fetchProfile()])
  } else {
    userStore.clearBookmarks()
    userStore.clearCompareList()
    userStore.clearProfile()
  }
})
</script>
