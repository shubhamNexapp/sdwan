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
import type { IpsecTunnel } from '@/views/standalone/vpn/IPsecTunnelView.vue'

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
const localNetworkRef = ref()
const listenPortRef = ref()
const listenipRef = ref()
const serverPortRef = ref()
const peerPublicKeyRef = ref()
const allowedIPRef = ref()
const persistKeepAliveRef = ref()
const mtuRef = ref()

const isRuleEnabled = ref(false);
const localNetwork = ref('');
const listenPort = ref('');
const listenip = ref('');
const serverPort = ref('');
const peerPublicKey = ref('');
const allowedIP = ref('');
const persistKeepAlive = ref('');
const mtu = ref('');

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

const actionOptions = ref([
  {
    id: 'DROP',
    label: 'DROP'
  },
  {
    id: 'REJECT',
    label: 'REJECT'
  },
  {
    id: 'ACCEPT',
    label: 'ACCEPT'
  }
])

const positionOptions = ref([
  {
    id: 'bottom',
    label: t('standalone.firewall_rules.add_to_the_bottom')
  },
  {
    id: 'top',
    label: t('standalone.firewall_rules.add_to_the_top')
  }
])

const sourceTypeOptions = ref([
  {
    id: 'source_address',
    label: t('standalone.firewall_rules.enter_one_or_more_addresses')
  },
  {
    id: 'source_object',
    label: t('standalone.firewall_rules.select_an_object')
  },
  {
    id: 'source_any',
    label: t('standalone.firewall_rules.any_source_address')
  }
])

const destinationTypeOptions = ref([
  {
    id: 'destination_address',
    label: t('standalone.firewall_rules.enter_one_or_more_addresses')
  },
  {
    id: 'destination_object',
    label: t('standalone.firewall_rules.select_an_object')
  },
  {
    id: 'destination_any',
    label: t('standalone.firewall_rules.any_destination_address')
  }
])

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

// function validate() {
//   clearErrors()
//   errorBag.value.clear()
//   const ruleNameValidation = validateRequired(name.value)
//   let isValidationOk = true

//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('localNetwork', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(localNetworkRef)
//   }

//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('listenPort', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(listenPortRef)
//   }

//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('listenip', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(listenipRef)
//   }

//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('serverPort', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(serverPortRef)
//   }
  
//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('peerPublicKey', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(peerPublicKeyRef)
//   }

//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('allowedIP', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(allowedIPRef)
//   }

//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('persistKeepAlive', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(persistKeepAliveRef)
//   }

//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('mtu', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(mtuRef)
//   }

//   sourceAddressesErrors.value = []
//   sourceAddresses.value.forEach(() => {
//     sourceAddressesErrors.value.push('')
//   })
  
//   destinationAddressesErrors.value = []
//   destinationAddresses.value.forEach(() => {
//     destinationAddressesErrors.value.push('')
//   })

//   // rule name

//   if (!ruleNameValidation.valid) {
//     errorBag.value.set('name', [t(String(ruleNameValidation.errMessage))])
//     isValidationOk = false
//     focusElement(nameRef)
//   }

//   // source addresses

//   if (props.ruleType !== 'output') {
//     if (sourceType.value === 'source_address') {
//       for (let [index, sourceAddress] of sourceAddresses.value.entries()) {
//         // required

//         const sourceAddressRequiredValidation = validateRequired(sourceAddress)
//         if (!sourceAddressRequiredValidation.valid) {
//           sourceAddressesErrors.value[index] = t(
//             sourceAddressRequiredValidation.errMessage as string
//           )
//           isValidationOk = false
//         } else {
//           // ip, cidr or rage

//           const sourceAddressValidation = validateAnyOf(
//             [validateIpAddress, validateIpCidr, validateIpAddressRange],
//             sourceAddress,
//             t('standalone.firewall_rules.invalid_source_address_value', {
//               value: sourceAddress
//             })
//           )

//           if (!sourceAddressValidation.valid) {
//             sourceAddressesErrors.value[index] = t(sourceAddressValidation.errMessage as string)
//             isValidationOk = false
//           }
//         }
//       }
//     } else if (sourceType.value === 'source_object') {
//       // required

//       const sourceObjectValidation = validateRequired(sourceAddressObject.value)
//       if (!sourceObjectValidation.valid) {
//         errorBag.value.set('ns_src', [t(String(sourceObjectValidation.errMessage))])
//         isValidationOk = false
//         focusElement(sourceAddressObjectRef)
//       }
//     }

//     // source zone

//     const sourceZoneValidation = validateRequired(sourceZone.value)
//     if (!sourceZoneValidation.valid) {
//       errorBag.value.set('src', [t(String(sourceZoneValidation.errMessage))])
//       isValidationOk = false
//       focusElement(sourceZoneRef)
//     }
//   }

//   // destination addresses

