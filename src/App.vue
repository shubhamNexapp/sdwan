<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import ControllerApp from './ControllerApp.vue'
import StandaloneApp from './StandaloneApp.vue'
import { useThemeStore } from '@/stores/theme'
import { onMounted } from 'vue'
import { isStandaloneMode } from './lib/config'

const welcomeMsg = [
  '  _   _                            ',
  ' | \\ | |                           ',
  ' |  \\| | _____  ____ _ _ __  _ __  ',
  ' | . ` |/ _ \\ \\/ / _` | \'_ \\| \'_ \\ ',
  ' | |\\  |  __/>  < (_| | |_) | |_) |',
  ' |_| \\_|\\___/_/\\_\\__,_| .__/| .__/ ',
  '                      | |   | |    ',
  '                      |_|   |_|    '
].join('\n')

const themeStore = useThemeStore()

console.log("check")

onMounted(() => {
  console.log('%c' + welcomeMsg, 'background: #0891b2; color: white;')
  themeStore.loadTheme()
})
</script>

<template>
  <template v-if="isStandaloneMode()">
    <StandaloneApp />
  </template>
  <template v-else>
    <ControllerApp />
  </template>
</template>
