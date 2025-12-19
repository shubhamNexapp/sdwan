<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeInlineNotification, getAxiosErrorMessage } from '@nethesis/vue-components'
import { NeModal } from '@nethesis/vue-components'
import { ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { ubusCall } from '@/lib/standalone/ubus'
import type { Tunnel } from '@/types/tunnel'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { useNotificationsStore } from '../../../stores/notifications'

const notificationsStore = useNotificationsStore()

interface DeleteTunnel {
  id: string;
  name: string;
  local: string[];
  remote: string[];
  enabled: "0" | "1";
  connected: boolean;
  join: string;
}
 
const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  itemToDelete: DeleteTunnel | null;
}>()

const emit = defineEmits(['close', 'tunnel-deleted'])

const { visible, itemToDelete } = toRefs(props)
const error = ref({
  notificationDescription: '',
  notificationDetails: ''
})
const isDeleting = ref(false)


async function deleteTunnel() {
  console.log("itemToDelete.value======",itemToDelete.value)
  if (itemToDelete.value) {
    try {
      error.value = {
        notificationDescription: '',
        notificationDetails: ''
      }
      isDeleting.value = true
      await ubusCall('ns.ipsectunnel', 'delete-tunnel', { id: itemToDelete.value.id })
      emit('tunnel-deleted')
      emit('close')
    } catch (err: any) {
      error.value.notificationDescription = t(getAxiosErrorMessage(err))
      error.value.notificationDetails = err.toString()
    } finally {
      isDeleting.value = false
    }
  }
}

// async function deleteTunnel() {
//   if (itemToDelete.value) {
//     try {
//       const payload = {
//         "id": itemToDelete.value.id,
//       }

//       const response = await axios.post(`${getSDControllerApiEndpoint()}/ipsec`, {
//         method: "delete-tunnel",
//         payload
//       });

//       if (response.data.code === 200) {
//         notificationsStore.createNotification({
//           title: 'Success',
//           description: 'Configuration deleted successfully.',
//           kind: 'success'
//         });
//         close()
//         emit('tunnel-deleted')
//       } else {
//         throw new Error('Failed to delete configuration.');
//       }

//     } catch (err) {
//     }
//   }
// }


function close() {
  error.value = {
    notificationDescription: '',
    notificationDetails: ''
  }
  emit('close')
}
</script>

<template>
  <NeModal :visible="visible" kind="warning" :title="t('standalone.ipsec_tunnel.delete_tunnel')"
    :primaryLabel="t('common.delete')" :primaryButtonDisabled="isDeleting" :primaryButtonLoading="isDeleting"
    :close-aria-label="t('common.close')" @primaryClick="deleteTunnel()" @close="close()">
    {{
      t('standalone.ipsec_tunnel.delete_tunnel_message', {
        name: itemToDelete?.name ?? ''
      })
    }}
    <NeInlineNotification v-if="error.notificationDescription" kind="error" :title="t('error.cannot_delete_tunnel')"
      :description="error.notificationDescription" class="my-2"><template v-if="error.notificationDetails">
        {{ error.notificationDetails }}
      </template></NeInlineNotification>
  </NeModal>
</template>
