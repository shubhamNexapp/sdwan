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
const name = ref('')
const nameRef = ref()
const localNetworkRef = ref()
const listenPortRef = ref()
const serverPortRef = ref()
const serverIPRef = ref()
const peerPublicKeyRef = ref()
const allowedIPRef = ref()
const persistKeepAliveRef = ref()
const mtuRef = ref()

const isRuleEnabled = ref(false);
const localNetwork = ref('');
const listenPort = ref('');
// const listenip = ref('');
const serverPort = ref('');
const serverIP = ref('');
const peerPublicKey = ref('');
const allowedIP = ref('');
const persistKeepAlive = ref('');
const mtu = ref('');
const status = ref(false);

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

const drawerTitle = computed(() => {
  if (isEditingRule.value) {
    return t('standalone.firewall_rules.edit_rule')
  } else if (props.isDuplicatingRule) {
    return t('standalone.firewall_rules.duplicate_rule')
  } else {
    switch (props.ruleType) {
      case 'forward':
        return t('standalone.firewall_rules.add_forward_rule')
      case 'input':
        return t('standalone.firewall_rules.add_input_rule')
      case 'output':
        return t('standalone.firewall_rules.add_output_rule')
      default:
        return ''
    }
  }
})

const serviceOptions = computed(() => {
  const staticOptions: NeComboboxOption[] = [
    {
      id: '*',
      label: t('common.any')
    },
    {
      id: 'custom',
      label: t('standalone.firewall_rules.custom_service')
    }
  ]
  return [...staticOptions, ...serviceSuggestions.value]
})

const zoneOptions = computed(() => {
  const anyAddress = {
    id: '*',
    label: t('common.any')
  }

  const zones: NeComboboxOption[] = firewallConfig.zones.map((zone) => {
    return {
      id: zone.name,
      label: zone.name.toUpperCase(),
      description: zone.interfaces?.join(', ')
    }
  })
  return [anyAddress, ...zones]
})


const objectsComboboxOptions = computed(() => {
  return objectSuggestions.value.map((obj) => {
    return {
      id: obj.id,
      label: obj.name,
      description: t(`standalone.objects.subtype_${obj.subtype}`),
      icon: getObjectIcon(obj.subtype)
    }
  })
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

onMounted(() => {
  getLists()
})

const apiResponse = ref()
const getLists = async () => {

  try {

    const response = await axios.post(`${getSDControllerApiEndpoint()}/wireguard`, {
      method: 'get-config',
      payload: {}
    });

    if (response.data.code === 200) {
      apiResponse.value = [response.data.data] // Store API response
    }
  } catch (err) {
    console.error("Error:====", err);
  }
};

watch(
  () => props.itemToEdit,
  (newValue) => {
    if (newValue) {
      isRuleEnabled.value = newValue.isRuleEnabled === 'enable';
      status.value = newValue.status === 'connect';
      localNetwork.value = newValue.local_network || "";
      listenPort.value = newValue.listen_port || "";
      serverIP.value = newValue.server_port || "";
      serverPort.value = newValue.server_port || "";
      peerPublicKey.value = newValue.peer_public_key || "";
      allowedIP.value = newValue.allowed_ips || "";
      persistKeepAlive.value = newValue.persistent_keepalive || "";
      mtu.value = newValue.mtu || "";
    } else {
      // Reset fields if itemToEdit is null (adding a new rule)
      isRuleEnabled.value = false;
      service.value = "disconnect";
      localNetwork.value = "";
      listenPort.value = "";
      serverIP.value = "";
      serverPort.value = "";
      peerPublicKey.value = "";
      allowedIP.value = "";
      persistKeepAlive.value = "";
      mtu.value = "";
    }
  },
  { immediate: true }
);


const validate = () => {
  errorBag.value.clear();
  let isValid = true;

  const requiredFields = [
    { key: 'localNetwork', value: localNetwork, ref: localNetworkRef },
    { key: 'listenPort', value: listenPort, ref: listenPortRef },
    // { key: 'listenip', value: listenip, ref: listenipRef },
    { key: 'serverIP', value: serverIP, ref: serverIPRef },
    { key: 'serverPort', value: serverPort, ref: serverPortRef },
    { key: 'peerPublicKey', value: peerPublicKey, ref: peerPublicKeyRef },
    { key: 'allowedIP', value: allowedIP, ref: allowedIPRef },
    { key: 'persistKeepAlive', value: persistKeepAlive, ref: persistKeepAliveRef },
    { key: 'mtu', value: mtu, ref: mtuRef },
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
  localNetwork,
  listenPort,
  serverIP,
  serverPort,
  peerPublicKey,
  allowedIP,
  persistKeepAlive,
  mtu,
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
      isRuleEnabled: isRuleEnabled.value,
      status: status.value,
      localNetwork: localNetwork.value,
      listenPort: listenPort.value,
      // listenip: listenip.value,
      serverPort: serverPort.value,
      serverIP: serverIP.value,
      peerPublicKey: peerPublicKey.value,
      allowedIP: allowedIP.value,
      persistKeepAlive: persistKeepAlive.value,
      mtu: mtu.value,
    };

    // Always use "set-config" for both adding and updating
    const response = await axios.post(`${getSDControllerApiEndpoint()}/wireguard`, {
      method: "set-config",
      payload: {
        service: isRuleEnabled.value ? "enable" : "disable",
        status: status.value ? "connect" : "disconnect",
        local_network: localNetwork.value,
        listen_port: listenPort.value,
        // listen_ip: listenip.value,
        server_port: serverPort.value,
        server_ip: serverIP.value,
        peer_public_key: peerPublicKey.value,
        allowed_ips: allowedIP.value,
        persistent_keepalive: persistKeepAlive.value,
        mtu: mtu.value,
      }
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: `Configuration ${props.itemToEdit ? "updated" : "added"} successfully.`,
        kind: "success",
      });

      // Reload API data after saving
      getLists();

      // Reset form only if adding a new config
      if (!props.itemToEdit) {
        isRuleEnabled.value = false;
        status.value = false;
        localNetwork.value = "";
        listenPort.value = "";
        // listenip.value = "";
        serverPort.value = "";
        serverIP.value = "";
        peerPublicKey.value = "";
        allowedIP.value = "";
        persistKeepAlive.value = "";
        mtu.value = "";
      }

      errorBag.value.clear();
      emit("save", payload);

      // ✅ Close the drawer after saving
      closeDrawer();
    } else {
      throw new Error("Failed to save configuration.");
    }
  } catch (err) {
    console.error("Error:====", err);
  }
};



