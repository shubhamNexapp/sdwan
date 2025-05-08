<script setup lang="ts">
import {
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    getAxiosErrorMessage,
    NeTooltip
} from '@nethesis/vue-components'
import { ref } from 'vue'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();

const notificationsStore = useNotificationsStore()

const props = defineProps({
    isShown: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

// Form fields
const service = ref(false)
const interfaceName = ref("")
const serverIP = ref("")


const ipStart = ref("")
const ipEnd = ref("")
const localIP = ref("")
const userName = ref("")
const password = ref("")

const chap = ref(false)
const pap = ref(false)
const auth = ref(false)

const msChap = ref(false)
const ms2Chap = ref(false)

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


// Validation error messages
const errorBag = ref<{ [key: string]: string }>({})

let loading = ref({
    listServiceSuggestions: false,
    listObjectSuggestions: false,
    listProtocols: false,
    saveRule: false,
    fetchRule: false,
});

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
    input.value = input.value.replace(/[^0-9.]/g, '');
    // Limit to max 128 characters
    if (input.value.length > 128) {
        input.value = input.value.slice(0, 128);
    }
};


// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) { // Validate only if enabled

        if (!ipStart.value.trim() || ipStart.value.length > 32) {
            errorBag.value.ipStart = "IP Start is required and must be max 32 characters."
        }

        if (!ipEnd.value.trim() || ipEnd.value.length > 32) {
            errorBag.value.ipEnd = "IP End is required and must be max 32 characters."
        }

        if (!localIP.value.trim() || localIP.value.length > 32) {
            errorBag.value.localIP = "Local IP is required and must be max 32 characters."
        }

        // Numeric range validation
        const numFields = [
            { name: 'mru', value: mru.value, min: 64, max: 65535 },
            { name: 'mtu', value: mtu.value, min: 64, max: 65535 },
            { name: 'lcpInterval', value: lcpInterval.value, min: 0, max: 65535 },
            { name: 'lcpFailure', value: lcpFailure.value, min: 0, max: 1440 }
        ]

        for (const field of numFields) {
            const num = Number(field.value)
            if (isNaN(num) || num < field.min || num > field.max) {
                errorBag.value[field.name] = `${field.name.toUpperCase()} must be between ${field.min} and ${field.max}.`
            }
        }

    }

    return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
    if (!validate()) return

    try {
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
            method: "set-config",
            payload,
        });

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'Configuration saved successfully.',
                kind: 'success'
            })

            emit('save', payload)
            emit('close') // Close drawer on success
        }
    } catch (err) {
        console.error("Error saving rule:", getAxiosErrorMessage(err))
    }
}

// Close drawer function
const closeDrawer = () => {
    emit('close')
}

</script>

<template>
    <NeSideDrawer :isShown="isShown" title="Add Server L2TP" closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="saveRule">
            <div class="space-y-6">
                <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

                <!-- Show form fields only if service is enabled -->
                <template v-if="service">

                    <NeTextInput @input="ipInputHandler" v-model.trim="ipStart" :invalidMessage="errorBag.ipStart"
                        :label="t('IP Start')" :placeholder="t('Enter IP Start')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="ipInputHandler" v-model.trim="ipEnd" :invalidMessage="errorBag.ipEnd"
                        :label="t('IP End')" :placeholder="t('Enter IP End')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="ipInputHandler" v-model.trim="localIP" :invalidMessage="errorBag.localIP"
                        :label="t('Local IP')" :placeholder="t('Enter Local IP')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput v-model.trim="userName" :invalidMessage="errorBag.userName" :label="t('User Name')"
                        :placeholder="t('Enter User Name')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput v-model.trim="password" :invalidMessage="errorBag.password" :label="t('Password')"
                        :placeholder="t('Enter Password')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model.trim="mru" :invalidMessage="errorBag.mru"
                        :label="t('MRU')" :placeholder="t('Enter MRU (64-65535)')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    Maximum Receive Unit - Value between 64 and 65535.
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model.trim="mtu" :invalidMessage="errorBag.mtu"
                        :label="t('MTU')" :placeholder="t('Enter MTU (64-65535)')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    Maximum Transmission Unit - Value between 64 and 65535.
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model.trim="lcpInterval" :invalidMessage="errorBag.lcpInterval"
                        :label="t('LCP Interval')" :placeholder="t('Enter LCP Interval (0-65535)')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    LCP Echo Interval - Value between 0 and 65535.
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model.trim="lcpFailure" :invalidMessage="errorBag.lcpFailure"
                        :label="t('LCP Failure')" :placeholder="t('Enter LCP Failure (0-1440)')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    LCP Echo Failure Threshold - Value between 0 and 1440.
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>


                    <!-- Additional Checkbox Fields -->
                    <div class="grid grid-cols-2 gap-4">
                        <label><input type="checkbox" v-model="chap" class="form-checkbox mr-2" />Chap</label>
                        <label><input type="checkbox" v-model="pap" class="form-checkbox mr-2" />Pap</label>
                        <!-- <label><input type="checkbox" v-model="msChap" class="form-checkbox mr-2" />Require
                            MSCHAP</label>
                        <label><input type="checkbox" v-model="ms2Chap" class="form-checkbox mr-2" />Require
                            MSCHAP 2</label> -->
                        <label><input type="checkbox" v-model="auth" class="form-checkbox mr-2" />Auth</label>
                        <label><input type="checkbox" v-model="requireMschapv2" class="form-checkbox mr-2" />Require
                            MSCHAP v2</label>
                        <label><input type="checkbox" v-model="requireChap" class="form-checkbox mr-2" />Require
                            CHAP</label>
                        <label><input type="checkbox" v-model="requirePap" class="form-checkbox mr-2" />Require
                            PAP</label>
                        <label><input type="checkbox" v-model="defaultroute" class="form-checkbox mr-2" />Default
                            Route</label>
                        <label><input type="checkbox" v-model="ipdefault" class="form-checkbox mr-2" />IP
                            Default</label>
                        <label><input type="checkbox" v-model="proxyarp" class="form-checkbox mr-2" />Proxy ARP</label>
                    </div>
                </template>
            </div>

            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>
                <!-- Submit button (left aligned) -->
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
