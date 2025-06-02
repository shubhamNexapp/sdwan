<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import { useTabs } from '@/composables/useTabs'
import FirewallRulesContent from '@/components/standalone/firewall/rules/FirewallRulesContent.vue'
import { computed } from 'vue'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
  { name: 'forwardRules', label: t('standalone.firewall_rules.forward_rules') },
  { name: 'inputRules', label: t('standalone.firewall_rules.input_rules') },
  { name: 'outputRules', label: t('standalone.firewall_rules.output_rules') }
])

const rulesType = computed(() => {
  switch (selectedTab.value) {
    case 'forwardRules':
      return 'forward'
    case 'inputRules':
      return 'input'
    default:
      return 'output'
  }
})
</script>

<template>
  <div class="text-sm">
    <NeHeading tag="h3" class="mb-4">{{ t('standalone.firewall_rules.title') }}</NeHeading>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
      {{ t('Configure firewall rules for filtering and controlling data traffic between zones, with rules applied in order of priority.') }}
    </p>
    <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
      :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
    <FirewallRulesContent :rulesType="rulesType" />
  </div>
</template>
