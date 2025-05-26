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
    NeCombobox,
    NeTooltip
} from '@nethesis/vue-components'
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { useNotificationsStore } from '@/stores/notifications'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

import { useI18n } from "vue-i18n";

interface Neighbour {
    name: string;
    priority: string;
    port: string;
    protocol: string;
}

const { t } = useI18n()

const loading = ref({ saveRule: false, moreDetails: false })

const notificationsStore = useNotificationsStore()

const service = ref(false);
const status = ref("");

const interfaceName = ref("");
const checkIP = ref("");
const gateway = ref("");
const interval = ref("");
const retry = ref("");
const delay = ref("");
const packetLoss = ref("");

const backup_interfaceName = ref("");
const backup_checkIP = ref("");
const backup_gateway = ref("");
const backup_interval = ref("");
const backup_retry = ref("");
const backup_delay = ref("");
const backup_packetLoss = ref("");

const interfaceOptions = ref([]);

let apiResponse = ref()
const moreDetails = ref<{ name: string, priority: string, port: string, protocol: string, }[]>([])
const errorBag = ref<{ [key: string]: string }>({})


watch(
    () => apiResponse.value,
    (newValue) => {
        if (newValue) {
            service.value = newValue.service === 'enable';

            // Main Values 
            interfaceName.value = newValue.main.ifname
            checkIP.value = newValue.main.check_ip
            gateway.value = newValue.main.gateway
            interval.value = newValue.main.interval
            retry.value = newValue.main.retry
            delay.value = newValue.main.delay
            packetLoss.value = newValue.main.packet_loss

            // Backup Values 
            backup_interfaceName.value = newValue.backup.ifname
            backup_checkIP.value = newValue.backup.check_ip
            backup_gateway.value = newValue.backup.gateway
            backup_interval.value = newValue.backup.interval
            backup_retry.value = newValue.backup.retry
            backup_delay.value = newValue.backup.delay
            backup_packetLoss.value = newValue.backup.packet_loss

            moreDetails.value = newValue.rule || [];

            // Interface options (converted to dropdown format)
            interfaceOptions.value = (newValue.up_interface || []).map((item: any) => ({
                label: item.ifname,
                id: item.ifname,
            }));

        }
    },
    { immediate: true }
);

onMounted(() => {
    getLists();
});

