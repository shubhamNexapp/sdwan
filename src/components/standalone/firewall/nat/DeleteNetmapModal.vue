<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { ubusCall } from '@/lib/standalone/ubus'
import type { NetmapRule } from '@/stores/standalone/firewall'
import { NeInlineNotification, getAxiosErrorMessage } from '@nethesis/vue-components'
import { NeModal } from '@nethesis/vue-components'
import { ref, watch, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  visible: {
    type: Boolean
  },
  rule: {
    type: Object as PropType<NetmapRule>
  }
})

const emit = defineEmits(['close', 'reloadData'])

const { t } = useI18n()

let loading = ref({
  deleteRule: false
})

let error = ref({
  deleteRule: '',
  deleteRuleDetails: ''
})

watch(
  () => props.visible,
  () => {
    if (props.visible) {
      error.value.deleteRule = ''
      error.value.deleteRuleDetails = ''
    }
  }
)

async function deleteRule() {
  if (!props.rule) {
    return
  }
  error.value.deleteRule = ''
  error.value.deleteRuleDetails = ''
  loading.value.deleteRule = true

  try {
    await ubusCall('ns.netmap', 'delete-rule', {
      id: props.rule.id
    })
    emit('close')
    emit('reloadData')
  } catch (err: any) {
    console.error(err)
    error.value.deleteRule = t(getAxiosErrorMessage(err))
    error.value.deleteRuleDetails = err.toString()
  } finally {
    loading.value.deleteRule = false
  }
}
</script>

<template>
  <NeModal
    :visible="visible"
    :title="t('standalone.netmap.delete_netmap')"
    kind="warning"
    :primaryLabel="t('standalone.netmap.delete_netmap')"
    :cancelLabel="t('common.cancel')"
    primaryButtonKind="danger"
    :primaryButtonDisabled="loading.deleteRule"
    :primaryButtonLoading="loading.deleteRule"
    :closeAriaLabel="t('common.close')"
    @close="emit('close')"
    @primaryClick="deleteRule"
  >
    {{ t('standalone.netmap.confirm_delete_rule', { name: rule?.name }) }}
    <NeInlineNotification
      v-if="error.deleteRule"
      kind="error"
      :title="t('error.cannot_delete_netmap')"
      :description="error.deleteRule"
      class="mt-4"
    >
      <template #details v-if="error.deleteRuleDetails">
        {{ error.deleteRuleDetails }}
      </template>
    </NeInlineNotification>
  </NeModal>
</template>
