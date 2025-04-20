<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import FormLayout from '@/components/standalone/FormLayout.vue';
import { useNotificationsStore } from '@/stores/notifications';
import { NeToggle, NeTextInput, NeButton, NeInlineNotification } from '@nethesis/vue-components';
import axios from 'axios';
import { getSDControllerApiEndpoint } from '@/lib/config';

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

const validateIp = (ip: string) => {
    // Regex for IPv4 validation
    const ipRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return ipRegex.test(ip);
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
        <div class="flex flex-col justify-between md:flex-row md:items-center">
            <NeHeading tag="h1" class="mb-7">VRRP</NeHeading>
        </div>
    </div>
    <FormLayout class="max-w-4xl">

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

                <label class="mr-4">State:</label>
                <select v-model="state" class="custom-select">
                    <option value="MASTER">MASTER</option>
                    <option value="BACKUP">BACKUP</option>
                </select>
                <!-- Display error manually -->
                <span v-if="errorBag.state" style="color: rgb(190 18 60 / var(--tw-text-opacity));">
                    {{ errorBag.state }}
                </span>
                <label class="mr-4">Interface:</label>
                <select v-model="interfaceName" class="custom-select">
                    <option value="eth0">eth0</option>
                    <option value="eth1">eth1</option>
                    <option value="eth2">eth2</option>
                    <option value="eth3">eth3</option>
                    <option value="eth4">eth4</option>
                    <option value="eth5">eth5</option>
                </select>
                <NeTextInput @input="onlyNumbers" v-model="virtualID" label="Virtual ID"
                    :invalidMessage="errorBag.virtualID" />
                <NeTextInput @input="onlyNumbers" v-model="virtualPriority" label="Virtual Priority"
                    :invalidMessage="errorBag.virtualPriority" />
                <NeTextInput @input="validateIp" v-model="virtualIP" label="Virtual IP"
                    :invalidMessage="errorBag.virtualIP" />
                <NeTextInput @input="onlyNumbers" v-model="password" label="Password"
                    :invalidMessage="errorBag.password" />
            </div>

        </template>
        <NeButton :loading="saving" kind="primary" @click="saveSettings" class="mt-5 ml-1">Save</NeButton>

    </FormLayout>
</template>