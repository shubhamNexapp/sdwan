<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script lang="ts" setup>
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusContent from '@/components/standalone/hotspot/StatusContent.vue'
import SettingsContent from '@/components/standalone/hotspot/SettingsContent.vue'
import { useTabs } from '@/composables/useTabs'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { tabs, selectedTab } = useTabs([
  {
    name: 'tab-status',
    label: t('standalone.hotspot.tabs.status')
  },
  {
    name: 'tab-settings',
    label: t('standalone.hotspot.tabs.settings')
  }
])

onMounted(() => {
  selectedTab.value = (route.query.tab as string) ?? tabs.value[0].name
})

watch(selectedTab, () => {
  router.push({ path: route.path, query: { tab: selectedTab.value } })
})
</script>

<template>
  <NeHeading tag="h3" class="mb-4">{{ t('standalone.hotspot.title') }}</NeHeading>
  <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
    {{ t('Configure and manage hotspot settings, including authentication and network access configurations.') }}
  </p>
  <NeTabs :selected="selectedTab" :srSelectTabLabel="t('ne_tabs.select_a_tab')" :srTabsLabel="t('ne_tabs.tabs')"
    :tabs="tabs" class="mb-8" @selectTab="selectedTab = $event" />
  <StatusContent v-if="selectedTab == 'tab-status'" @go-to-setting="selectedTab = 'tab-settings'" />
  <SettingsContent v-if="selectedTab == 'tab-settings'" />
</template>
