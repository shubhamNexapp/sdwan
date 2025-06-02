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
import { faSave } from '@fortawesome/free-solid-svg-icons'


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

const ipEnd = ref("")
const localIP = ref("")

const chap = ref(false)
const pap = ref(false)
const auth = ref(false)

// const msChap = ref(false)
// const ms2Chap = ref(false)

const requireMschapv2 = ref(false)

const requireChap = ref(false)
const requirePap = ref(false)
const defaultroute = ref(false)
const ipdefault = ref(false)
const proxyarp = ref(false)

const mru = ref("")
const mtu = ref("")
const lcpInterval = ref("")
const lcpFailure = ref("")

const serverIPRef = ref()
const userNameRef = ref()
const passwordRef = ref()

const ipStartRef = ref()
const ipEndRef = ref()
const localIPRef = ref()

const password = ref()
const ipStart = ref()
const userName = ref()
const serverIP = ref()

const toBool = (val: string) => val === 'yes';

// Watch for changes in `itemToEdit` and populate fields
watch(
    () => props.itemToEdit,
    (newValue) => {
        if (newValue) {
            console.log("newValue========", newValue.require_mschap_v2)
            service.value = newValue.service === 'enable';
            ipStart.value = newValue.ip_start || "";
            ipEnd.value = newValue.ip_end || "";
            localIP.value = newValue.local_ip || "";
            userName.value = newValue.username || "";
            password.value = newValue.password || "";
            chap.value = toBool(newValue.chap);
            pap.value = toBool(newValue.pap);
            // msChap.value = toBool(newValue.ms_chap);
            // ms2Chap.value = toBool(newValue.ms2_chap);
            mtu.value = newValue.mtu || "";
            mru.value = newValue.mru || "";
            auth.value = toBool(newValue.auth);
            requireMschapv2.value = toBool(newValue.require_mschap_v2);
            requireChap.value = toBool(newValue.require_chap);
            requirePap.value = toBool(newValue.require_pap);
            lcpInterval.value = newValue.lcp_interval || "";
            lcpFailure.value = newValue.lcp_failure || "";
            defaultroute.value = toBool(newValue.defailtroute); // typo in key name from backend
            ipdefault.value = toBool(newValue.ipdefault);
            proxyarp.value = toBool(newValue.proxyarp);
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
        // { key: 'interfaceName', value: interfaceName, ref: interfaceNameRef },
        // { key: 'serverIP', value: serverIP, ref: serverIPRef },
        // { key: 'userName', value: userName, ref: userNameRef },
        // { key: 'password', value: password, ref: passwordRef },
        { key: 'ipStart', value: ipStart, ref: ipStartRef },
        { key: 'ipEnd', value: ipEnd, ref: ipEndRef },
        { key: 'localIP', value: localIP, ref: localIPRef },
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

        const payload = {
            service: service.value ? "enable" : "disable",
            ip_start: ipStart.value,
            ip_end: ipEnd.value,
            local_ip: localIP.value,
            username: userName.value,
            password: password.value,

            mru: mru.value,
            mtu: mtu.value,
            lcp_interval: lcpInterval.value,
            lcp_failure: lcpFailure.value,

            chap: chap.value ? 'yes' : 'no',
            pap: pap.value ? 'yes' : 'no',
            auth: auth.value ? 'yes' : 'no',
            // ms_chap: msChap.value ? 'yes' : 'no',
            // ms2_chap: ms2Chap.value ? 'yes' : 'no',
            require_mschap_v2: requireMschapv2.value ? 'yes' : 'no',
            require_chap: requireChap.value ? 'yes' : 'no',
            require_pap: requirePap.value ? 'yes' : 'no',
            defailtroute: defaultroute.value ? 'yes' : 'no',
            ipdefault: ipdefault.value ? 'yes' : 'no',
            proxyarp: proxyarp.value ? 'yes' : 'no',
        }

        const response = await axios.post(`${getSDControllerApiEndpoint()}/l2tp_server`, {
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
    <NeSideDrawer :isShown="isShown" :title="t('L2TP Server Edit Tunnel')"
        :closeAriaLabel="t('standalone.wire_guard.add_client_tunnel')" @close="closeDrawer">
        <form>
            <div class="space-y-6">
                <!-- service -->
                <NeToggle v-model="service" label="Enable Service" />

                <!-- IP Start -->
                <NeTextInput :label="t('standalone.l2tp.ip_start')" v-model.trim="ipStart"
                    :invalidMessage="errorBag.getFirstFor('ipStart')" :disabled="loading.saveRule" />
                <!-- IP End -->
                <NeTextInput :label="t('standalone.l2tp.ip_end')" v-model.trim="ipEnd"
                    :invalidMessage="errorBag.getFirstFor('ipEnd')" :disabled="loading.saveRule" />
                <!-- userName -->
                <NeTextInput :label="t('standalone.l2tp.userName')" v-model.trim="userName"
                    :invalidMessage="errorBag.getFirstFor('userName')" :disabled="loading.saveRule" ref="userNameRef" />
                <!-- password -->
                <NeTextInput :label="t('standalone.l2tp.password')" v-model.trim="password"
                    :invalidMessage="errorBag.getFirstFor('password')" :disabled="loading.saveRule" ref="passwordRef" />
                <!-- MTU -->
                <NeTextInput :label="t('standalone.l2tp.mtu')" v-model.trim="mtu"
                    :invalidMessage="errorBag.getFirstFor('mtu')" :disabled="loading.saveRule" />

                <!-- MRU -->
                <NeTextInput :label="t('standalone.l2tp.mru')" v-model.trim="mru"
                    :invalidMessage="errorBag.getFirstFor('mru')" :disabled="loading.saveRule" />

                <!-- lcp_interval -->
                <NeTextInput :label="t('standalone.l2tp.lcp_interval')" v-model.trim="lcpInterval"
                    :invalidMessage="errorBag.getFirstFor('lcpInterval')" :disabled="loading.saveRule" />

                <!-- lcp_failure -->
                <NeTextInput :label="t('standalone.l2tp.lcp_failure')" v-model.trim="lcpFailure"
                    :invalidMessage="errorBag.getFirstFor('lcpFailure')" :disabled="loading.saveRule" />

                <div class="grid grid-cols-2 gap-4">
                    <label><input type="checkbox" v-model.trim="chap" class="form-checkbox mr-2" />Chap</label>
                    <label><input type="checkbox" v-model.trim="pap" class="form-checkbox mr-2" />Pap</label>
                    <!-- <label><input type="checkbox" v-model.trim="msChap" class="form-checkbox mr-2" />Require
                        MSCHAP</label> -->
                    <!-- <label><input type="checkbox" v-model.trim="ms2Chap" class="form-checkbox mr-2" />Require
                        MSCHAP 2</label> -->
                    <label><input type="checkbox" v-model.trim="auth" class="form-checkbox mr-2" />Auth</label>
                    <label><input type="checkbox" v-model.trim="requireMschapv2" class="form-checkbox mr-2" />Require
                        MSCHAP v2</label>
                    <label><input type="checkbox" v-model.trim="requireChap" class="form-checkbox mr-2" />Require
                        CHAP</label>
                    <label><input type="checkbox" v-model.trim="requirePap" class="form-checkbox mr-2" />Require
                        PAP</label>
                    <label><input type="checkbox" v-model.trim="defaultroute" class="form-checkbox mr-2" />Default
                        Route</label>
                    <label><input type="checkbox" v-model.trim="ipdefault" class="form-checkbox mr-2" />IP
                        Default</label>
                    <label><input type="checkbox" v-model.trim="proxyarp" class="form-checkbox mr-2" />Proxy ARP</label>
                </div>

            </div>
            <!-- footer -->
            <hr class="my-8 border-gray-200 dark:border-gray-700" />
            <div class="flex justify-end">
                <NeButton kind="tertiary" size="lg" @click.prevent="closeDrawer" :disabled="loading.saveRule"
                    class="mr-3">
                    {{ t('common.cancel') }}
                </NeButton>
                <!-- <NeButton kind="primary" size="lg" @click.prevent="saveRule" :disabled="loading.saveRule"
                    :loading="loading.saveRule">
                    {{ t('standalone.wire_guard.save') }}
                </NeButton> -->
                <div class="flex flex-col w-[90px]">
                    <NeButton class=" ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary"
                        size="lg" @click.prevent="saveRule()">
                        <template #prefix>
                            <FontAwesomeIcon :icon="faSave" />
                        </template>
                        {{ t('common.save') }}
                    </NeButton>
                </div>
            </div>
        </form>
    </NeSideDrawer>
</template>
