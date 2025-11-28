<script setup lang="ts">
import {
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    getAxiosErrorMessage,
    NeTooltip
} from '@nethesis/vue-components'
import { ref, watch, computed } from 'vue'
import type { PropType } from 'vue'

import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const notificationsStore = useNotificationsStore()

const props = defineProps({
    isShown: { type: Boolean, default: false },
    // when editing, pass one of the phase objects from the "phase" array returned by get-config
    itemToEdit: { type: Object as PropType<any | null>, default: null }
})

const emit = defineEmits(['close', 'save'])

const isEditMode = computed(() => !!props.itemToEdit)

/**
 * Common
 */
const errorBag = ref<{ [key: string]: string }>({})
const loading = ref({
    saveRule: false
})

// which phase form is active
const currentPhase = ref<'phase1' | 'phase2' | 'phase3'>('phase1')

/**
 * Phase 1 fields
 */
const p1PolicyName = ref('')
const p1InitiateMode = ref('main')
const p1Encrypt = ref('des')
const p1Hash = ref('md5')
const p1Auth = ref('psk')
const p1Ike = ref('ikev1')
const p1PreShareKey = ref('')
const p1SelfIdentify = ref('')
const p1MatchIdentify = ref('')
const p1IkeLifetime = ref('28800')
const p1GroupName = ref('group768')
const p1DpdService = ref<'enable' | 'disable'>('disable')
const p1DpdDelay = ref('30')
const p1DpdRetryTimes = ref('4')
const p1DpdAction = ref('none')

/**
 * Phase 2 fields
 */
const p2PolicyName = ref('')
const p2EncryptProtocol = ref('esp')
const p2Encrypt = ref('des')
const p2Hash = ref('md5')
const p2Pfs = ref('open')
const p2GroupName = ref('group768')
const p2Lifetime = ref('3600')
const p2LocalProto = ref('')
const p2LocalPort = ref('')
const p2RemoteProto = ref('')
const p2RemotePort = ref('')
const p2TransportMode = ref('transport')

// Phase 2 subnet fields
const p2LocalSubnet = ref('')
const p2RemoteSubnets = ref<string[]>([''])
const p2RemoteSubnetErrors = ref<string[]>([''])

/**
 * Phase 3 (Ipsec) fields
 */
const p3InterfaceName = ref('')
const p3MatchPhase1 = ref('')
const p3MatchPhase2 = ref('')
const p3DestinationIpOrDomain = ref('')
const p3EncryptInterface = ref('modem')

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const onlyNumbers = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '')
}

const ipDomainInputHandler = (event: Event) => {
    const input = event.target as HTMLInputElement
    // allow letters, digits, dots, dashes
    input.value = input.value.replace(/[^0-9a-zA-Z.\-]/g, '')
    if (input.value.length > 64) {
        input.value = input.value.slice(0, 64)
    }
}

// NEW: allow only CIDR-like input 0-9 . and /
const cidrInputHandler = (event: Event) => {
    const input = event.target as HTMLInputElement
    // keep only digits, dots and slash
    let value = input.value.replace(/[^0-9./]/g, '')

    // ensure at most one slash
    const parts = value.split('/')
    if (parts.length > 2) {
        value = parts[0] + '/' + parts[1]
    }

    input.value = value
}

function resetPhase2Subnets() {
    p2LocalSubnet.value = ''
    p2RemoteSubnets.value = ['']
    p2RemoteSubnetErrors.value = ['']
}

