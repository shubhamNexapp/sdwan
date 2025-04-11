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
const service = ref(false);
const status = ref(false)
const baseInterface = ref("eth0");
const interfaceName = ref("");
const vid = ref("");
const peer = ref("");
const port = ref("");
const ipaddr = ref("");

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
        if (!interfaceName.value.trim() || interfaceName.value.length > 16) {
            errorBag.value.interfaceName = "Interface name is required and must be max 16 characters."
        }

        const timeInt = Number(vid.value)
        if (!vid.value.trim() || isNaN(timeInt) || timeInt < 1 || timeInt > 16777215) {
            errorBag.value.vid = "Time Interval must be between 1 and 16777215."
        }

        if (!peer.value.trim().toLowerCase()) {
            errorBag.value.peer = "Peer is required"
        }

        if (!port.value.trim().toLowerCase()) {
            errorBag.value.port = "Port is required"
        }

        if (!ipaddr.value.trim().toLowerCase()) {
            errorBag.value.ipaddr = "ipaddr is required"
        }

    }

    return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
    if (!validate()) return

    try {
        // Collect entries into an array
        const payload = [
            {
                service: service.value ? "enable" : "disable",
                status: status.value ? "connected" : "disconnect",
                interface_name: interfaceName.value,
                base_interface: baseInterface.value,
                vid: vid.value,
                peer: peer.value,
                port: port.value,
                ipaddr: ipaddr.value,
            },
        ]

        console.log("payload=====", payload)

        const response = await axios.post(`${getSDControllerApiEndpoint()}/vxlan`, {
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
    <NeSideDrawer :isShown="isShown" title="Add VXLAN" closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="saveRule">
            <div class="space-y-6">
                <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

                <!-- Show form fields only if status is enabled -->
                <template v-if="service">
                    <NeToggle v-model="status" :label="status ? 'connected' : 'disconnect'" :topLabel="'Status'" />
                    <NeTextInput label="Interface Name" v-model.trim="interfaceName" @input="onlyLetters"
                        :invalidMessage="errorBag.interfaceName" />

                    <label class="mr-4">Interface:</label>
                    <select v-model="baseInterface" class="custom-select">
                        <option value="eth0">eth0</option>
                        <option value="eth1">eth1</option>
                        <option value="eth2">eth2</option>
                        <option value="eth3">eth3</option>
                        <option value="eth4">eth4</option>
                        <option value="eth5">eth5</option>
                    </select>

                    <NeTextInput label="Vid" v-model.trim="vid" @input="onlyNumbers" :invalidMessage="errorBag.vid" />

                    <NeTextInput label="Peer" v-model.trim="peer" @input="ipInputHandler"
                        :invalidMessage="errorBag.peer" />

                    <NeTextInput label="Port" v-model.trim="port" @input="onlyNumbers"
                        :invalidMessage="errorBag.port" />

                    <NeTextInput label="IP" v-model.trim="ipaddr" @input="ipInputHandler"
                        :invalidMessage="errorBag.ipaddr" />
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
