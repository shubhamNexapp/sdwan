<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { getSDControllerApiEndpoint } from '@/lib/config';
import {
    NeButton,
    NeTextInput
} from '@nethesis/vue-components'
import axios from 'axios';
import { ref } from 'vue'

const pingIP = ref(''); // User input for ping IP
let apiResponse = ref()

const loading = ref({ saveRule: false })


const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/ping`, {
            method: 'get-config',
            payload: {}
        });
        if (response.data.code === 200) {
            apiResponse.value = response.data.data.result;
        }
    } catch (err) {
        console.error("Error fetching data:", err);
    }
};

const saveNetworkConfig = async () => {
    loading.value.saveRule = true;
    try {
        const payload = {
            method: "set-config",
            payload: {
                sip: "",
                dip: pingIP.value,
            }
        };
        const response = await axios.post(`${getSDControllerApiEndpoint()}/ping`, payload);
        if (response.data.code === 200) {
            getLists()
        }
    } catch (err) {
        console.error("Error saving data:", err);
    } finally {
        loading.value.saveRule = false;
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
            </div>
            <pre v-if="apiResponse" class="p-2 mt-2 bg-white border rounded">{{ apiResponse }}</pre>
        </div>
    </div>
</template>
