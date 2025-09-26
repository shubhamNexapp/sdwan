<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
    NeHeading,
    NeButton,
    NeInlineNotification,
    NeSkeleton,
    NeTable,
    NeTableHead,
    NeTableHeadCell,
    NeTableBody,
    NeTableRow,
    NeTableCell,
} from '@nethesis/vue-components'
import { computed, onMounted, ref } from 'vue'
import RuleDeleteModal from './RuleDeleteDrawer.vue'
import KeywordDeleteModal from './KeywordDeleteModal.vue'
import AddRuleDrawer from './AddRuleDrawer.vue'
import AddKeyWordDrawer from './AddKeywordDrawer.vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { nextTick } from 'vue'

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

export type KeywordTunnel = {
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

const loading = ref(true)
const selectedTunnel = ref<IpsecTunnel | null>(null)
const showCreateEditDrawer = ref(false)
const showKeywordDrawer = ref(false)
const selectKeywordTunnel = ref<KeywordTunnel | null>(null)
const showDeleteModal = ref(false)
const showKeywordDeleteModal = ref(false)

const error = ref({
    notificationTitle: '',
    notificationDescription: '',
    notificationDetails: ''
})


function openCreateEditDrawer(itemToEdit: IpsecTunnel | null) {
    selectedTunnel.value = itemToEdit
    showCreateEditDrawer.value = true
}

function openKeywordDrawer(itemToEdit: KeywordTunnel | null) {
    selectKeywordTunnel.value = itemToEdit
    showKeywordDrawer.value = true
}

const selectedTunnelName = ref<string | null>(null);
const selectedTunnelKeywordName = ref<string | null>(null);

async function openDeleteModal(tunnelName: any) {
    selectedTunnelName.value = tunnelName
    await nextTick()
    showDeleteModal.value = true
}

async function openKeywordDeleteModal(tunnelName: any) {
    selectedTunnelKeywordName.value = tunnelName
    await nextTick()
    showKeywordDeleteModal.value = true
}

function closeModalsAndDrawers() {
    selectedTunnel.value = null
    showDeleteModal.value = false
    showCreateEditDrawer.value = false
}

function closeKeywordDrawer() {
    selectKeywordTunnel.value = null
    showKeywordDeleteModal.value = false
    showKeywordDrawer.value = false
}

onMounted(() => {
    getLists()
})

let apiResponse = ref()
const getLists = async () => {

    try {

        loading.value = true;
        const response = await axios.post(`${getSDControllerApiEndpoint()}/rspamd`, {
            method: 'get-config',
            payload: {}
        });

        if (response.data.code === 200) {
            loading.value = false;
            apiResponse.value = response.data.data
        }
    } catch (err) {
        loading.value = false;
    }
    loading.value = false;
};

const whiteList = computed(() => {
    return apiResponse.value?.credit?.filter((item: any) => item.listname === 'trusted_domains') || []
})

const blackList = computed(() => {
    return apiResponse.value?.credit?.filter((item: any) => item.listname === 'blocked_domains') || []
})

</script>

<template>
    <div class="flex flex-col">
        <div class="space-y-6">
            <NeInlineNotification kind="error" :title="error.notificationTitle"
                :description="error.notificationDescription" v-if="error.notificationTitle">
                <template v-if="error.notificationDetails">
                    {{ error.notificationDetails }}
                </template>
            </NeInlineNotification>

            <NeSkeleton v-if="loading" :lines="8" size="lg" />

            <template v-else>

                <NeButton class="justify-end" kind="primary" @click="openCreateEditDrawer(null)">
                    <template #prefix>
            <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4 mt-1" aria-hidden="true" />
          </template>
                    {{ t('Add Rule') }}
                </NeButton>

                <h1><b>White List</b></h1>
                <NeTable cardBreakpoint="md" class="mt-2">
                    <NeTableHead>
                        <NeTableHeadCell>#</NeTableHeadCell>
                        <NeTableHeadCell>Rule Name</NeTableHeadCell>
                        <NeTableHeadCell>Domain</NeTableHeadCell>
                        <NeTableHeadCell>Listname</NeTableHeadCell>
                        <NeTableHeadCell>Service</NeTableHeadCell>
                        <NeTableHeadCell></NeTableHeadCell>
                    </NeTableHead>
                    <NeTableBody>
                        <!-- <NeTableRow v-for="(item, index) in apiResponse.credit" :key="index"> -->
                        <NeTableRow v-for="(item, index) in whiteList" :key="index">
                            <NeTableCell>{{ index + 1 }}</NeTableCell>
                            <NeTableCell>{{ item.rule_name }}</NeTableCell>
                            <NeTableCell>{{ item.domain }}</NeTableCell>
                            <NeTableCell>{{ item.listname }}</NeTableCell>
                            <NeTableCell>{{ item.service }}</NeTableCell>
                            <NeTableCell :data-label="t('common.actions')">
                                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                                    <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                                        @click="openDeleteModal(item)">
                                        <template>
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

                <h1><b>Black List</b></h1>
                <NeTable cardBreakpoint="md" class="mt-2">
                    <NeTableHead>
                        <NeTableHeadCell>#</NeTableHeadCell>
                        <NeTableHeadCell>Rule Name</NeTableHeadCell>
                        <NeTableHeadCell>Domain</NeTableHeadCell>
                        <NeTableHeadCell>Listname</NeTableHeadCell>
                        <NeTableHeadCell>Service</NeTableHeadCell>
                        <NeTableHeadCell></NeTableHeadCell>
                    </NeTableHead>
                    <NeTableBody>
                        <!-- <NeTableRow v-for="(item, index) in apiResponse.credit" :key="index"> -->
                        <NeTableRow v-for="(item, index) in blackList" :key="index">
                            <NeTableCell>{{ index + 1 }}</NeTableCell>
                            <NeTableCell>{{ item.rule_name }}</NeTableCell>
                            <NeTableCell>{{ item.domain }}</NeTableCell>
                            <NeTableCell>{{ item.listname }}</NeTableCell>
                            <NeTableCell>{{ item.service }}</NeTableCell>
                            <NeTableCell :data-label="t('common.actions')">
                                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                                    <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                                        @click="openDeleteModal(item)">
                                        <template>
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

                <NeButton class="justify-end" kind="primary" @click="openKeywordDrawer(null)">
                    <template #prefix>
            <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4 mt-1" aria-hidden="true" />
          </template>
                    {{ t('Add Keyword') }}
                </NeButton>
                <!-- Show table if apiresponse has values -->
                <NeTable cardBreakpoint="md" class="mt-2">
                    <NeTableHead>
                        <NeTableHeadCell>#</NeTableHeadCell>
                        <NeTableHeadCell>Rule Name</NeTableHeadCell>
                        <NeTableHeadCell>Score</NeTableHeadCell>
                        <NeTableHeadCell>Filter Type</NeTableHeadCell>
                        <NeTableHeadCell>Keyword</NeTableHeadCell>
                        <NeTableHeadCell>Service</NeTableHeadCell>
                        <NeTableHeadCell></NeTableHeadCell>
                    </NeTableHead>
                    <NeTableBody>
                        <NeTableRow v-for="(item, index) in apiResponse.keyword_filtering" :key="index">
                            <NeTableCell>{{ index + 1 }}</NeTableCell>
                            <NeTableCell>{{ item.rule_name }}</NeTableCell>
                            <NeTableCell>{{ item.score }}</NeTableCell>
                            <NeTableCell>{{ item.listname }}</NeTableCell>
                            <NeTableCell>
                                <!-- Display keywords comma separated -->
                                {{item.words.map((wordObj: any) => wordObj.word).join(', ')}}
                            </NeTableCell>
                            <NeTableCell>{{ item.service }}</NeTableCell>
                            <NeTableCell :data-label="t('common.actions')">
                                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                                    <NeButton kind="tertiary" size="lg" :disabled="item.readonly"
                                        @click="openKeywordDeleteModal(item)">
                                        <template>
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

    <AddRuleDrawer :item-to-edit="selectedTunnel" @close="closeModalsAndDrawers" :rule-type="'forward'" :known-tags="[]"
        @tunnel-added="getLists" :is-shown="showCreateEditDrawer" />

    <RuleDeleteModal :visible="showDeleteModal" :itemToDelete="selectedTunnelName" @close="showDeleteModal = false"
        @tunnel-deleted="getLists" />

    <AddKeyWordDrawer :item-to-edit="selectedTunnel" @close="closeKeywordDrawer" :rule-type="'forward'" :known-tags="[]"
        @tunnel-added="getLists" :is-shown="showKeywordDrawer" />

    <KeywordDeleteModal :visible="showKeywordDeleteModal" :itemToDelete="selectedTunnelKeywordName"
        @close="showKeywordDeleteModal = false" @tunnel-deleted="getLists" />

</template>