//   if (props.ruleType !== 'input') {
//     if (destinationType.value === 'destination_address') {
//       for (let [index, destinationAddress] of destinationAddresses.value.entries()) {
//         // required

//         const destinationAddressRequiredValidation = validateRequired(destinationAddress)
//         if (!destinationAddressRequiredValidation.valid) {
//           destinationAddressesErrors.value[index] = t(
//             destinationAddressRequiredValidation.errMessage as string
//           )
//           isValidationOk = false
//         } else {
//           // ip, cidr or rage

//           const destinationAddressValidation = validateAnyOf(
//             [validateIpAddress, validateIpCidr, validateIpAddressRange],
//             destinationAddress,
//             t('standalone.firewall_rules.invalid_destination_address_value', {
//               value: destinationAddress
//             })
//           )

//           if (!destinationAddressValidation.valid) {
//             destinationAddressesErrors.value[index] = t(
//               destinationAddressValidation.errMessage as string
//             )
//             isValidationOk = false
//           }
//         }
//       }
//     } else if (destinationType.value === 'destination_object') {
//       // required

//       const destinationObjectValidation = validateRequired(destinationAddressObject.value)
//       if (!destinationObjectValidation.valid) {
//         errorBag.value.set('ns_dst', [destinationObjectValidation.errMessage as string])
//         isValidationOk = false
//         focusElement(destinationAddressObjectRef)
//       }
//     }

//     // destination zone

//     const destinationZoneValidation = validateRequired(destinationZone.value)
//     if (!destinationZoneValidation.valid) {
//       errorBag.value.set('dest', [t(String(destinationZoneValidation.errMessage))])
//       isValidationOk = false
//       focusElement(destinationZoneRef)
//     }
//   }

//   // service

//   const serviceValidation = validateRequired(service.value)
//   if (!serviceValidation.valid) {
//     errorBag.value.set('ns_service', [t(String(serviceValidation.errMessage))])
//     isValidationOk = false
//     focusElement(serviceRef)
//   }

//   if (service.value === 'custom') {
//     // protocols

//     let protocolsValidation = validateRequiredOption(protocols.value)
//     if (!protocolsValidation.valid) {
//       errorBag.value.set('proto', [t(String(protocolsValidation.errMessage))])
//       isValidationOk = false
//       focusElement(protocolsRef)
//     }

//     // ports

//     if (isTcpOrUdpProtocolSelected.value) {
//       let portsValidation = validateRequired(ports.value)
//       if (!portsValidation.valid) {
//         errorBag.value.set('dest_port', [t(String(portsValidation.errMessage))])
//         isValidationOk = false
//         focusElement(portsRef)
//       } else {
//         // check ports syntax
//         portsValidation = validatePortListOrRange(ports.value)
//         if (!portsValidation.valid) {
//           errorBag.value.set('dest_port', [t(String(portsValidation.errMessage))])
//           isValidationOk = false
//           focusElement(portsRef)
//         }
//       }
//     }
//   }
//   return isValidationOk
// }

// async function saveRule() {
//   const isValidationOk = validate()

//   if (!isValidationOk) {
//     return
//   }

//   error.value.saveRule = ''
//   error.value.saveRuleDetails = ''
//   loading.value.saveRule = true

//   const ruleData: FirewallRule = {
//     name: name.value,
//     enabled: isRuleEnabled.value,
//     src_ip: [],
//     ns_src: '',
//     src: '',
//     dest_ip: [],
//     ns_dst: '',
//     dest: '',
//     ns_service: service.value,
//     proto: [],
//     dest_port: [],
//     target: action.value,
//     add_to_top: position.value === 'top',
//     ns_tag: tags.value.map((tag) => {
//       return tag.id
//     }),
//     log: isLoggingEnabled.value,
//     system_rule: props.currentRule?.system_rule || false
//   }

//   if (isEditingRule.value && props.currentRule) {
//     ruleData.id = props.currentRule.id
//   }

//   if (props.ruleType !== 'output') {
//     if (sourceType.value === 'source_address') {
//       // source addresses
//       ruleData.src_ip = [
//         ...new Set(
//           sourceAddresses.value.map((address) => {
//             return address
//           })
//         )
//       ]
//     } else if (sourceType.value === 'source_object') {
//       // source address object
//       ruleData.ns_src = sourceAddressObject.value
//     }

//     // source zone
//     ruleData.src = sourceZone.value
//   }

//   if (props.ruleType !== 'input') {
//     if (destinationType.value === 'destination_address') {
//       // destination addresses
//       ruleData.dest_ip = [
//         ...new Set(
//           destinationAddresses.value.map((address) => {
//             return address
//           })
//         )
//       ]
//     } else if (destinationType.value === 'destination_object') {
//       // destination address object
//       ruleData.ns_dst = destinationAddressObject.value
//     }

//     // destination zone
//     ruleData.dest = destinationZone.value
//   }

