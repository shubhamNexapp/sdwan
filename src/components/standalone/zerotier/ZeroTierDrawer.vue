<!--
  Copyright (C) 2024 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import {
  NeCombobox,
  type NeComboboxOption,
  NeTooltip,
  NeInlineNotification,
  NeSideDrawer,
  NeButton,
  NeRadioSelection,
  NeTextInput,
  getAxiosErrorMessage,
  NeToggle,
  focusElement
} from '@nethesis/vue-components'
import { ref, computed, type PropType, type Ref, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useFirewallStore,
  type RuleService,
  type RuleHost,
  type FirewallRuleAction,
  type FirewallRule
} from '@/stores/standalone/firewall'
import { ValidationError, ubusCall } from '@/lib/standalone/ubus'
import {
  MessageBag,
  validateIpAddressRange,
  validateIpAddress,
  validateIpCidr,
  validatePortListOrRange,
  validateRequired,
  validateRequiredOption,
  validateAnyOf
} from '@/lib/validation'
import NeMultiTextInput from '../NeMultiTextInput.vue'
import { useObjects, type ObjectReference } from '@/composables/useObjects'
import { getSDControllerApiEndpoint } from '@/lib/config';
import axios from 'axios';
import { useNotificationsStore } from '../../../stores/notifications'

const notificationsStore = useNotificationsStore()

const props = defineProps({

  ruleType: {
    type: String as PropType<'forward' | 'input' | 'output'>,
    required: true
  },
  currentRule: {
    type: Object as PropType<FirewallRule>
  },
  isDuplicatingRule: {
    type: Boolean,
    default: false
  },
  isShown: { type: Boolean, default: false },
  knownTags: {
    type: Array as PropType<NeComboboxOption[]>,
    required: true
  }
})

const emit = defineEmits(['close', 'reloadData', 'save'])

const { t } = useI18n()
const { getObjectIcon } = useObjects()

const firewallConfig = useFirewallStore()
// const isRuleEnabled = ref(true)
const name = ref('')
const nameRef = ref()
const zeroTierIDRef = ref()

const isRuleEnabled = ref(false);
const zeroTierID = ref('');


const sourceType = ref<'source_address' | 'source_object' | 'source_any'>('source_address')
const destinationType = ref<'destination_address' | 'destination_object' | 'destination_any'>(
  'destination_address'
)
const sourceAddresses = ref<string[]>([''])
const serverPortIP = ref<string[]>([''])
const destinationAddresses = ref<string[]>([''])
const sourceAddressObject = ref('')
const destinationAddressObject = ref('')
const sourceAddressObjectRef = ref()
const destinationAddressObjectRef = ref()
const sourceZone = ref('*')
const sourceZoneRef = ref()
const destinationZone = ref('*')
const destinationZoneRef = ref()
const objectSuggestions = ref<ObjectReference[]>([])
const service = ref('*')
const serviceRef = ref()
const serviceSuggestions = ref<NeComboboxOption[]>([])
const action: Ref<FirewallRuleAction> = ref('DROP')
const protocols = ref<NeComboboxOption[]>([])
const protocolsRef = ref()
const protocolOptions = ref<NeComboboxOption[]>([])
const ports = ref('')
const portsRef = ref()
const position = ref('bottom')
const isExpandedAdvancedSettings = ref(false)
const tags: Ref<NeComboboxOption[]> = ref([])
const isLoggingEnabled = ref(false)
const errorBag = ref(new MessageBag())
const sourceAddressesErrors = ref<string[]>([])
const serverPortIPError = ref<string[]>([])
const destinationAddressesErrors = ref<string[]>([])


let loading = ref({
  listServiceSuggestions: false,
  listObjectSuggestions: false,
  listProtocols: false,
  saveRule: false
})

let error = ref({
  listServiceSuggestions: '',
  listServiceSuggestionsDetails: '',
  listObjectSuggestions: '',
  listObjectSuggestionsDetails: '',
  listProtocols: '',
  listProtocolsDetails: '',
  saveRule: '',
  saveRuleDetails: ''
})

const isCreatingRule = computed(() => {
  return !props.currentRule
})

const isEditingRule = computed(() => {
  return !!props.currentRule && !props.isDuplicatingRule
})


