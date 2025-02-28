<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  NeHeading,
  NeButton,
  NeInlineNotification,
  NeSkeleton,
  NeEmptyState,
  getAxiosErrorMessage
} from '@nethesis/vue-components'
import { ref } from 'vue'
import { useUciPendingChangesStore } from '@/stores/standalone/uciPendingChanges'
import { onMounted } from 'vue'
import { ubusCall } from '@/lib/standalone/ubus'
import QoSInterfaceTable from '@/components/standalone/qos/QoSInterfaceTable.vue'
import DeleteQoSInterfaceModal from '@/components/standalone/qos/DeleteQoSInterfaceModal.vue'
import CreateOrEditQoSInterfaceDrawer from '@/components/standalone/qos/CreateOrEditQoSInterfaceDrawer.vue'
import { useFirewallStore } from '@/stores/standalone/firewall'

export type QoSInterface = {
  interface: string
  device: string
  disabled: boolean
  upload: number
  download: number
}

const { t } = useI18n()
const uciChangesStore = useUciPendingChangesStore()
const firewallConfig = useFirewallStore()

const error = ref({
  notificationTitle: '',
  notificationDescription: '',
  notificationDetails: ''
})
const fetchError = ref(false)
const qosInterfaces = ref<QoSInterface[]>([])
const selectedInterface = ref<QoSInterface>()
const loading = ref(false)
const showDeleteInterfaceModal = ref(false)
const showCreateOrEditInterfaceDrawer = ref(false)

function openCreateEditInterfaceDrawer(itemToEdit?: QoSInterface) {
  selectedInterface.value = itemToEdit
  showCreateOrEditInterfaceDrawer.value = true
}

function openDeleteInterfaceModal(itemToDelete: QoSInterface) {
  selectedInterface.value = itemToDelete
  showDeleteInterfaceModal.value = true
}

async function fetchInterfaces() {
  error.value.notificationDescription = ''
  error.value.notificationDetails = ''

  if (firewallConfig.loading || firewallConfig.error) {
    firewallConfig.fetch()
  }

  try {
    loading.value = true
    qosInterfaces.value = (await ubusCall('ns.qos', 'list')).data.rules
  } catch (err: any) {
    error.value.notificationTitle = t('error.cannot_retrieve_qos_interfaces')
    error.value.notificationDescription = t(getAxiosErrorMessage(err))
    error.value.notificationDetails = err.toString()
    fetchError.value = true
  } finally {
    loading.value = false
  }
}

async function toggleInterfaceEnable(qosInterface: QoSInterface) {
  try {
    await ubusCall('ns.qos', 'set-status', {
      interface: qosInterface.interface,
      disabled: !qosInterface.disabled
    })
    await refreshInterfaces()
  } catch (err: any) {
    error.value.notificationTitle = qosInterface.disabled
      ? t('error.cannot_enable_qos_interface')
      : t('error.cannot_disable_qos_interface')
    error.value.notificationDescription = t(getAxiosErrorMessage(err))
    error.value.notificationDetails = err.toString()
  }
}

async function refreshInterfaces() {
  await uciChangesStore.getChanges()
  fetchInterfaces()
}

onMounted(() => {
  fetchInterfaces()
})
</script>

<template>
  <NeHeading tag="h3" class="mb-7">Ping View</NeHeading>
  
</template>
