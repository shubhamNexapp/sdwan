<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import DpiRules from '@/components/standalone/dpi/DpiRules.vue'
import DpiExceptions from '@/components/standalone/dpi/DpiExceptions.vue'
import { useTabs } from '@/composables/useTabs'
import Policy from '@/components/standalone/dpi/Policy.vue'

const { t } = useI18n()
const { tabs, selectedTab } = useTabs([
  { name: 'rules', label: t('standalone.dpi.rules') },
  { name: 'exceptions', label: t('standalone.dpi.exceptions') },
  { name: 'policy', label: t('Policy') }
])
</script>

<template>
  <div class="text-sm">
    <NeHeading tag="h3" class="mb-7">{{ t('standalone.dpi.title') }}</NeHeading>
    <p class="mb-4 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
      {{ t('Configure Deep Packet Inspection (DPI) rules to filter and restrict traffic based on applications, with interface-specific exceptions.') }}
    </p>
    <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
      :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
    <div>
      <template v-if="selectedTab === 'rules'">
        <DpiRules />
      </template>
      <template v-else-if="selectedTab === 'exceptions'">
        <DpiExceptions />
      </template>
      <template v-else-if="selectedTab === 'policy'">
        <Policy />
      </template>
    </div>
  </div>
</template>
