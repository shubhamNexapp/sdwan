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
const userName = ref("")
const password = ref("")

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
        if (!interfaceName.value.trim() || interfaceName.value.length > 18) {
            errorBag.value.interfaceName = "InterfaceName is required and must be max 18 characters."
        }

        if (!serverIP.value.trim() || serverIP.value.length > 64) {
            errorBag.value.serverIP = "Server IP is required and must be max 64 characters."
        }
    }

    return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
    if (!validate()) return

    try {
        const payload = [{
            service: service.value ? "enable" : "disable",
            interface_name: interfaceName.value,
            server: serverIP.value,
            username: userName.value,
            password: password.value,
        }]
        const response = await axios.post(`${getSDControllerApiEndpoint()}/l2tp`, {
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
    <NeSideDrawer :isShown="isShown" title="Add L2TP" closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="saveRule">
            <div class="space-y-6">
                <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

                <!-- Show form fields only if service is enabled -->
                <template v-if="service">
                    <NeTextInput v-model.trim="interfaceName" :invalidMessage="errorBag.interfaceName"
                        :label="t('Interface Name')" :placeholder="t('Enter Interface Name')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('Set the interface name') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput label="Interface Name" v-model.trim="interfaceName"
                        :invalidMessage="errorBag.interfaceName" /> -->

                    <NeTextInput @input="ipInputHandler" v-model.trim="serverIP" :invalidMessage="errorBag.serverIP"
                        :label="t('Server IP')" :placeholder="t('Enter Server IP')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('Enter the public IP or peer IP') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput label="Server IP" @input="ipInputHandler" v-model.trim="serverIP"
                        :invalidMessage="errorBag.serverIP" /> -->

                    <NeTextInput v-model.trim="userName" :invalidMessage="errorBag.userName" :label="t('User Name')"
                        :placeholder="t('Enter User Name')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('Enter the username same as server side username') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput label="User Name" v-model.trim="userName" :invalidMessage="errorBag.userName" /> -->

                    <NeTextInput v-model.trim="password" :invalidMessage="errorBag.password" :label="t('Password')"
                        :placeholder="t('Enter Password')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('Enter the password same as server side password') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput label="Password" v-model.trim="password" :invalidMessage="errorBag.password" /> -->

                </template>
            </div>

            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>
                <!-- Submit button (left aligned) -->
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
