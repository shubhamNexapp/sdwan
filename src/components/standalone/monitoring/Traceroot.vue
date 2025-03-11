<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

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
const loading = ref({ saveRule: false })


const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/traceroute`, {
            method: 'get-config',
            payload: {}
        });
        const result = response.data.data.result;
        if (response.data.code !== 200) {
            getAxiosErrorMessage.value = `Error: ${response.data.message || 'Unknown error'}`;
            stopFetching(); // Stop fetching
            return;
        }

        if (result) {
            apiResponses.value.unshift(result); // Add new response
        } else {
            stopFetching(); // Stop if result is blank
        }

    } catch (err) {
        console.error("Error fetching data:", err);
    }
};

const saveNetworkConfig = async () => {
    loading.value.saveRule = true;
    getAxiosErrorMessage.value = ""
    apiResponses.value = []
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
            getLists()
            startFetching(); // Start interval
        }
    } catch (err) {
        console.error("Error saving data:", err);
    } finally {
        loading.value.saveRule = false;
    }
};


const startFetching = () => {
    stopFetching(); // Ensure no duplicate intervals
    intervalId = setInterval(getLists, 1000); // Fetch every second
};

const stopFetching = () => {
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
                <NeTextInput v-model="pingIP" placeholder="Enter IP to ping" />
                <NeButton @click="saveNetworkConfig" kind="secondary">Ping</NeButton>
                <NeButton @click="stopFetching" kind="danger">Stop</NeButton>
            </div>
            <div v-if="apiResponses.length" class="p-2 mt-2 bg-white border rounded">
                <strong>Responses:</strong>
                <ul class="mt-2 space-y-1">
                    <li v-for="(response, index) in apiResponses" :key="index" class="p-1 border-b">{{ response }}</li>
                </ul>
            </div>
        </div>
    </div>
</template>
