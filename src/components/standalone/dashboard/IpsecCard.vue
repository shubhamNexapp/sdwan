<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { getSDControllerApiEndpoint } from '@/lib/config'
import { NeCard, NeSkeleton } from '@nethesis/vue-components'
import axios from 'axios'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface TunnelCounters {
    enabled: number
    connected: number
}

defineProps<{
    method?: string
}>()

const { t } = useI18n()

// random refresh interval between 20 and 30 seconds
const REFRESH_INTERVAL = 20000 + Math.random() * 10 * 1000
const counters = ref<TunnelCounters>({ enabled: 0, connected: 0 })
const counterIntervalId = ref<number | undefined>(undefined)

const loading = ref({
    getCounters: false
})

onMounted(() => {
    getCounters()

    // periodically reload data
    counterIntervalId.value = window.setInterval(getCounters, REFRESH_INTERVAL)
})

onUnmounted(() => {
    if (counterIntervalId.value) {
        clearInterval(counterIntervalId.value)
    }
})

/**
 * Determine counts from the API response.
 *
 * Your response shape:
 * {
 *   code: 200,
 *   data: {
 *     phase: [ ... phase1/2/3 objects ... ],
 *     ...
 *   }
 * }
 *
 * Rules:
 *  - enabled = number of phase entries where select === 'phase3'
 *  - connected = among those phase3 entries, count entries that are connected
 *      * connected if connect_status === 'connected'
 *      * OR any status.remote_subnet[].subnet contains "(connected)" (case-insensitive)
 */
async function getCounters() {
    // show skeleton only the first time
    if (!counterIntervalId.value) {
        loading.value.getCounters = true
    }

    try {
        const res = await axios.post(`${getSDControllerApiEndpoint()}/ipsec`, {
            method: 'get-config',
            payload: {}
        })
        console.log('IPSec API response:======', res)
        // normalize response: useful data is in res.data.data
        const responseData = res.data
        const payload =
            responseData && typeof responseData === 'object' && 'data' in responseData
                ? (responseData as any).data
                : responseData

        const data = payload ?? {}

        const phaseArray: any[] = Array.isArray(data.phase) ? data.phase : []

        // enabled = all phase3
        const enabledCount = phaseArray.filter(
            (p) => String(p.select).toLowerCase() === 'phase3'
        ).length

        // connected among phase3
        const connectedCount = phaseArray
            .filter((p) => String(p.select).toLowerCase() === 'phase3')
            .reduce((acc, p) => {
                const connectStatus = (p.connect_status || '').toString().toLowerCase()
                if (connectStatus === 'connected') {
                    return acc + 1
                }

                const subs =
                    p.status && Array.isArray(p.status.remote_subnet)
                        ? p.status.remote_subnet
                        : []
                const hasConnectedSubnet = subs.some((s: any) => {
                    const ss = (s && s.subnet) ? String(s.subnet).toLowerCase() : ''
                    return ss.includes('(connected)')
                })

                return acc + (hasConnectedSubnet ? 1 : 0)
            }, 0)

        counters.value = {
            enabled: enabledCount,
            connected: connectedCount
        }
    } catch (err) {
        // only log, no error UI (per your request)
        console.error(err)
    } finally {
        loading.value.getCounters = false
    }
}
</script>

<template>
    <NeCard :icon="['fas', 'globe']" :skeletonLines="2" :loading="loading.getCounters">
        <!-- title slot -->
        <template #title>
            <slot name="title"></slot>
        </template>
        <div>
            <NeSkeleton v-if="loading.getCounters" :lines="1" class="w-14" />
            <div v-else>
                <div>
                    <span class="text-xl">{{ counters.enabled }}</span>
                    <span class="ml-2">
                        {{ t('standalone.dashboard.tunnels_enabled', counters.enabled) }}
                    </span>
                </div>
                <div>
                    <span class="text-xl">{{ counters.connected }}</span>
                    <span class="ml-2">
                        {{ t('standalone.dashboard.tunnels_connected', counters.connected) }}
                    </span>
                </div>
            </div>
        </div>
    </NeCard>
</template>
