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
    NeComboboxOption,
    NeCombobox
} from '@nethesis/vue-components'
import { useNotificationsStore } from '../../../stores/notifications'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { Add, Delete, Saved, Success } from '@/lib/tost'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref({ saveRule: false, addRuleLoading: false })
const service = ref(false)

const interfaceOptions = ref([]);

interface NetworkOption {
    id: string
    label: string
}

const localNetworksOptions = ref<NetworkOption[]>([])

const supportedProtocols = ref<NeComboboxOption[]>([])

const protocols = ref<NeComboboxOption[]>([])

const mode = ref<NetworkOption[]>([])

const ceil_high = ref('')
const ceil_low = ref('')
const ceil_middle = ref('')
const rate_high = ref('')
const rate_low = ref('')
const rate_middle = ref('')
const total_bandwidth = ref('')

const newMoreDetailsValue = ref<{ name: string, priority: string, protocol: string, rule_service: boolean, dport: [] }[]>([])

const modeDetails = ref<
    {
        rule_name: string
        rule_service: boolean
        protocol: string
        dport: any
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
            mode.value = (newValues.interface || []).map((item: any) => item.ifname)

            // Load new fields if they exist
            ceil_high.value = newValues.ceil_high || ''
            ceil_low.value = newValues.ceil_low || ''
            ceil_middle.value = newValues.ceil_middle || ''
            rate_high.value = newValues.rate_high || ''
            rate_low.value = newValues.rate_low || ''
            rate_middle.value = newValues.rate_middle || ''
            total_bandwidth.value = newValues.total_bandwidth || ''

            const demo = (newValues.up_interface || []).map((item: any) => ({
                label: item.ifname,
                id: item.ifname,
            }));

            localNetworksOptions.value = [...demo]


            const result = newValues.up_interface.map((item: any) => ({
                id: item.ifname,
                label: item.ifname
            }));

            supportedProtocols.value = result


            if (Array.isArray(newValues.rule)) {
                modeDetails.value = newValues.rule.map((item: any) => ({
                    rule_name: item.name || '',
                    protocol: item.protocol || 'tcp',
                    dport: item.dport.map((e: any) => e.port) || '',
                    base_interface: item.base_interface ? item.base_interface.split(',') : [],
                    priority: item.priority || '',
                    rule_service: item.rule_service === 'enable'
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
        rule_service: false,
        protocol: 'tcp',
        dport: '',
        base_interface: [],
        priority: '',
        service: false
    })
}

const saveNetworkConfig = async () => {

    loading.value.saveRule = true
    try {

        let payload = {
            "method": "set-config",
            payload: {
                service: service.value ? 'enable' : 'disable',
                "total_bandwidth": total_bandwidth.value,
                "rate_high": rate_high.value,
                "ceil_high": ceil_high.value,
                "rate_middle": rate_middle.value,
                "ceil_middle": ceil_middle.value,
                "rate_low": rate_low.value,
                "ceil_low": ceil_low.value,
                interface: mode.value.map((item: any) => ({ ifname: item.id }))
            }
        }

        await axios.post(`${getSDControllerApiEndpoint()}/qos`, payload)
        notificationsStore.createNotification({
            title: Success,
            description: Saved,
            kind: 'success'
        })

        await getLists()
    } catch (err) {
        console.error('Error saving data:', err)
    } finally {
        loading.value.saveRule = false
    }
}

const validateRules = () => {
    for (const [index, rule] of modeDetails.value.entries()) {
        if (!rule.rule_name) {
            notificationsStore.createNotification({
                title: 'Validation Error',
                description: `Rule ${index + 1}: Rule name is required.`,
                kind: 'error'
            });
            return false;
        }

        if (!rule.protocol) {
            notificationsStore.createNotification({
                title: 'Validation Error',
                description: `Rule ${index + 1}: Protocol is required.`,
                kind: 'error'
            });
            return false;
        }

        if (!rule.dport || isNaN(rule.dport)) {
            notificationsStore.createNotification({
                title: 'Validation Error',
                description: `Rule ${index + 1}: Dport must be a number.`,
                kind: 'error'
            });
            return false;
        }

        if (!rule.priority) {
            notificationsStore.createNotification({
                title: 'Validation Error',
                description: `Rule ${index + 1}: Priority is required.`,
                kind: 'error'
            });
            return false;
        }

        if (typeof rule.rule_service !== 'boolean') {
            notificationsStore.createNotification({
                title: 'Validation Error',
                description: `Rule ${index + 1}: Rule service must be enabled or disabled.`,
                kind: 'error'
            });
            return false;
        }
    }
    return true;
};


const addRule = async () => {
    loading.value.addRuleLoading = true
    try {

        const isValid = validateRules();
        if (!isValid) return;
        const latestRule = modeDetails.value[modeDetails.value.length - 1];

        const payloadNew = {
            name: latestRule.rule_name,
            rule_service: latestRule.rule_service ? "enable" : "disable",
            protocol: latestRule.protocol,
            dport: [
                {
                    port: latestRule.dport
                }
            ],
            priority: latestRule.priority
        };

        const currentRule = modeDetails.value[0]; // update this to loop through all rules if needed

        const rulesPayload = modeDetails.value.map(item => ({
            rule_service: item.rule_service ? "enable" : "disable",
            name: item.rule_name,
            protocol: item.protocol,
            dport: [
                {
                    port: item.dport
                }
            ],
            priority: item.priority
        }));

        const payload = {
            rule_service: currentRule.rule_service ? "enable" : "disable",
            name: currentRule.rule_name,
            protocol: currentRule.protocol,
            dport: [
                {
                    "port": "5000"
                }
            ],
            priority: currentRule.priority
        };

        const response = await axios.post(`${getSDControllerApiEndpoint()}/qos`, {
            method: "add-config",
            payload: payloadNew,
        });

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: Success,
                description: Add,
                kind: 'success'
            })
            loading.value.addRuleLoading = false

        }
        loading.value.addRuleLoading = false

    } catch (err) {
        loading.value.addRuleLoading = false
    }
}

