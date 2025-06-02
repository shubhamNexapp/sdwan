<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeModal } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import ObjectUsages from './ObjectUsages.vue'

defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  objectName: {
    type: String,
    required: true
  },
  usageIds: {
    type: Array<String>,
    required: true
  },
  showGoToObjectsButton: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
</script>

<template>
  <NeModal
    :visible="visible"
    :title="t('standalone.objects.name_usages', { name: objectName })"
    kind="info"
    :primaryLabel="t('common.close')"
    cancelLabel=""
    :closeAriaLabel="t('common.close')"
    @close="emit('close')"
    @primaryClick="emit('close')"
  >
    <ObjectUsages :usageIds="usageIds" :showGoToObjectsButton="showGoToObjectsButton" />
  </NeModal>
</template>
