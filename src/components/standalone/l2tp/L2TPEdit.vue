<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import {
    type NeComboboxOption,
    NeInlineNotification,
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
} from '@nethesis/vue-components'
import { ref, type PropType, type Ref, watch, } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    type FirewallRule
} from '@/stores/standalone/firewall'
import {
    MessageBag,
    validateRequired,
} from '@/lib/validation'
import { getSDControllerApiEndpoint } from '@/lib/config';
import axios from 'axios';
import { useNotificationsStore } from '../../../stores/notifications'

const notificationsStore = useNotificationsStore()

const props = defineProps({
    itemToEdit: Object,
    ruleType: {
        type: String as PropType<'forward' | 'input' | 'output'>,
        required: true
    },
    currentRule: {
        type: Object as PropType<FirewallRule>
    },
    isDuplicatingRule: {
        type: Boolean,
        default: false
    },
    isShown: { type: Boolean, default: false },
    knownTags: {
        type: Array as PropType<NeComboboxOption[]>,
        required: true
    }
})

const emit = defineEmits(['close', 'reloadData', 'save'])

const { t } = useI18n()

const errorBag = ref(new MessageBag())

const service = ref(false);
const interfaceName = ref('');
const interfaceNameRef = ref('');

const serverIPRef = ref()
const userNameRef = ref()
const passwordRef = ref()

const password = ref()
const userName = ref()
const serverIP = ref()

// Watch for changes in `itemToEdit` and populate fields
watch(
    () => props.itemToEdit,
    (newValue) => {
        if (newValue) {

            service.value = newValue.service === 'enable';
            interfaceName.value = newValue.interface_name || "";
            serverIP.value = newValue.server || "";
            userName.value = newValue.username || "";
            password.value = newValue.password || "";

        }
    },
    { deep: true, immediate: true }
);

let loading = ref({
    listServiceSuggestions: false,
    listObjectSuggestions: false,
    listProtocols: false,
    saveRule: false
})

function closeDrawer() {
    emit('close')
}

const validate = () => {
    errorBag.value.clear();
    let isValid = true;

    const requiredFields = [
        { key: 'interfaceName', value: interfaceName, ref: interfaceNameRef },
        { key: 'serverIP', value: serverIP, ref: serverIPRef },
        { key: 'userName', value: userName, ref: userNameRef },
        { key: 'password', value: password, ref: passwordRef },
    ];

    requiredFields.forEach((field) => {
        const validation = validateRequired(field.value.value);
        if (!validation.valid) {
            errorBag.value.set(field.key, t("required"));
            isValid = false;
        }
    });

    return isValid;
};

// ✅ Watch each field separately to clear errors when the user types
const fieldsToWatch: Record<string, Ref<string>> = {
    serverIP,
    interfaceName,
    password,
    userName,
};

Object.keys(fieldsToWatch).forEach((fieldKey) => {
    watch(fieldsToWatch[fieldKey], (newValue) => {
        if (newValue !== "") {
            errorBag.value.delete(fieldKey); // ✅ Removes the error message when the user types
        }
    });
});

async function saveRule() {
    try {
        if (!validate()) return;

        let isService = service.value ? "enable" : "disable";

        const payload = [{
            service: service.value ? "enable" : "disable",
            interface_name: interfaceName.value,
            server: serverIP.value,
            username: userName.value,
            password: password.value
        }]

        const response = await axios.post(`${getSDControllerApiEndpoint()}/l2tp`, {
            method: 'set-config',
            payload
        });

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'Configuration updated successfully.',
                kind: 'success'
            });

            // Reset form after successful save
            errorBag.value.clear();
            emit('save', payload);

            // ✅ Close the drawer after saving
            closeDrawer();

        } else {
            throw new Error('Failed to save configuration.');
        }

    } catch (err) {
    }
}

</script>

<template>
    <NeSideDrawer :isShown="isShown" :title="t('standalone.l2tp.edit_tunnel')"
        :closeAriaLabel="t('standalone.wire_guard.add_client_tunnel')" @close="closeDrawer">
        <form>
            <div class="space-y-6">
                <!-- service -->
                <NeToggle v-model="service" label="Enable Service" />
                <!-- <NeToggle v-model="service" :label="service ? t('common.enabled') : t('common.disabled')"
                    :topLabel="t('Service')" :disabled="loading.saveRule" /> -->
                <!-- interface name -->
                <NeTextInput :label="t('standalone.l2tp.interface_name')" v-model.trim="interfaceName"
                    :invalidMessage="errorBag.getFirstFor('interfaceName')" :disabled="loading.saveRule"
                    ref="interfaceNameRef" />
                <!-- interface name -->
                <NeTextInput :label="t('standalone.l2tp.server_ip')" v-model.trim="serverIP"
                    :invalidMessage="errorBag.getFirstFor('serverIP')" :disabled="loading.saveRule" ref="serverIPRef" />
                <!-- userName -->
                <NeTextInput :label="t('standalone.l2tp.userName')" v-model.trim="userName"
                    :invalidMessage="errorBag.getFirstFor('userName')" :disabled="loading.saveRule" ref="userNameRef" />
                <!-- password -->
                <NeTextInput :label="t('standalone.l2tp.password')" v-model.trim="password"
                    :invalidMessage="errorBag.getFirstFor('password')" :disabled="loading.saveRule" ref="passwordRef" />
            </div>
            <!-- footer -->
            <hr class="my-8 border-gray-200 dark:border-gray-700" />
            <div class="flex justify-end">
                <NeButton kind="tertiary" size="lg" @click.prevent="closeDrawer" :disabled="loading.saveRule"
                    class="mr-3">
                    {{ t('common.cancel') }}
                </NeButton>
                <NeButton kind="primary" size="lg" @click.prevent="saveRule" :disabled="loading.saveRule"
                    :loading="loading.saveRule">
                    {{ t('standalone.wire_guard.save') }}
                </NeButton>
            </div>
        </form>
    </NeSideDrawer>
</template>