function resetForm() {
    errorBag.value = {}

    currentPhase.value = 'phase1'

    // phase1 defaults
    p1PolicyName.value = ''
    p1InitiateMode.value = 'main'
    p1Encrypt.value = 'des'
    p1Hash.value = 'md5'
    p1Auth.value = 'psk'
    p1Ike.value = 'ikev1'
    p1PreShareKey.value = ''
    p1SelfIdentify.value = ''
    p1MatchIdentify.value = ''
    p1IkeLifetime.value = '28800'
    p1GroupName.value = 'group768'
    p1DpdService.value = 'disable'
    p1DpdDelay.value = '30'
    p1DpdRetryTimes.value = '4'
    p1DpdAction.value = 'none'

    // phase2 defaults
    p2PolicyName.value = ''
    p2EncryptProtocol.value = 'esp'
    p2Encrypt.value = 'des'
    p2Hash.value = 'md5'
    p2Pfs.value = 'open'
    p2GroupName.value = 'group768'
    p2Lifetime.value = '3600'
    p2LocalProto.value = ''
    p2LocalPort.value = ''
    p2RemoteProto.value = ''
    p2RemotePort.value = ''
    p2TransportMode.value = 'transport'
    resetPhase2Subnets()

    // phase3 defaults
    p3InterfaceName.value = ''
    p3MatchPhase1.value = ''
    p3MatchPhase2.value = ''
    p3DestinationIpOrDomain.value = ''
    p3EncryptInterface.value = 'modem'
}

function loadFromItem(item: any) {
    if (!item) return
    const select = item.select || 'phase1'
    if (select === 'phase1' || select === 'Phase1') {
        currentPhase.value = 'phase1'
        p1PolicyName.value = item.policy_name || ''
        p1InitiateMode.value = item.initiate_mode || 'main'
        p1Encrypt.value = item.encrypt || 'des'
        p1Hash.value = item.hash || 'md5'
        p1Auth.value = item.authentication || 'psk'
        p1Ike.value = item.ike || 'ikev1'
        p1PreShareKey.value = item.pre_share_key || ''
        p1SelfIdentify.value = item.self_identify || ''
        p1MatchIdentify.value = item.match_identify || ''
        p1IkeLifetime.value = item.ike_lifetime || '28800'
        p1GroupName.value = item.group_name || 'group768'
        p1DpdService.value = item.dpd_service === 'enable' ? 'enable' : 'disable'
        p1DpdDelay.value = item.dpd_delay || '30'
        p1DpdRetryTimes.value = item.dpd_retry_times || '4'
        p1DpdAction.value = item.dpd_action || 'none'
    } else if (select === 'phase2' || select === 'Phase2') {
        currentPhase.value = 'phase2'
        p2PolicyName.value = item.policy_name || ''
        p2EncryptProtocol.value = item.encryption_protocol || 'esp'
        p2Encrypt.value = item.encrypt || 'des'
        p2Hash.value = item.hash || 'md5'
        p2Pfs.value = item.pfs || 'open'
        p2GroupName.value = item.group_name || 'group768'
        p2Lifetime.value = item.lifetime || '3600'
        if (item.local_protoport) {
            const [proto, port] = String(item.local_protoport).split(':')
            p2LocalProto.value = proto || ''
            p2LocalPort.value = port || ''
        }
        if (item.remote_protoport) {
            const [proto, port] = String(item.remote_protoport).split(':')
            p2RemoteProto.value = proto || ''
            p2RemotePort.value = port || ''
        }
        p2TransportMode.value = item.transport_mode || 'transport'

        // load subnets
        p2LocalSubnet.value = item.local_subnet || ''
        if (Array.isArray(item.remote_subnet) && item.remote_subnet.length > 0) {
            p2RemoteSubnets.value = item.remote_subnet.map((r: any) => r.subnet || '')
        } else {
            p2RemoteSubnets.value = ['']
        }
        p2RemoteSubnetErrors.value = p2RemoteSubnets.value.map(() => '')
    } else {
        // phase3 / ipsec
        currentPhase.value = 'phase3'
        p3InterfaceName.value = item.policy_name || ''
        p3MatchPhase1.value = item.match_phase1 || ''
        p3MatchPhase2.value = item.match_phase2 || ''
        p3DestinationIpOrDomain.value = item.destination_ip_or_domain || ''
        p3EncryptInterface.value = item.encrypt_interface || 'modem'
    }
}

