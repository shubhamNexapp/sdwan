<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import NatRulesContent from '@/components/standalone/firewall/nat/NatRulesContent.vue'
import NetmapContent from '@/components/standalone/firewall/nat/NetmapContent.vue'
import NatHelpers from '@/components/standalone/firewall/nat/NatHelpers.vue'
import { useTabs } from '@/composables/useTabs'
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
  { name: 'nat', label: t('standalone.nat.rules_and_netmap') },
  { name: 'natHelpers', label: t('standalone.nat_helpers.title') }
])
</script>

<template>
  <div>
    <NeHeading tag="h3" class="mb-4">{{ t('standalone.nat.title') }}</NeHeading>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
      {{ t('Configure NAT and NETMAP rules to modify network address information, implement source NAT, and map private networks to public addresses.') }}
    </p>
    <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
      :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
    <template v-if="selectedTab === 'nat'">
      <!-- nat rules -->
      <NatRulesContent />
      <!-- netmap -->
      <NetmapContent class="mt-12" />
    </template>
    <NatHelpers v-else-if="selectedTab === 'natHelpers'" />
  </div>
</template>
