<script setup lang="ts">
import {
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    getAxiosErrorMessage
} from '@nethesis/vue-components'

import { ref, onMounted, watch, } from 'vue'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'

const notificationsStore = useNotificationsStore()

const props = defineProps({
    isShown: { type: Boolean, default: false },
    editData: { type: Object, default: () => ({}) },
    vxlanData: {
        type: Object as () => {
            interface_name: string,
            base_interface: string,
            status: string,
            service: string,
            vid: string,
            peer: string,
            port: string,
            ipaddr: string
        },
        required: true
    }
})

const emit = defineEmits(['close', 'update'])

// Form fields
const service = ref(true)
const status = ref(false)
const baseInterface = ref("eth0")
const interfaceName = ref("")
const vid = ref("")
const peer = ref("")
const port = ref("")
const ipaddr = ref("")

// Error messages
const errorBag = ref<{ [key: string]: string }>({})


// Set form values when editData changes or drawer opens
const setEditFormValues = (data: any) => {
    service.value = data.service === 'enable'
    baseInterface.value = data.base_interface || "eth0"
    interfaceName.value = data.interface_name || ""
    vid.value = data.vid || ""
    peer.value = data.peer || ""
    port.value = data.port || ""
    ipaddr.value = data.ipaddr || ""
}

// Watch for changes in `itemToEdit` and populate fields
watch(
    () => props.vxlanData,
    (newValue) => {
        if (newValue) {
            console.log("newValue======", newValue)

            service.value = newValue.service === 'enable'
            baseInterface.value = newValue.base_interface || "eth0"
            interfaceName.value = newValue.interface_name || ""
            vid.value = newValue.vid || ""
            peer.value = newValue.peer || ""
            port.value = newValue.port || ""
            ipaddr.value = newValue.ipaddr || ""
        }
    },
    { deep: true, immediate: true }
);


// Set initial form values from props
// onMounted(() => {
//     if (props.vxlanData) {
//         console.log("props.vxlanData=====", props)
//         service.value = props.vxlanData.service === 'enable'
//         status.value = props.vxlanData.status === 'connected'
//         baseInterface.value = props.vxlanData.base_interface || "eth0"
//         interfaceName.value = props.vxlanData.interface_name || ""
//         vid.value = props.vxlanData.vid || ""
//         peer.value = props.vxlanData.peer || ""
//         port.value = props.vxlanData.port || ""
//         ipaddr.value = props.vxlanData.ipaddr || ""
//     }
// })

// watch(() => props.editData, (newVal) => {
//     if (newVal && props.isShown) {
//         setEditFormValues(newVal)
//     }
// }, { immediate: true })

// watch(() => props.isShown, (val) => {
//     if (val && props.editData) {
//         setEditFormValues(props.editData)
//     }
// })

// Input sanitizers
const onlyLetters = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '')
}

const onlyNumbers = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '')
}

const ipInputHandler = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9.]/g, '')
    if (input.value.length > 128) {
        input.value = input.value.slice(0, 128)
    }
}

// Validate form
const validate = () => {
    errorBag.value = {}

    if (service.value) {
        if (!interfaceName.value.trim() || interfaceName.value.length > 16) {
            errorBag.value.interfaceName = "Interface name is required and must be max 16 characters."
        }

        const timeInt = Number(vid.value)
        if (!vid.value.trim() || isNaN(timeInt) || timeInt < 1 || timeInt > 16777215) {
            errorBag.value.vid = "Time Interval must be between 1 and 16777215."
        }

        if (!peer.value.trim()) {
            errorBag.value.peer = "Peer is required"
        }

        if (!port.value.trim()) {
            errorBag.value.port = "Port is required"
        }

        if (!ipaddr.value.trim()) {
            errorBag.value.ipaddr = "ipaddr is required"
        }
    }

    return Object.keys(errorBag.value).length === 0
}

// Submit
const updateRule = async () => {
    if (!validate()) return

    try {
        const payload = [
            {
                service: service.value ? "enable" : "disable",
                interface_name: interfaceName.value,
                base_interface: baseInterface.value,
                vid: vid.value,
                peer: peer.value,
                port: port.value,
                ipaddr: ipaddr.value,
            }
        ]

        console.log("Update payload:=== ", payload)

        const response = await axios.post(`${getSDControllerApiEndpoint()}/vxlan`, {
            method: "set-config",
            payload,
        })

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'VXLAN configuration updated.',
                kind: 'success'
            })

            emit('update', payload)
            emit('close')
        }
    } catch (err) {
        console.error("Error updating rule:", getAxiosErrorMessage(err))
    }
}

const closeDrawer = () => {
    emit('close')
}
</script>

<template>
    <NeSideDrawer :isShown="isShown" title="Edit VXLAN" closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="updateRule">
            <div class="space-y-6">
                <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

                <!-- <template v-if="service"> -->
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

                <NeTextInput label="Peer" v-model.trim="peer" @input="ipInputHandler" :invalidMessage="errorBag.peer" />

                <NeTextInput label="Port" v-model.trim="port" @input="onlyNumbers" :invalidMessage="errorBag.port" />

                <NeTextInput label="IP" v-model.trim="ipaddr" @input="ipInputHandler"
                    :invalidMessage="errorBag.ipaddr" />
                <!-- </template> -->
            </div>

            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>
                <NeButton kind="primary" type="submit">
                    Update
                </NeButton>
            </div>
        </form>
    </NeSideDrawer>
</template>

<style scoped>
.custom-select {
    border: 1px solid #ccc;
    padding: 0.5rem;
    border-radius: 0.375rem;
    width: 100%;
}
</style>
