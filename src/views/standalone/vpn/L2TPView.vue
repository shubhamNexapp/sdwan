<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
    NeHeading,
    NeTabs,
} from '@nethesis/vue-components'
import { useTabs } from '@/composables/useTabs'
import L2TPClient from '@/components/standalone/l2tp/L2TPClientTunnelView.vue'
import L2TPServer from '@/components/standalone/l2tp/L2TPServerTunnelView.vue'
import Traceroot from '@/components/standalone/monitoring/Traceroot.vue'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
    {
        name: 'l2tp-client',
        label: t('Client Tunnel')
    },
    {
        name: 'l2tp-server',
        label: t('Server Tunnel')
    },
])

</script>
<template>
    <div>
        <div class="flex flex-col justify-between gap-6 mb-3 md:flex-row md:items-center">
            <NeHeading tag="h3">
                {{ t('L2TP') }}
            </NeHeading>
        </div>
        <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
            {{ t('Configure L2TP client settings, including server connection details, user credentials, and manage client tunnels.') }}
        </p>
        <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
            :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
        <L2TPClient v-if="selectedTab == 'l2tp-client'" />
        <L2TPServer v-else-if="selectedTab == 'l2tp-server'" />
    </div>
</template>
