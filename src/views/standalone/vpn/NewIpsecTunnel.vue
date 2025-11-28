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
import DeleteTunnelModal from '@/components/standalone/ipsec_tunnel/NewIpsecDeleteTunnelModal.vue'
import NewIpsecCreateEditDrawer from '@/components/standalone/ipsec_tunnel/NewIpsecCreateEditDrawer.vue'
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
// use any | null so we can pass phase objects directly to the drawer
const selectedTunnel = ref<any | null>(null)
const showCreateEditDrawer = ref(false)
const showDeleteModal = ref(false)
const fetchTunnelsIntervalId = ref(0)

const error = ref({
    notificationTitle: '',
    notificationDescription: '',
    notificationDetails: ''
})

function openCreateEditDrawer(itemToEdit: any | null) {
    selectedTunnel.value = itemToEdit
    showCreateEditDrawer.value = true
}

const selectedTunnelName = ref<string | null>(null)

function openDeleteModal(tunnelName: string) {
    selectedTunnelName.value = tunnelName
    showDeleteModal.value = true
}

const selectedTunnels = ref()
const showEditModals = ref(false)

function openEditModal(tunnel: object) {
    selectedTunnels.value = tunnel
    showEditModals.value = true
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
    getLists()
})

const apiResponse = ref<any[]>([])

// new refs for phase-wise data
const phase1Data = ref<any | null>(null)
const phase2Data = ref<any | null>(null)
const phase3Data = ref<any | null>(null)

const getLists = async () => {
    try {
        loading.value = true
        const response = await axios.post(`${getSDControllerApiEndpoint()}/ipsec`, {
            method: 'get-config',
            payload: {}
        })

        if (response.data.code === 200) {
            const result = response.data.data
            loading.value = false

            // store whole data if needed
            apiResponse.value = Array.isArray(result) ? result : [result]

            // extract phase array and split by select value
            const phases = Array.isArray(result.phase) ? result.phase : []

            phase1Data.value = phases.find((p: any) => p.select === 'phase1') || null
            phase2Data.value = phases.find((p: any) => p.select === 'phase2') || null
            phase3Data.value = phases.find((p: any) => p.select === 'phase3') || null
        }
    } catch (err: any) {
        loading.value = false
        error.value.notificationTitle = 'Cannot retrieve IPsec configuration'
        error.value.notificationDescription = getAxiosErrorMessage(err)
        error.value.notificationDetails = String(err)
    }
    loading.value = false
}

// ---- edit helpers (open drawer with that phase) ----
const editPhase = (phaseKey: 'phase1' | 'phase2' | 'phase3') => {
    if (phaseKey === 'phase1' && phase1Data.value) {
        openCreateEditDrawer(phase1Data.value)
    } else if (phaseKey === 'phase2' && phase2Data.value) {
        openCreateEditDrawer(phase2Data.value)
    } else if (phaseKey === 'phase3' && phase3Data.value) {
        openCreateEditDrawer(phase3Data.value)
    }
}

// ---- delete helpers (open modal with policy_name) ----
const confirmDeletePhase = (phaseKey: 'phase1' | 'phase2' | 'phase3') => {
    if (phaseKey === 'phase1' && phase1Data.value) {
        openDeleteModal(phase1Data.value.policy_name)
    } else if (phaseKey === 'phase2' && phase2Data.value) {
        openDeleteModal(phase2Data.value.policy_name)
    } else if (phaseKey === 'phase3' && phase3Data.value) {
        openDeleteModal(phase3Data.value.policy_name)
    }
}
</script>

