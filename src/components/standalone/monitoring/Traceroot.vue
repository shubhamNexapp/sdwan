<script setup lang="ts">
import { getSDControllerApiEndpoint } from '@/lib/config';
import {
    getAxiosErrorMessage,
    NeButton,
    NeTextInput
} from '@nethesis/vue-components'
import axios from 'axios';
import { ref } from 'vue'

const pingIP = ref(''); // User input for ping IP
const apiResponses = ref<string[]>([]); // Store multiple responses
let intervalId: ReturnType<typeof setInterval> | null = null;
const loading = ref({ saveRule: false });

const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/traceroute`, {
            method: 'get-config',
            payload: {}
        });
        const result = response.data.data.result;

        // Only add the response if it's not an empty string
        if (response.data.code === 200 && result.trim() !== '') {
            apiResponses.value.push(result); // Add only valid response
        }
    } catch (err) {
        console.error("Error fetching data:", err);
    }
};

const saveNetworkConfig = async () => {
    loading.value.saveRule = true;
    getAxiosErrorMessage.value = "";
    apiResponses.value = []; // Clear previous responses

    try {
        const payload = {
            method: "set-config",
            payload: {
                sip: "",
                dip: pingIP.value,
            }
        };
        const response = await axios.post(`${getSDControllerApiEndpoint()}/traceroute`, payload);
        if (response.data.code === 200) {
            startFetching(); // Start continuous fetching
        }
    } catch (err) {
        console.error("Error saving data:", err);
    } finally {
        loading.value.saveRule = false;
    }
};

const startFetching = () => {
    // stopFetching(); // Prevent duplicate intervals
    intervalId = setInterval(getLists, 1000); // Fetch every 10ms
};

const stopFetching = async () => {
    try {
        const payload = {
            method: "delete-config",
            payload: {}
        };
        await axios.post(`${getSDControllerApiEndpoint()}/traceroute`, payload);
    } catch (err) {
        console.error("Error stopping fetching:", err);
    } finally {
        clearIntervalIfNeeded();
    }
};

const clearIntervalIfNeeded = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};
</script>

<template>
    <div class="space-y-6">
        <!-- Ping API Section -->
        <div class="p-4 mt-4 bg-gray-100 border border-gray-300 rounded">
            <strong>Ping an IP Address:</strong>
            <div class="flex items-center gap-2 mt-2">
                <NeTextInput v-model="pingIP" placeholder="Enter IP to Traceroute" />
                <NeButton @click="saveNetworkConfig" kind="secondary">Ping</NeButton>
                <NeButton @click="stopFetching" kind="danger">Stop</NeButton>
            </div>
            <!-- Scrollable Responses List -->
            <div v-if="apiResponses.length" ref="responseContainer"
                class="p-2 mt-2 overflow-y-auto bg-white border rounded max-h-60">
                <strong>Responses:</strong>
                <ul class="mt-2 space-y-1">
                    <li v-for="(response, index) in apiResponses" :key="index" class="p-1 border-b">
                        {{ response }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