</script>

<template>
  <NeSideDrawer :isShown="isShown" :title="t('standalone.wire_guard.add_client_tunnel')"
    :closeAriaLabel="t('standalone.wire_guard.add_client_tunnel')" @close="closeDrawer">
    <form>
      <div class="space-y-6">
        <!-- editing system rule warning -->
        <NeInlineNotification v-if="isEditingRule && props.currentRule?.system_rule" kind="warning"
          :title="t('standalone.firewall_rules.editing_system_rule_warning_title')"
          :description="t('standalone.firewall_rules.editing_system_rule_warning_description')" />
        <!-- enabled -->
        <NeToggle v-model="isRuleEnabled" :topLabel="t('common.status')" :disabled="loading.saveRule" />

        <NeToggle v-model="status" :topLabel="t('Connection')" :disabled="loading.saveRule" />

        <!-- local network -->
        <NeTextInput v-model="localNetwork" :invalidMessage="errorBag.getFirstFor('localNetwork')"
          :label="t('Local Network')" :placeholder="t('Enter Local Network')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput :label="t('standalone.wire_guard.local_network')" v-model.trim="localNetwork"
          :invalidMessage="errorBag.getFirstFor('localNetwork')" :disabled="loading.saveRule" ref="localNetworkRef" /> -->

        <!-- listen port -->
        <NeTextInput v-model="listenPort" :invalidMessage="errorBag.getFirstFor('listenPort')" :label="t('Listen port')"
          :placeholder="t('Enter Listen Port')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput :label="t('standalone.wire_guard.listen_port')" v-model.trim="listenPort"
          :invalidMessage="errorBag.getFirstFor('listenPort')" :disabled="loading.saveRule" ref="listenPortRef" /> -->
        <!-- listen ip or domain -->
        <!-- <NeTextInput
          :label="t('standalone.wire_guard.listen_ip')"
          v-model.trim="listenip"
          :invalidMessage="errorBag.getFirstFor('listenip')"
          :disabled="loading.saveRule"
          ref="listenipRef"
        /> -->
        <!-- server port -->
        <NeTextInput v-model="serverPort" :invalidMessage="errorBag.getFirstFor('serverPort')" :label="t('Server port')"
          :placeholder="t('Enter Server Port')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput :label="t('standalone.wire_guard.server_port')" v-model.trim="serverPort"
          :invalidMessage="errorBag.getFirstFor('serverPort')" :disabled="loading.saveRule" ref="serverPortRef" /> -->

        <!-- server IP -->
        <NeTextInput v-model="serverIP" :invalidMessage="errorBag.getFirstFor('serverIP')" :label="t('Server IP')"
          :placeholder="t('Enter Server IP')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput :label="t('standalone.wire_guard.server_ip')" v-model.trim="serverIP"
          :invalidMessage="errorBag.getFirstFor('serverIP')" :disabled="loading.saveRule" ref="serverIPRef" /> -->

        <!-- peer public key -->
        <NeTextInput v-model="peerPublicKey" :invalidMessage="errorBag.getFirstFor('peerPublicKey')"
          :label="t('Peer Public Key')" :placeholder="t('Enter Peer Public Key')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput :label="t('standalone.wire_guard.peer_public_key')" v-model.trim="peerPublicKey"
          :invalidMessage="errorBag.getFirstFor('peerPublicKey')" :disabled="loading.saveRule" ref="peerPublicKeyRef" /> -->

        <!-- allowed ip -->
        <NeTextInput v-model="allowedIP" :invalidMessage="errorBag.getFirstFor('allowedIP')" :label="t('Allowed IP')"
          :placeholder="t('Enter Allowed IP')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput :label="t('standalone.wire_guard.allowed_ip')" v-model.trim="allowedIP"
          :invalidMessage="errorBag.getFirstFor('allowedIP')" :disabled="loading.saveRule" ref="allowedIPRef" /> -->

        <!-- persist keep alive -->
        <NeTextInput v-model="persistKeepAlive" :invalidMessage="errorBag.getFirstFor('persistKeepAlive')"
          :label="t('Persist Keep Alive')" :placeholder="t('Enter Persist Keep Alive')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput :label="t('standalone.wire_guard.persist_keep_alive')" v-model.trim="persistKeepAlive"
          :invalidMessage="errorBag.getFirstFor('persistKeepAlive')" :disabled="loading.saveRule"
          ref="persistKeepAliveRef" /> -->

        <!-- mtu -->
        <NeTextInput v-model="mtu" :invalidMessage="errorBag.getFirstFor('mtu')" :label="t('MTU')"
          :placeholder="t('Enter MTU')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput :label="t('standalone.wire_guard.mtu')" v-model.trim="mtu"
          :invalidMessage="errorBag.getFirstFor('mtu')" :disabled="loading.saveRule" ref="mtuRef" /> -->

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
