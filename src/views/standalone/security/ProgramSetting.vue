<script setup lang="ts">
import {
    NeButton,
    NeToggle,
    NeTextInput,
    NeCombobox,
    NeCheckbox
} from '@nethesis/vue-components'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { useNotificationsStore } from '@/stores/notifications'
import { useI18n } from 'vue-i18n'
import { Saved, Success } from '@/lib/tost'

const loading = ref({ saveRule: false })

const service = ref(false)
const relayHost = ref("")
const port = ref("")
const tlsSecurityLevel = ref("")
const tlsWrapperLevel = ref(false)
const sasAuthEnable = ref(false)
const username = ref("")
const password = ref("")
const defaultAction = ref("")
const workerIp = ref("")
const timeOut = ref("")
const rejectScore = ref("")
const greyListScore = ref("")

const notificationsStore = useNotificationsStore()

const { t } = useI18n()

const errorBag = ref<{ [key: string]: string }>({})

const validateIp = (event: Event) => {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9./]/g, ''); // allow only numbers, dots, slash
    workerIp.value = input.value; // Update your v-model
};

onMounted(() => {
    getLists()
})

const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/rspamd`, {
            method: 'get-config',
            payload: {}
        })

        if (response.data.code === 200 && response.data.data) {

            const newData = response.data.data

            service.value = newData.service === 'enable'
            relayHost.value = newData.postfix_main.relayhost
            port.value = newData.postfix_main.port
            tlsSecurityLevel.value = newData.postfix_main.smtpd_tls_security_level
            tlsWrapperLevel.value = newData.postfix_main.smtp_tls_wrappermode?.toLowerCase() === "yes"
            sasAuthEnable.value = newData.postfix_main.smtp_sasl_auth_enable?.toLowerCase() === "yes"

            username.value = newData.postfix_main.smtp_sasl_usr
            password.value = newData.postfix_main.smtp_sasl_pwd
            defaultAction.value = newData.postfix_main.milter_default_action
            greyListScore.value = newData.rspamd_main.greylist_score
            rejectScore.value = newData.rspamd_main.reject_score
            timeOut.value = newData.rspamd_main.timeout
            workerIp.value = newData.rspamd_main.worker_normal_socket

        }
    } catch (err) {
        console.error('Error fetching data:', err)
    }
}

const onlyNumbers = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '') // Allow only numbers
}

// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) {
        if (!(relayHost.value || '').trim() || relayHost.value.length > 128) {
            errorBag.value.relayHost = "Relay host is required and must be max 128 characters.";
        }

        const portInt = Number(port.value || '');
        if (!(port.value || '').trim() || isNaN(portInt) || portInt < 0 || portInt > 65535) {
            errorBag.value.port = "Port must be between 0 and 65535.";
        }

        if (!(tlsSecurityLevel.value || '').trim()) {
            errorBag.value.tlsSecurityLevel = "TLS security level is required.";
        }

        if (!(defaultAction.value || '').trim()) {
            errorBag.value.defaultAction = "Default action is required.";
        }

        if (!(workerIp.value || '').trim()) {
            errorBag.value.workerIp = "Worker IP is required.";
        }

        if (!tlsSecurityLevel.value) errorBag.value.hash = 'Security level is required';
        if (!defaultAction.value) errorBag.value.hash = 'Default action is required';

    }

    return Object.keys(errorBag.value).length === 0
}


const saveNetworkConfig = async () => {

    if (!validate()) return
    loading.value.saveRule = true
    try {

        let payload = {
            "method": "set-config",
            "payload": {
                service: service.value ? 'enable' : 'disable',
                "postfix_main": {
                    "relayhost": relayHost.value,
                    "port": port.value,
                    "smtpd_tls_security_level": tlsSecurityLevel.value,
                    "smtp_tls_wrappermode": tlsWrapperLevel.value ? "yes" : "no",
                    "smtp_sasl_auth_enable": sasAuthEnable.value ? "yes" : "no",
                    "smtp_sasl_usr": username.value,
                    "smtp_sasl_pwd": password.value,
                    "milter_default_action": defaultAction.value
                },
                "rspamd_main": {
                    "worker_normal_socket": workerIp.value,
                    "timeout": timeOut.value,
                    "reject_score": rejectScore.value,
                    "greylist_score": greyListScore.value
                }
            }
        }

        await axios.post(`${getSDControllerApiEndpoint()}/rspamd`, payload)
        await getLists() // Refresh data after save
        notificationsStore.createNotification({
            title: Success,
            description: Saved,
            kind: 'success'
        })
    } catch (err) {
        console.error('Error saving data:', err)
    } finally {
        loading.value.saveRule = false
    }
}

</script>

<template>
    <div class="flex flex-col gap-y-6">
        <div>

            <NeToggle class="mb-4" v-model="service" :label="service ? 'Enable' : 'Disable'"
                :topLabel="'Service Status'" />

            <template v-if="service">
                <div class="flex mt-4 flex-col w-[500px] my-4 gap-y-3">
                    <NeTextInput v-model="relayHost" :invalidMessage="errorBag.relayHost" :label="t('Relay Host')"
                        :placeholder="t('Enter Relay Host')">
                    </NeTextInput>

                    <NeTextInput v-model="port" :invalidMessage="errorBag.port" @input="onlyNumbers" :label="t('Port')"
                        :placeholder="t('Enter Port')" />

                    <div>
                        <NeCombobox v-model="tlsSecurityLevel" :options="[
                            { label: 'None', id: 'None' },
                            { label: 'May', id: 'May' },
                            { label: 'Encrypt', id: 'Encrypt' },
                        ]" :label="t('The Security Level')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                            :noOptionsLabel="t('ne_combobox.no_options_label')"
                            :selected-label="t('ne_combobox.selected')"
                            :user-input-label="t('ne_combobox.user_input_label')"
                            :optionalLabel="t('common.optional')" />
                        <p v-if="errorBag.tlsSecurityLevel" class="text-sm mt-1" style="color: rgba(190, 18, 60, 0.9);">
                            {{ errorBag.tlsSecurityLevel }}
                        </p>
                    </div>

                    <NeCheckbox v-model="tlsWrapperLevel" :label="t('TLS Wrapper')" />

                    <NeCheckbox v-model="sasAuthEnable" :label="t('SASL Auth Enable')" />

                    <NeTextInput v-model="username" :invalidMessage="errorBag.username" :label="t('Username')"
                        :placeholder="t('Enter Username')">
                    </NeTextInput>

                    <NeTextInput v-model="password" :invalidMessage="errorBag.password" :label="t('Password')"
                        :placeholder="t('Enter Password')">
                    </NeTextInput>

                    <div>
                        <NeCombobox v-model="defaultAction" :options="[
                            { label: 'Accept', id: 'Accept' },
                            { label: 'Reject', id: 'Reject' },
                        ]" :label="t('Default Action')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                            :noOptionsLabel="t('ne_combobox.no_options_label')"
                            :selected-label="t('ne_combobox.selected')"
                            :user-input-label="t('ne_combobox.user_input_label')"
                            :optionalLabel="t('common.optional')" />
                        <p v-if="errorBag.defaultAction" class="text-sm mt-1" style="color: rgba(190, 18, 60, 0.9);">
                            {{ errorBag.defaultAction }}
                        </p>
                    </div>

                    <NeTextInput v-model="workerIp" @input="validateIp" :invalidMessage="errorBag.workerIp"
                        :label="t('Worker IP')" :placeholder="t('Enter Worker IP')">
                    </NeTextInput>

                    <NeTextInput v-model="timeOut" @input="onlyNumbers" :invalidMessage="errorBag.timeOut" :label="t('Time Out')"
                        :placeholder="t('Enter Time Out')">
                    </NeTextInput>

                    <NeTextInput v-model="rejectScore" @input="onlyNumbers" :invalidMessage="errorBag.rejectScore" :label="t('Reject Score')"
                        :placeholder="t('Enter Reject Score')">
                    </NeTextInput>

                    <NeTextInput v-model="greyListScore" @input="onlyNumbers" :invalidMessage="errorBag.greyListScore"
                        :label="t('Grey List Score')" :placeholder="t('Enter Grey List Score')">
                    </NeTextInput>
                </div>
            </template>

            <div class="mt-4 flex justify-end">
                <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
                    Save
                </NeButton>
            </div>
        </div>
    </div>
</template>
