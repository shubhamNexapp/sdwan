<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeInlineNotification,
    NeTooltip,
    getAxiosErrorMessage
} from '@nethesis/vue-components'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { useNotificationsStore } from '@/stores/notifications'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

type LoopbackStatus = 'up' | 'down'

interface LoopbackRule {
    ifname: string
    ipaddr: string
    status: LoopbackStatus
}

const props = defineProps<{
    isShown: boolean
    loopback?: LoopbackRule | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'reloadData'): void
}>()

const { t } = useI18n()
const notificationsStore = useNotificationsStore()

// form model
const ifname = ref('')
const ipaddr = ref('')
const status = ref<LoopbackStatus>('up')

// errors + loading
const errorBag = ref<{ [key: string]: string }>({})
const submitError = ref('')
const loading = ref(false)

const isEdit = computed(() => !!props.loopback)

// prefill on open / edit
watch(
    () => props.loopback,
    (val) => {
        if (val) {
            ifname.value = val.ifname
            ipaddr.value = val.ipaddr
            status.value = val.status
        } else {
            ifname.value = ''
            ipaddr.value = ''
            status.value = 'up'
        }
        errorBag.value = {}
        submitError.value = ''
    },
    { immediate: true }
)

// IP input handler: allow only digits, dots and slash, max 64 chars
const ipInputHandler = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9./]/g, '')
    if (input.value.length > 64) {
        input.value = input.value.slice(0, 64)
    }
    ipaddr.value = input.value
}

// validation
const validate = () => {
    errorBag.value = {}

    // string (max len 64) for interface name
    if (!ifname.value.trim()) {
        errorBag.value.ifname = 'Interface name is required.'
    } else if (ifname.value.length > 64) {
        errorBag.value.ifname = 'Interface name must be max 64 characters.'
    }

    // string (max len 64) + CIDR check for IP
    if (!ipaddr.value.trim()) {
        errorBag.value.ipaddr = 'IP address is required.'
    } else if (ipaddr.value.length > 64) {
        errorBag.value.ipaddr = 'IP address must be max 64 characters.'
    } else {
        // CIDR format: x.x.x.x/nn
        const cidrRegex =
            /^((25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|1?\d{1,2})\/([0-9]|[1-2][0-9]|3[0-2])$/
        if (!cidrRegex.test(ipaddr.value)) {
            errorBag.value.ipaddr = 'IP must be in the form 19.6.1.2/24.'
        }
    }

    return Object.keys(errorBag.value).length === 0
}

const closeDrawer = () => {
    if (!loading.value) {
        emit('close')
    }
}

const saveLoopback = async () => {
    if (!validate()) return

    loading.value = true
    submitError.value = ''

    try {
        const payload = {
            ifname: ifname.value,
            ipaddr: ipaddr.value,
            status: status.value
        }

        await axios.post(`${getSDControllerApiEndpoint()}/loopback`, {
            method: 'add-rule',
            payload
        })

        notificationsStore.createNotification({
            title: 'Success',
            description: isEdit.value
                ? 'Loopback device updated successfully.'
                : 'Loopback device created successfully.',
            kind: 'success'
        })

        emit('reloadData')
        emit('close')
    } catch (err: any) {
        console.error(err)
        submitError.value = getAxiosErrorMessage(err)
    }

    loading.value = false
}
</script>

<template>
    <NeSideDrawer :isShown="isShown" :title="isEdit ? 'Edit loopback device' : 'Create loopback device'"
        closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="saveLoopback">
            <div class="space-y-6">
                <!-- global error -->
                <NeInlineNotification v-if="submitError" kind="error" :title="submitError" />

                <!-- Interface name (string, max 64) -->
                <NeTextInput v-model.trim="ifname" :invalidMessage="errorBag.ifname" :disabled="isEdit"
                    label="Interface name" placeholder="set a interface name">
                    <template #tooltip>
                        <NeTooltip>
                            <template #content>
                                Set a unique name for the loopback interface (max 64 characters, e.g. lo_1).
                            </template>
                        </NeTooltip>
                    </template>
                </NeTextInput>

                <!-- IP address (string, max 64, CIDR) -->
                <NeTextInput v-model.trim="ipaddr" :invalidMessage="errorBag.ipaddr" label="IP"
                    placeholder="19.6.1.2/24" @input="ipInputHandler">
                    <template #tooltip>
                        <NeTooltip>
                            <template #content>
                                Enter the IP address in CIDR format, for example 19.6.1.2/24.
                            </template>
                        </NeTooltip>
                    </template>
                </NeTextInput>
            </div>

            <!-- footer -->
            <div class="mt-6 flex justify-end">
                <NeButton kind="tertiary" class="mr-3" @click.prevent="closeDrawer">
                    Cancel
                </NeButton>
                <NeButton class="ml-1" :disabled="loading" :loading="loading" kind="primary" size="lg" type="submit">
                    <template #prefix>
                        <FontAwesomeIcon :icon="faSave" />
                    </template>
                    {{ isEdit ? t('common.save') : 'Create device' }}
                </NeButton>
            </div>
        </form>
    </NeSideDrawer>
</template>
