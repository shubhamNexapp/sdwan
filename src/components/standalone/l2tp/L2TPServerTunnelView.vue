<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  NeHeading,
  NeButton,
  NeInlineNotification,
  NeSkeleton,
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
import DeleteTunnelModal from '@/components/standalone/l2tp/L2TPServerDeleteTunnelModal.vue'
import L2TPAddDrawer from '@/components/standalone/l2tp/L2tpServerAddDrawer.vue'
import L2TPEditDrawer from '@/components/standalone/l2tp/L2TPServerEditDrawer.vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'

export type IpsecTunnel = {
  id: string
  name: string
  local: string[]
  remote: string[]
  enabled: '0' | '1'
  connected: boolean
  tunnelName: string
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
    error.value.notificationTitle = t('Cannot retrieve L2TP tunnels')
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

const selectedTunnelName = ref<string | null>(null);

function openDeleteModal(tunnelName: string) {
  selectedTunnelName.value = tunnelName
  showDeleteModal.value = true
}

const selectedTunnels = ref();
const showEditModals = ref(false);

function openEditModal(tunnel: object) {
  selectedTunnels.value = tunnel;
  showEditModals.value = true;
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

const apiResponse = ref<any[]>([]);
const getLists = async () => {

  try {

    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/l2tp_server`, {
      method: 'get-config',
      payload: {}
    });

    if (response.data.code === 200) {
      loading.value = false;
      // apiResponse.value = response.data.data // Store API response
      const result = response.data.data;
      console.log('API result:====', result); // 👈 See structure here
      apiResponse.value = Array.isArray(result) ? result : [result];
      /* apiResponse.value = [{
         "service": "enable",
         "ip_start": "192.168.245.200",
         "ip_end": "192.168.245.210",
         "local_ip": "192.168.2.120",
         "chap": "yes",
         "pap": "yes",
         "mru": "1440",
         "mtu": "1440",
         "username": "admin456",
         "password": "admin456",
         "auth": "no",
         "require_mschap_v2": "yes",
         "require_chap": "yes",
         "require_pap": "yes",
         "lcp_interval": "20",
         "lcp_failure": "5",
         "defailtroute": "no",
         "ipdefault": "no",
         "proxyarp": "yes",
         "client": [
           {
             "ifname": "ppp0",
             "ip": "192.168.245.200",
             "status": "connected"
           },
           {
             "ifname": "ppp1",
             "ip": "192.168.245.201",
             "status": "connected"
           }
         ]
       }] */
    }
  } catch (err) {
    loading.value = false;
  }
  loading.value = false;
};


</script>

<template>
  <div class="flex flex-col">
    <!-- <div class="flex flex-col justify-between md:flex-row md:items-center">
      <NeHeading tag="h3" class="mb-7">{{ t('standalone.l2tp.title') }}</NeHeading>
    </div>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
      {{ t('standalone.ping_latency_monitor.description') }}
    </p> -->
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
          <template #prefix>
            <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4" aria-hidden="true" />
          </template>
          {{ t('Add Server Tunnel') }}
        </NeButton>
        <!-- Show table if apiresponse has values -->
        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>#</NeTableHeadCell>
            <NeTableHeadCell>IP Start</NeTableHeadCell>
            <NeTableHeadCell>IP End</NeTableHeadCell>
            <NeTableHeadCell>User Name</NeTableHeadCell>
            <NeTableHeadCell>Password</NeTableHeadCell>
            <NeTableHeadCell>Service</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in apiResponse" :key="index">
              <NeTableCell>{{ index + 1 }}</NeTableCell>
              <NeTableCell>{{ item.ip_start }}</NeTableCell>
              <NeTableCell>{{ item.ip_end }}</NeTableCell>
              <NeTableCell>{{ item.username }}</NeTableCell>
              <NeTableCell>{{ item.password }}</NeTableCell>
              <NeTableCell :class="item.service === 'disconnect' ? 'text-red-800' : 'text-green-800'">
                {{ item.service }}
              </NeTableCell>

              <NeTableCell :data-label="t('common.actions')">
                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                  <NeButton kind="tertiary" size="lg" :disabled="item.readonly" @click="openEditModal(item)">
                    <template #prefix>
                      <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4" aria-hidden="true" />
                    </template>
                    {{ t('common.edit') }}
                  </NeButton>
                  <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                    @click="openDeleteModal(item.interface_name)">
                    <template #prefix>
                      <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                    </template>
                    {{ t('common.delete') }}
                  </NeButton>
                </div>
              </NeTableCell>
              <!-- <NeTableCell>
                <NeButton kind="primary" @click="openEditModal(item)">
                  edit</NeButton>
                <NeButton kind="primary" @click="openDeleteModal(item.tunnel_name)">
                  Delete
                </NeButton>
              </NeTableCell> -->
            </NeTableRow>
          </NeTableBody>
        </NeTable>

        <!-- Show table if apiresponse has values -->
        <h1><b>Client List</b></h1>
        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>Interface Name</NeTableHeadCell>
            <NeTableHeadCell>IP Address</NeTableHeadCell>
            <NeTableHeadCell>Status</NeTableHeadCell>
          </NeTableHead>
          {{ console.log("apiResponse======", apiResponse[0].client) }}
          <NeTableBody>
            <NeTableRow v-for="(item, index) in apiResponse[0].client" :key="index">
              <NeTableCell>{{ item.ifname }}</NeTableCell>
              <NeTableCell>{{ item.ip }}</NeTableCell>
              <NeTableCell>{{ item.status }}</NeTableCell>
              <!-- <NeTableCell :class="item.status === 'disconnect' ? 'text-red-800' : 'text-green-800'">
                {{ item.status }}
              </NeTableCell> -->

              <NeTableCell :data-label="t('common.actions')">
                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                  <NeButton kind="tertiary" size="lg" :disabled="item.readonly" @click="openEditModal(item)">
                    <template #prefix>
                      <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4" aria-hidden="true" />
                    </template>
                    {{ t('common.edit') }}
                  </NeButton>
                  <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                    @click="openDeleteModal(item.interface_name)">
                    <template #prefix>
                      <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                    </template>
                    {{ t('common.delete') }}
                  </NeButton>
                </div>
              </NeTableCell>
              <!-- <NeTableCell>
                <NeButton kind="primary" @click="openEditModal(item)">
                  edit</NeButton>
                <NeButton kind="primary" @click="openDeleteModal(item.tunnel_name)">
                  Delete
                </NeButton>
              </NeTableCell> -->
            </NeTableRow>
          </NeTableBody>
        </NeTable>
      </template>
    </div>
  </div>

  <DeleteTunnelModal :visible="showDeleteModal" :itemToDelete="selectedTunnelName" @close="showDeleteModal = false"
    @tunnel-deleted="fetchTunnels" />
  <L2TPAddDrawer :item-to-edit="selectedTunnel" @close="closeModalsAndDrawers" :rule-type="'forward'" :known-tags="[]"
    @add-edit-tunnel="reloadTunnels" :is-shown="showCreateEditDrawer" />
  <L2TPEditDrawer :item-to-edit="selectedTunnels" @close="showEditModals = false" :rule-type="'forward'"
    :known-tags="[]" @add-edit-tunnel="reloadTunnels" :is-shown="showEditModals" />
</template>
