<script setup lang="ts">
import {
    NeHeading,
    NeButton,
    NeTable,
    NeTableHead,
    NeTableHeadCell,
    NeTableBody,
    NeTableRow,
    NeTableCell,
    NeToggle,
    NeTextInput,
    NeCombobox
} from '@nethesis/vue-components'
import { useNotificationsStore } from '../../../stores/notifications'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref({ saveRule: false })
const service = ref(false)
const mode = ref('game') // default mode to 'game'
const modeDetails = ref<
    {
        rule_name: string
        protocol: string
        dport: string
        base_interface: string[]
        priority: string
        service: boolean
    }[]
>([])

const notificationsStore = useNotificationsStore()

const interfacesAvailable = ref(['eth0', 'eth1', 'eth2', 'eth3', 'eth4']) // Dummy interface list

onMounted(() => {
    getLists()
})

const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/qos`, {
            method: 'get-config',
            payload: {}
        })

        if (response.data.code === 200 && response.data.data) {
            const newValues = response.data.data

            service.value = newValues.service === 'enable'
            mode.value = newValues.mode || 'game' // If mode is empty, default to 'game'

            if (newValues.mode === 'custom' && Array.isArray(newValues.rule)) {
                modeDetails.value = newValues.rule.map((item: any) => ({
                    rule_name: item.rule_name || '',
                    protocol: item.protocol || 'tcp',
                    dport: item.dport || '',
                    base_interface: item.base_interface ? item.base_interface.split(',') : [],
                    priority: item.priority || '',
                    service: item.rule_service === 'enable'
                }))
            } else {
                modeDetails.value = []
            }
        }
    } catch (err) {
        console.error('Error fetching data:', err)
    }
}

const addModeDetails = () => {
    modeDetails.value.push({
        rule_name: '',
        protocol: 'tcp',
        dport: '',
        base_interface: [],
        priority: '',
        service: false
    })
}

const deleteModeDetails = (index: number) => {
    modeDetails.value.splice(index, 1)
}

// const saveNetworkConfig = async () => {
//     loading.value.saveRule = true
//     try {
//         let payload

//         if (mode.value === 'custom') {
//             payload = {
//                 method: 'set-config',
//                 payload: {
//                     service: service.value ? 'enable' : 'disable',
//                     mode: 'custom',
//                     rule: modeDetails.value.map((item) => ({
//                         rule_service: item.service ? 'enable' : 'disable',
//                         rule_name: item.rule_name,
//                         protocol: item.protocol,
//                         dport: item.dport,
//                         priority: item.priority,
//                         base_interface: item.base_interface.join(',')
//                     }))
//                 }
//             }
//         } else {
//             payload = {
//                 method: 'set-config',
//                 payload: {
//                     service: service.value ? 'enable' : 'disable',
//                     mode: mode.value
//                 }
//             }
//         }

//         await axios.post(`${getSDControllerApiEndpoint()}/qos`, payload)
//         await getLists() // Refresh data after save
//     } catch (err) {
//         console.error('Error saving data:', err)
//     } finally {
//         loading.value.saveRule = false
//     }
// }

const saveNetworkConfig = async () => {
    loading.value.saveRule = true
    try {
        // Validation: Check for each rule if base_interface is empty
        const invalidRules = modeDetails.value.filter((item) => item.base_interface.length === 0)

        if (mode.value === 'custom' && invalidRules.length > 0) {
            notificationsStore.createNotification({
                title: 'Validation Error',
                description: 'Please select at least one interface for each rule.',
                kind: 'danger'
            })
            loading.value.saveRule = false
            return
        }

        let payload

        if (!service.value) {
            // Service is disabled but you want to send empty values for each modeDetails
            payload = {
                method: 'set-config',
                payload: {
                    service: 'disable',
                    mode: '',
                    rule: modeDetails.value.map(() => ({
                        rule_service: 'disable',
                        rule_name: '',
                        protocol: '',
                        dport: '',
                        priority: '',
                        base_interface: ''
                    }))
                }
            }
        } else if (mode.value === 'custom') {
            payload = {
                method: 'set-config',
                payload: {
                    service: 'enable',
                    mode: 'custom',
                    rule: modeDetails.value.map((item) => ({
                        rule_service: item.service ? 'enable' : 'disable',
                        rule_name: item.rule_name,
                        protocol: item.protocol,
                        dport: item.dport,
                        priority: item.priority,
                        base_interface: item.base_interface.join(',')
                    }))
                }
            }
        } else {
            payload = {
                method: 'set-config',
                payload: {
                    service: 'enable',
                    mode: mode.value
                }
            }
        }

        await axios.post(`${getSDControllerApiEndpoint()}/qos`, payload)
        notificationsStore.createNotification({
            title: 'Success',
            description: 'Configuration saved successfully.',
            kind: 'success'
        })

        await getLists()
    } catch (err) {
        console.error('Error saving data:', err)
    } finally {
        loading.value.saveRule = false
    }
}

</script>

<template>
    <NeHeading tag="h3" class="mb-7">Nexapp QoS</NeHeading>

    <div class="flex flex-col gap-y-6">
        <div class="flex flex-col items-start mb-">
            <NeToggle v-model="service" label="Service Status" />
        </div>
        <p class="mb-4 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
            {{ t('Configure Quality of Service (QoS) settings, including service modes and custom traffic rules to prioritize network traffic.') }}
        </p>
        <template v-if="service">
            <div>
                <div class="w-[300px]">

                    <NeCombobox v-model="mode" :options="[
                    { label: 'game', id: 'game' },
                    { label: 'custom', id: 'custom' },
                    { label: 'meeting', id: 'meeting' },
                    { label: 'balance', id: 'balance' },
                ]" :label="t('Mode')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                    :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                    :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
                    :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />


                    <!-- <label class="block text-sm font-medium mb-1">Mode:</label>
                    <select v-model="mode"
                        class="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-[300px]">
                        <option value="game">game</option>
                        <option value="custom">custom</option>
                        <option value="meeting">meeting</option>
                        <option value="balance">balance</option>
                    </select> -->
                </div>

                <!-- Show Table Only if mode is custom -->
                <div v-if="mode === 'custom'">
                    <div class="flex flex-row items-center justify-between mt-6">
                        <p class="max-w-2xl font-bold text-black dark:text-gray-400">Mode Details</p>
                        <NeButton kind="primary" size="lg" @click="addModeDetails">
                            <template #prefix>
                                <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
                            </template>
                            Add
                        </NeButton>
                    </div>

                    <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Interface Table">
                        <NeTableHead>
                            <NeTableHeadCell>Rule Name</NeTableHeadCell>
                            <NeTableHeadCell>Protocol</NeTableHeadCell>
                            <NeTableHeadCell>Dport</NeTableHeadCell>
                            <NeTableHeadCell>Interface</NeTableHeadCell>
                            <NeTableHeadCell>Priority</NeTableHeadCell>
                            <NeTableHeadCell>Service</NeTableHeadCell>
                            <NeTableHeadCell>Actions</NeTableHeadCell>
                        </NeTableHead>
                        <NeTableBody>
                            <NeTableRow v-for="(item, index) in modeDetails" :key="`new-${index}`">
                                <NeTableCell>
                                    <NeTextInput v-model.trim="item.rule_name" placeholder="Rule name" />
                                </NeTableCell>
                                <NeTableCell>
                                    <select v-model="item.protocol" class="border rounded p-1 w-[70px]">
                                        <option value="tcp">tcp</option>
                                        <option value="udp">udp</option>
                                        <option value="both">both</option>
                                    </select>
                                </NeTableCell>
                                <NeTableCell>
                                    <NeTextInput v-model.trim="item.dport" placeholder="Dport" />
                                </NeTableCell>
                                <NeTableCell>
                                    <div class="flex flex-col gap-1">
                                        <label v-for="intf in interfacesAvailable" :key="intf"
                                            class="flex items-center gap-2">
                                            <input type="checkbox" :value="intf" v-model="item.base_interface"
                                                class="form-checkbox" />
                                            {{ intf }}
                                        </label>
                                    </div>
                                </NeTableCell>
                                <NeTableCell>
                                    <NeTextInput v-model.trim="item.priority" placeholder="Priority" />
                                </NeTableCell>
                                <NeTableCell>
                                    <NeToggle v-model="item.service" label="Enable" />
                                </NeTableCell>
                                <NeTableCell>
                                    <NeButton size="sm" @click="deleteModeDetails(index)">
                                        <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4"
                                            aria-hidden="true" />
                                    </NeButton>
                                </NeTableCell>
                            </NeTableRow>
                        </NeTableBody>
                    </NeTable>
                </div>

            </div>
        </template>
        <div class="mt-4 flex justify-end">
            <!-- Submit button (left aligned) -->
            <div class="flex  flex-col w-[90px]">
                <NeButton class="ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary" size="lg"
                    @click.prevent="saveNetworkConfig()">
                    <template #prefix>
                        <FontAwesomeIcon :icon="faSave" />
                    </template>
                    {{ t('common.save') }}
                </NeButton>
            </div>
            <!-- <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
                Save
            </NeButton> -->
        </div>
    </div>
</template>
