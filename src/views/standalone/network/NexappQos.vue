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
    NeTextInput
} from '@nethesis/vue-components'
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'

const loading = ref({ saveRule: false })

const status = ref(false)
const service = ref(false)
const mode = ref('game')
const redistributeConnect = ref(false)
const redistributeStatic = ref(false)
const redistributeKernel = ref(false)

// Dummy initial data
let apiResponse = ref([
    {
        code: 200,
        data: {
            service: 'enable',
            mode: 'custom',
            rule: [
                {
                    rule_service: 'enable',
                    rule_name: 'testname1',
                    protocol: 'udp',
                    dport: '2000',
                    priority: '2',
                    base_interface: 'eth0,eth1'
                },
                {
                    rule_service: 'enable',
                    rule_name: 'testname2',
                    protocol: 'both',
                    dport: '2560-3000',
                    priority: '1',
                    base_interface: 'eth3,eth4'
                }
            ]
        }
    }
])

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

const interfacesAvailable = ref(['eth0', 'eth1', 'eth2', 'eth3', 'eth4']) // Dummy interfaces for checkbox

onMounted(() => {
    getLists()
})

const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/qos`, {
            method: 'get-config',
            payload: {}
        })

        if (response.data.code === 200) {
            // apiResponse.value = response.data.data;
        }
    } catch (err) {
        console.error('Error fetching data:', err)
    }
}

watch(
    () => apiResponse.value,
    (newValue) => {
        let newValues = newValue[0].data
        if (newValue) {
            service.value = newValues.service === 'enable'
            if (newValues.mode === 'custom') {
                mode.value = 'custom'
                modeDetails.value = newValues.rule.map((item: any) => ({
                    rule_name: item.rule_name,
                    protocol: item.protocol,
                    dport: item.dport,
                    base_interface: item.base_interface.split(','),
                    priority: item.priority,
                    service: item.rule_service === 'enable'
                }))
            } else {
                mode.value = newValues.mode
            }
        }
    },
    { deep: true, immediate: true }
)

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

const saveNetworkConfig = async () => {
    loading.value.saveRule = true
    try {
        let payload

        if (mode.value === 'custom') {
            payload = {
                method: 'set-config',
                payload: {
                    service: service.value ? 'enable' : 'disable',
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
                    service: service.value ? 'enable' : 'disable',
                    mode: mode.value
                }
            }
        }

        await axios.post(`${getSDControllerApiEndpoint()}/qos`, payload)
        getLists()
    } catch (err) {
        console.error('Error saving data:', err)
    } finally {
        loading.value.saveRule = false
    }
}
</script>

<template>
    <NeHeading tag="h3" class="mb-7">Nexapp Qos</NeHeading>

    <div class="flex flex-col gap-y-6">
        <div>
            <div class="flex flex-col items-start mb-4">
                <NeToggle v-model="service" label="Service Status" />
            </div>

            <select v-model="mode" class="mb-4">
                <option value="game">game</option>
                <option value="custom">custom</option>
                <option value="meeting">meeting</option>
                <option value="balance">balance</option>
            </select>

            <!-- Show Table Only if mode is custom -->
            <div v-if="mode === 'custom'">
                <!-- Mode Table -->
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
                                <NeTextInput v-model.trim="item.rule_name" placeholder="rule name" />
                            </NeTableCell>
                            <NeTableCell>
                                <select v-model="item.protocol" class="border rounded p-1">
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                    <option value="both">both</option>
                                </select>
                            </NeTableCell>
                            <NeTableCell>
                                <NeTextInput v-model.trim="item.dport" placeholder="dport" />
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
                                <NeTextInput v-model.trim="item.priority" placeholder="priority" />
                            </NeTableCell>
                            <NeTableCell>
                                <NeToggle v-model="item.service" label="Enable" />
                            </NeTableCell>
                            <NeTableCell>
                                <NeButton size="sm" @click="deleteModeDetails(index)">
                                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                                </NeButton>
                            </NeTableCell>
                        </NeTableRow>
                    </NeTableBody>
                </NeTable>
            </div>

            <!-- Save Button -->
            <div class="mt-4 flex justify-end">
                <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
                    Save
                </NeButton>
            </div>
        </div>
    </div>
</template>
