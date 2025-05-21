<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import NeTable from '../NeTable.vue'
import { NeDropdown } from '@nethesis/vue-components'
import { NeButton } from '@nethesis/vue-components'
import type { IpsecTunnel } from '@/types/tunnel'
import type { ClientIPSecTunnel } from '@/types/tunnel'

const { t } = useI18n()

const props = defineProps<{
  tunnels: IpsecTunnel[],
  tunnel2: ClientIPSecTunnel[]
}>()

const emit = defineEmits(['tunnel-delete', 'tunnel-edit', 'tunnel-toggle-enable'])

const tableHeaders = [
  {
    label: t('Dpdaction'),
    key: 'name'
  },
  {
    label: t('Local Network'),
    key: 'local_subnet'
  },
  {
    label: t('Remote Network'),
    key: 'remote_subnet'
  },
  {
    label: t('Service'),
    key: 'service'
  },
  {
    label: '',
    key: 'menu'
  }
]

const tableHeaders2 = [
  {
    label: t('IP'),
    key: 'ip'
  },
  {
    label: t('Status'),
    key: 'status'
  },
  {
    label: t('Subnet'),
    key: 'subnet'
  },
]

function getDropdownItems(item: IpsecTunnel) {
  return [
    // {
    //   id: 'enable_disable',
    //   label:
    //     item.enabled === '1'
    //       ? t('standalone.ipsec_tunnel.disable')
    //       : t('standalone.ipsec_tunnel.enable'),
    //   iconStyle: 'fas',
    //   icon: item.enabled === '1' ? 'circle-xmark' : 'circle-check',
    //   action: () => {
    //     emit('tunnel-toggle-enable', item)
    //   }
    // },
    {
      id: 'delete',
      label: t('common.delete'),
      iconStyle: 'fas',
      icon: 'trash',
      danger: true,
      action: () => {
        emit('tunnel-delete', item)
      }
    }
  ]
}

function getCellClasses(item: IpsecTunnel) {
  return item.enabled === '0' ? ['text-gray-400', 'dark:text-gray-700'] : []
}

function parsedIPs(ipString: string) {

  if (!ipString || typeof ipString !== 'string') return [];

  // Match all IPv4 addresses using regex
  const ipRegex =
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

  const matchedIPs = ipString.match(ipRegex);

  return matchedIPs || [];
}

function parsedSubnets(subnetString: string) {

  if (!subnetString || typeof subnetString !== 'string') return [];

  // Split by '===', '->', or similar separators
  return subnetString
    .split(/===|->|<==>|<=>|<->/)
    .map(s => s.trim())
    .filter(Boolean);
}




</script>

<template>
  <NeTable :data="tunnels" :headers="tableHeaders">

    <template #name="{ item }: { item: IpsecTunnel }">
      <p :class="[...getCellClasses(item)]">{{ item.dpdaction }}</p>
    </template>

    <template #remote="{ item }: { item: IpsecTunnel }">
      <div :class="[...getCellClasses(item)]">
        <div v-if="Array.isArray(item.remote) && item.remote.length > 0">
          <div v-for="(remoteEntry, index) in item.remote" :key="index">
            {{ remoteEntry }}
          </div>
        </div>
        <div v-else>
          <em>No remote IP</em>
        </div>
      </div>
    </template>

    <template #service="{ item }: { item: IpsecTunnel }">
      <div :class="['flex', 'flex-row', 'items-center', ...getCellClasses(item)]">
        <font-awesome-icon :icon="['fas', item.service === 'enable' ? 'circle-check' : 'circle-xmark']"
          class="mr-2 h-5 w-5" aria-hidden="true" />
        <p>
          {{
            item.service === 'enable'
              ? t('Enable')
              : t('Disable')
          }}
        </p>
      </div>
    </template>

    <template #local_subnet="{ item }: { item: IpsecTunnel }">
      <div :class="[...getCellClasses(item)]">
        <div v-if="Array.isArray(item.subnet) && item.subnet.length > 0">
          <div v-for="(entry, index) in item.subnet" :key="index">
            <p>{{ entry.local_subnet }}</p>
          </div>
        </div>
        <div v-else>
          <em>No local subnet</em>
        </div>
      </div>
    </template>


    <template #remote_subnet="{ item }: { item: IpsecTunnel }">
      <div :class="[...getCellClasses(item)]">
        <div v-if="Array.isArray(item.subnet) && item.subnet.length > 0">
          <div v-for="(entry, index) in item.subnet" :key="index">
            <p>{{ entry.remote_subnet }}</p>
          </div>
        </div>
        <div v-else>
          <em>No remote subnet</em>
        </div>
      </div>
    </template>

    <template #menu="{ item }: { item: IpsecTunnel }">
      <div class="align-center flex justify-end">
        <NeButton kind="tertiary" @click="emit('tunnel-edit', item)">
          <template #prefix>
            <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4" aria-hidden="true" />
          </template>
          {{ t('common.edit') }}
        </NeButton>
        <NeDropdown :items="getDropdownItems(item)" :align-to-right="true" />
      </div>
    </template>
  </NeTable>
  <h1><b>Remote Data</b></h1>
  <NeTable :data="tunnel2" :headers="tableHeaders2">

    <template #ip="{ item }: { item: ClientIPSecTunnel }">
      <div>
        <div v-if="parsedIPs(item.ip).length">
          <div v-for="(remoteEntry, index) in parsedIPs(item.ip)" :key="index">
            {{ remoteEntry }}
          </div>
        </div>
        <div v-else>
          <em>No remote IP</em>
        </div>
      </div>
    </template>

    <template #status="{ item }: { item: ClientIPSecTunnel }">
      <p>{{ item.status }}</p>
    </template>



    <template #subnet="{ item }: { item: ClientIPSecTunnel }">
      <div>
        <div v-if="parsedSubnets(item.subnet).length">
          <div v-for="(remoteEntry, index) in parsedSubnets(item.subnet)" :key="index">
            {{ remoteEntry }}
          </div>
        </div>
        <div v-else>
          <em>No Subnet</em>
        </div>
      </div>
    </template>

  </NeTable>
</template>
