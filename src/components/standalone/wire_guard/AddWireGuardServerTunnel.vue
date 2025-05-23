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

let loading = ref({
    listServiceSuggestions: false,
    listObjectSuggestions: false,
    listProtocols: false,
    saveRule: false,
    fetchRule: false,
});

const emit = defineEmits(['close', 'save', 'tunnel-added'])

// Form fields
const service = ref(false)
const name = ref("")
const destination = ref("")
const timeInterval = ref("")
const retryTimes = ref("")
const command = ref("")
const timeOutAction = ref("")
const sourceInterface = ref("")
const checkType = ref("")
const custom_command = ref("")

const address = ref("")
const listenPort = ref("")
const mtu = ref("")

// Validation error messages
const errorBag = ref<{ [key: string]: string }>({})

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
    // const input = event.target as HTMLInputElement;
    // // Allow numbers and dots, and remove other characters
    // input.value = input.value.replace(/[^0-9./]/g, '');
    // // Limit to max 128 characters
    // if (input.value.length > 128) {
    //     input.value = input.value.slice(0, 128);
    // }

    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9./]/g, ''); // allow only numbers, dots, slash
    input.value = input.value; // Update your v-model
};


// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) { // Validate only if enabled

        if (!address.value.trim() || address.value.length > 32) {
            errorBag.value.address = "Address is required and must be max 32 characters."
        }

        const listen_port_data = Number(listenPort.value)
        if (!listen_port_data || isNaN(listen_port_data) || listen_port_data < 1 || listen_port_data > 65536) {
            errorBag.value.listenPort = "Listen port be between 1 and 65536."
        }

        const mtu_data = Number(mtu.value)
        if (!mtu_data || isNaN(mtu_data) || mtu_data < 1 || mtu_data > 65536) {
            errorBag.value.mtu = "MTU must be between 1 and 65536."
        }

    }

    return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
    if (!validate()) return

    try {
        const payload = {
            service: service.value ? "enabled" : "disabled",
            address: address.value,
            listen_port: listenPort.value,
            mtu: mtu.value,
        }

        const response = await axios.post(`${getSDControllerApiEndpoint()}/wireguard_server`, {
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
            emit('tunnel-added')
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
    <NeSideDrawer :isShown="isShown" title="Add Server Tunnel" closeAriaLabel="Close" @close="closeDrawer">
        <form>
            <div class="space-y-6">
                <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

                <!-- Show form fields only if service is enabled -->
                <template v-if="service">

                    <NeTextInput @input="ipInputHandler" v-model="address" :invalidMessage="errorBag.address"
                        :label="t('Address')" :placeholder="t('Enter Address')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="listenPort" :invalidMessage="errorBag.listenPort"
                        :label="t('Listen Port')" :placeholder="t('Enter Listen Port')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

                    <NeTextInput @input="onlyNumbers" v-model="mtu" :invalidMessage="errorBag.mtu" :label="t('MTU')"
                        :placeholder="t('Enter MTU')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>

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
