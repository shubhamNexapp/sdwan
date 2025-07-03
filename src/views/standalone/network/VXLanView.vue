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
import DeleteTunnelModal from '@/components/standalone/vxlan/vxlan_delete.vue'
import VXLANDrawer from '@/components/standalone/vxlan/vxlan_drawer.vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { nextTick } from 'vue'

import VXLANEdit from '@/components/standalone/vxlan/vxlan_edit.vue'

export type IpsecTunnel = {
    id: string
    name: string
    local: string[]
    remote: string[]
    enabled: '0' | '1'
    connected: boolean
    tunnelName: string
    interfaceName: string
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
//     try {
//         if (setLoading) {
//             loading.value = true
//         }
//         tunnels.value = (await ubusCall('ns.ipsectunnel', 'list-tunnels')).data.tunnels
//         loading.value = false
//     } catch (err: any) {
//         error.value.notificationTitle = t('error.cannot_retrieve_ipsec_tunnels')
//         error.value.notificationDescription = t(getAxiosErrorMessage(err))
//         error.value.notificationDetails = err.toString()
//     } finally {
//         if (setLoading) {
//             loading.value = false
//         }
//     }
// }

function openCreateEditDrawer(itemToEdit: IpsecTunnel | null) {
    selectedTunnel.value = itemToEdit
    showCreateEditDrawer.value = true
}

const selectedTunnelName = ref<string | null>(null);

async function openDeleteModal(tunnelName: any) {
    selectedTunnelName.value = tunnelName
    await nextTick()
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
    // await fetchTunnels()
    await uciChangesStore.getChanges()
}

onMounted(() => {
    // fetchTunnels()
    getLists()
    // periodically reload data
    // fetchTunnelsIntervalId.value = setInterval(() => fetchTunnels(false), RELOAD_INTERVAL)
})

// onUnmounted(() => {
//     if (fetchTunnelsIntervalId.value) {
//         clearInterval(fetchTunnelsIntervalId.value)
//     }
// })

let apiResponse = ref()
const getLists = async () => {

    try {

        loading.value = true;
        const response = await axios.post(`${getSDControllerApiEndpoint()}/vxlan`, {
            method: 'get-config',
            payload: {}
        });

        if (response.data.code === 200) {
            loading.value = false;
            apiResponse.value = response.data.data // Store API response
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
            <NeHeading tag="h3" class="mb-7">{{ t('VXLAN') }}</NeHeading>
        </div>
        <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
            {{ t('Configure VXLAN interfaces, including peer IPs, ports, and VLAN IDs, to enable efficient Layer 2 network extension over IP networks.') }}
        </p>
        <div class="space-y-6">

            <NeInlineNotification kind="error" :title="error.notificationTitle"
                :description="error.notificationDescription" v-if="error.notificationTitle">
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
                    {{ t('standalone.openvpn_warrior.add') }}
                </NeButton>
                <!-- Show table if apiresponse has values -->
                <NeTable cardBreakpoint="md" class="mt-2">
                    <NeTableHead>
                        <NeTableHeadCell>#</NeTableHeadCell>
                        <NeTableHeadCell>Interface Name</NeTableHeadCell>
                        <NeTableHeadCell>Interface</NeTableHeadCell>
                        <NeTableHeadCell>Vid</NeTableHeadCell>
                        <NeTableHeadCell>Peer IP</NeTableHeadCell>
                        <NeTableHeadCell>Port</NeTableHeadCell>
                        <NeTableHeadCell>IP</NeTableHeadCell>
                        <NeTableHeadCell>Service</NeTableHeadCell>
                        <NeTableHeadCell>Status</NeTableHeadCell>
                    </NeTableHead>
                    <NeTableBody>
                        <NeTableRow v-for="(item, index) in apiResponse" :key="index">
                            <NeTableCell>{{ index + 1 }}</NeTableCell>
                            <NeTableCell>{{ item.interface_name }}</NeTableCell>
                            <NeTableCell>{{ item.base_interface }}</NeTableCell>
                            <NeTableCell>{{ item.vid }}</NeTableCell>
                            <NeTableCell>{{ item.peer }}</NeTableCell>
                            <NeTableCell>{{ item.port }}</NeTableCell>
                            <NeTableCell>{{ item.ipaddr }}</NeTableCell>
                            <NeTableCell>{{ item.service }}</NeTableCell>
                            <NeTableCell>{{ item.status }}</NeTableCell>
                            <NeTableCell :data-label="t('common.actions')">
                                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                                    <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                                        @click="openEditModal(item)">
                                        <template #prefix>
                                            <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4"
                                                aria-hidden="true" />
                                        </template>
                                        {{ t('common.edit') }}
                                    </NeButton>
                                    <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                                        @click="openDeleteModal(item)">
                                        <template #prefix>
                                            <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4"
                                                aria-hidden="true" />
                                        </template>
                                        {{ t('common.delete') }}
                                    </NeButton>
                                </div>
                            </NeTableCell>
                        </NeTableRow>
                    </NeTableBody>
                </NeTable>
            </template>
        </div>
    </div>

    <DeleteTunnelModal :visible="showDeleteModal" :itemToDelete="selectedTunnelName" @close="showDeleteModal = false"
        @tunnel-deleted="getLists" />

    <VXLANDrawer :item-to-edit="selectedTunnel" @close="closeModalsAndDrawers" :rule-type="'forward'" :known-tags="[]"
      @tunnel-added="getLists"  @add-edit-tunnel="reloadTunnels" :is-shown="showCreateEditDrawer" />
    <!-- <VXLANEdit :item-to-edit="selectedTunnels" @close="showEditModals = false" :rule-type="'forward'" :known-tags="[]"
        @add-edit-tunnel="reloadTunnels" :is-shown="showEditModals" /> -->

    <VXLANEdit :isShown="showEditModals" :vxlanData="selectedTunnels" @close="showEditModals = false" />

</template>
