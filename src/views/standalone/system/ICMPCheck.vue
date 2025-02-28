<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  NeHeading,
  NeInlineNotification,
  NeButton,
  NeSkeleton,
  getAxiosErrorMessage
} from '@nethesis/vue-components'
import { NeModal } from '@nethesis/vue-components'
import { ref } from 'vue'
import { ubusCall } from '@/lib/standalone/ubus'
import CertificatesTable from '@/components/standalone/certificates/CertificatesTable.vue'
import DeleteCertificateModal from '@/components/standalone/certificates/DeleteCertificateModal.vue'
import ImportCertificateDrawer from '@/components/standalone/certificates/ImportCertificateDrawer.vue'
import CreateLetsEncryptCertificateDrawer from '@/components/standalone/certificates/CreateLetsEncryptCertificateDrawer.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { onMounted } from 'vue'
import { map } from 'lodash-es'
import { useUciPendingChangesStore } from '@/stores/standalone/uciPendingChanges'

export type Certificate = {
  name: string
  type: 'self-signed' | 'custom' | 'acme'
  path: string
  details: string
  default: boolean
  domain: string
  expiration?: string
  requested_domains?: string[]
  pending?: boolean
  servers: string[]
}

const { t } = useI18n()
const notificationsStore = useNotificationsStore()
const uciChangesStore = useUciPendingChangesStore()

const certificates = ref<Certificate[]>([])
const error = ref({
  notificationTitle: '',
  notificationDescription: '',
  notificationDetails: ''
})
const loading = ref(true)
const fetchError = ref(false)
const selectedCertificate = ref<Certificate>()
const showDeleteCertificateModal = ref(false)
const showCreateCertificateDrawer = ref(false)
const showImportCertificateDrawer = ref(false)
const showCertificateDetailsModal = ref(false)

function clearError() {
  error.value.notificationTitle = ''
  error.value.notificationDescription = ''
  error.value.notificationDetails = ''
}

function openDeleteCertificateModal(itemToDelete: Certificate) {
  selectedCertificate.value = itemToDelete
  showDeleteCertificateModal.value = true
}

function openCertificateDetailsModal(item: Certificate) {
  selectedCertificate.value = item
  showCertificateDetailsModal.value = true
}

async function fetchCertificates() {
  clearError()

  try {
    loading.value = true
    const certificatesData: Record<string, any> = (
      await ubusCall('ns.reverseproxy', 'list-certificates')
    ).data.values
    certificates.value = map(certificatesData, (payload: any, certificateName: string) => ({
      ...payload,
      name: certificateName
    }))
  } catch (err: any) {
    error.value.notificationTitle = t('error.cannot_retrieve_certificates')
    error.value.notificationDescription = t(getAxiosErrorMessage(err))
    error.value.notificationDetails = err.toString()
    fetchError.value = true
  } finally {
    loading.value = false
  }
}

async function setDefaultCertificate(item: Certificate) {
  clearError()

  try {
    await ubusCall('ns.reverseproxy', 'set-default-certificate', {
      name: item.name
    })
  } catch (err: any) {
    error.value.notificationTitle = t('error.cannot_set_default_certificate')
    error.value.notificationDescription = t(getAxiosErrorMessage(err))
    error.value.notificationDetails = err.toString()
    return
  }

  await uciChangesStore.getChanges()
  await fetchCertificates()
}

onMounted(() => {
  fetchCertificates()
})
</script>

<template>
  <NeHeading tag="h3" class="mb-7">ICMP Check</NeHeading>
</template>
