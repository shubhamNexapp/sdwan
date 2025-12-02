<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { NeButton, NeInlineNotification, getAxiosErrorMessage } from '@nethesis/vue-components'
import { getSDControllerApiEndpoint } from '@/lib/config'

interface LoopbackRule {
  ifname: string
  ipaddr: string
  status: string
}

const props = defineProps<{
  visible: boolean
  loopback?: LoopbackRule | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'reloadData'): void
}>()

const loading = ref(false)
const error = ref('')

async function confirmDelete() {
  if (!props.loopback) return

  loading.value = true
  error.value = ''

  try {
    // adjust "method" for your backend
    await axios.post(`${getSDControllerApiEndpoint()}/loopback`, {
      method: 'delete-rule',
      payload: { ifname: props.loopback.ifname }
    })

    emit('reloadData')
    emit('close')
  } catch (err: any) {
    console.error(err)
    error.value = getAxiosErrorMessage(err)
  }

  loading.value = false
}

function close() {
  if (!loading.value) {
    emit('close')
  }
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
  >
    <div
      class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700"
    >
      <h3 class="mb-3 text-lg font-semibold">
        Delete loopback device
      </h3>

      <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Are you sure you want to delete loopback
        <span class="font-semibold">{{ loopback?.ifname }}</span>?
      </p>

      <NeInlineNotification
        v-if="error"
        kind="error"
        :title="error"
        class="mb-4"
      />

      <div class="mt-4 flex items-center justify-end gap-4">
        <button
          type="button"
          class="text-sm font-medium text-blue-600 hover:underline"
          :disabled="loading"
          @click="close"
        >
          Cancel
        </button>
        <NeButton
          kind="danger"
          type="button"
          :loading="loading"
          @click="confirmDelete"
        >
          Delete
        </NeButton>
      </div>
    </div>
  </div>
</template>
