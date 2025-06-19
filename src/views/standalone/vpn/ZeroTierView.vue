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
import DeleteTunnelModal from '@/components/standalone/zerotier/ZerotierDelete.vue'
import ZeroTierDrawer from '@/components/standalone/zerotier/ZeroTierDrawer.vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'



export type IpsecTunnel = {
  id: string
  name: string
  local: string[]
  remote: string[]
  enabled: '0' | '1'
  connected: boolean
  join: string
}

const { t } = useI18n()
const uciChangesStore = useUciPendingChangesStore()

const RELOAD_INTERVAL = 10000
const loading = ref(true)
const tunnels = ref([])
const selectedTunnel = ref<IpsecTunnel | null>(null)
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
    const response = await axios.post(`${getSDControllerApiEndpoint()}/zerotier`, {
      method: 'get-config',
      payload: {}
    });

    if (response.data.code === 200) {
      loading.value = false;
      //   apiResponse.value = [response.data.data] // Store API response
      apiResponse.value = [response.data.data] // Store API response
    }
  } catch (err) {
    loading.value = false;
  }
  loading.value = false;
};

</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col justify-between md:flex-row md:items-center">
      <NeHeading tag="h3" class="mb-7">{{ t('standalone.zero-tier.title') }}</NeHeading>
    </div>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
      {{ t('Configure ZeroTier tunnel settings, manage network connections, and track client status and MAC addresses.')
      }}
    </p>
    <div class="space-y-6">
      <NeInlineNotification kind="error" :title="error.notificationTitle" :description="error.notificationDescription"
        v-if="error.notificationTitle">
        <template #details v-if="error.notificationDetails">
          {{ error.notificationDetails }}
        </template>
      </NeInlineNotification>

      <NeSkeleton v-if="loading" :lines="8" size="lg" />

      <template v-else>
        <!-- Show "Add WireGuard Tunnel" button if dummyData is empty -->
        <NeButton kind="primary" @click="openCreateEditDrawer(null)">
          {{ t('standalone.wire_guard.add_wire_guard_tunnel') }}
        </NeButton>
        <!-- Show table if apiresponse has values -->
        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>Join</NeTableHeadCell>
            <NeTableHeadCell>ID</NeTableHeadCell>
            <NeTableHeadCell>Version</NeTableHeadCell>
            <NeTableHeadCell>Network</NeTableHeadCell>
            <NeTableHeadCell>MAC</NeTableHeadCell>
            <NeTableHeadCell>Status</NeTableHeadCell>
            <!-- <NeTableHeadCell>Connection</NeTableHeadCell> -->
            <!-- <NeTableHeadCell></NeTableHeadCell> -->
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in apiResponse" :key="index">
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.join }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.id }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.version }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.network }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.mac }}
              </NeTableCell>
              <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
                {{ item.status }}
              </NeTableCell>
              <!-- <NeTableCell :data-label="t('standalone.real_time_monitor.interface')">
      {{ item.allowed_ips }}
    </NeTableCell> -->
              <NeTableCell>
                <!-- <NeButton kind="primary" size="lg" @click.prevent="openCreateEditDrawer(item)">
                  Edit
                </NeButton> -->
                <NeButton kind="tertiary" size="lg" :disabled="item.readonly" @click="openDeleteModal(item)">
                  <template #prefix>
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                  </template>
                  {{ t('common.delete') }}
                </NeButton>
              </NeTableCell>
            </NeTableRow>
          </NeTableBody>
        </NeTable>

      </template>
    </div>
  </div>

  <DeleteTunnelModal :visible="showDeleteModal" :item-to-delete="selectedTunnel" @close="closeModalsAndDrawers"
    @tunnel-deleted="getLists" />
  <ZeroTierDrawer :item-to-edit="selectedTunnel" :rule-type="'forward'" :known-tags="[]" @close="closeModalsAndDrawers"
  @tunnel-added="getLists"  @add-edit-tunnel="getLists" :is-shown="showCreateEditDrawer" />
</template>