// when drawer opens, reset + optionally load edit data
watch(
    () => props.isShown,
    (shown) => {
        if (shown) {
            resetForm()
            if (props.itemToEdit) {
                loadFromItem(props.itemToEdit)
            }
        }
    }
)

// -----------------------------------------------------------------------------
// Phase 2 subnet helpers
// -----------------------------------------------------------------------------
const addRemoteSubnet = () => {
    p2RemoteSubnets.value.push('')
    p2RemoteSubnetErrors.value.push('')
}

const removeRemoteSubnet = (index: number) => {
    if (p2RemoteSubnets.value.length === 1) return
    p2RemoteSubnets.value.splice(index, 1)
    p2RemoteSubnetErrors.value.splice(index, 1)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------
const validate = () => {
    errorBag.value = {}

    if (currentPhase.value === 'phase1') {
        if (!p1PolicyName.value.trim() || p1PolicyName.value.length > 12) {
            errorBag.value.p1PolicyName = 'Policy Name is required and max length is 12.'
        }
        if (!p1PreShareKey.value.trim() || p1PreShareKey.value.length > 64) {
            errorBag.value.p1PreShareKey = 'Pre Share Key is required and max length is 64.'
        }
        if (p1SelfIdentify.value.length > 128) {
            errorBag.value.p1SelfIdentify = 'Self Identify max length is 128.'
        }
        if (p1MatchIdentify.value.length > 128) {
            errorBag.value.p1MatchIdentify = 'Match Identify max length is 128.'
        }

        const ikeLife = Number(p1IkeLifetime.value)
        if (isNaN(ikeLife) || ikeLife < 120 || ikeLife > 86400) {
            errorBag.value.p1IkeLifetime = 'IKE Lifetime must be between 120 and 86400 seconds.'
        }

        const dpdDelayNum = Number(p1DpdDelay.value)
        if (isNaN(dpdDelayNum) || dpdDelayNum < 1 || dpdDelayNum > 512) {
            errorBag.value.p1DpdDelay = 'DPD Delay must be between 1 and 512 seconds.'
        }

        const dpdRetryNum = Number(p1DpdRetryTimes.value)
        if (isNaN(dpdRetryNum) || dpdRetryNum < 1 || dpdRetryNum > 512) {
            errorBag.value.p1DpdRetryTimes = 'DPD Retry Times must be between 1 and 512.'
        }
    } else if (currentPhase.value === 'phase2') {
        if (!p2PolicyName.value.trim() || p2PolicyName.value.length > 12) {
            errorBag.value.p2PolicyName = 'Policy Name is required and max length is 12.'
        }
        const life = Number(p2Lifetime.value)
        if (isNaN(life) || life < 120 || life > 86400) {
            errorBag.value.p2Lifetime = 'Lifetime must be between 120 and 86400 seconds.'
        }

        // validate local subnet
        if (!p2LocalSubnet.value.trim()) {
            errorBag.value.p2LocalSubnet = 'Local Subnet is required.'
        } else if (p2LocalSubnet.value.length > 128) {
            errorBag.value.p2LocalSubnet = 'Local Subnet max length is 128.'
        }

        // validate remote subnets
        p2RemoteSubnetErrors.value = p2RemoteSubnets.value.map(() => '')
        let hasRemote = false
        p2RemoteSubnets.value.forEach((sub, idx) => {
            const val = sub.trim()
            if (val) {
                hasRemote = true
                if (val.length > 128) {
                    p2RemoteSubnetErrors.value[idx] = 'Remote Subnet max length is 128.'
                }
            }
        })
        if (!hasRemote) {
            errorBag.value.p2RemoteSubnetGeneral = 'At least one Remote Subnet is required.'
        } else if (p2RemoteSubnetErrors.value.some((e) => e)) {
            errorBag.value.p2RemoteSubnetGeneral = 'Please fix invalid Remote Subnet values.'
        }
    } else if (currentPhase.value === 'phase3') {
        // Phase 3 validation
        if (!p3InterfaceName.value.trim() || p3InterfaceName.value.length > 12) {
            errorBag.value.p3InterfaceName = 'Interface Name is required and max length is 12.'
        } else if (!/^[A-Za-z0-9_-]+$/.test(p3InterfaceName.value)) {
            errorBag.value.p3InterfaceName =
                'Interface Name can only contain letters, numbers, underscores (_) and dashes (-), no spaces allowed.'
        }

        if (!p3DestinationIpOrDomain.value.trim() || p3DestinationIpOrDomain.value.length > 64) {
            errorBag.value.p3Destination = 'Destination IP or Domain is required and max length is 64.'
        }
    }

    return Object.keys(errorBag.value).length === 0 && !p2RemoteSubnetErrors.value.some((e) => e)
}

// -----------------------------------------------------------------------------
// Save
// -----------------------------------------------------------------------------
const saveRule = async () => {
    if (!validate()) return

    let payload: any = { select: currentPhase.value }

    if (currentPhase.value === 'phase1') {
        payload = {
            ...payload,
            policy_name: p1PolicyName.value,
            initiate_mode: p1InitiateMode.value,
            encrypt: p1Encrypt.value,
            hash: p1Hash.value,
            authentication: p1Auth.value,
            ike: p1Ike.value,
            pre_share_key: p1PreShareKey.value,
            self_identify: p1SelfIdentify.value,
            match_identify: p1MatchIdentify.value,
            ike_lifetime: p1IkeLifetime.value,
            group_name: p1GroupName.value,
            dpd_service: p1DpdService.value,
            dpd_delay: p1DpdDelay.value,
            dpd_retry_times: p1DpdRetryTimes.value,
            dpd_action: p1DpdAction.value
        }
    } else if (currentPhase.value === 'phase2') {
        payload = {
            ...payload,
            policy_name: p2PolicyName.value,
            encryption_protocol: p2EncryptProtocol.value,
            encrypt: p2Encrypt.value,
            hash: p2Hash.value,
            pfs: p2Pfs.value,
            group_name: p2GroupName.value,
            lifetime: p2Lifetime.value,
            local_protoport: `${p2LocalProto.value}${p2LocalPort.value ? ':' + p2LocalPort.value : ''}`,
            remote_protoport: `${p2RemoteProto.value}${p2RemotePort.value ? ':' + p2RemotePort.value : ''}`,
            transport_mode: p2TransportMode.value,
            local_subnet: p2LocalSubnet.value,
            remote_subnet: p2RemoteSubnets.value
                .map((s) => s.trim())
                .filter((s) => s)
                .map((s) => ({ subnet: s }))
        }
    } else {
        payload = {
            ...payload,
            policy_name: p3InterfaceName.value,
            match_phase1: p3MatchPhase1.value,
            match_phase2: p3MatchPhase2.value,
            destination_ip_or_domain: p3DestinationIpOrDomain.value,
            encrypt_interface: p3EncryptInterface.value
        }
    }

    // choose method depending on add / edit
    const apiMethod = isEditMode.value ? 'edit-phase' : 'add-phase'

    try {
        loading.value.saveRule = true

        const response = await axios.post(`${getSDControllerApiEndpoint()}/ipsec`, {
            method: apiMethod,
            payload
        })

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'Configuration saved successfully.',
                kind: 'success'
            })
            emit('save', payload)
            emit('close')
        }
    } catch (err) {
        console.error('Error saving IPsec config:', getAxiosErrorMessage(err))
    } finally {
        loading.value.saveRule = false
    }
}

