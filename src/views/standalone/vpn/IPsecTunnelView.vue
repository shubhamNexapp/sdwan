<script setup lang="ts">
import { useTabs } from '@/composables/useTabs'
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import IpsecTunnelView from '@/components/standalone/ipsec_tunnel/IpsecTunnelView.vue'
import IpsecClientTunnelView from '@/components/standalone/ipsec_tunnel/IpsecClinetTunnelView.vue'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
  {
    name: 'server-tunnel',
    label: t('standalone.openvpn_tunnel.tabs.server_tunnel')
  },
  {
    name: 'client-tunnel',
    label: t('standalone.openvpn_tunnel.tabs.client_tunnel')
  }
])
</script>

<template>
  <div class="flex flex-col justify-between md:flex-row md:items-center">
    <NeHeading tag="h3" class="mb-7">{{ t('Ipsec Tunnel') }}</NeHeading>
    <div class="mb-6 text-sm text-gray-500 dark:text-gray-400">
      {{ t('common.data_updated_every_seconds', { seconds: 10 }) }}
    </div>
  </div>
  <div>
    <NeTabs
      :selected="selectedTab"
      :srSelectTabLabel="t('ne_tabs.select_a_tab')"
      :srTabsLabel="t('ne_tabs.tabs')"
      :tabs="tabs"
      class="mb-8"
      @selectTab="selectedTab = $event"
    />
    <IpsecTunnelView :manageClientTunnels="false" v-if="selectedTab == 'server-tunnel'" />
    <IpsecClientTunnelView :manageClientTunnels="true" v-else />
  </div>
</template>
