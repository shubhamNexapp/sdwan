<script setup lang="ts">
import {
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    getAxiosErrorMessage,
    NeTooltip,
    NeCombobox
} from '@nethesis/vue-components'
import { ref, watch, onMounted } from 'vue'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { Success, Update } from '@/lib/tost'


const { t } = useI18n()
const notificationsStore = useNotificationsStore()

// ✅ Define a proper TypeScript interface for icmpData
interface IcmpData {
    service?: string
    name?: string
    check_type?: string
    source_interface?: string
    destination?: string
    time_interval?: string
    retry_times?: string
    cur_fail?: string
    time_out_action?: string
    custom_command?: string
}


const props = defineProps<{
    isShown: boolean,
    ruleId?: string // optional rule ID to fetch data for editing
    icmpData: IcmpData,
}>()

const emit = defineEmits(['close', 'save'])

let loading = ref({
    listServiceSuggestions: false,
    listObjectSuggestions: false,
    listProtocols: false,
    saveRule: false,
    fetchRule: false,
});
// Form Fields
const service = ref(false)
const name = ref("")
const destination = ref("")
const timeInterval = ref("")
const retryTimes = ref("")
const timeOutAction = ref("")
const sourceInterface = ref("")
const checkType = ref("")
const custom_command = ref("")

// Error messages
const errorBag = ref<{ [key: string]: string }>({})

watch(
    () => props.icmpData,
    (newValue) => {
        if (newValue) {
            service.value = newValue.service === 'enabled'
            name.value = newValue.name || ""
            checkType.value = newValue.check_type || ""
            sourceInterface.value = newValue.source_interface || ""
            destination.value = newValue.destination || ""
            timeInterval.value = newValue.time_interval || ""
            retryTimes.value = newValue.retry_times || ""
            timeOutAction.value = newValue.time_out_action || ""
            custom_command.value = newValue.custom_command || ""
        }
    },
    { deep: true, immediate: true }
);

// Input handlers
const onlyLetters = (e: Event) => {
    const input = e.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '')
}

const onlyNumbers = (e: Event) => {
    const input = e.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '')
}

const ipInputHandler = (e: Event) => {
    const input = e.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9.]/g, '').slice(0, 128)
}

// Validate form
const validate = () => {
    errorBag.value = {}

    if (service.value) {
        if (!name.value.trim() || name.value.length > 64) {
            errorBag.value.name = "Task name is required and must be max 64 characters."
        }

        if (!destination.value.trim() || destination.value.length > 128) {
            errorBag.value.destination = "Destination is required and must be max 128 characters."
        }

        const timeInt = Number(timeInterval.value)
        if (!timeInterval.value.trim() || isNaN(timeInt) || timeInt < 1 || timeInt > 65535) {
            errorBag.value.timeInterval = "Time Interval must be between 1 and 65535."
        }

        const retryInt = Number(retryTimes.value)
        if (!retryTimes.value.trim() || isNaN(retryInt) || retryInt < 1 || retryInt > 65535) {
            errorBag.value.retryTimes = "Retry Times must be between 1 and 65535."
        }

        if (!timeOutAction.value) {
            errorBag.value.timeOutAction = "Time out action is required."
        }

        if (!sourceInterface.value) {
            errorBag.value.sourceInterface = "Source interface is required."
        }

        if (!checkType.value) {
            errorBag.value.checkType = "Check type is required."
        }
    }

    return Object.keys(errorBag.value).length === 0
}

// Save/Update
const saveRule = async () => {
    if (!validate()) return
    loading.value.saveRule = true

    try {
        const payload = {
            service: service.value ? "enabled" : "disabled",
            name: name.value,
            destination: destination.value,
            time_interval: timeInterval.value,
            source_interface: sourceInterface.value,
            check_type: checkType.value,
            retry_times: retryTimes.value,
            time_out_action: timeOutAction.value,
            ...(timeOutAction.value === 'custom' && {
                custom_command: custom_command.value
            })
        }

        const response = await axios.post(`${getSDControllerApiEndpoint()}/icmpcheck`, {
            method: "edit-config",
            payload
        })

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: Success,
                description: Update,
                kind: 'success'
            })
            loading.value.saveRule = false

            emit('save', payload)
            emit('close')
        }
    } catch (error) {
        notificationsStore.createNotification({
            title: 'Error saving rule',
            description: getAxiosErrorMessage(error),
            kind: 'danger'
        })
        loading.value.saveRule = false

    }
}

const closeDrawer = () => {
    emit('close')
}
</script>

<template>
    <NeSideDrawer :isShown="isShown" title="Edit ICMP Check" @close="closeDrawer">
        <form class="space-y-6">
            <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

            <template v-if="service">
                <NeTextInput v-model="name" @input="onlyLetters" :invalidMessage="errorBag.name" :label="t('Task Name')"
                    :placeholder="t('Enter Task Name')" />

                <NeCombobox v-model="checkType" :options="[
                    { label: 'icmp', id: 'icmp' },
                    { label: 'domain', id: 'domain' }
                ]" :label="t('Check Type')" />

                <NeCombobox v-model="sourceInterface" :options="[
                    { label: 'eth0', id: 'eth0' },
                    { label: 'eth1', id: 'eth1' },
                    { label: 'eth2', id: 'eth2' },
                    { label: 'eth3', id: 'eth3' },
                    { label: 'eth4', id: 'eth4' },
                    { label: 'eth5', id: 'eth5' }
                ]" :label="t('Source Interface')" />

                <span v-if="errorBag.sourceInterface" class="text-red-600">{{ errorBag.sourceInterface }}</span>

                <NeTextInput v-model="destination" @input="ipInputHandler" :invalidMessage="errorBag.destination"
                    :label="t('Destination')" />

                <NeTextInput v-model="timeInterval" @input="onlyNumbers" :invalidMessage="errorBag.timeInterval"
                    :label="t('Time Interval')" />

                <NeTextInput v-model="retryTimes" @input="onlyNumbers" :invalidMessage="errorBag.retryTimes"
                    :label="t('Retry Times')" />

                <NeCombobox v-model="timeOutAction" :options="[
                    { label: 'reboot', id: 'reboot' },
                    { label: 'custom', id: 'custom' }
                ]" :label="t('Time Out Action')" />

                <NeTextInput v-if="timeOutAction === 'custom'" v-model="custom_command" :label="t('Custom Command')" />
            </template>

            <div class="flex justify-end">
                <NeButton class=" ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary"
                    size="lg" @click.prevent="saveRule()">
                    <template #prefix>
                        <FontAwesomeIcon :icon="faSave" />
                    </template>
                    {{ t('common.save') }}
                </NeButton>
            </div>
        </form>
    </NeSideDrawer>
</template>

<style scoped>
.text-red-600 {
    color: rgb(190, 18, 60);
}
</style>
