<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import DhcpManager from '@/components/standalone/dns_dhcp/DhcpManager.vue'
import StaticLeases from '@/components/standalone/dns_dhcp/StaticLeases.vue'
import DynamicLeases from '@/components/standalone/dns_dhcp/DynamicLeases.vue'
import DnsManager from '@/components/standalone/dns_dhcp/DnsManager.vue'
import DnsRecords from '@/components/standalone/dns_dhcp/DnsRecords.vue'
import ScanNetwork from '@/components/standalone/dns_dhcp/ScanNetwork.vue'
import { useTabs } from '@/composables/useTabs'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
  {
    name: 'dhcp',
    label: t('standalone.dns_dhcp.tabs.dhcp')
  },
  {
    name: 'static-leases',
    label: t('standalone.dns_dhcp.tabs.static_leases')
  },
  {
    name: 'dynamic-leases',
    label: t('standalone.dns_dhcp.tabs.dynamic_leases')
  },
  {
    name: 'dns',
    label: t('standalone.dns_dhcp.tabs.dns')
  },
  {
    name: 'dns-records',
    label: t('standalone.dns_dhcp.tabs.dns_records')
  },
  {
    name: 'scan-network',
    label: t('standalone.dns_dhcp.tabs.scan_network')
  }
])
</script>

<template>
  <NeHeading tag="h3" class="mb-4">{{ t('standalone.dns_dhcp.title') }}</NeHeading>
  <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
    {{ t('Configure DHCP settings, manage static and dynamic leases, bind MAC addresses, and set DNS records for network devices') }}
  </p>
  <div>
    <NeTabs :selected="selectedTab" :srSelectTabLabel="t('ne_tabs.select_a_tab')" :srTabsLabel="t('ne_tabs.tabs')"
      :tabs="tabs" class="mb-8" @selectTab="selectedTab = $event" />
    <DhcpManager v-if="selectedTab === 'dhcp'" />
    <StaticLeases v-else-if="selectedTab === 'static-leases'" />
    <DynamicLeases v-else-if="selectedTab === 'dynamic-leases'" />
    <DnsManager v-else-if="selectedTab === 'dns'" />
    <DnsRecords v-else-if="selectedTab === 'dns-records'" />
    <ScanNetwork v-else />
  </div>
</template>
