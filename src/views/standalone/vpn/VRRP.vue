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

async function saveSettings() {
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

        <NeToggle v-model="status" :topLabel="t('Status')" :label="status ? 'Connected' : 'Disconnect'" />

        <div class="flex flex-col gap-y-3">
            <NeToggle v-model="service" :topLabel="t('Service')" :label="service ? 'Enabled' : 'Disabled'" />
            <label class="mr-4">State:</label>
            <select v-model="state" class="custom-select">
                <option value="MASTER">MASTER</option>
                <option value="BACKUP">BACKUP</option>
            </select>
            <label class="mr-4">Interface:</label>
            <select v-model="interfaceName" class="custom-select">
                <option value="eth0">eth0</option>
                <option value="eth1">eth1</option>
                <option value="eth2">eth2</option>
                <option value="eth3">eth3</option>
                <option value="eth4">eth4</option>
                <option value="eth5">eth5</option>
            </select>
            <NeTextInput v-model="virtualID" label="Virtual ID" />
            <NeTextInput v-model="virtualPriority" label="Virtual Priority" />
            <NeTextInput v-model="virtualIP" label="Virtual IP" />
            <NeTextInput v-model="password" label="Password" />
        </div>
        <NeButton :loading="saving" kind="primary" @click="saveSettings" class="mt-5 ml-1">Save</NeButton>

    </FormLayout>
</template>