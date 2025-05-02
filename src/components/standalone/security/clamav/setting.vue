<script setup lang="ts">
import {
    NeButton,
    NeTextInput,
    NeToggle,
    getAxiosErrorMessage,
    NeTooltip,
    NeCombobox
} from '@nethesis/vue-components'
import { onMounted, ref } from 'vue'
import { useNotificationsStore } from '../../../../stores/notifications'
import Textarea from './Textarea.vue'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();

const notificationsStore = useNotificationsStore()

const emit = defineEmits(['close', 'save'])

// Form fields
const service = ref(false)
const scanPath = ref("system")
const scanInterval = ref("")
const result = ref("")
const autoUpdate = ref(false)
const scanNow = ref(false)

// Validation error messages
const errorBag = ref<{ [key: string]: string }>({})

// Function to allow only letters in string fields
const onlyLetters = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '') // Allow only letters and spaces
}

// Function to allow only numbers in number fields
const onlyNumbers = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '') // Allow only numbers
}

const onlyValidUrlCharacters = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z0-9:\/\.\-\_]/g, '')
}

// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) { // Validate only if enabled

        if (!scanPath.value.trim()) {
            errorBag.value.scanPath = "Scan path required."
        }

        const interval = Number(scanInterval.value.trim())
        const isValidInterval = (
            scanInterval.value.trim() &&
            (interval === 0 || (interval >= 15 && interval <= 65535))
        )

        if (!isValidInterval) {
            errorBag.value.scanInterval = "Scan interval must be 0 or a number between 15 and 65535."
        }
    }

    return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
    if (!validate()) return

    try {
        const payload = {
            service: service.value ? "enable" : "disable",
            scan_path: scanPath.value,
            scan_interval: scanInterval.value,
            result: result.value,
            auto_update: autoUpdate.value ? "enable" : "disable",
            scan_now: scanNow.value ? "enable" : "disable",
        }

        const response = await axios.post(`${getSDControllerApiEndpoint()}/clamav`, {
            method: "set-config",
            payload,
        });

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'Configuration saved successfully.',
                kind: 'success'
            })

            emit('save', payload)
        }
    } catch (err) {
        console.error("Error saving rule:", getAxiosErrorMessage(err))
    }
}

const refreshSave = async () => {

    try {

        const response = await axios.post(`${getSDControllerApiEndpoint()}/clamav`, {
            "method": "refresh-results",
            "payload": {}
        });

        if (response.data.code === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'Refresh successfully.',
                kind: 'success'
            })
            // 👉 Update the result from the API response
            if (response.data.data && response.data.data.result) {
                result.value = response.data.data.result || ''
            }
        } else {
            notificationsStore.createNotification({
                title: 'Error',
                description: 'Somethinh went worng.',
                kind: 'error'
            })
        }

    } catch (err) {
        console.error("Error saving rule:", getAxiosErrorMessage(err))
        notificationsStore.createNotification({
            title: 'Error',
            description: 'Somethinh went worng.',
            kind: 'error'
        })
    }
}

onMounted(() => {
    getLists()
})

let apiResponse = ref()
const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/clamav`, {
            method: 'get-config',
            payload: {}
        });

        console.log("response=====", response)

        if (response.data.code === 200) {
            const data = response.data.data
            // Set form fields
            service.value = data.service === 'enable'
            scanPath.value = data.scan_path || 'system'
            scanInterval.value = data.scan_interval || ''
            result.value = data.result || ''
            autoUpdate.value = data.auto_update === 'enable'
            scanNow.value = data.scan_now === 'enable'
        }
    } catch (err) {
    }
};

</script>

<template>
    <form @submit.prevent="saveRule">
        <div class="space-y-6">
            <NeToggle v-model="service" :label="service ? 'Enabled' : 'Disabled'" :topLabel="'Service'" />
            <template v-if="service">

                <div class="w-[300px]">
                    <NeCombobox v-model="scanPath" :options="[
                    { label: 'system', id: 'system' },
                    { label: 'overall', id: 'overall' },
                    { label: 'cache', id: 'cache' },
                ]" :label="t('Mode')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                    :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                    :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
                    :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />


                    <!-- <label class="mr-4">Scan Path</label>
                    <select v-model="scanPath" style="
                width: 30%;
                height: 36px;
                padding: 6px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s ease-in-out;
              ">
                        <option value="system">system</option>
                        <option value="overall">overall</option>
                        <option value="cache">cache</option>
                    </select> -->
                </div>

                <NeTextInput class="w-[300px]" @input="onlyNumbers" v-model="scanInterval" :invalidMessage="errorBag.scanInterval"
                    :label="t('Scan Interval')" :placeholder="t('Enter Scan Interval')">
                    <template #tooltip>
                        <NeTooltip>
                            <template #content>
                                {{ t('standalone.logs.search_tooltip') }}
                            </template>
                        </NeTooltip>
                    </template>
                </NeTextInput>
                <!-- <NeTextInput label="Scan Interval" v-model.trim="scanInterval" @input="onlyNumbers"
                    :invalidMessage="errorBag.scanInterval" /> -->

                <NeToggle v-model="autoUpdate" :label="autoUpdate ? 'Enable' : 'Disable'" :topLabel="'Auto Update'" />

                <NeToggle v-model="scanNow" :label="scanNow ? 'Enable' : 'Disable'" :topLabel="'Scan Now'" />



                <label class="mr-4 ">Result :</label>
                <Textarea disabled v-model="result" variant="filled" rows="10" cols="30"
                    class="rounded-md border border-gray-300 p-2" />


                <div class="flex justify-start mt-6">
                    <NeButton kind="primary" @click="refreshSave">
                        Refresh
                    </NeButton>
                </div>

            </template>
            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="primary" type="submit">
                    Save
                </NeButton>
            </div>

        </div>
    </form>
</template>