watch(
  () => props.isShown,
  () => {
    if (props.isShown) {
      clearErrors()
      errorBag.value.clear()

      nextTick(() => {
        focusElement(nameRef)
      })
      listServiceSuggestions()
      listObjectSuggestions()

      if (isCreatingRule.value) {
        // creating rule, reset form to defaults
        isRuleEnabled.value = true
        name.value = ''
        sourceType.value = 'source_address'
        destinationType.value = 'destination_address'
        sourceAddresses.value = ['']
        sourceAddressObject.value = ''
        destinationAddresses.value = ['']
        destinationAddressObject.value = ''
        sourceZone.value = '*'
        destinationZone.value = '*'
        service.value = '*'
        action.value = 'DROP'
        protocols.value = []
        ports.value = ''
        position.value = 'bottom'
        tags.value = []
        isLoggingEnabled.value = false
        isExpandedAdvancedSettings.value = false
      } else if (props.currentRule) {
        // editing or duplicating rule
        isRuleEnabled.value = props.currentRule.enabled || false
        // source/destination addresses will be set inside listObjectSuggestions
        sourceZone.value = props.currentRule.src || '*'
        destinationZone.value = props.currentRule.dest || '*'
        service.value = '*'
        protocols.value = []
        // service, protocols and ports will be set inside listServiceSuggestions
        action.value = props.currentRule.target || 'DROP'
        position.value = 'bottom'
        tags.value =
          props.currentRule.ns_tag?.map((tag) => {
            return {
              id: tag,
              label: tag
            }
          }) || []
        isLoggingEnabled.value = props.currentRule.log || false
        isExpandedAdvancedSettings.value = tags.value.length > 0 || isLoggingEnabled.value

        // rule name
        if (isEditingRule.value) {
          name.value = props.currentRule.name || ''
        } else {
          // duplicating rule
          name.value = t('standalone.firewall_rules.duplicated_rule_name', {
            name: props.currentRule.name
          })
        }
      }
    }
  }
)

watch(
  () => service.value,
  () => {
    if (service.value === 'custom') {
      listProtocols()
    }
  }
)

function mapSourceAddressesToUi(rule: FirewallRule) {
  if (!rule.src_ip) {
    return []
  }
  const srcAddresses = []

  if (rule.ns_src) {
    // source address is an object
    sourceType.value = 'source_object'
    sourceAddressObject.value = rule.ns_src
  } else {
    if (rule.src_ip.length) {
      sourceType.value = 'source_address'

      for (const srcIp of rule.src_ip) {
        srcAddresses.push((srcIp as RuleHost).value)
      }
    } else {
      sourceType.value = 'source_any'
    }
  }

  if (srcAddresses.length) {
    sourceAddresses.value = srcAddresses
  } else {
    sourceAddresses.value = ['']
  }
}

function mapDestinationAddressesToUi(rule: FirewallRule) {
  if (!rule.dest_ip) {
    return []
  }
  const destAddresses = []

  if (rule.ns_dst) {
    // destination address is an object
    destinationType.value = 'destination_object'
    destinationAddressObject.value = rule.ns_dst
  } else {
    if (rule.dest_ip.length) {
      destinationType.value = 'destination_address'

      for (const destIp of rule.dest_ip) {
        destAddresses.push((destIp as RuleHost).value)
      }
    } else {
      destinationType.value = 'destination_any'
    }
  }

  if (destAddresses.length) {
    destinationAddresses.value = destAddresses
  } else {
    destinationAddresses.value = ['']
  }
}

function closeDrawer() {
  emit('close')
}

function clearErrors() {
  for (const [key, value] of Object.entries(error.value) as [string, any][]) {
    if (typeof value === 'string') {
      // @ts-ignore
      error.value[key] = ''
    } else if (Array.isArray(value)) {
      // @ts-ignore
      error.value[key] = []
    }
  }
}

async function listObjectSuggestions() {
  loading.value.listObjectSuggestions = true

  try {
    const res = await ubusCall('ns.firewall', 'list-object-suggestions')
    objectSuggestions.value = res.data.objects

    if (props.currentRule) {
      // editing or duplicating rule
      mapSourceAddressesToUi(props.currentRule)
      mapDestinationAddressesToUi(props.currentRule)
    }
  } catch (err: any) {
    console.error(err)
    error.value.listObjectSuggestions = t(getAxiosErrorMessage(err))
    error.value.listObjectSuggestionsDetails = err.toString()
  } finally {
    loading.value.listObjectSuggestions = false
  }
}

async function listServiceSuggestions() {
  loading.value.listServiceSuggestions = true

  try {
    const res = await ubusCall('ns.firewall', 'list-service-suggestions')
    serviceSuggestions.value = res.data.services.map((service: RuleService) => {
      const description = t(
        'standalone.firewall_rules.service_ports',
        {
          protocols: service.proto.join('/').toUpperCase(),
          ports: service.port
        },
        1
      )

      return {
        id: service.id,
        label: service.id,
        description,
        protocols: service.proto,
        port: service.port
      }
    })

    if (props.currentRule) {
      // editing or duplicating rule

      if (props.currentRule.ns_service === 'custom') {
        // custom service
        service.value = 'custom'
        // protocols are set inside listProtocols
        ports.value = props.currentRule.dest_port.join(', ') || ''
      } else {
        // standard service
        service.value = props.currentRule.ns_service || '*'
        ports.value = ''
        protocols.value = []
      }
    }
  } catch (err: any) {
    console.error(err)
    error.value.listServiceSuggestions = t(getAxiosErrorMessage(err))
    error.value.listServiceSuggestionsDetails = err.toString()
  } finally {
    loading.value.listServiceSuggestions = false
  }
}