const closeDrawer = () => {
    emit('close')
}
</script>

<template>
    <NeSideDrawer :isShown="isShown" :title="isEditMode ? 'Edit IPsec Policy' : 'Add IPsec Policy'"
        closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="saveRule">
            <div class="space-y-6">
                <!-- Select phase -->
                <div>
                    <div class="font-semibold mb-2">Select</div>
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-1">
                            <input type="radio" value="phase1" v-model="currentPhase" />
                            Phase1
                        </label>
                        <label class="flex items-center gap-1">
                            <input type="radio" value="phase2" v-model="currentPhase" />
                            Phase2
                        </label>
                        <label class="flex items-center gap-1">
                            <input type="radio" value="phase3" v-model="currentPhase" />
                            Ipsec
                        </label>
                    </div>
                </div>

                <!-- ======================== PHASE 1 ======================== -->
                <template v-if="currentPhase === 'phase1'">
                    <div class="font-semibold">Basic Settings (Phase 1)</div>

                    <NeTextInput v-model.trim="p1PolicyName" :invalidMessage="errorBag.p1PolicyName" label="Policy Name"
                        placeholder="Enter Policy Name (max 12)" />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Initiate Mode</label>
                            <select v-model="p1InitiateMode" class="w-full border rounded px-2 py-1">
                                <option value="main">main</option>
                                <option value="aggressive">aggressive</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Encrypt</label>
                            <select v-model="p1Encrypt" class="w-full border rounded px-2 py-1">
                                <option value="des">des</option>
                                <option value="3des">3des</option>
                                <option value="aes256">aes256</option>
                                <option value="aes192">aes192</option>
                                <option value="aes128">aes128</option>
                                <option value="aes128gcm8">aes128gcm8</option>
                                <option value="aes128gcm12">aes128gcm12</option>
                                <option value="aes128gcm16">aes128gcm16</option>
                                <option value="aes192gcm8">aes192gcm8</option>
                                <option value="aes192gcm12">aes192gcm12</option>
                                <option value="aes192gcm16">aes192gcm16</option>
                                <option value="aes256gcm8">aes256gcm8</option>
                                <option value="aes256gcm12">aes256gcm12</option>
                                <option value="aes256gcm16">aes256gcm16</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Hash</label>
                            <select v-model="p1Hash" class="w-full border rounded px-2 py-1">
                                <option value="md5">md5</option>
                                <option value="sha1">sha1</option>
                                <option value="sha256">sha256</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Authentication</label>
                            <select v-model="p1Auth" class="w-full border rounded px-2 py-1">
                                <option value="psk">psk</option>
                                <option value="cert">cert</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">IKE</label>
                            <select v-model="p1Ike" class="w-full border rounded px-2 py-1">
                                <option value="ikev1">ikev1</option>
                                <option value="ikev2">ikev2</option>
                                <!-- <option value="ike">ikev1 &amp; ikev2</option> -->
                            </select>
                        </div>
                    </div>

                    <NeTextInput v-model.trim="p1PreShareKey" :invalidMessage="errorBag.p1PreShareKey"
                        label="Pre Share Key" placeholder="Enter Pre Share Key (max 64)" />

                    <NeTextInput v-model.trim="p1SelfIdentify" :invalidMessage="errorBag.p1SelfIdentify"
                        label="Self Identify" placeholder="Max length is 128" />

                    <NeTextInput v-model.trim="p1MatchIdentify" :invalidMessage="errorBag.p1MatchIdentify"
                        label="Match Identify" placeholder="Max length is 128" />

                    <NeTextInput v-model.trim="p1IkeLifetime" @input="onlyNumbers"
                        :invalidMessage="errorBag.p1IkeLifetime" label="IKE Lifetime" placeholder="120-86400 seconds" />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Group Name</label>
                            <select v-model="p1GroupName" class="w-full border rounded px-2 py-1">
                                <option value="group768">group768</option>
                                <option value="group1024">group1024</option>
                                <option value="group1536">group1536</option>
                                <option value="group2048">group2048</option>
                                <option value="group3072">group3072</option>
                                <option value="group4096">group4096</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">DPD Service</label>
                            <div class="flex items-center gap-4">
                                <label class="flex items-center gap-1">
                                    <input type="radio" value="enable" v-model="p1DpdService" />
                                    Enable
                                </label>
                                <label class="flex items-center gap-1">
                                    <input type="radio" value="disable" v-model="p1DpdService" />
                                    Disable
                                </label>
                            </div>
                        </div>
                    </div>

                    <NeTextInput v-model.trim="p1DpdDelay" @input="onlyNumbers" :invalidMessage="errorBag.p1DpdDelay"
                        label="DPD Delay" placeholder="1-512 seconds" />

                    <NeTextInput v-model.trim="p1DpdRetryTimes" @input="onlyNumbers"
                        :invalidMessage="errorBag.p1DpdRetryTimes" label="DPD Retry Times" placeholder="1-512 times" />
                    <div>
                        <label class="block text-sm font-medium mb-1">DPD Action</label>
                        <select v-model="p1DpdAction" class="w-full border rounded px-2 py-1">
                            <option value="none">none</option>
                            <option value="clear">clear</option>
                            <option value="hold">hold</option>
                            <option value="restart">restart</option>
                        </select>
                    </div>

                </template>

                <!-- ======================== PHASE 2 ======================== -->
                <template v-if="currentPhase === 'phase2'">
                    <div class="font-semibold">Basic Settings (Phase 2)</div>

                    <NeTextInput v-model.trim="p2PolicyName" :invalidMessage="errorBag.p2PolicyName" label="Policy Name"
                        placeholder="Enter Policy Name (max 12)" />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- <div>
                            <label class="block text-sm font-medium mb-1">Encryption Protocol</label>
                            <select v-model="p2EncryptProtocol" class="w-full border rounded px-2 py-1">
                                <option value="esp">esp</option>
                                <option value="ah">ah</option>
                            </select>
                        </div> -->

                        <div>
                            <label class="block text-sm font-medium mb-1">Encrypt</label>
                            <select v-model="p2Encrypt" class="w-full border rounded px-2 py-1">
                                <option value="des">des</option>
                                <option value="3des">3des</option>
                                <option value="aes128">aes128</option>
                                <option value="aes256">aes256</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Hash</label>
                            <select v-model="p2Hash" class="w-full border rounded px-2 py-1">
                                <option value="md5">md5</option>
                                <option value="sha1">sha1</option>
                                <option value="sha256">sha256</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">PFS</label>
                            <select v-model="p2Pfs" class="w-full border rounded px-2 py-1">
                                <option value="open">open</option>
                                <option value="close">close</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Group Name</label>
                            <select v-model="p2GroupName" class="w-full border rounded px-2 py-1">
                                <option value="group768">group768</option>
                                <option value="group1024">group1024</option>
                                <option value="group1536">group1536</option>
                            </select>
                        </div>
                    </div>

                    <NeTextInput v-model.trim="p2Lifetime" @input="onlyNumbers" :invalidMessage="errorBag.p2Lifetime"
                        label="Lifetime" placeholder="120-86400 seconds" />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Local Protoport</label>
                            <div class="flex gap-2">
                                <input v-model="p2LocalProto" class="w-1/2 border rounded px-2 py-1" placeholder="47" />
                                <input v-model="p2LocalPort" class="w-1/2 border rounded px-2 py-1" placeholder="0" />
                            </div>
                            <p class="text-xs text-gray-500 mt-1">
                                eg. 47:0 (Only for GRE Over IPsec)
                            </p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Remote Protoport</label>
                            <div class="flex gap-2">
                                <input v-model="p2RemoteProto" class="w-1/2 border rounded px-2 py-1"
                                    placeholder="47" />
                                <input v-model="p2RemotePort" class="w-1/2 border rounded px-2 py-1" placeholder="0" />
                            </div>
                            <p class="text-xs text-gray-500 mt-1">
                                eg. 47:0 (Only for GRE Over IPsec)
                            </p>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Transport Mode</label>
                        <select v-model="p2TransportMode" class="w-full border rounded px-2 py-1">
                            <option value="transport">transport</option>
                            <option value="tunnel">tunnel</option>
                        </select>
                    </div>

                    <!-- Local/Remote subnet section -->
                    <div class="mt-4">
                        <NeTextInput v-model.trim="p2LocalSubnet" @input="cidrInputHandler"
                            :invalidMessage="errorBag.p2LocalSubnet" label="Local Subnet"
                            placeholder="eg. 192.168.6.0/24" />
                        <div class="mt-4">
                            <label class="block text-sm font-medium mb-1">Remote Subnet</label>
                            <div class="space-y-2">
                                <div v-for="(subnet, index) in p2RemoteSubnets" :key="index"
                                    class="flex items-center gap-2">
                                    <NeTextInput v-model.trim="p2RemoteSubnets[index]" @input="cidrInputHandler"
                                        :invalidMessage="p2RemoteSubnetErrors[index]"
                                        :label="index === 0 ? '' : undefined" class="flex-1"
                                        placeholder="eg. 192.168.88.0/24" />
                                    <NeButton v-if="p2RemoteSubnets.length > 1" kind="tertiary" size="sm"
                                        @click.prevent="removeRemoteSubnet(index)">
                                        -
                                    </NeButton>
                                </div>
                            </div>
                            <NeButton kind="primary" size="sm" class="mt-2" @click.prevent="addRemoteSubnet">
                                +
                            </NeButton>
                            <p v-if="errorBag.p2RemoteSubnetGeneral" class="text-xs text-red-600 mt-1">
                                {{ errorBag.p2RemoteSubnetGeneral }}
                            </p>
                        </div>
                    </div>
                </template>

                <!-- ======================== PHASE 3 (IPSEC) ======================== -->
                <template v-if="currentPhase === 'phase3'">
                    <div class="font-semibold">Basic Settings (Ipsec)</div>

                    <NeTextInput v-model.trim="p3InterfaceName" :invalidMessage="errorBag.p3InterfaceName"
                        label="Interface Name" placeholder="Max length is 12" />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Match Phase1</label>
                            <select v-model="p3MatchPhase1" class="w-full border rounded px-2 py-1">
                                <option value="">Select phase1</option>
                                <!-- options should be filled by parent when needed -->
                                <option :value="p1PolicyName" v-if="p1PolicyName">
                                    {{ p1PolicyName }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Match Phase2</label>
                            <select v-model="p3MatchPhase2" class="w-full border rounded px-2 py-1">
                                <option value="">Select phase2</option>
                                <option :value="p2PolicyName" v-if="p2PolicyName">
                                    {{ p2PolicyName }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <NeTextInput v-model.trim="p3DestinationIpOrDomain" @input="ipDomainInputHandler"
                        :invalidMessage="errorBag.p3Destination" label="Destination IP or Domain"
                        placeholder="Max length is 64" />

                    <div>
                        <label class="block text-sm font-medium mb-1">Encrypt Interface</label>
                        <select v-model="p3EncryptInterface" class="w-full border rounded px-2 py-1">
                            <option value="modem">modem</option>
                            <option value="br0">br0</option>
                            <option value="br-lan">br-lan</option>
                        </select>
                    </div>
                </template>
            </div>

            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>

                <NeButton class="ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary" size="lg"
                    @click.prevent="saveRule">
                    <FontAwesomeIcon :icon="['fas', 'floppy-disk']" aria-hidden="true" class="mr-2" />
                    {{ t('common.save') }}
                </NeButton>
            </div>
        </form>
    </NeSideDrawer>
</template>
