<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import GeneralSettings from '@/components/standalone/system_settings/GeneralSettings.vue'
import TimeSynchronization from '@/components/standalone/system_settings/TimeSynchronization.vue'
import { useTabs } from '@/composables/useTabs'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
  { name: 'general', label: t('standalone.system_settings.general_settings') },
  { name: 'timeSync', label: t('standalone.system_settings.time_synchronization') }
])
</script>

<template>
  <div>
    <NeHeading tag="h3" class="mb-7">{{ t('standalone.system_settings.title') }}</NeHeading>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
      {{ t('Configure system details, time synchronization, and unit-specific settings such as hostname, description, and timezone') }}
    </p>
    <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
      :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
    <div>
      <template v-if="selectedTab === 'general'">
        <GeneralSettings />
      </template>
      <template v-else-if="selectedTab === 'timeSync'">
        <TimeSynchronization />
      </template>
    </div>
  </div>
</template>
