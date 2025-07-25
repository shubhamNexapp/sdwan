<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  NeHeading,
  NeButton,
  NeInlineNotification,
  NeSkeleton,
  NeEmptyState,
  getAxiosErrorMessage
} from '@nethesis/vue-components'
import { useUciPendingChangesStore } from '@/stores/standalone/uciPendingChanges'
import { onMounted, onUnmounted, ref } from 'vue'
import { ubusCall } from '@/lib/standalone/ubus'
import ClientTunnelTable from '@/components/standalone/ipsec_tunnel/IpsecClientTableTunnel.vue'
import DeleteTunnelModal from '@/components/standalone/ipsec_tunnel/IpsecClientDeleteTunnel.vue'
import CreateOrEditTunnelDrawer from '@/components/standalone/ipsec_tunnel/IpsecClientCreateOrEditTunnelDrawer.vue'
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
const selectedTunnel = ref<IpsecTunnel | null>(null)
const showCreateEditDrawer = ref(false)
const showDeleteModal = ref(false)
const fetchTunnelsIntervalId = ref(0)

const error = ref({
  notificationTitle: '',
  notificationDescription: '',
  notificationDetails: ''
})


// async function fetchTunnels(setLoading: boolean = true) {
//   try {
//     if (setLoading) {
//       loading.value = true
//     }
//     tunnels.value = (await ubusCall('ns.ipsectunnel', 'list-tunnels')).data.tunnels
//     loading.value = false
//   } catch (err: any) {
//     error.value.notificationTitle = t('Cannot retrieve Ipsec Tunnel tunnels')
//     error.value.notificationDescription = t(getAxiosErrorMessage(err))
//     error.value.notificationDetails = err.toString()
//   } finally {
//     if (setLoading) {
//       loading.value = false
//     }
//   }
// }

onMounted(() => {
  fetchConfiguration();
});

let apiResponse : any

async function fetchConfiguration() {
  try {
    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/ipsec_server`, {
      method: 'get-config',
      payload: {}
    });

    if (response.data.code === 200) {
      const config = response.data.data;
      apiResponse = [config]
      console.log("config=======", config)

    }
  } catch (err) {

  } finally {
    loading.value = false;
  }
}

function openCreateEditDrawer(itemToEdit: IpsecTunnel | null) {
  console.log("itemToEdit=======",itemToEdit)
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
  // await fetchTunnels()
  await uciChangesStore.getChanges()
}

onMounted(() => {
  // fetchTunnels()

  // periodically reload data
  // fetchTunnelsIntervalId.value = setInterval(() => fetchTunnels(false), RELOAD_INTERVAL)
})

onUnmounted(() => {
  if (fetchTunnelsIntervalId.value) {
    clearInterval(fetchTunnelsIntervalId.value)
  }
})
</script>

<template>
  <div class="flex flex-col">
    <div class="space-y-6">
    <!-- <div class="flex flex-col items-start justify-between gap-6 lg:flex-row">
        <p class="max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
          {{ t('standalone.ipsec_tunnel.description') }}
        </p>
        <div class="flex shrink-0 flex-col gap-x-0 gap-y-2 sm:flex-row sm:gap-x-2 sm:gap-y-0">
          <NeButton kind="secondary" @click="openCreateEditDrawer(null)">
            <template >
              <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4" aria-hidden="true" />
            </template>
            {{ t('standalone.ipsec_tunnel.add_ipsec_tunnel') }}
          </NeButton>
        </div>
      </div>  -->
      <NeInlineNotification kind="error" :title="error.notificationTitle" :description="error.notificationDescription"
        v-if="error.notificationTitle"><template  v-if="error.notificationDetails">
          {{ error.notificationDetails }}
        </template></NeInlineNotification>
      <NeSkeleton v-if="loading" :lines="8" size="lg" />
      <template v-else>
        <NeEmptyState v-if="apiResponse.length == 0" :title="t('standalone.ipsec_tunnel.no_tunnel_found')"
          :icon="['fas', 'globe']">
          <NeButton kind="primary" @click="openCreateEditDrawer(null)"><template >
              <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4" aria-hidden="true" /> </template>{{
                t('standalone.ipsec_tunnel.add_ipsec_tunnel') }}</NeButton>
        </NeEmptyState>
        <ClientTunnelTable v-else :tunnel2="apiResponse[0].remote" :tunnels="apiResponse" @tunnel-delete="openDeleteModal"
          @tunnel-edit="openCreateEditDrawer" @tunnel-toggle-enable="toggleTunnelEnable" />
      </template>
    </div>
  </div>
  <DeleteTunnelModal :visible="showDeleteModal" :item-to-delete="selectedTunnel" @close="closeModalsAndDrawers"
    @tunnel-deleted="reloadTunnels" />
  <CreateOrEditTunnelDrawer :item-to-edit="selectedTunnel" @close="closeModalsAndDrawers"
    @add-edit-tunnel="reloadTunnels" :is-shown="showCreateEditDrawer" />
</template>
