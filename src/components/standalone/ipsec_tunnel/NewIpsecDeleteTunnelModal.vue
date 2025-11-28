<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeInlineNotification } from '@nethesis/vue-components'
import { NeModal } from '@nethesis/vue-components'
import { ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'

const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  itemToDelete: string | null
}>()

const emit = defineEmits(['close', 'tunnel-deleted'])

const { visible, itemToDelete } = toRefs(props)
const error = ref({
  notificationDescription: '',
  notificationDetails: ''
})
const isDeleting = ref(false)

async function deleteTunnel() {
  if (itemToDelete.value) {
    try {
      isDeleting.value = true

      const payload = {
        name: itemToDelete.value
      }

      const response = await axios.post(`${getSDControllerApiEndpoint()}/ipsec`, {
        method: 'delete-phase',
        payload
      })

      if (response.data.code === 200) {
        emit('tunnel-deleted')
        close()
      } else {
        throw new Error('Failed to delete configuration.')
      }
    } catch (err: any) {
      error.value = {
        notificationDescription: err?.message || 'Error deleting tunnel.',
        notificationDetails: String(err)
      }
    } finally {
      isDeleting.value = false
    }
  }
}

function close() {
  error.value = {
    notificationDescription: '',
    notificationDetails: ''
  }
  emit('close')
}
</script>

<template>
  <NeModal
    :visible="visible"
    kind="warning"
    :title="t('standalone.ipsec_tunnel.delete_tunnel')"
    :primaryLabel="t('common.delete')"
    :primaryButtonDisabled="isDeleting"
    :primaryButtonLoading="isDeleting"
    :close-aria-label="t('common.close')"
    @primaryClick="deleteTunnel()"
    @close="close()"
  >
    Are you Sure you want to delete?
    <NeInlineNotification
      v-if="error.notificationDescription"
      kind="error"
      :title="t('error.cannot_delete_tunnel')"
      :description="error.notificationDescription"
      class="my-2"
    >
      <template v-if="error.notificationDetails">
        {{ error.notificationDetails }}
      </template>
    </NeInlineNotification>
  </NeModal>
</template>