async function listProtocols() {
  loading.value.listProtocols = true

  try {
    const res = await ubusCall('ns.redirects', 'list-protocols')
    const filteredProtocols = res.data.protocols.filter((protocol: string) => {
      return protocol !== 'all'
    })

    protocolOptions.value = filteredProtocols.map((protocol: string) => {
      return {
        id: protocol,
        label: protocol.toUpperCase()
      }
    })

    if (props.currentRule) {
      // editing or duplicating rule

      if (props.currentRule.proto.length && props.currentRule.ns_service === 'custom') {
        protocols.value = props.currentRule.proto.map((proto) => {
          return {
            id: proto,
            label: proto.toUpperCase()
          }
        })
      } else {
        protocols.value = []
      }
    }
  } catch (err: any) {
    console.error(err)
    error.value.listProtocols = t(getAxiosErrorMessage(err))
    error.value.listProtocolsDetails = err.toString()
  } finally {
    loading.value.listProtocols = false
  }
}

const validate = () => {
  errorBag.value.clear();
  let isValid = true;

  const requiredFields  = [
    { key: 'zeroTierID', value: zeroTierID, ref: zeroTierIDRef },
   
  ];

  
  requiredFields.forEach((field) => {
    const validation = validateRequired(field.value.value);
    if (!validation.valid) {
      errorBag.value.set(field.key, t("required"));
      isValid = false;
    }
  });

  return isValid;
};

// ✅ Watch each field separately to clear errors when the user types
const fieldsToWatch: Record<string, Ref<string>> = {
  zeroTierID
};

Object.keys(fieldsToWatch).forEach((fieldKey) => {
  watch(fieldsToWatch[fieldKey], (newValue) => {
    if (newValue !== "") {
      errorBag.value.delete(fieldKey); // ✅ Removes the error message when the user types
    }
  });
});

const saveRule = async () => {

    try {
        if (!validate()) return;

        const payload = {
        service: isRuleEnabled.value,
        join: zeroTierID.value,
    };

    console.log("payload=======",payload)

  const response = await axios.post(`${getSDControllerApiEndpoint()}/zerotier`, {
      method: 'set-config',
      payload: {
        service: isRuleEnabled.value,
        join: zeroTierID.value,
      }
    });


    console.log("response======",response)

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: 'Success',
        description: 'Configuration saved successfully.',
        kind: 'success'
      });

       // Reset form after successful save
        isRuleEnabled.value = false;
      
        errorBag.value.clear();
        emit('save', payload);

        // ✅ Close the drawer after saving
        closeDrawer();

    } else {
      throw new Error('Failed to save configuration.');
    }

    } catch (err) {
    console.error("Error:====", err);
  } 

};

</script>

<template>
  <NeSideDrawer
    :isShown="isShown"
    :title="t('standalone.wire_guard.add_client_tunnel')"
    :closeAriaLabel="t('standalone.wire_guard.add_client_tunnel')"
    @close="closeDrawer"
  >
    <form>
      <div class="space-y-6">
        <!-- editing system rule warning -->
        <NeInlineNotification
          v-if="isEditingRule && props.currentRule?.system_rule"
          kind="warning"
          :title="t('standalone.firewall_rules.editing_system_rule_warning_title')"
          :description="t('standalone.firewall_rules.editing_system_rule_warning_description')"
        />
        <!-- enabled -->
        <NeToggle
          v-model="isRuleEnabled"
          :label="isRuleEnabled ? t('common.enabled') : t('common.disabled')"
          :topLabel="t('common.status')"
          :disabled="loading.saveRule"
        />
         <!-- zero tier id -->
         <NeTextInput
          :label="t('standalone.zero-tier.zero_tier_id')"
          v-model.trim="zeroTierID"
          :invalidMessage="errorBag.getFirstFor('zeroTierID')"
          :disabled="loading.saveRule"
          ref="zeroTierIDRef"
        />
      </div>
      <!-- footer -->
      <hr class="my-8 border-gray-200 dark:border-gray-700" />
      <div class="flex justify-end">
        <NeButton
          kind="tertiary"
          size="lg"
          @click.prevent="closeDrawer"
          :disabled="loading.saveRule"
          class="mr-3"
        >
          {{ t('common.cancel') }}
        </NeButton>
        <NeButton
          kind="primary"
          size="lg"
          @click.prevent="saveRule"
          :disabled="loading.saveRule"
          :loading="loading.saveRule"
        >
          {{
            isCreatingRule
              ? t('standalone.wire_guard.save')
              : t('standalone.wire_guard.save')
          }}
        </NeButton>
      </div>
    </form>
  </NeSideDrawer>
</template>
