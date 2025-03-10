<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
    NeHeading,
    NeTabs,
} from '@nethesis/vue-components'
import { useTabs } from '@/composables/useTabs'
import Ping from '@/components/standalone/monitoring/Ping.vue'
import Traceroot from '@/components/standalone/monitoring/Traceroot.vue'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
    {
        name: 'ping',
        label: t('standalone.ping_traceroot.ping_title')
    },
    {
        name: 'trace-root',
        label: t('standalone.ping_traceroot.trace_root_title')
    }
])

</script>
<template>
    <div>
        <div class="flex flex-col justify-between gap-6 mb-8 md:flex-row md:items-center">
            <NeHeading tag="h3">
                {{ t('standalone.ping_traceroot.title') }}
            </NeHeading>
        </div>
        <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
            :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
        <Ping v-if="selectedTab == 'ping'" />
        <Traceroot v-else-if="selectedTab == 'trace-root'" />
    </div>
</template>