//   // custom service
//   if (service.value === 'custom') {
//     ruleData.proto = protocols.value.map((protocol) => {
//       return protocol.id
//     })

//     if (isTcpOrUdpProtocolSelected.value) {
//       // remove whitespace from ports
//       ruleData.dest_port = ports.value.replace(/\s/g, '').split(',')
//     }
//   }
//   const apiMethod = isEditingRule.value ? 'edit-rule' : 'add-rule'

//   try {
//     await ubusCall('ns.firewall', apiMethod, ruleData)
//     emit('reloadData')
//     closeDrawer()
//   } catch (err: any) {
//     console.error(err)

//     if (err instanceof ValidationError) {
//       errorBag.value = err.errorBag
//     } else {
//       error.value.saveRule = t(getAxiosErrorMessage(err))
//       error.value.saveRuleDetails = err.toString()
//     }
//   } finally {
//     loading.value.saveRule = false
//   }
// }

const validate = () => {
  errorBag.value.clear();
  let isValid = true;

  const requiredFields  = [
    { key: 'localNetwork', value: localNetwork, ref: localNetworkRef },
    { key: 'listenPort', value: listenPort, ref: listenPortRef },
    { key: 'listenip', value: listenip, ref: listenipRef },
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
  listenip,
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
        localNetwork: localNetwork.value,
        listenPort: listenPort.value,
        listenip: listenip.value,
        serverPort: serverPort.value,
        peerPublicKey: peerPublicKey.value,
        allowedIP: allowedIP.value,
        persistKeepAlive: persistKeepAlive.value,
        mtu: mtu.value,
    };

  const response = await axios.post(`${getSDControllerApiEndpoint()}/wirguard`, {
      method: 'set-config',
      payload: {
        service: isRuleEnabled.value,
        local_network: localNetwork.value,
        listen_port: listenPort.value,
        server_port: serverPort.value,
        peer_public_key: peerPublicKey.value,
        allowed_ips: allowedIP.value,
        persistent_keepalive: persistKeepAlive.value,
        mtu: mtu.value,
      }
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: 'Success',
        description: 'Configuration saved successfully.',
        kind: 'success'
      });

       // Reset form after successful save
        isRuleEnabled.value = false;
        localNetwork.value = "";
        listenPort.value = "";
        listenip.value = "";
        serverPort.value = "";
        peerPublicKey.value = "";
        allowedIP.value = "";
        persistKeepAlive.value = "";
        mtu.value = "";
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
         <!-- local network -->
         <NeTextInput
          :label="t('standalone.wire_guard.local_network')"
          v-model.trim="localNetwork"
          :invalidMessage="errorBag.getFirstFor('localNetwork')"
          :disabled="loading.saveRule"
          ref="localNetworkRef"
        />
         <!-- listen port -->
         <NeTextInput
          :label="t('standalone.wire_guard.listen_port')"
          v-model.trim="listenPort"
          :invalidMessage="errorBag.getFirstFor('listenPort')"
          :disabled="loading.saveRule"
          ref="listenPortRef"
        />
         <!-- listen ip or domain -->
         <NeTextInput
          :label="t('standalone.wire_guard.listen_ip')"
          v-model.trim="listenip"
          :invalidMessage="errorBag.getFirstFor('listenip')"
          :disabled="loading.saveRule"
          ref="listenipRef"
        />
         <!-- server port -->
         <NeTextInput
          :label="t('standalone.wire_guard.server_port')"
          v-model.trim="serverPort"
          :invalidMessage="errorBag.getFirstFor('serverPort')"
          :disabled="loading.saveRule"
          ref="serverPortRef"
        />
        <!-- peer public key -->
        <NeTextInput
          :label="t('standalone.wire_guard.peer_public_key')"
          v-model.trim="peerPublicKey"
          :invalidMessage="errorBag.getFirstFor('peerPublicKey')"
          :disabled="loading.saveRule"
          ref="peerPublicKeyRef"
        />
        <!-- allowed ip -->
        <NeTextInput
          :label="t('standalone.wire_guard.allowed_ip')"
          v-model.trim="allowedIP"
          :invalidMessage="errorBag.getFirstFor('allowedIP')"
          :disabled="loading.saveRule"
          ref="allowedIPRef"
        />
        <!-- allowed ip -->
        <NeTextInput
          :label="t('standalone.wire_guard.persist_keep_alive')"
          v-model.trim="persistKeepAlive"
          :invalidMessage="errorBag.getFirstFor('persistKeepAlive')"
          :disabled="loading.saveRule"
          ref="persistKeepAliveRef"
        />
         <!-- mtu -->
         <NeTextInput
          :label="t('standalone.wire_guard.mtu')"
          v-model.trim="mtu"
          :invalidMessage="errorBag.getFirstFor('mtu')"
          :disabled="loading.saveRule"
          ref="mtuRef"
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
