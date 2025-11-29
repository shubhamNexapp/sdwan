<template>
    <div class="space-y-6">
        <!-- Ping API Section -->
        <div class="p-4 mt-4 bg-gray-100 dark:text-gray-700 border border-gray-300 rounded">
            <strong>Ping an IP Address:</strong>
            <div class="flex items-center gap-2 mt-2">
                <NeTextInput v-model="sipIP" placeholder="Enter Source IP" />
                <NeTextInput v-model="pingIP" placeholder="Enter Destination IP" />
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
const sipIP = ref('')

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

const isPingComplete = (responseText: string): boolean => {
    // Matches strings like "4 packets transmitted, 4 received, 0% packet loss, time 3005ms"
    const regex = /\d+\s+packets\s+transmitted,\s+\d+\s+received,\s+\d+% packet loss,\s+time\s+\d+ms/
    return regex.test(responseText)
}

// Fetch new data from API
const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/ping`, {
            method: 'get-config',
            payload: {}
        })

        if (response.data.code !== 200) {
            getAxiosErrorMessage.value = `Error: ${response.data.message || 'Unknown error'}`
            return
        }

        const result = response.data.data?.result

        // ❌ If there is no result at all, stop polling
        if (!result || String(result).trim() === '') {
            stopFetching()
            return
        }

        apiResponses.value.push(result) // Add newest at the top

        // ❌ If bind error appears, stop polling as well
        if (String(result).includes('ping: bind: Address not available')) {
            stopFetching()
        }

        // ✅ Check if response indicates completion
        if (isPingComplete(result)) {
            stopFetching()
        }

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
        // ⚠️ If source or destination IP missing, show warning and do nothing
        if (!pingIP.value || !sipIP.value) {
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
                sip: sipIP.value,
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
