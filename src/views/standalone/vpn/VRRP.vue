<script setup lang="ts">
import { useI18n } from "vue-i18n";
import {
    NeHeading,
    NeTextInput,
    NeToggle,
    NeButton,
} from "@nethesis/vue-components";
import { onMounted, ref, watch, type Ref } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { MessageBag } from "@/lib/validation";
import { useNotificationsStore } from "../../../stores/notifications";

const notificationsStore = useNotificationsStore();

export type IpsecTunnel = {
    id: string;
    name: string;
    local: string[];
    remote: string[];
    enabled: "0" | "1";
    connected: boolean;
};

const t = (key: string) => key; // Mock translation function

const service = ref(false);
const status = ref("");
const state = ref("");
const interfaceName = ref("eth0");
const virtualID = ref("");
const virtualPriority = ref("");
const virtualIP = ref("");
const password = ref("");

// 🔍 Function to check if a field is empty
const validateRequired = (value: string) => {
    return value.trim() !== "";
};

let loading = ref({
    listServiceSuggestions: false,
    listObjectSuggestions: false,
    listProtocols: false,
    saveRule: false,
    fetchRule: false,
});


const errorBag = ref(new MessageBag());

// 🛠 Validation Function
const validate = () => {
    errorBag.value.clear();
    let isValid = true;

    const requiredFields = [
        { key: "virtualID", value: virtualID },
        { key: "virtualPriority", value: virtualPriority },
        { key: "virtualIP", value: virtualIP },
        { key: "password", value: password },
    ];

    requiredFields.forEach((field) => {
        if (!validateRequired(field.value.value)) {
            errorBag.value.set(field.key, t("Required"));
            isValid = false;
        }
    });

    return isValid;
};

// ✅ Watch each field separately to clear errors when the user types
const fieldsToWatch: Record<string, Ref<string>> = {
    status,
    state,
    interfaceName,
    virtualID,
    virtualPriority,
    virtualIP,
    password,
};

Object.keys(fieldsToWatch).forEach((fieldKey) => {
    watch(fieldsToWatch[fieldKey], (newValue) => {
        if (newValue.trim() !== "") {
            errorBag.value.delete(fieldKey);
        }
    });
});


const emit = defineEmits(['close', 'reloadData', 'save'])

const fetchData = async () => {
    loading.value.fetchRule = true;
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/vrrp`, {
            method: "get-config",
            payload: {},
        });

        if (response.data) {
            const dataValue = response.data.data;
            state.value = dataValue.state || "";
        }
    } catch (error) {
        console.error("Error fetching VRRP configuration:", error);
    } finally {
        loading.value.fetchRule = false;
    }
};

const submitForm = async () => {

    try {
        if (!validate()) return;

        let isService

        if (service.value) {
            isService = "enable"
        } else {
            isService = "disable"
        }
        const payload = {
            service: isService,
            status: status.value,
            state: state.value,
            interface_name: interfaceName.value,
            virtual_router_id: virtualID.value,
            priority: virtualPriority.value,
            auth_pass: password.value,
            virtual_ipaddress: virtualIP.value,
        };

        const response = await axios.post(`${getSDControllerApiEndpoint()}/vrrp`, {
            method: 'set-config',
            payload
        });

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'Configuration saved successfully.',
                kind: 'success'
            });

            // Reset form after successful save
            errorBag.value.clear();
            emit('save', payload);


        } else {
            throw new Error('Failed to save configuration.');
        }

    } catch (err) {
    }
};
onMounted(fetchData);

</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-col justify-between md:flex-row md:items-center">
            <NeHeading tag="h3" class="mb-7">VRRP</NeHeading>
        </div>
        <form>
            <div class="space-x-6 space-y-6">
                <!-- enabled -->
                <NeToggle v-model="service" label="Enable Service" />
                <br />
                <label class="mr-4">Status:</label>
                <span>{{ status }}</span>
                <br />

                <label class="mr-4">State:</label>
                <span>{{ state }}</span>
                <br />

                <label class="mr-4">Interface:</label>
                <select v-model="interfaceName" class="custom-select">
                    <option value="eth0">eth0</option>
                    <option value="eth1">eth1</option>
                    <option value="eth2">eth2</option>
                    <option value="eth3">eth3</option>
                    <option value="eth4">eth4</option>
                    <option value="eth5">eth5</option>
                </select>

                <NeTextInput :label="t('Virtual ID')" type="text" v-model="virtualID"
                    :invalidMessage="errorBag.getFirstFor('virtualID')" :disabled="loading.saveRule" />

                <NeTextInput :label="t('Virtual Priority')" type="text" v-model="virtualPriority"
                    :invalidMessage="errorBag.getFirstFor('virtualPriority')" :disabled="loading.saveRule" />

                <NeTextInput :label="t('Virtual IP')" type="text" v-model="virtualIP"
                    :invalidMessage="errorBag.getFirstFor('virtualIP')" :disabled="loading.saveRule" />

                <NeTextInput :label="t('Password')" type="password" v-model="password"
                    :invalidMessage="errorBag.getFirstFor('password')" :disabled="loading.saveRule" />

                <NeButton kind="primary" size="lg" :disabled="loading.saveRule" :loading="loading.saveRule"
                    @click="submitForm">
                    Submit</NeButton>
            </div>
        </form>
    </div>
</template>

<style scoped>
.custom-select {
    width: 30%;
    height: 36px;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s ease-in-out;
}
</style>
