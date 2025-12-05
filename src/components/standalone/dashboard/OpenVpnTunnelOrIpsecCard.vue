<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { getSDControllerApiEndpoint } from '@/lib/config'
import { ubusCall } from '@/lib/standalone/ubus'
import { NeCard, NeSkeleton, getAxiosErrorMessage } from '@nethesis/vue-components'
import axios from 'axios'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface TunnelCounters {
  enabled: number
  connected: number
}

const props = defineProps({
  method: { type: String }
})

const { t } = useI18n()

// random refresh interval between 20 and 30 seconds
const REFRESH_INTERVAL = 20000 + Math.random() * 10 * 1000
const counters = ref<TunnelCounters>({ enabled: 0, connected: 0 })
const counterIntervalId = ref(0)

let loading = ref({
  getCounters: false
})

// NOTE: per your request "remove error" — no error reactive state is used.

onMounted(() => {
  getCounters()

  // periodically reload data
  counterIntervalId.value = setInterval(getCounters, REFRESH_INTERVAL)
})

onUnmounted(() => {
  if (counterIntervalId.value) {
    clearInterval(counterIntervalId.value)
  }
})

/**
 * Determine counts from the API response.
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

    // normalize the response payload:
    // your sample shows the useful object inside res.data.data,
    // but other backends may return data directly in res.data.
    const responseData = res.data
    const payload = responseData && typeof responseData === 'object' && 'data' in responseData
      ? (responseData as any).data
      : responseData

    const data = payload ?? {}

    const phaseArray: any[] = Array.isArray(data.phase) ? data.phase : []

    // compute enabled = count of phase3 entries
    const enabledCount = phaseArray.filter((p) => String(p.select).toLowerCase() === 'phase3').length

    // compute connectedCount among phase3 entries
    const connectedCount = phaseArray
      .filter((p) => String(p.select).toLowerCase() === 'phase3')
      .reduce((acc, p) => {
        const connectStatus = (p.connect_status || '').toString().toLowerCase()
        if (connectStatus === 'connected') {
          return acc + 1
        }

        // check remote_subnet entries for "(connected)"
        const subs = (p.status && Array.isArray(p.status.remote_subnet)) ? p.status.remote_subnet : []
        const hasConnectedSubnet = subs.some((s: any) => {
          const ss = (s && s.subnet) ? String(s.subnet).toLowerCase() : ''
          return ss.indexOf('(connected)') !== -1
        })

        return acc + (hasConnectedSubnet ? 1 : 0)
      }, 0)

    // set counters (preserve object shape)
    counters.value = {
      enabled: enabledCount,
      connected: connectedCount
    }
  } catch (err: any) {
    // per request, do not expose error UI — log to console only
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
      <NeSkeleton v-if="loading.getCounters" :lines="1" class="w-14"></NeSkeleton>
      <div v-else>
        <div>
          <span class="text-xl">{{ counters.enabled }}</span>
          <span class="ml-2">{{
            t('standalone.dashboard.tunnels_enabled', counters.enabled)
            }}</span>
        </div>
        <div>
          <span class="text-xl">{{ counters.connected }}</span>
          <span class="ml-2">{{
            t('standalone.dashboard.tunnels_connected', counters.connected)
            }}</span>
        </div>
      </div>
    </div>
  </NeCard>
</template>
