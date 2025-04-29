<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
    NeHeading,
    NeTabs,
} from '@nethesis/vue-components'
import { useTabs } from '@/composables/useTabs'
import L2TPClient from '@/components/standalone/wire_guard/WireGuardClientTunnelView.vue'
import L2TPServer from '@/components/standalone/wire_guard/WireGuardServerTunnelView.vue'
import Traceroot from '@/components/standalone/monitoring/Traceroot.vue'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
    {
        name: 'wireguard-client',
        label: t('Client Tunnel')
    },
    {
        name: 'wireguard-server',
        label: t('Server Tunnel')
    },
])

</script>
<template>
    <div>
        <div class="flex flex-col justify-between gap-6 mb-3 md:flex-row md:items-center">
            <NeHeading tag="h3">
                {{ t('Wire Guard') }}
            </NeHeading>
        </div>
        <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
            {{ t('Configure WireGuard client tunnels, manage public keys, server details, and allowed IPs for secure connections.') }}
        </p>
        <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
            :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
        <L2TPClient v-if="selectedTab == 'wireguard-client'" />
        <L2TPServer v-else-if="selectedTab == 'wireguard-server'" />
    </div>
</template>
