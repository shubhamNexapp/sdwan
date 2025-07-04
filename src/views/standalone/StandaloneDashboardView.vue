<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeLink, NeHeading } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import SystemInfoCard from '@/components/standalone/dashboard/SystemInfoCard.vue'
import ServiceCard from '@/components/standalone/dashboard/ServiceCard.vue'
import { getStandaloneRoutePrefix } from '@/lib/router'
import router from '@/router'
import { useRoute } from 'vue-router'
import OpenVpnTunnelOrIpsecCard from '@/components/standalone/dashboard/OpenVpnTunnelOrIpsecCard.vue'
import InternetConnectionCard from '@/components/standalone/dashboard/InternetConnectionCard.vue'
import ThreatShieldIpCard from '@/components/standalone/dashboard/ThreatShieldIpCard.vue'
import IpsServiceCard from '@/components/standalone/dashboard/IpsServiceCard.vue'
import WireGuard from '@/components/standalone/dashboard/WireGuard.vue'
import MacBindingStatusCard from '@/components/standalone/dashboard/MacBindingStatusCard.vue'
const { t } = useI18n()
const route = useRoute()

function goTo(path: string) {
  router.push(`${getStandaloneRoutePrefix(route)}${path}`)
}
</script>

<template>
  <div class="flex flex-col justify-between md:flex-row md:items-center">
    <NeHeading tag="h3" class="mb-7">{{ t('standalone.dashboard.title') }}</NeHeading>
    <div class="mb-6 text-sm text-gray-500 dark:text-gray-400">
      {{ t('common.data_updated_every_seconds', { seconds: 20 }) }}
    </div>
  </div>

  <div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-4 3xl:grid-cols-6">
    <!-- system -->
    <SystemInfoCard class="sm:col-span-2 xl:row-span-3" />
    <!-- internet connection -->
    <InternetConnectionCard />
    <!-- multiwan -->
    <ServiceCard serviceName="mwan" hasStatus :icon="['fas', 'earth-americas']">
      <template #title>
        <NeLink @click="goTo('/network/multi-wan')" class="text-primary-900" >
          {{ t('standalone.dashboard.multiwan') }}
        </NeLink>
      </template>
    </ServiceCard>
    <!-- dpi-core -->
    <ServiceCard
      serviceName="netifyd"
      hasStatus
      :title="t('standalone.dashboard.dpi_core')"
      :icon="['fas', 'bolt']"
    />
    <!-- openvpn rw -->
    <ServiceCard
      serviceName="openvpn_rw"
      hasStatus
      :counter="{
        name: 'openvpn_rw',
        label: t('standalone.dashboard.clients_connected')
      }"
      :icon="['fas', 'globe']"
    >
      <template #title>
        <NeLink @click="goTo('/vpn/openvpn-rw')" class="text-primary-900">
          {{ t('standalone.dashboard.openvpn_rw') }}
        </NeLink>
      </template>
    </ServiceCard>
    <!-- ipsec tunnels -->
    <OpenVpnTunnelOrIpsecCard method="ipsec-tunnels" >
      <template #title>
        <NeLink @click="goTo('/vpn/ipsec-tunnel')" class="text-primary-900">
          {{ t('standalone.ipsec_tunnel.title') }}
        </NeLink>
      </template>
    </OpenVpnTunnelOrIpsecCard>
    <OpenVpnTunnelOrIpsecCard method="ipsec-tunnels">
      <template #title>
        <NeLink @click="goTo('/vpn/wire-guard')" class="text-primary-900">
          {{ t('standalone.wire_guard.title') }}
        </NeLink>
      </template>
    </OpenVpnTunnelOrIpsecCard>
    <!-- ovpn tunnels -->
    <OpenVpnTunnelOrIpsecCard method="ovpn-tunnels">
      <template #title>
        <NeLink @click="goTo('/vpn/openvpn-tunnel')" class="text-primary-900">
          {{ t('standalone.openvpn_tunnel.title') }}
        </NeLink>
      </template>
    </OpenVpnTunnelOrIpsecCard>
    <!-- threat shield IP / banIP -->
    <ThreatShieldIpCard />
        <!-- MAC binding -->
        <MacBindingStatusCard />
    <!-- IPS -->
    <IpsServiceCard />
        <!-- Wire Guard -->
        <WireGuard />
    <!-- threat shield dns -->
    <ServiceCard serviceName="threat_shield_dns" hasStatus :icon="['fas', 'shield']">
      <template #title>
        <NeLink @click="goTo('/security/insta-shield-dns')" class="text-primary-900" >
          {{ t('standalone.threat_shield_dns.title') }}
        </NeLink>
      </template>
    </ServiceCard>
    <!-- hotspot -->
    <ServiceCard serviceName="dedalo" hasStatus :icon="['fas', 'wifi']">
      <template #title>
        <NeLink @click="goTo('/network/hotspot')" class="text-primary-900">
          {{ t('standalone.dashboard.hotspot') }}
        </NeLink>
      </template>
    </ServiceCard>
    <!-- known hosts -->
    <ServiceCard
      serviceName="hosts"
      :counter="{
        name: 'hosts',
        label: ''
      }"
      :title="t('standalone.dashboard.known_hosts')"
      :icon="['fas', 'circle-info']"
    />
  </div>
</template>