const addRuleNewApi = async () => {
    try {
        for (const rule of modeDetails.value) {
            const payload = {
                name: rule.rule_name,
                rule_service: rule.rule_service ? "enable" : "disable",
                protocol: rule.protocol,
                dport: [
                    {
                        port: rule.dport
                    }
                ],
                priority: rule.priority
            };

            const response = await axios.post(`${getSDControllerApiEndpoint()}/qos`, {
                method: "add-config",
                payload: payload,
            });

            if (response.data.code !== 200) {
                throw new Error(`Failed to add rule: ${rule.rule_name}`);
            }
        }

        // Show success notification after all rules are sent
        notificationsStore.createNotification({
            title: 'Success',
            description: 'All rules saved successfully.',
            kind: 'success'
        });

    } catch (err) {
        console.error("Error adding rules:", err);
        notificationsStore.createNotification({
            title: 'Error',
            description: 'Failed to save one or more rules.',
            kind: 'error'
        });
    }
};


const deleteRule = async (itemToDelete: string) => {
    try {
        const payload = {
            "name": itemToDelete
        }

        const response = await axios.post(`${getSDControllerApiEndpoint()}/qos`, {
            method: "delete-config",
            payload
        });

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: Success,
                description: Delete,
                kind: 'success'
            });
            getLists()
            close()
        } else {
            throw new Error('Failed to delete configuration.');
        }

    } catch (err) {
    }
}

</script>

