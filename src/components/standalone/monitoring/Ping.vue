<template>
    <div class="space-y-6">
        <!-- Ping API Section -->
        <div class="p-4 mt-4 bg-gray-100 dark:text-gray-700 border border-gray-300 rounded">
            <strong>Ping an IP Address:</strong>
            <div class="flex items-center gap-2 mt-2">
                <NeTextInput v-model="pingIP" placeholder="Enter IP to ping" />
                <NeButton @click="saveNetworkConfig" kind="secondary">Ping</NeButton>
                <NeButton @click="stopFetching" kind="danger">Stop</NeButton>
            </div>

            <!-- Scrollable Responses List with Auto-scroll to TOP -->
            <div v-if="apiResponses.length" ref="responseContainer"
                class="p-2 mt-2 overflow-y-auto bg-white border rounded max-h-60 flex flex-col-reverse"
                style="scroll-behavior: smooth">
                <ul class="mt-2 space-y-1">
                    <li v-for="(response, index) in apiResponses" :key="index" class="p-1 border-b">
                        {{ response }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import axios from 'axios'
import {
    getAxiosErrorMessage,
    NeButton,
    NeTextInput
} from '@nethesis/vue-components'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'

const notificationsStore = useNotificationsStore()

const pingIP = ref('')
const apiResponses = ref<string[]>([])
const responseContainer = ref<HTMLElement | null>(null)
const loading = ref({ saveRule: false })
let intervalId: ReturnType<typeof setInterval> | null = null

// Auto-scroll to top
const scrollToTop = async () => {
    await nextTick()
    const container = responseContainer.value
    if (container) {
        container.scrollTop = 0
    }
}

// Watch for new response and scroll to top
watch(apiResponses, () => {
    scrollToTop()
})

// Fetch new data from API
const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/ping`, {
            method: 'get-config',
            payload: {}
        })
        const result = response.data.data.result
        if (response.data.code !== 200) {
            getAxiosErrorMessage.value = `Error: ${response.data.message || 'Unknown error'}`
            return
        }
        apiResponses.value.push(result) // Add newest at the top
    } catch (err) {
        console.error('Error fetching data:', err)
    }
}

// Start Ping
const saveNetworkConfig = async () => {
    loading.value.saveRule = true
    getAxiosErrorMessage.value = ''
    apiResponses.value = []

    try {
        if (!pingIP.value) {
            notificationsStore.createNotification({
                title: 'warning',
                description: 'Please enter IP',
                kind: 'warning'
            })
            return
        }

        const payload = {
            method: 'set-config',
            payload: {
                sip: '',
                dip: pingIP.value
            }
        }

        const response = await axios.post(`${getSDControllerApiEndpoint()}/ping`, payload)
        if (response.data.code === 200) {
            getLists()
            startFetching()
        }
    } catch (err) {
        console.error('Error saving data:', err)
    } finally {
        loading.value.saveRule = false
    }
}

// Start polling
const startFetching = () => {
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(getLists, 1000)
}

// Stop polling
const stopFetching = async () => {
    try {
        const payload = {
            method: 'delete-config',
            payload: {}
        }
        const response = await axios.post(`${getSDControllerApiEndpoint()}/ping`, payload)
        if (response.data.code === 200 && intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    } catch (err) {
        console.error('Error stopping data:', err)
    }
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
}
</script>