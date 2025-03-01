<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import { useTabs } from '@/composables/useTabs'
import Ping from "./networkComponents/Ping.vue"
import Trace from "./networkComponents/Trace.vue"
import PingIPv6 from "./networkComponents/PingIPv6.vue"
import TraceIPv6 from "./networkComponents/TraceIPv6.vue"
import MTR from "./networkComponents/MTR.vue"

const { t } = useI18n()
const { tabs, selectedTab } = useTabs([
  { name: 'disabled_rules', label: t('Ping') },
  { name: 'trace', label: t('Trace') },
  { name: 'PingIPv6', label: t('PingIPv6') },
  { name: 'TraceIPv6', label: t('TraceIPv6') },
  { name: 'mtr', label: t('MTR') },
])
</script>

<template>
  <NeHeading tag="h3" class="mb-7">Network Test</NeHeading>
  <NeTabs
      :selected="selectedTab"
      :srSelectTabLabel="t('ne_tabs.select_a_tab')"
      :srTabsLabel="t('ne_tabs.tabs')"
      :tabs="tabs"
      @selectTab="selectedTab = $event"
    />
  <Ping v-if="selectedTab == 'disabled_rules'" />
  <Trace v-if="selectedTab == 'trace'" />
  <PingIPv6 v-if="selectedTab == 'PingIPv6'" />
  <TraceIPv6 v-if="selectedTab == 'TraceIPv6'" />
  <MTR v-if="selectedTab == 'mtr'" />
</template>