<template>
    <NeHeading tag="h3" class="mb-7">Advance QoS</NeHeading>

    <div class="flex flex-col gap-y-6">
        <div class="flex flex-col items-start mb-">
            <NeToggle v-model="service" label="Service Status" />
        </div>
        <p class="mb-4 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
            {{ t('Configure Quality of Service (QoS) settings, including service modes and custom traffic rules') }}
        </p>
        <template v-if="service">
            <div>

                <!-- Total Bandwidth input at the top -->
                <div class="mb-4">
                    <NeTextInput v-model="total_bandwidth" label="Total Bandwidth"
                        placeholder="Enter Total Bandwidth" />
                </div>

                <!-- Two-column layout for rate and ceil values -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Rate column -->
                    <div class="flex flex-col gap-4">
                        <NeTextInput v-model="rate_high" label="Rate High" placeholder="Enter Rate High" />
                        <NeTextInput v-model="rate_middle" label="Rate Middle" placeholder="Enter Rate Middle" />
                        <NeTextInput v-model="rate_low" label="Rate Low" placeholder="Enter Rate Low" />
                    </div>

                    <!-- Ceil column -->
                    <div class="flex flex-col gap-4">
                        <NeTextInput v-model="ceil_high" label="Ceil High" placeholder="Enter Ceil High" />
                        <NeTextInput v-model="ceil_middle" label="Ceil Middle" placeholder="Enter Ceil Middle" />
                        <NeTextInput v-model="ceil_low" label="Ceil Low" placeholder="Enter Ceil Low" />
                    </div>
                </div>

                <div class="w-[300px] mt-8">
                    <NeCombobox multiple v-model="mode" :options="localNetworksOptions" value-key="id" label-key="label"
                        :label="$t('Interface')" class="grow" :noResultsLabel="$t('ne_combobox.no_results')"
                        :limitedOptionsLabel="$t('ne_combobox.limited_options_label')"
                        :noOptionsLabel="$t('ne_combobox.no_options_label')"
                        :selected-label="$t('ne_combobox.selected')"
                        :user-input-label="$t('ne_combobox.user_input_label')" :optionalLabel="$t('common.optional')" />

                    <!-- Display the selected values in a clean array -->
                    <p class="flex flex-wrap gap-2 mt-2 text-gray-700">
                        <span v-for="(item, index) in mode" :key="index"
                            class="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 border border-blue-300 rounded-full me-2">
                            {{ typeof item === 'object' ? item.label : item }}
                        </span>
                    </p>

                </div>
                <!-- <NeCombobox :label="t('standalone.port_forward.protocols')"
                    :helper-text="t('standalone.port_forward.protocol_helper')" :multiple="true"
                    :options="supportedProtocols" v-model="protocols"
                    :placeholder="t('standalone.port_forward.choose_protocol')"
                    :noResultsLabel="t('ne_combobox.no_results')"
                    :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                    :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
                    :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')"
                    ref="protocolsRef" /> -->




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
        </div>

        <template v-if="service">

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
                            <NeCombobox v-model="item.protocol" :options="[
                                { label: 'udp', id: 'udp' },
                                { label: 'tcp', id: 'tcp' },
                                { label: 'any', id: 'any' }
                            ]" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                                :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                                :noOptionsLabel="t('ne_combobox.no_options_label')"
                                :selected-label="t('ne_combobox.selected')"
                                :user-input-label="t('ne_combobox.user_input_label')"
                                :optionalLabel="t('common.optional')" />
                            <!-- <select v-model="item.protocol" class="border rounded p-1 w-[70px]">
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                    <option value="both">both</option>
                                </select> -->
                        </NeTableCell>
                        <NeTableCell>
                            <NeTextInput v-model.trim="item.dport" placeholder="Dport" />
                        </NeTableCell>
                        <NeTableCell>
                            <!-- <NeTextInput v-model.trim="item.priority" placeholder="Priority" /> -->
                            <NeCombobox v-model="item.priority" :options="[
                                { label: 'low', id: 'low' },
                                { label: 'middle', id: 'middle' },
                                { label: 'high', id: 'high' }
                            ]" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                                :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                                :noOptionsLabel="t('ne_combobox.no_options_label')"
                                :selected-label="t('ne_combobox.selected')"
                                :user-input-label="t('ne_combobox.user_input_label')"
                                :optionalLabel="t('common.optional')" />
                        </NeTableCell>
                        <NeTableCell>
                            <NeToggle v-model="item.rule_service" label="Enable" />
                        </NeTableCell>
                        <NeTableCell>
                            <NeButton size="sm" @click="deleteRule(item.rule_name)">
                                <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                            </NeButton>
                        </NeTableCell>
                    </NeTableRow>
                </NeTableBody>
            </NeTable>

            <div class="mt-4 flex justify-end">
                <!-- Submit button (left aligned) -->
                <div class="flex  flex-col w-[110px]">
                    <NeButton class="ml-1" :disabled="loading.addRuleLoading" :loading="loading.addRuleLoading"
                        kind="primary" size="lg" @click.prevent="addRule()">
                        <template #prefix>
                            <FontAwesomeIcon :icon="faSave" />
                        </template>
                        {{ t('Add Rule') }}
                    </NeButton>
                </div>
            </div>
        </template>
    </div>
</template>
