<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
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
  validateRequired,
} from '@/lib/validation'
import NeMultiTextInput from '../NeMultiTextInput.vue'
import { useObjects, type ObjectReference } from '@/composables/useObjects'
import { getSDControllerApiEndpoint } from '@/lib/config';
import axios from 'axios';
import { useNotificationsStore } from '../../../stores/notifications'
// import type { IpsecTunnel } from '@/views/standalone/vpn/IPsecTunnelView.vue'

const notificationsStore = useNotificationsStore()

const props = defineProps({
  itemToEdit: Object,
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
const mtuRef = ref()

const isRuleEnabled = ref(false);
const mtu = ref('');

const sourceType = ref<'source_address' | 'source_object' | 'source_any'>('source_address')
const destinationType = ref<'destination_address' | 'destination_object' | 'destination_any'>(
  'destination_address'
)
const sourceAddresses = ref<string[]>([''])
const destinationAddresses = ref<string[]>([''])
const sourceAddressObject = ref('')
const destinationAddressObject = ref('')
const sourceZone = ref('*')
const destinationZone = ref('*')
const objectSuggestions = ref<ObjectReference[]>([])

const serviceSuggestions = ref<NeComboboxOption[]>([])
const action: Ref<FirewallRuleAction> = ref('DROP')
const protocols = ref<NeComboboxOption[]>([])
const protocolOptions = ref<NeComboboxOption[]>([])
const ports = ref('')
const position = ref('bottom')
const isExpandedAdvancedSettings = ref(false)
const tags: Ref<NeComboboxOption[]> = ref([])
const isLoggingEnabled = ref(false)
const errorBag = ref(new MessageBag())

const service = ref('')
const tunnelName = ref('');
const interfaceName = ref('');
const localVirtulaIP = ref('');
const peerVirtulaIP = ref('');
const localExternIP = ref('');
const peerExternIP = ref('');
const key = ref('');
const netmask = ref('');

const tunnelNameRef = ref('');
const interfaceNameRef = ref('');
const localVirtulaIPRef = ref('');
const peerVirtulaIPRef = ref('');
const localExternIPRef = ref('');
const peerExternIPRef = ref('');
const keyRef = ref('');
const netmaskRef = ref('');

// Watch for changes in `itemToEdit` and populate fields
watch(
  () => props.itemToEdit,
  (newValue) => {
    if (newValue) {

      // Convert service value to a boolean
      service.value = newValue.service; // true if "enable", false if anything else
      tunnelName.value = newValue.tunnel_name || "";
      localVirtulaIP.value = newValue.config?.Local_virtual_ip || "";
      interfaceName.value = newValue.config?.interface_name || "";
      peerVirtulaIP.value = newValue.config?.peer_virtual_ip || "";
      localExternIP.value = newValue.config?.Local_extern_ip || "";
      peerExternIP.value = newValue.config?.peer_extern_ip || "";
      mtu.value = newValue.config?.mtu || "";
      key.value = newValue.config?.key || "";
      netmask.value = newValue.config?.netmask || "";
    }
  },
  { deep: true, immediate: true }
);

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

  const requiredFields = [
    { key: 'tunnelName', value: tunnelName, ref: tunnelNameRef },
    { key: 'interfaceName', value: interfaceName, ref: interfaceNameRef },
    { key: 'localVirtulaIP', value: localVirtulaIP, ref: localVirtulaIPRef },
    { key: 'peerVirtulaIP', value: peerVirtulaIP, ref: peerVirtulaIPRef },
    { key: 'localExternIP', value: localExternIP, ref: localExternIPRef },
    { key: 'peerExternIP', value: peerExternIP, ref: peerExternIPRef },
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
  tunnelName,
  interfaceName,
  localVirtulaIP,
  peerVirtulaIP,
  localExternIP,
  peerExternIP,
};

Object.keys(fieldsToWatch).forEach((fieldKey) => {
  watch(fieldsToWatch[fieldKey], (newValue) => {
    if (newValue !== "") {
      errorBag.value.delete(fieldKey); // ✅ Removes the error message when the user types
    }
  });
});

async function saveRule() {
  try {
    if (!validate()) return;

    let isService

    if (service.value) {
      isService = "enable"
    } else {
      isService = "disable"
    }
    const payload = {
      service: isService,
      tunnel_name: tunnelName.value,
      interface_name: interfaceName.value,
      Local_virtual_ip: localVirtulaIP.value,
      peer_virtual_ip: peerVirtulaIP.value,
      Local_extern_ip: localExternIP.value,
      peer_extern_ip: peerExternIP.value,
      mtu: mtu.value,
      netmask: netmask.value,
      key: key.value,
    };

    const response = await axios.post(`${getSDControllerApiEndpoint()}/gre`, {
      method: 'add-config',
      payload
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: 'Success',
        description: 'Configuration updated successfully.',
        kind: 'success'
      });

      // Reset form after successful save
      errorBag.value.clear();
      emit('save', payload);

      // ✅ Close the drawer after saving
      closeDrawer();

    } else {
      throw new Error('Failed to save configuration.');
    }

  } catch (err) {
  }
}

</script>

<template>
  <NeSideDrawer :isShown="isShown" :title="t('standalone.gre.edit_tunnel')"
    :closeAriaLabel="t('standalone.wire_guard.add_client_tunnel')" @close="closeDrawer">
    <form>
      <div class="space-y-6">

        <NeToggle v-model="service" :label="service ? t('Disable') : t('Enable')" :topLabel="t('Service')"
          :disabled="loading.saveRule" />

        <NeInlineNotification v-if="isEditingRule && props.currentRule?.system_rule" kind="warning"
          :title="t('standalone.firewall_rules.editing_system_rule_warning_title')"
          :description="t('standalone.firewall_rules.editing_system_rule_warning_description')" />

        <NeTextInput :label="t('standalone.gre.tunnel_name')" v-model.trim="tunnelName"
          :invalidMessage="errorBag.getFirstFor('tunnelName')" :disabled="loading.saveRule" ref="tunnelNameRef" />

        <NeTextInput :label="t('standalone.gre.interface_name')" v-model.trim="interfaceName"
          :invalidMessage="errorBag.getFirstFor('interfaceName')" :disabled="loading.saveRule" ref="interfaceNameRef" />

        <NeTextInput :label="t('standalone.gre.local_virtual_ip')" v-model.trim="localVirtulaIP"
          :invalidMessage="errorBag.getFirstFor('localVirtulaIP')" :disabled="loading.saveRule"
          ref="localVirtulaIPRef" />

        <NeTextInput :label="t('standalone.gre.peer_virtual_ip')" v-model.trim="peerVirtulaIP"
          :invalidMessage="errorBag.getFirstFor('peerVirtulaIP')" :disabled="loading.saveRule" ref="peerVirtulaIPRef" />

        <NeTextInput :label="t('standalone.gre.local_extern_ip')" v-model.trim="localExternIP"
          :invalidMessage="errorBag.getFirstFor('localExternIP')" :disabled="loading.saveRule" ref="localExternIPRef" />

        <NeTextInput :label="t('standalone.gre.peer_extern_ip')" v-model.trim="peerExternIP"
          :invalidMessage="errorBag.getFirstFor('peerExternIP')" :disabled="loading.saveRule" ref="peerExternIPRef" />

        <NeTextInput :label="t('standalone.gre.key')" v-model.trim="key" :invalidMessage="errorBag.getFirstFor('key')"
          :disabled="loading.saveRule" ref="keyRef" />

        <NeTextInput :label="t('standalone.gre.mtu')" v-model.trim="mtu" :invalidMessage="errorBag.getFirstFor('mtu')"
          :disabled="loading.saveRule" ref="mtuRef" />

        <NeTextInput :label="t('standalone.gre.net_mask')" v-model.trim="netmask"
          :invalidMessage="errorBag.getFirstFor('netmask')" :disabled="loading.saveRule" ref="netmaskRef" />

      </div>
      <!-- footer -->
      <hr class="my-8 border-gray-200 dark:border-gray-700" />
      <div class="flex justify-end">
        <NeButton kind="tertiary" size="lg" @click.prevent="closeDrawer" :disabled="loading.saveRule" class="mr-3">
          {{ t('common.cancel') }}
        </NeButton>
        <NeButton kind="primary" size="lg" @click.prevent="saveRule" :disabled="loading.saveRule"
          :loading="loading.saveRule">
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
