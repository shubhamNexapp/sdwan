<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script lang="ts" setup>
import type { PropType } from 'vue'
import { computed, onMounted, reactive, ref, toRef } from 'vue'
import type { Policy } from '@/composables/useMwan'
import {
  NeCombobox,
  type NeComboboxOption,
  NeInlineNotification,
  NeButton,
  NeSideDrawer,
  NeSkeleton,
  NeFormItemLabel,
  NeRadioSelection,
  NeTextInput
} from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import { usePolicyForm } from '@/composables/usePolicyForm'
import { MessageBag, validateRequired } from '@/lib/validation'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useFirewallStore, Zone } from '@/stores/standalone/firewall'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { ubusCall, ValidationError } from '@/lib/standalone/ubus'
import type { AxiosError } from 'axios'

const { t } = useI18n()

const firewall = useFirewallStore()

const labelElement = ref<HTMLInputElement | null>(null)

onMounted(() => {
  firewall.fetch()
})

const props = defineProps({
  policy: {
    type: Object as PropType<Policy>
  }
})

const emit = defineEmits(['close', 'success'])

const policyForm = reactive(usePolicyForm(toRef(() => props.policy)))
const messageBag = ref(new MessageBag())
const loading = ref(false)
const error = ref<Error>()

const availableGateways = computed((): Array<NeComboboxOption> => {
  return firewall.zonesWithoutAliases
    .filter((zone: Zone) => zone.configName == 'ns_wan')
    .map((zone: Zone) => zone.interfaces)
    .flat()
    .map((name: string) => {
      return {
        id: name,
        label: name
      }
    })
})

function close() {
  emit('close')
  cleanForm()
}
function cleanForm() {
  policyForm.cleanForm()
  messageBag.value.clear()
}

/**
 * Validation form.
 */
function validate(): boolean {
  messageBag.value = new MessageBag()
  let errMessage = validateRequired(policyForm.label).errMessage
  if (errMessage) {
    messageBag.value.set('name', [errMessage.valueOf()])
    labelElement.value?.focus()
  }
  policyForm.priorities.flat().forEach((priority, index) => {
    errMessage = validateRequired(priority.id).errMessage
    if (errMessage) {
      messageBag.value.set(`interfaces.${index}.name`, [errMessage.valueOf()])
    }
  })
  return !(messageBag.value.size > 0)
}

function submit() {
  if (validate()) {
    ubusCall('ns.mwan', 'edit_policy', {
      name: props.policy?.name,
      label: policyForm.label,
      interfaces: policyForm.priorities
        .map((gateways, index) =>
          gateways.map((gateway) => {
            return {
              name: gateway.id,
              metric: (index + 1) * 10,
              weight: gateway.weight
            }
          })
        )
        .flat()
    })
      .then(() => {
        emit('success')
      })
      .catch((reason: ValidationError) => {
        messageBag.value = reason.errorBag
      })
      .catch((reason: AxiosError) => {
        error.value = reason
      })
      .finally(() => {
        loading.value = false
      })
  }
}
</script>

<template>
  <NeSideDrawer
    :is-shown="policy != undefined"
    :title="t('standalone.multi_wan.edit_policy', { name: policyForm.label })"
    @close="close()"
  >
    <NeInlineNotification v-if="firewall.error" :kind="'error'" :title="firewall.error.message" />
    <div v-else class="space-y-8">
      <NeTextInput
        ref="labelElement"
        v-model.trim="policyForm.label"
        disabled
        :invalid-message="messageBag.getFirstI18nKeyFor('name')"
        :label="t('standalone.multi_wan.label_input_label')"
      />
      <NeRadioSelection
        v-model="policyForm.selection"
        :label="t('standalone.multi_wan.behave_picker.choose_behaviour')"
        :options="policyForm.policyOptionSelection"
        :screen-reader-help-text="t('standalone.multi_wan.behave_picker.choose_behaviour_sr')"
      />
      <NeSkeleton v-if="firewall.loading" :lines="10" />
      <template v-else>
        <div
          v-for="(priority, priorityIndex) in policyForm.priorities"
          :key="priorityIndex"
          class="space-y-4"
        >
          <NeFormItemLabel v-if="policyForm.priorities.length > 1">
            {{ t('standalone.multi_wan.priority', priorityIndex + 1) }}
          </NeFormItemLabel>
          <template v-for="(gateway, index) in priority" :key="index">
            <div class="flex gap-x-4">
              <NeCombobox
                v-model="gateway.id"
                :invalid-message="t(messageBag.getFirstI18nKeyFor(`interfaces.${index}.name`))"
                :options="availableGateways"
                :placeholder="t('standalone.multi_wan.choose_gateway')"
                class="grow"
                :noResultsLabel="t('ne_combobox.no_results')"
                :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                :noOptionsLabel="t('ne_combobox.no_options_label')"
                :selected-label="t('ne_combobox.selected')"
                :user-input-label="t('ne_combobox.user_input_label')"
                :optionalLabel="t('common.optional')"
              />
              <NeTextInput
                v-if="policyForm.selection != 'backup'"
                v-model.number="gateway.weight"
                :invalid-message="t(messageBag.getFirstI18nKeyFor(`interfaces.${index}.weight`))"
                :placeholder="t('standalone.multi_wan.weight')"
              />
              <NeButton
                :disabled="policyForm.isTrashButtonDisabled"
                @click="policyForm.removePriority(priorityIndex, index)"
              >
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </NeButton>
            </div>
          </template>
          <NeButton
            v-if="policyForm.selection != 'backup'"
            :kind="'tertiary'"
            @click="policyForm.addGateway(priorityIndex)"
          >
            {{ t('standalone.multi_wan.add_gateway') }}
          </NeButton>
        </div>
      </template>
      <NeButton v-if="policyForm.selection != 'balance'" @click="policyForm.addPriority()">
        <template #prefix>
          <FontAwesomeIcon :icon="faPlus" />
        </template>
        Add Priority level
      </NeButton>
      <hr />
      <div class="flex justify-end gap-4">
        <NeButton :disabled="loading" :kind="'tertiary'" @click="close()">
          {{ t('common.cancel') }}
        </NeButton>
        <NeButton :disabled="loading" :kind="'primary'" :loading="loading" @click="submit()">
          {{ t('common.edit') }}
        </NeButton>
      </div>
    </div>
  </NeSideDrawer>
</template>
