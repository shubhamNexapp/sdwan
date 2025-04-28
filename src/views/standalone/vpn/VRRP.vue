<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import FormLayout from '@/components/standalone/FormLayout.vue';
import { useNotificationsStore } from '@/stores/notifications';
import { NeToggle, NeTextInput, NeButton, NeInlineNotification, NeHeading, NeTooltip } from '@nethesis/vue-components';
import axios from 'axios';
import { getSDControllerApiEndpoint } from '@/lib/config';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

const status = ref(false);
const service = ref(false);
const state = ref("MASTER");
const interfaceName = ref("eth0");
const virtualID = ref("");
const virtualPriority = ref("");
const virtualIP = ref("");
const password = ref("");

const serverAddress = ref('');
const sharedSecret = ref('');
const loading = ref(false);
const saving = ref(false);
const error = ref({ title: '', description: '' });

const errorBag = ref<{ [key: string]: string }>({})



onMounted(() => {
    fetchConfiguration();
});

async function fetchConfiguration() {
    try {
        loading.value = true;
        const response = await axios.post(`${getSDControllerApiEndpoint()}/vrrp`, {
            method: 'get-config',
            payload: {}
        });

        if (response.data.code === 200) {
            const config = response.data.data;
            status.value = config.status === 'connected';
            service.value = config.service === 'enable';
            state.value = config.state;
            virtualID.value = config.virtual_router_id;
            virtualPriority.value = config.priority;
            virtualIP.value = config.virtual_ipaddress;
            password.value = config.auth_pass;
        }
    } catch (err) {
        error.value = { title: 'Error', description: 'Failed to fetch configuration.' };
    } finally {
        loading.value = false;
    }
}

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

const onlyValidUrlCharacters = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z0-9:\/\.\-\_]/g, '')
}

const validateIp = (event: Event) => {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9./]/g, ''); // allow only numbers, dots, slash
    virtualIP.value = input.value; // Update your v-model
};



// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) { // Validate only if enabled

        if (!state.value.trim()) {
            errorBag.value.state = "State is required"
        }

        if (!virtualID.value.trim() || virtualID.value.length > 255) {
            errorBag.value.virtualID = "Virtual Id is required and must be max 255 characters."
        }

        if (!virtualPriority.value.trim() || virtualPriority.value.length > 254) {
            errorBag.value.virtualPriority = "Priority is required and must be max 254 characters."
        }

        if (!password.value.trim() || password.value.length > 16) {
            errorBag.value.password = "Acs password is required and must be max 16 characters."
        }

        if (!virtualIP.value.trim() || virtualIP.value.length > 32) {
            errorBag.value.virtualIP = "Virtual Ip is required and must be max 32 characters."
        }

    }

    return Object.keys(errorBag.value).length === 0
}

async function saveSettings() {
    if (!validate()) return
    try {
        saving.value = true;
        const response = await axios.post(`${getSDControllerApiEndpoint()}/vrrp`, {
            method: 'set-config',
            payload: {
                service: service.value ? 'enable' : 'disable',
                status: status.value ? 'connected' : 'disconnect',
                state: state.value,
                interface_name: interfaceName.value,
                virtual_router_id: virtualID.value,
                priority: virtualPriority.value,
                auth_pass: password.value,
                virtual_ipaddress: virtualIP.value,
            }
        });

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'Configuration saved successfully.',
                kind: 'success'
            });
        } else {
            throw new Error('Failed to save configuration.');
        }
    } catch (err) {
        console.error("Error:", err);
        error.value = { title: 'Error', description: 'Failed to save configuration.' };
    } finally {
        saving.value = false;
    }
}
</script>

