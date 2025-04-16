<script setup lang="ts">
import {
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    getAxiosErrorMessage
} from '@nethesis/vue-components'
import { ref } from 'vue'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'

const notificationsStore = useNotificationsStore()

const props = defineProps({
    isShown: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

// Form fields
const service = ref(false)
const name = ref("")
const destination = ref("")
const timeInterval = ref("")
const retryTimes = ref("")
const command = ref("")

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

        if (command.value.trim().toLowerCase() !== "reboot") {
            errorBag.value.command = "Command must be 'reboot'."
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
            name: name.value,
            destination: destination.value,
            time_interval: timeInterval.value,
            retry_times: retryTimes.value,
            command: command.value,
        }

        const response = await axios.post(`${getSDControllerApiEndpoint()}/icmpcheck`, {
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
    <NeSideDrawer :isShown="isShown" title="Add ICMP Check" closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="saveRule">
            <div class="space-y-6">
                <NeToggle v-model="service" :label="service ? 'Enabled' : 'Disabled'" :topLabel="'service'" />

                <!-- Show form fields only if service is enabled -->
                <template v-if="service">
                    <NeTextInput label="Task Name" v-model.trim="name" @input="onlyLetters"
                        :invalidMessage="errorBag.name" />

                    <NeTextInput label="Destination" v-model.trim="destination" @input="ipInputHandler"
                        :invalidMessage="errorBag.destination" />

                    <NeTextInput label="Time Interval" v-model.trim="timeInterval" @input="onlyNumbers"
                        :invalidMessage="errorBag.timeInterval" />

                    <NeTextInput label="Retry Times" v-model.trim="retryTimes" @input="onlyNumbers"
                        :invalidMessage="errorBag.retryTimes" />

                    <NeTextInput label="Command" v-model.trim="command" @input="onlyLetters"
                        :invalidMessage="errorBag.command" />
                </template>
            </div>

            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>
                <NeButton kind="primary" type="submit">
                    Save
                </NeButton>
            </div>
        </form>
    </NeSideDrawer>
</template>