<template>
    <div class="flex flex-col">
        <div class="space-y-6">
            <NeInlineNotification kind="error" :title="error.notificationTitle"
                :description="error.notificationDescription" v-if="error.notificationTitle">
                <template #details v-if="error.notificationDetails">
                    {{ error.notificationDetails }}
                </template>
            </NeInlineNotification>

            <NeSkeleton v-if="loading" :lines="8" size="lg" />

            <template v-else>
                <NeButton kind="primary" @click="openCreateEditDrawer(null)">
                    <template #prefix>
                        <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4 mt-1" aria-hidden="true" />
                    </template>
                    {{ t('Add') }}
                </NeButton>

                <!-- ==================== PHASE 1 TABLE ==================== -->
                <NeHeading tag="h4" class="mt-4 mb-2">
                    Phase 1
                </NeHeading>
                <NeTable cardBreakpoint="md" class="mt-2">
                    <NeTableHead>
                        <NeTableHeadCell>Policy Name</NeTableHeadCell>
                        <NeTableHeadCell>Initiate Mode</NeTableHeadCell>
                        <NeTableHeadCell>Hash</NeTableHeadCell>
                        <NeTableHeadCell>IKE</NeTableHeadCell>
                        <NeTableHeadCell>Pre-Shared Key</NeTableHeadCell>
                        <NeTableHeadCell>Self Identify</NeTableHeadCell>
                        <NeTableHeadCell>Match Identify</NeTableHeadCell>
                        <NeTableHeadCell>IKE Lifetime</NeTableHeadCell>
                        <NeTableHeadCell>Group Name</NeTableHeadCell>
                        <NeTableHeadCell>DPD Service</NeTableHeadCell>
                        <NeTableHeadCell>DPD Delay</NeTableHeadCell>
                        <NeTableHeadCell>DPD Retry Times</NeTableHeadCell>
                        <NeTableHeadCell>Actions</NeTableHeadCell>
                    </NeTableHead>
                    <NeTableBody>
                        <NeTableRow v-if="phase1Data">
                            <NeTableCell>{{ phase1Data.policy_name }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.initiate_mode }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.hash }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.ike }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.pre_share_key }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.self_identify }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.match_identify }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.ike_lifetime }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.group_name }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.dpd_service }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.dpd_delay }}</NeTableCell>
                            <NeTableCell>{{ phase1Data.dpd_retry_times }}</NeTableCell>
                            <NeTableCell>
                                <div class="flex gap-2">
                                    <NeButton kind="tertiary" size="lg" @click="editPhase('phase1')">
                                        {{ t('common.edit') }}
                                    </NeButton>
                                    <NeButton kind="tertiary" size="lg" @click="confirmDeletePhase('phase1')">
                                        {{ t('common.delete') }}
                                    </NeButton>
                                </div>
                            </NeTableCell>
                        </NeTableRow>
                    </NeTableBody>
                </NeTable>

                <!-- ==================== PHASE 2 TABLE ==================== -->
                <NeHeading tag="h4" class="mt-6 mb-2">
                    Phase 2
                </NeHeading>
                <NeTable cardBreakpoint="md" class="mt-2">
                    <NeTableHead>
                        <NeTableHeadCell>Policy Name</NeTableHeadCell>
                        <NeTableHeadCell>Hash</NeTableHeadCell>
                        <NeTableHeadCell>PFS</NeTableHeadCell>
                        <NeTableHeadCell>Group Name</NeTableHeadCell>
                        <NeTableHeadCell>Lifetime</NeTableHeadCell>
                        <NeTableHeadCell>Local Protoport</NeTableHeadCell>
                        <NeTableHeadCell>Remote Protoport</NeTableHeadCell>
                        <!-- <NeTableHeadCell>Encryption Algorithm</NeTableHeadCell> -->
                        <NeTableHeadCell>Transport Mode</NeTableHeadCell>
                        <NeTableHeadCell>Local Subnet</NeTableHeadCell>
                        <NeTableHeadCell>Remote Subnet(s)</NeTableHeadCell>
                        <NeTableHeadCell>Actions</NeTableHeadCell>
                    </NeTableHead>
                    <NeTableBody>
                        <NeTableRow v-if="phase2Data">
                            <NeTableCell>{{ phase2Data.policy_name }}</NeTableCell>
                            <NeTableCell>{{ phase2Data.hash }}</NeTableCell>
                            <NeTableCell>{{ phase2Data.pfs }}</NeTableCell>
                            <NeTableCell>{{ phase2Data.group_name }}</NeTableCell>
                            <NeTableCell>{{ phase2Data.lifetime }}</NeTableCell>
                            <NeTableCell>{{ phase2Data.local_protoport }}</NeTableCell>
                            <NeTableCell>{{ phase2Data.remote_protoport }}</NeTableCell>
                            <!-- <NeTableCell>{{ phase2Data.encryption_algorithm }}</NeTableCell> -->
                            <NeTableCell>{{ phase2Data.transport_mode }}</NeTableCell>
                            <NeTableCell>{{ phase2Data.local_subnet }}</NeTableCell>
                            <NeTableCell>
                                {{
                                    phase2Data.remote_subnet && Array.isArray(phase2Data.remote_subnet)
                                        ? phase2Data.remote_subnet.map((r: any) => r.subnet).join(', ')
                                        : ''
                                }}
                            </NeTableCell>
                            <NeTableCell>
                                <div class="flex gap-2">
                                    <NeButton kind="tertiary" size="lg" @click="editPhase('phase2')">
                                        {{ t('common.edit') }}
                                    </NeButton>
                                    <NeButton kind="tertiary" size="lg" @click="confirmDeletePhase('phase2')">
                                        {{ t('common.delete') }}
                                    </NeButton>
                                </div>
                            </NeTableCell>
                        </NeTableRow>
                    </NeTableBody>
                </NeTable>

                <!-- ==================== PHASE 3 TABLE ==================== -->
                <NeHeading tag="h4" class="mt-6 mb-2">
                    Phase 3
                </NeHeading>
                <NeTable cardBreakpoint="md" class="mt-2">
                    <NeTableHead>
                        <NeTableHeadCell>Policy Name</NeTableHeadCell>
                        <NeTableHeadCell>Match Phase 1</NeTableHeadCell>
                        <NeTableHeadCell>Match Phase 2</NeTableHeadCell>
                        <NeTableHeadCell>Destination IP/Domain</NeTableHeadCell>
                        <NeTableHeadCell>Encrypt Interface</NeTableHeadCell>
                        <NeTableHeadCell>Connect Status</NeTableHeadCell>
                        <NeTableHeadCell>Status Local Subnet</NeTableHeadCell>
                        <NeTableHeadCell>Status Remote Subnet(s)</NeTableHeadCell>
                        <NeTableHeadCell>Actions</NeTableHeadCell>
                    </NeTableHead>
                    <NeTableBody>
                        <NeTableRow v-if="phase3Data">
                            <NeTableCell>{{ phase3Data.policy_name }}</NeTableCell>
                            <NeTableCell>{{ phase3Data.match_phase1 }}</NeTableCell>
                            <NeTableCell>{{ phase3Data.match_phase2 }}</NeTableCell>
                            <NeTableCell>{{ phase3Data.destination_ip_or_domain }}</NeTableCell>
                            <NeTableCell>{{ phase3Data.encrypt_interface }}</NeTableCell>
                            <NeTableCell>{{ phase3Data.connect_status }}</NeTableCell>
                            <NeTableCell>{{ phase3Data.local_subnet }}</NeTableCell>
                            <NeTableCell>
                                {{
                                    phase3Data.status && Array.isArray(phase3Data.status.remote_subnet)
                                        ? phase3Data.status.remote_subnet
                                            .map((r: any) => r.subnet || '')
                                            .filter((s: string) => s)
                                            .join(', ')
                                        : ''
                                }}
                            </NeTableCell>
                            <NeTableCell>
                                <div class="flex gap-2">
                                    <NeButton kind="tertiary" size="lg" @click="editPhase('phase3')">
                                        {{ t('common.edit') }}
                                    </NeButton>
                                    <NeButton kind="tertiary" size="lg" @click="confirmDeletePhase('phase3')">
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

    <!-- delete modal for IPsec -->
    <DeleteTunnelModal :visible="showDeleteModal" :itemToDelete="selectedTunnelName" @close="showDeleteModal = false"
        @tunnel-deleted="getLists" />

    <!-- drawer: add / edit IPsec phases -->
    <NewIpsecCreateEditDrawer :item-to-edit="selectedTunnel" @close="closeModalsAndDrawers" :rule-type="'forward'" :known-tags="[]"
        @add-edit-tunnel="reloadTunnels" :is-shown="showCreateEditDrawer" />

   </template>