const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/loadbalance`, {
            method: 'get-config',
            payload: {}
        });
        if (response.data.code === 200) {
            apiResponse.value = response.data.data;

        }
    } catch (err) {
        console.error("Error fetching data:", err);
    }
};

const addDetails = () => {
    moreDetails.value.push({ name: '', priority: '', port: '', protocol: '' });
};

// const deleteDetails = (index: number) => {
//     moreDetails.value.splice(index, 1);
// };

// Function to allow only letters in string fields
const onlyLetters = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '') // Allow only letters and spaces
}

// Function to allow only numbers in number fields
const onlyNumbers = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '') // Allow only numbers
}

const ipInputHandler = (event: Event) => {
    const input = event.target as HTMLInputElement;
    // Allow numbers and dots, and remove other characters
    input.value = input.value.replace(/[^0-9./]/g, '');
    // Limit to max 128 characters
    if (input.value.length > 128) {
        input.value = input.value.slice(0, 128);
    }
};

// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) { // Validate only if enabled

        if (!interfaceName.value.trim()) {
            errorBag.value.interfaceName = "Interface name is required"
        }

        if (!backup_interfaceName.value.trim()) {
            errorBag.value.backup_interfaceName = "Interface name is required"
        }

        if (!checkIP.value.trim()) {
            errorBag.value.checkIP = "Check ip is required"
        }

        if (!backup_checkIP.value.trim()) {
            errorBag.value.backup_checkIP = "Check ip is required"
        }

        // ✅ Add this to ensure they are different
        if (
            checkIP.value.trim() &&
            backup_checkIP.value.trim() &&
            checkIP.value.trim() === backup_checkIP.value.trim()
        ) {
            errorBag.value.backup_checkIP = "Backup Check IP and Check IP are not same.";
        }

        if (!gateway.value.trim()) {
            errorBag.value.gateway = "Gateway is required"
        }

        if (!backup_gateway.value.trim()) {
            errorBag.value.backup_gateway = "Gateway is required"
        }

        const intervalInt = Number(interval.value)
        if (!interval.value.trim() || isNaN(intervalInt) || intervalInt < 1 || intervalInt > 65535) {
            errorBag.value.interval = "Interval must be between 1 and 65535."
        }

        const backupintervalInt = Number(backup_interval.value)
        if (!backup_interval.value.trim() || isNaN(backupintervalInt) || backupintervalInt < 1 || backupintervalInt > 65535) {
            errorBag.value.backup_interval = "Interval must be between 1 and 65535."
        }

        const retryInt = Number(retry.value)
        if (!retry.value.trim() || isNaN(retryInt) || retryInt < 1 || retryInt > 65535) {
            errorBag.value.retry = "Retry must be between 1 and 65535."
        }

        const backupretryInt = Number(backup_retry.value)
        if (!backup_retry.value.trim() || isNaN(backupretryInt) || backupretryInt < 1 || backupretryInt > 65535) {
            errorBag.value.backup_retry = "Retry must be between 1 and 65535."
        }

        const delayInt = Number(delay.value)
        if (!delay.value.trim() || isNaN(delayInt) || delayInt < 1 || delayInt > 65535) {
            errorBag.value.delay = "Delay must be between 1 and 65535."
        }

        const backupdelayInt = Number(backup_delay.value)
        if (!backup_delay.value.trim() || isNaN(backupdelayInt) || backupdelayInt < 1 || backupdelayInt > 65535) {
            errorBag.value.backup_delay = "Delay must be between 1 and 65535."
        }

        const packetInt = Number(packetLoss.value);
        if (
            !packetLoss.value.trim() ||
            isNaN(packetInt) ||
            packetInt < 10 ||
            packetInt > 100
        ) {
            errorBag.value.packetLoss = "Packet loss must be between 10 and 100.";
        }

        const backupacketInt = Number(backup_packetLoss.value);
        if (
            !backup_packetLoss.value.trim() ||
            isNaN(backupacketInt) ||
            backupacketInt < 10 ||
            backupacketInt > 100
        ) {
            errorBag.value.backup_packetLoss = "Packet loss must be between 10 and 100.";
        }

    }

    return Object.keys(errorBag.value).length === 0
}

const saveNetworkConfig = async () => {
    if (!validate()) return
    loading.value.saveRule = true;
    try {
        const payload = {
            method: "set-config",
            "payload": {
                service: service.value ? "enable" : "disable",
                "main": {
                    "ifname": interfaceName.value,
                    "check_ip": checkIP.value,
                    "gateway": gateway.value,
                    "interval": interval.value,
                    "retry": retry.value,
                    "delay": delay.value,
                    "packet_loss": packetLoss.value
                },
                "backup": {
                    "ifname": backup_interfaceName.value,
                    "check_ip": backup_checkIP.value,
                    "gateway": backup_gateway.value,
                    "interval": backup_interval.value,
                    "retry": backup_retry.value,
                    "delay": backup_delay.value,
                    "packet_loss": backup_packetLoss.value
                }
            }
        };

        await axios.post(`${getSDControllerApiEndpoint()}/loadbalance`, payload);
        // getLists(); // Refresh list after saving
        notificationsStore.createNotification({
            title: 'Success',
            description: 'Configuration saved successfully.',
            kind: 'success'
        })
    } catch (err) {
        console.error("Error saving data:", err);
    } finally {
        loading.value.saveRule = false;
    }
};

const saveMoreDetails = async () => {
    loading.value.moreDetails = true;
    try {
        // Validate all fields
        const hasInvalid = moreDetails.value.some(item =>
            !item.name?.trim() || !item.priority || !item.port?.trim() || !item.protocol
        );

        if (hasInvalid) {
            notificationsStore.createNotification({
                title: 'Validation Error',
                description: 'All fields (name, priority, port, protocol) are required.',
                kind: 'error'
            });
            loading.value.moreDetails = false;
            return;
        }

        // Remove duplicates if needed
        const cleanDetails = moreDetails.value.filter(
            (item, index, self) =>
                index === self.findIndex(t =>
                    t.name === item.name &&
                    t.port === item.port &&
                    t.priority === item.priority &&
                    t.protocol === item.protocol
                )
        );

        const payload = {
            method: "add-config",
            payload: {
                name: cleanDetails.map(e => e.name).join(','),
                priority: cleanDetails.map(e => e.priority).join(','),
                port: cleanDetails.map(e => e.port).join(','),
                protocol: cleanDetails.map(e => e.protocol).join(','),
            }
        };

        await axios.post(`${getSDControllerApiEndpoint()}/loadbalance`, payload);
        getLists();

        notificationsStore.createNotification({
            title: 'Success',
            description: 'Configuration saved successfully.',
            kind: 'success'
        });

    } catch (err) {
        console.error("Error saving data:", err);
    } finally {
        loading.value.moreDetails = false;
    }
};


const deleteDetails = async (item: any) => {
    try {
        const payload = {
            method: "delete-config",
            "payload": {
                "name": item
            }
        };

        await axios.post(`${getSDControllerApiEndpoint()}/loadbalance`, payload);
        getLists(); // Refresh list after saving
        notificationsStore.createNotification({
            title: 'Success',
            description: 'Configuration deleted successfully.',
            kind: 'success'
        })
    } catch (err) {
        console.error("Error delete data:", err);
    } finally {
    }
};

</script>

<template>
    <NeHeading tag="h3" class="mb-4">Load Balance</NeHeading>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
        {{ t('Configure RIP service settings, including redistribution of connected, static, and kernel routes, as ') }}
    </p>
    <!-- <NeToggle v-model="service" label="RIP Service" /> -->
    <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service Status'" />

    <template v-if="service">
        <div class="flex flex-col gap-y-6">
            <div>
                <div class="flex flex-col items-start mb-4">
                    <div class="w-full flex flex-col gap-1 mt-4">
                        <div class="flex items-center gap-2">
                            <label class="mr-2">Status:</label>
                            <span :class="status">
                                <b>{{ apiResponse.status }}</b>
                            </span>
                        </div>
                    </div>
                </div>


                <div class="flex flex-col gap-y-3">
                    <p class="max-w-2xl font-bold text-black dark:text-gray-400">Main</p>

                    <div>
                        <NeCombobox v-model="interfaceName" :options="interfaceOptions" :label="t('Interface Name')"
                            class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                            :noOptionsLabel="t('ne_combobox.no_options_label')"
                            :selected-label="t('ne_combobox.selected')"
                            :user-input-label="t('ne_combobox.user_input_label')"
                            :optionalLabel="t('common.optional')" />


                    </div>

                    <NeTextInput @input="ipInputHandler" v-model="checkIP" :label="t('Check IP')"
                        :placeholder="t('Enter Check IP')" :invalidMessage="errorBag.checkIP">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput v-model="gateway" :label="t('Gateway')" :placeholder="t('Enter Gateway')"
                        :invalidMessage="errorBag.gateway">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="interval" :label="t('Interval')"
                        :placeholder="t('Enter interval')" :invalidMessage="errorBag.interval">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="retry" :label="t('Retry')"
                        :placeholder="t('Enter Retry')" :invalidMessage="errorBag.retry">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="delay" :label="t('Delay')"
                        :placeholder="t('Enter Delay')" :invalidMessage="errorBag.delay">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="packetLoss" :label="t('Packet Loss')"
                        :placeholder="t('Enter Packet Loss')" :invalidMessage="errorBag.packetLoss">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                </div>

                <div class="flex flex-col gap-y-3 mt-4">
                    <p class="max-w-2xl font-bold text-black dark:text-gray-400">Backup</p>

                    <div>
                        <NeCombobox v-model="backup_interfaceName" :options="interfaceOptions"
                            :label="t('Interface Name')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                            :noOptionsLabel="t('ne_combobox.no_options_label')"
                            :selected-label="t('ne_combobox.selected')"
                            :user-input-label="t('ne_combobox.user_input_label')"
                            :optionalLabel="t('common.optional')" />
                    </div>

                    <NeTextInput @input="ipInputHandler" v-model="backup_checkIP" :label="t('Check IP')"
                        :placeholder="t('Enter Check IP')" :invalidMessage="errorBag.backup_checkIP">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput v-model="backup_gateway" :label="t('Gateway')" :placeholder="t('Enter Gateway')"
                        :invalidMessage="errorBag.backup_gateway">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="backup_interval" :label="t('Interval')"
                        :placeholder="t('Enter interval')" :invalidMessage="errorBag.backup_interval">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="backup_retry" :label="t('Retry')"
                        :placeholder="t('Enter Retry')" :invalidMessage="errorBag.backup_retry">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="backup_delay" :label="t('Delay')"
                        :placeholder="t('Enter Delay')" :invalidMessage="errorBag.backup_delay">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="backup_packetLoss" :label="t('Packet Loss')"
                        :placeholder="t('Enter Packet Loss')" :invalidMessage="errorBag.backup_packetLoss">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                </div>

                <div class="mt-4 flex justify-start">
                    <div class="flex  flex-col w-[90px]">
                        <NeButton class="ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary"
                            size="lg" @click.prevent="saveNetworkConfig()">
                            <template #prefix>
                                <FontAwesomeIcon :icon="faSave" />
                            </template>
                            {{ t('common.save') }}
                        </NeButton>
                    </div>
                </div>

                <!-- More Details Table -->
                <div class="flex flex-row items-center justify-between mt-8">
                    <p class="max-w-2xl font-bold text-black dark:text-gray-400">More Details</p>
                    <NeButton kind="primary" size="lg" @click="addDetails">
                        <template #prefix>
                            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
                        </template>
                        Add
                    </NeButton>
                </div>

                <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Neighbour Table">
                    <NeTableHead>
                        <NeTableHeadCell>Rule Name</NeTableHeadCell>
                        <NeTableHeadCell>Priority</NeTableHeadCell>
                        <NeTableHeadCell>Port</NeTableHeadCell>
                        <NeTableHeadCell>Protocol</NeTableHeadCell>
                        <NeTableHeadCell>Operations</NeTableHeadCell>
                    </NeTableHead>
                    <NeTableBody>
                        <NeTableRow v-for="(item, index) in moreDetails" :key="`new-${index}`">
                            <NeTableCell>
                                <NeTextInput v-model.trim="item.name" placeholder="Rule Name" />
                            </NeTableCell>
                            <NeTableCell>
                                <select v-model="item.priority">
                                    <option value="main">main</option>
                                    <option value="backup">backup</option>
                                </select>
                            </NeTableCell>
                            <NeTableCell>
                                <NeTextInput v-model.trim="item.port" placeholder="Port" @input="onlyNumbers" />
                            </NeTableCell>
                            <NeTableCell>
                                <select v-model="item.protocol">
                                    <option value="udp">udp</option>
                                    <option value="tcp">tcp</option>
                                </select>
                            </NeTableCell>
                            <NeTableCell>
                                <NeButton size="sm" class="mt-5" @click=deleteDetails(item.name)>
                                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                                </NeButton>
                            </NeTableCell>
                        </NeTableRow>
                    </NeTableBody>
                </NeTable>
            </div>
            <div class="mt-4 flex justify-start">
                <div class="flex  flex-col w-[130px]">
                    <NeButton class="ml-1" :disabled="loading.moreDetails" :loading="loading.moreDetails" kind="primary"
                        size="lg" @click.prevent="saveMoreDetails()">
                        <template #prefix>
                            <FontAwesomeIcon :icon="faSave" />
                        </template>
                        {{ t('Add Details') }}
                    </NeButton>
                </div>
            </div>

        </div>
    </template>

</template>
