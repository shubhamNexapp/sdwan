<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
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
