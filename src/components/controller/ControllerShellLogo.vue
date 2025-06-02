<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { getCompanyName } from '@/lib/config'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const logoFilename = computed(() => {
  if (themeStore.isLight) {
    return 'logo_light.svg'
  } else {
    return 'logo_dark.svg'
  }
})
</script>

<template>
  <div class="flex h-16 shrink-0 flex-col items-start justify-center pl-3 pt-3">
    <img class="h-7 w-auto" :src="`/${logoFilename}`" :alt="`${getCompanyName()} logo`" />
    <span class="text-base text-primary-700 dark:text-primary-500">Controller</span>
  </div>
</template>
