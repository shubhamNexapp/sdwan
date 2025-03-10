<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  NeHeading,
  NeButton,
  NeInlineNotification,
  NeSkeleton,
  NeEmptyState,
  getAxiosErrorMessage,
  NeTable,
  NeTableHead,
  NeTableHeadCell,
  NeTableBody,
  NeTableRow,
  NeTableCell,
} from '@nethesis/vue-components'
import { useUciPendingChangesStore } from '@/stores/standalone/uciPendingChanges'
import { onMounted, onUnmounted, ref } from 'vue'
import { ubusCall } from '@/lib/standalone/ubus'
import TunnelTable from '@/components/standalone/ipsec_tunnel/TunnelTable.vue'
import DeleteTunnelModal from '@/components/standalone/ipsec_tunnel/DeleteTunnelModal.vue'
import WireGuardDrawer from '@/components/standalone/wire_guard/WireGuardDrawer.vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'



export type IpsecTunnel = {
  id: string
  name: string
  local: string[]
  remote: string[]
  enabled: '0' | '1'
  connected: boolean
}

const { t } = useI18n()
const uciChangesStore = useUciPendingChangesStore()

const RELOAD_INTERVAL = 10000
const loading = ref(true)
const tunnels = ref([])
const selectedTunnel = ref()
const showCreateEditDrawer = ref(false)
const showDeleteModal = ref(false)
const fetchTunnelsIntervalId = ref(0)

const error = ref({
  notificationTitle: '',
  notificationDescription: '',
  notificationDetails: ''
})

async function fetchTunnels(setLoading: boolean = true) {
  try {
    if (setLoading) {
      loading.value = true
    }
    tunnels.value = (await ubusCall('ns.ipsectunnel', 'list-tunnels')).data.tunnels
    loading.value = false
  } catch (err: any) {
    error.value.notificationTitle = t('error.cannot_retrieve_ipsec_tunnels')
    error.value.notificationDescription = t(getAxiosErrorMessage(err))
    error.value.notificationDetails = err.toString()
  } finally {
    if (setLoading) {
      loading.value = false
    }
  }
}

function openCreateEditDrawer(itemToEdit: IpsecTunnel | null) {
  selectedTunnel.value = itemToEdit
  showCreateEditDrawer.value = true
}


function openDeleteModal(itemToDelete: IpsecTunnel) {
  selectedTunnel.value = itemToDelete
  showDeleteModal.value = true
}

function closeModalsAndDrawers() {
  selectedTunnel.value = null
  showDeleteModal.value = false
  showCreateEditDrawer.value = false
}

function cleanError() {
  error.value = {
    notificationTitle: '',
    notificationDescription: '',
    notificationDetails: ''
  }
}

async function toggleTunnelEnable(tunnel: IpsecTunnel) {
  try {
    cleanError()
    await ubusCall('ns.ipsectunnel', tunnel.enabled === '1' ? 'disable-tunnel' : 'enable-tunnel', {
      id: tunnel.id
    })
    await reloadTunnels()
  } catch (err: any) {
    error.value.notificationTitle = t(
      tunnel.enabled ? 'error.cannot_disable_tunnel' : 'error.cannot_enable_tunnel'
    )
    error.value.notificationDescription = t(getAxiosErrorMessage(err))
    error.value.notificationDetails = err.toString()
  }
}

async function reloadTunnels() {
  cleanError()
  await fetchTunnels()
  await uciChangesStore.getChanges()
}

onMounted(() => {
  fetchTunnels()
  getLists()
  // periodically reload data
  fetchTunnelsIntervalId.value = setInterval(() => fetchTunnels(false), RELOAD_INTERVAL)
})

onUnmounted(() => {
  if (fetchTunnelsIntervalId.value) {
    clearInterval(fetchTunnelsIntervalId.value)
  }
})

const apiResponse = ref()
const getLists = async () => {

  try {

    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/wireguard`, {
      method: 'get-config',
      payload: {}
    });

    if (response.data.code === 200) {
      loading.value = false;
      apiResponse.value = [response.data.data] // Store API response
    }
  } catch (err) {
    loading.value = false;
    console.error("Error:====", err);
  }
  loading.value = false;
};


</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col justify-between md:flex-row md:items-center">
      <NeHeading tag="h3" class="mb-7">{{ t('standalone.wire_guard.title') }}</NeHeading>
      <div class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {{ t('common.data_updated_every_seconds', { seconds: 10 }) }}
      </div>
    </div>

    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-6 lg:flex-row">
        <p class="max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
          {{ t('standalone.wire_guard.description') }}
        </p>
      </div>

      <NeInlineNotification kind="error" :title="error.notificationTitle" :description="error.notificationDescription"
        v-if="error.notificationTitle">
        <template #details v-if="error.notificationDetails">
          {{ error.notificationDetails }}
        </template>
      </NeInlineNotification>

      <NeSkeleton v-if="loading" :lines="8" size="lg" />



      <template v-else>
        <!-- Show "Add WireGuard Tunnel" button if dummyData is empty -->
        <!-- <NeButton kind="primary" @click="openCreateEditDrawer(null)">
          <template #prefix>
            <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4" aria-hidden="true" />
          </template>
          {{ t('standalone.wire_guard.add_wire_guard_tunnel') }}
        </NeButton> -->
        <NeButton 
  v-if="!apiResponse[0]?.local_network" 
  kind="primary" 
  @click="openCreateEditDrawer(null)"
>
  <template #prefix>
    <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4" aria-hidden="true" />
  </template>
  {{ t('standalone.wire_guard.add_wire_guard_tunnel') }}
</NeButton>
        <!-- Show table if apiresponse has values -->
        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>Local Public Key</NeTableHeadCell>
            <NeTableHeadCell>Local Network</NeTableHeadCell>
            <NeTableHeadCell>Listen Port</NeTableHeadCell>
            <NeTableHeadCell>Server IP</NeTableHeadCell>
            <NeTableHeadCell>Server Port</NeTableHeadCell>
            <NeTableHeadCell>Peer Public Key</NeTableHeadCell>
            <NeTableHeadCell>Allowed IPs</NeTableHeadCell>
            <NeTableHeadCell></NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in apiResponse" :key="index">
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.local_public_key }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.local_network }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.listen_port }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.server_ip }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.server_port }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.peer_public_key }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.allowed_ips }}
              </NeTableCell>
              <NeTableCell :data-label="t('common.actions')">
                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                  <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                    @click="openCreateEditDrawer(item)">
                    <template #prefix>
                      <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4" aria-hidden="true" />
                    </template>
                    {{ t('common.edit') }}
                  </NeButton>
                  <!-- <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                    @click="openDeleteModal(item.tunnel_name)">
                    <template #prefix>
                      <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                    </template>
                    {{ t('common.delete') }}
                  </NeButton> -->
                </div>
              </NeTableCell>
              <!-- <NeTableCell>
                <NeButton kind="primary" size="lg" @click.prevent="openCreateEditDrawer(item)">
                  Edit
                </NeButton>
              </NeTableCell> -->
            </NeTableRow>
          </NeTableBody>
        </NeTable>

      </template>
    </div>
  </div>

  <DeleteTunnelModal :visible="showDeleteModal" :item-to-delete="selectedTunnel" @close="closeModalsAndDrawers"
    @tunnel-deleted="reloadTunnels" />
  <WireGuardDrawer :item-to-edit="selectedTunnel" :rule-type="'forward'" :known-tags="[]" @close="closeModalsAndDrawers"
    @add-edit-tunnel="reloadTunnels" :is-shown="showCreateEditDrawer" />
</template>