<template>
    <div class="flex flex-col">
        <div class="mb-7">
            <NeHeading tag="h3">VRRP</NeHeading>
        </div>
    </div>
    <FormLayout :description="t('Enable or disable VRRP configuration and adjust its settings.')">

        <NeInlineNotification v-if="error.title" class="my-4" kind="error" :title="error.title"
            :description="error.description" />
        <NeToggle v-model="service" :topLabel="t('Service')" :label="service ? 'Enable' : 'Disable'" />
        <br />

        <template v-if="service">
            <!-- <NeToggle v-model="status" :topLabel="t('Status')" :label="status ? 'Connected' : 'Disconnect'" /> -->
            <label class="mr-4">Status:</label>
            <span :class="status ? 'text-green-500' : 'text-red-500'">
                {{ status ? 'Connected' : 'Disconnected' }}
            </span>

            <br />
            <br />

            <div class="flex flex-col gap-y-3">
                <div>
                    <label class="block text-sm font-medium mb-1">Interface Name:</label>
                    <select v-model="state"
                        class="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-full">
                        <option value="MASTER">MASTER</option>
                        <option value="BACKUP">BACKUP</option>
                    </select>
                </div>
                <!-- Display error manually -->
                <span v-if="errorBag.state" style="color: rgb(190 18 60 / var(--tw-text-opacity));">
                    {{ errorBag.state }}
                </span>

                <div>
                    <label class="block text-sm font-medium mb-1">Interface Name:</label>
                    <select v-model="interfaceName"
                        class="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-full">
                        <option value="eth0">eth0</option>
                        <option value="eth1">eth1</option>
                        <option value="eth2">eth2</option>
                        <option value="eth3">eth3</option>
                        <option value="eth4">eth4</option>
                        <option value="eth5">eth5</option>
                    </select>
                </div>

                <NeTextInput @input="onlyNumbers" v-model="virtualID" :invalidMessage="errorBag.virtualID"
                    :label="t('Virtual ID')" :placeholder="t('Enter Virtual ID')">
                    <template #tooltip>
                        <NeTooltip>
                            <template #content>
                                {{ t('standalone.logs.search_tooltip') }}
                            </template>
                        </NeTooltip>
                    </template>
                </NeTextInput>
                <!-- <NeTextInput @input="onlyNumbers" v-model="virtualID" label="Virtual ID"
                    :invalidMessage="errorBag.virtualID" /> -->


                <NeTextInput @input="onlyNumbers" v-model="virtualPriority" :invalidMessage="errorBag.virtualPriority"
                    :label="t('Virtual Priority')" :placeholder="t('Enter Virtual Priority')">
                    <template #tooltip>
                        <NeTooltip>
                            <template #content>
                                {{ t('standalone.logs.search_tooltip') }}
                            </template>
                        </NeTooltip>
                    </template>
                </NeTextInput>
                <!-- <NeTextInput @input="onlyNumbers" v-model="virtualPriority" label="Virtual Priority"
                    :invalidMessage="errorBag.virtualPriority" /> -->

                <NeTextInput @input="validateIp" v-model="virtualIP" :invalidMessage="errorBag.virtualIP"
                    :label="t('Virtual IP')" :placeholder="t('Enter Virtual IP')">
                    <template #tooltip>
                        <NeTooltip>
                            <template #content>
                                {{ t('standalone.logs.search_tooltip') }}
                            </template>
                        </NeTooltip>
                    </template>
                </NeTextInput>
                <!-- <NeTextInput @input="validateIp" v-model="virtualIP" label="Virtual IP"
                    :invalidMessage="errorBag.virtualIP" /> -->

                <NeTextInput @input="onlyNumbers" v-model="password" :invalidMessage="errorBag.password"
                    :label="t('Password')" :placeholder="t('Enter Password')">
                    <template #tooltip>
                        <NeTooltip>
                            <template #content>
                                {{ t('standalone.logs.search_tooltip') }}
                            </template>
                        </NeTooltip>
                    </template>
                </NeTextInput>
                <!-- <NeTextInput @input="onlyNumbers" v-model="password" label="Password"
                    :invalidMessage="errorBag.password" /> -->
            </div>

        </template>
        <div class="flex mt-4 flex-col w-[90px]">
            <NeButton class=" ml-1" kind="primary" :loading="saving" size="lg" @click.prevent="saveSettings()">
                <template #prefix>
                    <FontAwesomeIcon :icon="faSave" />
                </template>
                {{ t('Save') }}
            </NeButton>
        </div>
        <!-- <NeButton :loading="saving" kind="primary" @click="saveSettings" class="mt-5 ml-1">Save</NeButton> -->

    </FormLayout>
</template>